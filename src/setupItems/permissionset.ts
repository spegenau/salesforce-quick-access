import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { QuickPickItem, window } from "vscode";

type Id = string;

interface IPermissionSet {
	Id: string,
	Name: string,
	Label: string,
	Description: string
}

export default class PermissionSet extends SetupItem {
	label: string = 'PermissionSet';
	name: string = 'PermissionSet';

	options = {
		'PermissionSet List': this.openPermissionSetList,
		'Open PermissionSet...': this.openPermissionSet,
		'View assignments...': this.viewAssignments,
	};
	
	constructor(org: Org) {
		super(org);
	}

	async openPermissionSetList(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/setup/PermSets/home');
	}

	async openPermissionSet(): Promise<void> {
		const permSetId = (await this.selectPermissionSet());
		if(permSetId) {
			this.openRelativeUrlInOrg(`/lightning/setup/PermSets/page?address=/${permSetId}`);
		}
	}
	
	async viewAssignments(): Promise<void> {
		const permSetId = (await this.selectPermissionSet());
		if(permSetId) {
			this.openRelativeUrlInOrg(`/lightning/setup/PermSets/page?address=/005?id=${permSetId}&isUserEntityOverride=1&SetupNode=PermSets&clc=1`);
		}
	}

	private async selectPermissionSet(): Promise<Id> {
		const permSets = await this.getPermissionSets();
		const permSetPicklistItems = this.getPermissionSetPicklist(permSets);

		const selectedQuickPickItem = await window.showQuickPick(permSetPicklistItems);
		
		const permSet: IPermissionSet = permSets.filter(permSet => permSet.Name === (selectedQuickPickItem || {}).description)[0] || {};

		return Promise.resolve(permSet.Id);
	}

	private async getPermissionSetPicklist(permSets: IPermissionSet[]): Promise<QuickPickItem[]> {
		return permSets.map(permSet => ({
			label: permSet.Label,
			description: permSet.Name,
			detail: permSet.Description
		}));
	}

	private async getPermissionSets(): Promise<IPermissionSet[]> {
		const soql = 'SELECT Id, Name, Label, Description FROM PermissionSet WHERE IsOwnedByProfile = false ORDER BY Label ASC';
		const result = await this.connection.query(soql);

		return (result.records as IPermissionSet[]);
	}
}