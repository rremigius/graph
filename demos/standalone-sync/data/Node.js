let Mozel;
if (typeof window !== 'undefined') {
	// Client side
	Mozel = window.Graph.Mozel;
} else {
	// Server side
	Mozel = require('mozel').default;
}

export default class Node extends Mozel {
	static get type() {
		return 'node';
	}
}
Node.property('x', Number);
Node.property('y', Number);
Node.property('label', String);
Node.property('title', String);
Node.property('description', String);
Node.property('url', String);
