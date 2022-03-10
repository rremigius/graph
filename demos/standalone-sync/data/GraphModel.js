import Node from "./Node.js";
import Edge from "./Edge.js";

let Mozel;
if (typeof window !== 'undefined') {
	// Client side
	Mozel = window.Graph.Mozel;
} else {
	// Server side
	Mozel = require('mozel').default;
}

export default class GraphModel extends Mozel {}
GraphModel.property('layout', String);
GraphModel.collection('nodes', Node);
GraphModel.collection('edges', Edge);
