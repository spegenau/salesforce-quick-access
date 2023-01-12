import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { window, QuickPickItem } from "vscode";

interface IFlow {
    Id: string,
    DurableId: string,
    ApiName: string,
    Label: string,
    Description: string,
    ProcessType: string,
    TriggerType: string,
    NamespacePrefix: string,
    ActiveVersionId: string,
    LatestVersionId: string,
    LastModifiedBy: string,
    IsActive: string,
    IsOutOfDate: string,
    LastModifiedDate: string,
    IsTemplate: string,
    IsOverridable: string,
    Builder: string,
    ManageableState: string,
    InstalledPackageName: string,
    TriggerObjectOrEventLabel: string,
    TriggerObjectOrEventId: string,
    RecordTriggerType: string,
    HasAsyncAfterCommitPath: string,
    VersionNumber: string,
    TriggerOrder: string,
    Environments: string
}

export default class Flow extends SetupItem {
    label: string = "Flow";
    name: string = "Flow";

    options = {
        "Flow List": this.openFlowList,
        "Edit Flow": this.editFlow,
        "Show Details": this.showDetails
        //"Open Community": this.openCommunity,
        //Builder: this.openBuilder,
    };

    constructor(org: Org) {
        super(org);
    }
    
    async openFlowList(): Promise<void> {
        this.openRelativeUrlInOrg("/lightning/setup/Flows/home");
    }

    async editFlow(): Promise<void> {
        const flow = await this.selectFlow();
        if(flow) {
            this.openEditFlow(flow);
        }
    }

    async showDetails(): Promise<void> {
        const flow = await this.selectFlow();
        if(flow) {
            this.openFlowDetails(flow);
        }
    }

    private async selectFlow(): Promise<IFlow> {
        const flows = await this.getFlows();
        const flowPicklistItems = this.getFlowPicklist(flows);

        const selectedQuickPickItem = await window.showQuickPick(flowPicklistItems, {
            matchOnDescription: true,
            matchOnDetail: true,
        });

        const selectedFlow: IFlow = flows.filter(
            (flow) => flow.Id === (selectedQuickPickItem as any || {}).id
        )[0];

        return Promise.resolve(selectedFlow);
    }

    private getFlowPicklist(flows: IFlow[]): QuickPickItem[] {
        return flows.map((flow) => {
            const label = `${flow.Label} (${flow.ApiName})`;
            const detail = [ flow.ProcessType, flow.TriggerType, flow.RecordTriggerType ].filter(s => typeof s !== 'undefined' && s !== null && s.length > 0).join(' - ');

            return {
                label,
                description: flow.Description ?? '',
                detail,
                id: flow.Id
            };
        });
    }

    private async getFlows(): Promise<IFlow[]> {
        const soql = "SELECT Id, DurableId, ApiName, Label, Description, ProcessType, TriggerType, NamespacePrefix, ActiveVersionId, LatestVersionId, LastModifiedBy, IsActive, IsOutOfDate, LastModifiedDate, IsTemplate, IsOverridable, Builder, ManageableState, InstalledPackageName, TriggerObjectOrEventLabel, TriggerObjectOrEventId, RecordTriggerType, HasAsyncAfterCommitPath, VersionNumber, TriggerOrder, Environments FROM FlowDefinitionView ORDER BY ApiName";
        const result = await this.connection.query(soql);

        return result.records as IFlow[];
    }

    async openEditFlow(flow: IFlow): Promise<void> {
        this.openRelativeUrlInOrg(`/builder_platform_interaction/flowBuilder.app?flowId=${flow.LatestVersionId}`);
    }

    async openFlowDetails(flow: IFlow): Promise<void> {
        this.openRelativeUrlInOrg(`/lightning/setup/Flows/page?address=%2F${flow.DurableId}`);
    }
}
