#!/usr/bin/env python3
"""Run source, actual emitted production and Chromium against closed genuine fixtures."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
from datetime import datetime, timezone

parser = argparse.ArgumentParser()
for major in (22, 24, 26):
    parser.add_argument(f"--node{major}", required=True)
parser.add_argument("--capture-dir", required=True)
parser.add_argument("--r1-fixture", required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
out = Path(args.capture_dir).resolve()
out.mkdir(parents=True, exist_ok=True)
source = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
runtimes = {}
for major in (22, 24, 26):
    binary = Path(getattr(args, f"node{major}")).resolve()
    version = subprocess.check_output([str(binary), "--version"], text=True).strip()
    if not version.startswith(f"v{major}."):
        raise SystemExit(f"node{major} is actually {version}")
    runtimes[major] = {"executable": str(binary), "node": version, "executableSha256": hashlib.sha256(binary.read_bytes()).hexdigest()}
runs = []
def save():
    (out / "runs.json").write_text(json.dumps({"source": source, "platform": platform.system(), "machine": platform.machine(), "runs": runs}, indent=2) + "\n")
def run(major, kind, argv, env):
    directory = out / f"node{major}"
    directory.mkdir(exist_ok=True)
    log = directory / f"{kind}.log"
    merged = dict(os.environ)
    merged.pop("NODE_TEST_CONTEXT", None)
    merged.update({key: str(value) for key, value in env.items()})
    record = {"kind": kind, **runtimes[major], "argv": argv, "env": {key: str(value) for key, value in env.items()}, "log": str(log.relative_to(out)), "source": source, "started": datetime.now(timezone.utc).isoformat()}
    with log.open("wb") as stream:
        process = subprocess.run([runtimes[major]["executable"], *argv], cwd=root, env=merged, stdout=stream, stderr=subprocess.STDOUT, timeout=180)
    record["exitCode"] = process.returncode
    runs.append(record)
    save()
    print(f"{kind} {runtimes[major]['node']}: {process.returncode}", flush=True)
    if process.returncode:
        raise SystemExit(f"Failed; retained {log}")

for major in (22, 24, 26):
    directory = out / f"node{major}"
    env = {"ATSEQ_NATIVE_PRESERVED_CAPTURE_DIR": directory / "preserved-source", "ATSEQ_NATIVE_PREFIX_CAPTURE_DIR": directory / "r1-source", "ATSEQ_NATIVE_PREFIX_FIXTURE_PATH": Path(args.r1_fixture).resolve()}
    if major != 22:
        env["ATSEQ_NATIVE_PRESERVED_FIXTURE_PATH"] = out / "node22/preserved-source/fixture.json"
    run(major, "source", ["scripts/source-run.mjs", "--test", "tests/native-prefix-preserved.test.ts", "tests/native-prefix.test.ts"], env)
    run(major, "preserved-emitted", ["experiments/native-prefix-preserved/compiled-conformance.mjs"], {"ATSEQ_NATIVE_PRESERVED_FIXTURE_PATH": directory / "preserved-source/fixture.json", "ATSEQ_NATIVE_PRESERVED_COMPILED_CAPTURE": directory / "preserved-emitted.json"})
    run(major, "r1-emitted", ["experiments/native-prefix/compiled-conformance.mjs"], {"ATSEQ_NATIVE_PREFIX_FIXTURE_PATH": Path(args.r1_fixture).resolve(), "ATSEQ_NATIVE_PREFIX_COMPILED_CAPTURE": directory / "r1-emitted.json"})
run(26, "chromium", ["scripts/source-run.mjs", "--test", "tests/native-prefix-preserved-browser.test.ts", "tests/native-prefix-browser.test.ts"], {"ATSEQ_NATIVE_PRESERVED_FIXTURE_PATH": out / "node22/preserved-source/fixture.json", "ATSEQ_NATIVE_PREFIX_FIXTURE_PATH": Path(args.r1_fixture).resolve()})
for name in ("native-prefix-preserved-browser", "native-prefix-browser"):
    shutil.copyfile(root / ".atseq-local" / name / "chromium.json", out / f"{name}.json")
shutil.copyfile(root / "dist/build-provenance.json", out / "build-provenance.json")
