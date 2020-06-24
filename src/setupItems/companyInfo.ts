import SetupItem from "../setupItem";
import { Org } from "@salesforce/core";

export default class CompanyInfo extends SetupItem {
	label: string = 'CompanyInfo';
	name: string = 'CompanyInfo';

	
	options = {
		'DUMMY': this.dummyHandler,
	};
	
	constructor(org: Org) {
		super(org);
	}
}