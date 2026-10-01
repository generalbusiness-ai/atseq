---
date: 2026-10-01
status: internal foundation integrated; independent exact-head review pending
request: bb56eebd1e67a86898433b0d2c7c6fa919bba7c1
promise: 7536eddb9e665e11084aa863d84dd902e9686cd3
approved-main-basis: fc8e20936c849d20e8e28be688afa08b29ce02ed
integration-source: dcacebdf
original-runtime-source: d08104ddae3e737b8de9e13a3e89116e65d84afc
---

# Native authority: integration results

The internal authority foundation now builds and passes its focused Node checks
on approved main `fc8e2093`, which contains the independently reviewed identity
and native wire foundations. The eight authority source and test files are
unchanged from `d08104dd`. Only those owned files and their original report and
captures were cherry-picked; no predecessor collaboration commits were imported.
Full I2 implementation remains open.

The [integration manifest](../experiments/post-spike-evidence/2026-10-01/native-authority-integration/manifest.json)
records the approved basis, exact source and capture hashes, commands and new logs.
The [original results](2026-10-01-atseq-native-authority-foundation-results.md)
retain the detailed authority contract, original evidence and outstanding gates.
Their historical source and dependency basis remain unchanged.

## Fresh verification

`npm run build` and `npm run check` pass on the approved 147-path runtime graph.
The check covers types, formatting, dependency layers and installed dependency
integrity. Root and isolated PDS declaration installs used their unchanged locked
files, with lifecycle scripts disabled. No PDS or provider was started.

A fresh Node 26.10.0 foundation test passed all 54 cases. Separately, Node 22.19.0
and Node 26.10.0 each replayed the exact retained public fixture: 54/54, with exact
outcomes, complete snapshots, hostile-input classifications and preservation of
prior authority after failed authentication or transition. Their ordered case
names agree. The original fixture's raw SHA-256 remains
`a6ca8f0aa56a1986e6fc4e39f13da8b6609d3a6829c1349e94487c9496e4e019`.

All eight original source hashes and ten original capture hashes match. Package,
shrinkwrap, dependency declarations, approval files and the PDS fixture lock are
byte-identical to the original dependency basis and approved main. Native schema,
wire and contract files match the reviewed `cf2dc095` source and approved main.
No runtime graph, semantic profile or public package export changed.

The original Chromium 153.0.8010.12 result remains inherited evidence for the same
source and 54-case fixture. Chromium was not rerun in this integration. Fresh
fixture generation uses random signing material; its successful case result is
captured, while the retained fixture provides the exact replay comparison. This
integration did not run the full test suite or a compiled consumer trial.

## Delivery boundary and recommendation

Request independent review of this exact candidate's authentication capability
boundary, transition precedence and closed snapshot parser before landing it.
Authenticated method and repository evidence produce a private entry capability;
the reducer alone advances opaque authority. A parsed snapshot cannot become
accepted authority. Ordinary actions and activation remain unavailable without
privately derived, supported source/action evidence. There is no caller-controlled
eligibility callback or accepted-state restore factory.

Complete source admission, ordinary eligibility and activation next, then connect
the reducer to atomic Folder interpretation, ordered publication, browser readers
and archive verification. The observer, explicit bootstrap/currentness policy,
retained evidence and assurance display remain required. Checkpoint restoration
must authenticate provenance rather than treating this parser as an authority
constructor. No completed I2, public native support, provider, checkpoint restore
or large-history performance claim is made here.
