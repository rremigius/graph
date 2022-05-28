import GraphModel from "../data/GraphModel";
import EventInterface from "event-interface-mixin";
import Log from "log-control";
import { check } from "validation-kit";
import {IS_OBJECT, IS_STRING} from "validation-kit/dist/validators";
import {isObject, isFunction} from "lodash";

const log = Log.instance("graph-server");

export class ServerDestroyedEvent {
	constructor(id, ioNamespace) {
		this.id = id;
		this.ioNamespace = ioNamespace;
	}
}
export class GraphServerEvents extends EventInterface {
	destroyed = this.$event(ServerDestroyedEvent);
}

export default class GraphServer {
	constructor(id, ioNamespace, model) {
		check(id, IS_STRING);
		check(ioNamespace, {
			name: 'ioNamespace',
			validate: x => isObject(x) && isFunction(x.on) && isFunction(x.allSockets)
		});
		check(model, IS_OBJECT);

		this.id = id;
		this.io = ioNamespace;
		this.model = GraphModel.create(model);
		this.clients = {};

		this.sessionEmptyDestroyTimeout = 10000;
		this.destroyTimer = null;

		this.events = new GraphServerEvents();
	}

	start() {
		this.io.on('connection', (socket) => {
			this.handleConnection(socket.id, socket)
			socket.on('disconnect', () => {
				this.handleDisconnect(socket);
			});
			// Listen to incoming updates
			socket.on('full-state', (state) => {
				log.debug(`Received full state from ${socket.id}`);
				this.handleFullState(socket, state);
			});
		});
	}

	createFullState() {
		return this.model.$export();
	}

	sendFullState(io) {
		if(!io) {
			log.debug("Broadcasting full state.");
			io = this.io;
		} else {
			log.debug(`Sending full state to ${io.id}.`);
		}
		io.emit('full-state', this.createFullState());
	}

	handleConnection(id, socket) {
		log.info(`Client ${id} connected.`);

		if(this.destroyTimer) {
			log.info(`Server ${id} no longer empty; cancelling closure.`);
			clearTimeout(this.destroyTimer);
		}

		this.clients[id] = {socket};

		log.log(`Sending connection info to ${socket.id}.`);
		socket.emit('connected', {id: socket.id});

		log.log(`Sending full state to ${socket.id}.`);
		this.sendFullState(socket);
	}

	handleDisconnect(socket) {
		log.info(`Client disconnected: ${socket.id}`);
		delete this.clients[socket.id];

		this.io.allSockets().then(sockets => {
			if(!sockets.size) {
				log.info(`Server ${this.id} empty; closing in ${this.sessionEmptyDestroyTimeout} ms...`);

				// Start timeout to destroy session
				this.destroyTimer = setTimeout(()=>{
					this.destroy();
				}, this.sessionEmptyDestroyTimeout);
			}
		}).catch(log.error);
	}

	handleFullState(socket, update) {
		this.model.$setData(update);	// Update internally
		this.sendFullState();			// Then broadcast to everyone
	}

	destroy() {
		this.events.destroyed.fire(new ServerDestroyedEvent(this.id, this.io));
	}
}
