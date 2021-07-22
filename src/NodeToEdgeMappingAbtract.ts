import {Core} from "cytoscape";
import Mozel, {Collection} from "mozel";
import {check, instanceOf} from "validation-kit";
import EdgeMappingAbstract from "./EdgeMappingAbstract";
import {PropertyValue} from "mozel/dist/Property";
import {isString} from "./utils";
import {IS_STRING} from "validation-kit/dist/validators";

export default abstract class NodeToEdgeMappingAbstract<N extends Mozel> extends EdgeMappingAbstract<N> {
	property:string;
	direction:'out'|'in';

	constructor(cy:Core, model:Mozel, collection:Collection<N>, property:string, direction:'out'|'in' = 'out') {
		super(cy, model, collection);
		this.property = property;
		this.direction = direction;
	}

	getData(model: N): Record<string, any> {
		return {};
	}

	getElementId(model: N): string {
		return super.getElementId(model) + "_" + this.property;
	}

	getSourceId(model: N): string {
		if(this.direction === 'in') {
			return this.getOtherId(model);
		}
		return this.getId(model);
	}

	getTargetId(model: N): string {
		if(this.direction === 'in') {
			return this.getId(model);
		}
		return this.getOtherId(model);
	}

	getOtherId(model: N) {
		let property:PropertyValue;
		try {
			property = model.$get(this.property);
			if(!property) return;
		} catch(e) {
			return;
		}
		if(property instanceof Mozel) {
			return this.getId(property);
		}
		return check(property, IS_STRING, 'source/target id');
	}
}
