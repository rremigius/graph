import EdgeModelMappingAbstract from "../EdgeModelMappingAbstract";
import EdgeModel from "../models/EdgeModel";

export default class EdgeModelMapping extends EdgeModelMappingAbstract<EdgeModel> {
	getData(model: EdgeModel): Record<string, any> {
		return {
			...model.data.$export(),
			label: model.label
		};
	}

	isSelected(model: EdgeModel): boolean {
		return model.selected;
	}

	setSelected(model: EdgeModel, selected: boolean): void {
		model.selected = selected;
	}

	getSourceId(edge: EdgeModel): string {
		return edge.source.gid.toString();
	}

	getTargetId(edge: EdgeModel): string {
		return edge.target.gid.toString();
	}
}
