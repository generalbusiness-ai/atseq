# Native account writer: mint ownership question

Date: 2026-10-02. Status: source inspection; interpretation clarified by the parent before the OAuth join.

The parent confirmed that adopted A1 factory/configuration remains trusted. The
writer negatives concern fabricated handles and caller operation callbacks;
they do not classify a deliberately replaced trusted SDK factory. The parent
also confirmed one parameterized decoder owner, preserving the legacy default
behavior. The discussion below records the concrete alternatives considered.

AW-F2 request `b8d9ec1eab341d9fd412d527b001917404d82d33` and promise
`3baf258ad443641e4d1323c27c8fa4721ad4030c` continue original A2-F1
`9a0294ddd700cd5bacfb75436f32424e42e279e7` / `f0b05a7f41afd119fe41c74760571f6904e999cb`.
The selected reviewed custody baseline is `5006a5c6489ce348944a85d158dfe89fd979099c`.
The shared extraction at `d143d8c79978cbf1e0ba8687970ec96f8e0f3c3b` copies both
operation-owner and host files exactly from producer `634b82986680b0a17b5ae92a7b0865ace632475a`.
No OAuth mint or resource allowance is implemented by that extraction.

## What the current source establishes

`src/protocol/oauth.ts` exports the `OAuthAdapter` constructor. Its arguments
include a transport and a callback that returns `OAuthCustodyClient`. The adapter
calls that callback in `#run`. Successful `complete` and `restore` validate the
returned session through the client's resolver and token-info methods, then
construct an `OAuthSessionHandle`. These checks are meaningful when the configured
factory is the maintained implementation. A caller-supplied fake factory can
replace all of those collaborators.

`src/host/oauth-adapter.ts` constructs a private `CustodyClient` subclass of the
maintained `NodeOAuthClient`. `src/browser/oauth-adapter.ts` constructs a private
subclass of maintained `OAuthClient`. Each adds only the protected state-store
reader. Their loaders choose these construction owners; neither loader accepts
an SDK factory or an arbitrary transport parameter.

The maintained implementation provides no runtime private brand for a returned
session. In pinned `@atproto/oauth-client`, `OAuthClient.createSession` constructs
`OAuthSession(server, sub, this.sessionGetter, this.fetch)`. `OAuthSession` stores
those ordinary properties, and its methods read them. An `instanceof` test or
comparison of `client.fetch` with the guarded fetch would be a shape check. It
would not exclude a deliberately successful fake factory, especially one using
the maintained prototypes. No new SDK shape classifier is proposed here.

## The exact decision needed

The adopted 29683 writer note says that A1 factory and adapter configuration are
the existing trusted boundary. Its mint-only WeakMap can then prove that the
handle was returned by verified A1 complete/restore, exclude public handle
constructors and copied/prototype-shaped handles, and retain closures over the
owned flow rather than calling mutable public handle methods.

AW-F2 also requires rejection of a fake SDK or caller transport. Please settle
whether this applies to a fabricated writer input or to deliberate replacement
of A1's trusted constructor configuration:

- If the former, keep the adopted factory boundary. The writer has no SDK or
  transport argument, and its positive tests must use the actual maintained
  loader and callback. Reject fabricated handles without invoking their methods.
- If the latter, a closed maintained-client construction owner is required
  before minting. The existing constructor does not supply that guarantee. A
  public boolean, registration function, verifier callback or `instanceof`
  check would not solve it. Moving construction into the mint owner affects the
  platform factories and browser/Node import boundary and requires a concrete
  independently reviewed successor before production changes.

This question does not ask the user for routine permission. The parent owns the
workroom decision and independent review. Neither case changes identity proof,
app permission, provider compatibility, provisioning, or recovery claims.

## Shared decoder wording

The byte-identical 634 decoder presently uses an 8 MiB success cap and returns
provider `error` strings as `PdsError.code`. The adopted native policy instead
requires a 1 MiB success cap, a 64 KiB error cap, typed deterministic local size
refusals and a closed provider-code set, while preserving the legacy default
behavior and local `AuthenticationUnavailable` owner.

Use a native policy on this same operation/decoder owner, preserving the exact
`PdsError` constructor and legacy defaults, rather than a second JSON parser.
This implements the already adopted distinction. If AW-F2's instruction to reuse
the decoder unchanged means literal source immutability even for the native
policy, that wording must be resolved: it cannot simultaneously provide the
different adopted native caps and sanitizer without another decoder.

All mint and allowance vectors remain unexecuted. Current extraction regression
captures do not establish a native writer, a genuine minted capability, or full
A1/A2 completion.
