import GraphileonNode from "./GraphileonNode";
import NodeMappingAbstract from "../../../../src/NodeMappingAbstract";

export default class GraphileonNodeMapping extends NodeMappingAbstract<GraphileonNode>{
	getData(model: GraphileonNode): Record<string, any> {
		return {
			label: model.labels.get(0)
		}
	}

	getId(node: GraphileonNode): string {
		return node.id.toString();
	}

	getParentId(model: GraphileonNode): string|undefined {
		return undefined;
	}

	getPosition(model: GraphileonNode): { x: number; y: number } {
		return {x: model.x, y: model.y};
	}
	setPosition(model: GraphileonNode, x: number, y: number): void {
		model.x = x;
		model.y = y;
	}

	isSelected(model: GraphileonNode): boolean {
		return model.selected === true;
	}
	setSelected(model: GraphileonNode, selected: boolean): void {
		model.selected = selected;
	}
}
