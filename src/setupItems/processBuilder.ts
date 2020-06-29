import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class ProcessBuilder extends SetupItem {
    label: string = "Process Builder";
    name: string = "Process Builder";

    options = {
        "Open Process Builder": this.openProcessBuilder,
    };

    constructor(org: Org) {
        super(org);
    }

    async openProcessBuilder(): Promise<void> {
        this.openRelativeUrlInOrg("/lightning/setup/ProcessAutomation/home");
    }
}
