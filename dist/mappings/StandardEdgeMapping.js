import EdgeMappingAbstract from "../EdgeMappingAbstract";
export default class StandardEdgeMapping extends EdgeMappingAbstract {
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
        if (!edge.source)
            return;
        return edge.source.gid.toString();
    }
    getTargetId(edge) {
        if (!edge.target)
            return;
        return edge.target.gid.toString();
    }
}
