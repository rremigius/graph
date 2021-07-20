import MozelSyncServer from "mozel-sync/dist/MozelSyncServer";
import DATA from "./data";
import GraphModel from "../../../src/models/GraphModel";

const server = require('http').createServer();
const io = require('socket.io')(server, {
	cors:true,
	origins:["http://localhost:63342"]
});
server.listen(3000);

const model = GraphModel.create<GraphModel>(DATA);
const sync = new MozelSyncServer({io, model});
sync.start();
