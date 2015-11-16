import * as path from 'path';
import { workspace, Disposable, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, RequestType } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
	let serverModule = path.join(__dirname, 'rubocop-worker.js');
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
	let serverOptions: ServerOptions = {
		run: { module: serverModule },
		debug: { module: serverModule, options: debugOptions}
	};
	let clientOptions: LanguageClientOptions = {
		documentSelector: ['ruby'],
		synchronize: {
			configurationSection: 'rubocop',
			fileEvents: workspace.createFileSystemWatcher("**/*.rb"),
		}
		
	}

	let client = new LanguageClient('rubocop', serverOptions, clientOptions);
	context.subscriptions.push(new SettingMonitor(client, 'rubocop.enable').start());
}

