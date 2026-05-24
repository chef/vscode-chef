import fs = require("fs");
import path = require("path");
import vscode = require("vscode");
import { severityToNumber } from "./src/utils";

let diagnosticCollectionRubocop: vscode.DiagnosticCollection;
let config: vscode.WorkspaceConfiguration;
let rubocopPath: string;
let rubocopConfigFile: string;
let cookbookPaths: Array<string> = [];
let fileCount: number;

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
	let stopAt = vscode.workspace.getConfiguration("rubocop").fileCountThreshold + 1
	fileCount = 0
	let uriCounter = (u:vscode.Uri) => {
		fileCount++;
	}
	let countAndValidate = (uri_array:Array<vscode.Uri>) => {
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
		let spawn = require("child_process").spawnSync;
		let rubocop: any;
		if (rubocopConfigFile) {
			rubocop = spawn(rubocopPath, ["--parallel", "--config", rubocopConfigFile, "-f", "j"].concat(paths), { cwd: vscode.workspace.rootPath });
		} else {
			rubocop = spawn(rubocopPath, ["--parallel", "-f", "j"].concat(paths), { cwd: vscode.workspace.rootPath });
		}
		let rubocopOutput = JSON.parse(rubocop.stdout);
		if (rubocop.status < 2) {
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
					let _end = parseInt(_start + offenses[i].location.length, 10);
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
			console.log("Rubocop executed but exited with status: " + rubocop.status + rubocop.stdout);
		}
	} catch (err) {
		console.log(err);
	}
	return;
}

/** Returns a disposable that re-lints on every Ruby file save. */
function startLintingOnSaveWatcher():any {
	return vscode.workspace.onDidSaveTextDocument(document => {
		console.log("onDidSaveTextDocument event received (rubocop).");
		if (document.languageId !== "ruby") {
			return;
		}
		validate();
	});
}

/** Returns a disposable that re-lints whenever workspace settings change. */
function startLintingOnConfigurationChangeWatcher():any {
	return vscode.workspace.onDidChangeConfiguration(params => {
		console.log("Workspace configuration changed, validating workspace.");
		validate();
	});
}

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
}

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

function updateRubyFileCountAndValidate(warn: boolean = false): void {
	// OK for this to be approximate
	let stopAt = vscode.workspace.getConfiguration("rubocop").fileCountThreshold + 1
	fileCount = 0
	let uriCounter = (u:vscode.Uri) => {
		fileCount++;
	}
	let countAndValidate = (uri_array:Array<vscode.Uri>) => {
		uri_array.forEach(uriCounter)
		validate(warn);
	}
	vscode.workspace.findFiles("**/*.rb", undefined, stopAt, undefined)
	                .then(countAndValidate)
}

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

function validateOpenFiles(): void {
	let relPaths: Array<string> = [];
	vscode.window.visibleTextEditors.forEach((text_editor: vscode.TextEditor) => {
		if (text_editor.document.languageId == "ruby" && text_editor.document.fileName) {
			relPaths.unshift(text_editor.document.fileName);
		}
	})
	validatePaths(relPaths);
}

function validateEntireWorkspace(): void {
	const rootPath = vscode.workspace.rootPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (!rootPath) { return; }
	validatePaths([rootPath]);
}

function validatePaths(paths: Array<string>): void {
	try {
		let spawn = require("child_process").spawnSync;
		let rubocop: any;
		if (rubocopConfigFile) {
			rubocop = spawn(rubocopPath, ["--parallel", "--config", rubocopConfigFile, "-f", "j"].concat(paths), { cwd: vscode.workspace.rootPath });
		} else {
			rubocop = spawn(rubocopPath, ["--parallel", "-f", "j"].concat(paths), { cwd: vscode.workspace.rootPath });
		}
		let rubocopOutput = JSON.parse(rubocop.stdout);
		if (rubocop.status < 2) {
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
					let _end = parseInt(_start + offenses[i].location.length, 10);
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
			console.log("Rubocop executed but exited with status: " + rubocop.status + rubocop.stdout);
		}
	} catch (err) {
		console.log(err);
	}
	return;
}

function startLintingOnSaveWatcher():any {
	return vscode.workspace.onDidSaveTextDocument(document => {
		console.log("onDidSaveTextDocument event received (rubocop).");
		if (document.languageId !== "ruby") {
			return;
		}
		validate();
	});
}

function startLintingOnConfigurationChangeWatcher():any {
	return vscode.workspace.onDidChangeConfiguration(params => {
		console.log("Workspace configuration changed, validating workspace.");
		validate();
	});
}
