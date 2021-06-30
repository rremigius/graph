import cytoscape from "cytoscape";
import GraphModel from "./models/GraphModel";
import {deep, MozelFactory, schema} from "mozel";
import NodeModel from "./models/NodeModel";
import RelationModel from "./models/RelationModel";
import {alphanumeric, check, instanceOf} from "validation-kit";
import {debounce} from "lodash";

import log from "./Log";
// @ts-ignore
import fcose from "cytoscape-fcose";
import {MozelData} from "mozel/dist/Mozel";
import EntityModel from "./models/EntityModel";

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

	private debouncedLayout = debounce(this.applyLayout.bind(this));
	private updatesNextTick:Record<alphanumeric, EntityModel> = {};

	public readonly model:GraphModel;

	constructor(container:HTMLElement) {
		check(container, instanceOf(HTMLElement), "HTMLElement", "container");
		this.cy = cytoscape({
			container: container
		});
		this.modelFactory = new GraphModelFactory();
		this.model = this.modelFactory.create(GraphModel);
		this.initWatchers();
		this.initInteractions();
	}

	initWatchers() {
		// Watch nodes
		this.model.$watch(schema(GraphModel).nodes.$ + '.*', () => {
			this.updateNodes();
		}, {debounce: 0});

		// Watch relations
		this.model.$watch(schema(GraphModel).relations.$ + '.*', () => {
			this.updateRelations();
		}, {debounce: 0});

		// Watch node properties
		this.model.$watch(schema(GraphModel).nodes.$ + '.*', ({newValue, oldValue}) => {
			// These changes are for the shallow watcher to handle
			if(!(newValue instanceof NodeModel) || !(oldValue instanceof NodeModel)) return;
			if(newValue.gid !== oldValue.gid) return;

			this.updateNextTick(newValue);
		}, {deep});
	}

	initInteractions() {
		// When a node is dropped
		this.cy.on('free', event => {
			this.fixNode(event.target);
		});
	}

	setData(data:MozelData<GraphModel>) {
		log.log("Settin data", data);
		this.model.$setData(data);
	}

	findNodeElement(node:NodeModel) {
		return this.cy.$id(node.gid.toString());
	}

	findRelationElement(relation:RelationModel) {
		return this.cy.$id(relation.gid.toString());
	}

	updateNodes() {
		log.log("Updating nodes");

		// Remove node elements that have no counterpart in model
		this.cy.nodes()
			.filter(node => !this.getNodeModel(node))
			.remove();

		// Create missing node elements for node models
		this.model.nodes.each(node => {
			const el = this.findNodeElement(node);
			if(!el.length) {
				this.addNodeElement(node);
			}
		});

		this.debouncedLayout();
	}

	updateNextTick(entity:EntityModel) {
		log.log(`Updating entity ${entity.gid} next tick.`);
		this.updatesNextTick[entity.gid] = entity;
		setTimeout(()=>{
			const numUpdates = Object.keys(this.updatesNextTick).length;
			if(!numUpdates) return; // already done
			log.log(`Applying ${numUpdates} scheduled updates this tick.`);

			for(let gid in this.updatesNextTick) {
				const entity = this.updatesNextTick[gid];
				if(entity instanceof NodeModel) this.updateNodeElement(entity);
				if(entity instanceof RelationModel) this.updateEdgeElement(entity);
			}
			// Clear updates
			this.updatesNextTick = {};
		})
	}

	updateNodeElement(node:NodeModel) {
		log.log("Updating node element");
		const ele = this.getNodeElement(node);
		ele.position({x: node.x, y: node.y});
	}

	updateEdgeElement(relation:RelationModel) {
		log.log("Updating edge element");
		// nothing yet
	}

	updateRelations() {
		log.log("Updating relations");

		// Remove relation elements that have no counterpart in model
		this.cy.edges()
			.filter(edge => !this.getRelationModel(edge))
			.remove();

		// Create missing edge elements for relation models
		this.model.relations.each(relation => {
			const el = this.findRelationElement(relation);
			if(!el.length) {
				this.addEdgeElement(relation);
			}
		});

		this.debouncedLayout();
	}

	async applyLayout() {
		const elements = this.cy.filter(ele => {
			if(ele.isNode()) return !this.isFixedNode(ele);
			if(ele.isEdge()) return !this.isFixedEdge(ele);
			return false;
		});
		log.log(`Applying layout to ${elements.nodes().length} nodes.`);

		const options = {
			name: 'fcose',
			fit: elements.nodes().length === this.cy.nodes().length // don't fit when applying partial layout
		} as any; // TS: otherwise BaseLayout does not accept enough options

		const layout = elements.layout(options);
		layout.run();

		await layout.promiseOn('layoutstop');
		this.fixNodes(elements.nodes());
	}

	private fixNodes(nodes:cytoscape.NodeCollection) {
		nodes.each(ele => {
			this.fixNode(ele);
		});
	}

	private fixNode(ele:cytoscape.NodeSingular) {
		log.log(`Fixing node`);
		const node = this.getNodeModel(ele);
		if(!node) return;
		const {x,y} = ele.position(); // make a copy of the values, because the cytoscape position will update after setting the first coordinate
		node.x = x;
		node.y = y;
		node.fixed = true;
		return node;
	}

	private addNodeElement(node:NodeModel) {
		log.log(`Adding node element`);
		return this.cy.add({
			group: 'nodes',
			data: {
				id: node.gid.toString()
			}
		});
	}

	private addEdgeElement(relation:RelationModel) {
		log.log(`Adding edge element`);
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
		return this.model.nodes.find((node:NodeModel) => node.gid.toString() === nodeElement.id());
	}

	private getRelationModel(edge:cytoscape.EdgeSingular) {
		return this.model.relations.find((relation:RelationModel) => relation.gid.toString() === edge.id());
	}

	private isFixedNode(ele:cytoscape.NodeSingular) {
		return this.getNodeModel(ele).fixed === true;
	}

	private isFixedEdge(ele:cytoscape.EdgeSingular) {
		const source = ele.source();
		const target = ele.target();
		return this.isFixedNode(source) && this.isFixedNode(target);
	}

	private getNodeElement(node:NodeModel):cytoscape.NodeSingular|undefined {
		const ele = this.cy.getElementById(node.gid.toString());
		return ele.isNode() ? ele : undefined;
	}

	private getEdgeElement(relation:NodeModel):cytoscape.EdgeSingular|undefined {
		const ele = this.cy.getElementById(relation.gid.toString());
		return ele.isEdge() ? ele : undefined;
	}
}