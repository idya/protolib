"use strict";

test("property inheritance", function() {
	var create = proto.createCreate();
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
	var create = proto.createCreate();
	var o = create(undefined);
	strictEqual(proto.getPrototypeOf(o), Object.prototype, "null prototype");
	var o = create(null);
	strictEqual(proto.getPrototypeOf(o), null, "null prototype");
	var oo = create(o);
	strictEqual(proto.getPrototypeOf(oo), o, "non-null prototype");
});
test("default ctor", 2, function() {
	var create = proto.createCreate();
	var o = create(null, {
		constructor: function(p) {
			strictEqual(p, "x", "constructor param");
		}
	}, undefined, [ "x" ]);
	var oo = create(o, undefined, undefined, [ "x" ]);
});
test("named ctor", 2, function() {
	var create = proto.createCreate({
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
	var create = proto.createCreate();
	var o = create(null);
	o.a = true;
	ok(true, "defaults");
	create = proto.createCreate({
		defaultExtensible: false
	});
	o = create(null, undefined, true);
	o.a = true;
	ok(true, "extensible=true, defaultExtensible=false");
});
test("unextensible", function() {
	if (Object.preventExtensions) {
		var create = proto.createCreate({
			defaultExtensible: false
		});
		var o = create(null);
		throws(function() {
			o.a = true;
		}, "defaultExtensible=false");
		create = proto.createCreate();
		o = create(null, undefined, false);
		throws(function() {
			o.a = true;
		}, "defaultExtensible=false");
	} else {
		expect(0);
	}
});
test("superWrap-1", 3, function() {
	var create = proto.createCreate();
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
	var create = proto.createCreate();
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
	var create = proto.createCreate({
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
	var create = proto.createCreate({
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
	var create = proto.createCreate({
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
	var create = proto.createCreate();
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
	var create = proto.createCreate({
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
	var create = proto.createCreate();
	var o = create(null, {
		m: "x"
	});
	if (Object.create) {
		Object.defineProperty(o, "m", {
			enumerable: false
		});
	}
	create = proto.createCreate({
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
	var create = proto.createCreate();
	var o = create(null, {
		m: "x"
	});
	o.x = "y";
	create = proto.createCreate({
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
	var create = proto.createCreate();
	var o = create(null, {
		m: "x"
	});
	ok(Object.prototype.propertyIsEnumerable.call(o, "m"), "defaults");
	create = proto.createCreate({
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
	var create = proto.createCreate();
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
	var create = proto.createCreate({
		propertyDescriptors: true
	});
	var o = create(null, {
		m: {
			value: "x"
		}
	});
	strictEqual(o.m, "x", "propertyDescriptors: true");
	create = proto.createCreate({
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
	var create = proto.createCreate({
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
	var create = proto.createCreate({
		isPublicFn: function(key, m) {
			return !(key.charAt(0) === "_");
		}
	});
	var o = create(undefined, {
		constructor: "z"
	});
	ok(!o.propertyIsEnumerable("constructor"), "isPublicFn");
	create = proto.createCreate({
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
	create = proto.createCreate({});
	o = create(undefined, {
		constructor: "z"
	});
	if (Object.create) {
		ok(o.propertyIsEnumerable("constructor"), "default");
	}
});
test("returnInterface methods", function() {
	var create = proto.createCreate({
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
});
test("returnInterface properties", function() {
	if (Object.create) {
		var create = proto.createCreate({
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
				enumerable: true,
				get: function() {
					console.log("get");
					return this._b;
				},
				set: function(v) {
					console.log("set");
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
	} else {
		expect(0);
	}
});
