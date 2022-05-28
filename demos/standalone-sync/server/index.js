import MozelSyncServerHub from "mozel-sync/dist/MozelSyncServerHub";

import GraphModel from "../data/GraphModel"
import GraphServerHub from "./GraphServerHub";

// Setup an HTTP server with socket
const server = require('http').createServer();
const io = require('socket.io')(server, {
	cors:true,
	origins:["http://localhost:63342", 'http://localhost']
});
server.listen(3000);

const hub = new GraphServerHub({io: io});
hub.start();
