import log from "./Log";
import MappingAbstract from "./MappingAbtract";
import { throttle } from "./utils";
export default class NodeMappingAbstract extends MappingAbstract {
    constructor() {
        super(...arguments);
        this.onLayoutReady = (event) => {
            this.updateModelPositions();
        };
        this.onDragFree = throttle((event) => {
            const node = this.getModel(event.target);
            if (!node)
                return;
            log.log(`Updating node position: ${node}`);
            this.updateModelPosition(node);
            return node;
        }, 100);
    }
    get reservedKeys() {
        return super.reservedKeys.concat(['parent']);
    }
    get elementGroup() {
        return "nodes";
    }
    isMappingElement(value) {
        return this.isNode(value);
    }
    initCytoScapeToModel() {
        super.initCytoScapeToModel();
        this.cy.on('dragfree', this.onDragFree);
        this.cy.on('layoutready', this.onLayoutReady);
    }
    setGrabbable(model) {
        // For override
        return;
    }
    isGrabbable(model) {
        // For override
        return true;
    }
    setLocked(model) {
        // For override
        return;
    }
    isLocked(model) {
        return false;
    }
    stop() {
        super.stop();
        this.cy.off('dragfree', this.onDragFree);
    }
    updateElement(node) {
        const ele = super.updateElement(node);
        // Set parent/group
        const parent = this.getParentId(node);
        if (parent)
            ele.data('parent', parent);
        // Set position
        const position = this.getPosition(node);
        if (position.x !== undefined && position.y !== undefined) { // don't move the element if no position was specified
            ele.position({ x: position.x, y: position.y });
        }
        // Set state
        this.isSelected(node) ? ele.select() : ele.unselect();
        // Allow/disallow user to move the node
        if (this.isGrabbable(node)) {
            ele.grabify();
        }
        else {
            ele.ungrabify();
        }
        // Lock/unlock
        if (this.isLocked(node)) {
            ele.lock();
        }
        else {
            ele.unlock();
        }
        return ele;
    }
    updateModelPosition(node) {
        const ele = this.getElement(node);
        if (!ele)
            return;
        const { x, y } = ele.position();
        this.setPosition(node, x, y);
    }
    updateModelPositions() {
        this.models.each(model => this.updateModelPosition(model));
    }
}
