import EdgeMappingAbstract from "../EdgeMappingAbstract";
import StandardEdgeModel from "../models/StandardEdgeModel";

export default class StandardEdgeMapping extends EdgeMappingAbstract<StandardEdgeModel> {
	get dataProperties() {
		return ['label'];
	}

	isSelected(model: StandardEdgeModel): boolean {
		return model.selected;
	}

	setSelected(model: StandardEdgeModel, selected: boolean): void {
		model.selected = selected;
	}

	getSourceId(edge: StandardEdgeModel): string {
		if(!edge.source) return;
		return edge.source.gid.toString();
	}

	getTargetId(edge: StandardEdgeModel): string {
		if(!edge.target) return;
		return edge.target.gid.toString();
	}
}
