All 12 cells and 84 fresh runtime captures complete. Canonical projections, proof results, retry outcomes, allocator outcomes and raw-storage status agree across all seven modes per cell. Default refusals are retained; no trusted budget was raised.

| Actions | Pattern | Ordered entries | Grants / retired | Descriptors | Native evidence MiB | Authority JSON MiB | Raw rows confirmed / requested | Cold owner |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 100 | one | 101 | 1 / 0 | 1 | 0.274 | 0.002 | 639 / 639 | verified |
| 100 | sixteen | 116 | 16 / 0 | 16 | 0.367 | 0.012 | 774 / 774 | verified |
| 100 | retired | 299 | 100 / 99 | 199 | 1.334 | 0.068 | 2426 / 2426 | verified |
| 100 | one-use | 299 | 100 / 99 | 199 | 1.334 | 0.068 | 2426 / 2426 | verified |
| 1000 | one | 1001 | 1 / 0 | 1 | 2.618 | 0.002 | 6057 / 6057 | verified |
| 1000 | sixteen | 1016 | 16 / 0 | 16 | 2.711 | 0.012 | 6192 / 6192 | verified |
| 1000 | retired | 1199 | 100 / 99 | 199 | 3.679 | 0.068 | 7845 / 7845 | verified |
| 1000 | one-use | 2999 | 1000 / 999 | 1999 | 13.326 | 0.669 | 24111 / 24111 | verified |
| 10000 | one | 10001 | 1 / 0 | 1 | 26.077 | 0.002 | 60252 / 60252 | refused |
| 10000 | sixteen | 10016 | 16 / 0 | 16 | 26.171 | 0.012 | 60387 / 60387 | refused |
| 10000 | retired | 10199 | 100 / 99 | 199 | 27.139 | 0.068 | 62041 / 62041 | refused |
| 10000 | one-use | 29999 | 10000 / 9999 | 19999 | 133.305 | 6.677 | 64000 / 240957 | refused |

Observed node22-source wall seconds, one capture per cell. A missing complete-prefix/application value means the default route refused, not fast successful bootstrap.

| Actions / pattern | History signature/hash/chain | DATA index decode | Authority decode/copy | Authority/history | Participant methods/roots/MST | Full DATA clone | Source-only fold | Complete cold prefix | Actual authority/source replay | Raw commit attempt | Exact reopen reads |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 / one | 0.216 | 0.015 | 0.002 | 0.010 | 0.537 | 0.000 | 0.049 | 0.167 | 0.450 | 0.006 | 0.010 |
| 100 / sixteen | 0.208 | 0.015 | 0.007 | 0.016 | 0.532 | 0.000 | 0.045 | 0.171 | 0.553 | 0.006 | 0.010 |
| 100 / retired | 0.370 | 0.022 | 0.030 | 0.058 | 0.724 | 0.001 | 0.043 | 0.394 | 1.714 | 0.028 | 0.037 |
| 100 / one-use | 0.428 | 0.024 | 0.034 | 0.077 | 0.863 | 0.001 | 0.047 | 0.450 | 1.987 | 0.026 | 0.039 |
| 1000 / one | 1.743 | 0.098 | 0.002 | 0.056 | 0.540 | 0.001 | 0.424 | 1.342 | 4.435 | 0.082 | 0.086 |
| 1000 / sixteen | 2.122 | 0.125 | 0.008 | 0.080 | 0.663 | 0.002 | 0.510 | 1.924 | 4.588 | 0.086 | 0.088 |
| 1000 / retired | 2.049 | 0.190 | 0.030 | 0.130 | 0.794 | 0.002 | 0.426 | 1.672 | 6.950 | 0.120 | 0.118 |
| 1000 / one-use | 3.781 | 0.162 | 0.262 | 0.553 | 2.765 | 0.005 | 0.436 | 4.148 | 29.868 | 0.444 | 0.336 |
| 10000 / one | 19.604 | 1.067 | 0.002 | 0.544 | 1.639 | 0.016 | 4.206 | refused | — | 0.821 | 0.837 |
| 10000 / sixteen | 19.552 | 0.933 | 0.008 | 0.607 | 2.020 | 0.018 | 4.438 | refused | — | 0.897 | 0.856 |
| 10000 / retired | 18.287 | 0.931 | 0.031 | 0.640 | 0.897 | 0.016 | 4.411 | refused | — | 1.336 | 0.911 |
| 10000 / one-use | 39.618 | 1.637 | 2.616 | 6.598 | 23.345 | 0.079 | 4.732 | refused | — | 0.983 | — |

Observed chromium wall seconds, one capture per cell. A missing complete-prefix/application value means the default route refused, not fast successful bootstrap.

| Actions / pattern | History signature/hash/chain | DATA index decode | Authority decode/copy | Authority/history | Participant methods/roots/MST | Full DATA clone | Source-only fold | Complete cold prefix | Actual authority/source replay | Raw commit attempt | Exact reopen reads |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 / one | 0.191 | 0.007 | 0.001 | 0.003 | 0.008 | 0.000 | 0.038 | 0.170 | 0.433 | 0.052 | 0.142 |
| 100 / sixteen | 0.200 | 0.008 | 0.008 | 0.010 | 0.026 | 0.000 | 0.041 | 0.182 | 0.545 | 0.084 | 0.173 |
| 100 / retired | 0.427 | 0.014 | 0.020 | 0.065 | 0.238 | 0.001 | 0.038 | 0.503 | 1.870 | 0.342 | 0.635 |
| 100 / one-use | 0.427 | 0.014 | 0.021 | 0.061 | 0.228 | 0.001 | 0.038 | 0.481 | 1.707 | 0.283 | 0.637 |
| 1000 / one | 2.181 | 0.054 | 0.002 | 0.022 | 0.009 | 0.002 | 0.473 | 1.830 | 5.202 | 1.234 | 2.114 |
| 1000 / sixteen | 2.167 | 0.056 | 0.006 | 0.040 | 0.052 | 0.001 | 0.449 | 1.894 | 5.126 | 0.993 | 1.711 |
| 1000 / retired | 2.431 | 0.058 | 0.025 | 0.092 | 0.246 | 0.002 | 0.461 | 2.170 | 6.852 | 1.274 | 2.046 |
| 1000 / one-use | 4.591 | 0.120 | 0.299 | 0.621 | 2.386 | 0.018 | 0.492 | 5.959 | 28.032 | 4.446 | 7.294 |
| 10000 / one | 23.090 | 0.540 | 0.001 | 0.241 | 0.015 | 0.014 | 4.589 | refused | — | 12.482 | 19.622 |
| 10000 / sixteen | 29.875 | 0.695 | 0.008 | 0.342 | 0.046 | 0.018 | 5.668 | refused | — | 14.613 | 19.529 |
| 10000 / retired | 24.832 | 0.702 | 0.047 | 0.323 | 0.256 | 0.024 | 4.957 | refused | — | 14.275 | 22.238 |
| 10000 / one-use | 56.131 | 1.243 | 3.392 | 6.595 | 26.860 | 0.087 | 5.249 | refused | — | 13.859 | — |

The first three 10,000-action patterns fail with `content_unavailable` because their ordered entries exceed the default 10,000 delta. The one-use10,000 pattern fails earlier with `native_proof_limit: CAR bytes exceed budget`; its 93,417,453-byte app CAR exceeds the default 32MiB CAR limit. That cell also reaches the raw 48MiB logical store quota after 64 commits and 64,000 exact rows (49,629,164 accounted bytes); its requested 240,957 rows are not fully stored. All confirmed rows survive reopen byte-exact; this is not an accepted restore.

Across the successful eight cells, all original/alternate-signature retries preserve original intent/entry/position/first signature, and signed content conflicts return retry_conflict. There are 168 selected original retry measurements across seven modes, ranging 0.464–8.430 ms. This mixed-runtime single-capture range is not an SLA. The missing-old-publication-block refusal also agrees. Four10k receipt/whole-authority gates stay unavailable.
