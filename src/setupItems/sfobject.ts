import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { QuickPickItem, window, Uri } from "vscode";

interface ISObject {
	name: string,
	label: string
}

interface IField {
	name: string,
	label: string,
	type: string
}

type SObjectName = string;
type FieldApiName = string;

export default class SFObject extends SetupItem {
	label: string = 'Object';
	name: string = 'Object';
	
	options = {
		'Object Manager': this.openObjectManager,
		'Open Object...': this.openObject,
		'Open Field...': this.openField
	};

	opensFile = true;
	fileMatcher = /\.field-meta\.xml$/g;
	
	constructor(org: Org) {
		super(org);
	}

	async openObjectManager(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/setup/ObjectManager/home');
	}

	async openObject(): Promise<void> {
		const sObjectName = await this.selectObject();
		if(sObjectName) {
			this.openRelativeUrlInOrg(`/lightning/setup/ObjectManager/${sObjectName}/Details/view`);
		}
	}

	async openFile(uri: Uri): Promise<void> {
		// Do something
		window.showInformationMessage('HOOORAY');
		const pathParts = uri.path.split('/');
		const [sObjectType, fieldsFolder, filename] = pathParts.slice(-3);
		const fieldApiName = filename.replace('.field-meta.xml', '');
		const fieldApiNameOrId = await this.getFieldId(sObjectType,fieldApiName);
		
		this.openField(sObjectType, fieldApiNameOrId);
	}

	private async selectObject(): Promise<SObjectName> {
		const objects = await this.getObjects();
		const profilePicklistItems = this.getObjectsPicklist(objects);

		const selectedQuickPickItem = await window.showQuickPick(profilePicklistItems, { matchOnDescription: true });
		
		const obj: ISObject = objects.filter(obj => obj.name === (selectedQuickPickItem || {}).description)[0] || {};

		return Promise.resolve(obj.name);
	}

	private async getObjectsPicklist(objects: ISObject[]): Promise<QuickPickItem[]> {
		return objects.map(obj => ({
			label: obj.label,
			description: obj.name
		}));
	}

	async getObjects(): Promise<ISObject[]> {
		const describeGlobal = await this.connection.describeGlobal();

		return describeGlobal.sobjects.map(obj => {
			const {name, label } = obj;
			return {name, label};
		});
	}

	async openField(sObjectName: string|undefined = undefined, fieldApiName: string|undefined = undefined): Promise<void> {
		const sObjectType: string = (sObjectName) ? sObjectName : await this.selectObject();
		if(sObjectType) {
			const field = (fieldApiName) ? fieldApiName : await this.selectField(sObjectType);
			if(field) {
				this.openRelativeUrlInOrg(`/lightning/setup/ObjectManager/${sObjectType}/FieldsAndRelationships/${field}/view`);
			}
		}
	}

	private async selectField(sObjectName: SObjectName): Promise<string> {
		const fields = await this.getFields(sObjectName);
		const fieldsPicklistItems = this.getFieldsPicklist(fields);

		const selectedQuickPickItem = await window.showQuickPick(fieldsPicklistItems, { matchOnDescription: true, matchOnDetail: true });
		
		const field: IField = fields.filter(field => field.name === (selectedQuickPickItem || {}).description)[0] || {};

		return await this.getFieldApiNameOrId(sObjectName, field.name);
	}

	private async getFieldApiNameOrId(sObjectName: SObjectName, fieldApiName: string): Promise<string> {
		if(fieldApiName.endsWith('__c')) {
			return Promise.resolve(await this.getFieldId(sObjectName, fieldApiName));
		} else {
			return Promise.resolve(fieldApiName);
		}
	}

	private async getFieldsPicklist(fields: IField[]): Promise<QuickPickItem[]> {
		return fields.map(fields => ({
			label: fields.label,
			description: fields.name,
			detail: fields.type
		}));
	}

	async getFields(sObjectName: string): Promise<IField[]> {	
		const describe = await this.connection.describe(sObjectName);
		console.log(describe);

		const fields: IField[] = describe.fields.map(f => {
			const { name, label, type} = f;
			return {name, label, type};
		});
		return fields;
	}

	async getFieldId(sObjectName: string, fieldApiName: string): Promise<string> {
		const {tooling} = this.connection;
		const soqlObjId = `SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName = '${sObjectName}' LIMIT 1`;
		const entities = (await tooling.query(soqlObjId)).records;
		const objId: string = (entities[0] as any).DurableId;

		const fieldQueryId = `SELECT Id FROM CustomField WHERE TableEnumOrId = '${objId}' AND DeveloperName = '${fieldApiName.replace('__c', '')}'`;
		console.log("FieldQueryId: " + fieldQueryId);

		const records = (await tooling.query(fieldQueryId)).records;

		const fieldId: string = (records[0] as any).Id;

		return fieldId;
	}	
}