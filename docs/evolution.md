# Compatible definition changes

S5 adds one reserved control action, `test.atseq.activate`, to the application
runtime. Applications still declare ordinary behavior through Lexicon, JSONata
and Inlay. They cannot bind or override this control action.

An activation is an ordinary signed intent and gets an ordinary entry and
receipt. Its payload names `expected` (the current definition CID), `definition`
(the candidate CID) and `closure` (the sorted unique manifest/file CIDs). Only a
key explicitly listed in the pinned genesis activation grant may activate.
The sequencer records the action without deciding its application effect.

At entry N, the folder checks the old definition and grant, fetches and verifies
the signed closure, validates the candidate, and compares its complete reachable
state schema and runtime identity. This first version requires exact equality
of the state schema graph, including transitive references; unrelated action
and query definitions in the same Lexicon document may change. It also validates
the existing state against the candidate. It keeps that state; it never reapplies
the candidate's initial state. An effective N persists the new active definition
and unchanged state together. N+1 uses the new behavior.

A second activation from the same old definition is recorded ineffective with
`definition_changed`. An ungranted actor is ineffective without fetching its
candidate. Malformed or available invalid candidates are ineffective; missing
or corrupted content pauses interpretation at N. Retrying after content repair
replays that same entry. No unavailable dependency becomes a fabricated verdict.
A failed projection write leaves both active definition and state at N-1.

## Review and apply

Open an app and use **Import updated definition CAR**. The worker compares the
candidate with the current definition and independently replays the existing
prefix. The panel shows preserved state, current/candidate interfaces and replay
results. Importing or comparing does not sign, append or upload to the PDS.

Only **Apply change** stages the source on the PDS, then signs and queues an
activation under the displayed expected definition. A failed stage preserves
the unsigned draft. If another activation wins, the queued activation remains
unchanged; use **Review update again** to compare against the new definition.
The comparison cannot guarantee that a later entry will remain applicable.

An offline ordinary action retains its original signature, nonce, payload and
old definition. Reconnection sends those exact bytes, which remain in history
as `definition_changed`. **Review with updated form** carries entered values
into the current form. Only **Save action** creates a new intent and nonce. The
old intent and outcome remain visible. A removed action has no replacement form.

The device outbox admits at most 100 waiting actions per app. Admission, the
counter and each queue item commit in one IndexedDB transaction. Sending and
pending preview follow that local order, preserving dependent offline actions.
Recorded items await interpretation without repeated submission. A late network
reply cannot replace an already verified terminal outcome.

## CLI and service methods

The documented [JSON adapter](interaction.md) additionally supports:

| Operation | Additional input beyond host/app/genesis | Result |
|---|---|---|
| `compare` | `expected`, `source` CAR path | Candidate/current interfaces, closure, preserved-state and replay checks |
| `stage` | `expected`, `source` CAR path | The same comparison after retaining candidate content on the PDS |
| `activate` | `definition` (expected current CID), `candidate` (new CID), `closure`, `keyFile`, `intentFile` | Signed activation and canonical receipt |
| `prepare` | Same fields as `submit`, including `action` and `payload` | Persisted signed intent, without submission |

`activate` is shorthand for `submit` with the reserved action and payload. For
an activation to be prepared without submission, use `prepare` and that explicit
payload. `prepare`/`submit` validate new work against a verified current prefix;
retrying an existing intent file verifies and reuses its bytes without rewriting
it for the current definition. Use a new file only after reviewing new work.

The public Lexicon methods `compareDefinition` and `stageDefinition` implement
comparison/staging. `sync` carries the initial source CAR and candidate CARs
needed by recorded authorized activation attempts. The worker verifies content,
genesis, history and interpretation independently. It does not trust the host's
claim about which candidate took effect.

## Runtime version and limits

S5 pins a new complete application runtime contract, `atseq-folder-activation-v0`.
The immutable S0 engine identity and independent S1 vectors are unchanged. Apps
created with the S3/S4 application profile still require that older installed
runtime; loading them into S5 is explicitly refused. This spike does not provide
transparent runtime upgrades. Compatible activation within an app retains its
one pinned runtime identity.

The source pool is bounded to 2,048 blocks / 16 MiB, and a sync returns at most
32 distinct authorized candidate closures. This is a small-history operational
limit, not unbounded evolution. Runtime/schema migrations, grant changes,
rotation and delegation remain later work. Pending activation has no speculative
control fold; its pending preview reports unavailable until canonical replay.
Complete archive/offline bootstrap and performance measurements are S6 work.

## Reproduce

```sh
npm run check
npm run test:flows -- --group evolution
npm test
```

The evolution gate combines nine focused control/recovery scenarios with twelve
real-PDS browser/CLI scenarios (23 passes including their two parents). It
includes missing/corrupt source repair, atomic persistence failure, racing and
unauthorized activations, exact stale delivery, explicit replacement, ordered
offline dependencies, incompatible changes and host restart against the same PDS.
