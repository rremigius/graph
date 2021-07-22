import NodeToEdgeMappingAbstract from "../NodeToEdgeMappingAbtract";
import StandardNodeModel from "../models/StandardNodeModel";

export default class NodeToEdgeMapping extends NodeToEdgeMappingAbstract<StandardNodeModel> {
	isSelected(model: StandardNodeModel): boolean {
		return false;
	}

	setSelected(model: StandardNodeModel, selected: boolean): void {
	}
}
