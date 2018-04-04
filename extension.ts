// tslint:disable:typedef

import fs = require("fs");
import path = require("path");
import vscode = require("vscode");

let diagnosticCollectionRubocop: vscode.DiagnosticCollection;
let diagnosticCollectionFoodcritic: vscode.DiagnosticCollection;
let config: vscode.WorkspaceConfiguration;
let rubocopPath: string;
let rubocopConfigFile: string;
let foodcriticPath: string;
let cookbookPaths: Array<string> = [];

export function activate(context: vscode.ExtensionContext): void {
	diagnosticCollectionRubocop = vscode.languages.createDiagnosticCollection("rubocop");
	diagnosticCollectionFoodcritic = vscode.languages.createDiagnosticCollection("foodcritic");
	context.subscriptions.push(diagnosticCollectionRubocop);
	context.subscriptions.push(diagnosticCollectionFoodcritic);

	if (vscode.workspace.getConfiguration("rubocop").path === "") {
		if (process.platform === "win32") {
			rubocopPath = "C:\\opscode\\chefdk\\embedded\\bin\\cookstyle.bat";
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

	if (vscode.workspace.getConfiguration("foodcritic").path === "") {
		if (process.platform === "win32") {
			foodcriticPath = "C:\\opscode\\chefdk\\embedded\\bin\\foodcritic.bat";
		} else {
			foodcriticPath = "/opt/chefdk/embedded/bin/foodcritic";
		}
	} else {
		foodcriticPath = vscode.workspace.getConfiguration("foodcritic").path;
		console.log("Using custom Foodcritic path: " + foodcriticPath);
	}

	if (vscode.workspace.getConfiguration("foodcritic").enable) {
		recalculateValidCookbookPaths();
		context.subscriptions.push(startCookbookAnalysisOnSaveWatcher());
		context.subscriptions.push(startCookbookAnalysisOnConfigurationChangeWatcher());
	}
}

function recalculateValidCookbookPaths(): void {
	let cookbookPathToAdd: string;
	vscode.workspace.findFiles("**/metadata.rb", "", Infinity).then(files => {
		cookbookPaths = [];
		files.forEach(file => {
			if (path.dirname(file.fsPath) === vscode.workspace.rootPath) {
				cookbookPathToAdd = ".";
			} else {
				cookbookPathToAdd = path.dirname(file.fsPath).replace(vscode.workspace.rootPath + path.sep, "").replace(path.sep, "/");
			}
			cookbookPaths.push(cookbookPathToAdd);
			console.log(cookbookPathToAdd);
		});
		validateCookbooks();
	});
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

function validateCookbooks(): void {
	console.log("in validate cookbooks");
	if (cookbookPaths.length === 0) { return; }
	try {
		let spawn = require("child_process").spawnSync;
		cookbookPaths[cookbookPaths.length] = "--no-progress";
		let foodcritic = spawn(foodcriticPath, cookbookPaths, { cwd: vscode.workspace.rootPath, encoding: "utf8" });
		if (foodcritic.status > 0) {
			let foodcriticOutput = foodcritic.stdout.trim().split("\n");
			let arr = [];
			for (var r = 0; r < foodcriticOutput.length; r++) {
				if (foodcriticOutput[r] !== "") {
					let diagnostics: vscode.Diagnostic[] = [];
					let fcId = foodcriticOutput[r].split(":")[0].trim();
					let fcDescription = foodcriticOutput[r].split(":")[1].trim();
					let fcPath = foodcriticOutput[r].split(":")[2].trim();
					let lineNumber = parseInt(foodcriticOutput[r].split(":")[3].trim(), 10) - 1;
					let uri: vscode.Uri = vscode.Uri.file((path.join(vscode.workspace.rootPath, fcPath)));
					let diagRange = new vscode.Range(lineNumber, 0, lineNumber, 0);
					let diagnostic = new vscode.Diagnostic(diagRange, fcId + ": " + fcDescription, vscode.DiagnosticSeverity.Warning);
					let found: boolean = false;
					diagnostics.push(diagnostic);
					for (var l = 0; l < arr.length; l++) {
						if (arr[l][0].path === uri.path) {
							arr[l][1].push(diagnostic);
							found = true;
						}
					}
					if (!found) {
						arr.push([uri, diagnostics]);
					}
				}
			}

			diagnosticCollectionFoodcritic.clear();
			diagnosticCollectionFoodcritic.set(arr);
		} else {
			console.log("Foodcritic executed but exited with status: " + foodcritic.status + foodcritic.stdout);
			diagnosticCollectionFoodcritic.clear();
		}
	} catch (err) {
		console.log(err);
	}
	return;
}

function startCookbookAnalysisOnSaveWatcher():any {
	return vscode.workspace.onDidSaveTextDocument(document => {
		console.log("onDidSaveTextDocument event received (foodcritic).");
		if (document.languageId !== "ruby") {
			return;
		}
		validateCookbooks();
	});
}

function startCookbookAnalysisOnConfigurationChangeWatcher():any {
	return vscode.workspace.onDidChangeConfiguration(params => {
		console.log("Workspace configuration changed, recalculating valid cookbooks.");
		recalculateValidCookbookPaths();
	});
}
