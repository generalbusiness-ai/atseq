# Runtime dependency advisory preparation — 2026-10-01

Recommend replacing the bundled `brace-expansion` 5.0.9 with 5.0.12, keeping
its parents and `balanced-match` unchanged. Source inspection found no route
from admitted Atseq records to brace expansion. The complete declared package
closure still ships the affected code, including tools an adopter could call.
Patching that closure is appropriate even without a demonstrated Atseq exploit.

This prepares M0, workroom request
`9e6a98942df81bec18668124c9a7922c8b7e95a5`. It examines P1 head
`b4c7fb72c19cc6c9b6e0d5632a861af19762cb1e`, before P1's reviewed merge. No
dependency, approval manifest, runtime source or PDS fixture has been changed.
Implementation must start from reviewed P1 on main and preserve unrelated
Wrangler work. This note does not discharge M0's implementation conditions.

## Evidence and locked ancestry

The [source capture](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-source.json)
records public registry metadata, advisory metadata, source file hashes and
selected import and call sites. The
[capture script](../experiments/runtime-advisory-source.py) downloads tarballs
into memory, verifies their SHA-512 SRI against the shrinkwrap, and reads code
as text. It does not install or execute those packages. The examined shrinkwrap
SHA-256 is
`ad408a2ce81f63bbeaf4a0800b37c5306870f4400729325a073e67f885f10502`.

| Declared dependency edge | Locked child | Declared range |
| --- | --- | --- |
| `@inlay/core` 0.0.13 → `@atproto/lex` | 0.0.18 | `^0.0.18` |
| `@atproto/lex` → `@atproto/lex-builder` | 0.0.16 | `^0.0.16` |
| `@atproto/lex-builder` → `ts-morph` | 27.0.2 | `^27.0.0` |
| `ts-morph` → `@ts-morph/common` | 0.28.1 | `~0.28.1` |
| `@ts-morph/common` → `minimatch` | 10.2.6 | `^10.0.1` |
| `minimatch` → `brace-expansion` | 5.0.9 | `^5.0.8` |
| `brace-expansion` → `balanced-match` | 4.0.4 | `^4.0.2` |

Each package above is marked `inBundle: true`. The root also declares
`ts-morph` as a development dependency; its production ancestry means it remains
in the shipped closure. Omitting development dependencies alone does not remove
the affected code.

## Actual execution paths

The four shipped JavaScript files in `@inlay/core` 0.0.13 contain no Lex import.
Its package declaration creates the installation edge, rather than an executed
call into the builder. `@inlay/render` 0.3.1 imports generated component schemas,
which import Lex's `l` schema helpers. The root `@atproto/lex` 0.0.18 entry exports
data, JSON, schema and client packages; it does not load the builder or installer.

The tooling path is real when explicitly used. Lex builder imports `ts-morph`;
that package imports common; common imports `minimatch`. Its Node and browser
`getPathMatchesPattern` methods call `minimatch`, and `matchGlobs` uses those
methods. `ts-morph` source-file filtering calls `matchGlobs`. Minimatch's normal
brace-enabled matching calls `brace-expansion`. This is a concrete possible
exposure for an adopter passing untrusted patterns into those tooling APIs.
Common's filesystem glob implementation also uses `tinyglobby`; not every glob
call is the minimatch route.

Atseq's runtime source imports neither builder, `ts-morph`, minimatch nor brace
expansion as executable APIs. Its Inlay adapter exposes element helpers and
rendering. `resolveView` accepts retained local templates, validates component
identifiers, rejects external views, bounds expansion and supplies a local
resolver. It supplies no file or pattern matching API. Its namespace checks use
`@atproto/lexicon`, a separate package. Repository scripts and the installed
conformance helper import `ts-morph` for `ts` parser/transpiler APIs, not pattern
matching. Dependency checks read package metadata and file bytes; their import
of `brace-expansion/package.json` does not call expansion.

These are source findings, not dynamic exploit or instrumented reachability
results. They support no demonstrated input path in the admitted Atseq contract.
They do not establish that every exported upstream tooling function is safe,
or that an adopter cannot introduce a new path. No browser or packed bundle was
built during this preparation; bundle absence has not been measured.

## Current advisories and compatible patch

The primary advisories identify three affected paths in 5.0.9:

| Advisory | Reported severity | First patched 5.x version |
| --- | --- | --- |
| [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p), comma parsing stack exhaustion | High | 5.0.10 |
| [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7), nested expansion stack exhaustion | High | 5.0.11 |
| [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr), repeated rewrite CPU exhaustion | Moderate | 5.0.12 |

All concern availability when an application passes untrusted patterns to the
affected functions, directly or through matching libraries. The recursion
advisories explain why output count or length bounds do not stop the parsing
faults. The nested expansion and rewrite fixes add bounds that can return deeply
nested or repeatedly rewritten patterns literally. Therefore the patch must
not be described as identical for every conceivable upstream input.
[Nested expansion advisory](https://github.com/advisories/GHSA-qhr7-859c-m2p7),
[rewrite advisory](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr).

The [published 5.0.12 metadata](https://registry.npmjs.org/brace-expansion/5.0.12)
declares the same MIT license, Node `20 || >=22` engine range and
`balanced-match: ^4.0.2` dependency as the installed line. It satisfies
minimatch's `^5.0.8`. Its tarball SRI was verified during source capture:

```text
sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==
```

This is a proposed exact patch, not a claim that the current installation or
distribution has been patched. No current npm audit was run in this preparation;
the implementation must capture its own before and after audit results.

## Proposed implementation and review scope

After reviewed P1 merges, refresh this branch's basis and compare its closure
with this capture. Change only `node_modules/brace-expansion` in the root
shrinkwrap from 5.0.9 to 5.0.12, with the matching published tarball URL and SRI.
No new override or parent upgrade is needed. Verify no package was added,
removed or unexpectedly re-resolved. Stop and report collateral changes rather
than approving them as part of this patch. Leave `tests/support/pds` and all
historical captures unchanged.

From a clean install, update that package's entry in
`src/core/dependencies-approved.json` and its complete file subtree in
`src/integrity/files-approved.json`. Regenerate retained notices with
`scripts/notices.ts` and check that only the affected notice changes. The
existing dependency import path stays the same. Review the new package bytes,
edges and actual resolution paths; keep the verifier's checks intact. Retain
the new build provenance with validation evidence.

Propose preserving current semantic descriptors and CIDs through the existing
independently reviewed equivalence route. The reason is the absence of an
admitted pattern-matching path, supported by full contract conformance, not
universal equivalence of the upstream library. Independent review must examine
this claim and the exact dependency/file approval delta. Any observed change
to admitted replicated behavior requires a new descriptor and CID under
[the runtime profile](../docs/runtime-profile.md).

Required checks, with execution windows cleared by the performance owner:

1. Retain credential-free before/after npm audit JSON with lock hashes. Report
   direct advisory results separately from propagated ancestor records, and
   distinguish any development-only or residual finding.
2. Clean installation, dependency/file/resolution checks, `npm run check` and
   `npm run build`. Compare the entire approved closure and emitted provenance.
3. `npm run test:runtime`, the full `npm test` suite, and
   `npm run spike:acceptance`. These include authored interpretation and
   activation/evolution cases, package integrity rejection, installed consumer
   conformance, native proof and browser conformance. Record their actual
   coverage and results, including any skip or unavailable external component.
   Acceptance also invokes legacy performance probes: coordinate those runs,
   make no timing claim from overlapping execution, and retain any new reports
   as dated successor evidence. Exclude its overwritten historical report
   files from the implementation commit.
4. Retain a dated implementation report with exact tested head, tool versions,
   lock and manifest hashes, package delta, build provenance and audit results.
   Obtain independent atseq-reviewer review of that exact head before merging.

Preparation ran only the source capture and read-only repository inspection.
Installation, audit, build, conformance, acceptance, exploit execution and
performance measurements remain unrun. M0 stays open until its implementation
and review conditions are fulfilled.
