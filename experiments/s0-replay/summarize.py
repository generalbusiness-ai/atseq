"""Describe retained whole replay spans without fitting a throughput model."""

import hashlib
import json
from pathlib import Path

root = Path("experiments/post-spike-evidence/2026-10-01/s0-replay")
results = {}
for environment in ("node", "chromium"):
    raw = (root / f"{environment}-timing.json").read_bytes()
    result = json.loads(raw)
    assert not result["failures"]
    assert result["samples"] == 2
    assert len(result["captures"]) == 8
    assert result["metadata"]["exactHead"] == "7ae19979b72f735ffe6f08012a5e9185b6dc04e4"
    results[environment] = result

assert results["node"]["metadata"]["inputSha256"] == results["chromium"]["metadata"]["inputSha256"]
cells = []
for node, chromium in zip(results["node"]["captures"], results["chromium"]["captures"]):
    assert node["name"] == chromium["name"]
    assert node["reference"] == chromium["reference"]
    values = {}
    for environment, capture in (("node", node), ("chromium", chromium)):
        times = [span["elapsedMs"] for span in capture["rows"]]
        assert len(times) == 2
        assert all(span["entriesInterpreted"] == capture["n"] for span in capture["rows"])
        values[environment] = {"minimumMs": min(times), "maximumMs": max(times), "allMs": times}
    cells.append({
        "name": node["name"], "family": node["family"], "n": node["n"],
        "initialStateBytes": node["initialStateBytes"], "finalStateBytes": node["finalStateBytes"],
        "initialRows": node["initialRows"], "finalRows": node["finalRows"],
        "environments": values,
    })

output = {
    "timedSource": results["node"]["metadata"]["exactHead"],
    "publicInputSha256": results["node"]["metadata"]["inputSha256"],
    "captureHashes": {environment: hashlib.sha256((root / f"{environment}-timing.json").read_bytes()).hexdigest()
                      for environment in results},
    "timedWholeReplaySpans": 32,
    "timedEntriesInterpreted": sum(cell["n"] * 4 for cell in cells),
    "method": "Full minimum/maximum range of two whole-replay samples; raw observations retained. No percentile, exclusive stage attribution, latency target, throughput fit or discarded samples.",
    "cells": cells,
}
(root / "statistics.json").write_text(json.dumps(output, indent=2) + "\n")
print("| Workload | Actions | Initial / final domain bytes | Node whole replay, seconds | Chromium whole replay, seconds |")
print("| --- | ---: | ---: | ---: | ---: |")
for cell in cells:
    ranges = []
    for environment in ("node", "chromium"):
        value = cell["environments"][environment]
        ranges.append(f"{value['minimumMs'] / 1000:.2f}–{value['maximumMs'] / 1000:.2f}")
    print(f"| {cell['family']} | {cell['n']} | {cell['initialStateBytes']:,} / {cell['finalStateBytes']:,} | {ranges[0]} | {ranges[1]} |")
