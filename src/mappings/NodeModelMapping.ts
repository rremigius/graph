import NodeModelMappingAbstract from "../NodeModelMappingAbstract";
import NodeModel from "../models/NodeModel";

export default class NodeModelMapping extends NodeModelMappingAbstract<NodeModel> {
	getData(node: NodeModel): Record<string, any> {
		return {
			...node.data.$export(),
			label: node.label
		};
	}
	getParent(node: NodeModel): NodeModel {
		return node.group;
	}

	getPosition(node: NodeModel): { x: number; y: number } {
		return {x: node.x, y: node.y};
	}
	setPosition(node: NodeModel, x: number, y: number): void {
		node.x = x;
		node.y = y;
	}

	isSelected(node: NodeModel): boolean {
		return node.selected;
	}
	setSelected(node: NodeModel, selected: boolean): void {
		node.selected = selected;
	}

}
