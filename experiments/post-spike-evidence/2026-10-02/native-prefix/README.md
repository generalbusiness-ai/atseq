# R1-F1 native prefix evidence — 2026-10-02

The final source is `fbc96631e8a7e7f5d62754dd8d2f490ce6363733`. The [results note](../../../../notes/2026-10-02-atseq-native-prefix-results.md) explains the scope and limits. `manifest.json` pins every retained file, source input and build output. The 194 installed runtime packages were physical directories in the isolated worktree; `installed-runtime.json.gz` records their actual file hashes alongside the reviewed integrity pins.

`node22/`, `node24/` and `node26/` contain source, actual compiled production, prior-source comparison and real observer deadline/budget gates. Each `gates.json` records exact commands, exit status and source commit. `run-gates.py` preserves the local paths and environment used. It is an execution record rather than a portable installer.

`fixtures/` contains one shared successor prefix, authority and application fixture. They use real signatures and actual native head-signed CARs. No historical fixture was rewritten. Node source and compiled prefix/application consumers use the same decoded fixtures. The authority source/compiled replay and independent prior-I2 comparison share the frozen authority fixture; the full authority generator separately exercises all its original assertions on each runtime.

`chromium/` contains actual browser results and the frozen executed bundles. Each bundle was regenerated and checked byte-for-byte against the hash from its browser run before freezing. The authority browser uses its own retained Node-generated fixture; the prefix/application browser consumers use the shared fixtures. The observer browser capture includes its actual shared public input. Host observation remains a Node route; its portable retained evidence is replayed in Chromium.

Large JSON and bundles are gzip-compressed. The manifest includes decoded lengths and SHA-256 values as well as the compressed file hashes. To rerun the captured local commands, check out the exact source, establish independent matching dependencies, and unpack the shared JSON files to the same paths without the `.gz` suffix. Configure equivalent Node executables and an installed Chromium if the recorded local paths differ.

`previous-f4e2911a/` retains successful pre-fix gates and their own source/build attribution. Shared decoded fixtures remain unchanged across the two source freezes. Those gates do not prove the final source. `draft-attempts/` explains retained development mistakes without assigning an invented source commit to uncommitted attempts.
