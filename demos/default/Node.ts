import StandardNodeModel from "../../src/models/StandardNodeModel";
import {property, reference} from "mozel";

export default class Node extends StandardNodeModel {
	static get type() {
		return 'node';
	}
	@property(Node, {reference})
	link?:Node;
	@property(String)
	owner?:string;

	@property(String)
	title?:string;

	@property(String)
	description?:string;

	@property(String)
	url?:string;
}
