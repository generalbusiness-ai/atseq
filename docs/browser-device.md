# Browser sessions and device storage

The shell holds one app session: its app DID, pinned genesis CID and active
definition CID. App queries, views, validation, pending previews, comparisons
and archive exports carry all three fields. The worker rejects a different
session. Source previews and archive imports are separate verification work;
they do not borrow the current app. Opening another app ends the previous page
generation, terminates its worker and prevents its late replies from changing
the page or its exports.

Only a verified sync or archive import pins an invitation. **Forget this
invitation** removes the pin and cached history. It keeps signed outbox work,
which still names the original genesis. A host's application list is a list of
invitations to verify, not trusted pins.

A cancelled, failed or timed-out worker rebuilds from the saved verified prefix
before interpreting a host update. This preserves rollback and fork detection.
The evaluator holds that saved prefix before starting the first load, always in a fresh worker. The shell holds host refreshes until it has decided whether device storage contains a saved prefix. A failure to load it keeps the app unavailable until it can be rebuilt; it never authorizes a shorter host history. Cancellation is available during startup. After three consecutive worker failures the shell requires a page reload; a successful reply resets that count. Saved inputs and signed work remain on the device. A definite verification refusal shows **Saved history on this device failed verification**. **Discard saved history** explicitly warns that this device loses rollback protection; it deletes only the saved prefix before fetching and verifying a new one. It keeps the invitation pin, key and signed work. **Forget this invitation** remains available on the failure screen. A rebuilt saved state stays visible when a host update is refused. Archive import uses a separate evaluator and checks the archive against the saved prefix before replacing device history. The storage transaction also refuses a shorter or forked replacement if another operation saved newer history meanwhile.

## Signing keys

Browser identities use non-extractable P-256 WebCrypto private keys. IndexedDB
stores `CryptoKey` objects, not raw private bytes. The shell alone can sign;
application views and evaluation workers receive no key capability. Existing
raw device keys are converted to non-extractable keys without changing their
public identity. CLI key files remain a separate, explicitly exportable format.

Clearing site data loses this device's key and any initial app-update grant tied
to it. Keep another authorized device before clearing site data. Non-extractable
keys prevent key export; same-origin code that owns the shell can still use its
signing capability.

## IndexedDB schema

Database `atseq-device-v0`, version 1, has one `values` object store. Reads of
lists use a bounded key range. Updates and admissions resolve after a strict
durable transaction completes.

| Key                             | Value and purpose                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `identity`                      | Display name, public DID key and non-extractable private/public `CryptoKeyPair`               |
| `apps`                          | Last seen invitation list, with display titles; not trusted pins                              |
| `pin:<app>`                     | Verified invitation `{app, genesis}`                                                          |
| `verified:<app>:<genesis>`      | Worker-verified retained input; rebuilt before any new host history is interpreted            |
| `outbox:<app>:<intent CID>`     | Original signed block, invitation, local order, transport status, receipt and observed effect |
| `outbox-order:<app>`            | Monotonic local admission counter                                                             |
| `draft:<UUID>`                  | Source bytes, revision, stable creation UUID, frozen grants and optional published invitation |
| `draft-source:<definition CID>` | Local draft UUID for this source                                                              |
| `change:<app>`                  | Candidate source, expected definition and verified comparison                                 |

The outbox submits queued work at startup and when connectivity returns. A save
during a flush schedules a further scan. An uncertain reply, authentication,
quota or availability failure keeps the original bytes queued. Explicit signature, canonical wire, request-schema and nonce-conflict refusals are final, as are complete-prefix and append-capacity limits. Refused items retain their signed bytes and show the host-access or capacity message. **Resend
original signed action** retries those exact bytes. A recorded receipt and an
interpreted effect remain separate states.

## Shell updates

The service worker caches only the installed shell's hashed HTML, JavaScript
and CSS. It never caches XRPC responses or credentials. A new shell waits for
old controlled tabs to close; it does not force activation or claim clients.
Older shell caches remain available for open tabs' lazy worker assets. Site
storage cleanup is explicit, because it also affects device keys and work.

The shell is split into typed session, identity, outbox, draft, change and export
modules. `browser/protocol.ts` defines the worker operations and replies;
`main.ts` connects them to navigation and the current page.

## Remaining liveness limits

A single refresh runs at a time across this page's apps. A slow old-app request can delay the new app until its bounded request finishes; cancelling stale host requests is deferred. Session and saved-prefix checks still prevent its reply from changing the new app.

Transient outbox work retries at startup, on the online event, after a save or by explicit retry. Timer-based backoff is deferred; staying online alone does not schedule another attempt. Signed bytes remain on the device.

Automatic cleanup of old shell caches after activation is deferred. Retaining them keeps lazy worker assets available to old tabs but uses disk space across updates. A future cleanup must wait until no old controlled tabs remain. Clearing all site data also removes device keys and signed work, so it is not the recovery action for a bad saved prefix.

Forgetting an invitation cancels its current page session before deleting the pin and verified inputs. Pin and history writes check that session inside their storage transaction, so an older in-flight refresh cannot recreate the deleted trust floor. Signed work and keys remain on the device.
