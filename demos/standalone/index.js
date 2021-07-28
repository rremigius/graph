import {showForm} from "./form.js";
import formSchemaNode from "./form-schema-node.js";
import formSchemaEdge from "./form-schema-edge.js";
import style from "./style.js";

import NodeMapping from "./data/NodeMapping.js";
import EdgeMapping from "./data/EdgeMapping.js";
import GraphModel from "./data/GraphModel.js";

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

const model = GraphModel.create();
const nodeMapping = new NodeMapping(cy, model, model.nodes);
const edgeMapping = new EdgeMapping(cy, model, model.edges);

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

// Load data
fetch('data/data.json').then(async response => {
 	const data = await response.json();

 	// Populate model and map to graph
 	model.$setData(data);
 	console.log("MODEL", model);

	nodeMapping.start();
	edgeMapping.start();

	applyLayout('cose');
}).catch(e => console.error(e));

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
