import {
  __commonJS,
  __toESM
} from "./chunk-CZ7CSFO4.js";

// node_modules/zod/v3/helpers/util.cjs
var require_util = __commonJS({
  "node_modules/zod/v3/helpers/util.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getParsedType = exports.ZodParsedType = exports.objectUtil = exports.util = void 0;
    var util;
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (exports.util = util = {}));
    var objectUtil;
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
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
      const t = typeof data;
      switch (t) {
        case "undefined":
          return exports.ZodParsedType.undefined;
        case "string":
          return exports.ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? exports.ZodParsedType.nan : exports.ZodParsedType.number;
        case "boolean":
          return exports.ZodParsedType.boolean;
        case "function":
          return exports.ZodParsedType.function;
        case "bigint":
          return exports.ZodParsedType.bigint;
        case "symbol":
          return exports.ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return exports.ZodParsedType.array;
          }
          if (data === null) {
            return exports.ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return exports.ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return exports.ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return exports.ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return exports.ZodParsedType.date;
          }
          return exports.ZodParsedType.object;
        default:
          return exports.ZodParsedType.unknown;
      }
    };
    exports.getParsedType = getParsedType;
  }
});

// node_modules/zod/v3/ZodError.cjs
var require_ZodError = __commonJS({
  "node_modules/zod/v3/ZodError.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ZodError = exports.quotelessJson = exports.ZodIssueCode = void 0;
    var util_js_1 = require_util();
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
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    exports.quotelessJson = quotelessJson;
    var ZodError = class _ZodError extends Error {
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
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
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
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    exports.ZodError = ZodError;
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// node_modules/zod/v3/locales/en.cjs
var require_en = __commonJS({
  "node_modules/zod/v3/locales/en.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ZodError_js_1 = require_ZodError();
    var util_js_1 = require_util();
    var errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodError_js_1.ZodIssueCode.invalid_type:
          if (issue.received === util_js_1.ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
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
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util_js_1.util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodError_js_1.ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodError_js_1.ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
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
  }
});

// node_modules/zod/v3/errors.cjs
var require_errors = __commonJS({
  "node_modules/zod/v3/errors.cjs"(exports) {
    "use strict";
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
  }
});

// node_modules/zod/v3/helpers/parseUtil.cjs
var require_parseUtil = __commonJS({
  "node_modules/zod/v3/helpers/parseUtil.cjs"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAsync = exports.isValid = exports.isDirty = exports.isAborted = exports.OK = exports.DIRTY = exports.INVALID = exports.ParseStatus = exports.EMPTY_PATH = exports.makeIssue = void 0;
    exports.addIssueToContext = addIssueToContext;
    var errors_js_1 = require_errors();
    var en_js_1 = __importDefault(require_en());
    var makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
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
          // contextual error map is first priority
          ctx.schemaErrorMap,
          // then schema-bound map if available
          overrideMap,
          // then global override map
          overrideMap === en_js_1.default ? void 0 : en_js_1.default
          // then global default map
        ].filter((x) => !!x)
      });
      ctx.common.issues.push(issue);
    }
    var ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return exports.INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair2 of pairs) {
          const key = await pair2.key;
          const value = await pair2.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair2 of pairs) {
          const { key, value } = pair2;
          if (key.status === "aborted")
            return exports.INVALID;
          if (value.status === "aborted")
            return exports.INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair2.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    exports.ParseStatus = ParseStatus;
    exports.INVALID = Object.freeze({
      status: "aborted"
    });
    var DIRTY = (value) => ({ status: "dirty", value });
    exports.DIRTY = DIRTY;
    var OK = (value) => ({ status: "valid", value });
    exports.OK = OK;
    var isAborted = (x) => x.status === "aborted";
    exports.isAborted = isAborted;
    var isDirty = (x) => x.status === "dirty";
    exports.isDirty = isDirty;
    var isValid = (x) => x.status === "valid";
    exports.isValid = isValid;
    var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
    exports.isAsync = isAsync;
  }
});

// node_modules/zod/v3/helpers/typeAliases.cjs
var require_typeAliases = __commonJS({
  "node_modules/zod/v3/helpers/typeAliases.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/zod/v3/helpers/errorUtil.cjs
var require_errorUtil = __commonJS({
  "node_modules/zod/v3/helpers/errorUtil.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.errorUtil = void 0;
    var errorUtil;
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (exports.errorUtil = errorUtil = {}));
  }
});

// node_modules/zod/v3/types.cjs
var require_types = __commonJS({
  "node_modules/zod/v3/types.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.discriminatedUnion = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = exports.coerce = exports.ZodFirstPartyTypeKind = exports.late = exports.ZodSchema = exports.Schema = exports.ZodReadonly = exports.ZodPipeline = exports.ZodBranded = exports.BRAND = exports.ZodNaN = exports.ZodCatch = exports.ZodDefault = exports.ZodNullable = exports.ZodOptional = exports.ZodTransformer = exports.ZodEffects = exports.ZodPromise = exports.ZodNativeEnum = exports.ZodEnum = exports.ZodLiteral = exports.ZodLazy = exports.ZodFunction = exports.ZodSet = exports.ZodMap = exports.ZodRecord = exports.ZodTuple = exports.ZodIntersection = exports.ZodDiscriminatedUnion = exports.ZodUnion = exports.ZodObject = exports.ZodArray = exports.ZodVoid = exports.ZodNever = exports.ZodUnknown = exports.ZodAny = exports.ZodNull = exports.ZodUndefined = exports.ZodSymbol = exports.ZodDate = exports.ZodBoolean = exports.ZodBigInt = exports.ZodNumber = exports.ZodString = exports.ZodType = void 0;
    exports.NEVER = exports.void = exports.unknown = exports.union = exports.undefined = exports.tuple = exports.transformer = exports.symbol = exports.string = exports.strictObject = exports.set = exports.record = exports.promise = exports.preprocess = exports.pipeline = exports.ostring = exports.optional = exports.onumber = exports.oboolean = exports.object = exports.number = exports.nullable = exports.null = exports.never = exports.nativeEnum = exports.nan = exports.map = exports.literal = exports.lazy = exports.intersection = exports.instanceof = exports.function = exports.enum = exports.effect = void 0;
    exports.datetimeRegex = datetimeRegex;
    exports.custom = custom;
    var ZodError_js_1 = require_ZodError();
    var errors_js_1 = require_errors();
    var errorUtil_js_1 = require_errorUtil();
    var parseUtil_js_1 = require_parseUtil();
    var util_js_1 = require_util();
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
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    var handleResult = (ctx, result) => {
      if ((0, parseUtil_js_1.isValid)(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError_js_1.ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    function processCreateParams(params) {
      if (!params)
        return {};
      const { errorMap, invalid_type_error, required_error, description } = params;
      if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
      }
      if (errorMap)
        return { errorMap, description };
      const customMap = (iss, ctx) => {
        const { message } = params;
        if (iss.code === "invalid_enum_value") {
          return { message: message ?? ctx.defaultError };
        }
        if (typeof ctx.data === "undefined") {
          return { message: message ?? required_error ?? ctx.defaultError };
        }
        if (iss.code !== "invalid_type")
          return { message: ctx.defaultError };
        return { message: message ?? invalid_type_error ?? ctx.defaultError };
      };
      return { errorMap: customMap, description };
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
        if ((0, parseUtil_js_1.isAsync)(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
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
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
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
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return (0, parseUtil_js_1.isValid)(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => (0, parseUtil_js_1.isValid)(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
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
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await ((0, parseUtil_js_1.isAsync)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodError_js_1.ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
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
          effect: { type: "transform", transform }
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
      if (args.precision) {
        secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
      } else if (args.precision == null) {
        secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
      }
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
      if (args.offset)
        opts.push(`([+-]\\d{2}:?\\d{2})`);
      regex = `${regex}(${opts.join("|")})`;
      return new RegExp(`^${regex}$`);
    }
    function isValidIP(ip, version) {
      if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
      }
      return false;
    }
    function isValidJWT(jwt, alg) {
      if (!jwtRegex.test(jwt))
        return false;
      try {
        const [header] = jwt.split(".");
        if (!header)
          return false;
        const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
        const decoded = JSON.parse(atob(base64));
        if (typeof decoded !== "object" || decoded === null)
          return false;
        if ("typ" in decoded && decoded?.typ !== "JWT")
          return false;
        if (!decoded.alg)
          return false;
        if (alg && decoded.alg !== alg)
          return false;
        return true;
      } catch {
        return false;
      }
    }
    function isValidCidr(ip, version) {
      if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
        return true;
      }
      return false;
    }
    var ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.string,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
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
              if (tooBig) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                  code: ZodError_js_1.ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                  code: ZodError_js_1.ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
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
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
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
          } else if (check.kind === "url") {
            try {
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
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "regex",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
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
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
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
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodError_js_1.ZodIssueCode.invalid_string,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil_js_1.errorUtil.errToObj(message) });
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
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
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
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
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
      const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
      const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
      return valInt % stepInt / 10 ** decCount;
    }
    var ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.number,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        let ctx = void 0;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
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
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
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
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
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
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
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
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_js_1.errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
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
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util_js_1.util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
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
    var ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
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
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
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
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
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
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_js_1.errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
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
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
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
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.boolean) {
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
    var ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.date,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_date
          });
          return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
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
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
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
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
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
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.symbol) {
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
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
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
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.null) {
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
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
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
    var ZodArray = class _ZodArray extends ZodType {
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
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return parseUtil_js_1.ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return parseUtil_js_1.ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil_js_1.errorUtil.toString(message) }
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
      } else if (schema instanceof ZodArray) {
        return new ZodArray({
          ...schema._def,
          type: deepPartialify(schema.element)
        });
      } else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
      } else {
        return schema;
      }
    }
    var ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util_js_1.util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.object,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair2 of pairs) {
              const key = await pair2.key;
              const value = await pair2.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair2.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return parseUtil_js_1.ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil_js_1.errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil_js_1.errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
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
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
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
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
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
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError_js_1.ZodError(result.ctx.common.issues));
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_union,
            unionErrors
          });
          return parseUtil_js_1.INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
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
        } else {
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
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError_js_1.ZodError(issues2));
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
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util_js_1.util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
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
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
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
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
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
      if (a === b) {
        return { valid: true, data: a };
      } else if (aType === util_js_1.ZodParsedType.object && bType === util_js_1.ZodParsedType.object) {
        const bKeys = util_js_1.util.objectKeys(b);
        const sharedKeys = util_js_1.util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
          const sharedValue = mergeValues(a[key], b[key]);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
      } else if (aType === util_js_1.ZodParsedType.array && bType === util_js_1.ZodParsedType.array) {
        if (a.length !== b.length) {
          return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
          const itemA = a[index];
          const itemB = b[index];
          const sharedValue = mergeValues(itemA, itemB);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
      } else if (aType === util_js_1.ZodParsedType.date && bType === util_js_1.ZodParsedType.date && +a === +b) {
        return { valid: true, data: a };
      } else {
        return { valid: false };
      }
    }
    var ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if ((0, parseUtil_js_1.isAborted)(parsedLeft) || (0, parseUtil_js_1.isAborted)(parsedRight)) {
            return parseUtil_js_1.INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_intersection_types
            });
            return parseUtil_js_1.INVALID;
          }
          if ((0, parseUtil_js_1.isDirty)(parsedLeft) || (0, parseUtil_js_1.isDirty)(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
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
    var ZodTuple = class _ZodTuple extends ZodType {
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
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
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
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return parseUtil_js_1.ParseStatus.mergeArray(status, results);
          });
        } else {
          return parseUtil_js_1.ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    exports.ZodTuple = ZodTuple;
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    var ZodRecord = class _ZodRecord extends ZodType {
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
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return parseUtil_js_1.ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
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
            for (const pair2 of pairs) {
              const key = await pair2.key;
              const value = await pair2.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return parseUtil_js_1.INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair2 of pairs) {
            const key = pair2.key;
            const value = pair2.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return parseUtil_js_1.INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
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
    var ZodSet = class _ZodSet extends ZodType {
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
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil_js_1.errorUtil.toString(message) }
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
    var ZodFunction = class _ZodFunction extends ZodType {
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
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
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
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
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
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return (0, parseUtil_js_1.OK)(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError_js_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError_js_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
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
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
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
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
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
        return { status: "valid", value: input.data };
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
    var ZodEnum = class _ZodEnum extends ZodType {
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
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
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
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
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
        if (!this._cache) {
          this._cache = new Set(util_js_1.util.getValidEnumValues(this._def.values));
        }
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
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return parseUtil_js_1.INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return parseUtil_js_1.INVALID;
              if (result.status === "dirty")
                return (0, parseUtil_js_1.DIRTY)(result.value);
              if (status.value === "dirty")
                return (0, parseUtil_js_1.DIRTY)(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return parseUtil_js_1.INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (result.status === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            if (status.value === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return parseUtil_js_1.INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!(0, parseUtil_js_1.isValid)(base))
              return parseUtil_js_1.INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!(0, parseUtil_js_1.isValid)(base))
                return parseUtil_js_1.INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
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
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    var ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.undefined) {
          return (0, parseUtil_js_1.OK)(void 0);
        }
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
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.null) {
          return (0, parseUtil_js_1.OK)(null);
        }
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
        if (ctx.parsedType === util_js_1.ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
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
          parent: {
            ...newCtx
          }
        });
        if ((0, parseUtil_js_1.isAsync)(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError_js_1.ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError_js_1.ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
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
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.nan,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    exports.ZodNaN = ZodNaN;
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    exports.BRAND = /* @__PURE__ */ Symbol("zod_brand");
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
    var ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return (0, parseUtil_js_1.DIRTY)(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return parseUtil_js_1.INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
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
          if ((0, parseUtil_js_1.isValid)(data)) {
            data.value = Object.freeze(data.value);
          }
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
      const p2 = typeof p === "string" ? { message: p } : p;
      return p2;
    }
    function custom(check, _params = {}, fatal) {
      if (check)
        return ZodAny.create().superRefine((data, ctx) => {
          const r = check(data);
          if (r instanceof Promise) {
            return r.then((r2) => {
              if (!r2) {
                const params = cleanParams(_params, data);
                const _fatal = params.fatal ?? fatal ?? true;
                ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
              }
            });
          }
          if (!r) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
          return;
        });
      return ZodAny.create();
    }
    exports.late = {
      object: ZodObject.lazycreate
    };
    var ZodFirstPartyTypeKind;
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (exports.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}));
    var instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    exports.instanceof = instanceOfType;
    var stringType = ZodString.create;
    exports.string = stringType;
    var numberType = ZodNumber.create;
    exports.number = numberType;
    var nanType = ZodNaN.create;
    exports.nan = nanType;
    var bigIntType = ZodBigInt.create;
    exports.bigint = bigIntType;
    var booleanType = ZodBoolean.create;
    exports.boolean = booleanType;
    var dateType = ZodDate.create;
    exports.date = dateType;
    var symbolType = ZodSymbol.create;
    exports.symbol = symbolType;
    var undefinedType = ZodUndefined.create;
    exports.undefined = undefinedType;
    var nullType = ZodNull.create;
    exports.null = nullType;
    var anyType = ZodAny.create;
    exports.any = anyType;
    var unknownType = ZodUnknown.create;
    exports.unknown = unknownType;
    var neverType = ZodNever.create;
    exports.never = neverType;
    var voidType = ZodVoid.create;
    exports.void = voidType;
    var arrayType = ZodArray.create;
    exports.array = arrayType;
    var objectType = ZodObject.create;
    exports.object = objectType;
    var strictObjectType = ZodObject.strictCreate;
    exports.strictObject = strictObjectType;
    var unionType = ZodUnion.create;
    exports.union = unionType;
    var discriminatedUnionType = ZodDiscriminatedUnion.create;
    exports.discriminatedUnion = discriminatedUnionType;
    var intersectionType = ZodIntersection.create;
    exports.intersection = intersectionType;
    var tupleType = ZodTuple.create;
    exports.tuple = tupleType;
    var recordType = ZodRecord.create;
    exports.record = recordType;
    var mapType = ZodMap.create;
    exports.map = mapType;
    var setType = ZodSet.create;
    exports.set = setType;
    var functionType = ZodFunction.create;
    exports.function = functionType;
    var lazyType = ZodLazy.create;
    exports.lazy = lazyType;
    var literalType = ZodLiteral.create;
    exports.literal = literalType;
    var enumType = ZodEnum.create;
    exports.enum = enumType;
    var nativeEnumType = ZodNativeEnum.create;
    exports.nativeEnum = nativeEnumType;
    var promiseType = ZodPromise.create;
    exports.promise = promiseType;
    var effectsType = ZodEffects.create;
    exports.effect = effectsType;
    exports.transformer = effectsType;
    var optionalType = ZodOptional.create;
    exports.optional = optionalType;
    var nullableType = ZodNullable.create;
    exports.nullable = nullableType;
    var preprocessType = ZodEffects.createWithPreprocess;
    exports.preprocess = preprocessType;
    var pipelineType = ZodPipeline.create;
    exports.pipeline = pipelineType;
    var ostring = () => stringType().optional();
    exports.ostring = ostring;
    var onumber = () => numberType().optional();
    exports.onumber = onumber;
    var oboolean = () => booleanType().optional();
    exports.oboolean = oboolean;
    exports.coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    exports.NEVER = parseUtil_js_1.INVALID;
  }
});

// node_modules/zod/v3/external.cjs
var require_external = __commonJS({
  "node_modules/zod/v3/external.cjs"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_errors(), exports);
    __exportStar(require_parseUtil(), exports);
    __exportStar(require_typeAliases(), exports);
    __exportStar(require_util(), exports);
    __exportStar(require_types(), exports);
    __exportStar(require_ZodError(), exports);
  }
});

// node_modules/zod/index.cjs
var require_zod = __commonJS({
  "node_modules/zod/index.cjs"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
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
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.z = void 0;
    var z = __importStar(require_external());
    exports.z = z;
    __exportStar(require_external(), exports);
    exports.default = z;
  }
});

// node_modules/@atproto/did/dist/did-error.js
var require_did_error = __commonJS({
  "node_modules/@atproto/did/dist/did-error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvalidDidError = exports.DidError = void 0;
    var DidError = class _DidError extends Error {
      constructor(did, message, code, status = 400, cause) {
        super(message, { cause });
        Object.defineProperty(this, "did", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: did
        });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: code
        });
        Object.defineProperty(this, "status", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: status
        });
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
        const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "An unknown error occurred";
        const status = (typeof cause?.["statusCode"] === "number" ? cause["statusCode"] : void 0) ?? (typeof cause?.["status"] === "number" ? cause["status"] : void 0);
        return new _DidError(did, message, "did-unknown-error", status, cause);
      }
    };
    exports.DidError = DidError;
    var InvalidDidError = class extends DidError {
      constructor(did, message, cause) {
        super(did, message, "did-invalid", 400, cause);
      }
    };
    exports.InvalidDidError = InvalidDidError;
  }
});

// node_modules/@atproto/did/dist/lib/uri.js
var require_uri = __commonJS({
  "node_modules/@atproto/did/dist/lib/uri.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.canParse = void 0;
    exports.isFragment = isFragment;
    exports.isHexDigit = isHexDigit;
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
    exports.canParse = URL.canParse?.bind(URL) ?? ((url, base) => {
      try {
        new URL(url, base);
        return true;
      } catch {
        return false;
      }
    });
  }
});

// node_modules/@atproto/did/dist/methods/plc.js
var require_plc = __commonJS({
  "node_modules/@atproto/did/dist/methods/plc.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DID_PLC_PREFIX = void 0;
    exports.isDidPlc = isDidPlc;
    exports.asDidPlc = asDidPlc;
    exports.assertDidPlc = assertDidPlc;
    var did_error_js_1 = require_did_error();
    var DID_PLC_PREFIX = `did:plc:`;
    exports.DID_PLC_PREFIX = DID_PLC_PREFIX;
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
        throw new did_error_js_1.InvalidDidError(typeof input, `DID must be a string`);
      }
      if (!input.startsWith(DID_PLC_PREFIX)) {
        throw new did_error_js_1.InvalidDidError(input, `Invalid did:plc prefix`);
      }
      if (input.length !== DID_PLC_LENGTH) {
        throw new did_error_js_1.InvalidDidError(input, `did:plc must be ${DID_PLC_LENGTH} characters long`);
      }
      for (let i = DID_PLC_PREFIX_LENGTH; i < DID_PLC_LENGTH; i++) {
        if (!isBase32Char(input.charCodeAt(i))) {
          throw new did_error_js_1.InvalidDidError(input, `Invalid character at position ${i}`);
        }
      }
    }
    var isBase32Char = (c) => c >= 97 && c <= 122 || c >= 50 && c <= 55;
  }
});

// node_modules/@atproto/did/dist/did.js
var require_did = __commonJS({
  "node_modules/@atproto/did/dist/did.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.didSchema = exports.DID_PREFIX = void 0;
    exports.assertDidMethod = assertDidMethod;
    exports.extractDidMethod = extractDidMethod;
    exports.assertDidMsid = assertDidMsid;
    exports.assertDid = assertDid;
    exports.isDid = isDid;
    exports.asDid = asDid;
    var zod_1 = require_zod();
    var did_error_js_1 = require_did_error();
    var DID_PREFIX = "did:";
    exports.DID_PREFIX = DID_PREFIX;
    var DID_PREFIX_LENGTH = DID_PREFIX.length;
    function assertDidMethod(input, start = 0, end = input.length) {
      if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > input.length) {
        throw new TypeError("Invalid start or end position");
      }
      if (end === start) {
        throw new did_error_js_1.InvalidDidError(input, `Empty method name`);
      }
      let c;
      for (let i = start; i < end; i++) {
        c = input.charCodeAt(i);
        if ((c < 97 || c > 122) && // a-z
        (c < 48 || c > 57)) {
          throw new did_error_js_1.InvalidDidError(input, `Invalid character at position ${i} in DID method name`);
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
        throw new did_error_js_1.InvalidDidError(input, `DID method-specific id must not be empty`);
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
              throw new did_error_js_1.InvalidDidError(input, `DID cannot end with ":"`);
            }
            continue;
          }
          if (c === 37) {
            c = input.charCodeAt(++i);
            if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
              throw new did_error_js_1.InvalidDidError(input, `Invalid pct-encoded character at position ${i}`);
            }
            c = input.charCodeAt(++i);
            if ((c < 48 || c > 57) && (c < 65 || c > 70)) {
              throw new did_error_js_1.InvalidDidError(input, `Invalid pct-encoded character at position ${i}`);
            }
            if (i >= end) {
              throw new did_error_js_1.InvalidDidError(input, `Incomplete pct-encoded character at position ${i - 2}`);
            }
            continue;
          }
          throw new did_error_js_1.InvalidDidError(input, `Disallowed character in DID at position ${i}`);
        }
      }
    }
    function assertDid(input) {
      if (typeof input !== "string") {
        throw new did_error_js_1.InvalidDidError(typeof input, `DID must be a string`);
      }
      const { length } = input;
      if (length > 2048) {
        throw new did_error_js_1.InvalidDidError(input, `DID is too long (2048 chars max)`);
      }
      if (!input.startsWith(DID_PREFIX)) {
        throw new did_error_js_1.InvalidDidError(input, `DID requires "${DID_PREFIX}" prefix`);
      }
      const idSep = input.indexOf(":", DID_PREFIX_LENGTH);
      if (idSep === -1) {
        throw new did_error_js_1.InvalidDidError(input, `Missing colon after method name`);
      }
      assertDidMethod(input, DID_PREFIX_LENGTH, idSep);
      assertDidMsid(input, idSep + 1, length);
    }
    function isDid(input) {
      try {
        assertDid(input);
        return true;
      } catch (err) {
        if (err instanceof did_error_js_1.DidError) {
          return false;
        }
        throw err;
      }
    }
    function asDid(input) {
      assertDid(input);
      return input;
    }
    exports.didSchema = zod_1.z.string().superRefine((value, ctx) => {
      try {
        assertDid(value);
        return true;
      } catch (err) {
        ctx.addIssue({
          code: zod_1.z.ZodIssueCode.custom,
          message: err instanceof Error ? err.message : "Unexpected error"
        });
        return false;
      }
    });
  }
});

// node_modules/@atproto/did/dist/methods/web.js
var require_web = __commonJS({
  "node_modules/@atproto/did/dist/methods/web.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DID_WEB_PREFIX = void 0;
    exports.isDidWeb = isDidWeb;
    exports.asDidWeb = asDidWeb;
    exports.assertDidWeb = assertDidWeb;
    exports.didWebToUrl = didWebToUrl;
    exports.urlToDidWeb = urlToDidWeb;
    exports.buildDidWebUrl = buildDidWebUrl;
    var did_error_js_1 = require_did_error();
    var did_js_1 = require_did();
    var uri_js_1 = require_uri();
    exports.DID_WEB_PREFIX = `did:web:`;
    function isDidWeb(input) {
      if (typeof input !== "string")
        return false;
      if (!input.startsWith(exports.DID_WEB_PREFIX))
        return false;
      if (input.charAt(exports.DID_WEB_PREFIX.length) === ":")
        return false;
      try {
        (0, did_js_1.assertDidMsid)(input, exports.DID_WEB_PREFIX.length);
      } catch {
        return false;
      }
      return (0, uri_js_1.canParse)(buildDidWebUrl(input));
    }
    function asDidWeb(input) {
      assertDidWeb(input);
      return input;
    }
    function assertDidWeb(input) {
      if (typeof input !== "string") {
        throw new did_error_js_1.InvalidDidError(typeof input, `DID must be a string`);
      }
      if (!input.startsWith(exports.DID_WEB_PREFIX)) {
        throw new did_error_js_1.InvalidDidError(input, `Invalid did:web prefix`);
      }
      if (input.charAt(exports.DID_WEB_PREFIX.length) === ":") {
        throw new did_error_js_1.InvalidDidError(input, "did:web MSID must not start with a colon");
      }
      (0, did_js_1.assertDidMsid)(input, exports.DID_WEB_PREFIX.length);
      if (!(0, uri_js_1.canParse)(buildDidWebUrl(input))) {
        throw new did_error_js_1.InvalidDidError(input, "Invalid Web DID");
      }
    }
    function didWebToUrl(did) {
      try {
        return new URL(buildDidWebUrl(did));
      } catch (cause) {
        throw new did_error_js_1.InvalidDidError(did, "Invalid Web DID", cause);
      }
    }
    function urlToDidWeb(url) {
      const port = url.port ? `%3A${url.port}` : "";
      const path = url.pathname === "/" ? "" : url.pathname.replaceAll("/", ":");
      return `did:web:${url.hostname}${port}${path}`;
    }
    function buildDidWebUrl(did) {
      const hostIdx = exports.DID_WEB_PREFIX.length;
      const pathIdx = did.indexOf(":", hostIdx);
      const hostEnc = pathIdx === -1 ? did.slice(hostIdx) : did.slice(hostIdx, pathIdx);
      const host = hostEnc.replaceAll("%3A", ":");
      const path = pathIdx === -1 ? "" : did.slice(pathIdx).replaceAll(":", "/");
      const proto = host.startsWith("localhost") && (host.length === 9 || host.charCodeAt(9) === 58) ? "http" : "https";
      return `${proto}://${host}${path}`;
    }
  }
});

// node_modules/@atproto/did/dist/methods.js
var require_methods = __commonJS({
  "node_modules/@atproto/did/dist/methods.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_plc(), exports);
    __exportStar(require_web(), exports);
  }
});

// node_modules/@atproto/did/dist/utils.js
var require_utils = __commonJS({
  "node_modules/@atproto/did/dist/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.matchesIdentifier = matchesIdentifier;
    function matchesIdentifier(did, id, candidate) {
      return candidate.charCodeAt(0) === 35 ? candidate.length === id.length + 1 && candidate.endsWith(id) : candidate.length === id.length + 1 + did.length && candidate.charCodeAt(did.length) === 35 && // '#'
      candidate.startsWith(did) && candidate.endsWith(id);
    }
  }
});

// node_modules/@atproto/did/dist/atproto.js
var require_atproto = __commonJS({
  "node_modules/@atproto/did/dist/atproto.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ATPROTO_VERIFICATION_METHOD_TYPES = exports.isAtprotoAudience = exports.atprotoDidSchema = void 0;
    exports.isAtprotoDid = isAtprotoDid3;
    exports.asAtprotoDid = asAtprotoDid;
    exports.assertAtprotoDid = assertAtprotoDid;
    exports.assertAtprotoDidWeb = assertAtprotoDidWeb;
    exports.isAtprotoDidWeb = isAtprotoDidWeb;
    exports.extractAtprotoData = extractAtprotoData;
    exports.extractPdsUrl = extractPdsUrl;
    exports.isAtprotoAka = isAtprotoAka;
    exports.isAtprotoPersonalDataServerService = isAtprotoPersonalDataServerService;
    exports.isAtprotoVerificationMethod = isAtprotoVerificationMethod;
    var zod_1 = require_zod();
    var did_error_js_1 = require_did_error();
    var uri_js_1 = require_uri();
    var methods_js_1 = require_methods();
    var utils_js_1 = require_utils();
    exports.atprotoDidSchema = zod_1.z.string().refine(isAtprotoDid3, `Atproto only allows "plc" and "web" DID methods`);
    function isAtprotoDid3(input) {
      return (0, methods_js_1.isDidPlc)(input) || isAtprotoDidWeb(input);
    }
    function asAtprotoDid(input) {
      assertAtprotoDid(input);
      return input;
    }
    function assertAtprotoDid(input) {
      if (typeof input !== "string") {
        throw new did_error_js_1.InvalidDidError(typeof input, `DID must be a string`);
      } else if (input.startsWith(methods_js_1.DID_PLC_PREFIX)) {
        (0, methods_js_1.assertDidPlc)(input);
      } else if (input.startsWith(methods_js_1.DID_WEB_PREFIX)) {
        assertAtprotoDidWeb(input);
      } else {
        throw new did_error_js_1.InvalidDidError(input, `Atproto only allows "plc" and "web" DID methods`);
      }
    }
    function assertAtprotoDidWeb(input) {
      (0, methods_js_1.assertDidWeb)(input);
      if (isDidWebWithPath(input)) {
        throw new did_error_js_1.InvalidDidError(input, `Atproto does not allow path components in Web DIDs`);
      }
      if (isDidWebWithHttpsPort(input)) {
        throw new did_error_js_1.InvalidDidError(input, `Atproto does not allow port numbers in Web DIDs, except for localhost`);
      }
    }
    function isAtprotoDidWeb(input) {
      if (!(0, methods_js_1.isDidWeb)(input)) {
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
      return did.includes(":", methods_js_1.DID_WEB_PREFIX.length);
    }
    function isLocalhostDid(did) {
      return did === "did:web:localhost" || did.startsWith("did:web:localhost:") || did.startsWith("did:web:localhost%3A");
    }
    function isDidWebWithHttpsPort(did) {
      if (isLocalhostDid(did))
        return false;
      const pathIdx = did.indexOf(":", methods_js_1.DID_WEB_PREFIX.length);
      const hasPort = pathIdx === -1 ? (
        // No path component, check if there's a port separator anywhere after
        // the "did:web:" prefix
        did.includes("%3A", methods_js_1.DID_WEB_PREFIX.length)
      ) : (
        // There is a path component; if there is an encoded colon *before* it,
        // then there is a port number
        did.lastIndexOf("%3A", pathIdx) !== -1
      );
      return hasPort;
    }
    var isAtprotoAudience = (value) => {
      if (typeof value !== "string")
        return false;
      const hashIndex = value.indexOf("#");
      if (hashIndex === -1)
        return false;
      if (value.indexOf("#", hashIndex + 1) !== -1)
        return false;
      return (0, uri_js_1.isFragment)(value, hashIndex + 1) && isAtprotoDid3(value.slice(0, hashIndex));
    };
    exports.isAtprotoAudience = isAtprotoAudience;
    function extractAtprotoData(document) {
      return {
        did: document.id,
        aka: document.alsoKnownAs?.find(isAtprotoAka)?.slice(5),
        key: document.verificationMethod?.find(isAtprotoVerificationMethod, document),
        pds: document.service?.find(isAtprotoPersonalDataServerService, document)
      };
    }
    function extractPdsUrl(document) {
      const service = document.service?.find(isAtprotoPersonalDataServerService, document);
      if (!service) {
        throw new did_error_js_1.DidError(document.id, `Document ${document.id} does not contain a (valid) #atproto_pds service URL`, "did-service-not-found");
      }
      return new URL(service.serviceEndpoint);
    }
    function isAtprotoAka(value) {
      return value.startsWith("at://");
    }
    function isAtprotoPersonalDataServerService(service) {
      return service?.type === "AtprotoPersonalDataServer" && typeof service.serviceEndpoint === "string" && (0, uri_js_1.canParse)(service.serviceEndpoint) && (0, utils_js_1.matchesIdentifier)(this.id, "atproto_pds", service.id);
    }
    exports.ATPROTO_VERIFICATION_METHOD_TYPES = Object.freeze([
      "EcdsaSecp256r1VerificationKey2019",
      "EcdsaSecp256k1VerificationKey2019",
      "Multikey"
    ]);
    function isAtprotoVerificationMethod(method) {
      return typeof method === "object" && typeof method?.publicKeyMultibase === "string" && exports.ATPROTO_VERIFICATION_METHOD_TYPES.includes(method.type) && (0, utils_js_1.matchesIdentifier)(this.id, "atproto", method.id);
    }
  }
});

// node_modules/@atproto/did/dist/did-document.js
var require_did_document = __commonJS({
  "node_modules/@atproto/did/dist/did-document.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.didDocumentValidator = exports.didDocumentSchema = void 0;
    var zod_1 = require_zod();
    var did_js_1 = require_did();
    var uri_js_1 = require_uri();
    var rfc3968UriSchema = zod_1.z.string().url("RFC3968 compliant URI");
    var didControllerSchema = zod_1.z.union([did_js_1.didSchema, zod_1.z.array(did_js_1.didSchema)]);
    var didRelativeUriSchema = zod_1.z.union([
      rfc3968UriSchema.refine((value) => {
        const fragmentIndex = value.indexOf("#");
        if (fragmentIndex === -1)
          return false;
        return (0, uri_js_1.isFragment)(value, fragmentIndex + 1);
      }, {
        message: "Missing or invalid fragment in RFC3968 URI"
      }),
      zod_1.z.string().refine((value) => value.charCodeAt(0) === 35, {
        message: "Fragment must start with #"
      }).refine((value) => (0, uri_js_1.isFragment)(value, 1), {
        message: "Invalid char in URI fragment"
      })
    ]);
    var didVerificationMethodSchema = zod_1.z.object({
      id: didRelativeUriSchema,
      type: zod_1.z.string().min(1),
      controller: didControllerSchema,
      publicKeyJwk: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
      publicKeyMultibase: zod_1.z.string().optional()
    });
    var didServiceIdSchema = didRelativeUriSchema;
    var didServiceTypeSchema = zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]);
    var didServiceEndpointSchema = zod_1.z.union([
      rfc3968UriSchema,
      zod_1.z.record(zod_1.z.string(), rfc3968UriSchema),
      zod_1.z.array(zod_1.z.union([rfc3968UriSchema, zod_1.z.record(zod_1.z.string(), rfc3968UriSchema)])).nonempty()
    ]);
    var didServiceSchema = zod_1.z.object({
      id: didServiceIdSchema,
      type: didServiceTypeSchema,
      serviceEndpoint: didServiceEndpointSchema
    });
    var verificationMethodReference = zod_1.z.union([
      //
      didRelativeUriSchema,
      didVerificationMethodSchema
    ]);
    exports.didDocumentSchema = zod_1.z.object({
      "@context": zod_1.z.union([
        zod_1.z.literal("https://www.w3.org/ns/did/v1"),
        zod_1.z.array(zod_1.z.string().url()).nonempty().refine((data) => data[0] === "https://www.w3.org/ns/did/v1", {
          message: "First @context must be https://www.w3.org/ns/did/v1"
        })
      ]).optional(),
      id: did_js_1.didSchema,
      controller: didControllerSchema.optional(),
      alsoKnownAs: zod_1.z.array(rfc3968UriSchema).optional(),
      service: zod_1.z.array(didServiceSchema).optional(),
      authentication: zod_1.z.array(verificationMethodReference).optional(),
      verificationMethod: zod_1.z.array(didVerificationMethodSchema).optional()
    });
    exports.didDocumentValidator = exports.didDocumentSchema.superRefine(({ id: did, service }, ctx) => {
      if (service) {
        const visited = /* @__PURE__ */ new Set();
        for (let i = 0; i < service.length; i++) {
          const current = service[i];
          const serviceId = current.id.startsWith("#") ? `${did}${current.id}` : current.id;
          if (!visited.has(serviceId)) {
            visited.add(serviceId);
          } else {
            ctx.addIssue({
              code: zod_1.z.ZodIssueCode.custom,
              message: `Duplicate service id (${current.id}) found in the document`,
              path: ["service", i, "id"]
            });
          }
        }
      }
    });
  }
});

// node_modules/@atproto/did/dist/index.js
var require_dist = __commonJS({
  "node_modules/@atproto/did/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_atproto(), exports);
    __exportStar(require_did_document(), exports);
    __exportStar(require_did_error(), exports);
    __exportStar(require_did(), exports);
    __exportStar(require_methods(), exports);
    __exportStar(require_utils(), exports);
  }
});

// dist/src/core/errors.js
var INTERPRETATION_ERRORS = Object.freeze({
  absent_result: "invalid_input",
  content_corrupt: "transient",
  content_missing: "transient",
  definition_binding: "invalid_input",
  definition_duplicate: "invalid_input",
  definition_manifest: "invalid_input",
  definition_path: "invalid_input",
  definition_size: "invalid_input",
  engine_input: "invalid_input",
  envelope: "invalid_input",
  evaluation_depth: "invalid_input",
  external_view: "invalid_input",
  fold_message: "invalid_input",
  fold_output: "invalid_input",
  fork: "invalid_input",
  incompatible_definition: "invalid_input",
  inspection_budget: "invalid_input",
  invalid_activation: "invalid_input",
  invalid_schema: "invalid_input",
  invalid_source: "invalid_input",
  noncanonical: "invalid_input",
  persistence_failed: "transient",
  reserved_key: "invalid_input",
  rollback: "invalid_input",
  schema_coercion: "invalid_input",
  schema_count: "invalid_input",
  schema_value: "invalid_input",
  sequence_limit: "invalid_input",
  source_bytes: "invalid_input",
  source_car: "invalid_input",
  source_complexity: "invalid_input",
  source_json: "invalid_input",
  source_pool_limit: "invalid_input",
  source_size: "invalid_input",
  source_utf8: "invalid_input",
  step_budget: "invalid_input",
  sum_overflow: "invalid_input",
  unicode: "invalid_input",
  unknown_component: "invalid_input",
  unknown_primitive: "invalid_input",
  unknown_query: "invalid_input",
  unknown_view: "invalid_input",
  unsupported_expression: "invalid_input",
  unsupported_function: "invalid_input",
  unsupported_runtime: "invalid_input",
  unsupported_schema: "invalid_input",
  unsupported_variable: "invalid_input",
  value_bytes: "invalid_input",
  value_depth: "invalid_input",
  view_limit: "invalid_input",
  view_props: "invalid_input",
  view_source: "invalid_input",
  wire_bytes: "invalid_input",
  wire_cid: "invalid_input",
  wire_depth: "invalid_input",
  wire_key: "invalid_input",
  wire_number: "invalid_input",
  wire_size: "invalid_input",
  wire_value: "invalid_input"
});
var HOST_ERRORS = Object.freeze({
  content_unavailable: "transient",
  archive: "invalid_input",
  archive_incomplete: "invalid_input",
  archive_inventory: "invalid_input",
  archive_pin: "invalid_input",
  archive_runtime: "invalid_input",
  archive_size: "invalid_input",
  file_exists: "invalid_input",
  protected_file: "invalid_input",
  source_output: "invalid_input",
  already_provisioned: "invalid_input",
  anchor: "invalid_input",
  content: "invalid_input",
  creation_conflict: "invalid_input",
  creation_id: "invalid_input",
  definition_changed: "invalid_input",
  dependency_mismatch: "runtime_fault",
  duplicate_retry: "invalid_input",
  engine_error: "runtime_fault",
  head: "invalid_input",
  input: "invalid_input",
  key: "invalid_input",
  missing_history: "invalid_input",
  native_proof_limit: "transient",
  origin: "invalid_input",
  path: "invalid_input",
  payload: "invalid_input",
  position: "invalid_input",
  predecessor: "invalid_input",
  replay: "invalid_input",
  retry_conflict: "invalid_input",
  runtime_fault: "runtime_fault",
  signature: "invalid_input",
  target: "invalid_input"
});
var ERROR_CODES = Object.freeze({ ...INTERPRETATION_ERRORS, ...HOST_ERRORS });
var AtseqError = class extends Error {
  code;
  kind;
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "AtseqError";
    this.kind = ERROR_CODES[code];
  }
};
var InterpretationError = class extends AtseqError {
  constructor(code, message) {
    super(code, message);
    this.name = "InterpretationError";
  }
};
var ProtocolError = class extends AtseqError {
  constructor(code, message) {
    super(code, message);
    this.name = "ProtocolError";
  }
};
var INTERPRETATION_CODES = Object.freeze(Object.keys(INTERPRETATION_ERRORS));

// dist/src/core/freeze.js
function deepFreeze(value) {
  const copy = structuredClone(value);
  function freeze(node) {
    if (node && typeof node === "object") {
      Object.values(node).forEach(freeze);
      Object.freeze(node);
    }
  }
  freeze(copy);
  return copy;
}

// dist/src/integrity/browser.js
function verifyInstalledDependencies() {
}

// package.json
var package_default = {
  name: "atseq",
  version: "0.1.0",
  type: "module",
  license: "Apache-2.0",
  engines: {
    node: ">=22.19"
  },
  scripts: {
    check: "tsc --noEmit && npm run format:check && npm run check:layers && npm run check:dependencies",
    test: "node scripts/source-run.mjs --test tests/*.test.ts",
    "spike:feasibility": "node scripts/source-run.mjs scripts/feasibility.ts",
    "test:protocol": "node scripts/source-run.mjs --test tests/protocol.test.ts",
    "test:pds": "node scripts/source-run.mjs --test tests/pds.test.ts",
    "test:runtime": "node scripts/source-run.mjs --test tests/runtime.test.ts tests/projection.test.ts",
    "test:dynamic-apps": "node scripts/source-run.mjs --test tests/dynamic-apps.test.ts",
    "test:flows": "node scripts/source-run.mjs scripts/flows.ts",
    "spike:acceptance": "node scripts/source-run.mjs scripts/acceptance.ts",
    "spike:report": "node scripts/source-run.mjs scripts/report.ts",
    "dev:experiment": "vite tests/support/browser --host 127.0.0.1",
    atseq: "node scripts/source-run.mjs src/cli/main.ts",
    "dev:app": "node scripts/source-run.mjs scripts/serve.ts",
    "test:archive": "node scripts/source-run.mjs --test tests/archive.test.ts",
    format: "prettier --write src scripts tests testdata experiments lexicons docs README.md package.json tsconfig.json tsconfig.build.json CONTRIBUTING.md .prettierrc.json .github",
    "format:check": "prettier --check src scripts tests testdata experiments lexicons docs README.md package.json tsconfig.json tsconfig.build.json CONTRIBUTING.md .prettierrc.json .github",
    "check:layers": "node scripts/check-layers.mjs",
    "check:dependencies": "node scripts/source-run.mjs scripts/check-dependencies.ts",
    setup: "node scripts/setup.mjs",
    build: "node scripts/build.mjs",
    prepack: "npm run build"
  },
  dependencies: {
    "@atcute/car": "6.1.0",
    "@atcute/cbor": "2.3.8",
    "@atcute/cid": "2.5.0",
    "@atcute/crypto": "2.4.4",
    "@atcute/did-plc": "1.0.2",
    "@atcute/mst": "1.1.1",
    "@atcute/multibase": "1.2.5",
    "@atcute/repo": "1.1.0",
    "@atcute/varint": "2.0.2",
    "@atproto-labs/fetch-node": "0.4.0",
    "@atproto/common-web": "0.5.10",
    "@atproto/did": "0.3.0",
    "@atproto/lexicon": "0.7.12",
    "@atproto/oauth-client-browser": "0.5.8",
    "@atproto/oauth-client-node": "0.5.8",
    "@atproto/syntax": "0.7.5",
    "@inlay/core": "0.0.13",
    "@inlay/render": "0.3.1",
    "@noble/secp256k1": "3.2.0",
    jsonata: "2.2.2",
    "jsonc-parser": "3.3.1",
    valibot: "1.5.0"
  },
  devDependencies: {
    "@ipld/dag-cbor": "7.0.3",
    "@playwright/test": "1.63.0",
    "@types/node": "26.4.1",
    multiformats: "9.9.0",
    prettier: "3.9.9",
    "ts-morph": "27.0.2",
    tsx: "4.23.13",
    typescript: "7.0.2",
    vite: "8.2.2"
  },
  imports: {
    "#atseq-integrity": {
      "atseq-source": {
        node: "./src/integrity/node.ts",
        default: "./src/integrity/browser.ts"
      },
      node: "./dist/src/integrity/node.js",
      default: "./dist/src/integrity/browser.js"
    }
  },
  description: "Signed application logs and reproducible interpretation on AT Protocol",
  main: "./dist/src/api/index.js",
  types: "./dist/src/api/index.d.ts",
  exports: {
    ".": {
      types: "./dist/src/api/index.d.ts",
      import: "./dist/src/api/index.js"
    },
    "./protocol": {
      types: "./dist/src/protocol/index.d.ts",
      import: "./dist/src/protocol/index.js"
    },
    "./runtime": {
      types: "./dist/src/runtime/index.d.ts",
      import: "./dist/src/runtime/index.js"
    },
    "./application": {
      types: "./dist/src/application/index.d.ts",
      import: "./dist/src/application/index.js"
    },
    "./client": {
      types: "./dist/src/client/index.d.ts",
      import: "./dist/src/client/index.js"
    },
    "./archive": {
      types: "./dist/src/archive/index.d.ts",
      import: "./dist/src/archive/index.js"
    },
    "./host": {
      types: "./dist/src/host/index.d.ts",
      import: "./dist/src/host/index.js"
    }
  },
  bin: {
    atseq: "./dist/src/cli/main.js",
    "atseq-host": "./dist/src/host/main.js"
  },
  files: [
    "dist",
    "src",
    "lexicons",
    "docs",
    "README.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "npm-shrinkwrap.json"
  ],
  bundleDependencies: true
};

// node_modules/@atcute/car/package.json
var package_default2 = {
  name: "@atcute/car",
  version: "6.1.0",
  description: "lightweight DASL CAR (content-addressable archives) codec for AT Protocol.",
  keywords: [
    "atproto",
    "car",
    "dasl"
  ],
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/utilities/car"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/cbor": "^2.3.8",
    "@atcute/cid": "^2.5.0",
    "@atcute/uint8array": "^1.2.0",
    "@atcute/varint": "^2.0.2"
  },
  devDependencies: {
    "@atcute/multibase": "^1.2.5",
    "@types/node": "^26.5.0",
    "@vitest/coverage-v8": "^5.0.0",
    vitest: "^5.0.0"
  },
  peerDependencies: {
    "@atcute/cbor": "^2.0.0",
    "@atcute/cid": "^2.0.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest --coverage",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/cbor/package.json
var package_default3 = {
  name: "@atcute/cbor",
  version: "2.3.8",
  description: "lightweight DASL dCBOR42 codec library for AT Protocol",
  keywords: [
    "atproto",
    "cbor",
    "dasl"
  ],
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/utilities/cbor"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  imports: {
    "#runtime": {
      workerd: "./dist/runtime.js",
      node: "./dist/runtime.node.js",
      default: "./dist/runtime.js"
    }
  },
  exports: {
    ".": "./dist/index.js",
    "./bytes": "./dist/bytes.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/cid": "^2.5.0",
    "@atcute/multibase": "^1.2.5",
    "@atcute/uint8array": "^1.2.0"
  },
  devDependencies: {
    "@ipld/dag-cbor": "^10.0.2",
    "@types/node": "^26.5.0",
    "@vitest/coverage-v8": "^5.0.0",
    "cbor-x": "^1.6.6",
    vitest: "^5.0.0"
  },
  peerDependencies: {
    "@atcute/cid": "^2.5.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/cid/package.json
var package_default4 = {
  name: "@atcute/cid",
  version: "2.5.0",
  description: "lightweight DASL CID codec library for AT Protocol",
  keywords: [
    "atproto",
    "cid",
    "dasl"
  ],
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/utilities/cid"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js",
    "./cid-link": "./dist/cid-link.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/multibase": "^1.2.5",
    "@atcute/uint8array": "^1.2.0"
  },
  devDependencies: {
    "@vitest/coverage-v8": "^5.0.0",
    vitest: "^5.0.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/crypto/package.json
var package_default5 = {
  name: "@atcute/crypto",
  version: "2.4.4",
  description: "lightweight atproto cryptographic library",
  keywords: [
    "atproto",
    "cryptography",
    "k256",
    "nistp256",
    "p256",
    "secp256k1"
  ],
  license: "0BSD",
  repository: {
    url: "https://github.com/mary-ext/atcute",
    directory: "packages/utilities/crypto"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  imports: {
    "#keypairs/secp256k1": {
      bun: "./dist/keypairs/secp256k1-web.js",
      deno: "./dist/keypairs/secp256k1-deno.js",
      node: "./dist/keypairs/secp256k1-node.js",
      default: "./dist/keypairs/secp256k1-web.js"
    }
  },
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@noble/secp256k1": "^3.1.0",
    "@atcute/multibase": "^1.2.5",
    "@atcute/uint8array": "^1.1.5"
  },
  devDependencies: {
    "@noble/curves": "^2.2.0",
    "@types/node": "^26.1.1",
    "@vitest/browser-playwright": "^4.1.10",
    "@vitest/coverage-v8": "^4.1.10",
    playwright: "^1.61.1",
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/did-plc/package.json
var package_default6 = {
  name: "@atcute/did-plc",
  version: "1.0.2",
  description: "validations, type definitions and schemas for did:plc operations",
  keywords: [
    "atproto",
    "did",
    "did-method-plc"
  ],
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/identity/did-plc"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/cbor": "^2.3.7",
    "@atcute/cid": "^2.4.2",
    "@atcute/crypto": "^2.4.4",
    "@atcute/identity": "^2.0.2",
    "@atcute/lexicons": "^2.1.0",
    "@atcute/multibase": "^1.2.5",
    "@atcute/uint8array": "^1.1.5",
    "@atcute/util-fetch": "^2.0.2",
    valibot: "^1.5.0"
  },
  devDependencies: {
    "@atcute/internal-dev-env": "^1.0.2",
    "@vitest/coverage-v8": "^5.0.0",
    vitest: "^5.0.0"
  },
  peerDependencies: {
    "@atcute/cbor": "^2.0.0",
    "@atcute/cid": "^2.0.0",
    "@atcute/identity": "^2.0.0",
    "@atcute/lexicons": "^2.0.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/identity/package.json
var package_default7 = {
  name: "@atcute/identity",
  version: "2.0.2",
  description: "syntax, type definitions and schemas for atproto handles, DIDs and DID documents",
  keywords: [
    "atproto",
    "did"
  ],
  license: "0BSD",
  repository: {
    url: "https://github.com/mary-ext/atcute",
    directory: "packages/identity/identity"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    valibot: "^1.4.2",
    "@atcute/lexicons": "^2.0.3"
  },
  devDependencies: {
    "@vitest/coverage-v8": "^4.1.10",
    vitest: "^4.1.10"
  },
  peerDependencies: {
    "@atcute/lexicons": "^2.0.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/lexicons/package.json
var package_default8 = {
  name: "@atcute/lexicons",
  version: "2.1.1",
  description: "AT Protocol core lexicon types and schema validations",
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/lexicons/lexicons"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js",
    "./ambient": "./dist/ambient.js",
    "./interfaces": "./dist/interfaces/index.js",
    "./syntax": "./dist/syntax/index.js",
    "./validations": "./dist/validations/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/uint8array": "^1.1.5",
    "@atcute/util-text": "^1.3.4",
    "@oomfware/eval": "^0.1.0",
    "@standard-schema/spec": "^1.1.0",
    "esm-env": "^1.2.2"
  },
  devDependencies: {
    "@atcute/cbor": "^2.3.7",
    "@atcute/multibase": "^1.2.5",
    "@vitest/coverage-v8": "^5.0.0",
    vitest: "^5.0.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest --coverage",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/mst/package.json
var package_default9 = {
  name: "@atcute/mst",
  version: "1.1.1",
  description: "atproto MST manipulation utilities",
  keywords: [
    "atproto",
    "mst",
    "repo"
  ],
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/utilities/mst"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/cbor": "^2.3.8",
    "@atcute/cid": "^2.5.0",
    "@atcute/uint8array": "^1.2.0"
  },
  devDependencies: {
    "@atcute/car": "^6.1.0",
    "@atcute/tid": "^1.1.4",
    "@types/node": "^26.5.0",
    "@vitest/coverage-v8": "^5.0.0",
    valibot: "^1.5.0",
    vitest: "^5.0.0"
  },
  peerDependencies: {
    "@atcute/cbor": "^2.0.0",
    "@atcute/cid": "^2.5.0"
  },
  scripts: {
    "generate-tests": "cd mst-test-suite && mise exec -- uv run python scripts/generate_exhaustive_cars.py",
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/multibase/package.json
var package_default10 = {
  name: "@atcute/multibase",
  version: "1.2.5",
  description: "multibase utilities",
  license: "0BSD",
  repository: {
    url: "https://github.com/mary-ext/atcute",
    directory: "packages/utilities/multibase"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  imports: {
    "#bases/base16": {
      bun: "./dist/bases/base16-web.js",
      workerd: "./dist/bases/base16-web.js",
      node: "./dist/bases/base16-node.js",
      default: "./dist/bases/base16-web.js"
    },
    "#bases/base32-encode": {
      bun: "./dist/bases/base32-encode.bun.js",
      default: "./dist/bases/base32-encode.js"
    },
    "#bases/base58": "./dist/bases/base58.js",
    "#bases/base64": {
      bun: "./dist/bases/base64-web.js",
      workerd: "./dist/bases/base64-web.js",
      node: "./dist/bases/base64-node.js",
      default: "./dist/bases/base64-web.js"
    }
  },
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/uint8array": "^1.1.5"
  },
  devDependencies: {
    "@types/node": "^26.1.1",
    "@vitest/coverage-v8": "^4.1.10",
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/repo/package.json
var package_default11 = {
  name: "@atcute/repo",
  version: "1.1.0",
  description: "AT Protocol repository decoder for AT Protocol.",
  keywords: [
    "atproto",
    "repo"
  ],
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/utilities/repo"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "@atcute/car": "^6.1.0",
    "@atcute/cbor": "^2.3.8",
    "@atcute/cid": "^2.5.0",
    "@atcute/crypto": "^2.4.4",
    "@atcute/lexicons": "^2.1.1",
    "@atcute/mst": "^1.1.1",
    "@atcute/uint8array": "^1.2.0"
  },
  devDependencies: {
    "@atcute/multibase": "^1.2.5",
    "@vitest/coverage-v8": "^5.0.0",
    vitest: "^5.0.0"
  },
  peerDependencies: {
    "@atcute/cbor": "^2.0.0",
    "@atcute/cid": "^2.5.0",
    "@atcute/lexicons": "^2.0.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest --coverage",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/uint8array/package.json
var package_default12 = {
  name: "@atcute/uint8array",
  version: "1.2.0",
  description: "uint8array utilities",
  license: "0BSD",
  repository: {
    url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
    directory: "packages/misc/uint8array"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": {
      bun: "./dist/index.bun.js",
      node: "./dist/index.node.js",
      default: "./dist/index.js"
    }
  },
  publishConfig: {
    access: "public"
  },
  devDependencies: {
    "@types/bun": "^1.4.2",
    vitest: "^5.0.0"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/util-fetch/package.json
var package_default13 = {
  name: "@atcute/util-fetch",
  version: "2.0.2",
  description: "internal fetch utilities",
  keywords: [
    "atproto",
    "did"
  ],
  license: "0BSD",
  repository: {
    url: "https://github.com/mary-ext/atcute",
    directory: "packages/misc/util-fetch"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    valibot: "^1.4.2"
  },
  scripts: {
    build: "tsc",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/util-text/package.json
var package_default14 = {
  name: "@atcute/util-text",
  version: "1.3.4",
  description: "internal text utilities",
  license: "0BSD",
  repository: {
    url: "https://github.com/mary-ext/atcute",
    directory: "packages/misc/util-text"
  },
  files: [
    "dist/",
    "!dist/**/*.bench.js",
    "!dist/**/*.test.js",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": {
      "react-native": "./dist/index.rn.js",
      default: "./dist/index.js"
    }
  },
  publishConfig: {
    access: "public"
  },
  dependencies: {
    "unicode-segmenter": "^0.17.0"
  },
  devDependencies: {
    "@types/node": "^26.1.1",
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atcute/util-text/node_modules/unicode-segmenter/package.json
var package_default15 = {
  name: "unicode-segmenter",
  version: "0.17.3",
  type: "module",
  description: "A lightweight implementation of the Unicode Text Segmentation (UAX #29)",
  license: "MIT",
  homepage: "https://github.com/cometkim/unicode-segmenter",
  keywords: [
    "unicode",
    "uax29",
    "text-segmentation",
    "grapheme",
    "grapheme-cluster",
    "emoji",
    "intl",
    "polyfill"
  ],
  repository: {
    type: "git",
    url: "git+https://github.com/cometkim/unicode-segmenter.git"
  },
  maintainers: [
    {
      email: "hey@hyeseong.kim",
      name: "Hyeseong Kim"
    }
  ],
  exports: {
    ".": {
      import: "./index.js",
      require: "./index.cjs"
    },
    "./emoji": {
      import: "./emoji.js",
      require: "./emoji.cjs"
    },
    "./general": {
      import: "./general.js",
      require: "./general.cjs"
    },
    "./grapheme": {
      import: "./grapheme.js",
      require: "./grapheme.cjs"
    },
    "./utils": {
      import: "./utils.js",
      require: "./utils.cjs"
    },
    "./intl-adapter": {
      import: "./intl-adapter.js",
      require: "./intl-adapter.cjs"
    },
    "./intl-polyfill": {
      import: "./intl-polyfill.js",
      require: "./intl-polyfill.cjs"
    },
    "./package.json": "./package.json"
  },
  imports: {
    "#src/*": "./src/*"
  },
  sideEffects: [
    "./intl-polyfill.js",
    "./intl-polyfill.cjs"
  ],
  publishConfig: {
    access: "public",
    provenance: true,
    main: "./index.js",
    types: "./index.d.ts",
    exports: {
      ".": {
        import: "./index.js",
        require: "./index.cjs"
      },
      "./emoji": {
        import: "./emoji.js",
        require: "./emoji.cjs"
      },
      "./general": {
        import: "./general.js",
        require: "./general.cjs"
      },
      "./grapheme": {
        import: "./grapheme.js",
        require: "./grapheme.cjs"
      },
      "./utils": {
        import: "./utils.js",
        require: "./utils.cjs"
      },
      "./intl-adapter": {
        import: "./intl-adapter.js",
        require: "./intl-adapter.cjs"
      },
      "./intl-polyfill": {
        import: "./intl-polyfill.js",
        require: "./intl-polyfill.cjs"
      },
      "./package.json": "./package.json"
    }
  },
  files: [
    "/*.js",
    "/*.cjs",
    "/*.d.ts",
    "/*.d.cts"
  ],
  scripts: {
    prepack: "yarn clean && yarn build",
    clean: 'rimraf -g "*.js" "*.cjs" "*.map" "*.d.ts" "*.d.cts"',
    build: "node scripts/build-exports.js",
    test: "node --test --test-reporter spec --test-reporter-destination=stdout",
    "test:coverage": "yarn test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=lcov.info",
    "bundle-stats:emoji": "node benchmark/emoji/bundle-stats.js",
    "bundle-stats:general": "node benchmark/general/bundle-stats.js",
    "bundle-stats:grapheme": "node benchmark/grapheme/bundle-stats.js",
    "bundle-stats:grapheme:hermes": "node benchmark/grapheme/bundle-stats-hermes.js",
    "memory-stats:grapheme": "node benchmark/grapheme/memory-stats.js",
    "perf:emoji": "node --expose-gc benchmark/emoji/perf.js",
    "perf:general": "node --expose-gc benchmark/general/perf.js",
    "perf:grapheme": "node --expose-gc benchmark/grapheme/perf.js",
    "perf:grapheme:browser": "vite -c benchmark/grapheme/vite.config.js",
    "perf:grapheme:hermes": "node benchmark/grapheme/perf-hermes.js",
    "perf:grapheme:quickjs": "node benchmark/grapheme/perf-quickjs.js",
    "perf:grapheme-count": "node --expose-gc benchmark/grapheme/perf-count.js",
    "perf:grapheme-collect": "node --expose-gc benchmark/grapheme/perf-collect.js"
  },
  alias: {
    process: false
  },
  devDependencies: {
    "@babel/core": "^7.28.6",
    "@babel/plugin-transform-modules-commonjs": "^7.28.6",
    "@changesets/cli": "^2.29.8",
    "@codspeed/tinybench-plugin": "^5.0.1",
    "@formatjs/intl-segmenter": "patch:@formatjs/intl-segmenter@npm%3A12.1.0#~/.yarn/patches/@formatjs-intl-segmenter-npm-12.1.0-9f4532c94c.patch",
    "@mitata/counters": "^0.0.8",
    "@react-native/metro-babel-transformer": "^0.83.1",
    "@types/babel__core": "^7.20.5",
    "@types/node": "^25.1.0",
    "emoji-regex": "10.6.0",
    "emojibase-regex": "17.0.0",
    esbuild: "^0.27.2",
    "fast-check": "^4.5.3",
    "grapheme-splitter": "1.0.4",
    graphemer: "1.4.0",
    metro: "^0.83.3",
    mitata: "^1.0.34",
    "os-browserify": "^0.3.0",
    "pkg-pr-new": "^0.0.66",
    "pretty-bytes": "^7.1.0",
    rimraf: "^6.1.2",
    tinybench: "^5.1.0",
    typescript: "^5.9.3",
    "unicode-segmentation-wasm": "github:cometkim/unicode-segmentation-wasm#230eb74d320ea2f31f95b74ddb2567186d496587",
    vite: "^7.3.1",
    "vite-plugin-externals": "^0.6.2",
    xregexp: "5.1.2",
    zx: "^8.8.5"
  },
  packageManager: "yarn@4.17.1",
  main: "./index.js",
  types: "./index.d.ts"
};

// node_modules/@atcute/varint/package.json
var package_default16 = {
  name: "@atcute/varint",
  version: "2.0.2",
  description: "protobuf-style LEB128 varint codec library",
  license: "0BSD",
  repository: {
    url: "https://github.com/mary-ext/atcute",
    directory: "packages/utilities/varint"
  },
  files: [
    "dist/",
    "!dist/**/*.{test,bench}.*"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.js"
  },
  publishConfig: {
    access: "public"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc",
    test: "vitest",
    prepublish: "rm -rf dist; pnpm run build"
  }
};

// node_modules/@atproto-labs/did-resolver/package.json
var package_default17 = {
  name: "@atproto-labs/did-resolver",
  version: "0.2.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "resolver"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/did-resolver"
  },
  type: "commonjs",
  main: "dist/index.js",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto-labs/fetch": "0.2.3",
    "@atproto-labs/pipe": "0.1.1",
    "@atproto-labs/simple-store": "0.3.0",
    "@atproto-labs/simple-store-memory": "0.1.4",
    "@atproto/did": "0.3.0"
  },
  devDependencies: {
    typescript: "^5.6.3"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto-labs/fetch/package.json
var package_default18 = {
  name: "@atproto-labs/fetch",
  version: "0.2.3",
  license: "MIT",
  description: "Isomorphic wrapper utilities for fetch API",
  keywords: [
    "atproto",
    "fetch"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/fetch"
  },
  type: "commonjs",
  main: "dist/index.js",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    "@atproto-labs/pipe": "0.1.1"
  },
  devDependencies: {
    typescript: "^5.6.3"
  },
  scripts: {
    build: "tsc --build tsconfig.json"
  }
};

// node_modules/@atproto-labs/fetch-node/package.json
var package_default19 = {
  name: "@atproto-labs/fetch-node",
  version: "0.4.0",
  license: "MIT",
  description: "SSRF protection for fetch() in Node.js",
  keywords: [
    "atproto",
    "fetch",
    "node"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/fetch-node"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "ipaddr.js": "^2.1.0",
    undici_v6: "npm:undici@^6.x",
    undici_v7: "npm:undici@^7.x",
    undici_v8: "npm:undici@^8.x",
    "@atproto-labs/fetch": "^0.3.6",
    "@atproto-labs/pipe": "^0.2.4"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc --build tsconfig.json",
    test: "vitest run"
  }
};

// node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch/package.json
var package_default20 = {
  name: "@atproto-labs/fetch",
  version: "0.3.6",
  license: "MIT",
  description: "Isomorphic wrapper utilities for fetch API",
  keywords: [
    "atproto",
    "fetch"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/fetch"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/pipe": "^0.2.4"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc --build tsconfig.json",
    test: "vitest run"
  }
};

// node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe/package.json
var package_default21 = {
  name: "@atproto-labs/pipe",
  version: "0.2.4",
  license: "MIT",
  description: "Library for combining multiple functions into a single function.",
  keywords: [
    "atproto",
    "transformer"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/pipe"
  },
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  scripts: {
    build: "tsgo --build tsconfig.json"
  }
};

// node_modules/@atproto-labs/handle-resolver/package.json
var package_default22 = {
  name: "@atproto-labs/handle-resolver",
  version: "0.4.10",
  license: "MIT",
  description: "Isomorphic ATProto handle to DID resolver",
  keywords: [
    "atproto",
    "oauth",
    "handle",
    "identity",
    "browser",
    "node",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/handle-resolver"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto-labs/simple-store-memory": "^0.2.6",
    "@atproto/did": "^0.5.6",
    "@atproto-labs/simple-store": "^0.5.1"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto-labs/handle-resolver-node/package.json
var package_default23 = {
  name: "@atproto-labs/handle-resolver-node",
  version: "0.2.11",
  license: "MIT",
  description: "Node specific ATProto handle to DID resolver",
  keywords: [
    "atproto",
    "oauth",
    "handle",
    "identity",
    "node"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/handle-resolver-node"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/handle-resolver": "^0.4.10",
    "@atproto-labs/fetch-node": "^0.4.0",
    "@atproto/did": "^0.5.6"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did/package.json
var package_default24 = {
  name: "@atproto/did",
  version: "0.5.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.39",
    jest: "^30.5.2"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "NODE_OPTIONS=--experimental-vm-modules jest"
  }
};

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store/package.json
var package_default25 = {
  name: "@atproto-labs/simple-store",
  version: "0.5.1",
  license: "MIT",
  description: "Simple store interfaces & utilities",
  keywords: [
    "cache",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory/package.json
var package_default26 = {
  name: "@atproto-labs/simple-store-memory",
  version: "0.2.6",
  license: "MIT",
  description: "Memory based simple-store implementation",
  keywords: [
    "cache",
    "isomorphic",
    "memory"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store-memory"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "lru-cache": "^10.2.0",
    "@atproto-labs/simple-store": "^0.5.1"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/package.json
var package_default27 = {
  name: "@atproto/did",
  version: "0.5.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.39",
    jest: "^30.5.2"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "NODE_OPTIONS=--experimental-vm-modules jest"
  }
};

// node_modules/@atproto-labs/identity-resolver/package.json
var package_default28 = {
  name: "@atproto-labs/identity-resolver",
  version: "0.4.10",
  license: "MIT",
  description: "A library resolving ATPROTO identities",
  keywords: [
    "atproto",
    "identity",
    "isomorphic",
    "resolver"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/identity-resolver"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/did-resolver": "^0.3.10",
    "@atproto-labs/handle-resolver": "^0.4.10"
  },
  scripts: {
    build: "tsc --build tsconfig.json"
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/package.json
var package_default29 = {
  name: "@atproto-labs/did-resolver",
  version: "0.3.10",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "resolver"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/did-resolver"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto-labs/fetch": "^0.3.6",
    "@atproto-labs/pipe": "^0.2.4",
    "@atproto-labs/simple-store": "^0.5.1",
    "@atproto-labs/simple-store-memory": "^0.2.6",
    "@atproto/did": "^0.5.6"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/package.json
var package_default30 = {
  name: "@atproto-labs/fetch",
  version: "0.3.6",
  license: "MIT",
  description: "Isomorphic wrapper utilities for fetch API",
  keywords: [
    "atproto",
    "fetch"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/fetch"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/pipe": "^0.2.4"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc --build tsconfig.json",
    test: "vitest run"
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe/package.json
var package_default31 = {
  name: "@atproto-labs/pipe",
  version: "0.2.4",
  license: "MIT",
  description: "Library for combining multiple functions into a single function.",
  keywords: [
    "atproto",
    "transformer"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/pipe"
  },
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  scripts: {
    build: "tsgo --build tsconfig.json"
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store/package.json
var package_default32 = {
  name: "@atproto-labs/simple-store",
  version: "0.5.1",
  license: "MIT",
  description: "Simple store interfaces & utilities",
  keywords: [
    "cache",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory/package.json
var package_default33 = {
  name: "@atproto-labs/simple-store-memory",
  version: "0.2.6",
  license: "MIT",
  description: "Memory based simple-store implementation",
  keywords: [
    "cache",
    "isomorphic",
    "memory"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store-memory"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "lru-cache": "^10.2.0",
    "@atproto-labs/simple-store": "^0.5.1"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/package.json
var package_default34 = {
  name: "@atproto/did",
  version: "0.5.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.39",
    jest: "^30.5.2"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "NODE_OPTIONS=--experimental-vm-modules jest"
  }
};

// node_modules/@atproto-labs/pipe/package.json
var package_default35 = {
  name: "@atproto-labs/pipe",
  version: "0.1.1",
  license: "MIT",
  description: "Library for combining multiple functions into a single function.",
  keywords: [
    "atproto",
    "transformer"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/pipe"
  },
  type: "commonjs",
  main: "dist/index.js",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  devDependencies: {
    typescript: "^5.6.3"
  },
  scripts: {
    build: "tsc --build tsconfig.json"
  }
};

// node_modules/@atproto-labs/simple-store/package.json
var package_default36 = {
  name: "@atproto-labs/simple-store",
  version: "0.3.0",
  license: "MIT",
  description: "Simple store interfaces & utilities",
  keywords: [
    "cache",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store"
  },
  type: "commonjs",
  main: "dist/index.js",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  devDependencies: {
    typescript: "^5.6.3"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto-labs/simple-store-memory/package.json
var package_default37 = {
  name: "@atproto-labs/simple-store-memory",
  version: "0.1.4",
  license: "MIT",
  description: "Memory based simple-store implementation",
  keywords: [
    "cache",
    "isomorphic",
    "memory"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store-memory"
  },
  type: "commonjs",
  main: "dist/index.js",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    "lru-cache": "^10.2.0",
    "@atproto-labs/simple-store": "0.3.0"
  },
  devDependencies: {
    typescript: "^5.6.3"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/common/package.json
var package_default38 = {
  name: "@atproto/common",
  version: "0.5.16",
  license: "MIT",
  description: "Shared web-platform-friendly code for atproto libraries",
  keywords: [
    "atproto"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/common"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  engines: {
    node: ">=18.7.0"
  },
  dependencies: {
    multiformats: "^9.9.0",
    pino: "^8.21.0",
    "@atproto/common-web": "^0.4.20",
    "@atproto/lex-cbor": "^0.0.16",
    "@atproto/lex-data": "^0.0.15"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3",
    uint8arrays: "3.0.0"
  },
  scripts: {
    test: "jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/common-web/package.json
var package_default39 = {
  name: "@atproto/common-web",
  version: "0.5.10",
  license: "MIT",
  description: "Shared web-platform-friendly code for atproto libraries",
  keywords: [
    "atproto"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/common-web"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto/lex-data": "^0.1.7",
    "@atproto/lex-json": "^0.1.6",
    "@atproto/syntax": "^0.7.5"
  },
  devDependencies: {
    jest: "^30.0.0"
  },
  scripts: {
    test: "NODE_OPTIONS=--experimental-vm-modules jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/common/node_modules/@atproto/common-web/package.json
var package_default40 = {
  name: "@atproto/common-web",
  version: "0.4.21",
  license: "MIT",
  description: "Shared web-platform-friendly code for atproto libraries",
  keywords: [
    "atproto"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/common-web"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    zod: "^3.23.8",
    "@atproto/lex-data": "^0.0.15",
    "@atproto/lex-json": "^0.0.16",
    "@atproto/syntax": "^0.5.4"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3"
  },
  scripts: {
    test: "jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/common/node_modules/@atproto/lex-cbor/package.json
var package_default41 = {
  name: "@atproto/lex-cbor",
  version: "0.0.16",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in CBOR format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "cbor",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-cbor"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.cjs",
  module: "./dist/index.mjs",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.mjs",
      import: "./dist/index.mjs",
      default: "./dist/index.cjs"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.15"
  },
  devDependencies: {
    cborg: "^4.5.8",
    vite: "^6.2.0",
    vitest: "^4.0.16",
    "@atproto/lex-json": "^0.0.15"
  },
  scripts: {
    dev: "vite build --watch",
    prebuild: "vite build --emptyOutDir",
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/common/node_modules/@atproto/lex-data/package.json
var package_default42 = {
  name: "@atproto/lex-data",
  version: "0.0.15",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/common/node_modules/@atproto/lex-json/package.json
var package_default43 = {
  name: "@atproto/lex-json",
  version: "0.0.16",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in JSON format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "json",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-json"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.15"
  },
  devDependencies: {
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/common/node_modules/@atproto/syntax/package.json
var package_default44 = {
  name: "@atproto/syntax",
  version: "0.5.4",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/crypto/package.json
var package_default45 = {
  name: "@atproto/crypto",
  version: "0.4.5",
  license: "MIT",
  description: "Library for cryptographic keys and signing in atproto",
  keywords: [
    "atproto",
    "cryptography"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/crypto"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  engines: {
    node: ">=18.7.0"
  },
  dependencies: {
    "@noble/curves": "^1.7.0",
    "@noble/hashes": "^1.6.1",
    uint8arrays: "3.0.0"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3",
    "@atproto/common": "^0.5.2"
  },
  scripts: {
    test: "jest ",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/did/package.json
var package_default46 = {
  name: "@atproto/did",
  version: "0.3.0",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  type: "commonjs",
  main: "dist/index.js",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.24",
    jest: "^28.1.2",
    typescript: "^5.6.3"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "jest"
  }
};

// node_modules/@atproto/jwk/package.json
var package_default47 = {
  name: "@atproto/jwk",
  version: "0.7.4",
  license: "MIT",
  description: "A library for working with JSON Web Keys (JWKs) in TypeScript. This is meant to be extended by environment-specific libraries like @atproto/jwk-jose.",
  keywords: [
    "atproto",
    "jwk",
    "jwks",
    "jwt",
    "json web key"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/oauth/jwk"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    multiformats: "^13.0.0",
    zod: "^3.23.8"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto/jwk-jose/package.json
var package_default48 = {
  name: "@atproto/jwk-jose",
  version: "0.2.4",
  license: "MIT",
  description: "`jose` based implementation of @atproto/jwk Key's",
  keywords: [
    "atproto",
    "jwk",
    "jose"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/oauth/jwk-jose"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    jose: "^5.2.0",
    "@atproto/jwk": "^0.7.4"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto/jwk-webcrypto/package.json
var package_default49 = {
  name: "@atproto/jwk-webcrypto",
  version: "0.3.4",
  license: "MIT",
  description: "Webcrypto based implementation of @atproto/jwk Key's",
  keywords: [
    "atproto",
    "jwk",
    "webcrypto"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/oauth/jwk-webcrypto"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto/jwk": "^0.7.4",
    "@atproto/jwk-jose": "^0.2.4"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto/jwk/node_modules/multiformats/package.json
var package_default50 = {
  name: "multiformats",
  version: "13.4.2",
  description: "Interface for multihash, multicodec, multibase and CID",
  author: "Mikeal Rogers <mikeal.rogers@gmail.com> (https://www.mikealrogers.com/)",
  license: "Apache-2.0 OR MIT",
  homepage: "https://github.com/multiformats/js-multiformats#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/multiformats/js-multiformats.git"
  },
  bugs: {
    url: "https://github.com/multiformats/js-multiformats/issues"
  },
  publishConfig: {
    access: "public",
    provenance: true
  },
  keywords: [
    "ipfs",
    "ipld",
    "multiformats"
  ],
  type: "module",
  types: "./dist/src/index.d.ts",
  typesVersions: {
    "*": {
      "*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ],
      "src/*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ]
    }
  },
  files: [
    "src",
    "dist",
    "!dist/test",
    "!**/*.tsbuildinfo"
  ],
  exports: {
    ".": {
      types: "./dist/src/index.d.ts",
      import: "./dist/src/index.js"
    },
    "./bases/base10": {
      types: "./dist/src/bases/base10.d.ts",
      import: "./dist/src/bases/base10.js"
    },
    "./bases/base16": {
      types: "./dist/src/bases/base16.d.ts",
      import: "./dist/src/bases/base16.js"
    },
    "./bases/base2": {
      types: "./dist/src/bases/base2.d.ts",
      import: "./dist/src/bases/base2.js"
    },
    "./bases/base256emoji": {
      types: "./dist/src/bases/base256emoji.d.ts",
      import: "./dist/src/bases/base256emoji.js"
    },
    "./bases/base32": {
      types: "./dist/src/bases/base32.d.ts",
      import: "./dist/src/bases/base32.js"
    },
    "./bases/base36": {
      types: "./dist/src/bases/base36.d.ts",
      import: "./dist/src/bases/base36.js"
    },
    "./bases/base58": {
      types: "./dist/src/bases/base58.d.ts",
      import: "./dist/src/bases/base58.js"
    },
    "./bases/base64": {
      types: "./dist/src/bases/base64.d.ts",
      import: "./dist/src/bases/base64.js"
    },
    "./bases/base8": {
      types: "./dist/src/bases/base8.d.ts",
      import: "./dist/src/bases/base8.js"
    },
    "./bases/identity": {
      types: "./dist/src/bases/identity.d.ts",
      import: "./dist/src/bases/identity.js"
    },
    "./bases/interface": {
      types: "./dist/src/bases/interface.d.ts",
      import: "./dist/src/bases/interface.js"
    },
    "./basics": {
      types: "./dist/src/basics.d.ts",
      import: "./dist/src/basics.js"
    },
    "./block": {
      types: "./dist/src/block.d.ts",
      import: "./dist/src/block.js"
    },
    "./block/interface": {
      types: "./dist/src/block/interface.d.ts",
      import: "./dist/src/block/interface.js"
    },
    "./bytes": {
      types: "./dist/src/bytes.d.ts",
      import: "./dist/src/bytes.js"
    },
    "./cid": {
      types: "./dist/src/cid.d.ts",
      import: "./dist/src/cid.js"
    },
    "./codecs/interface": {
      types: "./dist/src/codecs/interface.d.ts",
      import: "./dist/src/codecs/interface.js"
    },
    "./codecs/json": {
      types: "./dist/src/codecs/json.d.ts",
      import: "./dist/src/codecs/json.js"
    },
    "./codecs/raw": {
      types: "./dist/src/codecs/raw.d.ts",
      import: "./dist/src/codecs/raw.js"
    },
    "./hashes/digest": {
      types: "./dist/src/hashes/digest.d.ts",
      import: "./dist/src/hashes/digest.js"
    },
    "./hashes/hasher": {
      types: "./dist/src/hashes/hasher.d.ts",
      import: "./dist/src/hashes/hasher.js"
    },
    "./hashes/identity": {
      types: "./dist/src/hashes/identity.d.ts",
      import: "./dist/src/hashes/identity.js"
    },
    "./hashes/interface": {
      types: "./dist/src/hashes/interface.d.ts",
      import: "./dist/src/hashes/interface.js"
    },
    "./hashes/sha1": {
      types: "./dist/types/src/hashes/sha1.d.ts",
      browser: "./dist/src/hashes/sha1-browser.js",
      import: "./dist/src/hashes/sha1.js"
    },
    "./hashes/sha2": {
      types: "./dist/src/hashes/sha2.d.ts",
      browser: "./dist/src/hashes/sha2-browser.js",
      import: "./dist/src/hashes/sha2.js"
    },
    "./interface": {
      types: "./dist/src/interface.d.ts",
      import: "./dist/src/interface.js"
    },
    "./link": {
      types: "./dist/src/link.d.ts",
      import: "./dist/src/link.js"
    },
    "./link/interface": {
      types: "./dist/src/link/interface.d.ts",
      import: "./dist/src/link/interface.js"
    },
    "./traversal": {
      types: "./dist/src/traversal.d.ts",
      import: "./dist/src/traversal.js"
    }
  },
  eslintConfig: {
    extends: "ipfs",
    parserOptions: {
      project: true,
      sourceType: "module"
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              type: "deps",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Documentation"
              },
              {
                type: "deps",
                section: "Dependencies"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      [
        "@semantic-release/git",
        {
          assets: [
            "CHANGELOG.md",
            "package.json"
          ]
        }
      ]
    ]
  },
  scripts: {
    clean: "aegir clean",
    lint: "aegir lint",
    build: "aegir build",
    release: "aegir release",
    docs: "aegir docs",
    test: "npm run lint && npm run test:node && npm run test:chrome",
    "test:node": "aegir test -t node --cov",
    "test:chrome": "aegir test -t browser --cov",
    "test:chrome-webworker": "aegir test -t webworker",
    "test:firefox": "aegir test -t browser -- --browser firefox",
    "test:firefox-webworker": "aegir test -t webworker -- --browser firefox",
    "test:electron-main": "aegir test -t electron-main"
  },
  devDependencies: {
    "@stablelib/sha256": "^2.0.0",
    "@stablelib/sha512": "^2.0.0",
    "@types/node": "^25.0.0",
    aegir: "^47.0.7",
    buffer: "^6.0.3",
    cids: "^1.1.9",
    "crypto-hash": "^4.0.0"
  },
  aegir: {
    test: {
      target: [
        "node",
        "browser"
      ]
    }
  },
  browser: {
    "./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
    "./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
    "./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
    "./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
  }
};

// node_modules/@atproto/lex/package.json
var package_default51 = {
  name: "@atproto/lex",
  version: "0.0.18",
  license: "MIT",
  description: "Lexicon tooling for AT",
  keywords: [
    "atproto",
    "lexicon",
    "lex"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex"
  },
  files: [
    "./dist",
    "./bin",
    "./CHANGELOG.md"
  ],
  bin: {
    "ts-lex": "./bin/lex",
    lex: "./bin/lex"
  },
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    yargs: "^17.0.0",
    "@atproto/lex-builder": "^0.0.16",
    "@atproto/lex-client": "^0.0.13",
    "@atproto/lex-data": "^0.0.12",
    "@atproto/lex-json": "^0.0.12",
    "@atproto/lex-installer": "^0.0.18",
    "@atproto/lex-schema": "^0.0.13"
  },
  devDependencies: {
    "@types/yargs": "^17.0.33",
    vitest: "^4.0.16"
  },
  scripts: {
    prebuild: "./bin/lex build --clear --lexicons ./lexicons --out ./tests/lexicons --lib @atproto/lex-schema -- ignore additional npm args",
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-builder/package.json
var package_default52 = {
  name: "@atproto/lex-builder",
  version: "0.0.16",
  license: "MIT",
  description: "TypeScript schema builder for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "build",
    "lex"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-builder"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      require: "./dist/index.js",
      import: "./dist/index.js"
    }
  },
  dependencies: {
    prettier: "^3.2.5",
    "ts-morph": "^27.0.0",
    tslib: "^2.8.1",
    "@atproto/lex-document": "^0.0.14",
    "@atproto/lex-schema": "^0.0.13"
  },
  devDependencies: {
    "@ts-morph/common": "^0.28.0",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-cbor/package.json
var package_default53 = {
  name: "@atproto/lex-cbor",
  version: "0.0.13",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in CBOR format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "cbor",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-cbor"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.cjs",
  module: "./dist/index.mjs",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.mjs",
      import: "./dist/index.mjs",
      default: "./dist/index.cjs"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.12"
  },
  devDependencies: {
    cborg: "^4.5.8",
    vite: "^6.2.0",
    vitest: "^4.0.16",
    "@atproto/lex-json": "^0.0.12"
  },
  scripts: {
    dev: "vite build --watch",
    prebuild: "vite build --emptyOutDir",
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data/package.json
var package_default54 = {
  name: "@atproto/lex-data",
  version: "0.0.12",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-client/package.json
var package_default55 = {
  name: "@atproto/lex-client",
  version: "0.0.13",
  license: "MIT",
  description: "HTTP client for interacting with Lexicon based APIs",
  keywords: [
    "atproto",
    "lexicon",
    "xrpc",
    "client"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-client"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.12",
    "@atproto/lex-json": "^0.0.12",
    "@atproto/lex-schema": "^0.0.13"
  },
  devDependencies: {
    vitest: "^4.0.16",
    "@atproto/lex-cbor": "^0.0.12",
    "@atproto/lex-builder": "^0.0.16"
  },
  scripts: {
    prebuild: "node ./scripts/lex-build.mjs",
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/package.json
var package_default56 = {
  name: "@atproto/lex-data",
  version: "0.0.12",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/package.json
var package_default57 = {
  name: "@atproto/lex-json",
  version: "0.0.12",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in JSON format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "json",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-json"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.12"
  },
  devDependencies: {
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-data/package.json
var package_default58 = {
  name: "@atproto/lex-data",
  version: "0.1.7",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    multiformats: "^13.0.0",
    tslib: "^2.8.1",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-data/node_modules/multiformats/package.json
var package_default59 = {
  name: "multiformats",
  version: "13.4.2",
  description: "Interface for multihash, multicodec, multibase and CID",
  author: "Mikeal Rogers <mikeal.rogers@gmail.com> (https://www.mikealrogers.com/)",
  license: "Apache-2.0 OR MIT",
  homepage: "https://github.com/multiformats/js-multiformats#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/multiformats/js-multiformats.git"
  },
  bugs: {
    url: "https://github.com/multiformats/js-multiformats/issues"
  },
  publishConfig: {
    access: "public",
    provenance: true
  },
  keywords: [
    "ipfs",
    "ipld",
    "multiformats"
  ],
  type: "module",
  types: "./dist/src/index.d.ts",
  typesVersions: {
    "*": {
      "*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ],
      "src/*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ]
    }
  },
  files: [
    "src",
    "dist",
    "!dist/test",
    "!**/*.tsbuildinfo"
  ],
  exports: {
    ".": {
      types: "./dist/src/index.d.ts",
      import: "./dist/src/index.js"
    },
    "./bases/base10": {
      types: "./dist/src/bases/base10.d.ts",
      import: "./dist/src/bases/base10.js"
    },
    "./bases/base16": {
      types: "./dist/src/bases/base16.d.ts",
      import: "./dist/src/bases/base16.js"
    },
    "./bases/base2": {
      types: "./dist/src/bases/base2.d.ts",
      import: "./dist/src/bases/base2.js"
    },
    "./bases/base256emoji": {
      types: "./dist/src/bases/base256emoji.d.ts",
      import: "./dist/src/bases/base256emoji.js"
    },
    "./bases/base32": {
      types: "./dist/src/bases/base32.d.ts",
      import: "./dist/src/bases/base32.js"
    },
    "./bases/base36": {
      types: "./dist/src/bases/base36.d.ts",
      import: "./dist/src/bases/base36.js"
    },
    "./bases/base58": {
      types: "./dist/src/bases/base58.d.ts",
      import: "./dist/src/bases/base58.js"
    },
    "./bases/base64": {
      types: "./dist/src/bases/base64.d.ts",
      import: "./dist/src/bases/base64.js"
    },
    "./bases/base8": {
      types: "./dist/src/bases/base8.d.ts",
      import: "./dist/src/bases/base8.js"
    },
    "./bases/identity": {
      types: "./dist/src/bases/identity.d.ts",
      import: "./dist/src/bases/identity.js"
    },
    "./bases/interface": {
      types: "./dist/src/bases/interface.d.ts",
      import: "./dist/src/bases/interface.js"
    },
    "./basics": {
      types: "./dist/src/basics.d.ts",
      import: "./dist/src/basics.js"
    },
    "./block": {
      types: "./dist/src/block.d.ts",
      import: "./dist/src/block.js"
    },
    "./block/interface": {
      types: "./dist/src/block/interface.d.ts",
      import: "./dist/src/block/interface.js"
    },
    "./bytes": {
      types: "./dist/src/bytes.d.ts",
      import: "./dist/src/bytes.js"
    },
    "./cid": {
      types: "./dist/src/cid.d.ts",
      import: "./dist/src/cid.js"
    },
    "./codecs/interface": {
      types: "./dist/src/codecs/interface.d.ts",
      import: "./dist/src/codecs/interface.js"
    },
    "./codecs/json": {
      types: "./dist/src/codecs/json.d.ts",
      import: "./dist/src/codecs/json.js"
    },
    "./codecs/raw": {
      types: "./dist/src/codecs/raw.d.ts",
      import: "./dist/src/codecs/raw.js"
    },
    "./hashes/digest": {
      types: "./dist/src/hashes/digest.d.ts",
      import: "./dist/src/hashes/digest.js"
    },
    "./hashes/hasher": {
      types: "./dist/src/hashes/hasher.d.ts",
      import: "./dist/src/hashes/hasher.js"
    },
    "./hashes/identity": {
      types: "./dist/src/hashes/identity.d.ts",
      import: "./dist/src/hashes/identity.js"
    },
    "./hashes/interface": {
      types: "./dist/src/hashes/interface.d.ts",
      import: "./dist/src/hashes/interface.js"
    },
    "./hashes/sha1": {
      types: "./dist/types/src/hashes/sha1.d.ts",
      browser: "./dist/src/hashes/sha1-browser.js",
      import: "./dist/src/hashes/sha1.js"
    },
    "./hashes/sha2": {
      types: "./dist/src/hashes/sha2.d.ts",
      browser: "./dist/src/hashes/sha2-browser.js",
      import: "./dist/src/hashes/sha2.js"
    },
    "./interface": {
      types: "./dist/src/interface.d.ts",
      import: "./dist/src/interface.js"
    },
    "./link": {
      types: "./dist/src/link.d.ts",
      import: "./dist/src/link.js"
    },
    "./link/interface": {
      types: "./dist/src/link/interface.d.ts",
      import: "./dist/src/link/interface.js"
    },
    "./traversal": {
      types: "./dist/src/traversal.d.ts",
      import: "./dist/src/traversal.js"
    }
  },
  eslintConfig: {
    extends: "ipfs",
    parserOptions: {
      project: true,
      sourceType: "module"
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              type: "deps",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Documentation"
              },
              {
                type: "deps",
                section: "Dependencies"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      [
        "@semantic-release/git",
        {
          assets: [
            "CHANGELOG.md",
            "package.json"
          ]
        }
      ]
    ]
  },
  scripts: {
    clean: "aegir clean",
    lint: "aegir lint",
    build: "aegir build",
    release: "aegir release",
    docs: "aegir docs",
    test: "npm run lint && npm run test:node && npm run test:chrome",
    "test:node": "aegir test -t node --cov",
    "test:chrome": "aegir test -t browser --cov",
    "test:chrome-webworker": "aegir test -t webworker",
    "test:firefox": "aegir test -t browser -- --browser firefox",
    "test:firefox-webworker": "aegir test -t webworker -- --browser firefox",
    "test:electron-main": "aegir test -t electron-main"
  },
  devDependencies: {
    "@stablelib/sha256": "^2.0.0",
    "@stablelib/sha512": "^2.0.0",
    "@types/node": "^25.0.0",
    aegir: "^47.0.7",
    buffer: "^6.0.3",
    cids: "^1.1.9",
    "crypto-hash": "^4.0.0"
  },
  aegir: {
    test: {
      target: [
        "node",
        "browser"
      ]
    }
  },
  browser: {
    "./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
    "./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
    "./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
    "./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
  }
};

// node_modules/@atproto/lex-document/package.json
var package_default60 = {
  name: "@atproto/lex-document",
  version: "0.0.14",
  license: "MIT",
  description: "Lexicon document validation tools for AT",
  keywords: [
    "atproto",
    "lexicon",
    "document",
    "lex"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-document"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    "core-js": "^3",
    tslib: "^2.8.1",
    "@atproto/lex-schema": "^0.0.13"
  },
  devDependencies: {
    vitest: "^4.0.16",
    "@atproto/lex-data": "^0.0.12"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-installer/package.json
var package_default61 = {
  name: "@atproto/lex-installer",
  version: "0.0.18",
  license: "MIT",
  description: "Lexicon document packet manager for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "install",
    "lex"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-installer"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-builder": "^0.0.16",
    "@atproto/lex-cbor": "^0.0.13",
    "@atproto/lex-data": "^0.0.12",
    "@atproto/lex-document": "^0.0.14",
    "@atproto/lex-resolver": "^0.0.15",
    "@atproto/lex-schema": "^0.0.13",
    "@atproto/syntax": "^0.4.3"
  },
  devDependencies: {
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data/package.json
var package_default62 = {
  name: "@atproto/lex-data",
  version: "0.0.12",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-installer/node_modules/@atproto/syntax/package.json
var package_default63 = {
  name: "@atproto/syntax",
  version: "0.4.3",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/lex-json/package.json
var package_default64 = {
  name: "@atproto/lex-json",
  version: "0.1.6",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in JSON format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "json",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-json"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.1.7"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-resolver/package.json
var package_default65 = {
  name: "@atproto/lex-resolver",
  version: "0.0.15",
  license: "MIT",
  description: "Lexicon document resolver utility for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "resolver",
    "utility"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-resolver"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto-labs/did-resolver": "^0.2.6",
    "@atproto/crypto": "^0.4.5",
    "@atproto/lex-client": "^0.0.13",
    "@atproto/lex-data": "^0.0.12",
    "@atproto/lex-document": "^0.0.14",
    "@atproto/repo": "^0.8.12",
    "@atproto/syntax": "^0.4.3",
    "@atproto/lex-schema": "^0.0.13"
  },
  devDependencies: {
    vitest: "^4.0.16",
    "@atproto/lex-builder": "^0.0.16"
  },
  scripts: {
    prebuild: "node ./scripts/lex-build.mjs",
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data/package.json
var package_default66 = {
  name: "@atproto/lex-data",
  version: "0.0.12",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax/package.json
var package_default67 = {
  name: "@atproto/syntax",
  version: "0.4.3",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/lex-schema/package.json
var package_default68 = {
  name: "@atproto/lex-schema",
  version: "0.0.13",
  license: "MIT",
  description: "Lexicon schema system for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "lex"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-schema"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/syntax": "^0.4.3",
    "@atproto/lex-data": "^0.0.12"
  },
  devDependencies: {
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/package.json
var package_default69 = {
  name: "@atproto/lex-data",
  version: "0.0.12",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/package.json
var package_default70 = {
  name: "@atproto/syntax",
  version: "0.4.3",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/lex/node_modules/@atproto/lex-data/package.json
var package_default71 = {
  name: "@atproto/lex-data",
  version: "0.0.12",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lex/node_modules/@atproto/lex-json/package.json
var package_default72 = {
  name: "@atproto/lex-json",
  version: "0.0.12",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in JSON format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "json",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-json"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.12"
  },
  devDependencies: {
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/lexicon/package.json
var package_default73 = {
  name: "@atproto/lexicon",
  version: "0.7.12",
  license: "MIT",
  description: "atproto Lexicon schema language library",
  keywords: [
    "atproto",
    "lexicon"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lexicon"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    multiformats: "^13.0.0",
    zod: "^3.23.8",
    "@atproto/common-web": "^0.5.10",
    "@atproto/syntax": "^0.7.5"
  },
  devDependencies: {
    jest: "^30.0.0"
  },
  scripts: {
    test: "NODE_OPTIONS=--experimental-vm-modules jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/lexicon/node_modules/multiformats/package.json
var package_default74 = {
  name: "multiformats",
  version: "13.4.2",
  description: "Interface for multihash, multicodec, multibase and CID",
  author: "Mikeal Rogers <mikeal.rogers@gmail.com> (https://www.mikealrogers.com/)",
  license: "Apache-2.0 OR MIT",
  homepage: "https://github.com/multiformats/js-multiformats#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/multiformats/js-multiformats.git"
  },
  bugs: {
    url: "https://github.com/multiformats/js-multiformats/issues"
  },
  publishConfig: {
    access: "public",
    provenance: true
  },
  keywords: [
    "ipfs",
    "ipld",
    "multiformats"
  ],
  type: "module",
  types: "./dist/src/index.d.ts",
  typesVersions: {
    "*": {
      "*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ],
      "src/*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ]
    }
  },
  files: [
    "src",
    "dist",
    "!dist/test",
    "!**/*.tsbuildinfo"
  ],
  exports: {
    ".": {
      types: "./dist/src/index.d.ts",
      import: "./dist/src/index.js"
    },
    "./bases/base10": {
      types: "./dist/src/bases/base10.d.ts",
      import: "./dist/src/bases/base10.js"
    },
    "./bases/base16": {
      types: "./dist/src/bases/base16.d.ts",
      import: "./dist/src/bases/base16.js"
    },
    "./bases/base2": {
      types: "./dist/src/bases/base2.d.ts",
      import: "./dist/src/bases/base2.js"
    },
    "./bases/base256emoji": {
      types: "./dist/src/bases/base256emoji.d.ts",
      import: "./dist/src/bases/base256emoji.js"
    },
    "./bases/base32": {
      types: "./dist/src/bases/base32.d.ts",
      import: "./dist/src/bases/base32.js"
    },
    "./bases/base36": {
      types: "./dist/src/bases/base36.d.ts",
      import: "./dist/src/bases/base36.js"
    },
    "./bases/base58": {
      types: "./dist/src/bases/base58.d.ts",
      import: "./dist/src/bases/base58.js"
    },
    "./bases/base64": {
      types: "./dist/src/bases/base64.d.ts",
      import: "./dist/src/bases/base64.js"
    },
    "./bases/base8": {
      types: "./dist/src/bases/base8.d.ts",
      import: "./dist/src/bases/base8.js"
    },
    "./bases/identity": {
      types: "./dist/src/bases/identity.d.ts",
      import: "./dist/src/bases/identity.js"
    },
    "./bases/interface": {
      types: "./dist/src/bases/interface.d.ts",
      import: "./dist/src/bases/interface.js"
    },
    "./basics": {
      types: "./dist/src/basics.d.ts",
      import: "./dist/src/basics.js"
    },
    "./block": {
      types: "./dist/src/block.d.ts",
      import: "./dist/src/block.js"
    },
    "./block/interface": {
      types: "./dist/src/block/interface.d.ts",
      import: "./dist/src/block/interface.js"
    },
    "./bytes": {
      types: "./dist/src/bytes.d.ts",
      import: "./dist/src/bytes.js"
    },
    "./cid": {
      types: "./dist/src/cid.d.ts",
      import: "./dist/src/cid.js"
    },
    "./codecs/interface": {
      types: "./dist/src/codecs/interface.d.ts",
      import: "./dist/src/codecs/interface.js"
    },
    "./codecs/json": {
      types: "./dist/src/codecs/json.d.ts",
      import: "./dist/src/codecs/json.js"
    },
    "./codecs/raw": {
      types: "./dist/src/codecs/raw.d.ts",
      import: "./dist/src/codecs/raw.js"
    },
    "./hashes/digest": {
      types: "./dist/src/hashes/digest.d.ts",
      import: "./dist/src/hashes/digest.js"
    },
    "./hashes/hasher": {
      types: "./dist/src/hashes/hasher.d.ts",
      import: "./dist/src/hashes/hasher.js"
    },
    "./hashes/identity": {
      types: "./dist/src/hashes/identity.d.ts",
      import: "./dist/src/hashes/identity.js"
    },
    "./hashes/interface": {
      types: "./dist/src/hashes/interface.d.ts",
      import: "./dist/src/hashes/interface.js"
    },
    "./hashes/sha1": {
      types: "./dist/types/src/hashes/sha1.d.ts",
      browser: "./dist/src/hashes/sha1-browser.js",
      import: "./dist/src/hashes/sha1.js"
    },
    "./hashes/sha2": {
      types: "./dist/src/hashes/sha2.d.ts",
      browser: "./dist/src/hashes/sha2-browser.js",
      import: "./dist/src/hashes/sha2.js"
    },
    "./interface": {
      types: "./dist/src/interface.d.ts",
      import: "./dist/src/interface.js"
    },
    "./link": {
      types: "./dist/src/link.d.ts",
      import: "./dist/src/link.js"
    },
    "./link/interface": {
      types: "./dist/src/link/interface.d.ts",
      import: "./dist/src/link/interface.js"
    },
    "./traversal": {
      types: "./dist/src/traversal.d.ts",
      import: "./dist/src/traversal.js"
    }
  },
  eslintConfig: {
    extends: "ipfs",
    parserOptions: {
      project: true,
      sourceType: "module"
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              type: "deps",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Documentation"
              },
              {
                type: "deps",
                section: "Dependencies"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      [
        "@semantic-release/git",
        {
          assets: [
            "CHANGELOG.md",
            "package.json"
          ]
        }
      ]
    ]
  },
  scripts: {
    clean: "aegir clean",
    lint: "aegir lint",
    build: "aegir build",
    release: "aegir release",
    docs: "aegir docs",
    test: "npm run lint && npm run test:node && npm run test:chrome",
    "test:node": "aegir test -t node --cov",
    "test:chrome": "aegir test -t browser --cov",
    "test:chrome-webworker": "aegir test -t webworker",
    "test:firefox": "aegir test -t browser -- --browser firefox",
    "test:firefox-webworker": "aegir test -t webworker -- --browser firefox",
    "test:electron-main": "aegir test -t electron-main"
  },
  devDependencies: {
    "@stablelib/sha256": "^2.0.0",
    "@stablelib/sha512": "^2.0.0",
    "@types/node": "^25.0.0",
    aegir: "^47.0.7",
    buffer: "^6.0.3",
    cids: "^1.1.9",
    "crypto-hash": "^4.0.0"
  },
  aegir: {
    test: {
      target: [
        "node",
        "browser"
      ]
    }
  },
  browser: {
    "./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
    "./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
    "./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
    "./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
  }
};

// node_modules/@atproto/oauth-client/package.json
var package_default75 = {
  name: "@atproto/oauth-client",
  version: "0.8.8",
  license: "MIT",
  description: "OAuth client for ATPROTO PDS. This package serves as common base for environment-specific implementations (NodeJS, Browser, React-Native).",
  keywords: [
    "atproto",
    "oauth",
    "client",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/oauth/oauth-client"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "core-js": "^3.50.0",
    multiformats: "^13.0.0",
    zod: "^3.23.8",
    "@atproto-labs/did-resolver": "^0.3.10",
    "@atproto-labs/handle-resolver": "^0.4.10",
    "@atproto-labs/fetch": "^0.3.6",
    "@atproto-labs/simple-store": "^0.5.1",
    "@atproto-labs/identity-resolver": "^0.4.10",
    "@atproto/did": "^0.5.6",
    "@atproto/jwk": "^0.7.4",
    "@atproto-labs/simple-store-memory": "^0.2.6",
    "@atproto/xrpc": "^0.8.14",
    "@atproto/oauth-types": "^0.7.7"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/oauth-client-browser/package.json
var package_default76 = {
  name: "@atproto/oauth-client-browser",
  version: "0.5.8",
  license: "MIT",
  description: "ATPROTO OAuth client for the browser (relies on WebCrypto & Indexed DB)",
  keywords: [
    "atproto",
    "oauth",
    "client",
    "browser",
    "webcrypto",
    "indexed",
    "db"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/oauth/oauth-client-browser"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "core-js": "^3.50.0",
    "@atproto-labs/handle-resolver": "^0.4.10",
    "@atproto-labs/did-resolver": "^0.3.10",
    "@atproto/did": "^0.5.6",
    "@atproto-labs/simple-store": "^0.5.1",
    "@atproto/oauth-client": "^0.8.8",
    "@atproto/jwk": "^0.7.4",
    "@atproto/jwk-webcrypto": "^0.3.4",
    "@atproto/oauth-types": "^0.7.7"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver/package.json
var package_default77 = {
  name: "@atproto-labs/did-resolver",
  version: "0.3.10",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "resolver"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/did-resolver"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto-labs/fetch": "^0.3.6",
    "@atproto-labs/pipe": "^0.2.4",
    "@atproto-labs/simple-store": "^0.5.1",
    "@atproto-labs/simple-store-memory": "^0.2.6",
    "@atproto/did": "^0.5.6"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch/package.json
var package_default78 = {
  name: "@atproto-labs/fetch",
  version: "0.3.6",
  license: "MIT",
  description: "Isomorphic wrapper utilities for fetch API",
  keywords: [
    "atproto",
    "fetch"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/fetch"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/pipe": "^0.2.4"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc --build tsconfig.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe/package.json
var package_default79 = {
  name: "@atproto-labs/pipe",
  version: "0.2.4",
  license: "MIT",
  description: "Library for combining multiple functions into a single function.",
  keywords: [
    "atproto",
    "transformer"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/pipe"
  },
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  scripts: {
    build: "tsgo --build tsconfig.json"
  }
};

// node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store/package.json
var package_default80 = {
  name: "@atproto-labs/simple-store",
  version: "0.5.1",
  license: "MIT",
  description: "Simple store interfaces & utilities",
  keywords: [
    "cache",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory/package.json
var package_default81 = {
  name: "@atproto-labs/simple-store-memory",
  version: "0.2.6",
  license: "MIT",
  description: "Memory based simple-store implementation",
  keywords: [
    "cache",
    "isomorphic",
    "memory"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store-memory"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "lru-cache": "^10.2.0",
    "@atproto-labs/simple-store": "^0.5.1"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did/package.json
var package_default82 = {
  name: "@atproto/did",
  version: "0.5.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.39",
    jest: "^30.5.2"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "NODE_OPTIONS=--experimental-vm-modules jest"
  }
};

// node_modules/@atproto/oauth-client-node/package.json
var package_default83 = {
  name: "@atproto/oauth-client-node",
  version: "0.5.8",
  license: "MIT",
  description: "ATPROTO OAuth client for the NodeJS",
  keywords: [
    "atproto",
    "oauth",
    "client",
    "node"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/oauth/oauth-client-node"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/did-resolver": "^0.3.10",
    "@atproto-labs/handle-resolver-node": "^0.2.11",
    "@atproto/jwk": "^0.7.4",
    "@atproto/jwk-jose": "^0.2.4",
    "@atproto/did": "^0.5.6",
    "@atproto/oauth-client": "^0.8.8",
    "@atproto/jwk-webcrypto": "^0.3.4",
    "@atproto/oauth-types": "^0.7.7",
    "@atproto-labs/simple-store": "^0.5.1"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver/package.json
var package_default84 = {
  name: "@atproto-labs/did-resolver",
  version: "0.3.10",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "resolver"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/did-resolver"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto-labs/fetch": "^0.3.6",
    "@atproto-labs/pipe": "^0.2.4",
    "@atproto-labs/simple-store": "^0.5.1",
    "@atproto-labs/simple-store-memory": "^0.2.6",
    "@atproto/did": "^0.5.6"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch/package.json
var package_default85 = {
  name: "@atproto-labs/fetch",
  version: "0.3.6",
  license: "MIT",
  description: "Isomorphic wrapper utilities for fetch API",
  keywords: [
    "atproto",
    "fetch"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/fetch"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/pipe": "^0.2.4"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc --build tsconfig.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe/package.json
var package_default86 = {
  name: "@atproto-labs/pipe",
  version: "0.2.4",
  license: "MIT",
  description: "Library for combining multiple functions into a single function.",
  keywords: [
    "atproto",
    "transformer"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/pipe"
  },
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  scripts: {
    build: "tsgo --build tsconfig.json"
  }
};

// node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store/package.json
var package_default87 = {
  name: "@atproto-labs/simple-store",
  version: "0.5.1",
  license: "MIT",
  description: "Simple store interfaces & utilities",
  keywords: [
    "cache",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory/package.json
var package_default88 = {
  name: "@atproto-labs/simple-store-memory",
  version: "0.2.6",
  license: "MIT",
  description: "Memory based simple-store implementation",
  keywords: [
    "cache",
    "isomorphic",
    "memory"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store-memory"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "lru-cache": "^10.2.0",
    "@atproto-labs/simple-store": "^0.5.1"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client-node/node_modules/@atproto/did/package.json
var package_default89 = {
  name: "@atproto/did",
  version: "0.5.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.39",
    jest: "^30.5.2"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "NODE_OPTIONS=--experimental-vm-modules jest"
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/package.json
var package_default90 = {
  name: "@atproto-labs/did-resolver",
  version: "0.3.10",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "resolver"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/did-resolver"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto-labs/fetch": "^0.3.6",
    "@atproto-labs/pipe": "^0.2.4",
    "@atproto-labs/simple-store": "^0.5.1",
    "@atproto-labs/simple-store-memory": "^0.2.6",
    "@atproto/did": "^0.5.6"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/package.json
var package_default91 = {
  name: "@atproto-labs/fetch",
  version: "0.3.6",
  license: "MIT",
  description: "Isomorphic wrapper utilities for fetch API",
  keywords: [
    "atproto",
    "fetch"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/fetch"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "@atproto-labs/pipe": "^0.2.4"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsc --build tsconfig.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe/package.json
var package_default92 = {
  name: "@atproto-labs/pipe",
  version: "0.2.4",
  license: "MIT",
  description: "Library for combining multiple functions into a single function.",
  keywords: [
    "atproto",
    "transformer"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/pipe"
  },
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  scripts: {
    build: "tsgo --build tsconfig.json"
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/package.json
var package_default93 = {
  name: "@atproto-labs/simple-store",
  version: "0.5.1",
  license: "MIT",
  description: "Simple store interfaces & utilities",
  keywords: [
    "cache",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory/package.json
var package_default94 = {
  name: "@atproto-labs/simple-store-memory",
  version: "0.2.6",
  license: "MIT",
  description: "Memory based simple-store implementation",
  keywords: [
    "cache",
    "isomorphic",
    "memory"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/internal/simple-store-memory"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "lru-cache": "^10.2.0",
    "@atproto-labs/simple-store": "^0.5.1"
  },
  scripts: {
    build: "tsgo --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-client/node_modules/@atproto/did/package.json
var package_default95 = {
  name: "@atproto/did",
  version: "0.5.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.39",
    jest: "^30.5.2"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "NODE_OPTIONS=--experimental-vm-modules jest"
  }
};

// node_modules/@atproto/oauth-client/node_modules/multiformats/package.json
var package_default96 = {
  name: "multiformats",
  version: "13.4.2",
  description: "Interface for multihash, multicodec, multibase and CID",
  author: "Mikeal Rogers <mikeal.rogers@gmail.com> (https://www.mikealrogers.com/)",
  license: "Apache-2.0 OR MIT",
  homepage: "https://github.com/multiformats/js-multiformats#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/multiformats/js-multiformats.git"
  },
  bugs: {
    url: "https://github.com/multiformats/js-multiformats/issues"
  },
  publishConfig: {
    access: "public",
    provenance: true
  },
  keywords: [
    "ipfs",
    "ipld",
    "multiformats"
  ],
  type: "module",
  types: "./dist/src/index.d.ts",
  typesVersions: {
    "*": {
      "*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ],
      "src/*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ]
    }
  },
  files: [
    "src",
    "dist",
    "!dist/test",
    "!**/*.tsbuildinfo"
  ],
  exports: {
    ".": {
      types: "./dist/src/index.d.ts",
      import: "./dist/src/index.js"
    },
    "./bases/base10": {
      types: "./dist/src/bases/base10.d.ts",
      import: "./dist/src/bases/base10.js"
    },
    "./bases/base16": {
      types: "./dist/src/bases/base16.d.ts",
      import: "./dist/src/bases/base16.js"
    },
    "./bases/base2": {
      types: "./dist/src/bases/base2.d.ts",
      import: "./dist/src/bases/base2.js"
    },
    "./bases/base256emoji": {
      types: "./dist/src/bases/base256emoji.d.ts",
      import: "./dist/src/bases/base256emoji.js"
    },
    "./bases/base32": {
      types: "./dist/src/bases/base32.d.ts",
      import: "./dist/src/bases/base32.js"
    },
    "./bases/base36": {
      types: "./dist/src/bases/base36.d.ts",
      import: "./dist/src/bases/base36.js"
    },
    "./bases/base58": {
      types: "./dist/src/bases/base58.d.ts",
      import: "./dist/src/bases/base58.js"
    },
    "./bases/base64": {
      types: "./dist/src/bases/base64.d.ts",
      import: "./dist/src/bases/base64.js"
    },
    "./bases/base8": {
      types: "./dist/src/bases/base8.d.ts",
      import: "./dist/src/bases/base8.js"
    },
    "./bases/identity": {
      types: "./dist/src/bases/identity.d.ts",
      import: "./dist/src/bases/identity.js"
    },
    "./bases/interface": {
      types: "./dist/src/bases/interface.d.ts",
      import: "./dist/src/bases/interface.js"
    },
    "./basics": {
      types: "./dist/src/basics.d.ts",
      import: "./dist/src/basics.js"
    },
    "./block": {
      types: "./dist/src/block.d.ts",
      import: "./dist/src/block.js"
    },
    "./block/interface": {
      types: "./dist/src/block/interface.d.ts",
      import: "./dist/src/block/interface.js"
    },
    "./bytes": {
      types: "./dist/src/bytes.d.ts",
      import: "./dist/src/bytes.js"
    },
    "./cid": {
      types: "./dist/src/cid.d.ts",
      import: "./dist/src/cid.js"
    },
    "./codecs/interface": {
      types: "./dist/src/codecs/interface.d.ts",
      import: "./dist/src/codecs/interface.js"
    },
    "./codecs/json": {
      types: "./dist/src/codecs/json.d.ts",
      import: "./dist/src/codecs/json.js"
    },
    "./codecs/raw": {
      types: "./dist/src/codecs/raw.d.ts",
      import: "./dist/src/codecs/raw.js"
    },
    "./hashes/digest": {
      types: "./dist/src/hashes/digest.d.ts",
      import: "./dist/src/hashes/digest.js"
    },
    "./hashes/hasher": {
      types: "./dist/src/hashes/hasher.d.ts",
      import: "./dist/src/hashes/hasher.js"
    },
    "./hashes/identity": {
      types: "./dist/src/hashes/identity.d.ts",
      import: "./dist/src/hashes/identity.js"
    },
    "./hashes/interface": {
      types: "./dist/src/hashes/interface.d.ts",
      import: "./dist/src/hashes/interface.js"
    },
    "./hashes/sha1": {
      types: "./dist/types/src/hashes/sha1.d.ts",
      browser: "./dist/src/hashes/sha1-browser.js",
      import: "./dist/src/hashes/sha1.js"
    },
    "./hashes/sha2": {
      types: "./dist/src/hashes/sha2.d.ts",
      browser: "./dist/src/hashes/sha2-browser.js",
      import: "./dist/src/hashes/sha2.js"
    },
    "./interface": {
      types: "./dist/src/interface.d.ts",
      import: "./dist/src/interface.js"
    },
    "./link": {
      types: "./dist/src/link.d.ts",
      import: "./dist/src/link.js"
    },
    "./link/interface": {
      types: "./dist/src/link/interface.d.ts",
      import: "./dist/src/link/interface.js"
    },
    "./traversal": {
      types: "./dist/src/traversal.d.ts",
      import: "./dist/src/traversal.js"
    }
  },
  eslintConfig: {
    extends: "ipfs",
    parserOptions: {
      project: true,
      sourceType: "module"
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              type: "deps",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Documentation"
              },
              {
                type: "deps",
                section: "Dependencies"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      [
        "@semantic-release/git",
        {
          assets: [
            "CHANGELOG.md",
            "package.json"
          ]
        }
      ]
    ]
  },
  scripts: {
    clean: "aegir clean",
    lint: "aegir lint",
    build: "aegir build",
    release: "aegir release",
    docs: "aegir docs",
    test: "npm run lint && npm run test:node && npm run test:chrome",
    "test:node": "aegir test -t node --cov",
    "test:chrome": "aegir test -t browser --cov",
    "test:chrome-webworker": "aegir test -t webworker",
    "test:firefox": "aegir test -t browser -- --browser firefox",
    "test:firefox-webworker": "aegir test -t webworker -- --browser firefox",
    "test:electron-main": "aegir test -t electron-main"
  },
  devDependencies: {
    "@stablelib/sha256": "^2.0.0",
    "@stablelib/sha512": "^2.0.0",
    "@types/node": "^25.0.0",
    aegir: "^47.0.7",
    buffer: "^6.0.3",
    cids: "^1.1.9",
    "crypto-hash": "^4.0.0"
  },
  aegir: {
    test: {
      target: [
        "node",
        "browser"
      ]
    }
  },
  browser: {
    "./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
    "./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
    "./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
    "./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
  }
};

// node_modules/@atproto/oauth-types/package.json
var package_default97 = {
  name: "@atproto/oauth-types",
  version: "0.7.7",
  license: "MIT",
  description: "OAuth typing & validation library",
  keywords: [
    "atproto",
    "oauth",
    "types",
    "isomorphic"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/oauth/oauth-types"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto/did": "^0.5.6",
    "@atproto/jwk": "^0.7.4"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/oauth-types/node_modules/@atproto/did/package.json
var package_default98 = {
  name: "@atproto/did",
  version: "0.5.6",
  license: "MIT",
  description: "DID resolution and verification library",
  keywords: [
    "atproto",
    "did",
    "validation",
    "types"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/did"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8"
  },
  devDependencies: {
    "@swc/jest": "^0.2.39",
    jest: "^30.5.2"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "NODE_OPTIONS=--experimental-vm-modules jest"
  }
};

// node_modules/@atproto/repo/package.json
var package_default99 = {
  name: "@atproto/repo",
  version: "0.8.13",
  license: "MIT",
  description: "atproto repo and MST implementation",
  keywords: [
    "atproto",
    "mst"
  ],
  engines: {
    node: ">=18.7.0"
  },
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/repo"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    "@ipld/dag-cbor": "^7.0.0",
    multiformats: "^9.9.0",
    uint8arrays: "3.0.0",
    varint: "^6.0.0",
    zod: "^3.23.8",
    "@atproto/common": "^0.5.14",
    "@atproto/common-web": "^0.4.18",
    "@atproto/crypto": "^0.4.5",
    "@atproto/lexicon": "^0.6.2"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3"
  },
  scripts: {
    test: "jest",
    "test:profile": "node --inspect ../../node_modules/.bin/jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/repo/node_modules/@atproto/common-web/package.json
var package_default100 = {
  name: "@atproto/common-web",
  version: "0.4.21",
  license: "MIT",
  description: "Shared web-platform-friendly code for atproto libraries",
  keywords: [
    "atproto"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/common-web"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    zod: "^3.23.8",
    "@atproto/lex-data": "^0.0.15",
    "@atproto/lex-json": "^0.0.16",
    "@atproto/syntax": "^0.5.4"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3"
  },
  scripts: {
    test: "jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/repo/node_modules/@atproto/lex-data/package.json
var package_default101 = {
  name: "@atproto/lex-data",
  version: "0.0.15",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/repo/node_modules/@atproto/lex-json/package.json
var package_default102 = {
  name: "@atproto/lex-json",
  version: "0.0.16",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in JSON format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "json",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-json"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.15"
  },
  devDependencies: {
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@atproto/repo/node_modules/@atproto/lexicon/package.json
var package_default103 = {
  name: "@atproto/lexicon",
  version: "0.6.2",
  license: "MIT",
  description: "atproto Lexicon schema language library",
  keywords: [
    "atproto",
    "lexicon"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lexicon"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    "iso-datestring-validator": "^2.2.2",
    multiformats: "^9.9.0",
    zod: "^3.23.8",
    "@atproto/common-web": "^0.4.18",
    "@atproto/syntax": "^0.5.0"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3"
  },
  scripts: {
    test: "jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/repo/node_modules/@atproto/syntax/package.json
var package_default104 = {
  name: "@atproto/syntax",
  version: "0.5.4",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/syntax/package.json
var package_default105 = {
  name: "@atproto/syntax",
  version: "0.7.5",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "iso-datestring-validator": "^2.2.2",
    tslib: "^2.8.1"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/xrpc/package.json
var package_default106 = {
  name: "@atproto/xrpc",
  version: "0.8.14",
  license: "MIT",
  description: "atproto HTTP API (XRPC) client library",
  keywords: [
    "atproto",
    "xrpc"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/xrpc"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto/lexicon": "^0.7.15"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/xrpc/node_modules/@atproto/common-web/package.json
var package_default107 = {
  name: "@atproto/common-web",
  version: "0.5.13",
  license: "MIT",
  description: "Shared web-platform-friendly code for atproto libraries",
  keywords: [
    "atproto"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/common-web"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    zod: "^3.23.8",
    "@atproto/lex-data": "^0.1.7",
    "@atproto/lex-json": "^0.1.6",
    "@atproto/syntax": "^0.7.6"
  },
  devDependencies: {
    jest: "^30.5.2"
  },
  scripts: {
    test: "NODE_OPTIONS=--experimental-vm-modules jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/xrpc/node_modules/@atproto/lexicon/package.json
var package_default108 = {
  name: "@atproto/lexicon",
  version: "0.7.15",
  license: "MIT",
  description: "atproto Lexicon schema language library",
  keywords: [
    "atproto",
    "lexicon"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lexicon"
  },
  files: [
    "./dist",
    "./README.md",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    multiformats: "^13.0.0",
    zod: "^3.23.8",
    "@atproto/common-web": "^0.5.13",
    "@atproto/syntax": "^0.7.6"
  },
  devDependencies: {
    jest: "^30.5.2"
  },
  scripts: {
    test: "NODE_OPTIONS=--experimental-vm-modules jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/xrpc/node_modules/@atproto/syntax/package.json
var package_default109 = {
  name: "@atproto/syntax",
  version: "0.7.6",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  files: [
    "./dist",
    "./CHANGELOG.md"
  ],
  type: "module",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  engines: {
    node: ">=22"
  },
  dependencies: {
    "iso-datestring-validator": "^2.2.2",
    tslib: "^2.8.1"
  },
  devDependencies: {
    vitest: "^4.1.10"
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@atproto/xrpc/node_modules/multiformats/package.json
var package_default110 = {
  name: "multiformats",
  version: "13.4.2",
  description: "Interface for multihash, multicodec, multibase and CID",
  author: "Mikeal Rogers <mikeal.rogers@gmail.com> (https://www.mikealrogers.com/)",
  license: "Apache-2.0 OR MIT",
  homepage: "https://github.com/multiformats/js-multiformats#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/multiformats/js-multiformats.git"
  },
  bugs: {
    url: "https://github.com/multiformats/js-multiformats/issues"
  },
  publishConfig: {
    access: "public",
    provenance: true
  },
  keywords: [
    "ipfs",
    "ipld",
    "multiformats"
  ],
  type: "module",
  types: "./dist/src/index.d.ts",
  typesVersions: {
    "*": {
      "*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ],
      "src/*": [
        "*",
        "dist/*",
        "dist/src/*",
        "dist/src/*/index"
      ]
    }
  },
  files: [
    "src",
    "dist",
    "!dist/test",
    "!**/*.tsbuildinfo"
  ],
  exports: {
    ".": {
      types: "./dist/src/index.d.ts",
      import: "./dist/src/index.js"
    },
    "./bases/base10": {
      types: "./dist/src/bases/base10.d.ts",
      import: "./dist/src/bases/base10.js"
    },
    "./bases/base16": {
      types: "./dist/src/bases/base16.d.ts",
      import: "./dist/src/bases/base16.js"
    },
    "./bases/base2": {
      types: "./dist/src/bases/base2.d.ts",
      import: "./dist/src/bases/base2.js"
    },
    "./bases/base256emoji": {
      types: "./dist/src/bases/base256emoji.d.ts",
      import: "./dist/src/bases/base256emoji.js"
    },
    "./bases/base32": {
      types: "./dist/src/bases/base32.d.ts",
      import: "./dist/src/bases/base32.js"
    },
    "./bases/base36": {
      types: "./dist/src/bases/base36.d.ts",
      import: "./dist/src/bases/base36.js"
    },
    "./bases/base58": {
      types: "./dist/src/bases/base58.d.ts",
      import: "./dist/src/bases/base58.js"
    },
    "./bases/base64": {
      types: "./dist/src/bases/base64.d.ts",
      import: "./dist/src/bases/base64.js"
    },
    "./bases/base8": {
      types: "./dist/src/bases/base8.d.ts",
      import: "./dist/src/bases/base8.js"
    },
    "./bases/identity": {
      types: "./dist/src/bases/identity.d.ts",
      import: "./dist/src/bases/identity.js"
    },
    "./bases/interface": {
      types: "./dist/src/bases/interface.d.ts",
      import: "./dist/src/bases/interface.js"
    },
    "./basics": {
      types: "./dist/src/basics.d.ts",
      import: "./dist/src/basics.js"
    },
    "./block": {
      types: "./dist/src/block.d.ts",
      import: "./dist/src/block.js"
    },
    "./block/interface": {
      types: "./dist/src/block/interface.d.ts",
      import: "./dist/src/block/interface.js"
    },
    "./bytes": {
      types: "./dist/src/bytes.d.ts",
      import: "./dist/src/bytes.js"
    },
    "./cid": {
      types: "./dist/src/cid.d.ts",
      import: "./dist/src/cid.js"
    },
    "./codecs/interface": {
      types: "./dist/src/codecs/interface.d.ts",
      import: "./dist/src/codecs/interface.js"
    },
    "./codecs/json": {
      types: "./dist/src/codecs/json.d.ts",
      import: "./dist/src/codecs/json.js"
    },
    "./codecs/raw": {
      types: "./dist/src/codecs/raw.d.ts",
      import: "./dist/src/codecs/raw.js"
    },
    "./hashes/digest": {
      types: "./dist/src/hashes/digest.d.ts",
      import: "./dist/src/hashes/digest.js"
    },
    "./hashes/hasher": {
      types: "./dist/src/hashes/hasher.d.ts",
      import: "./dist/src/hashes/hasher.js"
    },
    "./hashes/identity": {
      types: "./dist/src/hashes/identity.d.ts",
      import: "./dist/src/hashes/identity.js"
    },
    "./hashes/interface": {
      types: "./dist/src/hashes/interface.d.ts",
      import: "./dist/src/hashes/interface.js"
    },
    "./hashes/sha1": {
      types: "./dist/types/src/hashes/sha1.d.ts",
      browser: "./dist/src/hashes/sha1-browser.js",
      import: "./dist/src/hashes/sha1.js"
    },
    "./hashes/sha2": {
      types: "./dist/src/hashes/sha2.d.ts",
      browser: "./dist/src/hashes/sha2-browser.js",
      import: "./dist/src/hashes/sha2.js"
    },
    "./interface": {
      types: "./dist/src/interface.d.ts",
      import: "./dist/src/interface.js"
    },
    "./link": {
      types: "./dist/src/link.d.ts",
      import: "./dist/src/link.js"
    },
    "./link/interface": {
      types: "./dist/src/link/interface.d.ts",
      import: "./dist/src/link/interface.js"
    },
    "./traversal": {
      types: "./dist/src/traversal.d.ts",
      import: "./dist/src/traversal.js"
    }
  },
  eslintConfig: {
    extends: "ipfs",
    parserOptions: {
      project: true,
      sourceType: "module"
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              type: "deps",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Documentation"
              },
              {
                type: "deps",
                section: "Dependencies"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      [
        "@semantic-release/git",
        {
          assets: [
            "CHANGELOG.md",
            "package.json"
          ]
        }
      ]
    ]
  },
  scripts: {
    clean: "aegir clean",
    lint: "aegir lint",
    build: "aegir build",
    release: "aegir release",
    docs: "aegir docs",
    test: "npm run lint && npm run test:node && npm run test:chrome",
    "test:node": "aegir test -t node --cov",
    "test:chrome": "aegir test -t browser --cov",
    "test:chrome-webworker": "aegir test -t webworker",
    "test:firefox": "aegir test -t browser -- --browser firefox",
    "test:firefox-webworker": "aegir test -t webworker -- --browser firefox",
    "test:electron-main": "aegir test -t electron-main"
  },
  devDependencies: {
    "@stablelib/sha256": "^2.0.0",
    "@stablelib/sha512": "^2.0.0",
    "@types/node": "^25.0.0",
    aegir: "^47.0.7",
    buffer: "^6.0.3",
    cids: "^1.1.9",
    "crypto-hash": "^4.0.0"
  },
  aegir: {
    test: {
      target: [
        "node",
        "browser"
      ]
    }
  },
  browser: {
    "./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
    "./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
    "./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
    "./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
  }
};

// node_modules/@inlay/core/package.json
var package_default111 = {
  name: "@inlay/core",
  version: "0.0.13",
  type: "module",
  author: "Dan Abramov <dan.abramov@gmail.com>",
  license: "MIT",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      source: "./src/index.ts",
      types: "./dist/index.d.ts",
      import: "./dist/index.js"
    },
    "./jsx-runtime": {
      source: "./src/jsx-runtime.ts",
      types: "./dist/jsx-runtime.d.ts",
      import: "./dist/jsx-runtime.js"
    },
    "./jsx-dev-runtime": {
      source: "./src/jsx-dev-runtime.ts",
      types: "./dist/jsx-dev-runtime.d.ts",
      import: "./dist/jsx-dev-runtime.js"
    }
  },
  files: [
    "dist"
  ],
  scripts: {
    build: "tsc",
    dev: "tsc --watch",
    test: "tsx --conditions source --test test/*.test.ts",
    prepublishOnly: "npm run build"
  },
  dependencies: {
    "@atproto/lex": "^0.0.18",
    "@atproto/syntax": "^0.4.3"
  },
  devDependencies: {
    typescript: "^5.9.0"
  }
};

// node_modules/@inlay/core/node_modules/@atproto/syntax/package.json
var package_default112 = {
  name: "@atproto/syntax",
  version: "0.4.3",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@inlay/render/package.json
var package_default113 = {
  name: "@inlay/render",
  version: "0.3.1",
  type: "module",
  main: "./dist/packages/@inlay/render/src/index.js",
  types: "./dist/packages/@inlay/render/src/index.d.ts",
  exports: {
    ".": {
      source: "./src/index.ts",
      types: "./dist/packages/@inlay/render/src/index.d.ts",
      import: "./dist/packages/@inlay/render/src/index.js"
    }
  },
  files: [
    "dist"
  ],
  scripts: {
    build: "tsc",
    dev: "tsc --watch",
    test: "tsx --conditions source --test test/*.test.ts",
    prepublishOnly: "npm run build"
  },
  dependencies: {
    "@atproto/lexicon": "^0.6.1",
    "@atproto/syntax": "^0.4.3"
  },
  peerDependencies: {
    "@inlay/core": "*"
  },
  devDependencies: {
    typescript: "^5.9.0"
  }
};

// node_modules/@inlay/render/node_modules/@atproto/common-web/package.json
var package_default114 = {
  name: "@atproto/common-web",
  version: "0.4.21",
  license: "MIT",
  description: "Shared web-platform-friendly code for atproto libraries",
  keywords: [
    "atproto"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/common-web"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    zod: "^3.23.8",
    "@atproto/lex-data": "^0.0.15",
    "@atproto/lex-json": "^0.0.16",
    "@atproto/syntax": "^0.5.4"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3"
  },
  scripts: {
    test: "jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/package.json
var package_default115 = {
  name: "@atproto/syntax",
  version: "0.5.4",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@inlay/render/node_modules/@atproto/lex-data/package.json
var package_default116 = {
  name: "@atproto/lex-data",
  version: "0.0.15",
  license: "MIT",
  description: "Core utilities for AT Lexicons",
  keywords: [
    "atproto",
    "lexicon",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-data"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    multiformats: "^9.9.0",
    tslib: "^2.8.1",
    uint8arrays: "3.0.0",
    "unicode-segmenter": "^0.14.0"
  },
  devDependencies: {
    "core-js": "^3",
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@inlay/render/node_modules/@atproto/lex-json/package.json
var package_default117 = {
  name: "@atproto/lex-json",
  version: "0.0.16",
  license: "MIT",
  description: "Lexicon encoding utilities for AT Lexicon data in JSON format",
  keywords: [
    "atproto",
    "lex",
    "data",
    "json",
    "encoding",
    "utilities"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lex/lex-json"
  },
  files: [
    "./src",
    "./tsconfig.build.json",
    "./tsconfig.tests.json",
    "./tsconfig.json",
    "./dist",
    "./CHANGELOG.md"
  ],
  sideEffects: false,
  type: "commonjs",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/index.js",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  dependencies: {
    tslib: "^2.8.1",
    "@atproto/lex-data": "^0.0.15"
  },
  devDependencies: {
    vitest: "^4.0.16"
  },
  scripts: {
    build: "tsc --build tsconfig.build.json",
    test: "vitest run"
  }
};

// node_modules/@inlay/render/node_modules/@atproto/lexicon/package.json
var package_default118 = {
  name: "@atproto/lexicon",
  version: "0.6.2",
  license: "MIT",
  description: "atproto Lexicon schema language library",
  keywords: [
    "atproto",
    "lexicon"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/lexicon"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    "iso-datestring-validator": "^2.2.2",
    multiformats: "^9.9.0",
    zod: "^3.23.8",
    "@atproto/common-web": "^0.4.18",
    "@atproto/syntax": "^0.5.0"
  },
  devDependencies: {
    jest: "^28.1.2",
    typescript: "^5.6.3"
  },
  scripts: {
    test: "jest",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/package.json
var package_default119 = {
  name: "@atproto/syntax",
  version: "0.5.4",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@inlay/render/node_modules/@atproto/syntax/package.json
var package_default120 = {
  name: "@atproto/syntax",
  version: "0.4.3",
  license: "MIT",
  description: "Validation for atproto identifiers and formats: DID, handle, NSID, AT URI, etc",
  keywords: [
    "atproto",
    "did",
    "nsid",
    "at-uri"
  ],
  homepage: "https://atproto.com",
  repository: {
    type: "git",
    url: "https://github.com/bluesky-social/atproto",
    directory: "packages/syntax"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  dependencies: {
    tslib: "^2.8.1"
  },
  devDependencies: {
    typescript: "^5.6.3",
    vitest: "^4.0.16"
  },
  browser: {
    "dns/promises": false
  },
  scripts: {
    test: "vitest run",
    build: "tsc --build tsconfig.build.json"
  }
};

// node_modules/@ipld/dag-cbor/package.json
var package_default121 = {
  name: "@ipld/dag-cbor",
  version: "7.0.3",
  description: "JS implementation of DAG-CBOR",
  main: "./cjs/index.js",
  types: "./types/index.d.ts",
  scripts: {
    lint: "standard *.js test/*.js",
    build: "npm run build:js && npm run build:types",
    "build:js": "ipjs build --tests --main && npm run build:copy",
    "build:copy": "cp -a tsconfig.json index.js dist/ && mkdir -p dist/test && cp test/*.js dist/test/",
    "build:types": "npm run build:copy && cd dist && tsc --build",
    "test:cjs": "npm run build:js && mocha dist/cjs/node-test/test-*.js && npm run test:cjs:browser",
    "test:esm": "npm run build:js && mocha dist/esm/node-test/test-*.js && npm run test:esm:browser",
    "test:node": "c8 --check-coverage --branches 100 --functions 100 --lines 100 mocha test/test-*.js",
    "test:cjs:browser": "polendina --page --worker --serviceworker --cleanup dist/cjs/browser-test/test-*.js",
    "test:esm:browser": "polendina --page --worker --serviceworker --cleanup dist/esm/browser-test/test-*.js",
    "test:ts": "npm run build:types && npm run test --prefix test/ts-use",
    test: "npm run lint && npm run test:node && npm run test:esm && npm run test:ts",
    "test:ci": "npm run lint && npm run test:node && npm run test:esm && npm run test:cjs && npm run test:ts",
    coverage: "c8 --reporter=html mocha test/test-*.js && npm_config_yes=true npx st -d coverage -p 8080"
  },
  keywords: [
    "ipfs",
    "ipld",
    "multiformats"
  ],
  author: "Rod <rod@vagg.org> (http://r.va.gg/)",
  license: "(Apache-2.0 AND MIT)",
  exports: {
    browser: "./esm/index.js",
    require: "./cjs/index.js",
    import: "./esm/index.js"
  },
  dependencies: {
    cborg: "^1.6.0",
    multiformats: "^9.5.4"
  },
  devDependencies: {
    buffer: "^6.0.3",
    c8: "^7.10.0",
    chai: "^4.3.4",
    ipjs: "^5.2.0",
    "ipld-garbage": "^5.0.0",
    mocha: "^10.0.0",
    polendina: "~3.1.0",
    standard: "^17.0.0",
    typescript: "~4.8.2"
  },
  standard: {
    ignore: [
      "dist"
    ]
  },
  directories: {
    test: "test"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/ipld/js-dag-cbor.git"
  },
  bugs: {
    url: "https://github.com/ipld/js-dag-cbor/issues"
  },
  homepage: "https://github.com/ipld/js-dag-cbor#readme",
  typesVersions: {
    "*": {
      "*": [
        "types/*"
      ],
      "types/*": [
        "types/*"
      ]
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "chore",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Trivial Changes"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      [
        "@semantic-release/npm",
        {
          pkgRoot: "dist"
        }
      ],
      "@semantic-release/github",
      "@semantic-release/git"
    ]
  },
  browser: "./cjs/index.js"
};

// node_modules/@noble/curves/package.json
var package_default122 = {
  name: "@noble/curves",
  version: "1.9.7",
  description: "Audited & minimal JS implementation of elliptic curve cryptography",
  files: [
    "*.js",
    "*.js.map",
    "*.d.ts",
    "*.d.ts.map",
    "esm",
    "src",
    "abstract",
    "!oprf.*",
    "!webcrypto.*"
  ],
  scripts: {
    bench: "npm run bench:install; cd test/benchmark; node secp256k1.js; node curves.js; node utils.js; node bls.js",
    "bench:install": "cd test/benchmark; npm install; npm install ../.. --install-links",
    build: "tsc && tsc -p tsconfig.cjs.json",
    "build:release": "npx jsbt esbuild test/build",
    "build:clean": "rm {.,esm,abstract,esm/abstract}/*.{js,d.ts,d.ts.map,js.map} 2> /dev/null",
    lint: "prettier --check 'src/**/*.{js,ts}' 'test/*.js'",
    format: "prettier --write 'src/**/*.{js,ts}' 'test/*.js'",
    test: "node --disable-warning=ExperimentalWarning test/index.js",
    "test:bun": "bun test/index.js",
    "test:deno": "deno --allow-env --allow-read test/index.js",
    "test:coverage": "npm install --no-save c8@10.1.2 && npx c8 npm test"
  },
  author: "Paul Miller (https://paulmillr.com)",
  homepage: "https://paulmillr.com/noble/",
  repository: {
    type: "git",
    url: "git+https://github.com/paulmillr/noble-curves.git"
  },
  license: "MIT",
  dependencies: {
    "@noble/hashes": "1.8.0"
  },
  devDependencies: {
    "@paulmillr/jsbt": "0.4.0",
    "@types/node": "22.15.21",
    "fast-check": "4.1.1",
    "micro-bmark": "0.4.2",
    "micro-should": "0.5.3",
    prettier: "3.5.3",
    typescript: "5.8.3"
  },
  sideEffects: false,
  main: "index.js",
  exports: {
    ".": {
      import: "./esm/index.js",
      require: "./index.js"
    },
    "./abstract/bls": {
      import: "./esm/abstract/bls.js",
      require: "./abstract/bls.js"
    },
    "./abstract/curve": {
      import: "./esm/abstract/curve.js",
      require: "./abstract/curve.js"
    },
    "./abstract/edwards": {
      import: "./esm/abstract/edwards.js",
      require: "./abstract/edwards.js"
    },
    "./abstract/hash-to-curve": {
      import: "./esm/abstract/hash-to-curve.js",
      require: "./abstract/hash-to-curve.js"
    },
    "./abstract/modular": {
      import: "./esm/abstract/modular.js",
      require: "./abstract/modular.js"
    },
    "./abstract/montgomery": {
      import: "./esm/abstract/montgomery.js",
      require: "./abstract/montgomery.js"
    },
    "./abstract/poseidon": {
      import: "./esm/abstract/poseidon.js",
      require: "./abstract/poseidon.js"
    },
    "./abstract/tower": {
      import: "./esm/abstract/tower.js",
      require: "./abstract/tower.js"
    },
    "./abstract/utils": {
      import: "./esm/abstract/utils.js",
      require: "./abstract/utils.js"
    },
    "./abstract/weierstrass": {
      import: "./esm/abstract/weierstrass.js",
      require: "./abstract/weierstrass.js"
    },
    "./abstract/fft": {
      import: "./esm/abstract/fft.js",
      require: "./abstract/fft.js"
    },
    "./_shortw_utils": {
      import: "./esm/_shortw_utils.js",
      require: "./_shortw_utils.js"
    },
    "./bls12-381": {
      import: "./esm/bls12-381.js",
      require: "./bls12-381.js"
    },
    "./bn254": {
      import: "./esm/bn254.js",
      require: "./bn254.js"
    },
    "./ed448": {
      import: "./esm/ed448.js",
      require: "./ed448.js"
    },
    "./ed25519": {
      import: "./esm/ed25519.js",
      require: "./ed25519.js"
    },
    "./index": {
      import: "./esm/index.js",
      require: "./index.js"
    },
    "./jubjub": {
      import: "./esm/jubjub.js",
      require: "./jubjub.js"
    },
    "./misc": {
      import: "./esm/misc.js",
      require: "./misc.js"
    },
    "./nist": {
      import: "./esm/nist.js",
      require: "./nist.js"
    },
    "./p256": {
      import: "./esm/p256.js",
      require: "./p256.js"
    },
    "./p384": {
      import: "./esm/p384.js",
      require: "./p384.js"
    },
    "./p521": {
      import: "./esm/p521.js",
      require: "./p521.js"
    },
    "./pasta": {
      import: "./esm/pasta.js",
      require: "./pasta.js"
    },
    "./secp256k1": {
      import: "./esm/secp256k1.js",
      require: "./secp256k1.js"
    },
    "./utils": {
      import: "./esm/utils.js",
      require: "./utils.js"
    },
    "./abstract/bls.js": {
      import: "./esm/abstract/bls.js",
      require: "./abstract/bls.js"
    },
    "./abstract/curve.js": {
      import: "./esm/abstract/curve.js",
      require: "./abstract/curve.js"
    },
    "./abstract/edwards.js": {
      import: "./esm/abstract/edwards.js",
      require: "./abstract/edwards.js"
    },
    "./abstract/hash-to-curve.js": {
      import: "./esm/abstract/hash-to-curve.js",
      require: "./abstract/hash-to-curve.js"
    },
    "./abstract/modular.js": {
      import: "./esm/abstract/modular.js",
      require: "./abstract/modular.js"
    },
    "./abstract/montgomery.js": {
      import: "./esm/abstract/montgomery.js",
      require: "./abstract/montgomery.js"
    },
    "./abstract/poseidon.js": {
      import: "./esm/abstract/poseidon.js",
      require: "./abstract/poseidon.js"
    },
    "./abstract/tower.js": {
      import: "./esm/abstract/tower.js",
      require: "./abstract/tower.js"
    },
    "./abstract/utils.js": {
      import: "./esm/abstract/utils.js",
      require: "./abstract/utils.js"
    },
    "./abstract/weierstrass.js": {
      import: "./esm/abstract/weierstrass.js",
      require: "./abstract/weierstrass.js"
    },
    "./abstract/fft.js": {
      import: "./esm/abstract/fft.js",
      require: "./abstract/fft.js"
    },
    "./_shortw_utils.js": {
      import: "./esm/_shortw_utils.js",
      require: "./_shortw_utils.js"
    },
    "./bls12-381.js": {
      import: "./esm/bls12-381.js",
      require: "./bls12-381.js"
    },
    "./bn254.js": {
      import: "./esm/bn254.js",
      require: "./bn254.js"
    },
    "./utils.js": {
      import: "./esm/utils.js",
      require: "./utils.js"
    },
    "./ed448.js": {
      import: "./esm/ed448.js",
      require: "./ed448.js"
    },
    "./ed25519.js": {
      import: "./esm/ed25519.js",
      require: "./ed25519.js"
    },
    "./index.js": {
      import: "./esm/index.js",
      require: "./index.js"
    },
    "./jubjub.js": {
      import: "./esm/jubjub.js",
      require: "./jubjub.js"
    },
    "./misc.js": {
      import: "./esm/misc.js",
      require: "./misc.js"
    },
    "./nist.js": {
      import: "./esm/nist.js",
      require: "./nist.js"
    },
    "./p256.js": {
      import: "./esm/p256.js",
      require: "./p256.js"
    },
    "./p384.js": {
      import: "./esm/p384.js",
      require: "./p384.js"
    },
    "./p521.js": {
      import: "./esm/p521.js",
      require: "./p521.js"
    },
    "./pasta.js": {
      import: "./esm/pasta.js",
      require: "./pasta.js"
    },
    "./secp256k1.js": {
      import: "./esm/secp256k1.js",
      require: "./secp256k1.js"
    }
  },
  engines: {
    node: "^14.21.3 || >=16"
  },
  keywords: [
    "elliptic",
    "curve",
    "cryptography",
    "secp256k1",
    "ed25519",
    "p256",
    "p384",
    "p521",
    "secp256r1",
    "ed448",
    "x25519",
    "ed25519",
    "bls12-381",
    "bn254",
    "alt_bn128",
    "bls",
    "noble",
    "ecc",
    "ecdsa",
    "eddsa",
    "weierstrass",
    "montgomery",
    "edwards",
    "schnorr",
    "fft"
  ],
  funding: "https://paulmillr.com/funding/"
};

// node_modules/@noble/hashes/package.json
var package_default123 = {
  name: "@noble/hashes",
  version: "1.8.0",
  description: "Audited & minimal 0-dependency JS implementation of SHA, RIPEMD, BLAKE, HMAC, HKDF, PBKDF & Scrypt",
  files: [
    "/*.js",
    "/*.js.map",
    "/*.d.ts",
    "/*.d.ts.map",
    "esm",
    "src/*.ts"
  ],
  scripts: {
    bench: "node benchmark/noble.js",
    "bench:compare": "MBENCH_DIMS='algorithm,buffer,library' node benchmark/hashes.js",
    "bench:compare-hkdf": "MBENCH_DIMS='algorithm,length,library' node benchmark/hkdf.js",
    "bench:compare-scrypt": "MBENCH_DIMS='iters,library' MBENCH_FILTER='async' node benchmark/scrypt.js",
    "bench:install": "cd benchmark; npm install; npm install .. --install-links",
    build: "npm run build:clean; tsc && tsc -p tsconfig.cjs.json",
    "build:clean": "rm -f *.{js,d.ts,js.map,d.ts.map} esm/*.{js,js.map,d.ts.map}",
    "build:release": "npx jsbt esbuild test/build",
    lint: "prettier --check 'src/**/*.{js,ts}' 'test/**/*.{js,ts}'",
    format: "prettier --write 'src/**/*.{js,ts}' 'test/**/*.{js,ts}'",
    test: "node --import ./test/esm-register.js test/index.js",
    "test:bun": "bun test/index.js",
    "test:deno": "deno --allow-env --allow-read --import-map=./test/import_map.json test/index.js",
    "test:dos": "node --import ./test/esm-register.js test/slow-dos.test.js",
    "test:big": "node --import ./test/esm-register.js test/slow-big.test.js",
    "test:kdf": "node --import ./test/esm-register.js test/slow-kdf.test.js"
  },
  author: "Paul Miller (https://paulmillr.com)",
  homepage: "https://paulmillr.com/noble/",
  repository: {
    type: "git",
    url: "git+https://github.com/paulmillr/noble-hashes.git"
  },
  license: "MIT",
  devDependencies: {
    "@paulmillr/jsbt": "0.3.3",
    "fast-check": "3.0.0",
    "micro-bmark": "0.4.1",
    "micro-should": "0.5.2",
    prettier: "3.5.3",
    typescript: "5.8.3"
  },
  engines: {
    node: "^14.21.3 || >=16"
  },
  exports: {
    ".": {
      import: "./esm/index.js",
      require: "./index.js"
    },
    "./crypto": {
      node: {
        import: "./esm/cryptoNode.js",
        default: "./cryptoNode.js"
      },
      import: "./esm/crypto.js",
      default: "./crypto.js"
    },
    "./_assert": {
      import: "./esm/_assert.js",
      require: "./_assert.js"
    },
    "./_md": {
      import: "./esm/_md.js",
      require: "./_md.js"
    },
    "./argon2": {
      import: "./esm/argon2.js",
      require: "./argon2.js"
    },
    "./blake1": {
      import: "./esm/blake1.js",
      require: "./blake1.js"
    },
    "./blake2": {
      import: "./esm/blake2.js",
      require: "./blake2.js"
    },
    "./blake2b": {
      import: "./esm/blake2b.js",
      require: "./blake2b.js"
    },
    "./blake2s": {
      import: "./esm/blake2s.js",
      require: "./blake2s.js"
    },
    "./blake3": {
      import: "./esm/blake3.js",
      require: "./blake3.js"
    },
    "./eskdf": {
      import: "./esm/eskdf.js",
      require: "./eskdf.js"
    },
    "./hkdf": {
      import: "./esm/hkdf.js",
      require: "./hkdf.js"
    },
    "./hmac": {
      import: "./esm/hmac.js",
      require: "./hmac.js"
    },
    "./legacy": {
      import: "./esm/legacy.js",
      require: "./legacy.js"
    },
    "./pbkdf2": {
      import: "./esm/pbkdf2.js",
      require: "./pbkdf2.js"
    },
    "./ripemd160": {
      import: "./esm/ripemd160.js",
      require: "./ripemd160.js"
    },
    "./scrypt": {
      import: "./esm/scrypt.js",
      require: "./scrypt.js"
    },
    "./sha1": {
      import: "./esm/sha1.js",
      require: "./sha1.js"
    },
    "./sha2": {
      import: "./esm/sha2.js",
      require: "./sha2.js"
    },
    "./sha3-addons": {
      import: "./esm/sha3-addons.js",
      require: "./sha3-addons.js"
    },
    "./sha3": {
      import: "./esm/sha3.js",
      require: "./sha3.js"
    },
    "./sha256": {
      import: "./esm/sha256.js",
      require: "./sha256.js"
    },
    "./sha512": {
      import: "./esm/sha512.js",
      require: "./sha512.js"
    },
    "./utils": {
      import: "./esm/utils.js",
      require: "./utils.js"
    },
    "./_assert.js": {
      import: "./esm/_assert.js",
      require: "./_assert.js"
    },
    "./_md.js": {
      import: "./esm/_md.js",
      require: "./_md.js"
    },
    "./argon2.js": {
      import: "./esm/argon2.js",
      require: "./argon2.js"
    },
    "./blake1.js": {
      import: "./esm/blake1.js",
      require: "./blake1.js"
    },
    "./blake2.js": {
      import: "./esm/blake2.js",
      require: "./blake2.js"
    },
    "./blake2b.js": {
      import: "./esm/blake2b.js",
      require: "./blake2b.js"
    },
    "./blake2s.js": {
      import: "./esm/blake2s.js",
      require: "./blake2s.js"
    },
    "./blake3.js": {
      import: "./esm/blake3.js",
      require: "./blake3.js"
    },
    "./eskdf.js": {
      import: "./esm/eskdf.js",
      require: "./eskdf.js"
    },
    "./hkdf.js": {
      import: "./esm/hkdf.js",
      require: "./hkdf.js"
    },
    "./hmac.js": {
      import: "./esm/hmac.js",
      require: "./hmac.js"
    },
    "./legacy.js": {
      import: "./esm/legacy.js",
      require: "./legacy.js"
    },
    "./pbkdf2.js": {
      import: "./esm/pbkdf2.js",
      require: "./pbkdf2.js"
    },
    "./ripemd160.js": {
      import: "./esm/ripemd160.js",
      require: "./ripemd160.js"
    },
    "./scrypt.js": {
      import: "./esm/scrypt.js",
      require: "./scrypt.js"
    },
    "./sha1.js": {
      import: "./esm/sha1.js",
      require: "./sha1.js"
    },
    "./sha2.js": {
      import: "./esm/sha2.js",
      require: "./sha2.js"
    },
    "./sha3-addons.js": {
      import: "./esm/sha3-addons.js",
      require: "./sha3-addons.js"
    },
    "./sha3.js": {
      import: "./esm/sha3.js",
      require: "./sha3.js"
    },
    "./sha256.js": {
      import: "./esm/sha256.js",
      require: "./sha256.js"
    },
    "./sha512.js": {
      import: "./esm/sha512.js",
      require: "./sha512.js"
    },
    "./utils.js": {
      import: "./esm/utils.js",
      require: "./utils.js"
    }
  },
  sideEffects: false,
  browser: {
    "node:crypto": false,
    "./crypto": "./crypto.js"
  },
  keywords: [
    "sha",
    "sha2",
    "sha3",
    "sha256",
    "sha512",
    "keccak",
    "kangarootwelve",
    "ripemd160",
    "blake2",
    "blake3",
    "hmac",
    "hkdf",
    "pbkdf2",
    "scrypt",
    "kdf",
    "hash",
    "cryptography",
    "security",
    "noble"
  ],
  funding: "https://paulmillr.com/funding/"
};

// node_modules/@noble/secp256k1/package.json
var package_default124 = {
  name: "@noble/secp256k1",
  version: "3.2.0",
  description: "Fastest 5KB JS implementation of secp256k1 ECDH & ECDSA signatures compliant with RFC6979",
  files: [
    "index.js",
    "index.d.ts",
    "index.ts"
  ],
  devDependencies: {
    "@noble/hashes": "2.4.0",
    "@paulmillr/jsbt": "0.7.2",
    "@types/node": "26.2.0",
    bismar: "0.1.9",
    prettier: "3.9.6",
    typescript: "7.0.2"
  },
  scripts: {
    benchmark: "node benchmark/secp256k1.ts",
    "benchmark:size": "bismar -bsm index.js/getPublicKey index.js/sign index.js/verifyAsync index.js/keygen index.js/schnorr index.js/utils",
    build: "tsc",
    check: "jsbt-check",
    format: "prettier --write 'index.ts' 'test/*.{js,ts}'",
    test: "node test/index.ts"
  },
  keywords: [
    "secp256k1",
    "rfc6979",
    "signature",
    "ecdsa",
    "noble",
    "cryptography",
    "elliptic curve",
    "ecc",
    "curve",
    "schnorr",
    "bitcoin",
    "ethereum"
  ],
  homepage: "https://paulmillr.com/noble/",
  funding: "https://paulmillr.com/funding/",
  repository: {
    type: "git",
    url: "git+https://github.com/paulmillr/noble-secp256k1.git"
  },
  type: "module",
  main: "index.js",
  module: "index.js",
  types: "index.d.ts",
  sideEffects: false,
  author: "Paul Miller (https://paulmillr.com)",
  license: "MIT"
};

// node_modules/@oomfware/eval/package.json
var package_default125 = {
  name: "@oomfware/eval",
  version: "0.1.0",
  description: "composable JavaScript eval templating",
  license: "0BSD",
  repository: {
    type: "git",
    url: "https://tangled.org/did:plc:mthorzi57b5as7jpzzy67kkv"
  },
  files: [
    "dist/"
  ],
  type: "module",
  sideEffects: false,
  exports: {
    ".": "./dist/index.mjs",
    "./package.json": "./package.json"
  },
  publishConfig: {
    access: "public"
  },
  devDependencies: {
    "@types/node": "^26.6.1",
    "@types/trusted-types": "^2.0.7",
    bumpp: "^12.3.0",
    mitata: "^1.0.34",
    oxfmt: "^0.68.0",
    oxlint: "^1.83.0",
    "oxlint-tsgolint": "^7.0.2002",
    tsdown: "^0.23.0",
    typescript: "^7.0.2"
  },
  scripts: {
    bench: "pnpm run build && node --expose-gc bench/eval.js",
    build: "oxlint && tsdown",
    dev: "tsdown --watch",
    fmt: "oxfmt",
    lint: "oxlint",
    test: "pnpm run build && node --test"
  }
};

// node_modules/@standard-schema/spec/package.json
var package_default126 = {
  name: "@standard-schema/spec",
  description: "A family of specs for interoperable TypeScript",
  version: "1.1.0",
  license: "MIT",
  author: "Colin McDonnell",
  homepage: "https://standardschema.dev",
  repository: {
    type: "git",
    url: "https://github.com/standard-schema/standard-schema"
  },
  keywords: [
    "typescript",
    "schema",
    "validation",
    "standard",
    "interface"
  ],
  type: "module",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      "standard-schema-spec": "./src/index.ts",
      import: {
        types: "./dist/index.d.ts",
        default: "./dist/index.js"
      },
      require: {
        types: "./dist/index.d.cts",
        default: "./dist/index.cjs"
      }
    }
  },
  sideEffects: false,
  files: [
    "dist"
  ],
  publishConfig: {
    access: "public"
  },
  devDependencies: {
    tsup: "^8.3.0",
    typescript: "^5.6.2"
  },
  scripts: {
    lint: "pnpm biome lint ./src",
    format: "pnpm biome format --write ./src",
    check: "pnpm biome check ./src",
    build: "tsup"
  }
};

// node_modules/@ts-morph/common/package.json
var package_default127 = {
  name: "@ts-morph/common",
  version: "0.28.1",
  description: "Common functionality for ts-morph packages.",
  main: "dist/ts-morph-common.js",
  author: "David Sherret",
  license: "MIT",
  repository: "git+https://github.com/dsherret/ts-morph.git",
  types: "lib/ts-morph-common.d.ts",
  scripts: {
    build: "deno task build:declarations && deno task build:node",
    "build:node": "rimraf dist && deno task createLibFile && deno task rollup && deno run -A scripts/bundleLocalTs.ts",
    "build:deno": "rimraf ../../deno/common && rimraf dist-deno && deno task rollup --environment BUILD:deno && deno task build:declarations && deno run -A scripts/buildDeno.ts",
    "build:declarations": "deno run -A scripts/buildDeclarations.ts",
    createLibFile: "deno run -A scripts/createLibFile.ts",
    test: "deno run -A npm:mocha",
    "test:ci": "deno task test",
    "test:debug": "deno task test --inspect-brk",
    rollup: "rollup --config"
  },
  dependencies: {
    minimatch: "^10.0.1",
    "path-browserify": "^1.0.1",
    tinyglobby: "^0.2.14"
  },
  devDependencies: {
    "@rollup/plugin-typescript": "^12.1.2",
    "@types/chai": "^5.2.1",
    "@types/mocha": "^10.0.10",
    "@types/node": "^22.14.1",
    chai: "^5.2.0",
    "cross-env": "^7.0.3",
    mocha: "^11.1.0",
    rimraf: "^6.0.1",
    rollup: "=4.40.0",
    "ts-node": "^10.9.2",
    tslib: "^2.8.1",
    typescript: "5.9.2"
  },
  publishConfig: {
    access: "public"
  },
  browser: {
    fs: false,
    "node:fs": false,
    "fs/promises": false,
    "node:fs/promises": false,
    os: false,
    "node:os": false,
    "fs.realpath": false,
    mkdirp: false,
    "dir-glob": false,
    "graceful-fs": false,
    tinyglobby: false,
    "source-map-support": false,
    "glob-parent": false,
    glob: false,
    path: false,
    "node:path": false,
    crypto: false,
    buffer: false,
    "@microsoft/typescript-etw": false,
    inspector: false
  }
};

// node_modules/abort-controller/package.json
var package_default128 = {
  name: "abort-controller",
  version: "3.0.0",
  description: "An implementation of WHATWG AbortController interface.",
  main: "dist/abort-controller",
  files: [
    "dist",
    "polyfill.*",
    "browser.*"
  ],
  engines: {
    node: ">=6.5"
  },
  dependencies: {
    "event-target-shim": "^5.0.0"
  },
  browser: "./browser.js",
  devDependencies: {
    "@babel/core": "^7.2.2",
    "@babel/plugin-transform-modules-commonjs": "^7.2.0",
    "@babel/preset-env": "^7.3.0",
    "@babel/register": "^7.0.0",
    "@mysticatea/eslint-plugin": "^8.0.1",
    "@mysticatea/spy": "^0.1.2",
    "@types/mocha": "^5.2.5",
    "@types/node": "^10.12.18",
    assert: "^1.4.1",
    codecov: "^3.1.0",
    "dts-bundle-generator": "^2.0.0",
    eslint: "^5.12.1",
    karma: "^3.1.4",
    "karma-chrome-launcher": "^2.2.0",
    "karma-coverage": "^1.1.2",
    "karma-firefox-launcher": "^1.1.0",
    "karma-growl-reporter": "^1.0.0",
    "karma-ie-launcher": "^1.0.0",
    "karma-mocha": "^1.3.0",
    "karma-rollup-preprocessor": "^7.0.0-rc.2",
    mocha: "^5.2.0",
    "npm-run-all": "^4.1.5",
    nyc: "^13.1.0",
    opener: "^1.5.1",
    rimraf: "^2.6.3",
    rollup: "^1.1.2",
    "rollup-plugin-babel": "^4.3.2",
    "rollup-plugin-babel-minify": "^7.0.0",
    "rollup-plugin-commonjs": "^9.2.0",
    "rollup-plugin-node-resolve": "^4.0.0",
    "rollup-plugin-sourcemaps": "^0.4.2",
    "rollup-plugin-typescript": "^1.0.0",
    "rollup-watch": "^4.3.1",
    "ts-node": "^8.0.1",
    "type-tester": "^1.0.0",
    typescript: "^3.2.4"
  },
  scripts: {
    preversion: "npm test",
    version: "npm run -s build && git add dist/*",
    postversion: "git push && git push --tags",
    clean: "rimraf .nyc_output coverage",
    coverage: "opener coverage/lcov-report/index.html",
    lint: "eslint . --ext .ts",
    build: "run-s -s build:*",
    "build:rollup": "rollup -c",
    "build:dts": "dts-bundle-generator -o dist/abort-controller.d.ts src/abort-controller.ts && ts-node scripts/fix-dts",
    test: "run-s -s lint test:*",
    "test:mocha": "nyc mocha test/*.ts",
    "test:karma": "karma start --single-run",
    watch: "run-p -s watch:*",
    "watch:mocha": "mocha test/*.ts --require ts-node/register --watch-extensions ts --watch --growl",
    "watch:karma": "karma start --watch",
    codecov: "codecov"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/mysticatea/abort-controller.git"
  },
  keywords: [
    "w3c",
    "whatwg",
    "event",
    "events",
    "abort",
    "cancel",
    "abortcontroller",
    "abortsignal",
    "controller",
    "signal",
    "shim"
  ],
  author: "Toru Nagashima (https://github.com/mysticatea)",
  license: "MIT",
  bugs: {
    url: "https://github.com/mysticatea/abort-controller/issues"
  },
  homepage: "https://github.com/mysticatea/abort-controller#readme"
};

// node_modules/ansi-regex/package.json
var package_default129 = {
  name: "ansi-regex",
  version: "5.0.1",
  description: "Regular expression for matching ANSI escape codes",
  license: "MIT",
  repository: "chalk/ansi-regex",
  author: {
    name: "Sindre Sorhus",
    email: "sindresorhus@gmail.com",
    url: "sindresorhus.com"
  },
  engines: {
    node: ">=8"
  },
  scripts: {
    test: "xo && ava && tsd",
    "view-supported": "node fixtures/view-codes.js"
  },
  files: [
    "index.js",
    "index.d.ts"
  ],
  keywords: [
    "ansi",
    "styles",
    "color",
    "colour",
    "colors",
    "terminal",
    "console",
    "cli",
    "string",
    "tty",
    "escape",
    "formatting",
    "rgb",
    "256",
    "shell",
    "xterm",
    "command-line",
    "text",
    "regex",
    "regexp",
    "re",
    "match",
    "test",
    "find",
    "pattern"
  ],
  devDependencies: {
    ava: "^2.4.0",
    tsd: "^0.9.0",
    xo: "^0.25.3"
  }
};

// node_modules/ansi-styles/package.json
var package_default130 = {
  name: "ansi-styles",
  version: "4.3.0",
  description: "ANSI escape codes for styling strings in the terminal",
  license: "MIT",
  repository: "chalk/ansi-styles",
  funding: "https://github.com/chalk/ansi-styles?sponsor=1",
  author: {
    name: "Sindre Sorhus",
    email: "sindresorhus@gmail.com",
    url: "sindresorhus.com"
  },
  engines: {
    node: ">=8"
  },
  scripts: {
    test: "xo && ava && tsd",
    screenshot: "svg-term --command='node screenshot' --out=screenshot.svg --padding=3 --width=55 --height=3 --at=1000 --no-cursor"
  },
  files: [
    "index.js",
    "index.d.ts"
  ],
  keywords: [
    "ansi",
    "styles",
    "color",
    "colour",
    "colors",
    "terminal",
    "console",
    "cli",
    "string",
    "tty",
    "escape",
    "formatting",
    "rgb",
    "256",
    "shell",
    "xterm",
    "log",
    "logging",
    "command-line",
    "text"
  ],
  dependencies: {
    "color-convert": "^2.0.1"
  },
  devDependencies: {
    "@types/color-convert": "^1.9.0",
    ava: "^2.3.0",
    "svg-term-cli": "^2.1.1",
    tsd: "^0.11.0",
    xo: "^0.25.3"
  }
};

// node_modules/atomic-sleep/package.json
var package_default131 = {
  name: "atomic-sleep",
  version: "1.0.0",
  description: "Zero CPU overhead, zero dependency, true event-loop blocking sleep",
  main: "index.js",
  scripts: {
    test: "tap -R classic- -j1 test",
    lint: "standard",
    ci: "npm run lint && npm test"
  },
  keywords: [
    "sleep",
    "pause",
    "wait",
    "performance",
    "atomics"
  ],
  engines: {
    node: ">=8.0.0"
  },
  author: "David Mark Clements (@davidmarkclem)",
  license: "MIT",
  devDependencies: {
    standard: "^14.3.1",
    tap: "^14.10.6",
    tape: "^4.13.2"
  },
  dependencies: {},
  repository: {
    type: "git",
    url: "git+https://github.com/davidmarkclements/atomic-sleep.git"
  },
  bugs: {
    url: "https://github.com/davidmarkclements/atomic-sleep/issues"
  },
  homepage: "https://github.com/davidmarkclements/atomic-sleep#readme"
};

// node_modules/balanced-match/package.json
var package_default132 = {
  name: "balanced-match",
  description: 'Match balanced character pairs, like "{" and "}"',
  version: "4.0.4",
  files: [
    "dist"
  ],
  repository: {
    type: "git",
    url: "git://github.com/juliangruber/balanced-match.git"
  },
  exports: {
    "./package.json": "./package.json",
    ".": {
      import: {
        types: "./dist/esm/index.d.ts",
        default: "./dist/esm/index.js"
      },
      require: {
        types: "./dist/commonjs/index.d.ts",
        default: "./dist/commonjs/index.js"
      }
    }
  },
  type: "module",
  scripts: {
    preversion: "npm test",
    postversion: "npm publish",
    prepublishOnly: "git push origin --follow-tags",
    prepare: "tshy",
    pretest: "npm run prepare",
    presnap: "npm run prepare",
    test: "tap",
    snap: "tap",
    format: "prettier --write .",
    benchmark: "node benchmark/index.js",
    typedoc: "typedoc --tsconfig .tshy/esm.json ./src/*.ts"
  },
  devDependencies: {
    "@types/brace-expansion": "^1.1.2",
    "@types/node": "^25.2.1",
    mkdirp: "^3.0.1",
    prettier: "^3.3.2",
    tap: "^21.6.2",
    tshy: "^3.0.2",
    typedoc: "^0.28.5"
  },
  keywords: [
    "match",
    "regexp",
    "test",
    "balanced",
    "parse"
  ],
  license: "MIT",
  engines: {
    node: "18 || 20 || >=22"
  },
  tshy: {
    exports: {
      "./package.json": "./package.json",
      ".": "./src/index.ts"
    }
  },
  main: "./dist/commonjs/index.js",
  types: "./dist/commonjs/index.d.ts",
  module: "./dist/esm/index.js"
};

// node_modules/base64-js/package.json
var package_default133 = {
  name: "base64-js",
  description: "Base64 encoding/decoding in pure JS",
  version: "1.5.1",
  author: "T. Jameson Little <t.jameson.little@gmail.com>",
  typings: "index.d.ts",
  bugs: {
    url: "https://github.com/beatgammit/base64-js/issues"
  },
  devDependencies: {
    "babel-minify": "^0.5.1",
    benchmark: "^2.1.4",
    browserify: "^16.3.0",
    standard: "*",
    tape: "4.x"
  },
  homepage: "https://github.com/beatgammit/base64-js",
  keywords: [
    "base64"
  ],
  license: "MIT",
  main: "index.js",
  repository: {
    type: "git",
    url: "git://github.com/beatgammit/base64-js.git"
  },
  scripts: {
    build: "browserify -s base64js -r ./ | minify > base64js.min.js",
    lint: "standard",
    test: "npm run lint && npm run unit",
    unit: "tape test/*.js"
  },
  funding: [
    {
      type: "github",
      url: "https://github.com/sponsors/feross"
    },
    {
      type: "patreon",
      url: "https://www.patreon.com/feross"
    },
    {
      type: "consulting",
      url: "https://feross.org/support"
    }
  ]
};

// node_modules/brace-expansion/package.json
var package_default134 = {
  name: "brace-expansion",
  description: "Brace expansion as known from sh/bash",
  version: "5.0.12",
  files: [
    "dist"
  ],
  exports: {
    "./package.json": "./package.json",
    ".": {
      import: {
        types: "./dist/esm/index.d.ts",
        default: "./dist/esm/index.js"
      },
      require: {
        types: "./dist/commonjs/index.d.ts",
        default: "./dist/commonjs/index.js"
      }
    }
  },
  type: "module",
  scripts: {
    preversion: "npm test",
    postversion: "npm publish",
    prepublishOnly: "git push origin --follow-tags",
    prepare: "tshy",
    pretest: "npm run prepare",
    presnap: "npm run prepare",
    test: "tap",
    snap: "tap",
    format: "prettier --write .",
    "format:check": "prettier --check .",
    benchmark: "node benchmark/index.js",
    typedoc: "typedoc --tsconfig .tshy/esm.json ./src/*.ts"
  },
  devDependencies: {
    "@types/brace-expansion": "^1.1.2",
    "@types/node": "^25.2.1",
    mkdirp: "^3.0.1",
    prettier: "^3.3.2",
    tap: "^21.6.2",
    tshy: "^3.0.2",
    typedoc: "^0.28.5"
  },
  dependencies: {
    "balanced-match": "^4.0.2"
  },
  license: "MIT",
  engines: {
    node: "20 || >=22"
  },
  tshy: {
    exports: {
      "./package.json": "./package.json",
      ".": "./src/index.ts"
    }
  },
  main: "./dist/commonjs/index.js",
  types: "./dist/commonjs/index.d.ts",
  module: "./dist/esm/index.js",
  repository: {
    type: "git",
    url: "git+https://github.com/juliangruber/brace-expansion.git"
  }
};

// node_modules/buffer/package.json
var package_default135 = {
  name: "buffer",
  description: "Node.js Buffer API, for the browser",
  version: "6.0.3",
  author: {
    name: "Feross Aboukhadijeh",
    email: "feross@feross.org",
    url: "https://feross.org"
  },
  bugs: {
    url: "https://github.com/feross/buffer/issues"
  },
  contributors: [
    "Romain Beauxis <toots@rastageeks.org>",
    "James Halliday <mail@substack.net>"
  ],
  dependencies: {
    "base64-js": "^1.3.1",
    ieee754: "^1.2.1"
  },
  devDependencies: {
    airtap: "^3.0.0",
    benchmark: "^2.1.4",
    browserify: "^17.0.0",
    "concat-stream": "^2.0.0",
    hyperquest: "^2.1.3",
    "is-buffer": "^2.0.5",
    "is-nan": "^1.3.0",
    split: "^1.0.1",
    standard: "*",
    tape: "^5.0.1",
    through2: "^4.0.2",
    "uglify-js": "^3.11.5"
  },
  homepage: "https://github.com/feross/buffer",
  jspm: {
    map: {
      "./index.js": {
        node: "@node/buffer"
      }
    }
  },
  keywords: [
    "arraybuffer",
    "browser",
    "browserify",
    "buffer",
    "compatible",
    "dataview",
    "uint8array"
  ],
  license: "MIT",
  main: "index.js",
  types: "index.d.ts",
  repository: {
    type: "git",
    url: "git://github.com/feross/buffer.git"
  },
  scripts: {
    perf: "browserify --debug perf/bracket-notation.js > perf/bundle.js && open perf/index.html",
    "perf-node": "node perf/bracket-notation.js && node perf/concat.js && node perf/copy-big.js && node perf/copy.js && node perf/new-big.js && node perf/new.js && node perf/readDoubleBE.js && node perf/readFloatBE.js && node perf/readUInt32LE.js && node perf/slice.js && node perf/writeFloatBE.js",
    size: "browserify -r ./ | uglifyjs -c -m | gzip | wc -c",
    test: "standard && node ./bin/test.js",
    "test-browser-old": "airtap -- test/*.js",
    "test-browser-old-local": "airtap --local -- test/*.js",
    "test-browser-new": "airtap -- test/*.js test/node/*.js",
    "test-browser-new-local": "airtap --local -- test/*.js test/node/*.js",
    "test-node": "tape test/*.js test/node/*.js",
    "update-authors": "./bin/update-authors.sh"
  },
  standard: {
    ignore: [
      "test/node/**/*.js",
      "test/common.js",
      "test/_polyfill.js",
      "perf/**/*.js"
    ]
  },
  funding: [
    {
      type: "github",
      url: "https://github.com/sponsors/feross"
    },
    {
      type: "patreon",
      url: "https://www.patreon.com/feross"
    },
    {
      type: "consulting",
      url: "https://feross.org/support"
    }
  ]
};

// node_modules/cborg/package.json
var package_default136 = {
  name: "cborg",
  version: "1.10.2",
  description: "Fast CBOR with a focus on strictness",
  main: "./cjs/cborg.js",
  bin: {
    cborg: "cli.js"
  },
  scripts: {
    lint: "standard *.js lib/*.js test/*.js",
    build: "npm run build:js && npm run build:types",
    "build:js": "ipjs build --tests --main",
    "build:copy": "mkdir -p dist/test && cp test/*.js dist/test/ && cp -a tsconfig.json *.js *.ts lib dist/",
    "build:types": "npm run build:copy && cd dist && tsc --build",
    "test:cjs": "npm run build && mocha dist/cjs/node-test/test-*.js dist/cjs/node-test/node-test-*.js",
    "test:esm": "npm run build && mocha dist/esm/node-test/test-*.js dist/esm/node-test/node-test-*.js",
    "test:node": "c8 --check-coverage --branches 100 --functions 100 --lines 100 mocha test/test-*.js test/node-test-*.js",
    "test:browser:cjs": "polendina --page --worker --serviceworker --cleanup dist/cjs/browser-test/test-*.js",
    "test:browser:esm": "polendina --page --worker --serviceworker --cleanup dist/esm/browser-test/test-*.js",
    "test:browser": "npm run test:browser:cjs && npm run test:browser:cjs",
    test: "npm run lint && npm run test:node && npm run test:esm && npm run test:browser:esm",
    "test:ci": "npm run lint && npm run test:node && npm run test:cjs && npm run test:esm && npm run test:browser",
    coverage: "c8 --reporter=html mocha test/test-*.js && npx st -d coverage -p 8080"
  },
  repository: {
    type: "git",
    url: "https://github.com/rvagg/cborg.git"
  },
  keywords: [
    "cbor"
  ],
  author: "Rod <rod@vagg.org> (http://r.va.gg/)",
  license: "Apache-2.0",
  devDependencies: {
    c8: "^7.10.0",
    chai: "^4.3.4",
    ipjs: "^5.2.0",
    "ipld-garbage": "^5.0.0",
    mocha: "^10.0.0",
    polendina: "~3.2.1",
    standard: "^17.0.0",
    typescript: "~5.0.2"
  },
  exports: {
    ".": {
      browser: "./esm/cborg.js",
      require: "./cjs/cborg.js",
      import: "./esm/cborg.js"
    },
    "./length": {
      browser: "./esm/lib/length.js",
      require: "./cjs/lib/length.js",
      import: "./esm/lib/length.js"
    },
    "./taglib": {
      browser: "./esm/taglib.js",
      require: "./cjs/taglib.js",
      import: "./esm/taglib.js"
    },
    "./json": {
      browser: "./esm/lib/json/json.js",
      require: "./cjs/lib/json/json.js",
      import: "./esm/lib/json/json.js"
    }
  },
  types: "cborg.d.ts",
  typesVersions: {
    "*": {
      json: [
        "types/lib/json/json.d.ts"
      ],
      length: [
        "types/lib/length.d.ts"
      ],
      "*": [
        "types/*"
      ],
      "types/*": [
        "types/*"
      ]
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "chore",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Trivial Changes"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      [
        "@semantic-release/npm",
        {
          pkgRoot: "dist"
        }
      ],
      "@semantic-release/github",
      "@semantic-release/git"
    ]
  },
  browser: {
    ".": "./cjs/cborg.js",
    "./length": "./cjs/lib/length.js",
    "./taglib": "./cjs/taglib.js",
    "./json": "./cjs/lib/json/json.js"
  }
};

// node_modules/cliui/package.json
var package_default137 = {
  name: "cliui",
  version: "8.0.1",
  description: "easily create complex multi-column command-line-interfaces",
  main: "build/index.cjs",
  exports: {
    ".": [
      {
        import: "./index.mjs",
        require: "./build/index.cjs"
      },
      "./build/index.cjs"
    ]
  },
  type: "module",
  module: "./index.mjs",
  scripts: {
    check: "standardx '**/*.ts' && standardx '**/*.js' && standardx '**/*.cjs'",
    fix: "standardx --fix '**/*.ts' && standardx --fix '**/*.js' && standardx --fix '**/*.cjs'",
    pretest: "rimraf build && tsc -p tsconfig.test.json && cross-env NODE_ENV=test npm run build:cjs",
    test: "c8 mocha ./test/*.cjs",
    "test:esm": "c8 mocha ./test/esm/cliui-test.mjs",
    postest: "check",
    coverage: "c8 report --check-coverage",
    precompile: "rimraf build",
    compile: "tsc",
    postcompile: "npm run build:cjs",
    "build:cjs": "rollup -c",
    prepare: "npm run compile"
  },
  repository: "yargs/cliui",
  standard: {
    ignore: [
      "**/example/**"
    ],
    globals: [
      "it"
    ]
  },
  keywords: [
    "cli",
    "command-line",
    "layout",
    "design",
    "console",
    "wrap",
    "table"
  ],
  author: "Ben Coe <ben@npmjs.com>",
  license: "ISC",
  dependencies: {
    "string-width": "^4.2.0",
    "strip-ansi": "^6.0.1",
    "wrap-ansi": "^7.0.0"
  },
  devDependencies: {
    "@types/node": "^14.0.27",
    "@typescript-eslint/eslint-plugin": "^4.0.0",
    "@typescript-eslint/parser": "^4.0.0",
    c8: "^7.3.0",
    chai: "^4.2.0",
    chalk: "^4.1.0",
    "cross-env": "^7.0.2",
    eslint: "^7.6.0",
    "eslint-plugin-import": "^2.22.0",
    "eslint-plugin-node": "^11.1.0",
    gts: "^3.0.0",
    mocha: "^10.0.0",
    rimraf: "^3.0.2",
    rollup: "^2.23.1",
    "rollup-plugin-ts": "^3.0.2",
    standardx: "^7.0.0",
    typescript: "^4.0.0"
  },
  files: [
    "build",
    "index.mjs",
    "!*.d.ts"
  ],
  engines: {
    node: ">=12"
  }
};

// node_modules/code-block-writer/package.json
var package_default138 = {
  name: "code-block-writer",
  version: "13.0.3",
  description: "A simple code writer that assists with formatting and visualizing blocks of code.",
  keywords: [
    "code generation",
    "typescript",
    "writer",
    "printer"
  ],
  author: "David Sherret",
  homepage: "https://github.com/dsherret/code-block-writer#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/dsherret/code-block-writer.git"
  },
  license: "MIT",
  bugs: {
    url: "https://github.com/dsherret/code-block-writer/issues"
  },
  main: "./script/mod.js",
  module: "./esm/mod.js",
  exports: {
    ".": {
      import: "./esm/mod.js",
      require: "./script/mod.js"
    }
  },
  scripts: {
    test: "node test_runner.js"
  },
  devDependencies: {
    "@types/node": "^20.9.0",
    picocolors: "^1.0.0",
    "@types/chai": "4.3",
    chai: "4.3.7",
    "@deno/shim-deno": "~0.18.0"
  },
  _generatedBy: "dnt@dev"
};

// node_modules/color-convert/package.json
var package_default139 = {
  name: "color-convert",
  description: "Plain color conversion functions",
  version: "2.0.1",
  author: "Heather Arthur <fayearthur@gmail.com>",
  license: "MIT",
  repository: "Qix-/color-convert",
  scripts: {
    pretest: "xo",
    test: "node test/basic.js"
  },
  engines: {
    node: ">=7.0.0"
  },
  keywords: [
    "color",
    "colour",
    "convert",
    "converter",
    "conversion",
    "rgb",
    "hsl",
    "hsv",
    "hwb",
    "cmyk",
    "ansi",
    "ansi16"
  ],
  files: [
    "index.js",
    "conversions.js",
    "route.js"
  ],
  xo: {
    rules: {
      "default-case": 0,
      "no-inline-comments": 0,
      "operator-linebreak": 0
    }
  },
  devDependencies: {
    chalk: "^2.4.2",
    xo: "^0.24.0"
  },
  dependencies: {
    "color-name": "~1.1.4"
  }
};

// node_modules/color-name/package.json
var package_default140 = {
  name: "color-name",
  version: "1.1.4",
  description: "A list of color names and its values",
  main: "index.js",
  files: [
    "index.js"
  ],
  scripts: {
    test: "node test.js"
  },
  repository: {
    type: "git",
    url: "git@github.com:colorjs/color-name.git"
  },
  keywords: [
    "color-name",
    "color",
    "color-keyword",
    "keyword"
  ],
  author: "DY <dfcreative@gmail.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/colorjs/color-name/issues"
  },
  homepage: "https://github.com/colorjs/color-name"
};

// node_modules/core-js/package.json
var package_default141 = {
  name: "core-js",
  version: "3.50.0",
  type: "commonjs",
  description: "Standard library",
  keywords: [
    "ES3",
    "ES5",
    "ES6",
    "ES7",
    "ES2015",
    "ES2016",
    "ES2017",
    "ES2018",
    "ES2019",
    "ES2020",
    "ES2021",
    "ES2022",
    "ES2023",
    "ES2024",
    "ES2025",
    "ES2026",
    "ECMAScript 3",
    "ECMAScript 5",
    "ECMAScript 6",
    "ECMAScript 7",
    "ECMAScript 2015",
    "ECMAScript 2016",
    "ECMAScript 2017",
    "ECMAScript 2018",
    "ECMAScript 2019",
    "ECMAScript 2020",
    "ECMAScript 2021",
    "ECMAScript 2022",
    "ECMAScript 2023",
    "ECMAScript 2024",
    "ECMAScript 2025",
    "ECMAScript 2026",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "TypedArray",
    "Promise",
    "Observable",
    "Symbol",
    "Iterator",
    "AsyncIterator",
    "URL",
    "URLSearchParams",
    "queueMicrotask",
    "setImmediate",
    "structuredClone",
    "polyfill",
    "ponyfill",
    "shim"
  ],
  repository: {
    type: "git",
    url: "git+https://github.com/zloirock/core-js.git",
    directory: "packages/core-js"
  },
  homepage: "https://core-js.io",
  bugs: {
    url: "https://github.com/zloirock/core-js/issues"
  },
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/core-js"
  },
  license: "MIT",
  author: {
    name: "Denis Pushkarev",
    email: "zloirock@zloirock.ru",
    url: "http://zloirock.ru"
  },
  sideEffects: true,
  main: "index.js",
  scripts: {
    postinstall: `node -e "try{require('./postinstall')}catch(e){}"`
  },
  engines: {
    node: "*"
  }
};

// node_modules/emoji-regex/package.json
var package_default142 = {
  name: "emoji-regex",
  version: "8.0.0",
  description: "A regular expression to match all Emoji-only symbols as per the Unicode Standard.",
  homepage: "https://mths.be/emoji-regex",
  main: "index.js",
  types: "index.d.ts",
  keywords: [
    "unicode",
    "regex",
    "regexp",
    "regular expressions",
    "code points",
    "symbols",
    "characters",
    "emoji"
  ],
  license: "MIT",
  author: {
    name: "Mathias Bynens",
    url: "https://mathiasbynens.be/"
  },
  repository: {
    type: "git",
    url: "https://github.com/mathiasbynens/emoji-regex.git"
  },
  bugs: "https://github.com/mathiasbynens/emoji-regex/issues",
  files: [
    "LICENSE-MIT.txt",
    "index.js",
    "index.d.ts",
    "text.js",
    "es2015/index.js",
    "es2015/text.js"
  ],
  scripts: {
    build: "rm -rf -- es2015; babel src -d .; NODE_ENV=es2015 babel src -d ./es2015; node script/inject-sequences.js",
    test: "mocha",
    "test:watch": "npm run test -- --watch"
  },
  devDependencies: {
    "@babel/cli": "^7.2.3",
    "@babel/core": "^7.3.4",
    "@babel/plugin-proposal-unicode-property-regex": "^7.2.0",
    "@babel/preset-env": "^7.3.4",
    mocha: "^6.0.2",
    regexgen: "^1.3.0",
    "unicode-12.0.0": "^0.7.9"
  }
};

// node_modules/escalade/package.json
var package_default143 = {
  name: "escalade",
  version: "3.2.0",
  repository: "lukeed/escalade",
  description: "A tiny (183B to 210B) and fast utility to ascend parent directories",
  module: "dist/index.mjs",
  main: "dist/index.js",
  types: "index.d.ts",
  license: "MIT",
  author: {
    name: "Luke Edwards",
    email: "luke.edwards05@gmail.com",
    url: "https://lukeed.com"
  },
  exports: {
    ".": [
      {
        import: {
          types: "./index.d.mts",
          default: "./dist/index.mjs"
        },
        require: {
          types: "./index.d.ts",
          default: "./dist/index.js"
        }
      },
      "./dist/index.js"
    ],
    "./sync": [
      {
        import: {
          types: "./sync/index.d.mts",
          default: "./sync/index.mjs"
        },
        require: {
          types: "./sync/index.d.ts",
          default: "./sync/index.js"
        }
      },
      "./sync/index.js"
    ]
  },
  files: [
    "*.d.mts",
    "*.d.ts",
    "dist",
    "sync"
  ],
  modes: {
    sync: "src/sync.js",
    default: "src/async.js"
  },
  engines: {
    node: ">=6"
  },
  scripts: {
    build: "bundt",
    pretest: "npm run build",
    test: "uvu -r esm test -i fixtures"
  },
  keywords: [
    "find",
    "parent",
    "parents",
    "directory",
    "search",
    "walk"
  ],
  devDependencies: {
    bundt: "1.1.1",
    esm: "3.2.25",
    uvu: "0.3.3"
  }
};

// node_modules/esm-env/package.json
var package_default144 = {
  name: "esm-env",
  version: "1.2.2",
  repository: {
    type: "git",
    url: "https://github.com/benmccann/esm-env.git"
  },
  license: "MIT",
  homepage: "https://github.com/benmccann/esm-env",
  author: "Ben McCann (https://www.benmccann.com)",
  type: "module",
  exports: {
    ".": {
      types: "./index.d.ts",
      default: "./index.js"
    },
    "./browser": {
      browser: "./true.js",
      development: "./false.js",
      production: "./false.js",
      default: "./browser-fallback.js"
    },
    "./development": {
      development: "./true.js",
      production: "./false.js",
      default: "./dev-fallback.js"
    },
    "./node": {
      node: "./true.js",
      default: "./false.js"
    }
  }
};

// node_modules/event-target-shim/package.json
var package_default145 = {
  name: "event-target-shim",
  version: "5.0.1",
  description: "An implementation of WHATWG EventTarget interface.",
  main: "dist/event-target-shim",
  types: "index.d.ts",
  files: [
    "dist",
    "index.d.ts"
  ],
  engines: {
    node: ">=6"
  },
  scripts: {
    preversion: "npm test",
    version: "npm run build && git add dist/*",
    postversion: "git push && git push --tags",
    clean: "rimraf .nyc_output coverage",
    coverage: "nyc report --reporter lcov && opener coverage/lcov-report/index.html",
    lint: "eslint src test scripts --ext .js,.mjs",
    build: "rollup -c scripts/rollup.config.js",
    pretest: "npm run lint",
    test: "run-s test:*",
    "test:mocha": "nyc --require ./scripts/babel-register mocha test/*.mjs",
    "test:karma": "karma start scripts/karma.conf.js --single-run",
    watch: "run-p watch:*",
    "watch:mocha": "mocha test/*.mjs --require ./scripts/babel-register --watch --watch-extensions js,mjs --growl",
    "watch:karma": "karma start scripts/karma.conf.js --watch",
    codecov: "codecov"
  },
  devDependencies: {
    "@babel/core": "^7.2.2",
    "@babel/plugin-transform-modules-commonjs": "^7.2.0",
    "@babel/preset-env": "^7.2.3",
    "@babel/register": "^7.0.0",
    "@mysticatea/eslint-plugin": "^8.0.1",
    "@mysticatea/spy": "^0.1.2",
    assert: "^1.4.1",
    codecov: "^3.1.0",
    eslint: "^5.12.1",
    karma: "^3.1.4",
    "karma-chrome-launcher": "^2.2.0",
    "karma-coverage": "^1.1.2",
    "karma-firefox-launcher": "^1.0.0",
    "karma-growl-reporter": "^1.0.0",
    "karma-ie-launcher": "^1.0.0",
    "karma-mocha": "^1.3.0",
    "karma-rollup-preprocessor": "^7.0.0-rc.2",
    mocha: "^5.2.0",
    "npm-run-all": "^4.1.5",
    nyc: "^13.1.0",
    opener: "^1.5.1",
    rimraf: "^2.6.3",
    rollup: "^1.1.1",
    "rollup-plugin-babel": "^4.3.2",
    "rollup-plugin-babel-minify": "^7.0.0",
    "rollup-plugin-commonjs": "^9.2.0",
    "rollup-plugin-json": "^3.1.0",
    "rollup-plugin-node-resolve": "^4.0.0",
    "rollup-watch": "^4.3.1",
    "type-tester": "^1.0.0",
    typescript: "^3.2.4"
  },
  repository: {
    type: "git",
    url: "https://github.com/mysticatea/event-target-shim.git"
  },
  keywords: [
    "w3c",
    "whatwg",
    "eventtarget",
    "event",
    "events",
    "shim"
  ],
  author: "Toru Nagashima",
  license: "MIT",
  bugs: {
    url: "https://github.com/mysticatea/event-target-shim/issues"
  },
  homepage: "https://github.com/mysticatea/event-target-shim"
};

// node_modules/events/package.json
var package_default146 = {
  name: "events",
  version: "3.3.0",
  description: "Node's event emitter for all engines.",
  keywords: [
    "events",
    "eventEmitter",
    "eventDispatcher",
    "listeners"
  ],
  author: "Irakli Gozalishvili <rfobic@gmail.com> (http://jeditoolkit.com)",
  repository: {
    type: "git",
    url: "git://github.com/Gozala/events.git",
    web: "https://github.com/Gozala/events"
  },
  bugs: {
    url: "http://github.com/Gozala/events/issues/"
  },
  main: "./events.js",
  engines: {
    node: ">=0.8.x"
  },
  devDependencies: {
    airtap: "^1.0.0",
    "functions-have-names": "^1.2.1",
    has: "^1.0.3",
    "has-symbols": "^1.0.1",
    isarray: "^2.0.5",
    tape: "^5.0.0"
  },
  scripts: {
    test: "node tests/index.js",
    "test:browsers": "airtap -- tests/index.js"
  },
  license: "MIT"
};

// node_modules/fast-redact/package.json
var package_default147 = {
  name: "fast-redact",
  version: "3.5.0",
  description: "very fast object redaction",
  main: "index.js",
  scripts: {
    test: "tap test",
    posttest: "standard index.js 'lib/*.js' 'example/*.js' benchmark/index.js test/index.js | snazzy",
    cov: "tap --cov test",
    "cov-ui": "tap --coverage-report=html test",
    ci: "tap --cov --100 test",
    bench: "node benchmark"
  },
  keywords: [
    "redact",
    "censor",
    "performance",
    "performant",
    "gdpr",
    "fast",
    "speed",
    "serialize",
    "stringify"
  ],
  author: "David Mark Clements <david.clements@nearform.com>",
  license: "MIT",
  devDependencies: {
    fastbench: "^1.0.1",
    "pino-noir": "^2.2.1",
    snazzy: "^8.0.0",
    standard: "^12.0.1",
    tap: "^12.5.2"
  },
  engines: {
    node: ">=6"
  },
  directories: {
    example: "example",
    lib: "lib",
    test: "test"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/davidmarkclements/fast-redact.git"
  },
  bugs: {
    url: "https://github.com/davidmarkclements/fast-redact/issues"
  },
  homepage: "https://github.com/davidmarkclements/fast-redact#readme"
};

// node_modules/fdir/package.json
var package_default148 = {
  name: "fdir",
  version: "6.5.0",
  description: "The fastest directory crawler & globbing alternative to glob, fast-glob, & tiny-glob. Crawls 1m files in < 1s",
  main: "./dist/index.cjs",
  types: "./dist/index.d.cts",
  type: "module",
  scripts: {
    prepublishOnly: "npm run test && npm run build",
    build: "tsdown",
    format: "prettier --write src __tests__ benchmarks",
    test: "vitest run __tests__/",
    "test:coverage": "vitest run --coverage __tests__/",
    "test:watch": "vitest __tests__/",
    bench: "ts-node benchmarks/benchmark.js",
    "bench:glob": "ts-node benchmarks/glob-benchmark.ts",
    "bench:fdir": "ts-node benchmarks/fdir-benchmark.ts",
    release: "./scripts/release.sh"
  },
  engines: {
    node: ">=12.0.0"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/thecodrr/fdir.git"
  },
  keywords: [
    "util",
    "os",
    "sys",
    "fs",
    "walk",
    "crawler",
    "directory",
    "files",
    "io",
    "tiny-glob",
    "glob",
    "fast-glob",
    "speed",
    "javascript",
    "nodejs"
  ],
  author: "thecodrr <thecodrr@protonmail.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/thecodrr/fdir/issues"
  },
  homepage: "https://github.com/thecodrr/fdir#readme",
  devDependencies: {
    "@types/glob": "^8.1.0",
    "@types/mock-fs": "^4.13.4",
    "@types/node": "^20.9.4",
    "@types/picomatch": "^4.0.0",
    "@types/tap": "^15.0.11",
    "@vitest/coverage-v8": "^0.34.6",
    "all-files-in-tree": "^1.1.2",
    benny: "^3.7.1",
    "csv-to-markdown-table": "^1.3.1",
    expect: "^29.7.0",
    "fast-glob": "^3.3.2",
    fdir1: "npm:fdir@1.2.0",
    fdir2: "npm:fdir@2.1.0",
    fdir3: "npm:fdir@3.4.2",
    fdir4: "npm:fdir@4.1.0",
    fdir5: "npm:fdir@5.0.0",
    "fs-readdir-recursive": "^1.1.0",
    "get-all-files": "^4.1.0",
    glob: "^10.3.10",
    "klaw-sync": "^6.0.0",
    "mock-fs": "^5.2.0",
    picomatch: "^4.0.2",
    prettier: "^3.5.3",
    "recur-readdir": "0.0.1",
    "recursive-files": "^1.0.2",
    "recursive-fs": "^2.1.0",
    "recursive-readdir": "^2.2.3",
    rrdir: "^12.1.0",
    systeminformation: "^5.21.17",
    "tiny-glob": "^0.2.9",
    "ts-node": "^10.9.1",
    tsdown: "^0.12.5",
    typescript: "^5.3.2",
    vitest: "^0.34.6",
    "walk-sync": "^3.0.0"
  },
  peerDependencies: {
    picomatch: "^3 || ^4"
  },
  peerDependenciesMeta: {
    picomatch: {
      optional: true
    }
  },
  module: "./dist/index.mjs",
  exports: {
    ".": {
      import: "./dist/index.mjs",
      require: "./dist/index.cjs"
    },
    "./package.json": "./package.json"
  }
};

// node_modules/get-caller-file/package.json
var package_default149 = {
  name: "get-caller-file",
  version: "2.0.5",
  description: "",
  main: "index.js",
  directories: {
    test: "tests"
  },
  files: [
    "index.js",
    "index.js.map",
    "index.d.ts"
  ],
  scripts: {
    prepare: "tsc",
    test: "mocha test",
    "test:debug": "mocha test"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/stefanpenner/get-caller-file.git"
  },
  author: "Stefan Penner",
  license: "ISC",
  bugs: {
    url: "https://github.com/stefanpenner/get-caller-file/issues"
  },
  homepage: "https://github.com/stefanpenner/get-caller-file#readme",
  devDependencies: {
    "@types/chai": "^4.1.7",
    "@types/ensure-posix-path": "^1.0.0",
    "@types/mocha": "^5.2.6",
    "@types/node": "^11.10.5",
    chai: "^4.1.2",
    "ensure-posix-path": "^1.0.1",
    mocha: "^5.2.0",
    typescript: "^3.3.3333"
  },
  engines: {
    node: "6.* || 8.* || >= 10.*"
  }
};

// node_modules/ieee754/package.json
var package_default150 = {
  name: "ieee754",
  description: "Read/write IEEE754 floating point numbers from/to a Buffer or array-like object",
  version: "1.2.1",
  author: {
    name: "Feross Aboukhadijeh",
    email: "feross@feross.org",
    url: "https://feross.org"
  },
  contributors: [
    "Romain Beauxis <toots@rastageeks.org>"
  ],
  devDependencies: {
    airtap: "^3.0.0",
    standard: "*",
    tape: "^5.0.1"
  },
  keywords: [
    "IEEE 754",
    "buffer",
    "convert",
    "floating point",
    "ieee754"
  ],
  license: "BSD-3-Clause",
  main: "index.js",
  types: "index.d.ts",
  repository: {
    type: "git",
    url: "git://github.com/feross/ieee754.git"
  },
  scripts: {
    test: "standard && npm run test-node && npm run test-browser",
    "test-browser": "airtap -- test/*.js",
    "test-browser-local": "airtap --local -- test/*.js",
    "test-node": "tape test/*.js"
  },
  funding: [
    {
      type: "github",
      url: "https://github.com/sponsors/feross"
    },
    {
      type: "patreon",
      url: "https://www.patreon.com/feross"
    },
    {
      type: "consulting",
      url: "https://feross.org/support"
    }
  ]
};

// node_modules/ipaddr.js/package.json
var package_default151 = {
  name: "ipaddr.js",
  description: "A library for manipulating IPv4 and IPv6 addresses in JavaScript.",
  type: "commonjs",
  version: "2.5.0",
  author: "whitequark <whitequark@whitequark.org>",
  directories: {
    lib: "./lib"
  },
  devDependencies: {
    "@eslint/js": "^10.0.1",
    eslint: "^10.3.0",
    globals: "^17.6.0"
  },
  scripts: {
    lint: "npx eslint lib",
    lintfix: "npx eslint --fix lib test",
    test: "node --test",
    "test:coverage": "node --test --experimental-test-coverage"
  },
  files: [
    "lib"
  ],
  keywords: [
    "ip",
    "ipv4",
    "ipv6"
  ],
  repository: {
    type: "git",
    url: "git+https://github.com/whitequark/ipaddr.js.git"
  },
  main: "./lib/ipaddr.js",
  engines: {
    node: ">= 10"
  },
  license: "MIT",
  types: "./lib/ipaddr.d.ts"
};

// node_modules/is-fullwidth-code-point/package.json
var package_default152 = {
  name: "is-fullwidth-code-point",
  version: "3.0.0",
  description: "Check if the character represented by a given Unicode code point is fullwidth",
  license: "MIT",
  repository: "sindresorhus/is-fullwidth-code-point",
  author: {
    name: "Sindre Sorhus",
    email: "sindresorhus@gmail.com",
    url: "sindresorhus.com"
  },
  engines: {
    node: ">=8"
  },
  scripts: {
    test: "xo && ava && tsd-check"
  },
  files: [
    "index.js",
    "index.d.ts"
  ],
  keywords: [
    "fullwidth",
    "full-width",
    "full",
    "width",
    "unicode",
    "character",
    "string",
    "codepoint",
    "code",
    "point",
    "is",
    "detect",
    "check"
  ],
  devDependencies: {
    ava: "^1.3.1",
    "tsd-check": "^0.5.0",
    xo: "^0.24.0"
  }
};

// node_modules/iso-datestring-validator/package.json
var package_default153 = {
  devDependencies: {
    "@types/jest": "^24.0.15",
    glob: "^7.1.6",
    jest: "^24.8.0",
    moment: "^2.24.0",
    "ts-jest": "^24.0.2",
    "ts-loader": "^9.2.5",
    tslint: "^5.20.1",
    typescript: "^3.7.4",
    webpack: "^5.51.1",
    "webpack-cli": "^4.8.0"
  },
  jest: {
    verbose: true
  },
  scripts: {
    build: "webpack",
    lint: "tslint -p tsconfig.json -c tslint.json",
    test: "jest --verbose",
    "test:year-month": "jest --t 'isValidYearMonth'",
    "test:date": "jest --t 'isValidDate'",
    "test:time": "jest --t 'isValidTime'",
    "test:zones": "jest --t 'isValidZoneOffset'",
    "test:iso": "jest --t 'isValidISODateString'"
  },
  name: "iso-datestring-validator",
  author: {
    name: "Volodymyr Yepishev",
    email: "i.m.bwca@gmail.com"
  },
  license: "MIT",
  version: "2.2.2",
  keywords: [
    "date",
    "iso8601",
    "regex",
    "regular expression",
    "vanilla js",
    "validation",
    "validator"
  ],
  main: "./dist/index.js",
  files: [
    "dist/**"
  ],
  description: "The goal of the package is to provide lightweight tools for validating strings denotings dates and time. It includes ISO 8601 datestring validation, simple YYYY-MM-DD date validation and time validation in hh:mm:ss.fff format. See details in readme.",
  repository: {
    type: "git",
    url: "https://github.com/Bwca/iso-datestring-validator.git"
  }
};

// node_modules/jose/package.json
var package_default154 = {
  name: "jose",
  version: "5.10.0",
  description: "JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes",
  keywords: [
    "browser",
    "bun",
    "cloudflare",
    "compact",
    "decode",
    "decrypt",
    "deno",
    "detached",
    "ec",
    "ecdsa",
    "eddsa",
    "edge",
    "electron",
    "embedded",
    "encrypt",
    "flattened",
    "general",
    "jose",
    "json web token",
    "jsonwebtoken",
    "jwa",
    "jwe",
    "jwk",
    "jwks",
    "jws",
    "jwt",
    "jwt-decode",
    "netlify",
    "next",
    "nextjs",
    "oct",
    "okp",
    "payload",
    "pem",
    "pkcs8",
    "rsa",
    "secp256k1",
    "sign",
    "signature",
    "spki",
    "validate",
    "vercel",
    "verify",
    "webcrypto",
    "workerd",
    "workers",
    "x509"
  ],
  homepage: "https://github.com/panva/jose",
  repository: "panva/jose",
  funding: {
    url: "https://github.com/sponsors/panva"
  },
  license: "MIT",
  author: "Filip Skokan <panva.ip@gmail.com>",
  sideEffects: false,
  exports: {
    ".": {
      types: "./dist/types/index.d.ts",
      bun: "./dist/browser/index.js",
      deno: "./dist/browser/index.js",
      browser: "./dist/browser/index.js",
      worker: "./dist/browser/index.js",
      workerd: "./dist/browser/index.js",
      import: "./dist/node/esm/index.js",
      require: "./dist/node/cjs/index.js"
    },
    "./jwk/embedded": {
      types: "./dist/types/jwk/embedded.d.ts",
      bun: "./dist/browser/jwk/embedded.js",
      deno: "./dist/browser/jwk/embedded.js",
      browser: "./dist/browser/jwk/embedded.js",
      worker: "./dist/browser/jwk/embedded.js",
      workerd: "./dist/browser/jwk/embedded.js",
      import: "./dist/node/esm/jwk/embedded.js",
      require: "./dist/node/cjs/jwk/embedded.js"
    },
    "./jwk/thumbprint": {
      types: "./dist/types/jwk/thumbprint.d.ts",
      bun: "./dist/browser/jwk/thumbprint.js",
      deno: "./dist/browser/jwk/thumbprint.js",
      browser: "./dist/browser/jwk/thumbprint.js",
      worker: "./dist/browser/jwk/thumbprint.js",
      workerd: "./dist/browser/jwk/thumbprint.js",
      import: "./dist/node/esm/jwk/thumbprint.js",
      require: "./dist/node/cjs/jwk/thumbprint.js"
    },
    "./key/import": {
      types: "./dist/types/key/import.d.ts",
      bun: "./dist/browser/key/import.js",
      deno: "./dist/browser/key/import.js",
      browser: "./dist/browser/key/import.js",
      worker: "./dist/browser/key/import.js",
      workerd: "./dist/browser/key/import.js",
      import: "./dist/node/esm/key/import.js",
      require: "./dist/node/cjs/key/import.js"
    },
    "./key/export": {
      types: "./dist/types/key/export.d.ts",
      bun: "./dist/browser/key/export.js",
      deno: "./dist/browser/key/export.js",
      browser: "./dist/browser/key/export.js",
      worker: "./dist/browser/key/export.js",
      workerd: "./dist/browser/key/export.js",
      import: "./dist/node/esm/key/export.js",
      require: "./dist/node/cjs/key/export.js"
    },
    "./key/generate/keypair": {
      types: "./dist/types/key/generate_key_pair.d.ts",
      bun: "./dist/browser/key/generate_key_pair.js",
      deno: "./dist/browser/key/generate_key_pair.js",
      browser: "./dist/browser/key/generate_key_pair.js",
      worker: "./dist/browser/key/generate_key_pair.js",
      workerd: "./dist/browser/key/generate_key_pair.js",
      import: "./dist/node/esm/key/generate_key_pair.js",
      require: "./dist/node/cjs/key/generate_key_pair.js"
    },
    "./key/generate/secret": {
      types: "./dist/types/key/generate_secret.d.ts",
      bun: "./dist/browser/key/generate_secret.js",
      deno: "./dist/browser/key/generate_secret.js",
      browser: "./dist/browser/key/generate_secret.js",
      worker: "./dist/browser/key/generate_secret.js",
      workerd: "./dist/browser/key/generate_secret.js",
      import: "./dist/node/esm/key/generate_secret.js",
      require: "./dist/node/cjs/key/generate_secret.js"
    },
    "./jwks/remote": {
      types: "./dist/types/jwks/remote.d.ts",
      bun: "./dist/browser/jwks/remote.js",
      deno: "./dist/browser/jwks/remote.js",
      browser: "./dist/browser/jwks/remote.js",
      worker: "./dist/browser/jwks/remote.js",
      workerd: "./dist/browser/jwks/remote.js",
      import: "./dist/node/esm/jwks/remote.js",
      require: "./dist/node/cjs/jwks/remote.js"
    },
    "./jwks/local": {
      types: "./dist/types/jwks/local.d.ts",
      bun: "./dist/browser/jwks/local.js",
      deno: "./dist/browser/jwks/local.js",
      browser: "./dist/browser/jwks/local.js",
      worker: "./dist/browser/jwks/local.js",
      workerd: "./dist/browser/jwks/local.js",
      import: "./dist/node/esm/jwks/local.js",
      require: "./dist/node/cjs/jwks/local.js"
    },
    "./jwt/sign": {
      types: "./dist/types/jwt/sign.d.ts",
      bun: "./dist/browser/jwt/sign.js",
      deno: "./dist/browser/jwt/sign.js",
      browser: "./dist/browser/jwt/sign.js",
      worker: "./dist/browser/jwt/sign.js",
      workerd: "./dist/browser/jwt/sign.js",
      import: "./dist/node/esm/jwt/sign.js",
      require: "./dist/node/cjs/jwt/sign.js"
    },
    "./jwt/verify": {
      types: "./dist/types/jwt/verify.d.ts",
      bun: "./dist/browser/jwt/verify.js",
      deno: "./dist/browser/jwt/verify.js",
      browser: "./dist/browser/jwt/verify.js",
      worker: "./dist/browser/jwt/verify.js",
      workerd: "./dist/browser/jwt/verify.js",
      import: "./dist/node/esm/jwt/verify.js",
      require: "./dist/node/cjs/jwt/verify.js"
    },
    "./jwt/encrypt": {
      types: "./dist/types/jwt/encrypt.d.ts",
      bun: "./dist/browser/jwt/encrypt.js",
      deno: "./dist/browser/jwt/encrypt.js",
      browser: "./dist/browser/jwt/encrypt.js",
      worker: "./dist/browser/jwt/encrypt.js",
      workerd: "./dist/browser/jwt/encrypt.js",
      import: "./dist/node/esm/jwt/encrypt.js",
      require: "./dist/node/cjs/jwt/encrypt.js"
    },
    "./jwt/decrypt": {
      types: "./dist/types/jwt/decrypt.d.ts",
      bun: "./dist/browser/jwt/decrypt.js",
      deno: "./dist/browser/jwt/decrypt.js",
      browser: "./dist/browser/jwt/decrypt.js",
      worker: "./dist/browser/jwt/decrypt.js",
      workerd: "./dist/browser/jwt/decrypt.js",
      import: "./dist/node/esm/jwt/decrypt.js",
      require: "./dist/node/cjs/jwt/decrypt.js"
    },
    "./jwt/unsecured": {
      types: "./dist/types/jwt/unsecured.d.ts",
      bun: "./dist/browser/jwt/unsecured.js",
      deno: "./dist/browser/jwt/unsecured.js",
      browser: "./dist/browser/jwt/unsecured.js",
      worker: "./dist/browser/jwt/unsecured.js",
      workerd: "./dist/browser/jwt/unsecured.js",
      import: "./dist/node/esm/jwt/unsecured.js",
      require: "./dist/node/cjs/jwt/unsecured.js"
    },
    "./jwt/decode": {
      types: "./dist/types/util/decode_jwt.d.ts",
      bun: "./dist/browser/util/decode_jwt.js",
      deno: "./dist/browser/util/decode_jwt.js",
      browser: "./dist/browser/util/decode_jwt.js",
      worker: "./dist/browser/util/decode_jwt.js",
      workerd: "./dist/browser/util/decode_jwt.js",
      import: "./dist/node/esm/util/decode_jwt.js",
      require: "./dist/node/cjs/util/decode_jwt.js"
    },
    "./decode/protected_header": {
      types: "./dist/types/util/decode_protected_header.d.ts",
      bun: "./dist/browser/util/decode_protected_header.js",
      deno: "./dist/browser/util/decode_protected_header.js",
      browser: "./dist/browser/util/decode_protected_header.js",
      worker: "./dist/browser/util/decode_protected_header.js",
      workerd: "./dist/browser/util/decode_protected_header.js",
      import: "./dist/node/esm/util/decode_protected_header.js",
      require: "./dist/node/cjs/util/decode_protected_header.js"
    },
    "./jws/compact/sign": {
      types: "./dist/types/jws/compact/sign.d.ts",
      bun: "./dist/browser/jws/compact/sign.js",
      deno: "./dist/browser/jws/compact/sign.js",
      browser: "./dist/browser/jws/compact/sign.js",
      worker: "./dist/browser/jws/compact/sign.js",
      workerd: "./dist/browser/jws/compact/sign.js",
      import: "./dist/node/esm/jws/compact/sign.js",
      require: "./dist/node/cjs/jws/compact/sign.js"
    },
    "./jws/compact/verify": {
      types: "./dist/types/jws/compact/verify.d.ts",
      bun: "./dist/browser/jws/compact/verify.js",
      deno: "./dist/browser/jws/compact/verify.js",
      browser: "./dist/browser/jws/compact/verify.js",
      worker: "./dist/browser/jws/compact/verify.js",
      workerd: "./dist/browser/jws/compact/verify.js",
      import: "./dist/node/esm/jws/compact/verify.js",
      require: "./dist/node/cjs/jws/compact/verify.js"
    },
    "./jws/flattened/sign": {
      types: "./dist/types/jws/flattened/sign.d.ts",
      bun: "./dist/browser/jws/flattened/sign.js",
      deno: "./dist/browser/jws/flattened/sign.js",
      browser: "./dist/browser/jws/flattened/sign.js",
      worker: "./dist/browser/jws/flattened/sign.js",
      workerd: "./dist/browser/jws/flattened/sign.js",
      import: "./dist/node/esm/jws/flattened/sign.js",
      require: "./dist/node/cjs/jws/flattened/sign.js"
    },
    "./jws/flattened/verify": {
      types: "./dist/types/jws/flattened/verify.d.ts",
      bun: "./dist/browser/jws/flattened/verify.js",
      deno: "./dist/browser/jws/flattened/verify.js",
      browser: "./dist/browser/jws/flattened/verify.js",
      worker: "./dist/browser/jws/flattened/verify.js",
      workerd: "./dist/browser/jws/flattened/verify.js",
      import: "./dist/node/esm/jws/flattened/verify.js",
      require: "./dist/node/cjs/jws/flattened/verify.js"
    },
    "./jws/general/sign": {
      types: "./dist/types/jws/general/sign.d.ts",
      bun: "./dist/browser/jws/general/sign.js",
      deno: "./dist/browser/jws/general/sign.js",
      browser: "./dist/browser/jws/general/sign.js",
      worker: "./dist/browser/jws/general/sign.js",
      workerd: "./dist/browser/jws/general/sign.js",
      import: "./dist/node/esm/jws/general/sign.js",
      require: "./dist/node/cjs/jws/general/sign.js"
    },
    "./jws/general/verify": {
      types: "./dist/types/jws/general/verify.d.ts",
      bun: "./dist/browser/jws/general/verify.js",
      deno: "./dist/browser/jws/general/verify.js",
      browser: "./dist/browser/jws/general/verify.js",
      worker: "./dist/browser/jws/general/verify.js",
      workerd: "./dist/browser/jws/general/verify.js",
      import: "./dist/node/esm/jws/general/verify.js",
      require: "./dist/node/cjs/jws/general/verify.js"
    },
    "./jwe/compact/encrypt": {
      types: "./dist/types/jwe/compact/encrypt.d.ts",
      bun: "./dist/browser/jwe/compact/encrypt.js",
      deno: "./dist/browser/jwe/compact/encrypt.js",
      browser: "./dist/browser/jwe/compact/encrypt.js",
      worker: "./dist/browser/jwe/compact/encrypt.js",
      workerd: "./dist/browser/jwe/compact/encrypt.js",
      import: "./dist/node/esm/jwe/compact/encrypt.js",
      require: "./dist/node/cjs/jwe/compact/encrypt.js"
    },
    "./jwe/compact/decrypt": {
      types: "./dist/types/jwe/compact/decrypt.d.ts",
      bun: "./dist/browser/jwe/compact/decrypt.js",
      deno: "./dist/browser/jwe/compact/decrypt.js",
      browser: "./dist/browser/jwe/compact/decrypt.js",
      worker: "./dist/browser/jwe/compact/decrypt.js",
      workerd: "./dist/browser/jwe/compact/decrypt.js",
      import: "./dist/node/esm/jwe/compact/decrypt.js",
      require: "./dist/node/cjs/jwe/compact/decrypt.js"
    },
    "./jwe/flattened/encrypt": {
      types: "./dist/types/jwe/flattened/encrypt.d.ts",
      bun: "./dist/browser/jwe/flattened/encrypt.js",
      deno: "./dist/browser/jwe/flattened/encrypt.js",
      browser: "./dist/browser/jwe/flattened/encrypt.js",
      worker: "./dist/browser/jwe/flattened/encrypt.js",
      workerd: "./dist/browser/jwe/flattened/encrypt.js",
      import: "./dist/node/esm/jwe/flattened/encrypt.js",
      require: "./dist/node/cjs/jwe/flattened/encrypt.js"
    },
    "./jwe/flattened/decrypt": {
      types: "./dist/types/jwe/flattened/decrypt.d.ts",
      bun: "./dist/browser/jwe/flattened/decrypt.js",
      deno: "./dist/browser/jwe/flattened/decrypt.js",
      browser: "./dist/browser/jwe/flattened/decrypt.js",
      worker: "./dist/browser/jwe/flattened/decrypt.js",
      workerd: "./dist/browser/jwe/flattened/decrypt.js",
      import: "./dist/node/esm/jwe/flattened/decrypt.js",
      require: "./dist/node/cjs/jwe/flattened/decrypt.js"
    },
    "./jwe/general/encrypt": {
      types: "./dist/types/jwe/general/encrypt.d.ts",
      bun: "./dist/browser/jwe/general/encrypt.js",
      deno: "./dist/browser/jwe/general/encrypt.js",
      browser: "./dist/browser/jwe/general/encrypt.js",
      worker: "./dist/browser/jwe/general/encrypt.js",
      workerd: "./dist/browser/jwe/general/encrypt.js",
      import: "./dist/node/esm/jwe/general/encrypt.js",
      require: "./dist/node/cjs/jwe/general/encrypt.js"
    },
    "./jwe/general/decrypt": {
      types: "./dist/types/jwe/general/decrypt.d.ts",
      bun: "./dist/browser/jwe/general/decrypt.js",
      deno: "./dist/browser/jwe/general/decrypt.js",
      browser: "./dist/browser/jwe/general/decrypt.js",
      worker: "./dist/browser/jwe/general/decrypt.js",
      workerd: "./dist/browser/jwe/general/decrypt.js",
      import: "./dist/node/esm/jwe/general/decrypt.js",
      require: "./dist/node/cjs/jwe/general/decrypt.js"
    },
    "./errors": {
      types: "./dist/types/util/errors.d.ts",
      bun: "./dist/browser/util/errors.js",
      deno: "./dist/browser/util/errors.js",
      browser: "./dist/browser/util/errors.js",
      worker: "./dist/browser/util/errors.js",
      workerd: "./dist/browser/util/errors.js",
      import: "./dist/node/esm/util/errors.js",
      require: "./dist/node/cjs/util/errors.js"
    },
    "./base64url": {
      types: "./dist/types/util/base64url.d.ts",
      bun: "./dist/browser/util/base64url.js",
      deno: "./dist/browser/util/base64url.js",
      browser: "./dist/browser/util/base64url.js",
      worker: "./dist/browser/util/base64url.js",
      workerd: "./dist/browser/util/base64url.js",
      import: "./dist/node/esm/util/base64url.js",
      require: "./dist/node/cjs/util/base64url.js"
    },
    "./package.json": "./package.json"
  },
  main: "./dist/node/cjs/index.js",
  browser: "./dist/browser/index.js",
  types: "./dist/types/index.d.ts",
  files: [
    "dist/**/package.json",
    "dist/**/*.js",
    "dist/types/**/*.d.ts",
    "!dist/**/*.bundle.js",
    "!dist/**/*.umd.js",
    "!dist/**/*.min.js",
    "!dist/node/webcrypto/**/*",
    "!dist/types/runtime/*",
    "!dist/types/lib/*",
    "!dist/deno/**/*"
  ],
  deno: "./dist/browser/index.js"
};

// node_modules/jsonata/package.json
var package_default155 = {
  name: "jsonata",
  version: "2.2.2",
  description: "JSON query and transformation language",
  module: "jsonata.js",
  main: "jsonata.js",
  typings: "jsonata.d.ts",
  homepage: "http://jsonata.org/",
  repository: {
    type: "git",
    url: "https://github.com/jsonata-js/jsonata.git"
  },
  scripts: {
    pretest: "npm run lint",
    mocha: 'nyc ./node_modules/mocha/bin/_mocha -- "test/**/*.js"',
    test: "npm run mocha",
    posttest: "npm run check-coverage && npm run browserify && npm run minify && npm run build-es5",
    "build-es5": "npm run mkdir-dist && npm run regenerator && npm run browserify-es5 && npm run minify-es5",
    "check-coverage": "nyc check-coverage --statements 100 --branches 100 --functions 100 --lines 100",
    browserify: "browserify src/jsonata.js --outfile jsonata.js --standalone jsonata",
    "mkdir-dist": "mkdirp ./dist",
    regenerator: "babel src --out-dir dist --presets=@babel/env",
    "browserify-es5": "regenerator --include-runtime polyfill.js > jsonata-es5.js; browserify dist/jsonata.js --standalone jsonata >> jsonata-es5.js",
    prepublishOnly: "npm run browserify && npm run minify && npm run build-es5",
    lint: "eslint src",
    doc: "jsdoc --configure jsdoc.json .",
    cover: "nyc _mocha",
    minify: "uglifyjs jsonata.js -o jsonata.min.js --compress --mangle",
    "minify-es5": "uglifyjs jsonata-es5.js -o jsonata-es5.min.js --compress --mangle"
  },
  license: "MIT",
  keywords: [
    "JSON",
    "query",
    "transformation",
    "transform",
    "mapping",
    "path"
  ],
  devDependencies: {
    "@babel/cli": "^7.8.4",
    "@babel/core": "^7.8.4",
    "@babel/preset-env": "^7.8.4",
    browserify: "^16.5.0",
    chai: "^4.2.0",
    "chai-as-promised": "^7.1.1",
    eslint: "8.0.0",
    "eslint-plugin-ideal": "^0.1.3",
    "eslint-plugin-promise": "^6.0.0",
    jsdoc: "^3.6.3",
    mkdirp: "^1.0.3",
    mocha: "^7.0.1",
    "mocha-lcov-reporter": "^1.3.0",
    nyc: "^15.1.0",
    regenerator: "^0.14.4",
    request: "^2.88.2",
    "uglify-es": "^3.3.10"
  },
  engines: {
    node: ">= 8"
  }
};

// node_modules/jsonc-parser/package.json
var package_default156 = {
  name: "jsonc-parser",
  version: "3.3.1",
  description: "Scanner and parser for JSON with comments.",
  main: "./lib/umd/main.js",
  typings: "./lib/umd/main.d.ts",
  module: "./lib/esm/main.js",
  author: "Microsoft Corporation",
  repository: {
    type: "git",
    url: "https://github.com/microsoft/node-jsonc-parser"
  },
  license: "MIT",
  bugs: {
    url: "https://github.com/microsoft/node-jsonc-parser/issues"
  },
  devDependencies: {
    "@types/mocha": "^10.0.7",
    "@types/node": "^18.x",
    "@typescript-eslint/eslint-plugin": "^7.13.1",
    "@typescript-eslint/parser": "^7.13.1",
    eslint: "^8.57.0",
    mocha: "^10.4.0",
    rimraf: "^5.0.7",
    typescript: "^5.4.2"
  },
  scripts: {
    prepack: "npm run clean && npm run compile-esm && npm run test && npm run remove-sourcemap-refs",
    compile: "tsc -p ./src && npm run lint",
    "compile-esm": "tsc -p ./src/tsconfig.esm.json",
    "remove-sourcemap-refs": "node ./build/remove-sourcemap-refs.js",
    clean: "rimraf lib",
    watch: "tsc -w -p ./src",
    test: "npm run compile && mocha ./lib/umd/test",
    lint: "eslint src/**/*.ts"
  }
};

// node_modules/lru-cache/package.json
var package_default157 = {
  name: "lru-cache",
  publishConfig: {
    tag: "legacy-v10"
  },
  description: "A cache object that deletes the least-recently-used items.",
  version: "10.4.3",
  author: "Isaac Z. Schlueter <i@izs.me>",
  keywords: [
    "mru",
    "lru",
    "cache"
  ],
  sideEffects: false,
  scripts: {
    build: "npm run prepare",
    prepare: "tshy && bash fixup.sh",
    pretest: "npm run prepare",
    presnap: "npm run prepare",
    test: "tap",
    snap: "tap",
    preversion: "npm test",
    postversion: "npm publish",
    prepublishOnly: "git push origin --follow-tags",
    format: "prettier --write .",
    typedoc: "typedoc --tsconfig ./.tshy/esm.json ./src/*.ts",
    "benchmark-results-typedoc": "bash scripts/benchmark-results-typedoc.sh",
    prebenchmark: "npm run prepare",
    benchmark: "make -C benchmark",
    preprofile: "npm run prepare",
    profile: "make -C benchmark profile"
  },
  main: "./dist/commonjs/index.js",
  types: "./dist/commonjs/index.d.ts",
  tshy: {
    exports: {
      ".": "./src/index.ts",
      "./min": {
        import: {
          types: "./dist/esm/index.d.ts",
          default: "./dist/esm/index.min.js"
        },
        require: {
          types: "./dist/commonjs/index.d.ts",
          default: "./dist/commonjs/index.min.js"
        }
      }
    }
  },
  repository: {
    type: "git",
    url: "git://github.com/isaacs/node-lru-cache.git"
  },
  devDependencies: {
    "@types/node": "^20.2.5",
    "@types/tap": "^15.0.6",
    benchmark: "^2.1.4",
    esbuild: "^0.17.11",
    "eslint-config-prettier": "^8.5.0",
    marked: "^4.2.12",
    mkdirp: "^2.1.5",
    prettier: "^2.6.2",
    tap: "^20.0.3",
    tshy: "^2.0.0",
    tslib: "^2.4.0",
    typedoc: "^0.25.3",
    typescript: "^5.2.2"
  },
  license: "ISC",
  files: [
    "dist"
  ],
  prettier: {
    semi: false,
    printWidth: 70,
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    jsxSingleQuote: false,
    bracketSameLine: true,
    arrowParens: "avoid",
    endOfLine: "lf"
  },
  tap: {
    "node-arg": [
      "--expose-gc"
    ],
    plugin: [
      "@tapjs/clock"
    ]
  },
  exports: {
    ".": {
      import: {
        types: "./dist/esm/index.d.ts",
        default: "./dist/esm/index.js"
      },
      require: {
        types: "./dist/commonjs/index.d.ts",
        default: "./dist/commonjs/index.js"
      }
    },
    "./min": {
      import: {
        types: "./dist/esm/index.d.ts",
        default: "./dist/esm/index.min.js"
      },
      require: {
        types: "./dist/commonjs/index.d.ts",
        default: "./dist/commonjs/index.min.js"
      }
    }
  },
  type: "module",
  module: "./dist/esm/index.js"
};

// node_modules/minimatch/package.json
var package_default158 = {
  author: "Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me)",
  name: "minimatch",
  description: "a glob matcher in javascript",
  version: "10.2.6",
  repository: {
    type: "git",
    url: "git@github.com:isaacs/minimatch"
  },
  main: "./dist/commonjs/index.js",
  types: "./dist/commonjs/index.d.ts",
  exports: {
    "./package.json": "./package.json",
    ".": {
      import: {
        types: "./dist/esm/index.d.ts",
        default: "./dist/esm/index.js"
      },
      require: {
        types: "./dist/commonjs/index.d.ts",
        default: "./dist/commonjs/index.js"
      }
    }
  },
  files: [
    "dist"
  ],
  scripts: {
    preversion: "npm test",
    postversion: "npm publish",
    prepublishOnly: "git push origin --follow-tags",
    prepare: "tshy",
    pretest: "npm run prepare",
    presnap: "npm run prepare",
    test: "tap",
    snap: "tap",
    format: "prettier --write .",
    benchmark: "node benchmark/index.js",
    typedoc: "typedoc --tsconfig .tshy/esm.json ./src/*.ts",
    lint: "oxlint --fix src test",
    postsnap: "npm run lint",
    postlint: "npm run format"
  },
  engines: {
    node: "18 || 20 || >=22"
  },
  devDependencies: {
    "@types/node": "^26.1.2",
    mkdirp: "^3.0.1",
    oxlint: "^1.76.0",
    "oxlint-tsgolint": "^7.0.2001",
    prettier: "^3.9.6",
    tap: "^21.7.5",
    tshy: "^4.1.3",
    typedoc: "^0.28.20"
  },
  funding: {
    url: "https://github.com/sponsors/isaacs"
  },
  license: "BlueOak-1.0.0",
  tshy: {
    exports: {
      "./package.json": "./package.json",
      ".": "./src/index.ts"
    },
    selfLink: false
  },
  type: "module",
  module: "./dist/esm/index.js",
  dependencies: {
    "brace-expansion": "^5.0.8"
  }
};

// node_modules/multiformats/package.json
var package_default159 = {
  name: "multiformats",
  version: "9.9.0",
  description: "Interface for multihash, multicodec, multibase and CID",
  main: "./cjs/src/index.js",
  types: "./types/src/index.d.ts",
  scripts: {
    build: "npm run build:js && npm run build:types",
    "build:js": "ipjs build --tests --main && npm run build:copy",
    "build:copy": "cp -a tsconfig.json src vendor test dist/ && rm -rf dist/test/ts-use",
    "build:types": "npm run build:copy && cd dist && tsc --build",
    "build:vendor": "npm run build:vendor:varint && npm run build:vendor:base-x",
    "build:vendor:varint": "npm_config_yes=true npx brrp -x varint > vendor/varint.js",
    "build:vendor:base-x": "npm_config_yes=true npx brrp -x @multiformats/base-x > vendor/base-x.js",
    lint: "standard",
    "test:cjs": "npm run build:js && mocha dist/cjs/node-test/test-*.js && npm run test:cjs:browser",
    "test:esm": "npm run build:js && mocha dist/esm/node-test/test-*.js && npm run test:esm:browser",
    "test:node": "c8 --check-coverage --branches 100 --functions 100 --lines 100 mocha test/test-*.js",
    "test:cjs:browser": "polendina --page --worker --serviceworker --cleanup dist/cjs/browser-test/test-*.js",
    "test:esm:browser": "polendina --page --worker --serviceworker --cleanup dist/esm/browser-test/test-*.js",
    "test:ts": "npm run build:types && npm run test --prefix test/ts-use",
    test: "npm run lint && npm run test:node && npm run test:esm && npm run test:ts",
    "test:ci": "npm run lint && npm run test:node && npm run test:esm && npm run test:cjs && npm run test:ts",
    coverage: "c8 --reporter=html mocha test/test-*.js && npm_config_yes=true npx st -d coverage -p 8080"
  },
  c8: {
    exclude: [
      "test/**",
      "vendor/**"
    ]
  },
  keywords: [
    "ipfs",
    "ipld",
    "multiformats"
  ],
  author: "Mikeal Rogers <mikeal.rogers@gmail.com> (https://www.mikealrogers.com/)",
  license: "(Apache-2.0 AND MIT)",
  exports: {
    ".": {
      browser: "./esm/src/index.js",
      require: "./cjs/src/index.js",
      import: "./esm/src/index.js"
    },
    "./cid": {
      browser: "./esm/src/cid.js",
      require: "./cjs/src/cid.js",
      import: "./esm/src/cid.js"
    },
    "./basics": {
      browser: "./esm/src/basics.js",
      require: "./cjs/src/basics.js",
      import: "./esm/src/basics.js"
    },
    "./block": {
      browser: "./esm/src/block.js",
      require: "./cjs/src/block.js",
      import: "./esm/src/block.js"
    },
    "./traversal": {
      browser: "./esm/src/traversal.js",
      require: "./cjs/src/traversal.js",
      import: "./esm/src/traversal.js"
    },
    "./bases/identity": {
      browser: "./esm/src/bases/identity.js",
      require: "./cjs/src/bases/identity.js",
      import: "./esm/src/bases/identity.js"
    },
    "./bases/base2": {
      browser: "./esm/src/bases/base2.js",
      require: "./cjs/src/bases/base2.js",
      import: "./esm/src/bases/base2.js"
    },
    "./bases/base8": {
      browser: "./esm/src/bases/base8.js",
      require: "./cjs/src/bases/base8.js",
      import: "./esm/src/bases/base8.js"
    },
    "./bases/base10": {
      browser: "./esm/src/bases/base10.js",
      require: "./cjs/src/bases/base10.js",
      import: "./esm/src/bases/base10.js"
    },
    "./bases/base16": {
      browser: "./esm/src/bases/base16.js",
      require: "./cjs/src/bases/base16.js",
      import: "./esm/src/bases/base16.js"
    },
    "./bases/base32": {
      browser: "./esm/src/bases/base32.js",
      require: "./cjs/src/bases/base32.js",
      import: "./esm/src/bases/base32.js"
    },
    "./bases/base36": {
      browser: "./esm/src/bases/base36.js",
      require: "./cjs/src/bases/base36.js",
      import: "./esm/src/bases/base36.js"
    },
    "./bases/base58": {
      browser: "./esm/src/bases/base58.js",
      require: "./cjs/src/bases/base58.js",
      import: "./esm/src/bases/base58.js"
    },
    "./bases/base64": {
      browser: "./esm/src/bases/base64.js",
      require: "./cjs/src/bases/base64.js",
      import: "./esm/src/bases/base64.js"
    },
    "./bases/base256emoji": {
      browser: "./esm/src/bases/base256emoji.js",
      require: "./cjs/src/bases/base256emoji.js",
      import: "./esm/src/bases/base256emoji.js"
    },
    "./hashes/hasher": {
      browser: "./esm/src/hashes/hasher.js",
      require: "./cjs/src/hashes/hasher.js",
      import: "./esm/src/hashes/hasher.js"
    },
    "./hashes/digest": {
      browser: "./esm/src/hashes/digest.js",
      require: "./cjs/src/hashes/digest.js",
      import: "./esm/src/hashes/digest.js"
    },
    "./hashes/sha2": {
      browser: "./esm/src/hashes/sha2-browser.js",
      require: "./cjs/src/hashes/sha2.js",
      import: "./esm/src/hashes/sha2.js"
    },
    "./hashes/identity": {
      browser: "./esm/src/hashes/identity.js",
      require: "./cjs/src/hashes/identity.js",
      import: "./esm/src/hashes/identity.js"
    },
    "./codecs/json": {
      browser: "./esm/src/codecs/json.js",
      require: "./cjs/src/codecs/json.js",
      import: "./esm/src/codecs/json.js"
    },
    "./codecs/raw": {
      browser: "./esm/src/codecs/raw.js",
      require: "./cjs/src/codecs/raw.js",
      import: "./esm/src/codecs/raw.js"
    }
  },
  devDependencies: {
    "@ipld/dag-pb": "^2.1.14",
    "@stablelib/sha256": "^1.0.1",
    "@stablelib/sha512": "^1.0.1",
    "@types/chai": "^4.3.0",
    "@types/chai-as-promised": "^7.1.4",
    "@types/mocha": "^9.0.0",
    "@types/node": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^5.6.0",
    "@typescript-eslint/parser": "^5.6.0",
    buffer: "^6.0.3",
    c8: "^7.10.0",
    chai: "^4.3.4",
    "chai-as-promised": "^7.1.1",
    cids: "^1.1.9",
    ipjs: "^5.2.0",
    mocha: "^10.0.0",
    polendina: "^3.0.0",
    standard: "^17.0.0",
    typescript: "^4.5.4"
  },
  standard: {
    ignore: [
      "dist",
      "vendor"
    ]
  },
  directories: {
    test: "test"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/multiformats/js-multiformats.git"
  },
  bugs: {
    url: "https://github.com/multiformats/js-multiformats/issues"
  },
  homepage: "https://github.com/multiformats/js-multiformats#readme",
  typesVersions: {
    "*": {
      "*": [
        "types/src/*"
      ],
      "types/*": [
        "types/*"
      ]
    }
  },
  release: {
    branches: [
      "master"
    ],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
          releaseRules: [
            {
              breaking: true,
              release: "major"
            },
            {
              revert: true,
              release: "patch"
            },
            {
              type: "feat",
              release: "minor"
            },
            {
              type: "fix",
              release: "patch"
            },
            {
              type: "chore",
              release: "patch"
            },
            {
              type: "docs",
              release: "patch"
            },
            {
              type: "test",
              release: "patch"
            },
            {
              scope: "no-release",
              release: false
            }
          ]
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "conventionalcommits",
          presetConfig: {
            types: [
              {
                type: "feat",
                section: "Features"
              },
              {
                type: "fix",
                section: "Bug Fixes"
              },
              {
                type: "chore",
                section: "Trivial Changes"
              },
              {
                type: "docs",
                section: "Trivial Changes"
              },
              {
                type: "test",
                section: "Tests"
              }
            ]
          }
        }
      ],
      "@semantic-release/changelog",
      [
        "@semantic-release/npm",
        {
          pkgRoot: "dist"
        }
      ],
      "@semantic-release/github",
      "@semantic-release/git"
    ]
  },
  browser: {
    ".": "./cjs/src/index.js",
    "./cid": "./cjs/src/cid.js",
    "./basics": "./cjs/src/basics.js",
    "./block": "./cjs/src/block.js",
    "./traversal": "./cjs/src/traversal.js",
    "./bases/identity": "./cjs/src/bases/identity.js",
    "./bases/base2": "./cjs/src/bases/base2.js",
    "./bases/base8": "./cjs/src/bases/base8.js",
    "./bases/base10": "./cjs/src/bases/base10.js",
    "./bases/base16": "./cjs/src/bases/base16.js",
    "./bases/base32": "./cjs/src/bases/base32.js",
    "./bases/base36": "./cjs/src/bases/base36.js",
    "./bases/base58": "./cjs/src/bases/base58.js",
    "./bases/base64": "./cjs/src/bases/base64.js",
    "./bases/base256emoji": "./cjs/src/bases/base256emoji.js",
    "./hashes/hasher": "./cjs/src/hashes/hasher.js",
    "./hashes/digest": "./cjs/src/hashes/digest.js",
    "./hashes/sha2": "./cjs/src/hashes/sha2-browser.js",
    "./esm/src/hashes/sha2.js": "./esm/src/hashes/sha2-browser.js",
    "./cjs/src/hashes/sha2.js": "./cjs/src/hashes/sha2-browser.js",
    "./hashes/identity": "./cjs/src/hashes/identity.js",
    "./codecs/json": "./cjs/src/codecs/json.js",
    "./codecs/raw": "./cjs/src/codecs/raw.js"
  }
};

// node_modules/on-exit-leak-free/package.json
var package_default160 = {
  name: "on-exit-leak-free",
  version: "2.1.2",
  description: "Execute a function on exit without leaking memory, allowing all objects to be garbage collected",
  main: "index.js",
  scripts: {
    test: "standard | snazzy && tap test/*.js"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/mcollina/on-exit-or-gc.git"
  },
  keywords: [
    "weak",
    "reference",
    "finalization",
    "registry",
    "process",
    "exit",
    "garbage",
    "collector"
  ],
  author: "Matteo Collina <hello@matteocollina.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/mcollina/on-exit-or-gc/issues"
  },
  homepage: "https://github.com/mcollina/on-exit-or-gc#readme",
  devDependencies: {
    snazzy: "^9.0.0",
    standard: "^17.0.0",
    tap: "^16.0.0"
  },
  engines: {
    node: ">=14.0.0"
  }
};

// node_modules/path-browserify/package.json
var package_default161 = {
  name: "path-browserify",
  description: "the path module from node core for browsers",
  version: "1.0.1",
  author: {
    name: "James Halliday",
    email: "mail@substack.net",
    url: "http://substack.net"
  },
  bugs: "https://github.com/browserify/path-browserify/issues",
  dependencies: {},
  devDependencies: {
    tape: "^4.9.0"
  },
  homepage: "https://github.com/browserify/path-browserify",
  keywords: [
    "browser",
    "browserify",
    "path"
  ],
  license: "MIT",
  main: "index.js",
  repository: {
    type: "git",
    url: "git://github.com/browserify/path-browserify.git"
  },
  scripts: {
    test: "node test"
  }
};

// node_modules/picomatch/package.json
var package_default162 = {
  name: "picomatch",
  description: "Blazing fast and accurate glob matcher written in JavaScript, with no dependencies and full support for standard and extended Bash glob features, including braces, extglobs, POSIX brackets, and regular expressions.",
  version: "4.0.7",
  homepage: "https://github.com/micromatch/picomatch",
  author: "Jon Schlinkert (https://github.com/jonschlinkert)",
  funding: "https://github.com/sponsors/jonschlinkert",
  repository: "micromatch/picomatch",
  bugs: {
    url: "https://github.com/micromatch/picomatch/issues"
  },
  license: "MIT",
  files: [
    "index.js",
    "posix.js",
    "lib"
  ],
  sideEffects: false,
  main: "index.js",
  engines: {
    node: ">=12"
  },
  scripts: {
    lint: "eslint --cache --cache-location node_modules/.cache/.eslintcache --report-unused-disable-directives --ignore-path .gitignore .",
    mocha: "mocha --reporter dot",
    test: "npm run lint && npm run mocha",
    "test:ci": "npm run test:cover",
    "test:cover": "nyc npm run mocha"
  },
  devDependencies: {
    eslint: "^8.57.0",
    "fill-range": "^7.0.1",
    "gulp-format-md": "^2.0.0",
    mocha: "^10.4.0",
    nyc: "^15.1.0"
  },
  keywords: [
    "glob",
    "match",
    "picomatch"
  ],
  nyc: {
    reporter: [
      "html",
      "lcov",
      "text-summary",
      "cobertura"
    ]
  },
  verb: {
    toc: {
      render: true,
      method: "preWrite",
      maxdepth: 3
    },
    layout: "empty",
    tasks: [
      "readme"
    ],
    plugins: [
      "gulp-format-md"
    ],
    lint: {
      reflinks: true
    },
    related: {
      list: [
        "braces",
        "micromatch"
      ]
    },
    reflinks: [
      "braces",
      "expand-brackets",
      "extglob",
      "fill-range",
      "micromatch",
      "minimatch",
      "nanomatch",
      "picomatch"
    ]
  }
};

// node_modules/pino/package.json
var package_default163 = {
  name: "pino",
  version: "8.21.0",
  description: "super fast, all natural json logger",
  main: "pino.js",
  type: "commonjs",
  types: "pino.d.ts",
  browser: "./browser.js",
  scripts: {
    docs: "docsify serve",
    "browser-test": "airtap --local 8080 test/browser*test.js",
    lint: "eslint .",
    prepublishOnly: "tap --no-check-coverage test/internals/version.test.js",
    test: "npm run lint && npm run transpile && tap --ts && jest test/jest && npm run test-types",
    "test-ci": "npm run lint && npm run transpile && tap --ts --no-check-coverage --coverage-report=lcovonly && npm run test-types",
    "test-ci-pnpm": "pnpm run lint && npm run transpile && tap --ts --no-coverage --no-check-coverage && pnpm run test-types",
    "test-ci-yarn-pnp": "yarn run lint && npm run transpile && tap --ts --no-check-coverage --coverage-report=lcovonly",
    "test-types": "tsc && tsd && ts-node test/types/pino.ts",
    "test:smoke": "smoker smoke:pino && smoker smoke:browser && smoker smoke:file",
    "smoke:pino": "node ./pino.js",
    "smoke:browser": "node ./browser.js",
    "smoke:file": "node ./file.js",
    transpile: "node ./test/fixtures/ts/transpile.cjs",
    "cov-ui": "tap --ts --coverage-report=html",
    bench: "node benchmarks/utils/runbench all",
    "bench-basic": "node benchmarks/utils/runbench basic",
    "bench-object": "node benchmarks/utils/runbench object",
    "bench-deep-object": "node benchmarks/utils/runbench deep-object",
    "bench-multi-arg": "node benchmarks/utils/runbench multi-arg",
    "bench-longs-tring": "node benchmarks/utils/runbench long-string",
    "bench-child": "node benchmarks/utils/runbench child",
    "bench-child-child": "node benchmarks/utils/runbench child-child",
    "bench-child-creation": "node benchmarks/utils/runbench child-creation",
    "bench-formatters": "node benchmarks/utils/runbench formatters",
    "update-bench-doc": "node benchmarks/utils/generate-benchmark-doc > docs/benchmarks.md"
  },
  bin: {
    pino: "./bin.js"
  },
  precommit: "test",
  repository: {
    type: "git",
    url: "git+https://github.com/pinojs/pino.git"
  },
  keywords: [
    "fast",
    "logger",
    "stream",
    "json"
  ],
  author: "Matteo Collina <hello@matteocollina.com>",
  contributors: [
    "David Mark Clements <huperekchuno@googlemail.com>",
    "James Sumners <james.sumners@gmail.com>",
    "Thomas Watson Steen <w@tson.dk> (https://twitter.com/wa7son)"
  ],
  license: "MIT",
  bugs: {
    url: "https://github.com/pinojs/pino/issues"
  },
  homepage: "https://getpino.io",
  devDependencies: {
    "@types/flush-write-stream": "^1.0.0",
    "@types/node": "^20.2.3",
    "@types/tap": "^15.0.6",
    airtap: "4.0.4",
    benchmark: "^2.1.4",
    bole: "^5.0.5",
    bunyan: "^1.8.14",
    debug: "^4.3.4",
    "docsify-cli": "^4.4.4",
    eslint: "^8.17.0",
    "eslint-config-standard": "^17.0.0",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-n": "15.7.0",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-promise": "^6.0.0",
    execa: "^5.0.0",
    fastbench: "^1.0.1",
    "flush-write-stream": "^2.0.0",
    "import-fresh": "^3.2.1",
    jest: "^29.0.3",
    log: "^6.0.0",
    loglevel: "^1.6.7",
    "midnight-smoker": "1.1.1",
    "pino-pretty": "^10.2.1",
    "pre-commit": "^1.2.2",
    proxyquire: "^2.1.3",
    pump: "^3.0.0",
    rimraf: "^5.0.1",
    semver: "^7.3.7",
    split2: "^4.0.0",
    steed: "^1.1.3",
    "strip-ansi": "^6.0.0",
    tap: "^16.2.0",
    tape: "^5.5.3",
    through2: "^4.0.0",
    "ts-node": "^10.9.1",
    tsd: "^0.30.4",
    typescript: "^5.1.3",
    winston: "^3.7.2"
  },
  dependencies: {
    "atomic-sleep": "^1.0.0",
    "fast-redact": "^3.1.1",
    "on-exit-leak-free": "^2.1.0",
    "pino-abstract-transport": "^1.2.0",
    "pino-std-serializers": "^6.0.0",
    "process-warning": "^3.0.0",
    "quick-format-unescaped": "^4.0.3",
    "real-require": "^0.2.0",
    "safe-stable-stringify": "^2.3.1",
    "sonic-boom": "^3.7.0",
    "thread-stream": "^2.6.0"
  },
  tsd: {
    directory: "test/types"
  }
};

// node_modules/pino-abstract-transport/package.json
var package_default164 = {
  name: "pino-abstract-transport",
  version: "1.2.0",
  description: "Write Pino transports easily",
  main: "index.js",
  scripts: {
    prepare: "husky install",
    test: "standard | snazzy && tap test/*.test.js  && tsd",
    "test-ci": "standard | snazzy && tap test/*.test.js --coverage-report=lcovonly && tsd"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/pinojs/pino-abstract-transport.git"
  },
  keywords: [
    "pino",
    "transport"
  ],
  author: "Matteo Collina <hello@matteocollina.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/pinojs/pino-abstract-transport/issues"
  },
  homepage: "https://github.com/pinojs/pino-abstract-transport#readme",
  dependencies: {
    "readable-stream": "^4.0.0",
    split2: "^4.0.0"
  },
  devDependencies: {
    "@types/node": "^20.1.0",
    husky: "^9.0.6",
    snazzy: "^9.0.0",
    standard: "^17.0.0",
    tap: "^16.0.0",
    "thread-stream": "^2.4.1",
    tsd: "^0.31.0"
  },
  tsd: {
    directory: "./test/types"
  }
};

// node_modules/pino-std-serializers/package.json
var package_default165 = {
  name: "pino-std-serializers",
  version: "6.2.2",
  description: "A collection of standard object serializers for Pino",
  main: "index.js",
  type: "commonjs",
  types: "index.d.ts",
  scripts: {
    lint: "standard | snazzy",
    "lint-ci": "standard",
    test: "tap --no-cov",
    "test-ci": "tap --cov --no-check-coverage --coverage-report=text",
    "test-types": "tsc && tsd"
  },
  repository: {
    type: "git",
    url: "git+ssh://git@github.com/pinojs/pino-std-serializers.git"
  },
  keywords: [
    "pino",
    "logging"
  ],
  author: "James Sumners <james.sumners@gmail.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/pinojs/pino-std-serializers/issues"
  },
  homepage: "https://github.com/pinojs/pino-std-serializers#readme",
  precommit: [
    "lint",
    "test",
    "test-types"
  ],
  devDependencies: {
    "@types/node": "^20.1.0",
    "pre-commit": "^1.2.2",
    snazzy: "^9.0.0",
    standard: "^17.0.0",
    tap: "^15.0.10",
    tsd: "^0.28.0",
    typescript: "^5.0.2"
  },
  tsd: {
    directory: "test/types"
  }
};

// node_modules/prettier/package.json
var package_default166 = {
  name: "prettier",
  version: "3.9.9",
  description: "Prettier is an opinionated code formatter",
  bin: "./bin/prettier.cjs",
  repository: "prettier/prettier",
  funding: "https://github.com/prettier/prettier?sponsor=1",
  homepage: "https://prettier.io",
  author: "James Long",
  license: "MIT",
  main: "./index.cjs",
  browser: "./standalone.js",
  unpkg: "./standalone.js",
  exports: {
    ".": {
      types: "./index.d.ts",
      require: "./index.cjs",
      browser: {
        import: "./standalone.mjs",
        default: "./standalone.js"
      },
      default: "./index.mjs"
    },
    "./*": "./*",
    "./standalone": {
      types: "./standalone.d.ts",
      require: "./standalone.js",
      default: "./standalone.mjs"
    },
    "./doc": {
      types: "./doc.d.ts",
      require: "./doc.js",
      default: "./doc.mjs"
    },
    "./plugins/estree": {
      types: "./plugins/estree.d.ts",
      require: "./plugins/estree.js",
      default: "./plugins/estree.mjs"
    },
    "./plugins/babel": {
      types: "./plugins/babel.d.ts",
      require: "./plugins/babel.js",
      default: "./plugins/babel.mjs"
    },
    "./plugins/flow": {
      types: "./plugins/flow.d.ts",
      require: "./plugins/flow.js",
      default: "./plugins/flow.mjs"
    },
    "./plugins/typescript": {
      types: "./plugins/typescript.d.ts",
      require: "./plugins/typescript.js",
      default: "./plugins/typescript.mjs"
    },
    "./plugins/acorn": {
      types: "./plugins/acorn.d.ts",
      require: "./plugins/acorn.js",
      default: "./plugins/acorn.mjs"
    },
    "./plugins/meriyah": {
      types: "./plugins/meriyah.d.ts",
      require: "./plugins/meriyah.js",
      default: "./plugins/meriyah.mjs"
    },
    "./plugins/angular": {
      types: "./plugins/angular.d.ts",
      require: "./plugins/angular.js",
      default: "./plugins/angular.mjs"
    },
    "./plugins/postcss": {
      types: "./plugins/postcss.d.ts",
      require: "./plugins/postcss.js",
      default: "./plugins/postcss.mjs"
    },
    "./plugins/graphql": {
      types: "./plugins/graphql.d.ts",
      require: "./plugins/graphql.js",
      default: "./plugins/graphql.mjs"
    },
    "./plugins/markdown": {
      types: "./plugins/markdown.d.ts",
      require: "./plugins/markdown.js",
      default: "./plugins/markdown.mjs"
    },
    "./plugins/glimmer": {
      types: "./plugins/glimmer.d.ts",
      require: "./plugins/glimmer.js",
      default: "./plugins/glimmer.mjs"
    },
    "./plugins/html": {
      types: "./plugins/html.d.ts",
      require: "./plugins/html.js",
      default: "./plugins/html.mjs"
    },
    "./plugins/yaml": {
      types: "./plugins/yaml.d.ts",
      require: "./plugins/yaml.js",
      default: "./plugins/yaml.mjs"
    },
    "./esm/standalone.mjs": "./standalone.mjs",
    "./parser-babel": "./plugins/babel.js",
    "./parser-babel.js": "./plugins/babel.js",
    "./esm/parser-babel.mjs": "./plugins/babel.mjs",
    "./parser-flow": "./plugins/flow.js",
    "./parser-flow.js": "./plugins/flow.js",
    "./esm/parser-flow.mjs": "./plugins/flow.mjs",
    "./parser-typescript": "./plugins/typescript.js",
    "./parser-typescript.js": "./plugins/typescript.js",
    "./esm/parser-typescript.mjs": "./plugins/typescript.mjs",
    "./parser-espree": "./plugins/acorn.js",
    "./parser-espree.js": "./plugins/acorn.js",
    "./esm/parser-espree.mjs": "./plugins/acorn.mjs",
    "./parser-meriyah": "./plugins/meriyah.js",
    "./parser-meriyah.js": "./plugins/meriyah.js",
    "./esm/parser-meriyah.mjs": "./plugins/meriyah.mjs",
    "./parser-angular": "./plugins/angular.js",
    "./parser-angular.js": "./plugins/angular.js",
    "./esm/parser-angular.mjs": "./plugins/angular.mjs",
    "./parser-postcss": "./plugins/postcss.js",
    "./parser-postcss.js": "./plugins/postcss.js",
    "./esm/parser-postcss.mjs": "./plugins/postcss.mjs",
    "./parser-graphql": "./plugins/graphql.js",
    "./parser-graphql.js": "./plugins/graphql.js",
    "./esm/parser-graphql.mjs": "./plugins/graphql.mjs",
    "./parser-markdown": "./plugins/markdown.js",
    "./parser-markdown.js": "./plugins/markdown.js",
    "./esm/parser-markdown.mjs": "./plugins/markdown.mjs",
    "./parser-glimmer": "./plugins/glimmer.js",
    "./parser-glimmer.js": "./plugins/glimmer.js",
    "./esm/parser-glimmer.mjs": "./plugins/glimmer.mjs",
    "./parser-html": "./plugins/html.js",
    "./parser-html.js": "./plugins/html.js",
    "./esm/parser-html.mjs": "./plugins/html.mjs",
    "./parser-yaml": "./plugins/yaml.js",
    "./parser-yaml.js": "./plugins/yaml.js",
    "./esm/parser-yaml.mjs": "./plugins/yaml.mjs"
  },
  engines: {
    node: ">=14"
  },
  files: [
    "LICENSE",
    "README.md",
    "THIRD-PARTY-NOTICES.md",
    "bin/prettier.cjs",
    "doc.d.ts",
    "doc.js",
    "doc.mjs",
    "index.cjs",
    "index.d.ts",
    "index.d.ts",
    "index.mjs",
    "internal/experimental-cli-worker.mjs",
    "internal/experimental-cli.mjs",
    "internal/legacy-cli.mjs",
    "package.json",
    "plugins/acorn.d.ts",
    "plugins/acorn.js",
    "plugins/acorn.mjs",
    "plugins/angular.d.ts",
    "plugins/angular.js",
    "plugins/angular.mjs",
    "plugins/babel.d.ts",
    "plugins/babel.js",
    "plugins/babel.mjs",
    "plugins/estree.d.ts",
    "plugins/estree.js",
    "plugins/estree.mjs",
    "plugins/flow.d.ts",
    "plugins/flow.js",
    "plugins/flow.mjs",
    "plugins/glimmer.d.ts",
    "plugins/glimmer.js",
    "plugins/glimmer.mjs",
    "plugins/graphql.d.ts",
    "plugins/graphql.js",
    "plugins/graphql.mjs",
    "plugins/html.d.ts",
    "plugins/html.js",
    "plugins/html.mjs",
    "plugins/markdown.d.ts",
    "plugins/markdown.js",
    "plugins/markdown.mjs",
    "plugins/meriyah.d.ts",
    "plugins/meriyah.js",
    "plugins/meriyah.mjs",
    "plugins/postcss.d.ts",
    "plugins/postcss.js",
    "plugins/postcss.mjs",
    "plugins/typescript.d.ts",
    "plugins/typescript.js",
    "plugins/typescript.mjs",
    "plugins/yaml.d.ts",
    "plugins/yaml.js",
    "plugins/yaml.mjs",
    "standalone.d.ts",
    "standalone.js",
    "standalone.mjs"
  ],
  preferUnplugged: true,
  sideEffects: false,
  type: "commonjs",
  publishConfig: {
    access: "public",
    registry: "https://registry.npmjs.org/"
  }
};

// node_modules/process/package.json
var package_default167 = {
  author: "Roman Shtylman <shtylman@gmail.com>",
  name: "process",
  description: "process information for node.js and browsers",
  keywords: [
    "process"
  ],
  scripts: {
    test: "mocha test.js",
    browser: "zuul --no-coverage --ui mocha-bdd --local 8080 -- test.js"
  },
  version: "0.11.10",
  repository: {
    type: "git",
    url: "git://github.com/shtylman/node-process.git"
  },
  license: "MIT",
  browser: "./browser.js",
  main: "./index.js",
  engines: {
    node: ">= 0.6.0"
  },
  devDependencies: {
    mocha: "2.2.1",
    zuul: "^3.10.3"
  }
};

// node_modules/process-warning/package.json
var package_default168 = {
  name: "process-warning",
  version: "3.0.0",
  description: "A small utility for creating warnings and emitting them.",
  main: "index.js",
  type: "commonjs",
  types: "types/index.d.ts",
  scripts: {
    lint: "standard",
    "lint:fix": "standard --fix",
    test: "npm run test:unit && npm run test:jest && npm run test:typescript",
    "test:jest": "jest jest.test.js",
    "test:unit": "tap",
    "test:typescript": "tsd"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/fastify/process-warning.git"
  },
  keywords: [
    "fastify",
    "error",
    "warning",
    "utility",
    "plugin",
    "emit",
    "once"
  ],
  author: "Tomas Della Vedova",
  license: "MIT",
  bugs: {
    url: "https://github.com/fastify/fastify-warning/issues"
  },
  homepage: "https://github.com/fastify/fastify-warning#readme",
  devDependencies: {
    benchmark: "^2.1.4",
    jest: "^29.0.1",
    standard: "^17.0.0",
    tap: "^16.3.0",
    tsd: "^0.29.0"
  }
};

// node_modules/quick-format-unescaped/package.json
var package_default169 = {
  name: "quick-format-unescaped",
  version: "4.0.4",
  description: "Solves a problem with util.format",
  main: "index.js",
  directories: {
    test: "test"
  },
  scripts: {
    test: "nyc -- node test",
    "test:html": "nyc --reporter=html -- node test"
  },
  author: "David Mark Clements",
  devDependencies: {
    fastbench: "^1.0.1",
    nyc: "^15.0.0"
  },
  dependencies: {},
  repository: {
    type: "git",
    url: "git+https://github.com/davidmarkclements/quick-format.git"
  },
  keywords: [],
  license: "MIT",
  bugs: {
    url: "https://github.com/davidmarkclements/quick-format/issues"
  },
  homepage: "https://github.com/davidmarkclements/quick-format#readme"
};

// node_modules/readable-stream/package.json
var package_default170 = {
  name: "readable-stream",
  version: "4.7.0",
  description: "Node.js Streams, a user-land copy of the stream library from Node.js",
  homepage: "https://github.com/nodejs/readable-stream",
  license: "MIT",
  licenses: [
    {
      type: "MIT",
      url: "https://choosealicense.com/licenses/mit/"
    }
  ],
  keywords: [
    "readable",
    "stream",
    "pipe"
  ],
  repository: {
    type: "git",
    url: "git://github.com/nodejs/readable-stream"
  },
  bugs: {
    url: "https://github.com/nodejs/readable-stream/issues"
  },
  main: "lib/ours/index.js",
  files: [
    "lib",
    "LICENSE",
    "README.md"
  ],
  browser: {
    util: "./lib/ours/util.js",
    "./lib/ours/index.js": "./lib/ours/browser.js"
  },
  scripts: {
    build: "node build/build.mjs 18.19.0",
    postbuild: "prettier -w lib test",
    test: "tap --rcfile=./tap.yml test/parallel/test-*.js test/ours/test-*.js",
    "test:prepare": "node test/browser/runner-prepare.mjs",
    "test:browsers": "node test/browser/runner-browser.mjs",
    "test:bundlers": "node test/browser/runner-node.mjs",
    "test:readable-stream-only": "node readable-stream-test/runner-prepare.mjs",
    coverage: "c8 -c ./c8.json tap --rcfile=./tap.yml test/parallel/test-*.js test/ours/test-*.js",
    format: "prettier -w src lib test",
    "test:format": "prettier -c src lib test",
    lint: "eslint src"
  },
  dependencies: {
    "abort-controller": "^3.0.0",
    buffer: "^6.0.3",
    events: "^3.3.0",
    process: "^0.11.10",
    string_decoder: "^1.3.0"
  },
  devDependencies: {
    "@babel/core": "^7.17.10",
    "@babel/plugin-proposal-nullish-coalescing-operator": "^7.16.7",
    "@babel/plugin-proposal-optional-chaining": "^7.16.7",
    "@eslint/eslintrc": "^3.2.0",
    "@rollup/plugin-commonjs": "^22.0.0",
    "@rollup/plugin-inject": "^4.0.4",
    "@rollup/plugin-node-resolve": "^13.3.0",
    "@sinonjs/fake-timers": "^9.1.2",
    browserify: "^17.0.0",
    c8: "^7.11.2",
    esbuild: "^0.19.9",
    "esbuild-plugin-alias": "^0.2.1",
    eslint: "^8.15.0",
    "eslint-config-standard": "^17.0.0",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-n": "^15.2.0",
    "eslint-plugin-promise": "^6.0.0",
    playwright: "^1.21.1",
    prettier: "^2.6.2",
    rollup: "^2.72.1",
    "rollup-plugin-polyfill-node": "^0.9.0",
    tap: "^16.2.0",
    "tap-mocha-reporter": "^5.0.3",
    tape: "^5.5.3",
    tar: "^6.1.11",
    undici: "^5.1.1",
    webpack: "^5.72.1",
    "webpack-cli": "^4.9.2"
  },
  engines: {
    node: "^12.22.0 || ^14.17.0 || >=16.0.0"
  }
};

// node_modules/real-require/package.json
var package_default171 = {
  name: "real-require",
  version: "0.2.0",
  description: "Keep require and import consistent after bundling or transpiling",
  author: "Paolo Insogna <shogun@cowtech.it>",
  homepage: "https://github.com/pinojs/real-require",
  contributors: [
    {
      name: "Paolo Insogna",
      url: "https://github.com/ShogunPanda"
    }
  ],
  license: "MIT",
  repository: {
    type: "git",
    url: "git+https://github.com/pinojs/real-require.git"
  },
  bugs: {
    url: "https://github.com/pinojs/real-require/issues"
  },
  main: "src/index.js",
  files: [
    "src"
  ],
  scripts: {
    format: "prettier -w src test",
    lint: "eslint src test",
    test: "c8 --reporter=text --reporter=html tap --reporter=spec --no-coverage test/*.test.js",
    "test:watch": "tap --watch --reporter=spec --no-browser --coverage-report=text --coverage-report=html test/*.test.js",
    "test:ci": "c8 --reporter=text --reporter=json --check-coverage --branches 90 --functions 90 --lines 90 --statements 90 tap --no-color --no-coverage test/*.test.js",
    ci: "npm run lint && npm run test:ci",
    prepublishOnly: "npm run ci",
    postpublish: "git push origin && git push origin -f --tags"
  },
  devDependencies: {
    eslint: "^7.12.0",
    "eslint-config-standard": "^16.0.3",
    "eslint-plugin-import": "^2.25.2",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-promise": "^5.1.1",
    "eslint-plugin-standard": "^5.0.0",
    c8: "^7.10.0",
    prettier: "^2.4.1",
    tap: "^16.0.0"
  },
  engines: {
    node: ">= 12.13.0"
  }
};

// node_modules/require-directory/package.json
var package_default172 = {
  author: "Troy Goode <troygoode@gmail.com> (http://github.com/troygoode/)",
  name: "require-directory",
  version: "2.1.1",
  description: "Recursively iterates over specified directory, require()'ing each file, and returning a nested hash structure containing those modules.",
  keywords: [
    "require",
    "directory",
    "library",
    "recursive"
  ],
  homepage: "https://github.com/troygoode/node-require-directory/",
  main: "index.js",
  repository: {
    type: "git",
    url: "git://github.com/troygoode/node-require-directory.git"
  },
  contributors: [
    {
      name: "Troy Goode",
      email: "troygoode@gmail.com",
      web: "http://github.com/troygoode/"
    }
  ],
  license: "MIT",
  bugs: {
    url: "http://github.com/troygoode/node-require-directory/issues/"
  },
  engines: {
    node: ">=0.10.0"
  },
  devDependencies: {
    jshint: "^2.6.0",
    mocha: "^2.1.0"
  },
  scripts: {
    test: "mocha",
    lint: "jshint index.js test/test.js"
  }
};

// node_modules/safe-buffer/package.json
var package_default173 = {
  name: "safe-buffer",
  description: "Safer Node.js Buffer API",
  version: "5.2.1",
  author: {
    name: "Feross Aboukhadijeh",
    email: "feross@feross.org",
    url: "https://feross.org"
  },
  bugs: {
    url: "https://github.com/feross/safe-buffer/issues"
  },
  devDependencies: {
    standard: "*",
    tape: "^5.0.0"
  },
  homepage: "https://github.com/feross/safe-buffer",
  keywords: [
    "buffer",
    "buffer allocate",
    "node security",
    "safe",
    "safe-buffer",
    "security",
    "uninitialized"
  ],
  license: "MIT",
  main: "index.js",
  types: "index.d.ts",
  repository: {
    type: "git",
    url: "git://github.com/feross/safe-buffer.git"
  },
  scripts: {
    test: "standard && tape test/*.js"
  },
  funding: [
    {
      type: "github",
      url: "https://github.com/sponsors/feross"
    },
    {
      type: "patreon",
      url: "https://www.patreon.com/feross"
    },
    {
      type: "consulting",
      url: "https://feross.org/support"
    }
  ]
};

// node_modules/safe-stable-stringify/package.json
var package_default174 = {
  name: "safe-stable-stringify",
  version: "2.5.0",
  description: "Deterministic and safely JSON.stringify to quickly serialize JavaScript objects",
  exports: {
    require: "./index.js",
    import: "./esm/wrapper.js"
  },
  keywords: [
    "stable",
    "stringify",
    "JSON",
    "JSON.stringify",
    "safe",
    "serialize",
    "deterministic",
    "circular",
    "object",
    "predicable",
    "repeatable",
    "fast",
    "bigint"
  ],
  main: "index.js",
  scripts: {
    test: "standard && tap test.js",
    tap: "tap test.js",
    "tap:only": "tap test.js --watch --only",
    benchmark: "node benchmark.js",
    compare: "node compare.js",
    lint: "standard --fix",
    tsc: "tsc --project tsconfig.json"
  },
  engines: {
    node: ">=10"
  },
  author: "Ruben Bridgewater",
  license: "MIT",
  typings: "index.d.ts",
  devDependencies: {
    "@types/json-stable-stringify": "^1.0.34",
    "@types/node": "^18.11.18",
    benchmark: "^2.1.4",
    clone: "^2.1.2",
    "fast-json-stable-stringify": "^2.1.0",
    "fast-safe-stringify": "^2.1.1",
    "fast-stable-stringify": "^1.0.0",
    "faster-stable-stringify": "^1.0.0",
    "fastest-stable-stringify": "^2.0.2",
    "json-stable-stringify": "^1.0.1",
    "json-stringify-deterministic": "^1.0.7",
    "json-stringify-safe": "^5.0.1",
    standard: "^16.0.4",
    tap: "^15.0.9",
    typescript: "^4.8.3"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/BridgeAR/safe-stable-stringify.git"
  },
  bugs: {
    url: "https://github.com/BridgeAR/safe-stable-stringify/issues"
  },
  homepage: "https://github.com/BridgeAR/safe-stable-stringify#readme"
};

// node_modules/sonic-boom/package.json
var package_default175 = {
  name: "sonic-boom",
  version: "3.8.1",
  description: "Extremely fast utf8 only stream implementation",
  main: "index.js",
  type: "commonjs",
  types: "types/index.d.ts",
  scripts: {
    test: "npm run test:types && standard && npm run test:unit",
    "test:unit": "tap",
    "test:types": "tsc && tsd && ts-node types/tests/test.ts",
    prepare: "husky install"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/pinojs/sonic-boom.git"
  },
  keywords: [
    "stream",
    "fs",
    "net",
    "fd",
    "file",
    "descriptor",
    "fast"
  ],
  author: "Matteo Collina <hello@matteocollina.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/pinojs/sonic-boom/issues"
  },
  homepage: "https://github.com/pinojs/sonic-boom#readme",
  devDependencies: {
    "@types/node": "^20.1.0",
    fastbench: "^1.0.1",
    husky: "^9.0.6",
    proxyquire: "^2.1.3",
    standard: "^17.0.0",
    tap: "^16.2.0",
    tsd: "^0.31.0",
    typescript: "^5.0.2",
    "ts-node": "^10.8.0"
  },
  dependencies: {
    "atomic-sleep": "^1.0.0"
  },
  tsd: {
    directory: "./types"
  }
};

// node_modules/split2/package.json
var package_default176 = {
  name: "split2",
  version: "4.2.0",
  description: "split a Text Stream into a Line Stream, using Stream 3",
  main: "index.js",
  scripts: {
    lint: "standard --verbose",
    unit: "nyc --lines 100 --branches 100 --functions 100 --check-coverage --reporter=text tape test.js",
    coverage: "nyc --reporter=html --reporter=cobertura --reporter=text tape test/test.js",
    "test:report": "npm run lint && npm run unit:report",
    test: "npm run lint && npm run unit",
    legacy: "tape test.js"
  },
  "pre-commit": [
    "test"
  ],
  website: "https://github.com/mcollina/split2",
  repository: {
    type: "git",
    url: "https://github.com/mcollina/split2.git"
  },
  bugs: {
    url: "http://github.com/mcollina/split2/issues"
  },
  engines: {
    node: ">= 10.x"
  },
  author: "Matteo Collina <hello@matteocollina.com>",
  license: "ISC",
  devDependencies: {
    "binary-split": "^1.0.3",
    "callback-stream": "^1.1.0",
    fastbench: "^1.0.0",
    nyc: "^15.0.1",
    "pre-commit": "^1.1.2",
    standard: "^17.0.0",
    tape: "^5.0.0"
  }
};

// node_modules/string-width/package.json
var package_default177 = {
  name: "string-width",
  version: "4.2.3",
  description: "Get the visual width of a string - the number of columns required to display it",
  license: "MIT",
  repository: "sindresorhus/string-width",
  author: {
    name: "Sindre Sorhus",
    email: "sindresorhus@gmail.com",
    url: "sindresorhus.com"
  },
  engines: {
    node: ">=8"
  },
  scripts: {
    test: "xo && ava && tsd"
  },
  files: [
    "index.js",
    "index.d.ts"
  ],
  keywords: [
    "string",
    "character",
    "unicode",
    "width",
    "visual",
    "column",
    "columns",
    "fullwidth",
    "full-width",
    "full",
    "ansi",
    "escape",
    "codes",
    "cli",
    "command-line",
    "terminal",
    "console",
    "cjk",
    "chinese",
    "japanese",
    "korean",
    "fixed-width"
  ],
  dependencies: {
    "emoji-regex": "^8.0.0",
    "is-fullwidth-code-point": "^3.0.0",
    "strip-ansi": "^6.0.1"
  },
  devDependencies: {
    ava: "^1.4.1",
    tsd: "^0.7.1",
    xo: "^0.24.0"
  }
};

// node_modules/string_decoder/package.json
var package_default178 = {
  name: "string_decoder",
  version: "1.3.0",
  description: "The string_decoder module from Node core",
  main: "lib/string_decoder.js",
  files: [
    "lib"
  ],
  dependencies: {
    "safe-buffer": "~5.2.0"
  },
  devDependencies: {
    "babel-polyfill": "^6.23.0",
    "core-util-is": "^1.0.2",
    inherits: "^2.0.3",
    tap: "~0.4.8"
  },
  scripts: {
    test: "tap test/parallel/*.js && node test/verify-dependencies",
    ci: "tap test/parallel/*.js test/ours/*.js --tap | tee test.tap && node test/verify-dependencies.js"
  },
  repository: {
    type: "git",
    url: "git://github.com/nodejs/string_decoder.git"
  },
  homepage: "https://github.com/nodejs/string_decoder",
  keywords: [
    "string",
    "decoder",
    "browser",
    "browserify"
  ],
  license: "MIT"
};

// node_modules/strip-ansi/package.json
var package_default179 = {
  name: "strip-ansi",
  version: "6.0.1",
  description: "Strip ANSI escape codes from a string",
  license: "MIT",
  repository: "chalk/strip-ansi",
  author: {
    name: "Sindre Sorhus",
    email: "sindresorhus@gmail.com",
    url: "sindresorhus.com"
  },
  engines: {
    node: ">=8"
  },
  scripts: {
    test: "xo && ava && tsd"
  },
  files: [
    "index.js",
    "index.d.ts"
  ],
  keywords: [
    "strip",
    "trim",
    "remove",
    "ansi",
    "styles",
    "color",
    "colour",
    "colors",
    "terminal",
    "console",
    "string",
    "tty",
    "escape",
    "formatting",
    "rgb",
    "256",
    "shell",
    "xterm",
    "log",
    "logging",
    "command-line",
    "text"
  ],
  dependencies: {
    "ansi-regex": "^5.0.1"
  },
  devDependencies: {
    ava: "^2.4.0",
    tsd: "^0.10.0",
    xo: "^0.25.3"
  }
};

// node_modules/thread-stream/package.json
var package_default180 = {
  name: "thread-stream",
  version: "2.7.0",
  description: "A streaming way to send data to a Node.js Worker Thread",
  main: "index.js",
  types: "index.d.ts",
  dependencies: {
    "real-require": "^0.2.0"
  },
  devDependencies: {
    "@types/node": "^20.1.0",
    "@types/tap": "^15.0.0",
    "@yao-pkg/pkg": "^5.11.5",
    desm: "^1.3.0",
    fastbench: "^1.0.1",
    husky: "^9.0.6",
    "pino-elasticsearch": "^8.0.0",
    "sonic-boom": "^3.0.0",
    standard: "^17.0.0",
    tap: "^16.2.0",
    "ts-node": "^10.8.0",
    typescript: "^5.3.2",
    "why-is-node-running": "^2.2.2"
  },
  scripts: {
    test: 'standard && npm run transpile && tap "test/**/*.test.*js" && tap --ts test/*.test.*ts',
    "test:ci": "standard && npm run transpile && npm run test:ci:js && npm run test:ci:ts",
    "test:ci:js": 'tap --no-check-coverage --timeout=120 --coverage-report=lcovonly "test/**/*.test.*js"',
    "test:ci:ts": 'tap --ts --no-check-coverage --coverage-report=lcovonly "test/**/*.test.*ts"',
    "test:yarn": 'npm run transpile && tap "test/**/*.test.js" --no-check-coverage',
    transpile: "sh ./test/ts/transpile.sh",
    prepare: "husky install"
  },
  standard: {
    ignore: [
      "test/ts/**/*"
    ]
  },
  repository: {
    type: "git",
    url: "git+https://github.com/mcollina/thread-stream.git"
  },
  keywords: [
    "worker",
    "thread",
    "threads",
    "stream"
  ],
  author: "Matteo Collina <hello@matteocollina.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/mcollina/thread-stream/issues"
  },
  homepage: "https://github.com/mcollina/thread-stream#readme"
};

// node_modules/tinyglobby/package.json
var package_default181 = {
  name: "tinyglobby",
  version: "0.2.17",
  description: "A fast and minimal alternative to globby and fast-glob",
  type: "module",
  main: "./dist/index.cjs",
  module: "./dist/index.mjs",
  types: "./dist/index.d.cts",
  exports: {
    ".": {
      import: "./dist/index.mjs",
      require: "./dist/index.cjs"
    },
    "./package.json": "./package.json"
  },
  sideEffects: false,
  files: [
    "dist"
  ],
  author: "Superchupu",
  license: "MIT",
  keywords: [
    "glob",
    "patterns",
    "tiny",
    "fast"
  ],
  repository: {
    type: "git",
    url: "git+https://github.com/SuperchupuDev/tinyglobby.git"
  },
  bugs: {
    url: "https://github.com/SuperchupuDev/tinyglobby/issues"
  },
  homepage: "https://superchupu.dev/tinyglobby",
  funding: {
    url: "https://github.com/sponsors/SuperchupuDev"
  },
  dependencies: {
    fdir: "^6.5.0",
    picomatch: "^4.0.4"
  },
  devDependencies: {
    "@biomejs/biome": "^2.4.16",
    "@types/node": "^25.9.1",
    "@types/picomatch": "^4.0.3",
    "fast-glob": "^3.3.3",
    "fs-fixture": "^2.14.0",
    glob: "^13.0.6",
    tinybench: "^6.0.2",
    tsdown: "^0.22.1",
    typescript: "^6.0.3"
  },
  engines: {
    node: ">=12.0.0"
  },
  scripts: {
    bench: "node benchmark/bench.ts",
    "bench:setup": "node benchmark/setup.ts",
    build: "tsdown",
    check: "biome check",
    "check:fix": "biome check --write --unsafe",
    format: "biome format --write",
    lint: "biome lint",
    test: 'node --test "test/**/*.ts"',
    "test:coverage": 'node --test --experimental-test-coverage "test/**/*.ts"',
    "test:only": 'node --test --test-only "test/**/*.ts"',
    typecheck: "tsc --noEmit"
  }
};

// node_modules/ts-morph/package.json
var package_default182 = {
  name: "ts-morph",
  version: "27.0.2",
  description: "TypeScript compiler wrapper for static analysis and code manipulation.",
  main: "dist/ts-morph.js",
  types: "lib/ts-morph.d.ts",
  scripts: {
    dopublish: 'deno task type-check-docs && deno task code-generate && deno task package && deno task publish-code-verification && echo "Run: npm publish"',
    build: "deno task build:declarations && deno task build:node",
    "build:node": "rimraf dist && rollup -c ",
    "build:deno": "deno task build:declarations && rimraf dist-deno && rollup -c --environment BUILD:deno && deno run -A scripts/buildDeno.ts",
    "build:declarations": "deno run -A scripts/generation/main.ts create-declaration-file",
    test: "deno run -A npm:mocha",
    "test:debug": "deno task test --inspect-brk",
    "test:watch": "deno task test --watch-extensions ts --watch",
    "test:ci": "deno task test",
    "test:ts-versions": "deno run -A scripts/test/testTypeScriptVersions.ts",
    "type-check": "deno run -A scripts/typeCheckLibrary.ts",
    "code-generate": "deno run -A scripts/generation/main.ts",
    "output-wrapped-nodes": "deno run -A scripts/generation/outputWrappedNodesInfo.ts",
    package: "deno task build",
    "publish-code-verification": "deno task code-verification && deno task ensure-no-declaration-file-errors",
    "code-verification": "deno run -A scripts/verification/main.ts ensure-structures-match-classes ensure-overload-structures-match ensure-array-inputs-readonly ensure-classes-implement-structure-methods ensure-mixin-not-applied-multiple-times validate-public-api-class-member-names validate-compiler-node-to-wrapped-type validate-code-fences",
    "ensure-structures-match-classes": "deno run -A scripts/verification/main.ts ensure-structures-match-classes",
    "ensure-overload-structures-match": "deno run -A scripts/verification/main.ts ensure-overload-structures-match",
    "ensure-no-project-compile-errors": "deno run -A scripts/verification/ensureNoProjectCompileErrors.ts",
    "ensure-no-declaration-file-errors": "deno run -A scripts/verification/ensureNoDeclarationFileErrors.ts",
    "ensure-array-inputs-readonly": "deno run -A scripts/verification/main ensure-array-inputs-readonly.ts",
    "ensure-or-throw-exists": "deno run -A scripts/verification/main ensure-or-throw-exists.ts",
    "type-check-docs": "deno run -A scripts/typeCheckDocumentation.ts"
  },
  repository: "git+https://github.com/dsherret/ts-morph.git",
  keywords: [
    "typescript",
    "ast",
    "static analysis",
    "code generation",
    "code refactor"
  ],
  author: "David Sherret",
  license: "MIT",
  bugs: {
    url: "https://github.com/dsherret/ts-morph/issues"
  },
  homepage: "https://github.com/dsherret/ts-morph#readme",
  dependencies: {
    "@ts-morph/common": "~0.28.1",
    "code-block-writer": "^13.0.3"
  },
  devDependencies: {
    "@rollup/plugin-typescript": "^12.1.2",
    "@types/chai": "^5.2.1",
    "@types/diff": "^7.0.2",
    "@types/mocha": "^10.0.10",
    "@types/node": "^22.14.1",
    chai: "^5.2.0",
    "conditional-type-checks": "^1.0.6",
    "cross-env": "^7.0.3",
    diff: "^7.0.0",
    mocha: "11.1.0",
    rimraf: "^6.0.1",
    rollup: "=4.40.0",
    "ts-node": "10.9.2",
    typescript: "~5.9.2"
  },
  browser: {
    fs: false,
    os: false,
    "fs.realpath": false,
    mkdirp: false,
    "dir-glob": false,
    "graceful-fs": false,
    "source-map-support": false,
    "glob-parent": false,
    glob: false,
    tinyglobby: false
  }
};

// node_modules/tslib/package.json
var package_default183 = {
  name: "tslib",
  author: "Microsoft Corp.",
  homepage: "https://www.typescriptlang.org/",
  version: "2.8.1",
  license: "0BSD",
  description: "Runtime library for TypeScript helper functions",
  keywords: [
    "TypeScript",
    "Microsoft",
    "compiler",
    "language",
    "javascript",
    "tslib",
    "runtime"
  ],
  bugs: {
    url: "https://github.com/Microsoft/TypeScript/issues"
  },
  repository: {
    type: "git",
    url: "https://github.com/Microsoft/tslib.git"
  },
  main: "tslib.js",
  module: "tslib.es6.js",
  "jsnext:main": "tslib.es6.js",
  typings: "tslib.d.ts",
  sideEffects: false,
  exports: {
    ".": {
      module: {
        types: "./modules/index.d.ts",
        default: "./tslib.es6.mjs"
      },
      import: {
        node: "./modules/index.js",
        default: {
          types: "./modules/index.d.ts",
          default: "./tslib.es6.mjs"
        }
      },
      default: "./tslib.js"
    },
    "./*": "./*",
    "./": "./"
  }
};

// node_modules/uint8arrays/package.json
var package_default184 = {
  name: "uint8arrays",
  version: "3.0.0",
  description: "Utility functions to make dealing with Uint8Arrays easier",
  main: "./cjs/src/index.js",
  author: "Alex Potsides <alex@achingbrain.net>",
  homepage: "https://github.com/achingbrain/uint8arrays",
  bugs: "https://github.com/achingbrain/uint8arrays/issues",
  types: "types/src/index.d.ts",
  repository: {
    type: "git",
    url: "https://github.com/achingbrain/uint8arrays.git"
  },
  scripts: {
    test: "aegir test",
    lint: "aegir ts -p check && aegir lint",
    release: "aegir release",
    "release-minor": "aegir release --type minor",
    "release-major": "aegir release --type major",
    build: "aegir build"
  },
  license: "MIT",
  dependencies: {
    multiformats: "^9.4.2"
  },
  devDependencies: {
    aegir: "^35.0.0",
    util: "^0.12.4"
  },
  eslintConfig: {
    extends: "ipfs",
    parserOptions: {
      sourceType: "module"
    },
    ignorePatterns: [
      "!.aegir.js"
    ]
  },
  typesVersions: {
    "*": {
      "*": [
        "types/src",
        "types/src/*"
      ]
    }
  },
  exports: {
    ".": {
      browser: "./esm/src/index.js",
      require: "./cjs/src/index.js",
      import: "./esm/src/index.js"
    },
    "./compare": {
      browser: "./esm/src/compare.js",
      require: "./cjs/src/compare.js",
      import: "./esm/src/compare.js"
    },
    "./concat": {
      browser: "./esm/src/concat.js",
      require: "./cjs/src/concat.js",
      import: "./esm/src/concat.js"
    },
    "./equals": {
      browser: "./esm/src/equals.js",
      require: "./cjs/src/equals.js",
      import: "./esm/src/equals.js"
    },
    "./from-string": {
      browser: "./esm/src/from-string.js",
      require: "./cjs/src/from-string.js",
      import: "./esm/src/from-string.js"
    },
    "./to-string": {
      browser: "./esm/src/to-string.js",
      require: "./cjs/src/to-string.js",
      import: "./esm/src/to-string.js"
    },
    "./xor": {
      browser: "./esm/src/xor.js",
      require: "./cjs/src/xor.js",
      import: "./esm/src/xor.js"
    }
  },
  contributors: [
    "achingbrain <alex@achingbrain.net>",
    "Irakli Gozalishvili <contact@gozala.io>",
    "Cayman <caymannava@gmail.com>",
    "Hugo Dias <hugomrdias@gmail.com>",
    "Mircea Nistor <mirceanis@gmail.com>",
    "Rafael Ramalho <rafazelramalho19@gmail.com>",
    "Vasco Santos <vasco.santos@ua.pt>"
  ],
  browser: {
    ".": "./cjs/src/index.js",
    "./compare": "./cjs/src/compare.js",
    "./concat": "./cjs/src/concat.js",
    "./equals": "./cjs/src/equals.js",
    "./from-string": "./cjs/src/from-string.js",
    "./to-string": "./cjs/src/to-string.js",
    "./xor": "./cjs/src/xor.js"
  }
};

// node_modules/undici_v6/package.json
var package_default185 = {
  name: "undici",
  version: "6.29.0",
  description: "An HTTP/1.1 client, written from scratch for Node.js",
  homepage: "https://undici.nodejs.org",
  bugs: {
    url: "https://github.com/nodejs/undici/issues"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/nodejs/undici.git"
  },
  license: "MIT",
  contributors: [
    {
      name: "Daniele Belardi",
      url: "https://github.com/dnlup",
      author: true
    },
    {
      name: "Ethan Arrowood",
      url: "https://github.com/ethan-arrowood",
      author: true
    },
    {
      name: "Matteo Collina",
      url: "https://github.com/mcollina",
      author: true
    },
    {
      name: "Matthew Aitken",
      url: "https://github.com/KhafraDev",
      author: true
    },
    {
      name: "Robert Nagy",
      url: "https://github.com/ronag",
      author: true
    },
    {
      name: "Szymon Marczak",
      url: "https://github.com/szmarczak",
      author: true
    },
    {
      name: "Tomas Della Vedova",
      url: "https://github.com/delvedor",
      author: true
    }
  ],
  keywords: [
    "fetch",
    "http",
    "https",
    "promise",
    "request",
    "curl",
    "wget",
    "xhr",
    "whatwg"
  ],
  main: "index.js",
  types: "index.d.ts",
  scripts: {
    "build:node": "npx esbuild@0.19.10 index-fetch.js --bundle --platform=node --outfile=undici-fetch.js --define:esbuildDetection=1 --keep-names && node scripts/strip-comments.js",
    "prebuild:wasm": "node build/wasm.js --prebuild",
    "build:wasm": "node build/wasm.js --docker",
    lint: "standard | snazzy",
    "lint:fix": "standard --fix | snazzy",
    test: "npm run test:javascript && cross-env NODE_V8_COVERAGE=  npm run test:typescript",
    "test:javascript": "node scripts/generate-pem && npm run test:unit && npm run test:node-fetch && npm run test:cache && npm run test:interceptors && npm run test:fetch && npm run test:cookies && npm run test:eventsource && npm run test:wpt && npm run test:websocket && npm run test:node-test && npm run test:jest",
    "test:javascript:withoutintl": "node scripts/generate-pem && npm run test:unit && npm run test:node-fetch && npm run test:fetch:nobuild && npm run test:cache && npm run test:interceptors && npm run test:cookies && npm run test:eventsource:nobuild && npm run test:wpt:withoutintl && npm run test:node-test",
    "test:busboy": 'borp -p "test/busboy/*.js"',
    "test:cache": 'borp -p "test/cache/*.js"',
    "test:cookies": 'borp -p "test/cookie/*.js"',
    "test:eventsource": "npm run build:node && npm run test:eventsource:nobuild",
    "test:eventsource:nobuild": 'borp --expose-gc -p "test/eventsource/*.js"',
    "test:fuzzing": "node test/fuzzing/fuzzing.test.js",
    "test:fetch": "npm run build:node && npm run test:fetch:nobuild",
    "test:fetch:nobuild": 'borp --timeout 180000 --expose-gc --concurrency 1 -p "test/fetch/*.js" && npm run test:webidl && npm run test:busboy',
    "test:h2": "npm run test:h2:core && npm run test:h2:fetch",
    "test:h2:core": 'borp -p "test/http2*.js"',
    "test:h2:fetch": 'npm run build:node && borp -p "test/fetch/http2*.js"',
    "test:interceptors": 'borp -p "test/interceptors/*.js"',
    "test:jest": "cross-env NODE_V8_COVERAGE= jest",
    "test:unit": 'borp --expose-gc -p "test/*.js"',
    "test:node-fetch": 'borp -p "test/node-fetch/**/*.js"',
    "test:node-test": 'borp -p "test/node-test/**/*.js"',
    "test:tdd": 'borp --expose-gc -p "test/*.js"',
    "test:tdd:node-test": 'borp -p "test/node-test/**/*.js" -w',
    "test:typescript": "tsd && tsc test/imports/undici-import.ts --typeRoots ./types && tsc ./types/*.d.ts --noEmit --typeRoots ./types",
    "test:webidl": 'borp -p "test/webidl/*.js"',
    "test:websocket": 'borp -p "test/websocket/*.js"',
    "test:websocket:autobahn": "node test/autobahn/client.js",
    "test:websocket:autobahn:report": "node test/autobahn/report.js",
    "test:wpt": "node test/wpt/start-fetch.mjs && node test/wpt/start-FileAPI.mjs && node test/wpt/start-mimesniff.mjs && node test/wpt/start-xhr.mjs && node test/wpt/start-websockets.mjs && node test/wpt/start-cacheStorage.mjs && node test/wpt/start-eventsource.mjs",
    "test:wpt:withoutintl": "node test/wpt/start-fetch.mjs && node test/wpt/start-mimesniff.mjs && node test/wpt/start-xhr.mjs && node test/wpt/start-cacheStorage.mjs && node test/wpt/start-eventsource.mjs",
    coverage: "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report",
    "coverage:ci": "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report:ci",
    "coverage:clean": "node ./scripts/clean-coverage.js",
    "coverage:report": "cross-env NODE_V8_COVERAGE= c8 report",
    "coverage:report:ci": "c8 report",
    bench: `echo "Error: Benchmarks have been moved to '/benchmarks'" && exit 1`,
    "serve:website": `echo "Error: Documentation has been moved to '/docs'" && exit 1`,
    prepare: "husky && node ./scripts/platform-shell.js"
  },
  devDependencies: {
    "@fastify/busboy": "2.1.1",
    "@matteo.collina/tspl": "^0.1.1",
    "@metcoder95/https-pem": "^1.0.0",
    "@sinonjs/fake-timers": "^11.1.0",
    "@types/node": "~18.19.50",
    "abort-controller": "^3.0.0",
    borp: "^0.15.0",
    c8: "^10.0.0",
    "cross-env": "^7.0.3",
    "dns-packet": "^5.4.0",
    "fast-check": "^3.17.1",
    "form-data": "^4.0.0",
    "formdata-node": "^6.0.3",
    husky: "^9.0.7",
    jest: "^29.0.2",
    jsdom: "^24.0.0",
    "node-forge": "^1.3.1",
    "pre-commit": "^1.2.2",
    proxy: "^2.1.1",
    snazzy: "^9.0.0",
    standard: "^17.0.0",
    tsd: "^0.31.0",
    typescript: "^5.0.2",
    ws: "^8.11.0"
  },
  engines: {
    node: ">=18.17"
  },
  standard: {
    env: [
      "jest"
    ],
    ignore: [
      "lib/llhttp/constants.js",
      "lib/llhttp/utils.js",
      "test/fixtures/wpt"
    ]
  },
  tsd: {
    directory: "test/types",
    compilerOptions: {
      esModuleInterop: true,
      lib: [
        "esnext"
      ]
    }
  },
  jest: {
    testMatch: [
      "<rootDir>/test/jest/**"
    ]
  }
};

// node_modules/undici_v7/package.json
var package_default186 = {
  name: "undici",
  version: "7.30.0",
  description: "An HTTP/1.1 client, written from scratch for Node.js",
  homepage: "https://undici.nodejs.org",
  bugs: {
    url: "https://github.com/nodejs/undici/issues"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/nodejs/undici.git"
  },
  license: "MIT",
  contributors: [
    {
      name: "Daniele Belardi",
      url: "https://github.com/dnlup",
      author: true
    },
    {
      name: "Ethan Arrowood",
      url: "https://github.com/ethan-arrowood",
      author: true
    },
    {
      name: "Matteo Collina",
      url: "https://github.com/mcollina",
      author: true
    },
    {
      name: "Matthew Aitken",
      url: "https://github.com/KhafraDev",
      author: true
    },
    {
      name: "Robert Nagy",
      url: "https://github.com/ronag",
      author: true
    },
    {
      name: "Szymon Marczak",
      url: "https://github.com/szmarczak",
      author: true
    },
    {
      name: "Tomas Della Vedova",
      url: "https://github.com/delvedor",
      author: true
    }
  ],
  keywords: [
    "fetch",
    "http",
    "https",
    "promise",
    "request",
    "curl",
    "wget",
    "xhr",
    "whatwg"
  ],
  main: "index.js",
  types: "index.d.ts",
  scripts: {
    "build:node": "esbuild index-fetch.js --bundle --platform=node --outfile=undici-fetch.js --define:esbuildDetection=1 --keep-names && node scripts/strip-comments.js",
    "build:wasm": "node build/wasm.js --docker",
    "generate-pem": "node scripts/generate-pem.js",
    lint: "eslint --cache",
    "lint:fix": "eslint --fix --cache",
    test: "npm run test:javascript && cross-env NODE_V8_COVERAGE= npm run test:typescript",
    "test:javascript": "npm run test:javascript:no-jest && npm run test:jest",
    "test:javascript:no-jest": "npm run generate-pem && npm run test:unit && npm run test:fetch && npm run test:node-fetch && npm run test:infra && npm run test:cache && npm run test:cache-interceptor && npm run test:interceptors && npm run test:cookies && npm run test:eventsource && npm run test:subresource-integrity && npm run test:wpt && npm run test:websocket && npm run test:node-test && npm run test:cache-tests",
    "test:javascript:without-intl": "npm run test:javascript:no-jest",
    "test:busboy": 'borp --timeout 180000 -p "test/busboy/*.js"',
    "test:cache": 'borp --timeout 180000 -p "test/cache/*.js"',
    "test:cache-interceptor": 'borp --timeout 180000 -p "test/cache-interceptor/*.js"',
    "test:cache-interceptor:sqlite": "cross-env NODE_OPTIONS=--experimental-sqlite npm run test:cache-interceptor",
    "test:cookies": 'borp --timeout 180000 -p "test/cookie/*.js"',
    "test:eventsource": 'npm run build:node && borp --timeout 180000 --expose-gc -p "test/eventsource/*.js"',
    "test:fuzzing": "node test/fuzzing/fuzzing.test.js",
    "test:fetch": 'npm run build:node && borp --timeout 180000 --expose-gc --concurrency 1 -p "test/fetch/*.js" && npm run test:webidl && npm run test:busboy',
    "test:subresource-integrity": 'borp --timeout 180000 -p "test/subresource-integrity/*.js"',
    "test:h2": "npm run test:h2:core && npm run test:h2:fetch",
    "test:h2:core": 'borp --timeout 180000 -p "test/+(http2|h2)*.js"',
    "test:h2:fetch": 'npm run build:node && borp --timeout 180000 -p "test/fetch/http2*.js"',
    "test:infra": 'borp --timeout 180000 -p "test/infra/*.js"',
    "test:interceptors": 'borp --timeout 180000 -p "test/interceptors/*.js"',
    "test:jest": "cross-env NODE_V8_COVERAGE= jest",
    "test:unit": 'borp --timeout 180000 --expose-gc -p "test/*.js"',
    "test:node-fetch": 'borp --timeout 180000 -p "test/node-fetch/**/*.js"',
    "test:node-test": 'borp --timeout 180000 -p "test/node-test/**/*.js"',
    "test:tdd": 'borp --timeout 180000 --expose-gc -p "test/*.js"',
    "test:tdd:node-test": 'borp --timeout 180000 -p "test/node-test/**/*.js" -w',
    "test:typescript": "tsd && tsc test/imports/undici-import.ts --typeRoots ./types --noEmit && tsc ./types/*.d.ts --noEmit --typeRoots ./types",
    "test:webidl": 'borp --timeout 180000 -p "test/webidl/*.js"',
    "test:websocket": 'borp --timeout 180000 -p "test/websocket/**/*.js"',
    "test:websocket:autobahn": "node test/autobahn/client.js",
    "test:websocket:autobahn:report": "node test/autobahn/report.js",
    "test:wpt:setup": "node test/web-platform-tests/wpt-runner.mjs setup",
    "test:wpt": "npm run test:wpt:setup && node test/web-platform-tests/wpt-runner.mjs run /fetch /mimesniff /xhr /websockets /serviceWorkers /eventsource",
    "test:cache-tests": "node test/cache-interceptor/cache-tests.mjs --ci",
    coverage: "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report",
    "coverage:ci": "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report:ci",
    "coverage:clean": "node ./scripts/clean-coverage.js",
    "coverage:report": "cross-env NODE_V8_COVERAGE= c8 report",
    "coverage:report:ci": "c8 report",
    bench: `echo "Error: Benchmarks have been moved to '/benchmarks'" && exit 1`,
    "serve:website": `echo "Error: Documentation has been moved to '/docs'" && exit 1`,
    prepare: "husky && node ./scripts/platform-shell.js"
  },
  devDependencies: {
    "@fastify/busboy": "3.2.0",
    "@matteo.collina/tspl": "^0.2.0",
    "@metcoder95/https-pem": "^1.0.0",
    "@sinonjs/fake-timers": "^12.0.0",
    "@types/node": "^20.19.22",
    "abort-controller": "^3.0.0",
    borp: "^0.20.0",
    c8: "^10.0.0",
    "cross-env": "^10.0.0",
    "dns-packet": "^5.4.0",
    esbuild: "^0.27.3",
    eslint: "^9.9.0",
    "fast-check": "^4.1.1",
    husky: "^9.0.7",
    jest: "^30.0.5",
    jsondiffpatch: "^0.7.3",
    neostandard: "^0.12.0",
    "node-forge": "^1.3.1",
    proxy: "^2.1.1",
    tsd: "^0.33.0",
    typescript: "^6.0.2",
    ws: "^8.11.0"
  },
  engines: {
    node: ">=20.18.1"
  },
  tsd: {
    directory: "test/types",
    compilerOptions: {
      esModuleInterop: true,
      lib: [
        "esnext"
      ]
    }
  },
  jest: {
    testMatch: [
      "<rootDir>/test/jest/**"
    ]
  }
};

// node_modules/undici_v8/package.json
var package_default187 = {
  name: "undici",
  version: "8.11.2",
  description: "An HTTP/1.1 client, written from scratch for Node.js",
  homepage: "https://undici.nodejs.org",
  bugs: {
    url: "https://github.com/nodejs/undici/issues"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/nodejs/undici.git"
  },
  license: "MIT",
  contributors: [
    {
      name: "Daniele Belardi",
      url: "https://github.com/dnlup",
      author: true
    },
    {
      name: "Ethan Arrowood",
      url: "https://github.com/ethan-arrowood",
      author: true
    },
    {
      name: "Matteo Collina",
      url: "https://github.com/mcollina",
      author: true
    },
    {
      name: "Matthew Aitken",
      url: "https://github.com/KhafraDev",
      author: true
    },
    {
      name: "Robert Nagy",
      url: "https://github.com/ronag",
      author: true
    },
    {
      name: "Szymon Marczak",
      url: "https://github.com/szmarczak",
      author: true
    },
    {
      name: "Tomas Della Vedova",
      url: "https://github.com/delvedor",
      author: true
    }
  ],
  keywords: [
    "fetch",
    "http",
    "https",
    "promise",
    "request",
    "curl",
    "wget",
    "xhr",
    "whatwg"
  ],
  main: "index.js",
  types: "index.d.ts",
  scripts: {
    "build:node": "esbuild index-fetch.js --bundle --platform=node --outfile=undici-fetch.js --define:esbuildDetection=1 --keep-names && node scripts/strip-comments.js",
    "build:wasm": "node build/wasm.js --docker",
    "generate-pem": "node scripts/generate-pem.js",
    lint: "eslint --cache",
    "lint:fix": "eslint --fix --cache",
    test: "npm run test:javascript && cross-env NODE_V8_COVERAGE= npm run test:typescript",
    "test:javascript": "npm run test:javascript:no-jest && npm run test:jest",
    "test:javascript:no-jest": "npm run generate-pem && npm run test:unit && npm run test:fetch && npm run test:node-fetch && npm run test:infra && npm run test:cache && npm run test:cache-interceptor && npm run test:interceptors && npm run test:cookies && npm run test:eventsource && npm run test:subresource-integrity && npm run test:wpt && npm run test:websocket && npm run test:node-test && npm run test:cache-tests",
    "test:javascript:without-intl": "npm run test:javascript:no-jest",
    "test:busboy": 'borp --timeout 180000 -p "test/busboy/*.js"',
    "test:cache": 'borp --timeout 180000 -p "test/cache/*.js"',
    "test:cache-interceptor": 'borp --timeout 180000 -p "test/cache-interceptor/*.js"',
    "test:cache-interceptor:sqlite": "cross-env NODE_OPTIONS=--experimental-sqlite npm run test:cache-interceptor",
    "test:cookies": 'borp --timeout 180000 -p "test/cookie/*.js"',
    "test:eventsource": 'npm run build:node && borp --timeout 180000 --expose-gc -p "test/eventsource/*.js"',
    "test:fuzzing": "node test/fuzzing/fuzzing.test.js",
    "test:fetch": 'npm run build:node && borp --timeout 180000 --expose-gc --concurrency 1 -p "test/fetch/*.js" && npm run test:webidl && npm run test:busboy',
    "test:subresource-integrity": 'borp --timeout 180000 -p "test/subresource-integrity/*.js"',
    "test:h2": "npm run test:h2:core && npm run test:h2:fetch",
    "test:h2:core": 'borp --timeout 180000 -p "test/+(http2|h2)*.js"',
    "test:h2:fetch": 'npm run build:node && borp --timeout 180000 -p "test/fetch/http2*.js"',
    "test:infra": 'borp --timeout 180000 -p "test/infra/*.js"',
    "test:interceptors": 'borp --timeout 180000 -p "test/interceptors/*.js"',
    "test:jest": "cross-env NODE_V8_COVERAGE= jest",
    "test:unit": 'borp --timeout 180000 --expose-gc -p "test/*.js"',
    "test:node-fetch": 'borp --timeout 180000 -p "test/node-fetch/**/*.js"',
    "test:node-test": 'borp --timeout 180000 -p "test/node-test/**/*.js"',
    "test:tdd": 'borp --timeout 180000 --expose-gc -p "test/*.js"',
    "test:tdd:node-test": 'borp --timeout 180000 -p "test/node-test/**/*.js" -w',
    "test:typescript": "tsd && tsc test/imports/undici-import.ts --typeRoots ./types --noEmit && tsc ./types/*.d.ts --noEmit --typeRoots ./types",
    "test:webidl": 'borp --timeout 180000 -p "test/webidl/*.js"',
    "test:websocket": 'borp --timeout 180000 -p "test/websocket/**/*.js"',
    "test:websocket:autobahn": "node test/autobahn/client.js",
    "test:websocket:autobahn:report": "node test/autobahn/report.js",
    "test:wpt:setup": "node test/web-platform-tests/wpt-runner.mjs setup",
    "test:wpt": "npm run test:wpt:setup && node test/web-platform-tests/wpt-runner.mjs run /fetch /mimesniff /xhr /websockets /eventsource",
    "test:cache-tests": "node test/cache-interceptor/cache-tests.mjs --ci",
    coverage: "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report",
    "coverage:ci": "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report:ci",
    "coverage:clean": "node ./scripts/clean-coverage.js",
    "coverage:report": "cross-env NODE_V8_COVERAGE= c8 report",
    "coverage:report:ci": "c8 report",
    bench: `echo "Error: Benchmarks have been moved to '/benchmarks'" && exit 1`,
    "serve:website": `echo "Error: Documentation has been moved to '/docs'" && exit 1`,
    prepare: "husky && node ./scripts/platform-shell.js"
  },
  devDependencies: {
    "@fastify/busboy": "3.2.2",
    "@matteo.collina/tspl": "^0.2.0",
    "@metcoder95/https-pem": "^1.0.0",
    "@sinonjs/fake-timers": "^12.0.0",
    "@types/node": "^22.0.0",
    "abort-controller": "^3.0.0",
    borp: "^1.0.0",
    c8: "^12.0.0",
    "cross-env": "^10.0.0",
    "dns-packet": "^5.4.0",
    esbuild: "^0.28.0",
    eslint: "^9.9.0",
    "fast-check": "^4.1.1",
    husky: "^9.0.7",
    jest: "^30.0.5",
    jsondiffpatch: "^0.7.3",
    neostandard: "^0.13.0",
    "node-forge": "^1.3.1",
    proxy: "^4.0.0",
    tsd: "^0.33.0",
    typescript: "^6.0.2",
    ws: "^8.11.0"
  },
  engines: {
    node: ">=22.19.0"
  },
  tsd: {
    directory: "test/types",
    compilerOptions: {
      esModuleInterop: true,
      lib: [
        "esnext"
      ]
    }
  },
  jest: {
    testMatch: [
      "<rootDir>/test/jest/**"
    ]
  }
};

// node_modules/unicode-segmenter/package.json
var package_default188 = {
  name: "unicode-segmenter",
  version: "0.14.5",
  type: "module",
  description: "A lightweight implementation of the Unicode Text Segmentation (UAX #29)",
  license: "MIT",
  homepage: "https://github.com/cometkim/unicode-segmenter",
  keywords: [
    "unicode",
    "uax29",
    "text-segmentation",
    "grapheme",
    "grapheme-cluster",
    "emoji",
    "intl",
    "polyfill"
  ],
  repository: {
    type: "git",
    url: "git+https://github.com/cometkim/unicode-segmenter.git"
  },
  maintainers: [
    {
      email: "hey@hyeseong.kim",
      name: "Hyeseong Kim"
    }
  ],
  exports: {
    ".": {
      types: "./index.d.ts",
      import: "./index.js",
      require: "./index.cjs"
    },
    "./emoji": {
      types: "./emoji.d.ts",
      import: "./emoji.js",
      require: "./emoji.cjs"
    },
    "./general": {
      types: "./general.d.ts",
      import: "./general.js",
      require: "./general.cjs"
    },
    "./grapheme": {
      types: "./grapheme.d.ts",
      import: "./grapheme.js",
      require: "./grapheme.cjs"
    },
    "./utils": {
      types: "./utils.d.ts",
      import: "./utils.js",
      require: "./utils.cjs"
    },
    "./intl-adapter": {
      types: "./intl-adapter.d.ts",
      import: "./intl-adapter.js",
      require: "./intl-adapter.cjs"
    },
    "./intl-polyfill": {
      types: "./intl-polyfill.d.ts",
      import: "./intl-polyfill.js",
      require: "./intl-polyfill.cjs"
    },
    "./bundle/*": "./bundle/*.js",
    "./package.json": "./package.json"
  },
  imports: {
    "#src/*": "./src/*"
  },
  sideEffects: [
    "./intl-polyfill.js",
    "./intl-polyfill.cjs"
  ],
  publishConfig: {
    access: "public",
    provenance: true,
    main: "./index.js",
    types: "./index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        import: "./index.js",
        require: "./index.cjs"
      },
      "./emoji": {
        types: "./emoji.d.ts",
        import: "./emoji.js",
        require: "./emoji.cjs"
      },
      "./general": {
        types: "./general.d.ts",
        import: "./general.js",
        require: "./general.cjs"
      },
      "./grapheme": {
        types: "./grapheme.d.ts",
        import: "./grapheme.js",
        require: "./grapheme.cjs"
      },
      "./utils": {
        types: "./utils.d.ts",
        import: "./utils.js",
        require: "./utils.cjs"
      },
      "./intl-adapter": {
        types: "./intl-adapter.d.ts",
        import: "./intl-adapter.js",
        require: "./intl-adapter.cjs"
      },
      "./intl-polyfill": {
        types: "./intl-polyfill.d.ts",
        import: "./intl-polyfill.js",
        require: "./intl-polyfill.cjs"
      },
      "./bundle/*": "./bundle/*.js",
      "./package.json": "./package.json"
    }
  },
  files: [
    "/*.js",
    "/*.cjs",
    "/*.d.ts",
    "/licenses",
    "/bundle"
  ],
  scripts: {
    prepack: "yarn clean && yarn build",
    clean: 'rimraf -g "*.js" "*.cjs" "*.map" "*.d.ts" "bundle"',
    build: "node scripts/build-exports.js && tsc -p tsconfig.build.json",
    test: "node --test --test-reporter spec --test-reporter-destination=stdout",
    "test:coverage": "yarn test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=lcov.info",
    "bundle-stats:emoji": "node benchmark/emoji/bundle-stats.js",
    "bundle-stats:general": "node benchmark/general/bundle-stats.js",
    "bundle-stats:grapheme": "node benchmark/grapheme/bundle-stats.js",
    "bundle-stats:grapheme:hermes": "node benchmark/grapheme/bundle-stats-hermes.js",
    "perf:emoji": "node --expose-gc benchmark/emoji/perf.js",
    "perf:general": "node --expose-gc benchmark/general/perf.js",
    "perf:grapheme": "node --expose-gc benchmark/grapheme/perf.js",
    "perf:grapheme:browser": "vite -c benchmark/grapheme/vite.config.js",
    "perf:grapheme:hermes": "node benchmark/grapheme/perf-hermes.js",
    "perf:grapheme:quickjs": "node benchmark/grapheme/perf-quickjs.js"
  },
  alias: {
    process: false
  },
  devDependencies: {
    "@babel/core": "^7.28.5",
    "@babel/plugin-transform-modules-commonjs": "^7.27.1",
    "@changesets/cli": "^2.29.8",
    "@codspeed/tinybench-plugin": "^5.0.1",
    "@formatjs/intl-segmenter": "11.7.12",
    "@mitata/counters": "^0.0.8",
    "@react-native/metro-babel-transformer": "^0.82.1",
    "@types/babel__core": "^7.20.5",
    "@types/node": "^24.10.1",
    "emoji-regex": "10.6.0",
    "emojibase-regex": "17.0.0",
    esbuild: "^0.27.1",
    "fast-check": "^4.3.0",
    "grapheme-splitter": "1.0.4",
    graphemer: "1.4.0",
    metro: "^0.83.3",
    mitata: "^1.0.34",
    "os-browserify": "^0.3.0",
    "pretty-bytes": "^7.1.0",
    rimraf: "^6.1.2",
    tinybench: "^5.1.0",
    typescript: "^5.9.3",
    "unicode-segmentation-wasm": "github:cometkim/unicode-segmentation-wasm#230eb74d320ea2f31f95b74ddb2567186d496587",
    vite: "^7.2.6",
    "vite-plugin-externals": "^0.6.2",
    xregexp: "5.1.2",
    zx: "^8.8.5"
  },
  packageManager: "yarn@4.12.0",
  main: "./index.js",
  types: "./index.d.ts"
};

// node_modules/valibot/package.json
var package_default189 = {
  name: "valibot",
  description: "The modular and type safe schema library for validating structural data",
  version: "1.5.0",
  license: "MIT",
  author: "Fabian Hiller",
  homepage: "https://valibot.dev",
  repository: {
    type: "git",
    url: "https://github.com/open-circle/valibot"
  },
  keywords: [
    "modular",
    "typescript",
    "schema",
    "validation",
    "parsing",
    "bundle-size",
    "type-safe",
    "runtime",
    "validator",
    "schema-validation",
    "type-inference",
    "standard-schema"
  ],
  type: "module",
  main: "./dist/index.mjs",
  types: "./dist/index.d.mts",
  exports: {
    ".": {
      import: {
        types: "./dist/index.d.mts",
        default: "./dist/index.mjs"
      },
      require: {
        types: "./dist/index.d.cts",
        default: "./dist/index.cjs"
      }
    }
  },
  sideEffects: false,
  files: [
    "dist"
  ],
  publishConfig: {
    access: "public"
  },
  scripts: {
    play: "tsm ./playground.ts",
    test: "vitest --typecheck",
    coverage: "vitest run --coverage --isolate",
    lint: 'eslint "src/**/*.ts*" && tsc --noEmit && deno check ./src/index.ts',
    "lint.fix": 'eslint "src/**/*.ts*" --fix',
    format: "prettier --write ./src",
    "format.check": "prettier --check ./src",
    build: "tsdown"
  },
  devDependencies: {
    "@eslint/js": "^9.39.1",
    "@vitest/coverage-v8": "^4.1.8",
    eslint: "^9.39.1",
    "eslint-import-resolver-typescript": "^4.4.4",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-jsdoc": "^61.4.0",
    "eslint-plugin-redos-detector": "^3.1.1",
    "eslint-plugin-regexp": "^2.10.0",
    "eslint-plugin-security": "^3.0.1",
    jsdom: "^27.2.0",
    tsdown: "^0.16.6",
    tsm: "^2.3.0",
    typescript: "^5.9.3",
    "typescript-eslint": "^8.47.0",
    vite: "^7.2.4",
    vitest: "4.1.8"
  },
  peerDependencies: {
    typescript: ">=5"
  },
  peerDependenciesMeta: {
    typescript: {
      optional: true
    }
  }
};

// node_modules/varint/package.json
var package_default190 = {
  name: "varint",
  version: "6.0.0",
  description: "protobuf-style varint bytes - use msb to create integer values of varying sizes",
  main: "index.js",
  scripts: {
    test: "node test.js"
  },
  repository: {
    type: "git",
    url: "git://github.com/chrisdickinson/varint.git"
  },
  keywords: [
    "varint",
    "protobuf",
    "encode",
    "decode"
  ],
  author: "Chris Dickinson <chris@neversaw.us>",
  license: "MIT",
  devDependencies: {
    tape: "~2.12.3"
  }
};

// node_modules/wrap-ansi/package.json
var package_default191 = {
  name: "wrap-ansi",
  version: "7.0.0",
  description: "Wordwrap a string with ANSI escape codes",
  license: "MIT",
  repository: "chalk/wrap-ansi",
  funding: "https://github.com/chalk/wrap-ansi?sponsor=1",
  author: {
    name: "Sindre Sorhus",
    email: "sindresorhus@gmail.com",
    url: "https://sindresorhus.com"
  },
  engines: {
    node: ">=10"
  },
  scripts: {
    test: "xo && nyc ava"
  },
  files: [
    "index.js"
  ],
  keywords: [
    "wrap",
    "break",
    "wordwrap",
    "wordbreak",
    "linewrap",
    "ansi",
    "styles",
    "color",
    "colour",
    "colors",
    "terminal",
    "console",
    "cli",
    "string",
    "tty",
    "escape",
    "formatting",
    "rgb",
    "256",
    "shell",
    "xterm",
    "log",
    "logging",
    "command-line",
    "text"
  ],
  dependencies: {
    "ansi-styles": "^4.0.0",
    "string-width": "^4.1.0",
    "strip-ansi": "^6.0.0"
  },
  devDependencies: {
    ava: "^2.1.0",
    chalk: "^4.0.0",
    coveralls: "^3.0.3",
    "has-ansi": "^4.0.0",
    nyc: "^15.0.1",
    xo: "^0.29.1"
  }
};

// node_modules/y18n/package.json
var package_default192 = {
  name: "y18n",
  version: "5.0.8",
  description: "the bare-bones internationalization library used by yargs",
  exports: {
    ".": [
      {
        import: "./index.mjs",
        require: "./build/index.cjs"
      },
      "./build/index.cjs"
    ]
  },
  type: "module",
  module: "./build/lib/index.js",
  keywords: [
    "i18n",
    "internationalization",
    "yargs"
  ],
  homepage: "https://github.com/yargs/y18n",
  bugs: {
    url: "https://github.com/yargs/y18n/issues"
  },
  repository: "yargs/y18n",
  license: "ISC",
  author: "Ben Coe <bencoe@gmail.com>",
  main: "./build/index.cjs",
  scripts: {
    check: "standardx **/*.ts **/*.cjs **/*.mjs",
    fix: "standardx --fix **/*.ts **/*.cjs **/*.mjs",
    pretest: "rimraf build && tsc -p tsconfig.test.json && cross-env NODE_ENV=test npm run build:cjs",
    test: "c8 --reporter=text --reporter=html mocha test/*.cjs",
    "test:esm": "c8 --reporter=text --reporter=html mocha test/esm/*.mjs",
    posttest: "npm run check",
    coverage: "c8 report --check-coverage",
    precompile: "rimraf build",
    compile: "tsc",
    postcompile: "npm run build:cjs",
    "build:cjs": "rollup -c",
    prepare: "npm run compile"
  },
  devDependencies: {
    "@types/node": "^14.6.4",
    "@wessberg/rollup-plugin-ts": "^1.3.1",
    c8: "^7.3.0",
    chai: "^4.0.1",
    "cross-env": "^7.0.2",
    gts: "^3.0.0",
    mocha: "^8.0.0",
    rimraf: "^3.0.2",
    rollup: "^2.26.10",
    standardx: "^7.0.0",
    "ts-transform-default-export": "^1.0.2",
    typescript: "^4.0.0"
  },
  files: [
    "build",
    "index.mjs",
    "!*.d.ts"
  ],
  engines: {
    node: ">=10"
  },
  standardx: {
    ignore: [
      "build"
    ]
  }
};

// node_modules/yargs/package.json
var package_default193 = {
  name: "yargs",
  version: "17.7.3",
  description: "yargs the modern, pirate-themed, successor to optimist.",
  main: "./index.cjs",
  exports: {
    "./package.json": "./package.json",
    ".": [
      {
        import: "./index.mjs",
        require: "./index.cjs"
      },
      "./index.cjs"
    ],
    "./helpers": {
      import: "./helpers/helpers.mjs",
      require: "./helpers/index.js"
    },
    "./browser": {
      import: "./browser.mjs",
      types: "./browser.d.ts"
    },
    "./yargs": [
      {
        import: "./yargs.mjs",
        require: "./yargs.cjs"
      },
      "./yargs.cjs"
    ]
  },
  type: "module",
  module: "./index.mjs",
  contributors: [
    {
      name: "Yargs Contributors",
      url: "https://github.com/yargs/yargs/graphs/contributors"
    }
  ],
  files: [
    "browser.mjs",
    "browser.d.ts",
    "index.cjs",
    "helpers/*.js",
    "helpers/*",
    "index.mjs",
    "yargs",
    "yargs.cjs",
    "yargs.mjs",
    "build",
    "locales",
    "LICENSE",
    "lib/platform-shims/*.mjs",
    "!*.d.ts",
    "!**/*.d.ts"
  ],
  dependencies: {
    cliui: "^8.0.1",
    escalade: "^3.1.1",
    "get-caller-file": "^2.0.5",
    "require-directory": "^2.1.1",
    "string-width": "^4.2.3",
    y18n: "^5.0.5",
    "yargs-parser": "^21.1.1"
  },
  devDependencies: {
    "@types/chai": "^4.2.11",
    "@types/mocha": "^9.0.0",
    "@types/node": "18.16.1",
    c8: "^7.7.0",
    chai: "^4.2.0",
    chalk: "^4.0.0",
    coveralls: "^3.0.9",
    cpr: "^3.0.1",
    "cross-env": "^7.0.2",
    "cross-spawn": "^7.0.0",
    eslint: "^7.23.0",
    gts: "^3.0.0",
    hashish: "0.0.4",
    mocha: "^9.0.0",
    rimraf: "^3.0.2",
    rollup: "^2.23.0",
    "rollup-plugin-cleanup": "^3.1.1",
    "rollup-plugin-terser": "^7.0.2",
    "rollup-plugin-ts": "^2.0.4",
    tslib: "^2.4.0",
    typescript: "^4.0.2",
    which: "^2.0.0",
    "yargs-test-extends": "^1.0.1"
  },
  scripts: {
    fix: "gts fix && npm run fix:js",
    "fix:js": "eslint . --ext cjs --ext mjs --ext js --fix",
    posttest: "npm run check",
    test: "c8 mocha --enable-source-maps ./test/*.cjs --require ./test/before.cjs --timeout=12000 --check-leaks",
    "test:esm": "c8 mocha --enable-source-maps ./test/esm/*.mjs --check-leaks",
    coverage: "c8 report --check-coverage",
    prepare: "npm run compile",
    pretest: "npm run compile -- -p tsconfig.test.json && cross-env NODE_ENV=test npm run build:cjs",
    compile: "rimraf build && tsc",
    postcompile: "npm run build:cjs",
    "build:cjs": "rollup -c rollup.config.cjs",
    "postbuild:cjs": "rimraf ./build/index.cjs.d.ts",
    check: "gts lint && npm run check:js",
    "check:js": "eslint . --ext cjs --ext mjs --ext js",
    clean: "gts clean"
  },
  repository: {
    type: "git",
    url: "https://github.com/yargs/yargs.git"
  },
  homepage: "https://yargs.js.org/",
  keywords: [
    "argument",
    "args",
    "option",
    "parser",
    "parsing",
    "cli",
    "command"
  ],
  license: "MIT",
  engines: {
    node: ">=12"
  }
};

// node_modules/yargs-parser/package.json
var package_default194 = {
  name: "yargs-parser",
  version: "21.1.1",
  description: "the mighty option parser used by yargs",
  main: "build/index.cjs",
  exports: {
    ".": [
      {
        import: "./build/lib/index.js",
        require: "./build/index.cjs"
      },
      "./build/index.cjs"
    ],
    "./browser": [
      "./browser.js"
    ]
  },
  type: "module",
  module: "./build/lib/index.js",
  scripts: {
    check: "standardx '**/*.ts' && standardx '**/*.js' && standardx '**/*.cjs'",
    fix: "standardx --fix '**/*.ts' && standardx --fix '**/*.js' && standardx --fix '**/*.cjs'",
    pretest: "rimraf build && tsc -p tsconfig.test.json && cross-env NODE_ENV=test npm run build:cjs",
    test: "c8 --reporter=text --reporter=html mocha test/*.cjs",
    "test:esm": "c8 --reporter=text --reporter=html mocha test/*.mjs",
    "test:browser": "start-server-and-test 'serve ./ -p 8080' http://127.0.0.1:8080/package.json 'node ./test/browser/yargs-test.cjs'",
    "pretest:typescript": "npm run pretest",
    "test:typescript": "c8 mocha ./build/test/typescript/*.js",
    coverage: "c8 report --check-coverage",
    precompile: "rimraf build",
    compile: "tsc",
    postcompile: "npm run build:cjs",
    "build:cjs": "rollup -c",
    prepare: "npm run compile"
  },
  repository: {
    type: "git",
    url: "https://github.com/yargs/yargs-parser.git"
  },
  keywords: [
    "argument",
    "parser",
    "yargs",
    "command",
    "cli",
    "parsing",
    "option",
    "args",
    "argument"
  ],
  author: "Ben Coe <ben@npmjs.com>",
  license: "ISC",
  devDependencies: {
    "@types/chai": "^4.2.11",
    "@types/mocha": "^9.0.0",
    "@types/node": "^16.11.4",
    "@typescript-eslint/eslint-plugin": "^3.10.1",
    "@typescript-eslint/parser": "^3.10.1",
    c8: "^7.3.0",
    chai: "^4.2.0",
    "cross-env": "^7.0.2",
    eslint: "^7.0.0",
    "eslint-plugin-import": "^2.20.1",
    "eslint-plugin-node": "^11.0.0",
    gts: "^3.0.0",
    mocha: "^10.0.0",
    puppeteer: "^16.0.0",
    rimraf: "^3.0.2",
    rollup: "^2.22.1",
    "rollup-plugin-cleanup": "^3.1.1",
    "rollup-plugin-ts": "^3.0.2",
    serve: "^14.0.0",
    standardx: "^7.0.0",
    "start-server-and-test": "^1.11.2",
    "ts-transform-default-export": "^1.0.2",
    typescript: "^4.0.0"
  },
  files: [
    "browser.js",
    "build",
    "!*.d.ts",
    "!*.d.cts"
  ],
  engines: {
    node: ">=12"
  },
  standardx: {
    ignore: [
      "build"
    ]
  }
};

// node_modules/zod/package.json
var package_default195 = {
  name: "zod",
  version: "3.25.76",
  type: "module",
  author: "Colin McDonnell <zod@colinhacks.com>",
  description: "TypeScript-first schema declaration and validation library with static type inference",
  files: [
    "src",
    "**/*.js",
    "**/*.mjs",
    "**/*.cjs",
    "**/*.d.ts",
    "**/*.d.mts",
    "**/*.d.cts"
  ],
  funding: "https://github.com/sponsors/colinhacks",
  homepage: "https://zod.dev",
  keywords: [
    "typescript",
    "schema",
    "validation",
    "type",
    "inference"
  ],
  license: "MIT",
  sideEffects: false,
  main: "./index.cjs",
  types: "./index.d.cts",
  module: "./index.js",
  zshy: {
    exports: {
      "./package.json": "./package.json",
      ".": "./src/index.ts",
      "./v3": "./src/v3/index.ts",
      "./v4": "./src/v4/index.ts",
      "./v4-mini": "./src/v4-mini/index.ts",
      "./v4/mini": "./src/v4/mini/index.ts",
      "./v4/core": "./src/v4/core/index.ts",
      "./v4/locales": "./src/v4/locales/index.ts",
      "./v4/locales/*": "./src/v4/locales/*"
    },
    sourceDialects: [
      "@zod/source"
    ]
  },
  exports: {
    "./package.json": "./package.json",
    ".": {
      "@zod/source": "./src/index.ts",
      types: "./index.d.cts",
      import: "./index.js",
      require: "./index.cjs"
    },
    "./v3": {
      "@zod/source": "./src/v3/index.ts",
      types: "./v3/index.d.cts",
      import: "./v3/index.js",
      require: "./v3/index.cjs"
    },
    "./v4": {
      "@zod/source": "./src/v4/index.ts",
      types: "./v4/index.d.cts",
      import: "./v4/index.js",
      require: "./v4/index.cjs"
    },
    "./v4-mini": {
      "@zod/source": "./src/v4-mini/index.ts",
      types: "./v4-mini/index.d.cts",
      import: "./v4-mini/index.js",
      require: "./v4-mini/index.cjs"
    },
    "./v4/mini": {
      "@zod/source": "./src/v4/mini/index.ts",
      types: "./v4/mini/index.d.cts",
      import: "./v4/mini/index.js",
      require: "./v4/mini/index.cjs"
    },
    "./v4/core": {
      "@zod/source": "./src/v4/core/index.ts",
      types: "./v4/core/index.d.cts",
      import: "./v4/core/index.js",
      require: "./v4/core/index.cjs"
    },
    "./v4/locales": {
      "@zod/source": "./src/v4/locales/index.ts",
      types: "./v4/locales/index.d.cts",
      import: "./v4/locales/index.js",
      require: "./v4/locales/index.cjs"
    },
    "./v4/locales/*": {
      "@zod/source": "./src/v4/locales/*",
      types: "./v4/locales/*",
      import: "./v4/locales/*",
      require: "./v4/locales/*"
    }
  },
  repository: {
    type: "git",
    url: "git+https://github.com/colinhacks/zod.git"
  },
  bugs: {
    url: "https://github.com/colinhacks/zod/issues"
  },
  support: {
    backing: {
      "npm-funding": true
    }
  },
  scripts: {
    clean: "git clean -xdf . -e node_modules",
    build: "zshy --project tsconfig.build.json",
    postbuild: "pnpm biome check --write .",
    "test:watch": "pnpm vitest",
    test: "pnpm vitest run",
    "bump:beta": 'pnpm version "v$(pnpm pkg get version | jq -r)-beta.$(date +%Y%m%dT%H%M%S)"',
    "pub:beta": "pnpm bump:beta && pnpm publish --tag next --publish-branch v4 --no-git-checks --dry-run"
  }
};

// dist/src/core/dependencies-approved.json
var dependencies_approved_default = {
  profile: "atseq-app-v2",
  approval: "A1 official OAuth Node/browser 0.5.8 family and C1\u2013C6 under ratified f3c65906 and manifest clarification 862135c7; preserved I1 foundation files; exact-head conformance required; semantic contracts unchanged",
  direct: {
    "@atcute/car": "6.1.0",
    "@atcute/cbor": "2.3.8",
    "@atcute/cid": "2.5.0",
    "@atcute/crypto": "2.4.4",
    "@atcute/did-plc": "1.0.2",
    "@atcute/mst": "1.1.1",
    "@atcute/multibase": "1.2.5",
    "@atcute/repo": "1.1.0",
    "@atcute/varint": "2.0.2",
    "@atproto-labs/fetch-node": "0.4.0",
    "@atproto/common-web": "0.5.10",
    "@atproto/did": "0.3.0",
    "@atproto/lexicon": "0.7.12",
    "@atproto/oauth-client-browser": "0.5.8",
    "@atproto/oauth-client-node": "0.5.8",
    "@atproto/syntax": "0.7.5",
    "@inlay/core": "0.0.13",
    "@inlay/render": "0.3.1",
    "@noble/secp256k1": "3.2.0",
    jsonata: "2.2.2",
    "jsonc-parser": "3.3.1",
    valibot: "1.5.0"
  },
  packages: {
    "node_modules/@atcute/car": {
      version: "6.1.0",
      integrity: "sha512-Dp7MlyI3YT7NiIUK6bm2ZyA95Pdun+DuFlcr40ZsGdqhOkKrctZT7wMZXSs6IYd7RorjSnddEJDh51hqrkNSPQ==",
      dependencies: {
        "@atcute/cbor": "^2.3.8",
        "@atcute/cid": "^2.5.0",
        "@atcute/uint8array": "^1.2.0",
        "@atcute/varint": "^2.0.2"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.0.0"
      }
    },
    "node_modules/@atcute/cbor": {
      version: "2.3.8",
      integrity: "sha512-gazXBcNTr2U3cRaCjfRbq2GKHJnWapUUA3mgehL+0tbVXEty2wf/LIwF9z46gjqjX2DYGGwkybF8lTI3dzHaNQ==",
      dependencies: {
        "@atcute/cid": "^2.5.0",
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.2.0"
      },
      peerDependencies: {
        "@atcute/cid": "^2.5.0"
      }
    },
    "node_modules/@atcute/cid": {
      version: "2.5.0",
      integrity: "sha512-CAZyzUdaQhuC+S7tGjoC7vgyDI2X4JU+CPO/7WjEU7HlNsAGXjSkD++5TlfnSWGDqUeqpjMZjUfFBZYHKzPHew==",
      dependencies: {
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.2.0"
      }
    },
    "node_modules/@atcute/crypto": {
      version: "2.4.4",
      integrity: "sha512-Yc7lXz4ndDjbs+/WrKeGS+sVEr+sx8xi5zSVInKNl0FAEY6KbvcT+bjaU9A3erUVviFp9yEcu/1aSg/f+GPpBg==",
      dependencies: {
        "@noble/secp256k1": "^3.1.0",
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.1.5"
      }
    },
    "node_modules/@atcute/did-plc": {
      version: "1.0.2",
      integrity: "sha512-z/gltUzhSeHN2LKosOsU5Fo8uS4p7c7oDydEDQcFK2DwM1u1jHghc5kYaKOQcriOcLXzf9/OetKQOU4P57uhVA==",
      dependencies: {
        "@atcute/cbor": "^2.3.7",
        "@atcute/cid": "^2.4.2",
        "@atcute/crypto": "^2.4.4",
        "@atcute/identity": "^2.0.2",
        "@atcute/lexicons": "^2.1.0",
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.1.5",
        "@atcute/util-fetch": "^2.0.2",
        valibot: "^1.5.0"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.0.0",
        "@atcute/identity": "^2.0.0",
        "@atcute/lexicons": "^2.0.0"
      }
    },
    "node_modules/@atcute/identity": {
      version: "2.0.2",
      integrity: "sha512-amr/EQceqVtBVmjBK4uUF7nKKYuRttadigpvOcAn4dnO6SNSwSjQi8KDH9LnukEotPsSP4UDsQvNfHWEoUcslw==",
      dependencies: {
        valibot: "^1.4.2",
        "@atcute/lexicons": "^2.0.3"
      },
      peerDependencies: {
        "@atcute/lexicons": "^2.0.0"
      }
    },
    "node_modules/@atcute/lexicons": {
      version: "2.1.1",
      integrity: "sha512-kHyqUW8g/Fq9LTctGh0TVBx0AmtecV6VSrRprrSbqKqHe9q8C6y+YPL3EMNq2l93XA1iDHkkvYwLdTcKL/lNbA==",
      dependencies: {
        "@atcute/uint8array": "^1.1.5",
        "@atcute/util-text": "^1.3.4",
        "@oomfware/eval": "^0.1.0",
        "@standard-schema/spec": "^1.1.0",
        "esm-env": "^1.2.2"
      }
    },
    "node_modules/@atcute/mst": {
      version: "1.1.1",
      integrity: "sha512-QWoW69Pg5RWrc0B98Cp5K4UjeXI+2vzBrWmoBUW4nSR51LsamOnG9HsWovcOoCRhnj1ZYAMlnAc5Eh8+gJFoSA==",
      dependencies: {
        "@atcute/cbor": "^2.3.8",
        "@atcute/cid": "^2.5.0",
        "@atcute/uint8array": "^1.2.0"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.5.0"
      }
    },
    "node_modules/@atcute/multibase": {
      version: "1.2.5",
      integrity: "sha512-cReTONgYpQo/VHD3ZmzPNoyBKJgSk1J4h//cvvdVVJBMar+SjlQ/sUXeTjQfuyfmDKv+TLKhmutLcvbMcQ9Rvw==",
      dependencies: {
        "@atcute/uint8array": "^1.1.5"
      }
    },
    "node_modules/@atcute/repo": {
      version: "1.1.0",
      integrity: "sha512-WXOh05E/NT39oqkNm3xIit4ysJIZxmkQ1GWOkwDNvTYIDW0CYqwThQ+837r72/Tr490E1Zvz09xOOjtx/XmlhA==",
      dependencies: {
        "@atcute/car": "^6.1.0",
        "@atcute/cbor": "^2.3.8",
        "@atcute/cid": "^2.5.0",
        "@atcute/crypto": "^2.4.4",
        "@atcute/lexicons": "^2.1.1",
        "@atcute/mst": "^1.1.1",
        "@atcute/uint8array": "^1.2.0"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.5.0",
        "@atcute/lexicons": "^2.0.0"
      }
    },
    "node_modules/@atcute/uint8array": {
      version: "1.2.0",
      integrity: "sha512-KoBGTbV4lS8zXNu91osM3FecrH3NUnxNPsBAkaNtn6uf/p240245qoLn7keFpRM0npX522X8R+XBBb2rvtE7Rg=="
    },
    "node_modules/@atcute/util-fetch": {
      version: "2.0.2",
      integrity: "sha512-I0oenHlJjwRpWPyAJojox5H0z9NthhdMFaEjtkxyjo85VPPxk1vMJk/1ZjMJsrs1SgHhB3spazEWzV5DW8w70A==",
      dependencies: {
        valibot: "^1.4.2"
      }
    },
    "node_modules/@atcute/util-text": {
      version: "1.3.4",
      integrity: "sha512-u2UAM7iSM09sQaSG9jtxWFSPgB8boVj50/BoyMvYnhVgGBu+nXIuAcdDUQCsZA44YZgTPPhN/b86JX+jH7SPzQ==",
      dependencies: {
        "unicode-segmenter": "^0.17.0"
      }
    },
    "node_modules/@atcute/util-text/node_modules/unicode-segmenter": {
      version: "0.17.3",
      integrity: "sha512-hKZwqBjJDmqNrq1+LjDxck1qLzJFcLLJM2Xq92ORRHOuau6GSHeELmn+uyk6zNH1CK9mogrUJGP9WJCJUQXMAw=="
    },
    "node_modules/@atcute/varint": {
      version: "2.0.2",
      integrity: "sha512-/+hS1juMgnmf6eL6lICUkTw7wcGTo3I+Q0L1PI521mUz77rGSC6nXAUNKtvm2wYJpuWdEGq+GILGoYkOArn0TQ=="
    },
    "node_modules/@atproto-labs/did-resolver": {
      version: "0.2.6",
      integrity: "sha512-2K1bC04nI2fmgNcvof+yA28IhGlpWn2JKYlPa7To9JTKI45FINCGkQSGiL2nyXlyzDJJ34fZ1aq6/IRFIOIiqg==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto-labs/fetch": "0.2.3",
        "@atproto-labs/pipe": "0.1.1",
        "@atproto-labs/simple-store": "0.3.0",
        "@atproto-labs/simple-store-memory": "0.1.4",
        "@atproto/did": "0.3.0"
      }
    },
    "node_modules/@atproto-labs/fetch": {
      version: "0.2.3",
      integrity: "sha512-NZtbJOCbxKUFRFKMpamT38PUQMY0hX0p7TG5AEYOPhZKZEP7dHZ1K2s1aB8MdVH0qxmqX7nQleNrrvLf09Zfdw==",
      dependencies: {
        "@atproto-labs/pipe": "0.1.1"
      }
    },
    "node_modules/@atproto-labs/fetch-node": {
      version: "0.4.0",
      integrity: "sha512-5Yi8fz/JDGEoObRgRJuglcodB/MJeQnnoqokOGSQK5ItISObSttbGIgHE1UMU1njcwxbvKtbGMWHUCRgqML2Dw==",
      dependencies: {
        "ipaddr.js": "^2.1.0",
        undici_v6: "npm:undici@^6.x",
        undici_v7: "npm:undici@^7.x",
        undici_v8: "npm:undici@^8.x",
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4"
      }
    },
    "node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      }
    },
    "node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw=="
    },
    "node_modules/@atproto-labs/handle-resolver": {
      version: "0.4.10",
      integrity: "sha512-hsYYvGhi6Tv6f4Fti//i/vllVIb/wrJaOcbT3Yh7oo10VxBKAyxzVaB7mIJcho2YJ5kHd2kbCYYPWLw8pvm/bg==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6",
        "@atproto-labs/simple-store": "^0.5.1"
      }
    },
    "node_modules/@atproto-labs/handle-resolver-node": {
      version: "0.2.11",
      integrity: "sha512-stwXuolGIs8ULdLRCwr616A4268CP2jTYOKZOlR7rzMLKjMNaxYVFktbqWUtqKq1nqdqaKxSk+MZNTFrqCjaHQ==",
      dependencies: {
        "@atproto-labs/handle-resolver": "^0.4.10",
        "@atproto-labs/fetch-node": "^0.4.0",
        "@atproto/did": "^0.5.6"
      }
    },
    "node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did": {
      version: "0.5.6",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg=="
    },
    "node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      dependencies: {
        "lru-cache": "^10.2.0",
        "@atproto-labs/simple-store": "^0.5.1"
      }
    },
    "node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did": {
      version: "0.5.6",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto-labs/identity-resolver": {
      version: "0.4.10",
      integrity: "sha512-deKu7csOsM8lnIRnLa97te6ODIUx0Lm3Srxid/Ix+UYQqFKA0sIpfYmHZduAK7B+aTqiPcHjoA9Y/qpJyzgnMw==",
      dependencies: {
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto-labs/handle-resolver": "^0.4.10"
      }
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6"
      }
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      }
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw=="
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg=="
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      dependencies: {
        "lru-cache": "^10.2.0",
        "@atproto-labs/simple-store": "^0.5.1"
      }
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did": {
      version: "0.5.6",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto-labs/pipe": {
      version: "0.1.1",
      integrity: "sha512-hdNw2oUs2B6BN1lp+32pF7cp8EMKuIN5Qok2Vvv/aOpG/3tNSJ9YkvfI0k6Zd188LeDDYRUpYpxcoFIcGH/FNg=="
    },
    "node_modules/@atproto-labs/simple-store": {
      version: "0.3.0",
      integrity: "sha512-nOb6ONKBRJHRlukW1sVawUkBqReLlLx6hT35VS3imaNPwiXDxLnTK7lxw3Lrl9k5yugSBDQAkZAq3MPTEFSUBQ=="
    },
    "node_modules/@atproto-labs/simple-store-memory": {
      version: "0.1.4",
      integrity: "sha512-3mKY4dP8I7yKPFj9VKpYyCRzGJOi5CEpOLPlRhoJyLmgs3J4RzDrjn323Oakjz2Aj2JzRU/AIvWRAZVhpYNJHw==",
      dependencies: {
        "lru-cache": "^10.2.0",
        "@atproto-labs/simple-store": "0.3.0"
      }
    },
    "node_modules/@atproto/common": {
      version: "0.5.16",
      integrity: "sha512-DTWgaVlDJN3zDxJ3agZK3pbiSZc+z8QQe9iy15sIuorLrceIp4kHXMO/QqjWBXnmLVTd6+/5BVDzex5amYc0rg==",
      dependencies: {
        multiformats: "^9.9.0",
        pino: "^8.21.0",
        "@atproto/common-web": "^0.4.20",
        "@atproto/lex-cbor": "^0.0.16",
        "@atproto/lex-data": "^0.0.15"
      }
    },
    "node_modules/@atproto/common-web": {
      version: "0.5.10",
      integrity: "sha512-w4JUdsJ3VXt8ewkavYh5m/u0UbxDtFdCKhNZPEpJ0U1vcWIjDaSInIexteETDgD7fBJAhidIEi30MGz1kk49ug==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/lex-data": "^0.1.7",
        "@atproto/lex-json": "^0.1.6",
        "@atproto/syntax": "^0.7.5"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/common-web": {
      version: "0.4.21",
      integrity: "sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/lex-data": "^0.0.15",
        "@atproto/lex-json": "^0.0.16",
        "@atproto/syntax": "^0.5.4"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/lex-cbor": {
      version: "0.0.16",
      integrity: "sha512-x3NTvOX5/4Wh7uk8RNJpUJqZjcWRSUYDYRJ6VZPLmp/CAnsMySmBAinBu/dva/1hqS3C1oiYz258x6bRYpKJ4w==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.15"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/lex-data": {
      version: "0.0.15",
      integrity: "sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/lex-json": {
      version: "0.0.16",
      integrity: "sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.15"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/syntax": {
      version: "0.5.4",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/crypto": {
      version: "0.4.5",
      integrity: "sha512-n40aKkMoCatP0u9Yvhrdk6fXyOHFDDbkdm4h4HCyWW+KlKl8iXfD5iV+ECq+w5BM+QH25aIpt3/j6EUNerhLxw==",
      dependencies: {
        "@noble/curves": "^1.7.0",
        "@noble/hashes": "^1.6.1",
        uint8arrays: "3.0.0"
      }
    },
    "node_modules/@atproto/did": {
      version: "0.3.0",
      integrity: "sha512-raUPzUGegtW/6OxwCmM8bhZvuIMzxG5t9oWsth6Tp91Kb5fTnHV2h/KKNF1C82doeA4BdXCErTyg7ISwLbQkzA==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/jwk": {
      version: "0.7.4",
      integrity: "sha512-tq7TUDmNfe1yDfpRgdGQMJdl9TUlJmREQNCag9yg5w8Evu+TOiFiLgiOCbo7X4ouRPSgd1DpOzXbUa8UyKKMZA==",
      dependencies: {
        multiformats: "^13.0.0",
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/jwk-jose": {
      version: "0.2.4",
      integrity: "sha512-gzDoA0JTwnc0ZJOBLM7WX9xFxtynRS2K1Bofb8epzoMWDQvyvfbPcfkdPrKFM7NXCFUVpGpBnsCB8KFPTf1rCg==",
      dependencies: {
        jose: "^5.2.0",
        "@atproto/jwk": "^0.7.4"
      }
    },
    "node_modules/@atproto/jwk-webcrypto": {
      version: "0.3.4",
      integrity: "sha512-UsFIUozqnRecXPo6HgKV4PW4FqYHxX1V3iAe0rRV6Q2RSfYD8V2mZ89pv8NpvJynnaqJArBQ7HZlcg0F4tRYhA==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/jwk": "^0.7.4",
        "@atproto/jwk-jose": "^0.2.4"
      }
    },
    "node_modules/@atproto/jwk/node_modules/multiformats": {
      version: "13.4.2",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ=="
    },
    "node_modules/@atproto/lex": {
      version: "0.0.18",
      integrity: "sha512-uHqtV2gZNYOkOYXq1t6wO2Nb0gFfGmi40AGCVbTNccIkHsZvxRuLlaNuNrBFB+5h/HzlVeMwjBUf0ny3jD4hXw==",
      dependencies: {
        tslib: "^2.8.1",
        yargs: "^17.0.0",
        "@atproto/lex-builder": "^0.0.16",
        "@atproto/lex-client": "^0.0.13",
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-json": "^0.0.12",
        "@atproto/lex-installer": "^0.0.18",
        "@atproto/lex-schema": "^0.0.13"
      }
    },
    "node_modules/@atproto/lex-builder": {
      version: "0.0.16",
      integrity: "sha512-z9h6kLiifyL0mBVzlHJ3cK3XwhHRttSePmk2XmhQ1gC0tfa7exUhvCMp9YpEv2N5oUVMItl00L8SLBsVsuMMtg==",
      dependencies: {
        prettier: "^3.2.5",
        "ts-morph": "^27.0.0",
        tslib: "^2.8.1",
        "@atproto/lex-document": "^0.0.14",
        "@atproto/lex-schema": "^0.0.13"
      }
    },
    "node_modules/@atproto/lex-cbor": {
      version: "0.0.13",
      integrity: "sha512-63nbzXJnQwV02XGpEa8WZxt7Zu87dnbzrUVL0Mqr55S1EGCzEF9U7Dauc9tKKLoZ88GmYrJN0irBsXtSi0VeWg==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.12"
      }
    },
    "node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-client": {
      version: "0.0.13",
      integrity: "sha512-NftQ9SSIilMFFj99fBlv1hvZ6Oe4Bl+HYn4VkXrWsGrHeOIM3GLgVZSMWAlg33rCvd6bYfb+YnIdPxcV6lCU0g==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-json": "^0.0.12",
        "@atproto/lex-schema": "^0.0.13"
      }
    },
    "node_modules/@atproto/lex-client/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-client/node_modules/@atproto/lex-json": {
      version: "0.0.12",
      integrity: "sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.12"
      }
    },
    "node_modules/@atproto/lex-data": {
      version: "0.1.7",
      integrity: "sha512-kW/dPLqo/WgCLV+XESR4JKwV6c1rZWJGOfuPupZGTjEDAKoBbKXdaEzX9/1vKQYbZ9U3j0DS/n7OFFK7wBugyQ==",
      dependencies: {
        multiformats: "^13.0.0",
        tslib: "^2.8.1",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-data/node_modules/multiformats": {
      version: "13.4.2",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ=="
    },
    "node_modules/@atproto/lex-document": {
      version: "0.0.14",
      integrity: "sha512-BaCSZOZUIv3kQ23b3Lhe4sprJYHc0spSeWS3TLaMoVi6bFZ3RzeM8n7ROTzVP3BTNYxpRHPHtOarx9A8ZAAC4w==",
      dependencies: {
        "core-js": "^3",
        tslib: "^2.8.1",
        "@atproto/lex-schema": "^0.0.13"
      }
    },
    "node_modules/@atproto/lex-installer": {
      version: "0.0.18",
      integrity: "sha512-ukDMHIpoaqk6ph0kFnLsRnYr3TJ+rDsAyVRwTzdiLb29pPYgQHD+3wSMHH/rQ7XXUuPklv4SFBTKLTMeIeEgkg==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-builder": "^0.0.16",
        "@atproto/lex-cbor": "^0.0.13",
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-document": "^0.0.14",
        "@atproto/lex-resolver": "^0.0.15",
        "@atproto/lex-schema": "^0.0.13",
        "@atproto/syntax": "^0.4.3"
      }
    },
    "node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-installer/node_modules/@atproto/syntax": {
      version: "0.4.3",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-json": {
      version: "0.1.6",
      integrity: "sha512-mvrAd0lbyuecIHjyld8QN6MN6CBf4j0GCxLzegsvLh0SvDf+GbYWklkcQqmITL44yFQOwmA/QNIQj0Uvh7+R/g==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.1.7"
      }
    },
    "node_modules/@atproto/lex-resolver": {
      version: "0.0.15",
      integrity: "sha512-oNxcNCts3ReJ+A4hTPthQbPA68yMQ0ZrBUIiUTZwRazrmg/xkV15jtyYSnH4CGBjRdt420MV9aLR2s4qLSmyTQ==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto-labs/did-resolver": "^0.2.6",
        "@atproto/crypto": "^0.4.5",
        "@atproto/lex-client": "^0.0.13",
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-document": "^0.0.14",
        "@atproto/repo": "^0.8.12",
        "@atproto/syntax": "^0.4.3",
        "@atproto/lex-schema": "^0.0.13"
      }
    },
    "node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax": {
      version: "0.4.3",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-schema": {
      version: "0.0.13",
      integrity: "sha512-FeY4YBesEUO4Ey3BJhDRma0cZt6XxunSZPXny5Q/6ltc7pvyJGXXtJ8D7mHl7p5EXPwylEYOQkM6ck4IyfMP0A==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/syntax": "^0.4.3",
        "@atproto/lex-data": "^0.0.12"
      }
    },
    "node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-schema/node_modules/@atproto/syntax": {
      version: "0.4.3",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex/node_modules/@atproto/lex-json": {
      version: "0.0.12",
      integrity: "sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.12"
      }
    },
    "node_modules/@atproto/lexicon": {
      version: "0.7.12",
      integrity: "sha512-bXVWXc2+ctVVUc3CEuWV9mVXRMMQcWmdzmyRE7w2Rli0B36HADU49Vvi7PWTw26zFFqumYVl9b23bW3vrzAzbg==",
      dependencies: {
        multiformats: "^13.0.0",
        zod: "^3.23.8",
        "@atproto/common-web": "^0.5.10",
        "@atproto/syntax": "^0.7.5"
      }
    },
    "node_modules/@atproto/lexicon/node_modules/multiformats": {
      version: "13.4.2",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ=="
    },
    "node_modules/@atproto/oauth-client": {
      version: "0.8.8",
      integrity: "sha512-W2T44dtFRBiHlq21JAnailcR7pjkTIlVoYTSxkXTAiycac97KhiXqKPOOfAu2sjkA3FTnKlMMjdjv4UrtDui+w==",
      dependencies: {
        "core-js": "^3.50.0",
        multiformats: "^13.0.0",
        zod: "^3.23.8",
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto-labs/handle-resolver": "^0.4.10",
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/identity-resolver": "^0.4.10",
        "@atproto/did": "^0.5.6",
        "@atproto/jwk": "^0.7.4",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/xrpc": "^0.8.14",
        "@atproto/oauth-types": "^0.7.7"
      }
    },
    "node_modules/@atproto/oauth-client-browser": {
      version: "0.5.8",
      integrity: "sha512-bAJ/OtpdKHwtMuro6ZAmKQnD8dzV0wv+DydL04lvtMe828xcZmce9gylMZfpG7wF3Br5OaSsqCAVk4m8rEpuSg==",
      dependencies: {
        "core-js": "^3.50.0",
        "@atproto-labs/handle-resolver": "^0.4.10",
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto/did": "^0.5.6",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto/oauth-client": "^0.8.8",
        "@atproto/jwk": "^0.7.4",
        "@atproto/jwk-webcrypto": "^0.3.4",
        "@atproto/oauth-types": "^0.7.7"
      }
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6"
      }
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      }
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw=="
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg=="
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      dependencies: {
        "lru-cache": "^10.2.0",
        "@atproto-labs/simple-store": "^0.5.1"
      }
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did": {
      version: "0.5.6",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/oauth-client-node": {
      version: "0.5.8",
      integrity: "sha512-Mhs0JlEiZC3iu0RB1XXjmbFodk8rTtyM+27tNm/2dHkTPdBZTbl7smwOoAXdNpa3rjgR4DlCEBLkTqS9XLsjcQ==",
      dependencies: {
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto-labs/handle-resolver-node": "^0.2.11",
        "@atproto/jwk": "^0.7.4",
        "@atproto/jwk-jose": "^0.2.4",
        "@atproto/did": "^0.5.6",
        "@atproto/oauth-client": "^0.8.8",
        "@atproto/jwk-webcrypto": "^0.3.4",
        "@atproto/oauth-types": "^0.7.7",
        "@atproto-labs/simple-store": "^0.5.1"
      }
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6"
      }
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      }
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw=="
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg=="
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      dependencies: {
        "lru-cache": "^10.2.0",
        "@atproto-labs/simple-store": "^0.5.1"
      }
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto/did": {
      version: "0.5.6",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6"
      }
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      }
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw=="
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg=="
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      dependencies: {
        "lru-cache": "^10.2.0",
        "@atproto-labs/simple-store": "^0.5.1"
      }
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto/did": {
      version: "0.5.6",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/oauth-client/node_modules/multiformats": {
      version: "13.4.2",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ=="
    },
    "node_modules/@atproto/oauth-types": {
      version: "0.7.7",
      integrity: "sha512-HhY0n6BJtFlxHJTOwT34uf7BiMaEluuwiZqHkamWoFvl+Gk7bPgWhPslr4kX2J/7ryFxhdsKVj1tjWjy0AhjTw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/did": "^0.5.6",
        "@atproto/jwk": "^0.7.4"
      }
    },
    "node_modules/@atproto/oauth-types/node_modules/@atproto/did": {
      version: "0.5.6",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/repo": {
      version: "0.8.13",
      integrity: "sha512-VS8XHaBMGdq60xwRI5zQmXzsMF1hU7NKPjmkdr65tJdrv2z0VW77mG01Ui19Xh9O0mUc/LG6GEhwVrabB9Txow==",
      dependencies: {
        "@ipld/dag-cbor": "^7.0.0",
        multiformats: "^9.9.0",
        uint8arrays: "3.0.0",
        varint: "^6.0.0",
        zod: "^3.23.8",
        "@atproto/common": "^0.5.14",
        "@atproto/common-web": "^0.4.18",
        "@atproto/crypto": "^0.4.5",
        "@atproto/lexicon": "^0.6.2"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/common-web": {
      version: "0.4.21",
      integrity: "sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/lex-data": "^0.0.15",
        "@atproto/lex-json": "^0.0.16",
        "@atproto/syntax": "^0.5.4"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/lex-data": {
      version: "0.0.15",
      integrity: "sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/lex-json": {
      version: "0.0.16",
      integrity: "sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.15"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/lexicon": {
      version: "0.6.2",
      integrity: "sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==",
      dependencies: {
        "iso-datestring-validator": "^2.2.2",
        multiformats: "^9.9.0",
        zod: "^3.23.8",
        "@atproto/common-web": "^0.4.18",
        "@atproto/syntax": "^0.5.0"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/syntax": {
      version: "0.5.4",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/syntax": {
      version: "0.7.5",
      integrity: "sha512-6vnLQK8OAzg0dO6z/xnvuXn5zMV0UMI54zbxk7G7BXhGlIlLMb1yo+JVYtAlv8Nxzr+AaFdNZ8AJt+L/QhJMFQ==",
      dependencies: {
        "iso-datestring-validator": "^2.2.2",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/xrpc": {
      version: "0.8.14",
      integrity: "sha512-9r3cGbm6Q35SMzfBGaJiHbb1OlznOpf1PwKj9Q8nrSRh01xGl0GgCUDXe47t3IgFth4WJmnEcY2EbyoJF05WCQ==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/lexicon": "^0.7.15"
      }
    },
    "node_modules/@atproto/xrpc/node_modules/@atproto/common-web": {
      version: "0.5.13",
      integrity: "sha512-TSVba26vsgeYqeE6BKrvomEbzRJPiRkmVfakfJxqoEWAwxrWfvXvKSwGkPIY57kw5g2gHpKxPIM0v+DqarWKEw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/lex-data": "^0.1.7",
        "@atproto/lex-json": "^0.1.6",
        "@atproto/syntax": "^0.7.6"
      }
    },
    "node_modules/@atproto/xrpc/node_modules/@atproto/lexicon": {
      version: "0.7.15",
      integrity: "sha512-VAiXSHY12hqFYevassyVlWXDxs88ya9jS6DhGc93QbxOQbKasy8yWtxzG3oMiSLQaN+hOuqZUw4kSySLZgR2/w==",
      dependencies: {
        multiformats: "^13.0.0",
        zod: "^3.23.8",
        "@atproto/common-web": "^0.5.13",
        "@atproto/syntax": "^0.7.6"
      }
    },
    "node_modules/@atproto/xrpc/node_modules/@atproto/syntax": {
      version: "0.7.6",
      integrity: "sha512-luKQTcWw1H1jLmYvX34ldBqNjz2orF082njmcF9fxbWTqVhsO+TpY0FHRKVPoV7dwL0Y3L16DNz1ma0LFGH25g==",
      dependencies: {
        "iso-datestring-validator": "^2.2.2",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/xrpc/node_modules/multiformats": {
      version: "13.4.2",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ=="
    },
    "node_modules/@inlay/core": {
      version: "0.0.13",
      integrity: "sha512-UO3M3l96+Ed0RikY5SyDCP16yb+ceyYksQ2PLO3PyBZJ8EDvw9CfKIdbsOzraQp3lyUkmhrToJj1GED0tkvi1Q==",
      dependencies: {
        "@atproto/lex": "^0.0.18",
        "@atproto/syntax": "^0.4.3"
      }
    },
    "node_modules/@inlay/core/node_modules/@atproto/syntax": {
      version: "0.4.3",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@inlay/render": {
      version: "0.3.1",
      integrity: "sha512-zlJCvpjFFqAa8dMBbLW5cYZ5w+ARHKej/DoBLRnjnjlXCnrOJyMXCef1J6Pc5a7761+2QhuSvP/1M4TDR+dw3w==",
      dependencies: {
        "@atproto/lexicon": "^0.6.1",
        "@atproto/syntax": "^0.4.3"
      },
      peerDependencies: {
        "@inlay/core": "*"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/common-web": {
      version: "0.4.21",
      integrity: "sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==",
      dependencies: {
        zod: "^3.23.8",
        "@atproto/lex-data": "^0.0.15",
        "@atproto/lex-json": "^0.0.16",
        "@atproto/syntax": "^0.5.4"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax": {
      version: "0.5.4",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lex-data": {
      version: "0.0.15",
      integrity: "sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lex-json": {
      version: "0.0.16",
      integrity: "sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==",
      dependencies: {
        tslib: "^2.8.1",
        "@atproto/lex-data": "^0.0.15"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lexicon": {
      version: "0.6.2",
      integrity: "sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==",
      dependencies: {
        "iso-datestring-validator": "^2.2.2",
        multiformats: "^9.9.0",
        zod: "^3.23.8",
        "@atproto/common-web": "^0.4.18",
        "@atproto/syntax": "^0.5.0"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax": {
      version: "0.5.4",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/syntax": {
      version: "0.4.3",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@ipld/dag-cbor": {
      version: "7.0.3",
      integrity: "sha512-1VVh2huHsuohdXC1bGJNE8WR72slZ9XE2T3wbBBq31dm7ZBatmKLLxrB+XAqafxfRFjv08RZmj/W/ZqaM13AuA==",
      dependencies: {
        cborg: "^1.6.0",
        multiformats: "^9.5.4"
      }
    },
    "node_modules/@noble/curves": {
      version: "1.9.7",
      integrity: "sha512-gbKGcRUYIjA3/zCCNaWDciTMFI0dCkvou3TL8Zmy5Nc7sJ47a0jtOeZoTaMxkuqRo9cRhjOdZJXegxYE5FN/xw==",
      dependencies: {
        "@noble/hashes": "1.8.0"
      }
    },
    "node_modules/@noble/hashes": {
      version: "1.8.0",
      integrity: "sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A=="
    },
    "node_modules/@noble/secp256k1": {
      version: "3.2.0",
      integrity: "sha512-Z3ZAWOTxJ0EuTuZTi7Y69iK7GgrLHh8sgm45lVDhg/b3Nk1TpAiKhick2KkZisHuupeepSkyIydN/J459SdX1w=="
    },
    "node_modules/@oomfware/eval": {
      version: "0.1.0",
      integrity: "sha512-EIkukTd3zDQEHUjcfFRDq79Jgm4OEyUrEUvp/SwgjfoH2POaE5cvaswIonFwdt8fSzJF5xtAdgcgIoKD8sPpjg=="
    },
    "node_modules/@standard-schema/spec": {
      version: "1.1.0",
      integrity: "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w=="
    },
    "node_modules/@ts-morph/common": {
      version: "0.28.1",
      integrity: "sha512-W74iWf7ILp1ZKNYXY5qbddNaml7e9Sedv5lvU1V8lftlitkc9Pq1A+jlH23ltDgWYeZFFEqGCD1Ies9hqu3O+g==",
      dependencies: {
        minimatch: "^10.0.1",
        "path-browserify": "^1.0.1",
        tinyglobby: "^0.2.14"
      }
    },
    "node_modules/abort-controller": {
      version: "3.0.0",
      integrity: "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
      dependencies: {
        "event-target-shim": "^5.0.0"
      }
    },
    "node_modules/ansi-regex": {
      version: "5.0.1",
      integrity: "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ=="
    },
    "node_modules/ansi-styles": {
      version: "4.3.0",
      integrity: "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      dependencies: {
        "color-convert": "^2.0.1"
      }
    },
    "node_modules/atomic-sleep": {
      version: "1.0.0",
      integrity: "sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==",
      dependencies: {}
    },
    "node_modules/balanced-match": {
      version: "4.0.4",
      integrity: "sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA=="
    },
    "node_modules/base64-js": {
      version: "1.5.1",
      integrity: "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA=="
    },
    "node_modules/brace-expansion": {
      version: "5.0.12",
      integrity: "sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==",
      dependencies: {
        "balanced-match": "^4.0.2"
      }
    },
    "node_modules/buffer": {
      version: "6.0.3",
      integrity: "sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==",
      dependencies: {
        "base64-js": "^1.3.1",
        ieee754: "^1.2.1"
      }
    },
    "node_modules/cborg": {
      version: "1.10.2",
      integrity: "sha512-b3tFPA9pUr2zCUiCfRd2+wok2/LBSNUMKOuRRok+WlvvAgEt/PlbgPTsZUcwCOs53IJvLgTp0eotwtosE6njug=="
    },
    "node_modules/cliui": {
      version: "8.0.1",
      integrity: "sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==",
      dependencies: {
        "string-width": "^4.2.0",
        "strip-ansi": "^6.0.1",
        "wrap-ansi": "^7.0.0"
      }
    },
    "node_modules/code-block-writer": {
      version: "13.0.3",
      integrity: "sha512-Oofo0pq3IKnsFtuHqSF7TqBfr71aeyZDVJ0HpmqB7FBM2qEigL0iPONSCZSO9pE9dZTAxANe5XHG9Uy0YMv8cg=="
    },
    "node_modules/color-convert": {
      version: "2.0.1",
      integrity: "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      dependencies: {
        "color-name": "~1.1.4"
      }
    },
    "node_modules/color-name": {
      version: "1.1.4",
      integrity: "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA=="
    },
    "node_modules/core-js": {
      version: "3.50.0",
      integrity: "sha512-BRWgOLKkFeCgRudR6zrs8p9XJZcE14grzKMMssoYrk6krtuEZ7MTKPIY5RzOnqsEKIR9kst7wNzphttraT+Yqw=="
    },
    "node_modules/emoji-regex": {
      version: "8.0.0",
      integrity: "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A=="
    },
    "node_modules/escalade": {
      version: "3.2.0",
      integrity: "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA=="
    },
    "node_modules/esm-env": {
      version: "1.2.2",
      integrity: "sha512-Epxrv+Nr/CaL4ZcFGPJIYLWFom+YeV1DqMLHJoEd9SYRxNbaFruBwfEX/kkHUJf55j2+TUbmDcmuilbP1TmXHA=="
    },
    "node_modules/event-target-shim": {
      version: "5.0.1",
      integrity: "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ=="
    },
    "node_modules/events": {
      version: "3.3.0",
      integrity: "sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q=="
    },
    "node_modules/fast-redact": {
      version: "3.5.0",
      integrity: "sha512-dwsoQlS7h9hMeYUq1W++23NDcBLV4KqONnITDV9DjfS3q1SgDGVrBdvvTLUotWtPSD7asWDV9/CmsZPy8Hf70A=="
    },
    "node_modules/fdir": {
      version: "6.5.0",
      integrity: "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      peerDependencies: {
        picomatch: "^3 || ^4"
      },
      peerDependenciesMeta: {
        picomatch: {
          optional: true
        }
      }
    },
    "node_modules/get-caller-file": {
      version: "2.0.5",
      integrity: "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg=="
    },
    "node_modules/ieee754": {
      version: "1.2.1",
      integrity: "sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA=="
    },
    "node_modules/ipaddr.js": {
      version: "2.5.0",
      integrity: "sha512-aq+t5NAc+cS6rZQQVWC2x98CPqGtKKTMDd4Gaodv0wShnItdKg/51djkGJ1hqH+Oy0ivDftCbSLCQob8zso01w=="
    },
    "node_modules/is-fullwidth-code-point": {
      version: "3.0.0",
      integrity: "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg=="
    },
    "node_modules/iso-datestring-validator": {
      version: "2.2.2",
      integrity: "sha512-yLEMkBbLZTlVQqOnQ4FiMujR6T4DEcCb1xizmvXS+OxuhwcbtynoosRzdMA69zZCShCNAbi+gJ71FxZBBXx1SA=="
    },
    "node_modules/jose": {
      version: "5.10.0",
      integrity: "sha512-s+3Al/p9g32Iq+oqXxkW//7jk2Vig6FF1CFqzVXoTUXt2qz89YWbL+OwS17NFYEvxC35n0FKeGO2LGYSxeM2Gg=="
    },
    "node_modules/jsonata": {
      version: "2.2.2",
      integrity: "sha512-XDFH2PuaAXv0AXJEWwElXbqADmKFGKMLMkFb+qOz0EhjQW2EIJ6pgtordLU+4u3IVERyBfqy6bi6kZKEncvRqA=="
    },
    "node_modules/jsonc-parser": {
      version: "3.3.1",
      integrity: "sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ=="
    },
    "node_modules/lru-cache": {
      version: "10.4.3",
      integrity: "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ=="
    },
    "node_modules/minimatch": {
      version: "10.2.6",
      integrity: "sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==",
      dependencies: {
        "brace-expansion": "^5.0.8"
      }
    },
    "node_modules/multiformats": {
      version: "9.9.0",
      integrity: "sha512-HoMUjhH9T8DDBNT+6xzkrd9ga/XiBI4xLr58LJACwK6G3HTOPeMz4nB4KJs33L2BelrIJa7P0VuNaVF3hMYfjg=="
    },
    "node_modules/on-exit-leak-free": {
      version: "2.1.2",
      integrity: "sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA=="
    },
    "node_modules/path-browserify": {
      version: "1.0.1",
      integrity: "sha512-b7uo2UCUOYZcnF/3ID0lulOJi/bafxa1xPe7ZPsammBSpjSWQkjNxlt635YGS2MiR9GjvuXCtz2emr3jbsz98g==",
      dependencies: {}
    },
    "node_modules/picomatch": {
      version: "4.0.7",
      integrity: "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA=="
    },
    "node_modules/pino": {
      version: "8.21.0",
      integrity: "sha512-ip4qdzjkAyDDZklUaZkcRFb2iA118H9SgRh8yzTkSQK8HilsOJF7rSY8HoW5+I0M46AZgX/pxbprf2vvzQCE0Q==",
      dependencies: {
        "atomic-sleep": "^1.0.0",
        "fast-redact": "^3.1.1",
        "on-exit-leak-free": "^2.1.0",
        "pino-abstract-transport": "^1.2.0",
        "pino-std-serializers": "^6.0.0",
        "process-warning": "^3.0.0",
        "quick-format-unescaped": "^4.0.3",
        "real-require": "^0.2.0",
        "safe-stable-stringify": "^2.3.1",
        "sonic-boom": "^3.7.0",
        "thread-stream": "^2.6.0"
      }
    },
    "node_modules/pino-abstract-transport": {
      version: "1.2.0",
      integrity: "sha512-Guhh8EZfPCfH+PMXAb6rKOjGQEoy0xlAIn+irODG5kgfYV+BQ0rGYYWTIel3P5mmyXqkYkPmdIkywsn6QKUR1Q==",
      dependencies: {
        "readable-stream": "^4.0.0",
        split2: "^4.0.0"
      }
    },
    "node_modules/pino-std-serializers": {
      version: "6.2.2",
      integrity: "sha512-cHjPPsE+vhj/tnhCy/wiMh3M3z3h/j15zHQX+S9GkTBgqJuTuJzYJ4gUyACLhDaJ7kk9ba9iRDmbH2tJU03OiA=="
    },
    "node_modules/prettier": {
      version: "3.9.9",
      integrity: "sha512-Z/CJHIkdujO/OtN7nXUii0Rf3VT5SRuhjBA82Xvu2XhBUgX3nhP67T0LHceBdQLex7OOFGTox+Q5Yg8Jk2Qivg=="
    },
    "node_modules/process": {
      version: "0.11.10",
      integrity: "sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A=="
    },
    "node_modules/process-warning": {
      version: "3.0.0",
      integrity: "sha512-mqn0kFRl0EoqhnL0GQ0veqFHyIN1yig9RHh/InzORTUiZHFRAur+aMtRkELNwGs9aNwKS6tg/An4NYBPGwvtzQ=="
    },
    "node_modules/quick-format-unescaped": {
      version: "4.0.4",
      integrity: "sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==",
      dependencies: {}
    },
    "node_modules/readable-stream": {
      version: "4.7.0",
      integrity: "sha512-oIGGmcpTLwPga8Bn6/Z75SVaH1z5dUut2ibSyAMVhmUggWpmDn2dapB0n7f8nwaSiRtepAsfJyfXIO5DCVAODg==",
      dependencies: {
        "abort-controller": "^3.0.0",
        buffer: "^6.0.3",
        events: "^3.3.0",
        process: "^0.11.10",
        string_decoder: "^1.3.0"
      }
    },
    "node_modules/real-require": {
      version: "0.2.0",
      integrity: "sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg=="
    },
    "node_modules/require-directory": {
      version: "2.1.1",
      integrity: "sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q=="
    },
    "node_modules/safe-buffer": {
      version: "5.2.1",
      integrity: "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ=="
    },
    "node_modules/safe-stable-stringify": {
      version: "2.5.0",
      integrity: "sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA=="
    },
    "node_modules/sonic-boom": {
      version: "3.8.1",
      integrity: "sha512-y4Z8LCDBuum+PBP3lSV7RHrXscqksve/bi0as7mhwVnBW+/wUqKT/2Kb7um8yqcFy0duYbbPxzt89Zy2nOCaxg==",
      dependencies: {
        "atomic-sleep": "^1.0.0"
      }
    },
    "node_modules/split2": {
      version: "4.2.0",
      integrity: "sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg=="
    },
    "node_modules/string-width": {
      version: "4.2.3",
      integrity: "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      dependencies: {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      }
    },
    "node_modules/string_decoder": {
      version: "1.3.0",
      integrity: "sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==",
      dependencies: {
        "safe-buffer": "~5.2.0"
      }
    },
    "node_modules/strip-ansi": {
      version: "6.0.1",
      integrity: "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      dependencies: {
        "ansi-regex": "^5.0.1"
      }
    },
    "node_modules/thread-stream": {
      version: "2.7.0",
      integrity: "sha512-qQiRWsU/wvNolI6tbbCKd9iKaTnCXsTwVxhhKM6nctPdujTyztjlbUkUTUymidWcMnZ5pWR0ej4a0tjsW021vw==",
      dependencies: {
        "real-require": "^0.2.0"
      }
    },
    "node_modules/tinyglobby": {
      version: "0.2.17",
      integrity: "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      dependencies: {
        fdir: "^6.5.0",
        picomatch: "^4.0.4"
      }
    },
    "node_modules/ts-morph": {
      version: "27.0.2",
      integrity: "sha512-fhUhgeljcrdZ+9DZND1De1029PrE+cMkIP7ooqkLRTrRLTqcki2AstsyJm0vRNbTbVCNJ0idGlbBrfqc7/nA8w==",
      dependencies: {
        "@ts-morph/common": "~0.28.1",
        "code-block-writer": "^13.0.3"
      }
    },
    "node_modules/tslib": {
      version: "2.8.1",
      integrity: "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w=="
    },
    "node_modules/uint8arrays": {
      version: "3.0.0",
      integrity: "sha512-HRCx0q6O9Bfbp+HHSfQQKD7wU70+lydKVt4EghkdOvlK/NlrF90z+eXV34mUd48rNvVJXwkrMSPpCATkct8fJA==",
      dependencies: {
        multiformats: "^9.4.2"
      }
    },
    "node_modules/undici_v6": {
      version: "6.29.0",
      integrity: "sha512-R+RODBqp6i2pPflGdq+xIOUkl+RNfGgHwoinecKu/JCuf2uO06cOKoDbI2P7Dn6KcswdKwrczbU6IYJ6K8X+wg=="
    },
    "node_modules/undici_v7": {
      version: "7.30.0",
      integrity: "sha512-dkrQXeHSaoamnItlYbmzG0wFYrM0ZwDxCIg0A7aKjTyyhh9svRzCNFEzV+Vm05/yehjCzjDZ31KXfGEjYSztDQ=="
    },
    "node_modules/undici_v8": {
      version: "8.11.2",
      integrity: "sha512-u4UB2/IrKdU6lFxumHmmo1a3fCQO5tzQllRorfoRS63txhrB7xTpSn1PftwC4qEHkOaqP95fCWW4lJzwErwzhQ=="
    },
    "node_modules/unicode-segmenter": {
      version: "0.14.5",
      integrity: "sha512-jHGmj2LUuqDcX3hqY12Ql+uhUTn8huuxNZGq7GvtF6bSybzH3aFgedYu/KTzQStEgt1Ra2F3HxadNXsNjb3m3g=="
    },
    "node_modules/valibot": {
      version: "1.5.0",
      integrity: "sha512-nil6AkP2TChWL43Z5uJ6GTxX01CUA+g8LWUM+N/rB9NBbkUMaUsi9PUNzlUPgoKASgmx9f7eGOYpJ04/fSa6FQ==",
      peerDependencies: {
        typescript: ">=5"
      },
      peerDependenciesMeta: {
        typescript: {
          optional: true
        }
      }
    },
    "node_modules/varint": {
      version: "6.0.0",
      integrity: "sha512-cXEIW6cfr15lFv563k4GuVuW/fiwjknytD37jIOLSdSWuOI6WnO/oKwmP2FQTU2l01LP8/M5TSAJpzUaGe3uWg=="
    },
    "node_modules/wrap-ansi": {
      version: "7.0.0",
      integrity: "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      dependencies: {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      }
    },
    "node_modules/y18n": {
      version: "5.0.8",
      integrity: "sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA=="
    },
    "node_modules/yargs": {
      version: "17.7.3",
      integrity: "sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==",
      dependencies: {
        cliui: "^8.0.1",
        escalade: "^3.1.1",
        "get-caller-file": "^2.0.5",
        "require-directory": "^2.1.1",
        "string-width": "^4.2.3",
        y18n: "^5.0.5",
        "yargs-parser": "^21.1.1"
      }
    },
    "node_modules/yargs-parser": {
      version: "21.1.1",
      integrity: "sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw=="
    },
    "node_modules/zod": {
      version: "3.25.76",
      integrity: "sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ=="
    }
  },
  buildTools: {
    vite: "8.2.2"
  },
  imports: {
    "#atseq-integrity": {
      "atseq-source": {
        node: "./src/integrity/node.ts",
        default: "./src/integrity/browser.ts"
      },
      node: "./dist/src/integrity/node.js",
      default: "./dist/src/integrity/browser.js"
    }
  },
  nonExecutedPeers: [
    {
      package: "valibot",
      version: "1.5.0",
      peer: "typescript",
      purpose: "optional typechecking only"
    }
  ]
};

// npm-shrinkwrap.json
var npm_shrinkwrap_default = {
  name: "atseq",
  version: "0.1.0",
  lockfileVersion: 3,
  requires: true,
  packages: {
    "": {
      name: "atseq",
      version: "0.1.0",
      bundleDependencies: true,
      license: "Apache-2.0",
      dependencies: {
        "@atcute/car": "6.1.0",
        "@atcute/cbor": "2.3.8",
        "@atcute/cid": "2.5.0",
        "@atcute/crypto": "2.4.4",
        "@atcute/did-plc": "1.0.2",
        "@atcute/mst": "1.1.1",
        "@atcute/multibase": "1.2.5",
        "@atcute/repo": "1.1.0",
        "@atcute/varint": "2.0.2",
        "@atproto-labs/fetch-node": "0.4.0",
        "@atproto/common-web": "0.5.10",
        "@atproto/did": "0.3.0",
        "@atproto/lexicon": "0.7.12",
        "@atproto/oauth-client-browser": "0.5.8",
        "@atproto/oauth-client-node": "0.5.8",
        "@atproto/syntax": "0.7.5",
        "@inlay/core": "0.0.13",
        "@inlay/render": "0.3.1",
        "@noble/secp256k1": "3.2.0",
        jsonata: "2.2.2",
        "jsonc-parser": "3.3.1",
        valibot: "1.5.0"
      },
      bin: {
        atseq: "dist/src/cli/main.js",
        "atseq-host": "dist/src/host/main.js"
      },
      devDependencies: {
        "@ipld/dag-cbor": "7.0.3",
        "@playwright/test": "1.63.0",
        "@types/node": "26.4.1",
        multiformats: "9.9.0",
        prettier: "3.9.9",
        "ts-morph": "27.0.2",
        tsx: "4.23.13",
        typescript: "7.0.2",
        vite: "8.2.2"
      },
      engines: {
        node: ">=22.19"
      }
    },
    "node_modules/@atcute/car": {
      version: "6.1.0",
      resolved: "https://registry.npmjs.org/@atcute/car/-/car-6.1.0.tgz",
      integrity: "sha512-Dp7MlyI3YT7NiIUK6bm2ZyA95Pdun+DuFlcr40ZsGdqhOkKrctZT7wMZXSs6IYd7RorjSnddEJDh51hqrkNSPQ==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/cbor": "^2.3.8",
        "@atcute/cid": "^2.5.0",
        "@atcute/uint8array": "^1.2.0",
        "@atcute/varint": "^2.0.2"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.0.0"
      }
    },
    "node_modules/@atcute/cbor": {
      version: "2.3.8",
      resolved: "https://registry.npmjs.org/@atcute/cbor/-/cbor-2.3.8.tgz",
      integrity: "sha512-gazXBcNTr2U3cRaCjfRbq2GKHJnWapUUA3mgehL+0tbVXEty2wf/LIwF9z46gjqjX2DYGGwkybF8lTI3dzHaNQ==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/cid": "^2.5.0",
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.2.0"
      },
      peerDependencies: {
        "@atcute/cid": "^2.5.0"
      }
    },
    "node_modules/@atcute/cid": {
      version: "2.5.0",
      resolved: "https://registry.npmjs.org/@atcute/cid/-/cid-2.5.0.tgz",
      integrity: "sha512-CAZyzUdaQhuC+S7tGjoC7vgyDI2X4JU+CPO/7WjEU7HlNsAGXjSkD++5TlfnSWGDqUeqpjMZjUfFBZYHKzPHew==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.2.0"
      }
    },
    "node_modules/@atcute/crypto": {
      version: "2.4.4",
      resolved: "https://registry.npmjs.org/@atcute/crypto/-/crypto-2.4.4.tgz",
      integrity: "sha512-Yc7lXz4ndDjbs+/WrKeGS+sVEr+sx8xi5zSVInKNl0FAEY6KbvcT+bjaU9A3erUVviFp9yEcu/1aSg/f+GPpBg==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.1.5",
        "@noble/secp256k1": "^3.1.0"
      }
    },
    "node_modules/@atcute/did-plc": {
      version: "1.0.2",
      resolved: "https://registry.npmjs.org/@atcute/did-plc/-/did-plc-1.0.2.tgz",
      integrity: "sha512-z/gltUzhSeHN2LKosOsU5Fo8uS4p7c7oDydEDQcFK2DwM1u1jHghc5kYaKOQcriOcLXzf9/OetKQOU4P57uhVA==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/cbor": "^2.3.7",
        "@atcute/cid": "^2.4.2",
        "@atcute/crypto": "^2.4.4",
        "@atcute/identity": "^2.0.2",
        "@atcute/lexicons": "^2.1.0",
        "@atcute/multibase": "^1.2.5",
        "@atcute/uint8array": "^1.1.5",
        "@atcute/util-fetch": "^2.0.2",
        valibot: "^1.5.0"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.0.0",
        "@atcute/identity": "^2.0.0",
        "@atcute/lexicons": "^2.0.0"
      }
    },
    "node_modules/@atcute/identity": {
      version: "2.0.2",
      resolved: "https://registry.npmjs.org/@atcute/identity/-/identity-2.0.2.tgz",
      integrity: "sha512-amr/EQceqVtBVmjBK4uUF7nKKYuRttadigpvOcAn4dnO6SNSwSjQi8KDH9LnukEotPsSP4UDsQvNfHWEoUcslw==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/lexicons": "^2.0.3",
        valibot: "^1.4.2"
      },
      peerDependencies: {
        "@atcute/lexicons": "^2.0.0"
      }
    },
    "node_modules/@atcute/lexicons": {
      version: "2.1.1",
      resolved: "https://registry.npmjs.org/@atcute/lexicons/-/lexicons-2.1.1.tgz",
      integrity: "sha512-kHyqUW8g/Fq9LTctGh0TVBx0AmtecV6VSrRprrSbqKqHe9q8C6y+YPL3EMNq2l93XA1iDHkkvYwLdTcKL/lNbA==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/uint8array": "^1.1.5",
        "@atcute/util-text": "^1.3.4",
        "@oomfware/eval": "^0.1.0",
        "@standard-schema/spec": "^1.1.0",
        "esm-env": "^1.2.2"
      }
    },
    "node_modules/@atcute/mst": {
      version: "1.1.1",
      resolved: "https://registry.npmjs.org/@atcute/mst/-/mst-1.1.1.tgz",
      integrity: "sha512-QWoW69Pg5RWrc0B98Cp5K4UjeXI+2vzBrWmoBUW4nSR51LsamOnG9HsWovcOoCRhnj1ZYAMlnAc5Eh8+gJFoSA==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/cbor": "^2.3.8",
        "@atcute/cid": "^2.5.0",
        "@atcute/uint8array": "^1.2.0"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.5.0"
      }
    },
    "node_modules/@atcute/multibase": {
      version: "1.2.5",
      resolved: "https://registry.npmjs.org/@atcute/multibase/-/multibase-1.2.5.tgz",
      integrity: "sha512-cReTONgYpQo/VHD3ZmzPNoyBKJgSk1J4h//cvvdVVJBMar+SjlQ/sUXeTjQfuyfmDKv+TLKhmutLcvbMcQ9Rvw==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/uint8array": "^1.1.5"
      }
    },
    "node_modules/@atcute/repo": {
      version: "1.1.0",
      resolved: "https://registry.npmjs.org/@atcute/repo/-/repo-1.1.0.tgz",
      integrity: "sha512-WXOh05E/NT39oqkNm3xIit4ysJIZxmkQ1GWOkwDNvTYIDW0CYqwThQ+837r72/Tr490E1Zvz09xOOjtx/XmlhA==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "@atcute/car": "^6.1.0",
        "@atcute/cbor": "^2.3.8",
        "@atcute/cid": "^2.5.0",
        "@atcute/crypto": "^2.4.4",
        "@atcute/lexicons": "^2.1.1",
        "@atcute/mst": "^1.1.1",
        "@atcute/uint8array": "^1.2.0"
      },
      peerDependencies: {
        "@atcute/cbor": "^2.0.0",
        "@atcute/cid": "^2.5.0",
        "@atcute/lexicons": "^2.0.0"
      }
    },
    "node_modules/@atcute/uint8array": {
      version: "1.2.0",
      resolved: "https://registry.npmjs.org/@atcute/uint8array/-/uint8array-1.2.0.tgz",
      integrity: "sha512-KoBGTbV4lS8zXNu91osM3FecrH3NUnxNPsBAkaNtn6uf/p240245qoLn7keFpRM0npX522X8R+XBBb2rvtE7Rg==",
      inBundle: true,
      license: "0BSD"
    },
    "node_modules/@atcute/util-fetch": {
      version: "2.0.2",
      resolved: "https://registry.npmjs.org/@atcute/util-fetch/-/util-fetch-2.0.2.tgz",
      integrity: "sha512-I0oenHlJjwRpWPyAJojox5H0z9NthhdMFaEjtkxyjo85VPPxk1vMJk/1ZjMJsrs1SgHhB3spazEWzV5DW8w70A==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        valibot: "^1.4.2"
      }
    },
    "node_modules/@atcute/util-text": {
      version: "1.3.4",
      resolved: "https://registry.npmjs.org/@atcute/util-text/-/util-text-1.3.4.tgz",
      integrity: "sha512-u2UAM7iSM09sQaSG9jtxWFSPgB8boVj50/BoyMvYnhVgGBu+nXIuAcdDUQCsZA44YZgTPPhN/b86JX+jH7SPzQ==",
      inBundle: true,
      license: "0BSD",
      dependencies: {
        "unicode-segmenter": "^0.17.0"
      }
    },
    "node_modules/@atcute/util-text/node_modules/unicode-segmenter": {
      version: "0.17.3",
      resolved: "https://registry.npmjs.org/unicode-segmenter/-/unicode-segmenter-0.17.3.tgz",
      integrity: "sha512-hKZwqBjJDmqNrq1+LjDxck1qLzJFcLLJM2Xq92ORRHOuau6GSHeELmn+uyk6zNH1CK9mogrUJGP9WJCJUQXMAw==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/@atcute/varint": {
      version: "2.0.2",
      resolved: "https://registry.npmjs.org/@atcute/varint/-/varint-2.0.2.tgz",
      integrity: "sha512-/+hS1juMgnmf6eL6lICUkTw7wcGTo3I+Q0L1PI521mUz77rGSC6nXAUNKtvm2wYJpuWdEGq+GILGoYkOArn0TQ==",
      inBundle: true,
      license: "0BSD"
    },
    "node_modules/@atproto-labs/did-resolver": {
      version: "0.2.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.2.6.tgz",
      integrity: "sha512-2K1bC04nI2fmgNcvof+yA28IhGlpWn2JKYlPa7To9JTKI45FINCGkQSGiL2nyXlyzDJJ34fZ1aq6/IRFIOIiqg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto-labs/fetch": "0.2.3",
        "@atproto-labs/pipe": "0.1.1",
        "@atproto-labs/simple-store": "0.3.0",
        "@atproto-labs/simple-store-memory": "0.1.4",
        "@atproto/did": "0.3.0",
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto-labs/fetch": {
      version: "0.2.3",
      resolved: "https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.2.3.tgz",
      integrity: "sha512-NZtbJOCbxKUFRFKMpamT38PUQMY0hX0p7TG5AEYOPhZKZEP7dHZ1K2s1aB8MdVH0qxmqX7nQleNrrvLf09Zfdw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto-labs/pipe": "0.1.1"
      }
    },
    "node_modules/@atproto-labs/fetch-node": {
      version: "0.4.0",
      resolved: "https://registry.npmjs.org/@atproto-labs/fetch-node/-/fetch-node-0.4.0.tgz",
      integrity: "sha512-5Yi8fz/JDGEoObRgRJuglcodB/MJeQnnoqokOGSQK5ItISObSttbGIgHE1UMU1njcwxbvKtbGMWHUCRgqML2Dw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "ipaddr.js": "^2.1.0",
        undici_v6: "npm:undici@^6.x",
        undici_v7: "npm:undici@^7.x",
        undici_v8: "npm:undici@^8.x"
      },
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      },
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      resolved: "https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto-labs/handle-resolver": {
      version: "0.4.10",
      resolved: "https://registry.npmjs.org/@atproto-labs/handle-resolver/-/handle-resolver-0.4.10.tgz",
      integrity: "sha512-hsYYvGhi6Tv6f4Fti//i/vllVIb/wrJaOcbT3Yh7oo10VxBKAyxzVaB7mIJcho2YJ5kHd2kbCYYPWLw8pvm/bg==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/handle-resolver-node": {
      version: "0.2.11",
      resolved: "https://registry.npmjs.org/@atproto-labs/handle-resolver-node/-/handle-resolver-node-0.2.11.tgz",
      integrity: "sha512-stwXuolGIs8ULdLRCwr616A4268CP2jTYOKZOlR7rzMLKjMNaxYVFktbqWUtqKq1nqdqaKxSk+MZNTFrqCjaHQ==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/fetch-node": "^0.4.0",
        "@atproto-labs/handle-resolver": "^0.4.10",
        "@atproto/did": "^0.5.6"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did": {
      version: "0.5.6",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/simple-store": "^0.5.1",
        "lru-cache": "^10.2.0"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did": {
      version: "0.5.6",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/identity-resolver": {
      version: "0.4.10",
      resolved: "https://registry.npmjs.org/@atproto-labs/identity-resolver/-/identity-resolver-0.4.10.tgz",
      integrity: "sha512-deKu7csOsM8lnIRnLa97te6ODIUx0Lm3Srxid/Ix+UYQqFKA0sIpfYmHZduAK7B+aTqiPcHjoA9Y/qpJyzgnMw==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto-labs/handle-resolver": "^0.4.10"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      resolved: "https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      resolved: "https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/simple-store": "^0.5.1",
        "lru-cache": "^10.2.0"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did": {
      version: "0.5.6",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto-labs/pipe": {
      version: "0.1.1",
      resolved: "https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.1.1.tgz",
      integrity: "sha512-hdNw2oUs2B6BN1lp+32pF7cp8EMKuIN5Qok2Vvv/aOpG/3tNSJ9YkvfI0k6Zd188LeDDYRUpYpxcoFIcGH/FNg==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/@atproto-labs/simple-store": {
      version: "0.3.0",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.3.0.tgz",
      integrity: "sha512-nOb6ONKBRJHRlukW1sVawUkBqReLlLx6hT35VS3imaNPwiXDxLnTK7lxw3Lrl9k5yugSBDQAkZAq3MPTEFSUBQ==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/@atproto-labs/simple-store-memory": {
      version: "0.1.4",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.1.4.tgz",
      integrity: "sha512-3mKY4dP8I7yKPFj9VKpYyCRzGJOi5CEpOLPlRhoJyLmgs3J4RzDrjn323Oakjz2Aj2JzRU/AIvWRAZVhpYNJHw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto-labs/simple-store": "0.3.0",
        "lru-cache": "^10.2.0"
      }
    },
    "node_modules/@atproto/common": {
      version: "0.5.16",
      resolved: "https://registry.npmjs.org/@atproto/common/-/common-0.5.16.tgz",
      integrity: "sha512-DTWgaVlDJN3zDxJ3agZK3pbiSZc+z8QQe9iy15sIuorLrceIp4kHXMO/QqjWBXnmLVTd6+/5BVDzex5amYc0rg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/common-web": "^0.4.20",
        "@atproto/lex-cbor": "^0.0.16",
        "@atproto/lex-data": "^0.0.15",
        multiformats: "^9.9.0",
        pino: "^8.21.0"
      },
      engines: {
        node: ">=18.7.0"
      }
    },
    "node_modules/@atproto/common-web": {
      version: "0.5.10",
      resolved: "https://registry.npmjs.org/@atproto/common-web/-/common-web-0.5.10.tgz",
      integrity: "sha512-w4JUdsJ3VXt8ewkavYh5m/u0UbxDtFdCKhNZPEpJ0U1vcWIjDaSInIexteETDgD7fBJAhidIEi30MGz1kk49ug==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.1.7",
        "@atproto/lex-json": "^0.1.6",
        "@atproto/syntax": "^0.7.5",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/common-web": {
      version: "0.4.21",
      resolved: "https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz",
      integrity: "sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.15",
        "@atproto/lex-json": "^0.0.16",
        "@atproto/syntax": "^0.5.4",
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/lex-cbor": {
      version: "0.0.16",
      resolved: "https://registry.npmjs.org/@atproto/lex-cbor/-/lex-cbor-0.0.16.tgz",
      integrity: "sha512-x3NTvOX5/4Wh7uk8RNJpUJqZjcWRSUYDYRJ6VZPLmp/CAnsMySmBAinBu/dva/1hqS3C1oiYz258x6bRYpKJ4w==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.15",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/lex-data": {
      version: "0.0.15",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz",
      integrity: "sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/lex-json": {
      version: "0.0.16",
      resolved: "https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz",
      integrity: "sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.15",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/common/node_modules/@atproto/syntax": {
      version: "0.5.4",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/crypto": {
      version: "0.4.5",
      resolved: "https://registry.npmjs.org/@atproto/crypto/-/crypto-0.4.5.tgz",
      integrity: "sha512-n40aKkMoCatP0u9Yvhrdk6fXyOHFDDbkdm4h4HCyWW+KlKl8iXfD5iV+ECq+w5BM+QH25aIpt3/j6EUNerhLxw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@noble/curves": "^1.7.0",
        "@noble/hashes": "^1.6.1",
        uint8arrays: "3.0.0"
      },
      engines: {
        node: ">=18.7.0"
      }
    },
    "node_modules/@atproto/did": {
      version: "0.3.0",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.3.0.tgz",
      integrity: "sha512-raUPzUGegtW/6OxwCmM8bhZvuIMzxG5t9oWsth6Tp91Kb5fTnHV2h/KKNF1C82doeA4BdXCErTyg7ISwLbQkzA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/jwk": {
      version: "0.7.4",
      resolved: "https://registry.npmjs.org/@atproto/jwk/-/jwk-0.7.4.tgz",
      integrity: "sha512-tq7TUDmNfe1yDfpRgdGQMJdl9TUlJmREQNCag9yg5w8Evu+TOiFiLgiOCbo7X4ouRPSgd1DpOzXbUa8UyKKMZA==",
      license: "MIT",
      dependencies: {
        multiformats: "^13.0.0",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/jwk-jose": {
      version: "0.2.4",
      resolved: "https://registry.npmjs.org/@atproto/jwk-jose/-/jwk-jose-0.2.4.tgz",
      integrity: "sha512-gzDoA0JTwnc0ZJOBLM7WX9xFxtynRS2K1Bofb8epzoMWDQvyvfbPcfkdPrKFM7NXCFUVpGpBnsCB8KFPTf1rCg==",
      license: "MIT",
      dependencies: {
        "@atproto/jwk": "^0.7.4",
        jose: "^5.2.0"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/jwk-webcrypto": {
      version: "0.3.4",
      resolved: "https://registry.npmjs.org/@atproto/jwk-webcrypto/-/jwk-webcrypto-0.3.4.tgz",
      integrity: "sha512-UsFIUozqnRecXPo6HgKV4PW4FqYHxX1V3iAe0rRV6Q2RSfYD8V2mZ89pv8NpvJynnaqJArBQ7HZlcg0F4tRYhA==",
      license: "MIT",
      dependencies: {
        "@atproto/jwk": "^0.7.4",
        "@atproto/jwk-jose": "^0.2.4",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/jwk/node_modules/multiformats": {
      version: "13.4.2",
      resolved: "https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==",
      license: "Apache-2.0 OR MIT",
      inBundle: true
    },
    "node_modules/@atproto/lex": {
      version: "0.0.18",
      resolved: "https://registry.npmjs.org/@atproto/lex/-/lex-0.0.18.tgz",
      integrity: "sha512-uHqtV2gZNYOkOYXq1t6wO2Nb0gFfGmi40AGCVbTNccIkHsZvxRuLlaNuNrBFB+5h/HzlVeMwjBUf0ny3jD4hXw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-builder": "^0.0.16",
        "@atproto/lex-client": "^0.0.13",
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-installer": "^0.0.18",
        "@atproto/lex-json": "^0.0.12",
        "@atproto/lex-schema": "^0.0.13",
        tslib: "^2.8.1",
        yargs: "^17.0.0"
      },
      bin: {
        lex: "bin/lex",
        "ts-lex": "bin/lex"
      }
    },
    "node_modules/@atproto/lex-builder": {
      version: "0.0.16",
      resolved: "https://registry.npmjs.org/@atproto/lex-builder/-/lex-builder-0.0.16.tgz",
      integrity: "sha512-z9h6kLiifyL0mBVzlHJ3cK3XwhHRttSePmk2XmhQ1gC0tfa7exUhvCMp9YpEv2N5oUVMItl00L8SLBsVsuMMtg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-document": "^0.0.14",
        "@atproto/lex-schema": "^0.0.13",
        prettier: "^3.2.5",
        "ts-morph": "^27.0.0",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-cbor": {
      version: "0.0.13",
      resolved: "https://registry.npmjs.org/@atproto/lex-cbor/-/lex-cbor-0.0.13.tgz",
      integrity: "sha512-63nbzXJnQwV02XGpEa8WZxt7Zu87dnbzrUVL0Mqr55S1EGCzEF9U7Dauc9tKKLoZ88GmYrJN0irBsXtSi0VeWg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.12",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-client": {
      version: "0.0.13",
      resolved: "https://registry.npmjs.org/@atproto/lex-client/-/lex-client-0.0.13.tgz",
      integrity: "sha512-NftQ9SSIilMFFj99fBlv1hvZ6Oe4Bl+HYn4VkXrWsGrHeOIM3GLgVZSMWAlg33rCvd6bYfb+YnIdPxcV6lCU0g==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-json": "^0.0.12",
        "@atproto/lex-schema": "^0.0.13",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-client/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-client/node_modules/@atproto/lex-json": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.12.tgz",
      integrity: "sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.12",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-data": {
      version: "0.1.7",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.1.7.tgz",
      integrity: "sha512-kW/dPLqo/WgCLV+XESR4JKwV6c1rZWJGOfuPupZGTjEDAKoBbKXdaEzX9/1vKQYbZ9U3j0DS/n7OFFK7wBugyQ==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^13.0.0",
        tslib: "^2.8.1",
        "unicode-segmenter": "^0.14.0"
      },
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto/lex-data/node_modules/multiformats": {
      version: "13.4.2",
      resolved: "https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==",
      inBundle: true,
      license: "Apache-2.0 OR MIT"
    },
    "node_modules/@atproto/lex-document": {
      version: "0.0.14",
      resolved: "https://registry.npmjs.org/@atproto/lex-document/-/lex-document-0.0.14.tgz",
      integrity: "sha512-BaCSZOZUIv3kQ23b3Lhe4sprJYHc0spSeWS3TLaMoVi6bFZ3RzeM8n7ROTzVP3BTNYxpRHPHtOarx9A8ZAAC4w==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-schema": "^0.0.13",
        "core-js": "^3",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-installer": {
      version: "0.0.18",
      resolved: "https://registry.npmjs.org/@atproto/lex-installer/-/lex-installer-0.0.18.tgz",
      integrity: "sha512-ukDMHIpoaqk6ph0kFnLsRnYr3TJ+rDsAyVRwTzdiLb29pPYgQHD+3wSMHH/rQ7XXUuPklv4SFBTKLTMeIeEgkg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-builder": "^0.0.16",
        "@atproto/lex-cbor": "^0.0.13",
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-document": "^0.0.14",
        "@atproto/lex-resolver": "^0.0.15",
        "@atproto/lex-schema": "^0.0.13",
        "@atproto/syntax": "^0.4.3",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-installer/node_modules/@atproto/syntax": {
      version: "0.4.3",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-json": {
      version: "0.1.6",
      resolved: "https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.1.6.tgz",
      integrity: "sha512-mvrAd0lbyuecIHjyld8QN6MN6CBf4j0GCxLzegsvLh0SvDf+GbYWklkcQqmITL44yFQOwmA/QNIQj0Uvh7+R/g==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.1.7",
        tslib: "^2.8.1"
      },
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto/lex-resolver": {
      version: "0.0.15",
      resolved: "https://registry.npmjs.org/@atproto/lex-resolver/-/lex-resolver-0.0.15.tgz",
      integrity: "sha512-oNxcNCts3ReJ+A4hTPthQbPA68yMQ0ZrBUIiUTZwRazrmg/xkV15jtyYSnH4CGBjRdt420MV9aLR2s4qLSmyTQ==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto-labs/did-resolver": "^0.2.6",
        "@atproto/crypto": "^0.4.5",
        "@atproto/lex-client": "^0.0.13",
        "@atproto/lex-data": "^0.0.12",
        "@atproto/lex-document": "^0.0.14",
        "@atproto/lex-schema": "^0.0.13",
        "@atproto/repo": "^0.8.12",
        "@atproto/syntax": "^0.4.3",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax": {
      version: "0.4.3",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-schema": {
      version: "0.0.13",
      resolved: "https://registry.npmjs.org/@atproto/lex-schema/-/lex-schema-0.0.13.tgz",
      integrity: "sha512-FeY4YBesEUO4Ey3BJhDRma0cZt6XxunSZPXny5Q/6ltc7pvyJGXXtJ8D7mHl7p5EXPwylEYOQkM6ck4IyfMP0A==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.12",
        "@atproto/syntax": "^0.4.3",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex-schema/node_modules/@atproto/syntax": {
      version: "0.4.3",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lex/node_modules/@atproto/lex-data": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz",
      integrity: "sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/lex/node_modules/@atproto/lex-json": {
      version: "0.0.12",
      resolved: "https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.12.tgz",
      integrity: "sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.12",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/lexicon": {
      version: "0.7.12",
      resolved: "https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.7.12.tgz",
      integrity: "sha512-bXVWXc2+ctVVUc3CEuWV9mVXRMMQcWmdzmyRE7w2Rli0B36HADU49Vvi7PWTw26zFFqumYVl9b23bW3vrzAzbg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/common-web": "^0.5.10",
        "@atproto/syntax": "^0.7.5",
        multiformats: "^13.0.0",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto/lexicon/node_modules/multiformats": {
      version: "13.4.2",
      resolved: "https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==",
      inBundle: true,
      license: "Apache-2.0 OR MIT"
    },
    "node_modules/@atproto/oauth-client": {
      version: "0.8.8",
      resolved: "https://registry.npmjs.org/@atproto/oauth-client/-/oauth-client-0.8.8.tgz",
      integrity: "sha512-W2T44dtFRBiHlq21JAnailcR7pjkTIlVoYTSxkXTAiycac97KhiXqKPOOfAu2sjkA3FTnKlMMjdjv4UrtDui+w==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/handle-resolver": "^0.4.10",
        "@atproto-labs/identity-resolver": "^0.4.10",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6",
        "@atproto/jwk": "^0.7.4",
        "@atproto/oauth-types": "^0.7.7",
        "@atproto/xrpc": "^0.8.14",
        "core-js": "^3.50.0",
        multiformats: "^13.0.0",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-browser": {
      version: "0.5.8",
      resolved: "https://registry.npmjs.org/@atproto/oauth-client-browser/-/oauth-client-browser-0.5.8.tgz",
      integrity: "sha512-bAJ/OtpdKHwtMuro6ZAmKQnD8dzV0wv+DydL04lvtMe828xcZmce9gylMZfpG7wF3Br5OaSsqCAVk4m8rEpuSg==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto-labs/handle-resolver": "^0.4.10",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto/did": "^0.5.6",
        "@atproto/jwk": "^0.7.4",
        "@atproto/jwk-webcrypto": "^0.3.4",
        "@atproto/oauth-client": "^0.8.8",
        "@atproto/oauth-types": "^0.7.7",
        "core-js": "^3.50.0"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      resolved: "https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      resolved: "https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/simple-store": "^0.5.1",
        "lru-cache": "^10.2.0"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did": {
      version: "0.5.6",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-node": {
      version: "0.5.8",
      resolved: "https://registry.npmjs.org/@atproto/oauth-client-node/-/oauth-client-node-0.5.8.tgz",
      integrity: "sha512-Mhs0JlEiZC3iu0RB1XXjmbFodk8rTtyM+27tNm/2dHkTPdBZTbl7smwOoAXdNpa3rjgR4DlCEBLkTqS9XLsjcQ==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/did-resolver": "^0.3.10",
        "@atproto-labs/handle-resolver-node": "^0.2.11",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto/did": "^0.5.6",
        "@atproto/jwk": "^0.7.4",
        "@atproto/jwk-jose": "^0.2.4",
        "@atproto/jwk-webcrypto": "^0.3.4",
        "@atproto/oauth-client": "^0.8.8",
        "@atproto/oauth-types": "^0.7.7"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      resolved: "https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      resolved: "https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/simple-store": "^0.5.1",
        "lru-cache": "^10.2.0"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client-node/node_modules/@atproto/did": {
      version: "0.5.6",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver": {
      version: "0.3.10",
      resolved: "https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz",
      integrity: "sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/fetch": "^0.3.6",
        "@atproto-labs/pipe": "^0.2.4",
        "@atproto-labs/simple-store": "^0.5.1",
        "@atproto-labs/simple-store-memory": "^0.2.6",
        "@atproto/did": "^0.5.6",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch": {
      version: "0.3.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz",
      integrity: "sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/pipe": "^0.2.4"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe": {
      version: "0.2.4",
      resolved: "https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz",
      integrity: "sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store": {
      version: "0.5.1",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz",
      integrity: "sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==",
      license: "MIT",
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory": {
      version: "0.2.6",
      resolved: "https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz",
      integrity: "sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==",
      license: "MIT",
      dependencies: {
        "@atproto-labs/simple-store": "^0.5.1",
        "lru-cache": "^10.2.0"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client/node_modules/@atproto/did": {
      version: "0.5.6",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-client/node_modules/multiformats": {
      version: "13.4.2",
      resolved: "https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==",
      license: "Apache-2.0 OR MIT",
      inBundle: true
    },
    "node_modules/@atproto/oauth-types": {
      version: "0.7.7",
      resolved: "https://registry.npmjs.org/@atproto/oauth-types/-/oauth-types-0.7.7.tgz",
      integrity: "sha512-HhY0n6BJtFlxHJTOwT34uf7BiMaEluuwiZqHkamWoFvl+Gk7bPgWhPslr4kX2J/7ryFxhdsKVj1tjWjy0AhjTw==",
      license: "MIT",
      dependencies: {
        "@atproto/did": "^0.5.6",
        "@atproto/jwk": "^0.7.4",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/oauth-types/node_modules/@atproto/did": {
      version: "0.5.6",
      resolved: "https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz",
      integrity: "sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==",
      license: "MIT",
      dependencies: {
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/repo": {
      version: "0.8.13",
      resolved: "https://registry.npmjs.org/@atproto/repo/-/repo-0.8.13.tgz",
      integrity: "sha512-VS8XHaBMGdq60xwRI5zQmXzsMF1hU7NKPjmkdr65tJdrv2z0VW77mG01Ui19Xh9O0mUc/LG6GEhwVrabB9Txow==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/common": "^0.5.14",
        "@atproto/common-web": "^0.4.18",
        "@atproto/crypto": "^0.4.5",
        "@atproto/lexicon": "^0.6.2",
        "@ipld/dag-cbor": "^7.0.0",
        multiformats: "^9.9.0",
        uint8arrays: "3.0.0",
        varint: "^6.0.0",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=18.7.0"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/common-web": {
      version: "0.4.21",
      resolved: "https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz",
      integrity: "sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.15",
        "@atproto/lex-json": "^0.0.16",
        "@atproto/syntax": "^0.5.4",
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/lex-data": {
      version: "0.0.15",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz",
      integrity: "sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/lex-json": {
      version: "0.0.16",
      resolved: "https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz",
      integrity: "sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.15",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/lexicon": {
      version: "0.6.2",
      resolved: "https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.6.2.tgz",
      integrity: "sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/common-web": "^0.4.18",
        "@atproto/syntax": "^0.5.0",
        "iso-datestring-validator": "^2.2.2",
        multiformats: "^9.9.0",
        zod: "^3.23.8"
      }
    },
    "node_modules/@atproto/repo/node_modules/@atproto/syntax": {
      version: "0.5.4",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@atproto/syntax": {
      version: "0.7.5",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.7.5.tgz",
      integrity: "sha512-6vnLQK8OAzg0dO6z/xnvuXn5zMV0UMI54zbxk7G7BXhGlIlLMb1yo+JVYtAlv8Nxzr+AaFdNZ8AJt+L/QhJMFQ==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "iso-datestring-validator": "^2.2.2",
        tslib: "^2.8.1"
      },
      engines: {
        node: ">=22"
      }
    },
    "node_modules/@atproto/xrpc": {
      version: "0.8.14",
      resolved: "https://registry.npmjs.org/@atproto/xrpc/-/xrpc-0.8.14.tgz",
      integrity: "sha512-9r3cGbm6Q35SMzfBGaJiHbb1OlznOpf1PwKj9Q8nrSRh01xGl0GgCUDXe47t3IgFth4WJmnEcY2EbyoJF05WCQ==",
      license: "MIT",
      dependencies: {
        "@atproto/lexicon": "^0.7.15",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/xrpc/node_modules/@atproto/common-web": {
      version: "0.5.13",
      resolved: "https://registry.npmjs.org/@atproto/common-web/-/common-web-0.5.13.tgz",
      integrity: "sha512-TSVba26vsgeYqeE6BKrvomEbzRJPiRkmVfakfJxqoEWAwxrWfvXvKSwGkPIY57kw5g2gHpKxPIM0v+DqarWKEw==",
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.1.7",
        "@atproto/lex-json": "^0.1.6",
        "@atproto/syntax": "^0.7.6",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/xrpc/node_modules/@atproto/lexicon": {
      version: "0.7.15",
      resolved: "https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.7.15.tgz",
      integrity: "sha512-VAiXSHY12hqFYevassyVlWXDxs88ya9jS6DhGc93QbxOQbKasy8yWtxzG3oMiSLQaN+hOuqZUw4kSySLZgR2/w==",
      license: "MIT",
      dependencies: {
        "@atproto/common-web": "^0.5.13",
        "@atproto/syntax": "^0.7.6",
        multiformats: "^13.0.0",
        zod: "^3.23.8"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/xrpc/node_modules/@atproto/syntax": {
      version: "0.7.6",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.7.6.tgz",
      integrity: "sha512-luKQTcWw1H1jLmYvX34ldBqNjz2orF082njmcF9fxbWTqVhsO+TpY0FHRKVPoV7dwL0Y3L16DNz1ma0LFGH25g==",
      license: "MIT",
      dependencies: {
        "iso-datestring-validator": "^2.2.2",
        tslib: "^2.8.1"
      },
      engines: {
        node: ">=22"
      },
      inBundle: true
    },
    "node_modules/@atproto/xrpc/node_modules/multiformats": {
      version: "13.4.2",
      resolved: "https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz",
      integrity: "sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==",
      license: "Apache-2.0 OR MIT",
      inBundle: true
    },
    "node_modules/@esbuild/aix-ppc64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
      integrity: "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
      cpu: ["ppc64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["aix"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
      integrity: "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
      cpu: ["arm"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["android"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
      integrity: "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["android"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
      integrity: "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["android"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
      integrity: "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["darwin"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
      integrity: "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["darwin"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
      integrity: "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["freebsd"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
      integrity: "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["freebsd"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
      integrity: "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
      cpu: ["arm"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
      integrity: "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
      integrity: "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
      cpu: ["ia32"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
      integrity: "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
      cpu: ["loong64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
      integrity: "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
      cpu: ["mips64el"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
      integrity: "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
      cpu: ["ppc64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
      integrity: "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
      cpu: ["riscv64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
      integrity: "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
      cpu: ["s390x"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
      integrity: "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
      integrity: "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["netbsd"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
      integrity: "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["netbsd"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
      integrity: "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["openbsd"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
      integrity: "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["openbsd"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
      integrity: "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["openharmony"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
      integrity: "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["sunos"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
      integrity: "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["win32"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
      integrity: "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
      cpu: ["ia32"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["win32"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
      integrity: "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["win32"],
      engines: {
        node: ">=18"
      }
    },
    "node_modules/@inlay/core": {
      version: "0.0.13",
      resolved: "https://registry.npmjs.org/@inlay/core/-/core-0.0.13.tgz",
      integrity: "sha512-UO3M3l96+Ed0RikY5SyDCP16yb+ceyYksQ2PLO3PyBZJ8EDvw9CfKIdbsOzraQp3lyUkmhrToJj1GED0tkvi1Q==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex": "^0.0.18",
        "@atproto/syntax": "^0.4.3"
      }
    },
    "node_modules/@inlay/core/node_modules/@atproto/syntax": {
      version: "0.4.3",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@inlay/render": {
      version: "0.3.1",
      resolved: "https://registry.npmjs.org/@inlay/render/-/render-0.3.1.tgz",
      integrity: "sha512-zlJCvpjFFqAa8dMBbLW5cYZ5w+ARHKej/DoBLRnjnjlXCnrOJyMXCef1J6Pc5a7761+2QhuSvP/1M4TDR+dw3w==",
      inBundle: true,
      dependencies: {
        "@atproto/lexicon": "^0.6.1",
        "@atproto/syntax": "^0.4.3"
      },
      peerDependencies: {
        "@inlay/core": "*"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/common-web": {
      version: "0.4.21",
      resolved: "https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz",
      integrity: "sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.15",
        "@atproto/lex-json": "^0.0.16",
        "@atproto/syntax": "^0.5.4",
        zod: "^3.23.8"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax": {
      version: "0.5.4",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lex-data": {
      version: "0.0.15",
      resolved: "https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz",
      integrity: "sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.9.0",
        tslib: "^2.8.1",
        uint8arrays: "3.0.0",
        "unicode-segmenter": "^0.14.0"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lex-json": {
      version: "0.0.16",
      resolved: "https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz",
      integrity: "sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/lex-data": "^0.0.15",
        tslib: "^2.8.1"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lexicon": {
      version: "0.6.2",
      resolved: "https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.6.2.tgz",
      integrity: "sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@atproto/common-web": "^0.4.18",
        "@atproto/syntax": "^0.5.0",
        "iso-datestring-validator": "^2.2.2",
        multiformats: "^9.9.0",
        zod: "^3.23.8"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax": {
      version: "0.5.4",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz",
      integrity: "sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@inlay/render/node_modules/@atproto/syntax": {
      version: "0.4.3",
      resolved: "https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz",
      integrity: "sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        tslib: "^2.8.1"
      }
    },
    "node_modules/@ipld/dag-cbor": {
      version: "7.0.3",
      resolved: "https://registry.npmjs.org/@ipld/dag-cbor/-/dag-cbor-7.0.3.tgz",
      integrity: "sha512-1VVh2huHsuohdXC1bGJNE8WR72slZ9XE2T3wbBBq31dm7ZBatmKLLxrB+XAqafxfRFjv08RZmj/W/ZqaM13AuA==",
      inBundle: true,
      license: "(Apache-2.0 AND MIT)",
      dependencies: {
        cborg: "^1.6.0",
        multiformats: "^9.5.4"
      }
    },
    "node_modules/@noble/curves": {
      version: "1.9.7",
      resolved: "https://registry.npmjs.org/@noble/curves/-/curves-1.9.7.tgz",
      integrity: "sha512-gbKGcRUYIjA3/zCCNaWDciTMFI0dCkvou3TL8Zmy5Nc7sJ47a0jtOeZoTaMxkuqRo9cRhjOdZJXegxYE5FN/xw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@noble/hashes": "1.8.0"
      },
      engines: {
        node: "^14.21.3 || >=16"
      },
      funding: {
        url: "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@noble/hashes": {
      version: "1.8.0",
      resolved: "https://registry.npmjs.org/@noble/hashes/-/hashes-1.8.0.tgz",
      integrity: "sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: "^14.21.3 || >=16"
      },
      funding: {
        url: "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@noble/secp256k1": {
      version: "3.2.0",
      resolved: "https://registry.npmjs.org/@noble/secp256k1/-/secp256k1-3.2.0.tgz",
      integrity: "sha512-Z3ZAWOTxJ0EuTuZTi7Y69iK7GgrLHh8sgm45lVDhg/b3Nk1TpAiKhick2KkZisHuupeepSkyIydN/J459SdX1w==",
      inBundle: true,
      license: "MIT",
      funding: {
        url: "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@oomfware/eval": {
      version: "0.1.0",
      resolved: "https://registry.npmjs.org/@oomfware/eval/-/eval-0.1.0.tgz",
      integrity: "sha512-EIkukTd3zDQEHUjcfFRDq79Jgm4OEyUrEUvp/SwgjfoH2POaE5cvaswIonFwdt8fSzJF5xtAdgcgIoKD8sPpjg==",
      inBundle: true,
      license: "0BSD"
    },
    "node_modules/@oxc-project/types": {
      version: "0.148.0",
      resolved: "https://registry.npmjs.org/@oxc-project/types/-/types-0.148.0.tgz",
      integrity: "sha512-Nm4s/jB+4FpFsPhWGEC4h7rzksesmtnMXomo6rCMcg/b8zLQuOziRgkCS1fxDCXOlJB/6Q8oABOZ/OP6RIPj9A==",
      dev: true,
      license: "MIT",
      funding: {
        url: "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@playwright/test": {
      version: "1.63.0",
      resolved: "https://registry.npmjs.org/@playwright/test/-/test-1.63.0.tgz",
      integrity: "sha512-oxMK4vllB9RK5NQ2l1pq1IfOf2AvnEuj/vYGDj0H2nMtmtZpKtCwt/l00GEO6xjGfpBNAvjovvYdCm50dRQkpQ==",
      dev: true,
      license: "Apache-2.0",
      dependencies: {
        playwright: "1.63.0"
      },
      bin: {
        playwright: "cli.js"
      },
      engines: {
        node: ">=20"
      }
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.7.tgz",
      integrity: "sha512-EypzgnYCwyVY4NDHKzGmNJT5b+XaQEBniHxsMdeIQLB/tcCzZnhqrzHpZFbX9iaxx+5RiB8caATBtfvZP7zVxQ==",
      cpu: ["arm"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["android"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.7.tgz",
      integrity: "sha512-l17HE9EweWaqJZhuUuNBN/FzM62xw+DECVnJyvMsxn8vJFAGLy5QfLDoYAcronkAN8VxKZHezDpulHDPx95vFw==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["android"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.7.tgz",
      integrity: "sha512-8ED8ELFvHXc6OCETIn4gXObPiaR6bckM/ipXtbzlPVDRMBfEGjCKgO90F9YtfdpDatVx/ZQw7aZ1vUMf/+T3Mw==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["darwin"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.7.tgz",
      integrity: "sha512-/WPripjtiAIZ2tWY7ddijORT0Ujg87wxWW/qcoFVCKAWVDPhtY0xr7Dj0M3GyNGz60jGwTElhro/mkF9dT7dDQ==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["darwin"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.7.tgz",
      integrity: "sha512-14DI4NcqpvbICxSnGLx3PmtDaWqRP/KGSGb6C+JLLVPeZRl6dKdHba3pGsqT3vpdTqhEYIPG0MMQ8c0xYqoJxA==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["freebsd"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.7.tgz",
      integrity: "sha512-bxrWIRvHWQvbJwi+VIie/kDJmQxcNE6xxWwZdqF/ExVAigtHkv54WTLQPb+QsZdnFy18fg7JPfWGL0RH6vwIlQ==",
      cpu: ["arm"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.7.tgz",
      integrity: "sha512-toOY2BChBZyuxU7OYX6Tn389di4IzAqPTycVcci0O7FSfBqzRB3RZn+K5Is6ANf4tmgRd/K1yZTsNTXbkXsnLg==",
      cpu: ["arm64"],
      dev: true,
      libc: ["glibc"],
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.7.tgz",
      integrity: "sha512-lAIXTH/aiLRLxsTgQvfhjo4K1ydWIp00+V0voOr9beb/9ZmkUFrSIb03dXNFRgMNvkE6oGsF10ioQ6UsI+vS5Q==",
      cpu: ["arm64"],
      dev: true,
      libc: ["musl"],
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.7.tgz",
      integrity: "sha512-kdnwS28Pkenp/mZMRwjXXXwxQ7pIsm+bF919LUK93BOyhcLsrVKdP2p9fxpiPNPAbNuch8ypQt0pm2P2LYCAGg==",
      cpu: ["ppc64"],
      dev: true,
      libc: ["glibc"],
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.7.tgz",
      integrity: "sha512-516OdsyLdr5E65paF3yBF55t8mfm9+gmtCsK3xI7XKXIT7EfRlHhxL8K/NR6Hu8BWSgF5+1w74lTL0+nxcc8Qw==",
      cpu: ["s390x"],
      dev: true,
      libc: ["glibc"],
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.7.tgz",
      integrity: "sha512-r8/z8n7GFaYRln3xmP1Cxy0HH/HLM0uBUPkEuSVEfKGDA89M0FsZRZJRSwe/tJjRx+fpH/gjorfhB8tmEbSFLA==",
      cpu: ["x64"],
      dev: true,
      libc: ["glibc"],
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.7.tgz",
      integrity: "sha512-pAsE8iiDxUg1xBqdhrTfg45AVDVpirjz00sblEYClGNNcMnDb+e8beQgqIAw6LvauX/APvgxUnwrgun/YYGBhw==",
      cpu: ["x64"],
      dev: true,
      libc: ["musl"],
      license: "MIT",
      optional: true,
      os: ["linux"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.7.tgz",
      integrity: "sha512-lTcIYmmnQQA8Or/2DatS6oSqcdLHvendjS+zLu+FwgToynWMRSmQdpM65fTANJgIS4mjbMOo5KT2lnT9SAb96w==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["openharmony"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.7.tgz",
      integrity: "sha512-e3Gu3WxbNk/UqQhxqU7YIYO+9ZBvWNz3U+h/qRFosscMFzdRPbXYSaSWgSnklv2fz1TgzBTcti2z35c/7irsHw==",
      cpu: ["arm64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["win32"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.7.tgz",
      integrity: "sha512-W/jg5qoRSqjsEv0+dZi4e687mcHqmVuU0P4fK6qS/xjetW2Gmc1W8j//z5nAeNcC8Ttm0hV46IjcYeuVwYhuiw==",
      cpu: ["x64"],
      dev: true,
      license: "MIT",
      optional: true,
      os: ["win32"],
      engines: {
        node: "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      version: "1.0.1",
      resolved: "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      integrity: "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      dev: true,
      license: "MIT"
    },
    "node_modules/@standard-schema/spec": {
      version: "1.1.0",
      resolved: "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      integrity: "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/@ts-morph/common": {
      version: "0.28.1",
      resolved: "https://registry.npmjs.org/@ts-morph/common/-/common-0.28.1.tgz",
      integrity: "sha512-W74iWf7ILp1ZKNYXY5qbddNaml7e9Sedv5lvU1V8lftlitkc9Pq1A+jlH23ltDgWYeZFFEqGCD1Ies9hqu3O+g==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        minimatch: "^10.0.1",
        "path-browserify": "^1.0.1",
        tinyglobby: "^0.2.14"
      }
    },
    "node_modules/@types/node": {
      version: "26.4.1",
      resolved: "https://registry.npmjs.org/@types/node/-/node-26.4.1.tgz",
      integrity: "sha512-k97ENvZWtvA6yqz5/FS6a7duDgOPEeOQOc2iKS/nY6mX6qJUKtLnWzQS+Xj6tXweyj6ZcTAK2Qecetnvi9nCLA==",
      dev: true,
      license: "MIT",
      dependencies: {
        "undici-types": "~8.3.0"
      }
    },
    "node_modules/@typescript/typescript-aix-ppc64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-aix-ppc64/-/typescript-aix-ppc64-7.0.2.tgz",
      integrity: "sha512-MTKKkWB7p/0E9xi1d1tHtZ5PiLkGEMIq88pK2CubZjOsLtYTLqhgIgi6zepFa+9GHZ6h05NMCkQxGKiPXMxXtQ==",
      cpu: ["ppc64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["aix"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-darwin-arm64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-darwin-arm64/-/typescript-darwin-arm64-7.0.2.tgz",
      integrity: "sha512-gowzar9MwS/aRWp6f3a4KUqzRjAZjOsmGNCM6LcTgXum+dBfgsBVMN+AgvOCCbguXyick6LJhpBszxMebJ8syA==",
      cpu: ["arm64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["darwin"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-darwin-x64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-darwin-x64/-/typescript-darwin-x64-7.0.2.tgz",
      integrity: "sha512-SZ9xZInqApNlNGc9s0W1VSsktYSOe9cFqNOIqmN1Gs8SmkjKZYFt017G4VwPxASInODuAdbTW7sXiFUf893RgA==",
      cpu: ["x64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["darwin"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-freebsd-arm64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-freebsd-arm64/-/typescript-freebsd-arm64-7.0.2.tgz",
      integrity: "sha512-W5NH4y/J0plIIS5b2xvTEkU7JFxyqdMAOgf+Ilhl0vHQXKO5dZoxd+C/jEtq56c4F3wk71RB4BMRQ2XdI+bwYQ==",
      cpu: ["arm64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["freebsd"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-freebsd-x64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-freebsd-x64/-/typescript-freebsd-x64-7.0.2.tgz",
      integrity: "sha512-UMGDx5sTpzNw3WiPebH7l90IWfJggEd+egHt/q6p7/Cm3zqoV7VxkGXt+3DxPIw8CcmvAB0j3sVVfbhX+M4Tpw==",
      cpu: ["x64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["freebsd"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-arm": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-arm/-/typescript-linux-arm-7.0.2.tgz",
      integrity: "sha512-gffT3xPz9sR7j/YJExkyPntrI0P2EP9XbOyWzth2/Gs0RstK+90RBcO0ncXoXy/beYll1SXw846Nf2zdnEz0QQ==",
      cpu: ["arm"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-arm64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-arm64/-/typescript-linux-arm64-7.0.2.tgz",
      integrity: "sha512-Qh4eU4/y3yDjnfjjyPYihMj5/ODIlmt+Bzu17OI+fiSRDW57QmU5SiN63exPRNJPKUzcc1INa1NXdrJ+MqHjUQ==",
      cpu: ["arm64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-loong64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-loong64/-/typescript-linux-loong64-7.0.2.tgz",
      integrity: "sha512-uEHck9i8hoAzXPiYRib1O7miOnz23SxIeVl6F4LXox+qov1K35jHcEW6VHKvZI+pyvl7fZEP4MCU5LYvIq1GuQ==",
      cpu: ["loong64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-mips64el": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-mips64el/-/typescript-linux-mips64el-7.0.2.tgz",
      integrity: "sha512-R4KvAMnE43W5Qeqb0Ly56O3mWMWIAgsMyz36DCaycd5nbg/9kzm0liw3JocfRqyJY0KPmzFjbswozXyW0DnIYA==",
      cpu: ["mips64el"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-ppc64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-ppc64/-/typescript-linux-ppc64-7.0.2.tgz",
      integrity: "sha512-DORx5b3sd/4S7eayxm4FQv+A7CrkUIGRaHiwI8oiHTAI1fAPWhF4J0vAlkC8biAlHSVVwxMQ3tjZ2/DVbnQiiA==",
      cpu: ["ppc64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-riscv64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-riscv64/-/typescript-linux-riscv64-7.0.2.tgz",
      integrity: "sha512-wf0jqEDOjrPRnKwYRyyJDRo11KMbvMFrU+q4zqKyChODBzvlkbhNQfKvLxQCcwTpdDaXSHZTVuh0JoCrKCUMHQ==",
      cpu: ["riscv64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-s390x": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-s390x/-/typescript-linux-s390x-7.0.2.tgz",
      integrity: "sha512-IkwJc3L7yhytWd/ewjyxNDfOmswCm9GWMJT/ue/dU4aZNbwZeYAetq42VyLmsmSjvoX7z74X6ZaYCtzAr0EuGw==",
      cpu: ["s390x"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-x64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-linux-x64/-/typescript-linux-x64-7.0.2.tgz",
      integrity: "sha512-EYdf2cNg7rgCWJnxCdJ+F3V39O8ihb37eHAu1LK8oAFizgTQbPOK7zHHXbPt8rX24COqODXeI3sIf0fCXG7H/A==",
      cpu: ["x64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-netbsd-arm64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-netbsd-arm64/-/typescript-netbsd-arm64-7.0.2.tgz",
      integrity: "sha512-+polYF4MF04aPpO5FTkHran9yUQDSXqy5GiSDKpsll5jy3l3+g9QLhpf39T+ePtefhXLOGrLl0QIjkQP6VnelA==",
      cpu: ["arm64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["netbsd"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-netbsd-x64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-netbsd-x64/-/typescript-netbsd-x64-7.0.2.tgz",
      integrity: "sha512-8YIT0EHM/3dq10ZOVF/A7pc/YSMtbcecct4rWtexrnSCHOPcpC2KTLXfTCR6vDpnSiY12heNb1GiN/wu+T/FyA==",
      cpu: ["x64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["netbsd"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-openbsd-arm64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-openbsd-arm64/-/typescript-openbsd-arm64-7.0.2.tgz",
      integrity: "sha512-APT8+ClYnuYm1u9+kgGXoMj2VzWzcymwh2gNSQVySHfkRDGOTVkoWLjCmOQSaO+PoqQ57B0flRp9SA+7GnnkzQ==",
      cpu: ["arm64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["openbsd"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-openbsd-x64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-openbsd-x64/-/typescript-openbsd-x64-7.0.2.tgz",
      integrity: "sha512-yX7s+Q0Dln0Dt9tEzZsAjXXR/+ytBM7AlglaqyeMPxQszJ1JhlJdZ6jLA+IzldHtflX81em7lDao1xXu+aRRkg==",
      cpu: ["x64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["openbsd"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-sunos-x64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-sunos-x64/-/typescript-sunos-x64-7.0.2.tgz",
      integrity: "sha512-dLJDGaLZ1D4HPQn62u1n8mBDkJREwMsAkCdkwd4Ieqw+x3TUyTsqY0YiBCtE6H6OzzgGk3iuZ3vFWRS+E8/d1g==",
      cpu: ["x64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["sunos"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-win32-arm64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-win32-arm64/-/typescript-win32-arm64-7.0.2.tgz",
      integrity: "sha512-Gyl1Vy6OsWesLzmq+EP0Fb7b4Nid5232AvcA2SFcdYreldpNtYFFofPjnt62y9hQy7VTaZp65ICJjuAQRaVcIQ==",
      cpu: ["arm64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["win32"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-win32-x64": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/@typescript/typescript-win32-x64/-/typescript-win32-x64-7.0.2.tgz",
      integrity: "sha512-0BQ3HkAHHlKLSp1qRvf3SUhGpGsDuhB/jgFw75guyqbxJqEaS0Cw/VFO8i2nHglJUzQCRtMMR/IBAKE3ETMC4g==",
      cpu: ["x64"],
      inBundle: true,
      license: "Apache-2.0",
      optional: true,
      os: ["win32"],
      engines: {
        node: ">=16.20.0"
      }
    },
    "node_modules/abort-controller": {
      version: "3.0.0",
      resolved: "https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz",
      integrity: "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "event-target-shim": "^5.0.0"
      },
      engines: {
        node: ">=6.5"
      }
    },
    "node_modules/ansi-regex": {
      version: "5.0.1",
      resolved: "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      integrity: "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=8"
      }
    },
    "node_modules/ansi-styles": {
      version: "4.3.0",
      resolved: "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      integrity: "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "color-convert": "^2.0.1"
      },
      engines: {
        node: ">=8"
      },
      funding: {
        url: "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/atomic-sleep": {
      version: "1.0.0",
      resolved: "https://registry.npmjs.org/atomic-sleep/-/atomic-sleep-1.0.0.tgz",
      integrity: "sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=8.0.0"
      }
    },
    "node_modules/balanced-match": {
      version: "4.0.4",
      resolved: "https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz",
      integrity: "sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: "18 || 20 || >=22"
      }
    },
    "node_modules/base64-js": {
      version: "1.5.1",
      resolved: "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
      integrity: "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
      funding: [
        {
          type: "github",
          url: "https://github.com/sponsors/feross"
        },
        {
          type: "patreon",
          url: "https://www.patreon.com/feross"
        },
        {
          type: "consulting",
          url: "https://feross.org/support"
        }
      ],
      inBundle: true,
      license: "MIT"
    },
    "node_modules/brace-expansion": {
      version: "5.0.12",
      resolved: "https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz",
      integrity: "sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "balanced-match": "^4.0.2"
      },
      engines: {
        node: "20 || >=22"
      }
    },
    "node_modules/buffer": {
      version: "6.0.3",
      resolved: "https://registry.npmjs.org/buffer/-/buffer-6.0.3.tgz",
      integrity: "sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==",
      funding: [
        {
          type: "github",
          url: "https://github.com/sponsors/feross"
        },
        {
          type: "patreon",
          url: "https://www.patreon.com/feross"
        },
        {
          type: "consulting",
          url: "https://feross.org/support"
        }
      ],
      inBundle: true,
      license: "MIT",
      dependencies: {
        "base64-js": "^1.3.1",
        ieee754: "^1.2.1"
      }
    },
    "node_modules/cborg": {
      version: "1.10.2",
      resolved: "https://registry.npmjs.org/cborg/-/cborg-1.10.2.tgz",
      integrity: "sha512-b3tFPA9pUr2zCUiCfRd2+wok2/LBSNUMKOuRRok+WlvvAgEt/PlbgPTsZUcwCOs53IJvLgTp0eotwtosE6njug==",
      inBundle: true,
      license: "Apache-2.0",
      bin: {
        cborg: "cli.js"
      }
    },
    "node_modules/cliui": {
      version: "8.0.1",
      resolved: "https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz",
      integrity: "sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==",
      inBundle: true,
      license: "ISC",
      dependencies: {
        "string-width": "^4.2.0",
        "strip-ansi": "^6.0.1",
        "wrap-ansi": "^7.0.0"
      },
      engines: {
        node: ">=12"
      }
    },
    "node_modules/code-block-writer": {
      version: "13.0.3",
      resolved: "https://registry.npmjs.org/code-block-writer/-/code-block-writer-13.0.3.tgz",
      integrity: "sha512-Oofo0pq3IKnsFtuHqSF7TqBfr71aeyZDVJ0HpmqB7FBM2qEigL0iPONSCZSO9pE9dZTAxANe5XHG9Uy0YMv8cg==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/color-convert": {
      version: "2.0.1",
      resolved: "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      integrity: "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "color-name": "~1.1.4"
      },
      engines: {
        node: ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      version: "1.1.4",
      resolved: "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      integrity: "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/core-js": {
      version: "3.50.0",
      resolved: "https://registry.npmjs.org/core-js/-/core-js-3.50.0.tgz",
      integrity: "sha512-BRWgOLKkFeCgRudR6zrs8p9XJZcE14grzKMMssoYrk6krtuEZ7MTKPIY5RzOnqsEKIR9kst7wNzphttraT+Yqw==",
      hasInstallScript: true,
      inBundle: true,
      license: "MIT",
      engines: {
        node: "*"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/core-js"
      }
    },
    "node_modules/detect-libc": {
      version: "2.1.2",
      resolved: "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      integrity: "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      dev: true,
      license: "Apache-2.0",
      engines: {
        node: ">=8"
      }
    },
    "node_modules/emoji-regex": {
      version: "8.0.0",
      resolved: "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      integrity: "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/esbuild": {
      version: "0.28.2",
      resolved: "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
      integrity: "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
      dev: true,
      hasInstallScript: true,
      license: "MIT",
      bin: {
        esbuild: "bin/esbuild"
      },
      engines: {
        node: ">=18"
      },
      optionalDependencies: {
        "@esbuild/aix-ppc64": "0.28.2",
        "@esbuild/android-arm": "0.28.2",
        "@esbuild/android-arm64": "0.28.2",
        "@esbuild/android-x64": "0.28.2",
        "@esbuild/darwin-arm64": "0.28.2",
        "@esbuild/darwin-x64": "0.28.2",
        "@esbuild/freebsd-arm64": "0.28.2",
        "@esbuild/freebsd-x64": "0.28.2",
        "@esbuild/linux-arm": "0.28.2",
        "@esbuild/linux-arm64": "0.28.2",
        "@esbuild/linux-ia32": "0.28.2",
        "@esbuild/linux-loong64": "0.28.2",
        "@esbuild/linux-mips64el": "0.28.2",
        "@esbuild/linux-ppc64": "0.28.2",
        "@esbuild/linux-riscv64": "0.28.2",
        "@esbuild/linux-s390x": "0.28.2",
        "@esbuild/linux-x64": "0.28.2",
        "@esbuild/netbsd-arm64": "0.28.2",
        "@esbuild/netbsd-x64": "0.28.2",
        "@esbuild/openbsd-arm64": "0.28.2",
        "@esbuild/openbsd-x64": "0.28.2",
        "@esbuild/openharmony-arm64": "0.28.2",
        "@esbuild/sunos-x64": "0.28.2",
        "@esbuild/win32-arm64": "0.28.2",
        "@esbuild/win32-ia32": "0.28.2",
        "@esbuild/win32-x64": "0.28.2"
      }
    },
    "node_modules/escalade": {
      version: "3.2.0",
      resolved: "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      integrity: "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=6"
      }
    },
    "node_modules/esm-env": {
      version: "1.2.2",
      resolved: "https://registry.npmjs.org/esm-env/-/esm-env-1.2.2.tgz",
      integrity: "sha512-Epxrv+Nr/CaL4ZcFGPJIYLWFom+YeV1DqMLHJoEd9SYRxNbaFruBwfEX/kkHUJf55j2+TUbmDcmuilbP1TmXHA==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/event-target-shim": {
      version: "5.0.1",
      resolved: "https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz",
      integrity: "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=6"
      }
    },
    "node_modules/events": {
      version: "3.3.0",
      resolved: "https://registry.npmjs.org/events/-/events-3.3.0.tgz",
      integrity: "sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=0.8.x"
      }
    },
    "node_modules/fast-redact": {
      version: "3.5.0",
      resolved: "https://registry.npmjs.org/fast-redact/-/fast-redact-3.5.0.tgz",
      integrity: "sha512-dwsoQlS7h9hMeYUq1W++23NDcBLV4KqONnITDV9DjfS3q1SgDGVrBdvvTLUotWtPSD7asWDV9/CmsZPy8Hf70A==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=6"
      }
    },
    "node_modules/fdir": {
      version: "6.5.0",
      resolved: "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      integrity: "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=12.0.0"
      },
      peerDependencies: {
        picomatch: "^3 || ^4"
      },
      peerDependenciesMeta: {
        picomatch: {
          optional: true
        }
      }
    },
    "node_modules/fsevents": {
      version: "2.3.3",
      resolved: "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      integrity: "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      dev: true,
      hasInstallScript: true,
      license: "MIT",
      optional: true,
      os: ["darwin"],
      engines: {
        node: "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/get-caller-file": {
      version: "2.0.5",
      resolved: "https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz",
      integrity: "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==",
      inBundle: true,
      license: "ISC",
      engines: {
        node: "6.* || 8.* || >= 10.*"
      }
    },
    "node_modules/ieee754": {
      version: "1.2.1",
      resolved: "https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz",
      integrity: "sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==",
      funding: [
        {
          type: "github",
          url: "https://github.com/sponsors/feross"
        },
        {
          type: "patreon",
          url: "https://www.patreon.com/feross"
        },
        {
          type: "consulting",
          url: "https://feross.org/support"
        }
      ],
      inBundle: true,
      license: "BSD-3-Clause"
    },
    "node_modules/ipaddr.js": {
      version: "2.5.0",
      resolved: "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-2.5.0.tgz",
      integrity: "sha512-aq+t5NAc+cS6rZQQVWC2x98CPqGtKKTMDd4Gaodv0wShnItdKg/51djkGJ1hqH+Oy0ivDftCbSLCQob8zso01w==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">= 10"
      }
    },
    "node_modules/is-fullwidth-code-point": {
      version: "3.0.0",
      resolved: "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
      integrity: "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=8"
      }
    },
    "node_modules/iso-datestring-validator": {
      version: "2.2.2",
      resolved: "https://registry.npmjs.org/iso-datestring-validator/-/iso-datestring-validator-2.2.2.tgz",
      integrity: "sha512-yLEMkBbLZTlVQqOnQ4FiMujR6T4DEcCb1xizmvXS+OxuhwcbtynoosRzdMA69zZCShCNAbi+gJ71FxZBBXx1SA==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/jose": {
      version: "5.10.0",
      resolved: "https://registry.npmjs.org/jose/-/jose-5.10.0.tgz",
      integrity: "sha512-s+3Al/p9g32Iq+oqXxkW//7jk2Vig6FF1CFqzVXoTUXt2qz89YWbL+OwS17NFYEvxC35n0FKeGO2LGYSxeM2Gg==",
      license: "MIT",
      funding: {
        url: "https://github.com/sponsors/panva"
      },
      inBundle: true
    },
    "node_modules/jsonata": {
      version: "2.2.2",
      resolved: "https://registry.npmjs.org/jsonata/-/jsonata-2.2.2.tgz",
      integrity: "sha512-XDFH2PuaAXv0AXJEWwElXbqADmKFGKMLMkFb+qOz0EhjQW2EIJ6pgtordLU+4u3IVERyBfqy6bi6kZKEncvRqA==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">= 8"
      }
    },
    "node_modules/jsonc-parser": {
      version: "3.3.1",
      resolved: "https://registry.npmjs.org/jsonc-parser/-/jsonc-parser-3.3.1.tgz",
      integrity: "sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/lightningcss": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      integrity: "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      dev: true,
      license: "MPL-2.0",
      dependencies: {
        "detect-libc": "^2.0.3"
      },
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      },
      optionalDependencies: {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      integrity: "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      cpu: ["arm64"],
      dev: true,
      license: "MPL-2.0",
      optional: true,
      os: ["android"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      integrity: "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      cpu: ["arm64"],
      dev: true,
      license: "MPL-2.0",
      optional: true,
      os: ["darwin"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      integrity: "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      cpu: ["x64"],
      dev: true,
      license: "MPL-2.0",
      optional: true,
      os: ["darwin"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      integrity: "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      cpu: ["x64"],
      dev: true,
      license: "MPL-2.0",
      optional: true,
      os: ["freebsd"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      integrity: "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      cpu: ["arm"],
      dev: true,
      license: "MPL-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      integrity: "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      cpu: ["arm64"],
      dev: true,
      libc: ["glibc"],
      license: "MPL-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      integrity: "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      cpu: ["arm64"],
      dev: true,
      libc: ["musl"],
      license: "MPL-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      integrity: "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      cpu: ["x64"],
      dev: true,
      libc: ["glibc"],
      license: "MPL-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      integrity: "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      cpu: ["x64"],
      dev: true,
      libc: ["musl"],
      license: "MPL-2.0",
      optional: true,
      os: ["linux"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      integrity: "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      cpu: ["arm64"],
      dev: true,
      license: "MPL-2.0",
      optional: true,
      os: ["win32"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      version: "1.33.0",
      resolved: "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      integrity: "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      cpu: ["x64"],
      dev: true,
      license: "MPL-2.0",
      optional: true,
      os: ["win32"],
      engines: {
        node: ">= 12.0.0"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/parcel"
      }
    },
    "node_modules/lru-cache": {
      version: "10.4.3",
      resolved: "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      integrity: "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
      inBundle: true,
      license: "ISC"
    },
    "node_modules/minimatch": {
      version: "10.2.6",
      resolved: "https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz",
      integrity: "sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==",
      inBundle: true,
      license: "BlueOak-1.0.0",
      dependencies: {
        "brace-expansion": "^5.0.8"
      },
      engines: {
        node: "18 || 20 || >=22"
      },
      funding: {
        url: "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/multiformats": {
      version: "9.9.0",
      resolved: "https://registry.npmjs.org/multiformats/-/multiformats-9.9.0.tgz",
      integrity: "sha512-HoMUjhH9T8DDBNT+6xzkrd9ga/XiBI4xLr58LJACwK6G3HTOPeMz4nB4KJs33L2BelrIJa7P0VuNaVF3hMYfjg==",
      inBundle: true,
      license: "(Apache-2.0 AND MIT)"
    },
    "node_modules/nanoid": {
      version: "3.3.18",
      resolved: "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
      integrity: "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
      dev: true,
      funding: [
        {
          type: "github",
          url: "https://github.com/sponsors/ai"
        }
      ],
      license: "MIT",
      bin: {
        nanoid: "bin/nanoid.cjs"
      },
      engines: {
        node: "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/on-exit-leak-free": {
      version: "2.1.2",
      resolved: "https://registry.npmjs.org/on-exit-leak-free/-/on-exit-leak-free-2.1.2.tgz",
      integrity: "sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=14.0.0"
      }
    },
    "node_modules/path-browserify": {
      version: "1.0.1",
      resolved: "https://registry.npmjs.org/path-browserify/-/path-browserify-1.0.1.tgz",
      integrity: "sha512-b7uo2UCUOYZcnF/3ID0lulOJi/bafxa1xPe7ZPsammBSpjSWQkjNxlt635YGS2MiR9GjvuXCtz2emr3jbsz98g==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/picocolors": {
      version: "1.1.1",
      resolved: "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      integrity: "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      dev: true,
      license: "ISC"
    },
    "node_modules/picomatch": {
      version: "4.0.7",
      resolved: "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      integrity: "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=12"
      },
      funding: {
        url: "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pino": {
      version: "8.21.0",
      resolved: "https://registry.npmjs.org/pino/-/pino-8.21.0.tgz",
      integrity: "sha512-ip4qdzjkAyDDZklUaZkcRFb2iA118H9SgRh8yzTkSQK8HilsOJF7rSY8HoW5+I0M46AZgX/pxbprf2vvzQCE0Q==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "atomic-sleep": "^1.0.0",
        "fast-redact": "^3.1.1",
        "on-exit-leak-free": "^2.1.0",
        "pino-abstract-transport": "^1.2.0",
        "pino-std-serializers": "^6.0.0",
        "process-warning": "^3.0.0",
        "quick-format-unescaped": "^4.0.3",
        "real-require": "^0.2.0",
        "safe-stable-stringify": "^2.3.1",
        "sonic-boom": "^3.7.0",
        "thread-stream": "^2.6.0"
      },
      bin: {
        pino: "bin.js"
      }
    },
    "node_modules/pino-abstract-transport": {
      version: "1.2.0",
      resolved: "https://registry.npmjs.org/pino-abstract-transport/-/pino-abstract-transport-1.2.0.tgz",
      integrity: "sha512-Guhh8EZfPCfH+PMXAb6rKOjGQEoy0xlAIn+irODG5kgfYV+BQ0rGYYWTIel3P5mmyXqkYkPmdIkywsn6QKUR1Q==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "readable-stream": "^4.0.0",
        split2: "^4.0.0"
      }
    },
    "node_modules/pino-std-serializers": {
      version: "6.2.2",
      resolved: "https://registry.npmjs.org/pino-std-serializers/-/pino-std-serializers-6.2.2.tgz",
      integrity: "sha512-cHjPPsE+vhj/tnhCy/wiMh3M3z3h/j15zHQX+S9GkTBgqJuTuJzYJ4gUyACLhDaJ7kk9ba9iRDmbH2tJU03OiA==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/playwright": {
      version: "1.63.0",
      resolved: "https://registry.npmjs.org/playwright/-/playwright-1.63.0.tgz",
      integrity: "sha512-+7ziBLidS4NaNCdt57SUDT+wYmmd5fmiQejUic/kb+YsYSCPyOOE9sebzMjNmQrsnNpDJqd4WHvV/8lfKfUDUg==",
      dev: true,
      license: "Apache-2.0",
      dependencies: {
        "playwright-core": "1.63.0"
      },
      bin: {
        playwright: "cli.js"
      },
      engines: {
        node: ">=20"
      }
    },
    "node_modules/playwright-core": {
      version: "1.63.0",
      resolved: "https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz",
      integrity: "sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==",
      dev: true,
      license: "Apache-2.0",
      bin: {
        "playwright-core": "cli.js"
      },
      engines: {
        node: ">=20"
      }
    },
    "node_modules/postcss": {
      version: "8.5.28",
      resolved: "https://registry.npmjs.org/postcss/-/postcss-8.5.28.tgz",
      integrity: "sha512-RRuzqDtt5Y9h3quz5hWhK+TPnsmVs6WwSU6LkJMeY4HstUEDuYTG8UJSdawMRzmzAtV+KEoG8N3Qg2qLy5vM/A==",
      dev: true,
      funding: [
        {
          type: "opencollective",
          url: "https://opencollective.com/postcss/"
        },
        {
          type: "tidelift",
          url: "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          type: "github",
          url: "https://github.com/sponsors/ai"
        }
      ],
      license: "MIT",
      dependencies: {
        nanoid: "^3.3.18",
        picocolors: "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      engines: {
        node: "^10 || ^12 || >=14"
      }
    },
    "node_modules/prettier": {
      version: "3.9.9",
      resolved: "https://registry.npmjs.org/prettier/-/prettier-3.9.9.tgz",
      integrity: "sha512-Z/CJHIkdujO/OtN7nXUii0Rf3VT5SRuhjBA82Xvu2XhBUgX3nhP67T0LHceBdQLex7OOFGTox+Q5Yg8Jk2Qivg==",
      inBundle: true,
      license: "MIT",
      bin: {
        prettier: "bin/prettier.cjs"
      },
      engines: {
        node: ">=14"
      },
      funding: {
        url: "https://github.com/prettier/prettier?sponsor=1"
      }
    },
    "node_modules/process": {
      version: "0.11.10",
      resolved: "https://registry.npmjs.org/process/-/process-0.11.10.tgz",
      integrity: "sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">= 0.6.0"
      }
    },
    "node_modules/process-warning": {
      version: "3.0.0",
      resolved: "https://registry.npmjs.org/process-warning/-/process-warning-3.0.0.tgz",
      integrity: "sha512-mqn0kFRl0EoqhnL0GQ0veqFHyIN1yig9RHh/InzORTUiZHFRAur+aMtRkELNwGs9aNwKS6tg/An4NYBPGwvtzQ==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/quick-format-unescaped": {
      version: "4.0.4",
      resolved: "https://registry.npmjs.org/quick-format-unescaped/-/quick-format-unescaped-4.0.4.tgz",
      integrity: "sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/readable-stream": {
      version: "4.7.0",
      resolved: "https://registry.npmjs.org/readable-stream/-/readable-stream-4.7.0.tgz",
      integrity: "sha512-oIGGmcpTLwPga8Bn6/Z75SVaH1z5dUut2ibSyAMVhmUggWpmDn2dapB0n7f8nwaSiRtepAsfJyfXIO5DCVAODg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "abort-controller": "^3.0.0",
        buffer: "^6.0.3",
        events: "^3.3.0",
        process: "^0.11.10",
        string_decoder: "^1.3.0"
      },
      engines: {
        node: "^12.22.0 || ^14.17.0 || >=16.0.0"
      }
    },
    "node_modules/real-require": {
      version: "0.2.0",
      resolved: "https://registry.npmjs.org/real-require/-/real-require-0.2.0.tgz",
      integrity: "sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">= 12.13.0"
      }
    },
    "node_modules/require-directory": {
      version: "2.1.1",
      resolved: "https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz",
      integrity: "sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=0.10.0"
      }
    },
    "node_modules/rolldown": {
      version: "1.2.7",
      resolved: "https://registry.npmjs.org/rolldown/-/rolldown-1.2.7.tgz",
      integrity: "sha512-g0EtLvBjTUB7jhyV0S/TCup3v/XSVl45vUIGbOGU4QPiyjTenCe4mKuFvW9fEgYmS2Fo42AUssRmNuMziXdrig==",
      dev: true,
      license: "MIT",
      dependencies: {
        "@oxc-project/types": "=0.148.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      bin: {
        rolldown: "bin/cli.mjs"
      },
      engines: {
        node: "^20.19.0 || >=22.12.0"
      },
      optionalDependencies: {
        "@rolldown/binding-android-arm-eabi": "1.2.7",
        "@rolldown/binding-android-arm64": "1.2.7",
        "@rolldown/binding-darwin-arm64": "1.2.7",
        "@rolldown/binding-darwin-x64": "1.2.7",
        "@rolldown/binding-freebsd-x64": "1.2.7",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.7",
        "@rolldown/binding-linux-arm64-gnu": "1.2.7",
        "@rolldown/binding-linux-arm64-musl": "1.2.7",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.7",
        "@rolldown/binding-linux-s390x-gnu": "1.2.7",
        "@rolldown/binding-linux-x64-gnu": "1.2.7",
        "@rolldown/binding-linux-x64-musl": "1.2.7",
        "@rolldown/binding-openharmony-arm64": "1.2.7",
        "@rolldown/binding-win32-arm64-msvc": "1.2.7",
        "@rolldown/binding-win32-x64-msvc": "1.2.7"
      }
    },
    "node_modules/safe-buffer": {
      version: "5.2.1",
      resolved: "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      integrity: "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      funding: [
        {
          type: "github",
          url: "https://github.com/sponsors/feross"
        },
        {
          type: "patreon",
          url: "https://www.patreon.com/feross"
        },
        {
          type: "consulting",
          url: "https://feross.org/support"
        }
      ],
      inBundle: true,
      license: "MIT"
    },
    "node_modules/safe-stable-stringify": {
      version: "2.5.0",
      resolved: "https://registry.npmjs.org/safe-stable-stringify/-/safe-stable-stringify-2.5.0.tgz",
      integrity: "sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=10"
      }
    },
    "node_modules/sonic-boom": {
      version: "3.8.1",
      resolved: "https://registry.npmjs.org/sonic-boom/-/sonic-boom-3.8.1.tgz",
      integrity: "sha512-y4Z8LCDBuum+PBP3lSV7RHrXscqksve/bi0as7mhwVnBW+/wUqKT/2Kb7um8yqcFy0duYbbPxzt89Zy2nOCaxg==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "atomic-sleep": "^1.0.0"
      }
    },
    "node_modules/source-map-js": {
      version: "1.2.1",
      resolved: "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      integrity: "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      dev: true,
      license: "BSD-3-Clause",
      engines: {
        node: ">=0.10.0"
      }
    },
    "node_modules/split2": {
      version: "4.2.0",
      resolved: "https://registry.npmjs.org/split2/-/split2-4.2.0.tgz",
      integrity: "sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==",
      inBundle: true,
      license: "ISC",
      engines: {
        node: ">= 10.x"
      }
    },
    "node_modules/string_decoder": {
      version: "1.3.0",
      resolved: "https://registry.npmjs.org/string_decoder/-/string_decoder-1.3.0.tgz",
      integrity: "sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "safe-buffer": "~5.2.0"
      }
    },
    "node_modules/string-width": {
      version: "4.2.3",
      resolved: "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      integrity: "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      engines: {
        node: ">=8"
      }
    },
    "node_modules/strip-ansi": {
      version: "6.0.1",
      resolved: "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      integrity: "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "ansi-regex": "^5.0.1"
      },
      engines: {
        node: ">=8"
      }
    },
    "node_modules/thread-stream": {
      version: "2.7.0",
      resolved: "https://registry.npmjs.org/thread-stream/-/thread-stream-2.7.0.tgz",
      integrity: "sha512-qQiRWsU/wvNolI6tbbCKd9iKaTnCXsTwVxhhKM6nctPdujTyztjlbUkUTUymidWcMnZ5pWR0ej4a0tjsW021vw==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "real-require": "^0.2.0"
      }
    },
    "node_modules/tinyglobby": {
      version: "0.2.17",
      resolved: "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      integrity: "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        fdir: "^6.5.0",
        picomatch: "^4.0.4"
      },
      engines: {
        node: ">=12.0.0"
      },
      funding: {
        url: "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/ts-morph": {
      version: "27.0.2",
      resolved: "https://registry.npmjs.org/ts-morph/-/ts-morph-27.0.2.tgz",
      integrity: "sha512-fhUhgeljcrdZ+9DZND1De1029PrE+cMkIP7ooqkLRTrRLTqcki2AstsyJm0vRNbTbVCNJ0idGlbBrfqc7/nA8w==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "@ts-morph/common": "~0.28.1",
        "code-block-writer": "^13.0.3"
      }
    },
    "node_modules/tslib": {
      version: "2.8.1",
      resolved: "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      integrity: "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      inBundle: true,
      license: "0BSD"
    },
    "node_modules/tsx": {
      version: "4.23.13",
      resolved: "https://registry.npmjs.org/tsx/-/tsx-4.23.13.tgz",
      integrity: "sha512-BL5MGkRln6aDYhb0xbQlEAGw743BaZYWdbWtdJOBriYJboKgUUYCadFp2/FpBBZquBC/ezNBn7wMMPx7FDZUDw==",
      dev: true,
      license: "MIT",
      dependencies: {
        esbuild: "~0.28.0"
      },
      bin: {
        tsx: "dist/cli.mjs"
      },
      engines: {
        node: ">=18.0.0"
      },
      optionalDependencies: {
        fsevents: "~2.3.3"
      }
    },
    "node_modules/typescript": {
      version: "7.0.2",
      resolved: "https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz",
      integrity: "sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==",
      devOptional: true,
      inBundle: true,
      license: "Apache-2.0",
      bin: {
        tsc: "bin/tsc"
      },
      engines: {
        node: ">=16.20.0"
      },
      optionalDependencies: {
        "@typescript/typescript-aix-ppc64": "7.0.2",
        "@typescript/typescript-darwin-arm64": "7.0.2",
        "@typescript/typescript-darwin-x64": "7.0.2",
        "@typescript/typescript-freebsd-arm64": "7.0.2",
        "@typescript/typescript-freebsd-x64": "7.0.2",
        "@typescript/typescript-linux-arm": "7.0.2",
        "@typescript/typescript-linux-arm64": "7.0.2",
        "@typescript/typescript-linux-loong64": "7.0.2",
        "@typescript/typescript-linux-mips64el": "7.0.2",
        "@typescript/typescript-linux-ppc64": "7.0.2",
        "@typescript/typescript-linux-riscv64": "7.0.2",
        "@typescript/typescript-linux-s390x": "7.0.2",
        "@typescript/typescript-linux-x64": "7.0.2",
        "@typescript/typescript-netbsd-arm64": "7.0.2",
        "@typescript/typescript-netbsd-x64": "7.0.2",
        "@typescript/typescript-openbsd-arm64": "7.0.2",
        "@typescript/typescript-openbsd-x64": "7.0.2",
        "@typescript/typescript-sunos-x64": "7.0.2",
        "@typescript/typescript-win32-arm64": "7.0.2",
        "@typescript/typescript-win32-x64": "7.0.2"
      }
    },
    "node_modules/uint8arrays": {
      version: "3.0.0",
      resolved: "https://registry.npmjs.org/uint8arrays/-/uint8arrays-3.0.0.tgz",
      integrity: "sha512-HRCx0q6O9Bfbp+HHSfQQKD7wU70+lydKVt4EghkdOvlK/NlrF90z+eXV34mUd48rNvVJXwkrMSPpCATkct8fJA==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        multiformats: "^9.4.2"
      }
    },
    "node_modules/undici_v6": {
      name: "undici",
      version: "6.29.0",
      resolved: "https://registry.npmjs.org/undici/-/undici-6.29.0.tgz",
      integrity: "sha512-R+RODBqp6i2pPflGdq+xIOUkl+RNfGgHwoinecKu/JCuf2uO06cOKoDbI2P7Dn6KcswdKwrczbU6IYJ6K8X+wg==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=18.17"
      }
    },
    "node_modules/undici_v7": {
      name: "undici",
      version: "7.30.0",
      resolved: "https://registry.npmjs.org/undici/-/undici-7.30.0.tgz",
      integrity: "sha512-dkrQXeHSaoamnItlYbmzG0wFYrM0ZwDxCIg0A7aKjTyyhh9svRzCNFEzV+Vm05/yehjCzjDZ31KXfGEjYSztDQ==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=20.18.1"
      }
    },
    "node_modules/undici_v8": {
      name: "undici",
      version: "8.11.2",
      resolved: "https://registry.npmjs.org/undici/-/undici-8.11.2.tgz",
      integrity: "sha512-u4UB2/IrKdU6lFxumHmmo1a3fCQO5tzQllRorfoRS63txhrB7xTpSn1PftwC4qEHkOaqP95fCWW4lJzwErwzhQ==",
      inBundle: true,
      license: "MIT",
      engines: {
        node: ">=22.19.0"
      }
    },
    "node_modules/undici-types": {
      version: "8.3.0",
      resolved: "https://registry.npmjs.org/undici-types/-/undici-types-8.3.0.tgz",
      integrity: "sha512-j375ScV60dom+YkPFIfTLcOiPxkN/buHz5GobjLhixFuANaNs3C9l4GmrWqejgXWJ7BbJcFYpTEUkS1Ge8bpZQ==",
      dev: true,
      license: "MIT"
    },
    "node_modules/unicode-segmenter": {
      version: "0.14.5",
      resolved: "https://registry.npmjs.org/unicode-segmenter/-/unicode-segmenter-0.14.5.tgz",
      integrity: "sha512-jHGmj2LUuqDcX3hqY12Ql+uhUTn8huuxNZGq7GvtF6bSybzH3aFgedYu/KTzQStEgt1Ra2F3HxadNXsNjb3m3g==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/valibot": {
      version: "1.5.0",
      resolved: "https://registry.npmjs.org/valibot/-/valibot-1.5.0.tgz",
      integrity: "sha512-nil6AkP2TChWL43Z5uJ6GTxX01CUA+g8LWUM+N/rB9NBbkUMaUsi9PUNzlUPgoKASgmx9f7eGOYpJ04/fSa6FQ==",
      inBundle: true,
      license: "MIT",
      peerDependencies: {
        typescript: ">=5"
      },
      peerDependenciesMeta: {
        typescript: {
          optional: true
        }
      }
    },
    "node_modules/varint": {
      version: "6.0.0",
      resolved: "https://registry.npmjs.org/varint/-/varint-6.0.0.tgz",
      integrity: "sha512-cXEIW6cfr15lFv563k4GuVuW/fiwjknytD37jIOLSdSWuOI6WnO/oKwmP2FQTU2l01LP8/M5TSAJpzUaGe3uWg==",
      inBundle: true,
      license: "MIT"
    },
    "node_modules/vite": {
      version: "8.2.2",
      resolved: "https://registry.npmjs.org/vite/-/vite-8.2.2.tgz",
      integrity: "sha512-cFKLV/PRgAUlIRm5WjMjJ86jrftzpqcgH+Us+DS8mI3CDNiH30Whrz8uHL3+MOLPAgqbMBAqWdAHAphOAM+z/Q==",
      dev: true,
      license: "MIT",
      dependencies: {
        lightningcss: "^1.33.0",
        picomatch: "^4.0.5",
        postcss: "^8.5.26",
        rolldown: "~1.2.4",
        tinyglobby: "^0.2.17"
      },
      bin: {
        vite: "bin/vite.js"
      },
      engines: {
        node: "^20.19.0 || >=22.12.0"
      },
      funding: {
        url: "https://github.com/vitejs/vite?sponsor=1"
      },
      optionalDependencies: {
        fsevents: "~2.3.3"
      },
      peerDependencies: {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.4.0 || ^0.5.0",
        esbuild: "^0.27.0 || ^0.28.0",
        jiti: ">=1.21.0",
        less: "^4.0.0",
        sass: "^1.70.0",
        "sass-embedded": "^1.70.0",
        stylus: ">=0.54.8",
        sugarss: "^5.0.0",
        terser: "^5.16.0",
        tsx: "^4.8.1",
        yaml: "^2.4.2"
      },
      peerDependenciesMeta: {
        "@types/node": {
          optional: true
        },
        "@vitejs/devtools": {
          optional: true
        },
        esbuild: {
          optional: true
        },
        jiti: {
          optional: true
        },
        less: {
          optional: true
        },
        sass: {
          optional: true
        },
        "sass-embedded": {
          optional: true
        },
        stylus: {
          optional: true
        },
        sugarss: {
          optional: true
        },
        terser: {
          optional: true
        },
        tsx: {
          optional: true
        },
        yaml: {
          optional: true
        }
      }
    },
    "node_modules/wrap-ansi": {
      version: "7.0.0",
      resolved: "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      integrity: "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      engines: {
        node: ">=10"
      },
      funding: {
        url: "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/y18n": {
      version: "5.0.8",
      resolved: "https://registry.npmjs.org/y18n/-/y18n-5.0.8.tgz",
      integrity: "sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==",
      inBundle: true,
      license: "ISC",
      engines: {
        node: ">=10"
      }
    },
    "node_modules/yargs": {
      version: "17.7.3",
      resolved: "https://registry.npmjs.org/yargs/-/yargs-17.7.3.tgz",
      integrity: "sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==",
      inBundle: true,
      license: "MIT",
      dependencies: {
        cliui: "^8.0.1",
        escalade: "^3.1.1",
        "get-caller-file": "^2.0.5",
        "require-directory": "^2.1.1",
        "string-width": "^4.2.3",
        y18n: "^5.0.5",
        "yargs-parser": "^21.1.1"
      },
      engines: {
        node: ">=12"
      }
    },
    "node_modules/yargs-parser": {
      version: "21.1.1",
      resolved: "https://registry.npmjs.org/yargs-parser/-/yargs-parser-21.1.1.tgz",
      integrity: "sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==",
      inBundle: true,
      license: "ISC",
      engines: {
        node: ">=12"
      }
    },
    "node_modules/zod": {
      version: "3.25.76",
      resolved: "https://registry.npmjs.org/zod/-/zod-3.25.76.tgz",
      integrity: "sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==",
      inBundle: true,
      license: "MIT",
      funding: {
        url: "https://github.com/sponsors/colinhacks"
      }
    }
  }
};

// dist/src/core/dependency-peers.js
var NON_EXECUTED_PEERS = Object.freeze([
  Object.freeze({ package: "valibot", version: "1.5.0", peer: "typescript", purpose: "optional typechecking only" })
]);

// dist/src/core/dependencies.js
var installed = [
  ["node_modules/@atcute/car", package_default2],
  ["node_modules/@atcute/cbor", package_default3],
  ["node_modules/@atcute/cid", package_default4],
  ["node_modules/@atcute/crypto", package_default5],
  ["node_modules/@atcute/did-plc", package_default6],
  ["node_modules/@atcute/identity", package_default7],
  ["node_modules/@atcute/lexicons", package_default8],
  ["node_modules/@atcute/mst", package_default9],
  ["node_modules/@atcute/multibase", package_default10],
  ["node_modules/@atcute/repo", package_default11],
  ["node_modules/@atcute/uint8array", package_default12],
  ["node_modules/@atcute/util-fetch", package_default13],
  ["node_modules/@atcute/util-text", package_default14],
  ["node_modules/@atcute/util-text/node_modules/unicode-segmenter", package_default15],
  ["node_modules/@atcute/varint", package_default16],
  ["node_modules/@atproto-labs/did-resolver", package_default17],
  ["node_modules/@atproto-labs/fetch", package_default18],
  ["node_modules/@atproto-labs/fetch-node", package_default19],
  ["node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch", package_default20],
  ["node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe", package_default21],
  ["node_modules/@atproto-labs/handle-resolver", package_default22],
  ["node_modules/@atproto-labs/handle-resolver-node", package_default23],
  ["node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did", package_default24],
  ["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store", package_default25],
  ["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory", package_default26],
  ["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did", package_default27],
  ["node_modules/@atproto-labs/identity-resolver", package_default28],
  ["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver", package_default29],
  ["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch", package_default30],
  ["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe", package_default31],
  ["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store", package_default32],
  ["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory", package_default33],
  ["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did", package_default34],
  ["node_modules/@atproto-labs/pipe", package_default35],
  ["node_modules/@atproto-labs/simple-store", package_default36],
  ["node_modules/@atproto-labs/simple-store-memory", package_default37],
  ["node_modules/@atproto/common", package_default38],
  ["node_modules/@atproto/common-web", package_default39],
  ["node_modules/@atproto/common/node_modules/@atproto/common-web", package_default40],
  ["node_modules/@atproto/common/node_modules/@atproto/lex-cbor", package_default41],
  ["node_modules/@atproto/common/node_modules/@atproto/lex-data", package_default42],
  ["node_modules/@atproto/common/node_modules/@atproto/lex-json", package_default43],
  ["node_modules/@atproto/common/node_modules/@atproto/syntax", package_default44],
  ["node_modules/@atproto/crypto", package_default45],
  ["node_modules/@atproto/did", package_default46],
  ["node_modules/@atproto/jwk", package_default47],
  ["node_modules/@atproto/jwk-jose", package_default48],
  ["node_modules/@atproto/jwk-webcrypto", package_default49],
  ["node_modules/@atproto/jwk/node_modules/multiformats", package_default50],
  ["node_modules/@atproto/lex", package_default51],
  ["node_modules/@atproto/lex-builder", package_default52],
  ["node_modules/@atproto/lex-cbor", package_default53],
  ["node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data", package_default54],
  ["node_modules/@atproto/lex-client", package_default55],
  ["node_modules/@atproto/lex-client/node_modules/@atproto/lex-data", package_default56],
  ["node_modules/@atproto/lex-client/node_modules/@atproto/lex-json", package_default57],
  ["node_modules/@atproto/lex-data", package_default58],
  ["node_modules/@atproto/lex-data/node_modules/multiformats", package_default59],
  ["node_modules/@atproto/lex-document", package_default60],
  ["node_modules/@atproto/lex-installer", package_default61],
  ["node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data", package_default62],
  ["node_modules/@atproto/lex-installer/node_modules/@atproto/syntax", package_default63],
  ["node_modules/@atproto/lex-json", package_default64],
  ["node_modules/@atproto/lex-resolver", package_default65],
  ["node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data", package_default66],
  ["node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax", package_default67],
  ["node_modules/@atproto/lex-schema", package_default68],
  ["node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data", package_default69],
  ["node_modules/@atproto/lex-schema/node_modules/@atproto/syntax", package_default70],
  ["node_modules/@atproto/lex/node_modules/@atproto/lex-data", package_default71],
  ["node_modules/@atproto/lex/node_modules/@atproto/lex-json", package_default72],
  ["node_modules/@atproto/lexicon", package_default73],
  ["node_modules/@atproto/lexicon/node_modules/multiformats", package_default74],
  ["node_modules/@atproto/oauth-client", package_default75],
  ["node_modules/@atproto/oauth-client-browser", package_default76],
  ["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver", package_default77],
  ["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch", package_default78],
  ["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe", package_default79],
  ["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store", package_default80],
  ["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory", package_default81],
  ["node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did", package_default82],
  ["node_modules/@atproto/oauth-client-node", package_default83],
  ["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver", package_default84],
  ["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch", package_default85],
  ["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe", package_default86],
  ["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store", package_default87],
  ["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory", package_default88],
  ["node_modules/@atproto/oauth-client-node/node_modules/@atproto/did", package_default89],
  ["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver", package_default90],
  ["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch", package_default91],
  ["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe", package_default92],
  ["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store", package_default93],
  ["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory", package_default94],
  ["node_modules/@atproto/oauth-client/node_modules/@atproto/did", package_default95],
  ["node_modules/@atproto/oauth-client/node_modules/multiformats", package_default96],
  ["node_modules/@atproto/oauth-types", package_default97],
  ["node_modules/@atproto/oauth-types/node_modules/@atproto/did", package_default98],
  ["node_modules/@atproto/repo", package_default99],
  ["node_modules/@atproto/repo/node_modules/@atproto/common-web", package_default100],
  ["node_modules/@atproto/repo/node_modules/@atproto/lex-data", package_default101],
  ["node_modules/@atproto/repo/node_modules/@atproto/lex-json", package_default102],
  ["node_modules/@atproto/repo/node_modules/@atproto/lexicon", package_default103],
  ["node_modules/@atproto/repo/node_modules/@atproto/syntax", package_default104],
  ["node_modules/@atproto/syntax", package_default105],
  ["node_modules/@atproto/xrpc", package_default106],
  ["node_modules/@atproto/xrpc/node_modules/@atproto/common-web", package_default107],
  ["node_modules/@atproto/xrpc/node_modules/@atproto/lexicon", package_default108],
  ["node_modules/@atproto/xrpc/node_modules/@atproto/syntax", package_default109],
  ["node_modules/@atproto/xrpc/node_modules/multiformats", package_default110],
  ["node_modules/@inlay/core", package_default111],
  ["node_modules/@inlay/core/node_modules/@atproto/syntax", package_default112],
  ["node_modules/@inlay/render", package_default113],
  ["node_modules/@inlay/render/node_modules/@atproto/common-web", package_default114],
  ["node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax", package_default115],
  ["node_modules/@inlay/render/node_modules/@atproto/lex-data", package_default116],
  ["node_modules/@inlay/render/node_modules/@atproto/lex-json", package_default117],
  ["node_modules/@inlay/render/node_modules/@atproto/lexicon", package_default118],
  ["node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax", package_default119],
  ["node_modules/@inlay/render/node_modules/@atproto/syntax", package_default120],
  ["node_modules/@ipld/dag-cbor", package_default121],
  ["node_modules/@noble/curves", package_default122],
  ["node_modules/@noble/hashes", package_default123],
  ["node_modules/@noble/secp256k1", package_default124],
  ["node_modules/@oomfware/eval", package_default125],
  ["node_modules/@standard-schema/spec", package_default126],
  ["node_modules/@ts-morph/common", package_default127],
  ["node_modules/abort-controller", package_default128],
  ["node_modules/ansi-regex", package_default129],
  ["node_modules/ansi-styles", package_default130],
  ["node_modules/atomic-sleep", package_default131],
  ["node_modules/balanced-match", package_default132],
  ["node_modules/base64-js", package_default133],
  ["node_modules/brace-expansion", package_default134],
  ["node_modules/buffer", package_default135],
  ["node_modules/cborg", package_default136],
  ["node_modules/cliui", package_default137],
  ["node_modules/code-block-writer", package_default138],
  ["node_modules/color-convert", package_default139],
  ["node_modules/color-name", package_default140],
  ["node_modules/core-js", package_default141],
  ["node_modules/emoji-regex", package_default142],
  ["node_modules/escalade", package_default143],
  ["node_modules/esm-env", package_default144],
  ["node_modules/event-target-shim", package_default145],
  ["node_modules/events", package_default146],
  ["node_modules/fast-redact", package_default147],
  ["node_modules/fdir", package_default148],
  ["node_modules/get-caller-file", package_default149],
  ["node_modules/ieee754", package_default150],
  ["node_modules/ipaddr.js", package_default151],
  ["node_modules/is-fullwidth-code-point", package_default152],
  ["node_modules/iso-datestring-validator", package_default153],
  ["node_modules/jose", package_default154],
  ["node_modules/jsonata", package_default155],
  ["node_modules/jsonc-parser", package_default156],
  ["node_modules/lru-cache", package_default157],
  ["node_modules/minimatch", package_default158],
  ["node_modules/multiformats", package_default159],
  ["node_modules/on-exit-leak-free", package_default160],
  ["node_modules/path-browserify", package_default161],
  ["node_modules/picomatch", package_default162],
  ["node_modules/pino", package_default163],
  ["node_modules/pino-abstract-transport", package_default164],
  ["node_modules/pino-std-serializers", package_default165],
  ["node_modules/prettier", package_default166],
  ["node_modules/process", package_default167],
  ["node_modules/process-warning", package_default168],
  ["node_modules/quick-format-unescaped", package_default169],
  ["node_modules/readable-stream", package_default170],
  ["node_modules/real-require", package_default171],
  ["node_modules/require-directory", package_default172],
  ["node_modules/safe-buffer", package_default173],
  ["node_modules/safe-stable-stringify", package_default174],
  ["node_modules/sonic-boom", package_default175],
  ["node_modules/split2", package_default176],
  ["node_modules/string-width", package_default177],
  ["node_modules/string_decoder", package_default178],
  ["node_modules/strip-ansi", package_default179],
  ["node_modules/thread-stream", package_default180],
  ["node_modules/tinyglobby", package_default181],
  ["node_modules/ts-morph", package_default182],
  ["node_modules/tslib", package_default183],
  ["node_modules/uint8arrays", package_default184],
  ["node_modules/undici_v6", package_default185],
  ["node_modules/undici_v7", package_default186],
  ["node_modules/undici_v8", package_default187],
  ["node_modules/unicode-segmenter", package_default188],
  ["node_modules/valibot", package_default189],
  ["node_modules/varint", package_default190],
  ["node_modules/wrap-ansi", package_default191],
  ["node_modules/y18n", package_default192],
  ["node_modules/yargs", package_default193],
  ["node_modules/yargs-parser", package_default194],
  ["node_modules/zod", package_default195]
];
function same(a, b) {
  if (a && b && typeof a === "object" && typeof b === "object") {
    const x = a, y = b;
    return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every((k) => Object.hasOwn(y, k) && same(x[k], y[k]));
  }
  return a === b;
}
var checked = false;
function assertDependencies(packages = installed) {
  if (packages === installed)
    verifyInstalledDependencies();
  if (packages === installed && checked)
    return;
  if (new Set(packages.map(([path]) => path)).size !== packages.length)
    throw new InterpretationError("dependency_mismatch", "Duplicate dependency identity");
  if (packages.length !== Object.keys(dependencies_approved_default.packages).length)
    throw new InterpretationError("dependency_mismatch", "Dependency closure is incomplete");
  for (const [path, value] of packages) {
    const expected = dependencies_approved_default.packages[path], actual = value;
    const locked = npm_shrinkwrap_default.packages[path];
    if (!expected || !actual || !locked || actual.version !== expected.version || locked.integrity !== expected.integrity || locked.version !== expected.version || ["dependencies", "optionalDependencies", "peerDependencies", "peerDependenciesMeta"].some((k) => !same(actual[k] ?? {}, expected[k] ?? {}) || !same(locked[k] ?? {}, expected[k] ?? {})))
      throw new InterpretationError("dependency_mismatch", `Unapproved dependency: ${path}`);
  }
  if (!same(dependencies_approved_default.nonExecutedPeers, NON_EXECUTED_PEERS) || !same(package_default.imports, dependencies_approved_default.imports) || !same(package_default.dependencies, dependencies_approved_default.direct) || !same(npm_shrinkwrap_default.packages[""].dependencies, dependencies_approved_default.direct) || Object.entries(dependencies_approved_default.buildTools).some(([name, version]) => package_default.devDependencies[name] !== version || npm_shrinkwrap_default.packages[""].devDependencies[name] !== version))
    throw new InterpretationError("dependency_mismatch", "Unapproved direct dependencies");
  if (packages === installed)
    checked = true;
}

// dist/src/protocol/oauth.js
var import_did = __toESM(require_dist(), 1);
var OAUTH_LIMITS = Object.freeze({
  pending: 10,
  transactionMs: 10 * 60 * 1e3,
  operationMs: 3e4,
  requests: 64,
  requestBytes: 64 * 1024,
  responseBytes: 1024 * 1024,
  totalBytes: 32 * 1024 * 1024,
  scopes: 64,
  scopeBytes: 8192
});
var OAuthBodyByteLimit = class extends AtseqError {
  maximum;
  constructor(maximum) {
    super("input", "OAuth HTTP body exceeds budget");
    this.maximum = maximum;
  }
};
function refuse(message) {
  throw new AtseqError("input", message);
}
function operationFailure(error, deadline = false, recovery) {
  if (deadline)
    return new AtseqError("content_unavailable", "OAuth operation is unavailable");
  const pending = [error], seen = /* @__PURE__ */ new Set();
  for (let checked2 = 0; pending.length && checked2 < 32; checked2++) {
    const next = pending.pop();
    if (!(next instanceof Error) || seen.has(next))
      continue;
    seen.add(next);
    if (next instanceof AtseqError) {
      if (next.code === "content_unavailable")
        return new AtseqError("content_unavailable", "OAuth operation is unavailable");
      if (next.code === "origin")
        return new AtseqError("origin", "OAuth custody origin is refused");
    }
    pending.push(next.cause);
    if (next instanceof AggregateError)
      pending.push(...next.errors.slice(0, 32));
  }
  return new AtseqError("input", recovery === "reauthorization_required" ? "OAuth credential request exceeds the byte limit; reauthorization is required" : "OAuth operation failed");
}
function oauthTransport(fetch) {
  return async (input, init) => {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (error instanceof AtseqError)
        throw operationFailure(error);
      throw new AtseqError("content_unavailable", "OAuth transport is unavailable");
    }
  };
}
function oauthUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    refuse("Invalid OAuth endpoint URL");
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || url.hash || host === "localhost" || host.endsWith(".localhost") || host.includes(":") || /^\d+(\.\d+)*$/.test(host))
    refuse("OAuth endpoint fails URL policy");
  return url;
}
function scopes(value) {
  if (value.length > OAUTH_LIMITS.scopeBytes || !/^[\x21-\x7e]+(?: [\x21-\x7e]+)*$/.test(value))
    refuse("Invalid OAuth scope");
  const result = value.split(" ");
  if (result.length > OAUTH_LIMITS.scopes || new Set(result).size !== result.length || !result.includes("atproto"))
    refuse("Invalid OAuth scope set");
  return Object.freeze(result.sort());
}
async function bodyBytes(body, maximum, budget, signal = budget.signal) {
  if (!body)
    return null;
  const reader = body.getReader();
  const chunks = [];
  let size = 0;
  let rejectAbort = () => {
  };
  const aborted = new Promise((_, reject) => {
    rejectAbort = reject;
  });
  const abort = () => rejectAbort(new AtseqError("content_unavailable", "OAuth request deadline exceeded"));
  signal.addEventListener("abort", abort, { once: true });
  try {
    signal.throwIfAborted();
    for (; ; ) {
      const { value, done } = await Promise.race([reader.read(), aborted]);
      if (done)
        break;
      size += value.length;
      budget.bytes += value.length;
      if (budget.bytes > OAUTH_LIMITS.totalBytes)
        refuse("OAuth HTTP body exceeds budget");
      if (size > maximum)
        throw new OAuthBodyByteLimit(maximum);
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  } catch (error) {
    if (error instanceof AtseqError)
      throw error;
    throw new AtseqError("content_unavailable", "OAuth body is unavailable");
  } finally {
    signal.removeEventListener("abort", abort);
    void reader.cancel().catch(() => {
    });
    reader.releaseLock();
  }
}
var NATIVE_ACCOUNT_RESOURCE_BYTES = 1024 * 1024;
var ownedSessions = /* @__PURE__ */ new WeakMap();
function ownedOAuthSession(handle) {
  const owned = ownedSessions.get(handle);
  if (!owned)
    refuse("Native account writer requires an owned OAuth session");
  return owned;
}
var OAuthSessionHandle = class {
  #flow;
  #session;
  #expected;
  constructor(flow, session, expected) {
    this.#flow = flow;
    this.#session = session;
    this.#expected = expected;
  }
  info(refresh = false) {
    return this.#flow.sessionInfo(this.#session, this.#expected, refresh);
  }
  /** Account responses are ephemeral transport data, not an Atseq archive/result. */
  request(path, init) {
    return this.#flow.sessionRequest(this.#session, this.#expected, path, init);
  }
  revoke() {
    return this.#flow.sessionRevoke(this.#session);
  }
};
var OAuthAdapter = class {
  #options;
  #custody;
  #transactions;
  #lock;
  #transport;
  #factory;
  #client;
  #budget;
  #resourceCheck;
  #resourceAllowance;
  constructor(options, transactions, lock, transport, factory, custody) {
    oauthUrl(options.metadata.client_id);
    if (options.metadata.token_endpoint_auth_method !== "none")
      refuse("This adapter requires a public OAuth client");
    scopes(options.metadata.scope ?? "");
    this.#options = options;
    this.#transactions = transactions;
    this.#lock = lock;
    this.#transport = transport;
    this.#factory = factory;
    this.#custody = custody;
  }
  #fetch = (input, init) => this.#guardedFetch(input, init, true);
  #identityFetch = (input, init) => this.#guardedFetch(input, init, false);
  #captureNativeFailure(error) {
    const budget = this.#budget;
    if (!budget?.native || budget.native.first || !(error instanceof AtseqError))
      return;
    const original = budget.failures.get(error);
    const deadline = original?.deadline ?? budget.signal.aborted;
    const failure = operationFailure(error, deadline, original?.recovery);
    budget.failures.set(failure, { deadline, recovery: original?.recovery });
    budget.native.first = failure;
  }
  async #guardedFetch(input, init, maintained) {
    try {
      return await this.#dispatchFetch(input, init, maintained);
    } catch (error) {
      this.#captureNativeFailure(error);
      throw this.#budget?.native?.first ?? error;
    }
  }
  async #dispatchFetch(input, init, maintained) {
    const budget = this.#budget;
    if (!budget)
      refuse("OAuth HTTP request outside an adapter operation");
    if (++budget.requests > OAUTH_LIMITS.requests)
      refuse("OAuth HTTP request count exceeds budget");
    const request2 = new Request(input, init);
    oauthUrl(request2.url);
    await this.#resourceCheck?.(request2);
    if (request2.headers.has("authorization") && budget.native?.first)
      throw budget.native.first;
    if (request2.headers.has("cookie"))
      refuse("OAuth HTTP cookie header is forbidden");
    const signal = AbortSignal.any([budget.signal, request2.signal]);
    const allowance = this.#resourceAllowance;
    const allowed = maintained && request2.headers.has("authorization") && allowance && request2.url === allowance.url;
    if (allowed && request2.method !== "POST")
      refuse("Native resource method differs from captured operation");
    let bytes;
    try {
      bytes = await bodyBytes(request2.body, allowed ? NATIVE_ACCOUNT_RESOURCE_BYTES : OAUTH_LIMITS.requestBytes, budget, signal);
    } catch (error) {
      if (budget.native && maintained && request2.method === "POST" && !request2.headers.has("authorization") && request2.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() === "application/x-www-form-urlencoded" && error instanceof OAuthBodyByteLimit && error.maximum === OAUTH_LIMITS.requestBytes) {
        const deadline = budget.signal.aborted;
        const failure = operationFailure(error, deadline, "reauthorization_required");
        budget.failures.set(failure, { deadline, recovery: "reauthorization_required" });
        throw failure;
      }
      throw error;
    }
    if (allowed && (!bytes || bytes.length !== allowance.bytes.length || bytes.some((value, index) => value !== allowance.bytes[index])))
      refuse("Native resource body differs from captured operation");
    const headers = new Headers(request2.headers);
    headers.delete("content-length");
    const guarded = new Request(request2.url, {
      method: request2.method,
      headers,
      body: bytes,
      redirect: "error",
      credentials: "omit",
      cache: "no-store",
      signal
    });
    if (maintained && this.#custody && guarded.method === "POST" && !guarded.headers.has("authorization") && guarded.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() === "application/x-www-form-urlencoded") {
      const form = new URLSearchParams(new TextDecoder().decode(bytes ?? new Uint8Array()));
      if (form.getAll("client_id").includes(this.#options.metadata.client_id) && form.getAll("grant_type").some((value) => value === "refresh_token" || value === "authorization_code")) {
        signal.throwIfAborted();
        this.#custody.tokenRequestDispatched();
      }
    }
    const response = await this.#transport(guarded);
    if (response.redirected || response.status === 0)
      refuse("OAuth redirect or opaque response is forbidden");
    if (response.url && oauthUrl(response.url).href !== oauthUrl(request2.url).href)
      refuse("OAuth response URL differs from request");
    if (!guarded.headers.has("authorization") && (response.status === 429 || response.status >= 500)) {
      void response.body?.cancel().catch(() => {
      });
      throw new AtseqError("content_unavailable", "OAuth service is unavailable");
    }
    const content = await bodyBytes(response.body, OAUTH_LIMITS.responseBytes, budget, signal);
    const resultHeaders = new Headers(response.headers);
    resultHeaders.delete("content-length");
    resultHeaders.delete("content-encoding");
    return new Response(content, { status: response.status, statusText: response.statusText, headers: resultHeaders });
  }
  async #run(work) {
    return this.#lock(async () => {
      this.#budget = {
        signal: AbortSignal.timeout(OAUTH_LIMITS.operationMs),
        requests: 0,
        bytes: 0,
        failures: /* @__PURE__ */ new WeakMap()
      };
      let failure;
      try {
        assertDependencies();
        this.#client ??= this.#factory(this.#fetch, {
          resolve: (identifier, options) => this.#options.resolveIdentity(identifier, {
            fetch: this.#identityFetch,
            signal: AbortSignal.any([this.#budget.signal, ...options?.signal ? [options.signal] : []])
          })
        });
        const client = await this.#client;
        await this.#custody?.prepare(client);
        let successful = false;
        try {
          const result = await work(client);
          if (this.#budget.signal.aborted)
            throw new AtseqError("content_unavailable", "OAuth operation is unavailable");
          successful = true;
          return result;
        } catch (error) {
          const classified = error instanceof Error ? this.#budget.failures.get(error) : void 0;
          failure = {
            error,
            deadline: classified?.deadline ?? this.#budget.signal.aborted,
            recovery: classified?.recovery
          };
          throw error;
        } finally {
          try {
            await this.#custody?.finish(client, successful);
          } catch (error) {
            throw failure ? failure.error : error;
          }
        }
      } catch (error) {
        throw operationFailure(error, failure?.deadline ?? this.#budget.signal.aborted, failure?.recovery);
      } finally {
        this.#resourceCheck = void 0;
        this.#resourceAllowance = void 0;
        this.#budget = void 0;
      }
    });
  }
  /** Internal credential-shell housekeeping, under the same guarded operation. */
  cleanupCustody() {
    return this.#run(async () => {
    });
  }
  async begin(did, requestedScope) {
    if (!(0, import_did.isAtprotoDid)(did))
      refuse("OAuth enrolment requires an ATproto account DID");
    const requested = scopes(requestedScope), allowed = scopes(this.#options.metadata.scope ?? "");
    if (requested.some((scope) => !allowed.includes(scope)))
      refuse("OAuth scope exceeds configured consent");
    return this.#run(async (client) => {
      for (const transaction2 of await this.#transactions.list())
        if (Date.now() >= transaction2.expiresAt)
          await this.#transactions.take(transaction2.id);
      if ((await this.#transactions.list()).length >= OAUTH_LIMITS.pending)
        refuse("Too many OAuth transactions");
      const transaction = Object.freeze({
        id: crypto.randomUUID(),
        did,
        scopes: requested,
        expiresAt: Date.now() + OAUTH_LIMITS.transactionMs
      });
      await this.#transactions.set(transaction);
      const url = await client.authorize(did, { scope: requested.join(" "), state: transaction.id });
      oauthUrl(url);
      return Object.freeze({ transactionId: transaction.id, authorizationUrl: url.href });
    });
  }
  async complete(params) {
    const encoded = params.toString();
    if (encoded.length > OAUTH_LIMITS.requestBytes)
      refuse("OAuth callback exceeds budget");
    const copy = new URLSearchParams(encoded);
    if (!copy.get("iss") || !copy.get("state") || !copy.get("code") || copy.has("error"))
      refuse("Incomplete OAuth callback");
    for (const name of ["iss", "state", "code"])
      if (copy.getAll(name).length !== 1)
        refuse("Duplicate OAuth callback parameter");
    const callbackState = copy.get("state");
    const issuer = oauthUrl(copy.get("iss")).href;
    return this.#run(async (client) => {
      const transactionId = await client.readApplicationState(callbackState);
      if (typeof transactionId !== "string" || transactionId.length !== 36)
        refuse("Unknown OAuth callback state");
      const transaction = await this.#transactions.take(transactionId);
      if (!transaction || Date.now() >= transaction.expiresAt)
        refuse("Unknown or expired OAuth transaction");
      const { session, state } = await client.callback(copy);
      try {
        if (state !== transactionId)
          refuse("OAuth transaction differs from callback");
        const info = await this.#verify(client, session, transaction, false);
        if (oauthUrl(info.issuer).href !== issuer)
          refuse("OAuth issuer differs from callback");
        return this.#mint(session, transaction);
      } catch (error) {
        return this.#verificationFailure(session, error);
      }
    });
  }
  async restore(did, requestedScope) {
    if (!(0, import_did.isAtprotoDid)(did))
      refuse("OAuth session requires an ATproto account DID");
    const requested = scopes(requestedScope), allowed = scopes(this.#options.metadata.scope ?? "");
    if (requested.some((scope) => !allowed.includes(scope)))
      refuse("OAuth scope exceeds configured consent");
    return this.#run(async (client) => {
      await this.#custody?.touch(did);
      let session;
      try {
        session = await client.restore(did, false);
      } catch (error) {
        return this.#verificationFailure({ signOut: () => client.revoke(did) }, error);
      }
      const expected = Object.freeze({ id: crypto.randomUUID(), did, scopes: requested, expiresAt: 0 });
      await this.#verify(client, session, expected, false);
      return this.#mint(session, expected);
    });
  }
  #mint(session, expected) {
    const captured = Object.freeze({ ...expected, scopes: Object.freeze([...expected.scopes]) });
    const handle = new OAuthSessionHandle(this, session, captured);
    ownedSessions.set(handle, Object.freeze({
      did: captured.did,
      info: () => this.#sessionInfo(session, captured, false),
      request: (path, init) => this.#sessionRequest(session, captured, path, init, void 0, true),
      apply: (body, signal) => this.#nativeResourceRequest(session, captured, "com.atproto.repo.applyWrites", body, "application/json", signal),
      upload: (body, mimeType, signal) => this.#nativeResourceRequest(session, captured, "com.atproto.repo.uploadBlob", body, mimeType, signal)
    }));
    return handle;
  }
  #nativeResourceRequest(session, expected, method, body, mimeType, signal) {
    if (!(body instanceof Uint8Array) || body.length > NATIVE_ACCOUNT_RESOURCE_BYTES)
      refuse("Native resource body exceeds byte limit");
    const captured = new Uint8Array(body);
    return this.#sessionRequest(session, expected, `/xrpc/${method}`, { method: "POST", headers: { "content-type": mimeType }, body: new Uint8Array(captured), signal }, captured, true);
  }
  async #verify(client, session, expected, refresh) {
    try {
      const info = await session.getTokenInfo(refresh);
      const granted = this.#checkToken(info, session, expected);
      const resolved = await client.oauthResolver.resolveFromIdentity(expected.did, {
        noCache: true,
        allowStale: false,
        signal: this.#budget.signal
      });
      const pds = resolved.pds.href;
      if (oauthUrl(resolved.metadata.issuer).href !== oauthUrl(info.iss).href)
        refuse("OAuth account issuer authority changed");
      if (oauthUrl(pds).href !== oauthUrl(info.aud).href)
        refuse("OAuth account authority changed");
      return Object.freeze({
        did: info.sub,
        issuer: oauthUrl(info.iss).href,
        pds: oauthUrl(pds).href,
        scopes: granted
      });
    } catch (error) {
      return this.#verificationFailure(session, error);
    }
  }
  async #verificationFailure(session, error) {
    const budget = this.#budget;
    if (error instanceof AtseqError && budget.failures.has(error))
      throw error;
    const deadline = budget.signal.aborted;
    const failure = operationFailure(error, deadline);
    budget.failures.set(failure, { deadline });
    if (failure.code !== "content_unavailable" || !this.#custody) {
      try {
        await session.signOut();
      } catch {
      }
    }
    throw failure;
  }
  #checkToken(info, session, expected) {
    const granted = scopes(info.scope);
    if (info.sub !== expected.did || session.did !== expected.did || granted.length !== expected.scopes.length || granted.some((scope, index) => scope !== expected.scopes[index]))
      refuse("OAuth account or granted scope differs from transaction");
    return granted;
  }
  sessionInfo(session, expected, refresh) {
    return this.#sessionInfo(session, expected, refresh);
  }
  #sessionInfo(session, expected, refresh) {
    return this.#run(async (client) => {
      await this.#custody?.touch(expected.did, refresh);
      return this.#verify(client, session, expected, refresh);
    });
  }
  sessionRequest(session, expected, path, init) {
    return this.#sessionRequest(session, expected, path, init);
  }
  async #sessionRequest(session, expected, path, init, nativeBody, native = false) {
    if (!path.startsWith("/xrpc/") || path.includes("#") || !new URL(path, "https://xrpc.invalid").pathname.startsWith("/xrpc/"))
      refuse("OAuth resource path must name an XRPC operation");
    return this.#run(async (client) => {
      await this.#custody?.touch(expected.did);
      const authority = await this.#verify(client, session, expected, "auto");
      const resource = new URL(path, authority.pds).href;
      const operation = native ? {} : void 0;
      this.#budget.native = operation;
      if (nativeBody)
        this.#resourceAllowance = { url: resource, bytes: nativeBody };
      this.#resourceCheck = async (request2) => {
        if (!request2.headers.has("authorization"))
          return;
        if (operation?.first)
          throw operation.first;
        try {
          const token = await session.getTokenInfo(false);
          this.#checkToken(token, session, expected);
          if (request2.url !== resource || oauthUrl(token.iss).href !== authority.issuer || oauthUrl(token.aud).href !== authority.pds)
            refuse("OAuth resource authority changed during dispatch");
        } catch (error) {
          this.#captureNativeFailure(error);
          return this.#verificationFailure(session, error);
        }
      };
      try {
        const response = await session.fetchHandler(path, init);
        if (operation?.first)
          throw operation.first;
        return response;
      } catch (error) {
        throw operation?.first ?? error;
      } finally {
        this.#resourceCheck = void 0;
        this.#resourceAllowance = void 0;
        this.#budget.native = void 0;
      }
    });
  }
  sessionRevoke(session) {
    return this.#run(async () => {
      await this.#custody?.touch(session.did, true);
      await session.signOut();
    });
  }
};

// dist/src/browser/oauth-custody.js
var import_did2 = __toESM(require_dist(), 1);
var ACCOUNTS = 10;
var CONSENT_MS = 30 * 24 * 60 * 60 * 1e3;
var METADATA_BYTES = 64 * 1024;
var OAUTH_CUSTODY_DATABASE = "atseq.oauth.custody.v1";
function refuse2() {
  throw new AtseqError("input", "OAuth credential custody is unavailable");
}
function request(value) {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error);
  });
}
function metadata(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value, (name, entry) => name === "keyPair" && entry?.privateKey instanceof CryptoKey && entry?.publicKey instanceof CryptoKey ? void 0 : entry));
  if (bytes.length > METADATA_BYTES)
    refuse2();
}
function pair(keyPair) {
  if (!(keyPair?.privateKey instanceof CryptoKey) || !(keyPair.publicKey instanceof CryptoKey) || keyPair.privateKey.type !== "private" || keyPair.privateKey.extractable || keyPair.publicKey.type !== "public")
    refuse2();
}
function pendingRow(row) {
  metadata(row);
  if (!row || !(0, import_did2.isAtprotoDid)(row.did) || typeof row.id !== "string" || row.id.length !== 36 || !Number.isSafeInteger(row.expiresAt) || row.expiresAt <= 0 || row.expiresAt > Date.now() + OAUTH_LIMITS.transactionMs || typeof row.consumed !== "boolean" || !Array.isArray(row.scopes) || row.scopes.length > OAUTH_LIMITS.scopes || row.scopes.some((scope) => typeof scope !== "string") || row.scopes.join(" ").length > OAUTH_LIMITS.scopeBytes || row.sdkState !== void 0 && (typeof row.sdkState !== "string" || !row.sdkState || row.sdkState.length > 2048) || row.value !== void 0 && (!row.sdkState || row.value.appState !== row.id) || Object.keys(row).some((key) => !["id", "did", "scopes", "expiresAt", "consumed", "sdkState", "value"].includes(key)))
    refuse2();
}
function accountRow(row) {
  metadata(row);
  if (!row || !(0, import_did2.isAtprotoDid)(row.did) || !["reserved", "live", "uncertain", "retiring"].includes(row.phase) || !Number.isSafeInteger(row.expiresAt) || row.expiresAt <= 0 || row.expiresAt > Date.now() + CONSENT_MS || (row.phase === "uncertain" ? typeof row.operation !== "string" || row.operation.length !== 36 : row.operation !== void 0) || row.phase === "live" && !row.value || row.phase === "reserved" && row.value !== void 0 || row.value !== void 0 && row.value.tokenSet.sub !== row.did || Object.keys(row).some((key) => !["did", "phase", "expiresAt", "operation", "value"].includes(key)))
    refuse2();
}
var BrowserOAuthCustody = class {
  #db;
  #keys;
  #context;
  constructor(keys) {
    this.#keys = keys;
    this.#db = new Promise((resolve, reject) => {
      const opening = indexedDB.open(OAUTH_CUSTODY_DATABASE, 1);
      opening.onupgradeneeded = () => {
        const db = opening.result;
        const pending = db.createObjectStore("pending", { keyPath: "id" });
        pending.createIndex("sdkState", "sdkState", { unique: true });
        pending.createIndex("did", "did", { unique: true });
        pending.createIndex("expiresAt", "expiresAt");
        db.createObjectStore("accounts", { keyPath: "did" }).createIndex("expiresAt", "expiresAt");
      };
      opening.onsuccess = () => {
        const db = opening.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      opening.onerror = () => reject(opening.error);
      opening.onblocked = () => reject(new AtseqError("input", "OAuth custody database is blocked"));
    });
  }
  async #transaction(mode, work) {
    const db = await this.#db;
    const tx = db.transaction(["pending", "accounts"], mode, { durability: "strict" });
    const completed = new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new AtseqError("input", "OAuth custody transaction aborted"));
      tx.onerror = () => {
      };
    });
    try {
      const result = await work(tx.objectStore("pending"), tx.objectStore("accounts"));
      await completed;
      return result;
    } catch (error) {
      try {
        tx.abort();
      } catch {
      }
      await completed.catch(() => {
      });
      throw error;
    }
  }
  async #encode(value) {
    const key = value.dpopKey;
    if (!(key instanceof this.#keys) || !key.kid)
      refuse2();
    pair(key.cryptoKeyPair);
    const encoded = { ...value, dpopKey: { keyId: key.kid, keyPair: key.cryptoKeyPair } };
    metadata(encoded);
    return encoded;
  }
  async #decode(value) {
    metadata(value);
    pair(value.dpopKey.keyPair);
    return {
      ...value,
      dpopKey: await this.#keys.fromKeypair(value.dpopKey.keyPair, value.dpopKey.keyId)
    };
  }
  transactions = {
    list: async () => this.#transaction("readonly", async (pending) => (await request(pending.getAll())).filter((row) => !row.consumed)),
    set: async (transaction) => {
      if (this.#context)
        refuse2();
      const context = {
        id: crypto.randomUUID(),
        did: transaction.did,
        pending: transaction.id,
        explicit: true,
        authorization: true,
        conservative: true,
        mayHaveChanged: false,
        pendingTokenRequest: false
      };
      await this.#transaction("readwrite", async (pending, accounts) => {
        if (await request(pending.index("did").get(transaction.did)))
          refuse2();
        if (await request(pending.count()) >= OAUTH_LIMITS.pending)
          refuse2();
        let account = await request(accounts.get(transaction.did));
        if (!account) {
          if (await request(accounts.count()) >= ACCOUNTS)
            refuse2();
          account = { did: transaction.did, phase: "reserved", expiresAt: transaction.expiresAt };
          metadata(account);
          await request(accounts.put(account));
        }
        const row = { ...transaction, consumed: false };
        metadata(row);
        await request(pending.add(row));
      });
      this.#context = context;
    },
    take: async (id) => {
      if (this.#context)
        refuse2();
      let context;
      const result = await this.#transaction("readwrite", async (pending, accounts) => {
        const row = await request(pending.get(id));
        if (!row || row.consumed || row.expiresAt <= Date.now())
          return void 0;
        const account = await request(accounts.get(row.did));
        if (!account)
          refuse2();
        context = {
          id: crypto.randomUUID(),
          did: row.did,
          pending: row.id,
          explicit: true,
          authorization: false,
          conservative: true,
          mayHaveChanged: false,
          pendingTokenRequest: false
        };
        row.consumed = true;
        account.phase = "uncertain";
        account.operation = context.id;
        metadata(row);
        metadata(account);
        await request(pending.put(row));
        await request(accounts.put(account));
        return { id: row.id, did: row.did, scopes: row.scopes, expiresAt: row.expiresAt };
      });
      this.#context = context;
      return result;
    }
  };
  stateStore = {
    set: async (nonce, value) => {
      const context = this.#context;
      if (!context?.authorization || value.appState !== context.pending)
        refuse2();
      const encoded = await this.#encode(value);
      await this.#transaction("readwrite", async (pending) => {
        const row = await request(pending.get(context.pending));
        if (!row || row.consumed || row.expiresAt <= Date.now() || row.sdkState)
          refuse2();
        row.sdkState = nonce;
        row.value = encoded;
        metadata(row);
        await request(pending.put(row));
      });
    },
    get: async (nonce) => {
      const row = await this.#transaction("readonly", async (pending) => request(pending.index("sdkState").get(nonce)));
      if (row)
        pendingRow(row);
      if (!row || row.expiresAt <= Date.now() || row.consumed && this.#context?.pending !== row.id)
        return void 0;
      return row.value ? this.#decode(row.value) : void 0;
    },
    del: async (nonce) => {
      await this.#transaction("readwrite", async (pending) => {
        const row = await request(pending.index("sdkState").get(nonce));
        if (!row)
          return;
        if (!row.consumed || this.#context?.pending !== row.id)
          refuse2();
        delete row.sdkState;
        delete row.value;
        await request(pending.put(row));
      });
    }
  };
  sessionStore = {
    get: async (did) => {
      const row = await this.#transaction("readonly", async (_pending, accounts) => request(accounts.get(did)));
      if (!row)
        return void 0;
      accountRow(row);
      if (!row.value)
        return void 0;
      const context = this.#context;
      if (!context || row.phase !== "uncertain" || row.operation !== context.id || did !== context.did)
        refuse2();
      if (!context.explicit && row.expiresAt <= Date.now())
        refuse2();
      return this.#decode(row.value);
    },
    set: async (did, value) => {
      const context = this.#context;
      if (!context || context.authorization || context.did !== did || value.tokenSet.sub !== did)
        refuse2();
      context.mayHaveChanged = true;
      const encoded = await this.#encode(value);
      await this.#transaction("readwrite", async (_pending, accounts) => {
        const row = await request(accounts.get(did));
        if (!row || row.phase !== "uncertain" || row.operation !== context.id)
          refuse2();
        row.value = encoded;
        metadata(row);
        await request(accounts.put(row));
      });
      context.pendingTokenRequest = false;
    },
    del: async (did) => {
      const context = this.#context;
      if (!context || context.did !== did)
        refuse2();
      context.mayHaveChanged = true;
      await this.#transaction("readwrite", async (_pending, accounts) => {
        const row = await request(accounts.get(did));
        if (!row || row.operation !== context.id)
          return;
        delete row.value;
        await request(accounts.put(row));
      });
    }
  };
  tokenRequestDispatched() {
    const context = this.#context;
    if (!context)
      refuse2();
    context.mayHaveChanged = true;
    context.pendingTokenRequest = true;
  }
  async touch(did, conservative = false) {
    if (this.#context)
      refuse2();
    const context = {
      id: crypto.randomUUID(),
      did,
      explicit: false,
      authorization: false,
      conservative,
      mayHaveChanged: false,
      pendingTokenRequest: false
    };
    await this.#transaction("readwrite", async (_pending, accounts) => {
      const row = await request(accounts.get(did));
      if (!row?.value || row.phase !== "live" || row.expiresAt <= Date.now())
        refuse2();
      row.phase = "uncertain";
      row.operation = context.id;
      metadata(row);
      await request(accounts.put(row));
    });
    this.#context = context;
  }
  async #retire(client, did) {
    const row = await this.#transaction("readwrite", async (_pending, accounts) => {
      const row2 = await request(accounts.get(did));
      if (!row2)
        return void 0;
      row2.phase = "retiring";
      delete row2.operation;
      await request(accounts.put(row2));
      return row2;
    });
    try {
      if (row?.value) {
        const session = await this.#decode(row.value);
        const server = await client.serverFactory.fromIssuer(session.tokenSet.iss, session.authMethod, session.dpopKey);
        await server.revoke(session.tokenSet.refresh_token || session.tokenSet.access_token);
      }
    } catch {
    }
    await this.#transaction("readwrite", async (pending, accounts) => {
      const rows = await request(pending.index("did").getAll(did));
      for (const item of rows)
        await request(pending.delete(item.id));
      await request(accounts.delete(did));
    });
  }
  async prepare(client) {
    if (this.#context)
      refuse2();
    const retire = await this.#transaction("readwrite", async (pending, accounts) => {
      const rows = await request(pending.getAll());
      const active = /* @__PURE__ */ new Set();
      for (const row of rows) {
        pendingRow(row);
        if (!Number.isSafeInteger(row.expiresAt) || row.expiresAt <= Date.now() || row.consumed)
          await request(pending.delete(row.id));
        else
          active.add(row.did);
      }
      const sessions = await request(accounts.getAll());
      if (sessions.length > ACCOUNTS || rows.length > OAUTH_LIMITS.pending)
        refuse2();
      const retiring = [];
      for (const row of sessions) {
        accountRow(row);
        if (row.phase === "uncertain" || row.phase === "retiring" || row.expiresAt <= Date.now() || row.phase === "reserved" && !active.has(row.did)) {
          row.phase = "retiring";
          delete row.operation;
          await request(accounts.put(row));
          retiring.push(row.did);
        }
      }
      return retiring;
    });
    for (const did of retire)
      await this.#retire(client, did);
  }
  async finish(client, successful) {
    const context = this.#context;
    if (!context)
      return;
    try {
      if (context.authorization && successful)
        return;
      if (!successful) {
        if (context.authorization) {
          await this.#transaction("readwrite", async (pending, accounts) => {
            if (context.pending)
              await request(pending.delete(context.pending));
            const account = await request(accounts.get(context.did));
            if (account?.phase === "reserved")
              await request(accounts.delete(context.did));
          });
          return;
        }
        if (context.conservative || context.mayHaveChanged) {
          await this.#retire(client, context.did);
          return;
        }
      }
      if (successful && context.pendingTokenRequest) {
        await this.#retire(client, context.did);
        return;
      }
      await this.#transaction("readwrite", async (pending, accounts) => {
        const row = await request(accounts.get(context.did));
        if (!row || row.operation !== context.id || row.phase !== "uncertain")
          refuse2();
        if (context.pending)
          await request(pending.delete(context.pending));
        if (!row.value)
          await request(accounts.delete(context.did));
        else {
          row.phase = "live";
          delete row.operation;
          if (context.explicit)
            row.expiresAt = Date.now() + CONSENT_MS;
          metadata(row);
          await request(accounts.put(row));
        }
      });
    } finally {
      this.#context = void 0;
    }
  }
  runtime() {
    return {
      createKey: (algs) => this.#keys.generate(algs, void 0, { extractable: false }),
      getRandomValues: (length) => crypto.getRandomValues(new Uint8Array(length)),
      digest: async (data, { name }) => new Uint8Array(await crypto.subtle.digest(`SHA-${name.slice(3)}`, data)),
      requestLock: (name, work) => navigator.locks.request(`atseq.oauth.sdk:${name}`, async () => work())
    };
  }
};

export {
  AtseqError,
  ProtocolError,
  assertDependencies,
  deepFreeze,
  require_dist,
  oauthTransport,
  oauthUrl,
  ownedOAuthSession,
  OAuthSessionHandle,
  OAuthAdapter,
  OAUTH_CUSTODY_DATABASE,
  BrowserOAuthCustody
};
