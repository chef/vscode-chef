import fs = require('fs');
import path = require("path");
import vscode = require("vscode");

let diagnosticCollectionRubocop: vscode.DiagnosticCollection;
let diagnosticCollectionFoodcritic: vscode.DiagnosticCollection;
let config: vscode.WorkspaceConfiguration;
let rubocopPath: string;
let foodcriticPath: string;
let statusBarItem: vscode.StatusBarItem;
let cookbookPaths: Array<string>;

export function activate(context: vscode.ExtensionContext): void {
	diagnosticCollectionRubocop = vscode.languages.createDiagnosticCollection("rubocop");
	diagnosticCollectionFoodcritic = vscode.languages.createDiagnosticCollection("foodcritic");
	context.subscriptions.push(diagnosticCollectionRubocop);
	context.subscriptions.push(diagnosticCollectionFoodcritic);
  recalculateValidCookbookPaths();	

	if (vscode.workspace.getConfiguration("rubocop")["path"] == "") {
		if (process.platform == "win32") {
			rubocopPath = "C:\\opscode\\chefdk\\bin\\rubocop.bat";
		} else {
			rubocopPath = "/opt/chefdk/bin/rubocop";
		}
	}
	else {
		rubocopPath = vscode.workspace.getConfiguration("rubocop")["path"];
		console.log("Using custom Rubocop path:" + rubocopPath);
	}
	if (vscode.workspace.getConfiguration("rubocop")["enable"]) {
		validateWorkspace();
		context.subscriptions.push(startLintingOnSaveWatcher());
		context.subscriptions.push(startLintingOnConfigurationChangeWatcher());
	}
	
	if (vscode.workspace.getConfiguration("foodcritic")["path"] == "") {
		if (process.platform == "win32") {
			foodcriticPath = "C:\\opscode\\chefdk\\bin\\foodcritic.bat";
		} else {
			foodcriticPath = "/opt/chefdk/bin/foodcritic";
		}
	}
	else {
		foodcriticPath = vscode.workspace.getConfiguration("foodcritic")["path"];
		console.log("Using custom Foodcritic path:" + foodcriticPath);
	}
	if (vscode.workspace.getConfiguration("foodcritic")["enable"]) {
		validateCookbooks();
		context.subscriptions.push(startCookbookAnalysisOnSaveWatcher());
		context.subscriptions.push(startCookbookAnalysisOnConfigurationChangeWatcher());
	}
}

function recalculateValidCookbookPaths(): void {
	cookbookPaths = [];
  let cookbookNames = getCookbookPaths(path.join(vscode.workspace.rootPath, "cookbooks"));
	for (let cookbookName of cookbookNames) {
		cookbookPaths.push("cookbooks" + "/" + cookbookName)
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
		let rubocop = spawn(rubocopPath, ["-f", "j", vscode.workspace.rootPath], { cwd: vscode.workspace.rootPath });
		let rubocopOutput = JSON.parse(rubocop.stdout);
		let arr = [];
		for (var r = 0; r < rubocopOutput.files.length; r++) {
			var rubocopFile = rubocopOutput.files[r];
			let uri: vscode.Uri = vscode.Uri.file((path.join(vscode.workspace.rootPath, rubocopFile.path)));
			var offenses = rubocopFile.offenses;
			let diagnostics: vscode.Diagnostic[] = [];
			for (var i = 0; i < offenses.length; i++) {
				let _line = parseInt(offenses[i].location.line) - 1;
				let _start = parseInt(offenses[i].location.column) - 1;
				let _end = parseInt(_start + offenses[i].location.length);
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
	}
	catch (err) {
		console.log(err);
	}
	return;
}

function startLintingOnSaveWatcher() {
	return vscode.workspace.onDidSaveTextDocument(document => {
		if (document.languageId != "ruby") {
			return;
		}
		validateWorkspace();
	});
}

function startLintingOnConfigurationChangeWatcher() {
	return vscode.workspace.onDidChangeConfiguration(params => {
		validateWorkspace();
	});
}

function validateCookbooks(): void {
	try {
		let spawn = require("child_process").spawnSync;
		let foodcritic = spawn(foodcriticPath, cookbookPaths, { cwd: vscode.workspace.rootPath, encoding: 'utf8' });
		let foodcriticOutput = foodcritic.stdout.trim().split('\n');
		let arr = [];
		for (var r = 0; r < foodcriticOutput.length; r++) {
			let diagnostics: vscode.Diagnostic[] = [];
			let fcId = foodcriticOutput[r].split(":")[0].trim();
			let fcDescription = foodcriticOutput[r].split(":")[1].trim();
			let fcPath = foodcriticOutput[r].split(":")[2].trim();
			let lineNumber = parseInt(foodcriticOutput[r].split(":")[3].trim()) - 1;
			let uri: vscode.Uri = vscode.Uri.file((path.join(vscode.workspace.rootPath, fcPath)));
			let diagRange = new vscode.Range(lineNumber, 0, lineNumber, 0);
			let diagnostic = new vscode.Diagnostic(diagRange, fcId + ": " + fcDescription, vscode.DiagnosticSeverity.Warning)
			diagnostics.push(diagnostic);
			arr.push([uri, diagnostics]);
		}
		diagnosticCollectionFoodcritic.clear();
		diagnosticCollectionFoodcritic.set(arr);
	}
	catch (err) {
		console.log(err);
	}
	return;
}

function startCookbookAnalysisOnSaveWatcher() {
	return vscode.workspace.onDidSaveTextDocument(document => {
		if (document.languageId != "ruby") {
			return;
		}
		validateCookbooks();
	});
}

function startCookbookAnalysisOnConfigurationChangeWatcher() {
	recalculateValidCookbookPaths();
	return vscode.workspace.onDidChangeConfiguration(params => {
		validateCookbooks();
	});
}

function getCookbookPaths(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}