import NodeModel from "../../src/models/NodeModel";
import {property, reference} from "mozel";

export default class Node extends NodeModel {
	static get type() {
		return 'node';
	}
	@property(Node, {reference})
	link?:Node;
}
