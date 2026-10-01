---
date: 2026-10-01
status: implemented candidate; independent exact-head review pending
request: d62b5a88847adefec00149ddf647a40ec3dec61a
validated_source_head: 3983fb40b3f00484d8ec276a3a17a5a6893da179
---

# Check attribution before accepting a dependency change

CI now compares retained notices with the existing generator's output for the
installed runtime closure. The new `--check` mode reports stale attribution
without rewriting the file. Default generation remains byte-identical to the
previous generator, with the same license and notice-retention policy.

This follows M0 review `b007b303`: P1 changed the closure while notices remained
stale. The CI step runs after clean setup and before the existing checks on every
Node matrix job. Contributor instructions explain how to regenerate and review
the notice delta. No runtime, dependency, profile, notice-format or license-policy
change is introduced.

## Validation

At source revision `3983fb40b3f00484d8ec276a3a17a5a6893da179`, the isolated clean
installation contains the reviewed M0 graph: 135 approved paths and 115 retained
notices. The actual check passes; removing one notice makes it fail with the
explicit stale-attribution message. The failing check leaves that stale file
unchanged. Restoring the exact original bytes passes again. Default generation
then reproduces those original bytes exactly.

[Raw results](../experiments/post-spike-evidence/2026-10-01/notice-check-results.json)
retain the commands' output, exit status, notice hash and changed-source hashes.
The full build and required repository check pass. The notice file, manifests,
shrinkwrap, approved closure and file pins remain unchanged. A runtime suite is
not needed for this script/CI/documentation change; no such run is claimed.

An initial isolated script experiment used a temporary shared-install symlink.
The build correctly rejected that alias at the existing dependency boundary.
A clean root install resolved preparation; the type checker additionally needed
the standard PDS fixture install. The fresh-install positive and negative controls
are recorded separately from the initial script experiment. No integrity check
or install-script policy was weakened.

## Limits

This checks agreement with the current generator, not universal legal adequacy
or a new license classification policy. Unsupported future attribution requirements
need their own explicit assessment. A clean CI install is required; a dirty local
installation is intentionally checked against its actual bytes. CI executes the
same command on the existing Node 22.13/24/26 matrix, but its future pushed run
has not yet occurred for this candidate. Independent exact-head review gates
merge and push.
