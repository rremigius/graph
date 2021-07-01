import cytoscape from "./modules/cytoscape.esm.min.js";

cytoscape.use(window.cytoscapeContextMenus);
cytoscape.use(window.cytoscapeEdgehandles);

const LAYOUTS = {
	cose: {
		name: 'cose'
	}
};

const cy = cytoscape({
	container: document.getElementById('graph'),
	style: [{
		selector: 'node',
		style: {
			'border-width': 1,
			'border-color': '#ccc',
			'background-color': ele => getNodeColour(ele)
		}
	}, {
		selector: 'node[label]',
		style: {
			'label': 'data(label)',
		}
	}, {
		selector: 'edge',
		style: {
			'target-arrow-shape': 'triangle',
			'curve-style': 'bezier',
			'arrow-scale': 1.3
		}
	}, {
		selector: 'edge[type]',
		style: {
			'label': 'data(type)'
		}
	}, {
		selector: 'node:parent',
		style: {
			'background-blacken': -0.5
		}
	}, {
		selector: ':selected',
		style: {
			'background-blacken': 0.5
		}
	}, {
		selector: 'node.eh-handle',
		style: {
			'background-color': '#4dff00',
			'height': 20,
			'width': 20
		}
	}]
});

cy.contextMenus({
	menuItems: [{
		id: 'remove',
		content: 'Remove',
		show: true,
		selector: 'node, edge',
		onClickFunction: event => {
			const target = event.target || event.cyTarget;
			target.remove();
		}
	}, {
		id: 'addNode',
		content: 'Create Node',
		show: true,
		coreAsWell: true,
		onClickFunction: event => {
			createNode({
				id: _.uniqueId('node-'),
				labels: ['New'],
				x: event.position.x,
				y: event.position.y
			});
		}
	}]
});

cy.edgehandles({
	complete: (source, target, created) => {
		// Edge is created automatically, we just want to update it now
		updateEdge({
			id: created.data('id'),
			type: 'NEW'
		});
	}
});

// Load data
fetch('data.json').then(async response => {
 	const data = await response.json();
	for(let node of data.nodes) {
		createNode(node);
	}
	for(let relation of data.relations) {
		createEdge(relation);
	}
	applyLayout('cose');
}).catch(e => console.error(e));

function createNode(node) {
	return cy.add({
		group: 'nodes',
		data: getNodeData(node),
		position: {
			x: node.x || 0,
			y: node.y || 0
		}
	});
}

function createEdge(edge) {
	return cy.add({
		group: 'edges',
		data: getEdgeData(edge)
	});
}

function getNodeData(nodeInfo) {
	return {
		...nodeInfo.data,
		id: nodeInfo.id,
		parent: nodeInfo.parent,
		label: nodeInfo.labels[0]
	};
}

function getEdgeData(edgeInfo) {
	return {
		...edgeInfo.data,
		type: edgeInfo.type,
		id: edgeInfo.id,
		source: edgeInfo.source,
		target: edgeInfo.target
	};
}

function getNodeColour(node) {
	let colour = '#777';
	const label = node.data('label');
	return label ? '#' + window.md5(label).substring(0,6) : colour;
}

function updateNode(data) {
	const ele = cy.$id(data.id);
	if(!ele.isNode()) console.error(`Node ${data.id} not found. Cannot update.`);
	ele.data(getNodeData(data));
	if(data.x !== undefined && data.y !== undefined) {
		ele.position({x: data.x, y: data.y})
	}
}

function updateEdge(data) {
	const ele = cy.$id(data.id);
	if(!ele.isEdge()) console.error(`Edge ${data.id} not found. Cannot update.`);
	ele.data(getEdgeData(data));
}

function applyLayout(name, elements = undefined) {
	const options = LAYOUTS[name] || {name};

	// By default, take all elements
	if(!elements) elements = cy.filter(()=>true);
	if(!elements.length) return;

	const defaults = {
		animate: true,
		fit: elements.length === cy.filter(()=>true).length // do not fit for partial layouts
	};

	document.querySelector('.layout-name').innerHTML = name;

	cy.layout({
		...defaults,
		...options
	}).run();
}

function filter() {
	event.preventDefault();

	const input = document.querySelector('#search');
	const query = input.value;
	if(query.length === 0) {
		cy.filter(()=>true).unselect();
	} else {
		const found = cy.filter(query);
		cy.filter(()=>true).difference(found).unselect();
		found.select();
	}
}

window.graph = {
	applyLayout,
	filter
};