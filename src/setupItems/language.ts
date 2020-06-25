import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class Language extends SetupItem {
    label: string = "Users language settings";
    name: string = "Users language settings";

    options = {
        "Open users language settings": this.openCompanyInfo,
    };

    constructor(org: Org) {
        super(org);
    }

    async openCompanyInfo(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/settings/personal/LanguageAndTimeZone/home');
	}
}
