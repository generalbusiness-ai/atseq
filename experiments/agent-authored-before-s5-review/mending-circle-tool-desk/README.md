# Agent-authored mending-circle tool desk

This app was authored from an empty source folder after the supplied generic
host was already running. The author read only the four permitted authoring,
interaction, runtime-profile and evolution documents. No implementation modules
or test fixtures were inspected or imported. All application interaction used
`npm run --silent atseq` with JSON requests.

The purpose is a one-evening mending circle. Participants borrow fabric shears,
snap pliers or a seam ripper. A tool cannot have two current borrowers, and only
the signing identity that borrowed it can return it. The two participant labels
are synthetic; their public keys, rather than names, enforce return authority.

## Retained files

- `source/`: the authored Lexicon, initial state, JSONata folds/query and Inlay view.
- `definition.car`: the validated source closure that was published.
- `draft-before-identity-guard.car`: the original preview draft, retained to reproduce the authoring finding.
- `transcript.json`: every adapter request/result, timestamps, exits and stderr. Private file locations are redacted; signing keys and intent files are excluded.
- `invitation.json`: the returned app/genesis invitation tuple and active definition.
- `result.json`: exact query/outcome evidence and limitations.
- `source-sha256.json`: hashes of the final authored files.

Definition CID: `bafyreiechuca3c64bg6k6u6k42wj3psff5ehvmp7jqt33eunbwgjhysyse`.

## Observed behavior

There were 26 adapter calls, all with successful transport responses. Five
unique signed entries were recorded: Alex borrows the shears; Sam is refused
with `tool_in_use`; Sam is refused with `not_borrower` when attempting a return;
Alex returns them; Sam then borrows them successfully. An exact retry of the
last intent returned its original receipt at position 5 and added no entry.

The final query at frontier 5 reports 3 tools, 2 available, 1 on loan, 2
successful checkouts and 1 return. The shears are held by Sam. The retained
Inlay view resolved to the session title, availability text and the two action
controls. This exercise did not perform a browser UI flow.

## Authoring findings

The preview operation supplies an empty `meta.actorKey` and documents no actor
option. The original identity-dependent borrow preview could look effective
without holding a real borrower key. Both folds now explicitly refuse an
anonymous preview with `signing_identity_required`; actual signed actions work
with the real actor key. The initial draft and its response remain in the
transcript. Documentation should explain anonymous preview metadata; a
public-key-only preview actor option would make this workflow more useful.

The create result contains the invitation tuple but no application URL, and
the permitted docs do not specify that URL shape. `invitation.json` preserves
the returned identity anchors without inventing a link. The preview URL is
available in the transcript.

This remains synthetic local-PDS evidence, not a public deployment or a complete
log archive. Host/client/package/docs files were not edited; nothing was
committed and the author made no workroom acts. The parent performs the
before/after host and client build-hash comparison.
