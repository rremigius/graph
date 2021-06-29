import {Collection, collection, property} from "mozel";
import EntityModel from "./EntityModel";

export default class NodeModel extends EntityModel {
	@collection(String)
	labels!:Collection<string>;

	@property(Number)
	x?:number;

	@property(Number)
	y?:number;

	@property(Boolean)
	fixed?:boolean;
}