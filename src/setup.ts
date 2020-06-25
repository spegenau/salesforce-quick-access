import { Org } from "@salesforce/core";
import { window } from "vscode";
import CompanyInfo from "./setupItems/companyInfo";
import SetupItem from "./setupItem";
import Deployment from "./setupItems/deployment";
import SFObject from "./setupItems/sfobject";
import Profile from "./setupItems/profile";
import User from "./setupItems/user";
import Language from "./setupItems/language";
import PermissionSet from "./setupItems/permissionset";
import CustomMetadata from "./setupItems/custommetadata";

export default class Setup {
	public static async open(org: Org): Promise<void> {
		const items: SetupItem[] = [
			new CompanyInfo(org),
			new CustomMetadata(org),
			new Deployment(org),
			new Language(org),
			new SFObject(org),
			new PermissionSet(org),
			new Profile(org),
			new User(org)
		];
		
		const selectedOption = await window.showQuickPick(items.map(i => i.getQuickPickItem()), {});
		if(selectedOption) {
			const item = items.filter(i => i.label === selectedOption?.label)[0];
			await item.open();
			return Promise.resolve();
		}
	}
}