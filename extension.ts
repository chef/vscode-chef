import path = require('path');
import vscode = require('vscode');

let diagnosticCollection: vscode.DiagnosticCollection;
let config: vscode.WorkspaceConfiguration;
let rubocopPath: string;

export function activate(context: vscode.ExtensionContext): void {
	
	diagnosticCollection = vscode.languages.createDiagnosticCollection("ruby");
	context.subscriptions.push(diagnosticCollection);
	
	if(vscode.workspace.getConfiguration('rubocop')['path'] == "") {
		if (process.platform == "win32") {
			rubocopPath = "C:\\opscode\\chefdk\\bin\\rubocop.bat";
		} else {
			rubocopPath = "/opt/chefdk/bin/rubocop";
		}
	}
	else
	{		
		rubocopPath = vscode.workspace.getConfiguration('rubocop')['path'];
		console.log("custom rubocop path:" + rubocopPath);
	}
	
	if(vscode.workspace.getConfiguration('rubocop')['enable']) {
		validateWorkspace();
		context.subscriptions.push(startLintingOnSaveWatcher());
	}
}

function convertSeverity(severity: string): vscode.DiagnosticSeverity {
	switch (severity) {
		case "fatal":
			return vscode.DiagnosticSeverity.Error;
		case "error":
			return vscode.DiagnosticSeverity.Error;
		default:
			return vscode.DiagnosticSeverity.Warning;
	}
}

function fileUrl(str): string {
    let pathName = path.resolve(str).replace(/\\/g, "/");
    if (pathName[0] !== "/") {
        pathName = "/" + pathName;
    }
    return encodeURI("file://" + pathName);
};

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
		diagnosticCollection.clear();
		diagnosticCollection.set(arr);
	}
	catch(err) {
		console.log(err);
	}
	return;
}

function startLintingOnSaveWatcher() {
	return vscode.workspace.onDidSaveTextDocument(document => {
		
		console.log(document.uri);
		
		if(document.languageId != "ruby") {
			return;
		}
		
		validateWorkspace();	
	});
}
