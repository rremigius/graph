import {property, reference} from "mozel";
import EntityModel from "./EntityModel";
import NodeModel from "./NodeModel";

export default class RelationModel extends EntityModel {
	@property(NodeModel, {reference})
	source!:NodeModel;

	@property(NodeModel, {reference})
	target!:NodeModel;

	toString() {
		const labels = this.labels ? ':' + this.labels.toArray().join(':') : '';
		return `Relation${labels} (${this.gid})`;
	}
}