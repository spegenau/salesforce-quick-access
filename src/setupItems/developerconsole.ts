import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class DeveloperConsole extends SetupItem {
    label: string = "Developer Console";
    name: string = "Developer Console";

    options = {
        "Open Developer Console": this.openDevConsole,
    };

    constructor(org: Org) {
        super(org);
    }

    async openDevConsole(): Promise<void> {
        this.openRelativeUrlInOrg("/_ui/common/apex/debug/ApexCSIPage");
    }
}
