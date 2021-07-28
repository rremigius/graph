import MappingAbstract from "./MappingAbtract";
import { isEmpty } from "./utils";
export default class EdgeMappingAbstract extends MappingAbstract {
    get reservedKeys() {
        return super.reservedKeys.concat(['source', 'target']);
    }
    get elementGroup() {
        return "edges";
    }
    isMappingElement(value) {
        return this.isEdge(value);
    }
    shouldHaveElement(model) {
        return !isEmpty(this.getSourceId(model)) && !isEmpty(this.getTargetId(model));
    }
    _createMinimalElement(model, data) {
        return this.cy.add({
            group: this.elementGroup,
            data: Object.assign(Object.assign({}, data), { source: this.getSourceId(model), target: this.getTargetId(model) })
        });
    }
    updateElement(model) {
        const ele = super.updateElement(model);
        if (!ele)
            return;
        ele.data('source', this.getSourceId(model));
        ele.data('target', this.getTargetId(model));
        return ele;
    }
}
