import { immediate } from "mozel";
import { check } from "validation-kit";
import Log from "./Log";
import { forEach, includes, isPlainObject, uniqueId } from "lodash";
import { get, isFunction } from "./utils";
const log = Log.instance("mapping");
export default class MappingAbstract {
    constructor(cy, model, collection) {
        this.watchers = [];
        this.modelWatchers = {};
        this.updatesNextTick = {};
        this.onItemAdded = (event) => {
            const model = check(event.item, item => this.isMappingModel(item), 'item');
            this.addItem(model);
        };
        this.onItemRemoved = (event) => {
            const model = check(event.item, item => this.isMappingModel(item), 'item');
            this.removeItem(model);
        };
        this.onSelect = (event) => {
            const model = this.getModel(event.target);
            if (!model)
                return;
            this.setSelected(model, true);
        };
        this.onUnselect = (event) => {
            const model = this.getModel(event.target);
            if (!model)
                return;
            this.setSelected(model, false);
        };
        this.onRemove = (event) => {
            const entity = this.getModel(event.target);
            if (!entity)
                return;
            this.models.remove(entity);
        };
        this.cy = cy;
        this.model = model;
        this.path = collection.parent.$getPathArrayFrom(model).concat(collection.relation).join('.'); // will throw if not related
        this.models = collection;
        this.Model = collection.getType();
        this.id = uniqueId();
    }
    get dataProperties() {
        return [];
    }
    getData(model) {
        const data = {};
        for (let key of this.dataProperties) {
            if (model.$has(key)) {
                data[key] = model.$get(key);
            }
        }
        return data;
    }
    get reservedKeys() {
        return ['id', 'gid', 'classes'];
    }
    isNode(value) {
        return isFunction(get(value, 'isNode')) && value.isNode();
    }
    isEdge(value) {
        return isFunction(get(value, 'isEdge')) && value.isEdge();
    }
    isMappingModel(value) {
        return value instanceof this.Model;
    }
    start() {
        this.initModelToCytoScape();
        this.initCytoScapeToModel();
    }
    initCytoScapeToModel() {
        this.cy.on('select', this.onSelect);
        this.cy.on('unselect', this.onUnselect);
        this.cy.on('remove', this.onRemove);
    }
    initModelToCytoScape() {
        const path = this.path;
        this.watchers = [
            this.model.$watch(path, ({ newValue }) => {
                if (newValue !== this.models) {
                    this.models.events.added.off(this.onItemAdded);
                    this.models.events.removed.off(this.onItemRemoved);
                    this.models.each(item => this.removeItem(item));
                    this.models = newValue;
                }
                this.models.events.added.on(this.onItemAdded);
                this.models.events.removed.on(this.onItemRemoved);
                this.models.each(item => this.addItem(item));
            }, { immediate })
        ];
    }
    stop() {
        for (let watcher of this.watchers) {
            this.model.$removeWatcher(watcher);
        }
        this.cy.off('select', this.onSelect);
        this.cy.off('unselect', this.onUnselect);
        this.cy.off('remove', this.onRemove);
        this.models.events.added.off(this.onItemAdded);
        this.models.events.removed.off(this.onItemRemoved);
    }
    addItem(model) {
        log.log(`Model added: ${model}`);
        this.createElement(model);
        if (!(model.gid in this.modelWatchers))
            this.modelWatchers[model.gid] = [];
        this.modelWatchers[model.gid].push(model.$watch('*', () => {
            this.updateNextTick(model);
        }));
    }
    removeItem(model) {
        log.log(`Model removed: ${model}`);
        forEach(this.modelWatchers[model.gid], watcher => model.$removeWatcher(watcher));
        const ele = this.getElement(model);
        if (ele)
            this.cy.remove(ele);
    }
    getModel(element) {
        return this.models.find(node => this.isMappingModel(node) && this.getId(node) === element.id());
    }
    getModelByGid(gid) {
        return this.model.$registry.byGid(gid);
    }
    getId(node) {
        return node.gid.toString();
    }
    getElement(model) {
        const ele = this.cy.getElementById(this.getElementId(model));
        return this.isMappingElement(ele) && ele.length ? ele : undefined;
    }
    getElementId(model) {
        return this.getId(model);
    }
    shouldHaveElement(model) {
        // For override
        return true;
    }
    _createMinimalElement(model, data) {
        return this.cy.add({
            group: this.elementGroup,
            data: data
        });
    }
    createElement(model) {
        if (!this.shouldHaveElement(model)) {
            log.log(`Skipping element creation for ${model}.`, model);
            return;
        }
        log.log(`Creating element: ${model}`);
        const data = {
            id: this.getElementId(model),
            gid: model.gid
        };
        const ele = this._createMinimalElement(model, data);
        ele.scratch(MappingAbstract.CYTOSCAPE_NAMESPACE, {
            mapping: this.id,
            model: model
        });
        this.updateElement(model);
        if (!this.isMappingElement(ele)) {
            throw new Error("Created element does not match the mapping type.");
        }
        return ele;
    }
    removeElement(model) {
        const ele = this.getElement(model);
        if (!ele)
            return false;
        log.log(`Removing: ${model}`);
        this.cy.remove(ele);
        return true;
    }
    updateElement(model) {
        const ele = this.getElement(model);
        if (!ele) {
            return;
        }
        log.log(`Updating element: ${model}`);
        // Set data
        let data = this.getData(model);
        if (!isPlainObject(data))
            data = {};
        forEach(data, (value, key) => {
            if (includes(this.reservedKeys, key))
                return; // reserved keys
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
            if (!this.isMappingModel(model)) {
                log.error("Invalid node:", model);
                return;
            }
            const ele = this.getElement(model);
            if (!ele) {
                this.createElement(model);
            }
        });
    }
    updateNextTick(entity) {
        log.log(`Updating entity next tick: ${entity}`);
        this.updatesNextTick[entity.gid] = entity;
        setTimeout(() => {
            const numUpdates = Object.keys(this.updatesNextTick).length;
            if (!numUpdates)
                return; // already done
            log.log(`Applying ${numUpdates} scheduled updates this tick.`);
            for (let gid in this.updatesNextTick) {
                const entity = this.updatesNextTick[gid];
                if (this.isMappingModel(entity))
                    this.updateElement(entity);
            }
            // Clear updates
            this.updatesNextTick = {};
        });
    }
}
MappingAbstract.CYTOSCAPE_NAMESPACE = 'modelGraph';
