import Mozel from "mozel";
import {EventObject, NodeSingular} from "cytoscape";
import log from "./Log";
import MappingAbstract from "./MappingAbtract";
import {throttle} from "./utils";

export default abstract class NodeMappingAbstract<M extends Mozel> extends MappingAbstract<M, NodeSingular> {
	abstract getParentId(model:M):string|undefined;
	abstract getPosition(model:M):{x:number, y:number};
	abstract setPosition(model:M, x:number, y:number):void;

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
		this.cy.on('dragfree', this.onDragFree);
		this.cy.on('layoutready', this.onLayoutReady);
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
		this.cy.off('dragfree', this.onDragFree);
	}

	onLayoutReady = (event:EventObject) => {
		this.updateModelPositions();
	};

	onDragFree = throttle((event:EventObject) => {
		const node = this.getModel(event.target);
		if(!node) return;
		log.log(`Updating node position: ${node}`);
		this.updateModelPosition(node);
		return node;
	}, 100);

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

	updateModelPositions() {
		this.models.each(model => this.updateModelPosition(model));
	}
}

