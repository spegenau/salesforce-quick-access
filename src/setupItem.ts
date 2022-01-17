import { QuickPickItem, window, Uri } from "vscode";
import { Org, Connection, AuthInfo } from "@salesforce/core";

const open = require("open");

type handlerFunction = () => Promise<void>;
export interface SetupItemOption {
    [key: string]: handlerFunction;
}

export default abstract class SetupItem {
    abstract label: string;
    abstract name: string;
    abstract options: SetupItemOption;
    org: Org;
    connection: Connection;
    accessToken: string;
    orgId: string;

    opensFile: boolean = false;
    fileMatcher: RegExp | undefined;

    constructor(org: Org) {
        this.org = org;
        this.orgId = org.getOrgId();
        this.connection = org.getConnection();
        this.accessToken = this.connection.accessToken;
    }

    public async open(): Promise<void> {
        const keys = Object.keys(this.options);

        if (keys.length === 1) {
            await this.options[keys[0]].bind(this)();
        } else {
            const selectedOption = await window.showQuickPick(Object.keys(this.options), {});
            if (selectedOption) {
                await this.options[selectedOption].bind(this)();
            } else {
                Promise.resolve();
            }
        }
    }

    public async openFile(uri: Uri) {
        window.showErrorMessage("NOT IMPLEMENTED YET");
    }

    public async openRelativeUrlInOrg(relUrl: string) {
        const baseUrl = await this.getLoginUrl();
        const url = `${baseUrl}&retURL=${relUrl}`;
        this.openUrl(url);
    }

    public async openUrl(url: string) {
        this.log("Opening: " + url);
        open(url);
    }

    public getQuickPickItem(): QuickPickItem {
        return {
            label: this.label,
        };
    }

    protected dummyHandler(): Promise<void> {
        this.warn("NOT YET IMPLEMENTED");
        return Promise.resolve();
    }

    private async getLoginUrl(): Promise<string> {
        const { instanceUrl, accessToken } = this.connection;
        const authInfo = await AuthInfo.create({
            username: accessToken,
        });

        return Promise.resolve(`${instanceUrl}/secur/frontdoor.jsp?sid=${authInfo.getFields().username}`);
    }

    protected log(msg: string, obj?: any): void {
        this.abstractedLog(console.log, msg, obj);
        window.showInformationMessage(msg);
    }

    protected warn(msg: string, obj?: any): void {
        this.abstractedLog(console.warn, msg, obj);
        window.showWarningMessage(msg);
    }

    protected error(msg: string, obj?: any): void {
        this.abstractedLog(console.error, msg, obj);
        window.showErrorMessage(msg);
    }

    private abstractedLog(logger: (str: string) => void, msg: string, obj?: any) {
        logger(`[${this.name}] ${msg} ${obj ? obj : ""}`);
    }
}
