import Mozel, {alphanumeric} from "mozel";
import {EventObject, NodeSingular} from "cytoscape";
import Log from "./Log";
import MappingAbstract from "./MappingAbtract";
import {throttle} from "./utils";

const log = Log.instance("node-mapping");

export default abstract class NodeMappingAbstract<M extends Mozel> extends MappingAbstract<M, NodeSingular> {
	abstract getParentId(model:M):string|undefined;
	abstract getPosition(model:M):{x:number, y:number};
	abstract setPosition(model:M, x:number, y:number):void;

	private moved:Set<alphanumeric> = new Set<alphanumeric>();

	get reservedKeys() {
		return super.reservedKeys.concat(['parent']);
	}
	get elementGroup(): "edges" | "nodes" {
		return "nodes";
	}
	isMappingElement(value: unknown): value is NodeSingular {
		return this.isNode(value);
	}

	initCytoScapeToModel() {
		super.initCytoScapeToModel();
		this.cy.on('position', this.onPosition);

		// some layouts do not fire position/layoutstop events so at least let's update the position when clicked
		// to prevent it from jumping to its last known position
		this.cy.on('click', this.onPosition);
		this.cy.on('layoutstop', this.onLayoutStop);
	}

	setGrabbable(model:M) {
		// For override
		return;
	}
	isGrabbable(model:M) {
		// For override
		return true;
	}
	setLocked(model:M) {
		// For override
		return;
	}
	isLocked(model:M) {
		return false;
	}

	stop() {
		super.stop();
		this.cy.off('position', this.onPosition);
		this.cy.off('click', this.onPosition);
		this.cy.off('layoutstop', this.onLayoutStop);
	}

	onLayoutStop = (event:EventObject) => {
		this.updateModelPositions();
	};

	onPosition = (event:EventObject) => {
		if(!this.isNode(event.target)) return;

		const node = this.getModel(event.target);
		if(!node) return;

		// Add node to be updated
		this.moved.add(node.gid);
		this.updateModelPositions();

		return node;
	}

	updateElement(node:M) {
		const ele = super.updateElement(node);

		// Set parent/group
		const parent = this.getParentId(node);
		if(parent) ele.data('parent', parent);

		// Set position
		const position = this.getPosition(node);
		if(position.x !== undefined && position.y !== undefined) { // don't move the element if no position was specified
			ele.position({x: position.x, y: position.y});
		}

		// Set state
		this.isSelected(node) ? ele.select() : ele.unselect();

		// Allow/disallow user to move the node
		if(this.isGrabbable(node)) {
			ele.grabify();
		} else {
			ele.ungrabify();
		}

		// Lock/unlock
		if(this.isLocked(node)) {
			ele.lock();
		} else {
			ele.unlock();
		}

		return ele;
	}

	updateModelPosition(node:M) {
		const ele = this.getElement(node);
		if(!ele) return;

		const {x, y} = ele.position();
		this.setPosition(node, x, y);
	}

	updateModelPositions = throttle(() => {
		log.log("Updating node position(s)");
		this.models.filter(model => this.moved.has(model.gid)).forEach(model => this.updateModelPosition(model));
		this.moved.clear();
	}, 500);
}

