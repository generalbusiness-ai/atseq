---
date: 2026-10-01
status: publication prepared; independent exact-head review pending
request: f9abfb7e0c8f4e624feb20d95675b168147e3759
---

# Continuation designs and current results

This delivery publishes the independently reviewed identity, authority, ordering,
retry and actor-discovery directions and the proposed application-state requirements.
The notes index, programme and original design-space notes now lead readers to
current decisions and landed evidence. Full implementation remains open.

## Published decisions and evidence

| Note               | Source head and independent basis                 | Disposition                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account admission  | `e00cf34a`; assessment `cc21a77c`                 | Requires the full computed canonical PLC tip and derives binding from its signed operation; web retains its weaker document observation. Node >=22.19 is an explicit planned support change, gated on actual host transport and runtime evidence.   |
| Account authority  | `46268091`; joint assessment `91c4241c`           | Exact per-action grants, optional appointed owner roles and separate control powers; no position-based grant expiry; no implicit DID-based floor recovery.                                                                                          |
| Native ordering    | `9224b207`; joint assessment `91c4241c`           | Genesis-scoped known paths, native CAS and retained receipts; safe-integer positions and invalid second descriptor consumption. All collection-write credential holders share custody; scoped OAuth for production, dedicated accounts recommended. |
| Retry uniqueness   | `266ad025`; corrected assessment `981bbcd7`       | Signer-key nonce identity and exact unsigned-content lookup first; random nonces, full prior index or explicit deferred audit. Native/checkpoint cost gates remain open.                                                                            |
| Actor discovery    | `ec6a3d9a`; assessment `9cdbe3c3`                 | Subject-specific grant eligibility and exact-payload local simulation, without a separate permission language; final role interface and implementation remain open.                                                                                 |
| State requirements | `628c54c1`; subsequent sample decision `77e604a5` | Proposed task-board/guitar/ledger requirements. Reviewed aggregate-bound correction is prepared in B0; no effects contract selected.                                                                                                                |

Source notes were copied from those exact committed revisions before formatting
and adding disposition pointers. The account-admission public source inspection,
retry model captures and model harness are retained with their original bytes.
The original stage captures and finding map remain historical; newer result links
do not silently alter them or turn design acceptance into runtime completion.

## Shipped foundations and open gates

P0 and P1 are shipped: their reports cover the larger performance space and
bounded native proofs. MF1/MF2 and CI1/CI2 are shipped, with retained sensitive
telemetry and real form/archive regressions. M0 is shipped under independently
accepted existing-contract equivalence; its current-closure attribution refresh
is reported separately from the single dependency-node patch. Linux P1 run
`36893763670` passed all Node 22.13/24/26 jobs; CI3 also passed the later post-CI-fix full matrix at `2c759838`, [run `36897498460`](https://github.com/generalbusiness-ai/atseq/actions/runs/36897498460). These results do not pre-approve subsequent deliveries.

The final native operation/certificate encoding and enforced role interface,
account/grant runtime, provider permissions, materialization, checkpoints,
end-to-end measurements and final packaging remain tracked work. B0 follows M0's
landed dependency graph; I1 graph changes wait for B0 to avoid duplicated approval
and provenance rewrites. V0 measures canonical-validation overhead before the
state/effects choice. No new dependency, profile identity or production runtime
behavior is introduced by this documentation delivery.

## Validation and limits

Validation checks Markdown links against the complete candidate tree, copied
public evidence byte hashes, Markdown formatting and the changed-path diff.
No runtime suite or provider trial is claimed for this documentation-only delivery.
Independent exact-head documentation and simplification review gates its merge.
Unimplemented choices and unrun tests remain explicitly labelled in the notes.
