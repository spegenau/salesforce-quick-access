import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { ProgressLocation, window } from "vscode";

interface IdOnly {
    Id: string
}
export default class Debug extends SetupItem {
    label: string = "Debug";
    name: string = "Debug";

    options = {
        "Debug Logs": this.openDebugLogs,
        "Lightning Debug Mode": this.openLightningDebugMode,
        "Delete all Apex Debug Logs": this.deleteAllDebugLogs,
        "Turn ON Lightning Debug Log for current user": this.setDebugModeTo.bind(this, true),
        "Turn OFF Lightning Debug Log for current user": this.setDebugModeTo.bind(this, false)
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

    async deleteAllDebugLogs(): Promise<void> {
        const soql = 'SELECT Id FROM ApexLog';
        const apexLogs: IdOnly[] = (await this.connection.query(soql)).records as IdOnly[];
        const apexLogIds = (apexLogs || []).map(log => log.Id);

        if(apexLogIds.length > 0) {
            window.withProgress({
                location: ProgressLocation.Notification,
                title: `Deleting ${apexLogIds.length} Apex Debug Logs`,
                cancellable: true
            }, () => {
                return this.connection.tooling.delete('ApexLog', apexLogIds);
            });
        } else {
            window.showInformationMessage('No Debug Logs found.');
        }
    }

    async setDebugModeTo(active: boolean): Promise<void> {
        const apex = `update new User(Id = UserInfo.getUserId(), UserPreferencesUserDebugModePref = ${active ? 'true' : 'false'});`;

        const result = await this.connection.tooling.executeAnonymous(apex);


        if(result.success) {
            window.showInformationMessage(`Successfully turned Lightning Debug Mode ${active ? 'ON' : 'OFF'}`);
        } else {
            const msg: string = result.compileProblem ?? result.exceptionMessage ?? 'No error message';
            window.showErrorMessage(msg);
        }
    }
}
