#!/usr/bin/env python3
"""Read-only verification of the A1-F2 frozen source and delivery evidence."""
from pathlib import Path
import hashlib
import json
import subprocess

root = Path.cwd()
packet = root / "experiments/post-spike-evidence/2026-10-01/oauth-review-fixes"
manifest = json.loads((packet / "manifest.json").read_text())

def check(data, pin, label):
    assert len(data) == pin["bytes"], label + ": byte length"
    assert hashlib.sha256(data).hexdigest() == pin["sha256"], label + ": SHA-256"

for path, pin in manifest["sourceFiles"].items():
    check((root / path).read_bytes(), pin, path)
    check(subprocess.check_output(["git", "show", manifest["source"] + ":" + path]), pin, "Git " + path)
for path, pin in manifest["captures"].items():
    check((packet / path).read_bytes(), pin, path)
check((root / manifest["report"]["path"]).read_bytes(), manifest["report"], "report")
for path in manifest["unchangedFoundationFiles"]:
    assert (root / path).read_bytes() == subprocess.check_output(["git", "show", manifest["foundation"] + ":" + path]), path
base = json.loads(subprocess.check_output(["git", "show", manifest["approvedBase"] + ":src/core/dependencies-approved.json"]))
current = json.loads((root / "src/core/dependencies-approved.json").read_text())
assert len(base["packages"]) == 147 and len(current["packages"]) == 194
for path, value in base["packages"].items():
    assert current["packages"][path] == value, path
for name in ["focused-package-conformance.json", "ordinary-package-conformance.json"]:
    result = json.loads((packet / name).read_text())
    assert len(result["cases"]) == 219 and all(case["passed"] for case in result["cases"])
    assert result["sharedDistPreserved"] is True
    assert result["buildSourceFilesVerified"] == 131
    assert result["installedOutputFilesVerified"] == 430
assert all(command["exitCode"] == 0 for command in manifest["finalCommands"])
print(json.dumps({"source": manifest["source"], "sourcePins": len(manifest["sourceFiles"]), "captures": len(manifest["captures"]), "foundationFilesUnchanged": len(manifest["unchangedFoundationFiles"]), "priorRuntimePackages": 147, "runtimePackages": 194, "packedCasesEach": 219, "verified": True}))
