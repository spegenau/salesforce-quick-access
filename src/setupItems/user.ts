import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { window, QuickPickItem } from "vscode";

interface IUser {
	Id: string,
	Name: string,
	Username: string,
	Email: string
}

type Id = string;

export default class User extends SetupItem {
	label: string = 'User';
	name: string = 'User';

	options = {
		'User List': this.openUserList,
		'Open active User...': this.openUser.bind(this, true),
		'Edit active User...': this.editUser.bind(this, true),
		'Open User...': this.openUser,
		'Edit User...': this.editUser
	};

	constructor(org: Org) {
		super(org);
	}

	async openUserList(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/setup/ManageUsers/home');
	}

	async openUser(activeOnly: boolean = false): Promise<void> {
		const userId = (await this.selectUser(activeOnly));
		if(userId) {
			this.openRelativeUrlInOrg(`/lightning/setup/ManageUsers/page?address=/${userId}?noredirect=1&isUserEntityOverride=1`);
		}
	}

	async editUser(activeOnly: boolean = false): Promise<void> {
		const userId = (await this.selectUser(activeOnly));
		if(userId) {
			this.openRelativeUrlInOrg(`/lightning/setup/ManageUsers/page?address=/${userId}/e?isUserEntityOverride=1&retURL/005?isUserEntityOverride=1&noredirect=1`);
		}
	}

	private async selectUser(activeOnly: boolean): Promise<Id> {
		const users = await this.getUsers(activeOnly);
		const userPicklistItems = this.getUserPicklist(users, activeOnly);

		const selectedQuickPickItem = await window.showQuickPick(userPicklistItems, { matchOnDescription: true, matchOnDetail: true});
		
		const user: IUser = users.filter(u => u.Username === (selectedQuickPickItem || {}).description)[0] || {};

		return Promise.resolve(user.Id);
	}

	private async getUserPicklist(users: IUser[], activeOnly: boolean): Promise<QuickPickItem[]> {
		return users.map(u => ({
			label: u.Name,
			description: u.Username,
			detail: u.Email
		}));
	}

	private async getUsers(activeOnly: boolean): Promise<IUser[]> {
		const soql = 'SELECT Id, Name, Username, Email FROM User ' + (activeOnly ? 'WHERE IsActive = true' : '') + ' ORDER BY Lastname ASC';
		const result = await this.connection.query(soql);

		const users: IUser[] = result.records
			.map(rec => {
				const {Id, Name, Username, Email} = (rec as IUser);
				return {Id, Name, Username, Email};
			});
		return users;
	}
}