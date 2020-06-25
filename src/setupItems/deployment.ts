import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class Deployment extends SetupItem {
	label: string = 'Deployment';
	name: string = 'Deployment';

	options = {
		'Open Deployment Status': this.openDeploymentStatus,
	};
	
	constructor(org: Org) {
		super(org);
	}

    async openDeploymentStatus(): Promise<void> {
		this.openRelativeUrlInOrg('/lightning/setup/DeployStatus/home');
	}
}