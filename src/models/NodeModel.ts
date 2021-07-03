import {property, reference} from "mozel";
import EntityModel from "./EntityModel";

export default class NodeModel extends EntityModel {
	static get type() {
		return 'node';
	}
	@property(Number)
	x?:number;

	@property(Number)
	y?:number;

	@property(Boolean)
	fixed?:boolean;

	@property(NodeModel, {reference})
	group?:NodeModel;

	toString() {
		const label = this.label ? ':' + this.label : '';
		return `Node${label} (${this.gid})`;
	}
}
