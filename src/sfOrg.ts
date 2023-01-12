import {
    AuthInfo,
    Org,
    Connection,
    ConfigFile,
    OrgAuthorization,
} from "@salesforce/core";
import { window, QuickPickItem, workspace, WorkspaceFolder } from "vscode";
import * as path from "path";
import { ARR_REDUCE } from "./util";

interface IMap {
    [key: string]: string;
}

function hasRootWorkspace(ws: typeof workspace = workspace) {
    return ws && ws.workspaceFolders && ws.workspaceFolders.length > 0;
}

function getRootWorkspace(): WorkspaceFolder {
    return hasRootWorkspace() ? workspace.workspaceFolders![0] : ({} as WorkspaceFolder);
}

function getRootWorkspacePath(): string {
    return getRootWorkspace().uri ? getRootWorkspace().uri.fsPath : "";
}
/*
const aggregator = await ConfigAggregator.create();
const globalConfig = aggregator.getGlobalConfig();
*/

export default class SFOrg {
    public static async getDefaultOrg(): Promise<Org | undefined> {
        const rootPath = getRootWorkspacePath();
        const projectConfig = await ConfigFile.create({
            isGlobal: false,
            rootFolder: path.join(rootPath, ".sfdx"),
            filename: "sfdx-config.json",
        });

        const aliasOrUsername: string | undefined = projectConfig.getContents().defaultusername as string;
        if (aliasOrUsername) {
            const username = await this.getUsername(aliasOrUsername);
            return this.getOrg(username);
        } else {
            window.showErrorMessage("No default org found");
            return undefined;
        }
    }

    public static async chooseOrg(): Promise<Org | undefined> {
        const authorizations: OrgAuthorization[] = await AuthInfo.listAllAuthorizations();

        const quickPickItems: QuickPickItem[] = authorizations.map((auth: OrgAuthorization) => {
            const label: string = (auth.aliases && auth.aliases.length > 0) ? auth.aliases.join(', ') : auth.username;
            return {
                label,
                description: auth.username,
                detail: auth.instanceUrl,
            };
        });

        const selectedQuickPickItem = await window.showQuickPick(quickPickItems, {
            matchOnDescription: true,
            matchOnDetail: true,
        });

        if (selectedQuickPickItem) {
            const username = selectedQuickPickItem.description;
            console.log("Username: " + username);
            return this.getOrg(username as string);
        } else {
            return undefined;
        }
    }

    private static async getOrg(username: string) {
        const authInfo = await AuthInfo.create({
            username
        });

        const connection = await Connection.create({ authInfo });
        const org = await Org.create({ connection });
        await org.refreshAuth();
        return org;
    }

    private static async getUsername(usernameOrAlias: string): Promise<string> {
        const authorizations: OrgAuthorization[] = await AuthInfo.listAllAuthorizations();

        const aliasToUsername: IMap = authorizations.map(auth => {
            return (auth.aliases ?? []).map((alias: string) => ({ [alias]: auth.username })).reduce((a: IMap, b: IMap) => ({ ...a, ...b }), {});
        }).reduce((a: IMap, b: IMap) => ({ ...a, ...b }), {});

        return aliasToUsername[usernameOrAlias] || usernameOrAlias;
    }
}
