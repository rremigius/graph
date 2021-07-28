const {EdgeMappingAbstract} = window.Graph;

export default class EdgeMapping extends EdgeMappingAbstract {
	get dataProperties() {
		return ['label'];
	}

	isSelected(model) {
		return model.selected;
	}

	setSelected(model, selected) {
		model.selected = selected;
	}

	getSourceId(edge) {
		if(!edge.source) return;
		return edge.source.gid.toString();
	}

	getTargetId(edge) {
		if(!edge.target) return;
		return edge.target.gid.toString();
	}

	createElement(model) {
		const ele = super.createElement(model);
		if(!ele) return;

		ele.classes('entity');
		return ele;
	}
}
