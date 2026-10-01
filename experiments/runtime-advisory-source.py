"""Capture public package sources without installing or executing them.

Run from this worktree. The output is source inspection, not an npm audit,
reachability instrumentation, or a conformance test.
"""

import base64
import datetime
import hashlib
import io
import json
from pathlib import Path
import re
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
lock_bytes = (ROOT / "npm-shrinkwrap.json").read_bytes()
lock = json.loads(lock_bytes)


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "atseq-source-assessment"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def package_sources(name, metadata):
    archive = fetch(metadata["resolved"])
    actual = "sha512-" + base64.b64encode(hashlib.sha512(archive).digest()).decode()
    assert actual == metadata["integrity"], (name, "tarball integrity mismatch")
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
        files = {
            member.name: tar.extractfile(member).read()
            for member in tar.getmembers()
            if member.isfile() and member.name.endswith((".js", "package.json"))
        }
    return archive, files


names = [
    "@inlay/core", "@inlay/render", "@atproto/lex", "@atproto/lex-builder",
    "ts-morph", "@ts-morph/common", "minimatch", "brace-expansion",
]
patterns = {
    "@inlay/core": r"^import |^export .* from ",
    "@inlay/render": r"^import |^export .* from ",
    "@atproto/lex": r"require\(",
    "@atproto/lex-builder": r"ts-morph|lex-builder",
    "ts-morph": r"@ts-morph/common|addSourceFilesAtPaths|globSync\(fileGlobs|common.matchGlobs\(",
    "@ts-morph/common": r"^var minimatch|^class .*FileSystem|^class .*Matcher|^class (Node|Browser)Runtime|^\s+return minimatch__namespace.minimatch|^\s+globSync\(|^\s+return tinyglobby.globSync|^function matchGlobs\(|^\s+getPathMatchesPattern\(|^\s+if \(runtime.getPathMatchesPattern|^\s+return matchGlobs\(",
    "minimatch": r"brace-expansion|braceExpand\(|nobrace|return expand\(",
    "brace-expansion": r"maxDepth|MAX_DEPTH|rewrite|MAX.*ITER|parseCommaParts",
}
packages = []
for name in names:
    metadata = lock["packages"]["node_modules/" + name]
    archive, files = package_sources(name, metadata)
    observations = []
    for path, data in sorted(files.items()):
        if not path.endswith(".js"):
            continue
        if path.endswith("index.js") or name not in ("@atproto/lex", "minimatch"):
            lines = data.decode().splitlines()
            matches = [
                {"line": number, "text": line}
                for number, line in enumerate(lines, 1)
                if len(line) < 1000 and re.search(patterns[name], line)
            ]
            observations.append({
                "path": path, "sha256": hashlib.sha256(data).hexdigest(),
                "lines": len(lines), "matches": matches,
            })
    packages.append({
        "name": name, "version": metadata["version"],
        "resolved": metadata["resolved"], "integrity": metadata["integrity"],
        "integrityVerified": True, "inBundle": metadata.get("inBundle", False),
        "dependencies": metadata.get("dependencies", {}),
        "tarballSha256": hashlib.sha256(archive).hexdigest(),
        "sourceObservations": observations,
    })

release_url = "https://registry.npmjs.org/brace-expansion/5.0.12"
release = json.loads(fetch(release_url))
archive, files = package_sources("brace-expansion@5.0.12", {
    "resolved": release["dist"]["tarball"], "integrity": release["dist"]["integrity"],
})
advisories = []
for ghsa in ("GHSA-6j4f-fj2g-mc7p", "GHSA-qhr7-859c-m2p7", "GHSA-q2hr-2g5m-vwhr"):
    source_url = "https://api.github.com/advisories/" + ghsa
    advisory = json.loads(fetch(source_url))
    advisories.append({
        "sourceUrl": source_url,
        **{key: advisory[key] for key in ("ghsa_id", "cve_id", "html_url", "summary", "severity", "published_at", "updated_at", "vulnerabilities")},
    })
result = {
    "capturedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "basis": "P1 b4c7fb72c19cc6c9b6e0d5632a861af19762cb1e",
    "method": "Public registry tarballs fetched in memory; SHA-512 SRI checked; JavaScript read as text. No dependency installation, code execution, audit or tests.",
    "lockSha256": hashlib.sha256(lock_bytes).hexdigest(),
    "packages": packages,
    "candidate": {
        "sourceUrl": release_url,
        **{key: release[key] for key in ("name", "version", "engines", "dependencies", "license", "dist", "gitHead")},
        "integrityVerified": True,
        "tarballSha256": hashlib.sha256(archive).hexdigest(),
        "javascriptFileHashes": {path: hashlib.sha256(data).hexdigest() for path, data in sorted(files.items()) if path.endswith(".js")},
    },
    "advisories": advisories,
}
output = ROOT / "experiments/post-spike-evidence/2026-10-01/runtime-advisory-source.json"
output.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({"output": str(output.relative_to(ROOT)), "packages": len(packages), "candidate": release["version"], "lockSha256": result["lockSha256"]}))
