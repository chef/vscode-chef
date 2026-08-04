// tslint:disable:typedef

import fs = require("fs");
import path = require("path");
import vscode = require("vscode");

let diagnosticCollectionRubocop: vscode.DiagnosticCollection;
let config: vscode.WorkspaceConfiguration;
let rubocopPath: string;
let rubocopConfigFile: string;
let cookbookPaths: Array<string> = [];
let fileCount: number;
let cookstyleVersionChecked: boolean = false;
const MINIMUM_COOKSTYLE_VERSION = "8.6.10";

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
		checkCookstyleVersion();
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

function checkCookstyleVersion(): void {
	if (cookstyleVersionChecked) {
		return;
	}
	
	try {
		let spawn = require("child_process").spawnSync;
		let result = spawn(rubocopPath, ["--version"], { encoding: "utf-8" });
		
		if (result.status === 0 && result.stdout) {
			let versionMatch = result.stdout.match(/(\d+\.\d+\.\d+)/);
			if (versionMatch) {
				let version = versionMatch[1];
				console.log(`Detected Cookstyle version: ${version}`);
				
				// Parse version components
				let parts = version.split('.').map(Number);
				let minParts = MINIMUM_COOKSTYLE_VERSION.split('.').map(Number);
				
				// Check if version is below minimum
				let isOldVersion = false;
				for (let i = 0; i < 3; i++) {
					if (parts[i] < minParts[i]) {
						isOldVersion = true;
						break;
					} else if (parts[i] > minParts[i]) {
						break;
					}
				}
				
				if (isOldVersion) {
					vscode.window.showWarningMessage(
						`Chef extension detected Cookstyle ${version}. Version ${MINIMUM_COOKSTYLE_VERSION}+ is required. Please upgrade to the latest Chef Workstation for best results.`,
						"Upgrade Instructions"
					).then(selection => {
						if (selection === "Upgrade Instructions") {
							vscode.env.openExternal(vscode.Uri.parse("https://docs.chef.io/workstation/install/"));
						}
					});
				} else {
					console.log(`Cookstyle version ${version} is compatible (minimum: ${MINIMUM_COOKSTYLE_VERSION})`);
				}
			}
		}
		cookstyleVersionChecked = true;
	} catch (err) {
		console.log("Could not check Cookstyle version:", err);
		vscode.window.showWarningMessage(
			`Chef extension could not detect Cookstyle. Install the latest Chef Workstation for linting features.`,
			"Download Chef Workstation"
		).then(selection => {
			if (selection === "Download Chef Workstation") {
				vscode.env.openExternal(vscode.Uri.parse("https://downloads.chef.io/chef-workstation"));
			}
		});
	}
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
	vscode.workspace.findFiles("**/*.rb", null, stopAt, null)
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
	validatePaths([vscode.workspace.rootPath])
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
			let arr = [];
			for (var r = 0; r < rubocopOutput.files.length; r++) {
				var rubocopFile = rubocopOutput.files[r];
				let uri: vscode.Uri = vscode.Uri.file((path.join(vscode.workspace.rootPath, rubocopFile.path)));
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
