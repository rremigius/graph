import {showForm} from "./form.js";
import formSchemaNode from "./form-schema-node.js";
import formSchemaEdge from "./form-schema-edge.js";
import style from "./style.js";

import NodeMapping from "./NodeMapping.js";
import EdgeMapping from "./EdgeMapping.js";
import GraphModel from "./data/GraphModel.js";

import GraphClient from "./GraphClient.js"

const LAYOUTS = {
	cose: {
		name: 'cose',
		idealEdgeLength: () => 70,
		nodeDimensionsIncludeLabels: true
	}
};

const cy = cytoscape({
	container: document.getElementById('graph'),
	style: style
});

// Create an empty model with just the root element
const model = GraphModel.create({gid: 'root'});

// Setup two-way node and edge mapping between model and cytoscape
const nodeMapping = new NodeMapping(cy, model, model.nodes);
const edgeMapping = new EdgeMapping(cy, model, model.edges);

// Loading initial set of nodes: watch the nodes, wait for all nodes to be added, then zoom to fit.
const watcher = model.$watch('nodes.*', _.debounce(() => { // debounce to wait until last node is added
	model.$removeWatcher(watcher); // only once
	cy.fit();
}, 100));

// Watch for changes in layout to update UI
model.$watch('layout', ({newValue}) => {
	// This will only change displayed value in the dropdown; to actually apply a layout, `applyLayout` must be called
	document.querySelector('.layout-name').innerHTML = newValue;
});

// Setup online session
const sessionID = window.location.hash.substring(1); // Get everything after the hashtag (#) in the url
const client = new GraphClient(model, "localhost:3000", sessionID);

// When cytoscape is ready, start loading the data
cy.ready(async function() {
	// Ready mapping between model and cytoscape
	nodeMapping.start();
	edgeMapping.start();

	// Start online session
	await client.start();

	// Wait with first layout until client has connected, or changes will not be synced to server
	if(!sessionID.length) {
		// If we started the session, load the initial graph data
		const response = await fetch('data/data.json'); // can be from anywhere
		const data = await response.json();
		model.$setData(data);
		applyLayout('cose');
	}

	// If url did not have a hashtag yet, it will now set it to the session ID.
	// URL can be shared with others to let them join.
	window.location.hash = '#' + client.getSessionID();
});

cy.contextMenus({
	menuItems: [{
		id: 'edit',
		content: 'Edit',
		show: true,
		selector: '.entity',
		onClickFunction: event => {
			if(event.target.isNode()) {
				const node = nodeMapping.getModel(event.target)
				if(!node) throw new Error(`Node is not editable.`);
				showNodeForm(node.$export());
			}
			if(event.target.isEdge()) {
				const edge = edgeMapping.getModel(event.target)
				if(!edge) throw new Error(`Edge is not editable.`);
				showEdgeForm(edge.$export());
			}
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
		showEdgeForm({
			source: {gid: source.id()},
			target: {gid: target.id()}
		});
	}
});

// Background

const background = new Image();
background.onload = () => {
	const bottomLayer = cy.cyCanvas({
		zIndex: -1
	});
	const canvas = bottomLayer.getCanvas();
	const ctx = canvas.getContext("2d");

	cy.on("render cyCanvas.resize", evt => {
		bottomLayer.resetTransform(ctx);
		bottomLayer.clear(ctx);
		bottomLayer.setTransform(ctx);

		ctx.save();
		// Draw a background
		ctx.drawImage(background, 0, 0);

		// Draw text that follows the model
		ctx.font = "24px Helvetica";
		ctx.fillStyle = "black";
		ctx.fillText("This text follows the model", 200, 300);

		// Draw text that is fixed in the canvas
		bottomLayer.resetTransform(ctx);
		ctx.save();
		ctx.font = "24px Helvetica";
		ctx.fillStyle = "red";
		ctx.fillText("This text is fixed", 200, 200);
		ctx.restore();
	});
}
background.src = "https://files.classcraft.com/classcraft-assets/images/event_scroll_middle.jpg";

function createNode(node) {
	return model.nodes.add(node);
}

function createEdge(edge) {
	return model.edges.add(edge);
}

function getNodeColour(ele) {
	let colour = '#777';
	const label = ele.data('label');
	return label ? '#' + window.md5(label).substring(0,6) : colour;
}

function updateNode(data) {
	const node = nodeMapping.getModelByGid(data.gid);
	if(!node) throw new Error(`Node '${data.gid}' not found. Cannot update.`);

	node.$setData(data);
	return node;
}

function updateEdge(data) {
	const edge = edgeMapping.getModelByGid(data.gid);
	if(!edge) throw new Error(`Edge '${data.gid}' not found. Cannot update.`);

	edge.$setData(data);
	return edge;
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

	// Change the layout in the model; will only change the UI display
	model.layout = name;

	// Apply the layout in cytoscape
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
function showNodeForm(presets = {}) {
	$('#modal-form').modal('show');
	showForm(presets, formSchemaNode, () => {
		presets.gid ? updateNode(presets) : createNode(presets);
		$('#modal-form').modal('hide');
	});
}

function showEdgeForm(presets = {}) {
	$('#modal-form').modal('show');
	showForm(presets, formSchemaEdge, () => {
		presets.gid ? updateEdge(presets) : createEdge(presets);
		$('#modal-form').modal('hide');
	});
}

window.graph = {
	applyLayout,
	filter
};
