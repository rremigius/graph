import {Server} from "socket.io";
import {forEach, isNumber} from "lodash";
import {v4 as uuid} from "uuid";
import Log from "log-control";
import GraphServer from "./GraphServer"

const log = Log.instance("graph-server-hub");

export default class GraphServerHub {
	constructor(options) {
		const $options = options || {};

		this.servers = {};

		this.port = isNumber($options.io) ? $options.io : 3000;
		this.sessionEmptyDestroyTimeout = isNumber($options.sessionEmptyDestroyTimeout)
			? $options.sessionEmptyDestroyTimeout
			: 10000;

		if ($options.io instanceof Server) {
			this.io = $options.io;
			this.isDefaultIO = false;
		} else {
			this.io = new Server();
			this.isDefaultIO = true;
		}
	}

	getServer(session) {
		return this.servers[session];
	}

	createSession(model) {
		const id = uuid();
		log.info(`Creating session: ${id}...`);
		const namespace = this.io.of('/' + id);

		const server = new GraphServer(id, namespace, model);

		this.servers[id] = server;
		server.start();

		server.events.destroyed.on(event => {
			this.clearSession(event.id, event.ioNamespace);
		});

		return {id, server};
	}

	clearSession(id, ioNamespace) {
		ioNamespace.removeAllListeners();
		delete this.io._nsps['/' + id];
		delete this.servers[id];
	}

	start() {
		if(this.isDefaultIO) {
			this.io.listen(this.port);
		}
		log.info("Server hub started.");
		this.io.on('connection', socket => {
			socket.emit('hub:connected');
			socket.on('hub:session:create', ({model}) => {
				const session = this.createSession(model);
				socket.emit('hub:session:created', {id: session.id});

				session.server.events.destroyed.on(event => {
					this.clearSession(event.id, event.ioNamespace);
				});
			})
		});
	}

	stop() {
		forEach(this.servers, server => server.stop());
		if(this.isDefaultIO) {
			this.io.close();
		}
	}

	destroy() {
		this.stop();
		forEach(this.servers, server => server.destroy());
	}
}
