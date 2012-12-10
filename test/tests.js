"use strict";

test("property inheritance", function() {
	var create = proto.createObjectFactory();
	var o = create(null, {
		a: 1,
		b: 2
	});
	var oo = create(o, {
		b: 9,
		c: 8
	});
	strictEqual(oo.a, 1, "inherited property");
	strictEqual(oo.b, 9, "overridden property");
	strictEqual(oo.c, 8, "new property");
});
test("getPrototypeOf", function() {
	var create = proto.createObjectFactory();
	var o = create(undefined);
	strictEqual(proto.getPrototypeOf(o), Object.prototype, "null prototype");
	var o = create(null);
	strictEqual(proto.getPrototypeOf(o), null, "null prototype");
	var oo = create(o);
	strictEqual(proto.getPrototypeOf(oo), o, "non-null prototype");
});
test("default ctor", 2, function() {
	var create = proto.createObjectFactory();
	var o = create(null, {
		constructor: function(p) {
			strictEqual(p, "x", "constructor param");
		}
	}, undefined, [ "x" ]);
	var oo = create(o, undefined, undefined, [ "x" ]);
});
test("no ctor", 0, function() {
	var create = proto.createObjectFactory();
	var o = create(null, undefined, undefined, []);
	var oo = create(o, undefined, undefined, []);
});
test("named ctor", 2, function() {
	var create = proto.createObjectFactory({
		ctorName: "_create"
	});
	var o = create(null, {
		_create: function(p) {
			strictEqual(p, "x", "constructor param");
		}
	}, undefined, [ "x" ]);
	var oo = create(o, undefined, undefined, [ "x" ]);
});
test("extensible", function() {
	var create = proto.createObjectFactory();
	var o = create(null);
	o.a = true;
	ok(true, "defaults");
	create = proto.createObjectFactory({
		defaultExtensible: false
	});
	o = create(null, undefined, true);
	o.a = true;
	ok(true, "extensible=true, defaultExtensible=false");
});
test("unextensible", function() {
	if (Object.preventExtensions) {
		var create = proto.createObjectFactory({
			defaultExtensible: false
		});
		var o = create(null);
		throws(function() {
			o.a = true;
		}, "defaultExtensible=false");
		create = proto.createObjectFactory();
		o = create(null, undefined, false);
		throws(function() {
			o.a = true;
		}, "defaultExtensible=false");
	} else {
		expect(0);
	}
});
test("superWrap-1", 3, function() {
	var create = proto.createObjectFactory();
	var o = create(null, {
		m: proto.superWrap(function(x) {
			strictEqual(x, "a", "1. level");
		})
	});
	var oo = create(o, {
		m: proto.superWrap(function(x) {
			strictEqual(x, "b", "2. level");
			this._super("a");
		})
	});
	var ooo = create(oo, {
		m: proto.superWrap(function(x) {
			strictEqual(x, "c", "3. level");
			this._super("b");
		})
	});
	ooo.m("c");
});
test("superWrap-2", 4, function() {
	var create = proto.createObjectFactory();
	var o = create(null, {
		m: {
			value: proto.superWrap(function(x) {
				strictEqual(x, "a", "1. level");
			})
		}
	});
	var oo = create(o, {
		m: {
			value: proto.superWrap(function(x) {
				strictEqual(x, "b", "2. level");
				this._super("a");
			})
		}
	});
	var ooo = create(oo, {
		m: {
			value: proto.superWrap(function(x) {
				strictEqual(x, "c", "3. level");
				this._super("b");
			})
		}
	});
	oo._super = "x";
	ooo.m("c");
	ok(!Object.prototype.hasOwnProperty.call(ooo, "_super"), "this._super restore");
});
test("superWrapAuto-1", 4, function() {
	var create = proto.createObjectFactory({
		superWrapAuto: true
	});
	var o = create(null, {
		m: function(x) {
			strictEqual(x, "a", "1. level");
		}
	});
	var oo = create(o, {
		m: proto.superWrap(function(x) {
			strictEqual(x, "b", "2. level");
			this._super("a");
		})
	});
	var ooo = create(oo, {
		m: function(x) {
			strictEqual(x, "c", "3. level");
			this._super("b");
		}
	});
	ooo.m("c");
	strictEqual(ooo._super, undefined, "this._super restore");
});
test("superWrapAuto-2", 4, function() {
	var create = proto.createObjectFactory({
		superWrapAuto: true
	});
	var o = create(null, {
		m: {
			value: function(x) {
				strictEqual(x, "a", "1. level");
			}
		}
	});
	var oo = create(o, {
		m: {
			value: function(x) {
				strictEqual(x, "b", "2. level");
				this._super("a");
			}
		}
	});
	var ooo = create(oo, {
		m: {
			value: function(x) {
				strictEqual(x, "c", "3. level");
				this._super("b");
			}
		}
	});
	ooo._super = "x";
	ooo.m("c");
	strictEqual(ooo._super, "x", "this._super restore");
});
test("superWrap > superWrap", function() {
	var s = 0;
	var create = proto.createObjectFactory({
		superWrapAuto: true
	});
	var o = create(null, {
		m: function(n) {
			s += 5 * n;
		},
		k: function(n) {
			s += 3 * n;
		}
	});
	var oo = create(o, {
		m: function(x) {
			this._super(1);
			this.k();
			this._super(10);
		},
		k: function() {
			this._super(100);
		}
	});
	oo.m();
	strictEqual(s, 355);
});
test("superException", function() {
	var create = proto.createObjectFactory();
	var MyError = function() {
	};
	MyError.prototype = Error.prototype;
	var o = create(null, {
		m: {
			value: proto.superWrap(function() {
				throw new MyError();
			})
		}
	});
	o._super = "x";
	throws(function() {
		o.m();
	}, MyError, "exception");
	strictEqual(o._super, "x", "this._super restore");
});
test("noSuperWrap", function() {
	var create = proto.createObjectFactory({
		superWrapAuto: true
	});
	var o = create(null, {
		m: function() {
		}
	});
	var oo = create(o, {
		m: proto.noSuperWrap(function() {
			strictEqual(this._super, undefined, "_super is undefined");
		})
	});
	oo.m();
	oo = create(o, {
		m: {
			value: proto.noSuperWrap(function() {
				strictEqual(this._super, undefined, "_super is undefined");
			})
		}
	});
	oo.m();
});
test("configurable", function() {
	if (!Object.create) {
		expect(0);
	}
	var create = proto.createObjectFactory();
	var o = create(null, {
		m: "x"
	});
	if (Object.create) {
		Object.defineProperty(o, "m", {
			enumerable: false
		});
	}
	create = proto.createObjectFactory({
		defaultConfigurable: false
	});
	o = create(null, {
		m: "x"
	});
	if (Object.create) {
		throws(function() {
			Object.defineProperty(o, "m", {
				enumerable: false
			});
		}, "defaultConfigurable: false");
	}
	o = create(null, {
		m: {
			configurable: true,
			value: "x"
		}
	});
	if (Object.create) {
		Object.defineProperty(o, "m", {
			enumerable: false
		});
	}
});
test("writable", function() {
	if (!Object.create) {
		expect(0);
	}
	var create = proto.createObjectFactory();
	var o = create(null, {
		m: "x"
	});
	o.x = "y";
	create = proto.createObjectFactory({
		defaultWritable: false
	});
	o = create(null, {
		m: "x"
	});
	if (Object.create) {
		throws(function() {
			o.m = "y";
		}, "defaultWritable: false");
	}
	o = create(null, {
		m: {
			writable: true,
			value: "x"
		}
	});
	o.m = "y";
});
test("enumerable", function() {
	var create = proto.createObjectFactory();
	var o = create(null, {
		m: "x"
	});
	ok(Object.prototype.propertyIsEnumerable.call(o, "m"), "defaults");
	create = proto.createObjectFactory({
		defaultEnumerable: false
	});
	o = create(null, {
		m: "x"
	});
	if (Object.create) {
		ok(!Object.prototype.propertyIsEnumerable.call(o, "m"), "defaultEnumerable: false");
	}
	o = create(null, {
		m: {
			enumerable: true,
			value: "x"
		}
	});
	ok(Object.prototype.propertyIsEnumerable.call(o, "m"), "enumerable: true");
});
test("__proto__ member", function() {
	var create = proto.createObjectFactory();
	var d = {};
	d.__proto__ = "x";
	if (d.propertyIsEnumerable("__proto__")) {
		throws(function() {
			var o = create(null, d);
		});
	} else {
		var o = create(null, d);
		expect(0);
	}
});
test("propertyDescriptors option", function() {
	var create = proto.createObjectFactory({
		propertyDescriptors: true
	});
	var o = create(null, {
		m: {
			value: "x"
		}
	});
	strictEqual(o.m, "x", "propertyDescriptors: true");
	create = proto.createObjectFactory({
		propertyDescriptors: false
	});
	o = create(null, {
		m: {
			value: "x"
		}
	});
	strictEqual(o.m.value, "x", "propertyDescriptors: true");
});
test("isPublicFn", function() {
	var create = proto.createObjectFactory({
		isPublicFn: function(key, m) {
			return !(key.charAt(0) === "_");
		}
	});
	var o = create(undefined, {
		publicMember: "x",
		_privateMember: "y"
	});
	ok(o.propertyIsEnumerable("publicMember"), "publicMember");
	if (Object.create) {
		ok(!o.propertyIsEnumerable("_privateMember"), "_privateMember");
	}
});
test("ctorIsPrivate", function() {
	var create = proto.createObjectFactory({
		isPublicFn: function(key, m) {
			return !(key.charAt(0) === "_");
		}
	});
	var o = create(undefined, {
		constructor: "z"
	});
	ok(!o.propertyIsEnumerable("constructor"), "isPublicFn");
	create = proto.createObjectFactory({
		isPublicFn: function(key, m) {
			return !(key.charAt(0) === "_");
		},
		ctorIsPrivate: false
	});
	o = create(undefined, {
		constructor: "z"
	});
	if (Object.create) {
		ok(o.propertyIsEnumerable("constructor"), "ctorIsPrivate: false");
	}
	create = proto.createObjectFactory({});
	o = create(undefined, {
		constructor: "z"
	});
	if (Object.create) {
		ok(o.propertyIsEnumerable("constructor"), "default");
	}
});
test("returnInterface methods", function() {
	var create = proto.createObjectFactory({
		returnInterface: true,
		isPublicFn: function(key, m) {
			return !(key.charAt(0) === "_");
		}
	});
	var o = create(null, {
		_privateMethod: function(a) {
			return a * 2;
		},
		publicMethod: function(p) {
			return this._privateMethod(p + 4);
		}
	});
	strictEqual(o._privateMethod, undefined, "private");
	strictEqual(o.publicMethod(3), 14, "public");
	ok(proto.Interface.isPrototypeOf(o), "Interface");
});
test("returnInterface properties", function() {
	if (Object.create) {
		var create = proto.createObjectFactory({
			returnInterface: true,
			isPublicFn: function(key, m) {
				return !(key.charAt(0) === "_");
			}
		});
		var o = create(null, {
			a: 7,
			getA: function(p) {
				return this.a;
			},
			_b: 7,
			b: {
				get: function() {
					return this._b;
				},
				set: function(v) {
					this._b = v;
				}
			},
			getB: function() {
				return this.b;
			},
			c: {
				value: 14,
				writable: false
			},
			d: {
				get: function() {
					return -2;
				}
			}
		});
		var oo = create(o);
		strictEqual(oo.a, 7, "get simple");
		oo.a = 5;
		strictEqual(oo.getA(), 5, "get method simple");
		strictEqual(oo.b, 7, "get getter/setter");
		oo.b = 5;
		strictEqual(oo.getB(), 5, "get method getter/setter");
		strictEqual(oo.c, 14, "get simple read-only");
		throws(function() {
			oo.c = 5;
		}, "set simple read-only");
		strictEqual(oo.d, -2, "get getter/setter read-only");
		throws(function() {
			oo.d = 5;
		}, "set getter/setter read-only");
	} else {
		expect(0);
	}
});
test("isInterfaceOf, Proto", function() {
	var isPublic = function(key, m) {
		return !(key.charAt(0) === "_");
	};
	var inherit = proto.createObjectFactory({
		isPublicFn: isPublic
	});
	var newInstance = proto.createObjectFactory({
		returnInterface: true,
		isPublicFn: isPublic
	});
	var p = inherit(proto.Proto, {});
	var pp = inherit(p, {});
	var o = newInstance(pp, undefined, undefined, []);
	ok(proto.isInterfaceOf(o, p), "p interface");
	ok(proto.isInterfaceOf(o, pp), "pp interface");
	o = inherit(pp, undefined, undefined, []);
	ok(proto.isInterfaceOf(o, p), "p instance");
	ok(proto.isInterfaceOf(o, pp), "pp instance");
});
test("null descriptor", function() {
	var o;
	var create = proto.createObjectFactory({
		propertyDescriptors: true
	});
	throws(function() {
		o = create(null, {
			m: null
		});
	});
	create = proto.createObjectFactory({});
	o = create(null, {
		m: null
	});
});
test("JScript DontEnum bug", function() {
	var create = proto.createObjectFactory({});
	var o = create(null, {
		constructor: "x",
		toString: "y"
	});
	strictEqual(o.constructor, "x", "constructor");
	strictEqual(o.toString, "y", "toString");
});
test("shadowedEnumerableBug", function() {
	if (Object.create) {
		var isPublic = function(key, m) {
			return !(key.charAt(0) === "_");
		};
		var inherit = proto.createObjectFactory({
			isPublicFn: isPublic
		});
		var p = inherit(undefined, {
			m: function() {
			}
		});
		var pp = inherit(p, {
			m: {
				enumerable: false,
				value: function() {
				}
			}
		});
		var newInstance = proto.createObjectFactory({
			isPublicFn: isPublic,
			returnInterface: true,
			shadowedEnumerableFix: true
		});
		var o = newInstance(p);
		o.m();
		var oo = newInstance(pp);
		strictEqual(oo.m, undefined, "private");
	} else {
		expect(0);
	}
});
test("lifecycle", 2, function() {
	var create = proto.createObjectFactory();
	var Base = create(proto.Proto, proto.createLifecycleHelperDescriptor());
	var p = create(Base, {
		_init: function(x) {
			this._a = x * 3;
		},
		get: function() {
			return this._a;
		},
		_deinit: function(x) {
			strictEqual(this._a, 0, "deinit");
		}
	});
	var pp = create(p, {
		_init: function(x) {
			this._a = this._a + 5;
		},
		_deinit: function(x) {
			this._a = 0;
		}
	});
	var o = create(pp, undefined, undefined, [ 4 ]);
	strictEqual(o.get(), 17, "init");
	o.finalize();
});
