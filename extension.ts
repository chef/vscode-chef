// tslint:disable:typedef

import fs = require("fs");
import path = require("path");
import vscode = require("vscode");

let diagnosticCollectionRubocop: vscode.DiagnosticCollection;
let config: vscode.WorkspaceConfiguration;
let rubocopPath: string;
let rubocopConfigFile: string;
let cookbookPaths: Array<string> = [];

export function activate(context: vscode.ExtensionContext): void {
	diagnosticCollectionRubocop = vscode.languages.createDiagnosticCollection("rubocop");
	context.subscriptions.push(diagnosticCollectionRubocop);

	if (vscode.workspace.getConfiguration("rubocop").path === "") {
		if (process.platform === "win32") {
			rubocopPath = "C:\\opscode\\chef-workstation\\embedded\\bin\\cookstyle.bat";
		} else {
			rubocopPath = "/opt/chefdk/embedded/bin/cookstyle";
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
		validateWorkspace();
		context.subscriptions.push(startLintingOnSaveWatcher());
		context.subscriptions.push(startLintingOnConfigurationChangeWatcher());
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

function validateWorkspace(): void {
	try {
		let spawn = require("child_process").spawnSync;
		let rubocop: any;
		if (rubocopConfigFile) {
			rubocop = spawn(rubocopPath, ["--config", rubocopConfigFile, "-f", "j", vscode.workspace.rootPath], { cwd: vscode.workspace.rootPath });
		} else {
			rubocop = spawn(rubocopPath, ["-f", "j", vscode.workspace.rootPath], { cwd: vscode.workspace.rootPath });
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
					let diagMsg = `${offenses[i].message} (${offenses[i].cop_name})`;
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
		validateWorkspace();
	});
}

function startLintingOnConfigurationChangeWatcher():any {
	return vscode.workspace.onDidChangeConfiguration(params => {
		console.log("Workspace configuration changed, validating workspace.");
		validateWorkspace();
	});
}
