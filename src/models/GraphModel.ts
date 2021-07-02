import Mozel, {Collection, collection} from "mozel";
import NodeModel from "./NodeModel";
import RelationModel from "./RelationModel";

export default class GraphModel extends Mozel {
	static createFactory() {
		const factory = super.createFactory();
		factory.register(GraphModel);
		factory.register(NodeModel);
		factory.register(RelationModel);
		return factory;
	}

	@collection(NodeModel)
	nodes!:Collection<NodeModel>;

	@collection(RelationModel)
	relations!:Collection<RelationModel>;
}