import {property, reference} from "mozel";
import StandardEntityModel from "./StandardEntityModel";

export default class StandardNodeModel extends StandardEntityModel {
	static get type() {
		return 'node';
	}
	@property(Number)
	x?:number;

	@property(Number)
	y?:number;

	@property(StandardNodeModel, {reference})
	parent?:StandardNodeModel;

	toString() {
		const label = this.label ? ':' + this.label : '';
		return `Node${label} (${this.gid})`;
	}
}
