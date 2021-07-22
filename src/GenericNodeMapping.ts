import NodeMappingAbstract from "./NodeMappingAbstract";
import Mozel, {Collection} from "mozel";
import {Core} from "cytoscape";
import {isBoolean, isFunction, isNumber, isPlainObject, isString} from "./utils";
import {check, isAlphanumeric} from "validation-kit";
import {IS_ALPHANUMERIC, IS_BOOLEAN} from "validation-kit/dist/validators";

export type GenericNodeMappingOptions = {
	getElementId?:string|((mozel:Mozel)=>string),
	getData?:string|((mozel:Mozel)=>Record<string, any>),
	getParentId?:string|((mozel:Mozel)=>string),
	getPosition?:string|((mozel:Mozel)=>{x:number, y:number}),
	setPosition?:string|((mozel:Mozel, x:number, y:number)=>void),
	isSelected?:string|((mozel:Mozel)=>boolean),
	setSelected?:string|((mozel:Mozel, selected:boolean)=>void)
}

export default class GenericNodeMapping extends NodeMappingAbstract<Mozel> {
	protected options:GenericNodeMappingOptions;

	constructor(cy:Core, model:Mozel, collection:Collection<Mozel>, options:GenericNodeMappingOptions = {}) {
		super(cy, model, collection);
		this.options = options;
	}

	getElementId(model: Mozel):string {
		const getElementId = this.options.getElementId;
		if(!getElementId) return this.getId(model);

		let value = isFunction(getElementId) ? getElementId(model) : model.$path(getElementId);
		value = check(value, IS_ALPHANUMERIC, 'elementId');
		return value.toString();
	}

	getData(model: Mozel): Record<string, any> {
		const getData = this.options.getData;
		if(!getData) return {};

		const value = isFunction(getData) ? getData(model) : model.$path(getData);
		if(!value) return;

		if(!(value instanceof Mozel)) {
			throw new Error("Data property must be a Mozel.");
		}
		return value.$export();
	}

	getParentId(model: Mozel):string|undefined {
		const getParentId = this.options.getParentId;
		if(!getParentId) return;

		let value = isFunction(getParentId) ? getParentId(model) : model.$path(getParentId);
		if(!value) return;

		value = check(value, IS_ALPHANUMERIC, 'parentId');
		return value.toString();
	}

	getPosition(model: Mozel): { x: number; y: number } {
		const getPosition = this.options.getPosition;
		if(!getPosition) return;

		const value = isFunction(getPosition) ? getPosition(model) : model.$path(getPosition);
		if(!value) return {x: 0, y: 0};

		if(!isPlainObject(value) || !isNumber((value as any).x) || !isNumber((value as any).y)) {
			throw new Error("Position did not return x,y coordinate.");
		}
		return value as unknown as {x:number, y:number}; // TS: checked above
	}

	setPosition(model: Mozel, x: number, y: number): void {
		const setPosition = this.options.setPosition;
		if(!setPosition) return;
		if(isFunction(setPosition)) {
			setPosition(model, x, y);
			return;
		}

		model.$set(setPosition, {x,y}, true, true);
	}

	isSelected(model: Mozel): boolean {
		const isSelected = this.options.isSelected;
		if(!isSelected) return;

		const value = isFunction(isSelected) ? isSelected(model) : model.$path(isSelected);
		if(!value) return false;

		return check(value, IS_BOOLEAN, 'selected');
	}

	setSelected(model: Mozel, selected: boolean): void {
		const setSelected = this.options.setSelected;
		if(!setSelected) return;
		if(isFunction(setSelected))  {
			setSelected(model, selected);
			return;
		}

		model.$set(setSelected, selected);
	}

}
