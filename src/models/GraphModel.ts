import Mozel, {Collection, collection} from "mozel";
import NodeModel from "./NodeModel";
import EdgeModel from "./EdgeModel";

export default class GraphModel extends Mozel {
	static createFactory() {
		const factory = super.createFactory();
		factory.register(GraphModel);
		factory.register(NodeModel);
		factory.register(EdgeModel);
		return factory;
	}

	@collection(NodeModel)
	nodes!:Collection<NodeModel>;

	@collection(EdgeModel)
	edges!:Collection<EdgeModel>;
}
