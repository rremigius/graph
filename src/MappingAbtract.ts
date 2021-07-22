import Mozel, {Collection, deep, immediate} from "mozel";
import cytoscape, {Core, EdgeSingular, EventObject, NodeSingular} from "cytoscape";
import PropertyWatcher from "mozel/dist/PropertyWatcher";
import {alphanumeric, check, Constructor} from "validation-kit";
import Log from "./Log";
import {forEach, includes, isPlainObject, uniqueId} from "lodash";
import {CollectionItemAddedEvent, CollectionItemRemovedEvent} from "mozel/dist/Collection";
import {get, isFunction} from "./utils";

const log = Log.instance("mapping");

export default abstract class MappingAbstract<M extends Mozel, E extends NodeSingular|EdgeSingular> {
	public static readonly CYTOSCAPE_NAMESPACE = 'modelGraph';
	protected readonly cy:Core;
	protected readonly model:Mozel;
	protected readonly path:string;
	protected readonly Model:Constructor<M>;
	protected models:Collection<M>;

	protected watchers:PropertyWatcher[] = [];
	protected modelWatchers:Record<alphanumeric, PropertyWatcher[]> = {};
	protected updatesNextTick:Record<alphanumeric, M> = {};

	public readonly id:string;

	constructor(cy:Core, model:Mozel, collection:Collection<M>) {
		this.cy = cy;
		this.model = model;
		this.path = collection.parent.$getPathArrayFrom(model).concat(collection.relation).join('.'); // will throw if not related
		this.models = collection;
		this.Model = collection.getType() as Constructor<M>;
		this.id = uniqueId();
	}

	abstract get elementGroup():'edges'|'nodes';
	abstract isMappingElement(value:any):value is E;
	abstract isSelected(model:M):boolean;
	abstract setSelected(model:M, selected:boolean):void;
	abstract getData(model:M):Record<string, any>;

	get reservedKeys() {
		return ['id', 'gid', 'classes'];
	}

	isNode(value:unknown) {
		return isFunction(get(value, 'isNode')) && (value as cytoscape.SingularData).isNode();
	}

	isEdge(value:unknown) {
		return isFunction(get(value, 'isEdge')) && (value as cytoscape.SingularData).isEdge();
	}

	isMappingModel(value:unknown):value is M {
		return value instanceof this.Model;
	}

	start() {
		this.initModelToCytoScape();
		this.initCytoScapeToModel();
	}

	protected initCytoScapeToModel() {
		this.cy.on('select', this.onSelect);
		this.cy.on('unselect', this.onUnselect);
		this.cy.on('remove', this.onRemove);
	}

	protected initModelToCytoScape() {
		const path = this.path;

		this.watchers = [
			this.model.$watch(path, ({newValue}) => {
				if(newValue !== this.models) {
					this.models.events.added.off(this.onItemAdded);
					this.models.events.removed.off(this.onItemRemoved);
					this.models.each(item => this.removeItem(item));
					this.models = newValue as Collection<M>;
				}
				this.models.events.added.on(this.onItemAdded);
				this.models.events.removed.on(this.onItemRemoved);
				this.models.each(item => this.addItem(item));
			}, {immediate})
		];
	}

	stop() {
		for(let watcher of this.watchers) {
			this.model.$removeWatcher(watcher);
		}
		this.cy.off('select', this.onSelect);
		this.cy.off('unselect', this.onUnselect);
		this.cy.off('remove', this.onRemove);
		this.models.events.added.off(this.onItemAdded);
		this.models.events.removed.off(this.onItemRemoved);
	}

	protected onItemAdded = (event:CollectionItemAddedEvent<unknown>) => {
		const model = check<M>(event.item, item => this.isMappingModel(item), this.Model.name, 'item');
		this.addItem(model);
	}

	protected onItemRemoved = (event:CollectionItemRemovedEvent<unknown>) => {
		const model = check<M>(event.item, item => this.isMappingModel(item), this.Model.name, 'item');
		this.removeItem(model);
	}

	protected addItem(model:M) {
		log.log(`Model added: ${model}`)
		this.createElement(model);

		if(!(model.gid in this.modelWatchers)) this.modelWatchers[model.gid] = [];
		this.modelWatchers[model.gid].push(model.$watch('*', () => {
			this.updateNextTick(model);
		}));
	}
	protected removeItem(model:M) {
		log.log(`Model removed: ${model}`)

		forEach(this.modelWatchers[model.gid], watcher => model.$removeWatcher(watcher));

		const ele = this.getElement(model);
		if(ele) this.cy.remove(ele);
	}

	protected onSelect = (event:EventObject) => {
		const model = this.getModel(event.target);
		if(!model) return;
		this.setSelected(model, true);
	}
	protected onUnselect = (event:EventObject) => {
		const model = this.getModel(event.target);
		if(!model) return;
		this.setSelected(model, false);
	}
	protected onRemove = (event:EventObject) => {
		const entity = this.getModel(event.target);
		if(!entity) return;
		this.models.remove(entity);
	}

	getModel(element:E) {
		return this.models.find(node => this.isMappingModel(node) && this.getId(node) === element.id()) as M;
	}

	getId(node:Mozel):string {
		return node.gid.toString();
	}

	getElement(model:M):E|undefined {
		const ele = this.cy.getElementById(this.getElementId(model));
		return this.isMappingElement(ele) && ele.length ? ele : undefined;
	}
	getElementId(model:M):string {
		return this.getId(model);
	}

	shouldHaveElement(model:M):boolean {
		return true;
	}

	protected _createMinimalElement(model:M, data:Record<string, any>) {
		return this.cy.add({
			group: this.elementGroup,
			data: data
		});
	}
	createElement(model:M):E {
		if(!this.shouldHaveElement(model)) {
			log.log(`Skipping element creation for ${model}.`, model);
			return;
		}
		log.log(`Creating element: ${model}`);

		const data:Record<string,any> = {
			id: this.getElementId(model),
			gid: model.gid
		};
		const ele = this._createMinimalElement(model, data);
		ele.scratch(MappingAbstract.CYTOSCAPE_NAMESPACE, {
			mapping: this.id,
			model: model
		});
		this.updateElement(model);

		if(!this.isMappingElement(ele)) {
			throw new Error("Created element does not match the mapping type.");
		}
		return ele;
	}
	removeElement(model:M):boolean {
		const ele = this.getElement(model);
		if(!ele) return false;
		log.log(`Removing: ${model}`);
		this.cy.remove(ele);
		return true;
	}

	updateElement(model:M) {
		const ele = this.getElement(model);
		if(!ele) {
			return;
		}
		log.log(`Updating element: ${model}`);

		// Set data
		let data = this.getData(model);
		if(!isPlainObject(data)) data = {};
		forEach(data, (value, key) => {
			if(includes(this.reservedKeys, key)) return; // reserved keys
			ele.data(key, value);
		});
		return ele;
	}

	updateElements() {
		log.log(`Updating elements`);

		// Remove elements that have no counterpart in model
		this.cy.elements()
			.filter(ele => this.isMappingElement(ele) && !this.getModel(ele))
			.remove();

		// Create missing elements for (new) models
		this.models.each(model => {
			if(!this.isMappingModel(model)) {
				log.error("Invalid node:", model);
				return;
			}

			const ele = this.getElement(model);
			if(!ele) {
				this.createElement(model);
			}
		});
	}

	updateNextTick(entity:M) {
		log.log(`Updating entity next tick: ${entity}`);
		this.updatesNextTick[entity.gid] = entity;

		setTimeout(()=>{
			const numUpdates = Object.keys(this.updatesNextTick).length;
			if(!numUpdates) return; // already done

			log.log(`Applying ${numUpdates} scheduled updates this tick.`);

			for(let gid in this.updatesNextTick) {
				const entity = this.updatesNextTick[gid];
				if(this.isMappingModel(entity)) this.updateElement(entity);
			}
			// Clear updates
			this.updatesNextTick = {};
		})
	}
}

