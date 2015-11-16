import {
	createConnection, IConnection,
	ResponseError, RequestType, IRequestHandler, NotificationType, INotificationHandler,
	InitializeResult, InitializeError,
	Diagnostic, DiagnosticSeverity, Position, Files,
	TextDocuments, ITextDocument, TextDocumentSyncKind,
	ErrorMessageTracker
} from 'vscode-languageserver';

let path = require('path');

interface Settings {
	rubocop: {
		enable: boolean;
		path: string;
	}
}

function fileUrl(str): string {
    let pathName = path.resolve(str).replace(/\\/g, '/');
    if (pathName[0] !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
};

function convertSeverity(severity: string): DiagnosticSeverity {
	switch (severity) {
		case "fatal":
			return DiagnosticSeverity.Error;
		case "error":
			return DiagnosticSeverity.Error;
		case "warning":
			return DiagnosticSeverity.Warning;
		case "convention":
			return DiagnosticSeverity.Warning;
		case "refactor":
			return DiagnosticSeverity.Warning;
		default:
			return DiagnosticSeverity.Warning;
	}
}

let settings: Settings = null;
let connection: IConnection = createConnection(process.stdin, process.stdout);
let workspaceRoot: string;

connection.onInitialize((params): InitializeResult => {
    workspaceRoot = params.rootPath;
	return { capabilities: { textDocumentSync: TextDocumentSyncKind.Full }};
});

function validateWorkspace(): void {
	try {
		let spawn = require('child_process').spawnSync;
		let rubocop = spawn(settings.rubocop.path, ['-f', 'j', workspaceRoot]);
		let rubocopOutput = JSON.parse(rubocop.stdout)

		for(var r = 0; r < rubocopOutput.files.length; r++) {
			var rubocopFile = rubocopOutput.files[r];
			let uri: string = fileUrl(path.join(workspaceRoot,rubocopFile.path));
			var offenses = rubocopFile.offenses;
			let diagnostics: Diagnostic[] = [];
				
			for (var i = 0; i < offenses.length; i++) {
				let line = parseInt(offenses[i].location.line) - 1
				let start = parseInt(offenses[i].location.column) - 1
				let end = parseInt(start + offenses[i].location.length)
			
				diagnostics.push({
					range: {
						start: { line: line, character: start },
						end: { line: line, character: end }
					},
					severity: convertSeverity(offenses[i].severity),
					message: `${offenses[i].message} (${offenses[i].cop_name})`	
				});
			}
			connection.sendDiagnostics({ uri, diagnostics })
		}
		return;	
	} 
	catch (err) {
		connection.console.log(err);
	}
}

connection.onDidChangeConfiguration((params) => {
	let potentialSettings: Settings = params.settings;
	if(potentialSettings.rubocop.path == "") {
		if(process.platform == 'win32') {
			// we're on Windows
			potentialSettings.rubocop.path = 'C:\\opscode\\chefdk\\bin\\rubocop.bat';
		} else {
			// we're on OS X or Linux
			potentialSettings.rubocop.path = '/opt/chefdk/bin/rubocop';
		}
	}
	settings = potentialSettings;
});


connection.onDidOpenTextDocument((openedDocument) => {
	validateWorkspace();
});

connection.onDidChangeWatchedFiles((params) => {
	validateWorkspace();
});

connection.listen();