# Native source owner: implementation results

Date: 2026-10-01

N1-F2 request `1521c26e9317a5324a8870a51ac92288c4479b3e` and promise
`19d2e6d1ce4e9465342b1bd983df1e68c0de844e` now have an implementation candidate
ready for independent review. The exact code tested is
`378880b45d178a6f4cbdfece7327626df7f4e7fc`. This establishes private complete-source
admission and source results. It does not complete native activation or N1.

## Result boundary and reviewed simplification

The independent N1-D4 assessment
`5dc2b51f6b768c80d3e7311f654d1191aea869df`, ratified by
`077b410509bd94ffb5a84b573872a33b931cbc93` and adopted by
`5c54cc850851313a6de6096874f477543d72bac6`, recommended a simpler boundary than the
original source-only packet. There is no concrete queued, cached or prefetched
handoff. `assessNativeSource(target, reader, localOptions)` therefore returns a
frozen discriminated union directly:

```ts
{ kind: 'admitted'; definition: NativeSourceDefinition }
| { kind: 'proven_invalid' }
| { kind: 'incompatible'; actualSemantics: string }
```

No additional assessment token, WeakMap, factory, bound-read operation or token
vectors were added. The admitted branch retains the existing private definition
capability. Only that completely admitted capability can prove an action absent
or mint the source's action capability.

The owner copies and freezes the selected root, compiled expected semantic CID
and exact closure vector before its first await. It also captures local options.
Collection verifies complete supplied bytes and their identities; normative
count, root, canonical CAR and decoded named-occurrence checks precede source
interpretation. Both closure size measures are capped at 512 KiB. The same pure
strict JSON parser now serves the source owner and checkpoint DATA reader.

Known checked branches return source facts. Reader calls sit outside source
classification catches. Pure source stages have explicit input-error allowlists;
foreign constructors, unexpected runtime faults and strict-parser owner-input
faults propagate unchanged. The static evaluator allowlist remains unchanged;
only explicitly recognized data-dependent preflight failures can be deferred.
Diagnostic convenience APIs still throw useful local errors, but those errors
are publicly constructible and must never serve as source evidence.

A future activation coordinator must call this owner itself using its owned
capture of the authorized target. It must not accept source facts as a parameter.
The result alone grants no authority: the coordinator still needs current
context, expected active definition and atomic-base checks before recording an
outcome. No coordinator, activation outcome, accepted authority, grant or eligible
execution capability is included here.

## Checks and results

| Check | Result |
| --- | --- |
| Portable retained/hostile source corpus, Node 22.19.0 | 93 cases passed |
| Same corpus, Node 26.10.0 | Same 93 case names passed |
| Actual Chromium 153.0.8010.12 | Same 93 case names passed |
| Actual pure-call foreign-fault test bundles | Same 3 cases passed on both Node versions and Chromium |
| Actual production build, Node 22 and Node 26 | Same 27 compiled cases passed on each |
| Production build | Passed |
| TypeScript, formatting, layers and dependency integrity | Passed |

The retained corpus covers the accepted native/application literal blocks,
source identity vectors, recursive/shared schema projection, literal annotation
handling, private definition/action capabilities, complete admission and every
bound program/view. New result cases exercise mutation before and during awaits,
real forged public errors from readers, fake status objects, unknown expected
semantics, strict JSON/schema/program/view failures, exact selected omissions
and extras, local limits, and earlier oversized bytes followed by corrupt or
missing selected blocks. Complete verified oversized bytes prove invalidity even
with smaller local retention; local capacity alone produces no classification.

Three test-only Vite transformations throw a foreign static-looking interpreter
error, a foreign interpreter subclass, and a strict parser owner-input error at
the actual pure-call sites. Tests assert that the exact thrown object escapes.
These transformations do not edit production files or add a production injection
callback. Their bundle sizes and hashes are recorded separately from the ordinary
Chromium bundle. The compiled probes exercise the actual production output;
they do not substitute its interpreter or parser.

The maintained streaming hash resolves to
`node_modules/@noble/hashes/esm/sha2.js`, version 1.8.0, with SHA-256
`e729088b82e5450bff54c3a0013582aa42e1fe8f58dd31f5967f6ebe34c52299`, matching the
already approved physical file catalog. Portable vectors compare maintained
incremental and one-shot hashing. No dependency, package, lock, profile, notice,
public export or existing native-authority file changed. The existing public
supported profiles still do not advertise the new application contract.

One validation scheduling mistake is retained honestly: a default TypeScript
check ran while the production build replaced `dist` and could not resolve
`#atseq-integrity`. The build passed, then a sequential check passed. Its failed
log remains `check-concurrent.log`. A managed browser attempt returned loopback
`EPERM`; root performed the final unrestricted Chromium run. No more functional
reruns were needed after the successful final gates.

## Evidence and recommendation

Evidence is in
`experiments/post-spike-evidence/2026-10-01/native-source-admission/direct-owner-378880b4/`.
The manifest records ten capture hashes, 136 exact build source hashes, twelve
validation source/fixture hashes, commands, maintained primitive bytes and exact
decision pins. Build provenance and browser JSON are byte-preserving copies of
actual generated captures. Node/Chromium case lists and compiled Node lists were
compared directly. These are validation runs, not performance measurements.

Preparation `36c758a17a56225f776bb686f9c33ecd7bfc1540`, the original D4 proposal
`dbea8da69e0539a8a8a0adc2b3dfd72d26311a58`, and pre-assessment report
`63c8a70b8a133ce240772f271ebd78480850d13d` remain unchanged. The implementation
integrates approved parser main `db0c81747f17f180a034c67791ff1cd287c67a6a`.
The historical D4 packet describes the superseded token proposal; this report
records the adopted direct-result implementation.

Recommend independent review and landing of this private source owner. Then
implement the separately tracked coordinator using a direct owner call, current
authority/context checks and an atomic transition. Full N1 remains open until
that integration and its outcome/frontier tests pass.
