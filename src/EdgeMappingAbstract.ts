import Mozel from "mozel";
import {EdgeSingular} from "cytoscape";
import ModelMappingAbstract from "./MappingAbtract";
import {isEmpty, isNil} from "./utils";

export default abstract class EdgeMappingAbstract<M extends Mozel> extends ModelMappingAbstract<M, EdgeSingular> {
	abstract getSourceId(model:M):string;
	abstract getTargetId(model:M):string;

	get reservedKeys() {
		return super.reservedKeys.concat(['source', 'target']);
	}
	get elementGroup(): "edges" | "nodes" {
		return "edges";
	}
	isMappingElement(value: unknown): value is EdgeSingular {
		return this.isEdge(value);
	}

	shouldHaveElement(model: M): boolean {
		return !isEmpty(this.getSourceId(model)) && !isEmpty(this.getTargetId(model));
	}

	protected _createMinimalElement(model: M, data: Record<string, any>) {
		return this.cy.add({
			group: this.elementGroup,
			data: {
				...data,
				source: this.getSourceId(model),
				target: this.getTargetId(model)
			}
		});
	}
	updateElement(model: M) {
		const ele = super.updateElement(model) as EdgeSingular;
		if(!ele) return;

		ele.data('source', this.getSourceId(model));
		ele.data('target', this.getTargetId(model));
		return ele;
	}
}

