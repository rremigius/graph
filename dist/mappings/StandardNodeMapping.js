import NodeMappingAbstract from "../NodeMappingAbstract";
export default class StandardNodeMapping extends NodeMappingAbstract {
    get dataProperties() {
        return ['label'];
    }
    getParentId(node) {
        return node.group && this.getId(node.group);
    }
    getPosition(node) {
        return { x: node.x, y: node.y };
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
}
