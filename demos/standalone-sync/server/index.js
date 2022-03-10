import MozelSyncServerHub from "mozel-sync/dist/MozelSyncServerHub";

import GraphModel from "../data/GraphModel"

const server = require('http').createServer();
const io = require('socket.io')(server, {
	cors:true,
	origins:["http://localhost:63342", 'http://localhost']
});
server.listen(3000);

class GraphHub extends MozelSyncServerHub {
	constructor(io) {
		super({io, RootModel: GraphModel, useClientModel: true});
	}

	createSyncServer(model, io) {
		const server = super.createSyncServer(model, io);
		server.sync.shouldSync = (model, syncID) => {
			// Determines whether a model should be synced to all users or not.
			// Can be used to allow only a certain user to change certain models.
			// syncID is the ID of the client (or server) that changed the model and can be used to store ownership in the model
			return true;
		}
		server.onUserConnected = id => {
			// Optionally change something in the model when a user connects
		}
		server.onUserDisconnected = id => {
			// Optionally change something in the model when a user disconnects
		}
		return server;
	}
}

const hub = new GraphHub(io);
hub.start();
