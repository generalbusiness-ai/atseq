# Mending-circle tool desk: corrected-runtime repeat

This run repeats my own earlier purpose-specific application after the corrected
S5 host was already running. It is **not a newly invented empty-folder app**.
The earlier complete run remains unchanged under
`experiments/agent-authored-before-s5-review/mending-circle-tool-desk/` and pins
its older runtime. Only the copied source manifest's runtime profile CID changed;
the schemas, initial state, JSONata programs, Inlay view and anonymous-preview
guard are byte-for-byte identical to my retained prior source.

The app coordinates shared fabric shears, snap pliers and a seam ripper during
a one-evening mending circle. A tool has one borrower at a time, and only the
borrowing signing key can return it. All participants and data are synthetic.

## Provenance and retained evidence

The author read updated `docs/interaction.md` and their own prior evidence,
using the four permitted authoring documents already read in the initial run.
No implementation modules or fixtures were inspected/imported. Application
interaction used only documented `npm run --silent atseq` JSON operations.
Fresh identities and intent files stayed in an ignored private directory.

- `source/`: copied authored source with the corrected runtime CID.
- `definition.car`: the validated and published source closure.
- `transcript.json`: all 22 timestamped adapter requests/results, exits and stderr, with private locations redacted.
- `invitation.json`: returned app/genesis anchors and the documented live URL.
- `result.json`: exact outcomes, final query, retry result and limitations.
- `source-sha256.json`: final source hashes; only the manifest differs from the earlier run.

Runtime: `bafyreieowntyz2kbfqj5jj22wsohth3ik4j7bo65na2o4omd4lsxruc5li`.

Definition: `bafyreia2shxwsrd2s23wue27ccwtkz3hvlzm6nqff2ox7d7yr464birhc4`.

## Observed behavior

Five unique signed entries reproduce the earlier scenario: Alex borrows the
shears; Sam's competing borrow is retained as `tool_in_use`; Sam's attempted
return is retained as `not_borrower`; Alex returns them; Sam then borrows them.
Entries 1, 4 and 5 are effective. All 22 adapter calls returned successfully.

Exact retry at step 20 returned the original intent/receipt at position 5,
without adding an entry. The final query at step 21 and final outcome at step 22
name frontier 5: 3 total tools, 2 available, 1 borrowed, 2 checkouts and 1 return.
The shears are held by Sam's new signing key.

The Inlay preview resolved the title, availability and both controls. Anonymous
action preview returned `signing_identity_required`, matching the now-documented
empty preview actor. The updated docs also define the live invitation URL;
that URL is included in the invitation file. No new adapter gap was found.

The author did not run a browser interaction, edit implementation/package/docs
or repository scripts, commit, or make workroom acts. Earlier evidence hashes
were checked and remained unchanged. The parent owns build-hash comparison,
export and independent archive replay. This directory itself is source and
adapter evidence, not a complete signed-log archive or public deployment.
