import Node from "./Node.js";

const {Mozel} = window.Graph;

export default class Edge extends Mozel {
	static get type() {
		return 'edge';
	}
}
Edge.property('label', String);
Edge.property('source', Node, {reference: true});
Edge.property('target', Node, {reference: true});
