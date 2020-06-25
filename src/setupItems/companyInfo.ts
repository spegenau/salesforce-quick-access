import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class CompanyInfo extends SetupItem {
    label: string = "CompanyInfo";
    name: string = "CompanyInfo";

    options = {
        "Open Company Info": this.openCompanyInfo,
    };

    constructor(org: Org) {
        super(org);
    }

    async openCompanyInfo(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/setup/CompanyProfileInfo/home');
	}
}
