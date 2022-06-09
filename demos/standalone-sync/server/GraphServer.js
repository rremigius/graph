import GraphModel from "./data/GraphModel";
import EventInterface from "event-interface-mixin";
import Log from "log-control";
import {check, isPrimitive} from "validation-kit";
import {IS_OBJECT, IS_STRING} from "validation-kit/dist/validators";
import {isObject, isFunction} from "lodash";
import {isComplexValue} from "mozel/dist/Property";

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
		// Temporarily track changes
		const changes = {};
		const listener = this.model.$events.changed.on(event => {
			const value = this.model.$path(event.path);
			changes[event.path] = isComplexValue(value) ? value.$export() : value;
		});

		// Update internal model
		this.model.$setData(update);

		// Stop tracking changes
		this.model.$events.changed.off(listener);

		if(Object.keys(changes).length > 0) {
			// If anything changed, broadcast new state to everyone
			this.sendFullState();
		} else {
			log.log(`No changes in update from ${socket.id}.`);
		}
	}

	destroy() {
		this.events.destroyed.fire(new ServerDestroyedEvent(this.id, this.io));
	}
}
