import NodeToEdgeMappingAbstract from "../NodeToEdgeMappingAbtract";
export default class NodeToEdgeMapping extends NodeToEdgeMappingAbstract {
    isSelected(model) {
        return false;
    }
    setSelected(model, selected) {
    }
}
