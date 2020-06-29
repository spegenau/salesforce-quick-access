// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SFOrg from './sfOrg';
import { Org } from '@salesforce/core';
import Setup from './setup';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed



export async function activate(context: vscode.ExtensionContext) {	
	let openSFSetup = vscode.commands.registerCommand('salesforce-quick-access.openSFSetup', async () => {
		const org = await SFOrg.getDefaultOrg();
		if(org) {
			await Setup.open(org);
		}
	});
	
	let openSFSetupOtherOrg = vscode.commands.registerCommand('salesforce-quick-access.openSFSetupOtherOrg', async () => {
		const org = await SFOrg.chooseOrg();

		if(org) {
			await Setup.open(org);
		}
	});

	
	let openFile = vscode.commands.registerCommand('salesforce-quick-access.openFile', async (uri:vscode.Uri) => {
		const org = await SFOrg.getDefaultOrg();
		if(org) {
			await Setup.openFile(org, uri);
		}
	});

	// Delete all logs
	// Perform login as in an incognito browser window
	
	context.subscriptions.push(openSFSetup);
	context.subscriptions.push(openSFSetupOtherOrg);
	context.subscriptions.push(openFile);
}

// this method is called when your extension is deactivated
export function deactivate() {}
