import EdgeMappingAbstract from "../EdgeMappingAbstract";
import EdgeModel from "../models/EdgeModel";

export default class StandardEdgeMapping extends EdgeMappingAbstract<EdgeModel> {
	get dataProperties() {
		return ['label'];
	}

	isSelected(model: EdgeModel): boolean {
		return model.selected;
	}

	setSelected(model: EdgeModel, selected: boolean): void {
		model.selected = selected;
	}

	getSourceId(edge: EdgeModel): string {
		if(!edge.source) return;
		return edge.source.gid.toString();
	}

	getTargetId(edge: EdgeModel): string {
		if(!edge.target) return;
		return edge.target.gid.toString();
	}
}
