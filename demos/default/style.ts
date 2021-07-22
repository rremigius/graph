import md5 from "md5";
import {NodeSingular} from "cytoscape";

function getNodeColour(node:NodeSingular) {
	let colour = '#777';
	const text = node.data('owner') || node.data('label');
	return text ? '#' + md5(text).substring(0,6) : colour;
}

export default [{
	selector: 'node',
	style: {
		'border-width': 1,
		'border-color': '#ccc',
		'background-color': (ele:NodeSingular) => getNodeColour(ele)
	}
}, {
	selector: '[label]',
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
},{
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
