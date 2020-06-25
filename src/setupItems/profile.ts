import SetupItem from "../setupItem";
import { Org, User } from "@salesforce/core";
import { QuickPickItem, window } from "vscode";

type Id = string;

interface IProfile {
	Id: string,
	Name: string
}

export default class Profile extends SetupItem {
	label: string = 'Profile';
	name: string = 'Profile';

	options = {
		'Profile List': this.openProfileList,
		'Open Profile...': this.readProfile,
		'Edit Profile...': this.editProfile,
	};
	
	constructor(org: Org) {
		super(org);
	}

	async openProfileList(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/setup/EnhancedProfiles/home');
	}

	async readProfile(): Promise<void> {
		const profileId = (await this.selectProfile());
		if(profileId) {
			this.openProfile(profileId, false);
		}
	}
	
	async editProfile(): Promise<void> {
		const profileId = (await this.selectProfile());
		if(profileId) {
			this.openProfile(profileId, true);
		}
	}

	public async openProfile(profileId: string, inEditMode: boolean): Promise<void> {
		if(inEditMode) {
			this.openRelativeUrlInOrg(`/lightning/setup/EnhancedProfiles/page?address=/${profileId}/e`);
		} else {
			this.openRelativeUrlInOrg(`/lightning/setup/EnhancedProfiles/page?address=/${profileId}`);
		}
	}

	private async selectProfile(): Promise<Id> {
		const profiles = await this.getProfiles();
		const profilePicklistItems = this.getProfilePicklist(profiles);

		const selectedQuickPickItem = await window.showQuickPick(profilePicklistItems);
		
		const profile: IProfile = profiles.filter(profile => profile.Name === (selectedQuickPickItem || {}).label)[0] || {};

		return Promise.resolve(profile.Id);
	}

	private async getProfilePicklist(profiles: IProfile[]): Promise<QuickPickItem[]> {
		return profiles.map(profile => ({
			label: profile.Name,
		}));
	}

	private async getProfiles(): Promise<IProfile[]> {
		const soql = 'SELECT Id, Name FROM Profile ORDER BY Name ASC';
		const result = await this.connection.query(soql);

		return (result.records as IProfile[]);
	}
}