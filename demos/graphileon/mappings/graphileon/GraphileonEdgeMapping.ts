import EdgeMappingAbstract from "../../../../src/EdgeMappingAbstract";
import GraphileonEdge from "./GraphileonEdge";

export default class GraphileonEdgeMapping extends EdgeMappingAbstract<GraphileonEdge> {
	getData(model: GraphileonEdge): Record<string, any> {
		return {
			label: model.type
		}
	}

	getId(edge: GraphileonEdge): string {
		return edge.id.toString();
	}

	getSourceId(model: GraphileonEdge): string {
		return model.source.toString();
	}

	getTargetId(model: GraphileonEdge): string {
		return model.target.toString();
	}

	isSelected(model: GraphileonEdge): boolean {
		return model.selected === true;
	}

	setSelected(model: GraphileonEdge, selected: boolean): void {
		model.selected = selected;
	}

}
