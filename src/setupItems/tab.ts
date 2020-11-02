import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { window } from "vscode";

interface ITab {
    Label: string;
    Url: string;
}

export default class Tab extends SetupItem {
    label: string = "Tab";
    name: string = "Tab";

    options = {
        "Open Tab": this.openTab,
    };

    constructor(org: Org) {
        super(org);
    }

    async openTab(): Promise<void> {
        const tab = await this.selectTab();
        if (tab) {
            const { instanceUrl } = this.connection;
            debugger;
            this.openRelativeUrlInOrg(`${tab.Url.replace(instanceUrl, "")}`);
        }
    }

    private async selectTab(): Promise<ITab> {
        const query =
            "SELECT Label, Url FROM TabDefinition WHERE IsAvailableInDesktop = true AND Url != null ORDER BY Label ASC";
        const result = await this.connection.query(query);

        const tabs: ITab[] = result.records as ITab[];
        const picklistItems = tabs.map((tab) => ({ label: tab.Label }));

        const selectedTab = await window.showQuickPick(picklistItems);

        const tab: ITab = tabs.filter((tab) => tab.Label === (selectedTab || {}).label)[0] || {};

        return Promise.resolve(tab);
    }
}
