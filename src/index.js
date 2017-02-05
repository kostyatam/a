"use strict"
let {COMPLETE, EVERY, FAIL}  = {
	'COMPLETE': 'COMPLETE',
	'EVERY': 'EVERY',
	'FAIL': 'FAIL'
}
class Streamer {
	constructor (schema) {
		this._schema = schema;
		this._state = {};
		this._oldState = {};
		this.listeners = {
			[EVERY]: [],
			[COMPLETE]: [],
			[FAIL]: []
		};
		this.version = 0;
	}

	fail (...args) {
		this._on.apply(this, [FAIL].concat(args));
	}

	complete (...args) {
		this._on.apply(this, [COMPLETE].concat(args));
	}

	every (...args) {
		this._on.apply(this, [EVERY].concat(args));
	}

	_on (type, ...args) {
		this.listeners[type].push(handler);
		return this;
	}

	update (object) {
		let changes = {};
		for (let field of Object.keys(object)) {
			if (!this._schema.hasOwnProperty(field)) {
				continue;
			}
			changes[field] = object[field];
		}

		let oldState = Object.assign({}, this._state);
		let state = Object.assign({}, oldState, changes);
		let version = this.version++;
		this.listeners[EVERY].map(listener => {
			listener(state, oldState);

		});

		if (this.isValid(state)) {
			this.listeners[COMPLETE].map(listener => {
				listener(state, oldState);
			});
		} else {
			this.listeners[FAIL].map(listener => {
				listener(state, oldState);
			});
		}


		this._state = state;
		this._oldState = oldState;
	}

	isValid (state) {
		return Object.keys(this._schema).every(field => {
			let checker = 
				typeof this._schema[field] === 'function' ?
				this._schema[field] :
				(value) => typeof value ===  typeof this._schema[field];
			return state.hasOwnProperty(field) && checker(state[field]);
		});
	}
}

function debouncer (fn, timeout) {
	let timerId = null;
	let mem = [];

	return function (changes) {
		mem.push(changes);
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			let res = fn.call(this, mem);
			mem =  Array.isArray(res) ? res : [];
		}, timeout);
	}
}