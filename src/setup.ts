import { Org } from "@salesforce/core";
import { window } from "vscode";
import CompanyInfo from "./setupItems/companyInfo";
import SetupItem from "./setupItem";
import Deployment from "./setupItems/deployment";
import SFObject from "./setupItems/sfobject";
import Profile from "./setupItems/profile";
import User from "./setupItems/user";

export default class Setup {
	public static async open(org: Org): Promise<void> {
		const items: SetupItem[] = [
			/*
			new CompanyInfo(),
			new Deployment(),
			*/
			new SFObject(org),
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