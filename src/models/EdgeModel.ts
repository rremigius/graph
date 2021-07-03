import {property, reference} from "mozel";
import EntityModel from "./EntityModel";
import NodeModel from "./NodeModel";

export default class EdgeModel extends EntityModel {
	static get type() {
		return 'edge';
	}
	@property(NodeModel, {reference})
	source!:NodeModel;

	@property(NodeModel, {reference})
	target!:NodeModel;

	toString() {
		const label = this.label ? ':' + this.label : '';
		return `Edge${label} (${this.gid})`;
	}
}
