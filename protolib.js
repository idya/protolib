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

	var arraySlice, eachOwn, shadowedEnumerableBug, objectCreate, preventExtensions, getPrototypeOf, SuperWrapper, Interface, Proto;

	arraySlice = Array.prototype.slice;

	(function() {
		// JScript DontEnum bug workaround
		var a, t, i, key, b;
		a = [ "constructor", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "toLocaleString", "toString", "valueOf" ];
		t = {};
		for (i = (a.length - 1); i >= 0; i--) {
			t[a[i]] = false;
		}
		for (key in t) {
			t[key] = true;
		}
		for (i = (a.length - 1); i >= 0; i--) {
			if (t[a[i]]) {
				a.splice(i, 1);
			}
		}
		b = a.length > 0;
		eachOwn = function eachOwn(o, fn) {
			var key, i;
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					fn(o[key], key);
				}
			}
			if (b) {
				for (i = (a.length - 1); i >= 0; i--) {
					key = a[i];
					if (o.hasOwnProperty(key)) {
						fn(o[key], key);
					}
				}
			}
		};
	}());

	(function() {
		// http://stackoverflow.com/questions/13714938/inherited-non-enumerable-properties-in-for-in-loop-javascript workaround
		var o1, o2, key;
		shadowedEnumerableBug = false;
		if (Object.create) {
			o1 = {
				x: true
			};
			o2 = Object.create(o1, {
				x: {
					enumerable: false,
					value: true
				}
			});
			for (key in o2) {
				if (key === "x") {
					shadowedEnumerableBug = true;
				}
			}
		}
	}());

	function each(o, fn) {
		var key;
		for (key in o) {
			fn(o[key], key);
		}
	}

	function DummyCtor() {
	}

	if (Object.create) {
		objectCreate = Object.create;
	} else {
		objectCreate = function(proto, props) {
			var o;
			DummyCtor.prototype = proto;
			o = new DummyCtor();
			if (props) {
				eachOwn(props, function(m, key) {
					o[key] = m.value;
				});
			}
			return o;
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
			if (d) {
				return d;
			}
			obj = getPrototypeOf(obj);
		} while (obj);
	}

	SuperWrapper = objectCreate(Object.prototype);
	preventExtensions(SuperWrapper);

	function superWrap(method) {
		var w;
		w = objectCreate(SuperWrapper);
		w.method = method;
		return w;
	}

	function doSuperWrap(method, proto) {
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
	 * @option superWrapAlways
	 * @option isPublicFn
	 * @option returnProxy
	 * @option defaultConfigurable
	 * @option defaultEnumerable
	 * @option defaultWritable
	 * @option defaultExtensible
	 * @option shadowedEnumerableFix
	 */
	function createCreate(options) {
		var ctorName, superWrapAlways, isPublicFn, returnProxy;
		var defaultConfigurable, defaultEnumerable, defaultWritable, defaultExtensible, shadowedEnumerableFix;
		options = options || {};
		ctorName = opt(options.ctorName, "constructor");
		superWrapAlways = opt(options.superWrapAlways, false);
		isPublicFn = options.isPublicFn;
		returnProxy = opt(options.returnProxy, false);
		defaultConfigurable = opt(options.defaultConfigurable, true);
		defaultEnumerable = opt(options.defaultEnumerable, true);
		defaultWritable = opt(options.defaultWritable, true);
		defaultExtensible = opt(options.defaultExtensible, true);
		return function(proto, members, extensible, ctorArgs) {
			var props, o, iface, ctor;
			extensible = opt(extensible, defaultExtensible);
			props = {};
			if ((!Object.getPrototypeOf) && (!props.__proto__)) {
				props.__proto__ = {
					value: proto
				};
			}
			if (null != members) {
				eachOwn(members, function(m, key) {
					if (key === "__proto__") {
						throw new Error("Invalid member name '" + key + "'");
					}
					if (SuperWrapper.isPrototypeOf(m)) {
						m = doSuperWrap(m, proto);
					} else if (superWrapAlways) {
						if ((typeof m) === "function") {
							m = doSuperWrap(m, proto);
						}
					}
					if ((null == m) || ((typeof m) !== "object")) {
						m = {
							configurable: defaultConfigurable,
							writable: defaultWritable,
							value: m
						};
						if (SuperWrapper.isPrototypeOf(m.value)) {
							m = doSuperWrap(m, proto);
						} else if (superWrapAlways) {
							if ((typeof m) === "function") {
								m = doSuperWrap(m, proto);
							}
						}
						if (key === ctorName) {
							m.enumerable = false;
						} else if (isPublicFn) {
							m.enumerable = isPublicFn(key, m.value);
						} else {
							m.enumerable = defaultEnumerable;
						}
					}
					props[key] = m;
				});
			}
			o = objectCreate(proto, props);
			if (returnProxy) {
				props = {};
				if (Object.create) { // ES5
					each(o, function(m, key) {
						var p, desc;
						if (shadowedEnumerableBug && shadowedEnumerableFix) {
							desc = getPropertyDescriptorES5(o, key);
							if (!desc.enumerable) {
								return;
							}
						}
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
							if (!desc) {
								desc = getPropertyDescriptorES5(o, key);
							}
							if (desc.writable || desc.set) {
								p.set = function set(v) {
									o[key] = v;
								};
							}
						}
					});
					iface = objectCreate(Interface, props);
				} else { // pre-ES5
					each(o, function(m, key) {
						// XXX JScript DontEnum bug
						if (((typeof m) === "function") && (key !== ctorName) && (key !== "__proto__")
								&& ((isPublicFn && isPublicFn(key, m)) || ((!isPublicFn) && defaultEnumerable))) {
							props[key] = {
								value: function() {
									return m.apply(o, arguments);
								}
							};
						}
					});
					iface = objectCreate(Interface, props);
				}
				preventExtensions(iface);
				o.iface = iface;
			}
			if (ctorArgs) {
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

	Proto = objectCreate(Object.prototype, {
		constructor: {
			value: function ProtoCtor() {
			}
		},
		hasPrototype: {
			enumerable: true,
			value: function hasPrototype(o) {
				return o.isPrototypeOf(this);
			}
		}
	});
	preventExtensions(Proto);
	Proto.constructor.prototype = Proto;

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

	function createLifecycleHelperDescriptor(ctorName) {
		var d;
		ctorName = opt(ctorName, "constructor");
		d = {};
		d[ctorName] = {
			value: function() {
				var a, o, i, fn;
				this._destroyFns = [];
				a = [];
				o = this;
				for (;;) {
					o = getPrototypeOf(o);
					if (!o) {
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
		};
		d._addDestroyFn = {
			value: function _addDestroyFn(fn) {
				this._destroyFns.push(fn);
			}
		};
		d.destroy = {
			enumerable: true,
			value: function destroy() {
				var i, dfns;
				dfns = this._destroyFns;
				for (i = dfns.length - 1; i >= 0; i--) {
					dfns[i].call(this);
				}
				delete this._destroyFns;
			}
		};
	}

	// exports:

	exports.getPrototypeOf = getPrototypeOf;
	exports.createCreate = createCreate;
	exports.Interface = Interface;
	exports.superWrap = superWrap;
	exports.Proto = Proto;
	exports.isInterfaceOf = isInterfaceOf;
	exports.createLifecycleHelperDescriptor = createLifecycleHelperDescriptor;
}));
