import GraphAbstract, {GraphOptions} from "./GraphAbstract";
import NodeModel from "./models/NodeModel";
import RelationModel from "./models/RelationModel";
import {Collection, MozelFactory, schema} from "mozel";
import GraphModel from "./models/GraphModel";
import {MozelData} from "mozel/dist/Mozel";
import EntityModel from "./models/EntityModel";
import {isEmpty} from "lodash";

export default class Graph extends GraphAbstract<GraphModel, NodeModel, RelationModel> {
	static getLabel(entity:EntityModel) {
		if(entity.data && !isEmpty(entity.data.name)) return entity.data.name;
		if(entity.labels.length) {
			return entity.labels.toArray().join(':');
		}
		return '';
	}

	model:GraphModel;
	factory:MozelFactory;

	constructor(options?:GraphOptions) {
		super(options);
		const factory = new MozelFactory();
		factory.register(GraphModel);
		factory.register(NodeModel);
		factory.register(RelationModel);
		this.factory = factory;
	}

	createModel(data:MozelData<GraphModel>) {
		return this.factory.create(GraphModel, data);
	}

	getElementData(entity:NodeModel|RelationModel):object {
		return entity.data.$export();
	}

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
		return this.model.nodes;
	}

	getRelations(): Collection<RelationModel> {
		return this.model.relations;
	}
}