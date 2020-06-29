import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class Sandbox extends SetupItem {
    label: string = "Sandboxes";
    name: string = "Sandboxes";

    options = {
        "List of Sandboxes": this.openSandboxList,
    };

    constructor(org: Org) {
        super(org);
    }

    async openSandboxList(): Promise<void> {
        this.openRelativeUrlInOrg("/lightning/setup/DataManagementCreateTestInstance/home");
    }
}
