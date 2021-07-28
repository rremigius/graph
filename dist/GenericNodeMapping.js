import NodeMappingAbstract from "./NodeMappingAbstract";
import Mozel from "mozel";
import { isFunction, isNumber, isPlainObject } from "./utils";
import { check } from "validation-kit";
import { IS_ALPHANUMERIC, IS_BOOLEAN } from "validation-kit/dist/validators";
export default class GenericNodeMapping extends NodeMappingAbstract {
    constructor(cy, model, collection, options = {}) {
        super(cy, model, collection);
        this.options = options;
    }
    getElementId(model) {
        const getElementId = this.options.getElementId;
        if (!getElementId)
            return this.getId(model);
        let value = isFunction(getElementId) ? getElementId(model) : model.$path(getElementId);
        value = check(value, IS_ALPHANUMERIC, 'elementId');
        return value.toString();
    }
    getData(model) {
        const getData = this.options.getData;
        if (!getData)
            return {};
        const value = isFunction(getData) ? getData(model) : model.$path(getData);
        if (!value)
            return;
        if (!(value instanceof Mozel)) {
            throw new Error("Data property must be a Mozel.");
        }
        return value.$export();
    }
    getParentId(model) {
        const getParentId = this.options.getParentId;
        if (!getParentId)
            return;
        let value = isFunction(getParentId) ? getParentId(model) : model.$path(getParentId);
        if (!value)
            return;
        value = check(value, IS_ALPHANUMERIC, 'parentId');
        return value.toString();
    }
    getPosition(model) {
        const getPosition = this.options.getPosition;
        if (!getPosition)
            return;
        const value = isFunction(getPosition) ? getPosition(model) : model.$path(getPosition);
        if (!value)
            return { x: 0, y: 0 };
        if (!isPlainObject(value) || !isNumber(value.x) || !isNumber(value.y)) {
            throw new Error("Position did not return x,y coordinate.");
        }
        return value; // TS: checked above
    }
    setPosition(model, x, y) {
        const setPosition = this.options.setPosition;
        if (!setPosition)
            return;
        if (isFunction(setPosition)) {
            setPosition(model, x, y);
            return;
        }
        model.$set(setPosition, { x, y }, true, true);
    }
    isSelected(model) {
        const isSelected = this.options.isSelected;
        if (!isSelected)
            return;
        const value = isFunction(isSelected) ? isSelected(model) : model.$path(isSelected);
        if (!value)
            return false;
        return check(value, IS_BOOLEAN, 'selected');
    }
    setSelected(model, selected) {
        const setSelected = this.options.setSelected;
        if (!setSelected)
            return;
        if (isFunction(setSelected)) {
            setSelected(model, selected);
            return;
        }
        model.$set(setSelected, selected);
    }
}
