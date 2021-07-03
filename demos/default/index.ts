import cytoscape, {Collection, EventObject, NodeSingular} from "cytoscape";
import edgehandles from 'cytoscape-edgehandles';
// @ts-ignore
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
// @ts-ignore
import fcose from "cytoscape-fcose";

import GraphModel from "../../src/models/GraphModel";
import DATA from "./data";
import NodeModelMapping from "../../src/NodeModelMapping";
import EdgeModelMapping from "../../src/EdgeModelMapping";
import style from "./style";

cytoscape.use( edgehandles as any );
cytoscape.use( contextMenus );
cytoscape.use( fcose );

const model = GraphModel.createFactory().createAndResolveReferences(GraphModel, DATA);
const cy = cytoscape({
	container: document.getElementById('graph'),
	style: style
});
const nodeMapping = new NodeModelMapping(cy, model, model.nodes);
const edgeMapping = new EdgeModelMapping(cy, model, model.edges);

(cy as any).contextMenus({
	menuItems: [{
		id: 'remove',
		content: 'Remove',
		show: true,
		selector: 'node, edge',
		onClickFunction: (event:EventObject) => {
			event.target.remove();
		}
	}, {
		id: 'addNode',
		content: 'Create Node',
		show: true,
		coreAsWell: true,
		onClickFunction: (event:EventObject) => {
			model.nodes.add({x: event.position.x, y: event.position.y });
		}
	}]
});
(cy as any).edgehandles({
	complete(source:NodeSingular, target:NodeSingular, created:Collection) {
		// Remove created elements - was just for visualisation until created in model
		created.remove();

		const sourceModel = nodeMapping.getModel(source);
		const targetModel = nodeMapping.getModel(target);
		if(!sourceModel || !targetModel) return;

		return model.edges.add({
			source: sourceModel,
			target: targetModel
		}, true);
	}
});

cy.ready(()=>{
	nodeMapping.start();
	edgeMapping.start();

	setTimeout(() => {
		cy.layout({
			name: 'fcose',
			animate: true,
			idealEdgeLength: ()=>100
		} as any).run();
	});
});
