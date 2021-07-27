import cytoscape, {Collection, EventObject, NodeSingular} from "cytoscape";
import edgehandles from 'cytoscape-edgehandles';
// @ts-ignore
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
// @ts-ignore
import fcose from "cytoscape-fcose";
// @ts-ignore
import coseBilkent from 'cytoscape-cose-bilkent';
// @ts-ignore
import cola from 'cytoscape-cola';
// @ts-ignore
import dagre from 'cytoscape-dagre';
// @ts-ignore
import klay from 'cytoscape-klay';

import style from "./style";
import ModelFactory from "./ModelFactory";
import MozelSyncClient from "mozel-sync/dist/MozelSyncClient";
import DATA from "./server/data-graphileon";
import {get, uniqueId} from "../../src/utils";
import GraphileonNodeMapping from "./mappings/graphileon/GraphileonNodeMapping";
import GraphileonEdgeMapping from "./mappings/graphileon/GraphileonEdgeMapping";
import GraphileonGraphModel from "./mappings/graphileon/GraphileonGraphModel";

cytoscape.use( edgehandles as any );
cytoscape.use( contextMenus );
cytoscape.use( fcose );
cytoscape.use( coseBilkent );
cytoscape.use( cola );
cytoscape.use( dagre );
cytoscape.use( klay );

const session = window.location.hash.substring(1);

const data = session.length ? {gid: 'root'} : DATA;
const factory = new ModelFactory();
const model = factory.create(GraphileonGraphModel, data);

const client = new MozelSyncClient(model, 'http://localhost:3000', session);
client.sync.shouldSync = (model, syncID) => {
	const owner = get(model, 'owner');
	// Only sync models that 1) have no owner, 2) are changed by server or 3) are owned by the changing Sync
	return !owner || syncID === client.serverSyncID || owner === syncID;
};

const cy = cytoscape({
	container: document.getElementById('graph'),
	style: style
});

const nodeMapping = new GraphileonNodeMapping(cy, model, model.nodes);
const edgeMapping = new GraphileonEdgeMapping(cy, model, model.edges);

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
			id: uniqueId('edge-'),
			source: sourceModel.id,
			target: targetModel.id
		}, true);
	}
});

cy.ready(async ()=>{
	// await client.start();
	// window.location.hash = '#' + client.session;

	nodeMapping.start();
	edgeMapping.start();
	// linkMapping.start();

	setTimeout(() => {
		setLayout('fcose');
	});
});

function setLayout(layout:string) {
	cy.layout({
		name: layout,
		animate: true,
		idealEdgeLength: ()=>1000,
		klay: {
			edgeRouting: 'ORTHOGONAL'
		}
	} as any).run();
	document.querySelector('.layout-name').innerHTML = layout;
}

(window as any).graph = {
	setLayout
}
