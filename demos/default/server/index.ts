import GraphModel from "../../../src/models/GraphModel";
import MozelSyncServerHub from "mozel-sync/dist/MozelSyncServerHub";
import {Namespace, Server} from "socket.io";
import ModelFactory from "../ModelFactory";
import {get} from "../../../src/utils";

const server = require('http').createServer();
const io = require('socket.io')(server, {
	cors:true,
	origins:["http://localhost:63342"]
});
server.listen(3000);

class GraphHub extends MozelSyncServerHub {
	constructor(io:Server) {
		super({io, Factory: ModelFactory, RootModel: GraphModel, useClientModel: true});
	}

	createSyncServer(model:GraphModel, io:Namespace) {
		const server = super.createSyncServer(model, io);
		server.sync.shouldSync = (model, syncID) => {
			const owner = get(model, 'owner');
			// Only sync models that 1) have no owner, 2) are changed by server or 3) are owned by the changing Sync
			return !owner || syncID === server.sync.id || owner === syncID;
		}
		server.onUserConnected = id => {
			model.nodes.add({gid: id, label: 'USER', owner: id});
		}
		server.onUserDisconnected = id => {
			model.nodes.remove(model.$registry.byGid(id));
		}
		return server;
	}
}

const hub = new GraphHub(io);
hub.start();
