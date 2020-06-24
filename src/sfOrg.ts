import {
    AuthInfo,
    Org,
    Connection,
    Aliases,
    AuthFields,
    ConfigFile,
} from "@salesforce/core";
import { window, QuickPickItem, workspace, WorkspaceFolder } from "vscode";
import * as path from "path";

interface IMap {
    [key: string]: string;
}

interface IAuthInfoFields {
    username: string;
    instanceUrl: string;
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
        const allUsernames = (await AuthInfo.listAllAuthFiles()).map((filename) => filename.replace(".json", ""));
        const aliases = await Aliases.create({ defaultGroup: Aliases.getDefaultOptions().defaultGroup });
        const aliasToUsername: IMap = aliases.getContents().orgs as IMap;
        const usernameToAlias = Object.keys(aliasToUsername)
            .map((alias) => ({ [aliasToUsername[alias]]: alias }))
            .reduce((a, b) => ({ ...a, ...b }));
        const authInfos: AuthInfo[] = await Promise.all(allUsernames.map(this.getAuthInfo));
        const fields: AuthFields[] = authInfos.map((info) => info.getFields());

        const quickPickItems: QuickPickItem[] = fields.map((field) => {
            const username: string = field.username || "";
            const alias: string = (usernameToAlias as any)[username];
            return {
                label: (alias || username) as string,
                description: username,
                detail: field.instanceUrl as string,
            };
        });
        const selectedQuickPickItem = await window.showQuickPick(quickPickItems, {
            matchOnDescription: true,
            matchOnDetail: true,
        });

        if (selectedQuickPickItem) {
            const username = selectedQuickPickItem.description;
            console.log("Username: " + username);
            return this.getOrg(selectedQuickPickItem.description as string);
        } else {
            return undefined;
        }
    }

    private static async getOrg(username: string) {
        const authInfo = await this.getAuthInfo(username);
        const connection = await Connection.create({ authInfo });
        const org = await Org.create({ connection });
        await org.refreshAuth();
        return org;
    }

    private static async getAuthInfo(username: string) {
        return AuthInfo.create({ username });
    }

    private static async getUsername(usernameOrAlias: string): Promise<string> {
        const aliases = await Aliases.create({ defaultGroup: Aliases.getDefaultOptions().defaultGroup });
        const aliasToUsername: IMap = aliases.getContents().orgs as IMap;
        return aliasToUsername[usernameOrAlias] || usernameOrAlias;
    }
}
