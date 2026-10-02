//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = Object.freeze({
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
}), u = Object.freeze({
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
}), d = Object.freeze({
	...l,
	...u
}), f = class extends Error {
	code;
	kind;
	constructor(e, t) {
		super(t), this.code = e, this.name = "AtseqError", this.kind = d[e];
	}
}, p = class extends f {
	constructor(e, t) {
		super(e, t), this.name = "InterpretationError";
	}
}, m = class extends f {
	constructor(e, t) {
		super(e, t), this.name = "ProtocolError";
	}
};
Object.freeze(Object.keys(l));
//#endregion
//#region src/core/profile.ts
var h = Object.freeze({
	id: "atseq-jsonata-v1",
	stateBytes: 131072,
	inputBytes: 262144,
	outputBytes: 262144,
	actionBytes: 32768,
	programBytes: 65536,
	definitionBytes: 524288,
	definitionFiles: 64,
	inputDepth: 32,
	astNodes: 4096,
	astDepth: 64,
	evaluationDepth: 64,
	evaluationSteps: 1e5,
	sequenceLength: 16384,
	intermediateBytes: 1048576,
	inspectionBytes: 16777216,
	foldMessageLength: 1024,
	viewNodes: 2048,
	viewDepth: 24
}), g = new TextEncoder(), _ = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function v(e) {
	return !_.has(e) && !e.startsWith("_jsonata_");
}
function y(e, t = h.inputBytes, n = h.inputDepth, r, i = !1, a = !1) {
	let o = 0, s = /* @__PURE__ */ new Set();
	function c(e, n = !1) {
		let i = n ? e.length : g.encode(e).length;
		if (r?.(i), o += i, o > t) throw new p("value_bytes", `Value exceeds ${t} UTF-8 bytes`);
		return e;
	}
	function l(e, t, r) {
		if (e === null || typeof e == "boolean") return c(String(e), !0);
		if (typeof e == "number") {
			if (!Number.isSafeInteger(e) || !a && Object.is(e, -0)) throw new p("wire_number", `${r}: expected safe integer, excluding negative zero`);
			return c(String(e), !0);
		}
		if (typeof e == "string") {
			if (!e.isWellFormed()) throw new p("unicode", `${r}: unpaired surrogate`);
			return c(JSON.stringify(e));
		}
		if (!e || typeof e != "object") throw new p("wire_value", `${r}: unsupported value`);
		if (t >= n) throw new p("value_depth", `${r}: container depth exceeds ${n}`);
		if (s.has(e)) throw new p("wire_value", `${r}: cycle`);
		if (s.add(e), Object.getOwnPropertySymbols(e).length) throw new p("wire_value", `${r}: symbol property`);
		let o;
		if (Array.isArray(e)) {
			if (Object.getPrototypeOf(e) !== Array.prototype) throw new p("wire_value", `${r}: expected plain array`);
			for (let t of Object.keys(e)) if (!(/^(0|[1-9][0-9]*)$/.test(t) && Number(t) < e.length) && !(i && [
				"sequence",
				"outerWrapper",
				"keepSingleton",
				"cons",
				"tupleStream",
				"push"
			].includes(t))) throw new p("wire_value", `${r}: extra array property ${t}`);
			c("[", !0);
			let n = [];
			for (let i = 0; i < e.length; i++) {
				if (i && c(",", !0), !Object.hasOwn(e, i)) throw new p("wire_value", `${r}: sparse array`);
				let a = Object.getOwnPropertyDescriptor(e, i);
				if (!("value" in a)) throw new p("wire_value", `${r}/${i}: accessor`);
				n.push(l(a.value, t + 1, `${r}/${i}`));
			}
			c("]", !0), o = `[${n.join(",")}]`;
		} else {
			if (Object.getPrototypeOf(e) !== Object.prototype && Object.getPrototypeOf(e) !== null) throw new p("wire_value", `${r}: expected plain object`);
			c("{", !0);
			let n = [];
			for (let i of Object.keys(e).sort()) {
				if (!v(i)) throw new p("reserved_key", `${r}/${i}: reserved in this profile`);
				if (!i.isWellFormed()) throw new p("unicode", `${r}: invalid Unicode key`);
				n.length && c(",", !0);
				let a = c(JSON.stringify(i));
				c(":", !0);
				let o = Object.getOwnPropertyDescriptor(e, i);
				if (!("value" in o)) throw new p("wire_value", `${r}/${i}: accessor`);
				n.push(`${a}:${l(o.value, t + 1, `${r}/${i}`)}`);
			}
			c("}", !0), o = `{${n.join(",")}}`;
		}
		return s.delete(e), o;
	}
	return l(e, 0, "$");
}
//#endregion
//#region src/core/limits.ts
var ee = Object.freeze({
	version: 1,
	blockBytes: 65536,
	jsonBytes: 131072,
	depth: 32
}), te = Object.freeze({
	bytes: 16777216,
	blocks: 2048
});
Object.freeze({
	historyEntries: 2e4,
	retainedDefinitions: 32,
	bodyBytes: 33554432,
	applications: 32,
	drafts: 32,
	draftBytes: te.bytes,
	requestBytes: 786432
});
//#endregion
//#region node_modules/@atcute/multibase/dist/bases/base16-web-native.js
var ne = (e) => e.toHex(), b = new TextEncoder(), re = new TextDecoder("utf-8", {
	fatal: !0,
	ignoreBOM: !0
}), ie = crypto.subtle, ae = (e) => new Uint8Array(e), oe = ae, se = (e, t) => {
	let n = e.length, r = t.length, i = n < r ? n : r;
	for (let n = 0; n < i; n++) {
		let r = e[n], i = t[n];
		if (r < i) return -1;
		if (r > i) return 1;
	}
	return n < r ? -1 : +(n > r);
}, ce = (e, t) => {
	let n = 0, r = e.length, i;
	if (t === void 0) for (i = t = 0; i < r; i++) {
		let n = e[i];
		t += n.length;
	}
	let a = new Uint8Array(t);
	for (i = 0; i < r; i++) {
		let r = e[i], o = t - n;
		if (r.length > o) {
			a.set(r.subarray(0, o), n);
			break;
		}
		a.set(r, n), n += r.length;
	}
	return a;
}, le = (e) => b.encode(e), ue = (e, t, n, r) => {
	let i;
	return i = n === void 0 ? e : r === void 0 ? e.subarray(n) : e.subarray(n, n + r), b.encodeInto(t, i).written;
}, x = String.fromCharCode, de = (e, t, n) => {
	if (n < 4) {
		if (n < 2) {
			if (n === 0) return "";
			let r = e[t];
			return r & 128 ? null : x(r);
		}
		let r = e[t], i = e[t + 1];
		if ((r | i) & 128) return null;
		if (n === 2) return x(r, i);
		let a = e[t + 2];
		return a & 128 ? null : x(r, i, a);
	}
	let r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3];
	if ((r | i | a | o) & 128) return null;
	if (n < 8) {
		if (n === 4) return x(r, i, a, o);
		let s = e[t + 4];
		if (s & 128) return null;
		if (n === 5) return x(r, i, a, o, s);
		let c = e[t + 5];
		if (c & 128) return null;
		if (n === 6) return x(r, i, a, o, s, c);
		let l = e[t + 6];
		return l & 128 ? null : x(r, i, a, o, s, c, l);
	}
	let s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7];
	if ((s | c | l | u) & 128) return null;
	if (n < 12) {
		if (n === 8) return x(r, i, a, o, s, c, l, u);
		let d = e[t + 8];
		if (d & 128) return null;
		if (n === 9) return x(r, i, a, o, s, c, l, u, d);
		let f = e[t + 9];
		if (f & 128) return null;
		if (n === 10) return x(r, i, a, o, s, c, l, u, d, f);
		let p = e[t + 10];
		return p & 128 ? null : x(r, i, a, o, s, c, l, u, d, f, p);
	}
	let d = e[t + 8], f = e[t + 9], p = e[t + 10], m = e[t + 11];
	if ((d | f | p | m) & 128) return null;
	if (n === 12) return x(r, i, a, o, s, c, l, u, d, f, p, m);
	let h = e[t + 12];
	if (h & 128) return null;
	if (n === 13) return x(r, i, a, o, s, c, l, u, d, f, p, m, h);
	let g = e[t + 13];
	if (g & 128) return null;
	if (n === 14) return x(r, i, a, o, s, c, l, u, d, f, p, m, h, g);
	let _ = e[t + 14];
	return _ & 128 ? null : x(r, i, a, o, s, c, l, u, d, f, p, m, h, g, _);
}, fe = (e, t = 0, n = e.length - t) => {
	if (n <= 15) {
		let r = de(e, t, n);
		if (r !== null) return r;
	}
	return t === 0 && n === e.length ? re.decode(e) : re.decode(e.subarray(t, t + n));
}, pe = (e) => e >= 56320 && e <= 57343, me = (e) => {
	let t = e.length, n = 0, r = 0;
	for (; n + 3 < t;) {
		let t = e.charCodeAt(n), i = e.charCodeAt(n + 1), a = e.charCodeAt(n + 2), o = e.charCodeAt(n + 3);
		if ((t | i | a | o) >= 128) break;
		n += 4, r += 4;
	}
	for (; n < t;) {
		let t = e.charCodeAt(n);
		t < 128 ? (n += 1, r += 1) : t < 2048 ? (n += 1, r += 2) : t < 55296 || t > 56319 ? (n += 1, r += 3) : pe(e.charCodeAt(n + 1)) ? (n += 2, r += 4) : (n += 1, r += 3);
	}
	return r;
}, he = async (e) => new Uint8Array(await ie.digest("SHA-256", e)), ge = (e, t, n) => (r) => {
	let i = (1 << t) - 1, a = "", o = 0, s = 0;
	for (let n = 0; n < r.length; ++n) for (s = s << 8 | r[n], o += 8; o > t;) o -= t, a += e[i & s >> o];
	if (o !== 0 && (a += e[i & s << t - o]), n) for (; a.length * t & 7;) a += "=";
	return a;
}, _e = (e, t, n) => {
	let r = (/* @__PURE__ */ new Uint8Array(256)).fill(255);
	for (let t = 0; t < e.length; ++t) r[e.charCodeAt(t)] = t;
	let i = t, a = 8;
	for (; a !== 0;) {
		let e = i % a;
		i = a, a = e;
	}
	let o = 8 / i;
	return (e) => {
		let i = e.length;
		if (n && i !== 0) {
			if (i % o !== 0) throw SyntaxError("unexpected end of data");
			let t = 0;
			for (; e.charCodeAt(i - 1) === 61;) if (--i, ++t >= o) throw SyntaxError("invalid base string");
		}
		let a = oe(i * t / 8 | 0), s = 0, c = 0, l = 0;
		for (let n = 0; n < i; ++n) {
			let i = e.charCodeAt(n), o = i < 256 ? r[i] : 255;
			if (o === 255) throw SyntaxError("invalid base string");
			c = c << t | o, s += t, s >= 8 && (s -= 8, a[l++] = 255 & c >> s);
		}
		if (s >= t || 255 & c << 8 - s) throw SyntaxError("unexpected end of data");
		return a;
	};
}, ve = (e) => {
	if (e.length >= 255) throw RangeError("alphabet too long");
	let t = e.length, n = e.charAt(0), r = Math.log(256) / Math.log(t);
	return (i) => {
		if (i.length === 0) return "";
		let a = 0, o = 0, s = 0, c = i.length;
		for (; s !== c && i[s] === 0;) s++, a++;
		let l = c - s, u = l * r + 1 >>> 0, d = ae(u);
		{
			let e = c - l % 3;
			for (; s < e;) {
				let e = i[s] << 16 | i[s + 1] << 8 | i[s + 2], n = 0;
				for (let r = u - 1; (e !== 0 || n < o) && r !== -1; r--, n++) {
					e += 16777216 * d[r];
					let n = e / t | 0;
					d[r] = e - n * t, e = n;
				}
				o = n, s += 3;
			}
		}
		for (; s !== c;) {
			let e = i[s], n = 0;
			for (let r = u - 1; (e !== 0 || n < o) && r !== -1; r--, n++) {
				e += 256 * d[r];
				let n = e / t | 0;
				d[r] = e - n * t, e = n;
			}
			o = n, s++;
		}
		let f = u - o;
		for (; f !== u && d[f] === 0;) f++;
		let p = n.repeat(a);
		for (; f < u; ++f) p += e.charAt(d[f]);
		return p;
	};
}, ye = (e) => {
	if (e.length >= 255) throw RangeError("alphabet too long");
	let t = (/* @__PURE__ */ new Uint8Array(128)).fill(255);
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		if (r >= 128) throw RangeError("non-ASCII character in alphabet");
		if (t[r] !== 255) throw RangeError(`${e[n]} is ambiguous`);
		t[r] = n;
	}
	let n = e.length, r = n * n, i = e.charAt(0), a = Math.log(n) / Math.log(256);
	return (e) => {
		if (e.length === 0) return oe(0);
		let o = 0, s = 0, c = 0;
		for (; e[o] === i;) s++, o++;
		let l = e.length - o, u = l * a + 1 >>> 0, d = ae(u);
		{
			let i = l & 1, a = e.length - i;
			for (; o < a;) {
				let i = e.charCodeAt(o), a = e.charCodeAt(o + 1);
				if ((i | a) & -128) throw Error("invalid string");
				let s = t[i], l = t[a];
				if (s === 255 || l === 255) throw Error("invalid string");
				let f = s * n + l, p = 0;
				for (let e = u - 1; (f !== 0 || p < c) && e !== -1; e--, p++) f += r * d[e], d[e] = f, f >>>= 8;
				if (f !== 0) throw Error("non-zero carry");
				c = p, o += 2;
			}
		}
		if (o < e.length) {
			let r = e.charCodeAt(o);
			if (r & -128) throw Error("invalid string");
			let i = t[r];
			if (i === 255) throw Error("invalid string");
			let a = 0;
			for (let e = u - 1; (i !== 0 || a < c) && e !== -1; e--, a++) i += n * d[e], d[e] = i, i >>>= 8;
			if (i !== 0) throw Error("non-zero carry");
			c = a;
		}
		let f = u - c;
		for (; f !== u && d[f] === 0;) f++;
		if (f === s) return d;
		let p = oe(s + (u - f));
		return p.fill(0, 0, s), p.set(d.subarray(f), s), p;
	};
}, be = /*#__PURE__*/ ge("0123456789abcdef", 4, !1), xe = "fromHex" in Uint8Array ? ne : be, Se = /*#__PURE__*/ (() => {
	let e = (/* @__PURE__ */ new Uint8Array(128)).fill(255);
	for (let t = 0; t < 62; t++) e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charCodeAt(t)] = t;
	return e[43] = e[45] = 62, e[47] = e[95] = 63, e;
})(), Ce = [
	0,
	2,
	3
], we = (e, t) => {
	let n = t % 3;
	if (e.length !== (t / 3 | 0) * 4 + Ce[n] || n !== 0 && Se[e.charCodeAt(e.length - 1)] & (n === 1 ? 15 : 3)) throw SyntaxError("invalid base64 string");
}, Te = (e, t) => {
	if (e.length !== ((t + 2) / 3 | 0) * 4) throw SyntaxError("invalid base64 string");
}, Ee = (e) => {
	let t = Uint8Array.fromBase64(e, {
		alphabet: "base64",
		lastChunkHandling: "loose"
	});
	return we(e, t.length), t;
}, De = (e) => e.toBase64({
	alphabet: "base64",
	omitPadding: !0
}), Oe = (e) => {
	let t = Uint8Array.fromBase64(e, {
		alphabet: "base64",
		lastChunkHandling: "strict"
	});
	return Te(e, t.length), t;
}, ke = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Ae = /*#__PURE__*/ _e(ke, 6, !1), je = /*#__PURE__*/ ge(ke, 6, !1), Me = /*#__PURE__*/ _e(ke, 6, !0), Ne = "fromBase64" in Uint8Array, Pe = Ne ? Ee : Ae, Fe = Ne ? De : je, Ie = Ne ? Oe : Me, Le = "abcdefghijklmnopqrstuvwxyz234567", Re = /*#__PURE__*/ (() => {
	let e = /* @__PURE__ */ new Uint8Array(32);
	for (let t = 0; t < 32; t++) e[t] = Le.charCodeAt(t);
	return e;
})(), ze = String.fromCharCode, Be = (e) => {
	let t = e.length, n = t / 5 | 0, r = t - n * 5, i = Re, a = "", o = 0, s = n / 2 | 0;
	for (let t = 0; t < s; t++) {
		let t = e[o], n = e[o + 1], r = e[o + 2], s = e[o + 3], c = e[o + 4], l = e[o + 5], u = e[o + 6], d = e[o + 7], f = e[o + 8], p = e[o + 9];
		a += ze(i[t >>> 3], i[(t << 2 | n >>> 6) & 31], i[n >>> 1 & 31], i[(n << 4 | r >>> 4) & 31], i[(r << 1 | s >>> 7) & 31], i[s >>> 2 & 31], i[(s << 3 | c >>> 5) & 31], i[c & 31], i[l >>> 3], i[(l << 2 | u >>> 6) & 31], i[u >>> 1 & 31], i[(u << 4 | d >>> 4) & 31], i[(d << 1 | f >>> 7) & 31], i[f >>> 2 & 31], i[(f << 3 | p >>> 5) & 31], i[p & 31]), o += 10;
	}
	if (n & 1) {
		let t = e[o], n = e[o + 1], r = e[o + 2], s = e[o + 3], c = e[o + 4];
		a += ze(i[t >>> 3], i[(t << 2 | n >>> 6) & 31], i[n >>> 1 & 31], i[(n << 4 | r >>> 4) & 31], i[(r << 1 | s >>> 7) & 31], i[s >>> 2 & 31], i[(s << 3 | c >>> 5) & 31], i[c & 31]), o += 5;
	}
	if (r > 0) {
		let n = 0, r = 0;
		for (let i = o; i < t; i++) n = n << 8 | e[i], r += 8;
		for (; r >= 5;) r -= 5, a += ze(i[n >>> r & 31]);
		r > 0 && (a += ze(i[n << 5 - r & 31]));
	}
	return a;
}, Ve = "abcdefghijklmnopqrstuvwxyz234567", He = /*#__PURE__*/ (() => {
	let e = (/* @__PURE__ */ new Uint8Array(128)).fill(255);
	for (let t = 0; t < 32; t++) e[Ve.charCodeAt(t)] = t;
	return e;
})(), Ue = (e) => {
	let t = e.length, n = oe(t * 5 / 8 | 0), r = 0, i = 0, a = t - t % 8;
	for (; i < a; i += 8) {
		let t = e.charCodeAt(i), a = e.charCodeAt(i + 1), o = e.charCodeAt(i + 2), s = e.charCodeAt(i + 3), c = e.charCodeAt(i + 4), l = e.charCodeAt(i + 5), u = e.charCodeAt(i + 6), d = e.charCodeAt(i + 7);
		if ((t | a | o | s | c | l | u | d) & -128) throw SyntaxError("invalid base string");
		let f = He[t], p = He[a], m = He[o], h = He[s], g = He[c], _ = He[l], v = He[u], y = He[d];
		if ((f | p | m | h | g | _ | v | y) & 224) throw SyntaxError("invalid base string");
		n[r] = f << 3 | p >>> 2, n[r + 1] = (p << 6 | m << 1 | h >>> 4) & 255, n[r + 2] = (h << 4 | g >>> 1) & 255, n[r + 3] = (g << 7 | _ << 2 | v >>> 3) & 255, n[r + 4] = (v << 5 | y) & 255, r += 5;
	}
	if (i < t) {
		let a = 0, o = 0;
		for (; i < t; ++i) {
			let t = e.charCodeAt(i), s = t < 128 ? He[t] : 255;
			if (s & 224) throw SyntaxError("invalid base string");
			o = o << 5 | s, a += 5, a >= 8 && (a -= 8, n[r++] = 255 & o >> a);
		}
		if (a >= 5 || 255 & o << 8 - a) throw SyntaxError("unexpected end of data");
	}
	return n;
}, We = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", Ge = /*#__PURE__*/ ye(We), Ke = /*#__PURE__*/ ve(We), qe = (e, t) => {
	if (t.length !== 32) throw RangeError("invalid digest length");
	let n = oe(36);
	return n[0] = 1, n[1] = e, n[2] = 18, n[3] = 32, n.set(t, 4), {
		version: 1,
		codec: e,
		digest: {
			codec: 18,
			contents: n.subarray(4, 36)
		},
		bytes: n
	};
}, Je = async (e, t) => qe(e, await he(t)), Ye = (e) => {
	if (e.length < 36) throw RangeError("cid too short");
	let t = e[0], n = e[1], r = e[2], i = e[3];
	if (t !== 1) throw RangeError(`incorrect cid version (got v${t})`);
	if (n !== 113 && n !== 85) throw RangeError(`incorrect cid codec (got 0x${n.toString(16)})`);
	if (r !== 18) throw RangeError(`incorrect cid digest codec (got 0x${r.toString(16)})`);
	if (i !== 32) throw RangeError(`incorrect cid digest size (got ${i})`);
	return [{
		version: 1,
		codec: n,
		digest: {
			codec: r,
			contents: e.subarray(4, 36)
		},
		bytes: e.subarray(0, 36)
	}, e.subarray(36)];
}, Xe = (e) => {
	let [t, n] = Ye(e);
	if (n.length !== 0) throw RangeError("cid bytes includes remainder");
	return t;
}, Ze = (e) => {
	if (e.length !== 59 || e[0] !== "b") throw SyntaxError("not a valid cid string");
	return Xe(Ue(e.slice(1)));
}, Qe = (e) => `b${Be(e.bytes)}`, $e = (e) => {
	if (e.length !== 37 || e[0] !== 0) throw SyntaxError("invalid binary cid");
	return Xe(e.subarray(1));
}, et = Symbol.for("@atcute/cid-link-wrapper"), S = class {
	[et] = !0;
	bytes;
	constructor(e) {
		this.bytes = e;
	}
	get $link() {
		let e = `b${Be(this.bytes)}`;
		return Object.defineProperty(this, "$link", {
			value: e,
			enumerable: !0
		}), e;
	}
	toJSON() {
		return { $link: this.$link };
	}
}, tt = (e) => e instanceof S ? e.bytes : Ze(e.$link).bytes, nt = Symbol.for("@atcute/bytes-wrapper"), rt = class {
	[nt] = !0;
	buf;
	constructor(e) {
		this.buf = e;
	}
	get $bytes() {
		return Fe(this.buf);
	}
	toJSON() {
		return { $bytes: this.$bytes };
	}
}, it = (e) => new rt(e), at = (e) => {
	if (e instanceof rt) return e.buf;
	let t = e.$bytes;
	return t.charCodeAt(t.length - 1) === 61 ? Ie(t) : Pe(t);
}, ot = 8, st = (e, t) => {
	if (t > e.b.length - e.p) throw RangeError("unexpected end of input");
}, ct = (e, t) => {
	if (t < 24) return t;
	let n;
	switch (t) {
		case 24:
			if (st(e, 1), n = ut(e), n < 24) throw TypeError("non-canonical argument encoding");
			break;
		case 25:
			if (st(e, 2), n = dt(e), n < 256) throw TypeError("non-canonical argument encoding");
			break;
		case 26:
			if (st(e, 4), n = ft(e), n < 65536) throw TypeError("non-canonical argument encoding");
			break;
		case 27:
			if (st(e, 8), n = pt(e), n < 4294967296) throw TypeError("non-canonical argument encoding");
			break;
		default: throw Error(`invalid argument encoding; got ${t}`);
	}
	return n;
}, lt = (e) => {
	st(e, 8);
	let t = (e.v ??= new DataView(e.b.buffer, e.b.byteOffset, e.b.byteLength)).getFloat64(e.p);
	if (!Number.isFinite(t)) throw RangeError("NaN and Infinity values not supported");
	return e.p += 8, t;
}, ut = (e) => e.b[e.p++], dt = (e) => {
	let t = e.p, n = e.b, r = n[t++] << 8 | n[t++];
	return e.p = t, r;
}, ft = (e) => {
	let t = e.p, n = e.b, r = (n[t++] << 24 | n[t++] << 16 | n[t++] << 8 | n[t++]) >>> 0;
	return e.p = t, r;
}, pt = (e) => {
	let t = ft(e), n = ft(e);
	if (t > 2097151) throw RangeError("can't decode integers beyond safe integer range");
	return t * 2 ** 32 + n;
}, mt = (e, t) => {
	st(e, t);
	let n = fe(e.b, e.p, t);
	return e.p += t, n;
}, ht = (e, t) => {
	st(e, t);
	let n = e.b.subarray(e.p, e.p += t);
	return it(t * ot <= n.buffer.byteLength ? new Uint8Array(n) : n);
}, gt = (e, t) => {
	st(e, t);
	let n = e.b, r = e.p;
	if (t !== 37 || n[r] !== 0 || n[r + 1] !== 1 || n[r + 2] !== 113 && n[r + 2] !== 85 || n[r + 3] !== 18 || n[r + 4] !== 32) return new S($e(new Uint8Array(n.subarray(r, e.p += t))).bytes);
	let i = /* @__PURE__ */ new Uint8Array(36);
	for (let e = 0; e < 36; e++) i[e] = n[r + 1 + e];
	return e.p = r + t, new S(i);
}, _t = (e) => {
	st(e, 1);
	let t = ut(e), n = t >> 5;
	if (n !== 3) throw TypeError(`expected map to only have string keys; got type ${n}`);
	let r = t & 31, i = r < 24 ? r : ct(e, r);
	return e.ks = e.p, e.kl = i, mt(e, i);
}, vt = (e) => {
	let t = e.length, n = {
		b: e,
		v: null,
		p: 0,
		ks: 0,
		kl: 0
	}, r = null, i;
	jump: for (; n.p < t;) {
		let t = ut(n), a = t >> 5, o = t & 31, s = a === 7 ? 0 : o < 24 ? o : ct(n, o);
		switch (a) {
			case 0:
				i = s;
				break;
			case 1:
				if (i = -1 - s, i < -(2 ** 53 - 1)) throw RangeError("can't decode integers beyond safe integer range");
				break;
			case 2:
				i = ht(n, s);
				break;
			case 3:
				i = mt(n, s);
				break;
			case 4:
				if (s > 0) {
					st(n, s), r = {
						t: 1,
						c: i = Array(s),
						k: null,
						r: s,
						n: r
					};
					continue jump;
				}
				i = [];
				break;
			case 5:
				if (i = {}, s > 0) {
					let e = _t(n);
					r = {
						t: 0,
						c: i,
						k: e,
						ks: n.ks,
						kl: n.kl,
						r: s,
						n: r
					};
					continue jump;
				}
				break;
			case 6:
				switch (s) {
					case 42: {
						st(n, 1);
						let e = ut(n), t = e >> 5, r = e & 31;
						if (t !== 2) throw TypeError(`expected cid-link to be type 2 (bytes); got type ${t}`);
						i = gt(n, ct(n, r));
						break;
					}
					default: throw TypeError(`unsupported tag; got ${s}`);
				}
				break;
			case 7:
				switch (o) {
					case 20:
					case 21:
						i = o === 21;
						break;
					case 22:
						i = null;
						break;
					case 27:
						i = lt(n);
						break;
					default: throw Error(`invalid simple value; got ${o}`);
				}
				break;
			default: throw TypeError(`invalid type; got ${a}`);
		}
		for (; r !== null;) {
			switch (r.t) {
				case 0: {
					let e = r.c, t = r.k;
					t === "__proto__" && Object.defineProperty(e, t, {
						enumerable: !0,
						configurable: !0,
						writable: !0
					}), e[t] = i;
					break;
				}
				case 1: {
					let e = r.c, t = e.length - r.r;
					e[t] = i;
					break;
				}
			}
			if (--r.r) {
				if (!r.t) {
					let e = r.ks, t = r.kl;
					r.k = _t(n);
					let i = n.ks, a = n.kl, o = a - t;
					if (o === 0) {
						let t = n.b;
						for (let n = 0; n < a && (o = t[i + n] - t[e + n], o === 0); n++);
					}
					if (o <= 0) throw TypeError("map keys are not in canonical order or contain duplicates");
					r.ks = i, r.kl = a;
				}
				continue jump;
			}
			i = r.c, r = r.n;
		}
		return [i, e.subarray(n.p)];
	}
	throw RangeError("unexpected end of input");
}, yt = (e) => {
	let [t, n] = vt(e);
	if (n.length !== 0) throw Error("decoded value contains remainder");
	return t;
}, bt = 9, xt = 1024, St = 32, Ct = Math.max, wt = Number.isInteger, Tt = Number.isFinite, Et = 2 ** 53 - 1, Dt = -(2 ** 53 - 1), Ot = (e, t) => {
	let n = e.b, r = e.p;
	n.byteLength < r + t && (r > 0 && (e.c.push(n.subarray(0, r)), e.l += r), e.b = oe(Ct(xt, t)), e.v = null, e.p = 0);
}, kt = (e) => e < 24 ? 1 : e < 256 ? 2 : e < 65536 ? 3 : e < 4294967296 ? 5 : 9, At = (e, t) => {
	let n = e.b;
	(e.v ??= new DataView(n.buffer, n.byteOffset, n.byteLength)).setFloat64(e.p, t), e.p += 8;
}, jt = (e, t) => {
	e.b[e.p++] = t;
}, Mt = (e, t) => {
	let n = e.p, r = e.b;
	r[n++] = t >>> 8, r[n++] = t & 255, e.p = n;
}, Nt = (e, t) => {
	let n = e.p, r = e.b;
	r[n++] = t >>> 24, r[n++] = t >>> 16 & 255, r[n++] = t >>> 8 & 255, r[n++] = t & 255, e.p = n;
}, Pt = (e, t) => {
	let n = e.p, r = e.b, i = t / 2 ** 32 | 0, a = t >>> 0;
	r[n++] = i >>> 24, r[n++] = i >>> 16 & 255, r[n++] = i >>> 8 & 255, r[n++] = i & 255, r[n++] = a >>> 24, r[n++] = a >>> 16 & 255, r[n++] = a >>> 8 & 255, r[n++] = a & 255, e.p = n;
}, Ft = (e, t, n) => {
	n < 24 ? jt(e, t << 5 | n) : n < 256 ? (jt(e, t << 5 | 24), jt(e, n)) : n < 65536 ? (jt(e, t << 5 | 25), Mt(e, n)) : n < 4294967296 ? (jt(e, t << 5 | 26), Nt(e, n)) : (jt(e, t << 5 | 27), Pt(e, n));
}, It = (e, t) => {
	Ot(e, bt), t < 0 ? Ft(e, 1, -t - 1) : Ft(e, 0, t);
}, Lt = (e, t) => {
	Ot(e, 9), jt(e, 251), At(e, t);
}, Rt = (e, t) => {
	if (!Tt(t)) throw RangeError("NaN and Infinity values not supported");
	if (t > Et || t < Dt) throw RangeError("can't encode numbers beyond safe integer range");
	wt(t) ? It(e, t) : Lt(e, t);
}, zt = (e, t) => {
	let n = t.length;
	if (n === 0) {
		Ot(e, 1), jt(e, 96);
		return;
	}
	if (n >= xt) {
		let n = me(t);
		Ot(e, n + kt(n)), Ft(e, 3, n), ue(e.b, t, e.p, n), e.p += n;
		return;
	}
	Ot(e, n * 3 + bt);
	ascii: {
		let r = e.p + kt(n), i = t.charCodeAt(0);
		if (i > 127) break ascii;
		e.b[r] = i;
		let a = 1;
		for (; a + 3 < n; a += 4) {
			let n = t.charCodeAt(a), i = t.charCodeAt(a + 1), o = t.charCodeAt(a + 2), s = t.charCodeAt(a + 3);
			if ((n | i | o | s) & 65408) break ascii;
			e.b[r + a] = n, e.b[r + a + 1] = i, e.b[r + a + 2] = o, e.b[r + a + 3] = s;
		}
		for (; a < n; a++) {
			let n = t.charCodeAt(a);
			if (n > 127) break ascii;
			e.b[r + a] = n;
		}
		Ft(e, 3, n), e.p += n;
		return;
	}
	let r = kt(n * 2), i = e.p + r, a = ue(e.b, t, i), o = kt(a);
	r !== o && e.b.copyWithin(e.p + o, i, i + a), Ft(e, 3, a), e.p += a;
}, Bt = (e, t) => {
	let n = at(t), r = n.byteLength;
	Ot(e, r + kt(r)), Ft(e, 2, r), e.b.set(n, e.p), e.p += r;
}, Vt = (e, t) => {
	let n = tt(t), r = n.byteLength + 1;
	Ot(e, r + 18), Ft(e, 6, 42), Ft(e, 2, r), e.b[e.p] = 0, e.b.set(n, e.p + 1), e.p += r;
}, Ht = (e, t) => {
	switch (typeof t) {
		case "boolean": return Ot(e, 1), jt(e, 244 + +t);
		case "number": return Rt(e, t);
		case "string": return zt(e, t);
		case "object":
			if (t === null) return Ot(e, 1), jt(e, 246);
			if (Array.isArray(t)) {
				let n = t.length;
				Ot(e, bt), Ft(e, 4, n);
				for (let r = 0; r < n; r++) Ht(e, t[r]);
				return;
			}
			if (t.constructor === Object) {
				let n = Kt(t), r = n.length;
				if (r === 1) {
					let r = n[0];
					if (r === "$link") {
						if (typeof t.$link == "string") {
							Vt(e, t);
							return;
						}
						throw TypeError("unexpected cid-link value");
					}
					if (r === "$bytes") {
						if (typeof t.$bytes == "string") {
							Bt(e, t);
							return;
						}
						throw TypeError("unexpected bytes value");
					}
				}
				Ot(e, bt), Ft(e, 5, r);
				for (let i = 0; i < r; i++) {
					let r = n[i];
					zt(e, r), Ht(e, t[r]);
				}
				return;
			}
			if ("$link" in t) {
				if (t instanceof S || typeof t.$link == "string") {
					Vt(e, t);
					return;
				}
				throw TypeError("unexpected cid-link value");
			}
			if ("$bytes" in t) {
				if (t instanceof rt || typeof t.$bytes == "string") {
					Bt(e, t);
					return;
				}
				throw TypeError("unexpected bytes value");
			}
	}
	throw TypeError(`unsupported type: ${t}`);
}, Ut = () => ({
	c: [],
	b: oe(xt),
	v: null,
	p: 0,
	l: 0
}), Wt = (e) => {
	let t = Ut();
	Ht(t, e);
	let n = t.b.subarray(0, t.p);
	return t.c.length ? (t.c.push(n), ce(t.c, t.l + t.p)) : n;
}, Gt = (e) => {
	let t = e.length;
	if (t > St) {
		let n = /* @__PURE__ */ new Map();
		for (let r = 0; r < t; r++) {
			let t = e[r];
			n.set(t, { length: me(t) });
		}
		e.sort((e, t) => {
			let r = n.get(e), i = n.get(t);
			return r.length - i.length || se(r.bytes ??= le(e), i.bytes ??= le(t));
		});
		return;
	}
	let n = Array(t), r = Array(t);
	for (let r = 0; r < t; r++) n[r] = me(e[r]);
	for (let i = 1; i < t; i++) {
		let t = e[i], a = n[i], o = r[i], s = i - 1;
		for (; s >= 0; s--) {
			let i = a - n[s];
			if (i === 0 && (i = se(o ??= le(t), r[s] ??= le(e[s]))), i > 0) break;
			e[s + 1] = e[s], n[s + 1] = n[s], r[s + 1] = r[s];
		}
		e[s + 1] = t, n[s + 1] = a, r[s + 1] = o;
	}
}, Kt = (e) => {
	let t = Object.keys(e), n = 0, r = !0, i = t.length > St;
	for (let a = 0; a < t.length; a++) {
		let o = t[a];
		if (e[o] === void 0) continue;
		if (r) {
			for (let e = 0; e < o.length; e++) if (o.charCodeAt(e) > 127) {
				r = !1;
				break;
			}
		}
		if (i) {
			t[n++] = o;
			continue;
		}
		let s = o.length, c = n - 1;
		for (; c >= 0; c--) {
			let e = t[c];
			if (s > e.length || s === e.length && o > e) break;
			t[c + 1] = e;
		}
		t[c + 1] = o, n++;
	}
	return t.length = n, r && i ? t.sort((e, t) => e.length - t.length || (e < t ? -1 : 1)) : r || Gt(t), t;
}, qt = {
	name: "atseq",
	version: "0.1.0",
	type: "module",
	license: "Apache-2.0",
	engines: { node: ">=22.19" },
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
	imports: { "#atseq-integrity": {
		"atseq-source": {
			node: "./src/integrity/node.ts",
			default: "./src/integrity/browser.ts"
		},
		node: "./dist/src/integrity/node.js",
		default: "./dist/src/integrity/browser.js"
	} },
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
	bundleDependencies: !0
}, Jt = {
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
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
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
}, Yt = {
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
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	imports: { "#runtime": {
		workerd: "./dist/runtime.js",
		node: "./dist/runtime.node.js",
		default: "./dist/runtime.js"
	} },
	exports: {
		".": "./dist/index.js",
		"./bytes": "./dist/bytes.js"
	},
	publishConfig: { access: "public" },
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
	peerDependencies: { "@atcute/cid": "^2.5.0" },
	scripts: {
		build: "tsc",
		test: "vitest",
		prepublish: "rm -rf dist; pnpm run build"
	}
}, Xt = {
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
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: {
		".": "./dist/index.js",
		"./cid-link": "./dist/cid-link.js"
	},
	publishConfig: { access: "public" },
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
}, Zt = {
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
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	imports: { "#keypairs/secp256k1": {
		bun: "./dist/keypairs/secp256k1-web.js",
		deno: "./dist/keypairs/secp256k1-deno.js",
		node: "./dist/keypairs/secp256k1-node.js",
		default: "./dist/keypairs/secp256k1-web.js"
	} },
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
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
}, Qt = {
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
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
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
}, $t = {
	name: "@atcute/identity",
	version: "2.0.2",
	description: "syntax, type definitions and schemas for atproto handles, DIDs and DID documents",
	keywords: ["atproto", "did"],
	license: "0BSD",
	repository: {
		url: "https://github.com/mary-ext/atcute",
		directory: "packages/identity/identity"
	},
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
	dependencies: {
		valibot: "^1.4.2",
		"@atcute/lexicons": "^2.0.3"
	},
	devDependencies: {
		"@vitest/coverage-v8": "^4.1.10",
		vitest: "^4.1.10"
	},
	peerDependencies: { "@atcute/lexicons": "^2.0.0" },
	scripts: {
		build: "tsc",
		test: "vitest",
		prepublish: "rm -rf dist; pnpm run build"
	}
}, en = {
	name: "@atcute/lexicons",
	version: "2.1.1",
	description: "AT Protocol core lexicon types and schema validations",
	license: "0BSD",
	repository: {
		url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
		directory: "packages/lexicons/lexicons"
	},
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: {
		".": "./dist/index.js",
		"./ambient": "./dist/ambient.js",
		"./interfaces": "./dist/interfaces/index.js",
		"./syntax": "./dist/syntax/index.js",
		"./validations": "./dist/validations/index.js"
	},
	publishConfig: { access: "public" },
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
}, tn = {
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
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
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
}, nn = {
	name: "@atcute/multibase",
	version: "1.2.5",
	description: "multibase utilities",
	license: "0BSD",
	repository: {
		url: "https://github.com/mary-ext/atcute",
		directory: "packages/utilities/multibase"
	},
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
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
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
	dependencies: { "@atcute/uint8array": "^1.1.5" },
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
}, rn = {
	name: "@atcute/repo",
	version: "1.1.0",
	description: "AT Protocol repository decoder for AT Protocol.",
	keywords: ["atproto", "repo"],
	license: "0BSD",
	repository: {
		url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
		directory: "packages/utilities/repo"
	},
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
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
}, an = {
	name: "@atcute/uint8array",
	version: "1.2.0",
	description: "uint8array utilities",
	license: "0BSD",
	repository: {
		url: "https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij",
		directory: "packages/misc/uint8array"
	},
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": {
		bun: "./dist/index.bun.js",
		node: "./dist/index.node.js",
		default: "./dist/index.js"
	} },
	publishConfig: { access: "public" },
	devDependencies: {
		"@types/bun": "^1.4.2",
		vitest: "^5.0.0"
	},
	scripts: {
		build: "tsc",
		test: "vitest",
		prepublish: "rm -rf dist; pnpm run build"
	}
}, on = {
	name: "@atcute/util-fetch",
	version: "2.0.2",
	description: "internal fetch utilities",
	keywords: ["atproto", "did"],
	license: "0BSD",
	repository: {
		url: "https://github.com/mary-ext/atcute",
		directory: "packages/misc/util-fetch"
	},
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
	dependencies: { valibot: "^1.4.2" },
	scripts: {
		build: "tsc",
		prepublish: "rm -rf dist; pnpm run build"
	}
}, sn = {
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
	sideEffects: !1,
	exports: { ".": {
		"react-native": "./dist/index.rn.js",
		default: "./dist/index.js"
	} },
	publishConfig: { access: "public" },
	dependencies: { "unicode-segmenter": "^0.17.0" },
	devDependencies: {
		"@types/node": "^26.1.1",
		vitest: "^4.1.10"
	},
	scripts: {
		build: "tsc",
		test: "vitest",
		prepublish: "rm -rf dist; pnpm run build"
	}
}, cn = {
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
	maintainers: [{
		email: "hey@hyeseong.kim",
		name: "Hyeseong Kim"
	}],
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
	imports: { "#src/*": "./src/*" },
	sideEffects: ["./intl-polyfill.js", "./intl-polyfill.cjs"],
	publishConfig: {
		access: "public",
		provenance: !0,
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
		clean: "rimraf -g \"*.js\" \"*.cjs\" \"*.map\" \"*.d.ts\" \"*.d.cts\"",
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
	alias: { process: !1 },
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
}, ln = {
	name: "@atcute/varint",
	version: "2.0.2",
	description: "protobuf-style LEB128 varint codec library",
	license: "0BSD",
	repository: {
		url: "https://github.com/mary-ext/atcute",
		directory: "packages/utilities/varint"
	},
	files: ["dist/", "!dist/**/*.{test,bench}.*"],
	type: "module",
	sideEffects: !1,
	exports: { ".": "./dist/index.js" },
	publishConfig: { access: "public" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc",
		test: "vitest",
		prepublish: "rm -rf dist; pnpm run build"
	}
}, un = {
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	dependencies: {
		zod: "^3.23.8",
		"@atproto-labs/fetch": "0.2.3",
		"@atproto-labs/pipe": "0.1.1",
		"@atproto-labs/simple-store": "0.3.0",
		"@atproto-labs/simple-store-memory": "0.1.4",
		"@atproto/did": "0.3.0"
	},
	devDependencies: { typescript: "^5.6.3" },
	scripts: { build: "tsc --build tsconfig.build.json" }
}, dn = {
	name: "@atproto-labs/fetch",
	version: "0.2.3",
	license: "MIT",
	description: "Isomorphic wrapper utilities for fetch API",
	keywords: ["atproto", "fetch"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/fetch"
	},
	type: "commonjs",
	main: "dist/index.js",
	types: "dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	dependencies: { "@atproto-labs/pipe": "0.1.1" },
	devDependencies: { typescript: "^5.6.3" },
	scripts: { build: "tsc --build tsconfig.json" }
}, fn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"ipaddr.js": "^2.1.0",
		undici_v6: "npm:undici@^6.x",
		undici_v7: "npm:undici@^7.x",
		undici_v8: "npm:undici@^8.x",
		"@atproto-labs/fetch": "^0.3.6",
		"@atproto-labs/pipe": "^0.2.4"
	},
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc --build tsconfig.json",
		test: "vitest run"
	}
}, pn = {
	name: "@atproto-labs/fetch",
	version: "0.3.6",
	license: "MIT",
	description: "Isomorphic wrapper utilities for fetch API",
	keywords: ["atproto", "fetch"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/fetch"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { "@atproto-labs/pipe": "^0.2.4" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc --build tsconfig.json",
		test: "vitest run"
	}
}, mn = {
	name: "@atproto-labs/pipe",
	version: "0.2.4",
	license: "MIT",
	description: "Library for combining multiple functions into a single function.",
	keywords: ["atproto", "transformer"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/pipe"
	},
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	scripts: { build: "tsgo --build tsconfig.json" }
}, hn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto-labs/simple-store-memory": "^0.2.6",
		"@atproto/did": "^0.5.6",
		"@atproto-labs/simple-store": "^0.5.1"
	},
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, gn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"@atproto-labs/handle-resolver": "^0.4.10",
		"@atproto-labs/fetch-node": "^0.4.0",
		"@atproto/did": "^0.5.6"
	},
	scripts: { build: "tsc --build tsconfig.build.json" }
}, _n = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.39",
		jest: "^30.5.2"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "NODE_OPTIONS=--experimental-vm-modules jest"
	}
}, vn = {
	name: "@atproto-labs/simple-store",
	version: "0.5.1",
	license: "MIT",
	description: "Simple store interfaces & utilities",
	keywords: ["cache", "isomorphic"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/simple-store"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsgo --build tsconfig.build.json",
		test: "vitest run"
	}
}, yn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"lru-cache": "^10.2.0",
		"@atproto-labs/simple-store": "^0.5.1"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, bn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.39",
		jest: "^30.5.2"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "NODE_OPTIONS=--experimental-vm-modules jest"
	}
}, xn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"@atproto-labs/did-resolver": "^0.3.10",
		"@atproto-labs/handle-resolver": "^0.4.10"
	},
	scripts: { build: "tsc --build tsconfig.json" }
}, Sn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto-labs/fetch": "^0.3.6",
		"@atproto-labs/pipe": "^0.2.4",
		"@atproto-labs/simple-store": "^0.5.1",
		"@atproto-labs/simple-store-memory": "^0.2.6",
		"@atproto/did": "^0.5.6"
	},
	scripts: { build: "tsc --build tsconfig.build.json" }
}, Cn = {
	name: "@atproto-labs/fetch",
	version: "0.3.6",
	license: "MIT",
	description: "Isomorphic wrapper utilities for fetch API",
	keywords: ["atproto", "fetch"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/fetch"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { "@atproto-labs/pipe": "^0.2.4" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc --build tsconfig.json",
		test: "vitest run"
	}
}, wn = {
	name: "@atproto-labs/pipe",
	version: "0.2.4",
	license: "MIT",
	description: "Library for combining multiple functions into a single function.",
	keywords: ["atproto", "transformer"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/pipe"
	},
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	scripts: { build: "tsgo --build tsconfig.json" }
}, Tn = {
	name: "@atproto-labs/simple-store",
	version: "0.5.1",
	license: "MIT",
	description: "Simple store interfaces & utilities",
	keywords: ["cache", "isomorphic"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/simple-store"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsgo --build tsconfig.build.json",
		test: "vitest run"
	}
}, En = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"lru-cache": "^10.2.0",
		"@atproto-labs/simple-store": "^0.5.1"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, Dn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.39",
		jest: "^30.5.2"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "NODE_OPTIONS=--experimental-vm-modules jest"
	}
}, On = {
	name: "@atproto-labs/pipe",
	version: "0.1.1",
	license: "MIT",
	description: "Library for combining multiple functions into a single function.",
	keywords: ["atproto", "transformer"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/pipe"
	},
	type: "commonjs",
	main: "dist/index.js",
	types: "dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	devDependencies: { typescript: "^5.6.3" },
	scripts: { build: "tsc --build tsconfig.json" }
}, kn = {
	name: "@atproto-labs/simple-store",
	version: "0.3.0",
	license: "MIT",
	description: "Simple store interfaces & utilities",
	keywords: ["cache", "isomorphic"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/simple-store"
	},
	type: "commonjs",
	main: "dist/index.js",
	types: "dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	devDependencies: { typescript: "^5.6.3" },
	scripts: { build: "tsc --build tsconfig.build.json" }
}, An = {
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	dependencies: {
		"lru-cache": "^10.2.0",
		"@atproto-labs/simple-store": "0.3.0"
	},
	devDependencies: { typescript: "^5.6.3" },
	scripts: { build: "tsc --build tsconfig.build.json" }
}, jn = {
	name: "@atproto/common",
	version: "0.5.16",
	license: "MIT",
	description: "Shared web-platform-friendly code for atproto libraries",
	keywords: ["atproto"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/common"
	},
	main: "dist/index.js",
	types: "dist/index.d.ts",
	engines: { node: ">=18.7.0" },
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
}, Mn = {
	name: "@atproto/common-web",
	version: "0.5.10",
	license: "MIT",
	description: "Shared web-platform-friendly code for atproto libraries",
	keywords: ["atproto"],
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto/lex-data": "^0.1.7",
		"@atproto/lex-json": "^0.1.6",
		"@atproto/syntax": "^0.7.5"
	},
	devDependencies: { jest: "^30.0.0" },
	scripts: {
		test: "NODE_OPTIONS=--experimental-vm-modules jest",
		build: "tsc --build tsconfig.build.json"
	}
}, Nn = {
	name: "@atproto/common-web",
	version: "0.4.21",
	license: "MIT",
	description: "Shared web-platform-friendly code for atproto libraries",
	keywords: ["atproto"],
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
}, Pn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.cjs",
	module: "./dist/index.mjs",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.mjs",
		import: "./dist/index.mjs",
		default: "./dist/index.cjs"
	} },
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
}, Fn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, In = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
	dependencies: {
		tslib: "^2.8.1",
		"@atproto/lex-data": "^0.0.15"
	},
	devDependencies: { vitest: "^4.0.16" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, Ln = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, Rn = {
	name: "@atproto/crypto",
	version: "0.4.5",
	license: "MIT",
	description: "Library for cryptographic keys and signing in atproto",
	keywords: ["atproto", "cryptography"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/crypto"
	},
	main: "dist/index.js",
	types: "dist/index.d.ts",
	engines: { node: ">=18.7.0" },
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
}, zn = {
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.24",
		jest: "^28.1.2",
		typescript: "^5.6.3"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "jest"
	}
}, Bn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		multiformats: "^13.0.0",
		zod: "^3.23.8"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, Vn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		jose: "^5.2.0",
		"@atproto/jwk": "^0.7.4"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, Hn = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto/jwk": "^0.7.4",
		"@atproto/jwk-jose": "^0.2.4"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, Un = {
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
	bugs: { url: "https://github.com/multiformats/js-multiformats/issues" },
	publishConfig: {
		access: "public",
		provenance: !0
	},
	keywords: [
		"ipfs",
		"ipld",
		"multiformats"
	],
	type: "module",
	types: "./dist/src/index.d.ts",
	typesVersions: { "*": {
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
	} },
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
			project: !0,
			sourceType: "module"
		}
	},
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			"@semantic-release/npm",
			"@semantic-release/github",
			["@semantic-release/git", { assets: ["CHANGELOG.md", "package.json"] }]
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
	aegir: { test: { target: ["node", "browser"] } },
	browser: {
		"./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
		"./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
		"./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
		"./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
	}
}, Wn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, Gn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		require: "./dist/index.js",
		import: "./dist/index.js"
	} },
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
}, Kn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.cjs",
	module: "./dist/index.mjs",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.mjs",
		import: "./dist/index.mjs",
		default: "./dist/index.cjs"
	} },
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
}, qn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, Jn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, Yn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, Xn = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
	dependencies: {
		tslib: "^2.8.1",
		"@atproto/lex-data": "^0.0.12"
	},
	devDependencies: { vitest: "^4.0.16" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, Zn = {
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
	sideEffects: !1,
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
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
}, Qn = {
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
	bugs: { url: "https://github.com/multiformats/js-multiformats/issues" },
	publishConfig: {
		access: "public",
		provenance: !0
	},
	keywords: [
		"ipfs",
		"ipld",
		"multiformats"
	],
	type: "module",
	types: "./dist/src/index.d.ts",
	typesVersions: { "*": {
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
	} },
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
			project: !0,
			sourceType: "module"
		}
	},
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			"@semantic-release/npm",
			"@semantic-release/github",
			["@semantic-release/git", { assets: ["CHANGELOG.md", "package.json"] }]
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
	aegir: { test: { target: ["node", "browser"] } },
	browser: {
		"./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
		"./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
		"./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
		"./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
	}
}, $n = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, er = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
	devDependencies: { vitest: "^4.0.16" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, tr = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, nr = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, rr = {
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
	sideEffects: !1,
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		tslib: "^2.8.1",
		"@atproto/lex-data": "^0.1.7"
	},
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsgo --build tsconfig.build.json",
		test: "vitest run"
	}
}, ir = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, ar = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, or = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, sr = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
	dependencies: {
		tslib: "^2.8.1",
		"@atproto/syntax": "^0.4.3",
		"@atproto/lex-data": "^0.0.12"
	},
	devDependencies: { vitest: "^4.0.16" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, cr = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, lr = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, ur = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, dr = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
	dependencies: {
		tslib: "^2.8.1",
		"@atproto/lex-data": "^0.0.12"
	},
	devDependencies: { vitest: "^4.0.16" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, fr = {
	name: "@atproto/lexicon",
	version: "0.7.12",
	license: "MIT",
	description: "atproto Lexicon schema language library",
	keywords: ["atproto", "lexicon"],
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		multiformats: "^13.0.0",
		zod: "^3.23.8",
		"@atproto/common-web": "^0.5.10",
		"@atproto/syntax": "^0.7.5"
	},
	devDependencies: { jest: "^30.0.0" },
	scripts: {
		test: "NODE_OPTIONS=--experimental-vm-modules jest",
		build: "tsc --build tsconfig.build.json"
	}
}, pr = {
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
	bugs: { url: "https://github.com/multiformats/js-multiformats/issues" },
	publishConfig: {
		access: "public",
		provenance: !0
	},
	keywords: [
		"ipfs",
		"ipld",
		"multiformats"
	],
	type: "module",
	types: "./dist/src/index.d.ts",
	typesVersions: { "*": {
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
	} },
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
			project: !0,
			sourceType: "module"
		}
	},
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			"@semantic-release/npm",
			"@semantic-release/github",
			["@semantic-release/git", { assets: ["CHANGELOG.md", "package.json"] }]
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
	aegir: { test: { target: ["node", "browser"] } },
	browser: {
		"./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
		"./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
		"./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
		"./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
	}
}, mr = {
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
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
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, hr = {
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
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
	scripts: { build: "tsc --build tsconfig.build.json" }
}, gr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto-labs/fetch": "^0.3.6",
		"@atproto-labs/pipe": "^0.2.4",
		"@atproto-labs/simple-store": "^0.5.1",
		"@atproto-labs/simple-store-memory": "^0.2.6",
		"@atproto/did": "^0.5.6"
	},
	scripts: { build: "tsc --build tsconfig.build.json" }
}, _r = {
	name: "@atproto-labs/fetch",
	version: "0.3.6",
	license: "MIT",
	description: "Isomorphic wrapper utilities for fetch API",
	keywords: ["atproto", "fetch"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/fetch"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { "@atproto-labs/pipe": "^0.2.4" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc --build tsconfig.json",
		test: "vitest run"
	}
}, vr = {
	name: "@atproto-labs/pipe",
	version: "0.2.4",
	license: "MIT",
	description: "Library for combining multiple functions into a single function.",
	keywords: ["atproto", "transformer"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/pipe"
	},
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	scripts: { build: "tsgo --build tsconfig.json" }
}, yr = {
	name: "@atproto-labs/simple-store",
	version: "0.5.1",
	license: "MIT",
	description: "Simple store interfaces & utilities",
	keywords: ["cache", "isomorphic"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/simple-store"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsgo --build tsconfig.build.json",
		test: "vitest run"
	}
}, br = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"lru-cache": "^10.2.0",
		"@atproto-labs/simple-store": "^0.5.1"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, xr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.39",
		jest: "^30.5.2"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "NODE_OPTIONS=--experimental-vm-modules jest"
	}
}, Sr = {
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
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
	scripts: { build: "tsc --build tsconfig.build.json" }
}, Cr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto-labs/fetch": "^0.3.6",
		"@atproto-labs/pipe": "^0.2.4",
		"@atproto-labs/simple-store": "^0.5.1",
		"@atproto-labs/simple-store-memory": "^0.2.6",
		"@atproto/did": "^0.5.6"
	},
	scripts: { build: "tsc --build tsconfig.build.json" }
}, wr = {
	name: "@atproto-labs/fetch",
	version: "0.3.6",
	license: "MIT",
	description: "Isomorphic wrapper utilities for fetch API",
	keywords: ["atproto", "fetch"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/fetch"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { "@atproto-labs/pipe": "^0.2.4" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc --build tsconfig.json",
		test: "vitest run"
	}
}, Tr = {
	name: "@atproto-labs/pipe",
	version: "0.2.4",
	license: "MIT",
	description: "Library for combining multiple functions into a single function.",
	keywords: ["atproto", "transformer"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/pipe"
	},
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	scripts: { build: "tsgo --build tsconfig.json" }
}, Er = {
	name: "@atproto-labs/simple-store",
	version: "0.5.1",
	license: "MIT",
	description: "Simple store interfaces & utilities",
	keywords: ["cache", "isomorphic"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/simple-store"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsgo --build tsconfig.build.json",
		test: "vitest run"
	}
}, Dr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"lru-cache": "^10.2.0",
		"@atproto-labs/simple-store": "^0.5.1"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, Or = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.39",
		jest: "^30.5.2"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "NODE_OPTIONS=--experimental-vm-modules jest"
	}
}, kr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto-labs/fetch": "^0.3.6",
		"@atproto-labs/pipe": "^0.2.4",
		"@atproto-labs/simple-store": "^0.5.1",
		"@atproto-labs/simple-store-memory": "^0.2.6",
		"@atproto/did": "^0.5.6"
	},
	scripts: { build: "tsc --build tsconfig.build.json" }
}, Ar = {
	name: "@atproto-labs/fetch",
	version: "0.3.6",
	license: "MIT",
	description: "Isomorphic wrapper utilities for fetch API",
	keywords: ["atproto", "fetch"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/fetch"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { "@atproto-labs/pipe": "^0.2.4" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsc --build tsconfig.json",
		test: "vitest run"
	}
}, jr = {
	name: "@atproto-labs/pipe",
	version: "0.2.4",
	license: "MIT",
	description: "Library for combining multiple functions into a single function.",
	keywords: ["atproto", "transformer"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/pipe"
	},
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	scripts: { build: "tsgo --build tsconfig.json" }
}, Mr = {
	name: "@atproto-labs/simple-store",
	version: "0.5.1",
	license: "MIT",
	description: "Simple store interfaces & utilities",
	keywords: ["cache", "isomorphic"],
	homepage: "https://atproto.com",
	repository: {
		type: "git",
		url: "https://github.com/bluesky-social/atproto",
		directory: "packages/internal/simple-store"
	},
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		build: "tsgo --build tsconfig.build.json",
		test: "vitest run"
	}
}, Nr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"lru-cache": "^10.2.0",
		"@atproto-labs/simple-store": "^0.5.1"
	},
	scripts: { build: "tsgo --build tsconfig.build.json" }
}, Pr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.39",
		jest: "^30.5.2"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "NODE_OPTIONS=--experimental-vm-modules jest"
	}
}, Fr = {
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
	bugs: { url: "https://github.com/multiformats/js-multiformats/issues" },
	publishConfig: {
		access: "public",
		provenance: !0
	},
	keywords: [
		"ipfs",
		"ipld",
		"multiformats"
	],
	type: "module",
	types: "./dist/src/index.d.ts",
	typesVersions: { "*": {
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
	} },
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
			project: !0,
			sourceType: "module"
		}
	},
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			"@semantic-release/npm",
			"@semantic-release/github",
			["@semantic-release/git", { assets: ["CHANGELOG.md", "package.json"] }]
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
	aegir: { test: { target: ["node", "browser"] } },
	browser: {
		"./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
		"./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
		"./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
		"./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
	}
}, Ir = {
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto/did": "^0.5.6",
		"@atproto/jwk": "^0.7.4"
	},
	scripts: { build: "tsc --build tsconfig.build.json" }
}, Lr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: { zod: "^3.23.8" },
	devDependencies: {
		"@swc/jest": "^0.2.39",
		jest: "^30.5.2"
	},
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "NODE_OPTIONS=--experimental-vm-modules jest"
	}
}, Rr = {
	name: "@atproto/repo",
	version: "0.8.13",
	license: "MIT",
	description: "atproto repo and MST implementation",
	keywords: ["atproto", "mst"],
	engines: { node: ">=18.7.0" },
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
}, zr = {
	name: "@atproto/common-web",
	version: "0.4.21",
	license: "MIT",
	description: "Shared web-platform-friendly code for atproto libraries",
	keywords: ["atproto"],
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
}, Br = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, Vr = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
	dependencies: {
		tslib: "^2.8.1",
		"@atproto/lex-data": "^0.0.15"
	},
	devDependencies: { vitest: "^4.0.16" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, Hr = {
	name: "@atproto/lexicon",
	version: "0.6.2",
	license: "MIT",
	description: "atproto Lexicon schema language library",
	keywords: ["atproto", "lexicon"],
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
}, Ur = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, Wr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"iso-datestring-validator": "^2.2.2",
		tslib: "^2.8.1"
	},
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, Gr = {
	name: "@atproto/xrpc",
	version: "0.8.14",
	license: "MIT",
	description: "atproto HTTP API (XRPC) client library",
	keywords: ["atproto", "xrpc"],
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto/lexicon": "^0.7.15"
	},
	scripts: { build: "tsc --build tsconfig.build.json" }
}, Kr = {
	name: "@atproto/common-web",
	version: "0.5.13",
	license: "MIT",
	description: "Shared web-platform-friendly code for atproto libraries",
	keywords: ["atproto"],
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		zod: "^3.23.8",
		"@atproto/lex-data": "^0.1.7",
		"@atproto/lex-json": "^0.1.6",
		"@atproto/syntax": "^0.7.6"
	},
	devDependencies: { jest: "^30.5.2" },
	scripts: {
		test: "NODE_OPTIONS=--experimental-vm-modules jest",
		build: "tsc --build tsconfig.build.json"
	}
}, qr = {
	name: "@atproto/lexicon",
	version: "0.7.15",
	license: "MIT",
	description: "atproto Lexicon schema language library",
	keywords: ["atproto", "lexicon"],
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
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		multiformats: "^13.0.0",
		zod: "^3.23.8",
		"@atproto/common-web": "^0.5.13",
		"@atproto/syntax": "^0.7.6"
	},
	devDependencies: { jest: "^30.5.2" },
	scripts: {
		test: "NODE_OPTIONS=--experimental-vm-modules jest",
		build: "tsc --build tsconfig.build.json"
	}
}, Jr = {
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
	files: ["./dist", "./CHANGELOG.md"],
	type: "module",
	exports: { ".": {
		types: "./dist/index.d.ts",
		default: "./dist/index.js"
	} },
	engines: { node: ">=22" },
	dependencies: {
		"iso-datestring-validator": "^2.2.2",
		tslib: "^2.8.1"
	},
	devDependencies: { vitest: "^4.1.10" },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, Yr = {
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
	bugs: { url: "https://github.com/multiformats/js-multiformats/issues" },
	publishConfig: {
		access: "public",
		provenance: !0
	},
	keywords: [
		"ipfs",
		"ipld",
		"multiformats"
	],
	type: "module",
	types: "./dist/src/index.d.ts",
	typesVersions: { "*": {
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
	} },
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
			project: !0,
			sourceType: "module"
		}
	},
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			"@semantic-release/npm",
			"@semantic-release/github",
			["@semantic-release/git", { assets: ["CHANGELOG.md", "package.json"] }]
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
	aegir: { test: { target: ["node", "browser"] } },
	browser: {
		"./hashes/sha1": "./dist/src/hashes/sha1-browser.js",
		"./dist/src/hashes/sha1.js": "./dist/src/hashes/sha1-browser.js",
		"./hashes/sha2": "./dist/src/hashes/sha2-browser.js",
		"./dist/src/hashes/sha2.js": "./dist/src/hashes/sha2-browser.js"
	}
}, Xr = {
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
	files: ["dist"],
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
	devDependencies: { typescript: "^5.9.0" }
}, Zr = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, Qr = {
	name: "@inlay/render",
	version: "0.3.1",
	type: "module",
	main: "./dist/packages/@inlay/render/src/index.js",
	types: "./dist/packages/@inlay/render/src/index.d.ts",
	exports: { ".": {
		source: "./src/index.ts",
		types: "./dist/packages/@inlay/render/src/index.d.ts",
		import: "./dist/packages/@inlay/render/src/index.js"
	} },
	files: ["dist"],
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
	peerDependencies: { "@inlay/core": "*" },
	devDependencies: { typescript: "^5.9.0" }
}, $r = {
	name: "@atproto/common-web",
	version: "0.4.21",
	license: "MIT",
	description: "Shared web-platform-friendly code for atproto libraries",
	keywords: ["atproto"],
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
}, ei = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, ti = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
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
}, ni = {
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
	sideEffects: !1,
	type: "commonjs",
	main: "./dist/index.js",
	types: "./dist/index.d.ts",
	exports: { ".": {
		types: "./dist/index.d.ts",
		browser: "./dist/index.js",
		import: "./dist/index.js",
		default: "./dist/index.js"
	} },
	dependencies: {
		tslib: "^2.8.1",
		"@atproto/lex-data": "^0.0.15"
	},
	devDependencies: { vitest: "^4.0.16" },
	scripts: {
		build: "tsc --build tsconfig.build.json",
		test: "vitest run"
	}
}, ri = {
	name: "@atproto/lexicon",
	version: "0.6.2",
	license: "MIT",
	description: "atproto Lexicon schema language library",
	keywords: ["atproto", "lexicon"],
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
}, ii = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, ai = {
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
	dependencies: { tslib: "^2.8.1" },
	devDependencies: {
		typescript: "^5.6.3",
		vitest: "^4.0.16"
	},
	browser: { "dns/promises": !1 },
	scripts: {
		test: "vitest run",
		build: "tsc --build tsconfig.build.json"
	}
}, oi = {
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
	standard: { ignore: ["dist"] },
	directories: { test: "test" },
	repository: {
		type: "git",
		url: "git+https://github.com/ipld/js-dag-cbor.git"
	},
	bugs: { url: "https://github.com/ipld/js-dag-cbor/issues" },
	homepage: "https://github.com/ipld/js-dag-cbor#readme",
	typesVersions: { "*": {
		"*": ["types/*"],
		"types/*": ["types/*"]
	} },
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			["@semantic-release/npm", { pkgRoot: "dist" }],
			"@semantic-release/github",
			"@semantic-release/git"
		]
	},
	browser: "./cjs/index.js"
}, si = {
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
	dependencies: { "@noble/hashes": "1.8.0" },
	devDependencies: {
		"@paulmillr/jsbt": "0.4.0",
		"@types/node": "22.15.21",
		"fast-check": "4.1.1",
		"micro-bmark": "0.4.2",
		"micro-should": "0.5.3",
		prettier: "3.5.3",
		typescript: "5.8.3"
	},
	sideEffects: !1,
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
	engines: { node: "^14.21.3 || >=16" },
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
}, ci = {
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
	engines: { node: "^14.21.3 || >=16" },
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
	sideEffects: !1,
	browser: {
		"node:crypto": !1,
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
}, li = {
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
	sideEffects: !1,
	author: "Paul Miller (https://paulmillr.com)",
	license: "MIT"
}, ui = {
	name: "@oomfware/eval",
	version: "0.1.0",
	description: "composable JavaScript eval templating",
	license: "0BSD",
	repository: {
		type: "git",
		url: "https://tangled.org/did:plc:mthorzi57b5as7jpzzy67kkv"
	},
	files: ["dist/"],
	type: "module",
	sideEffects: !1,
	exports: {
		".": "./dist/index.mjs",
		"./package.json": "./package.json"
	},
	publishConfig: { access: "public" },
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
}, di = {
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
	exports: { ".": {
		"standard-schema-spec": "./src/index.ts",
		import: {
			types: "./dist/index.d.ts",
			default: "./dist/index.js"
		},
		require: {
			types: "./dist/index.d.cts",
			default: "./dist/index.cjs"
		}
	} },
	sideEffects: !1,
	files: ["dist"],
	publishConfig: { access: "public" },
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
}, fi = {
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
	publishConfig: { access: "public" },
	browser: {
		fs: !1,
		"node:fs": !1,
		"fs/promises": !1,
		"node:fs/promises": !1,
		os: !1,
		"node:os": !1,
		"fs.realpath": !1,
		mkdirp: !1,
		"dir-glob": !1,
		"graceful-fs": !1,
		tinyglobby: !1,
		"source-map-support": !1,
		"glob-parent": !1,
		glob: !1,
		path: !1,
		"node:path": !1,
		crypto: !1,
		buffer: !1,
		"@microsoft/typescript-etw": !1,
		inspector: !1
	}
}, pi = {
	name: "abort-controller",
	version: "3.0.0",
	description: "An implementation of WHATWG AbortController interface.",
	main: "dist/abort-controller",
	files: [
		"dist",
		"polyfill.*",
		"browser.*"
	],
	engines: { node: ">=6.5" },
	dependencies: { "event-target-shim": "^5.0.0" },
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
	bugs: { url: "https://github.com/mysticatea/abort-controller/issues" },
	homepage: "https://github.com/mysticatea/abort-controller#readme"
}, mi = {
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
	engines: { node: ">=8" },
	scripts: {
		test: "xo && ava && tsd",
		"view-supported": "node fixtures/view-codes.js"
	},
	files: ["index.js", "index.d.ts"],
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
}, hi = {
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
	engines: { node: ">=8" },
	scripts: {
		test: "xo && ava && tsd",
		screenshot: "svg-term --command='node screenshot' --out=screenshot.svg --padding=3 --width=55 --height=3 --at=1000 --no-cursor"
	},
	files: ["index.js", "index.d.ts"],
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
	dependencies: { "color-convert": "^2.0.1" },
	devDependencies: {
		"@types/color-convert": "^1.9.0",
		ava: "^2.3.0",
		"svg-term-cli": "^2.1.1",
		tsd: "^0.11.0",
		xo: "^0.25.3"
	}
}, gi = {
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
	engines: { node: ">=8.0.0" },
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
	bugs: { url: "https://github.com/davidmarkclements/atomic-sleep/issues" },
	homepage: "https://github.com/davidmarkclements/atomic-sleep#readme"
}, _i = {
	name: "balanced-match",
	description: "Match balanced character pairs, like \"{\" and \"}\"",
	version: "4.0.4",
	files: ["dist"],
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
	engines: { node: "18 || 20 || >=22" },
	tshy: { exports: {
		"./package.json": "./package.json",
		".": "./src/index.ts"
	} },
	main: "./dist/commonjs/index.js",
	types: "./dist/commonjs/index.d.ts",
	module: "./dist/esm/index.js"
}, vi = {
	name: "base64-js",
	description: "Base64 encoding/decoding in pure JS",
	version: "1.5.1",
	author: "T. Jameson Little <t.jameson.little@gmail.com>",
	typings: "index.d.ts",
	bugs: { url: "https://github.com/beatgammit/base64-js/issues" },
	devDependencies: {
		"babel-minify": "^0.5.1",
		benchmark: "^2.1.4",
		browserify: "^16.3.0",
		standard: "*",
		tape: "4.x"
	},
	homepage: "https://github.com/beatgammit/base64-js",
	keywords: ["base64"],
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
}, yi = {
	name: "brace-expansion",
	description: "Brace expansion as known from sh/bash",
	version: "5.0.12",
	files: ["dist"],
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
	dependencies: { "balanced-match": "^4.0.2" },
	license: "MIT",
	engines: { node: "20 || >=22" },
	tshy: { exports: {
		"./package.json": "./package.json",
		".": "./src/index.ts"
	} },
	main: "./dist/commonjs/index.js",
	types: "./dist/commonjs/index.d.ts",
	module: "./dist/esm/index.js",
	repository: {
		type: "git",
		url: "git+https://github.com/juliangruber/brace-expansion.git"
	}
}, bi = {
	name: "buffer",
	description: "Node.js Buffer API, for the browser",
	version: "6.0.3",
	author: {
		name: "Feross Aboukhadijeh",
		email: "feross@feross.org",
		url: "https://feross.org"
	},
	bugs: { url: "https://github.com/feross/buffer/issues" },
	contributors: ["Romain Beauxis <toots@rastageeks.org>", "James Halliday <mail@substack.net>"],
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
	jspm: { map: { "./index.js": { node: "@node/buffer" } } },
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
	standard: { ignore: [
		"test/node/**/*.js",
		"test/common.js",
		"test/_polyfill.js",
		"perf/**/*.js"
	] },
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
}, xi = {
	name: "cborg",
	version: "1.10.2",
	description: "Fast CBOR with a focus on strictness",
	main: "./cjs/cborg.js",
	bin: { cborg: "cli.js" },
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
	keywords: ["cbor"],
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
	typesVersions: { "*": {
		json: ["types/lib/json/json.d.ts"],
		length: ["types/lib/length.d.ts"],
		"*": ["types/*"],
		"types/*": ["types/*"]
	} },
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			["@semantic-release/npm", { pkgRoot: "dist" }],
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
}, Si = {
	name: "cliui",
	version: "8.0.1",
	description: "easily create complex multi-column command-line-interfaces",
	main: "build/index.cjs",
	exports: { ".": [{
		import: "./index.mjs",
		require: "./build/index.cjs"
	}, "./build/index.cjs"] },
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
		ignore: ["**/example/**"],
		globals: ["it"]
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
	engines: { node: ">=12" }
}, Ci = {
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
	bugs: { url: "https://github.com/dsherret/code-block-writer/issues" },
	main: "./script/mod.js",
	module: "./esm/mod.js",
	exports: { ".": {
		import: "./esm/mod.js",
		require: "./script/mod.js"
	} },
	scripts: { test: "node test_runner.js" },
	devDependencies: {
		"@types/node": "^20.9.0",
		picocolors: "^1.0.0",
		"@types/chai": "4.3",
		chai: "4.3.7",
		"@deno/shim-deno": "~0.18.0"
	},
	_generatedBy: "dnt@dev"
}, wi = {
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
	engines: { node: ">=7.0.0" },
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
	xo: { rules: {
		"default-case": 0,
		"no-inline-comments": 0,
		"operator-linebreak": 0
	} },
	devDependencies: {
		chalk: "^2.4.2",
		xo: "^0.24.0"
	},
	dependencies: { "color-name": "~1.1.4" }
}, Ti = {
	name: "color-name",
	version: "1.1.4",
	description: "A list of color names and its values",
	main: "index.js",
	files: ["index.js"],
	scripts: { test: "node test.js" },
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
	bugs: { url: "https://github.com/colorjs/color-name/issues" },
	homepage: "https://github.com/colorjs/color-name"
}, Ei = {
	name: "core-js",
	version: "3.50.0",
	type: "commonjs",
	description: "Standard library",
	keywords: /* @__PURE__ */ "ES3.ES5.ES6.ES7.ES2015.ES2016.ES2017.ES2018.ES2019.ES2020.ES2021.ES2022.ES2023.ES2024.ES2025.ES2026.ECMAScript 3.ECMAScript 5.ECMAScript 6.ECMAScript 7.ECMAScript 2015.ECMAScript 2016.ECMAScript 2017.ECMAScript 2018.ECMAScript 2019.ECMAScript 2020.ECMAScript 2021.ECMAScript 2022.ECMAScript 2023.ECMAScript 2024.ECMAScript 2025.ECMAScript 2026.Map.Set.WeakMap.WeakSet.TypedArray.Promise.Observable.Symbol.Iterator.AsyncIterator.URL.URLSearchParams.queueMicrotask.setImmediate.structuredClone.polyfill.ponyfill.shim".split("."),
	repository: {
		type: "git",
		url: "git+https://github.com/zloirock/core-js.git",
		directory: "packages/core-js"
	},
	homepage: "https://core-js.io",
	bugs: { url: "https://github.com/zloirock/core-js/issues" },
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
	sideEffects: !0,
	main: "index.js",
	scripts: { postinstall: "node -e \"try{require('./postinstall')}catch(e){}\"" },
	engines: { node: "*" }
}, Di = {
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
}, Oi = {
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
		".": [{
			import: {
				types: "./index.d.mts",
				default: "./dist/index.mjs"
			},
			require: {
				types: "./index.d.ts",
				default: "./dist/index.js"
			}
		}, "./dist/index.js"],
		"./sync": [{
			import: {
				types: "./sync/index.d.mts",
				default: "./sync/index.mjs"
			},
			require: {
				types: "./sync/index.d.ts",
				default: "./sync/index.js"
			}
		}, "./sync/index.js"]
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
	engines: { node: ">=6" },
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
}, ki = {
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
}, Ai = {
	name: "event-target-shim",
	version: "5.0.1",
	description: "An implementation of WHATWG EventTarget interface.",
	main: "dist/event-target-shim",
	types: "index.d.ts",
	files: ["dist", "index.d.ts"],
	engines: { node: ">=6" },
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
	bugs: { url: "https://github.com/mysticatea/event-target-shim/issues" },
	homepage: "https://github.com/mysticatea/event-target-shim"
}, ji = {
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
	bugs: { url: "http://github.com/Gozala/events/issues/" },
	main: "./events.js",
	engines: { node: ">=0.8.x" },
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
}, Mi = {
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
	engines: { node: ">=6" },
	directories: {
		example: "example",
		lib: "lib",
		test: "test"
	},
	repository: {
		type: "git",
		url: "git+https://github.com/davidmarkclements/fast-redact.git"
	},
	bugs: { url: "https://github.com/davidmarkclements/fast-redact/issues" },
	homepage: "https://github.com/davidmarkclements/fast-redact#readme"
}, Ni = {
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
	engines: { node: ">=12.0.0" },
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
	bugs: { url: "https://github.com/thecodrr/fdir/issues" },
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
	peerDependencies: { picomatch: "^3 || ^4" },
	peerDependenciesMeta: { picomatch: { optional: !0 } },
	module: "./dist/index.mjs",
	exports: {
		".": {
			import: "./dist/index.mjs",
			require: "./dist/index.cjs"
		},
		"./package.json": "./package.json"
	}
}, Pi = {
	name: "get-caller-file",
	version: "2.0.5",
	description: "",
	main: "index.js",
	directories: { test: "tests" },
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
	bugs: { url: "https://github.com/stefanpenner/get-caller-file/issues" },
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
	engines: { node: "6.* || 8.* || >= 10.*" }
}, Fi = {
	name: "ieee754",
	description: "Read/write IEEE754 floating point numbers from/to a Buffer or array-like object",
	version: "1.2.1",
	author: {
		name: "Feross Aboukhadijeh",
		email: "feross@feross.org",
		url: "https://feross.org"
	},
	contributors: ["Romain Beauxis <toots@rastageeks.org>"],
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
}, Ii = {
	name: "ipaddr.js",
	description: "A library for manipulating IPv4 and IPv6 addresses in JavaScript.",
	type: "commonjs",
	version: "2.5.0",
	author: "whitequark <whitequark@whitequark.org>",
	directories: { lib: "./lib" },
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
	files: ["lib"],
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
	engines: { node: ">= 10" },
	license: "MIT",
	types: "./lib/ipaddr.d.ts"
}, Li = {
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
	engines: { node: ">=8" },
	scripts: { test: "xo && ava && tsd-check" },
	files: ["index.js", "index.d.ts"],
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
}, Ri = {
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
	jest: { verbose: !0 },
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
	files: ["dist/**"],
	description: "The goal of the package is to provide lightweight tools for validating strings denotings dates and time. It includes ISO 8601 datestring validation, simple YYYY-MM-DD date validation and time validation in hh:mm:ss.fff format. See details in readme.",
	repository: {
		type: "git",
		url: "https://github.com/Bwca/iso-datestring-validator.git"
	}
}, zi = {
	name: "jose",
	version: "5.10.0",
	description: "JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes",
	keywords: /* @__PURE__ */ "browser.bun.cloudflare.compact.decode.decrypt.deno.detached.ec.ecdsa.eddsa.edge.electron.embedded.encrypt.flattened.general.jose.json web token.jsonwebtoken.jwa.jwe.jwk.jwks.jws.jwt.jwt-decode.netlify.next.nextjs.oct.okp.payload.pem.pkcs8.rsa.secp256k1.sign.signature.spki.validate.vercel.verify.webcrypto.workerd.workers.x509".split("."),
	homepage: "https://github.com/panva/jose",
	repository: "panva/jose",
	funding: { url: "https://github.com/sponsors/panva" },
	license: "MIT",
	author: "Filip Skokan <panva.ip@gmail.com>",
	sideEffects: !1,
	exports: /* @__PURE__ */ JSON.parse("{\".\":{\"types\":\"./dist/types/index.d.ts\",\"bun\":\"./dist/browser/index.js\",\"deno\":\"./dist/browser/index.js\",\"browser\":\"./dist/browser/index.js\",\"worker\":\"./dist/browser/index.js\",\"workerd\":\"./dist/browser/index.js\",\"import\":\"./dist/node/esm/index.js\",\"require\":\"./dist/node/cjs/index.js\"},\"./jwk/embedded\":{\"types\":\"./dist/types/jwk/embedded.d.ts\",\"bun\":\"./dist/browser/jwk/embedded.js\",\"deno\":\"./dist/browser/jwk/embedded.js\",\"browser\":\"./dist/browser/jwk/embedded.js\",\"worker\":\"./dist/browser/jwk/embedded.js\",\"workerd\":\"./dist/browser/jwk/embedded.js\",\"import\":\"./dist/node/esm/jwk/embedded.js\",\"require\":\"./dist/node/cjs/jwk/embedded.js\"},\"./jwk/thumbprint\":{\"types\":\"./dist/types/jwk/thumbprint.d.ts\",\"bun\":\"./dist/browser/jwk/thumbprint.js\",\"deno\":\"./dist/browser/jwk/thumbprint.js\",\"browser\":\"./dist/browser/jwk/thumbprint.js\",\"worker\":\"./dist/browser/jwk/thumbprint.js\",\"workerd\":\"./dist/browser/jwk/thumbprint.js\",\"import\":\"./dist/node/esm/jwk/thumbprint.js\",\"require\":\"./dist/node/cjs/jwk/thumbprint.js\"},\"./key/import\":{\"types\":\"./dist/types/key/import.d.ts\",\"bun\":\"./dist/browser/key/import.js\",\"deno\":\"./dist/browser/key/import.js\",\"browser\":\"./dist/browser/key/import.js\",\"worker\":\"./dist/browser/key/import.js\",\"workerd\":\"./dist/browser/key/import.js\",\"import\":\"./dist/node/esm/key/import.js\",\"require\":\"./dist/node/cjs/key/import.js\"},\"./key/export\":{\"types\":\"./dist/types/key/export.d.ts\",\"bun\":\"./dist/browser/key/export.js\",\"deno\":\"./dist/browser/key/export.js\",\"browser\":\"./dist/browser/key/export.js\",\"worker\":\"./dist/browser/key/export.js\",\"workerd\":\"./dist/browser/key/export.js\",\"import\":\"./dist/node/esm/key/export.js\",\"require\":\"./dist/node/cjs/key/export.js\"},\"./key/generate/keypair\":{\"types\":\"./dist/types/key/generate_key_pair.d.ts\",\"bun\":\"./dist/browser/key/generate_key_pair.js\",\"deno\":\"./dist/browser/key/generate_key_pair.js\",\"browser\":\"./dist/browser/key/generate_key_pair.js\",\"worker\":\"./dist/browser/key/generate_key_pair.js\",\"workerd\":\"./dist/browser/key/generate_key_pair.js\",\"import\":\"./dist/node/esm/key/generate_key_pair.js\",\"require\":\"./dist/node/cjs/key/generate_key_pair.js\"},\"./key/generate/secret\":{\"types\":\"./dist/types/key/generate_secret.d.ts\",\"bun\":\"./dist/browser/key/generate_secret.js\",\"deno\":\"./dist/browser/key/generate_secret.js\",\"browser\":\"./dist/browser/key/generate_secret.js\",\"worker\":\"./dist/browser/key/generate_secret.js\",\"workerd\":\"./dist/browser/key/generate_secret.js\",\"import\":\"./dist/node/esm/key/generate_secret.js\",\"require\":\"./dist/node/cjs/key/generate_secret.js\"},\"./jwks/remote\":{\"types\":\"./dist/types/jwks/remote.d.ts\",\"bun\":\"./dist/browser/jwks/remote.js\",\"deno\":\"./dist/browser/jwks/remote.js\",\"browser\":\"./dist/browser/jwks/remote.js\",\"worker\":\"./dist/browser/jwks/remote.js\",\"workerd\":\"./dist/browser/jwks/remote.js\",\"import\":\"./dist/node/esm/jwks/remote.js\",\"require\":\"./dist/node/cjs/jwks/remote.js\"},\"./jwks/local\":{\"types\":\"./dist/types/jwks/local.d.ts\",\"bun\":\"./dist/browser/jwks/local.js\",\"deno\":\"./dist/browser/jwks/local.js\",\"browser\":\"./dist/browser/jwks/local.js\",\"worker\":\"./dist/browser/jwks/local.js\",\"workerd\":\"./dist/browser/jwks/local.js\",\"import\":\"./dist/node/esm/jwks/local.js\",\"require\":\"./dist/node/cjs/jwks/local.js\"},\"./jwt/sign\":{\"types\":\"./dist/types/jwt/sign.d.ts\",\"bun\":\"./dist/browser/jwt/sign.js\",\"deno\":\"./dist/browser/jwt/sign.js\",\"browser\":\"./dist/browser/jwt/sign.js\",\"worker\":\"./dist/browser/jwt/sign.js\",\"workerd\":\"./dist/browser/jwt/sign.js\",\"import\":\"./dist/node/esm/jwt/sign.js\",\"require\":\"./dist/node/cjs/jwt/sign.js\"},\"./jwt/verify\":{\"types\":\"./dist/types/jwt/verify.d.ts\",\"bun\":\"./dist/browser/jwt/verify.js\",\"deno\":\"./dist/browser/jwt/verify.js\",\"browser\":\"./dist/browser/jwt/verify.js\",\"worker\":\"./dist/browser/jwt/verify.js\",\"workerd\":\"./dist/browser/jwt/verify.js\",\"import\":\"./dist/node/esm/jwt/verify.js\",\"require\":\"./dist/node/cjs/jwt/verify.js\"},\"./jwt/encrypt\":{\"types\":\"./dist/types/jwt/encrypt.d.ts\",\"bun\":\"./dist/browser/jwt/encrypt.js\",\"deno\":\"./dist/browser/jwt/encrypt.js\",\"browser\":\"./dist/browser/jwt/encrypt.js\",\"worker\":\"./dist/browser/jwt/encrypt.js\",\"workerd\":\"./dist/browser/jwt/encrypt.js\",\"import\":\"./dist/node/esm/jwt/encrypt.js\",\"require\":\"./dist/node/cjs/jwt/encrypt.js\"},\"./jwt/decrypt\":{\"types\":\"./dist/types/jwt/decrypt.d.ts\",\"bun\":\"./dist/browser/jwt/decrypt.js\",\"deno\":\"./dist/browser/jwt/decrypt.js\",\"browser\":\"./dist/browser/jwt/decrypt.js\",\"worker\":\"./dist/browser/jwt/decrypt.js\",\"workerd\":\"./dist/browser/jwt/decrypt.js\",\"import\":\"./dist/node/esm/jwt/decrypt.js\",\"require\":\"./dist/node/cjs/jwt/decrypt.js\"},\"./jwt/unsecured\":{\"types\":\"./dist/types/jwt/unsecured.d.ts\",\"bun\":\"./dist/browser/jwt/unsecured.js\",\"deno\":\"./dist/browser/jwt/unsecured.js\",\"browser\":\"./dist/browser/jwt/unsecured.js\",\"worker\":\"./dist/browser/jwt/unsecured.js\",\"workerd\":\"./dist/browser/jwt/unsecured.js\",\"import\":\"./dist/node/esm/jwt/unsecured.js\",\"require\":\"./dist/node/cjs/jwt/unsecured.js\"},\"./jwt/decode\":{\"types\":\"./dist/types/util/decode_jwt.d.ts\",\"bun\":\"./dist/browser/util/decode_jwt.js\",\"deno\":\"./dist/browser/util/decode_jwt.js\",\"browser\":\"./dist/browser/util/decode_jwt.js\",\"worker\":\"./dist/browser/util/decode_jwt.js\",\"workerd\":\"./dist/browser/util/decode_jwt.js\",\"import\":\"./dist/node/esm/util/decode_jwt.js\",\"require\":\"./dist/node/cjs/util/decode_jwt.js\"},\"./decode/protected_header\":{\"types\":\"./dist/types/util/decode_protected_header.d.ts\",\"bun\":\"./dist/browser/util/decode_protected_header.js\",\"deno\":\"./dist/browser/util/decode_protected_header.js\",\"browser\":\"./dist/browser/util/decode_protected_header.js\",\"worker\":\"./dist/browser/util/decode_protected_header.js\",\"workerd\":\"./dist/browser/util/decode_protected_header.js\",\"import\":\"./dist/node/esm/util/decode_protected_header.js\",\"require\":\"./dist/node/cjs/util/decode_protected_header.js\"},\"./jws/compact/sign\":{\"types\":\"./dist/types/jws/compact/sign.d.ts\",\"bun\":\"./dist/browser/jws/compact/sign.js\",\"deno\":\"./dist/browser/jws/compact/sign.js\",\"browser\":\"./dist/browser/jws/compact/sign.js\",\"worker\":\"./dist/browser/jws/compact/sign.js\",\"workerd\":\"./dist/browser/jws/compact/sign.js\",\"import\":\"./dist/node/esm/jws/compact/sign.js\",\"require\":\"./dist/node/cjs/jws/compact/sign.js\"},\"./jws/compact/verify\":{\"types\":\"./dist/types/jws/compact/verify.d.ts\",\"bun\":\"./dist/browser/jws/compact/verify.js\",\"deno\":\"./dist/browser/jws/compact/verify.js\",\"browser\":\"./dist/browser/jws/compact/verify.js\",\"worker\":\"./dist/browser/jws/compact/verify.js\",\"workerd\":\"./dist/browser/jws/compact/verify.js\",\"import\":\"./dist/node/esm/jws/compact/verify.js\",\"require\":\"./dist/node/cjs/jws/compact/verify.js\"},\"./jws/flattened/sign\":{\"types\":\"./dist/types/jws/flattened/sign.d.ts\",\"bun\":\"./dist/browser/jws/flattened/sign.js\",\"deno\":\"./dist/browser/jws/flattened/sign.js\",\"browser\":\"./dist/browser/jws/flattened/sign.js\",\"worker\":\"./dist/browser/jws/flattened/sign.js\",\"workerd\":\"./dist/browser/jws/flattened/sign.js\",\"import\":\"./dist/node/esm/jws/flattened/sign.js\",\"require\":\"./dist/node/cjs/jws/flattened/sign.js\"},\"./jws/flattened/verify\":{\"types\":\"./dist/types/jws/flattened/verify.d.ts\",\"bun\":\"./dist/browser/jws/flattened/verify.js\",\"deno\":\"./dist/browser/jws/flattened/verify.js\",\"browser\":\"./dist/browser/jws/flattened/verify.js\",\"worker\":\"./dist/browser/jws/flattened/verify.js\",\"workerd\":\"./dist/browser/jws/flattened/verify.js\",\"import\":\"./dist/node/esm/jws/flattened/verify.js\",\"require\":\"./dist/node/cjs/jws/flattened/verify.js\"},\"./jws/general/sign\":{\"types\":\"./dist/types/jws/general/sign.d.ts\",\"bun\":\"./dist/browser/jws/general/sign.js\",\"deno\":\"./dist/browser/jws/general/sign.js\",\"browser\":\"./dist/browser/jws/general/sign.js\",\"worker\":\"./dist/browser/jws/general/sign.js\",\"workerd\":\"./dist/browser/jws/general/sign.js\",\"import\":\"./dist/node/esm/jws/general/sign.js\",\"require\":\"./dist/node/cjs/jws/general/sign.js\"},\"./jws/general/verify\":{\"types\":\"./dist/types/jws/general/verify.d.ts\",\"bun\":\"./dist/browser/jws/general/verify.js\",\"deno\":\"./dist/browser/jws/general/verify.js\",\"browser\":\"./dist/browser/jws/general/verify.js\",\"worker\":\"./dist/browser/jws/general/verify.js\",\"workerd\":\"./dist/browser/jws/general/verify.js\",\"import\":\"./dist/node/esm/jws/general/verify.js\",\"require\":\"./dist/node/cjs/jws/general/verify.js\"},\"./jwe/compact/encrypt\":{\"types\":\"./dist/types/jwe/compact/encrypt.d.ts\",\"bun\":\"./dist/browser/jwe/compact/encrypt.js\",\"deno\":\"./dist/browser/jwe/compact/encrypt.js\",\"browser\":\"./dist/browser/jwe/compact/encrypt.js\",\"worker\":\"./dist/browser/jwe/compact/encrypt.js\",\"workerd\":\"./dist/browser/jwe/compact/encrypt.js\",\"import\":\"./dist/node/esm/jwe/compact/encrypt.js\",\"require\":\"./dist/node/cjs/jwe/compact/encrypt.js\"},\"./jwe/compact/decrypt\":{\"types\":\"./dist/types/jwe/compact/decrypt.d.ts\",\"bun\":\"./dist/browser/jwe/compact/decrypt.js\",\"deno\":\"./dist/browser/jwe/compact/decrypt.js\",\"browser\":\"./dist/browser/jwe/compact/decrypt.js\",\"worker\":\"./dist/browser/jwe/compact/decrypt.js\",\"workerd\":\"./dist/browser/jwe/compact/decrypt.js\",\"import\":\"./dist/node/esm/jwe/compact/decrypt.js\",\"require\":\"./dist/node/cjs/jwe/compact/decrypt.js\"},\"./jwe/flattened/encrypt\":{\"types\":\"./dist/types/jwe/flattened/encrypt.d.ts\",\"bun\":\"./dist/browser/jwe/flattened/encrypt.js\",\"deno\":\"./dist/browser/jwe/flattened/encrypt.js\",\"browser\":\"./dist/browser/jwe/flattened/encrypt.js\",\"worker\":\"./dist/browser/jwe/flattened/encrypt.js\",\"workerd\":\"./dist/browser/jwe/flattened/encrypt.js\",\"import\":\"./dist/node/esm/jwe/flattened/encrypt.js\",\"require\":\"./dist/node/cjs/jwe/flattened/encrypt.js\"},\"./jwe/flattened/decrypt\":{\"types\":\"./dist/types/jwe/flattened/decrypt.d.ts\",\"bun\":\"./dist/browser/jwe/flattened/decrypt.js\",\"deno\":\"./dist/browser/jwe/flattened/decrypt.js\",\"browser\":\"./dist/browser/jwe/flattened/decrypt.js\",\"worker\":\"./dist/browser/jwe/flattened/decrypt.js\",\"workerd\":\"./dist/browser/jwe/flattened/decrypt.js\",\"import\":\"./dist/node/esm/jwe/flattened/decrypt.js\",\"require\":\"./dist/node/cjs/jwe/flattened/decrypt.js\"},\"./jwe/general/encrypt\":{\"types\":\"./dist/types/jwe/general/encrypt.d.ts\",\"bun\":\"./dist/browser/jwe/general/encrypt.js\",\"deno\":\"./dist/browser/jwe/general/encrypt.js\",\"browser\":\"./dist/browser/jwe/general/encrypt.js\",\"worker\":\"./dist/browser/jwe/general/encrypt.js\",\"workerd\":\"./dist/browser/jwe/general/encrypt.js\",\"import\":\"./dist/node/esm/jwe/general/encrypt.js\",\"require\":\"./dist/node/cjs/jwe/general/encrypt.js\"},\"./jwe/general/decrypt\":{\"types\":\"./dist/types/jwe/general/decrypt.d.ts\",\"bun\":\"./dist/browser/jwe/general/decrypt.js\",\"deno\":\"./dist/browser/jwe/general/decrypt.js\",\"browser\":\"./dist/browser/jwe/general/decrypt.js\",\"worker\":\"./dist/browser/jwe/general/decrypt.js\",\"workerd\":\"./dist/browser/jwe/general/decrypt.js\",\"import\":\"./dist/node/esm/jwe/general/decrypt.js\",\"require\":\"./dist/node/cjs/jwe/general/decrypt.js\"},\"./errors\":{\"types\":\"./dist/types/util/errors.d.ts\",\"bun\":\"./dist/browser/util/errors.js\",\"deno\":\"./dist/browser/util/errors.js\",\"browser\":\"./dist/browser/util/errors.js\",\"worker\":\"./dist/browser/util/errors.js\",\"workerd\":\"./dist/browser/util/errors.js\",\"import\":\"./dist/node/esm/util/errors.js\",\"require\":\"./dist/node/cjs/util/errors.js\"},\"./base64url\":{\"types\":\"./dist/types/util/base64url.d.ts\",\"bun\":\"./dist/browser/util/base64url.js\",\"deno\":\"./dist/browser/util/base64url.js\",\"browser\":\"./dist/browser/util/base64url.js\",\"worker\":\"./dist/browser/util/base64url.js\",\"workerd\":\"./dist/browser/util/base64url.js\",\"import\":\"./dist/node/esm/util/base64url.js\",\"require\":\"./dist/node/cjs/util/base64url.js\"},\"./package.json\":\"./package.json\"}"),
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
}, Bi = {
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
		mocha: "nyc ./node_modules/mocha/bin/_mocha -- \"test/**/*.js\"",
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
	engines: { node: ">= 8" }
}, Vi = {
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
	bugs: { url: "https://github.com/microsoft/node-jsonc-parser/issues" },
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
}, Hi = {
	name: "lru-cache",
	publishConfig: { tag: "legacy-v10" },
	description: "A cache object that deletes the least-recently-used items.",
	version: "10.4.3",
	author: "Isaac Z. Schlueter <i@izs.me>",
	keywords: [
		"mru",
		"lru",
		"cache"
	],
	sideEffects: !1,
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
	tshy: { exports: {
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
	} },
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
	files: ["dist"],
	prettier: {
		semi: !1,
		printWidth: 70,
		tabWidth: 2,
		useTabs: !1,
		singleQuote: !0,
		jsxSingleQuote: !1,
		bracketSameLine: !0,
		arrowParens: "avoid",
		endOfLine: "lf"
	},
	tap: {
		"node-arg": ["--expose-gc"],
		plugin: ["@tapjs/clock"]
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
}, Ui = {
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
	files: ["dist"],
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
	engines: { node: "18 || 20 || >=22" },
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
	funding: { url: "https://github.com/sponsors/isaacs" },
	license: "BlueOak-1.0.0",
	tshy: {
		exports: {
			"./package.json": "./package.json",
			".": "./src/index.ts"
		},
		selfLink: !1
	},
	type: "module",
	module: "./dist/esm/index.js",
	dependencies: { "brace-expansion": "^5.0.8" }
}, Wi = {
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
	c8: { exclude: ["test/**", "vendor/**"] },
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
	standard: { ignore: ["dist", "vendor"] },
	directories: { test: "test" },
	repository: {
		type: "git",
		url: "git+https://github.com/multiformats/js-multiformats.git"
	},
	bugs: { url: "https://github.com/multiformats/js-multiformats/issues" },
	homepage: "https://github.com/multiformats/js-multiformats#readme",
	typesVersions: { "*": {
		"*": ["types/src/*"],
		"types/*": ["types/*"]
	} },
	release: {
		branches: ["master"],
		plugins: [
			["@semantic-release/commit-analyzer", {
				preset: "conventionalcommits",
				releaseRules: [
					{
						breaking: !0,
						release: "major"
					},
					{
						revert: !0,
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
						release: !1
					}
				]
			}],
			["@semantic-release/release-notes-generator", {
				preset: "conventionalcommits",
				presetConfig: { types: [
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
				] }
			}],
			"@semantic-release/changelog",
			["@semantic-release/npm", { pkgRoot: "dist" }],
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
}, Gi = {
	name: "on-exit-leak-free",
	version: "2.1.2",
	description: "Execute a function on exit without leaking memory, allowing all objects to be garbage collected",
	main: "index.js",
	scripts: { test: "standard | snazzy && tap test/*.js" },
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
	bugs: { url: "https://github.com/mcollina/on-exit-or-gc/issues" },
	homepage: "https://github.com/mcollina/on-exit-or-gc#readme",
	devDependencies: {
		snazzy: "^9.0.0",
		standard: "^17.0.0",
		tap: "^16.0.0"
	},
	engines: { node: ">=14.0.0" }
}, Ki = {
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
	devDependencies: { tape: "^4.9.0" },
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
	scripts: { test: "node test" }
}, qi = {
	name: "picomatch",
	description: "Blazing fast and accurate glob matcher written in JavaScript, with no dependencies and full support for standard and extended Bash glob features, including braces, extglobs, POSIX brackets, and regular expressions.",
	version: "4.0.7",
	homepage: "https://github.com/micromatch/picomatch",
	author: "Jon Schlinkert (https://github.com/jonschlinkert)",
	funding: "https://github.com/sponsors/jonschlinkert",
	repository: "micromatch/picomatch",
	bugs: { url: "https://github.com/micromatch/picomatch/issues" },
	license: "MIT",
	files: [
		"index.js",
		"posix.js",
		"lib"
	],
	sideEffects: !1,
	main: "index.js",
	engines: { node: ">=12" },
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
	nyc: { reporter: [
		"html",
		"lcov",
		"text-summary",
		"cobertura"
	] },
	verb: {
		toc: {
			render: !0,
			method: "preWrite",
			maxdepth: 3
		},
		layout: "empty",
		tasks: ["readme"],
		plugins: ["gulp-format-md"],
		lint: { reflinks: !0 },
		related: { list: ["braces", "micromatch"] },
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
}, Ji = {
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
	bin: { pino: "./bin.js" },
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
	bugs: { url: "https://github.com/pinojs/pino/issues" },
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
	tsd: { directory: "test/types" }
}, Yi = {
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
	keywords: ["pino", "transport"],
	author: "Matteo Collina <hello@matteocollina.com>",
	license: "MIT",
	bugs: { url: "https://github.com/pinojs/pino-abstract-transport/issues" },
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
	tsd: { directory: "./test/types" }
}, Xi = {
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
	keywords: ["pino", "logging"],
	author: "James Sumners <james.sumners@gmail.com>",
	license: "MIT",
	bugs: { url: "https://github.com/pinojs/pino-std-serializers/issues" },
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
	tsd: { directory: "test/types" }
}, Zi = {
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
	engines: { node: ">=14" },
	files: /* @__PURE__ */ "LICENSE,README.md,THIRD-PARTY-NOTICES.md,bin/prettier.cjs,doc.d.ts,doc.js,doc.mjs,index.cjs,index.d.ts,index.d.ts,index.mjs,internal/experimental-cli-worker.mjs,internal/experimental-cli.mjs,internal/legacy-cli.mjs,package.json,plugins/acorn.d.ts,plugins/acorn.js,plugins/acorn.mjs,plugins/angular.d.ts,plugins/angular.js,plugins/angular.mjs,plugins/babel.d.ts,plugins/babel.js,plugins/babel.mjs,plugins/estree.d.ts,plugins/estree.js,plugins/estree.mjs,plugins/flow.d.ts,plugins/flow.js,plugins/flow.mjs,plugins/glimmer.d.ts,plugins/glimmer.js,plugins/glimmer.mjs,plugins/graphql.d.ts,plugins/graphql.js,plugins/graphql.mjs,plugins/html.d.ts,plugins/html.js,plugins/html.mjs,plugins/markdown.d.ts,plugins/markdown.js,plugins/markdown.mjs,plugins/meriyah.d.ts,plugins/meriyah.js,plugins/meriyah.mjs,plugins/postcss.d.ts,plugins/postcss.js,plugins/postcss.mjs,plugins/typescript.d.ts,plugins/typescript.js,plugins/typescript.mjs,plugins/yaml.d.ts,plugins/yaml.js,plugins/yaml.mjs,standalone.d.ts,standalone.js,standalone.mjs".split(","),
	preferUnplugged: !0,
	sideEffects: !1,
	type: "commonjs",
	publishConfig: {
		access: "public",
		registry: "https://registry.npmjs.org/"
	}
}, Qi = {
	author: "Roman Shtylman <shtylman@gmail.com>",
	name: "process",
	description: "process information for node.js and browsers",
	keywords: ["process"],
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
	engines: { node: ">= 0.6.0" },
	devDependencies: {
		mocha: "2.2.1",
		zuul: "^3.10.3"
	}
}, $i = {
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
	bugs: { url: "https://github.com/fastify/fastify-warning/issues" },
	homepage: "https://github.com/fastify/fastify-warning#readme",
	devDependencies: {
		benchmark: "^2.1.4",
		jest: "^29.0.1",
		standard: "^17.0.0",
		tap: "^16.3.0",
		tsd: "^0.29.0"
	}
}, ea = {
	name: "quick-format-unescaped",
	version: "4.0.4",
	description: "Solves a problem with util.format",
	main: "index.js",
	directories: { test: "test" },
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
	bugs: { url: "https://github.com/davidmarkclements/quick-format/issues" },
	homepage: "https://github.com/davidmarkclements/quick-format#readme"
}, ta = {
	name: "readable-stream",
	version: "4.7.0",
	description: "Node.js Streams, a user-land copy of the stream library from Node.js",
	homepage: "https://github.com/nodejs/readable-stream",
	license: "MIT",
	licenses: [{
		type: "MIT",
		url: "https://choosealicense.com/licenses/mit/"
	}],
	keywords: [
		"readable",
		"stream",
		"pipe"
	],
	repository: {
		type: "git",
		url: "git://github.com/nodejs/readable-stream"
	},
	bugs: { url: "https://github.com/nodejs/readable-stream/issues" },
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
	engines: { node: "^12.22.0 || ^14.17.0 || >=16.0.0" }
}, na = {
	name: "real-require",
	version: "0.2.0",
	description: "Keep require and import consistent after bundling or transpiling",
	author: "Paolo Insogna <shogun@cowtech.it>",
	homepage: "https://github.com/pinojs/real-require",
	contributors: [{
		name: "Paolo Insogna",
		url: "https://github.com/ShogunPanda"
	}],
	license: "MIT",
	repository: {
		type: "git",
		url: "git+https://github.com/pinojs/real-require.git"
	},
	bugs: { url: "https://github.com/pinojs/real-require/issues" },
	main: "src/index.js",
	files: ["src"],
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
	engines: { node: ">= 12.13.0" }
}, ra = {
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
	contributors: [{
		name: "Troy Goode",
		email: "troygoode@gmail.com",
		web: "http://github.com/troygoode/"
	}],
	license: "MIT",
	bugs: { url: "http://github.com/troygoode/node-require-directory/issues/" },
	engines: { node: ">=0.10.0" },
	devDependencies: {
		jshint: "^2.6.0",
		mocha: "^2.1.0"
	},
	scripts: {
		test: "mocha",
		lint: "jshint index.js test/test.js"
	}
}, ia = {
	name: "safe-buffer",
	description: "Safer Node.js Buffer API",
	version: "5.2.1",
	author: {
		name: "Feross Aboukhadijeh",
		email: "feross@feross.org",
		url: "https://feross.org"
	},
	bugs: { url: "https://github.com/feross/safe-buffer/issues" },
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
	scripts: { test: "standard && tape test/*.js" },
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
}, aa = {
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
	engines: { node: ">=10" },
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
	bugs: { url: "https://github.com/BridgeAR/safe-stable-stringify/issues" },
	homepage: "https://github.com/BridgeAR/safe-stable-stringify#readme"
}, oa = {
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
	bugs: { url: "https://github.com/pinojs/sonic-boom/issues" },
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
	dependencies: { "atomic-sleep": "^1.0.0" },
	tsd: { directory: "./types" }
}, sa = {
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
	"pre-commit": ["test"],
	website: "https://github.com/mcollina/split2",
	repository: {
		type: "git",
		url: "https://github.com/mcollina/split2.git"
	},
	bugs: { url: "http://github.com/mcollina/split2/issues" },
	engines: { node: ">= 10.x" },
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
}, ca = {
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
	engines: { node: ">=8" },
	scripts: { test: "xo && ava && tsd" },
	files: ["index.js", "index.d.ts"],
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
}, la = {
	name: "string_decoder",
	version: "1.3.0",
	description: "The string_decoder module from Node core",
	main: "lib/string_decoder.js",
	files: ["lib"],
	dependencies: { "safe-buffer": "~5.2.0" },
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
}, ua = {
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
	engines: { node: ">=8" },
	scripts: { test: "xo && ava && tsd" },
	files: ["index.js", "index.d.ts"],
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
	dependencies: { "ansi-regex": "^5.0.1" },
	devDependencies: {
		ava: "^2.4.0",
		tsd: "^0.10.0",
		xo: "^0.25.3"
	}
}, da = {
	name: "thread-stream",
	version: "2.7.0",
	description: "A streaming way to send data to a Node.js Worker Thread",
	main: "index.js",
	types: "index.d.ts",
	dependencies: { "real-require": "^0.2.0" },
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
		test: "standard && npm run transpile && tap \"test/**/*.test.*js\" && tap --ts test/*.test.*ts",
		"test:ci": "standard && npm run transpile && npm run test:ci:js && npm run test:ci:ts",
		"test:ci:js": "tap --no-check-coverage --timeout=120 --coverage-report=lcovonly \"test/**/*.test.*js\"",
		"test:ci:ts": "tap --ts --no-check-coverage --coverage-report=lcovonly \"test/**/*.test.*ts\"",
		"test:yarn": "npm run transpile && tap \"test/**/*.test.js\" --no-check-coverage",
		transpile: "sh ./test/ts/transpile.sh",
		prepare: "husky install"
	},
	standard: { ignore: ["test/ts/**/*"] },
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
	bugs: { url: "https://github.com/mcollina/thread-stream/issues" },
	homepage: "https://github.com/mcollina/thread-stream#readme"
}, fa = {
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
	sideEffects: !1,
	files: ["dist"],
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
	bugs: { url: "https://github.com/SuperchupuDev/tinyglobby/issues" },
	homepage: "https://superchupu.dev/tinyglobby",
	funding: { url: "https://github.com/sponsors/SuperchupuDev" },
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
	engines: { node: ">=12.0.0" },
	scripts: {
		bench: "node benchmark/bench.ts",
		"bench:setup": "node benchmark/setup.ts",
		build: "tsdown",
		check: "biome check",
		"check:fix": "biome check --write --unsafe",
		format: "biome format --write",
		lint: "biome lint",
		test: "node --test \"test/**/*.ts\"",
		"test:coverage": "node --test --experimental-test-coverage \"test/**/*.ts\"",
		"test:only": "node --test --test-only \"test/**/*.ts\"",
		typecheck: "tsc --noEmit"
	}
}, pa = {
	name: "ts-morph",
	version: "27.0.2",
	description: "TypeScript compiler wrapper for static analysis and code manipulation.",
	main: "dist/ts-morph.js",
	types: "lib/ts-morph.d.ts",
	scripts: {
		dopublish: "deno task type-check-docs && deno task code-generate && deno task package && deno task publish-code-verification && echo \"Run: npm publish\"",
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
	bugs: { url: "https://github.com/dsherret/ts-morph/issues" },
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
		fs: !1,
		os: !1,
		"fs.realpath": !1,
		mkdirp: !1,
		"dir-glob": !1,
		"graceful-fs": !1,
		"source-map-support": !1,
		"glob-parent": !1,
		glob: !1,
		tinyglobby: !1
	}
}, ma = {
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
	bugs: { url: "https://github.com/Microsoft/TypeScript/issues" },
	repository: {
		type: "git",
		url: "https://github.com/Microsoft/tslib.git"
	},
	main: "tslib.js",
	module: "tslib.es6.js",
	"jsnext:main": "tslib.es6.js",
	typings: "tslib.d.ts",
	sideEffects: !1,
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
}, ha = {
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
	dependencies: { multiformats: "^9.4.2" },
	devDependencies: {
		aegir: "^35.0.0",
		util: "^0.12.4"
	},
	eslintConfig: {
		extends: "ipfs",
		parserOptions: { sourceType: "module" },
		ignorePatterns: ["!.aegir.js"]
	},
	typesVersions: { "*": { "*": ["types/src", "types/src/*"] } },
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
}, ga = {
	name: "undici",
	version: "6.29.0",
	description: "An HTTP/1.1 client, written from scratch for Node.js",
	homepage: "https://undici.nodejs.org",
	bugs: { url: "https://github.com/nodejs/undici/issues" },
	repository: {
		type: "git",
		url: "git+https://github.com/nodejs/undici.git"
	},
	license: "MIT",
	contributors: [
		{
			name: "Daniele Belardi",
			url: "https://github.com/dnlup",
			author: !0
		},
		{
			name: "Ethan Arrowood",
			url: "https://github.com/ethan-arrowood",
			author: !0
		},
		{
			name: "Matteo Collina",
			url: "https://github.com/mcollina",
			author: !0
		},
		{
			name: "Matthew Aitken",
			url: "https://github.com/KhafraDev",
			author: !0
		},
		{
			name: "Robert Nagy",
			url: "https://github.com/ronag",
			author: !0
		},
		{
			name: "Szymon Marczak",
			url: "https://github.com/szmarczak",
			author: !0
		},
		{
			name: "Tomas Della Vedova",
			url: "https://github.com/delvedor",
			author: !0
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
		"test:busboy": "borp -p \"test/busboy/*.js\"",
		"test:cache": "borp -p \"test/cache/*.js\"",
		"test:cookies": "borp -p \"test/cookie/*.js\"",
		"test:eventsource": "npm run build:node && npm run test:eventsource:nobuild",
		"test:eventsource:nobuild": "borp --expose-gc -p \"test/eventsource/*.js\"",
		"test:fuzzing": "node test/fuzzing/fuzzing.test.js",
		"test:fetch": "npm run build:node && npm run test:fetch:nobuild",
		"test:fetch:nobuild": "borp --timeout 180000 --expose-gc --concurrency 1 -p \"test/fetch/*.js\" && npm run test:webidl && npm run test:busboy",
		"test:h2": "npm run test:h2:core && npm run test:h2:fetch",
		"test:h2:core": "borp -p \"test/http2*.js\"",
		"test:h2:fetch": "npm run build:node && borp -p \"test/fetch/http2*.js\"",
		"test:interceptors": "borp -p \"test/interceptors/*.js\"",
		"test:jest": "cross-env NODE_V8_COVERAGE= jest",
		"test:unit": "borp --expose-gc -p \"test/*.js\"",
		"test:node-fetch": "borp -p \"test/node-fetch/**/*.js\"",
		"test:node-test": "borp -p \"test/node-test/**/*.js\"",
		"test:tdd": "borp --expose-gc -p \"test/*.js\"",
		"test:tdd:node-test": "borp -p \"test/node-test/**/*.js\" -w",
		"test:typescript": "tsd && tsc test/imports/undici-import.ts --typeRoots ./types && tsc ./types/*.d.ts --noEmit --typeRoots ./types",
		"test:webidl": "borp -p \"test/webidl/*.js\"",
		"test:websocket": "borp -p \"test/websocket/*.js\"",
		"test:websocket:autobahn": "node test/autobahn/client.js",
		"test:websocket:autobahn:report": "node test/autobahn/report.js",
		"test:wpt": "node test/wpt/start-fetch.mjs && node test/wpt/start-FileAPI.mjs && node test/wpt/start-mimesniff.mjs && node test/wpt/start-xhr.mjs && node test/wpt/start-websockets.mjs && node test/wpt/start-cacheStorage.mjs && node test/wpt/start-eventsource.mjs",
		"test:wpt:withoutintl": "node test/wpt/start-fetch.mjs && node test/wpt/start-mimesniff.mjs && node test/wpt/start-xhr.mjs && node test/wpt/start-cacheStorage.mjs && node test/wpt/start-eventsource.mjs",
		coverage: "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report",
		"coverage:ci": "npm run coverage:clean && cross-env NODE_V8_COVERAGE=./coverage/tmp npm run test:javascript && npm run coverage:report:ci",
		"coverage:clean": "node ./scripts/clean-coverage.js",
		"coverage:report": "cross-env NODE_V8_COVERAGE= c8 report",
		"coverage:report:ci": "c8 report",
		bench: "echo \"Error: Benchmarks have been moved to '/benchmarks'\" && exit 1",
		"serve:website": "echo \"Error: Documentation has been moved to '/docs'\" && exit 1",
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
	engines: { node: ">=18.17" },
	standard: {
		env: ["jest"],
		ignore: [
			"lib/llhttp/constants.js",
			"lib/llhttp/utils.js",
			"test/fixtures/wpt"
		]
	},
	tsd: {
		directory: "test/types",
		compilerOptions: {
			esModuleInterop: !0,
			lib: ["esnext"]
		}
	},
	jest: { testMatch: ["<rootDir>/test/jest/**"] }
}, _a = {
	name: "undici",
	version: "7.30.0",
	description: "An HTTP/1.1 client, written from scratch for Node.js",
	homepage: "https://undici.nodejs.org",
	bugs: { url: "https://github.com/nodejs/undici/issues" },
	repository: {
		type: "git",
		url: "git+https://github.com/nodejs/undici.git"
	},
	license: "MIT",
	contributors: [
		{
			name: "Daniele Belardi",
			url: "https://github.com/dnlup",
			author: !0
		},
		{
			name: "Ethan Arrowood",
			url: "https://github.com/ethan-arrowood",
			author: !0
		},
		{
			name: "Matteo Collina",
			url: "https://github.com/mcollina",
			author: !0
		},
		{
			name: "Matthew Aitken",
			url: "https://github.com/KhafraDev",
			author: !0
		},
		{
			name: "Robert Nagy",
			url: "https://github.com/ronag",
			author: !0
		},
		{
			name: "Szymon Marczak",
			url: "https://github.com/szmarczak",
			author: !0
		},
		{
			name: "Tomas Della Vedova",
			url: "https://github.com/delvedor",
			author: !0
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
		"test:busboy": "borp --timeout 180000 -p \"test/busboy/*.js\"",
		"test:cache": "borp --timeout 180000 -p \"test/cache/*.js\"",
		"test:cache-interceptor": "borp --timeout 180000 -p \"test/cache-interceptor/*.js\"",
		"test:cache-interceptor:sqlite": "cross-env NODE_OPTIONS=--experimental-sqlite npm run test:cache-interceptor",
		"test:cookies": "borp --timeout 180000 -p \"test/cookie/*.js\"",
		"test:eventsource": "npm run build:node && borp --timeout 180000 --expose-gc -p \"test/eventsource/*.js\"",
		"test:fuzzing": "node test/fuzzing/fuzzing.test.js",
		"test:fetch": "npm run build:node && borp --timeout 180000 --expose-gc --concurrency 1 -p \"test/fetch/*.js\" && npm run test:webidl && npm run test:busboy",
		"test:subresource-integrity": "borp --timeout 180000 -p \"test/subresource-integrity/*.js\"",
		"test:h2": "npm run test:h2:core && npm run test:h2:fetch",
		"test:h2:core": "borp --timeout 180000 -p \"test/+(http2|h2)*.js\"",
		"test:h2:fetch": "npm run build:node && borp --timeout 180000 -p \"test/fetch/http2*.js\"",
		"test:infra": "borp --timeout 180000 -p \"test/infra/*.js\"",
		"test:interceptors": "borp --timeout 180000 -p \"test/interceptors/*.js\"",
		"test:jest": "cross-env NODE_V8_COVERAGE= jest",
		"test:unit": "borp --timeout 180000 --expose-gc -p \"test/*.js\"",
		"test:node-fetch": "borp --timeout 180000 -p \"test/node-fetch/**/*.js\"",
		"test:node-test": "borp --timeout 180000 -p \"test/node-test/**/*.js\"",
		"test:tdd": "borp --timeout 180000 --expose-gc -p \"test/*.js\"",
		"test:tdd:node-test": "borp --timeout 180000 -p \"test/node-test/**/*.js\" -w",
		"test:typescript": "tsd && tsc test/imports/undici-import.ts --typeRoots ./types --noEmit && tsc ./types/*.d.ts --noEmit --typeRoots ./types",
		"test:webidl": "borp --timeout 180000 -p \"test/webidl/*.js\"",
		"test:websocket": "borp --timeout 180000 -p \"test/websocket/**/*.js\"",
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
		bench: "echo \"Error: Benchmarks have been moved to '/benchmarks'\" && exit 1",
		"serve:website": "echo \"Error: Documentation has been moved to '/docs'\" && exit 1",
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
	engines: { node: ">=20.18.1" },
	tsd: {
		directory: "test/types",
		compilerOptions: {
			esModuleInterop: !0,
			lib: ["esnext"]
		}
	},
	jest: { testMatch: ["<rootDir>/test/jest/**"] }
}, va = {
	name: "undici",
	version: "8.11.2",
	description: "An HTTP/1.1 client, written from scratch for Node.js",
	homepage: "https://undici.nodejs.org",
	bugs: { url: "https://github.com/nodejs/undici/issues" },
	repository: {
		type: "git",
		url: "git+https://github.com/nodejs/undici.git"
	},
	license: "MIT",
	contributors: [
		{
			name: "Daniele Belardi",
			url: "https://github.com/dnlup",
			author: !0
		},
		{
			name: "Ethan Arrowood",
			url: "https://github.com/ethan-arrowood",
			author: !0
		},
		{
			name: "Matteo Collina",
			url: "https://github.com/mcollina",
			author: !0
		},
		{
			name: "Matthew Aitken",
			url: "https://github.com/KhafraDev",
			author: !0
		},
		{
			name: "Robert Nagy",
			url: "https://github.com/ronag",
			author: !0
		},
		{
			name: "Szymon Marczak",
			url: "https://github.com/szmarczak",
			author: !0
		},
		{
			name: "Tomas Della Vedova",
			url: "https://github.com/delvedor",
			author: !0
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
		"test:busboy": "borp --timeout 180000 -p \"test/busboy/*.js\"",
		"test:cache": "borp --timeout 180000 -p \"test/cache/*.js\"",
		"test:cache-interceptor": "borp --timeout 180000 -p \"test/cache-interceptor/*.js\"",
		"test:cache-interceptor:sqlite": "cross-env NODE_OPTIONS=--experimental-sqlite npm run test:cache-interceptor",
		"test:cookies": "borp --timeout 180000 -p \"test/cookie/*.js\"",
		"test:eventsource": "npm run build:node && borp --timeout 180000 --expose-gc -p \"test/eventsource/*.js\"",
		"test:fuzzing": "node test/fuzzing/fuzzing.test.js",
		"test:fetch": "npm run build:node && borp --timeout 180000 --expose-gc --concurrency 1 -p \"test/fetch/*.js\" && npm run test:webidl && npm run test:busboy",
		"test:subresource-integrity": "borp --timeout 180000 -p \"test/subresource-integrity/*.js\"",
		"test:h2": "npm run test:h2:core && npm run test:h2:fetch",
		"test:h2:core": "borp --timeout 180000 -p \"test/+(http2|h2)*.js\"",
		"test:h2:fetch": "npm run build:node && borp --timeout 180000 -p \"test/fetch/http2*.js\"",
		"test:infra": "borp --timeout 180000 -p \"test/infra/*.js\"",
		"test:interceptors": "borp --timeout 180000 -p \"test/interceptors/*.js\"",
		"test:jest": "cross-env NODE_V8_COVERAGE= jest",
		"test:unit": "borp --timeout 180000 --expose-gc -p \"test/*.js\"",
		"test:node-fetch": "borp --timeout 180000 -p \"test/node-fetch/**/*.js\"",
		"test:node-test": "borp --timeout 180000 -p \"test/node-test/**/*.js\"",
		"test:tdd": "borp --timeout 180000 --expose-gc -p \"test/*.js\"",
		"test:tdd:node-test": "borp --timeout 180000 -p \"test/node-test/**/*.js\" -w",
		"test:typescript": "tsd && tsc test/imports/undici-import.ts --typeRoots ./types --noEmit && tsc ./types/*.d.ts --noEmit --typeRoots ./types",
		"test:webidl": "borp --timeout 180000 -p \"test/webidl/*.js\"",
		"test:websocket": "borp --timeout 180000 -p \"test/websocket/**/*.js\"",
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
		bench: "echo \"Error: Benchmarks have been moved to '/benchmarks'\" && exit 1",
		"serve:website": "echo \"Error: Documentation has been moved to '/docs'\" && exit 1",
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
	engines: { node: ">=22.19.0" },
	tsd: {
		directory: "test/types",
		compilerOptions: {
			esModuleInterop: !0,
			lib: ["esnext"]
		}
	},
	jest: { testMatch: ["<rootDir>/test/jest/**"] }
}, ya = {
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
	maintainers: [{
		email: "hey@hyeseong.kim",
		name: "Hyeseong Kim"
	}],
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
	imports: { "#src/*": "./src/*" },
	sideEffects: ["./intl-polyfill.js", "./intl-polyfill.cjs"],
	publishConfig: {
		access: "public",
		provenance: !0,
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
		clean: "rimraf -g \"*.js\" \"*.cjs\" \"*.map\" \"*.d.ts\" \"bundle\"",
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
	alias: { process: !1 },
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
}, ba = {
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
	exports: { ".": {
		import: {
			types: "./dist/index.d.mts",
			default: "./dist/index.mjs"
		},
		require: {
			types: "./dist/index.d.cts",
			default: "./dist/index.cjs"
		}
	} },
	sideEffects: !1,
	files: ["dist"],
	publishConfig: { access: "public" },
	scripts: {
		play: "tsm ./playground.ts",
		test: "vitest --typecheck",
		coverage: "vitest run --coverage --isolate",
		lint: "eslint \"src/**/*.ts*\" && tsc --noEmit && deno check ./src/index.ts",
		"lint.fix": "eslint \"src/**/*.ts*\" --fix",
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
	peerDependencies: { typescript: ">=5" },
	peerDependenciesMeta: { typescript: { optional: !0 } }
}, xa = {
	name: "varint",
	version: "6.0.0",
	description: "protobuf-style varint bytes - use msb to create integer values of varying sizes",
	main: "index.js",
	scripts: { test: "node test.js" },
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
	devDependencies: { tape: "~2.12.3" }
}, Sa = {
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
	engines: { node: ">=10" },
	scripts: { test: "xo && nyc ava" },
	files: ["index.js"],
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
}, Ca = {
	name: "y18n",
	version: "5.0.8",
	description: "the bare-bones internationalization library used by yargs",
	exports: { ".": [{
		import: "./index.mjs",
		require: "./build/index.cjs"
	}, "./build/index.cjs"] },
	type: "module",
	module: "./build/lib/index.js",
	keywords: [
		"i18n",
		"internationalization",
		"yargs"
	],
	homepage: "https://github.com/yargs/y18n",
	bugs: { url: "https://github.com/yargs/y18n/issues" },
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
	engines: { node: ">=10" },
	standardx: { ignore: ["build"] }
}, wa = {
	name: "yargs",
	version: "17.7.3",
	description: "yargs the modern, pirate-themed, successor to optimist.",
	main: "./index.cjs",
	exports: {
		"./package.json": "./package.json",
		".": [{
			import: "./index.mjs",
			require: "./index.cjs"
		}, "./index.cjs"],
		"./helpers": {
			import: "./helpers/helpers.mjs",
			require: "./helpers/index.js"
		},
		"./browser": {
			import: "./browser.mjs",
			types: "./browser.d.ts"
		},
		"./yargs": [{
			import: "./yargs.mjs",
			require: "./yargs.cjs"
		}, "./yargs.cjs"]
	},
	type: "module",
	module: "./index.mjs",
	contributors: [{
		name: "Yargs Contributors",
		url: "https://github.com/yargs/yargs/graphs/contributors"
	}],
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
	engines: { node: ">=12" }
}, Ta = {
	name: "yargs-parser",
	version: "21.1.1",
	description: "the mighty option parser used by yargs",
	main: "build/index.cjs",
	exports: {
		".": [{
			import: "./build/lib/index.js",
			require: "./build/index.cjs"
		}, "./build/index.cjs"],
		"./browser": ["./browser.js"]
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
	engines: { node: ">=12" },
	standardx: { ignore: ["build"] }
}, Ea = {
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
	sideEffects: !1,
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
		sourceDialects: ["@zod/source"]
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
	bugs: { url: "https://github.com/colinhacks/zod/issues" },
	support: { backing: { "npm-funding": !0 } },
	scripts: {
		clean: "git clean -xdf . -e node_modules",
		build: "zshy --project tsconfig.build.json",
		postbuild: "pnpm biome check --write .",
		"test:watch": "pnpm vitest",
		test: "pnpm vitest run",
		"bump:beta": "pnpm version \"v$(pnpm pkg get version | jq -r)-beta.$(date +%Y%m%dT%H%M%S)\"",
		"pub:beta": "pnpm bump:beta && pnpm publish --tag next --publish-branch v4 --no-git-checks --dry-run"
	}
}, Da = {
	profile: "atseq-app-v2",
	approval: "A1 official OAuth Node/browser 0.5.8 family and C1–C6 under ratified f3c65906 and manifest clarification 862135c7; preserved I1 foundation files; exact-head conformance required; semantic contracts unchanged",
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
	packages: /* @__PURE__ */ JSON.parse("{\"node_modules/@atcute/car\":{\"version\":\"6.1.0\",\"integrity\":\"sha512-Dp7MlyI3YT7NiIUK6bm2ZyA95Pdun+DuFlcr40ZsGdqhOkKrctZT7wMZXSs6IYd7RorjSnddEJDh51hqrkNSPQ==\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/uint8array\":\"^1.2.0\",\"@atcute/varint\":\"^2.0.2\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.0.0\"}},\"node_modules/@atcute/cbor\":{\"version\":\"2.3.8\",\"integrity\":\"sha512-gazXBcNTr2U3cRaCjfRbq2GKHJnWapUUA3mgehL+0tbVXEty2wf/LIwF9z46gjqjX2DYGGwkybF8lTI3dzHaNQ==\",\"dependencies\":{\"@atcute/cid\":\"^2.5.0\",\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cid\":\"^2.5.0\"}},\"node_modules/@atcute/cid\":{\"version\":\"2.5.0\",\"integrity\":\"sha512-CAZyzUdaQhuC+S7tGjoC7vgyDI2X4JU+CPO/7WjEU7HlNsAGXjSkD++5TlfnSWGDqUeqpjMZjUfFBZYHKzPHew==\",\"dependencies\":{\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.2.0\"}},\"node_modules/@atcute/crypto\":{\"version\":\"2.4.4\",\"integrity\":\"sha512-Yc7lXz4ndDjbs+/WrKeGS+sVEr+sx8xi5zSVInKNl0FAEY6KbvcT+bjaU9A3erUVviFp9yEcu/1aSg/f+GPpBg==\",\"dependencies\":{\"@noble/secp256k1\":\"^3.1.0\",\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.1.5\"}},\"node_modules/@atcute/did-plc\":{\"version\":\"1.0.2\",\"integrity\":\"sha512-z/gltUzhSeHN2LKosOsU5Fo8uS4p7c7oDydEDQcFK2DwM1u1jHghc5kYaKOQcriOcLXzf9/OetKQOU4P57uhVA==\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.7\",\"@atcute/cid\":\"^2.4.2\",\"@atcute/crypto\":\"^2.4.4\",\"@atcute/identity\":\"^2.0.2\",\"@atcute/lexicons\":\"^2.1.0\",\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.1.5\",\"@atcute/util-fetch\":\"^2.0.2\",\"valibot\":\"^1.5.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.0.0\",\"@atcute/identity\":\"^2.0.0\",\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/identity\":{\"version\":\"2.0.2\",\"integrity\":\"sha512-amr/EQceqVtBVmjBK4uUF7nKKYuRttadigpvOcAn4dnO6SNSwSjQi8KDH9LnukEotPsSP4UDsQvNfHWEoUcslw==\",\"dependencies\":{\"valibot\":\"^1.4.2\",\"@atcute/lexicons\":\"^2.0.3\"},\"peerDependencies\":{\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/lexicons\":{\"version\":\"2.1.1\",\"integrity\":\"sha512-kHyqUW8g/Fq9LTctGh0TVBx0AmtecV6VSrRprrSbqKqHe9q8C6y+YPL3EMNq2l93XA1iDHkkvYwLdTcKL/lNbA==\",\"dependencies\":{\"@atcute/uint8array\":\"^1.1.5\",\"@atcute/util-text\":\"^1.3.4\",\"@oomfware/eval\":\"^0.1.0\",\"@standard-schema/spec\":\"^1.1.0\",\"esm-env\":\"^1.2.2\"}},\"node_modules/@atcute/mst\":{\"version\":\"1.1.1\",\"integrity\":\"sha512-QWoW69Pg5RWrc0B98Cp5K4UjeXI+2vzBrWmoBUW4nSR51LsamOnG9HsWovcOoCRhnj1ZYAMlnAc5Eh8+gJFoSA==\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.5.0\"}},\"node_modules/@atcute/multibase\":{\"version\":\"1.2.5\",\"integrity\":\"sha512-cReTONgYpQo/VHD3ZmzPNoyBKJgSk1J4h//cvvdVVJBMar+SjlQ/sUXeTjQfuyfmDKv+TLKhmutLcvbMcQ9Rvw==\",\"dependencies\":{\"@atcute/uint8array\":\"^1.1.5\"}},\"node_modules/@atcute/repo\":{\"version\":\"1.1.0\",\"integrity\":\"sha512-WXOh05E/NT39oqkNm3xIit4ysJIZxmkQ1GWOkwDNvTYIDW0CYqwThQ+837r72/Tr490E1Zvz09xOOjtx/XmlhA==\",\"dependencies\":{\"@atcute/car\":\"^6.1.0\",\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/crypto\":\"^2.4.4\",\"@atcute/lexicons\":\"^2.1.1\",\"@atcute/mst\":\"^1.1.1\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/uint8array\":{\"version\":\"1.2.0\",\"integrity\":\"sha512-KoBGTbV4lS8zXNu91osM3FecrH3NUnxNPsBAkaNtn6uf/p240245qoLn7keFpRM0npX522X8R+XBBb2rvtE7Rg==\"},\"node_modules/@atcute/util-fetch\":{\"version\":\"2.0.2\",\"integrity\":\"sha512-I0oenHlJjwRpWPyAJojox5H0z9NthhdMFaEjtkxyjo85VPPxk1vMJk/1ZjMJsrs1SgHhB3spazEWzV5DW8w70A==\",\"dependencies\":{\"valibot\":\"^1.4.2\"}},\"node_modules/@atcute/util-text\":{\"version\":\"1.3.4\",\"integrity\":\"sha512-u2UAM7iSM09sQaSG9jtxWFSPgB8boVj50/BoyMvYnhVgGBu+nXIuAcdDUQCsZA44YZgTPPhN/b86JX+jH7SPzQ==\",\"dependencies\":{\"unicode-segmenter\":\"^0.17.0\"}},\"node_modules/@atcute/util-text/node_modules/unicode-segmenter\":{\"version\":\"0.17.3\",\"integrity\":\"sha512-hKZwqBjJDmqNrq1+LjDxck1qLzJFcLLJM2Xq92ORRHOuau6GSHeELmn+uyk6zNH1CK9mogrUJGP9WJCJUQXMAw==\"},\"node_modules/@atcute/varint\":{\"version\":\"2.0.2\",\"integrity\":\"sha512-/+hS1juMgnmf6eL6lICUkTw7wcGTo3I+Q0L1PI521mUz77rGSC6nXAUNKtvm2wYJpuWdEGq+GILGoYkOArn0TQ==\"},\"node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.2.6\",\"integrity\":\"sha512-2K1bC04nI2fmgNcvof+yA28IhGlpWn2JKYlPa7To9JTKI45FINCGkQSGiL2nyXlyzDJJ34fZ1aq6/IRFIOIiqg==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto-labs/fetch\":\"0.2.3\",\"@atproto-labs/pipe\":\"0.1.1\",\"@atproto-labs/simple-store\":\"0.3.0\",\"@atproto-labs/simple-store-memory\":\"0.1.4\",\"@atproto/did\":\"0.3.0\"}},\"node_modules/@atproto-labs/fetch\":{\"version\":\"0.2.3\",\"integrity\":\"sha512-NZtbJOCbxKUFRFKMpamT38PUQMY0hX0p7TG5AEYOPhZKZEP7dHZ1K2s1aB8MdVH0qxmqX7nQleNrrvLf09Zfdw==\",\"dependencies\":{\"@atproto-labs/pipe\":\"0.1.1\"}},\"node_modules/@atproto-labs/fetch-node\":{\"version\":\"0.4.0\",\"integrity\":\"sha512-5Yi8fz/JDGEoObRgRJuglcodB/MJeQnnoqokOGSQK5ItISObSttbGIgHE1UMU1njcwxbvKtbGMWHUCRgqML2Dw==\",\"dependencies\":{\"ipaddr.js\":\"^2.1.0\",\"undici_v6\":\"npm:undici@^6.x\",\"undici_v7\":\"npm:undici@^7.x\",\"undici_v8\":\"npm:undici@^8.x\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\"}},\"node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"}},\"node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\"},\"node_modules/@atproto-labs/handle-resolver\":{\"version\":\"0.4.10\",\"integrity\":\"sha512-hsYYvGhi6Tv6f4Fti//i/vllVIb/wrJaOcbT3Yh7oo10VxBKAyxzVaB7mIJcho2YJ5kHd2kbCYYPWLw8pvm/bg==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"@atproto-labs/simple-store\":\"^0.5.1\"}},\"node_modules/@atproto-labs/handle-resolver-node\":{\"version\":\"0.2.11\",\"integrity\":\"sha512-stwXuolGIs8ULdLRCwr616A4268CP2jTYOKZOlR7rzMLKjMNaxYVFktbqWUtqKq1nqdqaKxSk+MZNTFrqCjaHQ==\",\"dependencies\":{\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto-labs/fetch-node\":\"^0.4.0\",\"@atproto/did\":\"^0.5.6\"}},\"node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\"},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"dependencies\":{\"lru-cache\":\"^10.2.0\",\"@atproto-labs/simple-store\":\"^0.5.1\"}},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto-labs/identity-resolver\":{\"version\":\"0.4.10\",\"integrity\":\"sha512-deKu7csOsM8lnIRnLa97te6ODIUx0Lm3Srxid/Ix+UYQqFKA0sIpfYmHZduAK7B+aTqiPcHjoA9Y/qpJyzgnMw==\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver\":\"^0.4.10\"}},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\"}},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"}},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\"},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\"},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"dependencies\":{\"lru-cache\":\"^10.2.0\",\"@atproto-labs/simple-store\":\"^0.5.1\"}},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto-labs/pipe\":{\"version\":\"0.1.1\",\"integrity\":\"sha512-hdNw2oUs2B6BN1lp+32pF7cp8EMKuIN5Qok2Vvv/aOpG/3tNSJ9YkvfI0k6Zd188LeDDYRUpYpxcoFIcGH/FNg==\"},\"node_modules/@atproto-labs/simple-store\":{\"version\":\"0.3.0\",\"integrity\":\"sha512-nOb6ONKBRJHRlukW1sVawUkBqReLlLx6hT35VS3imaNPwiXDxLnTK7lxw3Lrl9k5yugSBDQAkZAq3MPTEFSUBQ==\"},\"node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.1.4\",\"integrity\":\"sha512-3mKY4dP8I7yKPFj9VKpYyCRzGJOi5CEpOLPlRhoJyLmgs3J4RzDrjn323Oakjz2Aj2JzRU/AIvWRAZVhpYNJHw==\",\"dependencies\":{\"lru-cache\":\"^10.2.0\",\"@atproto-labs/simple-store\":\"0.3.0\"}},\"node_modules/@atproto/common\":{\"version\":\"0.5.16\",\"integrity\":\"sha512-DTWgaVlDJN3zDxJ3agZK3pbiSZc+z8QQe9iy15sIuorLrceIp4kHXMO/QqjWBXnmLVTd6+/5BVDzex5amYc0rg==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"pino\":\"^8.21.0\",\"@atproto/common-web\":\"^0.4.20\",\"@atproto/lex-cbor\":\"^0.0.16\",\"@atproto/lex-data\":\"^0.0.15\"}},\"node_modules/@atproto/common-web\":{\"version\":\"0.5.10\",\"integrity\":\"sha512-w4JUdsJ3VXt8ewkavYh5m/u0UbxDtFdCKhNZPEpJ0U1vcWIjDaSInIexteETDgD7fBJAhidIEi30MGz1kk49ug==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/lex-data\":\"^0.1.7\",\"@atproto/lex-json\":\"^0.1.6\",\"@atproto/syntax\":\"^0.7.5\"}},\"node_modules/@atproto/common/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-cbor\":{\"version\":\"0.0.16\",\"integrity\":\"sha512-x3NTvOX5/4Wh7uk8RNJpUJqZjcWRSUYDYRJ6VZPLmp/CAnsMySmBAinBu/dva/1hqS3C1oiYz258x6bRYpKJ4w==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.15\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.15\"}},\"node_modules/@atproto/common/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/crypto\":{\"version\":\"0.4.5\",\"integrity\":\"sha512-n40aKkMoCatP0u9Yvhrdk6fXyOHFDDbkdm4h4HCyWW+KlKl8iXfD5iV+ECq+w5BM+QH25aIpt3/j6EUNerhLxw==\",\"dependencies\":{\"@noble/curves\":\"^1.7.0\",\"@noble/hashes\":\"^1.6.1\",\"uint8arrays\":\"3.0.0\"}},\"node_modules/@atproto/did\":{\"version\":\"0.3.0\",\"integrity\":\"sha512-raUPzUGegtW/6OxwCmM8bhZvuIMzxG5t9oWsth6Tp91Kb5fTnHV2h/KKNF1C82doeA4BdXCErTyg7ISwLbQkzA==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/jwk\":{\"version\":\"0.7.4\",\"integrity\":\"sha512-tq7TUDmNfe1yDfpRgdGQMJdl9TUlJmREQNCag9yg5w8Evu+TOiFiLgiOCbo7X4ouRPSgd1DpOzXbUa8UyKKMZA==\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/jwk-jose\":{\"version\":\"0.2.4\",\"integrity\":\"sha512-gzDoA0JTwnc0ZJOBLM7WX9xFxtynRS2K1Bofb8epzoMWDQvyvfbPcfkdPrKFM7NXCFUVpGpBnsCB8KFPTf1rCg==\",\"dependencies\":{\"jose\":\"^5.2.0\",\"@atproto/jwk\":\"^0.7.4\"}},\"node_modules/@atproto/jwk-webcrypto\":{\"version\":\"0.3.4\",\"integrity\":\"sha512-UsFIUozqnRecXPo6HgKV4PW4FqYHxX1V3iAe0rRV6Q2RSfYD8V2mZ89pv8NpvJynnaqJArBQ7HZlcg0F4tRYhA==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-jose\":\"^0.2.4\"}},\"node_modules/@atproto/jwk/node_modules/multiformats\":{\"version\":\"13.4.2\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\"},\"node_modules/@atproto/lex\":{\"version\":\"0.0.18\",\"integrity\":\"sha512-uHqtV2gZNYOkOYXq1t6wO2Nb0gFfGmi40AGCVbTNccIkHsZvxRuLlaNuNrBFB+5h/HzlVeMwjBUf0ny3jD4hXw==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"yargs\":\"^17.0.0\",\"@atproto/lex-builder\":\"^0.0.16\",\"@atproto/lex-client\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-json\":\"^0.0.12\",\"@atproto/lex-installer\":\"^0.0.18\",\"@atproto/lex-schema\":\"^0.0.13\"}},\"node_modules/@atproto/lex-builder\":{\"version\":\"0.0.16\",\"integrity\":\"sha512-z9h6kLiifyL0mBVzlHJ3cK3XwhHRttSePmk2XmhQ1gC0tfa7exUhvCMp9YpEv2N5oUVMItl00L8SLBsVsuMMtg==\",\"dependencies\":{\"prettier\":\"^3.2.5\",\"ts-morph\":\"^27.0.0\",\"tslib\":\"^2.8.1\",\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-schema\":\"^0.0.13\"}},\"node_modules/@atproto/lex-cbor\":{\"version\":\"0.0.13\",\"integrity\":\"sha512-63nbzXJnQwV02XGpEa8WZxt7Zu87dnbzrUVL0Mqr55S1EGCzEF9U7Dauc9tKKLoZ88GmYrJN0irBsXtSi0VeWg==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.12\"}},\"node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-client\":{\"version\":\"0.0.13\",\"integrity\":\"sha512-NftQ9SSIilMFFj99fBlv1hvZ6Oe4Bl+HYn4VkXrWsGrHeOIM3GLgVZSMWAlg33rCvd6bYfb+YnIdPxcV6lCU0g==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-json\":\"^0.0.12\",\"@atproto/lex-schema\":\"^0.0.13\"}},\"node_modules/@atproto/lex-client/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-client/node_modules/@atproto/lex-json\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.12\"}},\"node_modules/@atproto/lex-data\":{\"version\":\"0.1.7\",\"integrity\":\"sha512-kW/dPLqo/WgCLV+XESR4JKwV6c1rZWJGOfuPupZGTjEDAKoBbKXdaEzX9/1vKQYbZ9U3j0DS/n7OFFK7wBugyQ==\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"tslib\":\"^2.8.1\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-data/node_modules/multiformats\":{\"version\":\"13.4.2\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\"},\"node_modules/@atproto/lex-document\":{\"version\":\"0.0.14\",\"integrity\":\"sha512-BaCSZOZUIv3kQ23b3Lhe4sprJYHc0spSeWS3TLaMoVi6bFZ3RzeM8n7ROTzVP3BTNYxpRHPHtOarx9A8ZAAC4w==\",\"dependencies\":{\"core-js\":\"^3\",\"tslib\":\"^2.8.1\",\"@atproto/lex-schema\":\"^0.0.13\"}},\"node_modules/@atproto/lex-installer\":{\"version\":\"0.0.18\",\"integrity\":\"sha512-ukDMHIpoaqk6ph0kFnLsRnYr3TJ+rDsAyVRwTzdiLb29pPYgQHD+3wSMHH/rQ7XXUuPklv4SFBTKLTMeIeEgkg==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-builder\":\"^0.0.16\",\"@atproto/lex-cbor\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-resolver\":\"^0.0.15\",\"@atproto/lex-schema\":\"^0.0.13\",\"@atproto/syntax\":\"^0.4.3\"}},\"node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-installer/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-json\":{\"version\":\"0.1.6\",\"integrity\":\"sha512-mvrAd0lbyuecIHjyld8QN6MN6CBf4j0GCxLzegsvLh0SvDf+GbYWklkcQqmITL44yFQOwmA/QNIQj0Uvh7+R/g==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.1.7\"}},\"node_modules/@atproto/lex-resolver\":{\"version\":\"0.0.15\",\"integrity\":\"sha512-oNxcNCts3ReJ+A4hTPthQbPA68yMQ0ZrBUIiUTZwRazrmg/xkV15jtyYSnH4CGBjRdt420MV9aLR2s4qLSmyTQ==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto-labs/did-resolver\":\"^0.2.6\",\"@atproto/crypto\":\"^0.4.5\",\"@atproto/lex-client\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/repo\":\"^0.8.12\",\"@atproto/syntax\":\"^0.4.3\",\"@atproto/lex-schema\":\"^0.0.13\"}},\"node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-schema\":{\"version\":\"0.0.13\",\"integrity\":\"sha512-FeY4YBesEUO4Ey3BJhDRma0cZt6XxunSZPXny5Q/6ltc7pvyJGXXtJ8D7mHl7p5EXPwylEYOQkM6ck4IyfMP0A==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/syntax\":\"^0.4.3\",\"@atproto/lex-data\":\"^0.0.12\"}},\"node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-schema/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex/node_modules/@atproto/lex-json\":{\"version\":\"0.0.12\",\"integrity\":\"sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.12\"}},\"node_modules/@atproto/lexicon\":{\"version\":\"0.7.12\",\"integrity\":\"sha512-bXVWXc2+ctVVUc3CEuWV9mVXRMMQcWmdzmyRE7w2Rli0B36HADU49Vvi7PWTw26zFFqumYVl9b23bW3vrzAzbg==\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\",\"@atproto/common-web\":\"^0.5.10\",\"@atproto/syntax\":\"^0.7.5\"}},\"node_modules/@atproto/lexicon/node_modules/multiformats\":{\"version\":\"13.4.2\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\"},\"node_modules/@atproto/oauth-client\":{\"version\":\"0.8.8\",\"integrity\":\"sha512-W2T44dtFRBiHlq21JAnailcR7pjkTIlVoYTSxkXTAiycac97KhiXqKPOOfAu2sjkA3FTnKlMMjdjv4UrtDui+w==\",\"dependencies\":{\"core-js\":\"^3.50.0\",\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\",\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/identity-resolver\":\"^0.4.10\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/xrpc\":\"^0.8.14\",\"@atproto/oauth-types\":\"^0.7.7\"}},\"node_modules/@atproto/oauth-client-browser\":{\"version\":\"0.5.8\",\"integrity\":\"sha512-bAJ/OtpdKHwtMuro6ZAmKQnD8dzV0wv+DydL04lvtMe828xcZmce9gylMZfpG7wF3Br5OaSsqCAVk4m8rEpuSg==\",\"dependencies\":{\"core-js\":\"^3.50.0\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto/did\":\"^0.5.6\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto/oauth-client\":\"^0.8.8\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-webcrypto\":\"^0.3.4\",\"@atproto/oauth-types\":\"^0.7.7\"}},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\"}},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"}},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\"},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\"},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"dependencies\":{\"lru-cache\":\"^10.2.0\",\"@atproto-labs/simple-store\":\"^0.5.1\"}},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/oauth-client-node\":{\"version\":\"0.5.8\",\"integrity\":\"sha512-Mhs0JlEiZC3iu0RB1XXjmbFodk8rTtyM+27tNm/2dHkTPdBZTbl7smwOoAXdNpa3rjgR4DlCEBLkTqS9XLsjcQ==\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver-node\":\"^0.2.11\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-jose\":\"^0.2.4\",\"@atproto/did\":\"^0.5.6\",\"@atproto/oauth-client\":\"^0.8.8\",\"@atproto/jwk-webcrypto\":\"^0.3.4\",\"@atproto/oauth-types\":\"^0.7.7\",\"@atproto-labs/simple-store\":\"^0.5.1\"}},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\"}},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"}},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\"},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\"},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"dependencies\":{\"lru-cache\":\"^10.2.0\",\"@atproto-labs/simple-store\":\"^0.5.1\"}},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\"}},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"}},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\"},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\"},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"dependencies\":{\"lru-cache\":\"^10.2.0\",\"@atproto-labs/simple-store\":\"^0.5.1\"}},\"node_modules/@atproto/oauth-client/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/oauth-client/node_modules/multiformats\":{\"version\":\"13.4.2\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\"},\"node_modules/@atproto/oauth-types\":{\"version\":\"0.7.7\",\"integrity\":\"sha512-HhY0n6BJtFlxHJTOwT34uf7BiMaEluuwiZqHkamWoFvl+Gk7bPgWhPslr4kX2J/7ryFxhdsKVj1tjWjy0AhjTw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\"}},\"node_modules/@atproto/oauth-types/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/repo\":{\"version\":\"0.8.13\",\"integrity\":\"sha512-VS8XHaBMGdq60xwRI5zQmXzsMF1hU7NKPjmkdr65tJdrv2z0VW77mG01Ui19Xh9O0mUc/LG6GEhwVrabB9Txow==\",\"dependencies\":{\"@ipld/dag-cbor\":\"^7.0.0\",\"multiformats\":\"^9.9.0\",\"uint8arrays\":\"3.0.0\",\"varint\":\"^6.0.0\",\"zod\":\"^3.23.8\",\"@atproto/common\":\"^0.5.14\",\"@atproto/common-web\":\"^0.4.18\",\"@atproto/crypto\":\"^0.4.5\",\"@atproto/lexicon\":\"^0.6.2\"}},\"node_modules/@atproto/repo/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.15\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lexicon\":{\"version\":\"0.6.2\",\"integrity\":\"sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"multiformats\":\"^9.9.0\",\"zod\":\"^3.23.8\",\"@atproto/common-web\":\"^0.4.18\",\"@atproto/syntax\":\"^0.5.0\"}},\"node_modules/@atproto/repo/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/syntax\":{\"version\":\"0.7.5\",\"integrity\":\"sha512-6vnLQK8OAzg0dO6z/xnvuXn5zMV0UMI54zbxk7G7BXhGlIlLMb1yo+JVYtAlv8Nxzr+AaFdNZ8AJt+L/QhJMFQ==\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/xrpc\":{\"version\":\"0.8.14\",\"integrity\":\"sha512-9r3cGbm6Q35SMzfBGaJiHbb1OlznOpf1PwKj9Q8nrSRh01xGl0GgCUDXe47t3IgFth4WJmnEcY2EbyoJF05WCQ==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/lexicon\":\"^0.7.15\"}},\"node_modules/@atproto/xrpc/node_modules/@atproto/common-web\":{\"version\":\"0.5.13\",\"integrity\":\"sha512-TSVba26vsgeYqeE6BKrvomEbzRJPiRkmVfakfJxqoEWAwxrWfvXvKSwGkPIY57kw5g2gHpKxPIM0v+DqarWKEw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/lex-data\":\"^0.1.7\",\"@atproto/lex-json\":\"^0.1.6\",\"@atproto/syntax\":\"^0.7.6\"}},\"node_modules/@atproto/xrpc/node_modules/@atproto/lexicon\":{\"version\":\"0.7.15\",\"integrity\":\"sha512-VAiXSHY12hqFYevassyVlWXDxs88ya9jS6DhGc93QbxOQbKasy8yWtxzG3oMiSLQaN+hOuqZUw4kSySLZgR2/w==\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\",\"@atproto/common-web\":\"^0.5.13\",\"@atproto/syntax\":\"^0.7.6\"}},\"node_modules/@atproto/xrpc/node_modules/@atproto/syntax\":{\"version\":\"0.7.6\",\"integrity\":\"sha512-luKQTcWw1H1jLmYvX34ldBqNjz2orF082njmcF9fxbWTqVhsO+TpY0FHRKVPoV7dwL0Y3L16DNz1ma0LFGH25g==\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/xrpc/node_modules/multiformats\":{\"version\":\"13.4.2\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\"},\"node_modules/@inlay/core\":{\"version\":\"0.0.13\",\"integrity\":\"sha512-UO3M3l96+Ed0RikY5SyDCP16yb+ceyYksQ2PLO3PyBZJ8EDvw9CfKIdbsOzraQp3lyUkmhrToJj1GED0tkvi1Q==\",\"dependencies\":{\"@atproto/lex\":\"^0.0.18\",\"@atproto/syntax\":\"^0.4.3\"}},\"node_modules/@inlay/core/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render\":{\"version\":\"0.3.1\",\"integrity\":\"sha512-zlJCvpjFFqAa8dMBbLW5cYZ5w+ARHKej/DoBLRnjnjlXCnrOJyMXCef1J6Pc5a7761+2QhuSvP/1M4TDR+dw3w==\",\"dependencies\":{\"@atproto/lexicon\":\"^0.6.1\",\"@atproto/syntax\":\"^0.4.3\"},\"peerDependencies\":{\"@inlay/core\":\"*\"}},\"node_modules/@inlay/render/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"dependencies\":{\"zod\":\"^3.23.8\",\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\"}},\"node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@inlay/render/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"dependencies\":{\"tslib\":\"^2.8.1\",\"@atproto/lex-data\":\"^0.0.15\"}},\"node_modules/@inlay/render/node_modules/@atproto/lexicon\":{\"version\":\"0.6.2\",\"integrity\":\"sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"multiformats\":\"^9.9.0\",\"zod\":\"^3.23.8\",\"@atproto/common-web\":\"^0.4.18\",\"@atproto/syntax\":\"^0.5.0\"}},\"node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@ipld/dag-cbor\":{\"version\":\"7.0.3\",\"integrity\":\"sha512-1VVh2huHsuohdXC1bGJNE8WR72slZ9XE2T3wbBBq31dm7ZBatmKLLxrB+XAqafxfRFjv08RZmj/W/ZqaM13AuA==\",\"dependencies\":{\"cborg\":\"^1.6.0\",\"multiformats\":\"^9.5.4\"}},\"node_modules/@noble/curves\":{\"version\":\"1.9.7\",\"integrity\":\"sha512-gbKGcRUYIjA3/zCCNaWDciTMFI0dCkvou3TL8Zmy5Nc7sJ47a0jtOeZoTaMxkuqRo9cRhjOdZJXegxYE5FN/xw==\",\"dependencies\":{\"@noble/hashes\":\"1.8.0\"}},\"node_modules/@noble/hashes\":{\"version\":\"1.8.0\",\"integrity\":\"sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==\"},\"node_modules/@noble/secp256k1\":{\"version\":\"3.2.0\",\"integrity\":\"sha512-Z3ZAWOTxJ0EuTuZTi7Y69iK7GgrLHh8sgm45lVDhg/b3Nk1TpAiKhick2KkZisHuupeepSkyIydN/J459SdX1w==\"},\"node_modules/@oomfware/eval\":{\"version\":\"0.1.0\",\"integrity\":\"sha512-EIkukTd3zDQEHUjcfFRDq79Jgm4OEyUrEUvp/SwgjfoH2POaE5cvaswIonFwdt8fSzJF5xtAdgcgIoKD8sPpjg==\"},\"node_modules/@standard-schema/spec\":{\"version\":\"1.1.0\",\"integrity\":\"sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==\"},\"node_modules/@ts-morph/common\":{\"version\":\"0.28.1\",\"integrity\":\"sha512-W74iWf7ILp1ZKNYXY5qbddNaml7e9Sedv5lvU1V8lftlitkc9Pq1A+jlH23ltDgWYeZFFEqGCD1Ies9hqu3O+g==\",\"dependencies\":{\"minimatch\":\"^10.0.1\",\"path-browserify\":\"^1.0.1\",\"tinyglobby\":\"^0.2.14\"}},\"node_modules/abort-controller\":{\"version\":\"3.0.0\",\"integrity\":\"sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==\",\"dependencies\":{\"event-target-shim\":\"^5.0.0\"}},\"node_modules/ansi-regex\":{\"version\":\"5.0.1\",\"integrity\":\"sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==\"},\"node_modules/ansi-styles\":{\"version\":\"4.3.0\",\"integrity\":\"sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==\",\"dependencies\":{\"color-convert\":\"^2.0.1\"}},\"node_modules/atomic-sleep\":{\"version\":\"1.0.0\",\"integrity\":\"sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==\",\"dependencies\":{}},\"node_modules/balanced-match\":{\"version\":\"4.0.4\",\"integrity\":\"sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==\"},\"node_modules/base64-js\":{\"version\":\"1.5.1\",\"integrity\":\"sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==\"},\"node_modules/brace-expansion\":{\"version\":\"5.0.12\",\"integrity\":\"sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==\",\"dependencies\":{\"balanced-match\":\"^4.0.2\"}},\"node_modules/buffer\":{\"version\":\"6.0.3\",\"integrity\":\"sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==\",\"dependencies\":{\"base64-js\":\"^1.3.1\",\"ieee754\":\"^1.2.1\"}},\"node_modules/cborg\":{\"version\":\"1.10.2\",\"integrity\":\"sha512-b3tFPA9pUr2zCUiCfRd2+wok2/LBSNUMKOuRRok+WlvvAgEt/PlbgPTsZUcwCOs53IJvLgTp0eotwtosE6njug==\"},\"node_modules/cliui\":{\"version\":\"8.0.1\",\"integrity\":\"sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==\",\"dependencies\":{\"string-width\":\"^4.2.0\",\"strip-ansi\":\"^6.0.1\",\"wrap-ansi\":\"^7.0.0\"}},\"node_modules/code-block-writer\":{\"version\":\"13.0.3\",\"integrity\":\"sha512-Oofo0pq3IKnsFtuHqSF7TqBfr71aeyZDVJ0HpmqB7FBM2qEigL0iPONSCZSO9pE9dZTAxANe5XHG9Uy0YMv8cg==\"},\"node_modules/color-convert\":{\"version\":\"2.0.1\",\"integrity\":\"sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==\",\"dependencies\":{\"color-name\":\"~1.1.4\"}},\"node_modules/color-name\":{\"version\":\"1.1.4\",\"integrity\":\"sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==\"},\"node_modules/core-js\":{\"version\":\"3.50.0\",\"integrity\":\"sha512-BRWgOLKkFeCgRudR6zrs8p9XJZcE14grzKMMssoYrk6krtuEZ7MTKPIY5RzOnqsEKIR9kst7wNzphttraT+Yqw==\"},\"node_modules/emoji-regex\":{\"version\":\"8.0.0\",\"integrity\":\"sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==\"},\"node_modules/escalade\":{\"version\":\"3.2.0\",\"integrity\":\"sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==\"},\"node_modules/esm-env\":{\"version\":\"1.2.2\",\"integrity\":\"sha512-Epxrv+Nr/CaL4ZcFGPJIYLWFom+YeV1DqMLHJoEd9SYRxNbaFruBwfEX/kkHUJf55j2+TUbmDcmuilbP1TmXHA==\"},\"node_modules/event-target-shim\":{\"version\":\"5.0.1\",\"integrity\":\"sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==\"},\"node_modules/events\":{\"version\":\"3.3.0\",\"integrity\":\"sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==\"},\"node_modules/fast-redact\":{\"version\":\"3.5.0\",\"integrity\":\"sha512-dwsoQlS7h9hMeYUq1W++23NDcBLV4KqONnITDV9DjfS3q1SgDGVrBdvvTLUotWtPSD7asWDV9/CmsZPy8Hf70A==\"},\"node_modules/fdir\":{\"version\":\"6.5.0\",\"integrity\":\"sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==\",\"peerDependencies\":{\"picomatch\":\"^3 || ^4\"},\"peerDependenciesMeta\":{\"picomatch\":{\"optional\":true}}},\"node_modules/get-caller-file\":{\"version\":\"2.0.5\",\"integrity\":\"sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==\"},\"node_modules/ieee754\":{\"version\":\"1.2.1\",\"integrity\":\"sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==\"},\"node_modules/ipaddr.js\":{\"version\":\"2.5.0\",\"integrity\":\"sha512-aq+t5NAc+cS6rZQQVWC2x98CPqGtKKTMDd4Gaodv0wShnItdKg/51djkGJ1hqH+Oy0ivDftCbSLCQob8zso01w==\"},\"node_modules/is-fullwidth-code-point\":{\"version\":\"3.0.0\",\"integrity\":\"sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==\"},\"node_modules/iso-datestring-validator\":{\"version\":\"2.2.2\",\"integrity\":\"sha512-yLEMkBbLZTlVQqOnQ4FiMujR6T4DEcCb1xizmvXS+OxuhwcbtynoosRzdMA69zZCShCNAbi+gJ71FxZBBXx1SA==\"},\"node_modules/jose\":{\"version\":\"5.10.0\",\"integrity\":\"sha512-s+3Al/p9g32Iq+oqXxkW//7jk2Vig6FF1CFqzVXoTUXt2qz89YWbL+OwS17NFYEvxC35n0FKeGO2LGYSxeM2Gg==\"},\"node_modules/jsonata\":{\"version\":\"2.2.2\",\"integrity\":\"sha512-XDFH2PuaAXv0AXJEWwElXbqADmKFGKMLMkFb+qOz0EhjQW2EIJ6pgtordLU+4u3IVERyBfqy6bi6kZKEncvRqA==\"},\"node_modules/jsonc-parser\":{\"version\":\"3.3.1\",\"integrity\":\"sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ==\"},\"node_modules/lru-cache\":{\"version\":\"10.4.3\",\"integrity\":\"sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==\"},\"node_modules/minimatch\":{\"version\":\"10.2.6\",\"integrity\":\"sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==\",\"dependencies\":{\"brace-expansion\":\"^5.0.8\"}},\"node_modules/multiformats\":{\"version\":\"9.9.0\",\"integrity\":\"sha512-HoMUjhH9T8DDBNT+6xzkrd9ga/XiBI4xLr58LJACwK6G3HTOPeMz4nB4KJs33L2BelrIJa7P0VuNaVF3hMYfjg==\"},\"node_modules/on-exit-leak-free\":{\"version\":\"2.1.2\",\"integrity\":\"sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==\"},\"node_modules/path-browserify\":{\"version\":\"1.0.1\",\"integrity\":\"sha512-b7uo2UCUOYZcnF/3ID0lulOJi/bafxa1xPe7ZPsammBSpjSWQkjNxlt635YGS2MiR9GjvuXCtz2emr3jbsz98g==\",\"dependencies\":{}},\"node_modules/picomatch\":{\"version\":\"4.0.7\",\"integrity\":\"sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==\"},\"node_modules/pino\":{\"version\":\"8.21.0\",\"integrity\":\"sha512-ip4qdzjkAyDDZklUaZkcRFb2iA118H9SgRh8yzTkSQK8HilsOJF7rSY8HoW5+I0M46AZgX/pxbprf2vvzQCE0Q==\",\"dependencies\":{\"atomic-sleep\":\"^1.0.0\",\"fast-redact\":\"^3.1.1\",\"on-exit-leak-free\":\"^2.1.0\",\"pino-abstract-transport\":\"^1.2.0\",\"pino-std-serializers\":\"^6.0.0\",\"process-warning\":\"^3.0.0\",\"quick-format-unescaped\":\"^4.0.3\",\"real-require\":\"^0.2.0\",\"safe-stable-stringify\":\"^2.3.1\",\"sonic-boom\":\"^3.7.0\",\"thread-stream\":\"^2.6.0\"}},\"node_modules/pino-abstract-transport\":{\"version\":\"1.2.0\",\"integrity\":\"sha512-Guhh8EZfPCfH+PMXAb6rKOjGQEoy0xlAIn+irODG5kgfYV+BQ0rGYYWTIel3P5mmyXqkYkPmdIkywsn6QKUR1Q==\",\"dependencies\":{\"readable-stream\":\"^4.0.0\",\"split2\":\"^4.0.0\"}},\"node_modules/pino-std-serializers\":{\"version\":\"6.2.2\",\"integrity\":\"sha512-cHjPPsE+vhj/tnhCy/wiMh3M3z3h/j15zHQX+S9GkTBgqJuTuJzYJ4gUyACLhDaJ7kk9ba9iRDmbH2tJU03OiA==\"},\"node_modules/prettier\":{\"version\":\"3.9.9\",\"integrity\":\"sha512-Z/CJHIkdujO/OtN7nXUii0Rf3VT5SRuhjBA82Xvu2XhBUgX3nhP67T0LHceBdQLex7OOFGTox+Q5Yg8Jk2Qivg==\"},\"node_modules/process\":{\"version\":\"0.11.10\",\"integrity\":\"sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A==\"},\"node_modules/process-warning\":{\"version\":\"3.0.0\",\"integrity\":\"sha512-mqn0kFRl0EoqhnL0GQ0veqFHyIN1yig9RHh/InzORTUiZHFRAur+aMtRkELNwGs9aNwKS6tg/An4NYBPGwvtzQ==\"},\"node_modules/quick-format-unescaped\":{\"version\":\"4.0.4\",\"integrity\":\"sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==\",\"dependencies\":{}},\"node_modules/readable-stream\":{\"version\":\"4.7.0\",\"integrity\":\"sha512-oIGGmcpTLwPga8Bn6/Z75SVaH1z5dUut2ibSyAMVhmUggWpmDn2dapB0n7f8nwaSiRtepAsfJyfXIO5DCVAODg==\",\"dependencies\":{\"abort-controller\":\"^3.0.0\",\"buffer\":\"^6.0.3\",\"events\":\"^3.3.0\",\"process\":\"^0.11.10\",\"string_decoder\":\"^1.3.0\"}},\"node_modules/real-require\":{\"version\":\"0.2.0\",\"integrity\":\"sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==\"},\"node_modules/require-directory\":{\"version\":\"2.1.1\",\"integrity\":\"sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==\"},\"node_modules/safe-buffer\":{\"version\":\"5.2.1\",\"integrity\":\"sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==\"},\"node_modules/safe-stable-stringify\":{\"version\":\"2.5.0\",\"integrity\":\"sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==\"},\"node_modules/sonic-boom\":{\"version\":\"3.8.1\",\"integrity\":\"sha512-y4Z8LCDBuum+PBP3lSV7RHrXscqksve/bi0as7mhwVnBW+/wUqKT/2Kb7um8yqcFy0duYbbPxzt89Zy2nOCaxg==\",\"dependencies\":{\"atomic-sleep\":\"^1.0.0\"}},\"node_modules/split2\":{\"version\":\"4.2.0\",\"integrity\":\"sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==\"},\"node_modules/string-width\":{\"version\":\"4.2.3\",\"integrity\":\"sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==\",\"dependencies\":{\"emoji-regex\":\"^8.0.0\",\"is-fullwidth-code-point\":\"^3.0.0\",\"strip-ansi\":\"^6.0.1\"}},\"node_modules/string_decoder\":{\"version\":\"1.3.0\",\"integrity\":\"sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==\",\"dependencies\":{\"safe-buffer\":\"~5.2.0\"}},\"node_modules/strip-ansi\":{\"version\":\"6.0.1\",\"integrity\":\"sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==\",\"dependencies\":{\"ansi-regex\":\"^5.0.1\"}},\"node_modules/thread-stream\":{\"version\":\"2.7.0\",\"integrity\":\"sha512-qQiRWsU/wvNolI6tbbCKd9iKaTnCXsTwVxhhKM6nctPdujTyztjlbUkUTUymidWcMnZ5pWR0ej4a0tjsW021vw==\",\"dependencies\":{\"real-require\":\"^0.2.0\"}},\"node_modules/tinyglobby\":{\"version\":\"0.2.17\",\"integrity\":\"sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==\",\"dependencies\":{\"fdir\":\"^6.5.0\",\"picomatch\":\"^4.0.4\"}},\"node_modules/ts-morph\":{\"version\":\"27.0.2\",\"integrity\":\"sha512-fhUhgeljcrdZ+9DZND1De1029PrE+cMkIP7ooqkLRTrRLTqcki2AstsyJm0vRNbTbVCNJ0idGlbBrfqc7/nA8w==\",\"dependencies\":{\"@ts-morph/common\":\"~0.28.1\",\"code-block-writer\":\"^13.0.3\"}},\"node_modules/tslib\":{\"version\":\"2.8.1\",\"integrity\":\"sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==\"},\"node_modules/uint8arrays\":{\"version\":\"3.0.0\",\"integrity\":\"sha512-HRCx0q6O9Bfbp+HHSfQQKD7wU70+lydKVt4EghkdOvlK/NlrF90z+eXV34mUd48rNvVJXwkrMSPpCATkct8fJA==\",\"dependencies\":{\"multiformats\":\"^9.4.2\"}},\"node_modules/undici_v6\":{\"version\":\"6.29.0\",\"integrity\":\"sha512-R+RODBqp6i2pPflGdq+xIOUkl+RNfGgHwoinecKu/JCuf2uO06cOKoDbI2P7Dn6KcswdKwrczbU6IYJ6K8X+wg==\"},\"node_modules/undici_v7\":{\"version\":\"7.30.0\",\"integrity\":\"sha512-dkrQXeHSaoamnItlYbmzG0wFYrM0ZwDxCIg0A7aKjTyyhh9svRzCNFEzV+Vm05/yehjCzjDZ31KXfGEjYSztDQ==\"},\"node_modules/undici_v8\":{\"version\":\"8.11.2\",\"integrity\":\"sha512-u4UB2/IrKdU6lFxumHmmo1a3fCQO5tzQllRorfoRS63txhrB7xTpSn1PftwC4qEHkOaqP95fCWW4lJzwErwzhQ==\"},\"node_modules/unicode-segmenter\":{\"version\":\"0.14.5\",\"integrity\":\"sha512-jHGmj2LUuqDcX3hqY12Ql+uhUTn8huuxNZGq7GvtF6bSybzH3aFgedYu/KTzQStEgt1Ra2F3HxadNXsNjb3m3g==\"},\"node_modules/valibot\":{\"version\":\"1.5.0\",\"integrity\":\"sha512-nil6AkP2TChWL43Z5uJ6GTxX01CUA+g8LWUM+N/rB9NBbkUMaUsi9PUNzlUPgoKASgmx9f7eGOYpJ04/fSa6FQ==\",\"peerDependencies\":{\"typescript\":\">=5\"},\"peerDependenciesMeta\":{\"typescript\":{\"optional\":true}}},\"node_modules/varint\":{\"version\":\"6.0.0\",\"integrity\":\"sha512-cXEIW6cfr15lFv563k4GuVuW/fiwjknytD37jIOLSdSWuOI6WnO/oKwmP2FQTU2l01LP8/M5TSAJpzUaGe3uWg==\"},\"node_modules/wrap-ansi\":{\"version\":\"7.0.0\",\"integrity\":\"sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==\",\"dependencies\":{\"ansi-styles\":\"^4.0.0\",\"string-width\":\"^4.1.0\",\"strip-ansi\":\"^6.0.0\"}},\"node_modules/y18n\":{\"version\":\"5.0.8\",\"integrity\":\"sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==\"},\"node_modules/yargs\":{\"version\":\"17.7.3\",\"integrity\":\"sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==\",\"dependencies\":{\"cliui\":\"^8.0.1\",\"escalade\":\"^3.1.1\",\"get-caller-file\":\"^2.0.5\",\"require-directory\":\"^2.1.1\",\"string-width\":\"^4.2.3\",\"y18n\":\"^5.0.5\",\"yargs-parser\":\"^21.1.1\"}},\"node_modules/yargs-parser\":{\"version\":\"21.1.1\",\"integrity\":\"sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==\"},\"node_modules/zod\":{\"version\":\"3.25.76\",\"integrity\":\"sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==\"}}"),
	buildTools: { vite: "8.2.2" },
	imports: { "#atseq-integrity": {
		"atseq-source": {
			node: "./src/integrity/node.ts",
			default: "./src/integrity/browser.ts"
		},
		node: "./dist/src/integrity/node.js",
		default: "./dist/src/integrity/browser.js"
	} },
	nonExecutedPeers: [{
		package: "valibot",
		version: "1.5.0",
		peer: "typescript",
		purpose: "optional typechecking only"
	}]
}, Oa = {
	name: "atseq",
	version: "0.1.0",
	lockfileVersion: 3,
	requires: !0,
	packages: /* @__PURE__ */ JSON.parse("{\"\":{\"name\":\"atseq\",\"version\":\"0.1.0\",\"bundleDependencies\":true,\"license\":\"Apache-2.0\",\"dependencies\":{\"@atcute/car\":\"6.1.0\",\"@atcute/cbor\":\"2.3.8\",\"@atcute/cid\":\"2.5.0\",\"@atcute/crypto\":\"2.4.4\",\"@atcute/did-plc\":\"1.0.2\",\"@atcute/mst\":\"1.1.1\",\"@atcute/multibase\":\"1.2.5\",\"@atcute/repo\":\"1.1.0\",\"@atcute/varint\":\"2.0.2\",\"@atproto-labs/fetch-node\":\"0.4.0\",\"@atproto/common-web\":\"0.5.10\",\"@atproto/did\":\"0.3.0\",\"@atproto/lexicon\":\"0.7.12\",\"@atproto/oauth-client-browser\":\"0.5.8\",\"@atproto/oauth-client-node\":\"0.5.8\",\"@atproto/syntax\":\"0.7.5\",\"@inlay/core\":\"0.0.13\",\"@inlay/render\":\"0.3.1\",\"@noble/secp256k1\":\"3.2.0\",\"jsonata\":\"2.2.2\",\"jsonc-parser\":\"3.3.1\",\"valibot\":\"1.5.0\"},\"bin\":{\"atseq\":\"dist/src/cli/main.js\",\"atseq-host\":\"dist/src/host/main.js\"},\"devDependencies\":{\"@ipld/dag-cbor\":\"7.0.3\",\"@playwright/test\":\"1.63.0\",\"@types/node\":\"26.4.1\",\"multiformats\":\"9.9.0\",\"prettier\":\"3.9.9\",\"ts-morph\":\"27.0.2\",\"tsx\":\"4.23.13\",\"typescript\":\"7.0.2\",\"vite\":\"8.2.2\"},\"engines\":{\"node\":\">=22.19\"}},\"node_modules/@atcute/car\":{\"version\":\"6.1.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/car/-/car-6.1.0.tgz\",\"integrity\":\"sha512-Dp7MlyI3YT7NiIUK6bm2ZyA95Pdun+DuFlcr40ZsGdqhOkKrctZT7wMZXSs6IYd7RorjSnddEJDh51hqrkNSPQ==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/uint8array\":\"^1.2.0\",\"@atcute/varint\":\"^2.0.2\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.0.0\"}},\"node_modules/@atcute/cbor\":{\"version\":\"2.3.8\",\"resolved\":\"https://registry.npmjs.org/@atcute/cbor/-/cbor-2.3.8.tgz\",\"integrity\":\"sha512-gazXBcNTr2U3cRaCjfRbq2GKHJnWapUUA3mgehL+0tbVXEty2wf/LIwF9z46gjqjX2DYGGwkybF8lTI3dzHaNQ==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cid\":\"^2.5.0\",\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cid\":\"^2.5.0\"}},\"node_modules/@atcute/cid\":{\"version\":\"2.5.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/cid/-/cid-2.5.0.tgz\",\"integrity\":\"sha512-CAZyzUdaQhuC+S7tGjoC7vgyDI2X4JU+CPO/7WjEU7HlNsAGXjSkD++5TlfnSWGDqUeqpjMZjUfFBZYHKzPHew==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.2.0\"}},\"node_modules/@atcute/crypto\":{\"version\":\"2.4.4\",\"resolved\":\"https://registry.npmjs.org/@atcute/crypto/-/crypto-2.4.4.tgz\",\"integrity\":\"sha512-Yc7lXz4ndDjbs+/WrKeGS+sVEr+sx8xi5zSVInKNl0FAEY6KbvcT+bjaU9A3erUVviFp9yEcu/1aSg/f+GPpBg==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.1.5\",\"@noble/secp256k1\":\"^3.1.0\"}},\"node_modules/@atcute/did-plc\":{\"version\":\"1.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/did-plc/-/did-plc-1.0.2.tgz\",\"integrity\":\"sha512-z/gltUzhSeHN2LKosOsU5Fo8uS4p7c7oDydEDQcFK2DwM1u1jHghc5kYaKOQcriOcLXzf9/OetKQOU4P57uhVA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.7\",\"@atcute/cid\":\"^2.4.2\",\"@atcute/crypto\":\"^2.4.4\",\"@atcute/identity\":\"^2.0.2\",\"@atcute/lexicons\":\"^2.1.0\",\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.1.5\",\"@atcute/util-fetch\":\"^2.0.2\",\"valibot\":\"^1.5.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.0.0\",\"@atcute/identity\":\"^2.0.0\",\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/identity\":{\"version\":\"2.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/identity/-/identity-2.0.2.tgz\",\"integrity\":\"sha512-amr/EQceqVtBVmjBK4uUF7nKKYuRttadigpvOcAn4dnO6SNSwSjQi8KDH9LnukEotPsSP4UDsQvNfHWEoUcslw==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/lexicons\":\"^2.0.3\",\"valibot\":\"^1.4.2\"},\"peerDependencies\":{\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/lexicons\":{\"version\":\"2.1.1\",\"resolved\":\"https://registry.npmjs.org/@atcute/lexicons/-/lexicons-2.1.1.tgz\",\"integrity\":\"sha512-kHyqUW8g/Fq9LTctGh0TVBx0AmtecV6VSrRprrSbqKqHe9q8C6y+YPL3EMNq2l93XA1iDHkkvYwLdTcKL/lNbA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/uint8array\":\"^1.1.5\",\"@atcute/util-text\":\"^1.3.4\",\"@oomfware/eval\":\"^0.1.0\",\"@standard-schema/spec\":\"^1.1.0\",\"esm-env\":\"^1.2.2\"}},\"node_modules/@atcute/mst\":{\"version\":\"1.1.1\",\"resolved\":\"https://registry.npmjs.org/@atcute/mst/-/mst-1.1.1.tgz\",\"integrity\":\"sha512-QWoW69Pg5RWrc0B98Cp5K4UjeXI+2vzBrWmoBUW4nSR51LsamOnG9HsWovcOoCRhnj1ZYAMlnAc5Eh8+gJFoSA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.5.0\"}},\"node_modules/@atcute/multibase\":{\"version\":\"1.2.5\",\"resolved\":\"https://registry.npmjs.org/@atcute/multibase/-/multibase-1.2.5.tgz\",\"integrity\":\"sha512-cReTONgYpQo/VHD3ZmzPNoyBKJgSk1J4h//cvvdVVJBMar+SjlQ/sUXeTjQfuyfmDKv+TLKhmutLcvbMcQ9Rvw==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/uint8array\":\"^1.1.5\"}},\"node_modules/@atcute/repo\":{\"version\":\"1.1.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/repo/-/repo-1.1.0.tgz\",\"integrity\":\"sha512-WXOh05E/NT39oqkNm3xIit4ysJIZxmkQ1GWOkwDNvTYIDW0CYqwThQ+837r72/Tr490E1Zvz09xOOjtx/XmlhA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/car\":\"^6.1.0\",\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/crypto\":\"^2.4.4\",\"@atcute/lexicons\":\"^2.1.1\",\"@atcute/mst\":\"^1.1.1\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/uint8array\":{\"version\":\"1.2.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/uint8array/-/uint8array-1.2.0.tgz\",\"integrity\":\"sha512-KoBGTbV4lS8zXNu91osM3FecrH3NUnxNPsBAkaNtn6uf/p240245qoLn7keFpRM0npX522X8R+XBBb2rvtE7Rg==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/@atcute/util-fetch\":{\"version\":\"2.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/util-fetch/-/util-fetch-2.0.2.tgz\",\"integrity\":\"sha512-I0oenHlJjwRpWPyAJojox5H0z9NthhdMFaEjtkxyjo85VPPxk1vMJk/1ZjMJsrs1SgHhB3spazEWzV5DW8w70A==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"valibot\":\"^1.4.2\"}},\"node_modules/@atcute/util-text\":{\"version\":\"1.3.4\",\"resolved\":\"https://registry.npmjs.org/@atcute/util-text/-/util-text-1.3.4.tgz\",\"integrity\":\"sha512-u2UAM7iSM09sQaSG9jtxWFSPgB8boVj50/BoyMvYnhVgGBu+nXIuAcdDUQCsZA44YZgTPPhN/b86JX+jH7SPzQ==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"unicode-segmenter\":\"^0.17.0\"}},\"node_modules/@atcute/util-text/node_modules/unicode-segmenter\":{\"version\":\"0.17.3\",\"resolved\":\"https://registry.npmjs.org/unicode-segmenter/-/unicode-segmenter-0.17.3.tgz\",\"integrity\":\"sha512-hKZwqBjJDmqNrq1+LjDxck1qLzJFcLLJM2Xq92ORRHOuau6GSHeELmn+uyk6zNH1CK9mogrUJGP9WJCJUQXMAw==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@atcute/varint\":{\"version\":\"2.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/varint/-/varint-2.0.2.tgz\",\"integrity\":\"sha512-/+hS1juMgnmf6eL6lICUkTw7wcGTo3I+Q0L1PI521mUz77rGSC6nXAUNKtvm2wYJpuWdEGq+GILGoYkOArn0TQ==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.2.6.tgz\",\"integrity\":\"sha512-2K1bC04nI2fmgNcvof+yA28IhGlpWn2JKYlPa7To9JTKI45FINCGkQSGiL2nyXlyzDJJ34fZ1aq6/IRFIOIiqg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"0.2.3\",\"@atproto-labs/pipe\":\"0.1.1\",\"@atproto-labs/simple-store\":\"0.3.0\",\"@atproto-labs/simple-store-memory\":\"0.1.4\",\"@atproto/did\":\"0.3.0\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto-labs/fetch\":{\"version\":\"0.2.3\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.2.3.tgz\",\"integrity\":\"sha512-NZtbJOCbxKUFRFKMpamT38PUQMY0hX0p7TG5AEYOPhZKZEP7dHZ1K2s1aB8MdVH0qxmqX7nQleNrrvLf09Zfdw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"0.1.1\"}},\"node_modules/@atproto-labs/fetch-node\":{\"version\":\"0.4.0\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch-node/-/fetch-node-0.4.0.tgz\",\"integrity\":\"sha512-5Yi8fz/JDGEoObRgRJuglcodB/MJeQnnoqokOGSQK5ItISObSttbGIgHE1UMU1njcwxbvKtbGMWHUCRgqML2Dw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"ipaddr.js\":\"^2.1.0\",\"undici_v6\":\"npm:undici@^6.x\",\"undici_v7\":\"npm:undici@^7.x\",\"undici_v8\":\"npm:undici@^8.x\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto-labs/handle-resolver\":{\"version\":\"0.4.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/handle-resolver/-/handle-resolver-0.4.10.tgz\",\"integrity\":\"sha512-hsYYvGhi6Tv6f4Fti//i/vllVIb/wrJaOcbT3Yh7oo10VxBKAyxzVaB7mIJcho2YJ5kHd2kbCYYPWLw8pvm/bg==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver-node\":{\"version\":\"0.2.11\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/handle-resolver-node/-/handle-resolver-node-0.2.11.tgz\",\"integrity\":\"sha512-stwXuolGIs8ULdLRCwr616A4268CP2jTYOKZOlR7rzMLKjMNaxYVFktbqWUtqKq1nqdqaKxSk+MZNTFrqCjaHQ==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch-node\":\"^0.4.0\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto/did\":\"^0.5.6\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver\":{\"version\":\"0.4.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/identity-resolver/-/identity-resolver-0.4.10.tgz\",\"integrity\":\"sha512-deKu7csOsM8lnIRnLa97te6ODIUx0Lm3Srxid/Ix+UYQqFKA0sIpfYmHZduAK7B+aTqiPcHjoA9Y/qpJyzgnMw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver\":\"^0.4.10\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/pipe\":{\"version\":\"0.1.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.1.1.tgz\",\"integrity\":\"sha512-hdNw2oUs2B6BN1lp+32pF7cp8EMKuIN5Qok2Vvv/aOpG/3tNSJ9YkvfI0k6Zd188LeDDYRUpYpxcoFIcGH/FNg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@atproto-labs/simple-store\":{\"version\":\"0.3.0\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.3.0.tgz\",\"integrity\":\"sha512-nOb6ONKBRJHRlukW1sVawUkBqReLlLx6hT35VS3imaNPwiXDxLnTK7lxw3Lrl9k5yugSBDQAkZAq3MPTEFSUBQ==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.1.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.1.4.tgz\",\"integrity\":\"sha512-3mKY4dP8I7yKPFj9VKpYyCRzGJOi5CEpOLPlRhoJyLmgs3J4RzDrjn323Oakjz2Aj2JzRU/AIvWRAZVhpYNJHw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"0.3.0\",\"lru-cache\":\"^10.2.0\"}},\"node_modules/@atproto/common\":{\"version\":\"0.5.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/common/-/common-0.5.16.tgz\",\"integrity\":\"sha512-DTWgaVlDJN3zDxJ3agZK3pbiSZc+z8QQe9iy15sIuorLrceIp4kHXMO/QqjWBXnmLVTd6+/5BVDzex5amYc0rg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.4.20\",\"@atproto/lex-cbor\":\"^0.0.16\",\"@atproto/lex-data\":\"^0.0.15\",\"multiformats\":\"^9.9.0\",\"pino\":\"^8.21.0\"},\"engines\":{\"node\":\">=18.7.0\"}},\"node_modules/@atproto/common-web\":{\"version\":\"0.5.10\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.5.10.tgz\",\"integrity\":\"sha512-w4JUdsJ3VXt8ewkavYh5m/u0UbxDtFdCKhNZPEpJ0U1vcWIjDaSInIexteETDgD7fBJAhidIEi30MGz1kk49ug==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.1.7\",\"@atproto/lex-json\":\"^0.1.6\",\"@atproto/syntax\":\"^0.7.5\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/common/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-cbor\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-cbor/-/lex-cbor-0.0.16.tgz\",\"integrity\":\"sha512-x3NTvOX5/4Wh7uk8RNJpUJqZjcWRSUYDYRJ6VZPLmp/CAnsMySmBAinBu/dva/1hqS3C1oiYz258x6bRYpKJ4w==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/common/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/crypto\":{\"version\":\"0.4.5\",\"resolved\":\"https://registry.npmjs.org/@atproto/crypto/-/crypto-0.4.5.tgz\",\"integrity\":\"sha512-n40aKkMoCatP0u9Yvhrdk6fXyOHFDDbkdm4h4HCyWW+KlKl8iXfD5iV+ECq+w5BM+QH25aIpt3/j6EUNerhLxw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@noble/curves\":\"^1.7.0\",\"@noble/hashes\":\"^1.6.1\",\"uint8arrays\":\"3.0.0\"},\"engines\":{\"node\":\">=18.7.0\"}},\"node_modules/@atproto/did\":{\"version\":\"0.3.0\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.3.0.tgz\",\"integrity\":\"sha512-raUPzUGegtW/6OxwCmM8bhZvuIMzxG5t9oWsth6Tp91Kb5fTnHV2h/KKNF1C82doeA4BdXCErTyg7ISwLbQkzA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/jwk\":{\"version\":\"0.7.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/jwk/-/jwk-0.7.4.tgz\",\"integrity\":\"sha512-tq7TUDmNfe1yDfpRgdGQMJdl9TUlJmREQNCag9yg5w8Evu+TOiFiLgiOCbo7X4ouRPSgd1DpOzXbUa8UyKKMZA==\",\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/jwk-jose\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/jwk-jose/-/jwk-jose-0.2.4.tgz\",\"integrity\":\"sha512-gzDoA0JTwnc0ZJOBLM7WX9xFxtynRS2K1Bofb8epzoMWDQvyvfbPcfkdPrKFM7NXCFUVpGpBnsCB8KFPTf1rCg==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/jwk\":\"^0.7.4\",\"jose\":\"^5.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/jwk-webcrypto\":{\"version\":\"0.3.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/jwk-webcrypto/-/jwk-webcrypto-0.3.4.tgz\",\"integrity\":\"sha512-UsFIUozqnRecXPo6HgKV4PW4FqYHxX1V3iAe0rRV6Q2RSfYD8V2mZ89pv8NpvJynnaqJArBQ7HZlcg0F4tRYhA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-jose\":\"^0.2.4\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/jwk/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"license\":\"Apache-2.0 OR MIT\",\"inBundle\":true},\"node_modules/@atproto/lex\":{\"version\":\"0.0.18\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex/-/lex-0.0.18.tgz\",\"integrity\":\"sha512-uHqtV2gZNYOkOYXq1t6wO2Nb0gFfGmi40AGCVbTNccIkHsZvxRuLlaNuNrBFB+5h/HzlVeMwjBUf0ny3jD4hXw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-builder\":\"^0.0.16\",\"@atproto/lex-client\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-installer\":\"^0.0.18\",\"@atproto/lex-json\":\"^0.0.12\",\"@atproto/lex-schema\":\"^0.0.13\",\"tslib\":\"^2.8.1\",\"yargs\":\"^17.0.0\"},\"bin\":{\"lex\":\"bin/lex\",\"ts-lex\":\"bin/lex\"}},\"node_modules/@atproto/lex-builder\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-builder/-/lex-builder-0.0.16.tgz\",\"integrity\":\"sha512-z9h6kLiifyL0mBVzlHJ3cK3XwhHRttSePmk2XmhQ1gC0tfa7exUhvCMp9YpEv2N5oUVMItl00L8SLBsVsuMMtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-schema\":\"^0.0.13\",\"prettier\":\"^3.2.5\",\"ts-morph\":\"^27.0.0\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-cbor\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-cbor/-/lex-cbor-0.0.13.tgz\",\"integrity\":\"sha512-63nbzXJnQwV02XGpEa8WZxt7Zu87dnbzrUVL0Mqr55S1EGCzEF9U7Dauc9tKKLoZ88GmYrJN0irBsXtSi0VeWg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-client\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-client/-/lex-client-0.0.13.tgz\",\"integrity\":\"sha512-NftQ9SSIilMFFj99fBlv1hvZ6Oe4Bl+HYn4VkXrWsGrHeOIM3GLgVZSMWAlg33rCvd6bYfb+YnIdPxcV6lCU0g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-json\":\"^0.0.12\",\"@atproto/lex-schema\":\"^0.0.13\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-client/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-client/node_modules/@atproto/lex-json\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.12.tgz\",\"integrity\":\"sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-data\":{\"version\":\"0.1.7\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.1.7.tgz\",\"integrity\":\"sha512-kW/dPLqo/WgCLV+XESR4JKwV6c1rZWJGOfuPupZGTjEDAKoBbKXdaEzX9/1vKQYbZ9U3j0DS/n7OFFK7wBugyQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"tslib\":\"^2.8.1\",\"unicode-segmenter\":\"^0.14.0\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/lex-data/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"inBundle\":true,\"license\":\"Apache-2.0 OR MIT\"},\"node_modules/@atproto/lex-document\":{\"version\":\"0.0.14\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-document/-/lex-document-0.0.14.tgz\",\"integrity\":\"sha512-BaCSZOZUIv3kQ23b3Lhe4sprJYHc0spSeWS3TLaMoVi6bFZ3RzeM8n7ROTzVP3BTNYxpRHPHtOarx9A8ZAAC4w==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-schema\":\"^0.0.13\",\"core-js\":\"^3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-installer\":{\"version\":\"0.0.18\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-installer/-/lex-installer-0.0.18.tgz\",\"integrity\":\"sha512-ukDMHIpoaqk6ph0kFnLsRnYr3TJ+rDsAyVRwTzdiLb29pPYgQHD+3wSMHH/rQ7XXUuPklv4SFBTKLTMeIeEgkg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-builder\":\"^0.0.16\",\"@atproto/lex-cbor\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-resolver\":\"^0.0.15\",\"@atproto/lex-schema\":\"^0.0.13\",\"@atproto/syntax\":\"^0.4.3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-installer/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-json\":{\"version\":\"0.1.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.1.6.tgz\",\"integrity\":\"sha512-mvrAd0lbyuecIHjyld8QN6MN6CBf4j0GCxLzegsvLh0SvDf+GbYWklkcQqmITL44yFQOwmA/QNIQj0Uvh7+R/g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.1.7\",\"tslib\":\"^2.8.1\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/lex-resolver\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-resolver/-/lex-resolver-0.0.15.tgz\",\"integrity\":\"sha512-oNxcNCts3ReJ+A4hTPthQbPA68yMQ0ZrBUIiUTZwRazrmg/xkV15jtyYSnH4CGBjRdt420MV9aLR2s4qLSmyTQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.2.6\",\"@atproto/crypto\":\"^0.4.5\",\"@atproto/lex-client\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-schema\":\"^0.0.13\",\"@atproto/repo\":\"^0.8.12\",\"@atproto/syntax\":\"^0.4.3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-schema\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-schema/-/lex-schema-0.0.13.tgz\",\"integrity\":\"sha512-FeY4YBesEUO4Ey3BJhDRma0cZt6XxunSZPXny5Q/6ltc7pvyJGXXtJ8D7mHl7p5EXPwylEYOQkM6ck4IyfMP0A==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/syntax\":\"^0.4.3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-schema/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex/node_modules/@atproto/lex-json\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.12.tgz\",\"integrity\":\"sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lexicon\":{\"version\":\"0.7.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.7.12.tgz\",\"integrity\":\"sha512-bXVWXc2+ctVVUc3CEuWV9mVXRMMQcWmdzmyRE7w2Rli0B36HADU49Vvi7PWTw26zFFqumYVl9b23bW3vrzAzbg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.5.10\",\"@atproto/syntax\":\"^0.7.5\",\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/lexicon/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"inBundle\":true,\"license\":\"Apache-2.0 OR MIT\"},\"node_modules/@atproto/oauth-client\":{\"version\":\"0.8.8\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-client/-/oauth-client-0.8.8.tgz\",\"integrity\":\"sha512-W2T44dtFRBiHlq21JAnailcR7pjkTIlVoYTSxkXTAiycac97KhiXqKPOOfAu2sjkA3FTnKlMMjdjv4UrtDui+w==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto-labs/identity-resolver\":\"^0.4.10\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/oauth-types\":\"^0.7.7\",\"@atproto/xrpc\":\"^0.8.14\",\"core-js\":\"^3.50.0\",\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser\":{\"version\":\"0.5.8\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-client-browser/-/oauth-client-browser-0.5.8.tgz\",\"integrity\":\"sha512-bAJ/OtpdKHwtMuro6ZAmKQnD8dzV0wv+DydL04lvtMe828xcZmce9gylMZfpG7wF3Br5OaSsqCAVk4m8rEpuSg==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-webcrypto\":\"^0.3.4\",\"@atproto/oauth-client\":\"^0.8.8\",\"@atproto/oauth-types\":\"^0.7.7\",\"core-js\":\"^3.50.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node\":{\"version\":\"0.5.8\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-client-node/-/oauth-client-node-0.5.8.tgz\",\"integrity\":\"sha512-Mhs0JlEiZC3iu0RB1XXjmbFodk8rTtyM+27tNm/2dHkTPdBZTbl7smwOoAXdNpa3rjgR4DlCEBLkTqS9XLsjcQ==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver-node\":\"^0.2.11\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-jose\":\"^0.2.4\",\"@atproto/jwk-webcrypto\":\"^0.3.4\",\"@atproto/oauth-client\":\"^0.8.8\",\"@atproto/oauth-types\":\"^0.7.7\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"license\":\"Apache-2.0 OR MIT\",\"inBundle\":true},\"node_modules/@atproto/oauth-types\":{\"version\":\"0.7.7\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-types/-/oauth-types-0.7.7.tgz\",\"integrity\":\"sha512-HhY0n6BJtFlxHJTOwT34uf7BiMaEluuwiZqHkamWoFvl+Gk7bPgWhPslr4kX2J/7ryFxhdsKVj1tjWjy0AhjTw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-types/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/repo\":{\"version\":\"0.8.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/repo/-/repo-0.8.13.tgz\",\"integrity\":\"sha512-VS8XHaBMGdq60xwRI5zQmXzsMF1hU7NKPjmkdr65tJdrv2z0VW77mG01Ui19Xh9O0mUc/LG6GEhwVrabB9Txow==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common\":\"^0.5.14\",\"@atproto/common-web\":\"^0.4.18\",\"@atproto/crypto\":\"^0.4.5\",\"@atproto/lexicon\":\"^0.6.2\",\"@ipld/dag-cbor\":\"^7.0.0\",\"multiformats\":\"^9.9.0\",\"uint8arrays\":\"3.0.0\",\"varint\":\"^6.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=18.7.0\"}},\"node_modules/@atproto/repo/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lexicon\":{\"version\":\"0.6.2\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.6.2.tgz\",\"integrity\":\"sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.4.18\",\"@atproto/syntax\":\"^0.5.0\",\"iso-datestring-validator\":\"^2.2.2\",\"multiformats\":\"^9.9.0\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/repo/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/syntax\":{\"version\":\"0.7.5\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.7.5.tgz\",\"integrity\":\"sha512-6vnLQK8OAzg0dO6z/xnvuXn5zMV0UMI54zbxk7G7BXhGlIlLMb1yo+JVYtAlv8Nxzr+AaFdNZ8AJt+L/QhJMFQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"tslib\":\"^2.8.1\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/xrpc\":{\"version\":\"0.8.14\",\"resolved\":\"https://registry.npmjs.org/@atproto/xrpc/-/xrpc-0.8.14.tgz\",\"integrity\":\"sha512-9r3cGbm6Q35SMzfBGaJiHbb1OlznOpf1PwKj9Q8nrSRh01xGl0GgCUDXe47t3IgFth4WJmnEcY2EbyoJF05WCQ==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/lexicon\":\"^0.7.15\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/@atproto/common-web\":{\"version\":\"0.5.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.5.13.tgz\",\"integrity\":\"sha512-TSVba26vsgeYqeE6BKrvomEbzRJPiRkmVfakfJxqoEWAwxrWfvXvKSwGkPIY57kw5g2gHpKxPIM0v+DqarWKEw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.1.7\",\"@atproto/lex-json\":\"^0.1.6\",\"@atproto/syntax\":\"^0.7.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/@atproto/lexicon\":{\"version\":\"0.7.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.7.15.tgz\",\"integrity\":\"sha512-VAiXSHY12hqFYevassyVlWXDxs88ya9jS6DhGc93QbxOQbKasy8yWtxzG3oMiSLQaN+hOuqZUw4kSySLZgR2/w==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.5.13\",\"@atproto/syntax\":\"^0.7.6\",\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/@atproto/syntax\":{\"version\":\"0.7.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.7.6.tgz\",\"integrity\":\"sha512-luKQTcWw1H1jLmYvX34ldBqNjz2orF082njmcF9fxbWTqVhsO+TpY0FHRKVPoV7dwL0Y3L16DNz1ma0LFGH25g==\",\"license\":\"MIT\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"tslib\":\"^2.8.1\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"license\":\"Apache-2.0 OR MIT\",\"inBundle\":true},\"node_modules/@esbuild/aix-ppc64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz\",\"integrity\":\"sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==\",\"cpu\":[\"ppc64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"aix\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/android-arm\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz\",\"integrity\":\"sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/android-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz\",\"integrity\":\"sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/android-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz\",\"integrity\":\"sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/darwin-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz\",\"integrity\":\"sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/darwin-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz\",\"integrity\":\"sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/freebsd-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz\",\"integrity\":\"sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/freebsd-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz\",\"integrity\":\"sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-arm\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz\",\"integrity\":\"sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz\",\"integrity\":\"sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-ia32\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz\",\"integrity\":\"sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==\",\"cpu\":[\"ia32\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-loong64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz\",\"integrity\":\"sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==\",\"cpu\":[\"loong64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-mips64el\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz\",\"integrity\":\"sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==\",\"cpu\":[\"mips64el\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-ppc64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz\",\"integrity\":\"sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==\",\"cpu\":[\"ppc64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-riscv64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz\",\"integrity\":\"sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==\",\"cpu\":[\"riscv64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-s390x\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz\",\"integrity\":\"sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==\",\"cpu\":[\"s390x\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz\",\"integrity\":\"sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/netbsd-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz\",\"integrity\":\"sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/netbsd-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz\",\"integrity\":\"sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/openbsd-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz\",\"integrity\":\"sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/openbsd-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz\",\"integrity\":\"sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/openharmony-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz\",\"integrity\":\"sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openharmony\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/sunos-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz\",\"integrity\":\"sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"sunos\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/win32-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz\",\"integrity\":\"sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/win32-ia32\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz\",\"integrity\":\"sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==\",\"cpu\":[\"ia32\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/win32-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz\",\"integrity\":\"sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@inlay/core\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@inlay/core/-/core-0.0.13.tgz\",\"integrity\":\"sha512-UO3M3l96+Ed0RikY5SyDCP16yb+ceyYksQ2PLO3PyBZJ8EDvw9CfKIdbsOzraQp3lyUkmhrToJj1GED0tkvi1Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex\":\"^0.0.18\",\"@atproto/syntax\":\"^0.4.3\"}},\"node_modules/@inlay/core/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render\":{\"version\":\"0.3.1\",\"resolved\":\"https://registry.npmjs.org/@inlay/render/-/render-0.3.1.tgz\",\"integrity\":\"sha512-zlJCvpjFFqAa8dMBbLW5cYZ5w+ARHKej/DoBLRnjnjlXCnrOJyMXCef1J6Pc5a7761+2QhuSvP/1M4TDR+dw3w==\",\"inBundle\":true,\"dependencies\":{\"@atproto/lexicon\":\"^0.6.1\",\"@atproto/syntax\":\"^0.4.3\"},\"peerDependencies\":{\"@inlay/core\":\"*\"}},\"node_modules/@inlay/render/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\",\"zod\":\"^3.23.8\"}},\"node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@inlay/render/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/lexicon\":{\"version\":\"0.6.2\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.6.2.tgz\",\"integrity\":\"sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.4.18\",\"@atproto/syntax\":\"^0.5.0\",\"iso-datestring-validator\":\"^2.2.2\",\"multiformats\":\"^9.9.0\",\"zod\":\"^3.23.8\"}},\"node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@ipld/dag-cbor\":{\"version\":\"7.0.3\",\"resolved\":\"https://registry.npmjs.org/@ipld/dag-cbor/-/dag-cbor-7.0.3.tgz\",\"integrity\":\"sha512-1VVh2huHsuohdXC1bGJNE8WR72slZ9XE2T3wbBBq31dm7ZBatmKLLxrB+XAqafxfRFjv08RZmj/W/ZqaM13AuA==\",\"inBundle\":true,\"license\":\"(Apache-2.0 AND MIT)\",\"dependencies\":{\"cborg\":\"^1.6.0\",\"multiformats\":\"^9.5.4\"}},\"node_modules/@noble/curves\":{\"version\":\"1.9.7\",\"resolved\":\"https://registry.npmjs.org/@noble/curves/-/curves-1.9.7.tgz\",\"integrity\":\"sha512-gbKGcRUYIjA3/zCCNaWDciTMFI0dCkvou3TL8Zmy5Nc7sJ47a0jtOeZoTaMxkuqRo9cRhjOdZJXegxYE5FN/xw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@noble/hashes\":\"1.8.0\"},\"engines\":{\"node\":\"^14.21.3 || >=16\"},\"funding\":{\"url\":\"https://paulmillr.com/funding/\"}},\"node_modules/@noble/hashes\":{\"version\":\"1.8.0\",\"resolved\":\"https://registry.npmjs.org/@noble/hashes/-/hashes-1.8.0.tgz\",\"integrity\":\"sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\"^14.21.3 || >=16\"},\"funding\":{\"url\":\"https://paulmillr.com/funding/\"}},\"node_modules/@noble/secp256k1\":{\"version\":\"3.2.0\",\"resolved\":\"https://registry.npmjs.org/@noble/secp256k1/-/secp256k1-3.2.0.tgz\",\"integrity\":\"sha512-Z3ZAWOTxJ0EuTuZTi7Y69iK7GgrLHh8sgm45lVDhg/b3Nk1TpAiKhick2KkZisHuupeepSkyIydN/J459SdX1w==\",\"inBundle\":true,\"license\":\"MIT\",\"funding\":{\"url\":\"https://paulmillr.com/funding/\"}},\"node_modules/@oomfware/eval\":{\"version\":\"0.1.0\",\"resolved\":\"https://registry.npmjs.org/@oomfware/eval/-/eval-0.1.0.tgz\",\"integrity\":\"sha512-EIkukTd3zDQEHUjcfFRDq79Jgm4OEyUrEUvp/SwgjfoH2POaE5cvaswIonFwdt8fSzJF5xtAdgcgIoKD8sPpjg==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/@oxc-project/types\":{\"version\":\"0.148.0\",\"resolved\":\"https://registry.npmjs.org/@oxc-project/types/-/types-0.148.0.tgz\",\"integrity\":\"sha512-Nm4s/jB+4FpFsPhWGEC4h7rzksesmtnMXomo6rCMcg/b8zLQuOziRgkCS1fxDCXOlJB/6Q8oABOZ/OP6RIPj9A==\",\"dev\":true,\"license\":\"MIT\",\"funding\":{\"url\":\"https://github.com/sponsors/oxc-project\"}},\"node_modules/@playwright/test\":{\"version\":\"1.63.0\",\"resolved\":\"https://registry.npmjs.org/@playwright/test/-/test-1.63.0.tgz\",\"integrity\":\"sha512-oxMK4vllB9RK5NQ2l1pq1IfOf2AvnEuj/vYGDj0H2nMtmtZpKtCwt/l00GEO6xjGfpBNAvjovvYdCm50dRQkpQ==\",\"dev\":true,\"license\":\"Apache-2.0\",\"dependencies\":{\"playwright\":\"1.63.0\"},\"bin\":{\"playwright\":\"cli.js\"},\"engines\":{\"node\":\">=20\"}},\"node_modules/@rolldown/binding-android-arm-eabi\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.7.tgz\",\"integrity\":\"sha512-EypzgnYCwyVY4NDHKzGmNJT5b+XaQEBniHxsMdeIQLB/tcCzZnhqrzHpZFbX9iaxx+5RiB8caATBtfvZP7zVxQ==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-android-arm64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.7.tgz\",\"integrity\":\"sha512-l17HE9EweWaqJZhuUuNBN/FzM62xw+DECVnJyvMsxn8vJFAGLy5QfLDoYAcronkAN8VxKZHezDpulHDPx95vFw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-darwin-arm64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.7.tgz\",\"integrity\":\"sha512-8ED8ELFvHXc6OCETIn4gXObPiaR6bckM/ipXtbzlPVDRMBfEGjCKgO90F9YtfdpDatVx/ZQw7aZ1vUMf/+T3Mw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-darwin-x64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.7.tgz\",\"integrity\":\"sha512-/WPripjtiAIZ2tWY7ddijORT0Ujg87wxWW/qcoFVCKAWVDPhtY0xr7Dj0M3GyNGz60jGwTElhro/mkF9dT7dDQ==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-freebsd-x64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.7.tgz\",\"integrity\":\"sha512-14DI4NcqpvbICxSnGLx3PmtDaWqRP/KGSGb6C+JLLVPeZRl6dKdHba3pGsqT3vpdTqhEYIPG0MMQ8c0xYqoJxA==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-arm-gnueabihf\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.7.tgz\",\"integrity\":\"sha512-bxrWIRvHWQvbJwi+VIie/kDJmQxcNE6xxWwZdqF/ExVAigtHkv54WTLQPb+QsZdnFy18fg7JPfWGL0RH6vwIlQ==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-arm64-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.7.tgz\",\"integrity\":\"sha512-toOY2BChBZyuxU7OYX6Tn389di4IzAqPTycVcci0O7FSfBqzRB3RZn+K5Is6ANf4tmgRd/K1yZTsNTXbkXsnLg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-arm64-musl\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.7.tgz\",\"integrity\":\"sha512-lAIXTH/aiLRLxsTgQvfhjo4K1ydWIp00+V0voOr9beb/9ZmkUFrSIb03dXNFRgMNvkE6oGsF10ioQ6UsI+vS5Q==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-ppc64-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.7.tgz\",\"integrity\":\"sha512-kdnwS28Pkenp/mZMRwjXXXwxQ7pIsm+bF919LUK93BOyhcLsrVKdP2p9fxpiPNPAbNuch8ypQt0pm2P2LYCAGg==\",\"cpu\":[\"ppc64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-s390x-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.7.tgz\",\"integrity\":\"sha512-516OdsyLdr5E65paF3yBF55t8mfm9+gmtCsK3xI7XKXIT7EfRlHhxL8K/NR6Hu8BWSgF5+1w74lTL0+nxcc8Qw==\",\"cpu\":[\"s390x\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-x64-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.7.tgz\",\"integrity\":\"sha512-r8/z8n7GFaYRln3xmP1Cxy0HH/HLM0uBUPkEuSVEfKGDA89M0FsZRZJRSwe/tJjRx+fpH/gjorfhB8tmEbSFLA==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-x64-musl\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.7.tgz\",\"integrity\":\"sha512-pAsE8iiDxUg1xBqdhrTfg45AVDVpirjz00sblEYClGNNcMnDb+e8beQgqIAw6LvauX/APvgxUnwrgun/YYGBhw==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-openharmony-arm64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.7.tgz\",\"integrity\":\"sha512-lTcIYmmnQQA8Or/2DatS6oSqcdLHvendjS+zLu+FwgToynWMRSmQdpM65fTANJgIS4mjbMOo5KT2lnT9SAb96w==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openharmony\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-win32-arm64-msvc\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.7.tgz\",\"integrity\":\"sha512-e3Gu3WxbNk/UqQhxqU7YIYO+9ZBvWNz3U+h/qRFosscMFzdRPbXYSaSWgSnklv2fz1TgzBTcti2z35c/7irsHw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-win32-x64-msvc\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.7.tgz\",\"integrity\":\"sha512-W/jg5qoRSqjsEv0+dZi4e687mcHqmVuU0P4fK6qS/xjetW2Gmc1W8j//z5nAeNcC8Ttm0hV46IjcYeuVwYhuiw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/pluginutils\":{\"version\":\"1.0.1\",\"resolved\":\"https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz\",\"integrity\":\"sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==\",\"dev\":true,\"license\":\"MIT\"},\"node_modules/@standard-schema/spec\":{\"version\":\"1.1.0\",\"resolved\":\"https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz\",\"integrity\":\"sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@ts-morph/common\":{\"version\":\"0.28.1\",\"resolved\":\"https://registry.npmjs.org/@ts-morph/common/-/common-0.28.1.tgz\",\"integrity\":\"sha512-W74iWf7ILp1ZKNYXY5qbddNaml7e9Sedv5lvU1V8lftlitkc9Pq1A+jlH23ltDgWYeZFFEqGCD1Ies9hqu3O+g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"minimatch\":\"^10.0.1\",\"path-browserify\":\"^1.0.1\",\"tinyglobby\":\"^0.2.14\"}},\"node_modules/@types/node\":{\"version\":\"26.4.1\",\"resolved\":\"https://registry.npmjs.org/@types/node/-/node-26.4.1.tgz\",\"integrity\":\"sha512-k97ENvZWtvA6yqz5/FS6a7duDgOPEeOQOc2iKS/nY6mX6qJUKtLnWzQS+Xj6tXweyj6ZcTAK2Qecetnvi9nCLA==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"undici-types\":\"~8.3.0\"}},\"node_modules/@typescript/typescript-aix-ppc64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-aix-ppc64/-/typescript-aix-ppc64-7.0.2.tgz\",\"integrity\":\"sha512-MTKKkWB7p/0E9xi1d1tHtZ5PiLkGEMIq88pK2CubZjOsLtYTLqhgIgi6zepFa+9GHZ6h05NMCkQxGKiPXMxXtQ==\",\"cpu\":[\"ppc64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"aix\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-darwin-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-darwin-arm64/-/typescript-darwin-arm64-7.0.2.tgz\",\"integrity\":\"sha512-gowzar9MwS/aRWp6f3a4KUqzRjAZjOsmGNCM6LcTgXum+dBfgsBVMN+AgvOCCbguXyick6LJhpBszxMebJ8syA==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-darwin-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-darwin-x64/-/typescript-darwin-x64-7.0.2.tgz\",\"integrity\":\"sha512-SZ9xZInqApNlNGc9s0W1VSsktYSOe9cFqNOIqmN1Gs8SmkjKZYFt017G4VwPxASInODuAdbTW7sXiFUf893RgA==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-freebsd-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-freebsd-arm64/-/typescript-freebsd-arm64-7.0.2.tgz\",\"integrity\":\"sha512-W5NH4y/J0plIIS5b2xvTEkU7JFxyqdMAOgf+Ilhl0vHQXKO5dZoxd+C/jEtq56c4F3wk71RB4BMRQ2XdI+bwYQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-freebsd-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-freebsd-x64/-/typescript-freebsd-x64-7.0.2.tgz\",\"integrity\":\"sha512-UMGDx5sTpzNw3WiPebH7l90IWfJggEd+egHt/q6p7/Cm3zqoV7VxkGXt+3DxPIw8CcmvAB0j3sVVfbhX+M4Tpw==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-arm\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-arm/-/typescript-linux-arm-7.0.2.tgz\",\"integrity\":\"sha512-gffT3xPz9sR7j/YJExkyPntrI0P2EP9XbOyWzth2/Gs0RstK+90RBcO0ncXoXy/beYll1SXw846Nf2zdnEz0QQ==\",\"cpu\":[\"arm\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-arm64/-/typescript-linux-arm64-7.0.2.tgz\",\"integrity\":\"sha512-Qh4eU4/y3yDjnfjjyPYihMj5/ODIlmt+Bzu17OI+fiSRDW57QmU5SiN63exPRNJPKUzcc1INa1NXdrJ+MqHjUQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-loong64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-loong64/-/typescript-linux-loong64-7.0.2.tgz\",\"integrity\":\"sha512-uEHck9i8hoAzXPiYRib1O7miOnz23SxIeVl6F4LXox+qov1K35jHcEW6VHKvZI+pyvl7fZEP4MCU5LYvIq1GuQ==\",\"cpu\":[\"loong64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-mips64el\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-mips64el/-/typescript-linux-mips64el-7.0.2.tgz\",\"integrity\":\"sha512-R4KvAMnE43W5Qeqb0Ly56O3mWMWIAgsMyz36DCaycd5nbg/9kzm0liw3JocfRqyJY0KPmzFjbswozXyW0DnIYA==\",\"cpu\":[\"mips64el\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-ppc64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-ppc64/-/typescript-linux-ppc64-7.0.2.tgz\",\"integrity\":\"sha512-DORx5b3sd/4S7eayxm4FQv+A7CrkUIGRaHiwI8oiHTAI1fAPWhF4J0vAlkC8biAlHSVVwxMQ3tjZ2/DVbnQiiA==\",\"cpu\":[\"ppc64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-riscv64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-riscv64/-/typescript-linux-riscv64-7.0.2.tgz\",\"integrity\":\"sha512-wf0jqEDOjrPRnKwYRyyJDRo11KMbvMFrU+q4zqKyChODBzvlkbhNQfKvLxQCcwTpdDaXSHZTVuh0JoCrKCUMHQ==\",\"cpu\":[\"riscv64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-s390x\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-s390x/-/typescript-linux-s390x-7.0.2.tgz\",\"integrity\":\"sha512-IkwJc3L7yhytWd/ewjyxNDfOmswCm9GWMJT/ue/dU4aZNbwZeYAetq42VyLmsmSjvoX7z74X6ZaYCtzAr0EuGw==\",\"cpu\":[\"s390x\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-x64/-/typescript-linux-x64-7.0.2.tgz\",\"integrity\":\"sha512-EYdf2cNg7rgCWJnxCdJ+F3V39O8ihb37eHAu1LK8oAFizgTQbPOK7zHHXbPt8rX24COqODXeI3sIf0fCXG7H/A==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-netbsd-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-netbsd-arm64/-/typescript-netbsd-arm64-7.0.2.tgz\",\"integrity\":\"sha512-+polYF4MF04aPpO5FTkHran9yUQDSXqy5GiSDKpsll5jy3l3+g9QLhpf39T+ePtefhXLOGrLl0QIjkQP6VnelA==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-netbsd-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-netbsd-x64/-/typescript-netbsd-x64-7.0.2.tgz\",\"integrity\":\"sha512-8YIT0EHM/3dq10ZOVF/A7pc/YSMtbcecct4rWtexrnSCHOPcpC2KTLXfTCR6vDpnSiY12heNb1GiN/wu+T/FyA==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-openbsd-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-openbsd-arm64/-/typescript-openbsd-arm64-7.0.2.tgz\",\"integrity\":\"sha512-APT8+ClYnuYm1u9+kgGXoMj2VzWzcymwh2gNSQVySHfkRDGOTVkoWLjCmOQSaO+PoqQ57B0flRp9SA+7GnnkzQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-openbsd-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-openbsd-x64/-/typescript-openbsd-x64-7.0.2.tgz\",\"integrity\":\"sha512-yX7s+Q0Dln0Dt9tEzZsAjXXR/+ytBM7AlglaqyeMPxQszJ1JhlJdZ6jLA+IzldHtflX81em7lDao1xXu+aRRkg==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-sunos-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-sunos-x64/-/typescript-sunos-x64-7.0.2.tgz\",\"integrity\":\"sha512-dLJDGaLZ1D4HPQn62u1n8mBDkJREwMsAkCdkwd4Ieqw+x3TUyTsqY0YiBCtE6H6OzzgGk3iuZ3vFWRS+E8/d1g==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"sunos\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-win32-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-win32-arm64/-/typescript-win32-arm64-7.0.2.tgz\",\"integrity\":\"sha512-Gyl1Vy6OsWesLzmq+EP0Fb7b4Nid5232AvcA2SFcdYreldpNtYFFofPjnt62y9hQy7VTaZp65ICJjuAQRaVcIQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-win32-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-win32-x64/-/typescript-win32-x64-7.0.2.tgz\",\"integrity\":\"sha512-0BQ3HkAHHlKLSp1qRvf3SUhGpGsDuhB/jgFw75guyqbxJqEaS0Cw/VFO8i2nHglJUzQCRtMMR/IBAKE3ETMC4g==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/abort-controller\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz\",\"integrity\":\"sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"event-target-shim\":\"^5.0.0\"},\"engines\":{\"node\":\">=6.5\"}},\"node_modules/ansi-regex\":{\"version\":\"5.0.1\",\"resolved\":\"https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz\",\"integrity\":\"sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=8\"}},\"node_modules/ansi-styles\":{\"version\":\"4.3.0\",\"resolved\":\"https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz\",\"integrity\":\"sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"color-convert\":\"^2.0.1\"},\"engines\":{\"node\":\">=8\"},\"funding\":{\"url\":\"https://github.com/chalk/ansi-styles?sponsor=1\"}},\"node_modules/atomic-sleep\":{\"version\":\"1.0.0\",\"resolved\":\"https://registry.npmjs.org/atomic-sleep/-/atomic-sleep-1.0.0.tgz\",\"integrity\":\"sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=8.0.0\"}},\"node_modules/balanced-match\":{\"version\":\"4.0.4\",\"resolved\":\"https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz\",\"integrity\":\"sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\"18 || 20 || >=22\"}},\"node_modules/base64-js\":{\"version\":\"1.5.1\",\"resolved\":\"https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz\",\"integrity\":\"sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/brace-expansion\":{\"version\":\"5.0.12\",\"resolved\":\"https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz\",\"integrity\":\"sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"balanced-match\":\"^4.0.2\"},\"engines\":{\"node\":\"20 || >=22\"}},\"node_modules/buffer\":{\"version\":\"6.0.3\",\"resolved\":\"https://registry.npmjs.org/buffer/-/buffer-6.0.3.tgz\",\"integrity\":\"sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"base64-js\":\"^1.3.1\",\"ieee754\":\"^1.2.1\"}},\"node_modules/cborg\":{\"version\":\"1.10.2\",\"resolved\":\"https://registry.npmjs.org/cborg/-/cborg-1.10.2.tgz\",\"integrity\":\"sha512-b3tFPA9pUr2zCUiCfRd2+wok2/LBSNUMKOuRRok+WlvvAgEt/PlbgPTsZUcwCOs53IJvLgTp0eotwtosE6njug==\",\"inBundle\":true,\"license\":\"Apache-2.0\",\"bin\":{\"cborg\":\"cli.js\"}},\"node_modules/cliui\":{\"version\":\"8.0.1\",\"resolved\":\"https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz\",\"integrity\":\"sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==\",\"inBundle\":true,\"license\":\"ISC\",\"dependencies\":{\"string-width\":\"^4.2.0\",\"strip-ansi\":\"^6.0.1\",\"wrap-ansi\":\"^7.0.0\"},\"engines\":{\"node\":\">=12\"}},\"node_modules/code-block-writer\":{\"version\":\"13.0.3\",\"resolved\":\"https://registry.npmjs.org/code-block-writer/-/code-block-writer-13.0.3.tgz\",\"integrity\":\"sha512-Oofo0pq3IKnsFtuHqSF7TqBfr71aeyZDVJ0HpmqB7FBM2qEigL0iPONSCZSO9pE9dZTAxANe5XHG9Uy0YMv8cg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/color-convert\":{\"version\":\"2.0.1\",\"resolved\":\"https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz\",\"integrity\":\"sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"color-name\":\"~1.1.4\"},\"engines\":{\"node\":\">=7.0.0\"}},\"node_modules/color-name\":{\"version\":\"1.1.4\",\"resolved\":\"https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz\",\"integrity\":\"sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/core-js\":{\"version\":\"3.50.0\",\"resolved\":\"https://registry.npmjs.org/core-js/-/core-js-3.50.0.tgz\",\"integrity\":\"sha512-BRWgOLKkFeCgRudR6zrs8p9XJZcE14grzKMMssoYrk6krtuEZ7MTKPIY5RzOnqsEKIR9kst7wNzphttraT+Yqw==\",\"hasInstallScript\":true,\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\"*\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/core-js\"}},\"node_modules/detect-libc\":{\"version\":\"2.1.2\",\"resolved\":\"https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz\",\"integrity\":\"sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==\",\"dev\":true,\"license\":\"Apache-2.0\",\"engines\":{\"node\":\">=8\"}},\"node_modules/emoji-regex\":{\"version\":\"8.0.0\",\"resolved\":\"https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz\",\"integrity\":\"sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/esbuild\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz\",\"integrity\":\"sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==\",\"dev\":true,\"hasInstallScript\":true,\"license\":\"MIT\",\"bin\":{\"esbuild\":\"bin/esbuild\"},\"engines\":{\"node\":\">=18\"},\"optionalDependencies\":{\"@esbuild/aix-ppc64\":\"0.28.2\",\"@esbuild/android-arm\":\"0.28.2\",\"@esbuild/android-arm64\":\"0.28.2\",\"@esbuild/android-x64\":\"0.28.2\",\"@esbuild/darwin-arm64\":\"0.28.2\",\"@esbuild/darwin-x64\":\"0.28.2\",\"@esbuild/freebsd-arm64\":\"0.28.2\",\"@esbuild/freebsd-x64\":\"0.28.2\",\"@esbuild/linux-arm\":\"0.28.2\",\"@esbuild/linux-arm64\":\"0.28.2\",\"@esbuild/linux-ia32\":\"0.28.2\",\"@esbuild/linux-loong64\":\"0.28.2\",\"@esbuild/linux-mips64el\":\"0.28.2\",\"@esbuild/linux-ppc64\":\"0.28.2\",\"@esbuild/linux-riscv64\":\"0.28.2\",\"@esbuild/linux-s390x\":\"0.28.2\",\"@esbuild/linux-x64\":\"0.28.2\",\"@esbuild/netbsd-arm64\":\"0.28.2\",\"@esbuild/netbsd-x64\":\"0.28.2\",\"@esbuild/openbsd-arm64\":\"0.28.2\",\"@esbuild/openbsd-x64\":\"0.28.2\",\"@esbuild/openharmony-arm64\":\"0.28.2\",\"@esbuild/sunos-x64\":\"0.28.2\",\"@esbuild/win32-arm64\":\"0.28.2\",\"@esbuild/win32-ia32\":\"0.28.2\",\"@esbuild/win32-x64\":\"0.28.2\"}},\"node_modules/escalade\":{\"version\":\"3.2.0\",\"resolved\":\"https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz\",\"integrity\":\"sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=6\"}},\"node_modules/esm-env\":{\"version\":\"1.2.2\",\"resolved\":\"https://registry.npmjs.org/esm-env/-/esm-env-1.2.2.tgz\",\"integrity\":\"sha512-Epxrv+Nr/CaL4ZcFGPJIYLWFom+YeV1DqMLHJoEd9SYRxNbaFruBwfEX/kkHUJf55j2+TUbmDcmuilbP1TmXHA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/event-target-shim\":{\"version\":\"5.0.1\",\"resolved\":\"https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz\",\"integrity\":\"sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=6\"}},\"node_modules/events\":{\"version\":\"3.3.0\",\"resolved\":\"https://registry.npmjs.org/events/-/events-3.3.0.tgz\",\"integrity\":\"sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=0.8.x\"}},\"node_modules/fast-redact\":{\"version\":\"3.5.0\",\"resolved\":\"https://registry.npmjs.org/fast-redact/-/fast-redact-3.5.0.tgz\",\"integrity\":\"sha512-dwsoQlS7h9hMeYUq1W++23NDcBLV4KqONnITDV9DjfS3q1SgDGVrBdvvTLUotWtPSD7asWDV9/CmsZPy8Hf70A==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=6\"}},\"node_modules/fdir\":{\"version\":\"6.5.0\",\"resolved\":\"https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz\",\"integrity\":\"sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=12.0.0\"},\"peerDependencies\":{\"picomatch\":\"^3 || ^4\"},\"peerDependenciesMeta\":{\"picomatch\":{\"optional\":true}}},\"node_modules/fsevents\":{\"version\":\"2.3.3\",\"resolved\":\"https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz\",\"integrity\":\"sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==\",\"dev\":true,\"hasInstallScript\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\"^8.16.0 || ^10.6.0 || >=11.0.0\"}},\"node_modules/get-caller-file\":{\"version\":\"2.0.5\",\"resolved\":\"https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz\",\"integrity\":\"sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\"6.* || 8.* || >= 10.*\"}},\"node_modules/ieee754\":{\"version\":\"1.2.1\",\"resolved\":\"https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz\",\"integrity\":\"sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"BSD-3-Clause\"},\"node_modules/ipaddr.js\":{\"version\":\"2.5.0\",\"resolved\":\"https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-2.5.0.tgz\",\"integrity\":\"sha512-aq+t5NAc+cS6rZQQVWC2x98CPqGtKKTMDd4Gaodv0wShnItdKg/51djkGJ1hqH+Oy0ivDftCbSLCQob8zso01w==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 10\"}},\"node_modules/is-fullwidth-code-point\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz\",\"integrity\":\"sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=8\"}},\"node_modules/iso-datestring-validator\":{\"version\":\"2.2.2\",\"resolved\":\"https://registry.npmjs.org/iso-datestring-validator/-/iso-datestring-validator-2.2.2.tgz\",\"integrity\":\"sha512-yLEMkBbLZTlVQqOnQ4FiMujR6T4DEcCb1xizmvXS+OxuhwcbtynoosRzdMA69zZCShCNAbi+gJ71FxZBBXx1SA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/jose\":{\"version\":\"5.10.0\",\"resolved\":\"https://registry.npmjs.org/jose/-/jose-5.10.0.tgz\",\"integrity\":\"sha512-s+3Al/p9g32Iq+oqXxkW//7jk2Vig6FF1CFqzVXoTUXt2qz89YWbL+OwS17NFYEvxC35n0FKeGO2LGYSxeM2Gg==\",\"license\":\"MIT\",\"funding\":{\"url\":\"https://github.com/sponsors/panva\"},\"inBundle\":true},\"node_modules/jsonata\":{\"version\":\"2.2.2\",\"resolved\":\"https://registry.npmjs.org/jsonata/-/jsonata-2.2.2.tgz\",\"integrity\":\"sha512-XDFH2PuaAXv0AXJEWwElXbqADmKFGKMLMkFb+qOz0EhjQW2EIJ6pgtordLU+4u3IVERyBfqy6bi6kZKEncvRqA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 8\"}},\"node_modules/jsonc-parser\":{\"version\":\"3.3.1\",\"resolved\":\"https://registry.npmjs.org/jsonc-parser/-/jsonc-parser-3.3.1.tgz\",\"integrity\":\"sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/lightningcss\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz\",\"integrity\":\"sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==\",\"dev\":true,\"license\":\"MPL-2.0\",\"dependencies\":{\"detect-libc\":\"^2.0.3\"},\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"},\"optionalDependencies\":{\"lightningcss-android-arm64\":\"1.33.0\",\"lightningcss-darwin-arm64\":\"1.33.0\",\"lightningcss-darwin-x64\":\"1.33.0\",\"lightningcss-freebsd-x64\":\"1.33.0\",\"lightningcss-linux-arm-gnueabihf\":\"1.33.0\",\"lightningcss-linux-arm64-gnu\":\"1.33.0\",\"lightningcss-linux-arm64-musl\":\"1.33.0\",\"lightningcss-linux-x64-gnu\":\"1.33.0\",\"lightningcss-linux-x64-musl\":\"1.33.0\",\"lightningcss-win32-arm64-msvc\":\"1.33.0\",\"lightningcss-win32-x64-msvc\":\"1.33.0\"}},\"node_modules/lightningcss-android-arm64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz\",\"integrity\":\"sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-darwin-arm64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz\",\"integrity\":\"sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-darwin-x64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz\",\"integrity\":\"sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-freebsd-x64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz\",\"integrity\":\"sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-arm-gnueabihf\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz\",\"integrity\":\"sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-arm64-gnu\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz\",\"integrity\":\"sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-arm64-musl\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz\",\"integrity\":\"sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-x64-gnu\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz\",\"integrity\":\"sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-x64-musl\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz\",\"integrity\":\"sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-win32-arm64-msvc\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz\",\"integrity\":\"sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-win32-x64-msvc\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz\",\"integrity\":\"sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lru-cache\":{\"version\":\"10.4.3\",\"resolved\":\"https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz\",\"integrity\":\"sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==\",\"inBundle\":true,\"license\":\"ISC\"},\"node_modules/minimatch\":{\"version\":\"10.2.6\",\"resolved\":\"https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz\",\"integrity\":\"sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==\",\"inBundle\":true,\"license\":\"BlueOak-1.0.0\",\"dependencies\":{\"brace-expansion\":\"^5.0.8\"},\"engines\":{\"node\":\"18 || 20 || >=22\"},\"funding\":{\"url\":\"https://github.com/sponsors/isaacs\"}},\"node_modules/multiformats\":{\"version\":\"9.9.0\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-9.9.0.tgz\",\"integrity\":\"sha512-HoMUjhH9T8DDBNT+6xzkrd9ga/XiBI4xLr58LJACwK6G3HTOPeMz4nB4KJs33L2BelrIJa7P0VuNaVF3hMYfjg==\",\"inBundle\":true,\"license\":\"(Apache-2.0 AND MIT)\"},\"node_modules/nanoid\":{\"version\":\"3.3.18\",\"resolved\":\"https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz\",\"integrity\":\"sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==\",\"dev\":true,\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/ai\"}],\"license\":\"MIT\",\"bin\":{\"nanoid\":\"bin/nanoid.cjs\"},\"engines\":{\"node\":\"^10 || ^12 || ^13.7 || ^14 || >=15.0.1\"}},\"node_modules/on-exit-leak-free\":{\"version\":\"2.1.2\",\"resolved\":\"https://registry.npmjs.org/on-exit-leak-free/-/on-exit-leak-free-2.1.2.tgz\",\"integrity\":\"sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=14.0.0\"}},\"node_modules/path-browserify\":{\"version\":\"1.0.1\",\"resolved\":\"https://registry.npmjs.org/path-browserify/-/path-browserify-1.0.1.tgz\",\"integrity\":\"sha512-b7uo2UCUOYZcnF/3ID0lulOJi/bafxa1xPe7ZPsammBSpjSWQkjNxlt635YGS2MiR9GjvuXCtz2emr3jbsz98g==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/picocolors\":{\"version\":\"1.1.1\",\"resolved\":\"https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz\",\"integrity\":\"sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==\",\"dev\":true,\"license\":\"ISC\"},\"node_modules/picomatch\":{\"version\":\"4.0.7\",\"resolved\":\"https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz\",\"integrity\":\"sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=12\"},\"funding\":{\"url\":\"https://github.com/sponsors/jonschlinkert\"}},\"node_modules/pino\":{\"version\":\"8.21.0\",\"resolved\":\"https://registry.npmjs.org/pino/-/pino-8.21.0.tgz\",\"integrity\":\"sha512-ip4qdzjkAyDDZklUaZkcRFb2iA118H9SgRh8yzTkSQK8HilsOJF7rSY8HoW5+I0M46AZgX/pxbprf2vvzQCE0Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"atomic-sleep\":\"^1.0.0\",\"fast-redact\":\"^3.1.1\",\"on-exit-leak-free\":\"^2.1.0\",\"pino-abstract-transport\":\"^1.2.0\",\"pino-std-serializers\":\"^6.0.0\",\"process-warning\":\"^3.0.0\",\"quick-format-unescaped\":\"^4.0.3\",\"real-require\":\"^0.2.0\",\"safe-stable-stringify\":\"^2.3.1\",\"sonic-boom\":\"^3.7.0\",\"thread-stream\":\"^2.6.0\"},\"bin\":{\"pino\":\"bin.js\"}},\"node_modules/pino-abstract-transport\":{\"version\":\"1.2.0\",\"resolved\":\"https://registry.npmjs.org/pino-abstract-transport/-/pino-abstract-transport-1.2.0.tgz\",\"integrity\":\"sha512-Guhh8EZfPCfH+PMXAb6rKOjGQEoy0xlAIn+irODG5kgfYV+BQ0rGYYWTIel3P5mmyXqkYkPmdIkywsn6QKUR1Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"readable-stream\":\"^4.0.0\",\"split2\":\"^4.0.0\"}},\"node_modules/pino-std-serializers\":{\"version\":\"6.2.2\",\"resolved\":\"https://registry.npmjs.org/pino-std-serializers/-/pino-std-serializers-6.2.2.tgz\",\"integrity\":\"sha512-cHjPPsE+vhj/tnhCy/wiMh3M3z3h/j15zHQX+S9GkTBgqJuTuJzYJ4gUyACLhDaJ7kk9ba9iRDmbH2tJU03OiA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/playwright\":{\"version\":\"1.63.0\",\"resolved\":\"https://registry.npmjs.org/playwright/-/playwright-1.63.0.tgz\",\"integrity\":\"sha512-+7ziBLidS4NaNCdt57SUDT+wYmmd5fmiQejUic/kb+YsYSCPyOOE9sebzMjNmQrsnNpDJqd4WHvV/8lfKfUDUg==\",\"dev\":true,\"license\":\"Apache-2.0\",\"dependencies\":{\"playwright-core\":\"1.63.0\"},\"bin\":{\"playwright\":\"cli.js\"},\"engines\":{\"node\":\">=20\"}},\"node_modules/playwright-core\":{\"version\":\"1.63.0\",\"resolved\":\"https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz\",\"integrity\":\"sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==\",\"dev\":true,\"license\":\"Apache-2.0\",\"bin\":{\"playwright-core\":\"cli.js\"},\"engines\":{\"node\":\">=20\"}},\"node_modules/postcss\":{\"version\":\"8.5.28\",\"resolved\":\"https://registry.npmjs.org/postcss/-/postcss-8.5.28.tgz\",\"integrity\":\"sha512-RRuzqDtt5Y9h3quz5hWhK+TPnsmVs6WwSU6LkJMeY4HstUEDuYTG8UJSdawMRzmzAtV+KEoG8N3Qg2qLy5vM/A==\",\"dev\":true,\"funding\":[{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/postcss/\"},{\"type\":\"tidelift\",\"url\":\"https://tidelift.com/funding/github/npm/postcss\"},{\"type\":\"github\",\"url\":\"https://github.com/sponsors/ai\"}],\"license\":\"MIT\",\"dependencies\":{\"nanoid\":\"^3.3.18\",\"picocolors\":\"^1.1.1\",\"source-map-js\":\"^1.2.1\"},\"engines\":{\"node\":\"^10 || ^12 || >=14\"}},\"node_modules/prettier\":{\"version\":\"3.9.9\",\"resolved\":\"https://registry.npmjs.org/prettier/-/prettier-3.9.9.tgz\",\"integrity\":\"sha512-Z/CJHIkdujO/OtN7nXUii0Rf3VT5SRuhjBA82Xvu2XhBUgX3nhP67T0LHceBdQLex7OOFGTox+Q5Yg8Jk2Qivg==\",\"inBundle\":true,\"license\":\"MIT\",\"bin\":{\"prettier\":\"bin/prettier.cjs\"},\"engines\":{\"node\":\">=14\"},\"funding\":{\"url\":\"https://github.com/prettier/prettier?sponsor=1\"}},\"node_modules/process\":{\"version\":\"0.11.10\",\"resolved\":\"https://registry.npmjs.org/process/-/process-0.11.10.tgz\",\"integrity\":\"sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 0.6.0\"}},\"node_modules/process-warning\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/process-warning/-/process-warning-3.0.0.tgz\",\"integrity\":\"sha512-mqn0kFRl0EoqhnL0GQ0veqFHyIN1yig9RHh/InzORTUiZHFRAur+aMtRkELNwGs9aNwKS6tg/An4NYBPGwvtzQ==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/quick-format-unescaped\":{\"version\":\"4.0.4\",\"resolved\":\"https://registry.npmjs.org/quick-format-unescaped/-/quick-format-unescaped-4.0.4.tgz\",\"integrity\":\"sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/readable-stream\":{\"version\":\"4.7.0\",\"resolved\":\"https://registry.npmjs.org/readable-stream/-/readable-stream-4.7.0.tgz\",\"integrity\":\"sha512-oIGGmcpTLwPga8Bn6/Z75SVaH1z5dUut2ibSyAMVhmUggWpmDn2dapB0n7f8nwaSiRtepAsfJyfXIO5DCVAODg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"abort-controller\":\"^3.0.0\",\"buffer\":\"^6.0.3\",\"events\":\"^3.3.0\",\"process\":\"^0.11.10\",\"string_decoder\":\"^1.3.0\"},\"engines\":{\"node\":\"^12.22.0 || ^14.17.0 || >=16.0.0\"}},\"node_modules/real-require\":{\"version\":\"0.2.0\",\"resolved\":\"https://registry.npmjs.org/real-require/-/real-require-0.2.0.tgz\",\"integrity\":\"sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 12.13.0\"}},\"node_modules/require-directory\":{\"version\":\"2.1.1\",\"resolved\":\"https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz\",\"integrity\":\"sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=0.10.0\"}},\"node_modules/rolldown\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/rolldown/-/rolldown-1.2.7.tgz\",\"integrity\":\"sha512-g0EtLvBjTUB7jhyV0S/TCup3v/XSVl45vUIGbOGU4QPiyjTenCe4mKuFvW9fEgYmS2Fo42AUssRmNuMziXdrig==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"@oxc-project/types\":\"=0.148.0\",\"@rolldown/pluginutils\":\"^1.0.0\"},\"bin\":{\"rolldown\":\"bin/cli.mjs\"},\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"},\"optionalDependencies\":{\"@rolldown/binding-android-arm-eabi\":\"1.2.7\",\"@rolldown/binding-android-arm64\":\"1.2.7\",\"@rolldown/binding-darwin-arm64\":\"1.2.7\",\"@rolldown/binding-darwin-x64\":\"1.2.7\",\"@rolldown/binding-freebsd-x64\":\"1.2.7\",\"@rolldown/binding-linux-arm-gnueabihf\":\"1.2.7\",\"@rolldown/binding-linux-arm64-gnu\":\"1.2.7\",\"@rolldown/binding-linux-arm64-musl\":\"1.2.7\",\"@rolldown/binding-linux-ppc64-gnu\":\"1.2.7\",\"@rolldown/binding-linux-s390x-gnu\":\"1.2.7\",\"@rolldown/binding-linux-x64-gnu\":\"1.2.7\",\"@rolldown/binding-linux-x64-musl\":\"1.2.7\",\"@rolldown/binding-openharmony-arm64\":\"1.2.7\",\"@rolldown/binding-win32-arm64-msvc\":\"1.2.7\",\"@rolldown/binding-win32-x64-msvc\":\"1.2.7\"}},\"node_modules/safe-buffer\":{\"version\":\"5.2.1\",\"resolved\":\"https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz\",\"integrity\":\"sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/safe-stable-stringify\":{\"version\":\"2.5.0\",\"resolved\":\"https://registry.npmjs.org/safe-stable-stringify/-/safe-stable-stringify-2.5.0.tgz\",\"integrity\":\"sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=10\"}},\"node_modules/sonic-boom\":{\"version\":\"3.8.1\",\"resolved\":\"https://registry.npmjs.org/sonic-boom/-/sonic-boom-3.8.1.tgz\",\"integrity\":\"sha512-y4Z8LCDBuum+PBP3lSV7RHrXscqksve/bi0as7mhwVnBW+/wUqKT/2Kb7um8yqcFy0duYbbPxzt89Zy2nOCaxg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"atomic-sleep\":\"^1.0.0\"}},\"node_modules/source-map-js\":{\"version\":\"1.2.1\",\"resolved\":\"https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz\",\"integrity\":\"sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==\",\"dev\":true,\"license\":\"BSD-3-Clause\",\"engines\":{\"node\":\">=0.10.0\"}},\"node_modules/split2\":{\"version\":\"4.2.0\",\"resolved\":\"https://registry.npmjs.org/split2/-/split2-4.2.0.tgz\",\"integrity\":\"sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\">= 10.x\"}},\"node_modules/string_decoder\":{\"version\":\"1.3.0\",\"resolved\":\"https://registry.npmjs.org/string_decoder/-/string_decoder-1.3.0.tgz\",\"integrity\":\"sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"safe-buffer\":\"~5.2.0\"}},\"node_modules/string-width\":{\"version\":\"4.2.3\",\"resolved\":\"https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz\",\"integrity\":\"sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"emoji-regex\":\"^8.0.0\",\"is-fullwidth-code-point\":\"^3.0.0\",\"strip-ansi\":\"^6.0.1\"},\"engines\":{\"node\":\">=8\"}},\"node_modules/strip-ansi\":{\"version\":\"6.0.1\",\"resolved\":\"https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz\",\"integrity\":\"sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"ansi-regex\":\"^5.0.1\"},\"engines\":{\"node\":\">=8\"}},\"node_modules/thread-stream\":{\"version\":\"2.7.0\",\"resolved\":\"https://registry.npmjs.org/thread-stream/-/thread-stream-2.7.0.tgz\",\"integrity\":\"sha512-qQiRWsU/wvNolI6tbbCKd9iKaTnCXsTwVxhhKM6nctPdujTyztjlbUkUTUymidWcMnZ5pWR0ej4a0tjsW021vw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"real-require\":\"^0.2.0\"}},\"node_modules/tinyglobby\":{\"version\":\"0.2.17\",\"resolved\":\"https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz\",\"integrity\":\"sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"fdir\":\"^6.5.0\",\"picomatch\":\"^4.0.4\"},\"engines\":{\"node\":\">=12.0.0\"},\"funding\":{\"url\":\"https://github.com/sponsors/SuperchupuDev\"}},\"node_modules/ts-morph\":{\"version\":\"27.0.2\",\"resolved\":\"https://registry.npmjs.org/ts-morph/-/ts-morph-27.0.2.tgz\",\"integrity\":\"sha512-fhUhgeljcrdZ+9DZND1De1029PrE+cMkIP7ooqkLRTrRLTqcki2AstsyJm0vRNbTbVCNJ0idGlbBrfqc7/nA8w==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@ts-morph/common\":\"~0.28.1\",\"code-block-writer\":\"^13.0.3\"}},\"node_modules/tslib\":{\"version\":\"2.8.1\",\"resolved\":\"https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz\",\"integrity\":\"sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/tsx\":{\"version\":\"4.23.13\",\"resolved\":\"https://registry.npmjs.org/tsx/-/tsx-4.23.13.tgz\",\"integrity\":\"sha512-BL5MGkRln6aDYhb0xbQlEAGw743BaZYWdbWtdJOBriYJboKgUUYCadFp2/FpBBZquBC/ezNBn7wMMPx7FDZUDw==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"esbuild\":\"~0.28.0\"},\"bin\":{\"tsx\":\"dist/cli.mjs\"},\"engines\":{\"node\":\">=18.0.0\"},\"optionalDependencies\":{\"fsevents\":\"~2.3.3\"}},\"node_modules/typescript\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz\",\"integrity\":\"sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==\",\"devOptional\":true,\"inBundle\":true,\"license\":\"Apache-2.0\",\"bin\":{\"tsc\":\"bin/tsc\"},\"engines\":{\"node\":\">=16.20.0\"},\"optionalDependencies\":{\"@typescript/typescript-aix-ppc64\":\"7.0.2\",\"@typescript/typescript-darwin-arm64\":\"7.0.2\",\"@typescript/typescript-darwin-x64\":\"7.0.2\",\"@typescript/typescript-freebsd-arm64\":\"7.0.2\",\"@typescript/typescript-freebsd-x64\":\"7.0.2\",\"@typescript/typescript-linux-arm\":\"7.0.2\",\"@typescript/typescript-linux-arm64\":\"7.0.2\",\"@typescript/typescript-linux-loong64\":\"7.0.2\",\"@typescript/typescript-linux-mips64el\":\"7.0.2\",\"@typescript/typescript-linux-ppc64\":\"7.0.2\",\"@typescript/typescript-linux-riscv64\":\"7.0.2\",\"@typescript/typescript-linux-s390x\":\"7.0.2\",\"@typescript/typescript-linux-x64\":\"7.0.2\",\"@typescript/typescript-netbsd-arm64\":\"7.0.2\",\"@typescript/typescript-netbsd-x64\":\"7.0.2\",\"@typescript/typescript-openbsd-arm64\":\"7.0.2\",\"@typescript/typescript-openbsd-x64\":\"7.0.2\",\"@typescript/typescript-sunos-x64\":\"7.0.2\",\"@typescript/typescript-win32-arm64\":\"7.0.2\",\"@typescript/typescript-win32-x64\":\"7.0.2\"}},\"node_modules/uint8arrays\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/uint8arrays/-/uint8arrays-3.0.0.tgz\",\"integrity\":\"sha512-HRCx0q6O9Bfbp+HHSfQQKD7wU70+lydKVt4EghkdOvlK/NlrF90z+eXV34mUd48rNvVJXwkrMSPpCATkct8fJA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.4.2\"}},\"node_modules/undici_v6\":{\"name\":\"undici\",\"version\":\"6.29.0\",\"resolved\":\"https://registry.npmjs.org/undici/-/undici-6.29.0.tgz\",\"integrity\":\"sha512-R+RODBqp6i2pPflGdq+xIOUkl+RNfGgHwoinecKu/JCuf2uO06cOKoDbI2P7Dn6KcswdKwrczbU6IYJ6K8X+wg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=18.17\"}},\"node_modules/undici_v7\":{\"name\":\"undici\",\"version\":\"7.30.0\",\"resolved\":\"https://registry.npmjs.org/undici/-/undici-7.30.0.tgz\",\"integrity\":\"sha512-dkrQXeHSaoamnItlYbmzG0wFYrM0ZwDxCIg0A7aKjTyyhh9svRzCNFEzV+Vm05/yehjCzjDZ31KXfGEjYSztDQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=20.18.1\"}},\"node_modules/undici_v8\":{\"name\":\"undici\",\"version\":\"8.11.2\",\"resolved\":\"https://registry.npmjs.org/undici/-/undici-8.11.2.tgz\",\"integrity\":\"sha512-u4UB2/IrKdU6lFxumHmmo1a3fCQO5tzQllRorfoRS63txhrB7xTpSn1PftwC4qEHkOaqP95fCWW4lJzwErwzhQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=22.19.0\"}},\"node_modules/undici-types\":{\"version\":\"8.3.0\",\"resolved\":\"https://registry.npmjs.org/undici-types/-/undici-types-8.3.0.tgz\",\"integrity\":\"sha512-j375ScV60dom+YkPFIfTLcOiPxkN/buHz5GobjLhixFuANaNs3C9l4GmrWqejgXWJ7BbJcFYpTEUkS1Ge8bpZQ==\",\"dev\":true,\"license\":\"MIT\"},\"node_modules/unicode-segmenter\":{\"version\":\"0.14.5\",\"resolved\":\"https://registry.npmjs.org/unicode-segmenter/-/unicode-segmenter-0.14.5.tgz\",\"integrity\":\"sha512-jHGmj2LUuqDcX3hqY12Ql+uhUTn8huuxNZGq7GvtF6bSybzH3aFgedYu/KTzQStEgt1Ra2F3HxadNXsNjb3m3g==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/valibot\":{\"version\":\"1.5.0\",\"resolved\":\"https://registry.npmjs.org/valibot/-/valibot-1.5.0.tgz\",\"integrity\":\"sha512-nil6AkP2TChWL43Z5uJ6GTxX01CUA+g8LWUM+N/rB9NBbkUMaUsi9PUNzlUPgoKASgmx9f7eGOYpJ04/fSa6FQ==\",\"inBundle\":true,\"license\":\"MIT\",\"peerDependencies\":{\"typescript\":\">=5\"},\"peerDependenciesMeta\":{\"typescript\":{\"optional\":true}}},\"node_modules/varint\":{\"version\":\"6.0.0\",\"resolved\":\"https://registry.npmjs.org/varint/-/varint-6.0.0.tgz\",\"integrity\":\"sha512-cXEIW6cfr15lFv563k4GuVuW/fiwjknytD37jIOLSdSWuOI6WnO/oKwmP2FQTU2l01LP8/M5TSAJpzUaGe3uWg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/vite\":{\"version\":\"8.2.2\",\"resolved\":\"https://registry.npmjs.org/vite/-/vite-8.2.2.tgz\",\"integrity\":\"sha512-cFKLV/PRgAUlIRm5WjMjJ86jrftzpqcgH+Us+DS8mI3CDNiH30Whrz8uHL3+MOLPAgqbMBAqWdAHAphOAM+z/Q==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"lightningcss\":\"^1.33.0\",\"picomatch\":\"^4.0.5\",\"postcss\":\"^8.5.26\",\"rolldown\":\"~1.2.4\",\"tinyglobby\":\"^0.2.17\"},\"bin\":{\"vite\":\"bin/vite.js\"},\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"},\"funding\":{\"url\":\"https://github.com/vitejs/vite?sponsor=1\"},\"optionalDependencies\":{\"fsevents\":\"~2.3.3\"},\"peerDependencies\":{\"@types/node\":\"^20.19.0 || >=22.12.0\",\"@vitejs/devtools\":\"^0.4.0 || ^0.5.0\",\"esbuild\":\"^0.27.0 || ^0.28.0\",\"jiti\":\">=1.21.0\",\"less\":\"^4.0.0\",\"sass\":\"^1.70.0\",\"sass-embedded\":\"^1.70.0\",\"stylus\":\">=0.54.8\",\"sugarss\":\"^5.0.0\",\"terser\":\"^5.16.0\",\"tsx\":\"^4.8.1\",\"yaml\":\"^2.4.2\"},\"peerDependenciesMeta\":{\"@types/node\":{\"optional\":true},\"@vitejs/devtools\":{\"optional\":true},\"esbuild\":{\"optional\":true},\"jiti\":{\"optional\":true},\"less\":{\"optional\":true},\"sass\":{\"optional\":true},\"sass-embedded\":{\"optional\":true},\"stylus\":{\"optional\":true},\"sugarss\":{\"optional\":true},\"terser\":{\"optional\":true},\"tsx\":{\"optional\":true},\"yaml\":{\"optional\":true}}},\"node_modules/wrap-ansi\":{\"version\":\"7.0.0\",\"resolved\":\"https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz\",\"integrity\":\"sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"ansi-styles\":\"^4.0.0\",\"string-width\":\"^4.1.0\",\"strip-ansi\":\"^6.0.0\"},\"engines\":{\"node\":\">=10\"},\"funding\":{\"url\":\"https://github.com/chalk/wrap-ansi?sponsor=1\"}},\"node_modules/y18n\":{\"version\":\"5.0.8\",\"resolved\":\"https://registry.npmjs.org/y18n/-/y18n-5.0.8.tgz\",\"integrity\":\"sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\">=10\"}},\"node_modules/yargs\":{\"version\":\"17.7.3\",\"resolved\":\"https://registry.npmjs.org/yargs/-/yargs-17.7.3.tgz\",\"integrity\":\"sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"cliui\":\"^8.0.1\",\"escalade\":\"^3.1.1\",\"get-caller-file\":\"^2.0.5\",\"require-directory\":\"^2.1.1\",\"string-width\":\"^4.2.3\",\"y18n\":\"^5.0.5\",\"yargs-parser\":\"^21.1.1\"},\"engines\":{\"node\":\">=12\"}},\"node_modules/yargs-parser\":{\"version\":\"21.1.1\",\"resolved\":\"https://registry.npmjs.org/yargs-parser/-/yargs-parser-21.1.1.tgz\",\"integrity\":\"sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\">=12\"}},\"node_modules/zod\":{\"version\":\"3.25.76\",\"resolved\":\"https://registry.npmjs.org/zod/-/zod-3.25.76.tgz\",\"integrity\":\"sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==\",\"inBundle\":true,\"license\":\"MIT\",\"funding\":{\"url\":\"https://github.com/sponsors/colinhacks\"}}}")
}, ka = Object.freeze([Object.freeze({
	package: "valibot",
	version: "1.5.0",
	peer: "typescript",
	purpose: "optional typechecking only"
})]), Aa = [
	["node_modules/@atcute/car", Jt],
	["node_modules/@atcute/cbor", Yt],
	["node_modules/@atcute/cid", Xt],
	["node_modules/@atcute/crypto", Zt],
	["node_modules/@atcute/did-plc", Qt],
	["node_modules/@atcute/identity", $t],
	["node_modules/@atcute/lexicons", en],
	["node_modules/@atcute/mst", tn],
	["node_modules/@atcute/multibase", nn],
	["node_modules/@atcute/repo", rn],
	["node_modules/@atcute/uint8array", an],
	["node_modules/@atcute/util-fetch", on],
	["node_modules/@atcute/util-text", sn],
	["node_modules/@atcute/util-text/node_modules/unicode-segmenter", cn],
	["node_modules/@atcute/varint", ln],
	["node_modules/@atproto-labs/did-resolver", un],
	["node_modules/@atproto-labs/fetch", dn],
	["node_modules/@atproto-labs/fetch-node", fn],
	["node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch", pn],
	["node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe", mn],
	["node_modules/@atproto-labs/handle-resolver", hn],
	["node_modules/@atproto-labs/handle-resolver-node", gn],
	["node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did", _n],
	["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store", vn],
	["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory", yn],
	["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did", bn],
	["node_modules/@atproto-labs/identity-resolver", xn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver", Sn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch", Cn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe", wn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store", Tn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory", En],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did", Dn],
	["node_modules/@atproto-labs/pipe", On],
	["node_modules/@atproto-labs/simple-store", kn],
	["node_modules/@atproto-labs/simple-store-memory", An],
	["node_modules/@atproto/common", jn],
	["node_modules/@atproto/common-web", Mn],
	["node_modules/@atproto/common/node_modules/@atproto/common-web", Nn],
	["node_modules/@atproto/common/node_modules/@atproto/lex-cbor", Pn],
	["node_modules/@atproto/common/node_modules/@atproto/lex-data", Fn],
	["node_modules/@atproto/common/node_modules/@atproto/lex-json", In],
	["node_modules/@atproto/common/node_modules/@atproto/syntax", Ln],
	["node_modules/@atproto/crypto", Rn],
	["node_modules/@atproto/did", zn],
	["node_modules/@atproto/jwk", Bn],
	["node_modules/@atproto/jwk-jose", Vn],
	["node_modules/@atproto/jwk-webcrypto", Hn],
	["node_modules/@atproto/jwk/node_modules/multiformats", Un],
	["node_modules/@atproto/lex", Wn],
	["node_modules/@atproto/lex-builder", Gn],
	["node_modules/@atproto/lex-cbor", Kn],
	["node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data", qn],
	["node_modules/@atproto/lex-client", Jn],
	["node_modules/@atproto/lex-client/node_modules/@atproto/lex-data", Yn],
	["node_modules/@atproto/lex-client/node_modules/@atproto/lex-json", Xn],
	["node_modules/@atproto/lex-data", Zn],
	["node_modules/@atproto/lex-data/node_modules/multiformats", Qn],
	["node_modules/@atproto/lex-document", $n],
	["node_modules/@atproto/lex-installer", er],
	["node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data", tr],
	["node_modules/@atproto/lex-installer/node_modules/@atproto/syntax", nr],
	["node_modules/@atproto/lex-json", rr],
	["node_modules/@atproto/lex-resolver", ir],
	["node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data", ar],
	["node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax", or],
	["node_modules/@atproto/lex-schema", sr],
	["node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data", cr],
	["node_modules/@atproto/lex-schema/node_modules/@atproto/syntax", lr],
	["node_modules/@atproto/lex/node_modules/@atproto/lex-data", ur],
	["node_modules/@atproto/lex/node_modules/@atproto/lex-json", dr],
	["node_modules/@atproto/lexicon", fr],
	["node_modules/@atproto/lexicon/node_modules/multiformats", pr],
	["node_modules/@atproto/oauth-client", mr],
	["node_modules/@atproto/oauth-client-browser", hr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver", gr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch", _r],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe", vr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store", yr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory", br],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did", xr],
	["node_modules/@atproto/oauth-client-node", Sr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver", Cr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch", wr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe", Tr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store", Er],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory", Dr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto/did", Or],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver", kr],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch", Ar],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe", jr],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store", Mr],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory", Nr],
	["node_modules/@atproto/oauth-client/node_modules/@atproto/did", Pr],
	["node_modules/@atproto/oauth-client/node_modules/multiformats", Fr],
	["node_modules/@atproto/oauth-types", Ir],
	["node_modules/@atproto/oauth-types/node_modules/@atproto/did", Lr],
	["node_modules/@atproto/repo", Rr],
	["node_modules/@atproto/repo/node_modules/@atproto/common-web", zr],
	["node_modules/@atproto/repo/node_modules/@atproto/lex-data", Br],
	["node_modules/@atproto/repo/node_modules/@atproto/lex-json", Vr],
	["node_modules/@atproto/repo/node_modules/@atproto/lexicon", Hr],
	["node_modules/@atproto/repo/node_modules/@atproto/syntax", Ur],
	["node_modules/@atproto/syntax", Wr],
	["node_modules/@atproto/xrpc", Gr],
	["node_modules/@atproto/xrpc/node_modules/@atproto/common-web", Kr],
	["node_modules/@atproto/xrpc/node_modules/@atproto/lexicon", qr],
	["node_modules/@atproto/xrpc/node_modules/@atproto/syntax", Jr],
	["node_modules/@atproto/xrpc/node_modules/multiformats", Yr],
	["node_modules/@inlay/core", Xr],
	["node_modules/@inlay/core/node_modules/@atproto/syntax", Zr],
	["node_modules/@inlay/render", Qr],
	["node_modules/@inlay/render/node_modules/@atproto/common-web", $r],
	["node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax", ei],
	["node_modules/@inlay/render/node_modules/@atproto/lex-data", ti],
	["node_modules/@inlay/render/node_modules/@atproto/lex-json", ni],
	["node_modules/@inlay/render/node_modules/@atproto/lexicon", ri],
	["node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax", ii],
	["node_modules/@inlay/render/node_modules/@atproto/syntax", ai],
	["node_modules/@ipld/dag-cbor", oi],
	["node_modules/@noble/curves", si],
	["node_modules/@noble/hashes", ci],
	["node_modules/@noble/secp256k1", li],
	["node_modules/@oomfware/eval", ui],
	["node_modules/@standard-schema/spec", di],
	["node_modules/@ts-morph/common", fi],
	["node_modules/abort-controller", pi],
	["node_modules/ansi-regex", mi],
	["node_modules/ansi-styles", hi],
	["node_modules/atomic-sleep", gi],
	["node_modules/balanced-match", _i],
	["node_modules/base64-js", vi],
	["node_modules/brace-expansion", yi],
	["node_modules/buffer", bi],
	["node_modules/cborg", xi],
	["node_modules/cliui", Si],
	["node_modules/code-block-writer", Ci],
	["node_modules/color-convert", wi],
	["node_modules/color-name", Ti],
	["node_modules/core-js", Ei],
	["node_modules/emoji-regex", Di],
	["node_modules/escalade", Oi],
	["node_modules/esm-env", ki],
	["node_modules/event-target-shim", Ai],
	["node_modules/events", ji],
	["node_modules/fast-redact", Mi],
	["node_modules/fdir", Ni],
	["node_modules/get-caller-file", Pi],
	["node_modules/ieee754", Fi],
	["node_modules/ipaddr.js", Ii],
	["node_modules/is-fullwidth-code-point", Li],
	["node_modules/iso-datestring-validator", Ri],
	["node_modules/jose", zi],
	["node_modules/jsonata", Bi],
	["node_modules/jsonc-parser", Vi],
	["node_modules/lru-cache", Hi],
	["node_modules/minimatch", Ui],
	["node_modules/multiformats", Wi],
	["node_modules/on-exit-leak-free", Gi],
	["node_modules/path-browserify", Ki],
	["node_modules/picomatch", qi],
	["node_modules/pino", Ji],
	["node_modules/pino-abstract-transport", Yi],
	["node_modules/pino-std-serializers", Xi],
	["node_modules/prettier", Zi],
	["node_modules/process", Qi],
	["node_modules/process-warning", $i],
	["node_modules/quick-format-unescaped", ea],
	["node_modules/readable-stream", ta],
	["node_modules/real-require", na],
	["node_modules/require-directory", ra],
	["node_modules/safe-buffer", ia],
	["node_modules/safe-stable-stringify", aa],
	["node_modules/sonic-boom", oa],
	["node_modules/split2", sa],
	["node_modules/string-width", ca],
	["node_modules/string_decoder", la],
	["node_modules/strip-ansi", ua],
	["node_modules/thread-stream", da],
	["node_modules/tinyglobby", fa],
	["node_modules/ts-morph", pa],
	["node_modules/tslib", ma],
	["node_modules/uint8arrays", ha],
	["node_modules/undici_v6", ga],
	["node_modules/undici_v7", _a],
	["node_modules/undici_v8", va],
	["node_modules/unicode-segmenter", ya],
	["node_modules/valibot", ba],
	["node_modules/varint", xa],
	["node_modules/wrap-ansi", Sa],
	["node_modules/y18n", Ca],
	["node_modules/yargs", wa],
	["node_modules/yargs-parser", Ta],
	["node_modules/zod", Ea]
];
function ja(e, t) {
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = e, r = t;
		return Object.keys(n).length === Object.keys(r).length && Object.keys(n).every((e) => Object.hasOwn(r, e) && ja(n[e], r[e]));
	}
	return e === t;
}
var Ma = !1;
function Na(e = Aa) {
	if (!(e === Aa && Ma)) {
		if (new Set(e.map(([e]) => e)).size !== e.length) throw new p("dependency_mismatch", "Duplicate dependency identity");
		if (e.length !== Object.keys(Da.packages).length) throw new p("dependency_mismatch", "Dependency closure is incomplete");
		for (let [t, n] of e) {
			let e = Da.packages[t], r = n, i = Oa.packages[t];
			if (!e || !r || !i || r.version !== e.version || i.integrity !== e.integrity || i.version !== e.version || [
				"dependencies",
				"optionalDependencies",
				"peerDependencies",
				"peerDependenciesMeta"
			].some((t) => !ja(r[t] ?? {}, e[t] ?? {}) || !ja(i[t] ?? {}, e[t] ?? {}))) throw new p("dependency_mismatch", `Unapproved dependency: ${t}`);
		}
		if (!ja(Da.nonExecutedPeers, ka) || !ja(qt.imports, Da.imports) || !ja(qt.dependencies, Da.direct) || !ja(Oa.packages[""].dependencies, Da.direct) || Object.entries(Da.buildTools).some(([e, t]) => qt.devDependencies[e] !== t || Oa.packages[""].devDependencies[e] !== t)) throw new p("dependency_mismatch", "Unapproved direct dependencies");
		e === Aa && (Ma = !0);
	}
}
//#endregion
//#region src/core/utf8.ts
function Pa(e) {
	for (let t = 0; t < e.length;) {
		let n = e[t++];
		if (n < 128) continue;
		let r, i = 128, a = 191;
		if (n >= 194 && n <= 223) r = 1;
		else if (n >= 224 && n <= 239) r = 2, n === 224 && (i = 160), n === 237 && (a = 159);
		else if (n >= 240 && n <= 244) r = 3, n === 240 && (i = 144), n === 244 && (a = 143);
		else return !1;
		if (t + r > e.length || e[t] < i || e[t] > a) return !1;
		for (t++; --r > 0;) {
			let n = e[t++];
			if (n < 128 || n > 191) return !1;
		}
	}
	return !0;
}
//#endregion
//#region src/protocol/wire.ts
var Fa = ee;
function Ia(e, t) {
	return e.length === t.length && e.every((e, n) => e === t[n]);
}
function La(e) {
	return e instanceof Error && (e.constructor === SyntaxError && /^(not a valid cid string|invalid binary cid)$/.test(e.message) || e.constructor === RangeError && /^(cid too short|incorrect cid (version|codec|digest codec|digest size) \(got .+\)|cid bytes includes remainder|invalid digest length)$/.test(e.message));
}
function C(e) {
	if (typeof e != "string") throw new m("wire_cid", "Expected a CID string");
	let t;
	try {
		t = Ze(e);
	} catch (e) {
		throw La(e) ? new m("wire_cid", "Expected a base32 CIDv1 with CBOR codec and SHA-256") : e;
	}
	if (t.codec !== 113 || Qe(t) !== e) throw new m("wire_cid", "Expected canonical CBOR CID");
	return { $link: e };
}
function Ra(e) {
	return { $bytes: it(e).$bytes };
}
function za(e) {
	y(e, Fa.jsonBytes, Fa.depth);
	function t(e) {
		if (e && typeof e == "object") {
			if (Array.isArray(e)) {
				e.forEach(t);
				return;
			}
			if (Object.hasOwn(e, "$bytes")) {
				if (Object.keys(e).length !== 1 || typeof e.$bytes != "string" || !/^[A-Za-z0-9+/]*$/.test(e.$bytes) || e.$bytes.length % 4 == 1 || Ra(at(e)).$bytes !== e.$bytes) throw new m("wire_bytes", "Bytes use one $bytes field with canonical unpadded base64");
				return;
			}
			if (Object.hasOwn(e, "$link")) {
				if (Object.keys(e).length !== 1) throw new m("wire_cid", "A link has exactly one $link field");
				C(e.$link);
				return;
			}
			if (Object.hasOwn(e, "$type") && typeof e.$type != "string") throw new m("wire_value", "$type must be a string");
			for (let [n, r] of Object.entries(e)) {
				if (n.startsWith("$") && n !== "$type") throw new m("wire_key", `Reserved data-model key ${n}`);
				t(r);
			}
		}
	}
	t(e);
}
function Ba(e) {
	Na(), za(e);
	let t = new Uint8Array(Wt(e));
	if (t.length > Fa.blockBytes) throw new m("wire_size", "Block exceeds 64 KiB");
	return t;
}
function Va(e, t = Fa.depth) {
	let n = 0, r = () => {
		throw new m("noncanonical", "Invalid CBOR framing or UTF-8 text");
	};
	function i(t) {
		t > e.length - n && r();
		let i = e.subarray(n, n + t);
		return n += t, i;
	}
	function a(e) {
		let t = e;
		if (e >= 24) {
			e > 27 && r(), t = 0;
			for (let n of i(2 ** (e - 24))) t = t * 256 + n;
			Number.isSafeInteger(t) || r();
		}
		return t;
	}
	function o(s) {
		if (s > t) throw new m("wire_depth", "Block nesting exceeds the profile");
		let c = i(1)[0], l = c >> 5, u = c & 31;
		if (l === 7) {
			u === 27 ? i(8) : [
				20,
				21,
				22
			].includes(u) || r();
			return;
		}
		let d = a(u);
		if (l === 2 || l === 3) {
			let e = i(d);
			l === 3 && !Pa(e) && r();
		} else if (l === 4 || l === 5) {
			let t = d * (l === 5 ? 2 : 1);
			t > e.length - n && r();
			for (let e = 0; e < t; e++) o(s + 1);
		} else if (l === 6) {
			d !== 42 && r();
			let e = i(1)[0];
			e >> 5 != 2 && r(), i(a(e & 31));
		}
	}
	o(0), n !== e.length && r();
}
function Ha(e) {
	return e instanceof Error && [
		[RangeError, /^(could not decode varint|unexpected end of input|NaN and Infinity values not supported|can't decode integers beyond safe integer range|cid too short|incorrect cid version \(got v\d+\)|incorrect cid codec \(got 0x[0-9a-f]+\)|incorrect cid digest codec \(got 0x[0-9a-f]+\)|incorrect cid digest size \(got \d+\)|cid bytes includes remainder)$/],
		[TypeError, /^(non-canonical argument encoding|expected map to only have string keys; got type \d+|expected cid-link to be type 2 \(bytes\); got type \d+|unsupported tag; got \d+|invalid type; got \d+|map keys are not in canonical order or contain duplicates)$/],
		[SyntaxError, /^invalid binary cid$/],
		[Error, /^(invalid argument encoding; got \d+|invalid simple value; got \d+|decoded value contains remainder)$/]
	].some(([t, n]) => e.constructor === t && n.test(e.message));
}
function Ua(e) {
	if (e.length > Fa.blockBytes) throw new m("wire_size", "Block exceeds 64 KiB");
	Va(e);
	try {
		function t(e, n) {
			if (n > Fa.depth) throw new m("wire_depth", "Block nesting exceeds the profile");
			return e instanceof rt || e instanceof S ? e.toJSON() : Array.isArray(e) ? e.map((e) => t(e, n + 1)) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).map(([e, r]) => [e, t(r, n + 1)])) : e;
		}
		let n = t(yt(new Uint8Array(e)), 0);
		if (!Ia(e, Ba(n))) throw new m("noncanonical", "Block has a different canonical encoding");
		return n;
	} catch (e) {
		throw e instanceof f || !Ha(e) ? e : new m("noncanonical", e.message);
	}
}
async function Wa(e) {
	return Qe(await Je(113, Ba(e)));
}
//#endregion
//#region node_modules/zod/v3/helpers/util.cjs
var Ga = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.getParsedType = e.ZodParsedType = e.objectUtil = e.util = void 0;
	var t;
	(function(e) {
		e.assertEqual = (e) => {};
		function t(e) {}
		e.assertIs = t;
		function n(e) {
			throw Error();
		}
		e.assertNever = n, e.arrayToEnum = (e) => {
			let t = {};
			for (let n of e) t[n] = n;
			return t;
		}, e.getValidEnumValues = (t) => {
			let n = e.objectKeys(t).filter((e) => typeof t[t[e]] != "number"), r = {};
			for (let e of n) r[e] = t[e];
			return e.objectValues(r);
		}, e.objectValues = (t) => e.objectKeys(t).map(function(e) {
			return t[e];
		}), e.objectKeys = typeof Object.keys == "function" ? (e) => Object.keys(e) : (e) => {
			let t = [];
			for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
			return t;
		}, e.find = (e, t) => {
			for (let n of e) if (t(n)) return n;
		}, e.isInteger = typeof Number.isInteger == "function" ? (e) => Number.isInteger(e) : (e) => typeof e == "number" && Number.isFinite(e) && Math.floor(e) === e;
		function r(e, t = " | ") {
			return e.map((e) => typeof e == "string" ? `'${e}'` : e).join(t);
		}
		e.joinValues = r, e.jsonStringifyReplacer = (e, t) => typeof t == "bigint" ? t.toString() : t;
	})(t || (e.util = t = {}));
	var n;
	(function(e) {
		e.mergeShapes = (e, t) => ({
			...e,
			...t
		});
	})(n || (e.objectUtil = n = {})), e.ZodParsedType = t.arrayToEnum([
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
	]), e.getParsedType = (t) => {
		switch (typeof t) {
			case "undefined": return e.ZodParsedType.undefined;
			case "string": return e.ZodParsedType.string;
			case "number": return Number.isNaN(t) ? e.ZodParsedType.nan : e.ZodParsedType.number;
			case "boolean": return e.ZodParsedType.boolean;
			case "function": return e.ZodParsedType.function;
			case "bigint": return e.ZodParsedType.bigint;
			case "symbol": return e.ZodParsedType.symbol;
			case "object": return Array.isArray(t) ? e.ZodParsedType.array : t === null ? e.ZodParsedType.null : t.then && typeof t.then == "function" && t.catch && typeof t.catch == "function" ? e.ZodParsedType.promise : typeof Map < "u" && t instanceof Map ? e.ZodParsedType.map : typeof Set < "u" && t instanceof Set ? e.ZodParsedType.set : typeof Date < "u" && t instanceof Date ? e.ZodParsedType.date : e.ZodParsedType.object;
			default: return e.ZodParsedType.unknown;
		}
	};
})), Ka = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.ZodError = e.quotelessJson = e.ZodIssueCode = void 0;
	var t = Ga();
	e.ZodIssueCode = t.util.arrayToEnum([
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
	]), e.quotelessJson = (e) => JSON.stringify(e, null, 2).replace(/"([^"]+)":/g, "$1:");
	var n = class e extends Error {
		get errors() {
			return this.issues;
		}
		constructor(e) {
			super(), this.issues = [], this.addIssue = (e) => {
				this.issues = [...this.issues, e];
			}, this.addIssues = (e = []) => {
				this.issues = [...this.issues, ...e];
			};
			let t = new.target.prototype;
			Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
		}
		format(e) {
			let t = e || function(e) {
				return e.message;
			}, n = { _errors: [] }, r = (e) => {
				for (let i of e.issues) if (i.code === "invalid_union") i.unionErrors.map(r);
				else if (i.code === "invalid_return_type") r(i.returnTypeError);
				else if (i.code === "invalid_arguments") r(i.argumentsError);
				else if (i.path.length === 0) n._errors.push(t(i));
				else {
					let e = n, r = 0;
					for (; r < i.path.length;) {
						let n = i.path[r];
						r === i.path.length - 1 ? (e[n] = e[n] || { _errors: [] }, e[n]._errors.push(t(i))) : e[n] = e[n] || { _errors: [] }, e = e[n], r++;
					}
				}
			};
			return r(this), n;
		}
		static assert(t) {
			if (!(t instanceof e)) throw Error(`Not a ZodError: ${t}`);
		}
		toString() {
			return this.message;
		}
		get message() {
			return JSON.stringify(this.issues, t.util.jsonStringifyReplacer, 2);
		}
		get isEmpty() {
			return this.issues.length === 0;
		}
		flatten(e = (e) => e.message) {
			let t = {}, n = [];
			for (let r of this.issues) if (r.path.length > 0) {
				let n = r.path[0];
				t[n] = t[n] || [], t[n].push(e(r));
			} else n.push(e(r));
			return {
				formErrors: n,
				fieldErrors: t
			};
		}
		get formErrors() {
			return this.flatten();
		}
	};
	e.ZodError = n, n.create = (e) => new n(e);
})), qa = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Ka(), n = Ga();
	e.default = (e, r) => {
		let i;
		switch (e.code) {
			case t.ZodIssueCode.invalid_type:
				i = e.received === n.ZodParsedType.undefined ? "Required" : `Expected ${e.expected}, received ${e.received}`;
				break;
			case t.ZodIssueCode.invalid_literal:
				i = `Invalid literal value, expected ${JSON.stringify(e.expected, n.util.jsonStringifyReplacer)}`;
				break;
			case t.ZodIssueCode.unrecognized_keys:
				i = `Unrecognized key(s) in object: ${n.util.joinValues(e.keys, ", ")}`;
				break;
			case t.ZodIssueCode.invalid_union:
				i = "Invalid input";
				break;
			case t.ZodIssueCode.invalid_union_discriminator:
				i = `Invalid discriminator value. Expected ${n.util.joinValues(e.options)}`;
				break;
			case t.ZodIssueCode.invalid_enum_value:
				i = `Invalid enum value. Expected ${n.util.joinValues(e.options)}, received '${e.received}'`;
				break;
			case t.ZodIssueCode.invalid_arguments:
				i = "Invalid function arguments";
				break;
			case t.ZodIssueCode.invalid_return_type:
				i = "Invalid function return type";
				break;
			case t.ZodIssueCode.invalid_date:
				i = "Invalid date";
				break;
			case t.ZodIssueCode.invalid_string:
				typeof e.validation == "object" ? "includes" in e.validation ? (i = `Invalid input: must include "${e.validation.includes}"`, typeof e.validation.position == "number" && (i = `${i} at one or more positions greater than or equal to ${e.validation.position}`)) : "startsWith" in e.validation ? i = `Invalid input: must start with "${e.validation.startsWith}"` : "endsWith" in e.validation ? i = `Invalid input: must end with "${e.validation.endsWith}"` : n.util.assertNever(e.validation) : i = e.validation === "regex" ? "Invalid" : `Invalid ${e.validation}`;
				break;
			case t.ZodIssueCode.too_small:
				i = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "more than"} ${e.minimum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "over"} ${e.minimum} character(s)` : e.type === "number" || e.type === "bigint" ? `Number must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${e.minimum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(e.minimum))}` : "Invalid input";
				break;
			case t.ZodIssueCode.too_big:
				i = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "less than"} ${e.maximum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "under"} ${e.maximum} character(s)` : e.type === "number" ? `Number must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "bigint" ? `BigInt must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly" : e.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(e.maximum))}` : "Invalid input";
				break;
			case t.ZodIssueCode.custom:
				i = "Invalid input";
				break;
			case t.ZodIssueCode.invalid_intersection_types:
				i = "Intersection results could not be merged";
				break;
			case t.ZodIssueCode.not_multiple_of:
				i = `Number must be a multiple of ${e.multipleOf}`;
				break;
			case t.ZodIssueCode.not_finite:
				i = "Number must be finite";
				break;
			default: i = r.defaultError, n.util.assertNever(e);
		}
		return { message: i };
	};
})), Ja = /* @__PURE__ */ o(((e) => {
	var t = e && e.__importDefault || function(e) {
		return e && e.__esModule ? e : { default: e };
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.defaultErrorMap = void 0, e.setErrorMap = i, e.getErrorMap = a;
	var n = t(qa());
	e.defaultErrorMap = n.default;
	var r = n.default;
	function i(e) {
		r = e;
	}
	function a() {
		return r;
	}
})), Ya = /* @__PURE__ */ o(((e) => {
	var t = e && e.__importDefault || function(e) {
		return e && e.__esModule ? e : { default: e };
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.isAsync = e.isValid = e.isDirty = e.isAborted = e.OK = e.DIRTY = e.INVALID = e.ParseStatus = e.EMPTY_PATH = e.makeIssue = void 0, e.addIssueToContext = i;
	var n = Ja(), r = t(qa());
	e.makeIssue = (e) => {
		let { data: t, path: n, errorMaps: r, issueData: i } = e, a = [...n, ...i.path || []], o = {
			...i,
			path: a
		};
		if (i.message !== void 0) return {
			...i,
			path: a,
			message: i.message
		};
		let s = "", c = r.filter((e) => !!e).slice().reverse();
		for (let e of c) s = e(o, {
			data: t,
			defaultError: s
		}).message;
		return {
			...i,
			path: a,
			message: s
		};
	}, e.EMPTY_PATH = [];
	function i(t, i) {
		let a = (0, n.getErrorMap)(), o = (0, e.makeIssue)({
			issueData: i,
			data: t.data,
			path: t.path,
			errorMaps: [
				t.common.contextualErrorMap,
				t.schemaErrorMap,
				a,
				a === r.default ? void 0 : r.default
			].filter((e) => !!e)
		});
		t.common.issues.push(o);
	}
	e.ParseStatus = class t {
		constructor() {
			this.value = "valid";
		}
		dirty() {
			this.value === "valid" && (this.value = "dirty");
		}
		abort() {
			this.value !== "aborted" && (this.value = "aborted");
		}
		static mergeArray(t, n) {
			let r = [];
			for (let i of n) {
				if (i.status === "aborted") return e.INVALID;
				i.status === "dirty" && t.dirty(), r.push(i.value);
			}
			return {
				status: t.value,
				value: r
			};
		}
		static async mergeObjectAsync(e, n) {
			let r = [];
			for (let e of n) {
				let t = await e.key, n = await e.value;
				r.push({
					key: t,
					value: n
				});
			}
			return t.mergeObjectSync(e, r);
		}
		static mergeObjectSync(t, n) {
			let r = {};
			for (let i of n) {
				let { key: n, value: a } = i;
				if (n.status === "aborted" || a.status === "aborted") return e.INVALID;
				n.status === "dirty" && t.dirty(), a.status === "dirty" && t.dirty(), n.value !== "__proto__" && (a.value !== void 0 || i.alwaysSet) && (r[n.value] = a.value);
			}
			return {
				status: t.value,
				value: r
			};
		}
	}, e.INVALID = Object.freeze({ status: "aborted" }), e.DIRTY = (e) => ({
		status: "dirty",
		value: e
	}), e.OK = (e) => ({
		status: "valid",
		value: e
	}), e.isAborted = (e) => e.status === "aborted", e.isDirty = (e) => e.status === "dirty", e.isValid = (e) => e.status === "valid", e.isAsync = (e) => typeof Promise < "u" && e instanceof Promise;
})), Xa = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
})), Za = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.errorUtil = void 0;
	var t;
	(function(e) {
		e.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, e.toString = (e) => typeof e == "string" ? e : e?.message;
	})(t || (e.errorUtil = t = {}));
})), Qa = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.discriminatedUnion = e.date = e.boolean = e.bigint = e.array = e.any = e.coerce = e.ZodFirstPartyTypeKind = e.late = e.ZodSchema = e.Schema = e.ZodReadonly = e.ZodPipeline = e.ZodBranded = e.BRAND = e.ZodNaN = e.ZodCatch = e.ZodDefault = e.ZodNullable = e.ZodOptional = e.ZodTransformer = e.ZodEffects = e.ZodPromise = e.ZodNativeEnum = e.ZodEnum = e.ZodLiteral = e.ZodLazy = e.ZodFunction = e.ZodSet = e.ZodMap = e.ZodRecord = e.ZodTuple = e.ZodIntersection = e.ZodDiscriminatedUnion = e.ZodUnion = e.ZodObject = e.ZodArray = e.ZodVoid = e.ZodNever = e.ZodUnknown = e.ZodAny = e.ZodNull = e.ZodUndefined = e.ZodSymbol = e.ZodDate = e.ZodBoolean = e.ZodBigInt = e.ZodNumber = e.ZodString = e.ZodType = void 0, e.NEVER = e.void = e.unknown = e.union = e.undefined = e.tuple = e.transformer = e.symbol = e.string = e.strictObject = e.set = e.record = e.promise = e.preprocess = e.pipeline = e.ostring = e.optional = e.onumber = e.oboolean = e.object = e.number = e.nullable = e.null = e.never = e.nativeEnum = e.nan = e.map = e.literal = e.lazy = e.intersection = e.instanceof = e.function = e.enum = e.effect = void 0, e.datetimeRegex = le, e.custom = et;
	var t = Ka(), n = Ja(), r = Za(), i = Ya(), a = Ga(), o = class {
		constructor(e, t, n, r) {
			this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = r;
		}
		get path() {
			return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
		}
	}, s = (e, n) => {
		if ((0, i.isValid)(n)) return {
			success: !0,
			data: n.value
		};
		if (!e.common.issues.length) throw Error("Validation failed but no issues detected.");
		return {
			success: !1,
			get error() {
				if (this._error) return this._error;
				let n = new t.ZodError(e.common.issues);
				return this._error = n, this._error;
			}
		};
	};
	function c(e) {
		if (!e) return {};
		let { errorMap: t, invalid_type_error: n, required_error: r, description: i } = e;
		if (t && (n || r)) throw Error("Can't use \"invalid_type_error\" or \"required_error\" in conjunction with custom error map.");
		return t ? {
			errorMap: t,
			description: i
		} : {
			errorMap: (t, i) => {
				let { message: a } = e;
				return t.code === "invalid_enum_value" ? { message: a ?? i.defaultError } : i.data === void 0 ? { message: a ?? r ?? i.defaultError } : t.code === "invalid_type" ? { message: a ?? n ?? i.defaultError } : { message: i.defaultError };
			},
			description: i
		};
	}
	var l = class {
		get description() {
			return this._def.description;
		}
		_getType(e) {
			return (0, a.getParsedType)(e.data);
		}
		_getOrReturnCtx(e, t) {
			return t || {
				common: e.parent.common,
				data: e.data,
				parsedType: (0, a.getParsedType)(e.data),
				schemaErrorMap: this._def.errorMap,
				path: e.path,
				parent: e.parent
			};
		}
		_processInputParams(e) {
			return {
				status: new i.ParseStatus(),
				ctx: {
					common: e.parent.common,
					data: e.data,
					parsedType: (0, a.getParsedType)(e.data),
					schemaErrorMap: this._def.errorMap,
					path: e.path,
					parent: e.parent
				}
			};
		}
		_parseSync(e) {
			let t = this._parse(e);
			if ((0, i.isAsync)(t)) throw Error("Synchronous parse encountered promise.");
			return t;
		}
		_parseAsync(e) {
			let t = this._parse(e);
			return Promise.resolve(t);
		}
		parse(e, t) {
			let n = this.safeParse(e, t);
			if (n.success) return n.data;
			throw n.error;
		}
		safeParse(e, t) {
			let n = {
				common: {
					issues: [],
					async: t?.async ?? !1,
					contextualErrorMap: t?.errorMap
				},
				path: t?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data: e,
				parsedType: (0, a.getParsedType)(e)
			};
			return s(n, this._parseSync({
				data: e,
				path: n.path,
				parent: n
			}));
		}
		"~validate"(e) {
			let t = {
				common: {
					issues: [],
					async: !!this["~standard"].async
				},
				path: [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data: e,
				parsedType: (0, a.getParsedType)(e)
			};
			if (!this["~standard"].async) try {
				let n = this._parseSync({
					data: e,
					path: [],
					parent: t
				});
				return (0, i.isValid)(n) ? { value: n.value } : { issues: t.common.issues };
			} catch (e) {
				e?.message?.toLowerCase()?.includes("encountered") && (this["~standard"].async = !0), t.common = {
					issues: [],
					async: !0
				};
			}
			return this._parseAsync({
				data: e,
				path: [],
				parent: t
			}).then((e) => (0, i.isValid)(e) ? { value: e.value } : { issues: t.common.issues });
		}
		async parseAsync(e, t) {
			let n = await this.safeParseAsync(e, t);
			if (n.success) return n.data;
			throw n.error;
		}
		async safeParseAsync(e, t) {
			let n = {
				common: {
					issues: [],
					contextualErrorMap: t?.errorMap,
					async: !0
				},
				path: t?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data: e,
				parsedType: (0, a.getParsedType)(e)
			}, r = this._parse({
				data: e,
				path: n.path,
				parent: n
			});
			return s(n, await ((0, i.isAsync)(r) ? r : Promise.resolve(r)));
		}
		refine(e, n) {
			let r = (e) => typeof n == "string" || n === void 0 ? { message: n } : typeof n == "function" ? n(e) : n;
			return this._refinement((n, i) => {
				let a = e(n), o = () => i.addIssue({
					code: t.ZodIssueCode.custom,
					...r(n)
				});
				return typeof Promise < "u" && a instanceof Promise ? a.then((e) => e ? !0 : (o(), !1)) : a ? !0 : (o(), !1);
			});
		}
		refinement(e, t) {
			return this._refinement((n, r) => e(n) ? !0 : (r.addIssue(typeof t == "function" ? t(n, r) : t), !1));
		}
		_refinement(e) {
			return new We({
				schema: this,
				typeName: S.ZodEffects,
				effect: {
					type: "refinement",
					refinement: e
				}
			});
		}
		superRefine(e) {
			return this._refinement(e);
		}
		constructor(e) {
			this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
				version: 1,
				vendor: "zod",
				validate: (e) => this["~validate"](e)
			};
		}
		optional() {
			return Ge.create(this, this._def);
		}
		nullable() {
			return Ke.create(this, this._def);
		}
		nullish() {
			return this.nullable().optional();
		}
		array() {
			return Te.create(this);
		}
		promise() {
			return Ue.create(this, this._def);
		}
		or(e) {
			return Oe.create([this, e], this._def);
		}
		and(e) {
			return Me.create(this, e, this._def);
		}
		transform(e) {
			return new We({
				...c(this._def),
				schema: this,
				typeName: S.ZodEffects,
				effect: {
					type: "transform",
					transform: e
				}
			});
		}
		default(e) {
			let t = typeof e == "function" ? e : () => e;
			return new qe({
				...c(this._def),
				innerType: this,
				defaultValue: t,
				typeName: S.ZodDefault
			});
		}
		brand() {
			return new Xe({
				typeName: S.ZodBranded,
				type: this,
				...c(this._def)
			});
		}
		catch(e) {
			let t = typeof e == "function" ? e : () => e;
			return new Je({
				...c(this._def),
				innerType: this,
				catchValue: t,
				typeName: S.ZodCatch
			});
		}
		describe(e) {
			let t = this.constructor;
			return new t({
				...this._def,
				description: e
			});
		}
		pipe(e) {
			return Ze.create(this, e);
		}
		readonly() {
			return Qe.create(this);
		}
		isOptional() {
			return this.safeParse(void 0).success;
		}
		isNullable() {
			return this.safeParse(null).success;
		}
	};
	e.ZodType = l, e.Schema = l, e.ZodSchema = l;
	var u = /^c[^\s-]{8,}$/i, d = /^[0-9a-z]+$/, f = /^[0-9A-HJKMNP-TV-Z]{26}$/i, p = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, m = /^[a-z0-9_-]{21}$/i, h = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, g = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, _ = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, v = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", y, ee = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, te = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, ne = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, b = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, re = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, ie = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, ae = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", oe = RegExp(`^${ae}$`);
	function se(e) {
		let t = "[0-5]\\d";
		e.precision ? t = `${t}\\.\\d{${e.precision}}` : e.precision ?? (t = `${t}(\\.\\d+)?`);
		let n = e.precision ? "+" : "?";
		return `([01]\\d|2[0-3]):[0-5]\\d(:${t})${n}`;
	}
	function ce(e) {
		return RegExp(`^${se(e)}$`);
	}
	function le(e) {
		let t = `${ae}T${se(e)}`, n = [];
		return n.push(e.local ? "Z?" : "Z"), e.offset && n.push("([+-]\\d{2}:?\\d{2})"), t = `${t}(${n.join("|")})`, RegExp(`^${t}$`);
	}
	function ue(e, t) {
		return !((t !== "v4" && t || !ee.test(e)) && (t !== "v6" && t || !ne.test(e)));
	}
	function x(e, t) {
		if (!h.test(e)) return !1;
		try {
			let [n] = e.split(".");
			if (!n) return !1;
			let r = n.replace(/-/g, "+").replace(/_/g, "/").padEnd(n.length + (4 - n.length % 4) % 4, "="), i = JSON.parse(atob(r));
			return !(typeof i != "object" || !i || "typ" in i && i?.typ !== "JWT" || !i.alg || t && i.alg !== t);
		} catch {
			return !1;
		}
	}
	function de(e, t) {
		return !((t !== "v4" && t || !te.test(e)) && (t !== "v6" && t || !b.test(e)));
	}
	var fe = class e extends l {
		_parse(e) {
			if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== a.ZodParsedType.string) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.string,
					received: n.parsedType
				}), i.INVALID;
			}
			let n = new i.ParseStatus(), r;
			for (let o of this._def.checks) if (o.kind === "min") e.data.length < o.value && (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_small,
				minimum: o.value,
				type: "string",
				inclusive: !0,
				exact: !1,
				message: o.message
			}), n.dirty());
			else if (o.kind === "max") e.data.length > o.value && (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_big,
				maximum: o.value,
				type: "string",
				inclusive: !0,
				exact: !1,
				message: o.message
			}), n.dirty());
			else if (o.kind === "length") {
				let a = e.data.length > o.value, s = e.data.length < o.value;
				(a || s) && (r = this._getOrReturnCtx(e, r), a ? (0, i.addIssueToContext)(r, {
					code: t.ZodIssueCode.too_big,
					maximum: o.value,
					type: "string",
					inclusive: !0,
					exact: !0,
					message: o.message
				}) : s && (0, i.addIssueToContext)(r, {
					code: t.ZodIssueCode.too_small,
					minimum: o.value,
					type: "string",
					inclusive: !0,
					exact: !0,
					message: o.message
				}), n.dirty());
			} else if (o.kind === "email") _.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "email",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty());
			else if (o.kind === "emoji") y ||= new RegExp(v, "u"), y.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "emoji",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty());
			else if (o.kind === "uuid") p.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "uuid",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty());
			else if (o.kind === "nanoid") m.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "nanoid",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty());
			else if (o.kind === "cuid") u.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "cuid",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty());
			else if (o.kind === "cuid2") d.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "cuid2",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty());
			else if (o.kind === "ulid") f.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "ulid",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty());
			else if (o.kind === "url") try {
				new URL(e.data);
			} catch {
				r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
					validation: "url",
					code: t.ZodIssueCode.invalid_string,
					message: o.message
				}), n.dirty();
			}
			else o.kind === "regex" ? (o.regex.lastIndex = 0, o.regex.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "regex",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty())) : o.kind === "trim" ? e.data = e.data.trim() : o.kind === "includes" ? e.data.includes(o.value, o.position) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: {
					includes: o.value,
					position: o.position
				},
				message: o.message
			}), n.dirty()) : o.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : o.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : o.kind === "startsWith" ? e.data.startsWith(o.value) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: { startsWith: o.value },
				message: o.message
			}), n.dirty()) : o.kind === "endsWith" ? e.data.endsWith(o.value) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: { endsWith: o.value },
				message: o.message
			}), n.dirty()) : o.kind === "datetime" ? le(o).test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: "datetime",
				message: o.message
			}), n.dirty()) : o.kind === "date" ? oe.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: "date",
				message: o.message
			}), n.dirty()) : o.kind === "time" ? ce(o).test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: "time",
				message: o.message
			}), n.dirty()) : o.kind === "duration" ? g.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "duration",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "ip" ? ue(e.data, o.version) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "ip",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "jwt" ? x(e.data, o.alg) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "jwt",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "cidr" ? de(e.data, o.version) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "cidr",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "base64" ? re.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "base64",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "base64url" ? ie.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "base64url",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : a.util.assertNever(o);
			return {
				status: n.value,
				value: e.data
			};
		}
		_regex(e, n, i) {
			return this.refinement((t) => e.test(t), {
				validation: n,
				code: t.ZodIssueCode.invalid_string,
				...r.errorUtil.errToObj(i)
			});
		}
		_addCheck(t) {
			return new e({
				...this._def,
				checks: [...this._def.checks, t]
			});
		}
		email(e) {
			return this._addCheck({
				kind: "email",
				...r.errorUtil.errToObj(e)
			});
		}
		url(e) {
			return this._addCheck({
				kind: "url",
				...r.errorUtil.errToObj(e)
			});
		}
		emoji(e) {
			return this._addCheck({
				kind: "emoji",
				...r.errorUtil.errToObj(e)
			});
		}
		uuid(e) {
			return this._addCheck({
				kind: "uuid",
				...r.errorUtil.errToObj(e)
			});
		}
		nanoid(e) {
			return this._addCheck({
				kind: "nanoid",
				...r.errorUtil.errToObj(e)
			});
		}
		cuid(e) {
			return this._addCheck({
				kind: "cuid",
				...r.errorUtil.errToObj(e)
			});
		}
		cuid2(e) {
			return this._addCheck({
				kind: "cuid2",
				...r.errorUtil.errToObj(e)
			});
		}
		ulid(e) {
			return this._addCheck({
				kind: "ulid",
				...r.errorUtil.errToObj(e)
			});
		}
		base64(e) {
			return this._addCheck({
				kind: "base64",
				...r.errorUtil.errToObj(e)
			});
		}
		base64url(e) {
			return this._addCheck({
				kind: "base64url",
				...r.errorUtil.errToObj(e)
			});
		}
		jwt(e) {
			return this._addCheck({
				kind: "jwt",
				...r.errorUtil.errToObj(e)
			});
		}
		ip(e) {
			return this._addCheck({
				kind: "ip",
				...r.errorUtil.errToObj(e)
			});
		}
		cidr(e) {
			return this._addCheck({
				kind: "cidr",
				...r.errorUtil.errToObj(e)
			});
		}
		datetime(e) {
			return typeof e == "string" ? this._addCheck({
				kind: "datetime",
				precision: null,
				offset: !1,
				local: !1,
				message: e
			}) : this._addCheck({
				kind: "datetime",
				precision: e?.precision === void 0 ? null : e?.precision,
				offset: e?.offset ?? !1,
				local: e?.local ?? !1,
				...r.errorUtil.errToObj(e?.message)
			});
		}
		date(e) {
			return this._addCheck({
				kind: "date",
				message: e
			});
		}
		time(e) {
			return typeof e == "string" ? this._addCheck({
				kind: "time",
				precision: null,
				message: e
			}) : this._addCheck({
				kind: "time",
				precision: e?.precision === void 0 ? null : e?.precision,
				...r.errorUtil.errToObj(e?.message)
			});
		}
		duration(e) {
			return this._addCheck({
				kind: "duration",
				...r.errorUtil.errToObj(e)
			});
		}
		regex(e, t) {
			return this._addCheck({
				kind: "regex",
				regex: e,
				...r.errorUtil.errToObj(t)
			});
		}
		includes(e, t) {
			return this._addCheck({
				kind: "includes",
				value: e,
				position: t?.position,
				...r.errorUtil.errToObj(t?.message)
			});
		}
		startsWith(e, t) {
			return this._addCheck({
				kind: "startsWith",
				value: e,
				...r.errorUtil.errToObj(t)
			});
		}
		endsWith(e, t) {
			return this._addCheck({
				kind: "endsWith",
				value: e,
				...r.errorUtil.errToObj(t)
			});
		}
		min(e, t) {
			return this._addCheck({
				kind: "min",
				value: e,
				...r.errorUtil.errToObj(t)
			});
		}
		max(e, t) {
			return this._addCheck({
				kind: "max",
				value: e,
				...r.errorUtil.errToObj(t)
			});
		}
		length(e, t) {
			return this._addCheck({
				kind: "length",
				value: e,
				...r.errorUtil.errToObj(t)
			});
		}
		nonempty(e) {
			return this.min(1, r.errorUtil.errToObj(e));
		}
		trim() {
			return new e({
				...this._def,
				checks: [...this._def.checks, { kind: "trim" }]
			});
		}
		toLowerCase() {
			return new e({
				...this._def,
				checks: [...this._def.checks, { kind: "toLowerCase" }]
			});
		}
		toUpperCase() {
			return new e({
				...this._def,
				checks: [...this._def.checks, { kind: "toUpperCase" }]
			});
		}
		get isDatetime() {
			return !!this._def.checks.find((e) => e.kind === "datetime");
		}
		get isDate() {
			return !!this._def.checks.find((e) => e.kind === "date");
		}
		get isTime() {
			return !!this._def.checks.find((e) => e.kind === "time");
		}
		get isDuration() {
			return !!this._def.checks.find((e) => e.kind === "duration");
		}
		get isEmail() {
			return !!this._def.checks.find((e) => e.kind === "email");
		}
		get isURL() {
			return !!this._def.checks.find((e) => e.kind === "url");
		}
		get isEmoji() {
			return !!this._def.checks.find((e) => e.kind === "emoji");
		}
		get isUUID() {
			return !!this._def.checks.find((e) => e.kind === "uuid");
		}
		get isNANOID() {
			return !!this._def.checks.find((e) => e.kind === "nanoid");
		}
		get isCUID() {
			return !!this._def.checks.find((e) => e.kind === "cuid");
		}
		get isCUID2() {
			return !!this._def.checks.find((e) => e.kind === "cuid2");
		}
		get isULID() {
			return !!this._def.checks.find((e) => e.kind === "ulid");
		}
		get isIP() {
			return !!this._def.checks.find((e) => e.kind === "ip");
		}
		get isCIDR() {
			return !!this._def.checks.find((e) => e.kind === "cidr");
		}
		get isBase64() {
			return !!this._def.checks.find((e) => e.kind === "base64");
		}
		get isBase64url() {
			return !!this._def.checks.find((e) => e.kind === "base64url");
		}
		get minLength() {
			let e = null;
			for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
			return e;
		}
		get maxLength() {
			let e = null;
			for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
			return e;
		}
	};
	e.ZodString = fe, fe.create = (e) => new fe({
		checks: [],
		typeName: S.ZodString,
		coerce: e?.coerce ?? !1,
		...c(e)
	});
	function pe(e, t) {
		let n = (e.toString().split(".")[1] || "").length, r = (t.toString().split(".")[1] || "").length, i = n > r ? n : r;
		return Number.parseInt(e.toFixed(i).replace(".", "")) % Number.parseInt(t.toFixed(i).replace(".", "")) / 10 ** i;
	}
	var me = class e extends l {
		constructor() {
			super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
		}
		_parse(e) {
			if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== a.ZodParsedType.number) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.number,
					received: n.parsedType
				}), i.INVALID;
			}
			let n, r = new i.ParseStatus();
			for (let o of this._def.checks) o.kind === "int" ? a.util.isInteger(e.data) || (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_type,
				expected: "integer",
				received: "float",
				message: o.message
			}), r.dirty()) : o.kind === "min" ? (o.inclusive ? e.data < o.value : e.data <= o.value) && (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.too_small,
				minimum: o.value,
				type: "number",
				inclusive: o.inclusive,
				exact: !1,
				message: o.message
			}), r.dirty()) : o.kind === "max" ? (o.inclusive ? e.data > o.value : e.data >= o.value) && (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.too_big,
				maximum: o.value,
				type: "number",
				inclusive: o.inclusive,
				exact: !1,
				message: o.message
			}), r.dirty()) : o.kind === "multipleOf" ? pe(e.data, o.value) !== 0 && (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.not_multiple_of,
				multipleOf: o.value,
				message: o.message
			}), r.dirty()) : o.kind === "finite" ? Number.isFinite(e.data) || (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.not_finite,
				message: o.message
			}), r.dirty()) : a.util.assertNever(o);
			return {
				status: r.value,
				value: e.data
			};
		}
		gte(e, t) {
			return this.setLimit("min", e, !0, r.errorUtil.toString(t));
		}
		gt(e, t) {
			return this.setLimit("min", e, !1, r.errorUtil.toString(t));
		}
		lte(e, t) {
			return this.setLimit("max", e, !0, r.errorUtil.toString(t));
		}
		lt(e, t) {
			return this.setLimit("max", e, !1, r.errorUtil.toString(t));
		}
		setLimit(t, n, i, a) {
			return new e({
				...this._def,
				checks: [...this._def.checks, {
					kind: t,
					value: n,
					inclusive: i,
					message: r.errorUtil.toString(a)
				}]
			});
		}
		_addCheck(t) {
			return new e({
				...this._def,
				checks: [...this._def.checks, t]
			});
		}
		int(e) {
			return this._addCheck({
				kind: "int",
				message: r.errorUtil.toString(e)
			});
		}
		positive(e) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: !1,
				message: r.errorUtil.toString(e)
			});
		}
		negative(e) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: !1,
				message: r.errorUtil.toString(e)
			});
		}
		nonpositive(e) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: !0,
				message: r.errorUtil.toString(e)
			});
		}
		nonnegative(e) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: !0,
				message: r.errorUtil.toString(e)
			});
		}
		multipleOf(e, t) {
			return this._addCheck({
				kind: "multipleOf",
				value: e,
				message: r.errorUtil.toString(t)
			});
		}
		finite(e) {
			return this._addCheck({
				kind: "finite",
				message: r.errorUtil.toString(e)
			});
		}
		safe(e) {
			return this._addCheck({
				kind: "min",
				inclusive: !0,
				value: -(2 ** 53 - 1),
				message: r.errorUtil.toString(e)
			})._addCheck({
				kind: "max",
				inclusive: !0,
				value: 2 ** 53 - 1,
				message: r.errorUtil.toString(e)
			});
		}
		get minValue() {
			let e = null;
			for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
			return e;
		}
		get maxValue() {
			let e = null;
			for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
			return e;
		}
		get isInt() {
			return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && a.util.isInteger(e.value));
		}
		get isFinite() {
			let e = null, t = null;
			for (let n of this._def.checks) if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf") return !0;
			else n.kind === "min" ? (t === null || n.value > t) && (t = n.value) : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
			return Number.isFinite(t) && Number.isFinite(e);
		}
	};
	e.ZodNumber = me, me.create = (e) => new me({
		checks: [],
		typeName: S.ZodNumber,
		coerce: e?.coerce || !1,
		...c(e)
	});
	var he = class e extends l {
		constructor() {
			super(...arguments), this.min = this.gte, this.max = this.lte;
		}
		_parse(e) {
			if (this._def.coerce) try {
				e.data = BigInt(e.data);
			} catch {
				return this._getInvalidInput(e);
			}
			if (this._getType(e) !== a.ZodParsedType.bigint) return this._getInvalidInput(e);
			let n, r = new i.ParseStatus();
			for (let o of this._def.checks) o.kind === "min" ? (o.inclusive ? e.data < o.value : e.data <= o.value) && (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.too_small,
				type: "bigint",
				minimum: o.value,
				inclusive: o.inclusive,
				message: o.message
			}), r.dirty()) : o.kind === "max" ? (o.inclusive ? e.data > o.value : e.data >= o.value) && (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.too_big,
				type: "bigint",
				maximum: o.value,
				inclusive: o.inclusive,
				message: o.message
			}), r.dirty()) : o.kind === "multipleOf" ? e.data % o.value !== BigInt(0) && (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.not_multiple_of,
				multipleOf: o.value,
				message: o.message
			}), r.dirty()) : a.util.assertNever(o);
			return {
				status: r.value,
				value: e.data
			};
		}
		_getInvalidInput(e) {
			let n = this._getOrReturnCtx(e);
			return (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.bigint,
				received: n.parsedType
			}), i.INVALID;
		}
		gte(e, t) {
			return this.setLimit("min", e, !0, r.errorUtil.toString(t));
		}
		gt(e, t) {
			return this.setLimit("min", e, !1, r.errorUtil.toString(t));
		}
		lte(e, t) {
			return this.setLimit("max", e, !0, r.errorUtil.toString(t));
		}
		lt(e, t) {
			return this.setLimit("max", e, !1, r.errorUtil.toString(t));
		}
		setLimit(t, n, i, a) {
			return new e({
				...this._def,
				checks: [...this._def.checks, {
					kind: t,
					value: n,
					inclusive: i,
					message: r.errorUtil.toString(a)
				}]
			});
		}
		_addCheck(t) {
			return new e({
				...this._def,
				checks: [...this._def.checks, t]
			});
		}
		positive(e) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: !1,
				message: r.errorUtil.toString(e)
			});
		}
		negative(e) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: !1,
				message: r.errorUtil.toString(e)
			});
		}
		nonpositive(e) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: !0,
				message: r.errorUtil.toString(e)
			});
		}
		nonnegative(e) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: !0,
				message: r.errorUtil.toString(e)
			});
		}
		multipleOf(e, t) {
			return this._addCheck({
				kind: "multipleOf",
				value: e,
				message: r.errorUtil.toString(t)
			});
		}
		get minValue() {
			let e = null;
			for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
			return e;
		}
		get maxValue() {
			let e = null;
			for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
			return e;
		}
	};
	e.ZodBigInt = he, he.create = (e) => new he({
		checks: [],
		typeName: S.ZodBigInt,
		coerce: e?.coerce ?? !1,
		...c(e)
	});
	var ge = class extends l {
		_parse(e) {
			if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== a.ZodParsedType.boolean) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.boolean,
					received: n.parsedType
				}), i.INVALID;
			}
			return (0, i.OK)(e.data);
		}
	};
	e.ZodBoolean = ge, ge.create = (e) => new ge({
		typeName: S.ZodBoolean,
		coerce: e?.coerce || !1,
		...c(e)
	});
	var _e = class e extends l {
		_parse(e) {
			if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== a.ZodParsedType.date) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.date,
					received: n.parsedType
				}), i.INVALID;
			}
			if (Number.isNaN(e.data.getTime())) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, { code: t.ZodIssueCode.invalid_date }), i.INVALID;
			}
			let n = new i.ParseStatus(), r;
			for (let o of this._def.checks) o.kind === "min" ? e.data.getTime() < o.value && (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_small,
				message: o.message,
				inclusive: !0,
				exact: !1,
				minimum: o.value,
				type: "date"
			}), n.dirty()) : o.kind === "max" ? e.data.getTime() > o.value && (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_big,
				message: o.message,
				inclusive: !0,
				exact: !1,
				maximum: o.value,
				type: "date"
			}), n.dirty()) : a.util.assertNever(o);
			return {
				status: n.value,
				value: new Date(e.data.getTime())
			};
		}
		_addCheck(t) {
			return new e({
				...this._def,
				checks: [...this._def.checks, t]
			});
		}
		min(e, t) {
			return this._addCheck({
				kind: "min",
				value: e.getTime(),
				message: r.errorUtil.toString(t)
			});
		}
		max(e, t) {
			return this._addCheck({
				kind: "max",
				value: e.getTime(),
				message: r.errorUtil.toString(t)
			});
		}
		get minDate() {
			let e = null;
			for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
			return e == null ? null : new Date(e);
		}
		get maxDate() {
			let e = null;
			for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
			return e == null ? null : new Date(e);
		}
	};
	e.ZodDate = _e, _e.create = (e) => new _e({
		checks: [],
		coerce: e?.coerce || !1,
		typeName: S.ZodDate,
		...c(e)
	});
	var ve = class extends l {
		_parse(e) {
			if (this._getType(e) !== a.ZodParsedType.symbol) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.symbol,
					received: n.parsedType
				}), i.INVALID;
			}
			return (0, i.OK)(e.data);
		}
	};
	e.ZodSymbol = ve, ve.create = (e) => new ve({
		typeName: S.ZodSymbol,
		...c(e)
	});
	var ye = class extends l {
		_parse(e) {
			if (this._getType(e) !== a.ZodParsedType.undefined) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.undefined,
					received: n.parsedType
				}), i.INVALID;
			}
			return (0, i.OK)(e.data);
		}
	};
	e.ZodUndefined = ye, ye.create = (e) => new ye({
		typeName: S.ZodUndefined,
		...c(e)
	});
	var be = class extends l {
		_parse(e) {
			if (this._getType(e) !== a.ZodParsedType.null) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.null,
					received: n.parsedType
				}), i.INVALID;
			}
			return (0, i.OK)(e.data);
		}
	};
	e.ZodNull = be, be.create = (e) => new be({
		typeName: S.ZodNull,
		...c(e)
	});
	var xe = class extends l {
		constructor() {
			super(...arguments), this._any = !0;
		}
		_parse(e) {
			return (0, i.OK)(e.data);
		}
	};
	e.ZodAny = xe, xe.create = (e) => new xe({
		typeName: S.ZodAny,
		...c(e)
	});
	var Se = class extends l {
		constructor() {
			super(...arguments), this._unknown = !0;
		}
		_parse(e) {
			return (0, i.OK)(e.data);
		}
	};
	e.ZodUnknown = Se, Se.create = (e) => new Se({
		typeName: S.ZodUnknown,
		...c(e)
	});
	var Ce = class extends l {
		_parse(e) {
			let n = this._getOrReturnCtx(e);
			return (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.never,
				received: n.parsedType
			}), i.INVALID;
		}
	};
	e.ZodNever = Ce, Ce.create = (e) => new Ce({
		typeName: S.ZodNever,
		...c(e)
	});
	var we = class extends l {
		_parse(e) {
			if (this._getType(e) !== a.ZodParsedType.undefined) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.void,
					received: n.parsedType
				}), i.INVALID;
			}
			return (0, i.OK)(e.data);
		}
	};
	e.ZodVoid = we, we.create = (e) => new we({
		typeName: S.ZodVoid,
		...c(e)
	});
	var Te = class e extends l {
		_parse(e) {
			let { ctx: n, status: r } = this._processInputParams(e), s = this._def;
			if (n.parsedType !== a.ZodParsedType.array) return (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.array,
				received: n.parsedType
			}), i.INVALID;
			if (s.exactLength !== null) {
				let e = n.data.length > s.exactLength.value, a = n.data.length < s.exactLength.value;
				(e || a) && ((0, i.addIssueToContext)(n, {
					code: e ? t.ZodIssueCode.too_big : t.ZodIssueCode.too_small,
					minimum: a ? s.exactLength.value : void 0,
					maximum: e ? s.exactLength.value : void 0,
					type: "array",
					inclusive: !0,
					exact: !0,
					message: s.exactLength.message
				}), r.dirty());
			}
			if (s.minLength !== null && n.data.length < s.minLength.value && ((0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.too_small,
				minimum: s.minLength.value,
				type: "array",
				inclusive: !0,
				exact: !1,
				message: s.minLength.message
			}), r.dirty()), s.maxLength !== null && n.data.length > s.maxLength.value && ((0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.too_big,
				maximum: s.maxLength.value,
				type: "array",
				inclusive: !0,
				exact: !1,
				message: s.maxLength.message
			}), r.dirty()), n.common.async) return Promise.all([...n.data].map((e, t) => s.type._parseAsync(new o(n, e, n.path, t)))).then((e) => i.ParseStatus.mergeArray(r, e));
			let c = [...n.data].map((e, t) => s.type._parseSync(new o(n, e, n.path, t)));
			return i.ParseStatus.mergeArray(r, c);
		}
		get element() {
			return this._def.type;
		}
		min(t, n) {
			return new e({
				...this._def,
				minLength: {
					value: t,
					message: r.errorUtil.toString(n)
				}
			});
		}
		max(t, n) {
			return new e({
				...this._def,
				maxLength: {
					value: t,
					message: r.errorUtil.toString(n)
				}
			});
		}
		length(t, n) {
			return new e({
				...this._def,
				exactLength: {
					value: t,
					message: r.errorUtil.toString(n)
				}
			});
		}
		nonempty(e) {
			return this.min(1, e);
		}
	};
	e.ZodArray = Te, Te.create = (e, t) => new Te({
		type: e,
		minLength: null,
		maxLength: null,
		exactLength: null,
		typeName: S.ZodArray,
		...c(t)
	});
	function Ee(e) {
		if (e instanceof De) {
			let t = {};
			for (let n in e.shape) {
				let r = e.shape[n];
				t[n] = Ge.create(Ee(r));
			}
			return new De({
				...e._def,
				shape: () => t
			});
		}
		return e instanceof Te ? new Te({
			...e._def,
			type: Ee(e.element)
		}) : e instanceof Ge ? Ge.create(Ee(e.unwrap())) : e instanceof Ke ? Ke.create(Ee(e.unwrap())) : e instanceof Ne ? Ne.create(e.items.map((e) => Ee(e))) : e;
	}
	var De = class e extends l {
		constructor() {
			super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
		}
		_getCached() {
			if (this._cached !== null) return this._cached;
			let e = this._def.shape(), t = a.util.objectKeys(e);
			return this._cached = {
				shape: e,
				keys: t
			}, this._cached;
		}
		_parse(e) {
			if (this._getType(e) !== a.ZodParsedType.object) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.object,
					received: n.parsedType
				}), i.INVALID;
			}
			let { status: n, ctx: r } = this._processInputParams(e), { shape: s, keys: c } = this._getCached(), l = [];
			if (!(this._def.catchall instanceof Ce && this._def.unknownKeys === "strip")) for (let e in r.data) c.includes(e) || l.push(e);
			let u = [];
			for (let e of c) {
				let t = s[e], n = r.data[e];
				u.push({
					key: {
						status: "valid",
						value: e
					},
					value: t._parse(new o(r, n, r.path, e)),
					alwaysSet: e in r.data
				});
			}
			if (this._def.catchall instanceof Ce) {
				let e = this._def.unknownKeys;
				if (e === "passthrough") for (let e of l) u.push({
					key: {
						status: "valid",
						value: e
					},
					value: {
						status: "valid",
						value: r.data[e]
					}
				});
				else if (e === "strict") l.length > 0 && ((0, i.addIssueToContext)(r, {
					code: t.ZodIssueCode.unrecognized_keys,
					keys: l
				}), n.dirty());
				else if (e !== "strip") throw Error("Internal ZodObject error: invalid unknownKeys value.");
			} else {
				let e = this._def.catchall;
				for (let t of l) {
					let n = r.data[t];
					u.push({
						key: {
							status: "valid",
							value: t
						},
						value: e._parse(new o(r, n, r.path, t)),
						alwaysSet: t in r.data
					});
				}
			}
			return r.common.async ? Promise.resolve().then(async () => {
				let e = [];
				for (let t of u) {
					let n = await t.key, r = await t.value;
					e.push({
						key: n,
						value: r,
						alwaysSet: t.alwaysSet
					});
				}
				return e;
			}).then((e) => i.ParseStatus.mergeObjectSync(n, e)) : i.ParseStatus.mergeObjectSync(n, u);
		}
		get shape() {
			return this._def.shape();
		}
		strict(t) {
			return r.errorUtil.errToObj, new e({
				...this._def,
				unknownKeys: "strict",
				...t === void 0 ? {} : { errorMap: (e, n) => {
					let i = this._def.errorMap?.(e, n).message ?? n.defaultError;
					return e.code === "unrecognized_keys" ? { message: r.errorUtil.errToObj(t).message ?? i } : { message: i };
				} }
			});
		}
		strip() {
			return new e({
				...this._def,
				unknownKeys: "strip"
			});
		}
		passthrough() {
			return new e({
				...this._def,
				unknownKeys: "passthrough"
			});
		}
		extend(t) {
			return new e({
				...this._def,
				shape: () => ({
					...this._def.shape(),
					...t
				})
			});
		}
		merge(t) {
			return new e({
				unknownKeys: t._def.unknownKeys,
				catchall: t._def.catchall,
				shape: () => ({
					...this._def.shape(),
					...t._def.shape()
				}),
				typeName: S.ZodObject
			});
		}
		setKey(e, t) {
			return this.augment({ [e]: t });
		}
		catchall(t) {
			return new e({
				...this._def,
				catchall: t
			});
		}
		pick(t) {
			let n = {};
			for (let e of a.util.objectKeys(t)) t[e] && this.shape[e] && (n[e] = this.shape[e]);
			return new e({
				...this._def,
				shape: () => n
			});
		}
		omit(t) {
			let n = {};
			for (let e of a.util.objectKeys(this.shape)) t[e] || (n[e] = this.shape[e]);
			return new e({
				...this._def,
				shape: () => n
			});
		}
		deepPartial() {
			return Ee(this);
		}
		partial(t) {
			let n = {};
			for (let e of a.util.objectKeys(this.shape)) {
				let r = this.shape[e];
				n[e] = t && !t[e] ? r : r.optional();
			}
			return new e({
				...this._def,
				shape: () => n
			});
		}
		required(t) {
			let n = {};
			for (let e of a.util.objectKeys(this.shape)) if (t && !t[e]) n[e] = this.shape[e];
			else {
				let t = this.shape[e];
				for (; t instanceof Ge;) t = t._def.innerType;
				n[e] = t;
			}
			return new e({
				...this._def,
				shape: () => n
			});
		}
		keyof() {
			return Be(a.util.objectKeys(this.shape));
		}
	};
	e.ZodObject = De, De.create = (e, t) => new De({
		shape: () => e,
		unknownKeys: "strip",
		catchall: Ce.create(),
		typeName: S.ZodObject,
		...c(t)
	}), De.strictCreate = (e, t) => new De({
		shape: () => e,
		unknownKeys: "strict",
		catchall: Ce.create(),
		typeName: S.ZodObject,
		...c(t)
	}), De.lazycreate = (e, t) => new De({
		shape: e,
		unknownKeys: "strip",
		catchall: Ce.create(),
		typeName: S.ZodObject,
		...c(t)
	});
	var Oe = class extends l {
		_parse(e) {
			let { ctx: n } = this._processInputParams(e), r = this._def.options;
			function a(e) {
				for (let t of e) if (t.result.status === "valid") return t.result;
				for (let t of e) if (t.result.status === "dirty") return n.common.issues.push(...t.ctx.common.issues), t.result;
				let r = e.map((e) => new t.ZodError(e.ctx.common.issues));
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_union,
					unionErrors: r
				}), i.INVALID;
			}
			if (n.common.async) return Promise.all(r.map(async (e) => {
				let t = {
					...n,
					common: {
						...n.common,
						issues: []
					},
					parent: null
				};
				return {
					result: await e._parseAsync({
						data: n.data,
						path: n.path,
						parent: t
					}),
					ctx: t
				};
			})).then(a);
			{
				let e, a = [];
				for (let t of r) {
					let r = {
						...n,
						common: {
							...n.common,
							issues: []
						},
						parent: null
					}, i = t._parseSync({
						data: n.data,
						path: n.path,
						parent: r
					});
					if (i.status === "valid") return i;
					i.status === "dirty" && !e && (e = {
						result: i,
						ctx: r
					}), r.common.issues.length && a.push(r.common.issues);
				}
				if (e) return n.common.issues.push(...e.ctx.common.issues), e.result;
				let o = a.map((e) => new t.ZodError(e));
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_union,
					unionErrors: o
				}), i.INVALID;
			}
		}
		get options() {
			return this._def.options;
		}
	};
	e.ZodUnion = Oe, Oe.create = (e, t) => new Oe({
		options: e,
		typeName: S.ZodUnion,
		...c(t)
	});
	var ke = (e) => e instanceof Re ? ke(e.schema) : e instanceof We ? ke(e.innerType()) : e instanceof ze ? [e.value] : e instanceof Ve ? e.options : e instanceof He ? a.util.objectValues(e.enum) : e instanceof qe ? ke(e._def.innerType) : e instanceof ye ? [void 0] : e instanceof be ? [null] : e instanceof Ge ? [void 0, ...ke(e.unwrap())] : e instanceof Ke ? [null, ...ke(e.unwrap())] : e instanceof Xe || e instanceof Qe ? ke(e.unwrap()) : e instanceof Je ? ke(e._def.innerType) : [], Ae = class e extends l {
		_parse(e) {
			let { ctx: n } = this._processInputParams(e);
			if (n.parsedType !== a.ZodParsedType.object) return (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.object,
				received: n.parsedType
			}), i.INVALID;
			let r = this.discriminator, o = n.data[r], s = this.optionsMap.get(o);
			return s ? n.common.async ? s._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			}) : s._parseSync({
				data: n.data,
				path: n.path,
				parent: n
			}) : ((0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_union_discriminator,
				options: Array.from(this.optionsMap.keys()),
				path: [r]
			}), i.INVALID);
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
		static create(t, n, r) {
			let i = /* @__PURE__ */ new Map();
			for (let e of n) {
				let n = ke(e.shape[t]);
				if (!n.length) throw Error(`A discriminator value for key \`${t}\` could not be extracted from all schema options`);
				for (let r of n) {
					if (i.has(r)) throw Error(`Discriminator property ${String(t)} has duplicate value ${String(r)}`);
					i.set(r, e);
				}
			}
			return new e({
				typeName: S.ZodDiscriminatedUnion,
				discriminator: t,
				options: n,
				optionsMap: i,
				...c(r)
			});
		}
	};
	e.ZodDiscriminatedUnion = Ae;
	function je(e, t) {
		let n = (0, a.getParsedType)(e), r = (0, a.getParsedType)(t);
		if (e === t) return {
			valid: !0,
			data: e
		};
		if (n === a.ZodParsedType.object && r === a.ZodParsedType.object) {
			let n = a.util.objectKeys(t), r = a.util.objectKeys(e).filter((e) => n.indexOf(e) !== -1), i = {
				...e,
				...t
			};
			for (let n of r) {
				let r = je(e[n], t[n]);
				if (!r.valid) return { valid: !1 };
				i[n] = r.data;
			}
			return {
				valid: !0,
				data: i
			};
		}
		if (n === a.ZodParsedType.array && r === a.ZodParsedType.array) {
			if (e.length !== t.length) return { valid: !1 };
			let n = [];
			for (let r = 0; r < e.length; r++) {
				let i = e[r], a = t[r], o = je(i, a);
				if (!o.valid) return { valid: !1 };
				n.push(o.data);
			}
			return {
				valid: !0,
				data: n
			};
		}
		return n === a.ZodParsedType.date && r === a.ZodParsedType.date && +e == +t ? {
			valid: !0,
			data: e
		} : { valid: !1 };
	}
	var Me = class extends l {
		_parse(e) {
			let { status: n, ctx: r } = this._processInputParams(e), a = (e, a) => {
				if ((0, i.isAborted)(e) || (0, i.isAborted)(a)) return i.INVALID;
				let o = je(e.value, a.value);
				return o.valid ? (((0, i.isDirty)(e) || (0, i.isDirty)(a)) && n.dirty(), {
					status: n.value,
					value: o.data
				}) : ((0, i.addIssueToContext)(r, { code: t.ZodIssueCode.invalid_intersection_types }), i.INVALID);
			};
			return r.common.async ? Promise.all([this._def.left._parseAsync({
				data: r.data,
				path: r.path,
				parent: r
			}), this._def.right._parseAsync({
				data: r.data,
				path: r.path,
				parent: r
			})]).then(([e, t]) => a(e, t)) : a(this._def.left._parseSync({
				data: r.data,
				path: r.path,
				parent: r
			}), this._def.right._parseSync({
				data: r.data,
				path: r.path,
				parent: r
			}));
		}
	};
	e.ZodIntersection = Me, Me.create = (e, t, n) => new Me({
		left: e,
		right: t,
		typeName: S.ZodIntersection,
		...c(n)
	});
	var Ne = class e extends l {
		_parse(e) {
			let { status: n, ctx: r } = this._processInputParams(e);
			if (r.parsedType !== a.ZodParsedType.array) return (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.array,
				received: r.parsedType
			}), i.INVALID;
			if (r.data.length < this._def.items.length) return (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_small,
				minimum: this._def.items.length,
				inclusive: !0,
				exact: !1,
				type: "array"
			}), i.INVALID;
			!this._def.rest && r.data.length > this._def.items.length && ((0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_big,
				maximum: this._def.items.length,
				inclusive: !0,
				exact: !1,
				type: "array"
			}), n.dirty());
			let s = [...r.data].map((e, t) => {
				let n = this._def.items[t] || this._def.rest;
				return n ? n._parse(new o(r, e, r.path, t)) : null;
			}).filter((e) => !!e);
			return r.common.async ? Promise.all(s).then((e) => i.ParseStatus.mergeArray(n, e)) : i.ParseStatus.mergeArray(n, s);
		}
		get items() {
			return this._def.items;
		}
		rest(t) {
			return new e({
				...this._def,
				rest: t
			});
		}
	};
	e.ZodTuple = Ne, Ne.create = (e, t) => {
		if (!Array.isArray(e)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
		return new Ne({
			items: e,
			typeName: S.ZodTuple,
			rest: null,
			...c(t)
		});
	};
	var Pe = class e extends l {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(e) {
			let { status: n, ctx: r } = this._processInputParams(e);
			if (r.parsedType !== a.ZodParsedType.object) return (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.object,
				received: r.parsedType
			}), i.INVALID;
			let s = [], c = this._def.keyType, l = this._def.valueType;
			for (let e in r.data) s.push({
				key: c._parse(new o(r, e, r.path, e)),
				value: l._parse(new o(r, r.data[e], r.path, e)),
				alwaysSet: e in r.data
			});
			return r.common.async ? i.ParseStatus.mergeObjectAsync(n, s) : i.ParseStatus.mergeObjectSync(n, s);
		}
		get element() {
			return this._def.valueType;
		}
		static create(t, n, r) {
			return n instanceof l ? new e({
				keyType: t,
				valueType: n,
				typeName: S.ZodRecord,
				...c(r)
			}) : new e({
				keyType: fe.create(),
				valueType: t,
				typeName: S.ZodRecord,
				...c(n)
			});
		}
	};
	e.ZodRecord = Pe;
	var Fe = class extends l {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(e) {
			let { status: n, ctx: r } = this._processInputParams(e);
			if (r.parsedType !== a.ZodParsedType.map) return (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.map,
				received: r.parsedType
			}), i.INVALID;
			let s = this._def.keyType, c = this._def.valueType, l = [...r.data.entries()].map(([e, t], n) => ({
				key: s._parse(new o(r, e, r.path, [n, "key"])),
				value: c._parse(new o(r, t, r.path, [n, "value"]))
			}));
			if (r.common.async) {
				let e = /* @__PURE__ */ new Map();
				return Promise.resolve().then(async () => {
					for (let t of l) {
						let r = await t.key, a = await t.value;
						if (r.status === "aborted" || a.status === "aborted") return i.INVALID;
						(r.status === "dirty" || a.status === "dirty") && n.dirty(), e.set(r.value, a.value);
					}
					return {
						status: n.value,
						value: e
					};
				});
			}
			{
				let e = /* @__PURE__ */ new Map();
				for (let t of l) {
					let r = t.key, a = t.value;
					if (r.status === "aborted" || a.status === "aborted") return i.INVALID;
					(r.status === "dirty" || a.status === "dirty") && n.dirty(), e.set(r.value, a.value);
				}
				return {
					status: n.value,
					value: e
				};
			}
		}
	};
	e.ZodMap = Fe, Fe.create = (e, t, n) => new Fe({
		valueType: t,
		keyType: e,
		typeName: S.ZodMap,
		...c(n)
	});
	var Ie = class e extends l {
		_parse(e) {
			let { status: n, ctx: r } = this._processInputParams(e);
			if (r.parsedType !== a.ZodParsedType.set) return (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.set,
				received: r.parsedType
			}), i.INVALID;
			let s = this._def;
			s.minSize !== null && r.data.size < s.minSize.value && ((0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_small,
				minimum: s.minSize.value,
				type: "set",
				inclusive: !0,
				exact: !1,
				message: s.minSize.message
			}), n.dirty()), s.maxSize !== null && r.data.size > s.maxSize.value && ((0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.too_big,
				maximum: s.maxSize.value,
				type: "set",
				inclusive: !0,
				exact: !1,
				message: s.maxSize.message
			}), n.dirty());
			let c = this._def.valueType;
			function l(e) {
				let t = /* @__PURE__ */ new Set();
				for (let r of e) {
					if (r.status === "aborted") return i.INVALID;
					r.status === "dirty" && n.dirty(), t.add(r.value);
				}
				return {
					status: n.value,
					value: t
				};
			}
			let u = [...r.data.values()].map((e, t) => c._parse(new o(r, e, r.path, t)));
			return r.common.async ? Promise.all(u).then((e) => l(e)) : l(u);
		}
		min(t, n) {
			return new e({
				...this._def,
				minSize: {
					value: t,
					message: r.errorUtil.toString(n)
				}
			});
		}
		max(t, n) {
			return new e({
				...this._def,
				maxSize: {
					value: t,
					message: r.errorUtil.toString(n)
				}
			});
		}
		size(e, t) {
			return this.min(e, t).max(e, t);
		}
		nonempty(e) {
			return this.min(1, e);
		}
	};
	e.ZodSet = Ie, Ie.create = (e, t) => new Ie({
		valueType: e,
		minSize: null,
		maxSize: null,
		typeName: S.ZodSet,
		...c(t)
	});
	var Le = class e extends l {
		constructor() {
			super(...arguments), this.validate = this.implement;
		}
		_parse(e) {
			let { ctx: r } = this._processInputParams(e);
			if (r.parsedType !== a.ZodParsedType.function) return (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.function,
				received: r.parsedType
			}), i.INVALID;
			function o(e, a) {
				return (0, i.makeIssue)({
					data: e,
					path: r.path,
					errorMaps: [
						r.common.contextualErrorMap,
						r.schemaErrorMap,
						(0, n.getErrorMap)(),
						n.defaultErrorMap
					].filter((e) => !!e),
					issueData: {
						code: t.ZodIssueCode.invalid_arguments,
						argumentsError: a
					}
				});
			}
			function s(e, a) {
				return (0, i.makeIssue)({
					data: e,
					path: r.path,
					errorMaps: [
						r.common.contextualErrorMap,
						r.schemaErrorMap,
						(0, n.getErrorMap)(),
						n.defaultErrorMap
					].filter((e) => !!e),
					issueData: {
						code: t.ZodIssueCode.invalid_return_type,
						returnTypeError: a
					}
				});
			}
			let c = { errorMap: r.common.contextualErrorMap }, l = r.data;
			if (this._def.returns instanceof Ue) {
				let e = this;
				return (0, i.OK)(async function(...n) {
					let r = new t.ZodError([]), i = await e._def.args.parseAsync(n, c).catch((e) => {
						throw r.addIssue(o(n, e)), r;
					}), a = await Reflect.apply(l, this, i);
					return await e._def.returns._def.type.parseAsync(a, c).catch((e) => {
						throw r.addIssue(s(a, e)), r;
					});
				});
			}
			{
				let e = this;
				return (0, i.OK)(function(...n) {
					let r = e._def.args.safeParse(n, c);
					if (!r.success) throw new t.ZodError([o(n, r.error)]);
					let i = Reflect.apply(l, this, r.data), a = e._def.returns.safeParse(i, c);
					if (!a.success) throw new t.ZodError([s(i, a.error)]);
					return a.data;
				});
			}
		}
		parameters() {
			return this._def.args;
		}
		returnType() {
			return this._def.returns;
		}
		args(...t) {
			return new e({
				...this._def,
				args: Ne.create(t).rest(Se.create())
			});
		}
		returns(t) {
			return new e({
				...this._def,
				returns: t
			});
		}
		implement(e) {
			return this.parse(e);
		}
		strictImplement(e) {
			return this.parse(e);
		}
		static create(t, n, r) {
			return new e({
				args: t || Ne.create([]).rest(Se.create()),
				returns: n || Se.create(),
				typeName: S.ZodFunction,
				...c(r)
			});
		}
	};
	e.ZodFunction = Le;
	var Re = class extends l {
		get schema() {
			return this._def.getter();
		}
		_parse(e) {
			let { ctx: t } = this._processInputParams(e);
			return this._def.getter()._parse({
				data: t.data,
				path: t.path,
				parent: t
			});
		}
	};
	e.ZodLazy = Re, Re.create = (e, t) => new Re({
		getter: e,
		typeName: S.ZodLazy,
		...c(t)
	});
	var ze = class extends l {
		_parse(e) {
			if (e.data !== this._def.value) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					received: n.data,
					code: t.ZodIssueCode.invalid_literal,
					expected: this._def.value
				}), i.INVALID;
			}
			return {
				status: "valid",
				value: e.data
			};
		}
		get value() {
			return this._def.value;
		}
	};
	e.ZodLiteral = ze, ze.create = (e, t) => new ze({
		value: e,
		typeName: S.ZodLiteral,
		...c(t)
	});
	function Be(e, t) {
		return new Ve({
			values: e,
			typeName: S.ZodEnum,
			...c(t)
		});
	}
	var Ve = class e extends l {
		_parse(e) {
			if (typeof e.data != "string") {
				let n = this._getOrReturnCtx(e), r = this._def.values;
				return (0, i.addIssueToContext)(n, {
					expected: a.util.joinValues(r),
					received: n.parsedType,
					code: t.ZodIssueCode.invalid_type
				}), i.INVALID;
			}
			if (this._cache ||= new Set(this._def.values), !this._cache.has(e.data)) {
				let n = this._getOrReturnCtx(e), r = this._def.values;
				return (0, i.addIssueToContext)(n, {
					received: n.data,
					code: t.ZodIssueCode.invalid_enum_value,
					options: r
				}), i.INVALID;
			}
			return (0, i.OK)(e.data);
		}
		get options() {
			return this._def.values;
		}
		get enum() {
			let e = {};
			for (let t of this._def.values) e[t] = t;
			return e;
		}
		get Values() {
			let e = {};
			for (let t of this._def.values) e[t] = t;
			return e;
		}
		get Enum() {
			let e = {};
			for (let t of this._def.values) e[t] = t;
			return e;
		}
		extract(t, n = this._def) {
			return e.create(t, {
				...this._def,
				...n
			});
		}
		exclude(t, n = this._def) {
			return e.create(this.options.filter((e) => !t.includes(e)), {
				...this._def,
				...n
			});
		}
	};
	e.ZodEnum = Ve, Ve.create = Be;
	var He = class extends l {
		_parse(e) {
			let n = a.util.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
			if (r.parsedType !== a.ZodParsedType.string && r.parsedType !== a.ZodParsedType.number) {
				let e = a.util.objectValues(n);
				return (0, i.addIssueToContext)(r, {
					expected: a.util.joinValues(e),
					received: r.parsedType,
					code: t.ZodIssueCode.invalid_type
				}), i.INVALID;
			}
			if (this._cache ||= new Set(a.util.getValidEnumValues(this._def.values)), !this._cache.has(e.data)) {
				let e = a.util.objectValues(n);
				return (0, i.addIssueToContext)(r, {
					received: r.data,
					code: t.ZodIssueCode.invalid_enum_value,
					options: e
				}), i.INVALID;
			}
			return (0, i.OK)(e.data);
		}
		get enum() {
			return this._def.values;
		}
	};
	e.ZodNativeEnum = He, He.create = (e, t) => new He({
		values: e,
		typeName: S.ZodNativeEnum,
		...c(t)
	});
	var Ue = class extends l {
		unwrap() {
			return this._def.type;
		}
		_parse(e) {
			let { ctx: n } = this._processInputParams(e);
			if (n.parsedType !== a.ZodParsedType.promise && n.common.async === !1) return (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.promise,
				received: n.parsedType
			}), i.INVALID;
			let r = n.parsedType === a.ZodParsedType.promise ? n.data : Promise.resolve(n.data);
			return (0, i.OK)(r.then((e) => this._def.type.parseAsync(e, {
				path: n.path,
				errorMap: n.common.contextualErrorMap
			})));
		}
	};
	e.ZodPromise = Ue, Ue.create = (e, t) => new Ue({
		type: e,
		typeName: S.ZodPromise,
		...c(t)
	});
	var We = class extends l {
		innerType() {
			return this._def.schema;
		}
		sourceType() {
			return this._def.schema._def.typeName === S.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
		}
		_parse(e) {
			let { status: t, ctx: n } = this._processInputParams(e), r = this._def.effect || null, o = {
				addIssue: (e) => {
					(0, i.addIssueToContext)(n, e), e.fatal ? t.abort() : t.dirty();
				},
				get path() {
					return n.path;
				}
			};
			if (o.addIssue = o.addIssue.bind(o), r.type === "preprocess") {
				let e = r.transform(n.data, o);
				if (n.common.async) return Promise.resolve(e).then(async (e) => {
					if (t.value === "aborted") return i.INVALID;
					let r = await this._def.schema._parseAsync({
						data: e,
						path: n.path,
						parent: n
					});
					return r.status === "aborted" ? i.INVALID : r.status === "dirty" || t.value === "dirty" ? (0, i.DIRTY)(r.value) : r;
				});
				{
					if (t.value === "aborted") return i.INVALID;
					let r = this._def.schema._parseSync({
						data: e,
						path: n.path,
						parent: n
					});
					return r.status === "aborted" ? i.INVALID : r.status === "dirty" || t.value === "dirty" ? (0, i.DIRTY)(r.value) : r;
				}
			}
			if (r.type === "refinement") {
				let e = (e) => {
					let t = r.refinement(e, o);
					if (n.common.async) return Promise.resolve(t);
					if (t instanceof Promise) throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
					return e;
				};
				if (n.common.async === !1) {
					let r = this._def.schema._parseSync({
						data: n.data,
						path: n.path,
						parent: n
					});
					return r.status === "aborted" ? i.INVALID : (r.status === "dirty" && t.dirty(), e(r.value), {
						status: t.value,
						value: r.value
					});
				}
				return this._def.schema._parseAsync({
					data: n.data,
					path: n.path,
					parent: n
				}).then((n) => n.status === "aborted" ? i.INVALID : (n.status === "dirty" && t.dirty(), e(n.value).then(() => ({
					status: t.value,
					value: n.value
				}))));
			}
			if (r.type === "transform") {
				if (n.common.async === !1) {
					let e = this._def.schema._parseSync({
						data: n.data,
						path: n.path,
						parent: n
					});
					if (!(0, i.isValid)(e)) return i.INVALID;
					let a = r.transform(e.value, o);
					if (a instanceof Promise) throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
					return {
						status: t.value,
						value: a
					};
				}
				return this._def.schema._parseAsync({
					data: n.data,
					path: n.path,
					parent: n
				}).then((e) => (0, i.isValid)(e) ? Promise.resolve(r.transform(e.value, o)).then((e) => ({
					status: t.value,
					value: e
				})) : i.INVALID);
			}
			a.util.assertNever(r);
		}
	};
	e.ZodEffects = We, e.ZodTransformer = We, We.create = (e, t, n) => new We({
		schema: e,
		typeName: S.ZodEffects,
		effect: t,
		...c(n)
	}), We.createWithPreprocess = (e, t, n) => new We({
		schema: t,
		effect: {
			type: "preprocess",
			transform: e
		},
		typeName: S.ZodEffects,
		...c(n)
	});
	var Ge = class extends l {
		_parse(e) {
			return this._getType(e) === a.ZodParsedType.undefined ? (0, i.OK)(void 0) : this._def.innerType._parse(e);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	e.ZodOptional = Ge, Ge.create = (e, t) => new Ge({
		innerType: e,
		typeName: S.ZodOptional,
		...c(t)
	});
	var Ke = class extends l {
		_parse(e) {
			return this._getType(e) === a.ZodParsedType.null ? (0, i.OK)(null) : this._def.innerType._parse(e);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	e.ZodNullable = Ke, Ke.create = (e, t) => new Ke({
		innerType: e,
		typeName: S.ZodNullable,
		...c(t)
	});
	var qe = class extends l {
		_parse(e) {
			let { ctx: t } = this._processInputParams(e), n = t.data;
			return t.parsedType === a.ZodParsedType.undefined && (n = this._def.defaultValue()), this._def.innerType._parse({
				data: n,
				path: t.path,
				parent: t
			});
		}
		removeDefault() {
			return this._def.innerType;
		}
	};
	e.ZodDefault = qe, qe.create = (e, t) => new qe({
		innerType: e,
		typeName: S.ZodDefault,
		defaultValue: typeof t.default == "function" ? t.default : () => t.default,
		...c(t)
	});
	var Je = class extends l {
		_parse(e) {
			let { ctx: n } = this._processInputParams(e), r = {
				...n,
				common: {
					...n.common,
					issues: []
				}
			}, a = this._def.innerType._parse({
				data: r.data,
				path: r.path,
				parent: { ...r }
			});
			return (0, i.isAsync)(a) ? a.then((e) => ({
				status: "valid",
				value: e.status === "valid" ? e.value : this._def.catchValue({
					get error() {
						return new t.ZodError(r.common.issues);
					},
					input: r.data
				})
			})) : {
				status: "valid",
				value: a.status === "valid" ? a.value : this._def.catchValue({
					get error() {
						return new t.ZodError(r.common.issues);
					},
					input: r.data
				})
			};
		}
		removeCatch() {
			return this._def.innerType;
		}
	};
	e.ZodCatch = Je, Je.create = (e, t) => new Je({
		innerType: e,
		typeName: S.ZodCatch,
		catchValue: typeof t.catch == "function" ? t.catch : () => t.catch,
		...c(t)
	});
	var Ye = class extends l {
		_parse(e) {
			if (this._getType(e) !== a.ZodParsedType.nan) {
				let n = this._getOrReturnCtx(e);
				return (0, i.addIssueToContext)(n, {
					code: t.ZodIssueCode.invalid_type,
					expected: a.ZodParsedType.nan,
					received: n.parsedType
				}), i.INVALID;
			}
			return {
				status: "valid",
				value: e.data
			};
		}
	};
	e.ZodNaN = Ye, Ye.create = (e) => new Ye({
		typeName: S.ZodNaN,
		...c(e)
	}), e.BRAND = Symbol("zod_brand");
	var Xe = class extends l {
		_parse(e) {
			let { ctx: t } = this._processInputParams(e), n = t.data;
			return this._def.type._parse({
				data: n,
				path: t.path,
				parent: t
			});
		}
		unwrap() {
			return this._def.type;
		}
	};
	e.ZodBranded = Xe;
	var Ze = class e extends l {
		_parse(e) {
			let { status: t, ctx: n } = this._processInputParams(e);
			if (n.common.async) return (async () => {
				let e = await this._def.in._parseAsync({
					data: n.data,
					path: n.path,
					parent: n
				});
				return e.status === "aborted" ? i.INVALID : e.status === "dirty" ? (t.dirty(), (0, i.DIRTY)(e.value)) : this._def.out._parseAsync({
					data: e.value,
					path: n.path,
					parent: n
				});
			})();
			{
				let e = this._def.in._parseSync({
					data: n.data,
					path: n.path,
					parent: n
				});
				return e.status === "aborted" ? i.INVALID : e.status === "dirty" ? (t.dirty(), {
					status: "dirty",
					value: e.value
				}) : this._def.out._parseSync({
					data: e.value,
					path: n.path,
					parent: n
				});
			}
		}
		static create(t, n) {
			return new e({
				in: t,
				out: n,
				typeName: S.ZodPipeline
			});
		}
	};
	e.ZodPipeline = Ze;
	var Qe = class extends l {
		_parse(e) {
			let t = this._def.innerType._parse(e), n = (e) => ((0, i.isValid)(e) && (e.value = Object.freeze(e.value)), e);
			return (0, i.isAsync)(t) ? t.then((e) => n(e)) : n(t);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	e.ZodReadonly = Qe, Qe.create = (e, t) => new Qe({
		innerType: e,
		typeName: S.ZodReadonly,
		...c(t)
	});
	function $e(e, t) {
		let n = typeof e == "function" ? e(t) : typeof e == "string" ? { message: e } : e;
		return typeof n == "string" ? { message: n } : n;
	}
	function et(e, t = {}, n) {
		return e ? xe.create().superRefine((r, i) => {
			let a = e(r);
			if (a instanceof Promise) return a.then((e) => {
				if (!e) {
					let e = $e(t, r), a = e.fatal ?? n ?? !0;
					i.addIssue({
						code: "custom",
						...e,
						fatal: a
					});
				}
			});
			if (!a) {
				let e = $e(t, r), a = e.fatal ?? n ?? !0;
				i.addIssue({
					code: "custom",
					...e,
					fatal: a
				});
			}
		}) : xe.create();
	}
	e.late = { object: De.lazycreate };
	var S;
	(function(e) {
		e.ZodString = "ZodString", e.ZodNumber = "ZodNumber", e.ZodNaN = "ZodNaN", e.ZodBigInt = "ZodBigInt", e.ZodBoolean = "ZodBoolean", e.ZodDate = "ZodDate", e.ZodSymbol = "ZodSymbol", e.ZodUndefined = "ZodUndefined", e.ZodNull = "ZodNull", e.ZodAny = "ZodAny", e.ZodUnknown = "ZodUnknown", e.ZodNever = "ZodNever", e.ZodVoid = "ZodVoid", e.ZodArray = "ZodArray", e.ZodObject = "ZodObject", e.ZodUnion = "ZodUnion", e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", e.ZodIntersection = "ZodIntersection", e.ZodTuple = "ZodTuple", e.ZodRecord = "ZodRecord", e.ZodMap = "ZodMap", e.ZodSet = "ZodSet", e.ZodFunction = "ZodFunction", e.ZodLazy = "ZodLazy", e.ZodLiteral = "ZodLiteral", e.ZodEnum = "ZodEnum", e.ZodEffects = "ZodEffects", e.ZodNativeEnum = "ZodNativeEnum", e.ZodOptional = "ZodOptional", e.ZodNullable = "ZodNullable", e.ZodDefault = "ZodDefault", e.ZodCatch = "ZodCatch", e.ZodPromise = "ZodPromise", e.ZodBranded = "ZodBranded", e.ZodPipeline = "ZodPipeline", e.ZodReadonly = "ZodReadonly";
	})(S || (e.ZodFirstPartyTypeKind = S = {})), e.instanceof = (e, t = { message: `Input not instance of ${e.name}` }) => et((t) => t instanceof e, t);
	var tt = fe.create;
	e.string = tt;
	var nt = me.create;
	e.number = nt, e.nan = Ye.create, e.bigint = he.create;
	var rt = ge.create;
	e.boolean = rt, e.date = _e.create, e.symbol = ve.create, e.undefined = ye.create, e.null = be.create, e.any = xe.create, e.unknown = Se.create, e.never = Ce.create, e.void = we.create, e.array = Te.create, e.object = De.create, e.strictObject = De.strictCreate, e.union = Oe.create, e.discriminatedUnion = Ae.create, e.intersection = Me.create, e.tuple = Ne.create, e.record = Pe.create, e.map = Fe.create, e.set = Ie.create, e.function = Le.create, e.lazy = Re.create, e.literal = ze.create, e.enum = Ve.create, e.nativeEnum = He.create, e.promise = Ue.create;
	var it = We.create;
	e.effect = it, e.transformer = it, e.optional = Ge.create, e.nullable = Ke.create, e.preprocess = We.createWithPreprocess, e.pipeline = Ze.create, e.ostring = () => tt().optional(), e.onumber = () => nt().optional(), e.oboolean = () => rt().optional(), e.coerce = {
		string: ((e) => fe.create({
			...e,
			coerce: !0
		})),
		number: ((e) => me.create({
			...e,
			coerce: !0
		})),
		boolean: ((e) => ge.create({
			...e,
			coerce: !0
		})),
		bigint: ((e) => he.create({
			...e,
			coerce: !0
		})),
		date: ((e) => _e.create({
			...e,
			coerce: !0
		}))
	}, e.NEVER = i.INVALID;
})), $a = /* @__PURE__ */ o(((e) => {
	var t = e && e.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n);
		var i = Object.getOwnPropertyDescriptor(t, n);
		(!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		}), Object.defineProperty(e, r, i);
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), n = e && e.__exportStar || function(e, n) {
		for (var r in e) r !== "default" && !Object.prototype.hasOwnProperty.call(n, r) && t(n, e, r);
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), n(Ja(), e), n(Ya(), e), n(Xa(), e), n(Ga(), e), n(Qa(), e), n(Ka(), e);
})), eo = /* @__PURE__ */ o(((e) => {
	var t = e && e.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n);
		var i = Object.getOwnPropertyDescriptor(t, n);
		(!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		}), Object.defineProperty(e, r, i);
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), n = e && e.__setModuleDefault || (Object.create ? (function(e, t) {
		Object.defineProperty(e, "default", {
			enumerable: !0,
			value: t
		});
	}) : function(e, t) {
		e.default = t;
	}), r = e && e.__importStar || function(e) {
		if (e && e.__esModule) return e;
		var r = {};
		if (e != null) for (var i in e) i !== "default" && Object.prototype.hasOwnProperty.call(e, i) && t(r, e, i);
		return n(r, e), r;
	}, i = e && e.__exportStar || function(e, n) {
		for (var r in e) r !== "default" && !Object.prototype.hasOwnProperty.call(n, r) && t(n, e, r);
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.z = void 0;
	var a = r($a());
	e.z = a, i($a(), e), e.default = a;
})), to = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.InvalidDidError = e.DidError = void 0;
	var t = class e extends Error {
		constructor(e, t, n, r = 400, i) {
			super(t, { cause: i }), Object.defineProperty(this, "did", {
				enumerable: !0,
				configurable: !0,
				writable: !0,
				value: e
			}), Object.defineProperty(this, "code", {
				enumerable: !0,
				configurable: !0,
				writable: !0,
				value: n
			}), Object.defineProperty(this, "status", {
				enumerable: !0,
				configurable: !0,
				writable: !0,
				value: r
			});
		}
		get statusCode() {
			return this.status;
		}
		toString() {
			return `${this.constructor.name} ${this.code} (${this.did}): ${this.message}`;
		}
		static from(t, n) {
			if (t instanceof e) return t;
			let r = t instanceof Error ? t.message : typeof t == "string" ? t : "An unknown error occurred", i = (typeof t?.statusCode == "number" ? t.statusCode : void 0) ?? (typeof t?.status == "number" ? t.status : void 0);
			return new e(n, r, "did-unknown-error", i, t);
		}
	};
	e.DidError = t, e.InvalidDidError = class extends t {
		constructor(e, t, n) {
			super(e, t, "did-invalid", 400, n);
		}
	};
})), no = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.canParse = void 0, e.isFragment = t, e.isHexDigit = n;
	function t(e, t = 0, r = e.length) {
		let i;
		for (let a = t; a < r; a++) if (i = e.charCodeAt(a), !(i >= 65 && i <= 90 || i >= 97 && i <= 122 || i >= 48 && i <= 57 || i === 45 || i === 46 || i === 95 || i === 126) && i !== 33 && i !== 36 && i !== 38 && i !== 39 && i !== 40 && i !== 41 && i !== 42 && i !== 43 && i !== 44 && i !== 59 && i !== 61 && i !== 58 && i !== 64 && i !== 47 && i !== 63) {
			if (i === 37) {
				if (a + 2 >= r || !n(e.charCodeAt(a + 1)) || !n(e.charCodeAt(a + 2))) return !1;
				a += 2;
			} else return !1;
		}
		return !0;
	}
	function n(e) {
		return e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102;
	}
	e.canParse = URL.canParse?.bind(URL) ?? ((e, t) => {
		try {
			return new URL(e, t), !0;
		} catch {
			return !1;
		}
	});
})), ro = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.DID_PLC_PREFIX = void 0, e.isDidPlc = a, e.asDidPlc = o, e.assertDidPlc = s;
	var t = to(), n = "did:plc:";
	e.DID_PLC_PREFIX = n;
	var r = n.length, i = 32;
	function a(e) {
		if (typeof e != "string" || e.length !== i || !e.startsWith(n)) return !1;
		for (let t = r; t < i; t++) if (!c(e.charCodeAt(t))) return !1;
		return !0;
	}
	function o(e) {
		return s(e), e;
	}
	function s(e) {
		if (typeof e != "string") throw new t.InvalidDidError(typeof e, "DID must be a string");
		if (!e.startsWith(n)) throw new t.InvalidDidError(e, "Invalid did:plc prefix");
		if (e.length !== i) throw new t.InvalidDidError(e, `did:plc must be ${i} characters long`);
		for (let n = r; n < i; n++) if (!c(e.charCodeAt(n))) throw new t.InvalidDidError(e, `Invalid character at position ${n}`);
	}
	var c = (e) => e >= 97 && e <= 122 || e >= 50 && e <= 55;
})), io = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.didSchema = e.DID_PREFIX = void 0, e.assertDidMethod = a, e.extractDidMethod = o, e.assertDidMsid = s, e.assertDid = c, e.isDid = l, e.asDid = u;
	var t = eo(), n = to(), r = "did:";
	e.DID_PREFIX = r;
	var i = 4;
	function a(e, t = 0, r = e.length) {
		if (!Number.isFinite(r) || !Number.isFinite(t) || r < t || r > e.length) throw TypeError("Invalid start or end position");
		if (r === t) throw new n.InvalidDidError(e, "Empty method name");
		let i;
		for (let a = t; a < r; a++) if (i = e.charCodeAt(a), (i < 97 || i > 122) && (i < 48 || i > 57)) throw new n.InvalidDidError(e, `Invalid character at position ${a} in DID method name`);
	}
	function o(e) {
		let t = e.indexOf(":", i);
		return e.slice(i, t);
	}
	function s(e, t = 0, r = e.length) {
		if (!Number.isFinite(r) || !Number.isFinite(t) || r < t || r > e.length) throw TypeError("Invalid start or end position");
		if (r === t) throw new n.InvalidDidError(e, "DID method-specific id must not be empty");
		let i;
		for (let a = t; a < r; a++) if (i = e.charCodeAt(a), (i < 97 || i > 122) && (i < 65 || i > 90) && (i < 48 || i > 57) && i !== 46 && i !== 45 && i !== 95) {
			if (i === 58) {
				if (a === r - 1) throw new n.InvalidDidError(e, "DID cannot end with \":\"");
				continue;
			}
			if (i === 37) {
				if (i = e.charCodeAt(++a), (i < 48 || i > 57) && (i < 65 || i > 70) || (i = e.charCodeAt(++a), (i < 48 || i > 57) && (i < 65 || i > 70))) throw new n.InvalidDidError(e, `Invalid pct-encoded character at position ${a}`);
				if (a >= r) throw new n.InvalidDidError(e, `Incomplete pct-encoded character at position ${a - 2}`);
				continue;
			}
			throw new n.InvalidDidError(e, `Disallowed character in DID at position ${a}`);
		}
	}
	function c(e) {
		if (typeof e != "string") throw new n.InvalidDidError(typeof e, "DID must be a string");
		let { length: t } = e;
		if (t > 2048) throw new n.InvalidDidError(e, "DID is too long (2048 chars max)");
		if (!e.startsWith(r)) throw new n.InvalidDidError(e, `DID requires "${r}" prefix`);
		let o = e.indexOf(":", i);
		if (o === -1) throw new n.InvalidDidError(e, "Missing colon after method name");
		a(e, i, o), s(e, o + 1, t);
	}
	function l(e) {
		try {
			return c(e), !0;
		} catch (e) {
			if (e instanceof n.DidError) return !1;
			throw e;
		}
	}
	function u(e) {
		return c(e), e;
	}
	e.didSchema = t.z.string().superRefine((e, n) => {
		try {
			return c(e), !0;
		} catch (e) {
			return n.addIssue({
				code: t.z.ZodIssueCode.custom,
				message: e instanceof Error ? e.message : "Unexpected error"
			}), !1;
		}
	});
})), ao = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.DID_WEB_PREFIX = void 0, e.isDidWeb = i, e.asDidWeb = a, e.assertDidWeb = o, e.didWebToUrl = s, e.urlToDidWeb = c, e.buildDidWebUrl = l;
	var t = to(), n = io(), r = no();
	e.DID_WEB_PREFIX = "did:web:";
	function i(t) {
		if (typeof t != "string" || !t.startsWith(e.DID_WEB_PREFIX) || t.charAt(e.DID_WEB_PREFIX.length) === ":") return !1;
		try {
			(0, n.assertDidMsid)(t, e.DID_WEB_PREFIX.length);
		} catch {
			return !1;
		}
		return (0, r.canParse)(l(t));
	}
	function a(e) {
		return o(e), e;
	}
	function o(i) {
		if (typeof i != "string") throw new t.InvalidDidError(typeof i, "DID must be a string");
		if (!i.startsWith(e.DID_WEB_PREFIX)) throw new t.InvalidDidError(i, "Invalid did:web prefix");
		if (i.charAt(e.DID_WEB_PREFIX.length) === ":") throw new t.InvalidDidError(i, "did:web MSID must not start with a colon");
		if ((0, n.assertDidMsid)(i, e.DID_WEB_PREFIX.length), !(0, r.canParse)(l(i))) throw new t.InvalidDidError(i, "Invalid Web DID");
	}
	function s(e) {
		try {
			return new URL(l(e));
		} catch (n) {
			throw new t.InvalidDidError(e, "Invalid Web DID", n);
		}
	}
	function c(e) {
		let t = e.port ? `%3A${e.port}` : "", n = e.pathname === "/" ? "" : e.pathname.replaceAll("/", ":");
		return `did:web:${e.hostname}${t}${n}`;
	}
	function l(t) {
		let n = e.DID_WEB_PREFIX.length, r = t.indexOf(":", n), i = (r === -1 ? t.slice(n) : t.slice(n, r)).replaceAll("%3A", ":"), a = r === -1 ? "" : t.slice(r).replaceAll(":", "/");
		return `${i.startsWith("localhost") && (i.length === 9 || i.charCodeAt(9) === 58) ? "http" : "https"}://${i}${a}`;
	}
})), oo = /* @__PURE__ */ o(((e) => {
	var t = e && e.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n);
		var i = Object.getOwnPropertyDescriptor(t, n);
		(!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		}), Object.defineProperty(e, r, i);
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), n = e && e.__exportStar || function(e, n) {
		for (var r in e) r !== "default" && !Object.prototype.hasOwnProperty.call(n, r) && t(n, e, r);
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), n(ro(), e), n(ao(), e);
})), so = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.matchesIdentifier = t;
	function t(e, t, n) {
		return n.charCodeAt(0) === 35 ? n.length === t.length + 1 && n.endsWith(t) : n.length === t.length + 1 + e.length && n.charCodeAt(e.length) === 35 && n.startsWith(e) && n.endsWith(t);
	}
})), co = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.ATPROTO_VERIFICATION_METHOD_TYPES = e.isAtprotoAudience = e.atprotoDidSchema = void 0, e.isAtprotoDid = o, e.asAtprotoDid = s, e.assertAtprotoDid = c, e.assertAtprotoDidWeb = l, e.isAtprotoDidWeb = u, e.extractAtprotoData = m, e.extractPdsUrl = h, e.isAtprotoAka = g, e.isAtprotoPersonalDataServerService = _, e.isAtprotoVerificationMethod = v;
	var t = eo(), n = to(), r = no(), i = oo(), a = so();
	e.atprotoDidSchema = t.z.string().refine(o, "Atproto only allows \"plc\" and \"web\" DID methods");
	function o(e) {
		return (0, i.isDidPlc)(e) || u(e);
	}
	function s(e) {
		return c(e), e;
	}
	function c(e) {
		if (typeof e != "string") throw new n.InvalidDidError(typeof e, "DID must be a string");
		if (e.startsWith(i.DID_PLC_PREFIX)) (0, i.assertDidPlc)(e);
		else if (e.startsWith(i.DID_WEB_PREFIX)) l(e);
		else throw new n.InvalidDidError(e, "Atproto only allows \"plc\" and \"web\" DID methods");
	}
	function l(e) {
		if ((0, i.assertDidWeb)(e), d(e)) throw new n.InvalidDidError(e, "Atproto does not allow path components in Web DIDs");
		if (p(e)) throw new n.InvalidDidError(e, "Atproto does not allow port numbers in Web DIDs, except for localhost");
	}
	function u(e) {
		return !(!(0, i.isDidWeb)(e) || d(e) || p(e));
	}
	function d(e) {
		return e.includes(":", i.DID_WEB_PREFIX.length);
	}
	function f(e) {
		return e === "did:web:localhost" || e.startsWith("did:web:localhost:") || e.startsWith("did:web:localhost%3A");
	}
	function p(e) {
		if (f(e)) return !1;
		let t = e.indexOf(":", i.DID_WEB_PREFIX.length);
		return t === -1 ? e.includes("%3A", i.DID_WEB_PREFIX.length) : e.lastIndexOf("%3A", t) !== -1;
	}
	e.isAtprotoAudience = (e) => {
		if (typeof e != "string") return !1;
		let t = e.indexOf("#");
		return t === -1 || e.indexOf("#", t + 1) !== -1 ? !1 : (0, r.isFragment)(e, t + 1) && o(e.slice(0, t));
	};
	function m(e) {
		return {
			did: e.id,
			aka: e.alsoKnownAs?.find(g)?.slice(5),
			key: e.verificationMethod?.find(v, e),
			pds: e.service?.find(_, e)
		};
	}
	function h(e) {
		let t = e.service?.find(_, e);
		if (!t) throw new n.DidError(e.id, `Document ${e.id} does not contain a (valid) #atproto_pds service URL`, "did-service-not-found");
		return new URL(t.serviceEndpoint);
	}
	function g(e) {
		return e.startsWith("at://");
	}
	function _(e) {
		return e?.type === "AtprotoPersonalDataServer" && typeof e.serviceEndpoint == "string" && (0, r.canParse)(e.serviceEndpoint) && (0, a.matchesIdentifier)(this.id, "atproto_pds", e.id);
	}
	e.ATPROTO_VERIFICATION_METHOD_TYPES = Object.freeze([
		"EcdsaSecp256r1VerificationKey2019",
		"EcdsaSecp256k1VerificationKey2019",
		"Multikey"
	]);
	function v(t) {
		return typeof t == "object" && typeof t?.publicKeyMultibase == "string" && e.ATPROTO_VERIFICATION_METHOD_TYPES.includes(t.type) && (0, a.matchesIdentifier)(this.id, "atproto", t.id);
	}
})), lo = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.didDocumentValidator = e.didDocumentSchema = void 0;
	var t = eo(), n = io(), r = no(), i = t.z.string().url("RFC3968 compliant URI"), a = t.z.union([n.didSchema, t.z.array(n.didSchema)]), o = t.z.union([i.refine((e) => {
		let t = e.indexOf("#");
		return t !== -1 && (0, r.isFragment)(e, t + 1);
	}, { message: "Missing or invalid fragment in RFC3968 URI" }), t.z.string().refine((e) => e.charCodeAt(0) === 35, { message: "Fragment must start with #" }).refine((e) => (0, r.isFragment)(e, 1), { message: "Invalid char in URI fragment" })]), s = t.z.object({
		id: o,
		type: t.z.string().min(1),
		controller: a,
		publicKeyJwk: t.z.record(t.z.string(), t.z.unknown()).optional(),
		publicKeyMultibase: t.z.string().optional()
	}), c = o, l = t.z.union([t.z.string(), t.z.array(t.z.string())]), u = t.z.union([
		i,
		t.z.record(t.z.string(), i),
		t.z.array(t.z.union([i, t.z.record(t.z.string(), i)])).nonempty()
	]), d = t.z.object({
		id: c,
		type: l,
		serviceEndpoint: u
	}), f = t.z.union([o, s]);
	e.didDocumentSchema = t.z.object({
		"@context": t.z.union([t.z.literal("https://www.w3.org/ns/did/v1"), t.z.array(t.z.string().url()).nonempty().refine((e) => e[0] === "https://www.w3.org/ns/did/v1", { message: "First @context must be https://www.w3.org/ns/did/v1" })]).optional(),
		id: n.didSchema,
		controller: a.optional(),
		alsoKnownAs: t.z.array(i).optional(),
		service: t.z.array(d).optional(),
		authentication: t.z.array(f).optional(),
		verificationMethod: t.z.array(s).optional()
	}), e.didDocumentValidator = e.didDocumentSchema.superRefine(({ id: e, service: n }, r) => {
		if (n) {
			let i = /* @__PURE__ */ new Set();
			for (let a = 0; a < n.length; a++) {
				let o = n[a], s = o.id.startsWith("#") ? `${e}${o.id}` : o.id;
				i.has(s) ? r.addIssue({
					code: t.z.ZodIssueCode.custom,
					message: `Duplicate service id (${o.id}) found in the document`,
					path: [
						"service",
						a,
						"id"
					]
				}) : i.add(s);
			}
		}
	});
})), uo = /* @__PURE__ */ o(((e) => {
	var t = e && e.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n);
		var i = Object.getOwnPropertyDescriptor(t, n);
		(!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		}), Object.defineProperty(e, r, i);
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), n = e && e.__exportStar || function(e, n) {
		for (var r in e) r !== "default" && !Object.prototype.hasOwnProperty.call(n, r) && t(n, e, r);
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), n(co(), e), n(lo(), e), n(to(), e), n(io(), e), n(oo(), e), n(so(), e);
})), w;
(function(e) {
	e.assertEqual = (e) => {};
	function t(e) {}
	e.assertIs = t;
	function n(e) {
		throw Error();
	}
	e.assertNever = n, e.arrayToEnum = (e) => {
		let t = {};
		for (let n of e) t[n] = n;
		return t;
	}, e.getValidEnumValues = (t) => {
		let n = e.objectKeys(t).filter((e) => typeof t[t[e]] != "number"), r = {};
		for (let e of n) r[e] = t[e];
		return e.objectValues(r);
	}, e.objectValues = (t) => e.objectKeys(t).map(function(e) {
		return t[e];
	}), e.objectKeys = typeof Object.keys == "function" ? (e) => Object.keys(e) : (e) => {
		let t = [];
		for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
		return t;
	}, e.find = (e, t) => {
		for (let n of e) if (t(n)) return n;
	}, e.isInteger = typeof Number.isInteger == "function" ? (e) => Number.isInteger(e) : (e) => typeof e == "number" && Number.isFinite(e) && Math.floor(e) === e;
	function r(e, t = " | ") {
		return e.map((e) => typeof e == "string" ? `'${e}'` : e).join(t);
	}
	e.joinValues = r, e.jsonStringifyReplacer = (e, t) => typeof t == "bigint" ? t.toString() : t;
})(w ||= {});
var fo;
(function(e) {
	e.mergeShapes = (e, t) => ({
		...e,
		...t
	});
})(fo ||= {});
var T = w.arrayToEnum([
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
]), po = (e) => {
	switch (typeof e) {
		case "undefined": return T.undefined;
		case "string": return T.string;
		case "number": return Number.isNaN(e) ? T.nan : T.number;
		case "boolean": return T.boolean;
		case "function": return T.function;
		case "bigint": return T.bigint;
		case "symbol": return T.symbol;
		case "object": return Array.isArray(e) ? T.array : e === null ? T.null : e.then && typeof e.then == "function" && e.catch && typeof e.catch == "function" ? T.promise : typeof Map < "u" && e instanceof Map ? T.map : typeof Set < "u" && e instanceof Set ? T.set : typeof Date < "u" && e instanceof Date ? T.date : T.object;
		default: return T.unknown;
	}
}, E = w.arrayToEnum([
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
]), mo = class e extends Error {
	get errors() {
		return this.issues;
	}
	constructor(e) {
		super(), this.issues = [], this.addIssue = (e) => {
			this.issues = [...this.issues, e];
		}, this.addIssues = (e = []) => {
			this.issues = [...this.issues, ...e];
		};
		let t = new.target.prototype;
		Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
	}
	format(e) {
		let t = e || function(e) {
			return e.message;
		}, n = { _errors: [] }, r = (e) => {
			for (let i of e.issues) if (i.code === "invalid_union") i.unionErrors.map(r);
			else if (i.code === "invalid_return_type") r(i.returnTypeError);
			else if (i.code === "invalid_arguments") r(i.argumentsError);
			else if (i.path.length === 0) n._errors.push(t(i));
			else {
				let e = n, r = 0;
				for (; r < i.path.length;) {
					let n = i.path[r];
					r === i.path.length - 1 ? (e[n] = e[n] || { _errors: [] }, e[n]._errors.push(t(i))) : e[n] = e[n] || { _errors: [] }, e = e[n], r++;
				}
			}
		};
		return r(this), n;
	}
	static assert(t) {
		if (!(t instanceof e)) throw Error(`Not a ZodError: ${t}`);
	}
	toString() {
		return this.message;
	}
	get message() {
		return JSON.stringify(this.issues, w.jsonStringifyReplacer, 2);
	}
	get isEmpty() {
		return this.issues.length === 0;
	}
	flatten(e = (e) => e.message) {
		let t = {}, n = [];
		for (let r of this.issues) if (r.path.length > 0) {
			let n = r.path[0];
			t[n] = t[n] || [], t[n].push(e(r));
		} else n.push(e(r));
		return {
			formErrors: n,
			fieldErrors: t
		};
	}
	get formErrors() {
		return this.flatten();
	}
};
mo.create = (e) => new mo(e);
//#endregion
//#region node_modules/zod/v3/locales/en.js
var ho = (e, t) => {
	let n;
	switch (e.code) {
		case E.invalid_type:
			n = e.received === T.undefined ? "Required" : `Expected ${e.expected}, received ${e.received}`;
			break;
		case E.invalid_literal:
			n = `Invalid literal value, expected ${JSON.stringify(e.expected, w.jsonStringifyReplacer)}`;
			break;
		case E.unrecognized_keys:
			n = `Unrecognized key(s) in object: ${w.joinValues(e.keys, ", ")}`;
			break;
		case E.invalid_union:
			n = "Invalid input";
			break;
		case E.invalid_union_discriminator:
			n = `Invalid discriminator value. Expected ${w.joinValues(e.options)}`;
			break;
		case E.invalid_enum_value:
			n = `Invalid enum value. Expected ${w.joinValues(e.options)}, received '${e.received}'`;
			break;
		case E.invalid_arguments:
			n = "Invalid function arguments";
			break;
		case E.invalid_return_type:
			n = "Invalid function return type";
			break;
		case E.invalid_date:
			n = "Invalid date";
			break;
		case E.invalid_string:
			typeof e.validation == "object" ? "includes" in e.validation ? (n = `Invalid input: must include "${e.validation.includes}"`, typeof e.validation.position == "number" && (n = `${n} at one or more positions greater than or equal to ${e.validation.position}`)) : "startsWith" in e.validation ? n = `Invalid input: must start with "${e.validation.startsWith}"` : "endsWith" in e.validation ? n = `Invalid input: must end with "${e.validation.endsWith}"` : w.assertNever(e.validation) : n = e.validation === "regex" ? "Invalid" : `Invalid ${e.validation}`;
			break;
		case E.too_small:
			n = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "more than"} ${e.minimum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "over"} ${e.minimum} character(s)` : e.type === "number" || e.type === "bigint" ? `Number must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${e.minimum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(e.minimum))}` : "Invalid input";
			break;
		case E.too_big:
			n = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "less than"} ${e.maximum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "under"} ${e.maximum} character(s)` : e.type === "number" ? `Number must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "bigint" ? `BigInt must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly" : e.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(e.maximum))}` : "Invalid input";
			break;
		case E.custom:
			n = "Invalid input";
			break;
		case E.invalid_intersection_types:
			n = "Intersection results could not be merged";
			break;
		case E.not_multiple_of:
			n = `Number must be a multiple of ${e.multipleOf}`;
			break;
		case E.not_finite:
			n = "Number must be finite";
			break;
		default: n = t.defaultError, w.assertNever(e);
	}
	return { message: n };
}, go = ho;
function _o() {
	return go;
}
//#endregion
//#region node_modules/zod/v3/helpers/parseUtil.js
var vo = (e) => {
	let { data: t, path: n, errorMaps: r, issueData: i } = e, a = [...n, ...i.path || []], o = {
		...i,
		path: a
	};
	if (i.message !== void 0) return {
		...i,
		path: a,
		message: i.message
	};
	let s = "", c = r.filter((e) => !!e).slice().reverse();
	for (let e of c) s = e(o, {
		data: t,
		defaultError: s
	}).message;
	return {
		...i,
		path: a,
		message: s
	};
};
function D(e, t) {
	let n = _o(), r = vo({
		issueData: t,
		data: e.data,
		path: e.path,
		errorMaps: [
			e.common.contextualErrorMap,
			e.schemaErrorMap,
			n,
			n === ho ? void 0 : ho
		].filter((e) => !!e)
	});
	e.common.issues.push(r);
}
var yo = class e {
	constructor() {
		this.value = "valid";
	}
	dirty() {
		this.value === "valid" && (this.value = "dirty");
	}
	abort() {
		this.value !== "aborted" && (this.value = "aborted");
	}
	static mergeArray(e, t) {
		let n = [];
		for (let r of t) {
			if (r.status === "aborted") return O;
			r.status === "dirty" && e.dirty(), n.push(r.value);
		}
		return {
			status: e.value,
			value: n
		};
	}
	static async mergeObjectAsync(t, n) {
		let r = [];
		for (let e of n) {
			let t = await e.key, n = await e.value;
			r.push({
				key: t,
				value: n
			});
		}
		return e.mergeObjectSync(t, r);
	}
	static mergeObjectSync(e, t) {
		let n = {};
		for (let r of t) {
			let { key: t, value: i } = r;
			if (t.status === "aborted" || i.status === "aborted") return O;
			t.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), t.value !== "__proto__" && (i.value !== void 0 || r.alwaysSet) && (n[t.value] = i.value);
		}
		return {
			status: e.value,
			value: n
		};
	}
}, O = Object.freeze({ status: "aborted" }), bo = (e) => ({
	status: "dirty",
	value: e
}), xo = (e) => ({
	status: "valid",
	value: e
}), So = (e) => e.status === "aborted", Co = (e) => e.status === "dirty", wo = (e) => e.status === "valid", To = (e) => typeof Promise < "u" && e instanceof Promise, k;
(function(e) {
	e.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, e.toString = (e) => typeof e == "string" ? e : e?.message;
})(k ||= {});
//#endregion
//#region node_modules/zod/v3/types.js
var Eo = class {
	constructor(e, t, n, r) {
		this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = r;
	}
	get path() {
		return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
	}
}, Do = (e, t) => {
	if (wo(t)) return {
		success: !0,
		data: t.value
	};
	if (!e.common.issues.length) throw Error("Validation failed but no issues detected.");
	return {
		success: !1,
		get error() {
			if (this._error) return this._error;
			let t = new mo(e.common.issues);
			return this._error = t, this._error;
		}
	};
};
function A(e) {
	if (!e) return {};
	let { errorMap: t, invalid_type_error: n, required_error: r, description: i } = e;
	if (t && (n || r)) throw Error("Can't use \"invalid_type_error\" or \"required_error\" in conjunction with custom error map.");
	return t ? {
		errorMap: t,
		description: i
	} : {
		errorMap: (t, i) => {
			let { message: a } = e;
			return t.code === "invalid_enum_value" ? { message: a ?? i.defaultError } : i.data === void 0 ? { message: a ?? r ?? i.defaultError } : t.code === "invalid_type" ? { message: a ?? n ?? i.defaultError } : { message: i.defaultError };
		},
		description: i
	};
}
var j = class {
	get description() {
		return this._def.description;
	}
	_getType(e) {
		return po(e.data);
	}
	_getOrReturnCtx(e, t) {
		return t || {
			common: e.parent.common,
			data: e.data,
			parsedType: po(e.data),
			schemaErrorMap: this._def.errorMap,
			path: e.path,
			parent: e.parent
		};
	}
	_processInputParams(e) {
		return {
			status: new yo(),
			ctx: {
				common: e.parent.common,
				data: e.data,
				parsedType: po(e.data),
				schemaErrorMap: this._def.errorMap,
				path: e.path,
				parent: e.parent
			}
		};
	}
	_parseSync(e) {
		let t = this._parse(e);
		if (To(t)) throw Error("Synchronous parse encountered promise.");
		return t;
	}
	_parseAsync(e) {
		let t = this._parse(e);
		return Promise.resolve(t);
	}
	parse(e, t) {
		let n = this.safeParse(e, t);
		if (n.success) return n.data;
		throw n.error;
	}
	safeParse(e, t) {
		let n = {
			common: {
				issues: [],
				async: t?.async ?? !1,
				contextualErrorMap: t?.errorMap
			},
			path: t?.path || [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: e,
			parsedType: po(e)
		};
		return Do(n, this._parseSync({
			data: e,
			path: n.path,
			parent: n
		}));
	}
	"~validate"(e) {
		let t = {
			common: {
				issues: [],
				async: !!this["~standard"].async
			},
			path: [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: e,
			parsedType: po(e)
		};
		if (!this["~standard"].async) try {
			let n = this._parseSync({
				data: e,
				path: [],
				parent: t
			});
			return wo(n) ? { value: n.value } : { issues: t.common.issues };
		} catch (e) {
			e?.message?.toLowerCase()?.includes("encountered") && (this["~standard"].async = !0), t.common = {
				issues: [],
				async: !0
			};
		}
		return this._parseAsync({
			data: e,
			path: [],
			parent: t
		}).then((e) => wo(e) ? { value: e.value } : { issues: t.common.issues });
	}
	async parseAsync(e, t) {
		let n = await this.safeParseAsync(e, t);
		if (n.success) return n.data;
		throw n.error;
	}
	async safeParseAsync(e, t) {
		let n = {
			common: {
				issues: [],
				contextualErrorMap: t?.errorMap,
				async: !0
			},
			path: t?.path || [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: e,
			parsedType: po(e)
		}, r = this._parse({
			data: e,
			path: n.path,
			parent: n
		});
		return Do(n, await (To(r) ? r : Promise.resolve(r)));
	}
	refine(e, t) {
		let n = (e) => typeof t == "string" || t === void 0 ? { message: t } : typeof t == "function" ? t(e) : t;
		return this._refinement((t, r) => {
			let i = e(t), a = () => r.addIssue({
				code: E.custom,
				...n(t)
			});
			return typeof Promise < "u" && i instanceof Promise ? i.then((e) => e ? !0 : (a(), !1)) : i ? !0 : (a(), !1);
		});
	}
	refinement(e, t) {
		return this._refinement((n, r) => e(n) ? !0 : (r.addIssue(typeof t == "function" ? t(n, r) : t), !1));
	}
	_refinement(e) {
		return new As({
			schema: this,
			typeName: M.ZodEffects,
			effect: {
				type: "refinement",
				refinement: e
			}
		});
	}
	superRefine(e) {
		return this._refinement(e);
	}
	constructor(e) {
		this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
			version: 1,
			vendor: "zod",
			validate: (e) => this["~validate"](e)
		};
	}
	optional() {
		return js.create(this, this._def);
	}
	nullable() {
		return Ms.create(this, this._def);
	}
	nullish() {
		return this.nullable().optional();
	}
	array() {
		return ds.create(this);
	}
	promise() {
		return ks.create(this, this._def);
	}
	or(e) {
		return ms.create([this, e], this._def);
	}
	and(e) {
		return vs.create(this, e, this._def);
	}
	transform(e) {
		return new As({
			...A(this._def),
			schema: this,
			typeName: M.ZodEffects,
			effect: {
				type: "transform",
				transform: e
			}
		});
	}
	default(e) {
		let t = typeof e == "function" ? e : () => e;
		return new Ns({
			...A(this._def),
			innerType: this,
			defaultValue: t,
			typeName: M.ZodDefault
		});
	}
	brand() {
		return new Is({
			typeName: M.ZodBranded,
			type: this,
			...A(this._def)
		});
	}
	catch(e) {
		let t = typeof e == "function" ? e : () => e;
		return new Ps({
			...A(this._def),
			innerType: this,
			catchValue: t,
			typeName: M.ZodCatch
		});
	}
	describe(e) {
		let t = this.constructor;
		return new t({
			...this._def,
			description: e
		});
	}
	pipe(e) {
		return Ls.create(this, e);
	}
	readonly() {
		return Rs.create(this);
	}
	isOptional() {
		return this.safeParse(void 0).success;
	}
	isNullable() {
		return this.safeParse(null).success;
	}
}, Oo = /^c[^\s-]{8,}$/i, ko = /^[0-9a-z]+$/, Ao = /^[0-9A-HJKMNP-TV-Z]{26}$/i, jo = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Mo = /^[a-z0-9_-]{21}$/i, No = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Po = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Fo = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Io = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", Lo, Ro = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, zo = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Bo = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Vo = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ho = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Uo = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Wo = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Go = RegExp(`^${Wo}$`);
function Ko(e) {
	let t = "[0-5]\\d";
	e.precision ? t = `${t}\\.\\d{${e.precision}}` : e.precision ?? (t = `${t}(\\.\\d+)?`);
	let n = e.precision ? "+" : "?";
	return `([01]\\d|2[0-3]):[0-5]\\d(:${t})${n}`;
}
function qo(e) {
	return RegExp(`^${Ko(e)}$`);
}
function Jo(e) {
	let t = `${Wo}T${Ko(e)}`, n = [];
	return n.push(e.local ? "Z?" : "Z"), e.offset && n.push("([+-]\\d{2}:?\\d{2})"), t = `${t}(${n.join("|")})`, RegExp(`^${t}$`);
}
function Yo(e, t) {
	return !((t !== "v4" && t || !Ro.test(e)) && (t !== "v6" && t || !Bo.test(e)));
}
function Xo(e, t) {
	if (!No.test(e)) return !1;
	try {
		let [n] = e.split(".");
		if (!n) return !1;
		let r = n.replace(/-/g, "+").replace(/_/g, "/").padEnd(n.length + (4 - n.length % 4) % 4, "="), i = JSON.parse(atob(r));
		return !(typeof i != "object" || !i || "typ" in i && i?.typ !== "JWT" || !i.alg || t && i.alg !== t);
	} catch {
		return !1;
	}
}
function Zo(e, t) {
	return !((t !== "v4" && t || !zo.test(e)) && (t !== "v6" && t || !Vo.test(e)));
}
var Qo = class e extends j {
	_parse(e) {
		if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== T.string) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.string,
				received: t.parsedType
			}), O;
		}
		let t = new yo(), n;
		for (let r of this._def.checks) if (r.kind === "min") e.data.length < r.value && (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.too_small,
			minimum: r.value,
			type: "string",
			inclusive: !0,
			exact: !1,
			message: r.message
		}), t.dirty());
		else if (r.kind === "max") e.data.length > r.value && (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.too_big,
			maximum: r.value,
			type: "string",
			inclusive: !0,
			exact: !1,
			message: r.message
		}), t.dirty());
		else if (r.kind === "length") {
			let i = e.data.length > r.value, a = e.data.length < r.value;
			(i || a) && (n = this._getOrReturnCtx(e, n), i ? D(n, {
				code: E.too_big,
				maximum: r.value,
				type: "string",
				inclusive: !0,
				exact: !0,
				message: r.message
			}) : a && D(n, {
				code: E.too_small,
				minimum: r.value,
				type: "string",
				inclusive: !0,
				exact: !0,
				message: r.message
			}), t.dirty());
		} else if (r.kind === "email") Fo.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "email",
			code: E.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "emoji") Lo ||= new RegExp(Io, "u"), Lo.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "emoji",
			code: E.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "uuid") jo.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "uuid",
			code: E.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "nanoid") Mo.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "nanoid",
			code: E.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "cuid") Oo.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "cuid",
			code: E.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "cuid2") ko.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "cuid2",
			code: E.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "ulid") Ao.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "ulid",
			code: E.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "url") try {
			new URL(e.data);
		} catch {
			n = this._getOrReturnCtx(e, n), D(n, {
				validation: "url",
				code: E.invalid_string,
				message: r.message
			}), t.dirty();
		}
		else r.kind === "regex" ? (r.regex.lastIndex = 0, r.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "regex",
			code: E.invalid_string,
			message: r.message
		}), t.dirty())) : r.kind === "trim" ? e.data = e.data.trim() : r.kind === "includes" ? e.data.includes(r.value, r.position) || (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.invalid_string,
			validation: {
				includes: r.value,
				position: r.position
			},
			message: r.message
		}), t.dirty()) : r.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : r.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : r.kind === "startsWith" ? e.data.startsWith(r.value) || (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.invalid_string,
			validation: { startsWith: r.value },
			message: r.message
		}), t.dirty()) : r.kind === "endsWith" ? e.data.endsWith(r.value) || (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.invalid_string,
			validation: { endsWith: r.value },
			message: r.message
		}), t.dirty()) : r.kind === "datetime" ? Jo(r).test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.invalid_string,
			validation: "datetime",
			message: r.message
		}), t.dirty()) : r.kind === "date" ? Go.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.invalid_string,
			validation: "date",
			message: r.message
		}), t.dirty()) : r.kind === "time" ? qo(r).test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.invalid_string,
			validation: "time",
			message: r.message
		}), t.dirty()) : r.kind === "duration" ? Po.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "duration",
			code: E.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "ip" ? Yo(e.data, r.version) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "ip",
			code: E.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "jwt" ? Xo(e.data, r.alg) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "jwt",
			code: E.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "cidr" ? Zo(e.data, r.version) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "cidr",
			code: E.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "base64" ? Ho.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "base64",
			code: E.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "base64url" ? Uo.test(e.data) || (n = this._getOrReturnCtx(e, n), D(n, {
			validation: "base64url",
			code: E.invalid_string,
			message: r.message
		}), t.dirty()) : w.assertNever(r);
		return {
			status: t.value,
			value: e.data
		};
	}
	_regex(e, t, n) {
		return this.refinement((t) => e.test(t), {
			validation: t,
			code: E.invalid_string,
			...k.errToObj(n)
		});
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	email(e) {
		return this._addCheck({
			kind: "email",
			...k.errToObj(e)
		});
	}
	url(e) {
		return this._addCheck({
			kind: "url",
			...k.errToObj(e)
		});
	}
	emoji(e) {
		return this._addCheck({
			kind: "emoji",
			...k.errToObj(e)
		});
	}
	uuid(e) {
		return this._addCheck({
			kind: "uuid",
			...k.errToObj(e)
		});
	}
	nanoid(e) {
		return this._addCheck({
			kind: "nanoid",
			...k.errToObj(e)
		});
	}
	cuid(e) {
		return this._addCheck({
			kind: "cuid",
			...k.errToObj(e)
		});
	}
	cuid2(e) {
		return this._addCheck({
			kind: "cuid2",
			...k.errToObj(e)
		});
	}
	ulid(e) {
		return this._addCheck({
			kind: "ulid",
			...k.errToObj(e)
		});
	}
	base64(e) {
		return this._addCheck({
			kind: "base64",
			...k.errToObj(e)
		});
	}
	base64url(e) {
		return this._addCheck({
			kind: "base64url",
			...k.errToObj(e)
		});
	}
	jwt(e) {
		return this._addCheck({
			kind: "jwt",
			...k.errToObj(e)
		});
	}
	ip(e) {
		return this._addCheck({
			kind: "ip",
			...k.errToObj(e)
		});
	}
	cidr(e) {
		return this._addCheck({
			kind: "cidr",
			...k.errToObj(e)
		});
	}
	datetime(e) {
		return typeof e == "string" ? this._addCheck({
			kind: "datetime",
			precision: null,
			offset: !1,
			local: !1,
			message: e
		}) : this._addCheck({
			kind: "datetime",
			precision: e?.precision === void 0 ? null : e?.precision,
			offset: e?.offset ?? !1,
			local: e?.local ?? !1,
			...k.errToObj(e?.message)
		});
	}
	date(e) {
		return this._addCheck({
			kind: "date",
			message: e
		});
	}
	time(e) {
		return typeof e == "string" ? this._addCheck({
			kind: "time",
			precision: null,
			message: e
		}) : this._addCheck({
			kind: "time",
			precision: e?.precision === void 0 ? null : e?.precision,
			...k.errToObj(e?.message)
		});
	}
	duration(e) {
		return this._addCheck({
			kind: "duration",
			...k.errToObj(e)
		});
	}
	regex(e, t) {
		return this._addCheck({
			kind: "regex",
			regex: e,
			...k.errToObj(t)
		});
	}
	includes(e, t) {
		return this._addCheck({
			kind: "includes",
			value: e,
			position: t?.position,
			...k.errToObj(t?.message)
		});
	}
	startsWith(e, t) {
		return this._addCheck({
			kind: "startsWith",
			value: e,
			...k.errToObj(t)
		});
	}
	endsWith(e, t) {
		return this._addCheck({
			kind: "endsWith",
			value: e,
			...k.errToObj(t)
		});
	}
	min(e, t) {
		return this._addCheck({
			kind: "min",
			value: e,
			...k.errToObj(t)
		});
	}
	max(e, t) {
		return this._addCheck({
			kind: "max",
			value: e,
			...k.errToObj(t)
		});
	}
	length(e, t) {
		return this._addCheck({
			kind: "length",
			value: e,
			...k.errToObj(t)
		});
	}
	nonempty(e) {
		return this.min(1, k.errToObj(e));
	}
	trim() {
		return new e({
			...this._def,
			checks: [...this._def.checks, { kind: "trim" }]
		});
	}
	toLowerCase() {
		return new e({
			...this._def,
			checks: [...this._def.checks, { kind: "toLowerCase" }]
		});
	}
	toUpperCase() {
		return new e({
			...this._def,
			checks: [...this._def.checks, { kind: "toUpperCase" }]
		});
	}
	get isDatetime() {
		return !!this._def.checks.find((e) => e.kind === "datetime");
	}
	get isDate() {
		return !!this._def.checks.find((e) => e.kind === "date");
	}
	get isTime() {
		return !!this._def.checks.find((e) => e.kind === "time");
	}
	get isDuration() {
		return !!this._def.checks.find((e) => e.kind === "duration");
	}
	get isEmail() {
		return !!this._def.checks.find((e) => e.kind === "email");
	}
	get isURL() {
		return !!this._def.checks.find((e) => e.kind === "url");
	}
	get isEmoji() {
		return !!this._def.checks.find((e) => e.kind === "emoji");
	}
	get isUUID() {
		return !!this._def.checks.find((e) => e.kind === "uuid");
	}
	get isNANOID() {
		return !!this._def.checks.find((e) => e.kind === "nanoid");
	}
	get isCUID() {
		return !!this._def.checks.find((e) => e.kind === "cuid");
	}
	get isCUID2() {
		return !!this._def.checks.find((e) => e.kind === "cuid2");
	}
	get isULID() {
		return !!this._def.checks.find((e) => e.kind === "ulid");
	}
	get isIP() {
		return !!this._def.checks.find((e) => e.kind === "ip");
	}
	get isCIDR() {
		return !!this._def.checks.find((e) => e.kind === "cidr");
	}
	get isBase64() {
		return !!this._def.checks.find((e) => e.kind === "base64");
	}
	get isBase64url() {
		return !!this._def.checks.find((e) => e.kind === "base64url");
	}
	get minLength() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e;
	}
	get maxLength() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e;
	}
};
Qo.create = (e) => new Qo({
	checks: [],
	typeName: M.ZodString,
	coerce: e?.coerce ?? !1,
	...A(e)
});
function $o(e, t) {
	let n = (e.toString().split(".")[1] || "").length, r = (t.toString().split(".")[1] || "").length, i = n > r ? n : r;
	return Number.parseInt(e.toFixed(i).replace(".", "")) % Number.parseInt(t.toFixed(i).replace(".", "")) / 10 ** i;
}
var es = class e extends j {
	constructor() {
		super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
	}
	_parse(e) {
		if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== T.number) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.number,
				received: t.parsedType
			}), O;
		}
		let t, n = new yo();
		for (let r of this._def.checks) r.kind === "int" ? w.isInteger(e.data) || (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.invalid_type,
			expected: "integer",
			received: "float",
			message: r.message
		}), n.dirty()) : r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.too_small,
			minimum: r.value,
			type: "number",
			inclusive: r.inclusive,
			exact: !1,
			message: r.message
		}), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.too_big,
			maximum: r.value,
			type: "number",
			inclusive: r.inclusive,
			exact: !1,
			message: r.message
		}), n.dirty()) : r.kind === "multipleOf" ? $o(e.data, r.value) !== 0 && (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.not_multiple_of,
			multipleOf: r.value,
			message: r.message
		}), n.dirty()) : r.kind === "finite" ? Number.isFinite(e.data) || (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.not_finite,
			message: r.message
		}), n.dirty()) : w.assertNever(r);
		return {
			status: n.value,
			value: e.data
		};
	}
	gte(e, t) {
		return this.setLimit("min", e, !0, k.toString(t));
	}
	gt(e, t) {
		return this.setLimit("min", e, !1, k.toString(t));
	}
	lte(e, t) {
		return this.setLimit("max", e, !0, k.toString(t));
	}
	lt(e, t) {
		return this.setLimit("max", e, !1, k.toString(t));
	}
	setLimit(t, n, r, i) {
		return new e({
			...this._def,
			checks: [...this._def.checks, {
				kind: t,
				value: n,
				inclusive: r,
				message: k.toString(i)
			}]
		});
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	int(e) {
		return this._addCheck({
			kind: "int",
			message: k.toString(e)
		});
	}
	positive(e) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !1,
			message: k.toString(e)
		});
	}
	negative(e) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !1,
			message: k.toString(e)
		});
	}
	nonpositive(e) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !0,
			message: k.toString(e)
		});
	}
	nonnegative(e) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !0,
			message: k.toString(e)
		});
	}
	multipleOf(e, t) {
		return this._addCheck({
			kind: "multipleOf",
			value: e,
			message: k.toString(t)
		});
	}
	finite(e) {
		return this._addCheck({
			kind: "finite",
			message: k.toString(e)
		});
	}
	safe(e) {
		return this._addCheck({
			kind: "min",
			inclusive: !0,
			value: -(2 ** 53 - 1),
			message: k.toString(e)
		})._addCheck({
			kind: "max",
			inclusive: !0,
			value: 2 ** 53 - 1,
			message: k.toString(e)
		});
	}
	get minValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e;
	}
	get maxValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e;
	}
	get isInt() {
		return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && w.isInteger(e.value));
	}
	get isFinite() {
		let e = null, t = null;
		for (let n of this._def.checks) if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf") return !0;
		else n.kind === "min" ? (t === null || n.value > t) && (t = n.value) : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
		return Number.isFinite(t) && Number.isFinite(e);
	}
};
es.create = (e) => new es({
	checks: [],
	typeName: M.ZodNumber,
	coerce: e?.coerce || !1,
	...A(e)
});
var ts = class e extends j {
	constructor() {
		super(...arguments), this.min = this.gte, this.max = this.lte;
	}
	_parse(e) {
		if (this._def.coerce) try {
			e.data = BigInt(e.data);
		} catch {
			return this._getInvalidInput(e);
		}
		if (this._getType(e) !== T.bigint) return this._getInvalidInput(e);
		let t, n = new yo();
		for (let r of this._def.checks) r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.too_small,
			type: "bigint",
			minimum: r.value,
			inclusive: r.inclusive,
			message: r.message
		}), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.too_big,
			type: "bigint",
			maximum: r.value,
			inclusive: r.inclusive,
			message: r.message
		}), n.dirty()) : r.kind === "multipleOf" ? e.data % r.value !== BigInt(0) && (t = this._getOrReturnCtx(e, t), D(t, {
			code: E.not_multiple_of,
			multipleOf: r.value,
			message: r.message
		}), n.dirty()) : w.assertNever(r);
		return {
			status: n.value,
			value: e.data
		};
	}
	_getInvalidInput(e) {
		let t = this._getOrReturnCtx(e);
		return D(t, {
			code: E.invalid_type,
			expected: T.bigint,
			received: t.parsedType
		}), O;
	}
	gte(e, t) {
		return this.setLimit("min", e, !0, k.toString(t));
	}
	gt(e, t) {
		return this.setLimit("min", e, !1, k.toString(t));
	}
	lte(e, t) {
		return this.setLimit("max", e, !0, k.toString(t));
	}
	lt(e, t) {
		return this.setLimit("max", e, !1, k.toString(t));
	}
	setLimit(t, n, r, i) {
		return new e({
			...this._def,
			checks: [...this._def.checks, {
				kind: t,
				value: n,
				inclusive: r,
				message: k.toString(i)
			}]
		});
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	positive(e) {
		return this._addCheck({
			kind: "min",
			value: BigInt(0),
			inclusive: !1,
			message: k.toString(e)
		});
	}
	negative(e) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !1,
			message: k.toString(e)
		});
	}
	nonpositive(e) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !0,
			message: k.toString(e)
		});
	}
	nonnegative(e) {
		return this._addCheck({
			kind: "min",
			value: BigInt(0),
			inclusive: !0,
			message: k.toString(e)
		});
	}
	multipleOf(e, t) {
		return this._addCheck({
			kind: "multipleOf",
			value: e,
			message: k.toString(t)
		});
	}
	get minValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e;
	}
	get maxValue() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e;
	}
};
ts.create = (e) => new ts({
	checks: [],
	typeName: M.ZodBigInt,
	coerce: e?.coerce ?? !1,
	...A(e)
});
var ns = class extends j {
	_parse(e) {
		if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== T.boolean) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.boolean,
				received: t.parsedType
			}), O;
		}
		return xo(e.data);
	}
};
ns.create = (e) => new ns({
	typeName: M.ZodBoolean,
	coerce: e?.coerce || !1,
	...A(e)
});
var rs = class e extends j {
	_parse(e) {
		if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== T.date) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.date,
				received: t.parsedType
			}), O;
		}
		if (Number.isNaN(e.data.getTime())) return D(this._getOrReturnCtx(e), { code: E.invalid_date }), O;
		let t = new yo(), n;
		for (let r of this._def.checks) r.kind === "min" ? e.data.getTime() < r.value && (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.too_small,
			message: r.message,
			inclusive: !0,
			exact: !1,
			minimum: r.value,
			type: "date"
		}), t.dirty()) : r.kind === "max" ? e.data.getTime() > r.value && (n = this._getOrReturnCtx(e, n), D(n, {
			code: E.too_big,
			message: r.message,
			inclusive: !0,
			exact: !1,
			maximum: r.value,
			type: "date"
		}), t.dirty()) : w.assertNever(r);
		return {
			status: t.value,
			value: new Date(e.data.getTime())
		};
	}
	_addCheck(t) {
		return new e({
			...this._def,
			checks: [...this._def.checks, t]
		});
	}
	min(e, t) {
		return this._addCheck({
			kind: "min",
			value: e.getTime(),
			message: k.toString(t)
		});
	}
	max(e, t) {
		return this._addCheck({
			kind: "max",
			value: e.getTime(),
			message: k.toString(t)
		});
	}
	get minDate() {
		let e = null;
		for (let t of this._def.checks) t.kind === "min" && (e === null || t.value > e) && (e = t.value);
		return e == null ? null : new Date(e);
	}
	get maxDate() {
		let e = null;
		for (let t of this._def.checks) t.kind === "max" && (e === null || t.value < e) && (e = t.value);
		return e == null ? null : new Date(e);
	}
};
rs.create = (e) => new rs({
	checks: [],
	coerce: e?.coerce || !1,
	typeName: M.ZodDate,
	...A(e)
});
var is = class extends j {
	_parse(e) {
		if (this._getType(e) !== T.symbol) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.symbol,
				received: t.parsedType
			}), O;
		}
		return xo(e.data);
	}
};
is.create = (e) => new is({
	typeName: M.ZodSymbol,
	...A(e)
});
var as = class extends j {
	_parse(e) {
		if (this._getType(e) !== T.undefined) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.undefined,
				received: t.parsedType
			}), O;
		}
		return xo(e.data);
	}
};
as.create = (e) => new as({
	typeName: M.ZodUndefined,
	...A(e)
});
var os = class extends j {
	_parse(e) {
		if (this._getType(e) !== T.null) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.null,
				received: t.parsedType
			}), O;
		}
		return xo(e.data);
	}
};
os.create = (e) => new os({
	typeName: M.ZodNull,
	...A(e)
});
var ss = class extends j {
	constructor() {
		super(...arguments), this._any = !0;
	}
	_parse(e) {
		return xo(e.data);
	}
};
ss.create = (e) => new ss({
	typeName: M.ZodAny,
	...A(e)
});
var cs = class extends j {
	constructor() {
		super(...arguments), this._unknown = !0;
	}
	_parse(e) {
		return xo(e.data);
	}
};
cs.create = (e) => new cs({
	typeName: M.ZodUnknown,
	...A(e)
});
var ls = class extends j {
	_parse(e) {
		let t = this._getOrReturnCtx(e);
		return D(t, {
			code: E.invalid_type,
			expected: T.never,
			received: t.parsedType
		}), O;
	}
};
ls.create = (e) => new ls({
	typeName: M.ZodNever,
	...A(e)
});
var us = class extends j {
	_parse(e) {
		if (this._getType(e) !== T.undefined) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.void,
				received: t.parsedType
			}), O;
		}
		return xo(e.data);
	}
};
us.create = (e) => new us({
	typeName: M.ZodVoid,
	...A(e)
});
var ds = class e extends j {
	_parse(e) {
		let { ctx: t, status: n } = this._processInputParams(e), r = this._def;
		if (t.parsedType !== T.array) return D(t, {
			code: E.invalid_type,
			expected: T.array,
			received: t.parsedType
		}), O;
		if (r.exactLength !== null) {
			let e = t.data.length > r.exactLength.value, i = t.data.length < r.exactLength.value;
			(e || i) && (D(t, {
				code: e ? E.too_big : E.too_small,
				minimum: i ? r.exactLength.value : void 0,
				maximum: e ? r.exactLength.value : void 0,
				type: "array",
				inclusive: !0,
				exact: !0,
				message: r.exactLength.message
			}), n.dirty());
		}
		if (r.minLength !== null && t.data.length < r.minLength.value && (D(t, {
			code: E.too_small,
			minimum: r.minLength.value,
			type: "array",
			inclusive: !0,
			exact: !1,
			message: r.minLength.message
		}), n.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (D(t, {
			code: E.too_big,
			maximum: r.maxLength.value,
			type: "array",
			inclusive: !0,
			exact: !1,
			message: r.maxLength.message
		}), n.dirty()), t.common.async) return Promise.all([...t.data].map((e, n) => r.type._parseAsync(new Eo(t, e, t.path, n)))).then((e) => yo.mergeArray(n, e));
		let i = [...t.data].map((e, n) => r.type._parseSync(new Eo(t, e, t.path, n)));
		return yo.mergeArray(n, i);
	}
	get element() {
		return this._def.type;
	}
	min(t, n) {
		return new e({
			...this._def,
			minLength: {
				value: t,
				message: k.toString(n)
			}
		});
	}
	max(t, n) {
		return new e({
			...this._def,
			maxLength: {
				value: t,
				message: k.toString(n)
			}
		});
	}
	length(t, n) {
		return new e({
			...this._def,
			exactLength: {
				value: t,
				message: k.toString(n)
			}
		});
	}
	nonempty(e) {
		return this.min(1, e);
	}
};
ds.create = (e, t) => new ds({
	type: e,
	minLength: null,
	maxLength: null,
	exactLength: null,
	typeName: M.ZodArray,
	...A(t)
});
function fs(e) {
	if (e instanceof ps) {
		let t = {};
		for (let n in e.shape) {
			let r = e.shape[n];
			t[n] = js.create(fs(r));
		}
		return new ps({
			...e._def,
			shape: () => t
		});
	}
	return e instanceof ds ? new ds({
		...e._def,
		type: fs(e.element)
	}) : e instanceof js ? js.create(fs(e.unwrap())) : e instanceof Ms ? Ms.create(fs(e.unwrap())) : e instanceof ys ? ys.create(e.items.map((e) => fs(e))) : e;
}
var ps = class e extends j {
	constructor() {
		super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
	}
	_getCached() {
		if (this._cached !== null) return this._cached;
		let e = this._def.shape(), t = w.objectKeys(e);
		return this._cached = {
			shape: e,
			keys: t
		}, this._cached;
	}
	_parse(e) {
		if (this._getType(e) !== T.object) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.object,
				received: t.parsedType
			}), O;
		}
		let { status: t, ctx: n } = this._processInputParams(e), { shape: r, keys: i } = this._getCached(), a = [];
		if (!(this._def.catchall instanceof ls && this._def.unknownKeys === "strip")) for (let e in n.data) i.includes(e) || a.push(e);
		let o = [];
		for (let e of i) {
			let t = r[e], i = n.data[e];
			o.push({
				key: {
					status: "valid",
					value: e
				},
				value: t._parse(new Eo(n, i, n.path, e)),
				alwaysSet: e in n.data
			});
		}
		if (this._def.catchall instanceof ls) {
			let e = this._def.unknownKeys;
			if (e === "passthrough") for (let e of a) o.push({
				key: {
					status: "valid",
					value: e
				},
				value: {
					status: "valid",
					value: n.data[e]
				}
			});
			else if (e === "strict") a.length > 0 && (D(n, {
				code: E.unrecognized_keys,
				keys: a
			}), t.dirty());
			else if (e !== "strip") throw Error("Internal ZodObject error: invalid unknownKeys value.");
		} else {
			let e = this._def.catchall;
			for (let t of a) {
				let r = n.data[t];
				o.push({
					key: {
						status: "valid",
						value: t
					},
					value: e._parse(new Eo(n, r, n.path, t)),
					alwaysSet: t in n.data
				});
			}
		}
		return n.common.async ? Promise.resolve().then(async () => {
			let e = [];
			for (let t of o) {
				let n = await t.key, r = await t.value;
				e.push({
					key: n,
					value: r,
					alwaysSet: t.alwaysSet
				});
			}
			return e;
		}).then((e) => yo.mergeObjectSync(t, e)) : yo.mergeObjectSync(t, o);
	}
	get shape() {
		return this._def.shape();
	}
	strict(t) {
		return k.errToObj, new e({
			...this._def,
			unknownKeys: "strict",
			...t === void 0 ? {} : { errorMap: (e, n) => {
				let r = this._def.errorMap?.(e, n).message ?? n.defaultError;
				return e.code === "unrecognized_keys" ? { message: k.errToObj(t).message ?? r } : { message: r };
			} }
		});
	}
	strip() {
		return new e({
			...this._def,
			unknownKeys: "strip"
		});
	}
	passthrough() {
		return new e({
			...this._def,
			unknownKeys: "passthrough"
		});
	}
	extend(t) {
		return new e({
			...this._def,
			shape: () => ({
				...this._def.shape(),
				...t
			})
		});
	}
	merge(t) {
		return new e({
			unknownKeys: t._def.unknownKeys,
			catchall: t._def.catchall,
			shape: () => ({
				...this._def.shape(),
				...t._def.shape()
			}),
			typeName: M.ZodObject
		});
	}
	setKey(e, t) {
		return this.augment({ [e]: t });
	}
	catchall(t) {
		return new e({
			...this._def,
			catchall: t
		});
	}
	pick(t) {
		let n = {};
		for (let e of w.objectKeys(t)) t[e] && this.shape[e] && (n[e] = this.shape[e]);
		return new e({
			...this._def,
			shape: () => n
		});
	}
	omit(t) {
		let n = {};
		for (let e of w.objectKeys(this.shape)) t[e] || (n[e] = this.shape[e]);
		return new e({
			...this._def,
			shape: () => n
		});
	}
	deepPartial() {
		return fs(this);
	}
	partial(t) {
		let n = {};
		for (let e of w.objectKeys(this.shape)) {
			let r = this.shape[e];
			n[e] = t && !t[e] ? r : r.optional();
		}
		return new e({
			...this._def,
			shape: () => n
		});
	}
	required(t) {
		let n = {};
		for (let e of w.objectKeys(this.shape)) if (t && !t[e]) n[e] = this.shape[e];
		else {
			let t = this.shape[e];
			for (; t instanceof js;) t = t._def.innerType;
			n[e] = t;
		}
		return new e({
			...this._def,
			shape: () => n
		});
	}
	keyof() {
		return Es(w.objectKeys(this.shape));
	}
};
ps.create = (e, t) => new ps({
	shape: () => e,
	unknownKeys: "strip",
	catchall: ls.create(),
	typeName: M.ZodObject,
	...A(t)
}), ps.strictCreate = (e, t) => new ps({
	shape: () => e,
	unknownKeys: "strict",
	catchall: ls.create(),
	typeName: M.ZodObject,
	...A(t)
}), ps.lazycreate = (e, t) => new ps({
	shape: e,
	unknownKeys: "strip",
	catchall: ls.create(),
	typeName: M.ZodObject,
	...A(t)
});
var ms = class extends j {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = this._def.options;
		function r(e) {
			for (let t of e) if (t.result.status === "valid") return t.result;
			for (let n of e) if (n.result.status === "dirty") return t.common.issues.push(...n.ctx.common.issues), n.result;
			let n = e.map((e) => new mo(e.ctx.common.issues));
			return D(t, {
				code: E.invalid_union,
				unionErrors: n
			}), O;
		}
		if (t.common.async) return Promise.all(n.map(async (e) => {
			let n = {
				...t,
				common: {
					...t.common,
					issues: []
				},
				parent: null
			};
			return {
				result: await e._parseAsync({
					data: t.data,
					path: t.path,
					parent: n
				}),
				ctx: n
			};
		})).then(r);
		{
			let e, r = [];
			for (let i of n) {
				let n = {
					...t,
					common: {
						...t.common,
						issues: []
					},
					parent: null
				}, a = i._parseSync({
					data: t.data,
					path: t.path,
					parent: n
				});
				if (a.status === "valid") return a;
				a.status === "dirty" && !e && (e = {
					result: a,
					ctx: n
				}), n.common.issues.length && r.push(n.common.issues);
			}
			if (e) return t.common.issues.push(...e.ctx.common.issues), e.result;
			let i = r.map((e) => new mo(e));
			return D(t, {
				code: E.invalid_union,
				unionErrors: i
			}), O;
		}
	}
	get options() {
		return this._def.options;
	}
};
ms.create = (e, t) => new ms({
	options: e,
	typeName: M.ZodUnion,
	...A(t)
});
var hs = (e) => e instanceof ws ? hs(e.schema) : e instanceof As ? hs(e.innerType()) : e instanceof Ts ? [e.value] : e instanceof Ds ? e.options : e instanceof Os ? w.objectValues(e.enum) : e instanceof Ns ? hs(e._def.innerType) : e instanceof as ? [void 0] : e instanceof os ? [null] : e instanceof js ? [void 0, ...hs(e.unwrap())] : e instanceof Ms ? [null, ...hs(e.unwrap())] : e instanceof Is || e instanceof Rs ? hs(e.unwrap()) : e instanceof Ps ? hs(e._def.innerType) : [], gs = class e extends j {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		if (t.parsedType !== T.object) return D(t, {
			code: E.invalid_type,
			expected: T.object,
			received: t.parsedType
		}), O;
		let n = this.discriminator, r = t.data[n], i = this.optionsMap.get(r);
		return i ? t.common.async ? i._parseAsync({
			data: t.data,
			path: t.path,
			parent: t
		}) : i._parseSync({
			data: t.data,
			path: t.path,
			parent: t
		}) : (D(t, {
			code: E.invalid_union_discriminator,
			options: Array.from(this.optionsMap.keys()),
			path: [n]
		}), O);
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
	static create(t, n, r) {
		let i = /* @__PURE__ */ new Map();
		for (let e of n) {
			let n = hs(e.shape[t]);
			if (!n.length) throw Error(`A discriminator value for key \`${t}\` could not be extracted from all schema options`);
			for (let r of n) {
				if (i.has(r)) throw Error(`Discriminator property ${String(t)} has duplicate value ${String(r)}`);
				i.set(r, e);
			}
		}
		return new e({
			typeName: M.ZodDiscriminatedUnion,
			discriminator: t,
			options: n,
			optionsMap: i,
			...A(r)
		});
	}
};
function _s(e, t) {
	let n = po(e), r = po(t);
	if (e === t) return {
		valid: !0,
		data: e
	};
	if (n === T.object && r === T.object) {
		let n = w.objectKeys(t), r = w.objectKeys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = _s(e[n], t[n]);
			if (!r.valid) return { valid: !1 };
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (n === T.array && r === T.array) {
		if (e.length !== t.length) return { valid: !1 };
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = _s(i, a);
			if (!o.valid) return { valid: !1 };
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return n === T.date && r === T.date && +e == +t ? {
		valid: !0,
		data: e
	} : { valid: !1 };
}
var vs = class extends j {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e), r = (e, r) => {
			if (So(e) || So(r)) return O;
			let i = _s(e.value, r.value);
			return i.valid ? ((Co(e) || Co(r)) && t.dirty(), {
				status: t.value,
				value: i.data
			}) : (D(n, { code: E.invalid_intersection_types }), O);
		};
		return n.common.async ? Promise.all([this._def.left._parseAsync({
			data: n.data,
			path: n.path,
			parent: n
		}), this._def.right._parseAsync({
			data: n.data,
			path: n.path,
			parent: n
		})]).then(([e, t]) => r(e, t)) : r(this._def.left._parseSync({
			data: n.data,
			path: n.path,
			parent: n
		}), this._def.right._parseSync({
			data: n.data,
			path: n.path,
			parent: n
		}));
	}
};
vs.create = (e, t, n) => new vs({
	left: e,
	right: t,
	typeName: M.ZodIntersection,
	...A(n)
});
var ys = class e extends j {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== T.array) return D(n, {
			code: E.invalid_type,
			expected: T.array,
			received: n.parsedType
		}), O;
		if (n.data.length < this._def.items.length) return D(n, {
			code: E.too_small,
			minimum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), O;
		!this._def.rest && n.data.length > this._def.items.length && (D(n, {
			code: E.too_big,
			maximum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), t.dirty());
		let r = [...n.data].map((e, t) => {
			let r = this._def.items[t] || this._def.rest;
			return r ? r._parse(new Eo(n, e, n.path, t)) : null;
		}).filter((e) => !!e);
		return n.common.async ? Promise.all(r).then((e) => yo.mergeArray(t, e)) : yo.mergeArray(t, r);
	}
	get items() {
		return this._def.items;
	}
	rest(t) {
		return new e({
			...this._def,
			rest: t
		});
	}
};
ys.create = (e, t) => {
	if (!Array.isArray(e)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
	return new ys({
		items: e,
		typeName: M.ZodTuple,
		rest: null,
		...A(t)
	});
};
var bs = class e extends j {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== T.object) return D(n, {
			code: E.invalid_type,
			expected: T.object,
			received: n.parsedType
		}), O;
		let r = [], i = this._def.keyType, a = this._def.valueType;
		for (let e in n.data) r.push({
			key: i._parse(new Eo(n, e, n.path, e)),
			value: a._parse(new Eo(n, n.data[e], n.path, e)),
			alwaysSet: e in n.data
		});
		return n.common.async ? yo.mergeObjectAsync(t, r) : yo.mergeObjectSync(t, r);
	}
	get element() {
		return this._def.valueType;
	}
	static create(t, n, r) {
		return n instanceof j ? new e({
			keyType: t,
			valueType: n,
			typeName: M.ZodRecord,
			...A(r)
		}) : new e({
			keyType: Qo.create(),
			valueType: t,
			typeName: M.ZodRecord,
			...A(n)
		});
	}
}, xs = class extends j {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== T.map) return D(n, {
			code: E.invalid_type,
			expected: T.map,
			received: n.parsedType
		}), O;
		let r = this._def.keyType, i = this._def.valueType, a = [...n.data.entries()].map(([e, t], a) => ({
			key: r._parse(new Eo(n, e, n.path, [a, "key"])),
			value: i._parse(new Eo(n, t, n.path, [a, "value"]))
		}));
		if (n.common.async) {
			let e = /* @__PURE__ */ new Map();
			return Promise.resolve().then(async () => {
				for (let n of a) {
					let r = await n.key, i = await n.value;
					if (r.status === "aborted" || i.status === "aborted") return O;
					(r.status === "dirty" || i.status === "dirty") && t.dirty(), e.set(r.value, i.value);
				}
				return {
					status: t.value,
					value: e
				};
			});
		}
		{
			let e = /* @__PURE__ */ new Map();
			for (let n of a) {
				let r = n.key, i = n.value;
				if (r.status === "aborted" || i.status === "aborted") return O;
				(r.status === "dirty" || i.status === "dirty") && t.dirty(), e.set(r.value, i.value);
			}
			return {
				status: t.value,
				value: e
			};
		}
	}
};
xs.create = (e, t, n) => new xs({
	valueType: t,
	keyType: e,
	typeName: M.ZodMap,
	...A(n)
});
var Ss = class e extends j {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== T.set) return D(n, {
			code: E.invalid_type,
			expected: T.set,
			received: n.parsedType
		}), O;
		let r = this._def;
		r.minSize !== null && n.data.size < r.minSize.value && (D(n, {
			code: E.too_small,
			minimum: r.minSize.value,
			type: "set",
			inclusive: !0,
			exact: !1,
			message: r.minSize.message
		}), t.dirty()), r.maxSize !== null && n.data.size > r.maxSize.value && (D(n, {
			code: E.too_big,
			maximum: r.maxSize.value,
			type: "set",
			inclusive: !0,
			exact: !1,
			message: r.maxSize.message
		}), t.dirty());
		let i = this._def.valueType;
		function a(e) {
			let n = /* @__PURE__ */ new Set();
			for (let r of e) {
				if (r.status === "aborted") return O;
				r.status === "dirty" && t.dirty(), n.add(r.value);
			}
			return {
				status: t.value,
				value: n
			};
		}
		let o = [...n.data.values()].map((e, t) => i._parse(new Eo(n, e, n.path, t)));
		return n.common.async ? Promise.all(o).then((e) => a(e)) : a(o);
	}
	min(t, n) {
		return new e({
			...this._def,
			minSize: {
				value: t,
				message: k.toString(n)
			}
		});
	}
	max(t, n) {
		return new e({
			...this._def,
			maxSize: {
				value: t,
				message: k.toString(n)
			}
		});
	}
	size(e, t) {
		return this.min(e, t).max(e, t);
	}
	nonempty(e) {
		return this.min(1, e);
	}
};
Ss.create = (e, t) => new Ss({
	valueType: e,
	minSize: null,
	maxSize: null,
	typeName: M.ZodSet,
	...A(t)
});
var Cs = class e extends j {
	constructor() {
		super(...arguments), this.validate = this.implement;
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		if (t.parsedType !== T.function) return D(t, {
			code: E.invalid_type,
			expected: T.function,
			received: t.parsedType
		}), O;
		function n(e, n) {
			return vo({
				data: e,
				path: t.path,
				errorMaps: [
					t.common.contextualErrorMap,
					t.schemaErrorMap,
					_o(),
					ho
				].filter((e) => !!e),
				issueData: {
					code: E.invalid_arguments,
					argumentsError: n
				}
			});
		}
		function r(e, n) {
			return vo({
				data: e,
				path: t.path,
				errorMaps: [
					t.common.contextualErrorMap,
					t.schemaErrorMap,
					_o(),
					ho
				].filter((e) => !!e),
				issueData: {
					code: E.invalid_return_type,
					returnTypeError: n
				}
			});
		}
		let i = { errorMap: t.common.contextualErrorMap }, a = t.data;
		if (this._def.returns instanceof ks) {
			let e = this;
			return xo(async function(...t) {
				let o = new mo([]), s = await e._def.args.parseAsync(t, i).catch((e) => {
					throw o.addIssue(n(t, e)), o;
				}), c = await Reflect.apply(a, this, s);
				return await e._def.returns._def.type.parseAsync(c, i).catch((e) => {
					throw o.addIssue(r(c, e)), o;
				});
			});
		}
		{
			let e = this;
			return xo(function(...t) {
				let o = e._def.args.safeParse(t, i);
				if (!o.success) throw new mo([n(t, o.error)]);
				let s = Reflect.apply(a, this, o.data), c = e._def.returns.safeParse(s, i);
				if (!c.success) throw new mo([r(s, c.error)]);
				return c.data;
			});
		}
	}
	parameters() {
		return this._def.args;
	}
	returnType() {
		return this._def.returns;
	}
	args(...t) {
		return new e({
			...this._def,
			args: ys.create(t).rest(cs.create())
		});
	}
	returns(t) {
		return new e({
			...this._def,
			returns: t
		});
	}
	implement(e) {
		return this.parse(e);
	}
	strictImplement(e) {
		return this.parse(e);
	}
	static create(t, n, r) {
		return new e({
			args: t || ys.create([]).rest(cs.create()),
			returns: n || cs.create(),
			typeName: M.ZodFunction,
			...A(r)
		});
	}
}, ws = class extends j {
	get schema() {
		return this._def.getter();
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		return this._def.getter()._parse({
			data: t.data,
			path: t.path,
			parent: t
		});
	}
};
ws.create = (e, t) => new ws({
	getter: e,
	typeName: M.ZodLazy,
	...A(t)
});
var Ts = class extends j {
	_parse(e) {
		if (e.data !== this._def.value) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				received: t.data,
				code: E.invalid_literal,
				expected: this._def.value
			}), O;
		}
		return {
			status: "valid",
			value: e.data
		};
	}
	get value() {
		return this._def.value;
	}
};
Ts.create = (e, t) => new Ts({
	value: e,
	typeName: M.ZodLiteral,
	...A(t)
});
function Es(e, t) {
	return new Ds({
		values: e,
		typeName: M.ZodEnum,
		...A(t)
	});
}
var Ds = class e extends j {
	_parse(e) {
		if (typeof e.data != "string") {
			let t = this._getOrReturnCtx(e), n = this._def.values;
			return D(t, {
				expected: w.joinValues(n),
				received: t.parsedType,
				code: E.invalid_type
			}), O;
		}
		if (this._cache ||= new Set(this._def.values), !this._cache.has(e.data)) {
			let t = this._getOrReturnCtx(e), n = this._def.values;
			return D(t, {
				received: t.data,
				code: E.invalid_enum_value,
				options: n
			}), O;
		}
		return xo(e.data);
	}
	get options() {
		return this._def.values;
	}
	get enum() {
		let e = {};
		for (let t of this._def.values) e[t] = t;
		return e;
	}
	get Values() {
		let e = {};
		for (let t of this._def.values) e[t] = t;
		return e;
	}
	get Enum() {
		let e = {};
		for (let t of this._def.values) e[t] = t;
		return e;
	}
	extract(t, n = this._def) {
		return e.create(t, {
			...this._def,
			...n
		});
	}
	exclude(t, n = this._def) {
		return e.create(this.options.filter((e) => !t.includes(e)), {
			...this._def,
			...n
		});
	}
};
Ds.create = Es;
var Os = class extends j {
	_parse(e) {
		let t = w.getValidEnumValues(this._def.values), n = this._getOrReturnCtx(e);
		if (n.parsedType !== T.string && n.parsedType !== T.number) {
			let e = w.objectValues(t);
			return D(n, {
				expected: w.joinValues(e),
				received: n.parsedType,
				code: E.invalid_type
			}), O;
		}
		if (this._cache ||= new Set(w.getValidEnumValues(this._def.values)), !this._cache.has(e.data)) {
			let e = w.objectValues(t);
			return D(n, {
				received: n.data,
				code: E.invalid_enum_value,
				options: e
			}), O;
		}
		return xo(e.data);
	}
	get enum() {
		return this._def.values;
	}
};
Os.create = (e, t) => new Os({
	values: e,
	typeName: M.ZodNativeEnum,
	...A(t)
});
var ks = class extends j {
	unwrap() {
		return this._def.type;
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		return t.parsedType !== T.promise && t.common.async === !1 ? (D(t, {
			code: E.invalid_type,
			expected: T.promise,
			received: t.parsedType
		}), O) : xo((t.parsedType === T.promise ? t.data : Promise.resolve(t.data)).then((e) => this._def.type.parseAsync(e, {
			path: t.path,
			errorMap: t.common.contextualErrorMap
		})));
	}
};
ks.create = (e, t) => new ks({
	type: e,
	typeName: M.ZodPromise,
	...A(t)
});
var As = class extends j {
	innerType() {
		return this._def.schema;
	}
	sourceType() {
		return this._def.schema._def.typeName === M.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e), r = this._def.effect || null, i = {
			addIssue: (e) => {
				D(n, e), e.fatal ? t.abort() : t.dirty();
			},
			get path() {
				return n.path;
			}
		};
		if (i.addIssue = i.addIssue.bind(i), r.type === "preprocess") {
			let e = r.transform(n.data, i);
			if (n.common.async) return Promise.resolve(e).then(async (e) => {
				if (t.value === "aborted") return O;
				let r = await this._def.schema._parseAsync({
					data: e,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? O : r.status === "dirty" || t.value === "dirty" ? bo(r.value) : r;
			});
			{
				if (t.value === "aborted") return O;
				let r = this._def.schema._parseSync({
					data: e,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? O : r.status === "dirty" || t.value === "dirty" ? bo(r.value) : r;
			}
		}
		if (r.type === "refinement") {
			let e = (e) => {
				let t = r.refinement(e, i);
				if (n.common.async) return Promise.resolve(t);
				if (t instanceof Promise) throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
				return e;
			};
			if (n.common.async === !1) {
				let r = this._def.schema._parseSync({
					data: n.data,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? O : (r.status === "dirty" && t.dirty(), e(r.value), {
					status: t.value,
					value: r.value
				});
			}
			return this._def.schema._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			}).then((n) => n.status === "aborted" ? O : (n.status === "dirty" && t.dirty(), e(n.value).then(() => ({
				status: t.value,
				value: n.value
			}))));
		}
		if (r.type === "transform") {
			if (n.common.async === !1) {
				let e = this._def.schema._parseSync({
					data: n.data,
					path: n.path,
					parent: n
				});
				if (!wo(e)) return O;
				let a = r.transform(e.value, i);
				if (a instanceof Promise) throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
				return {
					status: t.value,
					value: a
				};
			}
			return this._def.schema._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			}).then((e) => wo(e) ? Promise.resolve(r.transform(e.value, i)).then((e) => ({
				status: t.value,
				value: e
			})) : O);
		}
		w.assertNever(r);
	}
};
As.create = (e, t, n) => new As({
	schema: e,
	typeName: M.ZodEffects,
	effect: t,
	...A(n)
}), As.createWithPreprocess = (e, t, n) => new As({
	schema: t,
	effect: {
		type: "preprocess",
		transform: e
	},
	typeName: M.ZodEffects,
	...A(n)
});
var js = class extends j {
	_parse(e) {
		return this._getType(e) === T.undefined ? xo(void 0) : this._def.innerType._parse(e);
	}
	unwrap() {
		return this._def.innerType;
	}
};
js.create = (e, t) => new js({
	innerType: e,
	typeName: M.ZodOptional,
	...A(t)
});
var Ms = class extends j {
	_parse(e) {
		return this._getType(e) === T.null ? xo(null) : this._def.innerType._parse(e);
	}
	unwrap() {
		return this._def.innerType;
	}
};
Ms.create = (e, t) => new Ms({
	innerType: e,
	typeName: M.ZodNullable,
	...A(t)
});
var Ns = class extends j {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = t.data;
		return t.parsedType === T.undefined && (n = this._def.defaultValue()), this._def.innerType._parse({
			data: n,
			path: t.path,
			parent: t
		});
	}
	removeDefault() {
		return this._def.innerType;
	}
};
Ns.create = (e, t) => new Ns({
	innerType: e,
	typeName: M.ZodDefault,
	defaultValue: typeof t.default == "function" ? t.default : () => t.default,
	...A(t)
});
var Ps = class extends j {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = {
			...t,
			common: {
				...t.common,
				issues: []
			}
		}, r = this._def.innerType._parse({
			data: n.data,
			path: n.path,
			parent: { ...n }
		});
		return To(r) ? r.then((e) => ({
			status: "valid",
			value: e.status === "valid" ? e.value : this._def.catchValue({
				get error() {
					return new mo(n.common.issues);
				},
				input: n.data
			})
		})) : {
			status: "valid",
			value: r.status === "valid" ? r.value : this._def.catchValue({
				get error() {
					return new mo(n.common.issues);
				},
				input: n.data
			})
		};
	}
	removeCatch() {
		return this._def.innerType;
	}
};
Ps.create = (e, t) => new Ps({
	innerType: e,
	typeName: M.ZodCatch,
	catchValue: typeof t.catch == "function" ? t.catch : () => t.catch,
	...A(t)
});
var Fs = class extends j {
	_parse(e) {
		if (this._getType(e) !== T.nan) {
			let t = this._getOrReturnCtx(e);
			return D(t, {
				code: E.invalid_type,
				expected: T.nan,
				received: t.parsedType
			}), O;
		}
		return {
			status: "valid",
			value: e.data
		};
	}
};
Fs.create = (e) => new Fs({
	typeName: M.ZodNaN,
	...A(e)
});
var Is = class extends j {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = t.data;
		return this._def.type._parse({
			data: n,
			path: t.path,
			parent: t
		});
	}
	unwrap() {
		return this._def.type;
	}
}, Ls = class e extends j {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.common.async) return (async () => {
			let e = await this._def.in._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			});
			return e.status === "aborted" ? O : e.status === "dirty" ? (t.dirty(), bo(e.value)) : this._def.out._parseAsync({
				data: e.value,
				path: n.path,
				parent: n
			});
		})();
		{
			let e = this._def.in._parseSync({
				data: n.data,
				path: n.path,
				parent: n
			});
			return e.status === "aborted" ? O : e.status === "dirty" ? (t.dirty(), {
				status: "dirty",
				value: e.value
			}) : this._def.out._parseSync({
				data: e.value,
				path: n.path,
				parent: n
			});
		}
	}
	static create(t, n) {
		return new e({
			in: t,
			out: n,
			typeName: M.ZodPipeline
		});
	}
}, Rs = class extends j {
	_parse(e) {
		let t = this._def.innerType._parse(e), n = (e) => (wo(e) && (e.value = Object.freeze(e.value)), e);
		return To(t) ? t.then((e) => n(e)) : n(t);
	}
	unwrap() {
		return this._def.innerType;
	}
};
Rs.create = (e, t) => new Rs({
	innerType: e,
	typeName: M.ZodReadonly,
	...A(t)
});
function zs(e, t) {
	let n = typeof e == "function" ? e(t) : typeof e == "string" ? { message: e } : e;
	return typeof n == "string" ? { message: n } : n;
}
function Bs(e, t = {}, n) {
	return e ? ss.create().superRefine((r, i) => {
		let a = e(r);
		if (a instanceof Promise) return a.then((e) => {
			if (!e) {
				let e = zs(t, r), a = e.fatal ?? n ?? !0;
				i.addIssue({
					code: "custom",
					...e,
					fatal: a
				});
			}
		});
		if (!a) {
			let e = zs(t, r), a = e.fatal ?? n ?? !0;
			i.addIssue({
				code: "custom",
				...e,
				fatal: a
			});
		}
	}) : ss.create();
}
ps.lazycreate;
var M;
(function(e) {
	e.ZodString = "ZodString", e.ZodNumber = "ZodNumber", e.ZodNaN = "ZodNaN", e.ZodBigInt = "ZodBigInt", e.ZodBoolean = "ZodBoolean", e.ZodDate = "ZodDate", e.ZodSymbol = "ZodSymbol", e.ZodUndefined = "ZodUndefined", e.ZodNull = "ZodNull", e.ZodAny = "ZodAny", e.ZodUnknown = "ZodUnknown", e.ZodNever = "ZodNever", e.ZodVoid = "ZodVoid", e.ZodArray = "ZodArray", e.ZodObject = "ZodObject", e.ZodUnion = "ZodUnion", e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", e.ZodIntersection = "ZodIntersection", e.ZodTuple = "ZodTuple", e.ZodRecord = "ZodRecord", e.ZodMap = "ZodMap", e.ZodSet = "ZodSet", e.ZodFunction = "ZodFunction", e.ZodLazy = "ZodLazy", e.ZodLiteral = "ZodLiteral", e.ZodEnum = "ZodEnum", e.ZodEffects = "ZodEffects", e.ZodNativeEnum = "ZodNativeEnum", e.ZodOptional = "ZodOptional", e.ZodNullable = "ZodNullable", e.ZodDefault = "ZodDefault", e.ZodCatch = "ZodCatch", e.ZodPromise = "ZodPromise", e.ZodBranded = "ZodBranded", e.ZodPipeline = "ZodPipeline", e.ZodReadonly = "ZodReadonly";
})(M ||= {});
var Vs = (e, t = { message: `Input not instance of ${e.name}` }) => Bs((t) => t instanceof e, t), N = Qo.create, P = es.create;
Fs.create, ts.create;
var Hs = ns.create;
rs.create, is.create, as.create, os.create, ss.create;
var Us = cs.create;
ls.create, us.create;
var Ws = ds.create, F = ps.create;
ps.strictCreate;
var Gs = ms.create, Ks = gs.create, qs = vs.create;
ys.create;
var Js = bs.create;
xs.create, Ss.create, Cs.create, ws.create;
var I = Ts.create, Ys = Ds.create;
Os.create, ks.create, As.create, js.create, Ms.create, As.createWithPreprocess, Ls.create;
var Xs = O, Zs = uo(), Qs = (e, t) => t.safeParse(e).success;
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bytes.js
function $s(e, t) {
	if (e === t) return !0;
	if (e.byteLength !== t.byteLength) return !1;
	for (let n = 0; n < e.byteLength; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function ec(e) {
	if (e instanceof Uint8Array && e.constructor.name === "Uint8Array") return e;
	if (e instanceof ArrayBuffer) return new Uint8Array(e);
	if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
	throw Error("Unknown type, must be binary type");
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/vendor/base-x.js
function tc(e, t) {
	if (e.length >= 255) throw TypeError("Alphabet too long");
	for (var n = /* @__PURE__ */ new Uint8Array(256), r = 0; r < n.length; r++) n[r] = 255;
	for (var i = 0; i < e.length; i++) {
		var a = e.charAt(i), o = a.charCodeAt(0);
		if (n[o] !== 255) throw TypeError(a + " is ambiguous");
		n[o] = i;
	}
	var s = e.length, c = e.charAt(0), l = Math.log(s) / Math.log(256), u = Math.log(256) / Math.log(s);
	function d(t) {
		if (t instanceof Uint8Array || (ArrayBuffer.isView(t) ? t = new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : Array.isArray(t) && (t = Uint8Array.from(t))), !(t instanceof Uint8Array)) throw TypeError("Expected Uint8Array");
		if (t.length === 0) return "";
		for (var n = 0, r = 0, i = 0, a = t.length; i !== a && t[i] === 0;) i++, n++;
		for (var o = (a - i) * u + 1 >>> 0, l = new Uint8Array(o); i !== a;) {
			for (var d = t[i], f = 0, p = o - 1; (d !== 0 || f < r) && p !== -1; p--, f++) d += 256 * l[p] >>> 0, l[p] = d % s >>> 0, d = d / s >>> 0;
			if (d !== 0) throw Error("Non-zero carry");
			r = f, i++;
		}
		for (var m = o - r; m !== o && l[m] === 0;) m++;
		for (var h = c.repeat(n); m < o; ++m) h += e.charAt(l[m]);
		return h;
	}
	function f(e) {
		if (typeof e != "string") throw TypeError("Expected String");
		if (e.length === 0) return /* @__PURE__ */ new Uint8Array();
		var t = 0;
		if (e[t] !== " ") {
			for (var r = 0, i = 0; e[t] === c;) r++, t++;
			for (var a = (e.length - t) * l + 1 >>> 0, o = new Uint8Array(a); e[t];) {
				var u = n[e.charCodeAt(t)];
				if (u === 255) return;
				for (var d = 0, f = a - 1; (u !== 0 || d < i) && f !== -1; f--, d++) u += s * o[f] >>> 0, o[f] = u % 256 >>> 0, u = u / 256 >>> 0;
				if (u !== 0) throw Error("Non-zero carry");
				i = d, t++;
			}
			if (e[t] !== " ") {
				for (var p = a - i; p !== a && o[p] === 0;) p++;
				for (var m = new Uint8Array(r + (a - p)), h = r; p !== a;) m[h++] = o[p++];
				return m;
			}
		}
	}
	function p(e) {
		var n = f(e);
		if (n) return n;
		throw Error(`Non-${t} character`);
	}
	return {
		encode: d,
		decodeUnsafe: f,
		decode: p
	};
}
var nc = tc, rc = class {
	name;
	prefix;
	baseEncode;
	constructor(e, t, n) {
		this.name = e, this.prefix = t, this.baseEncode = n;
	}
	encode(e) {
		if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
		throw Error("Unknown type, must be binary type");
	}
}, ic = class {
	name;
	prefix;
	baseDecode;
	prefixCodePoint;
	constructor(e, t, n) {
		this.name = e, this.prefix = t;
		let r = t.codePointAt(0);
		/* c8 ignore next 3 */
		if (r === void 0) throw Error("Invalid prefix character");
		this.prefixCodePoint = r, this.baseDecode = n;
	}
	decode(e) {
		if (typeof e == "string") {
			if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
			return this.baseDecode(e.slice(this.prefix.length));
		}
		throw Error("Can only multibase decode strings");
	}
	or(e) {
		return oc(this, e);
	}
}, ac = class {
	decoders;
	constructor(e) {
		this.decoders = e;
	}
	or(e) {
		return oc(this, e);
	}
	decode(e) {
		let t = e[0], n = this.decoders[t];
		if (n != null) return n.decode(e);
		throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
	}
};
function oc(e, t) {
	return new ac({
		...e.decoders ?? { [e.prefix]: e },
		...t.decoders ?? { [t.prefix]: t }
	});
}
var sc = class {
	name;
	prefix;
	baseEncode;
	baseDecode;
	encoder;
	decoder;
	constructor(e, t, n, r) {
		this.name = e, this.prefix = t, this.baseEncode = n, this.baseDecode = r, this.encoder = new rc(e, t, n), this.decoder = new ic(e, t, r);
	}
	encode(e) {
		return this.encoder.encode(e);
	}
	decode(e) {
		return this.decoder.decode(e);
	}
};
function cc({ name: e, prefix: t, encode: n, decode: r }) {
	return new sc(e, t, n, r);
}
function lc({ name: e, prefix: t, alphabet: n }) {
	let { encode: r, decode: i } = nc(n, e);
	return cc({
		prefix: t,
		name: e,
		encode: r,
		decode: (e) => ec(i(e))
	});
}
function uc(e, t, n, r) {
	let i = e.length;
	for (; e[i - 1] === "=";) --i;
	let a = new Uint8Array(i * n / 8 | 0), o = 0, s = 0, c = 0;
	for (let l = 0; l < i; ++l) {
		let i = t[e[l]];
		if (i === void 0) throw SyntaxError(`Non-${r} character`);
		s = s << n | i, o += n, o >= 8 && (o -= 8, a[c++] = 255 & s >> o);
	}
	if (o >= n || 255 & s << 8 - o) throw SyntaxError("Unexpected end of data");
	return a;
}
function dc(e, t, n) {
	let r = t[t.length - 1] === "=", i = (1 << n) - 1, a = "", o = 0, s = 0;
	for (let r = 0; r < e.length; ++r) for (s = s << 8 | e[r], o += 8; o > n;) o -= n, a += t[i & s >> o];
	if (o !== 0 && (a += t[i & s << n - o]), r) for (; a.length * n & 7;) a += "=";
	return a;
}
function fc(e) {
	let t = {};
	for (let n = 0; n < e.length; ++n) t[e[n]] = n;
	return t;
}
function pc({ name: e, prefix: t, bitsPerChar: n, alphabet: r }) {
	let i = fc(r);
	return cc({
		prefix: t,
		name: e,
		encode(e) {
			return dc(e, r, n);
		},
		decode(t) {
			return uc(t, i, n, e);
		}
	});
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base32.js
var mc = pc({
	prefix: "b",
	name: "base32",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567",
	bitsPerChar: 5
});
pc({
	prefix: "B",
	name: "base32upper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
	bitsPerChar: 5
}), pc({
	prefix: "c",
	name: "base32pad",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
	bitsPerChar: 5
}), pc({
	prefix: "C",
	name: "base32padupper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
	bitsPerChar: 5
}), pc({
	prefix: "v",
	name: "base32hex",
	alphabet: "0123456789abcdefghijklmnopqrstuv",
	bitsPerChar: 5
}), pc({
	prefix: "V",
	name: "base32hexupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
	bitsPerChar: 5
}), pc({
	prefix: "t",
	name: "base32hexpad",
	alphabet: "0123456789abcdefghijklmnopqrstuv=",
	bitsPerChar: 5
}), pc({
	prefix: "T",
	name: "base32hexpadupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
	bitsPerChar: 5
}), pc({
	prefix: "h",
	name: "base32z",
	alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
	bitsPerChar: 5
});
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base36.js
var hc = lc({
	prefix: "k",
	name: "base36",
	alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
lc({
	prefix: "K",
	name: "base36upper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base58.js
var gc = lc({
	name: "base58btc",
	prefix: "z",
	alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
lc({
	name: "base58flickr",
	prefix: "Z",
	alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/vendor/varint.js
var _c = xc, vc = 128, yc = -128, bc = 2 ** 31;
function xc(e, t, n) {
	t ||= [], n ||= 0;
	for (var r = n; e >= bc;) t[n++] = e & 255 | vc, e /= 128;
	for (; e & yc;) t[n++] = e & 255 | vc, e >>>= 7;
	return t[n] = e | 0, xc.bytes = n - r + 1, t;
}
var Sc = Tc, Cc = 128, wc = 127;
function Tc(e, t) {
	var n = 0, t = t || 0, r = 0, i = t, a, o = e.length;
	do {
		if (i >= o) throw Tc.bytes = 0, RangeError("Could not decode varint");
		a = e[i++], n += r < 28 ? (a & wc) << r : (a & wc) * 2 ** r, r += 7;
	} while (a >= Cc);
	return Tc.bytes = i - t, n;
}
var Ec = 128, Dc = 2 ** 14, Oc = 2 ** 21, kc = 2 ** 28, Ac = 2 ** 35, jc = 2 ** 42, Mc = 2 ** 49, Nc = 2 ** 56, Pc = 2 ** 63, Fc = {
	encode: _c,
	decode: Sc,
	encodingLength: function(e) {
		return e < Ec ? 1 : e < Dc ? 2 : e < Oc ? 3 : e < kc ? 4 : e < Ac ? 5 : e < jc ? 6 : e < Mc ? 7 : e < Nc ? 8 : e < Pc ? 9 : 10;
	}
};
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/varint.js
function Ic(e, t = 0) {
	return [Fc.decode(e, t), Fc.decode.bytes];
}
function Lc(e, t, n = 0) {
	return Fc.encode(e, t, n), t;
}
function Rc(e) {
	return Fc.encodingLength(e);
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/hashes/digest.js
function zc(e, t) {
	let n = t.byteLength, r = Rc(e), i = r + Rc(n), a = new Uint8Array(i + n);
	return Lc(e, a, 0), Lc(n, a, r), a.set(t, i), new Hc(e, n, t, a);
}
function Bc(e) {
	let t = ec(e), [n, r] = Ic(t), [i, a] = Ic(t.subarray(r)), o = t.subarray(r + a);
	if (o.byteLength !== i) throw Error("Incorrect length");
	return new Hc(n, i, o, t);
}
function Vc(e, t) {
	if (e === t) return !0;
	{
		let n = t;
		return e.code === n.code && e.size === n.size && n.bytes instanceof Uint8Array && $s(e.bytes, n.bytes);
	}
}
var Hc = class {
	code;
	size;
	digest;
	bytes;
	constructor(e, t, n, r) {
		this.code = e, this.size = t, this.digest = n, this.bytes = r;
	}
};
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/cid.js
function Uc(e, t) {
	let { bytes: n, version: r } = e;
	switch (r) {
		case 0: return Jc(n, Gc(e), t ?? gc.encoder);
		default: return Yc(n, Gc(e), t ?? mc.encoder);
	}
}
var Wc = /* @__PURE__ */ new WeakMap();
function Gc(e) {
	let t = Wc.get(e);
	if (t == null) {
		let t = /* @__PURE__ */ new Map();
		return Wc.set(e, t), t;
	}
	return t;
}
var Kc = class e {
	code;
	version;
	multihash;
	bytes;
	"/";
	constructor(e, t, n, r) {
		this.code = t, this.version = e, this.multihash = n, this.bytes = r, this["/"] = r;
	}
	get asCID() {
		return this;
	}
	get byteOffset() {
		return this.bytes.byteOffset;
	}
	get byteLength() {
		return this.bytes.byteLength;
	}
	toV0() {
		switch (this.version) {
			case 0: return this;
			case 1: {
				let { code: t, multihash: n } = this;
				if (t !== Xc) throw Error("Cannot convert a non dag-pb CID to CIDv0");
				if (n.code !== Zc) throw Error("Cannot convert non sha2-256 multihash CID to CIDv0");
				return e.createV0(n);
			}
			default: throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
		}
	}
	toV1() {
		switch (this.version) {
			case 0: {
				let { code: t, digest: n } = this.multihash, r = zc(t, n);
				return e.createV1(this.code, r);
			}
			case 1: return this;
			default: throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
		}
	}
	equals(t) {
		return e.equals(this, t);
	}
	static equals(e, t) {
		let n = t;
		return n != null && e.code === n.code && e.version === n.version && Vc(e.multihash, n.multihash);
	}
	toString(e) {
		return Uc(this, e);
	}
	toJSON() {
		return { "/": Uc(this) };
	}
	link() {
		return this;
	}
	[Symbol.toStringTag] = "CID";
	[Symbol.for("nodejs.util.inspect.custom")]() {
		return `CID(${this.toString()})`;
	}
	static asCID(t) {
		if (t == null) return null;
		let n = t;
		if (n instanceof e) return n;
		if (n["/"] != null && n["/"] === n.bytes || n.asCID === n) {
			let { version: t, code: r, multihash: i, bytes: a } = n;
			return new e(t, r, i, a ?? Qc(t, r, i.bytes));
		}
		if (n[$c] === !0) {
			let { version: t, multihash: r, code: i } = n, a = Bc(r);
			return e.create(t, i, a);
		}
		return null;
	}
	static create(t, n, r) {
		if (typeof n != "number") throw Error("String codecs are no longer supported");
		if (!(r.bytes instanceof Uint8Array)) throw Error("Invalid digest");
		switch (t) {
			case 0:
				if (n !== Xc) throw Error(`Version 0 CID must use dag-pb (code: ${Xc}) block encoding`);
				return new e(t, n, r, r.bytes);
			case 1: {
				let i = Qc(t, n, r.bytes);
				return new e(t, n, r, i);
			}
			default: throw Error("Invalid version");
		}
	}
	static createV0(t) {
		return e.create(0, Xc, t);
	}
	static createV1(t, n) {
		return e.create(1, t, n);
	}
	static decode(t) {
		let [n, r] = e.decodeFirst(t);
		if (r.length !== 0) throw Error("Incorrect length");
		return n;
	}
	static decodeFirst(t) {
		let n = e.inspectBytes(t), r = n.size - n.multihashSize, i = ec(t.subarray(r, r + n.multihashSize));
		if (i.byteLength !== n.multihashSize) throw Error("Incorrect length");
		let a = i.subarray(n.multihashSize - n.digestSize), o = new Hc(n.multihashCode, n.digestSize, a, i);
		return [n.version === 0 ? e.createV0(o) : e.createV1(n.codec, o), t.subarray(n.size)];
	}
	static inspectBytes(e) {
		let t = 0, n = () => {
			let [n, r] = Ic(e.subarray(t));
			return t += r, n;
		}, r = n(), i = Xc;
		if (r === 18 ? (r = 0, t = 0) : i = n(), r !== 0 && r !== 1) throw RangeError(`Invalid CID version ${r}`);
		let a = t, o = n(), s = n(), c = t + s, l = c - a;
		return {
			version: r,
			codec: i,
			multihashCode: o,
			digestSize: s,
			multihashSize: l,
			size: c
		};
	}
	static parse(t, n) {
		let [r, i] = qc(t, n), a = e.decode(i);
		if (a.version === 0 && t[0] !== "Q") throw Error("Version 0 CID string must not include multibase prefix");
		return Gc(a).set(r, t), a;
	}
};
function qc(e, t) {
	switch (e[0]) {
		case "Q": {
			let n = t ?? gc;
			return [gc.prefix, n.decode(`${gc.prefix}${e}`)];
		}
		case gc.prefix: {
			let n = t ?? gc;
			return [gc.prefix, n.decode(e)];
		}
		case mc.prefix: {
			let n = t ?? mc;
			return [mc.prefix, n.decode(e)];
		}
		case hc.prefix: {
			let n = t ?? hc;
			return [hc.prefix, n.decode(e)];
		}
		default:
			if (t == null) throw Error("To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided");
			return [e[0], t.decode(e)];
	}
}
function Jc(e, t, n) {
	let { prefix: r } = n;
	if (r !== gc.prefix) throw Error(`Cannot string encode V0 in ${n.name} encoding`);
	let i = t.get(r);
	if (i == null) {
		let i = n.encode(e).slice(1);
		return t.set(r, i), i;
	}
	return i;
}
function Yc(e, t, n) {
	let { prefix: r } = n, i = t.get(r);
	if (i == null) {
		let i = n.encode(e);
		return t.set(r, i), i;
	}
	return i;
}
var Xc = 112, Zc = 18;
function Qc(e, t, n) {
	let r = Rc(e), i = r + Rc(t), a = new Uint8Array(i + n.byteLength);
	return Lc(e, a, 0), Lc(t, a, r), a.set(n, i), a;
}
var $c = Symbol.for("@ipld/js-cid/CID"), el = 20;
function tl({ name: e, code: t, encode: n, minDigestLength: r, maxDigestLength: i }) {
	return new nl(e, t, n, r, i);
}
var nl = class {
	name;
	code;
	encode;
	minDigestLength;
	maxDigestLength;
	constructor(e, t, n, r, i) {
		this.name = e, this.code = t, this.encode = n, this.minDigestLength = r ?? el, this.maxDigestLength = i;
	}
	digest(e, t) {
		if (t?.truncate != null) {
			if (t.truncate < this.minDigestLength) throw Error(`Invalid truncate option, must be greater than or equal to ${this.minDigestLength}`);
			if (this.maxDigestLength != null && t.truncate > this.maxDigestLength) throw Error(`Invalid truncate option, must be less than or equal to ${this.maxDigestLength}`);
		}
		if (e instanceof Uint8Array) {
			let n = this.encode(e);
			return n instanceof Uint8Array ? rl(n, this.code, t?.truncate) : n.then((e) => rl(e, this.code, t?.truncate));
		}
		throw Error("Unknown type, must be binary type");
	}
};
function rl(e, t, n) {
	if (n != null && n !== e.byteLength) {
		if (n > e.byteLength) throw Error(`Invalid truncate option, must be less than or equal to ${e.byteLength}`);
		e = e.subarray(0, n);
	}
	return zc(t, e);
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/hashes/sha2-browser.js
function il(e) {
	return async (t) => new Uint8Array(await crypto.subtle.digest(e, t));
}
var al = tl({
	name: "sha2-256",
	code: 18,
	encode: il("SHA-256")
}), ol = tl({
	name: "sha2-512",
	code: 19,
	encode: il("SHA-512")
});
//#endregion
//#region node_modules/@atproto/lex-data/dist/lib/util.js
function sl(e) {
	return Number.isInteger(e) && e >= 0 && e < 256;
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/object.js
function cl(e) {
	return typeof e == "object" && !!e;
}
var ll = Object.prototype, ul = Object.prototype.toString;
function dl(e) {
	return cl(e) && fl(e);
}
function fl(e) {
	let t = Object.getPrototypeOf(e);
	return t === null || (t === ll || Object.getPrototypeOf(t) === null) && ul.call(e) === "[object Object]";
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/lib/nodejs-buffer.js
var pl = "Bu" + "f".repeat(2) + "er", ml = globalThis?.[pl]?.prototype instanceof Uint8Array && "byteLength" in globalThis[pl] ? globalThis[pl] : /* v8 ignore next -- @preserve */ null, hl = pc({
	prefix: "m",
	name: "base64",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	bitsPerChar: 6
}), gl = pc({
	prefix: "M",
	name: "base64pad",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	bitsPerChar: 6
}), _l = pc({
	prefix: "u",
	name: "base64url",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
	bitsPerChar: 6
}), vl = pc({
	prefix: "U",
	name: "base64urlpad",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
	bitsPerChar: 6
}), yl = ml, bl = typeof Uint8Array.fromBase64 == "function" ? function(e, t = "base64") {
	return Uint8Array.fromBase64(e, {
		alphabet: t,
		lastChunkHandling: "loose"
	});
} : /* v8 ignore next -- @preserve */ null, xl = yl ? function(e, t = "base64") {
	let n = yl.from(e, t);
	return Cl(e, n), new Uint8Array(n.buffer, n.byteOffset, n.byteLength);
} : /* v8 ignore next -- @preserve */ null;
function Sl(e, t = "base64") {
	let n = e.endsWith("="), r = t === "base64url" ? n ? vl : _l : n ? gl : hl, i = r.decoder.decode(`${r.prefix}${e}`);
	return Cl(e, i), i;
}
function Cl(e, t) {
	let n = e.endsWith("==") ? 2 : +!!e.endsWith("="), r = e.length - n, i = Math.floor(r * 3 / 4);
	if (t.length !== i) throw Error("Invalid base64 string");
	let a = t.length / 3 * 4, o = a + (a % 4 == 0 ? 0 : 4 - a % 4);
	if (e.length > o) throw Error("Invalid base64 string");
	for (let t = Math.ceil(a); t < e.length - n; t++) {
		let n = e.charCodeAt(t);
		if (!(n >= 65 && n <= 90) && !(n >= 97 && n <= 122) && !(n >= 48 && n <= 57) && n !== 43 && n !== 47) throw Error("Invalid base64 string");
	}
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/uint8array-to-base64.js
var wl = ml, Tl = typeof Uint8Array.prototype.toBase64 == "function" ? function(e, t = "base64") {
	return e.toBase64({
		alphabet: t,
		omitPadding: !0
	});
} : /* v8 ignore next -- @preserve */ null, El = wl ? function(e, t = "base64") {
	let n = (e instanceof wl ? e : wl.from(e)).toString(t);
	return n.charCodeAt(n.length - 1) === 61 ? n.charCodeAt(n.length - 2) === 61 ? n.slice(0, -2) : n.slice(0, -1) : n;
} : /* v8 ignore next -- @preserve */ null;
function Dl(e, t = "base64") {
	let n = t === "base64url" ? _l : hl;
	return n.encoder.encode(e).slice(n.prefix.length);
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/uint8array.js
var Ol = Tl ?? El ?? Dl, kl = bl ?? xl ?? Sl;
function Al(e, t) {
	if (e.byteLength !== t.byteLength) return !1;
	for (let n = 0; n < e.byteLength; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
var jl = al.code;
ol.code;
function Ml(e) {
	return e.version === 1 && e.code === 85;
}
function Nl(e) {
	return e.version === 1 && (e.code === 85 || e.code === 113) && e.multihash.code === jl && e.multihash.digest.byteLength === 32;
}
function Pl(e) {
	return e.code === 113 && Nl(e);
}
function Fl(e, t) {
	switch (t?.flavor) {
		case void 0: return !0;
		case "cbor": return Pl(e);
		case "dasl": return Nl(e);
		case "raw": return Ml(e);
		default: throw TypeError(`Unknown CID flavor: ${t?.flavor}`);
	}
}
function Il(e, t) {
	return Bl(e) && Fl(e, t);
}
function Ll(e, t) {
	return Il(e, t) ? e : null;
}
function Rl(e, t) {
	if (Il(e, t)) return e;
	throw Error(`Invalid ${t?.flavor ? `${t.flavor} CID` : "CID"} "${e}"`);
}
function zl(e, t) {
	return Rl(Kc.parse(e), t);
}
function Bl(e) {
	if (Kc.asCID(e)) return e.bytes != null;
	try {
		if (!cl(e)) return !1;
		let t = e;
		if (t.version !== 0 && t.version !== 1 || !sl(t.code) || !cl(t.multihash)) return !1;
		let n = t.multihash;
		return !(!sl(n.code) || !(n.digest instanceof Uint8Array) || !(t.bytes instanceof Uint8Array) || t.bytes[0] !== t.version || t.bytes[1] !== t.code || t.bytes[2] !== n.code || t.bytes[3] !== n.digest.length || t.bytes.length !== 4 + n.digest.length || !Al(t.bytes.subarray(4), n.digest) || typeof t.equals != "function" || t.equals(t) !== !0);
	} catch {
		return !1;
	}
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/blob.js
var Vl = { flavor: "raw" }, Hl = Number.isSafeInteger;
function Ul(e, t) {
	if (!dl(e) || e?.$type !== "blob") return !1;
	let { mimeType: n, size: r, ref: i } = e;
	if (typeof n != "string" || !n.includes("/") || (r !== -1 || t?.strict !== !1) && (!Hl(r) || r < 0) || typeof i != "object" || !i) return !1;
	for (let t in e) if (t !== "$type" && t !== "mimeType" && t !== "ref" && t !== "size") return !1;
	return !!Ll(i, t?.strict === !1 ? void 0 : Vl);
}
//#endregion
//#region node_modules/unicode-segmenter/core.js
function Wl(e, t = "") {
	let n = [], r = e.split(",").map((e) => e ? parseInt(e, 36) : 0), i = 0;
	for (let e = 0; e < r.length; e++) e % 2 ? n.push([
		i,
		i + r[e],
		t ? parseInt(t[e >> 1], 36) : 0
	]) : i = r[e];
	return n;
}
function Gl(e, t, n = 0, r = t.length - 1) {
	for (; n <= r;) {
		let i = n + r >>> 1, a = t[i];
		if (e < a[0]) r = i - 1;
		else if (e > a[1]) n = i + 1;
		else return i;
	}
	return -1;
}
//#endregion
//#region node_modules/unicode-segmenter/_grapheme_data.js
var Kl = Wl(",9,a,,b,1,d,,e,h,3j,w,4p,,4t,,4u,,lc,33,w3,6,13l,18,14v,,14x,1,150,1,153,,16o,5,174,a,17g,,18r,k,19s,,1cm,6,1ct,,1cv,5,1d3,1,1d6,3,1e7,,1e9,,1f4,q,1ie,a,1kb,8,1kt,,1li,3,1ln,8,1lx,2,1m1,4,1nd,2,1ow,1,1p3,8,1qi,n,1r6,,1r7,v,1s3,,1tm,,1tn,,1to,,1tq,2,1tt,7,1u1,3,1u5,,1u6,1,1u9,6,1uq,1,1vl,,1vm,1,1x8,,1xa,,1xb,1,1xd,3,1xj,1,1xn,1,1xp,,1xz,,1ya,1,1z2,,1z5,1,1z7,,20s,,20u,2,20x,1,213,1,217,2,21d,,228,1,22d,,22p,1,22r,,24c,,24e,2,24h,4,24n,1,24p,,24r,1,24t,,25e,1,262,5,269,,26a,1,27w,,27y,1,280,,281,3,287,1,28b,1,28d,,28l,2,28y,1,29u,,2bi,,2bj,,2bk,,2bl,1,2bq,2,2bu,2,2bx,,2c7,,2dc,,2dd,2,2dg,,2f0,,2f2,2,2f5,3,2fa,2,2fe,3,2fp,1,2g2,1,2gx,,2gy,1,2ik,,2im,,2in,1,2ip,,2iq,,2ir,1,2iu,2,2iy,3,2j9,1,2jm,1,2k3,,2kg,1,2ki,1,2m3,1,2m6,,2m7,1,2m9,3,2me,2,2mi,2,2ml,,2mm,,2mv,,2n6,1,2o1,,2o2,1,2q2,,2q7,,2q8,1,2qa,2,2qe,,2qg,6,2qn,,2r6,1,2sx,,2sz,,2t0,6,2tj,7,2wh,,2wj,,2wk,8,2x4,6,2zc,1,305,,307,,309,,30e,1,31t,d,327,,328,4,32e,1,32l,a,32x,z,346,,371,3,375,,376,5,37d,1,37f,1,37h,1,386,1,388,1,38e,2,38x,3,39e,,39g,,39h,1,39p,,3a5,,3cw,2n,3fk,1z,3hk,2f,3tp,2,4k2,3,4ky,2,4lu,1,4mq,1,4ok,1,4om,,4on,6,4ou,7,4p2,,4p3,1,4p5,a,4pp,,4qz,2,4r2,,4r3,,4ud,1,4vd,,4yo,2,4yr,3,4yv,1,4yx,2,4z4,1,4z6,,4z7,5,4zd,2,55j,1,55l,1,55n,,579,,57a,,57b,,57c,6,57k,,57m,,57p,7,57x,5,583,9,58f,,59s,u,5c0,3,5c4,,5dg,9,5dq,3,5du,2,5ez,8,5fk,1,5fm,,5gh,,5gi,3,5gm,1,5go,5,5ie,,5if,,5ig,1,5ii,2,5il,,5im,,5in,4,5k4,7,5kc,7,5kk,1,5km,1,5ow,2,5p0,c,5pd,,5pe,6,5pp,,5pw,,5pz,,5q0,1,5vk,1r,6bv,,6bw,,6bx,,6by,1,6co,6,6d8,,6dl,,6e8,f,6hc,w,6jm,,6k9,,6ms,5,6nd,1,6xm,1,6y0,,70o,,72n,,73d,a,73s,2,79e,,7fu,1,7g6,,7gg,,7i3,3,7i8,5,7if,b,7is,35,7m8,39,7pk,a,7pw,,7py,,7q5,,7q9,,7qg,,7qr,1,7r8,,7rb,,7rg,,7ri,,7rn,2,7rr,,7s3,4,7th,2,7tt,,7u8,,7un,,850,1,8hx,2,8ij,1,8k0,,8k5,,8vj,2,8zj,,928,v,wvj,3,wvo,9,wwu,1,wz4,1,x6q,,x6u,,x6z,,x7n,1,x7p,1,x7r,,x7w,,xa8,1,xbo,f,xc4,1,xcw,h,xdr,,xeu,7,xfr,a,xg2,,xg3,,xgg,s,xhc,2,xhf,,xir,,xis,1,xiu,3,xiy,1,xj0,1,xj2,1,xj4,,xk5,,xm1,5,xm7,1,xm9,1,xmb,1,xmd,1,xmr,,xn0,,xn1,,xoc,,xps,,xpu,2,xpz,1,xq6,1,xq9,,xrf,,xrg,1,xri,1,xrp,,xrq,,xyb,1,xyd,,xye,1,xyg,,xyh,1,xyk,,xyl,,1e68,f,1e74,f,1edb,,1ehq,1,1ek0,b,1eyl,,1f4w,,1f92,4,1gjl,2,1gjp,1,1gjw,3,1gl4,2,1glb,,1gpx,1,1h5w,3,1h7t,4,1hgr,1,1hj0,3,1hl2,a,1hmq,3,1hq8,,1hq9,,1hqa,,1hrs,e,1htc,,1htf,1,1htr,2,1htu,,1hv4,2,1hv7,3,1hvb,1,1hvd,1,1hvh,,1hvm,,1hvx,,1hxc,2,1hyf,4,1hyk,,1hyl,7,1hz9,1,1i0j,,1i0w,1,1i0y,,1i2b,2,1i2e,8,1i2n,,1i2o,,1i2q,1,1i2x,3,1i32,,1i33,,1i5o,2,1i5r,2,1i5u,1,1i5w,3,1i66,,1i69,,1ian,,1iao,2,1iar,7,1ibk,1,1ibm,1,1id7,1,1ida,,1idb,,1idc,,1idd,3,1idj,1,1idn,1,1idp,,1idz,,1iea,1,1iee,6,1ieo,4,1igo,,1igp,1,1igr,5,1igy,,1ih1,,1ih3,2,1ih6,,1ih8,1,1iha,2,1ihd,,1ihe,,1iht,1,1ik5,2,1ik8,7,1ikg,1,1iki,2,1ikl,,1ikm,,1ila,,1ink,,1inl,1,1inn,5,1int,,1inu,,1inv,1,1inx,,1iny,,1inz,1,1io1,,1io2,1,1iun,,1iuo,1,1iuq,3,1iuw,3,1iv0,1,1iv2,,1iv3,1,1ivw,1,1iy8,2,1iyb,7,1iyj,1,1iyl,,1iym,,1iyn,1,1j1n,,1j1o,,1j1p,,1j1q,1,1j1s,7,1j4t,,1j4u,,1j4v,,1j4y,3,1j52,,1j53,4,1jcc,2,1jcf,8,1jco,,1jcp,1,1jjk,,1jjl,4,1jjr,1,1jjv,3,1jjz,,1jk0,,1jk1,,1jk2,,1jk3,,1jo1,2,1jo4,3,1joa,1,1joc,3,1jog,,1jok,,1jpd,9,1jqr,5,1jqx,,1jqy,,1jqz,3,1jrb,,1jrl,5,1jrr,1,1jrt,2,1jt0,5,1jt6,c,1jtj,,1jtk,1,1k4v,,1k4w,6,1k54,5,1k5a,,1k5b,,1k7m,l,1k89,,1k8a,6,1k8h,,1k8i,1,1k8k,,1k8l,1,1kc1,5,1kca,,1kcc,1,1kcf,6,1kcm,,1kcn,,1kei,4,1keo,1,1ker,1,1ket,,1keu,,1kev,,1koj,1,1kol,1,1kow,1,1koy,,1koz,,1kqc,1,1kqe,4,1kqm,1,1kqo,2,1kre,,1ovk,f,1ow0,,1ow7,e,1xr2,b,1xre,2,1xrh,2,1zow,4,1zqo,6,206b,,206f,3,20jz,,20k1,1i,20lr,3,20o4,,20og,1,2ftp,1,2fts,3,2jgg,19,2jhs,m,2jxh,4,2jxp,5,2jxv,7,2jy3,7,2jyd,6,2jze,3,2k3m,2,2lmo,1i,2lob,1d,2lpx,,2lqc,,2lqz,4,2lr5,e,2mtc,6,2mtk,g,2mu3,6,2mub,1,2mue,4,2mxb,,2n1s,6,2nce,,2ne4,3,2nsc,3,2nzi,1,2ok0,6,2on8,6,2pz4,73,2q6l,2,2q7j,,2q98,5,2q9q,1,2qa6,,2qa9,9,2qb1,1k,2qcm,p,2qdd,e,2qe2,,2qen,,2qeq,8,2qf0,3,2qfd,c1,2qrf,4,2qrk,8t,2r0m,7d,2r9c,3j,2rg4,b,2rit,16,2rkc,3,2rm0,7,2rmi,5,2rns,7,2rou,29,2rrg,1a,2rss,9,2rt3,c8,2scg,sd,jny8,v,jnz4,2n,jo1s,3j,jo5c,6n,joc0,2rz", "262122424333333393233393339333333333393393b3b3b3b3b333b33b3bb33333b3b3333333b3b33bb3333b33b3bb33333b3bbb333b333b33333b3b3b3b3333b3b33b3bb39333b33b33b3b3b333b333333b3b333333b33b3b3333b3335dc333333b3b3b33323333b3bb3b33b3b3b3333b3333b3b333bb3b33b3b3b3b3b333b333b3323e2244234444444444444444444444444444444444444444443333333333b3b3bb33333b353b3b3b3b333b3b333b333333b3bb3b3b3bb333232333333333333333b3b3333bb3b393933b3b33bb3b393b3b3b3333b33b33b3bbb33b333b3333bb3933b3b3b333b3b3b3b3b33b3b3b33b3b3b33b3b33b33b3b3b33bb39b9b3b33b3b33b9333b393b3b33b33b3b3b3333393b3b3b33b39bb3b332333b333dd3b33332333323333333333333333333333344444444a44444434444444444444423232"), ql = Wl("1sl,10,1ug,7,1vc,7,1w5,j,1wq,6,1wy,,1x2,3,1y4,1,1y7,,1yo,1,239,j,23u,6,242,1,245,4,261,,26t,j,27e,6,27m,1,27p,4,28s,1,28v,,29d,,2dx,j,2ei,f,2fs,2,2l1,11"), Jl = 65535;
function* Yl(e) {
	let t = e.codePointAt(0);
	if (t == null) return;
	let n = t <= Jl ? 1 : 2, r = e.length, i = iu(t), a = 0, o = 0, s = !1, c = !1, l = !1, u = 0, d = i, f = t;
	for (; n < r;) {
		t = e.codePointAt(n), a = iu(t);
		let r = !0;
		i === 1 ? r = a !== 6 : i === 2 || i === 6 || a === 1 || a === 2 || a === 6 ? r = !0 : a === 3 || a === 14 || a === 11 || i === 9 ? r = !1 : i === 14 && a === 4 ? r = !s : i === 10 && a === 10 ? r = o++ % 2 == 1 : i === 5 ? r = a !== 5 && a !== 13 && a !== 7 && a !== 8 : ((i === 7 || i === 13) && (a === 13 || a === 12) || (i === 8 || i === 12) && a === 12 || a === 0 && c && l && au(t)) && (r = !1), r ? (yield {
			segment: e.slice(u, n),
			index: u,
			input: e,
			_hd: f,
			_catBegin: d,
			_catEnd: i
		}, s = !1, o = 0, u = n, d = a, f = t) : a === 14 && (i === 3 || i === 4) ? s = !0 : t >= 2325 && (!c && i === 0 && (c = au(f)), l = c && a === 3 ? l || t === 2381 || t === 2509 || t === 2637 || t === 2765 || t === 2893 || t === 3149 || t === 3405 : !1), n += t <= Jl ? 1 : 2, i = a;
	}
	u < r && (yield {
		segment: e.slice(u),
		index: u,
		input: e,
		_hd: f,
		_catBegin: d,
		_catEnd: i
	});
}
function Xl(e) {
	let t = 0;
	for (let n of Yl(e)) t += 1;
	return t;
}
var Zl = /* @__PURE__ */ new Uint8Array(6080), Ql = 128, $l = 12287, eu = /* @__PURE__ */ new Uint8Array(1536), tu = 40960, nu = 44031, ru = (() => {
	let e = 0;
	for (;;) {
		let [t, n, r] = Kl[e];
		if (t > nu) break;
		if (e++, !(n < Ql || t > $l && n < tu)) for (let e = t; e <= n; e++) {
			let t, n = 0;
			e <= $l ? (t = Zl, n = e - Ql >> 1) : (t = eu, n = e - tu >> 1), t[n] = e & 1 ? t[n] & 15 | r << 4 : t[n] & 240 | r;
		}
	}
	return e;
})();
function iu(e) {
	if (e < Ql) return e >= 32 ? 0 : e === 10 ? 6 : e === 13 ? 1 : 2;
	if (e <= $l) {
		let t = Zl[e - Ql >> 1];
		return e & 1 ? t >> 4 : t & 15;
	}
	if (e < tu) return e < 12336 ? e >= 12330 ? 3 : 0 : e < 12443 ? e === 12336 || e === 12349 ? 4 : e >= 12441 ? 3 : 0 : e === 12951 || e === 12953 ? 4 : 0;
	if (e <= nu) {
		let t = eu[e - tu >> 1];
		return e & 1 ? t >> 4 : t & 15;
	}
	if (e <= 55203) return (e - 44032) % 28 == 0 ? 7 : 8;
	if (e <= 55295) return e <= 55238 ? e >= 55216 ? 13 : 0 : e >= 55243 ? 12 : 0;
	if (e < 65024) return e === 64286 ? 3 : 0;
	let t = Gl(e, Kl, ru);
	return t < 0 ? 0 : Kl[t][2];
}
function au(e) {
	return Gl(e, ql) >= 0;
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/utf8-grapheme-len.js
var ou = "Segmenter" in Intl && typeof Intl.Segmenter == "function" ? /*#__PURE__*/ new Intl.Segmenter() : /* v8 ignore next -- @preserve */ null, su = ou ? function(e) {
	let t = 0;
	for (let n of ou.segment(e)) t++;
	return t;
} : /* v8 ignore next -- @preserve */ null;
function cu(e) {
	return Xl(e);
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/utf8-len.js
var lu = ml ? function(e) {
	return ml.byteLength(e, "utf8");
} : /* v8 ignore next -- @preserve */ null;
function uu(e) {
	let t = e.length, n;
	for (let r = 0; r < e.length; r += 1) n = e.charCodeAt(r), n <= 127 || (n <= 2047 ? t += 1 : (t += 2, n >= 55296 && n <= 56319 && (n = e.charCodeAt(r + 1), n >= 56320 && n <= 57343 && r++)));
	return t;
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/utf8.js
var du = su ?? cu, fu = lu ?? uu;
//#endregion
//#region node_modules/@atproto/lex-json/dist/bytes.js
function pu(e) {
	if (e && "$bytes" in e) {
		for (let t in e) if (t !== "$bytes") return;
		if (typeof e.$bytes == "string") try {
			return kl(e.$bytes);
		} catch {
			return;
		}
	}
}
function mu(e) {
	return { $bytes: Ol(e) };
}
//#endregion
//#region node_modules/@atproto/lex-json/dist/link.js
function hu(e, t) {
	if (!e || !("$link" in e)) return;
	for (let t in e) if (t !== "$link") return;
	let { $link: n } = e;
	if (typeof n == "string" && n.length !== 0 && !(n.length > 2048)) try {
		return zl(n, t);
	} catch {
		return;
	}
}
function gu(e) {
	return { $link: e.toString() };
}
//#endregion
//#region node_modules/@atproto/lex-json/dist/blob.js
function _u(e, t) {
	if (e.$type !== "blob") return;
	let n = e?.ref;
	if (n && typeof n == "object") {
		if ("$link" in n) {
			let r = hu(n);
			if (!r) return;
			let i = {
				...e,
				ref: r
			};
			if (Ul(i, t)) return i;
		}
		if (Ul(e)) return e;
	}
}
//#endregion
//#region node_modules/@atproto/lex-json/dist/lex-json.js
function vu(e, t = { strict: !1 }) {
	switch (typeof e) {
		case "object": return e === null ? null : Array.isArray(e) ? yu(e, t) : wu(e, t) ?? bu(e, t);
		case "number":
			if (Number.isSafeInteger(e) || t.strict === !1) return e;
			throw TypeError(`Invalid non-integer number: ${e}`);
		case "boolean":
		case "string": return e;
		default: throw TypeError(`Invalid JSON value: ${typeof e}`);
	}
}
function yu(e, t) {
	let n;
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = vu(i, t);
		a !== i && (n ??= Array.from(e), n[r] = a);
	}
	return n ?? e;
}
function bu(e, t) {
	let n;
	for (let [r, i] of Object.entries(e)) {
		if (r === "__proto__") throw TypeError("Invalid key: __proto__");
		if (i === void 0) {
			n ??= { ...e }, delete n[r];
			continue;
		}
		let a = vu(i, t);
		a !== i && (n ??= { ...e }, n[r] = a);
	}
	return n ?? e;
}
function xu(e) {
	switch (typeof e) {
		case "object": return e === null ? e : Array.isArray(e) ? Su(e) : Il(e) ? gu(e) : ArrayBuffer.isView(e) ? mu(e) : Cu(e);
		case "boolean":
		case "string":
		case "number": return e;
		default: throw TypeError(`Invalid Lex value: ${typeof e}`);
	}
}
function Su(e) {
	let t;
	for (let n = 0; n < e.length; n++) {
		let r = e[n], i = xu(r);
		i !== r && (t ??= Array.from(e), t[n] = i);
	}
	return t ?? e;
}
function Cu(e) {
	let t;
	for (let [n, r] of Object.entries(e)) {
		if (n === "__proto__") throw TypeError("Invalid key: __proto__");
		if (r === void 0) {
			t ??= { ...e }, delete t[n];
			continue;
		}
		let i = xu(r);
		i !== r && (t ??= { ...e }, t[n] = i);
	}
	return t ?? e;
}
function wu(e, t) {
	if (e.$link !== void 0) {
		let n = hu(e);
		if (n) return n;
		if (t.strict) throw TypeError("Invalid $link object");
	} else if (e.$bytes !== void 0) {
		let n = pu(e);
		if (n) return n;
		if (t.strict) throw TypeError("Invalid $bytes object");
	} else if (e.$type !== void 0 && t.strict) {
		if (e.$type === "blob") {
			let n = _u(e, t);
			if (n) return n;
			throw TypeError("Invalid blob object");
		}
		if (typeof e.$type != "string") throw TypeError(`Invalid $type property (${typeof e.$type})`);
		if (e.$type.length === 0) throw TypeError("Empty $type property");
	}
}
//#endregion
//#region node_modules/@atproto/common-web/dist/ipld.js
var Tu = (e) => vu(e, { strict: !1 }), Eu = (e) => e === void 0 || Number.isNaN(e) ? e : xu(e), Du = Us().transform((e, t) => Kc.asCID(e) ?? (t.addIssue({
	code: E.custom,
	message: "Not a valid CID"
}), Xs)), Ou = {
	cid: Du,
	carHeader: F({
		version: I(1),
		roots: Ws(Du)
	}),
	bytes: Vs(Uint8Array),
	string: N(),
	array: Ws(Us()),
	map: Js(N(), Us()),
	unknown: Us()
};
Ou.cid, Ou.carHeader, Ou.bytes, Ou.string, Ou.map, Ou.unknown;
//#endregion
//#region node_modules/@atproto/syntax/dist/did.js
var ku = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
function Au(e) {
	return typeof e == "string" && e.length <= 2048 && ku.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/handle.js
var ju = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
function Mu(e) {
	return typeof e == "string" && e.length <= 253 && ju.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/at-identifier.js
function Nu(e) {
	return !e || typeof e != "string" ? !1 : e.startsWith("did:") ? Au(e) : Mu(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/lib/result.js
function Pu(e) {
	return {
		success: !0,
		value: e
	};
}
function L(e) {
	return {
		success: !1,
		message: e
	};
}
//#endregion
//#region node_modules/@atproto/syntax/dist/nsid.js
function Fu(e) {
	return typeof e == "string" && Iu(e).success;
}
function Iu(e) {
	return e.length > 317 ? L("NSID is too long (317 chars max)") : e.length < 5 || !/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(e) ? L("NSID didn't validate via regex") : Pu(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/recordkey.js
var Lu = 512, Ru = 1, zu = /* @__PURE__ */ new Set([".", ".."]), Bu = /^[a-zA-Z0-9_~.:-]{1,512}$/;
function Vu(e) {
	return typeof e == "string" && e.length >= Ru && e.length <= Lu && Bu.test(e) && !zu.has(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/aturi_validation.js
function Hu(e, t) {
	return Gu(e, t).success;
}
var Uu = /[^a-zA-Z0-9._~:@!$&'()*+,;=%/\\[\]#?-]/, Wu = /^(?<uri>at:\/\/(?<authority>[^/?#\s]+)(?:\/(?<collection>[^/?#\s]+)(?:\/(?<rkey>[^/?#\s]+))?)?(?<trailingSlash>\/)?)(?:\?(?<query>[^#\s]*))?(?:#(?<hash>[^\s]*))?$/;
function Gu(e, t) {
	if (typeof e != "string") return L("ATURI must be a string");
	if (e.length > 8192) return L("ATURI exceeds maximum length");
	if (e.match(Uu)) return L("Disallowed characters in ATURI (ASCII)");
	let n = e.match(Wu)?.groups;
	if (!n) {
		if (t?.detailed) {
			if (!e.startsWith("at://")) return L("ATURI must start with \"at://\"");
			if (e.includes(" ")) return L("ATURI can not contain spaces");
			if (e.includes("//", 5)) return L("ATURI can not have empty path segments");
			let t = e.indexOf("/", 5);
			if (t !== -1) {
				let n = e.indexOf("#"), r = n === -1 ? e.length : n, i = e.indexOf("/", t + 1);
				if (i !== -1 && i !== r - 1) return L("ATURI can not have more than two path segments");
			}
		}
		return L("ATURI does not match expected format");
	}
	if (!Nu(n.authority)) return L("ATURI has invalid authority");
	if (n.collection != null && !Fu(n.collection)) return L("ATURI has invalid collection");
	if (n.hash != null) {
		let e = qu(n.hash, t);
		if (e.success) n.hash = e.value;
		else return L(`ATURI has invalid fragment (${e.message})`);
	}
	if (t?.strict !== !1) {
		if (n.trailingSlash != null) return L("ATURI can not have a trailing slash");
		if (n.query != null) return L("ATURI query part is not allowed");
		if (n.rkey != null && !Vu(n.rkey)) return L("ATURI has invalid record key");
	}
	return Pu(n);
}
var Ku = /^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/;
function qu(e, t) {
	if (!Ku.test(e)) return L("Invalid JSON pointer");
	let n = Ju(e);
	return !n.success && t?.strict === !1 ? Pu(e) : n;
}
function Ju(e) {
	try {
		return Pu(decodeURIComponent(e));
	} catch {
		return L("Invalid percent-encoding");
	}
}
var { isValidISODateString: Yu } = ((e) => e.default ?? e)(/* @__PURE__ */ c((/* @__PURE__ */ o(((e) => {
	(() => {
		var t = {
			d: (e, n) => {
				for (var r in n) t.o(n, r) && !t.o(e, r) && Object.defineProperty(e, r, {
					enumerable: !0,
					get: n[r]
				});
			},
			o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
			r: (e) => {
				typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 });
			}
		}, n = {};
		function r(e, t) {
			return t === void 0 && (t = "-"), RegExp("^(?!0{4}" + t + "0{2}" + t + "0{2})((?=[0-9]{4}" + t + "(((0[^2])|1[0-2])|02(?=" + t + "(([0-1][0-9])|2[0-8])))" + t + "[0-9]{2})|(?=((([13579][26])|([2468][048])|(0[48]))0{2})|([0-9]{2}((((0|[2468])[48])|[2468][048])|([13579][26])))" + t + "02" + t + "29))([0-9]{4})" + t + "(?!((0[469])|11)" + t + "31)((0[1,3-9]|1[0-2])|(02(?!" + t + "3)))" + t + "(0[1-9]|[1-2][0-9]|3[0-1])$").test(e);
		}
		function i(e) {
			var t = /\D/.exec(e);
			return t ? t[0] : "";
		}
		function a(e, t, n) {
			t === void 0 && (t = ":"), n === void 0 && (n = !1);
			var r = RegExp("^([0-1]|2(?=([0-3])|4" + t + "00))[0-9]" + t + "[0-5][0-9](" + t + "([0-5]|6(?=0))[0-9])?(.[0-9]{1,9})?$");
			if (!n || !/[Z+\-]/.test(e)) return r.test(e);
			if (/Z$/.test(e)) return r.test(e.replace("Z", ""));
			var a = e.includes("+"), o = e.split(/[+-]/), s = o[0], c = o[1];
			return r.test(s) && function(e, t, n) {
				return n === void 0 && (n = ":"), RegExp(t ? "^(0(?!(2" + n + "4)|0" + n + "3)|1(?=([0-1]|2(?=" + n + "[04])|[34](?=" + n + "0))))([03469](?=" + n + "[03])|[17](?=" + n + "0)|2(?=" + n + "[04])|5(?=" + n + "[034])|8(?=" + n + "[04]))" + n + "([03](?=0)|4(?=5))[05]$" : "^(0(?=[^0])|1(?=[0-2]))([39](?=" + n + "[03])|[0-24-8](?=" + n + "00))" + n + "[03]0$").test(e);
			}(c, a, i(c));
		}
		function o(e) {
			var t = e.split("T"), n = t[0], o = t[1], s = r(n, i(n));
			if (!o) return !1;
			var c, l = (c = o.match(/([^Z+\-\d])(?=\d+\1)/), Array.isArray(c) ? c[0] : "");
			return s && a(o, l, !0);
		}
		function s(e, t) {
			return t === void 0 && (t = "-"), RegExp("^[0-9]{4}" + t + "(0(?=[^0])|1(?=[0-2]))[0-9]$").test(e);
		}
		t.r(n), t.d(n, {
			isValidDate: () => r,
			isValidISODateString: () => o,
			isValidTime: () => a,
			isValidYearMonth: () => s
		});
		var c = e;
		for (var l in n) c[l] = n[l];
		n.__esModule && Object.defineProperty(c, "__esModule", { value: !0 });
	})();
})))(), 1));
function Xu(e) {
	return td(e).success;
}
function Zu(e) {
	if (typeof e != "string") return !1;
	try {
		if (Yu(e)) return !0;
	} catch {}
	return Xu(e);
}
var Qu = (e) => ({
	success: !1,
	message: e
}), $u = (e) => ({
	success: !0,
	value: e
}), ed = /^(?<full_year>[0-9]{4})-(?<date_month>0[1-9]|1[012])-(?<date_mday>[0-2][0-9]|3[01])T(?<time_hour>[0-1][0-9]|2[0-3]):(?<time_minute>[0-5][0-9]):(?<time_second>[0-5][0-9]|60)(?<time_secfrac>\.[0-9]+)?(?<time_offset>Z|(?<time_numoffset>[+-](?:[0-1][0-9]|2[0-3]):[0-5][0-9]))$/;
function td(e) {
	return typeof e == "string" ? e.length > 64 ? Qu("datetime is too long (64 chars max)") : e.endsWith("-00:00") ? Qu("datetime can not use \"-00:00\" for UTC timezone") : ed.test(e) ? nd(new Date(e)) : Qu("datetime is not in a valid format (must match RFC 3339 & ISO 8601 with 'Z' or ±hh:mm timezone)") : Qu("datetime must be a string");
}
function nd(e) {
	let t = e.getUTCFullYear();
	return Number.isNaN(t) ? Qu("datetime did not parse as ISO 8601") : t < 0 ? Qu("datetime normalized to a negative time") : t > 9999 ? Qu("datetime year is too far in the future") : $u(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/language.js
var rd = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>[xX](-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>[xX](-[A-Za-z0-9]{1,8})+))$/;
function id(e) {
	return rd.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/tid.js
var ad = 13, od = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
function sd(e) {
	return typeof e == "string" && e.length === ad && od.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/uri.js
function cd(e) {
	return typeof e == "string" && /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(e);
}
//#endregion
//#region node_modules/@atproto/common-web/dist/strings.js
var ld = du, ud = fu, dd = id;
URL.canParse;
var fd = F({
	id: N(),
	type: N(),
	controller: N(),
	publicKeyJwk: Js(N(), Us()).optional(),
	publicKeyMultibase: N().optional()
}), pd = F({
	id: N(),
	type: N(),
	serviceEndpoint: Gs([N(), Js(Us())])
});
F({
	"@context": Gs([I("https://www.w3.org/ns/did/v1"), Ws(N().url())]).optional(),
	id: N(),
	alsoKnownAs: Ws(N()).optional(),
	verificationMethod: Ws(fd).optional(),
	authentication: Ws(Gs([N(), fd])).optional(),
	service: Ws(pd).optional()
});
//#endregion
//#region node_modules/@atproto/lexicon/dist/util.js
function R(e, t) {
	if (e.split("#").length > 2) throw Error("Uri can only have one hash segment");
	if (e.startsWith("lex:")) return e;
	if (e.startsWith("#")) {
		if (!t) throw Error(`Unable to resolve uri without anchor: ${e}`);
		return `${t}${e}`;
	}
	return `lex:${e}`;
}
function md(e, t) {
	if (e.required !== void 0) {
		if (!Array.isArray(e.required)) {
			t.addIssue({
				code: E.invalid_type,
				received: typeof e.required,
				expected: "array"
			});
			return;
		}
		if (e.properties === void 0) {
			e.required.length > 0 && t.addIssue({
				code: E.custom,
				message: "Required fields defined but no properties defined"
			});
			return;
		}
		for (let n of e.required) e.properties[n] === void 0 && t.addIssue({
			code: E.custom,
			message: `Required field "${n}" not defined`
		});
	}
}
var hd = Js(N().refine(dd, "Invalid BCP47 language tag"), N().optional()), gd = F({
	type: I("boolean"),
	description: N().optional(),
	default: Hs().optional(),
	const: Hs().optional()
}), _d = F({
	type: I("integer"),
	description: N().optional(),
	default: P().int().optional(),
	minimum: P().int().optional(),
	maximum: P().int().optional(),
	enum: P().int().array().optional(),
	const: P().int().optional()
}), vd = Ys([
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
]), yd = F({
	type: I("string"),
	format: vd.optional(),
	description: N().optional(),
	default: N().optional(),
	minLength: P().int().optional(),
	maxLength: P().int().optional(),
	minGraphemes: P().int().optional(),
	maxGraphemes: P().int().optional(),
	enum: N().array().optional(),
	const: N().optional(),
	knownValues: N().array().optional()
}), bd = F({
	type: I("unknown"),
	description: N().optional()
}), xd = Ks("type", [
	gd,
	_d,
	yd,
	bd
]), Sd = F({
	type: I("bytes"),
	description: N().optional(),
	maxLength: P().optional(),
	minLength: P().optional()
}), Cd = F({
	type: I("cid-link"),
	description: N().optional()
});
Ks("type", [Sd, Cd]);
var wd = F({
	type: I("ref"),
	description: N().optional(),
	ref: N()
}), Td = F({
	type: I("union"),
	description: N().optional(),
	refs: N().array(),
	closed: Hs().optional()
}), Ed = Ks("type", [wd, Td]), Dd = F({
	type: I("blob"),
	description: N().optional(),
	accept: N().array().optional(),
	maxSize: P().optional()
}), Od = F({
	type: I("array"),
	description: N().optional(),
	items: Ks("type", [
		gd,
		_d,
		yd,
		bd,
		Sd,
		Cd,
		wd,
		Td,
		Dd
	]),
	minLength: P().int().optional(),
	maxLength: P().int().optional()
}), kd = Od.merge(F({ items: xd })), Ad = F({
	type: I("token"),
	description: N().optional()
}), jd = F({
	type: I("object"),
	description: N().optional(),
	required: N().array().optional(),
	nullable: N().array().optional(),
	properties: Js(N(), Ks("type", [
		Od,
		gd,
		_d,
		yd,
		bd,
		Sd,
		Cd,
		wd,
		Td,
		Dd
	]))
}).superRefine(md), Md = qs(F({
	type: I("permission"),
	resource: N().nonempty()
}), Js(N(), Gs([
	Ws(Gs([
		N(),
		P().int(),
		Hs()
	])),
	Hs(),
	P().int(),
	N()
]).optional())), Nd = F({
	type: I("permission-set"),
	description: N().optional(),
	title: N().optional(),
	"title:lang": hd.optional(),
	detail: N().optional(),
	"detail:lang": hd.optional(),
	permissions: Ws(Md)
}), Pd = F({
	type: I("params"),
	description: N().optional(),
	required: N().array().optional(),
	properties: Js(N(), Ks("type", [
		kd,
		gd,
		_d,
		yd,
		bd
	]))
}).superRefine(md), Fd = F({
	description: N().optional(),
	encoding: N(),
	schema: Gs([Ed, jd]).optional()
}), Id = F({
	name: N(),
	description: N().optional()
}), Ld = F({
	type: I("query"),
	description: N().optional(),
	parameters: Pd.optional(),
	output: Fd.optional(),
	errors: Id.array().optional()
}), Rd = F({
	type: I("procedure"),
	description: N().optional(),
	parameters: Pd.optional(),
	input: Fd.optional(),
	output: Fd.optional(),
	errors: Id.array().optional()
}), zd = F({
	type: I("subscription"),
	description: N().optional(),
	parameters: Pd.optional(),
	message: F({
		description: N().optional(),
		schema: Td
	}),
	errors: Id.array().optional()
}), Bd = F({
	type: I("record"),
	description: N().optional(),
	key: N().optional(),
	record: jd
}), Vd = Us().superRefine((e, t) => {
	if (!e || typeof e != "object") return t.addIssue({
		code: E.custom,
		message: "Must be an object",
		fatal: !0
	}), Xs;
	let n = e.type;
	if (n === void 0) return t.addIssue({
		code: E.custom,
		message: "Must have a type",
		fatal: !0
	}), Xs;
	if (typeof n != "string") return t.addIssue({
		code: E.custom,
		message: "Type property must be a string",
		fatal: !0
	}), Xs;
	let r = (() => {
		switch (n) {
			case "record": return Bd;
			case "permission-set": return Nd;
			case "query": return Ld;
			case "procedure": return Rd;
			case "subscription": return zd;
			case "blob": return Dd;
			case "array": return Od;
			case "token": return Ad;
			case "object": return jd;
			case "boolean": return gd;
			case "integer": return _d;
			case "string": return yd;
			case "bytes": return Sd;
			case "cid-link": return Cd;
			case "unknown": return bd;
		}
	})();
	if (!r) return t.addIssue({
		code: E.custom,
		message: `Invalid type: ${n} must be one of: record, query, procedure, subscription, blob, array, token, object, boolean, integer, string, bytes, cid-link, unknown`,
		fatal: !0
	}), Xs;
	let i = r.safeParse(e);
	if (!i.success) for (let e of i.error.issues) t.addIssue(e);
});
F({
	lexicon: I(1),
	id: N().refine(Fu, { message: "Must be a valid NSID" }),
	revision: P().optional(),
	description: N().optional(),
	defs: Js(N(), Vd)
}).refine((e) => {
	for (let [t, n] of Object.entries(e.defs)) if (t !== "main" && (n.type === "record" || n.type === "permission-set" || n.type === "procedure" || n.type === "query" || n.type === "subscription")) return !1;
	return !0;
}, { message: "Records, permission sets, procedures, queries, and subscriptions must be the main definition." });
function Hd(e) {
	return typeof e == "object" && !!e;
}
function Ud(e) {
	return Hd(e) && "$type" in e && typeof e.$type == "string";
}
var z = class extends Error {}, Wd = class extends Error {}, Gd = class extends Error {};
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bytes.js
function Kd(e, t) {
	if (e === t) return !0;
	if (e.byteLength !== t.byteLength) return !1;
	for (let n = 0; n < e.byteLength; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function qd(e) {
	if (e instanceof Uint8Array && e.constructor.name === "Uint8Array") return e;
	if (e instanceof ArrayBuffer) return new Uint8Array(e);
	if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
	throw Error("Unknown type, must be binary type");
}
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/vendor/base-x.js
function Jd(e, t) {
	if (e.length >= 255) throw TypeError("Alphabet too long");
	for (var n = /* @__PURE__ */ new Uint8Array(256), r = 0; r < n.length; r++) n[r] = 255;
	for (var i = 0; i < e.length; i++) {
		var a = e.charAt(i), o = a.charCodeAt(0);
		if (n[o] !== 255) throw TypeError(a + " is ambiguous");
		n[o] = i;
	}
	var s = e.length, c = e.charAt(0), l = Math.log(s) / Math.log(256), u = Math.log(256) / Math.log(s);
	function d(t) {
		if (t instanceof Uint8Array || (ArrayBuffer.isView(t) ? t = new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : Array.isArray(t) && (t = Uint8Array.from(t))), !(t instanceof Uint8Array)) throw TypeError("Expected Uint8Array");
		if (t.length === 0) return "";
		for (var n = 0, r = 0, i = 0, a = t.length; i !== a && t[i] === 0;) i++, n++;
		for (var o = (a - i) * u + 1 >>> 0, l = new Uint8Array(o); i !== a;) {
			for (var d = t[i], f = 0, p = o - 1; (d !== 0 || f < r) && p !== -1; p--, f++) d += 256 * l[p] >>> 0, l[p] = d % s >>> 0, d = d / s >>> 0;
			if (d !== 0) throw Error("Non-zero carry");
			r = f, i++;
		}
		for (var m = o - r; m !== o && l[m] === 0;) m++;
		for (var h = c.repeat(n); m < o; ++m) h += e.charAt(l[m]);
		return h;
	}
	function f(e) {
		if (typeof e != "string") throw TypeError("Expected String");
		if (e.length === 0) return /* @__PURE__ */ new Uint8Array();
		var t = 0;
		if (e[t] !== " ") {
			for (var r = 0, i = 0; e[t] === c;) r++, t++;
			for (var a = (e.length - t) * l + 1 >>> 0, o = new Uint8Array(a); e[t];) {
				var u = n[e.charCodeAt(t)];
				if (u === 255) return;
				for (var d = 0, f = a - 1; (u !== 0 || d < i) && f !== -1; f--, d++) u += s * o[f] >>> 0, o[f] = u % 256 >>> 0, u = u / 256 >>> 0;
				if (u !== 0) throw Error("Non-zero carry");
				i = d, t++;
			}
			if (e[t] !== " ") {
				for (var p = a - i; p !== a && o[p] === 0;) p++;
				for (var m = new Uint8Array(r + (a - p)), h = r; p !== a;) m[h++] = o[p++];
				return m;
			}
		}
	}
	function p(e) {
		var n = f(e);
		if (n) return n;
		throw Error(`Non-${t} character`);
	}
	return {
		encode: d,
		decodeUnsafe: f,
		decode: p
	};
}
var Yd = Jd, Xd = class {
	name;
	prefix;
	baseEncode;
	constructor(e, t, n) {
		this.name = e, this.prefix = t, this.baseEncode = n;
	}
	encode(e) {
		if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
		throw Error("Unknown type, must be binary type");
	}
}, Zd = class {
	name;
	prefix;
	baseDecode;
	prefixCodePoint;
	constructor(e, t, n) {
		this.name = e, this.prefix = t;
		let r = t.codePointAt(0);
		/* c8 ignore next 3 */
		if (r === void 0) throw Error("Invalid prefix character");
		this.prefixCodePoint = r, this.baseDecode = n;
	}
	decode(e) {
		if (typeof e == "string") {
			if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
			return this.baseDecode(e.slice(this.prefix.length));
		}
		throw Error("Can only multibase decode strings");
	}
	or(e) {
		return $d(this, e);
	}
}, Qd = class {
	decoders;
	constructor(e) {
		this.decoders = e;
	}
	or(e) {
		return $d(this, e);
	}
	decode(e) {
		let t = e[0], n = this.decoders[t];
		if (n != null) return n.decode(e);
		throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
	}
};
function $d(e, t) {
	return new Qd({
		...e.decoders ?? { [e.prefix]: e },
		...t.decoders ?? { [t.prefix]: t }
	});
}
var ef = class {
	name;
	prefix;
	baseEncode;
	baseDecode;
	encoder;
	decoder;
	constructor(e, t, n, r) {
		this.name = e, this.prefix = t, this.baseEncode = n, this.baseDecode = r, this.encoder = new Xd(e, t, n), this.decoder = new Zd(e, t, r);
	}
	encode(e) {
		return this.encoder.encode(e);
	}
	decode(e) {
		return this.decoder.decode(e);
	}
};
function tf({ name: e, prefix: t, encode: n, decode: r }) {
	return new ef(e, t, n, r);
}
function nf({ name: e, prefix: t, alphabet: n }) {
	let { encode: r, decode: i } = Yd(n, e);
	return tf({
		prefix: t,
		name: e,
		encode: r,
		decode: (e) => qd(i(e))
	});
}
function rf(e, t, n, r) {
	let i = e.length;
	for (; e[i - 1] === "=";) --i;
	let a = new Uint8Array(i * n / 8 | 0), o = 0, s = 0, c = 0;
	for (let l = 0; l < i; ++l) {
		let i = t[e[l]];
		if (i === void 0) throw SyntaxError(`Non-${r} character`);
		s = s << n | i, o += n, o >= 8 && (o -= 8, a[c++] = 255 & s >> o);
	}
	if (o >= n || 255 & s << 8 - o) throw SyntaxError("Unexpected end of data");
	return a;
}
function af(e, t, n) {
	let r = t[t.length - 1] === "=", i = (1 << n) - 1, a = "", o = 0, s = 0;
	for (let r = 0; r < e.length; ++r) for (s = s << 8 | e[r], o += 8; o > n;) o -= n, a += t[i & s >> o];
	if (o !== 0 && (a += t[i & s << n - o]), r) for (; a.length * n & 7;) a += "=";
	return a;
}
function of(e) {
	let t = {};
	for (let n = 0; n < e.length; ++n) t[e[n]] = n;
	return t;
}
function sf({ name: e, prefix: t, bitsPerChar: n, alphabet: r }) {
	let i = of(r);
	return tf({
		prefix: t,
		name: e,
		encode(e) {
			return af(e, r, n);
		},
		decode(t) {
			return rf(t, i, n, e);
		}
	});
}
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base32.js
var cf = sf({
	prefix: "b",
	name: "base32",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567",
	bitsPerChar: 5
});
sf({
	prefix: "B",
	name: "base32upper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
	bitsPerChar: 5
}), sf({
	prefix: "c",
	name: "base32pad",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
	bitsPerChar: 5
}), sf({
	prefix: "C",
	name: "base32padupper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
	bitsPerChar: 5
}), sf({
	prefix: "v",
	name: "base32hex",
	alphabet: "0123456789abcdefghijklmnopqrstuv",
	bitsPerChar: 5
}), sf({
	prefix: "V",
	name: "base32hexupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
	bitsPerChar: 5
}), sf({
	prefix: "t",
	name: "base32hexpad",
	alphabet: "0123456789abcdefghijklmnopqrstuv=",
	bitsPerChar: 5
}), sf({
	prefix: "T",
	name: "base32hexpadupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
	bitsPerChar: 5
}), sf({
	prefix: "h",
	name: "base32z",
	alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
	bitsPerChar: 5
});
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base36.js
var lf = nf({
	prefix: "k",
	name: "base36",
	alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
nf({
	prefix: "K",
	name: "base36upper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base58.js
var uf = nf({
	name: "base58btc",
	prefix: "z",
	alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
nf({
	name: "base58flickr",
	prefix: "Z",
	alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/vendor/varint.js
var df = hf, ff = 128, pf = -128, mf = 2 ** 31;
function hf(e, t, n) {
	t ||= [], n ||= 0;
	for (var r = n; e >= mf;) t[n++] = e & 255 | ff, e /= 128;
	for (; e & pf;) t[n++] = e & 255 | ff, e >>>= 7;
	return t[n] = e | 0, hf.bytes = n - r + 1, t;
}
var gf = yf, _f = 128, vf = 127;
function yf(e, t) {
	var n = 0, t = t || 0, r = 0, i = t, a, o = e.length;
	do {
		if (i >= o) throw yf.bytes = 0, RangeError("Could not decode varint");
		a = e[i++], n += r < 28 ? (a & vf) << r : (a & vf) * 2 ** r, r += 7;
	} while (a >= _f);
	return yf.bytes = i - t, n;
}
var bf = 128, xf = 2 ** 14, Sf = 2 ** 21, Cf = 2 ** 28, wf = 2 ** 35, Tf = 2 ** 42, Ef = 2 ** 49, Df = 2 ** 56, Of = 2 ** 63, kf = {
	encode: df,
	decode: gf,
	encodingLength: function(e) {
		return e < bf ? 1 : e < xf ? 2 : e < Sf ? 3 : e < Cf ? 4 : e < wf ? 5 : e < Tf ? 6 : e < Ef ? 7 : e < Df ? 8 : e < Of ? 9 : 10;
	}
};
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/varint.js
function Af(e, t = 0) {
	return [kf.decode(e, t), kf.decode.bytes];
}
function jf(e, t, n = 0) {
	return kf.encode(e, t, n), t;
}
function Mf(e) {
	return kf.encodingLength(e);
}
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/hashes/digest.js
function Nf(e, t) {
	let n = t.byteLength, r = Mf(e), i = r + Mf(n), a = new Uint8Array(i + n);
	return jf(e, a, 0), jf(n, a, r), a.set(t, i), new If(e, n, t, a);
}
function Pf(e) {
	let t = qd(e), [n, r] = Af(t), [i, a] = Af(t.subarray(r)), o = t.subarray(r + a);
	if (o.byteLength !== i) throw Error("Incorrect length");
	return new If(n, i, o, t);
}
function Ff(e, t) {
	if (e === t) return !0;
	{
		let n = t;
		return e.code === n.code && e.size === n.size && n.bytes instanceof Uint8Array && Kd(e.bytes, n.bytes);
	}
}
var If = class {
	code;
	size;
	digest;
	bytes;
	constructor(e, t, n, r) {
		this.code = e, this.size = t, this.digest = n, this.bytes = r;
	}
};
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/cid.js
function Lf(e, t) {
	let { bytes: n, version: r } = e;
	switch (r) {
		case 0: return Hf(n, zf(e), t ?? uf.encoder);
		default: return Uf(n, zf(e), t ?? cf.encoder);
	}
}
var Rf = /* @__PURE__ */ new WeakMap();
function zf(e) {
	let t = Rf.get(e);
	if (t == null) {
		let t = /* @__PURE__ */ new Map();
		return Rf.set(e, t), t;
	}
	return t;
}
var Bf = class e {
	code;
	version;
	multihash;
	bytes;
	"/";
	constructor(e, t, n, r) {
		this.code = t, this.version = e, this.multihash = n, this.bytes = r, this["/"] = r;
	}
	get asCID() {
		return this;
	}
	get byteOffset() {
		return this.bytes.byteOffset;
	}
	get byteLength() {
		return this.bytes.byteLength;
	}
	toV0() {
		switch (this.version) {
			case 0: return this;
			case 1: {
				let { code: t, multihash: n } = this;
				if (t !== Wf) throw Error("Cannot convert a non dag-pb CID to CIDv0");
				if (n.code !== Gf) throw Error("Cannot convert non sha2-256 multihash CID to CIDv0");
				return e.createV0(n);
			}
			default: throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
		}
	}
	toV1() {
		switch (this.version) {
			case 0: {
				let { code: t, digest: n } = this.multihash, r = Nf(t, n);
				return e.createV1(this.code, r);
			}
			case 1: return this;
			default: throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
		}
	}
	equals(t) {
		return e.equals(this, t);
	}
	static equals(e, t) {
		let n = t;
		return n != null && e.code === n.code && e.version === n.version && Ff(e.multihash, n.multihash);
	}
	toString(e) {
		return Lf(this, e);
	}
	toJSON() {
		return { "/": Lf(this) };
	}
	link() {
		return this;
	}
	[Symbol.toStringTag] = "CID";
	[Symbol.for("nodejs.util.inspect.custom")]() {
		return `CID(${this.toString()})`;
	}
	static asCID(t) {
		if (t == null) return null;
		let n = t;
		if (n instanceof e) return n;
		if (n["/"] != null && n["/"] === n.bytes || n.asCID === n) {
			let { version: t, code: r, multihash: i, bytes: a } = n;
			return new e(t, r, i, a ?? Kf(t, r, i.bytes));
		}
		if (n[qf] === !0) {
			let { version: t, multihash: r, code: i } = n, a = Pf(r);
			return e.create(t, i, a);
		}
		return null;
	}
	static create(t, n, r) {
		if (typeof n != "number") throw Error("String codecs are no longer supported");
		if (!(r.bytes instanceof Uint8Array)) throw Error("Invalid digest");
		switch (t) {
			case 0:
				if (n !== Wf) throw Error(`Version 0 CID must use dag-pb (code: ${Wf}) block encoding`);
				return new e(t, n, r, r.bytes);
			case 1: {
				let i = Kf(t, n, r.bytes);
				return new e(t, n, r, i);
			}
			default: throw Error("Invalid version");
		}
	}
	static createV0(t) {
		return e.create(0, Wf, t);
	}
	static createV1(t, n) {
		return e.create(1, t, n);
	}
	static decode(t) {
		let [n, r] = e.decodeFirst(t);
		if (r.length !== 0) throw Error("Incorrect length");
		return n;
	}
	static decodeFirst(t) {
		let n = e.inspectBytes(t), r = n.size - n.multihashSize, i = qd(t.subarray(r, r + n.multihashSize));
		if (i.byteLength !== n.multihashSize) throw Error("Incorrect length");
		let a = i.subarray(n.multihashSize - n.digestSize), o = new If(n.multihashCode, n.digestSize, a, i);
		return [n.version === 0 ? e.createV0(o) : e.createV1(n.codec, o), t.subarray(n.size)];
	}
	static inspectBytes(e) {
		let t = 0, n = () => {
			let [n, r] = Af(e.subarray(t));
			return t += r, n;
		}, r = n(), i = Wf;
		if (r === 18 ? (r = 0, t = 0) : i = n(), r !== 0 && r !== 1) throw RangeError(`Invalid CID version ${r}`);
		let a = t, o = n(), s = n(), c = t + s, l = c - a;
		return {
			version: r,
			codec: i,
			multihashCode: o,
			digestSize: s,
			multihashSize: l,
			size: c
		};
	}
	static parse(t, n) {
		let [r, i] = Vf(t, n), a = e.decode(i);
		if (a.version === 0 && t[0] !== "Q") throw Error("Version 0 CID string must not include multibase prefix");
		return zf(a).set(r, t), a;
	}
};
function Vf(e, t) {
	switch (e[0]) {
		case "Q": {
			let n = t ?? uf;
			return [uf.prefix, n.decode(`${uf.prefix}${e}`)];
		}
		case uf.prefix: {
			let n = t ?? uf;
			return [uf.prefix, n.decode(e)];
		}
		case cf.prefix: {
			let n = t ?? cf;
			return [cf.prefix, n.decode(e)];
		}
		case lf.prefix: {
			let n = t ?? lf;
			return [lf.prefix, n.decode(e)];
		}
		default:
			if (t == null) throw Error("To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided");
			return [e[0], t.decode(e)];
	}
}
function Hf(e, t, n) {
	let { prefix: r } = n;
	if (r !== uf.prefix) throw Error(`Cannot string encode V0 in ${n.name} encoding`);
	let i = t.get(r);
	if (i == null) {
		let i = n.encode(e).slice(1);
		return t.set(r, i), i;
	}
	return i;
}
function Uf(e, t, n) {
	let { prefix: r } = n, i = t.get(r);
	if (i == null) {
		let i = n.encode(e);
		return t.set(r, i), i;
	}
	return i;
}
var Wf = 112, Gf = 18;
function Kf(e, t, n) {
	let r = Mf(e), i = r + Mf(t), a = new Uint8Array(i + n.byteLength);
	return jf(e, a, 0), jf(t, a, r), a.set(n, i), a;
}
var qf = Symbol.for("@ipld/js-cid/CID"), Jf = F({
	$type: I("blob"),
	ref: Ou.cid,
	mimeType: N(),
	size: P()
}).strict(), Yf = Gs([Jf, F({
	cid: N(),
	mimeType: N()
}).strict()]), Xf = class e {
	constructor(e, t, n, r) {
		this.ref = e, this.mimeType = t, this.size = n, this.original = r ?? {
			$type: "blob",
			ref: e,
			mimeType: t,
			size: n
		};
	}
	static asBlobRef(t) {
		return Qs(t, Yf) ? e.fromJsonRef(t) : null;
	}
	static fromJsonRef(t) {
		return Qs(t, Jf) ? new e(t.ref, t.mimeType, t.size) : new e(Bf.parse(t.cid), t.mimeType, -1, t);
	}
	ipld() {
		return this.original;
	}
	toJSON() {
		return Eu(this.ipld());
	}
};
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/blob.js
function Zf(e, t, n, r) {
	return !r || !(r instanceof Xf) ? {
		success: !1,
		error: new z(`${t} should be a blob ref`)
	} : {
		success: !0,
		value: r
	};
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/formats.js
var Qf = lp(Zu, "must be an valid atproto datetime (both RFC-3339 and ISO-8601)"), $f = lp(cd, "must be a uri"), ep = lp(Hu, "must be a valid at-uri"), tp = lp(Au, "must be a valid did"), np = lp(Mu, "must be a valid handle"), rp = lp(Nu, "must be a valid did or a handle"), ip = lp(Fu, "must be a valid nsid"), ap = lp(up, "must be a cid string"), op = lp(id, "must be a well-formed BCP 47 language tag"), sp = lp(sd, "must be a valid TID"), cp = lp(Vu, "must be a valid Record Key");
function lp(e, t) {
	return (n, r) => e(r) ? {
		success: !0,
		value: r
	} : {
		success: !1,
		error: new z(`${n} ${t}`)
	};
}
function up(e) {
	try {
		return Bf.parse(e), !0;
	} catch {
		return !1;
	}
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/primitives.js
function dp(e, t, n, r) {
	switch (n.type) {
		case "boolean": return fp(e, t, n, r);
		case "integer": return pp(e, t, n, r);
		case "string": return mp(e, t, n, r);
		case "bytes": return hp(e, t, n, r);
		case "cid-link": return gp(e, t, n, r);
		case "unknown": return _p(e, t, n, r);
		default: return {
			success: !1,
			error: new z(`Unexpected lexicon type: ${n.type}`)
		};
	}
}
function fp(e, t, n, r) {
	n = n;
	let i = typeof r;
	return i === "undefined" ? typeof n.default == "boolean" ? {
		success: !0,
		value: n.default
	} : {
		success: !1,
		error: new z(`${t} must be a boolean`)
	} : i === "boolean" ? typeof n.const == "boolean" && r !== n.const ? {
		success: !1,
		error: new z(`${t} must be ${n.const}`)
	} : {
		success: !0,
		value: r
	} : {
		success: !1,
		error: new z(`${t} must be a boolean`)
	};
}
function pp(e, t, n, r) {
	return n = n, r === void 0 ? typeof n.default == "number" ? {
		success: !0,
		value: n.default
	} : {
		success: !1,
		error: new z(`${t} must be an integer`)
	} : Number.isInteger(r) ? typeof n.const == "number" && r !== n.const ? {
		success: !1,
		error: new z(`${t} must be ${n.const}`)
	} : Array.isArray(n.enum) && !n.enum.includes(r) ? {
		success: !1,
		error: new z(`${t} must be one of (${n.enum.join("|")})`)
	} : typeof n.maximum == "number" && r > n.maximum ? {
		success: !1,
		error: new z(`${t} can not be greater than ${n.maximum}`)
	} : typeof n.minimum == "number" && r < n.minimum ? {
		success: !1,
		error: new z(`${t} can not be less than ${n.minimum}`)
	} : {
		success: !0,
		value: r
	} : {
		success: !1,
		error: new z(`${t} must be an integer`)
	};
}
function mp(e, t, n, r) {
	if (n = n, r === void 0) return typeof n.default == "string" ? {
		success: !0,
		value: n.default
	} : {
		success: !1,
		error: new z(`${t} must be a string`)
	};
	if (typeof r != "string") return {
		success: !1,
		error: new z(`${t} must be a string`)
	};
	if (typeof n.const == "string" && r !== n.const) return {
		success: !1,
		error: new z(`${t} must be ${n.const}`)
	};
	if (Array.isArray(n.enum) && !n.enum.includes(r)) return {
		success: !1,
		error: new z(`${t} must be one of (${n.enum.join("|")})`)
	};
	if (typeof n.minLength == "number" || typeof n.maxLength == "number") {
		if (typeof n.minLength == "number" && r.length * 3 < n.minLength) return {
			success: !1,
			error: new z(`${t} must not be shorter than ${n.minLength} characters`)
		};
		let e = !1;
		if (n.minLength === void 0 && typeof n.maxLength == "number" && r.length * 3 <= n.maxLength && (e = !0), !e) {
			let e = ud(r);
			if (typeof n.maxLength == "number" && e > n.maxLength) return {
				success: !1,
				error: new z(`${t} must not be longer than ${n.maxLength} characters`)
			};
			if (typeof n.minLength == "number" && e < n.minLength) return {
				success: !1,
				error: new z(`${t} must not be shorter than ${n.minLength} characters`)
			};
		}
	}
	if (typeof n.maxGraphemes == "number" || typeof n.minGraphemes == "number") {
		let e = !1, i = !1;
		if (typeof n.maxGraphemes == "number" && (e = !(r.length <= n.maxGraphemes)), typeof n.minGraphemes == "number") {
			if (r.length < n.minGraphemes) return {
				success: !1,
				error: new z(`${t} must not be shorter than ${n.minGraphemes} graphemes`)
			};
			i = !0;
		}
		if (e || i) {
			let e = ld(r);
			if (typeof n.maxGraphemes == "number" && e > n.maxGraphemes) return {
				success: !1,
				error: new z(`${t} must not be longer than ${n.maxGraphemes} graphemes`)
			};
			if (typeof n.minGraphemes == "number" && e < n.minGraphemes) return {
				success: !1,
				error: new z(`${t} must not be shorter than ${n.minGraphemes} graphemes`)
			};
		}
	}
	if (typeof n.format == "string") switch (n.format) {
		case "datetime": return Qf(t, r);
		case "uri": return $f(t, r);
		case "at-uri": return ep(t, r);
		case "did": return tp(t, r);
		case "handle": return np(t, r);
		case "at-identifier": return rp(t, r);
		case "nsid": return ip(t, r);
		case "cid": return ap(t, r);
		case "language": return op(t, r);
		case "tid": return sp(t, r);
		case "record-key": return cp(t, r);
	}
	return {
		success: !0,
		value: r
	};
}
function hp(e, t, n, r) {
	return n = n, !r || !(r instanceof Uint8Array) ? {
		success: !1,
		error: new z(`${t} must be a byte array`)
	} : typeof n.maxLength == "number" && r.byteLength > n.maxLength ? {
		success: !1,
		error: new z(`${t} must not be larger than ${n.maxLength} bytes`)
	} : typeof n.minLength == "number" && r.byteLength < n.minLength ? {
		success: !1,
		error: new z(`${t} must not be smaller than ${n.minLength} bytes`)
	} : {
		success: !0,
		value: r
	};
}
function gp(e, t, n, r) {
	return Bf.asCID(r) === null ? {
		success: !1,
		error: new z(`${t} must be a CID`)
	} : {
		success: !0,
		value: r
	};
}
function _p(e, t, n, r) {
	return !r || typeof r != "object" ? {
		success: !1,
		error: new z(`${t} must be an object`)
	} : {
		success: !0,
		value: r
	};
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/complex.js
function vp(e, t, n, r) {
	switch (n.type) {
		case "object": return bp(e, t, n, r);
		case "array": return yp(e, t, n, r);
		case "blob": return Zf(e, t, n, r);
		default: return dp(e, t, n, r);
	}
}
function yp(e, t, n, r) {
	if (!Array.isArray(r)) return {
		success: !1,
		error: new z(`${t} must be an array`)
	};
	if (typeof n.maxLength == "number" && r.length > n.maxLength) return {
		success: !1,
		error: new z(`${t} must not have more than ${n.maxLength} elements`)
	};
	if (typeof n.minLength == "number" && r.length < n.minLength) return {
		success: !1,
		error: new z(`${t} must not have fewer than ${n.minLength} elements`)
	};
	let i = n.items;
	for (let n = 0; n < r.length; n++) {
		let a = r[n], o = xp(e, `${t}/${n}`, i, a);
		if (!o.success) return o;
	}
	return {
		success: !0,
		value: r
	};
}
function bp(e, t, n, r) {
	if (!Hd(r)) return {
		success: !1,
		error: new z(`${t} must be an object`)
	};
	let i = r;
	if ("properties" in n && n.properties != null) for (let a in n.properties) {
		let o = r[a];
		if (o === null && n.nullable?.includes(a)) continue;
		let s = n.properties[a];
		if (o === void 0 && !n.required?.includes(a)) {
			if (s.type === "integer" || s.type === "boolean" || s.type === "string") {
				if (s.default === void 0) continue;
			} else continue;
		}
		let c = xp(e, `${t}/${a}`, s, o), l = c.success ? c.value : o;
		if (l === void 0) {
			if (n.required?.includes(a)) return {
				success: !1,
				error: new z(`${t} must have the property "${a}"`)
			};
		} else if (!c.success) return c;
		l !== o && (i === r && (i = { ...r }), i[a] = l);
	}
	return {
		success: !0,
		value: i
	};
}
function xp(e, t, n, r, i = !1) {
	let a;
	if (n.type === "union") {
		if (!Ud(r)) return {
			success: !1,
			error: new z(`${t} must be an object which includes the "$type" property`)
		};
		if (Sp(n.refs, r.$type)) a = e.getDefOrThrow(r.$type);
		else return n.closed ? {
			success: !1,
			error: new z(`${t} $type must be one of ${n.refs.join(", ")}`)
		} : {
			success: !0,
			value: r
		};
	} else a = n.type === "ref" ? e.getDefOrThrow(n.ref) : n;
	return i ? bp(e, t, a, r) : vp(e, t, a, r);
}
var Sp = (e, t) => {
	let n = R(t);
	return e.includes(n) ? !0 : n.endsWith("#main") ? e.includes(n.slice(0, -5)) : !n.includes("#") && e.includes(`${n}#main`);
};
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/xrpc.js
function Cp(e, t, n, r) {
	let i = Hd(r) ? r : {}, a = new Set(n.required ?? []), o = i;
	if (typeof n.properties == "object") for (let r in n.properties) {
		let s = n.properties[r], c = s.type === "array" ? yp(e, r, s, i[r]) : dp(e, r, s, i[r]), l = c.success ? c.value : i[r], u = l === void 0;
		if (u && a.has(r)) return {
			success: !1,
			error: new z(`${t} must have the property "${r}"`)
		};
		if (!u && !c.success) return c;
		l !== i[r] && (o === i && (o = { ...i }), o[r] = l);
	}
	return {
		success: !0,
		value: o
	};
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/validation.js
function wp(e, t, n) {
	let r = bp(e, "Record", t.record, n);
	if (!r.success) throw r.error;
	return r.value;
}
function Tp(e, t, n) {
	if (t.parameters) {
		let r = Cp(e, "Params", t.parameters, n);
		if (!r.success) throw r.error;
		return r.value;
	}
}
function Ep(e, t, n) {
	if (t.input?.schema) return kp(e, "Input", t.input.schema, n, !0);
}
function Dp(e, t, n) {
	if (t.output?.schema) return kp(e, "Output", t.output.schema, n, !0);
}
function Op(e, t, n) {
	if (t.message?.schema) return kp(e, "Message", t.message.schema, n, !0);
}
function kp(e, t, n, r, i = !1) {
	let a = xp(e, t, n, r, i);
	if (!a.success) throw a.error;
	return a.value;
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/lexicons.js
var Ap = class {
	constructor(e) {
		if (this.docs = /* @__PURE__ */ new Map(), this.defs = /* @__PURE__ */ new Map(), e) for (let t of e) this.add(t);
	}
	[Symbol.iterator]() {
		return this.docs.values();
	}
	add(e) {
		let t = R(e.id);
		if (this.docs.has(t)) throw Error(`${t} has already been registered`);
		Mp(e, t), this.docs.set(t, e);
		for (let [t, n] of jp(e)) this.defs.set(t, n);
	}
	remove(e) {
		e = R(e);
		let t = this.docs.get(e);
		if (!t) throw Error(`Unable to remove "${e}": does not exist`);
		for (let [e, n] of jp(t)) this.defs.delete(e);
		this.docs.delete(e);
	}
	get(e) {
		return e = R(e), this.docs.get(e);
	}
	getDef(e) {
		return e = R(e), this.defs.get(e);
	}
	getDefOrThrow(e, t) {
		let n = this.getDef(e);
		if (!n) throw new Gd(`Lexicon not found: ${e}`);
		if (t && !t.includes(n.type)) throw new Wd(`Not a ${t.join(" or ")} lexicon: ${e}`);
		return n;
	}
	validate(e, t) {
		if (!Hd(t)) throw new z("Value must be an object");
		let n = R(e), r = this.getDefOrThrow(n, ["record", "object"]);
		if (r.type === "record") return bp(this, "Record", r.record, t);
		if (r.type === "object") return bp(this, "Object", r, t);
		throw new Wd("Definition must be a record or object");
	}
	assertValidRecord(e, t) {
		if (!Hd(t)) throw new z("Record must be an object");
		if (!("$type" in t)) throw new z("Record/$type must be a string");
		let { $type: n } = t;
		if (typeof n != "string") throw new z("Record/$type must be a string");
		let r = R(e);
		if (R(n) !== r) throw new z(`Invalid $type: must be ${r}, got ${n}`);
		let i = this.getDefOrThrow(r, ["record"]);
		return wp(this, i, t);
	}
	assertValidXrpcParams(e, t) {
		e = R(e);
		let n = this.getDefOrThrow(e, [
			"query",
			"procedure",
			"subscription"
		]);
		return Tp(this, n, t);
	}
	assertValidXrpcInput(e, t) {
		e = R(e);
		let n = this.getDefOrThrow(e, ["procedure"]);
		return Ep(this, n, t);
	}
	assertValidXrpcOutput(e, t) {
		e = R(e);
		let n = this.getDefOrThrow(e, ["query", "procedure"]);
		return Dp(this, n, t);
	}
	assertValidXrpcMessage(e, t) {
		e = R(e);
		let n = this.getDefOrThrow(e, ["subscription"]);
		return Op(this, n, t);
	}
	resolveLexUri(e, t) {
		return e = R(e), R(t, e);
	}
};
function* jp(e) {
	for (let t in e.defs) yield [`lex:${e.id}#${t}`, e.defs[t]], t === "main" && (yield [`lex:${e.id}`, e.defs[t]]);
}
function Mp(e, t) {
	for (let n in e) e.type === "ref" ? e.ref = R(e.ref, t) : e.type === "union" ? e.refs = e.refs.map((e) => R(e, t)) : Array.isArray(e[n]) ? e[n] = e[n].map((e) => typeof e == "string" ? e.startsWith("#") ? R(e, t) : e : e && typeof e == "object" ? Mp(e, t) : e) : e[n] && typeof e[n] == "object" && (e[n] = Mp(e[n], t));
	return e;
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/serialize.js
var Np = (e) => {
	if (Array.isArray(e)) return e.map((e) => Np(e));
	if (e && typeof e == "object") {
		if (e instanceof Xf) return e.original;
		if (Bf.asCID(e) || e instanceof Uint8Array) return e;
		let t = {};
		for (let n of Object.keys(e)) t[n] = Np(e[n]);
		return t;
	}
	return e;
}, Pp = (e) => {
	if (Array.isArray(e)) return e.map((e) => Pp(e));
	if (e && typeof e == "object") {
		let t = e;
		if ((t.$type === "blob" || typeof t.cid == "string" && typeof t.mimeType == "string") && Qs(t, Yf)) return Xf.fromJsonRef(t);
		if (Bf.asCID(e) || e instanceof Uint8Array) return e;
		let n = {};
		for (let e of Object.keys(t)) n[e] = Pp(t[e]);
		return n;
	}
	return e;
}, Fp = (e) => Eu(Np(e)), Ip = (e) => Pp(Tu(e));
//#endregion
//#region src/core/freeze.ts
function Lp(e) {
	let t = structuredClone(e);
	function n(e) {
		e && typeof e == "object" && (Object.values(e).forEach(n), Object.freeze(e));
	}
	return n(t), t;
}
var Rp = {
	lexicon: 1,
	id: "ai.generalbusiness.atseq.definition",
	description: "Local v0 definition manifest. Bind authored Lexicons to retained source files.",
	defs: {
		main: {
			type: "object",
			required: [
				"version",
				"profile",
				"title",
				"files",
				"lexicons",
				"state",
				"actions",
				"queries",
				"views"
			],
			properties: {
				version: {
					type: "integer",
					const: 1
				},
				profile: { type: "cid-link" },
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
			required: [
				"name",
				"ref",
				"program"
			],
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
}, zp = "ai.generalbusiness.atseq", B = Lp({
	genesis: `${zp}.genesis`,
	head: `${zp}.head`,
	entry: `${zp}.entry`,
	definition: `${zp}.definition`,
	epoch: `${zp}.epoch`,
	epochCurrent: `${zp}.epochCurrent`,
	grant: `${zp}.grant`,
	revoke: `${zp}.revoke`,
	file: `${zp}.file`,
	content: `${zp}.content`,
	defs: `${zp}.defs`
}), V = (e) => `ai.generalbusiness.atseq.defs#${e}`, H = (e, t) => ({
	type: "string",
	maxLength: e,
	...t ? { format: t } : {}
}), Bp = (e, t = 0) => ({
	type: "integer",
	minimum: t,
	maximum: e
}), U = { type: "cid-link" }, W = H(2048, "did"), Vp = H(128, "did"), Hp = { type: "boolean" }, Up = (e, t = e) => ({
	type: "bytes",
	minLength: t,
	maxLength: e
}), Wp = (e) => ({
	type: "ref",
	ref: V(e)
}), Gp = (e, t, n = 0) => ({
	type: "array",
	items: e,
	maxLength: t,
	minLength: n
}), G = (e, t = []) => ({
	type: "object",
	required: Object.keys(e),
	...t.length ? { nullable: t } : {},
	properties: e
}), Kp = (...e) => ({
	type: "union",
	closed: !0,
	refs: e.map(V)
}), qp = G({
	principal: W,
	actorKey: Vp
}), Jp = H(26), Yp = H(64), Xp = G({
	action: H(300),
	execution: U
}), Zp = G({
	principal: W,
	actorKey: Vp,
	powers: Gp({
		type: "string",
		enum: [
			"certify",
			"govern",
			"recover"
		]
	}, 3, 1)
}), Qp = {
	position: Bp(2 ** 53 - 1, 1),
	prev: U,
	controlTip: U
}, $p = {
	grant: G({
		id: Jp,
		cid: U
	}),
	epoch: U
}, em = Kp("plcAudit", "webDocument"), tm = G({
	signingKeyDid: Vp,
	pdsOrigin: H(2048, "uri")
}), nm = {
	path: G({
		collection: H(317, "nsid"),
		rkey: H(512, "record-key")
	}),
	act: G({
		...$p,
		action: H(300),
		execution: U,
		payload: { type: "unknown" }
	}),
	assignRole: G({
		...$p,
		target: W,
		role: Yp,
		enabled: Hp,
		expectedAssignment: U
	}, ["expectedAssignment"]),
	setControl: G({
		...Qp,
		control: Gp(Zp, 16)
	}),
	setRecovery: G({
		...Qp,
		recovery: Gp(qp, 16, 1)
	}),
	setOwner: G({
		...Qp,
		owner: W
	}, ["owner"]),
	setRole: G({
		...Qp,
		target: W,
		role: Yp,
		enabled: Hp,
		expectedAssignment: U
	}, ["expectedAssignment"]),
	activate: G({
		...Qp,
		expected: U,
		definition: U,
		closure: Gp(H(128, "cid"), 64, 1)
	}),
	recoverParticipant: G({
		...Qp,
		target: W,
		expectedEpoch: U,
		expectedObservation: U,
		epoch: U,
		observation: U
	}, ["expectedEpoch", "expectedObservation"]),
	recoverGovernance: G({
		...Qp,
		governance: Gp(qp, 16)
	}),
	intent: G({
		version: {
			type: "integer",
			const: 2
		},
		app: W,
		genesis: U,
		principal: W,
		actorKey: Vp,
		nonce: Up(16),
		operation: Kp("act", "assignRole", "setControl", "setRecovery", "setOwner", "setRole", "activate", "recoverParticipant", "recoverGovernance")
	}),
	signedRequest: G({
		intent: Wp("intent"),
		sig: Up(64)
	}),
	admitGrant: G({ grant: G({
		id: Jp,
		cid: U
	}) }),
	advanceEpoch: G({ epoch: U }),
	revokeGrant: G({ revoke: G({
		id: Jp,
		cid: U
	}) }),
	accountOperation: G({
		app: W,
		genesis: U,
		position: Bp(2 ** 53 - 1, 1),
		prev: U,
		principal: W,
		expectedEpoch: U,
		expectedObservation: U,
		operation: Kp("admitGrant", "advanceEpoch", "revokeGrant"),
		observation: U
	}, ["expectedEpoch", "expectedObservation"]),
	receipt: G({
		version: {
			type: "integer",
			const: 2
		},
		app: W,
		genesis: U,
		request: U,
		position: Bp(2 ** 53 - 1, 1),
		entry: U,
		publication: G({
			root: U,
			binding: U,
			proofs: Gp(U, 16, 1),
			head: U
		}, ["head"])
	}),
	byteChunk: G({ bytes: Up(32768, 1) }),
	byteManifest: G({
		byteLength: Bp(33554432),
		chunks: Gp(U, 1024)
	}),
	observationPolicy: G({
		algorithm: {
			type: "string",
			const: "atseq-account-observation-v1"
		},
		plcDirectory: H(2048, "uri"),
		allowWeb: Hp,
		checkpoint: {
			type: "string",
			const: "native-publication-v1"
		}
	}),
	plcAudit: G({
		bytes: U,
		source: H(2048, "uri"),
		selectedTip: U
	}),
	webDocument: G({
		bytes: U,
		source: H(2048, "uri")
	}),
	observation: G({
		policy: U,
		principal: W,
		context: G({
			app: W,
			genesis: U,
			position: Bp(2 ** 53 - 1, 1),
			prev: U,
			subject: U
		}),
		binding: tm,
		before: em,
		after: em,
		repositoryRoot: U,
		records: Gp(G({
			path: H(1024),
			cid: U
		}), 16, 1),
		proofs: Gp(U, 16, 1),
		observedAt: H(24, "datetime")
	}),
	appBinding: G({
		policy: U,
		principal: W,
		binding: tm,
		before: em,
		after: em,
		repositoryRoot: U
	}),
	openParticipation: G({}),
	requiredRole: G({ role: Yp }),
	actionContract: G({
		semantics: U,
		schemas: G({
			stateRoot: H(300),
			actionRoot: H(300),
			closure: U
		}),
		fold: H(128, "cid"),
		authorization: Kp("openParticipation", "requiredRole")
	})
}, rm = (e, t, n = [], r) => ({
	lexicon: 1,
	id: `${zp}.${e}`,
	defs: { main: {
		type: "record",
		key: r ? `literal:${r}` : "any",
		record: G({
			version: {
				type: "integer",
				const: [
					"genesis",
					"head",
					"entry"
				].includes(e) ? 2 : 1
			},
			...t
		}, n)
	} }
}), im = {
	app: W,
	genesis: U
}, am = structuredClone(Rp);
am.defs.main = {
	type: "record",
	key: "any",
	record: am.defs.main
}, am.defs.main.record.properties.version.const = 2, am.defs.action.required.push("authorization"), am.defs.action.properties.authorization = Kp("openParticipation", "requiredRole");
var om = Lp([
	{
		lexicon: 1,
		id: B.defs,
		defs: nm
	},
	rm("genesis", {
		app: W,
		creation: Up(16),
		semantics: U,
		definition: U,
		observationPolicy: U,
		control: Gp(Zp, 16),
		recoverGovernance: Hp,
		owner: W,
		roles: Gp(G({
			principal: W,
			role: Yp
		}), 63)
	}, ["owner"]),
	rm("head", {
		...im,
		position: Bp(2 ** 53 - 1),
		entry: U
	}),
	rm("entry", {
		...im,
		position: Bp(2 ** 53 - 1, 1),
		prev: U,
		request: Kp("signedRequest", "accountOperation")
	}),
	rm("epoch", {
		id: Up(16),
		previous: U
	}, ["previous"]),
	rm("epochCurrent", {
		epoch: U,
		id: Up(16)
	}, [], "self"),
	rm("grant", {
		id: Jp,
		...im,
		epoch: U,
		actorKey: Vp,
		actions: Gp(Xp, 63),
		assignRoles: Gp(Yp, 63)
	}),
	rm("revoke", {
		id: Jp,
		...im
	}),
	rm("file", {
		cid: H(128, "cid"),
		bytes: U
	}),
	rm("content", { body: Kp("byteChunk", "byteManifest", "observationPolicy", "observation", "appBinding", "actionContract") }),
	am
]), sm = new Ap(structuredClone([...om])), cm = new Set(Object.keys(nm).map(V)), lm = (e) => e.replace(/^lex:/, "");
function um(e) {
	if (typeof e != "string" || e.length > 2048 || !(0, Zs.isAtprotoDid)(e) || e.startsWith("did:web:") && /%3a/i.test(e)) throw new m("envelope", "Expected PLC or hostname-only web account DID");
}
function dm(e, t) {
	let n = Ba(t);
	function r(e, t, n) {
		if (!e) throw new m("envelope", "Unknown native schema");
		if (e.type === "string" && e.format === "did" && e.maxLength === 2048 && um(t), e.type === "record") return r(e.record, t, n);
		if (e.type === "ref") {
			let i = lm(e.ref);
			return r(sm.getDef(e.ref), t, n ?? (cm.has(i) ? i : void 0));
		}
		if (e.type === "union") {
			if (!t || !e.refs.map(lm).includes(t.$type)) throw new m("envelope", "Unknown native union member");
			return r(sm.getDef(t.$type), t, t.$type);
		}
		if (e.type === "object") {
			if (!t || typeof t != "object" || Array.isArray(t)) throw new m("envelope", "Expected native object");
			if (n && t.$type !== n) throw new m("envelope", `Expected ${n}`);
			for (let [i, a] of Object.entries(t)) if (!(i === "$type" && n)) {
				if (!Object.hasOwn(e.properties, i)) throw new m("envelope", `Unknown native field ${i}`);
				a === null && e.nullable?.includes(i) || r(e.properties[i], a);
			}
		} else e.type === "array" && Array.isArray(t) && t.forEach((t) => r(e.items, t));
	}
	r(sm.getDef(e), t, e);
	let i = sm.validate(e, Ip(t));
	if (!i.success) throw new m("envelope", i.error.message);
	if (!Ia(n, Ba(Fp(i.value)))) throw new m("envelope", "Native validation changed content");
}
//#endregion
//#region src/protocol/native-outcome.ts
var fm = Object.freeze(/* @__PURE__ */ "authority_stale.authority_unchanged.control_context_stale.control_map_limit.control_power.control_tip_stale.control_unappointed.control_unchanged.definition_changed.epoch_conflict.epoch_reused.execution_changed.grant_conflict.grant_epoch.grant_revoked.grant_scope.grant_signer.grant_unadmitted.incompatible_definition.invalid_action.invalid_activation.observation_conflict.observation_rollback.recovery_epoch_reused.role_missing.role_owner.role_scope.role_stale.role_unchanged.unknown_action".split(".")), pm = Object.freeze([
	"absent_result",
	"engine_input",
	"evaluation_depth",
	"fold_message",
	"fold_output",
	"inspection_budget",
	"reserved_key",
	"schema_coercion",
	"schema_value",
	"sequence_limit",
	"step_budget",
	"sum_overflow",
	"unicode",
	"value_bytes",
	"value_depth",
	"wire_number",
	"wire_value"
]), mm = /* @__PURE__ */ new Set([...fm, ...pm.map((e) => `fold_failed/${e}`)]);
function hm(e) {
	throw new m("envelope", e);
}
function gm(e, t) {
	(!e || typeof e != "object" || Array.isArray(e) || Object.keys(e).length !== t.length || t.some((t) => !Object.hasOwn(e, t))) && hm("Unknown or missing outcome fields");
}
function _m(e) {
	let t = JSON.parse(y(e, 131072, 32));
	return t?.decision === "effective" ? gm(t, ["decision"]) : t?.decision === "ineffective" && t.source === "framework" ? (gm(t, [
		"decision",
		"source",
		"reason"
	]), (typeof t.reason != "string" || !mm.has(t.reason)) && hm("Unsupported framework outcome reason")) : t?.decision === "ineffective" && t.source === "fold" ? (gm(t, Object.hasOwn(t, "message") ? [
		"decision",
		"source",
		"reason",
		"message"
	] : [
		"decision",
		"source",
		"reason"
	]), (typeof t.reason != "string" || !/^[a-z][a-z0-9_]{0,63}$/.test(t.reason)) && hm("Invalid authored fold reason"), Object.hasOwn(t, "message") && (typeof t.message != "string" || !t.message.isWellFormed() || [...t.message].length > 1024 || new TextEncoder().encode(t.message).length > 4096) && hm("Invalid authored fold message")) : hm("Unsupported outcome branch"), t;
}
//#endregion
//#region node_modules/jsonc-parser/lib/esm/impl/scanner.js
function vm(e, t = !1) {
	let n = e.length, r = 0, i = "", a = 0, o = 16, s = 0, c = 0, l = 0, u = 0, d = 0;
	function f(t, n) {
		let i = 0, a = 0;
		for (; i < t || !n;) {
			let t = e.charCodeAt(r);
			if (t >= 48 && t <= 57) a = a * 16 + t - 48;
			else if (t >= 65 && t <= 70) a = a * 16 + t - 65 + 10;
			else if (t >= 97 && t <= 102) a = a * 16 + t - 97 + 10;
			else break;
			r++, i++;
		}
		return i < t && (a = -1), a;
	}
	function p(e) {
		r = e, i = "", a = 0, o = 16, d = 0;
	}
	function m() {
		let t = r;
		if (e.charCodeAt(r) === 48) r++;
		else for (r++; r < e.length && xm(e.charCodeAt(r));) r++;
		if (r < e.length && e.charCodeAt(r) === 46) {
			if (r++, r < e.length && xm(e.charCodeAt(r))) for (r++; r < e.length && xm(e.charCodeAt(r));) r++;
			else return d = 3, e.substring(t, r);
		}
		let n = r;
		if (r < e.length && (e.charCodeAt(r) === 69 || e.charCodeAt(r) === 101)) {
			if (r++, (r < e.length && e.charCodeAt(r) === 43 || e.charCodeAt(r) === 45) && r++, r < e.length && xm(e.charCodeAt(r))) {
				for (r++; r < e.length && xm(e.charCodeAt(r));) r++;
				n = r;
			} else d = 3;
		}
		return e.substring(t, n);
	}
	function h() {
		let t = "", i = r;
		for (;;) {
			if (r >= n) {
				t += e.substring(i, r), d = 2;
				break;
			}
			let a = e.charCodeAt(r);
			if (a === 34) {
				t += e.substring(i, r), r++;
				break;
			}
			if (a === 92) {
				if (t += e.substring(i, r), r++, r >= n) {
					d = 2;
					break;
				}
				switch (e.charCodeAt(r++)) {
					case 34:
						t += "\"";
						break;
					case 92:
						t += "\\";
						break;
					case 47:
						t += "/";
						break;
					case 98:
						t += "\b";
						break;
					case 102:
						t += "\f";
						break;
					case 110:
						t += "\n";
						break;
					case 114:
						t += "\r";
						break;
					case 116:
						t += "	";
						break;
					case 117:
						let e = f(4, !0);
						e >= 0 ? t += String.fromCharCode(e) : d = 4;
						break;
					default: d = 5;
				}
				i = r;
				continue;
			}
			if (a >= 0 && a <= 31) {
				if (bm(a)) {
					t += e.substring(i, r), d = 2;
					break;
				}
				d = 6;
			}
			r++;
		}
		return t;
	}
	function g() {
		if (i = "", d = 0, a = r, c = s, u = l, r >= n) return a = n, o = 17;
		let t = e.charCodeAt(r);
		if (ym(t)) {
			do
				r++, i += String.fromCharCode(t), t = e.charCodeAt(r);
			while (ym(t));
			return o = 15;
		}
		if (bm(t)) return r++, i += String.fromCharCode(t), t === 13 && e.charCodeAt(r) === 10 && (r++, i += "\n"), s++, l = r, o = 14;
		switch (t) {
			case 123: return r++, o = 1;
			case 125: return r++, o = 2;
			case 91: return r++, o = 3;
			case 93: return r++, o = 4;
			case 58: return r++, o = 6;
			case 44: return r++, o = 5;
			case 34: return r++, i = h(), o = 10;
			case 47:
				let c = r - 1;
				if (e.charCodeAt(r + 1) === 47) {
					for (r += 2; r < n && !bm(e.charCodeAt(r));) r++;
					return i = e.substring(c, r), o = 12;
				}
				if (e.charCodeAt(r + 1) === 42) {
					r += 2;
					let t = n - 1, a = !1;
					for (; r < t;) {
						let t = e.charCodeAt(r);
						if (t === 42 && e.charCodeAt(r + 1) === 47) {
							r += 2, a = !0;
							break;
						}
						r++, bm(t) && (t === 13 && e.charCodeAt(r) === 10 && r++, s++, l = r);
					}
					return a || (r++, d = 1), i = e.substring(c, r), o = 13;
				}
				return i += String.fromCharCode(t), r++, o = 16;
			case 45: if (i += String.fromCharCode(t), r++, r === n || !xm(e.charCodeAt(r))) return o = 16;
			case 48:
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57: return i += m(), o = 11;
			default:
				for (; r < n && _(t);) r++, t = e.charCodeAt(r);
				if (a !== r) {
					switch (i = e.substring(a, r), i) {
						case "true": return o = 8;
						case "false": return o = 9;
						case "null": return o = 7;
					}
					return o = 16;
				}
				return i += String.fromCharCode(t), r++, o = 16;
		}
	}
	function _(e) {
		if (ym(e) || bm(e)) return !1;
		switch (e) {
			case 125:
			case 93:
			case 123:
			case 91:
			case 34:
			case 58:
			case 44:
			case 47: return !1;
		}
		return !0;
	}
	function v() {
		let e;
		do
			e = g();
		while (e >= 12 && e <= 15);
		return e;
	}
	return {
		setPosition: p,
		getPosition: () => r,
		scan: t ? v : g,
		getToken: () => o,
		getTokenValue: () => i,
		getTokenOffset: () => a,
		getTokenLength: () => r - a,
		getTokenStartLine: () => c,
		getTokenStartCharacter: () => a - u,
		getTokenError: () => d
	};
}
function ym(e) {
	return e === 32 || e === 9;
}
function bm(e) {
	return e === 10 || e === 13;
}
function xm(e) {
	return e >= 48 && e <= 57;
}
var Sm;
(function(e) {
	e[e.lineFeed = 10] = "lineFeed", e[e.carriageReturn = 13] = "carriageReturn", e[e.space = 32] = "space", e[e._0 = 48] = "_0", e[e._1 = 49] = "_1", e[e._2 = 50] = "_2", e[e._3 = 51] = "_3", e[e._4 = 52] = "_4", e[e._5 = 53] = "_5", e[e._6 = 54] = "_6", e[e._7 = 55] = "_7", e[e._8 = 56] = "_8", e[e._9 = 57] = "_9", e[e.a = 97] = "a", e[e.b = 98] = "b", e[e.c = 99] = "c", e[e.d = 100] = "d", e[e.e = 101] = "e", e[e.f = 102] = "f", e[e.g = 103] = "g", e[e.h = 104] = "h", e[e.i = 105] = "i", e[e.j = 106] = "j", e[e.k = 107] = "k", e[e.l = 108] = "l", e[e.m = 109] = "m", e[e.n = 110] = "n", e[e.o = 111] = "o", e[e.p = 112] = "p", e[e.q = 113] = "q", e[e.r = 114] = "r", e[e.s = 115] = "s", e[e.t = 116] = "t", e[e.u = 117] = "u", e[e.v = 118] = "v", e[e.w = 119] = "w", e[e.x = 120] = "x", e[e.y = 121] = "y", e[e.z = 122] = "z", e[e.A = 65] = "A", e[e.B = 66] = "B", e[e.C = 67] = "C", e[e.D = 68] = "D", e[e.E = 69] = "E", e[e.F = 70] = "F", e[e.G = 71] = "G", e[e.H = 72] = "H", e[e.I = 73] = "I", e[e.J = 74] = "J", e[e.K = 75] = "K", e[e.L = 76] = "L", e[e.M = 77] = "M", e[e.N = 78] = "N", e[e.O = 79] = "O", e[e.P = 80] = "P", e[e.Q = 81] = "Q", e[e.R = 82] = "R", e[e.S = 83] = "S", e[e.T = 84] = "T", e[e.U = 85] = "U", e[e.V = 86] = "V", e[e.W = 87] = "W", e[e.X = 88] = "X", e[e.Y = 89] = "Y", e[e.Z = 90] = "Z", e[e.asterisk = 42] = "asterisk", e[e.backslash = 92] = "backslash", e[e.closeBrace = 125] = "closeBrace", e[e.closeBracket = 93] = "closeBracket", e[e.colon = 58] = "colon", e[e.comma = 44] = "comma", e[e.dot = 46] = "dot", e[e.doubleQuote = 34] = "doubleQuote", e[e.minus = 45] = "minus", e[e.openBrace = 123] = "openBrace", e[e.openBracket = 91] = "openBracket", e[e.plus = 43] = "plus", e[e.slash = 47] = "slash", e[e.formFeed = 12] = "formFeed", e[e.tab = 9] = "tab";
})(Sm ||= {}), Array(20).fill(0).map((e, t) => " ".repeat(t));
var Cm = 200;
Array(Cm).fill(0).map((e, t) => "\n" + " ".repeat(t)), Array(Cm).fill(0).map((e, t) => "\r" + " ".repeat(t)), Array(Cm).fill(0).map((e, t) => "\r\n" + " ".repeat(t)), Array(Cm).fill(0).map((e, t) => "\n" + "	".repeat(t)), Array(Cm).fill(0).map((e, t) => "\r" + "	".repeat(t)), Array(Cm).fill(0).map((e, t) => "\r\n" + "	".repeat(t));
//#endregion
//#region node_modules/jsonc-parser/lib/esm/impl/parser.js
var wm;
(function(e) {
	e.DEFAULT = { allowTrailingComma: !1 };
})(wm ||= {});
function Tm(e, t, n = wm.DEFAULT) {
	let r = vm(e, !1), i = [], a = 0;
	function o(e) {
		return e ? () => a === 0 && e(r.getTokenOffset(), r.getTokenLength(), r.getTokenStartLine(), r.getTokenStartCharacter()) : () => !0;
	}
	function s(e) {
		return e ? (t) => a === 0 && e(t, r.getTokenOffset(), r.getTokenLength(), r.getTokenStartLine(), r.getTokenStartCharacter()) : () => !0;
	}
	function c(e) {
		return e ? (t) => a === 0 && e(t, r.getTokenOffset(), r.getTokenLength(), r.getTokenStartLine(), r.getTokenStartCharacter(), () => i.slice()) : () => !0;
	}
	function l(e) {
		return e ? () => {
			a > 0 ? a++ : e(r.getTokenOffset(), r.getTokenLength(), r.getTokenStartLine(), r.getTokenStartCharacter(), () => i.slice()) === !1 && (a = 1);
		} : () => !0;
	}
	function u(e) {
		return e ? () => {
			a > 0 && a--, a === 0 && e(r.getTokenOffset(), r.getTokenLength(), r.getTokenStartLine(), r.getTokenStartCharacter());
		} : () => !0;
	}
	let d = l(t.onObjectBegin), f = c(t.onObjectProperty), p = u(t.onObjectEnd), m = l(t.onArrayBegin), h = u(t.onArrayEnd), g = c(t.onLiteralValue), _ = s(t.onSeparator), v = o(t.onComment), y = s(t.onError), ee = n && n.disallowComments, te = n && n.allowTrailingComma;
	function ne() {
		for (;;) {
			let e = r.scan();
			switch (r.getTokenError()) {
				case 4:
					b(14);
					break;
				case 5:
					b(15);
					break;
				case 3:
					b(13);
					break;
				case 1:
					ee || b(11);
					break;
				case 2:
					b(12);
					break;
				case 6: b(16);
			}
			switch (e) {
				case 12:
				case 13:
					ee ? b(10) : v();
					break;
				case 16:
					b(1);
					break;
				case 15:
				case 14: break;
				default: return e;
			}
		}
	}
	function b(e, t = [], n = []) {
		if (y(e), t.length + n.length > 0) {
			let e = r.getToken();
			for (; e !== 17;) {
				if (t.indexOf(e) !== -1) {
					ne();
					break;
				}
				if (n.indexOf(e) !== -1) break;
				e = ne();
			}
		}
	}
	function re(e) {
		let t = r.getTokenValue();
		return e ? g(t) : (f(t), i.push(t)), ne(), !0;
	}
	function ie() {
		switch (r.getToken()) {
			case 11:
				let e = r.getTokenValue(), t = Number(e);
				isNaN(t) && (b(2), t = 0), g(t);
				break;
			case 7:
				g(null);
				break;
			case 8:
				g(!0);
				break;
			case 9:
				g(!1);
				break;
			default: return !1;
		}
		return ne(), !0;
	}
	function ae() {
		return r.getToken() === 10 ? (re(!1), r.getToken() === 6 ? (_(":"), ne(), ce() || b(4, [], [2, 5])) : b(5, [], [2, 5]), i.pop(), !0) : (b(3, [], [2, 5]), !1);
	}
	function oe() {
		d(), ne();
		let e = !1;
		for (; r.getToken() !== 2 && r.getToken() !== 17;) {
			if (r.getToken() === 5) {
				if (e || b(4, [], []), _(","), ne(), r.getToken() === 2 && te) break;
			} else e && b(6, [], []);
			ae() || b(4, [], [2, 5]), e = !0;
		}
		return p(), r.getToken() === 2 ? ne() : b(7, [2], []), !0;
	}
	function se() {
		m(), ne();
		let e = !0, t = !1;
		for (; r.getToken() !== 4 && r.getToken() !== 17;) {
			if (r.getToken() === 5) {
				if (t || b(4, [], []), _(","), ne(), r.getToken() === 4 && te) break;
			} else t && b(6, [], []);
			e ? (i.push(0), e = !1) : i[i.length - 1]++, ce() || b(4, [], [4, 5]), t = !0;
		}
		return h(), e || i.pop(), r.getToken() === 4 ? ne() : b(8, [4], []), !0;
	}
	function ce() {
		switch (r.getToken()) {
			case 3: return se();
			case 1: return oe();
			case 10: return re(!0);
			default: return ie();
		}
	}
	return ne(), r.getToken() === 17 ? n.allowEmptyContent ? !0 : (b(4, [], []), !1) : ce() ? (r.getToken() !== 17 && b(9, [], []), !0) : (b(4, [], []), !1);
}
//#endregion
//#region node_modules/jsonc-parser/lib/esm/main.js
var Em;
(function(e) {
	e[e.None = 0] = "None", e[e.UnexpectedEndOfComment = 1] = "UnexpectedEndOfComment", e[e.UnexpectedEndOfString = 2] = "UnexpectedEndOfString", e[e.UnexpectedEndOfNumber = 3] = "UnexpectedEndOfNumber", e[e.InvalidUnicode = 4] = "InvalidUnicode", e[e.InvalidEscapeCharacter = 5] = "InvalidEscapeCharacter", e[e.InvalidCharacter = 6] = "InvalidCharacter";
})(Em ||= {});
var Dm;
(function(e) {
	e[e.OpenBraceToken = 1] = "OpenBraceToken", e[e.CloseBraceToken = 2] = "CloseBraceToken", e[e.OpenBracketToken = 3] = "OpenBracketToken", e[e.CloseBracketToken = 4] = "CloseBracketToken", e[e.CommaToken = 5] = "CommaToken", e[e.ColonToken = 6] = "ColonToken", e[e.NullKeyword = 7] = "NullKeyword", e[e.TrueKeyword = 8] = "TrueKeyword", e[e.FalseKeyword = 9] = "FalseKeyword", e[e.StringLiteral = 10] = "StringLiteral", e[e.NumericLiteral = 11] = "NumericLiteral", e[e.LineCommentTrivia = 12] = "LineCommentTrivia", e[e.BlockCommentTrivia = 13] = "BlockCommentTrivia", e[e.LineBreakTrivia = 14] = "LineBreakTrivia", e[e.Trivia = 15] = "Trivia", e[e.Unknown = 16] = "Unknown", e[e.EOF = 17] = "EOF";
})(Dm ||= {});
var Om = Tm, km;
(function(e) {
	e[e.InvalidSymbol = 1] = "InvalidSymbol", e[e.InvalidNumberFormat = 2] = "InvalidNumberFormat", e[e.PropertyNameExpected = 3] = "PropertyNameExpected", e[e.ValueExpected = 4] = "ValueExpected", e[e.ColonExpected = 5] = "ColonExpected", e[e.CommaExpected = 6] = "CommaExpected", e[e.CloseBraceExpected = 7] = "CloseBraceExpected", e[e.CloseBracketExpected = 8] = "CloseBracketExpected", e[e.EndOfFileExpected = 9] = "EndOfFileExpected", e[e.InvalidCommentToken = 10] = "InvalidCommentToken", e[e.UnexpectedEndOfComment = 11] = "UnexpectedEndOfComment", e[e.UnexpectedEndOfString = 12] = "UnexpectedEndOfString", e[e.UnexpectedEndOfNumber = 13] = "UnexpectedEndOfNumber", e[e.InvalidUnicode = 14] = "InvalidUnicode", e[e.InvalidEscapeCharacter = 15] = "InvalidEscapeCharacter", e[e.InvalidCharacter = 16] = "InvalidCharacter";
})(km ||= {});
//#endregion
//#region src/protocol/strict-json.ts
var Am = class extends Error {
	reason;
	constructor(e, t) {
		super(t), this.reason = e, this.name = "StrictJsonError";
	}
};
function jm(e, t) {
	throw new Am(e, t);
}
function Mm(e, t, n = 32) {
	(!Number.isSafeInteger(t) || t < 1 || !Number.isSafeInteger(n) || n < 1) && jm("input", "Invalid JSON parsing budget"), e instanceof Uint8Array || jm("input", "Expected retained JSON bytes"), e.length > t && jm("bytes", "JSON exceeds byte budget"), e[0] === 239 && e[1] === 187 && e[2] === 191 && jm("bom", "JSON must not begin with a BOM");
	let r;
	try {
		r = new TextDecoder("utf-8", { fatal: !0 }).decode(e);
	} catch (e) {
		throw e instanceof TypeError && jm("utf8", "JSON is not valid UTF-8"), e;
	}
	let i = [];
	function a(e) {
		i.length >= n && jm("depth", "JSON exceeds nesting budget"), i.push(e);
	}
	Om(r, {
		onObjectBegin: () => a(/* @__PURE__ */ new Set()),
		onArrayBegin: () => a(null),
		onObjectProperty: (e) => {
			let t = i.at(-1);
			(!t || t.has(e)) && jm("duplicate", "Duplicate decoded JSON property"), t.add(e);
		},
		onObjectEnd: () => {
			i.pop();
		},
		onArrayEnd: () => {
			i.pop();
		},
		onError: () => jm("syntax", "Expected strict JSON")
	}, {
		disallowComments: !0,
		allowTrailingComma: !1,
		allowEmptyContent: !1
	});
	try {
		return JSON.parse(r);
	} catch (e) {
		throw e instanceof SyntaxError && jm("syntax", "Expected strict JSON"), e;
	}
}
//#endregion
//#region node_modules/@noble/secp256k1/index.js
var Nm = Object.freeze, Pm = 115792089237316195423570985008687907853269984665640564039457584007908834671663n, Fm = 115792089237316195423570985008687907852837564279074904382605163141518161494337n, Im = 55066263022277343669578718895168534326250603453777594175500187360389116729240n, Lm = 32670510020758816978083085130507043184471273380659243275938904335757337482424n, Rm = Nm({
	p: Pm,
	n: Fm,
	h: 1n,
	a: 0n,
	b: 7n,
	Gx: Im,
	Gy: Lm
}), zm = (e) => e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && e.BYTES_PER_ELEMENT === 1, Bm = (e, t, n = "") => {
	if (zm(e) && (t === void 0 || e.length === t)) return e;
	let r = zm(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = (n ? `"${n}" ` : "") + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}, Vm = (e, t) => e.toString(16).padStart(t, "0"), Hm = (e) => {
	let t = "";
	for (let n of Bm(e)) t += Vm(n, 2);
	return t;
}, Um = (e) => {
	let t = "hex invalid";
	if (typeof e != "string") throw TypeError(t);
	if (e.length % 2 || !/^[\da-f]*$/i.test(e)) throw RangeError(t);
	let n = new Uint8Array(e.length / 2);
	for (let t = 0, r = 0; t < n.length; t++, r += 2) {
		let i = e.charCodeAt(r), a = e.charCodeAt(r + 1);
		n[t] = ((i & 15) + (i >> 6) * 9) * 16 + (a & 15) + (a >> 6) * 9;
	}
	return n;
}, Wm = (...e) => {
	let t = 0;
	for (let n of e) t += Bm(n).length;
	let n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(t, r), r += t.length;
	return n;
}, Gm = BigInt, Km = (e, t, n, r = "bad number: out of range") => {
	if (typeof e != "bigint") throw TypeError(r);
	if (t <= e && e < n) return e;
	throw RangeError(r);
}, K = (e, t = Pm) => (e %= t) >= 0n ? e : t + e, qm = (e, t) => {
	if (e === 0n) throw Error("invert: expected non-zero number");
	if (t <= 1n) throw Error("invert: expected modulus > 1, got " + t);
	let n = K(e, t), r = t, i = 0n, a = 1n;
	for (; n !== 0n;) {
		let e = r / n, t = r - n * e, o = i - a * e;
		r = n, n = t, i = a, a = o;
	}
	if (r !== 1n) throw Error("invert: does not exist");
	return K(i, t);
}, Jm = (e) => {
	if (e instanceof rh) return e;
	throw TypeError("Point expected");
}, Ym = "bad point: not on curve", Xm = (e) => K(K(e * e) * e + 7n), Zm = (e) => Km(e, 0n, Pm), Qm = (e) => Km(e, 1n, Pm), $m = (e) => Km(e, 1n, Fm), eh = (e) => !(e & 1n), th = (e) => Uint8Array.of(eh(e) ? 2 : 3), nh = (e) => {
	let t = Xm(Qm(e)), n = 1n;
	for (let e = t, r = 115792089237316195423570985008687907853269984665640564039457584007908834671664n / 4n; r > 0n; r >>= 1n) r & 1n && (n = n * e % Pm), e = e * e % Pm;
	if (K(n * n) !== t) throw Error("sqrt invalid");
	return new rh(e, eh(n) ? n : K(-n), 1n);
}, rh = class e {
	static BASE;
	static ZERO;
	X;
	Y;
	Z;
	constructor(e, t, n) {
		this.X = Zm(e), this.Y = Qm(t), this.Z = Zm(n), Nm(this);
	}
	static CURVE() {
		return Rm;
	}
	static fromAffine(t) {
		let { x: n, y: r } = t;
		return n === 0n && r === 0n ? ah : new e(n, r, 1n);
	}
	static fromBytes(t) {
		Bm(t);
		let n = t.length, r = t[0], i = sh(t, 1, 33);
		try {
			if (n === 33 && (r === 2 || r === 3)) {
				let e = nh(i);
				return r === 3 ? e.negate() : e;
			}
			if (n === 65 && r === 4) return new e(i, sh(t, 33, 65), 1n).assertValidity();
		} catch {
			throw Error(Ym);
		}
		throw Error(Ym);
	}
	static fromHex(t) {
		return e.fromBytes(Um(t));
	}
	get x() {
		return this.toAffine().x;
	}
	get y() {
		return this.toAffine().y;
	}
	equals(e) {
		let { X: t, Y: n, Z: r } = this, { X: i, Y: a, Z: o } = Jm(e);
		return K(t * o) === K(i * r) && K(n * o) === K(a * r);
	}
	is0() {
		return this.Z === 0n;
	}
	negate() {
		return new e(this.X, K(-this.Y), this.Z);
	}
	double() {
		return this.add(this);
	}
	add(t) {
		let { X: n, Y: r, Z: i } = this, { X: a, Y: o, Z: s } = Jm(t), c = 0n, l = 0n, u = 0n, d = 0n, f = K(7n * 3n), p = K(n * a), m = K(r * o), h = K(i * s), g = K(n + r), _ = K(a + o);
		g = K(g * _), _ = K(p + m), g = K(g - _), _ = K(n + i);
		let v = K(a + s);
		return _ = K(_ * v), v = K(p + h), _ = K(_ - v), v = K(r + i), l = K(o + s), v = K(v * l), l = K(m + h), v = K(v - l), d = K(c * _), l = K(f * h), d = K(l + d), l = K(m - d), d = K(m + d), u = K(l * d), m = K(p + p), m = K(m + p), h = K(c * h), _ = K(f * _), m = K(m + h), h = K(p - h), h = K(c * h), _ = K(_ + h), p = K(m * _), u = K(u + p), p = K(v * _), l = K(g * l), l = K(l - p), p = K(g * m), d = K(v * d), d = K(d + p), new e(l, u, d);
	}
	subtract(e) {
		return this.add(Jm(e).negate());
	}
	multiply(e, t = !0) {
		if (!t && e === 0n) return ah;
		if ($m(e), e === 1n) return this;
		if (this.equals(ih)) return fh(e).p;
		let n = ah, r = ih, i = this;
		for (let a = 0; t ? a < 256 : e > 0n; a++) e & 1n ? n = n.add(i) : t && (r = r.add(i)), i = i.double(), e >>= 1n;
		return n;
	}
	multiplyUnsafe(e) {
		return this.multiply(e, !1);
	}
	toAffine() {
		let { X: e, Y: t, Z: n } = this;
		if (n === 0n) return {
			x: 0n,
			y: 0n
		};
		if (n === 1n) return {
			x: e,
			y: t
		};
		let r = qm(n, Pm);
		if (K(n * r) !== 1n) throw Error("inverse invalid");
		return {
			x: K(e * r),
			y: K(t * r)
		};
	}
	assertValidity() {
		let { x: e, y: t } = this.toAffine();
		if (Qm(e), Qm(t), K(t * t) !== Xm(e)) throw Error(Ym);
		return this;
	}
	toBytes(e = !0) {
		let { x: t, y: n } = this.assertValidity().toAffine(), r = ch(t);
		return e ? Wm(th(n), r) : Wm(Uint8Array.of(4), r, ch(n));
	}
	toHex(e) {
		return Hm(this.toBytes(e));
	}
}, ih = new rh(Im, Lm, 1n), ah = new rh(0n, 1n, 0n);
rh.BASE = ih, rh.ZERO = ah;
var oh = (e) => Gm("0x" + (Hm(e) || "0")), sh = (e, t, n) => oh(e.subarray(t, n)), ch = (e) => Um(Vm(Km(e, 0n, 2n ** 256n), 64)), lh = () => {
	let e = [], t = ih, n = t;
	for (let r = 0; r < 33; r++) {
		n = t, e.push(n);
		for (let r = 1; r < 128; r++) n = n.add(t), e.push(n);
		t = n.double();
	}
	return e;
}, uh = void 0, dh = (e, t) => {
	let n = t.negate();
	return e ? n : t;
}, fh = (e) => {
	let t = uh ||= lh(), n = ah, r = ih;
	for (let i = 0; i < 33; i++) {
		let a = Number(e & 255n);
		e >>= 8n, a > 128 && (a -= 256, e += 1n);
		let o = i * 128, s = o + Math.abs(a) - 1, c = i % 2 != 0, l = a < 0;
		a === 0 ? r = r.add(dh(c, t[o])) : n = n.add(dh(l, t[s]));
	}
	if (e !== 0n) throw Error("invalid wnaf");
	return {
		p: n,
		f: r
	};
}, ph = (e) => {
	let t, n = 0n;
	for (let r = 1; r <= (t = e.length) >> 1; r++) n |= BigInt(e[t - r]) << BigInt(8 * (r - 1));
	return n;
}, mh = (e, t) => ph(e) <= t >> 1n, hh = (e) => e[0] === 2 || e[0] === 3, gh = (e) => e[0] === 4, _h = (e) => {
	yh(gh(e), "not an uncompressed point");
	let t = e.length - 1, n = t >> 1, r = e.slice(0, n + 1);
	return r[0] = 2 + (e[t] & 1), r;
};
new Uint8Array([
	98,
	110,
	117,
	121,
	32,
	114,
	32,
	113,
	116,
	32,
	58,
	51
]);
var vh = (e, t) => `z${Ke(ce([e, t]))}`, yh = (e, t) => {
	if (!e) throw TypeError(t);
}, bh = (e, t) => {
	if (!e) throw SyntaxError(t);
}, xh = (e, t) => {
	throw Error(t);
}, Sh = 115792089210356248762697446949407573530086143415290314195533631308867097853951n, Ch = 115792089210356248762697446949407573530086143415290314195533631308867097853948n, wh = 41058363725152142129326129780047268409114441015993725554835256314039467401291n, Th = 115792089210356248762697446949407573530086143415290314195533631308867097853952n / 4n, Eh = (e) => e.reduce((t, n, r) => t + (BigInt(n) << BigInt(8 * (e.length - r - 1))), 0n), Dh = (e, t) => Uint8Array.from(Array.from({ length: t }, (n, r) => Number(BigInt.asUintN(8, e >> BigInt((t - r - 1) * 8))))), Oh = (e, t) => (e = e * e % t, e = e * e % t, e = e * e % t, e = e * e % t, e), kh = (e, t, n) => {
	let r = [1n];
	for (let t = 0; t < 15; t++) r.push(r[t] * e % n);
	return Array.from(t.toString(16)).reduce((e, t) => Oh(e, n) * r[parseInt(t, 16)] % n, 1n);
}, Ah = (e) => {
	yh(hh(e), "not a compressed point"), yh(e.length === 33, "invalid compressed point length");
	let t = Eh(e.subarray(1)), n = (t ** 3n + Ch * t + wh) % Sh, r = kh(n, Th, Sh);
	yh(r * r % Sh === n, "invalid curve point"), (e[0] ^ Number(BigInt.asUintN(1, r))) & 1 && (r = Sh - r);
	let i = /* @__PURE__ */ new Uint8Array(65);
	return i[0] = 4, i.set(Dh(t, 32), 1), i.set(Dh(r, 32), 33), i;
}, jh = Uint8Array.from([128, 36]);
Uint8Array.from([134, 38]);
var Mh = {
	name: "ECDSA",
	namedCurve: "P-256",
	hash: "SHA-256"
}, Nh, Ph = async (e, t, n) => {
	if (Nh === !0 || gh(e)) return crypto.subtle.importKey("raw", e, Mh, t, n);
	if (Nh === !1) return crypto.subtle.importKey("raw", Ah(e), Mh, t, n);
	try {
		let r = await crypto.subtle.importKey("raw", e, Mh, t, n);
		return Nh = !0, r;
	} catch {
		let r = await crypto.subtle.importKey("raw", Ah(e), Mh, t, n);
		return Nh = !1, r;
	}
}, Fh = Uint8Array.from([
	48,
	19,
	6,
	7,
	42,
	134,
	72,
	206,
	61,
	2,
	1,
	6,
	8,
	42,
	134,
	72,
	206,
	61,
	3,
	1,
	7
]);
Uint8Array.from([
	48,
	65,
	2,
	1,
	0,
	...Fh,
	4,
	39,
	48,
	37,
	2,
	1,
	1,
	4,
	32
]);
var Ih = class e {
	type = "p256";
	jwtAlg = "ES256";
	_publicKey;
	constructor(e) {
		this._publicKey = e;
	}
	static async importRaw(t) {
		let n = await Ph(t, !0, ["verify"]);
		return new e(n);
	}
	static async importCryptoKey(t) {
		return yh(t.algorithm.namedCurve === "P-256", "not an ECDSA P-256 key"), yh(t.type === "public", "not a public key"), yh(t.extractable, "key must be extractable"), new e(t);
	}
	async verify(e, t, n) {
		return e.length !== 64 || !n?.allowMalleableSig && !mh(e, 115792089210356248762697446949407573529996955224135760342422259061068512044369n) ? !1 : await crypto.subtle.verify(Mh, this._publicKey, e, t);
	}
	async exportPublicKey(e) {
		if (e === "jwk") return await crypto.subtle.exportKey("jwk", this._publicKey);
		let t = await crypto.subtle.exportKey("raw", this._publicKey), n = _h(new Uint8Array(t));
		switch (e) {
			case "did": return `did:key:${vh(jh, n)}`;
			case "multikey": return vh(jh, n);
			case "raw": return n;
			case "rawHex": return xe(n);
		}
		xh(e, `unknown "${e}" export format`);
	}
}, Lh = (e) => (bh(e.length >= 2 && e[0] === "z", "not a multibase base58btc string"), Ge(e.slice(1))), Rh = (e) => (bh(e.length >= 9 && e.startsWith("did:key:"), "not a did:key"), zh(e.slice(8))), zh = (e) => {
	let t = Lh(e);
	bh(t.length >= 3, "multikey too short");
	let n = t[0] << 8 | t[1], r = t.subarray(2);
	switch (n) {
		case 32804: return {
			type: "p256",
			jwtAlg: "ES256",
			publicKeyBytes: r
		};
		case 59137: return {
			type: "secp256k1",
			jwtAlg: "ES256K",
			publicKeyBytes: r
		};
	}
	yh(!1, `unsupported key type (0x${n.toString(16).padStart(4, "0")})`);
};
Object.freeze({
	carBytes: 33554432,
	blockBytes: 1048576,
	carBlocks: 1e5,
	headerBytes: 16384,
	nodeEntries: 4096,
	pathLoads: 64,
	treeLoads: 1e5,
	pathCharacters: 1024,
	depth: 64
}), Object.freeze({
	bytes: 16777216,
	blocks: 5e4
}), Object.freeze({
	bytes: 134217728,
	blocks: 4e5
});
function Bh(e) {
	throw new m("input", e);
}
async function Vh(e) {
	Na();
	let { type: t } = e;
	(!(e.publicKeyBytes instanceof Uint8Array) || ![33, 65].includes(e.publicKeyBytes.length)) && Bh("Invalid repository public key size");
	let n = new Uint8Array(e.publicKeyBytes);
	if ((![33, 65].includes(n.length) || (n.length === 33 ? ![2, 3].includes(n[0]) : n[0] !== 4)) && Bh("Invalid repository public key encoding"), t === "secp256k1") {
		let e = rh.fromBytes(n).assertValidity().toBytes(!0);
		return `did:key:z${Ke(new Uint8Array([
			231,
			1,
			...e
		]))}`;
	}
	return t === "p256" ? (await Ih.importRaw(n)).exportPublicKey("did") : Bh("Unsupported repository public key type");
}
//#endregion
//#region src/protocol/native-wire.ts
function q(e, t) {
	throw new m(e, t);
}
function Hh(e) {
	return Ua(Ba(e));
}
function Uh(e, t) {
	e.some((t, n) => n > 0 && e[n - 1] >= t) && q("envelope", `${t} must be sorted and unique`);
}
function Wh(e) {
	return JSON.stringify([e.principal, e.actorKey]);
}
function Gh(e) {
	Uh(e.map(Wh), "Control pairs");
}
function Kh(e) {
	(!/^[a-z][a-z0-9_]{0,63}$/.test(e) || [
		"govern",
		"recover",
		"certify",
		"owner"
	].includes(e)) && q("envelope", "Expected a domain participation role");
}
function qh(e) {
	/^[a-z2-7]{26}$/.test(e) || q("envelope", "Grant ID must be canonical 16-byte base32");
	let t = Ue(e);
	(t.length !== 16 || Be(t) !== e) && q("envelope", "Noncanonical grant ID");
}
function Jh(e) {
	let [t, n, r] = e.split("#");
	(!t || !n || r !== void 0 || !/^[A-Za-z][A-Za-z0-9_]*$/.test(n)) && q("envelope", "Expected a complete action/schema reference"), dm(V("path"), {
		$type: V("path"),
		collection: t,
		rkey: "self"
	});
}
function Yh(e) {
	let t;
	try {
		t = Ze(e);
	} catch {
		q("envelope", "Expected canonical raw CID");
	}
	(t.codec !== 85 || Qe(t) !== e || t.digest.contents.length !== 32 || t.version !== 1 || t.digest.codec !== 18) && q("envelope", "Expected canonical raw SHA-256 CIDv1");
}
function Xh(e) {
	let t;
	try {
		t = new URL(e);
	} catch {
		q("envelope", "Expected HTTPS origin");
	}
	(t.protocol !== "https:" || t.username || t.password || t.search || t.hash || t.pathname !== "/" || t.origin !== e) && q("envelope", "Expected canonical credential-free HTTPS origin");
}
function Zh(e) {
	let t = new Date(e);
	(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(e) || !Number.isFinite(t.getTime()) || t.toISOString() !== e) && q("envelope", "Expected exact diagnostic UTC timestamp");
}
async function Qh(e) {
	let t;
	try {
		t = Rh(e);
	} catch (e) {
		throw (e instanceof SyntaxError || e instanceof TypeError && /^unsupported key type /.test(e.message)) && q("key", "Expected canonical P-256 device/control key"), e;
	}
	(t.type !== "p256" || t.publicKeyBytes.length !== 33) && q("key", "Device/control signing requires compressed P-256");
	let n;
	try {
		n = await Vh(t);
	} catch (e) {
		throw e instanceof DOMException && e.name === "DataError" && q("key", "Invalid device/control point"), e;
	}
	n !== e && q("key", "Noncanonical device/control key");
}
async function $h(e) {
	let t;
	try {
		t = Rh(e);
	} catch (e) {
		throw (e instanceof SyntaxError || e instanceof TypeError && /^unsupported key type /.test(e.message)) && q("key", "Expected repository signing key"), e;
	}
	t.publicKeyBytes.length !== 33 && q("key", "Repository key must be compressed"), await Vh(t) !== e && q("key", "Noncanonical repository key");
}
async function J(e, t) {
	dm(e, t);
	let n = Hh(t);
	async function r(e) {
		Gh(e);
		for (let t of e) Uh(t.powers, "Control powers"), await Qh(t.actorKey);
	}
	let i = e === B.content ? n.body.$type : e, a = e === B.content ? n.body : n;
	switch (i) {
		case B.genesis:
			await r(a.control), Uh(a.roles.map((e) => JSON.stringify([e.principal, e.role])), "Initial roles"), a.roles.forEach((e) => Kh(e.role));
			break;
		case V("intent"):
			await Qh(a.actorKey), await J(a.operation.$type, a.operation);
			break;
		case V("signedRequest"):
			await J(V("intent"), a.intent);
			break;
		case V("act"):
			qh(a.grant.id), Jh(a.action), (!a.payload || Array.isArray(a.payload) || typeof a.payload != "object") && q("payload", "Expected action object"), y(a.payload, h.actionBytes);
			break;
		case V("assignRole"):
			qh(a.grant.id), Kh(a.role);
			break;
		case V("setRole"):
		case V("requiredRole"):
			Kh(a.role);
			break;
		case V("setControl"):
			await r(a.control);
			break;
		case V("setRecovery"):
		case V("recoverGovernance"):
			Gh(a.recovery ?? a.governance);
			for (let e of a.recovery ?? a.governance) await Qh(e.actorKey);
			break;
		case V("activate"):
			Uh(a.closure, "Activation closure"), a.closure.includes(a.definition.$link) || q("envelope", "Activation closure omits its definition");
			for (let e of a.closure) Ze(e).codec === 85 ? Yh(e) : C(e);
			break;
		case V("accountOperation"):
			await J(a.operation.$type, a.operation);
			break;
		case V("admitGrant"):
		case V("revokeGrant"):
			qh((a.grant ?? a.revoke).id);
			break;
		case B.entry:
			await J(a.request.$type, a.request);
			break;
		case B.grant:
			qh(a.id), await Qh(a.actorKey), !a.actions.length && !a.assignRoles.length && q("envelope", "Empty grant scope"), Uh(a.actions.map((e) => JSON.stringify([e.action, e.execution.$link])), "Grant action scopes"), a.actions.forEach((e) => Jh(e.action)), Uh(a.assignRoles, "Grant role scopes"), a.assignRoles.forEach(Kh);
			break;
		case B.revoke:
			qh(a.id);
			break;
		case B.file:
			Yh(a.cid);
			break;
		case B.definition:
			new Set(a.files.map((e) => e.path)).size !== a.files.length && q("envelope", "Duplicate source paths"), a.files.forEach((e) => Yh(e.cid));
			for (let e of a.actions) Jh(e.ref), await J(e.authorization.$type, e.authorization);
			break;
		case V("byteManifest"):
			a.chunks.length !== Math.ceil(a.byteLength / 32768) && q("envelope", "Manifest count/length mismatch");
			break;
		case V("observationPolicy"):
			Xh(a.plcDirectory);
			break;
		case V("observation"):
		case V("appBinding"):
			if (Xh(a.binding.pdsOrigin), await $h(a.binding.signingKeyDid), a.before.$type !== a.after.$type && q("envelope", "Mixed identity evidence methods"), i === V("observation")) {
				Zh(a.observedAt), Uh(a.records.map((e) => e.path), "Observed record paths");
				for (let e of a.records) {
					let [t, n, r] = e.path.split("/");
					r !== void 0 && q("path", "Expected two native path components"), eg(t, n);
				}
			}
			break;
		case V("actionContract"): Jh(a.schemas.stateRoot), Jh(a.schemas.actionRoot), Yh(a.fold), await J(a.authorization.$type, a.authorization);
	}
	return Lp(n);
}
function eg(e, t) {
	return dm(V("path"), {
		$type: V("path"),
		collection: e,
		rkey: t
	}), `${e}/${t}`;
}
function tg(e) {
	return (!Number.isSafeInteger(e) || e < 1) && q("position", "Expected positive safe position"), String(e).padStart(16, "0");
}
async function ng(e, t, n) {
	eg(e, t);
	let r = await J(e, Ua(n)), i;
	switch (e) {
		case B.genesis:
		case B.epoch:
		case B.content:
		case B.definition:
			i = await Wa(r);
			break;
		case B.head:
			i = r.genesis.$link;
			break;
		case B.entry:
			i = `${r.genesis.$link}.${tg(r.position)}`;
			break;
		case B.epochCurrent:
			i = "self";
			break;
		case B.grant:
		case B.revoke:
			i = r.id;
			break;
		case B.file:
			i = r.cid;
			break;
		default: q("path", "Not a native Atseq record collection");
	}
	return t !== i && q("path", "Record differs from canonical native key"), r;
}
var rg = class e {
	genesis;
	cid;
	constructor(e, t) {
		this.genesis = e, this.cid = t, Object.freeze(this);
	}
	static async from(t, n) {
		let r = Hh(n);
		(!r || Object.keys(r).sort().join(",") !== "app,genesis") && q("target", "Expected exact app/genesis pin");
		let i = await J(B.genesis, t);
		return (i.app !== r.app || await Wa(i) !== C(r.genesis).$link) && q("target", "Genesis differs from external pin"), new e(i, r.genesis);
	}
};
async function ig(e, t, n) {
	if (!Number.isSafeInteger(n) || n < 0) throw new m("input", "Invalid local byte budget");
	let r = await J(B.content, e);
	if (r.body.$type !== V("byteManifest") && q("envelope", "Expected byte manifest"), r.body.byteLength > n) throw new m("native_proof_limit", "Retained bytes exceed local budget");
	let i = new Uint8Array(r.body.byteLength), a = 0;
	for (let e of r.body.chunks) {
		let n = await t.get(e.$link), r = await ng(B.content, e.$link, n);
		r.body.$type !== V("byteChunk") && q("envelope", "Manifest references non-chunk content");
		let o = new Uint8Array(at(r.body.bytes));
		o.length !== Math.min(32768, i.length - a) && q("envelope", "Noncanonical chunk size/manifest length"), i.set(o, a), a += o.length;
	}
	return i;
}
//#endregion
//#region src/protocol/checkpoint-data.ts
var Y = Object.freeze({
	pageBytes: 131072,
	depth: 32,
	payloadBytes: 33554432
});
function X(e) {
	throw new m("envelope", e);
}
function ag(e) {
	throw new f("content_unavailable", e);
}
function og(e, t) {
	(!e || typeof e != "object" || Array.isArray(e) || Object.keys(e).length !== t.length || t.some((t) => !Object.hasOwn(e, t))) && X("Unknown or missing checkpoint fields");
}
function sg(e, t = !1) {
	(!Number.isSafeInteger(e) || Object.is(e, -0) || e < +!!t) && X("Invalid checkpoint integer");
}
function cg(e) {
	if (!Number.isSafeInteger(e) || e < 0) throw new m("input", "Invalid local checkpoint budget");
}
function lg(e) {
	um(e.app), C(e.genesis);
}
function ug(e, t) {
	og(e, ["position", "entry"]), sg(e.position), C(e.entry), e.position === 0 != (e.entry === t) && X("Checkpoint zero position differs from genesis");
}
function dg(e, t, n = !1) {
	if (cg(t), !(e instanceof Uint8Array)) throw new m("input", "Expected checkpoint bytes");
	let r = n ? Y.pageBytes : Y.payloadBytes;
	e.length > r && X("Checkpoint JSON exceeds supported format byte bound"), e.length > t && ag("Checkpoint bytes exceed local budget");
	let i;
	try {
		i = Mm(e, r, Y.depth);
	} catch (e) {
		throw e instanceof Am ? new m("noncanonical", `Malformed checkpoint JSON: ${e.reason}`) : e;
	}
	let a = new TextEncoder().encode(y(i, r, Y.depth));
	if (a.length !== e.length || a.some((t, n) => t !== e[n])) throw new m("noncanonical", "Checkpoint JSON does not reproduce canonical bytes");
	return i;
}
async function fg(e) {
	(!(e instanceof Uint8Array) || e.length > Y.payloadBytes) && X("Unsupported checkpoint payload bytes");
	let t = [];
	for (let n = 0; n < e.length; n += 32768) {
		let r = {
			$type: B.content,
			version: 1,
			body: {
				$type: V("byteChunk"),
				bytes: Ra(e.slice(n, n + 32768))
			}
		};
		t.push(C(await Wa(r)));
	}
	return Wa({
		$type: B.content,
		version: 1,
		body: {
			$type: V("byteManifest"),
			byteLength: e.length,
			chunks: t
		}
	});
}
async function pg(e, t) {
	await fg(t) !== e && X("Checkpoint payload differs from byte-manifest identity");
}
async function mg(e, t, n, r = !1) {
	cg(n), C(e);
	let i = await ng(B.content, e, await t.get(e));
	return i.body.$type !== V("byteManifest") && X("Expected checkpoint byte manifest"), i.body.byteLength > (r ? Y.pageBytes : Y.payloadBytes) && X("Checkpoint payload exceeds supported format bound"), i.body.byteLength > n && ag("Checkpoint payload exceeds local budget"), ig(i, t, n);
}
function hg(e, t, n, r) {
	if (lg(n), ![
		"history",
		"outcomes",
		"sources",
		"evidence"
	].includes(t)) throw new m("input", "Unsupported expected table kind");
	let i = dg(e, r);
	og(i, [
		"format",
		"version",
		"app",
		"genesis",
		"kind",
		"through",
		"rows",
		"pages"
	]), (i.format !== "atseq-checkpoint-table" || i.version !== 1 || i.kind !== t || i.app !== n.app || i.genesis !== n.genesis) && X("Checkpoint table differs from scope/kind/version"), ug(i.through, n.genesis), sg(i.rows), Array.isArray(i.pages) || X("Expected checkpoint pages");
	let a = 0;
	for (let e of i.pages) og(e, ["payload", "rows"]), C(e.payload), sg(e.rows, !0), a += e.rows, Number.isSafeInteger(a) || X("Checkpoint row count overflow");
	return (a !== i.rows || i.rows === 0 != (i.pages.length === 0)) && X("Checkpoint page counts differ"), i.kind === "history" && i.rows !== i.through.position && X("History count differs from head"), i.kind === "outcomes" && i.rows !== i.through.position && X("Outcome count differs from interpreted frontier"), i;
}
async function gg(e, t) {
	await J(B.file, {
		$type: B.file,
		version: 1,
		cid: e,
		bytes: C(t)
	});
}
function _g(e) {
	e.some((t, n) => n > 0 && e[n - 1] >= t) && X("Checkpoint rows must be sorted and unique");
}
async function vg(e, t, n, r, i) {
	lg(n), cg(i);
	let a = dg(e, r, !0);
	if ((!Array.isArray(a) || !a.length) && X("Checkpoint pages must contain rows"), a.length > i && ag("Checkpoint rows exceed local budget"), ![
		"history",
		"sources",
		"evidence",
		"outcomes"
	].includes(t)) throw new m("input", "Unsupported table kind");
	for (let e of a) if (t === "history") {
		if (og(e, [
			"position",
			"entry",
			"request",
			"actor",
			"entryBytes",
			"requestBytes",
			"observations"
		]), sg(e.position, !0), [
			e.entry,
			e.request,
			e.entryBytes,
			e.requestBytes
		].forEach(C), e.actor !== null) {
			og(e.actor, ["actorKey", "nonce"]), await Qh(e.actor.actorKey), (typeof e.actor.nonce != "string" || !/^[A-Za-z0-9+/]{22}$/.test(e.actor.nonce)) && X("Expected original actor nonce");
			let t = new Uint8Array(at({ $bytes: e.actor.nonce }));
			(t.length !== 16 || Ra(t).$bytes !== e.actor.nonce) && X("Noncanonical original actor nonce");
		}
		(!Array.isArray(e.observations) || e.observations.length > 1) && X("Unsupported observation use list"), e.observations.forEach(C);
	} else if (t === "outcomes") og(e, [
		"position",
		"entry",
		"outcome"
	]), sg(e.position, !0), C(e.entry), e.outcome = _m(e.outcome);
	else if (t === "sources") {
		og(e, [
			"definition",
			"manifest",
			"files"
		]), C(e.definition), C(e.manifest), Array.isArray(e.files) || X("Expected source files");
		let t = /* @__PURE__ */ new Set();
		for (let r of e.files) og(r, [
			"path",
			"cid",
			"bytes"
		]), C(r.bytes), (typeof r.path != "string" || r.path.length > 200 || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(r.path) || r.path.split("/").some((e) => !e || e === "." || e === "..") || t.has(r.path)) && X("Invalid or duplicate source path"), t.add(r.path), await gg(r.cid, n.genesis);
	} else {
		og(e, ["cid", "bytes"]), C(e.bytes);
		try {
			C(e.cid);
		} catch (t) {
			if (!(t instanceof m) || t.code !== "wire_cid") throw t;
			await gg(e.cid, n.genesis);
		}
	}
	if (t === "history" || t === "outcomes") for (let e = 1; e < a.length; e++) a[e].position !== a[e - 1].position + 1 && X(t === "history" ? "Nonconsecutive history page" : "Nonconsecutive outcome page");
	else _g(a.map((e) => t === "sources" ? e.definition : e.cid));
	return a;
}
function yg(e, t, n) {
	lg(t), sg(n), n > e.length && X("Interpreted frontier exceeds complete history");
	let r = {
		requests: [],
		retries: [],
		consumedObservations: []
	}, i = {
		requests: /* @__PURE__ */ new Set(),
		retries: /* @__PURE__ */ new Set(),
		consumedObservations: /* @__PURE__ */ new Set()
	};
	for (let [a, o] of e.entries()) {
		o.position !== a + 1 && X("Incomplete history positions");
		let e = o.actor === null ? null : JSON.stringify([
			t.app,
			t.genesis,
			o.actor.actorKey,
			o.actor.nonce
		]);
		for (let [t, a] of Object.entries({
			requests: [o.request],
			retries: e === null ? [] : [e],
			consumedObservations: o.observations
		})) for (let e of a) {
			let a = t;
			i[a].has(e) && X("Duplicate history identity"), i[a].add(e), o.position <= n && r[a].push(e);
		}
	}
	for (let e of Object.values(r)) e.sort();
	return r;
}
async function bg(e, t, n, r, i, a) {
	cg(i), cg(a);
	let o = hg(e, n, r, i);
	o.rows > a && ag("Complete table exceeds local row budget"), t.length < o.pages.length && ag("Required complete table pages are missing"), t.length > o.pages.length && X("Unexpected complete table pages");
	let s = e.length, c = [];
	for (let [e, l] of t.entries()) {
		let t = n === "history" ? await vg(l, "history", r, Math.max(0, i - s), a) : n === "sources" ? await vg(l, "sources", r, Math.max(0, i - s), a) : n === "evidence" ? await vg(l, "evidence", r, Math.max(0, i - s), a) : await vg(l, "outcomes", r, Math.max(0, i - s), a), u = o.pages[e];
		await pg(u.payload, l), t.length !== u.rows && X("Page count differs from inventory"), c.push(...t), s += l.length;
	}
	return c.length !== o.rows && X("Complete table row count differs"), n === "history" || n === "outcomes" ? (c.some((e, t) => e.position !== t + 1) || c.length && c.at(-1).entry !== o.through.entry) && X(n === "history" ? "History positions/boundary differ" : "Outcome positions/boundary differ") : _g(c.map((e) => n === "sources" ? e.definition : e.cid)), {
		table: o,
		rows: c
	};
}
async function xg(e, t, n, r, i, a, o) {
	ug(r, n.genesis), r.position > i.length && ag("Outcome comparison requires additional history data"), i.some((e, t) => e.position !== t + 1) && X("Nonconsecutive supplied history data");
	let s = await bg(e, t, "outcomes", n, a, o);
	return (s.table.through.position !== r.position || s.table.through.entry !== r.entry || s.rows.some((e) => e.entry !== i[e.position - 1]?.entry)) && X("Outcomes differ from interpreted frontier/history"), s;
}
function Sg(e, t, n) {
	lg(t);
	let r = dg(e, n);
	return og(r, [
		"format",
		"version",
		"app",
		"genesis",
		"head",
		"frontier",
		"definition",
		"state",
		"authority",
		"outcomes",
		"history",
		"sources",
		"evidence",
		"stall",
		"producer"
	]), (r.format !== "atseq-checkpoint-assertion" || r.version !== 1 || r.app !== t.app || r.genesis !== t.genesis) && X("Checkpoint assertion differs from pinned scope/version"), ug(r.head, t.genesis), ug(r.frontier, t.genesis), (r.frontier.position > r.head.position || r.frontier.position === r.head.position && r.frontier.entry !== r.head.entry) && X("Checkpoint assertion frontier differs from head"), [
		"definition",
		"state",
		"authority",
		"history",
		"sources",
		"evidence",
		"producer"
	].forEach((e) => C(r[e])), r.outcomes !== null && C(r.outcomes), r.stall !== null && (og(r.stall, [
		"position",
		"entry",
		"diagnostic"
	]), sg(r.stall.position, !0), C(r.stall.entry), (r.frontier.position >= r.head.position || r.stall.position !== r.frontier.position + 1 || typeof r.stall.diagnostic != "string" || !r.stall.diagnostic.isWellFormed() || [...r.stall.diagnostic].length > 1024) && X("Checkpoint stall differs from pending boundary")), r;
}
//#endregion
//#region src/protocol/native-checkpoint-producer.ts
var Cg = 32768, wg = 1e5, Tg = 50331648, Eg = new TextEncoder(), Dg = Uint8Array, Og = Object.getPrototypeOf(Dg.prototype), kg = Object.getOwnPropertyDescriptor(Og, "length").get, Ag = Object.getOwnPropertyDescriptor(Og, Symbol.toStringTag).get, jg = Dg.prototype.set;
function Mg(e) {
	throw new m("envelope", e);
}
function Ng(e) {
	throw new f("content_unavailable", e);
}
function Pg(e, t = Y.payloadBytes) {
	return Eg.encode(y(e, t, Y.depth));
}
function Fg(e) {
	let t = JSON.parse(y({
		scope: e.scope,
		head: e.head,
		frontier: e.frontier,
		definition: e.definition,
		stall: e.stall
	}, Y.pageBytes, Y.depth)), n = 0;
	function r(e, t = Y.payloadBytes, r = !0) {
		if (Reflect.apply(Ag, e, []) !== "Uint8Array") throw new m("input", "Expected original checkpoint bytes");
		let i = Reflect.apply(kg, e, []);
		i > t && Mg("Unsupported checkpoint payload bytes"), i > Tg - n && Ng("Checkpoint input inventory exceeds byte capacity");
		let a = new Dg(i);
		return Reflect.apply(jg, a, [e]), r && dg(a, t, t === Y.pageBytes), n += i, a;
	}
	let i = 0;
	function a(e, t = !0) {
		if (!Array.isArray(e)) throw new m("input", "Expected checkpoint row bytes");
		let n = e.length;
		if (!Number.isSafeInteger(n) || Object.is(n, -0) || n < 0) throw new m("input", "Expected a safe checkpoint row count");
		n > wg - i && Ng("Checkpoint input inventory exceeds row capacity"), i += n;
		let a = [];
		for (let i = 0; i < n; i++) {
			let n = Object.getOwnPropertyDescriptor(e, String(i));
			if (!n || !("value" in n)) throw new m("input", "Expected owned checkpoint row bytes");
			a.push(r(n.value, t ? Y.pageBytes : Y.payloadBytes, t));
		}
		return a;
	}
	return {
		...t,
		state: r(e.state),
		authority: r(e.authority),
		producer: r(e.producer),
		payloads: a(e.payloads ?? [], !1),
		history: a(e.history),
		sources: a(e.sources),
		evidence: a(e.evidence),
		outcomes: e.outcomes === null ? null : a(e.outcomes)
	};
}
async function Z(e) {
	let t = Fg(e), n = /* @__PURE__ */ new Map(), r = {
		records: 0,
		recordBytes: 0,
		chunks: 0,
		manifests: 0,
		pages: 0,
		payloadBytes: 0
	};
	async function i(e, t) {
		let i = Ba(e), a = await Wa(e);
		return n.has(a) || ((n.size >= wg || i.length > Tg - r.recordBytes) && Ng("Checkpoint content inventory exceeds capacity"), n.set(a, {
			path: `${B.content}/${a}`,
			cid: a,
			bytes: i
		}), r.records++, r.recordBytes += i.length, r[t]++), a;
	}
	async function a(e) {
		e.length > Y.payloadBytes && Mg("Unsupported checkpoint payload bytes");
		let t = [];
		for (let n = 0; n < e.length; n += Cg) t.push(C(await i({
			$type: B.content,
			version: 1,
			body: {
				$type: V("byteChunk"),
				bytes: Ra(e.subarray(n, n + Cg))
			}
		}, "chunks")));
		let n = await i({
			$type: B.content,
			version: 1,
			body: {
				$type: V("byteManifest"),
				byteLength: e.length,
				chunks: t
			}
		}, "manifests");
		return r.payloadBytes += e.length, {
			cid: n,
			bytes: e
		};
	}
	let o = t.scope, s = dg(t.authority, Y.payloadBytes);
	(!s || typeof s != "object" || Array.isArray(s) || s.format !== "atseq-checkpoint-authority" || s.version !== 1 || s.app !== o.app || s.genesis !== o.genesis || s.activeDefinition !== t.definition || y(s.frontier) !== y(t.frontier)) && Mg("Authority payload differs from assertion scope/frontier/definition");
	let c = t.history.map((e) => dg(e, Y.pageBytes));
	for (let e of c) await vg(Pg([e], Y.pageBytes), "history", o, Y.pageBytes, wg);
	yg(c, o, t.frontier.position), t.frontier.entry !== (t.frontier.position === 0 ? o.genesis : c[t.frontier.position - 1]?.entry) && Mg("Checkpoint frontier differs from complete history"), t.stall !== null && t.stall.entry !== c[t.frontier.position]?.entry && Mg("Checkpoint stall differs from first pending history entry");
	async function l(e, t, n) {
		let i = [], s = [], c = [], l = 2;
		async function u() {
			if (!c.length) return;
			let t = Eg.encode(`[${c.join(",")}]`);
			await vg(t, e, o, Y.pageBytes, wg), i.push(await a(t)), s.push(c.length), r.pages++, c = [], l = 2;
		}
		for (let e of t) e.length + 2 > Y.pageBytes && Mg("One checkpoint row exceeds page capacity"), l + e.length + +!!c.length > Y.pageBytes && await u(), c.push(new TextDecoder().decode(e)), l += e.length + +(c.length > 1);
		await u();
		let d = Pg({
			format: "atseq-checkpoint-table",
			version: 1,
			...o,
			kind: e,
			through: n,
			rows: t.length,
			pages: i.map((e, t) => ({
				payload: e.cid,
				rows: s[t]
			}))
		});
		return await bg(d, i.map((e) => e.bytes), e, o, Tg, wg), {
			payload: await a(d),
			pages: i
		};
	}
	let u = {
		history: await l("history", t.history, t.head),
		sources: await l("sources", t.sources, t.head),
		evidence: await l("evidence", t.evidence, t.head),
		outcomes: null
	};
	if (t.outcomes !== null) {
		let e = t.outcomes.map((e) => dg(e, Y.pageBytes)), n = /* @__PURE__ */ new Set();
		for (let r of e) await vg(Pg([r], Y.pageBytes), "outcomes", o, Y.pageBytes, wg), (r.position > t.frontier.position || n.has(r.position) || r.entry !== c[r.position - 1]?.entry) && Mg("Selective outcomes differ from history/frontier"), n.add(r.position);
		e.length === t.frontier.position && (u.outcomes = await l("outcomes", t.outcomes, t.frontier));
	}
	for (let e of t.payloads) await a(e);
	let d = await a(t.state), f = await a(t.authority), p = await a(t.producer), m = Pg({
		format: "atseq-checkpoint-assertion",
		version: 1,
		...o,
		head: t.head,
		frontier: t.frontier,
		definition: t.definition,
		state: d.cid,
		authority: f.cid,
		producer: p.cid,
		history: u.history.payload.cid,
		sources: u.sources.payload.cid,
		evidence: u.evidence.payload.cid,
		outcomes: u.outcomes?.payload.cid ?? null,
		stall: t.stall
	});
	return Sg(m, o, Y.payloadBytes), {
		assertion: await a(m),
		tables: u,
		records: [...n.values()].sort((e, t) => e.path < t.path ? -1 : +(e.path > t.path)),
		counters: r
	};
}
//#endregion
//#region src/protocol/identity-json.ts
function Ig(e) {
	throw new m("input", e);
}
//#endregion
//#region src/protocol/identity-key.ts
function Lg(e) {
	throw e instanceof f ? e : (e instanceof DOMException && e.name === "DataError" && Ig("Invalid identity curve point"), e instanceof Error && (e.constructor === Error && /^(bad point: not on curve|sqrt invalid)$/.test(e.message) || e.constructor === TypeError && /^(invalid curve point|unsupported key type \(0x[0-9a-f]+\)|unsupported controller type \(.+\))$/.test(e.message) || e.constructor === SyntaxError && /^(not a did:key|not a multibase base58btc string|multikey too short)$/.test(e.message)) && Ig("Invalid identity signing key"), e);
}
function Rg(e) {
	return (typeof e != "string" || e.length > 128 || !/^z[1-9A-HJ-NP-Za-km-z]+$/.test(e)) && Ig("Expected bounded base58btc identity key"), `z${Ke(Ge(e.slice(1)))}` !== e && Ig("Noncanonical identity multibase"), e;
}
async function zg(e) {
	(typeof e != "string" || !e.startsWith("did:key:")) && Ig("Expected identity did:key"), Rg(e.slice(8));
	try {
		return await Vh(Rh(e));
	} catch (e) {
		Lg(e);
	}
}
function Bg(e) {
	(typeof e != "string" || e.length > 2048) && Ig("Expected bounded identity PDS endpoint");
	let t;
	try {
		t = new URL(e);
	} catch (e) {
		throw e instanceof TypeError && Ig("Invalid identity PDS endpoint"), e;
	}
	return (t.protocol !== "https:" || t.username || t.password || t.pathname !== "/" || t.search || t.hash) && Ig("Identity PDS endpoint must be an HTTPS origin"), t.origin;
}
//#endregion
//#region src/application/native-authority-data.ts
function Q(e) {
	throw new m("envelope", e);
}
function Vg(e, t) {
	(!e || typeof e != "object" || Array.isArray(e) || Object.keys(e).sort().join(",") !== [...t].sort().join(",")) && Q("Authority snapshot row has unknown or missing fields");
}
function Hg(e) {
	e.some((t, n) => typeof t != "string" || n > 0 && e[n - 1] >= t) && Q("Authority snapshot rows must be sorted and unique");
}
function Ug(e) {
	um(e);
}
function Wg(e) {
	C(e);
}
function Gg(e) {
	e !== null && Wg(e);
}
async function Kg(e, t, n, r = 33554432) {
	if (!Number.isSafeInteger(r) || r < 1) throw new m("input", "Invalid snapshot byte budget");
	let i;
	try {
		i = y(e, r, 32);
	} catch (e) {
		throw e instanceof f && ["value_bytes", "value_depth"].includes(e.code) ? new f("content_unavailable", "Authority snapshot exceeds local resource budget") : e;
	}
	let a = JSON.parse(i);
	Vg(a, [
		"format",
		"version",
		"app",
		"genesis",
		"activeDefinition",
		"frontier",
		"control",
		"roles",
		"principals",
		"grants",
		...n ? [] : [
			"consumedObservations",
			"requests",
			"retries"
		]
	]), (a.format !== (n ? "atseq-checkpoint-authority" : "atseq-native-authority") || a.version !== 1 || a.app !== t.genesis.app || a.genesis !== t.cid) && Q("Authority snapshot differs from pinned scope/version"), Wg(a.activeDefinition), Vg(a.frontier, ["position", "entry"]), (!Number.isSafeInteger(a.frontier.position) || a.frontier.position < 0 || Object.is(a.frontier.position, -0)) && Q("Invalid authority snapshot frontier"), Wg(a.frontier.entry), a.frontier.position === 0 != (a.frontier.entry === a.genesis) && Q("Invalid genesis snapshot frontier"), Vg(a.control, [
		"tip",
		"appointments",
		"owner",
		"recoverGovernance"
	]), Wg(a.control.tip), a.control.owner !== null && Ug(a.control.owner), a.control.recoverGovernance !== t.genesis.recoverGovernance && Q("Immutable recovery policy changed in snapshot"), await J(V("setControl"), {
		$type: V("setControl"),
		position: 1,
		prev: C(a.genesis),
		controlTip: C(a.genesis),
		control: a.control.appointments
	});
	for (let e of a.control.appointments) Ug(e.principal);
	for (let e of [
		"roles",
		"principals",
		"grants",
		...n ? [] : [
			"consumedObservations",
			"requests",
			"retries"
		]
	]) Array.isArray(a[e]) || Q("Expected authority snapshot row array");
	if (n) {
		for (let e of a.roles) Vg(e, [
			"principal",
			"role",
			"enabled",
			"revision"
		]);
		for (let e of a.principals) {
			Vg(e, [
				"principal",
				"epoch",
				"epochs",
				"observation"
			]), Array.isArray(e.epochs) || Q("Expected accepted epoch rows");
			for (let t of e.epochs) Vg(t, [
				"cid",
				"id",
				"previous"
			]);
		}
		for (let e of a.grants) Vg(e, [
			"principal",
			"id",
			"cid",
			"grant",
			"revoked"
		]);
	}
	if (!n) {
		Hg(a.consumedObservations), Hg(a.requests), Hg(a.retries), a.consumedObservations.forEach(Wg), a.requests.forEach(Wg), a.retries.length > a.requests.length && Q("Snapshot has more actor tuples than requests");
		for (let e of a.retries) {
			let t;
			try {
				t = JSON.parse(e);
			} catch {
				Q("Invalid actor retry tuple");
			}
			(!Array.isArray(t) || t.length !== 4 || t[0] !== a.app || t[1] !== a.genesis || typeof t[2] != "string" || typeof t[3] != "string" || JSON.stringify(t) !== e) && Q("Actor retry tuple differs from snapshot scope"), await Qh(t[2]);
			let n = new Uint8Array(at({ $bytes: t[3] }));
			(n.length !== 16 || Ra(n).$bytes !== t[3]) && Q("Invalid actor retry nonce");
		}
		a.requests.length !== a.frontier.position && Q("Authority snapshot omits ordered request identities"), a.control.tip !== a.genesis && !a.requests.includes(a.control.tip) && Q("Control tip lacks an ordered request");
	}
	Hg(a.roles.map((e) => JSON.stringify([e.principal, e.role])));
	for (let e of a.roles) Vg(e, [
		"principal",
		"role",
		"enabled",
		"revision"
	]), Ug(e.principal), Wg(e.revision), typeof e.enabled != "boolean" && Q("Invalid assignment state"), await J(V("requiredRole"), {
		$type: V("requiredRole"),
		role: e.role
	}), !n && e.revision !== a.genesis && !a.requests.includes(e.revision) && Q("Role revision lacks an ordered request"), e.revision === a.genesis && (!e.enabled || !t.genesis.roles.some((t) => t.principal === e.principal && t.role === e.role)) && Q("Genesis assignment differs from pinned initial roles");
	Hg(a.principals.map((e) => e.principal));
	for (let e of a.principals) {
		Vg(e, [
			"principal",
			"epoch",
			"epochs",
			"observation"
		]), Ug(e.principal), Gg(e.epoch), Array.isArray(e.epochs) || Q("Expected accepted epoch rows"), Hg(e.epochs.map((e) => e.cid)), new Set(e.epochs.map((e) => e.id)).size !== e.epochs.length && Q("Epoch ID reused in snapshot");
		for (let t of e.epochs) Vg(t, [
			"cid",
			"id",
			"previous"
		]), Wg(t.cid), Gg(t.previous), await Wa(await J(B.epoch, {
			$type: B.epoch,
			version: 1,
			id: { $bytes: t.id },
			previous: t.previous === null ? null : C(t.previous)
		})) !== t.cid && Q("Epoch row differs from immutable CID");
		e.epoch !== null && !e.epochs.some((t) => t.cid === e.epoch) && Q("Current epoch is not retained"), e.observation !== null && (Vg(e.observation, [
			"cid",
			"root",
			"rev",
			"signingKeyDid",
			"pdsOrigin",
			"assuranceClass"
		]), Wg(e.observation.cid), Wg(e.observation.root), !n && !a.consumedObservations.includes(e.observation.cid) && Q("Floor descriptor was not consumed"), /^[234567abcdefghij][234567a-z]{12}$/.test(e.observation.rev) || Q("Invalid repository floor revision"), e.observation.assuranceClass !== (e.principal.startsWith("did:plc:") ? "plc-audit-v1" : "web-observation-v1") && Q("Snapshot floor assurance differs from principal method"), (await zg(e.observation.signingKeyDid) !== e.observation.signingKeyDid || Bg(e.observation.pdsOrigin) !== e.observation.pdsOrigin) && Q("Noncanonical snapshot binding"));
	}
	Hg(a.grants.map((e) => JSON.stringify([e.principal, e.id])));
	for (let e of a.grants) if (Vg(e, [
		"principal",
		"id",
		"cid",
		"grant",
		"revoked"
	]), Ug(e.principal), Gg(e.cid), await J(B.revoke, {
		$type: B.revoke,
		version: 1,
		id: e.id,
		app: a.app,
		genesis: C(a.genesis)
	}), (typeof e.revoked != "boolean" || e.cid === null != (e.grant === null) || e.cid === null && !e.revoked) && Q("Invalid grant/tombstone row"), a.principals.some((t) => t.principal === e.principal) || Q("Grant principal has no retained authority row"), e.grant !== null) {
		let t = await J(B.grant, e.grant);
		(!t || t.id !== e.id || t.app !== a.app || t.genesis.$link !== a.genesis || await Wa(t) !== e.cid) && Q("Admitted grant row differs from immutable scope/CID"), a.principals.find((t) => t.principal === e.principal).epochs.some((e) => e.cid === t.epoch.$link) || Q("Admitted grant epoch was not retained");
	}
	return a;
}
//#endregion
//#region src/application/checkpoint-authority-data.ts
async function qg(e, t, n) {
	let r = await Kg(dg(e, n), t, !0);
	if (r.frontier.position === 0) {
		let e = {
			format: "atseq-checkpoint-authority",
			version: 1,
			app: t.genesis.app,
			genesis: t.cid,
			activeDefinition: t.genesis.definition.$link,
			frontier: {
				position: 0,
				entry: t.cid
			},
			control: {
				tip: t.cid,
				appointments: structuredClone(t.genesis.control),
				owner: t.genesis.owner,
				recoverGovernance: t.genesis.recoverGovernance
			},
			roles: t.genesis.roles.map((e) => ({
				...e,
				enabled: !0,
				revision: t.cid
			})),
			principals: [],
			grants: []
		}, n = (e, t) => e < t ? -1 : +(e > t);
		if (e.control.appointments.sort((e, t) => n(JSON.stringify([e.principal, e.actorKey]), JSON.stringify([t.principal, t.actorKey]))), e.roles.sort((e, t) => n(JSON.stringify([e.principal, e.role]), JSON.stringify([t.principal, t.role]))), y(r, 33554432, 32) !== y(e, 33554432, 32)) throw new m("envelope", "Compact genesis authority differs from exact initialization");
	}
	return r;
}
//#endregion
//#region tests/support/native-checkpoint-producer-corpus.ts
var $ = (e) => new TextEncoder().encode(y(e, 33554432, 32)), Jg = (e) => [...e].map((e) => e.toString(16).padStart(2, "0")).join(""), Yg = (e, t) => {
	if (JSON.stringify(e) !== JSON.stringify(t)) throw Error("Exact DATA differs");
}, Xg = (e) => {
	if (!e) throw Error("Expected condition");
};
async function Zg(e, t = 13) {
	let n = new Map(e.records.map(([e, t]) => [e, Uint8Array.from(atob(t), (e) => e.charCodeAt(0))])), r = { get: async (e) => {
		let t = n.get(e);
		return Xg(t), t;
	} }, i = /* @__PURE__ */ new Map();
	for (let t of e.payloads) i.set(t.file.slice(9), await mg(t.manifest, r, 33554432));
	let a = (e) => {
		let t = i.get(e);
		return Xg(t), t;
	};
	async function o(t) {
		let n = a(`${t}-table.json`), i = dg(n, n.length);
		return await bg(n, await Promise.all(i.pages.map((e) => mg(e.payload, r, 131072, !0))), t, e.scope, 50331648, 1e5);
	}
	let s = await o("history"), c = await o("sources"), l = await o("evidence"), u = a(`checkpoint-authority-${t}.json`), d = dg(u, u.length);
	return {
		scope: e.scope,
		head: t === 0 ? {
			position: 0,
			entry: e.scope.genesis
		} : s.table.through,
		frontier: d.frontier,
		definition: d.activeDefinition,
		stall: null,
		state: a("domain-state.json"),
		authority: u,
		producer: a("claimed-producer.json"),
		history: s.rows.slice(0, t).map($),
		sources: c.rows.map($),
		evidence: l.rows.map($),
		outcomes: s.rows.slice(0, t).map((e) => $({
			position: e.position,
			entry: e.entry,
			outcome: { decision: "effective" }
		})),
		payloads: [...i.entries()].filter(([e]) => /^(entry-|request-|evidence-\d|source-)/.test(e)).map(([, e]) => e)
	};
}
function Qg(e) {
	return {
		assertion: {
			cid: e.assertion.cid,
			hex: Jg(e.assertion.bytes)
		},
		tables: Object.fromEntries(Object.entries(e.tables).map(([e, t]) => [e, t === null ? null : {
			cid: t.payload.cid,
			hex: Jg(t.payload.bytes),
			pages: t.pages.map((e) => ({
				cid: e.cid,
				hex: Jg(e.bytes)
			}))
		}])),
		records: e.records.map((e) => ({
			path: e.path,
			cid: e.cid,
			hex: Jg(e.bytes)
		})),
		counters: e.counters
	};
}
async function $g(e, t) {
	let n = await Zg(e), r = [], i = [];
	async function a(e, t) {
		await t(), r.push(e);
	}
	async function o(e, t, n) {
		try {
			await n();
		} catch (n) {
			if (n instanceof f && n.code === t) {
				r.push(e);
				return;
			}
			throw n;
		}
		throw Error(`Did not reject ${e}`);
	}
	let s = await Z(n);
	await a("independent-encoder-exact-all-records-and-counters", () => Yg(Qg(s), t));
	let c = new Map(s.records.map((e) => [e.cid, e.bytes])), l = { get: async (e) => {
		let t = c.get(e);
		return Xg(t), t;
	} };
	await a("exact-assertion-table-authority-source-unused-order-roundtrip", async () => {
		let t = Sg(await mg(s.assertion.cid, l, 33554432), n.scope, 33554432), r = await rg.from(e.genesis, e.scope);
		Yg((await qg(await mg(t.authority, l, 33554432), r, 33554432)).frontier, n.frontier), Yg((await bg(s.tables.sources.payload.bytes, s.tables.sources.pages.map((e) => e.bytes), "sources", n.scope, 50331648, 1e5)).rows[0].files.map((e) => e.path), [
			"unused.bin",
			"state.json",
			"lexicon.json"
		]);
		let i = await bg(s.tables.history.payload.bytes, s.tables.history.pages.map((e) => e.bytes), "history", n.scope, 50331648, 1e5);
		Xg(s.tables.outcomes), await xg(s.tables.outcomes.payload.bytes, s.tables.outcomes.pages.map((e) => e.bytes), n.scope, n.frontier, i.rows, 50331648, 1e5);
	}), i.push({
		kind: "genuine-projection-13",
		...s.counters
	}), await a("selective-outcomes-export-null-and-empty-complete-zero", async () => {
		let t = await Z({
			...n,
			outcomes: n.outcomes.slice(3, 6)
		});
		Xg(t.tables.outcomes === null), Xg(Sg(t.assertion.bytes, n.scope, 33554432).outcomes === null);
		let r = await Z({
			...await Zg(e, 0),
			head: {
				position: 0,
				entry: n.scope.genesis
			},
			frontier: {
				position: 0,
				entry: n.scope.genesis
			},
			history: [],
			sources: [],
			evidence: [],
			outcomes: [],
			payloads: []
		});
		for (let e of Object.values(r.tables)) Xg(e), Yg(e.pages, []);
	}), await a("pending-stall-exact-history-boundary", async () => {
		let t = Sg((await Z({
			...await Zg(e, 12),
			history: n.history,
			stall: {
				position: 13,
				entry: JSON.parse(new TextDecoder().decode(n.history[12])).entry,
				diagnostic: "Source bytes unavailable"
			}
		})).assertion.bytes, n.scope, 33554432);
		Xg(t.frontier.position === 12 && t.head.position === 13 && t.stall?.position === 13);
	});
	let u = dg(n.authority, n.authority.length);
	u.frontier = {
		...n.frontier,
		entry: n.scope.genesis
	}, await o("omitted-outcomes-frontier-history-mismatch", "envelope", () => Z({
		...n,
		frontier: u.frontier,
		authority: $(u),
		outcomes: null
	})), await o("stall-wrong-first-pending-entry", "envelope", async () => Z({
		...await Zg(e, 12),
		history: n.history,
		stall: {
			position: 13,
			entry: n.scope.genesis,
			diagnostic: "Wrong entry"
		}
	})), await a("synchronous-owned-input-capture-before-await", async () => {
		let e = n.state.slice(), r = n.history.slice(), i = Z({
			...n,
			state: e,
			history: r
		});
		e.fill(32), r.length = 0, Yg(Qg(await i), t);
	});
	for (let e of [
		0,
		32768,
		32769,
		33554432
	]) await a(`chunk-boundary-${e}`, async () => {
		let t = new Uint8Array(e);
		for (let n = 0; n < e; n++) t[n] = n % 251;
		let r = await Z({
			...n,
			payloads: [t]
		}), a = new Map(r.records.map((e) => [e.cid, e.bytes])), o = await mg(await fg(t), { get: async (e) => {
			let t = a.get(e);
			return Xg(t), t;
		} }, 33554432);
		Yg(Jg(o.subarray(0, 100)), Jg(t.subarray(0, 100))), Xg(o.length === e && o.every((e, n) => e === t[n])), i.push({
			kind: `chunk-${e}`,
			...r.counters
		});
	});
	let d = JSON.parse(new TextDecoder().decode(n.outcomes[0]));
	for (let [e, t] of [
		["effective-extra-field", {
			decision: "effective",
			reason: "extra"
		}],
		["unknown-framework-reason", {
			decision: "ineffective",
			source: "framework",
			reason: "unknown"
		}],
		["oversized-fold-reason", {
			decision: "ineffective",
			source: "fold",
			reason: "x".repeat(65)
		}]
	]) await o(`outcome-${e}`, "envelope", () => Z({
		...n,
		outcomes: [$({
			...d,
			outcome: t
		}), ...n.outcomes.slice(1)]
	}));
	await o("outcome-wrong-history-entry", "envelope", () => Z({
		...n,
		outcomes: [$({
			...d,
			entry: n.scope.genesis
		}), ...n.outcomes.slice(1)]
	})), await o("outcome-duplicate-position", "envelope", () => Z({
		...n,
		outcomes: [n.outcomes[0], n.outcomes[0]]
	})), await o("complete-outcome-order-gap", "envelope", () => Z({
		...n,
		outcomes: [
			n.outcomes[1],
			n.outcomes[0],
			...n.outcomes.slice(2)
		]
	})), await o("chunk-1025-refused", "envelope", () => Z({
		...n,
		payloads: [/* @__PURE__ */ new Uint8Array(33554433)]
	})), await o("noncanonical-original-row-refused", "noncanonical", () => Z({
		...n,
		history: [new TextEncoder().encode(" { }")]
	})), await o("history-extra-field-refused", "envelope", () => Z({
		...n,
		history: [$({
			...JSON.parse(new TextDecoder().decode(n.history[0])),
			extra: 1
		}), ...n.history.slice(1)]
	})), await o("history-gap-refused", "envelope", () => Z({
		...n,
		history: n.history.slice(1)
	})), await o("scope-transplant-refused", "envelope", () => Z({
		...n,
		scope: {
			...n.scope,
			genesis: n.definition
		}
	}));
	let p = dg(s.assertion.bytes, s.assertion.bytes.length);
	await o("assertion-extra-field-refused", "envelope", () => Sg($({
		...p,
		extra: 1
	}), n.scope, 33554432)), await o("assertion-cross-app-refused", "envelope", () => Sg(s.assertion.bytes, {
		...n.scope,
		app: "did:web:other.example"
	}, 33554432)), await o("assertion-noncanonical-refused", "noncanonical", () => Sg(new TextEncoder().encode(JSON.stringify(p, null, 2)), n.scope, 33554432)), await o("page-substitution-refused", "envelope", () => bg(s.tables.history.payload.bytes, [s.tables.evidence.pages[0].bytes], "history", n.scope, 50331648, 1e5));
	let m = JSON.parse(new TextDecoder().decode(n.sources[0])), h = m.files[0], g = {
		definition: m.definition,
		manifest: m.manifest,
		files: []
	};
	for (;;) if (g.files.push({
		...h,
		path: `f${g.files.length}`
	}), $(g).length + 2 > 131072) {
		g.files.pop();
		break;
	}
	let _ = 131070 - $(g).length;
	Xg(_ >= 0 && _ <= 200 - g.files.at(-1).path.length), g.files.at(-1).path += "x".repeat(_), await a("exact-128KiB-page-greedy-and-next-row-new-page", async () => {
		let e = $(g);
		Xg(e.length + 2 === 131072);
		let t = await Z({
			...n,
			sources: [e]
		});
		Xg(t.tables.sources.pages[0].bytes.length === 131072), i.push({
			kind: "exact-page",
			...t.counters
		});
		let r = {
			...m,
			definition: n.scope.genesis
		}, a = [g, r].sort((e, t) => e.definition < t.definition ? -1 : 1), o = await Z({
			...n,
			sources: a.map($)
		});
		Xg(o.tables.sources.pages.length === 2 && o.tables.sources.pages.some((e) => e.bytes.length === 131072));
	}), g.files.at(-1).path += "x", await o("one-row-page-plus-one-refused", "envelope", () => Z({
		...n,
		sources: [$(g)]
	}));
	let v = 0;
	for (let e = 0; e < 32; e++) v = [v];
	return await a("state-depth-32", () => Z({
		...n,
		state: $(v)
	})), v = [v], await o("state-depth-33", "noncanonical", () => Z({
		...n,
		state: new TextEncoder().encode(JSON.stringify(v))
	})), {
		cases: r,
		metrics: i,
		noAdmission: !0
	};
}
//#endregion
export { $g as nativeCheckpointProducerCorpus };
