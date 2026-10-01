# Integrity resolver stdin correction — 2026-10-01

The independent P1 review found an intermittent local build and packed-consumer
hang at `b4c7fb72`. The integrity adapter passed a JSON dependency graph through
`execFileSync` to a child that read stdin with `readFileSync(0)`. The promoted
dependency graph increased the reviewer’s payload from 61,305 to 66,700 bytes.
On Node 26.10.0, macOS arm64, the reviewer observed three hangs in twenty
synthetic synchronous reads, and none in twenty asynchronous reads.

This correction makes the child consume stdin with its asynchronous iterator,
then parse the complete JSON string. Explicit UTF-8 decoding preserves characters
split between chunks. The parent remains synchronous: all existing dependency
file, package scope, alias, import-condition and approved-target checks finish
before interpretation. There is no temporary file or additional cleanup step.
Dependency approvals, provenance and semantic profiles are unchanged.

The existing child-resolution call is extracted into an internal adapter helper
so the regression exercises the production child. This helper is not exported
through a public package entry point; it does not replace the admission checks
in `verifyInstalledDependencies`.

The regression passes 4,096 real `jsonata` edges, asserts that the JSON payload
exceeds 256 KiB, and checks twenty complete batches. Each batch must return both
Node import and require resolutions for every edge. An outer process timeout
bounds a recurrence without depending on a timer in the synchronously blocked
adapter process. The existing integrity test still covers file mutation, nested
dependency shadows, source scopes and conditional-import drift.

Validation on Node 26.10.0, macOS arm64:

- The focused integrity test file passes both tests, including twenty complete
  resolver batches. The synthetic payload is 552,961 bytes in this checkout.
- Formatting, source-layer checks and installed-dependency closure checks pass.
- The full `npm run check` cannot complete in this focused worktree without
  compiled distribution files and the separately installed PDS fixture; TypeScript
  reports those missing modules. The native-proof owner will run that check with
  its complete build and fixture setup during integration.

The native-proof owner will integrate this correction and run the full revised
P1 corpus, package and browser suite. This focused correction makes no performance
claim.

Review: gitseq assessment `7f26f640fa05c85716489d3197b10ce51032a868`,
ratified by `3b67a8f56952fbbe3bcbd5467f399f2d7e9710d6`; implementation is tracked
under P1 promise `be1929ef9f89d041b5db1203f4cf12385f24d077`.
