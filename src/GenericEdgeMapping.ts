import EdgeMappingAbstract from "./EdgeMappingAbstract";
import Mozel, {Collection} from "mozel";
import {isBoolean, isFunction, isString} from "./utils";
import {Core} from "cytoscape";
import {check, isAlphanumeric} from "validation-kit";
import {IS_ALPHANUMERIC, IS_BOOLEAN} from "validation-kit/dist/validators";

export type GenericEdgeMappingOptions = {
	getElementId?:string|((mozel:Mozel)=>string),
	getData?:string|((mozel:Mozel)=>Record<string, any>),
	getSourceId?:string|((mozel:Mozel)=>string),
	getTargetId?:string|((mozel:Mozel)=>string),
	isSelected?:string|((mozel:Mozel)=>boolean),
	setSelected?:string|((mozel:Mozel, selected:boolean)=>void)
}

export default class GenericEdgeMapping extends EdgeMappingAbstract<Mozel> {
	protected options:GenericEdgeMappingOptions;

	constructor(cy:Core, model:Mozel, collection:Collection<Mozel>, options:GenericEdgeMappingOptions = {}) {
		super(cy, model, collection);
		this.options = options;
	}

	getElementId(model: Mozel):string {
		const getElementId = this.options.getElementId;
		if(!getElementId) return this.getId(model);
		if(isFunction(getElementId)) return getElementId(model);

		let value = model.$path(getElementId);
		value = check(value, IS_ALPHANUMERIC, 'elementId');
		return value.toString();
	}

	getData(model: Mozel): Record<string, any> {
		const getData = this.options.getData;
		if(!getData) return {};
		if(isFunction(getData)) return getData(model);

		const value = model.$path(getData);
		if(!value) return {};

		if(!(value instanceof Mozel)) {
			throw new Error("Data property must be a Mozel.");
		}
		return value.$export();
	}

	getSourceId(model: Mozel): string {
		const getSourceId = this.options.getSourceId;
		if(!getSourceId) return;
		if(isFunction(getSourceId)) return getSourceId(model);

		let value = model.$path(getSourceId);
		if(!value) return;

		value = check<string>(value, isAlphanumeric, 'sourceId');
		return value.toString();
	}

	getTargetId(model: Mozel): string {
		const getTargetId = this.options.getTargetId;
		if(!getTargetId) return;
		if(isFunction(getTargetId)) return getTargetId(model);

		let value = model.$path(getTargetId);
		if(!value) return;

		value = check(value, IS_ALPHANUMERIC, 'targetId');
		return value.toString();
	}

	isSelected(model: Mozel): boolean {
		const isSelected = this.options.isSelected;
		if(!isSelected) return;
		if(isFunction(isSelected)) return isSelected(model);

		const value = model.$path(isSelected);
		if(!value) return false;

		return check(value, IS_BOOLEAN, 'selected');
	}

	setSelected(model: Mozel, selected: boolean): void {
		const setSelected = this.options.setSelected;
		if(!setSelected) return;
		if(isFunction(setSelected)) return setSelected(model, selected);

		model.$set(setSelected, selected);
	}
}
