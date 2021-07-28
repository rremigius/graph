import Mozel from "mozel";
import { check } from "validation-kit";
import EdgeMappingAbstract from "./EdgeMappingAbstract";
import { IS_STRING } from "validation-kit/dist/validators";
export default class NodeToEdgeMappingAbstract extends EdgeMappingAbstract {
    constructor(cy, model, collection, property, direction = 'out') {
        super(cy, model, collection);
        this.property = property;
        this.direction = direction;
    }
    getData(model) {
        return {};
    }
    getElementId(model) {
        return super.getElementId(model) + "_" + this.property;
    }
    getSourceId(model) {
        if (this.direction === 'in') {
            return this.getOtherId(model);
        }
        return this.getId(model);
    }
    getTargetId(model) {
        if (this.direction === 'in') {
            return this.getId(model);
        }
        return this.getOtherId(model);
    }
    getOtherId(model) {
        let property;
        try {
            property = model.$get(this.property);
            if (!property)
                return;
        }
        catch (e) {
            return;
        }
        if (property instanceof Mozel) {
            return this.getId(property);
        }
        return check(property, IS_STRING, 'source/target id');
    }
}
