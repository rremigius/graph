import Mozel, {Collection, collection} from "mozel";
import StandardNodeModel from "./StandardNodeModel";
import StandardEdgeModel from "./StandardEdgeModel";

export default class StandardGraphModel extends Mozel {
	static createFactory() {
		const factory = super.createFactory();
		factory.register(StandardGraphModel);
		factory.register(StandardNodeModel);
		factory.register(StandardEdgeModel);
		return factory;
	}

	@collection(StandardNodeModel)
	nodes!:Collection<StandardNodeModel>;

	@collection(StandardEdgeModel)
	edges!:Collection<StandardEdgeModel>;
}
