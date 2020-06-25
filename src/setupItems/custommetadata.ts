import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { window, QuickPickItem } from "vscode";
import Profile from "./profile";

interface ICustomMetadata {
    MasterLabel: string;
    QualifiedApiName: string;
    KeyPrefix: string;
    DurableId: string;
}

export default class CustomMetadata extends SetupItem {
    label: string = "CustomMetadata";
    name: string = "CustomMetadata";

    options = {
        "Custom Metadata List": this.openCustomMetadataList,
        "Open Custom Metadata": this.openCustomMetadata,
        "Manage records": this.manageRecords,
    };

    constructor(org: Org) {
        super(org);
    }

    async openCustomMetadataList(): Promise<void> {
        this.openRelativeUrlInOrg("/lightning/setup/CustomMetadata/home");
    }

    async openCustomMetadata(): Promise<void> {
        const customMetadata: ICustomMetadata = await this.selectCustomMetadata();
        if (customMetadata) {
            this.openRelativeUrlInOrg(
                `/lightning/setup/CustomMetadata/page?address=/${customMetadata.DurableId}?setupid=CustomMetadata`
            );
        }
    }

    async manageRecords(): Promise<void> {
        const customMetadata: ICustomMetadata = await this.selectCustomMetadata();
        if (customMetadata) {
            this.openRelativeUrlInOrg(
                `/lightning/setup/CustomMetadata/page?address=/${customMetadata.KeyPrefix}?setupid=CustomMetadata`
            );
        }
    }

    private async selectCustomMetadata(): Promise<ICustomMetadata> {
        const customMetadataTypes = await this.getAllCustomMetadata();
        const picklistItems = this.getCustomMetadataPicklist(customMetadataTypes);

        const selectedQuickPickItem = await window.showQuickPick(picklistItems, { matchOnDescription: true });

        const customMetadataType: ICustomMetadata =
            customMetadataTypes.filter((u) => u.QualifiedApiName === (selectedQuickPickItem || {}).description)[0] ||
            {};

        return Promise.resolve(customMetadataType);
    }

    private async getCustomMetadataPicklist(customMetadata: ICustomMetadata[]): Promise<QuickPickItem[]> {
        return customMetadata.map((u) => ({
            label: u.MasterLabel,
            description: u.QualifiedApiName,
        }));
    }

    private async getAllCustomMetadata(): Promise<ICustomMetadata[]> {
        const { tooling } = this.connection;

        const soql =
            "SELECT MasterLabel, QualifiedApiName, KeyPrefix, DurableId FROM EntityDefinition WHERE IsCustomizable = true AND QualifiedApiName Like '%_mdt' ORDER BY MasterLabel ASC";
        const result: ICustomMetadata[] = (await tooling.query(soql)).records as ICustomMetadata[];

        return result;
    }
}
