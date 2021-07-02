import ModelGraphAbstract, {GraphAbstractOptions} from "./ModelGraphAbstract";
import NodeModel from "./models/NodeModel";
import RelationModel from "./models/RelationModel";
import {Collection, schema} from "mozel";
import GraphModel from "./models/GraphModel";
import EntityModel from "./models/EntityModel";
import {get} from "lodash";
import cytoscape, {Singular} from "cytoscape";
import md5 from "md5";

export type GraphOptions = GraphAbstractOptions & {
	labelColours?:Record<string, string>;
	generateDefaultLabelColours?:boolean
}

export default class Graph extends ModelGraphAbstract<GraphModel, NodeModel, RelationModel> {
	static get GraphModel() { return GraphModel }

	protected readonly options:GraphOptions;

	constructor(cytoscape:cytoscape.Core, options?:GraphOptions) {
		super(cytoscape, NodeModel, RelationModel, options);
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

	/* ModelGraphAbstract implementations */

	isFixed(node:NodeModel):boolean {
		return node.fixed === true;
	}

	setFixed(node:NodeModel, fixed:boolean) {
		node.fixed = fixed;
	}

	isSelected(node:NodeModel):boolean {
		return node.selected === true;
	}

	setSelected(node:NodeModel, selected:boolean) {
		node.selected = selected;
	}

	getPosition(node:NodeModel):{x:number, y:number} {
		return {x: node.x, y: node.y};
	}

	setPosition(node:NodeModel, x:number, y:number) {
		node.x = x;
		node.y = y;
	}

	getRelationSource(relation:RelationModel):NodeModel {
		return relation.source;
	}

	getRelationTarget(relation:RelationModel):NodeModel {
		return relation.target;
	}

	getGraphModelNodesPath():string {
		return schema(GraphModel).nodes.$;
	}

	getGraphModelRelationsPath():string {
		return schema(GraphModel).relations.$;
	}

	getNodes(): Collection<NodeModel> {
		return this.model.nodes;
	}

	getRelations(): Collection<RelationModel> {
		return this.model.relations;
	}

	getGroup(node:NodeModel) {
		return node.group;
	}
}