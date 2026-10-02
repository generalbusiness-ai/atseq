# Native source owner: validation before the assessment decision

Date: 2026-10-01

This records initial N1-F2 validation under request
`1521c26e9317a5324a8870a51ac92288c4479b3e` and promise
`19d2e6d1ce4e9465342b1bd983df1e68c0de844e`. It is not final N1-F2 or full N1
completion. Owner-proven failure classification remains gated on the separate
N1-D4 source-only proposal `dbea8da69e0539a8a8a0adc2b3dfd72d26311a58`.

The exact code run was `bd7f9b8039ff0648db1b5a31bd54635e3ca1b989`. This separate
successor retains preparation `36c758a17a56225f776bb686f9c33ecd7bfc1540` and
integrates approved parser main `db0c81747f17f180a034c67791ff1cd287c67a6a`.
The original preparation report/capture and D4 proposal remain unchanged.

## Results

| Check | Result |
| --- | --- |
| Portable source/hostile corpus, Node 22.19.0 | 74 cases passed |
| Same corpus, Node 26.10.0 | Same 74 case names passed |
| Actual Chromium 153.0.8010.12 | Same 74 case names passed |
| Actual compiled build, Node 22 and Node 26 | Same 12 retained source/stream cases passed on each |
| Production build | Passed; installed dependency bytes verified |
| TypeScript, formatting, layer and dependency checks | Passed |

The corpus checks 14 independent retained native/application CBOR blocks and
11 source identity vectors from N1-D3. It also covers complete admission,
strict/owned JSON, maintained schema constraints, all bound programs and views,
iterative recursive/shared and long references, annotation/literal handling,
private definition/action capabilities, ownership, 32 KiB projection framing,
closed-set omissions/extras, deduplicated named aliases, canonical logical CAR
size, operational bounds, complete oversized streams and corruption precedence.

The compiled probe independently resolves the maintained primitive to
`node_modules/@noble/hashes/esm/sha2.js`, version 1.8.0. Its SHA-256 is
`e729088b82e5450bff54c3a0013582aa42e1fe8f58dd31f5967f6ebe34c52299`, matching the
existing approved file closure. No dependency, package, lock or notice changed.
The Chromium capture records the actual bundled maintained hash module paths.
The existing public supported profiles do not advertise the new application
contract.

An initial exploratory case found that program path lookup inside evaluator
preflight's data-dependent-error catch could swallow an undeclared fold path.
Source text lookup now happens before that catch. Both missing paths and invalid
UTF-8 program bytes fail their own source checks. All retained passing captures
run the corrected source pin above.

The first browser attempt was blocked by managed loopback restrictions
(`listen EPERM 127.0.0.1`). The authorized unrestricted rerun passed. Both raw
attempt logs are retained. The production build emitted its existing chunk-size
advice; it completed successfully. No latency or process-memory target was set.

## Retained evidence and next step

Evidence is in
`experiments/post-spike-evidence/2026-10-01/native-source-admission/pre-assessment-bd7f9b80/`.
Its manifest records ten capture hashes, the complete build provenance with
136 source hashes, the validation source/fixture hashes, commands and source
pins. The browser JSON and build provenance are byte-preserving copies of their
actual generated captures. Log timings describe these validation runs; they are
not performance measurements or recommendations.

These successful gates establish the prepared source/admission behavior. They
do not establish owner-proven source failure classification: the current API
still throws publicly constructible errors. No activation producer, accepted
authority, grant or eligible-execution capability was added.

After independent acceptance of D4, implement its minimal private assessment
boundary, rerun the affected portable and compiled cases, build/check the exact
successor, and retain new captures separately. Only that final source/report
should enter N1-F2 independent review. Full activation/coordinator and N1 remain
separate implementation work.
