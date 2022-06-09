const {
	Log,
	isComplexValue
} = window.Graph;

const log = Log.instance("graph-client");

export const State = {
	DISCONNECTED: 'DISCONNECTED',
	CONNECTING: 'CONNECTING',
	CONNECTED: 'CONNECTED'
}
export default class MozelSyncClient {
	constructor(model, server, sessionID = null) {
		this._io = null;
		this._model = model;
		this._remote = model.$cloneDeep();
		this._server = server;
		this._state = State.DISCONNECTED;
		this._sessionID = sessionID;
		this._connectingPromiseCallbacks = {resolve:()=>{}, reject:()=>{}};
		this._connecting = new Promise((resolve, reject) => {
			this._connectingPromiseCallbacks.resolve = resolve;
			this._connectingPromiseCallbacks.reject = reject;
		});
		this._modelChangeHandler = null;
	}

	connecting() {
		return this._connecting;
	}

	getModel() {
		return this._model;
	}
	getSessionID() {
		return this._sessionID;
	}

	createFullState() {
		return this._model.$export();
	}
	createSessionUrl(sessionID) {
		return `${this._server}/${sessionID}`;
	}

	setupSessionIO() {
		// Connected to session
		this._io.on('connected', event => {
			log.info(`Connected to server.`);
			this._connectingPromiseCallbacks.resolve(event.id);
			this._state = State.CONNECTED;
		});
		this._io.on('error', error => {
			log.error("Connection error:", error);
			this._connectingPromiseCallbacks.reject(error);
			this._state = State.DISCONNECTED;
		})
		// Handle updates
		this._io.on('full-state', state => {
			log.log("Received full state", state);
			this.setFullState(state);
		});
	}

	setFullState(state) {
		const changes = {};
		const changeListener = this._remote.$events.changed.on(event => {
			const value = this._model.$path(event.path);
			changes[event.path] = isComplexValue(value) ? value.$export() : value;
		});
		this._remote.$setData(state);
		this._remote.$events.changed.off(changeListener);

		// Create temporary change validator to prevent unchanged remote values to overwrite local changes
		const validator = this._model.$watch('*', (change) => {
			log.log(`Remote value rejected in favour of local change (${change.changePath}).`);
			return change.changePath in changes;
		}, {deep: true, validator: true});

		// Apply remote changes
		this._model.$setData(this._remote.$export());

		// Remove temporary watcher
		this._model.$removeWatcher(validator);
	}

	async start() {
		log.info("Starting GraphClient...");
		if(!this._sessionID) {
			this._sessionID = await this.requestSessionFromHub();
		}
		await this.connectToSession(this._sessionID);
		log.info("GraphClient started.");

		this.startSync();
	}

	stop() {
		this.stopSync();
		this.disconnect();
	}

	startSync() {
		this._modelChangeHandler = this._model.$events.changed.on(event => {
			this.throttledSync();
		});
	}

	stopSync() {
		this._model.$events.changed.off(this._modelChangeHandler);
	}

	throttledSync = _.debounce(() => {
		const state = this.createFullState();
		log.info("Sending full state to server", state);

		// Send state to server
		this._io.emit('full-state', state);
	}, 500, {leading: false, trailing: true});

	connectToSession(id) {
		this._sessionID = id;
		const url = this.createSessionUrl(id);
		this._io = io(url);

		this.setupSessionIO(this._io);

		if(this._state === State.CONNECTED) { // start over
			this._connecting = new Promise((resolve, reject) => {
				this._connectingPromiseCallbacks.resolve = resolve;
				this._connectingPromiseCallbacks.reject = reject;
			});
		}
		this._state = State.CONNECTING;
		return this._connecting;
	}

	requestSessionFromHub() {
		return new Promise((resolve, reject) => {
			const hubIO = io(this._server);

			// Connected to hub
			hubIO.on('hub:connected', () => {
				log.info("Connected to hub.");

				// Request new session with current model state
				hubIO.emit('hub:session:create', {
					model: this._model.$export()
				});
			});
			// Session created from Hub
			hubIO.on('hub:session:created', session => {
				log.info(`Session created: ${session.id}`);
				this._sessionID = session.id;

				// Disconnect from hub
				hubIO.off("hub:connected");
				hubIO.off("hub:session:created");
				hubIO.disconnect();

				// Return with session ID
				resolve(session.id);
			});
			hubIO.on('error', reject);
		});
	}

	disconnect() {
		this._io.disconnect();
	}

	destroy() {
		this.stop();
	}
}
