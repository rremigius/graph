import Mozel, {Collection, collection} from "mozel";
import GraphileonNode from "./GraphileonNode";
import GraphileonEdge from "./GraphileonEdge";

export default class GraphileonGraphModel extends Mozel {
	@collection(GraphileonNode)
	nodes!:Collection<GraphileonNode>;

	@collection(GraphileonEdge)
	edges!:Collection<GraphileonEdge>;
}
