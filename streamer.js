"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _COMPLETE$EVERY$FAIL = {
	'COMPLETE': 'COMPLETE',
	'EVERY': 'EVERY',
	'FAIL': 'FAIL'
},
    COMPLETE = _COMPLETE$EVERY$FAIL.COMPLETE,
    EVERY = _COMPLETE$EVERY$FAIL.EVERY,
    FAIL = _COMPLETE$EVERY$FAIL.FAIL;

var Streamer = function () {
	function Streamer(schema) {
		var _listeners;

		_classCallCheck(this, Streamer);

		this._schema = schema;
		this._state = {};
		this._oldState = {};
		this.listeners = (_listeners = {}, _defineProperty(_listeners, EVERY, []), _defineProperty(_listeners, COMPLETE, []), _defineProperty(_listeners, FAIL, []), _listeners);
		this.version = 0;
	}

	_createClass(Streamer, [{
		key: 'fail',
		value: function fail() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			this._on.apply(this, [FAIL].concat(args));
		}
	}, {
		key: 'complete',
		value: function complete() {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			this._on.apply(this, [COMPLETE].concat(args));
		}
	}, {
		key: 'every',
		value: function every() {
			for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				args[_key3] = arguments[_key3];
			}

			this._on.apply(this, [EVERY].concat(args));
		}
	}, {
		key: '_on',
		value: function _on(type) {
			this.listeners[type].push(handler);
			return this;
		}
	}, {
		key: 'update',
		value: function update(object) {
			var changes = {};
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Object.keys(object)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var field = _step.value;

					if (!this._schema.hasOwnProperty(field)) {
						continue;
					}
					changes[field] = object[field];
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var oldState = Object.assign({}, this._state);
			var state = Object.assign({}, oldState, changes);
			var version = this.version++;
			this.listeners[EVERY].map(function (listener) {
				listener(state, oldState);
			});

			if (this.isValid(state)) {
				this.listeners[COMPLETE].map(function (listener) {
					listener(state, oldState);
				});
			} else {
				this.listeners[FAIL].map(function (listener) {
					listener(state, oldState);
				});
			}

			this._state = state;
			this._oldState = oldState;
		}
	}, {
		key: 'isValid',
		value: function isValid(state) {
			var _this = this;

			return Object.keys(this._schema).every(function (field) {
				var checker = typeof _this._schema[field] === 'function' ? _this._schema[field] : function (value) {
					return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === _typeof(_this._schema[field]);
				};
				return state.hasOwnProperty(field) && checker(state[field]);
			});
		}
	}]);

	return Streamer;
}();

function debouncer(fn, timeout) {
	var timerId = null;
	var mem = [];

	return function (changes) {
		var _this2 = this;

		mem.push(changes);
		clearTimeout(timerId);
		timerId = setTimeout(function () {
			var res = fn.call(_this2, mem);
			mem = Array.isArray(res) ? res : [];
		}, timeout);
	};
}
