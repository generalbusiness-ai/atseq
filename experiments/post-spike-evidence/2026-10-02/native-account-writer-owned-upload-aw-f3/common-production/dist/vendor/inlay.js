//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var tslib_es6_exports = /* @__PURE__ */ __exportAll({
	__addDisposableResource: () => __addDisposableResource,
	__assign: () => __assign,
	__asyncDelegator: () => __asyncDelegator,
	__asyncGenerator: () => __asyncGenerator,
	__asyncValues: () => __asyncValues,
	__await: () => __await,
	__awaiter: () => __awaiter,
	__classPrivateFieldGet: () => __classPrivateFieldGet,
	__classPrivateFieldIn: () => __classPrivateFieldIn,
	__classPrivateFieldSet: () => __classPrivateFieldSet,
	__createBinding: () => __createBinding,
	__decorate: () => __decorate,
	__disposeResources: () => __disposeResources,
	__esDecorate: () => __esDecorate,
	__exportStar: () => __exportStar,
	__extends: () => __extends,
	__generator: () => __generator,
	__importDefault: () => __importDefault,
	__importStar: () => __importStar,
	__makeTemplateObject: () => __makeTemplateObject,
	__metadata: () => __metadata,
	__param: () => __param,
	__propKey: () => __propKey,
	__read: () => __read,
	__rest: () => __rest,
	__rewriteRelativeImportExtension: () => __rewriteRelativeImportExtension,
	__runInitializers: () => __runInitializers,
	__setFunctionName: () => __setFunctionName,
	__spread: () => __spread,
	__spreadArray: () => __spreadArray,
	__spreadArrays: () => __spreadArrays,
	__values: () => __values,
	default: () => tslib_es6_default
});
function __extends(d, b) {
	if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	extendStatics(d, b);
	function __() {
		this.constructor = d;
	}
	d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __rest(s, e) {
	var t = {};
	for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	if (s != null && typeof Object.getOwnPropertySymbols === "function") {
		for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
	}
	return t;
}
function __decorate(decorators, target, key, desc) {
	var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
	return function(target, key) {
		decorator(target, key, paramIndex);
	};
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
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
}
function __runInitializers(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
}
function __propKey(x) {
	return typeof x === "symbol" ? x : "".concat(x);
}
function __setFunctionName(f, name, prefix) {
	if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
	return Object.defineProperty(f, "name", {
		configurable: true,
		value: prefix ? "".concat(prefix, " ", name) : name
	});
}
function __metadata(metadataKey, metadataValue) {
	if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
}
function __generator(thisArg, body) {
	var _ = {
		label: 0,
		sent: function() {
			if (t[0] & 1) throw t[1];
			return t[1];
		},
		trys: [],
		ops: []
	}, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
	return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
		return this;
	}), g;
	function verb(n) {
		return function(v) {
			return step([n, v]);
		};
	}
	function step(op) {
		if (f) throw new TypeError("Generator is already executing.");
		while (g && (g = 0, op[0] && (_ = 0)), _) try {
			if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
			if (y = 0, t) op = [op[0] & 2, t.value];
			switch (op[0]) {
				case 0:
				case 1:
					t = op;
					break;
				case 4:
					_.label++;
					return {
						value: op[1],
						done: false
					};
				case 5:
					_.label++;
					y = op[1];
					op = [0];
					continue;
				case 7:
					op = _.ops.pop();
					_.trys.pop();
					continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
						_ = 0;
						continue;
					}
					if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
						_.label = op[1];
						break;
					}
					if (op[0] === 6 && _.label < t[1]) {
						_.label = t[1];
						t = op;
						break;
					}
					if (t && _.label < t[2]) {
						_.label = t[2];
						_.ops.push(op);
						break;
					}
					if (t[2]) _.ops.pop();
					_.trys.pop();
					continue;
			}
			op = body.call(thisArg, _);
		} catch (e) {
			op = [6, e];
			y = 0;
		} finally {
			f = t = 0;
		}
		if (op[0] & 5) throw op[1];
		return {
			value: op[0] ? op[1] : void 0,
			done: true
		};
	}
}
function __exportStar(m, o) {
	for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
	var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
	if (m) return m.call(o);
	if (o && typeof o.length === "number") return { next: function() {
		if (o && i >= o.length) o = void 0;
		return {
			value: o && o[i++],
			done: !o
		};
	} };
	throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
	var m = typeof Symbol === "function" && o[Symbol.iterator];
	if (!m) return o;
	var i = m.call(o), r, ar = [], e;
	try {
		while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	} catch (error) {
		e = { error };
	} finally {
		try {
			if (r && !r.done && (m = i["return"])) m.call(i);
		} finally {
			if (e) throw e.error;
		}
	}
	return ar;
}
/** @deprecated */
function __spread() {
	for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
	return ar;
}
/** @deprecated */
function __spreadArrays() {
	for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
	for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
	return r;
}
function __spreadArray(to, from, pack) {
	if (pack || arguments.length === 2) {
		for (var i = 0, l = from.length, ar; i < l; i++) if (ar || !(i in from)) {
			if (!ar) ar = Array.prototype.slice.call(from, 0, i);
			ar[i] = from[i];
		}
	}
	return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
	return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var g = generator.apply(thisArg, _arguments || []), i, q = [];
	return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
		return this;
	}, i;
	function awaitReturn(f) {
		return function(v) {
			return Promise.resolve(v).then(f, reject);
		};
	}
	function verb(n, f) {
		if (g[n]) {
			i[n] = function(v) {
				return new Promise(function(a, b) {
					q.push([
						n,
						v,
						a,
						b
					]) > 1 || resume(n, v);
				});
			};
			if (f) i[n] = f(i[n]);
		}
	}
	function resume(n, v) {
		try {
			step(g[n](v));
		} catch (e) {
			settle(q[0][3], e);
		}
	}
	function step(r) {
		r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
	}
	function fulfill(value) {
		resume("next", value);
	}
	function reject(value) {
		resume("throw", value);
	}
	function settle(f, v) {
		if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
	}
}
function __asyncDelegator(o) {
	var i = {}, p;
	return verb("next"), verb("throw", function(e) {
		throw e;
	}), verb("return"), i[Symbol.iterator] = function() {
		return this;
	}, i;
	function verb(n, f) {
		i[n] = o[n] ? function(v) {
			return (p = !p) ? {
				value: __await(o[n](v)),
				done: false
			} : f ? f(v) : v;
		} : f;
	}
}
function __asyncValues(o) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var m = o[Symbol.asyncIterator], i;
	return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
		return this;
	}, i);
	function verb(n) {
		i[n] = o[n] && function(v) {
			return new Promise(function(resolve, reject) {
				v = o[n](v), settle(resolve, reject, v.done, v.value);
			});
		};
	}
	function settle(resolve, reject, d, v) {
		Promise.resolve(v).then(function(v) {
			resolve({
				value: v,
				done: d
			});
		}, reject);
	}
}
function __makeTemplateObject(cooked, raw) {
	if (Object.defineProperty) Object.defineProperty(cooked, "raw", { value: raw });
	else cooked.raw = raw;
	return cooked;
}
function __importStar(mod) {
	if (mod && mod.__esModule) return mod;
	var result = {};
	if (mod != null) {
		for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	}
	__setModuleDefault(result, mod);
	return result;
}
function __importDefault(mod) {
	return mod && mod.__esModule ? mod : { default: mod };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
	if (kind === "m") throw new TypeError("Private method is not writable");
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
	return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldIn(state, receiver) {
	if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
	return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
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
		env.stack.push({
			value,
			dispose,
			async
		});
	} else if (async) env.stack.push({ async: true });
	return value;
}
function __disposeResources(env) {
	function fail(e) {
		env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
		env.hasError = true;
	}
	var r, s = 0;
	function next() {
		while (r = env.stack.pop()) try {
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
		if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
		if (env.hasError) throw env.error;
	}
	return next();
}
function __rewriteRelativeImportExtension(path, preserveJsx) {
	if (typeof path === "string" && /^\.\.?\//.test(path)) return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
		return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
	});
	return path;
}
var extendStatics, __assign, __createBinding, __setModuleDefault, ownKeys, _SuppressedError, tslib_es6_default;
var init_tslib_es6 = __esmMin((() => {
	extendStatics = function(d, b) {
		extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
			d.__proto__ = b;
		} || function(d, b) {
			for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
		};
		return extendStatics(d, b);
	};
	__assign = function() {
		__assign = Object.assign || function __assign(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i];
				for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
			}
			return t;
		};
		return __assign.apply(this, arguments);
	};
	__createBinding = Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	});
	__setModuleDefault = Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	};
	ownKeys = function(o) {
		ownKeys = Object.getOwnPropertyNames || function(o) {
			var ar = [];
			for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
			return ar;
		};
		return ownKeys(o);
	};
	_SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
		var e = new Error(message);
		return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
	};
	tslib_es6_default = {
		__extends,
		__assign,
		__rest,
		__decorate,
		__param,
		__esDecorate,
		__runInitializers,
		__propKey,
		__setFunctionName,
		__metadata,
		__awaiter,
		__generator,
		__createBinding,
		__exportStar,
		__values,
		__read,
		__spread,
		__spreadArrays,
		__spreadArray,
		__await,
		__asyncGenerator,
		__asyncDelegator,
		__asyncValues,
		__makeTemplateObject,
		__importStar,
		__importDefault,
		__classPrivateFieldGet,
		__classPrivateFieldSet,
		__classPrivateFieldIn,
		__addDisposableResource,
		__disposeResources,
		__rewriteRelativeImportExtension
	};
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/did.js
var require_did$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDidError = void 0;
	exports.ensureValidDid = ensureValidDid;
	exports.ensureValidDidRegex = ensureValidDidRegex;
	exports.isValidDid = isValidDid;
	function ensureValidDid(input) {
		if (!input.startsWith("did:")) throw new InvalidDidError("DID requires \"did:\" prefix");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
		if (input.endsWith(":") || input.endsWith("%")) throw new InvalidDidError("DID can not end with \":\" or \"%\"");
		if (!/^[a-zA-Z0-9._:%-]*$/.test(input)) throw new InvalidDidError("Disallowed characters in DID (ASCII letters, digits, and a couple other characters only)");
		const { length, 1: method } = input.split(":");
		if (length < 3) throw new InvalidDidError("DID requires prefix, method, and method-specific content");
		if (!/^[a-z]+$/.test(method)) throw new InvalidDidError("DID method must be lower-case letters");
	}
	var DID_REGEX = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
	function ensureValidDidRegex(input) {
		if (!DID_REGEX.test(input)) throw new InvalidDidError("DID didn't validate via regex");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
	}
	function isValidDid(input) {
		return input.length <= 2048 && DID_REGEX.test(input);
	}
	var InvalidDidError = class extends Error {};
	exports.InvalidDidError = InvalidDidError;
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/handle.js
var require_handle$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DisallowedDomainError = exports.UnsupportedDomainError = exports.ReservedHandleError = exports.InvalidHandleError = exports.DISALLOWED_TLDS = exports.INVALID_HANDLE = void 0;
	exports.ensureValidHandle = ensureValidHandle;
	exports.ensureValidHandleRegex = ensureValidHandleRegex;
	exports.normalizeHandle = normalizeHandle;
	exports.normalizeAndEnsureValidHandle = normalizeAndEnsureValidHandle;
	exports.isValidHandle = isValidHandle;
	exports.isValidTld = isValidTld;
	exports.INVALID_HANDLE = "handle.invalid";
	exports.DISALLOWED_TLDS = [
		".local",
		".arpa",
		".invalid",
		".localhost",
		".internal",
		".example",
		".alt",
		".onion"
	];
	function ensureValidHandle(input) {
		if (!/^[a-zA-Z0-9.-]*$/.test(input)) throw new InvalidHandleError("Disallowed characters in handle (ASCII letters, digits, dashes, periods only)");
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		const labels = input.split(".");
		if (labels.length < 2) throw new InvalidHandleError("Handle domain needs at least two parts");
		for (let i = 0; i < labels.length; i++) {
			const l = labels[i];
			if (l.length < 1) throw new InvalidHandleError("Handle parts can not be empty");
			if (l.length > 63) throw new InvalidHandleError("Handle part too long (max 63 chars)");
			if (l.endsWith("-") || l.startsWith("-")) throw new InvalidHandleError("Handle parts can not start or end with hyphens");
			if (i + 1 === labels.length && !/^[a-zA-Z]/.test(l)) throw new InvalidHandleError("Handle final component (TLD) must start with ASCII letter");
		}
	}
	var HANDLE_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
	function ensureValidHandleRegex(input) {
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		if (!HANDLE_REGEX.test(input)) throw new InvalidHandleError("Handle didn't validate via regex");
	}
	function normalizeHandle(handle) {
		return handle.toLowerCase();
	}
	function normalizeAndEnsureValidHandle(handle) {
		const normalized = normalizeHandle(handle);
		ensureValidHandle(normalized);
		return normalized;
	}
	function isValidHandle(input) {
		return input.length <= 253 && HANDLE_REGEX.test(input);
	}
	function isValidTld(handle) {
		for (const tld of exports.DISALLOWED_TLDS) if (handle.endsWith(tld)) return false;
		return true;
	}
	var InvalidHandleError = class extends Error {};
	exports.InvalidHandleError = InvalidHandleError;
	/** @deprecated Never used */
	var ReservedHandleError = class extends Error {};
	exports.ReservedHandleError = ReservedHandleError;
	/** @deprecated Never used */
	var UnsupportedDomainError = class extends Error {};
	exports.UnsupportedDomainError = UnsupportedDomainError;
	/** @deprecated Never used */
	var DisallowedDomainError = class extends Error {};
	exports.DisallowedDomainError = DisallowedDomainError;
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/at-identifier.js
var require_at_identifier$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ensureValidAtIdentifier = ensureValidAtIdentifier;
	exports.isValidAtIdentifier = isValidAtIdentifier;
	var did_js_1 = require_did$4();
	var handle_js_1 = require_handle$4();
	function ensureValidAtIdentifier(input) {
		try {
			if (input.startsWith("did:")) (0, did_js_1.ensureValidDidRegex)(input);
			else (0, handle_js_1.ensureValidHandleRegex)(input);
		} catch (cause) {
			throw new handle_js_1.InvalidHandleError("Invalid DID or handle", { cause });
		}
	}
	function isValidAtIdentifier(input) {
		if (input.startsWith("did:")) return (0, did_js_1.isValidDid)(input);
		else return (0, handle_js_1.isValidHandle)(input);
	}
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/nsid.js
var require_nsid$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidNsidError = exports.NSID = void 0;
	exports.ensureValidNsid = ensureValidNsid;
	exports.parseNsid = parseNsid;
	exports.isValidNsid = isValidNsid;
	exports.validateNsid = validateNsid;
	exports.ensureValidNsidRegex = ensureValidNsidRegex;
	exports.validateNsidRegex = validateNsidRegex;
	exports.NSID = class NSID {
		segments;
		static parse(input) {
			return new NSID(input);
		}
		static create(authority, name) {
			const input = [...authority.split(".").reverse(), name].join(".");
			return new NSID(input);
		}
		static isValid(nsid) {
			return isValidNsid(nsid);
		}
		static from(input) {
			if (input instanceof NSID) return input;
			if (Array.isArray(input)) return new NSID(input.join("."));
			return new NSID(String(input));
		}
		constructor(nsid) {
			this.segments = parseNsid(nsid);
		}
		get authority() {
			return this.segments.slice(0, this.segments.length - 1).reverse().join(".");
		}
		get name() {
			return this.segments.at(this.segments.length - 1);
		}
		toString() {
			return this.segments.join(".");
		}
	};
	function ensureValidNsid(input) {
		const result = validateNsid(input);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	function parseNsid(nsid) {
		const result = validateNsid(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
		return result.value;
	}
	function isValidNsid(input) {
		return validateNsidRegex(input).success;
	}
	function validateNsid(input) {
		if (input.length > 317) return {
			success: false,
			message: "NSID is too long (317 chars max)"
		};
		if (hasDisallowedCharacters(input)) return {
			success: false,
			message: "Disallowed characters in NSID (ASCII letters, digits, dashes, periods only)"
		};
		const segments = input.split(".");
		if (segments.length < 3) return {
			success: false,
			message: "NSID needs at least three parts"
		};
		for (const l of segments) {
			if (l.length < 1) return {
				success: false,
				message: "NSID parts can not be empty"
			};
			if (l.length > 63) return {
				success: false,
				message: "NSID part too long (max 63 chars)"
			};
			if (startsWithHyphen(l) || endsWithHyphen(l)) return {
				success: false,
				message: "NSID parts can not start or end with hyphen"
			};
		}
		if (startsWithNumber(segments[0])) return {
			success: false,
			message: "NSID first part may not start with a digit"
		};
		if (!isValidIdentifier(segments[segments.length - 1])) return {
			success: false,
			message: "NSID name part must be only letters and digits (and no leading digit)"
		};
		return {
			success: true,
			value: segments
		};
	}
	function hasDisallowedCharacters(v) {
		return !/^[a-zA-Z0-9.-]*$/.test(v);
	}
	function startsWithNumber(v) {
		const charCode = v.charCodeAt(0);
		return charCode >= 48 && charCode <= 57;
	}
	function startsWithHyphen(v) {
		return v.charCodeAt(0) === 45;
	}
	function endsWithHyphen(v) {
		return v.charCodeAt(v.length - 1) === 45;
	}
	function isValidIdentifier(v) {
		return !startsWithNumber(v) && !v.includes("-");
	}
	/**
	* @deprecated Use {@link ensureValidNsid} if you care about error details,
	* {@link parseNsid}/{@link NSID.parse} if you need the parsed segments, or
	* {@link isValidNsid} if you just want a boolean.
	*/
	function ensureValidNsidRegex(nsid) {
		const result = validateNsidRegex(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	/**
	* Regexp based validation that behaves identically to the previous code but
	* provides less detailed error messages (while being 20% to 50% faster).
	*/
	function validateNsidRegex(value) {
		if (value.length > 317) return {
			success: false,
			message: "NSID is too long (317 chars max)"
		};
		if (!/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(value)) return {
			success: false,
			message: "NSID didn't validate via regex"
		};
		return {
			success: true,
			value
		};
	}
	var InvalidNsidError = class extends Error {};
	exports.InvalidNsidError = InvalidNsidError;
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/aturi_validation.js
var require_aturi_validation$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ensureValidAtUri = ensureValidAtUri;
	exports.ensureValidAtUriRegex = ensureValidAtUriRegex;
	exports.isValidAtUri = isValidAtUri;
	var at_identifier_js_1 = require_at_identifier$4();
	var did_js_1 = require_did$4();
	var handle_js_1 = require_handle$4();
	var nsid_js_1 = require_nsid$4();
	function ensureValidAtUri(input) {
		const fragmentIndex = input.indexOf("#");
		if (fragmentIndex !== -1) {
			if (input.charCodeAt(fragmentIndex + 1) !== 47) throw new Error("ATURI fragment must be non-empty and start with slash");
			if (input.includes("#", fragmentIndex + 1)) throw new Error("ATURI can have at most one \"#\", separating fragment out");
			const fragment = input.slice(fragmentIndex + 1);
			if (!/^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/.test(fragment)) throw new Error("Disallowed characters in ATURI fragment (ASCII)");
		}
		const uri = fragmentIndex === -1 ? input : input.slice(0, fragmentIndex);
		if (uri.length > 8192) throw new Error("ATURI is far too long");
		if (!uri.startsWith("at://")) throw new Error("ATURI must start with \"at://\"");
		if (!/^[a-zA-Z0-9._~:@!$&')(*+,;=%/-]*$/.test(uri)) throw new Error("Disallowed characters in ATURI (ASCII)");
		const authorityEnd = uri.indexOf("/", 5);
		const authority = authorityEnd === -1 ? uri.slice(5) : uri.slice(5, authorityEnd);
		try {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(authority);
		} catch (cause) {
			throw new Error("ATURI authority must be a valid handle or DID", { cause });
		}
		const collectionStart = authorityEnd === -1 ? -1 : authorityEnd + 1;
		const collectionEnd = collectionStart === -1 ? -1 : uri.indexOf("/", collectionStart);
		if (collectionStart !== -1) {
			const collection = collectionEnd === -1 ? uri.slice(collectionStart) : uri.slice(collectionStart, collectionEnd);
			if (collection.length === 0) throw new Error("ATURI can not have a slash after authority without a path segment");
			if (!(0, nsid_js_1.isValidNsid)(collection)) throw new Error("ATURI requires first path segment (if supplied) to be valid NSID");
		}
		const recordKeyStart = collectionEnd === -1 ? -1 : collectionEnd + 1;
		const recordKeyEnd = recordKeyStart === -1 ? -1 : uri.indexOf("/", recordKeyStart);
		if (recordKeyStart !== -1) {
			if (recordKeyStart === uri.length) throw new Error("ATURI can not have a slash after collection, unless record key is provided");
		}
		if (recordKeyEnd !== -1) throw new Error("ATURI path can have at most two parts, and no trailing slash");
	}
	function ensureValidAtUriRegex(input) {
		const rm = input.match(/^at:\/\/(?<authority>[a-zA-Z0-9._:%-]+)(\/(?<collection>[a-zA-Z0-9-.]+)(\/(?<rkey>[a-zA-Z0-9._~:@!$&%')(*+,;=-]+))?)?(#(?<fragment>\/[a-zA-Z0-9._~:@!$&%')(*+,;=\-[\]/\\]*))?$/);
		if (!rm || !rm.groups) throw new Error("ATURI didn't validate via regex");
		const groups = rm.groups;
		try {
			(0, handle_js_1.ensureValidHandleRegex)(groups.authority);
		} catch {
			try {
				(0, did_js_1.ensureValidDidRegex)(groups.authority);
			} catch {
				throw new Error("ATURI authority must be a valid handle or DID");
			}
		}
		if (groups.collection && !(0, nsid_js_1.isValidNsid)(groups.collection)) throw new Error("ATURI collection path segment must be a valid NSID");
		if (input.length > 8192) throw new Error("ATURI is far too long");
	}
	function isValidAtUri(input) {
		try {
			ensureValidAtUriRegex(input);
		} catch {
			return false;
		}
		return true;
	}
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/aturi.js
var require_aturi$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AtUri = exports.ATP_URI_REGEX = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var at_identifier_js_1 = require_at_identifier$4();
	var nsid_js_1 = require_nsid$4();
	tslib_1.__exportStar(require_aturi_validation$4(), exports);
	exports.ATP_URI_REGEX = /^(at:\/\/)?((?:did:[a-z0-9:%-]+)|(?:[a-z0-9][a-z0-9.:-]*))(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	var RELATIVE_REGEX = /^(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	exports.AtUri = class AtUri {
		hash;
		host;
		pathname;
		searchParams;
		constructor(uri, base) {
			const parsed = base !== void 0 ? typeof base === "string" ? Object.assign(parse(base), parseRelative(uri)) : Object.assign({ host: base.host }, parseRelative(uri)) : parse(uri);
			(0, at_identifier_js_1.ensureValidAtIdentifier)(parsed.host);
			this.hash = parsed.hash ?? "";
			this.host = parsed.host;
			this.pathname = parsed.pathname ?? "";
			this.searchParams = parsed.searchParams;
		}
		static make(handleOrDid, collection, rkey) {
			let str = handleOrDid;
			if (collection) str += "/" + collection;
			if (rkey) str += "/" + rkey;
			return new AtUri(str);
		}
		get protocol() {
			return "at:";
		}
		get origin() {
			return `at://${this.host}`;
		}
		get hostname() {
			return this.host;
		}
		set hostname(v) {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(v);
			this.host = v;
		}
		get search() {
			return this.searchParams.toString();
		}
		set search(v) {
			this.searchParams = new URLSearchParams(v);
		}
		get collection() {
			return this.pathname.split("/").filter(Boolean)[0] || "";
		}
		set collection(v) {
			(0, nsid_js_1.ensureValidNsid)(v);
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] = v;
			this.pathname = parts.join("/");
		}
		get rkey() {
			return this.pathname.split("/").filter(Boolean)[1] || "";
		}
		set rkey(v) {
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] ||= "undefined";
			parts[1] = v;
			this.pathname = parts.join("/");
		}
		get href() {
			return this.toString();
		}
		toString() {
			let path = this.pathname || "/";
			if (!path.startsWith("/")) path = `/${path}`;
			let qs = "";
			if (this.searchParams.size) qs = `?${this.searchParams.toString()}`;
			let hash = this.hash;
			if (hash && !hash.startsWith("#")) hash = `#${hash}`;
			return `at://${this.host}${path}${qs}${hash}`;
		}
	};
	function parse(str) {
		const match = str.match(exports.ATP_URI_REGEX);
		if (!match) throw new Error(`Invalid AT uri: ${str}`);
		return {
			host: match[2],
			hash: match[5],
			pathname: match[3],
			searchParams: new URLSearchParams(match[4])
		};
	}
	function parseRelative(str) {
		const match = str.match(RELATIVE_REGEX);
		if (!match) throw new Error(`Invalid path: ${str}`);
		return {
			hash: match[3],
			pathname: match[1],
			searchParams: new URLSearchParams(match[2])
		};
	}
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/datetime.js
var require_datetime$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDatetimeError = exports.normalizeDatetimeAlways = void 0;
	exports.ensureValidDatetime = ensureValidDatetime;
	exports.isValidDatetime = isValidDatetime;
	exports.normalizeDatetime = normalizeDatetime;
	function ensureValidDatetime(input) {
		const date = new Date(input);
		if (isNaN(date.getTime())) throw new InvalidDatetimeError("datetime did not parse as ISO 8601");
		if (date.toISOString().startsWith("-")) throw new InvalidDatetimeError("datetime normalized to a negative time");
		if (!/^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-6][0-9]:[0-6][0-9](.[0-9]{1,20})?(Z|([+-][0-2][0-9]:[0-5][0-9]))$/.test(input)) throw new InvalidDatetimeError("datetime didn't validate via regex");
		if (input.length > 64) throw new InvalidDatetimeError("datetime is too long (64 chars max)");
		if (input.endsWith("-00:00")) throw new InvalidDatetimeError("datetime can not use \"-00:00\" for UTC timezone");
		if (input.startsWith("000")) throw new InvalidDatetimeError("datetime so close to year zero not allowed");
	}
	function isValidDatetime(input) {
		try {
			ensureValidDatetime(input);
		} catch (err) {
			return false;
		}
		return true;
	}
	function normalizeDatetime(dtStr) {
		if (isValidDatetime(dtStr)) {
			const outStr = new Date(dtStr).toISOString();
			if (isValidDatetime(outStr)) return outStr;
		}
		if (!/.*(([+-]\d\d:?\d\d)|[a-zA-Z])$/.test(dtStr)) {
			const date = /* @__PURE__ */ new Date(dtStr + "Z");
			if (!isNaN(date.getTime())) {
				const tzStr = date.toISOString();
				if (isValidDatetime(tzStr)) return tzStr;
			}
		}
		const date = new Date(dtStr);
		if (isNaN(date.getTime())) throw new InvalidDatetimeError("datetime did not parse as any timestamp format");
		const isoStr = date.toISOString();
		if (isValidDatetime(isoStr)) return isoStr;
		else throw new InvalidDatetimeError("datetime normalized to invalid timestamp string");
	}
	var normalizeDatetimeAlways = (dtStr) => {
		try {
			return normalizeDatetime(dtStr);
		} catch (err) {
			if (err instanceof InvalidDatetimeError) return (/* @__PURE__ */ new Date(0)).toISOString();
			throw err;
		}
	};
	exports.normalizeDatetimeAlways = normalizeDatetimeAlways;
	var InvalidDatetimeError = class extends Error {};
	exports.InvalidDatetimeError = InvalidDatetimeError;
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/language.js
var require_language$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLanguageString = parseLanguageString;
	exports.isValidLanguage = isValidLanguage;
	var BCP47_REGEXP = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>x(-[A-Za-z0-9]{1,8})+))$/;
	function parseLanguageString(input) {
		const parsed = input.match(BCP47_REGEXP);
		if (!parsed?.groups) return null;
		const { groups } = parsed;
		return {
			grandfathered: groups.grandfathered,
			language: groups.language,
			extlang: groups.extlang,
			script: groups.script,
			region: groups.region,
			variant: groups.variant,
			extension: groups.extension,
			privateUse: groups.privateUseA || groups.privateUseB
		};
	}
	/**
	* Validates well-formed BCP 47 syntax
	*
	* @see {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1}
	*/
	function isValidLanguage(input) {
		return BCP47_REGEXP.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/recordkey.js
var require_recordkey$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidRecordKeyError = void 0;
	exports.ensureValidRecordKey = ensureValidRecordKey;
	exports.isValidRecordKey = isValidRecordKey;
	var RECORD_KEY_MAX_LENGTH = 512;
	var RECORD_KEY_MIN_LENGTH = 1;
	var RECORD_KEY_INVALID_VALUES = /* @__PURE__ */ new Set([".", ".."]);
	var RECORD_KEY_REGEX = /^[a-zA-Z0-9_~.:-]{1,512}$/;
	function ensureValidRecordKey(input) {
		if (input.length > RECORD_KEY_MAX_LENGTH || input.length < RECORD_KEY_MIN_LENGTH) throw new InvalidRecordKeyError(`record key must be ${RECORD_KEY_MIN_LENGTH} to ${RECORD_KEY_MAX_LENGTH} characters`);
		if (RECORD_KEY_INVALID_VALUES.has(input)) throw new InvalidRecordKeyError("record key can not be \".\" or \"..\"");
		if (!RECORD_KEY_REGEX.test(input)) throw new InvalidRecordKeyError("record key syntax not valid (regex)");
	}
	function isValidRecordKey(input) {
		return input.length >= RECORD_KEY_MIN_LENGTH && input.length <= RECORD_KEY_MAX_LENGTH && RECORD_KEY_REGEX.test(input) && !RECORD_KEY_INVALID_VALUES.has(input);
	}
	var InvalidRecordKeyError = class extends Error {};
	exports.InvalidRecordKeyError = InvalidRecordKeyError;
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/tid.js
var require_tid$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidTidError = void 0;
	exports.ensureValidTid = ensureValidTid;
	exports.isValidTid = isValidTid;
	var TID_LENGTH = 13;
	var TID_REGEX = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
	function ensureValidTid(input) {
		if (input.length !== TID_LENGTH) throw new InvalidTidError(`TID must be ${TID_LENGTH} characters`);
		if (!TID_REGEX.test(input)) throw new InvalidTidError("TID syntax not valid (regex)");
	}
	function isValidTid(input) {
		return input.length === TID_LENGTH && TID_REGEX.test(input);
	}
	var InvalidTidError = class extends Error {};
	exports.InvalidTidError = InvalidTidError;
}));
//#endregion
//#region node_modules/@inlay/core/node_modules/@atproto/syntax/dist/uri.js
var require_uri$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isValidUri = isValidUri;
	function isValidUri(input) {
		return /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/core/dist/element.js
var import_dist$3 = (/* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_at_identifier$4(), exports);
	tslib_1.__exportStar(require_aturi$4(), exports);
	tslib_1.__exportStar(require_datetime$4(), exports);
	tslib_1.__exportStar(require_did$4(), exports);
	tslib_1.__exportStar(require_handle$4(), exports);
	tslib_1.__exportStar(require_nsid$4(), exports);
	tslib_1.__exportStar(require_language$4(), exports);
	tslib_1.__exportStar(require_recordkey$4(), exports);
	tslib_1.__exportStar(require_tid$5(), exports);
	tslib_1.__exportStar(require_uri$4(), exports);
})))();
var BRAND = Symbol.for("$");
function createElement(type, key, props) {
	const el = {
		$: BRAND,
		type
	};
	if (key != null) el.key = key;
	if (props != null) el.props = props;
	return el;
}
function isValidElement(value) {
	return typeof value === "object" && value !== null && value.$ === BRAND;
}
function keyStaticChildren(children) {
	if (Array.isArray(children)) return children.map((child, i) => isValidElement(child) && child.key == null ? {
		...child,
		key: String(i)
	} : child);
	if (isValidElement(children) && children.key == null) return {
		...children,
		key: "0"
	};
	return children;
}
//#endregion
//#region node_modules/@inlay/core/dist/index.js
function $(modOrNsid, config, ...children) {
	const nsid = typeof modOrNsid === "string" ? ((0, import_dist$3.ensureValidNsid)(modOrNsid), modOrNsid) : modOrNsid.$nsid;
	const { key, ...rest } = config ?? {};
	return createElement(nsid, key, children.length > 0 ? {
		...rest,
		children: keyStaticChildren(children)
	} : rest);
}
function walkTree(tree, mapObject) {
	return walk(tree);
	function walk(value) {
		if (value == null || typeof value !== "object") return value;
		if (Array.isArray(value)) return value.map(walk);
		return mapObject(value, walk);
	}
}
function serializeTree(tree, visitor) {
	return walkTree(tree, (obj, walk) => {
		if (visitor && obj.$ === BRAND) {
			const result = visitor(obj);
			if (result !== obj) return walk(result);
		}
		const out = {};
		for (const [k, v] of Object.entries(obj)) if (v === BRAND) out[k] = "$";
		else if (typeof v === "string" && v.startsWith("$")) out[k] = "$" + v;
		else out[k] = walk(v);
		return out;
	});
}
function deserializeTree(tree, visitor) {
	return walkTree(tree, (obj, walk) => {
		const out = {};
		for (const [k, v] of Object.entries(obj)) if (v === "$") out[k] = BRAND;
		else if (typeof v === "string" && v.startsWith("$$")) out[k] = v.slice(1);
		else out[k] = walk(v);
		if (visitor && out.$ === BRAND) {
			const result = visitor(out);
			if (result !== out) return result;
		}
		return out;
	});
}
/**
* Walk a value tree resolving Binding elements via a caller-provided resolver.
* Recurses into plain objects and arrays. Non-Binding elements are opaque —
* they are NOT recursed into (their props are rendered separately by renderNode).
*/
function resolveBindings(tree, resolve) {
	return walkTree(tree, (obj, walk) => {
		if (obj.$ === BRAND) {
			const el = obj;
			if (el.type === "at.inlay.Binding") {
				const path = el.props?.path;
				if (!Array.isArray(path)) throw new Error("Binding missing path");
				return resolve(path);
			}
			return obj;
		}
		const out = {};
		for (const [k, v] of Object.entries(obj)) out[k] = walk(v);
		return out;
	});
}
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/did.js
var require_did$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDidError = void 0;
	exports.ensureValidDid = ensureValidDid;
	exports.ensureValidDidRegex = ensureValidDidRegex;
	exports.isValidDid = isValidDid;
	function ensureValidDid(input) {
		if (!input.startsWith("did:")) throw new InvalidDidError("DID requires \"did:\" prefix");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
		if (input.endsWith(":") || input.endsWith("%")) throw new InvalidDidError("DID can not end with \":\" or \"%\"");
		if (!/^[a-zA-Z0-9._:%-]*$/.test(input)) throw new InvalidDidError("Disallowed characters in DID (ASCII letters, digits, and a couple other characters only)");
		const { length, 1: method } = input.split(":");
		if (length < 3) throw new InvalidDidError("DID requires prefix, method, and method-specific content");
		if (!/^[a-z]+$/.test(method)) throw new InvalidDidError("DID method must be lower-case letters");
	}
	var DID_REGEX = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
	function ensureValidDidRegex(input) {
		if (!DID_REGEX.test(input)) throw new InvalidDidError("DID didn't validate via regex");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
	}
	function isValidDid(input) {
		return input.length <= 2048 && DID_REGEX.test(input);
	}
	var InvalidDidError = class extends Error {};
	exports.InvalidDidError = InvalidDidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/handle.js
var require_handle$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DisallowedDomainError = exports.UnsupportedDomainError = exports.ReservedHandleError = exports.InvalidHandleError = exports.DISALLOWED_TLDS = exports.INVALID_HANDLE = void 0;
	exports.ensureValidHandle = ensureValidHandle;
	exports.ensureValidHandleRegex = ensureValidHandleRegex;
	exports.normalizeHandle = normalizeHandle;
	exports.normalizeAndEnsureValidHandle = normalizeAndEnsureValidHandle;
	exports.isValidHandle = isValidHandle;
	exports.isValidTld = isValidTld;
	exports.INVALID_HANDLE = "handle.invalid";
	exports.DISALLOWED_TLDS = [
		".local",
		".arpa",
		".invalid",
		".localhost",
		".internal",
		".example",
		".alt",
		".onion"
	];
	function ensureValidHandle(input) {
		if (!/^[a-zA-Z0-9.-]*$/.test(input)) throw new InvalidHandleError("Disallowed characters in handle (ASCII letters, digits, dashes, periods only)");
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		const labels = input.split(".");
		if (labels.length < 2) throw new InvalidHandleError("Handle domain needs at least two parts");
		for (let i = 0; i < labels.length; i++) {
			const l = labels[i];
			if (l.length < 1) throw new InvalidHandleError("Handle parts can not be empty");
			if (l.length > 63) throw new InvalidHandleError("Handle part too long (max 63 chars)");
			if (l.endsWith("-") || l.startsWith("-")) throw new InvalidHandleError("Handle parts can not start or end with hyphens");
			if (i + 1 === labels.length && !/^[a-zA-Z]/.test(l)) throw new InvalidHandleError("Handle final component (TLD) must start with ASCII letter");
		}
	}
	var HANDLE_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
	function ensureValidHandleRegex(input) {
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		if (!HANDLE_REGEX.test(input)) throw new InvalidHandleError("Handle didn't validate via regex");
	}
	function normalizeHandle(handle) {
		return handle.toLowerCase();
	}
	function normalizeAndEnsureValidHandle(handle) {
		const normalized = normalizeHandle(handle);
		ensureValidHandle(normalized);
		return normalized;
	}
	function isValidHandle(input) {
		return input.length <= 253 && HANDLE_REGEX.test(input);
	}
	function isValidTld(handle) {
		for (const tld of exports.DISALLOWED_TLDS) if (handle.endsWith(tld)) return false;
		return true;
	}
	var InvalidHandleError = class extends Error {};
	exports.InvalidHandleError = InvalidHandleError;
	/** @deprecated Never used */
	var ReservedHandleError = class extends Error {};
	exports.ReservedHandleError = ReservedHandleError;
	/** @deprecated Never used */
	var UnsupportedDomainError = class extends Error {};
	exports.UnsupportedDomainError = UnsupportedDomainError;
	/** @deprecated Never used */
	var DisallowedDomainError = class extends Error {};
	exports.DisallowedDomainError = DisallowedDomainError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/at-identifier.js
var require_at_identifier$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ensureValidAtIdentifier = ensureValidAtIdentifier;
	exports.isValidAtIdentifier = isValidAtIdentifier;
	var did_js_1 = require_did$3();
	var handle_js_1 = require_handle$3();
	function ensureValidAtIdentifier(input) {
		try {
			if (input.startsWith("did:")) (0, did_js_1.ensureValidDidRegex)(input);
			else (0, handle_js_1.ensureValidHandleRegex)(input);
		} catch (cause) {
			throw new handle_js_1.InvalidHandleError("Invalid DID or handle", { cause });
		}
	}
	function isValidAtIdentifier(input) {
		if (input.startsWith("did:")) return (0, did_js_1.isValidDid)(input);
		else return (0, handle_js_1.isValidHandle)(input);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/nsid.js
var require_nsid$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidNsidError = exports.NSID = void 0;
	exports.ensureValidNsid = ensureValidNsid;
	exports.parseNsid = parseNsid;
	exports.isValidNsid = isValidNsid;
	exports.validateNsid = validateNsid;
	exports.ensureValidNsidRegex = ensureValidNsidRegex;
	exports.validateNsidRegex = validateNsidRegex;
	exports.NSID = class NSID {
		segments;
		static parse(input) {
			return new NSID(input);
		}
		static create(authority, name) {
			const input = [...authority.split(".").reverse(), name].join(".");
			return new NSID(input);
		}
		static isValid(nsid) {
			return isValidNsid(nsid);
		}
		static from(input) {
			if (input instanceof NSID) return input;
			if (Array.isArray(input)) return new NSID(input.join("."));
			return new NSID(String(input));
		}
		constructor(nsid) {
			this.segments = parseNsid(nsid);
		}
		get authority() {
			return this.segments.slice(0, this.segments.length - 1).reverse().join(".");
		}
		get name() {
			return this.segments.at(this.segments.length - 1);
		}
		toString() {
			return this.segments.join(".");
		}
	};
	function ensureValidNsid(input) {
		const result = validateNsid(input);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	function parseNsid(nsid) {
		const result = validateNsid(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
		return result.value;
	}
	function isValidNsid(input) {
		return validateNsidRegex(input).success;
	}
	function validateNsid(input) {
		if (input.length > 317) return {
			success: false,
			message: "NSID is too long (317 chars max)"
		};
		if (hasDisallowedCharacters(input)) return {
			success: false,
			message: "Disallowed characters in NSID (ASCII letters, digits, dashes, periods only)"
		};
		const segments = input.split(".");
		if (segments.length < 3) return {
			success: false,
			message: "NSID needs at least three parts"
		};
		for (const l of segments) {
			if (l.length < 1) return {
				success: false,
				message: "NSID parts can not be empty"
			};
			if (l.length > 63) return {
				success: false,
				message: "NSID part too long (max 63 chars)"
			};
			if (startsWithHyphen(l) || endsWithHyphen(l)) return {
				success: false,
				message: "NSID parts can not start or end with hyphen"
			};
		}
		if (startsWithNumber(segments[0])) return {
			success: false,
			message: "NSID first part may not start with a digit"
		};
		if (!isValidIdentifier(segments[segments.length - 1])) return {
			success: false,
			message: "NSID name part must be only letters and digits (and no leading digit)"
		};
		return {
			success: true,
			value: segments
		};
	}
	function hasDisallowedCharacters(v) {
		return !/^[a-zA-Z0-9.-]*$/.test(v);
	}
	function startsWithNumber(v) {
		const charCode = v.charCodeAt(0);
		return charCode >= 48 && charCode <= 57;
	}
	function startsWithHyphen(v) {
		return v.charCodeAt(0) === 45;
	}
	function endsWithHyphen(v) {
		return v.charCodeAt(v.length - 1) === 45;
	}
	function isValidIdentifier(v) {
		return !startsWithNumber(v) && !v.includes("-");
	}
	/**
	* @deprecated Use {@link ensureValidNsid} if you care about error details,
	* {@link parseNsid}/{@link NSID.parse} if you need the parsed segments, or
	* {@link isValidNsid} if you just want a boolean.
	*/
	function ensureValidNsidRegex(nsid) {
		const result = validateNsidRegex(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	/**
	* Regexp based validation that behaves identically to the previous code but
	* provides less detailed error messages (while being 20% to 50% faster).
	*/
	function validateNsidRegex(value) {
		if (value.length > 317) return {
			success: false,
			message: "NSID is too long (317 chars max)"
		};
		if (!/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(value)) return {
			success: false,
			message: "NSID didn't validate via regex"
		};
		return {
			success: true,
			value
		};
	}
	var InvalidNsidError = class extends Error {};
	exports.InvalidNsidError = InvalidNsidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/aturi_validation.js
var require_aturi_validation$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ensureValidAtUri = ensureValidAtUri;
	exports.ensureValidAtUriRegex = ensureValidAtUriRegex;
	exports.isValidAtUri = isValidAtUri;
	var at_identifier_js_1 = require_at_identifier$3();
	var did_js_1 = require_did$3();
	var handle_js_1 = require_handle$3();
	var nsid_js_1 = require_nsid$3();
	function ensureValidAtUri(input) {
		const fragmentIndex = input.indexOf("#");
		if (fragmentIndex !== -1) {
			if (input.charCodeAt(fragmentIndex + 1) !== 47) throw new Error("ATURI fragment must be non-empty and start with slash");
			if (input.includes("#", fragmentIndex + 1)) throw new Error("ATURI can have at most one \"#\", separating fragment out");
			const fragment = input.slice(fragmentIndex + 1);
			if (!/^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/.test(fragment)) throw new Error("Disallowed characters in ATURI fragment (ASCII)");
		}
		const uri = fragmentIndex === -1 ? input : input.slice(0, fragmentIndex);
		if (uri.length > 8192) throw new Error("ATURI is far too long");
		if (!uri.startsWith("at://")) throw new Error("ATURI must start with \"at://\"");
		if (!/^[a-zA-Z0-9._~:@!$&')(*+,;=%/-]*$/.test(uri)) throw new Error("Disallowed characters in ATURI (ASCII)");
		const authorityEnd = uri.indexOf("/", 5);
		const authority = authorityEnd === -1 ? uri.slice(5) : uri.slice(5, authorityEnd);
		try {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(authority);
		} catch (cause) {
			throw new Error("ATURI authority must be a valid handle or DID", { cause });
		}
		const collectionStart = authorityEnd === -1 ? -1 : authorityEnd + 1;
		const collectionEnd = collectionStart === -1 ? -1 : uri.indexOf("/", collectionStart);
		if (collectionStart !== -1) {
			const collection = collectionEnd === -1 ? uri.slice(collectionStart) : uri.slice(collectionStart, collectionEnd);
			if (collection.length === 0) throw new Error("ATURI can not have a slash after authority without a path segment");
			if (!(0, nsid_js_1.isValidNsid)(collection)) throw new Error("ATURI requires first path segment (if supplied) to be valid NSID");
		}
		const recordKeyStart = collectionEnd === -1 ? -1 : collectionEnd + 1;
		const recordKeyEnd = recordKeyStart === -1 ? -1 : uri.indexOf("/", recordKeyStart);
		if (recordKeyStart !== -1) {
			if (recordKeyStart === uri.length) throw new Error("ATURI can not have a slash after collection, unless record key is provided");
		}
		if (recordKeyEnd !== -1) throw new Error("ATURI path can have at most two parts, and no trailing slash");
	}
	function ensureValidAtUriRegex(input) {
		const rm = input.match(/^at:\/\/(?<authority>[a-zA-Z0-9._:%-]+)(\/(?<collection>[a-zA-Z0-9-.]+)(\/(?<rkey>[a-zA-Z0-9._~:@!$&%')(*+,;=-]+))?)?(#(?<fragment>\/[a-zA-Z0-9._~:@!$&%')(*+,;=\-[\]/\\]*))?$/);
		if (!rm || !rm.groups) throw new Error("ATURI didn't validate via regex");
		const groups = rm.groups;
		try {
			(0, handle_js_1.ensureValidHandleRegex)(groups.authority);
		} catch {
			try {
				(0, did_js_1.ensureValidDidRegex)(groups.authority);
			} catch {
				throw new Error("ATURI authority must be a valid handle or DID");
			}
		}
		if (groups.collection && !(0, nsid_js_1.isValidNsid)(groups.collection)) throw new Error("ATURI collection path segment must be a valid NSID");
		if (input.length > 8192) throw new Error("ATURI is far too long");
	}
	function isValidAtUri(input) {
		try {
			ensureValidAtUriRegex(input);
		} catch {
			return false;
		}
		return true;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/aturi.js
var require_aturi$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AtUri = exports.ATP_URI_REGEX = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var at_identifier_js_1 = require_at_identifier$3();
	var nsid_js_1 = require_nsid$3();
	tslib_1.__exportStar(require_aturi_validation$3(), exports);
	exports.ATP_URI_REGEX = /^(at:\/\/)?((?:did:[a-z0-9:%-]+)|(?:[a-z0-9][a-z0-9.:-]*))(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	var RELATIVE_REGEX = /^(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	exports.AtUri = class AtUri {
		hash;
		host;
		pathname;
		searchParams;
		constructor(uri, base) {
			const parsed = base !== void 0 ? typeof base === "string" ? Object.assign(parse(base), parseRelative(uri)) : Object.assign({ host: base.host }, parseRelative(uri)) : parse(uri);
			(0, at_identifier_js_1.ensureValidAtIdentifier)(parsed.host);
			this.hash = parsed.hash ?? "";
			this.host = parsed.host;
			this.pathname = parsed.pathname ?? "";
			this.searchParams = parsed.searchParams;
		}
		static make(handleOrDid, collection, rkey) {
			let str = handleOrDid;
			if (collection) str += "/" + collection;
			if (rkey) str += "/" + rkey;
			return new AtUri(str);
		}
		get protocol() {
			return "at:";
		}
		get origin() {
			return `at://${this.host}`;
		}
		get hostname() {
			return this.host;
		}
		set hostname(v) {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(v);
			this.host = v;
		}
		get search() {
			return this.searchParams.toString();
		}
		set search(v) {
			this.searchParams = new URLSearchParams(v);
		}
		get collection() {
			return this.pathname.split("/").filter(Boolean)[0] || "";
		}
		set collection(v) {
			(0, nsid_js_1.ensureValidNsid)(v);
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] = v;
			this.pathname = parts.join("/");
		}
		get rkey() {
			return this.pathname.split("/").filter(Boolean)[1] || "";
		}
		set rkey(v) {
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] ||= "undefined";
			parts[1] = v;
			this.pathname = parts.join("/");
		}
		get href() {
			return this.toString();
		}
		toString() {
			let path = this.pathname || "/";
			if (!path.startsWith("/")) path = `/${path}`;
			let qs = "";
			if (this.searchParams.size) qs = `?${this.searchParams.toString()}`;
			let hash = this.hash;
			if (hash && !hash.startsWith("#")) hash = `#${hash}`;
			return `at://${this.host}${path}${qs}${hash}`;
		}
	};
	function parse(str) {
		const match = str.match(exports.ATP_URI_REGEX);
		if (!match) throw new Error(`Invalid AT uri: ${str}`);
		return {
			host: match[2],
			hash: match[5],
			pathname: match[3],
			searchParams: new URLSearchParams(match[4])
		};
	}
	function parseRelative(str) {
		const match = str.match(RELATIVE_REGEX);
		if (!match) throw new Error(`Invalid path: ${str}`);
		return {
			hash: match[3],
			pathname: match[1],
			searchParams: new URLSearchParams(match[2])
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/datetime.js
var require_datetime$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDatetimeError = exports.normalizeDatetimeAlways = void 0;
	exports.ensureValidDatetime = ensureValidDatetime;
	exports.isValidDatetime = isValidDatetime;
	exports.normalizeDatetime = normalizeDatetime;
	function ensureValidDatetime(input) {
		const date = new Date(input);
		if (isNaN(date.getTime())) throw new InvalidDatetimeError("datetime did not parse as ISO 8601");
		if (date.toISOString().startsWith("-")) throw new InvalidDatetimeError("datetime normalized to a negative time");
		if (!/^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-6][0-9]:[0-6][0-9](.[0-9]{1,20})?(Z|([+-][0-2][0-9]:[0-5][0-9]))$/.test(input)) throw new InvalidDatetimeError("datetime didn't validate via regex");
		if (input.length > 64) throw new InvalidDatetimeError("datetime is too long (64 chars max)");
		if (input.endsWith("-00:00")) throw new InvalidDatetimeError("datetime can not use \"-00:00\" for UTC timezone");
		if (input.startsWith("000")) throw new InvalidDatetimeError("datetime so close to year zero not allowed");
	}
	function isValidDatetime(input) {
		try {
			ensureValidDatetime(input);
		} catch (err) {
			return false;
		}
		return true;
	}
	function normalizeDatetime(dtStr) {
		if (isValidDatetime(dtStr)) {
			const outStr = new Date(dtStr).toISOString();
			if (isValidDatetime(outStr)) return outStr;
		}
		if (!/.*(([+-]\d\d:?\d\d)|[a-zA-Z])$/.test(dtStr)) {
			const date = /* @__PURE__ */ new Date(dtStr + "Z");
			if (!isNaN(date.getTime())) {
				const tzStr = date.toISOString();
				if (isValidDatetime(tzStr)) return tzStr;
			}
		}
		const date = new Date(dtStr);
		if (isNaN(date.getTime())) throw new InvalidDatetimeError("datetime did not parse as any timestamp format");
		const isoStr = date.toISOString();
		if (isValidDatetime(isoStr)) return isoStr;
		else throw new InvalidDatetimeError("datetime normalized to invalid timestamp string");
	}
	var normalizeDatetimeAlways = (dtStr) => {
		try {
			return normalizeDatetime(dtStr);
		} catch (err) {
			if (err instanceof InvalidDatetimeError) return (/* @__PURE__ */ new Date(0)).toISOString();
			throw err;
		}
	};
	exports.normalizeDatetimeAlways = normalizeDatetimeAlways;
	var InvalidDatetimeError = class extends Error {};
	exports.InvalidDatetimeError = InvalidDatetimeError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/language.js
var require_language$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLanguageString = parseLanguageString;
	exports.isValidLanguage = isValidLanguage;
	var BCP47_REGEXP = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>x(-[A-Za-z0-9]{1,8})+))$/;
	function parseLanguageString(input) {
		const parsed = input.match(BCP47_REGEXP);
		if (!parsed?.groups) return null;
		const { groups } = parsed;
		return {
			grandfathered: groups.grandfathered,
			language: groups.language,
			extlang: groups.extlang,
			script: groups.script,
			region: groups.region,
			variant: groups.variant,
			extension: groups.extension,
			privateUse: groups.privateUseA || groups.privateUseB
		};
	}
	/**
	* Validates well-formed BCP 47 syntax
	*
	* @see {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1}
	*/
	function isValidLanguage(input) {
		return BCP47_REGEXP.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/recordkey.js
var require_recordkey$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidRecordKeyError = void 0;
	exports.ensureValidRecordKey = ensureValidRecordKey;
	exports.isValidRecordKey = isValidRecordKey;
	var RECORD_KEY_MAX_LENGTH = 512;
	var RECORD_KEY_MIN_LENGTH = 1;
	var RECORD_KEY_INVALID_VALUES = /* @__PURE__ */ new Set([".", ".."]);
	var RECORD_KEY_REGEX = /^[a-zA-Z0-9_~.:-]{1,512}$/;
	function ensureValidRecordKey(input) {
		if (input.length > RECORD_KEY_MAX_LENGTH || input.length < RECORD_KEY_MIN_LENGTH) throw new InvalidRecordKeyError(`record key must be ${RECORD_KEY_MIN_LENGTH} to ${RECORD_KEY_MAX_LENGTH} characters`);
		if (RECORD_KEY_INVALID_VALUES.has(input)) throw new InvalidRecordKeyError("record key can not be \".\" or \"..\"");
		if (!RECORD_KEY_REGEX.test(input)) throw new InvalidRecordKeyError("record key syntax not valid (regex)");
	}
	function isValidRecordKey(input) {
		return input.length >= RECORD_KEY_MIN_LENGTH && input.length <= RECORD_KEY_MAX_LENGTH && RECORD_KEY_REGEX.test(input) && !RECORD_KEY_INVALID_VALUES.has(input);
	}
	var InvalidRecordKeyError = class extends Error {};
	exports.InvalidRecordKeyError = InvalidRecordKeyError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/tid.js
var require_tid$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidTidError = void 0;
	exports.ensureValidTid = ensureValidTid;
	exports.isValidTid = isValidTid;
	var TID_LENGTH = 13;
	var TID_REGEX = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
	function ensureValidTid(input) {
		if (input.length !== TID_LENGTH) throw new InvalidTidError(`TID must be ${TID_LENGTH} characters`);
		if (!TID_REGEX.test(input)) throw new InvalidTidError("TID syntax not valid (regex)");
	}
	function isValidTid(input) {
		return input.length === TID_LENGTH && TID_REGEX.test(input);
	}
	var InvalidTidError = class extends Error {};
	exports.InvalidTidError = InvalidTidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/uri.js
var require_uri$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isValidUri = isValidUri;
	function isValidUri(input) {
		return /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/syntax/dist/index.js
var require_dist$16 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_at_identifier$3(), exports);
	tslib_1.__exportStar(require_aturi$3(), exports);
	tslib_1.__exportStar(require_datetime$3(), exports);
	tslib_1.__exportStar(require_did$3(), exports);
	tslib_1.__exportStar(require_handle$3(), exports);
	tslib_1.__exportStar(require_nsid$3(), exports);
	tslib_1.__exportStar(require_language$3(), exports);
	tslib_1.__exportStar(require_recordkey$3(), exports);
	tslib_1.__exportStar(require_tid$4(), exports);
	tslib_1.__exportStar(require_uri$3(), exports);
}));
//#endregion
//#region node_modules/zod/v3/helpers/util.cjs
var require_util$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getParsedType = exports.ZodParsedType = exports.objectUtil = exports.util = void 0;
	var util;
	(function(util) {
		util.assertEqual = (_) => {};
		function assertIs(_arg) {}
		util.assertIs = assertIs;
		function assertNever(_x) {
			throw new Error();
		}
		util.assertNever = assertNever;
		util.arrayToEnum = (items) => {
			const obj = {};
			for (const item of items) obj[item] = item;
			return obj;
		};
		util.getValidEnumValues = (obj) => {
			const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
			const filtered = {};
			for (const k of validKeys) filtered[k] = obj[k];
			return util.objectValues(filtered);
		};
		util.objectValues = (obj) => {
			return util.objectKeys(obj).map(function(e) {
				return obj[e];
			});
		};
		util.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
			const keys = [];
			for (const key in object) if (Object.prototype.hasOwnProperty.call(object, key)) keys.push(key);
			return keys;
		};
		util.find = (arr, checker) => {
			for (const item of arr) if (checker(item)) return item;
		};
		util.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
		function joinValues(array, separator = " | ") {
			return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
		}
		util.joinValues = joinValues;
		util.jsonStringifyReplacer = (_, value) => {
			if (typeof value === "bigint") return value.toString();
			return value;
		};
	})(util || (exports.util = util = {}));
	var objectUtil;
	(function(objectUtil) {
		objectUtil.mergeShapes = (first, second) => {
			return {
				...first,
				...second
			};
		};
	})(objectUtil || (exports.objectUtil = objectUtil = {}));
	exports.ZodParsedType = util.arrayToEnum([
		"string",
		"nan",
		"number",
		"integer",
		"float",
		"boolean",
		"date",
		"bigint",
		"symbol",
		"function",
		"undefined",
		"null",
		"array",
		"object",
		"unknown",
		"promise",
		"void",
		"never",
		"map",
		"set"
	]);
	var getParsedType = (data) => {
		switch (typeof data) {
			case "undefined": return exports.ZodParsedType.undefined;
			case "string": return exports.ZodParsedType.string;
			case "number": return Number.isNaN(data) ? exports.ZodParsedType.nan : exports.ZodParsedType.number;
			case "boolean": return exports.ZodParsedType.boolean;
			case "function": return exports.ZodParsedType.function;
			case "bigint": return exports.ZodParsedType.bigint;
			case "symbol": return exports.ZodParsedType.symbol;
			case "object":
				if (Array.isArray(data)) return exports.ZodParsedType.array;
				if (data === null) return exports.ZodParsedType.null;
				if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") return exports.ZodParsedType.promise;
				if (typeof Map !== "undefined" && data instanceof Map) return exports.ZodParsedType.map;
				if (typeof Set !== "undefined" && data instanceof Set) return exports.ZodParsedType.set;
				if (typeof Date !== "undefined" && data instanceof Date) return exports.ZodParsedType.date;
				return exports.ZodParsedType.object;
			default: return exports.ZodParsedType.unknown;
		}
	};
	exports.getParsedType = getParsedType;
}));
//#endregion
//#region node_modules/zod/v3/ZodError.cjs
var require_ZodError = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ZodError = exports.quotelessJson = exports.ZodIssueCode = void 0;
	var util_js_1 = require_util$4();
	exports.ZodIssueCode = util_js_1.util.arrayToEnum([
		"invalid_type",
		"invalid_literal",
		"custom",
		"invalid_union",
		"invalid_union_discriminator",
		"invalid_enum_value",
		"unrecognized_keys",
		"invalid_arguments",
		"invalid_return_type",
		"invalid_date",
		"invalid_string",
		"too_small",
		"too_big",
		"invalid_intersection_types",
		"not_multiple_of",
		"not_finite"
	]);
	var quotelessJson = (obj) => {
		return JSON.stringify(obj, null, 2).replace(/"([^"]+)":/g, "$1:");
	};
	exports.quotelessJson = quotelessJson;
	var ZodError = class ZodError extends Error {
		get errors() {
			return this.issues;
		}
		constructor(issues) {
			super();
			this.issues = [];
			this.addIssue = (sub) => {
				this.issues = [...this.issues, sub];
			};
			this.addIssues = (subs = []) => {
				this.issues = [...this.issues, ...subs];
			};
			const actualProto = new.target.prototype;
			if (Object.setPrototypeOf) Object.setPrototypeOf(this, actualProto);
			else this.__proto__ = actualProto;
			this.name = "ZodError";
			this.issues = issues;
		}
		format(_mapper) {
			const mapper = _mapper || function(issue) {
				return issue.message;
			};
			const fieldErrors = { _errors: [] };
			const processError = (error) => {
				for (const issue of error.issues) if (issue.code === "invalid_union") issue.unionErrors.map(processError);
				else if (issue.code === "invalid_return_type") processError(issue.returnTypeError);
				else if (issue.code === "invalid_arguments") processError(issue.argumentsError);
				else if (issue.path.length === 0) fieldErrors._errors.push(mapper(issue));
				else {
					let curr = fieldErrors;
					let i = 0;
					while (i < issue.path.length) {
						const el = issue.path[i];
						if (!(i === issue.path.length - 1)) curr[el] = curr[el] || { _errors: [] };
						else {
							curr[el] = curr[el] || { _errors: [] };
							curr[el]._errors.push(mapper(issue));
						}
						curr = curr[el];
						i++;
					}
				}
			};
			processError(this);
			return fieldErrors;
		}
		static assert(value) {
			if (!(value instanceof ZodError)) throw new Error(`Not a ZodError: ${value}`);
		}
		toString() {
			return this.message;
		}
		get message() {
			return JSON.stringify(this.issues, util_js_1.util.jsonStringifyReplacer, 2);
		}
		get isEmpty() {
			return this.issues.length === 0;
		}
		flatten(mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of this.issues) if (sub.path.length > 0) {
				const firstEl = sub.path[0];
				fieldErrors[firstEl] = fieldErrors[firstEl] || [];
				fieldErrors[firstEl].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		get formErrors() {
			return this.flatten();
		}
	};
	exports.ZodError = ZodError;
	ZodError.create = (issues) => {
		return new ZodError(issues);
	};
}));
//#endregion
//#region node_modules/zod/v3/locales/en.cjs
var require_en = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var ZodError_js_1 = require_ZodError();
	var util_js_1 = require_util$4();
	var errorMap = (issue, _ctx) => {
		let message;
		switch (issue.code) {
			case ZodError_js_1.ZodIssueCode.invalid_type:
				if (issue.received === util_js_1.ZodParsedType.undefined) message = "Required";
				else message = `Expected ${issue.expected}, received ${issue.received}`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_literal:
				message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_js_1.util.jsonStringifyReplacer)}`;
				break;
			case ZodError_js_1.ZodIssueCode.unrecognized_keys:
				message = `Unrecognized key(s) in object: ${util_js_1.util.joinValues(issue.keys, ", ")}`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_union:
				message = `Invalid input`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_union_discriminator:
				message = `Invalid discriminator value. Expected ${util_js_1.util.joinValues(issue.options)}`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_enum_value:
				message = `Invalid enum value. Expected ${util_js_1.util.joinValues(issue.options)}, received '${issue.received}'`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_arguments:
				message = `Invalid function arguments`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_return_type:
				message = `Invalid function return type`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_date:
				message = `Invalid date`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_string:
				if (typeof issue.validation === "object") {
					if ("includes" in issue.validation) {
						message = `Invalid input: must include "${issue.validation.includes}"`;
						if (typeof issue.validation.position === "number") message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
					} else if ("startsWith" in issue.validation) message = `Invalid input: must start with "${issue.validation.startsWith}"`;
					else if ("endsWith" in issue.validation) message = `Invalid input: must end with "${issue.validation.endsWith}"`;
					else util_js_1.util.assertNever(issue.validation);
				} else if (issue.validation !== "regex") message = `Invalid ${issue.validation}`;
				else message = "Invalid";
				break;
			case ZodError_js_1.ZodIssueCode.too_small:
				if (issue.type === "array") message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
				else if (issue.type === "string") message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
				else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
				else if (issue.type === "bigint") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
				else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
				else message = "Invalid input";
				break;
			case ZodError_js_1.ZodIssueCode.too_big:
				if (issue.type === "array") message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
				else if (issue.type === "string") message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
				else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
				else if (issue.type === "bigint") message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
				else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
				else message = "Invalid input";
				break;
			case ZodError_js_1.ZodIssueCode.custom:
				message = `Invalid input`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_intersection_types:
				message = `Intersection results could not be merged`;
				break;
			case ZodError_js_1.ZodIssueCode.not_multiple_of:
				message = `Number must be a multiple of ${issue.multipleOf}`;
				break;
			case ZodError_js_1.ZodIssueCode.not_finite:
				message = "Number must be finite";
				break;
			default:
				message = _ctx.defaultError;
				util_js_1.util.assertNever(issue);
		}
		return { message };
	};
	exports.default = errorMap;
}));
//#endregion
//#region node_modules/zod/v3/errors.cjs
var require_errors$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultErrorMap = void 0;
	exports.setErrorMap = setErrorMap;
	exports.getErrorMap = getErrorMap;
	var en_js_1 = __importDefault(require_en());
	exports.defaultErrorMap = en_js_1.default;
	var overrideErrorMap = en_js_1.default;
	function setErrorMap(map) {
		overrideErrorMap = map;
	}
	function getErrorMap() {
		return overrideErrorMap;
	}
}));
//#endregion
//#region node_modules/zod/v3/helpers/parseUtil.cjs
var require_parseUtil = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isAsync = exports.isValid = exports.isDirty = exports.isAborted = exports.OK = exports.DIRTY = exports.INVALID = exports.ParseStatus = exports.EMPTY_PATH = exports.makeIssue = void 0;
	exports.addIssueToContext = addIssueToContext;
	var errors_js_1 = require_errors$1();
	var en_js_1 = __importDefault(require_en());
	var makeIssue = (params) => {
		const { data, path, errorMaps, issueData } = params;
		const fullPath = [...path, ...issueData.path || []];
		const fullIssue = {
			...issueData,
			path: fullPath
		};
		if (issueData.message !== void 0) return {
			...issueData,
			path: fullPath,
			message: issueData.message
		};
		let errorMessage = "";
		const maps = errorMaps.filter((m) => !!m).slice().reverse();
		for (const map of maps) errorMessage = map(fullIssue, {
			data,
			defaultError: errorMessage
		}).message;
		return {
			...issueData,
			path: fullPath,
			message: errorMessage
		};
	};
	exports.makeIssue = makeIssue;
	exports.EMPTY_PATH = [];
	function addIssueToContext(ctx, issueData) {
		const overrideMap = (0, errors_js_1.getErrorMap)();
		const issue = (0, exports.makeIssue)({
			issueData,
			data: ctx.data,
			path: ctx.path,
			errorMaps: [
				ctx.common.contextualErrorMap,
				ctx.schemaErrorMap,
				overrideMap,
				overrideMap === en_js_1.default ? void 0 : en_js_1.default
			].filter((x) => !!x)
		});
		ctx.common.issues.push(issue);
	}
	exports.ParseStatus = class ParseStatus {
		constructor() {
			this.value = "valid";
		}
		dirty() {
			if (this.value === "valid") this.value = "dirty";
		}
		abort() {
			if (this.value !== "aborted") this.value = "aborted";
		}
		static mergeArray(status, results) {
			const arrayValue = [];
			for (const s of results) {
				if (s.status === "aborted") return exports.INVALID;
				if (s.status === "dirty") status.dirty();
				arrayValue.push(s.value);
			}
			return {
				status: status.value,
				value: arrayValue
			};
		}
		static async mergeObjectAsync(status, pairs) {
			const syncPairs = [];
			for (const pair of pairs) {
				const key = await pair.key;
				const value = await pair.value;
				syncPairs.push({
					key,
					value
				});
			}
			return ParseStatus.mergeObjectSync(status, syncPairs);
		}
		static mergeObjectSync(status, pairs) {
			const finalObject = {};
			for (const pair of pairs) {
				const { key, value } = pair;
				if (key.status === "aborted") return exports.INVALID;
				if (value.status === "aborted") return exports.INVALID;
				if (key.status === "dirty") status.dirty();
				if (value.status === "dirty") status.dirty();
				if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) finalObject[key.value] = value.value;
			}
			return {
				status: status.value,
				value: finalObject
			};
		}
	};
	exports.INVALID = Object.freeze({ status: "aborted" });
	var DIRTY = (value) => ({
		status: "dirty",
		value
	});
	exports.DIRTY = DIRTY;
	var OK = (value) => ({
		status: "valid",
		value
	});
	exports.OK = OK;
	var isAborted = (x) => x.status === "aborted";
	exports.isAborted = isAborted;
	var isDirty = (x) => x.status === "dirty";
	exports.isDirty = isDirty;
	var isValid = (x) => x.status === "valid";
	exports.isValid = isValid;
	var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
	exports.isAsync = isAsync;
}));
//#endregion
//#region node_modules/zod/v3/helpers/typeAliases.cjs
var require_typeAliases = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/zod/v3/helpers/errorUtil.cjs
var require_errorUtil = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.errorUtil = void 0;
	var errorUtil;
	(function(errorUtil) {
		errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
		errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
	})(errorUtil || (exports.errorUtil = errorUtil = {}));
}));
//#endregion
//#region node_modules/zod/v3/types.cjs
var require_types$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.discriminatedUnion = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = exports.coerce = exports.ZodFirstPartyTypeKind = exports.late = exports.ZodSchema = exports.Schema = exports.ZodReadonly = exports.ZodPipeline = exports.ZodBranded = exports.BRAND = exports.ZodNaN = exports.ZodCatch = exports.ZodDefault = exports.ZodNullable = exports.ZodOptional = exports.ZodTransformer = exports.ZodEffects = exports.ZodPromise = exports.ZodNativeEnum = exports.ZodEnum = exports.ZodLiteral = exports.ZodLazy = exports.ZodFunction = exports.ZodSet = exports.ZodMap = exports.ZodRecord = exports.ZodTuple = exports.ZodIntersection = exports.ZodDiscriminatedUnion = exports.ZodUnion = exports.ZodObject = exports.ZodArray = exports.ZodVoid = exports.ZodNever = exports.ZodUnknown = exports.ZodAny = exports.ZodNull = exports.ZodUndefined = exports.ZodSymbol = exports.ZodDate = exports.ZodBoolean = exports.ZodBigInt = exports.ZodNumber = exports.ZodString = exports.ZodType = void 0;
	exports.NEVER = exports.void = exports.unknown = exports.union = exports.undefined = exports.tuple = exports.transformer = exports.symbol = exports.string = exports.strictObject = exports.set = exports.record = exports.promise = exports.preprocess = exports.pipeline = exports.ostring = exports.optional = exports.onumber = exports.oboolean = exports.object = exports.number = exports.nullable = exports.null = exports.never = exports.nativeEnum = exports.nan = exports.map = exports.literal = exports.lazy = exports.intersection = exports.instanceof = exports.function = exports.enum = exports.effect = void 0;
	exports.datetimeRegex = datetimeRegex;
	exports.custom = custom;
	var ZodError_js_1 = require_ZodError();
	var errors_js_1 = require_errors$1();
	var errorUtil_js_1 = require_errorUtil();
	var parseUtil_js_1 = require_parseUtil();
	var util_js_1 = require_util$4();
	var ParseInputLazyPath = class {
		constructor(parent, value, path, key) {
			this._cachedPath = [];
			this.parent = parent;
			this.data = value;
			this._path = path;
			this._key = key;
		}
		get path() {
			if (!this._cachedPath.length) {
				if (Array.isArray(this._key)) this._cachedPath.push(...this._path, ...this._key);
				else this._cachedPath.push(...this._path, this._key);
			}
			return this._cachedPath;
		}
	};
	var handleResult = (ctx, result) => {
		if ((0, parseUtil_js_1.isValid)(result)) return {
			success: true,
			data: result.value
		};
		else {
			if (!ctx.common.issues.length) throw new Error("Validation failed but no issues detected.");
			return {
				success: false,
				get error() {
					if (this._error) return this._error;
					const error = new ZodError_js_1.ZodError(ctx.common.issues);
					this._error = error;
					return this._error;
				}
			};
		}
	};
	function processCreateParams(params) {
		if (!params) return {};
		const { errorMap, invalid_type_error, required_error, description } = params;
		if (errorMap && (invalid_type_error || required_error)) throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
		if (errorMap) return {
			errorMap,
			description
		};
		const customMap = (iss, ctx) => {
			const { message } = params;
			if (iss.code === "invalid_enum_value") return { message: message ?? ctx.defaultError };
			if (typeof ctx.data === "undefined") return { message: message ?? required_error ?? ctx.defaultError };
			if (iss.code !== "invalid_type") return { message: ctx.defaultError };
			return { message: message ?? invalid_type_error ?? ctx.defaultError };
		};
		return {
			errorMap: customMap,
			description
		};
	}
	var ZodType = class {
		get description() {
			return this._def.description;
		}
		_getType(input) {
			return (0, util_js_1.getParsedType)(input.data);
		}
		_getOrReturnCtx(input, ctx) {
			return ctx || {
				common: input.parent.common,
				data: input.data,
				parsedType: (0, util_js_1.getParsedType)(input.data),
				schemaErrorMap: this._def.errorMap,
				path: input.path,
				parent: input.parent
			};
		}
		_processInputParams(input) {
			return {
				status: new parseUtil_js_1.ParseStatus(),
				ctx: {
					common: input.parent.common,
					data: input.data,
					parsedType: (0, util_js_1.getParsedType)(input.data),
					schemaErrorMap: this._def.errorMap,
					path: input.path,
					parent: input.parent
				}
			};
		}
		_parseSync(input) {
			const result = this._parse(input);
			if ((0, parseUtil_js_1.isAsync)(result)) throw new Error("Synchronous parse encountered promise.");
			return result;
		}
		_parseAsync(input) {
			const result = this._parse(input);
			return Promise.resolve(result);
		}
		parse(data, params) {
			const result = this.safeParse(data, params);
			if (result.success) return result.data;
			throw result.error;
		}
		safeParse(data, params) {
			const ctx = {
				common: {
					issues: [],
					async: params?.async ?? false,
					contextualErrorMap: params?.errorMap
				},
				path: params?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: (0, util_js_1.getParsedType)(data)
			};
			return handleResult(ctx, this._parseSync({
				data,
				path: ctx.path,
				parent: ctx
			}));
		}
		"~validate"(data) {
			const ctx = {
				common: {
					issues: [],
					async: !!this["~standard"].async
				},
				path: [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: (0, util_js_1.getParsedType)(data)
			};
			if (!this["~standard"].async) try {
				const result = this._parseSync({
					data,
					path: [],
					parent: ctx
				});
				return (0, parseUtil_js_1.isValid)(result) ? { value: result.value } : { issues: ctx.common.issues };
			} catch (err) {
				if (err?.message?.toLowerCase()?.includes("encountered")) this["~standard"].async = true;
				ctx.common = {
					issues: [],
					async: true
				};
			}
			return this._parseAsync({
				data,
				path: [],
				parent: ctx
			}).then((result) => (0, parseUtil_js_1.isValid)(result) ? { value: result.value } : { issues: ctx.common.issues });
		}
		async parseAsync(data, params) {
			const result = await this.safeParseAsync(data, params);
			if (result.success) return result.data;
			throw result.error;
		}
		async safeParseAsync(data, params) {
			const ctx = {
				common: {
					issues: [],
					contextualErrorMap: params?.errorMap,
					async: true
				},
				path: params?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: (0, util_js_1.getParsedType)(data)
			};
			const maybeAsyncResult = this._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
			return handleResult(ctx, await ((0, parseUtil_js_1.isAsync)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult)));
		}
		refine(check, message) {
			const getIssueProperties = (val) => {
				if (typeof message === "string" || typeof message === "undefined") return { message };
				else if (typeof message === "function") return message(val);
				else return message;
			};
			return this._refinement((val, ctx) => {
				const result = check(val);
				const setError = () => ctx.addIssue({
					code: ZodError_js_1.ZodIssueCode.custom,
					...getIssueProperties(val)
				});
				if (typeof Promise !== "undefined" && result instanceof Promise) return result.then((data) => {
					if (!data) {
						setError();
						return false;
					} else return true;
				});
				if (!result) {
					setError();
					return false;
				} else return true;
			});
		}
		refinement(check, refinementData) {
			return this._refinement((val, ctx) => {
				if (!check(val)) {
					ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
					return false;
				} else return true;
			});
		}
		_refinement(refinement) {
			return new ZodEffects({
				schema: this,
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				effect: {
					type: "refinement",
					refinement
				}
			});
		}
		superRefine(refinement) {
			return this._refinement(refinement);
		}
		constructor(def) {
			/** Alias of safeParseAsync */
			this.spa = this.safeParseAsync;
			this._def = def;
			this.parse = this.parse.bind(this);
			this.safeParse = this.safeParse.bind(this);
			this.parseAsync = this.parseAsync.bind(this);
			this.safeParseAsync = this.safeParseAsync.bind(this);
			this.spa = this.spa.bind(this);
			this.refine = this.refine.bind(this);
			this.refinement = this.refinement.bind(this);
			this.superRefine = this.superRefine.bind(this);
			this.optional = this.optional.bind(this);
			this.nullable = this.nullable.bind(this);
			this.nullish = this.nullish.bind(this);
			this.array = this.array.bind(this);
			this.promise = this.promise.bind(this);
			this.or = this.or.bind(this);
			this.and = this.and.bind(this);
			this.transform = this.transform.bind(this);
			this.brand = this.brand.bind(this);
			this.default = this.default.bind(this);
			this.catch = this.catch.bind(this);
			this.describe = this.describe.bind(this);
			this.pipe = this.pipe.bind(this);
			this.readonly = this.readonly.bind(this);
			this.isNullable = this.isNullable.bind(this);
			this.isOptional = this.isOptional.bind(this);
			this["~standard"] = {
				version: 1,
				vendor: "zod",
				validate: (data) => this["~validate"](data)
			};
		}
		optional() {
			return ZodOptional.create(this, this._def);
		}
		nullable() {
			return ZodNullable.create(this, this._def);
		}
		nullish() {
			return this.nullable().optional();
		}
		array() {
			return ZodArray.create(this);
		}
		promise() {
			return ZodPromise.create(this, this._def);
		}
		or(option) {
			return ZodUnion.create([this, option], this._def);
		}
		and(incoming) {
			return ZodIntersection.create(this, incoming, this._def);
		}
		transform(transform) {
			return new ZodEffects({
				...processCreateParams(this._def),
				schema: this,
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				effect: {
					type: "transform",
					transform
				}
			});
		}
		default(def) {
			const defaultValueFunc = typeof def === "function" ? def : () => def;
			return new ZodDefault({
				...processCreateParams(this._def),
				innerType: this,
				defaultValue: defaultValueFunc,
				typeName: ZodFirstPartyTypeKind.ZodDefault
			});
		}
		brand() {
			return new ZodBranded({
				typeName: ZodFirstPartyTypeKind.ZodBranded,
				type: this,
				...processCreateParams(this._def)
			});
		}
		catch(def) {
			const catchValueFunc = typeof def === "function" ? def : () => def;
			return new ZodCatch({
				...processCreateParams(this._def),
				innerType: this,
				catchValue: catchValueFunc,
				typeName: ZodFirstPartyTypeKind.ZodCatch
			});
		}
		describe(description) {
			const This = this.constructor;
			return new This({
				...this._def,
				description
			});
		}
		pipe(target) {
			return ZodPipeline.create(this, target);
		}
		readonly() {
			return ZodReadonly.create(this);
		}
		isOptional() {
			return this.safeParse(void 0).success;
		}
		isNullable() {
			return this.safeParse(null).success;
		}
	};
	exports.ZodType = ZodType;
	exports.Schema = ZodType;
	exports.ZodSchema = ZodType;
	var cuidRegex = /^c[^\s-]{8,}$/i;
	var cuid2Regex = /^[0-9a-z]+$/;
	var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
	var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
	var nanoidRegex = /^[a-z0-9_-]{21}$/i;
	var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
	var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
	var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
	var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
	var emojiRegex;
	var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
	var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
	var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
	var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
	var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
	var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
	var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
	var dateRegex = new RegExp(`^${dateRegexSource}$`);
	function timeRegexSource(args) {
		let secondsRegexSource = `[0-5]\\d`;
		if (args.precision) secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
		else if (args.precision == null) secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
		const secondsQuantifier = args.precision ? "+" : "?";
		return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
	}
	function timeRegex(args) {
		return new RegExp(`^${timeRegexSource(args)}$`);
	}
	function datetimeRegex(args) {
		let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
		const opts = [];
		opts.push(args.local ? `Z?` : `Z`);
		if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
		regex = `${regex}(${opts.join("|")})`;
		return new RegExp(`^${regex}$`);
	}
	function isValidIP(ip, version) {
		if ((version === "v4" || !version) && ipv4Regex.test(ip)) return true;
		if ((version === "v6" || !version) && ipv6Regex.test(ip)) return true;
		return false;
	}
	function isValidJWT(jwt, alg) {
		if (!jwtRegex.test(jwt)) return false;
		try {
			const [header] = jwt.split(".");
			if (!header) return false;
			const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
			const decoded = JSON.parse(atob(base64));
			if (typeof decoded !== "object" || decoded === null) return false;
			if ("typ" in decoded && decoded?.typ !== "JWT") return false;
			if (!decoded.alg) return false;
			if (alg && decoded.alg !== alg) return false;
			return true;
		} catch {
			return false;
		}
	}
	function isValidCidr(ip, version) {
		if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) return true;
		if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) return true;
		return false;
	}
	var ZodString = class ZodString extends ZodType {
		_parse(input) {
			if (this._def.coerce) input.data = String(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.string) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.string,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const status = new parseUtil_js_1.ParseStatus();
			let ctx = void 0;
			for (const check of this._def.checks) if (check.kind === "min") {
				if (input.data.length < check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: check.value,
						type: "string",
						inclusive: true,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (input.data.length > check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: check.value,
						type: "string",
						inclusive: true,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "length") {
				const tooBig = input.data.length > check.value;
				const tooSmall = input.data.length < check.value;
				if (tooBig || tooSmall) {
					ctx = this._getOrReturnCtx(input, ctx);
					if (tooBig) (0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: check.value,
						type: "string",
						inclusive: true,
						exact: true,
						message: check.message
					});
					else if (tooSmall) (0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: check.value,
						type: "string",
						inclusive: true,
						exact: true,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "email") {
				if (!emailRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "email",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "emoji") {
				if (!emojiRegex) emojiRegex = new RegExp(_emojiRegex, "u");
				if (!emojiRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "emoji",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "uuid") {
				if (!uuidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "uuid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "nanoid") {
				if (!nanoidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "nanoid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cuid") {
				if (!cuidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "cuid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cuid2") {
				if (!cuid2Regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "cuid2",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "ulid") {
				if (!ulidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "ulid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "url") try {
				new URL(input.data);
			} catch {
				ctx = this._getOrReturnCtx(input, ctx);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					validation: "url",
					code: ZodError_js_1.ZodIssueCode.invalid_string,
					message: check.message
				});
				status.dirty();
			}
			else if (check.kind === "regex") {
				check.regex.lastIndex = 0;
				if (!check.regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "regex",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "trim") input.data = input.data.trim();
			else if (check.kind === "includes") {
				if (!input.data.includes(check.value, check.position)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: {
							includes: check.value,
							position: check.position
						},
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "toLowerCase") input.data = input.data.toLowerCase();
			else if (check.kind === "toUpperCase") input.data = input.data.toUpperCase();
			else if (check.kind === "startsWith") {
				if (!input.data.startsWith(check.value)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: { startsWith: check.value },
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "endsWith") {
				if (!input.data.endsWith(check.value)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: { endsWith: check.value },
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "datetime") {
				if (!datetimeRegex(check).test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: "datetime",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "date") {
				if (!dateRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: "date",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "time") {
				if (!timeRegex(check).test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: "time",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "duration") {
				if (!durationRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "duration",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "ip") {
				if (!isValidIP(input.data, check.version)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "ip",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "jwt") {
				if (!isValidJWT(input.data, check.alg)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "jwt",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cidr") {
				if (!isValidCidr(input.data, check.version)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "cidr",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "base64") {
				if (!base64Regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "base64",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "base64url") {
				if (!base64urlRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "base64url",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		_regex(regex, validation, message) {
			return this.refinement((data) => regex.test(data), {
				validation,
				code: ZodError_js_1.ZodIssueCode.invalid_string,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		_addCheck(check) {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		email(message) {
			return this._addCheck({
				kind: "email",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		url(message) {
			return this._addCheck({
				kind: "url",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		emoji(message) {
			return this._addCheck({
				kind: "emoji",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		uuid(message) {
			return this._addCheck({
				kind: "uuid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		nanoid(message) {
			return this._addCheck({
				kind: "nanoid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		cuid(message) {
			return this._addCheck({
				kind: "cuid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		cuid2(message) {
			return this._addCheck({
				kind: "cuid2",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		ulid(message) {
			return this._addCheck({
				kind: "ulid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		base64(message) {
			return this._addCheck({
				kind: "base64",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		base64url(message) {
			return this._addCheck({
				kind: "base64url",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		jwt(options) {
			return this._addCheck({
				kind: "jwt",
				...errorUtil_js_1.errorUtil.errToObj(options)
			});
		}
		ip(options) {
			return this._addCheck({
				kind: "ip",
				...errorUtil_js_1.errorUtil.errToObj(options)
			});
		}
		cidr(options) {
			return this._addCheck({
				kind: "cidr",
				...errorUtil_js_1.errorUtil.errToObj(options)
			});
		}
		datetime(options) {
			if (typeof options === "string") return this._addCheck({
				kind: "datetime",
				precision: null,
				offset: false,
				local: false,
				message: options
			});
			return this._addCheck({
				kind: "datetime",
				precision: typeof options?.precision === "undefined" ? null : options?.precision,
				offset: options?.offset ?? false,
				local: options?.local ?? false,
				...errorUtil_js_1.errorUtil.errToObj(options?.message)
			});
		}
		date(message) {
			return this._addCheck({
				kind: "date",
				message
			});
		}
		time(options) {
			if (typeof options === "string") return this._addCheck({
				kind: "time",
				precision: null,
				message: options
			});
			return this._addCheck({
				kind: "time",
				precision: typeof options?.precision === "undefined" ? null : options?.precision,
				...errorUtil_js_1.errorUtil.errToObj(options?.message)
			});
		}
		duration(message) {
			return this._addCheck({
				kind: "duration",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		regex(regex, message) {
			return this._addCheck({
				kind: "regex",
				regex,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		includes(value, options) {
			return this._addCheck({
				kind: "includes",
				value,
				position: options?.position,
				...errorUtil_js_1.errorUtil.errToObj(options?.message)
			});
		}
		startsWith(value, message) {
			return this._addCheck({
				kind: "startsWith",
				value,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		endsWith(value, message) {
			return this._addCheck({
				kind: "endsWith",
				value,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		min(minLength, message) {
			return this._addCheck({
				kind: "min",
				value: minLength,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		max(maxLength, message) {
			return this._addCheck({
				kind: "max",
				value: maxLength,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		length(len, message) {
			return this._addCheck({
				kind: "length",
				value: len,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		/**
		* Equivalent to `.min(1)`
		*/
		nonempty(message) {
			return this.min(1, errorUtil_js_1.errorUtil.errToObj(message));
		}
		trim() {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, { kind: "trim" }]
			});
		}
		toLowerCase() {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, { kind: "toLowerCase" }]
			});
		}
		toUpperCase() {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, { kind: "toUpperCase" }]
			});
		}
		get isDatetime() {
			return !!this._def.checks.find((ch) => ch.kind === "datetime");
		}
		get isDate() {
			return !!this._def.checks.find((ch) => ch.kind === "date");
		}
		get isTime() {
			return !!this._def.checks.find((ch) => ch.kind === "time");
		}
		get isDuration() {
			return !!this._def.checks.find((ch) => ch.kind === "duration");
		}
		get isEmail() {
			return !!this._def.checks.find((ch) => ch.kind === "email");
		}
		get isURL() {
			return !!this._def.checks.find((ch) => ch.kind === "url");
		}
		get isEmoji() {
			return !!this._def.checks.find((ch) => ch.kind === "emoji");
		}
		get isUUID() {
			return !!this._def.checks.find((ch) => ch.kind === "uuid");
		}
		get isNANOID() {
			return !!this._def.checks.find((ch) => ch.kind === "nanoid");
		}
		get isCUID() {
			return !!this._def.checks.find((ch) => ch.kind === "cuid");
		}
		get isCUID2() {
			return !!this._def.checks.find((ch) => ch.kind === "cuid2");
		}
		get isULID() {
			return !!this._def.checks.find((ch) => ch.kind === "ulid");
		}
		get isIP() {
			return !!this._def.checks.find((ch) => ch.kind === "ip");
		}
		get isCIDR() {
			return !!this._def.checks.find((ch) => ch.kind === "cidr");
		}
		get isBase64() {
			return !!this._def.checks.find((ch) => ch.kind === "base64");
		}
		get isBase64url() {
			return !!this._def.checks.find((ch) => ch.kind === "base64url");
		}
		get minLength() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxLength() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
	};
	exports.ZodString = ZodString;
	ZodString.create = (params) => {
		return new ZodString({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodString,
			coerce: params?.coerce ?? false,
			...processCreateParams(params)
		});
	};
	function floatSafeRemainder(val, step) {
		const valDecCount = (val.toString().split(".")[1] || "").length;
		const stepDecCount = (step.toString().split(".")[1] || "").length;
		const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
		return Number.parseInt(val.toFixed(decCount).replace(".", "")) % Number.parseInt(step.toFixed(decCount).replace(".", "")) / 10 ** decCount;
	}
	var ZodNumber = class ZodNumber extends ZodType {
		constructor() {
			super(...arguments);
			this.min = this.gte;
			this.max = this.lte;
			this.step = this.multipleOf;
		}
		_parse(input) {
			if (this._def.coerce) input.data = Number(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.number) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.number,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			let ctx = void 0;
			const status = new parseUtil_js_1.ParseStatus();
			for (const check of this._def.checks) if (check.kind === "int") {
				if (!util_js_1.util.isInteger(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_type,
						expected: "integer",
						received: "float",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "min") {
				if (check.inclusive ? input.data < check.value : input.data <= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: check.value,
						type: "number",
						inclusive: check.inclusive,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (check.inclusive ? input.data > check.value : input.data >= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: check.value,
						type: "number",
						inclusive: check.inclusive,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "multipleOf") {
				if (floatSafeRemainder(input.data, check.value) !== 0) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.not_multiple_of,
						multipleOf: check.value,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "finite") {
				if (!Number.isFinite(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.not_finite,
						message: check.message
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		gte(value, message) {
			return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		gt(value, message) {
			return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		lte(value, message) {
			return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		lt(value, message) {
			return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		setLimit(kind, value, inclusive, message) {
			return new ZodNumber({
				...this._def,
				checks: [...this._def.checks, {
					kind,
					value,
					inclusive,
					message: errorUtil_js_1.errorUtil.toString(message)
				}]
			});
		}
		_addCheck(check) {
			return new ZodNumber({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		int(message) {
			return this._addCheck({
				kind: "int",
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		positive(message) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		negative(message) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonpositive(message) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonnegative(message) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		multipleOf(value, message) {
			return this._addCheck({
				kind: "multipleOf",
				value,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		finite(message) {
			return this._addCheck({
				kind: "finite",
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		safe(message) {
			return this._addCheck({
				kind: "min",
				inclusive: true,
				value: Number.MIN_SAFE_INTEGER,
				message: errorUtil_js_1.errorUtil.toString(message)
			})._addCheck({
				kind: "max",
				inclusive: true,
				value: Number.MAX_SAFE_INTEGER,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		get minValue() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxValue() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
		get isInt() {
			return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util_js_1.util.isInteger(ch.value));
		}
		get isFinite() {
			let max = null;
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") return true;
			else if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			} else if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return Number.isFinite(min) && Number.isFinite(max);
		}
	};
	exports.ZodNumber = ZodNumber;
	ZodNumber.create = (params) => {
		return new ZodNumber({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodNumber,
			coerce: params?.coerce || false,
			...processCreateParams(params)
		});
	};
	var ZodBigInt = class ZodBigInt extends ZodType {
		constructor() {
			super(...arguments);
			this.min = this.gte;
			this.max = this.lte;
		}
		_parse(input) {
			if (this._def.coerce) try {
				input.data = BigInt(input.data);
			} catch {
				return this._getInvalidInput(input);
			}
			if (this._getType(input) !== util_js_1.ZodParsedType.bigint) return this._getInvalidInput(input);
			let ctx = void 0;
			const status = new parseUtil_js_1.ParseStatus();
			for (const check of this._def.checks) if (check.kind === "min") {
				if (check.inclusive ? input.data < check.value : input.data <= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						type: "bigint",
						minimum: check.value,
						inclusive: check.inclusive,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (check.inclusive ? input.data > check.value : input.data >= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						type: "bigint",
						maximum: check.value,
						inclusive: check.inclusive,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "multipleOf") {
				if (input.data % check.value !== BigInt(0)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.not_multiple_of,
						multipleOf: check.value,
						message: check.message
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		_getInvalidInput(input) {
			const ctx = this._getOrReturnCtx(input);
			(0, parseUtil_js_1.addIssueToContext)(ctx, {
				code: ZodError_js_1.ZodIssueCode.invalid_type,
				expected: util_js_1.ZodParsedType.bigint,
				received: ctx.parsedType
			});
			return parseUtil_js_1.INVALID;
		}
		gte(value, message) {
			return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		gt(value, message) {
			return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		lte(value, message) {
			return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		lt(value, message) {
			return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		setLimit(kind, value, inclusive, message) {
			return new ZodBigInt({
				...this._def,
				checks: [...this._def.checks, {
					kind,
					value,
					inclusive,
					message: errorUtil_js_1.errorUtil.toString(message)
				}]
			});
		}
		_addCheck(check) {
			return new ZodBigInt({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		positive(message) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		negative(message) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonpositive(message) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonnegative(message) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		multipleOf(value, message) {
			return this._addCheck({
				kind: "multipleOf",
				value,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		get minValue() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxValue() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
	};
	exports.ZodBigInt = ZodBigInt;
	ZodBigInt.create = (params) => {
		return new ZodBigInt({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodBigInt,
			coerce: params?.coerce ?? false,
			...processCreateParams(params)
		});
	};
	var ZodBoolean = class extends ZodType {
		_parse(input) {
			if (this._def.coerce) input.data = Boolean(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.boolean) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.boolean,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodBoolean = ZodBoolean;
	ZodBoolean.create = (params) => {
		return new ZodBoolean({
			typeName: ZodFirstPartyTypeKind.ZodBoolean,
			coerce: params?.coerce || false,
			...processCreateParams(params)
		});
	};
	var ZodDate = class ZodDate extends ZodType {
		_parse(input) {
			if (this._def.coerce) input.data = new Date(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.date) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.date,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			if (Number.isNaN(input.data.getTime())) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, { code: ZodError_js_1.ZodIssueCode.invalid_date });
				return parseUtil_js_1.INVALID;
			}
			const status = new parseUtil_js_1.ParseStatus();
			let ctx = void 0;
			for (const check of this._def.checks) if (check.kind === "min") {
				if (input.data.getTime() < check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						message: check.message,
						inclusive: true,
						exact: false,
						minimum: check.value,
						type: "date"
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (input.data.getTime() > check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						message: check.message,
						inclusive: true,
						exact: false,
						maximum: check.value,
						type: "date"
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: new Date(input.data.getTime())
			};
		}
		_addCheck(check) {
			return new ZodDate({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		min(minDate, message) {
			return this._addCheck({
				kind: "min",
				value: minDate.getTime(),
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		max(maxDate, message) {
			return this._addCheck({
				kind: "max",
				value: maxDate.getTime(),
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		get minDate() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min != null ? new Date(min) : null;
		}
		get maxDate() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max != null ? new Date(max) : null;
		}
	};
	exports.ZodDate = ZodDate;
	ZodDate.create = (params) => {
		return new ZodDate({
			checks: [],
			coerce: params?.coerce || false,
			typeName: ZodFirstPartyTypeKind.ZodDate,
			...processCreateParams(params)
		});
	};
	var ZodSymbol = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.symbol) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.symbol,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodSymbol = ZodSymbol;
	ZodSymbol.create = (params) => {
		return new ZodSymbol({
			typeName: ZodFirstPartyTypeKind.ZodSymbol,
			...processCreateParams(params)
		});
	};
	var ZodUndefined = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.undefined) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.undefined,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodUndefined = ZodUndefined;
	ZodUndefined.create = (params) => {
		return new ZodUndefined({
			typeName: ZodFirstPartyTypeKind.ZodUndefined,
			...processCreateParams(params)
		});
	};
	var ZodNull = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.null) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.null,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodNull = ZodNull;
	ZodNull.create = (params) => {
		return new ZodNull({
			typeName: ZodFirstPartyTypeKind.ZodNull,
			...processCreateParams(params)
		});
	};
	var ZodAny = class extends ZodType {
		constructor() {
			super(...arguments);
			this._any = true;
		}
		_parse(input) {
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodAny = ZodAny;
	ZodAny.create = (params) => {
		return new ZodAny({
			typeName: ZodFirstPartyTypeKind.ZodAny,
			...processCreateParams(params)
		});
	};
	var ZodUnknown = class extends ZodType {
		constructor() {
			super(...arguments);
			this._unknown = true;
		}
		_parse(input) {
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodUnknown = ZodUnknown;
	ZodUnknown.create = (params) => {
		return new ZodUnknown({
			typeName: ZodFirstPartyTypeKind.ZodUnknown,
			...processCreateParams(params)
		});
	};
	var ZodNever = class extends ZodType {
		_parse(input) {
			const ctx = this._getOrReturnCtx(input);
			(0, parseUtil_js_1.addIssueToContext)(ctx, {
				code: ZodError_js_1.ZodIssueCode.invalid_type,
				expected: util_js_1.ZodParsedType.never,
				received: ctx.parsedType
			});
			return parseUtil_js_1.INVALID;
		}
	};
	exports.ZodNever = ZodNever;
	ZodNever.create = (params) => {
		return new ZodNever({
			typeName: ZodFirstPartyTypeKind.ZodNever,
			...processCreateParams(params)
		});
	};
	var ZodVoid = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.undefined) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.void,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodVoid = ZodVoid;
	ZodVoid.create = (params) => {
		return new ZodVoid({
			typeName: ZodFirstPartyTypeKind.ZodVoid,
			...processCreateParams(params)
		});
	};
	var ZodArray = class ZodArray extends ZodType {
		_parse(input) {
			const { ctx, status } = this._processInputParams(input);
			const def = this._def;
			if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.array,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			if (def.exactLength !== null) {
				const tooBig = ctx.data.length > def.exactLength.value;
				const tooSmall = ctx.data.length < def.exactLength.value;
				if (tooBig || tooSmall) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: tooBig ? ZodError_js_1.ZodIssueCode.too_big : ZodError_js_1.ZodIssueCode.too_small,
						minimum: tooSmall ? def.exactLength.value : void 0,
						maximum: tooBig ? def.exactLength.value : void 0,
						type: "array",
						inclusive: true,
						exact: true,
						message: def.exactLength.message
					});
					status.dirty();
				}
			}
			if (def.minLength !== null) {
				if (ctx.data.length < def.minLength.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: def.minLength.value,
						type: "array",
						inclusive: true,
						exact: false,
						message: def.minLength.message
					});
					status.dirty();
				}
			}
			if (def.maxLength !== null) {
				if (ctx.data.length > def.maxLength.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: def.maxLength.value,
						type: "array",
						inclusive: true,
						exact: false,
						message: def.maxLength.message
					});
					status.dirty();
				}
			}
			if (ctx.common.async) return Promise.all([...ctx.data].map((item, i) => {
				return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
			})).then((result) => {
				return parseUtil_js_1.ParseStatus.mergeArray(status, result);
			});
			const result = [...ctx.data].map((item, i) => {
				return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
			});
			return parseUtil_js_1.ParseStatus.mergeArray(status, result);
		}
		get element() {
			return this._def.type;
		}
		min(minLength, message) {
			return new ZodArray({
				...this._def,
				minLength: {
					value: minLength,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		max(maxLength, message) {
			return new ZodArray({
				...this._def,
				maxLength: {
					value: maxLength,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		length(len, message) {
			return new ZodArray({
				...this._def,
				exactLength: {
					value: len,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		nonempty(message) {
			return this.min(1, message);
		}
	};
	exports.ZodArray = ZodArray;
	ZodArray.create = (schema, params) => {
		return new ZodArray({
			type: schema,
			minLength: null,
			maxLength: null,
			exactLength: null,
			typeName: ZodFirstPartyTypeKind.ZodArray,
			...processCreateParams(params)
		});
	};
	function deepPartialify(schema) {
		if (schema instanceof ZodObject) {
			const newShape = {};
			for (const key in schema.shape) {
				const fieldSchema = schema.shape[key];
				newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
			}
			return new ZodObject({
				...schema._def,
				shape: () => newShape
			});
		} else if (schema instanceof ZodArray) return new ZodArray({
			...schema._def,
			type: deepPartialify(schema.element)
		});
		else if (schema instanceof ZodOptional) return ZodOptional.create(deepPartialify(schema.unwrap()));
		else if (schema instanceof ZodNullable) return ZodNullable.create(deepPartialify(schema.unwrap()));
		else if (schema instanceof ZodTuple) return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
		else return schema;
	}
	var ZodObject = class ZodObject extends ZodType {
		constructor() {
			super(...arguments);
			this._cached = null;
			/**
			* @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
			* If you want to pass through unknown properties, use `.passthrough()` instead.
			*/
			this.nonstrict = this.passthrough;
			/**
			* @deprecated Use `.extend` instead
			*  */
			this.augment = this.extend;
		}
		_getCached() {
			if (this._cached !== null) return this._cached;
			const shape = this._def.shape();
			const keys = util_js_1.util.objectKeys(shape);
			this._cached = {
				shape,
				keys
			};
			return this._cached;
		}
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.object) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.object,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const { status, ctx } = this._processInputParams(input);
			const { shape, keys: shapeKeys } = this._getCached();
			const extraKeys = [];
			if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
				for (const key in ctx.data) if (!shapeKeys.includes(key)) extraKeys.push(key);
			}
			const pairs = [];
			for (const key of shapeKeys) {
				const keyValidator = shape[key];
				const value = ctx.data[key];
				pairs.push({
					key: {
						status: "valid",
						value: key
					},
					value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
					alwaysSet: key in ctx.data
				});
			}
			if (this._def.catchall instanceof ZodNever) {
				const unknownKeys = this._def.unknownKeys;
				if (unknownKeys === "passthrough") for (const key of extraKeys) pairs.push({
					key: {
						status: "valid",
						value: key
					},
					value: {
						status: "valid",
						value: ctx.data[key]
					}
				});
				else if (unknownKeys === "strict") {
					if (extraKeys.length > 0) {
						(0, parseUtil_js_1.addIssueToContext)(ctx, {
							code: ZodError_js_1.ZodIssueCode.unrecognized_keys,
							keys: extraKeys
						});
						status.dirty();
					}
				} else if (unknownKeys === "strip") {} else throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
			} else {
				const catchall = this._def.catchall;
				for (const key of extraKeys) {
					const value = ctx.data[key];
					pairs.push({
						key: {
							status: "valid",
							value: key
						},
						value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
						alwaysSet: key in ctx.data
					});
				}
			}
			if (ctx.common.async) return Promise.resolve().then(async () => {
				const syncPairs = [];
				for (const pair of pairs) {
					const key = await pair.key;
					const value = await pair.value;
					syncPairs.push({
						key,
						value,
						alwaysSet: pair.alwaysSet
					});
				}
				return syncPairs;
			}).then((syncPairs) => {
				return parseUtil_js_1.ParseStatus.mergeObjectSync(status, syncPairs);
			});
			else return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
		}
		get shape() {
			return this._def.shape();
		}
		strict(message) {
			errorUtil_js_1.errorUtil.errToObj;
			return new ZodObject({
				...this._def,
				unknownKeys: "strict",
				...message !== void 0 ? { errorMap: (issue, ctx) => {
					const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
					if (issue.code === "unrecognized_keys") return { message: errorUtil_js_1.errorUtil.errToObj(message).message ?? defaultError };
					return { message: defaultError };
				} } : {}
			});
		}
		strip() {
			return new ZodObject({
				...this._def,
				unknownKeys: "strip"
			});
		}
		passthrough() {
			return new ZodObject({
				...this._def,
				unknownKeys: "passthrough"
			});
		}
		extend(augmentation) {
			return new ZodObject({
				...this._def,
				shape: () => ({
					...this._def.shape(),
					...augmentation
				})
			});
		}
		/**
		* Prior to zod@1.0.12 there was a bug in the
		* inferred type of merged objects. Please
		* upgrade if you are experiencing issues.
		*/
		merge(merging) {
			return new ZodObject({
				unknownKeys: merging._def.unknownKeys,
				catchall: merging._def.catchall,
				shape: () => ({
					...this._def.shape(),
					...merging._def.shape()
				}),
				typeName: ZodFirstPartyTypeKind.ZodObject
			});
		}
		setKey(key, schema) {
			return this.augment({ [key]: schema });
		}
		catchall(index) {
			return new ZodObject({
				...this._def,
				catchall: index
			});
		}
		pick(mask) {
			const shape = {};
			for (const key of util_js_1.util.objectKeys(mask)) if (mask[key] && this.shape[key]) shape[key] = this.shape[key];
			return new ZodObject({
				...this._def,
				shape: () => shape
			});
		}
		omit(mask) {
			const shape = {};
			for (const key of util_js_1.util.objectKeys(this.shape)) if (!mask[key]) shape[key] = this.shape[key];
			return new ZodObject({
				...this._def,
				shape: () => shape
			});
		}
		/**
		* @deprecated
		*/
		deepPartial() {
			return deepPartialify(this);
		}
		partial(mask) {
			const newShape = {};
			for (const key of util_js_1.util.objectKeys(this.shape)) {
				const fieldSchema = this.shape[key];
				if (mask && !mask[key]) newShape[key] = fieldSchema;
				else newShape[key] = fieldSchema.optional();
			}
			return new ZodObject({
				...this._def,
				shape: () => newShape
			});
		}
		required(mask) {
			const newShape = {};
			for (const key of util_js_1.util.objectKeys(this.shape)) if (mask && !mask[key]) newShape[key] = this.shape[key];
			else {
				let newField = this.shape[key];
				while (newField instanceof ZodOptional) newField = newField._def.innerType;
				newShape[key] = newField;
			}
			return new ZodObject({
				...this._def,
				shape: () => newShape
			});
		}
		keyof() {
			return createZodEnum(util_js_1.util.objectKeys(this.shape));
		}
	};
	exports.ZodObject = ZodObject;
	ZodObject.create = (shape, params) => {
		return new ZodObject({
			shape: () => shape,
			unknownKeys: "strip",
			catchall: ZodNever.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	ZodObject.strictCreate = (shape, params) => {
		return new ZodObject({
			shape: () => shape,
			unknownKeys: "strict",
			catchall: ZodNever.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	ZodObject.lazycreate = (shape, params) => {
		return new ZodObject({
			shape,
			unknownKeys: "strip",
			catchall: ZodNever.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	var ZodUnion = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const options = this._def.options;
			function handleResults(results) {
				for (const result of results) if (result.result.status === "valid") return result.result;
				for (const result of results) if (result.result.status === "dirty") {
					ctx.common.issues.push(...result.ctx.common.issues);
					return result.result;
				}
				const unionErrors = results.map((result) => new ZodError_js_1.ZodError(result.ctx.common.issues));
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_union,
					unionErrors
				});
				return parseUtil_js_1.INVALID;
			}
			if (ctx.common.async) return Promise.all(options.map(async (option) => {
				const childCtx = {
					...ctx,
					common: {
						...ctx.common,
						issues: []
					},
					parent: null
				};
				return {
					result: await option._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: childCtx
					}),
					ctx: childCtx
				};
			})).then(handleResults);
			else {
				let dirty = void 0;
				const issues = [];
				for (const option of options) {
					const childCtx = {
						...ctx,
						common: {
							...ctx.common,
							issues: []
						},
						parent: null
					};
					const result = option._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: childCtx
					});
					if (result.status === "valid") return result;
					else if (result.status === "dirty" && !dirty) dirty = {
						result,
						ctx: childCtx
					};
					if (childCtx.common.issues.length) issues.push(childCtx.common.issues);
				}
				if (dirty) {
					ctx.common.issues.push(...dirty.ctx.common.issues);
					return dirty.result;
				}
				const unionErrors = issues.map((issues) => new ZodError_js_1.ZodError(issues));
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_union,
					unionErrors
				});
				return parseUtil_js_1.INVALID;
			}
		}
		get options() {
			return this._def.options;
		}
	};
	exports.ZodUnion = ZodUnion;
	ZodUnion.create = (types, params) => {
		return new ZodUnion({
			options: types,
			typeName: ZodFirstPartyTypeKind.ZodUnion,
			...processCreateParams(params)
		});
	};
	var getDiscriminator = (type) => {
		if (type instanceof ZodLazy) return getDiscriminator(type.schema);
		else if (type instanceof ZodEffects) return getDiscriminator(type.innerType());
		else if (type instanceof ZodLiteral) return [type.value];
		else if (type instanceof ZodEnum) return type.options;
		else if (type instanceof ZodNativeEnum) return util_js_1.util.objectValues(type.enum);
		else if (type instanceof ZodDefault) return getDiscriminator(type._def.innerType);
		else if (type instanceof ZodUndefined) return [void 0];
		else if (type instanceof ZodNull) return [null];
		else if (type instanceof ZodOptional) return [void 0, ...getDiscriminator(type.unwrap())];
		else if (type instanceof ZodNullable) return [null, ...getDiscriminator(type.unwrap())];
		else if (type instanceof ZodBranded) return getDiscriminator(type.unwrap());
		else if (type instanceof ZodReadonly) return getDiscriminator(type.unwrap());
		else if (type instanceof ZodCatch) return getDiscriminator(type._def.innerType);
		else return [];
	};
	var ZodDiscriminatedUnion = class ZodDiscriminatedUnion extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.object,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const discriminator = this.discriminator;
			const discriminatorValue = ctx.data[discriminator];
			const option = this.optionsMap.get(discriminatorValue);
			if (!option) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_union_discriminator,
					options: Array.from(this.optionsMap.keys()),
					path: [discriminator]
				});
				return parseUtil_js_1.INVALID;
			}
			if (ctx.common.async) return option._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
			else return option._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
		}
		get discriminator() {
			return this._def.discriminator;
		}
		get options() {
			return this._def.options;
		}
		get optionsMap() {
			return this._def.optionsMap;
		}
		/**
		* The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
		* However, it only allows a union of objects, all of which need to share a discriminator property. This property must
		* have a different value for each object in the union.
		* @param discriminator the name of the discriminator property
		* @param types an array of object schemas
		* @param params
		*/
		static create(discriminator, options, params) {
			const optionsMap = /* @__PURE__ */ new Map();
			for (const type of options) {
				const discriminatorValues = getDiscriminator(type.shape[discriminator]);
				if (!discriminatorValues.length) throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
				for (const value of discriminatorValues) {
					if (optionsMap.has(value)) throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
					optionsMap.set(value, type);
				}
			}
			return new ZodDiscriminatedUnion({
				typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
				discriminator,
				options,
				optionsMap,
				...processCreateParams(params)
			});
		}
	};
	exports.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
	function mergeValues(a, b) {
		const aType = (0, util_js_1.getParsedType)(a);
		const bType = (0, util_js_1.getParsedType)(b);
		if (a === b) return {
			valid: true,
			data: a
		};
		else if (aType === util_js_1.ZodParsedType.object && bType === util_js_1.ZodParsedType.object) {
			const bKeys = util_js_1.util.objectKeys(b);
			const sharedKeys = util_js_1.util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
			const newObj = {
				...a,
				...b
			};
			for (const key of sharedKeys) {
				const sharedValue = mergeValues(a[key], b[key]);
				if (!sharedValue.valid) return { valid: false };
				newObj[key] = sharedValue.data;
			}
			return {
				valid: true,
				data: newObj
			};
		} else if (aType === util_js_1.ZodParsedType.array && bType === util_js_1.ZodParsedType.array) {
			if (a.length !== b.length) return { valid: false };
			const newArray = [];
			for (let index = 0; index < a.length; index++) {
				const itemA = a[index];
				const itemB = b[index];
				const sharedValue = mergeValues(itemA, itemB);
				if (!sharedValue.valid) return { valid: false };
				newArray.push(sharedValue.data);
			}
			return {
				valid: true,
				data: newArray
			};
		} else if (aType === util_js_1.ZodParsedType.date && bType === util_js_1.ZodParsedType.date && +a === +b) return {
			valid: true,
			data: a
		};
		else return { valid: false };
	}
	var ZodIntersection = class extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			const handleParsed = (parsedLeft, parsedRight) => {
				if ((0, parseUtil_js_1.isAborted)(parsedLeft) || (0, parseUtil_js_1.isAborted)(parsedRight)) return parseUtil_js_1.INVALID;
				const merged = mergeValues(parsedLeft.value, parsedRight.value);
				if (!merged.valid) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, { code: ZodError_js_1.ZodIssueCode.invalid_intersection_types });
					return parseUtil_js_1.INVALID;
				}
				if ((0, parseUtil_js_1.isDirty)(parsedLeft) || (0, parseUtil_js_1.isDirty)(parsedRight)) status.dirty();
				return {
					status: status.value,
					value: merged.data
				};
			};
			if (ctx.common.async) return Promise.all([this._def.left._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}), this._def.right._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			})]).then(([left, right]) => handleParsed(left, right));
			else return handleParsed(this._def.left._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}), this._def.right._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}));
		}
	};
	exports.ZodIntersection = ZodIntersection;
	ZodIntersection.create = (left, right, params) => {
		return new ZodIntersection({
			left,
			right,
			typeName: ZodFirstPartyTypeKind.ZodIntersection,
			...processCreateParams(params)
		});
	};
	var ZodTuple = class ZodTuple extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.array,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			if (ctx.data.length < this._def.items.length) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.too_small,
					minimum: this._def.items.length,
					inclusive: true,
					exact: false,
					type: "array"
				});
				return parseUtil_js_1.INVALID;
			}
			if (!this._def.rest && ctx.data.length > this._def.items.length) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.too_big,
					maximum: this._def.items.length,
					inclusive: true,
					exact: false,
					type: "array"
				});
				status.dirty();
			}
			const items = [...ctx.data].map((item, itemIndex) => {
				const schema = this._def.items[itemIndex] || this._def.rest;
				if (!schema) return null;
				return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
			}).filter((x) => !!x);
			if (ctx.common.async) return Promise.all(items).then((results) => {
				return parseUtil_js_1.ParseStatus.mergeArray(status, results);
			});
			else return parseUtil_js_1.ParseStatus.mergeArray(status, items);
		}
		get items() {
			return this._def.items;
		}
		rest(rest) {
			return new ZodTuple({
				...this._def,
				rest
			});
		}
	};
	exports.ZodTuple = ZodTuple;
	ZodTuple.create = (schemas, params) => {
		if (!Array.isArray(schemas)) throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
		return new ZodTuple({
			items: schemas,
			typeName: ZodFirstPartyTypeKind.ZodTuple,
			rest: null,
			...processCreateParams(params)
		});
	};
	var ZodRecord = class ZodRecord extends ZodType {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.object,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const pairs = [];
			const keyType = this._def.keyType;
			const valueType = this._def.valueType;
			for (const key in ctx.data) pairs.push({
				key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
				value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
				alwaysSet: key in ctx.data
			});
			if (ctx.common.async) return parseUtil_js_1.ParseStatus.mergeObjectAsync(status, pairs);
			else return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
		}
		get element() {
			return this._def.valueType;
		}
		static create(first, second, third) {
			if (second instanceof ZodType) return new ZodRecord({
				keyType: first,
				valueType: second,
				typeName: ZodFirstPartyTypeKind.ZodRecord,
				...processCreateParams(third)
			});
			return new ZodRecord({
				keyType: ZodString.create(),
				valueType: first,
				typeName: ZodFirstPartyTypeKind.ZodRecord,
				...processCreateParams(second)
			});
		}
	};
	exports.ZodRecord = ZodRecord;
	var ZodMap = class extends ZodType {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.map) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.map,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const keyType = this._def.keyType;
			const valueType = this._def.valueType;
			const pairs = [...ctx.data.entries()].map(([key, value], index) => {
				return {
					key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
					value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
				};
			});
			if (ctx.common.async) {
				const finalMap = /* @__PURE__ */ new Map();
				return Promise.resolve().then(async () => {
					for (const pair of pairs) {
						const key = await pair.key;
						const value = await pair.value;
						if (key.status === "aborted" || value.status === "aborted") return parseUtil_js_1.INVALID;
						if (key.status === "dirty" || value.status === "dirty") status.dirty();
						finalMap.set(key.value, value.value);
					}
					return {
						status: status.value,
						value: finalMap
					};
				});
			} else {
				const finalMap = /* @__PURE__ */ new Map();
				for (const pair of pairs) {
					const key = pair.key;
					const value = pair.value;
					if (key.status === "aborted" || value.status === "aborted") return parseUtil_js_1.INVALID;
					if (key.status === "dirty" || value.status === "dirty") status.dirty();
					finalMap.set(key.value, value.value);
				}
				return {
					status: status.value,
					value: finalMap
				};
			}
		}
	};
	exports.ZodMap = ZodMap;
	ZodMap.create = (keyType, valueType, params) => {
		return new ZodMap({
			valueType,
			keyType,
			typeName: ZodFirstPartyTypeKind.ZodMap,
			...processCreateParams(params)
		});
	};
	var ZodSet = class ZodSet extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.set) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.set,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const def = this._def;
			if (def.minSize !== null) {
				if (ctx.data.size < def.minSize.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: def.minSize.value,
						type: "set",
						inclusive: true,
						exact: false,
						message: def.minSize.message
					});
					status.dirty();
				}
			}
			if (def.maxSize !== null) {
				if (ctx.data.size > def.maxSize.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: def.maxSize.value,
						type: "set",
						inclusive: true,
						exact: false,
						message: def.maxSize.message
					});
					status.dirty();
				}
			}
			const valueType = this._def.valueType;
			function finalizeSet(elements) {
				const parsedSet = /* @__PURE__ */ new Set();
				for (const element of elements) {
					if (element.status === "aborted") return parseUtil_js_1.INVALID;
					if (element.status === "dirty") status.dirty();
					parsedSet.add(element.value);
				}
				return {
					status: status.value,
					value: parsedSet
				};
			}
			const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
			if (ctx.common.async) return Promise.all(elements).then((elements) => finalizeSet(elements));
			else return finalizeSet(elements);
		}
		min(minSize, message) {
			return new ZodSet({
				...this._def,
				minSize: {
					value: minSize,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		max(maxSize, message) {
			return new ZodSet({
				...this._def,
				maxSize: {
					value: maxSize,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		size(size, message) {
			return this.min(size, message).max(size, message);
		}
		nonempty(message) {
			return this.min(1, message);
		}
	};
	exports.ZodSet = ZodSet;
	ZodSet.create = (valueType, params) => {
		return new ZodSet({
			valueType,
			minSize: null,
			maxSize: null,
			typeName: ZodFirstPartyTypeKind.ZodSet,
			...processCreateParams(params)
		});
	};
	var ZodFunction = class ZodFunction extends ZodType {
		constructor() {
			super(...arguments);
			this.validate = this.implement;
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.function) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.function,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			function makeArgsIssue(args, error) {
				return (0, parseUtil_js_1.makeIssue)({
					data: args,
					path: ctx.path,
					errorMaps: [
						ctx.common.contextualErrorMap,
						ctx.schemaErrorMap,
						(0, errors_js_1.getErrorMap)(),
						errors_js_1.defaultErrorMap
					].filter((x) => !!x),
					issueData: {
						code: ZodError_js_1.ZodIssueCode.invalid_arguments,
						argumentsError: error
					}
				});
			}
			function makeReturnsIssue(returns, error) {
				return (0, parseUtil_js_1.makeIssue)({
					data: returns,
					path: ctx.path,
					errorMaps: [
						ctx.common.contextualErrorMap,
						ctx.schemaErrorMap,
						(0, errors_js_1.getErrorMap)(),
						errors_js_1.defaultErrorMap
					].filter((x) => !!x),
					issueData: {
						code: ZodError_js_1.ZodIssueCode.invalid_return_type,
						returnTypeError: error
					}
				});
			}
			const params = { errorMap: ctx.common.contextualErrorMap };
			const fn = ctx.data;
			if (this._def.returns instanceof ZodPromise) {
				const me = this;
				return (0, parseUtil_js_1.OK)(async function(...args) {
					const error = new ZodError_js_1.ZodError([]);
					const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
						error.addIssue(makeArgsIssue(args, e));
						throw error;
					});
					const result = await Reflect.apply(fn, this, parsedArgs);
					return await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
						error.addIssue(makeReturnsIssue(result, e));
						throw error;
					});
				});
			} else {
				const me = this;
				return (0, parseUtil_js_1.OK)(function(...args) {
					const parsedArgs = me._def.args.safeParse(args, params);
					if (!parsedArgs.success) throw new ZodError_js_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
					const result = Reflect.apply(fn, this, parsedArgs.data);
					const parsedReturns = me._def.returns.safeParse(result, params);
					if (!parsedReturns.success) throw new ZodError_js_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
					return parsedReturns.data;
				});
			}
		}
		parameters() {
			return this._def.args;
		}
		returnType() {
			return this._def.returns;
		}
		args(...items) {
			return new ZodFunction({
				...this._def,
				args: ZodTuple.create(items).rest(ZodUnknown.create())
			});
		}
		returns(returnType) {
			return new ZodFunction({
				...this._def,
				returns: returnType
			});
		}
		implement(func) {
			return this.parse(func);
		}
		strictImplement(func) {
			return this.parse(func);
		}
		static create(args, returns, params) {
			return new ZodFunction({
				args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
				returns: returns || ZodUnknown.create(),
				typeName: ZodFirstPartyTypeKind.ZodFunction,
				...processCreateParams(params)
			});
		}
	};
	exports.ZodFunction = ZodFunction;
	var ZodLazy = class extends ZodType {
		get schema() {
			return this._def.getter();
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			return this._def.getter()._parse({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
		}
	};
	exports.ZodLazy = ZodLazy;
	ZodLazy.create = (getter, params) => {
		return new ZodLazy({
			getter,
			typeName: ZodFirstPartyTypeKind.ZodLazy,
			...processCreateParams(params)
		});
	};
	var ZodLiteral = class extends ZodType {
		_parse(input) {
			if (input.data !== this._def.value) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					received: ctx.data,
					code: ZodError_js_1.ZodIssueCode.invalid_literal,
					expected: this._def.value
				});
				return parseUtil_js_1.INVALID;
			}
			return {
				status: "valid",
				value: input.data
			};
		}
		get value() {
			return this._def.value;
		}
	};
	exports.ZodLiteral = ZodLiteral;
	ZodLiteral.create = (value, params) => {
		return new ZodLiteral({
			value,
			typeName: ZodFirstPartyTypeKind.ZodLiteral,
			...processCreateParams(params)
		});
	};
	function createZodEnum(values, params) {
		return new ZodEnum({
			values,
			typeName: ZodFirstPartyTypeKind.ZodEnum,
			...processCreateParams(params)
		});
	}
	var ZodEnum = class ZodEnum extends ZodType {
		_parse(input) {
			if (typeof input.data !== "string") {
				const ctx = this._getOrReturnCtx(input);
				const expectedValues = this._def.values;
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					expected: util_js_1.util.joinValues(expectedValues),
					received: ctx.parsedType,
					code: ZodError_js_1.ZodIssueCode.invalid_type
				});
				return parseUtil_js_1.INVALID;
			}
			if (!this._cache) this._cache = new Set(this._def.values);
			if (!this._cache.has(input.data)) {
				const ctx = this._getOrReturnCtx(input);
				const expectedValues = this._def.values;
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					received: ctx.data,
					code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
					options: expectedValues
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
		get options() {
			return this._def.values;
		}
		get enum() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		get Values() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		get Enum() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		extract(values, newDef = this._def) {
			return ZodEnum.create(values, {
				...this._def,
				...newDef
			});
		}
		exclude(values, newDef = this._def) {
			return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
				...this._def,
				...newDef
			});
		}
	};
	exports.ZodEnum = ZodEnum;
	ZodEnum.create = createZodEnum;
	var ZodNativeEnum = class extends ZodType {
		_parse(input) {
			const nativeEnumValues = util_js_1.util.getValidEnumValues(this._def.values);
			const ctx = this._getOrReturnCtx(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.string && ctx.parsedType !== util_js_1.ZodParsedType.number) {
				const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					expected: util_js_1.util.joinValues(expectedValues),
					received: ctx.parsedType,
					code: ZodError_js_1.ZodIssueCode.invalid_type
				});
				return parseUtil_js_1.INVALID;
			}
			if (!this._cache) this._cache = new Set(util_js_1.util.getValidEnumValues(this._def.values));
			if (!this._cache.has(input.data)) {
				const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					received: ctx.data,
					code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
					options: expectedValues
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
		get enum() {
			return this._def.values;
		}
	};
	exports.ZodNativeEnum = ZodNativeEnum;
	ZodNativeEnum.create = (values, params) => {
		return new ZodNativeEnum({
			values,
			typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
			...processCreateParams(params)
		});
	};
	var ZodPromise = class extends ZodType {
		unwrap() {
			return this._def.type;
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.promise && ctx.common.async === false) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.promise,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const promisified = ctx.parsedType === util_js_1.ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
			return (0, parseUtil_js_1.OK)(promisified.then((data) => {
				return this._def.type.parseAsync(data, {
					path: ctx.path,
					errorMap: ctx.common.contextualErrorMap
				});
			}));
		}
	};
	exports.ZodPromise = ZodPromise;
	ZodPromise.create = (schema, params) => {
		return new ZodPromise({
			type: schema,
			typeName: ZodFirstPartyTypeKind.ZodPromise,
			...processCreateParams(params)
		});
	};
	var ZodEffects = class extends ZodType {
		innerType() {
			return this._def.schema;
		}
		sourceType() {
			return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			const effect = this._def.effect || null;
			const checkCtx = {
				addIssue: (arg) => {
					(0, parseUtil_js_1.addIssueToContext)(ctx, arg);
					if (arg.fatal) status.abort();
					else status.dirty();
				},
				get path() {
					return ctx.path;
				}
			};
			checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
			if (effect.type === "preprocess") {
				const processed = effect.transform(ctx.data, checkCtx);
				if (ctx.common.async) return Promise.resolve(processed).then(async (processed) => {
					if (status.value === "aborted") return parseUtil_js_1.INVALID;
					const result = await this._def.schema._parseAsync({
						data: processed,
						path: ctx.path,
						parent: ctx
					});
					if (result.status === "aborted") return parseUtil_js_1.INVALID;
					if (result.status === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					if (status.value === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					return result;
				});
				else {
					if (status.value === "aborted") return parseUtil_js_1.INVALID;
					const result = this._def.schema._parseSync({
						data: processed,
						path: ctx.path,
						parent: ctx
					});
					if (result.status === "aborted") return parseUtil_js_1.INVALID;
					if (result.status === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					if (status.value === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					return result;
				}
			}
			if (effect.type === "refinement") {
				const executeRefinement = (acc) => {
					const result = effect.refinement(acc, checkCtx);
					if (ctx.common.async) return Promise.resolve(result);
					if (result instanceof Promise) throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
					return acc;
				};
				if (ctx.common.async === false) {
					const inner = this._def.schema._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (inner.status === "aborted") return parseUtil_js_1.INVALID;
					if (inner.status === "dirty") status.dirty();
					executeRefinement(inner.value);
					return {
						status: status.value,
						value: inner.value
					};
				} else return this._def.schema._parseAsync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				}).then((inner) => {
					if (inner.status === "aborted") return parseUtil_js_1.INVALID;
					if (inner.status === "dirty") status.dirty();
					return executeRefinement(inner.value).then(() => {
						return {
							status: status.value,
							value: inner.value
						};
					});
				});
			}
			if (effect.type === "transform") {
				if (ctx.common.async === false) {
					const base = this._def.schema._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (!(0, parseUtil_js_1.isValid)(base)) return parseUtil_js_1.INVALID;
					const result = effect.transform(base.value, checkCtx);
					if (result instanceof Promise) throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
					return {
						status: status.value,
						value: result
					};
				} else return this._def.schema._parseAsync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				}).then((base) => {
					if (!(0, parseUtil_js_1.isValid)(base)) return parseUtil_js_1.INVALID;
					return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
						status: status.value,
						value: result
					}));
				});
			}
			util_js_1.util.assertNever(effect);
		}
	};
	exports.ZodEffects = ZodEffects;
	exports.ZodTransformer = ZodEffects;
	ZodEffects.create = (schema, effect, params) => {
		return new ZodEffects({
			schema,
			typeName: ZodFirstPartyTypeKind.ZodEffects,
			effect,
			...processCreateParams(params)
		});
	};
	ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
		return new ZodEffects({
			schema,
			effect: {
				type: "preprocess",
				transform: preprocess
			},
			typeName: ZodFirstPartyTypeKind.ZodEffects,
			...processCreateParams(params)
		});
	};
	var ZodOptional = class extends ZodType {
		_parse(input) {
			if (this._getType(input) === util_js_1.ZodParsedType.undefined) return (0, parseUtil_js_1.OK)(void 0);
			return this._def.innerType._parse(input);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	exports.ZodOptional = ZodOptional;
	ZodOptional.create = (type, params) => {
		return new ZodOptional({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodOptional,
			...processCreateParams(params)
		});
	};
	var ZodNullable = class extends ZodType {
		_parse(input) {
			if (this._getType(input) === util_js_1.ZodParsedType.null) return (0, parseUtil_js_1.OK)(null);
			return this._def.innerType._parse(input);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	exports.ZodNullable = ZodNullable;
	ZodNullable.create = (type, params) => {
		return new ZodNullable({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodNullable,
			...processCreateParams(params)
		});
	};
	var ZodDefault = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			let data = ctx.data;
			if (ctx.parsedType === util_js_1.ZodParsedType.undefined) data = this._def.defaultValue();
			return this._def.innerType._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
		}
		removeDefault() {
			return this._def.innerType;
		}
	};
	exports.ZodDefault = ZodDefault;
	ZodDefault.create = (type, params) => {
		return new ZodDefault({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodDefault,
			defaultValue: typeof params.default === "function" ? params.default : () => params.default,
			...processCreateParams(params)
		});
	};
	var ZodCatch = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const newCtx = {
				...ctx,
				common: {
					...ctx.common,
					issues: []
				}
			};
			const result = this._def.innerType._parse({
				data: newCtx.data,
				path: newCtx.path,
				parent: { ...newCtx }
			});
			if ((0, parseUtil_js_1.isAsync)(result)) return result.then((result) => {
				return {
					status: "valid",
					value: result.status === "valid" ? result.value : this._def.catchValue({
						get error() {
							return new ZodError_js_1.ZodError(newCtx.common.issues);
						},
						input: newCtx.data
					})
				};
			});
			else return {
				status: "valid",
				value: result.status === "valid" ? result.value : this._def.catchValue({
					get error() {
						return new ZodError_js_1.ZodError(newCtx.common.issues);
					},
					input: newCtx.data
				})
			};
		}
		removeCatch() {
			return this._def.innerType;
		}
	};
	exports.ZodCatch = ZodCatch;
	ZodCatch.create = (type, params) => {
		return new ZodCatch({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodCatch,
			catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
			...processCreateParams(params)
		});
	};
	var ZodNaN = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.nan) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.nan,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return {
				status: "valid",
				value: input.data
			};
		}
	};
	exports.ZodNaN = ZodNaN;
	ZodNaN.create = (params) => {
		return new ZodNaN({
			typeName: ZodFirstPartyTypeKind.ZodNaN,
			...processCreateParams(params)
		});
	};
	exports.BRAND = Symbol("zod_brand");
	var ZodBranded = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const data = ctx.data;
			return this._def.type._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
		}
		unwrap() {
			return this._def.type;
		}
	};
	exports.ZodBranded = ZodBranded;
	var ZodPipeline = class ZodPipeline extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.common.async) {
				const handleAsync = async () => {
					const inResult = await this._def.in._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (inResult.status === "aborted") return parseUtil_js_1.INVALID;
					if (inResult.status === "dirty") {
						status.dirty();
						return (0, parseUtil_js_1.DIRTY)(inResult.value);
					} else return this._def.out._parseAsync({
						data: inResult.value,
						path: ctx.path,
						parent: ctx
					});
				};
				return handleAsync();
			} else {
				const inResult = this._def.in._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
				if (inResult.status === "aborted") return parseUtil_js_1.INVALID;
				if (inResult.status === "dirty") {
					status.dirty();
					return {
						status: "dirty",
						value: inResult.value
					};
				} else return this._def.out._parseSync({
					data: inResult.value,
					path: ctx.path,
					parent: ctx
				});
			}
		}
		static create(a, b) {
			return new ZodPipeline({
				in: a,
				out: b,
				typeName: ZodFirstPartyTypeKind.ZodPipeline
			});
		}
	};
	exports.ZodPipeline = ZodPipeline;
	var ZodReadonly = class extends ZodType {
		_parse(input) {
			const result = this._def.innerType._parse(input);
			const freeze = (data) => {
				if ((0, parseUtil_js_1.isValid)(data)) data.value = Object.freeze(data.value);
				return data;
			};
			return (0, parseUtil_js_1.isAsync)(result) ? result.then((data) => freeze(data)) : freeze(result);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	exports.ZodReadonly = ZodReadonly;
	ZodReadonly.create = (type, params) => {
		return new ZodReadonly({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodReadonly,
			...processCreateParams(params)
		});
	};
	function cleanParams(params, data) {
		const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
		return typeof p === "string" ? { message: p } : p;
	}
	function custom(check, _params = {}, fatal) {
		if (check) return ZodAny.create().superRefine((data, ctx) => {
			const r = check(data);
			if (r instanceof Promise) return r.then((r) => {
				if (!r) {
					const params = cleanParams(_params, data);
					const _fatal = params.fatal ?? fatal ?? true;
					ctx.addIssue({
						code: "custom",
						...params,
						fatal: _fatal
					});
				}
			});
			if (!r) {
				const params = cleanParams(_params, data);
				const _fatal = params.fatal ?? fatal ?? true;
				ctx.addIssue({
					code: "custom",
					...params,
					fatal: _fatal
				});
			}
		});
		return ZodAny.create();
	}
	exports.late = { object: ZodObject.lazycreate };
	var ZodFirstPartyTypeKind;
	(function(ZodFirstPartyTypeKind) {
		ZodFirstPartyTypeKind["ZodString"] = "ZodString";
		ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
		ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
		ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
		ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
		ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
		ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
		ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
		ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
		ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
		ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
		ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
		ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
		ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
		ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
		ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
		ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
		ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
		ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
		ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
		ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
		ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
		ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
		ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
		ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
		ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
		ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
		ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
		ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
		ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
		ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
		ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
		ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
		ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
		ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
		ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
	})(ZodFirstPartyTypeKind || (exports.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}));
	var instanceOfType = (cls, params = { message: `Input not instance of ${cls.name}` }) => custom((data) => data instanceof cls, params);
	exports.instanceof = instanceOfType;
	var stringType = ZodString.create;
	exports.string = stringType;
	var numberType = ZodNumber.create;
	exports.number = numberType;
	exports.nan = ZodNaN.create;
	exports.bigint = ZodBigInt.create;
	var booleanType = ZodBoolean.create;
	exports.boolean = booleanType;
	exports.date = ZodDate.create;
	exports.symbol = ZodSymbol.create;
	exports.undefined = ZodUndefined.create;
	exports.null = ZodNull.create;
	exports.any = ZodAny.create;
	exports.unknown = ZodUnknown.create;
	exports.never = ZodNever.create;
	exports.void = ZodVoid.create;
	exports.array = ZodArray.create;
	exports.object = ZodObject.create;
	exports.strictObject = ZodObject.strictCreate;
	exports.union = ZodUnion.create;
	exports.discriminatedUnion = ZodDiscriminatedUnion.create;
	exports.intersection = ZodIntersection.create;
	exports.tuple = ZodTuple.create;
	exports.record = ZodRecord.create;
	exports.map = ZodMap.create;
	exports.set = ZodSet.create;
	exports.function = ZodFunction.create;
	exports.lazy = ZodLazy.create;
	exports.literal = ZodLiteral.create;
	exports.enum = ZodEnum.create;
	exports.nativeEnum = ZodNativeEnum.create;
	exports.promise = ZodPromise.create;
	var effectsType = ZodEffects.create;
	exports.effect = effectsType;
	exports.transformer = effectsType;
	exports.optional = ZodOptional.create;
	exports.nullable = ZodNullable.create;
	exports.preprocess = ZodEffects.createWithPreprocess;
	exports.pipeline = ZodPipeline.create;
	var ostring = () => stringType().optional();
	exports.ostring = ostring;
	var onumber = () => numberType().optional();
	exports.onumber = onumber;
	var oboolean = () => booleanType().optional();
	exports.oboolean = oboolean;
	exports.coerce = {
		string: ((arg) => ZodString.create({
			...arg,
			coerce: true
		})),
		number: ((arg) => ZodNumber.create({
			...arg,
			coerce: true
		})),
		boolean: ((arg) => ZodBoolean.create({
			...arg,
			coerce: true
		})),
		bigint: ((arg) => ZodBigInt.create({
			...arg,
			coerce: true
		})),
		date: ((arg) => ZodDate.create({
			...arg,
			coerce: true
		}))
	};
	exports.NEVER = parseUtil_js_1.INVALID;
}));
//#endregion
//#region node_modules/zod/v3/external.cjs
var require_external$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$4) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$4, p)) __createBinding(exports$4, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_errors$1(), exports);
	__exportStar(require_parseUtil(), exports);
	__exportStar(require_typeAliases(), exports);
	__exportStar(require_util$4(), exports);
	__exportStar(require_types$4(), exports);
	__exportStar(require_ZodError(), exports);
}));
//#endregion
//#region node_modules/zod/index.cjs
var require_zod = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	var __exportStar = exports && exports.__exportStar || function(m, exports$3) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$3, p)) __createBinding(exports$3, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.z = void 0;
	var z = __importStar(require_external$1());
	exports.z = z;
	__exportStar(require_external$1(), exports);
	exports.default = z;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/check.js
var require_check = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isObject = exports.assure = exports.create = exports.is = void 0;
	var is = (obj, def) => {
		return def.safeParse(obj).success;
	};
	exports.is = is;
	var create = (def) => (v) => def.safeParse(v).success;
	exports.create = create;
	var assure = (def, obj) => {
		return def.parse(obj);
	};
	exports.assure = assure;
	var isObject = (obj) => {
		return typeof obj === "object" && obj !== null;
	};
	exports.isObject = isObject;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/util.js
var require_util$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseIntWithFallback = exports.dedupeStrs = exports.range = exports.chunkArray = exports.errHasMsg = exports.isErrnoException = exports.asyncFilter = exports.s32decode = exports.s32encode = exports.streamToBuffer = exports.flattenUint8Arrays = exports.bailableWait = exports.wait = exports.jitter = exports.noUndefinedVals = void 0;
	exports.aggregateErrors = aggregateErrors;
	exports.omit = omit;
	var noUndefinedVals = (obj) => {
		for (const k of Object.keys(obj)) if (obj[k] === void 0) delete obj[k];
		return obj;
	};
	exports.noUndefinedVals = noUndefinedVals;
	function aggregateErrors(errors, message) {
		if (errors.length === 1) return errors[0] instanceof Error ? errors[0] : new Error(message ?? stringifyError(errors[0]), { cause: errors[0] });
		else return new AggregateError(errors, message ?? `Multiple errors: ${errors.map(stringifyError).join("\n")}`);
	}
	function stringifyError(reason) {
		if (reason instanceof Error) return reason.message;
		return String(reason);
	}
	function omit(src, rejectedKeys) {
		if (!src) return src;
		const dst = {};
		const srcKeys = Object.keys(src);
		for (let i = 0; i < srcKeys.length; i++) {
			const key = srcKeys[i];
			if (!rejectedKeys.includes(key)) dst[key] = src[key];
		}
		return dst;
	}
	var jitter = (maxMs) => {
		return Math.round((Math.random() - .5) * maxMs * 2);
	};
	exports.jitter = jitter;
	var wait = (ms) => {
		return new Promise((res) => setTimeout(res, ms));
	};
	exports.wait = wait;
	var bailableWait = (ms) => {
		let bail;
		const waitPromise = new Promise((res) => {
			const timeout = setTimeout(res, ms);
			bail = () => {
				clearTimeout(timeout);
				res();
			};
		});
		return {
			bail,
			wait: () => waitPromise
		};
	};
	exports.bailableWait = bailableWait;
	var flattenUint8Arrays = (arrs) => {
		const length = arrs.reduce((acc, cur) => {
			return acc + cur.length;
		}, 0);
		const flattened = new Uint8Array(length);
		let offset = 0;
		arrs.forEach((arr) => {
			flattened.set(arr, offset);
			offset += arr.length;
		});
		return flattened;
	};
	exports.flattenUint8Arrays = flattenUint8Arrays;
	var streamToBuffer = async (stream) => {
		const arrays = [];
		for await (const chunk of stream) arrays.push(chunk);
		return (0, exports.flattenUint8Arrays)(arrays);
	};
	exports.streamToBuffer = streamToBuffer;
	var S32_CHAR = "234567abcdefghijklmnopqrstuvwxyz";
	var s32encode = (i) => {
		let s = "";
		while (i) {
			const c = i % 32;
			i = Math.floor(i / 32);
			s = S32_CHAR.charAt(c) + s;
		}
		return s;
	};
	exports.s32encode = s32encode;
	var s32decode = (s) => {
		let i = 0;
		for (const c of s) i = i * 32 + S32_CHAR.indexOf(c);
		return i;
	};
	exports.s32decode = s32decode;
	var asyncFilter = async (arr, fn) => {
		const results = await Promise.all(arr.map((t) => fn(t)));
		return arr.filter((_, i) => results[i]);
	};
	exports.asyncFilter = asyncFilter;
	var isErrnoException = (err) => {
		return !!err && err["code"];
	};
	exports.isErrnoException = isErrnoException;
	var errHasMsg = (err, msg) => {
		return !!err && typeof err === "object" && err["message"] === msg;
	};
	exports.errHasMsg = errHasMsg;
	var chunkArray = (arr, chunkSize) => {
		return arr.reduce((acc, cur, i) => {
			const chunkI = Math.floor(i / chunkSize);
			if (!acc[chunkI]) acc[chunkI] = [];
			acc[chunkI].push(cur);
			return acc;
		}, []);
	};
	exports.chunkArray = chunkArray;
	var range = (num) => {
		const nums = [];
		for (let i = 0; i < num; i++) nums.push(i);
		return nums;
	};
	exports.range = range;
	var dedupeStrs = (strs) => {
		return [...new Set(strs)];
	};
	exports.dedupeStrs = dedupeStrs;
	var parseIntWithFallback = (value, fallback) => {
		const parsed = parseInt(value || "", 10);
		return isNaN(parsed) ? fallback : parsed;
	};
	exports.parseIntWithFallback = parseIntWithFallback;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/arrays.js
var require_arrays = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.mapDefined = void 0;
	exports.keyBy = keyBy;
	function keyBy(arr, key) {
		return arr.reduce((acc, cur) => {
			acc.set(cur[key], cur);
			return acc;
		}, /* @__PURE__ */ new Map());
	}
	var mapDefined = (arr, fn) => {
		const output = [];
		for (const item of arr) {
			const val = fn(item);
			if (val !== void 0) output.push(val);
		}
		return output;
	};
	exports.mapDefined = mapDefined;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/async.js
var require_async = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AsyncBufferFullError = exports.AsyncBuffer = exports.allComplete = exports.createDeferrables = exports.readFromGenerator = void 0;
	exports.createDeferrable = createDeferrable;
	exports.allFulfilled = allFulfilled;
	exports.handleAllSettledErrors = handleAllSettledErrors;
	exports.isRejectedResult = isRejectedResult;
	exports.isFulfilledResult = isFulfilledResult;
	var util_1 = require_util$3();
	var readFromGenerator = async (gen, isDone, waitFor = Promise.resolve(), maxLength = Number.MAX_SAFE_INTEGER) => {
		const evts = [];
		let bail;
		let hasBroke = false;
		const awaitDone = async () => {
			if (await isDone(evts.at(-1))) return true;
			const bailable = (0, util_1.bailableWait)(20);
			await bailable.wait();
			bail = bailable.bail;
			if (hasBroke) return false;
			return await awaitDone();
		};
		const breakOn = new Promise((resolve) => {
			waitFor.then(() => {
				awaitDone().then(() => resolve());
			});
		});
		try {
			while (evts.length < maxLength) {
				const maybeEvt = await Promise.race([gen.next(), breakOn]);
				if (!maybeEvt) break;
				const evt = maybeEvt;
				if (evt.done) break;
				evts.push(evt.value);
			}
		} finally {
			hasBroke = true;
			bail && bail();
		}
		return evts;
	};
	exports.readFromGenerator = readFromGenerator;
	function createDeferrable() {
		let res;
		let rej;
		const promise = new Promise((resolve, reject) => {
			res = resolve;
			rej = reject;
		});
		return {
			resolve: res,
			reject: rej,
			complete: promise
		};
	}
	var createDeferrables = (count) => {
		const list = [];
		for (let i = 0; i < count; i++) list.push(createDeferrable());
		return list;
	};
	exports.createDeferrables = createDeferrables;
	var allComplete = async (deferrables) => {
		await Promise.all(deferrables.map((d) => d.complete));
	};
	exports.allComplete = allComplete;
	var AsyncBuffer = class {
		constructor(maxSize) {
			Object.defineProperty(this, "maxSize", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: maxSize
			});
			Object.defineProperty(this, "buffer", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: []
			});
			Object.defineProperty(this, "promise", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "resolve", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "closed", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: false
			});
			Object.defineProperty(this, "toThrow", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			this.promise = Promise.resolve();
			this.resolve = () => null;
			this.resetPromise();
		}
		get curr() {
			return this.buffer;
		}
		get size() {
			return this.buffer.length;
		}
		get isClosed() {
			return this.closed;
		}
		resetPromise() {
			this.promise = new Promise((r) => this.resolve = r);
		}
		push(item) {
			this.buffer.push(item);
			this.resolve();
		}
		pushMany(items) {
			items.forEach((i) => this.buffer.push(i));
			this.resolve();
		}
		async *events() {
			while (true) {
				if (this.closed && this.buffer.length === 0) {
					if (this.toThrow) throw this.toThrow;
					else return;
				}
				await this.promise;
				if (this.toThrow) throw this.toThrow;
				if (this.maxSize && this.size > this.maxSize) throw new AsyncBufferFullError(this.maxSize);
				const [first, ...rest] = this.buffer;
				if (first) {
					this.buffer = rest;
					yield first;
				} else this.resetPromise();
			}
		}
		throw(err) {
			this.toThrow = err;
			this.closed = true;
			this.resolve();
		}
		close() {
			this.closed = true;
			this.resolve();
		}
	};
	exports.AsyncBuffer = AsyncBuffer;
	var AsyncBufferFullError = class extends Error {
		constructor(maxSize) {
			super(`ReachedMaxBufferSize: ${maxSize}`);
		}
	};
	exports.AsyncBufferFullError = AsyncBufferFullError;
	function allFulfilled(promises) {
		return Promise.allSettled(promises).then(handleAllSettledErrors);
	}
	function handleAllSettledErrors(results) {
		if (results.every(isFulfilledResult)) return results.map(extractValue);
		const errors = results.filter(isRejectedResult).map(extractReason);
		throw (0, util_1.aggregateErrors)(errors);
	}
	function isRejectedResult(result) {
		return result.status === "rejected";
	}
	function extractReason(result) {
		return result.reason;
	}
	function isFulfilledResult(result) {
		return result.status === "fulfilled";
	}
	function extractValue(result) {
		return result.value;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/tid.js
var require_tid$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TID = void 0;
	var util_1 = require_util$3();
	var TID_LEN = 13;
	var lastTimestamp = 0;
	var timestampCount = 0;
	var clockid = null;
	function dedash(str) {
		return str.replaceAll("-", "");
	}
	exports.TID = class TID {
		constructor(str) {
			Object.defineProperty(this, "str", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			const noDashes = dedash(str);
			if (noDashes.length !== TID_LEN) throw new Error(`Poorly formatted TID: ${noDashes.length} length`);
			this.str = noDashes;
		}
		static next(prev) {
			const time = Math.max(Date.now(), lastTimestamp);
			if (time === lastTimestamp) timestampCount++;
			lastTimestamp = time;
			const timestamp = time * 1e3 + timestampCount;
			if (clockid === null) clockid = Math.floor(Math.random() * 32);
			const tid = TID.fromTime(timestamp, clockid);
			if (!prev || tid.newerThan(prev)) return tid;
			return TID.fromTime(prev.timestamp() + 1, clockid);
		}
		static nextStr(prev) {
			return TID.next(prev ? new TID(prev) : void 0).toString();
		}
		static fromTime(timestamp, clockid) {
			const str = `${(0, util_1.s32encode)(timestamp)}${(0, util_1.s32encode)(clockid).padStart(2, "2")}`;
			return new TID(str);
		}
		static fromStr(str) {
			return new TID(str);
		}
		static oldestFirst(a, b) {
			return a.compareTo(b);
		}
		static newestFirst(a, b) {
			return b.compareTo(a);
		}
		static is(str) {
			return dedash(str).length === TID_LEN;
		}
		timestamp() {
			return (0, util_1.s32decode)(this.str.slice(0, 11));
		}
		clockid() {
			return (0, util_1.s32decode)(this.str.slice(11, 13));
		}
		formatted() {
			const str = this.toString();
			return `${str.slice(0, 4)}-${str.slice(4, 7)}-${str.slice(7, 11)}-${str.slice(11, 13)}`;
		}
		toString() {
			return this.str;
		}
		compareTo(other) {
			if (this.str > other.str) return 1;
			if (this.str < other.str) return -1;
			return 0;
		}
		equals(other) {
			return this.str === other.str;
		}
		newerThan(other) {
			return this.compareTo(other) > 0;
		}
		olderThan(other) {
			return this.compareTo(other) < 0;
		}
	};
}));
//#endregion
//#region node_modules/multiformats/esm/vendor/varint.js
function encode$3(num, out, offset) {
	out = out || [];
	offset = offset || 0;
	var oldOffset = offset;
	while (num >= INT) {
		out[offset++] = num & 255 | MSB;
		num /= 128;
	}
	while (num & MSBALL) {
		out[offset++] = num & 255 | MSB;
		num >>>= 7;
	}
	out[offset] = num | 0;
	encode$3.bytes = offset - oldOffset + 1;
	return out;
}
function read(buf, offset) {
	var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
	do {
		if (counter >= l) {
			read.bytes = 0;
			throw new RangeError("Could not decode varint");
		}
		b = buf[counter++];
		res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
		shift += 7;
	} while (b >= MSB$1);
	read.bytes = counter - offset;
	return res;
}
var encode_1, MSB, MSBALL, INT, decode$4, MSB$1, REST$1, N1, N2, N3, N4, N5, N6, N7, N8, N9, length, _brrp_varint;
var init_varint$1 = __esmMin((() => {
	encode_1 = encode$3;
	MSB = 128;
	MSBALL = -128;
	INT = Math.pow(2, 31);
	decode$4 = read;
	MSB$1 = 128;
	REST$1 = 127;
	N1 = Math.pow(2, 7);
	N2 = Math.pow(2, 14);
	N3 = Math.pow(2, 21);
	N4 = Math.pow(2, 28);
	N5 = Math.pow(2, 35);
	N6 = Math.pow(2, 42);
	N7 = Math.pow(2, 49);
	N8 = Math.pow(2, 56);
	N9 = Math.pow(2, 63);
	length = function(value) {
		return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
	};
	_brrp_varint = {
		encode: encode_1,
		decode: decode$4,
		encodingLength: length
	};
}));
//#endregion
//#region node_modules/multiformats/esm/src/varint.js
var decode$3, encodeTo, encodingLength;
var init_varint = __esmMin((() => {
	init_varint$1();
	decode$3 = (data, offset = 0) => {
		return [_brrp_varint.decode(data, offset), _brrp_varint.decode.bytes];
	};
	encodeTo = (int, target, offset = 0) => {
		_brrp_varint.encode(int, target, offset);
		return target;
	};
	encodingLength = (int) => {
		return _brrp_varint.encodingLength(int);
	};
}));
//#endregion
//#region node_modules/multiformats/esm/src/bytes.js
var equals$1, coerce, fromString$1, toString$1;
var init_bytes = __esmMin((() => {
	equals$1 = (aa, bb) => {
		if (aa === bb) return true;
		if (aa.byteLength !== bb.byteLength) return false;
		for (let ii = 0; ii < aa.byteLength; ii++) if (aa[ii] !== bb[ii]) return false;
		return true;
	};
	coerce = (o) => {
		if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") return o;
		if (o instanceof ArrayBuffer) return new Uint8Array(o);
		if (ArrayBuffer.isView(o)) return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
		throw new Error("Unknown type, must be binary type");
	};
	fromString$1 = (str) => new TextEncoder().encode(str);
	toString$1 = (b) => new TextDecoder().decode(b);
}));
//#endregion
//#region node_modules/multiformats/esm/src/hashes/digest.js
var digest_exports = /* @__PURE__ */ __exportAll({
	Digest: () => Digest,
	create: () => create,
	decode: () => decode$2,
	equals: () => equals
});
var create, decode$2, equals, Digest;
var init_digest = __esmMin((() => {
	init_bytes();
	init_varint();
	create = (code, digest) => {
		const size = digest.byteLength;
		const sizeOffset = encodingLength(code);
		const digestOffset = sizeOffset + encodingLength(size);
		const bytes = new Uint8Array(digestOffset + size);
		encodeTo(code, bytes, 0);
		encodeTo(size, bytes, sizeOffset);
		bytes.set(digest, digestOffset);
		return new Digest(code, size, digest, bytes);
	};
	decode$2 = (multihash) => {
		const bytes = coerce(multihash);
		const [code, sizeOffset] = decode$3(bytes);
		const [size, digestOffset] = decode$3(bytes.subarray(sizeOffset));
		const digest = bytes.subarray(sizeOffset + digestOffset);
		if (digest.byteLength !== size) throw new Error("Incorrect length");
		return new Digest(code, size, digest, bytes);
	};
	equals = (a, b) => {
		if (a === b) return true;
		else return a.code === b.code && a.size === b.size && equals$1(a.bytes, b.bytes);
	};
	Digest = class {
		constructor(code, size, digest, bytes) {
			this.code = code;
			this.size = size;
			this.digest = digest;
			this.bytes = bytes;
		}
	};
}));
//#endregion
//#region node_modules/multiformats/esm/vendor/base-x.js
function base(ALPHABET, name) {
	if (ALPHABET.length >= 255) throw new TypeError("Alphabet too long");
	var BASE_MAP = /* @__PURE__ */ new Uint8Array(256);
	for (var j = 0; j < BASE_MAP.length; j++) BASE_MAP[j] = 255;
	for (var i = 0; i < ALPHABET.length; i++) {
		var x = ALPHABET.charAt(i);
		var xc = x.charCodeAt(0);
		if (BASE_MAP[xc] !== 255) throw new TypeError(x + " is ambiguous");
		BASE_MAP[xc] = i;
	}
	var BASE = ALPHABET.length;
	var LEADER = ALPHABET.charAt(0);
	var FACTOR = Math.log(BASE) / Math.log(256);
	var iFACTOR = Math.log(256) / Math.log(BASE);
	function encode(source) {
		if (source instanceof Uint8Array);
		else if (ArrayBuffer.isView(source)) source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
		else if (Array.isArray(source)) source = Uint8Array.from(source);
		if (!(source instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
		if (source.length === 0) return "";
		var zeroes = 0;
		var length = 0;
		var pbegin = 0;
		var pend = source.length;
		while (pbegin !== pend && source[pbegin] === 0) {
			pbegin++;
			zeroes++;
		}
		var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
		var b58 = new Uint8Array(size);
		while (pbegin !== pend) {
			var carry = source[pbegin];
			var i = 0;
			for (var it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
				carry += 256 * b58[it1] >>> 0;
				b58[it1] = carry % BASE >>> 0;
				carry = carry / BASE >>> 0;
			}
			if (carry !== 0) throw new Error("Non-zero carry");
			length = i;
			pbegin++;
		}
		var it2 = size - length;
		while (it2 !== size && b58[it2] === 0) it2++;
		var str = LEADER.repeat(zeroes);
		for (; it2 < size; ++it2) str += ALPHABET.charAt(b58[it2]);
		return str;
	}
	function decodeUnsafe(source) {
		if (typeof source !== "string") throw new TypeError("Expected String");
		if (source.length === 0) return /* @__PURE__ */ new Uint8Array();
		var psz = 0;
		if (source[psz] === " ") return;
		var zeroes = 0;
		var length = 0;
		while (source[psz] === LEADER) {
			zeroes++;
			psz++;
		}
		var size = (source.length - psz) * FACTOR + 1 >>> 0;
		var b256 = new Uint8Array(size);
		while (source[psz]) {
			var carry = BASE_MAP[source.charCodeAt(psz)];
			if (carry === 255) return;
			var i = 0;
			for (var it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
				carry += BASE * b256[it3] >>> 0;
				b256[it3] = carry % 256 >>> 0;
				carry = carry / 256 >>> 0;
			}
			if (carry !== 0) throw new Error("Non-zero carry");
			length = i;
			psz++;
		}
		if (source[psz] === " ") return;
		var it4 = size - length;
		while (it4 !== size && b256[it4] === 0) it4++;
		var vch = new Uint8Array(zeroes + (size - it4));
		var j = zeroes;
		while (it4 !== size) vch[j++] = b256[it4++];
		return vch;
	}
	function decode(string) {
		var buffer = decodeUnsafe(string);
		if (buffer) return buffer;
		throw new Error(`Non-${name} character`);
	}
	return {
		encode,
		decodeUnsafe,
		decode
	};
}
var _brrp__multiformats_scope_baseX;
var init_base_x = __esmMin((() => {
	_brrp__multiformats_scope_baseX = base;
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base.js
var Encoder, Decoder, ComposedDecoder, or, Codec, from$1, baseX, decode$1, encode$2, rfc4648;
var init_base = __esmMin((() => {
	init_base_x();
	init_bytes();
	Encoder = class {
		constructor(name, prefix, baseEncode) {
			this.name = name;
			this.prefix = prefix;
			this.baseEncode = baseEncode;
		}
		encode(bytes) {
			if (bytes instanceof Uint8Array) return `${this.prefix}${this.baseEncode(bytes)}`;
			else throw Error("Unknown type, must be binary type");
		}
	};
	Decoder = class {
		constructor(name, prefix, baseDecode) {
			this.name = name;
			this.prefix = prefix;
			if (prefix.codePointAt(0) === void 0) throw new Error("Invalid prefix character");
			this.prefixCodePoint = prefix.codePointAt(0);
			this.baseDecode = baseDecode;
		}
		decode(text) {
			if (typeof text === "string") {
				if (text.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
				return this.baseDecode(text.slice(this.prefix.length));
			} else throw Error("Can only multibase decode strings");
		}
		or(decoder) {
			return or(this, decoder);
		}
	};
	ComposedDecoder = class {
		constructor(decoders) {
			this.decoders = decoders;
		}
		or(decoder) {
			return or(this, decoder);
		}
		decode(input) {
			const prefix = input[0];
			const decoder = this.decoders[prefix];
			if (decoder) return decoder.decode(input);
			else throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
		}
	};
	or = (left, right) => new ComposedDecoder({
		...left.decoders || { [left.prefix]: left },
		...right.decoders || { [right.prefix]: right }
	});
	Codec = class {
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
	from$1 = ({ name, prefix, encode, decode }) => new Codec(name, prefix, encode, decode);
	baseX = ({ prefix, name, alphabet }) => {
		const { encode, decode } = _brrp__multiformats_scope_baseX(alphabet, name);
		return from$1({
			prefix,
			name,
			encode,
			decode: (text) => coerce(decode(text))
		});
	};
	decode$1 = (string, alphabet, bitsPerChar, name) => {
		const codes = {};
		for (let i = 0; i < alphabet.length; ++i) codes[alphabet[i]] = i;
		let end = string.length;
		while (string[end - 1] === "=") --end;
		const out = new Uint8Array(end * bitsPerChar / 8 | 0);
		let bits = 0;
		let buffer = 0;
		let written = 0;
		for (let i = 0; i < end; ++i) {
			const value = codes[string[i]];
			if (value === void 0) throw new SyntaxError(`Non-${name} character`);
			buffer = buffer << bitsPerChar | value;
			bits += bitsPerChar;
			if (bits >= 8) {
				bits -= 8;
				out[written++] = 255 & buffer >> bits;
			}
		}
		if (bits >= bitsPerChar || 255 & buffer << 8 - bits) throw new SyntaxError("Unexpected end of data");
		return out;
	};
	encode$2 = (data, alphabet, bitsPerChar) => {
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
		if (bits) out += alphabet[mask & buffer << bitsPerChar - bits];
		if (pad) while (out.length * bitsPerChar & 7) out += "=";
		return out;
	};
	rfc4648 = ({ name, prefix, bitsPerChar, alphabet }) => {
		return from$1({
			prefix,
			name,
			encode(input) {
				return encode$2(input, alphabet, bitsPerChar);
			},
			decode(input) {
				return decode$1(input, alphabet, bitsPerChar, name);
			}
		});
	};
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base58.js
var base58_exports = /* @__PURE__ */ __exportAll({
	base58btc: () => base58btc,
	base58flickr: () => base58flickr
});
var base58btc, base58flickr;
var init_base58 = __esmMin((() => {
	init_base();
	base58btc = baseX({
		name: "base58btc",
		prefix: "z",
		alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
	});
	base58flickr = baseX({
		name: "base58flickr",
		prefix: "Z",
		alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base32.js
var base32_exports = /* @__PURE__ */ __exportAll({
	base32: () => base32,
	base32hex: () => base32hex,
	base32hexpad: () => base32hexpad,
	base32hexpadupper: () => base32hexpadupper,
	base32hexupper: () => base32hexupper,
	base32pad: () => base32pad,
	base32padupper: () => base32padupper,
	base32upper: () => base32upper,
	base32z: () => base32z
});
var base32, base32upper, base32pad, base32padupper, base32hex, base32hexupper, base32hexpad, base32hexpadupper, base32z;
var init_base32 = __esmMin((() => {
	init_base();
	base32 = rfc4648({
		prefix: "b",
		name: "base32",
		alphabet: "abcdefghijklmnopqrstuvwxyz234567",
		bitsPerChar: 5
	});
	base32upper = rfc4648({
		prefix: "B",
		name: "base32upper",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
		bitsPerChar: 5
	});
	base32pad = rfc4648({
		prefix: "c",
		name: "base32pad",
		alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
		bitsPerChar: 5
	});
	base32padupper = rfc4648({
		prefix: "C",
		name: "base32padupper",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
		bitsPerChar: 5
	});
	base32hex = rfc4648({
		prefix: "v",
		name: "base32hex",
		alphabet: "0123456789abcdefghijklmnopqrstuv",
		bitsPerChar: 5
	});
	base32hexupper = rfc4648({
		prefix: "V",
		name: "base32hexupper",
		alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
		bitsPerChar: 5
	});
	base32hexpad = rfc4648({
		prefix: "t",
		name: "base32hexpad",
		alphabet: "0123456789abcdefghijklmnopqrstuv=",
		bitsPerChar: 5
	});
	base32hexpadupper = rfc4648({
		prefix: "T",
		name: "base32hexpadupper",
		alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
		bitsPerChar: 5
	});
	base32z = rfc4648({
		prefix: "h",
		name: "base32z",
		alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
		bitsPerChar: 5
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/cid.js
var cid_exports = /* @__PURE__ */ __exportAll({ CID: () => CID });
var CID, parseCIDtoBytes, toStringV0, toStringV1, DAG_PB_CODE, SHA_256_CODE, encodeCID, cidSymbol, readonly, hidden, version, deprecate, IS_CID_DEPRECATION;
var init_cid = __esmMin((() => {
	init_varint();
	init_digest();
	init_base58();
	init_base32();
	init_bytes();
	CID = class CID {
		constructor(version, code, multihash, bytes) {
			this.code = code;
			this.version = version;
			this.multihash = multihash;
			this.bytes = bytes;
			this.byteOffset = bytes.byteOffset;
			this.byteLength = bytes.byteLength;
			this.asCID = this;
			this._baseCache = /* @__PURE__ */ new Map();
			Object.defineProperties(this, {
				byteOffset: hidden,
				byteLength: hidden,
				code: readonly,
				version: readonly,
				multihash: readonly,
				bytes: readonly,
				_baseCache: hidden,
				asCID: hidden
			});
		}
		toV0() {
			switch (this.version) {
				case 0: return this;
				default: {
					const { code, multihash } = this;
					if (code !== DAG_PB_CODE) throw new Error("Cannot convert a non dag-pb CID to CIDv0");
					if (multihash.code !== SHA_256_CODE) throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
					return CID.createV0(multihash);
				}
			}
		}
		toV1() {
			switch (this.version) {
				case 0: {
					const { code, digest } = this.multihash;
					const multihash = create(code, digest);
					return CID.createV1(this.code, multihash);
				}
				case 1: return this;
				default: throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
			}
		}
		equals(other) {
			return other && this.code === other.code && this.version === other.version && equals(this.multihash, other.multihash);
		}
		toString(base) {
			const { bytes, version, _baseCache } = this;
			switch (version) {
				case 0: return toStringV0(bytes, _baseCache, base || base58btc.encoder);
				default: return toStringV1(bytes, _baseCache, base || base32.encoder);
			}
		}
		toJSON() {
			return {
				code: this.code,
				version: this.version,
				hash: this.multihash.bytes
			};
		}
		get [Symbol.toStringTag]() {
			return "CID";
		}
		[Symbol.for("nodejs.util.inspect.custom")]() {
			return "CID(" + this.toString() + ")";
		}
		static isCID(value) {
			deprecate(/^0\.0/, IS_CID_DEPRECATION);
			return !!(value && (value[cidSymbol] || value.asCID === value));
		}
		get toBaseEncodedString() {
			throw new Error("Deprecated, use .toString()");
		}
		get codec() {
			throw new Error("\"codec\" property is deprecated, use integer \"code\" property instead");
		}
		get buffer() {
			throw new Error("Deprecated .buffer property, use .bytes to get Uint8Array instead");
		}
		get multibaseName() {
			throw new Error("\"multibaseName\" property is deprecated");
		}
		get prefix() {
			throw new Error("\"prefix\" property is deprecated");
		}
		static asCID(value) {
			if (value instanceof CID) return value;
			else if (value != null && value.asCID === value) {
				const { version, code, multihash, bytes } = value;
				return new CID(version, code, multihash, bytes || encodeCID(version, code, multihash.bytes));
			} else if (value != null && value[cidSymbol] === true) {
				const { version, multihash, code } = value;
				const digest = decode$2(multihash);
				return CID.create(version, code, digest);
			} else return null;
		}
		static create(version, code, digest) {
			if (typeof code !== "number") throw new Error("String codecs are no longer supported");
			switch (version) {
				case 0: if (code !== DAG_PB_CODE) throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
				else return new CID(version, code, digest, digest.bytes);
				case 1: {
					const bytes = encodeCID(version, code, digest.bytes);
					return new CID(version, code, digest, bytes);
				}
				default: throw new Error("Invalid version");
			}
		}
		static createV0(digest) {
			return CID.create(0, DAG_PB_CODE, digest);
		}
		static createV1(code, digest) {
			return CID.create(1, code, digest);
		}
		static decode(bytes) {
			const [cid, remainder] = CID.decodeFirst(bytes);
			if (remainder.length) throw new Error("Incorrect length");
			return cid;
		}
		static decodeFirst(bytes) {
			const specs = CID.inspectBytes(bytes);
			const prefixSize = specs.size - specs.multihashSize;
			const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
			if (multihashBytes.byteLength !== specs.multihashSize) throw new Error("Incorrect length");
			const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
			const digest = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
			return [specs.version === 0 ? CID.createV0(digest) : CID.createV1(specs.codec, digest), bytes.subarray(specs.size)];
		}
		static inspectBytes(initialBytes) {
			let offset = 0;
			const next = () => {
				const [i, length] = decode$3(initialBytes.subarray(offset));
				offset += length;
				return i;
			};
			let version = next();
			let codec = DAG_PB_CODE;
			if (version === 18) {
				version = 0;
				offset = 0;
			} else if (version === 1) codec = next();
			if (version !== 0 && version !== 1) throw new RangeError(`Invalid CID version ${version}`);
			const prefixSize = offset;
			const multihashCode = next();
			const digestSize = next();
			const size = offset + digestSize;
			const multihashSize = size - prefixSize;
			return {
				version,
				codec,
				multihashCode,
				digestSize,
				multihashSize,
				size
			};
		}
		static parse(source, base) {
			const [prefix, bytes] = parseCIDtoBytes(source, base);
			const cid = CID.decode(bytes);
			cid._baseCache.set(prefix, source);
			return cid;
		}
	};
	parseCIDtoBytes = (source, base) => {
		switch (source[0]) {
			case "Q": {
				const decoder = base || base58btc;
				return [base58btc.prefix, decoder.decode(`${base58btc.prefix}${source}`)];
			}
			case base58btc.prefix: {
				const decoder = base || base58btc;
				return [base58btc.prefix, decoder.decode(source)];
			}
			case base32.prefix: {
				const decoder = base || base32;
				return [base32.prefix, decoder.decode(source)];
			}
			default:
				if (base == null) throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
				return [source[0], base.decode(source)];
		}
	};
	toStringV0 = (bytes, cache, base) => {
		const { prefix } = base;
		if (prefix !== base58btc.prefix) throw Error(`Cannot string encode V0 in ${base.name} encoding`);
		const cid = cache.get(prefix);
		if (cid == null) {
			const cid = base.encode(bytes).slice(1);
			cache.set(prefix, cid);
			return cid;
		} else return cid;
	};
	toStringV1 = (bytes, cache, base) => {
		const { prefix } = base;
		const cid = cache.get(prefix);
		if (cid == null) {
			const cid = base.encode(bytes);
			cache.set(prefix, cid);
			return cid;
		} else return cid;
	};
	DAG_PB_CODE = 112;
	SHA_256_CODE = 18;
	encodeCID = (version, code, multihash) => {
		const codeOffset = encodingLength(version);
		const hashOffset = codeOffset + encodingLength(code);
		const bytes = new Uint8Array(hashOffset + multihash.byteLength);
		encodeTo(version, bytes, 0);
		encodeTo(code, bytes, codeOffset);
		bytes.set(multihash, hashOffset);
		return bytes;
	};
	cidSymbol = Symbol.for("@ipld/js-cid/CID");
	readonly = {
		writable: false,
		configurable: false,
		enumerable: true
	};
	hidden = {
		writable: false,
		enumerable: false,
		configurable: false
	};
	version = "0.0.0-dev";
	deprecate = (range, message) => {
		if (range.test(version)) console.warn(message);
		else throw new Error(message);
	};
	IS_CID_DEPRECATION = `CID.isCID(v) is deprecated and will be removed in the next major release.
Following code pattern:

if (CID.isCID(value)) {
  doSomethingWithCID(value)
}

Is replaced with:

const cid = CID.asCID(value)
if (cid) {
  // Make sure to use cid instead of value
  doSomethingWithCID(cid)
}
`;
}));
//#endregion
//#region node_modules/multiformats/esm/src/hashes/hasher.js
var from, Hasher;
var init_hasher = __esmMin((() => {
	init_digest();
	from = ({ name, code, encode }) => new Hasher(name, code, encode);
	Hasher = class {
		constructor(name, code, encode) {
			this.name = name;
			this.code = code;
			this.encode = encode;
		}
		digest(input) {
			if (input instanceof Uint8Array) {
				const result = this.encode(input);
				return result instanceof Uint8Array ? create(this.code, result) : result.then((digest) => create(this.code, digest));
			} else throw Error("Unknown type, must be binary type");
		}
	};
}));
//#endregion
//#region node_modules/multiformats/esm/src/hashes/sha2-browser.js
var sha2_browser_exports = /* @__PURE__ */ __exportAll({
	sha256: () => sha256,
	sha512: () => sha512
});
var sha, sha256, sha512;
var init_sha2_browser = __esmMin((() => {
	init_hasher();
	sha = (name) => async (data) => new Uint8Array(await crypto.subtle.digest(name, data));
	sha256 = from({
		name: "sha2-256",
		code: 18,
		encode: sha("SHA-256")
	});
	sha512 = from({
		name: "sha2-512",
		code: 19,
		encode: sha("SHA-512")
	});
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/lib/util.js
var require_util$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toHexString = toHexString;
	exports.isUint8 = isUint8;
	function toHexString(number) {
		return `0x${number.toString(16).padStart(2, "0")}`;
	}
	function isUint8(val) {
		return Number.isInteger(val) && val >= 0 && val < 256;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/object.js
var require_object$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isObject = isObject;
	exports.isPlainObject = isPlainObject;
	exports.isPlainProto = isPlainProto;
	/**
	* Checks whether the input is an object (not null).
	*
	* Returns true for any non-null value with typeof 'object', including
	* arrays, plain objects, class instances, etc.
	*
	* @param input - The value to check
	* @returns `true` if the input is an object (not null)
	*
	* @example
	* ```typescript
	* import { isObject } from '@atproto/lex-data'
	*
	* isObject({})           // true
	* isObject([1, 2, 3])    // true
	* isObject(new Date())   // true
	* isObject(null)         // false
	* isObject('string')     // false
	* ```
	*/
	function isObject(input) {
		return input != null && typeof input === "object";
	}
	var ObjectProto = Object.prototype;
	var ObjectToString = Object.prototype.toString;
	/**
	* Checks whether the input is a plain object.
	*
	* A plain object is an object (not null) whose prototype is either null
	* or `Object.prototype`. This excludes arrays, class instances, and other
	* special objects.
	*
	* @param input - The value to check
	* @returns `true` if the input is a plain object
	*
	* @example
	* ```typescript
	* import { isPlainObject } from '@atproto/lex-data'
	*
	* isPlainObject({})                    // true
	* isPlainObject({ a: 1 })              // true
	* isPlainObject(Object.create(null))   // true
	* isPlainObject([1, 2, 3])             // false
	* isPlainObject(new Date())            // false
	* isPlainObject(null)                  // false
	* ```
	*/
	function isPlainObject(input) {
		return isObject(input) && isPlainProto(input);
	}
	/**
	* Checks whether the prototype of an object is plain (null or Object.prototype).
	*
	* This is useful for checking if an object is a plain object without
	* checking that it's non-null first (the null check is already done).
	*
	* @param input - The object to check (must be non-null)
	* @returns `true` if the object's prototype is plain
	*
	* @example
	* ```typescript
	* import { isPlainProto } from '@atproto/lex-data'
	*
	* isPlainProto({})                    // true
	* isPlainProto(Object.create(null))   // true
	* isPlainProto([1, 2, 3])             // false (Array.prototype)
	* isPlainProto(new Date())            // false (Date.prototype)
	* ```
	*/
	function isPlainProto(input) {
		const proto = Object.getPrototypeOf(input);
		if (proto === null) return true;
		return (proto === ObjectProto || Object.getPrototypeOf(proto) === null) && ObjectToString.call(input) === "[object Object]";
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/lib/nodejs-buffer.js
var require_nodejs_buffer$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NodeJSBuffer = void 0;
	var BUFFER = /*#__PURE__*/ (() => "Bu" + "f".repeat(2) + "er")();
	exports.NodeJSBuffer = globalThis?.[BUFFER]?.prototype instanceof Uint8Array && "byteLength" in globalThis[BUFFER] ? globalThis[BUFFER] : /* v8 ignore next -- @preserve */ null;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/uint8array-concat.js
var require_uint8array_concat$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8ConcatNode = void 0;
	exports.ui8ConcatPonyfill = ui8ConcatPonyfill;
	var Buffer = require_nodejs_buffer$3().NodeJSBuffer;
	exports.ui8ConcatNode = Buffer ? function ui8ConcatNode(array) {
		return Buffer.concat(array);
	} : /* v8 ignore next -- @preserve */ null;
	function ui8ConcatPonyfill(array) {
		let totalLength = 0;
		for (const arr of array) totalLength += arr.length;
		const result = new Uint8Array(totalLength);
		let offset = 0;
		for (const arr of array) {
			result.set(arr, offset);
			offset += arr.length;
		}
		return result;
	}
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/identity.js
var identity_exports$1 = /* @__PURE__ */ __exportAll({ identity: () => identity$1 });
var identity$1;
var init_identity$1 = __esmMin((() => {
	init_base();
	init_bytes();
	identity$1 = from$1({
		prefix: "\0",
		name: "identity",
		encode: (buf) => toString$1(buf),
		decode: (str) => fromString$1(str)
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base2.js
var base2_exports = /* @__PURE__ */ __exportAll({ base2: () => base2 });
var base2;
var init_base2 = __esmMin((() => {
	init_base();
	base2 = rfc4648({
		prefix: "0",
		name: "base2",
		alphabet: "01",
		bitsPerChar: 1
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base8.js
var base8_exports = /* @__PURE__ */ __exportAll({ base8: () => base8 });
var base8;
var init_base8 = __esmMin((() => {
	init_base();
	base8 = rfc4648({
		prefix: "7",
		name: "base8",
		alphabet: "01234567",
		bitsPerChar: 3
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base10.js
var base10_exports = /* @__PURE__ */ __exportAll({ base10: () => base10 });
var base10;
var init_base10 = __esmMin((() => {
	init_base();
	base10 = baseX({
		prefix: "9",
		name: "base10",
		alphabet: "0123456789"
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base16.js
var base16_exports = /* @__PURE__ */ __exportAll({
	base16: () => base16,
	base16upper: () => base16upper
});
var base16, base16upper;
var init_base16 = __esmMin((() => {
	init_base();
	base16 = rfc4648({
		prefix: "f",
		name: "base16",
		alphabet: "0123456789abcdef",
		bitsPerChar: 4
	});
	base16upper = rfc4648({
		prefix: "F",
		name: "base16upper",
		alphabet: "0123456789ABCDEF",
		bitsPerChar: 4
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base36.js
var base36_exports = /* @__PURE__ */ __exportAll({
	base36: () => base36,
	base36upper: () => base36upper
});
var base36, base36upper;
var init_base36 = __esmMin((() => {
	init_base();
	base36 = baseX({
		prefix: "k",
		name: "base36",
		alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
	});
	base36upper = baseX({
		prefix: "K",
		name: "base36upper",
		alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base64.js
var base64_exports = /* @__PURE__ */ __exportAll({
	base64: () => base64,
	base64pad: () => base64pad,
	base64url: () => base64url,
	base64urlpad: () => base64urlpad
});
var base64, base64pad, base64url, base64urlpad;
var init_base64 = __esmMin((() => {
	init_base();
	base64 = rfc4648({
		prefix: "m",
		name: "base64",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
		bitsPerChar: 6
	});
	base64pad = rfc4648({
		prefix: "M",
		name: "base64pad",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		bitsPerChar: 6
	});
	base64url = rfc4648({
		prefix: "u",
		name: "base64url",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
		bitsPerChar: 6
	});
	base64urlpad = rfc4648({
		prefix: "U",
		name: "base64urlpad",
		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
		bitsPerChar: 6
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/bases/base256emoji.js
var base256emoji_exports = /* @__PURE__ */ __exportAll({ base256emoji: () => base256emoji });
function encode$1(data) {
	return data.reduce((p, c) => {
		p += alphabetBytesToChars[c];
		return p;
	}, "");
}
function decode(str) {
	const byts = [];
	for (const char of str) {
		const byt = alphabetCharsToBytes[char.codePointAt(0)];
		if (byt === void 0) throw new Error(`Non-base256emoji character: ${char}`);
		byts.push(byt);
	}
	return new Uint8Array(byts);
}
var alphabet, alphabetBytesToChars, alphabetCharsToBytes, base256emoji;
var init_base256emoji = __esmMin((() => {
	init_base();
	alphabet = Array.from("🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂");
	alphabetBytesToChars = alphabet.reduce((p, c, i) => {
		p[i] = c;
		return p;
	}, []);
	alphabetCharsToBytes = alphabet.reduce((p, c, i) => {
		p[c.codePointAt(0)] = i;
		return p;
	}, []);
	base256emoji = from$1({
		prefix: "🚀",
		name: "base256emoji",
		encode: encode$1,
		decode
	});
}));
//#endregion
//#region node_modules/multiformats/esm/src/hashes/identity.js
var identity_exports = /* @__PURE__ */ __exportAll({ identity: () => identity });
var code, name, encode, digest, identity;
var init_identity = __esmMin((() => {
	init_bytes();
	init_digest();
	code = 0;
	name = "identity";
	encode = coerce;
	digest = (input) => create(code, encode(input));
	identity = {
		code,
		name,
		encode,
		digest
	};
}));
var init_json = __esmMin((() => {
	new TextEncoder();
	new TextDecoder();
}));
//#endregion
//#region node_modules/multiformats/esm/src/index.js
var init_src = __esmMin((() => {
	init_cid();
})), bases;
var init_basics = __esmMin((() => {
	init_identity$1();
	init_base2();
	init_base8();
	init_base10();
	init_base16();
	init_base32();
	init_base36();
	init_base58();
	init_base64();
	init_base256emoji();
	init_sha2_browser();
	init_identity();
	init_json();
	init_src();
	bases = {
		...identity_exports$1,
		...base2_exports,
		...base8_exports,
		...base10_exports,
		...base16_exports,
		...base32_exports,
		...base36_exports,
		...base58_exports,
		...base64_exports,
		...base256emoji_exports
	};
	({
		...sha2_browser_exports,
		...identity_exports
	});
}));
//#endregion
//#region node_modules/uint8arrays/esm/src/util/bases.js
function createCodec(name, prefix, encode, decode) {
	return {
		name,
		prefix,
		encoder: {
			name,
			prefix,
			encode
		},
		decoder: { decode }
	};
}
var string, ascii, BASES;
var init_bases = __esmMin((() => {
	init_basics();
	string = createCodec("utf8", "u", (buf) => {
		return "u" + new TextDecoder("utf8").decode(buf);
	}, (str) => {
		return new TextEncoder().encode(str.substring(1));
	});
	ascii = createCodec("ascii", "a", (buf) => {
		let string = "a";
		for (let i = 0; i < buf.length; i++) string += String.fromCharCode(buf[i]);
		return string;
	}, (str) => {
		str = str.substring(1);
		const buf = new Uint8Array(str.length);
		for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
		return buf;
	});
	BASES = {
		utf8: string,
		"utf-8": string,
		hex: bases.base16,
		latin1: ascii,
		ascii,
		binary: ascii,
		...bases
	};
}));
//#endregion
//#region node_modules/uint8arrays/esm/src/from-string.js
var from_string_exports = /* @__PURE__ */ __exportAll({ fromString: () => fromString });
function fromString(string, encoding = "utf8") {
	const base = BASES[encoding];
	if (!base) throw new Error(`Unsupported encoding "${encoding}"`);
	return base.decoder.decode(`${base.prefix}${string}`);
}
var init_from_string = __esmMin((() => {
	init_bases();
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/uint8array-from-base64.js
var require_uint8array_from_base64$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromBase64Node = exports.fromBase64Native = void 0;
	exports.fromBase64Ponyfill = fromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer$3().NodeJSBuffer;
	exports.fromBase64Native = typeof Uint8Array.fromBase64 === "function" ? function fromBase64Native(b64, alphabet = "base64") {
		return Uint8Array.fromBase64(b64, {
			alphabet,
			lastChunkHandling: "loose"
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.fromBase64Node = Buffer ? function fromBase64Node(b64, alphabet = "base64") {
		const bytes = Buffer.from(b64, alphabet);
		verifyBase64ForBytes(b64, bytes);
		return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	} : /* v8 ignore next -- @preserve */ null;
	function fromBase64Ponyfill(b64, alphabet = "base64") {
		const bytes = (0, from_string_1.fromString)(b64, b64.endsWith("=") ? `${alphabet}pad` : alphabet);
		verifyBase64ForBytes(b64, bytes);
		return bytes;
	}
	function verifyBase64ForBytes(b64, bytes) {
		const paddingCount = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
		const trimmedLength = b64.length - paddingCount;
		const expectedByteLength = Math.floor(trimmedLength * 3 / 4);
		if (bytes.length !== expectedByteLength) throw new Error("Invalid base64 string");
		const expectedB64Length = bytes.length / 3 * 4;
		const expectedFullB64Length = expectedB64Length + (expectedB64Length % 4 === 0 ? 0 : 4 - expectedB64Length % 4);
		if (b64.length > expectedFullB64Length) throw new Error("Invalid base64 string");
		for (let i = Math.ceil(expectedB64Length); i < b64.length - paddingCount; i++) {
			const code = b64.charCodeAt(i);
			if (!(code >= 65 && code <= 90) && !(code >= 97 && code <= 122) && !(code >= 48 && code <= 57) && code !== 43 && code !== 47) throw new Error("Invalid base64 string");
		}
	}
}));
//#endregion
//#region node_modules/uint8arrays/esm/src/to-string.js
var to_string_exports = /* @__PURE__ */ __exportAll({ toString: () => toString });
function toString(array, encoding = "utf8") {
	const base = BASES[encoding];
	if (!base) throw new Error(`Unsupported encoding "${encoding}"`);
	return base.encoder.encode(array).substring(1);
}
var init_to_string = __esmMin((() => {
	init_bases();
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/uint8array-to-base64.js
var require_uint8array_to_base64$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBase64Node = exports.toBase64Native = void 0;
	exports.toBase64Ponyfill = toBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var Buffer = require_nodejs_buffer$3().NodeJSBuffer;
	exports.toBase64Native = typeof Uint8Array.prototype.toBase64 === "function" ? function toBase64Native(bytes, alphabet = "base64") {
		return bytes.toBase64({
			alphabet,
			omitPadding: true
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.toBase64Node = Buffer ? function toBase64Node(bytes, alphabet = "base64") {
		const b64 = (bytes instanceof Buffer ? bytes : Buffer.from(bytes)).toString(alphabet);
		return b64.charCodeAt(b64.length - 1) === 61 ? b64.charCodeAt(b64.length - 2) === 61 ? b64.slice(0, -2) : b64.slice(0, -1) : b64;
	} : /* v8 ignore next -- @preserve */ null;
	function toBase64Ponyfill(bytes, alphabet = "base64") {
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/uint8array.js
var require_uint8array$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8Concat = exports.fromBase64 = exports.toBase64 = void 0;
	exports.ifUint8Array = ifUint8Array;
	exports.asUint8Array = asUint8Array;
	exports.ui8Equals = ui8Equals;
	var uint8array_concat_js_1 = require_uint8array_concat$3();
	var uint8array_from_base64_js_1 = require_uint8array_from_base64$3();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64$3();
	/**
	* Encodes a Uint8Array into a base64 string.
	*
	* Uses native Uint8Array.prototype.toBase64 when available (Node.js 24+, modern browsers),
	* falling back to Node.js Buffer or a ponyfill implementation.
	*
	* @param bytes - The binary data to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The base64 encoded string
	*
	* @example
	* ```typescript
	* import { toBase64 } from '@atproto/lex-data'
	*
	* const bytes = new Uint8Array([72, 101, 108, 108, 111])
	* toBase64(bytes)           // 'SGVsbG8='
	* toBase64(bytes, 'base64url')  // 'SGVsbG8' (URL-safe, no padding)
	* ```
	*/
	exports.toBase64 = uint8array_to_base64_js_1.toBase64Native ?? uint8array_to_base64_js_1.toBase64Node ?? uint8array_to_base64_js_1.toBase64Ponyfill;
	/**
	* Decodes a base64 string into a Uint8Array.
	*
	* Supports both padded and unpadded base64 strings. Uses native
	* Uint8Array.fromBase64 when available, falling back to Node.js Buffer
	* or a ponyfill implementation.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The decoded binary data
	* @throws If the input is not a valid base64 string
	*
	* @example
	* ```typescript
	* import { fromBase64 } from '@atproto/lex-data'
	*
	* fromBase64('SGVsbG8=')       // Uint8Array([72, 101, 108, 108, 111])
	* fromBase64('SGVsbG8', 'base64url')  // Same, URL-safe alphabet
	* ```
	*/
	exports.fromBase64 = uint8array_from_base64_js_1.fromBase64Native ?? uint8array_from_base64_js_1.fromBase64Node ?? uint8array_from_base64_js_1.fromBase64Ponyfill;
	/* v8 ignore next -- @preserve */
	if (exports.toBase64 === uint8array_to_base64_js_1.toBase64Ponyfill || exports.fromBase64 === uint8array_from_base64_js_1.fromBase64Ponyfill) {}
	/**
	* Returns the input if it is a Uint8Array, otherwise returns undefined.
	*
	* @param input - The value to check
	* @returns The input if it's a Uint8Array, otherwise undefined
	*
	* @example
	* ```typescript
	* import { ifUint8Array } from '@atproto/lex-data'
	*
	* ifUint8Array(new Uint8Array([1, 2]))  // Uint8Array([1, 2])
	* ifUint8Array('not binary')            // undefined
	* ifUint8Array(new ArrayBuffer(4))      // undefined
	* ```
	*/
	function ifUint8Array(input) {
		if (input instanceof Uint8Array) return input;
	}
	/**
	* Coerces various binary data representations into a Uint8Array.
	*
	* Handles the following input types:
	* - `Uint8Array` - Returned as-is
	* - `ArrayBufferView` (e.g., DataView, other TypedArrays) - Converted to Uint8Array
	* - `ArrayBuffer` - Wrapped in a Uint8Array
	*
	* @param input - The value to convert
	* @returns A Uint8Array, or `undefined` if the input could not be converted
	*
	* @example
	* ```typescript
	* import { asUint8Array } from '@atproto/lex-data'
	*
	* asUint8Array(new Uint8Array([1, 2]))     // Uint8Array([1, 2])
	* asUint8Array(new ArrayBuffer(4))         // Uint8Array of length 4
	* asUint8Array(new Int16Array([1, 2]))     // Uint8Array view of the buffer
	* asUint8Array('string')                   // undefined
	* ```
	*/
	function asUint8Array(input) {
		if (input instanceof Uint8Array) return input;
		if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength / Uint8Array.BYTES_PER_ELEMENT);
		if (input instanceof ArrayBuffer) return new Uint8Array(input);
	}
	/**
	* Compares two Uint8Arrays for byte-by-byte equality.
	*
	* @param a - First Uint8Array to compare
	* @param b - Second Uint8Array to compare
	* @returns `true` if both arrays have the same length and identical bytes
	*
	* @example
	* ```typescript
	* import { ui8Equals } from '@atproto/lex-data'
	*
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 3]))  // false
	* ui8Equals(new Uint8Array([1]), new Uint8Array([1, 2]))     // false
	* ```
	*/
	function ui8Equals(a, b) {
		if (a.byteLength !== b.byteLength) return false;
		for (let i = 0; i < a.byteLength; i++) if (a[i] !== b[i]) return false;
		return true;
	}
	/**
	* Concatenates multiple Uint8Arrays into a single Uint8Array.
	*
	* Uses Node.js Buffer.concat when available for performance,
	* falling back to a ponyfill implementation.
	*
	* @param arrays - The Uint8Arrays to concatenate
	* @returns A new Uint8Array containing all input bytes in order
	*
	* @example
	* ```typescript
	* import { ui8Concat } from '@atproto/lex-data'
	*
	* const a = new Uint8Array([1, 2])
	* const b = new Uint8Array([3, 4])
	* ui8Concat([a, b])  // Uint8Array([1, 2, 3, 4])
	* ```
	*/
	exports.ui8Concat = uint8array_concat_js_1.ui8ConcatNode ?? uint8array_concat_js_1.ui8ConcatPonyfill;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/cid.js
var require_cid$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CID = exports.SHA512_HASH_CODE = exports.SHA256_HASH_CODE = exports.RAW_DATA_CODEC = exports.CBOR_DATA_CODEC = void 0;
	exports.multihashEquals = multihashEquals;
	exports.asMultiformatsCID = asMultiformatsCID;
	exports.isRawCid = isRawCid;
	exports.isDaslCid = isDaslCid;
	exports.isCborCid = isCborCid;
	exports.checkCid = checkCid;
	exports.isCid = isCid;
	exports.ifCid = ifCid;
	exports.asCid = asCid;
	exports.decodeCid = decodeCid;
	exports.parseCid = parseCid;
	exports.validateCidString = validateCidString;
	exports.parseCidSafe = parseCidSafe;
	exports.ensureValidCidString = ensureValidCidString;
	exports.isCidForBytes = isCidForBytes;
	exports.createCid = createCid;
	exports.cidForCbor = cidForCbor;
	exports.cidForRawBytes = cidForRawBytes;
	exports.cidForRawHash = cidForRawHash;
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	Object.defineProperty(exports, "CID", {
		enumerable: true,
		get: function() {
			return cid_1.CID;
		}
	});
	var digest_1 = (init_digest(), __toCommonJS(digest_exports));
	var sha2_1 = (init_sha2_browser(), __toCommonJS(sha2_browser_exports));
	var util_js_1 = require_util$2();
	var object_js_1 = require_object$4();
	var uint8array_js_1 = require_uint8array$3();
	/**
	* Codec code that indicates the CID references a CBOR-encoded data structure.
	*
	* Used when encoding structured data in AT Protocol repositories.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.CBOR_DATA_CODEC = 113;
	/**
	* Codec code that indicates the CID references raw binary data (like media blobs).
	*
	* Used in DASL CIDs for binary blobs like images and media.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.RAW_DATA_CODEC = 85;
	/**
	* Hash code that indicates that a CID uses SHA-256.
	*/
	exports.SHA256_HASH_CODE = sha2_1.sha256.code;
	/**
	* Hash code that indicates that a CID uses SHA-512.
	*/
	exports.SHA512_HASH_CODE = sha2_1.sha512.code;
	/**
	* Compares two {@link Multihash} for equality.
	*
	* @param a - First {@link Multihash}
	* @param b - Second {@link Multihash}
	* @returns `true` if both multihashes have the same code and digest
	*/
	function multihashEquals(a, b) {
		if (a === b) return true;
		return a.code === b.code && (0, uint8array_js_1.ui8Equals)(a.digest, b.digest);
	}
	/**
	* Converts a {@link Cid} to a multiformats {@link CID} instance.
	*
	* @deprecated Packages depending on `@atproto/lex-data` should use the
	* {@link Cid} interface instead of relying on `multiformats`'s {@link CID}
	* implementation directly. This is to avoid compatibility issues, and in order
	* to allow better portability, compatibility and future updates.
	*/
	function asMultiformatsCID(input) {
		return cid_1.CID.asCID(input) ?? cid_1.CID.create(input.version, input.code, (0, digest_1.create)(input.multihash.code, input.multihash.digest));
	}
	/**
	* Type guard to check if a CID is a raw binary CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a version 1 CID with raw multicodec
	*/
	function isRawCid(cid) {
		return cid.version === 1 && cid.code === exports.RAW_DATA_CODEC;
	}
	/**
	* Type guard to check if a CID is DASL compliant.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is DASL compliant (v1, raw/dag-cbor, sha256)
	*/
	function isDaslCid(cid) {
		return cid.version === 1 && (cid.code === exports.RAW_DATA_CODEC || cid.code === exports.CBOR_DATA_CODEC) && cid.multihash.code === exports.SHA256_HASH_CODE && cid.multihash.digest.byteLength === 32;
	}
	/**
	* Type guard to check if a CID is a DAG-CBOR CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a DAG-CBOR CID (v1, dag-cbor, sha256)
	*/
	function isCborCid(cid) {
		return cid.code === exports.CBOR_DATA_CODEC && isDaslCid(cid);
	}
	function checkCid(cid, options) {
		switch (options?.flavor) {
			case void 0: return true;
			case "cbor": return isCborCid(cid);
			case "dasl": return isDaslCid(cid);
			case "raw": return isRawCid(cid);
			default: throw new TypeError(`Unknown CID flavor: ${options?.flavor}`);
		}
	}
	function isCid(value, options) {
		return isCidImplementation(value) && checkCid(value, options);
	}
	function ifCid(value, options) {
		if (isCid(value, options)) return value;
		return null;
	}
	function asCid(value, options) {
		if (isCid(value, options)) return value;
		throw new Error(`Invalid ${options?.flavor ? `${options.flavor} CID` : "CID"} "${value}"`);
	}
	function decodeCid(cidBytes, options) {
		return asCid(cid_1.CID.decode(cidBytes), options);
	}
	function parseCid(input, options) {
		return asCid(cid_1.CID.parse(input), options);
	}
	/**
	* Validates that a string is a valid CID representation.
	*
	* Unlike {@link parseCid}, this function returns a boolean instead of throwing.
	* It also verifies that the string is the canonical representation of the CID.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @returns `true` if the string is a valid CID
	*/
	function validateCidString(input, options) {
		return parseCidSafe(input, options)?.toString() === input;
	}
	function parseCidSafe(input, options) {
		try {
			return parseCid(input, options);
		} catch {
			return null;
		}
	}
	/**
	* Ensures that a string is a valid CID representation.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @throws If the string is not a valid CID
	*/
	function ensureValidCidString(input, options) {
		if (!validateCidString(input, options)) throw new Error(`Invalid CID string "${input}"`);
	}
	/**
	* Verifies whether the multihash of a given {@link cid} matches the hash of the provided {@link bytes}.
	* @params cid The CID to match against the bytes.
	* @params bytes The bytes to verify.
	* @returns true if the CID matches the bytes, false otherwise.
	*/
	async function isCidForBytes(cid, bytes) {
		if (cid.multihash.code === sha2_1.sha256.code) return multihashEquals(await sha2_1.sha256.digest(bytes), cid.multihash);
		if (cid.multihash.code === sha2_1.sha512.code) return multihashEquals(await sha2_1.sha512.digest(bytes), cid.multihash);
		throw new Error(`Unsupported CID multihash code: ${(0, util_js_1.toHexString)(cid.multihash.code)}`);
	}
	/**
	* Creates a CID from a multicodec, multihash code, and digest.
	*
	* @param code - The multicodec content type code
	* @param multihashCode - The multihash algorithm code
	* @param digest - The raw hash digest bytes
	* @returns A new CIDv1 instance
	*
	* @example
	* ```typescript
	* import { createCid, RAW_DATA_CODEC, SHA256_HASH_CODE } from '@atproto/lex-data'
	*
	* const cid = createCid(RAW_DATA_CODEC, SHA256_HASH_CODE, hashDigest)
	* ```
	*/
	function createCid(code, multihashCode, digest) {
		return cid_1.CID.createV1(code, (0, digest_1.create)(multihashCode, digest));
	}
	/**
	* Creates a DAG-CBOR CID for the given CBOR bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with DAG-CBOR multicodec.
	*
	* @param bytes - The CBOR-encoded bytes to hash
	* @returns A promise that resolves to the CborCid
	*/
	async function cidForCbor(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.CBOR_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID for the given binary bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with raw multicodec.
	*
	* @param bytes - The raw binary bytes to hash
	* @returns A promise that resolves to the RawCid
	*/
	async function cidForRawBytes(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.RAW_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID from an existing SHA-256 hash digest.
	*
	* @param digest - The SHA-256 hash digest (must be 32 bytes)
	* @returns A RawCid with the given digest
	* @throws If the digest is not a valid SHA-256 hash (not 32 bytes)
	*/
	function cidForRawHash(digest) {
		if (digest.length !== 32) throw new Error(`Invalid SHA-256 hash length: ${(0, util_js_1.toHexString)(digest.length)}`);
		return createCid(exports.RAW_DATA_CODEC, sha2_1.sha256.code, digest);
	}
	function isCidImplementation(value) {
		if (cid_1.CID.asCID(value)) return value.bytes != null;
		else try {
			if (!(0, object_js_1.isObject)(value)) return false;
			const val = value;
			if (val.version !== 0 && val.version !== 1) return false;
			if (!(0, util_js_1.isUint8)(val.code)) return false;
			if (!(0, object_js_1.isObject)(val.multihash)) return false;
			const mh = val.multihash;
			if (!(0, util_js_1.isUint8)(mh.code)) return false;
			if (!(mh.digest instanceof Uint8Array)) return false;
			if (!(val.bytes instanceof Uint8Array)) return false;
			if (val.bytes[0] !== val.version) return false;
			if (val.bytes[1] !== val.code) return false;
			if (val.bytes[2] !== mh.code) return false;
			if (val.bytes[3] !== mh.digest.length) return false;
			if (val.bytes.length !== 4 + mh.digest.length) return false;
			if (!(0, uint8array_js_1.ui8Equals)(val.bytes.subarray(4), mh.digest)) return false;
			if (typeof val.equals !== "function") return false;
			if (val.equals(val) !== true) return false;
			return true;
		} catch {
			return false;
		}
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/blob.js
var require_blob$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isBlobRef = isBlobRef;
	exports.getBlobMime = getBlobMime;
	exports.getBlobSize = getBlobSize;
	exports.getBlobCid = getBlobCid;
	exports.getBlobCidString = getBlobCidString;
	exports.isTypedBlobRef = isTypedBlobRef;
	exports.isLegacyBlobRef = isLegacyBlobRef;
	exports.enumBlobRefs = enumBlobRefs;
	var cid_js_1 = require_cid$4();
	var object_js_1 = require_object$4();
	/**
	* Options to use with {@link ifCid}, {@link validateCidString}, and related CID
	* validation functions when validating CIDs in BlobRefs, in strict mode. This
	* ensures that the CID is a {@link RawCid} (CID v1, raw multicodec, sha256
	* multihash), which is the expected format for blob references in the AT
	* Protocol data model.
	*/
	var STRICT_CID_CHECK_OPTIONS = { flavor: "raw" };
	var isSafeInteger = Number.isSafeInteger;
	function isBlobRef(input, options) {
		return input?.$type === "blob" ? isTypedBlobRef(input, options) : isLegacyBlobRef(input, options);
	}
	function getBlobMime(blob) {
		return blob?.mimeType;
	}
	/**
	* Extracts the size (in bytes) from a {@link TypedBlobRef}. For
	* {@link LegacyBlobRef}, size information is not available, so this function
	* returns `undefined` for legacy refs.
	*
	* @note The size property, in blob refs, cannot be 100% trusted since the PDS
	* might not have a local copy of the blob (to check the size against) and might
	* just be passing through the blob ref from the client without validating it.
	* So, while this function can be useful for getting size information when
	* available, it should not be solely relied upon for critical functionality
	* without additional validation.
	*
	* @example
	* ```ts
	* const size = getBlobSize(blobRef)
	* if (size !== undefined) {
	*   console.log(`Blob size: ${size} bytes`)
	* } else {
	*   console.log('Size information not available for legacy blob ref')
	* }
	* ```
	*/
	function getBlobSize(blob) {
		if ("$type" in blob && blob.size >= 0) return blob.size;
	}
	function getBlobCid(blob) {
		if (!blob) return void 0;
		return "$type" in blob ? blob.ref : (0, cid_js_1.parseCid)(blob.cid);
	}
	function getBlobCidString(blob) {
		if (!blob) return void 0;
		return "$type" in blob ? blob.ref.toString() : blob.cid;
	}
	function isTypedBlobRef(input, options) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		if (input?.$type !== "blob") return false;
		const { mimeType, size, ref } = input;
		if (typeof mimeType !== "string" || !mimeType.includes("/")) return false;
		if (size === -1 && options?.strict === false) {} else if (!isSafeInteger(size) || size < 0) return false;
		if (typeof ref !== "object" || ref === null) return false;
		for (const key in input) if (key !== "$type" && key !== "mimeType" && key !== "ref" && key !== "size") return false;
		if (!(0, cid_js_1.ifCid)(ref, options?.strict === false ? void 0 : STRICT_CID_CHECK_OPTIONS)) return false;
		return true;
	}
	/**
	* Type guard to check if a value is a valid {@link LegacyBlobRef}.
	*
	* Validates the structure of the input:
	* - `cid` must be a valid CID string
	* - `mimeType` must be a non-empty string
	* - No additional properties allowed
	*
	* @example
	* ```typescript
	* import { isLegacyBlobRef } from '@atproto/lex-data'
	*
	* if (isLegacyBlobRef(data)) {
	*   console.log(data.cid)       // CID as string
	*   console.log(data.mimeType)  // e.g., 'image/jpeg'
	* }
	* ```
	*
	* @see {@link isTypedBlobRef} for checking the current blob reference format
	*/
	function isLegacyBlobRef(input, options) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		const { cid, mimeType } = input;
		if (typeof cid !== "string") return false;
		if (typeof mimeType !== "string" || mimeType.length === 0) return false;
		for (const key in input) if (key !== "cid" && key !== "mimeType") return false;
		if (!(0, cid_js_1.validateCidString)(cid, options?.strict === false ? void 0 : STRICT_CID_CHECK_OPTIONS)) return false;
		return true;
	}
	function* enumBlobRefs(input, options) {
		const includeLegacy = options?.allowLegacy === true;
		const stack = [input];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if (value != null && typeof value === "object") {
				if (Array.isArray(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					stack.push(...value);
				} else if ((0, object_js_1.isPlainProto)(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					if (isTypedBlobRef(value, options)) yield value;
					else if (includeLegacy && isLegacyBlobRef(value, options)) yield value;
					else for (const v of Object.values(value)) if (v != null) stack.push(v);
				}
			}
		} while (stack.length > 0);
		visited.clear();
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/lex-equals.js
var require_lex_equals$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexEquals = lexEquals;
	var cid_js_1 = require_cid$4();
	var object_js_1 = require_object$4();
	var uint8array_js_1 = require_uint8array$3();
	/**
	* Performs deep equality comparison between two {@link LexValue}s.
	*
	* This function correctly handles all Lexicon data types including:
	* - Primitives (string, number, boolean, null)
	* - Arrays (recursive element comparison)
	* - Objects/LexMaps (recursive key-value comparison)
	* - Uint8Arrays (byte-by-byte comparison)
	* - CIDs (using CID equality)
	*
	* @param a - First LexValue to compare
	* @param b - Second LexValue to compare
	* @returns `true` if the values are deeply equal
	* @throws {TypeError} If either value is not a valid LexValue (e.g., contains unsupported types)
	*
	* @example
	* ```typescript
	* import { lexEquals } from '@atproto/lex-data'
	*
	* // Primitives
	* lexEquals('hello', 'hello')  // true
	* lexEquals(42, 42)            // true
	*
	* // Arrays
	* lexEquals([1, 2, 3], [1, 2, 3])  // true
	* lexEquals([1, 2], [1, 2, 3])     // false
	*
	* // Objects
	* lexEquals({ a: 1, b: 2 }, { a: 1, b: 2 })  // true
	* lexEquals({ a: 1 }, { a: 1, b: 2 })        // false
	*
	* // CIDs
	* lexEquals(cid1, cid2)  // true if CIDs are equal
	*
	* // Uint8Arrays
	* lexEquals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ```
	*/
	function lexEquals(a, b) {
		if (Object.is(a, b)) return true;
		if (a == null || b == null || typeof a !== "object" || typeof b !== "object") return false;
		if (Array.isArray(a)) {
			if (!Array.isArray(b)) return false;
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) if (!lexEquals(a[i], b[i])) return false;
			return true;
		} else if (Array.isArray(b)) return false;
		if (ArrayBuffer.isView(a)) {
			if (!ArrayBuffer.isView(b)) return false;
			return (0, uint8array_js_1.ui8Equals)(a, b);
		} else if (ArrayBuffer.isView(b)) return false;
		if ((0, cid_js_1.isCid)(a)) return (0, cid_js_1.ifCid)(b)?.equals(a) === true;
		else if ((0, cid_js_1.isCid)(b)) return false;
		if (!(0, object_js_1.isPlainObject)(a) || !(0, object_js_1.isPlainObject)(b)) throw new TypeError("Invalid LexValue (expected CID, Uint8Array, or LexMap)");
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		for (const key of aKeys) {
			const aVal = a[key];
			const bVal = b[key];
			if (aVal === void 0) {
				if (bVal === void 0 && bKeys.includes(key)) continue;
				return false;
			} else if (bVal === void 0) return false;
			if (!lexEquals(aVal, bVal)) return false;
		}
		return true;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/lex-error.js
var require_lex_error$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LexError = void 0;
	/**
	* Error class for Lexicon-related errors.
	*
	* LexError extends the standard JavaScript {@link Error} with AT
	* Protocol-specific functionality including an `error` code property and
	* methods for representation as (XRPC) error responses payloads.
	*
	* @typeParam N - The specific error code type
	*/
	var LexError = class extends Error {
		error;
		name = "LexError";
		/**
		* @param error - The error code identifying the type of error, typically used in XRPC error payloads
		* @param message - Optional human-readable error message
		* @param options - Standard Error options (e.g., cause)
		*/
		constructor(error, message, options) {
			super(message, options);
			this.error = error;
		}
		/**
		* Returns a string representation of this error.
		*
		* @returns A formatted string: "LexErrorClass: [MyErrorCode] My message"
		*/
		toString() {
			return `${this.name}: [${this.error}] ${this.message}`;
		}
		/**
		* Converts this error to a JSON-serializable object.
		*
		* @returns The error data suitable for JSON serialization
		* @note The `error` generic is *not* constrained to {@link N} to allow subclasses to override the error code type.
		*/
		toJSON() {
			const { error, message } = this;
			return {
				error,
				message: message || void 0
			};
		}
	};
	exports.LexError = LexError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/lex.js
var require_lex$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isLexMap = isLexMap;
	exports.isLexArray = isLexArray;
	exports.isLexScalar = isLexScalar;
	exports.isLexValue = isLexValue;
	exports.isTypedLexMap = isTypedLexMap;
	var cid_js_1 = require_cid$4();
	var object_js_1 = require_object$4();
	/**
	* Type guard to check if a value is a valid {@link LexMap}.
	*
	* Returns true if the value is a plain object where all values are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexMap
	*
	* @example
	* ```typescript
	* import { isLexMap } from '@atproto/lex'
	*
	* if (isLexMap(data)) {
	*   // data is narrowed to LexMap
	*   console.log(Object.keys(data))
	* }
	* ```
	*/
	function isLexMap(value) {
		return (0, object_js_1.isPlainObject)(value) && Object.values(value).every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexArray}.
	*
	* Returns true if the value is an array where all elements are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexArray
	*
	* @example
	* ```typescript
	* import { isLexArray } from '@atproto/lex'
	*
	* if (isLexArray(data)) {
	*   // data is narrowed to LexArray
	*   data.forEach(item => console.log(item))
	* }
	* ```
	*/
	function isLexArray(value) {
		return Array.isArray(value) && value.every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexScalar}.
	*
	* Returns true if the value is one of the primitive Lexicon types:
	* number (integer only), string, boolean, null, Cid, or Uint8Array.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexScalar
	*
	* @example
	* ```typescript
	* import { isLexScalar } from '@atproto/lex'
	*
	* isLexScalar('hello')     // true
	* isLexScalar(42)          // true
	* isLexScalar(3.14)        // false (floats not allowed)
	* isLexScalar([1, 2])      // false (arrays are not scalars)
	* ```
	*/
	function isLexScalar(value) {
		switch (typeof value) {
			case "object": return value === null || value instanceof Uint8Array || (0, cid_js_1.isCid)(value);
			case "string":
			case "boolean": return true;
			case "number": if (Number.isInteger(value)) return true;
			default: return false;
		}
	}
	/**
	* Type guard to check if a value is a valid {@link LexValue}.
	*
	* Performs a deep check to validate that the value (and all nested values)
	* conform to the Lexicon data model. This includes checking for:
	* - Valid scalar types (number, string, boolean, null, Cid, Uint8Array)
	* - Arrays containing only valid LexValues
	* - Plain objects with string keys and valid LexValue values
	* - No cyclic references (which cannot be serialized to JSON or CBOR)
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexValue
	*
	* @example
	* ```typescript
	* import { isLexValue } from '@atproto/lex'
	*
	* isLexValue({ name: 'Alice', tags: ['admin'] })  // true
	* isLexValue(new Date())                           // false (not a plain object)
	* isLexValue({ fn: () => {} })                     // false (functions not allowed)
	* ```
	*/
	function isLexValue(value) {
		const stack = [value];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if ((0, object_js_1.isPlainObject)(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...Object.values(value));
			} else if (Array.isArray(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...value);
			} else if (!isLexScalar(value)) return false;
		} while (stack.length > 0);
		visited.clear();
		return true;
	}
	/**
	* Type guard to check if a value is a {@link TypedLexMap}.
	*
	* Returns true if the value is a valid {@link LexMap} with a non-empty
	* `$type` string property.
	*
	* @param value - The LexValue to check
	* @returns `true` if the value is a TypedLexMap
	*
	* @example
	* ```typescript
	* import { isTypedLexMap } from '@atproto/lex'
	*
	* const data = { $type: 'app.bsky.feed.post', text: 'Hello' }
	*
	* if (isTypedLexMap(data)) {
	*   console.log(data.$type)  // 'app.bsky.feed.post'
	* }
	* ```
	*/
	function isTypedLexMap(value) {
		return isLexMap(value) && typeof value.$type === "string" && value.$type.length > 0;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/utf8-from-base64.js
var require_utf8_from_base64$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64Node = void 0;
	exports.utf8FromBase64Ponyfill = utf8FromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer$3().NodeJSBuffer;
	exports.utf8FromBase64Node = Buffer ? function utf8FromBase64Node(b64, alphabet = "base64") {
		return Buffer.from(b64, alphabet).toString("utf8");
	} : /* v8 ignore next -- @preserve */ null;
	var textDecoder = /*#__PURE__*/ new TextDecoder();
	function utf8FromBase64Ponyfill(b64, alphabet) {
		const bytes = (0, from_string_1.fromString)(b64, alphabet);
		return textDecoder.decode(bytes);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/utf8-from-bytes.js
var require_utf8_from_bytes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBytesNode = void 0;
	exports.utf8FromBytesNative = utf8FromBytesNative;
	var Buffer = require_nodejs_buffer$3().NodeJSBuffer;
	exports.utf8FromBytesNode = Buffer ? function utf8FromBytesNode(bytes) {
		return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("utf8");
	} : /* v8 ignore next -- @preserve */ null;
	function utf8FromBytesNative(bytes) {
		return new TextDecoder("utf-8").decode(bytes);
	}
}));
//#endregion
//#region node_modules/unicode-segmenter/core.cjs
var require_core$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.decodeUnicodeData = decodeUnicodeData;
	exports.findUnicodeRangeIndex = findUnicodeRangeIndex;
	/**
	* @template {number} [T=number]
	* @typedef {[from: number, to: number, category: T]} CategorizedUnicodeRange
	*/
	/**
	* @typedef {CategorizedUnicodeRange<0>} UnicodeRange
	*/
	/**
	* @typedef {string & { __tag: 'UnicodeDataEncoding' }} UnicodeDataEncoding
	*
	* Encoding for array of {@link UnicodeRange}, items separated by comma.
	*
	* Each {@link UnicodeDataRow} packed as a base36 integer:
	*
	* padding  = to - from
	* encoding = base36(from) + ',' + base36(padding)
	*
	* Notes:
	* - base36 can hold surprisingly large numbers in a few characters.
	* - The biggest codepoint is 0xE01F0 (918,000) at this point
	* - The max value of a category is 23; https://www.unicode.org/reports/tr29/tr29-45.html#Table_Word_Break_Property_Values
	* - The longest range is 42,720; CJK UNIFIED IDEOGRAPH-20000..CJK UNIFIED IDEOGRAPH-2A6DF
	*/
	/**
	* @template {number} [T=number]
	* @param {UnicodeDataEncoding} data
	* @param {string} [cats='']
	* @returns {Array<CategorizedUnicodeRange<T>>}
	*/
	function decodeUnicodeData(data, cats = "") {
		let buf = [], nums = data.split(",").map((s) => s ? parseInt(s, 36) : 0), n = 0;
		for (let i = 0; i < nums.length; i++) i % 2 ? buf.push([
			n,
			n + nums[i],
			cats ? parseInt(cats[i >> 1], 36) : 0
		]) : n = nums[i];
		return buf;
	}
	/**
	* @template {object} Ext
	* @typedef {{
	*   segment: string,
	*   index: number,
	*   input: string,
	* } & Ext} SegmentOutput
	*/
	/**
	* @template {object} T
	* @typedef {IterableIterator<SegmentOutput<T>>} Segmenter
	*/
	/**
	* @template {number} [T=number]
	* @param {number} cp
	* @param {CategorizedUnicodeRange<T>[]} ranges
	* @return {number} index of matched unicode range, or -1 if no match
	*/
	function findUnicodeRangeIndex(cp, ranges, lo = 0, hi = ranges.length - 1) {
		while (lo <= hi) {
			let mid = lo + hi >>> 1, range = ranges[mid];
			if (cp < range[0]) hi = mid - 1;
			else if (cp > range[1]) lo = mid + 1;
			else return mid;
		}
		return -1;
	}
}));
//#endregion
//#region node_modules/unicode-segmenter/_grapheme_data.cjs
var require__grapheme_data = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.grapheme_ranges = exports.GraphemeCategory = void 0;
	var _core = require_core$1();
	exports.GraphemeCategory = {
		Any: 0,
		CR: 1,
		Control: 2,
		Extend: 3,
		Extended_Pictographic: 4,
		L: 5,
		LF: 6,
		LV: 7,
		LVT: 8,
		Prepend: 9,
		Regional_Indicator: 10,
		SpacingMark: 11,
		T: 12,
		V: 13,
		ZWJ: 14
	};
	exports.grapheme_ranges = (0, _core.decodeUnicodeData)(",9,a,,b,1,d,,e,h,3j,w,4p,,4t,,4u,,lc,33,w3,6,13l,18,14v,,14x,1,150,1,153,,16o,5,174,a,17g,,18r,k,19s,,1cm,6,1ct,,1cv,5,1d3,1,1d6,3,1e7,,1e9,,1f4,q,1ie,a,1kb,8,1kt,,1li,3,1ln,8,1lx,2,1m1,4,1nd,2,1ow,1,1p3,8,1qi,n,1r6,,1r7,v,1s3,,1tm,,1tn,,1to,,1tq,2,1tt,7,1u1,3,1u5,,1u6,1,1u9,6,1uq,1,1vl,,1vm,1,1x8,,1xa,,1xb,1,1xd,3,1xj,1,1xn,1,1xp,,1xz,,1ya,1,1z2,,1z5,1,1z7,,20s,,20u,2,20x,1,213,1,217,2,21d,,228,1,22d,,22p,1,22r,,24c,,24e,2,24h,4,24n,1,24p,,24r,1,24t,,25e,1,262,5,269,,26a,1,27w,,27y,1,280,,281,3,287,1,28b,1,28d,,28l,2,28y,1,29u,,2bi,,2bj,,2bk,,2bl,1,2bq,2,2bu,2,2bx,,2c7,,2dc,,2dd,2,2dg,,2f0,,2f2,2,2f5,3,2fa,2,2fe,3,2fp,1,2g2,1,2gx,,2gy,1,2ik,,2im,,2in,1,2ip,,2iq,,2ir,1,2iu,2,2iy,3,2j9,1,2jm,1,2k3,,2kg,1,2ki,1,2m3,1,2m6,,2m7,1,2m9,3,2me,2,2mi,2,2ml,,2mm,,2mv,,2n6,1,2o1,,2o2,1,2q2,,2q7,,2q8,1,2qa,2,2qe,,2qg,6,2qn,,2r6,1,2sx,,2sz,,2t0,6,2tj,7,2wh,,2wj,,2wk,8,2x4,6,2zc,1,305,,307,,309,,30e,1,31t,d,327,,328,4,32e,1,32l,a,32x,z,346,,371,3,375,,376,5,37d,1,37f,1,37h,1,386,1,388,1,38e,2,38x,3,39e,,39g,,39h,1,39p,,3a5,,3cw,2n,3fk,1z,3hk,2f,3tp,2,4k2,3,4ky,2,4lu,1,4mq,1,4ok,1,4om,,4on,6,4ou,7,4p2,,4p3,1,4p5,a,4pp,,4qz,2,4r2,,4r3,,4ud,1,4vd,,4yo,2,4yr,3,4yv,1,4yx,2,4z4,1,4z6,,4z7,5,4zd,2,55j,1,55l,1,55n,,579,,57a,,57b,,57c,6,57k,,57m,,57p,7,57x,5,583,9,58f,,59s,u,5c0,3,5c4,,5dg,9,5dq,3,5du,2,5ez,8,5fk,1,5fm,,5gh,,5gi,3,5gm,1,5go,5,5ie,,5if,,5ig,1,5ii,2,5il,,5im,,5in,4,5k4,7,5kc,7,5kk,1,5km,1,5ow,2,5p0,c,5pd,,5pe,6,5pp,,5pw,,5pz,,5q0,1,5vk,1r,6bv,,6bw,,6bx,,6by,1,6co,6,6d8,,6dl,,6e8,f,6hc,w,6jm,,6k9,,6ms,5,6nd,1,6xm,1,6y0,,70o,,72n,,73d,a,73s,2,79e,,7fu,1,7g6,,7gg,,7i3,3,7i8,5,7if,b,7is,35,7m8,39,7pk,a,7pw,,7py,,7q5,,7q9,,7qg,,7qr,1,7r8,,7rb,,7rg,,7ri,,7rn,2,7rr,,7s3,4,7th,2,7tt,,7u8,,7un,,850,1,8hx,2,8ij,1,8k0,,8k5,,8vj,2,8zj,,928,v,wvj,3,wvo,9,wwu,1,wz4,1,x6q,,x6u,,x6z,,x7n,1,x7p,1,x7r,,x7w,,xa8,1,xbo,f,xc4,1,xcw,h,xdr,,xeu,7,xfr,a,xg2,,xg3,,xgg,s,xhc,2,xhf,,xir,,xis,1,xiu,3,xiy,1,xj0,1,xj2,1,xj4,,xk5,,xm1,5,xm7,1,xm9,1,xmb,1,xmd,1,xmr,,xn0,,xn1,,xoc,,xps,,xpu,2,xpz,1,xq6,1,xq9,,xrf,,xrg,1,xri,1,xrp,,xrq,,xyb,1,xyd,,xye,1,xyg,,xyh,1,xyk,,xyl,,1e68,f,1e74,f,1edb,,1ehq,1,1ek0,b,1eyl,,1f4w,,1f92,4,1gjl,2,1gjp,1,1gjw,3,1gl4,2,1glb,,1gpx,1,1h5w,3,1h7t,4,1hgr,1,1hj0,3,1hl2,a,1hmq,3,1hq8,,1hq9,,1hqa,,1hrs,e,1htc,,1htf,1,1htr,2,1htu,,1hv4,2,1hv7,3,1hvb,1,1hvd,1,1hvh,,1hvm,,1hvx,,1hxc,2,1hyf,4,1hyk,,1hyl,7,1hz9,1,1i0j,,1i0w,1,1i0y,,1i2b,2,1i2e,8,1i2n,,1i2o,,1i2q,1,1i2x,3,1i32,,1i33,,1i5o,2,1i5r,2,1i5u,1,1i5w,3,1i66,,1i69,,1ian,,1iao,2,1iar,7,1ibk,1,1ibm,1,1id7,1,1ida,,1idb,,1idc,,1idd,3,1idj,1,1idn,1,1idp,,1idz,,1iea,1,1iee,6,1ieo,4,1igo,,1igp,1,1igr,5,1igy,,1ih1,,1ih3,2,1ih6,,1ih8,1,1iha,2,1ihd,,1ihe,,1iht,1,1ik5,2,1ik8,7,1ikg,1,1iki,2,1ikl,,1ikm,,1ila,,1ink,,1inl,1,1inn,5,1int,,1inu,,1inv,1,1inx,,1iny,,1inz,1,1io1,,1io2,1,1iun,,1iuo,1,1iuq,3,1iuw,3,1iv0,1,1iv2,,1iv3,1,1ivw,1,1iy8,2,1iyb,7,1iyj,1,1iyl,,1iym,,1iyn,1,1j1n,,1j1o,,1j1p,,1j1q,1,1j1s,7,1j4t,,1j4u,,1j4v,,1j4y,3,1j52,,1j53,4,1jcc,2,1jcf,8,1jco,,1jcp,1,1jjk,,1jjl,4,1jjr,1,1jjv,3,1jjz,,1jk0,,1jk1,,1jk2,,1jk3,,1jo1,2,1jo4,3,1joa,1,1joc,3,1jog,,1jok,,1jpd,9,1jqr,5,1jqx,,1jqy,,1jqz,3,1jrb,,1jrl,5,1jrr,1,1jrt,2,1jt0,5,1jt6,c,1jtj,,1jtk,1,1k4v,,1k4w,6,1k54,5,1k5a,,1k5b,,1k7m,l,1k89,,1k8a,6,1k8h,,1k8i,1,1k8k,,1k8l,1,1kc1,5,1kca,,1kcc,1,1kcf,6,1kcm,,1kcn,,1kei,4,1keo,1,1ker,1,1ket,,1keu,,1kev,,1koj,1,1kol,1,1kow,1,1koy,,1koz,,1kqc,1,1kqe,4,1kqm,1,1kqo,2,1kre,,1ovk,f,1ow0,,1ow7,e,1xr2,b,1xre,2,1xrh,2,1zow,4,1zqo,6,206b,,206f,3,20jz,,20k1,1i,20lr,3,20o4,,20og,1,2ftp,1,2fts,3,2jgg,19,2jhs,m,2jxh,4,2jxp,5,2jxv,7,2jy3,7,2jyd,6,2jze,3,2k3m,2,2lmo,1i,2lob,1d,2lpx,,2lqc,,2lqz,4,2lr5,e,2mtc,6,2mtk,g,2mu3,6,2mub,1,2mue,4,2mxb,,2n1s,6,2nce,,2ne4,3,2nsc,3,2nzi,1,2ok0,6,2on8,6,2pz4,73,2q6l,2,2q7j,,2q98,5,2q9q,1,2qa6,,2qa9,9,2qb1,1k,2qcm,p,2qdd,e,2qe2,,2qen,,2qeq,8,2qf0,3,2qfd,c1,2qrf,4,2qrk,8t,2r0m,7d,2r9c,3j,2rg4,b,2rit,16,2rkc,3,2rm0,7,2rmi,5,2rns,7,2rou,29,2rrg,1a,2rss,9,2rt3,c8,2scg,sd,jny8,v,jnz4,2n,jo1s,3j,jo5c,6n,joc0,2rz", "262122424333333393233393339333333333393393b3b3b3b3b333b33b3bb33333b3b3333333b3b33bb3333b33b3bb33333b3bbb333b333b33333b3b3b3b3333b3b33b3bb39333b33b33b3b3b333b333333b3b333333b33b3b3333b3335dc333333b3b3b33323333b3bb3b33b3b3b3333b3333b3b333bb3b33b3b3b3b3b333b333b3323e2244234444444444444444444444444444444444444444443333333333b3b3bb33333b353b3b3b3b333b3b333b333333b3bb3b3b3bb333232333333333333333b3b3333bb3b393933b3b33bb3b393b3b3b3333b33b33b3bbb33b333b3333bb3933b3b3b333b3b3b3b3b33b3b3b33b3b3b33b3b33b33b3b3b33bb39b9b3b33b3b33b9333b393b3b33b33b3b3b3333393b3b3b33b39bb3b332333b333dd3b33332333323333333333333333333333344444444a44444434444444444444423232");
}));
//#endregion
//#region node_modules/unicode-segmenter/_incb_data.cjs
var require__incb_data = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.consonant_ranges = void 0;
	exports.consonant_ranges = (0, require_core$1().decodeUnicodeData)("1sl,10,1ug,7,1vc,7,1w5,j,1wq,6,1wy,,1x2,3,1y4,1,1y7,,1yo,1,239,j,23u,6,242,1,245,4,261,,26t,j,27e,6,27m,1,27p,4,28s,1,28v,,29d,,2dx,j,2ei,f,2fs,2,2l1,11");
}));
//#endregion
//#region node_modules/unicode-segmenter/grapheme.cjs
var require_grapheme = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.countGrapheme = exports.countGraphemes = countGraphemes;
	exports.graphemeSegments = graphemeSegments;
	exports.splitGraphemes = splitGraphemes;
	var _core = require_core$1();
	var _grapheme_data = require__grapheme_data();
	exports.GraphemeCategory = _grapheme_data.GraphemeCategory;
	var _incb_data = require__incb_data();
	/**
	* @typedef {import('./_grapheme_data.js').GC_Any} GC_Any
	*
	* @typedef {import('./_grapheme_data.js').GraphemeCategoryNum} GraphemeCategoryNum
	* @typedef {import('./_grapheme_data.js').GraphemeCategoryRange} GraphemeCategoryRange
	*
	* @typedef {object} GraphemeSegmentExtra
	* @property {number} _hd The first code point of the segment
	* @property {GraphemeCategoryNum} _catBegin Beginning Grapheme_Cluster_Break category of the segment
	* @property {GraphemeCategoryNum} _catEnd Ending Grapheme_Cluster_Break category of the segment
	*
	* @typedef {import('./core.js').Segmenter<GraphemeSegmentExtra>} GraphemeSegmenter
	*/
	var BMP_MAX = 65535;
	/**
	* Unicode segmentation by extended grapheme rules.
	*
	* This is fully compatible with the {@link Intl.Segmenter.segment} API
	* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment
	*
	* @param {string} input
	* @return {GraphemeSegmenter} iterator for grapheme cluster segments
	*/
	function* graphemeSegments(input) {
		let cp = input.codePointAt(0);
		if (cp == null) return;
		/** Current cursor position. */
		let cursor = cp <= BMP_MAX ? 1 : 2;
		/** Total length of the input string. */
		let len = input.length;
		/** Category of codepoint immediately preceding cursor */
		let catBefore = cat(cp);
		/** @type {GraphemeCategoryNum} Category of codepoint immediately preceding cursor. */
		let catAfter = 0;
		/** The number of RIS codepoints preceding `cursor`. */
		let risCount = 0;
		/**
		* Emoji state for GB11: tracks if we've seen Extended_Pictographic followed by Extend* ZWJ
		* Only relevant when catBefore === ZWJ && catAfter === Extended_Pictographic
		*/
		let emoji = false;
		/** InCB=Consonant - segment started with Indic consonant */
		let consonant = false;
		/** InCB=Linker - seen a linker after consonant */
		let linker = false;
		let index = 0;
		/** Beginning category of a segment */
		let _catBegin = catBefore;
		/** Memoize the beginning code point of the segment. */
		let _hd = cp;
		while (cursor < len) {
			cp = input.codePointAt(cursor);
			catAfter = cat(cp);
			let boundary = true;
			if (catBefore === 1) boundary = catAfter !== 6;
			else if (catBefore === 2 || catBefore === 6) boundary = true;
			else if (catAfter === 1 || catAfter === 2 || catAfter === 6) boundary = true;
			else if (catAfter === 3 || catAfter === 14 || catAfter === 11) boundary = false;
			else if (catBefore === 9) boundary = false;
			else if (catBefore === 14 && catAfter === 4) boundary = !emoji;
			else if (catBefore === 10 && catAfter === 10) boundary = risCount++ % 2 === 1;
			else if (catBefore === 5) boundary = !(catAfter === 5 || catAfter === 13 || catAfter === 7 || catAfter === 8);
			else if ((catBefore === 7 || catBefore === 13) && (catAfter === 13 || catAfter === 12)) boundary = false;
			else if ((catBefore === 8 || catBefore === 12) && catAfter === 12) boundary = false;
			else if (catAfter === 0 && consonant && linker && isIndicConjunctConsonant(cp)) boundary = false;
			if (boundary) {
				yield {
					segment: input.slice(index, cursor),
					index,
					input,
					_hd,
					_catBegin,
					_catEnd: catBefore
				};
				emoji = false;
				risCount = 0;
				index = cursor;
				_catBegin = catAfter;
				_hd = cp;
			} else if (catAfter === 14 && (catBefore === 3 || catBefore === 4)) emoji = true;
			else if (cp >= 2325) {
				if (!consonant && catBefore === 0) consonant = isIndicConjunctConsonant(_hd);
				if (consonant && catAfter === 3) linker = linker || cp === 2381 || cp === 2509 || cp === 2637 || cp === 2765 || cp === 2893 || cp === 3149 || cp === 3405;
				else linker = false;
			}
			cursor += cp <= BMP_MAX ? 1 : 2;
			catBefore = catAfter;
		}
		if (index < len) yield {
			segment: input.slice(index),
			index,
			input,
			_hd,
			_catBegin,
			_catEnd: catBefore
		};
	}
	/**
	* Count number of extended grapheme clusters in given text.
	*
	* NOTE:
	*
	* This function is a small wrapper around {@link graphemeSegments}.
	*
	* If you call it more than once at a time, consider memoization
	* or use {@link graphemeSegments} or {@link splitGraphemes} once instead
	*
	* @param {string} text
	* @return {number} count of grapheme clusters
	*/
	function countGraphemes(text) {
		let count = 0;
		for (let _ of graphemeSegments(text)) count += 1;
		return count;
	}
	/**
	* Split given text into extended grapheme clusters.
	*
	* @param {string} text
	* @return {IterableIterator<string>} iterator for grapheme clusters
	*
	* @see {@link graphemeSegments} if you need extra information.
	*
	* @example
	* [...splitGraphemes('abc')] // => ['a', 'b', 'c']
	*/
	function* splitGraphemes(text) {
		for (let s of graphemeSegments(text)) yield s.segment;
	}
	var SEG0 = /* @__PURE__ */ new Uint8Array(6080);
	var SEG0_MIN = 128;
	var SEG0_MAX = 12287;
	var SEG1 = /* @__PURE__ */ new Uint8Array(1536);
	var SEG1_MIN = 40960;
	var SEG1_MAX = 44031;
	var SEG_CURSOR = (() => {
		let cursor = 0;
		while (true) {
			let [start, end, cat] = _grapheme_data.grapheme_ranges[cursor];
			if (start > SEG1_MAX) break;
			cursor++;
			if (end < SEG0_MIN || start > SEG0_MAX && end < SEG1_MIN) continue;
			for (let cp = start; cp <= end; cp++) {
				let seg, idx = 0;
				if (cp <= SEG0_MAX) {
					seg = SEG0;
					idx = cp - SEG0_MIN >> 1;
				} else {
					seg = SEG1;
					idx = cp - SEG1_MIN >> 1;
				}
				seg[idx] = cp & 1 ? seg[idx] & 15 | cat << 4 : seg[idx] & 240 | cat;
			}
		}
		return cursor;
	})();
	/**
	* `Grapheme_Cluster_Break` property value of a given codepoint
	*
	* @see https://www.unicode.org/reports/tr29/tr29-43.html#Default_Grapheme_Cluster_Table
	*
	* @param {number} cp
	* @return {GraphemeCategoryNum}
	*/
	function cat(cp) {
		if (cp < SEG0_MIN) {
			if (cp >= 32) return 0;
			if (cp === 10) return 6;
			if (cp === 13) return 1;
			return 2;
		}
		if (cp <= SEG0_MAX) {
			let byte = SEG0[cp - SEG0_MIN >> 1];
			return cp & 1 ? byte >> 4 : byte & 15;
		}
		if (cp < SEG1_MIN) {
			if (cp < 12336) return cp >= 12330 ? 3 : 0;
			if (cp < 12443) {
				if (cp === 12336 || cp === 12349) return 4;
				return cp >= 12441 ? 3 : 0;
			}
			if (cp === 12951 || cp === 12953) return 4;
			return 0;
		}
		if (cp <= SEG1_MAX) {
			let byte = SEG1[cp - SEG1_MIN >> 1];
			return cp & 1 ? byte >> 4 : byte & 15;
		}
		if (cp <= 55203) return (cp - 44032) % 28 === 0 ? 7 : 8;
		if (cp <= 55295) {
			if (cp <= 55238) return cp >= 55216 ? 13 : 0;
			return cp >= 55243 ? 12 : 0;
		}
		if (cp < 65024) return cp === 64286 ? 3 : 0;
		let idx = (0, _core.findUnicodeRangeIndex)(cp, _grapheme_data.grapheme_ranges, SEG_CURSOR);
		return idx < 0 ? 0 : _grapheme_data.grapheme_ranges[idx][2];
	}
	/**
	* @param {number} cp
	* @return {boolean}
	*/
	function isIndicConjunctConsonant(cp) {
		return (0, _core.findUnicodeRangeIndex)(cp, _incb_data.consonant_ranges) >= 0;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/utf8-grapheme-len.js
var require_utf8_grapheme_len$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.graphemeLenNative = void 0;
	exports.graphemeLenPonyfill = graphemeLenPonyfill;
	var grapheme_1 = require_grapheme();
	var segmenter = "Segmenter" in Intl && typeof Intl.Segmenter === "function" ? /*#__PURE__*/ new Intl.Segmenter() : /* v8 ignore next -- @preserve */ null;
	exports.graphemeLenNative = segmenter ? function graphemeLenNative(str) {
		let length = 0;
		for (const _ of segmenter.segment(str)) length++;
		return length;
	} : /* v8 ignore next -- @preserve */ null;
	function graphemeLenPonyfill(str) {
		return (0, grapheme_1.countGraphemes)(str);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/utf8-len.js
var require_utf8_len$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8LenNode = void 0;
	exports.utf8LenCompute = utf8LenCompute;
	var nodejs_buffer_js_1 = require_nodejs_buffer$3();
	exports.utf8LenNode = nodejs_buffer_js_1.NodeJSBuffer ? function utf8LenNode(string) {
		return nodejs_buffer_js_1.NodeJSBuffer.byteLength(string, "utf8");
	} : /* v8 ignore next -- @preserve */ null;
	function utf8LenCompute(string) {
		let len = string.length;
		let code;
		for (let i = 0; i < string.length; i += 1) {
			code = string.charCodeAt(i);
			if (code <= 127) {} else if (code <= 2047) len += 1;
			else {
				len += 2;
				if (code >= 55296 && code <= 56319) {
					code = string.charCodeAt(i + 1);
					if (code >= 56320 && code <= 57343) i++;
				}
			}
		}
		return len;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/utf8-to-base64.js
var require_utf8_to_base64$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8ToBase64Node = void 0;
	exports.utf8ToBase64Ponyfill = utf8ToBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var nodejs_buffer_js_1 = require_nodejs_buffer$3();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64$3();
	var Buffer = nodejs_buffer_js_1.NodeJSBuffer;
	exports.utf8ToBase64Node = Buffer ? function utf8ToBase64Node(text, alphabet) {
		const buffer = Buffer.from(text, "utf8");
		return uint8array_to_base64_js_1.toBase64Node(buffer, alphabet);
	} : /* v8 ignore next -- @preserve */ null;
	var textEncoder = /*#__PURE__*/ new TextEncoder();
	function utf8ToBase64Ponyfill(text, alphabet) {
		const bytes = textEncoder.encode(text);
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/utf8.js
var require_utf8$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64 = exports.utf8ToBase64 = exports.utf8Len = exports.graphemeLen = exports.utf8FromBytes = void 0;
	var utf8_from_base64_js_1 = require_utf8_from_base64$3();
	var utf8_from_bytes_js_1 = require_utf8_from_bytes();
	var utf8_grapheme_len_js_1 = require_utf8_grapheme_len$3();
	var utf8_len_js_1 = require_utf8_len$3();
	var utf8_to_base64_js_1 = require_utf8_to_base64$3();
	/**
	* Converts a Uint8Array to a UTF-8 string.
	*
	* Uses Node.js Buffer when available for performance, falling back to
	* TextDecoder in environments without Buffer support.
	*
	* @param bytes - The binary data to decode
	* @returns The decoded string (as UTF-16 JavaScript string)
	*
	* @example
	* ```typescript
	* import { utf8FromBytes } from '@atproto/lex-data'
	*
	* const bytes = new Uint8Array([72, 101, 108, 108, 111])
	* utf8FromBytes(bytes)  // 'Hello'
	* ```
	*/
	exports.utf8FromBytes = utf8_from_bytes_js_1.utf8FromBytesNode ?? utf8_from_bytes_js_1.utf8FromBytesNative;
	/**
	* Counts the number of grapheme clusters (user-perceived characters) in a string.
	*
	* Grapheme clusters represent what users typically think of as "characters",
	* handling complex cases like:
	* - Emoji with skin tones and ZWJ sequences (e.g., family emoji)
	* - Combined characters (e.g., 'e' + combining accent)
	* - Regional indicator pairs (flag emoji)
	*
	* Uses native {@link Intl.Segmenter} when available, falling back to a ponyfill.
	*
	* @param str - The string to measure
	* @returns The number of grapheme clusters
	*
	* @example
	* ```typescript
	* import { graphemeLen } from '@atproto/lex-data'
	*
	* graphemeLen('hello')        // 5
	* graphemeLen('cafe\u0301')   // 4 (cafe with combining accent)
	* graphemeLen('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 1 (family emoji)
	* ```
	*/
	exports.graphemeLen = utf8_grapheme_len_js_1.graphemeLenNative ?? utf8_grapheme_len_js_1.graphemeLenPonyfill;
	/* v8 ignore next -- @preserve */
	if (exports.graphemeLen === utf8_grapheme_len_js_1.graphemeLenPonyfill) {}
	/**
	* Calculates the UTF-8 byte length of a string.
	*
	* Returns the number of bytes the string would occupy when encoded as UTF-8.
	* This is important for Lexicon validation where schemas specify byte limits.
	*
	* Uses Node.js Buffer.byteLength when available for performance,
	* falling back to a computed implementation.
	*
	* @param str - The string to measure
	* @returns The UTF-8 byte length
	*
	* @example
	* ```typescript
	* import { utf8Len } from '@atproto/lex-data'
	*
	* utf8Len('hello')      // 5 (ASCII: 1 byte per char)
	* utf8Len('\u00e9')     // 2 (e with accent: 2 bytes)
	* utf8Len('\u{1F600}')  // 4 (emoji: 4 bytes)
	* utf8Len('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 25 (family emoji)
	* ```
	*/
	exports.utf8Len = utf8_len_js_1.utf8LenNode ?? utf8_len_js_1.utf8LenCompute;
	/**
	* Encodes a UTF-8 string to base64.
	*
	* First encodes the string as UTF-8 bytes, then encodes those bytes as base64.
	*
	* @param str - The string to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The base64-encoded string
	*
	* @example
	* ```typescript
	* import { utf8ToBase64 } from '@atproto/lex-data'
	*
	* utf8ToBase64('Hello')  // 'SGVsbG8='
	* ```
	*/
	exports.utf8ToBase64 = utf8_to_base64_js_1.utf8ToBase64Node ?? utf8_to_base64_js_1.utf8ToBase64Ponyfill;
	/**
	* Decodes a base64 string to UTF-8.
	*
	* Decodes the base64 to bytes, then interprets those bytes as UTF-8 text.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The decoded UTF-8 string
	*
	* @example
	* ```typescript
	* import { utf8FromBase64 } from '@atproto/lex-data'
	*
	* utf8FromBase64('SGVsbG8=')  // 'Hello'
	* ```
	*/
	exports.utf8FromBase64 = utf8_from_base64_js_1.utf8FromBase64Node ?? utf8_from_base64_js_1.utf8FromBase64Ponyfill;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-data/dist/index.js
var require_dist$15 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_blob$8(), exports);
	tslib_1.__exportStar(require_cid$4(), exports);
	tslib_1.__exportStar(require_lex_equals$3(), exports);
	tslib_1.__exportStar(require_lex_error$3(), exports);
	tslib_1.__exportStar(require_lex$3(), exports);
	tslib_1.__exportStar(require_object$4(), exports);
	tslib_1.__exportStar(require_uint8array$3(), exports);
	tslib_1.__exportStar(require_utf8$3(), exports);
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-json/dist/bytes.js
var require_bytes$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLexBytes = parseLexBytes;
	exports.encodeLexBytes = encodeLexBytes;
	var lex_data_1 = require_dist$15();
	/**
	* Parses a `{$bytes: string}` JSON object into a `Uint8Array`.
	*
	* In the AT Protocol data model, binary data is represented in JSON as an object
	* with a single `$bytes` property containing a base64-encoded string. This function
	* decodes that representation back into raw bytes.
	*
	* @param input - An object potentially containing a `$bytes` property
	* @returns The decoded `Uint8Array` if the input is a valid `$bytes` object,
	*          or `undefined` if the input is not a valid `$bytes` representation
	*
	* @example
	* ```typescript
	* // Parse a $bytes object to Uint8Array
	* const bytes = parseLexBytes({ $bytes: 'SGVsbG8sIHdvcmxkIQ==' })
	* // bytes is Uint8Array containing "Hello, world!"
	*
	* // Returns undefined for non-$bytes objects
	* const result = parseLexBytes({ foo: 'bar' })
	* // result is undefined
	*
	* // Returns undefined for objects with extra properties
	* const invalid = parseLexBytes({ $bytes: 'SGVsbG8=', extra: true })
	* // invalid is undefined
	* ```
	*/
	function parseLexBytes(input) {
		if (!input || !("$bytes" in input)) return;
		for (const key in input) if (key !== "$bytes") return;
		if (typeof input.$bytes !== "string") return;
		try {
			return (0, lex_data_1.fromBase64)(input.$bytes);
		} catch {
			return;
		}
	}
	/**
	* Encodes a `Uint8Array` into a `{$bytes: string}` JSON representation.
	*
	* In the AT Protocol data model, binary data is represented in JSON as an object
	* with a single `$bytes` property containing a base64-encoded string. This function
	* performs that encoding.
	*
	* @param bytes - The binary data to encode
	* @returns An object with a `$bytes` property containing the base64-encoded data
	*
	* @example
	* ```typescript
	* const bytes = new TextEncoder().encode('Hello, world!')
	* const encoded = encodeLexBytes(bytes)
	* // encoded is { $bytes: 'SGVsbG8sIHdvcmxkIQ==' }
	* ```
	*/
	function encodeLexBytes(bytes) {
		return { $bytes: (0, lex_data_1.toBase64)(bytes) };
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-json/dist/json.js
var require_json$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-json/dist/link.js
var require_link$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLexLink = parseLexLink;
	exports.encodeLexLink = encodeLexLink;
	var lex_data_1 = require_dist$15();
	function parseLexLink(input, options) {
		if (!input || !("$link" in input)) return;
		for (const key in input) if (key !== "$link") return;
		const { $link } = input;
		if (typeof $link !== "string") return;
		if ($link.length === 0) return;
		if ($link.length > 2048) return;
		try {
			return (0, lex_data_1.parseCid)($link, options);
		} catch (cause) {
			return;
		}
	}
	/**
	* Encodes a {@link Cid} instance into a `{$link: string}` JSON representation.
	*
	* In the AT Protocol data model, CID references are represented in JSON as an
	* object with a single `$link` property containing a base32-encoded CID string,
	* prefixed with "b". This function performs that encoding.
	*
	* @param cid - The CID to encode
	* @returns An object with a `$link` property containing the string representation of the CID
	*
	* @example
	* ```typescript
	* const cid = CID.parse('bafyreib2rxk3rybloqtqwbo')
	* const encoded = encodeLexLink(cid)
	* // encoded is { $link: 'bafyreib2rxk3rybloqtqwbo' }
	* ```
	*/
	function encodeLexLink(cid) {
		return { $link: cid.toString() };
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-json/dist/blob.js
var require_blob$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseTypedBlobRef = parseTypedBlobRef;
	var lex_data_1 = require_dist$15();
	var link_js_1 = require_link$2();
	/**
	* Parses a blob reference from a JSON object.
	*
	* In the AT Protocol, blobs are referenced using a specific object structure
	* with `$type: 'blob'`, a `ref` property containing a CID link, and metadata
	* like `mimeType` and `size`. This function validates and parses such objects
	* into `BlobRef` instances.
	*
	* The function handles both cases where the `ref` property is:
	* - A `{$link: string}` object (when parsing from JSON)
	* - Already a `Cid` instance (when the parent object has been partially converted)
	*
	* @param input - A Lex map potentially representing a blob reference
	* @param options - Optional blob reference validation options
	* @returns The parsed `BlobRef` if the input is a valid blob reference,
	*          or `undefined` if the input is not a valid blob representation
	*
	* @example
	* ```typescript
	* // Parse a blob reference from JSON
	* const blobRef = parseTypedBlobRef({
	*   $type: 'blob',
	*   ref: { $link: 'bafyreib2rxk3rybloqtqwbo' },
	*   mimeType: 'image/png',
	*   size: 12345
	* })
	*
	* // blobRef.ref is a Cid instance
	*
	* // Returns undefined for non-blob objects
	* const result = parseTypedBlobRef({ foo: 'bar' })
	* // result is undefined
	* ```
	*/
	function parseTypedBlobRef(input, options) {
		if (input.$type !== "blob") return void 0;
		const ref = input?.ref;
		if (!ref || typeof ref !== "object") return void 0;
		if ("$link" in ref) {
			const cid = (0, link_js_1.parseLexLink)(ref);
			if (!cid) return void 0;
			const blob = {
				...input,
				ref: cid
			};
			if ((0, lex_data_1.isTypedBlobRef)(blob, options)) return blob;
		}
		if ((0, lex_data_1.isTypedBlobRef)(input)) return input;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-json/dist/lex-json.js
var require_lex_json$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexStringify = lexStringify;
	exports.lexParse = lexParse;
	exports.lexParseJsonBytes = lexParseJsonBytes;
	exports.jsonToLex = jsonToLex;
	exports.lexToJson = lexToJson;
	exports.parseSpecialJsonObject = parseSpecialJsonObject;
	var lex_data_1 = require_dist$15();
	var blob_js_1 = require_blob$7();
	var bytes_js_1 = require_bytes$3();
	var link_js_1 = require_link$2();
	/**
	* Serialize a Lex value to a JSON string.
	*
	* This function serializes AT Protocol data model values to JSON, automatically
	* encoding special types:
	* - `Cid` instances are encoded as `{$link: string}`
	* - `Uint8Array` instances are encoded as `{$bytes: string}` (base64)
	*
	* @param input - The Lex value to stringify
	* @returns A JSON string representation of the value
	*
	* @example
	* ```typescript
	* import { lexStringify } from '@atproto/lex'
	*
	* // Stringify with CID and bytes encoding
	* const json = lexStringify({
	*   ref: someCid,
	*   data: new Uint8Array([72, 101, 108, 108, 111])
	* })
	* // json is '{"ref":{"$link":"bafyrei..."},"data":{"$bytes":"SGVsbG8="}}'
	* ```
	*/
	function lexStringify(input) {
		return JSON.stringify(lexToJson(input));
	}
	/**
	* Parses a JSON string into Lex values.
	*
	* This function parses JSON and automatically decodes AT Protocol special types:
	* - `{$link: string}` objects are decoded to `Cid` instances
	* - `{$bytes: string}` objects are decoded to `Uint8Array` instances
	* - `{$type: 'blob'}` objects are validated
	*
	* @typeParam T - Type cast for the resulting Lex value. Use when you want to specify the expected structure of the parsed data.
	* @param input - The JSON string to parse
	* @param options - Parsing options (e.g., strict mode)
	* @returns The parsed Lex value
	* @throws {SyntaxError} If the input is not valid JSON
	* @throws {TypeError} If strict mode is enabled and invalid Lex values are found
	*
	* @example
	* ```typescript
	* import { lexParse } from '@atproto/lex'
	*
	* // Parse JSON with $link and $bytes decoding
	* const parsed = lexParse<{
	*   ref: Cid
	*   data: Uint8Array
	* }>(`{
	*   "ref": { "$link": "bafyrei..." },
	*   "data": { "$bytes": "SGVsbG8sIHdvcmxkIQ==" }
	* }`)
	*
	* // Parse a single CID
	* const someCid = lexParse<Cid>('{"$link": "bafyrei..."}')
	*
	* // Parse binary data
	* const someBytes = lexParse<Uint8Array>('{"$bytes": "SGVsbG8sIHdvcmxkIQ=="}')
	* ```
	*/
	function lexParse(input, options = { strict: false }) {
		return jsonToLex(JSON.parse(input), options);
	}
	/**
	* Parses a JSON string from a byte array into Lex values.
	*/
	function lexParseJsonBytes(bytes, options) {
		return lexParse((0, lex_data_1.utf8FromBytes)(bytes), options);
	}
	/**
	* Converts a parsed JSON representation of Lexicon value to a {@link LexValue}.
	*
	* This function transforms already-parsed JSON objects into Lex values by
	* decoding AT Protocol special types:
	* - `{$link: string}` objects are converted to `Cid` instances
	* - `{$bytes: string}` objects are converted to `Uint8Array` instances
	*
	* Use this when you have a JavaScript object (e.g., from `JSON.parse()`) and
	* need to convert it to the Lex data model. For parsing JSON strings directly,
	* use {@link lexParse} instead.
	*
	* @param value - The JSON value to convert
	* @param options - Parsing options (e.g., strict mode)
	* @returns The converted Lex value
	* @throws {TypeError} If strict mode is enabled and invalid Lex values are found
	* @throws {TypeError} If the value contains unsupported types (e.g., undefined at top level)
	*
	* @example
	* ```typescript
	* import { jsonToLex } from '@atproto/lex'
	*
	* // Convert parsed JSON to Lex values
	* const lex = jsonToLex({
	*   ref: { $link: 'bafyrei...' },  // Converted to Cid
	*   data: { $bytes: 'SGVsbG8sIHdvcmxkIQ==' }  // Converted to Uint8Array
	* })
	* ```
	*/
	function jsonToLex(value, options = { strict: false }) {
		switch (typeof value) {
			case "object":
				if (value === null) return null;
				if (Array.isArray(value)) return jsonArrayToLex(value, options);
				return parseSpecialJsonObject(value, options) ?? jsonObjectToLexMap(value, options);
			case "number":
				if (Number.isSafeInteger(value)) return value;
				if (options.strict === false) return value;
				throw new TypeError(`Invalid non-integer number: ${value}`);
			case "boolean":
			case "string": return value;
			default: throw new TypeError(`Invalid JSON value: ${typeof value}`);
		}
	}
	function jsonArrayToLex(input, options) {
		let copy;
		for (let i = 0; i < input.length; i++) {
			const inputItem = input[i];
			const item = jsonToLex(inputItem, options);
			if (item !== inputItem) {
				copy ?? (copy = Array.from(input));
				copy[i] = item;
			}
		}
		return copy ?? input;
	}
	function jsonObjectToLexMap(input, options) {
		let copy = void 0;
		for (const [key, jsonValue] of Object.entries(input)) {
			if (key === "__proto__") throw new TypeError("Invalid key: __proto__");
			if (jsonValue === void 0) {
				copy ?? (copy = { ...input });
				delete copy[key];
				continue;
			}
			const value = jsonToLex(jsonValue, options);
			if (value !== jsonValue) {
				copy ?? (copy = { ...input });
				copy[key] = value;
			}
		}
		return copy ?? input;
	}
	/**
	* Converts a Lex value to a JSON-compatible value.
	*
	* This function transforms Lex data model values into plain JavaScript objects
	* suitable for JSON serialization:
	* - `Cid` instances are converted to `{$link: string}` objects
	* - `Uint8Array` instances are converted to `{$bytes: string}` objects (base64)
	*
	* Use this when you need to convert Lex values to plain objects (e.g., for
	* custom serialization or inspection). For direct JSON string output, use
	* {@link lexStringify} instead.
	*
	* @param value - The Lex value to convert
	* @returns The JSON-compatible value
	* @throws {TypeError} If the value contains unsupported types
	*
	* @example
	* ```typescript
	* import { lexToJson } from '@atproto/lex'
	*
	* // Convert Lex values to JSON-compatible objects
	* const obj = lexToJson({
	*   ref: someCid,      // Converted to { $link: string }
	*   data: someBytes    // Converted to { $bytes: string }
	* })
	* ```
	*/
	function lexToJson(value) {
		switch (typeof value) {
			case "object": if (value === null) return value;
			else if (Array.isArray(value)) return lexArrayToJson(value);
			else if ((0, lex_data_1.isCid)(value)) return (0, link_js_1.encodeLexLink)(value);
			else if (ArrayBuffer.isView(value)) return (0, bytes_js_1.encodeLexBytes)(value);
			else return encodeLexMap(value);
			case "boolean":
			case "string":
			case "number": return value;
			default: throw new TypeError(`Invalid Lex value: ${typeof value}`);
		}
	}
	function lexArrayToJson(input) {
		let copy;
		for (let i = 0; i < input.length; i++) {
			const inputItem = input[i];
			const item = lexToJson(inputItem);
			if (item !== inputItem) {
				copy ?? (copy = Array.from(input));
				copy[i] = item;
			}
		}
		return copy ?? input;
	}
	function encodeLexMap(input) {
		let copy = void 0;
		for (const [key, lexValue] of Object.entries(input)) {
			if (key === "__proto__") throw new TypeError("Invalid key: __proto__");
			if (lexValue === void 0) {
				copy ?? (copy = { ...input });
				delete copy[key];
				continue;
			}
			const jsonValue = lexToJson(lexValue);
			if (jsonValue !== lexValue) {
				copy ?? (copy = { ...input });
				copy[key] = jsonValue;
			}
		}
		return copy ?? input;
	}
	/**
	* @internal
	*/
	function parseSpecialJsonObject(input, options) {
		if (input.$link !== void 0) {
			const cid = (0, link_js_1.parseLexLink)(input);
			if (cid) return cid;
			if (options.strict) throw new TypeError(`Invalid $link object`);
		} else if (input.$bytes !== void 0) {
			const bytes = (0, bytes_js_1.parseLexBytes)(input);
			if (bytes) return bytes;
			if (options.strict) throw new TypeError(`Invalid $bytes object`);
		} else if (input.$type !== void 0) {
			if (options.strict) {
				if (input.$type === "blob") {
					const blob = (0, blob_js_1.parseTypedBlobRef)(input, options);
					if (blob) return blob;
					throw new TypeError(`Invalid blob object`);
				} else if (typeof input.$type !== "string") throw new TypeError(`Invalid $type property (${typeof input.$type})`);
				else if (input.$type.length === 0) throw new TypeError(`Empty $type property`);
			}
		}
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lex-json/dist/index.js
var require_dist$14 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_bytes$3(), exports);
	tslib_1.__exportStar(require_json$2(), exports);
	tslib_1.__exportStar(require_lex_json$2(), exports);
	tslib_1.__exportStar(require_link$2(), exports);
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/ipld.js
var require_ipld = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ipldEquals = exports.ipldToJson = exports.jsonToIpld = void 0;
	var lex_data_1 = require_dist$15();
	var lex_json_1 = require_dist$14();
	/**
	* Converts a JSON-compatible value to an IPLD-compatible value.
	* @deprecated Use {@link jsonToLex} from `@atproto/lex-cbor` instead.
	*/
	var jsonToIpld = (val) => {
		return (0, lex_json_1.jsonToLex)(val, { strict: false });
	};
	exports.jsonToIpld = jsonToIpld;
	/**
	* Converts an IPLD-compatible value to a JSON-compatible value.
	* @deprecated Use {@link lexToJson} from `@atproto/lex-cbor` instead.
	*/
	var ipldToJson = (val) => {
		if (val === void 0) return val;
		if (Number.isNaN(val)) return val;
		return (0, lex_json_1.lexToJson)(val);
	};
	exports.ipldToJson = ipldToJson;
	/**
	* Compares two IPLD-compatible values for deep equality.
	* @deprecated Use {@link lexEquals} from `@atproto/lex-cbor` instead.
	*/
	var ipldEquals = (a, b) => {
		if (!(0, lex_data_1.lexEquals)(a, b)) return false;
		if (Number.isNaN(a)) return false;
		return true;
	};
	exports.ipldEquals = ipldEquals;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/retry.js
var require_retry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.retry = retry;
	exports.createRetryable = createRetryable;
	exports.backoffMs = backoffMs;
	var util_1 = require_util$3();
	async function retry(fn, opts = {}) {
		const { maxRetries = 3, retryable = () => true, getWaitMs = backoffMs } = opts;
		let retries = 0;
		let doneError;
		while (!doneError) try {
			return await fn();
		} catch (err) {
			const waitMs = getWaitMs(retries);
			if (retries < maxRetries && waitMs !== null && retryable(err)) {
				retries += 1;
				if (waitMs !== 0) await (0, util_1.wait)(waitMs);
			} else doneError = err;
		}
		throw doneError;
	}
	function createRetryable(retryable) {
		return async (fn, opts) => retry(fn, {
			...opts,
			retryable
		});
	}
	function backoffMs(n, multiplier = 100, max = 1e3) {
		const exponentialMs = Math.pow(2, n) * multiplier;
		return jitter(Math.min(exponentialMs, max));
	}
	function jitter(value) {
		const delta = value * .15;
		return value + randomRange(-delta, delta);
	}
	function randomRange(from, to) {
		return Math.random() * (to - from) + from;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/types.js
var require_types$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.def = exports.schema = void 0;
	var zod_1 = require_zod();
	var lex_data_1 = require_dist$15();
	var cidSchema = zod_1.z.unknown().transform((obj, ctx) => {
		const cid = lex_data_1.CID.asCID(obj);
		if (cid == null) {
			ctx.addIssue({
				code: zod_1.z.ZodIssueCode.custom,
				message: "Not a valid CID"
			});
			return zod_1.z.NEVER;
		}
		return cid;
	});
	exports.schema = {
		cid: cidSchema,
		carHeader: zod_1.z.object({
			version: zod_1.z.literal(1),
			roots: zod_1.z.array(cidSchema)
		}),
		bytes: zod_1.z.instanceof(Uint8Array),
		string: zod_1.z.string(),
		array: zod_1.z.array(zod_1.z.unknown()),
		map: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
		unknown: zod_1.z.unknown()
	};
	exports.def = {
		cid: {
			name: "cid",
			schema: exports.schema.cid
		},
		carHeader: {
			name: "CAR header",
			schema: exports.schema.carHeader
		},
		bytes: {
			name: "bytes",
			schema: exports.schema.bytes
		},
		string: {
			name: "string",
			schema: exports.schema.string
		},
		map: {
			name: "map",
			schema: exports.schema.map
		},
		unknown: {
			name: "unknown",
			schema: exports.schema.unknown
		}
	};
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/times.js
var require_times = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.addHoursToDate = exports.lessThanAgoMs = exports.DAY = exports.HOUR = exports.MINUTE = exports.SECOND = void 0;
	exports.SECOND = 1e3;
	exports.MINUTE = exports.SECOND * 60;
	exports.HOUR = exports.MINUTE * 60;
	exports.DAY = exports.HOUR * 24;
	var lessThanAgoMs = (time, range) => {
		return Date.now() < time.getTime() + range;
	};
	exports.lessThanAgoMs = lessThanAgoMs;
	var addHoursToDate = (hours, startingDate) => {
		const currentDate = startingDate ? new Date(startingDate) : /* @__PURE__ */ new Date();
		currentDate.setHours(currentDate.getHours() + hours);
		return currentDate;
	};
	exports.addHoursToDate = addHoursToDate;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/did.js
var require_did$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDidError = void 0;
	exports.ensureValidDid = ensureValidDid;
	exports.ensureValidDidRegex = ensureValidDidRegex;
	exports.isValidDid = isValidDid;
	function ensureValidDid(input) {
		if (!input.startsWith("did:")) throw new InvalidDidError("DID requires \"did:\" prefix");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
		if (input.endsWith(":") || input.endsWith("%")) throw new InvalidDidError("DID can not end with \":\" or \"%\"");
		if (!/^[a-zA-Z0-9._:%-]*$/.test(input)) throw new InvalidDidError("Disallowed characters in DID (ASCII letters, digits, and a couple other characters only)");
		const { length, 1: method } = input.split(":");
		if (length < 3) throw new InvalidDidError("DID requires prefix, method, and method-specific content");
		if (!/^[a-z]+$/.test(method)) throw new InvalidDidError("DID method must be lower-case letters");
	}
	var DID_REGEX = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
	function ensureValidDidRegex(input) {
		if (!DID_REGEX.test(input)) throw new InvalidDidError("DID didn't validate via regex");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
	}
	function isValidDid(input) {
		return input.length <= 2048 && DID_REGEX.test(input);
	}
	var InvalidDidError = class extends Error {};
	exports.InvalidDidError = InvalidDidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/handle.js
var require_handle$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DisallowedDomainError = exports.UnsupportedDomainError = exports.ReservedHandleError = exports.InvalidHandleError = exports.DISALLOWED_TLDS = exports.INVALID_HANDLE = void 0;
	exports.ensureValidHandle = ensureValidHandle;
	exports.ensureValidHandleRegex = ensureValidHandleRegex;
	exports.normalizeHandle = normalizeHandle;
	exports.normalizeAndEnsureValidHandle = normalizeAndEnsureValidHandle;
	exports.isValidHandle = isValidHandle;
	exports.isValidTld = isValidTld;
	exports.INVALID_HANDLE = "handle.invalid";
	exports.DISALLOWED_TLDS = [
		".local",
		".arpa",
		".invalid",
		".localhost",
		".internal",
		".example",
		".alt",
		".onion"
	];
	function ensureValidHandle(input) {
		if (!/^[a-zA-Z0-9.-]*$/.test(input)) throw new InvalidHandleError("Disallowed characters in handle (ASCII letters, digits, dashes, periods only)");
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		const labels = input.split(".");
		if (labels.length < 2) throw new InvalidHandleError("Handle domain needs at least two parts");
		for (let i = 0; i < labels.length; i++) {
			const l = labels[i];
			if (l.length < 1) throw new InvalidHandleError("Handle parts can not be empty");
			if (l.length > 63) throw new InvalidHandleError("Handle part too long (max 63 chars)");
			if (l.endsWith("-") || l.startsWith("-")) throw new InvalidHandleError("Handle parts can not start or end with hyphens");
			if (i + 1 === labels.length && !/^[a-zA-Z]/.test(l)) throw new InvalidHandleError("Handle final component (TLD) must start with ASCII letter");
		}
	}
	var HANDLE_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
	function ensureValidHandleRegex(input) {
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		if (!HANDLE_REGEX.test(input)) throw new InvalidHandleError("Handle didn't validate via regex");
	}
	function normalizeHandle(handle) {
		return handle.toLowerCase();
	}
	function normalizeAndEnsureValidHandle(handle) {
		const normalized = normalizeHandle(handle);
		ensureValidHandle(normalized);
		return normalized;
	}
	function isValidHandle(input) {
		return input.length <= 253 && HANDLE_REGEX.test(input);
	}
	function isValidTld(handle) {
		for (const tld of exports.DISALLOWED_TLDS) if (handle.endsWith(tld)) return false;
		return true;
	}
	var InvalidHandleError = class extends Error {};
	exports.InvalidHandleError = InvalidHandleError;
	/** @deprecated Never used */
	var ReservedHandleError = class extends Error {};
	exports.ReservedHandleError = ReservedHandleError;
	/** @deprecated Never used */
	var UnsupportedDomainError = class extends Error {};
	exports.UnsupportedDomainError = UnsupportedDomainError;
	/** @deprecated Never used */
	var DisallowedDomainError = class extends Error {};
	exports.DisallowedDomainError = DisallowedDomainError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/at-identifier.js
var require_at_identifier$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isHandleIdentifier = isHandleIdentifier;
	exports.isDidIdentifier = isDidIdentifier;
	exports.assertAtIdentifierString = assertAtIdentifierString;
	exports.ensureValidAtIdentifier = assertAtIdentifierString;
	exports.asAtIdentifierString = asAtIdentifierString;
	exports.isAtIdentifierString = isAtIdentifierString;
	exports.isValidAtIdentifier = isAtIdentifierString;
	exports.ifAtIdentifierString = ifAtIdentifierString;
	var did_js_1 = require_did$2();
	var handle_js_1 = require_handle$2();
	/**
	* Discriminates {@link HandleString} from a valid {@link AtIdentifierString}.
	*
	* @return `true` if the identifier is a handle, `false` otherwise
	*/
	function isHandleIdentifier(id) {
		return !isDidIdentifier(id);
	}
	/**
	* Discriminates {@link DidString} from a valid {@link AtIdentifierString}.
	*
	* @return `true` if the identifier is a DID, `false` otherwise
	*/
	function isDidIdentifier(id) {
		return id.startsWith("did:");
	}
	/**
	* Validates that a string is a valid {@link AtIdentifierString} format string,
	* throwing an error if it is not.
	*
	* @throws InvalidHandleError if the input string does not meet the atproto 'datetime' format requirements.
	* @see {@link AtIdentifierString}
	*/
	function assertAtIdentifierString(input) {
		try {
			if (!input || typeof input !== "string") throw new TypeError("Identifier must be a non-empty string");
			else if (input.startsWith("did:")) (0, did_js_1.ensureValidDidRegex)(input);
			else (0, handle_js_1.ensureValidHandleRegex)(input);
		} catch (cause) {
			throw new handle_js_1.InvalidHandleError("Invalid DID or handle", { cause });
		}
	}
	/**
	* Casts a string to a {@link AtIdentifierString} if it is a valid at-identifier
	* string, throwing an error if it is not.
	*
	* @throws InvalidHandleError if the input string does not meet the atproto 'at-identifier' format requirements.
	* @see {@link AtIdentifierString}
	*/
	function asAtIdentifierString(input) {
		assertAtIdentifierString(input);
		return input;
	}
	/**
	* Type guard that checks if a value is a valid AT identifier (DID or handle).
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid AT identifier
	* @see {@link AtIdentifierString}
	*/
	function isAtIdentifierString(input) {
		if (!input || typeof input !== "string") return false;
		else if (input.startsWith("did:")) return (0, did_js_1.isValidDid)(input);
		else return (0, handle_js_1.isValidHandle)(input);
	}
	/**
	* Returns the input if it is a valid {@link AtIdentifierString} format string, or
	* `undefined` if it is not.
	*
	* @see {@link AtIdentifierString}
	*/
	function ifAtIdentifierString(input) {
		return isAtIdentifierString(input) ? input : void 0;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/lib/result.js
var require_result$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.success = success;
	exports.failure = failure;
	function success(value) {
		return {
			success: true,
			value
		};
	}
	function failure(message) {
		return {
			success: false,
			message
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/nsid.js
var require_nsid$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidNsidError = exports.NSID = void 0;
	exports.ensureValidNsid = ensureValidNsid;
	exports.parseNsid = parseNsid;
	exports.isValidNsid = isValidNsid;
	exports.validateNsid = validateNsid;
	exports.ensureValidNsidRegex = ensureValidNsidRegex;
	exports.validateNsidRegex = validateNsidRegex;
	var result_js_1 = require_result$2();
	exports.NSID = class NSID {
		segments;
		static parse(input) {
			return new NSID(input);
		}
		static create(authority, name) {
			const input = [...authority.split(".").reverse(), name].join(".");
			return new NSID(input);
		}
		static isValid(nsid) {
			return isValidNsid(nsid);
		}
		static from(input) {
			if (input instanceof NSID) return input;
			if (Array.isArray(input)) return new NSID(input.join("."));
			return new NSID(String(input));
		}
		constructor(nsid) {
			this.segments = parseNsid(nsid);
		}
		get authority() {
			return this.segments.slice(0, this.segments.length - 1).reverse().join(".");
		}
		get name() {
			return this.segments.at(this.segments.length - 1);
		}
		toString() {
			return this.segments.join(".");
		}
	};
	function ensureValidNsid(input) {
		const result = validateNsid(input);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	function parseNsid(nsid) {
		const result = validateNsid(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
		return result.value;
	}
	function isValidNsid(input) {
		return validateNsidRegex(input).success;
	}
	function validateNsid(input) {
		if (input.length > 317) return (0, result_js_1.failure)("NSID is too long (317 chars max)");
		if (hasDisallowedCharacters(input)) return (0, result_js_1.failure)("Disallowed characters in NSID (ASCII letters, digits, dashes, periods only)");
		const segments = input.split(".");
		if (segments.length < 3) return (0, result_js_1.failure)("NSID needs at least three parts");
		for (const l of segments) {
			if (l.length < 1) return (0, result_js_1.failure)("NSID parts can not be empty");
			if (l.length > 63) return (0, result_js_1.failure)("NSID part too long (max 63 chars)");
			if (startsWithHyphen(l) || endsWithHyphen(l)) return (0, result_js_1.failure)("NSID parts can not start or end with hyphen");
		}
		if (startsWithNumber(segments[0])) return (0, result_js_1.failure)("NSID first part may not start with a digit");
		if (!isValidIdentifier(segments[segments.length - 1])) return (0, result_js_1.failure)("NSID name part must be only letters and digits (and no leading digit)");
		return (0, result_js_1.success)(segments);
	}
	function hasDisallowedCharacters(v) {
		return !/^[a-zA-Z0-9.-]*$/.test(v);
	}
	function startsWithNumber(v) {
		const charCode = v.charCodeAt(0);
		return charCode >= 48 && charCode <= 57;
	}
	function startsWithHyphen(v) {
		return v.charCodeAt(0) === 45;
	}
	function endsWithHyphen(v) {
		return v.charCodeAt(v.length - 1) === 45;
	}
	function isValidIdentifier(v) {
		return !startsWithNumber(v) && !v.includes("-");
	}
	/**
	* @deprecated Use {@link ensureValidNsid} if you care about error details,
	* {@link parseNsid}/{@link NSID.parse} if you need the parsed segments, or
	* {@link isValidNsid} if you just want a boolean.
	*/
	function ensureValidNsidRegex(nsid) {
		const result = validateNsidRegex(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	/**
	* Regexp based validation that behaves identically to the previous code but
	* provides less detailed error messages (while being 20% to 50% faster).
	*/
	function validateNsidRegex(value) {
		if (value.length > 317) return (0, result_js_1.failure)("NSID is too long (317 chars max)");
		if (value.length < 5 || !/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(value)) return (0, result_js_1.failure)("NSID didn't validate via regex");
		return (0, result_js_1.success)(value);
	}
	var InvalidNsidError = class extends Error {};
	exports.InvalidNsidError = InvalidNsidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/recordkey.js
var require_recordkey$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidRecordKeyError = void 0;
	exports.ensureValidRecordKey = ensureValidRecordKey;
	exports.isValidRecordKey = isValidRecordKey;
	var RECORD_KEY_MAX_LENGTH = 512;
	var RECORD_KEY_MIN_LENGTH = 1;
	var RECORD_KEY_INVALID_VALUES = /* @__PURE__ */ new Set([".", ".."]);
	var RECORD_KEY_REGEX = /^[a-zA-Z0-9_~.:-]{1,512}$/;
	function ensureValidRecordKey(input) {
		if (input.length > RECORD_KEY_MAX_LENGTH || input.length < RECORD_KEY_MIN_LENGTH) throw new InvalidRecordKeyError(`record key must be ${RECORD_KEY_MIN_LENGTH} to ${RECORD_KEY_MAX_LENGTH} characters`);
		if (RECORD_KEY_INVALID_VALUES.has(input)) throw new InvalidRecordKeyError("record key can not be \".\" or \"..\"");
		if (!RECORD_KEY_REGEX.test(input)) throw new InvalidRecordKeyError("record key syntax not valid (regex)");
	}
	function isValidRecordKey(input) {
		return input.length >= RECORD_KEY_MIN_LENGTH && input.length <= RECORD_KEY_MAX_LENGTH && RECORD_KEY_REGEX.test(input) && !RECORD_KEY_INVALID_VALUES.has(input);
	}
	var InvalidRecordKeyError = class extends Error {};
	exports.InvalidRecordKeyError = InvalidRecordKeyError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/aturi_validation.js
var require_aturi_validation$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidAtUriError = void 0;
	exports.isAtUriString = isAtUriString;
	exports.ifAtUriString = ifAtUriString;
	exports.asAtUriString = asAtUriString;
	exports.assertAtUriString = assertAtUriString;
	exports.ensureValidAtUri = ensureValidAtUri;
	exports.ensureValidAtUriRegex = ensureValidAtUriRegex;
	exports.isValidAtUri = isValidAtUri;
	exports.parseAtUriString = parseAtUriString;
	var at_identifier_js_1 = require_at_identifier$2();
	var result_js_1 = require_result$2();
	var nsid_js_1 = require_nsid$2();
	var recordkey_js_1 = require_recordkey$2();
	/**
	* Type guard that checks if a value is a valid {@link AtUriString}
	*
	* @see {@link AtUriString}
	*/
	function isAtUriString(input, options) {
		return parseAtUriString(input, options).success;
	}
	/**
	* Returns the input if it is a valid {@link AtUriString} format string, or
	* `undefined` if it is not.
	*
	* @see {@link AtUriString}
	*/
	function ifAtUriString(input, options) {
		return isAtUriString(input, options) ? input : void 0;
	}
	/**
	* Casts a string to an {@link AtUriString} if it is a valid AT URI format
	* string, throwing an error if it is not.
	*
	* @throws InvalidAtUriError if the input string does not meet the atproto AT URI format requirements.
	* @see {@link AtUriString}
	*/
	function asAtUriString(input, options) {
		assertAtUriString(input, options);
		return input;
	}
	/**
	* Assert the validity of an {@link AtUriString}, throwing an error if the
	* {@link input} is not a valid AT URI.
	*
	* @throws InvalidAtUriError if the {@link input} is not a valid {@link AtUriString}
	*/
	function assertAtUriString(input, options) {
		const result = parseAtUriString(input, options);
		if (!result.success) throw new InvalidAtUriError(result.message);
	}
	/**
	* Assert the **non-strict** validity of an {@link AtUriString}, throwing a
	* detailed error if the {@link input} is not a valid AT URI.
	*
	* @throws InvalidAtUriError if the {@link input} is not a valid {@link AtUriString}
	* @deprecated use {@link assertAtUriString} with `{ strict: false }` option instead
	*/
	function ensureValidAtUri(input) {
		assertAtUriString(input, {
			strict: false,
			detailed: true
		});
	}
	/**
	* Assert the (non-strict!) validity of an {@link AtUriString}, throwing an
	* error if the {@link input} is not a valid AT URI.
	*
	* @throws InvalidAtUriError if the {@link input} is not a valid {@link AtUriString}
	* @deprecated use {@link assertAtUriString} with `{ strict: false }` option instead
	*/
	function ensureValidAtUriRegex(input) {
		assertAtUriString(input, {
			strict: false,
			detailed: false
		});
	}
	/**
	* Type guard that checks if a value is a valid {@link AtUriString} format
	* string, without enforcing strict record key validation. This is useful for
	* cases where you want to allow a wider range of valid ATURIs, such as when
	* validating user input or when the record key is not relevant.
	*
	* @deprecated use {@link isAtUriString} with `{ strict: false }` option instead
	*/
	function isValidAtUri(input) {
		return isAtUriString(input, { strict: false });
	}
	var InvalidAtUriError = class extends Error {};
	exports.InvalidAtUriError = InvalidAtUriError;
	var INVALID_CHAR_REGEXP = /[^a-zA-Z0-9._~:@!$&'()*+,;=%/\\[\]#?-]/;
	var AT_URI_REGEXP = /^(?<uri>at:\/\/(?<authority>[^/?#\s]+)(?:\/(?<collection>[^/?#\s]+)(?:\/(?<rkey>[^/?#\s]+))?)?(?<trailingSlash>\/)?)(?:\?(?<query>[^#\s]*))?(?:#(?<hash>[^\s]*))?$/;
	/**
	* Parses a valid {@link AtUriString} into a {@link AtUriParts} object, or
	* returns a failure with a detailed error message if the string is not a valid
	* {@link AtUriString}.
	*/
	function parseAtUriString(input, options) {
		if (typeof input !== "string") return (0, result_js_1.failure)("ATURI must be a string");
		if (input.length > 8192) return (0, result_js_1.failure)("ATURI exceeds maximum length");
		if (input.match(INVALID_CHAR_REGEXP)) return (0, result_js_1.failure)("Disallowed characters in ATURI (ASCII)");
		const groups = input.match(AT_URI_REGEXP)?.groups;
		if (!groups) {
			if (options?.detailed) {
				if (!input.startsWith("at://")) return (0, result_js_1.failure)("ATURI must start with \"at://\"");
				if (input.includes(" ")) return (0, result_js_1.failure)("ATURI can not contain spaces");
				if (input.includes("//", 5)) return (0, result_js_1.failure)("ATURI can not have empty path segments");
				const pathStart = input.indexOf("/", 5);
				if (pathStart !== -1) {
					const fragmentIndex = input.indexOf("#");
					const pathEnd = fragmentIndex !== -1 ? fragmentIndex : input.length;
					const secondSlash = input.indexOf("/", pathStart + 1);
					if (secondSlash !== -1 && secondSlash !== pathEnd - 1) return (0, result_js_1.failure)("ATURI can not have more than two path segments");
				}
			}
			return (0, result_js_1.failure)("ATURI does not match expected format");
		}
		if (!(0, at_identifier_js_1.isAtIdentifierString)(groups.authority)) return (0, result_js_1.failure)("ATURI has invalid authority");
		if (groups.collection != null && !(0, nsid_js_1.isValidNsid)(groups.collection)) return (0, result_js_1.failure)("ATURI has invalid collection");
		if (groups.hash != null) {
			const result = parseJsonPointer(groups.hash, options);
			if (result.success) groups.hash = result.value;
			else return (0, result_js_1.failure)(`ATURI has invalid fragment (${result.message})`);
		}
		if (options?.strict !== false) {
			if (groups.trailingSlash != null) return (0, result_js_1.failure)("ATURI can not have a trailing slash");
			if (groups.query != null) return (0, result_js_1.failure)("ATURI query part is not allowed");
			if (groups.rkey != null && !(0, recordkey_js_1.isValidRecordKey)(groups.rkey)) return (0, result_js_1.failure)("ATURI has invalid record key");
		}
		return (0, result_js_1.success)(groups);
	}
	var BASIC_JSON_POINTER_REGEXP = /^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/;
	/**
	* Checks if a string is a valid JSON pointer (RFC-6901) with the allowed chars
	* for ATURI fragments. This is a very loose validation that only checks the
	* basic syntax and charset.
	*/
	function parseJsonPointer(value, options) {
		if (!BASIC_JSON_POINTER_REGEXP.test(value)) return (0, result_js_1.failure)("Invalid JSON pointer");
		const result = parsePercentEncoding(value);
		if (!result.success && options?.strict === false) return (0, result_js_1.success)(value);
		return result;
	}
	function parsePercentEncoding(value) {
		try {
			return (0, result_js_1.success)(decodeURIComponent(value));
		} catch {
			return (0, result_js_1.failure)("Invalid percent-encoding");
		}
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/aturi.js
var require_aturi$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AtUri = exports.ATP_URI_REGEX = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var at_identifier_js_1 = require_at_identifier$2();
	var did_js_1 = require_did$2();
	var nsid_js_1 = require_nsid$2();
	var recordkey_js_1 = require_recordkey$2();
	tslib_1.__exportStar(require_aturi_validation$2(), exports);
	exports.ATP_URI_REGEX = /^(at:\/\/)?((?:did:[a-z0-9:%-]+)|(?:[a-z0-9][a-z0-9.:-]*))(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	var RELATIVE_REGEX = /^(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	exports.AtUri = class AtUri {
		hash;
		host;
		pathname;
		searchParams;
		constructor(uri, base) {
			const parsed = base !== void 0 ? typeof base === "string" ? Object.assign(parse(base), parseRelative(uri)) : Object.assign({ host: base.host }, parseRelative(uri)) : parse(uri);
			(0, at_identifier_js_1.ensureValidAtIdentifier)(parsed.host);
			this.hash = parsed.hash ?? "";
			this.host = parsed.host;
			this.pathname = parsed.pathname ?? "";
			this.searchParams = parsed.searchParams;
		}
		static make(handleOrDid, collection, rkey) {
			let str = handleOrDid;
			if (collection) str += "/" + collection;
			if (rkey) str += "/" + rkey;
			return new AtUri(str);
		}
		get protocol() {
			return "at:";
		}
		get origin() {
			return `at://${this.host}`;
		}
		get did() {
			const { host } = this;
			if ((0, at_identifier_js_1.isDidIdentifier)(host)) return host;
			throw new did_js_1.InvalidDidError(`AtUri "${this}" does not have a DID hostname`);
		}
		get hostname() {
			return this.host;
		}
		set hostname(v) {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(v);
			this.host = v;
		}
		get search() {
			return this.searchParams.toString();
		}
		set search(v) {
			this.searchParams = new URLSearchParams(v);
		}
		get collection() {
			return this.pathname.split("/").filter(Boolean)[0] || "";
		}
		get collectionSafe() {
			const { collection } = this;
			(0, nsid_js_1.ensureValidNsid)(collection);
			return collection;
		}
		set collection(v) {
			(0, nsid_js_1.ensureValidNsid)(v);
			this.unsafelySetCollection(v);
		}
		unsafelySetCollection(v) {
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] = v;
			this.pathname = parts.join("/");
		}
		get rkey() {
			return this.pathname.split("/").filter(Boolean)[1] || "";
		}
		get rkeySafe() {
			const { rkey } = this;
			(0, recordkey_js_1.ensureValidRecordKey)(rkey);
			return rkey;
		}
		set rkey(v) {
			(0, recordkey_js_1.ensureValidRecordKey)(v);
			this.unsafelySetRkey(v);
		}
		unsafelySetRkey(v) {
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] ||= "undefined";
			parts[1] = v;
			this.pathname = parts.join("/");
		}
		get href() {
			return this.toString();
		}
		toString() {
			let pathname = this.pathname;
			if (pathname && !pathname.startsWith("/")) pathname = `/${pathname}`;
			while (pathname.endsWith("/")) pathname = pathname.slice(0, -1);
			let qs = "";
			if (this.searchParams.size) qs = `?${this.searchParams.toString()}`;
			let fragment = this.hash;
			if (fragment === "#") fragment = "";
			else if (fragment && !fragment.startsWith("#")) fragment = `#${fragment}`;
			return `at://${this.host}${pathname}${qs}${fragment}`;
		}
	};
	function parse(str) {
		const match = str.match(exports.ATP_URI_REGEX);
		if (!match) throw new Error(`Invalid AT uri: ${str}`);
		return {
			host: match[2],
			hash: match[5],
			pathname: match[3],
			searchParams: new URLSearchParams(match[4])
		};
	}
	function parseRelative(str) {
		const match = str.match(RELATIVE_REGEX);
		if (!match) throw new Error(`Invalid path: ${str}`);
		return {
			hash: match[3],
			pathname: match[1],
			searchParams: new URLSearchParams(match[2])
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/datetime.js
var require_datetime$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDatetimeError = void 0;
	exports.assertAtprotoDate = assertAtprotoDate;
	exports.asAtprotoDate = asAtprotoDate;
	exports.isAtprotoDate = isAtprotoDate;
	exports.ifAtprotoDate = ifAtprotoDate;
	exports.assertDatetimeString = assertDatetimeString;
	exports.ensureValidDatetime = assertDatetimeString;
	exports.asDatetimeString = asDatetimeString;
	exports.isDatetimeString = isDatetimeString;
	exports.isValidDatetime = isDatetimeString;
	exports.ifDatetimeString = ifDatetimeString;
	exports.currentDatetimeString = currentDatetimeString;
	exports.toDatetimeString = toDatetimeString;
	exports.normalizeDatetime = normalizeDatetime;
	exports.normalizeDatetimeAlways = normalizeDatetimeAlways;
	/**
	* Indicates a date or string is not a valid representation of a datetime
	* according to the atproto
	* {@link https://atproto.com/specs/lexicon#datetime specification}.
	*/
	var InvalidDatetimeError = class extends Error {};
	exports.InvalidDatetimeError = InvalidDatetimeError;
	/**
	* @see {@link AtprotoDate}
	*/
	function assertAtprotoDate(date) {
		const res = parseDate(date);
		if (!res.success) throw new InvalidDatetimeError(res.message);
	}
	/**
	* @see {@link AtprotoDate}
	*/
	function asAtprotoDate(date) {
		assertAtprotoDate(date);
		return date;
	}
	/**
	* @see {@link AtprotoDate}
	*/
	function isAtprotoDate(date) {
		return parseDate(date).success;
	}
	/**
	* @see {@link AtprotoDate}
	*/
	function ifAtprotoDate(date) {
		return isAtprotoDate(date) ? date : void 0;
	}
	/**
	* Validates that a string is a valid {@link DatetimeString} format string,
	* throwing an error if it is not.
	*
	* @throws InvalidDatetimeError if the input string does not meet the atproto 'datetime' format requirements.
	* @see {@link DatetimeString}
	*/
	function assertDatetimeString(input) {
		const result = parseString(input);
		if (!result.success) throw new InvalidDatetimeError(result.message);
	}
	/**
	* Casts a string to a {@link DatetimeString} if it is a valid datetime format
	* string, throwing an error if it is not.
	*
	* @throws InvalidDatetimeError if the input string does not meet the atproto 'datetime' format requirements.
	* @see {@link DatetimeString}
	*/
	function asDatetimeString(input) {
		assertDatetimeString(input);
		return input;
	}
	/**
	* Checks if a string is a valid {@link DatetimeString} format string.
	*
	* @see {@link DatetimeString}
	*/
	function isDatetimeString(input) {
		return parseString(input).success;
	}
	/**
	* Returns the input if it is a valid {@link DatetimeString} format string, or
	* `undefined` if it is not.
	*
	* @see {@link DatetimeString}
	*/
	function ifDatetimeString(input) {
		return isDatetimeString(input) ? input : void 0;
	}
	/**
	* Returns the current date and time as a {@link DatetimeString}.
	*
	* @see {@link DatetimeString}
	*/
	function currentDatetimeString() {
		return toDatetimeString(/* @__PURE__ */ new Date());
	}
	/**
	* Converts any {@link Date} into a {@link DatetimeString} if possible, throwing
	* an error if the date is not a valid atproto datetime.
	*
	* This is short-hand for `asAtprotoDate(date).toISOString()`.
	*
	* @throws InvalidDatetimeError if the input date is not a valid atproto datetime (eg, it is too far in the future or past, or it normalizes to a negative year).
	* @see {@link DatetimeString}
	*/
	function toDatetimeString(date) {
		return asAtprotoDate(date).toISOString();
	}
	/**
	* Takes a flexible datetime string and normalizes its representation.
	*
	* This function will work with any valid value that can be parsed as a date. It
	* *additionally* is more flexible about accepting datetimes that are missing
	* timezone information, and normalizing them to a valid atproto datetime.
	*
	* One use-case is a consistent, sortable string. Another is to work with older
	* invalid createdAt datetimes.
	*
	* @note This function might return different normalized strings for the same
	* input depending on the timezone of the machine it is run on, since it will
	* attempt to parse the input "as is" if it fails to parse with an explicit
	* timezone.
	*
	* @returns ISODatetimeString - a valid atproto datetime with millisecond precision (3 sub-second digits) and UTC timezone with trailing 'Z' syntax.
	* @throws InvalidDatetimeError - if the input string could not be parsed as a datetime, even with permissive parsing.
	*/
	function normalizeDatetime(dtStr) {
		if (/[+-]\d\d:?\d\d/.test(dtStr) || /\dZ\b/.test(dtStr) || /\b[A-Z]{3,4}\b/.test(dtStr)) {
			const date = new Date(dtStr);
			if (isAtprotoDate(date)) return date.toISOString();
		} else {
			const dateZ = /* @__PURE__ */ new Date(`${dtStr}Z`);
			if (isAtprotoDate(dateZ)) return dateZ.toISOString();
			const dateUTC = /* @__PURE__ */ new Date(`${dtStr} UTC`);
			if (isAtprotoDate(dateUTC)) return dateUTC.toISOString();
			const date = new Date(dtStr);
			if (isAtprotoDate(date)) return date.toISOString();
		}
		throw new InvalidDatetimeError("datetime did not parse as any timestamp format");
	}
	/**
	* Variant of {@link normalizeDatetime} which always returns a valid datetime
	* string.
	*
	* If a {@link InvalidDatetimeError} is encountered, returns the UNIX epoch time
	* as a UTC datetime (`1970-01-01T00:00:00.000Z`).
	*
	* @see {@link normalizeDatetime}
	*/
	function normalizeDatetimeAlways(dtStr) {
		try {
			return normalizeDatetime(dtStr);
		} catch (err) {
			return "1970-01-01T00:00:00.000Z";
		}
	}
	var failure = (m) => ({
		success: false,
		message: m
	});
	var success = (v) => ({
		success: true,
		value: v
	});
	/**
	* @see {@link https://www.rfc-editor.org/rfc/rfc3339#section-5.6 Internet Date/Time Format}
	*
	* @example
	* ```abnf
	* date-fullyear   = 4DIGIT
	* date-month      = 2DIGIT  ; 01-12
	* date-mday       = 2DIGIT  ; 01-28, 01-29, 01-30, 01-31 based on
	*                           ; month/year
	* time-hour       = 2DIGIT  ; 00-23
	* time-minute     = 2DIGIT  ; 00-59
	* time-second     = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second
	*                           ; rules
	* time-secfrac    = "." 1*DIGIT
	* time-numoffset  = ("+" / "-") time-hour ":" time-minute
	* time-offset     = "Z" / time-numoffset
	* partial-time    = time-hour ":" time-minute ":" time-second
	*                   [time-secfrac]
	* full-date       = date-fullyear "-" date-month "-" date-mday
	* full-time       = partial-time time-offset
	* date-time       = full-date "T" full-time
	* ```
	*/
	var DATETIME_REGEX = /^(?<full_year>[0-9]{4})-(?<date_month>0[1-9]|1[012])-(?<date_mday>[0-2][0-9]|3[01])T(?<time_hour>[0-1][0-9]|2[0-3]):(?<time_minute>[0-5][0-9]):(?<time_second>[0-5][0-9]|60)(?<time_secfrac>\.[0-9]+)?(?<time_offset>Z|(?<time_numoffset>[+-](?:[0-1][0-9]|2[0-3]):[0-5][0-9]))$/;
	/**
	* Validates that the input is a datetime string according to atproto Lexicon
	* rules, and parses it into a Date object.
	*/
	function parseString(input) {
		if (typeof input !== "string") return failure("datetime must be a string");
		if (input.length > 64) return failure("datetime is too long (64 chars max)");
		if (input.endsWith("-00:00")) return failure("datetime can not use \"-00:00\" for UTC timezone");
		if (!DATETIME_REGEX.test(input)) return failure("datetime is not in a valid format (must match RFC 3339 & ISO 8601 with 'Z' or ±hh:mm timezone)");
		return parseDate(new Date(input));
	}
	/**
	* Ensures that a Date object represents a valid datetime according to atproto
	* Lexicon rules. This ensures that `date.toISOString()` will produce a valid
	* datetime string that can be used where {@link DatetimeString} is expected.
	*/
	function parseDate(date) {
		const fullYear = date.getUTCFullYear();
		if (Number.isNaN(fullYear)) return failure("datetime did not parse as ISO 8601");
		if (fullYear < 0) return failure("datetime normalized to a negative time");
		if (fullYear > 9999) return failure("datetime year is too far in the future");
		return success(date);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/language.js
var require_language$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLanguageString = parseLanguageString;
	exports.isValidLanguage = isValidLanguage;
	var BCP47_REGEXP = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>x(-[A-Za-z0-9]{1,8})+))$/;
	function parseLanguageString(input) {
		const parsed = input.match(BCP47_REGEXP);
		if (!parsed?.groups) return null;
		const { groups } = parsed;
		return {
			grandfathered: groups.grandfathered,
			language: groups.language,
			extlang: groups.extlang,
			script: groups.script,
			region: groups.region,
			variant: groups.variant,
			extension: groups.extension,
			privateUse: groups.privateUseA || groups.privateUseB
		};
	}
	/**
	* Validates well-formed BCP 47 syntax
	*
	* @see {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1}
	*/
	function isValidLanguage(input) {
		return BCP47_REGEXP.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/tid.js
var require_tid$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidTidError = void 0;
	exports.ensureValidTid = ensureValidTid;
	exports.isValidTid = isValidTid;
	var TID_LENGTH = 13;
	var TID_REGEX = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
	function ensureValidTid(input) {
		if (input.length !== TID_LENGTH) throw new InvalidTidError(`TID must be ${TID_LENGTH} characters`);
		if (!TID_REGEX.test(input)) throw new InvalidTidError("TID syntax not valid (regex)");
	}
	function isValidTid(input) {
		return input.length === TID_LENGTH && TID_REGEX.test(input);
	}
	var InvalidTidError = class extends Error {};
	exports.InvalidTidError = InvalidTidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/uri.js
var require_uri$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isValidUri = isValidUri;
	function isValidUri(input) {
		return /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/dist/index.js
var require_dist$13 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_at_identifier$2(), exports);
	tslib_1.__exportStar(require_aturi$2(), exports);
	tslib_1.__exportStar(require_datetime$2(), exports);
	tslib_1.__exportStar(require_did$2(), exports);
	tslib_1.__exportStar(require_handle$2(), exports);
	tslib_1.__exportStar(require_nsid$2(), exports);
	tslib_1.__exportStar(require_language$2(), exports);
	tslib_1.__exportStar(require_recordkey$2(), exports);
	tslib_1.__exportStar(require_tid$2(), exports);
	tslib_1.__exportStar(require_uri$2(), exports);
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/strings.js
var require_strings = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.b64UrlToUtf8 = exports.utf8ToB64Url = exports.validateLanguage = exports.parseLanguage = exports.utf8Len = exports.graphemeLen = void 0;
	var lex_data_1 = require_dist$15();
	var syntax_1 = require_dist$13();
	exports.graphemeLen = lex_data_1.graphemeLen;
	exports.utf8Len = lex_data_1.utf8Len;
	exports.parseLanguage = syntax_1.parseLanguageString;
	/**
	* @deprecated Use {@link isLanguageString} from `@atproto/syntax` instead.
	*/
	exports.validateLanguage = syntax_1.isValidLanguage;
	/**
	* @deprecated Use {@link toBase64} from `@atproto/lex-data` instead.
	*/
	var utf8ToB64Url = (utf8) => {
		return (0, lex_data_1.toBase64)(new TextEncoder().encode(utf8), "base64url");
	};
	exports.utf8ToB64Url = utf8ToB64Url;
	/**
	* @deprecated Use {@link fromBase64} from `@atproto/lex-data` instead.
	*/
	var b64UrlToUtf8 = (b64) => {
		return new TextDecoder().decode((0, lex_data_1.fromBase64)(b64, "base64url"));
	};
	exports.b64UrlToUtf8 = b64UrlToUtf8;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/did-doc.js
var require_did_doc = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.didDocument = exports.getServiceEndpoint = exports.getNotifEndpoint = exports.getFeedGenEndpoint = exports.getPdsEndpoint = exports.getSigningDidKey = exports.getVerificationMaterial = exports.getSigningKey = exports.getHandle = exports.getDid = exports.isValidDidDoc = void 0;
	var zod_1 = require_zod();
	var isValidDidDoc = (doc) => {
		return exports.didDocument.safeParse(doc).success;
	};
	exports.isValidDidDoc = isValidDidDoc;
	var getDid = (doc) => {
		const id = doc.id;
		if (typeof id !== "string") throw new Error("No `id` on document");
		return id;
	};
	exports.getDid = getDid;
	var getHandle = (doc) => {
		const aka = doc.alsoKnownAs;
		if (aka) for (let i = 0; i < aka.length; i++) {
			const alias = aka[i];
			if (alias.startsWith("at://")) return alias.slice(5);
		}
	};
	exports.getHandle = getHandle;
	var getSigningKey = (doc) => {
		return (0, exports.getVerificationMaterial)(doc, "atproto");
	};
	exports.getSigningKey = getSigningKey;
	var getVerificationMaterial = (doc, keyId) => {
		const key = findItemById(doc, "verificationMethod", `#${keyId}`);
		if (!key) return;
		if (!key.publicKeyMultibase) return;
		return {
			type: key.type,
			publicKeyMultibase: key.publicKeyMultibase
		};
	};
	exports.getVerificationMaterial = getVerificationMaterial;
	var getSigningDidKey = (doc) => {
		const parsed = (0, exports.getSigningKey)(doc);
		if (!parsed) return;
		return `did:key:${parsed.publicKeyMultibase}`;
	};
	exports.getSigningDidKey = getSigningDidKey;
	var getPdsEndpoint = (doc) => {
		return (0, exports.getServiceEndpoint)(doc, {
			id: "#atproto_pds",
			type: "AtprotoPersonalDataServer"
		});
	};
	exports.getPdsEndpoint = getPdsEndpoint;
	var getFeedGenEndpoint = (doc) => {
		return (0, exports.getServiceEndpoint)(doc, {
			id: "#bsky_fg",
			type: "BskyFeedGenerator"
		});
	};
	exports.getFeedGenEndpoint = getFeedGenEndpoint;
	var getNotifEndpoint = (doc) => {
		return (0, exports.getServiceEndpoint)(doc, {
			id: "#bsky_notif",
			type: "BskyNotificationService"
		});
	};
	exports.getNotifEndpoint = getNotifEndpoint;
	var getServiceEndpoint = (doc, opts) => {
		const service = findItemById(doc, "service", opts.id);
		if (!service) return;
		if (opts.type && service.type !== opts.type) return;
		if (typeof service.serviceEndpoint !== "string") return;
		return validateUrl(service.serviceEndpoint);
	};
	exports.getServiceEndpoint = getServiceEndpoint;
	function findItemById(doc, type, id) {
		const items = doc[type];
		if (items) for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const itemId = item.id;
			if (itemId[0] === "#" ? itemId === id : itemId.length === doc.id.length + id.length && itemId[doc.id.length] === "#" && itemId.endsWith(id) && itemId.startsWith(doc.id)) return item;
		}
	}
	var validateUrl = (urlStr) => {
		if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) return;
		if (!canParseUrl(urlStr)) return;
		return urlStr;
	};
	var canParseUrl = URL.canParse ?? ((urlStr) => {
		try {
			new URL(urlStr);
			return true;
		} catch {
			return false;
		}
	});
	var verificationMethod = zod_1.z.object({
		id: zod_1.z.string(),
		type: zod_1.z.string(),
		controller: zod_1.z.string(),
		publicKeyJwk: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
		publicKeyMultibase: zod_1.z.string().optional()
	});
	var service = zod_1.z.object({
		id: zod_1.z.string(),
		type: zod_1.z.string(),
		serviceEndpoint: zod_1.z.union([zod_1.z.string(), zod_1.z.record(zod_1.z.unknown())])
	});
	/**
	* @deprecated Use `DidDocument` from `@atproto/did` instead as it applies
	* stricter (and more spec-compliant) validation.
	*/
	exports.didDocument = zod_1.z.object({
		"@context": zod_1.z.union([zod_1.z.literal("https://www.w3.org/ns/did/v1"), zod_1.z.array(zod_1.z.string().url())]).optional(),
		id: zod_1.z.string(),
		alsoKnownAs: zod_1.z.array(zod_1.z.string()).optional(),
		verificationMethod: zod_1.z.array(verificationMethod).optional(),
		authentication: zod_1.z.array(zod_1.z.union([zod_1.z.string(), verificationMethod])).optional(),
		service: zod_1.z.array(service).optional()
	});
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/common-web/dist/index.js
var require_dist$12 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o) {
				var ar = [];
				for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	var __exportStar = exports && exports.__exportStar || function(m, exports$2) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$2, p)) __createBinding(exports$2, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.util = exports.check = void 0;
	exports.check = __importStar(require_check());
	exports.util = __importStar(require_util$3());
	__exportStar(require_arrays(), exports);
	__exportStar(require_async(), exports);
	__exportStar(require_util$3(), exports);
	__exportStar(require_tid$3(), exports);
	__exportStar(require_ipld(), exports);
	__exportStar(require_retry(), exports);
	__exportStar(require_types$3(), exports);
	__exportStar(require_times(), exports);
	__exportStar(require_strings(), exports);
	__exportStar(require_did_doc(), exports);
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/did.js
var require_did$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDidError = void 0;
	exports.ensureValidDid = ensureValidDid;
	exports.ensureValidDidRegex = ensureValidDidRegex;
	exports.isValidDid = isValidDid;
	function ensureValidDid(input) {
		if (!input.startsWith("did:")) throw new InvalidDidError("DID requires \"did:\" prefix");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
		if (input.endsWith(":") || input.endsWith("%")) throw new InvalidDidError("DID can not end with \":\" or \"%\"");
		if (!/^[a-zA-Z0-9._:%-]*$/.test(input)) throw new InvalidDidError("Disallowed characters in DID (ASCII letters, digits, and a couple other characters only)");
		const { length, 1: method } = input.split(":");
		if (length < 3) throw new InvalidDidError("DID requires prefix, method, and method-specific content");
		if (!/^[a-z]+$/.test(method)) throw new InvalidDidError("DID method must be lower-case letters");
	}
	var DID_REGEX = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
	function ensureValidDidRegex(input) {
		if (!DID_REGEX.test(input)) throw new InvalidDidError("DID didn't validate via regex");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
	}
	function isValidDid(input) {
		return input.length <= 2048 && DID_REGEX.test(input);
	}
	var InvalidDidError = class extends Error {};
	exports.InvalidDidError = InvalidDidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/handle.js
var require_handle$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DisallowedDomainError = exports.UnsupportedDomainError = exports.ReservedHandleError = exports.InvalidHandleError = exports.DISALLOWED_TLDS = exports.INVALID_HANDLE = void 0;
	exports.ensureValidHandle = ensureValidHandle;
	exports.ensureValidHandleRegex = ensureValidHandleRegex;
	exports.normalizeHandle = normalizeHandle;
	exports.normalizeAndEnsureValidHandle = normalizeAndEnsureValidHandle;
	exports.isValidHandle = isValidHandle;
	exports.isValidTld = isValidTld;
	exports.INVALID_HANDLE = "handle.invalid";
	exports.DISALLOWED_TLDS = [
		".local",
		".arpa",
		".invalid",
		".localhost",
		".internal",
		".example",
		".alt",
		".onion"
	];
	function ensureValidHandle(input) {
		if (!/^[a-zA-Z0-9.-]*$/.test(input)) throw new InvalidHandleError("Disallowed characters in handle (ASCII letters, digits, dashes, periods only)");
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		const labels = input.split(".");
		if (labels.length < 2) throw new InvalidHandleError("Handle domain needs at least two parts");
		for (let i = 0; i < labels.length; i++) {
			const l = labels[i];
			if (l.length < 1) throw new InvalidHandleError("Handle parts can not be empty");
			if (l.length > 63) throw new InvalidHandleError("Handle part too long (max 63 chars)");
			if (l.endsWith("-") || l.startsWith("-")) throw new InvalidHandleError("Handle parts can not start or end with hyphens");
			if (i + 1 === labels.length && !/^[a-zA-Z]/.test(l)) throw new InvalidHandleError("Handle final component (TLD) must start with ASCII letter");
		}
	}
	var HANDLE_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
	function ensureValidHandleRegex(input) {
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		if (!HANDLE_REGEX.test(input)) throw new InvalidHandleError("Handle didn't validate via regex");
	}
	function normalizeHandle(handle) {
		return handle.toLowerCase();
	}
	function normalizeAndEnsureValidHandle(handle) {
		const normalized = normalizeHandle(handle);
		ensureValidHandle(normalized);
		return normalized;
	}
	function isValidHandle(input) {
		return input.length <= 253 && HANDLE_REGEX.test(input);
	}
	function isValidTld(handle) {
		for (const tld of exports.DISALLOWED_TLDS) if (handle.endsWith(tld)) return false;
		return true;
	}
	var InvalidHandleError = class extends Error {};
	exports.InvalidHandleError = InvalidHandleError;
	/** @deprecated Never used */
	var ReservedHandleError = class extends Error {};
	exports.ReservedHandleError = ReservedHandleError;
	/** @deprecated Never used */
	var UnsupportedDomainError = class extends Error {};
	exports.UnsupportedDomainError = UnsupportedDomainError;
	/** @deprecated Never used */
	var DisallowedDomainError = class extends Error {};
	exports.DisallowedDomainError = DisallowedDomainError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/at-identifier.js
var require_at_identifier$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isHandleIdentifier = isHandleIdentifier;
	exports.isDidIdentifier = isDidIdentifier;
	exports.assertAtIdentifierString = assertAtIdentifierString;
	exports.ensureValidAtIdentifier = assertAtIdentifierString;
	exports.asAtIdentifierString = asAtIdentifierString;
	exports.isAtIdentifierString = isAtIdentifierString;
	exports.isValidAtIdentifier = isAtIdentifierString;
	exports.ifAtIdentifierString = ifAtIdentifierString;
	var did_js_1 = require_did$1();
	var handle_js_1 = require_handle$1();
	/**
	* Discriminates {@link HandleString} from a valid {@link AtIdentifierString}.
	*
	* @return `true` if the identifier is a handle, `false` otherwise
	*/
	function isHandleIdentifier(id) {
		return !isDidIdentifier(id);
	}
	/**
	* Discriminates {@link DidString} from a valid {@link AtIdentifierString}.
	*
	* @return `true` if the identifier is a DID, `false` otherwise
	*/
	function isDidIdentifier(id) {
		return id.startsWith("did:");
	}
	/**
	* Validates that a string is a valid {@link AtIdentifierString} format string,
	* throwing an error if it is not.
	*
	* @throws InvalidHandleError if the input string does not meet the atproto 'datetime' format requirements.
	* @see {@link AtIdentifierString}
	*/
	function assertAtIdentifierString(input) {
		try {
			if (!input || typeof input !== "string") throw new TypeError("Identifier must be a non-empty string");
			else if (input.startsWith("did:")) (0, did_js_1.ensureValidDidRegex)(input);
			else (0, handle_js_1.ensureValidHandleRegex)(input);
		} catch (cause) {
			throw new handle_js_1.InvalidHandleError("Invalid DID or handle", { cause });
		}
	}
	/**
	* Casts a string to a {@link AtIdentifierString} if it is a valid at-identifier
	* string, throwing an error if it is not.
	*
	* @throws InvalidHandleError if the input string does not meet the atproto 'at-identifier' format requirements.
	* @see {@link AtIdentifierString}
	*/
	function asAtIdentifierString(input) {
		assertAtIdentifierString(input);
		return input;
	}
	/**
	* Type guard that checks if a value is a valid AT identifier (DID or handle).
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid AT identifier
	* @see {@link AtIdentifierString}
	*/
	function isAtIdentifierString(input) {
		if (!input || typeof input !== "string") return false;
		else if (input.startsWith("did:")) return (0, did_js_1.isValidDid)(input);
		else return (0, handle_js_1.isValidHandle)(input);
	}
	/**
	* Returns the input if it is a valid {@link AtIdentifierString} format string, or
	* `undefined` if it is not.
	*
	* @see {@link AtIdentifierString}
	*/
	function ifAtIdentifierString(input) {
		return isAtIdentifierString(input) ? input : void 0;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/lib/result.js
var require_result$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.success = success;
	exports.failure = failure;
	function success(value) {
		return {
			success: true,
			value
		};
	}
	function failure(message) {
		return {
			success: false,
			message
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/nsid.js
var require_nsid$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidNsidError = exports.NSID = void 0;
	exports.ensureValidNsid = ensureValidNsid;
	exports.parseNsid = parseNsid;
	exports.isValidNsid = isValidNsid;
	exports.validateNsid = validateNsid;
	exports.ensureValidNsidRegex = ensureValidNsidRegex;
	exports.validateNsidRegex = validateNsidRegex;
	var result_js_1 = require_result$1();
	exports.NSID = class NSID {
		segments;
		static parse(input) {
			return new NSID(input);
		}
		static create(authority, name) {
			const input = [...authority.split(".").reverse(), name].join(".");
			return new NSID(input);
		}
		static isValid(nsid) {
			return isValidNsid(nsid);
		}
		static from(input) {
			if (input instanceof NSID) return input;
			if (Array.isArray(input)) return new NSID(input.join("."));
			return new NSID(String(input));
		}
		constructor(nsid) {
			this.segments = parseNsid(nsid);
		}
		get authority() {
			return this.segments.slice(0, this.segments.length - 1).reverse().join(".");
		}
		get name() {
			return this.segments.at(this.segments.length - 1);
		}
		toString() {
			return this.segments.join(".");
		}
	};
	function ensureValidNsid(input) {
		const result = validateNsid(input);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	function parseNsid(nsid) {
		const result = validateNsid(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
		return result.value;
	}
	function isValidNsid(input) {
		return validateNsidRegex(input).success;
	}
	function validateNsid(input) {
		if (input.length > 317) return (0, result_js_1.failure)("NSID is too long (317 chars max)");
		if (hasDisallowedCharacters(input)) return (0, result_js_1.failure)("Disallowed characters in NSID (ASCII letters, digits, dashes, periods only)");
		const segments = input.split(".");
		if (segments.length < 3) return (0, result_js_1.failure)("NSID needs at least three parts");
		for (const l of segments) {
			if (l.length < 1) return (0, result_js_1.failure)("NSID parts can not be empty");
			if (l.length > 63) return (0, result_js_1.failure)("NSID part too long (max 63 chars)");
			if (startsWithHyphen(l) || endsWithHyphen(l)) return (0, result_js_1.failure)("NSID parts can not start or end with hyphen");
		}
		if (startsWithNumber(segments[0])) return (0, result_js_1.failure)("NSID first part may not start with a digit");
		if (!isValidIdentifier(segments[segments.length - 1])) return (0, result_js_1.failure)("NSID name part must be only letters and digits (and no leading digit)");
		return (0, result_js_1.success)(segments);
	}
	function hasDisallowedCharacters(v) {
		return !/^[a-zA-Z0-9.-]*$/.test(v);
	}
	function startsWithNumber(v) {
		const charCode = v.charCodeAt(0);
		return charCode >= 48 && charCode <= 57;
	}
	function startsWithHyphen(v) {
		return v.charCodeAt(0) === 45;
	}
	function endsWithHyphen(v) {
		return v.charCodeAt(v.length - 1) === 45;
	}
	function isValidIdentifier(v) {
		return !startsWithNumber(v) && !v.includes("-");
	}
	/**
	* @deprecated Use {@link ensureValidNsid} if you care about error details,
	* {@link parseNsid}/{@link NSID.parse} if you need the parsed segments, or
	* {@link isValidNsid} if you just want a boolean.
	*/
	function ensureValidNsidRegex(nsid) {
		const result = validateNsidRegex(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	/**
	* Regexp based validation that behaves identically to the previous code but
	* provides less detailed error messages (while being 20% to 50% faster).
	*/
	function validateNsidRegex(value) {
		if (value.length > 317) return (0, result_js_1.failure)("NSID is too long (317 chars max)");
		if (value.length < 5 || !/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(value)) return (0, result_js_1.failure)("NSID didn't validate via regex");
		return (0, result_js_1.success)(value);
	}
	var InvalidNsidError = class extends Error {};
	exports.InvalidNsidError = InvalidNsidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/recordkey.js
var require_recordkey$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidRecordKeyError = void 0;
	exports.ensureValidRecordKey = ensureValidRecordKey;
	exports.isValidRecordKey = isValidRecordKey;
	var RECORD_KEY_MAX_LENGTH = 512;
	var RECORD_KEY_MIN_LENGTH = 1;
	var RECORD_KEY_INVALID_VALUES = /* @__PURE__ */ new Set([".", ".."]);
	var RECORD_KEY_REGEX = /^[a-zA-Z0-9_~.:-]{1,512}$/;
	function ensureValidRecordKey(input) {
		if (input.length > RECORD_KEY_MAX_LENGTH || input.length < RECORD_KEY_MIN_LENGTH) throw new InvalidRecordKeyError(`record key must be ${RECORD_KEY_MIN_LENGTH} to ${RECORD_KEY_MAX_LENGTH} characters`);
		if (RECORD_KEY_INVALID_VALUES.has(input)) throw new InvalidRecordKeyError("record key can not be \".\" or \"..\"");
		if (!RECORD_KEY_REGEX.test(input)) throw new InvalidRecordKeyError("record key syntax not valid (regex)");
	}
	function isValidRecordKey(input) {
		return input.length >= RECORD_KEY_MIN_LENGTH && input.length <= RECORD_KEY_MAX_LENGTH && RECORD_KEY_REGEX.test(input) && !RECORD_KEY_INVALID_VALUES.has(input);
	}
	var InvalidRecordKeyError = class extends Error {};
	exports.InvalidRecordKeyError = InvalidRecordKeyError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/aturi_validation.js
var require_aturi_validation$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidAtUriError = void 0;
	exports.isAtUriString = isAtUriString;
	exports.ifAtUriString = ifAtUriString;
	exports.asAtUriString = asAtUriString;
	exports.assertAtUriString = assertAtUriString;
	exports.ensureValidAtUri = ensureValidAtUri;
	exports.ensureValidAtUriRegex = ensureValidAtUriRegex;
	exports.isValidAtUri = isValidAtUri;
	exports.parseAtUriString = parseAtUriString;
	var at_identifier_js_1 = require_at_identifier$1();
	var result_js_1 = require_result$1();
	var nsid_js_1 = require_nsid$1();
	var recordkey_js_1 = require_recordkey$1();
	/**
	* Type guard that checks if a value is a valid {@link AtUriString}
	*
	* @see {@link AtUriString}
	*/
	function isAtUriString(input, options) {
		return parseAtUriString(input, options).success;
	}
	/**
	* Returns the input if it is a valid {@link AtUriString} format string, or
	* `undefined` if it is not.
	*
	* @see {@link AtUriString}
	*/
	function ifAtUriString(input, options) {
		return isAtUriString(input, options) ? input : void 0;
	}
	/**
	* Casts a string to an {@link AtUriString} if it is a valid AT URI format
	* string, throwing an error if it is not.
	*
	* @throws InvalidAtUriError if the input string does not meet the atproto AT URI format requirements.
	* @see {@link AtUriString}
	*/
	function asAtUriString(input, options) {
		assertAtUriString(input, options);
		return input;
	}
	/**
	* Assert the validity of an {@link AtUriString}, throwing an error if the
	* {@link input} is not a valid AT URI.
	*
	* @throws InvalidAtUriError if the {@link input} is not a valid {@link AtUriString}
	*/
	function assertAtUriString(input, options) {
		const result = parseAtUriString(input, options);
		if (!result.success) throw new InvalidAtUriError(result.message);
	}
	/**
	* Assert the **non-strict** validity of an {@link AtUriString}, throwing a
	* detailed error if the {@link input} is not a valid AT URI.
	*
	* @throws InvalidAtUriError if the {@link input} is not a valid {@link AtUriString}
	* @deprecated use {@link assertAtUriString} with `{ strict: false }` option instead
	*/
	function ensureValidAtUri(input) {
		assertAtUriString(input, {
			strict: false,
			detailed: true
		});
	}
	/**
	* Assert the (non-strict!) validity of an {@link AtUriString}, throwing an
	* error if the {@link input} is not a valid AT URI.
	*
	* @throws InvalidAtUriError if the {@link input} is not a valid {@link AtUriString}
	* @deprecated use {@link assertAtUriString} with `{ strict: false }` option instead
	*/
	function ensureValidAtUriRegex(input) {
		assertAtUriString(input, {
			strict: false,
			detailed: false
		});
	}
	/**
	* Type guard that checks if a value is a valid {@link AtUriString} format
	* string, without enforcing strict record key validation. This is useful for
	* cases where you want to allow a wider range of valid ATURIs, such as when
	* validating user input or when the record key is not relevant.
	*
	* @deprecated use {@link isAtUriString} with `{ strict: false }` option instead
	*/
	function isValidAtUri(input) {
		return isAtUriString(input, { strict: false });
	}
	var InvalidAtUriError = class extends Error {};
	exports.InvalidAtUriError = InvalidAtUriError;
	var INVALID_CHAR_REGEXP = /[^a-zA-Z0-9._~:@!$&'()*+,;=%/\\[\]#?-]/;
	var AT_URI_REGEXP = /^(?<uri>at:\/\/(?<authority>[^/?#\s]+)(?:\/(?<collection>[^/?#\s]+)(?:\/(?<rkey>[^/?#\s]+))?)?(?<trailingSlash>\/)?)(?:\?(?<query>[^#\s]*))?(?:#(?<hash>[^\s]*))?$/;
	/**
	* Parses a valid {@link AtUriString} into a {@link AtUriParts} object, or
	* returns a failure with a detailed error message if the string is not a valid
	* {@link AtUriString}.
	*/
	function parseAtUriString(input, options) {
		if (typeof input !== "string") return (0, result_js_1.failure)("ATURI must be a string");
		if (input.length > 8192) return (0, result_js_1.failure)("ATURI exceeds maximum length");
		if (input.match(INVALID_CHAR_REGEXP)) return (0, result_js_1.failure)("Disallowed characters in ATURI (ASCII)");
		const groups = input.match(AT_URI_REGEXP)?.groups;
		if (!groups) {
			if (options?.detailed) {
				if (!input.startsWith("at://")) return (0, result_js_1.failure)("ATURI must start with \"at://\"");
				if (input.includes(" ")) return (0, result_js_1.failure)("ATURI can not contain spaces");
				if (input.includes("//", 5)) return (0, result_js_1.failure)("ATURI can not have empty path segments");
				const pathStart = input.indexOf("/", 5);
				if (pathStart !== -1) {
					const fragmentIndex = input.indexOf("#");
					const pathEnd = fragmentIndex !== -1 ? fragmentIndex : input.length;
					const secondSlash = input.indexOf("/", pathStart + 1);
					if (secondSlash !== -1 && secondSlash !== pathEnd - 1) return (0, result_js_1.failure)("ATURI can not have more than two path segments");
				}
			}
			return (0, result_js_1.failure)("ATURI does not match expected format");
		}
		if (!(0, at_identifier_js_1.isAtIdentifierString)(groups.authority)) return (0, result_js_1.failure)("ATURI has invalid authority");
		if (groups.collection != null && !(0, nsid_js_1.isValidNsid)(groups.collection)) return (0, result_js_1.failure)("ATURI has invalid collection");
		if (groups.hash != null) {
			const result = parseJsonPointer(groups.hash, options);
			if (result.success) groups.hash = result.value;
			else return (0, result_js_1.failure)(`ATURI has invalid fragment (${result.message})`);
		}
		if (options?.strict !== false) {
			if (groups.trailingSlash != null) return (0, result_js_1.failure)("ATURI can not have a trailing slash");
			if (groups.query != null) return (0, result_js_1.failure)("ATURI query part is not allowed");
			if (groups.rkey != null && !(0, recordkey_js_1.isValidRecordKey)(groups.rkey)) return (0, result_js_1.failure)("ATURI has invalid record key");
		}
		return (0, result_js_1.success)(groups);
	}
	var BASIC_JSON_POINTER_REGEXP = /^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/;
	/**
	* Checks if a string is a valid JSON pointer (RFC-6901) with the allowed chars
	* for ATURI fragments. This is a very loose validation that only checks the
	* basic syntax and charset.
	*/
	function parseJsonPointer(value, options) {
		if (!BASIC_JSON_POINTER_REGEXP.test(value)) return (0, result_js_1.failure)("Invalid JSON pointer");
		const result = parsePercentEncoding(value);
		if (!result.success && options?.strict === false) return (0, result_js_1.success)(value);
		return result;
	}
	function parsePercentEncoding(value) {
		try {
			return (0, result_js_1.success)(decodeURIComponent(value));
		} catch {
			return (0, result_js_1.failure)("Invalid percent-encoding");
		}
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/aturi.js
var require_aturi$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AtUri = exports.ATP_URI_REGEX = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var at_identifier_js_1 = require_at_identifier$1();
	var did_js_1 = require_did$1();
	var nsid_js_1 = require_nsid$1();
	var recordkey_js_1 = require_recordkey$1();
	tslib_1.__exportStar(require_aturi_validation$1(), exports);
	exports.ATP_URI_REGEX = /^(at:\/\/)?((?:did:[a-z0-9:%-]+)|(?:[a-z0-9][a-z0-9.:-]*))(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	var RELATIVE_REGEX = /^(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	exports.AtUri = class AtUri {
		hash;
		host;
		pathname;
		searchParams;
		constructor(uri, base) {
			const parsed = base !== void 0 ? typeof base === "string" ? Object.assign(parse(base), parseRelative(uri)) : Object.assign({ host: base.host }, parseRelative(uri)) : parse(uri);
			(0, at_identifier_js_1.ensureValidAtIdentifier)(parsed.host);
			this.hash = parsed.hash ?? "";
			this.host = parsed.host;
			this.pathname = parsed.pathname ?? "";
			this.searchParams = parsed.searchParams;
		}
		static make(handleOrDid, collection, rkey) {
			let str = handleOrDid;
			if (collection) str += "/" + collection;
			if (rkey) str += "/" + rkey;
			return new AtUri(str);
		}
		get protocol() {
			return "at:";
		}
		get origin() {
			return `at://${this.host}`;
		}
		get did() {
			const { host } = this;
			if ((0, at_identifier_js_1.isDidIdentifier)(host)) return host;
			throw new did_js_1.InvalidDidError(`AtUri "${this}" does not have a DID hostname`);
		}
		get hostname() {
			return this.host;
		}
		set hostname(v) {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(v);
			this.host = v;
		}
		get search() {
			return this.searchParams.toString();
		}
		set search(v) {
			this.searchParams = new URLSearchParams(v);
		}
		get collection() {
			return this.pathname.split("/").filter(Boolean)[0] || "";
		}
		get collectionSafe() {
			const { collection } = this;
			(0, nsid_js_1.ensureValidNsid)(collection);
			return collection;
		}
		set collection(v) {
			(0, nsid_js_1.ensureValidNsid)(v);
			this.unsafelySetCollection(v);
		}
		unsafelySetCollection(v) {
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] = v;
			this.pathname = parts.join("/");
		}
		get rkey() {
			return this.pathname.split("/").filter(Boolean)[1] || "";
		}
		get rkeySafe() {
			const { rkey } = this;
			(0, recordkey_js_1.ensureValidRecordKey)(rkey);
			return rkey;
		}
		set rkey(v) {
			(0, recordkey_js_1.ensureValidRecordKey)(v);
			this.unsafelySetRkey(v);
		}
		unsafelySetRkey(v) {
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] ||= "undefined";
			parts[1] = v;
			this.pathname = parts.join("/");
		}
		get href() {
			return this.toString();
		}
		toString() {
			let pathname = this.pathname;
			if (pathname && !pathname.startsWith("/")) pathname = `/${pathname}`;
			while (pathname.endsWith("/")) pathname = pathname.slice(0, -1);
			let qs = "";
			if (this.searchParams.size) qs = `?${this.searchParams.toString()}`;
			let fragment = this.hash;
			if (fragment === "#") fragment = "";
			else if (fragment && !fragment.startsWith("#")) fragment = `#${fragment}`;
			return `at://${this.host}${pathname}${qs}${fragment}`;
		}
	};
	function parse(str) {
		const match = str.match(exports.ATP_URI_REGEX);
		if (!match) throw new Error(`Invalid AT uri: ${str}`);
		return {
			host: match[2],
			hash: match[5],
			pathname: match[3],
			searchParams: new URLSearchParams(match[4])
		};
	}
	function parseRelative(str) {
		const match = str.match(RELATIVE_REGEX);
		if (!match) throw new Error(`Invalid path: ${str}`);
		return {
			hash: match[3],
			pathname: match[1],
			searchParams: new URLSearchParams(match[2])
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/datetime.js
var require_datetime$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDatetimeError = void 0;
	exports.assertAtprotoDate = assertAtprotoDate;
	exports.asAtprotoDate = asAtprotoDate;
	exports.isAtprotoDate = isAtprotoDate;
	exports.ifAtprotoDate = ifAtprotoDate;
	exports.assertDatetimeString = assertDatetimeString;
	exports.ensureValidDatetime = assertDatetimeString;
	exports.asDatetimeString = asDatetimeString;
	exports.isDatetimeString = isDatetimeString;
	exports.isValidDatetime = isDatetimeString;
	exports.ifDatetimeString = ifDatetimeString;
	exports.currentDatetimeString = currentDatetimeString;
	exports.toDatetimeString = toDatetimeString;
	exports.normalizeDatetime = normalizeDatetime;
	exports.normalizeDatetimeAlways = normalizeDatetimeAlways;
	/**
	* Indicates a date or string is not a valid representation of a datetime
	* according to the atproto
	* {@link https://atproto.com/specs/lexicon#datetime specification}.
	*/
	var InvalidDatetimeError = class extends Error {};
	exports.InvalidDatetimeError = InvalidDatetimeError;
	/**
	* @see {@link AtprotoDate}
	*/
	function assertAtprotoDate(date) {
		const res = parseDate(date);
		if (!res.success) throw new InvalidDatetimeError(res.message);
	}
	/**
	* @see {@link AtprotoDate}
	*/
	function asAtprotoDate(date) {
		assertAtprotoDate(date);
		return date;
	}
	/**
	* @see {@link AtprotoDate}
	*/
	function isAtprotoDate(date) {
		return parseDate(date).success;
	}
	/**
	* @see {@link AtprotoDate}
	*/
	function ifAtprotoDate(date) {
		return isAtprotoDate(date) ? date : void 0;
	}
	/**
	* Validates that a string is a valid {@link DatetimeString} format string,
	* throwing an error if it is not.
	*
	* @throws InvalidDatetimeError if the input string does not meet the atproto 'datetime' format requirements.
	* @see {@link DatetimeString}
	*/
	function assertDatetimeString(input) {
		const result = parseString(input);
		if (!result.success) throw new InvalidDatetimeError(result.message);
	}
	/**
	* Casts a string to a {@link DatetimeString} if it is a valid datetime format
	* string, throwing an error if it is not.
	*
	* @throws InvalidDatetimeError if the input string does not meet the atproto 'datetime' format requirements.
	* @see {@link DatetimeString}
	*/
	function asDatetimeString(input) {
		assertDatetimeString(input);
		return input;
	}
	/**
	* Checks if a string is a valid {@link DatetimeString} format string.
	*
	* @see {@link DatetimeString}
	*/
	function isDatetimeString(input) {
		return parseString(input).success;
	}
	/**
	* Returns the input if it is a valid {@link DatetimeString} format string, or
	* `undefined` if it is not.
	*
	* @see {@link DatetimeString}
	*/
	function ifDatetimeString(input) {
		return isDatetimeString(input) ? input : void 0;
	}
	/**
	* Returns the current date and time as a {@link DatetimeString}.
	*
	* @see {@link DatetimeString}
	*/
	function currentDatetimeString() {
		return toDatetimeString(/* @__PURE__ */ new Date());
	}
	/**
	* Converts any {@link Date} into a {@link DatetimeString} if possible, throwing
	* an error if the date is not a valid atproto datetime.
	*
	* This is short-hand for `asAtprotoDate(date).toISOString()`.
	*
	* @throws InvalidDatetimeError if the input date is not a valid atproto datetime (eg, it is too far in the future or past, or it normalizes to a negative year).
	* @see {@link DatetimeString}
	*/
	function toDatetimeString(date) {
		return asAtprotoDate(date).toISOString();
	}
	/**
	* Takes a flexible datetime string and normalizes its representation.
	*
	* This function will work with any valid value that can be parsed as a date. It
	* *additionally* is more flexible about accepting datetimes that are missing
	* timezone information, and normalizing them to a valid atproto datetime.
	*
	* One use-case is a consistent, sortable string. Another is to work with older
	* invalid createdAt datetimes.
	*
	* @note This function might return different normalized strings for the same
	* input depending on the timezone of the machine it is run on, since it will
	* attempt to parse the input "as is" if it fails to parse with an explicit
	* timezone.
	*
	* @returns ISODatetimeString - a valid atproto datetime with millisecond precision (3 sub-second digits) and UTC timezone with trailing 'Z' syntax.
	* @throws InvalidDatetimeError - if the input string could not be parsed as a datetime, even with permissive parsing.
	*/
	function normalizeDatetime(dtStr) {
		if (/[+-]\d\d:?\d\d/.test(dtStr) || /\dZ\b/.test(dtStr) || /\b[A-Z]{3,4}\b/.test(dtStr)) {
			const date = new Date(dtStr);
			if (isAtprotoDate(date)) return date.toISOString();
		} else {
			const dateZ = /* @__PURE__ */ new Date(`${dtStr}Z`);
			if (isAtprotoDate(dateZ)) return dateZ.toISOString();
			const dateUTC = /* @__PURE__ */ new Date(`${dtStr} UTC`);
			if (isAtprotoDate(dateUTC)) return dateUTC.toISOString();
			const date = new Date(dtStr);
			if (isAtprotoDate(date)) return date.toISOString();
		}
		throw new InvalidDatetimeError("datetime did not parse as any timestamp format");
	}
	/**
	* Variant of {@link normalizeDatetime} which always returns a valid datetime
	* string.
	*
	* If a {@link InvalidDatetimeError} is encountered, returns the UNIX epoch time
	* as a UTC datetime (`1970-01-01T00:00:00.000Z`).
	*
	* @see {@link normalizeDatetime}
	*/
	function normalizeDatetimeAlways(dtStr) {
		try {
			return normalizeDatetime(dtStr);
		} catch (err) {
			return "1970-01-01T00:00:00.000Z";
		}
	}
	var failure = (m) => ({
		success: false,
		message: m
	});
	var success = (v) => ({
		success: true,
		value: v
	});
	/**
	* @see {@link https://www.rfc-editor.org/rfc/rfc3339#section-5.6 Internet Date/Time Format}
	*
	* @example
	* ```abnf
	* date-fullyear   = 4DIGIT
	* date-month      = 2DIGIT  ; 01-12
	* date-mday       = 2DIGIT  ; 01-28, 01-29, 01-30, 01-31 based on
	*                           ; month/year
	* time-hour       = 2DIGIT  ; 00-23
	* time-minute     = 2DIGIT  ; 00-59
	* time-second     = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second
	*                           ; rules
	* time-secfrac    = "." 1*DIGIT
	* time-numoffset  = ("+" / "-") time-hour ":" time-minute
	* time-offset     = "Z" / time-numoffset
	* partial-time    = time-hour ":" time-minute ":" time-second
	*                   [time-secfrac]
	* full-date       = date-fullyear "-" date-month "-" date-mday
	* full-time       = partial-time time-offset
	* date-time       = full-date "T" full-time
	* ```
	*/
	var DATETIME_REGEX = /^(?<full_year>[0-9]{4})-(?<date_month>0[1-9]|1[012])-(?<date_mday>[0-2][0-9]|3[01])T(?<time_hour>[0-1][0-9]|2[0-3]):(?<time_minute>[0-5][0-9]):(?<time_second>[0-5][0-9]|60)(?<time_secfrac>\.[0-9]+)?(?<time_offset>Z|(?<time_numoffset>[+-](?:[0-1][0-9]|2[0-3]):[0-5][0-9]))$/;
	/**
	* Validates that the input is a datetime string according to atproto Lexicon
	* rules, and parses it into a Date object.
	*/
	function parseString(input) {
		if (typeof input !== "string") return failure("datetime must be a string");
		if (input.length > 64) return failure("datetime is too long (64 chars max)");
		if (input.endsWith("-00:00")) return failure("datetime can not use \"-00:00\" for UTC timezone");
		if (!DATETIME_REGEX.test(input)) return failure("datetime is not in a valid format (must match RFC 3339 & ISO 8601 with 'Z' or ±hh:mm timezone)");
		return parseDate(new Date(input));
	}
	/**
	* Ensures that a Date object represents a valid datetime according to atproto
	* Lexicon rules. This ensures that `date.toISOString()` will produce a valid
	* datetime string that can be used where {@link DatetimeString} is expected.
	*/
	function parseDate(date) {
		const fullYear = date.getUTCFullYear();
		if (Number.isNaN(fullYear)) return failure("datetime did not parse as ISO 8601");
		if (fullYear < 0) return failure("datetime normalized to a negative time");
		if (fullYear > 9999) return failure("datetime year is too far in the future");
		return success(date);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/language.js
var require_language$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLanguageString = parseLanguageString;
	exports.isValidLanguage = isValidLanguage;
	var BCP47_REGEXP = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>x(-[A-Za-z0-9]{1,8})+))$/;
	function parseLanguageString(input) {
		const parsed = input.match(BCP47_REGEXP);
		if (!parsed?.groups) return null;
		const { groups } = parsed;
		return {
			grandfathered: groups.grandfathered,
			language: groups.language,
			extlang: groups.extlang,
			script: groups.script,
			region: groups.region,
			variant: groups.variant,
			extension: groups.extension,
			privateUse: groups.privateUseA || groups.privateUseB
		};
	}
	/**
	* Validates well-formed BCP 47 syntax
	*
	* @see {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1}
	*/
	function isValidLanguage(input) {
		return BCP47_REGEXP.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/tid.js
var require_tid$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidTidError = void 0;
	exports.ensureValidTid = ensureValidTid;
	exports.isValidTid = isValidTid;
	var TID_LENGTH = 13;
	var TID_REGEX = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
	function ensureValidTid(input) {
		if (input.length !== TID_LENGTH) throw new InvalidTidError(`TID must be ${TID_LENGTH} characters`);
		if (!TID_REGEX.test(input)) throw new InvalidTidError("TID syntax not valid (regex)");
	}
	function isValidTid(input) {
		return input.length === TID_LENGTH && TID_REGEX.test(input);
	}
	var InvalidTidError = class extends Error {};
	exports.InvalidTidError = InvalidTidError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/uri.js
var require_uri$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isValidUri = isValidUri;
	function isValidUri(input) {
		return /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(input);
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/dist/index.js
var require_dist$11 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_at_identifier$1(), exports);
	tslib_1.__exportStar(require_aturi$1(), exports);
	tslib_1.__exportStar(require_datetime$1(), exports);
	tslib_1.__exportStar(require_did$1(), exports);
	tslib_1.__exportStar(require_handle$1(), exports);
	tslib_1.__exportStar(require_nsid$1(), exports);
	tslib_1.__exportStar(require_language$1(), exports);
	tslib_1.__exportStar(require_recordkey$1(), exports);
	tslib_1.__exportStar(require_tid$1(), exports);
	tslib_1.__exportStar(require_uri$1(), exports);
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/util.js
var require_util$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toLexUri = toLexUri;
	exports.requiredPropertiesRefinement = requiredPropertiesRefinement;
	var zod_1 = require_zod();
	function toLexUri(str, baseUri) {
		if (str.split("#").length > 2) throw new Error("Uri can only have one hash segment");
		if (str.startsWith("lex:")) return str;
		if (str.startsWith("#")) {
			if (!baseUri) throw new Error(`Unable to resolve uri without anchor: ${str}`);
			return `${baseUri}${str}`;
		}
		return `lex:${str}`;
	}
	function requiredPropertiesRefinement(object, ctx) {
		if (object.required === void 0) return;
		if (!Array.isArray(object.required)) {
			ctx.addIssue({
				code: zod_1.z.ZodIssueCode.invalid_type,
				received: typeof object.required,
				expected: "array"
			});
			return;
		}
		if (object.properties === void 0) {
			if (object.required.length > 0) ctx.addIssue({
				code: zod_1.z.ZodIssueCode.custom,
				message: `Required fields defined but no properties defined`
			});
			return;
		}
		for (const field of object.required) if (object.properties[field] === void 0) ctx.addIssue({
			code: zod_1.z.ZodIssueCode.custom,
			message: `Required field "${field}" not defined`
		});
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/types.js
var require_types$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LexiconDefNotFoundError = exports.InvalidLexiconError = exports.ValidationError = exports.lexiconDoc = exports.lexUserType = exports.lexRecord = exports.lexXrpcSubscription = exports.lexXrpcProcedure = exports.lexXrpcQuery = exports.lexXrpcError = exports.lexXrpcBody = exports.lexXrpcParameters = exports.lexPermissionSet = exports.lexObject = exports.lexToken = exports.lexPrimitiveArray = exports.lexArray = exports.lexBlob = exports.lexRefVariant = exports.lexRefUnion = exports.lexRef = exports.lexIpldType = exports.lexCidLink = exports.lexBytes = exports.lexPrimitive = exports.lexUnknown = exports.lexString = exports.lexStringFormat = exports.lexInteger = exports.lexBoolean = exports.lexLang = exports.languageSchema = void 0;
	exports.isValidLexiconDoc = isValidLexiconDoc;
	exports.isObj = isObj;
	exports.isDiscriminatedObject = isDiscriminatedObject;
	exports.parseLexiconDoc = parseLexiconDoc;
	var zod_1 = require_zod();
	var common_web_1 = require_dist$12();
	var syntax_1 = require_dist$11();
	var util_1 = require_util$1();
	exports.languageSchema = zod_1.z.string().refine(common_web_1.validateLanguage, "Invalid BCP47 language tag");
	exports.lexLang = zod_1.z.record(exports.languageSchema, zod_1.z.string().optional());
	exports.lexBoolean = zod_1.z.object({
		type: zod_1.z.literal("boolean"),
		description: zod_1.z.string().optional(),
		default: zod_1.z.boolean().optional(),
		const: zod_1.z.boolean().optional()
	});
	exports.lexInteger = zod_1.z.object({
		type: zod_1.z.literal("integer"),
		description: zod_1.z.string().optional(),
		default: zod_1.z.number().int().optional(),
		minimum: zod_1.z.number().int().optional(),
		maximum: zod_1.z.number().int().optional(),
		enum: zod_1.z.number().int().array().optional(),
		const: zod_1.z.number().int().optional()
	});
	exports.lexStringFormat = zod_1.z.enum([
		"datetime",
		"uri",
		"at-uri",
		"did",
		"handle",
		"at-identifier",
		"nsid",
		"cid",
		"language",
		"tid",
		"record-key"
	]);
	exports.lexString = zod_1.z.object({
		type: zod_1.z.literal("string"),
		format: exports.lexStringFormat.optional(),
		description: zod_1.z.string().optional(),
		default: zod_1.z.string().optional(),
		minLength: zod_1.z.number().int().optional(),
		maxLength: zod_1.z.number().int().optional(),
		minGraphemes: zod_1.z.number().int().optional(),
		maxGraphemes: zod_1.z.number().int().optional(),
		enum: zod_1.z.string().array().optional(),
		const: zod_1.z.string().optional(),
		knownValues: zod_1.z.string().array().optional()
	});
	exports.lexUnknown = zod_1.z.object({
		type: zod_1.z.literal("unknown"),
		description: zod_1.z.string().optional()
	});
	exports.lexPrimitive = zod_1.z.discriminatedUnion("type", [
		exports.lexBoolean,
		exports.lexInteger,
		exports.lexString,
		exports.lexUnknown
	]);
	exports.lexBytes = zod_1.z.object({
		type: zod_1.z.literal("bytes"),
		description: zod_1.z.string().optional(),
		maxLength: zod_1.z.number().optional(),
		minLength: zod_1.z.number().optional()
	});
	exports.lexCidLink = zod_1.z.object({
		type: zod_1.z.literal("cid-link"),
		description: zod_1.z.string().optional()
	});
	exports.lexIpldType = zod_1.z.discriminatedUnion("type", [exports.lexBytes, exports.lexCidLink]);
	exports.lexRef = zod_1.z.object({
		type: zod_1.z.literal("ref"),
		description: zod_1.z.string().optional(),
		ref: zod_1.z.string()
	});
	exports.lexRefUnion = zod_1.z.object({
		type: zod_1.z.literal("union"),
		description: zod_1.z.string().optional(),
		refs: zod_1.z.string().array(),
		closed: zod_1.z.boolean().optional()
	});
	exports.lexRefVariant = zod_1.z.discriminatedUnion("type", [exports.lexRef, exports.lexRefUnion]);
	exports.lexBlob = zod_1.z.object({
		type: zod_1.z.literal("blob"),
		description: zod_1.z.string().optional(),
		accept: zod_1.z.string().array().optional(),
		maxSize: zod_1.z.number().optional()
	});
	exports.lexArray = zod_1.z.object({
		type: zod_1.z.literal("array"),
		description: zod_1.z.string().optional(),
		items: zod_1.z.discriminatedUnion("type", [
			exports.lexBoolean,
			exports.lexInteger,
			exports.lexString,
			exports.lexUnknown,
			exports.lexBytes,
			exports.lexCidLink,
			exports.lexRef,
			exports.lexRefUnion,
			exports.lexBlob
		]),
		minLength: zod_1.z.number().int().optional(),
		maxLength: zod_1.z.number().int().optional()
	});
	exports.lexPrimitiveArray = exports.lexArray.merge(zod_1.z.object({ items: exports.lexPrimitive }));
	exports.lexToken = zod_1.z.object({
		type: zod_1.z.literal("token"),
		description: zod_1.z.string().optional()
	});
	exports.lexObject = zod_1.z.object({
		type: zod_1.z.literal("object"),
		description: zod_1.z.string().optional(),
		required: zod_1.z.string().array().optional(),
		nullable: zod_1.z.string().array().optional(),
		properties: zod_1.z.record(zod_1.z.string(), zod_1.z.discriminatedUnion("type", [
			exports.lexArray,
			exports.lexBoolean,
			exports.lexInteger,
			exports.lexString,
			exports.lexUnknown,
			exports.lexBytes,
			exports.lexCidLink,
			exports.lexRef,
			exports.lexRefUnion,
			exports.lexBlob
		]))
	}).superRefine(util_1.requiredPropertiesRefinement);
	var lexPermission = zod_1.z.intersection(zod_1.z.object({
		type: zod_1.z.literal("permission"),
		resource: zod_1.z.string().nonempty()
	}), zod_1.z.record(zod_1.z.string(), zod_1.z.union([
		zod_1.z.array(zod_1.z.union([
			zod_1.z.string(),
			zod_1.z.number().int(),
			zod_1.z.boolean()
		])),
		zod_1.z.boolean(),
		zod_1.z.number().int(),
		zod_1.z.string()
	]).optional()));
	exports.lexPermissionSet = zod_1.z.object({
		type: zod_1.z.literal("permission-set"),
		description: zod_1.z.string().optional(),
		title: zod_1.z.string().optional(),
		"title:lang": exports.lexLang.optional(),
		detail: zod_1.z.string().optional(),
		"detail:lang": exports.lexLang.optional(),
		permissions: zod_1.z.array(lexPermission)
	});
	exports.lexXrpcParameters = zod_1.z.object({
		type: zod_1.z.literal("params"),
		description: zod_1.z.string().optional(),
		required: zod_1.z.string().array().optional(),
		properties: zod_1.z.record(zod_1.z.string(), zod_1.z.discriminatedUnion("type", [
			exports.lexPrimitiveArray,
			exports.lexBoolean,
			exports.lexInteger,
			exports.lexString,
			exports.lexUnknown
		]))
	}).superRefine(util_1.requiredPropertiesRefinement);
	exports.lexXrpcBody = zod_1.z.object({
		description: zod_1.z.string().optional(),
		encoding: zod_1.z.string(),
		schema: zod_1.z.union([exports.lexRefVariant, exports.lexObject]).optional()
	});
	exports.lexXrpcError = zod_1.z.object({
		name: zod_1.z.string(),
		description: zod_1.z.string().optional()
	});
	exports.lexXrpcQuery = zod_1.z.object({
		type: zod_1.z.literal("query"),
		description: zod_1.z.string().optional(),
		parameters: exports.lexXrpcParameters.optional(),
		output: exports.lexXrpcBody.optional(),
		errors: exports.lexXrpcError.array().optional()
	});
	exports.lexXrpcProcedure = zod_1.z.object({
		type: zod_1.z.literal("procedure"),
		description: zod_1.z.string().optional(),
		parameters: exports.lexXrpcParameters.optional(),
		input: exports.lexXrpcBody.optional(),
		output: exports.lexXrpcBody.optional(),
		errors: exports.lexXrpcError.array().optional()
	});
	exports.lexXrpcSubscription = zod_1.z.object({
		type: zod_1.z.literal("subscription"),
		description: zod_1.z.string().optional(),
		parameters: exports.lexXrpcParameters.optional(),
		message: zod_1.z.object({
			description: zod_1.z.string().optional(),
			schema: exports.lexRefUnion
		}),
		errors: exports.lexXrpcError.array().optional()
	});
	exports.lexRecord = zod_1.z.object({
		type: zod_1.z.literal("record"),
		description: zod_1.z.string().optional(),
		key: zod_1.z.string().optional(),
		record: exports.lexObject
	});
	exports.lexUserType = zod_1.z.custom((val) => {
		if (!val || typeof val !== "object") return;
		if (val["type"] === void 0) return;
		switch (val["type"]) {
			case "record": return exports.lexRecord.parse(val);
			case "permission-set": return exports.lexPermissionSet.parse(val);
			case "query": return exports.lexXrpcQuery.parse(val);
			case "procedure": return exports.lexXrpcProcedure.parse(val);
			case "subscription": return exports.lexXrpcSubscription.parse(val);
			case "blob": return exports.lexBlob.parse(val);
			case "array": return exports.lexArray.parse(val);
			case "token": return exports.lexToken.parse(val);
			case "object": return exports.lexObject.parse(val);
			case "boolean": return exports.lexBoolean.parse(val);
			case "integer": return exports.lexInteger.parse(val);
			case "string": return exports.lexString.parse(val);
			case "bytes": return exports.lexBytes.parse(val);
			case "cid-link": return exports.lexCidLink.parse(val);
			case "unknown": return exports.lexUnknown.parse(val);
		}
	}, (val) => {
		if (!val || typeof val !== "object") return {
			message: "Must be an object",
			fatal: true
		};
		if (val["type"] === void 0) return {
			message: "Must have a type",
			fatal: true
		};
		if (typeof val["type"] !== "string") return {
			message: "Type property must be a string",
			fatal: true
		};
		return {
			message: `Invalid type: ${val["type"]} must be one of: record, query, procedure, subscription, blob, array, token, object, boolean, integer, string, bytes, cid-link, unknown`,
			fatal: true
		};
	});
	exports.lexiconDoc = zod_1.z.object({
		lexicon: zod_1.z.literal(1),
		id: zod_1.z.string().refine(syntax_1.isValidNsid, { message: "Must be a valid NSID" }),
		revision: zod_1.z.number().optional(),
		description: zod_1.z.string().optional(),
		defs: zod_1.z.record(zod_1.z.string(), exports.lexUserType)
	}).refine((doc) => {
		for (const [defId, def] of Object.entries(doc.defs)) if (defId !== "main" && (def.type === "record" || def.type === "permission-set" || def.type === "procedure" || def.type === "query" || def.type === "subscription")) return false;
		return true;
	}, { message: `Records, permission sets, procedures, queries, and subscriptions must be the main definition.` });
	function isValidLexiconDoc(v) {
		return exports.lexiconDoc.safeParse(v).success;
	}
	function isObj(v) {
		return v != null && typeof v === "object";
	}
	function isDiscriminatedObject(v) {
		return isObj(v) && "$type" in v && typeof v.$type === "string";
	}
	function parseLexiconDoc(v) {
		exports.lexiconDoc.parse(v);
		return v;
	}
	var ValidationError = class extends Error {};
	exports.ValidationError = ValidationError;
	var InvalidLexiconError = class extends Error {};
	exports.InvalidLexiconError = InvalidLexiconError;
	var LexiconDefNotFoundError = class extends Error {};
	exports.LexiconDefNotFoundError = LexiconDefNotFoundError;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/blob-refs.js
var require_blob_refs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BlobRef = exports.jsonBlobRef = exports.untypedJsonBlobRef = exports.typedJsonBlobRef = void 0;
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	var zod_1 = require_zod();
	var common_web_1 = require_dist$12();
	exports.typedJsonBlobRef = zod_1.z.object({
		$type: zod_1.z.literal("blob"),
		ref: common_web_1.schema.cid,
		mimeType: zod_1.z.string(),
		size: zod_1.z.number()
	}).strict();
	exports.untypedJsonBlobRef = zod_1.z.object({
		cid: zod_1.z.string(),
		mimeType: zod_1.z.string()
	}).strict();
	exports.jsonBlobRef = zod_1.z.union([exports.typedJsonBlobRef, exports.untypedJsonBlobRef]);
	exports.BlobRef = class BlobRef {
		constructor(ref, mimeType, size, original) {
			Object.defineProperty(this, "ref", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: ref
			});
			Object.defineProperty(this, "mimeType", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: mimeType
			});
			Object.defineProperty(this, "size", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: size
			});
			Object.defineProperty(this, "original", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			this.original = original ?? {
				$type: "blob",
				ref,
				mimeType,
				size
			};
		}
		static asBlobRef(obj) {
			if (common_web_1.check.is(obj, exports.jsonBlobRef)) return BlobRef.fromJsonRef(obj);
			return null;
		}
		static fromJsonRef(json) {
			if (common_web_1.check.is(json, exports.typedJsonBlobRef)) return new BlobRef(json.ref, json.mimeType, json.size);
			else return new BlobRef(cid_1.CID.parse(json.cid), json.mimeType, -1, json);
		}
		ipld() {
			return this.original;
		}
		toJSON() {
			return (0, common_web_1.ipldToJson)(this.ipld());
		}
	};
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/validators/blob.js
var require_blob$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.blob = blob;
	var blob_refs_1 = require_blob_refs();
	var types_1 = require_types$2();
	function blob(lexicons, path, def, value) {
		if (!value || !(value instanceof blob_refs_1.BlobRef)) return {
			success: false,
			error: new types_1.ValidationError(`${path} should be a blob ref`)
		};
		return {
			success: true,
			value
		};
	}
}));
//#endregion
//#region node_modules/iso-datestring-validator/dist/index.js
var require_dist$10 = /* @__PURE__ */ __commonJSMin(((exports) => {
	(() => {
		"use strict";
		var e = {
			d: (t, r) => {
				for (var n in r) e.o(r, n) && !e.o(t, n) && Object.defineProperty(t, n, {
					enumerable: !0,
					get: r[n]
				});
			},
			o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
			r: (e) => {
				"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 });
			}
		}, t = {};
		function r(e, t) {
			return void 0 === t && (t = "-"), new RegExp("^(?!0{4}" + t + "0{2}" + t + "0{2})((?=[0-9]{4}" + t + "(((0[^2])|1[0-2])|02(?=" + t + "(([0-1][0-9])|2[0-8])))" + t + "[0-9]{2})|(?=((([13579][26])|([2468][048])|(0[48]))0{2})|([0-9]{2}((((0|[2468])[48])|[2468][048])|([13579][26])))" + t + "02" + t + "29))([0-9]{4})" + t + "(?!((0[469])|11)" + t + "31)((0[1,3-9]|1[0-2])|(02(?!" + t + "3)))" + t + "(0[1-9]|[1-2][0-9]|3[0-1])$").test(e);
		}
		function n(e) {
			var t = /\D/.exec(e);
			return t ? t[0] : "";
		}
		function i(e, t, r) {
			void 0 === t && (t = ":"), void 0 === r && (r = !1);
			var i = new RegExp("^([0-1]|2(?=([0-3])|4" + t + "00))[0-9]" + t + "[0-5][0-9](" + t + "([0-5]|6(?=0))[0-9])?(.[0-9]{1,9})?$");
			if (!r || !/[Z+\-]/.test(e)) return i.test(e);
			if (/Z$/.test(e)) return i.test(e.replace("Z", ""));
			var o = e.includes("+"), a = e.split(/[+-]/), u = a[0], d = a[1];
			return i.test(u) && function(e, t, r) {
				return void 0 === r && (r = ":"), new RegExp(t ? "^(0(?!(2" + r + "4)|0" + r + "3)|1(?=([0-1]|2(?=" + r + "[04])|[34](?=" + r + "0))))([03469](?=" + r + "[03])|[17](?=" + r + "0)|2(?=" + r + "[04])|5(?=" + r + "[034])|8(?=" + r + "[04]))" + r + "([03](?=0)|4(?=5))[05]$" : "^(0(?=[^0])|1(?=[0-2]))([39](?=" + r + "[03])|[0-24-8](?=" + r + "00))" + r + "[03]0$").test(e);
			}(d, o, n(d));
		}
		function o(e) {
			var t = e.split("T"), o = t[0], a = t[1], u = r(o, n(o));
			if (!a) return !1;
			var d, s = (d = a.match(/([^Z+\-\d])(?=\d+\1)/), Array.isArray(d) ? d[0] : "");
			return u && i(a, s, !0);
		}
		function a(e, t) {
			return void 0 === t && (t = "-"), new RegExp("^[0-9]{4}" + t + "(0(?=[^0])|1(?=[0-2]))[0-9]$").test(e);
		}
		e.r(t), e.d(t, {
			isValidDate: () => r,
			isValidISODateString: () => o,
			isValidTime: () => i,
			isValidYearMonth: () => a
		});
		var u = exports;
		for (var d in t) u[d] = t[d];
		t.__esModule && Object.defineProperty(u, "__esModule", { value: !0 });
	})();
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/validators/formats.js
var require_formats = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.datetime = datetime;
	exports.uri = uri;
	exports.atUri = atUri;
	exports.did = did;
	exports.handle = handle;
	exports.atIdentifier = atIdentifier;
	exports.nsid = nsid;
	exports.cid = cid;
	exports.language = language;
	exports.tid = tid;
	exports.recordKey = recordKey;
	var iso_datestring_validator_1 = require_dist$10();
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	var common_web_1 = require_dist$12();
	var syntax_1 = require_dist$11();
	var types_1 = require_types$2();
	function datetime(path, value) {
		try {
			if (!(0, iso_datestring_validator_1.isValidISODateString)(value)) throw new Error();
		} catch {
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be an valid atproto datetime (both RFC-3339 and ISO-8601)`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function uri(path, value) {
		if (!(0, syntax_1.isValidUri)(value)) return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a uri`)
		};
		return {
			success: true,
			value
		};
	}
	function atUri(path, value) {
		try {
			(0, syntax_1.ensureValidAtUri)(value);
		} catch {
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be a valid at-uri`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function did(path, value) {
		try {
			(0, syntax_1.ensureValidDid)(value);
		} catch {
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be a valid did`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function handle(path, value) {
		try {
			(0, syntax_1.ensureValidHandle)(value);
		} catch {
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be a valid handle`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function atIdentifier(path, value) {
		if (value.startsWith("did:")) {
			const didResult = did(path, value);
			if (didResult.success) return didResult;
		} else {
			const handleResult = handle(path, value);
			if (handleResult.success) return handleResult;
		}
		return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a valid did or a handle`)
		};
	}
	function nsid(path, value) {
		if ((0, syntax_1.isValidNsid)(value)) return {
			success: true,
			value
		};
		else return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a valid nsid`)
		};
	}
	function cid(path, value) {
		try {
			cid_1.CID.parse(value);
		} catch {
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be a cid string`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function language(path, value) {
		if ((0, common_web_1.validateLanguage)(value)) return {
			success: true,
			value
		};
		return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a well-formed BCP 47 language tag`)
		};
	}
	function tid(path, value) {
		if ((0, syntax_1.isValidTid)(value)) return {
			success: true,
			value
		};
		return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a valid TID`)
		};
	}
	function recordKey(path, value) {
		try {
			(0, syntax_1.ensureValidRecordKey)(value);
		} catch {
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be a valid Record Key`)
			};
		}
		return {
			success: true,
			value
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/validators/primitives.js
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o) {
				var ar = [];
				for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validate = validate;
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	var common_web_1 = require_dist$12();
	var types_1 = require_types$2();
	var formats = __importStar(require_formats());
	function validate(lexicons, path, def, value) {
		switch (def.type) {
			case "boolean": return boolean(lexicons, path, def, value);
			case "integer": return integer(lexicons, path, def, value);
			case "string": return string(lexicons, path, def, value);
			case "bytes": return bytes(lexicons, path, def, value);
			case "cid-link": return cidLink(lexicons, path, def, value);
			case "unknown": return unknown(lexicons, path, def, value);
			default: return {
				success: false,
				error: new types_1.ValidationError(`Unexpected lexicon type: ${def.type}`)
			};
		}
	}
	function boolean(lexicons, path, def, value) {
		def = def;
		const type = typeof value;
		if (type === "undefined") {
			if (typeof def.default === "boolean") return {
				success: true,
				value: def.default
			};
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be a boolean`)
			};
		} else if (type !== "boolean") return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a boolean`)
		};
		if (typeof def.const === "boolean") {
			if (value !== def.const) return {
				success: false,
				error: new types_1.ValidationError(`${path} must be ${def.const}`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function integer(lexicons, path, def, value) {
		def = def;
		if (typeof value === "undefined") {
			if (typeof def.default === "number") return {
				success: true,
				value: def.default
			};
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be an integer`)
			};
		} else if (!Number.isInteger(value)) return {
			success: false,
			error: new types_1.ValidationError(`${path} must be an integer`)
		};
		if (typeof def.const === "number") {
			if (value !== def.const) return {
				success: false,
				error: new types_1.ValidationError(`${path} must be ${def.const}`)
			};
		}
		if (Array.isArray(def.enum)) {
			if (!def.enum.includes(value)) return {
				success: false,
				error: new types_1.ValidationError(`${path} must be one of (${def.enum.join("|")})`)
			};
		}
		if (typeof def.maximum === "number") {
			if (value > def.maximum) return {
				success: false,
				error: new types_1.ValidationError(`${path} can not be greater than ${def.maximum}`)
			};
		}
		if (typeof def.minimum === "number") {
			if (value < def.minimum) return {
				success: false,
				error: new types_1.ValidationError(`${path} can not be less than ${def.minimum}`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function string(lexicons, path, def, value) {
		def = def;
		if (typeof value === "undefined") {
			if (typeof def.default === "string") return {
				success: true,
				value: def.default
			};
			return {
				success: false,
				error: new types_1.ValidationError(`${path} must be a string`)
			};
		} else if (typeof value !== "string") return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a string`)
		};
		if (typeof def.const === "string") {
			if (value !== def.const) return {
				success: false,
				error: new types_1.ValidationError(`${path} must be ${def.const}`)
			};
		}
		if (Array.isArray(def.enum)) {
			if (!def.enum.includes(value)) return {
				success: false,
				error: new types_1.ValidationError(`${path} must be one of (${def.enum.join("|")})`)
			};
		}
		if (typeof def.minLength === "number" || typeof def.maxLength === "number") {
			if (typeof def.minLength === "number" && value.length * 3 < def.minLength) return {
				success: false,
				error: new types_1.ValidationError(`${path} must not be shorter than ${def.minLength} characters`)
			};
			let canSkipUtf8LenChecks = false;
			if (typeof def.minLength === "undefined" && typeof def.maxLength === "number" && value.length * 3 <= def.maxLength) canSkipUtf8LenChecks = true;
			if (!canSkipUtf8LenChecks) {
				const len = (0, common_web_1.utf8Len)(value);
				if (typeof def.maxLength === "number") {
					if (len > def.maxLength) return {
						success: false,
						error: new types_1.ValidationError(`${path} must not be longer than ${def.maxLength} characters`)
					};
				}
				if (typeof def.minLength === "number") {
					if (len < def.minLength) return {
						success: false,
						error: new types_1.ValidationError(`${path} must not be shorter than ${def.minLength} characters`)
					};
				}
			}
		}
		if (typeof def.maxGraphemes === "number" || typeof def.minGraphemes === "number") {
			let needsMaxGraphemesCheck = false;
			let needsMinGraphemesCheck = false;
			if (typeof def.maxGraphemes === "number") {
				if (value.length <= def.maxGraphemes) needsMaxGraphemesCheck = false;
				else needsMaxGraphemesCheck = true;
			}
			if (typeof def.minGraphemes === "number") {
				if (value.length < def.minGraphemes) return {
					success: false,
					error: new types_1.ValidationError(`${path} must not be shorter than ${def.minGraphemes} graphemes`)
				};
				else needsMinGraphemesCheck = true;
			}
			if (needsMaxGraphemesCheck || needsMinGraphemesCheck) {
				const len = (0, common_web_1.graphemeLen)(value);
				if (typeof def.maxGraphemes === "number") {
					if (len > def.maxGraphemes) return {
						success: false,
						error: new types_1.ValidationError(`${path} must not be longer than ${def.maxGraphemes} graphemes`)
					};
				}
				if (typeof def.minGraphemes === "number") {
					if (len < def.minGraphemes) return {
						success: false,
						error: new types_1.ValidationError(`${path} must not be shorter than ${def.minGraphemes} graphemes`)
					};
				}
			}
		}
		if (typeof def.format === "string") switch (def.format) {
			case "datetime": return formats.datetime(path, value);
			case "uri": return formats.uri(path, value);
			case "at-uri": return formats.atUri(path, value);
			case "did": return formats.did(path, value);
			case "handle": return formats.handle(path, value);
			case "at-identifier": return formats.atIdentifier(path, value);
			case "nsid": return formats.nsid(path, value);
			case "cid": return formats.cid(path, value);
			case "language": return formats.language(path, value);
			case "tid": return formats.tid(path, value);
			case "record-key": return formats.recordKey(path, value);
		}
		return {
			success: true,
			value
		};
	}
	function bytes(lexicons, path, def, value) {
		def = def;
		if (!value || !(value instanceof Uint8Array)) return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a byte array`)
		};
		if (typeof def.maxLength === "number") {
			if (value.byteLength > def.maxLength) return {
				success: false,
				error: new types_1.ValidationError(`${path} must not be larger than ${def.maxLength} bytes`)
			};
		}
		if (typeof def.minLength === "number") {
			if (value.byteLength < def.minLength) return {
				success: false,
				error: new types_1.ValidationError(`${path} must not be smaller than ${def.minLength} bytes`)
			};
		}
		return {
			success: true,
			value
		};
	}
	function cidLink(lexicons, path, def, value) {
		if (cid_1.CID.asCID(value) === null) return {
			success: false,
			error: new types_1.ValidationError(`${path} must be a CID`)
		};
		return {
			success: true,
			value
		};
	}
	function unknown(lexicons, path, def, value) {
		if (!value || typeof value !== "object") return {
			success: false,
			error: new types_1.ValidationError(`${path} must be an object`)
		};
		return {
			success: true,
			value
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/validators/complex.js
var require_complex = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validate = validate;
	exports.array = array;
	exports.object = object;
	exports.validateOneOf = validateOneOf;
	var types_1 = require_types$2();
	var util_1 = require_util$1();
	var blob_1 = require_blob$6();
	var primitives_1 = require_primitives();
	function validate(lexicons, path, def, value) {
		switch (def.type) {
			case "object": return object(lexicons, path, def, value);
			case "array": return array(lexicons, path, def, value);
			case "blob": return (0, blob_1.blob)(lexicons, path, def, value);
			default: return (0, primitives_1.validate)(lexicons, path, def, value);
		}
	}
	function array(lexicons, path, def, value) {
		if (!Array.isArray(value)) return {
			success: false,
			error: new types_1.ValidationError(`${path} must be an array`)
		};
		if (typeof def.maxLength === "number") {
			if (value.length > def.maxLength) return {
				success: false,
				error: new types_1.ValidationError(`${path} must not have more than ${def.maxLength} elements`)
			};
		}
		if (typeof def.minLength === "number") {
			if (value.length < def.minLength) return {
				success: false,
				error: new types_1.ValidationError(`${path} must not have fewer than ${def.minLength} elements`)
			};
		}
		const itemsDef = def.items;
		for (let i = 0; i < value.length; i++) {
			const itemValue = value[i];
			const res = validateOneOf(lexicons, `${path}/${i}`, itemsDef, itemValue);
			if (!res.success) return res;
		}
		return {
			success: true,
			value
		};
	}
	function object(lexicons, path, def, value) {
		if (!(0, types_1.isObj)(value)) return {
			success: false,
			error: new types_1.ValidationError(`${path} must be an object`)
		};
		let resultValue = value;
		if ("properties" in def && def.properties != null) for (const key in def.properties) {
			const keyValue = value[key];
			if (keyValue === null && def.nullable?.includes(key)) continue;
			const propDef = def.properties[key];
			if (keyValue === void 0 && !def.required?.includes(key)) {
				if (propDef.type === "integer" || propDef.type === "boolean" || propDef.type === "string") {
					if (propDef.default === void 0) continue;
				} else continue;
			}
			const validated = validateOneOf(lexicons, `${path}/${key}`, propDef, keyValue);
			const propValue = validated.success ? validated.value : keyValue;
			if (propValue === void 0) {
				if (def.required?.includes(key)) return {
					success: false,
					error: new types_1.ValidationError(`${path} must have the property "${key}"`)
				};
			} else if (!validated.success) return validated;
			if (propValue !== keyValue) {
				if (resultValue === value) resultValue = { ...value };
				resultValue[key] = propValue;
			}
		}
		return {
			success: true,
			value: resultValue
		};
	}
	function validateOneOf(lexicons, path, def, value, mustBeObj = false) {
		let concreteDef;
		if (def.type === "union") {
			if (!(0, types_1.isDiscriminatedObject)(value)) return {
				success: false,
				error: new types_1.ValidationError(`${path} must be an object which includes the "$type" property`)
			};
			if (!refsContainType(def.refs, value.$type)) {
				if (def.closed) return {
					success: false,
					error: new types_1.ValidationError(`${path} $type must be one of ${def.refs.join(", ")}`)
				};
				return {
					success: true,
					value
				};
			} else concreteDef = lexicons.getDefOrThrow(value.$type);
		} else if (def.type === "ref") concreteDef = lexicons.getDefOrThrow(def.ref);
		else concreteDef = def;
		return mustBeObj ? object(lexicons, path, concreteDef, value) : validate(lexicons, path, concreteDef, value);
	}
	var refsContainType = (refs, type) => {
		const lexUri = (0, util_1.toLexUri)(type);
		if (refs.includes(lexUri)) return true;
		if (lexUri.endsWith("#main")) return refs.includes(lexUri.slice(0, -5));
		else return !lexUri.includes("#") && refs.includes(`${lexUri}#main`);
	};
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/validators/xrpc.js
var require_xrpc$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o) {
				var ar = [];
				for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.params = params;
	var types_1 = require_types$2();
	var complex_1 = require_complex();
	var PrimitiveValidators = __importStar(require_primitives());
	function params(lexicons, path, def, val) {
		const value = val && typeof val === "object" ? val : {};
		const requiredProps = new Set(def.required ?? []);
		let resultValue = value;
		if (typeof def.properties === "object") for (const key in def.properties) {
			const propDef = def.properties[key];
			const validated = propDef.type === "array" ? (0, complex_1.array)(lexicons, key, propDef, value[key]) : PrimitiveValidators.validate(lexicons, key, propDef, value[key]);
			const propValue = validated.success ? validated.value : value[key];
			const propIsUndefined = typeof propValue === "undefined";
			if (propIsUndefined && requiredProps.has(key)) return {
				success: false,
				error: new types_1.ValidationError(`${path} must have the property "${key}"`)
			};
			else if (!propIsUndefined && !validated.success) return validated;
			if (propValue !== value[key]) {
				if (resultValue === value) resultValue = { ...value };
				resultValue[key] = propValue;
			}
		}
		return {
			success: true,
			value: resultValue
		};
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/validation.js
var require_validation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.assertValidRecord = assertValidRecord;
	exports.assertValidXrpcParams = assertValidXrpcParams;
	exports.assertValidXrpcInput = assertValidXrpcInput;
	exports.assertValidXrpcOutput = assertValidXrpcOutput;
	exports.assertValidXrpcMessage = assertValidXrpcMessage;
	var complex_1 = require_complex();
	var xrpc_1 = require_xrpc$1();
	function assertValidRecord(lexicons, def, value) {
		const res = (0, complex_1.object)(lexicons, "Record", def.record, value);
		if (!res.success) throw res.error;
		return res.value;
	}
	function assertValidXrpcParams(lexicons, def, value) {
		if (def.parameters) {
			const res = (0, xrpc_1.params)(lexicons, "Params", def.parameters, value);
			if (!res.success) throw res.error;
			return res.value;
		}
	}
	function assertValidXrpcInput(lexicons, def, value) {
		if (def.input?.schema) return assertValidOneOf(lexicons, "Input", def.input.schema, value, true);
	}
	function assertValidXrpcOutput(lexicons, def, value) {
		if (def.output?.schema) return assertValidOneOf(lexicons, "Output", def.output.schema, value, true);
	}
	function assertValidXrpcMessage(lexicons, def, value) {
		if (def.message?.schema) return assertValidOneOf(lexicons, "Message", def.message.schema, value, true);
	}
	function assertValidOneOf(lexicons, path, def, value, mustBeObj = false) {
		const res = (0, complex_1.validateOneOf)(lexicons, path, def, value, mustBeObj);
		if (!res.success) throw res.error;
		return res.value;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/lexicons.js
var require_lexicons$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Lexicons = void 0;
	var types_1 = require_types$2();
	var util_1 = require_util$1();
	var validation_1 = require_validation();
	var complex_1 = require_complex();
	/**
	* A collection of compiled lexicons.
	*/
	var Lexicons = class {
		constructor(docs) {
			Object.defineProperty(this, "docs", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: /* @__PURE__ */ new Map()
			});
			Object.defineProperty(this, "defs", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: /* @__PURE__ */ new Map()
			});
			if (docs) for (const doc of docs) this.add(doc);
		}
		/**
		* @example clone a lexicon:
		* ```ts
		* const clone = new Lexicons(originalLexicon)
		* ```
		*
		* @example get docs array:
		* ```ts
		* const docs = Array.from(lexicons)
		* ```
		*/
		[Symbol.iterator]() {
			return this.docs.values();
		}
		/**
		* Add a lexicon doc.
		*/
		add(doc) {
			const uri = (0, util_1.toLexUri)(doc.id);
			if (this.docs.has(uri)) throw new Error(`${uri} has already been registered`);
			resolveRefUris(doc, uri);
			this.docs.set(uri, doc);
			for (const [defUri, def] of iterDefs(doc)) this.defs.set(defUri, def);
		}
		/**
		* Remove a lexicon doc.
		*/
		remove(uri) {
			uri = (0, util_1.toLexUri)(uri);
			const doc = this.docs.get(uri);
			if (!doc) throw new Error(`Unable to remove "${uri}": does not exist`);
			for (const [defUri, _def] of iterDefs(doc)) this.defs.delete(defUri);
			this.docs.delete(uri);
		}
		/**
		* Get a lexicon doc.
		*/
		get(uri) {
			uri = (0, util_1.toLexUri)(uri);
			return this.docs.get(uri);
		}
		/**
		* Get a definition.
		*/
		getDef(uri) {
			uri = (0, util_1.toLexUri)(uri);
			return this.defs.get(uri);
		}
		getDefOrThrow(uri, types) {
			const def = this.getDef(uri);
			if (!def) throw new types_1.LexiconDefNotFoundError(`Lexicon not found: ${uri}`);
			if (types && !types.includes(def.type)) throw new types_1.InvalidLexiconError(`Not a ${types.join(" or ")} lexicon: ${uri}`);
			return def;
		}
		/**
		* Validate a record or object.
		*/
		validate(lexUri, value) {
			if (!(0, types_1.isObj)(value)) throw new types_1.ValidationError(`Value must be an object`);
			const lexUriNormalized = (0, util_1.toLexUri)(lexUri);
			const def = this.getDefOrThrow(lexUriNormalized, ["record", "object"]);
			if (def.type === "record") return (0, complex_1.object)(this, "Record", def.record, value);
			else if (def.type === "object") return (0, complex_1.object)(this, "Object", def, value);
			else throw new types_1.InvalidLexiconError("Definition must be a record or object");
		}
		/**
		* Validate a record and throw on any error.
		*/
		assertValidRecord(lexUri, value) {
			if (!(0, types_1.isObj)(value)) throw new types_1.ValidationError(`Record must be an object`);
			if (!("$type" in value)) throw new types_1.ValidationError(`Record/$type must be a string`);
			const { $type } = value;
			if (typeof $type !== "string") throw new types_1.ValidationError(`Record/$type must be a string`);
			const lexUriNormalized = (0, util_1.toLexUri)(lexUri);
			if ((0, util_1.toLexUri)($type) !== lexUriNormalized) throw new types_1.ValidationError(`Invalid $type: must be ${lexUriNormalized}, got ${$type}`);
			const def = this.getDefOrThrow(lexUriNormalized, ["record"]);
			return (0, validation_1.assertValidRecord)(this, def, value);
		}
		/**
		* Validate xrpc query params and throw on any error.
		*/
		assertValidXrpcParams(lexUri, value) {
			lexUri = (0, util_1.toLexUri)(lexUri);
			const def = this.getDefOrThrow(lexUri, [
				"query",
				"procedure",
				"subscription"
			]);
			return (0, validation_1.assertValidXrpcParams)(this, def, value);
		}
		/**
		* Validate xrpc input body and throw on any error.
		*/
		assertValidXrpcInput(lexUri, value) {
			lexUri = (0, util_1.toLexUri)(lexUri);
			const def = this.getDefOrThrow(lexUri, ["procedure"]);
			return (0, validation_1.assertValidXrpcInput)(this, def, value);
		}
		/**
		* Validate xrpc output body and throw on any error.
		*/
		assertValidXrpcOutput(lexUri, value) {
			lexUri = (0, util_1.toLexUri)(lexUri);
			const def = this.getDefOrThrow(lexUri, ["query", "procedure"]);
			return (0, validation_1.assertValidXrpcOutput)(this, def, value);
		}
		/**
		* Validate xrpc subscription message and throw on any error.
		*/
		assertValidXrpcMessage(lexUri, value) {
			lexUri = (0, util_1.toLexUri)(lexUri);
			const def = this.getDefOrThrow(lexUri, ["subscription"]);
			return (0, validation_1.assertValidXrpcMessage)(this, def, value);
		}
		/**
		* Resolve a lex uri given a ref
		*/
		resolveLexUri(lexUri, ref) {
			lexUri = (0, util_1.toLexUri)(lexUri);
			return (0, util_1.toLexUri)(ref, lexUri);
		}
	};
	exports.Lexicons = Lexicons;
	function* iterDefs(doc) {
		for (const defId in doc.defs) {
			yield [`lex:${doc.id}#${defId}`, doc.defs[defId]];
			if (defId === "main") yield [`lex:${doc.id}`, doc.defs[defId]];
		}
	}
	function resolveRefUris(obj, baseUri) {
		for (const k in obj) if (obj.type === "ref") obj.ref = (0, util_1.toLexUri)(obj.ref, baseUri);
		else if (obj.type === "union") obj.refs = obj.refs.map((ref) => (0, util_1.toLexUri)(ref, baseUri));
		else if (Array.isArray(obj[k])) obj[k] = obj[k].map((item) => {
			if (typeof item === "string") return item.startsWith("#") ? (0, util_1.toLexUri)(item, baseUri) : item;
			else if (item && typeof item === "object") return resolveRefUris(item, baseUri);
			return item;
		});
		else if (obj[k] && typeof obj[k] === "object") obj[k] = resolveRefUris(obj[k], baseUri);
		return obj;
	}
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/serialize.js
var require_serialize = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.jsonStringToLex = exports.jsonToLex = exports.stringifyLex = exports.lexToJson = exports.ipldToLex = exports.lexToIpld = void 0;
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	var common_web_1 = require_dist$12();
	var blob_refs_1 = require_blob_refs();
	/**
	* @deprecated Use `LexValue` from `@atproto/lex-data` instead (which doesn't need conversion to IPLD).
	*/
	var lexToIpld = (val) => {
		if (Array.isArray(val)) return val.map((item) => (0, exports.lexToIpld)(item));
		if (val && typeof val === "object") {
			if (val instanceof blob_refs_1.BlobRef) return val.original;
			if (cid_1.CID.asCID(val) || val instanceof Uint8Array) return val;
			const toReturn = {};
			for (const key of Object.keys(val)) toReturn[key] = (0, exports.lexToIpld)(val[key]);
			return toReturn;
		}
		return val;
	};
	exports.lexToIpld = lexToIpld;
	/**
	* @deprecated Use `LexValue` from `@atproto/lex-data` instead instead (which doesn't need conversion to IPLD).
	*/
	var ipldToLex = (val) => {
		if (Array.isArray(val)) return val.map((item) => (0, exports.ipldToLex)(item));
		if (val && typeof val === "object") {
			if ((val["$type"] === "blob" || typeof val["cid"] === "string" && typeof val["mimeType"] === "string") && common_web_1.check.is(val, blob_refs_1.jsonBlobRef)) return blob_refs_1.BlobRef.fromJsonRef(val);
			if (cid_1.CID.asCID(val) || val instanceof Uint8Array) return val;
			const toReturn = {};
			for (const key of Object.keys(val)) toReturn[key] = (0, exports.ipldToLex)(val[key]);
			return toReturn;
		}
		return val;
	};
	exports.ipldToLex = ipldToLex;
	var lexToJson = (val) => {
		return (0, common_web_1.ipldToJson)((0, exports.lexToIpld)(val));
	};
	exports.lexToJson = lexToJson;
	var stringifyLex = (val) => {
		return JSON.stringify((0, exports.lexToJson)(val));
	};
	exports.stringifyLex = stringifyLex;
	var jsonToLex = (val) => {
		return (0, exports.ipldToLex)((0, common_web_1.jsonToIpld)(val));
	};
	exports.jsonToLex = jsonToLex;
	var jsonStringToLex = (val) => {
		return (0, exports.jsonToLex)(JSON.parse(val));
	};
	exports.jsonStringToLex = jsonStringToLex;
}));
//#endregion
//#region node_modules/@inlay/render/node_modules/@atproto/lexicon/dist/index.js
var require_dist$9 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_types$2(), exports);
	__exportStar(require_lexicons$1(), exports);
	__exportStar(require_blob_refs(), exports);
	__exportStar(require_serialize(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/object.js
var require_object$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isObject = isObject;
	exports.isPlainObject = isPlainObject;
	exports.isPlainProto = isPlainProto;
	/**
	* Checks whether the input is an object (not null).
	*
	* Returns true for any non-null value with typeof 'object', including
	* arrays, plain objects, class instances, etc.
	*
	* @param input - The value to check
	* @returns `true` if the input is an object (not null)
	*
	* @example
	* ```typescript
	* import { isObject } from '@atproto/lex-data'
	*
	* isObject({})           // true
	* isObject([1, 2, 3])    // true
	* isObject(new Date())   // true
	* isObject(null)         // false
	* isObject('string')     // false
	* ```
	*/
	function isObject(input) {
		return input != null && typeof input === "object";
	}
	var ObjectProto = Object.prototype;
	var ObjectToString = Object.prototype.toString;
	/**
	* Checks whether the input is a plain object.
	*
	* A plain object is an object (not null) whose prototype is either null
	* or `Object.prototype`. This excludes arrays, class instances, and other
	* special objects.
	*
	* @param input - The value to check
	* @returns `true` if the input is a plain object
	*
	* @example
	* ```typescript
	* import { isPlainObject } from '@atproto/lex-data'
	*
	* isPlainObject({})                    // true
	* isPlainObject({ a: 1 })              // true
	* isPlainObject(Object.create(null))   // true
	* isPlainObject([1, 2, 3])             // false
	* isPlainObject(new Date())            // false
	* isPlainObject(null)                  // false
	* ```
	*/
	function isPlainObject(input) {
		return isObject(input) && isPlainProto(input);
	}
	/**
	* Checks whether the prototype of an object is plain (null or Object.prototype).
	*
	* This is useful for checking if an object is a plain object without
	* checking that it's non-null first (the null check is already done).
	*
	* @param input - The object to check (must be non-null)
	* @returns `true` if the object's prototype is plain
	*
	* @example
	* ```typescript
	* import { isPlainProto } from '@atproto/lex-data'
	*
	* isPlainProto({})                    // true
	* isPlainProto(Object.create(null))   // true
	* isPlainProto([1, 2, 3])             // false (Array.prototype)
	* isPlainProto(new Date())            // false (Date.prototype)
	* ```
	*/
	function isPlainProto(input) {
		const proto = Object.getPrototypeOf(input);
		if (proto === null) return true;
		return (proto === ObjectProto || Object.getPrototypeOf(proto) === null) && ObjectToString.call(input) === "[object Object]";
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/lib/nodejs-buffer.js
var require_nodejs_buffer$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NodeJSBuffer = void 0;
	var BUFFER = /*#__PURE__*/ (() => "Bu" + "f".repeat(2) + "er")();
	exports.NodeJSBuffer = globalThis?.[BUFFER]?.prototype instanceof Uint8Array && "byteLength" in globalThis[BUFFER] ? globalThis[BUFFER] : /* v8 ignore next -- @preserve */ null;
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/uint8array-concat.js
var require_uint8array_concat$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8ConcatNode = void 0;
	exports.ui8ConcatPonyfill = ui8ConcatPonyfill;
	var Buffer = require_nodejs_buffer$2().NodeJSBuffer;
	exports.ui8ConcatNode = Buffer ? function ui8ConcatNode(array) {
		return Buffer.concat(array);
	} : /* v8 ignore next -- @preserve */ null;
	function ui8ConcatPonyfill(array) {
		let totalLength = 0;
		for (const arr of array) totalLength += arr.length;
		const result = new Uint8Array(totalLength);
		let offset = 0;
		for (const arr of array) {
			result.set(arr, offset);
			offset += arr.length;
		}
		return result;
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/uint8array-from-base64.js
var require_uint8array_from_base64$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromBase64Node = exports.fromBase64Native = void 0;
	exports.fromBase64Ponyfill = fromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer$2().NodeJSBuffer;
	exports.fromBase64Native = typeof Uint8Array.fromBase64 === "function" ? function fromBase64Native(b64, alphabet = "base64") {
		return Uint8Array.fromBase64(b64, {
			alphabet,
			lastChunkHandling: "loose"
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.fromBase64Node = Buffer ? function fromBase64Node(b64, alphabet = "base64") {
		const bytes = Buffer.from(b64, alphabet);
		verifyBase64ForBytes(b64, bytes);
		return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	} : /* v8 ignore next -- @preserve */ null;
	function fromBase64Ponyfill(b64, alphabet = "base64") {
		const bytes = (0, from_string_1.fromString)(b64, b64.endsWith("=") ? `${alphabet}pad` : alphabet);
		verifyBase64ForBytes(b64, bytes);
		return bytes;
	}
	function verifyBase64ForBytes(b64, bytes) {
		const paddingCount = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
		const trimmedLength = b64.length - paddingCount;
		const expectedByteLength = Math.floor(trimmedLength * 3 / 4);
		if (bytes.length !== expectedByteLength) throw new Error("Invalid base64 string");
		const expectedB64Length = bytes.length / 3 * 4;
		const expectedFullB64Length = expectedB64Length + (expectedB64Length % 4 === 0 ? 0 : 4 - expectedB64Length % 4);
		if (b64.length > expectedFullB64Length) throw new Error("Invalid base64 string");
		for (let i = Math.ceil(expectedB64Length); i < b64.length - paddingCount; i++) {
			const code = b64.charCodeAt(i);
			if (!(code >= 65 && code <= 90) && !(code >= 97 && code <= 122) && !(code >= 48 && code <= 57) && code !== 43 && code !== 47) throw new Error("Invalid base64 string");
		}
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/uint8array-to-base64.js
var require_uint8array_to_base64$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBase64Node = exports.toBase64Native = void 0;
	exports.toBase64Ponyfill = toBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var Buffer = require_nodejs_buffer$2().NodeJSBuffer;
	exports.toBase64Native = typeof Uint8Array.prototype.toBase64 === "function" ? function toBase64Native(bytes, alphabet = "base64") {
		return bytes.toBase64({
			alphabet,
			omitPadding: true
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.toBase64Node = Buffer ? function toBase64Node(bytes, alphabet = "base64") {
		const b64 = (bytes instanceof Buffer ? bytes : Buffer.from(bytes)).toString(alphabet);
		return b64.charCodeAt(b64.length - 1) === 61 ? b64.charCodeAt(b64.length - 2) === 61 ? b64.slice(0, -2) : b64.slice(0, -1) : b64;
	} : /* v8 ignore next -- @preserve */ null;
	function toBase64Ponyfill(bytes, alphabet = "base64") {
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/uint8array.js
var require_uint8array$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8Concat = exports.fromBase64 = exports.toBase64 = void 0;
	exports.ifUint8Array = ifUint8Array;
	exports.asUint8Array = asUint8Array;
	exports.ui8Equals = ui8Equals;
	var uint8array_concat_js_1 = require_uint8array_concat$2();
	var uint8array_from_base64_js_1 = require_uint8array_from_base64$2();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64$2();
	/**
	* Encodes a Uint8Array into a base64 string.
	*
	* Uses native Uint8Array.prototype.toBase64 when available (Node.js 24+, modern browsers),
	* falling back to Node.js Buffer or a ponyfill implementation.
	*
	* @param bytes - The binary data to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The base64 encoded string
	*
	* @example
	* ```typescript
	* import { toBase64 } from '@atproto/lex-data'
	*
	* const bytes = new Uint8Array([72, 101, 108, 108, 111])
	* toBase64(bytes)           // 'SGVsbG8='
	* toBase64(bytes, 'base64url')  // 'SGVsbG8' (URL-safe, no padding)
	* ```
	*/
	exports.toBase64 = uint8array_to_base64_js_1.toBase64Native ?? uint8array_to_base64_js_1.toBase64Node ?? uint8array_to_base64_js_1.toBase64Ponyfill;
	/**
	* Decodes a base64 string into a Uint8Array.
	*
	* Supports both padded and unpadded base64 strings. Uses native
	* Uint8Array.fromBase64 when available, falling back to Node.js Buffer
	* or a ponyfill implementation.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The decoded binary data
	* @throws If the input is not a valid base64 string
	*
	* @example
	* ```typescript
	* import { fromBase64 } from '@atproto/lex-data'
	*
	* fromBase64('SGVsbG8=')       // Uint8Array([72, 101, 108, 108, 111])
	* fromBase64('SGVsbG8', 'base64url')  // Same, URL-safe alphabet
	* ```
	*/
	exports.fromBase64 = uint8array_from_base64_js_1.fromBase64Native ?? uint8array_from_base64_js_1.fromBase64Node ?? uint8array_from_base64_js_1.fromBase64Ponyfill;
	/* v8 ignore next -- @preserve */
	if (exports.toBase64 === uint8array_to_base64_js_1.toBase64Ponyfill || exports.fromBase64 === uint8array_from_base64_js_1.fromBase64Ponyfill) {}
	/**
	* Returns the input if it is a Uint8Array, otherwise returns undefined.
	*
	* @param input - The value to check
	* @returns The input if it's a Uint8Array, otherwise undefined
	*
	* @example
	* ```typescript
	* import { ifUint8Array } from '@atproto/lex-data'
	*
	* ifUint8Array(new Uint8Array([1, 2]))  // Uint8Array([1, 2])
	* ifUint8Array('not binary')            // undefined
	* ifUint8Array(new ArrayBuffer(4))      // undefined
	* ```
	*/
	function ifUint8Array(input) {
		if (input instanceof Uint8Array) return input;
	}
	/**
	* Coerces various binary data representations into a Uint8Array.
	*
	* Handles the following input types:
	* - `Uint8Array` - Returned as-is
	* - `ArrayBufferView` (e.g., DataView, other TypedArrays) - Converted to Uint8Array
	* - `ArrayBuffer` - Wrapped in a Uint8Array
	*
	* @param input - The value to convert
	* @returns A Uint8Array, or `undefined` if the input could not be converted
	*
	* @example
	* ```typescript
	* import { asUint8Array } from '@atproto/lex-data'
	*
	* asUint8Array(new Uint8Array([1, 2]))     // Uint8Array([1, 2])
	* asUint8Array(new ArrayBuffer(4))         // Uint8Array of length 4
	* asUint8Array(new Int16Array([1, 2]))     // Uint8Array view of the buffer
	* asUint8Array('string')                   // undefined
	* ```
	*/
	function asUint8Array(input) {
		if (input instanceof Uint8Array) return input;
		if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength / Uint8Array.BYTES_PER_ELEMENT);
		if (input instanceof ArrayBuffer) return new Uint8Array(input);
	}
	/**
	* Compares two Uint8Arrays for byte-by-byte equality.
	*
	* @param a - First Uint8Array to compare
	* @param b - Second Uint8Array to compare
	* @returns `true` if both arrays have the same length and identical bytes
	*
	* @example
	* ```typescript
	* import { ui8Equals } from '@atproto/lex-data'
	*
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 3]))  // false
	* ui8Equals(new Uint8Array([1]), new Uint8Array([1, 2]))     // false
	* ```
	*/
	function ui8Equals(a, b) {
		if (a.byteLength !== b.byteLength) return false;
		for (let i = 0; i < a.byteLength; i++) if (a[i] !== b[i]) return false;
		return true;
	}
	/**
	* Concatenates multiple Uint8Arrays into a single Uint8Array.
	*
	* Uses Node.js Buffer.concat when available for performance,
	* falling back to a ponyfill implementation.
	*
	* @param arrays - The Uint8Arrays to concatenate
	* @returns A new Uint8Array containing all input bytes in order
	*
	* @example
	* ```typescript
	* import { ui8Concat } from '@atproto/lex-data'
	*
	* const a = new Uint8Array([1, 2])
	* const b = new Uint8Array([3, 4])
	* ui8Concat([a, b])  // Uint8Array([1, 2, 3, 4])
	* ```
	*/
	exports.ui8Concat = uint8array_concat_js_1.ui8ConcatNode ?? uint8array_concat_js_1.ui8ConcatPonyfill;
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/cid.js
var require_cid$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CID = exports.SHA512_HASH_CODE = exports.SHA256_HASH_CODE = exports.RAW_DATA_CODEC = exports.CBOR_DATA_CODEC = void 0;
	exports.multihashEquals = multihashEquals;
	exports.asMultiformatsCID = asMultiformatsCID;
	exports.isRawCid = isRawCid;
	exports.isDaslCid = isDaslCid;
	exports.isCborCid = isCborCid;
	exports.checkCid = checkCid;
	exports.isCid = isCid;
	exports.ifCid = ifCid;
	exports.asCid = asCid;
	exports.decodeCid = decodeCid;
	exports.parseCid = parseCid;
	exports.validateCidString = validateCidString;
	exports.parseCidSafe = parseCidSafe;
	exports.ensureValidCidString = ensureValidCidString;
	exports.isCidForBytes = isCidForBytes;
	exports.createCid = createCid;
	exports.cidForCbor = cidForCbor;
	exports.cidForRawBytes = cidForRawBytes;
	exports.cidForRawHash = cidForRawHash;
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	Object.defineProperty(exports, "CID", {
		enumerable: true,
		get: function() {
			return cid_1.CID;
		}
	});
	var digest_1 = (init_digest(), __toCommonJS(digest_exports));
	var sha2_1 = (init_sha2_browser(), __toCommonJS(sha2_browser_exports));
	var object_js_1 = require_object$3();
	var uint8array_js_1 = require_uint8array$2();
	/**
	* Codec code that indicates the CID references a CBOR-encoded data structure.
	*
	* Used when encoding structured data in AT Protocol repositories.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.CBOR_DATA_CODEC = 113;
	/**
	* Codec code that indicates the CID references raw binary data (like media blobs).
	*
	* Used in DASL CIDs for binary blobs like images and media.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.RAW_DATA_CODEC = 85;
	/**
	* Hash code that indicates that a CID uses SHA-256.
	*/
	exports.SHA256_HASH_CODE = sha2_1.sha256.code;
	/**
	* Hash code that indicates that a CID uses SHA-512.
	*/
	exports.SHA512_HASH_CODE = sha2_1.sha512.code;
	/**
	* Compares two {@link Multihash} for equality.
	*
	* @param a - First {@link Multihash}
	* @param b - Second {@link Multihash}
	* @returns `true` if both multihashes have the same code and digest
	*/
	function multihashEquals(a, b) {
		if (a === b) return true;
		return a.code === b.code && (0, uint8array_js_1.ui8Equals)(a.digest, b.digest);
	}
	/**
	* Converts a {@link Cid} to a multiformats {@link CID} instance.
	*
	* @deprecated Packages depending on `@atproto/lex-data` should use the
	* {@link Cid} interface instead of relying on `multiformats`'s {@link CID}
	* implementation directly. This is to avoid compatibility issues, and in order
	* to allow better portability, compatibility and future updates.
	*/
	function asMultiformatsCID(input) {
		return cid_1.CID.asCID(input) ?? cid_1.CID.create(input.version, input.code, (0, digest_1.create)(input.multihash.code, input.multihash.digest));
	}
	/**
	* Type guard to check if a CID is a raw binary CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a version 1 CID with raw multicodec
	*/
	function isRawCid(cid) {
		return cid.version === 1 && cid.code === exports.RAW_DATA_CODEC;
	}
	/**
	* Type guard to check if a CID is DASL compliant.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is DASL compliant (v1, raw/dag-cbor, sha256)
	*/
	function isDaslCid(cid) {
		return cid.version === 1 && (cid.code === exports.RAW_DATA_CODEC || cid.code === exports.CBOR_DATA_CODEC) && cid.multihash.code === exports.SHA256_HASH_CODE && cid.multihash.digest.byteLength === 32;
	}
	/**
	* Type guard to check if a CID is a DAG-CBOR CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a DAG-CBOR CID (v1, dag-cbor, sha256)
	*/
	function isCborCid(cid) {
		return cid.code === exports.CBOR_DATA_CODEC && isDaslCid(cid);
	}
	function checkCid(cid, options) {
		switch (options?.flavor) {
			case void 0: return true;
			case "cbor": return isCborCid(cid);
			case "dasl": return isDaslCid(cid);
			case "raw": return isRawCid(cid);
			default: throw new TypeError(`Unknown CID flavor: ${options?.flavor}`);
		}
	}
	function isCid(value, options) {
		return isCidImplementation(value) && checkCid(value, options);
	}
	function ifCid(value, options) {
		if (isCidImplementation(value) && checkCid(value, options)) return value;
		return null;
	}
	function asCid(value, options) {
		if (isCidImplementation(value) && checkCid(value, options)) return value;
		throw new Error("Not a valid CID");
	}
	function decodeCid(cidBytes, options) {
		return asCid(cid_1.CID.decode(cidBytes), options);
	}
	function parseCid(input, options) {
		return asCid(cid_1.CID.parse(input), options);
	}
	/**
	* Validates that a string is a valid CID representation.
	*
	* Unlike {@link parseCid}, this function returns a boolean instead of throwing.
	* It also verifies that the string is the canonical representation of the CID.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @returns `true` if the string is a valid CID
	*/
	function validateCidString(input, options) {
		return parseCidSafe(input, options)?.toString() === input;
	}
	function parseCidSafe(input, options) {
		try {
			return parseCid(input, options);
		} catch {
			return null;
		}
	}
	/**
	* Ensures that a string is a valid CID representation.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @throws If the string is not a valid CID
	*/
	function ensureValidCidString(input, options) {
		if (!validateCidString(input, options)) throw new Error(`Invalid CID string`);
	}
	/**
	* Verifies whether the multihash of a given {@link cid} matches the hash of the provided {@link bytes}.
	* @params cid The CID to match against the bytes.
	* @params bytes The bytes to verify.
	* @returns true if the CID matches the bytes, false otherwise.
	*/
	async function isCidForBytes(cid, bytes) {
		if (cid.multihash.code === sha2_1.sha256.code) return multihashEquals(await sha2_1.sha256.digest(bytes), cid.multihash);
		if (cid.multihash.code === sha2_1.sha512.code) return multihashEquals(await sha2_1.sha512.digest(bytes), cid.multihash);
		throw new Error("Unsupported CID multihash");
	}
	/**
	* Creates a CID from a multicodec, multihash code, and digest.
	*
	* @param code - The multicodec content type code
	* @param multihashCode - The multihash algorithm code
	* @param digest - The raw hash digest bytes
	* @returns A new CIDv1 instance
	*
	* @example
	* ```typescript
	* import { createCid, RAW_DATA_CODEC, SHA256_HASH_CODE } from '@atproto/lex-data'
	*
	* const cid = createCid(RAW_DATA_CODEC, SHA256_HASH_CODE, hashDigest)
	* ```
	*/
	function createCid(code, multihashCode, digest) {
		return cid_1.CID.createV1(code, (0, digest_1.create)(multihashCode, digest));
	}
	/**
	* Creates a DAG-CBOR CID for the given CBOR bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with DAG-CBOR multicodec.
	*
	* @param bytes - The CBOR-encoded bytes to hash
	* @returns A promise that resolves to the CborCid
	*/
	async function cidForCbor(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.CBOR_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID for the given binary bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with raw multicodec.
	*
	* @param bytes - The raw binary bytes to hash
	* @returns A promise that resolves to the RawCid
	*/
	async function cidForRawBytes(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.RAW_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID from an existing SHA-256 hash digest.
	*
	* @param digest - The SHA-256 hash digest (must be 32 bytes)
	* @returns A RawCid with the given digest
	* @throws If the digest length is not 32 bytes
	*/
	function cidForRawHash(digest) {
		if (digest.length !== 32) throw new Error(`Invalid SHA-256 hash length: ${digest.length}`);
		return createCid(exports.RAW_DATA_CODEC, sha2_1.sha256.code, digest);
	}
	function isCidImplementation(value) {
		if (cid_1.CID.asCID(value)) return value.bytes != null;
		else try {
			if (!(0, object_js_1.isObject)(value)) return false;
			const val = value;
			if (val.version !== 0 && val.version !== 1) return false;
			if (!isUint8(val.code)) return false;
			if (!(0, object_js_1.isObject)(val.multihash)) return false;
			const mh = val.multihash;
			if (!isUint8(mh.code)) return false;
			if (!(mh.digest instanceof Uint8Array)) return false;
			if (!(val.bytes instanceof Uint8Array)) return false;
			if (val.bytes[0] !== val.version) return false;
			if (val.bytes[1] !== val.code) return false;
			if (val.bytes[2] !== mh.code) return false;
			if (val.bytes[3] !== mh.digest.length) return false;
			if (val.bytes.length !== 4 + mh.digest.length) return false;
			if (!(0, uint8array_js_1.ui8Equals)(val.bytes.subarray(4), mh.digest)) return false;
			if (typeof val.equals !== "function") return false;
			if (val.equals(val) !== true) return false;
			return true;
		} catch {
			return false;
		}
	}
	function isUint8(val) {
		return Number.isInteger(val) && val >= 0 && val < 256;
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/blob.js
var require_blob$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isBlobRef = isBlobRef;
	exports.isLegacyBlobRef = isLegacyBlobRef;
	exports.enumBlobRefs = enumBlobRefs;
	var cid_js_1 = require_cid$3();
	var object_js_1 = require_object$3();
	function isBlobRef(input, options) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		if (input?.$type !== "blob") return false;
		const { mimeType, size, ref } = input;
		if (typeof mimeType !== "string" || !mimeType.includes("/")) return false;
		if (typeof size !== "number" || size < 0 || !Number.isSafeInteger(size)) return false;
		if (typeof ref !== "object" || ref === null) return false;
		for (const key in input) if (key !== "$type" && key !== "mimeType" && key !== "ref" && key !== "size") return false;
		if (!(0, cid_js_1.ifCid)(ref, options?.strict === false ? void 0 : { flavor: "raw" })) return false;
		return true;
	}
	/**
	* Type guard to check if a value is a valid {@link LegacyBlobRef}.
	*
	* Validates the structure of the input:
	* - `cid` must be a valid CID string
	* - `mimeType` must be a non-empty string
	* - No additional properties allowed
	*
	* @param input - The value to check
	* @returns `true` if the input is a valid LegacyBlobRef
	*
	* @example
	* ```typescript
	* import { isLegacyBlobRef } from '@atproto/lex-data'
	*
	* if (isLegacyBlobRef(data)) {
	*   console.log(data.cid)       // CID as string
	*   console.log(data.mimeType)  // e.g., 'image/jpeg'
	* }
	* ```
	*
	* @see {@link isBlobRef} for checking the current blob reference format
	*/
	function isLegacyBlobRef(input) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		const { cid, mimeType } = input;
		if (typeof cid !== "string") return false;
		if (typeof mimeType !== "string" || mimeType.length === 0) return false;
		for (const key in input) if (key !== "cid" && key !== "mimeType") return false;
		if (!(0, cid_js_1.validateCidString)(cid)) return false;
		return true;
	}
	function* enumBlobRefs(input, options) {
		const includeLegacy = options?.allowLegacy === true;
		const stack = [input];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if (value != null && typeof value === "object") {
				if (Array.isArray(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					stack.push(...value);
				} else if ((0, object_js_1.isPlainProto)(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					if (isBlobRef(value, options)) yield value;
					else if (includeLegacy && isLegacyBlobRef(value)) yield value;
					else for (const v of Object.values(value)) if (v != null) stack.push(v);
				}
			}
		} while (stack.length > 0);
		visited.clear();
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/lex-equals.js
var require_lex_equals$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexEquals = lexEquals;
	var cid_js_1 = require_cid$3();
	var object_js_1 = require_object$3();
	var uint8array_js_1 = require_uint8array$2();
	/**
	* Performs deep equality comparison between two {@link LexValue}s.
	*
	* This function correctly handles all Lexicon data types including:
	* - Primitives (string, number, boolean, null)
	* - Arrays (recursive element comparison)
	* - Objects/LexMaps (recursive key-value comparison)
	* - Uint8Arrays (byte-by-byte comparison)
	* - CIDs (using CID equality)
	*
	* @param a - First LexValue to compare
	* @param b - Second LexValue to compare
	* @returns `true` if the values are deeply equal
	* @throws {TypeError} If either value is not a valid LexValue (e.g., contains unsupported types)
	*
	* @example
	* ```typescript
	* import { lexEquals } from '@atproto/lex-data'
	*
	* // Primitives
	* lexEquals('hello', 'hello')  // true
	* lexEquals(42, 42)            // true
	*
	* // Arrays
	* lexEquals([1, 2, 3], [1, 2, 3])  // true
	* lexEquals([1, 2], [1, 2, 3])     // false
	*
	* // Objects
	* lexEquals({ a: 1, b: 2 }, { a: 1, b: 2 })  // true
	* lexEquals({ a: 1 }, { a: 1, b: 2 })        // false
	*
	* // CIDs
	* lexEquals(cid1, cid2)  // true if CIDs are equal
	*
	* // Uint8Arrays
	* lexEquals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ```
	*/
	function lexEquals(a, b) {
		if (Object.is(a, b)) return true;
		if (a == null || b == null || typeof a !== "object" || typeof b !== "object") return false;
		if (Array.isArray(a)) {
			if (!Array.isArray(b)) return false;
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) if (!lexEquals(a[i], b[i])) return false;
			return true;
		} else if (Array.isArray(b)) return false;
		if (ArrayBuffer.isView(a)) {
			if (!ArrayBuffer.isView(b)) return false;
			return (0, uint8array_js_1.ui8Equals)(a, b);
		} else if (ArrayBuffer.isView(b)) return false;
		if ((0, cid_js_1.isCid)(a)) return (0, cid_js_1.ifCid)(b)?.equals(a) === true;
		else if ((0, cid_js_1.isCid)(b)) return false;
		if (!(0, object_js_1.isPlainObject)(a) || !(0, object_js_1.isPlainObject)(b)) throw new TypeError("Invalid LexValue (expected CID, Uint8Array, or LexMap)");
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		for (const key of aKeys) {
			const aVal = a[key];
			const bVal = b[key];
			if (aVal === void 0) {
				if (bVal === void 0 && bKeys.includes(key)) continue;
				return false;
			} else if (bVal === void 0) return false;
			if (!lexEquals(aVal, bVal)) return false;
		}
		return true;
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/lex-error.js
var require_lex_error$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LexError = void 0;
	/**
	* Error class for Lexicon-related errors.
	*
	* LexError extends the standard JavaScript {@link Error} with AT Protocol-specific
	* functionality including:
	* - An error code for programmatic error handling
	* - JSON serialization for API responses
	* - HTTP Response generation
	*
	* @typeParam N - The specific error code type
	*
	* @example
	* ```typescript
	* import { LexError } from '@atproto/lex-data'
	*
	* // Throw a Lexicon error
	* throw new LexError('InvalidRequest', 'Missing required field')
	*
	* // Create and serialize
	* const error = new LexError('NotFound', 'Record not found')
	* console.log(error.toJSON())
	* // { error: 'NotFound', message: 'Record not found' }
	*
	* // Return as HTTP response
	* return error.toResponse()  // 400 Bad Request with JSON body
	* ```
	*/
	var LexError = class extends Error {
		error;
		name = "LexError";
		/**
		* Creates a new LexError.
		*
		* @param error - The error code identifying the type of error
		* @param message - Optional human-readable error message
		* @param options - Standard Error options (e.g., cause)
		*/
		constructor(error, message, options) {
			super(message, options);
			this.error = error;
		}
		/**
		* Returns a string representation of this error.
		*
		* @returns A formatted string: "LexError: [ERROR_CODE] message"
		*/
		toString() {
			return `${this.name}: [${this.error}] ${this.message}`;
		}
		/**
		* Converts this error to a JSON-serializable object.
		*
		* @returns The error data suitable for JSON serialization
		*/
		toJSON() {
			const { error, message } = this;
			return {
				error,
				message: message || void 0
			};
		}
		/**
		* Converts this error to an HTTP Response for downstream clients.
		*
		* Returns a 400 Bad Request response with the JSON-serialized error body.
		*
		* @returns A Response object with status 400 and JSON body
		*/
		toResponse() {
			return Response.json(this.toJSON(), { status: 400 });
		}
	};
	exports.LexError = LexError;
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/lex.js
var require_lex$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isLexMap = isLexMap;
	exports.isLexArray = isLexArray;
	exports.isLexScalar = isLexScalar;
	exports.isLexValue = isLexValue;
	exports.isTypedLexMap = isTypedLexMap;
	var cid_js_1 = require_cid$3();
	var object_js_1 = require_object$3();
	/**
	* Type guard to check if a value is a valid {@link LexMap}.
	*
	* Returns true if the value is a plain object where all values are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexMap
	*
	* @example
	* ```typescript
	* import { isLexMap } from '@atproto/lex'
	*
	* if (isLexMap(data)) {
	*   // data is narrowed to LexMap
	*   console.log(Object.keys(data))
	* }
	* ```
	*/
	function isLexMap(value) {
		return (0, object_js_1.isPlainObject)(value) && Object.values(value).every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexArray}.
	*
	* Returns true if the value is an array where all elements are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexArray
	*
	* @example
	* ```typescript
	* import { isLexArray } from '@atproto/lex'
	*
	* if (isLexArray(data)) {
	*   // data is narrowed to LexArray
	*   data.forEach(item => console.log(item))
	* }
	* ```
	*/
	function isLexArray(value) {
		return Array.isArray(value) && value.every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexScalar}.
	*
	* Returns true if the value is one of the primitive Lexicon types:
	* number (integer only), string, boolean, null, Cid, or Uint8Array.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexScalar
	*
	* @example
	* ```typescript
	* import { isLexScalar } from '@atproto/lex'
	*
	* isLexScalar('hello')     // true
	* isLexScalar(42)          // true
	* isLexScalar(3.14)        // false (floats not allowed)
	* isLexScalar([1, 2])      // false (arrays are not scalars)
	* ```
	*/
	function isLexScalar(value) {
		switch (typeof value) {
			case "object": return value === null || value instanceof Uint8Array || (0, cid_js_1.isCid)(value);
			case "string":
			case "boolean": return true;
			case "number": if (Number.isInteger(value)) return true;
			default: return false;
		}
	}
	/**
	* Type guard to check if a value is a valid {@link LexValue}.
	*
	* Performs a deep check to validate that the value (and all nested values)
	* conform to the Lexicon data model. This includes checking for:
	* - Valid scalar types (number, string, boolean, null, Cid, Uint8Array)
	* - Arrays containing only valid LexValues
	* - Plain objects with string keys and valid LexValue values
	* - No cyclic references (which cannot be serialized to JSON or CBOR)
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexValue
	*
	* @example
	* ```typescript
	* import { isLexValue } from '@atproto/lex'
	*
	* isLexValue({ name: 'Alice', tags: ['admin'] })  // true
	* isLexValue(new Date())                           // false (not a plain object)
	* isLexValue({ fn: () => {} })                     // false (functions not allowed)
	* ```
	*/
	function isLexValue(value) {
		const stack = [value];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if ((0, object_js_1.isPlainObject)(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...Object.values(value));
			} else if (Array.isArray(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...value);
			} else if (!isLexScalar(value)) return false;
		} while (stack.length > 0);
		visited.clear();
		return true;
	}
	/**
	* Type guard to check if a value is a {@link TypedLexMap}.
	*
	* Returns true if the value is a valid {@link LexMap} with a non-empty
	* `$type` string property.
	*
	* @param value - The LexValue to check
	* @returns `true` if the value is a TypedLexMap
	*
	* @example
	* ```typescript
	* import { isTypedLexMap } from '@atproto/lex'
	*
	* const data = { $type: 'app.bsky.feed.post', text: 'Hello' }
	*
	* if (isTypedLexMap(data)) {
	*   console.log(data.$type)  // 'app.bsky.feed.post'
	* }
	* ```
	*/
	function isTypedLexMap(value) {
		return isLexMap(value) && typeof value.$type === "string" && value.$type.length > 0;
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/utf8-from-base64.js
var require_utf8_from_base64$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64Node = void 0;
	exports.utf8FromBase64Ponyfill = utf8FromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer$2().NodeJSBuffer;
	exports.utf8FromBase64Node = Buffer ? function utf8FromBase64Node(b64, alphabet = "base64") {
		return Buffer.from(b64, alphabet).toString("utf8");
	} : /* v8 ignore next -- @preserve */ null;
	var textDecoder = /*#__PURE__*/ new TextDecoder();
	function utf8FromBase64Ponyfill(b64, alphabet) {
		const bytes = (0, from_string_1.fromString)(b64, alphabet);
		return textDecoder.decode(bytes);
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/utf8-grapheme-len.js
var require_utf8_grapheme_len$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.graphemeLenNative = void 0;
	exports.graphemeLenPonyfill = graphemeLenPonyfill;
	var grapheme_1 = require_grapheme();
	var segmenter = "Segmenter" in Intl && typeof Intl.Segmenter === "function" ? /*#__PURE__*/ new Intl.Segmenter() : /* v8 ignore next -- @preserve */ null;
	exports.graphemeLenNative = segmenter ? function graphemeLenNative(str) {
		let length = 0;
		for (const _ of segmenter.segment(str)) length++;
		return length;
	} : /* v8 ignore next -- @preserve */ null;
	function graphemeLenPonyfill(str) {
		return (0, grapheme_1.countGraphemes)(str);
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/utf8-len.js
var require_utf8_len$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8LenNode = void 0;
	exports.utf8LenCompute = utf8LenCompute;
	var nodejs_buffer_js_1 = require_nodejs_buffer$2();
	exports.utf8LenNode = nodejs_buffer_js_1.NodeJSBuffer ? function utf8LenNode(string) {
		return nodejs_buffer_js_1.NodeJSBuffer.byteLength(string, "utf8");
	} : /* v8 ignore next -- @preserve */ null;
	function utf8LenCompute(string) {
		let len = string.length;
		let code;
		for (let i = 0; i < string.length; i += 1) {
			code = string.charCodeAt(i);
			if (code <= 127) {} else if (code <= 2047) len += 1;
			else {
				len += 2;
				if (code >= 55296 && code <= 56319) {
					code = string.charCodeAt(i + 1);
					if (code >= 56320 && code <= 57343) i++;
				}
			}
		}
		return len;
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/utf8-to-base64.js
var require_utf8_to_base64$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8ToBase64Node = void 0;
	exports.utf8ToBase64Ponyfill = utf8ToBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var nodejs_buffer_js_1 = require_nodejs_buffer$2();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64$2();
	var Buffer = nodejs_buffer_js_1.NodeJSBuffer;
	exports.utf8ToBase64Node = Buffer ? function utf8ToBase64Node(text, alphabet) {
		const buffer = Buffer.from(text, "utf8");
		return uint8array_to_base64_js_1.toBase64Node(buffer, alphabet);
	} : /* v8 ignore next -- @preserve */ null;
	var textEncoder = /*#__PURE__*/ new TextEncoder();
	function utf8ToBase64Ponyfill(text, alphabet) {
		const bytes = textEncoder.encode(text);
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/utf8.js
var require_utf8$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64 = exports.utf8ToBase64 = exports.utf8Len = exports.graphemeLen = void 0;
	var utf8_from_base64_js_1 = require_utf8_from_base64$2();
	var utf8_grapheme_len_js_1 = require_utf8_grapheme_len$2();
	var utf8_len_js_1 = require_utf8_len$2();
	var utf8_to_base64_js_1 = require_utf8_to_base64$2();
	/**
	* Counts the number of grapheme clusters (user-perceived characters) in a string.
	*
	* Grapheme clusters represent what users typically think of as "characters",
	* handling complex cases like:
	* - Emoji with skin tones and ZWJ sequences (e.g., family emoji)
	* - Combined characters (e.g., 'e' + combining accent)
	* - Regional indicator pairs (flag emoji)
	*
	* Uses native {@link Intl.Segmenter} when available, falling back to a ponyfill.
	*
	* @param str - The string to measure
	* @returns The number of grapheme clusters
	*
	* @example
	* ```typescript
	* import { graphemeLen } from '@atproto/lex-data'
	*
	* graphemeLen('hello')        // 5
	* graphemeLen('cafe\u0301')   // 4 (cafe with combining accent)
	* graphemeLen('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 1 (family emoji)
	* ```
	*/
	exports.graphemeLen = utf8_grapheme_len_js_1.graphemeLenNative ?? utf8_grapheme_len_js_1.graphemeLenPonyfill;
	/* v8 ignore next -- @preserve */
	if (exports.graphemeLen === utf8_grapheme_len_js_1.graphemeLenPonyfill) {}
	/**
	* Calculates the UTF-8 byte length of a string.
	*
	* Returns the number of bytes the string would occupy when encoded as UTF-8.
	* This is important for Lexicon validation where schemas specify byte limits.
	*
	* Uses Node.js Buffer.byteLength when available for performance,
	* falling back to a computed implementation.
	*
	* @param str - The string to measure
	* @returns The UTF-8 byte length
	*
	* @example
	* ```typescript
	* import { utf8Len } from '@atproto/lex-data'
	*
	* utf8Len('hello')      // 5 (ASCII: 1 byte per char)
	* utf8Len('\u00e9')     // 2 (e with accent: 2 bytes)
	* utf8Len('\u{1F600}')  // 4 (emoji: 4 bytes)
	* utf8Len('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 25 (family emoji)
	* ```
	*/
	exports.utf8Len = utf8_len_js_1.utf8LenNode ?? utf8_len_js_1.utf8LenCompute;
	/**
	* Encodes a UTF-8 string to base64.
	*
	* First encodes the string as UTF-8 bytes, then encodes those bytes as base64.
	*
	* @param str - The string to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The base64-encoded string
	*
	* @example
	* ```typescript
	* import { utf8ToBase64 } from '@atproto/lex-data'
	*
	* utf8ToBase64('Hello')  // 'SGVsbG8='
	* ```
	*/
	exports.utf8ToBase64 = utf8_to_base64_js_1.utf8ToBase64Node ?? utf8_to_base64_js_1.utf8ToBase64Ponyfill;
	/**
	* Decodes a base64 string to UTF-8.
	*
	* Decodes the base64 to bytes, then interprets those bytes as UTF-8 text.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The decoded UTF-8 string
	*
	* @example
	* ```typescript
	* import { utf8FromBase64 } from '@atproto/lex-data'
	*
	* utf8FromBase64('SGVsbG8=')  // 'Hello'
	* ```
	*/
	exports.utf8FromBase64 = utf8_from_base64_js_1.utf8FromBase64Node ?? utf8_from_base64_js_1.utf8FromBase64Ponyfill;
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-data/dist/index.js
var require_dist$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_blob$5(), exports);
	tslib_1.__exportStar(require_cid$3(), exports);
	tslib_1.__exportStar(require_lex_equals$2(), exports);
	tslib_1.__exportStar(require_lex_error$2(), exports);
	tslib_1.__exportStar(require_lex$2(), exports);
	tslib_1.__exportStar(require_object$3(), exports);
	tslib_1.__exportStar(require_uint8array$2(), exports);
	tslib_1.__exportStar(require_utf8$2(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-json/dist/bytes.js
var require_bytes$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLexBytes = parseLexBytes;
	exports.encodeLexBytes = encodeLexBytes;
	var lex_data_1 = require_dist$8();
	/**
	* Parses a `{$bytes: string}` JSON object into a `Uint8Array`.
	*
	* In the AT Protocol data model, binary data is represented in JSON as an object
	* with a single `$bytes` property containing a base64-encoded string. This function
	* decodes that representation back into raw bytes.
	*
	* @param input - An object potentially containing a `$bytes` property
	* @returns The decoded `Uint8Array` if the input is a valid `$bytes` object,
	*          or `undefined` if the input is not a valid `$bytes` representation
	*
	* @example
	* ```typescript
	* // Parse a $bytes object to Uint8Array
	* const bytes = parseLexBytes({ $bytes: 'SGVsbG8sIHdvcmxkIQ==' })
	* // bytes is Uint8Array containing "Hello, world!"
	*
	* // Returns undefined for non-$bytes objects
	* const result = parseLexBytes({ foo: 'bar' })
	* // result is undefined
	*
	* // Returns undefined for objects with extra properties
	* const invalid = parseLexBytes({ $bytes: 'SGVsbG8=', extra: true })
	* // invalid is undefined
	* ```
	*/
	function parseLexBytes(input) {
		if (!input || !("$bytes" in input)) return;
		for (const key in input) if (key !== "$bytes") return;
		if (typeof input.$bytes !== "string") return;
		try {
			return (0, lex_data_1.fromBase64)(input.$bytes);
		} catch {
			return;
		}
	}
	/**
	* Encodes a `Uint8Array` into a `{$bytes: string}` JSON representation.
	*
	* In the AT Protocol data model, binary data is represented in JSON as an object
	* with a single `$bytes` property containing a base64-encoded string. This function
	* performs that encoding.
	*
	* @param bytes - The binary data to encode
	* @returns An object with a `$bytes` property containing the base64-encoded data
	*
	* @example
	* ```typescript
	* const bytes = new TextEncoder().encode('Hello, world!')
	* const encoded = encodeLexBytes(bytes)
	* // encoded is { $bytes: 'SGVsbG8sIHdvcmxkIQ==' }
	* ```
	*/
	function encodeLexBytes(bytes) {
		return { $bytes: (0, lex_data_1.toBase64)(bytes) };
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-json/dist/json.js
var require_json$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-json/dist/link.js
var require_link$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLexLink = parseLexLink;
	exports.encodeLexLink = encodeLexLink;
	var lex_data_1 = require_dist$8();
	function parseLexLink(input, options) {
		if (!input || !("$link" in input)) return;
		for (const key in input) if (key !== "$link") return;
		const { $link } = input;
		if (typeof $link !== "string") return;
		if ($link.length === 0) return;
		if ($link.length > 2048) return;
		try {
			return (0, lex_data_1.parseCid)($link, options);
		} catch (cause) {
			return;
		}
	}
	/**
	* Encodes a {@link Cid} instance into a `{$link: string}` JSON representation.
	*
	* In the AT Protocol data model, CID references are represented in JSON as an
	* object with a single `$link` property containing a base32-encoded CID string,
	* prefixed with "b". This function performs that encoding.
	*
	* @param cid - The CID to encode
	* @returns An object with a `$link` property containing the string representation of the CID
	*
	* @example
	* ```typescript
	* const cid = CID.parse('bafyreib2rxk3rybloqtqwbo')
	* const encoded = encodeLexLink(cid)
	* // encoded is { $link: 'bafyreib2rxk3rybloqtqwbo' }
	* ```
	*/
	function encodeLexLink(cid) {
		return { $link: cid.toString() };
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-json/dist/blob.js
var require_blob$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseBlobRef = parseBlobRef;
	var lex_data_1 = require_dist$8();
	var link_js_1 = require_link$1();
	/**
	* Parses a blob reference from a JSON object.
	*
	* In the AT Protocol, blobs are referenced using a specific object structure
	* with `$type: 'blob'`, a `ref` property containing a CID link, and metadata
	* like `mimeType` and `size`. This function validates and parses such objects
	* into `BlobRef` instances.
	*
	* The function handles both cases where the `ref` property is:
	* - A `{$link: string}` object (when parsing from JSON)
	* - Already a `Cid` instance (when the parent object has been partially converted)
	*
	* @param input - A Lex map potentially representing a blob reference
	* @param options - Optional blob reference validation options
	* @returns The parsed `BlobRef` if the input is a valid blob reference,
	*          or `undefined` if the input is not a valid blob representation
	*
	* @example
	* ```typescript
	* // Parse a blob reference from JSON
	* const blobRef = parseBlobRef({
	*   $type: 'blob',
	*   ref: { $link: 'bafyreib2rxk3rybloqtqwbo' },
	*   mimeType: 'image/png',
	*   size: 12345
	* })
	*
	* // blobRef.ref is a Cid instance
	*
	* // Returns undefined for non-blob objects
	* const result = parseBlobRef({ foo: 'bar' })
	* // result is undefined
	* ```
	*/
	function parseBlobRef(input, options) {
		if (input.$type !== "blob") return void 0;
		const ref = input?.ref;
		if (!ref || typeof ref !== "object") return void 0;
		if ("$link" in ref) {
			const cid = (0, link_js_1.parseLexLink)(ref);
			if (!cid) return void 0;
			const blob = {
				...input,
				ref: cid
			};
			if ((0, lex_data_1.isBlobRef)(blob, options)) return blob;
		}
		if ((0, lex_data_1.isBlobRef)(input)) return input;
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-json/dist/lex-json.js
var require_lex_json$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexStringify = lexStringify;
	exports.lexParse = lexParse;
	exports.jsonToLex = jsonToLex;
	exports.lexToJson = lexToJson;
	var lex_data_1 = require_dist$8();
	var blob_js_1 = require_blob$4();
	var bytes_js_1 = require_bytes$2();
	var link_js_1 = require_link$1();
	/**
	* Serialize a Lex value to a JSON string.
	*
	* This function serializes AT Protocol data model values to JSON, automatically
	* encoding special types:
	* - `Cid` instances are encoded as `{$link: string}`
	* - `Uint8Array` instances are encoded as `{$bytes: string}` (base64)
	*
	* @param input - The Lex value to stringify
	* @returns A JSON string representation of the value
	*
	* @example
	* ```typescript
	* import { lexStringify } from '@atproto/lex'
	*
	* // Stringify with CID and bytes encoding
	* const json = lexStringify({
	*   ref: someCid,
	*   data: new Uint8Array([72, 101, 108, 108, 111])
	* })
	* // json is '{"ref":{"$link":"bafyrei..."},"data":{"$bytes":"SGVsbG8="}}'
	* ```
	*/
	function lexStringify(input) {
		return JSON.stringify(lexToJson(input));
	}
	/**
	* Parses a JSON string into Lex values.
	*
	* This function parses JSON and automatically decodes AT Protocol special types:
	* - `{$link: string}` objects are decoded to `Cid` instances
	* - `{$bytes: string}` objects are decoded to `Uint8Array` instances
	* - `{$type: 'blob'}` objects are validated
	*
	* @typeParam T - Type cast for the resulting Lex value. Use when you want to specify the expected structure of the parsed data.
	* @param input - The JSON string to parse
	* @param options - Parsing options (e.g., strict mode)
	* @returns The parsed Lex value
	* @throws {SyntaxError} If the input is not valid JSON
	* @throws {TypeError} If strict mode is enabled and invalid Lex values are found
	*
	* @example
	* ```typescript
	* import { lexParse } from '@atproto/lex'
	*
	* // Parse JSON with $link and $bytes decoding
	* const parsed = lexParse<{
	*   ref: Cid
	*   data: Uint8Array
	* }>(`{
	*   "ref": { "$link": "bafyrei..." },
	*   "data": { "$bytes": "SGVsbG8sIHdvcmxkIQ==" }
	* }`)
	*
	* // Parse a single CID
	* const someCid = lexParse<Cid>('{"$link": "bafyrei..."}')
	*
	* // Parse binary data
	* const someBytes = lexParse<Uint8Array>('{"$bytes": "SGVsbG8sIHdvcmxkIQ=="}')
	* ```
	*/
	function lexParse(input, options = { strict: false }) {
		return JSON.parse(input, function(key, value) {
			switch (typeof value) {
				case "object":
					if (value === null) return null;
					if (Array.isArray(value)) return value;
					return parseSpecialJsonObject(value, options) ?? value;
				case "number":
					if (Number.isSafeInteger(value)) return value;
					if (options.strict) throw new TypeError(`Invalid non-integer number: ${value}`);
				default: return value;
			}
		});
	}
	/**
	* Converts a parsed JSON representation of Lexicon value to a {@link LexValue}.
	*
	* This function transforms already-parsed JSON objects into Lex values by
	* decoding AT Protocol special types:
	* - `{$link: string}` objects are converted to `Cid` instances
	* - `{$bytes: string}` objects are converted to `Uint8Array` instances
	*
	* Use this when you have a JavaScript object (e.g., from `JSON.parse()`) and
	* need to convert it to the Lex data model. For parsing JSON strings directly,
	* use {@link lexParse} instead.
	*
	* @param value - The JSON value to convert
	* @param options - Parsing options (e.g., strict mode)
	* @returns The converted Lex value
	* @throws {TypeError} If strict mode is enabled and invalid Lex values are found
	* @throws {TypeError} If the value contains unsupported types (e.g., undefined at top level)
	*
	* @example
	* ```typescript
	* import { jsonToLex } from '@atproto/lex'
	*
	* // Convert parsed JSON to Lex values
	* const lex = jsonToLex({
	*   ref: { $link: 'bafyrei...' },  // Converted to Cid
	*   data: { $bytes: 'SGVsbG8sIHdvcmxkIQ==' }  // Converted to Uint8Array
	* })
	* ```
	*/
	function jsonToLex(value, options = { strict: false }) {
		switch (typeof value) {
			case "object":
				if (value === null) return null;
				if (Array.isArray(value)) return jsonArrayToLex(value, options);
				return parseSpecialJsonObject(value, options) ?? jsonObjectToLexMap(value, options);
			case "number":
				if (Number.isSafeInteger(value)) return value;
				if (options.strict) throw new TypeError(`Invalid non-integer number: ${value}`);
			case "boolean":
			case "string": return value;
			default: throw new TypeError(`Invalid JSON value: ${typeof value}`);
		}
	}
	function jsonArrayToLex(input, options) {
		let copy;
		for (let i = 0; i < input.length; i++) {
			const inputItem = input[i];
			const item = jsonToLex(inputItem, options);
			if (item !== inputItem) {
				copy ?? (copy = Array.from(input));
				copy[i] = item;
			}
		}
		return copy ?? input;
	}
	function jsonObjectToLexMap(input, options) {
		let copy = void 0;
		for (const [key, jsonValue] of Object.entries(input)) {
			if (key === "__proto__") throw new TypeError("Invalid key: __proto__");
			if (jsonValue === void 0) {
				copy ?? (copy = { ...input });
				delete copy[key];
				continue;
			}
			const value = jsonToLex(jsonValue, options);
			if (value !== jsonValue) {
				copy ?? (copy = { ...input });
				copy[key] = value;
			}
		}
		return copy ?? input;
	}
	/**
	* Converts a Lex value to a JSON-compatible value.
	*
	* This function transforms Lex data model values into plain JavaScript objects
	* suitable for JSON serialization:
	* - `Cid` instances are converted to `{$link: string}` objects
	* - `Uint8Array` instances are converted to `{$bytes: string}` objects (base64)
	*
	* Use this when you need to convert Lex values to plain objects (e.g., for
	* custom serialization or inspection). For direct JSON string output, use
	* {@link lexStringify} instead.
	*
	* @param value - The Lex value to convert
	* @returns The JSON-compatible value
	* @throws {TypeError} If the value contains unsupported types
	*
	* @example
	* ```typescript
	* import { lexToJson } from '@atproto/lex'
	*
	* // Convert Lex values to JSON-compatible objects
	* const obj = lexToJson({
	*   ref: someCid,      // Converted to { $link: string }
	*   data: someBytes    // Converted to { $bytes: string }
	* })
	* ```
	*/
	function lexToJson(value) {
		switch (typeof value) {
			case "object": if (value === null) return value;
			else if (Array.isArray(value)) return lexArrayToJson(value);
			else if ((0, lex_data_1.isCid)(value)) return (0, link_js_1.encodeLexLink)(value);
			else if (ArrayBuffer.isView(value)) return (0, bytes_js_1.encodeLexBytes)(value);
			else return encodeLexMap(value);
			case "boolean":
			case "string":
			case "number": return value;
			default: throw new TypeError(`Invalid Lex value: ${typeof value}`);
		}
	}
	function lexArrayToJson(input) {
		let copy;
		for (let i = 0; i < input.length; i++) {
			const inputItem = input[i];
			const item = lexToJson(inputItem);
			if (item !== inputItem) {
				copy ?? (copy = Array.from(input));
				copy[i] = item;
			}
		}
		return copy ?? input;
	}
	function encodeLexMap(input) {
		let copy = void 0;
		for (const [key, lexValue] of Object.entries(input)) {
			if (key === "__proto__") throw new TypeError("Invalid key: __proto__");
			if (lexValue === void 0) {
				copy ?? (copy = { ...input });
				delete copy[key];
				continue;
			}
			const jsonValue = lexToJson(lexValue);
			if (jsonValue !== lexValue) {
				copy ?? (copy = { ...input });
				copy[key] = jsonValue;
			}
		}
		return copy ?? input;
	}
	function parseSpecialJsonObject(input, options) {
		if (input.$link !== void 0) {
			const cid = (0, link_js_1.parseLexLink)(input);
			if (cid) return cid;
			if (options.strict) throw new TypeError(`Invalid $link object`);
		} else if (input.$bytes !== void 0) {
			const bytes = (0, bytes_js_1.parseLexBytes)(input);
			if (bytes) return bytes;
			if (options.strict) throw new TypeError(`Invalid $bytes object`);
		} else if (input.$type !== void 0) {
			if (options.strict) {
				if (input.$type === "blob") {
					const blob = (0, blob_js_1.parseBlobRef)(input, options);
					if (blob) return blob;
					throw new TypeError(`Invalid blob object`);
				} else if (typeof input.$type !== "string") throw new TypeError(`Invalid $type property (${typeof input.$type})`);
				else if (input.$type.length === 0) throw new TypeError(`Empty $type property`);
			}
		}
	}
}));
//#endregion
//#region node_modules/@atproto/lex/node_modules/@atproto/lex-json/dist/index.js
var require_dist$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_bytes$2(), exports);
	tslib_1.__exportStar(require_json$1(), exports);
	tslib_1.__exportStar(require_lex_json$1(), exports);
	tslib_1.__exportStar(require_link$1(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/$type.js
var require_$type = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$type = $type;
	exports.$typed = $typed;
	/**
	* Constructs a `$type` string value from an NSID and definition name.
	*
	* For the "main" definition, returns just the NSID. For named definitions,
	* returns the NSID followed by `#` and the definition name.
	*
	* @typeParam N - The NSID string type
	* @typeParam H - The definition name type
	* @param nsid - The NSID of the lexicon
	* @param hash - The definition name within the lexicon (use `'main'` for the main definition)
	* @returns The constructed `$type` string
	*
	* @example
	* ```typescript
	* $type('app.bsky.feed.post', 'main')
	* // Returns: 'app.bsky.feed.post'
	*
	* $type('app.bsky.feed.defs', 'postView')
	* // Returns: 'app.bsky.feed.defs#postView'
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function $type(nsid, hash) {
		return hash === "main" ? nsid : `${nsid}#${hash}`;
	}
	/**
	* Ensures an object has the specified `$type` property.
	*
	* If the object already has the correct `$type`, returns it unchanged.
	* Otherwise, creates a new object with the `$type` property added.
	*
	* @typeParam V - The object type (may already have `$type`)
	* @typeParam T - The expected `$type` string
	* @param value - The object to add `$type` to
	* @param $type - The `$type` value to ensure
	* @returns The object with the `$type` property
	*
	* @example
	* ```typescript
	* const post = $typed({ text: 'hello' }, 'app.bsky.feed.post')
	* // Result: { $type: 'app.bsky.feed.post', text: 'hello' }
	*
	* // If already typed, returns same object
	* const typed = { $type: 'app.bsky.feed.post', text: 'hello' }
	* const same = $typed(typed, 'app.bsky.feed.post')
	* console.log(typed === same) // true
	* ```
	*/
	function $typed(value, $type) {
		return value.$type === $type ? value : {
			...value,
			$type
		};
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/property-key.js
var require_property_key = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/did.js
var require_did = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDidError = void 0;
	exports.ensureValidDid = ensureValidDid;
	exports.ensureValidDidRegex = ensureValidDidRegex;
	exports.isValidDid = isValidDid;
	function ensureValidDid(input) {
		if (!input.startsWith("did:")) throw new InvalidDidError("DID requires \"did:\" prefix");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
		if (input.endsWith(":") || input.endsWith("%")) throw new InvalidDidError("DID can not end with \":\" or \"%\"");
		if (!/^[a-zA-Z0-9._:%-]*$/.test(input)) throw new InvalidDidError("Disallowed characters in DID (ASCII letters, digits, and a couple other characters only)");
		const { length, 1: method } = input.split(":");
		if (length < 3) throw new InvalidDidError("DID requires prefix, method, and method-specific content");
		if (!/^[a-z]+$/.test(method)) throw new InvalidDidError("DID method must be lower-case letters");
	}
	var DID_REGEX = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
	function ensureValidDidRegex(input) {
		if (!DID_REGEX.test(input)) throw new InvalidDidError("DID didn't validate via regex");
		if (input.length > 2048) throw new InvalidDidError("DID is too long (2048 chars max)");
	}
	function isValidDid(input) {
		return input.length <= 2048 && DID_REGEX.test(input);
	}
	var InvalidDidError = class extends Error {};
	exports.InvalidDidError = InvalidDidError;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/handle.js
var require_handle = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DisallowedDomainError = exports.UnsupportedDomainError = exports.ReservedHandleError = exports.InvalidHandleError = exports.DISALLOWED_TLDS = exports.INVALID_HANDLE = void 0;
	exports.ensureValidHandle = ensureValidHandle;
	exports.ensureValidHandleRegex = ensureValidHandleRegex;
	exports.normalizeHandle = normalizeHandle;
	exports.normalizeAndEnsureValidHandle = normalizeAndEnsureValidHandle;
	exports.isValidHandle = isValidHandle;
	exports.isValidTld = isValidTld;
	exports.INVALID_HANDLE = "handle.invalid";
	exports.DISALLOWED_TLDS = [
		".local",
		".arpa",
		".invalid",
		".localhost",
		".internal",
		".example",
		".alt",
		".onion"
	];
	function ensureValidHandle(input) {
		if (!/^[a-zA-Z0-9.-]*$/.test(input)) throw new InvalidHandleError("Disallowed characters in handle (ASCII letters, digits, dashes, periods only)");
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		const labels = input.split(".");
		if (labels.length < 2) throw new InvalidHandleError("Handle domain needs at least two parts");
		for (let i = 0; i < labels.length; i++) {
			const l = labels[i];
			if (l.length < 1) throw new InvalidHandleError("Handle parts can not be empty");
			if (l.length > 63) throw new InvalidHandleError("Handle part too long (max 63 chars)");
			if (l.endsWith("-") || l.startsWith("-")) throw new InvalidHandleError("Handle parts can not start or end with hyphens");
			if (i + 1 === labels.length && !/^[a-zA-Z]/.test(l)) throw new InvalidHandleError("Handle final component (TLD) must start with ASCII letter");
		}
	}
	var HANDLE_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
	function ensureValidHandleRegex(input) {
		if (input.length > 253) throw new InvalidHandleError("Handle is too long (253 chars max)");
		if (!HANDLE_REGEX.test(input)) throw new InvalidHandleError("Handle didn't validate via regex");
	}
	function normalizeHandle(handle) {
		return handle.toLowerCase();
	}
	function normalizeAndEnsureValidHandle(handle) {
		const normalized = normalizeHandle(handle);
		ensureValidHandle(normalized);
		return normalized;
	}
	function isValidHandle(input) {
		return input.length <= 253 && HANDLE_REGEX.test(input);
	}
	function isValidTld(handle) {
		for (const tld of exports.DISALLOWED_TLDS) if (handle.endsWith(tld)) return false;
		return true;
	}
	var InvalidHandleError = class extends Error {};
	exports.InvalidHandleError = InvalidHandleError;
	/** @deprecated Never used */
	var ReservedHandleError = class extends Error {};
	exports.ReservedHandleError = ReservedHandleError;
	/** @deprecated Never used */
	var UnsupportedDomainError = class extends Error {};
	exports.UnsupportedDomainError = UnsupportedDomainError;
	/** @deprecated Never used */
	var DisallowedDomainError = class extends Error {};
	exports.DisallowedDomainError = DisallowedDomainError;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/at-identifier.js
var require_at_identifier = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ensureValidAtIdentifier = ensureValidAtIdentifier;
	exports.isValidAtIdentifier = isValidAtIdentifier;
	var did_js_1 = require_did();
	var handle_js_1 = require_handle();
	function ensureValidAtIdentifier(input) {
		try {
			if (input.startsWith("did:")) (0, did_js_1.ensureValidDidRegex)(input);
			else (0, handle_js_1.ensureValidHandleRegex)(input);
		} catch (cause) {
			throw new handle_js_1.InvalidHandleError("Invalid DID or handle", { cause });
		}
	}
	function isValidAtIdentifier(input) {
		if (input.startsWith("did:")) return (0, did_js_1.isValidDid)(input);
		else return (0, handle_js_1.isValidHandle)(input);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/nsid.js
var require_nsid = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidNsidError = exports.NSID = void 0;
	exports.ensureValidNsid = ensureValidNsid;
	exports.parseNsid = parseNsid;
	exports.isValidNsid = isValidNsid;
	exports.validateNsid = validateNsid;
	exports.ensureValidNsidRegex = ensureValidNsidRegex;
	exports.validateNsidRegex = validateNsidRegex;
	exports.NSID = class NSID {
		segments;
		static parse(input) {
			return new NSID(input);
		}
		static create(authority, name) {
			const input = [...authority.split(".").reverse(), name].join(".");
			return new NSID(input);
		}
		static isValid(nsid) {
			return isValidNsid(nsid);
		}
		static from(input) {
			if (input instanceof NSID) return input;
			if (Array.isArray(input)) return new NSID(input.join("."));
			return new NSID(String(input));
		}
		constructor(nsid) {
			this.segments = parseNsid(nsid);
		}
		get authority() {
			return this.segments.slice(0, this.segments.length - 1).reverse().join(".");
		}
		get name() {
			return this.segments.at(this.segments.length - 1);
		}
		toString() {
			return this.segments.join(".");
		}
	};
	function ensureValidNsid(input) {
		const result = validateNsid(input);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	function parseNsid(nsid) {
		const result = validateNsid(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
		return result.value;
	}
	function isValidNsid(input) {
		return validateNsidRegex(input).success;
	}
	function validateNsid(input) {
		if (input.length > 317) return {
			success: false,
			message: "NSID is too long (317 chars max)"
		};
		if (hasDisallowedCharacters(input)) return {
			success: false,
			message: "Disallowed characters in NSID (ASCII letters, digits, dashes, periods only)"
		};
		const segments = input.split(".");
		if (segments.length < 3) return {
			success: false,
			message: "NSID needs at least three parts"
		};
		for (const l of segments) {
			if (l.length < 1) return {
				success: false,
				message: "NSID parts can not be empty"
			};
			if (l.length > 63) return {
				success: false,
				message: "NSID part too long (max 63 chars)"
			};
			if (startsWithHyphen(l) || endsWithHyphen(l)) return {
				success: false,
				message: "NSID parts can not start or end with hyphen"
			};
		}
		if (startsWithNumber(segments[0])) return {
			success: false,
			message: "NSID first part may not start with a digit"
		};
		if (!isValidIdentifier(segments[segments.length - 1])) return {
			success: false,
			message: "NSID name part must be only letters and digits (and no leading digit)"
		};
		return {
			success: true,
			value: segments
		};
	}
	function hasDisallowedCharacters(v) {
		return !/^[a-zA-Z0-9.-]*$/.test(v);
	}
	function startsWithNumber(v) {
		const charCode = v.charCodeAt(0);
		return charCode >= 48 && charCode <= 57;
	}
	function startsWithHyphen(v) {
		return v.charCodeAt(0) === 45;
	}
	function endsWithHyphen(v) {
		return v.charCodeAt(v.length - 1) === 45;
	}
	function isValidIdentifier(v) {
		return !startsWithNumber(v) && !v.includes("-");
	}
	/**
	* @deprecated Use {@link ensureValidNsid} if you care about error details,
	* {@link parseNsid}/{@link NSID.parse} if you need the parsed segments, or
	* {@link isValidNsid} if you just want a boolean.
	*/
	function ensureValidNsidRegex(nsid) {
		const result = validateNsidRegex(nsid);
		if (!result.success) throw new InvalidNsidError(result.message);
	}
	/**
	* Regexp based validation that behaves identically to the previous code but
	* provides less detailed error messages (while being 20% to 50% faster).
	*/
	function validateNsidRegex(value) {
		if (value.length > 317) return {
			success: false,
			message: "NSID is too long (317 chars max)"
		};
		if (!/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(value)) return {
			success: false,
			message: "NSID didn't validate via regex"
		};
		return {
			success: true,
			value
		};
	}
	var InvalidNsidError = class extends Error {};
	exports.InvalidNsidError = InvalidNsidError;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/aturi_validation.js
var require_aturi_validation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ensureValidAtUri = ensureValidAtUri;
	exports.ensureValidAtUriRegex = ensureValidAtUriRegex;
	exports.isValidAtUri = isValidAtUri;
	var at_identifier_js_1 = require_at_identifier();
	var did_js_1 = require_did();
	var handle_js_1 = require_handle();
	var nsid_js_1 = require_nsid();
	function ensureValidAtUri(input) {
		const fragmentIndex = input.indexOf("#");
		if (fragmentIndex !== -1) {
			if (input.charCodeAt(fragmentIndex + 1) !== 47) throw new Error("ATURI fragment must be non-empty and start with slash");
			if (input.includes("#", fragmentIndex + 1)) throw new Error("ATURI can have at most one \"#\", separating fragment out");
			const fragment = input.slice(fragmentIndex + 1);
			if (!/^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/.test(fragment)) throw new Error("Disallowed characters in ATURI fragment (ASCII)");
		}
		const uri = fragmentIndex === -1 ? input : input.slice(0, fragmentIndex);
		if (uri.length > 8192) throw new Error("ATURI is far too long");
		if (!uri.startsWith("at://")) throw new Error("ATURI must start with \"at://\"");
		if (!/^[a-zA-Z0-9._~:@!$&')(*+,;=%/-]*$/.test(uri)) throw new Error("Disallowed characters in ATURI (ASCII)");
		const authorityEnd = uri.indexOf("/", 5);
		const authority = authorityEnd === -1 ? uri.slice(5) : uri.slice(5, authorityEnd);
		try {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(authority);
		} catch (cause) {
			throw new Error("ATURI authority must be a valid handle or DID", { cause });
		}
		const collectionStart = authorityEnd === -1 ? -1 : authorityEnd + 1;
		const collectionEnd = collectionStart === -1 ? -1 : uri.indexOf("/", collectionStart);
		if (collectionStart !== -1) {
			const collection = collectionEnd === -1 ? uri.slice(collectionStart) : uri.slice(collectionStart, collectionEnd);
			if (collection.length === 0) throw new Error("ATURI can not have a slash after authority without a path segment");
			if (!(0, nsid_js_1.isValidNsid)(collection)) throw new Error("ATURI requires first path segment (if supplied) to be valid NSID");
		}
		const recordKeyStart = collectionEnd === -1 ? -1 : collectionEnd + 1;
		const recordKeyEnd = recordKeyStart === -1 ? -1 : uri.indexOf("/", recordKeyStart);
		if (recordKeyStart !== -1) {
			if (recordKeyStart === uri.length) throw new Error("ATURI can not have a slash after collection, unless record key is provided");
		}
		if (recordKeyEnd !== -1) throw new Error("ATURI path can have at most two parts, and no trailing slash");
	}
	function ensureValidAtUriRegex(input) {
		const rm = input.match(/^at:\/\/(?<authority>[a-zA-Z0-9._:%-]+)(\/(?<collection>[a-zA-Z0-9-.]+)(\/(?<rkey>[a-zA-Z0-9._~:@!$&%')(*+,;=-]+))?)?(#(?<fragment>\/[a-zA-Z0-9._~:@!$&%')(*+,;=\-[\]/\\]*))?$/);
		if (!rm || !rm.groups) throw new Error("ATURI didn't validate via regex");
		const groups = rm.groups;
		try {
			(0, handle_js_1.ensureValidHandleRegex)(groups.authority);
		} catch {
			try {
				(0, did_js_1.ensureValidDidRegex)(groups.authority);
			} catch {
				throw new Error("ATURI authority must be a valid handle or DID");
			}
		}
		if (groups.collection && !(0, nsid_js_1.isValidNsid)(groups.collection)) throw new Error("ATURI collection path segment must be a valid NSID");
		if (input.length > 8192) throw new Error("ATURI is far too long");
	}
	function isValidAtUri(input) {
		try {
			ensureValidAtUriRegex(input);
		} catch {
			return false;
		}
		return true;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/aturi.js
var require_aturi = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AtUri = exports.ATP_URI_REGEX = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var at_identifier_js_1 = require_at_identifier();
	var nsid_js_1 = require_nsid();
	tslib_1.__exportStar(require_aturi_validation(), exports);
	exports.ATP_URI_REGEX = /^(at:\/\/)?((?:did:[a-z0-9:%-]+)|(?:[a-z0-9][a-z0-9.:-]*))(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	var RELATIVE_REGEX = /^(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
	exports.AtUri = class AtUri {
		hash;
		host;
		pathname;
		searchParams;
		constructor(uri, base) {
			const parsed = base !== void 0 ? typeof base === "string" ? Object.assign(parse(base), parseRelative(uri)) : Object.assign({ host: base.host }, parseRelative(uri)) : parse(uri);
			(0, at_identifier_js_1.ensureValidAtIdentifier)(parsed.host);
			this.hash = parsed.hash ?? "";
			this.host = parsed.host;
			this.pathname = parsed.pathname ?? "";
			this.searchParams = parsed.searchParams;
		}
		static make(handleOrDid, collection, rkey) {
			let str = handleOrDid;
			if (collection) str += "/" + collection;
			if (rkey) str += "/" + rkey;
			return new AtUri(str);
		}
		get protocol() {
			return "at:";
		}
		get origin() {
			return `at://${this.host}`;
		}
		get hostname() {
			return this.host;
		}
		set hostname(v) {
			(0, at_identifier_js_1.ensureValidAtIdentifier)(v);
			this.host = v;
		}
		get search() {
			return this.searchParams.toString();
		}
		set search(v) {
			this.searchParams = new URLSearchParams(v);
		}
		get collection() {
			return this.pathname.split("/").filter(Boolean)[0] || "";
		}
		set collection(v) {
			(0, nsid_js_1.ensureValidNsid)(v);
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] = v;
			this.pathname = parts.join("/");
		}
		get rkey() {
			return this.pathname.split("/").filter(Boolean)[1] || "";
		}
		set rkey(v) {
			const parts = this.pathname.split("/").filter(Boolean);
			parts[0] ||= "undefined";
			parts[1] = v;
			this.pathname = parts.join("/");
		}
		get href() {
			return this.toString();
		}
		toString() {
			let path = this.pathname || "/";
			if (!path.startsWith("/")) path = `/${path}`;
			let qs = "";
			if (this.searchParams.size) qs = `?${this.searchParams.toString()}`;
			let hash = this.hash;
			if (hash && !hash.startsWith("#")) hash = `#${hash}`;
			return `at://${this.host}${path}${qs}${hash}`;
		}
	};
	function parse(str) {
		const match = str.match(exports.ATP_URI_REGEX);
		if (!match) throw new Error(`Invalid AT uri: ${str}`);
		return {
			host: match[2],
			hash: match[5],
			pathname: match[3],
			searchParams: new URLSearchParams(match[4])
		};
	}
	function parseRelative(str) {
		const match = str.match(RELATIVE_REGEX);
		if (!match) throw new Error(`Invalid path: ${str}`);
		return {
			hash: match[3],
			pathname: match[1],
			searchParams: new URLSearchParams(match[2])
		};
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/datetime.js
var require_datetime = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidDatetimeError = exports.normalizeDatetimeAlways = void 0;
	exports.ensureValidDatetime = ensureValidDatetime;
	exports.isValidDatetime = isValidDatetime;
	exports.normalizeDatetime = normalizeDatetime;
	function ensureValidDatetime(input) {
		const date = new Date(input);
		if (isNaN(date.getTime())) throw new InvalidDatetimeError("datetime did not parse as ISO 8601");
		if (date.toISOString().startsWith("-")) throw new InvalidDatetimeError("datetime normalized to a negative time");
		if (!/^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-6][0-9]:[0-6][0-9](.[0-9]{1,20})?(Z|([+-][0-2][0-9]:[0-5][0-9]))$/.test(input)) throw new InvalidDatetimeError("datetime didn't validate via regex");
		if (input.length > 64) throw new InvalidDatetimeError("datetime is too long (64 chars max)");
		if (input.endsWith("-00:00")) throw new InvalidDatetimeError("datetime can not use \"-00:00\" for UTC timezone");
		if (input.startsWith("000")) throw new InvalidDatetimeError("datetime so close to year zero not allowed");
	}
	function isValidDatetime(input) {
		try {
			ensureValidDatetime(input);
		} catch (err) {
			return false;
		}
		return true;
	}
	function normalizeDatetime(dtStr) {
		if (isValidDatetime(dtStr)) {
			const outStr = new Date(dtStr).toISOString();
			if (isValidDatetime(outStr)) return outStr;
		}
		if (!/.*(([+-]\d\d:?\d\d)|[a-zA-Z])$/.test(dtStr)) {
			const date = /* @__PURE__ */ new Date(dtStr + "Z");
			if (!isNaN(date.getTime())) {
				const tzStr = date.toISOString();
				if (isValidDatetime(tzStr)) return tzStr;
			}
		}
		const date = new Date(dtStr);
		if (isNaN(date.getTime())) throw new InvalidDatetimeError("datetime did not parse as any timestamp format");
		const isoStr = date.toISOString();
		if (isValidDatetime(isoStr)) return isoStr;
		else throw new InvalidDatetimeError("datetime normalized to invalid timestamp string");
	}
	var normalizeDatetimeAlways = (dtStr) => {
		try {
			return normalizeDatetime(dtStr);
		} catch (err) {
			if (err instanceof InvalidDatetimeError) return (/* @__PURE__ */ new Date(0)).toISOString();
			throw err;
		}
	};
	exports.normalizeDatetimeAlways = normalizeDatetimeAlways;
	var InvalidDatetimeError = class extends Error {};
	exports.InvalidDatetimeError = InvalidDatetimeError;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/language.js
var require_language = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLanguageString = parseLanguageString;
	exports.isValidLanguage = isValidLanguage;
	var BCP47_REGEXP = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>x(-[A-Za-z0-9]{1,8})+))$/;
	function parseLanguageString(input) {
		const parsed = input.match(BCP47_REGEXP);
		if (!parsed?.groups) return null;
		const { groups } = parsed;
		return {
			grandfathered: groups.grandfathered,
			language: groups.language,
			extlang: groups.extlang,
			script: groups.script,
			region: groups.region,
			variant: groups.variant,
			extension: groups.extension,
			privateUse: groups.privateUseA || groups.privateUseB
		};
	}
	/**
	* Validates well-formed BCP 47 syntax
	*
	* @see {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1}
	*/
	function isValidLanguage(input) {
		return BCP47_REGEXP.test(input);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/recordkey.js
var require_recordkey = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidRecordKeyError = void 0;
	exports.ensureValidRecordKey = ensureValidRecordKey;
	exports.isValidRecordKey = isValidRecordKey;
	var RECORD_KEY_MAX_LENGTH = 512;
	var RECORD_KEY_MIN_LENGTH = 1;
	var RECORD_KEY_INVALID_VALUES = /* @__PURE__ */ new Set([".", ".."]);
	var RECORD_KEY_REGEX = /^[a-zA-Z0-9_~.:-]{1,512}$/;
	function ensureValidRecordKey(input) {
		if (input.length > RECORD_KEY_MAX_LENGTH || input.length < RECORD_KEY_MIN_LENGTH) throw new InvalidRecordKeyError(`record key must be ${RECORD_KEY_MIN_LENGTH} to ${RECORD_KEY_MAX_LENGTH} characters`);
		if (RECORD_KEY_INVALID_VALUES.has(input)) throw new InvalidRecordKeyError("record key can not be \".\" or \"..\"");
		if (!RECORD_KEY_REGEX.test(input)) throw new InvalidRecordKeyError("record key syntax not valid (regex)");
	}
	function isValidRecordKey(input) {
		return input.length >= RECORD_KEY_MIN_LENGTH && input.length <= RECORD_KEY_MAX_LENGTH && RECORD_KEY_REGEX.test(input) && !RECORD_KEY_INVALID_VALUES.has(input);
	}
	var InvalidRecordKeyError = class extends Error {};
	exports.InvalidRecordKeyError = InvalidRecordKeyError;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/tid.js
var require_tid = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InvalidTidError = void 0;
	exports.ensureValidTid = ensureValidTid;
	exports.isValidTid = isValidTid;
	var TID_LENGTH = 13;
	var TID_REGEX = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
	function ensureValidTid(input) {
		if (input.length !== TID_LENGTH) throw new InvalidTidError(`TID must be ${TID_LENGTH} characters`);
		if (!TID_REGEX.test(input)) throw new InvalidTidError("TID syntax not valid (regex)");
	}
	function isValidTid(input) {
		return input.length === TID_LENGTH && TID_REGEX.test(input);
	}
	var InvalidTidError = class extends Error {};
	exports.InvalidTidError = InvalidTidError;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/uri.js
var require_uri = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isValidUri = isValidUri;
	function isValidUri(input) {
		return /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(input);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/dist/index.js
var require_dist$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_at_identifier(), exports);
	tslib_1.__exportStar(require_aturi(), exports);
	tslib_1.__exportStar(require_datetime(), exports);
	tslib_1.__exportStar(require_did(), exports);
	tslib_1.__exportStar(require_handle(), exports);
	tslib_1.__exportStar(require_nsid(), exports);
	tslib_1.__exportStar(require_language(), exports);
	tslib_1.__exportStar(require_recordkey(), exports);
	tslib_1.__exportStar(require_tid(), exports);
	tslib_1.__exportStar(require_uri(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/record-key.js
var require_record_key = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isLexiconRecordKey = isLexiconRecordKey;
	exports.asLexiconRecordKey = asLexiconRecordKey;
	var syntax_1 = require_dist$6();
	/**
	* Type guard that checks if a value is a valid lexicon record key constraint.
	*
	* @typeParam T - The input type
	* @param key - The value to check
	* @returns `true` if the value is a valid record key constraint
	*
	* @example
	* ```typescript
	* if (isLexiconRecordKey(value)) {
	*   // value is typed as LexiconRecordKey
	*   console.log('Valid constraint:', value)
	* }
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function isLexiconRecordKey(key) {
		return key === "any" || key === "nsid" || key === "tid" || typeof key === "string" && key.startsWith("literal:") && key.length > 8 && (0, syntax_1.isValidRecordKey)(key.slice(8));
	}
	/**
	* Validates and returns a value as a lexicon record key constraint, throwing if invalid.
	*
	* @param key - The value to validate
	* @returns The value typed as {@link LexiconRecordKey}
	* @throws {Error} If the value is not a valid record key constraint
	*
	* @example
	* ```typescript
	* const constraint = asLexiconRecordKey('tid')
	* // constraint is typed as LexiconRecordKey
	*
	* asLexiconRecordKey('invalid') // throws Error
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function asLexiconRecordKey(key) {
		if (/* @__PURE__ */ isLexiconRecordKey(key)) return key;
		throw new Error(`Invalid record key: ${String(key)}`);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/result.js
var require_result = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.success = success;
	exports.failure = failure;
	exports.failureReason = failureReason;
	exports.successValue = successValue;
	exports.catchall = catchall;
	exports.createCatcher = createCatcher;
	/**
	* Creates a successful result wrapping the given value.
	*
	* @typeParam V - The type of the value
	* @param value - The success value to wrap
	* @returns {ResultSuccess} A success result containing the value
	*
	* @example
	* ```typescript
	* const result = success(42)
	* console.log(result.success) // true
	* console.log(result.value)   // 42
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function success(value) {
		return {
			success: true,
			value
		};
	}
	/**
	* Creates a failed result wrapping the given error reason.
	*
	* @typeParam E - The type of the error reason
	* @param reason - The error reason to wrap
	* @returns {ResultFailure} A failure result containing the error
	*
	* @example
	* ```typescript
	* const result = failure(new Error('Something went wrong'))
	* console.log(result.success) // false
	* console.log(result.reason.message) // "Something went wrong"
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function failure(reason) {
		return {
			success: false,
			reason
		};
	}
	/**
	* Extracts the error reason from a failure result.
	*
	* @typeParam T - The type of the error reason
	* @param result - A failure result
	* @returns {T} The error reason
	*
	* @example
	* ```typescript
	* const result = failure(new Error('oops'))
	* const error = failureReason(result)
	* console.log(error.message) // "oops"
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function failureReason(result) {
		return result.reason;
	}
	/**
	* Extracts the value from a success result.
	*
	* @typeParam T - The type of the success value
	* @param result - A success result
	* @returns {T} The success value
	*
	* @example
	* ```typescript
	* const result = success(42)
	* const value = successValue(result)
	* console.log(value) // 42
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function successValue(result) {
		return result.value;
	}
	/**
	* Catches any error and wraps it in a {@link ResultFailure<Error>}.
	*
	* @param err - The error to catch.
	* @returns {ResultFailure} A failure result containing the error.
	* @example
	*
	* ```ts
	* declare function someFunction(): Promise<string>
	*
	* const result = await someFunction().then(success, catchall)
	* if (result.success) {
	*   console.log(result.value) // string
	* } else {
	*   console.error(result.reason instanceof Error) // true
	*   console.error(result.reason.message) // string
	* }
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function catchall(err) {
		if (err instanceof Error) return /* @__PURE__ */ failure(err);
		return /* @__PURE__ */ failure(new Error("Unknown error", { cause: err }));
	}
	/**
	* Creates a catcher function for the given constructor that wraps caught errors
	* in a {@link ResultFailure}.
	*
	* @example
	*
	* ```ts
	* class FooError extends Error {}
	* class BarError extends Error {}
	*
	* declare function someFunction(): Promise<string>
	*
	* const result = await someFunction()
	*   .then(success)
	*   .catch(createCatcher(FooError))
	*   .catch(createCatcher(BarError))
	*
	* if (result.success) {
	*   console.log(result.value) // string
	* } else {
	*   console.error(result.reason) // FooError | BarError
	* }
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function createCatcher(Ctor) {
		return (err) => {
			if (err instanceof Ctor) return /* @__PURE__ */ failure(err);
			throw err;
		};
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/object.js
var require_object$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isObject = isObject;
	exports.isPlainObject = isPlainObject;
	exports.isPlainProto = isPlainProto;
	/**
	* Checks whether the input is an object (not null).
	*
	* Returns true for any non-null value with typeof 'object', including
	* arrays, plain objects, class instances, etc.
	*
	* @param input - The value to check
	* @returns `true` if the input is an object (not null)
	*
	* @example
	* ```typescript
	* import { isObject } from '@atproto/lex-data'
	*
	* isObject({})           // true
	* isObject([1, 2, 3])    // true
	* isObject(new Date())   // true
	* isObject(null)         // false
	* isObject('string')     // false
	* ```
	*/
	function isObject(input) {
		return input != null && typeof input === "object";
	}
	var ObjectProto = Object.prototype;
	var ObjectToString = Object.prototype.toString;
	/**
	* Checks whether the input is a plain object.
	*
	* A plain object is an object (not null) whose prototype is either null
	* or `Object.prototype`. This excludes arrays, class instances, and other
	* special objects.
	*
	* @param input - The value to check
	* @returns `true` if the input is a plain object
	*
	* @example
	* ```typescript
	* import { isPlainObject } from '@atproto/lex-data'
	*
	* isPlainObject({})                    // true
	* isPlainObject({ a: 1 })              // true
	* isPlainObject(Object.create(null))   // true
	* isPlainObject([1, 2, 3])             // false
	* isPlainObject(new Date())            // false
	* isPlainObject(null)                  // false
	* ```
	*/
	function isPlainObject(input) {
		return isObject(input) && isPlainProto(input);
	}
	/**
	* Checks whether the prototype of an object is plain (null or Object.prototype).
	*
	* This is useful for checking if an object is a plain object without
	* checking that it's non-null first (the null check is already done).
	*
	* @param input - The object to check (must be non-null)
	* @returns `true` if the object's prototype is plain
	*
	* @example
	* ```typescript
	* import { isPlainProto } from '@atproto/lex-data'
	*
	* isPlainProto({})                    // true
	* isPlainProto(Object.create(null))   // true
	* isPlainProto([1, 2, 3])             // false (Array.prototype)
	* isPlainProto(new Date())            // false (Date.prototype)
	* ```
	*/
	function isPlainProto(input) {
		const proto = Object.getPrototypeOf(input);
		if (proto === null) return true;
		return (proto === ObjectProto || Object.getPrototypeOf(proto) === null) && ObjectToString.call(input) === "[object Object]";
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/lib/nodejs-buffer.js
var require_nodejs_buffer$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NodeJSBuffer = void 0;
	var BUFFER = /*#__PURE__*/ (() => "Bu" + "f".repeat(2) + "er")();
	exports.NodeJSBuffer = globalThis?.[BUFFER]?.prototype instanceof Uint8Array && "byteLength" in globalThis[BUFFER] ? globalThis[BUFFER] : /* v8 ignore next -- @preserve */ null;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/uint8array-concat.js
var require_uint8array_concat$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8ConcatNode = void 0;
	exports.ui8ConcatPonyfill = ui8ConcatPonyfill;
	var Buffer = require_nodejs_buffer$1().NodeJSBuffer;
	exports.ui8ConcatNode = Buffer ? function ui8ConcatNode(array) {
		return Buffer.concat(array);
	} : /* v8 ignore next -- @preserve */ null;
	function ui8ConcatPonyfill(array) {
		let totalLength = 0;
		for (const arr of array) totalLength += arr.length;
		const result = new Uint8Array(totalLength);
		let offset = 0;
		for (const arr of array) {
			result.set(arr, offset);
			offset += arr.length;
		}
		return result;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/uint8array-from-base64.js
var require_uint8array_from_base64$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromBase64Node = exports.fromBase64Native = void 0;
	exports.fromBase64Ponyfill = fromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer$1().NodeJSBuffer;
	exports.fromBase64Native = typeof Uint8Array.fromBase64 === "function" ? function fromBase64Native(b64, alphabet = "base64") {
		return Uint8Array.fromBase64(b64, {
			alphabet,
			lastChunkHandling: "loose"
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.fromBase64Node = Buffer ? function fromBase64Node(b64, alphabet = "base64") {
		const bytes = Buffer.from(b64, alphabet);
		verifyBase64ForBytes(b64, bytes);
		return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	} : /* v8 ignore next -- @preserve */ null;
	function fromBase64Ponyfill(b64, alphabet = "base64") {
		const bytes = (0, from_string_1.fromString)(b64, b64.endsWith("=") ? `${alphabet}pad` : alphabet);
		verifyBase64ForBytes(b64, bytes);
		return bytes;
	}
	function verifyBase64ForBytes(b64, bytes) {
		const paddingCount = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
		const trimmedLength = b64.length - paddingCount;
		const expectedByteLength = Math.floor(trimmedLength * 3 / 4);
		if (bytes.length !== expectedByteLength) throw new Error("Invalid base64 string");
		const expectedB64Length = bytes.length / 3 * 4;
		const expectedFullB64Length = expectedB64Length + (expectedB64Length % 4 === 0 ? 0 : 4 - expectedB64Length % 4);
		if (b64.length > expectedFullB64Length) throw new Error("Invalid base64 string");
		for (let i = Math.ceil(expectedB64Length); i < b64.length - paddingCount; i++) {
			const code = b64.charCodeAt(i);
			if (!(code >= 65 && code <= 90) && !(code >= 97 && code <= 122) && !(code >= 48 && code <= 57) && code !== 43 && code !== 47) throw new Error("Invalid base64 string");
		}
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/uint8array-to-base64.js
var require_uint8array_to_base64$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBase64Node = exports.toBase64Native = void 0;
	exports.toBase64Ponyfill = toBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var Buffer = require_nodejs_buffer$1().NodeJSBuffer;
	exports.toBase64Native = typeof Uint8Array.prototype.toBase64 === "function" ? function toBase64Native(bytes, alphabet = "base64") {
		return bytes.toBase64({
			alphabet,
			omitPadding: true
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.toBase64Node = Buffer ? function toBase64Node(bytes, alphabet = "base64") {
		const b64 = (bytes instanceof Buffer ? bytes : Buffer.from(bytes)).toString(alphabet);
		return b64.charCodeAt(b64.length - 1) === 61 ? b64.charCodeAt(b64.length - 2) === 61 ? b64.slice(0, -2) : b64.slice(0, -1) : b64;
	} : /* v8 ignore next -- @preserve */ null;
	function toBase64Ponyfill(bytes, alphabet = "base64") {
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/uint8array.js
var require_uint8array$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8Concat = exports.fromBase64 = exports.toBase64 = void 0;
	exports.ifUint8Array = ifUint8Array;
	exports.asUint8Array = asUint8Array;
	exports.ui8Equals = ui8Equals;
	var uint8array_concat_js_1 = require_uint8array_concat$1();
	var uint8array_from_base64_js_1 = require_uint8array_from_base64$1();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64$1();
	/**
	* Encodes a Uint8Array into a base64 string.
	*
	* Uses native Uint8Array.prototype.toBase64 when available (Node.js 24+, modern browsers),
	* falling back to Node.js Buffer or a ponyfill implementation.
	*
	* @param bytes - The binary data to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The base64 encoded string
	*
	* @example
	* ```typescript
	* import { toBase64 } from '@atproto/lex-data'
	*
	* const bytes = new Uint8Array([72, 101, 108, 108, 111])
	* toBase64(bytes)           // 'SGVsbG8='
	* toBase64(bytes, 'base64url')  // 'SGVsbG8' (URL-safe, no padding)
	* ```
	*/
	exports.toBase64 = uint8array_to_base64_js_1.toBase64Native ?? uint8array_to_base64_js_1.toBase64Node ?? uint8array_to_base64_js_1.toBase64Ponyfill;
	/**
	* Decodes a base64 string into a Uint8Array.
	*
	* Supports both padded and unpadded base64 strings. Uses native
	* Uint8Array.fromBase64 when available, falling back to Node.js Buffer
	* or a ponyfill implementation.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The decoded binary data
	* @throws If the input is not a valid base64 string
	*
	* @example
	* ```typescript
	* import { fromBase64 } from '@atproto/lex-data'
	*
	* fromBase64('SGVsbG8=')       // Uint8Array([72, 101, 108, 108, 111])
	* fromBase64('SGVsbG8', 'base64url')  // Same, URL-safe alphabet
	* ```
	*/
	exports.fromBase64 = uint8array_from_base64_js_1.fromBase64Native ?? uint8array_from_base64_js_1.fromBase64Node ?? uint8array_from_base64_js_1.fromBase64Ponyfill;
	/* v8 ignore next -- @preserve */
	if (exports.toBase64 === uint8array_to_base64_js_1.toBase64Ponyfill || exports.fromBase64 === uint8array_from_base64_js_1.fromBase64Ponyfill) {}
	/**
	* Returns the input if it is a Uint8Array, otherwise returns undefined.
	*
	* @param input - The value to check
	* @returns The input if it's a Uint8Array, otherwise undefined
	*
	* @example
	* ```typescript
	* import { ifUint8Array } from '@atproto/lex-data'
	*
	* ifUint8Array(new Uint8Array([1, 2]))  // Uint8Array([1, 2])
	* ifUint8Array('not binary')            // undefined
	* ifUint8Array(new ArrayBuffer(4))      // undefined
	* ```
	*/
	function ifUint8Array(input) {
		if (input instanceof Uint8Array) return input;
	}
	/**
	* Coerces various binary data representations into a Uint8Array.
	*
	* Handles the following input types:
	* - `Uint8Array` - Returned as-is
	* - `ArrayBufferView` (e.g., DataView, other TypedArrays) - Converted to Uint8Array
	* - `ArrayBuffer` - Wrapped in a Uint8Array
	*
	* @param input - The value to convert
	* @returns A Uint8Array, or `undefined` if the input could not be converted
	*
	* @example
	* ```typescript
	* import { asUint8Array } from '@atproto/lex-data'
	*
	* asUint8Array(new Uint8Array([1, 2]))     // Uint8Array([1, 2])
	* asUint8Array(new ArrayBuffer(4))         // Uint8Array of length 4
	* asUint8Array(new Int16Array([1, 2]))     // Uint8Array view of the buffer
	* asUint8Array('string')                   // undefined
	* ```
	*/
	function asUint8Array(input) {
		if (input instanceof Uint8Array) return input;
		if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength / Uint8Array.BYTES_PER_ELEMENT);
		if (input instanceof ArrayBuffer) return new Uint8Array(input);
	}
	/**
	* Compares two Uint8Arrays for byte-by-byte equality.
	*
	* @param a - First Uint8Array to compare
	* @param b - Second Uint8Array to compare
	* @returns `true` if both arrays have the same length and identical bytes
	*
	* @example
	* ```typescript
	* import { ui8Equals } from '@atproto/lex-data'
	*
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 3]))  // false
	* ui8Equals(new Uint8Array([1]), new Uint8Array([1, 2]))     // false
	* ```
	*/
	function ui8Equals(a, b) {
		if (a.byteLength !== b.byteLength) return false;
		for (let i = 0; i < a.byteLength; i++) if (a[i] !== b[i]) return false;
		return true;
	}
	/**
	* Concatenates multiple Uint8Arrays into a single Uint8Array.
	*
	* Uses Node.js Buffer.concat when available for performance,
	* falling back to a ponyfill implementation.
	*
	* @param arrays - The Uint8Arrays to concatenate
	* @returns A new Uint8Array containing all input bytes in order
	*
	* @example
	* ```typescript
	* import { ui8Concat } from '@atproto/lex-data'
	*
	* const a = new Uint8Array([1, 2])
	* const b = new Uint8Array([3, 4])
	* ui8Concat([a, b])  // Uint8Array([1, 2, 3, 4])
	* ```
	*/
	exports.ui8Concat = uint8array_concat_js_1.ui8ConcatNode ?? uint8array_concat_js_1.ui8ConcatPonyfill;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/cid.js
var require_cid$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CID = exports.SHA512_HASH_CODE = exports.SHA256_HASH_CODE = exports.RAW_DATA_CODEC = exports.CBOR_DATA_CODEC = void 0;
	exports.multihashEquals = multihashEquals;
	exports.asMultiformatsCID = asMultiformatsCID;
	exports.isRawCid = isRawCid;
	exports.isDaslCid = isDaslCid;
	exports.isCborCid = isCborCid;
	exports.checkCid = checkCid;
	exports.isCid = isCid;
	exports.ifCid = ifCid;
	exports.asCid = asCid;
	exports.decodeCid = decodeCid;
	exports.parseCid = parseCid;
	exports.validateCidString = validateCidString;
	exports.parseCidSafe = parseCidSafe;
	exports.ensureValidCidString = ensureValidCidString;
	exports.isCidForBytes = isCidForBytes;
	exports.createCid = createCid;
	exports.cidForCbor = cidForCbor;
	exports.cidForRawBytes = cidForRawBytes;
	exports.cidForRawHash = cidForRawHash;
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	Object.defineProperty(exports, "CID", {
		enumerable: true,
		get: function() {
			return cid_1.CID;
		}
	});
	var digest_1 = (init_digest(), __toCommonJS(digest_exports));
	var sha2_1 = (init_sha2_browser(), __toCommonJS(sha2_browser_exports));
	var object_js_1 = require_object$2();
	var uint8array_js_1 = require_uint8array$1();
	/**
	* Codec code that indicates the CID references a CBOR-encoded data structure.
	*
	* Used when encoding structured data in AT Protocol repositories.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.CBOR_DATA_CODEC = 113;
	/**
	* Codec code that indicates the CID references raw binary data (like media blobs).
	*
	* Used in DASL CIDs for binary blobs like images and media.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.RAW_DATA_CODEC = 85;
	/**
	* Hash code that indicates that a CID uses SHA-256.
	*/
	exports.SHA256_HASH_CODE = sha2_1.sha256.code;
	/**
	* Hash code that indicates that a CID uses SHA-512.
	*/
	exports.SHA512_HASH_CODE = sha2_1.sha512.code;
	/**
	* Compares two {@link Multihash} for equality.
	*
	* @param a - First {@link Multihash}
	* @param b - Second {@link Multihash}
	* @returns `true` if both multihashes have the same code and digest
	*/
	function multihashEquals(a, b) {
		if (a === b) return true;
		return a.code === b.code && (0, uint8array_js_1.ui8Equals)(a.digest, b.digest);
	}
	/**
	* Converts a {@link Cid} to a multiformats {@link CID} instance.
	*
	* @deprecated Packages depending on `@atproto/lex-data` should use the
	* {@link Cid} interface instead of relying on `multiformats`'s {@link CID}
	* implementation directly. This is to avoid compatibility issues, and in order
	* to allow better portability, compatibility and future updates.
	*/
	function asMultiformatsCID(input) {
		return cid_1.CID.asCID(input) ?? cid_1.CID.create(input.version, input.code, (0, digest_1.create)(input.multihash.code, input.multihash.digest));
	}
	/**
	* Type guard to check if a CID is a raw binary CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a version 1 CID with raw multicodec
	*/
	function isRawCid(cid) {
		return cid.version === 1 && cid.code === exports.RAW_DATA_CODEC;
	}
	/**
	* Type guard to check if a CID is DASL compliant.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is DASL compliant (v1, raw/dag-cbor, sha256)
	*/
	function isDaslCid(cid) {
		return cid.version === 1 && (cid.code === exports.RAW_DATA_CODEC || cid.code === exports.CBOR_DATA_CODEC) && cid.multihash.code === exports.SHA256_HASH_CODE && cid.multihash.digest.byteLength === 32;
	}
	/**
	* Type guard to check if a CID is a DAG-CBOR CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a DAG-CBOR CID (v1, dag-cbor, sha256)
	*/
	function isCborCid(cid) {
		return cid.code === exports.CBOR_DATA_CODEC && isDaslCid(cid);
	}
	function checkCid(cid, options) {
		switch (options?.flavor) {
			case void 0: return true;
			case "cbor": return isCborCid(cid);
			case "dasl": return isDaslCid(cid);
			case "raw": return isRawCid(cid);
			default: throw new TypeError(`Unknown CID flavor: ${options?.flavor}`);
		}
	}
	function isCid(value, options) {
		return isCidImplementation(value) && checkCid(value, options);
	}
	function ifCid(value, options) {
		if (isCidImplementation(value) && checkCid(value, options)) return value;
		return null;
	}
	function asCid(value, options) {
		if (isCidImplementation(value) && checkCid(value, options)) return value;
		throw new Error("Not a valid CID");
	}
	function decodeCid(cidBytes, options) {
		return asCid(cid_1.CID.decode(cidBytes), options);
	}
	function parseCid(input, options) {
		return asCid(cid_1.CID.parse(input), options);
	}
	/**
	* Validates that a string is a valid CID representation.
	*
	* Unlike {@link parseCid}, this function returns a boolean instead of throwing.
	* It also verifies that the string is the canonical representation of the CID.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @returns `true` if the string is a valid CID
	*/
	function validateCidString(input, options) {
		return parseCidSafe(input, options)?.toString() === input;
	}
	function parseCidSafe(input, options) {
		try {
			return parseCid(input, options);
		} catch {
			return null;
		}
	}
	/**
	* Ensures that a string is a valid CID representation.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @throws If the string is not a valid CID
	*/
	function ensureValidCidString(input, options) {
		if (!validateCidString(input, options)) throw new Error(`Invalid CID string`);
	}
	/**
	* Verifies whether the multihash of a given {@link cid} matches the hash of the provided {@link bytes}.
	* @params cid The CID to match against the bytes.
	* @params bytes The bytes to verify.
	* @returns true if the CID matches the bytes, false otherwise.
	*/
	async function isCidForBytes(cid, bytes) {
		if (cid.multihash.code === sha2_1.sha256.code) return multihashEquals(await sha2_1.sha256.digest(bytes), cid.multihash);
		if (cid.multihash.code === sha2_1.sha512.code) return multihashEquals(await sha2_1.sha512.digest(bytes), cid.multihash);
		throw new Error("Unsupported CID multihash");
	}
	/**
	* Creates a CID from a multicodec, multihash code, and digest.
	*
	* @param code - The multicodec content type code
	* @param multihashCode - The multihash algorithm code
	* @param digest - The raw hash digest bytes
	* @returns A new CIDv1 instance
	*
	* @example
	* ```typescript
	* import { createCid, RAW_DATA_CODEC, SHA256_HASH_CODE } from '@atproto/lex-data'
	*
	* const cid = createCid(RAW_DATA_CODEC, SHA256_HASH_CODE, hashDigest)
	* ```
	*/
	function createCid(code, multihashCode, digest) {
		return cid_1.CID.createV1(code, (0, digest_1.create)(multihashCode, digest));
	}
	/**
	* Creates a DAG-CBOR CID for the given CBOR bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with DAG-CBOR multicodec.
	*
	* @param bytes - The CBOR-encoded bytes to hash
	* @returns A promise that resolves to the CborCid
	*/
	async function cidForCbor(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.CBOR_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID for the given binary bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with raw multicodec.
	*
	* @param bytes - The raw binary bytes to hash
	* @returns A promise that resolves to the RawCid
	*/
	async function cidForRawBytes(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.RAW_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID from an existing SHA-256 hash digest.
	*
	* @param digest - The SHA-256 hash digest (must be 32 bytes)
	* @returns A RawCid with the given digest
	* @throws If the digest length is not 32 bytes
	*/
	function cidForRawHash(digest) {
		if (digest.length !== 32) throw new Error(`Invalid SHA-256 hash length: ${digest.length}`);
		return createCid(exports.RAW_DATA_CODEC, sha2_1.sha256.code, digest);
	}
	function isCidImplementation(value) {
		if (cid_1.CID.asCID(value)) return value.bytes != null;
		else try {
			if (!(0, object_js_1.isObject)(value)) return false;
			const val = value;
			if (val.version !== 0 && val.version !== 1) return false;
			if (!isUint8(val.code)) return false;
			if (!(0, object_js_1.isObject)(val.multihash)) return false;
			const mh = val.multihash;
			if (!isUint8(mh.code)) return false;
			if (!(mh.digest instanceof Uint8Array)) return false;
			if (!(val.bytes instanceof Uint8Array)) return false;
			if (val.bytes[0] !== val.version) return false;
			if (val.bytes[1] !== val.code) return false;
			if (val.bytes[2] !== mh.code) return false;
			if (val.bytes[3] !== mh.digest.length) return false;
			if (val.bytes.length !== 4 + mh.digest.length) return false;
			if (!(0, uint8array_js_1.ui8Equals)(val.bytes.subarray(4), mh.digest)) return false;
			if (typeof val.equals !== "function") return false;
			if (val.equals(val) !== true) return false;
			return true;
		} catch {
			return false;
		}
	}
	function isUint8(val) {
		return Number.isInteger(val) && val >= 0 && val < 256;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/blob.js
var require_blob$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isBlobRef = isBlobRef;
	exports.isLegacyBlobRef = isLegacyBlobRef;
	exports.enumBlobRefs = enumBlobRefs;
	var cid_js_1 = require_cid$2();
	var object_js_1 = require_object$2();
	function isBlobRef(input, options) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		if (input?.$type !== "blob") return false;
		const { mimeType, size, ref } = input;
		if (typeof mimeType !== "string" || !mimeType.includes("/")) return false;
		if (typeof size !== "number" || size < 0 || !Number.isSafeInteger(size)) return false;
		if (typeof ref !== "object" || ref === null) return false;
		for (const key in input) if (key !== "$type" && key !== "mimeType" && key !== "ref" && key !== "size") return false;
		if (!(0, cid_js_1.ifCid)(ref, options?.strict === false ? void 0 : { flavor: "raw" })) return false;
		return true;
	}
	/**
	* Type guard to check if a value is a valid {@link LegacyBlobRef}.
	*
	* Validates the structure of the input:
	* - `cid` must be a valid CID string
	* - `mimeType` must be a non-empty string
	* - No additional properties allowed
	*
	* @param input - The value to check
	* @returns `true` if the input is a valid LegacyBlobRef
	*
	* @example
	* ```typescript
	* import { isLegacyBlobRef } from '@atproto/lex-data'
	*
	* if (isLegacyBlobRef(data)) {
	*   console.log(data.cid)       // CID as string
	*   console.log(data.mimeType)  // e.g., 'image/jpeg'
	* }
	* ```
	*
	* @see {@link isBlobRef} for checking the current blob reference format
	*/
	function isLegacyBlobRef(input) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		const { cid, mimeType } = input;
		if (typeof cid !== "string") return false;
		if (typeof mimeType !== "string" || mimeType.length === 0) return false;
		for (const key in input) if (key !== "cid" && key !== "mimeType") return false;
		if (!(0, cid_js_1.validateCidString)(cid)) return false;
		return true;
	}
	function* enumBlobRefs(input, options) {
		const includeLegacy = options?.allowLegacy === true;
		const stack = [input];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if (value != null && typeof value === "object") {
				if (Array.isArray(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					stack.push(...value);
				} else if ((0, object_js_1.isPlainProto)(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					if (isBlobRef(value, options)) yield value;
					else if (includeLegacy && isLegacyBlobRef(value)) yield value;
					else for (const v of Object.values(value)) if (v != null) stack.push(v);
				}
			}
		} while (stack.length > 0);
		visited.clear();
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/lex-equals.js
var require_lex_equals$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexEquals = lexEquals;
	var cid_js_1 = require_cid$2();
	var object_js_1 = require_object$2();
	var uint8array_js_1 = require_uint8array$1();
	/**
	* Performs deep equality comparison between two {@link LexValue}s.
	*
	* This function correctly handles all Lexicon data types including:
	* - Primitives (string, number, boolean, null)
	* - Arrays (recursive element comparison)
	* - Objects/LexMaps (recursive key-value comparison)
	* - Uint8Arrays (byte-by-byte comparison)
	* - CIDs (using CID equality)
	*
	* @param a - First LexValue to compare
	* @param b - Second LexValue to compare
	* @returns `true` if the values are deeply equal
	* @throws {TypeError} If either value is not a valid LexValue (e.g., contains unsupported types)
	*
	* @example
	* ```typescript
	* import { lexEquals } from '@atproto/lex-data'
	*
	* // Primitives
	* lexEquals('hello', 'hello')  // true
	* lexEquals(42, 42)            // true
	*
	* // Arrays
	* lexEquals([1, 2, 3], [1, 2, 3])  // true
	* lexEquals([1, 2], [1, 2, 3])     // false
	*
	* // Objects
	* lexEquals({ a: 1, b: 2 }, { a: 1, b: 2 })  // true
	* lexEquals({ a: 1 }, { a: 1, b: 2 })        // false
	*
	* // CIDs
	* lexEquals(cid1, cid2)  // true if CIDs are equal
	*
	* // Uint8Arrays
	* lexEquals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ```
	*/
	function lexEquals(a, b) {
		if (Object.is(a, b)) return true;
		if (a == null || b == null || typeof a !== "object" || typeof b !== "object") return false;
		if (Array.isArray(a)) {
			if (!Array.isArray(b)) return false;
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) if (!lexEquals(a[i], b[i])) return false;
			return true;
		} else if (Array.isArray(b)) return false;
		if (ArrayBuffer.isView(a)) {
			if (!ArrayBuffer.isView(b)) return false;
			return (0, uint8array_js_1.ui8Equals)(a, b);
		} else if (ArrayBuffer.isView(b)) return false;
		if ((0, cid_js_1.isCid)(a)) return (0, cid_js_1.ifCid)(b)?.equals(a) === true;
		else if ((0, cid_js_1.isCid)(b)) return false;
		if (!(0, object_js_1.isPlainObject)(a) || !(0, object_js_1.isPlainObject)(b)) throw new TypeError("Invalid LexValue (expected CID, Uint8Array, or LexMap)");
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		for (const key of aKeys) {
			const aVal = a[key];
			const bVal = b[key];
			if (aVal === void 0) {
				if (bVal === void 0 && bKeys.includes(key)) continue;
				return false;
			} else if (bVal === void 0) return false;
			if (!lexEquals(aVal, bVal)) return false;
		}
		return true;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/lex-error.js
var require_lex_error$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LexError = void 0;
	/**
	* Error class for Lexicon-related errors.
	*
	* LexError extends the standard JavaScript {@link Error} with AT Protocol-specific
	* functionality including:
	* - An error code for programmatic error handling
	* - JSON serialization for API responses
	* - HTTP Response generation
	*
	* @typeParam N - The specific error code type
	*
	* @example
	* ```typescript
	* import { LexError } from '@atproto/lex-data'
	*
	* // Throw a Lexicon error
	* throw new LexError('InvalidRequest', 'Missing required field')
	*
	* // Create and serialize
	* const error = new LexError('NotFound', 'Record not found')
	* console.log(error.toJSON())
	* // { error: 'NotFound', message: 'Record not found' }
	*
	* // Return as HTTP response
	* return error.toResponse()  // 400 Bad Request with JSON body
	* ```
	*/
	var LexError = class extends Error {
		error;
		name = "LexError";
		/**
		* Creates a new LexError.
		*
		* @param error - The error code identifying the type of error
		* @param message - Optional human-readable error message
		* @param options - Standard Error options (e.g., cause)
		*/
		constructor(error, message, options) {
			super(message, options);
			this.error = error;
		}
		/**
		* Returns a string representation of this error.
		*
		* @returns A formatted string: "LexError: [ERROR_CODE] message"
		*/
		toString() {
			return `${this.name}: [${this.error}] ${this.message}`;
		}
		/**
		* Converts this error to a JSON-serializable object.
		*
		* @returns The error data suitable for JSON serialization
		*/
		toJSON() {
			const { error, message } = this;
			return {
				error,
				message: message || void 0
			};
		}
		/**
		* Converts this error to an HTTP Response for downstream clients.
		*
		* Returns a 400 Bad Request response with the JSON-serialized error body.
		*
		* @returns A Response object with status 400 and JSON body
		*/
		toResponse() {
			return Response.json(this.toJSON(), { status: 400 });
		}
	};
	exports.LexError = LexError;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/lex.js
var require_lex$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isLexMap = isLexMap;
	exports.isLexArray = isLexArray;
	exports.isLexScalar = isLexScalar;
	exports.isLexValue = isLexValue;
	exports.isTypedLexMap = isTypedLexMap;
	var cid_js_1 = require_cid$2();
	var object_js_1 = require_object$2();
	/**
	* Type guard to check if a value is a valid {@link LexMap}.
	*
	* Returns true if the value is a plain object where all values are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexMap
	*
	* @example
	* ```typescript
	* import { isLexMap } from '@atproto/lex'
	*
	* if (isLexMap(data)) {
	*   // data is narrowed to LexMap
	*   console.log(Object.keys(data))
	* }
	* ```
	*/
	function isLexMap(value) {
		return (0, object_js_1.isPlainObject)(value) && Object.values(value).every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexArray}.
	*
	* Returns true if the value is an array where all elements are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexArray
	*
	* @example
	* ```typescript
	* import { isLexArray } from '@atproto/lex'
	*
	* if (isLexArray(data)) {
	*   // data is narrowed to LexArray
	*   data.forEach(item => console.log(item))
	* }
	* ```
	*/
	function isLexArray(value) {
		return Array.isArray(value) && value.every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexScalar}.
	*
	* Returns true if the value is one of the primitive Lexicon types:
	* number (integer only), string, boolean, null, Cid, or Uint8Array.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexScalar
	*
	* @example
	* ```typescript
	* import { isLexScalar } from '@atproto/lex'
	*
	* isLexScalar('hello')     // true
	* isLexScalar(42)          // true
	* isLexScalar(3.14)        // false (floats not allowed)
	* isLexScalar([1, 2])      // false (arrays are not scalars)
	* ```
	*/
	function isLexScalar(value) {
		switch (typeof value) {
			case "object": return value === null || value instanceof Uint8Array || (0, cid_js_1.isCid)(value);
			case "string":
			case "boolean": return true;
			case "number": if (Number.isInteger(value)) return true;
			default: return false;
		}
	}
	/**
	* Type guard to check if a value is a valid {@link LexValue}.
	*
	* Performs a deep check to validate that the value (and all nested values)
	* conform to the Lexicon data model. This includes checking for:
	* - Valid scalar types (number, string, boolean, null, Cid, Uint8Array)
	* - Arrays containing only valid LexValues
	* - Plain objects with string keys and valid LexValue values
	* - No cyclic references (which cannot be serialized to JSON or CBOR)
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexValue
	*
	* @example
	* ```typescript
	* import { isLexValue } from '@atproto/lex'
	*
	* isLexValue({ name: 'Alice', tags: ['admin'] })  // true
	* isLexValue(new Date())                           // false (not a plain object)
	* isLexValue({ fn: () => {} })                     // false (functions not allowed)
	* ```
	*/
	function isLexValue(value) {
		const stack = [value];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if ((0, object_js_1.isPlainObject)(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...Object.values(value));
			} else if (Array.isArray(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...value);
			} else if (!isLexScalar(value)) return false;
		} while (stack.length > 0);
		visited.clear();
		return true;
	}
	/**
	* Type guard to check if a value is a {@link TypedLexMap}.
	*
	* Returns true if the value is a valid {@link LexMap} with a non-empty
	* `$type` string property.
	*
	* @param value - The LexValue to check
	* @returns `true` if the value is a TypedLexMap
	*
	* @example
	* ```typescript
	* import { isTypedLexMap } from '@atproto/lex'
	*
	* const data = { $type: 'app.bsky.feed.post', text: 'Hello' }
	*
	* if (isTypedLexMap(data)) {
	*   console.log(data.$type)  // 'app.bsky.feed.post'
	* }
	* ```
	*/
	function isTypedLexMap(value) {
		return isLexMap(value) && typeof value.$type === "string" && value.$type.length > 0;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/utf8-from-base64.js
var require_utf8_from_base64$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64Node = void 0;
	exports.utf8FromBase64Ponyfill = utf8FromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer$1().NodeJSBuffer;
	exports.utf8FromBase64Node = Buffer ? function utf8FromBase64Node(b64, alphabet = "base64") {
		return Buffer.from(b64, alphabet).toString("utf8");
	} : /* v8 ignore next -- @preserve */ null;
	var textDecoder = /*#__PURE__*/ new TextDecoder();
	function utf8FromBase64Ponyfill(b64, alphabet) {
		const bytes = (0, from_string_1.fromString)(b64, alphabet);
		return textDecoder.decode(bytes);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/utf8-grapheme-len.js
var require_utf8_grapheme_len$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.graphemeLenNative = void 0;
	exports.graphemeLenPonyfill = graphemeLenPonyfill;
	var grapheme_1 = require_grapheme();
	var segmenter = "Segmenter" in Intl && typeof Intl.Segmenter === "function" ? /*#__PURE__*/ new Intl.Segmenter() : /* v8 ignore next -- @preserve */ null;
	exports.graphemeLenNative = segmenter ? function graphemeLenNative(str) {
		let length = 0;
		for (const _ of segmenter.segment(str)) length++;
		return length;
	} : /* v8 ignore next -- @preserve */ null;
	function graphemeLenPonyfill(str) {
		return (0, grapheme_1.countGraphemes)(str);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/utf8-len.js
var require_utf8_len$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8LenNode = void 0;
	exports.utf8LenCompute = utf8LenCompute;
	var nodejs_buffer_js_1 = require_nodejs_buffer$1();
	exports.utf8LenNode = nodejs_buffer_js_1.NodeJSBuffer ? function utf8LenNode(string) {
		return nodejs_buffer_js_1.NodeJSBuffer.byteLength(string, "utf8");
	} : /* v8 ignore next -- @preserve */ null;
	function utf8LenCompute(string) {
		let len = string.length;
		let code;
		for (let i = 0; i < string.length; i += 1) {
			code = string.charCodeAt(i);
			if (code <= 127) {} else if (code <= 2047) len += 1;
			else {
				len += 2;
				if (code >= 55296 && code <= 56319) {
					code = string.charCodeAt(i + 1);
					if (code >= 56320 && code <= 57343) i++;
				}
			}
		}
		return len;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/utf8-to-base64.js
var require_utf8_to_base64$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8ToBase64Node = void 0;
	exports.utf8ToBase64Ponyfill = utf8ToBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var nodejs_buffer_js_1 = require_nodejs_buffer$1();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64$1();
	var Buffer = nodejs_buffer_js_1.NodeJSBuffer;
	exports.utf8ToBase64Node = Buffer ? function utf8ToBase64Node(text, alphabet) {
		const buffer = Buffer.from(text, "utf8");
		return uint8array_to_base64_js_1.toBase64Node(buffer, alphabet);
	} : /* v8 ignore next -- @preserve */ null;
	var textEncoder = /*#__PURE__*/ new TextEncoder();
	function utf8ToBase64Ponyfill(text, alphabet) {
		const bytes = textEncoder.encode(text);
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/utf8.js
var require_utf8$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64 = exports.utf8ToBase64 = exports.utf8Len = exports.graphemeLen = void 0;
	var utf8_from_base64_js_1 = require_utf8_from_base64$1();
	var utf8_grapheme_len_js_1 = require_utf8_grapheme_len$1();
	var utf8_len_js_1 = require_utf8_len$1();
	var utf8_to_base64_js_1 = require_utf8_to_base64$1();
	/**
	* Counts the number of grapheme clusters (user-perceived characters) in a string.
	*
	* Grapheme clusters represent what users typically think of as "characters",
	* handling complex cases like:
	* - Emoji with skin tones and ZWJ sequences (e.g., family emoji)
	* - Combined characters (e.g., 'e' + combining accent)
	* - Regional indicator pairs (flag emoji)
	*
	* Uses native {@link Intl.Segmenter} when available, falling back to a ponyfill.
	*
	* @param str - The string to measure
	* @returns The number of grapheme clusters
	*
	* @example
	* ```typescript
	* import { graphemeLen } from '@atproto/lex-data'
	*
	* graphemeLen('hello')        // 5
	* graphemeLen('cafe\u0301')   // 4 (cafe with combining accent)
	* graphemeLen('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 1 (family emoji)
	* ```
	*/
	exports.graphemeLen = utf8_grapheme_len_js_1.graphemeLenNative ?? utf8_grapheme_len_js_1.graphemeLenPonyfill;
	/* v8 ignore next -- @preserve */
	if (exports.graphemeLen === utf8_grapheme_len_js_1.graphemeLenPonyfill) {}
	/**
	* Calculates the UTF-8 byte length of a string.
	*
	* Returns the number of bytes the string would occupy when encoded as UTF-8.
	* This is important for Lexicon validation where schemas specify byte limits.
	*
	* Uses Node.js Buffer.byteLength when available for performance,
	* falling back to a computed implementation.
	*
	* @param str - The string to measure
	* @returns The UTF-8 byte length
	*
	* @example
	* ```typescript
	* import { utf8Len } from '@atproto/lex-data'
	*
	* utf8Len('hello')      // 5 (ASCII: 1 byte per char)
	* utf8Len('\u00e9')     // 2 (e with accent: 2 bytes)
	* utf8Len('\u{1F600}')  // 4 (emoji: 4 bytes)
	* utf8Len('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 25 (family emoji)
	* ```
	*/
	exports.utf8Len = utf8_len_js_1.utf8LenNode ?? utf8_len_js_1.utf8LenCompute;
	/**
	* Encodes a UTF-8 string to base64.
	*
	* First encodes the string as UTF-8 bytes, then encodes those bytes as base64.
	*
	* @param str - The string to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The base64-encoded string
	*
	* @example
	* ```typescript
	* import { utf8ToBase64 } from '@atproto/lex-data'
	*
	* utf8ToBase64('Hello')  // 'SGVsbG8='
	* ```
	*/
	exports.utf8ToBase64 = utf8_to_base64_js_1.utf8ToBase64Node ?? utf8_to_base64_js_1.utf8ToBase64Ponyfill;
	/**
	* Decodes a base64 string to UTF-8.
	*
	* Decodes the base64 to bytes, then interprets those bytes as UTF-8 text.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The decoded UTF-8 string
	*
	* @example
	* ```typescript
	* import { utf8FromBase64 } from '@atproto/lex-data'
	*
	* utf8FromBase64('SGVsbG8=')  // 'Hello'
	* ```
	*/
	exports.utf8FromBase64 = utf8_from_base64_js_1.utf8FromBase64Node ?? utf8_from_base64_js_1.utf8FromBase64Ponyfill;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/dist/index.js
var require_dist$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_blob$3(), exports);
	tslib_1.__exportStar(require_cid$2(), exports);
	tslib_1.__exportStar(require_lex_equals$1(), exports);
	tslib_1.__exportStar(require_lex_error$1(), exports);
	tslib_1.__exportStar(require_lex$1(), exports);
	tslib_1.__exportStar(require_object$2(), exports);
	tslib_1.__exportStar(require_uint8array$1(), exports);
	tslib_1.__exportStar(require_utf8$1(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/util/array-agg.js
var require_array_agg = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.arrayAgg = arrayAgg;
	/**
	* Aggregates items in an array based on a comparison function and an aggregation function.
	*
	* @param arr - The input array to aggregate.
	* @param cmp - A comparison function that determines if two items belong to the same group.
	* @param agg - An aggregation function that combines items in a group into a single item.
	* @returns An array of aggregated items.
	* @example
	* ```ts
	* const input = [1, 1, 2, 2, 3, 3, 3]
	* const result = arrayAgg(
	*   input,
	*   (a, b) => a === b,
	*   (items) => { value: items[0], sum: items.reduce((sum, item) => sum + item, 0) },
	* )
	* // result is [{ value: 1, sum: 2 }, { value: 2, sum: 4 }, { value: 3, sum: 6 }]
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function arrayAgg(arr, cmp, agg) {
		if (arr.length === 0) return [];
		const groups = [[arr[0]]];
		const skipped = Array(arr.length);
		outer: for (let i = 1; i < arr.length; i++) {
			if (skipped[i]) continue;
			const item = arr[i];
			for (let j = 0; j < groups.length; j++) if (cmp(item, groups[j][0])) {
				groups[j].push(item);
				skipped[i] = true;
				continue outer;
			}
			groups.push([item]);
		}
		return groups.map(agg);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/validation-issue.js
var require_validation_issue = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.IssueTooSmall = exports.IssueTooBig = exports.IssueRequiredKey = exports.IssueInvalidValue = exports.IssueInvalidType = exports.IssueInvalidFormat = exports.IssueCustom = exports.Issue = void 0;
	var lex_data_1 = require_dist$5();
	/**
	* Abstract base class for all validation issues.
	*
	* An issue represents a single validation failure, containing:
	* - A code identifying the type of issue
	* - The path to the invalid value in the data structure
	* - The actual input value that failed validation
	*
	* Subclasses add specific properties relevant to each issue type and
	* implement the {@link toString} method for human-readable error messages.
	*/
	var Issue = class {
		code;
		path;
		input;
		constructor(code, path, input) {
			this.code = code;
			this.path = path;
			this.input = input;
		}
		/**
		* Converts the issue to a JSON-serializable object.
		*
		* @returns An object containing the issue code, path, and message
		*/
		toJSON() {
			return {
				code: this.code,
				path: this.path,
				message: this.toString()
			};
		}
	};
	exports.Issue = Issue;
	/**
	* A custom validation issue with a user-defined message.
	*
	* Use this for validation rules that don't fit into the standard issue categories.
	*/
	var IssueCustom = class extends Issue {
		path;
		input;
		message;
		constructor(path, input, message) {
			super("custom", path, input);
			this.path = path;
			this.input = input;
			this.message = message;
		}
		toString() {
			return `${this.message}${stringifyPath(this.path)}`;
		}
	};
	exports.IssueCustom = IssueCustom;
	/**
	* Issue for string values that don't match an expected format.
	*
	* Used for AT Protocol specific formats like DID, handle, NSID, AT-URI, etc.
	*/
	var IssueInvalidFormat = class extends Issue {
		format;
		message;
		constructor(path, input, format, message) {
			super("invalid_format", path, input);
			this.format = format;
			this.message = message;
		}
		toString() {
			return `Invalid ${this.formatDescription}${this.message ? ` (${this.message})` : ""}${stringifyPath(this.path)} (got ${stringifyValue(this.input)})`;
		}
		toJSON() {
			return {
				...super.toJSON(),
				format: this.format
			};
		}
		/** Returns a human-readable description of the expected format. */
		get formatDescription() {
			switch (this.format) {
				case "at-identifier": return `AT identifier`;
				case "did": return `DID`;
				case "nsid": return `NSID`;
				case "cid": return `CID string`;
				case "tid": return `TID string`;
				case "record-key": return `record key`;
				default: return this.format;
			}
		}
	};
	exports.IssueInvalidFormat = IssueInvalidFormat;
	/**
	* Issue for values that have an unexpected type.
	*
	* This is one of the most common validation issues, occurring when the
	* runtime type of a value doesn't match the expected schema type.
	*/
	var IssueInvalidType = class extends Issue {
		expected;
		constructor(path, input, expected) {
			super("invalid_type", path, input);
			this.expected = expected;
		}
		toString() {
			return `Expected ${oneOf(this.expected.map(stringifyExpectedType))} value type${stringifyPath(this.path)} (got ${stringifyType(this.input)})`;
		}
		toJSON() {
			return {
				...super.toJSON(),
				expected: this.expected
			};
		}
	};
	exports.IssueInvalidType = IssueInvalidType;
	/**
	* Issue for values that don't match any of the expected literal values.
	*
	* Used when a value must be one of a specific set of allowed values
	* (e.g., enum-like constraints).
	*/
	var IssueInvalidValue = class extends Issue {
		values;
		constructor(path, input, values) {
			super("invalid_value", path, input);
			this.values = values;
		}
		toString() {
			return `Expected ${oneOf(this.values.map(stringifyValue))}${stringifyPath(this.path)} (got ${stringifyValue(this.input)})`;
		}
		toJSON() {
			return {
				...super.toJSON(),
				values: this.values
			};
		}
	};
	exports.IssueInvalidValue = IssueInvalidValue;
	/**
	* Issue for missing required object properties.
	*/
	var IssueRequiredKey = class extends Issue {
		key;
		constructor(path, input, key) {
			super("required_key", path, input);
			this.key = key;
		}
		toString() {
			return `Missing required key "${String(this.key)}"${stringifyPath(this.path)}`;
		}
		toJSON() {
			return {
				...super.toJSON(),
				key: this.key
			};
		}
	};
	exports.IssueRequiredKey = IssueRequiredKey;
	/**
	* Issue for values that exceed a maximum constraint.
	*/
	var IssueTooBig = class extends Issue {
		maximum;
		type;
		actual;
		constructor(path, input, maximum, type, actual) {
			super("too_big", path, input);
			this.maximum = maximum;
			this.type = type;
			this.actual = actual;
		}
		toString() {
			return `${this.type} too big (maximum ${this.maximum})${stringifyPath(this.path)} (got ${this.actual})`;
		}
		toJSON() {
			return {
				...super.toJSON(),
				type: this.type,
				maximum: this.maximum
			};
		}
	};
	exports.IssueTooBig = IssueTooBig;
	/**
	* Issue for values that are below a minimum constraint.
	*/
	var IssueTooSmall = class extends Issue {
		minimum;
		type;
		actual;
		constructor(path, input, minimum, type, actual) {
			super("too_small", path, input);
			this.minimum = minimum;
			this.type = type;
			this.actual = actual;
		}
		toString() {
			return `${this.type} too small (minimum ${this.minimum})${stringifyPath(this.path)} (got ${this.actual})`;
		}
		toJSON() {
			return {
				...super.toJSON(),
				type: this.type,
				minimum: this.minimum
			};
		}
	};
	exports.IssueTooSmall = IssueTooSmall;
	function stringifyExpectedType(expected) {
		if (expected === "$typed") return "an object which includes the \"$type\" property";
		return expected;
	}
	function stringifyPath(path) {
		return ` at ${buildJsonPath(path)}`;
	}
	function buildJsonPath(path) {
		return `$${path.map(toJsonPathSegment).join("")}`;
	}
	function toJsonPathSegment(segment) {
		if (typeof segment === "number") return `[${segment}]`;
		else if (/^[a-zA-Z_$][a-zA-Z0-9_]*$/.test(segment)) return `.${segment}`;
		else return `[${JSON.stringify(segment)}]`;
	}
	function oneOf(arr) {
		if (arr.length === 0) return "";
		if (arr.length === 1) return arr[0];
		return `one of ${arr.slice(0, -1).join(", ")} or ${arr.at(-1)}`;
	}
	function stringifyType(value) {
		switch (typeof value) {
			case "object":
				if (value === null) return "null";
				if (Array.isArray(value)) return "array";
				if ((0, lex_data_1.ifCid)(value)) return "cid";
				if ((0, lex_data_1.isLegacyBlobRef)(value)) return "legacy-blob";
				if (value instanceof Date) return "date";
				if (value instanceof RegExp) return "regexp";
				if (value instanceof Map) return "map";
				if (value instanceof Set) return "set";
				return "object";
			case "number":
				if (Number.isInteger(value) && Number.isSafeInteger(value)) return "integer";
				if (Number.isNaN(value)) return "NaN";
				if (value === Infinity) return "Infinity";
				if (value === -Infinity) return "-Infinity";
				return "float";
			default: return typeof value;
		}
	}
	function stringifyValue(value) {
		switch (typeof value) {
			case "bigint": return `${value}n`;
			case "number":
			case "string":
			case "boolean": return JSON.stringify(value);
			case "object":
				if (Array.isArray(value)) return `[${/* @__PURE__ */ stringifyArray(value, stringifyValue)}]`;
				if ((0, lex_data_1.isPlainObject)(value)) return `{${/* @__PURE__ */ stringifyArray(Object.entries(value), stringifyObjectEntry)}}`;
			default: return stringifyType(value);
		}
	}
	/*@__NO_SIDE_EFFECTS__*/
	function stringifyObjectEntry([key, _value]) {
		return `${JSON.stringify(key)}: ...`;
	}
	/*@__NO_SIDE_EFFECTS__*/
	function stringifyArray(arr, fn, n = 2) {
		return arr.slice(0, n).map(fn).join(", ") + (arr.length > n ? ", ..." : "");
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/validation-error.js
var require_validation_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ValidationError = void 0;
	var lex_data_1 = require_dist$5();
	var array_agg_js_1 = require_array_agg();
	var result_js_1 = require_result();
	var validation_issue_js_1 = require_validation_issue();
	exports.ValidationError = class ValidationError extends lex_data_1.LexError {
		name = "ValidationError";
		/**
		* The list of validation issues that caused this error.
		*
		* Issues are aggregated when possible (e.g., multiple invalid type issues
		* at the same path are combined into a single issue listing all expected types).
		*/
		issues;
		/**
		* Creates a new validation error from a list of issues.
		*
		* Issues are automatically aggregated to combine related issues at the same
		* path (e.g., multiple type expectations from a union schema).
		*
		* @param issues - The validation issues that caused this error
		* @param options - Standard Error options (e.g., `cause`)
		*/
		constructor(issues, options) {
			const issuesAgg = aggregateIssues(issues);
			super("InvalidRequest", issuesAgg.join(", "), options);
			this.issues = issuesAgg;
		}
		/**
		* Converts the error to a JSON-serializable object.
		*
		* @returns An object containing the error details and all issues in JSON format
		*/
		toJSON() {
			return {
				...super.toJSON(),
				issues: this.issues.map((issue) => issue.toJSON())
			};
		}
		/**
		* Creates a validation error by combining multiple validation failures.
		*
		* This is useful when validating against multiple possible schemas (e.g., unions)
		* and all branches fail. The resulting error contains issues from all failures.
		*
		* @param failures - The validation failures to combine
		* @returns A single validation error containing all issues from the failures
		*
		* @example
		* ```typescript
		* const failures = schemas.map(s => s.safeValidate(data)).filter(r => !r.success)
		* if (failures.length === schemas.length) {
		*   throw ValidationError.fromFailures(failures)
		* }
		* ```
		*/
		static fromFailures(failures) {
			if (failures.length === 1) return (0, result_js_1.failureReason)(failures[0]);
			const issues = failures.flatMap(extractFailureIssues);
			return new ValidationError(issues, { cause: failures.map(result_js_1.failureReason) });
		}
	};
	function extractFailureIssues(result) {
		return result.reason.issues;
	}
	function aggregateIssues(issues) {
		if (issues.length <= 1) return issues;
		if (issues.length === 2 && issues[0].code !== issues[1].code) return issues;
		return [
			...(0, array_agg_js_1.arrayAgg)(issues.filter((issue) => issue instanceof validation_issue_js_1.IssueInvalidType), (a, b) => /* @__PURE__ */ comparePropertyPaths(a.path, b.path), (issues) => new validation_issue_js_1.IssueInvalidType(issues[0].path, issues[0].input, Array.from(new Set(issues.flatMap((iss) => iss.expected))))),
			...(0, array_agg_js_1.arrayAgg)(issues.filter((issue) => issue instanceof validation_issue_js_1.IssueInvalidValue), (a, b) => /* @__PURE__ */ comparePropertyPaths(a.path, b.path), (issues) => new validation_issue_js_1.IssueInvalidValue(issues[0].path, issues[0].input, Array.from(new Set(issues.flatMap((iss) => iss.values))))),
			...issues.filter((issue) => !(issue instanceof validation_issue_js_1.IssueInvalidType) && !(issue instanceof validation_issue_js_1.IssueInvalidValue))
		];
	}
	/*@__NO_SIDE_EFFECTS__*/
	function comparePropertyPaths(a, b) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
		return true;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/validator.js
var require_validator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ValidationContext = void 0;
	var result_js_1 = require_result();
	var validation_error_js_1 = require_validation_error();
	var validation_issue_js_1 = require_validation_issue();
	exports.ValidationContext = class ValidationContext {
		options;
		static validate(input, validator, options) {
			return new ValidationContext({
				path: options?.path ?? [],
				mode: options?.mode ?? "validate"
			}).validate(input, validator);
		}
		/**
		* The current path being validated, used for error reporting.
		*/
		currentPath;
		/**
		* Accumulated validation issues collected during traversal.
		*/
		issues = [];
		/**
		* Creates a new validation context with the specified options.
		*
		* @param options - The validation options (path and mode are required)
		*/
		constructor(options) {
			this.options = options;
			this.currentPath = Array.from(options.path);
		}
		/**
		* Returns a copy of the current validation path.
		*
		* The path represents the location in the data structure being validated,
		* used for constructing meaningful error messages.
		*/
		get path() {
			return Array.from(this.currentPath);
		}
		/**
		* Creates a new path by appending segments to the current path.
		*
		* @param path - Optional path segment(s) to append
		* @returns A new path array with the segment(s) appended
		*/
		concatPath(path) {
			if (path == null) return this.path;
			return this.currentPath.concat(path);
		}
		/**
		* Validates input against a validator within this context.
		*
		* This is the primary entry point for validation within a context. Always use
		* this method instead of calling {@link Validator.validateInContext} directly,
		* as this method enforces validation mode rules and handles transformation detection.
		*
		* @typeParam V - The validator type
		* @param input - The value to validate
		* @param validator - The validator to use
		* @returns A validation result with the validated value or error
		*/
		validate(input, validator) {
			const result = validator.validateInContext(input, this);
			if (result.success) {
				if (this.issues.length > 0) return (0, result_js_1.failure)(new validation_error_js_1.ValidationError(Array.from(this.issues)));
				if (this.options.mode !== "parse" && !Object.is(result.value, input)) return this.issueInvalidValue(input, [result.value]);
			}
			return result;
		}
		/**
		* Validates a child property of an object within this context.
		*
		* This method automatically manages the path stack, pushing the property key
		* before validation and popping it afterward. Use this for validating object
		* properties to ensure proper path tracking in error messages.
		*
		* @typeParam I - The input object type
		* @typeParam K - The property key type
		* @typeParam V - The validator type
		* @param input - The parent object containing the property
		* @param key - The property key to validate
		* @param validator - The validator to use for the property value
		* @returns A validation result for the property value
		*
		* @example
		* ```typescript
		* // In a custom object validator
		* const result = ctx.validateChild(input, 'name', stringSchema)
		* // If validation fails, error path will include 'name'
		* ```
		*/
		validateChild(input, key, validator) {
			this.currentPath.push(key);
			try {
				return this.validate(input[key], validator);
			} finally {
				this.currentPath.length--;
			}
		}
		/**
		* Adds a validation issue to the context without immediately failing.
		*
		* Use this method to collect multiple issues during validation before
		* determining the final result. Issues added this way will be included
		* in the final error if validation fails.
		*
		* @param issue - The validation issue to add
		*/
		addIssue(issue) {
			this.issues.push(issue);
		}
		/**
		* Creates a successful validation result with the given value.
		*
		* @typeParam V - The value type
		* @param value - The validated value
		* @returns A successful validation result
		*/
		success(value) {
			return (0, result_js_1.success)(value);
		}
		/**
		* Creates a failed validation result with the given error.
		*
		* @param reason - The validation error
		* @returns A failed validation result
		*/
		failure(reason) {
			return (0, result_js_1.failure)(reason);
		}
		/**
		* Creates a failed validation result from a single issue.
		*
		* Any previously accumulated issues in the context are included in the error.
		*
		* @param issue - The validation issue that caused the failure
		* @returns A failed validation result
		*/
		issue(issue) {
			return this.failure(new validation_error_js_1.ValidationError([...this.issues, issue]));
		}
		/**
		* Creates a failure for an invalid value that doesn't match expected values.
		*
		* @param input - The actual value that was received
		* @param values - The expected valid values
		* @returns A failed validation result with an invalid value issue
		*/
		issueInvalidValue(input, values) {
			return this.issue(new validation_issue_js_1.IssueInvalidValue(this.path, input, values));
		}
		/**
		* Creates a failure for an invalid type.
		*
		* @param input - The actual value that was received
		* @param expected - An array of expected type names
		* @returns A failed validation result with an invalid type issue
		*/
		issueInvalidType(input, expected) {
			return this.issue(new validation_issue_js_1.IssueInvalidType(this.path, input, expected));
		}
		/**
		* Creates a failure for an invalid type.
		*
		* @param input - The actual value that was received
		* @param expected - The expected type name
		* @returns A failed validation result with an invalid type issue
		*/
		issueUnexpectedType(input, expected) {
			return this.issueInvalidType(input, [expected]);
		}
		/**
		* Creates a failure for a missing required key in an object.
		*
		* @param input - The object missing the required key
		* @param key - The name of the required key
		* @returns A failed validation result with a required key issue
		*/
		issueRequiredKey(input, key) {
			return this.issue(new validation_issue_js_1.IssueRequiredKey(this.path, input, key));
		}
		/**
		* Creates a failure for an invalid string format.
		*
		* @param input - The actual value that was received
		* @param format - The expected format name (e.g., 'did', 'handle', 'uri')
		* @param msg - Optional additional message describing the format error
		* @returns A failed validation result with an invalid format issue
		*/
		issueInvalidFormat(input, format, msg) {
			return this.issue(new validation_issue_js_1.IssueInvalidFormat(this.path, input, format, msg));
		}
		/**
		* Creates a failure for a value that exceeds a maximum constraint.
		*
		* @param input - The actual value that was received
		* @param type - The type of measurement (e.g., 'string', 'array', 'bytes')
		* @param max - The maximum allowed value
		* @param actual - The actual measured value
		* @returns A failed validation result with a too big issue
		*/
		issueTooBig(input, type, max, actual) {
			return this.issue(new validation_issue_js_1.IssueTooBig(this.path, input, max, type, actual));
		}
		/**
		* Creates a failure for a value that is below a minimum constraint.
		*
		* @param input - The actual value that was received
		* @param type - The type of measurement (e.g., 'string', 'array', 'bytes')
		* @param min - The minimum required value
		* @param actual - The actual measured value
		* @returns A failed validation result with a too small issue
		*/
		issueTooSmall(input, type, min, actual) {
			return this.issue(new validation_issue_js_1.IssueTooSmall(this.path, input, min, type, actual));
		}
		/**
		* Creates a failure for an invalid property value within an object.
		*
		* This is a convenience method that automatically extracts the property value
		* and constructs the appropriate path.
		*
		* @typeParam I - The input object type
		* @param input - The object containing the invalid property
		* @param property - The property key with the invalid value
		* @param values - The expected valid values
		* @returns A failed validation result with an invalid value issue at the property path
		*/
		issueInvalidPropertyValue(input, property, values) {
			const value = input[property];
			const path = this.concatPath(property);
			return this.issue(new validation_issue_js_1.IssueInvalidValue(path, value, values));
		}
		/**
		* Creates a failure for an invalid property type within an object.
		*
		* This is a convenience method that automatically extracts the property value
		* and constructs the appropriate path.
		*
		* @typeParam I - The input object type
		* @param input - The object containing the invalid property
		* @param property - The property key with the invalid type
		* @param expected - The expected type name
		* @returns A failed validation result with an invalid type issue at the property path
		*/
		issueInvalidPropertyType(input, property, expected) {
			const value = input[property];
			const path = this.concatPath(property);
			return this.issue(new validation_issue_js_1.IssueInvalidType(path, value, [expected]));
		}
	};
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/schema.js
var require_schema$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Schema = void 0;
	var validator_js_1 = require_validator();
	/**
	* Abstract base class for all schema validators in the lexicon system.
	*
	* This class provides the standard validation interface that all schema types
	* implement. It offers multiple methods for validating and parsing data:
	*
	* - **Assertion methods**: `assert()`, `check()` - throw on invalid input
	* - **Type guard methods**: `matches()`, `ifMatches()` - return boolean or optional value
	* - **Parse methods**: `parse()`, `safeParse()` - allow value transformation/coercion
	* - **Validate methods**: `validate()`, `safeValidate()` - strict validation without coercion
	*
	* All methods are also available with a `$` prefix (e.g., `$parse()`, `$validate()`)
	* for consistent access in generated lexicon namespaces.
	*
	* @typeParam TInput - The type accepted as valid input during validation
	* @typeParam TOutput - The type returned after parsing (may include transformations)
	* @typeParam TInternals - Internal type structure for type inference
	*
	* @example
	* ```typescript
	* class MySchema extends Schema<string> {
	*   validateInContext(input: unknown, ctx: ValidationContext): ValidationResult {
	*     if (typeof input !== 'string') {
	*       return ctx.issueUnexpectedType(input, 'string')
	*     }
	*     return ctx.success(input)
	*   }
	* }
	*
	* const schema = new MySchema()
	* schema.assert('hello')     // OK
	* schema.assert(123)         // Throws ValidationError
	* schema.matches('hello')    // true
	* schema.matches(123)        // false
	* ```
	*/
	var Schema = class {
		/**
		* @note use {@link check}() instead of {@link assert}() if you encounter a
		* `ts(2775)` error and you are not able to fully type the validator. This
		* will typically arise in generic contexts, where the narrowed type is not
		* needed.
		*/
		assert(input) {
			const result = validator_js_1.ValidationContext.validate(input, this);
			if (!result.success) throw result.reason;
		}
		/**
		* Alias for {@link assert}(). Most useful in generic contexts where the
		* validator is not exactly typed, allowing to avoid "_Assertions require
		* every name in the call target to be declared with an explicit type
		* annotation. ts(2775)_" errors.
		*/
		check(input) {
			this.assert(input);
		}
		/**
		* Casts the input (by validating it) to the output type if it matches the
		* schema, otherwise throws. This is the same as calling {@link parse}() with
		* `mode: "validate"`.
		*/
		cast(input) {
			const result = validator_js_1.ValidationContext.validate(input, this);
			if (result.success) return result.value;
			throw result.reason;
		}
		/**
		* Type guard that checks if the input matches this schema.
		*
		* @param input - The value to check
		* @returns `true` if the input is valid according to this schema
		*
		* @example
		* ```typescript
		* if (schema.matches(data)) {
		*   // data is narrowed to the schema's input type
		*   console.log(data)
		* }
		* ```
		*/
		matches(input) {
			return validator_js_1.ValidationContext.validate(input, this).success;
		}
		/**
		* Returns the input if it matches this schema, otherwise returns `undefined`.
		*
		* This is useful for optional filtering operations where you want to
		* conditionally extract values that match a schema.
		*
		* @param input - The value to check
		* @returns The input value with narrowed type if valid, otherwise `undefined`
		*
		* @example
		* ```typescript
		* const validData = schema.ifMatches(data)
		* if (validData !== undefined) {
		*   // validData is the schema's input type
		*   console.log(validData)
		* }
		* ```
		*/
		ifMatches(input) {
			return this.matches(input) ? input : void 0;
		}
		/**
		* Parses the input, allowing value transformations and coercion.
		*
		* Unlike {@link validate}, this method allows the schema to transform
		* the input value (e.g., applying default values, type coercion).
		* Throws a {@link ValidationError} if the input is invalid.
		*
		* @param input - The value to parse
		* @param options - Optional parsing configuration
		* @returns The parsed and potentially transformed value
		* @throws {ValidationError} If the input fails validation
		*
		* @example
		* ```typescript
		* const result = schema.parse(rawData)
		* // result has defaults applied and is fully typed
		* ```
		*/
		parse(input, options) {
			const result = this.safeParse(input, options);
			if (result.success) return result.value;
			throw result.reason;
		}
		/**
		* Safely parses the input without throwing, returning a result object.
		*
		* This method allows value transformations like {@link parse}, but
		* returns a discriminated union result instead of throwing on error.
		*
		* @param input - The value to parse
		* @param options - Optional parsing configuration
		* @returns A {@link ValidationResult} with either the parsed value or validation errors
		*
		* @example
		* ```typescript
		* const result = schema.safeParse(data)
		* if (result.success) {
		*   console.log(result.value)
		* } else {
		*   console.error(result.reason.issues)
		* }
		* ```
		*/
		safeParse(input, options) {
			return validator_js_1.ValidationContext.validate(input, this, {
				...options,
				mode: "parse"
			});
		}
		/**
		* Validates the input strictly without allowing transformations.
		*
		* Unlike {@link parse}, this method requires the input to exactly match
		* the schema without any transformations (no defaults applied, no coercion).
		* Throws a {@link ValidationError} if the input is invalid or would require transformation.
		*
		* @typeParam I - The input type (preserved in the return type)
		* @param input - The value to validate
		* @param options - Optional validation configuration
		* @returns The validated input with narrowed type
		* @throws {ValidationError} If the input fails validation or requires transformation
		*
		* @example
		* ```typescript
		* const validated = schema.validate(data)
		* // validated is typed as the intersection of input type and schema type
		* ```
		*/
		validate(input, options) {
			const result = this.safeValidate(input, options);
			if (result.success) return result.value;
			throw result.reason;
		}
		/**
		* Safely validates the input without throwing, returning a result object.
		*
		* This method performs strict validation like {@link validate}, but
		* returns a discriminated union result instead of throwing on error.
		*
		* @typeParam I - The input type (preserved in the result value type)
		* @param input - The value to validate
		* @param options - Optional validation configuration
		* @returns A {@link ValidationResult} with either the validated value or validation errors
		*
		* @example
		* ```typescript
		* const result = schema.safeValidate(data)
		* if (result.success) {
		*   console.log(result.value)
		* } else {
		*   console.error(result.reason.issues)
		* }
		* ```
		*/
		safeValidate(input, options) {
			return validator_js_1.ValidationContext.validate(input, this, {
				...options,
				mode: "validate"
			});
		}
		/**
		* Alias for {@link assert} with `$` prefix for namespace compatibility.
		*
		* @see {@link assert}
		*/
		$assert(input) {
			return this.assert(input);
		}
		/**
		* Alias for {@link check} with `$` prefix for namespace compatibility.
		*
		* @see {@link check}
		*/
		$check(input) {
			return this.check(input);
		}
		/**
		* Alias for {@link cast} with `$` prefix for namespace compatibility.
		*
		* @see {@link cast}
		*/
		$cast(input) {
			return this.cast(input);
		}
		/**
		* Alias for {@link matches} with `$` prefix for namespace compatibility.
		*
		* @see {@link matches}
		*/
		$matches(input) {
			return this.matches(input);
		}
		/**
		* Alias for {@link ifMatches} with `$` prefix for namespace compatibility.
		*
		* @see {@link ifMatches}
		*/
		$ifMatches(input) {
			return this.ifMatches(input);
		}
		/**
		* Alias for {@link parse} with `$` prefix for namespace compatibility.
		*
		* @see {@link parse}
		*/
		$parse(input, options) {
			return this.parse(input, options);
		}
		/**
		* Alias for {@link safeParse} with `$` prefix for namespace compatibility.
		*
		* @see {@link safeParse}
		*/
		$safeParse(input, options) {
			return this.safeParse(input, options);
		}
		/**
		* Alias for {@link validate} with `$` prefix for namespace compatibility.
		*
		* @see {@link validate}
		*/
		$validate(input, options) {
			return this.validate(input, options);
		}
		/**
		* Alias for {@link safeValidate} with `$` prefix for namespace compatibility.
		*
		* @see {@link safeValidate}
		*/
		$safeValidate(input, options) {
			return this.safeValidate(input, options);
		}
	};
	exports.Schema = Schema;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/string-format.js
var require_string_format = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.STRING_FORMATS = exports.isUriString = exports.isTidString = exports.isRecordKeyString = exports.isNsidString = exports.isLanguageString = exports.isHandleString = exports.isDidString = exports.isDatetimeString = exports.isCidString = exports.isAtUriString = exports.isAtIdentifierString = void 0;
	exports.isStringFormat = isStringFormat;
	exports.assertStringFormat = assertStringFormat;
	exports.asStringFormat = asStringFormat;
	exports.ifStringFormat = ifStringFormat;
	var lex_data_1 = require_dist$5();
	var syntax_1 = require_dist$6();
	/**
	* Type guard that checks if a value is a valid AT identifier (DID or handle).
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid AT identifier
	*/
	exports.isAtIdentifierString = syntax_1.isValidAtIdentifier;
	/**
	* Type guard that checks if a value is a valid AT URI.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid AT URI
	*/
	exports.isAtUriString = syntax_1.isValidAtUri;
	/**
	* Type guard that checks if a value is a valid CID string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid CID string
	*/
	exports.isCidString = ((v) => (0, lex_data_1.validateCidString)(v));
	/**
	* Type guard that checks if a value is a valid datetime string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid datetime string
	*/
	exports.isDatetimeString = syntax_1.isValidDatetime;
	/**
	* Type guard that checks if a value is a valid DID string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid DID string
	*/
	exports.isDidString = syntax_1.isValidDid;
	/**
	* Type guard that checks if a value is a valid handle string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid handle string
	*/
	exports.isHandleString = syntax_1.isValidHandle;
	/**
	* Type guard that checks if a value is a valid BCP-47 language tag.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid language string
	*/
	exports.isLanguageString = syntax_1.isValidLanguage;
	/**
	* Type guard that checks if a value is a valid NSID string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid NSID string
	*/
	exports.isNsidString = syntax_1.isValidNsid;
	/**
	* Type guard that checks if a value is a valid record key string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid record key string
	*/
	exports.isRecordKeyString = syntax_1.isValidRecordKey;
	/**
	* Type guard that checks if a value is a valid TID string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid TID string
	*/
	exports.isTidString = syntax_1.isValidTid;
	/**
	* Type guard that checks if a value is a valid URI string.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid URI string
	*/
	exports.isUriString = syntax_1.isValidUri;
	var stringFormatVerifiers = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		"at-identifier": exports.isAtIdentifierString,
		"at-uri": exports.isAtUriString,
		cid: exports.isCidString,
		datetime: exports.isDatetimeString,
		did: exports.isDidString,
		handle: exports.isHandleString,
		language: exports.isLanguageString,
		nsid: exports.isNsidString,
		"record-key": exports.isRecordKeyString,
		tid: exports.isTidString,
		uri: exports.isUriString
	});
	/**
	* Type guard that checks if a string matches a specific format.
	*
	* @typeParam I - The input string type
	* @typeParam F - The format to check
	* @param input - The string to validate
	* @param format - The format name to validate against
	* @returns `true` if the string matches the format
	*
	* @example
	* ```typescript
	* const value: string = 'did:plc:1234...'
	* if (isStringFormat(value, 'did')) {
	*   // value is typed as DidString
	*   console.log('Valid DID:', value)
	* }
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function isStringFormat(input, format) {
		const formatVerifier = stringFormatVerifiers[format];
		if (!formatVerifier) throw new TypeError(`Unknown string format: ${format}`);
		return formatVerifier(input);
	}
	/**
	* Asserts that a string matches a specific format, throwing if invalid.
	*
	* @typeParam I - The input string type
	* @typeParam F - The format to check
	* @param input - The string to validate
	* @param format - The format name to validate against
	* @throws {TypeError} If the string doesn't match the format
	*
	* @example
	* ```typescript
	* assertStringFormat(value, 'handle')
	* // value is now typed as HandleString
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function assertStringFormat(input, format) {
		if (!/* @__PURE__ */ isStringFormat(input, format)) throw new TypeError(`Invalid string format (${format}): ${input}`);
	}
	/**
	* Validates and returns a string as the specified format type, throwing if invalid.
	*
	* This is useful when you need to convert a string to a format type in an expression.
	*
	* @typeParam I - The input string type
	* @typeParam F - The format to validate against
	* @param input - The string to validate
	* @param format - The format name to validate against
	* @returns The input typed as the format type
	* @throws {TypeError} If the string doesn't match the format
	*
	* @example
	* ```typescript
	* const did = asStringFormat(userInput, 'did')
	* // did is typed as DidString
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function asStringFormat(input, format) {
		return input;
	}
	/**
	* Returns the string as the format type if valid, otherwise returns `undefined`.
	*
	* This is useful for optional validation where you want to handle invalid values
	* without throwing.
	*
	* @typeParam I - The input string type
	* @typeParam F - The format to validate against
	* @param input - The string to validate
	* @param format - The format name to validate against
	* @returns The typed string if valid, otherwise `undefined`
	*
	* @example
	* ```typescript
	* const did = ifStringFormat(maybeInvalid, 'did')
	* if (did) {
	*   // did is typed as DidString
	* }
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function ifStringFormat(input, format) {
		return /* @__PURE__ */ isStringFormat(input, format) ? input : void 0;
	}
	/**
	* Array of all valid string format names.
	*
	* @example
	* ```typescript
	* for (const format of STRING_FORMATS) {
	*   console.log(format) // 'at-identifier', 'at-uri', 'cid', ...
	* }
	* ```
	*/
	exports.STRING_FORMATS = Object.freeze(/*#__PURE__*/ Object.keys(stringFormatVerifiers));
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core/types.js
var require_types$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/core.js
var require_core = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_$type(), exports);
	tslib_1.__exportStar(require_property_key(), exports);
	tslib_1.__exportStar(require_record_key(), exports);
	tslib_1.__exportStar(require_result(), exports);
	tslib_1.__exportStar(require_schema$1(), exports);
	tslib_1.__exportStar(require_string_format(), exports);
	tslib_1.__exportStar(require_types$1(), exports);
	tslib_1.__exportStar(require_validation_error(), exports);
	tslib_1.__exportStar(require_validation_issue(), exports);
	tslib_1.__exportStar(require_validator(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/util/memoize.js
var require_memoize = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.memoizedOptions = memoizedOptions;
	exports.memoizedTransformer = memoizedTransformer;
	/*@__NO_SIDE_EFFECTS__*/
	function memoizedOptions(fn) {
		let cache = null;
		return function cached(...args) {
			if (args.length > 0) return fn(...args);
			if (cache != null) return cache.value;
			const value = fn(...args);
			cache = { value };
			return value;
		};
	}
	/*@__NO_SIDE_EFFECTS__*/
	function memoizedTransformer(fn) {
		let cache;
		return function cached(key, ...args) {
			if (args.length > 0) return fn(key, ...args);
			cache ??= /* @__PURE__ */ new WeakMap();
			const cached = cache.get(key);
			if (cached) return cached;
			const result = fn(key, ...args);
			cache.set(key, result);
			return result;
		};
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/array.js
var require_array = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.array = exports.ArraySchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema for validating arrays where all items match a given schema.
	*
	* Validates that the input is an array, checks length constraints, and
	* validates each item against the provided item schema.
	*
	* @template TItem - The validator type for array items
	*
	* @example
	* ```ts
	* const schema = new ArraySchema(l.string(), { maxLength: 10 })
	* const result = schema.validate(['a', 'b', 'c'])
	* ```
	*/
	var ArraySchema = class extends core_js_1.Schema {
		validator;
		options;
		type = "array";
		constructor(validator, options = {}) {
			super();
			this.validator = validator;
			this.options = options;
		}
		validateInContext(input, ctx) {
			if (!Array.isArray(input)) return ctx.issueUnexpectedType(input, "array");
			const { minLength, maxLength } = this.options;
			if (minLength != null && input.length < minLength) return ctx.issueTooSmall(input, "array", minLength, input.length);
			if (maxLength != null && input.length > maxLength) return ctx.issueTooBig(input, "array", maxLength, input.length);
			let copy;
			for (let i = 0; i < input.length; i++) {
				const result = ctx.validateChild(input, i, this.validator);
				if (!result.success) return result;
				if (result.value !== input[i]) {
					if (ctx.options.mode === "validate") return ctx.issueInvalidPropertyValue(input, i, [result.value]);
					copy ??= Array.from(input);
					copy[i] = result.value;
				}
			}
			return ctx.success(copy ?? input);
		}
	};
	exports.ArraySchema = ArraySchema;
	function arraySchema(items, options) {
		return new ArraySchema(items, options);
	}
	exports.array = (0, memoize_js_1.memoizedTransformer)(arraySchema);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/blob.js
var require_blob$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.blob = exports.BlobSchema = exports.isLegacyBlobRef = exports.isBlobRef = void 0;
	var lex_data_1 = require_dist$5();
	Object.defineProperty(exports, "isBlobRef", {
		enumerable: true,
		get: function() {
			return lex_data_1.isBlobRef;
		}
	});
	Object.defineProperty(exports, "isLegacyBlobRef", {
		enumerable: true,
		get: function() {
			return lex_data_1.isLegacyBlobRef;
		}
	});
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema for validating blob references in AT Protocol.
	*
	* Validates BlobRef objects which contain a CID reference to binary data,
	* along with metadata like MIME type and size. Can optionally accept
	* legacy blob reference format.
	*
	* @template TOptions - The configuration options type
	*
	* @example
	* ```ts
	* const schema = new BlobSchema({ accept: ['image/*'], maxSize: 1000000 })
	* const result = schema.validate(blobRef)
	* ```
	*/
	var BlobSchema = class extends core_js_1.Schema {
		options;
		type = "blob";
		constructor(options) {
			super();
			this.options = options;
		}
		validateInContext(input, ctx) {
			const blob = input?.$type !== void 0 ? (0, lex_data_1.isBlobRef)(input, this.options) ? input : null : this.options?.allowLegacy === true && (0, lex_data_1.isLegacyBlobRef)(input) ? input : null;
			if (!blob) return ctx.issueUnexpectedType(input, "blob");
			const accept = this.options?.accept;
			if (accept && !matchesMime(blob.mimeType, accept)) return ctx.issueInvalidPropertyValue(blob, "mimeType", accept);
			const maxSize = this.options?.maxSize;
			if (maxSize != null && "size" in blob && blob.size > maxSize) return ctx.issueTooBig(blob, "blob", maxSize, blob.size);
			return ctx.success(blob);
		}
		matchesMime(mime) {
			const accept = this.options?.accept;
			if (!accept) return true;
			return matchesMime(mime, accept);
		}
	};
	exports.BlobSchema = BlobSchema;
	function matchesMime(mime, accepted) {
		if (accepted.includes("*/*")) return true;
		if (accepted.includes(mime)) return true;
		for (const value of accepted) if (value.endsWith("/*") && mime.startsWith(value.slice(0, -1))) return true;
		return false;
	}
	/**
	* Creates a blob schema for validating blob references with optional constraints.
	*
	* Blob references are used in AT Protocol to reference binary data stored
	* separately from records. They contain a CID, MIME type, and size information.
	*
	* @param options - Optional configuration for MIME type filtering and size limits
	* @returns A new {@link BlobSchema} instance
	*
	* @example
	* ```ts
	* // Basic blob reference
	* const fileSchema = l.blob()
	*
	* // Image files only
	* const imageSchema = l.blob({ accept: ['image/png', 'image/jpeg', 'image/gif'] })
	*
	* // Any image type with size limit
	* const avatarSchema = l.blob({ accept: ['image/*'], maxSize: 1000000 })
	*
	* // Allow legacy format
	* const legacySchema = l.blob({ allowLegacy: true })
	* ```
	*/
	exports.blob = (0, memoize_js_1.memoizedOptions)(function(options) {
		return new BlobSchema(options);
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/boolean.js
var require_boolean = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.boolean = exports.BooleanSchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema for validating boolean values.
	*
	* Only accepts JavaScript `true` or `false` values. Does not perform
	* any coercion from strings or numbers.
	*
	* @example
	* ```ts
	* const schema = new BooleanSchema()
	* schema.validate(true)  // success
	* schema.validate(false) // success
	* schema.validate('true') // fails - no string coercion
	* ```
	*/
	var BooleanSchema = class extends core_js_1.Schema {
		type = "boolean";
		validateInContext(input, ctx) {
			if (typeof input === "boolean") return ctx.success(input);
			return ctx.issueUnexpectedType(input, "boolean");
		}
	};
	exports.BooleanSchema = BooleanSchema;
	/**
	* Creates a boolean schema that validates true/false values.
	*
	* @returns A new {@link BooleanSchema} instance
	*
	* @example
	* ```ts
	* const enabledSchema = l.boolean()
	*
	* enabledSchema.parse(true)   // true
	* enabledSchema.parse(false)  // false
	* enabledSchema.parse('true') // throws - strings not accepted
	* ```
	*/
	exports.boolean = (0, memoize_js_1.memoizedOptions)(function() {
		return new BooleanSchema();
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/bytes.js
var require_bytes$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bytes = exports.BytesSchema = void 0;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema for validating binary data as Uint8Array with optional length constraints.
	*
	* In "parse" mode, coerces various binary formats (Buffer, ArrayBuffer, etc.)
	* into Uint8Array. In "validate" mode, only accepts Uint8Array directly.
	*
	* @example
	* ```ts
	* const schema = new BytesSchema({ maxLength: 1024 })
	* const result = schema.validate(new Uint8Array([1, 2, 3]))
	* ```
	*/
	var BytesSchema = class extends core_js_1.Schema {
		options;
		type = "bytes";
		constructor(options = {}) {
			super();
			this.options = options;
		}
		validateInContext(input, ctx) {
			const bytes = ctx.options.mode === "parse" ? (0, lex_data_1.asUint8Array)(input) : (0, lex_data_1.ifUint8Array)(input);
			if (!bytes) return ctx.issueUnexpectedType(input, "bytes");
			const { minLength } = this.options;
			if (minLength != null && bytes.length < minLength) return ctx.issueTooSmall(bytes, "bytes", minLength, bytes.length);
			const { maxLength } = this.options;
			if (maxLength != null && bytes.length > maxLength) return ctx.issueTooBig(bytes, "bytes", maxLength, bytes.length);
			return ctx.success(bytes);
		}
	};
	exports.BytesSchema = BytesSchema;
	/**
	* Creates a bytes schema for validating binary data with optional length constraints.
	*
	* Validates Uint8Array values and can coerce other binary formats in parse mode.
	*
	* @param options - Optional configuration for minimum and maximum byte length
	* @returns A new {@link BytesSchema} instance
	*
	* @example
	* ```ts
	* // Basic bytes schema
	* const dataSchema = l.bytes()
	*
	* // With size constraints
	* const avatarSchema = l.bytes({ maxLength: 1000000 }) // 1MB max
	*
	* // With minimum size
	* const hashSchema = l.bytes({ minLength: 32, maxLength: 32 }) // Exactly 32 bytes
	* ```
	*/
	exports.bytes = (0, memoize_js_1.memoizedOptions)(function(options) {
		return new BytesSchema(options);
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/cid.js
var require_cid$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.cid = exports.CidSchema = void 0;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema for validating Content Identifiers (CIDs).
	*
	* CIDs are self-describing content-addressed identifiers used in AT Protocol
	* to reference data by its cryptographic hash. This schema validates that
	* the input is a valid CID object.
	*
	* @template TOptions - The configuration options type
	*
	* @example
	* ```ts
	* const schema = new CidSchema()
	* const result = schema.validate(someCid)
	* ```
	*/
	var CidSchema = class extends core_js_1.Schema {
		options;
		type = "cid";
		constructor(options) {
			super();
			this.options = options;
		}
		validateInContext(input, ctx) {
			if (!(0, lex_data_1.isCid)(input, this.options)) return ctx.issueUnexpectedType(input, "cid");
			return ctx.success(input);
		}
	};
	exports.CidSchema = CidSchema;
	/**
	* Creates a CID schema for validating Content Identifiers.
	*
	* CIDs are used throughout AT Protocol to reference content by its hash.
	* This is commonly used for referencing blobs, commits, and other data.
	*
	* @param options - Optional configuration for CID validation
	* @returns A new {@link CidSchema} instance
	*
	* @example
	* ```ts
	* // Basic CID validation
	* const cidSchema = l.cid()
	*
	* // Validate a CID from a blob reference
	* const result = cidSchema.validate(blobRef.ref)
	* ```
	*/
	exports.cid = (0, memoize_js_1.memoizedOptions)(function(options) {
		return new CidSchema(options);
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/dict.js
var require_dict = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DictSchema = void 0;
	exports.dict = dict;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	/**
	* Schema for validating dictionary/map-like objects with dynamic keys.
	*
	* Unlike `ObjectSchema` which validates a fixed set of properties, `DictSchema`
	* validates objects where any string key is allowed, with both keys and values
	* validated against their respective schemas.
	*
	* @note There is no dictionary in Lexicon schemas. This is a custom extension
	* to allow map-like objects when using the lex library programmatically (i.e.
	* not code generated from a lexicon schema).
	*
	* @template TKey - The validator type for dictionary keys (must validate strings)
	* @template TValue - The validator type for dictionary values
	*
	* @example
	* ```ts
	* const schema = new DictSchema(l.string(), l.integer())
	* const result = schema.validate({ a: 1, b: 2, c: 3 })
	* ```
	*/
	var DictSchema = class extends core_js_1.Schema {
		keySchema;
		valueSchema;
		type = "dict";
		constructor(keySchema, valueSchema) {
			super();
			this.keySchema = keySchema;
			this.valueSchema = valueSchema;
		}
		validateInContext(input, ctx, options) {
			if (!(0, lex_data_1.isPlainObject)(input)) return ctx.issueUnexpectedType(input, "dict");
			let copy;
			for (const key in input) {
				if (options?.ignoredKeys?.has(key)) continue;
				const keyResult = ctx.validate(key, this.keySchema);
				if (!keyResult.success) return keyResult;
				if (keyResult.value !== key) return ctx.issueRequiredKey(input, key);
				const valueResult = ctx.validateChild(input, key, this.valueSchema);
				if (!valueResult.success) return valueResult;
				if (!Object.is(valueResult.value, input[key])) {
					if (ctx.options.mode === "validate") return ctx.issueInvalidPropertyValue(input, key, [valueResult.value]);
					copy ??= { ...input };
					copy[key] = valueResult.value;
				}
			}
			return ctx.success(copy ?? input);
		}
	};
	exports.DictSchema = DictSchema;
	/**
	* Creates a dictionary schema for validating map-like objects.
	*
	* Validates objects where all keys match the key schema and all values
	* match the value schema. Useful for dynamic key-value mappings.
	*
	* @param key - Schema to validate each key (must be a string validator)
	* @param value - Schema to validate each value
	* @returns A new {@link DictSchema} instance
	*
	* @example
	* ```ts
	* // String to number mapping
	* const scoresSchema = l.dict(l.string(), l.integer())
	* scoresSchema.parse({ alice: 100, bob: 85 })
	*
	* // Constrained keys
	* const langSchema = l.dict(
	*   l.string({ minLength: 2, maxLength: 5 }), // Language codes
	*   l.string() // Translations
	* )
	*
	* // Complex values
	* const usersById = l.dict(
	*   l.string({ format: 'did' }),
	*   l.object({ name: l.string(), age: l.integer() })
	* )
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function dict(key, value) {
		return new DictSchema(key, value);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/enum.js
var require_enum = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EnumSchema = void 0;
	exports.enumSchema = enumSchema;
	exports.enum = enumSchema;
	var core_js_1 = require_core();
	/**
	* Schema that accepts one of several specific literal values.
	*
	* Validates that the input matches one of the allowed values using strict
	* equality. Similar to TypeScript union of literals.
	*
	* @template TValue - The union of literal types
	*
	* @example
	* ```ts
	* const schema = new EnumSchema(['pending', 'active', 'completed'])
	* schema.validate('active')  // success
	* schema.validate('invalid') // fails
	* ```
	*/
	var EnumSchema = class extends core_js_1.Schema {
		values;
		type = "enum";
		constructor(values) {
			super();
			this.values = values;
		}
		validateInContext(input, ctx) {
			if (!this.values.includes(input)) return ctx.issueInvalidValue(input, this.values);
			return ctx.success(input);
		}
	};
	exports.EnumSchema = EnumSchema;
	/**
	* Creates an enum schema that accepts one of the specified values.
	*
	* Similar to TypeScript's union of string literals. Use `l.enum()` for
	* the namespace-friendly alias.
	*
	* @param value - Array of allowed values
	* @returns A new {@link EnumSchema} instance
	*
	* @example
	* ```ts
	* // String enum
	* const statusSchema = l.enum(['pending', 'active', 'completed', 'failed'])
	*
	* // Number enum
	* const prioritySchema = l.enum([1, 2, 3, 4, 5])
	*
	* // Mixed types
	* const mixedSchema = l.enum(['auto', 0, 1, true])
	*
	* // Use in objects
	* const taskSchema = l.object({
	*   title: l.string(),
	*   status: l.enum(['todo', 'in-progress', 'done']),
	* })
	*
	* // In discriminated unions
	* const resultSchema = l.discriminatedUnion('status', [
	*   l.object({ status: l.enum(['pending', 'processing']), progress: l.integer() }),
	*   l.object({ status: l.literal('completed'), result: l.unknown() }),
	* ])
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function enumSchema(value) {
		return new EnumSchema(value);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/integer.js
var require_integer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.integer = exports.IntegerSchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema for validating integer values with optional range constraints.
	*
	* Only accepts safe integers (values that can be exactly represented in JavaScript).
	* Use {@link IntegerSchemaOptions} to constrain the allowed range.
	*
	* @example
	* ```ts
	* const schema = new IntegerSchema({ minimum: 0, maximum: 100 })
	* const result = schema.validate(42)
	* ```
	*/
	var IntegerSchema = class extends core_js_1.Schema {
		options;
		type = "integer";
		constructor(options) {
			super();
			this.options = options;
		}
		validateInContext(input, ctx) {
			if (!isInteger(input)) return ctx.issueUnexpectedType(input, "integer");
			if (this.options?.minimum != null && input < this.options.minimum) return ctx.issueTooSmall(input, "integer", this.options.minimum, input);
			if (this.options?.maximum != null && input > this.options.maximum) return ctx.issueTooBig(input, "integer", this.options.maximum, input);
			return ctx.success(input);
		}
	};
	exports.IntegerSchema = IntegerSchema;
	/**
	* Simple wrapper around {@link Number.isSafeInteger} that acts as a type guard.
	*/
	function isInteger(input) {
		return Number.isSafeInteger(input);
	}
	/**
	* Creates an integer schema with optional minimum and maximum constraints.
	*
	* Validates that the input is a safe integer (can be exactly represented in JavaScript)
	* and optionally falls within a specified range.
	*
	* @param options - Optional configuration for minimum and maximum values
	* @returns A new {@link IntegerSchema} instance
	*
	* @example
	* ```ts
	* // Basic integer
	* const countSchema = l.integer()
	*
	* // With minimum value
	* const positiveSchema = l.integer({ minimum: 1 })
	*
	* // With range constraints
	* const percentSchema = l.integer({ minimum: 0, maximum: 100 })
	*
	* // Age validation
	* const ageSchema = l.integer({ minimum: 0, maximum: 150 })
	* ```
	*/
	exports.integer = (0, memoize_js_1.memoizedOptions)(function(options) {
		return new IntegerSchema(options);
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/lex-value.js
var require_lex_value = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexValue = exports.LexValueSchema = void 0;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	var EXPECTED_TYPES = Object.freeze([
		"null",
		"boolean",
		"integer",
		"string",
		"cid",
		"bytes",
		"array",
		"object"
	]);
	/**
	* AT Protocol lexicon values are any valid AT Protocol data types: string,
	* integer, boolean, null, bytes, cid, array, or object.
	*/
	var LexValueSchema = class extends core_js_1.Schema {
		type = "lexValue";
		validateInContext(input, ctx) {
			if ((0, lex_data_1.isPlainObject)(input)) for (const key of Object.keys(input)) {
				const r = ctx.validateChild(input, key, this);
				if (!r.success) return r;
			}
			else if (Array.isArray(input)) for (let i = 0; i < input.length; i++) {
				const r = ctx.validateChild(input, i, this);
				if (!r.success) return r;
			}
			else if (!(0, lex_data_1.isLexScalar)(input)) return ctx.issueInvalidType(input, EXPECTED_TYPES);
			return ctx.success(input);
		}
	};
	exports.LexValueSchema = LexValueSchema;
	/**
	* Creates a schema that accepts any valid AT Protocol data type: string,
	* integer, boolean, null, bytes, cid, array, or plain object. Arrays and
	* objects are recursively validated to ensure all nested values are also valid
	* AT Protocol data types.
	*
	* @see {@link LexValue} from `@atproto/lex-data` for the type definition of valid AT Protocol data types
	* @returns A new {@link LexValueSchema} instance
	*
	* @example
	* ```ts
	* const schema = l.lexValue()
	*
	* schema.validate('hello')              // success
	* schema.validate(42)                   // success
	* schema.validate(null)                 // success
	* schema.validate([1, 'two', null])     // success
	* schema.validate({ any: 'props' })     // success
	* schema.validate(new Date())           // fails - Date is not a valid LexValue
	* schema.validate({ foo: 1.2 })         // fails - 1.2 is not a valid LexValue (not an integer)
	* ```
	*/
	exports.lexValue = (0, memoize_js_1.memoizedOptions)(function() {
		return new LexValueSchema();
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/lex-map.js
var require_lex_map = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unknownObject = exports.lexMap = exports.LexMapSchema = void 0;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	var propertyValueSchema = /*#__PURE__*/ (0, require_lex_value().lexValue)();
	/**
	* AT Protocol lexicon schema definitions with "type": "unknown" are represented
	* as plain objects with string keys and values that are valid AT Protocol data
	* types (string, integer, boolean, null, bytes, cid, array, or object). This
	* type alias corresponds to the expected structure of such "unknown" schema
	* values.
	*/
	var LexMapSchema = class extends core_js_1.Schema {
		type = "lexMap";
		validateInContext(input, ctx) {
			if (!(0, lex_data_1.isPlainObject)(input)) return ctx.issueUnexpectedType(input, "object");
			for (const key of Object.keys(input)) {
				const r = ctx.validateChild(input, key, propertyValueSchema);
				if (!r.success) return r;
			}
			return ctx.success(input);
		}
	};
	exports.LexMapSchema = LexMapSchema;
	/**
	* Creates a schema that accepts any plain object with string keys and values
	* that are valid AT Protocol data types (string, integer, boolean, null, bytes,
	* cid, array, or object).
	*
	* @see {@link LexMap} from `@atproto/lex-data` for the type definition of valid AT Protocol data types
	* @returns A new {@link LexMapSchema} instance
	*
	* @example
	* ```ts
	* // Accept any object shape
	* const schema = l.lexMap()
	*
	* schema.validate({ any: 'props' })    // success
	* schema.validate([1, 2, 3])           // fails - only plain objects are accepted
	* schema.validate({ foo: new Date() }) // fails - Date is not a valid LexValue
	* schema.validate({ foo: 1.2 })        // fails - 1.2 is not a valid LexValue (not an integer)
	* ```
	*/
	exports.lexMap = (0, memoize_js_1.memoizedOptions)(function() {
		return new LexMapSchema();
	});
	/** @deprecated Use {@link lexMap} instead */
	exports.unknownObject = exports.lexMap;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/literal.js
var require_literal = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LiteralSchema = void 0;
	exports.literal = literal;
	var core_js_1 = require_core();
	/**
	* Schema that only accepts a specific literal value.
	*
	* Validates that the input is exactly equal to the specified value using
	* strict equality (===).
	*
	* @template TValue - The literal type (null, string, number, or boolean)
	*
	* @example
	* ```ts
	* const schema = new LiteralSchema('admin')
	* schema.validate('admin') // success
	* schema.validate('user')  // fails
	* ```
	*/
	var LiteralSchema = class extends core_js_1.Schema {
		value;
		type = "literal";
		constructor(value) {
			super();
			this.value = value;
		}
		validateInContext(input, ctx) {
			if (input !== this.value) return ctx.issueInvalidValue(input, [this.value]);
			return ctx.success(this.value);
		}
	};
	exports.LiteralSchema = LiteralSchema;
	/**
	* Creates a literal schema that only accepts the exact specified value.
	*
	* Useful for discriminator fields in unions, constant values, or type narrowing.
	*
	* @param value - The exact value that must be matched
	* @returns A new {@link LiteralSchema} instance
	*
	* @example
	* ```ts
	* // String literal
	* const roleSchema = l.literal('admin')
	*
	* // Number literal
	* const versionSchema = l.literal(1)
	*
	* // Boolean literal
	* const enabledSchema = l.literal(true)
	*
	* // Null literal
	* const nullSchema = l.literal(null)
	*
	* // In discriminated unions
	* const actionSchema = l.discriminatedUnion('type', [
	*   l.object({ type: l.literal('create'), data: l.unknown() }),
	*   l.object({ type: l.literal('delete'), id: l.string() }),
	* ])
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function literal(value) {
		return new LiteralSchema(value);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/never.js
var require_never = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.never = exports.NeverSchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema that always fails validation.
	*
	* Represents an impossible type - no value can satisfy this schema.
	* Useful for exhaustiveness checking or marking impossible branches.
	*
	* @example
	* ```ts
	* const schema = new NeverSchema()
	* schema.validate(anything) // always fails
	* ```
	*/
	var NeverSchema = class extends core_js_1.Schema {
		type = "never";
		validateInContext(input, ctx) {
			return ctx.issueUnexpectedType(input, "never");
		}
	};
	exports.NeverSchema = NeverSchema;
	/**
	* Creates a never schema that always fails validation.
	*
	* Useful for exhaustiveness checking in TypeScript or marking impossible
	* code paths.
	*
	* @returns A new {@link NeverSchema} instance
	*
	* @example
	* ```ts
	* // Exhaustiveness checking
	* type Status = 'active' | 'inactive'
	*
	* function handleStatus(status: Status) {
	*   switch (status) {
	*     case 'active': return 'Active'
	*     case 'inactive': return 'Inactive'
	*     default:
	*       // TypeScript will error if we miss a case
	*       l.never().parse(status)
	*   }
	* }
	*
	* // In impossible union branches
	* const schema = l.object({
	*   type: l.literal('fixed'),
	*   dynamic: l.never(), // This property can never exist
	* })
	* ```
	*/
	exports.never = (0, memoize_js_1.memoizedOptions)(function() {
		return new NeverSchema();
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/null.js
var require_null = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.null = exports.nullSchema = exports.NullSchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema for validating null values.
	*
	* Only accepts the JavaScript `null` value. Rejects `undefined` and all
	* other values.
	*
	* @example
	* ```ts
	* const schema = new NullSchema()
	* schema.validate(null)      // success
	* schema.validate(undefined) // fails
	* ```
	*/
	var NullSchema = class extends core_js_1.Schema {
		type = "null";
		validateInContext(input, ctx) {
			if (input !== null) return ctx.issueUnexpectedType(input, "null");
			return ctx.success(null);
		}
	};
	exports.NullSchema = NullSchema;
	/**
	* Creates a null schema that only accepts the null value.
	*
	* Useful for explicitly representing null in union types or optional fields.
	*
	* @returns A new {@link NullSchema} instance
	*
	* @example
	* ```ts
	* // Explicit null
	* const nullOnlySchema = l.null()
	*
	* // Nullable string (string or null)
	* const nullableStringSchema = l.union([l.string(), l.null()])
	* ```
	*/
	exports.nullSchema = (0, memoize_js_1.memoizedOptions)(function() {
		return new NullSchema();
	});
	exports.null = exports.nullSchema;
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/util/lazy-property.js
var require_lazy_property = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lazyProperty = lazyProperty;
	/*@__NO_SIDE_EFFECTS__*/
	function lazyProperty(obj, key, value) {
		Object.defineProperty(obj, key, {
			value,
			writable: false,
			enumerable: false,
			configurable: true
		});
		return value;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/object.js
var require_object$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ObjectSchema = void 0;
	exports.object = object;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var lazy_property_js_1 = require_lazy_property();
	/**
	* Schema for validating objects with a defined shape.
	*
	* Each property in the shape is validated against its corresponding schema.
	* Properties wrapped in `optional()` are not required.
	*
	* @template TShape - The object shape type mapping property names to validators
	*
	* @example
	* ```ts
	* const schema = new ObjectSchema({
	*   name: l.string(),
	*   age: l.optional(l.integer()),
	* })
	* const result = schema.validate({ name: 'Alice' })
	* ```
	*/
	var ObjectSchema = class extends core_js_1.Schema {
		shape;
		type = "object";
		constructor(shape) {
			super();
			this.shape = shape;
		}
		get validatorsMap() {
			const map = new Map(Object.entries(this.shape));
			return (0, lazy_property_js_1.lazyProperty)(this, "validatorsMap", map);
		}
		validateInContext(input, ctx) {
			if (!(0, lex_data_1.isPlainObject)(input)) return ctx.issueUnexpectedType(input, "object");
			let copy;
			for (const [key, propDef] of this.validatorsMap) {
				const result = ctx.validateChild(input, key, propDef);
				if (!result.success) {
					if (!(key in input)) return ctx.issueRequiredKey(input, key);
					return result;
				}
				if (result.value === void 0 && !(key in input)) continue;
				if (!Object.is(result.value, input[key])) {
					if (ctx.options.mode === "validate") return ctx.issueInvalidPropertyValue(input, key, [result.value]);
					copy ??= { ...input };
					copy[key] = result.value;
				}
			}
			return ctx.success(copy ?? input);
		}
	};
	exports.ObjectSchema = ObjectSchema;
	/**
	* Creates an object schema with the specified property validators.
	*
	* Validates that the input is a plain object and each property matches
	* its corresponding schema. Properties wrapped in `optional()` are not required.
	*
	* @param properties - Object mapping property names to their validators
	* @returns A new {@link ObjectSchema} instance
	*
	* @example
	* ```ts
	* // Basic object
	* const userSchema = l.object({
	*   name: l.string(),
	*   email: l.string({ format: 'uri' }),
	* })
	*
	* // With optional properties
	* const profileSchema = l.object({
	*   displayName: l.string(),
	*   bio: l.optional(l.string({ maxLength: 256 })),
	*   avatar: l.optional(l.blob({ accept: ['image/*'] })),
	* })
	*
	* // Nested objects
	* const postSchema = l.object({
	*   text: l.string(),
	*   author: l.object({
	*     did: l.string({ format: 'did' }),
	*     handle: l.string({ format: 'handle' }),
	*   }),
	* })
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function object(properties) {
		return new ObjectSchema(properties);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/regexp.js
var require_regexp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RegexpSchema = void 0;
	exports.regexp = regexp;
	var core_js_1 = require_core();
	/**
	* Schema for validating strings against a regular expression pattern.
	*
	* Validates that the input is a string and matches the provided pattern.
	* The pattern is tested using RegExp.test().
	*
	* @template TValue - The string type (can be narrowed with branded types)
	*
	* @example
	* ```ts
	* const schema = new RegexpSchema(/^[a-z]+$/)
	* schema.validate('hello') // success
	* schema.validate('Hello') // fails - uppercase not allowed
	* ```
	*/
	var RegexpSchema = class extends core_js_1.Schema {
		pattern;
		type = "regexp";
		constructor(pattern) {
			super();
			this.pattern = pattern;
		}
		validateInContext(input, ctx) {
			if (typeof input !== "string") return ctx.issueUnexpectedType(input, "string");
			if (!this.pattern.test(input)) return ctx.issueInvalidFormat(input, this.pattern.toString());
			return ctx.success(input);
		}
	};
	exports.RegexpSchema = RegexpSchema;
	/**
	* Creates a regexp schema that validates strings against a pattern.
	*
	* Useful for custom string formats not covered by the built-in format
	* validators.
	*
	* @param pattern - Regular expression pattern to match against
	* @returns A new {@link RegexpSchema} instance
	*
	* @example
	* ```ts
	* // Simple pattern
	* const slugSchema = l.regexp(/^[a-z0-9-]+$/)
	*
	* // With anchors for exact match
	* const uuidSchema = l.regexp(
	*   /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
	* )
	*
	* // Semantic versioning
	* const semverSchema = l.regexp(/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/)
	*
	* // Use in object
	* const configSchema = l.object({
	*   name: l.regexp(/^[a-z][a-z0-9-]*$/), // kebab-case identifier
	*   version: semverSchema,
	* })
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function regexp(pattern) {
		return new RegexpSchema(pattern);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/token.js
var require_token = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TokenSchema = void 0;
	exports.token = token;
	var core_js_1 = require_core();
	/**
	* Schema for Lexicon token values.
	*
	* Tokens are named constants in Lexicon, identified by their NSID and hash.
	* They validate to their string value (e.g., 'app.bsky.feed.defs#requestLess').
	* TokenSchema instances can also be used as values themselves.
	*
	* @template TValue - The token string literal type
	*
	* @example
	* ```ts
	* const schema = new TokenSchema('app.bsky.feed.defs#requestLess')
	* schema.validate('app.bsky.feed.defs#requestLess') // success
	* ```
	*/
	var TokenSchema = class TokenSchema extends core_js_1.Schema {
		value;
		type = "token";
		constructor(value) {
			super();
			this.value = value;
		}
		validateInContext(input, ctx) {
			if (input === this.value) return ctx.success(this.value);
			if (input instanceof TokenSchema && input.value === this.value) return ctx.success(this.value);
			if (typeof input !== "string") return ctx.issueUnexpectedType(input, "token");
			return ctx.issueInvalidValue(input, [this.value]);
		}
		toJSON() {
			return this.value;
		}
		toString() {
			return this.value;
		}
	};
	exports.TokenSchema = TokenSchema;
	/**
	* Creates a token schema for Lexicon named constants.
	*
	* Tokens are used in Lexicon as named constants or enum-like values.
	* The token instance can be used both as a schema validator and as
	* the token value itself (it serializes to its string value).
	*
	* @param nsid - The NSID part of the token
	* @param hash - The hash part of the token (defaults to 'main')
	* @returns A new {@link TokenSchema} instance
	*
	* @example
	* ```ts
	* // Define tokens
	* const requestLess = l.token('app.bsky.feed.defs', 'requestLess')
	* const requestMore = l.token('app.bsky.feed.defs', 'requestMore')
	*
	* // Use as a value
	* console.log(requestLess.toString()) // 'app.bsky.feed.defs#requestLess'
	*
	* // Use in union for validation
	* const feedbackSchema = l.union([requestLess, requestMore])
	*
	* // Validate
	* feedbackSchema.parse('app.bsky.feed.defs#requestLess') // success
	*
	* // Token instances can be used as values in other schemas
	* const feedbackRequest = l.object({
	*   feedback: requestLess, // Accepts the token value
	* })
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function token(nsid, hash = "main") {
		return new TokenSchema((0, core_js_1.$type)(nsid, hash));
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/string.js
var require_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.string = exports.StringSchema = void 0;
	exports.coerceToString = coerceToString;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	var token_js_1 = require_token();
	/**
	* Schema for validating string values with optional format and length constraints.
	*
	* Supports various string formats defined in the Lexicon specification, as well as
	* length constraints measured in UTF-8 bytes or grapheme clusters.
	*
	* @template TOptions - The configuration options type
	*
	* @example
	* ```ts
	* const schema = new StringSchema({ format: 'datetime', maxLength: 64 })
	* const result = schema.validate('2024-01-15T10:30:00Z')
	* ```
	*/
	var StringSchema = class extends core_js_1.Schema {
		type = "string";
		options;
		constructor(options) {
			super();
			this.options = options;
		}
		validateInContext(input, ctx) {
			const str = coerceToString(input);
			if (str == null) return ctx.issueUnexpectedType(input, "string");
			let lazyUtf8Len;
			const minLength = this.options.minLength;
			if (minLength != null) {
				if ((lazyUtf8Len ??= (0, lex_data_1.utf8Len)(str)) < minLength) return ctx.issueTooSmall(str, "string", minLength, lazyUtf8Len);
			}
			const maxLength = this.options.maxLength;
			if (maxLength != null) {
				if (str.length * 3 <= maxLength) {} else if ((lazyUtf8Len ??= (0, lex_data_1.utf8Len)(str)) > maxLength) return ctx.issueTooBig(str, "string", maxLength, lazyUtf8Len);
			}
			let lazyGraphLen;
			const minGraphemes = this.options.minGraphemes;
			if (minGraphemes != null) {
				if (str.length < minGraphemes) return ctx.issueTooSmall(str, "grapheme", minGraphemes, str.length);
				else if ((lazyGraphLen ??= (0, lex_data_1.graphemeLen)(str)) < minGraphemes) return ctx.issueTooSmall(str, "grapheme", minGraphemes, lazyGraphLen);
			}
			const maxGraphemes = this.options.maxGraphemes;
			if (maxGraphemes != null) {
				if ((lazyGraphLen ??= (0, lex_data_1.graphemeLen)(str)) > maxGraphemes) return ctx.issueTooBig(str, "grapheme", maxGraphemes, lazyGraphLen);
			}
			const format = this.options.format;
			if (format != null && !(0, core_js_1.isStringFormat)(str, format)) return ctx.issueInvalidFormat(str, format);
			return ctx.success(str);
		}
	};
	exports.StringSchema = StringSchema;
	function coerceToString(input) {
		switch (typeof input) {
			case "string": return input;
			case "object": {
				if (input == null) return null;
				if (input instanceof token_js_1.TokenSchema) return input.toString();
				if (input instanceof Date) {
					if (Number.isNaN(input.getTime())) return null;
					return input.toISOString();
				}
				if (input instanceof URL) return input.toString();
				const cid = (0, lex_data_1.ifCid)(input);
				if (cid) return cid.toString();
				if (input instanceof String) return input.valueOf();
			}
			default: return null;
		}
	}
	function _string(options = {}) {
		return new StringSchema(options);
	}
	/**
	* Creates a string schema with optional format and length constraints.
	*
	* Strings can be validated against various formats (datetime, uri, did, handle, etc.)
	* and constrained by length in UTF-8 bytes or grapheme clusters.
	*
	* @param options - Optional configuration for format and length constraints
	* @returns A new {@link StringSchema} instance
	*
	* @example
	* ```ts
	* // Basic string
	* const nameSchema = l.string()
	*
	* // With format validation
	* const dateSchema = l.string({ format: 'datetime' })
	*
	* // With length constraints (UTF-8 bytes)
	* const bioSchema = l.string({ maxLength: 256 })
	*
	* // With grapheme constraints (user-perceived characters)
	* const displayNameSchema = l.string({ maxGraphemes: 64 })
	*
	* // Combining constraints
	* const handleSchema = l.string({ format: 'handle', minLength: 3, maxLength: 253 })
	* ```
	*/
	exports.string = (0, memoize_js_1.memoizedOptions)(_string);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/unknown.js
var require_unknown = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unknown = exports.UnknownSchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema that accepts any value without validation.
	*
	* Passes through any input unchanged. Use sparingly as it bypasses
	* type safety. Useful for dynamic data or when the schema is not
	* known at compile time.
	*
	* @example
	* ```ts
	* const schema = new UnknownSchema()
	* schema.validate(anything) // always succeeds
	* ```
	*/
	var UnknownSchema = class extends core_js_1.Schema {
		type = "unknown";
		validateInContext(input, ctx) {
			return ctx.success(input);
		}
	};
	exports.UnknownSchema = UnknownSchema;
	/**
	* Creates an unknown schema that accepts any value.
	*
	* The value passes through without any validation or transformation.
	* Use this when you need to accept arbitrary data.
	*
	* @returns A new {@link UnknownSchema} instance
	*
	* @example
	* ```ts
	* // Accept any value
	* const anyDataSchema = l.unknown()
	*
	* // In an object with a dynamic field
	* const flexibleSchema = l.object({
	*   type: l.string(),
	*   data: l.unknown(),
	* })
	* ```
	*/
	exports.unknown = (0, memoize_js_1.memoizedOptions)(function() {
		return new UnknownSchema();
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/custom.js
var require_custom = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CustomSchema = void 0;
	exports.custom = custom;
	var core_js_1 = require_core();
	/**
	* Schema with a custom validation function.
	*
	* Allows defining completely custom validation logic using a type guard
	* assertion function. The function receives the input and validation context,
	* and must return whether the input is valid.
	*
	* @template TValue - The validated output type
	*
	* @example
	* ```ts
	* const schema = new CustomSchema(
	*   (input): input is Date => input instanceof Date,
	*   'Expected a Date instance'
	* )
	* ```
	*/
	var CustomSchema = class extends core_js_1.Schema {
		assertion;
		message;
		path;
		type = "custom";
		constructor(assertion, message, path) {
			super();
			this.assertion = assertion;
			this.message = message;
			this.path = path;
		}
		validateInContext(input, ctx) {
			if (!this.assertion.call(null, input, ctx)) {
				const path = ctx.concatPath(this.path);
				return ctx.issue(new core_js_1.IssueCustom(path, input, this.message));
			}
			return ctx.success(input);
		}
	};
	exports.CustomSchema = CustomSchema;
	/**
	* Creates a custom schema with a user-defined validation function.
	*
	* Use this when the built-in schemas don't cover your validation needs.
	* The assertion function must be a type guard that narrows the input type.
	*
	* @param assertion - Type guard function that validates the input
	* @param message - Error message when validation fails
	* @param path - Optional path to associate with validation errors
	* @returns A new {@link CustomSchema} instance
	*
	* @example
	* ```ts
	* // Validate Date instances
	* const dateSchema = l.custom(
	*   (input): input is Date => input instanceof Date && !isNaN(input.getTime()),
	*   'Expected a valid Date'
	* )
	*
	* // Validate specific object shape
	* const pointSchema = l.custom(
	*   (input): input is { x: number; y: number } =>
	*     typeof input === 'object' &&
	*     input !== null &&
	*     typeof (input as any).x === 'number' &&
	*     typeof (input as any).y === 'number',
	*   'Expected a point with x and y coordinates'
	* )
	*
	* // With custom path
	* const validConfig = l.custom(
	*   (input): input is Config => validateConfig(input),
	*   'Invalid configuration',
	*   ['config']
	* )
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function custom(assertion, message, path) {
		return new CustomSchema(assertion, message, path);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/discriminated-union.js
var require_discriminated_union = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DiscriminatedUnionSchema = void 0;
	exports.discriminatedUnion = discriminatedUnion;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var enum_js_1 = require_enum();
	var literal_js_1 = require_literal();
	/**
	* Schema for validating discriminated unions of objects.
	*
	* More efficient than regular union schemas when discriminating on a known
	* property. Looks up the correct variant schema directly based on the
	* discriminator value instead of trying each variant in sequence.
	*
	* @note There is no discriminated union in Lexicon schemas. This is a custom
	* extension to allow optimized validation of union of objects when using the
	* lex library programmatically (i.e. not code generated from a lexicon schema).
	*
	* @template TDiscriminator - The discriminator property name
	* @template TVariants - Tuple type of the variant schemas
	*
	* @example
	* ```ts
	* const schema = new DiscriminatedUnionSchema('type', [
	*   l.object({ type: l.literal('text'), content: l.string() }),
	*   l.object({ type: l.literal('image'), url: l.string() }),
	* ])
	* ```
	*/
	var DiscriminatedUnionSchema = class extends core_js_1.Schema {
		discriminator;
		variants;
		type = "discriminatedUnion";
		variantsMap;
		constructor(discriminator, variants) {
			super();
			this.discriminator = discriminator;
			this.variants = variants;
			this.variantsMap = buildVariantsMap(discriminator, variants);
		}
		validateInContext(input, ctx) {
			if (!(0, lex_data_1.isPlainObject)(input)) return ctx.issueUnexpectedType(input, "object");
			const { discriminator } = this;
			if (!Object.hasOwn(input, discriminator)) return ctx.issueRequiredKey(input, discriminator);
			const discriminatorValue = input[discriminator];
			const variant = this.variantsMap.get(discriminatorValue);
			if (variant) return ctx.validate(input, variant);
			return ctx.issueInvalidPropertyValue(input, discriminator, [...this.variantsMap.keys()]);
		}
	};
	exports.DiscriminatedUnionSchema = DiscriminatedUnionSchema;
	function buildVariantsMap(discriminator, variants) {
		const variantsMap = /* @__PURE__ */ new Map();
		for (const variant of variants) {
			const schema = variant.shape[discriminator];
			if (schema instanceof literal_js_1.LiteralSchema) {
				if (variantsMap.has(schema.value)) throw new TypeError(`Overlapping discriminator value: ${schema.value}`);
				variantsMap.set(schema.value, variant);
			} else if (schema instanceof enum_js_1.EnumSchema) for (const val of schema.values) {
				if (variantsMap.has(val)) throw new TypeError(`Overlapping discriminator value: ${val}`);
				variantsMap.set(val, variant);
			}
			else throw new TypeError(`Discriminator schema must be a LiteralSchema or EnumSchema`);
		}
		return variantsMap;
	}
	/**
	* Creates a discriminated union schema for efficient object type switching.
	*
	* Unlike regular `union()`, this schema uses a discriminator property to
	* directly look up the correct variant, providing O(1) validation instead
	* of trying each variant sequentially.
	*
	* @param discriminator - Property name to discriminate on
	* @param variants - Non-empty array of object schemas with the discriminator property
	* @returns A new {@link DiscriminatedUnionSchema} instance
	*
	* @example
	* ```ts
	* // Message types discriminated by 'kind'
	* const messageSchema = l.discriminatedUnion('kind', [
	*   l.object({ kind: l.literal('text'), text: l.string() }),
	*   l.object({ kind: l.literal('image'), url: l.string(), alt: l.optional(l.string()) }),
	*   l.object({ kind: l.literal('video'), url: l.string(), duration: l.integer() }),
	* ])
	*
	* // Using enums for multiple values mapping to same variant
	* const statusSchema = l.discriminatedUnion('status', [
	*   l.object({ status: l.enum(['pending', 'processing']), startedAt: l.string() }),
	*   l.object({ status: l.literal('completed'), completedAt: l.string() }),
	*   l.object({ status: l.literal('failed'), error: l.string() }),
	* ])
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function discriminatedUnion(discriminator, variants) {
		return new DiscriminatedUnionSchema(discriminator, variants);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/intersection.js
var require_intersection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.IntersectionSchema = void 0;
	exports.intersection = intersection;
	var core_js_1 = require_core();
	/**
	* Schema for combining an object schema with a dictionary schema.
	*
	* Validates that the input matches both the fixed object shape and allows
	* additional properties that match the dictionary schema. Properties defined
	* in the object schema are validated by the object, and remaining properties
	* are validated by the dictionary.
	*
	* @template Left - The ObjectSchema type for fixed properties
	* @template Right - The DictSchema type for additional properties
	*
	* @example
	* ```ts
	* const schema = new IntersectionSchema(
	*   l.object({ name: l.string() }),
	*   l.dict(l.string(), l.integer())
	* )
	* // Validates: { name: 'test', score: 100, count: 5 }
	* ```
	*/
	var IntersectionSchema = class extends core_js_1.Schema {
		left;
		right;
		type = "intersection";
		constructor(left, right) {
			super();
			this.left = left;
			this.right = right;
		}
		validateInContext(input, ctx) {
			const leftResult = ctx.validate(input, this.left);
			if (!leftResult.success) return leftResult;
			return this.right.validateInContext(leftResult.value, ctx, { ignoredKeys: this.left.validatorsMap });
		}
	};
	exports.IntersectionSchema = IntersectionSchema;
	/**
	* Creates an intersection schema combining fixed object properties with dynamic dictionary properties.
	*
	* Useful for objects that have a known set of properties plus additional
	* arbitrary properties that follow a pattern.
	*
	* @param left - Object schema defining the fixed, known properties
	* @param right - Dictionary schema for validating additional properties
	* @returns A new {@link IntersectionSchema} instance
	*
	* @example
	* ```ts
	* // Object with fixed and dynamic properties
	* const configSchema = l.intersection(
	*   l.object({
	*     version: l.integer(),
	*     name: l.string(),
	*   }),
	*   l.dict(l.string(), l.string()) // Additional string properties
	* )
	*
	* configSchema.parse({
	*   version: 1,
	*   name: 'my-config',
	*   customField: 'value',
	*   anotherField: 'another',
	* })
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function intersection(left, right) {
		return new IntersectionSchema(left, right);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/nullable.js
var require_nullable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.nullable = exports.NullableSchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema wrapper that allows null values in addition to the wrapped schema.
	*
	* When the input is `null`, validation succeeds immediately. Otherwise,
	* the input is validated against the wrapped schema.
	*
	* @template TValidator - The wrapped validator type
	*
	* @example
	* ```ts
	* const schema = new NullableSchema(l.string())
	* schema.validate(null)    // success
	* schema.validate('hello') // success
	* ```
	*/
	var NullableSchema = class extends core_js_1.Schema {
		validator;
		type = "nullable";
		constructor(validator) {
			super();
			this.validator = validator;
		}
		validateInContext(input, ctx) {
			if (input === null) return ctx.success(null);
			return ctx.validate(input, this.validator);
		}
	};
	exports.NullableSchema = NullableSchema;
	/**
	* Creates a nullable schema that accepts null in addition to the wrapped type.
	*
	* Wraps another schema to allow null values. Different from `optional()` which
	* allows undefined.
	*
	* @param validator - The validator to make nullable
	* @returns A new {@link NullableSchema} instance
	*
	* @example
	* ```ts
	* // Nullable string
	* const nullableString = l.nullable(l.string())
	* nullableString.parse(null)    // null
	* nullableString.parse('hello') // 'hello'
	*
	* // In an object
	* const userSchema = l.object({
	*   name: l.string(),
	*   deletedAt: l.nullable(l.string({ format: 'datetime' })),
	* })
	*
	* // Combine with optional for null or undefined
	* const maybeString = l.optional(l.nullable(l.string()))
	* ```
	*/
	exports.nullable = (0, memoize_js_1.memoizedTransformer)(function(validator) {
		return new NullableSchema(validator);
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/optional.js
var require_optional = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.optional = exports.OptionalSchema = void 0;
	var core_js_1 = require_core();
	var memoize_js_1 = require_memoize();
	/**
	* Schema wrapper that makes a value optional (allows undefined).
	*
	* When the input is `undefined`, validation succeeds without running the
	* inner validator. If the inner validator has a default value (via `withDefault`),
	* that default will be applied in parse mode.
	*
	* @template TValidator - The wrapped validator type
	*
	* @example
	* ```ts
	* const schema = new OptionalSchema(l.string())
	* schema.validate(undefined) // success
	* schema.validate('hello')   // success
	* ```
	*/
	var OptionalSchema = class extends core_js_1.Schema {
		validator;
		type = "optional";
		constructor(validator) {
			super();
			this.validator = validator;
		}
		validateInContext(input, ctx) {
			if (input === void 0 && ctx.options.mode === "validate") return ctx.success(input);
			const result = ctx.validate(input, this.validator);
			if (result.success) return result;
			if (input === void 0) return ctx.success(input);
			return result;
		}
	};
	exports.OptionalSchema = OptionalSchema;
	/**
	* Creates an optional schema that allows undefined values.
	*
	* Wraps another schema to make it optional. When used in an object schema,
	* properties with optional schemas are not required.
	*
	* @param validator - The validator to make optional
	* @returns A new {@link OptionalSchema} instance
	*
	* @example
	* ```ts
	* // Optional string
	* const optionalBio = l.optional(l.string())
	*
	* // In an object - property is not required
	* const userSchema = l.object({
	*   name: l.string(),
	*   bio: l.optional(l.string()),
	* })
	* userSchema.parse({ name: 'Alice' }) // Valid, bio is undefined
	*
	* // With default value
	* const countSchema = l.optional(l.withDefault(l.integer(), 0))
	* countSchema.parse(undefined) // Returns 0
	* ```
	*/
	exports.optional = (0, memoize_js_1.memoizedTransformer)(function(validator) {
		return new OptionalSchema(validator);
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/ref.js
var require_ref = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RefSchema = void 0;
	exports.ref = ref;
	var core_js_1 = require_core();
	/**
	* Schema for creating references to other schemas with lazy resolution.
	*
	* Useful for handling circular references or breaking module dependency cycles.
	* The referenced schema is resolved lazily when first needed for validation.
	*
	* @template TValidator - The referenced validator type
	*
	* @example
	* ```ts
	* // Self-referential schema for tree structure
	* const nodeSchema = l.object({
	*   value: l.string(),
	*   children: l.array(l.ref(() => nodeSchema)),
	* })
	* ```
	*/
	var RefSchema = class extends core_js_1.Schema {
		type = "ref";
		#getter;
		constructor(getter) {
			super();
			this.#getter = getter;
		}
		get validator() {
			return this.#getter.call(null);
		}
		unwrap() {
			return this.validator;
		}
		validateInContext(input, ctx) {
			return ctx.validate(input, this.validator);
		}
	};
	exports.RefSchema = RefSchema;
	function ref(get) {
		return new RefSchema(get);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/refine.js
var require_refine = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.refine = refine;
	var core_js_1 = require_core();
	/*@__NO_SIDE_EFFECTS__*/
	function refine(schema, refinement) {
		return Object.create(schema, { validateInContext: {
			value: validateInContextUnbound.bind({
				schema,
				refinement
			}),
			enumerable: false,
			writable: false,
			configurable: true
		} });
	}
	/*@__NO_SIDE_EFFECTS__*/
	function validateInContextUnbound(input, ctx) {
		const result = ctx.validate(input, this.schema);
		if (!result.success) return result;
		if (!this.refinement.check.call(null, result.value, ctx)) {
			const path = ctx.concatPath(this.refinement.path);
			return ctx.issue(new core_js_1.IssueCustom(path, input, this.refinement.message));
		}
		return result;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/union.js
var require_union = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UnionSchema = void 0;
	exports.union = union;
	var core_js_1 = require_core();
	/**
	* Schema for validating values that match one of several possible schemas.
	*
	* Tries each validator in order until one succeeds. If all validators fail,
	* returns a combined error from all attempts.
	*
	* @template TValidators - Tuple type of the validators in the union
	*
	* @example
	* ```ts
	* const schema = new UnionSchema([l.string(), l.integer()])
	* schema.validate('hello') // success
	* schema.validate(42)      // success
	* schema.validate(true)    // fails
	* ```
	*/
	var UnionSchema = class extends core_js_1.Schema {
		validators;
		type = "union";
		constructor(validators) {
			super();
			this.validators = validators;
		}
		validateInContext(input, ctx) {
			const failures = [];
			for (const validator of this.validators) {
				const result = ctx.validate(input, validator);
				if (result.success) return result;
				failures.push(result);
			}
			return ctx.failure(core_js_1.ValidationError.fromFailures(failures));
		}
	};
	exports.UnionSchema = UnionSchema;
	/**
	* Creates a union schema that accepts values matching any of the provided schemas.
	*
	* Validators are tried in order. Use `discriminatedUnion()` for better
	* performance when discriminating on a known property.
	*
	* @param validators - Non-empty array of validators to try
	* @returns A new {@link UnionSchema} instance
	*
	* @example
	* ```ts
	* // String or number
	* const stringOrNumber = l.union([l.string(), l.integer()])
	*
	* // Nullable value
	* const nullableString = l.union([l.string(), l.null()])
	*
	* // Multiple object types
	* const mediaSchema = l.union([
	*   l.object({ type: l.literal('image'), url: l.string() }),
	*   l.object({ type: l.literal('video'), url: l.string(), duration: l.integer() }),
	* ])
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function union(validators) {
		return new UnionSchema(validators);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/with-default.js
var require_with_default = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WithDefaultSchema = void 0;
	exports.withDefault = withDefault;
	var core_js_1 = require_core();
	/**
	* Schema wrapper that provides a default value when the input is undefined.
	*
	* In parse mode, when the input is `undefined`, the default value is used
	* instead. In validate mode, undefined values pass through unchanged (the
	* default is not applied).
	*
	* @template TValidator - The wrapped validator type
	*
	* @example
	* ```ts
	* const schema = new WithDefaultSchema(l.integer(), 0)
	* schema.parse(undefined) // 0
	* schema.parse(42)        // 42
	* ```
	*/
	var WithDefaultSchema = class extends core_js_1.Schema {
		validator;
		defaultValue;
		type = "withDefault";
		constructor(validator, defaultValue) {
			super();
			this.validator = validator;
			this.defaultValue = defaultValue;
		}
		validateInContext(input, ctx) {
			if (input === void 0 && ctx.options.mode !== "validate") return ctx.validate(this.defaultValue, this.validator);
			return ctx.validate(input, this.validator);
		}
	};
	exports.WithDefaultSchema = WithDefaultSchema;
	/**
	* Creates a schema that applies a default value when the input is undefined.
	*
	* Commonly used with `optional()` to provide fallback values for missing
	* properties. The default value is validated against the schema.
	*
	* @param validator - The validator for the value
	* @param defaultValue - The default value to use when input is undefined
	* @returns A new {@link WithDefaultSchema} instance
	*
	* @example
	* ```ts
	* // Integer with default
	* const countSchema = l.withDefault(l.integer(), 0)
	* countSchema.parse(undefined) // 0
	* countSchema.parse(5)         // 5
	*
	* // Commonly combined with optional in objects
	* const settingsSchema = l.object({
	*   theme: l.optional(l.withDefault(l.string(), 'light')),
	*   pageSize: l.optional(l.withDefault(l.integer(), 25)),
	* })
	* settingsSchema.parse({}) // { theme: 'light', pageSize: 25 }
	*
	* // Boolean with default
	* const enabledSchema = l.withDefault(l.boolean(), false)
	* ```
	*/
	function withDefault(validator, defaultValue) {
		return new WithDefaultSchema(validator, defaultValue);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/params.js
var require_params = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.params = exports.ParamsSchema = exports.paramsSchema = exports.paramSchema = void 0;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var lazy_property_js_1 = require_lazy_property();
	var memoize_js_1 = require_memoize();
	var array_js_1 = require_array();
	var boolean_js_1 = require_boolean();
	var dict_js_1 = require_dict();
	var enum_js_1 = require_enum();
	var integer_js_1 = require_integer();
	var literal_js_1 = require_literal();
	var optional_js_1 = require_optional();
	var string_js_1 = require_string();
	var union_js_1 = require_union();
	var with_default_js_1 = require_with_default();
	var paramScalarSchema = (0, union_js_1.union)([
		(0, boolean_js_1.boolean)(),
		(0, integer_js_1.integer)(),
		(0, string_js_1.string)()
	]);
	/**
	* Schema for validating individual parameter values.
	*/
	exports.paramSchema = (0, union_js_1.union)([
		paramScalarSchema,
		(0, array_js_1.array)((0, boolean_js_1.boolean)()),
		(0, array_js_1.array)((0, integer_js_1.integer)()),
		(0, array_js_1.array)((0, string_js_1.string)())
	]);
	/**
	* Schema for validating arbitrary params objects.
	*/
	exports.paramsSchema = (0, dict_js_1.dict)((0, string_js_1.string)(), (0, optional_js_1.optional)(exports.paramSchema));
	/**
	* Schema for validating URL query parameters in Lexicon endpoints.
	*
	* Params are the query string parameters passed to queries, procedures,
	* and subscriptions. Values must be scalars (boolean, integer, string)
	* or arrays of scalars, as they need to be serializable to URL format.
	*
	* Provides methods for converting to/from URLSearchParams.
	*
	* @template TShape - The params shape type mapping names to validators
	*
	* @example
	* ```ts
	* const schema = new ParamsSchema({
	*   limit: l.optional(l.integer({ minimum: 1, maximum: 100 })),
	*   cursor: l.optional(l.string()),
	* })
	* ```
	*/
	var ParamsSchema = class extends core_js_1.Schema {
		shape;
		type = "params";
		constructor(shape) {
			super();
			this.shape = shape;
		}
		get shapeValidators() {
			const map = new Map(Object.entries(this.shape));
			return (0, lazy_property_js_1.lazyProperty)(this, "shapeValidators", map);
		}
		validateInContext(input, ctx) {
			if (!(0, lex_data_1.isPlainObject)(input)) return ctx.issueUnexpectedType(input, "object");
			let copy;
			for (const key in input) {
				if (this.shapeValidators.has(key)) continue;
				const result = ctx.validateChild(input, key, exports.paramSchema);
				if (!result.success) return result;
				if (result.value !== input[key]) {
					if (ctx.options.mode === "validate") return ctx.issueInvalidPropertyValue(input, key, [result.value]);
					copy ??= { ...input };
					copy[key] = result.value;
				}
			}
			for (const [key, propDef] of this.shapeValidators) {
				const result = ctx.validateChild(input, key, propDef);
				if (!result.success) {
					if (!(key in input)) return ctx.issueRequiredKey(input, key);
					return result;
				}
				if (result.value === void 0 && !(key in input)) continue;
				if (!Object.is(result.value, input[key])) {
					if (ctx.options.mode === "validate") return ctx.issueInvalidPropertyValue(input, key, [result.value]);
					copy ??= { ...input };
					copy[key] = result.value;
				}
			}
			return ctx.success(copy ?? input);
		}
		fromURLSearchParams(input, options) {
			const params = {};
			const iterable = typeof input === "string" ? new URLSearchParams(input) : input;
			const entries = iterable instanceof URLSearchParams ? iterable.entries() : iterable;
			for (const [name, value] of entries) {
				const validator = this.shapeValidators.get(name);
				const innerValidator = validator ? unwrapSchema(validator) : void 0;
				const expectsArray = innerValidator instanceof array_js_1.ArraySchema;
				const coerced = coerceParam(name, value, expectsArray ? unwrapSchema(innerValidator.validator) : innerValidator, options);
				const currentParam = params[name];
				if (currentParam === void 0) params[name] = expectsArray ? [coerced] : coerced;
				else if (Array.isArray(currentParam)) currentParam.push(coerced);
				else params[name] = [currentParam, coerced];
			}
			return this.parse(params, options);
		}
		toURLSearchParams(input) {
			const urlSearchParams = new URLSearchParams();
			const params = this.parse(input);
			for (const [key, value] of Object.entries(params)) if (Array.isArray(value)) for (const v of value) urlSearchParams.append(key, String(v));
			else if (value !== void 0) urlSearchParams.append(key, String(value));
			return urlSearchParams;
		}
	};
	exports.ParamsSchema = ParamsSchema;
	function coerceParam(name, param, schema, options) {
		let issue;
		if (!schema) return param;
		else if (schema instanceof string_js_1.StringSchema) return param;
		else if (schema instanceof integer_js_1.IntegerSchema) {
			if (/^-?\d+$/.test(param)) return Number(param);
			issue = new core_js_1.IssueInvalidType(paramPath(name, options), param, ["integer"]);
		} else if (schema instanceof boolean_js_1.BooleanSchema) {
			if (param === "true") return true;
			if (param === "false") return false;
			issue = new core_js_1.IssueInvalidType(paramPath(name, options), param, ["boolean"]);
		} else if (schema instanceof literal_js_1.LiteralSchema) {
			const { value } = schema;
			if (String(value) === param) return value;
			issue = new core_js_1.IssueInvalidValue(paramPath(name, options), param, [value]);
		} else if (schema instanceof enum_js_1.EnumSchema) {
			const { values } = schema;
			for (const value of values) if (String(value) === param) return value;
			issue = new core_js_1.IssueInvalidValue(paramPath(name, options), param, values);
		} else throw new Error(`Unsupported schema type for param coercion: ${schema}`);
		throw new core_js_1.ValidationError([issue]);
	}
	function paramPath(key, options) {
		return options?.path ? [...options.path, key] : [key];
	}
	/**
	* Creates a params schema for URL query parameters.
	*
	* Params schemas validate query string parameters for Lexicon endpoints.
	* Values must be boolean, integer, string, or arrays of those types.
	*
	* @param properties - Object mapping parameter names to their validators
	* @returns A new {@link ParamsSchema} instance
	*
	* @example
	* ```ts
	* // Simple pagination params
	* const paginationParams = l.params({
	*   limit: l.optional(l.withDefault(l.integer({ minimum: 1, maximum: 100 }), 50)),
	*   cursor: l.optional(l.string()),
	* })
	*
	* // Required parameter
	* const actorParams = l.params({
	*   actor: l.string({ format: 'at-identifier' }),
	* })
	*
	* // Array parameter (multiple values)
	* const filterParams = l.params({
	*   tags: l.optional(l.array(l.string())),
	* })
	*
	* // Convert from URL
	* const urlParams = new URLSearchParams('limit=25&cursor=abc')
	* const validated = paginationParams.fromURLSearchParams(urlParams)
	*
	* // Convert to URL
	* const searchParams = paginationParams.toURLSearchParams({ limit: 25 })
	* ```
	*/
	exports.params = (0, memoize_js_1.memoizedOptions)(function params(properties = {}) {
		return new ParamsSchema(properties);
	});
	function unwrapSchema(schema) {
		while (schema instanceof optional_js_1.OptionalSchema || schema instanceof with_default_js_1.WithDefaultSchema) return unwrapSchema(schema.validator);
		return schema;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/payload.js
var require_payload = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Payload = void 0;
	exports.payload = payload;
	exports.jsonPayload = jsonPayload;
	var object_js_1 = require_object$1();
	/**
	* Represents a payload definition for Lexicon endpoints.
	*
	* Payloads define the body format for HTTP requests and responses.
	* They consist of an encoding (MIME type) and an optional schema
	* for validating the body content.
	*
	* @template TEncoding - The MIME type string, or undefined for no body
	* @template TPayload - The schema type for body validation
	*
	* @example
	* ```ts
	* const jsonPayload = new Payload('application/json', l.object({ data: l.string() }))
	* const binaryPayload = new Payload('image/*', undefined)
	* const noPayload = new Payload(undefined, undefined)
	* ```
	*/
	var Payload = class {
		encoding;
		schema;
		constructor(encoding, schema) {
			this.encoding = encoding;
			this.schema = schema;
			if (encoding === void 0 && schema !== void 0) throw new TypeError("schema cannot be defined when encoding is undefined");
		}
		/**
		* Checks whether the given content-type matches the expected payload schema's
		* encoding.
		*/
		matchesEncoding(contentType) {
			const { encoding } = this;
			if (encoding === void 0) return contentType == null;
			else if (contentType == null) return false;
			if (encoding === "*/*") return true;
			const mime = contentType?.split(";", 1)[0].trim();
			if (encoding.endsWith("/*")) return mime.startsWith(encoding.slice(0, -1));
			if (encoding.includes("*")) return false;
			return encoding === mime;
		}
	};
	exports.Payload = Payload;
	/**
	* Creates a payload definition for Lexicon endpoint bodies.
	*
	* Defines the expected MIME type and optional validation schema for
	* request or response bodies.
	*
	* @param encoding - MIME type string (e.g., 'application/json', 'image/*'), or undefined for no body
	* @param validator - Optional schema for validating the body content. Must be undefined if encoding is undefined.
	* @returns A new {@link Payload} instance
	*
	* @example
	* ```ts
	* // JSON payload with schema
	* const output = l.payload('application/json', l.object({
	*   posts: l.array(postSchema),
	*   cursor: l.optional(l.string()),
	* }))
	*
	* // Binary payload (no schema validation)
	* const blobInput = l.payload('*\/*', undefined)
	*
	* // Image payload with wildcard
	* const imageInput = l.payload('image/*', undefined)
	*
	* // No payload (for endpoints without body)
	* const noBody = l.payload()
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function payload(encoding = void 0, validator = void 0) {
		return new Payload(encoding, validator);
	}
	/**
	* Creates a JSON payload with an object schema.
	*
	* Convenience function for the common case of JSON request/response bodies.
	* Equivalent to `l.payload('application/json', l.object(properties))`.
	*
	* @param properties - Object mapping property names to validators
	* @returns A new {@link Payload} instance with 'application/json' encoding
	*
	* @example
	* ```ts
	* // Query output
	* const profileOutput = l.jsonPayload({
	*   did: l.string({ format: 'did' }),
	*   handle: l.string({ format: 'handle' }),
	*   displayName: l.optional(l.string()),
	* })
	*
	* // Procedure input
	* const createPostInput = l.jsonPayload({
	*   text: l.string({ maxGraphemes: 300 }),
	*   createdAt: l.string({ format: 'datetime' }),
	* })
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function jsonPayload(properties) {
		return /* @__PURE__ */ payload("application/json", (0, object_js_1.object)(properties));
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/permission-set.js
var require_permission_set = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PermissionSet = void 0;
	exports.permissionSet = permissionSet;
	/**
	* Represents a collection of related permissions in AT Protocol.
	*
	* Permission sets group permissions together with metadata for OAuth
	* authorization flows. They are identified by an NSID.
	*
	* @template TNsid - The NSID identifying this permission set
	* @template TPermissions - Tuple type of the included permissions
	*
	* @example
	* ```ts
	* const feedAccess = new PermissionSet(
	*   'app.bsky.feed.access',
	*   [readPermission, writePermission],
	*   { title: 'Feed Access', detail: 'Read and write to your feed' }
	* )
	* ```
	*/
	var PermissionSet = class {
		nsid;
		permissions;
		options;
		constructor(nsid, permissions, options = {}) {
			this.nsid = nsid;
			this.permissions = permissions;
			this.options = options;
		}
	};
	exports.PermissionSet = PermissionSet;
	/**
	* Creates a permission set grouping related permissions.
	*
	* Permission sets define OAuth scopes that applications can request.
	* They include human-readable metadata for authorization UIs.
	*
	* @param nsid - The NSID identifying this permission set
	* @param permissions - Array of permissions included in this set
	* @param options - Optional metadata (title, detail, localization)
	* @returns A new {@link PermissionSet} instance
	*
	* @example
	* ```ts
	* // Define individual permissions
	* const readPosts = l.permission('read', { collection: 'app.bsky.feed.post' })
	* const writePosts = l.permission('write', { collection: 'app.bsky.feed.post' })
	*
	* // Group into a permission set
	* const postManagement = l.permissionSet(
	*   'app.bsky.feed.postManagement',
	*   [readPosts, writePosts],
	*   {
	*     title: 'Post Management',
	*     detail: 'View and create posts on your behalf',
	*     'title:lang': {
	*       'es': 'Gestion de publicaciones',
	*       'fr': 'Gestion des publications',
	*     },
	*   }
	* )
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function permissionSet(nsid, permissions, options) {
		return new PermissionSet(nsid, permissions, options);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/permission.js
var require_permission = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Permission = void 0;
	exports.permission = permission;
	/**
	* Represents a single permission in an AT Protocol permission set.
	*
	* Permissions define access rights to specific resources with optional
	* parameters for fine-grained control.
	*
	* @template TResource - The resource identifier string type
	* @template TOptions - The options type (must be valid Params)
	*
	* @example
	* ```ts
	* const readPermission = new Permission('read', { collection: 'app.bsky.feed.post' })
	* ```
	*/
	var Permission = class {
		resource;
		options;
		constructor(resource, options) {
			this.resource = resource;
			this.options = options;
		}
	};
	exports.Permission = Permission;
	/**
	* Creates a permission definition for AT Protocol authorization.
	*
	* Permissions specify what resources an application can access.
	* Used in permission sets to define OAuth scopes.
	*
	* @param resource - The resource identifier (e.g., 'read', 'write', 'admin')
	* @param options - Optional parameters for the permission
	* @returns A new {@link Permission} instance
	*
	* @example
	* ```ts
	* // Simple permission
	* const readPermission = l.permission('read')
	*
	* // Permission with options
	* const writePostsPermission = l.permission('write', {
	*   collection: 'app.bsky.feed.post',
	* })
	*
	* // Multiple permissions with different scopes
	* const readProfile = l.permission('read', { collection: 'app.bsky.actor.profile' })
	* const readFeed = l.permission('read', { collection: 'app.bsky.feed.*' })
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function permission(resource, options = {}) {
		return new Permission(resource, options);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/procedure.js
var require_procedure = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Procedure = void 0;
	exports.procedure = procedure;
	/**
	* Represents a Lexicon procedure (HTTP POST) endpoint definition.
	*
	* Procedures are operations that may modify state on the server.
	* They have parameters, an input payload (request body), an output
	* payload (response body), and optional error types.
	*
	* @template TNsid - The NSID identifying this procedure
	* @template TParameters - The parameters schema type
	* @template TInputPayload - The request body payload type
	* @template TOutputPayload - The response body payload type
	* @template TErrors - Array of error type strings, or undefined
	*
	* @example
	* ```ts
	* const createPost = new Procedure(
	*   'app.bsky.feed.post',
	*   l.params({}),
	*   l.jsonPayload({ text: l.string() }),
	*   l.jsonPayload({ uri: l.string(), cid: l.string() }),
	*   ['InvalidRecord']
	* )
	* ```
	*/
	var Procedure = class {
		nsid;
		parameters;
		input;
		output;
		errors;
		type = "procedure";
		constructor(nsid, parameters, input, output, errors) {
			this.nsid = nsid;
			this.parameters = parameters;
			this.input = input;
			this.output = output;
			this.errors = errors;
		}
	};
	exports.Procedure = Procedure;
	/**
	* Creates a procedure definition for a Lexicon POST endpoint.
	*
	* Procedures can modify server state. They accept both URL parameters
	* and a request body (input payload).
	*
	* @param nsid - The NSID identifying this procedure endpoint
	* @param parameters - Schema for URL query parameters
	* @param input - Schema for request body payload
	* @param output - Schema for response body payload
	* @param errors - Optional array of error type strings
	* @returns A new {@link Procedure} instance
	*
	* @example
	* ```ts
	* // Create record procedure
	* const createRecord = l.procedure(
	*   'com.atproto.repo.createRecord',
	*   l.params({}),
	*   l.jsonPayload({
	*     repo: l.string({ format: 'at-identifier' }),
	*     collection: l.string({ format: 'nsid' }),
	*     record: l.unknown(),
	*   }),
	*   l.jsonPayload({
	*     uri: l.string({ format: 'at-uri' }),
	*     cid: l.string({ format: 'cid' }),
	*   }),
	*   ['InvalidRecord', 'RepoNotFound'],
	* )
	*
	* // Procedure with binary input
	* const uploadBlob = l.procedure(
	*   'com.atproto.repo.uploadBlob',
	*   l.params({}),
	*   l.payload('*\/*', undefined), // Accept any content type
	*   l.jsonPayload({ blob: l.blob() }),
	* )
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function procedure(nsid, parameters, input, output, errors = void 0) {
		return new Procedure(nsid, parameters, input, output, errors);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/query.js
var require_query = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Query = void 0;
	exports.query = query;
	/**
	* Represents a Lexicon query (HTTP GET) endpoint definition.
	*
	* Queries are read-only operations that retrieve data from a server.
	* They have parameters (passed as URL query parameters), an output
	* payload, and optional error types.
	*
	* @template TNsid - The NSID identifying this query
	* @template TParameters - The parameters schema type
	* @template TOutputPayload - The output payload type
	* @template TErrors - Array of error type strings, or undefined
	*
	* @example
	* ```ts
	* const getPostQuery = new Query(
	*   'app.bsky.feed.getPost',
	*   l.params({ uri: l.string({ format: 'at-uri' }) }),
	*   l.payload('application/json', postSchema),
	*   ['NotFound']
	* )
	* ```
	*/
	var Query = class {
		nsid;
		parameters;
		output;
		errors;
		type = "query";
		constructor(nsid, parameters, output, errors) {
			this.nsid = nsid;
			this.parameters = parameters;
			this.output = output;
			this.errors = errors;
		}
	};
	exports.Query = Query;
	/**
	* Creates a query definition for a Lexicon GET endpoint.
	*
	* Queries retrieve data without side effects. Parameters are sent as
	* URL query string parameters.
	*
	* @param nsid - The NSID identifying this query endpoint
	* @param parameters - Schema for URL query parameters
	* @param output - Expected response payload schema
	* @param errors - Optional array of error type strings
	* @returns A new {@link Query} instance
	*
	* @example
	* ```ts
	* // Simple query with JSON output
	* const getProfile = l.query(
	*   'app.bsky.actor.getProfile',
	*   l.params({ actor: l.string({ format: 'at-identifier' }) }),
	*   l.jsonPayload({ displayName: l.string(), handle: l.string() }),
	* )
	*
	* // Query with pagination and errors
	* const getTimeline = l.query(
	*   'app.bsky.feed.getTimeline',
	*   l.params({
	*     limit: l.optional(l.integer({ minimum: 1, maximum: 100 })),
	*     cursor: l.optional(l.string()),
	*   }),
	*   l.jsonPayload({ feed: l.array(feedItemSchema), cursor: l.optional(l.string()) }),
	*   ['BlockedActor', 'BlockedByActor'],
	* )
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function query(nsid, parameters, output, errors = void 0) {
		return new Query(nsid, parameters, output, errors);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/record.js
var require_record = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RecordSchema = void 0;
	exports.record = record;
	var core_js_1 = require_core();
	var literal_js_1 = require_literal();
	var string_js_1 = require_string();
	/**
	* Schema for AT Protocol records with a type identifier and key constraints.
	*
	* Records are the primary data unit in AT Protocol. Each record has a `$type`
	* field identifying its Lexicon schema, and is stored at a specific key
	* (TID, NSID, or other format) in a repository.
	*
	* @template TKey - The record key type ('tid', 'nsid', 'any', or 'literal:...')
	* @template TType - The NSID string identifying this record type
	* @template TShape - The validator type for the record's data shape
	*
	* @example
	* ```ts
	* const postSchema = new RecordSchema(
	*   'tid',
	*   'app.bsky.feed.post',
	*   l.object({ text: l.string(), createdAt: l.string() })
	* )
	* ```
	*/
	var RecordSchema = class extends core_js_1.Schema {
		key;
		$type;
		schema;
		type = "record";
		keySchema;
		constructor(key, $type, schema) {
			super();
			this.key = key;
			this.$type = $type;
			this.schema = schema;
			this.keySchema = recordKey(key);
		}
		isTypeOf(value) {
			return value.$type === this.$type;
		}
		build(input) {
			return this.parse((0, core_js_1.$typed)(input, this.$type));
		}
		$isTypeOf(value) {
			return this.isTypeOf(value);
		}
		$build(input) {
			return this.build(input);
		}
		validateInContext(input, ctx) {
			const result = ctx.validate(input, this.schema);
			if (!result.success) return result;
			if (result.value.$type !== this.$type) return ctx.issueInvalidPropertyValue(result.value, "$type", [this.$type]);
			return result;
		}
	};
	exports.RecordSchema = RecordSchema;
	var keySchema = (0, string_js_1.string)({ minLength: 1 });
	var tidSchema = (0, string_js_1.string)({ format: "tid" });
	var nsidSchema = (0, string_js_1.string)({ format: "nsid" });
	var selfLiteralSchema = (0, literal_js_1.literal)("self");
	function recordKey(key) {
		if (key === "any") return keySchema;
		if (key === "tid") return tidSchema;
		if (key === "nsid") return nsidSchema;
		if (key.startsWith("literal:")) {
			const value = key.slice(8);
			if (value === "self") return selfLiteralSchema;
			return (0, literal_js_1.literal)(value);
		}
		throw new Error(`Unsupported record key type: ${key}`);
	}
	/*@__NO_SIDE_EFFECTS__*/
	function record(key, type, validator) {
		return new RecordSchema(key, type, validator);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/subscription.js
var require_subscription = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Subscription = void 0;
	exports.subscription = subscription;
	/**
	* Represents a Lexicon subscription (WebSocket) endpoint definition.
	*
	* Subscriptions are real-time event streams delivered over WebSocket.
	* They have parameters for initializing the connection and a message
	* schema for validating incoming events.
	*
	* @template TNsid - The NSID identifying this subscription
	* @template TParameters - The connection parameters schema type
	* @template TMessage - The message schema type
	* @template TErrors - Array of error type strings, or undefined
	*
	* @example
	* ```ts
	* const firehose = new Subscription(
	*   'com.atproto.sync.subscribeRepos',
	*   l.params({ cursor: l.optional(l.integer()) }),
	*   repoEventSchema,
	*   ['FutureCursor']
	* )
	* ```
	*/
	var Subscription = class {
		nsid;
		parameters;
		message;
		errors;
		type = "subscription";
		constructor(nsid, parameters, message, errors) {
			this.nsid = nsid;
			this.parameters = parameters;
			this.message = message;
			this.errors = errors;
		}
	};
	exports.Subscription = Subscription;
	/**
	* Creates a subscription definition for a Lexicon WebSocket endpoint.
	*
	* Subscriptions enable real-time event streaming. The connection is
	* initialized with parameters, and the server sends messages matching
	* the message schema.
	*
	* @param nsid - The NSID identifying this subscription endpoint
	* @param parameters - Schema for connection parameters
	* @param message - Schema for validating incoming messages
	* @param errors - Optional array of error type strings
	* @returns A new {@link Subscription} instance
	*
	* @example
	* ```ts
	* // Repository event stream
	* const subscribeRepos = l.subscription(
	*   'com.atproto.sync.subscribeRepos',
	*   l.params({
	*     cursor: l.optional(l.integer()),
	*   }),
	*   l.typedUnion([
	*     l.typedRef(() => commitEventSchema),
	*     l.typedRef(() => handleEventSchema),
	*     l.typedRef(() => identityEventSchema),
	*   ], false),
	*   ['FutureCursor', 'ConsumerTooSlow'],
	* )
	*
	* // Label stream
	* const subscribeLabels = l.subscription(
	*   'com.atproto.label.subscribeLabels',
	*   l.params({ cursor: l.optional(l.integer()) }),
	*   labelEventSchema,
	* )
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function subscription(nsid, parameters, message, errors = void 0) {
		return new Subscription(nsid, parameters, message, errors);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/typed-object.js
var require_typed_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TypedObjectSchema = void 0;
	exports.typedObject = typedObject;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	/**
	* Schema for typed objects in Lexicon unions.
	*
	* Typed objects have a `$type` field that identifies which variant they are
	* in a union. The `$type` can be omitted in input (it's implicit), but if
	* present, it must match the expected value.
	*
	* @template TType - The $type string literal type
	* @template TShape - The validator type for the object's shape
	*
	* @example
	* ```ts
	* const schema = new TypedObjectSchema(
	*   'app.bsky.embed.images#view',
	*   l.object({ images: l.array(imageSchema) })
	* )
	* ```
	*/
	var TypedObjectSchema = class extends core_js_1.Schema {
		$type;
		schema;
		type = "typedObject";
		constructor($type, schema) {
			super();
			this.$type = $type;
			this.schema = schema;
		}
		isTypeOf(value) {
			return value.$type === void 0 || value.$type === this.$type;
		}
		build(input) {
			return this.parse((0, core_js_1.$typed)(input, this.$type));
		}
		$isTypeOf(value) {
			return this.isTypeOf(value);
		}
		$build(input) {
			return this.build(input);
		}
		validateInContext(input, ctx) {
			if (!(0, lex_data_1.isPlainObject)(input)) return ctx.issueUnexpectedType(input, "object");
			if ("$type" in input && input.$type !== void 0 && input.$type !== this.$type) return ctx.issueInvalidPropertyValue(input, "$type", [this.$type]);
			return ctx.validate(input, this.schema);
		}
	};
	exports.TypedObjectSchema = TypedObjectSchema;
	/*@__NO_SIDE_EFFECTS__*/
	function typedObject(nsid, hash, validator) {
		return new TypedObjectSchema((0, core_js_1.$type)(nsid, hash), validator);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/typed-ref.js
var require_typed_ref = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TypedRefSchema = void 0;
	exports.typedRef = typedRef;
	var core_js_1 = require_core();
	/**
	* Schema for referencing typed objects with lazy resolution.
	*
	* Used in typed unions to reference typed object schemas. Requires the
	* `$type` field to be present and match the referenced schema's type.
	* The referenced schema is resolved lazily to support circular references.
	*
	* @template TValidator - The referenced typed object validator type
	*
	* @example
	* ```ts
	* const ref = new TypedRefSchema(() => imageViewSchema)
	* // ref.$type === 'app.bsky.embed.images#view'
	* ```
	*/
	var TypedRefSchema = class extends core_js_1.Schema {
		type = "typedRef";
		#getter;
		constructor(getter) {
			super();
			this.#getter = getter;
		}
		get validator() {
			return this.#getter.call(null);
		}
		get $type() {
			return this.validator.$type;
		}
		validateInContext(input, ctx) {
			const result = ctx.validate(input, this.validator);
			if (!result.success) return result;
			if (result.value.$type !== this.$type) return ctx.issueInvalidPropertyValue(result.value, "$type", [this.$type]);
			return result;
		}
	};
	exports.TypedRefSchema = TypedRefSchema;
	function typedRef(get) {
		return new TypedRefSchema(get);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema/typed-union.js
var require_typed_union = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TypedUnionSchema = void 0;
	exports.typedUnion = typedUnion;
	var lex_data_1 = require_dist$5();
	var core_js_1 = require_core();
	var lazy_property_js_1 = require_lazy_property();
	/**
	* Schema for Lexicon typed unions (unions discriminated by $type).
	*
	* Typed unions are collections of typed objects identified by their `$type`
	* field. Can be "open" (accept unknown types) or "closed" (only accept
	* known types).
	*
	* @template TValidators - Tuple of {@link TypedRefSchema} or {@link TypedObjectSchema} instances
	* @template TClosed - Whether the union is closed (rejects unknown $types)
	*
	* @example
	* ```ts
	* const embedUnion = new TypedUnionSchema([
	*   l.typedRef(() => imageSchema),
	*   l.typedRef(() => videoSchema),
	* ], true) // closed - only accepts images and videos
	* ```
	*/
	var TypedUnionSchema = class extends core_js_1.Schema {
		validators;
		closed;
		type = "typedUnion";
		constructor(validators, closed) {
			super();
			this.validators = validators;
			this.closed = closed;
		}
		get validatorsMap() {
			const map = /* @__PURE__ */ new Map();
			for (const ref of this.validators) map.set(ref.$type, ref);
			return (0, lazy_property_js_1.lazyProperty)(this, "validatorsMap", map);
		}
		get $types() {
			return Array.from(this.validatorsMap.keys());
		}
		validateInContext(input, ctx) {
			if (!(0, lex_data_1.isPlainObject)(input) || !("$type" in input)) return ctx.issueUnexpectedType(input, "$typed");
			const { $type } = input;
			const validator = this.validatorsMap.get($type);
			if (validator) return ctx.validate(input, validator);
			if (this.closed) return ctx.issueInvalidPropertyValue(input, "$type", this.$types);
			if (typeof $type !== "string") return ctx.issueInvalidPropertyType(input, "$type", "string");
			return ctx.success(input);
		}
	};
	exports.TypedUnionSchema = TypedUnionSchema;
	/**
	* Creates a typed union schema for Lexicon unions.
	*
	* Typed unions discriminate variants by their `$type` field. Can be open
	* (accepts unknown types, useful for extensibility) or closed (strict).
	*
	* @param refs - Array of typed refs for the union variants
	* @param closed - Whether to reject unknown $type values
	* @returns A new {@link TypedUnionSchema} instance
	*
	* @example
	* ```ts
	* // Closed union - only accepts known types
	* const embedSchema = l.typedUnion([
	*   l.typedRef(() => imageViewSchema),
	*   l.typedRef(() => videoViewSchema),
	*   l.typedRef(() => externalViewSchema),
	* ], true)
	*
	* // Open union - accepts unknown types for forward compatibility
	* const feedItemSchema = l.typedUnion([
	*   l.typedRef(() => postSchema),
	*   l.typedRef(() => repostSchema),
	* ], false) // unknown types pass through
	*
	* // Get all known $types
	* console.log(embedSchema.$types)
	* // ['app.bsky.embed.images#view', 'app.bsky.embed.video#view', ...]
	* ```
	*/
	/*@__NO_SIDE_EFFECTS__*/
	function typedUnion(refs, closed) {
		return new TypedUnionSchema(refs, closed);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/schema.js
var require_schema = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_array(), exports);
	tslib_1.__exportStar(require_blob$2(), exports);
	tslib_1.__exportStar(require_boolean(), exports);
	tslib_1.__exportStar(require_bytes$1(), exports);
	tslib_1.__exportStar(require_cid$1(), exports);
	tslib_1.__exportStar(require_dict(), exports);
	tslib_1.__exportStar(require_enum(), exports);
	tslib_1.__exportStar(require_integer(), exports);
	tslib_1.__exportStar(require_lex_map(), exports);
	tslib_1.__exportStar(require_lex_value(), exports);
	tslib_1.__exportStar(require_literal(), exports);
	tslib_1.__exportStar(require_never(), exports);
	tslib_1.__exportStar(require_null(), exports);
	tslib_1.__exportStar(require_object$1(), exports);
	tslib_1.__exportStar(require_regexp(), exports);
	tslib_1.__exportStar(require_string(), exports);
	tslib_1.__exportStar(require_unknown(), exports);
	tslib_1.__exportStar(require_custom(), exports);
	tslib_1.__exportStar(require_discriminated_union(), exports);
	tslib_1.__exportStar(require_intersection(), exports);
	tslib_1.__exportStar(require_nullable(), exports);
	tslib_1.__exportStar(require_optional(), exports);
	tslib_1.__exportStar(require_ref(), exports);
	tslib_1.__exportStar(require_refine(), exports);
	tslib_1.__exportStar(require_union(), exports);
	tslib_1.__exportStar(require_with_default(), exports);
	tslib_1.__exportStar(require_params(), exports);
	tslib_1.__exportStar(require_payload(), exports);
	tslib_1.__exportStar(require_permission_set(), exports);
	tslib_1.__exportStar(require_permission(), exports);
	tslib_1.__exportStar(require_procedure(), exports);
	tslib_1.__exportStar(require_query(), exports);
	tslib_1.__exportStar(require_record(), exports);
	tslib_1.__exportStar(require_subscription(), exports);
	tslib_1.__exportStar(require_token(), exports);
	tslib_1.__exportStar(require_typed_object(), exports);
	tslib_1.__exportStar(require_typed_ref(), exports);
	tslib_1.__exportStar(require_typed_union(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/helpers.js
var require_helpers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexErrorDataSchema = void 0;
	exports.getMain = getMain;
	var schema_js_1 = require_schema();
	function getMain(ns) {
		return "main" in ns ? ns.main : ns;
	}
	exports.lexErrorDataSchema = (0, schema_js_1.object)({
		error: (0, schema_js_1.string)({ minLength: 1 }),
		message: (0, schema_js_1.optional)((0, schema_js_1.string)())
	});
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/external.js
var require_external = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_core(), exports);
	tslib_1.__exportStar(require_helpers(), exports);
	tslib_1.__exportStar(require_schema(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-schema/dist/index.js
var require_dist$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.l = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	exports.l = tslib_1.__importStar(require_external());
	tslib_1.__exportStar(require_external(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/agent.js
var require_agent = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.buildAgent = buildAgent;
	/**
	* Creates an {@link Agent} from various input types.
	*
	* This factory function accepts an existing Agent (returned as-is), a service URL,
	* or a full configuration object. It handles the common case of creating an
	* unauthenticated agent from just a service URL.
	*
	* @param options - Agent instance, configuration object, or service URL
	* @returns A configured Agent ready for making requests
	* @throws {TypeError} If fetch() is not available in the environment
	*
	* @example From URL string
	* ```typescript
	* const agent = buildAgent('https://public.api.bsky.app')
	* ```
	*
	* @example From configuration
	* ```typescript
	* const agent = buildAgent({
	*   did: 'did:plc:example',
	*   service: 'https://bsky.social',
	*   headers: { 'Authorization': 'Bearer ...' }
	* })
	* ```
	*
	* @example Pass-through existing agent
	* ```typescript
	* const existing: Agent = { ... }
	* const agent = buildAgent(existing) // Returns existing unchanged
	* ```
	*/
	function buildAgent(options) {
		if (typeof options === "object" && "fetchHandler" in options) return options;
		const config = typeof options === "string" || options instanceof URL ? {
			did: void 0,
			service: options
		} : options;
		const { service, fetch = globalThis.fetch } = config;
		if (typeof fetch !== "function") throw new TypeError("fetch() is not available in this environment");
		return {
			get did() {
				return config.did;
			},
			async fetchHandler(path, init) {
				const headers = config.headers != null && init.headers != null ? mergeHeaders(config.headers, init.headers) : config.headers || init.headers;
				return fetch(new URL(path, service), headers !== init.headers ? {
					...init,
					headers
				} : init);
			}
		};
	}
	function mergeHeaders(defaultHeaders, requestHeaders) {
		const result = new Headers(defaultHeaders);
		const overrides = requestHeaders instanceof Headers ? requestHeaders : new Headers(requestHeaders);
		for (const [key, value] of overrides.entries()) result.set(key, value);
		return result;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/object.js
var require_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isObject = isObject;
	exports.isPlainObject = isPlainObject;
	exports.isPlainProto = isPlainProto;
	/**
	* Checks whether the input is an object (not null).
	*
	* Returns true for any non-null value with typeof 'object', including
	* arrays, plain objects, class instances, etc.
	*
	* @param input - The value to check
	* @returns `true` if the input is an object (not null)
	*
	* @example
	* ```typescript
	* import { isObject } from '@atproto/lex-data'
	*
	* isObject({})           // true
	* isObject([1, 2, 3])    // true
	* isObject(new Date())   // true
	* isObject(null)         // false
	* isObject('string')     // false
	* ```
	*/
	function isObject(input) {
		return input != null && typeof input === "object";
	}
	var ObjectProto = Object.prototype;
	var ObjectToString = Object.prototype.toString;
	/**
	* Checks whether the input is a plain object.
	*
	* A plain object is an object (not null) whose prototype is either null
	* or `Object.prototype`. This excludes arrays, class instances, and other
	* special objects.
	*
	* @param input - The value to check
	* @returns `true` if the input is a plain object
	*
	* @example
	* ```typescript
	* import { isPlainObject } from '@atproto/lex-data'
	*
	* isPlainObject({})                    // true
	* isPlainObject({ a: 1 })              // true
	* isPlainObject(Object.create(null))   // true
	* isPlainObject([1, 2, 3])             // false
	* isPlainObject(new Date())            // false
	* isPlainObject(null)                  // false
	* ```
	*/
	function isPlainObject(input) {
		return isObject(input) && isPlainProto(input);
	}
	/**
	* Checks whether the prototype of an object is plain (null or Object.prototype).
	*
	* This is useful for checking if an object is a plain object without
	* checking that it's non-null first (the null check is already done).
	*
	* @param input - The object to check (must be non-null)
	* @returns `true` if the object's prototype is plain
	*
	* @example
	* ```typescript
	* import { isPlainProto } from '@atproto/lex-data'
	*
	* isPlainProto({})                    // true
	* isPlainProto(Object.create(null))   // true
	* isPlainProto([1, 2, 3])             // false (Array.prototype)
	* isPlainProto(new Date())            // false (Date.prototype)
	* ```
	*/
	function isPlainProto(input) {
		const proto = Object.getPrototypeOf(input);
		if (proto === null) return true;
		return (proto === ObjectProto || Object.getPrototypeOf(proto) === null) && ObjectToString.call(input) === "[object Object]";
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/lib/nodejs-buffer.js
var require_nodejs_buffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NodeJSBuffer = void 0;
	var BUFFER = /*#__PURE__*/ (() => "Bu" + "f".repeat(2) + "er")();
	exports.NodeJSBuffer = globalThis?.[BUFFER]?.prototype instanceof Uint8Array && "byteLength" in globalThis[BUFFER] ? globalThis[BUFFER] : /* v8 ignore next -- @preserve */ null;
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/uint8array-concat.js
var require_uint8array_concat = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8ConcatNode = void 0;
	exports.ui8ConcatPonyfill = ui8ConcatPonyfill;
	var Buffer = require_nodejs_buffer().NodeJSBuffer;
	exports.ui8ConcatNode = Buffer ? function ui8ConcatNode(array) {
		return Buffer.concat(array);
	} : /* v8 ignore next -- @preserve */ null;
	function ui8ConcatPonyfill(array) {
		let totalLength = 0;
		for (const arr of array) totalLength += arr.length;
		const result = new Uint8Array(totalLength);
		let offset = 0;
		for (const arr of array) {
			result.set(arr, offset);
			offset += arr.length;
		}
		return result;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/uint8array-from-base64.js
var require_uint8array_from_base64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromBase64Node = exports.fromBase64Native = void 0;
	exports.fromBase64Ponyfill = fromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer().NodeJSBuffer;
	exports.fromBase64Native = typeof Uint8Array.fromBase64 === "function" ? function fromBase64Native(b64, alphabet = "base64") {
		return Uint8Array.fromBase64(b64, {
			alphabet,
			lastChunkHandling: "loose"
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.fromBase64Node = Buffer ? function fromBase64Node(b64, alphabet = "base64") {
		const bytes = Buffer.from(b64, alphabet);
		verifyBase64ForBytes(b64, bytes);
		return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	} : /* v8 ignore next -- @preserve */ null;
	function fromBase64Ponyfill(b64, alphabet = "base64") {
		const bytes = (0, from_string_1.fromString)(b64, b64.endsWith("=") ? `${alphabet}pad` : alphabet);
		verifyBase64ForBytes(b64, bytes);
		return bytes;
	}
	function verifyBase64ForBytes(b64, bytes) {
		const paddingCount = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
		const trimmedLength = b64.length - paddingCount;
		const expectedByteLength = Math.floor(trimmedLength * 3 / 4);
		if (bytes.length !== expectedByteLength) throw new Error("Invalid base64 string");
		const expectedB64Length = bytes.length / 3 * 4;
		const expectedFullB64Length = expectedB64Length + (expectedB64Length % 4 === 0 ? 0 : 4 - expectedB64Length % 4);
		if (b64.length > expectedFullB64Length) throw new Error("Invalid base64 string");
		for (let i = Math.ceil(expectedB64Length); i < b64.length - paddingCount; i++) {
			const code = b64.charCodeAt(i);
			if (!(code >= 65 && code <= 90) && !(code >= 97 && code <= 122) && !(code >= 48 && code <= 57) && code !== 43 && code !== 47) throw new Error("Invalid base64 string");
		}
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/uint8array-to-base64.js
var require_uint8array_to_base64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBase64Node = exports.toBase64Native = void 0;
	exports.toBase64Ponyfill = toBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var Buffer = require_nodejs_buffer().NodeJSBuffer;
	exports.toBase64Native = typeof Uint8Array.prototype.toBase64 === "function" ? function toBase64Native(bytes, alphabet = "base64") {
		return bytes.toBase64({
			alphabet,
			omitPadding: true
		});
	} : /* v8 ignore next -- @preserve */ null;
	exports.toBase64Node = Buffer ? function toBase64Node(bytes, alphabet = "base64") {
		const b64 = (bytes instanceof Buffer ? bytes : Buffer.from(bytes)).toString(alphabet);
		return b64.charCodeAt(b64.length - 1) === 61 ? b64.charCodeAt(b64.length - 2) === 61 ? b64.slice(0, -2) : b64.slice(0, -1) : b64;
	} : /* v8 ignore next -- @preserve */ null;
	function toBase64Ponyfill(bytes, alphabet = "base64") {
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/uint8array.js
var require_uint8array = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ui8Concat = exports.fromBase64 = exports.toBase64 = void 0;
	exports.ifUint8Array = ifUint8Array;
	exports.asUint8Array = asUint8Array;
	exports.ui8Equals = ui8Equals;
	var uint8array_concat_js_1 = require_uint8array_concat();
	var uint8array_from_base64_js_1 = require_uint8array_from_base64();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64();
	/**
	* Encodes a Uint8Array into a base64 string.
	*
	* Uses native Uint8Array.prototype.toBase64 when available (Node.js 24+, modern browsers),
	* falling back to Node.js Buffer or a ponyfill implementation.
	*
	* @param bytes - The binary data to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The base64 encoded string
	*
	* @example
	* ```typescript
	* import { toBase64 } from '@atproto/lex-data'
	*
	* const bytes = new Uint8Array([72, 101, 108, 108, 111])
	* toBase64(bytes)           // 'SGVsbG8='
	* toBase64(bytes, 'base64url')  // 'SGVsbG8' (URL-safe, no padding)
	* ```
	*/
	exports.toBase64 = uint8array_to_base64_js_1.toBase64Native ?? uint8array_to_base64_js_1.toBase64Node ?? uint8array_to_base64_js_1.toBase64Ponyfill;
	/**
	* Decodes a base64 string into a Uint8Array.
	*
	* Supports both padded and unpadded base64 strings. Uses native
	* Uint8Array.fromBase64 when available, falling back to Node.js Buffer
	* or a ponyfill implementation.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url'), defaults to 'base64'
	* @returns The decoded binary data
	* @throws If the input is not a valid base64 string
	*
	* @example
	* ```typescript
	* import { fromBase64 } from '@atproto/lex-data'
	*
	* fromBase64('SGVsbG8=')       // Uint8Array([72, 101, 108, 108, 111])
	* fromBase64('SGVsbG8', 'base64url')  // Same, URL-safe alphabet
	* ```
	*/
	exports.fromBase64 = uint8array_from_base64_js_1.fromBase64Native ?? uint8array_from_base64_js_1.fromBase64Node ?? uint8array_from_base64_js_1.fromBase64Ponyfill;
	/* v8 ignore next -- @preserve */
	if (exports.toBase64 === uint8array_to_base64_js_1.toBase64Ponyfill || exports.fromBase64 === uint8array_from_base64_js_1.fromBase64Ponyfill) {}
	/**
	* Returns the input if it is a Uint8Array, otherwise returns undefined.
	*
	* @param input - The value to check
	* @returns The input if it's a Uint8Array, otherwise undefined
	*
	* @example
	* ```typescript
	* import { ifUint8Array } from '@atproto/lex-data'
	*
	* ifUint8Array(new Uint8Array([1, 2]))  // Uint8Array([1, 2])
	* ifUint8Array('not binary')            // undefined
	* ifUint8Array(new ArrayBuffer(4))      // undefined
	* ```
	*/
	function ifUint8Array(input) {
		if (input instanceof Uint8Array) return input;
	}
	/**
	* Coerces various binary data representations into a Uint8Array.
	*
	* Handles the following input types:
	* - `Uint8Array` - Returned as-is
	* - `ArrayBufferView` (e.g., DataView, other TypedArrays) - Converted to Uint8Array
	* - `ArrayBuffer` - Wrapped in a Uint8Array
	*
	* @param input - The value to convert
	* @returns A Uint8Array, or `undefined` if the input could not be converted
	*
	* @example
	* ```typescript
	* import { asUint8Array } from '@atproto/lex-data'
	*
	* asUint8Array(new Uint8Array([1, 2]))     // Uint8Array([1, 2])
	* asUint8Array(new ArrayBuffer(4))         // Uint8Array of length 4
	* asUint8Array(new Int16Array([1, 2]))     // Uint8Array view of the buffer
	* asUint8Array('string')                   // undefined
	* ```
	*/
	function asUint8Array(input) {
		if (input instanceof Uint8Array) return input;
		if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength / Uint8Array.BYTES_PER_ELEMENT);
		if (input instanceof ArrayBuffer) return new Uint8Array(input);
	}
	/**
	* Compares two Uint8Arrays for byte-by-byte equality.
	*
	* @param a - First Uint8Array to compare
	* @param b - Second Uint8Array to compare
	* @returns `true` if both arrays have the same length and identical bytes
	*
	* @example
	* ```typescript
	* import { ui8Equals } from '@atproto/lex-data'
	*
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ui8Equals(new Uint8Array([1, 2]), new Uint8Array([1, 3]))  // false
	* ui8Equals(new Uint8Array([1]), new Uint8Array([1, 2]))     // false
	* ```
	*/
	function ui8Equals(a, b) {
		if (a.byteLength !== b.byteLength) return false;
		for (let i = 0; i < a.byteLength; i++) if (a[i] !== b[i]) return false;
		return true;
	}
	/**
	* Concatenates multiple Uint8Arrays into a single Uint8Array.
	*
	* Uses Node.js Buffer.concat when available for performance,
	* falling back to a ponyfill implementation.
	*
	* @param arrays - The Uint8Arrays to concatenate
	* @returns A new Uint8Array containing all input bytes in order
	*
	* @example
	* ```typescript
	* import { ui8Concat } from '@atproto/lex-data'
	*
	* const a = new Uint8Array([1, 2])
	* const b = new Uint8Array([3, 4])
	* ui8Concat([a, b])  // Uint8Array([1, 2, 3, 4])
	* ```
	*/
	exports.ui8Concat = uint8array_concat_js_1.ui8ConcatNode ?? uint8array_concat_js_1.ui8ConcatPonyfill;
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/cid.js
var require_cid = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CID = exports.SHA512_HASH_CODE = exports.SHA256_HASH_CODE = exports.RAW_DATA_CODEC = exports.CBOR_DATA_CODEC = void 0;
	exports.multihashEquals = multihashEquals;
	exports.asMultiformatsCID = asMultiformatsCID;
	exports.isRawCid = isRawCid;
	exports.isDaslCid = isDaslCid;
	exports.isCborCid = isCborCid;
	exports.checkCid = checkCid;
	exports.isCid = isCid;
	exports.ifCid = ifCid;
	exports.asCid = asCid;
	exports.decodeCid = decodeCid;
	exports.parseCid = parseCid;
	exports.validateCidString = validateCidString;
	exports.parseCidSafe = parseCidSafe;
	exports.ensureValidCidString = ensureValidCidString;
	exports.isCidForBytes = isCidForBytes;
	exports.createCid = createCid;
	exports.cidForCbor = cidForCbor;
	exports.cidForRawBytes = cidForRawBytes;
	exports.cidForRawHash = cidForRawHash;
	var cid_1 = (init_cid(), __toCommonJS(cid_exports));
	Object.defineProperty(exports, "CID", {
		enumerable: true,
		get: function() {
			return cid_1.CID;
		}
	});
	var digest_1 = (init_digest(), __toCommonJS(digest_exports));
	var sha2_1 = (init_sha2_browser(), __toCommonJS(sha2_browser_exports));
	var object_js_1 = require_object();
	var uint8array_js_1 = require_uint8array();
	/**
	* Codec code that indicates the CID references a CBOR-encoded data structure.
	*
	* Used when encoding structured data in AT Protocol repositories.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.CBOR_DATA_CODEC = 113;
	/**
	* Codec code that indicates the CID references raw binary data (like media blobs).
	*
	* Used in DASL CIDs for binary blobs like images and media.
	*
	* @see {@link https://dasl.ing/cid.html Content IDs (DASL)}
	*/
	exports.RAW_DATA_CODEC = 85;
	/**
	* Hash code that indicates that a CID uses SHA-256.
	*/
	exports.SHA256_HASH_CODE = sha2_1.sha256.code;
	/**
	* Hash code that indicates that a CID uses SHA-512.
	*/
	exports.SHA512_HASH_CODE = sha2_1.sha512.code;
	/**
	* Compares two {@link Multihash} for equality.
	*
	* @param a - First {@link Multihash}
	* @param b - Second {@link Multihash}
	* @returns `true` if both multihashes have the same code and digest
	*/
	function multihashEquals(a, b) {
		if (a === b) return true;
		return a.code === b.code && (0, uint8array_js_1.ui8Equals)(a.digest, b.digest);
	}
	/**
	* Converts a {@link Cid} to a multiformats {@link CID} instance.
	*
	* @deprecated Packages depending on `@atproto/lex-data` should use the
	* {@link Cid} interface instead of relying on `multiformats`'s {@link CID}
	* implementation directly. This is to avoid compatibility issues, and in order
	* to allow better portability, compatibility and future updates.
	*/
	function asMultiformatsCID(input) {
		return cid_1.CID.asCID(input) ?? cid_1.CID.create(input.version, input.code, (0, digest_1.create)(input.multihash.code, input.multihash.digest));
	}
	/**
	* Type guard to check if a CID is a raw binary CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a version 1 CID with raw multicodec
	*/
	function isRawCid(cid) {
		return cid.version === 1 && cid.code === exports.RAW_DATA_CODEC;
	}
	/**
	* Type guard to check if a CID is DASL compliant.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is DASL compliant (v1, raw/dag-cbor, sha256)
	*/
	function isDaslCid(cid) {
		return cid.version === 1 && (cid.code === exports.RAW_DATA_CODEC || cid.code === exports.CBOR_DATA_CODEC) && cid.multihash.code === exports.SHA256_HASH_CODE && cid.multihash.digest.byteLength === 32;
	}
	/**
	* Type guard to check if a CID is a DAG-CBOR CID.
	*
	* @param cid - The CID to check
	* @returns `true` if the CID is a DAG-CBOR CID (v1, dag-cbor, sha256)
	*/
	function isCborCid(cid) {
		return cid.code === exports.CBOR_DATA_CODEC && isDaslCid(cid);
	}
	function checkCid(cid, options) {
		switch (options?.flavor) {
			case void 0: return true;
			case "cbor": return isCborCid(cid);
			case "dasl": return isDaslCid(cid);
			case "raw": return isRawCid(cid);
			default: throw new TypeError(`Unknown CID flavor: ${options?.flavor}`);
		}
	}
	function isCid(value, options) {
		return isCidImplementation(value) && checkCid(value, options);
	}
	function ifCid(value, options) {
		if (isCidImplementation(value) && checkCid(value, options)) return value;
		return null;
	}
	function asCid(value, options) {
		if (isCidImplementation(value) && checkCid(value, options)) return value;
		throw new Error("Not a valid CID");
	}
	function decodeCid(cidBytes, options) {
		return asCid(cid_1.CID.decode(cidBytes), options);
	}
	function parseCid(input, options) {
		return asCid(cid_1.CID.parse(input), options);
	}
	/**
	* Validates that a string is a valid CID representation.
	*
	* Unlike {@link parseCid}, this function returns a boolean instead of throwing.
	* It also verifies that the string is the canonical representation of the CID.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @returns `true` if the string is a valid CID
	*/
	function validateCidString(input, options) {
		return parseCidSafe(input, options)?.toString() === input;
	}
	function parseCidSafe(input, options) {
		try {
			return parseCid(input, options);
		} catch {
			return null;
		}
	}
	/**
	* Ensures that a string is a valid CID representation.
	*
	* @param input - The string to validate
	* @param options - Optional flavor constraints
	* @throws If the string is not a valid CID
	*/
	function ensureValidCidString(input, options) {
		if (!validateCidString(input, options)) throw new Error(`Invalid CID string`);
	}
	/**
	* Verifies whether the multihash of a given {@link cid} matches the hash of the provided {@link bytes}.
	* @params cid The CID to match against the bytes.
	* @params bytes The bytes to verify.
	* @returns true if the CID matches the bytes, false otherwise.
	*/
	async function isCidForBytes(cid, bytes) {
		if (cid.multihash.code === sha2_1.sha256.code) return multihashEquals(await sha2_1.sha256.digest(bytes), cid.multihash);
		if (cid.multihash.code === sha2_1.sha512.code) return multihashEquals(await sha2_1.sha512.digest(bytes), cid.multihash);
		throw new Error("Unsupported CID multihash");
	}
	/**
	* Creates a CID from a multicodec, multihash code, and digest.
	*
	* @param code - The multicodec content type code
	* @param multihashCode - The multihash algorithm code
	* @param digest - The raw hash digest bytes
	* @returns A new CIDv1 instance
	*
	* @example
	* ```typescript
	* import { createCid, RAW_DATA_CODEC, SHA256_HASH_CODE } from '@atproto/lex-data'
	*
	* const cid = createCid(RAW_DATA_CODEC, SHA256_HASH_CODE, hashDigest)
	* ```
	*/
	function createCid(code, multihashCode, digest) {
		return cid_1.CID.createV1(code, (0, digest_1.create)(multihashCode, digest));
	}
	/**
	* Creates a DAG-CBOR CID for the given CBOR bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with DAG-CBOR multicodec.
	*
	* @param bytes - The CBOR-encoded bytes to hash
	* @returns A promise that resolves to the CborCid
	*/
	async function cidForCbor(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.CBOR_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID for the given binary bytes.
	*
	* Computes the SHA-256 hash of the bytes and creates a CIDv1 with raw multicodec.
	*
	* @param bytes - The raw binary bytes to hash
	* @returns A promise that resolves to the RawCid
	*/
	async function cidForRawBytes(bytes) {
		const multihash = await sha2_1.sha256.digest(bytes);
		return cid_1.CID.createV1(exports.RAW_DATA_CODEC, multihash);
	}
	/**
	* Creates a raw CID from an existing SHA-256 hash digest.
	*
	* @param digest - The SHA-256 hash digest (must be 32 bytes)
	* @returns A RawCid with the given digest
	* @throws If the digest length is not 32 bytes
	*/
	function cidForRawHash(digest) {
		if (digest.length !== 32) throw new Error(`Invalid SHA-256 hash length: ${digest.length}`);
		return createCid(exports.RAW_DATA_CODEC, sha2_1.sha256.code, digest);
	}
	function isCidImplementation(value) {
		if (cid_1.CID.asCID(value)) return value.bytes != null;
		else try {
			if (!(0, object_js_1.isObject)(value)) return false;
			const val = value;
			if (val.version !== 0 && val.version !== 1) return false;
			if (!isUint8(val.code)) return false;
			if (!(0, object_js_1.isObject)(val.multihash)) return false;
			const mh = val.multihash;
			if (!isUint8(mh.code)) return false;
			if (!(mh.digest instanceof Uint8Array)) return false;
			if (!(val.bytes instanceof Uint8Array)) return false;
			if (val.bytes[0] !== val.version) return false;
			if (val.bytes[1] !== val.code) return false;
			if (val.bytes[2] !== mh.code) return false;
			if (val.bytes[3] !== mh.digest.length) return false;
			if (val.bytes.length !== 4 + mh.digest.length) return false;
			if (!(0, uint8array_js_1.ui8Equals)(val.bytes.subarray(4), mh.digest)) return false;
			if (typeof val.equals !== "function") return false;
			if (val.equals(val) !== true) return false;
			return true;
		} catch {
			return false;
		}
	}
	function isUint8(val) {
		return Number.isInteger(val) && val >= 0 && val < 256;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/blob.js
var require_blob$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isBlobRef = isBlobRef;
	exports.isLegacyBlobRef = isLegacyBlobRef;
	exports.enumBlobRefs = enumBlobRefs;
	var cid_js_1 = require_cid();
	var object_js_1 = require_object();
	function isBlobRef(input, options) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		if (input?.$type !== "blob") return false;
		const { mimeType, size, ref } = input;
		if (typeof mimeType !== "string" || !mimeType.includes("/")) return false;
		if (typeof size !== "number" || size < 0 || !Number.isSafeInteger(size)) return false;
		if (typeof ref !== "object" || ref === null) return false;
		for (const key in input) if (key !== "$type" && key !== "mimeType" && key !== "ref" && key !== "size") return false;
		if (!(0, cid_js_1.ifCid)(ref, options?.strict === false ? void 0 : { flavor: "raw" })) return false;
		return true;
	}
	/**
	* Type guard to check if a value is a valid {@link LegacyBlobRef}.
	*
	* Validates the structure of the input:
	* - `cid` must be a valid CID string
	* - `mimeType` must be a non-empty string
	* - No additional properties allowed
	*
	* @param input - The value to check
	* @returns `true` if the input is a valid LegacyBlobRef
	*
	* @example
	* ```typescript
	* import { isLegacyBlobRef } from '@atproto/lex-data'
	*
	* if (isLegacyBlobRef(data)) {
	*   console.log(data.cid)       // CID as string
	*   console.log(data.mimeType)  // e.g., 'image/jpeg'
	* }
	* ```
	*
	* @see {@link isBlobRef} for checking the current blob reference format
	*/
	function isLegacyBlobRef(input) {
		if (!(0, object_js_1.isPlainObject)(input)) return false;
		const { cid, mimeType } = input;
		if (typeof cid !== "string") return false;
		if (typeof mimeType !== "string" || mimeType.length === 0) return false;
		for (const key in input) if (key !== "cid" && key !== "mimeType") return false;
		if (!(0, cid_js_1.validateCidString)(cid)) return false;
		return true;
	}
	function* enumBlobRefs(input, options) {
		const includeLegacy = options?.allowLegacy === true;
		const stack = [input];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if (value != null && typeof value === "object") {
				if (Array.isArray(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					stack.push(...value);
				} else if ((0, object_js_1.isPlainProto)(value)) {
					if (visited.has(value)) continue;
					visited.add(value);
					if (isBlobRef(value, options)) yield value;
					else if (includeLegacy && isLegacyBlobRef(value)) yield value;
					else for (const v of Object.values(value)) if (v != null) stack.push(v);
				}
			}
		} while (stack.length > 0);
		visited.clear();
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/lex-equals.js
var require_lex_equals = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexEquals = lexEquals;
	var cid_js_1 = require_cid();
	var object_js_1 = require_object();
	var uint8array_js_1 = require_uint8array();
	/**
	* Performs deep equality comparison between two {@link LexValue}s.
	*
	* This function correctly handles all Lexicon data types including:
	* - Primitives (string, number, boolean, null)
	* - Arrays (recursive element comparison)
	* - Objects/LexMaps (recursive key-value comparison)
	* - Uint8Arrays (byte-by-byte comparison)
	* - CIDs (using CID equality)
	*
	* @param a - First LexValue to compare
	* @param b - Second LexValue to compare
	* @returns `true` if the values are deeply equal
	* @throws {TypeError} If either value is not a valid LexValue (e.g., contains unsupported types)
	*
	* @example
	* ```typescript
	* import { lexEquals } from '@atproto/lex-data'
	*
	* // Primitives
	* lexEquals('hello', 'hello')  // true
	* lexEquals(42, 42)            // true
	*
	* // Arrays
	* lexEquals([1, 2, 3], [1, 2, 3])  // true
	* lexEquals([1, 2], [1, 2, 3])     // false
	*
	* // Objects
	* lexEquals({ a: 1, b: 2 }, { a: 1, b: 2 })  // true
	* lexEquals({ a: 1 }, { a: 1, b: 2 })        // false
	*
	* // CIDs
	* lexEquals(cid1, cid2)  // true if CIDs are equal
	*
	* // Uint8Arrays
	* lexEquals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))  // true
	* ```
	*/
	function lexEquals(a, b) {
		if (Object.is(a, b)) return true;
		if (a == null || b == null || typeof a !== "object" || typeof b !== "object") return false;
		if (Array.isArray(a)) {
			if (!Array.isArray(b)) return false;
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) if (!lexEquals(a[i], b[i])) return false;
			return true;
		} else if (Array.isArray(b)) return false;
		if (ArrayBuffer.isView(a)) {
			if (!ArrayBuffer.isView(b)) return false;
			return (0, uint8array_js_1.ui8Equals)(a, b);
		} else if (ArrayBuffer.isView(b)) return false;
		if ((0, cid_js_1.isCid)(a)) return (0, cid_js_1.ifCid)(b)?.equals(a) === true;
		else if ((0, cid_js_1.isCid)(b)) return false;
		if (!(0, object_js_1.isPlainObject)(a) || !(0, object_js_1.isPlainObject)(b)) throw new TypeError("Invalid LexValue (expected CID, Uint8Array, or LexMap)");
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		for (const key of aKeys) {
			const aVal = a[key];
			const bVal = b[key];
			if (aVal === void 0) {
				if (bVal === void 0 && bKeys.includes(key)) continue;
				return false;
			} else if (bVal === void 0) return false;
			if (!lexEquals(aVal, bVal)) return false;
		}
		return true;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/lex-error.js
var require_lex_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LexError = void 0;
	/**
	* Error class for Lexicon-related errors.
	*
	* LexError extends the standard JavaScript {@link Error} with AT Protocol-specific
	* functionality including:
	* - An error code for programmatic error handling
	* - JSON serialization for API responses
	* - HTTP Response generation
	*
	* @typeParam N - The specific error code type
	*
	* @example
	* ```typescript
	* import { LexError } from '@atproto/lex-data'
	*
	* // Throw a Lexicon error
	* throw new LexError('InvalidRequest', 'Missing required field')
	*
	* // Create and serialize
	* const error = new LexError('NotFound', 'Record not found')
	* console.log(error.toJSON())
	* // { error: 'NotFound', message: 'Record not found' }
	*
	* // Return as HTTP response
	* return error.toResponse()  // 400 Bad Request with JSON body
	* ```
	*/
	var LexError = class extends Error {
		error;
		name = "LexError";
		/**
		* Creates a new LexError.
		*
		* @param error - The error code identifying the type of error
		* @param message - Optional human-readable error message
		* @param options - Standard Error options (e.g., cause)
		*/
		constructor(error, message, options) {
			super(message, options);
			this.error = error;
		}
		/**
		* Returns a string representation of this error.
		*
		* @returns A formatted string: "LexError: [ERROR_CODE] message"
		*/
		toString() {
			return `${this.name}: [${this.error}] ${this.message}`;
		}
		/**
		* Converts this error to a JSON-serializable object.
		*
		* @returns The error data suitable for JSON serialization
		*/
		toJSON() {
			const { error, message } = this;
			return {
				error,
				message: message || void 0
			};
		}
		/**
		* Converts this error to an HTTP Response for downstream clients.
		*
		* Returns a 400 Bad Request response with the JSON-serialized error body.
		*
		* @returns A Response object with status 400 and JSON body
		*/
		toResponse() {
			return Response.json(this.toJSON(), { status: 400 });
		}
	};
	exports.LexError = LexError;
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/lex.js
var require_lex = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isLexMap = isLexMap;
	exports.isLexArray = isLexArray;
	exports.isLexScalar = isLexScalar;
	exports.isLexValue = isLexValue;
	exports.isTypedLexMap = isTypedLexMap;
	var cid_js_1 = require_cid();
	var object_js_1 = require_object();
	/**
	* Type guard to check if a value is a valid {@link LexMap}.
	*
	* Returns true if the value is a plain object where all values are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexMap
	*
	* @example
	* ```typescript
	* import { isLexMap } from '@atproto/lex'
	*
	* if (isLexMap(data)) {
	*   // data is narrowed to LexMap
	*   console.log(Object.keys(data))
	* }
	* ```
	*/
	function isLexMap(value) {
		return (0, object_js_1.isPlainObject)(value) && Object.values(value).every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexArray}.
	*
	* Returns true if the value is an array where all elements are valid
	* {@link LexValue} types.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexArray
	*
	* @example
	* ```typescript
	* import { isLexArray } from '@atproto/lex'
	*
	* if (isLexArray(data)) {
	*   // data is narrowed to LexArray
	*   data.forEach(item => console.log(item))
	* }
	* ```
	*/
	function isLexArray(value) {
		return Array.isArray(value) && value.every(isLexValue);
	}
	/**
	* Type guard to check if a value is a valid {@link LexScalar}.
	*
	* Returns true if the value is one of the primitive Lexicon types:
	* number (integer only), string, boolean, null, Cid, or Uint8Array.
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexScalar
	*
	* @example
	* ```typescript
	* import { isLexScalar } from '@atproto/lex'
	*
	* isLexScalar('hello')     // true
	* isLexScalar(42)          // true
	* isLexScalar(3.14)        // false (floats not allowed)
	* isLexScalar([1, 2])      // false (arrays are not scalars)
	* ```
	*/
	function isLexScalar(value) {
		switch (typeof value) {
			case "object": return value === null || value instanceof Uint8Array || (0, cid_js_1.isCid)(value);
			case "string":
			case "boolean": return true;
			case "number": if (Number.isInteger(value)) return true;
			default: return false;
		}
	}
	/**
	* Type guard to check if a value is a valid {@link LexValue}.
	*
	* Performs a deep check to validate that the value (and all nested values)
	* conform to the Lexicon data model. This includes checking for:
	* - Valid scalar types (number, string, boolean, null, Cid, Uint8Array)
	* - Arrays containing only valid LexValues
	* - Plain objects with string keys and valid LexValue values
	* - No cyclic references (which cannot be serialized to JSON or CBOR)
	*
	* @param value - The value to check
	* @returns `true` if the value is a valid LexValue
	*
	* @example
	* ```typescript
	* import { isLexValue } from '@atproto/lex'
	*
	* isLexValue({ name: 'Alice', tags: ['admin'] })  // true
	* isLexValue(new Date())                           // false (not a plain object)
	* isLexValue({ fn: () => {} })                     // false (functions not allowed)
	* ```
	*/
	function isLexValue(value) {
		const stack = [value];
		const visited = /* @__PURE__ */ new Set();
		do {
			const value = stack.pop();
			if ((0, object_js_1.isPlainObject)(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...Object.values(value));
			} else if (Array.isArray(value)) {
				if (visited.has(value)) return false;
				visited.add(value);
				stack.push(...value);
			} else if (!isLexScalar(value)) return false;
		} while (stack.length > 0);
		visited.clear();
		return true;
	}
	/**
	* Type guard to check if a value is a {@link TypedLexMap}.
	*
	* Returns true if the value is a valid {@link LexMap} with a non-empty
	* `$type` string property.
	*
	* @param value - The LexValue to check
	* @returns `true` if the value is a TypedLexMap
	*
	* @example
	* ```typescript
	* import { isTypedLexMap } from '@atproto/lex'
	*
	* const data = { $type: 'app.bsky.feed.post', text: 'Hello' }
	*
	* if (isTypedLexMap(data)) {
	*   console.log(data.$type)  // 'app.bsky.feed.post'
	* }
	* ```
	*/
	function isTypedLexMap(value) {
		return isLexMap(value) && typeof value.$type === "string" && value.$type.length > 0;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/utf8-from-base64.js
var require_utf8_from_base64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64Node = void 0;
	exports.utf8FromBase64Ponyfill = utf8FromBase64Ponyfill;
	var from_string_1 = (init_from_string(), __toCommonJS(from_string_exports));
	var Buffer = require_nodejs_buffer().NodeJSBuffer;
	exports.utf8FromBase64Node = Buffer ? function utf8FromBase64Node(b64, alphabet = "base64") {
		return Buffer.from(b64, alphabet).toString("utf8");
	} : /* v8 ignore next -- @preserve */ null;
	var textDecoder = /*#__PURE__*/ new TextDecoder();
	function utf8FromBase64Ponyfill(b64, alphabet) {
		const bytes = (0, from_string_1.fromString)(b64, alphabet);
		return textDecoder.decode(bytes);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/utf8-grapheme-len.js
var require_utf8_grapheme_len = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.graphemeLenNative = void 0;
	exports.graphemeLenPonyfill = graphemeLenPonyfill;
	var grapheme_1 = require_grapheme();
	var segmenter = "Segmenter" in Intl && typeof Intl.Segmenter === "function" ? /*#__PURE__*/ new Intl.Segmenter() : /* v8 ignore next -- @preserve */ null;
	exports.graphemeLenNative = segmenter ? function graphemeLenNative(str) {
		let length = 0;
		for (const _ of segmenter.segment(str)) length++;
		return length;
	} : /* v8 ignore next -- @preserve */ null;
	function graphemeLenPonyfill(str) {
		return (0, grapheme_1.countGraphemes)(str);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/utf8-len.js
var require_utf8_len = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8LenNode = void 0;
	exports.utf8LenCompute = utf8LenCompute;
	var nodejs_buffer_js_1 = require_nodejs_buffer();
	exports.utf8LenNode = nodejs_buffer_js_1.NodeJSBuffer ? function utf8LenNode(string) {
		return nodejs_buffer_js_1.NodeJSBuffer.byteLength(string, "utf8");
	} : /* v8 ignore next -- @preserve */ null;
	function utf8LenCompute(string) {
		let len = string.length;
		let code;
		for (let i = 0; i < string.length; i += 1) {
			code = string.charCodeAt(i);
			if (code <= 127) {} else if (code <= 2047) len += 1;
			else {
				len += 2;
				if (code >= 55296 && code <= 56319) {
					code = string.charCodeAt(i + 1);
					if (code >= 56320 && code <= 57343) i++;
				}
			}
		}
		return len;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/utf8-to-base64.js
var require_utf8_to_base64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8ToBase64Node = void 0;
	exports.utf8ToBase64Ponyfill = utf8ToBase64Ponyfill;
	var to_string_1 = (init_to_string(), __toCommonJS(to_string_exports));
	var nodejs_buffer_js_1 = require_nodejs_buffer();
	var uint8array_to_base64_js_1 = require_uint8array_to_base64();
	var Buffer = nodejs_buffer_js_1.NodeJSBuffer;
	exports.utf8ToBase64Node = Buffer ? function utf8ToBase64Node(text, alphabet) {
		const buffer = Buffer.from(text, "utf8");
		return uint8array_to_base64_js_1.toBase64Node(buffer, alphabet);
	} : /* v8 ignore next -- @preserve */ null;
	var textEncoder = /*#__PURE__*/ new TextEncoder();
	function utf8ToBase64Ponyfill(text, alphabet) {
		const bytes = textEncoder.encode(text);
		return (0, to_string_1.toString)(bytes, alphabet);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/utf8.js
var require_utf8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8FromBase64 = exports.utf8ToBase64 = exports.utf8Len = exports.graphemeLen = void 0;
	var utf8_from_base64_js_1 = require_utf8_from_base64();
	var utf8_grapheme_len_js_1 = require_utf8_grapheme_len();
	var utf8_len_js_1 = require_utf8_len();
	var utf8_to_base64_js_1 = require_utf8_to_base64();
	/**
	* Counts the number of grapheme clusters (user-perceived characters) in a string.
	*
	* Grapheme clusters represent what users typically think of as "characters",
	* handling complex cases like:
	* - Emoji with skin tones and ZWJ sequences (e.g., family emoji)
	* - Combined characters (e.g., 'e' + combining accent)
	* - Regional indicator pairs (flag emoji)
	*
	* Uses native {@link Intl.Segmenter} when available, falling back to a ponyfill.
	*
	* @param str - The string to measure
	* @returns The number of grapheme clusters
	*
	* @example
	* ```typescript
	* import { graphemeLen } from '@atproto/lex-data'
	*
	* graphemeLen('hello')        // 5
	* graphemeLen('cafe\u0301')   // 4 (cafe with combining accent)
	* graphemeLen('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 1 (family emoji)
	* ```
	*/
	exports.graphemeLen = utf8_grapheme_len_js_1.graphemeLenNative ?? utf8_grapheme_len_js_1.graphemeLenPonyfill;
	/* v8 ignore next -- @preserve */
	if (exports.graphemeLen === utf8_grapheme_len_js_1.graphemeLenPonyfill) {}
	/**
	* Calculates the UTF-8 byte length of a string.
	*
	* Returns the number of bytes the string would occupy when encoded as UTF-8.
	* This is important for Lexicon validation where schemas specify byte limits.
	*
	* Uses Node.js Buffer.byteLength when available for performance,
	* falling back to a computed implementation.
	*
	* @param str - The string to measure
	* @returns The UTF-8 byte length
	*
	* @example
	* ```typescript
	* import { utf8Len } from '@atproto/lex-data'
	*
	* utf8Len('hello')      // 5 (ASCII: 1 byte per char)
	* utf8Len('\u00e9')     // 2 (e with accent: 2 bytes)
	* utf8Len('\u{1F600}')  // 4 (emoji: 4 bytes)
	* utf8Len('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}')  // 25 (family emoji)
	* ```
	*/
	exports.utf8Len = utf8_len_js_1.utf8LenNode ?? utf8_len_js_1.utf8LenCompute;
	/**
	* Encodes a UTF-8 string to base64.
	*
	* First encodes the string as UTF-8 bytes, then encodes those bytes as base64.
	*
	* @param str - The string to encode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The base64-encoded string
	*
	* @example
	* ```typescript
	* import { utf8ToBase64 } from '@atproto/lex-data'
	*
	* utf8ToBase64('Hello')  // 'SGVsbG8='
	* ```
	*/
	exports.utf8ToBase64 = utf8_to_base64_js_1.utf8ToBase64Node ?? utf8_to_base64_js_1.utf8ToBase64Ponyfill;
	/**
	* Decodes a base64 string to UTF-8.
	*
	* Decodes the base64 to bytes, then interprets those bytes as UTF-8 text.
	*
	* @param b64 - The base64 string to decode
	* @param alphabet - The base64 alphabet to use ('base64' or 'base64url')
	* @returns The decoded UTF-8 string
	*
	* @example
	* ```typescript
	* import { utf8FromBase64 } from '@atproto/lex-data'
	*
	* utf8FromBase64('SGVsbG8=')  // 'Hello'
	* ```
	*/
	exports.utf8FromBase64 = utf8_from_base64_js_1.utf8FromBase64Node ?? utf8_from_base64_js_1.utf8FromBase64Ponyfill;
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/dist/index.js
var require_dist$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_blob$1(), exports);
	tslib_1.__exportStar(require_cid(), exports);
	tslib_1.__exportStar(require_lex_equals(), exports);
	tslib_1.__exportStar(require_lex_error(), exports);
	tslib_1.__exportStar(require_lex(), exports);
	tslib_1.__exportStar(require_object(), exports);
	tslib_1.__exportStar(require_uint8array(), exports);
	tslib_1.__exportStar(require_utf8(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/defs.defs.js
var require_defs_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.commitMeta = exports.$nsid = void 0;
	var lex_schema_1 = require_dist$4();
	var $nsid = "com.atproto.repo.defs";
	exports.$nsid = $nsid;
	exports.commitMeta = /* @__PURE__ */ lex_schema_1.l.typedObject($nsid, "commitMeta", /*#__PURE__*/ lex_schema_1.l.object({
		cid: /*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }),
		rev: /*#__PURE__*/ lex_schema_1.l.string({ format: "tid" })
	}));
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/createRecord.defs.js
var require_createRecord_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$output = exports.$input = exports.$params = exports.$lxm = exports.main = exports.$nsid = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var lex_schema_1 = require_dist$4();
	var RepoDefs = tslib_1.__importStar(require_defs_defs());
	var $nsid = "com.atproto.repo.createRecord";
	exports.$nsid = $nsid;
	/** Create a single new repository record. Requires auth, implemented by PDS. */
	var main = /*#__PURE__*/ lex_schema_1.l.procedure($nsid, /*#__PURE__*/ lex_schema_1.l.params(), /*#__PURE__*/ lex_schema_1.l.jsonPayload({
		repo: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-identifier" }),
		collection: /*#__PURE__*/ lex_schema_1.l.string({ format: "nsid" }),
		rkey: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string({
			format: "record-key",
			maxLength: 512
		})),
		validate: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.boolean()),
		record: /*#__PURE__*/ lex_schema_1.l.lexMap(),
		swapCommit: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }))
	}), /*#__PURE__*/ lex_schema_1.l.jsonPayload({
		uri: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-uri" }),
		cid: /*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }),
		commit: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.ref((() => RepoDefs.commitMeta))),
		validationStatus: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string())
	}), ["InvalidSwap"]);
	exports.main = main;
	exports.$lxm = main.nsid, exports.$params = main.parameters, exports.$input = main.input, exports.$output = main.output;
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/createRecord.js
var require_createRecord = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_createRecord_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_createRecord_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/deleteRecord.defs.js
var require_deleteRecord_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$output = exports.$input = exports.$params = exports.$lxm = exports.main = exports.$nsid = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var lex_schema_1 = require_dist$4();
	var RepoDefs = tslib_1.__importStar(require_defs_defs());
	var $nsid = "com.atproto.repo.deleteRecord";
	exports.$nsid = $nsid;
	/** Delete a repository record, or ensure it doesn't exist. Requires auth, implemented by PDS. */
	var main = /*#__PURE__*/ lex_schema_1.l.procedure($nsid, /*#__PURE__*/ lex_schema_1.l.params(), /*#__PURE__*/ lex_schema_1.l.jsonPayload({
		repo: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-identifier" }),
		collection: /*#__PURE__*/ lex_schema_1.l.string({ format: "nsid" }),
		rkey: /*#__PURE__*/ lex_schema_1.l.string({ format: "record-key" }),
		swapRecord: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string({ format: "cid" })),
		swapCommit: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }))
	}), /*#__PURE__*/ lex_schema_1.l.jsonPayload({ commit: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.ref((() => RepoDefs.commitMeta))) }), ["InvalidSwap"]);
	exports.main = main;
	exports.$lxm = main.nsid, exports.$params = main.parameters, exports.$input = main.input, exports.$output = main.output;
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/deleteRecord.js
var require_deleteRecord = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_deleteRecord_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_deleteRecord_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/getRecord.defs.js
var require_getRecord_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$output = exports.$params = exports.$lxm = exports.main = exports.$nsid = void 0;
	var lex_schema_1 = require_dist$4();
	var $nsid = "com.atproto.repo.getRecord";
	exports.$nsid = $nsid;
	/** Get a single record from a repository. Does not require auth. */
	var main = /*#__PURE__*/ lex_schema_1.l.query($nsid, /*#__PURE__*/ lex_schema_1.l.params({
		repo: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-identifier" }),
		collection: /*#__PURE__*/ lex_schema_1.l.string({ format: "nsid" }),
		rkey: /*#__PURE__*/ lex_schema_1.l.string({ format: "record-key" }),
		cid: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }))
	}), /*#__PURE__*/ lex_schema_1.l.jsonPayload({
		uri: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-uri" }),
		cid: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string({ format: "cid" })),
		value: /*#__PURE__*/ lex_schema_1.l.lexMap()
	}), ["RecordNotFound"]);
	exports.main = main;
	exports.$lxm = main.nsid, exports.$params = main.parameters, exports.$output = main.output;
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/getRecord.js
var require_getRecord = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_getRecord_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_getRecord_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/listRecords.defs.js
var require_listRecords_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.record = exports.$output = exports.$params = exports.$lxm = exports.main = exports.$nsid = void 0;
	var lex_schema_1 = require_dist$4();
	var $nsid = "com.atproto.repo.listRecords";
	exports.$nsid = $nsid;
	/** List a range of records in a repository, matching a specific collection. Does not require auth. */
	var main = /*#__PURE__*/ lex_schema_1.l.query($nsid, /*#__PURE__*/ lex_schema_1.l.params({
		repo: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-identifier" }),
		collection: /*#__PURE__*/ lex_schema_1.l.string({ format: "nsid" }),
		limit: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.withDefault(/*#__PURE__*/ lex_schema_1.l.integer({
			minimum: 1,
			maximum: 100
		}), 50)),
		cursor: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string()),
		reverse: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.boolean())
	}), /*#__PURE__*/ lex_schema_1.l.jsonPayload({
		cursor: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string()),
		records: /*#__PURE__*/ lex_schema_1.l.array(/*#__PURE__*/ lex_schema_1.l.ref((() => record$0)))
	}));
	exports.main = main;
	exports.$lxm = main.nsid, exports.$params = main.parameters, exports.$output = main.output;
	var record$0 = /*#__PURE__*/ lex_schema_1.l.typedObject($nsid, "record", /*#__PURE__*/ lex_schema_1.l.object({
		uri: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-uri" }),
		cid: /*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }),
		value: /*#__PURE__*/ lex_schema_1.l.lexMap()
	}));
	exports.record = record$0;
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/listRecords.js
var require_listRecords = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_listRecords_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_listRecords_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/putRecord.defs.js
var require_putRecord_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$output = exports.$input = exports.$params = exports.$lxm = exports.main = exports.$nsid = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	var lex_schema_1 = require_dist$4();
	var RepoDefs = tslib_1.__importStar(require_defs_defs());
	var $nsid = "com.atproto.repo.putRecord";
	exports.$nsid = $nsid;
	/** Write a repository record, creating or updating it as needed. Requires auth, implemented by PDS. */
	var main = /*#__PURE__*/ lex_schema_1.l.procedure($nsid, /*#__PURE__*/ lex_schema_1.l.params(), /*#__PURE__*/ lex_schema_1.l.jsonPayload({
		repo: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-identifier" }),
		collection: /*#__PURE__*/ lex_schema_1.l.string({ format: "nsid" }),
		rkey: /*#__PURE__*/ lex_schema_1.l.string({
			format: "record-key",
			maxLength: 512
		}),
		validate: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.boolean()),
		record: /*#__PURE__*/ lex_schema_1.l.lexMap(),
		swapRecord: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.nullable(/*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }))),
		swapCommit: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }))
	}), /*#__PURE__*/ lex_schema_1.l.jsonPayload({
		uri: /*#__PURE__*/ lex_schema_1.l.string({ format: "at-uri" }),
		cid: /*#__PURE__*/ lex_schema_1.l.string({ format: "cid" }),
		commit: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.ref((() => RepoDefs.commitMeta))),
		validationStatus: /*#__PURE__*/ lex_schema_1.l.optional(/*#__PURE__*/ lex_schema_1.l.string())
	}), ["InvalidSwap"]);
	exports.main = main;
	exports.$lxm = main.nsid, exports.$params = main.parameters, exports.$input = main.input, exports.$output = main.output;
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/putRecord.js
var require_putRecord = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_putRecord_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_putRecord_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/uploadBlob.defs.js
var require_uploadBlob_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$output = exports.$input = exports.$params = exports.$lxm = exports.main = exports.$nsid = void 0;
	var lex_schema_1 = require_dist$4();
	var $nsid = "com.atproto.repo.uploadBlob";
	exports.$nsid = $nsid;
	/** Upload a new blob, to be referenced from a repository record. The blob will be deleted if it is not referenced within a time window (eg, minutes). Blob restrictions (mimetype, size, etc) are enforced when the reference is created. Requires auth, implemented by PDS. */
	var main = /*#__PURE__*/ lex_schema_1.l.procedure($nsid, /*#__PURE__*/ lex_schema_1.l.params(), /*#__PURE__*/ lex_schema_1.l.payload("*/*"), /*#__PURE__*/ lex_schema_1.l.jsonPayload({ blob: /*#__PURE__*/ lex_schema_1.l.blob({ allowLegacy: false }) }));
	exports.main = main;
	exports.$lxm = main.nsid, exports.$params = main.parameters, exports.$input = main.input, exports.$output = main.output;
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/uploadBlob.js
var require_uploadBlob = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_uploadBlob_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_uploadBlob_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo/defs.js
var require_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_defs_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_defs_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/repo.js
var require_repo = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defs = exports.uploadBlob = exports.putRecord = exports.listRecords = exports.getRecord = exports.deleteRecord = exports.createRecord = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	exports.createRecord = tslib_1.__importStar(require_createRecord());
	exports.deleteRecord = tslib_1.__importStar(require_deleteRecord());
	exports.getRecord = tslib_1.__importStar(require_getRecord());
	exports.listRecords = tslib_1.__importStar(require_listRecords());
	exports.putRecord = tslib_1.__importStar(require_putRecord());
	exports.uploadBlob = tslib_1.__importStar(require_uploadBlob());
	exports.defs = tslib_1.__importStar(require_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/sync/getBlob.defs.js
var require_getBlob_defs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$output = exports.$params = exports.$lxm = exports.main = exports.$nsid = void 0;
	var lex_schema_1 = require_dist$4();
	var $nsid = "com.atproto.sync.getBlob";
	exports.$nsid = $nsid;
	/** Get a blob associated with a given account. Returns the full blob as originally uploaded. Does not require auth; implemented by PDS. */
	var main = /*#__PURE__*/ lex_schema_1.l.query($nsid, /*#__PURE__*/ lex_schema_1.l.params({
		did: /*#__PURE__*/ lex_schema_1.l.string({ format: "did" }),
		cid: /*#__PURE__*/ lex_schema_1.l.string({ format: "cid" })
	}), /*#__PURE__*/ lex_schema_1.l.payload("*/*"), [
		"BlobNotFound",
		"RepoNotFound",
		"RepoTakendown",
		"RepoSuspended",
		"RepoDeactivated"
	]);
	exports.main = main;
	exports.$lxm = main.nsid, exports.$params = main.parameters, exports.$output = main.output;
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/sync/getBlob.js
var require_getBlob = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.$defs = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_getBlob_defs(), exports);
	exports.$defs = tslib_1.__importStar(require_getBlob_defs());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto/sync.js
var require_sync = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getBlob = void 0;
	exports.getBlob = (init_tslib_es6(), __toCommonJS(tslib_es6_exports)).__importStar(require_getBlob());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com/atproto.js
var require_atproto = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sync = exports.repo = void 0;
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	exports.repo = tslib_1.__importStar(require_repo());
	exports.sync = tslib_1.__importStar(require_sync());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/com.js
var require_com = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.atproto = void 0;
	exports.atproto = (init_tslib_es6(), __toCommonJS(tslib_es6_exports)).__importStar(require_atproto());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/lexicons/index.js
var require_lexicons = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.com = void 0;
	exports.com = (init_tslib_es6(), __toCommonJS(tslib_es6_exports)).__importStar(require_com());
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isBlobLike = isBlobLike;
	exports.isAsyncIterable = isAsyncIterable;
	exports.buildAtprotoHeaders = buildAtprotoHeaders;
	exports.toReadableStream = toReadableStream;
	/**
	* Type guard to check if a value is {@link Blob}-like.
	*
	* Handles both native Blobs and polyfilled Blob implementations
	* (e.g., fetch-blob from node-fetch).
	*
	* @param value - The value to check
	* @returns `true` if the value is a Blob or Blob-like object
	*/
	function isBlobLike(value) {
		if (value == null) return false;
		if (typeof value !== "object") return false;
		if (typeof Blob === "function" && value instanceof Blob) return true;
		const tag = value[Symbol.toStringTag];
		if (tag === "Blob" || tag === "File") return "stream" in value && typeof value.stream === "function";
		return false;
	}
	function isAsyncIterable(value) {
		return value != null && typeof value[Symbol.asyncIterator] === "function";
	}
	/**
	* Builds HTTP headers for AT Protocol requests.
	*
	* Adds the following headers when applicable:
	* - `atproto-proxy`: Service routing header (if service is specified)
	* - `atproto-accept-labelers`: Comma-separated list of labeler DIDs
	*
	* @param options - Header building options
	* @param options.headers - Base headers to include
	* @param options.service - Service proxy identifier
	* @param options.labelers - Labeler DIDs to request labels from
	* @returns A new Headers object with AT Protocol headers added
	*/
	function buildAtprotoHeaders(options) {
		const headers = new Headers(options?.headers);
		if (options.service && !headers.has("atproto-proxy")) headers.set("atproto-proxy", options.service);
		if (options.labelers) headers.set("atproto-accept-labelers", [...options.labelers, headers.get("atproto-accept-labelers")?.trim()].filter(Boolean).join(", "));
		return headers;
	}
	function toReadableStream(data) {
		if ("from" in ReadableStream && typeof ReadableStream.from === "function") return ReadableStream.from(data);
		let iterator;
		return new ReadableStream({
			async pull(controller) {
				try {
					iterator ??= data[Symbol.asyncIterator]();
					const result = await iterator.next();
					if (result.done) controller.close();
					else controller.enqueue(result.value);
				} catch (err) {
					controller.error(err);
					iterator = void 0;
				}
			},
			async cancel() {
				await iterator?.return?.();
				iterator = void 0;
			}
		});
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/dist/bytes.js
var require_bytes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLexBytes = parseLexBytes;
	exports.encodeLexBytes = encodeLexBytes;
	var lex_data_1 = require_dist$3();
	/**
	* Parses a `{$bytes: string}` JSON object into a `Uint8Array`.
	*
	* In the AT Protocol data model, binary data is represented in JSON as an object
	* with a single `$bytes` property containing a base64-encoded string. This function
	* decodes that representation back into raw bytes.
	*
	* @param input - An object potentially containing a `$bytes` property
	* @returns The decoded `Uint8Array` if the input is a valid `$bytes` object,
	*          or `undefined` if the input is not a valid `$bytes` representation
	*
	* @example
	* ```typescript
	* // Parse a $bytes object to Uint8Array
	* const bytes = parseLexBytes({ $bytes: 'SGVsbG8sIHdvcmxkIQ==' })
	* // bytes is Uint8Array containing "Hello, world!"
	*
	* // Returns undefined for non-$bytes objects
	* const result = parseLexBytes({ foo: 'bar' })
	* // result is undefined
	*
	* // Returns undefined for objects with extra properties
	* const invalid = parseLexBytes({ $bytes: 'SGVsbG8=', extra: true })
	* // invalid is undefined
	* ```
	*/
	function parseLexBytes(input) {
		if (!input || !("$bytes" in input)) return;
		for (const key in input) if (key !== "$bytes") return;
		if (typeof input.$bytes !== "string") return;
		try {
			return (0, lex_data_1.fromBase64)(input.$bytes);
		} catch {
			return;
		}
	}
	/**
	* Encodes a `Uint8Array` into a `{$bytes: string}` JSON representation.
	*
	* In the AT Protocol data model, binary data is represented in JSON as an object
	* with a single `$bytes` property containing a base64-encoded string. This function
	* performs that encoding.
	*
	* @param bytes - The binary data to encode
	* @returns An object with a `$bytes` property containing the base64-encoded data
	*
	* @example
	* ```typescript
	* const bytes = new TextEncoder().encode('Hello, world!')
	* const encoded = encodeLexBytes(bytes)
	* // encoded is { $bytes: 'SGVsbG8sIHdvcmxkIQ==' }
	* ```
	*/
	function encodeLexBytes(bytes) {
		return { $bytes: (0, lex_data_1.toBase64)(bytes) };
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/dist/json.js
var require_json = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/dist/link.js
var require_link = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseLexLink = parseLexLink;
	exports.encodeLexLink = encodeLexLink;
	var lex_data_1 = require_dist$3();
	function parseLexLink(input, options) {
		if (!input || !("$link" in input)) return;
		for (const key in input) if (key !== "$link") return;
		const { $link } = input;
		if (typeof $link !== "string") return;
		if ($link.length === 0) return;
		if ($link.length > 2048) return;
		try {
			return (0, lex_data_1.parseCid)($link, options);
		} catch (cause) {
			return;
		}
	}
	/**
	* Encodes a {@link Cid} instance into a `{$link: string}` JSON representation.
	*
	* In the AT Protocol data model, CID references are represented in JSON as an
	* object with a single `$link` property containing a base32-encoded CID string,
	* prefixed with "b". This function performs that encoding.
	*
	* @param cid - The CID to encode
	* @returns An object with a `$link` property containing the string representation of the CID
	*
	* @example
	* ```typescript
	* const cid = CID.parse('bafyreib2rxk3rybloqtqwbo')
	* const encoded = encodeLexLink(cid)
	* // encoded is { $link: 'bafyreib2rxk3rybloqtqwbo' }
	* ```
	*/
	function encodeLexLink(cid) {
		return { $link: cid.toString() };
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/dist/blob.js
var require_blob = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseBlobRef = parseBlobRef;
	var lex_data_1 = require_dist$3();
	var link_js_1 = require_link();
	/**
	* Parses a blob reference from a JSON object.
	*
	* In the AT Protocol, blobs are referenced using a specific object structure
	* with `$type: 'blob'`, a `ref` property containing a CID link, and metadata
	* like `mimeType` and `size`. This function validates and parses such objects
	* into `BlobRef` instances.
	*
	* The function handles both cases where the `ref` property is:
	* - A `{$link: string}` object (when parsing from JSON)
	* - Already a `Cid` instance (when the parent object has been partially converted)
	*
	* @param input - A Lex map potentially representing a blob reference
	* @param options - Optional blob reference validation options
	* @returns The parsed `BlobRef` if the input is a valid blob reference,
	*          or `undefined` if the input is not a valid blob representation
	*
	* @example
	* ```typescript
	* // Parse a blob reference from JSON
	* const blobRef = parseBlobRef({
	*   $type: 'blob',
	*   ref: { $link: 'bafyreib2rxk3rybloqtqwbo' },
	*   mimeType: 'image/png',
	*   size: 12345
	* })
	*
	* // blobRef.ref is a Cid instance
	*
	* // Returns undefined for non-blob objects
	* const result = parseBlobRef({ foo: 'bar' })
	* // result is undefined
	* ```
	*/
	function parseBlobRef(input, options) {
		if (input.$type !== "blob") return void 0;
		const ref = input?.ref;
		if (!ref || typeof ref !== "object") return void 0;
		if ("$link" in ref) {
			const cid = (0, link_js_1.parseLexLink)(ref);
			if (!cid) return void 0;
			const blob = {
				...input,
				ref: cid
			};
			if ((0, lex_data_1.isBlobRef)(blob, options)) return blob;
		}
		if ((0, lex_data_1.isBlobRef)(input)) return input;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/dist/lex-json.js
var require_lex_json = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lexStringify = lexStringify;
	exports.lexParse = lexParse;
	exports.jsonToLex = jsonToLex;
	exports.lexToJson = lexToJson;
	var lex_data_1 = require_dist$3();
	var blob_js_1 = require_blob();
	var bytes_js_1 = require_bytes();
	var link_js_1 = require_link();
	/**
	* Serialize a Lex value to a JSON string.
	*
	* This function serializes AT Protocol data model values to JSON, automatically
	* encoding special types:
	* - `Cid` instances are encoded as `{$link: string}`
	* - `Uint8Array` instances are encoded as `{$bytes: string}` (base64)
	*
	* @param input - The Lex value to stringify
	* @returns A JSON string representation of the value
	*
	* @example
	* ```typescript
	* import { lexStringify } from '@atproto/lex'
	*
	* // Stringify with CID and bytes encoding
	* const json = lexStringify({
	*   ref: someCid,
	*   data: new Uint8Array([72, 101, 108, 108, 111])
	* })
	* // json is '{"ref":{"$link":"bafyrei..."},"data":{"$bytes":"SGVsbG8="}}'
	* ```
	*/
	function lexStringify(input) {
		return JSON.stringify(lexToJson(input));
	}
	/**
	* Parses a JSON string into Lex values.
	*
	* This function parses JSON and automatically decodes AT Protocol special types:
	* - `{$link: string}` objects are decoded to `Cid` instances
	* - `{$bytes: string}` objects are decoded to `Uint8Array` instances
	* - `{$type: 'blob'}` objects are validated
	*
	* @typeParam T - Type cast for the resulting Lex value. Use when you want to specify the expected structure of the parsed data.
	* @param input - The JSON string to parse
	* @param options - Parsing options (e.g., strict mode)
	* @returns The parsed Lex value
	* @throws {SyntaxError} If the input is not valid JSON
	* @throws {TypeError} If strict mode is enabled and invalid Lex values are found
	*
	* @example
	* ```typescript
	* import { lexParse } from '@atproto/lex'
	*
	* // Parse JSON with $link and $bytes decoding
	* const parsed = lexParse<{
	*   ref: Cid
	*   data: Uint8Array
	* }>(`{
	*   "ref": { "$link": "bafyrei..." },
	*   "data": { "$bytes": "SGVsbG8sIHdvcmxkIQ==" }
	* }`)
	*
	* // Parse a single CID
	* const someCid = lexParse<Cid>('{"$link": "bafyrei..."}')
	*
	* // Parse binary data
	* const someBytes = lexParse<Uint8Array>('{"$bytes": "SGVsbG8sIHdvcmxkIQ=="}')
	* ```
	*/
	function lexParse(input, options = { strict: false }) {
		return JSON.parse(input, function(key, value) {
			switch (typeof value) {
				case "object":
					if (value === null) return null;
					if (Array.isArray(value)) return value;
					return parseSpecialJsonObject(value, options) ?? value;
				case "number":
					if (Number.isSafeInteger(value)) return value;
					if (options.strict) throw new TypeError(`Invalid non-integer number: ${value}`);
				default: return value;
			}
		});
	}
	/**
	* Converts a parsed JSON representation of Lexicon value to a {@link LexValue}.
	*
	* This function transforms already-parsed JSON objects into Lex values by
	* decoding AT Protocol special types:
	* - `{$link: string}` objects are converted to `Cid` instances
	* - `{$bytes: string}` objects are converted to `Uint8Array` instances
	*
	* Use this when you have a JavaScript object (e.g., from `JSON.parse()`) and
	* need to convert it to the Lex data model. For parsing JSON strings directly,
	* use {@link lexParse} instead.
	*
	* @param value - The JSON value to convert
	* @param options - Parsing options (e.g., strict mode)
	* @returns The converted Lex value
	* @throws {TypeError} If strict mode is enabled and invalid Lex values are found
	* @throws {TypeError} If the value contains unsupported types (e.g., undefined at top level)
	*
	* @example
	* ```typescript
	* import { jsonToLex } from '@atproto/lex'
	*
	* // Convert parsed JSON to Lex values
	* const lex = jsonToLex({
	*   ref: { $link: 'bafyrei...' },  // Converted to Cid
	*   data: { $bytes: 'SGVsbG8sIHdvcmxkIQ==' }  // Converted to Uint8Array
	* })
	* ```
	*/
	function jsonToLex(value, options = { strict: false }) {
		switch (typeof value) {
			case "object":
				if (value === null) return null;
				if (Array.isArray(value)) return jsonArrayToLex(value, options);
				return parseSpecialJsonObject(value, options) ?? jsonObjectToLexMap(value, options);
			case "number":
				if (Number.isSafeInteger(value)) return value;
				if (options.strict) throw new TypeError(`Invalid non-integer number: ${value}`);
			case "boolean":
			case "string": return value;
			default: throw new TypeError(`Invalid JSON value: ${typeof value}`);
		}
	}
	function jsonArrayToLex(input, options) {
		let copy;
		for (let i = 0; i < input.length; i++) {
			const inputItem = input[i];
			const item = jsonToLex(inputItem, options);
			if (item !== inputItem) {
				copy ?? (copy = Array.from(input));
				copy[i] = item;
			}
		}
		return copy ?? input;
	}
	function jsonObjectToLexMap(input, options) {
		let copy = void 0;
		for (const [key, jsonValue] of Object.entries(input)) {
			if (key === "__proto__") throw new TypeError("Invalid key: __proto__");
			if (jsonValue === void 0) {
				copy ?? (copy = { ...input });
				delete copy[key];
				continue;
			}
			const value = jsonToLex(jsonValue, options);
			if (value !== jsonValue) {
				copy ?? (copy = { ...input });
				copy[key] = value;
			}
		}
		return copy ?? input;
	}
	/**
	* Converts a Lex value to a JSON-compatible value.
	*
	* This function transforms Lex data model values into plain JavaScript objects
	* suitable for JSON serialization:
	* - `Cid` instances are converted to `{$link: string}` objects
	* - `Uint8Array` instances are converted to `{$bytes: string}` objects (base64)
	*
	* Use this when you need to convert Lex values to plain objects (e.g., for
	* custom serialization or inspection). For direct JSON string output, use
	* {@link lexStringify} instead.
	*
	* @param value - The Lex value to convert
	* @returns The JSON-compatible value
	* @throws {TypeError} If the value contains unsupported types
	*
	* @example
	* ```typescript
	* import { lexToJson } from '@atproto/lex'
	*
	* // Convert Lex values to JSON-compatible objects
	* const obj = lexToJson({
	*   ref: someCid,      // Converted to { $link: string }
	*   data: someBytes    // Converted to { $bytes: string }
	* })
	* ```
	*/
	function lexToJson(value) {
		switch (typeof value) {
			case "object": if (value === null) return value;
			else if (Array.isArray(value)) return lexArrayToJson(value);
			else if ((0, lex_data_1.isCid)(value)) return (0, link_js_1.encodeLexLink)(value);
			else if (ArrayBuffer.isView(value)) return (0, bytes_js_1.encodeLexBytes)(value);
			else return encodeLexMap(value);
			case "boolean":
			case "string":
			case "number": return value;
			default: throw new TypeError(`Invalid Lex value: ${typeof value}`);
		}
	}
	function lexArrayToJson(input) {
		let copy;
		for (let i = 0; i < input.length; i++) {
			const inputItem = input[i];
			const item = lexToJson(inputItem);
			if (item !== inputItem) {
				copy ?? (copy = Array.from(input));
				copy[i] = item;
			}
		}
		return copy ?? input;
	}
	function encodeLexMap(input) {
		let copy = void 0;
		for (const [key, lexValue] of Object.entries(input)) {
			if (key === "__proto__") throw new TypeError("Invalid key: __proto__");
			if (lexValue === void 0) {
				copy ?? (copy = { ...input });
				delete copy[key];
				continue;
			}
			const jsonValue = lexToJson(lexValue);
			if (jsonValue !== lexValue) {
				copy ?? (copy = { ...input });
				copy[key] = jsonValue;
			}
		}
		return copy ?? input;
	}
	function parseSpecialJsonObject(input, options) {
		if (input.$link !== void 0) {
			const cid = (0, link_js_1.parseLexLink)(input);
			if (cid) return cid;
			if (options.strict) throw new TypeError(`Invalid $link object`);
		} else if (input.$bytes !== void 0) {
			const bytes = (0, bytes_js_1.parseLexBytes)(input);
			if (bytes) return bytes;
			if (options.strict) throw new TypeError(`Invalid $bytes object`);
		} else if (input.$type !== void 0) {
			if (options.strict) {
				if (input.$type === "blob") {
					const blob = (0, blob_js_1.parseBlobRef)(input, options);
					if (blob) return blob;
					throw new TypeError(`Invalid blob object`);
				} else if (typeof input.$type !== "string") throw new TypeError(`Invalid $type property (${typeof input.$type})`);
				else if (input.$type.length === 0) throw new TypeError(`Empty $type property`);
			}
		}
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/dist/index.js
var require_dist$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_bytes(), exports);
	tslib_1.__exportStar(require_json(), exports);
	tslib_1.__exportStar(require_lex_json(), exports);
	tslib_1.__exportStar(require_link(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/www-authenticate.js
var require_www_authenticate = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseWWWAuthenticateHeader = parseWWWAuthenticateHeader;
	/**
	* Returns `undefined` if the header is malformed.
	*/
	function parseWWWAuthenticateHeader(header) {
		if (typeof header !== "string") return void 0;
		const wwwAuthenticate = {};
		const trimmedHeader = header.trim();
		if (!trimmedHeader) return wwwAuthenticate;
		const parts = trimmedHeader.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
		let currentParams = null;
		for (let part of parts) {
			const schemeMatch = part.trim().match(/^([^"=\s]+)(\s+.*)?$/);
			if (schemeMatch) {
				const scheme = schemeMatch[1];
				if (Object.hasOwn(wwwAuthenticate, scheme)) return void 0;
				const rest = schemeMatch[2]?.trim();
				if (!rest) {
					currentParams = null;
					wwwAuthenticate[scheme] = Object.create(null);
					continue;
				}
				if (!rest.includes("=")) {
					currentParams = null;
					wwwAuthenticate[scheme] = rest;
					continue;
				}
				currentParams = Object.create(null);
				wwwAuthenticate[scheme] = currentParams;
				part = rest;
			}
			if (!currentParams) return void 0;
			const param = part.match(/^\s*([^"\s=]+)=(?:("[^"\\]*(?:\\.[^"\\]*)*")|([^\s,"]*))\s*$/);
			if (!param) return void 0;
			const paramName = param[1];
			const paramValue = param[3] ?? param[2].slice(1, -1).replaceAll(/\\(.)/g, "$1");
			currentParams[paramName] = paramValue;
		}
		return wwwAuthenticate;
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.XrpcInternalError = exports.XrpcUpstreamError = exports.XrpcAuthenticationError = exports.XrpcResponseError = exports.XrpcError = exports.LexError = exports.RETRYABLE_HTTP_STATUS_CODES = void 0;
	exports.isXrpcErrorPayload = isXrpcErrorPayload;
	exports.asXrpcFailure = asXrpcFailure;
	var lex_data_1 = require_dist$3();
	Object.defineProperty(exports, "LexError", {
		enumerable: true,
		get: function() {
			return lex_data_1.LexError;
		}
	});
	var lex_schema_1 = require_dist$4();
	var www_authenticate_js_1 = require_www_authenticate();
	/**
	* HTTP status codes that indicate a transient error that may succeed on retry.
	*
	* Includes:
	* - 408 Request Timeout
	* - 425 Too Early
	* - 429 Too Many Requests (rate limited)
	* - 500 Internal Server Error
	* - 502 Bad Gateway
	* - 503 Service Unavailable
	* - 504 Gateway Timeout
	* - 522 Connection Timed Out (Cloudflare)
	* - 524 A Timeout Occurred (Cloudflare)
	*/
	exports.RETRYABLE_HTTP_STATUS_CODES = /* @__PURE__ */ new Set([
		408,
		425,
		429,
		500,
		502,
		503,
		504,
		522,
		524
	]);
	/**
	* All unsuccessful responses should follow a standard error response
	* schema. The Content-Type should be application/json, and the payload
	* should be a JSON object with the following fields:
	*
	* - `error` (string, required): type name of the error (generic ASCII
	*   constant, no whitespace)
	* - `message` (string, optional): description of the error, appropriate for
	*   display to humans
	*
	* This function checks whether a given payload matches this schema.
	*/
	function isXrpcErrorPayload(payload) {
		return payload != null && payload.encoding === "application/json" && lex_schema_1.lexErrorDataSchema.matches(payload.body);
	}
	/**
	* Abstract base class for all XRPC errors.
	*
	* Extends {@link LexError} and implements {@link ResultFailure} for use with
	* safe/result-based error handling patterns.
	*
	* @typeParam M - The XRPC method type (Procedure or Query)
	* @typeParam N - The error code type
	* @typeParam TReason - The reason type for ResultFailure
	*
	* @see {@link XrpcResponseError} - For valid XRPC error responses
	* @see {@link XrpcUpstreamError} - For invalid/unexpected responses
	* @see {@link XrpcInternalError} - For network/internal errors
	*/
	var XrpcError = class extends lex_data_1.LexError {
		method;
		name = "XrpcError";
		constructor(method, error, message = `${error} Lexicon RPC error`, options) {
			super(error, message, options);
			this.method = method;
		}
		/**
		* @see {@link ResultFailure.success}
		*/
		success = false;
		matchesSchema() {
			return this.method.errors?.includes(this.error) ?? false;
		}
	};
	exports.XrpcError = XrpcError;
	/**
	* Error class for valid XRPC error responses from the server.
	*
	* This represents a properly formatted XRPC error where the server returned
	* a non-2xx status with a valid JSON error payload containing `error` and
	* optional `message` fields.
	*
	* Use {@link matchesSchema} to check if the error matches the method's declared
	* error types for type-safe error handling.
	*
	* @typeParam M - The XRPC method type
	* @typeParam N - The error code type (inferred from method or generic)
	*
	* @example Handling specific errors
	* ```typescript
	* try {
	*   await client.xrpc(someMethod, options)
	* } catch (err) {
	*   if (err instanceof XrpcResponseError && err.error === 'RecordNotFound') {
	*     // Handle not found case
	*   }
	* }
	* ```
	*/
	var XrpcResponseError = class extends XrpcError {
		response;
		payload;
		name = "XrpcResponseError";
		constructor(method, response, payload, options) {
			const { error, message } = payload.body;
			super(method, error, message, options);
			this.response = response;
			this.payload = payload;
		}
		get reason() {
			return this;
		}
		shouldRetry() {
			return exports.RETRYABLE_HTTP_STATUS_CODES.has(this.response.status);
		}
		toJSON() {
			return this.payload.body;
		}
		toResponse() {
			if (this.matchesSchema()) {
				const status = this.response.status >= 500 ? 502 : this.response.status;
				return Response.json(this.toJSON(), { status });
			}
			return this.response.status >= 500 ? Response.json({ error: "UpstreamFailure" }, { status: 502 }) : Response.json({ error: "InternalServerError" }, { status: 500 });
		}
		get body() {
			return this.payload.body;
		}
	};
	exports.XrpcResponseError = XrpcResponseError;
	/**
	* Error class for 401 Unauthorized XRPC responses.
	*
	* Extends {@link XrpcResponseError} with access to parsed WWW-Authenticate header
	* information, useful for implementing authentication flows.
	*
	* Authentication errors are never retryable as they require user intervention
	* (e.g., re-authentication, token refresh).
	*
	* @typeParam M - The XRPC method type
	* @typeParam N - The error code type
	*
	* @example Handling authentication errors
	* ```typescript
	* try {
	*   await client.xrpc(someMethod, options)
	* } catch (err) {
	*   if (err instanceof XrpcAuthenticationError) {
	*     const { DPoP } = err.wwwAuthenticate
	*     if (DPoP?.error === 'use_dpop_nonce') {
	*       // Handle DPoP nonce requirement
	*     }
	*   }
	* }
	* ```
	*/
	var XrpcAuthenticationError = class extends XrpcResponseError {
		name = "XrpcAuthenticationError";
		shouldRetry() {
			return false;
		}
		#wwwAuthenticateCached;
		/**
		* Parsed WWW-Authenticate header from the response.
		* Contains authentication scheme parameters (e.g., Bearer realm, DPoP nonce).
		*/
		get wwwAuthenticate() {
			return this.#wwwAuthenticateCached ??= (0, www_authenticate_js_1.parseWWWAuthenticateHeader)(this.response.headers.get("www-authenticate")) ?? {};
		}
	};
	exports.XrpcAuthenticationError = XrpcAuthenticationError;
	/**
	* Error class for invalid or unprocessable XRPC responses from upstream servers.
	*
	* This occurs when the server returns a response that doesn't conform to the
	* XRPC protocol, such as:
	* - Missing or invalid Content-Type header
	* - Response body that doesn't match the method's output schema
	* - Non-JSON error responses
	* - Responses from non-XRPC endpoints
	*
	* The error code is always 'UpstreamFailure' and maps to HTTP 502 Bad Gateway
	* when converted to a response.
	*
	* @typeParam M - The XRPC method type
	*/
	var XrpcUpstreamError = class extends XrpcError {
		response;
		payload;
		name = "XrpcUpstreamError";
		constructor(method, response, payload = null, message = `Unexpected upstream XRPC response`, options) {
			super(method, "UpstreamFailure", message, options);
			this.response = response;
			this.payload = payload;
		}
		get reason() {
			return this;
		}
		shouldRetry() {
			return exports.RETRYABLE_HTTP_STATUS_CODES.has(this.response.status);
		}
		toResponse() {
			return Response.json(this.toJSON(), { status: 502 });
		}
	};
	exports.XrpcUpstreamError = XrpcUpstreamError;
	/**
	* Error class for internal/client-side errors during XRPC requests.
	*
	* This represents errors that occur before or during the request that are not
	* server responses, such as:
	* - Network errors (connection refused, DNS failure)
	* - Request timeouts
	* - Request aborted via AbortSignal
	* - Invalid request construction
	*
	* The error code is always 'InternalServerError' and these errors are
	* optimistically considered retryable.
	*
	* @typeParam M - The XRPC method type
	*/
	var XrpcInternalError = class extends XrpcError {
		name = "XrpcInternalError";
		constructor(method, message, options) {
			super(method, "InternalServerError", message ?? "Unable to fulfill XRPC request", options);
		}
		get reason() {
			return this;
		}
		shouldRetry() {
			return true;
		}
		toResponse() {
			return Response.json({ error: this.error }, { status: 500 });
		}
	};
	exports.XrpcInternalError = XrpcInternalError;
	/**
	* Converts an unknown error into an appropriate {@link XrpcFailure} type.
	*
	* If the error is already an XrpcFailure for the given method, returns it as-is.
	* Otherwise, wraps it in an {@link XrpcInternalError}.
	*
	* @param method - The XRPC method that was called
	* @param cause - The error to convert
	* @returns An XrpcFailure instance
	*
	* @example
	* ```typescript
	* try {
	*   const response = await fetch(...)
	*   // ... process response
	* } catch (err) {
	*   return asXrpcFailure(method, err)
	* }
	* ```
	*/
	function asXrpcFailure(method, cause) {
		if (cause instanceof XrpcResponseError || cause instanceof XrpcUpstreamError || cause instanceof XrpcInternalError) {
			if (cause.method === method) return cause;
		}
		return new XrpcInternalError(method, void 0, { cause });
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/response.js
var require_response = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.XrpcResponse = void 0;
	var lex_json_1 = require_dist$2();
	var errors_js_1 = require_errors();
	var CONTENT_TYPE_BINARY = "application/octet-stream";
	var CONTENT_TYPE_JSON = "application/json";
	exports.XrpcResponse = class XrpcResponse {
		method;
		status;
		headers;
		payload;
		/** @see {@link ResultSuccess.success} */
		success = true;
		/** @see {@link ResultSuccess.value} */
		get value() {
			return this;
		}
		constructor(method, status, headers, payload) {
			this.method = method;
			this.status = status;
			this.headers = headers;
			this.payload = payload;
		}
		/**
		* Whether the response payload was parsed as {@link LexValue} (`true`) or is
		* in binary form {@link Uint8Array} (`false`).
		*/
		get isParsed() {
			return this.method.output.encoding === CONTENT_TYPE_JSON;
		}
		/**
		* The Content-Type encoding of the response (e.g., 'application/json').
		* Returns `undefined` if the response has no body.
		*/
		get encoding() {
			return this.payload?.encoding;
		}
		/**
		* The parsed response body.
		*
		* For 'application/json' responses, this is the parsed and validated LexValue.
		* For binary responses, this is a Uint8Array.
		* Returns `undefined` if the response has no body.
		*/
		get body() {
			return this.payload?.body;
		}
		/**
		* @throws {XrpcResponseError} in case of (valid) XRPC error responses. Use
		* {@link XrpcResponseError.matchesSchema} to narrow the error type based on
		* the method's declared error schema. This can be narrowed further as a
		* {@link XrpcAuthenticationError} if the error is an authentication error.
		* @throws {XrpcUpstreamError} when the response is not a valid XRPC
		* response, or if the response does not conform to the method's schema.
		*/
		static async fromFetchResponse(method, response, options) {
			if (response.status < 200 || response.status >= 300) {
				const payload = await readPayload(response, { parse: true }).catch((cause) => {
					throw new errors_js_1.XrpcUpstreamError(method, response, null, "Unable to parse response payload", { cause });
				});
				if (response.status >= 400 && (0, errors_js_1.isXrpcErrorPayload)(payload)) throw response.status === 401 ? new errors_js_1.XrpcAuthenticationError(method, response, payload) : new errors_js_1.XrpcResponseError(method, response, payload);
				throw new errors_js_1.XrpcUpstreamError(method, response, payload, response.status >= 500 ? "Upstream server encountered an error" : response.status >= 400 ? "Invalid response payload" : "Invalid response status code");
			}
			const payload = await readPayload(response, { parse: method.output.encoding === CONTENT_TYPE_JSON }).catch((cause) => {
				throw new errors_js_1.XrpcUpstreamError(method, response, null, "Unable to parse response payload", { cause });
			});
			if (method.output.encoding == null) {
				if (payload) throw new errors_js_1.XrpcUpstreamError(method, response, payload, `Expected response with no body, got ${payload.encoding}`);
			} else {
				if (!payload || !method.output.matchesEncoding(payload.encoding)) throw new errors_js_1.XrpcUpstreamError(method, response, payload, payload ? `Expected ${method.output.encoding} response, got ${payload.encoding}` : `Expected non-empty response with content-type ${method.output.encoding}`);
				if (method.output.schema && options?.validateResponse !== false) {
					const result = method.output.schema.safeParse(payload.body);
					if (!result.success) throw new errors_js_1.XrpcUpstreamError(method, response, payload, `Response validation failed: ${result.reason.message}`, { cause: result.reason });
				}
			}
			return new XrpcResponse(method, response.status, response.headers, payload);
		}
	};
	/**
	* @note this function always consumes the response body
	*/
	async function readPayload(response, options) {
		const encoding = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
		if (!encoding) {
			const body = await response.arrayBuffer();
			if (body.byteLength === 0) return void 0;
			return {
				encoding: CONTENT_TYPE_BINARY,
				body: new Uint8Array(body)
			};
		}
		if (options?.parse && encoding === CONTENT_TYPE_JSON) {
			const text = await response.text();
			return {
				encoding,
				body: (0, lex_json_1.lexParse)(text)
			};
		}
		return {
			encoding,
			body: new Uint8Array(await response.arrayBuffer())
		};
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/xrpc.js
var require_xrpc = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.xrpc = xrpc;
	exports.xrpcSafe = xrpcSafe;
	var lex_data_1 = require_dist$3();
	var lex_json_1 = require_dist$2();
	var lex_schema_1 = require_dist$4();
	var errors_js_1 = require_errors();
	var response_js_1 = require_response();
	var util_js_1 = require_util();
	async function xrpc(agent, ns, options = {}) {
		const response = await xrpcSafe(agent, ns, options);
		if (response.success) return response;
		else throw response;
	}
	async function xrpcSafe(agent, ns, options = {}) {
		options.signal?.throwIfAborted();
		const method = (0, lex_schema_1.getMain)(ns);
		try {
			const url = xrpcRequestUrl(method, options);
			const request = xrpcRequestInit(method, options);
			const response = await agent.fetchHandler(url, request);
			return await response_js_1.XrpcResponse.fromFetchResponse(method, response, options);
		} catch (cause) {
			return (0, errors_js_1.asXrpcFailure)(method, cause);
		}
	}
	function xrpcRequestUrl(method, options) {
		const path = `/xrpc/${method.nsid}`;
		const queryString = method.parameters?.toURLSearchParams(options.params ?? {}).toString();
		return queryString ? `${path}?${queryString}` : path;
	}
	function xrpcRequestInit(schema, options) {
		const headers = (0, util_js_1.buildAtprotoHeaders)(options);
		if (schema.output.encoding) headers.set("accept", schema.output.encoding);
		if (headers.has("content-type")) {
			const contentType = headers.get("content-type");
			throw new TypeError(`Unexpected content-type header (${contentType})`);
		}
		if ("input" in schema) {
			const encodingHint = options.encoding;
			const input = xrpcProcedureInput(schema, options, encodingHint);
			if (input) headers.set("content-type", input.encoding);
			else if (encodingHint != null) throw new TypeError(`Unexpected encoding hint (${encodingHint})`);
			return {
				duplex: "half",
				redirect: "follow",
				referrerPolicy: "strict-origin-when-cross-origin",
				mode: "cors",
				signal: options.signal,
				method: "POST",
				headers,
				body: input?.body
			};
		}
		return {
			duplex: "half",
			redirect: "follow",
			referrerPolicy: "strict-origin-when-cross-origin",
			mode: "cors",
			signal: options.signal,
			method: "GET",
			headers
		};
	}
	function xrpcProcedureInput(method, options, encodingHint) {
		const { input } = method;
		const { body } = options;
		if (options.validateRequest) input.schema?.check(body);
		if (input.encoding === "application/json") {
			if (!(0, lex_data_1.isLexScalar)(body) && !(0, lex_data_1.isPlainObject)(body) && !Array.isArray(body)) throw new TypeError(`Expected LexValue body, got ${typeof body}`);
			return buildPayload(input, (0, lex_json_1.lexStringify)(body), encodingHint);
		}
		switch (typeof body) {
			case "undefined":
			case "string": return buildPayload(input, body, encodingHint);
			case "object":
				if (body === null) break;
				if (ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof ReadableStream) return buildPayload(input, body, encodingHint);
				else if ((0, util_js_1.isAsyncIterable)(body)) return buildPayload(input, (0, util_js_1.toReadableStream)(body), encodingHint);
				else if ((0, util_js_1.isBlobLike)(body)) return buildPayload(input, body, encodingHint || body.type);
		}
		throw new TypeError(`Invalid ${typeof body} body for ${input.encoding} encoding`);
	}
	function buildPayload(schema, body, encodingHint) {
		if (schema.encoding === void 0) {
			if (body !== void 0) throw new TypeError(`Cannot send a ${typeof body} body with undefined encoding`);
			return null;
		}
		if (body === void 0) throw new TypeError(`A request body is expected but none was provided`);
		return {
			encoding: buildEncoding(schema, encodingHint),
			body
		};
	}
	function buildEncoding(schema, encodingHint) {
		if (!schema.encoding) throw new TypeError("Unexpected payload");
		if (encodingHint?.length) {
			if (!schema.matchesEncoding(encodingHint)) throw new TypeError(`Cannot send a body with content-type "${encodingHint}" for "${schema.encoding}" encoding`);
			return encodingHint;
		}
		if (schema.encoding === "*/*") return "application/octet-stream";
		if (schema.encoding.startsWith("text/")) return schema.encoding.includes("*") ? "text/plain; charset=utf-8" : `${schema.encoding}; charset=utf-8`;
		if (!schema.encoding.includes("*")) return schema.encoding;
		throw new TypeError(`Unable to determine payload encoding. Please provide a 'content-type' header matching ${schema.encoding}.`);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Client = void 0;
	var lex_data_1 = require_dist$3();
	var lex_schema_1 = require_dist$4();
	var agent_js_1 = require_agent();
	var index_js_1 = require_lexicons();
	var util_js_1 = require_util();
	var xrpc_js_1 = require_xrpc();
	/**
	* The Client class is the primary interface for interacting with AT Protocol
	* services. It provides type-safe methods for XRPC calls, record operations,
	* and blob handling.
	*
	* @example Basic usage
	* ```typescript
	* import { Client } from '@atproto/lex'
	*
	* const client = new Client(agent)
	* const response = await client.xrpc(app.bsky.feed.getTimeline.main, {
	*   params: { limit: 50 }
	* })
	* ```
	*/
	var Client = class {
		static appLabelers = [];
		/**
		* Configures the Client (or its sub classes) globally.
		*/
		static configure(opts) {
			if (opts.appLabelers) this.appLabelers = [...opts.appLabelers];
		}
		/** The underlying agent used for making requests. */
		agent;
		/** Custom headers included in all requests. */
		headers;
		/** Optional service identifier for routing requests. */
		service;
		/** Set of labeler DIDs specific to this client instance. */
		labelers;
		constructor(agent, options = {}) {
			this.agent = (0, agent_js_1.buildAgent)(agent);
			this.service = options.service;
			this.labelers = new Set(options.labelers);
			this.headers = new Headers(options.headers);
		}
		/**
		* The DID of the authenticated user, or `undefined` if not authenticated.
		*/
		get did() {
			return this.agent.did;
		}
		/**
		* The DID of the authenticated user.
		* @throws {LexError} with code 'AuthenticationRequired' if not authenticated
		*/
		get assertDid() {
			this.assertAuthenticated();
			return this.did;
		}
		/**
		* Asserts that the client is authenticated.
		* Use as a type guard when you need to ensure authentication.
		*
		* @throws {LexError} with code 'AuthenticationRequired' if not authenticated
		*
		* @example
		* ```typescript
		* client.assertAuthenticated()
		* // TypeScript now knows client.did is defined
		* console.log(client.did)
		* ```
		*/
		assertAuthenticated() {
			if (!this.did) throw new lex_data_1.LexError("AuthenticationRequired");
		}
		/**
		* Replaces all labelers with the given set.
		* @param labelers - Iterable of labeler DIDs
		*/
		setLabelers(labelers = []) {
			this.clearLabelers();
			this.addLabelers(labelers);
		}
		/**
		* Adds labelers to the current set.
		* @param labelers - Iterable of labeler DIDs to add
		*/
		addLabelers(labelers) {
			for (const labeler of labelers) this.labelers.add(labeler);
		}
		/**
		* Removes all labelers from this client instance.
		*/
		clearLabelers() {
			this.labelers.clear();
		}
		/**
		* Low-level fetch handler for making requests.
		* @param path - The request path
		* @param init - Request initialization options
		*/
		fetchHandler(path, init) {
			const headers = (0, util_js_1.buildAtprotoHeaders)({
				headers: init.headers,
				service: this.service,
				labelers: [...this.constructor.appLabelers.map((l) => `${l};redact`), ...this.labelers]
			});
			for (const [key, value] of this.headers) if (!headers.has(key)) headers.set(key, value);
			return this.agent.fetchHandler(path, {
				...init,
				headers
			});
		}
		async xrpc(ns, options = {}) {
			return (0, xrpc_js_1.xrpc)(this, ns, options);
		}
		async xrpcSafe(ns, options = {}) {
			return (0, xrpc_js_1.xrpcSafe)(this, ns, options);
		}
		/**
		* Creates a new record in an AT Protocol repository.
		*
		* @param record - The record to create, must include an {@link NsidString} `$type`
		* @param rkey - Optional record key; if omitted, server generates a TID
		* @param options - Create options including repo, swapCommit, validate
		* @returns The XRPC response containing the created record's URI and CID
		*
		* @example
		* ```typescript
		* const response = await client.createRecord(
		*   { $type: 'app.bsky.feed.post', text: 'Hello!', createdAt: new Date().toISOString() },
		*   undefined, // Let server generate rkey
		*   { validate: true }
		* )
		* console.log(response.body.uri)
		* ```
		*
		* @see {@link create} for a higher-level typed alternative
		*/
		async createRecord(record, rkey, options) {
			return this.xrpc(index_js_1.com.atproto.repo.createRecord.main, {
				...options,
				body: {
					repo: options?.repo ?? this.assertDid,
					collection: record.$type,
					record,
					rkey,
					validate: options?.validate,
					swapCommit: options?.swapCommit
				}
			});
		}
		/**
		* Deletes a record from an AT Protocol repository.
		*
		* @param collection - The collection NSID
		* @param rkey - The record key
		* @param options - Delete options including repo, swapCommit, swapRecord
		*
		* @see {@link delete} for a higher-level typed alternative
		*/
		async deleteRecord(collection, rkey, options) {
			return this.xrpc(index_js_1.com.atproto.repo.deleteRecord.main, {
				...options,
				body: {
					repo: options?.repo ?? this.assertDid,
					collection,
					rkey,
					swapCommit: options?.swapCommit,
					swapRecord: options?.swapRecord
				}
			});
		}
		/**
		* Retrieves a record from an AT Protocol repository.
		*
		* @param collection - The collection NSID
		* @param rkey - The record key
		* @param options - Get options including repo
		*
		* @see {@link get} for a higher-level typed alternative
		*/
		async getRecord(collection, rkey, options) {
			return this.xrpc(index_js_1.com.atproto.repo.getRecord.main, {
				...options,
				params: {
					repo: options?.repo ?? this.assertDid,
					collection,
					rkey
				}
			});
		}
		/**
		* Creates or updates a record in a repository.
		*
		* @param record - The record to put, must include an {@link NsidString} `$type`
		* @param rkey - The record key
		* @param options - Put options including repo, swapCommit, swapRecord, validate
		*
		* @see {@link put} for a higher-level typed alternative
		*/
		async putRecord(record, rkey, options) {
			return this.xrpc(index_js_1.com.atproto.repo.putRecord.main, {
				...options,
				body: {
					repo: options?.repo ?? this.assertDid,
					collection: record.$type,
					rkey,
					record,
					validate: options?.validate,
					swapCommit: options?.swapCommit,
					swapRecord: options?.swapRecord
				}
			});
		}
		/**
		* Lists records in a collection.
		*
		* @param nsid - The collection NSID
		* @param options - List options including repo, limit, cursor, reverse
		*
		* @see {@link list} for a higher-level typed alternative
		*/
		async listRecords(nsid, options) {
			return this.xrpc(index_js_1.com.atproto.repo.listRecords.main, {
				...options,
				params: {
					repo: options?.repo ?? this.assertDid,
					collection: nsid,
					cursor: options?.cursor,
					limit: options?.limit,
					reverse: options?.reverse
				}
			});
		}
		/**
		* Uploads a blob to an AT Protocol repository.
		*
		* @param body - The blob data (Uint8Array, ReadableStream, Blob, etc.)
		* @param options - Upload options including encoding hint
		* @returns Response containing the blob reference
		*
		* @example
		* ```typescript
		* const imageData = await fetch('image.png').then(r => r.arrayBuffer())
		* const response = await client.uploadBlob(new Uint8Array(imageData), {
		*   encoding: 'image/png'
		* })
		* console.log(response.body.blob) // Use this ref in records
		* ```
		*/
		async uploadBlob(body, options) {
			return this.xrpc(index_js_1.com.atproto.repo.uploadBlob.main, {
				...options,
				body
			});
		}
		/**
		* Retrieves a blob by DID and CID.
		*
		* @param did - The DID of the repository containing the blob
		* @param cid - The CID of the blob
		* @param options - Call options
		*/
		async getBlob(did, cid, options) {
			return this.xrpc(index_js_1.com.atproto.sync.getBlob.main, {
				...options,
				params: {
					did,
					cid
				}
			});
		}
		async call(ns, arg, options = {}) {
			const method = (0, lex_schema_1.getMain)(ns);
			if (typeof method === "function") return method(this, arg, options);
			if (method instanceof lex_schema_1.Procedure) return (await this.xrpc(method, {
				...options,
				body: arg
			})).body;
			else if (method instanceof lex_schema_1.Query) return (await this.xrpc(method, {
				...options,
				params: arg
			})).body;
			else throw new TypeError("Invalid lexicon");
		}
		async create(ns, input, options = {}) {
			const schema = (0, lex_schema_1.getMain)(ns);
			const record = schema.build(input);
			const rkey = options.rkey ?? getDefaultRecordKey(schema);
			if (rkey !== void 0) schema.keySchema.assert(rkey);
			return (await this.createRecord(record, rkey, options)).body;
		}
		async delete(ns, options = {}) {
			const schema = (0, lex_schema_1.getMain)(ns);
			const rkey = schema.keySchema.parse(options.rkey ?? getLiteralRecordKey(schema));
			return (await this.deleteRecord(schema.$type, rkey, options)).body;
		}
		async get(ns, options = {}) {
			const schema = (0, lex_schema_1.getMain)(ns);
			const rkey = schema.keySchema.parse(options.rkey ?? getLiteralRecordKey(schema));
			const response = await this.getRecord(schema.$type, rkey, options);
			const value = schema.validate(response.body.value);
			return {
				...response.body,
				value
			};
		}
		async put(ns, input, options = {}) {
			const schema = (0, lex_schema_1.getMain)(ns);
			const record = schema.build(input);
			const rkey = options.rkey ?? getLiteralRecordKey(schema);
			return (await this.putRecord(record, rkey, options)).body;
		}
		/**
		* Lists records with type-safe validation and separation of valid/invalid records.
		*
		* @param ns - The record schema definition
		* @param options - List options
		* @returns Records split into valid (matching schema) and invalid arrays
		*
		* @example
		* ```typescript
		* const result = await client.list(app.bsky.feed.post.main, { limit: 100 })
		* console.log(`Found ${result.records.length} valid posts`)
		* console.log(`Found ${result.invalid.length} invalid records`)
		* ```
		*/
		async list(ns, options) {
			const schema = (0, lex_schema_1.getMain)(ns);
			const { body } = await this.listRecords(schema.$type, options);
			const records = [];
			const invalid = [];
			for (const record of body.records) {
				const parsed = schema.safeValidate(record.value);
				if (parsed.success) records.push({
					...record,
					value: parsed.value
				});
				else invalid.push(record.value);
			}
			return {
				...body,
				records,
				invalid
			};
		}
	};
	exports.Client = Client;
	function getDefaultRecordKey(schema) {
		if (schema.key === "tid") return void 0;
		if (schema.key === "any") return void 0;
		return getLiteralRecordKey(schema);
	}
	function getLiteralRecordKey(schema) {
		if (schema.key.startsWith("literal:")) return schema.key.slice(8);
		throw new TypeError(`An "rkey" must be provided for record key type "${schema.key}" (${schema.$type})`);
	}
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@atproto/lex-client/dist/index.js
var require_dist$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	tslib_1.__exportStar(require_agent(), exports);
	tslib_1.__exportStar(require_client(), exports);
	tslib_1.__exportStar(require_errors(), exports);
	tslib_1.__exportStar(require_response(), exports);
	tslib_1.__exportStar(require_types(), exports);
	tslib_1.__exportStar(require_xrpc(), exports);
}));
//#endregion
//#region node_modules/@atproto/lex/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	/**
	* The `@atproto/lex` package provides utilities for working with ATProtocol
	* lexicons, including data types, JSON encoding/decoding, schema validation,
	* and HTTP client functionality.
	*
	* ## `@atproto/lex-client`
	*
	* - {@link client.Client} - Type-safe XRPC client for making ATProtocol API calls
	* - {@link client.XrpcError} - Base error class for XRPC request failures
	* - {@link client.Agent} - Interface used by {@link client.Client} for making HTTP requests
	* - {@link client.xrpc} - Utility function for making XRPC requests
	*
	* ## `@atproto/lex-data`
	*
	* - {@link data.LexValue} - Union type representing any valid Lexicon value
	* - {@link data.LexMap} - Object type with string keys and {@link data.LexValue} values
	* - {@link data.Cid} - Content Identifier for referencing data by hash
	* - {@link data.BlobRef} - Reference to binary data (images, videos, etc.)
	*
	* ## `@atproto/lex-json`
	*
	* - {@link json.lexStringify} - Serialize Lex values to JSON strings
	* - {@link json.lexParse} - Parse JSON strings into Lex values
	* - {@link json.lexToJson} - Convert Lex values to plain JSON objects
	* - {@link json.jsonToLex} - Convert plain JSON objects to Lex values
	*
	* ## `@atproto/lex-schema`
	*
	* The {@link l} namespace provides a fluent API for building schemas:
	*
	* ### Primitive Types
	* - {@link l.string | l.string()} - String values with optional format/length constraints
	* - {@link l.integer | l.integer()} - Integer values with optional min/max constraints
	* - {@link l.boolean | l.boolean()} - Boolean values
	* - {@link l.bytes | l.bytes()} - Binary data (Uint8Array)
	* - {@link l.cid | l.cid()} - Content Identifier values
	* - {@link l.blob | l.blob()} - Blob references with mime type and size
	*
	* ### Composite Types
	* - {@link l.object | l.object()} - Objects with defined property schemas
	* - {@link l.array | l.array()} - Arrays with element type validation
	* - {@link l.union | l.union()} - Union of multiple possible types
	* - {@link l.ref | l.ref()} - Reference to another schema definition
	* - {@link l.literal | l.literal()} - Literal constant values
	* - {@link l.enum | l.enum()} - Enum of allowed string values
	* - {@link l.typedRef | l.typedRef()} - Reference to a {@link l.typedObject | l.typedObject()}
	* - {@link l.typedUnion | l.typedUnion()} - Discriminated union between multiple {@link l.typedRef | l.typedRef()} or {@link l.typedObject | l.typedObject()} types
	*
	* ### Modifiers
	* - {@link l.optional | l.optional()} - Mark a property as optional
	* - {@link l.nullable | l.nullable()} - Allow null values
	* - {@link l.withDefault | l.withDefault()} - Provide a default value
	*
	* ### Lexicon Definitions
	* - {@link l.typedObject | l.typedObject()} - Define a typed object with a `$type` property
	* - {@link l.record | l.record()} - Define a Lexicon record type
	* - {@link l.query | l.query()} - Define a Lexicon query method
	* - {@link l.procedure | l.procedure()} - Define a Lexicon procedure method
	* - {@link l.subscription | l.subscription()} - Define a Lexicon subscription method
	*
	* @packageDocumentation
	*/
	tslib_1.__exportStar(require_dist$8(), exports);
	tslib_1.__exportStar(require_dist$7(), exports);
	tslib_1.__exportStar(require_dist$4(), exports);
	tslib_1.__exportStar(require_dist$1(), exports);
}));
//#endregion
//#region node_modules/@inlay/render/dist/generated/at/inlay/defs.defs.js
var import_dist$1 = require_dist$16();
var import_dist = require_dist$9();
var import_dist$2 = require_dist();
var $nsid$1 = "at.inlay.defs";
var viaValtown = import_dist$2.l.typedObject($nsid$1, "viaValtown", import_dist$2.l.object({ valId: import_dist$2.l.string({ maxLength: 128 }) }));
/** Cache tag: depend on a specific record, collection, or identity. */
var tagRecord = import_dist$2.l.typedObject($nsid$1, "tagRecord", import_dist$2.l.object({ uri: import_dist$2.l.string({ format: "at-uri" }) }));
/** Cache tag: depend on backlink relationships to a subject. */
var tagLink = import_dist$2.l.typedObject($nsid$1, "tagLink", import_dist$2.l.object({
	subject: import_dist$2.l.string({ format: "at-uri" }),
	from: import_dist$2.l.optional(import_dist$2.l.string({ format: "nsid" }))
}));
/** Cache lifetime and invalidation tags returned by XRPC components. */
var cachePolicy = import_dist$2.l.typedObject($nsid$1, "cachePolicy", import_dist$2.l.object({
	life: import_dist$2.l.optional(import_dist$2.l.string({ maxLength: 32 })),
	tags: import_dist$2.l.optional(import_dist$2.l.array(import_dist$2.l.typedUnion([import_dist$2.l.typedRef((() => tagRecord)), import_dist$2.l.typedRef((() => tagLink))], false)))
}));
import_dist$2.l.typedObject($nsid$1, "response", import_dist$2.l.object({
	node: import_dist$2.l.ref((() => element)),
	cache: import_dist$2.l.ref((() => cachePolicy))
}));
/** A renderable Inlay element. */
var element = import_dist$2.l.typedObject($nsid$1, "element", import_dist$2.l.object({
	type: import_dist$2.l.string({ format: "nsid" }),
	props: import_dist$2.l.optional(import_dist$2.l.lexMap()),
	key: import_dist$2.l.optional(import_dist$2.l.string({ maxLength: 256 }))
}));
//#endregion
//#region node_modules/@inlay/render/dist/generated/at/inlay/component.defs.js
var $nsid = "at.inlay.component";
import_dist$2.l.record("nsid", $nsid, import_dist$2.l.object({
	body: import_dist$2.l.optional(import_dist$2.l.typedUnion([import_dist$2.l.typedRef((() => bodyExternal)), import_dist$2.l.typedRef((() => bodyTemplate))], false)),
	view: import_dist$2.l.optional(import_dist$2.l.ref((() => view))),
	imports: import_dist$2.l.optional(import_dist$2.l.array(import_dist$2.l.string({ format: "did" }))),
	via: import_dist$2.l.optional(import_dist$2.l.typedUnion([import_dist$2.l.typedRef((() => viaValtown))], false)),
	description: import_dist$2.l.optional(import_dist$2.l.string({
		maxGraphemes: 1e3,
		maxLength: 1e4
	})),
	createdAt: import_dist$2.l.optional(import_dist$2.l.string({ format: "datetime" })),
	updatedAt: import_dist$2.l.optional(import_dist$2.l.string({ format: "datetime" }))
})).$type;
/** Component rendered by calling a remote XRPC endpoint */
var bodyExternal = import_dist$2.l.typedObject($nsid, "bodyExternal", import_dist$2.l.object({
	did: import_dist$2.l.string({ format: "did" }),
	personalized: import_dist$2.l.optional(import_dist$2.l.boolean())
}));
/** Component rendered by the host from a serialized element tree */
var bodyTemplate = import_dist$2.l.typedObject($nsid, "bodyTemplate", import_dist$2.l.object({ node: import_dist$2.l.lexMap() }));
/** Declares what data this component views and which prop receives it. */
var view = import_dist$2.l.typedObject($nsid, "view", import_dist$2.l.object({
	prop: import_dist$2.l.string({ maxLength: 256 }),
	accepts: import_dist$2.l.array(import_dist$2.l.typedUnion([import_dist$2.l.typedRef((() => viewRecord)), import_dist$2.l.typedRef((() => viewPrimitive))], false), { minLength: 1 })
}));
/** View accepts individual records of a collection. Omit collection for a generic record view. When rkey is present, the component accepts bare DIDs (expanded to full AT URIs) and appears on identity pages. */
var viewRecord = import_dist$2.l.typedObject($nsid, "viewRecord", import_dist$2.l.object({
	collection: import_dist$2.l.optional(import_dist$2.l.string({ format: "nsid" })),
	rkey: import_dist$2.l.optional(import_dist$2.l.string({ maxLength: 512 }))
}));
/** View accepts a primitive value type. */
var viewPrimitive = import_dist$2.l.typedObject($nsid, "viewPrimitive", import_dist$2.l.object({
	type: import_dist$2.l.string({ maxLength: 128 }),
	format: import_dist$2.l.optional(import_dist$2.l.string({ maxLength: 64 }))
}));
//#endregion
//#region node_modules/@inlay/render/dist/packages/@inlay/render/src/validate.js
var lexiconCache = /* @__PURE__ */ new Map();
/**
* Prepare props for lexicon validation:
* 1. Throw MissingError for any lingering at.inlay.Missing elements (so Maybe
*    can catch them) before they hit validation and produce confusing type errors.
* 2. Hydrate JSON blob refs, CID links, and byte arrays into class instances
*    (BlobRef, CID, Uint8Array) that @atproto/lexicon validation accepts.
* Elements are opaque and skipped.
*/
function prepareProps(props) {
	return walkTree(props, (obj, walk) => {
		if (isValidElement(obj)) {
			if (obj.type === "at.inlay.Missing") {
				const path = obj.props?.path;
				throw new MissingError(Array.isArray(path) ? path : ["?"]);
			}
			return obj;
		}
		if (obj["$type"] === "blob" || obj["$link"] !== void 0 || obj["$bytes"] !== void 0) return (0, import_dist.jsonToLex)(obj);
		const out = {};
		for (const [k, v] of Object.entries(obj)) out[k] = walk(v);
		return out;
	});
}
async function validateProps(type, props, component, resolver) {
	let result = prepareProps(props);
	const lex = await resolver.resolveLexicon(type);
	if (lex) {
		let lexicons = lexiconCache.get(type);
		if (!lexicons) {
			lexicons = await buildLexicons(lex, resolver);
			lexiconCache.set(type, lexicons);
		}
		result = lexicons.assertValidXrpcInput(type, result);
	} else if (component.view) {
		const { prop: viewProp, accepts } = component.view;
		const primitives = accepts.filter((v) => viewPrimitive.isTypeOf(v));
		const records = accepts.filter((v) => viewRecord.isTypeOf(v));
		if (primitives.length > 0 || records.length > 0) {
			const propEntries = /* @__PURE__ */ new Map();
			for (const vr of records) {
				const existing = propEntries.get(viewProp);
				if (existing) {
					existing.formats.add("at-uri");
					if (vr.rkey) existing.formats.add("did");
				} else {
					const formats = /* @__PURE__ */ new Set(["at-uri"]);
					if (vr.rkey) formats.add("did");
					propEntries.set(viewProp, {
						type: "string",
						formats
					});
				}
			}
			if (propEntries.size > 0) {
				const properties = {};
				const required = [...propEntries.keys()];
				for (const [prop, { type: t, formats }] of propEntries) {
					const format = unionFormats(formats);
					properties[prop] = format ? {
						type: t,
						format
					} : { type: t };
				}
				result = new import_dist.Lexicons([{
					lexicon: 1,
					id: type,
					defs: { main: {
						type: "procedure",
						input: {
							encoding: "application/json",
							schema: {
								type: "object",
								required,
								properties
							}
						}
					} }
				}]).assertValidXrpcInput(type, result);
			}
		}
	}
	if (component.view) {
		const { prop: collectionProp, accepts } = component.view;
		const records = accepts.filter((v) => viewRecord.isTypeOf(v));
		if (records.length > 0) {
			const allowedCollections = /* @__PURE__ */ new Map();
			for (const vr of records) {
				if (!vr.collection) continue;
				let set = allowedCollections.get(collectionProp);
				if (!set) {
					set = /* @__PURE__ */ new Set();
					allowedCollections.set(collectionProp, set);
				}
				set.add(vr.collection);
			}
			for (const [prop, allowed] of allowedCollections) {
				const value = result[prop];
				if (typeof value !== "string" || !value.startsWith("at://")) continue;
				const parsed = new import_dist$1.AtUri(value);
				if (!parsed.collection) continue;
				if (!allowed.has(parsed.collection)) throw new Error(`${type}: ${prop} expects ${[...allowed].join(" or ")}, got ${parsed.collection}`);
			}
		}
	}
	return result;
}
var FORMAT_ANCESTORS = {
	did: ["uri", "at-identifier"],
	"at-uri": ["uri"],
	handle: ["at-identifier"]
};
function unionFormats(formats) {
	const arr = [...formats];
	if (arr.length <= 1) return arr[0];
	const ancestorSets = arr.map((f) => /* @__PURE__ */ new Set([f, ...FORMAT_ANCESTORS[f] ?? []]));
	const common = [...ancestorSets[0]].filter((f) => ancestorSets.every((s) => s.has(f)));
	if (common.length === 0) return;
	if (common.length === 1) return common[0];
	return common.find((f) => !common.some((g) => g !== f && (FORMAT_ANCESTORS[g] ?? []).includes(f)));
}
function collectRefNsids(obj, out = /* @__PURE__ */ new Set()) {
	if (!obj || typeof obj !== "object") return out;
	const o = obj;
	if (o.type === "ref" && typeof o.ref === "string") {
		const nsid = o.ref.split("#")[0];
		if (nsid) out.add(nsid);
	}
	if (o.type === "union" && Array.isArray(o.refs)) {
		for (const ref of o.refs) if (typeof ref === "string") {
			const nsid = ref.split("#")[0];
			if (nsid) out.add(nsid);
		}
	}
	for (const val of Object.values(o)) if (Array.isArray(val)) val.forEach((v) => collectRefNsids(v, out));
	else if (val && typeof val === "object") collectRefNsids(val, out);
	return out;
}
async function buildLexicons(root, resolver) {
	const loaded = /* @__PURE__ */ new Map();
	loaded.set(root.id, root);
	let pending = collectRefNsids(root);
	while (pending.size > 0) {
		const newNsids = [...pending].filter((nsid) => !loaded.has(nsid));
		if (newNsids.length === 0) break;
		const docs = await Promise.all(newNsids.map((nsid) => resolver.resolveLexicon(nsid)));
		const nextPending = /* @__PURE__ */ new Set();
		for (let i = 0; i < newNsids.length; i++) {
			const doc = docs[i];
			if (doc) {
				loaded.set(newNsids[i], doc);
				collectRefNsids(doc, nextPending);
			}
		}
		pending = nextPending;
	}
	const docs = [...loaded.values()].map((d) => JSON.parse(JSON.stringify(d)));
	return new import_dist.Lexicons(docs);
}
//#endregion
//#region node_modules/@inlay/render/dist/packages/@inlay/render/src/index.js
var slotContexts = /* @__PURE__ */ new WeakMap();
var MissingError = class MissingError extends Error {
	kind = "missing";
	path;
	componentStack = [];
	constructor(path) {
		super(`Missing: ${path.join(".")}`);
		this.path = path;
	}
	/**
	* If an XRPC error response body encodes a MissingError, throw it.
	* No-op if the body doesn't represent a MissingError.
	*/
	static rethrowFromResponse(body) {
		try {
			const json = JSON.parse(body);
			const err = json.error ?? json;
			if (err.name === "MissingError" && typeof err.message === "string") {
				const raw = err.message.replace(/^Missing:\s*/, "");
				throw new MissingError([raw]);
			}
		} catch (e) {
			if (e instanceof MissingError) throw e;
		}
	}
};
var DEFAULT_MAX_DEPTH = 30;
async function render(element, context, options) {
	const { resolver } = options;
	const ctx = slotContexts.get(element) ?? context;
	const depth = ctx.depth ?? 0;
	const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
	let errorStack = ctx.stack;
	try {
		const type = element.type;
		let props = element.props ?? {};
		if (ctx.scope) props = resolveBindings(props, scopeResolver(ctx.scope));
		if (ctx.component) {
			const nsid = new import_dist$1.AtUri(ctx.componentUri).rkey;
			if (type !== nsid) throw new Error(`render was given ${nsid}, cannot render ${type}`);
			errorStack = [type, ...ctx.stack ?? []];
			return await renderComponent(resolver, ctx.component, ctx.componentUri, element, props, ctx);
		}
		if (type.startsWith("at.inlay.")) {
			if (type === "at.inlay.Missing") {
				const path = props.path;
				if (!Array.isArray(path) || path.length === 0) throw new Error("at.inlay.Missing requires path with at least 1 item");
				throw new MissingError(path);
			}
			return {
				node: null,
				context: {
					imports: ctx.imports,
					scope: ctx.scope,
					stack: ctx.stack
				},
				props
			};
		}
		errorStack = [type, ...ctx.stack ?? []];
		if (depth >= maxDepth) throw Error("Component depth limit exceeded");
		const { component, componentUri } = await resolveType(type, ctx.imports, resolver);
		return await renderComponent(resolver, component, componentUri, element, props, ctx);
	} catch (e) {
		if (e != null && typeof e === "object") e.componentStack = errorStack ?? [];
		throw e;
	}
}
/** Build a resolve callback that looks up paths in a scope. Returns a Missing element on null. */
function scopeResolver(scope) {
	return (path) => {
		if (path.length === 0) throw new Error("Binding path must not be empty");
		const ns = path[0];
		if (ns !== "props" && ns !== "record") {
			const name = path.join(".");
			const hints = [];
			if (scope.props != null && typeof scope.props === "object") {
				if (Object.hasOwn(scope.props, ns)) hints.push(`props.${name}`);
			}
			if (scope.record != null && typeof scope.record === "object") {
				if (Object.hasOwn(scope.record, ns)) hints.push(`record.${name}`);
			}
			let msg = `Invalid binding {${name}}: bindings must start with "props" or "record" (e.g. {props.${name}} or {record.${name}}).`;
			if (hints.length > 0) msg += ` Did you mean {${hints.join("} or {")}}?`;
			throw new Error(msg);
		}
		const value = resolvePath(scope, path);
		if (value == null) return $("at.inlay.Missing", { path });
		return value;
	};
}
function resolvePath(obj, path) {
	let current = obj;
	for (const seg of path) {
		if (current == null) return;
		if (typeof current === "string") {
			if (seg === "$did" || seg === "$collection" || seg === "$rkey") {
				if (!current.startsWith("at://")) return;
				try {
					const parsed = new import_dist$1.AtUri(current);
					if (seg === "$did") {
						(0, import_dist$1.ensureValidDid)(parsed.host);
						current = parsed.host;
					} else if (seg === "$collection") current = parsed.collection;
					else if (seg === "$rkey") current = parsed.rkey;
					else return;
				} catch {
					return;
				}
				continue;
			}
			return;
		}
		if (typeof current !== "object") return;
		if (!Object.hasOwn(current, seg)) return;
		current = current[seg];
	}
	return current;
}
async function renderComponent(resolver, component, componentUri, element, props, ctx) {
	const depth = ctx.depth ?? 0;
	const type = element.type;
	let resolvedProps = props;
	if (component.view) resolvedProps = expandBareDid(resolvedProps, component.view);
	resolvedProps = await validateProps(type, resolvedProps, component, resolver);
	if (!component.body) return {
		node: null,
		context: {
			imports: component.imports?.length ? component.imports : ctx.imports,
			depth,
			scope: ctx.scope,
			stack: ctx.stack
		},
		props: resolvedProps
	};
	if (component.body.$type === "at.inlay.component#bodyTemplate") return renderTemplate(resolver, component, type, resolvedProps, ctx);
	if (component.body.$type === "at.inlay.component#bodyExternal") return renderExternal(resolver, type, component, componentUri, resolvedProps, ctx);
	throw new Error(`Unknown body type: ${component.body.$type}`);
}
async function resolveType(nsid, importStack, resolver) {
	const result = await resolver.resolve(importStack, "at.inlay.component", nsid);
	if (!result) throw new Error(`Unresolved type: ${nsid}`);
	return {
		componentUri: result.uri,
		component: result.record
	};
}
async function renderTemplate(resolver, component, type, props, ctx) {
	const body = component.body;
	const depth = ctx.depth ?? 0;
	const stack = [type, ...ctx.stack ?? []];
	const tree = deserializeTree(body.node);
	const callerCtx = {
		imports: ctx.imports,
		depth,
		scope: ctx.scope,
		stack: ctx.stack
	};
	const slottedProps = walkTree(props, (obj, walk) => {
		if (isValidElement(obj)) {
			slotContexts.set(obj, callerCtx);
			return obj;
		}
		const out = {};
		for (const [k, v] of Object.entries(obj)) out[k] = walk(v);
		return out;
	});
	let scope = { props: slottedProps };
	let cache;
	if (component.view) {
		const { prop, accepts } = component.view;
		const viewRecords = accepts.filter((v) => viewRecord.isTypeOf(v));
		for (const vr of viewRecords) {
			const uri = props[prop];
			if (!uri || !uri.startsWith("at://")) continue;
			const parsed = new import_dist$1.AtUri(uri);
			(0, import_dist$1.ensureValidNsid)(parsed.collection);
			if (!parsed.collection || !parsed.rkey) continue;
			if (vr.collection && vr.collection !== parsed.collection) continue;
			const built = await buildRecord(parsed.host, parsed.collection, parsed.rkey, tree, resolver);
			scope = {
				props: slottedProps,
				record: built.record
			};
			cache = built.cache;
			break;
		}
	}
	return {
		node: resolveBindings(tree, scopeResolver(scope)),
		context: {
			imports: component.imports ?? [],
			depth: depth + 1,
			scope,
			stack
		},
		props,
		cache
	};
}
async function buildRecord(did, collection, rkey, tree, resolver) {
	const recordUri = `at://${did}/${collection}/${rkey}`;
	if (tree && !needsRecord(tree)) return { record: {} };
	const fetched = await resolver.fetchRecord(recordUri);
	if (fetched && typeof fetched === "object") return {
		record: fetched,
		cache: { tags: [{
			$type: "at.inlay.defs#tagRecord",
			uri: recordUri
		}] }
	};
	return { record: {} };
}
/** Check if any Binding in the deserialized tree references record.* */
function needsRecord(tree) {
	let found = false;
	walkTree(tree, (obj, walk) => {
		if (isValidElement(obj)) {
			const el = obj;
			if (el.type === "at.inlay.Binding") {
				const path = el.props?.path;
				if (Array.isArray(path) && path[0] === "record") found = true;
				return obj;
			}
		}
		for (const v of Object.values(obj)) walk(v);
		return obj;
	});
	return found;
}
async function renderExternal(resolver, type, component, componentUri, props, ctx) {
	const body = component.body;
	const depth = ctx.depth ?? 0;
	const stack = [type, ...ctx.stack ?? []];
	const refs = /* @__PURE__ */ new Map();
	const refSlots = /* @__PURE__ */ new Set();
	const wireProps = serializeTree(props, (el) => {
		if (el.type === "at.inlay.Slot") {
			if (refSlots.has(el)) return el;
			throw new Error("Unexpected Slot in props");
		}
		const id = String(refs.size);
		refs.set(id, el);
		const slot = $("at.inlay.Slot", { id });
		refSlots.add(slot);
		return slot;
	});
	const response = await resolver.xrpc({
		did: body.did,
		nsid: type,
		type: "procedure",
		body: wireProps,
		componentUri,
		personalized: body.personalized ?? false
	});
	const callerCtx = {
		imports: ctx.imports,
		depth,
		scope: ctx.scope,
		stack: ctx.stack
	};
	return {
		node: deserializeTree(response.node, (el) => {
			if (el.type === "at.inlay.Slot" && el.props) {
				const id = el.props.id;
				const original = refs.get(id);
				if (original === void 0) throw new Error(`${type}: XRPC response references unknown slot ${id}`);
				const orig = original;
				const restored = $(orig.type, {
					...orig.props,
					key: el.key
				});
				const frag = $("at.inlay.Fragment", {
					key: orig.key,
					children: restored
				});
				slotContexts.set(frag, callerCtx);
				return frag;
			}
			return el;
		}),
		context: {
			imports: component.imports ?? [],
			depth: depth + 1,
			stack
		},
		props,
		cache: response.cache
	};
}
function expandBareDid(props, view) {
	const { prop, accepts } = view;
	const entry = accepts.filter((v) => viewRecord.isTypeOf(v)).find((v) => v.collection && v.rkey);
	if (!entry) return props;
	const value = props[prop];
	if (!value || !value.startsWith("did:")) return props;
	return {
		...props,
		[prop]: `at://${value}/${entry.collection}/${entry.rkey}`
	};
}
//#endregion
export { $, MissingError, deserializeTree, isValidElement, render };
