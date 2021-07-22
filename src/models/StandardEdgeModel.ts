import {property, reference} from "mozel";
import StandardEntityModel from "./StandardEntityModel";
import StandardNodeModel from "./StandardNodeModel";

export default class StandardEdgeModel extends StandardEntityModel {
	static get type() {
		return 'edge';
	}
	@property(StandardNodeModel, {reference})
	source?:StandardNodeModel;

	@property(StandardNodeModel, {reference})
	target?:StandardNodeModel;

	toString() {
		const label = this.label ? ':' + this.label : '';
		return `Edge${label} (${this.gid})`;
	}
}
