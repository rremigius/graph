import NodeToEdgeMappingAbstract from "../NodeToEdgeMappingAbtract";
import NodeModel from "../models/NodeModel";

export default class NodeToEdgeMapping extends NodeToEdgeMappingAbstract<NodeModel> {
	isSelected(model: NodeModel): boolean {
		return false;
	}

	setSelected(model: NodeModel, selected: boolean): void {
	}
}
