import GraphAbstract, {GraphOptions} from "./GraphAbstract";
import NodeModel from "./models/NodeModel";
import RelationModel from "./models/RelationModel";
import {MozelFactory} from "mozel";
import GraphModel from "./models/GraphModel";
import {MozelData} from "mozel/dist/Mozel";

export default class Graph extends GraphAbstract<GraphModel, NodeModel, RelationModel> {
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
}