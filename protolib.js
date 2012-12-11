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

	var isPrototypeOf, hasOwnProperty, propertyDescriptorKeys, bind;
	var eachOwn, shadowedEnumerableBug, objectCreate, preventExtensions, getPrototypeOf, SuperWrapMarker, Interface;

	isPrototypeOf = Object.prototype.isPrototypeOf;
	hasOwnProperty = Object.prototype.hasOwnProperty;

	propertyDescriptorKeys = [ "configurable", "enumerable", "value", "writable", "get", "set" ];

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
		eachOwn = function(o, fn) {
			var key, i;
			for (key in o) {
				if (hasOwnProperty.call(o, key)) {
					fn(o[key], key);
				}
			}
			if (b) {
				for (i = (a.length - 1); i >= 0; i--) {
					key = a[i];
					if (hasOwnProperty.call(o, key)) {
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

	if (Function.prototype.bind) {
		bind = Function.prototype.bind;
	} else {
		bind = function(thisArg) {
			var fn;
			fn = this;
			return function() {
				return fn.apply(thisArg, arguments);
			};
		};
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

	SuperWrapMarker = objectCreate(Object.prototype);
	preventExtensions(SuperWrapMarker);

	function superWrap(method) {
		var w;
		w = objectCreate(SuperWrapMarker);
		w.method = method;
		w.wrap = true;
		return w;
	}

	function noSuperWrap(method) {
		var w;
		w = objectCreate(SuperWrapMarker);
		w.method = method;
		w.wrap = false;
		return w;
	}

	function doSuperWrap(method, _super) {
		return function() {
			var orig, noOrig;
			if (hasOwnProperty.call(this, "_super")) {
				orig = this._super;
			} else {
				noOrig = true;
			}
			this._super = _super;
			try {
				return method.apply(this, arguments);
			} finally {
				if (noOrig) {
					delete this._super;
				} else {
					this._super = orig;
				}
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
	 * @option propertyDescriptors
	 * @option ctorName
	 * @option superWrapAuto
	 * @option isPublicFn
	 * @option ctorIsPrivate
	 * @option returnInterface
	 * @option defaultConfigurable
	 * @option defaultEnumerable
	 * @option defaultWritable
	 * @option defaultExtensible
	 * @option shadowedEnumerableFix
	 */
	function createObjectFactory(options) {
		var propertyDescriptors, ctorName, superWrapAuto, isPublicFn, ctorIsPrivate, returnInterface;
		var defaultConfigurable, defaultEnumerable, defaultWritable, defaultExtensible, shadowedEnumerableFix;
		options = options || {};
		propertyDescriptors = options.propertyDescriptors;
		ctorName = opt(options.ctorName, "constructor");
		superWrapAuto = opt(options.superWrapAuto, false);
		isPublicFn = options.isPublicFn;
		ctorIsPrivate = opt(options.ctorIsPrivate, Boolean(isPublicFn));
		returnInterface = opt(options.returnInterface, false);
		defaultConfigurable = opt(options.defaultConfigurable, true);
		defaultEnumerable = opt(options.defaultEnumerable, true);
		defaultWritable = opt(options.defaultWritable, true);
		defaultExtensible = opt(options.defaultExtensible, true);
		shadowedEnumerableFix = opt(options.shadowedEnumerableFix, false);
		return function(proto, members, extensible, ctorArgs) {
			var props, o, iface, ctor;
			if (undefined === proto) {
				proto = Object.prototype;
			}
			if (undefined === extensible) {
				extensible = defaultExtensible;
			}
			props = {};
			if ((!Object.getPrototypeOf) && (!props.__proto__)) {
				props.__proto__ = {
					value: proto
				};
			}
			if (null != members) {
				eachOwn(members, function(m, key) {
					var mm, i, k;
					if (key === "__proto__") {
						throw new Error("Invalid member name '" + key + "'");
					}
					if (propertyDescriptors || ((undefined === propertyDescriptors) && (null != m) && ((typeof m) === "object"))
							&& !SuperWrapMarker.isPrototypeOf(m)) {
						if (null == m) {
							mm = m;
						} else {
							mm = {};
							for (i = propertyDescriptorKeys.length - 1; i >= 0; i--) {
								k = propertyDescriptorKeys[i];
								if (k in m) {
									mm[k] = m[k];
								}
							}
							if (undefined === mm.configurable) {
								mm.configurable = defaultConfigurable;
							}
							if (undefined === mm.writable) {
								if (!(("get" in mm) || ("set" in mm))) {
									mm.writable = defaultWritable;
								}
							}
						}
					} else {
						mm = {
							configurable: defaultConfigurable,
							writable: defaultWritable,
							value: m
						};
					}
					if (null != mm) {
						if (undefined === mm.enumerable) {
							if (ctorIsPrivate && (key === ctorName)) {
								mm.enumerable = false;
							} else if (isPublicFn) {
								mm.enumerable = isPublicFn(key, mm.value);
							} else {
								mm.enumerable = defaultEnumerable;
							}
						}
						if (SuperWrapMarker.isPrototypeOf(mm.value)) {
							if (mm.value.wrap) {
								if (null == proto) {
									mm.value = mm.value.method;
								} else {
									mm.value = doSuperWrap(mm.value.method, proto[key]);
								}
							} else {
								mm.value = mm.value.method;
							}
						} else if (superWrapAuto && (null != proto) && (key in proto) && ((typeof mm.value) === "function")) {
							mm.value = doSuperWrap(mm.value, proto[key]);
						}
					}
					props[key] = mm;
				});
			}
			o = objectCreate(proto, props);
			if (returnInterface) {
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
							p.value = bind.call(m, o);
							p.writable = false;
						} else {
							p.get = function get() {
								return o[key];
							};
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
						if (((typeof m) === "function") && (!(ctorIsPrivate && (key === ctorName))) && (key !== "__proto__")
								&& ((isPublicFn && isPublicFn(key, m)) || ((!isPublicFn) && defaultEnumerable))) {
							props[key] = {
								value: bind.call(m, o)
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
				if ((ctorArgs.length > 0) || ((typeof ctor) === "function")) {
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

	/**
	 * @option addLifecycleSupport
	 * @option proto
	 * @option extensible
	 * @option ctorName
	 * @option superWrapAuto
	 * @option defaultConfigurable
	 * @option defaultEnumerable
	 * @option defaultWritable
	 */
	function createBase(options, customMembers) {
		var addLifecycleSupport, ctorName, opts, create, members, base;
		options = options || {};
		addLifecycleSupport = opt(options.addLifecycleSupport, false);
		ctorName = opt(options.ctorName, "constructor");
		opts = {
			propertyDescriptors: undefined,
			ctorName: ctorName,
			superWrapAuto: options.superWrapAuto,
			defaultConfigurable: options.defaultConfigurable,
			defaultEnumerable: options.defaultEnumerable,
			defaultWritable: options.defaultWritable,
			defaultExtensible: false
		};
		create = createObjectFactory(opts);
		members = {};
		if (ctorName === "constructor") {
			members.constructor = {
				configurable: false,
				enumerable: false,
				writable: false,
				value: function BaseCtor() {
				}
			};
		}
		if ((!options.proto) || ((typeof options.proto.hasPrototype) !== "function")) {
			members.hasPrototype = {
				configurable: false,
				enumerable: true,
				writable: false,
				value: function hasPrototype(o) {
					return isPrototypeOf.call(o, this);
				}
			};
		}
		if (addLifecycleSupport) {
			members[ctorName] = {
				configurable: false,
				enumerable: false,
				writable: false,
				value: function() {
					var a, o, i, fn;
					this._finalizers = [];
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
						if (hasOwnProperty.call(o, "_deinit")) {
							fn = o._deinit;
							if ((typeof fn) === "function") {
								this._registerFinalizer(fn);
							}
						}
						if (hasOwnProperty.call(o, "_init")) {
							fn = o._init;
							if ((typeof fn) === "function") {
								fn.apply(this, arguments);
							}
						}
					}
				}
			};
			members._registerFinalizer = {
				configurable: false,
				enumerable: false,
				writable: false,
				value: function _registerFinalizer(fn) {
					this._finalizers.push(fn);
				}
			};
			members.finalize = {
				configurable: false,
				enumerable: true,
				writable: false,
				value: function finalize() {
					var i, fs;
					fs = this._finalizers;
					for (i = fs.length - 1; i >= 0; i--) {
						fs[i].call(this);
					}
					delete this._finalizers;
				}
			};
		}
		if (null != customMembers) {
			eachOwn(customMembers, function(m, key) {
				members[key] = m;
			});
		}
		base = create(options.proto, members, options.extensible);
		if (base.hasOwnProperty("constructor") && ((typeof base.constructor) === "function")) {
			base.constructor.prototype = base;
		}
		return base;
	}

	function isInterfaceOf(o, proto) {
		if ((o === proto) || isPrototypeOf.call(proto, o)) {
			return true;
		}
		if (!Interface.isPrototypeOf(o)) {
			return false;
		}
		if ((typeof o.hasPrototype) === "function") {
			return o.hasPrototype(proto);
		}
	}

	// exports:

	exports.getPrototypeOf = getPrototypeOf;
	exports.superWrap = superWrap;
	exports.noSuperWrap = noSuperWrap;
	exports.Interface = Interface;
	exports.createObjectFactory = createObjectFactory;
	exports.createBase = createBase;
	exports.isInterfaceOf = isInterfaceOf;
}));
