import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class Deployment extends SetupItem {
	label: string = 'Deployment';
	name: string = 'Deployment';

	options = {
		'DUMMY': this.dummyHandler,
	};
	
	constructor(org: Org) {
		super(org);
	}
}