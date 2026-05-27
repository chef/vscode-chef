import * as path from "path";
import { spawnSync } from "child_process";
import * as vscode from "vscode";

let diagnosticCollectionRubocop: vscode.DiagnosticCollection;
let rubocopPath: string;
let rubocopConfigFile: string;
let fileCount: number;

type RubocopLocation = {
	line: string;
	column: string;
	length: number;
};

type RubocopOffense = {
	location: RubocopLocation;
	message: string;
	severity: string;
};

type RubocopFile = {
	path: string;
	offenses: RubocopOffense[];
};

type RubocopOutput = {
	files: RubocopFile[];
};

/**
 * Extension entry point. Called once by VS Code when the extension activates.
 * Resolves the cookstyle binary path, wires up file-save and config-change
 * watchers, and registers the `chef.validateEntireWorkspace` command.
 */
export function activate(context: vscode.ExtensionContext): void {
	diagnosticCollectionRubocop = vscode.languages.createDiagnosticCollection("rubocop");
	context.subscriptions.push(diagnosticCollectionRubocop);

	if (vscode.workspace.getConfiguration("rubocop").path === "") {
		if (process.platform === "win32") {
			rubocopPath = "C:\\opscode\\chef-workstation\\bin\\cookstyle.bat";
		} else {
			rubocopPath = "/opt/chef-workstation/bin/cookstyle";
		}
	} else {
		rubocopPath = vscode.workspace.getConfiguration("rubocop").path;
		console.log("Using custom Rubocop path: " + rubocopPath);
	}

	if (vscode.workspace.getConfiguration("rubocop").configFile === "") {
		console.log("No explicit config file set for Rubocop.");
	} else {
		rubocopConfigFile = vscode.workspace.getConfiguration("rubocop").configFile;
		console.log("Using custom Rubocop config from: " + rubocopConfigFile);
	}

	if (vscode.workspace.getConfiguration("rubocop").enable) {
		updateRubyFileCountAndValidate(true);
		context.subscriptions.push(startLintingOnSaveWatcher());
		context.subscriptions.push(startLintingOnConfigurationChangeWatcher());
	}

	// Even if disabled, allow the user to manually validate the entire workspace.
	const command = "chef.validateEntireWorkspace";
	const commandHandler = () => {
		console.log("Called chef.validateEntireWorkspace command handler");
		validateEntireWorkspace();
  };
  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));

	context.subscriptions.push(
		vscode.commands.registerCommand("chef.createHabitatPlanDraft", createHabitatPlanDraft)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("chef.buildHabitatPackageLocal", buildHabitatPackageLocal)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("chef.buildHabitatPackageContainer", buildHabitatPackageContainer)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("chef.testHabitatPackageInstallInContainer", testHabitatPackageInstallInContainer)
	);
}

function getWorkspaceRootPath(): string | undefined {
	return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function toRelativeWorkspacePath(workspaceRoot: string, inputPath: string): string {
	if (path.isAbsolute(inputPath)) {
		const rel = path.relative(workspaceRoot, inputPath);
		return rel === "" ? "." : rel;
	}
	return inputPath;
}

function createTerminalAndRun(name: string, command: string, cwd?: string): void {
	const terminal = vscode.window.createTerminal({ name, cwd });
	terminal.show(true);
	terminal.sendText(command, true);
}

function getHabitatConfig(): vscode.WorkspaceConfiguration {
	return vscode.workspace.getConfiguration("habitat");
}

function buildContainerCommand(workspaceRoot: string, image: string, innerCommand: string): string {
	const runtime = getHabitatConfig().get<string>("containerRuntime", "docker");
	return `${runtime} run --rm -it -v "${workspaceRoot}":/workspace -w /workspace "${image}" sh -lc '${innerCommand}'`;
}

function getHabitatPlanTemplate(pkgName: string, pkgOrigin: string): string {
	return [
		`pkg_name=${pkgName}`,
		`pkg_origin=${pkgOrigin}`,
		"pkg_version=0.1.0",
		"pkg_maintainer=\"Your Name <you@example.com>\"",
		"pkg_license=('Apache-2.0')",
		"pkg_description=\"Describe your package\"",
		"pkg_upstream_url=https://example.com",
		"pkg_source=https://example.com/src/${pkg_name}-${pkg_version}.tar.gz",
		"pkg_filename=${pkg_name}-${pkg_version}.tar.gz",
		"pkg_shasum=REPLACE_WITH_SHA256",
		"pkg_deps=(core/glibc)",
		"pkg_build_deps=(core/coreutils core/make core/gcc)",
		"pkg_bin_dirs=(bin)",
		"",
		"do_build() {",
		"  make",
		"}",
		"",
		"do_install() {",
		"  make install PREFIX=\"$pkg_prefix\"",
		"}",
		""
	].join("\n");
}

function getHabitatPlanPs1Template(pkgName: string, pkgOrigin: string): string {
	return [
		`$pkg_name=\"${pkgName}\"`,
		`$pkg_origin=\"${pkgOrigin}\"`,
		"$pkg_version=\"0.1.0\"",
		"$pkg_maintainer=\"Your Name <you@example.com>\"",
		"$pkg_license=@(\"Apache-2.0\")",
		"$pkg_description=\"Describe your package\"",
		"$pkg_upstream_url=\"https://example.com\"",
		"$pkg_source=\"https://example.com/src/$pkg_name-$pkg_version.zip\"",
		"$pkg_shasum=\"REPLACE_WITH_SHA256\"",
		"$pkg_deps=@(\"core/powershell\")",
		"$pkg_build_deps=@()",
		"",
		"function Invoke-Build {",
		"  Write-Host \"Implement build steps\"",
		"}",
		"",
		"function Invoke-Install {",
		"  Write-Host \"Implement install steps\"",
		"}",
		""
	].join("\n");
}

async function createHabitatPlanDraft(): Promise<void> {
	const workspaceRoot = getWorkspaceRootPath();
	if (!workspaceRoot) {
		vscode.window.showErrorMessage("Open a workspace folder before creating a Habitat plan draft.");
		return;
	}

	const defaultOrigin = getHabitatConfig().get<string>("defaultOrigin", "myorigin");
	const defaultFile = process.platform === "win32" ? "habitat/plan.ps1" : "habitat/plan.sh";
	const requestedPath = await vscode.window.showInputBox({
		prompt: "Enter path for new Habitat plan file (relative to workspace)",
		value: defaultFile,
		ignoreFocusOut: true
	});
	if (!requestedPath) {
		return;
	}

	const fullPath = path.isAbsolute(requestedPath)
		? requestedPath
		: path.join(workspaceRoot, requestedPath);
	const fileUri = vscode.Uri.file(fullPath);

	try {
		await vscode.workspace.fs.stat(fileUri);
		const openExisting = await vscode.window.showWarningMessage(
			`File already exists: ${requestedPath}`,
			"Open Existing",
			"Cancel"
		);
		if (openExisting === "Open Existing") {
			const doc = await vscode.workspace.openTextDocument(fileUri);
			await vscode.window.showTextDocument(doc);
		}
		return;
	} catch {
		// File does not exist.
	}

	await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.dirname(fullPath)));

	const pkgName = path.basename(workspaceRoot).toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
	const template = fullPath.endsWith(".ps1")
		? getHabitatPlanPs1Template(pkgName, defaultOrigin)
		: getHabitatPlanTemplate(pkgName, defaultOrigin);

	await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(template));
	const doc = await vscode.workspace.openTextDocument(fileUri);
	await vscode.window.showTextDocument(doc);
	vscode.window.showInformationMessage("Created Habitat plan draft. Update source, deps, and checksums before building.");
}

async function buildHabitatPackageLocal(): Promise<void> {
	const workspaceRoot = getWorkspaceRootPath();
	if (!workspaceRoot) {
		vscode.window.showErrorMessage("Open a workspace folder before building a Habitat package.");
		return;
	}

	const defaultContext = getHabitatConfig().get<string>("defaultBuildContext", "habitat");
	const inputContext = await vscode.window.showInputBox({
		prompt: "Habitat build context path (relative to workspace root)",
		value: defaultContext,
		ignoreFocusOut: true
	});
	if (!inputContext) {
		return;
	}

	const relContext = toRelativeWorkspacePath(workspaceRoot, inputContext);
	createTerminalAndRun("Chef Habitat Build (Local)", `hab pkg build "${relContext}"`, workspaceRoot);
}

async function buildHabitatPackageContainer(): Promise<void> {
	const workspaceRoot = getWorkspaceRootPath();
	if (!workspaceRoot) {
		vscode.window.showErrorMessage("Open a workspace folder before containerized Habitat builds.");
		return;
	}

	const cfg = getHabitatConfig();
	const defaultContext = cfg.get<string>("defaultBuildContext", "habitat");
	const defaultImage = cfg.get<string>("containerImage", "ghcr.io/habitat-sh/habitat:latest");

	const inputContext = await vscode.window.showInputBox({
		prompt: "Habitat build context path (relative to workspace root)",
		value: defaultContext,
		ignoreFocusOut: true
	});
	if (!inputContext) {
		return;
	}

	const image = await vscode.window.showInputBox({
		prompt: "Container image (must include hab CLI)",
		value: defaultImage,
		ignoreFocusOut: true
	});
	if (!image) {
		return;
	}

	const relContext = toRelativeWorkspacePath(workspaceRoot, inputContext);
	const contextInContainer = relContext === "." ? "/workspace" : `/workspace/${relContext}`;
	const command = buildContainerCommand(workspaceRoot, image, `hab pkg build \"${contextInContainer}\"`);
	createTerminalAndRun("Chef Habitat Build (Container)", command, workspaceRoot);
}

function looksLikePath(input: string): boolean {
	return input.includes("/") || input.includes("\\") || input.endsWith(".hart") || input.includes("*");
}

async function testHabitatPackageInstallInContainer(): Promise<void> {
	const workspaceRoot = getWorkspaceRootPath();
	if (!workspaceRoot) {
		vscode.window.showErrorMessage("Open a workspace folder before container package install tests.");
		return;
	}

	const cfg = getHabitatConfig();
	const defaultImage = cfg.get<string>("containerImage", "ghcr.io/habitat-sh/habitat:latest");
	const image = await vscode.window.showInputBox({
		prompt: "Container image used to test package install",
		value: defaultImage,
		ignoreFocusOut: true
	});
	if (!image) {
		return;
	}

	const installTargetInput = await vscode.window.showInputBox({
		prompt: "Package identifier or .hart path (relative to workspace)",
		value: "results/*.hart",
		ignoreFocusOut: true
	});
	if (!installTargetInput) {
		return;
	}

	const pathLikeTarget = looksLikePath(installTargetInput);
	const installTarget = pathLikeTarget
		? `/workspace/${toRelativeWorkspacePath(workspaceRoot, installTargetInput)}`
		: installTargetInput;

	const postInstallCheck = pathLikeTarget
		? "echo 'Install command finished. Verify package identifier from output.'"
		: `hab pkg path ${installTarget}`;

	const command = buildContainerCommand(
		workspaceRoot,
		image,
		`hab pkg install ${installTarget} && ${postInstallCheck}`
	);
	createTerminalAndRun("Chef Habitat Install Test (Container)", command, workspaceRoot);
}

/**
 * Maps a Rubocop/Cookstyle severity string to the VS Code DiagnosticSeverity enum.
 * Unrecognised severities default to Warning so diagnostics are never silently dropped.
 */
function convertSeverity(severity: string): vscode.DiagnosticSeverity {
	switch (severity) {
		case "fatal":
		case "error":
			return vscode.DiagnosticSeverity.Error;
		case "warning":
			return vscode.DiagnosticSeverity.Warning;
		case "convention":
		case "refactor":
			return vscode.DiagnosticSeverity.Information;
		default:
			return vscode.DiagnosticSeverity.Warning;
	}
}

/**
 * Counts `.rb` files in the workspace (up to threshold+1) then calls validate().
 * The count is intentionally approximate — stopping early avoids scanning huge repos.
 * @param warn - When true, shows a warning message if the file count exceeds the threshold.
 */
function updateRubyFileCountAndValidate(warn: boolean = false): void {
	// Stop counting one past the threshold so we know whether we exceeded it.
	const stopAt = vscode.workspace.getConfiguration("rubocop").fileCountThreshold + 1
	fileCount = 0
	const uriCounter = () => {
		fileCount++;
	}
	const countAndValidate = (uri_array:Array<vscode.Uri>) => {
		uri_array.forEach(uriCounter)
		validate(warn);
	}
	vscode.workspace.findFiles("**/*.rb", undefined, stopAt, undefined)
	                .then(countAndValidate)
}

/**
 * Decides whether to lint the whole workspace or only open files based on
 * the `rubocop.fileCountThreshold` setting, then delegates accordingly.
 * @param warn - When true and file count exceeds the threshold, shows a one-time info banner.
 */
function validate(warn:boolean = false): void {
	console.log("Saw at least " + fileCount + " Ruby files in Workspace");
	if (fileCount < vscode.workspace.getConfiguration("rubocop").fileCountThreshold) {
		validateEntireWorkspace();
	} else {
		if (warn) {
			let msg: string = "There are a large number of Ruby files in your workspace. " +
				"The Chef Infra Extension will only lint open files rather than " +
				"the entire workspace to avoid becoming unresponsive."
			vscode.window.showWarningMessage(msg,"Ok");
		}
		validateOpenFiles();
	}
}

/** Collects the file paths of all currently visible Ruby editors and lints them. */
function validateOpenFiles(): void {
	let relPaths: Array<string> = [];
	vscode.window.visibleTextEditors.forEach((text_editor: vscode.TextEditor) => {
		if (text_editor.document.languageId == "ruby" && text_editor.document.fileName) {
			relPaths.unshift(text_editor.document.fileName);
		}
	})
	validatePaths(relPaths);
}

/**
 * Resolves the workspace root and passes it to validatePaths() so Cookstyle
 * scans the entire tree. Falls back to the first workspace folder when the
 * deprecated `rootPath` API returns undefined.
 */
function validateEntireWorkspace(): void {
	const rootPath = vscode.workspace.rootPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (!rootPath) { return; }
	validatePaths([rootPath]);
}

/**
 * Spawns cookstyle synchronously against the supplied paths, parses its JSON
 * output, and populates the DiagnosticCollection shown in the Problems panel.
 * Exit status < 2 means linting completed (offenses may exist); ≥ 2 means a
 * fatal error occurred and no diagnostics are produced.
 * @param paths - Absolute paths (files or directories) to lint.
 */
function validatePaths(paths: Array<string>): void {
	try {
		let rubocop;
		if (rubocopConfigFile) {
			rubocop = spawnSync(rubocopPath, ["--parallel", "--config", rubocopConfigFile, "-f", "j"].concat(paths), { cwd: vscode.workspace.rootPath });
		} else {
			rubocop = spawnSync(rubocopPath, ["--parallel", "-f", "j"].concat(paths), { cwd: vscode.workspace.rootPath });
		}
		const rubocopOutput: RubocopOutput = JSON.parse(String(rubocop.stdout));
		const rubocopStatus = rubocop.status ?? Number.MAX_SAFE_INTEGER;
		if (rubocopStatus < 2) {
			const rootPath = vscode.workspace.rootPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
			let arr: [vscode.Uri, vscode.Diagnostic[]][] = [];
			for (var r = 0; r < rubocopOutput.files.length; r++) {
				var rubocopFile = rubocopOutput.files[r];
				let uri: vscode.Uri = vscode.Uri.file((path.join(rootPath, rubocopFile.path)));
				var offenses = rubocopFile.offenses;
				let diagnostics: vscode.Diagnostic[] = [];
				for (var i = 0; i < offenses.length; i++) {
					let _line = parseInt(offenses[i].location.line, 10) - 1;
					let _start = parseInt(offenses[i].location.column, 10) - 1;
					let _end = _start + offenses[i].location.length;
					let diagRange = new vscode.Range(_line, _start, _line, _end);
					let diagMsg = `${offenses[i].message}`;
					let diagSeverity = convertSeverity(offenses[i].severity);
					let diagnostic = new vscode.Diagnostic(diagRange, diagMsg, diagSeverity);
					diagnostics.push(diagnostic);
				}
				arr.push([uri, diagnostics]);
			}
			diagnosticCollectionRubocop.clear();
			diagnosticCollectionRubocop.set(arr);
		} else {
			console.log("Rubocop executed but exited with status: " + rubocopStatus + rubocop.stdout);
		}
	} catch (err) {
		console.log(err);
	}
	return;
}

/** Returns a disposable that re-lints on every Ruby file save. */
function startLintingOnSaveWatcher(): vscode.Disposable {
	return vscode.workspace.onDidSaveTextDocument(document => {
		console.log("onDidSaveTextDocument event received (rubocop).");
		if (document.languageId !== "ruby") {
			return;
		}
		validate();
	});
}

/** Returns a disposable that re-lints whenever workspace settings change. */
function startLintingOnConfigurationChangeWatcher(): vscode.Disposable {
	return vscode.workspace.onDidChangeConfiguration(() => {
		console.log("Workspace configuration changed, validating workspace.");
		validate();
	});
}
