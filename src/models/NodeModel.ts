import {Collection, collection, property} from "mozel";
import EntityModel from "./EntityModel";

export default class NodeModel extends EntityModel {
	@property(Number)
	x?:number;

	@property(Number)
	y?:number;

	@property(Boolean)
	fixed?:boolean;

	toString() {
		const labels = this.labels ? ':' + this.labels.toArray().join(':') : '';
		return `Node${labels} (${this.gid})`;
	}
}