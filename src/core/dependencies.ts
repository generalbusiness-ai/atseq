import { verifyInstalledDependencies } from '#atseq-integrity';
import project from '../../package.json' with { type: 'json' };
import installed0 from '../../node_modules/@atcute/car/package.json' with { type: 'json' };
import installed1 from '../../node_modules/@atcute/cbor/package.json' with { type: 'json' };
import installed2 from '../../node_modules/@atcute/cid/package.json' with { type: 'json' };
import installed3 from '../../node_modules/@atcute/crypto/package.json' with { type: 'json' };
import installed4 from '../../node_modules/@atcute/did-plc/package.json' with { type: 'json' };
import installed5 from '../../node_modules/@atcute/identity/package.json' with { type: 'json' };
import installed6 from '../../node_modules/@atcute/lexicons/package.json' with { type: 'json' };
import installed7 from '../../node_modules/@atcute/mst/package.json' with { type: 'json' };
import installed8 from '../../node_modules/@atcute/multibase/package.json' with { type: 'json' };
import installed9 from '../../node_modules/@atcute/repo/package.json' with { type: 'json' };
import installed10 from '../../node_modules/@atcute/uint8array/package.json' with { type: 'json' };
import installed11 from '../../node_modules/@atcute/util-fetch/package.json' with { type: 'json' };
import installed12 from '../../node_modules/@atcute/util-text/package.json' with { type: 'json' };
import installed13 from '../../node_modules/@atcute/util-text/node_modules/unicode-segmenter/package.json' with { type: 'json' };
import installed14 from '../../node_modules/@atcute/varint/package.json' with { type: 'json' };
import installed15 from '../../node_modules/@atproto-labs/did-resolver/package.json' with { type: 'json' };
import installed16 from '../../node_modules/@atproto-labs/fetch/package.json' with { type: 'json' };
import installed17 from '../../node_modules/@atproto-labs/fetch-node/package.json' with { type: 'json' };
import installed18 from '../../node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch/package.json' with { type: 'json' };
import installed19 from '../../node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe/package.json' with { type: 'json' };
import installed20 from '../../node_modules/@atproto-labs/handle-resolver/package.json' with { type: 'json' };
import installed21 from '../../node_modules/@atproto-labs/handle-resolver-node/package.json' with { type: 'json' };
import installed22 from '../../node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did/package.json' with { type: 'json' };
import installed23 from '../../node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store/package.json' with { type: 'json' };
import installed24 from '../../node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory/package.json' with { type: 'json' };
import installed25 from '../../node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did/package.json' with { type: 'json' };
import installed26 from '../../node_modules/@atproto-labs/identity-resolver/package.json' with { type: 'json' };
import installed27 from '../../node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver/package.json' with { type: 'json' };
import installed28 from '../../node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch/package.json' with { type: 'json' };
import installed29 from '../../node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe/package.json' with { type: 'json' };
import installed30 from '../../node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store/package.json' with { type: 'json' };
import installed31 from '../../node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory/package.json' with { type: 'json' };
import installed32 from '../../node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did/package.json' with { type: 'json' };
import installed33 from '../../node_modules/@atproto-labs/pipe/package.json' with { type: 'json' };
import installed34 from '../../node_modules/@atproto-labs/simple-store/package.json' with { type: 'json' };
import installed35 from '../../node_modules/@atproto-labs/simple-store-memory/package.json' with { type: 'json' };
import installed36 from '../../node_modules/@atproto/common/package.json' with { type: 'json' };
import installed37 from '../../node_modules/@atproto/common-web/package.json' with { type: 'json' };
import installed38 from '../../node_modules/@atproto/common/node_modules/@atproto/common-web/package.json' with { type: 'json' };
import installed39 from '../../node_modules/@atproto/common/node_modules/@atproto/lex-cbor/package.json' with { type: 'json' };
import installed40 from '../../node_modules/@atproto/common/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed41 from '../../node_modules/@atproto/common/node_modules/@atproto/lex-json/package.json' with { type: 'json' };
import installed42 from '../../node_modules/@atproto/common/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed43 from '../../node_modules/@atproto/crypto/package.json' with { type: 'json' };
import installed44 from '../../node_modules/@atproto/did/package.json' with { type: 'json' };
import installed45 from '../../node_modules/@atproto/jwk/package.json' with { type: 'json' };
import installed46 from '../../node_modules/@atproto/jwk-jose/package.json' with { type: 'json' };
import installed47 from '../../node_modules/@atproto/jwk-webcrypto/package.json' with { type: 'json' };
import installed48 from '../../node_modules/@atproto/jwk/node_modules/multiformats/package.json' with { type: 'json' };
import installed49 from '../../node_modules/@atproto/lex/package.json' with { type: 'json' };
import installed50 from '../../node_modules/@atproto/lex-builder/package.json' with { type: 'json' };
import installed51 from '../../node_modules/@atproto/lex-cbor/package.json' with { type: 'json' };
import installed52 from '../../node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed53 from '../../node_modules/@atproto/lex-client/package.json' with { type: 'json' };
import installed54 from '../../node_modules/@atproto/lex-client/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed55 from '../../node_modules/@atproto/lex-client/node_modules/@atproto/lex-json/package.json' with { type: 'json' };
import installed56 from '../../node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed57 from '../../node_modules/@atproto/lex-data/node_modules/multiformats/package.json' with { type: 'json' };
import installed58 from '../../node_modules/@atproto/lex-document/package.json' with { type: 'json' };
import installed59 from '../../node_modules/@atproto/lex-installer/package.json' with { type: 'json' };
import installed60 from '../../node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed61 from '../../node_modules/@atproto/lex-installer/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed62 from '../../node_modules/@atproto/lex-json/package.json' with { type: 'json' };
import installed63 from '../../node_modules/@atproto/lex-resolver/package.json' with { type: 'json' };
import installed64 from '../../node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed65 from '../../node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed66 from '../../node_modules/@atproto/lex-schema/package.json' with { type: 'json' };
import installed67 from '../../node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed68 from '../../node_modules/@atproto/lex-schema/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed69 from '../../node_modules/@atproto/lex/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed70 from '../../node_modules/@atproto/lex/node_modules/@atproto/lex-json/package.json' with { type: 'json' };
import installed71 from '../../node_modules/@atproto/lexicon/package.json' with { type: 'json' };
import installed72 from '../../node_modules/@atproto/lexicon/node_modules/multiformats/package.json' with { type: 'json' };
import installed73 from '../../node_modules/@atproto/oauth-client/package.json' with { type: 'json' };
import installed74 from '../../node_modules/@atproto/oauth-client-browser/package.json' with { type: 'json' };
import installed75 from '../../node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver/package.json' with { type: 'json' };
import installed76 from '../../node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch/package.json' with { type: 'json' };
import installed77 from '../../node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe/package.json' with { type: 'json' };
import installed78 from '../../node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store/package.json' with { type: 'json' };
import installed79 from '../../node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory/package.json' with { type: 'json' };
import installed80 from '../../node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did/package.json' with { type: 'json' };
import installed81 from '../../node_modules/@atproto/oauth-client-node/package.json' with { type: 'json' };
import installed82 from '../../node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver/package.json' with { type: 'json' };
import installed83 from '../../node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch/package.json' with { type: 'json' };
import installed84 from '../../node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe/package.json' with { type: 'json' };
import installed85 from '../../node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store/package.json' with { type: 'json' };
import installed86 from '../../node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory/package.json' with { type: 'json' };
import installed87 from '../../node_modules/@atproto/oauth-client-node/node_modules/@atproto/did/package.json' with { type: 'json' };
import installed88 from '../../node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver/package.json' with { type: 'json' };
import installed89 from '../../node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch/package.json' with { type: 'json' };
import installed90 from '../../node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe/package.json' with { type: 'json' };
import installed91 from '../../node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/package.json' with { type: 'json' };
import installed92 from '../../node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory/package.json' with { type: 'json' };
import installed93 from '../../node_modules/@atproto/oauth-client/node_modules/@atproto/did/package.json' with { type: 'json' };
import installed94 from '../../node_modules/@atproto/oauth-client/node_modules/multiformats/package.json' with { type: 'json' };
import installed95 from '../../node_modules/@atproto/oauth-types/package.json' with { type: 'json' };
import installed96 from '../../node_modules/@atproto/oauth-types/node_modules/@atproto/did/package.json' with { type: 'json' };
import installed97 from '../../node_modules/@atproto/repo/package.json' with { type: 'json' };
import installed98 from '../../node_modules/@atproto/repo/node_modules/@atproto/common-web/package.json' with { type: 'json' };
import installed99 from '../../node_modules/@atproto/repo/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed100 from '../../node_modules/@atproto/repo/node_modules/@atproto/lex-json/package.json' with { type: 'json' };
import installed101 from '../../node_modules/@atproto/repo/node_modules/@atproto/lexicon/package.json' with { type: 'json' };
import installed102 from '../../node_modules/@atproto/repo/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed103 from '../../node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed104 from '../../node_modules/@atproto/xrpc/package.json' with { type: 'json' };
import installed105 from '../../node_modules/@atproto/xrpc/node_modules/@atproto/common-web/package.json' with { type: 'json' };
import installed106 from '../../node_modules/@atproto/xrpc/node_modules/@atproto/lexicon/package.json' with { type: 'json' };
import installed107 from '../../node_modules/@atproto/xrpc/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed108 from '../../node_modules/@atproto/xrpc/node_modules/multiformats/package.json' with { type: 'json' };
import installed109 from '../../node_modules/@inlay/core/package.json' with { type: 'json' };
import installed110 from '../../node_modules/@inlay/core/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed111 from '../../node_modules/@inlay/render/package.json' with { type: 'json' };
import installed112 from '../../node_modules/@inlay/render/node_modules/@atproto/common-web/package.json' with { type: 'json' };
import installed113 from '../../node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed114 from '../../node_modules/@inlay/render/node_modules/@atproto/lex-data/package.json' with { type: 'json' };
import installed115 from '../../node_modules/@inlay/render/node_modules/@atproto/lex-json/package.json' with { type: 'json' };
import installed116 from '../../node_modules/@inlay/render/node_modules/@atproto/lexicon/package.json' with { type: 'json' };
import installed117 from '../../node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed118 from '../../node_modules/@inlay/render/node_modules/@atproto/syntax/package.json' with { type: 'json' };
import installed119 from '../../node_modules/@ipld/dag-cbor/package.json' with { type: 'json' };
import installed120 from '../../node_modules/@noble/curves/package.json' with { type: 'json' };
import installed121 from '../../node_modules/@noble/hashes/package.json' with { type: 'json' };
import installed122 from '../../node_modules/@noble/secp256k1/package.json' with { type: 'json' };
import installed123 from '../../node_modules/@oomfware/eval/package.json' with { type: 'json' };
import installed124 from '../../node_modules/@standard-schema/spec/package.json' with { type: 'json' };
import installed125 from '../../node_modules/@ts-morph/common/package.json' with { type: 'json' };
import installed126 from '../../node_modules/abort-controller/package.json' with { type: 'json' };
import installed127 from '../../node_modules/ansi-regex/package.json' with { type: 'json' };
import installed128 from '../../node_modules/ansi-styles/package.json' with { type: 'json' };
import installed129 from '../../node_modules/atomic-sleep/package.json' with { type: 'json' };
import installed130 from '../../node_modules/balanced-match/package.json' with { type: 'json' };
import installed131 from '../../node_modules/base64-js/package.json' with { type: 'json' };
import installed132 from '../../node_modules/brace-expansion/package.json' with { type: 'json' };
import installed133 from '../../node_modules/buffer/package.json' with { type: 'json' };
import installed134 from '../../node_modules/cborg/package.json' with { type: 'json' };
import installed135 from '../../node_modules/cliui/package.json' with { type: 'json' };
import installed136 from '../../node_modules/code-block-writer/package.json' with { type: 'json' };
import installed137 from '../../node_modules/color-convert/package.json' with { type: 'json' };
import installed138 from '../../node_modules/color-name/package.json' with { type: 'json' };
import installed139 from '../../node_modules/core-js/package.json' with { type: 'json' };
import installed140 from '../../node_modules/emoji-regex/package.json' with { type: 'json' };
import installed141 from '../../node_modules/escalade/package.json' with { type: 'json' };
import installed142 from '../../node_modules/esm-env/package.json' with { type: 'json' };
import installed143 from '../../node_modules/event-target-shim/package.json' with { type: 'json' };
import installed144 from '../../node_modules/events/package.json' with { type: 'json' };
import installed145 from '../../node_modules/fast-redact/package.json' with { type: 'json' };
import installed146 from '../../node_modules/fdir/package.json' with { type: 'json' };
import installed147 from '../../node_modules/get-caller-file/package.json' with { type: 'json' };
import installed148 from '../../node_modules/ieee754/package.json' with { type: 'json' };
import installed149 from '../../node_modules/ipaddr.js/package.json' with { type: 'json' };
import installed150 from '../../node_modules/is-fullwidth-code-point/package.json' with { type: 'json' };
import installed151 from '../../node_modules/iso-datestring-validator/package.json' with { type: 'json' };
import installed152 from '../../node_modules/jose/package.json' with { type: 'json' };
import installed153 from '../../node_modules/jsonata/package.json' with { type: 'json' };
import installed154 from '../../node_modules/jsonc-parser/package.json' with { type: 'json' };
import installed155 from '../../node_modules/lru-cache/package.json' with { type: 'json' };
import installed156 from '../../node_modules/minimatch/package.json' with { type: 'json' };
import installed157 from '../../node_modules/multiformats/package.json' with { type: 'json' };
import installed158 from '../../node_modules/on-exit-leak-free/package.json' with { type: 'json' };
import installed159 from '../../node_modules/path-browserify/package.json' with { type: 'json' };
import installed160 from '../../node_modules/picomatch/package.json' with { type: 'json' };
import installed161 from '../../node_modules/pino/package.json' with { type: 'json' };
import installed162 from '../../node_modules/pino-abstract-transport/package.json' with { type: 'json' };
import installed163 from '../../node_modules/pino-std-serializers/package.json' with { type: 'json' };
import installed164 from '../../node_modules/prettier/package.json' with { type: 'json' };
import installed165 from '../../node_modules/process/package.json' with { type: 'json' };
import installed166 from '../../node_modules/process-warning/package.json' with { type: 'json' };
import installed167 from '../../node_modules/quick-format-unescaped/package.json' with { type: 'json' };
import installed168 from '../../node_modules/readable-stream/package.json' with { type: 'json' };
import installed169 from '../../node_modules/real-require/package.json' with { type: 'json' };
import installed170 from '../../node_modules/require-directory/package.json' with { type: 'json' };
import installed171 from '../../node_modules/safe-buffer/package.json' with { type: 'json' };
import installed172 from '../../node_modules/safe-stable-stringify/package.json' with { type: 'json' };
import installed173 from '../../node_modules/sonic-boom/package.json' with { type: 'json' };
import installed174 from '../../node_modules/split2/package.json' with { type: 'json' };
import installed175 from '../../node_modules/string-width/package.json' with { type: 'json' };
import installed176 from '../../node_modules/string_decoder/package.json' with { type: 'json' };
import installed177 from '../../node_modules/strip-ansi/package.json' with { type: 'json' };
import installed178 from '../../node_modules/thread-stream/package.json' with { type: 'json' };
import installed179 from '../../node_modules/tinyglobby/package.json' with { type: 'json' };
import installed180 from '../../node_modules/ts-morph/package.json' with { type: 'json' };
import installed181 from '../../node_modules/tslib/package.json' with { type: 'json' };
import installed182 from '../../node_modules/uint8arrays/package.json' with { type: 'json' };
import installed183 from '../../node_modules/undici_v6/package.json' with { type: 'json' };
import installed184 from '../../node_modules/undici_v7/package.json' with { type: 'json' };
import installed185 from '../../node_modules/undici_v8/package.json' with { type: 'json' };
import installed186 from '../../node_modules/unicode-segmenter/package.json' with { type: 'json' };
import installed187 from '../../node_modules/valibot/package.json' with { type: 'json' };
import installed188 from '../../node_modules/varint/package.json' with { type: 'json' };
import installed189 from '../../node_modules/wrap-ansi/package.json' with { type: 'json' };
import installed190 from '../../node_modules/y18n/package.json' with { type: 'json' };
import installed191 from '../../node_modules/yargs/package.json' with { type: 'json' };
import installed192 from '../../node_modules/yargs-parser/package.json' with { type: 'json' };
import installed193 from '../../node_modules/zod/package.json' with { type: 'json' };
import approved from './dependencies-approved.json' with { type: 'json' };
import lock from '../../npm-shrinkwrap.json' with { type: 'json' };
import { InterpretationError } from './errors.ts';
import { NON_EXECUTED_PEERS } from './dependency-peers.ts';
const installed: [string, unknown][] = [
  ['node_modules/@atcute/car', installed0],
  ['node_modules/@atcute/cbor', installed1],
  ['node_modules/@atcute/cid', installed2],
  ['node_modules/@atcute/crypto', installed3],
  ['node_modules/@atcute/did-plc', installed4],
  ['node_modules/@atcute/identity', installed5],
  ['node_modules/@atcute/lexicons', installed6],
  ['node_modules/@atcute/mst', installed7],
  ['node_modules/@atcute/multibase', installed8],
  ['node_modules/@atcute/repo', installed9],
  ['node_modules/@atcute/uint8array', installed10],
  ['node_modules/@atcute/util-fetch', installed11],
  ['node_modules/@atcute/util-text', installed12],
  ['node_modules/@atcute/util-text/node_modules/unicode-segmenter', installed13],
  ['node_modules/@atcute/varint', installed14],
  ['node_modules/@atproto-labs/did-resolver', installed15],
  ['node_modules/@atproto-labs/fetch', installed16],
  ['node_modules/@atproto-labs/fetch-node', installed17],
  ['node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/fetch', installed18],
  ['node_modules/@atproto-labs/fetch-node/node_modules/@atproto-labs/pipe', installed19],
  ['node_modules/@atproto-labs/handle-resolver', installed20],
  ['node_modules/@atproto-labs/handle-resolver-node', installed21],
  ['node_modules/@atproto-labs/handle-resolver-node/node_modules/@atproto/did', installed22],
  ['node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store', installed23],
  ['node_modules/@atproto-labs/handle-resolver/node_modules/@atproto-labs/simple-store-memory', installed24],
  ['node_modules/@atproto-labs/handle-resolver/node_modules/@atproto/did', installed25],
  ['node_modules/@atproto-labs/identity-resolver', installed26],
  ['node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/did-resolver', installed27],
  ['node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/fetch', installed28],
  ['node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/pipe', installed29],
  ['node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store', installed30],
  ['node_modules/@atproto-labs/identity-resolver/node_modules/@atproto-labs/simple-store-memory', installed31],
  ['node_modules/@atproto-labs/identity-resolver/node_modules/@atproto/did', installed32],
  ['node_modules/@atproto-labs/pipe', installed33],
  ['node_modules/@atproto-labs/simple-store', installed34],
  ['node_modules/@atproto-labs/simple-store-memory', installed35],
  ['node_modules/@atproto/common', installed36],
  ['node_modules/@atproto/common-web', installed37],
  ['node_modules/@atproto/common/node_modules/@atproto/common-web', installed38],
  ['node_modules/@atproto/common/node_modules/@atproto/lex-cbor', installed39],
  ['node_modules/@atproto/common/node_modules/@atproto/lex-data', installed40],
  ['node_modules/@atproto/common/node_modules/@atproto/lex-json', installed41],
  ['node_modules/@atproto/common/node_modules/@atproto/syntax', installed42],
  ['node_modules/@atproto/crypto', installed43],
  ['node_modules/@atproto/did', installed44],
  ['node_modules/@atproto/jwk', installed45],
  ['node_modules/@atproto/jwk-jose', installed46],
  ['node_modules/@atproto/jwk-webcrypto', installed47],
  ['node_modules/@atproto/jwk/node_modules/multiformats', installed48],
  ['node_modules/@atproto/lex', installed49],
  ['node_modules/@atproto/lex-builder', installed50],
  ['node_modules/@atproto/lex-cbor', installed51],
  ['node_modules/@atproto/lex-cbor/node_modules/@atproto/lex-data', installed52],
  ['node_modules/@atproto/lex-client', installed53],
  ['node_modules/@atproto/lex-client/node_modules/@atproto/lex-data', installed54],
  ['node_modules/@atproto/lex-client/node_modules/@atproto/lex-json', installed55],
  ['node_modules/@atproto/lex-data', installed56],
  ['node_modules/@atproto/lex-data/node_modules/multiformats', installed57],
  ['node_modules/@atproto/lex-document', installed58],
  ['node_modules/@atproto/lex-installer', installed59],
  ['node_modules/@atproto/lex-installer/node_modules/@atproto/lex-data', installed60],
  ['node_modules/@atproto/lex-installer/node_modules/@atproto/syntax', installed61],
  ['node_modules/@atproto/lex-json', installed62],
  ['node_modules/@atproto/lex-resolver', installed63],
  ['node_modules/@atproto/lex-resolver/node_modules/@atproto/lex-data', installed64],
  ['node_modules/@atproto/lex-resolver/node_modules/@atproto/syntax', installed65],
  ['node_modules/@atproto/lex-schema', installed66],
  ['node_modules/@atproto/lex-schema/node_modules/@atproto/lex-data', installed67],
  ['node_modules/@atproto/lex-schema/node_modules/@atproto/syntax', installed68],
  ['node_modules/@atproto/lex/node_modules/@atproto/lex-data', installed69],
  ['node_modules/@atproto/lex/node_modules/@atproto/lex-json', installed70],
  ['node_modules/@atproto/lexicon', installed71],
  ['node_modules/@atproto/lexicon/node_modules/multiformats', installed72],
  ['node_modules/@atproto/oauth-client', installed73],
  ['node_modules/@atproto/oauth-client-browser', installed74],
  ['node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/did-resolver', installed75],
  ['node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/fetch', installed76],
  ['node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/pipe', installed77],
  ['node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store', installed78],
  ['node_modules/@atproto/oauth-client-browser/node_modules/@atproto-labs/simple-store-memory', installed79],
  ['node_modules/@atproto/oauth-client-browser/node_modules/@atproto/did', installed80],
  ['node_modules/@atproto/oauth-client-node', installed81],
  ['node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/did-resolver', installed82],
  ['node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/fetch', installed83],
  ['node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/pipe', installed84],
  ['node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store', installed85],
  ['node_modules/@atproto/oauth-client-node/node_modules/@atproto-labs/simple-store-memory', installed86],
  ['node_modules/@atproto/oauth-client-node/node_modules/@atproto/did', installed87],
  ['node_modules/@atproto/oauth-client/node_modules/@atproto-labs/did-resolver', installed88],
  ['node_modules/@atproto/oauth-client/node_modules/@atproto-labs/fetch', installed89],
  ['node_modules/@atproto/oauth-client/node_modules/@atproto-labs/pipe', installed90],
  ['node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store', installed91],
  ['node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store-memory', installed92],
  ['node_modules/@atproto/oauth-client/node_modules/@atproto/did', installed93],
  ['node_modules/@atproto/oauth-client/node_modules/multiformats', installed94],
  ['node_modules/@atproto/oauth-types', installed95],
  ['node_modules/@atproto/oauth-types/node_modules/@atproto/did', installed96],
  ['node_modules/@atproto/repo', installed97],
  ['node_modules/@atproto/repo/node_modules/@atproto/common-web', installed98],
  ['node_modules/@atproto/repo/node_modules/@atproto/lex-data', installed99],
  ['node_modules/@atproto/repo/node_modules/@atproto/lex-json', installed100],
  ['node_modules/@atproto/repo/node_modules/@atproto/lexicon', installed101],
  ['node_modules/@atproto/repo/node_modules/@atproto/syntax', installed102],
  ['node_modules/@atproto/syntax', installed103],
  ['node_modules/@atproto/xrpc', installed104],
  ['node_modules/@atproto/xrpc/node_modules/@atproto/common-web', installed105],
  ['node_modules/@atproto/xrpc/node_modules/@atproto/lexicon', installed106],
  ['node_modules/@atproto/xrpc/node_modules/@atproto/syntax', installed107],
  ['node_modules/@atproto/xrpc/node_modules/multiformats', installed108],
  ['node_modules/@inlay/core', installed109],
  ['node_modules/@inlay/core/node_modules/@atproto/syntax', installed110],
  ['node_modules/@inlay/render', installed111],
  ['node_modules/@inlay/render/node_modules/@atproto/common-web', installed112],
  ['node_modules/@inlay/render/node_modules/@atproto/common-web/node_modules/@atproto/syntax', installed113],
  ['node_modules/@inlay/render/node_modules/@atproto/lex-data', installed114],
  ['node_modules/@inlay/render/node_modules/@atproto/lex-json', installed115],
  ['node_modules/@inlay/render/node_modules/@atproto/lexicon', installed116],
  ['node_modules/@inlay/render/node_modules/@atproto/lexicon/node_modules/@atproto/syntax', installed117],
  ['node_modules/@inlay/render/node_modules/@atproto/syntax', installed118],
  ['node_modules/@ipld/dag-cbor', installed119],
  ['node_modules/@noble/curves', installed120],
  ['node_modules/@noble/hashes', installed121],
  ['node_modules/@noble/secp256k1', installed122],
  ['node_modules/@oomfware/eval', installed123],
  ['node_modules/@standard-schema/spec', installed124],
  ['node_modules/@ts-morph/common', installed125],
  ['node_modules/abort-controller', installed126],
  ['node_modules/ansi-regex', installed127],
  ['node_modules/ansi-styles', installed128],
  ['node_modules/atomic-sleep', installed129],
  ['node_modules/balanced-match', installed130],
  ['node_modules/base64-js', installed131],
  ['node_modules/brace-expansion', installed132],
  ['node_modules/buffer', installed133],
  ['node_modules/cborg', installed134],
  ['node_modules/cliui', installed135],
  ['node_modules/code-block-writer', installed136],
  ['node_modules/color-convert', installed137],
  ['node_modules/color-name', installed138],
  ['node_modules/core-js', installed139],
  ['node_modules/emoji-regex', installed140],
  ['node_modules/escalade', installed141],
  ['node_modules/esm-env', installed142],
  ['node_modules/event-target-shim', installed143],
  ['node_modules/events', installed144],
  ['node_modules/fast-redact', installed145],
  ['node_modules/fdir', installed146],
  ['node_modules/get-caller-file', installed147],
  ['node_modules/ieee754', installed148],
  ['node_modules/ipaddr.js', installed149],
  ['node_modules/is-fullwidth-code-point', installed150],
  ['node_modules/iso-datestring-validator', installed151],
  ['node_modules/jose', installed152],
  ['node_modules/jsonata', installed153],
  ['node_modules/jsonc-parser', installed154],
  ['node_modules/lru-cache', installed155],
  ['node_modules/minimatch', installed156],
  ['node_modules/multiformats', installed157],
  ['node_modules/on-exit-leak-free', installed158],
  ['node_modules/path-browserify', installed159],
  ['node_modules/picomatch', installed160],
  ['node_modules/pino', installed161],
  ['node_modules/pino-abstract-transport', installed162],
  ['node_modules/pino-std-serializers', installed163],
  ['node_modules/prettier', installed164],
  ['node_modules/process', installed165],
  ['node_modules/process-warning', installed166],
  ['node_modules/quick-format-unescaped', installed167],
  ['node_modules/readable-stream', installed168],
  ['node_modules/real-require', installed169],
  ['node_modules/require-directory', installed170],
  ['node_modules/safe-buffer', installed171],
  ['node_modules/safe-stable-stringify', installed172],
  ['node_modules/sonic-boom', installed173],
  ['node_modules/split2', installed174],
  ['node_modules/string-width', installed175],
  ['node_modules/string_decoder', installed176],
  ['node_modules/strip-ansi', installed177],
  ['node_modules/thread-stream', installed178],
  ['node_modules/tinyglobby', installed179],
  ['node_modules/ts-morph', installed180],
  ['node_modules/tslib', installed181],
  ['node_modules/uint8arrays', installed182],
  ['node_modules/undici_v6', installed183],
  ['node_modules/undici_v7', installed184],
  ['node_modules/undici_v8', installed185],
  ['node_modules/unicode-segmenter', installed186],
  ['node_modules/valibot', installed187],
  ['node_modules/varint', installed188],
  ['node_modules/wrap-ansi', installed189],
  ['node_modules/y18n', installed190],
  ['node_modules/yargs', installed191],
  ['node_modules/yargs-parser', installed192],
  ['node_modules/zod', installed193],
];
function same(a: unknown, b: unknown): boolean {
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const x = a as Record<string, unknown>,
      y = b as Record<string, unknown>;
    return (
      Object.keys(x).length === Object.keys(y).length &&
      Object.keys(x).every((k) => Object.hasOwn(y, k) && same(x[k], y[k]))
    );
  }
  return a === b;
}
/** Separate reviewed build provenance; it is never included in a semantic CID. */
let checked = false;
export function assertDependencies(packages: [string, unknown][] = installed): void {
  if (packages === installed) verifyInstalledDependencies();
  if (packages === installed && checked) return;
  if (new Set(packages.map(([path]) => path)).size !== packages.length)
    throw new InterpretationError('dependency_mismatch', 'Duplicate dependency identity');
  if (packages.length !== Object.keys(approved.packages).length)
    throw new InterpretationError('dependency_mismatch', 'Dependency closure is incomplete');
  for (const [path, value] of packages) {
    const expected = (approved.packages as Record<string, any>)[path],
      actual = value as Record<string, unknown>;
    const locked = (lock.packages as Record<string, any>)[path];
    if (
      !expected ||
      !actual ||
      !locked ||
      actual.version !== expected.version ||
      locked.integrity !== expected.integrity ||
      locked.version !== expected.version ||
      ['dependencies', 'optionalDependencies', 'peerDependencies', 'peerDependenciesMeta'].some(
        (k) => !same(actual[k] ?? {}, expected[k] ?? {}) || !same(locked[k] ?? {}, expected[k] ?? {}),
      )
    )
      throw new InterpretationError('dependency_mismatch', `Unapproved dependency: ${path}`);
  }
  if (
    !same(approved.nonExecutedPeers, NON_EXECUTED_PEERS) ||
    !same(project.imports, approved.imports) ||
    !same(project.dependencies, approved.direct) ||
    !same(lock.packages[''].dependencies, approved.direct) ||
    Object.entries(approved.buildTools).some(
      ([name, version]) =>
        (project.devDependencies as Record<string, string>)[name] !== version ||
        (lock.packages[''].devDependencies as Record<string, string>)[name] !== version,
    )
  )
    throw new InterpretationError('dependency_mismatch', 'Unapproved direct dependencies');
  if (packages === installed) checked = true;
}
