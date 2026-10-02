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
var b = (e) => e.toHex(), x = new TextEncoder(), ne = new TextDecoder("utf-8", {
	fatal: !0,
	ignoreBOM: !0
}), re = crypto.subtle, ie = (e) => new Uint8Array(e), ae = ie, oe = (e, t) => {
	let n = e.length, r = t.length, i = n < r ? n : r;
	for (let n = 0; n < i; n++) {
		let r = e[n], i = t[n];
		if (r < i) return -1;
		if (r > i) return 1;
	}
	return n < r ? -1 : +(n > r);
}, se = (e, t) => {
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
}, ce = (e) => x.encode(e), le = (e, t, n, r) => {
	let i;
	return i = n === void 0 ? e : r === void 0 ? e.subarray(n) : e.subarray(n, n + r), x.encodeInto(t, i).written;
}, S = String.fromCharCode, ue = (e, t, n) => {
	if (n < 4) {
		if (n < 2) {
			if (n === 0) return "";
			let r = e[t];
			return r & 128 ? null : S(r);
		}
		let r = e[t], i = e[t + 1];
		if ((r | i) & 128) return null;
		if (n === 2) return S(r, i);
		let a = e[t + 2];
		return a & 128 ? null : S(r, i, a);
	}
	let r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3];
	if ((r | i | a | o) & 128) return null;
	if (n < 8) {
		if (n === 4) return S(r, i, a, o);
		let s = e[t + 4];
		if (s & 128) return null;
		if (n === 5) return S(r, i, a, o, s);
		let c = e[t + 5];
		if (c & 128) return null;
		if (n === 6) return S(r, i, a, o, s, c);
		let l = e[t + 6];
		return l & 128 ? null : S(r, i, a, o, s, c, l);
	}
	let s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7];
	if ((s | c | l | u) & 128) return null;
	if (n < 12) {
		if (n === 8) return S(r, i, a, o, s, c, l, u);
		let d = e[t + 8];
		if (d & 128) return null;
		if (n === 9) return S(r, i, a, o, s, c, l, u, d);
		let f = e[t + 9];
		if (f & 128) return null;
		if (n === 10) return S(r, i, a, o, s, c, l, u, d, f);
		let p = e[t + 10];
		return p & 128 ? null : S(r, i, a, o, s, c, l, u, d, f, p);
	}
	let d = e[t + 8], f = e[t + 9], p = e[t + 10], m = e[t + 11];
	if ((d | f | p | m) & 128) return null;
	if (n === 12) return S(r, i, a, o, s, c, l, u, d, f, p, m);
	let h = e[t + 12];
	if (h & 128) return null;
	if (n === 13) return S(r, i, a, o, s, c, l, u, d, f, p, m, h);
	let g = e[t + 13];
	if (g & 128) return null;
	if (n === 14) return S(r, i, a, o, s, c, l, u, d, f, p, m, h, g);
	let _ = e[t + 14];
	return _ & 128 ? null : S(r, i, a, o, s, c, l, u, d, f, p, m, h, g, _);
}, de = (e, t = 0, n = e.length - t) => {
	if (n <= 15) {
		let r = ue(e, t, n);
		if (r !== null) return r;
	}
	return t === 0 && n === e.length ? ne.decode(e) : ne.decode(e.subarray(t, t + n));
}, fe = (e) => e >= 56320 && e <= 57343, pe = (e) => {
	let t = e.length, n = 0, r = 0;
	for (; n + 3 < t;) {
		let t = e.charCodeAt(n), i = e.charCodeAt(n + 1), a = e.charCodeAt(n + 2), o = e.charCodeAt(n + 3);
		if ((t | i | a | o) >= 128) break;
		n += 4, r += 4;
	}
	for (; n < t;) {
		let t = e.charCodeAt(n);
		t < 128 ? (n += 1, r += 1) : t < 2048 ? (n += 1, r += 2) : t < 55296 || t > 56319 ? (n += 1, r += 3) : fe(e.charCodeAt(n + 1)) ? (n += 2, r += 4) : (n += 1, r += 3);
	}
	return r;
}, me = async (e) => new Uint8Array(await re.digest("SHA-256", e)), he = (e, t, n) => (r) => {
	let i = (1 << t) - 1, a = "", o = 0, s = 0;
	for (let n = 0; n < r.length; ++n) for (s = s << 8 | r[n], o += 8; o > t;) o -= t, a += e[i & s >> o];
	if (o !== 0 && (a += e[i & s << t - o]), n) for (; a.length * t & 7;) a += "=";
	return a;
}, ge = (e, t, n) => {
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
		let a = ae(i * t / 8 | 0), s = 0, c = 0, l = 0;
		for (let n = 0; n < i; ++n) {
			let i = e.charCodeAt(n), o = i < 256 ? r[i] : 255;
			if (o === 255) throw SyntaxError("invalid base string");
			c = c << t | o, s += t, s >= 8 && (s -= 8, a[l++] = 255 & c >> s);
		}
		if (s >= t || 255 & c << 8 - s) throw SyntaxError("unexpected end of data");
		return a;
	};
}, _e = (e) => {
	if (e.length >= 255) throw RangeError("alphabet too long");
	let t = e.length, n = e.charAt(0), r = Math.log(256) / Math.log(t);
	return (i) => {
		if (i.length === 0) return "";
		let a = 0, o = 0, s = 0, c = i.length;
		for (; s !== c && i[s] === 0;) s++, a++;
		let l = c - s, u = l * r + 1 >>> 0, d = ie(u);
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
}, ve = (e) => {
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
		if (e.length === 0) return ae(0);
		let o = 0, s = 0, c = 0;
		for (; e[o] === i;) s++, o++;
		let l = e.length - o, u = l * a + 1 >>> 0, d = ie(u);
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
		let p = ae(s + (u - f));
		return p.fill(0, 0, s), p.set(d.subarray(f), s), p;
	};
}, ye = /*#__PURE__*/ he("0123456789abcdef", 4, !1), be = "fromHex" in Uint8Array ? b : ye, xe = /*#__PURE__*/ (() => {
	let e = (/* @__PURE__ */ new Uint8Array(128)).fill(255);
	for (let t = 0; t < 62; t++) e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charCodeAt(t)] = t;
	return e[43] = e[45] = 62, e[47] = e[95] = 63, e;
})(), Se = [
	0,
	2,
	3
], Ce = (e, t) => {
	let n = t % 3;
	if (e.length !== (t / 3 | 0) * 4 + Se[n] || n !== 0 && xe[e.charCodeAt(e.length - 1)] & (n === 1 ? 15 : 3)) throw SyntaxError("invalid base64 string");
}, we = (e, t) => {
	if (e.length !== ((t + 2) / 3 | 0) * 4) throw SyntaxError("invalid base64 string");
}, Te = (e) => {
	let t = Uint8Array.fromBase64(e, {
		alphabet: "base64",
		lastChunkHandling: "loose"
	});
	return Ce(e, t.length), t;
}, Ee = (e) => e.toBase64({
	alphabet: "base64",
	omitPadding: !0
}), De = (e) => {
	let t = Uint8Array.fromBase64(e, {
		alphabet: "base64",
		lastChunkHandling: "strict"
	});
	return we(e, t.length), t;
}, Oe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ke = /*#__PURE__*/ ge(Oe, 6, !1), Ae = /*#__PURE__*/ he(Oe, 6, !1), je = /*#__PURE__*/ ge(Oe, 6, !0), Me = "fromBase64" in Uint8Array, Ne = Me ? Te : ke, Pe = Me ? Ee : Ae, Fe = Me ? De : je, Ie = "abcdefghijklmnopqrstuvwxyz234567", Le = /*#__PURE__*/ (() => {
	let e = /* @__PURE__ */ new Uint8Array(32);
	for (let t = 0; t < 32; t++) e[t] = Ie.charCodeAt(t);
	return e;
})(), Re = String.fromCharCode, ze = (e) => {
	let t = e.length, n = t / 5 | 0, r = t - n * 5, i = Le, a = "", o = 0, s = n / 2 | 0;
	for (let t = 0; t < s; t++) {
		let t = e[o], n = e[o + 1], r = e[o + 2], s = e[o + 3], c = e[o + 4], l = e[o + 5], u = e[o + 6], d = e[o + 7], f = e[o + 8], p = e[o + 9];
		a += Re(i[t >>> 3], i[(t << 2 | n >>> 6) & 31], i[n >>> 1 & 31], i[(n << 4 | r >>> 4) & 31], i[(r << 1 | s >>> 7) & 31], i[s >>> 2 & 31], i[(s << 3 | c >>> 5) & 31], i[c & 31], i[l >>> 3], i[(l << 2 | u >>> 6) & 31], i[u >>> 1 & 31], i[(u << 4 | d >>> 4) & 31], i[(d << 1 | f >>> 7) & 31], i[f >>> 2 & 31], i[(f << 3 | p >>> 5) & 31], i[p & 31]), o += 10;
	}
	if (n & 1) {
		let t = e[o], n = e[o + 1], r = e[o + 2], s = e[o + 3], c = e[o + 4];
		a += Re(i[t >>> 3], i[(t << 2 | n >>> 6) & 31], i[n >>> 1 & 31], i[(n << 4 | r >>> 4) & 31], i[(r << 1 | s >>> 7) & 31], i[s >>> 2 & 31], i[(s << 3 | c >>> 5) & 31], i[c & 31]), o += 5;
	}
	if (r > 0) {
		let n = 0, r = 0;
		for (let i = o; i < t; i++) n = n << 8 | e[i], r += 8;
		for (; r >= 5;) r -= 5, a += Re(i[n >>> r & 31]);
		r > 0 && (a += Re(i[n << 5 - r & 31]));
	}
	return a;
}, Be = "abcdefghijklmnopqrstuvwxyz234567", C = /*#__PURE__*/ (() => {
	let e = (/* @__PURE__ */ new Uint8Array(128)).fill(255);
	for (let t = 0; t < 32; t++) e[Be.charCodeAt(t)] = t;
	return e;
})(), Ve = (e) => {
	let t = e.length, n = ae(t * 5 / 8 | 0), r = 0, i = 0, a = t - t % 8;
	for (; i < a; i += 8) {
		let t = e.charCodeAt(i), a = e.charCodeAt(i + 1), o = e.charCodeAt(i + 2), s = e.charCodeAt(i + 3), c = e.charCodeAt(i + 4), l = e.charCodeAt(i + 5), u = e.charCodeAt(i + 6), d = e.charCodeAt(i + 7);
		if ((t | a | o | s | c | l | u | d) & -128) throw SyntaxError("invalid base string");
		let f = C[t], p = C[a], m = C[o], h = C[s], g = C[c], _ = C[l], v = C[u], y = C[d];
		if ((f | p | m | h | g | _ | v | y) & 224) throw SyntaxError("invalid base string");
		n[r] = f << 3 | p >>> 2, n[r + 1] = (p << 6 | m << 1 | h >>> 4) & 255, n[r + 2] = (h << 4 | g >>> 1) & 255, n[r + 3] = (g << 7 | _ << 2 | v >>> 3) & 255, n[r + 4] = (v << 5 | y) & 255, r += 5;
	}
	if (i < t) {
		let a = 0, o = 0;
		for (; i < t; ++i) {
			let t = e.charCodeAt(i), s = t < 128 ? C[t] : 255;
			if (s & 224) throw SyntaxError("invalid base string");
			o = o << 5 | s, a += 5, a >= 8 && (a -= 8, n[r++] = 255 & o >> a);
		}
		if (a >= 5 || 255 & o << 8 - a) throw SyntaxError("unexpected end of data");
	}
	return n;
}, He = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", Ue = /*#__PURE__*/ ve(He), We = /*#__PURE__*/ _e(He), Ge = (e, t) => {
	if (t.length !== 32) throw RangeError("invalid digest length");
	let n = ae(36);
	return n[0] = 1, n[1] = e, n[2] = 18, n[3] = 32, n.set(t, 4), {
		version: 1,
		codec: e,
		digest: {
			codec: 18,
			contents: n.subarray(4, 36)
		},
		bytes: n
	};
}, Ke = async (e, t) => Ge(e, await me(t)), qe = (e) => {
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
}, Je = (e) => {
	let [t, n] = qe(e);
	if (n.length !== 0) throw RangeError("cid bytes includes remainder");
	return t;
}, Ye = (e) => {
	if (e.length !== 59 || e[0] !== "b") throw SyntaxError("not a valid cid string");
	return Je(Ve(e.slice(1)));
}, Xe = (e) => `b${ze(e.bytes)}`, Ze = (e) => {
	if (e.length !== 37 || e[0] !== 0) throw SyntaxError("invalid binary cid");
	return Je(e.subarray(1));
}, Qe = Symbol.for("@atcute/cid-link-wrapper"), w = class {
	[Qe] = !0;
	bytes;
	constructor(e) {
		this.bytes = e;
	}
	get $link() {
		let e = `b${ze(this.bytes)}`;
		return Object.defineProperty(this, "$link", {
			value: e,
			enumerable: !0
		}), e;
	}
	toJSON() {
		return { $link: this.$link };
	}
}, $e = (e) => e instanceof w ? e.bytes : Ye(e.$link).bytes, et = Symbol.for("@atcute/bytes-wrapper"), tt = class {
	[et] = !0;
	buf;
	constructor(e) {
		this.buf = e;
	}
	get $bytes() {
		return Pe(this.buf);
	}
	toJSON() {
		return { $bytes: this.$bytes };
	}
}, nt = (e) => new tt(e), rt = (e) => {
	if (e instanceof tt) return e.buf;
	let t = e.$bytes;
	return t.charCodeAt(t.length - 1) === 61 ? Fe(t) : Ne(t);
}, it = 8, at = (e, t) => {
	if (t > e.b.length - e.p) throw RangeError("unexpected end of input");
}, ot = (e, t) => {
	if (t < 24) return t;
	let n;
	switch (t) {
		case 24:
			if (at(e, 1), n = ct(e), n < 24) throw TypeError("non-canonical argument encoding");
			break;
		case 25:
			if (at(e, 2), n = lt(e), n < 256) throw TypeError("non-canonical argument encoding");
			break;
		case 26:
			if (at(e, 4), n = ut(e), n < 65536) throw TypeError("non-canonical argument encoding");
			break;
		case 27:
			if (at(e, 8), n = dt(e), n < 4294967296) throw TypeError("non-canonical argument encoding");
			break;
		default: throw Error(`invalid argument encoding; got ${t}`);
	}
	return n;
}, st = (e) => {
	at(e, 8);
	let t = (e.v ??= new DataView(e.b.buffer, e.b.byteOffset, e.b.byteLength)).getFloat64(e.p);
	if (!Number.isFinite(t)) throw RangeError("NaN and Infinity values not supported");
	return e.p += 8, t;
}, ct = (e) => e.b[e.p++], lt = (e) => {
	let t = e.p, n = e.b, r = n[t++] << 8 | n[t++];
	return e.p = t, r;
}, ut = (e) => {
	let t = e.p, n = e.b, r = (n[t++] << 24 | n[t++] << 16 | n[t++] << 8 | n[t++]) >>> 0;
	return e.p = t, r;
}, dt = (e) => {
	let t = ut(e), n = ut(e);
	if (t > 2097151) throw RangeError("can't decode integers beyond safe integer range");
	return t * 2 ** 32 + n;
}, ft = (e, t) => {
	at(e, t);
	let n = de(e.b, e.p, t);
	return e.p += t, n;
}, pt = (e, t) => {
	at(e, t);
	let n = e.b.subarray(e.p, e.p += t);
	return nt(t * it <= n.buffer.byteLength ? new Uint8Array(n) : n);
}, mt = (e, t) => {
	at(e, t);
	let n = e.b, r = e.p;
	if (t !== 37 || n[r] !== 0 || n[r + 1] !== 1 || n[r + 2] !== 113 && n[r + 2] !== 85 || n[r + 3] !== 18 || n[r + 4] !== 32) return new w(Ze(new Uint8Array(n.subarray(r, e.p += t))).bytes);
	let i = /* @__PURE__ */ new Uint8Array(36);
	for (let e = 0; e < 36; e++) i[e] = n[r + 1 + e];
	return e.p = r + t, new w(i);
}, ht = (e) => {
	at(e, 1);
	let t = ct(e), n = t >> 5;
	if (n !== 3) throw TypeError(`expected map to only have string keys; got type ${n}`);
	let r = t & 31, i = r < 24 ? r : ot(e, r);
	return e.ks = e.p, e.kl = i, ft(e, i);
}, gt = (e) => {
	let t = e.length, n = {
		b: e,
		v: null,
		p: 0,
		ks: 0,
		kl: 0
	}, r = null, i;
	jump: for (; n.p < t;) {
		let t = ct(n), a = t >> 5, o = t & 31, s = a === 7 ? 0 : o < 24 ? o : ot(n, o);
		switch (a) {
			case 0:
				i = s;
				break;
			case 1:
				if (i = -1 - s, i < -(2 ** 53 - 1)) throw RangeError("can't decode integers beyond safe integer range");
				break;
			case 2:
				i = pt(n, s);
				break;
			case 3:
				i = ft(n, s);
				break;
			case 4:
				if (s > 0) {
					at(n, s), r = {
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
					let e = ht(n);
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
						at(n, 1);
						let e = ct(n), t = e >> 5, r = e & 31;
						if (t !== 2) throw TypeError(`expected cid-link to be type 2 (bytes); got type ${t}`);
						i = mt(n, ot(n, r));
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
						i = st(n);
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
					r.k = ht(n);
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
}, _t = (e) => {
	let [t, n] = gt(e);
	if (n.length !== 0) throw Error("decoded value contains remainder");
	return t;
}, vt = 9, yt = 1024, bt = 32, xt = Math.max, St = Number.isInteger, Ct = Number.isFinite, wt = 2 ** 53 - 1, Tt = -(2 ** 53 - 1), Et = (e, t) => {
	let n = e.b, r = e.p;
	n.byteLength < r + t && (r > 0 && (e.c.push(n.subarray(0, r)), e.l += r), e.b = ae(xt(yt, t)), e.v = null, e.p = 0);
}, Dt = (e) => e < 24 ? 1 : e < 256 ? 2 : e < 65536 ? 3 : e < 4294967296 ? 5 : 9, Ot = (e, t) => {
	let n = e.b;
	(e.v ??= new DataView(n.buffer, n.byteOffset, n.byteLength)).setFloat64(e.p, t), e.p += 8;
}, kt = (e, t) => {
	e.b[e.p++] = t;
}, At = (e, t) => {
	let n = e.p, r = e.b;
	r[n++] = t >>> 8, r[n++] = t & 255, e.p = n;
}, jt = (e, t) => {
	let n = e.p, r = e.b;
	r[n++] = t >>> 24, r[n++] = t >>> 16 & 255, r[n++] = t >>> 8 & 255, r[n++] = t & 255, e.p = n;
}, Mt = (e, t) => {
	let n = e.p, r = e.b, i = t / 2 ** 32 | 0, a = t >>> 0;
	r[n++] = i >>> 24, r[n++] = i >>> 16 & 255, r[n++] = i >>> 8 & 255, r[n++] = i & 255, r[n++] = a >>> 24, r[n++] = a >>> 16 & 255, r[n++] = a >>> 8 & 255, r[n++] = a & 255, e.p = n;
}, Nt = (e, t, n) => {
	n < 24 ? kt(e, t << 5 | n) : n < 256 ? (kt(e, t << 5 | 24), kt(e, n)) : n < 65536 ? (kt(e, t << 5 | 25), At(e, n)) : n < 4294967296 ? (kt(e, t << 5 | 26), jt(e, n)) : (kt(e, t << 5 | 27), Mt(e, n));
}, Pt = (e, t) => {
	Et(e, vt), t < 0 ? Nt(e, 1, -t - 1) : Nt(e, 0, t);
}, Ft = (e, t) => {
	Et(e, 9), kt(e, 251), Ot(e, t);
}, It = (e, t) => {
	if (!Ct(t)) throw RangeError("NaN and Infinity values not supported");
	if (t > wt || t < Tt) throw RangeError("can't encode numbers beyond safe integer range");
	St(t) ? Pt(e, t) : Ft(e, t);
}, Lt = (e, t) => {
	let n = t.length;
	if (n === 0) {
		Et(e, 1), kt(e, 96);
		return;
	}
	if (n >= yt) {
		let n = pe(t);
		Et(e, n + Dt(n)), Nt(e, 3, n), le(e.b, t, e.p, n), e.p += n;
		return;
	}
	Et(e, n * 3 + vt);
	ascii: {
		let r = e.p + Dt(n), i = t.charCodeAt(0);
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
		Nt(e, 3, n), e.p += n;
		return;
	}
	let r = Dt(n * 2), i = e.p + r, a = le(e.b, t, i), o = Dt(a);
	r !== o && e.b.copyWithin(e.p + o, i, i + a), Nt(e, 3, a), e.p += a;
}, Rt = (e, t) => {
	let n = rt(t), r = n.byteLength;
	Et(e, r + Dt(r)), Nt(e, 2, r), e.b.set(n, e.p), e.p += r;
}, zt = (e, t) => {
	let n = $e(t), r = n.byteLength + 1;
	Et(e, r + 18), Nt(e, 6, 42), Nt(e, 2, r), e.b[e.p] = 0, e.b.set(n, e.p + 1), e.p += r;
}, Bt = (e, t) => {
	switch (typeof t) {
		case "boolean": return Et(e, 1), kt(e, 244 + +t);
		case "number": return It(e, t);
		case "string": return Lt(e, t);
		case "object":
			if (t === null) return Et(e, 1), kt(e, 246);
			if (Array.isArray(t)) {
				let n = t.length;
				Et(e, vt), Nt(e, 4, n);
				for (let r = 0; r < n; r++) Bt(e, t[r]);
				return;
			}
			if (t.constructor === Object) {
				let n = Wt(t), r = n.length;
				if (r === 1) {
					let r = n[0];
					if (r === "$link") {
						if (typeof t.$link == "string") {
							zt(e, t);
							return;
						}
						throw TypeError("unexpected cid-link value");
					}
					if (r === "$bytes") {
						if (typeof t.$bytes == "string") {
							Rt(e, t);
							return;
						}
						throw TypeError("unexpected bytes value");
					}
				}
				Et(e, vt), Nt(e, 5, r);
				for (let i = 0; i < r; i++) {
					let r = n[i];
					Lt(e, r), Bt(e, t[r]);
				}
				return;
			}
			if ("$link" in t) {
				if (t instanceof w || typeof t.$link == "string") {
					zt(e, t);
					return;
				}
				throw TypeError("unexpected cid-link value");
			}
			if ("$bytes" in t) {
				if (t instanceof tt || typeof t.$bytes == "string") {
					Rt(e, t);
					return;
				}
				throw TypeError("unexpected bytes value");
			}
	}
	throw TypeError(`unsupported type: ${t}`);
}, Vt = () => ({
	c: [],
	b: ae(yt),
	v: null,
	p: 0,
	l: 0
}), Ht = (e) => {
	let t = Vt();
	Bt(t, e);
	let n = t.b.subarray(0, t.p);
	return t.c.length ? (t.c.push(n), se(t.c, t.l + t.p)) : n;
}, Ut = (e) => {
	let t = e.length;
	if (t > bt) {
		let n = /* @__PURE__ */ new Map();
		for (let r = 0; r < t; r++) {
			let t = e[r];
			n.set(t, { length: pe(t) });
		}
		e.sort((e, t) => {
			let r = n.get(e), i = n.get(t);
			return r.length - i.length || oe(r.bytes ??= ce(e), i.bytes ??= ce(t));
		});
		return;
	}
	let n = Array(t), r = Array(t);
	for (let r = 0; r < t; r++) n[r] = pe(e[r]);
	for (let i = 1; i < t; i++) {
		let t = e[i], a = n[i], o = r[i], s = i - 1;
		for (; s >= 0; s--) {
			let i = a - n[s];
			if (i === 0 && (i = oe(o ??= ce(t), r[s] ??= ce(e[s]))), i > 0) break;
			e[s + 1] = e[s], n[s + 1] = n[s], r[s + 1] = r[s];
		}
		e[s + 1] = t, n[s + 1] = a, r[s + 1] = o;
	}
}, Wt = (e) => {
	let t = Object.keys(e), n = 0, r = !0, i = t.length > bt;
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
	return t.length = n, r && i ? t.sort((e, t) => e.length - t.length || (e < t ? -1 : 1)) : r || Ut(t), t;
}, Gt = {
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
}, Kt = {
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
}, qt = {
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
}, Jt = {
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
}, Yt = {
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
}, Xt = {
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
}, Zt = {
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
}, Qt = {
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
}, $t = {
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
}, en = {
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
}, tn = {
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
}, nn = {
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
}, rn = {
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
}, an = {
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
}, on = {
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
}, sn = {
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
}, cn = {
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
}, ln = {
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
}, un = {
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
}, dn = {
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
}, fn = {
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
}, pn = {
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
}, mn = {
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
}, hn = {
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
}, gn = {
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
}, _n = {
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
}, vn = {
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
}, yn = {
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
}, bn = {
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
}, xn = {
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
}, Sn = {
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
}, Cn = {
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
}, wn = {
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
}, Tn = {
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
}, En = {
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
}, Dn = {
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
}, On = {
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
}, kn = {
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
}, An = {
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
}, jn = {
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
}, Mn = {
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
}, Nn = {
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
}, Pn = {
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
}, Fn = {
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
}, In = {
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
}, Ln = {
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
}, Rn = {
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
}, zn = {
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
}, Bn = {
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
}, Vn = {
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
}, Hn = {
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
}, Un = {
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
}, Wn = {
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
}, Gn = {
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
}, Kn = {
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
}, Yn = {
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
}, Xn = {
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
}, Zn = {
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
}, Qn = {
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
}, $n = {
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
}, er = {
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
}, tr = {
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
}, nr = {
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
}, rr = {
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
}, ir = {
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
}, ar = {
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
}, or = {
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
}, sr = {
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
}, ur = {
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
}, dr = {
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
}, fr = {
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
}, pr = {
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
}, mr = {
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
}, hr = {
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
}, gr = {
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
}, _r = {
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
}, vr = {
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
}, yr = {
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
}, br = {
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
}, xr = {
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
}, Sr = {
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
}, Cr = {
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
}, wr = {
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
}, Tr = {
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
}, Er = {
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
}, Dr = {
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
}, Or = {
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
}, kr = {
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
}, Ar = {
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
}, jr = {
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
}, Mr = {
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
}, Nr = {
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
}, Pr = {
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
}, Fr = {
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
}, Ir = {
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
}, Lr = {
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
}, Rr = {
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
}, zr = {
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
}, Br = {
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
}, Vr = {
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
}, Hr = {
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
}, Ur = {
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
}, Wr = {
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
}, Gr = {
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
}, Kr = {
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
}, qr = {
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
}, Jr = {
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
}, Yr = {
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
}, Xr = {
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
}, Zr = {
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
}, Qr = {
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
}, $r = {
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
}, ei = {
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
}, ti = {
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
}, ni = {
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
}, ri = {
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
}, ii = {
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
}, ai = {
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
}, oi = {
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
}, si = {
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
}, ci = {
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
}, li = {
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
}, ui = {
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
}, di = {
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
}, fi = {
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
}, pi = {
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
}, mi = {
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
}, hi = {
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
}, gi = {
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
}, _i = {
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
}, vi = {
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
}, yi = {
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
}, bi = {
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
}, xi = {
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
}, Si = {
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
}, Ci = {
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
}, wi = {
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
}, Ti = {
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
}, Ei = {
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
}, Di = {
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
}, Oi = {
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
}, ki = {
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
}, Ai = {
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
}, ji = {
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
}, Mi = {
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
}, Ni = {
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
}, Pi = {
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
}, Fi = {
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
}, Ii = {
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
}, Li = {
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
}, Ri = {
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
}, zi = {
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
}, Bi = {
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
}, Vi = {
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
}, Hi = {
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
}, Ui = {
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
}, Wi = {
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
}, Gi = {
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
}, Ki = {
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
}, qi = {
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
}, Ji = {
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
}, Yi = {
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
}, Xi = {
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
}, Zi = {
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
}, Qi = {
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
}, $i = {
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
}, ea = {
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
}, ta = {
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
}, na = {
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
}, ra = {
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
}, ia = {
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
}, aa = {
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
}, oa = {
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
}, sa = {
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
}, ca = {
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
}, la = {
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
}, ua = {
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
}, da = {
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
}, fa = {
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
}, pa = {
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
}, ma = {
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
}, ha = {
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
}, ga = {
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
}, _a = {
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
}, va = {
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
}, ya = {
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
}, ba = {
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
}, xa = {
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
}, Sa = {
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
}, Ca = {
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
}, wa = {
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
}, Ta = {
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
}, Ea = {
	name: "atseq",
	version: "0.1.0",
	lockfileVersion: 3,
	requires: !0,
	packages: /* @__PURE__ */ JSON.parse("{\"\":{\"name\":\"atseq\",\"version\":\"0.1.0\",\"bundleDependencies\":true,\"license\":\"Apache-2.0\",\"dependencies\":{\"@atcute/car\":\"6.1.0\",\"@atcute/cbor\":\"2.3.8\",\"@atcute/cid\":\"2.5.0\",\"@atcute/crypto\":\"2.4.4\",\"@atcute/did-plc\":\"1.0.2\",\"@atcute/mst\":\"1.1.1\",\"@atcute/multibase\":\"1.2.5\",\"@atcute/repo\":\"1.1.0\",\"@atcute/varint\":\"2.0.2\",\"@atproto-labs/fetch-node\":\"0.4.0\",\"@atproto/common-web\":\"0.5.10\",\"@atproto/did\":\"0.3.0\",\"@atproto/lexicon\":\"0.7.12\",\"@atproto/oauth-client-browser\":\"0.5.8\",\"@atproto/oauth-client-node\":\"0.5.8\",\"@atproto/syntax\":\"0.7.5\",\"@inlay/core\":\"0.0.13\",\"@inlay/render\":\"0.3.1\",\"@noble/secp256k1\":\"3.2.0\",\"jsonata\":\"2.2.2\",\"jsonc-parser\":\"3.3.1\",\"valibot\":\"1.5.0\"},\"bin\":{\"atseq\":\"dist/src/cli/main.js\",\"atseq-host\":\"dist/src/host/main.js\"},\"devDependencies\":{\"@ipld/dag-cbor\":\"7.0.3\",\"@playwright/test\":\"1.63.0\",\"@types/node\":\"26.4.1\",\"multiformats\":\"9.9.0\",\"prettier\":\"3.9.9\",\"ts-morph\":\"27.0.2\",\"tsx\":\"4.23.13\",\"typescript\":\"7.0.2\",\"vite\":\"8.2.2\"},\"engines\":{\"node\":\">=22.19\"}},\"node_modules/@atcute/car\":{\"version\":\"6.1.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/car/-/car-6.1.0.tgz\",\"integrity\":\"sha512-Dp7MlyI3YT7NiIUK6bm2ZyA95Pdun+DuFlcr40ZsGdqhOkKrctZT7wMZXSs6IYd7RorjSnddEJDh51hqrkNSPQ==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/uint8array\":\"^1.2.0\",\"@atcute/varint\":\"^2.0.2\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.0.0\"}},\"node_modules/@atcute/cbor\":{\"version\":\"2.3.8\",\"resolved\":\"https://registry.npmjs.org/@atcute/cbor/-/cbor-2.3.8.tgz\",\"integrity\":\"sha512-gazXBcNTr2U3cRaCjfRbq2GKHJnWapUUA3mgehL+0tbVXEty2wf/LIwF9z46gjqjX2DYGGwkybF8lTI3dzHaNQ==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cid\":\"^2.5.0\",\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cid\":\"^2.5.0\"}},\"node_modules/@atcute/cid\":{\"version\":\"2.5.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/cid/-/cid-2.5.0.tgz\",\"integrity\":\"sha512-CAZyzUdaQhuC+S7tGjoC7vgyDI2X4JU+CPO/7WjEU7HlNsAGXjSkD++5TlfnSWGDqUeqpjMZjUfFBZYHKzPHew==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.2.0\"}},\"node_modules/@atcute/crypto\":{\"version\":\"2.4.4\",\"resolved\":\"https://registry.npmjs.org/@atcute/crypto/-/crypto-2.4.4.tgz\",\"integrity\":\"sha512-Yc7lXz4ndDjbs+/WrKeGS+sVEr+sx8xi5zSVInKNl0FAEY6KbvcT+bjaU9A3erUVviFp9yEcu/1aSg/f+GPpBg==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.1.5\",\"@noble/secp256k1\":\"^3.1.0\"}},\"node_modules/@atcute/did-plc\":{\"version\":\"1.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/did-plc/-/did-plc-1.0.2.tgz\",\"integrity\":\"sha512-z/gltUzhSeHN2LKosOsU5Fo8uS4p7c7oDydEDQcFK2DwM1u1jHghc5kYaKOQcriOcLXzf9/OetKQOU4P57uhVA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.7\",\"@atcute/cid\":\"^2.4.2\",\"@atcute/crypto\":\"^2.4.4\",\"@atcute/identity\":\"^2.0.2\",\"@atcute/lexicons\":\"^2.1.0\",\"@atcute/multibase\":\"^1.2.5\",\"@atcute/uint8array\":\"^1.1.5\",\"@atcute/util-fetch\":\"^2.0.2\",\"valibot\":\"^1.5.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.0.0\",\"@atcute/identity\":\"^2.0.0\",\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/identity\":{\"version\":\"2.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/identity/-/identity-2.0.2.tgz\",\"integrity\":\"sha512-amr/EQceqVtBVmjBK4uUF7nKKYuRttadigpvOcAn4dnO6SNSwSjQi8KDH9LnukEotPsSP4UDsQvNfHWEoUcslw==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/lexicons\":\"^2.0.3\",\"valibot\":\"^1.4.2\"},\"peerDependencies\":{\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/lexicons\":{\"version\":\"2.1.1\",\"resolved\":\"https://registry.npmjs.org/@atcute/lexicons/-/lexicons-2.1.1.tgz\",\"integrity\":\"sha512-kHyqUW8g/Fq9LTctGh0TVBx0AmtecV6VSrRprrSbqKqHe9q8C6y+YPL3EMNq2l93XA1iDHkkvYwLdTcKL/lNbA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/uint8array\":\"^1.1.5\",\"@atcute/util-text\":\"^1.3.4\",\"@oomfware/eval\":\"^0.1.0\",\"@standard-schema/spec\":\"^1.1.0\",\"esm-env\":\"^1.2.2\"}},\"node_modules/@atcute/mst\":{\"version\":\"1.1.1\",\"resolved\":\"https://registry.npmjs.org/@atcute/mst/-/mst-1.1.1.tgz\",\"integrity\":\"sha512-QWoW69Pg5RWrc0B98Cp5K4UjeXI+2vzBrWmoBUW4nSR51LsamOnG9HsWovcOoCRhnj1ZYAMlnAc5Eh8+gJFoSA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.5.0\"}},\"node_modules/@atcute/multibase\":{\"version\":\"1.2.5\",\"resolved\":\"https://registry.npmjs.org/@atcute/multibase/-/multibase-1.2.5.tgz\",\"integrity\":\"sha512-cReTONgYpQo/VHD3ZmzPNoyBKJgSk1J4h//cvvdVVJBMar+SjlQ/sUXeTjQfuyfmDKv+TLKhmutLcvbMcQ9Rvw==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/uint8array\":\"^1.1.5\"}},\"node_modules/@atcute/repo\":{\"version\":\"1.1.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/repo/-/repo-1.1.0.tgz\",\"integrity\":\"sha512-WXOh05E/NT39oqkNm3xIit4ysJIZxmkQ1GWOkwDNvTYIDW0CYqwThQ+837r72/Tr490E1Zvz09xOOjtx/XmlhA==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"@atcute/car\":\"^6.1.0\",\"@atcute/cbor\":\"^2.3.8\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/crypto\":\"^2.4.4\",\"@atcute/lexicons\":\"^2.1.1\",\"@atcute/mst\":\"^1.1.1\",\"@atcute/uint8array\":\"^1.2.0\"},\"peerDependencies\":{\"@atcute/cbor\":\"^2.0.0\",\"@atcute/cid\":\"^2.5.0\",\"@atcute/lexicons\":\"^2.0.0\"}},\"node_modules/@atcute/uint8array\":{\"version\":\"1.2.0\",\"resolved\":\"https://registry.npmjs.org/@atcute/uint8array/-/uint8array-1.2.0.tgz\",\"integrity\":\"sha512-KoBGTbV4lS8zXNu91osM3FecrH3NUnxNPsBAkaNtn6uf/p240245qoLn7keFpRM0npX522X8R+XBBb2rvtE7Rg==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/@atcute/util-fetch\":{\"version\":\"2.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/util-fetch/-/util-fetch-2.0.2.tgz\",\"integrity\":\"sha512-I0oenHlJjwRpWPyAJojox5H0z9NthhdMFaEjtkxyjo85VPPxk1vMJk/1ZjMJsrs1SgHhB3spazEWzV5DW8w70A==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"valibot\":\"^1.4.2\"}},\"node_modules/@atcute/util-text\":{\"version\":\"1.3.4\",\"resolved\":\"https://registry.npmjs.org/@atcute/util-text/-/util-text-1.3.4.tgz\",\"integrity\":\"sha512-u2UAM7iSM09sQaSG9jtxWFSPgB8boVj50/BoyMvYnhVgGBu+nXIuAcdDUQCsZA44YZgTPPhN/b86JX+jH7SPzQ==\",\"inBundle\":true,\"license\":\"0BSD\",\"dependencies\":{\"unicode-segmenter\":\"^0.17.0\"}},\"node_modules/@atcute/util-text/node_modules/unicode-segmenter\":{\"version\":\"0.17.3\",\"resolved\":\"https://registry.npmjs.org/unicode-segmenter/-/unicode-segmenter-0.17.3.tgz\",\"integrity\":\"sha512-hKZwqBjJDmqNrq1+LjDxck1qLzJFcLLJM2Xq92ORRHOuau6GSHeELmn+uyk6zNH1CK9mogrUJGP9WJCJUQXMAw==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@atcute/varint\":{\"version\":\"2.0.2\",\"resolved\":\"https://registry.npmjs.org/@atcute/varint/-/varint-2.0.2.tgz\",\"integrity\":\"sha512-/+hS1juMgnmf6eL6lICUkTw7wcGTo3I+Q0L1PI521mUz77rGSC6nXAUNKtvm2wYJpuWdEGq+GILGoYkOArn0TQ==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.2.6.tgz\",\"integrity\":\"sha512-2K1bC04nI2fmgNcvof+yA28IhGlpWn2JKYlPa7To9JTKI45FINCGkQSGiL2nyXlyzDJJ34fZ1aq6/IRFIOIiqg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"0.2.3\",\"@atproto-labs/pipe\":\"0.1.1\",\"@atproto-labs/simple-store\":\"0.3.0\",\"@atproto-labs/simple-store-memory\":\"0.1.4\",\"@atproto/did\":\"0.3.0\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto-labs/fetch\":{\"version\":\"0.2.3\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.2.3.tgz\",\"integrity\":\"sha512-NZtbJOCbxKUFRFKMpamT38PUQMY0hX0p7TG5AEYOPhZKZEP7dHZ1K2s1aB8MdVH0qxmqX7nQleNrrvLf09Zfdw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"0.1.1\"}},\"node_modules/@atproto-labs/fetch-node\":{\"version\":\"0.4.0\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch-node/-/fetch-node-0.4.0.tgz\",\"integrity\":\"sha512-5Yi8fz/JDGEoObRgRJuglcodB/MJeQnnoqokOGSQK5ItISObSttbGIgHE1UMU1njcwxbvKtbGMWHUCRgqML2Dw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"ipaddr.js\":\"^2.1.0\",\"undici_v6\":\"npm:undici@^6.x\",\"undici_v7\":\"npm:undici@^7.x\",\"undici_v8\":\"npm:undici@^8.x\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto-labs/handle-resolver\":{\"version\":\"0.4.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/handle-resolver/-/handle-resolver-0.4.10.tgz\",\"integrity\":\"sha512-hsYYvGhi6Tv6f4Fti//i/vllVIb/wrJaOcbT3Yh7oo10VxBKAyxzVaB7mIJcho2YJ5kHd2kbCYYPWLw8pvm/bg==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver-node\":{\"version\":\"0.2.11\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/handle-resolver-node/-/handle-resolver-node-0.2.11.tgz\",\"integrity\":\"sha512-stwXuolGIs8ULdLRCwr616A4268CP2jTYOKZOlR7rzMLKjMNaxYVFktbqWUtqKq1nqdqaKxSk+MZNTFrqCjaHQ==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch-node\":\"^0.4.0\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto/did\":\"^0.5.6\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver\":{\"version\":\"0.4.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/identity-resolver/-/identity-resolver-0.4.10.tgz\",\"integrity\":\"sha512-deKu7csOsM8lnIRnLa97te6ODIUx0Lm3Srxid/Ix+UYQqFKA0sIpfYmHZduAK7B+aTqiPcHjoA9Y/qpJyzgnMw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver\":\"^0.4.10\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto-labs/pipe\":{\"version\":\"0.1.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.1.1.tgz\",\"integrity\":\"sha512-hdNw2oUs2B6BN1lp+32pF7cp8EMKuIN5Qok2Vvv/aOpG/3tNSJ9YkvfI0k6Zd188LeDDYRUpYpxcoFIcGH/FNg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@atproto-labs/simple-store\":{\"version\":\"0.3.0\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.3.0.tgz\",\"integrity\":\"sha512-nOb6ONKBRJHRlukW1sVawUkBqReLlLx6hT35VS3imaNPwiXDxLnTK7lxw3Lrl9k5yugSBDQAkZAq3MPTEFSUBQ==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.1.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.1.4.tgz\",\"integrity\":\"sha512-3mKY4dP8I7yKPFj9VKpYyCRzGJOi5CEpOLPlRhoJyLmgs3J4RzDrjn323Oakjz2Aj2JzRU/AIvWRAZVhpYNJHw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"0.3.0\",\"lru-cache\":\"^10.2.0\"}},\"node_modules/@atproto/common\":{\"version\":\"0.5.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/common/-/common-0.5.16.tgz\",\"integrity\":\"sha512-DTWgaVlDJN3zDxJ3agZK3pbiSZc+z8QQe9iy15sIuorLrceIp4kHXMO/QqjWBXnmLVTd6+/5BVDzex5amYc0rg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.4.20\",\"@atproto/lex-cbor\":\"^0.0.16\",\"@atproto/lex-data\":\"^0.0.15\",\"multiformats\":\"^9.9.0\",\"pino\":\"^8.21.0\"},\"engines\":{\"node\":\">=18.7.0\"}},\"node_modules/@atproto/common-web\":{\"version\":\"0.5.10\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.5.10.tgz\",\"integrity\":\"sha512-w4JUdsJ3VXt8ewkavYh5m/u0UbxDtFdCKhNZPEpJ0U1vcWIjDaSInIexteETDgD7fBJAhidIEi30MGz1kk49ug==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.1.7\",\"@atproto/lex-json\":\"^0.1.6\",\"@atproto/syntax\":\"^0.7.5\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/common/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-cbor\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-cbor/-/lex-cbor-0.0.16.tgz\",\"integrity\":\"sha512-x3NTvOX5/4Wh7uk8RNJpUJqZjcWRSUYDYRJ6VZPLmp/CAnsMySmBAinBu/dva/1hqS3C1oiYz258x6bRYpKJ4w==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/common/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/common/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/crypto\":{\"version\":\"0.4.5\",\"resolved\":\"https://registry.npmjs.org/@atproto/crypto/-/crypto-0.4.5.tgz\",\"integrity\":\"sha512-n40aKkMoCatP0u9Yvhrdk6fXyOHFDDbkdm4h4HCyWW+KlKl8iXfD5iV+ECq+w5BM+QH25aIpt3/j6EUNerhLxw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@noble/curves\":\"^1.7.0\",\"@noble/hashes\":\"^1.6.1\",\"uint8arrays\":\"3.0.0\"},\"engines\":{\"node\":\">=18.7.0\"}},\"node_modules/@atproto/did\":{\"version\":\"0.3.0\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.3.0.tgz\",\"integrity\":\"sha512-raUPzUGegtW/6OxwCmM8bhZvuIMzxG5t9oWsth6Tp91Kb5fTnHV2h/KKNF1C82doeA4BdXCErTyg7ISwLbQkzA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/jwk\":{\"version\":\"0.7.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/jwk/-/jwk-0.7.4.tgz\",\"integrity\":\"sha512-tq7TUDmNfe1yDfpRgdGQMJdl9TUlJmREQNCag9yg5w8Evu+TOiFiLgiOCbo7X4ouRPSgd1DpOzXbUa8UyKKMZA==\",\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/jwk-jose\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/jwk-jose/-/jwk-jose-0.2.4.tgz\",\"integrity\":\"sha512-gzDoA0JTwnc0ZJOBLM7WX9xFxtynRS2K1Bofb8epzoMWDQvyvfbPcfkdPrKFM7NXCFUVpGpBnsCB8KFPTf1rCg==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/jwk\":\"^0.7.4\",\"jose\":\"^5.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/jwk-webcrypto\":{\"version\":\"0.3.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/jwk-webcrypto/-/jwk-webcrypto-0.3.4.tgz\",\"integrity\":\"sha512-UsFIUozqnRecXPo6HgKV4PW4FqYHxX1V3iAe0rRV6Q2RSfYD8V2mZ89pv8NpvJynnaqJArBQ7HZlcg0F4tRYhA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-jose\":\"^0.2.4\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/jwk/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"license\":\"Apache-2.0 OR MIT\",\"inBundle\":true},\"node_modules/@atproto/lex\":{\"version\":\"0.0.18\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex/-/lex-0.0.18.tgz\",\"integrity\":\"sha512-uHqtV2gZNYOkOYXq1t6wO2Nb0gFfGmi40AGCVbTNccIkHsZvxRuLlaNuNrBFB+5h/HzlVeMwjBUf0ny3jD4hXw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-builder\":\"^0.0.16\",\"@atproto/lex-client\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-installer\":\"^0.0.18\",\"@atproto/lex-json\":\"^0.0.12\",\"@atproto/lex-schema\":\"^0.0.13\",\"tslib\":\"^2.8.1\",\"yargs\":\"^17.0.0\"},\"bin\":{\"lex\":\"bin/lex\",\"ts-lex\":\"bin/lex\"}},\"node_modules/@atproto/lex-builder\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-builder/-/lex-builder-0.0.16.tgz\",\"integrity\":\"sha512-z9h6kLiifyL0mBVzlHJ3cK3XwhHRttSePmk2XmhQ1gC0tfa7exUhvCMp9YpEv2N5oUVMItl00L8SLBsVsuMMtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-schema\":\"^0.0.13\",\"prettier\":\"^3.2.5\",\"ts-morph\":\"^27.0.0\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-cbor\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-cbor/-/lex-cbor-0.0.13.tgz\",\"integrity\":\"sha512-63nbzXJnQwV02XGpEa8WZxt7Zu87dnbzrUVL0Mqr55S1EGCzEF9U7Dauc9tKKLoZ88GmYrJN0irBsXtSi0VeWg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-client\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-client/-/lex-client-0.0.13.tgz\",\"integrity\":\"sha512-NftQ9SSIilMFFj99fBlv1hvZ6Oe4Bl+HYn4VkXrWsGrHeOIM3GLgVZSMWAlg33rCvd6bYfb+YnIdPxcV6lCU0g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-json\":\"^0.0.12\",\"@atproto/lex-schema\":\"^0.0.13\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-client/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-client/node_modules/@atproto/lex-json\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.12.tgz\",\"integrity\":\"sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-data\":{\"version\":\"0.1.7\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.1.7.tgz\",\"integrity\":\"sha512-kW/dPLqo/WgCLV+XESR4JKwV6c1rZWJGOfuPupZGTjEDAKoBbKXdaEzX9/1vKQYbZ9U3j0DS/n7OFFK7wBugyQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^13.0.0\",\"tslib\":\"^2.8.1\",\"unicode-segmenter\":\"^0.14.0\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/lex-data/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"inBundle\":true,\"license\":\"Apache-2.0 OR MIT\"},\"node_modules/@atproto/lex-document\":{\"version\":\"0.0.14\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-document/-/lex-document-0.0.14.tgz\",\"integrity\":\"sha512-BaCSZOZUIv3kQ23b3Lhe4sprJYHc0spSeWS3TLaMoVi6bFZ3RzeM8n7ROTzVP3BTNYxpRHPHtOarx9A8ZAAC4w==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-schema\":\"^0.0.13\",\"core-js\":\"^3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-installer\":{\"version\":\"0.0.18\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-installer/-/lex-installer-0.0.18.tgz\",\"integrity\":\"sha512-ukDMHIpoaqk6ph0kFnLsRnYr3TJ+rDsAyVRwTzdiLb29pPYgQHD+3wSMHH/rQ7XXUuPklv4SFBTKLTMeIeEgkg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-builder\":\"^0.0.16\",\"@atproto/lex-cbor\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-resolver\":\"^0.0.15\",\"@atproto/lex-schema\":\"^0.0.13\",\"@atproto/syntax\":\"^0.4.3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-installer/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-json\":{\"version\":\"0.1.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.1.6.tgz\",\"integrity\":\"sha512-mvrAd0lbyuecIHjyld8QN6MN6CBf4j0GCxLzegsvLh0SvDf+GbYWklkcQqmITL44yFQOwmA/QNIQj0Uvh7+R/g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.1.7\",\"tslib\":\"^2.8.1\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/lex-resolver\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-resolver/-/lex-resolver-0.0.15.tgz\",\"integrity\":\"sha512-oNxcNCts3ReJ+A4hTPthQbPA68yMQ0ZrBUIiUTZwRazrmg/xkV15jtyYSnH4CGBjRdt420MV9aLR2s4qLSmyTQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.2.6\",\"@atproto/crypto\":\"^0.4.5\",\"@atproto/lex-client\":\"^0.0.13\",\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/lex-document\":\"^0.0.14\",\"@atproto/lex-schema\":\"^0.0.13\",\"@atproto/repo\":\"^0.8.12\",\"@atproto/syntax\":\"^0.4.3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-schema\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-schema/-/lex-schema-0.0.13.tgz\",\"integrity\":\"sha512-FeY4YBesEUO4Ey3BJhDRma0cZt6XxunSZPXny5Q/6ltc7pvyJGXXtJ8D7mHl7p5EXPwylEYOQkM6ck4IyfMP0A==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"@atproto/syntax\":\"^0.4.3\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex-schema/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lex/node_modules/@atproto/lex-data\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.12.tgz\",\"integrity\":\"sha512-aekJudcK1p6sbTqUv2bJMJBAGZaOJS0mgDclpK3U6VuBREK/au4B6ffunBFWgrDfg0Vwj2JGyEA7E51WZkJcRw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/lex/node_modules/@atproto/lex-json\":{\"version\":\"0.0.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.12.tgz\",\"integrity\":\"sha512-XlEpnWWZdDJ5BIgG25GyH+6iBfyrFL18BI5JSE6rUfMObbFMrQRaCuRLQfryRXNysVz3L3U+Qb9y8KcXbE8AcA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.12\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/lexicon\":{\"version\":\"0.7.12\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.7.12.tgz\",\"integrity\":\"sha512-bXVWXc2+ctVVUc3CEuWV9mVXRMMQcWmdzmyRE7w2Rli0B36HADU49Vvi7PWTw26zFFqumYVl9b23bW3vrzAzbg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.5.10\",\"@atproto/syntax\":\"^0.7.5\",\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/lexicon/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"inBundle\":true,\"license\":\"Apache-2.0 OR MIT\"},\"node_modules/@atproto/oauth-client\":{\"version\":\"0.8.8\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-client/-/oauth-client-0.8.8.tgz\",\"integrity\":\"sha512-W2T44dtFRBiHlq21JAnailcR7pjkTIlVoYTSxkXTAiycac97KhiXqKPOOfAu2sjkA3FTnKlMMjdjv4UrtDui+w==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto-labs/identity-resolver\":\"^0.4.10\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/oauth-types\":\"^0.7.7\",\"@atproto/xrpc\":\"^0.8.14\",\"core-js\":\"^3.50.0\",\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser\":{\"version\":\"0.5.8\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-client-browser/-/oauth-client-browser-0.5.8.tgz\",\"integrity\":\"sha512-bAJ/OtpdKHwtMuro6ZAmKQnD8dzV0wv+DydL04lvtMe828xcZmce9gylMZfpG7wF3Br5OaSsqCAVk4m8rEpuSg==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver\":\"^0.4.10\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-webcrypto\":\"^0.3.4\",\"@atproto/oauth-client\":\"^0.8.8\",\"@atproto/oauth-types\":\"^0.7.7\",\"core-js\":\"^3.50.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node\":{\"version\":\"0.5.8\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-client-node/-/oauth-client-node-0.5.8.tgz\",\"integrity\":\"sha512-Mhs0JlEiZC3iu0RB1XXjmbFodk8rTtyM+27tNm/2dHkTPdBZTbl7smwOoAXdNpa3rjgR4DlCEBLkTqS9XLsjcQ==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/did-resolver\":\"^0.3.10\",\"@atproto-labs/handle-resolver-node\":\"^0.2.11\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"@atproto/jwk-jose\":\"^0.2.4\",\"@atproto/jwk-webcrypto\":\"^0.3.4\",\"@atproto/oauth-client\":\"^0.8.8\",\"@atproto/oauth-types\":\"^0.7.7\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client-node/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver\":{\"version\":\"0.3.10\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/did-resolver/-/did-resolver-0.3.10.tgz\",\"integrity\":\"sha512-SPWOcJG/rsqrp2XQZQe8ctC9Y604mivZfXTrCsXbo7dXeAukYSgljPPa/7yWAlTvCbqUSNKScVEWpdCyel/nFw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/fetch\":\"^0.3.6\",\"@atproto-labs/pipe\":\"^0.2.4\",\"@atproto-labs/simple-store\":\"^0.5.1\",\"@atproto-labs/simple-store-memory\":\"^0.2.6\",\"@atproto/did\":\"^0.5.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch\":{\"version\":\"0.3.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/fetch/-/fetch-0.3.6.tgz\",\"integrity\":\"sha512-ro/J/cnqIp4bnSzDl8N3SkruvQcE3Pze+1H70mKdFfyFcdhPr+7O4lggl4VCbhI84Yqgz47c0xC6F/Yl39SxDA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/pipe\":\"^0.2.4\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe\":{\"version\":\"0.2.4\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/pipe/-/pipe-0.2.4.tgz\",\"integrity\":\"sha512-n67jCcrC+ouAeO10cWkpPzzLMlDi/lDCU30Us+LGqhOPhT6c4t5ASdBLQi9W3jUQtRzQBt3G9zipF+xKWNvVbw==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store\":{\"version\":\"0.5.1\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store/-/simple-store-0.5.1.tgz\",\"integrity\":\"sha512-vfvoDhu6ds6BT3Pqe+d2/LBU1WpDRtt69y6zltlfMCoucPm82m1j50/Wb6xTvv+oZ+2j0JyZVXsmXQ12SWYQJg==\",\"license\":\"MIT\",\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory\":{\"version\":\"0.2.6\",\"resolved\":\"https://registry.npmjs.org/@atproto-labs/simple-store-memory/-/simple-store-memory-0.2.6.tgz\",\"integrity\":\"sha512-DD1v7MEfYF3BAcEpMTTpzfBLWLoI2HuyBhku2YpjHoqPrRrhCtE1alkxfPHjtjJVIjuU/XNU0cF/wB3+5FiKsA==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto-labs/simple-store\":\"^0.5.1\",\"lru-cache\":\"^10.2.0\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-client/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"license\":\"Apache-2.0 OR MIT\",\"inBundle\":true},\"node_modules/@atproto/oauth-types\":{\"version\":\"0.7.7\",\"resolved\":\"https://registry.npmjs.org/@atproto/oauth-types/-/oauth-types-0.7.7.tgz\",\"integrity\":\"sha512-HhY0n6BJtFlxHJTOwT34uf7BiMaEluuwiZqHkamWoFvl+Gk7bPgWhPslr4kX2J/7ryFxhdsKVj1tjWjy0AhjTw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/did\":\"^0.5.6\",\"@atproto/jwk\":\"^0.7.4\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/oauth-types/node_modules/@atproto/did\":{\"version\":\"0.5.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/did/-/did-0.5.6.tgz\",\"integrity\":\"sha512-8bLfOnaoWBmg9S8naqzk5mG8zYAXfSKT4odB5OHcCAd1o7p6RFb0Rk9WGobEgboKtxP2CIeul6mzI5PUT4v6Gg==\",\"license\":\"MIT\",\"dependencies\":{\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/repo\":{\"version\":\"0.8.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/repo/-/repo-0.8.13.tgz\",\"integrity\":\"sha512-VS8XHaBMGdq60xwRI5zQmXzsMF1hU7NKPjmkdr65tJdrv2z0VW77mG01Ui19Xh9O0mUc/LG6GEhwVrabB9Txow==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common\":\"^0.5.14\",\"@atproto/common-web\":\"^0.4.18\",\"@atproto/crypto\":\"^0.4.5\",\"@atproto/lexicon\":\"^0.6.2\",\"@ipld/dag-cbor\":\"^7.0.0\",\"multiformats\":\"^9.9.0\",\"uint8arrays\":\"3.0.0\",\"varint\":\"^6.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=18.7.0\"}},\"node_modules/@atproto/repo/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/repo/node_modules/@atproto/lexicon\":{\"version\":\"0.6.2\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.6.2.tgz\",\"integrity\":\"sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.4.18\",\"@atproto/syntax\":\"^0.5.0\",\"iso-datestring-validator\":\"^2.2.2\",\"multiformats\":\"^9.9.0\",\"zod\":\"^3.23.8\"}},\"node_modules/@atproto/repo/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@atproto/syntax\":{\"version\":\"0.7.5\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.7.5.tgz\",\"integrity\":\"sha512-6vnLQK8OAzg0dO6z/xnvuXn5zMV0UMI54zbxk7G7BXhGlIlLMb1yo+JVYtAlv8Nxzr+AaFdNZ8AJt+L/QhJMFQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"tslib\":\"^2.8.1\"},\"engines\":{\"node\":\">=22\"}},\"node_modules/@atproto/xrpc\":{\"version\":\"0.8.14\",\"resolved\":\"https://registry.npmjs.org/@atproto/xrpc/-/xrpc-0.8.14.tgz\",\"integrity\":\"sha512-9r3cGbm6Q35SMzfBGaJiHbb1OlznOpf1PwKj9Q8nrSRh01xGl0GgCUDXe47t3IgFth4WJmnEcY2EbyoJF05WCQ==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/lexicon\":\"^0.7.15\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/@atproto/common-web\":{\"version\":\"0.5.13\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.5.13.tgz\",\"integrity\":\"sha512-TSVba26vsgeYqeE6BKrvomEbzRJPiRkmVfakfJxqoEWAwxrWfvXvKSwGkPIY57kw5g2gHpKxPIM0v+DqarWKEw==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.1.7\",\"@atproto/lex-json\":\"^0.1.6\",\"@atproto/syntax\":\"^0.7.6\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/@atproto/lexicon\":{\"version\":\"0.7.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.7.15.tgz\",\"integrity\":\"sha512-VAiXSHY12hqFYevassyVlWXDxs88ya9jS6DhGc93QbxOQbKasy8yWtxzG3oMiSLQaN+hOuqZUw4kSySLZgR2/w==\",\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.5.13\",\"@atproto/syntax\":\"^0.7.6\",\"multiformats\":\"^13.0.0\",\"zod\":\"^3.23.8\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/@atproto/syntax\":{\"version\":\"0.7.6\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.7.6.tgz\",\"integrity\":\"sha512-luKQTcWw1H1jLmYvX34ldBqNjz2orF082njmcF9fxbWTqVhsO+TpY0FHRKVPoV7dwL0Y3L16DNz1ma0LFGH25g==\",\"license\":\"MIT\",\"dependencies\":{\"iso-datestring-validator\":\"^2.2.2\",\"tslib\":\"^2.8.1\"},\"engines\":{\"node\":\">=22\"},\"inBundle\":true},\"node_modules/@atproto/xrpc/node_modules/multiformats\":{\"version\":\"13.4.2\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-13.4.2.tgz\",\"integrity\":\"sha512-eh6eHCrRi1+POZ3dA+Dq1C6jhP1GNtr9CRINMb67OKzqW9I5DUuZM/3jLPlzhgpGeiNUlEGEbkCYChXMCc/8DQ==\",\"license\":\"Apache-2.0 OR MIT\",\"inBundle\":true},\"node_modules/@esbuild/aix-ppc64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz\",\"integrity\":\"sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==\",\"cpu\":[\"ppc64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"aix\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/android-arm\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz\",\"integrity\":\"sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/android-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz\",\"integrity\":\"sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/android-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz\",\"integrity\":\"sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/darwin-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz\",\"integrity\":\"sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/darwin-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz\",\"integrity\":\"sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/freebsd-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz\",\"integrity\":\"sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/freebsd-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz\",\"integrity\":\"sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-arm\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz\",\"integrity\":\"sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz\",\"integrity\":\"sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-ia32\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz\",\"integrity\":\"sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==\",\"cpu\":[\"ia32\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-loong64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz\",\"integrity\":\"sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==\",\"cpu\":[\"loong64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-mips64el\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz\",\"integrity\":\"sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==\",\"cpu\":[\"mips64el\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-ppc64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz\",\"integrity\":\"sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==\",\"cpu\":[\"ppc64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-riscv64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz\",\"integrity\":\"sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==\",\"cpu\":[\"riscv64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-s390x\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz\",\"integrity\":\"sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==\",\"cpu\":[\"s390x\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/linux-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz\",\"integrity\":\"sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/netbsd-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz\",\"integrity\":\"sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/netbsd-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz\",\"integrity\":\"sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/openbsd-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz\",\"integrity\":\"sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/openbsd-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz\",\"integrity\":\"sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/openharmony-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz\",\"integrity\":\"sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openharmony\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/sunos-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz\",\"integrity\":\"sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"sunos\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/win32-arm64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz\",\"integrity\":\"sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/win32-ia32\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz\",\"integrity\":\"sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==\",\"cpu\":[\"ia32\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@esbuild/win32-x64\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz\",\"integrity\":\"sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=18\"}},\"node_modules/@inlay/core\":{\"version\":\"0.0.13\",\"resolved\":\"https://registry.npmjs.org/@inlay/core/-/core-0.0.13.tgz\",\"integrity\":\"sha512-UO3M3l96+Ed0RikY5SyDCP16yb+ceyYksQ2PLO3PyBZJ8EDvw9CfKIdbsOzraQp3lyUkmhrToJj1GED0tkvi1Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex\":\"^0.0.18\",\"@atproto/syntax\":\"^0.4.3\"}},\"node_modules/@inlay/core/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render\":{\"version\":\"0.3.1\",\"resolved\":\"https://registry.npmjs.org/@inlay/render/-/render-0.3.1.tgz\",\"integrity\":\"sha512-zlJCvpjFFqAa8dMBbLW5cYZ5w+ARHKej/DoBLRnjnjlXCnrOJyMXCef1J6Pc5a7761+2QhuSvP/1M4TDR+dw3w==\",\"inBundle\":true,\"dependencies\":{\"@atproto/lexicon\":\"^0.6.1\",\"@atproto/syntax\":\"^0.4.3\"},\"peerDependencies\":{\"@inlay/core\":\"*\"}},\"node_modules/@inlay/render/node_modules/@atproto/common-web\":{\"version\":\"0.4.21\",\"resolved\":\"https://registry.npmjs.org/@atproto/common-web/-/common-web-0.4.21.tgz\",\"integrity\":\"sha512-Odq+wdk3YNasGCjjlpl3bCIPvqYHige5DLfMkIffNv/2PI/iIj5ZvAvMvJlJ59OhReKSxtpI0invx5UQPc3+fw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"@atproto/lex-json\":\"^0.0.16\",\"@atproto/syntax\":\"^0.5.4\",\"zod\":\"^3.23.8\"}},\"node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/lex-data\":{\"version\":\"0.0.15\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-data/-/lex-data-0.0.15.tgz\",\"integrity\":\"sha512-ZsbGiaM5S3CnGrcTMbDGON3bLZzCi/Mx9UvcMREKSRujnF68eHgMiXxJqvykP7+QpOX6tYCK93axZkuJVhtSEw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.9.0\",\"tslib\":\"^2.8.1\",\"uint8arrays\":\"3.0.0\",\"unicode-segmenter\":\"^0.14.0\"}},\"node_modules/@inlay/render/node_modules/@atproto/lex-json\":{\"version\":\"0.0.16\",\"resolved\":\"https://registry.npmjs.org/@atproto/lex-json/-/lex-json-0.0.16.tgz\",\"integrity\":\"sha512-IgLgQ0krshVlrIYZ+heTBDbCnM3LmAgWvsaYn5MxvKA3LcBot3PG3ptdO8VOweVZ+WgCLuo39cz9EbUmIbqdtg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/lex-data\":\"^0.0.15\",\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/lexicon\":{\"version\":\"0.6.2\",\"resolved\":\"https://registry.npmjs.org/@atproto/lexicon/-/lexicon-0.6.2.tgz\",\"integrity\":\"sha512-p3Ly6hinVZW0ETuAXZMeUGwuMm3g8HvQMQ41yyEE6AL0hAkfeKFaZKos6BdBrr6CjkpbrDZqE8M+5+QOceysMw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@atproto/common-web\":\"^0.4.18\",\"@atproto/syntax\":\"^0.5.0\",\"iso-datestring-validator\":\"^2.2.2\",\"multiformats\":\"^9.9.0\",\"zod\":\"^3.23.8\"}},\"node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax\":{\"version\":\"0.5.4\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.5.4.tgz\",\"integrity\":\"sha512-9XJOpMAgsGFxMEIp8nJ8AIWv+krrY1xQMj+wULbbXhQztQV+9aZ0TbG9Jtn3Op2or8Kr6OqyWR4ga9Z189kKDw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@inlay/render/node_modules/@atproto/syntax\":{\"version\":\"0.4.3\",\"resolved\":\"https://registry.npmjs.org/@atproto/syntax/-/syntax-0.4.3.tgz\",\"integrity\":\"sha512-YoZUz40YAJr5nPwvCDWgodEOlt5IftZqPJvA0JDWjuZKD8yXddTwSzXSaKQAzGOpuM+/A3uXRtPzJJqlScc+iA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"tslib\":\"^2.8.1\"}},\"node_modules/@ipld/dag-cbor\":{\"version\":\"7.0.3\",\"resolved\":\"https://registry.npmjs.org/@ipld/dag-cbor/-/dag-cbor-7.0.3.tgz\",\"integrity\":\"sha512-1VVh2huHsuohdXC1bGJNE8WR72slZ9XE2T3wbBBq31dm7ZBatmKLLxrB+XAqafxfRFjv08RZmj/W/ZqaM13AuA==\",\"inBundle\":true,\"license\":\"(Apache-2.0 AND MIT)\",\"dependencies\":{\"cborg\":\"^1.6.0\",\"multiformats\":\"^9.5.4\"}},\"node_modules/@noble/curves\":{\"version\":\"1.9.7\",\"resolved\":\"https://registry.npmjs.org/@noble/curves/-/curves-1.9.7.tgz\",\"integrity\":\"sha512-gbKGcRUYIjA3/zCCNaWDciTMFI0dCkvou3TL8Zmy5Nc7sJ47a0jtOeZoTaMxkuqRo9cRhjOdZJXegxYE5FN/xw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@noble/hashes\":\"1.8.0\"},\"engines\":{\"node\":\"^14.21.3 || >=16\"},\"funding\":{\"url\":\"https://paulmillr.com/funding/\"}},\"node_modules/@noble/hashes\":{\"version\":\"1.8.0\",\"resolved\":\"https://registry.npmjs.org/@noble/hashes/-/hashes-1.8.0.tgz\",\"integrity\":\"sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\"^14.21.3 || >=16\"},\"funding\":{\"url\":\"https://paulmillr.com/funding/\"}},\"node_modules/@noble/secp256k1\":{\"version\":\"3.2.0\",\"resolved\":\"https://registry.npmjs.org/@noble/secp256k1/-/secp256k1-3.2.0.tgz\",\"integrity\":\"sha512-Z3ZAWOTxJ0EuTuZTi7Y69iK7GgrLHh8sgm45lVDhg/b3Nk1TpAiKhick2KkZisHuupeepSkyIydN/J459SdX1w==\",\"inBundle\":true,\"license\":\"MIT\",\"funding\":{\"url\":\"https://paulmillr.com/funding/\"}},\"node_modules/@oomfware/eval\":{\"version\":\"0.1.0\",\"resolved\":\"https://registry.npmjs.org/@oomfware/eval/-/eval-0.1.0.tgz\",\"integrity\":\"sha512-EIkukTd3zDQEHUjcfFRDq79Jgm4OEyUrEUvp/SwgjfoH2POaE5cvaswIonFwdt8fSzJF5xtAdgcgIoKD8sPpjg==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/@oxc-project/types\":{\"version\":\"0.148.0\",\"resolved\":\"https://registry.npmjs.org/@oxc-project/types/-/types-0.148.0.tgz\",\"integrity\":\"sha512-Nm4s/jB+4FpFsPhWGEC4h7rzksesmtnMXomo6rCMcg/b8zLQuOziRgkCS1fxDCXOlJB/6Q8oABOZ/OP6RIPj9A==\",\"dev\":true,\"license\":\"MIT\",\"funding\":{\"url\":\"https://github.com/sponsors/oxc-project\"}},\"node_modules/@playwright/test\":{\"version\":\"1.63.0\",\"resolved\":\"https://registry.npmjs.org/@playwright/test/-/test-1.63.0.tgz\",\"integrity\":\"sha512-oxMK4vllB9RK5NQ2l1pq1IfOf2AvnEuj/vYGDj0H2nMtmtZpKtCwt/l00GEO6xjGfpBNAvjovvYdCm50dRQkpQ==\",\"dev\":true,\"license\":\"Apache-2.0\",\"dependencies\":{\"playwright\":\"1.63.0\"},\"bin\":{\"playwright\":\"cli.js\"},\"engines\":{\"node\":\">=20\"}},\"node_modules/@rolldown/binding-android-arm-eabi\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.7.tgz\",\"integrity\":\"sha512-EypzgnYCwyVY4NDHKzGmNJT5b+XaQEBniHxsMdeIQLB/tcCzZnhqrzHpZFbX9iaxx+5RiB8caATBtfvZP7zVxQ==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-android-arm64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.7.tgz\",\"integrity\":\"sha512-l17HE9EweWaqJZhuUuNBN/FzM62xw+DECVnJyvMsxn8vJFAGLy5QfLDoYAcronkAN8VxKZHezDpulHDPx95vFw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-darwin-arm64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.7.tgz\",\"integrity\":\"sha512-8ED8ELFvHXc6OCETIn4gXObPiaR6bckM/ipXtbzlPVDRMBfEGjCKgO90F9YtfdpDatVx/ZQw7aZ1vUMf/+T3Mw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-darwin-x64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.7.tgz\",\"integrity\":\"sha512-/WPripjtiAIZ2tWY7ddijORT0Ujg87wxWW/qcoFVCKAWVDPhtY0xr7Dj0M3GyNGz60jGwTElhro/mkF9dT7dDQ==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-freebsd-x64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.7.tgz\",\"integrity\":\"sha512-14DI4NcqpvbICxSnGLx3PmtDaWqRP/KGSGb6C+JLLVPeZRl6dKdHba3pGsqT3vpdTqhEYIPG0MMQ8c0xYqoJxA==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-arm-gnueabihf\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.7.tgz\",\"integrity\":\"sha512-bxrWIRvHWQvbJwi+VIie/kDJmQxcNE6xxWwZdqF/ExVAigtHkv54WTLQPb+QsZdnFy18fg7JPfWGL0RH6vwIlQ==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-arm64-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.7.tgz\",\"integrity\":\"sha512-toOY2BChBZyuxU7OYX6Tn389di4IzAqPTycVcci0O7FSfBqzRB3RZn+K5Is6ANf4tmgRd/K1yZTsNTXbkXsnLg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-arm64-musl\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.7.tgz\",\"integrity\":\"sha512-lAIXTH/aiLRLxsTgQvfhjo4K1ydWIp00+V0voOr9beb/9ZmkUFrSIb03dXNFRgMNvkE6oGsF10ioQ6UsI+vS5Q==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-ppc64-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.7.tgz\",\"integrity\":\"sha512-kdnwS28Pkenp/mZMRwjXXXwxQ7pIsm+bF919LUK93BOyhcLsrVKdP2p9fxpiPNPAbNuch8ypQt0pm2P2LYCAGg==\",\"cpu\":[\"ppc64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-s390x-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.7.tgz\",\"integrity\":\"sha512-516OdsyLdr5E65paF3yBF55t8mfm9+gmtCsK3xI7XKXIT7EfRlHhxL8K/NR6Hu8BWSgF5+1w74lTL0+nxcc8Qw==\",\"cpu\":[\"s390x\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-x64-gnu\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.7.tgz\",\"integrity\":\"sha512-r8/z8n7GFaYRln3xmP1Cxy0HH/HLM0uBUPkEuSVEfKGDA89M0FsZRZJRSwe/tJjRx+fpH/gjorfhB8tmEbSFLA==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-linux-x64-musl\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.7.tgz\",\"integrity\":\"sha512-pAsE8iiDxUg1xBqdhrTfg45AVDVpirjz00sblEYClGNNcMnDb+e8beQgqIAw6LvauX/APvgxUnwrgun/YYGBhw==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MIT\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-openharmony-arm64\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.7.tgz\",\"integrity\":\"sha512-lTcIYmmnQQA8Or/2DatS6oSqcdLHvendjS+zLu+FwgToynWMRSmQdpM65fTANJgIS4mjbMOo5KT2lnT9SAb96w==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"openharmony\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-win32-arm64-msvc\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.7.tgz\",\"integrity\":\"sha512-e3Gu3WxbNk/UqQhxqU7YIYO+9ZBvWNz3U+h/qRFosscMFzdRPbXYSaSWgSnklv2fz1TgzBTcti2z35c/7irsHw==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/binding-win32-x64-msvc\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.7.tgz\",\"integrity\":\"sha512-W/jg5qoRSqjsEv0+dZi4e687mcHqmVuU0P4fK6qS/xjetW2Gmc1W8j//z5nAeNcC8Ttm0hV46IjcYeuVwYhuiw==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"}},\"node_modules/@rolldown/pluginutils\":{\"version\":\"1.0.1\",\"resolved\":\"https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz\",\"integrity\":\"sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==\",\"dev\":true,\"license\":\"MIT\"},\"node_modules/@standard-schema/spec\":{\"version\":\"1.1.0\",\"resolved\":\"https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz\",\"integrity\":\"sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/@ts-morph/common\":{\"version\":\"0.28.1\",\"resolved\":\"https://registry.npmjs.org/@ts-morph/common/-/common-0.28.1.tgz\",\"integrity\":\"sha512-W74iWf7ILp1ZKNYXY5qbddNaml7e9Sedv5lvU1V8lftlitkc9Pq1A+jlH23ltDgWYeZFFEqGCD1Ies9hqu3O+g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"minimatch\":\"^10.0.1\",\"path-browserify\":\"^1.0.1\",\"tinyglobby\":\"^0.2.14\"}},\"node_modules/@types/node\":{\"version\":\"26.4.1\",\"resolved\":\"https://registry.npmjs.org/@types/node/-/node-26.4.1.tgz\",\"integrity\":\"sha512-k97ENvZWtvA6yqz5/FS6a7duDgOPEeOQOc2iKS/nY6mX6qJUKtLnWzQS+Xj6tXweyj6ZcTAK2Qecetnvi9nCLA==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"undici-types\":\"~8.3.0\"}},\"node_modules/@typescript/typescript-aix-ppc64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-aix-ppc64/-/typescript-aix-ppc64-7.0.2.tgz\",\"integrity\":\"sha512-MTKKkWB7p/0E9xi1d1tHtZ5PiLkGEMIq88pK2CubZjOsLtYTLqhgIgi6zepFa+9GHZ6h05NMCkQxGKiPXMxXtQ==\",\"cpu\":[\"ppc64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"aix\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-darwin-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-darwin-arm64/-/typescript-darwin-arm64-7.0.2.tgz\",\"integrity\":\"sha512-gowzar9MwS/aRWp6f3a4KUqzRjAZjOsmGNCM6LcTgXum+dBfgsBVMN+AgvOCCbguXyick6LJhpBszxMebJ8syA==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-darwin-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-darwin-x64/-/typescript-darwin-x64-7.0.2.tgz\",\"integrity\":\"sha512-SZ9xZInqApNlNGc9s0W1VSsktYSOe9cFqNOIqmN1Gs8SmkjKZYFt017G4VwPxASInODuAdbTW7sXiFUf893RgA==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-freebsd-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-freebsd-arm64/-/typescript-freebsd-arm64-7.0.2.tgz\",\"integrity\":\"sha512-W5NH4y/J0plIIS5b2xvTEkU7JFxyqdMAOgf+Ilhl0vHQXKO5dZoxd+C/jEtq56c4F3wk71RB4BMRQ2XdI+bwYQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-freebsd-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-freebsd-x64/-/typescript-freebsd-x64-7.0.2.tgz\",\"integrity\":\"sha512-UMGDx5sTpzNw3WiPebH7l90IWfJggEd+egHt/q6p7/Cm3zqoV7VxkGXt+3DxPIw8CcmvAB0j3sVVfbhX+M4Tpw==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-arm\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-arm/-/typescript-linux-arm-7.0.2.tgz\",\"integrity\":\"sha512-gffT3xPz9sR7j/YJExkyPntrI0P2EP9XbOyWzth2/Gs0RstK+90RBcO0ncXoXy/beYll1SXw846Nf2zdnEz0QQ==\",\"cpu\":[\"arm\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-arm64/-/typescript-linux-arm64-7.0.2.tgz\",\"integrity\":\"sha512-Qh4eU4/y3yDjnfjjyPYihMj5/ODIlmt+Bzu17OI+fiSRDW57QmU5SiN63exPRNJPKUzcc1INa1NXdrJ+MqHjUQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-loong64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-loong64/-/typescript-linux-loong64-7.0.2.tgz\",\"integrity\":\"sha512-uEHck9i8hoAzXPiYRib1O7miOnz23SxIeVl6F4LXox+qov1K35jHcEW6VHKvZI+pyvl7fZEP4MCU5LYvIq1GuQ==\",\"cpu\":[\"loong64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-mips64el\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-mips64el/-/typescript-linux-mips64el-7.0.2.tgz\",\"integrity\":\"sha512-R4KvAMnE43W5Qeqb0Ly56O3mWMWIAgsMyz36DCaycd5nbg/9kzm0liw3JocfRqyJY0KPmzFjbswozXyW0DnIYA==\",\"cpu\":[\"mips64el\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-ppc64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-ppc64/-/typescript-linux-ppc64-7.0.2.tgz\",\"integrity\":\"sha512-DORx5b3sd/4S7eayxm4FQv+A7CrkUIGRaHiwI8oiHTAI1fAPWhF4J0vAlkC8biAlHSVVwxMQ3tjZ2/DVbnQiiA==\",\"cpu\":[\"ppc64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-riscv64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-riscv64/-/typescript-linux-riscv64-7.0.2.tgz\",\"integrity\":\"sha512-wf0jqEDOjrPRnKwYRyyJDRo11KMbvMFrU+q4zqKyChODBzvlkbhNQfKvLxQCcwTpdDaXSHZTVuh0JoCrKCUMHQ==\",\"cpu\":[\"riscv64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-s390x\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-s390x/-/typescript-linux-s390x-7.0.2.tgz\",\"integrity\":\"sha512-IkwJc3L7yhytWd/ewjyxNDfOmswCm9GWMJT/ue/dU4aZNbwZeYAetq42VyLmsmSjvoX7z74X6ZaYCtzAr0EuGw==\",\"cpu\":[\"s390x\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-linux-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-linux-x64/-/typescript-linux-x64-7.0.2.tgz\",\"integrity\":\"sha512-EYdf2cNg7rgCWJnxCdJ+F3V39O8ihb37eHAu1LK8oAFizgTQbPOK7zHHXbPt8rX24COqODXeI3sIf0fCXG7H/A==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-netbsd-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-netbsd-arm64/-/typescript-netbsd-arm64-7.0.2.tgz\",\"integrity\":\"sha512-+polYF4MF04aPpO5FTkHran9yUQDSXqy5GiSDKpsll5jy3l3+g9QLhpf39T+ePtefhXLOGrLl0QIjkQP6VnelA==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-netbsd-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-netbsd-x64/-/typescript-netbsd-x64-7.0.2.tgz\",\"integrity\":\"sha512-8YIT0EHM/3dq10ZOVF/A7pc/YSMtbcecct4rWtexrnSCHOPcpC2KTLXfTCR6vDpnSiY12heNb1GiN/wu+T/FyA==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"netbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-openbsd-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-openbsd-arm64/-/typescript-openbsd-arm64-7.0.2.tgz\",\"integrity\":\"sha512-APT8+ClYnuYm1u9+kgGXoMj2VzWzcymwh2gNSQVySHfkRDGOTVkoWLjCmOQSaO+PoqQ57B0flRp9SA+7GnnkzQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-openbsd-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-openbsd-x64/-/typescript-openbsd-x64-7.0.2.tgz\",\"integrity\":\"sha512-yX7s+Q0Dln0Dt9tEzZsAjXXR/+ytBM7AlglaqyeMPxQszJ1JhlJdZ6jLA+IzldHtflX81em7lDao1xXu+aRRkg==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"openbsd\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-sunos-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-sunos-x64/-/typescript-sunos-x64-7.0.2.tgz\",\"integrity\":\"sha512-dLJDGaLZ1D4HPQn62u1n8mBDkJREwMsAkCdkwd4Ieqw+x3TUyTsqY0YiBCtE6H6OzzgGk3iuZ3vFWRS+E8/d1g==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"sunos\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-win32-arm64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-win32-arm64/-/typescript-win32-arm64-7.0.2.tgz\",\"integrity\":\"sha512-Gyl1Vy6OsWesLzmq+EP0Fb7b4Nid5232AvcA2SFcdYreldpNtYFFofPjnt62y9hQy7VTaZp65ICJjuAQRaVcIQ==\",\"cpu\":[\"arm64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/@typescript/typescript-win32-x64\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/@typescript/typescript-win32-x64/-/typescript-win32-x64-7.0.2.tgz\",\"integrity\":\"sha512-0BQ3HkAHHlKLSp1qRvf3SUhGpGsDuhB/jgFw75guyqbxJqEaS0Cw/VFO8i2nHglJUzQCRtMMR/IBAKE3ETMC4g==\",\"cpu\":[\"x64\"],\"inBundle\":true,\"license\":\"Apache-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">=16.20.0\"}},\"node_modules/abort-controller\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz\",\"integrity\":\"sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"event-target-shim\":\"^5.0.0\"},\"engines\":{\"node\":\">=6.5\"}},\"node_modules/ansi-regex\":{\"version\":\"5.0.1\",\"resolved\":\"https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz\",\"integrity\":\"sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=8\"}},\"node_modules/ansi-styles\":{\"version\":\"4.3.0\",\"resolved\":\"https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz\",\"integrity\":\"sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"color-convert\":\"^2.0.1\"},\"engines\":{\"node\":\">=8\"},\"funding\":{\"url\":\"https://github.com/chalk/ansi-styles?sponsor=1\"}},\"node_modules/atomic-sleep\":{\"version\":\"1.0.0\",\"resolved\":\"https://registry.npmjs.org/atomic-sleep/-/atomic-sleep-1.0.0.tgz\",\"integrity\":\"sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=8.0.0\"}},\"node_modules/balanced-match\":{\"version\":\"4.0.4\",\"resolved\":\"https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz\",\"integrity\":\"sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\"18 || 20 || >=22\"}},\"node_modules/base64-js\":{\"version\":\"1.5.1\",\"resolved\":\"https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz\",\"integrity\":\"sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/brace-expansion\":{\"version\":\"5.0.12\",\"resolved\":\"https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz\",\"integrity\":\"sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"balanced-match\":\"^4.0.2\"},\"engines\":{\"node\":\"20 || >=22\"}},\"node_modules/buffer\":{\"version\":\"6.0.3\",\"resolved\":\"https://registry.npmjs.org/buffer/-/buffer-6.0.3.tgz\",\"integrity\":\"sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"base64-js\":\"^1.3.1\",\"ieee754\":\"^1.2.1\"}},\"node_modules/cborg\":{\"version\":\"1.10.2\",\"resolved\":\"https://registry.npmjs.org/cborg/-/cborg-1.10.2.tgz\",\"integrity\":\"sha512-b3tFPA9pUr2zCUiCfRd2+wok2/LBSNUMKOuRRok+WlvvAgEt/PlbgPTsZUcwCOs53IJvLgTp0eotwtosE6njug==\",\"inBundle\":true,\"license\":\"Apache-2.0\",\"bin\":{\"cborg\":\"cli.js\"}},\"node_modules/cliui\":{\"version\":\"8.0.1\",\"resolved\":\"https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz\",\"integrity\":\"sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==\",\"inBundle\":true,\"license\":\"ISC\",\"dependencies\":{\"string-width\":\"^4.2.0\",\"strip-ansi\":\"^6.0.1\",\"wrap-ansi\":\"^7.0.0\"},\"engines\":{\"node\":\">=12\"}},\"node_modules/code-block-writer\":{\"version\":\"13.0.3\",\"resolved\":\"https://registry.npmjs.org/code-block-writer/-/code-block-writer-13.0.3.tgz\",\"integrity\":\"sha512-Oofo0pq3IKnsFtuHqSF7TqBfr71aeyZDVJ0HpmqB7FBM2qEigL0iPONSCZSO9pE9dZTAxANe5XHG9Uy0YMv8cg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/color-convert\":{\"version\":\"2.0.1\",\"resolved\":\"https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz\",\"integrity\":\"sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"color-name\":\"~1.1.4\"},\"engines\":{\"node\":\">=7.0.0\"}},\"node_modules/color-name\":{\"version\":\"1.1.4\",\"resolved\":\"https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz\",\"integrity\":\"sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/core-js\":{\"version\":\"3.50.0\",\"resolved\":\"https://registry.npmjs.org/core-js/-/core-js-3.50.0.tgz\",\"integrity\":\"sha512-BRWgOLKkFeCgRudR6zrs8p9XJZcE14grzKMMssoYrk6krtuEZ7MTKPIY5RzOnqsEKIR9kst7wNzphttraT+Yqw==\",\"hasInstallScript\":true,\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\"*\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/core-js\"}},\"node_modules/detect-libc\":{\"version\":\"2.1.2\",\"resolved\":\"https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz\",\"integrity\":\"sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==\",\"dev\":true,\"license\":\"Apache-2.0\",\"engines\":{\"node\":\">=8\"}},\"node_modules/emoji-regex\":{\"version\":\"8.0.0\",\"resolved\":\"https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz\",\"integrity\":\"sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/esbuild\":{\"version\":\"0.28.2\",\"resolved\":\"https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz\",\"integrity\":\"sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==\",\"dev\":true,\"hasInstallScript\":true,\"license\":\"MIT\",\"bin\":{\"esbuild\":\"bin/esbuild\"},\"engines\":{\"node\":\">=18\"},\"optionalDependencies\":{\"@esbuild/aix-ppc64\":\"0.28.2\",\"@esbuild/android-arm\":\"0.28.2\",\"@esbuild/android-arm64\":\"0.28.2\",\"@esbuild/android-x64\":\"0.28.2\",\"@esbuild/darwin-arm64\":\"0.28.2\",\"@esbuild/darwin-x64\":\"0.28.2\",\"@esbuild/freebsd-arm64\":\"0.28.2\",\"@esbuild/freebsd-x64\":\"0.28.2\",\"@esbuild/linux-arm\":\"0.28.2\",\"@esbuild/linux-arm64\":\"0.28.2\",\"@esbuild/linux-ia32\":\"0.28.2\",\"@esbuild/linux-loong64\":\"0.28.2\",\"@esbuild/linux-mips64el\":\"0.28.2\",\"@esbuild/linux-ppc64\":\"0.28.2\",\"@esbuild/linux-riscv64\":\"0.28.2\",\"@esbuild/linux-s390x\":\"0.28.2\",\"@esbuild/linux-x64\":\"0.28.2\",\"@esbuild/netbsd-arm64\":\"0.28.2\",\"@esbuild/netbsd-x64\":\"0.28.2\",\"@esbuild/openbsd-arm64\":\"0.28.2\",\"@esbuild/openbsd-x64\":\"0.28.2\",\"@esbuild/openharmony-arm64\":\"0.28.2\",\"@esbuild/sunos-x64\":\"0.28.2\",\"@esbuild/win32-arm64\":\"0.28.2\",\"@esbuild/win32-ia32\":\"0.28.2\",\"@esbuild/win32-x64\":\"0.28.2\"}},\"node_modules/escalade\":{\"version\":\"3.2.0\",\"resolved\":\"https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz\",\"integrity\":\"sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=6\"}},\"node_modules/esm-env\":{\"version\":\"1.2.2\",\"resolved\":\"https://registry.npmjs.org/esm-env/-/esm-env-1.2.2.tgz\",\"integrity\":\"sha512-Epxrv+Nr/CaL4ZcFGPJIYLWFom+YeV1DqMLHJoEd9SYRxNbaFruBwfEX/kkHUJf55j2+TUbmDcmuilbP1TmXHA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/event-target-shim\":{\"version\":\"5.0.1\",\"resolved\":\"https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz\",\"integrity\":\"sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=6\"}},\"node_modules/events\":{\"version\":\"3.3.0\",\"resolved\":\"https://registry.npmjs.org/events/-/events-3.3.0.tgz\",\"integrity\":\"sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=0.8.x\"}},\"node_modules/fast-redact\":{\"version\":\"3.5.0\",\"resolved\":\"https://registry.npmjs.org/fast-redact/-/fast-redact-3.5.0.tgz\",\"integrity\":\"sha512-dwsoQlS7h9hMeYUq1W++23NDcBLV4KqONnITDV9DjfS3q1SgDGVrBdvvTLUotWtPSD7asWDV9/CmsZPy8Hf70A==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=6\"}},\"node_modules/fdir\":{\"version\":\"6.5.0\",\"resolved\":\"https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz\",\"integrity\":\"sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=12.0.0\"},\"peerDependencies\":{\"picomatch\":\"^3 || ^4\"},\"peerDependenciesMeta\":{\"picomatch\":{\"optional\":true}}},\"node_modules/fsevents\":{\"version\":\"2.3.3\",\"resolved\":\"https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz\",\"integrity\":\"sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==\",\"dev\":true,\"hasInstallScript\":true,\"license\":\"MIT\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\"^8.16.0 || ^10.6.0 || >=11.0.0\"}},\"node_modules/get-caller-file\":{\"version\":\"2.0.5\",\"resolved\":\"https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz\",\"integrity\":\"sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\"6.* || 8.* || >= 10.*\"}},\"node_modules/ieee754\":{\"version\":\"1.2.1\",\"resolved\":\"https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz\",\"integrity\":\"sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"BSD-3-Clause\"},\"node_modules/ipaddr.js\":{\"version\":\"2.5.0\",\"resolved\":\"https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-2.5.0.tgz\",\"integrity\":\"sha512-aq+t5NAc+cS6rZQQVWC2x98CPqGtKKTMDd4Gaodv0wShnItdKg/51djkGJ1hqH+Oy0ivDftCbSLCQob8zso01w==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 10\"}},\"node_modules/is-fullwidth-code-point\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz\",\"integrity\":\"sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=8\"}},\"node_modules/iso-datestring-validator\":{\"version\":\"2.2.2\",\"resolved\":\"https://registry.npmjs.org/iso-datestring-validator/-/iso-datestring-validator-2.2.2.tgz\",\"integrity\":\"sha512-yLEMkBbLZTlVQqOnQ4FiMujR6T4DEcCb1xizmvXS+OxuhwcbtynoosRzdMA69zZCShCNAbi+gJ71FxZBBXx1SA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/jose\":{\"version\":\"5.10.0\",\"resolved\":\"https://registry.npmjs.org/jose/-/jose-5.10.0.tgz\",\"integrity\":\"sha512-s+3Al/p9g32Iq+oqXxkW//7jk2Vig6FF1CFqzVXoTUXt2qz89YWbL+OwS17NFYEvxC35n0FKeGO2LGYSxeM2Gg==\",\"license\":\"MIT\",\"funding\":{\"url\":\"https://github.com/sponsors/panva\"},\"inBundle\":true},\"node_modules/jsonata\":{\"version\":\"2.2.2\",\"resolved\":\"https://registry.npmjs.org/jsonata/-/jsonata-2.2.2.tgz\",\"integrity\":\"sha512-XDFH2PuaAXv0AXJEWwElXbqADmKFGKMLMkFb+qOz0EhjQW2EIJ6pgtordLU+4u3IVERyBfqy6bi6kZKEncvRqA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 8\"}},\"node_modules/jsonc-parser\":{\"version\":\"3.3.1\",\"resolved\":\"https://registry.npmjs.org/jsonc-parser/-/jsonc-parser-3.3.1.tgz\",\"integrity\":\"sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/lightningcss\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz\",\"integrity\":\"sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==\",\"dev\":true,\"license\":\"MPL-2.0\",\"dependencies\":{\"detect-libc\":\"^2.0.3\"},\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"},\"optionalDependencies\":{\"lightningcss-android-arm64\":\"1.33.0\",\"lightningcss-darwin-arm64\":\"1.33.0\",\"lightningcss-darwin-x64\":\"1.33.0\",\"lightningcss-freebsd-x64\":\"1.33.0\",\"lightningcss-linux-arm-gnueabihf\":\"1.33.0\",\"lightningcss-linux-arm64-gnu\":\"1.33.0\",\"lightningcss-linux-arm64-musl\":\"1.33.0\",\"lightningcss-linux-x64-gnu\":\"1.33.0\",\"lightningcss-linux-x64-musl\":\"1.33.0\",\"lightningcss-win32-arm64-msvc\":\"1.33.0\",\"lightningcss-win32-x64-msvc\":\"1.33.0\"}},\"node_modules/lightningcss-android-arm64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz\",\"integrity\":\"sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"android\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-darwin-arm64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz\",\"integrity\":\"sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-darwin-x64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz\",\"integrity\":\"sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"darwin\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-freebsd-x64\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz\",\"integrity\":\"sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"freebsd\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-arm-gnueabihf\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz\",\"integrity\":\"sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==\",\"cpu\":[\"arm\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-arm64-gnu\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz\",\"integrity\":\"sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-arm64-musl\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz\",\"integrity\":\"sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==\",\"cpu\":[\"arm64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-x64-gnu\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz\",\"integrity\":\"sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"glibc\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-linux-x64-musl\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz\",\"integrity\":\"sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==\",\"cpu\":[\"x64\"],\"dev\":true,\"libc\":[\"musl\"],\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"linux\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-win32-arm64-msvc\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz\",\"integrity\":\"sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==\",\"cpu\":[\"arm64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lightningcss-win32-x64-msvc\":{\"version\":\"1.33.0\",\"resolved\":\"https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz\",\"integrity\":\"sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==\",\"cpu\":[\"x64\"],\"dev\":true,\"license\":\"MPL-2.0\",\"optional\":true,\"os\":[\"win32\"],\"engines\":{\"node\":\">= 12.0.0\"},\"funding\":{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/parcel\"}},\"node_modules/lru-cache\":{\"version\":\"10.4.3\",\"resolved\":\"https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz\",\"integrity\":\"sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==\",\"inBundle\":true,\"license\":\"ISC\"},\"node_modules/minimatch\":{\"version\":\"10.2.6\",\"resolved\":\"https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz\",\"integrity\":\"sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==\",\"inBundle\":true,\"license\":\"BlueOak-1.0.0\",\"dependencies\":{\"brace-expansion\":\"^5.0.8\"},\"engines\":{\"node\":\"18 || 20 || >=22\"},\"funding\":{\"url\":\"https://github.com/sponsors/isaacs\"}},\"node_modules/multiformats\":{\"version\":\"9.9.0\",\"resolved\":\"https://registry.npmjs.org/multiformats/-/multiformats-9.9.0.tgz\",\"integrity\":\"sha512-HoMUjhH9T8DDBNT+6xzkrd9ga/XiBI4xLr58LJACwK6G3HTOPeMz4nB4KJs33L2BelrIJa7P0VuNaVF3hMYfjg==\",\"inBundle\":true,\"license\":\"(Apache-2.0 AND MIT)\"},\"node_modules/nanoid\":{\"version\":\"3.3.18\",\"resolved\":\"https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz\",\"integrity\":\"sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==\",\"dev\":true,\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/ai\"}],\"license\":\"MIT\",\"bin\":{\"nanoid\":\"bin/nanoid.cjs\"},\"engines\":{\"node\":\"^10 || ^12 || ^13.7 || ^14 || >=15.0.1\"}},\"node_modules/on-exit-leak-free\":{\"version\":\"2.1.2\",\"resolved\":\"https://registry.npmjs.org/on-exit-leak-free/-/on-exit-leak-free-2.1.2.tgz\",\"integrity\":\"sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=14.0.0\"}},\"node_modules/path-browserify\":{\"version\":\"1.0.1\",\"resolved\":\"https://registry.npmjs.org/path-browserify/-/path-browserify-1.0.1.tgz\",\"integrity\":\"sha512-b7uo2UCUOYZcnF/3ID0lulOJi/bafxa1xPe7ZPsammBSpjSWQkjNxlt635YGS2MiR9GjvuXCtz2emr3jbsz98g==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/picocolors\":{\"version\":\"1.1.1\",\"resolved\":\"https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz\",\"integrity\":\"sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==\",\"dev\":true,\"license\":\"ISC\"},\"node_modules/picomatch\":{\"version\":\"4.0.7\",\"resolved\":\"https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz\",\"integrity\":\"sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=12\"},\"funding\":{\"url\":\"https://github.com/sponsors/jonschlinkert\"}},\"node_modules/pino\":{\"version\":\"8.21.0\",\"resolved\":\"https://registry.npmjs.org/pino/-/pino-8.21.0.tgz\",\"integrity\":\"sha512-ip4qdzjkAyDDZklUaZkcRFb2iA118H9SgRh8yzTkSQK8HilsOJF7rSY8HoW5+I0M46AZgX/pxbprf2vvzQCE0Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"atomic-sleep\":\"^1.0.0\",\"fast-redact\":\"^3.1.1\",\"on-exit-leak-free\":\"^2.1.0\",\"pino-abstract-transport\":\"^1.2.0\",\"pino-std-serializers\":\"^6.0.0\",\"process-warning\":\"^3.0.0\",\"quick-format-unescaped\":\"^4.0.3\",\"real-require\":\"^0.2.0\",\"safe-stable-stringify\":\"^2.3.1\",\"sonic-boom\":\"^3.7.0\",\"thread-stream\":\"^2.6.0\"},\"bin\":{\"pino\":\"bin.js\"}},\"node_modules/pino-abstract-transport\":{\"version\":\"1.2.0\",\"resolved\":\"https://registry.npmjs.org/pino-abstract-transport/-/pino-abstract-transport-1.2.0.tgz\",\"integrity\":\"sha512-Guhh8EZfPCfH+PMXAb6rKOjGQEoy0xlAIn+irODG5kgfYV+BQ0rGYYWTIel3P5mmyXqkYkPmdIkywsn6QKUR1Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"readable-stream\":\"^4.0.0\",\"split2\":\"^4.0.0\"}},\"node_modules/pino-std-serializers\":{\"version\":\"6.2.2\",\"resolved\":\"https://registry.npmjs.org/pino-std-serializers/-/pino-std-serializers-6.2.2.tgz\",\"integrity\":\"sha512-cHjPPsE+vhj/tnhCy/wiMh3M3z3h/j15zHQX+S9GkTBgqJuTuJzYJ4gUyACLhDaJ7kk9ba9iRDmbH2tJU03OiA==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/playwright\":{\"version\":\"1.63.0\",\"resolved\":\"https://registry.npmjs.org/playwright/-/playwright-1.63.0.tgz\",\"integrity\":\"sha512-+7ziBLidS4NaNCdt57SUDT+wYmmd5fmiQejUic/kb+YsYSCPyOOE9sebzMjNmQrsnNpDJqd4WHvV/8lfKfUDUg==\",\"dev\":true,\"license\":\"Apache-2.0\",\"dependencies\":{\"playwright-core\":\"1.63.0\"},\"bin\":{\"playwright\":\"cli.js\"},\"engines\":{\"node\":\">=20\"}},\"node_modules/playwright-core\":{\"version\":\"1.63.0\",\"resolved\":\"https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz\",\"integrity\":\"sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==\",\"dev\":true,\"license\":\"Apache-2.0\",\"bin\":{\"playwright-core\":\"cli.js\"},\"engines\":{\"node\":\">=20\"}},\"node_modules/postcss\":{\"version\":\"8.5.28\",\"resolved\":\"https://registry.npmjs.org/postcss/-/postcss-8.5.28.tgz\",\"integrity\":\"sha512-RRuzqDtt5Y9h3quz5hWhK+TPnsmVs6WwSU6LkJMeY4HstUEDuYTG8UJSdawMRzmzAtV+KEoG8N3Qg2qLy5vM/A==\",\"dev\":true,\"funding\":[{\"type\":\"opencollective\",\"url\":\"https://opencollective.com/postcss/\"},{\"type\":\"tidelift\",\"url\":\"https://tidelift.com/funding/github/npm/postcss\"},{\"type\":\"github\",\"url\":\"https://github.com/sponsors/ai\"}],\"license\":\"MIT\",\"dependencies\":{\"nanoid\":\"^3.3.18\",\"picocolors\":\"^1.1.1\",\"source-map-js\":\"^1.2.1\"},\"engines\":{\"node\":\"^10 || ^12 || >=14\"}},\"node_modules/prettier\":{\"version\":\"3.9.9\",\"resolved\":\"https://registry.npmjs.org/prettier/-/prettier-3.9.9.tgz\",\"integrity\":\"sha512-Z/CJHIkdujO/OtN7nXUii0Rf3VT5SRuhjBA82Xvu2XhBUgX3nhP67T0LHceBdQLex7OOFGTox+Q5Yg8Jk2Qivg==\",\"inBundle\":true,\"license\":\"MIT\",\"bin\":{\"prettier\":\"bin/prettier.cjs\"},\"engines\":{\"node\":\">=14\"},\"funding\":{\"url\":\"https://github.com/prettier/prettier?sponsor=1\"}},\"node_modules/process\":{\"version\":\"0.11.10\",\"resolved\":\"https://registry.npmjs.org/process/-/process-0.11.10.tgz\",\"integrity\":\"sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 0.6.0\"}},\"node_modules/process-warning\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/process-warning/-/process-warning-3.0.0.tgz\",\"integrity\":\"sha512-mqn0kFRl0EoqhnL0GQ0veqFHyIN1yig9RHh/InzORTUiZHFRAur+aMtRkELNwGs9aNwKS6tg/An4NYBPGwvtzQ==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/quick-format-unescaped\":{\"version\":\"4.0.4\",\"resolved\":\"https://registry.npmjs.org/quick-format-unescaped/-/quick-format-unescaped-4.0.4.tgz\",\"integrity\":\"sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/readable-stream\":{\"version\":\"4.7.0\",\"resolved\":\"https://registry.npmjs.org/readable-stream/-/readable-stream-4.7.0.tgz\",\"integrity\":\"sha512-oIGGmcpTLwPga8Bn6/Z75SVaH1z5dUut2ibSyAMVhmUggWpmDn2dapB0n7f8nwaSiRtepAsfJyfXIO5DCVAODg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"abort-controller\":\"^3.0.0\",\"buffer\":\"^6.0.3\",\"events\":\"^3.3.0\",\"process\":\"^0.11.10\",\"string_decoder\":\"^1.3.0\"},\"engines\":{\"node\":\"^12.22.0 || ^14.17.0 || >=16.0.0\"}},\"node_modules/real-require\":{\"version\":\"0.2.0\",\"resolved\":\"https://registry.npmjs.org/real-require/-/real-require-0.2.0.tgz\",\"integrity\":\"sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">= 12.13.0\"}},\"node_modules/require-directory\":{\"version\":\"2.1.1\",\"resolved\":\"https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz\",\"integrity\":\"sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=0.10.0\"}},\"node_modules/rolldown\":{\"version\":\"1.2.7\",\"resolved\":\"https://registry.npmjs.org/rolldown/-/rolldown-1.2.7.tgz\",\"integrity\":\"sha512-g0EtLvBjTUB7jhyV0S/TCup3v/XSVl45vUIGbOGU4QPiyjTenCe4mKuFvW9fEgYmS2Fo42AUssRmNuMziXdrig==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"@oxc-project/types\":\"=0.148.0\",\"@rolldown/pluginutils\":\"^1.0.0\"},\"bin\":{\"rolldown\":\"bin/cli.mjs\"},\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"},\"optionalDependencies\":{\"@rolldown/binding-android-arm-eabi\":\"1.2.7\",\"@rolldown/binding-android-arm64\":\"1.2.7\",\"@rolldown/binding-darwin-arm64\":\"1.2.7\",\"@rolldown/binding-darwin-x64\":\"1.2.7\",\"@rolldown/binding-freebsd-x64\":\"1.2.7\",\"@rolldown/binding-linux-arm-gnueabihf\":\"1.2.7\",\"@rolldown/binding-linux-arm64-gnu\":\"1.2.7\",\"@rolldown/binding-linux-arm64-musl\":\"1.2.7\",\"@rolldown/binding-linux-ppc64-gnu\":\"1.2.7\",\"@rolldown/binding-linux-s390x-gnu\":\"1.2.7\",\"@rolldown/binding-linux-x64-gnu\":\"1.2.7\",\"@rolldown/binding-linux-x64-musl\":\"1.2.7\",\"@rolldown/binding-openharmony-arm64\":\"1.2.7\",\"@rolldown/binding-win32-arm64-msvc\":\"1.2.7\",\"@rolldown/binding-win32-x64-msvc\":\"1.2.7\"}},\"node_modules/safe-buffer\":{\"version\":\"5.2.1\",\"resolved\":\"https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz\",\"integrity\":\"sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==\",\"funding\":[{\"type\":\"github\",\"url\":\"https://github.com/sponsors/feross\"},{\"type\":\"patreon\",\"url\":\"https://www.patreon.com/feross\"},{\"type\":\"consulting\",\"url\":\"https://feross.org/support\"}],\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/safe-stable-stringify\":{\"version\":\"2.5.0\",\"resolved\":\"https://registry.npmjs.org/safe-stable-stringify/-/safe-stable-stringify-2.5.0.tgz\",\"integrity\":\"sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=10\"}},\"node_modules/sonic-boom\":{\"version\":\"3.8.1\",\"resolved\":\"https://registry.npmjs.org/sonic-boom/-/sonic-boom-3.8.1.tgz\",\"integrity\":\"sha512-y4Z8LCDBuum+PBP3lSV7RHrXscqksve/bi0as7mhwVnBW+/wUqKT/2Kb7um8yqcFy0duYbbPxzt89Zy2nOCaxg==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"atomic-sleep\":\"^1.0.0\"}},\"node_modules/source-map-js\":{\"version\":\"1.2.1\",\"resolved\":\"https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz\",\"integrity\":\"sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==\",\"dev\":true,\"license\":\"BSD-3-Clause\",\"engines\":{\"node\":\">=0.10.0\"}},\"node_modules/split2\":{\"version\":\"4.2.0\",\"resolved\":\"https://registry.npmjs.org/split2/-/split2-4.2.0.tgz\",\"integrity\":\"sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\">= 10.x\"}},\"node_modules/string_decoder\":{\"version\":\"1.3.0\",\"resolved\":\"https://registry.npmjs.org/string_decoder/-/string_decoder-1.3.0.tgz\",\"integrity\":\"sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"safe-buffer\":\"~5.2.0\"}},\"node_modules/string-width\":{\"version\":\"4.2.3\",\"resolved\":\"https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz\",\"integrity\":\"sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"emoji-regex\":\"^8.0.0\",\"is-fullwidth-code-point\":\"^3.0.0\",\"strip-ansi\":\"^6.0.1\"},\"engines\":{\"node\":\">=8\"}},\"node_modules/strip-ansi\":{\"version\":\"6.0.1\",\"resolved\":\"https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz\",\"integrity\":\"sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"ansi-regex\":\"^5.0.1\"},\"engines\":{\"node\":\">=8\"}},\"node_modules/thread-stream\":{\"version\":\"2.7.0\",\"resolved\":\"https://registry.npmjs.org/thread-stream/-/thread-stream-2.7.0.tgz\",\"integrity\":\"sha512-qQiRWsU/wvNolI6tbbCKd9iKaTnCXsTwVxhhKM6nctPdujTyztjlbUkUTUymidWcMnZ5pWR0ej4a0tjsW021vw==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"real-require\":\"^0.2.0\"}},\"node_modules/tinyglobby\":{\"version\":\"0.2.17\",\"resolved\":\"https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz\",\"integrity\":\"sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"fdir\":\"^6.5.0\",\"picomatch\":\"^4.0.4\"},\"engines\":{\"node\":\">=12.0.0\"},\"funding\":{\"url\":\"https://github.com/sponsors/SuperchupuDev\"}},\"node_modules/ts-morph\":{\"version\":\"27.0.2\",\"resolved\":\"https://registry.npmjs.org/ts-morph/-/ts-morph-27.0.2.tgz\",\"integrity\":\"sha512-fhUhgeljcrdZ+9DZND1De1029PrE+cMkIP7ooqkLRTrRLTqcki2AstsyJm0vRNbTbVCNJ0idGlbBrfqc7/nA8w==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"@ts-morph/common\":\"~0.28.1\",\"code-block-writer\":\"^13.0.3\"}},\"node_modules/tslib\":{\"version\":\"2.8.1\",\"resolved\":\"https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz\",\"integrity\":\"sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==\",\"inBundle\":true,\"license\":\"0BSD\"},\"node_modules/tsx\":{\"version\":\"4.23.13\",\"resolved\":\"https://registry.npmjs.org/tsx/-/tsx-4.23.13.tgz\",\"integrity\":\"sha512-BL5MGkRln6aDYhb0xbQlEAGw743BaZYWdbWtdJOBriYJboKgUUYCadFp2/FpBBZquBC/ezNBn7wMMPx7FDZUDw==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"esbuild\":\"~0.28.0\"},\"bin\":{\"tsx\":\"dist/cli.mjs\"},\"engines\":{\"node\":\">=18.0.0\"},\"optionalDependencies\":{\"fsevents\":\"~2.3.3\"}},\"node_modules/typescript\":{\"version\":\"7.0.2\",\"resolved\":\"https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz\",\"integrity\":\"sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==\",\"devOptional\":true,\"inBundle\":true,\"license\":\"Apache-2.0\",\"bin\":{\"tsc\":\"bin/tsc\"},\"engines\":{\"node\":\">=16.20.0\"},\"optionalDependencies\":{\"@typescript/typescript-aix-ppc64\":\"7.0.2\",\"@typescript/typescript-darwin-arm64\":\"7.0.2\",\"@typescript/typescript-darwin-x64\":\"7.0.2\",\"@typescript/typescript-freebsd-arm64\":\"7.0.2\",\"@typescript/typescript-freebsd-x64\":\"7.0.2\",\"@typescript/typescript-linux-arm\":\"7.0.2\",\"@typescript/typescript-linux-arm64\":\"7.0.2\",\"@typescript/typescript-linux-loong64\":\"7.0.2\",\"@typescript/typescript-linux-mips64el\":\"7.0.2\",\"@typescript/typescript-linux-ppc64\":\"7.0.2\",\"@typescript/typescript-linux-riscv64\":\"7.0.2\",\"@typescript/typescript-linux-s390x\":\"7.0.2\",\"@typescript/typescript-linux-x64\":\"7.0.2\",\"@typescript/typescript-netbsd-arm64\":\"7.0.2\",\"@typescript/typescript-netbsd-x64\":\"7.0.2\",\"@typescript/typescript-openbsd-arm64\":\"7.0.2\",\"@typescript/typescript-openbsd-x64\":\"7.0.2\",\"@typescript/typescript-sunos-x64\":\"7.0.2\",\"@typescript/typescript-win32-arm64\":\"7.0.2\",\"@typescript/typescript-win32-x64\":\"7.0.2\"}},\"node_modules/uint8arrays\":{\"version\":\"3.0.0\",\"resolved\":\"https://registry.npmjs.org/uint8arrays/-/uint8arrays-3.0.0.tgz\",\"integrity\":\"sha512-HRCx0q6O9Bfbp+HHSfQQKD7wU70+lydKVt4EghkdOvlK/NlrF90z+eXV34mUd48rNvVJXwkrMSPpCATkct8fJA==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"multiformats\":\"^9.4.2\"}},\"node_modules/undici_v6\":{\"name\":\"undici\",\"version\":\"6.29.0\",\"resolved\":\"https://registry.npmjs.org/undici/-/undici-6.29.0.tgz\",\"integrity\":\"sha512-R+RODBqp6i2pPflGdq+xIOUkl+RNfGgHwoinecKu/JCuf2uO06cOKoDbI2P7Dn6KcswdKwrczbU6IYJ6K8X+wg==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=18.17\"}},\"node_modules/undici_v7\":{\"name\":\"undici\",\"version\":\"7.30.0\",\"resolved\":\"https://registry.npmjs.org/undici/-/undici-7.30.0.tgz\",\"integrity\":\"sha512-dkrQXeHSaoamnItlYbmzG0wFYrM0ZwDxCIg0A7aKjTyyhh9svRzCNFEzV+Vm05/yehjCzjDZ31KXfGEjYSztDQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=20.18.1\"}},\"node_modules/undici_v8\":{\"name\":\"undici\",\"version\":\"8.11.2\",\"resolved\":\"https://registry.npmjs.org/undici/-/undici-8.11.2.tgz\",\"integrity\":\"sha512-u4UB2/IrKdU6lFxumHmmo1a3fCQO5tzQllRorfoRS63txhrB7xTpSn1PftwC4qEHkOaqP95fCWW4lJzwErwzhQ==\",\"inBundle\":true,\"license\":\"MIT\",\"engines\":{\"node\":\">=22.19.0\"}},\"node_modules/undici-types\":{\"version\":\"8.3.0\",\"resolved\":\"https://registry.npmjs.org/undici-types/-/undici-types-8.3.0.tgz\",\"integrity\":\"sha512-j375ScV60dom+YkPFIfTLcOiPxkN/buHz5GobjLhixFuANaNs3C9l4GmrWqejgXWJ7BbJcFYpTEUkS1Ge8bpZQ==\",\"dev\":true,\"license\":\"MIT\"},\"node_modules/unicode-segmenter\":{\"version\":\"0.14.5\",\"resolved\":\"https://registry.npmjs.org/unicode-segmenter/-/unicode-segmenter-0.14.5.tgz\",\"integrity\":\"sha512-jHGmj2LUuqDcX3hqY12Ql+uhUTn8huuxNZGq7GvtF6bSybzH3aFgedYu/KTzQStEgt1Ra2F3HxadNXsNjb3m3g==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/valibot\":{\"version\":\"1.5.0\",\"resolved\":\"https://registry.npmjs.org/valibot/-/valibot-1.5.0.tgz\",\"integrity\":\"sha512-nil6AkP2TChWL43Z5uJ6GTxX01CUA+g8LWUM+N/rB9NBbkUMaUsi9PUNzlUPgoKASgmx9f7eGOYpJ04/fSa6FQ==\",\"inBundle\":true,\"license\":\"MIT\",\"peerDependencies\":{\"typescript\":\">=5\"},\"peerDependenciesMeta\":{\"typescript\":{\"optional\":true}}},\"node_modules/varint\":{\"version\":\"6.0.0\",\"resolved\":\"https://registry.npmjs.org/varint/-/varint-6.0.0.tgz\",\"integrity\":\"sha512-cXEIW6cfr15lFv563k4GuVuW/fiwjknytD37jIOLSdSWuOI6WnO/oKwmP2FQTU2l01LP8/M5TSAJpzUaGe3uWg==\",\"inBundle\":true,\"license\":\"MIT\"},\"node_modules/vite\":{\"version\":\"8.2.2\",\"resolved\":\"https://registry.npmjs.org/vite/-/vite-8.2.2.tgz\",\"integrity\":\"sha512-cFKLV/PRgAUlIRm5WjMjJ86jrftzpqcgH+Us+DS8mI3CDNiH30Whrz8uHL3+MOLPAgqbMBAqWdAHAphOAM+z/Q==\",\"dev\":true,\"license\":\"MIT\",\"dependencies\":{\"lightningcss\":\"^1.33.0\",\"picomatch\":\"^4.0.5\",\"postcss\":\"^8.5.26\",\"rolldown\":\"~1.2.4\",\"tinyglobby\":\"^0.2.17\"},\"bin\":{\"vite\":\"bin/vite.js\"},\"engines\":{\"node\":\"^20.19.0 || >=22.12.0\"},\"funding\":{\"url\":\"https://github.com/vitejs/vite?sponsor=1\"},\"optionalDependencies\":{\"fsevents\":\"~2.3.3\"},\"peerDependencies\":{\"@types/node\":\"^20.19.0 || >=22.12.0\",\"@vitejs/devtools\":\"^0.4.0 || ^0.5.0\",\"esbuild\":\"^0.27.0 || ^0.28.0\",\"jiti\":\">=1.21.0\",\"less\":\"^4.0.0\",\"sass\":\"^1.70.0\",\"sass-embedded\":\"^1.70.0\",\"stylus\":\">=0.54.8\",\"sugarss\":\"^5.0.0\",\"terser\":\"^5.16.0\",\"tsx\":\"^4.8.1\",\"yaml\":\"^2.4.2\"},\"peerDependenciesMeta\":{\"@types/node\":{\"optional\":true},\"@vitejs/devtools\":{\"optional\":true},\"esbuild\":{\"optional\":true},\"jiti\":{\"optional\":true},\"less\":{\"optional\":true},\"sass\":{\"optional\":true},\"sass-embedded\":{\"optional\":true},\"stylus\":{\"optional\":true},\"sugarss\":{\"optional\":true},\"terser\":{\"optional\":true},\"tsx\":{\"optional\":true},\"yaml\":{\"optional\":true}}},\"node_modules/wrap-ansi\":{\"version\":\"7.0.0\",\"resolved\":\"https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz\",\"integrity\":\"sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"ansi-styles\":\"^4.0.0\",\"string-width\":\"^4.1.0\",\"strip-ansi\":\"^6.0.0\"},\"engines\":{\"node\":\">=10\"},\"funding\":{\"url\":\"https://github.com/chalk/wrap-ansi?sponsor=1\"}},\"node_modules/y18n\":{\"version\":\"5.0.8\",\"resolved\":\"https://registry.npmjs.org/y18n/-/y18n-5.0.8.tgz\",\"integrity\":\"sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\">=10\"}},\"node_modules/yargs\":{\"version\":\"17.7.3\",\"resolved\":\"https://registry.npmjs.org/yargs/-/yargs-17.7.3.tgz\",\"integrity\":\"sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==\",\"inBundle\":true,\"license\":\"MIT\",\"dependencies\":{\"cliui\":\"^8.0.1\",\"escalade\":\"^3.1.1\",\"get-caller-file\":\"^2.0.5\",\"require-directory\":\"^2.1.1\",\"string-width\":\"^4.2.3\",\"y18n\":\"^5.0.5\",\"yargs-parser\":\"^21.1.1\"},\"engines\":{\"node\":\">=12\"}},\"node_modules/yargs-parser\":{\"version\":\"21.1.1\",\"resolved\":\"https://registry.npmjs.org/yargs-parser/-/yargs-parser-21.1.1.tgz\",\"integrity\":\"sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==\",\"inBundle\":true,\"license\":\"ISC\",\"engines\":{\"node\":\">=12\"}},\"node_modules/zod\":{\"version\":\"3.25.76\",\"resolved\":\"https://registry.npmjs.org/zod/-/zod-3.25.76.tgz\",\"integrity\":\"sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==\",\"inBundle\":true,\"license\":\"MIT\",\"funding\":{\"url\":\"https://github.com/sponsors/colinhacks\"}}}")
}, Da = Object.freeze([Object.freeze({
	package: "valibot",
	version: "1.5.0",
	peer: "typescript",
	purpose: "optional typechecking only"
})]), Oa = [
	["node_modules/@atcute/car", Kt],
	["node_modules/@atcute/cbor", qt],
	["node_modules/@atcute/cid", Jt],
	["node_modules/@atcute/crypto", Yt],
	["node_modules/@atcute/did-plc", Xt],
	["node_modules/@atcute/identity", Zt],
	["node_modules/@atcute/lexicons", Qt],
	["node_modules/@atcute/mst", $t],
	["node_modules/@atcute/multibase", en],
	["node_modules/@atcute/repo", tn],
	["node_modules/@atcute/uint8array", nn],
	["node_modules/@atcute/util-fetch", rn],
	["node_modules/@atcute/util-text", an],
	["node_modules/@atcute/util-text/node_modules/unicode-segmenter", on],
	["node_modules/@atcute/varint", sn],
	["node_modules/@atproto-labs/did-resolver", cn],
	["node_modules/@atproto-labs/fetch", ln],
	["node_modules/@atproto-labs/fetch-node", un],
	["node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch", dn],
	["node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe", fn],
	["node_modules/@atproto-labs/handle-resolver", pn],
	["node_modules/@atproto-labs/handle-resolver-node", mn],
	["node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did", hn],
	["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store", gn],
	["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory", _n],
	["node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did", vn],
	["node_modules/@atproto-labs/identity-resolver", yn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver", bn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch", xn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe", Sn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store", Cn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory", wn],
	["node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did", Tn],
	["node_modules/@atproto-labs/pipe", En],
	["node_modules/@atproto-labs/simple-store", Dn],
	["node_modules/@atproto-labs/simple-store-memory", On],
	["node_modules/@atproto/common", kn],
	["node_modules/@atproto/common-web", An],
	["node_modules/@atproto/common/node_modules/@atproto/common-web", jn],
	["node_modules/@atproto/common/node_modules/@atproto/lex-cbor", Mn],
	["node_modules/@atproto/common/node_modules/@atproto/lex-data", Nn],
	["node_modules/@atproto/common/node_modules/@atproto/lex-json", Pn],
	["node_modules/@atproto/common/node_modules/@atproto/syntax", Fn],
	["node_modules/@atproto/crypto", In],
	["node_modules/@atproto/did", Ln],
	["node_modules/@atproto/jwk", Rn],
	["node_modules/@atproto/jwk-jose", zn],
	["node_modules/@atproto/jwk-webcrypto", Bn],
	["node_modules/@atproto/jwk/node_modules/multiformats", Vn],
	["node_modules/@atproto/lex", Hn],
	["node_modules/@atproto/lex-builder", Un],
	["node_modules/@atproto/lex-cbor", Wn],
	["node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data", Gn],
	["node_modules/@atproto/lex-client", Kn],
	["node_modules/@atproto/lex-client/node_modules/@atproto/lex-data", qn],
	["node_modules/@atproto/lex-client/node_modules/@atproto/lex-json", Jn],
	["node_modules/@atproto/lex-data", Yn],
	["node_modules/@atproto/lex-data/node_modules/multiformats", Xn],
	["node_modules/@atproto/lex-document", Zn],
	["node_modules/@atproto/lex-installer", Qn],
	["node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data", $n],
	["node_modules/@atproto/lex-installer/node_modules/@atproto/syntax", er],
	["node_modules/@atproto/lex-json", tr],
	["node_modules/@atproto/lex-resolver", nr],
	["node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data", rr],
	["node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax", ir],
	["node_modules/@atproto/lex-schema", ar],
	["node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data", or],
	["node_modules/@atproto/lex-schema/node_modules/@atproto/syntax", sr],
	["node_modules/@atproto/lex/node_modules/@atproto/lex-data", cr],
	["node_modules/@atproto/lex/node_modules/@atproto/lex-json", lr],
	["node_modules/@atproto/lexicon", ur],
	["node_modules/@atproto/lexicon/node_modules/multiformats", dr],
	["node_modules/@atproto/oauth-client", fr],
	["node_modules/@atproto/oauth-client-browser", pr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver", mr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch", hr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe", gr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store", _r],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory", vr],
	["node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did", yr],
	["node_modules/@atproto/oauth-client-node", br],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver", xr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch", Sr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe", Cr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store", wr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory", Tr],
	["node_modules/@atproto/oauth-client-node/node_modules/@atproto/did", Er],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver", Dr],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch", Or],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe", kr],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store", Ar],
	["node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory", jr],
	["node_modules/@atproto/oauth-client/node_modules/@atproto/did", Mr],
	["node_modules/@atproto/oauth-client/node_modules/multiformats", Nr],
	["node_modules/@atproto/oauth-types", Pr],
	["node_modules/@atproto/oauth-types/node_modules/@atproto/did", Fr],
	["node_modules/@atproto/repo", Ir],
	["node_modules/@atproto/repo/node_modules/@atproto/common-web", Lr],
	["node_modules/@atproto/repo/node_modules/@atproto/lex-data", Rr],
	["node_modules/@atproto/repo/node_modules/@atproto/lex-json", zr],
	["node_modules/@atproto/repo/node_modules/@atproto/lexicon", Br],
	["node_modules/@atproto/repo/node_modules/@atproto/syntax", Vr],
	["node_modules/@atproto/syntax", Hr],
	["node_modules/@atproto/xrpc", Ur],
	["node_modules/@atproto/xrpc/node_modules/@atproto/common-web", Wr],
	["node_modules/@atproto/xrpc/node_modules/@atproto/lexicon", Gr],
	["node_modules/@atproto/xrpc/node_modules/@atproto/syntax", Kr],
	["node_modules/@atproto/xrpc/node_modules/multiformats", qr],
	["node_modules/@inlay/core", Jr],
	["node_modules/@inlay/core/node_modules/@atproto/syntax", Yr],
	["node_modules/@inlay/render", Xr],
	["node_modules/@inlay/render/node_modules/@atproto/common-web", Zr],
	["node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax", Qr],
	["node_modules/@inlay/render/node_modules/@atproto/lex-data", $r],
	["node_modules/@inlay/render/node_modules/@atproto/lex-json", ei],
	["node_modules/@inlay/render/node_modules/@atproto/lexicon", ti],
	["node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax", ni],
	["node_modules/@inlay/render/node_modules/@atproto/syntax", ri],
	["node_modules/@ipld/dag-cbor", ii],
	["node_modules/@noble/curves", ai],
	["node_modules/@noble/hashes", oi],
	["node_modules/@noble/secp256k1", si],
	["node_modules/@oomfware/eval", ci],
	["node_modules/@standard-schema/spec", li],
	["node_modules/@ts-morph/common", ui],
	["node_modules/abort-controller", di],
	["node_modules/ansi-regex", fi],
	["node_modules/ansi-styles", pi],
	["node_modules/atomic-sleep", mi],
	["node_modules/balanced-match", hi],
	["node_modules/base64-js", gi],
	["node_modules/brace-expansion", _i],
	["node_modules/buffer", vi],
	["node_modules/cborg", yi],
	["node_modules/cliui", bi],
	["node_modules/code-block-writer", xi],
	["node_modules/color-convert", Si],
	["node_modules/color-name", Ci],
	["node_modules/core-js", wi],
	["node_modules/emoji-regex", Ti],
	["node_modules/escalade", Ei],
	["node_modules/esm-env", Di],
	["node_modules/event-target-shim", Oi],
	["node_modules/events", ki],
	["node_modules/fast-redact", Ai],
	["node_modules/fdir", ji],
	["node_modules/get-caller-file", Mi],
	["node_modules/ieee754", Ni],
	["node_modules/ipaddr.js", Pi],
	["node_modules/is-fullwidth-code-point", Fi],
	["node_modules/iso-datestring-validator", Ii],
	["node_modules/jose", Li],
	["node_modules/jsonata", Ri],
	["node_modules/jsonc-parser", zi],
	["node_modules/lru-cache", Bi],
	["node_modules/minimatch", Vi],
	["node_modules/multiformats", Hi],
	["node_modules/on-exit-leak-free", Ui],
	["node_modules/path-browserify", Wi],
	["node_modules/picomatch", Gi],
	["node_modules/pino", Ki],
	["node_modules/pino-abstract-transport", qi],
	["node_modules/pino-std-serializers", Ji],
	["node_modules/prettier", Yi],
	["node_modules/process", Xi],
	["node_modules/process-warning", Zi],
	["node_modules/quick-format-unescaped", Qi],
	["node_modules/readable-stream", $i],
	["node_modules/real-require", ea],
	["node_modules/require-directory", ta],
	["node_modules/safe-buffer", na],
	["node_modules/safe-stable-stringify", ra],
	["node_modules/sonic-boom", ia],
	["node_modules/split2", aa],
	["node_modules/string-width", oa],
	["node_modules/string_decoder", sa],
	["node_modules/strip-ansi", ca],
	["node_modules/thread-stream", la],
	["node_modules/tinyglobby", ua],
	["node_modules/ts-morph", da],
	["node_modules/tslib", fa],
	["node_modules/uint8arrays", pa],
	["node_modules/undici_v6", ma],
	["node_modules/undici_v7", ha],
	["node_modules/undici_v8", ga],
	["node_modules/unicode-segmenter", _a],
	["node_modules/valibot", va],
	["node_modules/varint", ya],
	["node_modules/wrap-ansi", ba],
	["node_modules/y18n", xa],
	["node_modules/yargs", Sa],
	["node_modules/yargs-parser", Ca],
	["node_modules/zod", wa]
];
function ka(e, t) {
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = e, r = t;
		return Object.keys(n).length === Object.keys(r).length && Object.keys(n).every((e) => Object.hasOwn(r, e) && ka(n[e], r[e]));
	}
	return e === t;
}
var Aa = !1;
function ja(e = Oa) {
	if (!(e === Oa && Aa)) {
		if (new Set(e.map(([e]) => e)).size !== e.length) throw new p("dependency_mismatch", "Duplicate dependency identity");
		if (e.length !== Object.keys(Ta.packages).length) throw new p("dependency_mismatch", "Dependency closure is incomplete");
		for (let [t, n] of e) {
			let e = Ta.packages[t], r = n, i = Ea.packages[t];
			if (!e || !r || !i || r.version !== e.version || i.integrity !== e.integrity || i.version !== e.version || [
				"dependencies",
				"optionalDependencies",
				"peerDependencies",
				"peerDependenciesMeta"
			].some((t) => !ka(r[t] ?? {}, e[t] ?? {}) || !ka(i[t] ?? {}, e[t] ?? {}))) throw new p("dependency_mismatch", `Unapproved dependency: ${t}`);
		}
		if (!ka(Ta.nonExecutedPeers, Da) || !ka(Gt.imports, Ta.imports) || !ka(Gt.dependencies, Ta.direct) || !ka(Ea.packages[""].dependencies, Ta.direct) || Object.entries(Ta.buildTools).some(([e, t]) => Gt.devDependencies[e] !== t || Ea.packages[""].devDependencies[e] !== t)) throw new p("dependency_mismatch", "Unapproved direct dependencies");
		e === Oa && (Aa = !0);
	}
}
//#endregion
//#region src/core/utf8.ts
function Ma(e) {
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
var Na = ee;
function Pa(e, t) {
	return e.length === t.length && e.every((e, n) => e === t[n]);
}
function Fa(e) {
	return e instanceof Error && (e.constructor === SyntaxError && /^(not a valid cid string|invalid binary cid)$/.test(e.message) || e.constructor === RangeError && /^(cid too short|incorrect cid (version|codec|digest codec|digest size) \(got .+\)|cid bytes includes remainder|invalid digest length)$/.test(e.message));
}
function T(e) {
	if (typeof e != "string") throw new m("wire_cid", "Expected a CID string");
	let t;
	try {
		t = Ye(e);
	} catch (e) {
		throw Fa(e) ? new m("wire_cid", "Expected a base32 CIDv1 with CBOR codec and SHA-256") : e;
	}
	if (t.codec !== 113 || Xe(t) !== e) throw new m("wire_cid", "Expected canonical CBOR CID");
	return { $link: e };
}
function Ia(e) {
	return { $bytes: nt(e).$bytes };
}
function La(e) {
	y(e, Na.jsonBytes, Na.depth);
	function t(e) {
		if (e && typeof e == "object") {
			if (Array.isArray(e)) {
				e.forEach(t);
				return;
			}
			if (Object.hasOwn(e, "$bytes")) {
				if (Object.keys(e).length !== 1 || typeof e.$bytes != "string" || !/^[A-Za-z0-9+/]*$/.test(e.$bytes) || e.$bytes.length % 4 == 1 || Ia(rt(e)).$bytes !== e.$bytes) throw new m("wire_bytes", "Bytes use one $bytes field with canonical unpadded base64");
				return;
			}
			if (Object.hasOwn(e, "$link")) {
				if (Object.keys(e).length !== 1) throw new m("wire_cid", "A link has exactly one $link field");
				T(e.$link);
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
function Ra(e) {
	ja(), La(e);
	let t = new Uint8Array(Ht(e));
	if (t.length > Na.blockBytes) throw new m("wire_size", "Block exceeds 64 KiB");
	return t;
}
function za(e, t = Na.depth) {
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
			l === 3 && !Ma(e) && r();
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
function Ba(e) {
	return e instanceof Error && [
		[RangeError, /^(could not decode varint|unexpected end of input|NaN and Infinity values not supported|can't decode integers beyond safe integer range|cid too short|incorrect cid version \(got v\d+\)|incorrect cid codec \(got 0x[0-9a-f]+\)|incorrect cid digest codec \(got 0x[0-9a-f]+\)|incorrect cid digest size \(got \d+\)|cid bytes includes remainder)$/],
		[TypeError, /^(non-canonical argument encoding|expected map to only have string keys; got type \d+|expected cid-link to be type 2 \(bytes\); got type \d+|unsupported tag; got \d+|invalid type; got \d+|map keys are not in canonical order or contain duplicates)$/],
		[SyntaxError, /^invalid binary cid$/],
		[Error, /^(invalid argument encoding; got \d+|invalid simple value; got \d+|decoded value contains remainder)$/]
	].some(([t, n]) => e.constructor === t && n.test(e.message));
}
function Va(e) {
	if (e.length > Na.blockBytes) throw new m("wire_size", "Block exceeds 64 KiB");
	za(e);
	try {
		function t(e, n) {
			if (n > Na.depth) throw new m("wire_depth", "Block nesting exceeds the profile");
			return e instanceof tt || e instanceof w ? e.toJSON() : Array.isArray(e) ? e.map((e) => t(e, n + 1)) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).map(([e, r]) => [e, t(r, n + 1)])) : e;
		}
		let n = t(_t(new Uint8Array(e)), 0);
		if (!Pa(e, Ra(n))) throw new m("noncanonical", "Block has a different canonical encoding");
		return n;
	} catch (e) {
		throw e instanceof f || !Ba(e) ? e : new m("noncanonical", e.message);
	}
}
async function Ha(e) {
	return Xe(await Ke(113, Ra(e)));
}
//#endregion
//#region node_modules/zod/v3/helpers/util.cjs
var Ua = /* @__PURE__ */ o(((e) => {
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
})), Wa = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.ZodError = e.quotelessJson = e.ZodIssueCode = void 0;
	var t = Ua();
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
})), Ga = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = Wa(), n = Ua();
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
})), Ka = /* @__PURE__ */ o(((e) => {
	var t = e && e.__importDefault || function(e) {
		return e && e.__esModule ? e : { default: e };
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.defaultErrorMap = void 0, e.setErrorMap = i, e.getErrorMap = a;
	var n = t(Ga());
	e.defaultErrorMap = n.default;
	var r = n.default;
	function i(e) {
		r = e;
	}
	function a() {
		return r;
	}
})), qa = /* @__PURE__ */ o(((e) => {
	var t = e && e.__importDefault || function(e) {
		return e && e.__esModule ? e : { default: e };
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.isAsync = e.isValid = e.isDirty = e.isAborted = e.OK = e.DIRTY = e.INVALID = e.ParseStatus = e.EMPTY_PATH = e.makeIssue = void 0, e.addIssueToContext = i;
	var n = Ka(), r = t(Ga());
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
})), Ja = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
})), Ya = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.errorUtil = void 0;
	var t;
	(function(e) {
		e.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, e.toString = (e) => typeof e == "string" ? e : e?.message;
	})(t || (e.errorUtil = t = {}));
})), Xa = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.discriminatedUnion = e.date = e.boolean = e.bigint = e.array = e.any = e.coerce = e.ZodFirstPartyTypeKind = e.late = e.ZodSchema = e.Schema = e.ZodReadonly = e.ZodPipeline = e.ZodBranded = e.BRAND = e.ZodNaN = e.ZodCatch = e.ZodDefault = e.ZodNullable = e.ZodOptional = e.ZodTransformer = e.ZodEffects = e.ZodPromise = e.ZodNativeEnum = e.ZodEnum = e.ZodLiteral = e.ZodLazy = e.ZodFunction = e.ZodSet = e.ZodMap = e.ZodRecord = e.ZodTuple = e.ZodIntersection = e.ZodDiscriminatedUnion = e.ZodUnion = e.ZodObject = e.ZodArray = e.ZodVoid = e.ZodNever = e.ZodUnknown = e.ZodAny = e.ZodNull = e.ZodUndefined = e.ZodSymbol = e.ZodDate = e.ZodBoolean = e.ZodBigInt = e.ZodNumber = e.ZodString = e.ZodType = void 0, e.NEVER = e.void = e.unknown = e.union = e.undefined = e.tuple = e.transformer = e.symbol = e.string = e.strictObject = e.set = e.record = e.promise = e.preprocess = e.pipeline = e.ostring = e.optional = e.onumber = e.oboolean = e.object = e.number = e.nullable = e.null = e.never = e.nativeEnum = e.nan = e.map = e.literal = e.lazy = e.intersection = e.instanceof = e.function = e.enum = e.effect = void 0, e.datetimeRegex = ce, e.custom = Qe;
	var t = Wa(), n = Ka(), r = Ya(), i = qa(), a = Ua(), o = class {
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
			return new He({
				schema: this,
				typeName: w.ZodEffects,
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
			return Ue.create(this, this._def);
		}
		nullable() {
			return We.create(this, this._def);
		}
		nullish() {
			return this.nullable().optional();
		}
		array() {
			return we.create(this);
		}
		promise() {
			return Ve.create(this, this._def);
		}
		or(e) {
			return De.create([this, e], this._def);
		}
		and(e) {
			return je.create(this, e, this._def);
		}
		transform(e) {
			return new He({
				...c(this._def),
				schema: this,
				typeName: w.ZodEffects,
				effect: {
					type: "transform",
					transform: e
				}
			});
		}
		default(e) {
			let t = typeof e == "function" ? e : () => e;
			return new Ge({
				...c(this._def),
				innerType: this,
				defaultValue: t,
				typeName: w.ZodDefault
			});
		}
		brand() {
			return new Je({
				typeName: w.ZodBranded,
				type: this,
				...c(this._def)
			});
		}
		catch(e) {
			let t = typeof e == "function" ? e : () => e;
			return new Ke({
				...c(this._def),
				innerType: this,
				catchValue: t,
				typeName: w.ZodCatch
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
			return Ye.create(this, e);
		}
		readonly() {
			return Xe.create(this);
		}
		isOptional() {
			return this.safeParse(void 0).success;
		}
		isNullable() {
			return this.safeParse(null).success;
		}
	};
	e.ZodType = l, e.Schema = l, e.ZodSchema = l;
	var u = /^c[^\s-]{8,}$/i, d = /^[0-9a-z]+$/, f = /^[0-9A-HJKMNP-TV-Z]{26}$/i, p = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, m = /^[a-z0-9_-]{21}$/i, h = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, g = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, _ = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, v = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", y, ee = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, te = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, b = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, x = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, ne = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, re = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, ie = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", ae = RegExp(`^${ie}$`);
	function oe(e) {
		let t = "[0-5]\\d";
		e.precision ? t = `${t}\\.\\d{${e.precision}}` : e.precision ?? (t = `${t}(\\.\\d+)?`);
		let n = e.precision ? "+" : "?";
		return `([01]\\d|2[0-3]):[0-5]\\d(:${t})${n}`;
	}
	function se(e) {
		return RegExp(`^${oe(e)}$`);
	}
	function ce(e) {
		let t = `${ie}T${oe(e)}`, n = [];
		return n.push(e.local ? "Z?" : "Z"), e.offset && n.push("([+-]\\d{2}:?\\d{2})"), t = `${t}(${n.join("|")})`, RegExp(`^${t}$`);
	}
	function le(e, t) {
		return !((t !== "v4" && t || !ee.test(e)) && (t !== "v6" && t || !b.test(e)));
	}
	function S(e, t) {
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
	function ue(e, t) {
		return !((t !== "v4" && t || !te.test(e)) && (t !== "v6" && t || !x.test(e)));
	}
	var de = class e extends l {
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
			}), n.dirty()) : o.kind === "datetime" ? ce(o).test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: "datetime",
				message: o.message
			}), n.dirty()) : o.kind === "date" ? ae.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: "date",
				message: o.message
			}), n.dirty()) : o.kind === "time" ? se(o).test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				code: t.ZodIssueCode.invalid_string,
				validation: "time",
				message: o.message
			}), n.dirty()) : o.kind === "duration" ? g.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "duration",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "ip" ? le(e.data, o.version) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "ip",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "jwt" ? S(e.data, o.alg) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "jwt",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "cidr" ? ue(e.data, o.version) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "cidr",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "base64" ? ne.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
				validation: "base64",
				code: t.ZodIssueCode.invalid_string,
				message: o.message
			}), n.dirty()) : o.kind === "base64url" ? re.test(e.data) || (r = this._getOrReturnCtx(e, r), (0, i.addIssueToContext)(r, {
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
	e.ZodString = de, de.create = (e) => new de({
		checks: [],
		typeName: w.ZodString,
		coerce: e?.coerce ?? !1,
		...c(e)
	});
	function fe(e, t) {
		let n = (e.toString().split(".")[1] || "").length, r = (t.toString().split(".")[1] || "").length, i = n > r ? n : r;
		return Number.parseInt(e.toFixed(i).replace(".", "")) % Number.parseInt(t.toFixed(i).replace(".", "")) / 10 ** i;
	}
	var pe = class e extends l {
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
			}), r.dirty()) : o.kind === "multipleOf" ? fe(e.data, o.value) !== 0 && (n = this._getOrReturnCtx(e, n), (0, i.addIssueToContext)(n, {
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
	e.ZodNumber = pe, pe.create = (e) => new pe({
		checks: [],
		typeName: w.ZodNumber,
		coerce: e?.coerce || !1,
		...c(e)
	});
	var me = class e extends l {
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
	e.ZodBigInt = me, me.create = (e) => new me({
		checks: [],
		typeName: w.ZodBigInt,
		coerce: e?.coerce ?? !1,
		...c(e)
	});
	var he = class extends l {
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
	e.ZodBoolean = he, he.create = (e) => new he({
		typeName: w.ZodBoolean,
		coerce: e?.coerce || !1,
		...c(e)
	});
	var ge = class e extends l {
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
	e.ZodDate = ge, ge.create = (e) => new ge({
		checks: [],
		coerce: e?.coerce || !1,
		typeName: w.ZodDate,
		...c(e)
	});
	var _e = class extends l {
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
	e.ZodSymbol = _e, _e.create = (e) => new _e({
		typeName: w.ZodSymbol,
		...c(e)
	});
	var ve = class extends l {
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
	e.ZodUndefined = ve, ve.create = (e) => new ve({
		typeName: w.ZodUndefined,
		...c(e)
	});
	var ye = class extends l {
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
	e.ZodNull = ye, ye.create = (e) => new ye({
		typeName: w.ZodNull,
		...c(e)
	});
	var be = class extends l {
		constructor() {
			super(...arguments), this._any = !0;
		}
		_parse(e) {
			return (0, i.OK)(e.data);
		}
	};
	e.ZodAny = be, be.create = (e) => new be({
		typeName: w.ZodAny,
		...c(e)
	});
	var xe = class extends l {
		constructor() {
			super(...arguments), this._unknown = !0;
		}
		_parse(e) {
			return (0, i.OK)(e.data);
		}
	};
	e.ZodUnknown = xe, xe.create = (e) => new xe({
		typeName: w.ZodUnknown,
		...c(e)
	});
	var Se = class extends l {
		_parse(e) {
			let n = this._getOrReturnCtx(e);
			return (0, i.addIssueToContext)(n, {
				code: t.ZodIssueCode.invalid_type,
				expected: a.ZodParsedType.never,
				received: n.parsedType
			}), i.INVALID;
		}
	};
	e.ZodNever = Se, Se.create = (e) => new Se({
		typeName: w.ZodNever,
		...c(e)
	});
	var Ce = class extends l {
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
	e.ZodVoid = Ce, Ce.create = (e) => new Ce({
		typeName: w.ZodVoid,
		...c(e)
	});
	var we = class e extends l {
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
	e.ZodArray = we, we.create = (e, t) => new we({
		type: e,
		minLength: null,
		maxLength: null,
		exactLength: null,
		typeName: w.ZodArray,
		...c(t)
	});
	function Te(e) {
		if (e instanceof Ee) {
			let t = {};
			for (let n in e.shape) {
				let r = e.shape[n];
				t[n] = Ue.create(Te(r));
			}
			return new Ee({
				...e._def,
				shape: () => t
			});
		}
		return e instanceof we ? new we({
			...e._def,
			type: Te(e.element)
		}) : e instanceof Ue ? Ue.create(Te(e.unwrap())) : e instanceof We ? We.create(Te(e.unwrap())) : e instanceof Me ? Me.create(e.items.map((e) => Te(e))) : e;
	}
	var Ee = class e extends l {
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
			if (!(this._def.catchall instanceof Se && this._def.unknownKeys === "strip")) for (let e in r.data) c.includes(e) || l.push(e);
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
			if (this._def.catchall instanceof Se) {
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
				typeName: w.ZodObject
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
			return Te(this);
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
				for (; t instanceof Ue;) t = t._def.innerType;
				n[e] = t;
			}
			return new e({
				...this._def,
				shape: () => n
			});
		}
		keyof() {
			return ze(a.util.objectKeys(this.shape));
		}
	};
	e.ZodObject = Ee, Ee.create = (e, t) => new Ee({
		shape: () => e,
		unknownKeys: "strip",
		catchall: Se.create(),
		typeName: w.ZodObject,
		...c(t)
	}), Ee.strictCreate = (e, t) => new Ee({
		shape: () => e,
		unknownKeys: "strict",
		catchall: Se.create(),
		typeName: w.ZodObject,
		...c(t)
	}), Ee.lazycreate = (e, t) => new Ee({
		shape: e,
		unknownKeys: "strip",
		catchall: Se.create(),
		typeName: w.ZodObject,
		...c(t)
	});
	var De = class extends l {
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
	e.ZodUnion = De, De.create = (e, t) => new De({
		options: e,
		typeName: w.ZodUnion,
		...c(t)
	});
	var Oe = (e) => e instanceof Le ? Oe(e.schema) : e instanceof He ? Oe(e.innerType()) : e instanceof Re ? [e.value] : e instanceof Be ? e.options : e instanceof C ? a.util.objectValues(e.enum) : e instanceof Ge ? Oe(e._def.innerType) : e instanceof ve ? [void 0] : e instanceof ye ? [null] : e instanceof Ue ? [void 0, ...Oe(e.unwrap())] : e instanceof We ? [null, ...Oe(e.unwrap())] : e instanceof Je || e instanceof Xe ? Oe(e.unwrap()) : e instanceof Ke ? Oe(e._def.innerType) : [], ke = class e extends l {
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
				let n = Oe(e.shape[t]);
				if (!n.length) throw Error(`A discriminator value for key \`${t}\` could not be extracted from all schema options`);
				for (let r of n) {
					if (i.has(r)) throw Error(`Discriminator property ${String(t)} has duplicate value ${String(r)}`);
					i.set(r, e);
				}
			}
			return new e({
				typeName: w.ZodDiscriminatedUnion,
				discriminator: t,
				options: n,
				optionsMap: i,
				...c(r)
			});
		}
	};
	e.ZodDiscriminatedUnion = ke;
	function Ae(e, t) {
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
				let r = Ae(e[n], t[n]);
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
				let i = e[r], a = t[r], o = Ae(i, a);
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
	var je = class extends l {
		_parse(e) {
			let { status: n, ctx: r } = this._processInputParams(e), a = (e, a) => {
				if ((0, i.isAborted)(e) || (0, i.isAborted)(a)) return i.INVALID;
				let o = Ae(e.value, a.value);
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
	e.ZodIntersection = je, je.create = (e, t, n) => new je({
		left: e,
		right: t,
		typeName: w.ZodIntersection,
		...c(n)
	});
	var Me = class e extends l {
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
	e.ZodTuple = Me, Me.create = (e, t) => {
		if (!Array.isArray(e)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
		return new Me({
			items: e,
			typeName: w.ZodTuple,
			rest: null,
			...c(t)
		});
	};
	var Ne = class e extends l {
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
				typeName: w.ZodRecord,
				...c(r)
			}) : new e({
				keyType: de.create(),
				valueType: t,
				typeName: w.ZodRecord,
				...c(n)
			});
		}
	};
	e.ZodRecord = Ne;
	var Pe = class extends l {
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
	e.ZodMap = Pe, Pe.create = (e, t, n) => new Pe({
		valueType: t,
		keyType: e,
		typeName: w.ZodMap,
		...c(n)
	});
	var Fe = class e extends l {
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
	e.ZodSet = Fe, Fe.create = (e, t) => new Fe({
		valueType: e,
		minSize: null,
		maxSize: null,
		typeName: w.ZodSet,
		...c(t)
	});
	var Ie = class e extends l {
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
			if (this._def.returns instanceof Ve) {
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
				args: Me.create(t).rest(xe.create())
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
				args: t || Me.create([]).rest(xe.create()),
				returns: n || xe.create(),
				typeName: w.ZodFunction,
				...c(r)
			});
		}
	};
	e.ZodFunction = Ie;
	var Le = class extends l {
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
	e.ZodLazy = Le, Le.create = (e, t) => new Le({
		getter: e,
		typeName: w.ZodLazy,
		...c(t)
	});
	var Re = class extends l {
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
	e.ZodLiteral = Re, Re.create = (e, t) => new Re({
		value: e,
		typeName: w.ZodLiteral,
		...c(t)
	});
	function ze(e, t) {
		return new Be({
			values: e,
			typeName: w.ZodEnum,
			...c(t)
		});
	}
	var Be = class e extends l {
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
	e.ZodEnum = Be, Be.create = ze;
	var C = class extends l {
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
	e.ZodNativeEnum = C, C.create = (e, t) => new C({
		values: e,
		typeName: w.ZodNativeEnum,
		...c(t)
	});
	var Ve = class extends l {
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
	e.ZodPromise = Ve, Ve.create = (e, t) => new Ve({
		type: e,
		typeName: w.ZodPromise,
		...c(t)
	});
	var He = class extends l {
		innerType() {
			return this._def.schema;
		}
		sourceType() {
			return this._def.schema._def.typeName === w.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
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
	e.ZodEffects = He, e.ZodTransformer = He, He.create = (e, t, n) => new He({
		schema: e,
		typeName: w.ZodEffects,
		effect: t,
		...c(n)
	}), He.createWithPreprocess = (e, t, n) => new He({
		schema: t,
		effect: {
			type: "preprocess",
			transform: e
		},
		typeName: w.ZodEffects,
		...c(n)
	});
	var Ue = class extends l {
		_parse(e) {
			return this._getType(e) === a.ZodParsedType.undefined ? (0, i.OK)(void 0) : this._def.innerType._parse(e);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	e.ZodOptional = Ue, Ue.create = (e, t) => new Ue({
		innerType: e,
		typeName: w.ZodOptional,
		...c(t)
	});
	var We = class extends l {
		_parse(e) {
			return this._getType(e) === a.ZodParsedType.null ? (0, i.OK)(null) : this._def.innerType._parse(e);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	e.ZodNullable = We, We.create = (e, t) => new We({
		innerType: e,
		typeName: w.ZodNullable,
		...c(t)
	});
	var Ge = class extends l {
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
	e.ZodDefault = Ge, Ge.create = (e, t) => new Ge({
		innerType: e,
		typeName: w.ZodDefault,
		defaultValue: typeof t.default == "function" ? t.default : () => t.default,
		...c(t)
	});
	var Ke = class extends l {
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
	e.ZodCatch = Ke, Ke.create = (e, t) => new Ke({
		innerType: e,
		typeName: w.ZodCatch,
		catchValue: typeof t.catch == "function" ? t.catch : () => t.catch,
		...c(t)
	});
	var qe = class extends l {
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
	e.ZodNaN = qe, qe.create = (e) => new qe({
		typeName: w.ZodNaN,
		...c(e)
	}), e.BRAND = Symbol("zod_brand");
	var Je = class extends l {
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
	e.ZodBranded = Je;
	var Ye = class e extends l {
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
				typeName: w.ZodPipeline
			});
		}
	};
	e.ZodPipeline = Ye;
	var Xe = class extends l {
		_parse(e) {
			let t = this._def.innerType._parse(e), n = (e) => ((0, i.isValid)(e) && (e.value = Object.freeze(e.value)), e);
			return (0, i.isAsync)(t) ? t.then((e) => n(e)) : n(t);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	e.ZodReadonly = Xe, Xe.create = (e, t) => new Xe({
		innerType: e,
		typeName: w.ZodReadonly,
		...c(t)
	});
	function Ze(e, t) {
		let n = typeof e == "function" ? e(t) : typeof e == "string" ? { message: e } : e;
		return typeof n == "string" ? { message: n } : n;
	}
	function Qe(e, t = {}, n) {
		return e ? be.create().superRefine((r, i) => {
			let a = e(r);
			if (a instanceof Promise) return a.then((e) => {
				if (!e) {
					let e = Ze(t, r), a = e.fatal ?? n ?? !0;
					i.addIssue({
						code: "custom",
						...e,
						fatal: a
					});
				}
			});
			if (!a) {
				let e = Ze(t, r), a = e.fatal ?? n ?? !0;
				i.addIssue({
					code: "custom",
					...e,
					fatal: a
				});
			}
		}) : be.create();
	}
	e.late = { object: Ee.lazycreate };
	var w;
	(function(e) {
		e.ZodString = "ZodString", e.ZodNumber = "ZodNumber", e.ZodNaN = "ZodNaN", e.ZodBigInt = "ZodBigInt", e.ZodBoolean = "ZodBoolean", e.ZodDate = "ZodDate", e.ZodSymbol = "ZodSymbol", e.ZodUndefined = "ZodUndefined", e.ZodNull = "ZodNull", e.ZodAny = "ZodAny", e.ZodUnknown = "ZodUnknown", e.ZodNever = "ZodNever", e.ZodVoid = "ZodVoid", e.ZodArray = "ZodArray", e.ZodObject = "ZodObject", e.ZodUnion = "ZodUnion", e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", e.ZodIntersection = "ZodIntersection", e.ZodTuple = "ZodTuple", e.ZodRecord = "ZodRecord", e.ZodMap = "ZodMap", e.ZodSet = "ZodSet", e.ZodFunction = "ZodFunction", e.ZodLazy = "ZodLazy", e.ZodLiteral = "ZodLiteral", e.ZodEnum = "ZodEnum", e.ZodEffects = "ZodEffects", e.ZodNativeEnum = "ZodNativeEnum", e.ZodOptional = "ZodOptional", e.ZodNullable = "ZodNullable", e.ZodDefault = "ZodDefault", e.ZodCatch = "ZodCatch", e.ZodPromise = "ZodPromise", e.ZodBranded = "ZodBranded", e.ZodPipeline = "ZodPipeline", e.ZodReadonly = "ZodReadonly";
	})(w || (e.ZodFirstPartyTypeKind = w = {})), e.instanceof = (e, t = { message: `Input not instance of ${e.name}` }) => Qe((t) => t instanceof e, t);
	var $e = de.create;
	e.string = $e;
	var et = pe.create;
	e.number = et, e.nan = qe.create, e.bigint = me.create;
	var tt = he.create;
	e.boolean = tt, e.date = ge.create, e.symbol = _e.create, e.undefined = ve.create, e.null = ye.create, e.any = be.create, e.unknown = xe.create, e.never = Se.create, e.void = Ce.create, e.array = we.create, e.object = Ee.create, e.strictObject = Ee.strictCreate, e.union = De.create, e.discriminatedUnion = ke.create, e.intersection = je.create, e.tuple = Me.create, e.record = Ne.create, e.map = Pe.create, e.set = Fe.create, e.function = Ie.create, e.lazy = Le.create, e.literal = Re.create, e.enum = Be.create, e.nativeEnum = C.create, e.promise = Ve.create;
	var nt = He.create;
	e.effect = nt, e.transformer = nt, e.optional = Ue.create, e.nullable = We.create, e.preprocess = He.createWithPreprocess, e.pipeline = Ye.create, e.ostring = () => $e().optional(), e.onumber = () => et().optional(), e.oboolean = () => tt().optional(), e.coerce = {
		string: ((e) => de.create({
			...e,
			coerce: !0
		})),
		number: ((e) => pe.create({
			...e,
			coerce: !0
		})),
		boolean: ((e) => he.create({
			...e,
			coerce: !0
		})),
		bigint: ((e) => me.create({
			...e,
			coerce: !0
		})),
		date: ((e) => ge.create({
			...e,
			coerce: !0
		}))
	}, e.NEVER = i.INVALID;
})), Za = /* @__PURE__ */ o(((e) => {
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
	Object.defineProperty(e, "__esModule", { value: !0 }), n(Ka(), e), n(qa(), e), n(Ja(), e), n(Ua(), e), n(Xa(), e), n(Wa(), e);
})), Qa = /* @__PURE__ */ o(((e) => {
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
	var a = r(Za());
	e.z = a, i(Za(), e), e.default = a;
})), $a = /* @__PURE__ */ o(((e) => {
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
})), eo = /* @__PURE__ */ o(((e) => {
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
})), to = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.DID_PLC_PREFIX = void 0, e.isDidPlc = a, e.asDidPlc = o, e.assertDidPlc = s;
	var t = $a(), n = "did:plc:";
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
})), no = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.didSchema = e.DID_PREFIX = void 0, e.assertDidMethod = a, e.extractDidMethod = o, e.assertDidMsid = s, e.assertDid = c, e.isDid = l, e.asDid = u;
	var t = Qa(), n = $a(), r = "did:";
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
})), ro = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.DID_WEB_PREFIX = void 0, e.isDidWeb = i, e.asDidWeb = a, e.assertDidWeb = o, e.didWebToUrl = s, e.urlToDidWeb = c, e.buildDidWebUrl = l;
	var t = $a(), n = no(), r = eo();
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
})), io = /* @__PURE__ */ o(((e) => {
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
	Object.defineProperty(e, "__esModule", { value: !0 }), n(to(), e), n(ro(), e);
})), ao = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.matchesIdentifier = t;
	function t(e, t, n) {
		return n.charCodeAt(0) === 35 ? n.length === t.length + 1 && n.endsWith(t) : n.length === t.length + 1 + e.length && n.charCodeAt(e.length) === 35 && n.startsWith(e) && n.endsWith(t);
	}
})), oo = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.ATPROTO_VERIFICATION_METHOD_TYPES = e.isAtprotoAudience = e.atprotoDidSchema = void 0, e.isAtprotoDid = o, e.asAtprotoDid = s, e.assertAtprotoDid = c, e.assertAtprotoDidWeb = l, e.isAtprotoDidWeb = u, e.extractAtprotoData = m, e.extractPdsUrl = h, e.isAtprotoAka = g, e.isAtprotoPersonalDataServerService = _, e.isAtprotoVerificationMethod = v;
	var t = Qa(), n = $a(), r = eo(), i = io(), a = ao();
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
})), so = /* @__PURE__ */ o(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.didDocumentValidator = e.didDocumentSchema = void 0;
	var t = Qa(), n = no(), r = eo(), i = t.z.string().url("RFC3968 compliant URI"), a = t.z.union([n.didSchema, t.z.array(n.didSchema)]), o = t.z.union([i.refine((e) => {
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
})), co = /* @__PURE__ */ o(((e) => {
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
	Object.defineProperty(e, "__esModule", { value: !0 }), n(oo(), e), n(so(), e), n($a(), e), n(no(), e), n(io(), e), n(ao(), e);
})), E;
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
})(E ||= {});
var lo;
(function(e) {
	e.mergeShapes = (e, t) => ({
		...e,
		...t
	});
})(lo ||= {});
var D = E.arrayToEnum([
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
]), uo = (e) => {
	switch (typeof e) {
		case "undefined": return D.undefined;
		case "string": return D.string;
		case "number": return Number.isNaN(e) ? D.nan : D.number;
		case "boolean": return D.boolean;
		case "function": return D.function;
		case "bigint": return D.bigint;
		case "symbol": return D.symbol;
		case "object": return Array.isArray(e) ? D.array : e === null ? D.null : e.then && typeof e.then == "function" && e.catch && typeof e.catch == "function" ? D.promise : typeof Map < "u" && e instanceof Map ? D.map : typeof Set < "u" && e instanceof Set ? D.set : typeof Date < "u" && e instanceof Date ? D.date : D.object;
		default: return D.unknown;
	}
}, O = E.arrayToEnum([
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
]), fo = class e extends Error {
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
		return JSON.stringify(this.issues, E.jsonStringifyReplacer, 2);
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
fo.create = (e) => new fo(e);
//#endregion
//#region node_modules/zod/v3/locales/en.js
var po = (e, t) => {
	let n;
	switch (e.code) {
		case O.invalid_type:
			n = e.received === D.undefined ? "Required" : `Expected ${e.expected}, received ${e.received}`;
			break;
		case O.invalid_literal:
			n = `Invalid literal value, expected ${JSON.stringify(e.expected, E.jsonStringifyReplacer)}`;
			break;
		case O.unrecognized_keys:
			n = `Unrecognized key(s) in object: ${E.joinValues(e.keys, ", ")}`;
			break;
		case O.invalid_union:
			n = "Invalid input";
			break;
		case O.invalid_union_discriminator:
			n = `Invalid discriminator value. Expected ${E.joinValues(e.options)}`;
			break;
		case O.invalid_enum_value:
			n = `Invalid enum value. Expected ${E.joinValues(e.options)}, received '${e.received}'`;
			break;
		case O.invalid_arguments:
			n = "Invalid function arguments";
			break;
		case O.invalid_return_type:
			n = "Invalid function return type";
			break;
		case O.invalid_date:
			n = "Invalid date";
			break;
		case O.invalid_string:
			typeof e.validation == "object" ? "includes" in e.validation ? (n = `Invalid input: must include "${e.validation.includes}"`, typeof e.validation.position == "number" && (n = `${n} at one or more positions greater than or equal to ${e.validation.position}`)) : "startsWith" in e.validation ? n = `Invalid input: must start with "${e.validation.startsWith}"` : "endsWith" in e.validation ? n = `Invalid input: must end with "${e.validation.endsWith}"` : E.assertNever(e.validation) : n = e.validation === "regex" ? "Invalid" : `Invalid ${e.validation}`;
			break;
		case O.too_small:
			n = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "more than"} ${e.minimum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "over"} ${e.minimum} character(s)` : e.type === "number" || e.type === "bigint" ? `Number must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${e.minimum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(e.minimum))}` : "Invalid input";
			break;
		case O.too_big:
			n = e.type === "array" ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "less than"} ${e.maximum} element(s)` : e.type === "string" ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "under"} ${e.maximum} character(s)` : e.type === "number" ? `Number must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "bigint" ? `BigInt must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : e.type === "date" ? `Date must be ${e.exact ? "exactly" : e.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(e.maximum))}` : "Invalid input";
			break;
		case O.custom:
			n = "Invalid input";
			break;
		case O.invalid_intersection_types:
			n = "Intersection results could not be merged";
			break;
		case O.not_multiple_of:
			n = `Number must be a multiple of ${e.multipleOf}`;
			break;
		case O.not_finite:
			n = "Number must be finite";
			break;
		default: n = t.defaultError, E.assertNever(e);
	}
	return { message: n };
}, mo = po;
function ho() {
	return mo;
}
//#endregion
//#region node_modules/zod/v3/helpers/parseUtil.js
var go = (e) => {
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
function k(e, t) {
	let n = ho(), r = go({
		issueData: t,
		data: e.data,
		path: e.path,
		errorMaps: [
			e.common.contextualErrorMap,
			e.schemaErrorMap,
			n,
			n === po ? void 0 : po
		].filter((e) => !!e)
	});
	e.common.issues.push(r);
}
var _o = class e {
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
			if (r.status === "aborted") return A;
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
			if (t.status === "aborted" || i.status === "aborted") return A;
			t.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), t.value !== "__proto__" && (i.value !== void 0 || r.alwaysSet) && (n[t.value] = i.value);
		}
		return {
			status: e.value,
			value: n
		};
	}
}, A = Object.freeze({ status: "aborted" }), vo = (e) => ({
	status: "dirty",
	value: e
}), j = (e) => ({
	status: "valid",
	value: e
}), yo = (e) => e.status === "aborted", bo = (e) => e.status === "dirty", xo = (e) => e.status === "valid", So = (e) => typeof Promise < "u" && e instanceof Promise, M;
(function(e) {
	e.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, e.toString = (e) => typeof e == "string" ? e : e?.message;
})(M ||= {});
//#endregion
//#region node_modules/zod/v3/types.js
var Co = class {
	constructor(e, t, n, r) {
		this._cachedPath = [], this.parent = e, this.data = t, this._path = n, this._key = r;
	}
	get path() {
		return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
	}
}, wo = (e, t) => {
	if (xo(t)) return {
		success: !0,
		data: t.value
	};
	if (!e.common.issues.length) throw Error("Validation failed but no issues detected.");
	return {
		success: !1,
		get error() {
			if (this._error) return this._error;
			let t = new fo(e.common.issues);
			return this._error = t, this._error;
		}
	};
};
function N(e) {
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
var P = class {
	get description() {
		return this._def.description;
	}
	_getType(e) {
		return uo(e.data);
	}
	_getOrReturnCtx(e, t) {
		return t || {
			common: e.parent.common,
			data: e.data,
			parsedType: uo(e.data),
			schemaErrorMap: this._def.errorMap,
			path: e.path,
			parent: e.parent
		};
	}
	_processInputParams(e) {
		return {
			status: new _o(),
			ctx: {
				common: e.parent.common,
				data: e.data,
				parsedType: uo(e.data),
				schemaErrorMap: this._def.errorMap,
				path: e.path,
				parent: e.parent
			}
		};
	}
	_parseSync(e) {
		let t = this._parse(e);
		if (So(t)) throw Error("Synchronous parse encountered promise.");
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
			parsedType: uo(e)
		};
		return wo(n, this._parseSync({
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
			parsedType: uo(e)
		};
		if (!this["~standard"].async) try {
			let n = this._parseSync({
				data: e,
				path: [],
				parent: t
			});
			return xo(n) ? { value: n.value } : { issues: t.common.issues };
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
		}).then((e) => xo(e) ? { value: e.value } : { issues: t.common.issues });
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
			parsedType: uo(e)
		}, r = this._parse({
			data: e,
			path: n.path,
			parent: n
		});
		return wo(n, await (So(r) ? r : Promise.resolve(r)));
	}
	refine(e, t) {
		let n = (e) => typeof t == "string" || t === void 0 ? { message: t } : typeof t == "function" ? t(e) : t;
		return this._refinement((t, r) => {
			let i = e(t), a = () => r.addIssue({
				code: O.custom,
				...n(t)
			});
			return typeof Promise < "u" && i instanceof Promise ? i.then((e) => e ? !0 : (a(), !1)) : i ? !0 : (a(), !1);
		});
	}
	refinement(e, t) {
		return this._refinement((n, r) => e(n) ? !0 : (r.addIssue(typeof t == "function" ? t(n, r) : t), !1));
	}
	_refinement(e) {
		return new Ds({
			schema: this,
			typeName: F.ZodEffects,
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
		return Os.create(this, this._def);
	}
	nullable() {
		return ks.create(this, this._def);
	}
	nullish() {
		return this.nullable().optional();
	}
	array() {
		return cs.create(this);
	}
	promise() {
		return Es.create(this, this._def);
	}
	or(e) {
		return ds.create([this, e], this._def);
	}
	and(e) {
		return hs.create(this, e, this._def);
	}
	transform(e) {
		return new Ds({
			...N(this._def),
			schema: this,
			typeName: F.ZodEffects,
			effect: {
				type: "transform",
				transform: e
			}
		});
	}
	default(e) {
		let t = typeof e == "function" ? e : () => e;
		return new As({
			...N(this._def),
			innerType: this,
			defaultValue: t,
			typeName: F.ZodDefault
		});
	}
	brand() {
		return new Ns({
			typeName: F.ZodBranded,
			type: this,
			...N(this._def)
		});
	}
	catch(e) {
		let t = typeof e == "function" ? e : () => e;
		return new js({
			...N(this._def),
			innerType: this,
			catchValue: t,
			typeName: F.ZodCatch
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
		return Ps.create(this, e);
	}
	readonly() {
		return Fs.create(this);
	}
	isOptional() {
		return this.safeParse(void 0).success;
	}
	isNullable() {
		return this.safeParse(null).success;
	}
}, To = /^c[^\s-]{8,}$/i, Eo = /^[0-9a-z]+$/, Do = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Oo = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, ko = /^[a-z0-9_-]{21}$/i, Ao = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, jo = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Mo = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, No = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", Po, Fo = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Io = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Lo = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Ro = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, zo = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Bo = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Vo = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Ho = RegExp(`^${Vo}$`);
function Uo(e) {
	let t = "[0-5]\\d";
	e.precision ? t = `${t}\\.\\d{${e.precision}}` : e.precision ?? (t = `${t}(\\.\\d+)?`);
	let n = e.precision ? "+" : "?";
	return `([01]\\d|2[0-3]):[0-5]\\d(:${t})${n}`;
}
function Wo(e) {
	return RegExp(`^${Uo(e)}$`);
}
function Go(e) {
	let t = `${Vo}T${Uo(e)}`, n = [];
	return n.push(e.local ? "Z?" : "Z"), e.offset && n.push("([+-]\\d{2}:?\\d{2})"), t = `${t}(${n.join("|")})`, RegExp(`^${t}$`);
}
function Ko(e, t) {
	return !((t !== "v4" && t || !Fo.test(e)) && (t !== "v6" && t || !Lo.test(e)));
}
function qo(e, t) {
	if (!Ao.test(e)) return !1;
	try {
		let [n] = e.split(".");
		if (!n) return !1;
		let r = n.replace(/-/g, "+").replace(/_/g, "/").padEnd(n.length + (4 - n.length % 4) % 4, "="), i = JSON.parse(atob(r));
		return !(typeof i != "object" || !i || "typ" in i && i?.typ !== "JWT" || !i.alg || t && i.alg !== t);
	} catch {
		return !1;
	}
}
function Jo(e, t) {
	return !((t !== "v4" && t || !Io.test(e)) && (t !== "v6" && t || !Ro.test(e)));
}
var Yo = class e extends P {
	_parse(e) {
		if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== D.string) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.string,
				received: t.parsedType
			}), A;
		}
		let t = new _o(), n;
		for (let r of this._def.checks) if (r.kind === "min") e.data.length < r.value && (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.too_small,
			minimum: r.value,
			type: "string",
			inclusive: !0,
			exact: !1,
			message: r.message
		}), t.dirty());
		else if (r.kind === "max") e.data.length > r.value && (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.too_big,
			maximum: r.value,
			type: "string",
			inclusive: !0,
			exact: !1,
			message: r.message
		}), t.dirty());
		else if (r.kind === "length") {
			let i = e.data.length > r.value, a = e.data.length < r.value;
			(i || a) && (n = this._getOrReturnCtx(e, n), i ? k(n, {
				code: O.too_big,
				maximum: r.value,
				type: "string",
				inclusive: !0,
				exact: !0,
				message: r.message
			}) : a && k(n, {
				code: O.too_small,
				minimum: r.value,
				type: "string",
				inclusive: !0,
				exact: !0,
				message: r.message
			}), t.dirty());
		} else if (r.kind === "email") Mo.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "email",
			code: O.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "emoji") Po ||= new RegExp(No, "u"), Po.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "emoji",
			code: O.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "uuid") Oo.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "uuid",
			code: O.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "nanoid") ko.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "nanoid",
			code: O.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "cuid") To.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "cuid",
			code: O.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "cuid2") Eo.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "cuid2",
			code: O.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "ulid") Do.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "ulid",
			code: O.invalid_string,
			message: r.message
		}), t.dirty());
		else if (r.kind === "url") try {
			new URL(e.data);
		} catch {
			n = this._getOrReturnCtx(e, n), k(n, {
				validation: "url",
				code: O.invalid_string,
				message: r.message
			}), t.dirty();
		}
		else r.kind === "regex" ? (r.regex.lastIndex = 0, r.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "regex",
			code: O.invalid_string,
			message: r.message
		}), t.dirty())) : r.kind === "trim" ? e.data = e.data.trim() : r.kind === "includes" ? e.data.includes(r.value, r.position) || (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.invalid_string,
			validation: {
				includes: r.value,
				position: r.position
			},
			message: r.message
		}), t.dirty()) : r.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : r.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : r.kind === "startsWith" ? e.data.startsWith(r.value) || (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.invalid_string,
			validation: { startsWith: r.value },
			message: r.message
		}), t.dirty()) : r.kind === "endsWith" ? e.data.endsWith(r.value) || (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.invalid_string,
			validation: { endsWith: r.value },
			message: r.message
		}), t.dirty()) : r.kind === "datetime" ? Go(r).test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.invalid_string,
			validation: "datetime",
			message: r.message
		}), t.dirty()) : r.kind === "date" ? Ho.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.invalid_string,
			validation: "date",
			message: r.message
		}), t.dirty()) : r.kind === "time" ? Wo(r).test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.invalid_string,
			validation: "time",
			message: r.message
		}), t.dirty()) : r.kind === "duration" ? jo.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "duration",
			code: O.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "ip" ? Ko(e.data, r.version) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "ip",
			code: O.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "jwt" ? qo(e.data, r.alg) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "jwt",
			code: O.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "cidr" ? Jo(e.data, r.version) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "cidr",
			code: O.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "base64" ? zo.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "base64",
			code: O.invalid_string,
			message: r.message
		}), t.dirty()) : r.kind === "base64url" ? Bo.test(e.data) || (n = this._getOrReturnCtx(e, n), k(n, {
			validation: "base64url",
			code: O.invalid_string,
			message: r.message
		}), t.dirty()) : E.assertNever(r);
		return {
			status: t.value,
			value: e.data
		};
	}
	_regex(e, t, n) {
		return this.refinement((t) => e.test(t), {
			validation: t,
			code: O.invalid_string,
			...M.errToObj(n)
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
			...M.errToObj(e)
		});
	}
	url(e) {
		return this._addCheck({
			kind: "url",
			...M.errToObj(e)
		});
	}
	emoji(e) {
		return this._addCheck({
			kind: "emoji",
			...M.errToObj(e)
		});
	}
	uuid(e) {
		return this._addCheck({
			kind: "uuid",
			...M.errToObj(e)
		});
	}
	nanoid(e) {
		return this._addCheck({
			kind: "nanoid",
			...M.errToObj(e)
		});
	}
	cuid(e) {
		return this._addCheck({
			kind: "cuid",
			...M.errToObj(e)
		});
	}
	cuid2(e) {
		return this._addCheck({
			kind: "cuid2",
			...M.errToObj(e)
		});
	}
	ulid(e) {
		return this._addCheck({
			kind: "ulid",
			...M.errToObj(e)
		});
	}
	base64(e) {
		return this._addCheck({
			kind: "base64",
			...M.errToObj(e)
		});
	}
	base64url(e) {
		return this._addCheck({
			kind: "base64url",
			...M.errToObj(e)
		});
	}
	jwt(e) {
		return this._addCheck({
			kind: "jwt",
			...M.errToObj(e)
		});
	}
	ip(e) {
		return this._addCheck({
			kind: "ip",
			...M.errToObj(e)
		});
	}
	cidr(e) {
		return this._addCheck({
			kind: "cidr",
			...M.errToObj(e)
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
			...M.errToObj(e?.message)
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
			...M.errToObj(e?.message)
		});
	}
	duration(e) {
		return this._addCheck({
			kind: "duration",
			...M.errToObj(e)
		});
	}
	regex(e, t) {
		return this._addCheck({
			kind: "regex",
			regex: e,
			...M.errToObj(t)
		});
	}
	includes(e, t) {
		return this._addCheck({
			kind: "includes",
			value: e,
			position: t?.position,
			...M.errToObj(t?.message)
		});
	}
	startsWith(e, t) {
		return this._addCheck({
			kind: "startsWith",
			value: e,
			...M.errToObj(t)
		});
	}
	endsWith(e, t) {
		return this._addCheck({
			kind: "endsWith",
			value: e,
			...M.errToObj(t)
		});
	}
	min(e, t) {
		return this._addCheck({
			kind: "min",
			value: e,
			...M.errToObj(t)
		});
	}
	max(e, t) {
		return this._addCheck({
			kind: "max",
			value: e,
			...M.errToObj(t)
		});
	}
	length(e, t) {
		return this._addCheck({
			kind: "length",
			value: e,
			...M.errToObj(t)
		});
	}
	nonempty(e) {
		return this.min(1, M.errToObj(e));
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
Yo.create = (e) => new Yo({
	checks: [],
	typeName: F.ZodString,
	coerce: e?.coerce ?? !1,
	...N(e)
});
function Xo(e, t) {
	let n = (e.toString().split(".")[1] || "").length, r = (t.toString().split(".")[1] || "").length, i = n > r ? n : r;
	return Number.parseInt(e.toFixed(i).replace(".", "")) % Number.parseInt(t.toFixed(i).replace(".", "")) / 10 ** i;
}
var Zo = class e extends P {
	constructor() {
		super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
	}
	_parse(e) {
		if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== D.number) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.number,
				received: t.parsedType
			}), A;
		}
		let t, n = new _o();
		for (let r of this._def.checks) r.kind === "int" ? E.isInteger(e.data) || (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.invalid_type,
			expected: "integer",
			received: "float",
			message: r.message
		}), n.dirty()) : r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.too_small,
			minimum: r.value,
			type: "number",
			inclusive: r.inclusive,
			exact: !1,
			message: r.message
		}), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.too_big,
			maximum: r.value,
			type: "number",
			inclusive: r.inclusive,
			exact: !1,
			message: r.message
		}), n.dirty()) : r.kind === "multipleOf" ? Xo(e.data, r.value) !== 0 && (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.not_multiple_of,
			multipleOf: r.value,
			message: r.message
		}), n.dirty()) : r.kind === "finite" ? Number.isFinite(e.data) || (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.not_finite,
			message: r.message
		}), n.dirty()) : E.assertNever(r);
		return {
			status: n.value,
			value: e.data
		};
	}
	gte(e, t) {
		return this.setLimit("min", e, !0, M.toString(t));
	}
	gt(e, t) {
		return this.setLimit("min", e, !1, M.toString(t));
	}
	lte(e, t) {
		return this.setLimit("max", e, !0, M.toString(t));
	}
	lt(e, t) {
		return this.setLimit("max", e, !1, M.toString(t));
	}
	setLimit(t, n, r, i) {
		return new e({
			...this._def,
			checks: [...this._def.checks, {
				kind: t,
				value: n,
				inclusive: r,
				message: M.toString(i)
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
			message: M.toString(e)
		});
	}
	positive(e) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !1,
			message: M.toString(e)
		});
	}
	negative(e) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !1,
			message: M.toString(e)
		});
	}
	nonpositive(e) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !0,
			message: M.toString(e)
		});
	}
	nonnegative(e) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !0,
			message: M.toString(e)
		});
	}
	multipleOf(e, t) {
		return this._addCheck({
			kind: "multipleOf",
			value: e,
			message: M.toString(t)
		});
	}
	finite(e) {
		return this._addCheck({
			kind: "finite",
			message: M.toString(e)
		});
	}
	safe(e) {
		return this._addCheck({
			kind: "min",
			inclusive: !0,
			value: -(2 ** 53 - 1),
			message: M.toString(e)
		})._addCheck({
			kind: "max",
			inclusive: !0,
			value: 2 ** 53 - 1,
			message: M.toString(e)
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
		return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && E.isInteger(e.value));
	}
	get isFinite() {
		let e = null, t = null;
		for (let n of this._def.checks) if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf") return !0;
		else n.kind === "min" ? (t === null || n.value > t) && (t = n.value) : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
		return Number.isFinite(t) && Number.isFinite(e);
	}
};
Zo.create = (e) => new Zo({
	checks: [],
	typeName: F.ZodNumber,
	coerce: e?.coerce || !1,
	...N(e)
});
var Qo = class e extends P {
	constructor() {
		super(...arguments), this.min = this.gte, this.max = this.lte;
	}
	_parse(e) {
		if (this._def.coerce) try {
			e.data = BigInt(e.data);
		} catch {
			return this._getInvalidInput(e);
		}
		if (this._getType(e) !== D.bigint) return this._getInvalidInput(e);
		let t, n = new _o();
		for (let r of this._def.checks) r.kind === "min" ? (r.inclusive ? e.data < r.value : e.data <= r.value) && (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.too_small,
			type: "bigint",
			minimum: r.value,
			inclusive: r.inclusive,
			message: r.message
		}), n.dirty()) : r.kind === "max" ? (r.inclusive ? e.data > r.value : e.data >= r.value) && (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.too_big,
			type: "bigint",
			maximum: r.value,
			inclusive: r.inclusive,
			message: r.message
		}), n.dirty()) : r.kind === "multipleOf" ? e.data % r.value !== BigInt(0) && (t = this._getOrReturnCtx(e, t), k(t, {
			code: O.not_multiple_of,
			multipleOf: r.value,
			message: r.message
		}), n.dirty()) : E.assertNever(r);
		return {
			status: n.value,
			value: e.data
		};
	}
	_getInvalidInput(e) {
		let t = this._getOrReturnCtx(e);
		return k(t, {
			code: O.invalid_type,
			expected: D.bigint,
			received: t.parsedType
		}), A;
	}
	gte(e, t) {
		return this.setLimit("min", e, !0, M.toString(t));
	}
	gt(e, t) {
		return this.setLimit("min", e, !1, M.toString(t));
	}
	lte(e, t) {
		return this.setLimit("max", e, !0, M.toString(t));
	}
	lt(e, t) {
		return this.setLimit("max", e, !1, M.toString(t));
	}
	setLimit(t, n, r, i) {
		return new e({
			...this._def,
			checks: [...this._def.checks, {
				kind: t,
				value: n,
				inclusive: r,
				message: M.toString(i)
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
			message: M.toString(e)
		});
	}
	negative(e) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !1,
			message: M.toString(e)
		});
	}
	nonpositive(e) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !0,
			message: M.toString(e)
		});
	}
	nonnegative(e) {
		return this._addCheck({
			kind: "min",
			value: BigInt(0),
			inclusive: !0,
			message: M.toString(e)
		});
	}
	multipleOf(e, t) {
		return this._addCheck({
			kind: "multipleOf",
			value: e,
			message: M.toString(t)
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
Qo.create = (e) => new Qo({
	checks: [],
	typeName: F.ZodBigInt,
	coerce: e?.coerce ?? !1,
	...N(e)
});
var $o = class extends P {
	_parse(e) {
		if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== D.boolean) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.boolean,
				received: t.parsedType
			}), A;
		}
		return j(e.data);
	}
};
$o.create = (e) => new $o({
	typeName: F.ZodBoolean,
	coerce: e?.coerce || !1,
	...N(e)
});
var es = class e extends P {
	_parse(e) {
		if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== D.date) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.date,
				received: t.parsedType
			}), A;
		}
		if (Number.isNaN(e.data.getTime())) return k(this._getOrReturnCtx(e), { code: O.invalid_date }), A;
		let t = new _o(), n;
		for (let r of this._def.checks) r.kind === "min" ? e.data.getTime() < r.value && (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.too_small,
			message: r.message,
			inclusive: !0,
			exact: !1,
			minimum: r.value,
			type: "date"
		}), t.dirty()) : r.kind === "max" ? e.data.getTime() > r.value && (n = this._getOrReturnCtx(e, n), k(n, {
			code: O.too_big,
			message: r.message,
			inclusive: !0,
			exact: !1,
			maximum: r.value,
			type: "date"
		}), t.dirty()) : E.assertNever(r);
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
			message: M.toString(t)
		});
	}
	max(e, t) {
		return this._addCheck({
			kind: "max",
			value: e.getTime(),
			message: M.toString(t)
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
es.create = (e) => new es({
	checks: [],
	coerce: e?.coerce || !1,
	typeName: F.ZodDate,
	...N(e)
});
var ts = class extends P {
	_parse(e) {
		if (this._getType(e) !== D.symbol) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.symbol,
				received: t.parsedType
			}), A;
		}
		return j(e.data);
	}
};
ts.create = (e) => new ts({
	typeName: F.ZodSymbol,
	...N(e)
});
var ns = class extends P {
	_parse(e) {
		if (this._getType(e) !== D.undefined) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.undefined,
				received: t.parsedType
			}), A;
		}
		return j(e.data);
	}
};
ns.create = (e) => new ns({
	typeName: F.ZodUndefined,
	...N(e)
});
var rs = class extends P {
	_parse(e) {
		if (this._getType(e) !== D.null) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.null,
				received: t.parsedType
			}), A;
		}
		return j(e.data);
	}
};
rs.create = (e) => new rs({
	typeName: F.ZodNull,
	...N(e)
});
var is = class extends P {
	constructor() {
		super(...arguments), this._any = !0;
	}
	_parse(e) {
		return j(e.data);
	}
};
is.create = (e) => new is({
	typeName: F.ZodAny,
	...N(e)
});
var as = class extends P {
	constructor() {
		super(...arguments), this._unknown = !0;
	}
	_parse(e) {
		return j(e.data);
	}
};
as.create = (e) => new as({
	typeName: F.ZodUnknown,
	...N(e)
});
var os = class extends P {
	_parse(e) {
		let t = this._getOrReturnCtx(e);
		return k(t, {
			code: O.invalid_type,
			expected: D.never,
			received: t.parsedType
		}), A;
	}
};
os.create = (e) => new os({
	typeName: F.ZodNever,
	...N(e)
});
var ss = class extends P {
	_parse(e) {
		if (this._getType(e) !== D.undefined) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.void,
				received: t.parsedType
			}), A;
		}
		return j(e.data);
	}
};
ss.create = (e) => new ss({
	typeName: F.ZodVoid,
	...N(e)
});
var cs = class e extends P {
	_parse(e) {
		let { ctx: t, status: n } = this._processInputParams(e), r = this._def;
		if (t.parsedType !== D.array) return k(t, {
			code: O.invalid_type,
			expected: D.array,
			received: t.parsedType
		}), A;
		if (r.exactLength !== null) {
			let e = t.data.length > r.exactLength.value, i = t.data.length < r.exactLength.value;
			(e || i) && (k(t, {
				code: e ? O.too_big : O.too_small,
				minimum: i ? r.exactLength.value : void 0,
				maximum: e ? r.exactLength.value : void 0,
				type: "array",
				inclusive: !0,
				exact: !0,
				message: r.exactLength.message
			}), n.dirty());
		}
		if (r.minLength !== null && t.data.length < r.minLength.value && (k(t, {
			code: O.too_small,
			minimum: r.minLength.value,
			type: "array",
			inclusive: !0,
			exact: !1,
			message: r.minLength.message
		}), n.dirty()), r.maxLength !== null && t.data.length > r.maxLength.value && (k(t, {
			code: O.too_big,
			maximum: r.maxLength.value,
			type: "array",
			inclusive: !0,
			exact: !1,
			message: r.maxLength.message
		}), n.dirty()), t.common.async) return Promise.all([...t.data].map((e, n) => r.type._parseAsync(new Co(t, e, t.path, n)))).then((e) => _o.mergeArray(n, e));
		let i = [...t.data].map((e, n) => r.type._parseSync(new Co(t, e, t.path, n)));
		return _o.mergeArray(n, i);
	}
	get element() {
		return this._def.type;
	}
	min(t, n) {
		return new e({
			...this._def,
			minLength: {
				value: t,
				message: M.toString(n)
			}
		});
	}
	max(t, n) {
		return new e({
			...this._def,
			maxLength: {
				value: t,
				message: M.toString(n)
			}
		});
	}
	length(t, n) {
		return new e({
			...this._def,
			exactLength: {
				value: t,
				message: M.toString(n)
			}
		});
	}
	nonempty(e) {
		return this.min(1, e);
	}
};
cs.create = (e, t) => new cs({
	type: e,
	minLength: null,
	maxLength: null,
	exactLength: null,
	typeName: F.ZodArray,
	...N(t)
});
function ls(e) {
	if (e instanceof us) {
		let t = {};
		for (let n in e.shape) {
			let r = e.shape[n];
			t[n] = Os.create(ls(r));
		}
		return new us({
			...e._def,
			shape: () => t
		});
	}
	return e instanceof cs ? new cs({
		...e._def,
		type: ls(e.element)
	}) : e instanceof Os ? Os.create(ls(e.unwrap())) : e instanceof ks ? ks.create(ls(e.unwrap())) : e instanceof gs ? gs.create(e.items.map((e) => ls(e))) : e;
}
var us = class e extends P {
	constructor() {
		super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
	}
	_getCached() {
		if (this._cached !== null) return this._cached;
		let e = this._def.shape(), t = E.objectKeys(e);
		return this._cached = {
			shape: e,
			keys: t
		}, this._cached;
	}
	_parse(e) {
		if (this._getType(e) !== D.object) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.object,
				received: t.parsedType
			}), A;
		}
		let { status: t, ctx: n } = this._processInputParams(e), { shape: r, keys: i } = this._getCached(), a = [];
		if (!(this._def.catchall instanceof os && this._def.unknownKeys === "strip")) for (let e in n.data) i.includes(e) || a.push(e);
		let o = [];
		for (let e of i) {
			let t = r[e], i = n.data[e];
			o.push({
				key: {
					status: "valid",
					value: e
				},
				value: t._parse(new Co(n, i, n.path, e)),
				alwaysSet: e in n.data
			});
		}
		if (this._def.catchall instanceof os) {
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
			else if (e === "strict") a.length > 0 && (k(n, {
				code: O.unrecognized_keys,
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
					value: e._parse(new Co(n, r, n.path, t)),
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
		}).then((e) => _o.mergeObjectSync(t, e)) : _o.mergeObjectSync(t, o);
	}
	get shape() {
		return this._def.shape();
	}
	strict(t) {
		return M.errToObj, new e({
			...this._def,
			unknownKeys: "strict",
			...t === void 0 ? {} : { errorMap: (e, n) => {
				let r = this._def.errorMap?.(e, n).message ?? n.defaultError;
				return e.code === "unrecognized_keys" ? { message: M.errToObj(t).message ?? r } : { message: r };
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
			typeName: F.ZodObject
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
		for (let e of E.objectKeys(t)) t[e] && this.shape[e] && (n[e] = this.shape[e]);
		return new e({
			...this._def,
			shape: () => n
		});
	}
	omit(t) {
		let n = {};
		for (let e of E.objectKeys(this.shape)) t[e] || (n[e] = this.shape[e]);
		return new e({
			...this._def,
			shape: () => n
		});
	}
	deepPartial() {
		return ls(this);
	}
	partial(t) {
		let n = {};
		for (let e of E.objectKeys(this.shape)) {
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
		for (let e of E.objectKeys(this.shape)) if (t && !t[e]) n[e] = this.shape[e];
		else {
			let t = this.shape[e];
			for (; t instanceof Os;) t = t._def.innerType;
			n[e] = t;
		}
		return new e({
			...this._def,
			shape: () => n
		});
	}
	keyof() {
		return Cs(E.objectKeys(this.shape));
	}
};
us.create = (e, t) => new us({
	shape: () => e,
	unknownKeys: "strip",
	catchall: os.create(),
	typeName: F.ZodObject,
	...N(t)
}), us.strictCreate = (e, t) => new us({
	shape: () => e,
	unknownKeys: "strict",
	catchall: os.create(),
	typeName: F.ZodObject,
	...N(t)
}), us.lazycreate = (e, t) => new us({
	shape: e,
	unknownKeys: "strip",
	catchall: os.create(),
	typeName: F.ZodObject,
	...N(t)
});
var ds = class extends P {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = this._def.options;
		function r(e) {
			for (let t of e) if (t.result.status === "valid") return t.result;
			for (let n of e) if (n.result.status === "dirty") return t.common.issues.push(...n.ctx.common.issues), n.result;
			let n = e.map((e) => new fo(e.ctx.common.issues));
			return k(t, {
				code: O.invalid_union,
				unionErrors: n
			}), A;
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
			let i = r.map((e) => new fo(e));
			return k(t, {
				code: O.invalid_union,
				unionErrors: i
			}), A;
		}
	}
	get options() {
		return this._def.options;
	}
};
ds.create = (e, t) => new ds({
	options: e,
	typeName: F.ZodUnion,
	...N(t)
});
var fs = (e) => e instanceof xs ? fs(e.schema) : e instanceof Ds ? fs(e.innerType()) : e instanceof Ss ? [e.value] : e instanceof ws ? e.options : e instanceof Ts ? E.objectValues(e.enum) : e instanceof As ? fs(e._def.innerType) : e instanceof ns ? [void 0] : e instanceof rs ? [null] : e instanceof Os ? [void 0, ...fs(e.unwrap())] : e instanceof ks ? [null, ...fs(e.unwrap())] : e instanceof Ns || e instanceof Fs ? fs(e.unwrap()) : e instanceof js ? fs(e._def.innerType) : [], ps = class e extends P {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		if (t.parsedType !== D.object) return k(t, {
			code: O.invalid_type,
			expected: D.object,
			received: t.parsedType
		}), A;
		let n = this.discriminator, r = t.data[n], i = this.optionsMap.get(r);
		return i ? t.common.async ? i._parseAsync({
			data: t.data,
			path: t.path,
			parent: t
		}) : i._parseSync({
			data: t.data,
			path: t.path,
			parent: t
		}) : (k(t, {
			code: O.invalid_union_discriminator,
			options: Array.from(this.optionsMap.keys()),
			path: [n]
		}), A);
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
			let n = fs(e.shape[t]);
			if (!n.length) throw Error(`A discriminator value for key \`${t}\` could not be extracted from all schema options`);
			for (let r of n) {
				if (i.has(r)) throw Error(`Discriminator property ${String(t)} has duplicate value ${String(r)}`);
				i.set(r, e);
			}
		}
		return new e({
			typeName: F.ZodDiscriminatedUnion,
			discriminator: t,
			options: n,
			optionsMap: i,
			...N(r)
		});
	}
};
function ms(e, t) {
	let n = uo(e), r = uo(t);
	if (e === t) return {
		valid: !0,
		data: e
	};
	if (n === D.object && r === D.object) {
		let n = E.objectKeys(t), r = E.objectKeys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = ms(e[n], t[n]);
			if (!r.valid) return { valid: !1 };
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (n === D.array && r === D.array) {
		if (e.length !== t.length) return { valid: !1 };
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = ms(i, a);
			if (!o.valid) return { valid: !1 };
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return n === D.date && r === D.date && +e == +t ? {
		valid: !0,
		data: e
	} : { valid: !1 };
}
var hs = class extends P {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e), r = (e, r) => {
			if (yo(e) || yo(r)) return A;
			let i = ms(e.value, r.value);
			return i.valid ? ((bo(e) || bo(r)) && t.dirty(), {
				status: t.value,
				value: i.data
			}) : (k(n, { code: O.invalid_intersection_types }), A);
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
hs.create = (e, t, n) => new hs({
	left: e,
	right: t,
	typeName: F.ZodIntersection,
	...N(n)
});
var gs = class e extends P {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== D.array) return k(n, {
			code: O.invalid_type,
			expected: D.array,
			received: n.parsedType
		}), A;
		if (n.data.length < this._def.items.length) return k(n, {
			code: O.too_small,
			minimum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), A;
		!this._def.rest && n.data.length > this._def.items.length && (k(n, {
			code: O.too_big,
			maximum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), t.dirty());
		let r = [...n.data].map((e, t) => {
			let r = this._def.items[t] || this._def.rest;
			return r ? r._parse(new Co(n, e, n.path, t)) : null;
		}).filter((e) => !!e);
		return n.common.async ? Promise.all(r).then((e) => _o.mergeArray(t, e)) : _o.mergeArray(t, r);
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
gs.create = (e, t) => {
	if (!Array.isArray(e)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
	return new gs({
		items: e,
		typeName: F.ZodTuple,
		rest: null,
		...N(t)
	});
};
var _s = class e extends P {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== D.object) return k(n, {
			code: O.invalid_type,
			expected: D.object,
			received: n.parsedType
		}), A;
		let r = [], i = this._def.keyType, a = this._def.valueType;
		for (let e in n.data) r.push({
			key: i._parse(new Co(n, e, n.path, e)),
			value: a._parse(new Co(n, n.data[e], n.path, e)),
			alwaysSet: e in n.data
		});
		return n.common.async ? _o.mergeObjectAsync(t, r) : _o.mergeObjectSync(t, r);
	}
	get element() {
		return this._def.valueType;
	}
	static create(t, n, r) {
		return n instanceof P ? new e({
			keyType: t,
			valueType: n,
			typeName: F.ZodRecord,
			...N(r)
		}) : new e({
			keyType: Yo.create(),
			valueType: t,
			typeName: F.ZodRecord,
			...N(n)
		});
	}
}, vs = class extends P {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== D.map) return k(n, {
			code: O.invalid_type,
			expected: D.map,
			received: n.parsedType
		}), A;
		let r = this._def.keyType, i = this._def.valueType, a = [...n.data.entries()].map(([e, t], a) => ({
			key: r._parse(new Co(n, e, n.path, [a, "key"])),
			value: i._parse(new Co(n, t, n.path, [a, "value"]))
		}));
		if (n.common.async) {
			let e = /* @__PURE__ */ new Map();
			return Promise.resolve().then(async () => {
				for (let n of a) {
					let r = await n.key, i = await n.value;
					if (r.status === "aborted" || i.status === "aborted") return A;
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
				if (r.status === "aborted" || i.status === "aborted") return A;
				(r.status === "dirty" || i.status === "dirty") && t.dirty(), e.set(r.value, i.value);
			}
			return {
				status: t.value,
				value: e
			};
		}
	}
};
vs.create = (e, t, n) => new vs({
	valueType: t,
	keyType: e,
	typeName: F.ZodMap,
	...N(n)
});
var ys = class e extends P {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.parsedType !== D.set) return k(n, {
			code: O.invalid_type,
			expected: D.set,
			received: n.parsedType
		}), A;
		let r = this._def;
		r.minSize !== null && n.data.size < r.minSize.value && (k(n, {
			code: O.too_small,
			minimum: r.minSize.value,
			type: "set",
			inclusive: !0,
			exact: !1,
			message: r.minSize.message
		}), t.dirty()), r.maxSize !== null && n.data.size > r.maxSize.value && (k(n, {
			code: O.too_big,
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
				if (r.status === "aborted") return A;
				r.status === "dirty" && t.dirty(), n.add(r.value);
			}
			return {
				status: t.value,
				value: n
			};
		}
		let o = [...n.data.values()].map((e, t) => i._parse(new Co(n, e, n.path, t)));
		return n.common.async ? Promise.all(o).then((e) => a(e)) : a(o);
	}
	min(t, n) {
		return new e({
			...this._def,
			minSize: {
				value: t,
				message: M.toString(n)
			}
		});
	}
	max(t, n) {
		return new e({
			...this._def,
			maxSize: {
				value: t,
				message: M.toString(n)
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
ys.create = (e, t) => new ys({
	valueType: e,
	minSize: null,
	maxSize: null,
	typeName: F.ZodSet,
	...N(t)
});
var bs = class e extends P {
	constructor() {
		super(...arguments), this.validate = this.implement;
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		if (t.parsedType !== D.function) return k(t, {
			code: O.invalid_type,
			expected: D.function,
			received: t.parsedType
		}), A;
		function n(e, n) {
			return go({
				data: e,
				path: t.path,
				errorMaps: [
					t.common.contextualErrorMap,
					t.schemaErrorMap,
					ho(),
					po
				].filter((e) => !!e),
				issueData: {
					code: O.invalid_arguments,
					argumentsError: n
				}
			});
		}
		function r(e, n) {
			return go({
				data: e,
				path: t.path,
				errorMaps: [
					t.common.contextualErrorMap,
					t.schemaErrorMap,
					ho(),
					po
				].filter((e) => !!e),
				issueData: {
					code: O.invalid_return_type,
					returnTypeError: n
				}
			});
		}
		let i = { errorMap: t.common.contextualErrorMap }, a = t.data;
		if (this._def.returns instanceof Es) {
			let e = this;
			return j(async function(...t) {
				let o = new fo([]), s = await e._def.args.parseAsync(t, i).catch((e) => {
					throw o.addIssue(n(t, e)), o;
				}), c = await Reflect.apply(a, this, s);
				return await e._def.returns._def.type.parseAsync(c, i).catch((e) => {
					throw o.addIssue(r(c, e)), o;
				});
			});
		}
		{
			let e = this;
			return j(function(...t) {
				let o = e._def.args.safeParse(t, i);
				if (!o.success) throw new fo([n(t, o.error)]);
				let s = Reflect.apply(a, this, o.data), c = e._def.returns.safeParse(s, i);
				if (!c.success) throw new fo([r(s, c.error)]);
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
			args: gs.create(t).rest(as.create())
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
			args: t || gs.create([]).rest(as.create()),
			returns: n || as.create(),
			typeName: F.ZodFunction,
			...N(r)
		});
	}
}, xs = class extends P {
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
xs.create = (e, t) => new xs({
	getter: e,
	typeName: F.ZodLazy,
	...N(t)
});
var Ss = class extends P {
	_parse(e) {
		if (e.data !== this._def.value) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				received: t.data,
				code: O.invalid_literal,
				expected: this._def.value
			}), A;
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
Ss.create = (e, t) => new Ss({
	value: e,
	typeName: F.ZodLiteral,
	...N(t)
});
function Cs(e, t) {
	return new ws({
		values: e,
		typeName: F.ZodEnum,
		...N(t)
	});
}
var ws = class e extends P {
	_parse(e) {
		if (typeof e.data != "string") {
			let t = this._getOrReturnCtx(e), n = this._def.values;
			return k(t, {
				expected: E.joinValues(n),
				received: t.parsedType,
				code: O.invalid_type
			}), A;
		}
		if (this._cache ||= new Set(this._def.values), !this._cache.has(e.data)) {
			let t = this._getOrReturnCtx(e), n = this._def.values;
			return k(t, {
				received: t.data,
				code: O.invalid_enum_value,
				options: n
			}), A;
		}
		return j(e.data);
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
ws.create = Cs;
var Ts = class extends P {
	_parse(e) {
		let t = E.getValidEnumValues(this._def.values), n = this._getOrReturnCtx(e);
		if (n.parsedType !== D.string && n.parsedType !== D.number) {
			let e = E.objectValues(t);
			return k(n, {
				expected: E.joinValues(e),
				received: n.parsedType,
				code: O.invalid_type
			}), A;
		}
		if (this._cache ||= new Set(E.getValidEnumValues(this._def.values)), !this._cache.has(e.data)) {
			let e = E.objectValues(t);
			return k(n, {
				received: n.data,
				code: O.invalid_enum_value,
				options: e
			}), A;
		}
		return j(e.data);
	}
	get enum() {
		return this._def.values;
	}
};
Ts.create = (e, t) => new Ts({
	values: e,
	typeName: F.ZodNativeEnum,
	...N(t)
});
var Es = class extends P {
	unwrap() {
		return this._def.type;
	}
	_parse(e) {
		let { ctx: t } = this._processInputParams(e);
		return t.parsedType !== D.promise && t.common.async === !1 ? (k(t, {
			code: O.invalid_type,
			expected: D.promise,
			received: t.parsedType
		}), A) : j((t.parsedType === D.promise ? t.data : Promise.resolve(t.data)).then((e) => this._def.type.parseAsync(e, {
			path: t.path,
			errorMap: t.common.contextualErrorMap
		})));
	}
};
Es.create = (e, t) => new Es({
	type: e,
	typeName: F.ZodPromise,
	...N(t)
});
var Ds = class extends P {
	innerType() {
		return this._def.schema;
	}
	sourceType() {
		return this._def.schema._def.typeName === F.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
	}
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e), r = this._def.effect || null, i = {
			addIssue: (e) => {
				k(n, e), e.fatal ? t.abort() : t.dirty();
			},
			get path() {
				return n.path;
			}
		};
		if (i.addIssue = i.addIssue.bind(i), r.type === "preprocess") {
			let e = r.transform(n.data, i);
			if (n.common.async) return Promise.resolve(e).then(async (e) => {
				if (t.value === "aborted") return A;
				let r = await this._def.schema._parseAsync({
					data: e,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? A : r.status === "dirty" || t.value === "dirty" ? vo(r.value) : r;
			});
			{
				if (t.value === "aborted") return A;
				let r = this._def.schema._parseSync({
					data: e,
					path: n.path,
					parent: n
				});
				return r.status === "aborted" ? A : r.status === "dirty" || t.value === "dirty" ? vo(r.value) : r;
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
				return r.status === "aborted" ? A : (r.status === "dirty" && t.dirty(), e(r.value), {
					status: t.value,
					value: r.value
				});
			}
			return this._def.schema._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			}).then((n) => n.status === "aborted" ? A : (n.status === "dirty" && t.dirty(), e(n.value).then(() => ({
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
				if (!xo(e)) return A;
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
			}).then((e) => xo(e) ? Promise.resolve(r.transform(e.value, i)).then((e) => ({
				status: t.value,
				value: e
			})) : A);
		}
		E.assertNever(r);
	}
};
Ds.create = (e, t, n) => new Ds({
	schema: e,
	typeName: F.ZodEffects,
	effect: t,
	...N(n)
}), Ds.createWithPreprocess = (e, t, n) => new Ds({
	schema: t,
	effect: {
		type: "preprocess",
		transform: e
	},
	typeName: F.ZodEffects,
	...N(n)
});
var Os = class extends P {
	_parse(e) {
		return this._getType(e) === D.undefined ? j(void 0) : this._def.innerType._parse(e);
	}
	unwrap() {
		return this._def.innerType;
	}
};
Os.create = (e, t) => new Os({
	innerType: e,
	typeName: F.ZodOptional,
	...N(t)
});
var ks = class extends P {
	_parse(e) {
		return this._getType(e) === D.null ? j(null) : this._def.innerType._parse(e);
	}
	unwrap() {
		return this._def.innerType;
	}
};
ks.create = (e, t) => new ks({
	innerType: e,
	typeName: F.ZodNullable,
	...N(t)
});
var As = class extends P {
	_parse(e) {
		let { ctx: t } = this._processInputParams(e), n = t.data;
		return t.parsedType === D.undefined && (n = this._def.defaultValue()), this._def.innerType._parse({
			data: n,
			path: t.path,
			parent: t
		});
	}
	removeDefault() {
		return this._def.innerType;
	}
};
As.create = (e, t) => new As({
	innerType: e,
	typeName: F.ZodDefault,
	defaultValue: typeof t.default == "function" ? t.default : () => t.default,
	...N(t)
});
var js = class extends P {
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
		return So(r) ? r.then((e) => ({
			status: "valid",
			value: e.status === "valid" ? e.value : this._def.catchValue({
				get error() {
					return new fo(n.common.issues);
				},
				input: n.data
			})
		})) : {
			status: "valid",
			value: r.status === "valid" ? r.value : this._def.catchValue({
				get error() {
					return new fo(n.common.issues);
				},
				input: n.data
			})
		};
	}
	removeCatch() {
		return this._def.innerType;
	}
};
js.create = (e, t) => new js({
	innerType: e,
	typeName: F.ZodCatch,
	catchValue: typeof t.catch == "function" ? t.catch : () => t.catch,
	...N(t)
});
var Ms = class extends P {
	_parse(e) {
		if (this._getType(e) !== D.nan) {
			let t = this._getOrReturnCtx(e);
			return k(t, {
				code: O.invalid_type,
				expected: D.nan,
				received: t.parsedType
			}), A;
		}
		return {
			status: "valid",
			value: e.data
		};
	}
};
Ms.create = (e) => new Ms({
	typeName: F.ZodNaN,
	...N(e)
});
var Ns = class extends P {
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
}, Ps = class e extends P {
	_parse(e) {
		let { status: t, ctx: n } = this._processInputParams(e);
		if (n.common.async) return (async () => {
			let e = await this._def.in._parseAsync({
				data: n.data,
				path: n.path,
				parent: n
			});
			return e.status === "aborted" ? A : e.status === "dirty" ? (t.dirty(), vo(e.value)) : this._def.out._parseAsync({
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
			return e.status === "aborted" ? A : e.status === "dirty" ? (t.dirty(), {
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
			typeName: F.ZodPipeline
		});
	}
}, Fs = class extends P {
	_parse(e) {
		let t = this._def.innerType._parse(e), n = (e) => (xo(e) && (e.value = Object.freeze(e.value)), e);
		return So(t) ? t.then((e) => n(e)) : n(t);
	}
	unwrap() {
		return this._def.innerType;
	}
};
Fs.create = (e, t) => new Fs({
	innerType: e,
	typeName: F.ZodReadonly,
	...N(t)
});
function Is(e, t) {
	let n = typeof e == "function" ? e(t) : typeof e == "string" ? { message: e } : e;
	return typeof n == "string" ? { message: n } : n;
}
function Ls(e, t = {}, n) {
	return e ? is.create().superRefine((r, i) => {
		let a = e(r);
		if (a instanceof Promise) return a.then((e) => {
			if (!e) {
				let e = Is(t, r), a = e.fatal ?? n ?? !0;
				i.addIssue({
					code: "custom",
					...e,
					fatal: a
				});
			}
		});
		if (!a) {
			let e = Is(t, r), a = e.fatal ?? n ?? !0;
			i.addIssue({
				code: "custom",
				...e,
				fatal: a
			});
		}
	}) : is.create();
}
us.lazycreate;
var F;
(function(e) {
	e.ZodString = "ZodString", e.ZodNumber = "ZodNumber", e.ZodNaN = "ZodNaN", e.ZodBigInt = "ZodBigInt", e.ZodBoolean = "ZodBoolean", e.ZodDate = "ZodDate", e.ZodSymbol = "ZodSymbol", e.ZodUndefined = "ZodUndefined", e.ZodNull = "ZodNull", e.ZodAny = "ZodAny", e.ZodUnknown = "ZodUnknown", e.ZodNever = "ZodNever", e.ZodVoid = "ZodVoid", e.ZodArray = "ZodArray", e.ZodObject = "ZodObject", e.ZodUnion = "ZodUnion", e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", e.ZodIntersection = "ZodIntersection", e.ZodTuple = "ZodTuple", e.ZodRecord = "ZodRecord", e.ZodMap = "ZodMap", e.ZodSet = "ZodSet", e.ZodFunction = "ZodFunction", e.ZodLazy = "ZodLazy", e.ZodLiteral = "ZodLiteral", e.ZodEnum = "ZodEnum", e.ZodEffects = "ZodEffects", e.ZodNativeEnum = "ZodNativeEnum", e.ZodOptional = "ZodOptional", e.ZodNullable = "ZodNullable", e.ZodDefault = "ZodDefault", e.ZodCatch = "ZodCatch", e.ZodPromise = "ZodPromise", e.ZodBranded = "ZodBranded", e.ZodPipeline = "ZodPipeline", e.ZodReadonly = "ZodReadonly";
})(F ||= {});
var Rs = (e, t = { message: `Input not instance of ${e.name}` }) => Ls((t) => t instanceof e, t), I = Yo.create, L = Zo.create;
Ms.create, Qo.create;
var zs = $o.create;
es.create, ts.create, ns.create, rs.create, is.create;
var Bs = as.create;
os.create, ss.create;
var Vs = cs.create, R = us.create;
us.strictCreate;
var Hs = ds.create, Us = ps.create, Ws = hs.create;
gs.create;
var Gs = _s.create;
vs.create, ys.create, bs.create, xs.create;
var z = Ss.create, Ks = ws.create;
Ts.create, Es.create, Ds.create, Os.create, ks.create, Ds.createWithPreprocess, Ps.create;
var qs = A, Js = co(), Ys = (e, t) => t.safeParse(e).success;
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bytes.js
function Xs(e, t) {
	if (e === t) return !0;
	if (e.byteLength !== t.byteLength) return !1;
	for (let n = 0; n < e.byteLength; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function Zs(e) {
	if (e instanceof Uint8Array && e.constructor.name === "Uint8Array") return e;
	if (e instanceof ArrayBuffer) return new Uint8Array(e);
	if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
	throw Error("Unknown type, must be binary type");
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/vendor/base-x.js
function Qs(e, t) {
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
var $s = Qs, ec = class {
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
}, tc = class {
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
		return rc(this, e);
	}
}, nc = class {
	decoders;
	constructor(e) {
		this.decoders = e;
	}
	or(e) {
		return rc(this, e);
	}
	decode(e) {
		let t = e[0], n = this.decoders[t];
		if (n != null) return n.decode(e);
		throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
	}
};
function rc(e, t) {
	return new nc({
		...e.decoders ?? { [e.prefix]: e },
		...t.decoders ?? { [t.prefix]: t }
	});
}
var ic = class {
	name;
	prefix;
	baseEncode;
	baseDecode;
	encoder;
	decoder;
	constructor(e, t, n, r) {
		this.name = e, this.prefix = t, this.baseEncode = n, this.baseDecode = r, this.encoder = new ec(e, t, n), this.decoder = new tc(e, t, r);
	}
	encode(e) {
		return this.encoder.encode(e);
	}
	decode(e) {
		return this.decoder.decode(e);
	}
};
function ac({ name: e, prefix: t, encode: n, decode: r }) {
	return new ic(e, t, n, r);
}
function oc({ name: e, prefix: t, alphabet: n }) {
	let { encode: r, decode: i } = $s(n, e);
	return ac({
		prefix: t,
		name: e,
		encode: r,
		decode: (e) => Zs(i(e))
	});
}
function sc(e, t, n, r) {
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
function cc(e, t, n) {
	let r = t[t.length - 1] === "=", i = (1 << n) - 1, a = "", o = 0, s = 0;
	for (let r = 0; r < e.length; ++r) for (s = s << 8 | e[r], o += 8; o > n;) o -= n, a += t[i & s >> o];
	if (o !== 0 && (a += t[i & s << n - o]), r) for (; a.length * n & 7;) a += "=";
	return a;
}
function lc(e) {
	let t = {};
	for (let n = 0; n < e.length; ++n) t[e[n]] = n;
	return t;
}
function uc({ name: e, prefix: t, bitsPerChar: n, alphabet: r }) {
	let i = lc(r);
	return ac({
		prefix: t,
		name: e,
		encode(e) {
			return cc(e, r, n);
		},
		decode(t) {
			return sc(t, i, n, e);
		}
	});
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base32.js
var dc = uc({
	prefix: "b",
	name: "base32",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567",
	bitsPerChar: 5
});
uc({
	prefix: "B",
	name: "base32upper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
	bitsPerChar: 5
}), uc({
	prefix: "c",
	name: "base32pad",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
	bitsPerChar: 5
}), uc({
	prefix: "C",
	name: "base32padupper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
	bitsPerChar: 5
}), uc({
	prefix: "v",
	name: "base32hex",
	alphabet: "0123456789abcdefghijklmnopqrstuv",
	bitsPerChar: 5
}), uc({
	prefix: "V",
	name: "base32hexupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
	bitsPerChar: 5
}), uc({
	prefix: "t",
	name: "base32hexpad",
	alphabet: "0123456789abcdefghijklmnopqrstuv=",
	bitsPerChar: 5
}), uc({
	prefix: "T",
	name: "base32hexpadupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
	bitsPerChar: 5
}), uc({
	prefix: "h",
	name: "base32z",
	alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
	bitsPerChar: 5
});
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base36.js
var fc = oc({
	prefix: "k",
	name: "base36",
	alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
oc({
	prefix: "K",
	name: "base36upper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/bases/base58.js
var pc = oc({
	name: "base58btc",
	prefix: "z",
	alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
oc({
	name: "base58flickr",
	prefix: "Z",
	alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/vendor/varint.js
var mc = vc, hc = 128, gc = -128, _c = 2 ** 31;
function vc(e, t, n) {
	t ||= [], n ||= 0;
	for (var r = n; e >= _c;) t[n++] = e & 255 | hc, e /= 128;
	for (; e & gc;) t[n++] = e & 255 | hc, e >>>= 7;
	return t[n] = e | 0, vc.bytes = n - r + 1, t;
}
var yc = Sc, bc = 128, xc = 127;
function Sc(e, t) {
	var n = 0, t = t || 0, r = 0, i = t, a, o = e.length;
	do {
		if (i >= o) throw Sc.bytes = 0, RangeError("Could not decode varint");
		a = e[i++], n += r < 28 ? (a & xc) << r : (a & xc) * 2 ** r, r += 7;
	} while (a >= bc);
	return Sc.bytes = i - t, n;
}
var Cc = 128, wc = 2 ** 14, Tc = 2 ** 21, Ec = 2 ** 28, Dc = 2 ** 35, Oc = 2 ** 42, kc = 2 ** 49, Ac = 2 ** 56, jc = 2 ** 63, Mc = {
	encode: mc,
	decode: yc,
	encodingLength: function(e) {
		return e < Cc ? 1 : e < wc ? 2 : e < Tc ? 3 : e < Ec ? 4 : e < Dc ? 5 : e < Oc ? 6 : e < kc ? 7 : e < Ac ? 8 : e < jc ? 9 : 10;
	}
};
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/varint.js
function Nc(e, t = 0) {
	return [Mc.decode(e, t), Mc.decode.bytes];
}
function Pc(e, t, n = 0) {
	return Mc.encode(e, t, n), t;
}
function Fc(e) {
	return Mc.encodingLength(e);
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/hashes/digest.js
function Ic(e, t) {
	let n = t.byteLength, r = Fc(e), i = r + Fc(n), a = new Uint8Array(i + n);
	return Pc(e, a, 0), Pc(n, a, r), a.set(t, i), new zc(e, n, t, a);
}
function Lc(e) {
	let t = Zs(e), [n, r] = Nc(t), [i, a] = Nc(t.subarray(r)), o = t.subarray(r + a);
	if (o.byteLength !== i) throw Error("Incorrect length");
	return new zc(n, i, o, t);
}
function Rc(e, t) {
	if (e === t) return !0;
	{
		let n = t;
		return e.code === n.code && e.size === n.size && n.bytes instanceof Uint8Array && Xs(e.bytes, n.bytes);
	}
}
var zc = class {
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
function Bc(e, t) {
	let { bytes: n, version: r } = e;
	switch (r) {
		case 0: return Gc(n, Hc(e), t ?? pc.encoder);
		default: return Kc(n, Hc(e), t ?? dc.encoder);
	}
}
var Vc = /* @__PURE__ */ new WeakMap();
function Hc(e) {
	let t = Vc.get(e);
	if (t == null) {
		let t = /* @__PURE__ */ new Map();
		return Vc.set(e, t), t;
	}
	return t;
}
var Uc = class e {
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
				if (t !== qc) throw Error("Cannot convert a non dag-pb CID to CIDv0");
				if (n.code !== Jc) throw Error("Cannot convert non sha2-256 multihash CID to CIDv0");
				return e.createV0(n);
			}
			default: throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
		}
	}
	toV1() {
		switch (this.version) {
			case 0: {
				let { code: t, digest: n } = this.multihash, r = Ic(t, n);
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
		return n != null && e.code === n.code && e.version === n.version && Rc(e.multihash, n.multihash);
	}
	toString(e) {
		return Bc(this, e);
	}
	toJSON() {
		return { "/": Bc(this) };
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
			return new e(t, r, i, a ?? Yc(t, r, i.bytes));
		}
		if (n[Xc] === !0) {
			let { version: t, multihash: r, code: i } = n, a = Lc(r);
			return e.create(t, i, a);
		}
		return null;
	}
	static create(t, n, r) {
		if (typeof n != "number") throw Error("String codecs are no longer supported");
		if (!(r.bytes instanceof Uint8Array)) throw Error("Invalid digest");
		switch (t) {
			case 0:
				if (n !== qc) throw Error(`Version 0 CID must use dag-pb (code: ${qc}) block encoding`);
				return new e(t, n, r, r.bytes);
			case 1: {
				let i = Yc(t, n, r.bytes);
				return new e(t, n, r, i);
			}
			default: throw Error("Invalid version");
		}
	}
	static createV0(t) {
		return e.create(0, qc, t);
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
		let n = e.inspectBytes(t), r = n.size - n.multihashSize, i = Zs(t.subarray(r, r + n.multihashSize));
		if (i.byteLength !== n.multihashSize) throw Error("Incorrect length");
		let a = i.subarray(n.multihashSize - n.digestSize), o = new zc(n.multihashCode, n.digestSize, a, i);
		return [n.version === 0 ? e.createV0(o) : e.createV1(n.codec, o), t.subarray(n.size)];
	}
	static inspectBytes(e) {
		let t = 0, n = () => {
			let [n, r] = Nc(e.subarray(t));
			return t += r, n;
		}, r = n(), i = qc;
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
		let [r, i] = Wc(t, n), a = e.decode(i);
		if (a.version === 0 && t[0] !== "Q") throw Error("Version 0 CID string must not include multibase prefix");
		return Hc(a).set(r, t), a;
	}
};
function Wc(e, t) {
	switch (e[0]) {
		case "Q": {
			let n = t ?? pc;
			return [pc.prefix, n.decode(`${pc.prefix}${e}`)];
		}
		case pc.prefix: {
			let n = t ?? pc;
			return [pc.prefix, n.decode(e)];
		}
		case dc.prefix: {
			let n = t ?? dc;
			return [dc.prefix, n.decode(e)];
		}
		case fc.prefix: {
			let n = t ?? fc;
			return [fc.prefix, n.decode(e)];
		}
		default:
			if (t == null) throw Error("To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided");
			return [e[0], t.decode(e)];
	}
}
function Gc(e, t, n) {
	let { prefix: r } = n;
	if (r !== pc.prefix) throw Error(`Cannot string encode V0 in ${n.name} encoding`);
	let i = t.get(r);
	if (i == null) {
		let i = n.encode(e).slice(1);
		return t.set(r, i), i;
	}
	return i;
}
function Kc(e, t, n) {
	let { prefix: r } = n, i = t.get(r);
	if (i == null) {
		let i = n.encode(e);
		return t.set(r, i), i;
	}
	return i;
}
var qc = 112, Jc = 18;
function Yc(e, t, n) {
	let r = Fc(e), i = r + Fc(t), a = new Uint8Array(i + n.byteLength);
	return Pc(e, a, 0), Pc(t, a, r), a.set(n, i), a;
}
var Xc = Symbol.for("@ipld/js-cid/CID"), Zc = 20;
function Qc({ name: e, code: t, encode: n, minDigestLength: r, maxDigestLength: i }) {
	return new $c(e, t, n, r, i);
}
var $c = class {
	name;
	code;
	encode;
	minDigestLength;
	maxDigestLength;
	constructor(e, t, n, r, i) {
		this.name = e, this.code = t, this.encode = n, this.minDigestLength = r ?? Zc, this.maxDigestLength = i;
	}
	digest(e, t) {
		if (t?.truncate != null) {
			if (t.truncate < this.minDigestLength) throw Error(`Invalid truncate option, must be greater than or equal to ${this.minDigestLength}`);
			if (this.maxDigestLength != null && t.truncate > this.maxDigestLength) throw Error(`Invalid truncate option, must be less than or equal to ${this.maxDigestLength}`);
		}
		if (e instanceof Uint8Array) {
			let n = this.encode(e);
			return n instanceof Uint8Array ? el(n, this.code, t?.truncate) : n.then((e) => el(e, this.code, t?.truncate));
		}
		throw Error("Unknown type, must be binary type");
	}
};
function el(e, t, n) {
	if (n != null && n !== e.byteLength) {
		if (n > e.byteLength) throw Error(`Invalid truncate option, must be less than or equal to ${e.byteLength}`);
		e = e.subarray(0, n);
	}
	return Ic(t, e);
}
//#endregion
//#region node_modules/@atproto/lex-data/node_modules/multiformats/dist/src/hashes/sha2-browser.js
function tl(e) {
	return async (t) => new Uint8Array(await crypto.subtle.digest(e, t));
}
var nl = Qc({
	name: "sha2-256",
	code: 18,
	encode: tl("SHA-256")
}), rl = Qc({
	name: "sha2-512",
	code: 19,
	encode: tl("SHA-512")
});
//#endregion
//#region node_modules/@atproto/lex-data/dist/lib/util.js
function il(e) {
	return Number.isInteger(e) && e >= 0 && e < 256;
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/object.js
function al(e) {
	return typeof e == "object" && !!e;
}
var ol = Object.prototype, sl = Object.prototype.toString;
function cl(e) {
	return al(e) && ll(e);
}
function ll(e) {
	let t = Object.getPrototypeOf(e);
	return t === null || (t === ol || Object.getPrototypeOf(t) === null) && sl.call(e) === "[object Object]";
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/lib/nodejs-buffer.js
var ul = "Bu" + "f".repeat(2) + "er", dl = globalThis?.[ul]?.prototype instanceof Uint8Array && "byteLength" in globalThis[ul] ? globalThis[ul] : /* v8 ignore next -- @preserve */ null, fl = uc({
	prefix: "m",
	name: "base64",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	bitsPerChar: 6
}), pl = uc({
	prefix: "M",
	name: "base64pad",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	bitsPerChar: 6
}), ml = uc({
	prefix: "u",
	name: "base64url",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
	bitsPerChar: 6
}), hl = uc({
	prefix: "U",
	name: "base64urlpad",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
	bitsPerChar: 6
}), gl = dl, _l = typeof Uint8Array.fromBase64 == "function" ? function(e, t = "base64") {
	return Uint8Array.fromBase64(e, {
		alphabet: t,
		lastChunkHandling: "loose"
	});
} : /* v8 ignore next -- @preserve */ null, vl = gl ? function(e, t = "base64") {
	let n = gl.from(e, t);
	return bl(e, n), new Uint8Array(n.buffer, n.byteOffset, n.byteLength);
} : /* v8 ignore next -- @preserve */ null;
function yl(e, t = "base64") {
	let n = e.endsWith("="), r = t === "base64url" ? n ? hl : ml : n ? pl : fl, i = r.decoder.decode(`${r.prefix}${e}`);
	return bl(e, i), i;
}
function bl(e, t) {
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
var xl = dl, Sl = typeof Uint8Array.prototype.toBase64 == "function" ? function(e, t = "base64") {
	return e.toBase64({
		alphabet: t,
		omitPadding: !0
	});
} : /* v8 ignore next -- @preserve */ null, Cl = xl ? function(e, t = "base64") {
	let n = (e instanceof xl ? e : xl.from(e)).toString(t);
	return n.charCodeAt(n.length - 1) === 61 ? n.charCodeAt(n.length - 2) === 61 ? n.slice(0, -2) : n.slice(0, -1) : n;
} : /* v8 ignore next -- @preserve */ null;
function wl(e, t = "base64") {
	let n = t === "base64url" ? ml : fl;
	return n.encoder.encode(e).slice(n.prefix.length);
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/uint8array.js
var Tl = Sl ?? Cl ?? wl, El = _l ?? vl ?? yl;
function Dl(e, t) {
	if (e.byteLength !== t.byteLength) return !1;
	for (let n = 0; n < e.byteLength; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
var Ol = nl.code;
rl.code;
function kl(e) {
	return e.version === 1 && e.code === 85;
}
function Al(e) {
	return e.version === 1 && (e.code === 85 || e.code === 113) && e.multihash.code === Ol && e.multihash.digest.byteLength === 32;
}
function jl(e) {
	return e.code === 113 && Al(e);
}
function Ml(e, t) {
	switch (t?.flavor) {
		case void 0: return !0;
		case "cbor": return jl(e);
		case "dasl": return Al(e);
		case "raw": return kl(e);
		default: throw TypeError(`Unknown CID flavor: ${t?.flavor}`);
	}
}
function Nl(e, t) {
	return Ll(e) && Ml(e, t);
}
function Pl(e, t) {
	return Nl(e, t) ? e : null;
}
function Fl(e, t) {
	if (Nl(e, t)) return e;
	throw Error(`Invalid ${t?.flavor ? `${t.flavor} CID` : "CID"} "${e}"`);
}
function Il(e, t) {
	return Fl(Uc.parse(e), t);
}
function Ll(e) {
	if (Uc.asCID(e)) return e.bytes != null;
	try {
		if (!al(e)) return !1;
		let t = e;
		if (t.version !== 0 && t.version !== 1 || !il(t.code) || !al(t.multihash)) return !1;
		let n = t.multihash;
		return !(!il(n.code) || !(n.digest instanceof Uint8Array) || !(t.bytes instanceof Uint8Array) || t.bytes[0] !== t.version || t.bytes[1] !== t.code || t.bytes[2] !== n.code || t.bytes[3] !== n.digest.length || t.bytes.length !== 4 + n.digest.length || !Dl(t.bytes.subarray(4), n.digest) || typeof t.equals != "function" || t.equals(t) !== !0);
	} catch {
		return !1;
	}
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/blob.js
var Rl = { flavor: "raw" }, zl = Number.isSafeInteger;
function Bl(e, t) {
	if (!cl(e) || e?.$type !== "blob") return !1;
	let { mimeType: n, size: r, ref: i } = e;
	if (typeof n != "string" || !n.includes("/") || (r !== -1 || t?.strict !== !1) && (!zl(r) || r < 0) || typeof i != "object" || !i) return !1;
	for (let t in e) if (t !== "$type" && t !== "mimeType" && t !== "ref" && t !== "size") return !1;
	return !!Pl(i, t?.strict === !1 ? void 0 : Rl);
}
//#endregion
//#region node_modules/unicode-segmenter/core.js
function Vl(e, t = "") {
	let n = [], r = e.split(",").map((e) => e ? parseInt(e, 36) : 0), i = 0;
	for (let e = 0; e < r.length; e++) e % 2 ? n.push([
		i,
		i + r[e],
		t ? parseInt(t[e >> 1], 36) : 0
	]) : i = r[e];
	return n;
}
function Hl(e, t, n = 0, r = t.length - 1) {
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
var Ul = Vl(",9,a,,b,1,d,,e,h,3j,w,4p,,4t,,4u,,lc,33,w3,6,13l,18,14v,,14x,1,150,1,153,,16o,5,174,a,17g,,18r,k,19s,,1cm,6,1ct,,1cv,5,1d3,1,1d6,3,1e7,,1e9,,1f4,q,1ie,a,1kb,8,1kt,,1li,3,1ln,8,1lx,2,1m1,4,1nd,2,1ow,1,1p3,8,1qi,n,1r6,,1r7,v,1s3,,1tm,,1tn,,1to,,1tq,2,1tt,7,1u1,3,1u5,,1u6,1,1u9,6,1uq,1,1vl,,1vm,1,1x8,,1xa,,1xb,1,1xd,3,1xj,1,1xn,1,1xp,,1xz,,1ya,1,1z2,,1z5,1,1z7,,20s,,20u,2,20x,1,213,1,217,2,21d,,228,1,22d,,22p,1,22r,,24c,,24e,2,24h,4,24n,1,24p,,24r,1,24t,,25e,1,262,5,269,,26a,1,27w,,27y,1,280,,281,3,287,1,28b,1,28d,,28l,2,28y,1,29u,,2bi,,2bj,,2bk,,2bl,1,2bq,2,2bu,2,2bx,,2c7,,2dc,,2dd,2,2dg,,2f0,,2f2,2,2f5,3,2fa,2,2fe,3,2fp,1,2g2,1,2gx,,2gy,1,2ik,,2im,,2in,1,2ip,,2iq,,2ir,1,2iu,2,2iy,3,2j9,1,2jm,1,2k3,,2kg,1,2ki,1,2m3,1,2m6,,2m7,1,2m9,3,2me,2,2mi,2,2ml,,2mm,,2mv,,2n6,1,2o1,,2o2,1,2q2,,2q7,,2q8,1,2qa,2,2qe,,2qg,6,2qn,,2r6,1,2sx,,2sz,,2t0,6,2tj,7,2wh,,2wj,,2wk,8,2x4,6,2zc,1,305,,307,,309,,30e,1,31t,d,327,,328,4,32e,1,32l,a,32x,z,346,,371,3,375,,376,5,37d,1,37f,1,37h,1,386,1,388,1,38e,2,38x,3,39e,,39g,,39h,1,39p,,3a5,,3cw,2n,3fk,1z,3hk,2f,3tp,2,4k2,3,4ky,2,4lu,1,4mq,1,4ok,1,4om,,4on,6,4ou,7,4p2,,4p3,1,4p5,a,4pp,,4qz,2,4r2,,4r3,,4ud,1,4vd,,4yo,2,4yr,3,4yv,1,4yx,2,4z4,1,4z6,,4z7,5,4zd,2,55j,1,55l,1,55n,,579,,57a,,57b,,57c,6,57k,,57m,,57p,7,57x,5,583,9,58f,,59s,u,5c0,3,5c4,,5dg,9,5dq,3,5du,2,5ez,8,5fk,1,5fm,,5gh,,5gi,3,5gm,1,5go,5,5ie,,5if,,5ig,1,5ii,2,5il,,5im,,5in,4,5k4,7,5kc,7,5kk,1,5km,1,5ow,2,5p0,c,5pd,,5pe,6,5pp,,5pw,,5pz,,5q0,1,5vk,1r,6bv,,6bw,,6bx,,6by,1,6co,6,6d8,,6dl,,6e8,f,6hc,w,6jm,,6k9,,6ms,5,6nd,1,6xm,1,6y0,,70o,,72n,,73d,a,73s,2,79e,,7fu,1,7g6,,7gg,,7i3,3,7i8,5,7if,b,7is,35,7m8,39,7pk,a,7pw,,7py,,7q5,,7q9,,7qg,,7qr,1,7r8,,7rb,,7rg,,7ri,,7rn,2,7rr,,7s3,4,7th,2,7tt,,7u8,,7un,,850,1,8hx,2,8ij,1,8k0,,8k5,,8vj,2,8zj,,928,v,wvj,3,wvo,9,wwu,1,wz4,1,x6q,,x6u,,x6z,,x7n,1,x7p,1,x7r,,x7w,,xa8,1,xbo,f,xc4,1,xcw,h,xdr,,xeu,7,xfr,a,xg2,,xg3,,xgg,s,xhc,2,xhf,,xir,,xis,1,xiu,3,xiy,1,xj0,1,xj2,1,xj4,,xk5,,xm1,5,xm7,1,xm9,1,xmb,1,xmd,1,xmr,,xn0,,xn1,,xoc,,xps,,xpu,2,xpz,1,xq6,1,xq9,,xrf,,xrg,1,xri,1,xrp,,xrq,,xyb,1,xyd,,xye,1,xyg,,xyh,1,xyk,,xyl,,1e68,f,1e74,f,1edb,,1ehq,1,1ek0,b,1eyl,,1f4w,,1f92,4,1gjl,2,1gjp,1,1gjw,3,1gl4,2,1glb,,1gpx,1,1h5w,3,1h7t,4,1hgr,1,1hj0,3,1hl2,a,1hmq,3,1hq8,,1hq9,,1hqa,,1hrs,e,1htc,,1htf,1,1htr,2,1htu,,1hv4,2,1hv7,3,1hvb,1,1hvd,1,1hvh,,1hvm,,1hvx,,1hxc,2,1hyf,4,1hyk,,1hyl,7,1hz9,1,1i0j,,1i0w,1,1i0y,,1i2b,2,1i2e,8,1i2n,,1i2o,,1i2q,1,1i2x,3,1i32,,1i33,,1i5o,2,1i5r,2,1i5u,1,1i5w,3,1i66,,1i69,,1ian,,1iao,2,1iar,7,1ibk,1,1ibm,1,1id7,1,1ida,,1idb,,1idc,,1idd,3,1idj,1,1idn,1,1idp,,1idz,,1iea,1,1iee,6,1ieo,4,1igo,,1igp,1,1igr,5,1igy,,1ih1,,1ih3,2,1ih6,,1ih8,1,1iha,2,1ihd,,1ihe,,1iht,1,1ik5,2,1ik8,7,1ikg,1,1iki,2,1ikl,,1ikm,,1ila,,1ink,,1inl,1,1inn,5,1int,,1inu,,1inv,1,1inx,,1iny,,1inz,1,1io1,,1io2,1,1iun,,1iuo,1,1iuq,3,1iuw,3,1iv0,1,1iv2,,1iv3,1,1ivw,1,1iy8,2,1iyb,7,1iyj,1,1iyl,,1iym,,1iyn,1,1j1n,,1j1o,,1j1p,,1j1q,1,1j1s,7,1j4t,,1j4u,,1j4v,,1j4y,3,1j52,,1j53,4,1jcc,2,1jcf,8,1jco,,1jcp,1,1jjk,,1jjl,4,1jjr,1,1jjv,3,1jjz,,1jk0,,1jk1,,1jk2,,1jk3,,1jo1,2,1jo4,3,1joa,1,1joc,3,1jog,,1jok,,1jpd,9,1jqr,5,1jqx,,1jqy,,1jqz,3,1jrb,,1jrl,5,1jrr,1,1jrt,2,1jt0,5,1jt6,c,1jtj,,1jtk,1,1k4v,,1k4w,6,1k54,5,1k5a,,1k5b,,1k7m,l,1k89,,1k8a,6,1k8h,,1k8i,1,1k8k,,1k8l,1,1kc1,5,1kca,,1kcc,1,1kcf,6,1kcm,,1kcn,,1kei,4,1keo,1,1ker,1,1ket,,1keu,,1kev,,1koj,1,1kol,1,1kow,1,1koy,,1koz,,1kqc,1,1kqe,4,1kqm,1,1kqo,2,1kre,,1ovk,f,1ow0,,1ow7,e,1xr2,b,1xre,2,1xrh,2,1zow,4,1zqo,6,206b,,206f,3,20jz,,20k1,1i,20lr,3,20o4,,20og,1,2ftp,1,2fts,3,2jgg,19,2jhs,m,2jxh,4,2jxp,5,2jxv,7,2jy3,7,2jyd,6,2jze,3,2k3m,2,2lmo,1i,2lob,1d,2lpx,,2lqc,,2lqz,4,2lr5,e,2mtc,6,2mtk,g,2mu3,6,2mub,1,2mue,4,2mxb,,2n1s,6,2nce,,2ne4,3,2nsc,3,2nzi,1,2ok0,6,2on8,6,2pz4,73,2q6l,2,2q7j,,2q98,5,2q9q,1,2qa6,,2qa9,9,2qb1,1k,2qcm,p,2qdd,e,2qe2,,2qen,,2qeq,8,2qf0,3,2qfd,c1,2qrf,4,2qrk,8t,2r0m,7d,2r9c,3j,2rg4,b,2rit,16,2rkc,3,2rm0,7,2rmi,5,2rns,7,2rou,29,2rrg,1a,2rss,9,2rt3,c8,2scg,sd,jny8,v,jnz4,2n,jo1s,3j,jo5c,6n,joc0,2rz", "262122424333333393233393339333333333393393b3b3b3b3b333b33b3bb33333b3b3333333b3b33bb3333b33b3bb33333b3bbb333b333b33333b3b3b3b3333b3b33b3bb39333b33b33b3b3b333b333333b3b333333b33b3b3333b3335dc333333b3b3b33323333b3bb3b33b3b3b3333b3333b3b333bb3b33b3b3b3b3b333b333b3323e2244234444444444444444444444444444444444444444443333333333b3b3bb33333b353b3b3b3b333b3b333b333333b3bb3b3b3bb333232333333333333333b3b3333bb3b393933b3b33bb3b393b3b3b3333b33b33b3bbb33b333b3333bb3933b3b3b333b3b3b3b3b33b3b3b33b3b3b33b3b33b33b3b3b33bb39b9b3b33b3b33b9333b393b3b33b33b3b3b3333393b3b3b33b39bb3b332333b333dd3b33332333323333333333333333333333344444444a44444434444444444444423232"), Wl = Vl("1sl,10,1ug,7,1vc,7,1w5,j,1wq,6,1wy,,1x2,3,1y4,1,1y7,,1yo,1,239,j,23u,6,242,1,245,4,261,,26t,j,27e,6,27m,1,27p,4,28s,1,28v,,29d,,2dx,j,2ei,f,2fs,2,2l1,11"), Gl = 65535;
function* Kl(e) {
	let t = e.codePointAt(0);
	if (t == null) return;
	let n = t <= Gl ? 1 : 2, r = e.length, i = tu(t), a = 0, o = 0, s = !1, c = !1, l = !1, u = 0, d = i, f = t;
	for (; n < r;) {
		t = e.codePointAt(n), a = tu(t);
		let r = !0;
		i === 1 ? r = a !== 6 : i === 2 || i === 6 || a === 1 || a === 2 || a === 6 ? r = !0 : a === 3 || a === 14 || a === 11 || i === 9 ? r = !1 : i === 14 && a === 4 ? r = !s : i === 10 && a === 10 ? r = o++ % 2 == 1 : i === 5 ? r = a !== 5 && a !== 13 && a !== 7 && a !== 8 : ((i === 7 || i === 13) && (a === 13 || a === 12) || (i === 8 || i === 12) && a === 12 || a === 0 && c && l && nu(t)) && (r = !1), r ? (yield {
			segment: e.slice(u, n),
			index: u,
			input: e,
			_hd: f,
			_catBegin: d,
			_catEnd: i
		}, s = !1, o = 0, u = n, d = a, f = t) : a === 14 && (i === 3 || i === 4) ? s = !0 : t >= 2325 && (!c && i === 0 && (c = nu(f)), l = c && a === 3 ? l || t === 2381 || t === 2509 || t === 2637 || t === 2765 || t === 2893 || t === 3149 || t === 3405 : !1), n += t <= Gl ? 1 : 2, i = a;
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
function ql(e) {
	let t = 0;
	for (let n of Kl(e)) t += 1;
	return t;
}
var Jl = /* @__PURE__ */ new Uint8Array(6080), Yl = 128, Xl = 12287, Zl = /* @__PURE__ */ new Uint8Array(1536), Ql = 40960, $l = 44031, eu = (() => {
	let e = 0;
	for (;;) {
		let [t, n, r] = Ul[e];
		if (t > $l) break;
		if (e++, !(n < Yl || t > Xl && n < Ql)) for (let e = t; e <= n; e++) {
			let t, n = 0;
			e <= Xl ? (t = Jl, n = e - Yl >> 1) : (t = Zl, n = e - Ql >> 1), t[n] = e & 1 ? t[n] & 15 | r << 4 : t[n] & 240 | r;
		}
	}
	return e;
})();
function tu(e) {
	if (e < Yl) return e >= 32 ? 0 : e === 10 ? 6 : e === 13 ? 1 : 2;
	if (e <= Xl) {
		let t = Jl[e - Yl >> 1];
		return e & 1 ? t >> 4 : t & 15;
	}
	if (e < Ql) return e < 12336 ? e >= 12330 ? 3 : 0 : e < 12443 ? e === 12336 || e === 12349 ? 4 : e >= 12441 ? 3 : 0 : e === 12951 || e === 12953 ? 4 : 0;
	if (e <= $l) {
		let t = Zl[e - Ql >> 1];
		return e & 1 ? t >> 4 : t & 15;
	}
	if (e <= 55203) return (e - 44032) % 28 == 0 ? 7 : 8;
	if (e <= 55295) return e <= 55238 ? e >= 55216 ? 13 : 0 : e >= 55243 ? 12 : 0;
	if (e < 65024) return e === 64286 ? 3 : 0;
	let t = Hl(e, Ul, eu);
	return t < 0 ? 0 : Ul[t][2];
}
function nu(e) {
	return Hl(e, Wl) >= 0;
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/utf8-grapheme-len.js
var ru = "Segmenter" in Intl && typeof Intl.Segmenter == "function" ? /*#__PURE__*/ new Intl.Segmenter() : /* v8 ignore next -- @preserve */ null, iu = ru ? function(e) {
	let t = 0;
	for (let n of ru.segment(e)) t++;
	return t;
} : /* v8 ignore next -- @preserve */ null;
function au(e) {
	return ql(e);
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/utf8-len.js
var ou = dl ? function(e) {
	return dl.byteLength(e, "utf8");
} : /* v8 ignore next -- @preserve */ null;
function su(e) {
	let t = e.length, n;
	for (let r = 0; r < e.length; r += 1) n = e.charCodeAt(r), n <= 127 || (n <= 2047 ? t += 1 : (t += 2, n >= 55296 && n <= 56319 && (n = e.charCodeAt(r + 1), n >= 56320 && n <= 57343 && r++)));
	return t;
}
//#endregion
//#region node_modules/@atproto/lex-data/dist/utf8.js
var cu = iu ?? au, lu = ou ?? su;
//#endregion
//#region node_modules/@atproto/lex-json/dist/bytes.js
function uu(e) {
	if (e && "$bytes" in e) {
		for (let t in e) if (t !== "$bytes") return;
		if (typeof e.$bytes == "string") try {
			return El(e.$bytes);
		} catch {
			return;
		}
	}
}
function du(e) {
	return { $bytes: Tl(e) };
}
//#endregion
//#region node_modules/@atproto/lex-json/dist/link.js
function fu(e, t) {
	if (!e || !("$link" in e)) return;
	for (let t in e) if (t !== "$link") return;
	let { $link: n } = e;
	if (typeof n == "string" && n.length !== 0 && !(n.length > 2048)) try {
		return Il(n, t);
	} catch {
		return;
	}
}
function pu(e) {
	return { $link: e.toString() };
}
//#endregion
//#region node_modules/@atproto/lex-json/dist/blob.js
function mu(e, t) {
	if (e.$type !== "blob") return;
	let n = e?.ref;
	if (n && typeof n == "object") {
		if ("$link" in n) {
			let r = fu(n);
			if (!r) return;
			let i = {
				...e,
				ref: r
			};
			if (Bl(i, t)) return i;
		}
		if (Bl(e)) return e;
	}
}
//#endregion
//#region node_modules/@atproto/lex-json/dist/lex-json.js
function hu(e, t = { strict: !1 }) {
	switch (typeof e) {
		case "object": return e === null ? null : Array.isArray(e) ? gu(e, t) : xu(e, t) ?? _u(e, t);
		case "number":
			if (Number.isSafeInteger(e) || t.strict === !1) return e;
			throw TypeError(`Invalid non-integer number: ${e}`);
		case "boolean":
		case "string": return e;
		default: throw TypeError(`Invalid JSON value: ${typeof e}`);
	}
}
function gu(e, t) {
	let n;
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = hu(i, t);
		a !== i && (n ??= Array.from(e), n[r] = a);
	}
	return n ?? e;
}
function _u(e, t) {
	let n;
	for (let [r, i] of Object.entries(e)) {
		if (r === "__proto__") throw TypeError("Invalid key: __proto__");
		if (i === void 0) {
			n ??= { ...e }, delete n[r];
			continue;
		}
		let a = hu(i, t);
		a !== i && (n ??= { ...e }, n[r] = a);
	}
	return n ?? e;
}
function vu(e) {
	switch (typeof e) {
		case "object": return e === null ? e : Array.isArray(e) ? yu(e) : Nl(e) ? pu(e) : ArrayBuffer.isView(e) ? du(e) : bu(e);
		case "boolean":
		case "string":
		case "number": return e;
		default: throw TypeError(`Invalid Lex value: ${typeof e}`);
	}
}
function yu(e) {
	let t;
	for (let n = 0; n < e.length; n++) {
		let r = e[n], i = vu(r);
		i !== r && (t ??= Array.from(e), t[n] = i);
	}
	return t ?? e;
}
function bu(e) {
	let t;
	for (let [n, r] of Object.entries(e)) {
		if (n === "__proto__") throw TypeError("Invalid key: __proto__");
		if (r === void 0) {
			t ??= { ...e }, delete t[n];
			continue;
		}
		let i = vu(r);
		i !== r && (t ??= { ...e }, t[n] = i);
	}
	return t ?? e;
}
function xu(e, t) {
	if (e.$link !== void 0) {
		let n = fu(e);
		if (n) return n;
		if (t.strict) throw TypeError("Invalid $link object");
	} else if (e.$bytes !== void 0) {
		let n = uu(e);
		if (n) return n;
		if (t.strict) throw TypeError("Invalid $bytes object");
	} else if (e.$type !== void 0 && t.strict) {
		if (e.$type === "blob") {
			let n = mu(e, t);
			if (n) return n;
			throw TypeError("Invalid blob object");
		}
		if (typeof e.$type != "string") throw TypeError(`Invalid $type property (${typeof e.$type})`);
		if (e.$type.length === 0) throw TypeError("Empty $type property");
	}
}
//#endregion
//#region node_modules/@atproto/common-web/dist/ipld.js
var Su = (e) => hu(e, { strict: !1 }), Cu = (e) => e === void 0 || Number.isNaN(e) ? e : vu(e), wu = Bs().transform((e, t) => Uc.asCID(e) ?? (t.addIssue({
	code: O.custom,
	message: "Not a valid CID"
}), qs)), Tu = {
	cid: wu,
	carHeader: R({
		version: z(1),
		roots: Vs(wu)
	}),
	bytes: Rs(Uint8Array),
	string: I(),
	array: Vs(Bs()),
	map: Gs(I(), Bs()),
	unknown: Bs()
};
Tu.cid, Tu.carHeader, Tu.bytes, Tu.string, Tu.map, Tu.unknown;
//#endregion
//#region node_modules/@atproto/syntax/dist/did.js
var Eu = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
function Du(e) {
	return typeof e == "string" && e.length <= 2048 && Eu.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/handle.js
var Ou = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
function ku(e) {
	return typeof e == "string" && e.length <= 253 && Ou.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/at-identifier.js
function Au(e) {
	return !e || typeof e != "string" ? !1 : e.startsWith("did:") ? Du(e) : ku(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/lib/result.js
function ju(e) {
	return {
		success: !0,
		value: e
	};
}
function B(e) {
	return {
		success: !1,
		message: e
	};
}
//#endregion
//#region node_modules/@atproto/syntax/dist/nsid.js
function Mu(e) {
	return typeof e == "string" && Nu(e).success;
}
function Nu(e) {
	return e.length > 317 ? B("NSID is too long (317 chars max)") : e.length < 5 || !/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/.test(e) ? B("NSID didn't validate via regex") : ju(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/recordkey.js
var Pu = 512, Fu = 1, Iu = /* @__PURE__ */ new Set([".", ".."]), Lu = /^[a-zA-Z0-9_~.:-]{1,512}$/;
function Ru(e) {
	return typeof e == "string" && e.length >= Fu && e.length <= Pu && Lu.test(e) && !Iu.has(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/aturi_validation.js
function zu(e, t) {
	return Hu(e, t).success;
}
var Bu = /[^a-zA-Z0-9._~:@!$&'()*+,;=%/\\[\]#?-]/, Vu = /^(?<uri>at:\/\/(?<authority>[^/?#\s]+)(?:\/(?<collection>[^/?#\s]+)(?:\/(?<rkey>[^/?#\s]+))?)?(?<trailingSlash>\/)?)(?:\?(?<query>[^#\s]*))?(?:#(?<hash>[^\s]*))?$/;
function Hu(e, t) {
	if (typeof e != "string") return B("ATURI must be a string");
	if (e.length > 8192) return B("ATURI exceeds maximum length");
	if (e.match(Bu)) return B("Disallowed characters in ATURI (ASCII)");
	let n = e.match(Vu)?.groups;
	if (!n) {
		if (t?.detailed) {
			if (!e.startsWith("at://")) return B("ATURI must start with \"at://\"");
			if (e.includes(" ")) return B("ATURI can not contain spaces");
			if (e.includes("//", 5)) return B("ATURI can not have empty path segments");
			let t = e.indexOf("/", 5);
			if (t !== -1) {
				let n = e.indexOf("#"), r = n === -1 ? e.length : n, i = e.indexOf("/", t + 1);
				if (i !== -1 && i !== r - 1) return B("ATURI can not have more than two path segments");
			}
		}
		return B("ATURI does not match expected format");
	}
	if (!Au(n.authority)) return B("ATURI has invalid authority");
	if (n.collection != null && !Mu(n.collection)) return B("ATURI has invalid collection");
	if (n.hash != null) {
		let e = Wu(n.hash, t);
		if (e.success) n.hash = e.value;
		else return B(`ATURI has invalid fragment (${e.message})`);
	}
	if (t?.strict !== !1) {
		if (n.trailingSlash != null) return B("ATURI can not have a trailing slash");
		if (n.query != null) return B("ATURI query part is not allowed");
		if (n.rkey != null && !Ru(n.rkey)) return B("ATURI has invalid record key");
	}
	return ju(n);
}
var Uu = /^\/[a-zA-Z0-9._~:@!$&')(*+,;=%[\]/-]*$/;
function Wu(e, t) {
	if (!Uu.test(e)) return B("Invalid JSON pointer");
	let n = Gu(e);
	return !n.success && t?.strict === !1 ? ju(e) : n;
}
function Gu(e) {
	try {
		return ju(decodeURIComponent(e));
	} catch {
		return B("Invalid percent-encoding");
	}
}
var { isValidISODateString: Ku } = ((e) => e.default ?? e)(/* @__PURE__ */ c((/* @__PURE__ */ o(((e) => {
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
function qu(e) {
	return Qu(e).success;
}
function Ju(e) {
	if (typeof e != "string") return !1;
	try {
		if (Ku(e)) return !0;
	} catch {}
	return qu(e);
}
var Yu = (e) => ({
	success: !1,
	message: e
}), Xu = (e) => ({
	success: !0,
	value: e
}), Zu = /^(?<full_year>[0-9]{4})-(?<date_month>0[1-9]|1[012])-(?<date_mday>[0-2][0-9]|3[01])T(?<time_hour>[0-1][0-9]|2[0-3]):(?<time_minute>[0-5][0-9]):(?<time_second>[0-5][0-9]|60)(?<time_secfrac>\.[0-9]+)?(?<time_offset>Z|(?<time_numoffset>[+-](?:[0-1][0-9]|2[0-3]):[0-5][0-9]))$/;
function Qu(e) {
	return typeof e == "string" ? e.length > 64 ? Yu("datetime is too long (64 chars max)") : e.endsWith("-00:00") ? Yu("datetime can not use \"-00:00\" for UTC timezone") : Zu.test(e) ? $u(new Date(e)) : Yu("datetime is not in a valid format (must match RFC 3339 & ISO 8601 with 'Z' or ±hh:mm timezone)") : Yu("datetime must be a string");
}
function $u(e) {
	let t = e.getUTCFullYear();
	return Number.isNaN(t) ? Yu("datetime did not parse as ISO 8601") : t < 0 ? Yu("datetime normalized to a negative time") : t > 9999 ? Yu("datetime year is too far in the future") : Xu(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/language.js
var ed = /^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>[xX](-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>[xX](-[A-Za-z0-9]{1,8})+))$/;
function td(e) {
	return ed.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/tid.js
var nd = 13, rd = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
function id(e) {
	return typeof e == "string" && e.length === nd && rd.test(e);
}
//#endregion
//#region node_modules/@atproto/syntax/dist/uri.js
function ad(e) {
	return typeof e == "string" && /^\w+:(?:\/\/)?[^\s/][^\s]*$/.test(e);
}
//#endregion
//#region node_modules/@atproto/common-web/dist/strings.js
var od = cu, sd = lu, cd = td;
URL.canParse;
var ld = R({
	id: I(),
	type: I(),
	controller: I(),
	publicKeyJwk: Gs(I(), Bs()).optional(),
	publicKeyMultibase: I().optional()
}), ud = R({
	id: I(),
	type: I(),
	serviceEndpoint: Hs([I(), Gs(Bs())])
});
R({
	"@context": Hs([z("https://www.w3.org/ns/did/v1"), Vs(I().url())]).optional(),
	id: I(),
	alsoKnownAs: Vs(I()).optional(),
	verificationMethod: Vs(ld).optional(),
	authentication: Vs(Hs([I(), ld])).optional(),
	service: Vs(ud).optional()
});
//#endregion
//#region node_modules/@atproto/lexicon/dist/util.js
function V(e, t) {
	if (e.split("#").length > 2) throw Error("Uri can only have one hash segment");
	if (e.startsWith("lex:")) return e;
	if (e.startsWith("#")) {
		if (!t) throw Error(`Unable to resolve uri without anchor: ${e}`);
		return `${t}${e}`;
	}
	return `lex:${e}`;
}
function dd(e, t) {
	if (e.required !== void 0) {
		if (!Array.isArray(e.required)) {
			t.addIssue({
				code: O.invalid_type,
				received: typeof e.required,
				expected: "array"
			});
			return;
		}
		if (e.properties === void 0) {
			e.required.length > 0 && t.addIssue({
				code: O.custom,
				message: "Required fields defined but no properties defined"
			});
			return;
		}
		for (let n of e.required) e.properties[n] === void 0 && t.addIssue({
			code: O.custom,
			message: `Required field "${n}" not defined`
		});
	}
}
var fd = Gs(I().refine(cd, "Invalid BCP47 language tag"), I().optional()), pd = R({
	type: z("boolean"),
	description: I().optional(),
	default: zs().optional(),
	const: zs().optional()
}), md = R({
	type: z("integer"),
	description: I().optional(),
	default: L().int().optional(),
	minimum: L().int().optional(),
	maximum: L().int().optional(),
	enum: L().int().array().optional(),
	const: L().int().optional()
}), hd = Ks([
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
]), gd = R({
	type: z("string"),
	format: hd.optional(),
	description: I().optional(),
	default: I().optional(),
	minLength: L().int().optional(),
	maxLength: L().int().optional(),
	minGraphemes: L().int().optional(),
	maxGraphemes: L().int().optional(),
	enum: I().array().optional(),
	const: I().optional(),
	knownValues: I().array().optional()
}), _d = R({
	type: z("unknown"),
	description: I().optional()
}), vd = Us("type", [
	pd,
	md,
	gd,
	_d
]), yd = R({
	type: z("bytes"),
	description: I().optional(),
	maxLength: L().optional(),
	minLength: L().optional()
}), bd = R({
	type: z("cid-link"),
	description: I().optional()
});
Us("type", [yd, bd]);
var xd = R({
	type: z("ref"),
	description: I().optional(),
	ref: I()
}), Sd = R({
	type: z("union"),
	description: I().optional(),
	refs: I().array(),
	closed: zs().optional()
}), Cd = Us("type", [xd, Sd]), wd = R({
	type: z("blob"),
	description: I().optional(),
	accept: I().array().optional(),
	maxSize: L().optional()
}), Td = R({
	type: z("array"),
	description: I().optional(),
	items: Us("type", [
		pd,
		md,
		gd,
		_d,
		yd,
		bd,
		xd,
		Sd,
		wd
	]),
	minLength: L().int().optional(),
	maxLength: L().int().optional()
}), Ed = Td.merge(R({ items: vd })), Dd = R({
	type: z("token"),
	description: I().optional()
}), Od = R({
	type: z("object"),
	description: I().optional(),
	required: I().array().optional(),
	nullable: I().array().optional(),
	properties: Gs(I(), Us("type", [
		Td,
		pd,
		md,
		gd,
		_d,
		yd,
		bd,
		xd,
		Sd,
		wd
	]))
}).superRefine(dd), kd = Ws(R({
	type: z("permission"),
	resource: I().nonempty()
}), Gs(I(), Hs([
	Vs(Hs([
		I(),
		L().int(),
		zs()
	])),
	zs(),
	L().int(),
	I()
]).optional())), Ad = R({
	type: z("permission-set"),
	description: I().optional(),
	title: I().optional(),
	"title:lang": fd.optional(),
	detail: I().optional(),
	"detail:lang": fd.optional(),
	permissions: Vs(kd)
}), jd = R({
	type: z("params"),
	description: I().optional(),
	required: I().array().optional(),
	properties: Gs(I(), Us("type", [
		Ed,
		pd,
		md,
		gd,
		_d
	]))
}).superRefine(dd), Md = R({
	description: I().optional(),
	encoding: I(),
	schema: Hs([Cd, Od]).optional()
}), Nd = R({
	name: I(),
	description: I().optional()
}), Pd = R({
	type: z("query"),
	description: I().optional(),
	parameters: jd.optional(),
	output: Md.optional(),
	errors: Nd.array().optional()
}), Fd = R({
	type: z("procedure"),
	description: I().optional(),
	parameters: jd.optional(),
	input: Md.optional(),
	output: Md.optional(),
	errors: Nd.array().optional()
}), Id = R({
	type: z("subscription"),
	description: I().optional(),
	parameters: jd.optional(),
	message: R({
		description: I().optional(),
		schema: Sd
	}),
	errors: Nd.array().optional()
}), Ld = R({
	type: z("record"),
	description: I().optional(),
	key: I().optional(),
	record: Od
}), Rd = Bs().superRefine((e, t) => {
	if (!e || typeof e != "object") return t.addIssue({
		code: O.custom,
		message: "Must be an object",
		fatal: !0
	}), qs;
	let n = e.type;
	if (n === void 0) return t.addIssue({
		code: O.custom,
		message: "Must have a type",
		fatal: !0
	}), qs;
	if (typeof n != "string") return t.addIssue({
		code: O.custom,
		message: "Type property must be a string",
		fatal: !0
	}), qs;
	let r = (() => {
		switch (n) {
			case "record": return Ld;
			case "permission-set": return Ad;
			case "query": return Pd;
			case "procedure": return Fd;
			case "subscription": return Id;
			case "blob": return wd;
			case "array": return Td;
			case "token": return Dd;
			case "object": return Od;
			case "boolean": return pd;
			case "integer": return md;
			case "string": return gd;
			case "bytes": return yd;
			case "cid-link": return bd;
			case "unknown": return _d;
		}
	})();
	if (!r) return t.addIssue({
		code: O.custom,
		message: `Invalid type: ${n} must be one of: record, query, procedure, subscription, blob, array, token, object, boolean, integer, string, bytes, cid-link, unknown`,
		fatal: !0
	}), qs;
	let i = r.safeParse(e);
	if (!i.success) for (let e of i.error.issues) t.addIssue(e);
});
R({
	lexicon: z(1),
	id: I().refine(Mu, { message: "Must be a valid NSID" }),
	revision: L().optional(),
	description: I().optional(),
	defs: Gs(I(), Rd)
}).refine((e) => {
	for (let [t, n] of Object.entries(e.defs)) if (t !== "main" && (n.type === "record" || n.type === "permission-set" || n.type === "procedure" || n.type === "query" || n.type === "subscription")) return !1;
	return !0;
}, { message: "Records, permission sets, procedures, queries, and subscriptions must be the main definition." });
function zd(e) {
	return typeof e == "object" && !!e;
}
function Bd(e) {
	return zd(e) && "$type" in e && typeof e.$type == "string";
}
var H = class extends Error {}, Vd = class extends Error {}, Hd = class extends Error {};
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bytes.js
function Ud(e, t) {
	if (e === t) return !0;
	if (e.byteLength !== t.byteLength) return !1;
	for (let n = 0; n < e.byteLength; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function Wd(e) {
	if (e instanceof Uint8Array && e.constructor.name === "Uint8Array") return e;
	if (e instanceof ArrayBuffer) return new Uint8Array(e);
	if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
	throw Error("Unknown type, must be binary type");
}
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/vendor/base-x.js
function Gd(e, t) {
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
var Kd = Gd, qd = class {
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
}, Jd = class {
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
		return Xd(this, e);
	}
}, Yd = class {
	decoders;
	constructor(e) {
		this.decoders = e;
	}
	or(e) {
		return Xd(this, e);
	}
	decode(e) {
		let t = e[0], n = this.decoders[t];
		if (n != null) return n.decode(e);
		throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
	}
};
function Xd(e, t) {
	return new Yd({
		...e.decoders ?? { [e.prefix]: e },
		...t.decoders ?? { [t.prefix]: t }
	});
}
var Zd = class {
	name;
	prefix;
	baseEncode;
	baseDecode;
	encoder;
	decoder;
	constructor(e, t, n, r) {
		this.name = e, this.prefix = t, this.baseEncode = n, this.baseDecode = r, this.encoder = new qd(e, t, n), this.decoder = new Jd(e, t, r);
	}
	encode(e) {
		return this.encoder.encode(e);
	}
	decode(e) {
		return this.decoder.decode(e);
	}
};
function Qd({ name: e, prefix: t, encode: n, decode: r }) {
	return new Zd(e, t, n, r);
}
function $d({ name: e, prefix: t, alphabet: n }) {
	let { encode: r, decode: i } = Kd(n, e);
	return Qd({
		prefix: t,
		name: e,
		encode: r,
		decode: (e) => Wd(i(e))
	});
}
function ef(e, t, n, r) {
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
function tf(e, t, n) {
	let r = t[t.length - 1] === "=", i = (1 << n) - 1, a = "", o = 0, s = 0;
	for (let r = 0; r < e.length; ++r) for (s = s << 8 | e[r], o += 8; o > n;) o -= n, a += t[i & s >> o];
	if (o !== 0 && (a += t[i & s << n - o]), r) for (; a.length * n & 7;) a += "=";
	return a;
}
function nf(e) {
	let t = {};
	for (let n = 0; n < e.length; ++n) t[e[n]] = n;
	return t;
}
function rf({ name: e, prefix: t, bitsPerChar: n, alphabet: r }) {
	let i = nf(r);
	return Qd({
		prefix: t,
		name: e,
		encode(e) {
			return tf(e, r, n);
		},
		decode(t) {
			return ef(t, i, n, e);
		}
	});
}
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base32.js
var af = rf({
	prefix: "b",
	name: "base32",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567",
	bitsPerChar: 5
});
rf({
	prefix: "B",
	name: "base32upper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
	bitsPerChar: 5
}), rf({
	prefix: "c",
	name: "base32pad",
	alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
	bitsPerChar: 5
}), rf({
	prefix: "C",
	name: "base32padupper",
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
	bitsPerChar: 5
}), rf({
	prefix: "v",
	name: "base32hex",
	alphabet: "0123456789abcdefghijklmnopqrstuv",
	bitsPerChar: 5
}), rf({
	prefix: "V",
	name: "base32hexupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
	bitsPerChar: 5
}), rf({
	prefix: "t",
	name: "base32hexpad",
	alphabet: "0123456789abcdefghijklmnopqrstuv=",
	bitsPerChar: 5
}), rf({
	prefix: "T",
	name: "base32hexpadupper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
	bitsPerChar: 5
}), rf({
	prefix: "h",
	name: "base32z",
	alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
	bitsPerChar: 5
});
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base36.js
var of = $d({
	prefix: "k",
	name: "base36",
	alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
$d({
	prefix: "K",
	name: "base36upper",
	alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/bases/base58.js
var sf = $d({
	name: "base58btc",
	prefix: "z",
	alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
$d({
	name: "base58flickr",
	prefix: "Z",
	alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/vendor/varint.js
var cf = ff, lf = 128, uf = -128, df = 2 ** 31;
function ff(e, t, n) {
	t ||= [], n ||= 0;
	for (var r = n; e >= df;) t[n++] = e & 255 | lf, e /= 128;
	for (; e & uf;) t[n++] = e & 255 | lf, e >>>= 7;
	return t[n] = e | 0, ff.bytes = n - r + 1, t;
}
var pf = gf, mf = 128, hf = 127;
function gf(e, t) {
	var n = 0, t = t || 0, r = 0, i = t, a, o = e.length;
	do {
		if (i >= o) throw gf.bytes = 0, RangeError("Could not decode varint");
		a = e[i++], n += r < 28 ? (a & hf) << r : (a & hf) * 2 ** r, r += 7;
	} while (a >= mf);
	return gf.bytes = i - t, n;
}
var _f = 128, vf = 2 ** 14, yf = 2 ** 21, bf = 2 ** 28, xf = 2 ** 35, Sf = 2 ** 42, Cf = 2 ** 49, wf = 2 ** 56, Tf = 2 ** 63, Ef = {
	encode: cf,
	decode: pf,
	encodingLength: function(e) {
		return e < _f ? 1 : e < vf ? 2 : e < yf ? 3 : e < bf ? 4 : e < xf ? 5 : e < Sf ? 6 : e < Cf ? 7 : e < wf ? 8 : e < Tf ? 9 : 10;
	}
};
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/varint.js
function Df(e, t = 0) {
	return [Ef.decode(e, t), Ef.decode.bytes];
}
function Of(e, t, n = 0) {
	return Ef.encode(e, t, n), t;
}
function kf(e) {
	return Ef.encodingLength(e);
}
//#endregion
//#region node_modules/@atproto/lexicon/node_modules/multiformats/dist/src/hashes/digest.js
function Af(e, t) {
	let n = t.byteLength, r = kf(e), i = r + kf(n), a = new Uint8Array(i + n);
	return Of(e, a, 0), Of(n, a, r), a.set(t, i), new Nf(e, n, t, a);
}
function jf(e) {
	let t = Wd(e), [n, r] = Df(t), [i, a] = Df(t.subarray(r)), o = t.subarray(r + a);
	if (o.byteLength !== i) throw Error("Incorrect length");
	return new Nf(n, i, o, t);
}
function Mf(e, t) {
	if (e === t) return !0;
	{
		let n = t;
		return e.code === n.code && e.size === n.size && n.bytes instanceof Uint8Array && Ud(e.bytes, n.bytes);
	}
}
var Nf = class {
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
function Pf(e, t) {
	let { bytes: n, version: r } = e;
	switch (r) {
		case 0: return zf(n, If(e), t ?? sf.encoder);
		default: return Bf(n, If(e), t ?? af.encoder);
	}
}
var Ff = /* @__PURE__ */ new WeakMap();
function If(e) {
	let t = Ff.get(e);
	if (t == null) {
		let t = /* @__PURE__ */ new Map();
		return Ff.set(e, t), t;
	}
	return t;
}
var Lf = class e {
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
				if (t !== Vf) throw Error("Cannot convert a non dag-pb CID to CIDv0");
				if (n.code !== Hf) throw Error("Cannot convert non sha2-256 multihash CID to CIDv0");
				return e.createV0(n);
			}
			default: throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
		}
	}
	toV1() {
		switch (this.version) {
			case 0: {
				let { code: t, digest: n } = this.multihash, r = Af(t, n);
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
		return n != null && e.code === n.code && e.version === n.version && Mf(e.multihash, n.multihash);
	}
	toString(e) {
		return Pf(this, e);
	}
	toJSON() {
		return { "/": Pf(this) };
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
			return new e(t, r, i, a ?? Uf(t, r, i.bytes));
		}
		if (n[Wf] === !0) {
			let { version: t, multihash: r, code: i } = n, a = jf(r);
			return e.create(t, i, a);
		}
		return null;
	}
	static create(t, n, r) {
		if (typeof n != "number") throw Error("String codecs are no longer supported");
		if (!(r.bytes instanceof Uint8Array)) throw Error("Invalid digest");
		switch (t) {
			case 0:
				if (n !== Vf) throw Error(`Version 0 CID must use dag-pb (code: ${Vf}) block encoding`);
				return new e(t, n, r, r.bytes);
			case 1: {
				let i = Uf(t, n, r.bytes);
				return new e(t, n, r, i);
			}
			default: throw Error("Invalid version");
		}
	}
	static createV0(t) {
		return e.create(0, Vf, t);
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
		let n = e.inspectBytes(t), r = n.size - n.multihashSize, i = Wd(t.subarray(r, r + n.multihashSize));
		if (i.byteLength !== n.multihashSize) throw Error("Incorrect length");
		let a = i.subarray(n.multihashSize - n.digestSize), o = new Nf(n.multihashCode, n.digestSize, a, i);
		return [n.version === 0 ? e.createV0(o) : e.createV1(n.codec, o), t.subarray(n.size)];
	}
	static inspectBytes(e) {
		let t = 0, n = () => {
			let [n, r] = Df(e.subarray(t));
			return t += r, n;
		}, r = n(), i = Vf;
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
		let [r, i] = Rf(t, n), a = e.decode(i);
		if (a.version === 0 && t[0] !== "Q") throw Error("Version 0 CID string must not include multibase prefix");
		return If(a).set(r, t), a;
	}
};
function Rf(e, t) {
	switch (e[0]) {
		case "Q": {
			let n = t ?? sf;
			return [sf.prefix, n.decode(`${sf.prefix}${e}`)];
		}
		case sf.prefix: {
			let n = t ?? sf;
			return [sf.prefix, n.decode(e)];
		}
		case af.prefix: {
			let n = t ?? af;
			return [af.prefix, n.decode(e)];
		}
		case of.prefix: {
			let n = t ?? of;
			return [of.prefix, n.decode(e)];
		}
		default:
			if (t == null) throw Error("To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided");
			return [e[0], t.decode(e)];
	}
}
function zf(e, t, n) {
	let { prefix: r } = n;
	if (r !== sf.prefix) throw Error(`Cannot string encode V0 in ${n.name} encoding`);
	let i = t.get(r);
	if (i == null) {
		let i = n.encode(e).slice(1);
		return t.set(r, i), i;
	}
	return i;
}
function Bf(e, t, n) {
	let { prefix: r } = n, i = t.get(r);
	if (i == null) {
		let i = n.encode(e);
		return t.set(r, i), i;
	}
	return i;
}
var Vf = 112, Hf = 18;
function Uf(e, t, n) {
	let r = kf(e), i = r + kf(t), a = new Uint8Array(i + n.byteLength);
	return Of(e, a, 0), Of(t, a, r), a.set(n, i), a;
}
var Wf = Symbol.for("@ipld/js-cid/CID"), Gf = R({
	$type: z("blob"),
	ref: Tu.cid,
	mimeType: I(),
	size: L()
}).strict(), Kf = Hs([Gf, R({
	cid: I(),
	mimeType: I()
}).strict()]), qf = class e {
	constructor(e, t, n, r) {
		this.ref = e, this.mimeType = t, this.size = n, this.original = r ?? {
			$type: "blob",
			ref: e,
			mimeType: t,
			size: n
		};
	}
	static asBlobRef(t) {
		return Ys(t, Kf) ? e.fromJsonRef(t) : null;
	}
	static fromJsonRef(t) {
		return Ys(t, Gf) ? new e(t.ref, t.mimeType, t.size) : new e(Lf.parse(t.cid), t.mimeType, -1, t);
	}
	ipld() {
		return this.original;
	}
	toJSON() {
		return Cu(this.ipld());
	}
};
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/blob.js
function Jf(e, t, n, r) {
	return !r || !(r instanceof qf) ? {
		success: !1,
		error: new H(`${t} should be a blob ref`)
	} : {
		success: !0,
		value: r
	};
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/formats.js
var Yf = op(Ju, "must be an valid atproto datetime (both RFC-3339 and ISO-8601)"), Xf = op(ad, "must be a uri"), Zf = op(zu, "must be a valid at-uri"), Qf = op(Du, "must be a valid did"), $f = op(ku, "must be a valid handle"), ep = op(Au, "must be a valid did or a handle"), tp = op(Mu, "must be a valid nsid"), np = op(sp, "must be a cid string"), rp = op(td, "must be a well-formed BCP 47 language tag"), ip = op(id, "must be a valid TID"), ap = op(Ru, "must be a valid Record Key");
function op(e, t) {
	return (n, r) => e(r) ? {
		success: !0,
		value: r
	} : {
		success: !1,
		error: new H(`${n} ${t}`)
	};
}
function sp(e) {
	try {
		return Lf.parse(e), !0;
	} catch {
		return !1;
	}
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/primitives.js
function cp(e, t, n, r) {
	switch (n.type) {
		case "boolean": return lp(e, t, n, r);
		case "integer": return up(e, t, n, r);
		case "string": return dp(e, t, n, r);
		case "bytes": return fp(e, t, n, r);
		case "cid-link": return pp(e, t, n, r);
		case "unknown": return mp(e, t, n, r);
		default: return {
			success: !1,
			error: new H(`Unexpected lexicon type: ${n.type}`)
		};
	}
}
function lp(e, t, n, r) {
	n = n;
	let i = typeof r;
	return i === "undefined" ? typeof n.default == "boolean" ? {
		success: !0,
		value: n.default
	} : {
		success: !1,
		error: new H(`${t} must be a boolean`)
	} : i === "boolean" ? typeof n.const == "boolean" && r !== n.const ? {
		success: !1,
		error: new H(`${t} must be ${n.const}`)
	} : {
		success: !0,
		value: r
	} : {
		success: !1,
		error: new H(`${t} must be a boolean`)
	};
}
function up(e, t, n, r) {
	return n = n, r === void 0 ? typeof n.default == "number" ? {
		success: !0,
		value: n.default
	} : {
		success: !1,
		error: new H(`${t} must be an integer`)
	} : Number.isInteger(r) ? typeof n.const == "number" && r !== n.const ? {
		success: !1,
		error: new H(`${t} must be ${n.const}`)
	} : Array.isArray(n.enum) && !n.enum.includes(r) ? {
		success: !1,
		error: new H(`${t} must be one of (${n.enum.join("|")})`)
	} : typeof n.maximum == "number" && r > n.maximum ? {
		success: !1,
		error: new H(`${t} can not be greater than ${n.maximum}`)
	} : typeof n.minimum == "number" && r < n.minimum ? {
		success: !1,
		error: new H(`${t} can not be less than ${n.minimum}`)
	} : {
		success: !0,
		value: r
	} : {
		success: !1,
		error: new H(`${t} must be an integer`)
	};
}
function dp(e, t, n, r) {
	if (n = n, r === void 0) return typeof n.default == "string" ? {
		success: !0,
		value: n.default
	} : {
		success: !1,
		error: new H(`${t} must be a string`)
	};
	if (typeof r != "string") return {
		success: !1,
		error: new H(`${t} must be a string`)
	};
	if (typeof n.const == "string" && r !== n.const) return {
		success: !1,
		error: new H(`${t} must be ${n.const}`)
	};
	if (Array.isArray(n.enum) && !n.enum.includes(r)) return {
		success: !1,
		error: new H(`${t} must be one of (${n.enum.join("|")})`)
	};
	if (typeof n.minLength == "number" || typeof n.maxLength == "number") {
		if (typeof n.minLength == "number" && r.length * 3 < n.minLength) return {
			success: !1,
			error: new H(`${t} must not be shorter than ${n.minLength} characters`)
		};
		let e = !1;
		if (n.minLength === void 0 && typeof n.maxLength == "number" && r.length * 3 <= n.maxLength && (e = !0), !e) {
			let e = sd(r);
			if (typeof n.maxLength == "number" && e > n.maxLength) return {
				success: !1,
				error: new H(`${t} must not be longer than ${n.maxLength} characters`)
			};
			if (typeof n.minLength == "number" && e < n.minLength) return {
				success: !1,
				error: new H(`${t} must not be shorter than ${n.minLength} characters`)
			};
		}
	}
	if (typeof n.maxGraphemes == "number" || typeof n.minGraphemes == "number") {
		let e = !1, i = !1;
		if (typeof n.maxGraphemes == "number" && (e = !(r.length <= n.maxGraphemes)), typeof n.minGraphemes == "number") {
			if (r.length < n.minGraphemes) return {
				success: !1,
				error: new H(`${t} must not be shorter than ${n.minGraphemes} graphemes`)
			};
			i = !0;
		}
		if (e || i) {
			let e = od(r);
			if (typeof n.maxGraphemes == "number" && e > n.maxGraphemes) return {
				success: !1,
				error: new H(`${t} must not be longer than ${n.maxGraphemes} graphemes`)
			};
			if (typeof n.minGraphemes == "number" && e < n.minGraphemes) return {
				success: !1,
				error: new H(`${t} must not be shorter than ${n.minGraphemes} graphemes`)
			};
		}
	}
	if (typeof n.format == "string") switch (n.format) {
		case "datetime": return Yf(t, r);
		case "uri": return Xf(t, r);
		case "at-uri": return Zf(t, r);
		case "did": return Qf(t, r);
		case "handle": return $f(t, r);
		case "at-identifier": return ep(t, r);
		case "nsid": return tp(t, r);
		case "cid": return np(t, r);
		case "language": return rp(t, r);
		case "tid": return ip(t, r);
		case "record-key": return ap(t, r);
	}
	return {
		success: !0,
		value: r
	};
}
function fp(e, t, n, r) {
	return n = n, !r || !(r instanceof Uint8Array) ? {
		success: !1,
		error: new H(`${t} must be a byte array`)
	} : typeof n.maxLength == "number" && r.byteLength > n.maxLength ? {
		success: !1,
		error: new H(`${t} must not be larger than ${n.maxLength} bytes`)
	} : typeof n.minLength == "number" && r.byteLength < n.minLength ? {
		success: !1,
		error: new H(`${t} must not be smaller than ${n.minLength} bytes`)
	} : {
		success: !0,
		value: r
	};
}
function pp(e, t, n, r) {
	return Lf.asCID(r) === null ? {
		success: !1,
		error: new H(`${t} must be a CID`)
	} : {
		success: !0,
		value: r
	};
}
function mp(e, t, n, r) {
	return !r || typeof r != "object" ? {
		success: !1,
		error: new H(`${t} must be an object`)
	} : {
		success: !0,
		value: r
	};
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/complex.js
function hp(e, t, n, r) {
	switch (n.type) {
		case "object": return _p(e, t, n, r);
		case "array": return gp(e, t, n, r);
		case "blob": return Jf(e, t, n, r);
		default: return cp(e, t, n, r);
	}
}
function gp(e, t, n, r) {
	if (!Array.isArray(r)) return {
		success: !1,
		error: new H(`${t} must be an array`)
	};
	if (typeof n.maxLength == "number" && r.length > n.maxLength) return {
		success: !1,
		error: new H(`${t} must not have more than ${n.maxLength} elements`)
	};
	if (typeof n.minLength == "number" && r.length < n.minLength) return {
		success: !1,
		error: new H(`${t} must not have fewer than ${n.minLength} elements`)
	};
	let i = n.items;
	for (let n = 0; n < r.length; n++) {
		let a = r[n], o = vp(e, `${t}/${n}`, i, a);
		if (!o.success) return o;
	}
	return {
		success: !0,
		value: r
	};
}
function _p(e, t, n, r) {
	if (!zd(r)) return {
		success: !1,
		error: new H(`${t} must be an object`)
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
		let c = vp(e, `${t}/${a}`, s, o), l = c.success ? c.value : o;
		if (l === void 0) {
			if (n.required?.includes(a)) return {
				success: !1,
				error: new H(`${t} must have the property "${a}"`)
			};
		} else if (!c.success) return c;
		l !== o && (i === r && (i = { ...r }), i[a] = l);
	}
	return {
		success: !0,
		value: i
	};
}
function vp(e, t, n, r, i = !1) {
	let a;
	if (n.type === "union") {
		if (!Bd(r)) return {
			success: !1,
			error: new H(`${t} must be an object which includes the "$type" property`)
		};
		if (yp(n.refs, r.$type)) a = e.getDefOrThrow(r.$type);
		else return n.closed ? {
			success: !1,
			error: new H(`${t} $type must be one of ${n.refs.join(", ")}`)
		} : {
			success: !0,
			value: r
		};
	} else a = n.type === "ref" ? e.getDefOrThrow(n.ref) : n;
	return i ? _p(e, t, a, r) : hp(e, t, a, r);
}
var yp = (e, t) => {
	let n = V(t);
	return e.includes(n) ? !0 : n.endsWith("#main") ? e.includes(n.slice(0, -5)) : !n.includes("#") && e.includes(`${n}#main`);
};
//#endregion
//#region node_modules/@atproto/lexicon/dist/validators/xrpc.js
function bp(e, t, n, r) {
	let i = zd(r) ? r : {}, a = new Set(n.required ?? []), o = i;
	if (typeof n.properties == "object") for (let r in n.properties) {
		let s = n.properties[r], c = s.type === "array" ? gp(e, r, s, i[r]) : cp(e, r, s, i[r]), l = c.success ? c.value : i[r], u = l === void 0;
		if (u && a.has(r)) return {
			success: !1,
			error: new H(`${t} must have the property "${r}"`)
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
function xp(e, t, n) {
	let r = _p(e, "Record", t.record, n);
	if (!r.success) throw r.error;
	return r.value;
}
function Sp(e, t, n) {
	if (t.parameters) {
		let r = bp(e, "Params", t.parameters, n);
		if (!r.success) throw r.error;
		return r.value;
	}
}
function Cp(e, t, n) {
	if (t.input?.schema) return Ep(e, "Input", t.input.schema, n, !0);
}
function wp(e, t, n) {
	if (t.output?.schema) return Ep(e, "Output", t.output.schema, n, !0);
}
function Tp(e, t, n) {
	if (t.message?.schema) return Ep(e, "Message", t.message.schema, n, !0);
}
function Ep(e, t, n, r, i = !1) {
	let a = vp(e, t, n, r, i);
	if (!a.success) throw a.error;
	return a.value;
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/lexicons.js
var Dp = class {
	constructor(e) {
		if (this.docs = /* @__PURE__ */ new Map(), this.defs = /* @__PURE__ */ new Map(), e) for (let t of e) this.add(t);
	}
	[Symbol.iterator]() {
		return this.docs.values();
	}
	add(e) {
		let t = V(e.id);
		if (this.docs.has(t)) throw Error(`${t} has already been registered`);
		kp(e, t), this.docs.set(t, e);
		for (let [t, n] of Op(e)) this.defs.set(t, n);
	}
	remove(e) {
		e = V(e);
		let t = this.docs.get(e);
		if (!t) throw Error(`Unable to remove "${e}": does not exist`);
		for (let [e, n] of Op(t)) this.defs.delete(e);
		this.docs.delete(e);
	}
	get(e) {
		return e = V(e), this.docs.get(e);
	}
	getDef(e) {
		return e = V(e), this.defs.get(e);
	}
	getDefOrThrow(e, t) {
		let n = this.getDef(e);
		if (!n) throw new Hd(`Lexicon not found: ${e}`);
		if (t && !t.includes(n.type)) throw new Vd(`Not a ${t.join(" or ")} lexicon: ${e}`);
		return n;
	}
	validate(e, t) {
		if (!zd(t)) throw new H("Value must be an object");
		let n = V(e), r = this.getDefOrThrow(n, ["record", "object"]);
		if (r.type === "record") return _p(this, "Record", r.record, t);
		if (r.type === "object") return _p(this, "Object", r, t);
		throw new Vd("Definition must be a record or object");
	}
	assertValidRecord(e, t) {
		if (!zd(t)) throw new H("Record must be an object");
		if (!("$type" in t)) throw new H("Record/$type must be a string");
		let { $type: n } = t;
		if (typeof n != "string") throw new H("Record/$type must be a string");
		let r = V(e);
		if (V(n) !== r) throw new H(`Invalid $type: must be ${r}, got ${n}`);
		let i = this.getDefOrThrow(r, ["record"]);
		return xp(this, i, t);
	}
	assertValidXrpcParams(e, t) {
		e = V(e);
		let n = this.getDefOrThrow(e, [
			"query",
			"procedure",
			"subscription"
		]);
		return Sp(this, n, t);
	}
	assertValidXrpcInput(e, t) {
		e = V(e);
		let n = this.getDefOrThrow(e, ["procedure"]);
		return Cp(this, n, t);
	}
	assertValidXrpcOutput(e, t) {
		e = V(e);
		let n = this.getDefOrThrow(e, ["query", "procedure"]);
		return wp(this, n, t);
	}
	assertValidXrpcMessage(e, t) {
		e = V(e);
		let n = this.getDefOrThrow(e, ["subscription"]);
		return Tp(this, n, t);
	}
	resolveLexUri(e, t) {
		return e = V(e), V(t, e);
	}
};
function* Op(e) {
	for (let t in e.defs) yield [`lex:${e.id}#${t}`, e.defs[t]], t === "main" && (yield [`lex:${e.id}`, e.defs[t]]);
}
function kp(e, t) {
	for (let n in e) e.type === "ref" ? e.ref = V(e.ref, t) : e.type === "union" ? e.refs = e.refs.map((e) => V(e, t)) : Array.isArray(e[n]) ? e[n] = e[n].map((e) => typeof e == "string" ? e.startsWith("#") ? V(e, t) : e : e && typeof e == "object" ? kp(e, t) : e) : e[n] && typeof e[n] == "object" && (e[n] = kp(e[n], t));
	return e;
}
//#endregion
//#region node_modules/@atproto/lexicon/dist/serialize.js
var Ap = (e) => {
	if (Array.isArray(e)) return e.map((e) => Ap(e));
	if (e && typeof e == "object") {
		if (e instanceof qf) return e.original;
		if (Lf.asCID(e) || e instanceof Uint8Array) return e;
		let t = {};
		for (let n of Object.keys(e)) t[n] = Ap(e[n]);
		return t;
	}
	return e;
}, jp = (e) => {
	if (Array.isArray(e)) return e.map((e) => jp(e));
	if (e && typeof e == "object") {
		let t = e;
		if ((t.$type === "blob" || typeof t.cid == "string" && typeof t.mimeType == "string") && Ys(t, Kf)) return qf.fromJsonRef(t);
		if (Lf.asCID(e) || e instanceof Uint8Array) return e;
		let n = {};
		for (let e of Object.keys(t)) n[e] = jp(t[e]);
		return n;
	}
	return e;
}, Mp = (e) => Cu(Ap(e)), Np = (e) => jp(Su(e));
//#endregion
//#region src/core/freeze.ts
function Pp(e) {
	let t = structuredClone(e);
	function n(e) {
		e && typeof e == "object" && (Object.values(e).forEach(n), Object.freeze(e));
	}
	return n(t), t;
}
var Fp = {
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
}, Ip = "ai.generalbusiness.atseq", U = Pp({
	genesis: `${Ip}.genesis`,
	head: `${Ip}.head`,
	entry: `${Ip}.entry`,
	definition: `${Ip}.definition`,
	epoch: `${Ip}.epoch`,
	epochCurrent: `${Ip}.epochCurrent`,
	grant: `${Ip}.grant`,
	revoke: `${Ip}.revoke`,
	file: `${Ip}.file`,
	content: `${Ip}.content`,
	defs: `${Ip}.defs`
}), W = (e) => `ai.generalbusiness.atseq.defs#${e}`, G = (e, t) => ({
	type: "string",
	maxLength: e,
	...t ? { format: t } : {}
}), Lp = (e, t = 0) => ({
	type: "integer",
	minimum: t,
	maximum: e
}), K = { type: "cid-link" }, q = G(2048, "did"), Rp = G(128, "did"), zp = { type: "boolean" }, Bp = (e, t = e) => ({
	type: "bytes",
	minLength: t,
	maxLength: e
}), Vp = (e) => ({
	type: "ref",
	ref: W(e)
}), Hp = (e, t, n = 0) => ({
	type: "array",
	items: e,
	maxLength: t,
	minLength: n
}), J = (e, t = []) => ({
	type: "object",
	required: Object.keys(e),
	...t.length ? { nullable: t } : {},
	properties: e
}), Up = (...e) => ({
	type: "union",
	closed: !0,
	refs: e.map(W)
}), Wp = J({
	principal: q,
	actorKey: Rp
}), Gp = G(26), Kp = G(64), qp = J({
	action: G(300),
	execution: K
}), Jp = J({
	principal: q,
	actorKey: Rp,
	powers: Hp({
		type: "string",
		enum: [
			"certify",
			"govern",
			"recover"
		]
	}, 3, 1)
}), Yp = {
	position: Lp(2 ** 53 - 1, 1),
	prev: K,
	controlTip: K
}, Xp = {
	grant: J({
		id: Gp,
		cid: K
	}),
	epoch: K
}, Zp = Up("plcAudit", "webDocument"), Qp = J({
	signingKeyDid: Rp,
	pdsOrigin: G(2048, "uri")
}), $p = {
	path: J({
		collection: G(317, "nsid"),
		rkey: G(512, "record-key")
	}),
	act: J({
		...Xp,
		action: G(300),
		execution: K,
		payload: { type: "unknown" }
	}),
	assignRole: J({
		...Xp,
		target: q,
		role: Kp,
		enabled: zp,
		expectedAssignment: K
	}, ["expectedAssignment"]),
	setControl: J({
		...Yp,
		control: Hp(Jp, 16)
	}),
	setRecovery: J({
		...Yp,
		recovery: Hp(Wp, 16, 1)
	}),
	setOwner: J({
		...Yp,
		owner: q
	}, ["owner"]),
	setRole: J({
		...Yp,
		target: q,
		role: Kp,
		enabled: zp,
		expectedAssignment: K
	}, ["expectedAssignment"]),
	activate: J({
		...Yp,
		expected: K,
		definition: K,
		closure: Hp(G(128, "cid"), 64, 1)
	}),
	recoverParticipant: J({
		...Yp,
		target: q,
		expectedEpoch: K,
		expectedObservation: K,
		epoch: K,
		observation: K
	}, ["expectedEpoch", "expectedObservation"]),
	recoverGovernance: J({
		...Yp,
		governance: Hp(Wp, 16)
	}),
	intent: J({
		version: {
			type: "integer",
			const: 2
		},
		app: q,
		genesis: K,
		principal: q,
		actorKey: Rp,
		nonce: Bp(16),
		operation: Up("act", "assignRole", "setControl", "setRecovery", "setOwner", "setRole", "activate", "recoverParticipant", "recoverGovernance")
	}),
	signedRequest: J({
		intent: Vp("intent"),
		sig: Bp(64)
	}),
	admitGrant: J({ grant: J({
		id: Gp,
		cid: K
	}) }),
	advanceEpoch: J({ epoch: K }),
	revokeGrant: J({ revoke: J({
		id: Gp,
		cid: K
	}) }),
	accountOperation: J({
		app: q,
		genesis: K,
		position: Lp(2 ** 53 - 1, 1),
		prev: K,
		principal: q,
		expectedEpoch: K,
		expectedObservation: K,
		operation: Up("admitGrant", "advanceEpoch", "revokeGrant"),
		observation: K
	}, ["expectedEpoch", "expectedObservation"]),
	receipt: J({
		version: {
			type: "integer",
			const: 2
		},
		app: q,
		genesis: K,
		request: K,
		position: Lp(2 ** 53 - 1, 1),
		entry: K,
		publication: J({
			root: K,
			binding: K,
			proofs: Hp(K, 16, 1),
			head: K
		}, ["head"])
	}),
	byteChunk: J({ bytes: Bp(32768, 1) }),
	byteManifest: J({
		byteLength: Lp(33554432),
		chunks: Hp(K, 1024)
	}),
	observationPolicy: J({
		algorithm: {
			type: "string",
			const: "atseq-account-observation-v1"
		},
		plcDirectory: G(2048, "uri"),
		allowWeb: zp,
		checkpoint: {
			type: "string",
			const: "native-publication-v1"
		}
	}),
	plcAudit: J({
		bytes: K,
		source: G(2048, "uri"),
		selectedTip: K
	}),
	webDocument: J({
		bytes: K,
		source: G(2048, "uri")
	}),
	observation: J({
		policy: K,
		principal: q,
		context: J({
			app: q,
			genesis: K,
			position: Lp(2 ** 53 - 1, 1),
			prev: K,
			subject: K
		}),
		binding: Qp,
		before: Zp,
		after: Zp,
		repositoryRoot: K,
		records: Hp(J({
			path: G(1024),
			cid: K
		}), 16, 1),
		proofs: Hp(K, 16, 1),
		observedAt: G(24, "datetime")
	}),
	appBinding: J({
		policy: K,
		principal: q,
		binding: Qp,
		before: Zp,
		after: Zp,
		repositoryRoot: K
	}),
	openParticipation: J({}),
	requiredRole: J({ role: Kp }),
	actionContract: J({
		semantics: K,
		schemas: J({
			stateRoot: G(300),
			actionRoot: G(300),
			closure: K
		}),
		fold: G(128, "cid"),
		authorization: Up("openParticipation", "requiredRole")
	})
}, em = (e, t, n = [], r) => ({
	lexicon: 1,
	id: `${Ip}.${e}`,
	defs: { main: {
		type: "record",
		key: r ? `literal:${r}` : "any",
		record: J({
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
}), tm = {
	app: q,
	genesis: K
}, nm = structuredClone(Fp);
nm.defs.main = {
	type: "record",
	key: "any",
	record: nm.defs.main
}, nm.defs.main.record.properties.version.const = 2, nm.defs.action.required.push("authorization"), nm.defs.action.properties.authorization = Up("openParticipation", "requiredRole");
var rm = Pp([
	{
		lexicon: 1,
		id: U.defs,
		defs: $p
	},
	em("genesis", {
		app: q,
		creation: Bp(16),
		semantics: K,
		definition: K,
		observationPolicy: K,
		control: Hp(Jp, 16),
		recoverGovernance: zp,
		owner: q,
		roles: Hp(J({
			principal: q,
			role: Kp
		}), 63)
	}, ["owner"]),
	em("head", {
		...tm,
		position: Lp(2 ** 53 - 1),
		entry: K
	}),
	em("entry", {
		...tm,
		position: Lp(2 ** 53 - 1, 1),
		prev: K,
		request: Up("signedRequest", "accountOperation")
	}),
	em("epoch", {
		id: Bp(16),
		previous: K
	}, ["previous"]),
	em("epochCurrent", {
		epoch: K,
		id: Bp(16)
	}, [], "self"),
	em("grant", {
		id: Gp,
		...tm,
		epoch: K,
		actorKey: Rp,
		actions: Hp(qp, 63),
		assignRoles: Hp(Kp, 63)
	}),
	em("revoke", {
		id: Gp,
		...tm
	}),
	em("file", {
		cid: G(128, "cid"),
		bytes: K
	}),
	em("content", { body: Up("byteChunk", "byteManifest", "observationPolicy", "observation", "appBinding", "actionContract") }),
	nm
]), im = new Dp(structuredClone([...rm])), am = new Set(Object.keys($p).map(W)), om = (e) => e.replace(/^lex:/, "");
function sm(e) {
	if (typeof e != "string" || e.length > 2048 || !(0, Js.isAtprotoDid)(e) || e.startsWith("did:web:") && /%3a/i.test(e)) throw new m("envelope", "Expected PLC or hostname-only web account DID");
}
function cm(e, t) {
	let n = Ra(t);
	function r(e, t, n) {
		if (!e) throw new m("envelope", "Unknown native schema");
		if (e.type === "string" && e.format === "did" && e.maxLength === 2048 && sm(t), e.type === "record") return r(e.record, t, n);
		if (e.type === "ref") {
			let i = om(e.ref);
			return r(im.getDef(e.ref), t, n ?? (am.has(i) ? i : void 0));
		}
		if (e.type === "union") {
			if (!t || !e.refs.map(om).includes(t.$type)) throw new m("envelope", "Unknown native union member");
			return r(im.getDef(t.$type), t, t.$type);
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
	r(im.getDef(e), t, e);
	let i = im.validate(e, Np(t));
	if (!i.success) throw new m("envelope", i.error.message);
	if (!Pa(n, Ra(Mp(i.value)))) throw new m("envelope", "Native validation changed content");
}
//#endregion
//#region src/protocol/native-outcome.ts
var lm = Object.freeze(/* @__PURE__ */ "authority_stale.authority_unchanged.control_context_stale.control_map_limit.control_power.control_tip_stale.control_unappointed.control_unchanged.definition_changed.epoch_conflict.epoch_reused.execution_changed.grant_conflict.grant_epoch.grant_revoked.grant_scope.grant_signer.grant_unadmitted.incompatible_definition.invalid_action.invalid_activation.observation_conflict.observation_rollback.recovery_epoch_reused.role_missing.role_owner.role_scope.role_stale.role_unchanged.unknown_action".split(".")), um = Object.freeze([
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
]), dm = /* @__PURE__ */ new Set([...lm, ...um.map((e) => `fold_failed/${e}`)]);
function fm(e) {
	throw new m("envelope", e);
}
function pm(e, t) {
	(!e || typeof e != "object" || Array.isArray(e) || Object.keys(e).length !== t.length || t.some((t) => !Object.hasOwn(e, t))) && fm("Unknown or missing outcome fields");
}
function mm(e) {
	let t = JSON.parse(y(e, 131072, 32));
	return t?.decision === "effective" ? pm(t, ["decision"]) : t?.decision === "ineffective" && t.source === "framework" ? (pm(t, [
		"decision",
		"source",
		"reason"
	]), (typeof t.reason != "string" || !dm.has(t.reason)) && fm("Unsupported framework outcome reason")) : t?.decision === "ineffective" && t.source === "fold" ? (pm(t, Object.hasOwn(t, "message") ? [
		"decision",
		"source",
		"reason",
		"message"
	] : [
		"decision",
		"source",
		"reason"
	]), (typeof t.reason != "string" || !/^[a-z][a-z0-9_]{0,63}$/.test(t.reason)) && fm("Invalid authored fold reason"), Object.hasOwn(t, "message") && (typeof t.message != "string" || !t.message.isWellFormed() || [...t.message].length > 1024 || new TextEncoder().encode(t.message).length > 4096) && fm("Invalid authored fold message")) : fm("Unsupported outcome branch"), t;
}
//#endregion
//#region node_modules/jsonc-parser/lib/esm/impl/scanner.js
function hm(e, t = !1) {
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
		else for (r++; r < e.length && vm(e.charCodeAt(r));) r++;
		if (r < e.length && e.charCodeAt(r) === 46) {
			if (r++, r < e.length && vm(e.charCodeAt(r))) for (r++; r < e.length && vm(e.charCodeAt(r));) r++;
			else return d = 3, e.substring(t, r);
		}
		let n = r;
		if (r < e.length && (e.charCodeAt(r) === 69 || e.charCodeAt(r) === 101)) {
			if (r++, (r < e.length && e.charCodeAt(r) === 43 || e.charCodeAt(r) === 45) && r++, r < e.length && vm(e.charCodeAt(r))) {
				for (r++; r < e.length && vm(e.charCodeAt(r));) r++;
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
				if (_m(a)) {
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
		if (gm(t)) {
			do
				r++, i += String.fromCharCode(t), t = e.charCodeAt(r);
			while (gm(t));
			return o = 15;
		}
		if (_m(t)) return r++, i += String.fromCharCode(t), t === 13 && e.charCodeAt(r) === 10 && (r++, i += "\n"), s++, l = r, o = 14;
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
					for (r += 2; r < n && !_m(e.charCodeAt(r));) r++;
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
						r++, _m(t) && (t === 13 && e.charCodeAt(r) === 10 && r++, s++, l = r);
					}
					return a || (r++, d = 1), i = e.substring(c, r), o = 13;
				}
				return i += String.fromCharCode(t), r++, o = 16;
			case 45: if (i += String.fromCharCode(t), r++, r === n || !vm(e.charCodeAt(r))) return o = 16;
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
		if (gm(e) || _m(e)) return !1;
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
function gm(e) {
	return e === 32 || e === 9;
}
function _m(e) {
	return e === 10 || e === 13;
}
function vm(e) {
	return e >= 48 && e <= 57;
}
var ym;
(function(e) {
	e[e.lineFeed = 10] = "lineFeed", e[e.carriageReturn = 13] = "carriageReturn", e[e.space = 32] = "space", e[e._0 = 48] = "_0", e[e._1 = 49] = "_1", e[e._2 = 50] = "_2", e[e._3 = 51] = "_3", e[e._4 = 52] = "_4", e[e._5 = 53] = "_5", e[e._6 = 54] = "_6", e[e._7 = 55] = "_7", e[e._8 = 56] = "_8", e[e._9 = 57] = "_9", e[e.a = 97] = "a", e[e.b = 98] = "b", e[e.c = 99] = "c", e[e.d = 100] = "d", e[e.e = 101] = "e", e[e.f = 102] = "f", e[e.g = 103] = "g", e[e.h = 104] = "h", e[e.i = 105] = "i", e[e.j = 106] = "j", e[e.k = 107] = "k", e[e.l = 108] = "l", e[e.m = 109] = "m", e[e.n = 110] = "n", e[e.o = 111] = "o", e[e.p = 112] = "p", e[e.q = 113] = "q", e[e.r = 114] = "r", e[e.s = 115] = "s", e[e.t = 116] = "t", e[e.u = 117] = "u", e[e.v = 118] = "v", e[e.w = 119] = "w", e[e.x = 120] = "x", e[e.y = 121] = "y", e[e.z = 122] = "z", e[e.A = 65] = "A", e[e.B = 66] = "B", e[e.C = 67] = "C", e[e.D = 68] = "D", e[e.E = 69] = "E", e[e.F = 70] = "F", e[e.G = 71] = "G", e[e.H = 72] = "H", e[e.I = 73] = "I", e[e.J = 74] = "J", e[e.K = 75] = "K", e[e.L = 76] = "L", e[e.M = 77] = "M", e[e.N = 78] = "N", e[e.O = 79] = "O", e[e.P = 80] = "P", e[e.Q = 81] = "Q", e[e.R = 82] = "R", e[e.S = 83] = "S", e[e.T = 84] = "T", e[e.U = 85] = "U", e[e.V = 86] = "V", e[e.W = 87] = "W", e[e.X = 88] = "X", e[e.Y = 89] = "Y", e[e.Z = 90] = "Z", e[e.asterisk = 42] = "asterisk", e[e.backslash = 92] = "backslash", e[e.closeBrace = 125] = "closeBrace", e[e.closeBracket = 93] = "closeBracket", e[e.colon = 58] = "colon", e[e.comma = 44] = "comma", e[e.dot = 46] = "dot", e[e.doubleQuote = 34] = "doubleQuote", e[e.minus = 45] = "minus", e[e.openBrace = 123] = "openBrace", e[e.openBracket = 91] = "openBracket", e[e.plus = 43] = "plus", e[e.slash = 47] = "slash", e[e.formFeed = 12] = "formFeed", e[e.tab = 9] = "tab";
})(ym ||= {}), Array(20).fill(0).map((e, t) => " ".repeat(t));
var bm = 200;
Array(bm).fill(0).map((e, t) => "\n" + " ".repeat(t)), Array(bm).fill(0).map((e, t) => "\r" + " ".repeat(t)), Array(bm).fill(0).map((e, t) => "\r\n" + " ".repeat(t)), Array(bm).fill(0).map((e, t) => "\n" + "	".repeat(t)), Array(bm).fill(0).map((e, t) => "\r" + "	".repeat(t)), Array(bm).fill(0).map((e, t) => "\r\n" + "	".repeat(t));
//#endregion
//#region node_modules/jsonc-parser/lib/esm/impl/parser.js
var xm;
(function(e) {
	e.DEFAULT = { allowTrailingComma: !1 };
})(xm ||= {});
function Sm(e, t, n = xm.DEFAULT) {
	let r = hm(e, !1), i = [], a = 0;
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
	function b() {
		for (;;) {
			let e = r.scan();
			switch (r.getTokenError()) {
				case 4:
					x(14);
					break;
				case 5:
					x(15);
					break;
				case 3:
					x(13);
					break;
				case 1:
					ee || x(11);
					break;
				case 2:
					x(12);
					break;
				case 6: x(16);
			}
			switch (e) {
				case 12:
				case 13:
					ee ? x(10) : v();
					break;
				case 16:
					x(1);
					break;
				case 15:
				case 14: break;
				default: return e;
			}
		}
	}
	function x(e, t = [], n = []) {
		if (y(e), t.length + n.length > 0) {
			let e = r.getToken();
			for (; e !== 17;) {
				if (t.indexOf(e) !== -1) {
					b();
					break;
				}
				if (n.indexOf(e) !== -1) break;
				e = b();
			}
		}
	}
	function ne(e) {
		let t = r.getTokenValue();
		return e ? g(t) : (f(t), i.push(t)), b(), !0;
	}
	function re() {
		switch (r.getToken()) {
			case 11:
				let e = r.getTokenValue(), t = Number(e);
				isNaN(t) && (x(2), t = 0), g(t);
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
		return b(), !0;
	}
	function ie() {
		return r.getToken() === 10 ? (ne(!1), r.getToken() === 6 ? (_(":"), b(), se() || x(4, [], [2, 5])) : x(5, [], [2, 5]), i.pop(), !0) : (x(3, [], [2, 5]), !1);
	}
	function ae() {
		d(), b();
		let e = !1;
		for (; r.getToken() !== 2 && r.getToken() !== 17;) {
			if (r.getToken() === 5) {
				if (e || x(4, [], []), _(","), b(), r.getToken() === 2 && te) break;
			} else e && x(6, [], []);
			ie() || x(4, [], [2, 5]), e = !0;
		}
		return p(), r.getToken() === 2 ? b() : x(7, [2], []), !0;
	}
	function oe() {
		m(), b();
		let e = !0, t = !1;
		for (; r.getToken() !== 4 && r.getToken() !== 17;) {
			if (r.getToken() === 5) {
				if (t || x(4, [], []), _(","), b(), r.getToken() === 4 && te) break;
			} else t && x(6, [], []);
			e ? (i.push(0), e = !1) : i[i.length - 1]++, se() || x(4, [], [4, 5]), t = !0;
		}
		return h(), e || i.pop(), r.getToken() === 4 ? b() : x(8, [4], []), !0;
	}
	function se() {
		switch (r.getToken()) {
			case 3: return oe();
			case 1: return ae();
			case 10: return ne(!0);
			default: return re();
		}
	}
	return b(), r.getToken() === 17 ? n.allowEmptyContent ? !0 : (x(4, [], []), !1) : se() ? (r.getToken() !== 17 && x(9, [], []), !0) : (x(4, [], []), !1);
}
//#endregion
//#region node_modules/jsonc-parser/lib/esm/main.js
var Cm;
(function(e) {
	e[e.None = 0] = "None", e[e.UnexpectedEndOfComment = 1] = "UnexpectedEndOfComment", e[e.UnexpectedEndOfString = 2] = "UnexpectedEndOfString", e[e.UnexpectedEndOfNumber = 3] = "UnexpectedEndOfNumber", e[e.InvalidUnicode = 4] = "InvalidUnicode", e[e.InvalidEscapeCharacter = 5] = "InvalidEscapeCharacter", e[e.InvalidCharacter = 6] = "InvalidCharacter";
})(Cm ||= {});
var wm;
(function(e) {
	e[e.OpenBraceToken = 1] = "OpenBraceToken", e[e.CloseBraceToken = 2] = "CloseBraceToken", e[e.OpenBracketToken = 3] = "OpenBracketToken", e[e.CloseBracketToken = 4] = "CloseBracketToken", e[e.CommaToken = 5] = "CommaToken", e[e.ColonToken = 6] = "ColonToken", e[e.NullKeyword = 7] = "NullKeyword", e[e.TrueKeyword = 8] = "TrueKeyword", e[e.FalseKeyword = 9] = "FalseKeyword", e[e.StringLiteral = 10] = "StringLiteral", e[e.NumericLiteral = 11] = "NumericLiteral", e[e.LineCommentTrivia = 12] = "LineCommentTrivia", e[e.BlockCommentTrivia = 13] = "BlockCommentTrivia", e[e.LineBreakTrivia = 14] = "LineBreakTrivia", e[e.Trivia = 15] = "Trivia", e[e.Unknown = 16] = "Unknown", e[e.EOF = 17] = "EOF";
})(wm ||= {});
var Tm = Sm, Em;
(function(e) {
	e[e.InvalidSymbol = 1] = "InvalidSymbol", e[e.InvalidNumberFormat = 2] = "InvalidNumberFormat", e[e.PropertyNameExpected = 3] = "PropertyNameExpected", e[e.ValueExpected = 4] = "ValueExpected", e[e.ColonExpected = 5] = "ColonExpected", e[e.CommaExpected = 6] = "CommaExpected", e[e.CloseBraceExpected = 7] = "CloseBraceExpected", e[e.CloseBracketExpected = 8] = "CloseBracketExpected", e[e.EndOfFileExpected = 9] = "EndOfFileExpected", e[e.InvalidCommentToken = 10] = "InvalidCommentToken", e[e.UnexpectedEndOfComment = 11] = "UnexpectedEndOfComment", e[e.UnexpectedEndOfString = 12] = "UnexpectedEndOfString", e[e.UnexpectedEndOfNumber = 13] = "UnexpectedEndOfNumber", e[e.InvalidUnicode = 14] = "InvalidUnicode", e[e.InvalidEscapeCharacter = 15] = "InvalidEscapeCharacter", e[e.InvalidCharacter = 16] = "InvalidCharacter";
})(Em ||= {});
//#endregion
//#region src/protocol/strict-json.ts
var Dm = class extends Error {
	reason;
	constructor(e, t) {
		super(t), this.reason = e, this.name = "StrictJsonError";
	}
};
function Om(e, t) {
	throw new Dm(e, t);
}
function km(e, t, n = 32) {
	(!Number.isSafeInteger(t) || t < 1 || !Number.isSafeInteger(n) || n < 1) && Om("input", "Invalid JSON parsing budget"), e instanceof Uint8Array || Om("input", "Expected retained JSON bytes"), e.length > t && Om("bytes", "JSON exceeds byte budget"), e[0] === 239 && e[1] === 187 && e[2] === 191 && Om("bom", "JSON must not begin with a BOM");
	let r;
	try {
		r = new TextDecoder("utf-8", { fatal: !0 }).decode(e);
	} catch (e) {
		throw e instanceof TypeError && Om("utf8", "JSON is not valid UTF-8"), e;
	}
	let i = [];
	function a(e) {
		i.length >= n && Om("depth", "JSON exceeds nesting budget"), i.push(e);
	}
	Tm(r, {
		onObjectBegin: () => a(/* @__PURE__ */ new Set()),
		onArrayBegin: () => a(null),
		onObjectProperty: (e) => {
			let t = i.at(-1);
			(!t || t.has(e)) && Om("duplicate", "Duplicate decoded JSON property"), t.add(e);
		},
		onObjectEnd: () => {
			i.pop();
		},
		onArrayEnd: () => {
			i.pop();
		},
		onError: () => Om("syntax", "Expected strict JSON")
	}, {
		disallowComments: !0,
		allowTrailingComma: !1,
		allowEmptyContent: !1
	});
	try {
		return JSON.parse(r);
	} catch (e) {
		throw e instanceof SyntaxError && Om("syntax", "Expected strict JSON"), e;
	}
}
//#endregion
//#region node_modules/@noble/secp256k1/index.js
var Am = Object.freeze, jm = 115792089237316195423570985008687907853269984665640564039457584007908834671663n, Mm = 115792089237316195423570985008687907852837564279074904382605163141518161494337n, Nm = 55066263022277343669578718895168534326250603453777594175500187360389116729240n, Pm = 32670510020758816978083085130507043184471273380659243275938904335757337482424n, Fm = Am({
	p: jm,
	n: Mm,
	h: 1n,
	a: 0n,
	b: 7n,
	Gx: Nm,
	Gy: Pm
}), Im = (e) => e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && e.BYTES_PER_ELEMENT === 1, Lm = (e, t, n = "") => {
	if (Im(e) && (t === void 0 || e.length === t)) return e;
	let r = Im(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = (n ? `"${n}" ` : "") + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}, Rm = (e, t) => e.toString(16).padStart(t, "0"), zm = (e) => {
	let t = "";
	for (let n of Lm(e)) t += Rm(n, 2);
	return t;
}, Bm = (e) => {
	let t = "hex invalid";
	if (typeof e != "string") throw TypeError(t);
	if (e.length % 2 || !/^[\da-f]*$/i.test(e)) throw RangeError(t);
	let n = new Uint8Array(e.length / 2);
	for (let t = 0, r = 0; t < n.length; t++, r += 2) {
		let i = e.charCodeAt(r), a = e.charCodeAt(r + 1);
		n[t] = ((i & 15) + (i >> 6) * 9) * 16 + (a & 15) + (a >> 6) * 9;
	}
	return n;
}, Vm = (...e) => {
	let t = 0;
	for (let n of e) t += Lm(n).length;
	let n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(t, r), r += t.length;
	return n;
}, Hm = BigInt, Um = (e, t, n, r = "bad number: out of range") => {
	if (typeof e != "bigint") throw TypeError(r);
	if (t <= e && e < n) return e;
	throw RangeError(r);
}, Y = (e, t = jm) => (e %= t) >= 0n ? e : t + e, Wm = (e, t) => {
	if (e === 0n) throw Error("invert: expected non-zero number");
	if (t <= 1n) throw Error("invert: expected modulus > 1, got " + t);
	let n = Y(e, t), r = t, i = 0n, a = 1n;
	for (; n !== 0n;) {
		let e = r / n, t = r - n * e, o = i - a * e;
		r = n, n = t, i = a, a = o;
	}
	if (r !== 1n) throw Error("invert: does not exist");
	return Y(i, t);
}, Gm = (e) => {
	if (e instanceof eh) return e;
	throw TypeError("Point expected");
}, Km = "bad point: not on curve", qm = (e) => Y(Y(e * e) * e + 7n), Jm = (e) => Um(e, 0n, jm), Ym = (e) => Um(e, 1n, jm), Xm = (e) => Um(e, 1n, Mm), Zm = (e) => !(e & 1n), Qm = (e) => Uint8Array.of(Zm(e) ? 2 : 3), $m = (e) => {
	let t = qm(Ym(e)), n = 1n;
	for (let e = t, r = 115792089237316195423570985008687907853269984665640564039457584007908834671664n / 4n; r > 0n; r >>= 1n) r & 1n && (n = n * e % jm), e = e * e % jm;
	if (Y(n * n) !== t) throw Error("sqrt invalid");
	return new eh(e, Zm(n) ? n : Y(-n), 1n);
}, eh = class e {
	static BASE;
	static ZERO;
	X;
	Y;
	Z;
	constructor(e, t, n) {
		this.X = Jm(e), this.Y = Ym(t), this.Z = Jm(n), Am(this);
	}
	static CURVE() {
		return Fm;
	}
	static fromAffine(t) {
		let { x: n, y: r } = t;
		return n === 0n && r === 0n ? nh : new e(n, r, 1n);
	}
	static fromBytes(t) {
		Lm(t);
		let n = t.length, r = t[0], i = ih(t, 1, 33);
		try {
			if (n === 33 && (r === 2 || r === 3)) {
				let e = $m(i);
				return r === 3 ? e.negate() : e;
			}
			if (n === 65 && r === 4) return new e(i, ih(t, 33, 65), 1n).assertValidity();
		} catch {
			throw Error(Km);
		}
		throw Error(Km);
	}
	static fromHex(t) {
		return e.fromBytes(Bm(t));
	}
	get x() {
		return this.toAffine().x;
	}
	get y() {
		return this.toAffine().y;
	}
	equals(e) {
		let { X: t, Y: n, Z: r } = this, { X: i, Y: a, Z: o } = Gm(e);
		return Y(t * o) === Y(i * r) && Y(n * o) === Y(a * r);
	}
	is0() {
		return this.Z === 0n;
	}
	negate() {
		return new e(this.X, Y(-this.Y), this.Z);
	}
	double() {
		return this.add(this);
	}
	add(t) {
		let { X: n, Y: r, Z: i } = this, { X: a, Y: o, Z: s } = Gm(t), c = 0n, l = 0n, u = 0n, d = 0n, f = Y(7n * 3n), p = Y(n * a), m = Y(r * o), h = Y(i * s), g = Y(n + r), _ = Y(a + o);
		g = Y(g * _), _ = Y(p + m), g = Y(g - _), _ = Y(n + i);
		let v = Y(a + s);
		return _ = Y(_ * v), v = Y(p + h), _ = Y(_ - v), v = Y(r + i), l = Y(o + s), v = Y(v * l), l = Y(m + h), v = Y(v - l), d = Y(c * _), l = Y(f * h), d = Y(l + d), l = Y(m - d), d = Y(m + d), u = Y(l * d), m = Y(p + p), m = Y(m + p), h = Y(c * h), _ = Y(f * _), m = Y(m + h), h = Y(p - h), h = Y(c * h), _ = Y(_ + h), p = Y(m * _), u = Y(u + p), p = Y(v * _), l = Y(g * l), l = Y(l - p), p = Y(g * m), d = Y(v * d), d = Y(d + p), new e(l, u, d);
	}
	subtract(e) {
		return this.add(Gm(e).negate());
	}
	multiply(e, t = !0) {
		if (!t && e === 0n) return nh;
		if (Xm(e), e === 1n) return this;
		if (this.equals(th)) return lh(e).p;
		let n = nh, r = th, i = this;
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
		let r = Wm(n, jm);
		if (Y(n * r) !== 1n) throw Error("inverse invalid");
		return {
			x: Y(e * r),
			y: Y(t * r)
		};
	}
	assertValidity() {
		let { x: e, y: t } = this.toAffine();
		if (Ym(e), Ym(t), Y(t * t) !== qm(e)) throw Error(Km);
		return this;
	}
	toBytes(e = !0) {
		let { x: t, y: n } = this.assertValidity().toAffine(), r = ah(t);
		return e ? Vm(Qm(n), r) : Vm(Uint8Array.of(4), r, ah(n));
	}
	toHex(e) {
		return zm(this.toBytes(e));
	}
}, th = new eh(Nm, Pm, 1n), nh = new eh(0n, 1n, 0n);
eh.BASE = th, eh.ZERO = nh;
var rh = (e) => Hm("0x" + (zm(e) || "0")), ih = (e, t, n) => rh(e.subarray(t, n)), ah = (e) => Bm(Rm(Um(e, 0n, 2n ** 256n), 64)), oh = () => {
	let e = [], t = th, n = t;
	for (let r = 0; r < 33; r++) {
		n = t, e.push(n);
		for (let r = 1; r < 128; r++) n = n.add(t), e.push(n);
		t = n.double();
	}
	return e;
}, sh = void 0, ch = (e, t) => {
	let n = t.negate();
	return e ? n : t;
}, lh = (e) => {
	let t = sh ||= oh(), n = nh, r = th;
	for (let i = 0; i < 33; i++) {
		let a = Number(e & 255n);
		e >>= 8n, a > 128 && (a -= 256, e += 1n);
		let o = i * 128, s = o + Math.abs(a) - 1, c = i % 2 != 0, l = a < 0;
		a === 0 ? r = r.add(ch(c, t[o])) : n = n.add(ch(l, t[s]));
	}
	if (e !== 0n) throw Error("invalid wnaf");
	return {
		p: n,
		f: r
	};
}, uh = (e) => {
	let t, n = 0n;
	for (let r = 1; r <= (t = e.length) >> 1; r++) n |= BigInt(e[t - r]) << BigInt(8 * (r - 1));
	return n;
}, dh = (e, t) => uh(e) <= t >> 1n, fh = (e) => e[0] === 2 || e[0] === 3, ph = (e) => e[0] === 4, mh = (e) => {
	gh(ph(e), "not an uncompressed point");
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
var hh = (e, t) => `z${We(se([e, t]))}`, gh = (e, t) => {
	if (!e) throw TypeError(t);
}, _h = (e, t) => {
	if (!e) throw SyntaxError(t);
}, vh = (e, t) => {
	throw Error(t);
}, yh = 115792089210356248762697446949407573530086143415290314195533631308867097853951n, bh = 115792089210356248762697446949407573530086143415290314195533631308867097853948n, xh = 41058363725152142129326129780047268409114441015993725554835256314039467401291n, Sh = 115792089210356248762697446949407573530086143415290314195533631308867097853952n / 4n, Ch = (e) => e.reduce((t, n, r) => t + (BigInt(n) << BigInt(8 * (e.length - r - 1))), 0n), wh = (e, t) => Uint8Array.from(Array.from({ length: t }, (n, r) => Number(BigInt.asUintN(8, e >> BigInt((t - r - 1) * 8))))), Th = (e, t) => (e = e * e % t, e = e * e % t, e = e * e % t, e = e * e % t, e), Eh = (e, t, n) => {
	let r = [1n];
	for (let t = 0; t < 15; t++) r.push(r[t] * e % n);
	return Array.from(t.toString(16)).reduce((e, t) => Th(e, n) * r[parseInt(t, 16)] % n, 1n);
}, Dh = (e) => {
	gh(fh(e), "not a compressed point"), gh(e.length === 33, "invalid compressed point length");
	let t = Ch(e.subarray(1)), n = (t ** 3n + bh * t + xh) % yh, r = Eh(n, Sh, yh);
	gh(r * r % yh === n, "invalid curve point"), (e[0] ^ Number(BigInt.asUintN(1, r))) & 1 && (r = yh - r);
	let i = /* @__PURE__ */ new Uint8Array(65);
	return i[0] = 4, i.set(wh(t, 32), 1), i.set(wh(r, 32), 33), i;
}, Oh = Uint8Array.from([128, 36]);
Uint8Array.from([134, 38]);
var kh = {
	name: "ECDSA",
	namedCurve: "P-256",
	hash: "SHA-256"
}, Ah, jh = async (e, t, n) => {
	if (Ah === !0 || ph(e)) return crypto.subtle.importKey("raw", e, kh, t, n);
	if (Ah === !1) return crypto.subtle.importKey("raw", Dh(e), kh, t, n);
	try {
		let r = await crypto.subtle.importKey("raw", e, kh, t, n);
		return Ah = !0, r;
	} catch {
		let r = await crypto.subtle.importKey("raw", Dh(e), kh, t, n);
		return Ah = !1, r;
	}
}, Mh = Uint8Array.from([
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
	...Mh,
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
var Nh = class e {
	type = "p256";
	jwtAlg = "ES256";
	_publicKey;
	constructor(e) {
		this._publicKey = e;
	}
	static async importRaw(t) {
		let n = await jh(t, !0, ["verify"]);
		return new e(n);
	}
	static async importCryptoKey(t) {
		return gh(t.algorithm.namedCurve === "P-256", "not an ECDSA P-256 key"), gh(t.type === "public", "not a public key"), gh(t.extractable, "key must be extractable"), new e(t);
	}
	async verify(e, t, n) {
		return e.length !== 64 || !n?.allowMalleableSig && !dh(e, 115792089210356248762697446949407573529996955224135760342422259061068512044369n) ? !1 : await crypto.subtle.verify(kh, this._publicKey, e, t);
	}
	async exportPublicKey(e) {
		if (e === "jwk") return await crypto.subtle.exportKey("jwk", this._publicKey);
		let t = await crypto.subtle.exportKey("raw", this._publicKey), n = mh(new Uint8Array(t));
		switch (e) {
			case "did": return `did:key:${hh(Oh, n)}`;
			case "multikey": return hh(Oh, n);
			case "raw": return n;
			case "rawHex": return be(n);
		}
		vh(e, `unknown "${e}" export format`);
	}
}, Ph = (e) => (_h(e.length >= 2 && e[0] === "z", "not a multibase base58btc string"), Ue(e.slice(1))), Fh = (e) => (_h(e.length >= 9 && e.startsWith("did:key:"), "not a did:key"), Ih(e.slice(8))), Ih = (e) => {
	let t = Ph(e);
	_h(t.length >= 3, "multikey too short");
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
	gh(!1, `unsupported key type (0x${n.toString(16).padStart(4, "0")})`);
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
function Lh(e) {
	throw new m("input", e);
}
async function Rh(e) {
	ja();
	let { type: t } = e;
	(!(e.publicKeyBytes instanceof Uint8Array) || ![33, 65].includes(e.publicKeyBytes.length)) && Lh("Invalid repository public key size");
	let n = new Uint8Array(e.publicKeyBytes);
	if ((![33, 65].includes(n.length) || (n.length === 33 ? ![2, 3].includes(n[0]) : n[0] !== 4)) && Lh("Invalid repository public key encoding"), t === "secp256k1") {
		let e = eh.fromBytes(n).assertValidity().toBytes(!0);
		return `did:key:z${We(new Uint8Array([
			231,
			1,
			...e
		]))}`;
	}
	return t === "p256" ? (await Nh.importRaw(n)).exportPublicKey("did") : Lh("Unsupported repository public key type");
}
//#endregion
//#region src/protocol/native-wire.ts
function X(e, t) {
	throw new m(e, t);
}
function zh(e) {
	return Va(Ra(e));
}
function Bh(e, t) {
	e.some((t, n) => n > 0 && e[n - 1] >= t) && X("envelope", `${t} must be sorted and unique`);
}
function Vh(e) {
	return JSON.stringify([e.principal, e.actorKey]);
}
function Hh(e) {
	Bh(e.map(Vh), "Control pairs");
}
function Uh(e) {
	(!/^[a-z][a-z0-9_]{0,63}$/.test(e) || [
		"govern",
		"recover",
		"certify",
		"owner"
	].includes(e)) && X("envelope", "Expected a domain participation role");
}
function Wh(e) {
	/^[a-z2-7]{26}$/.test(e) || X("envelope", "Grant ID must be canonical 16-byte base32");
	let t = Ve(e);
	(t.length !== 16 || ze(t) !== e) && X("envelope", "Noncanonical grant ID");
}
function Gh(e) {
	let [t, n, r] = e.split("#");
	(!t || !n || r !== void 0 || !/^[A-Za-z][A-Za-z0-9_]*$/.test(n)) && X("envelope", "Expected a complete action/schema reference"), cm(W("path"), {
		$type: W("path"),
		collection: t,
		rkey: "self"
	});
}
function Kh(e) {
	let t;
	try {
		t = Ye(e);
	} catch {
		X("envelope", "Expected canonical raw CID");
	}
	(t.codec !== 85 || Xe(t) !== e || t.digest.contents.length !== 32 || t.version !== 1 || t.digest.codec !== 18) && X("envelope", "Expected canonical raw SHA-256 CIDv1");
}
function qh(e) {
	let t;
	try {
		t = new URL(e);
	} catch {
		X("envelope", "Expected HTTPS origin");
	}
	(t.protocol !== "https:" || t.username || t.password || t.search || t.hash || t.pathname !== "/" || t.origin !== e) && X("envelope", "Expected canonical credential-free HTTPS origin");
}
function Jh(e) {
	let t = new Date(e);
	(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(e) || !Number.isFinite(t.getTime()) || t.toISOString() !== e) && X("envelope", "Expected exact diagnostic UTC timestamp");
}
async function Yh(e) {
	let t;
	try {
		t = Fh(e);
	} catch (e) {
		throw (e instanceof SyntaxError || e instanceof TypeError && /^unsupported key type /.test(e.message)) && X("key", "Expected canonical P-256 device/control key"), e;
	}
	(t.type !== "p256" || t.publicKeyBytes.length !== 33) && X("key", "Device/control signing requires compressed P-256");
	let n;
	try {
		n = await Rh(t);
	} catch (e) {
		throw e instanceof DOMException && e.name === "DataError" && X("key", "Invalid device/control point"), e;
	}
	n !== e && X("key", "Noncanonical device/control key");
}
async function Xh(e) {
	let t;
	try {
		t = Fh(e);
	} catch (e) {
		throw (e instanceof SyntaxError || e instanceof TypeError && /^unsupported key type /.test(e.message)) && X("key", "Expected repository signing key"), e;
	}
	t.publicKeyBytes.length !== 33 && X("key", "Repository key must be compressed"), await Rh(t) !== e && X("key", "Noncanonical repository key");
}
async function Zh(e, t) {
	cm(e, t);
	let n = zh(t);
	async function r(e) {
		Hh(e);
		for (let t of e) Bh(t.powers, "Control powers"), await Yh(t.actorKey);
	}
	let i = e === U.content ? n.body.$type : e, a = e === U.content ? n.body : n;
	switch (i) {
		case U.genesis:
			await r(a.control), Bh(a.roles.map((e) => JSON.stringify([e.principal, e.role])), "Initial roles"), a.roles.forEach((e) => Uh(e.role));
			break;
		case W("intent"):
			await Yh(a.actorKey), await Zh(a.operation.$type, a.operation);
			break;
		case W("signedRequest"):
			await Zh(W("intent"), a.intent);
			break;
		case W("act"):
			Wh(a.grant.id), Gh(a.action), (!a.payload || Array.isArray(a.payload) || typeof a.payload != "object") && X("payload", "Expected action object"), y(a.payload, h.actionBytes);
			break;
		case W("assignRole"):
			Wh(a.grant.id), Uh(a.role);
			break;
		case W("setRole"):
		case W("requiredRole"):
			Uh(a.role);
			break;
		case W("setControl"):
			await r(a.control);
			break;
		case W("setRecovery"):
		case W("recoverGovernance"):
			Hh(a.recovery ?? a.governance);
			for (let e of a.recovery ?? a.governance) await Yh(e.actorKey);
			break;
		case W("activate"):
			Bh(a.closure, "Activation closure"), a.closure.includes(a.definition.$link) || X("envelope", "Activation closure omits its definition");
			for (let e of a.closure) Ye(e).codec === 85 ? Kh(e) : T(e);
			break;
		case W("accountOperation"):
			await Zh(a.operation.$type, a.operation);
			break;
		case W("admitGrant"):
		case W("revokeGrant"):
			Wh((a.grant ?? a.revoke).id);
			break;
		case U.entry:
			await Zh(a.request.$type, a.request);
			break;
		case U.grant:
			Wh(a.id), await Yh(a.actorKey), !a.actions.length && !a.assignRoles.length && X("envelope", "Empty grant scope"), Bh(a.actions.map((e) => JSON.stringify([e.action, e.execution.$link])), "Grant action scopes"), a.actions.forEach((e) => Gh(e.action)), Bh(a.assignRoles, "Grant role scopes"), a.assignRoles.forEach(Uh);
			break;
		case U.revoke:
			Wh(a.id);
			break;
		case U.file:
			Kh(a.cid);
			break;
		case U.definition:
			new Set(a.files.map((e) => e.path)).size !== a.files.length && X("envelope", "Duplicate source paths"), a.files.forEach((e) => Kh(e.cid));
			for (let e of a.actions) Gh(e.ref), await Zh(e.authorization.$type, e.authorization);
			break;
		case W("byteManifest"):
			a.chunks.length !== Math.ceil(a.byteLength / 32768) && X("envelope", "Manifest count/length mismatch");
			break;
		case W("observationPolicy"):
			qh(a.plcDirectory);
			break;
		case W("observation"):
		case W("appBinding"):
			if (qh(a.binding.pdsOrigin), await Xh(a.binding.signingKeyDid), a.before.$type !== a.after.$type && X("envelope", "Mixed identity evidence methods"), i === W("observation")) {
				Jh(a.observedAt), Bh(a.records.map((e) => e.path), "Observed record paths");
				for (let e of a.records) {
					let [t, n, r] = e.path.split("/");
					r !== void 0 && X("path", "Expected two native path components"), Qh(t, n);
				}
			}
			break;
		case W("actionContract"): Gh(a.schemas.stateRoot), Gh(a.schemas.actionRoot), Kh(a.fold), await Zh(a.authorization.$type, a.authorization);
	}
	return Pp(n);
}
function Qh(e, t) {
	return cm(W("path"), {
		$type: W("path"),
		collection: e,
		rkey: t
	}), `${e}/${t}`;
}
function $h(e) {
	return (!Number.isSafeInteger(e) || e < 1) && X("position", "Expected positive safe position"), String(e).padStart(16, "0");
}
async function eg(e, t, n) {
	Qh(e, t);
	let r = await Zh(e, Va(n)), i;
	switch (e) {
		case U.genesis:
		case U.epoch:
		case U.content:
		case U.definition:
			i = await Ha(r);
			break;
		case U.head:
			i = r.genesis.$link;
			break;
		case U.entry:
			i = `${r.genesis.$link}.${$h(r.position)}`;
			break;
		case U.epochCurrent:
			i = "self";
			break;
		case U.grant:
		case U.revoke:
			i = r.id;
			break;
		case U.file:
			i = r.cid;
			break;
		default: X("path", "Not a native Atseq record collection");
	}
	return t !== i && X("path", "Record differs from canonical native key"), r;
}
async function tg(e, t, n) {
	if (!Number.isSafeInteger(n) || n < 0) throw new m("input", "Invalid local byte budget");
	let r = await Zh(U.content, e);
	if (r.body.$type !== W("byteManifest") && X("envelope", "Expected byte manifest"), r.body.byteLength > n) throw new m("native_proof_limit", "Retained bytes exceed local budget");
	let i = new Uint8Array(r.body.byteLength), a = 0;
	for (let e of r.body.chunks) {
		let n = await t.get(e.$link), r = await eg(U.content, e.$link, n);
		r.body.$type !== W("byteChunk") && X("envelope", "Manifest references non-chunk content");
		let o = new Uint8Array(rt(r.body.bytes));
		o.length !== Math.min(32768, i.length - a) && X("envelope", "Noncanonical chunk size/manifest length"), i.set(o, a), a += o.length;
	}
	return i;
}
//#endregion
//#region src/protocol/checkpoint-data.ts
var Z = Object.freeze({
	pageBytes: 131072,
	depth: 32,
	payloadBytes: 33554432
});
function Q(e) {
	throw new m("envelope", e);
}
function ng(e) {
	throw new f("content_unavailable", e);
}
function rg(e, t) {
	(!e || typeof e != "object" || Array.isArray(e) || Object.keys(e).length !== t.length || t.some((t) => !Object.hasOwn(e, t))) && Q("Unknown or missing checkpoint fields");
}
function ig(e, t = !1) {
	(!Number.isSafeInteger(e) || Object.is(e, -0) || e < +!!t) && Q("Invalid checkpoint integer");
}
function ag(e) {
	if (!Number.isSafeInteger(e) || e < 0) throw new m("input", "Invalid local checkpoint budget");
}
function og(e) {
	sm(e.app), T(e.genesis);
}
function sg(e, t) {
	rg(e, ["position", "entry"]), ig(e.position), T(e.entry), e.position === 0 != (e.entry === t) && Q("Checkpoint zero position differs from genesis");
}
function cg(e, t, n = !1) {
	if (ag(t), !(e instanceof Uint8Array)) throw new m("input", "Expected checkpoint bytes");
	let r = n ? Z.pageBytes : Z.payloadBytes;
	e.length > r && Q("Checkpoint JSON exceeds supported format byte bound"), e.length > t && ng("Checkpoint bytes exceed local budget");
	let i;
	try {
		i = km(e, r, Z.depth);
	} catch (e) {
		throw e instanceof Dm ? new m("noncanonical", `Malformed checkpoint JSON: ${e.reason}`) : e;
	}
	let a = new TextEncoder().encode(y(i, r, Z.depth));
	if (a.length !== e.length || a.some((t, n) => t !== e[n])) throw new m("noncanonical", "Checkpoint JSON does not reproduce canonical bytes");
	return i;
}
async function lg(e) {
	(!(e instanceof Uint8Array) || e.length > Z.payloadBytes) && Q("Unsupported checkpoint payload bytes");
	let t = [];
	for (let n = 0; n < e.length; n += 32768) {
		let r = {
			$type: U.content,
			version: 1,
			body: {
				$type: W("byteChunk"),
				bytes: Ia(e.slice(n, n + 32768))
			}
		};
		t.push(T(await Ha(r)));
	}
	return Ha({
		$type: U.content,
		version: 1,
		body: {
			$type: W("byteManifest"),
			byteLength: e.length,
			chunks: t
		}
	});
}
async function ug(e, t) {
	await lg(t) !== e && Q("Checkpoint payload differs from byte-manifest identity");
}
async function dg(e, t, n, r = !1) {
	ag(n), T(e);
	let i = await eg(U.content, e, await t.get(e));
	return i.body.$type !== W("byteManifest") && Q("Expected checkpoint byte manifest"), i.body.byteLength > (r ? Z.pageBytes : Z.payloadBytes) && Q("Checkpoint payload exceeds supported format bound"), i.body.byteLength > n && ng("Checkpoint payload exceeds local budget"), tg(i, t, n);
}
function fg(e, t, n, r) {
	if (og(n), ![
		"history",
		"outcomes",
		"sources",
		"evidence"
	].includes(t)) throw new m("input", "Unsupported expected table kind");
	let i = cg(e, r);
	rg(i, [
		"format",
		"version",
		"app",
		"genesis",
		"kind",
		"through",
		"rows",
		"pages"
	]), (i.format !== "atseq-checkpoint-table" || i.version !== 1 || i.kind !== t || i.app !== n.app || i.genesis !== n.genesis) && Q("Checkpoint table differs from scope/kind/version"), sg(i.through, n.genesis), ig(i.rows), Array.isArray(i.pages) || Q("Expected checkpoint pages");
	let a = 0;
	for (let e of i.pages) rg(e, ["payload", "rows"]), T(e.payload), ig(e.rows, !0), a += e.rows, Number.isSafeInteger(a) || Q("Checkpoint row count overflow");
	return (a !== i.rows || i.rows === 0 != (i.pages.length === 0)) && Q("Checkpoint page counts differ"), i.kind === "history" && i.rows !== i.through.position && Q("History count differs from head"), i.kind === "outcomes" && i.rows !== i.through.position && Q("Outcome count differs from interpreted frontier"), i;
}
async function pg(e, t) {
	await Zh(U.file, {
		$type: U.file,
		version: 1,
		cid: e,
		bytes: T(t)
	});
}
function mg(e) {
	e.some((t, n) => n > 0 && e[n - 1] >= t) && Q("Checkpoint rows must be sorted and unique");
}
async function hg(e, t, n, r, i) {
	og(n), ag(i);
	let a = cg(e, r, !0);
	if ((!Array.isArray(a) || !a.length) && Q("Checkpoint pages must contain rows"), a.length > i && ng("Checkpoint rows exceed local budget"), ![
		"history",
		"sources",
		"evidence",
		"outcomes"
	].includes(t)) throw new m("input", "Unsupported table kind");
	for (let e of a) if (t === "history") {
		if (rg(e, [
			"position",
			"entry",
			"request",
			"actor",
			"entryBytes",
			"requestBytes",
			"observations"
		]), ig(e.position, !0), [
			e.entry,
			e.request,
			e.entryBytes,
			e.requestBytes
		].forEach(T), e.actor !== null) {
			rg(e.actor, ["actorKey", "nonce"]), await Yh(e.actor.actorKey), (typeof e.actor.nonce != "string" || !/^[A-Za-z0-9+/]{22}$/.test(e.actor.nonce)) && Q("Expected original actor nonce");
			let t = new Uint8Array(rt({ $bytes: e.actor.nonce }));
			(t.length !== 16 || Ia(t).$bytes !== e.actor.nonce) && Q("Noncanonical original actor nonce");
		}
		(!Array.isArray(e.observations) || e.observations.length > 1) && Q("Unsupported observation use list"), e.observations.forEach(T);
	} else if (t === "outcomes") rg(e, [
		"position",
		"entry",
		"outcome"
	]), ig(e.position, !0), T(e.entry), e.outcome = mm(e.outcome);
	else if (t === "sources") {
		rg(e, [
			"definition",
			"manifest",
			"files"
		]), T(e.definition), T(e.manifest), Array.isArray(e.files) || Q("Expected source files");
		let t = /* @__PURE__ */ new Set();
		for (let r of e.files) rg(r, [
			"path",
			"cid",
			"bytes"
		]), T(r.bytes), (typeof r.path != "string" || r.path.length > 200 || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(r.path) || r.path.split("/").some((e) => !e || e === "." || e === "..") || t.has(r.path)) && Q("Invalid or duplicate source path"), t.add(r.path), await pg(r.cid, n.genesis);
	} else {
		rg(e, ["cid", "bytes"]), T(e.bytes);
		try {
			T(e.cid);
		} catch (t) {
			if (!(t instanceof m) || t.code !== "wire_cid") throw t;
			await pg(e.cid, n.genesis);
		}
	}
	if (t === "history" || t === "outcomes") for (let e = 1; e < a.length; e++) a[e].position !== a[e - 1].position + 1 && Q(t === "history" ? "Nonconsecutive history page" : "Nonconsecutive outcome page");
	else mg(a.map((e) => t === "sources" ? e.definition : e.cid));
	return a;
}
function gg(e, t, n) {
	og(t), ig(n), n > e.length && Q("Interpreted frontier exceeds complete history");
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
		o.position !== a + 1 && Q("Incomplete history positions");
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
			i[a].has(e) && Q("Duplicate history identity"), i[a].add(e), o.position <= n && r[a].push(e);
		}
	}
	for (let e of Object.values(r)) e.sort();
	return r;
}
async function _g(e, t, n, r, i, a) {
	ag(i), ag(a);
	let o = fg(e, n, r, i);
	o.rows > a && ng("Complete table exceeds local row budget"), t.length < o.pages.length && ng("Required complete table pages are missing"), t.length > o.pages.length && Q("Unexpected complete table pages");
	let s = e.length, c = [];
	for (let [e, l] of t.entries()) {
		let t = n === "history" ? await hg(l, "history", r, Math.max(0, i - s), a) : n === "sources" ? await hg(l, "sources", r, Math.max(0, i - s), a) : n === "evidence" ? await hg(l, "evidence", r, Math.max(0, i - s), a) : await hg(l, "outcomes", r, Math.max(0, i - s), a), u = o.pages[e];
		await ug(u.payload, l), t.length !== u.rows && Q("Page count differs from inventory"), c.push(...t), s += l.length;
	}
	return c.length !== o.rows && Q("Complete table row count differs"), n === "history" || n === "outcomes" ? (c.some((e, t) => e.position !== t + 1) || c.length && c.at(-1).entry !== o.through.entry) && Q(n === "history" ? "History positions/boundary differ" : "Outcome positions/boundary differ") : mg(c.map((e) => n === "sources" ? e.definition : e.cid)), {
		table: o,
		rows: c
	};
}
function vg(e, t, n) {
	og(t);
	let r = cg(e, n);
	return rg(r, [
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
	]), (r.format !== "atseq-checkpoint-assertion" || r.version !== 1 || r.app !== t.app || r.genesis !== t.genesis) && Q("Checkpoint assertion differs from pinned scope/version"), sg(r.head, t.genesis), sg(r.frontier, t.genesis), (r.frontier.position > r.head.position || r.frontier.position === r.head.position && r.frontier.entry !== r.head.entry) && Q("Checkpoint assertion frontier differs from head"), [
		"definition",
		"state",
		"authority",
		"history",
		"sources",
		"evidence",
		"producer"
	].forEach((e) => T(r[e])), r.outcomes !== null && T(r.outcomes), r.stall !== null && (rg(r.stall, [
		"position",
		"entry",
		"diagnostic"
	]), ig(r.stall.position, !0), T(r.stall.entry), (r.frontier.position >= r.head.position || r.stall.position !== r.frontier.position + 1 || typeof r.stall.diagnostic != "string" || !r.stall.diagnostic.isWellFormed() || [...r.stall.diagnostic].length > 1024) && Q("Checkpoint stall differs from pending boundary")), r;
}
//#endregion
//#region src/protocol/native-checkpoint-producer.ts
var yg = 32768, bg = 1e5, xg = 50331648, Sg = new TextEncoder(), Cg = Uint8Array, wg = Object.getPrototypeOf(Cg.prototype), Tg = Object.getOwnPropertyDescriptor(wg, "length").get, Eg = Object.getOwnPropertyDescriptor(wg, Symbol.toStringTag).get, Dg = Cg.prototype.set;
function Og(e) {
	throw new m("envelope", e);
}
function kg(e) {
	throw new f("content_unavailable", e);
}
function Ag(e, t = Z.payloadBytes) {
	return Sg.encode(y(e, t, Z.depth));
}
function jg(e) {
	let t = JSON.parse(y({
		scope: e.scope,
		head: e.head,
		frontier: e.frontier,
		definition: e.definition,
		stall: e.stall
	}, Z.pageBytes, Z.depth)), n = 0;
	function r(e, t = Z.payloadBytes, r = !0) {
		if (Reflect.apply(Eg, e, []) !== "Uint8Array") throw new m("input", "Expected original checkpoint bytes");
		let i = Reflect.apply(Tg, e, []);
		i > t && Og("Unsupported checkpoint payload bytes"), i > xg - n && kg("Checkpoint input inventory exceeds byte capacity");
		let a = new Cg(i);
		return Reflect.apply(Dg, a, [e]), r && cg(a, t, t === Z.pageBytes), n += i, a;
	}
	let i = 0;
	function a(e, t = !0) {
		if (!Array.isArray(e)) throw new m("input", "Expected checkpoint row bytes");
		let n = e.length;
		if (!Number.isSafeInteger(n) || Object.is(n, -0) || n < 0) throw new m("input", "Expected a safe checkpoint row count");
		n > bg - i && kg("Checkpoint input inventory exceeds row capacity"), i += n;
		let a = [];
		for (let i = 0; i < n; i++) {
			let n = Object.getOwnPropertyDescriptor(e, String(i));
			if (!n || !("value" in n)) throw new m("input", "Expected owned checkpoint row bytes");
			a.push(r(n.value, t ? Z.pageBytes : Z.payloadBytes, t));
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
async function $(e) {
	let t = jg(e), n = /* @__PURE__ */ new Map(), r = {
		records: 0,
		recordBytes: 0,
		chunks: 0,
		manifests: 0,
		pages: 0,
		payloadBytes: 0
	};
	async function i(e, t) {
		let i = Ra(e), a = await Ha(e);
		return n.has(a) || ((n.size >= bg || i.length > xg - r.recordBytes) && kg("Checkpoint content inventory exceeds capacity"), n.set(a, {
			path: `${U.content}/${a}`,
			cid: a,
			bytes: i
		}), r.records++, r.recordBytes += i.length, r[t]++), a;
	}
	async function a(e) {
		e.length > Z.payloadBytes && Og("Unsupported checkpoint payload bytes");
		let t = [];
		for (let n = 0; n < e.length; n += yg) t.push(T(await i({
			$type: U.content,
			version: 1,
			body: {
				$type: W("byteChunk"),
				bytes: Ia(e.subarray(n, n + yg))
			}
		}, "chunks")));
		let n = await i({
			$type: U.content,
			version: 1,
			body: {
				$type: W("byteManifest"),
				byteLength: e.length,
				chunks: t
			}
		}, "manifests");
		return r.payloadBytes += e.length, {
			cid: n,
			bytes: e
		};
	}
	let o = t.scope, s = cg(t.authority, Z.payloadBytes);
	(!s || typeof s != "object" || Array.isArray(s) || s.format !== "atseq-checkpoint-authority" || s.version !== 1 || s.app !== o.app || s.genesis !== o.genesis || s.activeDefinition !== t.definition || y(s.frontier) !== y(t.frontier)) && Og("Authority payload differs from assertion scope/frontier/definition");
	let c = t.history.map((e) => cg(e, Z.pageBytes));
	for (let e of c) await hg(Ag([e], Z.pageBytes), "history", o, Z.pageBytes, bg);
	gg(c, o, t.frontier.position), t.frontier.entry !== (t.frontier.position === 0 ? o.genesis : c[t.frontier.position - 1]?.entry) && Og("Checkpoint frontier differs from complete history"), t.stall !== null && t.stall.entry !== c[t.frontier.position]?.entry && Og("Checkpoint stall differs from first pending history entry");
	async function l(e, t, n) {
		let i = [], s = [], c = [], l = 2;
		async function u() {
			if (!c.length) return;
			let t = Sg.encode(`[${c.join(",")}]`);
			await hg(t, e, o, Z.pageBytes, bg), i.push(await a(t)), s.push(c.length), r.pages++, c = [], l = 2;
		}
		for (let e of t) e.length + 2 > Z.pageBytes && Og("One checkpoint row exceeds page capacity"), l + e.length + +!!c.length > Z.pageBytes && await u(), c.push(new TextDecoder().decode(e)), l += e.length + +(c.length > 1);
		await u();
		let d = Ag({
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
		return await _g(d, i.map((e) => e.bytes), e, o, xg, bg), {
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
		let e = t.outcomes.map((e) => cg(e, Z.pageBytes)), n = /* @__PURE__ */ new Set();
		for (let r of e) await hg(Ag([r], Z.pageBytes), "outcomes", o, Z.pageBytes, bg), (r.position > t.frontier.position || n.has(r.position) || r.entry !== c[r.position - 1]?.entry) && Og("Selective outcomes differ from history/frontier"), n.add(r.position);
		e.length === t.frontier.position && (u.outcomes = await l("outcomes", t.outcomes, t.frontier));
	}
	for (let e of t.payloads) await a(e);
	let d = await a(t.state), f = await a(t.authority), p = await a(t.producer), m = Ag({
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
	return vg(m, o, Z.payloadBytes), {
		assertion: await a(m),
		tables: u,
		records: [...n.values()].sort((e, t) => e.path < t.path ? -1 : +(e.path > t.path)),
		counters: r
	};
}
//#endregion
//#region tests/support/native-checkpoint-producer-corpus.ts
var Mg = (e) => new TextEncoder().encode(y(e, 33554432, 32)), Ng = (e) => [...e].map((e) => e.toString(16).padStart(2, "0")).join(""), Pg = (e) => {
	if (!e) throw Error("Expected condition");
};
async function Fg(e, t = 13) {
	let n = new Map(e.records.map(([e, t]) => [e, Uint8Array.from(atob(t), (e) => e.charCodeAt(0))])), r = { get: async (e) => {
		let t = n.get(e);
		return Pg(t), t;
	} }, i = /* @__PURE__ */ new Map();
	for (let t of e.payloads) i.set(t.file.slice(9), await dg(t.manifest, r, 33554432));
	let a = (e) => {
		let t = i.get(e);
		return Pg(t), t;
	};
	async function o(t) {
		let n = a(`${t}-table.json`), i = cg(n, n.length);
		return await _g(n, await Promise.all(i.pages.map((e) => dg(e.payload, r, 131072, !0))), t, e.scope, 50331648, 1e5);
	}
	let s = await o("history"), c = await o("sources"), l = await o("evidence"), u = a(`checkpoint-authority-${t}.json`), d = cg(u, u.length);
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
		history: s.rows.slice(0, t).map(Mg),
		sources: c.rows.map(Mg),
		evidence: l.rows.map(Mg),
		outcomes: s.rows.slice(0, t).map((e) => Mg({
			position: e.position,
			entry: e.entry,
			outcome: { decision: "effective" }
		})),
		payloads: [...i.entries()].filter(([e]) => /^(entry-|request-|evidence-\d|source-)/.test(e)).map(([, e]) => e)
	};
}
function Ig(e) {
	return {
		assertion: {
			cid: e.assertion.cid,
			hex: Ng(e.assertion.bytes)
		},
		tables: Object.fromEntries(Object.entries(e.tables).map(([e, t]) => [e, t === null ? null : {
			cid: t.payload.cid,
			hex: Ng(t.payload.bytes),
			pages: t.pages.map((e) => ({
				cid: e.cid,
				hex: Ng(e.bytes)
			}))
		}])),
		records: e.records.map((e) => ({
			path: e.path,
			cid: e.cid,
			hex: Ng(e.bytes)
		})),
		counters: e.counters
	};
}
//#endregion
//#region tests/support/native-checkpoint-producer-owned-input-corpus.ts
var Lg = (e) => new TextEncoder().encode(e), Rg = (e) => {
	if (!e) throw Error("Expected ownership condition");
};
async function zg(e, t) {
	let n = await Fg(e), r = [];
	async function i(e, t) {
		await t(), r.push(e);
	}
	async function a(e, t, n) {
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
	let o = await lg(Lg("{\"x\":1}")), s = await lg(Lg("{\"x\":2}"));
	await i("root-alias-slice-later-mutation-retains-original-state", async () => {
		let e = Lg("{\"x\":1}"), t = 0;
		Object.defineProperty(e, "slice", { value: () => (t++, e) });
		let r = $({
			...n,
			state: e
		});
		e.set(Lg("{\"x\":2}")), Rg(vg((await r).assertion.bytes, n.scope, 33554432).state === o && t === 0), Rg(o !== s);
	}), await i("own-byte-fields-methods-iterator-constructor-never-dispatched", async () => {
		let e = Lg("{\"x\":1}"), t = 0;
		for (let n of [
			"length",
			"byteLength",
			"buffer",
			"byteOffset",
			"slice",
			"constructor",
			Symbol.iterator,
			Symbol.toStringTag
		]) Object.defineProperty(e, n, { get() {
			throw t++, Error("Caller byte property executed");
		} });
		let r = $({
			...n,
			state: e
		});
		Uint8Array.prototype.set.call(e, Lg("{\"x\":2}")), Rg(vg((await r).assertion.bytes, n.scope, 33554432).state === o && t === 0);
	}), await i("genuine-subclass-copied-without-species-or-slice", async () => {
		class e extends Uint8Array {
			slice() {
				throw Error("Subclass slice");
			}
		}
		let t = new e(Lg("{\"x\":1}"));
		Object.defineProperty(t, "constructor", { get() {
			throw Error("Subclass species");
		} });
		let r = $({
			...n,
			state: t
		});
		t.set(Lg("{\"x\":2}")), Rg(vg((await r).assertion.bytes, n.scope, 33554432).state === o);
	}), await i("original-binary-payload-owned-before-await", async () => {
		let e = Lg("abc");
		Object.defineProperty(e, "slice", { value: () => e });
		let t = $({
			...n,
			payloads: [e]
		});
		e.set(Lg("xyz"));
		let r = await t, i = await lg(Lg("abc")), a = await lg(Lg("xyz"));
		Rg(r.records.some((e) => e.cid === i) && !r.records.some((e) => e.cid === a));
	}), await i("original-row-owned-before-await", async () => {
		let e = n.history[0].slice();
		Object.defineProperty(e, "slice", { value: () => e });
		let r = $({
			...n,
			history: [e, ...n.history.slice(1)]
		});
		e.fill(32);
		let i = await r;
		Rg(JSON.stringify(Ig(i)) === JSON.stringify(t));
	});
	let c = 0, l = new Proxy(Lg("{\"x\":1}"), { get() {
		throw c++, Error("Proxy byte field");
	} });
	await a("proxy-byte-view-refused-before-caller-field", "input", () => $({
		...n,
		state: l
	})), Rg(c === 0), await a("forged-byte-prototype-refused", "input", () => $({
		...n,
		state: Object.create(Uint8Array.prototype)
	})), await a("different-typed-array-kind-refused", "input", () => $({
		...n,
		state: /* @__PURE__ */ new Uint8ClampedArray(7)
	}));
	let u = 0, d = /* @__PURE__ */ new Uint8Array(33554433);
	for (let e of [
		"length",
		"byteLength",
		"slice"
	]) Object.defineProperty(d, e, { get() {
		return u++, e === "slice" ? () => /* @__PURE__ */ new Uint8Array() : 0;
	} });
	await a("intrinsic-per-payload-size-cannot-be-hidden", "envelope", () => $({
		...n,
		payloads: [d]
	})), Rg(u === 0);
	let p = 0, m = /* @__PURE__ */ new Uint8Array(26214400);
	Object.defineProperty(m, "length", { get() {
		return p++, 0;
	} }), Object.defineProperty(m, "slice", { get() {
		return p++, () => /* @__PURE__ */ new Uint8Array();
	} }), await a("intrinsic-aggregate-byte-charge-cannot-be-hidden", "content_unavailable", () => $({
		...n,
		payloads: [m, m]
	})), Rg(p === 0);
	for (let e of [
		-1,
		-0,
		NaN,
		Infinity,
		1.5,
		"1",
		null
	]) {
		let t = 0, r = new Proxy([], {
			get(t, n, r) {
				return n === "length" ? e : Reflect.get(t, n, r);
			},
			getOwnPropertyDescriptor() {
				throw t++, Error("Unsafe count enumerated");
			}
		});
		await a(`unsafe-row-count-${String(e)}-${Object.is(e, -0) ? "negative-zero" : typeof e}`, "input", () => $({
			...n,
			payloads: r
		})), Rg(t === 0);
	}
	let h = 0, g = new Proxy([], {
		get(e, t, n) {
			return t === "length" ? 100001 : Reflect.get(e, t, n);
		},
		getOwnPropertyDescriptor() {
			throw h++, Error("Oversized count enumerated");
		}
	});
	await a("row-count-cap-before-descriptor-enumeration", "content_unavailable", () => $({
		...n,
		payloads: g
	})), Rg(h === 0), await i("safe-row-count-captured-once-no-array-iterator", async () => {
		let e = 0, r = new Proxy(n.history, { get(t, n, r) {
			if (n === "length") return e++, t.length;
			if (n === Symbol.iterator) throw Error("Caller iterator");
			return Reflect.get(t, n, r);
		} }), i = await $({
			...n,
			history: r
		});
		Rg(e === 1 && JSON.stringify(Ig(i)) === JSON.stringify(t));
	});
	let _ = 0, v = [];
	return Object.defineProperty(v, "0", {
		get() {
			return _++, n.history[0];
		},
		enumerable: !0,
		configurable: !0
	}), await a("row-accessor-refused-without-executing-getter", "input", () => $({
		...n,
		history: v
	})), Rg(_ === 0), await i("foreign-row-length-getter-fault-keeps-identity", async () => {
		let e = /* @__PURE__ */ TypeError("foreign row count getter"), t = new Proxy([], { get(t, n, r) {
			if (n === "length") throw e;
			return Reflect.get(t, n, r);
		} });
		try {
			await $({
				...n,
				payloads: t
			});
		} catch (t) {
			Rg(t === e);
			return;
		}
		throw Error("Foreign getter fault was swallowed");
	}), {
		cases: r,
		noAdmission: !0,
		rootProbe: {
			original: o,
			mutated: s,
			capturedOriginal: !0,
			usedLaterMutation: !1
		},
		allocatorCounters: null
	};
}
//#endregion
export { zg as nativeCheckpointProducerOwnedInputCorpus };
