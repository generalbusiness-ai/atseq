---
date: 2026-10-02
status: proposed successor; source inspection only; independent review required
predecessor: 364457c8934250768d2624f40b2676bb48aa4c89
assessment: c2139bbeafe3bb494b7bca4537d5dae573fe1b49
request: f999b4a17086f87a0d5f65a4d0bcec2a09f8d994
promise: 916b84edba91a081576209c591a822879200be30
parent-request: 110166f98b30a4ae5de2684d011e2252c97102f7
---

# Provisioning review: temporary web keys and migration custody

Apply these requirements before implementing the [provisioning proposal](2026-10-02-atseq-app-provisioning-boundary.md).
The independent assessment accepted its source inspection and required an
explicit temporary-key lifecycle. This successor supplies that lifecycle and
the assessment's two migration/adapter clarifications. The original notes and
evidence remain unchanged; this note takes precedence on these three points.
All acceptance scenarios remain unexecuted. No account setup or recovery has
been demonstrated.

Continue to prefer an existing ATproto account without requiring a hostname.
The app PDS holding the repository signing key can construct another ordering.
Recovery must preserve the app's accepted history, governance and newer local
floors. None of these clarifications changes that authority choice.

## A2-1: a temporary web key grants account control

A temporary private key advertised as `did:web:H#atproto` can issue service JWTs
as that DID. Its holder can choose other audiences and methods and can attempt
to stage accounts at other PDSes. Calling it an import key does not constrain
its cryptographic authority. A method-bound short-lived JWT constrains that
token, not the underlying private key. The inspected official
[`createServiceJwt` and verifier](https://github.com/bluesky-social/atproto/blob/3cd9fa6013efad3ab57704ae804952be097e5d26/packages/xrpc-server/src/auth.ts)
take audience and method separately from the signing key. Reuse those maintained
owners; do not implement another JWT signer or authorization manager.

The following replaces the temporary-key handling in hostname setup steps 2–5
and the unavailable-old-PDS web migration fallback:

1. Complete destination discovery, public hosting preparation and required
   setup input first. Generate a fresh key just before publishing the temporary
   document and making the intended import request. Keep it only in private
   setup custody, outside routine OAuth, repository/app data, logs and backups.
   Retained public evidence may record its public identity; it must not contain
   the private key or token. In the existing private setup journal,
   bind the intended DID, destination service DID, provider, key reference and
   a short enforced custody deadline. A restart cannot renew that deadline.
2. Publish the temporary public key and independently check the exact DID,
   handle and configured PDS. Mint **one** short-lived JWT for this setup
   attempt: issuer exactly `did:web:H`, audience exactly the discovered and
   checked destination service DID, and `lxm` exactly
   `com.atproto.server.createAccount`. Use the maintained tool's short default
   expiry, or a shorter expiry, never beyond the custody deadline. Do not mint
   method-less, different-audience or replacement tokens from this key. One
   token is a local custody rule, not a provider's single-use or idempotency
   guarantee.
3. Submit the intended `createAccount` request. Once the staged account is
   identified, immediately obtain the destination's public repository key
   through private account management and replace the temporary web key.
   Rotation must not wait for OAuth, app bootstrap, content migration or an
   activation attempt. For migration, imported content and preserved floors
   still gate activation and later app writes.
4. Independently read back the public document through the existing bounded
   identity transport. Require the exact DID, destination key, service and
   handle. Once that check succeeds, delete the temporary private key and
   token from owned setup custody and release all live signing handles before
   activation. Failure to delete or close the handles stops activation. Keep
   only public evidence and safe journal state. Logical deletion cannot prove
   erasure of unknown copies, device backups or provider caches; deployment
   custody must prevent such copies and disclose any residual exposure. Public
   rotation is not a claim of instantaneous revocation at every verifier.
5. If readback still advertises the temporary key, differs from the destination
   binding, or is unavailable, stop: no activation, OAuth completion or app
   append. While the original short window remains open, repair/read back only
   the same intended binding and staged account. On expiry, abandonment or
   unrecoverable ambiguity, delete the temporary custody and token even if
   destination readback has not succeeded. Report incomplete setup and the
   last known public binding; do not retain the key indefinitely to finish
   later. Web control must separately repair any remaining temporary public
   binding before another setup attempt can be considered.

After a lost creation reply, reconcile only the recorded account/DID/provider
within that original window. Use recorded account-management access, rather
than issuing another service JWT or treating the token as an idempotency key.
If the outcome cannot be identified within the window, stop and erase temporary
custody. Later recovery is a separately recorded operation that first resolves
the uncertain allocation; it cannot silently mint another token, extend the
old key's lifetime, allocate another DID or start another destination account.
This supersedes the original `expired-import-jwt` vector's token-refresh answer.

When the old PDS is unavailable, require retained accepted content and explicit
web-hosting control before attempting the same bounded temporary-key procedure.
Pause app writes during the handoff. Stage the same DID at the explicit new
PDS, rotate promptly, verify public readback and erase temporary custody as
above. Restore/import the complete accepted prefix, preserve all newer floors
and reconcile exact pending writes before activation and later app writes.
Missing history is not permission to create an empty same-genesis app. If the
old PDS is available, prefer its ordinary maintained service-auth path; do not
introduce a temporary key merely for convenience.

## A2-2: preserve A1's operation failures

The account-writer adapter depends on independently reviewed A1-F2, whose
frozen source is `022404f525131318ebe450f7ee20bed64a8b0408`. The delivery candidate
`fe7f451490716e215c02dd6655b4ddf4dcc98edc` was awaiting exact-head review when
this successor was prepared. These pins identify a dependency, not accepted
main behavior. The predecessor's inspection pins remain the source evidence.

Adapt the owned session's `request` operation without flattening its sanitized
typed failures. Owned deterministic request/URL/body/count policy failures
remain `input`; transient transport/body-read/deadline failures remain
`content_unavailable`. Preserve other owned categories, including custody
`origin` refusals. An HTTP provider refusal is not automatically a transport
failure. An unavailable response is not a successful publication, an empty
repository or a proven invalid app action. The native publisher still owns
reconciliation of an uncertain conditional write; the adapter cannot retry it
unconditionally. Do not expose provider, SDK or credential-bearing error text,
and do not invent a second cause classifier in the writer. Use the accepted
A1 operation boundary and the existing bounded XRPC decoder for their respective
failures. Actual adapter cases must exercise both classes through the real
owned session request path before implementation can pass review.

## A2-3: retain higher-priority PLC recovery during migration

Strengthen the predecessor's `cooperative-plc-migration` vector: the submitted
PLC operation must include the independently held recovery public key at a
higher priority than PDS-controlled rotation keys. Destination recommendations
are inputs and may omit that key. Inspect the complete operation before
submission and verify the resulting canonical **full signed PLC history**,
including the recovery key's actual priority, after submission. A latest DID
document, a recommendation or unsigned setup metadata cannot prove that result.
If the key is absent or lower priority, stop migration completion and report the
unsatisfied independent-recovery condition; do not claim successful recovery
or silently switch authority modes. Activation/reauthorization and resumed app
writes still depend on the retained prefix, binding and floor gates.

Use maintained PLC tooling and the existing full-history verifier. Do not add a
rotation interpreter, resolver, witness service or private-key transfer to the
PDS. The original operational/provider acceptance gates remain open.

The [successor vectors](../experiments/post-spike-evidence/2026-10-02/app-provisioning-review-clarification/acceptance-vectors.json)
and [manifest](../experiments/post-spike-evidence/2026-10-02/app-provisioning-review-clarification/manifest.json)
retain the exact predecessor references and proposed checks. Independent
successor review and workroom adoption precede implementation.
