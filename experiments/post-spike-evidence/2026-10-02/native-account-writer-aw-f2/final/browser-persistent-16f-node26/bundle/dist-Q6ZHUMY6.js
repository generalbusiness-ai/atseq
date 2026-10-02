import {
  ZodError,
  ZodIssueCode,
  external_exports
} from "./chunk-4UJAH5YT.js";
import {
  __commonJS,
  __export,
  __toESM
} from "./chunk-CZ7CSFO4.js";

// node_modules/core-js/internals/global-this.js
var require_global_this = __commonJS({
  "node_modules/core-js/internals/global-this.js"(exports, module) {
    "use strict";
    var check = function(it) {
      return it && it.Math === Math && it;
    };
    module.exports = // eslint-disable-next-line es/no-global-this -- safe
    check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || // eslint-disable-next-line no-restricted-globals -- safe
    check(typeof self == "object" && self) || check(typeof global == "object" && global) || check(typeof exports == "object" && exports) || // eslint-disable-next-line no-new-func -- fallback
    /* @__PURE__ */ (function() {
      return this;
    })() || Function("return this")();
  }
});

// node_modules/core-js/internals/path.js
var require_path = __commonJS({
  "node_modules/core-js/internals/path.js"(exports, module) {
    "use strict";
    var globalThis2 = require_global_this();
    module.exports = globalThis2;
  }
});

// node_modules/core-js/internals/fails.js
var require_fails = __commonJS({
  "node_modules/core-js/internals/fails.js"(exports, module) {
    "use strict";
    module.exports = function(exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };
  }
});

// node_modules/core-js/internals/function-bind-native.js
var require_function_bind_native = __commonJS({
  "node_modules/core-js/internals/function-bind-native.js"(exports, module) {
    "use strict";
    var fails = require_fails();
    module.exports = !fails(function() {
      var test = function() {
      }.bind();
      return typeof test != "function" || test.hasOwnProperty("prototype");
    });
  }
});

// node_modules/core-js/internals/function-uncurry-this.js
var require_function_uncurry_this = __commonJS({
  "node_modules/core-js/internals/function-uncurry-this.js"(exports, module) {
    "use strict";
    var NATIVE_BIND = require_function_bind_native();
    var FunctionPrototype = Function.prototype;
    var call = FunctionPrototype.call;
    var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);
    module.exports = NATIVE_BIND ? uncurryThisWithBind : function(fn) {
      return function() {
        return call.apply(fn, arguments);
      };
    };
  }
});

// node_modules/core-js/internals/is-null-or-undefined.js
var require_is_null_or_undefined = __commonJS({
  "node_modules/core-js/internals/is-null-or-undefined.js"(exports, module) {
    "use strict";
    module.exports = function(it) {
      return it === null || it === void 0;
    };
  }
});

// node_modules/core-js/internals/require-object-coercible.js
var require_require_object_coercible = __commonJS({
  "node_modules/core-js/internals/require-object-coercible.js"(exports, module) {
    "use strict";
    var isNullOrUndefined = require_is_null_or_undefined();
    var $TypeError = TypeError;
    module.exports = function(it) {
      if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
      return it;
    };
  }
});

// node_modules/core-js/internals/to-object.js
var require_to_object = __commonJS({
  "node_modules/core-js/internals/to-object.js"(exports, module) {
    "use strict";
    var requireObjectCoercible = require_require_object_coercible();
    var $Object = Object;
    module.exports = function(argument) {
      return $Object(requireObjectCoercible(argument));
    };
  }
});

// node_modules/core-js/internals/has-own-property.js
var require_has_own_property = __commonJS({
  "node_modules/core-js/internals/has-own-property.js"(exports, module) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var toObject = require_to_object();
    var hasOwnProperty = uncurryThis({}.hasOwnProperty);
    module.exports = Object.hasOwn || function hasOwn(it, key) {
      return hasOwnProperty(toObject(it), key);
    };
  }
});

// node_modules/core-js/internals/is-pure.js
var require_is_pure = __commonJS({
  "node_modules/core-js/internals/is-pure.js"(exports, module) {
    "use strict";
    module.exports = false;
  }
});

// node_modules/core-js/internals/define-global-property.js
var require_define_global_property = __commonJS({
  "node_modules/core-js/internals/define-global-property.js"(exports, module) {
    "use strict";
    var globalThis2 = require_global_this();
    var defineProperty = Object.defineProperty;
    module.exports = function(key, value) {
      try {
        defineProperty(globalThis2, key, { value, configurable: true, writable: true });
      } catch (error) {
        globalThis2[key] = value;
      }
      return value;
    };
  }
});

// node_modules/core-js/internals/shared-store.js
var require_shared_store = __commonJS({
  "node_modules/core-js/internals/shared-store.js"(exports, module) {
    "use strict";
    var IS_PURE = require_is_pure();
    var globalThis2 = require_global_this();
    var defineGlobalProperty = require_define_global_property();
    var SHARED = "__core-js_shared__";
    var store = module.exports = globalThis2[SHARED] || defineGlobalProperty(SHARED, {});
    (store.versions || (store.versions = [])).push({
      version: "3.50.0",
      mode: IS_PURE ? "pure" : "global",
      copyright: "\xA9 2013\u20132025 Denis Pushkarev (zloirock.ru), 2025\u20132026 CoreJS Company (core-js.io). All rights reserved.",
      license: "https://github.com/zloirock/core-js/blob/v3.50.0/LICENSE",
      source: "https://github.com/zloirock/core-js"
    });
  }
});

// node_modules/core-js/internals/shared.js
var require_shared = __commonJS({
  "node_modules/core-js/internals/shared.js"(exports, module) {
    "use strict";
    var store = require_shared_store();
    var create = Object.create || Object;
    module.exports = function(key, value) {
      return store[key] || (store[key] = value || create(null));
    };
  }
});

// node_modules/core-js/internals/uid.js
var require_uid = __commonJS({
  "node_modules/core-js/internals/uid.js"(exports, module) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var id = 0;
    var postfix = Math.random();
    var toString = uncurryThis(1.1.toString);
    module.exports = function(key) {
      return "Symbol(" + (key === void 0 ? "" : key) + ")_" + toString(++id + postfix, 36);
    };
  }
});

// node_modules/core-js/internals/environment-user-agent.js
var require_environment_user_agent = __commonJS({
  "node_modules/core-js/internals/environment-user-agent.js"(exports, module) {
    "use strict";
    var globalThis2 = require_global_this();
    var navigator2 = globalThis2.navigator;
    var userAgent = navigator2 && navigator2.userAgent;
    module.exports = userAgent ? String(userAgent) : "";
  }
});

// node_modules/core-js/internals/environment-v8-version.js
var require_environment_v8_version = __commonJS({
  "node_modules/core-js/internals/environment-v8-version.js"(exports, module) {
    "use strict";
    var globalThis2 = require_global_this();
    var userAgent = require_environment_user_agent();
    var process3 = globalThis2.process;
    var Deno = globalThis2.Deno;
    var versions = process3 && process3.versions || Deno && Deno.version;
    var v8 = versions && versions.v8;
    var match;
    var version;
    if (v8) {
      match = v8.split(".");
      version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
    }
    if (!version && userAgent) {
      match = userAgent.match(/Edge\/(\d+)/);
      if (!match || match[1] >= 74) {
        match = userAgent.match(/Chrome\/(\d+)/);
        if (match) version = +match[1];
      }
    }
    module.exports = version;
  }
});

// node_modules/core-js/internals/symbol-constructor-detection.js
var require_symbol_constructor_detection = __commonJS({
  "node_modules/core-js/internals/symbol-constructor-detection.js"(exports, module) {
    "use strict";
    var V8_VERSION = require_environment_v8_version();
    var fails = require_fails();
    var globalThis2 = require_global_this();
    var $String = globalThis2.String;
    module.exports = !!Object.getOwnPropertySymbols && !fails(function() {
      var symbol = /* @__PURE__ */ Symbol("symbol detection");
      return !$String(symbol) || !(Object(symbol) instanceof Symbol) || // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
      !Symbol.sham && V8_VERSION && V8_VERSION < 41;
    });
  }
});

// node_modules/core-js/internals/use-symbol-as-uid.js
var require_use_symbol_as_uid = __commonJS({
  "node_modules/core-js/internals/use-symbol-as-uid.js"(exports, module) {
    "use strict";
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    module.exports = NATIVE_SYMBOL && !Symbol.sham && typeof Symbol.iterator == "symbol";
  }
});

// node_modules/core-js/internals/well-known-symbol.js
var require_well_known_symbol = __commonJS({
  "node_modules/core-js/internals/well-known-symbol.js"(exports, module) {
    "use strict";
    var globalThis2 = require_global_this();
    var shared = require_shared();
    var hasOwn = require_has_own_property();
    var uid = require_uid();
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var Symbol2 = globalThis2.Symbol;
    var WellKnownSymbolsStore = shared("wks");
    var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol2["for"] || Symbol2 : Symbol2 && Symbol2.withoutSetter || uid;
    module.exports = function(name) {
      if (!hasOwn(WellKnownSymbolsStore, name)) {
        WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol2, name) ? Symbol2[name] : createWellKnownSymbol("Symbol." + name);
      }
      return WellKnownSymbolsStore[name];
    };
  }
});

// node_modules/core-js/internals/well-known-symbol-wrapped.js
var require_well_known_symbol_wrapped = __commonJS({
  "node_modules/core-js/internals/well-known-symbol-wrapped.js"(exports) {
    "use strict";
    var wellKnownSymbol = require_well_known_symbol();
    exports.f = wellKnownSymbol;
  }
});

// node_modules/core-js/internals/descriptors.js
var require_descriptors = __commonJS({
  "node_modules/core-js/internals/descriptors.js"(exports, module) {
    "use strict";
    var fails = require_fails();
    module.exports = !fails(function() {
      return Object.defineProperty({}, 1, { get: function() {
        return 7;
      } })[1] !== 7;
    });
  }
});

// node_modules/core-js/internals/is-callable.js
var require_is_callable = __commonJS({
  "node_modules/core-js/internals/is-callable.js"(exports, module) {
    "use strict";
    var documentAll = typeof document == "object" && document.all;
    module.exports = typeof documentAll == "undefined" && documentAll !== void 0 ? function(argument) {
      return typeof argument == "function" || argument === documentAll;
    } : function(argument) {
      return typeof argument == "function";
    };
  }
});

// node_modules/core-js/internals/is-object.js
var require_is_object = __commonJS({
  "node_modules/core-js/internals/is-object.js"(exports, module) {
    "use strict";
    var isCallable = require_is_callable();
    module.exports = function(it) {
      return typeof it == "object" ? it !== null : isCallable(it);
    };
  }
});

// node_modules/core-js/internals/document-create-element.js
var require_document_create_element = __commonJS({
  "node_modules/core-js/internals/document-create-element.js"(exports, module) {
    "use strict";
    var globalThis2 = require_global_this();
    var isObject2 = require_is_object();
    var document2 = globalThis2.document;
    var EXISTS = isObject2(document2) && isObject2(document2.createElement);
    module.exports = function(it) {
      return EXISTS ? document2.createElement(it) : {};
    };
  }
});

// node_modules/core-js/internals/ie8-dom-define.js
var require_ie8_dom_define = __commonJS({
  "node_modules/core-js/internals/ie8-dom-define.js"(exports, module) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    var createElement = require_document_create_element();
    module.exports = !DESCRIPTORS && !fails(function() {
      return Object.defineProperty(createElement("div"), "a", {
        get: function() {
          return 7;
        }
      }).a !== 7;
    });
  }
});

// node_modules/core-js/internals/v8-prototype-define-bug.js
var require_v8_prototype_define_bug = __commonJS({
  "node_modules/core-js/internals/v8-prototype-define-bug.js"(exports, module) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    module.exports = DESCRIPTORS && fails(function() {
      return Object.defineProperty(function() {
      }, "prototype", {
        value: 42,
        writable: false
      }).prototype !== 42;
    });
  }
});

// node_modules/core-js/internals/an-object.js
var require_an_object = __commonJS({
  "node_modules/core-js/internals/an-object.js"(exports, module) {
    "use strict";
    var isObject2 = require_is_object();
    var $String = String;
    var $TypeError = TypeError;
    module.exports = function(argument) {
      if (isObject2(argument)) return argument;
      throw new $TypeError($String(argument) + " is not an object");
    };
  }
});

// node_modules/core-js/internals/function-call.js
var require_function_call = __commonJS({
  "node_modules/core-js/internals/function-call.js"(exports, module) {
    "use strict";
    var NATIVE_BIND = require_function_bind_native();
    var call = Function.prototype.call;
    module.exports = NATIVE_BIND ? call.bind(call) : function() {
      return call.apply(call, arguments);
    };
  }
});

// node_modules/core-js/internals/get-built-in.js
var require_get_built_in = __commonJS({
  "node_modules/core-js/internals/get-built-in.js"(exports, module) {
    "use strict";
    var globalThis2 = require_global_this();
    var isCallable = require_is_callable();
    var aFunction = function(argument) {
      return isCallable(argument) ? argument : void 0;
    };
    module.exports = function(namespace, method) {
      return arguments.length < 2 ? aFunction(globalThis2[namespace]) : globalThis2[namespace] && globalThis2[namespace][method];
    };
  }
});

// node_modules/core-js/internals/object-is-prototype-of.js
var require_object_is_prototype_of = __commonJS({
  "node_modules/core-js/internals/object-is-prototype-of.js"(exports, module) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    module.exports = uncurryThis({}.isPrototypeOf);
  }
});

// node_modules/core-js/internals/is-symbol.js
var require_is_symbol = __commonJS({
  "node_modules/core-js/internals/is-symbol.js"(exports, module) {
    "use strict";
    var getBuiltIn = require_get_built_in();
    var isCallable = require_is_callable();
    var isPrototypeOf = require_object_is_prototype_of();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var $Object = Object;
    module.exports = USE_SYMBOL_AS_UID ? function(it) {
      return typeof it == "symbol";
    } : function(it) {
      var $Symbol = getBuiltIn("Symbol");
      return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
    };
  }
});

// node_modules/core-js/internals/try-to-string.js
var require_try_to_string = __commonJS({
  "node_modules/core-js/internals/try-to-string.js"(exports, module) {
    "use strict";
    var $String = String;
    module.exports = function(argument) {
      try {
        return $String(argument);
      } catch (error) {
        return "Object";
      }
    };
  }
});

// node_modules/core-js/internals/a-callable.js
var require_a_callable = __commonJS({
  "node_modules/core-js/internals/a-callable.js"(exports, module) {
    "use strict";
    var isCallable = require_is_callable();
    var tryToString = require_try_to_string();
    var $TypeError = TypeError;
    module.exports = function(argument) {
      if (isCallable(argument)) return argument;
      throw new $TypeError(tryToString(argument) + " is not a function");
    };
  }
});

// node_modules/core-js/internals/get-method.js
var require_get_method = __commonJS({
  "node_modules/core-js/internals/get-method.js"(exports, module) {
    "use strict";
    var aCallable = require_a_callable();
    var isNullOrUndefined = require_is_null_or_undefined();
    module.exports = function(V, P) {
      var func = V[P];
      return isNullOrUndefined(func) ? void 0 : aCallable(func);
    };
  }
});

// node_modules/core-js/internals/ordinary-to-primitive.js
var require_ordinary_to_primitive = __commonJS({
  "node_modules/core-js/internals/ordinary-to-primitive.js"(exports, module) {
    "use strict";
    var call = require_function_call();
    var isCallable = require_is_callable();
    var isObject2 = require_is_object();
    var $TypeError = TypeError;
    module.exports = function(input, pref) {
      var fn, val;
      if (pref === "string" && isCallable(fn = input.toString) && !isObject2(val = call(fn, input))) return val;
      if (isCallable(fn = input.valueOf) && !isObject2(val = call(fn, input))) return val;
      if (pref !== "string" && isCallable(fn = input.toString) && !isObject2(val = call(fn, input))) return val;
      throw new $TypeError("Can't convert object to primitive value");
    };
  }
});

// node_modules/core-js/internals/to-primitive.js
var require_to_primitive = __commonJS({
  "node_modules/core-js/internals/to-primitive.js"(exports, module) {
    "use strict";
    var call = require_function_call();
    var isObject2 = require_is_object();
    var isSymbol = require_is_symbol();
    var getMethod = require_get_method();
    var ordinaryToPrimitive = require_ordinary_to_primitive();
    var wellKnownSymbol = require_well_known_symbol();
    var $TypeError = TypeError;
    var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
    module.exports = function(input, pref) {
      if (!isObject2(input) || isSymbol(input)) return input;
      var exoticToPrim = getMethod(input, TO_PRIMITIVE);
      var result;
      if (exoticToPrim) {
        if (pref === void 0) pref = "default";
        result = call(exoticToPrim, input, pref);
        if (!isObject2(result) || isSymbol(result)) return result;
        throw new $TypeError("Can't convert object to primitive value");
      }
      if (pref === void 0) pref = "number";
      return ordinaryToPrimitive(input, pref);
    };
  }
});

// node_modules/core-js/internals/to-property-key.js
var require_to_property_key = __commonJS({
  "node_modules/core-js/internals/to-property-key.js"(exports, module) {
    "use strict";
    var toPrimitive = require_to_primitive();
    var isSymbol = require_is_symbol();
    module.exports = function(argument) {
      var key = toPrimitive(argument, "string");
      return isSymbol(key) ? key : key + "";
    };
  }
});

// node_modules/core-js/internals/object-define-property.js
var require_object_define_property = __commonJS({
  "node_modules/core-js/internals/object-define-property.js"(exports) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
    var anObject = require_an_object();
    var toPropertyKey = require_to_property_key();
    var $TypeError = TypeError;
    var $defineProperty = Object.defineProperty;
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var ENUMERABLE = "enumerable";
    var CONFIGURABLE = "configurable";
    var WRITABLE = "writable";
    exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (typeof O === "function" && P === "prototype" && "value" in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
        var current = $getOwnPropertyDescriptor(O, P);
        if (current && current[WRITABLE]) {
          O[P] = Attributes.value;
          Attributes = {
            configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
            enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
            writable: false
          };
        }
      }
      return $defineProperty(O, P, Attributes);
    } : $defineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (IE8_DOM_DEFINE) try {
        return $defineProperty(O, P, Attributes);
      } catch (error) {
      }
      if ("get" in Attributes || "set" in Attributes) throw new $TypeError("Accessors not supported");
      if ("value" in Attributes) O[P] = Attributes.value;
      return O;
    };
  }
});

// node_modules/core-js/internals/well-known-symbol-define.js
var require_well_known_symbol_define = __commonJS({
  "node_modules/core-js/internals/well-known-symbol-define.js"(exports, module) {
    "use strict";
    var path = require_path();
    var hasOwn = require_has_own_property();
    var wrappedWellKnownSymbolModule = require_well_known_symbol_wrapped();
    var defineProperty = require_object_define_property().f;
    module.exports = function(NAME) {
      var Symbol2 = path.Symbol || (path.Symbol = {});
      if (!hasOwn(Symbol2, NAME)) defineProperty(Symbol2, NAME, {
        value: wrappedWellKnownSymbolModule.f(NAME)
      });
    };
  }
});

// node_modules/core-js/internals/object-property-is-enumerable.js
var require_object_property_is_enumerable = __commonJS({
  "node_modules/core-js/internals/object-property-is-enumerable.js"(exports) {
    "use strict";
    var $propertyIsEnumerable = {}.propertyIsEnumerable;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);
    exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
      var descriptor = getOwnPropertyDescriptor(this, V);
      return !!descriptor && descriptor.enumerable;
    } : $propertyIsEnumerable;
  }
});

// node_modules/core-js/internals/create-property-descriptor.js
var require_create_property_descriptor = __commonJS({
  "node_modules/core-js/internals/create-property-descriptor.js"(exports, module) {
    "use strict";
    module.exports = function(bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value
      };
    };
  }
});

// node_modules/core-js/internals/classof-raw.js
var require_classof_raw = __commonJS({
  "node_modules/core-js/internals/classof-raw.js"(exports, module) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var toString = uncurryThis({}.toString);
    var stringSlice = uncurryThis("".slice);
    module.exports = function(it) {
      return stringSlice(toString(it), 8, -1);
    };
  }
});

// node_modules/core-js/internals/indexed-object.js
var require_indexed_object = __commonJS({
  "node_modules/core-js/internals/indexed-object.js"(exports, module) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var fails = require_fails();
    var classof = require_classof_raw();
    var $Object = Object;
    var split = uncurryThis("".split);
    module.exports = fails(function() {
      return !$Object("z").propertyIsEnumerable(0);
    }) ? function(it) {
      return classof(it) === "String" ? split(it, "") : $Object(it);
    } : $Object;
  }
});

// node_modules/core-js/internals/to-indexed-object.js
var require_to_indexed_object = __commonJS({
  "node_modules/core-js/internals/to-indexed-object.js"(exports, module) {
    "use strict";
    var IndexedObject = require_indexed_object();
    var requireObjectCoercible = require_require_object_coercible();
    module.exports = function(it) {
      return IndexedObject(requireObjectCoercible(it));
    };
  }
});

// node_modules/core-js/internals/object-get-own-property-descriptor.js
var require_object_get_own_property_descriptor = __commonJS({
  "node_modules/core-js/internals/object-get-own-property-descriptor.js"(exports) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var call = require_function_call();
    var propertyIsEnumerableModule = require_object_property_is_enumerable();
    var createPropertyDescriptor = require_create_property_descriptor();
    var toIndexedObject = require_to_indexed_object();
    var toPropertyKey = require_to_property_key();
    var hasOwn = require_has_own_property();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
      O = toIndexedObject(O);
      P = toPropertyKey(P);
      if (IE8_DOM_DEFINE) try {
        return $getOwnPropertyDescriptor(O, P);
      } catch (error) {
      }
      if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
    };
  }
});

// node_modules/core-js/modules/es.symbol.async-dispose.js
var require_es_symbol_async_dispose = __commonJS({
  "node_modules/core-js/modules/es.symbol.async-dispose.js"() {
    "use strict";
    var globalThis2 = require_global_this();
    var defineWellKnownSymbol = require_well_known_symbol_define();
    var defineProperty = require_object_define_property().f;
    var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
    var Symbol2 = globalThis2.Symbol;
    defineWellKnownSymbol("asyncDispose");
    if (Symbol2) {
      descriptor = getOwnPropertyDescriptor(Symbol2, "asyncDispose");
      if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
        defineProperty(Symbol2, "asyncDispose", { value: descriptor.value, enumerable: false, configurable: false, writable: false });
      }
    }
    var descriptor;
  }
});

// node_modules/core-js/es/symbol/async-dispose.js
var require_async_dispose = __commonJS({
  "node_modules/core-js/es/symbol/async-dispose.js"(exports, module) {
    "use strict";
    require_es_symbol_async_dispose();
    var WrappedWellKnownSymbolModule = require_well_known_symbol_wrapped();
    module.exports = WrappedWellKnownSymbolModule.f("asyncDispose");
  }
});

// node_modules/core-js/modules/es.symbol.dispose.js
var require_es_symbol_dispose = __commonJS({
  "node_modules/core-js/modules/es.symbol.dispose.js"() {
    "use strict";
    var globalThis2 = require_global_this();
    var defineWellKnownSymbol = require_well_known_symbol_define();
    var defineProperty = require_object_define_property().f;
    var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
    var Symbol2 = globalThis2.Symbol;
    defineWellKnownSymbol("dispose");
    if (Symbol2) {
      descriptor = getOwnPropertyDescriptor(Symbol2, "dispose");
      if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
        defineProperty(Symbol2, "dispose", { value: descriptor.value, enumerable: false, configurable: false, writable: false });
      }
    }
    var descriptor;
  }
});

// node_modules/core-js/es/symbol/dispose.js
var require_dispose = __commonJS({
  "node_modules/core-js/es/symbol/dispose.js"(exports, module) {
    "use strict";
    require_es_symbol_dispose();
    var WrappedWellKnownSymbolModule = require_well_known_symbol_wrapped();
    module.exports = WrappedWellKnownSymbolModule.f("dispose");
  }
});

// node_modules/@atproto/oauth-client-browser/dist/index.js
var import_async_dispose = __toESM(require_async_dispose(), 1);
var import_dispose4 = __toESM(require_dispose(), 1);

// node_modules/@atproto/jwk/dist/errors.js
var ERR_JWKS_NO_MATCHING_KEY = "ERR_JWKS_NO_MATCHING_KEY";
var ERR_JWK_INVALID = "ERR_JWK_INVALID";
var ERR_JWK_NOT_FOUND = "ERR_JWK_NOT_FOUND";
var ERR_JWT_INVALID = "ERR_JWT_INVALID";
var ERR_JWT_CREATE = "ERR_JWT_CREATE";
var ERR_JWT_VERIFY = "ERR_JWT_VERIFY";
var JwkError = class extends TypeError {
  constructor(message2 = "JWK error", code = ERR_JWK_INVALID, options) {
    super(message2, options);
    this.code = code;
  }
};
var JwtCreateError = class _JwtCreateError extends Error {
  constructor(message2 = "Unable to create JWT", code = ERR_JWT_CREATE, options) {
    super(message2, options);
    this.code = code;
  }
  static from(cause, code, message2) {
    if (cause instanceof _JwtCreateError)
      return cause;
    if (cause instanceof JwkError) {
      return new _JwtCreateError(message2, cause.code, { cause });
    }
    return new _JwtCreateError(message2, code, { cause });
  }
};
var JwtVerifyError = class _JwtVerifyError extends Error {
  constructor(message2 = "Invalid JWT", code = ERR_JWT_VERIFY, options) {
    super(message2, options);
    this.code = code;
  }
  static from(cause, code, message2) {
    if (cause instanceof _JwtVerifyError)
      return cause;
    if (cause instanceof JwkError) {
      return new _JwtVerifyError(message2, cause.code, { cause });
    }
    return new _JwtVerifyError(message2, code, { cause });
  }
};

// node_modules/@atproto/jwk/node_modules/multiformats/dist/src/bytes.js
var empty = new Uint8Array(0);

// node_modules/@atproto/jwk/node_modules/multiformats/dist/src/bases/base.js
var Encoder = class {
  name;
  prefix;
  baseEncode;
  constructor(name, prefix, baseEncode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
  }
  encode(bytes) {
    if (bytes instanceof Uint8Array) {
      return `${this.prefix}${this.baseEncode(bytes)}`;
    } else {
      throw Error("Unknown type, must be binary type");
    }
  }
};
var Decoder = class {
  name;
  prefix;
  baseDecode;
  prefixCodePoint;
  constructor(name, prefix, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    const prefixCodePoint = prefix.codePointAt(0);
    if (prefixCodePoint === void 0) {
      throw new Error("Invalid prefix character");
    }
    this.prefixCodePoint = prefixCodePoint;
    this.baseDecode = baseDecode;
  }
  decode(text) {
    if (typeof text === "string") {
      if (text.codePointAt(0) !== this.prefixCodePoint) {
        throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
      }
      return this.baseDecode(text.slice(this.prefix.length));
    } else {
      throw Error("Can only multibase decode strings");
    }
  }
  or(decoder3) {
    return or(this, decoder3);
  }
};
var ComposedDecoder = class {
  decoders;
  constructor(decoders) {
    this.decoders = decoders;
  }
  or(decoder3) {
    return or(this, decoder3);
  }
  decode(input) {
    const prefix = input[0];
    const decoder3 = this.decoders[prefix];
    if (decoder3 != null) {
      return decoder3.decode(input);
    } else {
      throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
  }
};
function or(left, right) {
  return new ComposedDecoder({
    ...left.decoders ?? { [left.prefix]: left },
    ...right.decoders ?? { [right.prefix]: right }
  });
}
var Codec = class {
  name;
  prefix;
  baseEncode;
  baseDecode;
  encoder;
  decoder;
  constructor(name, prefix, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder(name, prefix, baseEncode);
    this.decoder = new Decoder(name, prefix, baseDecode);
  }
  encode(input) {
    return this.encoder.encode(input);
  }
  decode(input) {
    return this.decoder.decode(input);
  }
};
function from({ name, prefix, encode: encode4, decode: decode4 }) {
  return new Codec(name, prefix, encode4, decode4);
}
function decode(string, alphabetIdx, bitsPerChar, name) {
  let end = string.length;
  while (string[end - 1] === "=") {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = alphabetIdx[string[i]];
    if (value === void 0) {
      throw new SyntaxError(`Non-${name} character`);
    }
    buffer = buffer << bitsPerChar | value;
    bits += bitsPerChar;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= bitsPerChar || (255 & buffer << 8 - bits) !== 0) {
    throw new SyntaxError("Unexpected end of data");
  }
  return out;
}
function encode(data, alphabet, bitsPerChar) {
  const pad = alphabet[alphabet.length - 1] === "=";
  const mask = (1 << bitsPerChar) - 1;
  let out = "";
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | data[i];
    bits += 8;
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & buffer >> bits];
    }
  }
  if (bits !== 0) {
    out += alphabet[mask & buffer << bitsPerChar - bits];
  }
  if (pad) {
    while ((out.length * bitsPerChar & 7) !== 0) {
      out += "=";
    }
  }
  return out;
}
function createAlphabetIdx(alphabet) {
  const alphabetIdx = {};
  for (let i = 0; i < alphabet.length; ++i) {
    alphabetIdx[alphabet[i]] = i;
  }
  return alphabetIdx;
}
function rfc4648({ name, prefix, bitsPerChar, alphabet }) {
  const alphabetIdx = createAlphabetIdx(alphabet);
  return from({
    prefix,
    name,
    encode(input) {
      return encode(input, alphabet, bitsPerChar);
    },
    decode(input) {
      return decode(input, alphabetIdx, bitsPerChar, name);
    }
  });
}

// node_modules/@atproto/jwk/node_modules/multiformats/dist/src/bases/base64.js
var base64 = rfc4648({
  prefix: "m",
  name: "base64",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  bitsPerChar: 6
});
var base64pad = rfc4648({
  prefix: "M",
  name: "base64pad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  bitsPerChar: 6
});
var base64url = rfc4648({
  prefix: "u",
  name: "base64url",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  bitsPerChar: 6
});
var base64urlpad = rfc4648({
  prefix: "U",
  name: "base64urlpad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
  bitsPerChar: 6
});

// node_modules/@atproto/jwk/dist/util.js
var isDefined = (i) => i !== void 0;
var preferredOrderCmp = (order) => (a, b) => {
  const aIdx = order.indexOf(a);
  const bIdx = order.indexOf(b);
  if (aIdx === bIdx)
    return 0;
  if (aIdx === -1)
    return 1;
  if (bIdx === -1)
    return -1;
  return aIdx - bIdx;
};
function matchesAny(value) {
  return value == null ? (v) => true : Array.isArray(value) ? (v) => value.includes(v) : (v) => v === value;
}
var cachedGetter = (target, _context) => {
  return function() {
    const value = target.call(this);
    Object.defineProperty(this, target.name, {
      get: () => value,
      enumerable: true,
      configurable: true
    });
    return value;
  };
};
var decoder = new TextDecoder();
function parseB64uJson(input) {
  const inputBytes = base64url.baseDecode(input);
  const json = decoder.decode(inputBytes);
  return JSON.parse(json);
}
var jwtCharsRefinement = (data, ctx) => {
  let char;
  for (let i = 0; i < data.length; i++) {
    char = data.charCodeAt(i);
    if (
      // Base64 URL encoding (most frequent)
      65 <= char && char <= 90 || // A-Z
      97 <= char && char <= 122 || // a-z
      48 <= char && char <= 57 || // 0-9
      char === 45 || // -
      char === 95 || // _
      // Boundary (least frequent, check last)
      char === 46
    ) {
    } else {
      const invalidChar = String.fromCodePoint(data.codePointAt(i));
      return ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Invalid character "${invalidChar}" in JWT at position ${i}`
      });
    }
  }
};
var segmentedStringRefinementFactory = (count, minPartLength = 2) => {
  if (!Number.isFinite(count) || count < 1 || (count | 0) !== count) {
    throw new TypeError(`Count must be a natural number (got ${count})`);
  }
  const minTotalLength = count * minPartLength + (count - 1);
  const errorPrefix = `Invalid JWT format`;
  return (data, ctx) => {
    if (data.length < minTotalLength) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `${errorPrefix}: too short`
      });
      return false;
    }
    let currentStart = 0;
    for (let i = 0; i < count - 1; i++) {
      const nextDot = data.indexOf(".", currentStart);
      if (nextDot === -1) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `${errorPrefix}: expected ${count} segments, got ${i + 1}`
        });
        return false;
      }
      if (nextDot - currentStart < minPartLength) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `${errorPrefix}: segment ${i + 1} is too short`
        });
        return false;
      }
      currentStart = nextDot + 1;
    }
    if (data.indexOf(".", currentStart) !== -1) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `${errorPrefix}: too many segments`
      });
      return false;
    }
    if (data.length - currentStart < minPartLength) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `${errorPrefix}: last segment is too short`
      });
      return false;
    }
    return true;
  };
};
function isLastOccurrence(v, i, arr) {
  return arr.indexOf(v, i + 1) === -1;
}

// node_modules/@atproto/jwk/dist/jwk.js
var PUBLIC_KEY_USAGE = ["verify", "encrypt", "wrapKey"];
var publicKeyUsageSchema = external_exports.enum(PUBLIC_KEY_USAGE);
function isPublicKeyUsage(usage) {
  return PUBLIC_KEY_USAGE.includes(usage);
}
function isSigKeyUsage(v) {
  return v === "verify";
}
function isEncKeyUsage(v) {
  return v === "encrypt" || v === "wrapKey";
}
var PRIVATE_KEY_USAGE = [
  "sign",
  "decrypt",
  "unwrapKey",
  "deriveKey",
  "deriveBits"
];
var privateKeyUsageSchema = external_exports.enum(PRIVATE_KEY_USAGE);
function isPrivateKeyUsage(usage) {
  return PRIVATE_KEY_USAGE.includes(usage);
}
var KEY_USAGE = [...PRIVATE_KEY_USAGE, ...PUBLIC_KEY_USAGE];
var keyUsageSchema = external_exports.enum(KEY_USAGE);
var jwkBaseSchema = external_exports.object({
  kty: external_exports.string().min(1),
  alg: external_exports.string().min(1).optional(),
  kid: external_exports.string().min(1).optional(),
  use: external_exports.enum(["sig", "enc"]).optional(),
  key_ops: external_exports.array(keyUsageSchema).min(1, { message: "At least one key usage must be specified" }).refine((ops) => ops.every(isLastOccurrence), {
    message: "key_ops must not contain duplicates"
  }).optional(),
  x5c: external_exports.array(external_exports.string()).optional(),
  // X.509 Certificate Chain
  x5t: external_exports.string().min(1).optional(),
  // X.509 Certificate SHA-1 Thumbprint
  "x5t#S256": external_exports.string().min(1).optional(),
  // X.509 Certificate SHA-256 Thumbprint
  x5u: external_exports.string().url().optional(),
  // X.509 URL
  // https://www.w3.org/TR/webcrypto/
  ext: external_exports.boolean().optional(),
  // Extractable
  // Federation Historical Keys Response
  // https://openid.net/specs/openid-federation-1_0.html#name-federation-historical-keys-res
  iat: external_exports.number().int().optional(),
  // Issued At (timestamp)
  exp: external_exports.number().int().optional(),
  // Expiration Time (timestamp)
  nbf: external_exports.number().int().optional(),
  // Not Before (timestamp)
  revoked: external_exports.object({
    revoked_at: external_exports.number().int(),
    reason: external_exports.string().optional()
  }).optional()
});
var jwkRsaKeySchema = jwkBaseSchema.extend({
  kty: external_exports.literal("RSA"),
  alg: external_exports.enum(["RS256", "RS384", "RS512", "PS256", "PS384", "PS512"]).optional(),
  n: external_exports.string().min(1),
  // Modulus
  e: external_exports.string().min(1),
  // Exponent
  d: external_exports.string().min(1).optional(),
  // Private Exponent
  p: external_exports.string().min(1).optional(),
  // First Prime Factor
  q: external_exports.string().min(1).optional(),
  // Second Prime Factor
  dp: external_exports.string().min(1).optional(),
  // First Factor CRT Exponent
  dq: external_exports.string().min(1).optional(),
  // Second Factor CRT Exponent
  qi: external_exports.string().min(1).optional(),
  // First CRT Coefficient
  oth: external_exports.array(external_exports.object({
    r: external_exports.string().optional(),
    d: external_exports.string().optional(),
    t: external_exports.string().optional()
  })).min(1).optional()
  // Other Primes Info
});
var jwkEcKeySchema = jwkBaseSchema.extend({
  kty: external_exports.literal("EC"),
  alg: external_exports.enum(["ES256", "ES384", "ES512"]).optional(),
  crv: external_exports.enum(["P-256", "P-384", "P-521"]),
  x: external_exports.string().min(1),
  y: external_exports.string().min(1),
  d: external_exports.string().min(1).optional()
  // ECC Private Key
});
var jwkEcSecp256k1KeySchema = jwkBaseSchema.extend({
  kty: external_exports.literal("EC"),
  alg: external_exports.enum(["ES256K"]).optional(),
  crv: external_exports.enum(["secp256k1"]),
  x: external_exports.string().min(1),
  y: external_exports.string().min(1),
  d: external_exports.string().min(1).optional()
  // ECC Private Key
});
var jwkOkpKeySchema = jwkBaseSchema.extend({
  kty: external_exports.literal("OKP"),
  alg: external_exports.enum(["EdDSA"]).optional(),
  crv: external_exports.enum(["Ed25519", "Ed448"]),
  x: external_exports.string().min(1),
  d: external_exports.string().min(1).optional()
  // ECC Private Key
});
var jwkSymKeySchema = jwkBaseSchema.extend({
  kty: external_exports.literal("oct"),
  // Octet Sequence (used to represent symmetric keys)
  alg: external_exports.enum(["HS256", "HS384", "HS512"]).optional(),
  k: external_exports.string()
  // Key Value (base64url encoded)
});
var jwkSchema = external_exports.union([
  jwkRsaKeySchema,
  jwkEcKeySchema,
  jwkEcSecp256k1KeySchema,
  jwkOkpKeySchema,
  jwkSymKeySchema
]).refine(
  // https://datatracker.ietf.org/doc/html/rfc7517#section-4.2
  // > The "use" (public key use) parameter identifies the intended use of the
  // > public key
  (k) => k.use == null || isPublicJwk(k),
  {
    message: '"use" can only be used with public keys',
    path: ["use"]
  }
).refine((k) => !k.key_ops?.some(isPrivateKeyUsage) || isPrivateJwk(k), {
  message: "private key usage not allowed for public keys",
  path: ["key_ops"]
}).refine(
  // https://datatracker.ietf.org/doc/html/rfc7517#section-4.3
  // > The "use" and "key_ops" JWK members SHOULD NOT be used together;
  // > however, if both are used, the information they convey MUST be
  // > consistent.
  (k) => k.use == null || k.key_ops == null || k.use === "sig" && k.key_ops.every(isSigKeyUsage) || k.use === "enc" && k.key_ops.every(isEncKeyUsage),
  {
    message: '"key_ops" must be consistent with "use"',
    path: ["key_ops"]
  }
);
var jwkValidator = jwkSchema;
var jwkPubSchema = jwkSchema.refine(hasKid, {
  message: '"kid" is required',
  path: ["kid"]
}).refine(isPublicJwk, {
  message: "private key not allowed"
}).refine((k) => !k.key_ops || k.key_ops.every(isPublicKeyUsage), {
  message: '"key_ops" must not contain private key usage for public keys',
  path: ["key_ops"]
});
var jwkPrivateSchema = jwkSchema.refine(isPrivateJwk, {
  message: "private key required"
});
function hasKid(jwk) {
  return "kid" in jwk && jwk.kid != null;
}
function hasSharedSecretJwk(jwk) {
  return "k" in jwk && jwk.k != null;
}
function hasPrivateSecretJwk(jwk) {
  return "d" in jwk && jwk.d != null;
}
function isPrivateJwk(jwk) {
  return hasPrivateSecretJwk(jwk) || hasSharedSecretJwk(jwk);
}
function isPublicJwk(jwk) {
  return !hasPrivateSecretJwk(jwk) && !hasSharedSecretJwk(jwk);
}

// node_modules/@atproto/jwk/dist/alg.js
var { process: process2 } = globalThis;
var IS_NODE_RUNTIME = typeof process2 !== "undefined" && typeof process2?.versions?.node === "string";
function* jwkAlgorithms(jwk) {
  if (typeof jwk.alg === "string") {
    yield jwk.alg;
    return;
  }
  switch (jwk.kty) {
    case "EC": {
      if (jwkSupportsEnc(jwk)) {
        yield "ECDH-ES";
        yield "ECDH-ES+A128KW";
        yield "ECDH-ES+A192KW";
        yield "ECDH-ES+A256KW";
      }
      if (jwkSupportsSig(jwk)) {
        const crv = "crv" in jwk ? jwk.crv : void 0;
        switch (crv) {
          case "P-256":
          case "P-384":
            yield `ES${crv.slice(-3)}`;
            break;
          case "P-521":
            yield "ES512";
            break;
          case "secp256k1":
            if (IS_NODE_RUNTIME)
              yield "ES256K";
            break;
          default:
            throw new JwkError(`Unsupported crv "${crv}"`);
        }
      }
      return;
    }
    case "OKP": {
      if (!jwk.use)
        throw new JwkError('Missing "use" Parameter value');
      yield "ECDH-ES";
      yield "ECDH-ES+A128KW";
      yield "ECDH-ES+A192KW";
      yield "ECDH-ES+A256KW";
      return;
    }
    case "RSA": {
      if (jwkSupportsEnc(jwk)) {
        yield "RSA-OAEP";
        yield "RSA-OAEP-256";
        yield "RSA-OAEP-384";
        yield "RSA-OAEP-512";
        if (IS_NODE_RUNTIME)
          yield "RSA1_5";
      }
      if (jwkSupportsSig(jwk)) {
        yield "PS256";
        yield "PS384";
        yield "PS512";
        yield "RS256";
        yield "RS384";
        yield "RS512";
      }
      return;
    }
    case "oct": {
      if (jwkSupportsEnc(jwk)) {
        yield "A128GCMKW";
        yield "A192GCMKW";
        yield "A256GCMKW";
        yield "A128KW";
        yield "A192KW";
        yield "A256KW";
      }
      if (jwkSupportsSig(jwk)) {
        yield "HS256";
        yield "HS384";
        yield "HS512";
      }
      return;
    }
    default:
      throw new JwkError(`Unsupported kty "${jwk.kty}"`);
  }
}
function jwkSupportsEnc(jwk) {
  return jwk.key_ops?.some(isEncKeyUsage) ?? (jwk.use == null || jwk.use === "enc");
}
function jwkSupportsSig(jwk) {
  return jwk.key_ops?.some(isSigKeyUsage) ?? (jwk.use == null || jwk.use === "sig");
}

// node_modules/@atproto/jwk/dist/jwks.js
var jwksSchema = external_exports.object({
  keys: external_exports.array(external_exports.unknown()).transform((input) => {
    return input.map((item) => jwkSchema.safeParse(item)).filter((res) => res.success).map((res) => res.data);
  })
});
var jwksPubSchema = external_exports.object({
  keys: external_exports.array(external_exports.unknown()).transform((input) => {
    return input.map((item) => jwkPubSchema.safeParse(item)).filter((res) => res.success).map((res) => res.data);
  })
});

// node_modules/@atproto/jwk/dist/jwt.js
var signedJwtSchema = external_exports.string().superRefine(jwtCharsRefinement).superRefine(segmentedStringRefinementFactory(3));
var isSignedJwt = (data) => signedJwtSchema.safeParse(data).success;
var unsignedJwtSchema = external_exports.string().superRefine(jwtCharsRefinement).superRefine(segmentedStringRefinementFactory(2));
var isUnsignedJwt = (data) => unsignedJwtSchema.safeParse(data).success;
var jwtHeaderSchema = external_exports.object({
  /** "alg" (Algorithm) Header Parameter */
  alg: external_exports.string(),
  /** "jku" (JWK Set URL) Header Parameter */
  jku: external_exports.string().url().optional(),
  /** "jwk" (JSON Web Key) Header Parameter */
  jwk: external_exports.object({
    kty: external_exports.string(),
    crv: external_exports.string().optional(),
    x: external_exports.string().optional(),
    y: external_exports.string().optional(),
    e: external_exports.string().optional(),
    n: external_exports.string().optional()
  }).optional(),
  /** "kid" (Key ID) Header Parameter */
  kid: external_exports.string().optional(),
  /** "x5u" (X.509 URL) Header Parameter */
  x5u: external_exports.string().optional(),
  /** "x5c" (X.509 Certificate Chain) Header Parameter */
  x5c: external_exports.array(external_exports.string()).optional(),
  /** "x5t" (X.509 Certificate SHA-1 Thumbprint) Header Parameter */
  x5t: external_exports.string().optional(),
  /** "x5t#S256" (X.509 Certificate SHA-256 Thumbprint) Header Parameter */
  "x5t#S256": external_exports.string().optional(),
  /** "typ" (Type) Header Parameter */
  typ: external_exports.string().optional(),
  /** "cty" (Content Type) Header Parameter */
  cty: external_exports.string().optional(),
  /** "crit" (Critical) Header Parameter */
  crit: external_exports.array(external_exports.string()).optional()
}).passthrough();
var htuSchema = external_exports.string().superRefine((value, ctx) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        message: "Only http: and https: protocols are allowed"
      });
    }
    if (url.username || url.password) {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        message: "Credentials not allowed"
      });
    }
    if (url.search) {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        message: "Query string not allowed"
      });
    }
    if (url.hash) {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        message: "Fragment not allowed"
      });
    }
  } catch (err) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.invalid_string,
      validation: "url"
    });
  }
  return value;
});
var jwtPayloadSchema = external_exports.object({
  iss: external_exports.string().optional(),
  aud: external_exports.union([external_exports.string(), external_exports.array(external_exports.string()).nonempty()]).optional(),
  sub: external_exports.string().optional(),
  exp: external_exports.number().int().optional(),
  nbf: external_exports.number().int().optional(),
  iat: external_exports.number().int().optional(),
  jti: external_exports.string().optional(),
  htm: external_exports.string().optional(),
  htu: htuSchema.optional(),
  ath: external_exports.string().optional(),
  acr: external_exports.string().optional(),
  azp: external_exports.string().optional(),
  amr: external_exports.array(external_exports.string()).optional(),
  // https://datatracker.ietf.org/doc/html/rfc7800
  cnf: external_exports.object({
    kid: external_exports.string().optional(),
    // Key ID
    jwk: jwkPubSchema.optional(),
    // JWK
    jwe: external_exports.string().optional(),
    // Encrypted key
    jku: external_exports.string().url().optional(),
    // JWK Set URI ("kid" should also be provided)
    // https://datatracker.ietf.org/doc/html/rfc9449#section-6.1
    jkt: external_exports.string().optional(),
    // https://datatracker.ietf.org/doc/html/rfc8705
    "x5t#S256": external_exports.string().optional(),
    // X.509 Certificate SHA-256 Thumbprint
    // https://datatracker.ietf.org/doc/html/rfc9203
    osc: external_exports.string().optional()
    // OSCORE_Input_Material carrying the parameters for using OSCORE per-message security with implicit key confirmation
  }).optional(),
  client_id: external_exports.string().optional(),
  scope: external_exports.string().optional(),
  nonce: external_exports.string().optional(),
  at_hash: external_exports.string().optional(),
  c_hash: external_exports.string().optional(),
  s_hash: external_exports.string().optional(),
  auth_time: external_exports.number().int().optional(),
  // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
  // OpenID: "profile" scope
  name: external_exports.string().optional(),
  family_name: external_exports.string().optional(),
  given_name: external_exports.string().optional(),
  middle_name: external_exports.string().optional(),
  nickname: external_exports.string().optional(),
  preferred_username: external_exports.string().optional(),
  gender: external_exports.string().optional(),
  // OpenID only defines "male" and "female" without forbidding other values
  picture: external_exports.string().url().optional(),
  profile: external_exports.string().url().optional(),
  website: external_exports.string().url().optional(),
  birthdate: external_exports.string().regex(/\d{4}-\d{2}-\d{2}/).optional(),
  zoneinfo: external_exports.string().regex(/^[A-Za-z0-9_/]+$/).optional(),
  locale: external_exports.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/).optional(),
  updated_at: external_exports.number().int().optional(),
  // OpenID: "email" scope
  email: external_exports.string().optional(),
  email_verified: external_exports.boolean().optional(),
  // OpenID: "phone" scope
  phone_number: external_exports.string().optional(),
  phone_number_verified: external_exports.boolean().optional(),
  // OpenID: "address" scope
  // https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim
  address: external_exports.object({
    formatted: external_exports.string().optional(),
    street_address: external_exports.string().optional(),
    locality: external_exports.string().optional(),
    region: external_exports.string().optional(),
    postal_code: external_exports.string().optional(),
    country: external_exports.string().optional()
  }).optional(),
  // https://datatracker.ietf.org/doc/html/rfc9396#section-14.2
  authorization_details: external_exports.array(external_exports.object({
    type: external_exports.string(),
    // https://datatracker.ietf.org/doc/html/rfc9396#section-2.2
    locations: external_exports.array(external_exports.string()).optional(),
    actions: external_exports.array(external_exports.string()).optional(),
    datatypes: external_exports.array(external_exports.string()).optional(),
    identifier: external_exports.string().optional(),
    privileges: external_exports.array(external_exports.string()).optional()
  }).passthrough()).optional()
}).passthrough();

// node_modules/@atproto/jwk/dist/jwt-decode.js
function unsafeDecodeJwt(jwt) {
  const { 0: headerEnc, 1: payloadEnc, length } = jwt.split(".");
  if (length > 3 || length < 2) {
    throw new JwtVerifyError(void 0, ERR_JWT_INVALID);
  }
  const header = jwtHeaderSchema.parse(parseB64uJson(headerEnc));
  if (length === 2 && header?.alg !== "none") {
    throw new JwtVerifyError(void 0, ERR_JWT_INVALID);
  }
  const payload = jwtPayloadSchema.parse(parseB64uJson(payloadEnc));
  return { header, payload };
}

// node_modules/@atproto/jwk/dist/key.js
var __runInitializers = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var Key = (() => {
  let _instanceExtraInitializers = [];
  let _get_isPrivate_decorators;
  let _get_isSymetric_decorators;
  let _get_publicJwk_decorators;
  let _get_bareJwk_decorators;
  let _get_algorithms_decorators;
  return class Key {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
      _get_isPrivate_decorators = [cachedGetter];
      _get_isSymetric_decorators = [cachedGetter];
      _get_publicJwk_decorators = [cachedGetter];
      _get_bareJwk_decorators = [cachedGetter];
      _get_algorithms_decorators = [cachedGetter];
      __esDecorate(this, null, _get_isPrivate_decorators, { kind: "getter", name: "isPrivate", static: false, private: false, access: { has: (obj) => "isPrivate" in obj, get: (obj) => obj.isPrivate }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _get_isSymetric_decorators, { kind: "getter", name: "isSymetric", static: false, private: false, access: { has: (obj) => "isSymetric" in obj, get: (obj) => obj.isSymetric }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _get_publicJwk_decorators, { kind: "getter", name: "publicJwk", static: false, private: false, access: { has: (obj) => "publicJwk" in obj, get: (obj) => obj.publicJwk }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _get_bareJwk_decorators, { kind: "getter", name: "bareJwk", static: false, private: false, access: { has: (obj) => "bareJwk" in obj, get: (obj) => obj.bareJwk }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _get_algorithms_decorators, { kind: "getter", name: "algorithms", static: false, private: false, access: { has: (obj) => "algorithms" in obj, get: (obj) => obj.algorithms }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    constructor(jwk) {
      this.jwk = (__runInitializers(this, _instanceExtraInitializers), jwk);
    }
    get isPrivate() {
      return isPrivateJwk(this.jwk);
    }
    get isSymetric() {
      return hasSharedSecretJwk(this.jwk);
    }
    get privateJwk() {
      if (!this.isPrivate)
        return void 0;
      return this.jwk;
    }
    get publicJwk() {
      if (this.isSymetric)
        return void 0;
      if (!this.isPrivate)
        return this.jwk;
      const validated = jwkPubSchema.safeParse({
        ...this.jwk,
        d: void 0,
        k: void 0,
        use: void 0,
        key_ops: buildPublicKeyOps(this.keyOps) ?? PUBLIC_KEY_USAGE
      });
      if (!validated.success)
        return void 0;
      return Object.freeze(validated.data);
    }
    get bareJwk() {
      if (this.isSymetric)
        return void 0;
      const { kty, crv, e, n, x, y } = this.jwk;
      return Object.freeze(jwkSchema.parse({ crv, e, kty, n, x, y }));
    }
    /**
     * @note Only defined on public keys
     */
    get use() {
      return this.jwk.use;
    }
    get keyOps() {
      return this.jwk.key_ops;
    }
    /**
     * The (forced) algorithm to use. If not provided, the key will be usable with
     * any of the algorithms in {@link algorithms}.
     *
     * @see {@link https://datatracker.ietf.org/doc/html/rfc7518#section-3.1 | "alg" (Algorithm) Header Parameter Values for JWS}
     */
    get alg() {
      return this.jwk.alg;
    }
    get kid() {
      return this.jwk.kid;
    }
    get crv() {
      return this.jwk.crv;
    }
    /**
     * All the algorithms that this key can be used with. If `alg` is provided,
     * this set will only contain that algorithm.
     */
    get algorithms() {
      return Object.freeze(Array.from(jwkAlgorithms(this.jwk)));
    }
    get isRevoked() {
      return this.jwk.revoked != null;
    }
    isActive(options) {
      if (!options?.allowRevoked && this.isRevoked)
        return false;
      const tolerance = options?.clockTolerance ?? 0;
      if (tolerance !== Infinity) {
        const now = options?.currentDate?.getTime() ?? Date.now();
        const { exp, nbf } = this.jwk;
        if (nbf != null && !(now >= nbf * 1e3 - tolerance))
          return false;
        if (exp != null && !(now < exp * 1e3 + tolerance))
          return false;
      }
      return true;
    }
    matches(opts) {
      if (opts.kid != null) {
        const matchesKid = Array.isArray(opts.kid) ? this.kid != null && opts.kid.includes(this.kid) : this.kid === opts.kid;
        if (!matchesKid)
          return false;
      }
      if (opts.alg != null) {
        const matchesAlg = Array.isArray(opts.alg) ? opts.alg.some((a) => this.algorithms.includes(a)) : this.algorithms.includes(opts.alg);
        if (!matchesAlg)
          return false;
      }
      if (opts.usage != null) {
        const matchesOps = this.keyOps == null || this.keyOps.includes(opts.usage) || // @NOTE Because this.jwk represents the private key (typically used for
        // private operations), the public counterpart operations are allowed.
        opts.usage === "verify" && this.keyOps.includes("sign") || opts.usage === "encrypt" && this.keyOps.includes("decrypt") || opts.usage === "wrapKey" && this.keyOps.includes("unwrapKey");
        if (!matchesOps)
          return false;
        const matchesUse = this.use == null || this.use === "sig" && isSigKeyUsage(opts.usage) || this.use === "enc" && isEncKeyUsage(opts.usage);
        if (!matchesUse)
          return false;
        const matchesKeyType = this.isPrivate || isPublicKeyUsage(opts.usage);
        if (!matchesKeyType)
          return false;
      }
      return true;
    }
  };
})();
function buildPublicKeyOps(keyUsages) {
  if (keyUsages == null)
    return void 0;
  const publicOps = new Set(keyUsages.filter(isPublicKeyUsage));
  if (keyUsages.includes("sign"))
    publicOps.add("verify");
  if (keyUsages.includes("decrypt"))
    publicOps.add("encrypt");
  if (keyUsages.includes("unwrapKey"))
    publicOps.add("wrapKey");
  return Array.from(publicOps);
}

// node_modules/@atproto/jwk/dist/keyset.js
var __runInitializers2 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate2 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var extractPrivateJwk = (key) => key.privateJwk;
var extractPublicJwk = (key) => key.publicJwk;
var Keyset = (() => {
  let _instanceExtraInitializers = [];
  let _get_signAlgorithms_decorators;
  let _get_publicJwks_decorators;
  let _get_privateJwks_decorators;
  return class Keyset2 {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
      __esDecorate2(this, null, _get_signAlgorithms_decorators, { kind: "getter", name: "signAlgorithms", static: false, private: false, access: { has: (obj) => "signAlgorithms" in obj, get: (obj) => obj.signAlgorithms }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _get_publicJwks_decorators, { kind: "getter", name: "publicJwks", static: false, private: false, access: { has: (obj) => "publicJwks" in obj, get: (obj) => obj.publicJwks }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _get_privateJwks_decorators, { kind: "getter", name: "privateJwks", static: false, private: false, access: { has: (obj) => "privateJwks" in obj, get: (obj) => obj.privateJwks }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    constructor(iterable, preferredSigningAlgorithms = iterable instanceof Keyset2 ? [...iterable.preferredSigningAlgorithms] : [
      // Prefer elliptic curve algorithms
      "EdDSA",
      "ES256K",
      "ES256",
      // https://datatracker.ietf.org/doc/html/rfc7518#section-3.5
      "PS256",
      "PS384",
      "PS512",
      "HS256",
      "HS384",
      "HS512"
    ]) {
      this.preferredSigningAlgorithms = (__runInitializers2(this, _instanceExtraInitializers), preferredSigningAlgorithms);
      const keys = [];
      const keyIds = /* @__PURE__ */ new Set();
      for (const key of iterable) {
        if (!key)
          continue;
        keys.push(key);
        if (key.kid) {
          if (keyIds.has(key.kid))
            throw new JwkError(`Duplicate key: ${key.kid}`);
          else
            keyIds.add(key.kid);
        }
      }
      this.keys = Object.freeze(keys);
    }
    get size() {
      return this.keys.length;
    }
    get signAlgorithms() {
      const algorithms = /* @__PURE__ */ new Set();
      for (const key of this) {
        if (key.use !== "sig")
          continue;
        for (const alg of key.algorithms) {
          algorithms.add(alg);
        }
      }
      return Object.freeze([...algorithms].sort(preferredOrderCmp(this.preferredSigningAlgorithms)));
    }
    get publicJwks() {
      return Object.freeze({
        keys: Object.freeze(Array.from(this, extractPublicJwk).filter(isDefined))
      });
    }
    get privateJwks() {
      return Object.freeze({
        keys: Object.freeze(Array.from(this, extractPrivateJwk).filter(isDefined))
      });
    }
    has(kid) {
      return this.keys.some((key) => key.kid === kid);
    }
    get(options) {
      const key = this.find(options);
      if (key)
        return key;
      throw new JwkError(`Key not found ${options.kid ?? options.alg ?? options.usage ?? "<unknown>"}`, ERR_JWK_NOT_FOUND);
    }
    find(options) {
      for (const key of this.list(options)) {
        return key;
      }
      return void 0;
    }
    *list(options) {
      for (const key of this) {
        if (key.isActive(options) && key.matches(options)) {
          yield key;
        }
      }
    }
    findPrivateKey({ kid, alg, usage, ...options }) {
      const matchingKeys = [];
      if (Array.isArray(alg) && alg.length === 1)
        alg = alg[0];
      for (const key of this.list({ ...options, kid, alg, usage })) {
        if (typeof alg === "string")
          return { key, alg };
        matchingKeys.push(key);
      }
      const isAllowedAlg = matchesAny(alg);
      const candidates = matchingKeys.map((key) => [key, key.algorithms.filter(isAllowedAlg)]);
      for (const prefAlg of this.preferredSigningAlgorithms) {
        for (const [matchingKey, matchingAlgs] of candidates) {
          if (matchingAlgs.includes(prefAlg)) {
            return { key: matchingKey, alg: prefAlg };
          }
        }
      }
      for (const [matchingKey, matchingAlgs] of candidates) {
        for (const alg2 of matchingAlgs) {
          return { key: matchingKey, alg: alg2 };
        }
      }
      throw new JwkError(`No private key found for ${kid || alg || usage}`, ERR_JWK_NOT_FOUND);
    }
    [(_get_signAlgorithms_decorators = [cachedGetter], _get_publicJwks_decorators = [cachedGetter], _get_privateJwks_decorators = [cachedGetter], Symbol.iterator)]() {
      return this.keys.values();
    }
    async createJwt({ alg: sAlg, kid: sKid, ...header }, payload) {
      try {
        const { key, alg } = this.findPrivateKey({
          alg: sAlg,
          kid: sKid,
          usage: "sign",
          allowRevoked: false
          // For explicitness (default value is false)
        });
        const protectedHeader = { ...header, alg, kid: key.kid };
        if (typeof payload === "function") {
          payload = await payload(protectedHeader, key);
        }
        return await key.createJwt(protectedHeader, payload);
      } catch (err) {
        throw JwtCreateError.from(err);
      }
    }
    async verifyJwt(token, options) {
      const { header } = unsafeDecodeJwt(token);
      const { kid, alg } = header;
      const errors = [];
      for (const key of this.list({ ...options, kid, alg, usage: "verify" })) {
        try {
          const result = await key.verifyJwt(token, options);
          return { ...result, key };
        } catch (err) {
          errors.push(err);
        }
      }
      switch (errors.length) {
        case 0:
          throw new JwtVerifyError("No key matched", ERR_JWKS_NO_MATCHING_KEY);
        case 1:
          throw JwtVerifyError.from(errors[0], ERR_JWT_INVALID);
        default:
          throw JwtVerifyError.from(errors, ERR_JWT_INVALID);
      }
    }
    toJSON() {
      return structuredClone(this.publicJwks);
    }
  };
})();

// node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default = crypto;
var isCryptoKey = (key) => key instanceof CryptoKey;

// node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder2 = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}

// node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64 = (input) => {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
};
var encode2 = (input) => {
  return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};
var decodeBase64 = (encoded) => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};
var decode2 = (input) => {
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder2.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
};

// node_modules/jose/dist/browser/util/errors.js
var errors_exports = {};
__export(errors_exports, {
  JOSEAlgNotAllowed: () => JOSEAlgNotAllowed,
  JOSEError: () => JOSEError,
  JOSENotSupported: () => JOSENotSupported,
  JWEDecryptionFailed: () => JWEDecryptionFailed,
  JWEInvalid: () => JWEInvalid,
  JWKInvalid: () => JWKInvalid,
  JWKSInvalid: () => JWKSInvalid,
  JWKSMultipleMatchingKeys: () => JWKSMultipleMatchingKeys,
  JWKSNoMatchingKey: () => JWKSNoMatchingKey,
  JWKSTimeout: () => JWKSTimeout,
  JWSInvalid: () => JWSInvalid,
  JWSSignatureVerificationFailed: () => JWSSignatureVerificationFailed,
  JWTClaimValidationFailed: () => JWTClaimValidationFailed,
  JWTExpired: () => JWTExpired,
  JWTInvalid: () => JWTInvalid
});
var JOSEError = class extends Error {
  constructor(message2, options) {
    super(message2, options);
    this.code = "ERR_JOSE_GENERIC";
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_EXPIRED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
    this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWE_INVALID";
  }
};
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWS_INVALID";
  }
};
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWT_INVALID";
  }
};
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWK_INVALID";
  }
};
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWKS_INVALID";
  }
};
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
  constructor(message2 = "request timed out", options) {
    super(message2, options);
    this.code = "ERR_JWKS_TIMEOUT";
  }
};
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
    this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
function checkSigCryptoKey(key, alg, ...usages) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}

// node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
var invalid_key_input_default = (actual, ...types2) => {
  return message("Key must be ", actual, ...types2);
};
function withAlg(alg, actual, ...types2) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}

// node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default = (key) => {
  if (isCryptoKey(key)) {
    return true;
  }
  return key?.[Symbol.toStringTag] === "KeyObject";
};
var types = ["CryptoKey"];

// node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint = (...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
};
var is_disjoint_default = isDisjoint;

// node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}

// node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default = (alg, key) => {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
};

// node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}

// node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
var parse = async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const rest = [
    algorithm,
    jwk.ext ?? false,
    jwk.key_ops ?? keyUsages
  ];
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
};
var jwk_to_key_default = parse;

// node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue = (k) => decode2(k);
var privCache;
var pubCache;
var isKeyObject = (key) => {
  return key?.[Symbol.toStringTag] === "KeyObject";
};
var importAndCache = async (cache, key, jwk, alg, freeze = false) => {
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
};
var normalizePublicKey = (key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.p;
    delete jwk.q;
    delete jwk.qi;
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(pubCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode2(key.k);
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(pubCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
};
var normalizePrivateKey = (key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(privCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode2(key.k);
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(privCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
};
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

// node_modules/jose/dist/browser/runtime/asn1.js
var findOid = (keyData, oid, from3 = 0) => {
  if (from3 === 0) {
    oid.unshift(oid.length);
    oid.unshift(6);
  }
  const i = keyData.indexOf(oid[0], from3);
  if (i === -1)
    return false;
  const sub = keyData.subarray(i, i + oid.length);
  if (sub.length !== oid.length)
    return false;
  return sub.every((value, index) => value === oid[index]) || findOid(keyData, oid, i + 1);
};
var getNamedCurve2 = (keyData) => {
  switch (true) {
    case findOid(keyData, [42, 134, 72, 206, 61, 3, 1, 7]):
      return "P-256";
    case findOid(keyData, [43, 129, 4, 0, 34]):
      return "P-384";
    case findOid(keyData, [43, 129, 4, 0, 35]):
      return "P-521";
    case findOid(keyData, [43, 101, 110]):
      return "X25519";
    case findOid(keyData, [43, 101, 111]):
      return "X448";
    case findOid(keyData, [43, 101, 112]):
      return "Ed25519";
    case findOid(keyData, [43, 101, 113]):
      return "Ed448";
    default:
      throw new JOSENotSupported("Invalid or unsupported EC Key Curve or OKP Key Sub Type");
  }
};
var genericImport = async (replace, keyFormat, pem, alg, options) => {
  let algorithm;
  let keyUsages;
  const keyData = new Uint8Array(atob(pem.replace(replace, "")).split("").map((c) => c.charCodeAt(0)));
  const isPublic = keyFormat === "spki";
  switch (alg) {
    case "PS256":
    case "PS384":
    case "PS512":
      algorithm = { name: "RSA-PSS", hash: `SHA-${alg.slice(-3)}` };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "RS256":
    case "RS384":
    case "RS512":
      algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${alg.slice(-3)}` };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512":
      algorithm = {
        name: "RSA-OAEP",
        hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`
      };
      keyUsages = isPublic ? ["encrypt", "wrapKey"] : ["decrypt", "unwrapKey"];
      break;
    case "ES256":
      algorithm = { name: "ECDSA", namedCurve: "P-256" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "ES384":
      algorithm = { name: "ECDSA", namedCurve: "P-384" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "ES512":
      algorithm = { name: "ECDSA", namedCurve: "P-521" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "ECDH-ES":
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      const namedCurve = getNamedCurve2(keyData);
      algorithm = namedCurve.startsWith("P-") ? { name: "ECDH", namedCurve } : { name: namedCurve };
      keyUsages = isPublic ? [] : ["deriveBits"];
      break;
    }
    case "Ed25519":
      algorithm = { name: "Ed25519" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "EdDSA":
      algorithm = { name: getNamedCurve2(keyData) };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    default:
      throw new JOSENotSupported('Invalid or unsupported "alg" (Algorithm) value');
  }
  return webcrypto_default.subtle.importKey(keyFormat, keyData, algorithm, options?.extractable ?? false, keyUsages);
};
var fromPKCS8 = (pem, alg, options) => {
  return genericImport(/(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g, "pkcs8", pem, alg, options);
};

// node_modules/jose/dist/browser/key/import.js
async function importPKCS8(pkcs8, alg, options) {
  if (typeof pkcs8 !== "string" || pkcs8.indexOf("-----BEGIN PRIVATE KEY-----") !== 0) {
    throw new TypeError('"pkcs8" must be PKCS#8 formatted string');
  }
  return fromPKCS8(pkcs8, alg, options);
}
async function importJWK(jwk, alg) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg || (alg = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode2(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}

// node_modules/jose/dist/browser/lib/check_key_type.js
var tag = (key) => key?.[Symbol.toStringTag];
var jwkMatchesOp = (alg, key, usage) => {
  if (key.use !== void 0 && key.use !== "sig") {
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  }
  if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
  }
  return true;
};
var symmetricTypeCheck = (alg, key, usage, allowJwk) => {
  if (key instanceof Uint8Array)
    return;
  if (allowJwk && isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
};
var asymmetricTypeCheck = (alg, key, usage, allowJwk) => {
  if (allowJwk && isJWK(key)) {
    switch (usage) {
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (usage === "sign" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
  }
  if (usage === "decrypt" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
  }
  if (key.algorithm && usage === "verify" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
  }
  if (key.algorithm && usage === "encrypt" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
  }
};
function checkKeyType(allowJwk, alg, key, usage) {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg, key, usage, allowJwk);
  }
}
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

// node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
var validate_crit_default = validateCrit;

// node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms = (option, algorithms) => {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
};
var validate_algorithms_default = validateAlgorithms;

// node_modules/jose/dist/browser/runtime/key_to_jwk.js
var keyToJWK = async (key) => {
  if (key instanceof Uint8Array) {
    return {
      kty: "oct",
      k: encode2(key)
    };
  }
  if (!isCryptoKey(key)) {
    throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array"));
  }
  if (!key.extractable) {
    throw new TypeError("non-extractable CryptoKey cannot be exported as a JWK");
  }
  const { ext, key_ops, alg, use, ...jwk } = await webcrypto_default.subtle.exportKey("jwk", key);
  return jwk;
};
var key_to_jwk_default = keyToJWK;

// node_modules/jose/dist/browser/key/export.js
async function exportJWK(key) {
  return key_to_jwk_default(key);
}

// node_modules/jose/dist/browser/runtime/subtle_dsa.js
function subtleDsa(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}

// node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function getCryptoKey(alg, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}

// node_modules/jose/dist/browser/runtime/verify.js
var verify = async (alg, key, signature, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "verify");
  check_key_length_default(alg, cryptoKey);
  const algorithm = subtleDsa(alg, cryptoKey.algorithm);
  try {
    return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
};
var verify_default = verify;

// node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode2(jws.protected);
      parsedProt = JSON.parse(decoder2.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg);
    }
  } else {
    checkKeyTypeWithJwk(alg, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode2(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode2(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}

// node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder2.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}

// node_modules/jose/dist/browser/lib/epoch.js
var epoch_default = (date) => Math.floor(date.getTime() / 1e3);

// node_modules/jose/dist/browser/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = (str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
};

// node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, "");
var checkAudiencePresence = (audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
};
var jwt_claims_set_default = (protectedHeader, encodedPayload, options = {}) => {
  let payload;
  try {
    payload = JSON.parse(decoder2.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs_default(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
};

// node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}

// node_modules/jose/dist/browser/runtime/sign.js
var sign = async (alg, key, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "sign");
  check_key_length_default(alg, cryptoKey);
  const signature = await webcrypto_default.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
};
var sign_default = sign;

// node_modules/jose/dist/browser/jws/flattened/sign.js
var FlattenedSign = class {
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this._payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    if (this._protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this._protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this._unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this._unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this._protectedHeader && !this._unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this._protectedHeader,
      ...this._unprotectedHeader
    };
    const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this._protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    checkKeyTypeWithJwk(alg, key, "sign");
    let payload = this._payload;
    if (b64) {
      payload = encoder.encode(encode2(payload));
    }
    let protectedHeader;
    if (this._protectedHeader) {
      protectedHeader = encoder.encode(encode2(JSON.stringify(this._protectedHeader)));
    } else {
      protectedHeader = encoder.encode("");
    }
    const data = concat(protectedHeader, encoder.encode("."), payload);
    const signature = await sign_default(alg, key, data);
    const jws = {
      signature: encode2(signature),
      payload: ""
    };
    if (b64) {
      jws.payload = decoder2.decode(payload);
    }
    if (this._unprotectedHeader) {
      jws.header = this._unprotectedHeader;
    }
    if (this._protectedHeader) {
      jws.protected = decoder2.decode(protectedHeader);
    }
    return jws;
  }
};

// node_modules/jose/dist/browser/jws/compact/sign.js
var CompactSign = class {
  constructor(payload) {
    this._flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this._flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this._flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};

// node_modules/jose/dist/browser/jwt/produce.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
var ProduceJWT = class {
  constructor(payload = {}) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this._payload = payload;
  }
  setIssuer(issuer) {
    this._payload = { ...this._payload, iss: issuer };
    return this;
  }
  setSubject(subject) {
    this._payload = { ...this._payload, sub: subject };
    return this;
  }
  setAudience(audience) {
    this._payload = { ...this._payload, aud: audience };
    return this;
  }
  setJti(jwtId) {
    this._payload = { ...this._payload, jti: jwtId };
    return this;
  }
  setNotBefore(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setExpirationTime(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setIssuedAt(input) {
    if (typeof input === "undefined") {
      this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
    } else if (typeof input === "string") {
      this._payload = {
        ...this._payload,
        iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
      };
    } else {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
    }
    return this;
  }
};

// node_modules/jose/dist/browser/jwt/sign.js
var SignJWT = class extends ProduceJWT {
  setProtectedHeader(protectedHeader) {
    this._protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
    sig.setProtectedHeader(this._protectedHeader);
    if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
};

// node_modules/jose/dist/browser/runtime/generate.js
function getModulusLengthOption(options) {
  const modulusLength = options?.modulusLength ?? 2048;
  if (typeof modulusLength !== "number" || modulusLength < 2048) {
    throw new JOSENotSupported("Invalid or unsupported modulusLength option provided, 2048 bits or larger keys must be used");
  }
  return modulusLength;
}
async function generateKeyPair(alg, options) {
  let algorithm;
  let keyUsages;
  switch (alg) {
    case "PS256":
    case "PS384":
    case "PS512":
      algorithm = {
        name: "RSA-PSS",
        hash: `SHA-${alg.slice(-3)}`,
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: getModulusLengthOption(options)
      };
      keyUsages = ["sign", "verify"];
      break;
    case "RS256":
    case "RS384":
    case "RS512":
      algorithm = {
        name: "RSASSA-PKCS1-v1_5",
        hash: `SHA-${alg.slice(-3)}`,
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: getModulusLengthOption(options)
      };
      keyUsages = ["sign", "verify"];
      break;
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512":
      algorithm = {
        name: "RSA-OAEP",
        hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`,
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: getModulusLengthOption(options)
      };
      keyUsages = ["decrypt", "unwrapKey", "encrypt", "wrapKey"];
      break;
    case "ES256":
      algorithm = { name: "ECDSA", namedCurve: "P-256" };
      keyUsages = ["sign", "verify"];
      break;
    case "ES384":
      algorithm = { name: "ECDSA", namedCurve: "P-384" };
      keyUsages = ["sign", "verify"];
      break;
    case "ES512":
      algorithm = { name: "ECDSA", namedCurve: "P-521" };
      keyUsages = ["sign", "verify"];
      break;
    case "Ed25519":
      algorithm = { name: "Ed25519" };
      keyUsages = ["sign", "verify"];
      break;
    case "EdDSA": {
      keyUsages = ["sign", "verify"];
      const crv = options?.crv ?? "Ed25519";
      switch (crv) {
        case "Ed25519":
        case "Ed448":
          algorithm = { name: crv };
          break;
        default:
          throw new JOSENotSupported("Invalid or unsupported crv option provided");
      }
      break;
    }
    case "ECDH-ES":
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      keyUsages = ["deriveKey", "deriveBits"];
      const crv = options?.crv ?? "P-256";
      switch (crv) {
        case "P-256":
        case "P-384":
        case "P-521": {
          algorithm = { name: "ECDH", namedCurve: crv };
          break;
        }
        case "X25519":
        case "X448":
          algorithm = { name: crv };
          break;
        default:
          throw new JOSENotSupported("Invalid or unsupported crv option provided, supported values are P-256, P-384, P-521, X25519, and X448");
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  }
  return webcrypto_default.subtle.generateKey(algorithm, options?.extractable ?? false, keyUsages);
}

// node_modules/jose/dist/browser/key/generate_key_pair.js
async function generateKeyPair2(alg, options) {
  return generateKeyPair(alg, options);
}

// node_modules/@atproto/jwk-jose/dist/util.js
function either(a, b) {
  if (a != null && b != null && a !== b) {
    throw new TypeError(`Expected "${b}", got "${a}"`);
  }
  return a ?? b ?? void 0;
}

// node_modules/@atproto/jwk-jose/dist/jose-key.js
var { JOSEError: JOSEError2 } = errors_exports;
var JoseKey = class _JoseKey extends Key {
  /**
   * Some runtimes (e.g. Bun) require an `alg` second argument to be set when
   * invoking `importJWK`. In order to be compatible with these runtimes, we
   * provide the following method to ensure the `alg` is always set. We also
   * take the opportunity to ensure that the `alg` is compatible with this key.
   */
  async getKeyObj(alg) {
    if (!this.algorithms.includes(alg)) {
      throw new JwkError(`Key cannot be used with algorithm "${alg}"`);
    }
    try {
      return await importJWK(this.jwk, alg);
    } catch (cause) {
      throw new JwkError("Failed to import JWK", void 0, { cause });
    }
  }
  async createJwt(header, payload) {
    try {
      const { kid } = header;
      if (kid && kid !== this.kid) {
        throw new JwtCreateError(`Invalid "kid" (${kid}) used to sign with key "${this.kid}"`);
      }
      const { alg } = header;
      if (!alg) {
        throw new JwtCreateError('Missing "alg" in JWT header');
      }
      const keyObj = await this.getKeyObj(alg);
      const jwtBuilder = new SignJWT(payload).setProtectedHeader({
        ...header,
        alg,
        kid: this.kid
      });
      const signedJwt = await jwtBuilder.sign(keyObj);
      return signedJwt;
    } catch (cause) {
      if (cause instanceof JOSEError2) {
        throw new JwtCreateError(cause.message, cause.code, { cause });
      } else {
        throw JwtCreateError.from(cause);
      }
    }
  }
  async verifyJwt(token, options) {
    try {
      const result = await jwtVerify(token, async ({ alg }) => this.getKeyObj(alg), { ...options, algorithms: this.algorithms });
      const headerParsed = jwtHeaderSchema.safeParse(result.protectedHeader);
      if (!headerParsed.success) {
        throw new JwtVerifyError("Invalid JWT header", void 0, {
          cause: headerParsed.error
        });
      }
      const payloadParsed = jwtPayloadSchema.safeParse(result.payload);
      if (!payloadParsed.success) {
        throw new JwtVerifyError("Invalid JWT payload", void 0, {
          cause: payloadParsed.error
        });
      }
      return {
        protectedHeader: headerParsed.data,
        // "requiredClaims" enforced by jwtVerify()
        payload: payloadParsed.data
      };
    } catch (cause) {
      if (cause instanceof JOSEError2) {
        throw new JwtVerifyError(cause.message, cause.code, { cause });
      } else {
        throw JwtVerifyError.from(cause);
      }
    }
  }
  static async generateKeyPair(allowedAlgos = ["ES256"], options) {
    if (!allowedAlgos.length) {
      throw new JwkError("No algorithms provided for key generation");
    }
    const errors = [];
    for (const alg of allowedAlgos) {
      try {
        return await generateKeyPair2(alg, options);
      } catch (err) {
        errors.push(err);
      }
    }
    throw new JwkError("Failed to generate key pair", void 0, {
      cause: new AggregateError(errors, "None of the algorithms worked")
    });
  }
  static async generate(allowedAlgos = ["ES256"], kid, options) {
    const kp = await this.generateKeyPair(allowedAlgos, {
      ...options,
      extractable: true
    });
    return this.fromKeyLike(kp.privateKey, kid);
  }
  static async fromImportable(input, kid) {
    if (typeof input === "string") {
      if (input.startsWith("-----")) {
        return this.fromPKCS8(input, "", kid);
      }
      if (input.startsWith("{")) {
        return this.fromJWK(input, kid);
      }
      throw new JwkError("Invalid input");
    }
    if (typeof input === "object") {
      if ("kty" in input || "alg" in input) {
        return this.fromJWK(input, kid);
      }
      return this.fromKeyLike(input, kid);
    }
    throw new JwkError("Invalid input");
  }
  /**
   * @see {@link exportJWK}
   */
  static async fromKeyLike(keyLike, kid, alg) {
    const jwk = await exportJWK(keyLike);
    if (alg) {
      if (!jwk.alg)
        jwk.alg = alg;
      else if (jwk.alg !== alg)
        throw new JwkError('Invalid "alg" in JWK');
    }
    return this.fromJWK(jwk, kid);
  }
  /**
   * @see {@link importPKCS8}
   */
  static async fromPKCS8(pem, alg, kid) {
    const keyLike = await importPKCS8(pem, alg, { extractable: true });
    return this.fromKeyLike(keyLike, kid);
  }
  static async fromJWK(input, inputKid) {
    const jwk = typeof input === "string" ? JSON.parse(input) : input;
    if (!jwk || typeof jwk !== "object")
      throw new JwkError("Invalid JWK");
    const kid = either(jwk.kid, inputKid);
    if (jwk.use != null && isPrivateJwk(jwk)) {
      console.warn('Deprecation warning: Private JWK with a "use" property will be rejected in the future. Please remove replace "use" with (valid) "key_ops".');
      jwk.key_ops ??= jwk.use === "sig" ? ["sign"] : ["encrypt"];
      delete jwk.use;
    }
    return new _JoseKey(jwkSchema.parse({ ...jwk, kid }));
  }
};

// node_modules/@atproto/jwk-webcrypto/dist/util.js
function fromSubtleAlgorithm(algorithm) {
  switch (algorithm.name) {
    case "RSA-PSS":
    case "RSASSA-PKCS1-v1_5": {
      const hash = algorithm.hash.name;
      switch (hash) {
        case "SHA-256":
        case "SHA-384":
        case "SHA-512": {
          const prefix = algorithm.name === "RSA-PSS" ? "PS" : "RS";
          return `${prefix}${hash.slice(-3)}`;
        }
        default:
          throw new TypeError("unsupported RsaHashedKeyAlgorithm hash");
      }
    }
    case "ECDSA": {
      const namedCurve = algorithm.namedCurve;
      switch (namedCurve) {
        case "P-256":
        case "P-384":
        case "P-512":
          return `ES${namedCurve.slice(-3)}`;
        case "P-521":
          return "ES512";
        default:
          throw new TypeError("unsupported EcKeyAlgorithm namedCurve");
      }
    }
    case "Ed448":
    case "Ed25519":
      return "EdDSA";
    default:
      throw new TypeError(`Unexpected algorithm "${algorithm.name}"`);
  }
}
function isCryptoKeyPair(v, extractable) {
  return typeof v === "object" && v !== null && "privateKey" in v && v.privateKey instanceof CryptoKey && v.privateKey.type === "private" && (extractable == null || v.privateKey.extractable === extractable) && v.privateKey.usages.includes("sign") && "publicKey" in v && v.publicKey instanceof CryptoKey && v.publicKey.type === "public" && v.publicKey.extractable === true && v.publicKey.usages.includes("verify");
}

// node_modules/@atproto/jwk-webcrypto/dist/webcrypto-key.js
var WebcryptoKey = class _WebcryptoKey extends JoseKey {
  // We need to override the static method generate from JoseKey because
  // the browser needs both the private and public keys
  static async generate(allowedAlgos = ["ES256"], kid = crypto.randomUUID(), options) {
    const keyPair = await this.generateKeyPair(allowedAlgos, options);
    if (!isCryptoKeyPair(keyPair)) {
      throw new TypeError("Invalid CryptoKeyPair");
    }
    return this.fromKeypair(keyPair, kid);
  }
  static async fromKeypair(cryptoKeyPair, kid) {
    const { alg = fromSubtleAlgorithm(cryptoKeyPair.privateKey.algorithm), ...jwk } = await crypto.subtle.exportKey("jwk", cryptoKeyPair.privateKey.extractable ? cryptoKeyPair.privateKey : cryptoKeyPair.publicKey);
    return new _WebcryptoKey(jwkSchema.parse({ ...jwk, kid, alg }), cryptoKeyPair);
  }
  constructor(jwk, cryptoKeyPair) {
    if (!jwk.alg)
      throw new JwkError('JWK "alg" is required for Webcrypto keys');
    super(jwk);
    this.cryptoKeyPair = cryptoKeyPair;
  }
  get isPrivate() {
    return true;
  }
  async getKeyObj(alg) {
    if (this.jwk.alg !== alg) {
      throw new JwkError(`Key cannot be used with algorithm "${alg}"`);
    }
    return this.cryptoKeyPair.privateKey;
  }
};

// node_modules/@atproto/oauth-client/dist/index.js
var import_dispose = __toESM(require_dispose(), 1);

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/lib/number.js
var ifNumber = (value) => typeof value === "number" ? value : void 0;

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/did-error.js
var DidError = class _DidError extends Error {
  constructor(did, message2, code, status = 400, cause) {
    super(message2, { cause });
    this.did = did;
    this.code = code;
    this.status = status;
  }
  /**
   * For compatibility with error handlers in common HTTP frameworks.
   */
  get statusCode() {
    return this.status;
  }
  toString() {
    return `${this.constructor.name} ${this.code} (${this.did}): ${this.message}`;
  }
  static from(cause, did) {
    if (cause instanceof _DidError) {
      return cause;
    }
    const message2 = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "An unknown error occurred";
    const status = typeof cause === "object" && cause != null ? ("statusCode" in cause ? ifNumber(cause.statusCode) : void 0) ?? ("status" in cause ? ifNumber(cause.status) : void 0) : void 0;
    return new _DidError(did, message2, "did-unknown-error", status, cause);
  }
};
var InvalidDidError = class extends DidError {
  constructor(did, message2, cause) {
    super(did, message2, "did-invalid", 400, cause);
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/did.js
var DID_PREFIX = "did:";
var DID_PREFIX_LENGTH = DID_PREFIX.length;
function assertDidMethod(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError(input, `Empty method name`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 48 || c > 57)) {
      throw new InvalidDidError(input, `Invalid character at position ${i} in DID method name`);
    }
  }
}
function extractDidMethod(did) {
  const msidSep = did.indexOf(":", DID_PREFIX_LENGTH);
  const method = did.slice(DID_PREFIX_LENGTH, msidSep);
  return method;
}
function assertDidMsid(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError(input, `DID method-specific id must not be empty`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 65 || c > 90) && // A-Z
    (c < 48 || c > 57) && // 0-9
    c !== 46 && // .
    c !== 45 && // -
    c !== 95) {
      if (c === 58) {
        if (i === end - 1) {
          throw new InvalidDidError(input, `DID cannot end with ":"`);
        }
        continue;
      }
      if (c === 37) {
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError(input, `Invalid pct-encoded character at position ${i}`);
        }
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError(input, `Invalid pct-encoded character at position ${i}`);
        }
        if (i >= end) {
          throw new InvalidDidError(input, `Incomplete pct-encoded character at position ${i - 2}`);
        }
        continue;
      }
      throw new InvalidDidError(input, `Disallowed character in DID at position ${i}`);
    }
  }
}
function assertDid(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError(typeof input, `DID must be a string`);
  }
  const { length } = input;
  if (length > 2048) {
    throw new InvalidDidError(input, `DID is too long (2048 chars max)`);
  }
  if (!input.startsWith(DID_PREFIX)) {
    throw new InvalidDidError(input, `DID requires "${DID_PREFIX}" prefix`);
  }
  const idSep = input.indexOf(":", DID_PREFIX_LENGTH);
  if (idSep === -1) {
    throw new InvalidDidError(input, `Missing colon after method name`);
  }
  assertDidMethod(input, DID_PREFIX_LENGTH, idSep);
  assertDidMsid(input, idSep + 1, length);
}
function isDid(input) {
  try {
    assertDid(input);
    return true;
  } catch (err) {
    if (err instanceof DidError) {
      return false;
    }
    throw err;
  }
}
function asDid(input) {
  assertDid(input);
  return input;
}
var didSchema = external_exports.string().superRefine((value, ctx) => {
  try {
    assertDid(value);
    return true;
  } catch (err) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: err instanceof Error ? err.message : "Unexpected error"
    });
    return false;
  }
});

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/lib/uri.js
function isFragment(value, startIdx = 0, endIdx = value.length) {
  let charCode;
  for (let i = startIdx; i < endIdx; i++) {
    charCode = value.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122 || charCode >= 48 && charCode <= 57 || charCode === 45 || charCode === 46 || charCode === 95 || charCode === 126) {
    } else if (charCode === 33 || charCode === 36 || charCode === 38 || charCode === 39 || charCode === 40 || charCode === 41 || charCode === 42 || charCode === 43 || charCode === 44 || charCode === 59 || charCode === 61) {
    } else if (charCode === 58 || charCode === 64) {
    } else if (charCode === 47 || charCode === 63) {
    } else if (charCode === 37) {
      if (i + 2 >= endIdx)
        return false;
      if (!isHexDigit(value.charCodeAt(i + 1)))
        return false;
      if (!isHexDigit(value.charCodeAt(i + 2)))
        return false;
      i += 2;
    } else {
      return false;
    }
  }
  return true;
}
function isHexDigit(code) {
  return code >= 48 && code <= 57 || // 0-9
  code >= 65 && code <= 70 || // A-F
  code >= 97 && code <= 102;
}
var canParse = URL.canParse?.bind(URL) ?? ((url, base) => {
  try {
    new URL(url, base);
    return true;
  } catch {
    return false;
  }
});

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/did-ref.js
var isDidRefAbsolute = (value) => {
  if (typeof value !== "string")
    return false;
  const hashIndex = value.indexOf("#");
  if (hashIndex === -1)
    return false;
  if (hashIndex === value.length - 1)
    return false;
  if (value.includes("#", hashIndex + 1))
    return false;
  return isFragment(value, hashIndex + 1) && isDid(value.slice(0, hashIndex));
};
function isDidRefRelative(value, id) {
  if (typeof value !== "string")
    return false;
  if (value.charCodeAt(0) !== 35)
    return false;
  if (value.length < 2)
    return false;
  if (value.includes("#", 1))
    return false;
  if (!isFragment(value, 1))
    return false;
  if (id !== void 0 && value !== `#${id}`)
    return false;
  return true;
}

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/methods/plc.js
var DID_PLC_PREFIX = `did:plc:`;
var DID_PLC_PREFIX_LENGTH = DID_PLC_PREFIX.length;
var DID_PLC_LENGTH = 32;
function isDidPlc(input) {
  if (typeof input !== "string")
    return false;
  if (input.length !== DID_PLC_LENGTH)
    return false;
  if (!input.startsWith(DID_PLC_PREFIX))
    return false;
  for (let i = DID_PLC_PREFIX_LENGTH; i < DID_PLC_LENGTH; i++) {
    if (!isBase32Char(input.charCodeAt(i)))
      return false;
  }
  return true;
}
function asDidPlc(input) {
  assertDidPlc(input);
  return input;
}
function assertDidPlc(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError(typeof input, `DID must be a string`);
  }
  if (!input.startsWith(DID_PLC_PREFIX)) {
    throw new InvalidDidError(input, `Invalid did:plc prefix`);
  }
  if (input.length !== DID_PLC_LENGTH) {
    throw new InvalidDidError(input, `did:plc must be ${DID_PLC_LENGTH} characters long`);
  }
  for (let i = DID_PLC_PREFIX_LENGTH; i < DID_PLC_LENGTH; i++) {
    if (!isBase32Char(input.charCodeAt(i))) {
      throw new InvalidDidError(input, `Invalid character at position ${i}`);
    }
  }
}
var isBase32Char = (c) => c >= 97 && c <= 122 || c >= 50 && c <= 55;

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/methods/web.js
var DID_WEB_PREFIX = `did:web:`;
function isDidWeb(input) {
  if (typeof input !== "string")
    return false;
  if (!input.startsWith(DID_WEB_PREFIX))
    return false;
  if (input.charAt(DID_WEB_PREFIX.length) === ":")
    return false;
  try {
    assertDidMsid(input, DID_WEB_PREFIX.length);
  } catch {
    return false;
  }
  return canParse(buildDidWebUrl(input));
}
function asDidWeb(input) {
  assertDidWeb(input);
  return input;
}
function assertDidWeb(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError(typeof input, `DID must be a string`);
  }
  if (!input.startsWith(DID_WEB_PREFIX)) {
    throw new InvalidDidError(input, `Invalid did:web prefix`);
  }
  if (input.charAt(DID_WEB_PREFIX.length) === ":") {
    throw new InvalidDidError(input, "did:web MSID must not start with a colon");
  }
  assertDidMsid(input, DID_WEB_PREFIX.length);
  if (!canParse(buildDidWebUrl(input))) {
    throw new InvalidDidError(input, "Invalid Web DID");
  }
}
function didWebToUrl(did) {
  try {
    return new URL(buildDidWebUrl(did));
  } catch (cause) {
    throw new InvalidDidError(did, "Invalid Web DID", cause);
  }
}
function urlToDidWeb(url) {
  const port = url.port ? `%3A${url.port}` : "";
  const path = url.pathname === "/" ? "" : url.pathname.replaceAll("/", ":");
  return `did:web:${url.hostname}${port}${path}`;
}
function buildDidWebUrl(did) {
  const hostIdx = DID_WEB_PREFIX.length;
  const pathIdx = did.indexOf(":", hostIdx);
  const hostEnc = pathIdx === -1 ? did.slice(hostIdx) : did.slice(hostIdx, pathIdx);
  const host = hostEnc.replaceAll("%3A", ":");
  const path = pathIdx === -1 ? "" : did.slice(pathIdx).replaceAll(":", "/");
  const proto = host.startsWith("localhost") && (host.length === 9 || host.charCodeAt(9) === 58) ? "http" : "https";
  return `${proto}://${host}${path}`;
}

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/utils.js
function matchesIdentifier(did, id, candidate) {
  return candidate.charCodeAt(0) === 35 ? candidate.length === id.length + 1 && candidate.endsWith(id) : candidate.length === id.length + 1 + did.length && candidate.charCodeAt(did.length) === 35 && // '#'
  candidate.startsWith(did) && candidate.endsWith(id);
}

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/atproto.js
var atprotoDidSchema = external_exports.string().refine(isAtprotoDid, `Atproto only allows "plc" and "web" DID methods`);
function isAtprotoDid(input) {
  return isDidPlc(input) || isAtprotoDidWeb(input);
}
function asAtprotoDid(input) {
  assertAtprotoDid(input);
  return input;
}
function assertAtprotoDid(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError(typeof input, `DID must be a string`);
  } else if (input.startsWith(DID_PLC_PREFIX)) {
    assertDidPlc(input);
  } else if (input.startsWith(DID_WEB_PREFIX)) {
    assertAtprotoDidWeb(input);
  } else {
    throw new InvalidDidError(input, `Atproto only allows "plc" and "web" DID methods`);
  }
}
function assertAtprotoDidWeb(input) {
  assertDidWeb(input);
  if (isDidWebWithPath(input)) {
    throw new InvalidDidError(input, `Atproto does not allow path components in Web DIDs`);
  }
  if (isDidWebWithHttpsPort(input)) {
    throw new InvalidDidError(input, `Atproto does not allow port numbers in Web DIDs, except for localhost`);
  }
}
function isAtprotoDidWeb(input) {
  if (!isDidWeb(input)) {
    return false;
  }
  if (isDidWebWithPath(input)) {
    return false;
  }
  if (isDidWebWithHttpsPort(input)) {
    return false;
  }
  return true;
}
function isDidWebWithPath(did) {
  return did.includes(":", DID_WEB_PREFIX.length);
}
function isLocalhostDid(did) {
  return did === "did:web:localhost" || did.startsWith("did:web:localhost:") || did.startsWith("did:web:localhost%3A");
}
function isDidWebWithHttpsPort(did) {
  if (isLocalhostDid(did))
    return false;
  const pathIdx = did.indexOf(":", DID_WEB_PREFIX.length);
  const hasPort = pathIdx === -1 ? (
    // No path component, check if there's a port separator anywhere after
    // the "did:web:" prefix
    did.includes("%3A", DID_WEB_PREFIX.length)
  ) : (
    // There is a path component; if there is an encoded colon *before* it,
    // then there is a port number
    did.lastIndexOf("%3A", pathIdx) !== -1
  );
  return hasPort;
}
function extractAtprotoData(document2) {
  return {
    did: document2.id,
    aka: document2.alsoKnownAs?.find(isAtprotoAka)?.slice(5),
    key: document2.verificationMethod?.find(isAtprotoVerificationMethod, document2),
    pds: document2.service?.find(isAtprotoPersonalDataServerService, document2)
  };
}
function extractPdsUrl(document2) {
  const service = document2.service?.find(isAtprotoPersonalDataServerService, document2);
  if (!service) {
    throw new DidError(document2.id, `Document ${document2.id} does not contain a (valid) #atproto_pds service URL`, "did-service-not-found");
  }
  return new URL(service.serviceEndpoint);
}
function isAtprotoAka(value) {
  return value.startsWith("at://");
}
function isAtprotoPersonalDataServerService(service) {
  return service?.type === "AtprotoPersonalDataServer" && typeof service.serviceEndpoint === "string" && canParse(service.serviceEndpoint) && matchesIdentifier(this.id, "atproto_pds", service.id);
}
var ATPROTO_VERIFICATION_METHOD_TYPES = Object.freeze([
  "EcdsaSecp256r1VerificationKey2019",
  "EcdsaSecp256k1VerificationKey2019",
  "Multikey"
]);
function isAtprotoVerificationMethod(method) {
  return typeof method === "object" && typeof method?.publicKeyMultibase === "string" && ATPROTO_VERIFICATION_METHOD_TYPES.includes(method.type) && matchesIdentifier(this.id, "atproto", method.id);
}
function isAtprotoDidRefAbsolute(value) {
  if (!isDidRefAbsolute(value))
    return false;
  return isAtprotoDid(value.slice(0, value.indexOf("#")));
}

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/dist/did-document.js
var rfc3968UriSchema = external_exports.string().url("RFC3968 compliant URI");
var didControllerSchema = external_exports.union([didSchema, external_exports.array(didSchema)]);
var didRelativeUriSchema = external_exports.union([
  rfc3968UriSchema.refine((value) => {
    const fragmentIndex = value.indexOf("#");
    if (fragmentIndex === -1)
      return false;
    return isFragment(value, fragmentIndex + 1);
  }, {
    message: "Missing or invalid fragment in RFC3968 URI"
  }),
  external_exports.string().refine((value) => value.charCodeAt(0) === 35, {
    message: "Fragment must start with #"
  }).refine((value) => isFragment(value, 1), {
    message: "Invalid char in URI fragment"
  })
]);
var didVerificationMethodSchema = external_exports.object({
  id: didRelativeUriSchema,
  type: external_exports.string().min(1),
  controller: didControllerSchema,
  publicKeyJwk: external_exports.record(external_exports.string(), external_exports.unknown()).optional(),
  publicKeyMultibase: external_exports.string().optional()
});
var didServiceIdSchema = didRelativeUriSchema;
var didServiceTypeSchema = external_exports.union([external_exports.string(), external_exports.array(external_exports.string())]);
var didServiceEndpointSchema = external_exports.union([
  rfc3968UriSchema,
  external_exports.record(external_exports.string(), rfc3968UriSchema),
  external_exports.array(external_exports.union([rfc3968UriSchema, external_exports.record(external_exports.string(), rfc3968UriSchema)])).nonempty()
]);
var didServiceSchema = external_exports.object({
  id: didServiceIdSchema,
  type: didServiceTypeSchema,
  serviceEndpoint: didServiceEndpointSchema
});
var verificationMethodReference = external_exports.union([
  //
  didRelativeUriSchema,
  didVerificationMethodSchema
]);
var didDocumentSchema = external_exports.object({
  "@context": external_exports.union([
    external_exports.literal("https://www.w3.org/ns/did/v1"),
    external_exports.array(external_exports.string().url()).nonempty().refine((data) => data[0] === "https://www.w3.org/ns/did/v1", {
      message: "First @context must be https://www.w3.org/ns/did/v1"
    })
  ]).optional(),
  id: didSchema,
  controller: didControllerSchema.optional(),
  alsoKnownAs: external_exports.array(rfc3968UriSchema).optional(),
  service: external_exports.array(didServiceSchema).optional(),
  authentication: external_exports.array(verificationMethodReference).optional(),
  verificationMethod: external_exports.array(didVerificationMethodSchema).optional()
});
var didDocumentValidator = didDocumentSchema.superRefine(({ id: did, service }, ctx) => {
  if (service) {
    const visited = /* @__PURE__ */ new Set();
    for (let i = 0; i < service.length; i++) {
      const current = service[i];
      const serviceId = current.id.startsWith("#") ? `${did}${current.id}` : current.id;
      if (!visited.has(serviceId)) {
        visited.add(serviceId);
      } else {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          message: `Duplicate service id (${current.id}) found in the document`,
          path: ["service", i, "id"]
        });
      }
    }
  }
});

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/dist/util.js
function assert(condition, message2 = "Assertion failed") {
  if (!condition)
    throw new Error(message2);
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/dist/cached-getter.js
var returnTrue = () => true;
var returnFalse = () => false;
var CachedGetter = class {
  #pending = /* @__PURE__ */ new Map();
  #getter;
  #store;
  #options = {};
  constructor(getter, store, options = {}) {
    this.#getter = getter;
    this.#store = store;
    this.#options = options;
  }
  async get(key, { signal, context, allowStale = false, noCache = false } = {}) {
    signal?.throwIfAborted();
    const { isStale, deleteOnError } = this.#options;
    const allowStored = noCache ? returnFalse : allowStale || isStale == null ? returnTrue : async (value2) => !await isStale(key, value2);
    let previousExecutionFlow;
    while (previousExecutionFlow = this.#pending.get(key)) {
      try {
        const { isFresh, value: value2 } = await previousExecutionFlow;
        if (isFresh)
          return value2;
        if (await allowStored(value2))
          return value2;
      } catch {
      }
      signal?.throwIfAborted();
    }
    const currentExecutionFlow = Promise.resolve().then(async () => {
      signal?.throwIfAborted();
      const storedValue = await this.getStored(key, { signal });
      if (storedValue !== void 0 && await allowStored(storedValue)) {
        return { isFresh: false, value: storedValue };
      }
      signal?.throwIfAborted();
      return Promise.resolve().then(async () => {
        const options = { signal, noCache, context };
        return this.#getter.call(null, key, options, storedValue);
      }).catch(async (err) => {
        if (storedValue !== void 0) {
          try {
            if (await deleteOnError?.(err, key, storedValue)) {
              await this.delStored(key, err);
            }
          } catch (error) {
            throw new AggregateError([err, error], "Error while deleting stored value");
          }
        }
        throw err;
      }).then(async (value2) => {
        await this.setStored(key, value2);
        return { isFresh: true, value: value2 };
      });
    }).finally(() => {
      assert(this.#pending.get(key) === currentExecutionFlow, `Pending item for key "${key}" was replaced before it finished.`);
      this.#pending.delete(key);
    });
    assert(!this.#pending.has(key), `Concurrent execution flow for key "${key}" should not exist.`);
    this.#pending.set(key, currentExecutionFlow);
    const { value } = await currentExecutionFlow;
    return value;
  }
  // @NOTE We propagate errors from the store. If the use-case prefers to ignore
  // errors from the store, it should be handled in the store implementation
  // (eg. by returning `undefined` instead of throwing).
  // @NOTE We define the store methods here to allow for overriding them in
  // subclasses.
  async getStored(key, options) {
    return this.#store.get(key, options);
  }
  async setStored(key, value) {
    await this.#store.set(key, value);
  }
  async delStored(key, _cause) {
    await this.#store.del(key);
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/dist/swallow-store-errors.js
var logStoreError = (err, operation) => {
  console.error(`SimpleStore error during "${operation}"`, err);
};
function swallowStoreErrors(store, onError = logStoreError) {
  return {
    async get(key, options) {
      options?.signal?.throwIfAborted();
      try {
        return await store.get(key, options);
      } catch (err) {
        if (options?.signal?.aborted)
          throw err;
        onError(err, "get", key);
        return void 0;
      }
    },
    async set(key, value) {
      try {
        await store.set(key, value);
      } catch (err) {
        onError(err, "set", key);
      }
    },
    async del(key) {
      try {
        await store.del(key);
      } catch (err) {
        onError(err, "del", key);
      }
    },
    async clear() {
      try {
        await store.clear?.();
      } catch (err) {
        onError(err, "clear");
      }
    }
  };
}

// node_modules/lru-cache/dist/esm/index.js
var perf = typeof performance === "object" && performance && typeof performance.now === "function" ? performance : Date;
var warned = /* @__PURE__ */ new Set();
var PROCESS = typeof process === "object" && !!process ? process : {};
var emitWarning = (msg, type, code, fn) => {
  typeof PROCESS.emitWarning === "function" ? PROCESS.emitWarning(msg, type, code, fn) : console.error(`[${code}] ${type}: ${msg}`);
};
var AC = globalThis.AbortController;
var AS = globalThis.AbortSignal;
if (typeof AC === "undefined") {
  AS = class AbortSignal {
    onabort;
    _onabort = [];
    reason;
    aborted = false;
    addEventListener(_, fn) {
      this._onabort.push(fn);
    }
  };
  AC = class AbortController {
    constructor() {
      warnACPolyfill();
    }
    signal = new AS();
    abort(reason) {
      if (this.signal.aborted)
        return;
      this.signal.reason = reason;
      this.signal.aborted = true;
      for (const fn of this.signal._onabort) {
        fn(reason);
      }
      this.signal.onabort?.(reason);
    }
  };
  let printACPolyfillWarning = PROCESS.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1";
  const warnACPolyfill = () => {
    if (!printACPolyfillWarning)
      return;
    printACPolyfillWarning = false;
    emitWarning("AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.", "NO_ABORT_CONTROLLER", "ENOTSUP", warnACPolyfill);
  };
}
var shouldWarn = (code) => !warned.has(code);
var isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
var getUintArray = (max) => !isPosInt(max) ? null : max <= Math.pow(2, 8) ? Uint8Array : max <= Math.pow(2, 16) ? Uint16Array : max <= Math.pow(2, 32) ? Uint32Array : max <= Number.MAX_SAFE_INTEGER ? ZeroArray : null;
var ZeroArray = class extends Array {
  constructor(size) {
    super(size);
    this.fill(0);
  }
};
var Stack = class _Stack {
  heap;
  length;
  // private constructor
  static #constructing = false;
  static create(max) {
    const HeapCls = getUintArray(max);
    if (!HeapCls)
      return [];
    _Stack.#constructing = true;
    const s = new _Stack(max, HeapCls);
    _Stack.#constructing = false;
    return s;
  }
  constructor(max, HeapCls) {
    if (!_Stack.#constructing) {
      throw new TypeError("instantiate Stack using Stack.create(n)");
    }
    this.heap = new HeapCls(max);
    this.length = 0;
  }
  push(n) {
    this.heap[this.length++] = n;
  }
  pop() {
    return this.heap[--this.length];
  }
};
var LRUCache = class _LRUCache {
  // options that cannot be changed without disaster
  #max;
  #maxSize;
  #dispose;
  #disposeAfter;
  #fetchMethod;
  #memoMethod;
  /**
   * {@link LRUCache.OptionsBase.ttl}
   */
  ttl;
  /**
   * {@link LRUCache.OptionsBase.ttlResolution}
   */
  ttlResolution;
  /**
   * {@link LRUCache.OptionsBase.ttlAutopurge}
   */
  ttlAutopurge;
  /**
   * {@link LRUCache.OptionsBase.updateAgeOnGet}
   */
  updateAgeOnGet;
  /**
   * {@link LRUCache.OptionsBase.updateAgeOnHas}
   */
  updateAgeOnHas;
  /**
   * {@link LRUCache.OptionsBase.allowStale}
   */
  allowStale;
  /**
   * {@link LRUCache.OptionsBase.noDisposeOnSet}
   */
  noDisposeOnSet;
  /**
   * {@link LRUCache.OptionsBase.noUpdateTTL}
   */
  noUpdateTTL;
  /**
   * {@link LRUCache.OptionsBase.maxEntrySize}
   */
  maxEntrySize;
  /**
   * {@link LRUCache.OptionsBase.sizeCalculation}
   */
  sizeCalculation;
  /**
   * {@link LRUCache.OptionsBase.noDeleteOnFetchRejection}
   */
  noDeleteOnFetchRejection;
  /**
   * {@link LRUCache.OptionsBase.noDeleteOnStaleGet}
   */
  noDeleteOnStaleGet;
  /**
   * {@link LRUCache.OptionsBase.allowStaleOnFetchAbort}
   */
  allowStaleOnFetchAbort;
  /**
   * {@link LRUCache.OptionsBase.allowStaleOnFetchRejection}
   */
  allowStaleOnFetchRejection;
  /**
   * {@link LRUCache.OptionsBase.ignoreFetchAbort}
   */
  ignoreFetchAbort;
  // computed properties
  #size;
  #calculatedSize;
  #keyMap;
  #keyList;
  #valList;
  #next;
  #prev;
  #head;
  #tail;
  #free;
  #disposed;
  #sizes;
  #starts;
  #ttls;
  #hasDispose;
  #hasFetchMethod;
  #hasDisposeAfter;
  /**
   * Do not call this method unless you need to inspect the
   * inner workings of the cache.  If anything returned by this
   * object is modified in any way, strange breakage may occur.
   *
   * These fields are private for a reason!
   *
   * @internal
   */
  static unsafeExposeInternals(c) {
    return {
      // properties
      starts: c.#starts,
      ttls: c.#ttls,
      sizes: c.#sizes,
      keyMap: c.#keyMap,
      keyList: c.#keyList,
      valList: c.#valList,
      next: c.#next,
      prev: c.#prev,
      get head() {
        return c.#head;
      },
      get tail() {
        return c.#tail;
      },
      free: c.#free,
      // methods
      isBackgroundFetch: (p) => c.#isBackgroundFetch(p),
      backgroundFetch: (k, index, options, context) => c.#backgroundFetch(k, index, options, context),
      moveToTail: (index) => c.#moveToTail(index),
      indexes: (options) => c.#indexes(options),
      rindexes: (options) => c.#rindexes(options),
      isStale: (index) => c.#isStale(index)
    };
  }
  // Protected read-only members
  /**
   * {@link LRUCache.OptionsBase.max} (read-only)
   */
  get max() {
    return this.#max;
  }
  /**
   * {@link LRUCache.OptionsBase.maxSize} (read-only)
   */
  get maxSize() {
    return this.#maxSize;
  }
  /**
   * The total computed size of items in the cache (read-only)
   */
  get calculatedSize() {
    return this.#calculatedSize;
  }
  /**
   * The number of items stored in the cache (read-only)
   */
  get size() {
    return this.#size;
  }
  /**
   * {@link LRUCache.OptionsBase.fetchMethod} (read-only)
   */
  get fetchMethod() {
    return this.#fetchMethod;
  }
  get memoMethod() {
    return this.#memoMethod;
  }
  /**
   * {@link LRUCache.OptionsBase.dispose} (read-only)
   */
  get dispose() {
    return this.#dispose;
  }
  /**
   * {@link LRUCache.OptionsBase.disposeAfter} (read-only)
   */
  get disposeAfter() {
    return this.#disposeAfter;
  }
  constructor(options) {
    const { max = 0, ttl, ttlResolution = 1, ttlAutopurge, updateAgeOnGet, updateAgeOnHas, allowStale, dispose, disposeAfter, noDisposeOnSet, noUpdateTTL, maxSize = 0, maxEntrySize = 0, sizeCalculation, fetchMethod, memoMethod, noDeleteOnFetchRejection, noDeleteOnStaleGet, allowStaleOnFetchRejection, allowStaleOnFetchAbort, ignoreFetchAbort } = options;
    if (max !== 0 && !isPosInt(max)) {
      throw new TypeError("max option must be a nonnegative integer");
    }
    const UintArray = max ? getUintArray(max) : Array;
    if (!UintArray) {
      throw new Error("invalid max value: " + max);
    }
    this.#max = max;
    this.#maxSize = maxSize;
    this.maxEntrySize = maxEntrySize || this.#maxSize;
    this.sizeCalculation = sizeCalculation;
    if (this.sizeCalculation) {
      if (!this.#maxSize && !this.maxEntrySize) {
        throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
      }
      if (typeof this.sizeCalculation !== "function") {
        throw new TypeError("sizeCalculation set to non-function");
      }
    }
    if (memoMethod !== void 0 && typeof memoMethod !== "function") {
      throw new TypeError("memoMethod must be a function if defined");
    }
    this.#memoMethod = memoMethod;
    if (fetchMethod !== void 0 && typeof fetchMethod !== "function") {
      throw new TypeError("fetchMethod must be a function if specified");
    }
    this.#fetchMethod = fetchMethod;
    this.#hasFetchMethod = !!fetchMethod;
    this.#keyMap = /* @__PURE__ */ new Map();
    this.#keyList = new Array(max).fill(void 0);
    this.#valList = new Array(max).fill(void 0);
    this.#next = new UintArray(max);
    this.#prev = new UintArray(max);
    this.#head = 0;
    this.#tail = 0;
    this.#free = Stack.create(max);
    this.#size = 0;
    this.#calculatedSize = 0;
    if (typeof dispose === "function") {
      this.#dispose = dispose;
    }
    if (typeof disposeAfter === "function") {
      this.#disposeAfter = disposeAfter;
      this.#disposed = [];
    } else {
      this.#disposeAfter = void 0;
      this.#disposed = void 0;
    }
    this.#hasDispose = !!this.#dispose;
    this.#hasDisposeAfter = !!this.#disposeAfter;
    this.noDisposeOnSet = !!noDisposeOnSet;
    this.noUpdateTTL = !!noUpdateTTL;
    this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
    this.allowStaleOnFetchRejection = !!allowStaleOnFetchRejection;
    this.allowStaleOnFetchAbort = !!allowStaleOnFetchAbort;
    this.ignoreFetchAbort = !!ignoreFetchAbort;
    if (this.maxEntrySize !== 0) {
      if (this.#maxSize !== 0) {
        if (!isPosInt(this.#maxSize)) {
          throw new TypeError("maxSize must be a positive integer if specified");
        }
      }
      if (!isPosInt(this.maxEntrySize)) {
        throw new TypeError("maxEntrySize must be a positive integer if specified");
      }
      this.#initializeSizeTracking();
    }
    this.allowStale = !!allowStale;
    this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
    this.updateAgeOnGet = !!updateAgeOnGet;
    this.updateAgeOnHas = !!updateAgeOnHas;
    this.ttlResolution = isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
    this.ttlAutopurge = !!ttlAutopurge;
    this.ttl = ttl || 0;
    if (this.ttl) {
      if (!isPosInt(this.ttl)) {
        throw new TypeError("ttl must be a positive integer if specified");
      }
      this.#initializeTTLTracking();
    }
    if (this.#max === 0 && this.ttl === 0 && this.#maxSize === 0) {
      throw new TypeError("At least one of max, maxSize, or ttl is required");
    }
    if (!this.ttlAutopurge && !this.#max && !this.#maxSize) {
      const code = "LRU_CACHE_UNBOUNDED";
      if (shouldWarn(code)) {
        warned.add(code);
        const msg = "TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.";
        emitWarning(msg, "UnboundedCacheWarning", code, _LRUCache);
      }
    }
  }
  /**
   * Return the number of ms left in the item's TTL. If item is not in cache,
   * returns `0`. Returns `Infinity` if item is in cache without a defined TTL.
   */
  getRemainingTTL(key) {
    return this.#keyMap.has(key) ? Infinity : 0;
  }
  #initializeTTLTracking() {
    const ttls = new ZeroArray(this.#max);
    const starts = new ZeroArray(this.#max);
    this.#ttls = ttls;
    this.#starts = starts;
    this.#setItemTTL = (index, ttl, start = perf.now()) => {
      starts[index] = ttl !== 0 ? start : 0;
      ttls[index] = ttl;
      if (ttl !== 0 && this.ttlAutopurge) {
        const t = setTimeout(() => {
          if (this.#isStale(index)) {
            this.#delete(this.#keyList[index], "expire");
          }
        }, ttl + 1);
        if (t.unref) {
          t.unref();
        }
      }
    };
    this.#updateItemAge = (index) => {
      starts[index] = ttls[index] !== 0 ? perf.now() : 0;
    };
    this.#statusTTL = (status, index) => {
      if (ttls[index]) {
        const ttl = ttls[index];
        const start = starts[index];
        if (!ttl || !start)
          return;
        status.ttl = ttl;
        status.start = start;
        status.now = cachedNow || getNow();
        const age = status.now - start;
        status.remainingTTL = ttl - age;
      }
    };
    let cachedNow = 0;
    const getNow = () => {
      const n = perf.now();
      if (this.ttlResolution > 0) {
        cachedNow = n;
        const t = setTimeout(() => cachedNow = 0, this.ttlResolution);
        if (t.unref) {
          t.unref();
        }
      }
      return n;
    };
    this.getRemainingTTL = (key) => {
      const index = this.#keyMap.get(key);
      if (index === void 0) {
        return 0;
      }
      const ttl = ttls[index];
      const start = starts[index];
      if (!ttl || !start) {
        return Infinity;
      }
      const age = (cachedNow || getNow()) - start;
      return ttl - age;
    };
    this.#isStale = (index) => {
      const s = starts[index];
      const t = ttls[index];
      return !!t && !!s && (cachedNow || getNow()) - s > t;
    };
  }
  // conditionally set private methods related to TTL
  #updateItemAge = () => {
  };
  #statusTTL = () => {
  };
  #setItemTTL = () => {
  };
  /* c8 ignore stop */
  #isStale = () => false;
  #initializeSizeTracking() {
    const sizes = new ZeroArray(this.#max);
    this.#calculatedSize = 0;
    this.#sizes = sizes;
    this.#removeItemSize = (index) => {
      this.#calculatedSize -= sizes[index];
      sizes[index] = 0;
    };
    this.#requireSize = (k, v, size, sizeCalculation) => {
      if (this.#isBackgroundFetch(v)) {
        return 0;
      }
      if (!isPosInt(size)) {
        if (sizeCalculation) {
          if (typeof sizeCalculation !== "function") {
            throw new TypeError("sizeCalculation must be a function");
          }
          size = sizeCalculation(v, k);
          if (!isPosInt(size)) {
            throw new TypeError("sizeCalculation return invalid (expect positive integer)");
          }
        } else {
          throw new TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.");
        }
      }
      return size;
    };
    this.#addItemSize = (index, size, status) => {
      sizes[index] = size;
      if (this.#maxSize) {
        const maxSize = this.#maxSize - sizes[index];
        while (this.#calculatedSize > maxSize) {
          this.#evict(true);
        }
      }
      this.#calculatedSize += sizes[index];
      if (status) {
        status.entrySize = size;
        status.totalCalculatedSize = this.#calculatedSize;
      }
    };
  }
  #removeItemSize = (_i) => {
  };
  #addItemSize = (_i, _s, _st) => {
  };
  #requireSize = (_k, _v, size, sizeCalculation) => {
    if (size || sizeCalculation) {
      throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
    }
    return 0;
  };
  *#indexes({ allowStale = this.allowStale } = {}) {
    if (this.#size) {
      for (let i = this.#tail; true; ) {
        if (!this.#isValidIndex(i)) {
          break;
        }
        if (allowStale || !this.#isStale(i)) {
          yield i;
        }
        if (i === this.#head) {
          break;
        } else {
          i = this.#prev[i];
        }
      }
    }
  }
  *#rindexes({ allowStale = this.allowStale } = {}) {
    if (this.#size) {
      for (let i = this.#head; true; ) {
        if (!this.#isValidIndex(i)) {
          break;
        }
        if (allowStale || !this.#isStale(i)) {
          yield i;
        }
        if (i === this.#tail) {
          break;
        } else {
          i = this.#next[i];
        }
      }
    }
  }
  #isValidIndex(index) {
    return index !== void 0 && this.#keyMap.get(this.#keyList[index]) === index;
  }
  /**
   * Return a generator yielding `[key, value]` pairs,
   * in order from most recently used to least recently used.
   */
  *entries() {
    for (const i of this.#indexes()) {
      if (this.#valList[i] !== void 0 && this.#keyList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) {
        yield [this.#keyList[i], this.#valList[i]];
      }
    }
  }
  /**
   * Inverse order version of {@link LRUCache.entries}
   *
   * Return a generator yielding `[key, value]` pairs,
   * in order from least recently used to most recently used.
   */
  *rentries() {
    for (const i of this.#rindexes()) {
      if (this.#valList[i] !== void 0 && this.#keyList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) {
        yield [this.#keyList[i], this.#valList[i]];
      }
    }
  }
  /**
   * Return a generator yielding the keys in the cache,
   * in order from most recently used to least recently used.
   */
  *keys() {
    for (const i of this.#indexes()) {
      const k = this.#keyList[i];
      if (k !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) {
        yield k;
      }
    }
  }
  /**
   * Inverse order version of {@link LRUCache.keys}
   *
   * Return a generator yielding the keys in the cache,
   * in order from least recently used to most recently used.
   */
  *rkeys() {
    for (const i of this.#rindexes()) {
      const k = this.#keyList[i];
      if (k !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) {
        yield k;
      }
    }
  }
  /**
   * Return a generator yielding the values in the cache,
   * in order from most recently used to least recently used.
   */
  *values() {
    for (const i of this.#indexes()) {
      const v = this.#valList[i];
      if (v !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) {
        yield this.#valList[i];
      }
    }
  }
  /**
   * Inverse order version of {@link LRUCache.values}
   *
   * Return a generator yielding the values in the cache,
   * in order from least recently used to most recently used.
   */
  *rvalues() {
    for (const i of this.#rindexes()) {
      const v = this.#valList[i];
      if (v !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) {
        yield this.#valList[i];
      }
    }
  }
  /**
   * Iterating over the cache itself yields the same results as
   * {@link LRUCache.entries}
   */
  [Symbol.iterator]() {
    return this.entries();
  }
  /**
   * A String value that is used in the creation of the default string
   * description of an object. Called by the built-in method
   * `Object.prototype.toString`.
   */
  [Symbol.toStringTag] = "LRUCache";
  /**
   * Find a value for which the supplied fn method returns a truthy value,
   * similar to `Array.find()`. fn is called as `fn(value, key, cache)`.
   */
  find(fn, getOptions = {}) {
    for (const i of this.#indexes()) {
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === void 0)
        continue;
      if (fn(value, this.#keyList[i], this)) {
        return this.get(this.#keyList[i], getOptions);
      }
    }
  }
  /**
   * Call the supplied function on each item in the cache, in order from most
   * recently used to least recently used.
   *
   * `fn` is called as `fn(value, key, cache)`.
   *
   * If `thisp` is provided, function will be called in the `this`-context of
   * the provided object, or the cache if no `thisp` object is provided.
   *
   * Does not update age or recenty of use, or iterate over stale values.
   */
  forEach(fn, thisp = this) {
    for (const i of this.#indexes()) {
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === void 0)
        continue;
      fn.call(thisp, value, this.#keyList[i], this);
    }
  }
  /**
   * The same as {@link LRUCache.forEach} but items are iterated over in
   * reverse order.  (ie, less recently used items are iterated over first.)
   */
  rforEach(fn, thisp = this) {
    for (const i of this.#rindexes()) {
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === void 0)
        continue;
      fn.call(thisp, value, this.#keyList[i], this);
    }
  }
  /**
   * Delete any stale entries. Returns true if anything was removed,
   * false otherwise.
   */
  purgeStale() {
    let deleted = false;
    for (const i of this.#rindexes({ allowStale: true })) {
      if (this.#isStale(i)) {
        this.#delete(this.#keyList[i], "expire");
        deleted = true;
      }
    }
    return deleted;
  }
  /**
   * Get the extended info about a given entry, to get its value, size, and
   * TTL info simultaneously. Returns `undefined` if the key is not present.
   *
   * Unlike {@link LRUCache#dump}, which is designed to be portable and survive
   * serialization, the `start` value is always the current timestamp, and the
   * `ttl` is a calculated remaining time to live (negative if expired).
   *
   * Always returns stale values, if their info is found in the cache, so be
   * sure to check for expirations (ie, a negative {@link LRUCache.Entry#ttl})
   * if relevant.
   */
  info(key) {
    const i = this.#keyMap.get(key);
    if (i === void 0)
      return void 0;
    const v = this.#valList[i];
    const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
    if (value === void 0)
      return void 0;
    const entry = { value };
    if (this.#ttls && this.#starts) {
      const ttl = this.#ttls[i];
      const start = this.#starts[i];
      if (ttl && start) {
        const remain = ttl - (perf.now() - start);
        entry.ttl = remain;
        entry.start = Date.now();
      }
    }
    if (this.#sizes) {
      entry.size = this.#sizes[i];
    }
    return entry;
  }
  /**
   * Return an array of [key, {@link LRUCache.Entry}] tuples which can be
   * passed to {@link LRLUCache#load}.
   *
   * The `start` fields are calculated relative to a portable `Date.now()`
   * timestamp, even if `performance.now()` is available.
   *
   * Stale entries are always included in the `dump`, even if
   * {@link LRUCache.OptionsBase.allowStale} is false.
   *
   * Note: this returns an actual array, not a generator, so it can be more
   * easily passed around.
   */
  dump() {
    const arr = [];
    for (const i of this.#indexes({ allowStale: true })) {
      const key = this.#keyList[i];
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === void 0 || key === void 0)
        continue;
      const entry = { value };
      if (this.#ttls && this.#starts) {
        entry.ttl = this.#ttls[i];
        const age = perf.now() - this.#starts[i];
        entry.start = Math.floor(Date.now() - age);
      }
      if (this.#sizes) {
        entry.size = this.#sizes[i];
      }
      arr.unshift([key, entry]);
    }
    return arr;
  }
  /**
   * Reset the cache and load in the items in entries in the order listed.
   *
   * The shape of the resulting cache may be different if the same options are
   * not used in both caches.
   *
   * The `start` fields are assumed to be calculated relative to a portable
   * `Date.now()` timestamp, even if `performance.now()` is available.
   */
  load(arr) {
    this.clear();
    for (const [key, entry] of arr) {
      if (entry.start) {
        const age = Date.now() - entry.start;
        entry.start = perf.now() - age;
      }
      this.set(key, entry.value, entry);
    }
  }
  /**
   * Add a value to the cache.
   *
   * Note: if `undefined` is specified as a value, this is an alias for
   * {@link LRUCache#delete}
   *
   * Fields on the {@link LRUCache.SetOptions} options param will override
   * their corresponding values in the constructor options for the scope
   * of this single `set()` operation.
   *
   * If `start` is provided, then that will set the effective start
   * time for the TTL calculation. Note that this must be a previous
   * value of `performance.now()` if supported, or a previous value of
   * `Date.now()` if not.
   *
   * Options object may also include `size`, which will prevent
   * calling the `sizeCalculation` function and just use the specified
   * number if it is a positive integer, and `noDisposeOnSet` which
   * will prevent calling a `dispose` function in the case of
   * overwrites.
   *
   * If the `size` (or return value of `sizeCalculation`) for a given
   * entry is greater than `maxEntrySize`, then the item will not be
   * added to the cache.
   *
   * Will update the recency of the entry.
   *
   * If the value is `undefined`, then this is an alias for
   * `cache.delete(key)`. `undefined` is never stored in the cache.
   */
  set(k, v, setOptions = {}) {
    if (v === void 0) {
      this.delete(k);
      return this;
    }
    const { ttl = this.ttl, start, noDisposeOnSet = this.noDisposeOnSet, sizeCalculation = this.sizeCalculation, status } = setOptions;
    let { noUpdateTTL = this.noUpdateTTL } = setOptions;
    const size = this.#requireSize(k, v, setOptions.size || 0, sizeCalculation);
    if (this.maxEntrySize && size > this.maxEntrySize) {
      if (status) {
        status.set = "miss";
        status.maxEntrySizeExceeded = true;
      }
      this.#delete(k, "set");
      return this;
    }
    let index = this.#size === 0 ? void 0 : this.#keyMap.get(k);
    if (index === void 0) {
      index = this.#size === 0 ? this.#tail : this.#free.length !== 0 ? this.#free.pop() : this.#size === this.#max ? this.#evict(false) : this.#size;
      this.#keyList[index] = k;
      this.#valList[index] = v;
      this.#keyMap.set(k, index);
      this.#next[this.#tail] = index;
      this.#prev[index] = this.#tail;
      this.#tail = index;
      this.#size++;
      this.#addItemSize(index, size, status);
      if (status)
        status.set = "add";
      noUpdateTTL = false;
    } else {
      this.#moveToTail(index);
      const oldVal = this.#valList[index];
      if (v !== oldVal) {
        if (this.#hasFetchMethod && this.#isBackgroundFetch(oldVal)) {
          oldVal.__abortController.abort(new Error("replaced"));
          const { __staleWhileFetching: s } = oldVal;
          if (s !== void 0 && !noDisposeOnSet) {
            if (this.#hasDispose) {
              this.#dispose?.(s, k, "set");
            }
            if (this.#hasDisposeAfter) {
              this.#disposed?.push([s, k, "set"]);
            }
          }
        } else if (!noDisposeOnSet) {
          if (this.#hasDispose) {
            this.#dispose?.(oldVal, k, "set");
          }
          if (this.#hasDisposeAfter) {
            this.#disposed?.push([oldVal, k, "set"]);
          }
        }
        this.#removeItemSize(index);
        this.#addItemSize(index, size, status);
        this.#valList[index] = v;
        if (status) {
          status.set = "replace";
          const oldValue = oldVal && this.#isBackgroundFetch(oldVal) ? oldVal.__staleWhileFetching : oldVal;
          if (oldValue !== void 0)
            status.oldValue = oldValue;
        }
      } else if (status) {
        status.set = "update";
      }
    }
    if (ttl !== 0 && !this.#ttls) {
      this.#initializeTTLTracking();
    }
    if (this.#ttls) {
      if (!noUpdateTTL) {
        this.#setItemTTL(index, ttl, start);
      }
      if (status)
        this.#statusTTL(status, index);
    }
    if (!noDisposeOnSet && this.#hasDisposeAfter && this.#disposed) {
      const dt = this.#disposed;
      let task;
      while (task = dt?.shift()) {
        this.#disposeAfter?.(...task);
      }
    }
    return this;
  }
  /**
   * Evict the least recently used item, returning its value or
   * `undefined` if cache is empty.
   */
  pop() {
    try {
      while (this.#size) {
        const val = this.#valList[this.#head];
        this.#evict(true);
        if (this.#isBackgroundFetch(val)) {
          if (val.__staleWhileFetching) {
            return val.__staleWhileFetching;
          }
        } else if (val !== void 0) {
          return val;
        }
      }
    } finally {
      if (this.#hasDisposeAfter && this.#disposed) {
        const dt = this.#disposed;
        let task;
        while (task = dt?.shift()) {
          this.#disposeAfter?.(...task);
        }
      }
    }
  }
  #evict(free) {
    const head = this.#head;
    const k = this.#keyList[head];
    const v = this.#valList[head];
    if (this.#hasFetchMethod && this.#isBackgroundFetch(v)) {
      v.__abortController.abort(new Error("evicted"));
    } else if (this.#hasDispose || this.#hasDisposeAfter) {
      if (this.#hasDispose) {
        this.#dispose?.(v, k, "evict");
      }
      if (this.#hasDisposeAfter) {
        this.#disposed?.push([v, k, "evict"]);
      }
    }
    this.#removeItemSize(head);
    if (free) {
      this.#keyList[head] = void 0;
      this.#valList[head] = void 0;
      this.#free.push(head);
    }
    if (this.#size === 1) {
      this.#head = this.#tail = 0;
      this.#free.length = 0;
    } else {
      this.#head = this.#next[head];
    }
    this.#keyMap.delete(k);
    this.#size--;
    return head;
  }
  /**
   * Check if a key is in the cache, without updating the recency of use.
   * Will return false if the item is stale, even though it is technically
   * in the cache.
   *
   * Check if a key is in the cache, without updating the recency of
   * use. Age is updated if {@link LRUCache.OptionsBase.updateAgeOnHas} is set
   * to `true` in either the options or the constructor.
   *
   * Will return `false` if the item is stale, even though it is technically in
   * the cache. The difference can be determined (if it matters) by using a
   * `status` argument, and inspecting the `has` field.
   *
   * Will not update item age unless
   * {@link LRUCache.OptionsBase.updateAgeOnHas} is set.
   */
  has(k, hasOptions = {}) {
    const { updateAgeOnHas = this.updateAgeOnHas, status } = hasOptions;
    const index = this.#keyMap.get(k);
    if (index !== void 0) {
      const v = this.#valList[index];
      if (this.#isBackgroundFetch(v) && v.__staleWhileFetching === void 0) {
        return false;
      }
      if (!this.#isStale(index)) {
        if (updateAgeOnHas) {
          this.#updateItemAge(index);
        }
        if (status) {
          status.has = "hit";
          this.#statusTTL(status, index);
        }
        return true;
      } else if (status) {
        status.has = "stale";
        this.#statusTTL(status, index);
      }
    } else if (status) {
      status.has = "miss";
    }
    return false;
  }
  /**
   * Like {@link LRUCache#get} but doesn't update recency or delete stale
   * items.
   *
   * Returns `undefined` if the item is stale, unless
   * {@link LRUCache.OptionsBase.allowStale} is set.
   */
  peek(k, peekOptions = {}) {
    const { allowStale = this.allowStale } = peekOptions;
    const index = this.#keyMap.get(k);
    if (index === void 0 || !allowStale && this.#isStale(index)) {
      return;
    }
    const v = this.#valList[index];
    return this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
  }
  #backgroundFetch(k, index, options, context) {
    const v = index === void 0 ? void 0 : this.#valList[index];
    if (this.#isBackgroundFetch(v)) {
      return v;
    }
    const ac = new AC();
    const { signal } = options;
    signal?.addEventListener("abort", () => ac.abort(signal.reason), {
      signal: ac.signal
    });
    const fetchOpts = {
      signal: ac.signal,
      options,
      context
    };
    const cb = (v2, updateCache = false) => {
      const { aborted } = ac.signal;
      const ignoreAbort = options.ignoreFetchAbort && v2 !== void 0;
      if (options.status) {
        if (aborted && !updateCache) {
          options.status.fetchAborted = true;
          options.status.fetchError = ac.signal.reason;
          if (ignoreAbort)
            options.status.fetchAbortIgnored = true;
        } else {
          options.status.fetchResolved = true;
        }
      }
      if (aborted && !ignoreAbort && !updateCache) {
        return fetchFail(ac.signal.reason);
      }
      const bf2 = p;
      if (this.#valList[index] === p) {
        if (v2 === void 0) {
          if (bf2.__staleWhileFetching) {
            this.#valList[index] = bf2.__staleWhileFetching;
          } else {
            this.#delete(k, "fetch");
          }
        } else {
          if (options.status)
            options.status.fetchUpdated = true;
          this.set(k, v2, fetchOpts.options);
        }
      }
      return v2;
    };
    const eb = (er) => {
      if (options.status) {
        options.status.fetchRejected = true;
        options.status.fetchError = er;
      }
      return fetchFail(er);
    };
    const fetchFail = (er) => {
      const { aborted } = ac.signal;
      const allowStaleAborted = aborted && options.allowStaleOnFetchAbort;
      const allowStale = allowStaleAborted || options.allowStaleOnFetchRejection;
      const noDelete = allowStale || options.noDeleteOnFetchRejection;
      const bf2 = p;
      if (this.#valList[index] === p) {
        const del = !noDelete || bf2.__staleWhileFetching === void 0;
        if (del) {
          this.#delete(k, "fetch");
        } else if (!allowStaleAborted) {
          this.#valList[index] = bf2.__staleWhileFetching;
        }
      }
      if (allowStale) {
        if (options.status && bf2.__staleWhileFetching !== void 0) {
          options.status.returnedStale = true;
        }
        return bf2.__staleWhileFetching;
      } else if (bf2.__returned === bf2) {
        throw er;
      }
    };
    const pcall = (res, rej) => {
      const fmp = this.#fetchMethod?.(k, v, fetchOpts);
      if (fmp && fmp instanceof Promise) {
        fmp.then((v2) => res(v2 === void 0 ? void 0 : v2), rej);
      }
      ac.signal.addEventListener("abort", () => {
        if (!options.ignoreFetchAbort || options.allowStaleOnFetchAbort) {
          res(void 0);
          if (options.allowStaleOnFetchAbort) {
            res = (v2) => cb(v2, true);
          }
        }
      });
    };
    if (options.status)
      options.status.fetchDispatched = true;
    const p = new Promise(pcall).then(cb, eb);
    const bf = Object.assign(p, {
      __abortController: ac,
      __staleWhileFetching: v,
      __returned: void 0
    });
    if (index === void 0) {
      this.set(k, bf, { ...fetchOpts.options, status: void 0 });
      index = this.#keyMap.get(k);
    } else {
      this.#valList[index] = bf;
    }
    return bf;
  }
  #isBackgroundFetch(p) {
    if (!this.#hasFetchMethod)
      return false;
    const b = p;
    return !!b && b instanceof Promise && b.hasOwnProperty("__staleWhileFetching") && b.__abortController instanceof AC;
  }
  async fetch(k, fetchOptions = {}) {
    const {
      // get options
      allowStale = this.allowStale,
      updateAgeOnGet = this.updateAgeOnGet,
      noDeleteOnStaleGet = this.noDeleteOnStaleGet,
      // set options
      ttl = this.ttl,
      noDisposeOnSet = this.noDisposeOnSet,
      size = 0,
      sizeCalculation = this.sizeCalculation,
      noUpdateTTL = this.noUpdateTTL,
      // fetch exclusive options
      noDeleteOnFetchRejection = this.noDeleteOnFetchRejection,
      allowStaleOnFetchRejection = this.allowStaleOnFetchRejection,
      ignoreFetchAbort = this.ignoreFetchAbort,
      allowStaleOnFetchAbort = this.allowStaleOnFetchAbort,
      context,
      forceRefresh = false,
      status,
      signal
    } = fetchOptions;
    if (!this.#hasFetchMethod) {
      if (status)
        status.fetch = "get";
      return this.get(k, {
        allowStale,
        updateAgeOnGet,
        noDeleteOnStaleGet,
        status
      });
    }
    const options = {
      allowStale,
      updateAgeOnGet,
      noDeleteOnStaleGet,
      ttl,
      noDisposeOnSet,
      size,
      sizeCalculation,
      noUpdateTTL,
      noDeleteOnFetchRejection,
      allowStaleOnFetchRejection,
      allowStaleOnFetchAbort,
      ignoreFetchAbort,
      status,
      signal
    };
    let index = this.#keyMap.get(k);
    if (index === void 0) {
      if (status)
        status.fetch = "miss";
      const p = this.#backgroundFetch(k, index, options, context);
      return p.__returned = p;
    } else {
      const v = this.#valList[index];
      if (this.#isBackgroundFetch(v)) {
        const stale = allowStale && v.__staleWhileFetching !== void 0;
        if (status) {
          status.fetch = "inflight";
          if (stale)
            status.returnedStale = true;
        }
        return stale ? v.__staleWhileFetching : v.__returned = v;
      }
      const isStale = this.#isStale(index);
      if (!forceRefresh && !isStale) {
        if (status)
          status.fetch = "hit";
        this.#moveToTail(index);
        if (updateAgeOnGet) {
          this.#updateItemAge(index);
        }
        if (status)
          this.#statusTTL(status, index);
        return v;
      }
      const p = this.#backgroundFetch(k, index, options, context);
      const hasStale = p.__staleWhileFetching !== void 0;
      const staleVal = hasStale && allowStale;
      if (status) {
        status.fetch = isStale ? "stale" : "refresh";
        if (staleVal && isStale)
          status.returnedStale = true;
      }
      return staleVal ? p.__staleWhileFetching : p.__returned = p;
    }
  }
  async forceFetch(k, fetchOptions = {}) {
    const v = await this.fetch(k, fetchOptions);
    if (v === void 0)
      throw new Error("fetch() returned undefined");
    return v;
  }
  memo(k, memoOptions = {}) {
    const memoMethod = this.#memoMethod;
    if (!memoMethod) {
      throw new Error("no memoMethod provided to constructor");
    }
    const { context, forceRefresh, ...options } = memoOptions;
    const v = this.get(k, options);
    if (!forceRefresh && v !== void 0)
      return v;
    const vv = memoMethod(k, v, {
      options,
      context
    });
    this.set(k, vv, options);
    return vv;
  }
  /**
   * Return a value from the cache. Will update the recency of the cache
   * entry found.
   *
   * If the key is not found, get() will return `undefined`.
   */
  get(k, getOptions = {}) {
    const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, status } = getOptions;
    const index = this.#keyMap.get(k);
    if (index !== void 0) {
      const value = this.#valList[index];
      const fetching = this.#isBackgroundFetch(value);
      if (status)
        this.#statusTTL(status, index);
      if (this.#isStale(index)) {
        if (status)
          status.get = "stale";
        if (!fetching) {
          if (!noDeleteOnStaleGet) {
            this.#delete(k, "expire");
          }
          if (status && allowStale)
            status.returnedStale = true;
          return allowStale ? value : void 0;
        } else {
          if (status && allowStale && value.__staleWhileFetching !== void 0) {
            status.returnedStale = true;
          }
          return allowStale ? value.__staleWhileFetching : void 0;
        }
      } else {
        if (status)
          status.get = "hit";
        if (fetching) {
          return value.__staleWhileFetching;
        }
        this.#moveToTail(index);
        if (updateAgeOnGet) {
          this.#updateItemAge(index);
        }
        return value;
      }
    } else if (status) {
      status.get = "miss";
    }
  }
  #connect(p, n) {
    this.#prev[n] = p;
    this.#next[p] = n;
  }
  #moveToTail(index) {
    if (index !== this.#tail) {
      if (index === this.#head) {
        this.#head = this.#next[index];
      } else {
        this.#connect(this.#prev[index], this.#next[index]);
      }
      this.#connect(this.#tail, index);
      this.#tail = index;
    }
  }
  /**
   * Deletes a key out of the cache.
   *
   * Returns true if the key was deleted, false otherwise.
   */
  delete(k) {
    return this.#delete(k, "delete");
  }
  #delete(k, reason) {
    let deleted = false;
    if (this.#size !== 0) {
      const index = this.#keyMap.get(k);
      if (index !== void 0) {
        deleted = true;
        if (this.#size === 1) {
          this.#clear(reason);
        } else {
          this.#removeItemSize(index);
          const v = this.#valList[index];
          if (this.#isBackgroundFetch(v)) {
            v.__abortController.abort(new Error("deleted"));
          } else if (this.#hasDispose || this.#hasDisposeAfter) {
            if (this.#hasDispose) {
              this.#dispose?.(v, k, reason);
            }
            if (this.#hasDisposeAfter) {
              this.#disposed?.push([v, k, reason]);
            }
          }
          this.#keyMap.delete(k);
          this.#keyList[index] = void 0;
          this.#valList[index] = void 0;
          if (index === this.#tail) {
            this.#tail = this.#prev[index];
          } else if (index === this.#head) {
            this.#head = this.#next[index];
          } else {
            const pi = this.#prev[index];
            this.#next[pi] = this.#next[index];
            const ni = this.#next[index];
            this.#prev[ni] = this.#prev[index];
          }
          this.#size--;
          this.#free.push(index);
        }
      }
    }
    if (this.#hasDisposeAfter && this.#disposed?.length) {
      const dt = this.#disposed;
      let task;
      while (task = dt?.shift()) {
        this.#disposeAfter?.(...task);
      }
    }
    return deleted;
  }
  /**
   * Clear the cache entirely, throwing away all values.
   */
  clear() {
    return this.#clear("delete");
  }
  #clear(reason) {
    for (const index of this.#rindexes({ allowStale: true })) {
      const v = this.#valList[index];
      if (this.#isBackgroundFetch(v)) {
        v.__abortController.abort(new Error("deleted"));
      } else {
        const k = this.#keyList[index];
        if (this.#hasDispose) {
          this.#dispose?.(v, k, reason);
        }
        if (this.#hasDisposeAfter) {
          this.#disposed?.push([v, k, reason]);
        }
      }
    }
    this.#keyMap.clear();
    this.#valList.fill(void 0);
    this.#keyList.fill(void 0);
    if (this.#ttls && this.#starts) {
      this.#ttls.fill(0);
      this.#starts.fill(0);
    }
    if (this.#sizes) {
      this.#sizes.fill(0);
    }
    this.#head = 0;
    this.#tail = 0;
    this.#free.length = 0;
    this.#calculatedSize = 0;
    this.#size = 0;
    if (this.#hasDisposeAfter && this.#disposed) {
      const dt = this.#disposed;
      let task;
      while (task = dt?.shift()) {
        this.#disposeAfter?.(...task);
      }
    }
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory/dist/util.js
var knownSizes = /* @__PURE__ */ new WeakMap();
function roughSizeOfObject(value) {
  const objectList = /* @__PURE__ */ new Set();
  const stack = [value];
  let bytes = 0;
  while (stack.length) {
    const value2 = stack.pop();
    switch (typeof value2) {
      // Types are ordered by frequency
      case "string":
        bytes += 12 + 4 * Math.ceil(value2.length / 4);
        break;
      case "number":
        bytes += 12;
        break;
      case "boolean":
        bytes += 4;
        break;
      case "object":
        bytes += 4;
        if (value2 === null) {
          break;
        }
        if (knownSizes.has(value2)) {
          bytes += knownSizes.get(value2);
          break;
        }
        if (objectList.has(value2))
          continue;
        objectList.add(value2);
        if (Array.isArray(value2)) {
          bytes += 4;
          stack.push(...value2);
        } else {
          bytes += 8;
          const keys = Object.getOwnPropertyNames(value2);
          for (let i = 0; i < keys.length; i++) {
            bytes += 4;
            const key = keys[i];
            const val = value2[key];
            if (val !== void 0)
              stack.push(val);
            stack.push(key);
          }
        }
        break;
      case "function":
        bytes += 8;
        break;
      case "symbol":
        bytes += 8;
        break;
      case "bigint":
        bytes += 16;
        break;
    }
  }
  if (typeof value === "object" && value !== null) {
    knownSizes.set(value, bytes);
  }
  return bytes;
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory/dist/index.js
var nullSymbol = /* @__PURE__ */ Symbol("nullItem");
var toLruValue = (value) => value === null ? nullSymbol : value;
var fromLruValue = (value) => value === nullSymbol ? null : value;
var SimpleStoreMemory = class {
  #cache;
  constructor({ sizeCalculation, ...options }) {
    this.#cache = new LRUCache({
      ...options,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
      sizeCalculation: sizeCalculation ? (value, key) => sizeCalculation(fromLruValue(value), key) : options.maxEntrySize != null || options.maxSize != null ? (
        // maxEntrySize and maxSize require a size calculation function.
        roughSizeOfObject
      ) : void 0
    });
  }
  get(key) {
    const value = this.#cache.get(key);
    if (value === void 0)
      return void 0;
    return fromLruValue(value);
  }
  set(key, value) {
    this.#cache.set(key, toLruValue(value));
  }
  del(key) {
    this.#cache.delete(key);
  }
  clear() {
    this.#cache.clear();
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/dist/did-cache-memory.js
var DEFAULT_TTL = 3600 * 1e3;
var DEFAULT_MAX_SIZE = 50 * 1024 * 1024;
var DidCacheMemory = class extends SimpleStoreMemory {
  constructor(options) {
    super(options?.max == null ? { ttl: DEFAULT_TTL, maxSize: DEFAULT_MAX_SIZE, ...options } : { ttl: DEFAULT_TTL, ...options });
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/dist/did-cache.js
var DidResolverCached = class {
  constructor(resolver, cache = new DidCacheMemory(), onDidCacheError) {
    this.getter = new CachedGetter((did, options) => resolver.resolve(did, options), swallowStoreErrors(cache, onDidCacheError));
  }
  async resolve(did, options) {
    return this.getter.get(did, options);
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/dist/fetch-error.js
var FetchError = class extends Error {
  constructor(statusCode, message2, options) {
    super(message2, options);
    this.statusCode = statusCode;
  }
  get expose() {
    return true;
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/dist/fetch.js
function toRequestTransformer(requestTransformer) {
  return function(input, init) {
    return requestTransformer.call(this, asRequest(input, init));
  };
}
function asRequest(input, init) {
  if (!init && input instanceof Request)
    return input;
  return new Request(input, init);
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/dist/util.js
var ifString = (v) => typeof v === "string" ? v : void 0;
var MaxBytesTransformStream = class extends TransformStream {
  constructor(maxBytes) {
    if (!(maxBytes >= 0)) {
      throw new TypeError("maxBytes must be a non-negative number");
    }
    let bytesRead = 0;
    super({
      transform: (chunk, ctrl) => {
        if ((bytesRead += chunk.length) <= maxBytes) {
          ctrl.enqueue(chunk);
        } else {
          ctrl.error(new Error("Response too large"));
        }
      }
    });
  }
};
async function cancelBody(body, onCancellationError) {
  if (body.body && !body.bodyUsed && !body.body.locked && // Support for alternative fetch implementations
  typeof body.body.cancel === "function") {
    if (typeof onCancellationError === "function") {
      void body.body.cancel().catch(onCancellationError);
    } else if (onCancellationError === "log") {
      void body.body.cancel().catch(logCancellationError);
    } else {
      await body.body.cancel();
    }
  }
}
function logCancellationError(err) {
  console.warn("Failed to cancel response body", err);
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/dist/fetch-request.js
var FetchRequestError = class _FetchRequestError extends FetchError {
  constructor(request, statusCode, message2, options) {
    if (statusCode == null || !message2) {
      const info = extractInfo(extractRootCause(options?.cause));
      statusCode ??= info[0];
      message2 ||= info[1];
    }
    super(statusCode, message2, options);
    this.request = request;
  }
  get expose() {
    return this.statusCode !== 500;
  }
  static from(request, cause) {
    if (cause instanceof _FetchRequestError)
      return cause;
    return new _FetchRequestError(request, void 0, void 0, { cause });
  }
};
function extractRootCause(err) {
  if (err instanceof TypeError && err.message === "fetch failed" && err.cause !== void 0) {
    return err.cause;
  }
  return err;
}
function extractInfo(err) {
  if (typeof err === "string" && err.length > 0) {
    return [500, err];
  }
  if (!(err instanceof Error)) {
    return [500, "Failed to fetch"];
  }
  switch (err.message) {
    case "failed to fetch the data URL":
      return [400, err.message];
    case "unexpected redirect":
    case "cors failure":
    case "blocked":
    case "proxy authentication required":
      return [502, err.message];
  }
  const code = "code" in err ? err.code : void 0;
  if (typeof code === "string") {
    switch (true) {
      case code === "ENOTFOUND":
        return [400, "Invalid hostname"];
      case code === "ECONNREFUSED":
        return [502, "Connection refused"];
      case code === "DEPTH_ZERO_SELF_SIGNED_CERT":
        return [502, "Self-signed certificate"];
      case code.startsWith("ERR_TLS"):
        return [502, "TLS error"];
      case code.startsWith("ECONN"):
        return [502, "Connection error"];
      default:
        return [500, `${code} error`];
    }
  }
  return [500, err.message];
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe/dist/pipe.js
function pipe(...pipeline) {
  return pipeline.reduce(pipeTwo);
}
function pipeTwo(first, second) {
  return async (...args) => second(await first(...args));
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/dist/transformed-response.js
var TransformedResponse = class extends Response {
  #response;
  constructor(response, transform) {
    if (!response.body) {
      throw new TypeError("Response body is not available");
    }
    if (response.bodyUsed) {
      throw new TypeError("Response body is already used");
    }
    super(response.body.pipeThrough(transform), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    this.#response = response;
  }
  /**
   * Some props can't be set through ResponseInit, so we need to proxy them
   */
  get url() {
    return this.#response.url;
  }
  get redirected() {
    return this.#response.redirected;
  }
  get type() {
    return this.#response.type;
  }
  get statusText() {
    return this.#response.statusText;
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/dist/fetch-response.js
var JSON_MIME = /^application\/(?:[^()<>@,;:/[\]\\?={} \t]+\+)?json$/i;
var FetchResponseError = class _FetchResponseError extends FetchError {
  constructor(response, statusCode = response.status, message2 = response.statusText, options) {
    super(statusCode, message2, options);
    this.response = response;
  }
  static async from(response, customMessage = extractResponseMessage, statusCode = response.status, options) {
    const message2 = typeof customMessage === "string" ? customMessage : typeof customMessage === "function" ? await customMessage(response) : void 0;
    return new _FetchResponseError(response, statusCode, message2, options);
  }
};
var extractResponseMessage = async (response) => {
  const mimeType = extractMime(response);
  if (!mimeType)
    return void 0;
  try {
    if (mimeType === "text/plain") {
      return await response.text();
    } else if (JSON_MIME.test(mimeType)) {
      const json = await response.json();
      if (typeof json === "string")
        return json;
      if (typeof json === "object" && json != null) {
        if ("error_description" in json) {
          const errorDescription = ifString(json.error_description);
          if (errorDescription)
            return errorDescription;
        }
        if ("error" in json) {
          const error = ifString(json.error);
          if (error)
            return error;
        }
        if ("message" in json) {
          const message2 = ifString(json.message);
          if (message2)
            return message2;
        }
      }
    }
  } catch {
  }
  return void 0;
};
async function peekJson(response, maxSize = Infinity) {
  const type = extractMime(response);
  if (type !== "application/json")
    return void 0;
  checkLength(response, maxSize);
  const clonedResponse = response.clone();
  const limitedResponse = response.body && maxSize < Infinity ? new TransformedResponse(clonedResponse, new MaxBytesTransformStream(maxSize)) : (
    // Note: some runtimes (e.g. react-native) don't expose a body property
    clonedResponse
  );
  return limitedResponse.json();
}
function checkLength(response, maxBytes) {
  if (!(maxBytes >= 0)) {
    throw new TypeError("maxBytes must be a non-negative number");
  }
  const length = extractLength(response);
  if (length != null && length > maxBytes) {
    throw new FetchResponseError(response, 502, "Response too large");
  }
  return length;
}
function extractLength(response) {
  const contentLength = response.headers.get("Content-Length");
  if (contentLength == null)
    return void 0;
  if (!/^\d+$/.test(contentLength)) {
    throw new FetchResponseError(response, 502, "Invalid Content-Length");
  }
  const length = Number(contentLength);
  if (!Number.isSafeInteger(length)) {
    throw new FetchResponseError(response, 502, "Content-Length too large");
  }
  return length;
}
function extractMime(response) {
  const contentType = response.headers.get("Content-Type");
  if (contentType == null)
    return void 0;
  return contentType.split(";", 1)[0].trim();
}
function cancelBodyOnError(transformer, onCancellationError = logCancellationError) {
  return async (response) => {
    try {
      return await transformer(response);
    } catch (err) {
      await cancelBody(response, onCancellationError ?? void 0);
      throw err;
    }
  };
}
function fetchOkProcessor(customMessage) {
  return cancelBodyOnError((response) => {
    return fetchOkTransformer(response, customMessage);
  });
}
async function fetchOkTransformer(response, customMessage) {
  if (response.ok)
    return response;
  throw await FetchResponseError.from(response, customMessage);
}
function fetchTypeProcessor(expectedMime, contentTypeRequired = true) {
  const isExpected = typeof expectedMime === "string" ? (mimeType) => mimeType === expectedMime : expectedMime instanceof RegExp ? (mimeType) => expectedMime.test(mimeType) : expectedMime;
  return cancelBodyOnError((response) => {
    return fetchResponseTypeChecker(response, isExpected, contentTypeRequired);
  });
}
async function fetchResponseTypeChecker(response, isExpectedMime, contentTypeRequired = true) {
  const mimeType = extractMime(response);
  if (mimeType) {
    if (!isExpectedMime(mimeType.toLowerCase())) {
      throw await FetchResponseError.from(response, `Unexpected response Content-Type (${mimeType})`, 502);
    }
  } else if (contentTypeRequired) {
    throw await FetchResponseError.from(response, "Missing response Content-Type header", 502);
  }
  return response;
}
async function fetchResponseJsonTransformer(response) {
  try {
    const json = await response.json();
    return { response, json };
  } catch (cause) {
    throw new FetchResponseError(response, 502, "Unable to parse response as JSON", { cause });
  }
}
function fetchJsonProcessor(expectedMime = JSON_MIME, contentTypeRequired = true) {
  return pipe(fetchTypeProcessor(expectedMime, contentTypeRequired), cancelBodyOnError(fetchResponseJsonTransformer));
}
function fetchJsonValidatorProcessor(schema, params) {
  if ("parseAsync" in schema && typeof schema.parseAsync === "function") {
    return async (jsonResponse) => schema.parseAsync(jsonResponse.json, params);
  }
  if ("parse" in schema && typeof schema.parse === "function") {
    return async (jsonResponse) => schema.parse(jsonResponse.json, params);
  }
  throw new TypeError("Invalid schema");
}
var fetchJsonZodProcessor = fetchJsonValidatorProcessor;

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/dist/fetch-wrap.js
function bindFetch(fetch = globalThis.fetch, context = globalThis) {
  return toRequestTransformer(async (request) => {
    try {
      return await fetch.call(context, request);
    } catch (err) {
      throw FetchRequestError.from(request, err);
    }
  });
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/dist/did-resolver-base.js
var DidResolverBase = class {
  constructor(methods) {
    this.methods = new Map(Object.entries(methods));
  }
  async resolve(did, options) {
    options?.signal?.throwIfAborted();
    const method = extractDidMethod(did);
    const resolver = this.methods.get(method);
    if (!resolver) {
      throw new DidError(did, `Unsupported DID method`, "did-method-invalid", 400);
    }
    try {
      const document2 = await resolver.resolve(did, options);
      if (document2.id !== did) {
        throw new DidError(did, `DID document id (${document2.id}) does not match DID`, "did-document-id-mismatch", 400);
      }
      return document2;
    } catch (err) {
      if (err instanceof FetchResponseError) {
        const status = err.response.status >= 500 ? 502 : err.response.status;
        throw new DidError(did, err.message, "did-fetch-error", status, err);
      }
      if (err instanceof FetchError) {
        throw new DidError(did, err.message, "did-fetch-error", 400, err);
      }
      if (err instanceof ZodError) {
        throw new DidError(did, err.message, "did-document-format-error", 503, err);
      }
      throw DidError.from(err, did);
    }
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/dist/methods/plc.js
var fetchSuccessHandler = pipe(fetchOkProcessor(), fetchJsonProcessor(/^application\/(did\+ld\+)?json$/), fetchJsonZodProcessor(didDocumentValidator));
var DidPlcMethod = class {
  constructor(options) {
    this.plcDirectoryUrl = new URL(options?.plcDirectoryUrl || "https://plc.directory/");
    this.fetch = bindFetch(options?.fetch);
  }
  async resolve(did, options) {
    assertDidPlc(did);
    const url = new URL(`/${encodeURIComponent(did)}`, this.plcDirectoryUrl);
    return this.fetch(url, {
      redirect: "error",
      headers: { accept: "application/did+ld+json,application/json" },
      signal: options?.signal
    }).then(fetchSuccessHandler);
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/dist/methods/web.js
var fetchSuccessHandler2 = pipe(fetchOkProcessor(), fetchJsonProcessor(/^application\/(did\+ld\+)?json$/), fetchJsonZodProcessor(didDocumentValidator));
var DidWebMethod = class {
  constructor({ fetch = globalThis.fetch, allowHttp = true } = {}) {
    this.fetch = bindFetch(fetch);
    this.allowHttp = allowHttp;
  }
  async resolve(did, options) {
    const didDocumentUrl = buildDidWebDocumentUrl(did);
    if (!this.allowHttp && didDocumentUrl.protocol === "http:") {
      throw new DidError(did, 'Resolution of "http" did:web is not allowed', "did-web-http-not-allowed");
    }
    return this.fetch(didDocumentUrl, {
      redirect: "error",
      headers: { accept: "application/did+ld+json,application/json" },
      signal: options?.signal
    }).then(fetchSuccessHandler2);
  }
};
function buildDidWebDocumentUrl(did) {
  const url = didWebToUrl(did);
  if (url.pathname === "/") {
    return new URL(`/.well-known/did.json`, url);
  } else {
    return new URL(`${url.pathname}/did.json`, url);
  }
}

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/dist/did-resolver-common.js
var DidResolverCommon = class extends DidResolverBase {
  constructor(options) {
    super({
      plc: new DidPlcMethod(options),
      web: new DidWebMethod(options)
    });
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/dist/create-did-resolver.js
function createDidResolver(options) {
  const { didResolver, didCache, onDidCacheError } = options;
  if (didResolver instanceof DidResolverCached && !didCache) {
    return didResolver;
  }
  return new DidResolverCached(didResolver ?? new DidResolverCommon(options), didCache, onDidCacheError);
}

// node_modules/@atproto-labs/handle-resolver/dist/handle-resolver-error.js
var HandleResolverError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "HandleResolverError";
  }
};

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/lib/number.js
var ifNumber2 = (value) => typeof value === "number" ? value : void 0;

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/did-error.js
var DidError2 = class _DidError extends Error {
  constructor(did, message2, code, status = 400, cause) {
    super(message2, { cause });
    this.did = did;
    this.code = code;
    this.status = status;
  }
  /**
   * For compatibility with error handlers in common HTTP frameworks.
   */
  get statusCode() {
    return this.status;
  }
  toString() {
    return `${this.constructor.name} ${this.code} (${this.did}): ${this.message}`;
  }
  static from(cause, did) {
    if (cause instanceof _DidError) {
      return cause;
    }
    const message2 = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "An unknown error occurred";
    const status = typeof cause === "object" && cause != null ? ("statusCode" in cause ? ifNumber2(cause.statusCode) : void 0) ?? ("status" in cause ? ifNumber2(cause.status) : void 0) : void 0;
    return new _DidError(did, message2, "did-unknown-error", status, cause);
  }
};
var InvalidDidError2 = class extends DidError2 {
  constructor(did, message2, cause) {
    super(did, message2, "did-invalid", 400, cause);
  }
};

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/did.js
var DID_PREFIX2 = "did:";
var DID_PREFIX_LENGTH2 = DID_PREFIX2.length;
function assertDidMethod2(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError2(input, `Empty method name`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 48 || c > 57)) {
      throw new InvalidDidError2(input, `Invalid character at position ${i} in DID method name`);
    }
  }
}
function assertDidMsid2(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError2(input, `DID method-specific id must not be empty`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 65 || c > 90) && // A-Z
    (c < 48 || c > 57) && // 0-9
    c !== 46 && // .
    c !== 45 && // -
    c !== 95) {
      if (c === 58) {
        if (i === end - 1) {
          throw new InvalidDidError2(input, `DID cannot end with ":"`);
        }
        continue;
      }
      if (c === 37) {
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError2(input, `Invalid pct-encoded character at position ${i}`);
        }
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError2(input, `Invalid pct-encoded character at position ${i}`);
        }
        if (i >= end) {
          throw new InvalidDidError2(input, `Incomplete pct-encoded character at position ${i - 2}`);
        }
        continue;
      }
      throw new InvalidDidError2(input, `Disallowed character in DID at position ${i}`);
    }
  }
}
function assertDid2(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError2(typeof input, `DID must be a string`);
  }
  const { length } = input;
  if (length > 2048) {
    throw new InvalidDidError2(input, `DID is too long (2048 chars max)`);
  }
  if (!input.startsWith(DID_PREFIX2)) {
    throw new InvalidDidError2(input, `DID requires "${DID_PREFIX2}" prefix`);
  }
  const idSep = input.indexOf(":", DID_PREFIX_LENGTH2);
  if (idSep === -1) {
    throw new InvalidDidError2(input, `Missing colon after method name`);
  }
  assertDidMethod2(input, DID_PREFIX_LENGTH2, idSep);
  assertDidMsid2(input, idSep + 1, length);
}
var didSchema2 = external_exports.string().superRefine((value, ctx) => {
  try {
    assertDid2(value);
    return true;
  } catch (err) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: err instanceof Error ? err.message : "Unexpected error"
    });
    return false;
  }
});

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/lib/uri.js
function isFragment2(value, startIdx = 0, endIdx = value.length) {
  let charCode;
  for (let i = startIdx; i < endIdx; i++) {
    charCode = value.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122 || charCode >= 48 && charCode <= 57 || charCode === 45 || charCode === 46 || charCode === 95 || charCode === 126) {
    } else if (charCode === 33 || charCode === 36 || charCode === 38 || charCode === 39 || charCode === 40 || charCode === 41 || charCode === 42 || charCode === 43 || charCode === 44 || charCode === 59 || charCode === 61) {
    } else if (charCode === 58 || charCode === 64) {
    } else if (charCode === 47 || charCode === 63) {
    } else if (charCode === 37) {
      if (i + 2 >= endIdx)
        return false;
      if (!isHexDigit2(value.charCodeAt(i + 1)))
        return false;
      if (!isHexDigit2(value.charCodeAt(i + 2)))
        return false;
      i += 2;
    } else {
      return false;
    }
  }
  return true;
}
function isHexDigit2(code) {
  return code >= 48 && code <= 57 || // 0-9
  code >= 65 && code <= 70 || // A-F
  code >= 97 && code <= 102;
}
var canParse2 = URL.canParse?.bind(URL) ?? ((url, base) => {
  try {
    new URL(url, base);
    return true;
  } catch {
    return false;
  }
});

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/methods/plc.js
var DID_PLC_PREFIX2 = `did:plc:`;
var DID_PLC_PREFIX_LENGTH2 = DID_PLC_PREFIX2.length;
var DID_PLC_LENGTH2 = 32;
function isDidPlc2(input) {
  if (typeof input !== "string")
    return false;
  if (input.length !== DID_PLC_LENGTH2)
    return false;
  if (!input.startsWith(DID_PLC_PREFIX2))
    return false;
  for (let i = DID_PLC_PREFIX_LENGTH2; i < DID_PLC_LENGTH2; i++) {
    if (!isBase32Char2(input.charCodeAt(i)))
      return false;
  }
  return true;
}
var isBase32Char2 = (c) => c >= 97 && c <= 122 || c >= 50 && c <= 55;

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/methods/web.js
var DID_WEB_PREFIX2 = `did:web:`;
function isDidWeb2(input) {
  if (typeof input !== "string")
    return false;
  if (!input.startsWith(DID_WEB_PREFIX2))
    return false;
  if (input.charAt(DID_WEB_PREFIX2.length) === ":")
    return false;
  try {
    assertDidMsid2(input, DID_WEB_PREFIX2.length);
  } catch {
    return false;
  }
  return canParse2(buildDidWebUrl2(input));
}
function buildDidWebUrl2(did) {
  const hostIdx = DID_WEB_PREFIX2.length;
  const pathIdx = did.indexOf(":", hostIdx);
  const hostEnc = pathIdx === -1 ? did.slice(hostIdx) : did.slice(hostIdx, pathIdx);
  const host = hostEnc.replaceAll("%3A", ":");
  const path = pathIdx === -1 ? "" : did.slice(pathIdx).replaceAll(":", "/");
  const proto = host.startsWith("localhost") && (host.length === 9 || host.charCodeAt(9) === 58) ? "http" : "https";
  return `${proto}://${host}${path}`;
}

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/atproto.js
var atprotoDidSchema2 = external_exports.string().refine(isAtprotoDid2, `Atproto only allows "plc" and "web" DID methods`);
function isAtprotoDid2(input) {
  return isDidPlc2(input) || isAtprotoDidWeb2(input);
}
function isAtprotoDidWeb2(input) {
  if (!isDidWeb2(input)) {
    return false;
  }
  if (isDidWebWithPath2(input)) {
    return false;
  }
  if (isDidWebWithHttpsPort2(input)) {
    return false;
  }
  return true;
}
function isDidWebWithPath2(did) {
  return did.includes(":", DID_WEB_PREFIX2.length);
}
function isLocalhostDid2(did) {
  return did === "did:web:localhost" || did.startsWith("did:web:localhost:") || did.startsWith("did:web:localhost%3A");
}
function isDidWebWithHttpsPort2(did) {
  if (isLocalhostDid2(did))
    return false;
  const pathIdx = did.indexOf(":", DID_WEB_PREFIX2.length);
  const hasPort = pathIdx === -1 ? (
    // No path component, check if there's a port separator anywhere after
    // the "did:web:" prefix
    did.includes("%3A", DID_WEB_PREFIX2.length)
  ) : (
    // There is a path component; if there is an encoded colon *before* it,
    // then there is a port number
    did.lastIndexOf("%3A", pathIdx) !== -1
  );
  return hasPort;
}
var ATPROTO_VERIFICATION_METHOD_TYPES2 = Object.freeze([
  "EcdsaSecp256r1VerificationKey2019",
  "EcdsaSecp256k1VerificationKey2019",
  "Multikey"
]);

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/dist/did-document.js
var rfc3968UriSchema2 = external_exports.string().url("RFC3968 compliant URI");
var didControllerSchema2 = external_exports.union([didSchema2, external_exports.array(didSchema2)]);
var didRelativeUriSchema2 = external_exports.union([
  rfc3968UriSchema2.refine((value) => {
    const fragmentIndex = value.indexOf("#");
    if (fragmentIndex === -1)
      return false;
    return isFragment2(value, fragmentIndex + 1);
  }, {
    message: "Missing or invalid fragment in RFC3968 URI"
  }),
  external_exports.string().refine((value) => value.charCodeAt(0) === 35, {
    message: "Fragment must start with #"
  }).refine((value) => isFragment2(value, 1), {
    message: "Invalid char in URI fragment"
  })
]);
var didVerificationMethodSchema2 = external_exports.object({
  id: didRelativeUriSchema2,
  type: external_exports.string().min(1),
  controller: didControllerSchema2,
  publicKeyJwk: external_exports.record(external_exports.string(), external_exports.unknown()).optional(),
  publicKeyMultibase: external_exports.string().optional()
});
var didServiceIdSchema2 = didRelativeUriSchema2;
var didServiceTypeSchema2 = external_exports.union([external_exports.string(), external_exports.array(external_exports.string())]);
var didServiceEndpointSchema2 = external_exports.union([
  rfc3968UriSchema2,
  external_exports.record(external_exports.string(), rfc3968UriSchema2),
  external_exports.array(external_exports.union([rfc3968UriSchema2, external_exports.record(external_exports.string(), rfc3968UriSchema2)])).nonempty()
]);
var didServiceSchema2 = external_exports.object({
  id: didServiceIdSchema2,
  type: didServiceTypeSchema2,
  serviceEndpoint: didServiceEndpointSchema2
});
var verificationMethodReference2 = external_exports.union([
  //
  didRelativeUriSchema2,
  didVerificationMethodSchema2
]);
var didDocumentSchema2 = external_exports.object({
  "@context": external_exports.union([
    external_exports.literal("https://www.w3.org/ns/did/v1"),
    external_exports.array(external_exports.string().url()).nonempty().refine((data) => data[0] === "https://www.w3.org/ns/did/v1", {
      message: "First @context must be https://www.w3.org/ns/did/v1"
    })
  ]).optional(),
  id: didSchema2,
  controller: didControllerSchema2.optional(),
  alsoKnownAs: external_exports.array(rfc3968UriSchema2).optional(),
  service: external_exports.array(didServiceSchema2).optional(),
  authentication: external_exports.array(verificationMethodReference2).optional(),
  verificationMethod: external_exports.array(didVerificationMethodSchema2).optional()
});
var didDocumentValidator2 = didDocumentSchema2.superRefine(({ id: did, service }, ctx) => {
  if (service) {
    const visited = /* @__PURE__ */ new Set();
    for (let i = 0; i < service.length; i++) {
      const current = service[i];
      const serviceId = current.id.startsWith("#") ? `${did}${current.id}` : current.id;
      if (!visited.has(serviceId)) {
        visited.add(serviceId);
      } else {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          message: `Duplicate service id (${current.id}) found in the document`,
          path: ["service", i, "id"]
        });
      }
    }
  }
});

// node_modules/@atproto-labs/handle-resolver/dist/types.js
function isResolvedHandle(value) {
  return value === null || isAtprotoDid2(value);
}
function asResolvedHandle(value) {
  return isResolvedHandle(value) ? value : null;
}

// node_modules/@atproto-labs/handle-resolver/dist/xrpc-handle-resolver.js
var xrpcErrorSchema = external_exports.object({
  error: external_exports.string(),
  message: external_exports.string().optional()
});
var XrpcHandleResolver = class {
  constructor(service, options) {
    this.serviceUrl = new URL(service);
    this.fetch = options?.fetch ?? globalThis.fetch;
  }
  async resolve(handle, options) {
    const url = new URL("/xrpc/com.atproto.identity.resolveHandle", this.serviceUrl);
    url.searchParams.set("handle", handle);
    const response = await this.fetch.call(null, url, {
      cache: options?.noCache ? "no-cache" : void 0,
      signal: options?.signal,
      redirect: "error"
    });
    const payload = await response.json();
    if (response.status === 400) {
      const { error, data } = xrpcErrorSchema.safeParse(payload);
      if (error) {
        throw new HandleResolverError(`Invalid response from resolveHandle method: ${error.message}`, { cause: error });
      }
      if (data.error === "InvalidRequest" && data.message === "Unable to resolve handle") {
        return null;
      }
    }
    if (!response.ok) {
      throw new HandleResolverError("Invalid status code from resolveHandle method");
    }
    const value = payload?.did;
    if (!isResolvedHandle(value)) {
      throw new HandleResolverError("Invalid DID returned from resolveHandle method");
    }
    return value;
  }
};

// node_modules/@atproto-labs/handle-resolver/dist/internal-resolvers/dns-handle-resolver.js
var SUBDOMAIN = "_atproto";
var PREFIX = "did=";
var DnsHandleResolver = class {
  constructor(resolveTxt) {
    this.resolveTxt = resolveTxt;
  }
  async resolve(handle) {
    const results = await this.resolveTxt.call(null, `${SUBDOMAIN}.${handle}`);
    if (!results)
      return null;
    for (let i = 0; i < results.length; i++) {
      if (!results[i].startsWith(PREFIX))
        continue;
      for (let j = i + 1; j < results.length; j++) {
        if (results[j].startsWith(PREFIX))
          return null;
      }
      const did = results[i].slice(PREFIX.length);
      return isResolvedHandle(did) ? did : null;
    }
    return null;
  }
};

// node_modules/@atproto-labs/handle-resolver/dist/internal-resolvers/well-known-handler-resolver.js
var WellKnownHandleResolver = class {
  constructor(options) {
    this.fetch = options?.fetch ?? globalThis.fetch;
    this.onError = options?.onError;
  }
  async resolve(handle, options) {
    const url = new URL("/.well-known/atproto-did", `https://${handle}`);
    try {
      const response = await this.fetch.call(null, url, {
        cache: options?.noCache ? "no-cache" : void 0,
        signal: options?.signal,
        redirect: "error"
      });
      if (!response.ok) {
        throw new HandleResolverError(`Resolver returned HTTP ${response.status} for ${url.origin}/.well-known/atproto-did`);
      }
      const text = await response.text();
      const firstLine = text.split("\n")[0].trim();
      if (isResolvedHandle(firstLine))
        return firstLine;
      return null;
    } catch (err) {
      options?.signal?.throwIfAborted();
      if (this.onError) {
        try {
          this.onError(err, { resolver: "well-known", handle });
        } catch {
        }
      }
      return null;
    }
  }
};

// node_modules/@atproto-labs/handle-resolver/dist/atproto-handle-resolver.js
var noop = () => {
};
var AtprotoHandleResolver = class {
  constructor(options) {
    this.httpResolver = new WellKnownHandleResolver(options);
    this.dnsResolver = new DnsHandleResolver(options.resolveTxt);
    this.dnsResolverFallback = options.resolveTxtFallback ? new DnsHandleResolver(options.resolveTxtFallback) : void 0;
  }
  async resolve(handle, options) {
    options?.signal?.throwIfAborted();
    const abortController = new AbortController();
    const { signal } = abortController;
    options?.signal?.addEventListener("abort", () => abortController.abort(), {
      signal
    });
    const wrappedOptions = { ...options, signal };
    try {
      const dnsPromise = this.dnsResolver.resolve(handle, wrappedOptions);
      const httpPromise = this.httpResolver.resolve(handle, wrappedOptions);
      httpPromise.catch(noop);
      const dnsRes = await dnsPromise;
      if (dnsRes)
        return dnsRes;
      signal.throwIfAborted();
      const res = await httpPromise;
      if (res)
        return res;
      signal.throwIfAborted();
      return this.dnsResolverFallback?.resolve(handle, wrappedOptions) ?? null;
    } finally {
      abortController.abort();
    }
  }
};

// node_modules/@atproto-labs/handle-resolver/dist/atproto-doh-handle-resolver.js
var AtprotoDohHandleResolver = class extends AtprotoHandleResolver {
  constructor(options) {
    super({
      ...options,
      resolveTxt: dohResolveTxtFactory(options),
      resolveTxtFallback: void 0
    });
  }
};
function dohResolveTxtFactory({ dohEndpoint, fetch = globalThis.fetch }) {
  return async (hostname) => {
    const url = new URL(dohEndpoint);
    url.searchParams.set("type", "TXT");
    url.searchParams.set("name", hostname);
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/dns-json" },
      redirect: "follow"
    });
    try {
      const contentType = response.headers.get("content-type")?.trim();
      if (!response.ok) {
        const message2 = contentType?.startsWith("text/plain") ? await response.text() : `Failed to resolve ${hostname}`;
        throw new HandleResolverError(message2);
      } else if (contentType?.match(/application\/(dns-)?json/i) == null) {
        throw new HandleResolverError("Unexpected response from DoH server");
      }
      const result = asResult(await response.json());
      return result.Answer?.filter(isAnswerTxt).map(extractTxtData) ?? null;
    } finally {
      if (response.bodyUsed === false) {
        void response.body?.cancel().catch(onCancelError);
      }
    }
  };
}
function onCancelError(err) {
  if (!(err instanceof DOMException) || err.name !== "AbortError") {
    console.error("An error occurred while cancelling the response body:", err);
  }
}
function isResult(result) {
  if (typeof result !== "object" || result === null)
    return false;
  if (!("Status" in result) || typeof result.Status !== "number")
    return false;
  if ("Answer" in result && !isArrayOf(result.Answer, isAnswer))
    return false;
  return true;
}
function asResult(result) {
  if (isResult(result))
    return result;
  throw new HandleResolverError("Invalid DoH response");
}
function isArrayOf(value, predicate) {
  return Array.isArray(value) && value.every(predicate);
}
function isAnswer(answer) {
  return typeof answer === "object" && answer !== null && "name" in answer && typeof answer.name === "string" && "type" in answer && typeof answer.type === "number" && "data" in answer && typeof answer.data === "string" && "TTL" in answer && typeof answer.TTL === "number";
}
function isAnswerTxt(answer) {
  return answer.type === 16;
}
function extractTxtData(answer) {
  return answer.data.replace(/^"|"$/g, "").replace(/\\"/g, '"');
}

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store/dist/util.js
function assert2(condition, message2 = "Assertion failed") {
  if (!condition)
    throw new Error(message2);
}

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store/dist/cached-getter.js
var returnTrue2 = () => true;
var returnFalse2 = () => false;
var CachedGetter2 = class {
  #pending = /* @__PURE__ */ new Map();
  #getter;
  #store;
  #options = {};
  constructor(getter, store, options = {}) {
    this.#getter = getter;
    this.#store = store;
    this.#options = options;
  }
  async get(key, { signal, context, allowStale = false, noCache = false } = {}) {
    signal?.throwIfAborted();
    const { isStale, deleteOnError } = this.#options;
    const allowStored = noCache ? returnFalse2 : allowStale || isStale == null ? returnTrue2 : async (value2) => !await isStale(key, value2);
    let previousExecutionFlow;
    while (previousExecutionFlow = this.#pending.get(key)) {
      try {
        const { isFresh, value: value2 } = await previousExecutionFlow;
        if (isFresh)
          return value2;
        if (await allowStored(value2))
          return value2;
      } catch {
      }
      signal?.throwIfAborted();
    }
    const currentExecutionFlow = Promise.resolve().then(async () => {
      signal?.throwIfAborted();
      const storedValue = await this.getStored(key, { signal });
      if (storedValue !== void 0 && await allowStored(storedValue)) {
        return { isFresh: false, value: storedValue };
      }
      signal?.throwIfAborted();
      return Promise.resolve().then(async () => {
        const options = { signal, noCache, context };
        return this.#getter.call(null, key, options, storedValue);
      }).catch(async (err) => {
        if (storedValue !== void 0) {
          try {
            if (await deleteOnError?.(err, key, storedValue)) {
              await this.delStored(key, err);
            }
          } catch (error) {
            throw new AggregateError([err, error], "Error while deleting stored value");
          }
        }
        throw err;
      }).then(async (value2) => {
        await this.setStored(key, value2);
        return { isFresh: true, value: value2 };
      });
    }).finally(() => {
      assert2(this.#pending.get(key) === currentExecutionFlow, `Pending item for key "${key}" was replaced before it finished.`);
      this.#pending.delete(key);
    });
    assert2(!this.#pending.has(key), `Concurrent execution flow for key "${key}" should not exist.`);
    this.#pending.set(key, currentExecutionFlow);
    const { value } = await currentExecutionFlow;
    return value;
  }
  // @NOTE We propagate errors from the store. If the use-case prefers to ignore
  // errors from the store, it should be handled in the store implementation
  // (eg. by returning `undefined` instead of throwing).
  // @NOTE We define the store methods here to allow for overriding them in
  // subclasses.
  async getStored(key, options) {
    return this.#store.get(key, options);
  }
  async setStored(key, value) {
    await this.#store.set(key, value);
  }
  async delStored(key, _cause) {
    await this.#store.del(key);
  }
};

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store/dist/swallow-store-errors.js
var logStoreError2 = (err, operation) => {
  console.error(`SimpleStore error during "${operation}"`, err);
};
function swallowStoreErrors2(store, onError = logStoreError2) {
  return {
    async get(key, options) {
      options?.signal?.throwIfAborted();
      try {
        return await store.get(key, options);
      } catch (err) {
        if (options?.signal?.aborted)
          throw err;
        onError(err, "get", key);
        return void 0;
      }
    },
    async set(key, value) {
      try {
        await store.set(key, value);
      } catch (err) {
        onError(err, "set", key);
      }
    },
    async del(key) {
      try {
        await store.del(key);
      } catch (err) {
        onError(err, "del", key);
      }
    },
    async clear() {
      try {
        await store.clear?.();
      } catch (err) {
        onError(err, "clear");
      }
    }
  };
}

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory/dist/util.js
var knownSizes2 = /* @__PURE__ */ new WeakMap();
function roughSizeOfObject2(value) {
  const objectList = /* @__PURE__ */ new Set();
  const stack = [value];
  let bytes = 0;
  while (stack.length) {
    const value2 = stack.pop();
    switch (typeof value2) {
      // Types are ordered by frequency
      case "string":
        bytes += 12 + 4 * Math.ceil(value2.length / 4);
        break;
      case "number":
        bytes += 12;
        break;
      case "boolean":
        bytes += 4;
        break;
      case "object":
        bytes += 4;
        if (value2 === null) {
          break;
        }
        if (knownSizes2.has(value2)) {
          bytes += knownSizes2.get(value2);
          break;
        }
        if (objectList.has(value2))
          continue;
        objectList.add(value2);
        if (Array.isArray(value2)) {
          bytes += 4;
          stack.push(...value2);
        } else {
          bytes += 8;
          const keys = Object.getOwnPropertyNames(value2);
          for (let i = 0; i < keys.length; i++) {
            bytes += 4;
            const key = keys[i];
            const val = value2[key];
            if (val !== void 0)
              stack.push(val);
            stack.push(key);
          }
        }
        break;
      case "function":
        bytes += 8;
        break;
      case "symbol":
        bytes += 8;
        break;
      case "bigint":
        bytes += 16;
        break;
    }
  }
  if (typeof value === "object" && value !== null) {
    knownSizes2.set(value, bytes);
  }
  return bytes;
}

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory/dist/index.js
var nullSymbol2 = /* @__PURE__ */ Symbol("nullItem");
var toLruValue2 = (value) => value === null ? nullSymbol2 : value;
var fromLruValue2 = (value) => value === nullSymbol2 ? null : value;
var SimpleStoreMemory2 = class {
  #cache;
  constructor({ sizeCalculation, ...options }) {
    this.#cache = new LRUCache({
      ...options,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
      sizeCalculation: sizeCalculation ? (value, key) => sizeCalculation(fromLruValue2(value), key) : options.maxEntrySize != null || options.maxSize != null ? (
        // maxEntrySize and maxSize require a size calculation function.
        roughSizeOfObject2
      ) : void 0
    });
  }
  get(key) {
    const value = this.#cache.get(key);
    if (value === void 0)
      return void 0;
    return fromLruValue2(value);
  }
  set(key, value) {
    this.#cache.set(key, toLruValue2(value));
  }
  del(key) {
    this.#cache.delete(key);
  }
  clear() {
    this.#cache.clear();
  }
};

// node_modules/@atproto-labs/handle-resolver/dist/cached-handle-resolver.js
var CachedHandleResolver = class {
  constructor(resolver, cache = new SimpleStoreMemory2({
    max: 1e3,
    ttl: 10 * 6e4
  }), onHandleCacheError) {
    this.getter = new CachedGetter2((handle, options) => resolver.resolve(handle, options), swallowStoreErrors2(cache, onHandleCacheError));
  }
  async resolve(handle, options) {
    return this.getter.get(handle, options);
  }
};

// node_modules/@atproto-labs/handle-resolver/dist/create-handle-resolver.js
function createHandleResolver(options) {
  const { handleResolver, handleCache, onHandleCacheError } = options;
  if (handleResolver instanceof CachedHandleResolver && !handleCache) {
    return handleResolver;
  }
  return new CachedHandleResolver(typeof handleResolver === "string" || handleResolver instanceof URL ? new XrpcHandleResolver(handleResolver, options) : handleResolver, handleCache, onHandleCacheError);
}

// node_modules/@atproto/oauth-types/dist/constants.js
var CLIENT_ASSERTION_TYPE_JWT_BEARER = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

// node_modules/@atproto/oauth-types/dist/util.js
var canParseUrl = URL.canParse?.bind(URL) ?? // URL.canParse is not available in Node.js < 18.7.0
((urlStr) => {
  try {
    new URL(urlStr);
    return true;
  } catch {
    return false;
  }
});
function isHostnameIP(hostname) {
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/))
    return true;
  if (hostname.startsWith("[") && hostname.endsWith("]"))
    return true;
  return false;
}
function isLoopbackHost(host) {
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}
function isLocalHostname(hostname) {
  const parts = hostname.split(".");
  if (parts.length < 2)
    return true;
  const tld = parts.at(-1).toLowerCase();
  return tld === "test" || tld === "local" || tld === "localhost" || tld === "invalid" || tld === "example";
}
function safeUrl(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}
function extractUrlPath(url) {
  const endOfProtocol = url.startsWith("https://") ? 8 : url.startsWith("http://") ? 7 : -1;
  if (endOfProtocol === -1) {
    throw new TypeError('URL must use the "https:" or "http:" protocol');
  }
  const hashIdx = url.indexOf("#", endOfProtocol);
  const questionIdx = url.indexOf("?", endOfProtocol);
  const queryStrIdx = questionIdx !== -1 && (hashIdx === -1 || questionIdx < hashIdx) ? questionIdx : -1;
  const pathEnd = hashIdx === -1 ? queryStrIdx === -1 ? url.length : queryStrIdx : queryStrIdx === -1 ? hashIdx : Math.min(hashIdx, queryStrIdx);
  const slashIdx = url.indexOf("/", endOfProtocol);
  const pathStart = slashIdx === -1 || slashIdx > pathEnd ? pathEnd : slashIdx;
  if (endOfProtocol === pathStart) {
    throw new TypeError("URL must contain a host");
  }
  return url.substring(pathStart, pathEnd);
}
var jsonObjectPreprocess = (val) => {
  if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};
var numberPreprocess = (val) => {
  if (typeof val === "string") {
    const number = Number(val);
    if (!Number.isNaN(number))
      return number;
  }
  return val;
};
function arrayEquivalent(a, b) {
  if (a === b)
    return true;
  return a.every(includedIn, b) && b.every(includedIn, a);
}
function includedIn(item) {
  return this.includes(item);
}
function asArray(value) {
  if (value == null)
    return void 0;
  if (Array.isArray(value))
    return value;
  return Array.from(value);
}
var isSpaceSeparatedValue = (value, input) => {
  if (value.length === 0)
    throw new TypeError("Value cannot be empty");
  if (value.includes(" "))
    throw new TypeError("Value cannot contain spaces");
  const inputLength = input.length;
  const valueLength = value.length;
  if (inputLength < valueLength)
    return false;
  let idx = input.indexOf(value);
  let idxEnd;
  while (idx !== -1) {
    idxEnd = idx + valueLength;
    if (
      // at beginning or preceded by space
      (idx === 0 || input.charCodeAt(idx - 1) === 32) && // at end or followed by space
      (idxEnd === inputLength || input.charCodeAt(idxEnd) === 32)
    ) {
      return true;
    }
    idx = input.indexOf(value, idxEnd + 1);
  }
  return false;
};

// node_modules/@atproto/oauth-types/dist/uri.js
var dangerousUriSchema = external_exports.string().refine((data) => data.includes(":") && canParseUrl(data), {
  message: "Invalid URL"
});
var loopbackUriSchema = dangerousUriSchema.superRefine((value, ctx) => {
  if (!value.startsWith("http://")) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'URL must use the "http:" protocol'
    });
    return false;
  }
  const url = new URL(value);
  if (!isLoopbackHost(url.hostname)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'URL must use "localhost", "127.0.0.1" or "[::1]" as hostname'
    });
    return false;
  }
  return true;
});
var httpsUriSchema = dangerousUriSchema.superRefine((value, ctx) => {
  if (!value.startsWith("https://")) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'URL must use the "https:" protocol'
    });
    return false;
  }
  const url = new URL(value);
  if (isLoopbackHost(url.hostname)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "https: URL must not use a loopback host"
    });
    return false;
  }
  if (isHostnameIP(url.hostname)) {
  } else {
    if (!url.hostname.includes(".")) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: "Domain name must contain at least two segments"
      });
      return false;
    }
    if (url.hostname.endsWith(".local")) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'Domain name must not end with ".local"'
      });
      return false;
    }
  }
  return true;
});
var webUriSchema = external_exports.string().superRefine((value, ctx) => {
  if (value.startsWith("http://")) {
    const result = loopbackUriSchema.safeParse(value);
    if (!result.success)
      result.error.issues.forEach(ctx.addIssue, ctx);
    return result.success;
  }
  if (value.startsWith("https://")) {
    const result = httpsUriSchema.safeParse(value);
    if (!result.success)
      result.error.issues.forEach(ctx.addIssue, ctx);
    return result.success;
  }
  ctx.addIssue({
    code: ZodIssueCode.custom,
    message: 'URL must use the "http:" or "https:" protocol'
  });
  return false;
});
var privateUseUriSchema = dangerousUriSchema.superRefine((value, ctx) => {
  const dotIdx = value.indexOf(".");
  const colonIdx = value.indexOf(":");
  if (dotIdx === -1 || colonIdx === -1 || dotIdx > colonIdx) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'Private-use URI scheme requires a "." as part of the protocol'
    });
    return false;
  }
  const url = new URL(value);
  if (!url.protocol.includes(".")) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "Invalid private-use URI scheme"
    });
    return false;
  }
  const uriScheme = url.protocol.slice(0, -1);
  const urlDomain = uriScheme.split(".").reverse().join(".");
  if (isLocalHostname(urlDomain)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Private-use URI Scheme redirect URI must not be a local hostname`
    });
  }
  if (url.href.startsWith(`${url.protocol}//`) || url.username || url.password || url.hostname || url.port) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "Private-Use URI Scheme must be in the form <scheme>:/{path} (notice the single slash!) as per RFC 8252"
    });
    return false;
  }
  return true;
});

// node_modules/@atproto/oauth-types/dist/atproto-loopback-client-redirect-uris.js
var DEFAULT_LOOPBACK_CLIENT_REDIRECT_URIS = Object.freeze([
  `http://127.0.0.1/`,
  `http://[::1]/`
]);

// node_modules/@atproto/oauth-types/dist/oauth-scope.js
var OAUTH_SCOPE_REGEXP = /^[\x21\x23-\x5B\x5D-\x7E]+(?: [\x21\x23-\x5B\x5D-\x7E]+)*$/;
var isOAuthScope = (input) => OAUTH_SCOPE_REGEXP.test(input);
var oauthScopeSchema = external_exports.string().refine(isOAuthScope, {
  message: "Invalid OAuth scope"
});

// node_modules/@atproto/oauth-types/dist/atproto-oauth-scope.js
var ATPROTO_SCOPE_VALUE = "atproto";
function isAtprotoOAuthScope(input) {
  return isOAuthScope(input) && isSpaceSeparatedValue(ATPROTO_SCOPE_VALUE, input);
}
function asAtprotoOAuthScope(input) {
  if (isAtprotoOAuthScope(input))
    return input;
  throw new TypeError(`Value must contain "${ATPROTO_SCOPE_VALUE}" scope value`);
}
function assertAtprotoOAuthScope(input) {
  void asAtprotoOAuthScope(input);
}
var atprotoOAuthScopeSchema = external_exports.string().refine(isAtprotoOAuthScope, {
  message: "Invalid ATProto OAuth scope"
});
var DEFAULT_ATPROTO_OAUTH_SCOPE = ATPROTO_SCOPE_VALUE;

// node_modules/@atproto/oauth-types/dist/oauth-client-id.js
var oauthClientIdSchema = external_exports.string().min(1);

// node_modules/@atproto/oauth-types/dist/oauth-redirect-uri.js
var loopbackRedirectURISchema = loopbackUriSchema.superRefine((value, ctx) => {
  if (value.startsWith("http://localhost")) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'Use of "localhost" hostname is not allowed (RFC 8252), use a loopback IP such as "127.0.0.1" instead'
    });
    return false;
  }
  return true;
});
var oauthLoopbackClientRedirectUriSchema = loopbackRedirectURISchema;
var oauthRedirectUriSchema = external_exports.string().superRefine((value, ctx) => {
  if (value.startsWith("https:")) {
    const result = httpsUriSchema.safeParse(value);
    if (!result.success)
      result.error.issues.forEach(ctx.addIssue, ctx);
    return result.success;
  } else if (value.startsWith("http:")) {
    const result = loopbackRedirectURISchema.safeParse(value);
    if (!result.success)
      result.error.issues.forEach(ctx.addIssue, ctx);
    return result.success;
  } else if (/^[^.:]+(?:\.[^.:]+)+:/.test(value)) {
    const result = privateUseUriSchema.safeParse(value);
    if (!result.success)
      result.error.issues.forEach(ctx.addIssue, ctx);
    return result.success;
  } else {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'URL must use the "https:" or "http:" protocol, or a private-use URI scheme (RFC 8252)'
    });
    return false;
  }
});

// node_modules/@atproto/oauth-types/dist/oauth-client-id-loopback.js
var LOOPBACK_CLIENT_ID_ORIGIN = "http://localhost";
var oauthClientIdLoopbackSchema = oauthClientIdSchema.superRefine((input, ctx) => {
  const result = safeParseOAuthLoopbackClientId(input);
  if (!result.success) {
    ctx.addIssue({ code: "custom", message: result.message });
  }
  return result.success;
});
function assertOAuthLoopbackClientId(input) {
  void parseOAuthLoopbackClientId(input);
}
function isOAuthClientIdLoopback(input) {
  return safeParseOAuthLoopbackClientId(input).success;
}
function asOAuthClientIdLoopback(input) {
  assertOAuthLoopbackClientId(input);
  return input;
}
function parseOAuthLoopbackClientId(input) {
  const result = safeParseOAuthLoopbackClientId(input);
  if (result.success)
    return result.value;
  throw new TypeError(`Invalid loopback client ID: ${result.message}`);
}
function safeParseOAuthLoopbackClientId(input) {
  if (!input.startsWith(LOOPBACK_CLIENT_ID_ORIGIN)) {
    return {
      success: false,
      message: `Value must start with "${LOOPBACK_CLIENT_ID_ORIGIN}"`
    };
  }
  if (input.includes("#", LOOPBACK_CLIENT_ID_ORIGIN.length)) {
    return {
      success: false,
      message: "Value must not contain a hash component"
    };
  }
  const queryStringIdx = input.length > LOOPBACK_CLIENT_ID_ORIGIN.length && input.charCodeAt(LOOPBACK_CLIENT_ID_ORIGIN.length) === 47 ? LOOPBACK_CLIENT_ID_ORIGIN.length + 1 : LOOPBACK_CLIENT_ID_ORIGIN.length;
  if (input.length !== queryStringIdx && input.charCodeAt(queryStringIdx) !== 63) {
    return {
      success: false,
      message: "Value must not contain a path component"
    };
  }
  const queryString = input.slice(queryStringIdx + 1);
  return safeParseOAuthLoopbackClientIdQueryString(queryString);
}
function safeParseOAuthLoopbackClientIdQueryString(input) {
  const params = {};
  const it = typeof input === "string" ? new URLSearchParams(input) : input;
  for (const [key, value] of it) {
    if (key === "scope") {
      if ("scope" in params) {
        return {
          success: false,
          message: 'Duplicate "scope" query parameter'
        };
      }
      const res = oauthScopeSchema.safeParse(value);
      if (!res.success) {
        const reason = res.error.issues.map((i) => i.message).join(", ");
        return {
          success: false,
          message: `Invalid "scope" query parameter: ${reason || "Validation failed"}`
        };
      }
      params.scope = res.data;
    } else if (key === "redirect_uri") {
      const res = oauthLoopbackClientRedirectUriSchema.safeParse(value);
      if (!res.success) {
        const reason = res.error.issues.map((i) => i.message).join(", ");
        return {
          success: false,
          message: `Invalid "redirect_uri" query parameter: ${reason || "Validation failed"}`
        };
      }
      if (params.redirect_uris == null)
        params.redirect_uris = [res.data];
      else
        params.redirect_uris.push(res.data);
    } else {
      return {
        success: false,
        message: `Unexpected query parameter "${key}"`
      };
    }
  }
  return {
    success: true,
    value: params
  };
}

// node_modules/@atproto/oauth-types/dist/atproto-loopback-client-id.js
function buildAtprotoLoopbackClientId(config) {
  if (config) {
    const params = new URLSearchParams();
    const { scope } = config;
    if (scope != null && scope !== DEFAULT_ATPROTO_OAUTH_SCOPE) {
      params.set("scope", asAtprotoOAuthScope(scope));
    }
    const redirectUris = asArray(config.redirect_uris);
    if (redirectUris && !arrayEquivalent(redirectUris, DEFAULT_LOOPBACK_CLIENT_REDIRECT_URIS)) {
      if (!redirectUris.length) {
        throw new TypeError(`Unexpected empty "redirect_uris" config`);
      }
      for (const uri of redirectUris) {
        params.append("redirect_uri", oauthLoopbackClientRedirectUriSchema.parse(uri));
      }
    }
    if (params.size) {
      return `${LOOPBACK_CLIENT_ID_ORIGIN}?${params.toString()}`;
    }
  }
  return LOOPBACK_CLIENT_ID_ORIGIN;
}
function parseAtprotoLoopbackClientId(clientId) {
  const { scope = DEFAULT_ATPROTO_OAUTH_SCOPE, redirect_uris } = parseOAuthLoopbackClientId(clientId);
  if (!isAtprotoOAuthScope(scope)) {
    throw new TypeError('ATProto Loopback ClientID must include "atproto" scope');
  }
  return {
    scope,
    redirect_uris: redirect_uris ?? [...DEFAULT_LOOPBACK_CLIENT_REDIRECT_URIS]
  };
}

// node_modules/@atproto/oauth-types/dist/atproto-loopback-client-metadata.js
function atprotoLoopbackClientMetadata(clientId) {
  const params = parseAtprotoLoopbackClientId(clientId);
  return buildMetadataInternal(clientId, params);
}
function buildAtprotoLoopbackClientMetadata(config) {
  const clientId = buildAtprotoLoopbackClientId(config);
  return buildMetadataInternal(clientId, parseAtprotoLoopbackClientId(clientId));
}
function buildMetadataInternal(clientId, clientParams) {
  return {
    client_id: clientId,
    scope: clientParams.scope,
    redirect_uris: clientParams.redirect_uris,
    response_types: ["code"],
    grant_types: ["authorization_code", "refresh_token"],
    token_endpoint_auth_method: "none",
    application_type: "native",
    dpop_bound_access_tokens: true
  };
}

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/lib/number.js
var ifNumber3 = (value) => typeof value === "number" ? value : void 0;

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/did-error.js
var DidError3 = class _DidError extends Error {
  constructor(did, message2, code, status = 400, cause) {
    super(message2, { cause });
    this.did = did;
    this.code = code;
    this.status = status;
  }
  /**
   * For compatibility with error handlers in common HTTP frameworks.
   */
  get statusCode() {
    return this.status;
  }
  toString() {
    return `${this.constructor.name} ${this.code} (${this.did}): ${this.message}`;
  }
  static from(cause, did) {
    if (cause instanceof _DidError) {
      return cause;
    }
    const message2 = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "An unknown error occurred";
    const status = typeof cause === "object" && cause != null ? ("statusCode" in cause ? ifNumber3(cause.statusCode) : void 0) ?? ("status" in cause ? ifNumber3(cause.status) : void 0) : void 0;
    return new _DidError(did, message2, "did-unknown-error", status, cause);
  }
};
var InvalidDidError3 = class extends DidError3 {
  constructor(did, message2, cause) {
    super(did, message2, "did-invalid", 400, cause);
  }
};

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/did.js
var DID_PREFIX3 = "did:";
var DID_PREFIX_LENGTH3 = DID_PREFIX3.length;
function assertDidMethod3(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError3(input, `Empty method name`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 48 || c > 57)) {
      throw new InvalidDidError3(input, `Invalid character at position ${i} in DID method name`);
    }
  }
}
function assertDidMsid3(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError3(input, `DID method-specific id must not be empty`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 65 || c > 90) && // A-Z
    (c < 48 || c > 57) && // 0-9
    c !== 46 && // .
    c !== 45 && // -
    c !== 95) {
      if (c === 58) {
        if (i === end - 1) {
          throw new InvalidDidError3(input, `DID cannot end with ":"`);
        }
        continue;
      }
      if (c === 37) {
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError3(input, `Invalid pct-encoded character at position ${i}`);
        }
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError3(input, `Invalid pct-encoded character at position ${i}`);
        }
        if (i >= end) {
          throw new InvalidDidError3(input, `Incomplete pct-encoded character at position ${i - 2}`);
        }
        continue;
      }
      throw new InvalidDidError3(input, `Disallowed character in DID at position ${i}`);
    }
  }
}
function assertDid3(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError3(typeof input, `DID must be a string`);
  }
  const { length } = input;
  if (length > 2048) {
    throw new InvalidDidError3(input, `DID is too long (2048 chars max)`);
  }
  if (!input.startsWith(DID_PREFIX3)) {
    throw new InvalidDidError3(input, `DID requires "${DID_PREFIX3}" prefix`);
  }
  const idSep = input.indexOf(":", DID_PREFIX_LENGTH3);
  if (idSep === -1) {
    throw new InvalidDidError3(input, `Missing colon after method name`);
  }
  assertDidMethod3(input, DID_PREFIX_LENGTH3, idSep);
  assertDidMsid3(input, idSep + 1, length);
}
var didSchema3 = external_exports.string().superRefine((value, ctx) => {
  try {
    assertDid3(value);
    return true;
  } catch (err) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: err instanceof Error ? err.message : "Unexpected error"
    });
    return false;
  }
});

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/lib/uri.js
function isFragment3(value, startIdx = 0, endIdx = value.length) {
  let charCode;
  for (let i = startIdx; i < endIdx; i++) {
    charCode = value.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122 || charCode >= 48 && charCode <= 57 || charCode === 45 || charCode === 46 || charCode === 95 || charCode === 126) {
    } else if (charCode === 33 || charCode === 36 || charCode === 38 || charCode === 39 || charCode === 40 || charCode === 41 || charCode === 42 || charCode === 43 || charCode === 44 || charCode === 59 || charCode === 61) {
    } else if (charCode === 58 || charCode === 64) {
    } else if (charCode === 47 || charCode === 63) {
    } else if (charCode === 37) {
      if (i + 2 >= endIdx)
        return false;
      if (!isHexDigit3(value.charCodeAt(i + 1)))
        return false;
      if (!isHexDigit3(value.charCodeAt(i + 2)))
        return false;
      i += 2;
    } else {
      return false;
    }
  }
  return true;
}
function isHexDigit3(code) {
  return code >= 48 && code <= 57 || // 0-9
  code >= 65 && code <= 70 || // A-F
  code >= 97 && code <= 102;
}
var canParse3 = URL.canParse?.bind(URL) ?? ((url, base) => {
  try {
    new URL(url, base);
    return true;
  } catch {
    return false;
  }
});

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/methods/plc.js
var DID_PLC_PREFIX3 = `did:plc:`;
var DID_PLC_PREFIX_LENGTH3 = DID_PLC_PREFIX3.length;
var DID_PLC_LENGTH3 = 32;
function isDidPlc3(input) {
  if (typeof input !== "string")
    return false;
  if (input.length !== DID_PLC_LENGTH3)
    return false;
  if (!input.startsWith(DID_PLC_PREFIX3))
    return false;
  for (let i = DID_PLC_PREFIX_LENGTH3; i < DID_PLC_LENGTH3; i++) {
    if (!isBase32Char3(input.charCodeAt(i)))
      return false;
  }
  return true;
}
var isBase32Char3 = (c) => c >= 97 && c <= 122 || c >= 50 && c <= 55;

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/methods/web.js
var DID_WEB_PREFIX3 = `did:web:`;
function isDidWeb3(input) {
  if (typeof input !== "string")
    return false;
  if (!input.startsWith(DID_WEB_PREFIX3))
    return false;
  if (input.charAt(DID_WEB_PREFIX3.length) === ":")
    return false;
  try {
    assertDidMsid3(input, DID_WEB_PREFIX3.length);
  } catch {
    return false;
  }
  return canParse3(buildDidWebUrl3(input));
}
function buildDidWebUrl3(did) {
  const hostIdx = DID_WEB_PREFIX3.length;
  const pathIdx = did.indexOf(":", hostIdx);
  const hostEnc = pathIdx === -1 ? did.slice(hostIdx) : did.slice(hostIdx, pathIdx);
  const host = hostEnc.replaceAll("%3A", ":");
  const path = pathIdx === -1 ? "" : did.slice(pathIdx).replaceAll(":", "/");
  const proto = host.startsWith("localhost") && (host.length === 9 || host.charCodeAt(9) === 58) ? "http" : "https";
  return `${proto}://${host}${path}`;
}

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/atproto.js
var atprotoDidSchema3 = external_exports.string().refine(isAtprotoDid3, `Atproto only allows "plc" and "web" DID methods`);
function isAtprotoDid3(input) {
  return isDidPlc3(input) || isAtprotoDidWeb3(input);
}
function isAtprotoDidWeb3(input) {
  if (!isDidWeb3(input)) {
    return false;
  }
  if (isDidWebWithPath3(input)) {
    return false;
  }
  if (isDidWebWithHttpsPort3(input)) {
    return false;
  }
  return true;
}
function isDidWebWithPath3(did) {
  return did.includes(":", DID_WEB_PREFIX3.length);
}
function isLocalhostDid3(did) {
  return did === "did:web:localhost" || did.startsWith("did:web:localhost:") || did.startsWith("did:web:localhost%3A");
}
function isDidWebWithHttpsPort3(did) {
  if (isLocalhostDid3(did))
    return false;
  const pathIdx = did.indexOf(":", DID_WEB_PREFIX3.length);
  const hasPort = pathIdx === -1 ? (
    // No path component, check if there's a port separator anywhere after
    // the "did:web:" prefix
    did.includes("%3A", DID_WEB_PREFIX3.length)
  ) : (
    // There is a path component; if there is an encoded colon *before* it,
    // then there is a port number
    did.lastIndexOf("%3A", pathIdx) !== -1
  );
  return hasPort;
}
var ATPROTO_VERIFICATION_METHOD_TYPES3 = Object.freeze([
  "EcdsaSecp256r1VerificationKey2019",
  "EcdsaSecp256k1VerificationKey2019",
  "Multikey"
]);

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/dist/did-document.js
var rfc3968UriSchema3 = external_exports.string().url("RFC3968 compliant URI");
var didControllerSchema3 = external_exports.union([didSchema3, external_exports.array(didSchema3)]);
var didRelativeUriSchema3 = external_exports.union([
  rfc3968UriSchema3.refine((value) => {
    const fragmentIndex = value.indexOf("#");
    if (fragmentIndex === -1)
      return false;
    return isFragment3(value, fragmentIndex + 1);
  }, {
    message: "Missing or invalid fragment in RFC3968 URI"
  }),
  external_exports.string().refine((value) => value.charCodeAt(0) === 35, {
    message: "Fragment must start with #"
  }).refine((value) => isFragment3(value, 1), {
    message: "Invalid char in URI fragment"
  })
]);
var didVerificationMethodSchema3 = external_exports.object({
  id: didRelativeUriSchema3,
  type: external_exports.string().min(1),
  controller: didControllerSchema3,
  publicKeyJwk: external_exports.record(external_exports.string(), external_exports.unknown()).optional(),
  publicKeyMultibase: external_exports.string().optional()
});
var didServiceIdSchema3 = didRelativeUriSchema3;
var didServiceTypeSchema3 = external_exports.union([external_exports.string(), external_exports.array(external_exports.string())]);
var didServiceEndpointSchema3 = external_exports.union([
  rfc3968UriSchema3,
  external_exports.record(external_exports.string(), rfc3968UriSchema3),
  external_exports.array(external_exports.union([rfc3968UriSchema3, external_exports.record(external_exports.string(), rfc3968UriSchema3)])).nonempty()
]);
var didServiceSchema3 = external_exports.object({
  id: didServiceIdSchema3,
  type: didServiceTypeSchema3,
  serviceEndpoint: didServiceEndpointSchema3
});
var verificationMethodReference3 = external_exports.union([
  //
  didRelativeUriSchema3,
  didVerificationMethodSchema3
]);
var didDocumentSchema3 = external_exports.object({
  "@context": external_exports.union([
    external_exports.literal("https://www.w3.org/ns/did/v1"),
    external_exports.array(external_exports.string().url()).nonempty().refine((data) => data[0] === "https://www.w3.org/ns/did/v1", {
      message: "First @context must be https://www.w3.org/ns/did/v1"
    })
  ]).optional(),
  id: didSchema3,
  controller: didControllerSchema3.optional(),
  alsoKnownAs: external_exports.array(rfc3968UriSchema3).optional(),
  service: external_exports.array(didServiceSchema3).optional(),
  authentication: external_exports.array(verificationMethodReference3).optional(),
  verificationMethod: external_exports.array(didVerificationMethodSchema3).optional()
});
var didDocumentValidator3 = didDocumentSchema3.superRefine(({ id: did, service }, ctx) => {
  if (service) {
    const visited = /* @__PURE__ */ new Set();
    for (let i = 0; i < service.length; i++) {
      const current = service[i];
      const serviceId = current.id.startsWith("#") ? `${did}${current.id}` : current.id;
      if (!visited.has(serviceId)) {
        visited.add(serviceId);
      } else {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          message: `Duplicate service id (${current.id}) found in the document`,
          path: ["service", i, "id"]
        });
      }
    }
  }
});

// node_modules/@atproto/oauth-types/dist/oauth-authorization-details.js
var oauthAuthorizationDetailSchema = external_exports.object({
  type: external_exports.string(),
  /**
   * An array of strings representing the location of the resource or RS. These
   * strings are typically URIs identifying the location of the RS.
   */
  locations: external_exports.array(dangerousUriSchema).optional(),
  /**
   * An array of strings representing the kinds of actions to be taken at the
   * resource.
   */
  actions: external_exports.array(external_exports.string()).optional(),
  /**
   * An array of strings representing the kinds of data being requested from the
   * resource.
   */
  datatypes: external_exports.array(external_exports.string()).optional(),
  /**
   * A string identifier indicating a specific resource available at the API.
   */
  identifier: external_exports.string().optional(),
  /**
   * An array of strings representing the types or levels of privilege being
   * requested at the resource.
   */
  privileges: external_exports.array(external_exports.string()).optional()
});
var oauthAuthorizationDetailsSchema = external_exports.array(oauthAuthorizationDetailSchema);

// node_modules/@atproto/oauth-types/dist/oauth-token-type.js
var oauthTokenTypeSchema = external_exports.union([
  external_exports.string().regex(/^DPoP$/i).transform(() => "DPoP"),
  external_exports.string().regex(/^Bearer$/i).transform(() => "Bearer")
]);

// node_modules/@atproto/oauth-types/dist/oauth-token-response.js
var oauthTokenResponseSchema = external_exports.object({
  // https://www.rfc-editor.org/rfc/rfc6749.html#section-5.1
  access_token: external_exports.string(),
  token_type: oauthTokenTypeSchema,
  scope: external_exports.string().optional(),
  refresh_token: external_exports.string().optional(),
  expires_in: external_exports.number().optional(),
  // https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
  id_token: signedJwtSchema.optional(),
  // https://datatracker.ietf.org/doc/html/rfc9396#name-enriched-authorization-deta
  authorization_details: oauthAuthorizationDetailsSchema.optional()
}).passthrough();

// node_modules/@atproto/oauth-types/dist/atproto-oauth-token-response.js
var atprotoOAuthTokenResponseSchema = oauthTokenResponseSchema.extend({
  token_type: external_exports.literal("DPoP"),
  sub: atprotoDidSchema3,
  scope: atprotoOAuthScopeSchema,
  // OpenID is not compatible with atproto identities
  id_token: external_exports.never().optional()
});

// node_modules/@atproto/oauth-types/dist/oauth-access-token.js
var oauthAccessTokenSchema = external_exports.string().min(1);

// node_modules/@atproto/oauth-types/dist/oauth-authorization-code-grant-token-request.js
var oauthAuthorizationCodeGrantTokenRequestSchema = external_exports.object({
  grant_type: external_exports.literal("authorization_code"),
  code: external_exports.string().min(1),
  redirect_uri: oauthRedirectUriSchema,
  /** @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1} */
  code_verifier: external_exports.string().min(43).max(128).regex(/^[a-zA-Z0-9-._~]+$/).optional()
});

// node_modules/@atproto/oauth-types/dist/oauth-authorization-request-jar.js
var oauthAuthorizationRequestJarSchema = external_exports.object({
  /**
   * AuthorizationRequest inside a JWT:
   * - "iat" is required and **MUST** be less than one minute
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc9101}
   */
  request: external_exports.union([signedJwtSchema, unsignedJwtSchema])
});

// node_modules/@atproto/oauth-types/dist/oauth-code-challenge-method.js
var oauthCodeChallengeMethodSchema = external_exports.enum(["S256", "plain"]);

// node_modules/@atproto/oauth-types/dist/oauth-prompt-mode.js
var oauthPromptModeSchema = external_exports.enum([
  "none",
  "login",
  "consent",
  "select_account",
  "create"
]);

// node_modules/@atproto/oauth-types/dist/oauth-response-mode.js
var oauthResponseModeSchema = external_exports.enum([
  "query",
  "fragment",
  "form_post"
]);

// node_modules/@atproto/oauth-types/dist/oauth-response-type.js
var oauthResponseTypeSchema = external_exports.enum([
  // OAuth2 (https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10#section-4.1.1)
  "code",
  // Authorization Code Grant
  "token",
  // Implicit Grant
  // OIDC (https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)
  "none",
  "code id_token token",
  "code id_token",
  "code token",
  "id_token token",
  "id_token"
]);

// node_modules/@atproto/oauth-types/dist/oidc-claims-parameter.js
var oidcClaimsParameterSchema = external_exports.enum([
  // https://openid.net/specs/openid-provider-authentication-policy-extension-1_0.html#rfc.section.5.2
  // if client metadata "require_auth_time" is true, this *must* be provided
  "auth_time",
  // OIDC
  "nonce",
  "acr",
  // OpenID: "profile" scope
  "name",
  "family_name",
  "given_name",
  "middle_name",
  "nickname",
  "preferred_username",
  "gender",
  "picture",
  "profile",
  "website",
  "birthdate",
  "zoneinfo",
  "locale",
  "updated_at",
  // OpenID: "email" scope
  "email",
  "email_verified",
  // OpenID: "phone" scope
  "phone_number",
  "phone_number_verified",
  // OpenID: "address" scope
  "address"
]);

// node_modules/@atproto/oauth-types/dist/oidc-claims-properties.js
var oidcClaimsValueSchema = external_exports.union([external_exports.string(), external_exports.number(), external_exports.boolean()]);
var oidcClaimsPropertiesSchema = external_exports.object({
  essential: external_exports.boolean().optional(),
  value: oidcClaimsValueSchema.optional(),
  values: external_exports.array(oidcClaimsValueSchema).optional()
});

// node_modules/@atproto/oauth-types/dist/oidc-entity-type.js
var oidcEntityTypeSchema = external_exports.enum(["userinfo", "id_token"]);

// node_modules/@atproto/oauth-types/dist/oauth-authorization-request-parameters.js
var oauthAuthorizationRequestParametersSchema = external_exports.object({
  client_id: oauthClientIdSchema,
  state: external_exports.string().optional(),
  redirect_uri: oauthRedirectUriSchema.optional(),
  scope: oauthScopeSchema.optional(),
  response_type: oauthResponseTypeSchema,
  // PKCE
  // https://datatracker.ietf.org/doc/html/rfc7636#section-4.3
  code_challenge: external_exports.string().optional(),
  code_challenge_method: oauthCodeChallengeMethodSchema.optional(),
  // DPOP
  // https://datatracker.ietf.org/doc/html/rfc9449#section-12.3
  dpop_jkt: external_exports.string().optional(),
  // OIDC
  // Default depend on response_type
  response_mode: oauthResponseModeSchema.optional(),
  nonce: external_exports.string().optional(),
  // Specifies the allowable elapsed time in seconds since the last time the
  // End-User was actively authenticated by the OP. If the elapsed time is
  // greater than this value, the OP MUST attempt to actively re-authenticate
  // the End-User. (The max_age request parameter corresponds to the OpenID 2.0
  // PAPE [OpenID.PAPE] max_auth_age request parameter.) When max_age is used,
  // the ID Token returned MUST include an auth_time Claim Value. Note that
  // max_age=0 is equivalent to prompt=login.
  max_age: external_exports.preprocess(numberPreprocess, external_exports.number().int().min(0)).optional(),
  claims: external_exports.preprocess(jsonObjectPreprocess, external_exports.record(oidcEntityTypeSchema, external_exports.record(oidcClaimsParameterSchema, external_exports.union([external_exports.literal(null), oidcClaimsPropertiesSchema])))).optional(),
  // https://openid.net/specs/openid-connect-core-1_0.html#RegistrationParameter
  // Not supported by this library (yet?)
  // registration: clientMetadataSchema.optional(),
  login_hint: external_exports.string().min(1).optional(),
  ui_locales: external_exports.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?( [a-z]{2,3}(-[A-Z]{2})?)*$/).optional(),
  // Previous ID Token, should be provided when prompt=none is used
  id_token_hint: signedJwtSchema.optional(),
  // Type of UI the AS is displayed on
  display: external_exports.enum(["page", "popup", "touch", "wap"]).optional(),
  // How the AS should prompt the user for authorization:
  prompt: oauthPromptModeSchema.optional(),
  // https://datatracker.ietf.org/doc/html/rfc9396
  authorization_details: external_exports.preprocess(jsonObjectPreprocess, oauthAuthorizationDetailsSchema).optional()
});

// node_modules/@atproto/oauth-types/dist/oauth-authorization-request-par.js
var oauthAuthorizationRequestParSchema = external_exports.union([
  oauthAuthorizationRequestParametersSchema,
  oauthAuthorizationRequestJarSchema
]);

// node_modules/@atproto/oauth-types/dist/oauth-request-uri.js
var oauthRequestUriSchema = external_exports.string().min(1);

// node_modules/@atproto/oauth-types/dist/oauth-authorization-request-uri.js
var oauthAuthorizationRequestUriSchema = external_exports.object({
  request_uri: oauthRequestUriSchema
});

// node_modules/@atproto/oauth-types/dist/oauth-authorization-request-query.js
var oauthAuthorizationRequestQuerySchema = external_exports.intersection(external_exports.object({
  // REQUIRED. OAuth 2.0 [RFC6749] client_id.
  client_id: oauthClientIdSchema
}), external_exports.union([
  oauthAuthorizationRequestParametersSchema,
  oauthAuthorizationRequestJarSchema,
  oauthAuthorizationRequestUriSchema
]));

// node_modules/@atproto/oauth-types/dist/oauth-authorization-response-error.js
var oauthAuthorizationResponseErrorSchema = external_exports.enum([
  // The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed.
  "invalid_request",
  // The client is not authorized to request an authorization code using this method.
  "unauthorized_client",
  // The resource owner or authorization server denied the request.
  "access_denied",
  // The authorization server does not support obtaining an authorization code using this method.
  "unsupported_response_type",
  // The requested scope is invalid, unknown, or malformed.
  "invalid_scope",
  // The authorization server encountered an unexpected condition that prevented it from fulfilling the request. (This error code is needed because a 500 Internal Server Error HTTP status code cannot be returned to the client via an HTTP redirect.)
  "server_error",
  // The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server. (This error code is needed because a 503 Service Unavailable HTTP status code cannot be returned to the client via an HTTP redirect.)
  "temporarily_unavailable"
]);

// node_modules/@atproto/oauth-types/dist/oauth-issuer-identifier.js
var oauthIssuerIdentifierSchema = webUriSchema.superRefine((value, ctx) => {
  if (value.endsWith("/")) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Issuer URL must not end with a slash"
    });
    return false;
  }
  const url = new URL(value);
  if (url.username || url.password) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Issuer URL must not contain a username or password"
    });
    return false;
  }
  if (url.hash || url.search) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Issuer URL must not contain a query or fragment"
    });
    return false;
  }
  const canonicalValue = url.pathname === "/" ? url.origin : url.href;
  if (value !== canonicalValue) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Issuer URL must be in the canonical form"
    });
    return false;
  }
  return true;
});

// node_modules/@atproto/oauth-types/dist/oauth-authorization-server-metadata.js
var oauthAuthorizationServerMetadataSchema = external_exports.object({
  issuer: oauthIssuerIdentifierSchema,
  claims_supported: external_exports.array(external_exports.string()).optional(),
  claims_locales_supported: external_exports.array(external_exports.string()).optional(),
  claims_parameter_supported: external_exports.boolean().optional(),
  request_parameter_supported: external_exports.boolean().optional(),
  request_uri_parameter_supported: external_exports.boolean().optional(),
  require_request_uri_registration: external_exports.boolean().optional(),
  scopes_supported: external_exports.array(external_exports.string()).optional(),
  subject_types_supported: external_exports.array(external_exports.string()).optional(),
  response_types_supported: external_exports.array(external_exports.string()).optional(),
  response_modes_supported: external_exports.array(external_exports.string()).optional(),
  grant_types_supported: external_exports.array(external_exports.string()).optional(),
  code_challenge_methods_supported: external_exports.array(oauthCodeChallengeMethodSchema).min(1).optional(),
  ui_locales_supported: external_exports.array(external_exports.string()).optional(),
  id_token_signing_alg_values_supported: external_exports.array(external_exports.string()).optional(),
  display_values_supported: external_exports.array(external_exports.string()).optional(),
  request_object_signing_alg_values_supported: external_exports.array(external_exports.string()).optional(),
  authorization_response_iss_parameter_supported: external_exports.boolean().optional(),
  authorization_details_types_supported: external_exports.array(external_exports.string()).optional(),
  request_object_encryption_alg_values_supported: external_exports.array(external_exports.string()).optional(),
  request_object_encryption_enc_values_supported: external_exports.array(external_exports.string()).optional(),
  jwks_uri: webUriSchema.optional(),
  authorization_endpoint: webUriSchema,
  // .optional(),
  token_endpoint: webUriSchema,
  // .optional(),
  // https://www.rfc-editor.org/rfc/rfc8414.html#section-2
  token_endpoint_auth_methods_supported: external_exports.array(external_exports.string()).default(["client_secret_basic"]),
  token_endpoint_auth_signing_alg_values_supported: external_exports.array(external_exports.string()).optional(),
  revocation_endpoint: webUriSchema.optional(),
  introspection_endpoint: webUriSchema.optional(),
  pushed_authorization_request_endpoint: webUriSchema.optional(),
  require_pushed_authorization_requests: external_exports.boolean().optional(),
  userinfo_endpoint: webUriSchema.optional(),
  end_session_endpoint: webUriSchema.optional(),
  registration_endpoint: webUriSchema.optional(),
  // https://datatracker.ietf.org/doc/html/rfc9449#section-5.1
  dpop_signing_alg_values_supported: external_exports.array(external_exports.string()).optional(),
  // https://www.rfc-editor.org/rfc/rfc9728.html#section-4
  protected_resources: external_exports.array(webUriSchema).optional(),
  // https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-00.html
  client_id_metadata_document_supported: external_exports.boolean().optional(),
  // https://openid.net/specs/openid-connect-prompt-create-1_0.html#section-4.2
  prompt_values_supported: external_exports.array(oauthPromptModeSchema).optional()
});
var oauthAuthorizationServerMetadataValidator = oauthAuthorizationServerMetadataSchema.superRefine((data, ctx) => {
  if (data.require_pushed_authorization_requests && !data.pushed_authorization_request_endpoint) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: '"pushed_authorization_request_endpoint" required when "require_pushed_authorization_requests" is true'
    });
  }
}).superRefine((data, ctx) => {
  if (data.response_types_supported) {
    if (!data.response_types_supported.includes("code")) {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        message: 'Response type "code" is required'
      });
    }
  }
}).superRefine((data, ctx) => {
  if (data.token_endpoint_auth_signing_alg_values_supported?.includes("none")) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: 'Client authentication method "none" is not allowed'
    });
  }
});

// node_modules/@atproto/oauth-types/dist/oauth-client-credentials-grant-token-request.js
var oauthClientCredentialsGrantTokenRequestSchema = external_exports.object({
  grant_type: external_exports.literal("client_credentials")
});

// node_modules/@atproto/oauth-types/dist/oauth-client-credentials.js
var oauthClientCredentialsJwtBearerSchema = external_exports.object({
  client_id: oauthClientIdSchema,
  client_assertion_type: external_exports.literal(CLIENT_ASSERTION_TYPE_JWT_BEARER),
  /**
   * - "sub" the subject MUST be the "client_id" of the OAuth client
   * - "iat" is required and MUST be less than one minute
   * - "aud" must containing a value that identifies the authorization server
   * - The JWT MAY contain a "jti" (JWT ID) claim that provides a unique identifier for the token.
   * - Note that the authorization server may reject JWTs with an "exp" claim value that is unreasonably far in the future.
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc7523#section-3}
   */
  client_assertion: signedJwtSchema
});
var oauthClientCredentialsSecretPostSchema = external_exports.object({
  client_id: oauthClientIdSchema,
  client_secret: external_exports.string()
});
var oauthClientCredentialsNoneSchema = external_exports.object({
  client_id: oauthClientIdSchema
});
var oauthClientCredentialsSchema = external_exports.union([
  oauthClientCredentialsJwtBearerSchema,
  oauthClientCredentialsSecretPostSchema,
  // Must be last since it is less specific
  oauthClientCredentialsNoneSchema
]);

// node_modules/@atproto/oauth-types/dist/oauth-client-id-discoverable.js
var oauthClientIdDiscoverableSchema = external_exports.intersection(oauthClientIdSchema, httpsUriSchema).superRefine((value, ctx) => {
  const url = new URL(value);
  if (url.username || url.password) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "ClientID must not contain credentials"
    });
    return false;
  }
  if (url.hash) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "ClientID must not contain a fragment"
    });
    return false;
  }
  if (url.pathname === "/") {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: 'ClientID must contain a path component (e.g. "/client-metadata.json")'
    });
    return false;
  }
  if (url.pathname.endsWith("/")) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "ClientID path must not end with a trailing slash"
    });
    return false;
  }
  if (isHostnameIP(url.hostname)) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "ClientID hostname must not be an IP address"
    });
    return false;
  }
  if (extractUrlPath(value) !== url.pathname) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: `ClientID must be in canonical form ("${url.href}", got "${value}")`
    });
    return false;
  }
  return true;
});
function isOAuthClientIdDiscoverable(clientId) {
  return oauthClientIdDiscoverableSchema.safeParse(clientId).success;
}
var conventionalOAuthClientIdSchema = oauthClientIdDiscoverableSchema.superRefine((value, ctx) => {
  const url = new URL(value);
  if (url.port) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "ClientID must not contain a port"
    });
    return false;
  }
  if (url.search) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "ClientID must not contain a query string"
    });
    return false;
  }
  if (url.pathname !== "/oauth-client-metadata.json") {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: 'ClientID must be "/oauth-client-metadata.json"'
    });
    return false;
  }
  return true;
});
function isConventionalOAuthClientId(clientId) {
  return conventionalOAuthClientIdSchema.safeParse(clientId).success;
}
function assertOAuthDiscoverableClientId(value) {
  void oauthClientIdDiscoverableSchema.parse(value);
}
function parseOAuthDiscoverableClientId(clientId) {
  return new URL(oauthClientIdDiscoverableSchema.parse(clientId));
}

// node_modules/@atproto/oauth-types/dist/oauth-endpoint-auth-method.js
var oauthEndpointAuthMethod = external_exports.enum([
  "client_secret_basic",
  "client_secret_jwt",
  "client_secret_post",
  "none",
  "private_key_jwt",
  "self_signed_tls_client_auth",
  "tls_client_auth"
]);

// node_modules/@atproto/oauth-types/dist/oauth-grant-type.js
var oauthGrantTypeSchema = external_exports.enum([
  "authorization_code",
  "implicit",
  "refresh_token",
  "password",
  // Not part of OAuth 2.1
  "client_credentials",
  "urn:ietf:params:oauth:grant-type:jwt-bearer",
  "urn:ietf:params:oauth:grant-type:saml2-bearer"
]);

// node_modules/@atproto/oauth-types/dist/oauth-client-metadata.js
var oauthClientMetadataSchema = external_exports.object({
  /**
   * @note redirect_uris require additional validation
   */
  // https://www.rfc-editor.org/rfc/rfc7591.html#section-2
  redirect_uris: external_exports.array(oauthRedirectUriSchema).nonempty(),
  response_types: external_exports.array(oauthResponseTypeSchema).nonempty().default(["code"]),
  grant_types: external_exports.array(oauthGrantTypeSchema).nonempty().default(["authorization_code"]),
  scope: oauthScopeSchema.optional(),
  // https://www.rfc-editor.org/rfc/rfc7591.html#section-2
  token_endpoint_auth_method: oauthEndpointAuthMethod.default("client_secret_basic"),
  token_endpoint_auth_signing_alg: external_exports.string().optional(),
  userinfo_signed_response_alg: external_exports.string().optional(),
  userinfo_encrypted_response_alg: external_exports.string().optional(),
  jwks_uri: webUriSchema.optional(),
  jwks: jwksPubSchema.optional(),
  application_type: external_exports.enum(["web", "native"]).default("web"),
  // default, per spec, is "web"
  subject_type: external_exports.enum(["public", "pairwise"]).default("public"),
  request_object_signing_alg: external_exports.string().optional(),
  id_token_signed_response_alg: external_exports.string().optional(),
  authorization_signed_response_alg: external_exports.string().default("RS256"),
  authorization_encrypted_response_enc: external_exports.enum(["A128CBC-HS256"]).optional(),
  authorization_encrypted_response_alg: external_exports.string().optional(),
  client_id: oauthClientIdSchema.optional(),
  client_name: external_exports.string().optional(),
  client_uri: webUriSchema.optional(),
  policy_uri: webUriSchema.optional(),
  tos_uri: webUriSchema.optional(),
  logo_uri: webUriSchema.optional(),
  // @TODO: allow data: uri ?
  /**
   * Default Maximum Authentication Age. Specifies that the End-User MUST be
   * actively authenticated if the End-User was authenticated longer ago than
   * the specified number of seconds. The max_age request parameter overrides
   * this default value. If omitted, no default Maximum Authentication Age is
   * specified.
   */
  default_max_age: external_exports.number().optional(),
  require_auth_time: external_exports.boolean().optional(),
  contacts: external_exports.array(external_exports.string().email()).optional(),
  tls_client_certificate_bound_access_tokens: external_exports.boolean().optional(),
  // https://datatracker.ietf.org/doc/html/rfc9449#section-5.2
  dpop_bound_access_tokens: external_exports.boolean().optional(),
  // https://datatracker.ietf.org/doc/html/rfc9396#section-14.5
  authorization_details_types: external_exports.array(external_exports.string()).optional()
});

// node_modules/@atproto/oauth-types/dist/oauth-endpoint-name.js
var OAUTH_ENDPOINT_NAMES = [
  "token",
  "revocation",
  "introspection",
  "pushed_authorization_request"
];

// node_modules/@atproto/oauth-types/dist/oauth-par-response.js
var oauthParResponseSchema = external_exports.object({
  request_uri: external_exports.string(),
  expires_in: external_exports.number().int().positive()
});

// node_modules/@atproto/oauth-types/dist/oauth-password-grant-token-request.js
var oauthPasswordGrantTokenRequestSchema = external_exports.object({
  grant_type: external_exports.literal("password"),
  username: external_exports.string(),
  password: external_exports.string()
});

// node_modules/@atproto/oauth-types/dist/oauth-protected-resource-metadata.js
var oauthProtectedResourceMetadataSchema = external_exports.object({
  /**
   * REQUIRED. The protected resource's resource identifier, which is a URL that
   * uses the https scheme and has no query or fragment components. Using these
   * well-known resources is described in Section 3.
   *
   * @note This schema allows non https URLs for testing & development purposes.
   * Make sure to validate the URL before using it in a production environment.
   */
  resource: webUriSchema.refine((url) => !url.includes("?"), {
    message: "Resource URL must not contain query parameters"
  }).refine((url) => !url.includes("#"), {
    message: "Resource URL must not contain a fragment"
  }),
  /**
   * OPTIONAL. JSON array containing a list of OAuth authorization server issuer
   * identifiers, as defined in [RFC8414], for authorization servers that can be
   * used with this protected resource. Protected resources MAY choose not to
   * advertise some supported authorization servers even when this parameter is
   * used. In some use cases, the set of authorization servers will not be
   * enumerable, in which case this metadata parameter would not be used.
   */
  authorization_servers: external_exports.array(oauthIssuerIdentifierSchema).optional(),
  /**
   * OPTIONAL. URL of the protected resource's JWK Set [JWK] document. This
   * contains public keys belonging to the protected resource, such as signing
   * key(s) that the resource server uses to sign resource responses. This URL
   * MUST use the https scheme. When both signing and encryption keys are made
   * available, a use (public key use) parameter value is REQUIRED for all keys
   * in the referenced JWK Set to indicate each key's intended usage.
   */
  jwks_uri: webUriSchema.optional(),
  /**
   * RECOMMENDED. JSON array containing a list of the OAuth 2.0 [RFC6749] scope
   * values that are used in authorization requests to request access to this
   * protected resource. Protected resources MAY choose not to advertise some
   * scope values supported even when this parameter is used.
   */
  scopes_supported: external_exports.array(external_exports.string()).optional(),
  /**
   * OPTIONAL. JSON array containing a list of the supported methods of sending
   * an OAuth 2.0 Bearer Token [RFC6750] to the protected resource. Defined
   * values are ["header", "body", "query"], corresponding to Sections 2.1, 2.2,
   * and 2.3 of RFC 6750.
   */
  bearer_methods_supported: external_exports.array(external_exports.enum(["header", "body", "query"])).optional(),
  /**
   * OPTIONAL. JSON array containing a list of the JWS [JWS] signing algorithms
   * (alg values) [JWA] supported by the protected resource for signing resource
   * responses, for instance, as described in [FAPI.MessageSigning]. No default
   * algorithms are implied if this entry is omitted. The value none MUST NOT be
   * used.
   */
  resource_signing_alg_values_supported: external_exports.array(external_exports.string()).optional(),
  /**
   * OPTIONAL. URL of a page containing human-readable information that
   * developers might want or need to know when using the protected resource
   */
  resource_documentation: webUriSchema.optional(),
  /**
   * OPTIONAL. URL that the protected resource provides to read about the
   * protected resource's requirements on how the client can use the data
   * provided by the protected resource
   */
  resource_policy_uri: webUriSchema.optional(),
  /**
   * OPTIONAL. URL that the protected resource provides to read about the
   * protected resource's terms of service
   */
  resource_tos_uri: webUriSchema.optional()
});

// node_modules/@atproto/oauth-types/dist/oauth-refresh-token.js
var oauthRefreshTokenSchema = external_exports.string().min(1);

// node_modules/@atproto/oauth-types/dist/oauth-refresh-token-grant-token-request.js
var oauthRefreshTokenGrantTokenRequestSchema = external_exports.object({
  grant_type: external_exports.literal("refresh_token"),
  refresh_token: oauthRefreshTokenSchema
});

// node_modules/@atproto/oauth-types/dist/oauth-token-identification.js
var oauthTokenIdentificationSchema = external_exports.object({
  token: external_exports.union([oauthAccessTokenSchema, oauthRefreshTokenSchema]),
  token_type_hint: external_exports.enum(["access_token", "refresh_token"]).optional()
});

// node_modules/@atproto/oauth-types/dist/oauth-token-request.js
var oauthTokenRequestSchema = external_exports.discriminatedUnion("grant_type", [
  oauthAuthorizationCodeGrantTokenRequestSchema,
  oauthRefreshTokenGrantTokenRequestSchema,
  oauthPasswordGrantTokenRequestSchema,
  oauthClientCredentialsGrantTokenRequestSchema
]);

// node_modules/@atproto/oauth-types/dist/oidc-authorization-error-response.js
var oidcAuthorizationResponseErrorSchema = external_exports.enum([
  // The Authorization Server requires End-User interaction of some form to proceed. This error MAY be returned when the prompt parameter value in the Authentication Request is none, but the Authentication Request cannot be completed without displaying a user interface for End-User interaction.
  "interaction_required",
  // The Authorization Server requires End-User authentication. This error MAY be returned when the prompt parameter value in the Authentication Request is none, but the Authentication Request cannot be completed without displaying a user interface for End-User authentication.
  "login_required",
  // The End-User is REQUIRED to select a session at the Authorization Server. The End-User MAY be authenticated at the Authorization Server with different associated accounts, but the End-User did not select a session. This error MAY be returned when the prompt parameter value in the Authentication Request is none, but the Authentication Request cannot be completed without displaying a user interface to prompt for a session to use.
  "account_selection_required",
  // The Authorization Server requires End-User consent. This error MAY be returned when the prompt parameter value in the Authentication Request is none, but the Authentication Request cannot be completed without displaying a user interface for End-User consent.
  "consent_required",
  // The request_uri in the Authorization Request returns an error or contains invalid data.
  "invalid_request_uri",
  // The request parameter contains an invalid Request Object.
  "invalid_request_object",
  // The OP does not support use of the request parameter defined in Section 6.
  "request_not_supported",
  // The OP does not support use of the request_uri parameter defined in Section 6.
  "request_uri_not_supported",
  // The OP does not support use of the registration parameter defined in Section 7.2.1.
  "registration_not_supported"
]);

// node_modules/@atproto/oauth-types/dist/oidc-userinfo.js
var oidcUserinfoSchema = external_exports.object({
  sub: external_exports.string(),
  iss: external_exports.string().url().optional(),
  aud: external_exports.union([external_exports.string(), external_exports.array(external_exports.string()).min(1)]).optional(),
  email: external_exports.string().email().optional(),
  email_verified: external_exports.boolean().optional(),
  name: external_exports.string().optional(),
  preferred_username: external_exports.string().optional(),
  picture: external_exports.string().url().optional()
});

// node_modules/@atproto/oauth-client/dist/lock.js
var locks = /* @__PURE__ */ new Map();
function acquireLocalLock(name) {
  return new Promise((resolveAcquire) => {
    const prev = locks.get(name) ?? Promise.resolve();
    const next = prev.then(() => {
      return new Promise((resolveRelease) => {
        const release = () => {
          if (locks.get(name) === next)
            locks.delete(name);
          resolveRelease();
        };
        resolveAcquire(release);
      });
    });
    locks.set(name, next);
  });
}
var requestLocalLock = (name, fn) => {
  return acquireLocalLock(name).then(async (release) => {
    try {
      return await fn();
    } finally {
      release();
    }
  });
};

// node_modules/@atproto/oauth-client/dist/util.js
var ifString2 = (v) => typeof v === "string" ? v : void 0;
function contentMime(headers) {
  return headers.get("content-type")?.split(";")[0].trim();
}
function timeoutSignal(ms) {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(timeoutError(ms)), ms);
  return controller.signal;
}
function timeoutError(ms) {
  const message2 = `The operation timed out after ${ms} ms`;
  if (typeof DOMException === "function") {
    return new DOMException(message2, "TimeoutError");
  }
  return new Error(message2);
}
function combineSignals(signals) {
  const controller = new DisposableAbortController();
  const onAbort = function(_event) {
    const reason = new Error("This operation was aborted", {
      cause: this.reason
    });
    controller.abort(reason);
  };
  try {
    for (const sig of signals) {
      if (sig) {
        sig.throwIfAborted();
        sig.addEventListener("abort", onAbort, { signal: controller.signal });
      }
    }
    return controller;
  } catch (err) {
    controller.abort(err);
    throw err;
  }
}
var DisposableAbortController = class extends AbortController {
  [Symbol.dispose]() {
    this.abort(new Error("AbortController was disposed"));
  }
};

// node_modules/@atproto/oauth-client/dist/oauth-authorization-server-metadata-resolver.js
var OAuthAuthorizationServerMetadataResolver = class extends CachedGetter {
  constructor(cache, fetch, config) {
    super(async (issuer, options) => this.fetchMetadata(issuer, options), swallowStoreErrors(cache, config?.onCacheError));
    this.fetch = bindFetch(fetch);
    this.allowHttpIssuer = config?.allowHttpIssuer === true;
  }
  async get(input, options) {
    const issuer = oauthIssuerIdentifierSchema.parse(String(input));
    if (!this.allowHttpIssuer && issuer.startsWith("http:")) {
      throw new TypeError("Unsecure issuer URL protocol only allowed in development and test environments");
    }
    return super.get(issuer, options);
  }
  async fetchMetadata(issuer, options) {
    const url = new URL(`/.well-known/oauth-authorization-server`, issuer);
    const request = new Request(url, {
      headers: { accept: "application/json" },
      cache: options?.noCache ? "no-cache" : void 0,
      signal: options?.signal,
      redirect: "manual"
      // response must be 200 OK
    });
    const response = await this.fetch(request);
    if (response.status !== 200) {
      await cancelBody(response, "log");
      throw await FetchResponseError.from(response, `Unexpected status code ${response.status} for "${url}"`, void 0, { cause: request });
    }
    if (contentMime(response.headers) !== "application/json") {
      await cancelBody(response, "log");
      throw await FetchResponseError.from(response, `Unexpected content type for "${url}"`, void 0, { cause: request });
    }
    const metadata = oauthAuthorizationServerMetadataValidator.parse(await response.json());
    if (metadata.issuer !== issuer) {
      throw new TypeError(`Invalid issuer ${metadata.issuer}`);
    }
    if (metadata.client_id_metadata_document_supported !== true) {
      throw new TypeError(`Authorization server "${issuer}" does not support client_id_metadata_document`);
    }
    return metadata;
  }
};

// node_modules/@atproto/oauth-client/dist/oauth-callback-error.js
var OAuthCallbackError = class _OAuthCallbackError extends Error {
  static from(err, params, state) {
    if (err instanceof _OAuthCallbackError)
      return err;
    const message2 = err instanceof Error ? err.message : void 0;
    return new _OAuthCallbackError(params, message2, state, err);
  }
  constructor(params, message2 = params.get("error_description") || "OAuth callback error", state, cause) {
    super(message2, { cause });
    this.params = params;
    this.state = state;
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/lib/number.js
var ifNumber4 = (value) => typeof value === "number" ? value : void 0;

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/did-error.js
var DidError4 = class _DidError extends Error {
  constructor(did, message2, code, status = 400, cause) {
    super(message2, { cause });
    this.did = did;
    this.code = code;
    this.status = status;
  }
  /**
   * For compatibility with error handlers in common HTTP frameworks.
   */
  get statusCode() {
    return this.status;
  }
  toString() {
    return `${this.constructor.name} ${this.code} (${this.did}): ${this.message}`;
  }
  static from(cause, did) {
    if (cause instanceof _DidError) {
      return cause;
    }
    const message2 = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "An unknown error occurred";
    const status = typeof cause === "object" && cause != null ? ("statusCode" in cause ? ifNumber4(cause.statusCode) : void 0) ?? ("status" in cause ? ifNumber4(cause.status) : void 0) : void 0;
    return new _DidError(did, message2, "did-unknown-error", status, cause);
  }
};
var InvalidDidError4 = class extends DidError4 {
  constructor(did, message2, cause) {
    super(did, message2, "did-invalid", 400, cause);
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/did.js
var DID_PREFIX4 = "did:";
var DID_PREFIX_LENGTH4 = DID_PREFIX4.length;
function assertDidMethod4(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError4(input, `Empty method name`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 48 || c > 57)) {
      throw new InvalidDidError4(input, `Invalid character at position ${i} in DID method name`);
    }
  }
}
function extractDidMethod2(did) {
  const msidSep = did.indexOf(":", DID_PREFIX_LENGTH4);
  const method = did.slice(DID_PREFIX_LENGTH4, msidSep);
  return method;
}
function assertDidMsid4(input, start = 0, end = input.length) {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
    throw new TypeError("Invalid start or end position");
  }
  if (end === start) {
    throw new InvalidDidError4(input, `DID method-specific id must not be empty`);
  }
  let c;
  for (let i = start; i < end; i++) {
    c = input.charCodeAt(i);
    if ((c < 97 || c > 122) && // a-z
    (c < 65 || c > 90) && // A-Z
    (c < 48 || c > 57) && // 0-9
    c !== 46 && // .
    c !== 45 && // -
    c !== 95) {
      if (c === 58) {
        if (i === end - 1) {
          throw new InvalidDidError4(input, `DID cannot end with ":"`);
        }
        continue;
      }
      if (c === 37) {
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError4(input, `Invalid pct-encoded character at position ${i}`);
        }
        c = input.charCodeAt(++i);
        if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
          throw new InvalidDidError4(input, `Invalid pct-encoded character at position ${i}`);
        }
        if (i >= end) {
          throw new InvalidDidError4(input, `Incomplete pct-encoded character at position ${i - 2}`);
        }
        continue;
      }
      throw new InvalidDidError4(input, `Disallowed character in DID at position ${i}`);
    }
  }
}
function assertDid4(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError4(typeof input, `DID must be a string`);
  }
  const { length } = input;
  if (length > 2048) {
    throw new InvalidDidError4(input, `DID is too long (2048 chars max)`);
  }
  if (!input.startsWith(DID_PREFIX4)) {
    throw new InvalidDidError4(input, `DID requires "${DID_PREFIX4}" prefix`);
  }
  const idSep = input.indexOf(":", DID_PREFIX_LENGTH4);
  if (idSep === -1) {
    throw new InvalidDidError4(input, `Missing colon after method name`);
  }
  assertDidMethod4(input, DID_PREFIX_LENGTH4, idSep);
  assertDidMsid4(input, idSep + 1, length);
}
var didSchema4 = external_exports.string().superRefine((value, ctx) => {
  try {
    assertDid4(value);
    return true;
  } catch (err) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: err instanceof Error ? err.message : "Unexpected error"
    });
    return false;
  }
});

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/lib/uri.js
function isFragment4(value, startIdx = 0, endIdx = value.length) {
  let charCode;
  for (let i = startIdx; i < endIdx; i++) {
    charCode = value.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122 || charCode >= 48 && charCode <= 57 || charCode === 45 || charCode === 46 || charCode === 95 || charCode === 126) {
    } else if (charCode === 33 || charCode === 36 || charCode === 38 || charCode === 39 || charCode === 40 || charCode === 41 || charCode === 42 || charCode === 43 || charCode === 44 || charCode === 59 || charCode === 61) {
    } else if (charCode === 58 || charCode === 64) {
    } else if (charCode === 47 || charCode === 63) {
    } else if (charCode === 37) {
      if (i + 2 >= endIdx)
        return false;
      if (!isHexDigit4(value.charCodeAt(i + 1)))
        return false;
      if (!isHexDigit4(value.charCodeAt(i + 2)))
        return false;
      i += 2;
    } else {
      return false;
    }
  }
  return true;
}
function isHexDigit4(code) {
  return code >= 48 && code <= 57 || // 0-9
  code >= 65 && code <= 70 || // A-F
  code >= 97 && code <= 102;
}
var canParse4 = URL.canParse?.bind(URL) ?? ((url, base) => {
  try {
    new URL(url, base);
    return true;
  } catch {
    return false;
  }
});

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/methods/plc.js
var DID_PLC_PREFIX4 = `did:plc:`;
var DID_PLC_PREFIX_LENGTH4 = DID_PLC_PREFIX4.length;
var DID_PLC_LENGTH4 = 32;
function isDidPlc4(input) {
  if (typeof input !== "string")
    return false;
  if (input.length !== DID_PLC_LENGTH4)
    return false;
  if (!input.startsWith(DID_PLC_PREFIX4))
    return false;
  for (let i = DID_PLC_PREFIX_LENGTH4; i < DID_PLC_LENGTH4; i++) {
    if (!isBase32Char4(input.charCodeAt(i)))
      return false;
  }
  return true;
}
function assertDidPlc4(input) {
  if (typeof input !== "string") {
    throw new InvalidDidError4(typeof input, `DID must be a string`);
  }
  if (!input.startsWith(DID_PLC_PREFIX4)) {
    throw new InvalidDidError4(input, `Invalid did:plc prefix`);
  }
  if (input.length !== DID_PLC_LENGTH4) {
    throw new InvalidDidError4(input, `did:plc must be ${DID_PLC_LENGTH4} characters long`);
  }
  for (let i = DID_PLC_PREFIX_LENGTH4; i < DID_PLC_LENGTH4; i++) {
    if (!isBase32Char4(input.charCodeAt(i))) {
      throw new InvalidDidError4(input, `Invalid character at position ${i}`);
    }
  }
}
var isBase32Char4 = (c) => c >= 97 && c <= 122 || c >= 50 && c <= 55;

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/methods/web.js
var DID_WEB_PREFIX4 = `did:web:`;
function isDidWeb4(input) {
  if (typeof input !== "string")
    return false;
  if (!input.startsWith(DID_WEB_PREFIX4))
    return false;
  if (input.charAt(DID_WEB_PREFIX4.length) === ":")
    return false;
  try {
    assertDidMsid4(input, DID_WEB_PREFIX4.length);
  } catch {
    return false;
  }
  return canParse4(buildDidWebUrl4(input));
}
function didWebToUrl2(did) {
  try {
    return new URL(buildDidWebUrl4(did));
  } catch (cause) {
    throw new InvalidDidError4(did, "Invalid Web DID", cause);
  }
}
function buildDidWebUrl4(did) {
  const hostIdx = DID_WEB_PREFIX4.length;
  const pathIdx = did.indexOf(":", hostIdx);
  const hostEnc = pathIdx === -1 ? did.slice(hostIdx) : did.slice(hostIdx, pathIdx);
  const host = hostEnc.replaceAll("%3A", ":");
  const path = pathIdx === -1 ? "" : did.slice(pathIdx).replaceAll(":", "/");
  const proto = host.startsWith("localhost") && (host.length === 9 || host.charCodeAt(9) === 58) ? "http" : "https";
  return `${proto}://${host}${path}`;
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/atproto.js
var atprotoDidSchema4 = external_exports.string().refine(isAtprotoDid4, `Atproto only allows "plc" and "web" DID methods`);
function isAtprotoDid4(input) {
  return isDidPlc4(input) || isAtprotoDidWeb4(input);
}
function isAtprotoDidWeb4(input) {
  if (!isDidWeb4(input)) {
    return false;
  }
  if (isDidWebWithPath4(input)) {
    return false;
  }
  if (isDidWebWithHttpsPort4(input)) {
    return false;
  }
  return true;
}
function isDidWebWithPath4(did) {
  return did.includes(":", DID_WEB_PREFIX4.length);
}
function isLocalhostDid4(did) {
  return did === "did:web:localhost" || did.startsWith("did:web:localhost:") || did.startsWith("did:web:localhost%3A");
}
function isDidWebWithHttpsPort4(did) {
  if (isLocalhostDid4(did))
    return false;
  const pathIdx = did.indexOf(":", DID_WEB_PREFIX4.length);
  const hasPort = pathIdx === -1 ? (
    // No path component, check if there's a port separator anywhere after
    // the "did:web:" prefix
    did.includes("%3A", DID_WEB_PREFIX4.length)
  ) : (
    // There is a path component; if there is an encoded colon *before* it,
    // then there is a port number
    did.lastIndexOf("%3A", pathIdx) !== -1
  );
  return hasPort;
}
var ATPROTO_VERIFICATION_METHOD_TYPES4 = Object.freeze([
  "EcdsaSecp256r1VerificationKey2019",
  "EcdsaSecp256k1VerificationKey2019",
  "Multikey"
]);

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/dist/did-document.js
var rfc3968UriSchema4 = external_exports.string().url("RFC3968 compliant URI");
var didControllerSchema4 = external_exports.union([didSchema4, external_exports.array(didSchema4)]);
var didRelativeUriSchema4 = external_exports.union([
  rfc3968UriSchema4.refine((value) => {
    const fragmentIndex = value.indexOf("#");
    if (fragmentIndex === -1)
      return false;
    return isFragment4(value, fragmentIndex + 1);
  }, {
    message: "Missing or invalid fragment in RFC3968 URI"
  }),
  external_exports.string().refine((value) => value.charCodeAt(0) === 35, {
    message: "Fragment must start with #"
  }).refine((value) => isFragment4(value, 1), {
    message: "Invalid char in URI fragment"
  })
]);
var didVerificationMethodSchema4 = external_exports.object({
  id: didRelativeUriSchema4,
  type: external_exports.string().min(1),
  controller: didControllerSchema4,
  publicKeyJwk: external_exports.record(external_exports.string(), external_exports.unknown()).optional(),
  publicKeyMultibase: external_exports.string().optional()
});
var didServiceIdSchema4 = didRelativeUriSchema4;
var didServiceTypeSchema4 = external_exports.union([external_exports.string(), external_exports.array(external_exports.string())]);
var didServiceEndpointSchema4 = external_exports.union([
  rfc3968UriSchema4,
  external_exports.record(external_exports.string(), rfc3968UriSchema4),
  external_exports.array(external_exports.union([rfc3968UriSchema4, external_exports.record(external_exports.string(), rfc3968UriSchema4)])).nonempty()
]);
var didServiceSchema4 = external_exports.object({
  id: didServiceIdSchema4,
  type: didServiceTypeSchema4,
  serviceEndpoint: didServiceEndpointSchema4
});
var verificationMethodReference4 = external_exports.union([
  //
  didRelativeUriSchema4,
  didVerificationMethodSchema4
]);
var didDocumentSchema4 = external_exports.object({
  "@context": external_exports.union([
    external_exports.literal("https://www.w3.org/ns/did/v1"),
    external_exports.array(external_exports.string().url()).nonempty().refine((data) => data[0] === "https://www.w3.org/ns/did/v1", {
      message: "First @context must be https://www.w3.org/ns/did/v1"
    })
  ]).optional(),
  id: didSchema4,
  controller: didControllerSchema4.optional(),
  alsoKnownAs: external_exports.array(rfc3968UriSchema4).optional(),
  service: external_exports.array(didServiceSchema4).optional(),
  authentication: external_exports.array(verificationMethodReference4).optional(),
  verificationMethod: external_exports.array(didVerificationMethodSchema4).optional()
});
var didDocumentValidator4 = didDocumentSchema4.superRefine(({ id: did, service }, ctx) => {
  if (service) {
    const visited = /* @__PURE__ */ new Set();
    for (let i = 0; i < service.length; i++) {
      const current = service[i];
      const serviceId = current.id.startsWith("#") ? `${did}${current.id}` : current.id;
      if (!visited.has(serviceId)) {
        visited.add(serviceId);
      } else {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          message: `Duplicate service id (${current.id}) found in the document`,
          path: ["service", i, "id"]
        });
      }
    }
  }
});

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store/dist/util.js
function assert3(condition, message2 = "Assertion failed") {
  if (!condition)
    throw new Error(message2);
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store/dist/cached-getter.js
var returnTrue3 = () => true;
var returnFalse3 = () => false;
var CachedGetter3 = class {
  #pending = /* @__PURE__ */ new Map();
  #getter;
  #store;
  #options = {};
  constructor(getter, store, options = {}) {
    this.#getter = getter;
    this.#store = store;
    this.#options = options;
  }
  async get(key, { signal, context, allowStale = false, noCache = false } = {}) {
    signal?.throwIfAborted();
    const { isStale, deleteOnError } = this.#options;
    const allowStored = noCache ? returnFalse3 : allowStale || isStale == null ? returnTrue3 : async (value2) => !await isStale(key, value2);
    let previousExecutionFlow;
    while (previousExecutionFlow = this.#pending.get(key)) {
      try {
        const { isFresh, value: value2 } = await previousExecutionFlow;
        if (isFresh)
          return value2;
        if (await allowStored(value2))
          return value2;
      } catch {
      }
      signal?.throwIfAborted();
    }
    const currentExecutionFlow = Promise.resolve().then(async () => {
      signal?.throwIfAborted();
      const storedValue = await this.getStored(key, { signal });
      if (storedValue !== void 0 && await allowStored(storedValue)) {
        return { isFresh: false, value: storedValue };
      }
      signal?.throwIfAborted();
      return Promise.resolve().then(async () => {
        const options = { signal, noCache, context };
        return this.#getter.call(null, key, options, storedValue);
      }).catch(async (err) => {
        if (storedValue !== void 0) {
          try {
            if (await deleteOnError?.(err, key, storedValue)) {
              await this.delStored(key, err);
            }
          } catch (error) {
            throw new AggregateError([err, error], "Error while deleting stored value");
          }
        }
        throw err;
      }).then(async (value2) => {
        await this.setStored(key, value2);
        return { isFresh: true, value: value2 };
      });
    }).finally(() => {
      assert3(this.#pending.get(key) === currentExecutionFlow, `Pending item for key "${key}" was replaced before it finished.`);
      this.#pending.delete(key);
    });
    assert3(!this.#pending.has(key), `Concurrent execution flow for key "${key}" should not exist.`);
    this.#pending.set(key, currentExecutionFlow);
    const { value } = await currentExecutionFlow;
    return value;
  }
  // @NOTE We propagate errors from the store. If the use-case prefers to ignore
  // errors from the store, it should be handled in the store implementation
  // (eg. by returning `undefined` instead of throwing).
  // @NOTE We define the store methods here to allow for overriding them in
  // subclasses.
  async getStored(key, options) {
    return this.#store.get(key, options);
  }
  async setStored(key, value) {
    await this.#store.set(key, value);
  }
  async delStored(key, _cause) {
    await this.#store.del(key);
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store/dist/swallow-store-errors.js
var logStoreError3 = (err, operation) => {
  console.error(`SimpleStore error during "${operation}"`, err);
};
function swallowStoreErrors3(store, onError = logStoreError3) {
  return {
    async get(key, options) {
      options?.signal?.throwIfAborted();
      try {
        return await store.get(key, options);
      } catch (err) {
        if (options?.signal?.aborted)
          throw err;
        onError(err, "get", key);
        return void 0;
      }
    },
    async set(key, value) {
      try {
        await store.set(key, value);
      } catch (err) {
        onError(err, "set", key);
      }
    },
    async del(key) {
      try {
        await store.del(key);
      } catch (err) {
        onError(err, "del", key);
      }
    },
    async clear() {
      try {
        await store.clear?.();
      } catch (err) {
        onError(err, "clear");
      }
    }
  };
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory/dist/util.js
var knownSizes3 = /* @__PURE__ */ new WeakMap();
function roughSizeOfObject3(value) {
  const objectList = /* @__PURE__ */ new Set();
  const stack = [value];
  let bytes = 0;
  while (stack.length) {
    const value2 = stack.pop();
    switch (typeof value2) {
      // Types are ordered by frequency
      case "string":
        bytes += 12 + 4 * Math.ceil(value2.length / 4);
        break;
      case "number":
        bytes += 12;
        break;
      case "boolean":
        bytes += 4;
        break;
      case "object":
        bytes += 4;
        if (value2 === null) {
          break;
        }
        if (knownSizes3.has(value2)) {
          bytes += knownSizes3.get(value2);
          break;
        }
        if (objectList.has(value2))
          continue;
        objectList.add(value2);
        if (Array.isArray(value2)) {
          bytes += 4;
          stack.push(...value2);
        } else {
          bytes += 8;
          const keys = Object.getOwnPropertyNames(value2);
          for (let i = 0; i < keys.length; i++) {
            bytes += 4;
            const key = keys[i];
            const val = value2[key];
            if (val !== void 0)
              stack.push(val);
            stack.push(key);
          }
        }
        break;
      case "function":
        bytes += 8;
        break;
      case "symbol":
        bytes += 8;
        break;
      case "bigint":
        bytes += 16;
        break;
    }
  }
  if (typeof value === "object" && value !== null) {
    knownSizes3.set(value, bytes);
  }
  return bytes;
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory/dist/index.js
var nullSymbol3 = /* @__PURE__ */ Symbol("nullItem");
var toLruValue3 = (value) => value === null ? nullSymbol3 : value;
var fromLruValue3 = (value) => value === nullSymbol3 ? null : value;
var SimpleStoreMemory3 = class {
  #cache;
  constructor({ sizeCalculation, ...options }) {
    this.#cache = new LRUCache({
      ...options,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
      sizeCalculation: sizeCalculation ? (value, key) => sizeCalculation(fromLruValue3(value), key) : options.maxEntrySize != null || options.maxSize != null ? (
        // maxEntrySize and maxSize require a size calculation function.
        roughSizeOfObject3
      ) : void 0
    });
  }
  get(key) {
    const value = this.#cache.get(key);
    if (value === void 0)
      return void 0;
    return fromLruValue3(value);
  }
  set(key, value) {
    this.#cache.set(key, toLruValue3(value));
  }
  del(key) {
    this.#cache.delete(key);
  }
  clear() {
    this.#cache.clear();
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/dist/did-cache-memory.js
var DEFAULT_TTL2 = 3600 * 1e3;
var DEFAULT_MAX_SIZE2 = 50 * 1024 * 1024;
var DidCacheMemory2 = class extends SimpleStoreMemory3 {
  constructor(options) {
    super(options?.max == null ? { ttl: DEFAULT_TTL2, maxSize: DEFAULT_MAX_SIZE2, ...options } : { ttl: DEFAULT_TTL2, ...options });
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/dist/did-cache.js
var DidResolverCached2 = class {
  constructor(resolver, cache = new DidCacheMemory2(), onDidCacheError) {
    this.getter = new CachedGetter3((did, options) => resolver.resolve(did, options), swallowStoreErrors3(cache, onDidCacheError));
  }
  async resolve(did, options) {
    return this.getter.get(did, options);
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/dist/fetch-error.js
var FetchError2 = class extends Error {
  constructor(statusCode, message2, options) {
    super(message2, options);
    this.statusCode = statusCode;
  }
  get expose() {
    return true;
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/dist/fetch.js
function toRequestTransformer2(requestTransformer) {
  return function(input, init) {
    return requestTransformer.call(this, asRequest2(input, init));
  };
}
function asRequest2(input, init) {
  if (!init && input instanceof Request)
    return input;
  return new Request(input, init);
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/dist/util.js
var ifString3 = (v) => typeof v === "string" ? v : void 0;
var MaxBytesTransformStream2 = class extends TransformStream {
  constructor(maxBytes) {
    if (!(maxBytes >= 0)) {
      throw new TypeError("maxBytes must be a non-negative number");
    }
    let bytesRead = 0;
    super({
      transform: (chunk, ctrl) => {
        if ((bytesRead += chunk.length) <= maxBytes) {
          ctrl.enqueue(chunk);
        } else {
          ctrl.error(new Error("Response too large"));
        }
      }
    });
  }
};
async function cancelBody2(body, onCancellationError) {
  if (body.body && !body.bodyUsed && !body.body.locked && // Support for alternative fetch implementations
  typeof body.body.cancel === "function") {
    if (typeof onCancellationError === "function") {
      void body.body.cancel().catch(onCancellationError);
    } else if (onCancellationError === "log") {
      void body.body.cancel().catch(logCancellationError2);
    } else {
      await body.body.cancel();
    }
  }
}
function logCancellationError2(err) {
  console.warn("Failed to cancel response body", err);
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/dist/fetch-request.js
var FetchRequestError2 = class _FetchRequestError extends FetchError2 {
  constructor(request, statusCode, message2, options) {
    if (statusCode == null || !message2) {
      const info = extractInfo2(extractRootCause2(options?.cause));
      statusCode ??= info[0];
      message2 ||= info[1];
    }
    super(statusCode, message2, options);
    this.request = request;
  }
  get expose() {
    return this.statusCode !== 500;
  }
  static from(request, cause) {
    if (cause instanceof _FetchRequestError)
      return cause;
    return new _FetchRequestError(request, void 0, void 0, { cause });
  }
};
function extractRootCause2(err) {
  if (err instanceof TypeError && err.message === "fetch failed" && err.cause !== void 0) {
    return err.cause;
  }
  return err;
}
function extractInfo2(err) {
  if (typeof err === "string" && err.length > 0) {
    return [500, err];
  }
  if (!(err instanceof Error)) {
    return [500, "Failed to fetch"];
  }
  switch (err.message) {
    case "failed to fetch the data URL":
      return [400, err.message];
    case "unexpected redirect":
    case "cors failure":
    case "blocked":
    case "proxy authentication required":
      return [502, err.message];
  }
  const code = "code" in err ? err.code : void 0;
  if (typeof code === "string") {
    switch (true) {
      case code === "ENOTFOUND":
        return [400, "Invalid hostname"];
      case code === "ECONNREFUSED":
        return [502, "Connection refused"];
      case code === "DEPTH_ZERO_SELF_SIGNED_CERT":
        return [502, "Self-signed certificate"];
      case code.startsWith("ERR_TLS"):
        return [502, "TLS error"];
      case code.startsWith("ECONN"):
        return [502, "Connection error"];
      default:
        return [500, `${code} error`];
    }
  }
  return [500, err.message];
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe/dist/pipe.js
function pipe2(...pipeline) {
  return pipeline.reduce(pipeTwo2);
}
function pipeTwo2(first, second) {
  return async (...args) => second(await first(...args));
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/dist/fetch-response.js
var JSON_MIME2 = /^application\/(?:[^()<>@,;:/[\]\\?={} \t]+\+)?json$/i;
var FetchResponseError2 = class _FetchResponseError extends FetchError2 {
  constructor(response, statusCode = response.status, message2 = response.statusText, options) {
    super(statusCode, message2, options);
    this.response = response;
  }
  static async from(response, customMessage = extractResponseMessage2, statusCode = response.status, options) {
    const message2 = typeof customMessage === "string" ? customMessage : typeof customMessage === "function" ? await customMessage(response) : void 0;
    return new _FetchResponseError(response, statusCode, message2, options);
  }
};
var extractResponseMessage2 = async (response) => {
  const mimeType = extractMime2(response);
  if (!mimeType)
    return void 0;
  try {
    if (mimeType === "text/plain") {
      return await response.text();
    } else if (JSON_MIME2.test(mimeType)) {
      const json = await response.json();
      if (typeof json === "string")
        return json;
      if (typeof json === "object" && json != null) {
        if ("error_description" in json) {
          const errorDescription = ifString3(json.error_description);
          if (errorDescription)
            return errorDescription;
        }
        if ("error" in json) {
          const error = ifString3(json.error);
          if (error)
            return error;
        }
        if ("message" in json) {
          const message2 = ifString3(json.message);
          if (message2)
            return message2;
        }
      }
    }
  } catch {
  }
  return void 0;
};
function extractMime2(response) {
  const contentType = response.headers.get("Content-Type");
  if (contentType == null)
    return void 0;
  return contentType.split(";", 1)[0].trim();
}
function cancelBodyOnError2(transformer, onCancellationError = logCancellationError2) {
  return async (response) => {
    try {
      return await transformer(response);
    } catch (err) {
      await cancelBody2(response, onCancellationError ?? void 0);
      throw err;
    }
  };
}
function fetchOkProcessor2(customMessage) {
  return cancelBodyOnError2((response) => {
    return fetchOkTransformer2(response, customMessage);
  });
}
async function fetchOkTransformer2(response, customMessage) {
  if (response.ok)
    return response;
  throw await FetchResponseError2.from(response, customMessage);
}
function fetchTypeProcessor2(expectedMime, contentTypeRequired = true) {
  const isExpected = typeof expectedMime === "string" ? (mimeType) => mimeType === expectedMime : expectedMime instanceof RegExp ? (mimeType) => expectedMime.test(mimeType) : expectedMime;
  return cancelBodyOnError2((response) => {
    return fetchResponseTypeChecker2(response, isExpected, contentTypeRequired);
  });
}
async function fetchResponseTypeChecker2(response, isExpectedMime, contentTypeRequired = true) {
  const mimeType = extractMime2(response);
  if (mimeType) {
    if (!isExpectedMime(mimeType.toLowerCase())) {
      throw await FetchResponseError2.from(response, `Unexpected response Content-Type (${mimeType})`, 502);
    }
  } else if (contentTypeRequired) {
    throw await FetchResponseError2.from(response, "Missing response Content-Type header", 502);
  }
  return response;
}
async function fetchResponseJsonTransformer2(response) {
  try {
    const json = await response.json();
    return { response, json };
  } catch (cause) {
    throw new FetchResponseError2(response, 502, "Unable to parse response as JSON", { cause });
  }
}
function fetchJsonProcessor2(expectedMime = JSON_MIME2, contentTypeRequired = true) {
  return pipe2(fetchTypeProcessor2(expectedMime, contentTypeRequired), cancelBodyOnError2(fetchResponseJsonTransformer2));
}
function fetchJsonValidatorProcessor2(schema, params) {
  if ("parseAsync" in schema && typeof schema.parseAsync === "function") {
    return async (jsonResponse) => schema.parseAsync(jsonResponse.json, params);
  }
  if ("parse" in schema && typeof schema.parse === "function") {
    return async (jsonResponse) => schema.parse(jsonResponse.json, params);
  }
  throw new TypeError("Invalid schema");
}
var fetchJsonZodProcessor2 = fetchJsonValidatorProcessor2;

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/dist/fetch-wrap.js
function bindFetch2(fetch = globalThis.fetch, context = globalThis) {
  return toRequestTransformer2(async (request) => {
    try {
      return await fetch.call(context, request);
    } catch (err) {
      throw FetchRequestError2.from(request, err);
    }
  });
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/dist/did-resolver-base.js
var DidResolverBase2 = class {
  constructor(methods) {
    this.methods = new Map(Object.entries(methods));
  }
  async resolve(did, options) {
    options?.signal?.throwIfAborted();
    const method = extractDidMethod2(did);
    const resolver = this.methods.get(method);
    if (!resolver) {
      throw new DidError4(did, `Unsupported DID method`, "did-method-invalid", 400);
    }
    try {
      const document2 = await resolver.resolve(did, options);
      if (document2.id !== did) {
        throw new DidError4(did, `DID document id (${document2.id}) does not match DID`, "did-document-id-mismatch", 400);
      }
      return document2;
    } catch (err) {
      if (err instanceof FetchResponseError2) {
        const status = err.response.status >= 500 ? 502 : err.response.status;
        throw new DidError4(did, err.message, "did-fetch-error", status, err);
      }
      if (err instanceof FetchError2) {
        throw new DidError4(did, err.message, "did-fetch-error", 400, err);
      }
      if (err instanceof ZodError) {
        throw new DidError4(did, err.message, "did-document-format-error", 503, err);
      }
      throw DidError4.from(err, did);
    }
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/dist/methods/plc.js
var fetchSuccessHandler3 = pipe2(fetchOkProcessor2(), fetchJsonProcessor2(/^application\/(did\+ld\+)?json$/), fetchJsonZodProcessor2(didDocumentValidator4));
var DidPlcMethod2 = class {
  constructor(options) {
    this.plcDirectoryUrl = new URL(options?.plcDirectoryUrl || "https://plc.directory/");
    this.fetch = bindFetch2(options?.fetch);
  }
  async resolve(did, options) {
    assertDidPlc4(did);
    const url = new URL(`/${encodeURIComponent(did)}`, this.plcDirectoryUrl);
    return this.fetch(url, {
      redirect: "error",
      headers: { accept: "application/did+ld+json,application/json" },
      signal: options?.signal
    }).then(fetchSuccessHandler3);
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/dist/methods/web.js
var fetchSuccessHandler4 = pipe2(fetchOkProcessor2(), fetchJsonProcessor2(/^application\/(did\+ld\+)?json$/), fetchJsonZodProcessor2(didDocumentValidator4));
var DidWebMethod2 = class {
  constructor({ fetch = globalThis.fetch, allowHttp = true } = {}) {
    this.fetch = bindFetch2(fetch);
    this.allowHttp = allowHttp;
  }
  async resolve(did, options) {
    const didDocumentUrl = buildDidWebDocumentUrl2(did);
    if (!this.allowHttp && didDocumentUrl.protocol === "http:") {
      throw new DidError4(did, 'Resolution of "http" did:web is not allowed', "did-web-http-not-allowed");
    }
    return this.fetch(didDocumentUrl, {
      redirect: "error",
      headers: { accept: "application/did+ld+json,application/json" },
      signal: options?.signal
    }).then(fetchSuccessHandler4);
  }
};
function buildDidWebDocumentUrl2(did) {
  const url = didWebToUrl2(did);
  if (url.pathname === "/") {
    return new URL(`/.well-known/did.json`, url);
  } else {
    return new URL(`${url.pathname}/did.json`, url);
  }
}

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/dist/did-resolver-common.js
var DidResolverCommon2 = class extends DidResolverBase2 {
  constructor(options) {
    super({
      plc: new DidPlcMethod2(options),
      web: new DidWebMethod2(options)
    });
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/dist/create-did-resolver.js
function createDidResolver2(options) {
  const { didResolver, didCache, onDidCacheError } = options;
  if (didResolver instanceof DidResolverCached2 && !didCache) {
    return didResolver;
  }
  return new DidResolverCached2(didResolver ?? new DidResolverCommon2(options), didCache, onDidCacheError);
}

// node_modules/@atproto-labs/identity-resolver/dist/constants.js
var HANDLE_INVALID = "handle.invalid";

// node_modules/@atproto-labs/identity-resolver/dist/identity-resolver-error.js
var IdentityResolverError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "IdentityResolverError";
  }
};

// node_modules/@atproto-labs/identity-resolver/dist/util.js
function extractAtprotoHandle(document2) {
  if (document2.alsoKnownAs) {
    for (const h of document2.alsoKnownAs) {
      if (h.startsWith("at://")) {
        return h.slice(5);
      }
    }
  }
  return void 0;
}
function extractNormalizedHandle(document2) {
  const handle = extractAtprotoHandle(document2);
  if (!handle)
    return void 0;
  return asNormalizedHandle(handle);
}
function asNormalizedHandle(input) {
  const handle = normalizeHandle(input);
  return isValidHandle(handle) ? handle : void 0;
}
function normalizeHandle(handle) {
  return handle.toLowerCase();
}
function isValidHandle(handle) {
  return handle.length > 0 && handle.length < 254 && /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(handle);
}

// node_modules/@atproto-labs/identity-resolver/dist/atproto-identity-resolver.js
var AtprotoIdentityResolver = class {
  constructor(didResolver, handleResolver) {
    this.didResolver = didResolver;
    this.handleResolver = handleResolver;
  }
  async resolve(input, options) {
    return isAtprotoDid4(input) ? this.resolveFromDid(input, options) : this.resolveFromHandle(input, options);
  }
  async resolveFromDid(did, options) {
    const document2 = await this.getDocumentFromDid(did, options);
    options?.signal?.throwIfAborted();
    const handle = extractNormalizedHandle(document2);
    const resolvedDid = handle ? await this.handleResolver.resolve(handle, options).catch(() => void 0) : void 0;
    return {
      did: document2.id,
      didDoc: document2,
      handle: handle && resolvedDid === did ? handle : HANDLE_INVALID
    };
  }
  async resolveFromHandle(handle, options) {
    const document2 = await this.getDocumentFromHandle(handle, options);
    return {
      did: document2.id,
      didDoc: document2,
      handle: extractNormalizedHandle(document2) || HANDLE_INVALID
    };
  }
  async getDocumentFromDid(did, options) {
    return this.didResolver.resolve(did, options);
  }
  async getDocumentFromHandle(input, options) {
    const handle = asNormalizedHandle(input);
    if (!handle) {
      throw new IdentityResolverError(`Invalid handle "${input}" provided.`);
    }
    const did = await this.handleResolver.resolve(handle, options);
    if (!did) {
      throw new IdentityResolverError(`Handle "${handle}" does not resolve to a DID`);
    }
    options?.signal?.throwIfAborted();
    const document2 = await this.didResolver.resolve(did, options);
    if (handle !== extractNormalizedHandle(document2)) {
      throw new IdentityResolverError(`Did document for "${did}" does not include the handle "${handle}"`);
    }
    return document2;
  }
};

// node_modules/@atproto-labs/identity-resolver/dist/create-identity-resolver.js
function createIdentityResolver(options) {
  if ("identityResolver" in options && options.identityResolver != null) {
    return options.identityResolver;
  }
  if ("handleResolver" in options && options.handleResolver != null) {
    const didResolver = createDidResolver2(options);
    const handleResolver = createHandleResolver(options);
    return new AtprotoIdentityResolver(didResolver, handleResolver);
  }
  throw new TypeError("identityResolver or handleResolver option is required");
}

// node_modules/@atproto/oauth-client/dist/constants.js
var FALLBACK_ALG = "ES256";

// node_modules/@atproto/oauth-client/dist/errors/auth-method-unsatisfiable-error.js
var AuthMethodUnsatisfiableError = class extends Error {
};

// node_modules/@atproto/oauth-client/dist/errors/token-revoked-error.js
var TokenRevokedError = class extends Error {
  constructor(sub, message2 = `The session for "${sub}" was successfully revoked`, options) {
    super(message2, options);
    this.sub = sub;
  }
};

// node_modules/@atproto/oauth-client/dist/oauth-client-auth.js
function negotiateClientAuthMethod(serverMetadata, clientMetadata, keyset) {
  const method = clientMetadata.token_endpoint_auth_method;
  const methods = supportedMethods(serverMetadata);
  if (!methods.includes(method)) {
    throw new Error(`The server does not support "${method}" authentication. Supported methods are: ${methods.join(", ")}.`);
  }
  if (method === "private_key_jwt") {
    if (!keyset)
      throw new Error("A keyset is required for private_key_jwt");
    const alg = supportedAlgs(serverMetadata);
    for (const key of keyset.list({ alg, usage: "sign" })) {
      if (key.kid)
        return { method: "private_key_jwt", kid: key.kid };
    }
    throw new Error(alg.includes(FALLBACK_ALG) ? `Client authentication method "${method}" requires at least one "${FALLBACK_ALG}" signing key with a "kid" property` : (
      // AS is not compliant with the ATproto OAuth spec.
      `Authorization server requires "${method}" authentication method, but does not support "${FALLBACK_ALG}" algorithm.`
    ));
  }
  if (method === "none") {
    return { method: "none" };
  }
  throw new Error(`The ATProto OAuth spec requires that client use either "none" or "private_key_jwt" authentication method.` + (method === "client_secret_basic" ? ' You might want to explicitly set "token_endpoint_auth_method" to one of those values in the client metadata document.' : ` You set "${method}" which is not allowed.`));
}
function createClientCredentialsFactory(authMethod, serverMetadata, clientMetadata, runtime, keyset) {
  if (!supportedMethods(serverMetadata).includes(authMethod.method)) {
    throw new AuthMethodUnsatisfiableError(`Client authentication method "${authMethod.method}" no longer supported`);
  }
  if (authMethod.method === "none") {
    return () => ({
      payload: {
        client_id: clientMetadata.client_id
      }
    });
  }
  if (authMethod.method === "private_key_jwt") {
    try {
      if (!keyset)
        throw new Error("A keyset is required for private_key_jwt");
      const { key, alg } = keyset.findPrivateKey({
        usage: "sign",
        kid: authMethod.kid,
        alg: supportedAlgs(serverMetadata)
      });
      return async () => ({
        payload: {
          client_id: clientMetadata.client_id,
          client_assertion_type: CLIENT_ASSERTION_TYPE_JWT_BEARER,
          client_assertion: await key.createJwt({ alg }, {
            // > The JWT MUST contain an "iss" (issuer) claim that contains a
            // > unique identifier for the entity that issued the JWT.
            iss: clientMetadata.client_id,
            // > For client authentication, the subject MUST be the
            // > "client_id" of the OAuth client.
            sub: clientMetadata.client_id,
            // > The JWT MUST contain an "aud" (audience) claim containing a value
            // > that identifies the authorization server as an intended audience.
            // > The token endpoint URL of the authorization server MAY be used as a
            // > value for an "aud" element to identify the authorization server as an
            // > intended audience of the JWT.
            aud: serverMetadata.issuer,
            // > The JWT MAY contain a "jti" (JWT ID) claim that provides a
            // > unique identifier for the token.
            jti: await runtime.generateNonce(),
            // > The JWT MAY contain an "iat" (issued at) claim that
            // > identifies the time at which the JWT was issued.
            iat: Math.floor(Date.now() / 1e3),
            // > The JWT MUST contain an "exp" (expiration time) claim that
            // > limits the time window during which the JWT can be used.
            exp: Math.floor(Date.now() / 1e3) + 60
            // 1 minute
          })
        }
      });
    } catch (cause) {
      throw new AuthMethodUnsatisfiableError("Failed to load private key", {
        cause
      });
    }
  }
  throw new AuthMethodUnsatisfiableError(
    // @ts-expect-error
    `Unsupported auth method ${authMethod.method}`
  );
}
function supportedMethods(serverMetadata) {
  return serverMetadata["token_endpoint_auth_methods_supported"];
}
function supportedAlgs(serverMetadata) {
  return serverMetadata["token_endpoint_auth_signing_alg_values_supported"] ?? [
    // @NOTE If not specified, assume that the server supports the ES256
    // algorithm, as prescribed by the spec:
    //
    // > Clients and Authorization Servers currently must support the ES256
    // > cryptographic system [for client authentication].
    //
    // https://atproto.com/specs/oauth#confidential-client-authentication
    FALLBACK_ALG
  ];
}

// node_modules/@atproto/oauth-client/dist/oauth-protected-resource-metadata-resolver.js
var OAuthProtectedResourceMetadataResolver = class extends CachedGetter {
  constructor(cache, fetch = globalThis.fetch, config) {
    super(async (origin, options) => this.fetchMetadata(origin, options), swallowStoreErrors(cache, config?.onCacheError));
    this.fetch = bindFetch(fetch);
    this.allowHttpResource = config?.allowHttpResource === true;
  }
  async get(resource, options) {
    const { protocol, origin } = new URL(resource);
    if (protocol !== "https:" && protocol !== "http:") {
      throw new TypeError(`Invalid protected resource metadata URL protocol: ${protocol}`);
    }
    if (protocol === "http:" && !this.allowHttpResource) {
      throw new TypeError(`Unsecure resource metadata URL (${protocol}) only allowed in development and test environments`);
    }
    return super.get(origin, options);
  }
  async fetchMetadata(origin, options) {
    const url = new URL(`/.well-known/oauth-protected-resource`, origin);
    const request = new Request(url, {
      signal: options?.signal,
      headers: { accept: "application/json" },
      cache: options?.noCache ? "no-cache" : void 0,
      redirect: "manual"
      // response must be 200 OK
    });
    const response = await this.fetch(request);
    if (response.status === 404) {
      await cancelBody(response, "log");
      return null;
    }
    if (response.status !== 200) {
      await cancelBody(response, "log");
      throw await FetchResponseError.from(response, `Unexpected status code ${response.status} for "${url}"`, void 0, { cause: request });
    }
    if (contentMime(response.headers) !== "application/json") {
      await cancelBody(response, "log");
      throw await FetchResponseError.from(response, `Unexpected content type for "${url}"`, void 0, { cause: request });
    }
    const metadata = oauthProtectedResourceMetadataSchema.parse(await response.json());
    if (metadata.resource !== origin) {
      throw new TypeError(`Invalid issuer ${metadata.resource}`);
    }
    return metadata;
  }
};

// node_modules/@atproto/oauth-client/dist/oauth-resolver-error.js
var OAuthResolverError = class _OAuthResolverError extends Error {
  constructor(message2, options) {
    super(message2, options);
  }
  static from(cause, message2) {
    if (cause instanceof _OAuthResolverError)
      return cause;
    const validationReason = cause instanceof ZodError ? `${cause.errors[0].path} ${cause.errors[0].message}` : null;
    const fullMessage = (message2 ?? `Unable to resolve identity`) + (validationReason ? ` (${validationReason})` : "");
    return new _OAuthResolverError(fullMessage, {
      cause
    });
  }
};

// node_modules/@atproto/oauth-client/dist/oauth-resolver.js
var OAuthResolver = class {
  constructor(identityResolver, protectedResourceMetadataResolver, authorizationServerMetadataResolver) {
    this.identityResolver = identityResolver;
    this.protectedResourceMetadataResolver = protectedResourceMetadataResolver;
    this.authorizationServerMetadataResolver = authorizationServerMetadataResolver;
  }
  /**
   * @param input - A handle, DID, PDS URL or Entryway URL
   */
  async resolve(input, options) {
    return /^https?:\/\//.test(input) ? this.resolveFromService(input, options) : this.resolveFromIdentity(input, options);
  }
  /**
   * @note this method can be used to verify if a particular uri supports OAuth
   * based sign-in (for compatibility with legacy implementation).
   */
  async resolveFromService(input, options) {
    try {
      const metadata = await this.getResourceServerMetadata(input, options);
      return { metadata };
    } catch (err) {
      if (!options?.signal?.aborted && err instanceof OAuthResolverError) {
        try {
          const result = oauthIssuerIdentifierSchema.safeParse(input);
          if (result.success) {
            const metadata = await this.getAuthorizationServerMetadata(result.data, options);
            return { metadata };
          }
        } catch {
        }
      }
      throw err;
    }
  }
  async resolveFromIdentity(input, options) {
    const identityInfo = await this.resolveIdentity(input, options);
    options?.signal?.throwIfAborted();
    const pds = extractPdsUrl(identityInfo.didDoc);
    const metadata = await this.getResourceServerMetadata(pds, options);
    return { identityInfo, metadata, pds };
  }
  async resolveIdentity(input, options) {
    try {
      return await this.identityResolver.resolve(input, options);
    } catch (cause) {
      throw OAuthResolverError.from(cause, `Failed to resolve identity: ${input}`);
    }
  }
  async getAuthorizationServerMetadata(issuer, options) {
    try {
      return await this.authorizationServerMetadataResolver.get(issuer, options);
    } catch (cause) {
      throw OAuthResolverError.from(cause, `Failed to resolve OAuth server metadata for issuer: ${issuer}`);
    }
  }
  async getResourceServerMetadata(pdsUrl, options) {
    try {
      const rsMetadata = await this.protectedResourceMetadataResolver.get(pdsUrl, options);
      if (!rsMetadata) {
        return this.getAuthorizationServerMetadata(pdsUrl, options);
      }
      if (rsMetadata.authorization_servers?.length !== 1) {
        throw new OAuthResolverError(rsMetadata.authorization_servers?.length ? `Unable to determine authorization server for PDS: ${pdsUrl}` : `No authorization servers found for PDS: ${pdsUrl}`);
      }
      const issuer = rsMetadata.authorization_servers[0];
      options?.signal?.throwIfAborted();
      const asMetadata = await this.getAuthorizationServerMetadata(issuer, options);
      if (asMetadata.protected_resources) {
        if (!asMetadata.protected_resources.includes(rsMetadata.resource)) {
          throw new OAuthResolverError(`PDS "${pdsUrl}" not protected by issuer "${issuer}"`);
        }
      }
      return asMetadata;
    } catch (cause) {
      throw OAuthResolverError.from(cause, `Failed to resolve OAuth server metadata for resource: ${pdsUrl}`);
    }
  }
};

// node_modules/@atproto/oauth-client/dist/errors/token-refresh-error.js
var TokenRefreshError = class extends Error {
  constructor(sub, message2, options) {
    super(message2, options);
    this.sub = sub;
  }
};

// node_modules/@atproto/oauth-client/node_modules/multiformats/dist/src/bytes.js
var empty2 = new Uint8Array(0);

// node_modules/@atproto/oauth-client/node_modules/multiformats/dist/src/bases/base.js
var Encoder2 = class {
  name;
  prefix;
  baseEncode;
  constructor(name, prefix, baseEncode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
  }
  encode(bytes) {
    if (bytes instanceof Uint8Array) {
      return `${this.prefix}${this.baseEncode(bytes)}`;
    } else {
      throw Error("Unknown type, must be binary type");
    }
  }
};
var Decoder2 = class {
  name;
  prefix;
  baseDecode;
  prefixCodePoint;
  constructor(name, prefix, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    const prefixCodePoint = prefix.codePointAt(0);
    if (prefixCodePoint === void 0) {
      throw new Error("Invalid prefix character");
    }
    this.prefixCodePoint = prefixCodePoint;
    this.baseDecode = baseDecode;
  }
  decode(text) {
    if (typeof text === "string") {
      if (text.codePointAt(0) !== this.prefixCodePoint) {
        throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
      }
      return this.baseDecode(text.slice(this.prefix.length));
    } else {
      throw Error("Can only multibase decode strings");
    }
  }
  or(decoder3) {
    return or2(this, decoder3);
  }
};
var ComposedDecoder2 = class {
  decoders;
  constructor(decoders) {
    this.decoders = decoders;
  }
  or(decoder3) {
    return or2(this, decoder3);
  }
  decode(input) {
    const prefix = input[0];
    const decoder3 = this.decoders[prefix];
    if (decoder3 != null) {
      return decoder3.decode(input);
    } else {
      throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
  }
};
function or2(left, right) {
  return new ComposedDecoder2({
    ...left.decoders ?? { [left.prefix]: left },
    ...right.decoders ?? { [right.prefix]: right }
  });
}
var Codec2 = class {
  name;
  prefix;
  baseEncode;
  baseDecode;
  encoder;
  decoder;
  constructor(name, prefix, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder2(name, prefix, baseEncode);
    this.decoder = new Decoder2(name, prefix, baseDecode);
  }
  encode(input) {
    return this.encoder.encode(input);
  }
  decode(input) {
    return this.decoder.decode(input);
  }
};
function from2({ name, prefix, encode: encode4, decode: decode4 }) {
  return new Codec2(name, prefix, encode4, decode4);
}
function decode3(string, alphabetIdx, bitsPerChar, name) {
  let end = string.length;
  while (string[end - 1] === "=") {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = alphabetIdx[string[i]];
    if (value === void 0) {
      throw new SyntaxError(`Non-${name} character`);
    }
    buffer = buffer << bitsPerChar | value;
    bits += bitsPerChar;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= bitsPerChar || (255 & buffer << 8 - bits) !== 0) {
    throw new SyntaxError("Unexpected end of data");
  }
  return out;
}
function encode3(data, alphabet, bitsPerChar) {
  const pad = alphabet[alphabet.length - 1] === "=";
  const mask = (1 << bitsPerChar) - 1;
  let out = "";
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | data[i];
    bits += 8;
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & buffer >> bits];
    }
  }
  if (bits !== 0) {
    out += alphabet[mask & buffer << bitsPerChar - bits];
  }
  if (pad) {
    while ((out.length * bitsPerChar & 7) !== 0) {
      out += "=";
    }
  }
  return out;
}
function createAlphabetIdx2(alphabet) {
  const alphabetIdx = {};
  for (let i = 0; i < alphabet.length; ++i) {
    alphabetIdx[alphabet[i]] = i;
  }
  return alphabetIdx;
}
function rfc46482({ name, prefix, bitsPerChar, alphabet }) {
  const alphabetIdx = createAlphabetIdx2(alphabet);
  return from2({
    prefix,
    name,
    encode(input) {
      return encode3(input, alphabet, bitsPerChar);
    },
    decode(input) {
      return decode3(input, alphabetIdx, bitsPerChar, name);
    }
  });
}

// node_modules/@atproto/oauth-client/node_modules/multiformats/dist/src/bases/base64.js
var base642 = rfc46482({
  prefix: "m",
  name: "base64",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  bitsPerChar: 6
});
var base64pad2 = rfc46482({
  prefix: "M",
  name: "base64pad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  bitsPerChar: 6
});
var base64url2 = rfc46482({
  prefix: "u",
  name: "base64url",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  bitsPerChar: 6
});
var base64urlpad2 = rfc46482({
  prefix: "U",
  name: "base64urlpad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
  bitsPerChar: 6
});

// node_modules/@atproto/oauth-client/dist/fetch-dpop.js
var subtle = globalThis.crypto?.subtle;
var ReadableStream = globalThis.ReadableStream;
function dpopFetchWrapper({
  key,
  // @TODO we should provide a default based on specs
  supportedAlgs: supportedAlgs2,
  nonces,
  sha256 = typeof subtle !== "undefined" ? subtleSha256 : void 0,
  isAuthServer,
  fetch = globalThis.fetch
}) {
  if (!sha256) {
    throw new TypeError(`crypto.subtle is not available in this environment. Please provide a sha256 function.`);
  }
  const alg = negotiateAlg(key, supportedAlgs2);
  return async function(input, init) {
    const request = init == null && input instanceof Request ? input : new Request(input, init);
    const authorizationHeader = request.headers.get("Authorization");
    const ath = authorizationHeader?.startsWith("DPoP ") ? await sha256(authorizationHeader.slice(5)) : void 0;
    const { origin } = new URL(request.url);
    const htm = request.method;
    const htu = buildHtu(request.url);
    let initNonce;
    try {
      initNonce = await nonces.get(origin);
    } catch {
    }
    const initProof = await buildProof(key, alg, htm, htu, initNonce, ath);
    request.headers.set("DPoP", initProof);
    const initResponse = await fetch.call(this, request);
    const nextNonce = initResponse.headers.get("DPoP-Nonce");
    if (!nextNonce || nextNonce === initNonce) {
      return initResponse;
    }
    try {
      await nonces.set(origin, nextNonce);
    } catch {
    }
    const shouldRetry = await isUseDpopNonceError(initResponse, isAuthServer);
    if (!shouldRetry) {
      return initResponse;
    }
    if (input === request) {
      return initResponse;
    }
    if (ReadableStream && init?.body instanceof ReadableStream) {
      return initResponse;
    }
    await cancelBody(initResponse, "log");
    const nextProof = await buildProof(key, alg, htm, htu, nextNonce, ath);
    const nextRequest = new Request(input, init);
    nextRequest.headers.set("DPoP", nextProof);
    const retryRequest = await fetch.call(this, nextRequest);
    const retryNonce = retryRequest.headers.get("DPoP-Nonce");
    if (!retryNonce || retryNonce === initNonce) {
      return retryRequest;
    }
    try {
      await nonces.set(origin, retryNonce);
    } catch {
    }
    return retryRequest;
  };
}
function buildHtu(url) {
  const fragmentIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const end = fragmentIndex === -1 ? queryIndex : queryIndex === -1 ? fragmentIndex : Math.min(fragmentIndex, queryIndex);
  return end === -1 ? url : url.slice(0, end);
}
async function buildProof(key, alg, htm, htu, nonce, ath) {
  const jwk = key.bareJwk;
  if (!jwk) {
    throw new Error("Only asymmetric keys can be used as DPoP proofs");
  }
  const now = Math.floor(Date.now() / 1e3);
  return key.createJwt(
    // https://datatracker.ietf.org/doc/html/rfc9449#section-4.2
    {
      alg,
      typ: "dpop+jwt",
      jwk
    },
    {
      iat: now,
      // Any collision will cause the request to be rejected by the server. no biggie.
      jti: Math.random().toString(36).slice(2),
      htm,
      htu,
      nonce,
      ath
    }
  );
}
async function isUseDpopNonceError(response, isAuthServer) {
  if (isAuthServer === void 0 || isAuthServer === false) {
    if (response.status === 401) {
      const wwwAuth = response.headers.get("WWW-Authenticate");
      if (wwwAuth?.startsWith("DPoP")) {
        return wwwAuth.includes('error="use_dpop_nonce"');
      }
    }
  }
  if (isAuthServer === void 0 || isAuthServer === true) {
    if (response.status === 400) {
      try {
        const json = await peekJson(response, 10 * 1024);
        return json?.["error"] === "use_dpop_nonce";
      } catch {
        return false;
      }
    }
  }
  return false;
}
function negotiateAlg(key, supportedAlgs2) {
  if (supportedAlgs2) {
    const alg = supportedAlgs2.find((a) => key.algorithms.includes(a));
    if (alg)
      return alg;
  } else {
    const [alg] = key.algorithms;
    if (alg)
      return alg;
  }
  throw new Error("Key does not match any alg supported by the server");
}
async function subtleSha256(input) {
  if (subtle == null) {
    throw new Error(`crypto.subtle is not available in this environment. Please provide a sha256 function.`);
  }
  const bytes = new TextEncoder().encode(input);
  const digest = await subtle.digest("SHA-256", bytes);
  const digestBytes = new Uint8Array(digest);
  return base64url2.baseEncode(digestBytes);
}

// node_modules/@atproto/oauth-client/dist/oauth-response-error.js
var OAuthResponseError = class extends Error {
  constructor(response, payload) {
    const error = ifString2(payload?.["error"]);
    const errorDescription = ifString2(payload?.["error_description"]);
    const messageError = error ? `"${error}"` : "unknown";
    const messageDesc = errorDescription ? `: ${errorDescription}` : "";
    const message2 = `OAuth ${messageError} error${messageDesc}`;
    super(message2);
    this.response = response;
    this.payload = payload;
    this.error = error;
    this.errorDescription = errorDescription;
  }
  get status() {
    return this.response.status;
  }
  get headers() {
    return this.response.headers;
  }
};

// node_modules/@atproto/oauth-client/dist/oauth-server-agent.js
var OAuthServerAgent = class {
  /**
   * @throws see {@link createClientCredentialsFactory}
   */
  constructor(authMethod, dpopKey, serverMetadata, clientMetadata, dpopNonces, oauthResolver, runtime, keyset, fetch) {
    this.authMethod = authMethod;
    this.dpopKey = dpopKey;
    this.serverMetadata = serverMetadata;
    this.clientMetadata = clientMetadata;
    this.dpopNonces = dpopNonces;
    this.oauthResolver = oauthResolver;
    this.runtime = runtime;
    this.keyset = keyset;
    this.clientCredentialsFactory = createClientCredentialsFactory(authMethod, serverMetadata, clientMetadata, runtime, keyset);
    this.dpopFetch = dpopFetchWrapper({
      fetch: bindFetch(fetch),
      key: dpopKey,
      supportedAlgs: serverMetadata.dpop_signing_alg_values_supported,
      sha256: async (v) => runtime.sha256(v),
      nonces: dpopNonces,
      isAuthServer: true
    });
  }
  get issuer() {
    return this.serverMetadata.issuer;
  }
  async revoke(token) {
    try {
      await this.request("revocation", { token });
    } catch {
    }
  }
  async exchangeCode(code, codeVerifier, redirectUri) {
    const now = Date.now();
    const tokenResponse = await this.request("token", {
      grant_type: "authorization_code",
      // redirectUri should always be passed by the calling code, but if it is
      // not, default to the first redirect_uri registered for the client:
      redirect_uri: redirectUri ?? this.clientMetadata.redirect_uris[0],
      code,
      code_verifier: codeVerifier
    });
    try {
      const aud = await this.verifyIssuer(tokenResponse.sub);
      return {
        aud,
        sub: tokenResponse.sub,
        iss: this.issuer,
        scope: tokenResponse.scope,
        refresh_token: tokenResponse.refresh_token,
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_at: typeof tokenResponse.expires_in === "number" ? new Date(now + tokenResponse.expires_in * 1e3).toISOString() : void 0
      };
    } catch (err) {
      await this.revoke(tokenResponse.access_token);
      throw err;
    }
  }
  async refresh(tokenSet) {
    if (!tokenSet.refresh_token) {
      throw new TokenRefreshError(tokenSet.sub, "No refresh token available");
    }
    const aud = await this.verifyIssuer(tokenSet.sub);
    const now = Date.now();
    const tokenResponse = await this.request("token", {
      grant_type: "refresh_token",
      refresh_token: tokenSet.refresh_token
    });
    return {
      aud,
      sub: tokenSet.sub,
      iss: this.issuer,
      scope: tokenResponse.scope,
      refresh_token: tokenResponse.refresh_token,
      access_token: tokenResponse.access_token,
      token_type: tokenResponse.token_type,
      expires_at: typeof tokenResponse.expires_in === "number" ? new Date(now + tokenResponse.expires_in * 1e3).toISOString() : void 0
    };
  }
  /**
   * VERY IMPORTANT ! Always call this to process token responses.
   *
   * Whenever an OAuth token response is received, we **MUST** verify that the
   * "sub" is a DID, whose issuer authority is indeed the server we just
   * obtained credentials from. This check is a critical step to actually be
   * able to use the "sub" (DID) as being the actual user's identifier.
   *
   * @returns The user's PDS URL (the resource server for the user)
   */
  async verifyIssuer(sub) {
    const resolved = await this.oauthResolver.resolveFromIdentity(sub, {
      noCache: true,
      allowStale: false,
      signal: timeoutSignal(1e4)
    });
    if (this.issuer !== resolved.metadata.issuer) {
      throw new TypeError("Issuer mismatch");
    }
    return resolved.pds.href;
  }
  async request(endpoint, payload) {
    const url = this.serverMetadata[`${endpoint}_endpoint`];
    if (!url)
      throw new Error(`No ${endpoint} endpoint available`);
    const auth = await this.clientCredentialsFactory();
    const { response, json } = await this.dpopFetch(url, {
      method: "POST",
      headers: {
        ...auth.headers,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: wwwFormUrlEncode({ ...payload, ...auth.payload })
    }).then(fetchJsonProcessor());
    if (response.ok) {
      switch (endpoint) {
        case "token":
          return atprotoOAuthTokenResponseSchema.parse(json);
        case "pushed_authorization_request":
          return oauthParResponseSchema.parse(json);
        default:
          return json;
      }
    } else {
      throw new OAuthResponseError(response, json);
    }
  }
};
function wwwFormUrlEncode(payload) {
  return new URLSearchParams(Object.entries(payload).filter(entryHasDefinedValue).map(stringifyEntryValue)).toString();
}
function entryHasDefinedValue(entry) {
  return entry[1] !== void 0;
}
function stringifyEntryValue(entry) {
  const name = entry[0];
  const value = entry[1];
  switch (typeof value) {
    case "string":
      return [name, value];
    case "number":
    case "boolean":
      return [name, String(value)];
    default: {
      const enc = JSON.stringify(value);
      if (enc === void 0) {
        throw new Error(`Unsupported value type for ${name}: ${String(value)}`);
      }
      return [name, enc];
    }
  }
}

// node_modules/@atproto/oauth-client/dist/oauth-server-factory.js
var OAuthServerFactory = class {
  constructor(clientMetadata, runtime, resolver, fetch, keyset, dpopNonceCache) {
    this.clientMetadata = clientMetadata;
    this.runtime = runtime;
    this.resolver = resolver;
    this.fetch = fetch;
    this.keyset = keyset;
    this.dpopNonceCache = dpopNonceCache;
  }
  /**
   * @param authMethod `undefined` means that we are restoring a session that
   * was created before we started storing the `authMethod` in the session. In
   * that case, we will use the first key from the keyset.
   *
   * Support for this might be removed in the future.
   *
   * @throws see {@link OAuthServerFactory.fromMetadata}
   */
  async fromIssuer(issuer, authMethod, dpopKey, options) {
    const serverMetadata = await this.resolver.getAuthorizationServerMetadata(issuer, options);
    return this.fromMetadata(serverMetadata, authMethod, dpopKey);
  }
  /**
   * @throws see {@link OAuthServerAgent}
   */
  async fromMetadata(serverMetadata, authMethod, dpopKey) {
    return new OAuthServerAgent(authMethod, dpopKey, serverMetadata, this.clientMetadata, this.dpopNonceCache, this.resolver, this.runtime, this.keyset, this.fetch);
  }
};

// node_modules/@atproto/oauth-client/dist/errors/token-invalid-error.js
var TokenInvalidError = class extends Error {
  constructor(sub, message2 = `The session for "${sub}" is invalid`, options) {
    super(message2, options);
    this.sub = sub;
  }
};

// node_modules/@atproto/oauth-client/dist/oauth-session.js
var ReadableStream2 = globalThis.ReadableStream;
var OAuthSession = class {
  constructor(server, sub, sessionGetter, fetch = globalThis.fetch) {
    this.server = server;
    this.sub = sub;
    this.sessionGetter = sessionGetter;
    this.dpopFetch = dpopFetchWrapper({
      fetch: bindFetch(fetch),
      key: server.dpopKey,
      supportedAlgs: server.serverMetadata.dpop_signing_alg_values_supported,
      sha256: async (v) => server.runtime.sha256(v),
      nonces: server.dpopNonces,
      isAuthServer: false
    });
  }
  get did() {
    return this.sub;
  }
  get serverMetadata() {
    return this.server.serverMetadata;
  }
  /**
   * @param refresh When `true`, the credentials will be refreshed even if they
   * are not expired. When `false`, the credentials will not be refreshed even
   * if they are expired. When `undefined`, the credentials will be refreshed
   * if, and only if, they are (about to be) expired. Defaults to `undefined`.
   */
  async getTokenSet(refresh) {
    const { tokenSet } = await this.sessionGetter.getSession(this.sub, refresh);
    return tokenSet;
  }
  async getTokenInfo(refresh = "auto") {
    const tokenSet = await this.getTokenSet(refresh);
    const expiresAt = tokenSet.expires_at == null ? void 0 : new Date(tokenSet.expires_at);
    return {
      expiresAt,
      get expired() {
        return expiresAt == null ? void 0 : expiresAt.getTime() < Date.now() - 5e3;
      },
      scope: tokenSet.scope,
      iss: tokenSet.iss,
      aud: tokenSet.aud,
      sub: tokenSet.sub
    };
  }
  async signOut() {
    try {
      const tokenSet = await this.getTokenSet(false);
      await this.server.revoke(tokenSet.access_token);
    } finally {
      await this.sessionGetter.delStored(this.sub, new TokenRevokedError(this.sub));
    }
  }
  async fetchHandler(pathname, init) {
    const tokenSet = await this.getTokenSet("auto");
    const initialUrl = new URL(pathname, tokenSet.aud);
    const initialAuth = `${tokenSet.token_type} ${tokenSet.access_token}`;
    const headers = new Headers(init?.headers);
    headers.set("Authorization", initialAuth);
    const initialResponse = await this.dpopFetch(initialUrl, {
      ...init,
      headers
    });
    if (!isInvalidTokenResponse(initialResponse)) {
      return initialResponse;
    }
    let tokenSetFresh;
    try {
      tokenSetFresh = await this.getTokenSet(true);
    } catch (err) {
      return initialResponse;
    }
    if (ReadableStream2 && init?.body instanceof ReadableStream2) {
      return initialResponse;
    }
    const finalAuth = `${tokenSetFresh.token_type} ${tokenSetFresh.access_token}`;
    const finalUrl = new URL(pathname, tokenSetFresh.aud);
    headers.set("Authorization", finalAuth);
    const finalResponse = await this.dpopFetch(finalUrl, { ...init, headers });
    if (isInvalidTokenResponse(finalResponse)) {
      await this.sessionGetter.delStored(this.sub, new TokenInvalidError(this.sub));
    }
    return finalResponse;
  }
};
function isInvalidTokenResponse(response) {
  if (response.status !== 401)
    return false;
  const wwwAuth = response.headers.get("WWW-Authenticate");
  return wwwAuth != null && (wwwAuth.startsWith("Bearer ") || wwwAuth.startsWith("DPoP ")) && wwwAuth.includes('error="invalid_token"');
}

// node_modules/@atproto/oauth-client/dist/runtime.js
var Runtime = class {
  constructor(implementation) {
    this.implementation = implementation;
    const { requestLock } = implementation;
    this.hasImplementationLock = requestLock != null;
    this.usingLock = requestLock?.bind(implementation) || // Falling back to a local lock
    requestLocalLock;
  }
  async generateKey(algs) {
    const algsSorted = Array.from(algs).sort(compareAlgos);
    return this.implementation.createKey(algsSorted);
  }
  async sha256(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await this.implementation.digest(bytes, { name: "sha256" });
    return base64url2.baseEncode(digest);
  }
  async generateNonce(length = 16) {
    const bytes = await this.implementation.getRandomValues(length);
    return base64url2.baseEncode(bytes);
  }
  async generatePKCE(byteLength) {
    const verifier = await this.generateVerifier(byteLength);
    return {
      verifier,
      challenge: await this.sha256(verifier),
      method: "S256"
    };
  }
  async calculateJwkThumbprint(jwk) {
    const components = extractJktComponents(jwk);
    const data = JSON.stringify(components);
    return this.sha256(data);
  }
  /**
   * @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1}
   * @note It is RECOMMENDED that the output of a suitable random number generator
   * be used to create a 32-octet sequence. The octet sequence is then
   * base64url-encoded to produce a 43-octet URL safe string to use as the code
   * verifier.
   */
  async generateVerifier(byteLength = 32) {
    if (byteLength < 32 || byteLength > 96) {
      throw new TypeError("Invalid code_verifier length");
    }
    const bytes = await this.implementation.getRandomValues(byteLength);
    return base64url2.baseEncode(bytes);
  }
};
function extractJktComponents(jwk) {
  const get = (field) => {
    const value = jwk[field];
    if (typeof value !== "string" || !value) {
      throw new TypeError(`"${field}" Parameter missing or invalid`);
    }
    return value;
  };
  switch (jwk.kty) {
    case "EC":
      return { crv: get("crv"), kty: get("kty"), x: get("x"), y: get("y") };
    case "OKP":
      return { crv: get("crv"), kty: get("kty"), x: get("x") };
    case "RSA":
      return { e: get("e"), kty: get("kty"), n: get("n") };
    case "oct":
      return { k: get("k"), kty: get("kty") };
    default:
      throw new TypeError('"kty" (Key Type) Parameter missing or unsupported');
  }
}
function compareAlgos(a, b) {
  if (a === "ES256K")
    return -1;
  if (b === "ES256K")
    return 1;
  for (const prefix of ["ES", "PS", "RS"]) {
    if (a.startsWith(prefix)) {
      if (b.startsWith(prefix)) {
        const aLen = parseInt(a.slice(2, 5));
        const bLen = parseInt(b.slice(2, 5));
        return aLen - bLen;
      }
      return -1;
    } else if (b.startsWith(prefix)) {
      return 1;
    }
  }
  return 0;
}

// node_modules/@atproto/oauth-client/dist/session-getter.js
var __addDisposableResource = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message2) {
  var e = new Error(message2);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
function isExpectedSessionError(err) {
  return err instanceof TokenRefreshError || err instanceof TokenRevokedError || err instanceof TokenInvalidError || err instanceof AuthMethodUnsatisfiableError || // The stored session is invalid (e.g. missing properties) and cannot
  // be used properly
  err instanceof TypeError;
}
var SessionGetter = class extends CachedGetter {
  #serverFactory;
  #runtime;
  #options;
  constructor(sessionStore, serverFactory, runtime, options = {}) {
    super(async (sub, { signal }, storedSession) => {
      if (storedSession === void 0) {
        const msg = "The session was deleted by another process";
        const cause = new TokenRefreshError(sub, msg);
        await options.onSessionDeleted?.call(null, sub, cause);
        throw cause;
      }
      const { dpopKey, authMethod, tokenSet } = storedSession;
      if (sub !== tokenSet.sub) {
        throw new TokenRefreshError(sub, "Stored session sub mismatch");
      }
      if (!tokenSet.refresh_token) {
        throw new TokenRefreshError(sub, "No refresh token available");
      }
      const server = await serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey, { signal });
      signal?.throwIfAborted();
      try {
        const newTokenSet = await server.refresh(tokenSet);
        if (sub !== newTokenSet.sub) {
          throw new TokenRefreshError(sub, "Token set sub mismatch");
        }
        return {
          dpopKey,
          tokenSet: newTokenSet,
          authMethod: server.authMethod
        };
      } catch (cause) {
        if (cause instanceof OAuthResponseError && cause.status === 400 && cause.error === "invalid_grant") {
          if (!runtime.hasImplementationLock) {
            await new Promise((r) => setTimeout(r, 1e3));
            const stored = await this.getStored(sub);
            if (stored === void 0) {
              const msg2 = "The session was deleted by another process";
              throw new TokenRefreshError(sub, msg2, { cause });
            } else if (stored.tokenSet.access_token !== tokenSet.access_token || stored.tokenSet.refresh_token !== tokenSet.refresh_token) {
              return stored;
            } else {
            }
          }
          const msg = cause.errorDescription ?? "The session was revoked";
          throw new TokenRefreshError(sub, msg, { cause });
        }
        throw cause;
      }
    }, sessionStore, {
      isStale: (sub, { tokenSet }) => {
        return tokenSet.expires_at != null && new Date(tokenSet.expires_at).getTime() < Date.now() + // Add some lee way to ensure the token is not expired when it
        // reaches the server.
        1e4 + // Add some randomness to reduce the chances of multiple
        // instances trying to refresh the token at the same.
        3e4 * Math.random();
      },
      deleteOnError: isExpectedSessionError
    });
    this.#serverFactory = serverFactory;
    this.#runtime = runtime;
    this.#options = options;
  }
  async setStored(sub, session) {
    if (sub !== session.tokenSet.sub) {
      throw new Error("Token set does not match the expected sub");
    }
    try {
      await super.setStored(sub, session);
    } catch (err) {
      const errors = [err];
      try {
        const { tokenSet, dpopKey, authMethod } = session;
        const server = await this.#serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey);
        await server.revoke(tokenSet.refresh_token ?? tokenSet.access_token);
      } catch (err2) {
        errors.push(err2);
      }
      try {
        await this.delStored(sub, err);
      } catch (err2) {
        errors.push(err2);
      }
      throw new AggregateError(errors, `Failed to store session for ${sub}`);
    }
    await this.#options.onSessionUpdated?.call(null, sub, session);
  }
  async delStored(sub, cause) {
    await super.delStored(sub, cause);
    await this.#options.onSessionDeleted?.call(null, sub, cause);
  }
  async get(sub, options) {
    const session = await this.#runtime.usingLock(`@atproto-oauth-client-${sub}`, async () => {
      const env_1 = { stack: [], error: void 0, hasError: false };
      try {
        const signal = timeoutSignal(3e4);
        const abortController = __addDisposableResource(env_1, combineSignals([options?.signal, signal]), false);
        return await super.get(sub, {
          ...options,
          signal: abortController.signal
        });
      } catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
      } finally {
        __disposeResources(env_1);
      }
    });
    if (sub !== session.tokenSet.sub) {
      throw new Error("Token set does not match the expected sub");
    }
    return session;
  }
  /**
   * @param refresh When `true`, the credentials will be refreshed even if they
   * are not expired. When `false`, the credentials will not be refreshed even
   * if they are expired. When `undefined`, the credentials will be refreshed
   * if, and only if, they are (about to be) expired. Defaults to `undefined`.
   */
  async getSession(sub, refresh = "auto") {
    return this.get(sub, {
      noCache: refresh === true,
      allowStale: refresh === false
    });
  }
};

// node_modules/@atproto/oauth-client/dist/types.js
var clientMetadataSchema = oauthClientMetadataSchema.extend({
  client_id: external_exports.union([
    oauthClientIdDiscoverableSchema,
    oauthClientIdLoopbackSchema
  ])
});

// node_modules/@atproto/oauth-client/dist/validate-client-metadata.js
function validateClientMetadata(input, keyset) {
  if (!input.jwks && !input.jwks_uri && keyset?.size) {
    input = { ...input, jwks: keyset.toJSON() };
  }
  const metadata = clientMetadataSchema.parse(input);
  if (metadata.client_id.startsWith("http:")) {
    assertOAuthLoopbackClientId(metadata.client_id);
  } else {
    assertOAuthDiscoverableClientId(metadata.client_id);
  }
  const scopes = metadata.scope?.split(" ");
  if (!scopes?.includes("atproto")) {
    throw new TypeError(`Client metadata must include the "atproto" scope`);
  }
  if (!metadata.response_types.includes("code")) {
    throw new TypeError(`"response_types" must include "code"`);
  }
  if (!metadata.grant_types.includes("authorization_code")) {
    throw new TypeError(`"grant_types" must include "authorization_code"`);
  }
  const method = metadata.token_endpoint_auth_method;
  const methodAlg = metadata.token_endpoint_auth_signing_alg;
  switch (method) {
    case "none":
      if (methodAlg) {
        throw new TypeError(`"token_endpoint_auth_signing_alg" must not be provided when "token_endpoint_auth_method" is "${method}"`);
      }
      break;
    case "private_key_jwt": {
      if (!methodAlg) {
        throw new TypeError(`"token_endpoint_auth_signing_alg" must be provided when "token_endpoint_auth_method" is "${method}"`);
      }
      if (!keyset) {
        throw new TypeError(`Client authentication method "${method}" requires a keyset`);
      }
      const signingKeys = Array.from(keyset.list({ usage: "sign" })).filter((key) => key.kid);
      if (!signingKeys.length) {
        throw new TypeError(`Client authentication method "${method}" requires at least one active signing key with a "kid" property`);
      }
      if (!signingKeys.some((key) => key.algorithms.includes(FALLBACK_ALG))) {
        throw new TypeError(`Client authentication method "${method}" requires at least one active "${FALLBACK_ALG}" signing key`);
      }
      if (metadata.jwks) {
        for (const key of signingKeys) {
          if (!metadata.jwks.keys.some((k) => k.kid === key.kid && !k.revoked)) {
            throw new TypeError(`Missing or inactive key "${key.kid}" in jwks. Make sure that every signing key of the Keyset is declared as an active key in the Metadata's JWKS.`);
          }
        }
      } else if (metadata.jwks_uri) {
      } else {
        throw new TypeError(`Client authentication method "${method}" requires a JWKS`);
      }
      break;
    }
    default:
      throw new TypeError(`Unsupported "token_endpoint_auth_method" value: ${method}`);
  }
  return metadata;
}

// node_modules/@atproto/oauth-client/dist/oauth-client.js
var OAuthClient = class {
  static async fetchMetadata({ clientId, fetch = globalThis.fetch, signal }) {
    signal?.throwIfAborted();
    const request = new Request(clientId, {
      redirect: "error",
      signal
    });
    const response = await fetch(request);
    if (response.status !== 200) {
      response.body?.cancel?.();
      throw new TypeError(`Failed to fetch client metadata: ${response.status}`);
    }
    const mime = response.headers.get("content-type")?.split(";")[0].trim();
    if (mime !== "application/json") {
      response.body?.cancel?.();
      throw new TypeError(`Invalid client metadata content type: ${mime}`);
    }
    const json = await response.json();
    signal?.throwIfAborted();
    return oauthClientMetadataSchema.parse(json);
  }
  constructor(options) {
    const { stateStore, sessionStore, dpopNonceCache = new SimpleStoreMemory({ ttl: 6e4, max: 100 }), authorizationServerMetadataCache = new SimpleStoreMemory({
      ttl: 6e4,
      max: 100
    }), protectedResourceMetadataCache = new SimpleStoreMemory({
      ttl: 6e4,
      max: 100
    }), responseMode, clientMetadata, runtimeImplementation: runtimeImplementation2, keyset } = options;
    this.keyset = keyset ? keyset instanceof Keyset ? keyset : new Keyset(keyset) : void 0;
    this.clientMetadata = validateClientMetadata(clientMetadata, this.keyset);
    this.responseMode = responseMode;
    this.runtime = new Runtime(runtimeImplementation2);
    this.fetch = options.fetch ?? globalThis.fetch;
    this.oauthResolver = new OAuthResolver(createIdentityResolver(options), new OAuthProtectedResourceMetadataResolver(protectedResourceMetadataCache, this.fetch, { allowHttpResource: options.allowHttp }), new OAuthAuthorizationServerMetadataResolver(authorizationServerMetadataCache, this.fetch, { allowHttpIssuer: options.allowHttp }));
    this.serverFactory = new OAuthServerFactory(this.clientMetadata, this.runtime, this.oauthResolver, this.fetch, this.keyset, dpopNonceCache);
    this.stateStore = stateStore;
    this.sessionGetter = new SessionGetter(sessionStore, this.serverFactory, this.runtime, options);
  }
  // Exposed as public API for convenience
  get identityResolver() {
    return this.oauthResolver.identityResolver;
  }
  get jwks() {
    return this.keyset?.publicJwks ?? { keys: [] };
  }
  async authorize(input, { signal, ...options } = {}) {
    const redirectUri = options?.redirect_uri ?? this.clientMetadata.redirect_uris[0];
    if (!this.clientMetadata.redirect_uris.includes(redirectUri)) {
      throw new TypeError("Invalid redirect_uri");
    }
    const { identityInfo, metadata } = await this.oauthResolver.resolve(input, {
      signal
    });
    const pkce = await this.runtime.generatePKCE();
    const dpopKey = await this.runtime.generateKey(metadata.dpop_signing_alg_values_supported || [FALLBACK_ALG]);
    const authMethod = negotiateClientAuthMethod(metadata, this.clientMetadata, this.keyset);
    const state = await this.runtime.generateNonce();
    await this.stateStore.set(state, {
      iss: metadata.issuer,
      dpopKey,
      authMethod,
      verifier: pkce.verifier,
      appState: options?.state
    });
    const parameters = {
      ...options,
      client_id: this.clientMetadata.client_id,
      redirect_uri: redirectUri,
      code_challenge: pkce.challenge,
      code_challenge_method: pkce.method,
      state,
      login_hint: identityInfo ? identityInfo.handle !== HANDLE_INVALID ? identityInfo.handle : identityInfo.did : void 0,
      response_mode: this.responseMode,
      response_type: "code",
      scope: options?.scope ?? this.clientMetadata.scope
    };
    const authorizationUrl = new URL(metadata.authorization_endpoint);
    if (authorizationUrl.protocol !== "https:" && authorizationUrl.protocol !== "http:") {
      throw new TypeError(`Invalid authorization endpoint protocol: ${authorizationUrl.protocol}`);
    }
    if (metadata.pushed_authorization_request_endpoint) {
      const server = await this.serverFactory.fromMetadata(metadata, authMethod, dpopKey);
      const parResponse = await server.request("pushed_authorization_request", parameters);
      authorizationUrl.searchParams.set("client_id", this.clientMetadata.client_id);
      authorizationUrl.searchParams.set("request_uri", parResponse.request_uri);
      return authorizationUrl;
    } else if (metadata.require_pushed_authorization_requests) {
      throw new Error("Server requires pushed authorization requests (PAR) but no PAR endpoint is available");
    } else {
      for (const [key, value] of Object.entries(parameters)) {
        if (value)
          authorizationUrl.searchParams.set(key, String(value));
      }
      const urlLength = authorizationUrl.pathname.length + authorizationUrl.search.length;
      if (urlLength < 2048) {
        return authorizationUrl;
      } else if (!metadata.pushed_authorization_request_endpoint) {
        throw new Error("Login URL too long");
      }
    }
    throw new Error("Server does not support pushed authorization requests (PAR)");
  }
  /**
   * This method allows the client to proactively revoke the request_uri it
   * created through PAR.
   */
  async abortRequest(authorizeUrl) {
    const requestUri = authorizeUrl.searchParams.get("request_uri");
    if (!requestUri)
      return;
  }
  async callback(params, options = {}) {
    const responseJwt = params.get("response");
    if (responseJwt != null) {
      throw new OAuthCallbackError(params, "JARM not supported");
    }
    const issuerParam = params.get("iss");
    const stateParam = params.get("state");
    const errorParam = params.get("error");
    const codeParam = params.get("code");
    if (!stateParam) {
      throw new OAuthCallbackError(params, 'Missing "state" parameter');
    }
    const stateData = await this.stateStore.get(stateParam);
    if (stateData) {
      await this.stateStore.del(stateParam);
    } else {
      throw new OAuthCallbackError(params, `Unknown authorization session "${stateParam}"`);
    }
    try {
      if (errorParam != null) {
        throw new OAuthCallbackError(params, void 0, stateData.appState);
      }
      if (!codeParam) {
        throw new OAuthCallbackError(params, 'Missing "code" query param', stateData.appState);
      }
      const server = await this.serverFactory.fromIssuer(stateData.iss, stateData.authMethod, stateData.dpopKey);
      if (issuerParam != null) {
        if (!server.issuer) {
          throw new OAuthCallbackError(params, "Issuer not found in metadata", stateData.appState);
        }
        if (server.issuer !== issuerParam) {
          throw new OAuthCallbackError(params, "Issuer mismatch", stateData.appState);
        }
      } else if (server.serverMetadata.authorization_response_iss_parameter_supported) {
        throw new OAuthCallbackError(params, "iss missing from the response", stateData.appState);
      }
      const tokenSet = await server.exchangeCode(codeParam, stateData.verifier, options?.redirect_uri ?? server.clientMetadata.redirect_uris[0]);
      try {
        await this.revoke(tokenSet.sub);
      } catch {
      }
      try {
        await this.sessionGetter.setStored(tokenSet.sub, {
          dpopKey: stateData.dpopKey,
          authMethod: server.authMethod,
          tokenSet
        });
        const session = this.createSession(server, tokenSet.sub);
        return { session, state: stateData.appState ?? null };
      } catch (err) {
        await server.revoke(tokenSet.refresh_token || tokenSet.access_token);
        throw err;
      }
    } catch (err) {
      throw OAuthCallbackError.from(err, params, stateData.appState);
    }
  }
  /**
   * Load a stored session. This will refresh the token only if needed (about to
   * expire) by default.
   *
   * @see {@link SessionGetter.restore}
   */
  async restore(sub, refresh = "auto") {
    assertAtprotoDid(sub);
    const { dpopKey, authMethod, tokenSet } = await this.sessionGetter.getSession(sub, refresh);
    try {
      const server = await this.serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey, {
        noCache: refresh === true,
        allowStale: refresh === false
      });
      return this.createSession(server, sub);
    } catch (err) {
      if (err instanceof AuthMethodUnsatisfiableError) {
        await this.sessionGetter.delStored(sub, err);
      }
      throw err;
    }
  }
  async revoke(sub) {
    assertAtprotoDid(sub);
    const res = await this.sessionGetter.getSession(sub, false).catch((err) => {
      if (isExpectedSessionError(err))
        return null;
      throw err;
    });
    if (!res)
      return;
    const { dpopKey, authMethod, tokenSet } = res;
    try {
      const server = await this.serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey);
      await server.revoke(tokenSet.access_token);
    } finally {
      await this.sessionGetter.delStored(sub, new TokenRevokedError(sub));
    }
  }
  createSession(server, sub) {
    return new OAuthSession(server, sub, this.sessionGetter, this.fetch);
  }
};

// node_modules/@atproto/oauth-client-browser/dist/indexed-db/db.js
var import_dispose3 = __toESM(require_dispose(), 1);

// node_modules/@atproto/oauth-client-browser/dist/indexed-db/db-transaction.js
var import_dispose2 = __toESM(require_dispose(), 1);

// node_modules/@atproto/oauth-client-browser/dist/indexed-db/util.js
function handleRequest(request, onSuccess, onError) {
  const cleanup = () => {
    request.removeEventListener("success", success);
    request.removeEventListener("error", error);
  };
  const success = () => {
    onSuccess(request.result);
    cleanup();
  };
  const error = () => {
    onError(request.error || new Error("Unknown error"));
    cleanup();
  };
  request.addEventListener("success", success);
  request.addEventListener("error", error);
}
function promisify(request) {
  return new Promise((resolve, reject) => {
    handleRequest(request, resolve, reject);
  });
}

// node_modules/@atproto/oauth-client-browser/dist/indexed-db/db-index.js
var DBIndex = class {
  constructor(idbIndex) {
    this.idbIndex = idbIndex;
  }
  count(query) {
    return promisify(this.idbIndex.count(query));
  }
  get(query) {
    return promisify(this.idbIndex.get(query));
  }
  getKey(query) {
    return promisify(this.idbIndex.getKey(query));
  }
  getAll(query, count) {
    return promisify(this.idbIndex.getAll(query, count));
  }
  getAllKeys(query, count) {
    return promisify(this.idbIndex.getAllKeys(query, count));
  }
  deleteAll(query) {
    return new Promise((resolve, reject) => {
      const result = this.idbIndex.openCursor(query);
      result.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      result.onerror = function(event) {
        reject(event.target?.error || new Error("Unexpected error"));
      };
    });
  }
};

// node_modules/@atproto/oauth-client-browser/dist/indexed-db/db-object-store.js
var DBObjectStore = class {
  constructor(idbObjStore) {
    this.idbObjStore = idbObjStore;
  }
  get name() {
    return this.idbObjStore.name;
  }
  index(name) {
    return new DBIndex(this.idbObjStore.index(name));
  }
  get(key) {
    return promisify(this.idbObjStore.get(key));
  }
  getKey(query) {
    return promisify(this.idbObjStore.getKey(query));
  }
  getAll(query, count) {
    return promisify(this.idbObjStore.getAll(query, count));
  }
  getAllKeys(query, count) {
    return promisify(this.idbObjStore.getAllKeys(query, count));
  }
  add(value, key) {
    return promisify(this.idbObjStore.add(value, key));
  }
  put(value, key) {
    return promisify(this.idbObjStore.put(value, key));
  }
  delete(key) {
    return promisify(this.idbObjStore.delete(key));
  }
  clear() {
    return promisify(this.idbObjStore.clear());
  }
};

// node_modules/@atproto/oauth-client-browser/dist/indexed-db/db-transaction.js
var DBTransaction = class {
  #tx;
  constructor(tx) {
    this.#tx = tx;
    const onAbort = () => {
      cleanup();
    };
    const onComplete = () => {
      cleanup();
    };
    const cleanup = () => {
      this.#tx = null;
      tx.removeEventListener("abort", onAbort);
      tx.removeEventListener("complete", onComplete);
    };
    tx.addEventListener("abort", onAbort);
    tx.addEventListener("complete", onComplete);
  }
  get tx() {
    if (!this.#tx)
      throw new Error("Transaction already ended");
    return this.#tx;
  }
  async abort() {
    const { tx } = this;
    this.#tx = null;
    tx.abort();
  }
  async commit() {
    const { tx } = this;
    this.#tx = null;
    tx.commit?.();
  }
  objectStore(name) {
    const store = this.tx.objectStore(name);
    return new DBObjectStore(store);
  }
  [Symbol.dispose]() {
    if (this.#tx)
      this.commit();
  }
};

// node_modules/@atproto/oauth-client-browser/dist/indexed-db/db.js
var DB = class _DB {
  static async open(dbName, migrations, txOptions) {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, migrations.length);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = ({ oldVersion, newVersion }) => {
        const db2 = request.result;
        try {
          for (let version = oldVersion; version < (newVersion ?? migrations.length); ++version) {
            const migration = migrations[version];
            if (migration)
              migration(db2);
            else
              throw new Error(`Missing migration for version ${version}`);
          }
        } catch (err) {
          db2.close();
          reject(err);
        }
      };
    });
    return new _DB(db, txOptions);
  }
  #db;
  constructor(db, txOptions) {
    this.txOptions = txOptions;
    this.#db = db;
    const cleanup = () => {
      this.#db = null;
      db.removeEventListener("versionchange", cleanup);
      db.removeEventListener("close", cleanup);
      db.close();
    };
    db.addEventListener("versionchange", cleanup);
    db.addEventListener("close", cleanup);
  }
  get db() {
    if (!this.#db)
      throw new Error("Database closed");
    return this.#db;
  }
  get name() {
    return this.db.name;
  }
  get objectStoreNames() {
    return this.db.objectStoreNames;
  }
  get version() {
    return this.db.version;
  }
  async transaction(storeNames, mode, run) {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = this.db.transaction(storeNames, mode, this.txOptions);
        let result = { done: false };
        tx.oncomplete = () => {
          if (result.done)
            resolve(result.value);
          else
            reject(new Error("Transaction completed without result"));
        };
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
        try {
          const value = await run(new DBTransaction(tx));
          result = { done: true, value };
          tx.commit();
        } catch (err) {
          tx.abort();
          throw err;
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  close() {
    const { db } = this;
    this.#db = null;
    db.close();
  }
  async [Symbol.asyncDispose]() {
    if (this.#db)
      await this.close();
  }
};

// node_modules/@atproto/oauth-client-browser/dist/browser-oauth-database.js
function encodeKey(key) {
  if (!(key instanceof WebcryptoKey) || !key.kid) {
    throw new Error("Invalid key object");
  }
  return {
    keyId: key.kid,
    keyPair: key.cryptoKeyPair
  };
}
async function decodeKey(encoded) {
  return WebcryptoKey.fromKeypair(encoded.keyPair, encoded.keyId);
}
var STORES = [
  "state",
  "session",
  "didCache",
  "dpopNonceCache",
  "handleCache",
  "authorizationServerMetadataCache",
  "protectedResourceMetadataCache"
];
var BrowserOAuthDatabase = class {
  #dbPromise;
  #cleanupInterval;
  constructor(options) {
    this.#dbPromise = DB.open(options?.name ?? "@atproto-oauth-client", [
      (db) => {
        for (const name of STORES) {
          const store = db.createObjectStore(name, { autoIncrement: true });
          store.createIndex("expiresAt", "expiresAt", { unique: false });
        }
      }
    ], { durability: options?.durability ?? "strict" });
    this.#cleanupInterval = setInterval(() => {
      void this.cleanup();
    }, options?.cleanupInterval ?? 3e4);
  }
  async run(storeName, mode, fn) {
    const db = await this.#dbPromise;
    return await db.transaction([storeName], mode, (tx) => fn(tx.objectStore(storeName)));
  }
  createStore(name, { encode: encode4, decode: decode4, expiresAt }) {
    return {
      get: async (key) => {
        const item = await this.run(name, "readonly", (store) => store.get(key));
        if (item === void 0)
          return void 0;
        if (item.expiresAt != null && new Date(item.expiresAt) < /* @__PURE__ */ new Date()) {
          await this.run(name, "readwrite", (store) => store.delete(key));
          return void 0;
        }
        return decode4(item.value);
      },
      set: async (key, value) => {
        const item = {
          value: await encode4(value),
          expiresAt: expiresAt(value)?.toISOString()
        };
        await this.run(name, "readwrite", (store) => store.put(item, key));
      },
      del: async (key) => {
        await this.run(name, "readwrite", (store) => store.delete(key));
      }
    };
  }
  getSessionStore() {
    return this.createStore("session", {
      expiresAt: ({ tokenSet }) => tokenSet.refresh_token || tokenSet.expires_at == null ? null : new Date(tokenSet.expires_at),
      encode: ({ dpopKey, ...session }) => ({
        ...session,
        dpopKey: encodeKey(dpopKey)
      }),
      decode: async ({ dpopKey, ...encoded }) => ({
        ...encoded,
        dpopKey: await decodeKey(dpopKey)
      })
    });
  }
  getStateStore() {
    return this.createStore("state", {
      expiresAt: (_value) => new Date(Date.now() + 10 * 6e4),
      encode: ({ dpopKey, ...session }) => ({
        ...session,
        dpopKey: encodeKey(dpopKey)
      }),
      decode: async ({ dpopKey, ...encoded }) => ({
        ...encoded,
        dpopKey: await decodeKey(dpopKey)
      })
    });
  }
  getDpopNonceCache() {
    return this.createStore("dpopNonceCache", {
      expiresAt: (_value) => new Date(Date.now() + 6e5),
      encode: (value) => value,
      decode: (encoded) => encoded
    });
  }
  getDidCache() {
    return this.createStore("didCache", {
      expiresAt: (_value) => new Date(Date.now() + 6e4),
      encode: (value) => value,
      decode: (encoded) => encoded
    });
  }
  getHandleCache() {
    return this.createStore("handleCache", {
      expiresAt: (_value) => new Date(Date.now() + 6e4),
      encode: (value) => value,
      decode: (encoded) => encoded
    });
  }
  getAuthorizationServerMetadataCache() {
    return this.createStore("authorizationServerMetadataCache", {
      expiresAt: (_value) => new Date(Date.now() + 6e4),
      encode: (value) => value,
      decode: (encoded) => encoded
    });
  }
  getProtectedResourceMetadataCache() {
    return this.createStore("protectedResourceMetadataCache", {
      expiresAt: (_value) => new Date(Date.now() + 6e4),
      encode: (value) => value,
      decode: (encoded) => encoded
    });
  }
  async cleanup() {
    const db = await this.#dbPromise;
    for (const name of STORES) {
      await db.transaction([name], "readwrite", (tx) => tx.objectStore(name).index("expiresAt").deleteAll(IDBKeyRange.upperBound(Date.now())));
    }
  }
  async [Symbol.asyncDispose]() {
    clearInterval(this.#cleanupInterval);
    this.#cleanupInterval = void 0;
    const dbPromise = this.#dbPromise;
    this.#dbPromise = Promise.reject(new Error("Database has been disposed"));
    this.#dbPromise.catch(() => null);
    const db = await dbPromise.catch(() => null);
    if (db)
      await db[Symbol.asyncDispose]();
  }
};

// node_modules/@atproto/oauth-client-browser/dist/browser-runtime-implementation.js
var nativeRequestLock = typeof navigator !== "undefined" && navigator.locks?.request ? (name, fn) => navigator.locks.request(name, { mode: "exclusive" }, async () => fn()) : void 0;
var BrowserRuntimeImplementation = class {
  constructor() {
    this.requestLock = nativeRequestLock;
    if (typeof crypto !== "object" || !crypto?.subtle) {
      throw new Error("Crypto with CryptoSubtle is required. If running in a browser, make sure the current page is loaded over HTTPS.");
    }
    if (!this.requestLock) {
      console.warn("Locks API not available. You should consider using a more recent browser.");
    }
  }
  async createKey(algs) {
    return WebcryptoKey.generate(algs);
  }
  getRandomValues(byteLength) {
    return crypto.getRandomValues(new Uint8Array(byteLength));
  }
  async digest(data, { name }) {
    switch (name) {
      case "sha256":
      case "sha384":
      case "sha512": {
        const buf = await crypto.subtle.digest(`SHA-${name.slice(3)}`, data);
        return new Uint8Array(buf);
      }
      default:
        throw new Error(`Unsupported digest algorithm: ${name}`);
    }
  }
};

// node_modules/@atproto/oauth-client-browser/dist/errors.js
var LoginContinuedInParentWindowError = class extends Error {
  constructor() {
    super("Login complete, please close the popup window.");
    this.code = "LOGIN_CONTINUED_IN_PARENT_WINDOW";
  }
};

// node_modules/@atproto/oauth-client-browser/dist/util.js
function buildLoopbackClientId(location2, localhost = "127.0.0.1") {
  if (!isLoopbackHost(location2.hostname)) {
    throw new TypeError(`Expected a loopback host, got ${location2.hostname}`);
  }
  const redirectUri = `http://${location2.hostname === "localhost" ? localhost : location2.hostname}${location2.port && !location2.port.startsWith(":") ? `:${location2.port}` : location2.port}${location2.pathname}`;
  return `http://localhost${location2.pathname === "/" ? "" : location2.pathname}?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

// node_modules/@atproto/oauth-client-browser/dist/browser-oauth-client.js
var NAMESPACE = `@@atproto/oauth-client-browser`;
var POPUP_CHANNEL_NAME = `${NAMESPACE}(popup-channel)`;
var POPUP_STATE_PREFIX = `${NAMESPACE}(popup-state):`;
var syncChannel = new BroadcastChannel(`${NAMESPACE}(synchronization-channel:2)`);
var runtimeImplementation = new BrowserRuntimeImplementation();
var BrowserOAuthClient = class _BrowserOAuthClient extends OAuthClient {
  static async load({ clientId, ...options }) {
    if (clientId.startsWith("http:")) {
      const clientMetadata = atprotoLoopbackClientMetadata(clientId);
      return new _BrowserOAuthClient({ clientMetadata, ...options });
    } else if (clientId.startsWith("https:")) {
      assertOAuthDiscoverableClientId(clientId);
      const clientMetadata = await OAuthClient.fetchMetadata({
        clientId,
        ...options
      });
      return new _BrowserOAuthClient({ ...options, clientMetadata });
    } else {
      throw new TypeError(`Invalid client id: ${clientId}`);
    }
  }
  constructor({
    clientMetadata = atprotoLoopbackClientMetadata(buildLoopbackClientId(window.location)),
    // "fragment" is a safer default as the query params will not be sent to the server
    responseMode = "fragment",
    ...options
  }) {
    if (!globalThis.crypto?.subtle) {
      throw new Error("WebCrypto API is required");
    }
    if (!["query", "fragment"].includes(responseMode)) {
      throw new TypeError(`Invalid response mode: ${responseMode}`);
    }
    const database = new BrowserOAuthDatabase();
    super({
      ...options,
      clientMetadata,
      responseMode,
      keyset: void 0,
      runtimeImplementation,
      sessionStore: database.getSessionStore(),
      stateStore: database.getStateStore(),
      didCache: database.getDidCache(),
      handleCache: database.getHandleCache(),
      dpopNonceCache: database.getDpopNonceCache(),
      authorizationServerMetadataCache: database.getAuthorizationServerMetadataCache(),
      protectedResourceMetadataCache: database.getProtectedResourceMetadataCache(),
      onSessionDeleted: async (sub, cause) => {
        if (localStorage.getItem(`${NAMESPACE}(sub)`) === sub) {
          localStorage.removeItem(`${NAMESPACE}(sub)`);
        }
        syncChannel.postMessage({
          name: "onSessionDeleted",
          args: [sub, cause]
        });
        return options.onSessionDeleted?.call(null, sub, cause);
      },
      onSessionUpdated: async (sub, session) => {
        syncChannel.postMessage({
          name: "onSessionUpdated",
          args: [sub, session]
        });
        return options.onSessionUpdated?.call(null, sub, session);
      }
    });
    this.ac = new AbortController();
    this.database = database;
    const { signal } = this.ac;
    syncChannel.addEventListener(
      "message",
      (event) => {
        if (event.source === window)
          return;
        const { name, args } = event.data;
        const hook = options[name];
        void hook?.(...args);
      },
      // Remove the listener when the client is disposed
      { signal }
    );
  }
  /**
   * This method will automatically restore any existing session, or attempt to
   * process login callback if the URL contains oauth parameters.
   *
   * Use {@link BrowserOAuthClient.initCallback} instead of this method if you
   * want to force a login callback. This can be esp. useful if you are using
   * this lib from a framework that has some kind of URL manipulation (like a
   * client side router).
   *
   * Use {@link BrowserOAuthClient.initRestore} instead of this method if you
   * want to only restore existing sessions, and bypass the automatic processing
   * of login callbacks.
   */
  async init(refresh) {
    const params = this.readCallbackParams();
    if (params) {
      const redirectUri = this.findRedirectUrl();
      if (redirectUri)
        return this.initCallback(params, redirectUri);
    }
    return this.initRestore(refresh);
  }
  async initRestore(refresh) {
    await fixLocation(this.clientMetadata);
    const sub = localStorage.getItem(`${NAMESPACE}(sub)`);
    if (sub) {
      try {
        const session = await this.restore(sub, refresh);
        return { session };
      } catch (err) {
        localStorage.removeItem(`${NAMESPACE}(sub)`);
        throw err;
      }
    }
  }
  async restore(sub, refresh) {
    const session = await super.restore(sub, refresh);
    localStorage.setItem(`${NAMESPACE}(sub)`, session.sub);
    return session;
  }
  async revoke(sub) {
    localStorage.removeItem(`${NAMESPACE}(sub)`);
    return super.revoke(sub);
  }
  async signIn(input, options) {
    if (options?.display === "popup") {
      return this.signInPopup(input, options);
    } else {
      return this.signInRedirect(input, options);
    }
  }
  async signInRedirect(input, options) {
    const url = await this.authorize(input, options);
    window.location.href = url.href;
    return new Promise((resolve, reject) => {
      setTimeout((err) => {
        this.abortRequest(url).then(() => reject(err), (reason) => reject(new AggregateError([err, reason])));
      }, 5e3, new Error("User navigated back"));
    });
  }
  async signInPopup(input, options) {
    const popupTarget = options?.popupName ?? "_blank";
    const popupFeatures = options?.popupFeatures ?? "width=600,height=600,menubar=no,toolbar=no";
    let popup = window.open("about:blank", popupTarget, popupFeatures);
    const stateKey = `${Math.random().toString(36).slice(2)}`;
    const url = await this.authorize(input, {
      ...options,
      state: `${POPUP_STATE_PREFIX}${stateKey}`,
      display: options?.display ?? "popup"
    });
    options?.signal?.throwIfAborted();
    if (popup) {
      popup.window.location.href = url.href;
    } else {
      popup = window.open(url.href, popupTarget, popupFeatures);
    }
    popup?.focus();
    return new Promise((resolve, reject) => {
      const popupChannel = new BroadcastChannel(POPUP_CHANNEL_NAME);
      const cleanup = () => {
        clearTimeout(timeout);
        popupChannel.removeEventListener("message", onMessage);
        popupChannel.close();
        options?.signal?.removeEventListener("abort", cancel);
        popup?.close();
      };
      const cancel = () => {
        reject(new Error(options?.signal?.aborted ? "Aborted" : "Timeout"));
        cleanup();
      };
      options?.signal?.addEventListener("abort", cancel);
      const timeout = setTimeout(cancel, 5 * 6e4);
      const onMessage = async ({ data }) => {
        if (data.key !== stateKey)
          return;
        if (!("result" in data))
          return;
        popupChannel.postMessage({ key: stateKey, ack: true });
        cleanup();
        const { result } = data;
        if (result.status === "fulfilled") {
          const sub = result.value;
          try {
            options?.signal?.throwIfAborted();
            resolve(await this.restore(sub, false));
          } catch (err) {
            reject(err);
            void this.revoke(sub);
          }
        } else {
          const { message: message2, params } = result.reason;
          reject(new OAuthCallbackError(new URLSearchParams(params), message2));
        }
      };
      popupChannel.addEventListener("message", onMessage);
    });
  }
  findRedirectUrl() {
    for (const uri of this.clientMetadata.redirect_uris) {
      const url = new URL(uri);
      if (location.origin === url.origin && location.pathname === url.pathname) {
        return uri;
      }
    }
    return void 0;
  }
  readCallbackParams() {
    const params = this.responseMode === "fragment" ? new URLSearchParams(location.hash.slice(1)) : new URLSearchParams(location.search);
    if (!params.has("state") || !(params.has("code") || params.has("error"))) {
      return null;
    }
    return params;
  }
  async initCallback(params = this.readCallbackParams(), redirectUri = this.findRedirectUrl()) {
    if (!params) {
      throw new TypeError("No OAuth callback parameters found in the URL");
    }
    if (this.responseMode === "fragment") {
      history.replaceState(null, "", location.pathname + location.search);
    } else if (this.responseMode === "query") {
      history.replaceState(null, "", location.pathname);
    }
    const sendPopupResult = (message2) => {
      const popupChannel = new BroadcastChannel(POPUP_CHANNEL_NAME);
      return new Promise((resolve) => {
        const cleanup = (result) => {
          clearTimeout(timer);
          popupChannel.removeEventListener("message", onMessage);
          popupChannel.close();
          resolve(result);
        };
        const onMessage = ({ data }) => {
          if ("ack" in data && message2.key === data.key)
            cleanup(true);
        };
        popupChannel.addEventListener("message", onMessage);
        popupChannel.postMessage(message2);
        const timer = setTimeout(cleanup, 500, false);
      });
    };
    return this.callback(params, { redirect_uri: redirectUri }).then(async (result) => {
      if (result.state?.startsWith(POPUP_STATE_PREFIX)) {
        const receivedByParent = await sendPopupResult({
          key: result.state.slice(POPUP_STATE_PREFIX.length),
          result: {
            status: "fulfilled",
            value: result.session.sub
          }
        });
        if (!receivedByParent)
          await result.session.signOut();
        throw new LoginContinuedInParentWindowError();
      }
      localStorage.setItem(`${NAMESPACE}(sub)`, result.session.sub);
      return result;
    }).catch(async (err) => {
      if (err instanceof OAuthCallbackError && err.state?.startsWith(POPUP_STATE_PREFIX)) {
        await sendPopupResult({
          key: err.state.slice(POPUP_STATE_PREFIX.length),
          result: {
            status: "rejected",
            reason: {
              message: err.message,
              params: Array.from(err.params.entries())
            }
          }
        });
        throw new LoginContinuedInParentWindowError();
      }
      throw err;
    }).catch((err) => {
      if (err instanceof LoginContinuedInParentWindowError) {
        window.close();
      }
      throw err;
    });
  }
  async [Symbol.asyncDispose]() {
    try {
      this.ac.abort();
    } finally {
      await this.database[Symbol.asyncDispose]();
    }
  }
  async dispose() {
    await this[Symbol.asyncDispose]();
  }
};
function fixLocation(clientMetadata) {
  if (!isOAuthClientIdLoopback(clientMetadata.client_id))
    return;
  if (window.location.hostname !== "localhost")
    return;
  const locationUrl = new URL(window.location.href);
  for (const uri of clientMetadata.redirect_uris) {
    const url = new URL(uri);
    if ((url.hostname === "127.0.0.1" || url.hostname === "[::1]") && (!url.port || url.port === locationUrl.port) && url.protocol === locationUrl.protocol && url.pathname === locationUrl.pathname) {
      url.port = locationUrl.port;
      window.location.href = url.href;
      throw new Error("Redirecting to loopback IP...");
    }
  }
  throw new Error(`Please use the loopback IP address instead of ${locationUrl}`);
}
export {
  ATPROTO_SCOPE_VALUE,
  ATPROTO_VERIFICATION_METHOD_TYPES,
  AtprotoDohHandleResolver,
  AtprotoHandleResolver,
  BrowserOAuthClient,
  CLIENT_ASSERTION_TYPE_JWT_BEARER,
  CachedHandleResolver,
  DEFAULT_ATPROTO_OAUTH_SCOPE,
  DEFAULT_LOOPBACK_CLIENT_REDIRECT_URIS,
  DID_PLC_PREFIX,
  DID_PREFIX,
  DID_WEB_PREFIX,
  DidCacheMemory,
  DidError,
  DidPlcMethod,
  DidResolverCached,
  DidResolverCommon,
  DidWebMethod,
  ERR_JWKS_NO_MATCHING_KEY,
  ERR_JWK_INVALID,
  ERR_JWK_NOT_FOUND,
  ERR_JWT_CREATE,
  ERR_JWT_INVALID,
  ERR_JWT_VERIFY,
  FetchError,
  FetchRequestError,
  FetchResponseError,
  HandleResolverError,
  InvalidDidError,
  JwkError,
  JwtCreateError,
  JwtVerifyError,
  KEY_USAGE,
  Key,
  Keyset,
  LOOPBACK_CLIENT_ID_ORIGIN,
  LoginContinuedInParentWindowError,
  OAUTH_ENDPOINT_NAMES,
  OAUTH_SCOPE_REGEXP,
  OAuthAuthorizationServerMetadataResolver,
  OAuthCallbackError,
  OAuthClient,
  OAuthProtectedResourceMetadataResolver,
  OAuthResolverError,
  OAuthResponseError,
  OAuthServerAgent,
  OAuthServerFactory,
  OAuthSession,
  PRIVATE_KEY_USAGE,
  PUBLIC_KEY_USAGE,
  SessionGetter,
  TokenInvalidError,
  TokenRefreshError,
  TokenRevokedError,
  ZodError as ValidationError,
  WebcryptoKey,
  XrpcHandleResolver,
  arrayEquivalent,
  asArray,
  asAtprotoDid,
  asAtprotoOAuthScope,
  asDid,
  asDidPlc,
  asDidWeb,
  asOAuthClientIdLoopback,
  asResolvedHandle,
  assertAtprotoDid,
  assertAtprotoDidWeb,
  assertAtprotoOAuthScope,
  assertDid,
  assertDidMethod,
  assertDidMsid,
  assertDidPlc,
  assertDidWeb,
  assertOAuthDiscoverableClientId,
  assertOAuthLoopbackClientId,
  atprotoDidSchema,
  atprotoLoopbackClientMetadata,
  atprotoOAuthScopeSchema,
  atprotoOAuthTokenResponseSchema,
  buildAtprotoLoopbackClientId,
  buildAtprotoLoopbackClientMetadata,
  buildDidWebDocumentUrl,
  buildDidWebUrl,
  buildLoopbackClientId,
  canParseUrl,
  clientMetadataSchema,
  conventionalOAuthClientIdSchema,
  createDidResolver,
  createHandleResolver,
  dangerousUriSchema,
  didDocumentSchema,
  didDocumentValidator,
  didSchema,
  didWebToUrl,
  extractAtprotoData,
  extractDidMethod,
  extractPdsUrl,
  extractUrlPath,
  hasKid,
  hasPrivateSecretJwk,
  hasSharedSecretJwk,
  httpsUriSchema,
  htuSchema,
  includedIn,
  isAtprotoAka,
  isAtprotoDid,
  isAtprotoDidRefAbsolute,
  isAtprotoDidWeb,
  isAtprotoOAuthScope,
  isAtprotoPersonalDataServerService,
  isAtprotoVerificationMethod,
  isConventionalOAuthClientId,
  isDid,
  isDidPlc,
  isDidRefAbsolute,
  isDidRefRelative,
  isDidWeb,
  isEncKeyUsage,
  isExpectedSessionError,
  isHostnameIP,
  isLocalHostname,
  isLoopbackHost,
  isOAuthClientIdDiscoverable,
  isOAuthClientIdLoopback,
  isOAuthScope,
  isPrivateJwk,
  isPrivateKeyUsage,
  isPublicJwk,
  isPublicKeyUsage,
  isResolvedHandle,
  isSigKeyUsage,
  isSignedJwt,
  isSpaceSeparatedValue,
  isUnsignedJwt,
  jsonObjectPreprocess,
  jwkAlgorithms,
  jwkPrivateSchema,
  jwkPubSchema,
  jwkSchema,
  jwkValidator,
  jwksPubSchema,
  jwksSchema,
  jwtHeaderSchema,
  jwtPayloadSchema,
  keyUsageSchema,
  loopbackRedirectURISchema,
  loopbackUriSchema,
  matchesIdentifier,
  numberPreprocess,
  oauthAccessTokenSchema,
  oauthAuthorizationCodeGrantTokenRequestSchema,
  oauthAuthorizationDetailSchema,
  oauthAuthorizationDetailsSchema,
  oauthAuthorizationRequestJarSchema,
  oauthAuthorizationRequestParSchema,
  oauthAuthorizationRequestParametersSchema,
  oauthAuthorizationRequestQuerySchema,
  oauthAuthorizationRequestUriSchema,
  oauthAuthorizationResponseErrorSchema,
  oauthAuthorizationServerMetadataSchema,
  oauthAuthorizationServerMetadataValidator,
  oauthClientCredentialsGrantTokenRequestSchema,
  oauthClientCredentialsJwtBearerSchema,
  oauthClientCredentialsNoneSchema,
  oauthClientCredentialsSchema,
  oauthClientCredentialsSecretPostSchema,
  oauthClientIdDiscoverableSchema,
  oauthClientIdLoopbackSchema,
  oauthClientIdSchema,
  oauthClientMetadataSchema,
  oauthEndpointAuthMethod,
  oauthGrantTypeSchema,
  oauthIssuerIdentifierSchema,
  oauthLoopbackClientRedirectUriSchema,
  oauthParResponseSchema,
  oauthPasswordGrantTokenRequestSchema,
  oauthPromptModeSchema,
  oauthProtectedResourceMetadataSchema,
  oauthRedirectUriSchema,
  oauthRefreshTokenGrantTokenRequestSchema,
  oauthRefreshTokenSchema,
  oauthRequestUriSchema,
  oauthResponseModeSchema,
  oauthResponseTypeSchema,
  oauthScopeSchema,
  oauthTokenIdentificationSchema,
  oauthTokenRequestSchema,
  oauthTokenResponseSchema,
  oauthTokenTypeSchema,
  oidcAuthorizationResponseErrorSchema,
  oidcClaimsParameterSchema,
  oidcClaimsPropertiesSchema,
  oidcEntityTypeSchema,
  oidcUserinfoSchema,
  parseAtprotoLoopbackClientId,
  parseOAuthDiscoverableClientId,
  parseOAuthLoopbackClientId,
  privateKeyUsageSchema,
  privateUseUriSchema,
  publicKeyUsageSchema,
  requestLocalLock,
  safeParseOAuthLoopbackClientId,
  safeParseOAuthLoopbackClientIdQueryString,
  safeUrl,
  signedJwtSchema,
  unsafeDecodeJwt,
  unsignedJwtSchema,
  urlToDidWeb,
  webUriSchema,
  xrpcErrorSchema
};
