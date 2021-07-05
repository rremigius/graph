import {Core} from "cytoscape";
import Mozel, {Collection} from "mozel";
import {check, instanceOf} from "validation-kit";
import EdgeModelMappingAbstract from "./EdgeModelMappingAbstract";
import {PropertyValue} from "mozel/dist/Property";

export default abstract class NodeToEdgeMappingAbstract<N extends Mozel> extends EdgeModelMappingAbstract<N> {
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
		const target = check<Mozel>(property, instanceOf(Mozel), 'Mozel', 'property');
		return this.getId(target);
	}
}
