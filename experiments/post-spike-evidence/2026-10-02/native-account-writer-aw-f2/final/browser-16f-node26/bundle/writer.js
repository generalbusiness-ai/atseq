import {
  external_exports
} from "./chunk-4UJAH5YT.js";
import {
  AtseqError,
  OAUTH_CUSTODY_DATABASE,
  OAuthSessionHandle,
  ProtocolError,
  assertDependencies,
  deepFreeze,
  ownedOAuthSession,
  require_dist
} from "./chunk-WK77AKTB.js";
import {
  __commonJS,
  __export,
  __toESM
} from "./chunk-CZ7CSFO4.js";

// node_modules/iso-datestring-validator/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/iso-datestring-validator/dist/index.js"(exports) {
    (() => {
      "use strict";
      var e = { d: (t2, r2) => {
        for (var n2 in r2) e.o(r2, n2) && !e.o(t2, n2) && Object.defineProperty(t2, n2, { enumerable: true, get: r2[n2] });
      }, o: (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2), r: (e2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      } }, t = {};
      function r(e2, t2) {
        return void 0 === t2 && (t2 = "-"), new RegExp("^(?!0{4}" + t2 + "0{2}" + t2 + "0{2})((?=[0-9]{4}" + t2 + "(((0[^2])|1[0-2])|02(?=" + t2 + "(([0-1][0-9])|2[0-8])))" + t2 + "[0-9]{2})|(?=((([13579][26])|([2468][048])|(0[48]))0{2})|([0-9]{2}((((0|[2468])[48])|[2468][048])|([13579][26])))" + t2 + "02" + t2 + "29))([0-9]{4})" + t2 + "(?!((0[469])|11)" + t2 + "31)((0[1,3-9]|1[0-2])|(02(?!" + t2 + "3)))" + t2 + "(0[1-9]|[1-2][0-9]|3[0-1])$").test(e2);
      }
      function n(e2) {
        var t2 = /\D/.exec(e2);
        return t2 ? t2[0] : "";
      }
      function i(e2, t2, r2) {
        void 0 === t2 && (t2 = ":"), void 0 === r2 && (r2 = false);
        var i2 = new RegExp("^([0-1]|2(?=([0-3])|4" + t2 + "00))[0-9]" + t2 + "[0-5][0-9](" + t2 + "([0-5]|6(?=0))[0-9])?(.[0-9]{1,9})?$");
        if (!r2 || !/[Z+\-]/.test(e2)) return i2.test(e2);
        if (/Z$/.test(e2)) return i2.test(e2.replace("Z", ""));
        var o2 = e2.includes("+"), a2 = e2.split(/[+-]/), u2 = a2[0], d2 = a2[1];
        return i2.test(u2) && (function(e3, t3, r3) {
          return void 0 === r3 && (r3 = ":"), new RegExp(t3 ? "^(0(?!(2" + r3 + "4)|0" + r3 + "3)|1(?=([0-1]|2(?=" + r3 + "[04])|[34](?=" + r3 + "0))))([03469](?=" + r3 + "[03])|[17](?=" + r3 + "0)|2(?=" + r3 + "[04])|5(?=" + r3 + "[034])|8(?=" + r3 + "[04]))" + r3 + "([03](?=0)|4(?=5))[05]$" : "^(0(?=[^0])|1(?=[0-2]))([39](?=" + r3 + "[03])|[0-24-8](?=" + r3 + "00))" + r3 + "[03]0$").test(e3);
        })(d2, o2, n(d2));
      }
      function o(e2) {
        var t2 = e2.split("T"), o2 = t2[0], a2 = t2[1], u2 = r(o2, n(o2));
        if (!a2) return false;
        var d2, s = (d2 = a2.match(/([^Z+\-\d])(?=\d+\1)/), Array.isArray(d2) ? d2[0] : "");
        return u2 && i(a2, s, true);
      }
      function a(e2, t2) {
        return void 0 === t2 && (t2 = "-"), new RegExp("^[0-9]{4}" + t2 + "(0(?=[^0])|1(?=[0-2]))[0-9]$").test(e2);
      }
      e.r(t), e.d(t, { isValidDate: () => r, isValidISODateString: () => o, isValidTime: () => i, isValidYearMonth: () => a });
      var u = exports;
      for (var d in t) u[d] = t[d];
      t.__esModule && Object.defineProperty(u, "__esModule", { value: true });
    })();
  }
});

// dist/src/browser/oauth-loader.js
async function loadBrowserOAuthAdapter(options) {
  assertDependencies();
  const { browserOAuthAdapter } = await import("./oauth-adapter-J4P7XZDC.js");
  return browserOAuthAdapter(options);
}

// node_modules/@atproto/syntax/dist/did.js
var DID_REGEX = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
function ensureValidDidRegex(input2) {
  if (!DID_REGEX.test(input2)) {
    throw new InvalidDidError("DID didn't validate via regex");
  }
  if (input2.length > 2048) {
    throw new InvalidDidError("DID is too long (2048 chars max)");
  }
}
function isValidDid(input2) {
  return typeof input2 === "string" && input2.length <= 2048 && DID_REGEX.test(input2);
}
var InvalidDidError = class extends Error {
};

// node_modules/@atproto/syntax/dist/handle.js
var HANDLE_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
function ensureValidHandleRegex(input2) {
  if (input2.length > 253) {
    throw new InvalidHandleError("Handle is too long (253 chars max)");
  }
  if (!HANDLE_REGEX.test(input2)) {
    throw new InvalidHandleError("Handle didn't validate via regex");
  }
}
function isValidHandle(input2) {
  return typeof input2 === "string" && input2.length <= 253 && HANDLE_REGEX.test(input2);
}
var InvalidHandleError = class extends Error {
};

// node_modules/@atproto/syntax/dist/at-identifier.js
function isDidIdentifier(id) {
  return id.startsWith("did:");
}
function assertAtIdentifierString(input2) {
  try {
    if (!input2 || typeof input2 !== "string") {
      throw new TypeError("Identifier must be a non-empty string");
    } else if (input2.startsWith("did:")) {
      ensureValidDidRegex(input2);
    } else {
      ensureValidHandleRegex(input2);
    }
  } catch (cause) {
    throw new InvalidHandleError("Invalid DID or handle", { cause });
  }
}
function isAtIdentifierString(input2) {
  if (!input2 || typeof input2 !== "string") {
    return false;
  } else if (input2.startsWith("did:")) {
    return isValidDid(input2);
  } else {
    return isValidHandle(input2);
  }
}

// node_modules/@atproto/syntax/dist/lib/result.js
function success(value) {
  return { success: true, value };
}
function failure(message) {
  return { success: false, message };
}

// node_modules/@atproto/syntax/dist/nsid.js
function ensureValidNsid(input2) {
  const result = validateNsid(input2);
  if (!result.success)
    throw new InvalidNsidError(result.message);
}
function isValidNsid(input2) {
  return typeof input2 === "string" && validateNsidRegex(input2).success;
}
function validateNsid(input2) {
  if (input2.length > 253 + 1 + 63) {
    return failure("NSID is too long (317 chars max)");
  }
  if (hasDisallowedCharacters(input2)) {
    return failure("Disallowed characters in NSID (ASCII letters, digits, dashes, periods only)");
  }
  const segments = input2.split(".");
  if (segments.length < 3) {
    return failure("NSID needs at least three parts");
  }
  for (const l of segments) {
    if (l.length < 1) {
      return failure("NSID parts can not be empty");
    }
    if (l.length > 63) {
      return failure("NSID part too long (max 63 chars)");
    }
    if (startsWithHyphen(l) || endsWithHyphen(l)) {
      return failure("NSID parts can not start or end with hyphen");
    }
  }
  if (startsWithNumber(segments[0])) {
    return failure("NSID first part may not start with a digit");
  }
  if (!isValidIdentifier(segments[segments.length - 1])) {
    return failure("NSID name part must be only letters and digits (and no leading digit)");
  }
  return success(segments);
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
function validateNsidRegex(value) {
  if (value.length > 253 + 1 + 63) {
    return failure("NSID is too long (317 chars max)");
  }
  if (
    // Fast check for small values
    value.length < 5 || !/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(value)
  ) {
    return failure("NSID didn't validate via regex");
  }
  return success(value);
}
var InvalidNsidError = class extends Error {
};

// node_modules/@atproto/syntax/dist/recordkey.js
var RECORD_KEY_MAX_LENGTH = 512;
var RECORD_KEY_MIN_LENGTH = 1;
var RECORD_KEY_INVALID_VALUES = /* @__PURE__ */ new Set([".", ".."]);
var RECORD_KEY_REGEX = /^[a-zA-Z0-9_~.:-]{1,512}$/;
function ensureValidRecordKey(input2) {
  if (input2.length > RECORD_KEY_MAX_LENGTH || input2.length < RECORD_KEY_MIN_LENGTH) {
    throw new InvalidRecordKeyError(`record key must be ${RECORD_KEY_MIN_LENGTH} to ${RECORD_KEY_MAX_LENGTH} characters`);
  }
  if (RECORD_KEY_INVALID_VALUES.has(input2)) {
    throw new InvalidRecordKeyError('record key can not be "." or ".."');
  }
  if (!RECORD_KEY_REGEX.test(input2)) {
    throw new InvalidRecordKeyError("record key syntax not valid (regex)");
  }
}
function isValidRecordKey(input2) {
  return typeof input2 === "string" && input2.length >= RECORD_KEY_MIN_LENGTH && input2.length <= RECORD_KEY_MAX_LENGTH && RECORD_KEY_REGEX.test(input2) && !RECORD_KEY_INVALID_VALUES.has(input2);
}
var InvalidRecordKeyError = class extends Error {
};

// node_modules/@atproto/syntax/dist/aturi_validation.js
function isAtUriString(input2, options) {
  return parseAtUriString(input2, options).success;
}
function isValidAtUri(input2) {
  return isAtUriString(input2, { strict: false });
}
var INVALID_CHAR_REGEXP = /[^a-zA-Z0-9._~:@!$&'()*+,;=%/\\[\]#?-]/;
var AT_URI_REGEXP = /^(?<uri>at:\/\/(?<authority>[^/?#\s]+)(?:\/(?<collection>[^/?#\s]+)(?:\/(?<rkey>[^/?#\s]+))?)?(?<trailingSlash>\/)?)(?:\?(?<query>[^#\s]*))?(?:#(?<hash>[^\s]*))?$/;
function parseAtUriString(input2, options) {
  if (typeof input2 !== "string") {
    return failure("ATURI must be a string");
  }
  if (input2.length > 8192) {
    return failure("ATURI exceeds maximum length");
  }
  const invalidChar = input2.match(INVALID_CHAR_REGEXP);
  if (invalidChar) {
    return failure("Disallowed characters in ATURI (ASCII)");
  }
  const match = input2.match(AT_URI_REGEXP);
  const groups = match?.groups;
  if (!groups) {
    if (options?.detailed) {
      if (!input2.startsWith("at://")) {
        return failure('ATURI must start with "at://"');
      }
      if (input2.includes(" ")) {
        return failure("ATURI can not contain spaces");
      }
      if (input2.includes("//", 5)) {
        return failure("ATURI can not have empty path segments");
      }
      const pathStart = input2.indexOf("/", 5);
      if (pathStart !== -1) {
        const fragmentIndex = input2.indexOf("#");
        const pathEnd = fragmentIndex !== -1 ? fragmentIndex : input2.length;
        const secondSlash = input2.indexOf("/", pathStart + 1);
        if (secondSlash !== -1 && secondSlash !== pathEnd - 1) {
          return failure("ATURI can not have more than two path segments");
        }
      }
    }
    return failure("ATURI does not match expected format");
  }
  if (!isAtIdentifierString(groups.authority)) {
    return failure("ATURI has invalid authority");
  }
  if (groups.collection != null && !isValidNsid(groups.collection)) {
    return failure("ATURI has invalid collection");
  }
  if (groups.hash != null) {
    const result = parseJsonPointer(groups.hash, options);
    if (result.success) {
      groups.hash = result.value;
    } else {
      return failure(`ATURI has invalid fragment (${result.message})`);
    }
  }
  if (options?.strict !== false) {
    if (groups.trailingSlash != null) {
      return failure("ATURI can not have a trailing slash");
    }
    if (groups.query != null) {
      return failure("ATURI query part is not allowed");
    }
    if (groups.rkey != null && !isValidRecordKey(groups.rkey)) {
      return failure("ATURI has invalid record key");
    }
  }
  return success(groups);
}
var BASIC_JSON_POINTER_REGEXP = /^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/;
function parseJsonPointer(value, options) {
  if (!BASIC_JSON_POINTER_REGEXP.test(value)) {
    return failure("Invalid JSON pointer");
  }
  const result = parsePercentEncoding(value);
  if (!result.success && options?.strict === false) {
    return success(value);
  }
  return result;
}
function parsePercentEncoding(value) {
  try {
    return success(decodeURIComponent(value));
  } catch {
    return failure("Invalid percent-encoding");
  }
}

// node_modules/@atproto/syntax/dist/aturi.js
var ATP_URI_REGEX = (
  // proto-    --did--------------   --name----------------   --path----   --query--   --hash--
  /^(at:\/\/)?((?:did:[a-z0-9:%-]+)|(?:[a-z0-9][a-z0-9.:-]*))(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i
);
var RELATIVE_REGEX = /^(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;
var AtUri = class _AtUri {
  constructor(uri2, base3) {
    const parsed = base3 !== void 0 ? typeof base3 === "string" ? Object.assign(parse(base3), parseRelative(uri2)) : Object.assign({ host: base3.host }, parseRelative(uri2)) : parse(uri2);
    assertAtIdentifierString(parsed.host);
    this.hash = parsed.hash ?? "";
    this.host = parsed.host;
    this.pathname = parsed.pathname ?? "";
    this.searchParams = parsed.searchParams;
  }
  static make(handleOrDid, collection2, rkey) {
    let str2 = handleOrDid;
    if (collection2)
      str2 += "/" + collection2;
    if (rkey)
      str2 += "/" + rkey;
    return new _AtUri(str2);
  }
  get protocol() {
    return "at:";
  }
  get origin() {
    return `at://${this.host}`;
  }
  get did() {
    const { host } = this;
    if (isDidIdentifier(host))
      return host;
    throw new InvalidDidError(`AtUri "${this}" does not have a DID hostname`);
  }
  get hostname() {
    return this.host;
  }
  set hostname(v) {
    assertAtIdentifierString(v);
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
    const { collection: collection2 } = this;
    ensureValidNsid(collection2);
    return collection2;
  }
  set collection(v) {
    ensureValidNsid(v);
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
    ensureValidRecordKey(rkey);
    return rkey;
  }
  set rkey(v) {
    ensureValidRecordKey(v);
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
    if (pathname && !pathname.startsWith("/")) {
      pathname = `/${pathname}`;
    }
    while (pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    let qs = "";
    if (this.searchParams.size) {
      qs = `?${this.searchParams.toString()}`;
    }
    let fragment = this.hash;
    if (fragment === "#") {
      fragment = "";
    } else if (fragment && !fragment.startsWith("#")) {
      fragment = `#${fragment}`;
    }
    return `at://${this.host}${pathname}${qs}${fragment}`;
  }
};
function parse(str2) {
  const match = str2.match(ATP_URI_REGEX);
  if (!match) {
    throw new Error(`Invalid AT uri: ${str2}`);
  }
  return {
    host: match[2],
    hash: match[5],
    pathname: match[3],
    searchParams: new URLSearchParams(match[4])
  };
}
function parseRelative(str2) {
  const match = str2.match(RELATIVE_REGEX);
  if (!match) {
    throw new Error(`Invalid path: ${str2}`);
  }
  return {
    hash: match[3],
    pathname: match[1],
    searchParams: new URLSearchParams(match[2])
  };
}

// node_modules/@atproto/syntax/dist/datetime.js
var isoDatestringValidator = __toESM(require_dist2(), 1);
var { isValidISODateString } = ((m) => m.default ?? m)(isoDatestringValidator);
function isDatetimeString(input2) {
  return parseString(input2).success;
}
function isDatetimeStringLenient(input2) {
  if (typeof input2 !== "string")
    return false;
  try {
    if (isValidISODateString(input2))
      return true;
  } catch {
  }
  return isDatetimeString(input2);
}
var failure2 = (m) => ({ success: false, message: m });
var success2 = (v) => ({ success: true, value: v });
var DATETIME_REGEX = /^(?<full_year>[0-9]{4})-(?<date_month>0[1-9]|1[012])-(?<date_mday>[0-2][0-9]|3[01])T(?<time_hour>[0-1][0-9]|2[0-3]):(?<time_minute>[0-5][0-9]):(?<time_second>[0-5][0-9]|60)(?<time_secfrac>\.[0-9]+)?(?<time_offset>Z|(?<time_numoffset>[+-](?:[0-1][0-9]|2[0-3]):[0-5][0-9]))$/;
function parseString(input2) {
  if (typeof input2 !== "string") {
    return failure2("datetime must be a string");
  }
  if (input2.length > 64) {
    return failure2("datetime is too long (64 chars max)");
  }
  if (input2.endsWith("-00:00")) {
    return failure2('datetime can not use "-00:00" for UTC timezone');
  }
  if (!DATETIME_REGEX.test(input2)) {
    return failure2("datetime is not in a valid format (must match RFC 3339 & ISO 8601 with 'Z' or \xB1hh:mm timezone)");
  }
  const date = new Date(input2);
  return parseDate(date);
}
function parseDate(date) {
  const fullYear = date.getUTCFullYear();
  if (Number.isNaN(fullYear)) {
    return failure2("datetime did not parse as ISO 8601");
  }
  if (fullYear < 0) {
    return failure2("datetime normalized to a negative time");
  }
  if (fullYear > 9999) {
    return failure2("datetime year is too far in the future");
  }
  return success2(date);
}

// node_modules/@atproto/syntax/dist/language.js
var BCP47_REGEXP = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>[xX](-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>[xX](-[A-Za-z0-9]{1,8})+))$/;
function isValidLanguage(input2) {
  return BCP47_REGEXP.test(input2);
}

// node_modules/@atproto/syntax/dist/tid.js
var TID_LENGTH = 13;
var TID_REGEX = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
function isValidTid(input2) {
  return typeof input2 === "string" && input2.length === TID_LENGTH && TID_REGEX.test(input2);
}

// node_modules/@atproto/syntax/dist/uri.js
function isValidUri(input2) {
  return typeof input2 === "string" && /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(input2);
}

// node_modules/@atcute/uint8array/dist/index.js
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
var subtle = crypto.subtle;
var alloc = (size) => {
  return new Uint8Array(size);
};
var allocUnsafe = alloc;
var _fromCharCode = String.fromCharCode;

// node_modules/@atcute/multibase/dist/bases/base32-encode.js
var ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";
var _cc = /* @__PURE__ */ (() => {
  const t = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    t[i] = ALPHABET.charCodeAt(i);
  }
  return t;
})();
var _fromCharCode2 = String.fromCharCode;
var toBase32 = (bytes2) => {
  const len = bytes2.length;
  const full = len / 5 | 0;
  const rem = len - full * 5;
  const cc = _cc;
  let str2 = "";
  let ip = 0;
  const pairs = full / 2 | 0;
  for (let g = 0; g < pairs; g++) {
    const a0 = bytes2[ip], a1 = bytes2[ip + 1], a2 = bytes2[ip + 2], a3 = bytes2[ip + 3], a4 = bytes2[ip + 4];
    const b0 = bytes2[ip + 5], b1 = bytes2[ip + 6], b2 = bytes2[ip + 7], b3 = bytes2[ip + 8], b4 = bytes2[ip + 9];
    str2 += _fromCharCode2(cc[a0 >>> 3], cc[(a0 << 2 | a1 >>> 6) & 31], cc[a1 >>> 1 & 31], cc[(a1 << 4 | a2 >>> 4) & 31], cc[(a2 << 1 | a3 >>> 7) & 31], cc[a3 >>> 2 & 31], cc[(a3 << 3 | a4 >>> 5) & 31], cc[a4 & 31], cc[b0 >>> 3], cc[(b0 << 2 | b1 >>> 6) & 31], cc[b1 >>> 1 & 31], cc[(b1 << 4 | b2 >>> 4) & 31], cc[(b2 << 1 | b3 >>> 7) & 31], cc[b3 >>> 2 & 31], cc[(b3 << 3 | b4 >>> 5) & 31], cc[b4 & 31]);
    ip += 10;
  }
  if (full & 1) {
    const b0 = bytes2[ip], b1 = bytes2[ip + 1], b2 = bytes2[ip + 2], b3 = bytes2[ip + 3], b4 = bytes2[ip + 4];
    str2 += _fromCharCode2(cc[b0 >>> 3], cc[(b0 << 2 | b1 >>> 6) & 31], cc[b1 >>> 1 & 31], cc[(b1 << 4 | b2 >>> 4) & 31], cc[(b2 << 1 | b3 >>> 7) & 31], cc[b3 >>> 2 & 31], cc[(b3 << 3 | b4 >>> 5) & 31], cc[b4 & 31]);
    ip += 5;
  }
  if (rem > 0) {
    let buffer = 0;
    let bits = 0;
    for (let i = ip; i < len; i++) {
      buffer = buffer << 8 | bytes2[i];
      bits += 8;
    }
    while (bits >= 5) {
      bits -= 5;
      str2 += _fromCharCode2(cc[buffer >>> bits & 31]);
    }
    if (bits > 0) {
      str2 += _fromCharCode2(cc[buffer << 5 - bits & 31]);
    }
  }
  return str2;
};

// node_modules/@atcute/multibase/dist/bases/base32.js
var ALPHABET2 = "abcdefghijklmnopqrstuvwxyz234567";
var _decodeLut = /* @__PURE__ */ (() => {
  const t = new Uint8Array(128).fill(255);
  for (let i = 0; i < 32; i++) {
    t[ALPHABET2.charCodeAt(i)] = i;
  }
  return t;
})();
var fromBase32 = (str2) => {
  const end = str2.length;
  const bytes2 = allocUnsafe(end * 5 / 8 | 0);
  let written = 0;
  let i = 0;
  const fullGroups = end - end % 8;
  for (; i < fullGroups; i += 8) {
    const k0 = str2.charCodeAt(i);
    const k1 = str2.charCodeAt(i + 1);
    const k2 = str2.charCodeAt(i + 2);
    const k3 = str2.charCodeAt(i + 3);
    const k4 = str2.charCodeAt(i + 4);
    const k5 = str2.charCodeAt(i + 5);
    const k6 = str2.charCodeAt(i + 6);
    const k7 = str2.charCodeAt(i + 7);
    if ((k0 | k1 | k2 | k3 | k4 | k5 | k6 | k7) & ~127) {
      throw new SyntaxError(`invalid base string`);
    }
    const c0 = _decodeLut[k0];
    const c1 = _decodeLut[k1];
    const c2 = _decodeLut[k2];
    const c3 = _decodeLut[k3];
    const c4 = _decodeLut[k4];
    const c5 = _decodeLut[k5];
    const c6 = _decodeLut[k6];
    const c7 = _decodeLut[k7];
    if ((c0 | c1 | c2 | c3 | c4 | c5 | c6 | c7) & 224) {
      throw new SyntaxError(`invalid base string`);
    }
    bytes2[written] = c0 << 3 | c1 >>> 2;
    bytes2[written + 1] = (c1 << 6 | c2 << 1 | c3 >>> 4) & 255;
    bytes2[written + 2] = (c3 << 4 | c4 >>> 1) & 255;
    bytes2[written + 3] = (c4 << 7 | c5 << 2 | c6 >>> 3) & 255;
    bytes2[written + 4] = (c6 << 5 | c7) & 255;
    written += 5;
  }
  if (i < end) {
    let bits = 0;
    let buffer = 0;
    for (; i < end; ++i) {
      const code = str2.charCodeAt(i);
      const value = code < 128 ? _decodeLut[code] : 255;
      if (value & 224) {
        throw new SyntaxError(`invalid base string`);
      }
      buffer = buffer << 5 | value;
      bits += 5;
      if (bits >= 8) {
        bits -= 8;
        bytes2[written++] = 255 & buffer >> bits;
      }
    }
    if (bits >= 5 || (255 & buffer << 8 - bits) !== 0) {
      throw new SyntaxError(`unexpected end of data`);
    }
  }
  return bytes2;
};

// node_modules/@atcute/cid/dist/codec.js
var CID_VERSION = 1;
var HASH_SHA256 = 18;
var CODEC_RAW = 85;
var CODEC_DCBOR = 113;
var decodeFirst = (bytes2) => {
  if (bytes2.length < 36) {
    throw new RangeError(`cid too short`);
  }
  const version = bytes2[0];
  const codec = bytes2[1];
  const digestType = bytes2[2];
  const digestSize = bytes2[3];
  if (version !== CID_VERSION) {
    throw new RangeError(`incorrect cid version (got v${version})`);
  }
  if (codec !== CODEC_DCBOR && codec !== CODEC_RAW) {
    throw new RangeError(`incorrect cid codec (got 0x${codec.toString(16)})`);
  }
  if (digestType !== HASH_SHA256) {
    throw new RangeError(`incorrect cid digest codec (got 0x${digestType.toString(16)})`);
  }
  if (digestSize !== 32) {
    throw new RangeError(`incorrect cid digest size (got ${digestSize})`);
  }
  const cid4 = {
    version: CID_VERSION,
    codec,
    digest: {
      codec: digestType,
      contents: bytes2.subarray(4, 36)
    },
    bytes: bytes2.subarray(0, 36)
  };
  return [cid4, bytes2.subarray(36)];
};
var decode = (bytes2) => {
  const [cid4, remainder] = decodeFirst(bytes2);
  if (remainder.length !== 0) {
    throw new RangeError(`cid bytes includes remainder`);
  }
  return cid4;
};
var fromString = (input2) => {
  if (input2.length !== 59 || input2[0] !== "b") {
    throw new SyntaxError(`not a valid cid string`);
  }
  const bytes2 = fromBase32(input2.slice(1));
  return decode(bytes2);
};
var toString = (cid4) => {
  return `b${toBase32(cid4.bytes)}`;
};

// dist/src/protocol/native-schema.js
var import_did3 = __toESM(require_dist(), 1);

// node_modules/@atproto/common-web/dist/check.js
var check_exports = {};
__export(check_exports, {
  assure: () => assure,
  create: () => create,
  is: () => is,
  isObject: () => isObject
});
var is = (obj, def2) => {
  return def2.safeParse(obj).success;
};
var create = (def2) => (v) => def2.safeParse(v).success;
var assure = (def2, obj) => {
  return def2.parse(obj);
};
var isObject = (obj) => {
  return typeof obj === "object" && obj !== null;
};

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bytes.js
var empty = new Uint8Array(0);
function equals(aa, bb) {
  if (aa === bb) {
    return true;
  }
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }
  for (let ii = 0; ii < aa.byteLength; ii++) {
    if (aa[ii] !== bb[ii]) {
      return false;
    }
  }
  return true;
}
function coerce(o) {
  if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") {
    return o;
  }
  if (o instanceof ArrayBuffer) {
    return new Uint8Array(o);
  }
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error("Unknown type, must be binary type");
}

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/vendor/base-x.js
function base(ALPHABET3, name) {
  if (ALPHABET3.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET3.length; i++) {
    var x = ALPHABET3.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET3.length;
  var LEADER = ALPHABET3.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256);
  var iFACTOR = Math.log(256) / Math.log(BASE);
  function encode5(source) {
    if (source instanceof Uint8Array)
      ;
    else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    var zeroes = 0;
    var length3 = 0;
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
      var i2 = 0;
      for (var it1 = size - 1; (carry !== 0 || i2 < length3) && it1 !== -1; it1--, i2++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length3 = i2;
      pbegin++;
    }
    var it2 = size - length3;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    var str2 = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str2 += ALPHABET3.charAt(b58[it2]);
    }
    return str2;
  }
  function decodeUnsafe(source) {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    var psz = 0;
    if (source[psz] === " ") {
      return;
    }
    var zeroes = 0;
    var length3 = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    var size = (source.length - psz) * FACTOR + 1 >>> 0;
    var b256 = new Uint8Array(size);
    while (source[psz]) {
      var carry = BASE_MAP[source.charCodeAt(psz)];
      if (carry === 255) {
        return;
      }
      var i2 = 0;
      for (var it3 = size - 1; (carry !== 0 || i2 < length3) && it3 !== -1; it3--, i2++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length3 = i2;
      psz++;
    }
    if (source[psz] === " ") {
      return;
    }
    var it4 = size - length3;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = new Uint8Array(zeroes + (size - it4));
    var j2 = zeroes;
    while (it4 !== size) {
      vch[j2++] = b256[it4++];
    }
    return vch;
  }
  function decode10(string2) {
    var buffer = decodeUnsafe(string2);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Non-${name} character`);
  }
  return {
    encode: encode5,
    decodeUnsafe,
    decode: decode10
  };
}
var src = base;
var _brrp__multiformats_scope_baseX = src;
var base_x_default = _brrp__multiformats_scope_baseX;

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base.js
var Encoder = class {
  name;
  prefix;
  baseEncode;
  constructor(name, prefix2, baseEncode) {
    this.name = name;
    this.prefix = prefix2;
    this.baseEncode = baseEncode;
  }
  encode(bytes2) {
    if (bytes2 instanceof Uint8Array) {
      return `${this.prefix}${this.baseEncode(bytes2)}`;
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
  constructor(name, prefix2, baseDecode) {
    this.name = name;
    this.prefix = prefix2;
    const prefixCodePoint = prefix2.codePointAt(0);
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
  or(decoder) {
    return or(this, decoder);
  }
};
var ComposedDecoder = class {
  decoders;
  constructor(decoders) {
    this.decoders = decoders;
  }
  or(decoder) {
    return or(this, decoder);
  }
  decode(input2) {
    const prefix2 = input2[0];
    const decoder = this.decoders[prefix2];
    if (decoder != null) {
      return decoder.decode(input2);
    } else {
      throw RangeError(`Unable to decode multibase string ${JSON.stringify(input2)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
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
  constructor(name, prefix2, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix2;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder(name, prefix2, baseEncode);
    this.decoder = new Decoder(name, prefix2, baseDecode);
  }
  encode(input2) {
    return this.encoder.encode(input2);
  }
  decode(input2) {
    return this.decoder.decode(input2);
  }
};
function from({ name, prefix: prefix2, encode: encode5, decode: decode10 }) {
  return new Codec(name, prefix2, encode5, decode10);
}
function baseX({ name, prefix: prefix2, alphabet }) {
  const { encode: encode5, decode: decode10 } = base_x_default(alphabet, name);
  return from({
    prefix: prefix2,
    name,
    encode: encode5,
    decode: (text) => coerce(decode10(text))
  });
}
function decode2(string2, alphabetIdx, bitsPerChar, name) {
  let end = string2.length;
  while (string2[end - 1] === "=") {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = alphabetIdx[string2[i]];
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
function rfc4648({ name, prefix: prefix2, bitsPerChar, alphabet }) {
  const alphabetIdx = createAlphabetIdx(alphabet);
  return from({
    prefix: prefix2,
    name,
    encode(input2) {
      return encode(input2, alphabet, bitsPerChar);
    },
    decode(input2) {
      return decode2(input2, alphabetIdx, bitsPerChar, name);
    }
  });
}

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base32.js
var base32 = rfc4648({
  prefix: "b",
  name: "base32",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567",
  bitsPerChar: 5
});
var base32upper = rfc4648({
  prefix: "B",
  name: "base32upper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  bitsPerChar: 5
});
var base32pad = rfc4648({
  prefix: "c",
  name: "base32pad",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
  bitsPerChar: 5
});
var base32padupper = rfc4648({
  prefix: "C",
  name: "base32padupper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
  bitsPerChar: 5
});
var base32hex = rfc4648({
  prefix: "v",
  name: "base32hex",
  alphabet: "0123456789abcdefghijklmnopqrstuv",
  bitsPerChar: 5
});
var base32hexupper = rfc4648({
  prefix: "V",
  name: "base32hexupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
  bitsPerChar: 5
});
var base32hexpad = rfc4648({
  prefix: "t",
  name: "base32hexpad",
  alphabet: "0123456789abcdefghijklmnopqrstuv=",
  bitsPerChar: 5
});
var base32hexpadupper = rfc4648({
  prefix: "T",
  name: "base32hexpadupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
  bitsPerChar: 5
});
var base32z = rfc4648({
  prefix: "h",
  name: "base32z",
  alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
  bitsPerChar: 5
});

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base36.js
var base36 = baseX({
  prefix: "k",
  name: "base36",
  alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
var base36upper = baseX({
  prefix: "K",
  name: "base36upper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base58.js
var base58btc = baseX({
  name: "base58btc",
  prefix: "z",
  alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
var base58flickr = baseX({
  name: "base58flickr",
  prefix: "Z",
  alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/vendor/varint.js
var encode_1 = encode2;
var MSB = 128;
var REST = 127;
var MSBALL = ~REST;
var INT = Math.pow(2, 31);
function encode2(num, out, offset) {
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
  encode2.bytes = offset - oldOffset + 1;
  return out;
}
var decode3 = read;
var MSB$1 = 128;
var REST$1 = 127;
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
var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);
var length = function(value) {
  return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
};
var varint = {
  encode: encode_1,
  decode: decode3,
  encodingLength: length
};
var _brrp_varint = varint;
var varint_default = _brrp_varint;

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/varint.js
function decode4(data, offset = 0) {
  const code = varint_default.decode(data, offset);
  return [code, varint_default.decode.bytes];
}
function encodeTo(int, target, offset = 0) {
  varint_default.encode(int, target, offset);
  return target;
}
function encodingLength(int) {
  return varint_default.encodingLength(int);
}

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/hashes/digest.js
function create2(code, digest) {
  const size = digest.byteLength;
  const sizeOffset = encodingLength(code);
  const digestOffset = sizeOffset + encodingLength(size);
  const bytes2 = new Uint8Array(digestOffset + size);
  encodeTo(code, bytes2, 0);
  encodeTo(size, bytes2, sizeOffset);
  bytes2.set(digest, digestOffset);
  return new Digest(code, size, digest, bytes2);
}
function decode5(multihash) {
  const bytes2 = coerce(multihash);
  const [code, sizeOffset] = decode4(bytes2);
  const [size, digestOffset] = decode4(bytes2.subarray(sizeOffset));
  const digest = bytes2.subarray(sizeOffset + digestOffset);
  if (digest.byteLength !== size) {
    throw new Error("Incorrect length");
  }
  return new Digest(code, size, digest, bytes2);
}
function equals2(a, b) {
  if (a === b) {
    return true;
  } else {
    const data = b;
    return a.code === data.code && a.size === data.size && data.bytes instanceof Uint8Array && equals(a.bytes, data.bytes);
  }
}
var Digest = class {
  code;
  size;
  digest;
  bytes;
  /**
   * Creates a multihash digest.
   */
  constructor(code, size, digest, bytes2) {
    this.code = code;
    this.size = size;
    this.digest = digest;
    this.bytes = bytes2;
  }
};

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/cid.js
function format(link2, base3) {
  const { bytes: bytes2, version } = link2;
  switch (version) {
    case 0:
      return toStringV0(bytes2, baseCache(link2), base3 ?? base58btc.encoder);
    default:
      return toStringV1(bytes2, baseCache(link2), base3 ?? base32.encoder);
  }
}
var cache = /* @__PURE__ */ new WeakMap();
function baseCache(cid4) {
  const baseCache3 = cache.get(cid4);
  if (baseCache3 == null) {
    const baseCache4 = /* @__PURE__ */ new Map();
    cache.set(cid4, baseCache4);
    return baseCache4;
  }
  return baseCache3;
}
var CID = class _CID {
  code;
  version;
  multihash;
  bytes;
  "/";
  /**
   * @param version - Version of the CID
   * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param multihash - (Multi)hash of the of the content.
   */
  constructor(version, code, multihash, bytes2) {
    this.code = code;
    this.version = version;
    this.multihash = multihash;
    this.bytes = bytes2;
    this["/"] = bytes2;
  }
  /**
   * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
   * please either use `CID.asCID(cid)` or switch to new signalling mechanism
   *
   * @deprecated
   */
  get asCID() {
    return this;
  }
  // ArrayBufferView
  get byteOffset() {
    return this.bytes.byteOffset;
  }
  // ArrayBufferView
  get byteLength() {
    return this.bytes.byteLength;
  }
  toV0() {
    switch (this.version) {
      case 0: {
        return this;
      }
      case 1: {
        const { code, multihash } = this;
        if (code !== DAG_PB_CODE) {
          throw new Error("Cannot convert a non dag-pb CID to CIDv0");
        }
        if (multihash.code !== SHA_256_CODE) {
          throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
        }
        return _CID.createV0(multihash);
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
      }
    }
  }
  toV1() {
    switch (this.version) {
      case 0: {
        const { code, digest } = this.multihash;
        const multihash = create2(code, digest);
        return _CID.createV1(this.code, multihash);
      }
      case 1: {
        return this;
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
      }
    }
  }
  equals(other) {
    return _CID.equals(this, other);
  }
  static equals(self, other) {
    const unknown2 = other;
    return unknown2 != null && self.code === unknown2.code && self.version === unknown2.version && equals2(self.multihash, unknown2.multihash);
  }
  toString(base3) {
    return format(this, base3);
  }
  toJSON() {
    return { "/": format(this) };
  }
  link() {
    return this;
  }
  [Symbol.toStringTag] = "CID";
  // Legacy
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return `CID(${this.toString()})`;
  }
  /**
   * Takes any input `value` and returns a `CID` instance if it was
   * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
   * it will return value back. If `value` is not instance of this CID
   * class, but is compatible CID it will return new instance of this
   * `CID` class. Otherwise returns null.
   *
   * This allows two different incompatible versions of CID library to
   * co-exist and interop as long as binary interface is compatible.
   */
  static asCID(input2) {
    if (input2 == null) {
      return null;
    }
    const value = input2;
    if (value instanceof _CID) {
      return value;
    } else if (value["/"] != null && value["/"] === value.bytes || value.asCID === value) {
      const { version, code, multihash, bytes: bytes2 } = value;
      return new _CID(version, code, multihash, bytes2 ?? encodeCID(version, code, multihash.bytes));
    } else if (value[cidSymbol] === true) {
      const { version, multihash, code } = value;
      const digest = decode5(multihash);
      return _CID.create(version, code, digest);
    } else {
      return null;
    }
  }
  /**
   * @param version - Version of the CID
   * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param digest - (Multi)hash of the of the content.
   */
  static create(version, code, digest) {
    if (typeof code !== "number") {
      throw new Error("String codecs are no longer supported");
    }
    if (!(digest.bytes instanceof Uint8Array)) {
      throw new Error("Invalid digest");
    }
    switch (version) {
      case 0: {
        if (code !== DAG_PB_CODE) {
          throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
        } else {
          return new _CID(version, code, digest, digest.bytes);
        }
      }
      case 1: {
        const bytes2 = encodeCID(version, code, digest.bytes);
        return new _CID(version, code, digest, bytes2);
      }
      default: {
        throw new Error("Invalid version");
      }
    }
  }
  /**
   * Simplified version of `create` for CIDv0.
   */
  static createV0(digest) {
    return _CID.create(0, DAG_PB_CODE, digest);
  }
  /**
   * Simplified version of `create` for CIDv1.
   *
   * @param code - Content encoding format code.
   * @param digest - Multihash of the content.
   */
  static createV1(code, digest) {
    return _CID.create(1, code, digest);
  }
  /**
   * Decoded a CID from its binary representation. The byte array must contain
   * only the CID with no additional bytes.
   *
   * An error will be thrown if the bytes provided do not contain a valid
   * binary representation of a CID.
   */
  static decode(bytes2) {
    const [cid4, remainder] = _CID.decodeFirst(bytes2);
    if (remainder.length !== 0) {
      throw new Error("Incorrect length");
    }
    return cid4;
  }
  /**
   * Decoded a CID from its binary representation at the beginning of a byte
   * array.
   *
   * Returns an array with the first element containing the CID and the second
   * element containing the remainder of the original byte array. The remainder
   * will be a zero-length byte array if the provided bytes only contained a
   * binary CID representation.
   */
  static decodeFirst(bytes2) {
    const specs = _CID.inspectBytes(bytes2);
    const prefixSize = specs.size - specs.multihashSize;
    const multihashBytes = coerce(bytes2.subarray(prefixSize, prefixSize + specs.multihashSize));
    if (multihashBytes.byteLength !== specs.multihashSize) {
      throw new Error("Incorrect length");
    }
    const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
    const digest = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
    const cid4 = specs.version === 0 ? _CID.createV0(digest) : _CID.createV1(specs.codec, digest);
    return [cid4, bytes2.subarray(specs.size)];
  }
  /**
   * Inspect the initial bytes of a CID to determine its properties.
   *
   * Involves decoding up to 4 varints. Typically this will require only 4 to 6
   * bytes but for larger multicodec code values and larger multihash digest
   * lengths these varints can be quite large. It is recommended that at least
   * 10 bytes be made available in the `initialBytes` argument for a complete
   * inspection.
   */
  static inspectBytes(initialBytes) {
    let offset = 0;
    const next = () => {
      const [i, length3] = decode4(initialBytes.subarray(offset));
      offset += length3;
      return i;
    };
    let version = next();
    let codec = DAG_PB_CODE;
    if (version === 18) {
      version = 0;
      offset = 0;
    } else {
      codec = next();
    }
    if (version !== 0 && version !== 1) {
      throw new RangeError(`Invalid CID version ${version}`);
    }
    const prefixSize = offset;
    const multihashCode = next();
    const digestSize = next();
    const size = offset + digestSize;
    const multihashSize = size - prefixSize;
    return { version, codec, multihashCode, digestSize, multihashSize, size };
  }
  /**
   * Takes cid in a string representation and creates an instance. If `base`
   * decoder is not provided will use a default from the configuration. It will
   * throw an error if encoding of the CID is not compatible with supplied (or
   * a default decoder).
   */
  static parse(source, base3) {
    const [prefix2, bytes2] = parseCIDtoBytes(source, base3);
    const cid4 = _CID.decode(bytes2);
    if (cid4.version === 0 && source[0] !== "Q") {
      throw Error("Version 0 CID string must not include multibase prefix");
    }
    baseCache(cid4).set(prefix2, source);
    return cid4;
  }
};
function parseCIDtoBytes(source, base3) {
  switch (source[0]) {
    // CIDv0 is parsed differently
    case "Q": {
      const decoder = base3 ?? base58btc;
      return [
        base58btc.prefix,
        decoder.decode(`${base58btc.prefix}${source}`)
      ];
    }
    case base58btc.prefix: {
      const decoder = base3 ?? base58btc;
      return [base58btc.prefix, decoder.decode(source)];
    }
    case base32.prefix: {
      const decoder = base3 ?? base32;
      return [base32.prefix, decoder.decode(source)];
    }
    case base36.prefix: {
      const decoder = base3 ?? base36;
      return [base36.prefix, decoder.decode(source)];
    }
    default: {
      if (base3 == null) {
        throw Error("To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided");
      }
      return [source[0], base3.decode(source)];
    }
  }
}
function toStringV0(bytes2, cache3, base3) {
  const { prefix: prefix2 } = base3;
  if (prefix2 !== base58btc.prefix) {
    throw Error(`Cannot string encode V0 in ${base3.name} encoding`);
  }
  const cid4 = cache3.get(prefix2);
  if (cid4 == null) {
    const cid5 = base3.encode(bytes2).slice(1);
    cache3.set(prefix2, cid5);
    return cid5;
  } else {
    return cid4;
  }
}
function toStringV1(bytes2, cache3, base3) {
  const { prefix: prefix2 } = base3;
  const cid4 = cache3.get(prefix2);
  if (cid4 == null) {
    const cid5 = base3.encode(bytes2);
    cache3.set(prefix2, cid5);
    return cid5;
  } else {
    return cid4;
  }
}
var DAG_PB_CODE = 112;
var SHA_256_CODE = 18;
function encodeCID(version, code, multihash) {
  const codeOffset = encodingLength(version);
  const hashOffset = codeOffset + encodingLength(code);
  const bytes2 = new Uint8Array(hashOffset + multihash.byteLength);
  encodeTo(version, bytes2, 0);
  encodeTo(code, bytes2, codeOffset);
  bytes2.set(multihash, hashOffset);
  return bytes2;
}
var cidSymbol = /* @__PURE__ */ Symbol.for("@ipld/js-cid/CID");

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/hashes/hasher.js
var DEFAULT_MIN_DIGEST_LENGTH = 20;
function from2({ name, code, encode: encode5, minDigestLength, maxDigestLength }) {
  return new Hasher(name, code, encode5, minDigestLength, maxDigestLength);
}
var Hasher = class {
  name;
  code;
  encode;
  minDigestLength;
  maxDigestLength;
  constructor(name, code, encode5, minDigestLength, maxDigestLength) {
    this.name = name;
    this.code = code;
    this.encode = encode5;
    this.minDigestLength = minDigestLength ?? DEFAULT_MIN_DIGEST_LENGTH;
    this.maxDigestLength = maxDigestLength;
  }
  digest(input2, options) {
    if (options?.truncate != null) {
      if (options.truncate < this.minDigestLength) {
        throw new Error(`Invalid truncate option, must be greater than or equal to ${this.minDigestLength}`);
      }
      if (this.maxDigestLength != null && options.truncate > this.maxDigestLength) {
        throw new Error(`Invalid truncate option, must be less than or equal to ${this.maxDigestLength}`);
      }
    }
    if (input2 instanceof Uint8Array) {
      const result = this.encode(input2);
      if (result instanceof Uint8Array) {
        return createDigest(result, this.code, options?.truncate);
      }
      return result.then((digest) => createDigest(digest, this.code, options?.truncate));
    } else {
      throw Error("Unknown type, must be binary type");
    }
  }
};
function createDigest(digest, code, truncate) {
  if (truncate != null && truncate !== digest.byteLength) {
    if (truncate > digest.byteLength) {
      throw new Error(`Invalid truncate option, must be less than or equal to ${digest.byteLength}`);
    }
    digest = digest.subarray(0, truncate);
  }
  return create2(code, digest);
}

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/hashes/sha2-browser.js
function sha(name) {
  return async (data) => new Uint8Array(await crypto.subtle.digest(name, data));
}
var sha256 = from2({
  name: "sha2-256",
  code: 18,
  encode: sha("SHA-256")
});
var sha512 = from2({
  name: "sha2-512",
  code: 19,
  encode: sha("SHA-512")
});

// node_modules/@atproto/lex-data/dist/lib/util.js
function isUint8(val) {
  return Number.isInteger(val) && val >= 0 && val < 256;
}

// node_modules/@atproto/lex-data/dist/object.js
function isObject2(input2) {
  return input2 != null && typeof input2 === "object";
}
var ObjectProto = Object.prototype;

// node_modules/@atproto/lex-data/dist/lib/nodejs-buffer.js
var BUFFER = /* @__PURE__ */ (() => "Bu" + "f".repeat(2) + "er")();
var NodeJSBuffer = globalThis?.[BUFFER]?.prototype instanceof Uint8Array && "byteLength" in globalThis[BUFFER] ? globalThis[BUFFER] : (
  /* v8 ignore next -- @preserve */
  null
);

// node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base64.js
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

// node_modules/@atproto/lex-data/dist/uint8array-from-base64.js
var Buffer = NodeJSBuffer;
var fromBase64Native = typeof Uint8Array.fromBase64 === "function" ? function fromBase64Native2(b64, alphabet = "base64") {
  return Uint8Array.fromBase64(b64, {
    alphabet,
    lastChunkHandling: "loose"
  });
} : (
  /* v8 ignore next -- @preserve */
  null
);
var fromBase64Node = Buffer ? function fromBase64Node2(b64, alphabet = "base64") {
  const bytes2 = Buffer.from(b64, alphabet);
  verifyBase64ForBytes(b64, bytes2);
  return new Uint8Array(bytes2.buffer, bytes2.byteOffset, bytes2.byteLength);
} : (
  /* v8 ignore next -- @preserve */
  null
);
function fromBase64Ponyfill(b64, alphabet = "base64") {
  const isPadded = b64.endsWith("=");
  const base3 = alphabet === "base64url" ? isPadded ? base64urlpad : base64url : isPadded ? base64pad : base64;
  const bytes2 = base3.decoder.decode(`${base3.prefix}${b64}`);
  verifyBase64ForBytes(b64, bytes2);
  return bytes2;
}
function verifyBase64ForBytes(b64, bytes2) {
  const paddingCount = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  const trimmedLength = b64.length - paddingCount;
  const expectedByteLength = Math.floor(trimmedLength * 3 / 4);
  if (bytes2.length !== expectedByteLength) {
    throw new Error("Invalid base64 string");
  }
  const expectedB64Length = bytes2.length / 3 * 4;
  const expectedPaddingCount = expectedB64Length % 4 === 0 ? 0 : 4 - expectedB64Length % 4;
  const expectedFullB64Length = expectedB64Length + expectedPaddingCount;
  if (b64.length > expectedFullB64Length) {
    throw new Error("Invalid base64 string");
  }
  for (let i = Math.ceil(expectedB64Length); i < b64.length - paddingCount; i++) {
    const code = b64.charCodeAt(i);
    if (!(code >= 65 && code <= 90) && // A-Z
    !(code >= 97 && code <= 122) && // a-z
    !(code >= 48 && code <= 57) && // 0-9
    code !== 43 && // +
    code !== 47) {
      throw new Error("Invalid base64 string");
    }
  }
}

// node_modules/@atproto/lex-data/dist/uint8array-to-base64.js
var Buffer2 = NodeJSBuffer;
var toBase64Native = typeof Uint8Array.prototype.toBase64 === "function" ? function toBase64Native2(bytes2, alphabet = "base64") {
  return bytes2.toBase64({ alphabet, omitPadding: true });
} : (
  /* v8 ignore next -- @preserve */
  null
);
var toBase64Node = Buffer2 ? function toBase64Node2(bytes2, alphabet = "base64") {
  const buffer = bytes2 instanceof Buffer2 ? bytes2 : Buffer2.from(bytes2);
  const b64 = buffer.toString(alphabet);
  return b64.charCodeAt(b64.length - 1) === /* '=' */
  61 ? b64.charCodeAt(b64.length - 2) === /* '=' */
  61 ? b64.slice(0, -2) : b64.slice(0, -1) : b64;
} : (
  /* v8 ignore next -- @preserve */
  null
);
function toBase64Ponyfill(bytes2, alphabet = "base64") {
  const codec = alphabet === "base64url" ? base64url : base64;
  return codec.encoder.encode(bytes2).slice(codec.prefix.length);
}

// node_modules/@atproto/lex-data/dist/uint8array.js
var toBase64 = (
  /* v8 ignore next -- @preserve */
  toBase64Native ?? toBase64Node ?? toBase64Ponyfill
);
var fromBase64 = (
  /* v8 ignore next -- @preserve */
  fromBase64Native ?? fromBase64Node ?? fromBase64Ponyfill
);
if (toBase64 === toBase64Ponyfill || fromBase64 === fromBase64Ponyfill) {
  /* @__PURE__ */ console.warn("[@atproto/lex-data]: Uint8Array.fromBase64 / Uint8Array.prototype.toBase64 not available in this environment. Falling back to ponyfill implementation.");
}
function ui8Equals(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

// node_modules/@atproto/lex-data/dist/cid.js
var CBOR_DATA_CODEC = 113;
var RAW_DATA_CODEC = 85;
var SHA256_HASH_CODE = sha256.code;
var SHA512_HASH_CODE = sha512.code;
function isRawCid(cid4) {
  return cid4.version === 1 && cid4.code === RAW_DATA_CODEC;
}
function isDaslCid(cid4) {
  return cid4.version === 1 && (cid4.code === RAW_DATA_CODEC || cid4.code === CBOR_DATA_CODEC) && cid4.multihash.code === SHA256_HASH_CODE && cid4.multihash.digest.byteLength === 32;
}
function isCborCid(cid4) {
  return cid4.code === CBOR_DATA_CODEC && isDaslCid(cid4);
}
function checkCid(cid4, options) {
  switch (options?.flavor) {
    case void 0:
      return true;
    case "cbor":
      return isCborCid(cid4);
    case "dasl":
      return isDaslCid(cid4);
    case "raw":
      return isRawCid(cid4);
    default:
      throw new TypeError(`Unknown CID flavor: ${options?.flavor}`);
  }
}
function isCid(value, options) {
  return isCidImplementation(value) && checkCid(value, options);
}
function isCidImplementation(value) {
  if (CID.asCID(value)) {
    return value.bytes != null;
  } else {
    try {
      if (!isObject2(value))
        return false;
      const val = value;
      if (val.version !== 0 && val.version !== 1)
        return false;
      if (!isUint8(val.code))
        return false;
      if (!isObject2(val.multihash))
        return false;
      const mh = val.multihash;
      if (!isUint8(mh.code))
        return false;
      if (!(mh.digest instanceof Uint8Array))
        return false;
      if (!(val.bytes instanceof Uint8Array))
        return false;
      if (val.bytes[0] !== val.version)
        return false;
      if (val.bytes[1] !== val.code)
        return false;
      if (val.bytes[2] !== mh.code)
        return false;
      if (val.bytes[3] !== mh.digest.length)
        return false;
      if (val.bytes.length !== 4 + mh.digest.length)
        return false;
      if (!ui8Equals(val.bytes.subarray(4), mh.digest))
        return false;
      if (typeof val.equals !== "function")
        return false;
      if (val.equals(val) !== true)
        return false;
      return true;
    } catch {
      return false;
    }
  }
}

// node_modules/unicode-segmenter/core.js
function decodeUnicodeData(data, cats = "") {
  let buf = (
    /** @type {Array<CategorizedUnicodeRange<T>>} */
    []
  ), nums = data.split(",").map((s) => s ? parseInt(s, 36) : 0), n = 0;
  for (let i = 0; i < nums.length; i++)
    i % 2 ? buf.push([
      n,
      n + nums[i],
      /** @type {T} */
      cats ? parseInt(cats[i >> 1], 36) : 0
    ]) : n = nums[i];
  return buf;
}
function findUnicodeRangeIndex(cp, ranges, lo = 0, hi = ranges.length - 1) {
  while (lo <= hi) {
    let mid = lo + hi >>> 1, range = ranges[mid];
    if (cp < range[0]) hi = mid - 1;
    else if (cp > range[1]) lo = mid + 1;
    else return mid;
  }
  return -1;
}

// node_modules/unicode-segmenter/_grapheme_data.js
var grapheme_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  ",9,a,,b,1,d,,e,h,3j,w,4p,,4t,,4u,,lc,33,w3,6,13l,18,14v,,14x,1,150,1,153,,16o,5,174,a,17g,,18r,k,19s,,1cm,6,1ct,,1cv,5,1d3,1,1d6,3,1e7,,1e9,,1f4,q,1ie,a,1kb,8,1kt,,1li,3,1ln,8,1lx,2,1m1,4,1nd,2,1ow,1,1p3,8,1qi,n,1r6,,1r7,v,1s3,,1tm,,1tn,,1to,,1tq,2,1tt,7,1u1,3,1u5,,1u6,1,1u9,6,1uq,1,1vl,,1vm,1,1x8,,1xa,,1xb,1,1xd,3,1xj,1,1xn,1,1xp,,1xz,,1ya,1,1z2,,1z5,1,1z7,,20s,,20u,2,20x,1,213,1,217,2,21d,,228,1,22d,,22p,1,22r,,24c,,24e,2,24h,4,24n,1,24p,,24r,1,24t,,25e,1,262,5,269,,26a,1,27w,,27y,1,280,,281,3,287,1,28b,1,28d,,28l,2,28y,1,29u,,2bi,,2bj,,2bk,,2bl,1,2bq,2,2bu,2,2bx,,2c7,,2dc,,2dd,2,2dg,,2f0,,2f2,2,2f5,3,2fa,2,2fe,3,2fp,1,2g2,1,2gx,,2gy,1,2ik,,2im,,2in,1,2ip,,2iq,,2ir,1,2iu,2,2iy,3,2j9,1,2jm,1,2k3,,2kg,1,2ki,1,2m3,1,2m6,,2m7,1,2m9,3,2me,2,2mi,2,2ml,,2mm,,2mv,,2n6,1,2o1,,2o2,1,2q2,,2q7,,2q8,1,2qa,2,2qe,,2qg,6,2qn,,2r6,1,2sx,,2sz,,2t0,6,2tj,7,2wh,,2wj,,2wk,8,2x4,6,2zc,1,305,,307,,309,,30e,1,31t,d,327,,328,4,32e,1,32l,a,32x,z,346,,371,3,375,,376,5,37d,1,37f,1,37h,1,386,1,388,1,38e,2,38x,3,39e,,39g,,39h,1,39p,,3a5,,3cw,2n,3fk,1z,3hk,2f,3tp,2,4k2,3,4ky,2,4lu,1,4mq,1,4ok,1,4om,,4on,6,4ou,7,4p2,,4p3,1,4p5,a,4pp,,4qz,2,4r2,,4r3,,4ud,1,4vd,,4yo,2,4yr,3,4yv,1,4yx,2,4z4,1,4z6,,4z7,5,4zd,2,55j,1,55l,1,55n,,579,,57a,,57b,,57c,6,57k,,57m,,57p,7,57x,5,583,9,58f,,59s,u,5c0,3,5c4,,5dg,9,5dq,3,5du,2,5ez,8,5fk,1,5fm,,5gh,,5gi,3,5gm,1,5go,5,5ie,,5if,,5ig,1,5ii,2,5il,,5im,,5in,4,5k4,7,5kc,7,5kk,1,5km,1,5ow,2,5p0,c,5pd,,5pe,6,5pp,,5pw,,5pz,,5q0,1,5vk,1r,6bv,,6bw,,6bx,,6by,1,6co,6,6d8,,6dl,,6e8,f,6hc,w,6jm,,6k9,,6ms,5,6nd,1,6xm,1,6y0,,70o,,72n,,73d,a,73s,2,79e,,7fu,1,7g6,,7gg,,7i3,3,7i8,5,7if,b,7is,35,7m8,39,7pk,a,7pw,,7py,,7q5,,7q9,,7qg,,7qr,1,7r8,,7rb,,7rg,,7ri,,7rn,2,7rr,,7s3,4,7th,2,7tt,,7u8,,7un,,850,1,8hx,2,8ij,1,8k0,,8k5,,8vj,2,8zj,,928,v,wvj,3,wvo,9,wwu,1,wz4,1,x6q,,x6u,,x6z,,x7n,1,x7p,1,x7r,,x7w,,xa8,1,xbo,f,xc4,1,xcw,h,xdr,,xeu,7,xfr,a,xg2,,xg3,,xgg,s,xhc,2,xhf,,xir,,xis,1,xiu,3,xiy,1,xj0,1,xj2,1,xj4,,xk5,,xm1,5,xm7,1,xm9,1,xmb,1,xmd,1,xmr,,xn0,,xn1,,xoc,,xps,,xpu,2,xpz,1,xq6,1,xq9,,xrf,,xrg,1,xri,1,xrp,,xrq,,xyb,1,xyd,,xye,1,xyg,,xyh,1,xyk,,xyl,,1e68,f,1e74,f,1edb,,1ehq,1,1ek0,b,1eyl,,1f4w,,1f92,4,1gjl,2,1gjp,1,1gjw,3,1gl4,2,1glb,,1gpx,1,1h5w,3,1h7t,4,1hgr,1,1hj0,3,1hl2,a,1hmq,3,1hq8,,1hq9,,1hqa,,1hrs,e,1htc,,1htf,1,1htr,2,1htu,,1hv4,2,1hv7,3,1hvb,1,1hvd,1,1hvh,,1hvm,,1hvx,,1hxc,2,1hyf,4,1hyk,,1hyl,7,1hz9,1,1i0j,,1i0w,1,1i0y,,1i2b,2,1i2e,8,1i2n,,1i2o,,1i2q,1,1i2x,3,1i32,,1i33,,1i5o,2,1i5r,2,1i5u,1,1i5w,3,1i66,,1i69,,1ian,,1iao,2,1iar,7,1ibk,1,1ibm,1,1id7,1,1ida,,1idb,,1idc,,1idd,3,1idj,1,1idn,1,1idp,,1idz,,1iea,1,1iee,6,1ieo,4,1igo,,1igp,1,1igr,5,1igy,,1ih1,,1ih3,2,1ih6,,1ih8,1,1iha,2,1ihd,,1ihe,,1iht,1,1ik5,2,1ik8,7,1ikg,1,1iki,2,1ikl,,1ikm,,1ila,,1ink,,1inl,1,1inn,5,1int,,1inu,,1inv,1,1inx,,1iny,,1inz,1,1io1,,1io2,1,1iun,,1iuo,1,1iuq,3,1iuw,3,1iv0,1,1iv2,,1iv3,1,1ivw,1,1iy8,2,1iyb,7,1iyj,1,1iyl,,1iym,,1iyn,1,1j1n,,1j1o,,1j1p,,1j1q,1,1j1s,7,1j4t,,1j4u,,1j4v,,1j4y,3,1j52,,1j53,4,1jcc,2,1jcf,8,1jco,,1jcp,1,1jjk,,1jjl,4,1jjr,1,1jjv,3,1jjz,,1jk0,,1jk1,,1jk2,,1jk3,,1jo1,2,1jo4,3,1joa,1,1joc,3,1jog,,1jok,,1jpd,9,1jqr,5,1jqx,,1jqy,,1jqz,3,1jrb,,1jrl,5,1jrr,1,1jrt,2,1jt0,5,1jt6,c,1jtj,,1jtk,1,1k4v,,1k4w,6,1k54,5,1k5a,,1k5b,,1k7m,l,1k89,,1k8a,6,1k8h,,1k8i,1,1k8k,,1k8l,1,1kc1,5,1kca,,1kcc,1,1kcf,6,1kcm,,1kcn,,1kei,4,1keo,1,1ker,1,1ket,,1keu,,1kev,,1koj,1,1kol,1,1kow,1,1koy,,1koz,,1kqc,1,1kqe,4,1kqm,1,1kqo,2,1kre,,1ovk,f,1ow0,,1ow7,e,1xr2,b,1xre,2,1xrh,2,1zow,4,1zqo,6,206b,,206f,3,20jz,,20k1,1i,20lr,3,20o4,,20og,1,2ftp,1,2fts,3,2jgg,19,2jhs,m,2jxh,4,2jxp,5,2jxv,7,2jy3,7,2jyd,6,2jze,3,2k3m,2,2lmo,1i,2lob,1d,2lpx,,2lqc,,2lqz,4,2lr5,e,2mtc,6,2mtk,g,2mu3,6,2mub,1,2mue,4,2mxb,,2n1s,6,2nce,,2ne4,3,2nsc,3,2nzi,1,2ok0,6,2on8,6,2pz4,73,2q6l,2,2q7j,,2q98,5,2q9q,1,2qa6,,2qa9,9,2qb1,1k,2qcm,p,2qdd,e,2qe2,,2qen,,2qeq,8,2qf0,3,2qfd,c1,2qrf,4,2qrk,8t,2r0m,7d,2r9c,3j,2rg4,b,2rit,16,2rkc,3,2rm0,7,2rmi,5,2rns,7,2rou,29,2rrg,1a,2rss,9,2rt3,c8,2scg,sd,jny8,v,jnz4,2n,jo1s,3j,jo5c,6n,joc0,2rz",
  "262122424333333393233393339333333333393393b3b3b3b3b333b33b3bb33333b3b3333333b3b33bb3333b33b3bb33333b3bbb333b333b33333b3b3b3b3333b3b33b3bb39333b33b33b3b3b333b333333b3b333333b33b3b3333b3335dc333333b3b3b33323333b3bb3b33b3b3b3333b3333b3b333bb3b33b3b3b3b3b333b333b3323e2244234444444444444444444444444444444444444444443333333333b3b3bb33333b353b3b3b3b333b3b333b333333b3bb3b3b3bb333232333333333333333b3b3333bb3b393933b3b33bb3b393b3b3b3333b33b33b3bbb33b333b3333bb3933b3b3b333b3b3b3b3b33b3b3b33b3b3b33b3b33b33b3b3b33bb39b9b3b33b3b33b9333b393b3b33b33b3b3b3333393b3b3b33b39bb3b332333b333dd3b33332333323333333333333333333333344444444a44444434444444444444423232"
);

// node_modules/unicode-segmenter/_incb_data.js
var consonant_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  "1sl,10,1ug,7,1vc,7,1w5,j,1wq,6,1wy,,1x2,3,1y4,1,1y7,,1yo,1,239,j,23u,6,242,1,245,4,261,,26t,j,27e,6,27m,1,27p,4,28s,1,28v,,29d,,2dx,j,2ei,f,2fs,2,2l1,11"
);

// node_modules/unicode-segmenter/grapheme.js
var BMP_MAX = 65535;
function* graphemeSegments(input2) {
  let cp = input2.codePointAt(0);
  if (cp == null) return;
  let cursor2 = cp <= BMP_MAX ? 1 : 2;
  let len = input2.length;
  let catBefore = cat(cp);
  let catAfter = 0;
  let risCount = 0;
  let emoji = false;
  let consonant = false;
  let linker = false;
  let index = 0;
  let _catBegin = catBefore;
  let _hd = cp;
  while (cursor2 < len) {
    cp = /** @type {number} */
    input2.codePointAt(cursor2);
    catAfter = cat(cp);
    let boundary = true;
    if (catBefore === 1) {
      boundary = catAfter !== 6;
    } else if (catBefore === 2 || catBefore === 6) {
      boundary = true;
    } else if (catAfter === 1 || catAfter === 2 || catAfter === 6) {
      boundary = true;
    } else if (catAfter === 3 || catAfter === 14 || catAfter === 11) {
      boundary = false;
    } else if (catBefore === 9) {
      boundary = false;
    } else if (catBefore === 14 && catAfter === 4) {
      boundary = !emoji;
    } else if (catBefore === 10 && catAfter === 10) {
      boundary = risCount++ % 2 === 1;
    } else if (catBefore === 5) {
      boundary = !(catAfter === 5 || catAfter === 13 || catAfter === 7 || catAfter === 8);
    } else if ((catBefore === 7 || catBefore === 13) && (catAfter === 13 || catAfter === 12)) {
      boundary = false;
    } else if ((catBefore === 8 || catBefore === 12) && catAfter === 12) {
      boundary = false;
    } else if (catAfter === 0 && consonant && linker && isIndicConjunctConsonant(cp)) {
      boundary = false;
    }
    if (boundary) {
      yield {
        segment: input2.slice(index, cursor2),
        index,
        input: input2,
        _hd,
        _catBegin,
        _catEnd: catBefore
      };
      emoji = false;
      risCount = 0;
      index = cursor2;
      _catBegin = catAfter;
      _hd = cp;
    } else {
      if (catAfter === 14 && (catBefore === 3 || catBefore === 4)) {
        emoji = true;
      } else if (cp >= 2325) {
        if (!consonant && catBefore === 0) {
          consonant = isIndicConjunctConsonant(_hd);
        }
        if (consonant && catAfter === 3) {
          linker = linker || cp === 2381 || cp === 2509 || cp === 2637 || cp === 2765 || cp === 2893 || cp === 3149 || cp === 3405;
        } else {
          linker = false;
        }
      }
    }
    cursor2 += cp <= BMP_MAX ? 1 : 2;
    catBefore = catAfter;
  }
  if (index < len) {
    yield {
      segment: input2.slice(index),
      index,
      input: input2,
      _hd,
      _catBegin,
      _catEnd: catBefore
    };
  }
}
function countGraphemes(text) {
  let count = 0;
  for (let _ of graphemeSegments(text)) count += 1;
  return count;
}
var SEG0 = new Uint8Array(6080);
var SEG0_MIN = 128;
var SEG0_MAX = 12287;
var SEG1 = new Uint8Array(1536);
var SEG1_MIN = 40960;
var SEG1_MAX = 44031;
var SEG_CURSOR = (() => {
  let cursor2 = 0;
  while (true) {
    let [start, end, cat2] = grapheme_ranges[cursor2];
    if (start > SEG1_MAX) break;
    cursor2++;
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
      seg[idx] = cp & 1 ? seg[idx] & 15 | cat2 << 4 : seg[idx] & 240 | cat2;
    }
  }
  return cursor2;
})();
function cat(cp) {
  if (cp < SEG0_MIN) {
    if (cp >= 32) return 0;
    if (cp === 10) return 6;
    if (cp === 13) return 1;
    return 2;
  }
  if (cp <= SEG0_MAX) {
    let byte = SEG0[cp - SEG0_MIN >> 1];
    return (
      /** @type {GraphemeCategoryNum} */
      cp & 1 ? byte >> 4 : byte & 15
    );
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
    return (
      /** @type {GraphemeCategoryNum} */
      cp & 1 ? byte >> 4 : byte & 15
    );
  }
  if (cp <= 55203) {
    return (cp - 44032) % 28 === 0 ? 7 : 8;
  }
  if (cp <= 55295) {
    if (cp <= 55238) return cp >= 55216 ? 13 : 0;
    return cp >= 55243 ? 12 : 0;
  }
  if (cp < 65024) {
    return cp === 64286 ? 3 : 0;
  }
  let idx = findUnicodeRangeIndex(cp, grapheme_ranges, SEG_CURSOR);
  return idx < 0 ? 0 : grapheme_ranges[idx][2];
}
function isIndicConjunctConsonant(cp) {
  return findUnicodeRangeIndex(cp, consonant_ranges) >= 0;
}

// node_modules/@atproto/lex-data/dist/utf8-grapheme-len.js
var segmenter = "Segmenter" in Intl && typeof Intl.Segmenter === "function" ? /* @__PURE__ */ new Intl.Segmenter() : (
  /* v8 ignore next -- @preserve */
  null
);
var graphemeLenNative = segmenter ? function graphemeLenNative2(str2) {
  let length3 = 0;
  for (const _ of segmenter.segment(str2))
    length3++;
  return length3;
} : (
  /* v8 ignore next -- @preserve */
  null
);
function graphemeLenPonyfill(str2) {
  return countGraphemes(str2);
}

// node_modules/@atproto/lex-data/dist/utf8-len.js
var utf8LenNode = NodeJSBuffer ? function utf8LenNode2(string2) {
  return NodeJSBuffer.byteLength(string2, "utf8");
} : (
  /* v8 ignore next -- @preserve */
  null
);
function utf8LenCompute(string2) {
  let len = string2.length;
  let code;
  for (let i = 0; i < string2.length; i += 1) {
    code = string2.charCodeAt(i);
    if (code <= 127) {
    } else if (code <= 2047) {
      len += 1;
    } else {
      len += 2;
      if (code >= 55296 && code <= 56319) {
        code = string2.charCodeAt(i + 1);
        if (code >= 56320 && code <= 57343) {
          i++;
        }
      }
    }
  }
  return len;
}

// node_modules/@atproto/lex-data/dist/utf8.js
var graphemeLen = (
  /* v8 ignore next -- @preserve */
  graphemeLenNative ?? graphemeLenPonyfill
);
if (graphemeLen === graphemeLenPonyfill) {
  /* @__PURE__ */ console.warn("[@atproto/lex-data]: Intl.Segmenter is not available in this environment. Falling back to ponyfill implementation.");
}
var utf8Len = (
  /* v8 ignore next -- @preserve */
  utf8LenNode ?? utf8LenCompute
);

// node_modules/@atproto/lex-json/dist/bytes.js
function encodeLexBytes(bytes2) {
  return { $bytes: toBase64(bytes2) };
}

// node_modules/@atproto/lex-json/dist/link.js
function encodeLexLink(cid4) {
  return { $link: cid4.toString() };
}

// node_modules/@atproto/lex-json/dist/lex-json.js
function lexToJson(value) {
  switch (typeof value) {
    case "object":
      if (value === null) {
        return value;
      } else if (Array.isArray(value)) {
        return lexArrayToJson(value);
      } else if (isCid(value)) {
        return encodeLexLink(value);
      } else if (ArrayBuffer.isView(value)) {
        return encodeLexBytes(value);
      } else {
        return encodeLexMap(value);
      }
    case "boolean":
    case "string":
    case "number":
      return value;
    default:
      throw new TypeError(`Invalid Lex value: ${typeof value}`);
  }
}
function lexArrayToJson(input2) {
  let copy;
  for (let i = 0; i < input2.length; i++) {
    const inputItem = input2[i];
    const item = lexToJson(inputItem);
    if (item !== inputItem) {
      copy ??= Array.from(input2);
      copy[i] = item;
    }
  }
  return copy ?? input2;
}
function encodeLexMap(input2) {
  let copy = void 0;
  for (const [key3, lexValue] of Object.entries(input2)) {
    if (key3 === "__proto__") {
      throw new TypeError("Invalid key: __proto__");
    }
    if (lexValue === void 0) {
      copy ??= { ...input2 };
      delete copy[key3];
      continue;
    }
    const jsonValue = lexToJson(lexValue);
    if (jsonValue !== lexValue) {
      copy ??= { ...input2 };
      copy[key3] = jsonValue;
    }
  }
  return copy ?? input2;
}

// node_modules/@atproto/common-web/dist/ipld.js
var ipldToJson = (val) => {
  if (val === void 0)
    return val;
  if (Number.isNaN(val))
    return val;
  return lexToJson(val);
};

// node_modules/@atproto/common-web/dist/types.js
var cidSchema = external_exports.unknown().transform((obj, ctx) => {
  const cid4 = CID.asCID(obj);
  if (cid4 == null) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Not a valid CID"
    });
    return external_exports.NEVER;
  }
  return cid4;
});
var carHeader = external_exports.object({
  version: external_exports.literal(1),
  roots: external_exports.array(cidSchema)
});
var schema = {
  cid: cidSchema,
  carHeader,
  bytes: external_exports.instanceof(Uint8Array),
  string: external_exports.string(),
  array: external_exports.array(external_exports.unknown()),
  map: external_exports.record(external_exports.string(), external_exports.unknown()),
  unknown: external_exports.unknown()
};
var def = {
  cid: {
    name: "cid",
    schema: schema.cid
  },
  carHeader: {
    name: "CAR header",
    schema: schema.carHeader
  },
  bytes: {
    name: "bytes",
    schema: schema.bytes
  },
  string: {
    name: "string",
    schema: schema.string
  },
  map: {
    name: "map",
    schema: schema.map
  },
  unknown: {
    name: "unknown",
    schema: schema.unknown
  }
};

// node_modules/@atproto/common-web/dist/times.js
var SECOND = 1e3;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;

// node_modules/@atproto/common-web/dist/strings.js
var graphemeLenLegacy = graphemeLen;
var utf8LenLegacy = utf8Len;
var validateLanguage = isValidLanguage;

// node_modules/@atproto/common-web/dist/did-doc.js
var canParseUrl = URL.canParse ?? // URL.canParse is not available in Node.js < 18.17.0
((urlStr) => {
  try {
    new URL(urlStr);
    return true;
  } catch {
    return false;
  }
});
var verificationMethod = external_exports.object({
  id: external_exports.string(),
  type: external_exports.string(),
  controller: external_exports.string(),
  publicKeyJwk: external_exports.record(external_exports.string(), external_exports.unknown()).optional(),
  publicKeyMultibase: external_exports.string().optional()
});
var service = external_exports.object({
  id: external_exports.string(),
  type: external_exports.string(),
  serviceEndpoint: external_exports.union([external_exports.string(), external_exports.record(external_exports.unknown())])
});
var didDocument = external_exports.object({
  "@context": external_exports.union([
    external_exports.literal("https://www.w3.org/ns/did/v1"),
    external_exports.array(external_exports.string().url())
  ]).optional(),
  id: external_exports.string(),
  alsoKnownAs: external_exports.array(external_exports.string()).optional(),
  verificationMethod: external_exports.array(verificationMethod).optional(),
  authentication: external_exports.array(external_exports.union([external_exports.string(), verificationMethod])).optional(),
  service: external_exports.array(service).optional()
});

// node_modules/@atproto/lexicon/dist/util.js
function toLexUri(str2, baseUri) {
  if (str2.split("#").length > 2) {
    throw new Error("Uri can only have one hash segment");
  }
  if (str2.startsWith("lex:")) {
    return str2;
  }
  if (str2.startsWith("#")) {
    if (!baseUri) {
      throw new Error(`Unable to resolve uri without anchor: ${str2}`);
    }
    return `${baseUri}${str2}`;
  }
  return `lex:${str2}`;
}
function requiredPropertiesRefinement(object3, ctx) {
  if (object3.required === void 0) {
    return;
  }
  if (!Array.isArray(object3.required)) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.invalid_type,
      received: typeof object3.required,
      expected: "array"
    });
    return;
  }
  if (object3.properties === void 0) {
    if (object3.required.length > 0) {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        message: `Required fields defined but no properties defined`
      });
    }
    return;
  }
  for (const field of object3.required) {
    if (object3.properties[field] === void 0) {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        message: `Required field "${field}" not defined`
      });
    }
  }
}

// node_modules/@atproto/lexicon/dist/types.js
var languageSchema = external_exports.string().refine(validateLanguage, "Invalid BCP47 language tag");
var lexLang = external_exports.record(languageSchema, external_exports.string().optional());
var lexBoolean = external_exports.object({
  type: external_exports.literal("boolean"),
  description: external_exports.string().optional(),
  default: external_exports.boolean().optional(),
  const: external_exports.boolean().optional()
});
var lexInteger = external_exports.object({
  type: external_exports.literal("integer"),
  description: external_exports.string().optional(),
  default: external_exports.number().int().optional(),
  minimum: external_exports.number().int().optional(),
  maximum: external_exports.number().int().optional(),
  enum: external_exports.number().int().array().optional(),
  const: external_exports.number().int().optional()
});
var lexStringFormat = external_exports.enum([
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
var lexString = external_exports.object({
  type: external_exports.literal("string"),
  format: lexStringFormat.optional(),
  description: external_exports.string().optional(),
  default: external_exports.string().optional(),
  minLength: external_exports.number().int().optional(),
  maxLength: external_exports.number().int().optional(),
  minGraphemes: external_exports.number().int().optional(),
  maxGraphemes: external_exports.number().int().optional(),
  enum: external_exports.string().array().optional(),
  const: external_exports.string().optional(),
  knownValues: external_exports.string().array().optional()
});
var lexUnknown = external_exports.object({
  type: external_exports.literal("unknown"),
  description: external_exports.string().optional()
});
var lexPrimitive = external_exports.discriminatedUnion("type", [
  lexBoolean,
  lexInteger,
  lexString,
  lexUnknown
]);
var lexBytes = external_exports.object({
  type: external_exports.literal("bytes"),
  description: external_exports.string().optional(),
  maxLength: external_exports.number().optional(),
  minLength: external_exports.number().optional()
});
var lexCidLink = external_exports.object({
  type: external_exports.literal("cid-link"),
  description: external_exports.string().optional()
});
var lexIpldType = external_exports.discriminatedUnion("type", [lexBytes, lexCidLink]);
var lexRef = external_exports.object({
  type: external_exports.literal("ref"),
  description: external_exports.string().optional(),
  ref: external_exports.string()
});
var lexRefUnion = external_exports.object({
  type: external_exports.literal("union"),
  description: external_exports.string().optional(),
  refs: external_exports.string().array(),
  closed: external_exports.boolean().optional()
});
var lexRefVariant = external_exports.discriminatedUnion("type", [lexRef, lexRefUnion]);
var lexBlob = external_exports.object({
  type: external_exports.literal("blob"),
  description: external_exports.string().optional(),
  accept: external_exports.string().array().optional(),
  maxSize: external_exports.number().optional()
});
var lexArray = external_exports.object({
  type: external_exports.literal("array"),
  description: external_exports.string().optional(),
  items: external_exports.discriminatedUnion("type", [
    // lexPrimitive
    lexBoolean,
    lexInteger,
    lexString,
    lexUnknown,
    // lexIpldType
    lexBytes,
    lexCidLink,
    // lexRefVariant
    lexRef,
    lexRefUnion,
    // other
    lexBlob
  ]),
  minLength: external_exports.number().int().optional(),
  maxLength: external_exports.number().int().optional()
});
var lexPrimitiveArray = lexArray.merge(external_exports.object({
  items: lexPrimitive
}));
var lexToken = external_exports.object({
  type: external_exports.literal("token"),
  description: external_exports.string().optional()
});
var lexObject = external_exports.object({
  type: external_exports.literal("object"),
  description: external_exports.string().optional(),
  required: external_exports.string().array().optional(),
  nullable: external_exports.string().array().optional(),
  properties: external_exports.record(external_exports.string(), external_exports.discriminatedUnion("type", [
    lexArray,
    // lexPrimitive
    lexBoolean,
    lexInteger,
    lexString,
    lexUnknown,
    // lexIpldType
    lexBytes,
    lexCidLink,
    // lexRefVariant
    lexRef,
    lexRefUnion,
    // other
    lexBlob
  ]))
}).superRefine(requiredPropertiesRefinement);
var lexPermission = external_exports.intersection(external_exports.object({
  type: external_exports.literal("permission"),
  resource: external_exports.string().nonempty()
}), external_exports.record(external_exports.string(), external_exports.union([
  external_exports.array(external_exports.union([external_exports.string(), external_exports.number().int(), external_exports.boolean()])),
  external_exports.boolean(),
  external_exports.number().int(),
  external_exports.string()
]).optional()));
var lexPermissionSet = external_exports.object({
  type: external_exports.literal("permission-set"),
  description: external_exports.string().optional(),
  title: external_exports.string().optional(),
  "title:lang": lexLang.optional(),
  detail: external_exports.string().optional(),
  "detail:lang": lexLang.optional(),
  permissions: external_exports.array(lexPermission)
});
var lexXrpcParameters = external_exports.object({
  type: external_exports.literal("params"),
  description: external_exports.string().optional(),
  required: external_exports.string().array().optional(),
  properties: external_exports.record(external_exports.string(), external_exports.discriminatedUnion("type", [
    lexPrimitiveArray,
    // lexPrimitive
    lexBoolean,
    lexInteger,
    lexString,
    lexUnknown
  ]))
}).superRefine(requiredPropertiesRefinement);
var lexXrpcBody = external_exports.object({
  description: external_exports.string().optional(),
  encoding: external_exports.string(),
  // @NOTE using discriminatedUnion with a refined schema requires zod >= 4
  schema: external_exports.union([lexRefVariant, lexObject]).optional()
});
var lexXrpcError = external_exports.object({
  name: external_exports.string(),
  description: external_exports.string().optional()
});
var lexXrpcQuery = external_exports.object({
  type: external_exports.literal("query"),
  description: external_exports.string().optional(),
  parameters: lexXrpcParameters.optional(),
  output: lexXrpcBody.optional(),
  errors: lexXrpcError.array().optional()
});
var lexXrpcProcedure = external_exports.object({
  type: external_exports.literal("procedure"),
  description: external_exports.string().optional(),
  parameters: lexXrpcParameters.optional(),
  input: lexXrpcBody.optional(),
  output: lexXrpcBody.optional(),
  errors: lexXrpcError.array().optional()
});
var lexXrpcSubscription = external_exports.object({
  type: external_exports.literal("subscription"),
  description: external_exports.string().optional(),
  parameters: lexXrpcParameters.optional(),
  message: external_exports.object({
    description: external_exports.string().optional(),
    schema: lexRefUnion
  }),
  errors: lexXrpcError.array().optional()
});
var lexRecord = external_exports.object({
  type: external_exports.literal("record"),
  description: external_exports.string().optional(),
  key: external_exports.string().optional(),
  record: lexObject
});
var lexUserType = external_exports.unknown().superRefine((val, ctx) => {
  if (!val || typeof val !== "object") {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Must be an object",
      fatal: true
    });
    return external_exports.NEVER;
  }
  const obj = val;
  const type = obj["type"];
  if (type === void 0) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Must have a type",
      fatal: true
    });
    return external_exports.NEVER;
  }
  if (typeof type !== "string") {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "Type property must be a string",
      fatal: true
    });
    return external_exports.NEVER;
  }
  const typeSchema = (() => {
    switch (type) {
      case "record":
        return lexRecord;
      case "permission-set":
        return lexPermissionSet;
      case "query":
        return lexXrpcQuery;
      case "procedure":
        return lexXrpcProcedure;
      case "subscription":
        return lexXrpcSubscription;
      case "blob":
        return lexBlob;
      case "array":
        return lexArray;
      case "token":
        return lexToken;
      case "object":
        return lexObject;
      case "boolean":
        return lexBoolean;
      case "integer":
        return lexInteger;
      case "string":
        return lexString;
      case "bytes":
        return lexBytes;
      case "cid-link":
        return lexCidLink;
      case "unknown":
        return lexUnknown;
    }
  })();
  if (!typeSchema) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: `Invalid type: ${type} must be one of: record, query, procedure, subscription, blob, array, token, object, boolean, integer, string, bytes, cid-link, unknown`,
      fatal: true
    });
    return external_exports.NEVER;
  }
  const result = typeSchema.safeParse(val);
  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue(issue);
    }
  }
});
var lexiconDoc = external_exports.object({
  lexicon: external_exports.literal(1),
  id: external_exports.string().refine(isValidNsid, {
    message: "Must be a valid NSID"
  }),
  revision: external_exports.number().optional(),
  description: external_exports.string().optional(),
  defs: external_exports.record(external_exports.string(), lexUserType)
}).refine((doc) => {
  for (const [defId, def2] of Object.entries(doc.defs)) {
    if (defId !== "main" && (def2.type === "record" || def2.type === "permission-set" || def2.type === "procedure" || def2.type === "query" || def2.type === "subscription")) {
      return false;
    }
  }
  return true;
}, {
  message: `Records, permission sets, procedures, queries, and subscriptions must be the main definition.`
});
function isObj(v) {
  return v != null && typeof v === "object";
}
function isDiscriminatedObject(v) {
  return isObj(v) && "$type" in v && typeof v.$type === "string";
}
var ValidationError = class extends Error {
};
var InvalidLexiconError = class extends Error {
};
var LexiconDefNotFoundError = class extends Error {
};

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bytes.js
var empty2 = new Uint8Array(0);
function equals3(aa, bb) {
  if (aa === bb) {
    return true;
  }
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }
  for (let ii = 0; ii < aa.byteLength; ii++) {
    if (aa[ii] !== bb[ii]) {
      return false;
    }
  }
  return true;
}
function coerce2(o) {
  if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") {
    return o;
  }
  if (o instanceof ArrayBuffer) {
    return new Uint8Array(o);
  }
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error("Unknown type, must be binary type");
}

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/vendor/base-x.js
function base2(ALPHABET3, name) {
  if (ALPHABET3.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET3.length; i++) {
    var x = ALPHABET3.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET3.length;
  var LEADER = ALPHABET3.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256);
  var iFACTOR = Math.log(256) / Math.log(BASE);
  function encode5(source) {
    if (source instanceof Uint8Array)
      ;
    else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    var zeroes = 0;
    var length3 = 0;
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
      var i2 = 0;
      for (var it1 = size - 1; (carry !== 0 || i2 < length3) && it1 !== -1; it1--, i2++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length3 = i2;
      pbegin++;
    }
    var it2 = size - length3;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    var str2 = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str2 += ALPHABET3.charAt(b58[it2]);
    }
    return str2;
  }
  function decodeUnsafe(source) {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    var psz = 0;
    if (source[psz] === " ") {
      return;
    }
    var zeroes = 0;
    var length3 = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    var size = (source.length - psz) * FACTOR + 1 >>> 0;
    var b256 = new Uint8Array(size);
    while (source[psz]) {
      var carry = BASE_MAP[source.charCodeAt(psz)];
      if (carry === 255) {
        return;
      }
      var i2 = 0;
      for (var it3 = size - 1; (carry !== 0 || i2 < length3) && it3 !== -1; it3--, i2++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length3 = i2;
      psz++;
    }
    if (source[psz] === " ") {
      return;
    }
    var it4 = size - length3;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = new Uint8Array(zeroes + (size - it4));
    var j2 = zeroes;
    while (it4 !== size) {
      vch[j2++] = b256[it4++];
    }
    return vch;
  }
  function decode10(string2) {
    var buffer = decodeUnsafe(string2);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Non-${name} character`);
  }
  return {
    encode: encode5,
    decodeUnsafe,
    decode: decode10
  };
}
var src2 = base2;
var _brrp__multiformats_scope_baseX2 = src2;
var base_x_default2 = _brrp__multiformats_scope_baseX2;

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base.js
var Encoder2 = class {
  name;
  prefix;
  baseEncode;
  constructor(name, prefix2, baseEncode) {
    this.name = name;
    this.prefix = prefix2;
    this.baseEncode = baseEncode;
  }
  encode(bytes2) {
    if (bytes2 instanceof Uint8Array) {
      return `${this.prefix}${this.baseEncode(bytes2)}`;
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
  constructor(name, prefix2, baseDecode) {
    this.name = name;
    this.prefix = prefix2;
    const prefixCodePoint = prefix2.codePointAt(0);
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
  or(decoder) {
    return or2(this, decoder);
  }
};
var ComposedDecoder2 = class {
  decoders;
  constructor(decoders) {
    this.decoders = decoders;
  }
  or(decoder) {
    return or2(this, decoder);
  }
  decode(input2) {
    const prefix2 = input2[0];
    const decoder = this.decoders[prefix2];
    if (decoder != null) {
      return decoder.decode(input2);
    } else {
      throw RangeError(`Unable to decode multibase string ${JSON.stringify(input2)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
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
  constructor(name, prefix2, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix2;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder2(name, prefix2, baseEncode);
    this.decoder = new Decoder2(name, prefix2, baseDecode);
  }
  encode(input2) {
    return this.encoder.encode(input2);
  }
  decode(input2) {
    return this.decoder.decode(input2);
  }
};
function from3({ name, prefix: prefix2, encode: encode5, decode: decode10 }) {
  return new Codec2(name, prefix2, encode5, decode10);
}
function baseX2({ name, prefix: prefix2, alphabet }) {
  const { encode: encode5, decode: decode10 } = base_x_default2(alphabet, name);
  return from3({
    prefix: prefix2,
    name,
    encode: encode5,
    decode: (text) => coerce2(decode10(text))
  });
}
function decode6(string2, alphabetIdx, bitsPerChar, name) {
  let end = string2.length;
  while (string2[end - 1] === "=") {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = alphabetIdx[string2[i]];
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
function rfc46482({ name, prefix: prefix2, bitsPerChar, alphabet }) {
  const alphabetIdx = createAlphabetIdx2(alphabet);
  return from3({
    prefix: prefix2,
    name,
    encode(input2) {
      return encode3(input2, alphabet, bitsPerChar);
    },
    decode(input2) {
      return decode6(input2, alphabetIdx, bitsPerChar, name);
    }
  });
}

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base32.js
var base322 = rfc46482({
  prefix: "b",
  name: "base32",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567",
  bitsPerChar: 5
});
var base32upper2 = rfc46482({
  prefix: "B",
  name: "base32upper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  bitsPerChar: 5
});
var base32pad2 = rfc46482({
  prefix: "c",
  name: "base32pad",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
  bitsPerChar: 5
});
var base32padupper2 = rfc46482({
  prefix: "C",
  name: "base32padupper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
  bitsPerChar: 5
});
var base32hex2 = rfc46482({
  prefix: "v",
  name: "base32hex",
  alphabet: "0123456789abcdefghijklmnopqrstuv",
  bitsPerChar: 5
});
var base32hexupper2 = rfc46482({
  prefix: "V",
  name: "base32hexupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
  bitsPerChar: 5
});
var base32hexpad2 = rfc46482({
  prefix: "t",
  name: "base32hexpad",
  alphabet: "0123456789abcdefghijklmnopqrstuv=",
  bitsPerChar: 5
});
var base32hexpadupper2 = rfc46482({
  prefix: "T",
  name: "base32hexpadupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
  bitsPerChar: 5
});
var base32z2 = rfc46482({
  prefix: "h",
  name: "base32z",
  alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
  bitsPerChar: 5
});

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base36.js
var base362 = baseX2({
  prefix: "k",
  name: "base36",
  alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
var base36upper2 = baseX2({
  prefix: "K",
  name: "base36upper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base58.js
var base58btc2 = baseX2({
  name: "base58btc",
  prefix: "z",
  alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
var base58flickr2 = baseX2({
  name: "base58flickr",
  prefix: "Z",
  alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/vendor/varint.js
var encode_12 = encode4;
var MSB2 = 128;
var REST2 = 127;
var MSBALL2 = ~REST2;
var INT2 = Math.pow(2, 31);
function encode4(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;
  while (num >= INT2) {
    out[offset++] = num & 255 | MSB2;
    num /= 128;
  }
  while (num & MSBALL2) {
    out[offset++] = num & 255 | MSB2;
    num >>>= 7;
  }
  out[offset] = num | 0;
  encode4.bytes = offset - oldOffset + 1;
  return out;
}
var decode7 = read2;
var MSB$12 = 128;
var REST$12 = 127;
function read2(buf, offset) {
  var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
  do {
    if (counter >= l) {
      read2.bytes = 0;
      throw new RangeError("Could not decode varint");
    }
    b = buf[counter++];
    res += shift < 28 ? (b & REST$12) << shift : (b & REST$12) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$12);
  read2.bytes = counter - offset;
  return res;
}
var N12 = Math.pow(2, 7);
var N22 = Math.pow(2, 14);
var N32 = Math.pow(2, 21);
var N42 = Math.pow(2, 28);
var N52 = Math.pow(2, 35);
var N62 = Math.pow(2, 42);
var N72 = Math.pow(2, 49);
var N82 = Math.pow(2, 56);
var N92 = Math.pow(2, 63);
var length2 = function(value) {
  return value < N12 ? 1 : value < N22 ? 2 : value < N32 ? 3 : value < N42 ? 4 : value < N52 ? 5 : value < N62 ? 6 : value < N72 ? 7 : value < N82 ? 8 : value < N92 ? 9 : 10;
};
var varint2 = {
  encode: encode_12,
  decode: decode7,
  encodingLength: length2
};
var _brrp_varint2 = varint2;
var varint_default2 = _brrp_varint2;

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/varint.js
function decode8(data, offset = 0) {
  const code = varint_default2.decode(data, offset);
  return [code, varint_default2.decode.bytes];
}
function encodeTo2(int, target, offset = 0) {
  varint_default2.encode(int, target, offset);
  return target;
}
function encodingLength2(int) {
  return varint_default2.encodingLength(int);
}

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/hashes/digest.js
function create3(code, digest) {
  const size = digest.byteLength;
  const sizeOffset = encodingLength2(code);
  const digestOffset = sizeOffset + encodingLength2(size);
  const bytes2 = new Uint8Array(digestOffset + size);
  encodeTo2(code, bytes2, 0);
  encodeTo2(size, bytes2, sizeOffset);
  bytes2.set(digest, digestOffset);
  return new Digest2(code, size, digest, bytes2);
}
function decode9(multihash) {
  const bytes2 = coerce2(multihash);
  const [code, sizeOffset] = decode8(bytes2);
  const [size, digestOffset] = decode8(bytes2.subarray(sizeOffset));
  const digest = bytes2.subarray(sizeOffset + digestOffset);
  if (digest.byteLength !== size) {
    throw new Error("Incorrect length");
  }
  return new Digest2(code, size, digest, bytes2);
}
function equals4(a, b) {
  if (a === b) {
    return true;
  } else {
    const data = b;
    return a.code === data.code && a.size === data.size && data.bytes instanceof Uint8Array && equals3(a.bytes, data.bytes);
  }
}
var Digest2 = class {
  code;
  size;
  digest;
  bytes;
  /**
   * Creates a multihash digest.
   */
  constructor(code, size, digest, bytes2) {
    this.code = code;
    this.size = size;
    this.digest = digest;
    this.bytes = bytes2;
  }
};

// node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/cid.js
function format2(link2, base3) {
  const { bytes: bytes2, version } = link2;
  switch (version) {
    case 0:
      return toStringV02(bytes2, baseCache2(link2), base3 ?? base58btc2.encoder);
    default:
      return toStringV12(bytes2, baseCache2(link2), base3 ?? base322.encoder);
  }
}
var cache2 = /* @__PURE__ */ new WeakMap();
function baseCache2(cid4) {
  const baseCache3 = cache2.get(cid4);
  if (baseCache3 == null) {
    const baseCache4 = /* @__PURE__ */ new Map();
    cache2.set(cid4, baseCache4);
    return baseCache4;
  }
  return baseCache3;
}
var CID2 = class _CID {
  code;
  version;
  multihash;
  bytes;
  "/";
  /**
   * @param version - Version of the CID
   * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param multihash - (Multi)hash of the of the content.
   */
  constructor(version, code, multihash, bytes2) {
    this.code = code;
    this.version = version;
    this.multihash = multihash;
    this.bytes = bytes2;
    this["/"] = bytes2;
  }
  /**
   * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
   * please either use `CID.asCID(cid)` or switch to new signalling mechanism
   *
   * @deprecated
   */
  get asCID() {
    return this;
  }
  // ArrayBufferView
  get byteOffset() {
    return this.bytes.byteOffset;
  }
  // ArrayBufferView
  get byteLength() {
    return this.bytes.byteLength;
  }
  toV0() {
    switch (this.version) {
      case 0: {
        return this;
      }
      case 1: {
        const { code, multihash } = this;
        if (code !== DAG_PB_CODE2) {
          throw new Error("Cannot convert a non dag-pb CID to CIDv0");
        }
        if (multihash.code !== SHA_256_CODE2) {
          throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
        }
        return _CID.createV0(multihash);
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
      }
    }
  }
  toV1() {
    switch (this.version) {
      case 0: {
        const { code, digest } = this.multihash;
        const multihash = create3(code, digest);
        return _CID.createV1(this.code, multihash);
      }
      case 1: {
        return this;
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
      }
    }
  }
  equals(other) {
    return _CID.equals(this, other);
  }
  static equals(self, other) {
    const unknown2 = other;
    return unknown2 != null && self.code === unknown2.code && self.version === unknown2.version && equals4(self.multihash, unknown2.multihash);
  }
  toString(base3) {
    return format2(this, base3);
  }
  toJSON() {
    return { "/": format2(this) };
  }
  link() {
    return this;
  }
  [Symbol.toStringTag] = "CID";
  // Legacy
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return `CID(${this.toString()})`;
  }
  /**
   * Takes any input `value` and returns a `CID` instance if it was
   * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
   * it will return value back. If `value` is not instance of this CID
   * class, but is compatible CID it will return new instance of this
   * `CID` class. Otherwise returns null.
   *
   * This allows two different incompatible versions of CID library to
   * co-exist and interop as long as binary interface is compatible.
   */
  static asCID(input2) {
    if (input2 == null) {
      return null;
    }
    const value = input2;
    if (value instanceof _CID) {
      return value;
    } else if (value["/"] != null && value["/"] === value.bytes || value.asCID === value) {
      const { version, code, multihash, bytes: bytes2 } = value;
      return new _CID(version, code, multihash, bytes2 ?? encodeCID2(version, code, multihash.bytes));
    } else if (value[cidSymbol2] === true) {
      const { version, multihash, code } = value;
      const digest = decode9(multihash);
      return _CID.create(version, code, digest);
    } else {
      return null;
    }
  }
  /**
   * @param version - Version of the CID
   * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param digest - (Multi)hash of the of the content.
   */
  static create(version, code, digest) {
    if (typeof code !== "number") {
      throw new Error("String codecs are no longer supported");
    }
    if (!(digest.bytes instanceof Uint8Array)) {
      throw new Error("Invalid digest");
    }
    switch (version) {
      case 0: {
        if (code !== DAG_PB_CODE2) {
          throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE2}) block encoding`);
        } else {
          return new _CID(version, code, digest, digest.bytes);
        }
      }
      case 1: {
        const bytes2 = encodeCID2(version, code, digest.bytes);
        return new _CID(version, code, digest, bytes2);
      }
      default: {
        throw new Error("Invalid version");
      }
    }
  }
  /**
   * Simplified version of `create` for CIDv0.
   */
  static createV0(digest) {
    return _CID.create(0, DAG_PB_CODE2, digest);
  }
  /**
   * Simplified version of `create` for CIDv1.
   *
   * @param code - Content encoding format code.
   * @param digest - Multihash of the content.
   */
  static createV1(code, digest) {
    return _CID.create(1, code, digest);
  }
  /**
   * Decoded a CID from its binary representation. The byte array must contain
   * only the CID with no additional bytes.
   *
   * An error will be thrown if the bytes provided do not contain a valid
   * binary representation of a CID.
   */
  static decode(bytes2) {
    const [cid4, remainder] = _CID.decodeFirst(bytes2);
    if (remainder.length !== 0) {
      throw new Error("Incorrect length");
    }
    return cid4;
  }
  /**
   * Decoded a CID from its binary representation at the beginning of a byte
   * array.
   *
   * Returns an array with the first element containing the CID and the second
   * element containing the remainder of the original byte array. The remainder
   * will be a zero-length byte array if the provided bytes only contained a
   * binary CID representation.
   */
  static decodeFirst(bytes2) {
    const specs = _CID.inspectBytes(bytes2);
    const prefixSize = specs.size - specs.multihashSize;
    const multihashBytes = coerce2(bytes2.subarray(prefixSize, prefixSize + specs.multihashSize));
    if (multihashBytes.byteLength !== specs.multihashSize) {
      throw new Error("Incorrect length");
    }
    const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
    const digest = new Digest2(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
    const cid4 = specs.version === 0 ? _CID.createV0(digest) : _CID.createV1(specs.codec, digest);
    return [cid4, bytes2.subarray(specs.size)];
  }
  /**
   * Inspect the initial bytes of a CID to determine its properties.
   *
   * Involves decoding up to 4 varints. Typically this will require only 4 to 6
   * bytes but for larger multicodec code values and larger multihash digest
   * lengths these varints can be quite large. It is recommended that at least
   * 10 bytes be made available in the `initialBytes` argument for a complete
   * inspection.
   */
  static inspectBytes(initialBytes) {
    let offset = 0;
    const next = () => {
      const [i, length3] = decode8(initialBytes.subarray(offset));
      offset += length3;
      return i;
    };
    let version = next();
    let codec = DAG_PB_CODE2;
    if (version === 18) {
      version = 0;
      offset = 0;
    } else {
      codec = next();
    }
    if (version !== 0 && version !== 1) {
      throw new RangeError(`Invalid CID version ${version}`);
    }
    const prefixSize = offset;
    const multihashCode = next();
    const digestSize = next();
    const size = offset + digestSize;
    const multihashSize = size - prefixSize;
    return { version, codec, multihashCode, digestSize, multihashSize, size };
  }
  /**
   * Takes cid in a string representation and creates an instance. If `base`
   * decoder is not provided will use a default from the configuration. It will
   * throw an error if encoding of the CID is not compatible with supplied (or
   * a default decoder).
   */
  static parse(source, base3) {
    const [prefix2, bytes2] = parseCIDtoBytes2(source, base3);
    const cid4 = _CID.decode(bytes2);
    if (cid4.version === 0 && source[0] !== "Q") {
      throw Error("Version 0 CID string must not include multibase prefix");
    }
    baseCache2(cid4).set(prefix2, source);
    return cid4;
  }
};
function parseCIDtoBytes2(source, base3) {
  switch (source[0]) {
    // CIDv0 is parsed differently
    case "Q": {
      const decoder = base3 ?? base58btc2;
      return [
        base58btc2.prefix,
        decoder.decode(`${base58btc2.prefix}${source}`)
      ];
    }
    case base58btc2.prefix: {
      const decoder = base3 ?? base58btc2;
      return [base58btc2.prefix, decoder.decode(source)];
    }
    case base322.prefix: {
      const decoder = base3 ?? base322;
      return [base322.prefix, decoder.decode(source)];
    }
    case base362.prefix: {
      const decoder = base3 ?? base362;
      return [base362.prefix, decoder.decode(source)];
    }
    default: {
      if (base3 == null) {
        throw Error("To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided");
      }
      return [source[0], base3.decode(source)];
    }
  }
}
function toStringV02(bytes2, cache3, base3) {
  const { prefix: prefix2 } = base3;
  if (prefix2 !== base58btc2.prefix) {
    throw Error(`Cannot string encode V0 in ${base3.name} encoding`);
  }
  const cid4 = cache3.get(prefix2);
  if (cid4 == null) {
    const cid5 = base3.encode(bytes2).slice(1);
    cache3.set(prefix2, cid5);
    return cid5;
  } else {
    return cid4;
  }
}
function toStringV12(bytes2, cache3, base3) {
  const { prefix: prefix2 } = base3;
  const cid4 = cache3.get(prefix2);
  if (cid4 == null) {
    const cid5 = base3.encode(bytes2);
    cache3.set(prefix2, cid5);
    return cid5;
  } else {
    return cid4;
  }
}
var DAG_PB_CODE2 = 112;
var SHA_256_CODE2 = 18;
function encodeCID2(version, code, multihash) {
  const codeOffset = encodingLength2(version);
  const hashOffset = codeOffset + encodingLength2(code);
  const bytes2 = new Uint8Array(hashOffset + multihash.byteLength);
  encodeTo2(version, bytes2, 0);
  encodeTo2(code, bytes2, codeOffset);
  bytes2.set(multihash, hashOffset);
  return bytes2;
}
var cidSymbol2 = /* @__PURE__ */ Symbol.for("@ipld/js-cid/CID");

// node_modules/@atproto/lexicon/dist/blob-refs.js
var typedJsonBlobRef = external_exports.object({
  $type: external_exports.literal("blob"),
  ref: schema.cid,
  mimeType: external_exports.string(),
  size: external_exports.number()
}).strict();
var untypedJsonBlobRef = external_exports.object({
  cid: external_exports.string(),
  mimeType: external_exports.string()
}).strict();
var jsonBlobRef = external_exports.union([typedJsonBlobRef, untypedJsonBlobRef]);
var BlobRef = class _BlobRef {
  constructor(ref2, mimeType, size, original) {
    this.ref = ref2;
    this.mimeType = mimeType;
    this.size = size;
    this.original = original ?? {
      $type: "blob",
      ref: ref2,
      mimeType,
      size
    };
  }
  static asBlobRef(obj) {
    if (check_exports.is(obj, jsonBlobRef)) {
      return _BlobRef.fromJsonRef(obj);
    }
    return null;
  }
  static fromJsonRef(json) {
    if (check_exports.is(json, typedJsonBlobRef)) {
      return new _BlobRef(json.ref, json.mimeType, json.size);
    } else {
      return new _BlobRef(CID2.parse(json.cid), json.mimeType, -1, json);
    }
  }
  ipld() {
    return this.original;
  }
  toJSON() {
    return ipldToJson(this.ipld());
  }
};

// node_modules/@atproto/lexicon/dist/validators/blob.js
function blob(lexicons2, path, def2, value) {
  if (!value || !(value instanceof BlobRef)) {
    return {
      success: false,
      error: new ValidationError(`${path} should be a blob ref`)
    };
  }
  return { success: true, value };
}

// node_modules/@atproto/lexicon/dist/validators/formats.js
var datetime = createValidator(isDatetimeStringLenient, "must be an valid atproto datetime (both RFC-3339 and ISO-8601)");
var uri = createValidator(isValidUri, "must be a uri");
var atUri = createValidator(isAtUriString, "must be a valid at-uri");
var did = createValidator(isValidDid, "must be a valid did");
var handle = createValidator(isValidHandle, "must be a valid handle");
var atIdentifier = createValidator(isAtIdentifierString, "must be a valid did or a handle");
var nsid = createValidator(isValidNsid, "must be a valid nsid");
var cid = createValidator(isCidString, "must be a cid string");
var language = createValidator(isValidLanguage, "must be a well-formed BCP 47 language tag");
var tid = createValidator(isValidTid, "must be a valid TID");
var recordKey = createValidator(isValidRecordKey, "must be a valid Record Key");
function createValidator(assertionFn, errorMessage) {
  return (path, value) => {
    if (assertionFn(value)) {
      return { success: true, value };
    }
    return {
      success: false,
      error: new ValidationError(`${path} ${errorMessage}`)
    };
  };
}
function isCidString(v) {
  try {
    CID2.parse(v);
    return true;
  } catch {
    return false;
  }
}

// node_modules/@atproto/lexicon/dist/validators/primitives.js
function validate(lexicons2, path, def2, value) {
  switch (def2.type) {
    case "boolean":
      return boolean(lexicons2, path, def2, value);
    case "integer":
      return integer(lexicons2, path, def2, value);
    case "string":
      return string(lexicons2, path, def2, value);
    case "bytes":
      return bytes(lexicons2, path, def2, value);
    case "cid-link":
      return cidLink(lexicons2, path, def2, value);
    case "unknown":
      return unknown(lexicons2, path, def2, value);
    default:
      return {
        success: false,
        error: new ValidationError(`Unexpected lexicon type: ${def2.type}`)
      };
  }
}
function boolean(lexicons2, path, def2, value) {
  def2 = def2;
  const type = typeof value;
  if (type === "undefined") {
    if (typeof def2.default === "boolean") {
      return { success: true, value: def2.default };
    }
    return {
      success: false,
      error: new ValidationError(`${path} must be a boolean`)
    };
  } else if (type !== "boolean") {
    return {
      success: false,
      error: new ValidationError(`${path} must be a boolean`)
    };
  }
  if (typeof def2.const === "boolean") {
    if (value !== def2.const) {
      return {
        success: false,
        error: new ValidationError(`${path} must be ${def2.const}`)
      };
    }
  }
  return { success: true, value };
}
function integer(lexicons2, path, def2, value) {
  def2 = def2;
  const type = typeof value;
  if (type === "undefined") {
    if (typeof def2.default === "number") {
      return { success: true, value: def2.default };
    }
    return {
      success: false,
      error: new ValidationError(`${path} must be an integer`)
    };
  } else if (!Number.isInteger(value)) {
    return {
      success: false,
      error: new ValidationError(`${path} must be an integer`)
    };
  }
  if (typeof def2.const === "number") {
    if (value !== def2.const) {
      return {
        success: false,
        error: new ValidationError(`${path} must be ${def2.const}`)
      };
    }
  }
  if (Array.isArray(def2.enum)) {
    if (!def2.enum.includes(value)) {
      return {
        success: false,
        error: new ValidationError(`${path} must be one of (${def2.enum.join("|")})`)
      };
    }
  }
  if (typeof def2.maximum === "number") {
    if (value > def2.maximum) {
      return {
        success: false,
        error: new ValidationError(`${path} can not be greater than ${def2.maximum}`)
      };
    }
  }
  if (typeof def2.minimum === "number") {
    if (value < def2.minimum) {
      return {
        success: false,
        error: new ValidationError(`${path} can not be less than ${def2.minimum}`)
      };
    }
  }
  return { success: true, value };
}
function string(lexicons2, path, def2, value) {
  def2 = def2;
  if (typeof value === "undefined") {
    if (typeof def2.default === "string") {
      return { success: true, value: def2.default };
    }
    return {
      success: false,
      error: new ValidationError(`${path} must be a string`)
    };
  } else if (typeof value !== "string") {
    return {
      success: false,
      error: new ValidationError(`${path} must be a string`)
    };
  }
  if (typeof def2.const === "string") {
    if (value !== def2.const) {
      return {
        success: false,
        error: new ValidationError(`${path} must be ${def2.const}`)
      };
    }
  }
  if (Array.isArray(def2.enum)) {
    if (!def2.enum.includes(value)) {
      return {
        success: false,
        error: new ValidationError(`${path} must be one of (${def2.enum.join("|")})`)
      };
    }
  }
  if (typeof def2.minLength === "number" || typeof def2.maxLength === "number") {
    if (typeof def2.minLength === "number" && value.length * 3 < def2.minLength) {
      return {
        success: false,
        error: new ValidationError(`${path} must not be shorter than ${def2.minLength} characters`)
      };
    }
    let canSkipUtf8LenChecks = false;
    if (typeof def2.minLength === "undefined" && typeof def2.maxLength === "number" && value.length * 3 <= def2.maxLength) {
      canSkipUtf8LenChecks = true;
    }
    if (!canSkipUtf8LenChecks) {
      const len = utf8LenLegacy(value);
      if (typeof def2.maxLength === "number") {
        if (len > def2.maxLength) {
          return {
            success: false,
            error: new ValidationError(`${path} must not be longer than ${def2.maxLength} characters`)
          };
        }
      }
      if (typeof def2.minLength === "number") {
        if (len < def2.minLength) {
          return {
            success: false,
            error: new ValidationError(`${path} must not be shorter than ${def2.minLength} characters`)
          };
        }
      }
    }
  }
  if (typeof def2.maxGraphemes === "number" || typeof def2.minGraphemes === "number") {
    let needsMaxGraphemesCheck = false;
    let needsMinGraphemesCheck = false;
    if (typeof def2.maxGraphemes === "number") {
      if (value.length <= def2.maxGraphemes) {
        needsMaxGraphemesCheck = false;
      } else {
        needsMaxGraphemesCheck = true;
      }
    }
    if (typeof def2.minGraphemes === "number") {
      if (value.length < def2.minGraphemes) {
        return {
          success: false,
          error: new ValidationError(`${path} must not be shorter than ${def2.minGraphemes} graphemes`)
        };
      } else {
        needsMinGraphemesCheck = true;
      }
    }
    if (needsMaxGraphemesCheck || needsMinGraphemesCheck) {
      const len = graphemeLenLegacy(value);
      if (typeof def2.maxGraphemes === "number") {
        if (len > def2.maxGraphemes) {
          return {
            success: false,
            error: new ValidationError(`${path} must not be longer than ${def2.maxGraphemes} graphemes`)
          };
        }
      }
      if (typeof def2.minGraphemes === "number") {
        if (len < def2.minGraphemes) {
          return {
            success: false,
            error: new ValidationError(`${path} must not be shorter than ${def2.minGraphemes} graphemes`)
          };
        }
      }
    }
  }
  if (typeof def2.format === "string") {
    switch (def2.format) {
      case "datetime":
        return datetime(path, value);
      case "uri":
        return uri(path, value);
      case "at-uri":
        return atUri(path, value);
      case "did":
        return did(path, value);
      case "handle":
        return handle(path, value);
      case "at-identifier":
        return atIdentifier(path, value);
      case "nsid":
        return nsid(path, value);
      case "cid":
        return cid(path, value);
      case "language":
        return language(path, value);
      case "tid":
        return tid(path, value);
      case "record-key":
        return recordKey(path, value);
    }
  }
  return { success: true, value };
}
function bytes(lexicons2, path, def2, value) {
  def2 = def2;
  if (!value || !(value instanceof Uint8Array)) {
    return {
      success: false,
      error: new ValidationError(`${path} must be a byte array`)
    };
  }
  if (typeof def2.maxLength === "number") {
    if (value.byteLength > def2.maxLength) {
      return {
        success: false,
        error: new ValidationError(`${path} must not be larger than ${def2.maxLength} bytes`)
      };
    }
  }
  if (typeof def2.minLength === "number") {
    if (value.byteLength < def2.minLength) {
      return {
        success: false,
        error: new ValidationError(`${path} must not be smaller than ${def2.minLength} bytes`)
      };
    }
  }
  return { success: true, value };
}
function cidLink(lexicons2, path, def2, value) {
  if (CID2.asCID(value) === null) {
    return {
      success: false,
      error: new ValidationError(`${path} must be a CID`)
    };
  }
  return { success: true, value };
}
function unknown(lexicons2, path, def2, value) {
  if (!value || typeof value !== "object") {
    return {
      success: false,
      error: new ValidationError(`${path} must be an object`)
    };
  }
  return { success: true, value };
}

// node_modules/@atproto/lexicon/dist/validators/complex.js
function validate2(lexicons2, path, def2, value) {
  switch (def2.type) {
    case "object":
      return object(lexicons2, path, def2, value);
    case "array":
      return array(lexicons2, path, def2, value);
    case "blob":
      return blob(lexicons2, path, def2, value);
    default:
      return validate(lexicons2, path, def2, value);
  }
}
function array(lexicons2, path, def2, value) {
  if (!Array.isArray(value)) {
    return {
      success: false,
      error: new ValidationError(`${path} must be an array`)
    };
  }
  if (typeof def2.maxLength === "number") {
    if (value.length > def2.maxLength) {
      return {
        success: false,
        error: new ValidationError(`${path} must not have more than ${def2.maxLength} elements`)
      };
    }
  }
  if (typeof def2.minLength === "number") {
    if (value.length < def2.minLength) {
      return {
        success: false,
        error: new ValidationError(`${path} must not have fewer than ${def2.minLength} elements`)
      };
    }
  }
  const itemsDef = def2.items;
  for (let i = 0; i < value.length; i++) {
    const itemValue = value[i];
    const itemPath = `${path}/${i}`;
    const res = validateOneOf(lexicons2, itemPath, itemsDef, itemValue);
    if (!res.success) {
      return res;
    }
  }
  return { success: true, value };
}
function object(lexicons2, path, def2, value) {
  if (!isObj(value)) {
    return {
      success: false,
      error: new ValidationError(`${path} must be an object`)
    };
  }
  let resultValue = value;
  if ("properties" in def2 && def2.properties != null) {
    for (const key3 in def2.properties) {
      const keyValue = value[key3];
      if (keyValue === null && def2.nullable?.includes(key3)) {
        continue;
      }
      const propDef = def2.properties[key3];
      if (keyValue === void 0 && !def2.required?.includes(key3)) {
        if (propDef.type === "integer" || propDef.type === "boolean" || propDef.type === "string") {
          if (propDef.default === void 0) {
            continue;
          }
        } else {
          continue;
        }
      }
      const propPath = `${path}/${key3}`;
      const validated = validateOneOf(lexicons2, propPath, propDef, keyValue);
      const propValue = validated.success ? validated.value : keyValue;
      if (propValue === void 0) {
        if (def2.required?.includes(key3)) {
          return {
            success: false,
            error: new ValidationError(`${path} must have the property "${key3}"`)
          };
        }
      } else {
        if (!validated.success) {
          return validated;
        }
      }
      if (propValue !== keyValue) {
        if (resultValue === value) {
          resultValue = { ...value };
        }
        resultValue[key3] = propValue;
      }
    }
  }
  return { success: true, value: resultValue };
}
function validateOneOf(lexicons2, path, def2, value, mustBeObj = false) {
  let concreteDef;
  if (def2.type === "union") {
    if (!isDiscriminatedObject(value)) {
      return {
        success: false,
        error: new ValidationError(`${path} must be an object which includes the "$type" property`)
      };
    }
    if (!refsContainType(def2.refs, value.$type)) {
      if (def2.closed) {
        return {
          success: false,
          error: new ValidationError(`${path} $type must be one of ${def2.refs.join(", ")}`)
        };
      }
      return { success: true, value };
    } else {
      concreteDef = lexicons2.getDefOrThrow(value.$type);
    }
  } else if (def2.type === "ref") {
    concreteDef = lexicons2.getDefOrThrow(def2.ref);
  } else {
    concreteDef = def2;
  }
  return mustBeObj ? object(lexicons2, path, concreteDef, value) : validate2(lexicons2, path, concreteDef, value);
}
var refsContainType = (refs, type) => {
  const lexUri = toLexUri(type);
  if (refs.includes(lexUri)) {
    return true;
  }
  if (lexUri.endsWith("#main")) {
    return refs.includes(lexUri.slice(0, -5));
  } else {
    return !lexUri.includes("#") && refs.includes(`${lexUri}#main`);
  }
};

// node_modules/@atproto/lexicon/dist/validators/xrpc.js
function params(lexicons2, path, def2, val) {
  const value = isObj(val) ? val : {};
  const requiredProps = new Set(def2.required ?? []);
  let resultValue = value;
  if (typeof def2.properties === "object") {
    for (const key3 in def2.properties) {
      const propDef = def2.properties[key3];
      const validated = propDef.type === "array" ? array(lexicons2, key3, propDef, value[key3]) : validate(lexicons2, key3, propDef, value[key3]);
      const propValue = validated.success ? validated.value : value[key3];
      const propIsUndefined = typeof propValue === "undefined";
      if (propIsUndefined && requiredProps.has(key3)) {
        return {
          success: false,
          error: new ValidationError(`${path} must have the property "${key3}"`)
        };
      } else if (!propIsUndefined && !validated.success) {
        return validated;
      }
      if (propValue !== value[key3]) {
        if (resultValue === value) {
          resultValue = { ...value };
        }
        resultValue[key3] = propValue;
      }
    }
  }
  return { success: true, value: resultValue };
}

// node_modules/@atproto/lexicon/dist/validation.js
function assertValidRecord(lexicons2, def2, value) {
  const res = object(lexicons2, "Record", def2.record, value);
  if (!res.success)
    throw res.error;
  return res.value;
}
function assertValidXrpcParams(lexicons2, def2, value) {
  if (def2.parameters) {
    const res = params(lexicons2, "Params", def2.parameters, value);
    if (!res.success)
      throw res.error;
    return res.value;
  }
}
function assertValidXrpcInput(lexicons2, def2, value) {
  if (def2.input?.schema) {
    return assertValidOneOf(lexicons2, "Input", def2.input.schema, value, true);
  }
}
function assertValidXrpcOutput(lexicons2, def2, value) {
  if (def2.output?.schema) {
    return assertValidOneOf(lexicons2, "Output", def2.output.schema, value, true);
  }
}
function assertValidXrpcMessage(lexicons2, def2, value) {
  if (def2.message?.schema) {
    return assertValidOneOf(lexicons2, "Message", def2.message.schema, value, true);
  }
}
function assertValidOneOf(lexicons2, path, def2, value, mustBeObj = false) {
  const res = validateOneOf(lexicons2, path, def2, value, mustBeObj);
  if (!res.success)
    throw res.error;
  return res.value;
}

// node_modules/@atproto/lexicon/dist/lexicons.js
var Lexicons = class {
  constructor(docs) {
    this.docs = /* @__PURE__ */ new Map();
    this.defs = /* @__PURE__ */ new Map();
    if (docs) {
      for (const doc of docs) {
        this.add(doc);
      }
    }
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
    const uri2 = toLexUri(doc.id);
    if (this.docs.has(uri2)) {
      throw new Error(`${uri2} has already been registered`);
    }
    resolveRefUris(doc, uri2);
    this.docs.set(uri2, doc);
    for (const [defUri, def2] of iterDefs(doc)) {
      this.defs.set(defUri, def2);
    }
  }
  /**
   * Remove a lexicon doc.
   */
  remove(uri2) {
    uri2 = toLexUri(uri2);
    const doc = this.docs.get(uri2);
    if (!doc) {
      throw new Error(`Unable to remove "${uri2}": does not exist`);
    }
    for (const [defUri, _def] of iterDefs(doc)) {
      this.defs.delete(defUri);
    }
    this.docs.delete(uri2);
  }
  /**
   * Get a lexicon doc.
   */
  get(uri2) {
    uri2 = toLexUri(uri2);
    return this.docs.get(uri2);
  }
  /**
   * Get a definition.
   */
  getDef(uri2) {
    uri2 = toLexUri(uri2);
    return this.defs.get(uri2);
  }
  getDefOrThrow(uri2, types) {
    const def2 = this.getDef(uri2);
    if (!def2) {
      throw new LexiconDefNotFoundError(`Lexicon not found: ${uri2}`);
    }
    if (types && !types.includes(def2.type)) {
      throw new InvalidLexiconError(`Not a ${types.join(" or ")} lexicon: ${uri2}`);
    }
    return def2;
  }
  /**
   * Validate a record or object.
   */
  validate(lexUri, value) {
    if (!isObj(value)) {
      throw new ValidationError(`Value must be an object`);
    }
    const lexUriNormalized = toLexUri(lexUri);
    const def2 = this.getDefOrThrow(lexUriNormalized, ["record", "object"]);
    if (def2.type === "record") {
      return object(this, "Record", def2.record, value);
    } else if (def2.type === "object") {
      return object(this, "Object", def2, value);
    } else {
      throw new InvalidLexiconError("Definition must be a record or object");
    }
  }
  /**
   * Validate a record and throw on any error.
   */
  assertValidRecord(lexUri, value) {
    if (!isObj(value)) {
      throw new ValidationError(`Record must be an object`);
    }
    if (!("$type" in value)) {
      throw new ValidationError(`Record/$type must be a string`);
    }
    const { $type } = value;
    if (typeof $type !== "string") {
      throw new ValidationError(`Record/$type must be a string`);
    }
    const lexUriNormalized = toLexUri(lexUri);
    if (toLexUri($type) !== lexUriNormalized) {
      throw new ValidationError(`Invalid $type: must be ${lexUriNormalized}, got ${$type}`);
    }
    const def2 = this.getDefOrThrow(lexUriNormalized, ["record"]);
    return assertValidRecord(this, def2, value);
  }
  /**
   * Validate xrpc query params and throw on any error.
   */
  assertValidXrpcParams(lexUri, value) {
    lexUri = toLexUri(lexUri);
    const def2 = this.getDefOrThrow(lexUri, [
      "query",
      "procedure",
      "subscription"
    ]);
    return assertValidXrpcParams(this, def2, value);
  }
  /**
   * Validate xrpc input body and throw on any error.
   */
  assertValidXrpcInput(lexUri, value) {
    lexUri = toLexUri(lexUri);
    const def2 = this.getDefOrThrow(lexUri, ["procedure"]);
    return assertValidXrpcInput(this, def2, value);
  }
  /**
   * Validate xrpc output body and throw on any error.
   */
  assertValidXrpcOutput(lexUri, value) {
    lexUri = toLexUri(lexUri);
    const def2 = this.getDefOrThrow(lexUri, ["query", "procedure"]);
    return assertValidXrpcOutput(this, def2, value);
  }
  /**
   * Validate xrpc subscription message and throw on any error.
   */
  assertValidXrpcMessage(lexUri, value) {
    lexUri = toLexUri(lexUri);
    const def2 = this.getDefOrThrow(lexUri, ["subscription"]);
    return assertValidXrpcMessage(this, def2, value);
  }
  /**
   * Resolve a lex uri given a ref
   */
  resolveLexUri(lexUri, ref2) {
    lexUri = toLexUri(lexUri);
    return toLexUri(ref2, lexUri);
  }
};
function* iterDefs(doc) {
  for (const defId in doc.defs) {
    yield [`lex:${doc.id}#${defId}`, doc.defs[defId]];
    if (defId === "main") {
      yield [`lex:${doc.id}`, doc.defs[defId]];
    }
  }
}
function resolveRefUris(obj, baseUri) {
  for (const k in obj) {
    if (obj.type === "ref") {
      obj.ref = toLexUri(obj.ref, baseUri);
    } else if (obj.type === "union") {
      obj.refs = obj.refs.map((ref2) => toLexUri(ref2, baseUri));
    } else if (Array.isArray(obj[k])) {
      obj[k] = obj[k].map((item) => {
        if (typeof item === "string") {
          return item.startsWith("#") ? toLexUri(item, baseUri) : item;
        } else if (item && typeof item === "object") {
          return resolveRefUris(item, baseUri);
        }
        return item;
      });
    } else if (obj[k] && typeof obj[k] === "object") {
      obj[k] = resolveRefUris(obj[k], baseUri);
    }
  }
  return obj;
}

// dist/lexicons/ai/generalbusiness/atseq/definition.json
var definition_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.definition",
  description: "Local v0 definition manifest. Bind authored Lexicons to retained source files.",
  defs: {
    main: {
      type: "object",
      required: ["version", "profile", "title", "files", "lexicons", "state", "actions", "queries", "views"],
      properties: {
        version: {
          type: "integer",
          const: 1
        },
        profile: {
          type: "cid-link"
        },
        title: {
          type: "string",
          minLength: 1,
          maxLength: 120
        },
        files: {
          type: "array",
          maxLength: 63,
          items: {
            type: "ref",
            ref: "#file"
          }
        },
        lexicons: {
          type: "array",
          minLength: 1,
          maxLength: 63,
          items: {
            type: "string",
            maxLength: 200
          }
        },
        state: {
          type: "ref",
          ref: "#state"
        },
        actions: {
          type: "array",
          maxLength: 63,
          items: {
            type: "ref",
            ref: "#action"
          }
        },
        queries: {
          type: "array",
          maxLength: 63,
          items: {
            type: "ref",
            ref: "#query"
          }
        },
        views: {
          type: "array",
          maxLength: 63,
          items: {
            type: "ref",
            ref: "#view"
          }
        }
      }
    },
    file: {
      type: "object",
      required: ["path", "cid"],
      properties: {
        path: {
          type: "string",
          minLength: 1,
          maxLength: 200
        },
        cid: {
          type: "string",
          format: "cid"
        }
      }
    },
    state: {
      type: "object",
      required: ["ref", "initial"],
      properties: {
        ref: {
          type: "string",
          maxLength: 300
        },
        initial: {
          type: "string",
          maxLength: 200
        }
      }
    },
    action: {
      type: "object",
      required: ["ref", "fold"],
      properties: {
        ref: {
          type: "string",
          maxLength: 300
        },
        fold: {
          type: "string",
          maxLength: 200
        }
      }
    },
    query: {
      type: "object",
      required: ["name", "ref", "program"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
          maxLength: 80
        },
        ref: {
          type: "string",
          maxLength: 300
        },
        program: {
          type: "string",
          maxLength: 200
        }
      }
    },
    view: {
      type: "object",
      required: ["name", "source"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
          maxLength: 80
        },
        source: {
          type: "string",
          maxLength: 200
        },
        query: {
          type: "string",
          maxLength: 80
        }
      }
    }
  }
};

// dist/src/core/limits.js
var WIRE_LIMITS = Object.freeze({ version: 1, blockBytes: 64 * 1024, jsonBytes: 128 * 1024, depth: 32 });
var SOURCE_LIMITS = Object.freeze({ bytes: 16 * 1024 * 1024, blocks: 2048 });
var HOST_LIMITS = Object.freeze({
  historyEntries: 2e4,
  retainedDefinitions: 32,
  bodyBytes: 32 * 1024 * 1024,
  applications: 32,
  drafts: 32,
  draftBytes: SOURCE_LIMITS.bytes,
  requestBytes: 768 * 1024
});

// dist/src/core/profile.js
var PROFILE = Object.freeze({
  id: "atseq-jsonata-v1",
  stateBytes: 128 * 1024,
  inputBytes: 256 * 1024,
  outputBytes: 256 * 1024,
  actionBytes: 32 * 1024,
  programBytes: 64 * 1024,
  definitionBytes: 512 * 1024,
  definitionFiles: 64,
  inputDepth: 32,
  astNodes: 4096,
  astDepth: 64,
  evaluationDepth: 64,
  evaluationSteps: 1e5,
  sequenceLength: 16384,
  intermediateBytes: 1024 * 1024,
  inspectionBytes: 16 * 1024 * 1024,
  foldMessageLength: 1024,
  viewNodes: 2048,
  viewDepth: 24
});

// dist/src/core/values.js
var encoder = new TextEncoder();

// dist/src/protocol/wire.js
function isCidInputError(error) {
  return error instanceof Error && (error.constructor === SyntaxError && /^(not a valid cid string|invalid binary cid)$/.test(error.message) || error.constructor === RangeError && /^(cid too short|incorrect cid (version|codec|digest codec|digest size) \(got .+\)|cid bytes includes remainder|invalid digest length)$/.test(error.message));
}
function link(cid4) {
  if (typeof cid4 !== "string")
    throw new ProtocolError("wire_cid", "Expected a CID string");
  let parsed;
  try {
    parsed = fromString(cid4);
  } catch (error) {
    if (!isCidInputError(error))
      throw error;
    throw new ProtocolError("wire_cid", "Expected a base32 CIDv1 with CBOR codec and SHA-256");
  }
  if (parsed.codec !== CODEC_DCBOR || toString(parsed) !== cid4)
    throw new ProtocolError("wire_cid", "Expected canonical CBOR CID");
  return { $link: cid4 };
}

// dist/src/protocol/native-schema.js
var prefix = "ai.generalbusiness.atseq";
var NATIVE_NSID = deepFreeze({
  genesis: `${prefix}.genesis`,
  head: `${prefix}.head`,
  entry: `${prefix}.entry`,
  definition: `${prefix}.definition`,
  epoch: `${prefix}.epoch`,
  epochCurrent: `${prefix}.epochCurrent`,
  grant: `${prefix}.grant`,
  revoke: `${prefix}.revoke`,
  file: `${prefix}.file`,
  content: `${prefix}.content`,
  defs: `${prefix}.defs`
});
var nativeRef = (name) => `ai.generalbusiness.atseq.defs#${name}`;
var str = (maxLength, format3) => ({
  type: "string",
  maxLength,
  ...format3 ? { format: format3 } : {}
});
var integer2 = (maximum, minimum = 0) => ({ type: "integer", minimum, maximum });
var cid2 = { type: "cid-link" };
var did2 = str(2048, "did");
var key = str(128, "did");
var bool = { type: "boolean" };
var binary = (length3, minimum = length3) => ({ type: "bytes", minLength: minimum, maxLength: length3 });
var ref = (name) => ({ type: "ref", ref: nativeRef(name) });
var array2 = (items, maxLength, minLength = 0) => ({
  type: "array",
  items,
  maxLength,
  minLength
});
var object2 = (properties, nullable = []) => ({
  type: "object",
  required: Object.keys(properties),
  ...nullable.length ? { nullable } : {},
  properties
});
var union = (...names) => ({ type: "union", closed: true, refs: names.map(nativeRef) });
var pair = object2({ principal: did2, actorKey: key });
var grantId = str(26);
var role = str(64);
var scope = object2({ action: str(300), execution: cid2 });
var appointment = object2({
  principal: did2,
  actorKey: key,
  powers: array2({ type: "string", enum: ["certify", "govern", "recover"] }, 3, 1)
});
var context = { position: integer2(Number.MAX_SAFE_INTEGER, 1), prev: cid2, controlTip: cid2 };
var grantContext = { grant: object2({ id: grantId, cid: cid2 }), epoch: cid2 };
var evidence = union("plcAudit", "webDocument");
var binding = object2({ signingKeyDid: key, pdsOrigin: str(2048, "uri") });
var definitions = {
  path: object2({ collection: str(317, "nsid"), rkey: str(512, "record-key") }),
  act: object2({ ...grantContext, action: str(300), execution: cid2, payload: { type: "unknown" } }),
  assignRole: object2({ ...grantContext, target: did2, role, enabled: bool, expectedAssignment: cid2 }, [
    "expectedAssignment"
  ]),
  setControl: object2({ ...context, control: array2(appointment, 16) }),
  // Shape preparation only. Power transitions belong to the separately reviewed authority reducer.
  setRecovery: object2({ ...context, recovery: array2(pair, 16, 1) }),
  setOwner: object2({ ...context, owner: did2 }, ["owner"]),
  setRole: object2({ ...context, target: did2, role, enabled: bool, expectedAssignment: cid2 }, ["expectedAssignment"]),
  activate: object2({ ...context, expected: cid2, definition: cid2, closure: array2(str(128, "cid"), 64, 1) }),
  recoverParticipant: object2({ ...context, target: did2, expectedEpoch: cid2, expectedObservation: cid2, epoch: cid2, observation: cid2 }, ["expectedEpoch", "expectedObservation"]),
  recoverGovernance: object2({ ...context, governance: array2(pair, 16) }),
  intent: object2({
    version: { type: "integer", const: 2 },
    app: did2,
    genesis: cid2,
    principal: did2,
    actorKey: key,
    nonce: binary(16),
    operation: union("act", "assignRole", "setControl", "setRecovery", "setOwner", "setRole", "activate", "recoverParticipant", "recoverGovernance")
  }),
  signedRequest: object2({ intent: ref("intent"), sig: binary(64) }),
  admitGrant: object2({ grant: object2({ id: grantId, cid: cid2 }) }),
  advanceEpoch: object2({ epoch: cid2 }),
  revokeGrant: object2({ revoke: object2({ id: grantId, cid: cid2 }) }),
  accountOperation: object2({
    app: did2,
    genesis: cid2,
    position: integer2(Number.MAX_SAFE_INTEGER, 1),
    prev: cid2,
    principal: did2,
    expectedEpoch: cid2,
    expectedObservation: cid2,
    operation: union("admitGrant", "advanceEpoch", "revokeGrant"),
    observation: cid2
  }, ["expectedEpoch", "expectedObservation"]),
  receipt: object2({
    version: { type: "integer", const: 2 },
    app: did2,
    genesis: cid2,
    request: cid2,
    position: integer2(Number.MAX_SAFE_INTEGER, 1),
    entry: cid2,
    publication: object2({ root: cid2, binding: cid2, proofs: array2(cid2, 16, 1), head: cid2 }, ["head"])
  }),
  byteChunk: object2({ bytes: binary(32 * 1024, 1) }),
  byteManifest: object2({ byteLength: integer2(32 * 1024 * 1024), chunks: array2(cid2, 1024) }),
  observationPolicy: object2({
    algorithm: { type: "string", const: "atseq-account-observation-v1" },
    plcDirectory: str(2048, "uri"),
    allowWeb: bool,
    checkpoint: { type: "string", const: "native-publication-v1" }
  }),
  plcAudit: object2({ bytes: cid2, source: str(2048, "uri"), selectedTip: cid2 }),
  webDocument: object2({ bytes: cid2, source: str(2048, "uri") }),
  observation: object2({
    policy: cid2,
    principal: did2,
    context: object2({ app: did2, genesis: cid2, position: integer2(Number.MAX_SAFE_INTEGER, 1), prev: cid2, subject: cid2 }),
    binding,
    before: evidence,
    after: evidence,
    repositoryRoot: cid2,
    records: array2(object2({ path: str(1024), cid: cid2 }), 16, 1),
    proofs: array2(cid2, 16, 1),
    observedAt: str(24, "datetime")
  }),
  appBinding: object2({ policy: cid2, principal: did2, binding, before: evidence, after: evidence, repositoryRoot: cid2 }),
  openParticipation: object2({}),
  requiredRole: object2({ role }),
  actionContract: object2({
    semantics: cid2,
    schemas: object2({ stateRoot: str(300), actionRoot: str(300), closure: cid2 }),
    fold: str(128, "cid"),
    authorization: union("openParticipation", "requiredRole")
  })
};
var record = (name, properties, nullable = [], literal) => ({
  lexicon: 1,
  id: `${prefix}.${name}`,
  defs: {
    main: {
      type: "record",
      key: literal ? `literal:${literal}` : "any",
      record: object2({ version: { type: "integer", const: ["genesis", "head", "entry"].includes(name) ? 2 : 1 }, ...properties }, nullable)
    }
  }
});
var appScope = { app: did2, genesis: cid2 };
var nativeDefinition = structuredClone(definition_default);
nativeDefinition.defs.main = { type: "record", key: "any", record: nativeDefinition.defs.main };
nativeDefinition.defs.main.record.properties.version.const = 2;
nativeDefinition.defs.action.required.push("authorization");
nativeDefinition.defs.action.properties.authorization = union("openParticipation", "requiredRole");
var nativeLexicons = deepFreeze([
  { lexicon: 1, id: NATIVE_NSID.defs, defs: definitions },
  record("genesis", {
    app: did2,
    creation: binary(16),
    semantics: cid2,
    definition: cid2,
    observationPolicy: cid2,
    control: array2(appointment, 16),
    recoverGovernance: bool,
    owner: did2,
    roles: array2(object2({ principal: did2, role }), 63)
  }, ["owner"]),
  record("head", { ...appScope, position: integer2(Number.MAX_SAFE_INTEGER), entry: cid2 }),
  record("entry", {
    ...appScope,
    position: integer2(Number.MAX_SAFE_INTEGER, 1),
    prev: cid2,
    request: union("signedRequest", "accountOperation")
  }),
  record("epoch", { id: binary(16), previous: cid2 }, ["previous"]),
  record("epochCurrent", { epoch: cid2, id: binary(16) }, [], "self"),
  record("grant", {
    id: grantId,
    ...appScope,
    epoch: cid2,
    actorKey: key,
    actions: array2(scope, 63),
    assignRoles: array2(role, 63)
  }),
  record("revoke", { id: grantId, ...appScope }),
  record("file", { cid: str(128, "cid"), bytes: cid2 }),
  record("content", {
    body: union("byteChunk", "byteManifest", "observationPolicy", "observation", "appBinding", "actionContract")
  }),
  nativeDefinition
]);
var registry = new Lexicons(structuredClone([...nativeLexicons]));
var typed = new Set(Object.keys(definitions).map(nativeRef));
function validateNativeAccountDid(value) {
  if (typeof value !== "string" || value.length > 2048 || !(0, import_did3.isAtprotoDid)(value) || value.startsWith("did:web:") && /%3a/i.test(value))
    throw new ProtocolError("envelope", "Expected PLC or hostname-only web account DID");
}

// dist/lexicons/ai/generalbusiness/atseq/defs.json
var defs_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.defs",
  description: "Atseq v1 framework contract under the owned atseq.generalbusiness.ai authority.",
  defs: {
    intent: {
      type: "object",
      required: ["version", "app", "genesis", "definition", "actorKey", "nonce", "action", "payload"],
      properties: {
        version: {
          type: "integer",
          const: 1
        },
        app: {
          type: "string",
          format: "did",
          maxLength: 256
        },
        genesis: {
          type: "cid-link"
        },
        definition: {
          type: "cid-link"
        },
        actorKey: {
          type: "string",
          format: "did",
          maxLength: 128
        },
        nonce: {
          type: "bytes",
          minLength: 16,
          maxLength: 16
        },
        action: {
          type: "string",
          minLength: 3,
          maxLength: 256
        },
        payload: {
          type: "unknown"
        }
      }
    },
    signedIntent: {
      type: "object",
      required: ["intent", "sig"],
      properties: {
        intent: {
          type: "ref",
          ref: "ai.generalbusiness.atseq.defs#intent"
        },
        sig: {
          type: "bytes",
          minLength: 64,
          maxLength: 64
        }
      }
    },
    cursor: {
      type: "object",
      required: ["position", "entry"],
      properties: {
        position: {
          type: "integer",
          minimum: 0,
          maximum: 9007199254740991
        },
        entry: {
          type: "cid-link"
        }
      }
    },
    receipt: {
      type: "object",
      required: ["app", "genesis", "intent", "position", "entry"],
      properties: {
        app: {
          type: "string",
          format: "did",
          maxLength: 256
        },
        genesis: {
          type: "cid-link"
        },
        intent: {
          type: "cid-link"
        },
        position: {
          type: "integer",
          minimum: 0,
          maximum: 9007199254740991
        },
        entry: {
          type: "cid-link"
        }
      }
    },
    queryAvailable: {
      type: "object",
      required: ["value"],
      properties: {
        value: {
          type: "unknown"
        }
      }
    },
    queryUnavailable: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: {
          type: "string",
          maxLength: 64
        },
        message: {
          type: "string",
          maxLength: 4096,
          description: "Atseq v1 limits this field to 1024 Unicode code points; the 4096-byte Lexicon bound permits their UTF-8 encoding."
        }
      }
    },
    pending: {
      type: "object",
      required: [],
      properties: {}
    },
    effective: {
      type: "object",
      required: [],
      properties: {}
    },
    ineffective: {
      type: "object",
      required: ["reason"],
      properties: {
        reason: {
          type: "string",
          minLength: 1,
          maxLength: 64
        },
        message: {
          type: "string",
          maxLength: 4096,
          description: "Atseq v1 limits this field to 1024 Unicode code points; the 4096-byte Lexicon bound permits their UTF-8 encoding."
        }
      }
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/genesis.json
var genesis_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.genesis",
  defs: {
    main: {
      type: "record",
      key: "literal:self",
      record: {
        type: "object",
        required: ["version", "app", "profile", "definition", "sequencerKey", "activationKeys"],
        properties: {
          version: {
            type: "integer",
            const: 1
          },
          app: {
            type: "string",
            format: "did",
            maxLength: 256
          },
          profile: {
            type: "cid-link"
          },
          definition: {
            type: "cid-link"
          },
          sequencerKey: {
            type: "string",
            format: "did",
            maxLength: 128
          },
          activationKeys: {
            type: "array",
            minLength: 1,
            maxLength: 16,
            items: {
              type: "string",
              format: "did",
              maxLength: 128
            }
          }
        }
      }
    },
    value: {
      type: "object",
      required: ["version", "app", "profile", "definition", "sequencerKey", "activationKeys"],
      properties: {
        version: {
          type: "integer",
          const: 1
        },
        app: {
          type: "string",
          format: "did",
          maxLength: 256
        },
        profile: {
          type: "cid-link"
        },
        definition: {
          type: "cid-link"
        },
        sequencerKey: {
          type: "string",
          format: "did",
          maxLength: 128
        },
        activationKeys: {
          type: "array",
          minLength: 1,
          maxLength: 16,
          items: {
            type: "string",
            format: "did",
            maxLength: 128
          }
        }
      }
    }
  },
  description: "Atseq framework contract."
};

// dist/lexicons/ai/generalbusiness/atseq/entry.json
var entry_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.entry",
  defs: {
    main: {
      type: "record",
      key: "any",
      record: {
        type: "object",
        required: ["version", "app", "genesis", "position", "prev", "signedIntent", "sequencerKey", "sig"],
        properties: {
          version: {
            type: "integer",
            const: 1
          },
          app: {
            type: "string",
            format: "did",
            maxLength: 256
          },
          genesis: {
            type: "cid-link"
          },
          position: {
            type: "integer",
            minimum: 1,
            maximum: 9007199254740991
          },
          prev: {
            type: "cid-link"
          },
          signedIntent: {
            type: "ref",
            ref: "ai.generalbusiness.atseq.defs#signedIntent"
          },
          sequencerKey: {
            type: "string",
            format: "did",
            maxLength: 128
          },
          sig: {
            type: "bytes",
            minLength: 64,
            maxLength: 64
          }
        }
      }
    }
  },
  description: "Atseq framework contract."
};

// dist/lexicons/ai/generalbusiness/atseq/head.json
var head_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.head",
  defs: {
    main: {
      type: "record",
      key: "literal:self",
      record: {
        type: "object",
        required: ["version", "app", "genesis", "position", "entry"],
        properties: {
          version: {
            type: "integer",
            const: 1
          },
          app: {
            type: "string",
            format: "did",
            maxLength: 256
          },
          genesis: {
            type: "cid-link"
          },
          position: {
            type: "integer",
            minimum: 0,
            maximum: 9007199254740991
          },
          entry: {
            type: "cid-link"
          }
        }
      }
    },
    value: {
      type: "object",
      required: ["version", "app", "genesis", "position", "entry"],
      properties: {
        version: {
          type: "integer",
          const: 1
        },
        app: {
          type: "string",
          format: "did",
          maxLength: 256
        },
        genesis: {
          type: "cid-link"
        },
        position: {
          type: "integer",
          minimum: 0,
          maximum: 9007199254740991
        },
        entry: {
          type: "cid-link"
        }
      }
    }
  },
  description: "Atseq framework contract."
};

// dist/lexicons/ai/generalbusiness/atseq/create.json
var create_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.create",
  description: "Local-only spike service contract; see docs/protocol.md.",
  defs: {
    main: {
      type: "procedure",
      input: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["source", "activationKeys"],
          properties: {
            source: {
              type: "bytes",
              maxLength: 524288
            },
            activationKeys: {
              type: "array",
              minLength: 1,
              maxLength: 16,
              items: {
                type: "string",
                format: "did",
                maxLength: 128
              }
            }
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["genesis", "genesisCid", "head", "frontier"],
          properties: {
            genesis: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.genesis#value"
            },
            genesisCid: {
              type: "cid-link"
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            frontier: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#cursor"
            }
          },
          nullable: ["frontier"]
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/describe.json
var describe_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.describe",
  description: "Local-only spike service contract; see docs/protocol.md.",
  defs: {
    main: {
      type: "query",
      parameters: {
        type: "params",
        required: ["app", "genesis"],
        properties: {
          app: {
            type: "string",
            format: "did",
            maxLength: 256
          },
          genesis: {
            type: "string",
            format: "cid"
          },
          includeSource: {
            type: "boolean",
            default: false
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["genesis", "definition", "head", "frontier"],
          properties: {
            genesis: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.genesis#value"
            },
            definition: {
              type: "ref",
              ref: "#definition"
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            frontier: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#cursor"
            }
          },
          nullable: ["frontier"]
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    },
    definition: {
      type: "object",
      required: ["version", "cid", "manifest", "lexicons"],
      properties: {
        version: {
          type: "integer",
          const: 1
        },
        cid: {
          type: "string",
          format: "cid"
        },
        manifest: {
          type: "ref",
          ref: "ai.generalbusiness.atseq.definition"
        },
        lexicons: {
          type: "array",
          maxLength: 63,
          items: {
            type: "unknown"
          }
        },
        source: {
          type: "ref",
          ref: "#sourceDocument"
        }
      }
    },
    sourceDocument: {
      type: "object",
      required: ["format", "version", "manifest", "sources"],
      properties: {
        format: {
          type: "string",
          const: "atseq-source"
        },
        version: {
          type: "integer",
          const: 1
        },
        manifest: {
          type: "ref",
          ref: "ai.generalbusiness.atseq.definition"
        },
        sources: {
          type: "array",
          maxLength: 63,
          items: {
            type: "ref",
            ref: "#sourceFile"
          }
        }
      }
    },
    sourceFile: {
      type: "object",
      required: ["path", "content"],
      properties: {
        path: {
          type: "string",
          minLength: 1,
          maxLength: 200
        },
        content: {
          type: "bytes",
          maxLength: 524288
        }
      }
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/submit.json
var submit_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.submit",
  description: "Local-only spike service contract; see docs/protocol.md.",
  defs: {
    main: {
      type: "procedure",
      input: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["block"],
          properties: {
            block: {
              type: "bytes",
              maxLength: 65536
            }
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["receipt", "head", "frontier"],
          properties: {
            receipt: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#receipt"
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            frontier: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#cursor"
            }
          },
          nullable: ["frontier"]
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/query.json
var query_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.query",
  description: "Local-only spike service contract; see docs/protocol.md.",
  defs: {
    main: {
      type: "query",
      parameters: {
        type: "params",
        required: ["app", "genesis", "name", "params"],
        properties: {
          app: {
            type: "string",
            format: "did",
            maxLength: 256
          },
          genesis: {
            type: "string",
            format: "cid"
          },
          name: {
            type: "string",
            maxLength: 256
          },
          params: {
            type: "string",
            maxLength: 32768
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["result", "head", "frontier"],
          properties: {
            result: {
              type: "union",
              closed: true,
              refs: ["ai.generalbusiness.atseq.defs#queryAvailable", "ai.generalbusiness.atseq.defs#queryUnavailable"]
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            frontier: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#cursor"
            }
          },
          nullable: ["frontier"]
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/receipt.json
var receipt_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.receipt",
  description: "Local-only spike service contract; see docs/protocol.md.",
  defs: {
    main: {
      type: "query",
      parameters: {
        type: "params",
        required: ["app", "genesis", "intent"],
        properties: {
          app: {
            type: "string",
            format: "did",
            maxLength: 256
          },
          genesis: {
            type: "string",
            format: "cid"
          },
          intent: {
            type: "string",
            format: "cid"
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["receipt", "outcome", "head", "frontier"],
          properties: {
            receipt: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#receipt"
            },
            outcome: {
              type: "union",
              closed: true,
              refs: [
                "ai.generalbusiness.atseq.defs#pending",
                "ai.generalbusiness.atseq.defs#effective",
                "ai.generalbusiness.atseq.defs#ineffective"
              ]
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            frontier: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#cursor"
            }
          },
          nullable: ["frontier"]
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/src/protocol/schemas.js
var frameworkLexicons = deepFreeze([
  defs_default,
  genesis_default,
  entry_default,
  head_default,
  create_default,
  describe_default,
  definition_default,
  submit_default,
  query_default,
  receipt_default
]);
var lexicons = new Lexicons(structuredClone([...frameworkLexicons]));

// dist/lexicons/ai/generalbusiness/atseq/compareDefinition.json
var compareDefinition_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.compareDefinition",
  description: "Compare a compatible candidate, or retain its source without activating it.",
  defs: {
    main: {
      type: "procedure",
      input: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["app", "genesis", "expected", "source"],
          properties: {
            app: {
              type: "string",
              format: "did"
            },
            genesis: {
              type: "string",
              format: "cid"
            },
            expected: {
              type: "string",
              format: "cid"
            },
            source: {
              type: "bytes",
              maxLength: 524288
            }
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["current", "candidate", "closure", "frontier", "head", "statePreserved", "replayPassed"],
          properties: {
            current: {
              type: "unknown"
            },
            candidate: {
              type: "unknown"
            },
            closure: {
              type: "array",
              maxLength: 64,
              items: {
                type: "string",
                format: "cid"
              }
            },
            frontier: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#cursor"
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            statePreserved: {
              type: "boolean"
            },
            replayPassed: {
              type: "boolean"
            }
          }
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/stageDefinition.json
var stageDefinition_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.stageDefinition",
  description: "Compare a compatible candidate, or retain its source without activating it.",
  defs: {
    main: {
      type: "procedure",
      input: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["app", "genesis", "expected", "source"],
          properties: {
            app: {
              type: "string",
              format: "did"
            },
            genesis: {
              type: "string",
              format: "cid"
            },
            expected: {
              type: "string",
              format: "cid"
            },
            source: {
              type: "bytes",
              maxLength: 524288
            }
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["current", "candidate", "closure", "frontier", "head", "statePreserved", "replayPassed"],
          properties: {
            current: {
              type: "unknown"
            },
            candidate: {
              type: "unknown"
            },
            closure: {
              type: "array",
              maxLength: 64,
              items: {
                type: "string",
                format: "cid"
              }
            },
            frontier: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.defs#cursor"
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            statePreserved: {
              type: "boolean"
            },
            replayPassed: {
              type: "boolean"
            }
          }
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/readDraft.json
var readDraft_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.readDraft",
  defs: {
    main: {
      type: "query",
      parameters: {
        type: "params",
        required: ["definition"],
        properties: {
          definition: {
            type: "string",
            format: "cid"
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["source"],
          properties: {
            source: {
              type: "bytes",
              maxLength: 524288
            }
          }
        }
      }
    }
  },
  description: "Atseq framework contract."
};

// dist/lexicons/ai/generalbusiness/atseq/list.json
var list_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.list",
  description: "Local spike host method; see docs/interaction.md.",
  defs: {
    main: {
      type: "query",
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["apps"],
          properties: {
            apps: {
              type: "array",
              maxLength: 100,
              items: {
                type: "object",
                required: ["app", "genesis", "title"],
                properties: {
                  app: {
                    type: "string",
                    format: "did"
                  },
                  genesis: {
                    type: "string",
                    format: "cid"
                  },
                  title: {
                    type: "string",
                    maxLength: 120
                  }
                }
              }
            }
          }
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/sync.json
var sync_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.sync",
  description: "Local spike host method; see docs/interaction.md.",
  defs: {
    main: {
      type: "query",
      parameters: {
        type: "params",
        required: ["app", "genesis"],
        properties: {
          app: {
            type: "string",
            format: "did",
            maxLength: 256
          },
          genesis: {
            type: "string",
            format: "cid"
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["genesis", "genesisCid", "head", "entries", "source"],
          properties: {
            genesis: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.genesis#value"
            },
            genesisCid: {
              type: "string",
              format: "cid"
            },
            head: {
              type: "ref",
              ref: "ai.generalbusiness.atseq.head#value"
            },
            entries: {
              type: "array",
              maxLength: 2e4,
              items: {
                type: "unknown"
              }
            },
            source: {
              type: "bytes",
              maxLength: 524288
            },
            candidates: {
              type: "array",
              maxLength: 32,
              items: {
                type: "object",
                required: ["definition", "source"],
                properties: {
                  definition: {
                    type: "string",
                    format: "cid"
                  },
                  source: {
                    type: "bytes",
                    maxLength: 16777216
                  }
                }
              }
            }
          }
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/validateDraft.json
var validateDraft_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.validateDraft",
  description: "Local spike host method; see docs/interaction.md.",
  defs: {
    main: {
      type: "procedure",
      input: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["source"],
          properties: {
            source: {
              type: "bytes",
              maxLength: 524288
            }
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["definition"],
          properties: {
            definition: {
              type: "unknown"
            }
          }
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/lexicons/ai/generalbusiness/atseq/preview.json
var preview_default = {
  lexicon: 1,
  id: "ai.generalbusiness.atseq.preview",
  description: "Local spike host method; see docs/interaction.md.",
  defs: {
    main: {
      type: "procedure",
      input: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["source"],
          properties: {
            source: {
              type: "bytes",
              maxLength: 524288
            },
            action: {
              type: "string",
              maxLength: 256
            },
            payload: {
              type: "unknown"
            },
            state: {
              type: "unknown"
            }
          }
        }
      },
      output: {
        encoding: "application/json",
        schema: {
          type: "object",
          required: ["definition", "state", "outcome", "scope", "previewUrl", "views"],
          properties: {
            definition: {
              type: "unknown"
            },
            state: {
              type: "unknown"
            },
            outcome: {
              type: "unknown"
            },
            scope: {
              type: "string",
              const: "local-preview"
            },
            previewUrl: {
              type: "string",
              format: "uri"
            },
            views: {
              type: "unknown"
            }
          },
          nullable: ["outcome"]
        }
      },
      errors: [
        {
          name: "InvalidRequest"
        },
        {
          name: "Unavailable"
        },
        {
          name: "VerificationFailed"
        }
      ]
    }
  }
};

// dist/src/transport/api.js
var serviceSchemas = new Lexicons([
  ...structuredClone([...frameworkLexicons]),
  list_default,
  sync_default,
  validateDraft_default,
  preview_default,
  readDraft_default,
  compareDefinition_default,
  stageDefinition_default
]);
var BODY_LIMIT = HOST_LIMITS.bodyBytes;
var ResponseBytesLimit = class extends Error {
};
async function responseBytes(response, limit = BODY_LIMIT) {
  const reader = response.body?.getReader(), chunks = [];
  let size = 0;
  if (reader)
    try {
      for (; ; ) {
        const { value, done } = await reader.read();
        if (done)
          break;
        size += value.length;
        if (size > limit)
          throw new ResponseBytesLimit("Response exceeds transport limit");
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {
      });
      reader.releaseLock();
    }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// dist/src/transport/pds-operations.js
var providerCodes = /* @__PURE__ */ new Set([
  "InvalidSwap",
  "RecordNotFound",
  "RepoNotFound",
  "InvalidRequest",
  "ExpiredToken",
  "InvalidToken",
  "AuthenticationRequired",
  "AuthRequired",
  "InvalidIdentifier",
  "BlobTooLarge",
  "InvalidMimeType",
  "Forbidden"
]);
var PdsError = class extends Error {
  status;
  code;
  constructor(status, code) {
    super(`PDS ${status}: ${code}`);
    this.status = status;
    this.code = code;
    this.name = "PdsError";
  }
};
async function boundedPdsBody(response, limit, policy) {
  try {
    return await responseBytes(response, limit);
  } catch (error) {
    if (policy) {
      if (error instanceof ResponseBytesLimit)
        throw new AtseqError("input", "PDS response exceeds byte limit");
      throw new AtseqError("content_unavailable", "PDS response is unavailable");
    }
    throw new PdsError(502, "ResponseUnavailable");
  }
}
async function pdsJsonResponse(res, policy) {
  const raw = await boundedPdsBody(res, res.ok ? policy ? 1024 * 1024 : 8 * 1024 * 1024 : 64 * 1024, policy);
  let value;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
  } catch {
    throw new PdsError(res.ok ? 502 : res.status, "InvalidResponse");
  }
  if (!res.ok)
    throw new PdsError(res.status, typeof value?.error === "string" && (!policy || providerCodes.has(value.error)) ? value.error : "RequestFailed");
  return value;
}
var PdsOperations = class {
  send;
  policy;
  constructor(send, policy) {
    this.send = send;
    this.policy = policy;
  }
  async request(method, input2, write = false) {
    const res = await this.send(method, {
      method: write ? "POST" : "GET",
      ...write ? { headers: { "content-type": "application/json" }, body: JSON.stringify(input2) } : {}
    }, write ? void 0 : input2);
    return pdsJsonResponse(res, this.policy);
  }
  async latestCommit(did3) {
    const value = await this.request("com.atproto.sync.getLatestCommit", { did: did3 });
    if (typeof value?.cid !== "string" || !value.cid || typeof value?.rev !== "string" || !value.rev)
      throw new PdsError(502, "InvalidCommit");
    try {
      link(value.cid);
    } catch {
      throw new PdsError(502, "InvalidCommit");
    }
    return { cid: value.cid, rev: value.rev };
  }
  get(did3, collection2, rkey) {
    return this.request("com.atproto.repo.getRecord", { repo: did3, collection: collection2, rkey });
  }
  async listPage(did3, collection2, cursor2, limit = 100) {
    const page = await this.request("com.atproto.repo.listRecords", {
      repo: did3,
      collection: collection2,
      limit,
      reverse: this.policy ? true : false,
      cursor: cursor2
    });
    if (!Array.isArray(page.records) || page.records.length > limit || page.cursor !== void 0 && typeof page.cursor !== "string")
      throw new PdsError(502, "InvalidPage");
    return page;
  }
  apply(did3, writes, swapCommit) {
    return this.request("com.atproto.repo.applyWrites", { repo: did3, validate: false, writes, ...swapCommit ? { swapCommit } : {} }, true);
  }
  async applyConditional(did3, writes, swapCommit) {
    if (typeof swapCommit !== "string" || !swapCommit)
      throw new PdsError(502, "InvalidCommit");
    try {
      link(swapCommit);
    } catch {
      throw new PdsError(502, "InvalidCommit");
    }
    return this.apply(did3, writes, swapCommit);
  }
  async upload(content, mimeType = "application/octet-stream") {
    const res = await this.send("com.atproto.repo.uploadBlob", {
      method: "POST",
      headers: { "content-type": mimeType },
      body: new Uint8Array(content)
    });
    return (await pdsJsonResponse(res, this.policy)).blob;
  }
};

// dist/src/transport/native-account-writer.js
var mint = Object.freeze({});
var utf8 = new TextEncoder();
function input(message) {
  throw new AtseqError("input", message);
}
function mime(value) {
  return typeof value === "string" && value.length <= 256 && /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(value);
}
function collection(value) {
  if (typeof value !== "string" || !isValidNsid(value))
    input("Invalid account collection");
}
function key2(value) {
  if (typeof value !== "string" || !isValidRecordKey(value))
    input("Invalid account record key");
}
function cursor(value, remote = false) {
  if (value !== void 0 && (typeof value !== "string" || !value || utf8.encode(value).length > 8192)) {
    if (remote)
      throw new PdsError(502, "InvalidPage");
    input("Invalid account page cursor");
  }
}
function cid3(value) {
  if (typeof value !== "string" || !value || value.length > 128)
    throw new PdsError(502, "InvalidResponse");
  try {
    link(value);
  } catch {
    throw new PdsError(502, "InvalidResponse");
  }
}
function commit(value) {
  cid3(value?.cid);
  if (typeof value?.rev !== "string" || !value.rev || utf8.encode(value.rev).length > 8192)
    throw new PdsError(502, "InvalidCommit");
}
function blobCid(value) {
  try {
    if (typeof value !== "string" || value.length > 128)
      throw new Error();
    const parsed = fromString(value);
    if (parsed.codec !== CODEC_RAW || toString(parsed) !== value)
      throw new Error();
  } catch {
    throw new PdsError(502, "InvalidResponse");
  }
}
var NativeAccountWriter = class _NativeAccountWriter {
  #did;
  #owned;
  constructor(token, did3, owned) {
    if (token !== mint)
      input("Native account writer requires an owned OAuth session");
    this.#did = did3;
    this.#owned = owned;
    Object.freeze(this);
  }
  static async open(handle3, expectedDid) {
    try {
      validateNativeAccountDid(expectedDid);
    } catch {
      input("Invalid native account DID");
    }
    const owned = ownedOAuthSession(handle3);
    if (owned.did !== expectedDid)
      input("OAuth account differs from expected native account");
    if ((await owned.info()).did !== expectedDid)
      input("OAuth account differs from expected native account");
    return new _NativeAccountWriter(mint, expectedDid, owned);
  }
  get did() {
    return this.#did;
  }
  #operations(signal) {
    return new PdsOperations((method, init, params2) => {
      if (method === "com.atproto.repo.applyWrites") {
        if (typeof init.body !== "string")
          input("Invalid conditional account body");
        return this.#owned.apply(utf8.encode(init.body), signal);
      }
      if (method === "com.atproto.repo.uploadBlob") {
        if (!(init.body instanceof Uint8Array))
          input("Invalid account blob body");
        return this.#owned.upload(init.body, new Headers(init.headers).get("content-type"), signal);
      }
      const url = new URL(`/xrpc/${method}`, "https://xrpc.invalid");
      for (const [name, value] of Object.entries(params2 ?? {}))
        if (value !== void 0)
          url.searchParams.set(name, String(value));
      return this.#owned.request(url.pathname + url.search, { ...init, signal });
    }, { native: true });
  }
  async #reply(work) {
    try {
      return await work();
    } catch (error) {
      if (error instanceof AtseqError || error instanceof PdsError)
        throw error;
      throw new PdsError(502, "InvalidResponse");
    }
  }
  #record(value, expectedCollection, expectedKey) {
    if (!value || typeof value !== "object" || typeof value.uri !== "string" || utf8.encode(value.uri).length > 8192 || !isValidAtUri(value.uri) || !Object.hasOwn(value, "value"))
      throw new PdsError(502, "InvalidResponse");
    const uri2 = new AtUri(value.uri);
    if (uri2.hostname !== this.#did || uri2.collection !== expectedCollection || !isValidRecordKey(uri2.rkey) || expectedKey !== void 0 && uri2.rkey !== expectedKey || value.uri !== `at://${this.#did}/${expectedCollection}/${uri2.rkey}`)
      throw new PdsError(502, "InvalidResponse");
    cid3(value.cid);
    return { uri: value.uri, cid: value.cid, value: value.value };
  }
  get(collectionName, rkey, options = {}) {
    return this.#reply(async () => {
      collection(collectionName);
      key2(rkey);
      return this.#record(await this.#operations(options.signal).get(this.#did, collectionName, rkey), collectionName, rkey);
    });
  }
  list(collectionName, options = {}) {
    return this.#reply(async () => {
      collection(collectionName);
      const limit = options.limit ?? 100;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100)
        input("Invalid account page limit");
      cursor(options.cursor);
      const page = await this.#operations(options.signal).listPage(this.#did, collectionName, options.cursor, limit);
      cursor(page.cursor, true);
      return {
        records: page.records.map((record2) => this.#record(record2, collectionName)),
        ...page.cursor === void 0 ? {} : { cursor: page.cursor }
      };
    });
  }
  latestCommit(options = {}) {
    return this.#reply(async () => {
      const value = await this.#operations(options.signal).latestCommit(this.#did);
      commit(value);
      return value;
    });
  }
  applyConditional(writes, swapCommit, options = {}) {
    return this.#reply(async () => {
      if (!Array.isArray(writes))
        input("Invalid conditional account writes");
      const pending = this.#operations(options.signal).applyConditional(this.#did, writes, swapCommit);
      const count = writes.length;
      const value = await pending;
      commit(value?.commit);
      if (!Array.isArray(value?.results) || value.results.length !== count)
        throw new PdsError(502, "InvalidResponse");
      return value;
    });
  }
  upload(content, mimeType = "application/octet-stream", options = {}) {
    return this.#reply(async () => {
      if (!(content instanceof Uint8Array) || !mime(mimeType))
        input("Invalid account blob input");
      const size = content.length;
      const blob2 = await this.#operations(options.signal).upload(content, mimeType);
      blobCid(blob2?.ref?.$link);
      if (blob2?.$type !== "blob" || blob2.size !== size || !mime(blob2.mimeType))
        throw new PdsError(502, "InvalidResponse");
      return blob2;
    });
  }
};

// .atseq-local/writer-compiled-final-16f-node26/tests/support/oauth-fixture.js
var OAUTH_DID = "did:plc:aaaaaaaaaaaaaaaaaaaaaaaa";
var OAUTH_CUSTODY = "https://custody.atseq-probe.net";
var OAUTH_SCOPE = "atproto repo:ai.generalbusiness.atseq.grant?action=create";
var oauthMetadata = {
  client_id: OAUTH_CUSTODY + "/oauth.json",
  application_type: "web",
  redirect_uris: [OAUTH_CUSTODY + "/callback"],
  response_types: ["code"],
  grant_types: ["authorization_code", "refresh_token"],
  token_endpoint_auth_method: "none",
  dpop_bound_access_tokens: true,
  scope: OAUTH_SCOPE
};

// .atseq-local/writer-compiled-final-16f-node26/tests/support/native-account-writer-fixture.js
var WRITER_COLLECTION = "ai.generalbusiness.atseq.synthetic";

// .atseq-local/writer-compiled-final-16f-node26/tests/support/native-account-writer-byte-observation.js
function observeStreamByteCounts() {
  const prototype = ReadableStreamDefaultReader.prototype;
  const original = prototype.read;
  const indexes = /* @__PURE__ */ new WeakMap();
  const sizes = [];
  const observed = async function() {
    const result = await original.call(this);
    if (result.value instanceof Uint8Array) {
      let index = indexes.get(this);
      if (index === void 0) {
        index = sizes.length;
        indexes.set(this, index);
        sizes.push(0);
      }
      sizes[index] = sizes[index] + result.value.length;
    }
    return result;
  };
  prototype.read = observed;
  return () => {
    if (prototype.read !== observed)
      throw new Error("Test byte observer was replaced");
    prototype.read = original;
    return [...sizes];
  };
}

// .atseq-local/writer-compiled-final-16f-node26/tests/support/native-account-writer-browser-probe.js
var adapter;
var handle2;
var writer;
async function create5() {
  adapter = await loadBrowserOAuthAdapter({
    metadata: oauthMetadata,
    resolveIdentity: async (identifier, { fetch, signal }) => {
      const response = await fetch("https://identity.atseq-probe.net/" + encodeURIComponent(identifier), { signal });
      const { did: did3 } = await response.json();
      return {
        did: did3,
        handle: "handle.invalid",
        didDoc: {
          id: did3,
          service: [
            { id: "#atproto_pds", type: "AtprotoPersonalDataServer", serviceEndpoint: "https://pds.atseq-probe.net" }
          ]
        }
      };
    },
    custodyOrigin: OAUTH_CUSTODY,
    publisherOrigin: "https://publisher.atseq-probe.net",
    applicationOrigin: "https://application.atseq-probe.net"
  });
}
var begin = () => adapter.begin(OAUTH_DID, OAUTH_SCOPE);
async function complete(params2) {
  handle2 = await adapter.complete(new URLSearchParams(params2));
  writer = await NativeAccountWriter.open(handle2, OAUTH_DID);
  return { did: writer.did, frozen: Object.isFrozen(writer), serialized: JSON.stringify(writer) };
}
async function restore() {
  handle2 = await adapter.restore(OAUTH_DID, OAUTH_SCOPE);
  writer = await NativeAccountWriter.open(handle2, OAUTH_DID);
  return writer.did;
}
var get = () => writer.get(WRITER_COLLECTION, "first");
var list = (cursor2) => writer.list(WRITER_COLLECTION, { cursor: cursor2 });
var latest = () => writer.latestCommit();
var upload = (size, cancel = false) => {
  const bytes2 = new Uint8Array(size).fill(17);
  const pending = writer.upload(bytes2, "application/octet-stream", {
    signal: cancel ? AbortSignal.abort() : void 0
  });
  bytes2.fill(23);
  return pending;
};
var apply = (swapCommit) => {
  const writes = [
    {
      $type: "com.atproto.repo.applyWrites#create",
      collection: WRITER_COLLECTION,
      rkey: "browser",
      value: { text: "before" }
    }
  ];
  const pending = writer.applyConditional(writes, swapCommit);
  writes[0].value.text = "after";
  return pending;
};
var ordinary = (size) => handle2.request("/xrpc/ai.generalbusiness.atseq.synthetic", { method: "POST", body: new Uint8Array(size) }).then((response) => response.status);
var mutate = () => {
  handle2.info = handle2.request = (() => {
    throw new Error("Caller method must not execute");
  });
  return writer.latestCommit();
};
async function forgeries() {
  let refused = 0;
  for (const fake of [
    {},
    Object.create(OAuthSessionHandle.prototype),
    structuredClone(handle2),
    new OAuthSessionHandle({}, {}, {})
  ]) {
    try {
      await NativeAccountWriter.open(fake, OAUTH_DID);
    } catch {
      refused++;
    }
  }
  return refused;
}
async function failure3(method, commit2) {
  try {
    if (method === "upload")
      await writer.upload(new Uint8Array(524288));
    else if (method === "get")
      await writer.get(WRITER_COLLECTION, "first");
    else if (method === "list")
      await writer.list(WRITER_COLLECTION);
    else if (method === "latest")
      await writer.latestCommit();
    else if (method === "apply")
      await writer.applyConditional([], commit2);
    else
      throw new Error("Unknown test operation");
    throw new Error("Expected bounded test refusal");
  } catch (error) {
    return { code: error.code, kind: error.kind ?? null, status: error.status ?? null, message: error.message };
  }
}
async function custodyStatus() {
  const database = await new Promise((resolve, reject) => {
    const opening = indexedDB.open(OAUTH_CUSTODY_DATABASE, 1);
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(opening.error);
  });
  try {
    const row = await new Promise((resolve, reject) => {
      const reading = database.transaction("accounts", "readonly").objectStore("accounts").get(OAUTH_DID);
      reading.onsuccess = () => resolve(reading.result);
      reading.onerror = () => reject(reading.error);
    });
    const metadata = JSON.stringify(row, (name, value) => name === "keyPair" && value?.privateKey instanceof CryptoKey && value?.publicKey instanceof CryptoKey ? void 0 : value);
    return { phase: row?.phase ?? null, metadataBytes: metadata ? new TextEncoder().encode(metadata).length : 0 };
  } finally {
    database.close();
  }
}
var stopObservation;
function startByteObservation() {
  stopObservation = observeStreamByteCounts();
}
function stopByteObservation() {
  if (!stopObservation)
    throw new Error("No active byte observation");
  const stop = stopObservation;
  stopObservation = void 0;
  return stop();
}
export {
  apply,
  begin,
  complete,
  create5 as create,
  custodyStatus,
  failure3 as failure,
  forgeries,
  get,
  latest,
  list,
  mutate,
  ordinary,
  restore,
  startByteObservation,
  stopByteObservation,
  upload
};
/*! Bundled license information:

@atproto/lex-data/dist/uint8array.js:
@atproto/lex-data/dist/utf8.js:
  (* v8 ignore next -- @preserve *)
*/
