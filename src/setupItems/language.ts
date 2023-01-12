import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { window } from "vscode";

export default class Language extends SetupItem {
    label: string = "Users language settings";
    name: string = "Users language settings";

    options = {
        "Open users language settings": this.openCompanyInfo,
		'Set user language to English': this.setUsersLanguage.bind(this, 'en_US'),
		'Set user language to German': this.setUsersLanguage.bind(this, 'de'),
    };

    constructor(org: Org) {
        super(org);
    }

    async openCompanyInfo(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/settings/personal/LanguageAndTimeZone/home');
	}
    
	private async setUsersLanguage(language: 'de'|'en_US'): Promise<void> {
		const apex = `update new User(Id = UserInfo.getUserId(), LanguageLocaleKey  = '${language}');`;
        
        const result = await this.connection.tooling.executeAnonymous(apex);

        if(result.success) {
            window.showInformationMessage(`Successfully set users language to ${language}`);
        } else {
            const msg: string = result.compileProblem ?? result.exceptionMessage ?? 'No error message';
            window.showErrorMessage(msg);
        }
	}
}
