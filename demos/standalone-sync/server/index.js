import MozelSyncServerHub from "mozel-sync/dist/MozelSyncServerHub";

import GraphModel from "../data/GraphModel"

// Setup an HTTP server with socket
const server = require('http').createServer();
const io = require('socket.io')(server, {
	cors:true,
	origins:["http://localhost:63342", 'http://localhost']
});
server.listen(3000);

/*
	The server hub will listen for new connections and setup a new session (server) for them. The session ID is given to
	the client. If a new client connects with the same session ID, it will join the existing session.
 */
class GraphHub extends MozelSyncServerHub {
	constructor(io) {
		super({
			io: io, 				// The Socket IO server it will make connections with.
			RootModel: GraphModel, 	// The root model class. This class definition should be identical to the one the clients use.
			useClientModel: true	// This tells the hub that each new session (server) should be initialized with the model the first client will send.
		});
	}

	createSyncServer(model, io) {
		// We create a default sync server, which uses the given model and IO server/namespace
		const server = super.createSyncServer(model, io);

		/*
			After that, we could customize it, for example to do something when users connect/disconnect or to restrict
			which parts of the model should be synced and which should not.
		 */

		server.sync.shouldSync = (model, syncID) => {
			/*
				Determines whether a model should be synced to all users or not.
			 	Can be used to allow only a certain user to change certain models.
			 	`syncID` is the ID of the client (or server) that changed the model and can be used to store ownership in the model.
				Note: Models are hierarchical and can contain other Models as properties. This function can be called
				at any level of the hierarchy.
			 */
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
