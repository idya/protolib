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

	var arraySlice, objectCreate, defineProperty, preventExtensions, getPrototypeOf, SuperWrapper, Interface, ex;
	var _create, create, _protoInherit, protoInherit, _protoCreate, protoCreate, Proto, ProtoEx;
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
			if (null != props) {
				for (key in props) {
					if (props.hasOwnProperty(key)) {
						o[key] = props[key].value;
					}
				}
				key = "constructor";
				if (props.hasOwnProperty(key) && !o.hasOwnProperty(key)) {
					// XXX JScript DontEnum Bug
					o[key] = props[key].value;
				}
			}
			return o;
		};
	}

	if (Object.defineProperty) {
		defineProperty = Object.defineProperty;
		try {
			// XXX IE8 bug
			defineProperty({}, "x", {});
		} catch (ex) {
			defineProperty = null;
		}
	}
	if (null == defineProperty) {
		defineProperty = function(obj, prop, descriptor) {
			obj[prop] = descriptor.value;
		};
	}

	if (Object.preventExtensions) {
		preventExtensions = Object.preventExtensions;
	} else {
		preventExtensions = function(obj) {
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

	SuperWrapper = objectCreate(Object.prototype, {
		wrap: {
			enumerable: true,
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
	});
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
			var props, key, o, fn, desc, p, iface, ctor;
			extensible = opt(extensible, defaultExtensible);
			props = {};
			if ((!Object.getPrototypeOf) && (null == props.__proto__)) {
				props.__proto__ = {
					value: proto
				};
			}
			if (null != members) {
				fn = function(m, key) {
					if (key === "__proto__") {
						throw new Error("Invalid member name '" + key + "'"); // XXX
					}
					if (SuperWrapper.isPrototypeOf(m)) {
						m = m.wrap(proto);
					}
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
							m.enumerable = isPublicFn(key, m.value);
						} else {
							m.enumerable = defaultEnumerable;
						}
					}
					props[key] = m;
				};
				for (key in members) {
					if (members.hasOwnProperty(key)) {
						fn(members[key], key);
					}
				}
				if (members.hasOwnProperty(ctorName) && !props.hasOwnProperty(ctorName)) {
					// XXX JScript DontEnum Bug
					fn(members[ctorName], ctorName);
				}
			}
			o = objectCreate(proto, props);
			if (returnProxy) {
				props = {};
				if (null != isPublicFn) {
					if (Object.create) { // ES5
						fn = function(m, key) {
							props[key] = p = {
								configurable: false,
								enumerable: true
							};
							if ((typeof m) === "function") {
								p.value = function() {
									return m.apply(o, arguments);
								};
								p.writable = false;
							} else {
								(function(key) {
									p.get = function get() {
										return o[key];
									};
								}(key));
								desc = getPropertyDescriptorES5(o, key);
								if (desc.writable || desc.set) {
									p.set = function set(v) {
										o[key] = v;
									};
								}
							}
						};
						for (key in o) {
							// XXX http://stackoverflow.com/questions/13714938/inherited-non-enumerable-properties-in-for-in-loop-javascript
							// but: should not override public with private
							fn(o[key], key);
						}
						iface = objectCreate(Interface, props);
					} else { // pre-ES5
						fn = function(m, key) {
							if (((typeof m) === "function") && (key !== ctorName) && (key !== "__proto__") && isPublicFn(key, m)) {
								props[key] = {
									value: function() {
										return m.apply(o, arguments);
									}
								};
							}
						};
						for (key in o) {
							fn(o[key], key);
						}
						iface = objectCreate(Interface, props);
					}
				}
				preventExtensions(iface);
				o.iface = iface;
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

	ex = objectCreate(Object.prototype, {

		// member variables: _destroyFns

		constructor: {
			enumerable: true,
			value: function() {
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
			}
		},

		_addDestroyFn: {
			enumerable: true,
			value: function _addDestroyFn(fn) {
				this._destroyFns.push(fn);
			}
		},

		destroy: {
			enumerable: true,
			value: function destroy() {
				var i, dfns;
				dfns = this._destroyFns;
				for (i = dfns.length - 1; i >= 0; i--) {
					dfns[i].call(this);
				}
				delete this._destroyFns;
			}
		}
	});
	preventExtensions(ex);

	// using the tools:

	_create = createCreate({
		defaultConfigurable: true,
		defaultEnumerable: true,
		defaultWritable: true,
		defaultExtensible: true
	});
	create = function create(proto, members, extensible) {
		return _create(proto, members, extensible, undefined);
	};

	function ProtoCtor() {
	}

	_protoInherit = createCreate({
		defaultConfigurable: false,
		defaultEnumerable: true,
		defaultWritable: false,
		defaultExtensible: false
	});
	protoInherit = function inherit(members, extensible) {
		return _protoInherit(this, members, extensible, undefined);
	};

	_protoCreate = createCreate({
		defaultConfigurable: true,
		defaultEnumerable: true,
		defaultWritable: true,
		defaultExtensible: true
	});
	protoCreate = function create(/* *args */) {
		return _protoCreate(this, undefined, undefined, arguments);
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
	ProtoCtor.prototype = Proto;

	ProtoEx = Proto.inherit(ex);

	function EncapsulatedCtor() {
	}

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
		defaultEnumerable: true,
		defaultWritable: false,
		defaultExtensible: false
	});
	encapsulatedInherit = function inherit(members, extensible) {
		return _encapsulatedInherit(this, members, extensible, undefined);
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
		return _encapsulatedCreate(this, undefined, undefined, arguments);
	};

	// XXX should inherit from Proto (no need for constructor and hasPrototype), but:
	// http://stackoverflow.com/questions/13714938/inherited-non-enumerable-properties-in-for-in-loop-javascript
	Encapsulated = encapsulatedInherit.call(Object.prototype, {
		constructor: EncapsulatedCtor,
		inherit: encapsulatedInherit,
		create: encapsulatedCreate,
		hasPrototype: hasPrototype
	});
	EncapsulatedCtor.prototype = Encapsulated;

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
