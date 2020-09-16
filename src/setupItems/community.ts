import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";
import { window, QuickPickItem } from "vscode";

interface ICommunity {
    Id: string;
    Name: string;
    Description: string;
    Status: string;
    UrlPathPrefix: string;
}

type Id = string;

export default class Community extends SetupItem {
    label: string = "Community";
    name: string = "Community";

    options = {
        "Community List": this.openCommunityList,
        "Open Community": this.openCommunity,
        Builder: this.openBuilder,
    };

    constructor(org: Org) {
        super(org);
    }

    async openCommunityList(): Promise<void> {
        this.openRelativeUrlInOrg("/lightning/setup/SetupNetworks/home");
    }

    async openCommunity(): Promise<void> {
        const community = await this.selectCommunity();
        const shortId = community.Id.substring(0, 15);
        this.openRelativeUrlInOrg(`/servlet/networks/switch?networkId=${shortId}&`);
    }

    async openBuilder(): Promise<void> {
        const community = await this.selectCommunity();

        const shortId = community.Id.substring(0, 15);
        this.openRelativeUrlInOrg(
            `/sfsites/picasso/core/config/commeditor.jsp?exitURL=${this.connection.instanceUrl}%2Fservlet%2Fnetworks%2Fswitch%3FnetworkId%3D${shortId}%26startURL%3D%252FcommunitySetup%252FcwApp.app%2523%252Fc%252Fhome/&`
        );
    }

    private async selectCommunity(): Promise<ICommunity> {
        const communities = await this.getCommunities();
        const communityPicklistItems = this.getCommunityPicklist(communities);

        const selectedQuickPickItem = await window.showQuickPick(communityPicklistItems, {
            matchOnDescription: true,
            matchOnDetail: true,
        });

        const community: ICommunity = communities.filter(
            (c) => c.UrlPathPrefix === (selectedQuickPickItem || {}).detail
        )[0];

        return Promise.resolve(community);
    }

    private async getCommunityPicklist(communities: ICommunity[]): Promise<QuickPickItem[]> {
        return communities.map((c) => ({
            label: c.Name,
            description: c.Status,
            detail: c.UrlPathPrefix,
        }));
    }

    private async getCommunities(): Promise<ICommunity[]> {
        const soql = "SELECT Id, Name, Description, Status, UrlPathPrefix FROM Network ORDER BY Name ASC";
        const result = await this.connection.query(soql);

        const users: ICommunity[] = result.records.map((rec) => {
            const { Id, Name, Description, Status, UrlPathPrefix } = rec as ICommunity;
            return { Id, Name, Description, Status, UrlPathPrefix };
        });
        return users;
    }
}
