import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class Debug extends SetupItem {
    label: string = "Debug";
    name: string = "Debug";

    options = {
        "Debug Logs": this.openDebugLogs,
        "Lightning Debug Mode": this.openLightningDebugMode,
    };

    constructor(org: Org) {
        super(org);
    }

    async openDebugLogs(): Promise<void> {
        this.openRelativeUrlInOrg("/lightning/setup/ApexDebugLogs/home");
    }

    async openLightningDebugMode(): Promise<void> {
        this.openRelativeUrlInOrg("/lightning/setup/UserDebugModeSetup/home");
    }
}
