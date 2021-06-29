import cytoscape from "cytoscape";
import GraphModel from "./models/GraphModel";
import {MozelFactory, schema} from "mozel";
import NodeModel from "./models/NodeModel";
import RelationModel from "./models/RelationModel";
import {check, instanceOf} from "validation-kit";
import {MozelData} from "mozel/dist/Mozel";

// @ts-ignore
import fcose from "cytoscape-fcose";

cytoscape.use(fcose);

class GraphModelFactory extends MozelFactory {
	initDependencies(): void {
		this.register(NodeModel);
		this.register(RelationModel);
	}
}

export default class Graph {
	private cy:cytoscape.Core;
	private modelFactory:GraphModelFactory;

	public readonly model:GraphModel;

	constructor(container:HTMLElement) {
		check(container, instanceOf(HTMLElement), "HTMLElement", "container");
		this.cy = cytoscape({
			container: container
		});
		this.modelFactory = new GraphModelFactory();
		this.model = this.modelFactory.create(GraphModel);
		this.initWatchers();
	}

	initWatchers() {

	}

	setData(data:{nodes?:MozelData<NodeModel>[], relations?:MozelData<RelationModel>[]}) {
		this.model.nodes.setData(data.nodes, true);
		this.model.relations.setData(data.relations, true);
		this.forceUpdate();
		this.applyLayout();
	}

	findNodeElement(node:NodeModel) {
		return this.cy.$id(node.gid.toString());
	}

	findRelationElement(relation:RelationModel) {
		return this.cy.$id(relation.gid.toString());
	}

	forceUpdate() {
		this.updateNodes();
		this.updateRelations();
	}

	updateNodes() {
		// Remove node elements that have no counterpart in model
		this.cy.nodes()
			.filter(node => !this.getNodeModel(node))
			.remove();

		// Create missing node elements for node models
		this.model.nodes.each(node => {
			const el = this.findNodeElement(node);
			if(!el.length) {
				this.addNode(node);
			}
		});
	}

	updateRelations() {
		// Remove relation elements that have no counterpart in model
		this.cy.edges()
			.filter(edge => !this.getRelationModel(edge))
			.remove();

		// Create missing edge elements for relation models
		this.model.relations.each(relation => {
			const el = this.findRelationElement(relation);
			if(!el.length) {
				this.addRelation(relation);
			}
		});
	}

	applyLayout() {
		this.cy.nodes()
			.filter(node => {
				return !this.getNodeModel(node).fixed
			})
			.layout({
				name: 'fcose'
			}).run();
	}

	private addNode(node:NodeModel) {
		return this.cy.add({
			group: 'nodes',
			data: {
				id: node.gid.toString()
			}
		});
	}

	private addRelation(relation:RelationModel) {
		return this.cy.add({
			group: 'edges',
			data: {
				id: relation.gid.toString(),
				source: relation.source.gid.toString(),
				target: relation.target.gid.toString()
			}
		});
	}

	private getNodeModel(nodeElement:cytoscape.NodeSingular) {
		// using toArray because Collection.find does not work (yet)
		return this.model.nodes.toArray().find((node:NodeModel) => node.gid.toString() === nodeElement.id());
	}

	private getRelationModel(edge:cytoscape.EdgeSingular) {
		// using toArray because Collection.find does not work (yet)
		return this.model.relations.toArray().find((relation:RelationModel) => relation.gid.toString() === edge.id());
	}
}