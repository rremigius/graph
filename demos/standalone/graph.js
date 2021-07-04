import cytoscape from "./modules/cytoscape.esm.min.js";
import {showForm} from "./form.js";
import formSchemaNode from "./form-schema-node.js";
import formSchemaEdge from "./form-schema-edge.js";

cytoscape.use(window.cytoscapeContextMenus);
cytoscape.use(window.cytoscapeEdgehandles);

const LAYOUTS = {
	cose: {
		name: 'cose',
		idealEdgeLength: () => 70,
		nodeDimensionsIncludeLabels: true
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
		selector: '[label]',
		style: {
			'label': 'data(label)',
		}
	}, {
		selector: '[title]',
		style: {
			'label': 'data(title)'
		}
	}, {
		selector: 'edge',
		style: {
			'target-arrow-shape': 'triangle',
			'curve-style': 'bezier',
			'arrow-scale': 1.3
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
		id: 'edit',
		content: 'Edit',
		show: true,
		selector: '.entity',
		onClickFunction: event => {
			if(event.target.isNode()) showNodeForm(event.target);
			if(event.target.isEdge()) showEdgeForm(event.target);
		}
	},{
		id: 'remove',
		content: 'Remove',
		show: true,
		selector: '.entity',
		onClickFunction: event => {
			event.target.remove();
		}
	}, {
		id: 'addNode',
		content: 'Create Node',
		show: true,
		coreAsWell: true,
		onClickFunction: event => {
			showNodeForm({x: event.position.x, y: event.position.y});
		}
	}]
});

cy.edgehandles({
	complete: (source, target, created) => {
		// Remove edge. After form it will be created definitively.
		created.remove();
		showEdgeForm({source: source.id(), target: target.id()});
	}
});

// Load data
fetch('data.json').then(async response => {
 	const data = await response.json();
	for(let node of data.nodes) {
		createNode(node);
	}
	for(let edge of data.edges) {
		createEdge(edge);
	}
	applyLayout('cose');
}).catch(e => console.error(e));

function createNode(node) {
	return cy.add({
		group: 'nodes',
		data: {...node},
		classes: ['entity'],
		position: {
			x: node.x || 0,
			y: node.y || 0
		}
	});
}

function createEdge(edge) {
	return cy.add({
		group: 'edges',
		data: edge,
		classes: ['entity']
	});
}

function getNodeColour(node) {
	let colour = '#777';
	const label = node.data('label');
	return label ? '#' + window.md5(label).substring(0,6) : colour;
}

function updateNode(data) {
	const {x,y} = data;
	data = _.omit(data, ['x','y']);

	const ele = cy.$id(data.id);
	if(!ele.isNode()) console.error(`Node ${data.id} not found. Cannot update.`);
	ele.data(data);
	if(x !== undefined && y !== undefined) {
		ele.position({x,y});
	}
}

function updateEdge(data) {
	const ele = cy.$id(data.id);
	if(!ele.isEdge()) console.error(`Edge ${data.id} not found. Cannot update.`);
	ele.data(data);
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

// UI
function showNodeForm(node = {}) {
	if(_.isFunction(node.isNode) && node.isNode()) {
		node = exportNode(node);
	}
	if(!_.isPlainObject(node)) throw new Error("Presets argument must be node or plain object.");

	$('#modal-form').modal('show');
	showForm(node, formSchemaNode, () => {
		node.id ? updateNode(node) : createNode(node);
		$('#modal-form').modal('hide');
	});
}

function showEdgeForm(presets = {}) {
	if(_.isFunction(presets.isEdge) && presets.isEdge()) {
		presets = exportEdge(presets);
	}
	if(!_.isPlainObject(presets)) throw new Error("Presets argument must be edge or plain object.");

	$('#modal-form').modal('show');
	showForm(presets, formSchemaEdge, data => {
		const edge = {
			...presets,
			label: data.label,
			data: data
		}
		edge.id ? updateEdge(edge) : createEdge(edge);
		$('#modal-form').modal('hide');
	});
}

function exportNode(node) {
	return {
		...node.data(),
		x: node.position('x'),
		y: node.position('y')
	}
}

function exportEdge(edge) {
	return edge.data();
}

window.graph = {
	applyLayout,
	filter,
	showNodeForm
};
