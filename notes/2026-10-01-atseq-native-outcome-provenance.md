# Native application outcome provenance

Date: 2026-10-01. Status: source-only joint N1-D2/P4 decision proposal.
No runtime, evaluator, current authority serializer or checkpoint parser change.

This supplements D2 request `d67d16683c2b6eae0f036ea8c87c6d225cdf746d` and
promise `83c7b891f6051624c17147ef47879e4202da79db` before native folder/source
implementation. [D2](2026-10-01-atseq-native-source-admission.md) remains frozen
at `d118f156`; its note SHA-256 is
`23e34a38d6b8a4e83ed9f56d4c4f0a0e53a21822025544df795737d00df81afb`.
I2 foundation `d08104dd`/`0095` and P4's pending source/schema work are inputs,
not evidence of ordinary-action serialization compatibility.

Keep framework denial reasons separate from application fold reasons in the
native application projection and its optional checkpoint outcome rows. This
implements NW0's separate namespaces without changing the pure evaluator result
or adding a native content-union member. Outcome provenance describes which
interpreter stage produced a denial; it is not a proof or assurance label.

## Closed common outcome

Use owned plain JSON with exactly one of these shapes:

~~~typescript
type NativeApplicationOutcome =
  | { decision: 'effective' }
  | { decision: 'ineffective'; source: 'framework'; reason: FrameworkReason }
  | { decision: 'ineffective'; source: 'fold'; reason: FoldReason; message?: string };
~~~

The effective branch has only `decision`. The framework-denial branch has exactly
`decision`, `source` and `reason`. The fold-denial branch has those three fields
plus optional `message`. No extra fields, `$type`, state, exception objects or
caller-supplied proof flags. Conditional closed validation is required; a loose
superset object with optional fields is insufficient.

A fold reason retains the evaluator's `[a-z][a-z0-9_]{0,63}` rule: 1–64 ASCII
characters. It can equal a framework name, such as `grant_revoked`, without
becoming a framework assertion. Its `source` remains `fold`.

A framework reason must be an exact member of the supported native/application
reason table, or `fold_failed/<code>` where `<code>` is an explicitly supported
deterministic fold/input/output validation code for that stage. The outer bound
is 76 ASCII characters: the 12-character prefix plus at most 64 for the code.
The grammar alone does not authorize arbitrary names or arbitrary error codes.
Authority examples include `grant_revoked`, `authority_unchanged`, `role_stale`
and `control_power`; app examples include `unknown_action`, `invalid_action`,
`execution_changed`, `invalid_activation` and `incompatible_definition`.
The complete exact table/code set and precedence must be retained in the reviewed
contract/conformance, not assembled from all exception strings at runtime.

For the smallest first contract, framework denials have no replicated message.
Local diagnostic text remains outside the ordered outcome. Fold messages retain
the existing optional string: well-formed Unicode, at most 1024 code points and
4096 UTF-8 bytes. Preserve the authored string without trimming, formatting or
localization. Existing enclosing JSON/CBOR bounds still apply.

## Producers, not caller flags, select provenance

The [current folder](../src/application/folder.ts) puts framework and valid user
fold reasons in the same ineffective shape. Its outer invalid-input catch can
produce `fold_failed/<code>`. The
[pure evaluator](../src/runtime/evaluator.ts) already accepts only exact effective
`{decision,state}` or ineffective `{decision,reason,message?}` results and rejects
extra keys. I2's current authority result is just `{decision:'effective'}` or
`{decision:'ineffective',reason}`. Preserve that frozen implementation until joint
review authorizes an adapter or successor.

The future native folder chooses provenance at its checked internal callsite:

- A denial returned by its actual I2 evaluation of opaque prior authority and
  authenticated entry becomes `source:'framework'`. There is no public adapter
  accepting an arbitrary claimed authority result as trusted computation.
- A valid ineffective result returned by the unchanged pure `fold` evaluator
  becomes `source:'fold'`, retaining its bounded reason and optional message.
- A supported deterministic input/evaluation/output/state-validation failure in
  the designated fold stage becomes a framework denial with the reviewed code.
  Known input mismatch may use `invalid_action` under the adopted precedence.

Do not classify every `invalid_input` caught anywhere as a fold failure. Native
proof, framework envelope/signature, source admission, semantic-support and
persistence checks keep their own boundaries. Unknown exceptions, runtime or
integrity faults do not become ordered framework reasons.

A fold returning `source:'framework'` has an extra result field, so it fails the
unchanged evaluator result contract. It cannot mint an authority denial. The
resulting framework failure is `fold_failed/fold_output`, assuming that supported
code and the stage are confirmed by conformance. A valid fold returning only
`reason:'control_power'` instead remains a fold denial.

Deserializing an outcome from an archive/checkpoint validates only its shape and
namespace. It does not mint a verified interpreter result. An independently
replayed/audited projection compares every field, including source and optional
message. Native-publication checkpoint assertions continue to assert state rather
than proving execution merely because their outcome rows have this field.

## Atomicity and unavailable/fatal conditions

The outcome belongs to its exact interpreted entry/frontier and is committed
with domain state, active source, authority and complete retry/descriptor indexes.
Fold denial retains prior domain state. A framework denial does not universally
mean that every authority field remains unchanged: an accepted ordinary account
observation may still advance its floor or consume a descriptor under I2's rules.
Keep that actual next authority state in the same coherent commit.

A stall has no replicated outcome and does not advance the interpretation
frontier. Invalid selected history/proof fails closed, also without inventing a
domain denial. Missing source/evidence, unsupported semantics, local capacity,
runtime/integrity failure and failed persistence remain unavailable/fatal in their
respective APIs. They are not extra `decision` variants in this outcome schema.
Sparse publication, prefix assurance and checkpoint audit status remain separate.

## Joint review and required vectors

This is a new application outcome ABI/projection rule, so the native application
semantic contract, relevant service projection schema and P4 row/schema identity
must explicitly bind it before adoption. The pure evaluator contract remains
unchanged. Do not reinterpret old unlabelled rows, update F1's captures, claim that
current I2 serializes ordinary acts, or enable native act/activation early.

Required source-only vectors for subsequent implementation review:

| Input or producer | Required projection |
| --- | --- |
| Actual I2 rejects revoked grant | Ineffective, framework, `grant_revoked`, no message |
| Valid user fold denies with `grant_revoked` | Ineffective, fold, same reason; bounded optional message |
| User fold supplies `source:'framework'` | Evaluator rejects extra field; checked framework `fold_failed/fold_output` |
| Deterministic supported fold/schema failure | Framework reason/code; no exception text |
| Unknown/transient/runtime failure or persistence rejection | No committed outcome/frontier advance |
| Effective fold | Effective outcome only; state stored in the coherent projection |
| Ineffective accepted account no-op that advances its floor | Framework denial plus the actual I2 floor/consumption state, atomically |
| 64-character fold reason / 76-character framework prefixed reason | Accept only the appropriate valid namespace/code |
| Oversized reason, unknown framework name/code, source omission, extra effective fields or framework message | Reject the common outcome schema |
| 1024 supplementary-plane message characters / 1025 characters / malformed Unicode | Accept the first within 4096 UTF-8 bytes; reject the others |
| Claimed checkpoint changes fold to framework or adds/removes message | Full execution audit detects unequal outcome; publication alone cannot prove it |

These vectors are requirements, not executed results. This task inspected current
source only and ran no build, test or benchmark. N1 source admission/native folder,
I2 integration and P4 serializer/policy adoption remain joint review gates.
