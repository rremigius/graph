/**
 * DEPRECATED
 */

import cytoscape, {LayoutOptions} from "cytoscape";
import Mozel, {Collection, deep, immediate} from "mozel";
import {alphanumeric, Constructor} from "validation-kit";
import {debounce, forEach, includes, isPlainObject, isString} from "lodash";

import log from "./Log";
import PropertyWatcher from "mozel/dist/PropertyWatcher";
import Layout from "./Layout";
import ConcentricLayout from "./layouts/ConcentricLayout";
import FCoseLayout from "./layouts/FCoseLayout";
import edgehandles from 'cytoscape-edgehandles';
// @ts-ignore
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';

cytoscape.use( edgehandles as any );
cytoscape.use( contextMenus );

export type GraphAbstractOptions = {
	useEdgeHandles?:boolean
};

export default abstract class ModelGraphAbstract_DEPRECATED<G extends Mozel, N extends Mozel, R extends Mozel> {
	static get cytoscape() {
		return cytoscape;
	}
	layouts:Record<string, typeof Layout> = {
		concentric: ConcentricLayout,
		fcose: FCoseLayout
	};

	private updatesNextTick:Record<alphanumeric, N|R> = {};
	private readonly initializing:Promise<any> = undefined;
	protected readonly options:GraphAbstractOptions;
	private NodeModel:Constructor<N>;
	private RelationModel:Constructor<R>;

	public readonly cy:cytoscape.Core;
	public _model:G;
	public get model() {
		return this._model;
	}
	public set model(model:G) {
		this.setModel(model);
	}

	private watchers:PropertyWatcher[] = [];

	protected constructor(
		cytoscape:cytoscape.Core,
		NodeModel:Constructor<N>,
		RelationModel:Constructor<R>,
		options?:GraphAbstractOptions
	) {
		options = options || {};
		this.options = options;
		this.NodeModel = NodeModel;
		this.RelationModel = RelationModel;

		this.cy = cytoscape;

		if(this.options.useEdgeHandles !== false && this.cy.edgehandles) {
			log.info("Initializing edge handles.");
			this.cy.edgehandles({
				complete: this.onEdgeDragged.bind(this)
			});
		}

		this.initEvents();

		this.applyGraphStyles();
		this.applyGraphUIStyles();
	}

	initEvents() {
		// When a node is dropped
		this.cy.on('dragfree', event => {
			this.fixNodeElement(event.target);
		});
		this.cy.on('select', event => {
			const entity = this.getEntityModel(event.target);
			if(!entity) return;
			this.setSelected(entity, true);
		});
		this.cy.on('unselect', event => {
			const entity = this.getEntityModel(event.target);
			if(!entity) return;
			this.setSelected(entity, false);
		});
		this.cy.on('remove', event => {
			const entity = this.getEntityModel(event.target);
			if(!entity) return;

			if(this.isNode(entity)) {
				this.getNodes().remove(entity);
			}
			if(this.isRelation(entity)) {
				this.getRelations().remove(entity);
			}
		});
	}

	initWatchers(model:G) {
		const nodesPath = this.getGraphModelNodesPath();
		const relationsPath = this.getGraphModelRelationsPath();

		this.watchers = [
			// Watch nodes
			model.$watch(nodesPath + '.*', () => {
				this.updateNodes();
			}, {debounce: 0, immediate}),

			// Watch relations
			model.$watch(relationsPath + '.*', () => {
				this.updateRelations();
			}, {debounce: 0, immediate}),

			// Watch node properties
			model.$watch(nodesPath + '.*', ({newValue, oldValue}) => {
				// These changes are for the shallow watcher to handle
				if(!this.isNode(newValue) || !this.isNode(oldValue)) return;
				if(newValue.gid !== oldValue.gid) return;

				this.updateNextTick(newValue);
			}, {deep, immediate}),

			// Watch relation properties
			this.model.$watch(relationsPath + '.*', ({newValue, oldValue}) => {
				// These changes are for the shallow watcher to handle
				if(!this.isRelation(newValue) || !this.isRelation(oldValue)) return;
				if(newValue.gid !== oldValue.gid) return;

				this.updateNextTick(newValue);
			}, {deep, immediate}),
		];
	}

	protected applyGraphStyles() {
		const style = this.cy.style() as any; // TS: type seems to be missing
		style.selector('node')
			.style('border-width', 1)
			.style('border-color', '#ccc');
		style.selector(':selected')
			.style('background-blacken', 0.5);
		style.selector('node:parent')
			.style('background-blacken', -0.5);
		style.selector('edge')
			.style('target-arrow-shape', 'triangle')
			.style('curve-style', 'bezier')
			.style('arrow-scale', 1.3);

		return style;
	}

	protected applyGraphUIStyles() {
		const style = this.cy.style() as any; // TS: type seems to be missing

		// Edge handle
		style.selector('node.eh-handle')
			.style('width', 20)
			.style('height', 20)
			.style('background-color', '#4dff00');
	}

	deinitWatchers(model:G) {
		for(let watcher of this.watchers) {
			model.$removeWatcher(watcher);
		}
	}

	setModel(model:G) {
		if(this.model) {
			this.deinitWatchers(this.model);
		}
		this._model = model;
		this.initWatchers(model);
	}

	updateNodes() {
		log.log("Updating nodes");

		// Remove node elements that have no counterpart in model
		this.cy.nodes()
			.filter(node => !this.getNodeModel(node))
			.remove();

		// Create missing node elements for node models
		this.getNodes().each(node => {
			if(!this.isNode(node)) {
				log.error("Invalid node:", node);
				return;
			}

			const el = this.getNodeElement(node);
			if(!el || !el.length) {
				this.addNodeElement(node);
			}
		});
	}

	updateNextTick(entity:N|R) {
		log.log(`Updating entity next tick: ${entity}`);
		this.updatesNextTick[entity.gid] = entity;

		setTimeout(()=>{
			const numUpdates = Object.keys(this.updatesNextTick).length;
			if(!numUpdates) return; // already done

			log.log(`Applying ${numUpdates} scheduled updates this tick.`);

			for(let gid in this.updatesNextTick) {
				const entity = this.updatesNextTick[gid];
				if(this.isNode(entity)) this.updateNodeElement(entity);
				if(this.isRelation(entity)) this.updateEdgeElement(entity);
			}
			// Clear updates
			this.updatesNextTick = {};
		})
	}

	updateNodeElement(node:N) {
		log.log(`Updating node element: ${node}`);
		const ele = this.getNodeElement(node);
		if(!ele) {
			log.error(`No node element found for ${node}`);
			return;
		}

		// Set position
		const position = this.getPosition(node);
		if(position.x !== undefined && position.y !== undefined) { // don't move the element if no position was specified
			ele.position({x: position.x, y: position.y});
		}

		// Set data
		let data = this.getElementData(node);
		if(!isPlainObject(data)) data = {};
		forEach(data, (value, key) => {
			if(includes(['id', 'classes', 'gid', 'parent'], key)) return; // reserved keys
			ele.data(key, value);
		});

		// Set GID
		ele.data('gid', node.gid);

		// Set state
		this.isSelected(node) ? ele.select() : ele.unselect();
	}

	updateEdgeElement(relation:R) {
		log.log(`Updating edge element: ${relation}`);
		const ele = this.getEdgeElement(relation);
		if(!ele) {
			log.error(`No edge element found for ${relation}`);
			return;
		}

		// Set data
		let data = this.getElementData(relation);
		if(!isPlainObject(data)) data = {};
		forEach(data, (value, key) => {
			if(includes(['id', 'classes', 'source', 'target', 'gid', 'parent'], key)) return; // reserved keys
			ele.data(key, value);
		});

		// Set GID
		ele.data('gid', relation.gid);

		// Set state
		this.isSelected(relation) ? ele.select() : ele.unselect();
	}

	updateRelations() {
		log.log("Updating relations");

		// Remove relation elements that have no counterpart in model
		this.cy.edges()
			.filter(edge => !this.getRelationModel(edge))
			.remove();

		// Create missing edge elements for relation models
		this.getRelations().each(relation => {
			if(!this.isRelation(relation)) {
				log.error("Invalid relation:", relation);
				return;
			}
			const el = this.getEdgeElement(relation);
			if(!el || !el.length) {
				this.addEdgeElement(relation);
			}
		});
	}

	async applyLayout(options:LayoutOptions|string, nodes:N[] = undefined, relations:R[] = undefined) {
		if(!nodes) nodes = this.getNodes().filter(node => !this.isFixed(node));
		if(!relations) relations = this.getRelations().filter(relation => {
			return includes(nodes, this.getRelationSource(relation))
				|| includes(nodes, this.getRelationTarget(relation));
		});

		let elements = this.cy.collection();
		for(let node of nodes) {
			const ele = this.getNodeElement(node);
			if(ele) elements = elements.union(ele);
		}
		for(let relation of relations) {
			const ele = this.getEdgeElement(relation);
			if(ele) elements = elements.union(ele);
		}

		log.log(`Applying layout to ${elements.nodes().length} nodes.`);

		let layout:Layout;
		if(isString(options)) {
			const SpecificLayout = this.layouts[options] || Layout;
			layout = new SpecificLayout({name: options});
		} else {
			layout = new Layout(options);
		}
		const cyLayout = layout.apply(elements, {
			animate: true,
			fit: elements.nodes().length === this.cy.nodes().length, // don't fit when applying partial layout,
		});

		await cyLayout.promiseOn('layoutstop');
		this.fixNodeElements(elements.nodes());
	}

	fixNodeElements(nodes:cytoscape.NodeCollection) {
		nodes.each(ele => {
			this.fixNodeElement(ele);
		});
	}

	fixNodeElement(ele:cytoscape.NodeSingular) {
		const node = this.getNodeModel(ele);
		log.log(`Fixing node: ${node}`);

		if(!node) return;
		const {x, y} = ele.position();
		this.setPosition(node, x, y);
		this.setFixed(node, true);
		return node;
	}

	addNodeElement(node:N) {
		log.log(`Adding node element: ${node}`);
		const group = this.getGroup(node);

		const data:Record<string,any> = {
			id: this.getId(node)
		};
		if(group) data.parent = this.getId(group);

		const ele = this.cy.add({
			group: 'nodes',
			data: data
		});
		ele.scratch('node', node);
		this.updateNodeElement(node);
		return ele;
	}

	addEdgeElement(relation:R) {
		log.log(`Adding edge element: ${relation}`);
		const ele = this.cy.add({
			group: 'edges',
			data: {
				id: this.getId(relation),
				source: this.getId(this.getRelationSource(relation)),
				target: this.getId(this.getRelationTarget(relation))
			}
		});
		ele.scratch('relation', relation);
		this.updateEdgeElement(relation);
		return ele;
	}

	getNodeModel(nodeElement:cytoscape.NodeSingular) {
		return this.getNodes().find(node => this.isNode(node) && this.getId(node) === nodeElement.id()) as N;
	}

	getRelationModel(edge:cytoscape.EdgeSingular) {
		return this.getRelations().find(relation => this.isRelation(relation) && this.getId(relation) === edge.id()) as R;
	}

	getEntityModel(ele:cytoscape.Singular) {
		if(ele.isNode()) return this.getNodeModel(ele);
		if(ele.isEdge()) return this.getRelationModel(ele);
	}

	isFixedNodeElement(ele:cytoscape.NodeSingular) {
		const node = this.getNodeModel(ele);
		return !node || this.isFixed(node);
	}

	isFixedEdgeElement(ele:cytoscape.EdgeSingular) {
		const source = ele.source();
		const target = ele.target();
		return this.isFixedNodeElement(source) && this.isFixedNodeElement(target);
	}

	getNodeElement(node:N):cytoscape.NodeSingular|undefined {
		const ele = this.cy.getElementById(this.getId(node));
		return ele.isNode() ? ele : undefined;
	}

	getEdgeElement(relation:R):cytoscape.EdgeSingular|undefined {
		const ele = this.cy.getElementById(this.getId(relation));
		return ele.isEdge() ? ele : undefined;
	}

	getId(entity:N|R):string {
		return entity.gid.toString();
	}

	unfixNodes(nodes?:N[]) {
		if(!nodes) nodes = this.getNodes().toArray();
		for(let node of nodes) {
			this.setFixed(node, false);
		}
	}
	isNode(entity:any):entity is N {
		return entity instanceof this.NodeModel;
	}
	isRelation(entity:any):entity is R {
		return entity instanceof this.RelationModel;
	}

	// Event handlers

	onEdgeDragged(source:cytoscape.NodeSingular, target:cytoscape.NodeSingular, created:cytoscape.Collection) {
		// Remove created elements, wait for model instead
		created.remove();

		const sourceModel = source.scratch('node');
		const targetModel = target.scratch('node');
		if(!sourceModel || !targetModel) return;

		return this.getRelations().add({
			source: sourceModel,
			target: targetModel
		}, true);
	}

	// For override

	abstract getElementData(entity:N|R):object;

	abstract isFixed(node:N):boolean;
	abstract setFixed(node:N, fixed:boolean):void;
	abstract isSelected(entity:N|R):boolean;
	abstract setSelected(entity:N|R, selected:boolean):void;

	abstract getPosition(node:N):{x:number, y:number};
	abstract setPosition(node:N, x:number, y:number):void;
	abstract getRelationSource(relation:R):N;
	abstract getRelationTarget(relation:R):N;
	abstract getGraphModelNodesPath():string;
	abstract getGraphModelRelationsPath():string;
	abstract getNodes():Collection<N>;
	abstract getRelations():Collection<R>;
	abstract getGroup(node:N):N|undefined;
}
