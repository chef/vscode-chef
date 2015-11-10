import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Chef Extensions for Visual Studio Code loaded.');
		 
	// var disposable = vscode.commands.registerCommand('extension.rubocop', () => {
	// 	vscode.window.showWarningMessage('Running command Rubocop');
	// });
	// context.subscriptions.push(disposable);
}