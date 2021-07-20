import cytoscape, {Collection, EventObject, NodeSingular} from "cytoscape";
import edgehandles from 'cytoscape-edgehandles';
// @ts-ignore
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
// @ts-ignore
import fcose from "cytoscape-fcose";

import GraphModel from "../../src/models/GraphModel";
import style from "./style";
import NodeMapping from "../../src/mappings/NodeMapping";
import EdgeMapping from "../../src/mappings/EdgeMapping";
import NodeToEdgeMapping from "../../src/mappings/NodeToEdgeMapping";
import ModelFactory from "./ModelFactory";
import MozelSyncClient from "mozel-sync/dist/MozelSyncClient";

cytoscape.use( edgehandles as any );
cytoscape.use( contextMenus );
cytoscape.use( fcose );

const factory = new ModelFactory();
const model = factory.create(GraphModel, {gid: "graph"});
const sync = new MozelSyncClient({model});

const cy = cytoscape({
	container: document.getElementById('graph'),
	style: style
});
const nodeMapping = new NodeMapping(cy, model, model.nodes);
const edgeMapping = new EdgeMapping(cy, model, model.edges);
const linkMapping = new NodeToEdgeMapping(cy, model, model.nodes, 'link');

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

cy.ready(async ()=>{
	await sync.start();

	nodeMapping.start();
	edgeMapping.start();
	linkMapping.start();

	setTimeout(() => {
		setLayout('fcose');
	});
});

function setLayout(layout:string) {
	cy.layout({
		name: layout,
		animate: true,
		idealEdgeLength: ()=>100
	} as any).run();
	document.querySelector('.layout-name').innerHTML = layout;
}

(window as any).graph = {
	setLayout
}
