const {Mozel} = window.Graph;

export default class Node extends Mozel {
	static get type() {
		return 'node';
	}
}
Node.property('label', String);
Node.property('title', String);
Node.property('description', String);
Node.property('url', String);
