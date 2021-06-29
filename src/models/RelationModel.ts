import {property, reference, required} from "mozel";
import EntityModel from "./EntityModel";
import NodeModel from "./NodeModel";

export default class RelationModel extends EntityModel {
	@property(String)
	type?:string;

	@property(NodeModel, {reference})
	source!:NodeModel;

	@property(NodeModel, {reference})
	target!:NodeModel;
}