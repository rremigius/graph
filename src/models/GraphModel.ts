import {Collection, collection, schema} from "mozel";
import NodeModel from "./NodeModel";
import RelationModel from "./RelationModel";
import GraphModelAbstract from "./GraphModelAbstract";

export default class GraphModel extends GraphModelAbstract<NodeModel, RelationModel> {
	@collection(NodeModel)
	nodes!:Collection<NodeModel>;

	@collection(RelationModel)
	relations!:Collection<RelationModel>;

	isFixed(node:NodeModel):boolean {
		return node.fixed === true;
	}

	setFixed(node:NodeModel, fixed:boolean) {
		node.fixed = fixed;
	}

	getPosition(node:NodeModel):{x:number, y:number} {
		return {x: node.x || 0, y: node.y || 0};
	}

	setPosition(node:NodeModel, x:number, y:number) {
		node.x = x;
		node.y = y;
	}

	getRelationSource(relation:RelationModel):NodeModel {
		return relation.source;
	}

	getRelationTarget(relation:RelationModel):NodeModel {
		return relation.target;
	}

	isNode(entity:any):entity is NodeModel {
		return entity instanceof NodeModel;
	}

	isRelation(entity:any):entity is RelationModel {
		return entity instanceof RelationModel;
	}

	getGraphModelNodesPath():string {
		return schema(GraphModel).nodes.$;
	}

	getGraphModelRelationsPath():string {
		return schema(GraphModel).relations.$;
	}

	getNodes(): Collection<NodeModel> {
		return this.nodes;
	}

	getRelations(): Collection<RelationModel> {
		return this.relations;
	}
}