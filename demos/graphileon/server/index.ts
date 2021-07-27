import MozelSyncServerHub from "mozel-sync/dist/MozelSyncServerHub";
import {Server} from "socket.io";
import ModelFactory from "../ModelFactory";
import GraphileonGraphModel from "../mappings/graphileon/GraphileonGraphModel";

const server = require('http').createServer();
const io = require('socket.io')(server, {
	cors:true,
	origins:["http://localhost:63342"]
});
server.listen(3000);

class GraphHub extends MozelSyncServerHub {
	constructor(io:Server) {
		super({io, Factory: ModelFactory, RootModel: GraphileonGraphModel, useClientModel: true});
	}
}

const hub = new GraphHub(io);
hub.start();
