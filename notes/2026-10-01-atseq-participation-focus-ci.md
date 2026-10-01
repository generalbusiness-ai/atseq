# Participation form focus during refresh

Date: 2026-10-01

Status: controlled failure reproduced and corrected; independent exact-head
review and landing pending.

Workroom task: CI2, request `0c2b8bce786c7b08361af9b85f7922889ef730ee`.

The [Node 26 CI job](https://github.com/generalbusiness-ai/atseq/actions/runs/36880209217/job/110429755094)
failed the positive control in the hostile-template participation test at
revision `853f671bd0acafe4619ad486b17967f602c9fc3f`. The intended real Save did
not become effective. Its captured form retained `id: positive` and price 100,
but the required title was empty. No action was recorded and the frontier stayed
at zero. Node 22 and 24 jobs passed in that run. This evidence does not support
simply allowing more time for an already-submitted action.

The shell preserves the live editor node during refresh, but moves it into a
new workspace when replacing the surrounding application display. Moving a
focused text input can blur it. A returning page first renders saved history
and then completes a live refresh; form filling can overlap that later redraw.
The controlled browser check reproduced that focus loss. It provides a
plausible explanation for the CI snapshot's missing text; it does not claim to
have replayed the exact scheduler interleaving from the remote job.

The controlled regression holds the existing IndexedDB refresh read, focuses
the live title input, releases the read, and requires both the entered value
and keyboard focus to survive the completed real refresh. The existing draft
retention, genuine signed positive control, hostile text and no-external-fetch
checks remain in place. No timeout or assertion has been relaxed.

Against the unchanged product at `66977be7`, this regression failed: the title
still contained `Refused transport`, but its keyboard focus was inactive after
refresh completed. The [baseline log](../experiments/post-spike-evidence/2026-10-01/participation-focus-baseline.log)
retains that failure.

The correction changes only `src/browser/main.ts`. Immediately before moving
the existing editor, the shell captures its focused descendant. After the
synchronous display replacement it restores that focus without scrolling,
only while the draw belongs to the selected app/session, the original element
is still connected, and it still belongs to the retained editor. It creates no
new form, signs no action, alters no draft or consent data, and does not restore
focus to a superseded app's detached editor.

The corrected regression also inserts text through the browser keyboard after
refresh and checks that it reaches the same retained title. All 11 participation
tests then pass, including the real positive Save, exactly one deliberate
signature, no passive signature, hostile text escaping, no external requests,
offline draft retention and transport-refusal behavior. See the
[fixed log](../experiments/post-spike-evidence/2026-10-01/participation-focus-fixed.log)
and [focused evidence](../experiments/post-spike-evidence/2026-10-01/participation-focus-fixed-results.json).
The evidence retains project and fixture source hashes; installed dependency
file hashes are excluded from that projection. No dependencies or semantic
profiles changed. These are correctness checks, not performance measurements.

`npm run build` and `npm run check` pass. Browser-session and app-evolution
regressions pass all 28 tests, including app switches, restored device work and
explicit replacement of stale pending actions. Their
[log](../experiments/post-spike-evidence/2026-10-01/participation-focus-browser-regressions.log)
is retained. The scoped validation has 39 passing tests in total; the whole
repository suite and remote Linux matrix have not been rerun for this candidate.
