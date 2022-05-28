import Node from "./Node.js";

let Mozel;
if (typeof window !== 'undefined') {
	// Client side
	Mozel = window.Graph.Mozel;
} else {
	// Server side
	Mozel = require('mozel').default;
}

export default class Edge extends Mozel {
	static get type() {
		return 'edge';
	}
}
Edge.property('label', String);
Edge.property('source', Node, {reference: true});
Edge.property('target', Node, {reference: true});
