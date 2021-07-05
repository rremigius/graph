import Mozel from "mozel";
import {EventObject, NodeSingular} from "cytoscape";
import log from "./Log";
import ModelMappingAbstract from "./ModelMappingAbstract";

export default abstract class NodeModelMappingAbstract<N extends Mozel> extends ModelMappingAbstract<N, NodeSingular> {
	abstract getParent(node:N):N;
	abstract getPosition(node:N):{x:number, y:number};
	abstract setPosition(node:N, x:number, y:number):void;

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
	}

	stop() {
		super.stop();
		this.cy.off('dragfree', this.onDragFree);
	}

	onDragFree = (event:EventObject) => {
		const node = this.getModel(event.target);
		if(!node) return;
		log.log(`Updating node position: ${node}`);
		this.updateModelPosition(node);
		return node;
	}

	updateElement(node:N) {
		const ele = super.updateElement(node);

		// Set parent/group
		const parent = this.getParent(node);
		if(parent) ele.data('parent', this.getId(parent));

		// Set position
		const position = this.getPosition(node);
		if(position.x !== undefined && position.y !== undefined) { // don't move the element if no position was specified
			ele.position({x: position.x, y: position.y});
		}

		// Set state
		this.isSelected(node) ? ele.select() : ele.unselect();

		return ele;
	}

	updateModelPosition(node:N) {
		const ele = this.getElement(node);
		if(!ele) return;

		const {x, y} = ele.position();
		this.setPosition(node, x, y);
	}

	updateModelPositions() {
		this.models.each(model => this.updateModelPosition(model));
	}
}

