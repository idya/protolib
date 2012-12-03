/*
 * protolib.js 1.0
 * (c) 2012 Zsolt Szloboda, Idya Ltd.
 * Released under the MIT license
 */

(function(global, moduleFn) {
	if ((typeof exports) === "object") { // CommonJS
		moduleFn(exports);
	} else if (((typeof define) === "function") && define.amd) { // AMD
		define([ "exports" ], moduleFn);
	} else { // Browser globals
		moduleFn((global.proto = {}));
	}
}(this, function(exports) {
	"use strict";

	var arraySlice, objectCreate, preventExtensions, getPrototypeOf, SuperWrapper, Interface, ex;
	var _create, _protoInherit, protoInherit, _protoCreate, protoCreate, Proto, ProtoEx;
	var _encapsulatedInherit, encapsulatedInherit, _encapsulatedCreate, encapsulatedCreate, Encapsulated, EncapsulatedEx;

	arraySlice = Array.prototype.slice;

	function DummyCtor() {
	}

	if (Object.create) {
		objectCreate = Object.create;
	} else {
		objectCreate = function(proto, props) {
			var o, key;
			DummyCtor.prototype = proto;
			o = new DummyCtor();
			for (key in props) {
				o[key] = props[key].value;
			}
			return o;
		};
	}

	if (Object.preventExtensions) {
		preventExtensions = Object.preventExtensions;
	} else {
		preventExtensions = function() {
		};
	}

	if (Object.getPrototypeOf) {
		getPrototypeOf = Object.getPrototypeOf;
	} else {
		getPrototypeOf = function(obj) {
			return obj.__proto__;
		};
	}

	function getPropertyDescriptorES5(obj, prop) {
		var d;
		do {
			d = Object.getOwnPropertyDescriptor(obj, prop);
			if (null != d) {
				return d;
			}
			obj = getPrototypeOf(obj);
		} while (obj);
	}

	SuperWrapper = {
		wrap: {
			value: function(proto) {
				var method;
				method = this.method;
				return function() {
					var superOrig, superApplyOrig;
					superOrig = this._super;
					superApplyOrig = this._superApply;
					this._super = function _super(methodName /* *args */) {
						var args;
						args = arraySlice.call(arguments, 1);
						return proto[methodName].apply(this, args);
					};
					this._superApply = function _superApply(methodName, args) {
						return proto[methodName].apply(this, args);
					};
					try {
						return method.apply(this, arguments);
					} finally {
						this._super = superOrig;
						this._superApply = superApplyOrig;
					}
				};
			}
		}
	};
	preventExtensions(SuperWrapper);

	Interface = {};
	preventExtensions(Interface);

	function opt(optValue, optDefault) {
		if (undefined === optValue) {
			return optDefault;
		} else {
			return optValue;
		}
	}

	/**
	 * @option ctorName
	 * @option isPublicFn
	 * @option returnProxy
	 * @option defaultConfigurable
	 * @option defaultEnumerable
	 * @option defaultWritable
	 * @option defaultExtensible
	 */
	function createCreate(options) {
		var ctorName, isPublicFn, returnProxy, defaultConfigurable, defaultEnumerable, defaultWritable, defaultExtensible;
		options = options || {};
		ctorName = opt(options.ctorName, "constructor");
		isPublicFn = options.isPublicFn;
		returnProxy = opt(options.returnProxy, false);
		defaultConfigurable = opt(options.defaultConfigurable, true);
		defaultEnumerable = opt(options.defaultEnumerable, true);
		defaultWritable = opt(options.defaultWritable, true);
		defaultExtensible = opt(options.defaultExtensible, true);
		return function(proto, members, extensible, ctorArgs) {
			var props, key, m, o, desc, p, iface, ctor;
			if (undefined === extensible) {
				extensible = defaultExtensible;
			}
			props = {};
			if ((!Object.getPrototypeOf) && (null == props.__proto__)) {
				props.__proto__ = {
					value: proto
				};
			}
			if (null != members) {
				for (key in members) {
					if (members.hasOwnProperty(key)) {
						m = members[key];
						if ((null == m) || ((typeof m) !== "object")) {
							m = {
								configurable: defaultConfigurable,
								writable: defaultWritable,
								value: m
							};
							if (SuperWrapper.isPrototypeOf(m.value)) {
								m.value = m.value.wrap(proto);
							}
							if (key === ctorName) {
								m.enumerable = false;
							} else if (null != isPublicFn) {
								m.enumerable = isPublicFn(key, m);
							} else {
								m.enumerable = defaultEnumerable;
							}
						} else if (SuperWrapper.isPrototypeOf(m)) {
							m = m.wrap(proto);
						}
						props[key] = m;
					}
				}
			}
			o = objectCreate(this, props);
			if (returnProxy) {
				props = {};
				if (Object.defineProperty) { // ES5
					for (key in o) {
						props[key] = p = {
							configurable: false,
							enumerable: true
						};
						m = o[key];
						if ((typeof m) === "function") {
							(function(m) {
								p.value = function() {
									return m.apply(o, arguments);
								};
							}(m));
							p.writable = false;
						} else {
							(function(key) {
								p.get = function get() {
									return o[key];
								};
							}(key));
							desc = getPropertyDescriptorES5(o, key);
							if (desc.writable || desc.set) {
								(function(key) {
									p.set = function set(v) {
										o[key] = v;
									};
								}(key));
							}
						}
					}
				} else { // pre-ES5
					for (key in o) {
						m = o[key];
						if (((typeof m) === "function") && (key !== ctorName) && (key !== "__proto__") && ((null == isPublicFn) || isPublicFn(key, m))) {
							(function(m) {
								iface[key] = function() {
									return m.apply(o, arguments);
								};
							}(m));
						}
					}
				}
				o.iface = iface = objectCreate(Interface, props);
				preventExtensions(iface);
			}
			if (null != ctorArgs) {
				ctor = o[ctorName];
				if ((typeof ctor) === "function") {
					ctor.apply(o, ctorArgs);
				}
			}
			if (!extensible) {
				preventExtensions(o);
			}
			if (iface) {
				return iface;
			} else {
				return o;
			}
		};
	}

	function superWrap(method) {
		var w;
		w = objectCreate(SuperWrapper);
		w.method = method;
		return w;
	}

	function isInterfaceOf(o, proto) {
		if ((o === proto) || proto.isPrototypeOf(o)) {
			return true;
		}
		if (!Interface.isPrototypeOf(o)) {
			return false;
		}
		if ((typeof o.hasPrototype) === "function") {
			return o.hasPrototype(proto);
		}
	}

	ex = {

		// member variables: _destroyFns

		constructor: function() {
			var a, o, i, fn;
			this._destroyFns = [];
			a = [];
			o = this;
			for (;;) {
				o = getPrototypeOf(o);
				if (null == o) {
					break;
				}
				a.push(o);
			}
			for (i = a.length - 1; i >= 0; i--) {
				o = a[i];
				if (o.hasOwnProperty("_dispose")) {
					fn = o._dispose;
					if ((typeof fn) === "function") {
						this._addDestroyFn(fn);
					}
				}
				if (o.hasOwnProperty("_init")) {
					fn = o._init;
					if ((typeof fn) === "function") {
						fn.apply(this, arguments);
					}
				}
			}
		},

		_addDestroyFn: function _addDestroyFn(fn) {
			this._destroyFns.push(fn);
		},

		destroy: function destroy() {
			var i, dfns;
			dfns = this._destroyFns;
			for (i = dfns.length - 1; i >= 0; i--) {
				dfns[i].call(this);
			}
			delete this._destroyFns;
		}
	};

	// using the tools:

	_create = createCreate({
		defaultConfigurable: true,
		defaultEnumerable: true,
		defaultWritable: true,
		defaultExtensible: true
	});
	function create(proto, members, extensible) {
		return _create(proto, members, extensible, null);
	}

	function ProtoCtor() {
	}

	_protoInherit = createCreate({
		defaultConfigurable: false,
		defaultEnumerable: false,
		defaultWritable: false,
		defaultExtensible: false
	});
	protoInherit = function inherit(members, extensible) {
		return _protoInherit(this, members, extensible, null);
	};

	_protoCreate = createCreate({
		defaultConfigurable: true,
		defaultEnumerable: true,
		defaultWritable: true,
		defaultExtensible: true
	});
	protoCreate = function create(/* *args */) {
		return _protoCreate(this, null, null, arguments);
	};

	function hasPrototype(o) {
		return o.isPrototypeOf(this);
	}

	Proto = protoInherit.call(Object.prototype, {
		constructor: ProtoCtor,
		inherit: protoInherit,
		create: protoCreate,
		hasPrototype: hasPrototype
	});

	ProtoEx = Proto.inherit(ex);

	function isPublic(key, m) {
		if ((key.charAt(0) === "_") || ((typeof m) !== "function")) {
			return false;
		}
		switch (key) {
		case "inherit":
		case "create":
			return false;
			break; // XXX Eclipse JS parsing bug
		}
		return true;
	}

	_encapsulatedInherit = createCreate({
		isPublicFn: isPublic,
		returnProxy: false,
		defaultConfigurable: false,
		defaultEnumerable: false,
		defaultWritable: false,
		defaultExtensible: false
	});
	encapsulatedInherit = function inherit(members, extensible) {
		return _encapsulatedInherit(this, members, extensible, null);
	};

	_encapsulatedCreate = createCreate({
		isPublicFn: isPublic,
		returnProxy: true,
		defaultConfigurable: true,
		defaultEnumerable: true,
		defaultWritable: true,
		defaultExtensible: true
	});
	encapsulatedCreate = function create(/* *args */) {
		return _encapsulatedCreate(this, null, null, arguments);
	};

	Encapsulated = Proto.inherit({
		inherit: encapsulatedInherit,
		create: encapsulatedCreate
	});

	EncapsulatedEx = Encapsulated.inherit(ex);

	// exports:

	exports.getPrototypeOf = getPrototypeOf;
	exports.createCreate = createCreate;
	exports.Interface = Interface;
	exports.superWrap = superWrap;
	exports.isInterfaceOf = isInterfaceOf;
	exports.ex = ex;
	exports.create = create;
	exports.Proto = Proto;
	exports.ProtoEx = ProtoEx;
	exports.Encapsulated = Encapsulated;
	exports.EncapsulatedEx = EncapsulatedEx;
}));
