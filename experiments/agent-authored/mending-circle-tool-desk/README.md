# Mending-circle tool desk: final closure-transport profile repeat

This repeats my own purpose-specific Mending circle application after the final
S5 closure-transport host had already started. **The original creative run
preceded the independent review corrections.** It remains under
`experiments/agent-authored-before-s5-review/`; the preceding repeat is preserved
under `experiments/agent-authored-before-closure-transport-review/`. This is not
a newly invented empty-folder app or a claim that the creative exercise used
the later corrected runtime.

Only the copied source manifest's runtime profile CID changed. The prior
Lexicon, initial state, JSONata folds/query, retained Inlay view and anonymous
preview guard are byte-for-byte unchanged. The preceding source/transcript
hashes were checked and remain unchanged.

The app coordinates fabric shears, snap pliers and a seam ripper during a
one-evening mending circle. A tool has one current borrower; only that signing
key can return it. All participants and data are synthetic.

## Retained evidence

- `source/`: copied authored source with the final runtime profile.
- `definition.car`: the validated and published source closure.
- `transcript.json`: all 22 adapter requests/results with timestamps, exits and stderr; private locations are redacted.
- `invitation.json`: returned identity anchors and the documented live URL.
- `result.json`: exact outcomes, query, retry evidence and scope limits.
- `source-sha256.json`: hashes of the seven source files.

Runtime: `bafyreighraqhxiago5tbpeheiozkmu3ytjra7vy36oakfx6v6qy5e4wn4a`.

Definition: `bafyreib4hy5nv5r63h27b3ifhhhzsbabemuyf5lrgl5sfuwrentuipeg6m`.

## Observed result

Five distinct signed entries reproduce the scenario: Alex borrows the shears;
Sam's competing borrow is retained as `tool_in_use`; Sam's attempted return is
retained as `not_borrower`; Alex returns the shears; Sam then borrows them.
Entries 1, 4 and 5 are effective. The two signing identities are new to this run.

The sixth submit (transcript step 20) is an exact retry of entry 5. It returns
the original intent/receipt at position 5 without adding an entry. The final
query and outcome (steps 21/22) name frontier 5: 3 tools total, 2 available,
1 on loan, 2 successful checkouts and 1 return. Sam holds the shears.

All 22 adapter calls succeeded. Inlay preview rendered the session title,
availability and two action controls. Anonymous action preview correctly
returned `signing_identity_required`; this limitation and the invitation URL
are now documented. No new adapter gap was observed.

## Scope

The author used the documented JSON adapter and their own prior source and
transcripts, without inspecting host implementation or fixtures. No browser
interaction was performed by this author. Keys and prepared intents remain
owner-only in an ignored private directory and are excluded from the evidence.
No host, source scripts, tests, package files, docs, `host-before.json` or
`host-build/` files were changed. Nothing was committed and no workroom artifact
was published. The parent captured the before-hashes and owns the matching
after-hashes and independent archive/replay. This evidence directory itself is
not a full log archive or public deployment.
