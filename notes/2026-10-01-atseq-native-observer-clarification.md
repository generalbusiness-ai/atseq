---
date: 2026-10-01
status: source-only clarification proposed for independent review; no observer runtime
baseline: db0c81747f17f180a034c67791ff1cd287c67a6a
request: bbd1daf0be2dabf21569e558786631c3649e1f47
promise: 800db06b46bd42df60033b119ceaf2fdb26eae12
parent-request: 71b93a9c916f99f9828da61d3737553117e454ab
accepted-observer-source: daade18c86018638509ee5f491aa1aafddd1afc7
---

# Native observer: current epoch mismatch and block-response roots

Propose two clarifications for the accepted internal observer design: preserve
the existing envelope refusal when a selected current epoch differs from the
prepared advance or recovery target, and treat `getBlocks` header roots as
non-authoritative metadata. Both keep the original selected signed commit as the
proof anchor. Neither adds an ordered outcome, observation diagnostic, authority
rule, dependency or public export.

The [accepted observer source](https://github.com/generalbusiness-ai/atseq/blob/daade18c86018638509ee5f491aa1aafddd1afc7/notes/2026-10-01-atseq-native-observer-preparation.md)
and its retained captures remain unchanged. This note is a source-only decision
packet. Its [expectation vectors](../experiments/post-spike-evidence/2026-10-01/native-observer-clarification/expectation-vectors.json)
are proposed future cases, not executed results. The
[source inspection](../experiments/post-spike-evidence/2026-10-01/native-observer-clarification/source-inspection.json)
contains exact source hashes and line excerpts. No observer was implemented,
installed, built, run against a fixture or run against a provider for this packet.

## A current pointer differs from the requested epoch

An advance or participant recovery explicitly names its target epoch. The
selected repository may contain that exact epoch record while a valid
`epochCurrent/self` now names another epoch. The pointer is not absent, and its
CID was not fixed by preparation, so neither existing observer diagnostic
(`subject_absent` or `subject_replaced`) describes this case.

The existing offline authority evidence reader rejects an advance whose target
differs from the selected pointer and rejects the same mismatch for recovery.
Both use `ProtocolError('envelope', ...)`; they do not produce an ordered
ineffectiveness outcome. The online observer should preserve that boundary.
An input refusal here means that the requested target does not match the selected
publication. It does not declare the account, its current pointer or its epoch
record malformed.

The proposed sequence is:

1. Validate the prepared subject against the captured opaque prior, including
   app/genesis, frontier, expected epoch/floor and recovery nonce. Derive the
   required paths from this checked subject.
2. Authenticate the selected commit under the before-method binding. Prove and
   strictly decode `epochCurrent/self` under that same root. Compare its epoch
   link to the explicit advance/recovery target.
3. If they differ, keep this checked envelope mismatch as a pending refusal.
   Fetch and independently interpret the after-method evidence once. A mismatch
   is already established by the authenticated pointer and checked requested
   target; fetching the target epoch or other records cannot repair it.
4. If before/after agree, throw the existing envelope error. Return no descriptor,
   completed request, observation capture, receipt or accepted authority. Do not
   retry solely for this stable target mismatch, fetch a newer root to hide it,
   modify the target, or consume the actor nonce.
5. If the method binding or PLC tip changed, discard the pending mismatch and
   restart the whole observation within the existing three-attempt/shared-budget
   limits. Missing or invalid after-method evidence retains its own existing
   availability/input failure and cannot certify a stable mismatch. Unexpected
   runtime or integrity faults retain their identity.

The caller may explicitly prepare a new unsigned subject from current accepted
state. The observer cannot rewrite an original signed retry; completed exact
retry lookup still belongs before observation. Final control appointment, control
tip, power, epoch reuse and ordered effectiveness remain I2 checks. This note does
not create a standalone permission evaluator.

This comparison applies only to the explicit target of `advanceEpoch` or
`recoverParticipant`. An immutable, still-published grant for an old epoch may be
captured with the actual current pointer. Its `epoch_conflict` or another ordered
result belongs to I2. A grant scoped to another app likewise remains I2's
`grant_scope` case. Do not extend the target-mismatch shortcut into grant admission,
revoke import or interpretation of delegated permissions.

Missing pointer proof is unavailable, not mismatch. Proven pointer absence still
uses `subject_absent` with `expectedCid: null`, after the accepted stable-method
comparison. Malformed pointer data remains the existing input error. These facts
cannot be replaced by a high revision, caller-provided pointer or unchecked
record. Later unrelated repository writes do not change the selected root.

## Block responses do not select a repository root

The installed maintained CAR reader returns header roots separately from body
entries. P1 root authentication requires exactly one root, the selected commit
in the input CAR, its expected DID, a trusted signing key and, for completion,
the original `expectedRoot`. The accepted observer's retained provider inspection
also records that its pinned `getBlocks` fixture emits an empty root list. These
are source findings; no new interoperability claim follows from them.

For exact-block retrieval, propose the following boundary:

- Parse a structurally valid, bounded CAR v1 response with the maintained reader.
  Apply the existing byte, header, depth, block-count and per-block budgets.
  Header roots must be syntactically valid under that reader; accepting metadata
  does not relax framing, hash or resource checks.
- Header roots may be empty, may name the selected commit, or may name other or
  multiple valid CIDs. They do not select a commit, authenticate a key, require
  those CIDs to appear in the body, cause a retry or supply requested blocks.
  No provider-specific empty-root rule is added.
- Verify every body entry against its CID. Count every entry, including repeated
  entries, against the existing 64-block response cap. A requested CID repeated
  with valid bytes adds no second unique block. Verify repeated bytes too.
- Compare the unique returned body CID set with the exact requested CID set.
  An extra body CID is input-invalid even if named in the header or correctly
  hashed. An omitted requested CID is unavailable. If a response both omits a
  requested CID and supplies an extra body CID, the observed extra-block input
  failure takes precedence. A hash/framing failure is input-invalid and cannot
  be hidden by an omission or persuasive header root.
- After these checks, compose the owned verified blocks with the original signed
  commit, using a new one-root CAR whose root is that original commit. Reauthenticate
  under the before-method key and original `expectedRoot`. A response's root
  metadata is never copied into this authentication input.

Discovery rounds still batch and deduplicate missing CIDs across every known
required path. A response cannot add an unrelated commit or tree node merely
because its header calls that block a root. The original signed commit is retained
from root selection; a header assertion never substitutes for its bytes. A full
`getRepo` recovery remains separate: authenticate its selected root, and restart
the whole method observation if that authenticated root differs from the original
selection.

Use P1 `lookup(path)` without an expected CID in this observer. Compare the found
CID separately when constructing `subject_replaced`; `lookup(path, expectedCid)`
otherwise throws before returning that diagnostic. This changes no P1 API or
offline authority assertion rule.

## Review and implementation gates

Independent review should confirm that these clarifications preserve the accepted
observer/refusal and I2 boundaries, that stable epoch mismatch needs no new public
diagnostic, and that ignoring root metadata introduces no authority ambiguity
when every body hash, requested set and original-commit recomposition is checked.

After acceptance, implementation must execute the proposed vectors with genuinely
signed repository and method fixtures. Exercise pointer mismatch before and after
identity rotation, invalid or unavailable after-method bytes, ordinary old-epoch
grant capture, absent/missing/malformed pointers, empty/same/other/multiple header
roots, body omissions/extras/bad hashes/duplicates, the 64-entry cap and missing
node discovery rounds. Compare outputs through the existing offline reader with
all network calls disabled; preserve no-capture/no-retarget/no-consumption
assertions for refusals. Run applicable host cases on Node 22.19, 24 and 26 and
portable proof/output cases in actual Chromium. Mock public fixture success does
not substitute for the still-open guarded transport and provider trials.

Policy/support dispatch, native registration, app publication, atomic host
integration, retained floors on restore and public assurance presentation remain
joint implementation gates. This packet does not close full I1, I2 or N1.
