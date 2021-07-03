import Mozel, {Collection, deep, immediate} from "mozel";
import {Core, EventObject, SingularData} from "cytoscape";
import PropertyWatcher from "mozel/dist/PropertyWatcher";
import {alphanumeric, Constructor} from "validation-kit";
import log from "./Log";
import {forEach, includes, isPlainObject, uniqueId} from "lodash";
import data from "../demos/default/data";

export default abstract class ModelMappingAbstract<M extends Mozel, E extends SingularData> {
	public static readonly CYTOSCAPE_NAMESPACE = 'modelGraph';
	protected readonly cy:Core;
	protected readonly model:Mozel;
	protected readonly path:string;
	protected readonly models:Collection<M>;
	protected readonly Model:Constructor<M>;

	protected watchers:PropertyWatcher[] = [];
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

	isMappingModel(value:any):value is M {
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
			// Check that collection stays
			this.model.$watch(path, ({newValue}) => {
				if(newValue !== this.models) {
					log.error("Collection should not be replaced!");
					this.stop();
				}
			}, {immediate}),

			// Watch models
			this.model.$watch(path + '.*', () => {
				this.updateElements();
			}, {debounce: 0, immediate}),

			// Watch properties
			this.model.$watch(path + '.*', ({newValue, oldValue}) => {
				// These changes are for the shallow watcher to handle
				if(!this.isMappingModel(newValue) || !this.isMappingModel(oldValue)) return;
				if(newValue.gid !== oldValue.gid) return;

				this.updateNextTick(newValue);
			}, {deep, immediate}),
		];
	}

	stop() {
		for(let watcher of this.watchers) {
			this.model.$removeWatcher(watcher);
		}
		this.cy.off('select', this.onSelect);
		this.cy.off('unselect', this.onUnselect);
		this.cy.off('remove', this.onRemove);
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

	getId(node:M):string {
		return node.gid.toString();
	}

	getElement(model:M):E|undefined {
		const ele = this.cy.getElementById(this.getId(model));
		return this.isMappingElement(ele) && ele.length ? ele : undefined;
	}

	protected _createMinimalElement(model:M, data:Record<string, any>) {
		return this.cy.add({
			group: this.elementGroup,
			data: data
		});
	}
	createElement(model:M):E {
		log.log(`Creating element: ${model}`);

		const data:Record<string,any> = {
			id: this.getId(model),
			gid: model.gid
		};
		const ele = this._createMinimalElement(model, data);
		ele.scratch(ModelMappingAbstract.CYTOSCAPE_NAMESPACE, {
			mapping: this.id,
			model: model
		});
		this.updateElement(model);

		if(!this.isMappingElement(ele)) {
			throw new Error("Created element does not match the mapping type.");
		}
		return ele;
	}

	updateElement(model:M) {
		log.log(`Updating node element: ${model}`);

		const ele = this.getElement(model);
		if(!ele) {
			log.error(`No node element found for ${model}`);
			return;
		}

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

