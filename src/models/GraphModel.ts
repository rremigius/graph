import Mozel, {Collection, collection} from "mozel";
import NodeModel from "./NodeModel";
import RelationModel from "./RelationModel";

export default class GraphModel extends Mozel {
	@collection(NodeModel)
	nodes!:Collection<NodeModel>;

	@collection(RelationModel)
	relations!:Collection<RelationModel>;
}