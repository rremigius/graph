import EdgeMappingAbstract from "./EdgeMappingAbstract";
import Mozel from "mozel";
import { isFunction } from "./utils";
import { check, isAlphanumeric } from "validation-kit";
import { IS_ALPHANUMERIC, IS_BOOLEAN } from "validation-kit/dist/validators";
export default class GenericEdgeMapping extends EdgeMappingAbstract {
    constructor(cy, model, collection, options = {}) {
        super(cy, model, collection);
        this.options = options;
    }
    getElementId(model) {
        const getElementId = this.options.getElementId;
        if (!getElementId)
            return this.getId(model);
        if (isFunction(getElementId))
            return getElementId(model);
        let value = model.$path(getElementId);
        value = check(value, IS_ALPHANUMERIC, 'elementId');
        return value.toString();
    }
    getData(model) {
        const getData = this.options.getData;
        if (!getData)
            return {};
        if (isFunction(getData))
            return getData(model);
        const value = model.$path(getData);
        if (!value)
            return {};
        if (!(value instanceof Mozel)) {
            throw new Error("Data property must be a Mozel.");
        }
        return value.$export();
    }
    getSourceId(model) {
        const getSourceId = this.options.getSourceId;
        if (!getSourceId)
            return;
        if (isFunction(getSourceId))
            return getSourceId(model);
        let value = model.$path(getSourceId);
        if (!value)
            return;
        value = check(value, isAlphanumeric, 'sourceId');
        return value.toString();
    }
    getTargetId(model) {
        const getTargetId = this.options.getTargetId;
        if (!getTargetId)
            return;
        if (isFunction(getTargetId))
            return getTargetId(model);
        let value = model.$path(getTargetId);
        if (!value)
            return;
        value = check(value, IS_ALPHANUMERIC, 'targetId');
        return value.toString();
    }
    isSelected(model) {
        const isSelected = this.options.isSelected;
        if (!isSelected)
            return;
        if (isFunction(isSelected))
            return isSelected(model);
        const value = model.$path(isSelected);
        if (!value)
            return false;
        return check(value, IS_BOOLEAN, 'selected');
    }
    setSelected(model, selected) {
        const setSelected = this.options.setSelected;
        if (!setSelected)
            return;
        if (isFunction(setSelected))
            return setSelected(model, selected);
        model.$set(setSelected, selected);
    }
}
