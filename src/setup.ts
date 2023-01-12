import { Org } from "@salesforce/core";
import { window, Uri } from "vscode";
import Community from "./setupItems/community";
import CompanyInfo from "./setupItems/companyInfo";
import CustomMetadata from "./setupItems/custommetadata";
import Deployment from "./setupItems/deployment";
import Flow from "./setupItems/flow";
import Language from "./setupItems/language";
import PermissionSet from "./setupItems/permissionset";
import Profile from "./setupItems/profile";
import SetupItem from "./setupItem";
import SFObject from "./setupItems/sfobject";
import Tab from "./setupItems/tab";
import User from "./setupItems/user";

import Sandbox from "./setupItems/sandbox";
import Debug from "./setupItems/debug";
import DeveloperConsole from "./setupItems/developerconsole";
import ProcessBuilder from "./setupItems/processBuilder";

export default class Setup {
    public static async open(org: Org): Promise<void> {
        const items = this.getItems(org);

        const selectedOption = await window.showQuickPick(
            items.map((i) => i.getQuickPickItem()),
            {}
        );
        if (selectedOption) {
            const item = items.filter((i) => i.label === selectedOption?.label)[0];
            await item.open();
            return Promise.resolve();
        }
    }

    public static async openFile(org: Org, uri: Uri): Promise<void> {
        const { path } = uri;
        const itemsThatSupportFile = this.getItems(org)
            .filter((item) => item.opensFile)
            .filter((item) => path.match(item.fileMatcher as RegExp));

        if (itemsThatSupportFile.length === 0) {
            window.showWarningMessage(`File ${path} is not supported.`);
            return Promise.resolve();
        } else if (itemsThatSupportFile.length > 1) {
            window.showWarningMessage(`Found more than one option how to handle this file: ${path}`);
            return Promise.resolve();
        } else {
            itemsThatSupportFile[0].openFile(uri);
        }
    }

    private static getItems(org: Org): SetupItem[] {
        return [
            new Community(org),
            new CompanyInfo(org),
            new Debug(org),
            new DeveloperConsole(org),
            new CustomMetadata(org),
            new Deployment(org),
            new Language(org),
            new SFObject(org),
            new PermissionSet(org),
            new ProcessBuilder(org),
            new Profile(org),
            new Sandbox(org),
            new Tab(org),
            new User(org),
            new Flow(org)
        ];
    }
}
