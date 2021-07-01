import GraphAbstract, {GraphAbstractOptions} from "./GraphAbstract";
import NodeModel from "./models/NodeModel";
import RelationModel from "./models/RelationModel";
import {MozelFactory} from "mozel";
import GraphModel from "./models/GraphModel";
import {MozelData} from "mozel/dist/Mozel";
import EntityModel from "./models/EntityModel";
import {get} from "lodash";
import {Singular} from "cytoscape";
import md5 from "md5";

export type GraphOptions = GraphAbstractOptions & {
	labelColours?:Record<string, string>;
	generateDefaultLabelColours?:boolean
}

export default class Graph extends GraphAbstract<GraphModel, NodeModel, RelationModel> {
	factory:MozelFactory;

	protected readonly options:GraphOptions;

	constructor(options?:GraphOptions) {
		super(options);
		const factory = new MozelFactory();
		factory.register(GraphModel);
		factory.register(NodeModel);
		factory.register(RelationModel);
		this.factory = factory;
	}

	protected applyGraphStyles() {
		const style = super.applyGraphStyles();
		style.selector('node')
			.style('label', (ele:Singular) => {
				const node = ele.scratch('node');
				return node ? node.getCaption() : '';
			})
			.style('background-color', (ele:Singular) => {
				const entity = this.getEntityModel(ele);
				return this.getEntityColour(entity);
			});
		style.selector('edge')
			.style('label', (ele:Singular) => {
				const relation = ele.scratch('relation');
				return relation ? relation.getCaption() : '';
			});
	}

	createModel(data:MozelData<GraphModel>) {
		return this.factory.create(GraphModel, data);
	}

	getElementData(entity:NodeModel|RelationModel):object {
		return entity.data.$export();
	}

	getEntityColour(entity?:EntityModel) {
		let colour = '#777';

		if(!entity) return colour;

		colour = this.options.generateDefaultLabelColours !== false
			? this.generateDefaultLabelColour(entity.labels.get(0))
			: colour;

		for(let label of entity.labels.toArray().reverse()) {
			colour = get(this.options, ['labelColours', label], colour)
		}

		return colour;
	}

	generateDefaultLabelColour(label?:string) {
		if(!label) return '#777';
		const hash = md5(label);
		return '#' + hash.substring(0,6);
	}
}