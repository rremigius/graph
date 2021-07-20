import GraphModel from "../../../src/models/GraphModel";
import MozelSyncServerHub from "mozel-sync/dist/MozelSyncServerHub";

const server = require('http').createServer();
const io = require('socket.io')(server, {
	cors:true,
	origins:["http://localhost:63342"]
});
server.listen(3000);

const hub = new MozelSyncServerHub({io, createSessionModel: ()=>GraphModel.create({gid: 'root'})});
hub.start();
