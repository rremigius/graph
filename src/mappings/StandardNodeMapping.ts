import NodeMappingAbstract from "../NodeMappingAbstract";
import StandardNodeModel from "../models/StandardNodeModel";

export default class StandardNodeMapping extends NodeMappingAbstract<StandardNodeModel> {
	get dataProperties() {
		return ['label'];
	}

	getParentId(node: StandardNodeModel):string {
		return node.group && this.getId(node.group);
	}

	getPosition(node: StandardNodeModel): { x: number; y: number } {
		return {x: node.x, y: node.y};
	}
	setPosition(node: StandardNodeModel, x: number, y: number): void {
		node.x = x;
		node.y = y;
	}

	isSelected(node: StandardNodeModel): boolean {
		return node.selected;
	}
	setSelected(node: StandardNodeModel, selected: boolean): void {
		node.selected = selected;
	}

}
