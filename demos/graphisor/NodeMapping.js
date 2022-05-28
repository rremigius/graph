const {NodeMappingAbstract} = window.Graph;

export default class NodeMapping extends NodeMappingAbstract {
	get dataProperties() {
		return ['label'];
	}

	getParentId(node) {
		return node.parent && this.getId(node.parent);
	}

	getPosition(node){
		return {x: node.x, y: node.y};
	}
	setPosition(node, x, y) {
		node.x = x;
		node.y = y;
	}

	isSelected(node) {
		return node.selected;
	}
	setSelected(node, selected) {
		node.selected = selected;
	}

	createElement(model) {
		const ele = super.createElement(model);
		if(!ele) return;

		ele.classes('entity'); // we can use this as a selector
		return ele;
	}
}
