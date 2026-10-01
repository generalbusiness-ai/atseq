"""Validate and summarize retained cap kernels, without running a timed method."""

import argparse
import hashlib
import json
import math
from pathlib import Path
import statistics


def summarize(directory: Path):
    raw = {}
    environments = {}
    references = None
    heads = set()
    fixture_hashes = set()
    for environment in ("node", "chromium"):
        path = directory / f"{environment}-timing.json"
        payload = path.read_bytes()
        capture = json.loads(payload)
        raw[path.name] = hashlib.sha256(payload).hexdigest()
        heads.add(capture["metadata"]["exactHead"])
        fixture_hashes.add(capture["metadata"]["fixtureSha256"])
        if (capture["samples"], capture["warmups"], capture["repetitions"]) != (7, 2, 1):
            raise ValueError("Unexpected sampling protocol")
        current_references = [item["reference"] for item in capture["captures"]]
        if references is not None and references != current_references:
            raise ValueError("Node and Chromium references differ")
        references = current_references
        if len(capture["captures"]) != 21 or len({item["name"] for item in capture["captures"]}) != 21:
            raise ValueError("Expected 21 distinct fixtures")
        fixtures = []
        for item in capture["captures"]:
            reference = item["reference"]
            operations = [operation["name"] for operation in reference["operations"]]
            if len(operations) != 13 or len(set(operations)) != 13:
                raise ValueError("Expected 13 distinct operations")
            expected_order = [
                (operations[(step + sample) % 13], sample)
                for sample in range(7) for step in range(13)
            ]
            actual_order = [(row["operation"], row["sample"]) for row in item["rows"]]
            if expected_order != actual_order:
                raise ValueError("Raw sample order differs from the recorded protocol")
            rows = []
            for operation in reference["operations"]:
                samples = [row["elapsedMs"] for row in item["rows"] if row["operation"] == operation["name"]]
                if len(samples) != 7 or any(not math.isfinite(value) or value < 0 for value in samples):
                    raise ValueError("Invalid raw samples")
                if any(row["repetitions"] != 1 for row in item["rows"]):
                    raise ValueError("Unexpected repetition count")
                rows.append({
                    "operation": operation["name"],
                    "disposition": "refusal:" + operation["refused"] if "refused" in operation else "completed",
                    "samplesMsInRecordedOrder": samples,
                    "count": len(samples),
                    "minimumMs": min(samples),
                    "medianMs": statistics.median(samples),
                    "maximumMs": max(samples),
                })
            fixtures.append({
                "name": item["name"], "family": reference["family"], "size": reference["size"],
                "stateJsonBytes": reference["stateJsonBytes"], "rowCount": reference["rowCount"],
                "operations": rows,
            })
        environments[environment] = {"timedSpans": sum(len(item["rows"]) for item in capture["captures"]), "fixtures": fixtures}
    if len(heads) != 1 or len(fixture_hashes) != 1:
        raise ValueError("Source or fixture identity differs between environments")
    return {
        "format": "atseq-complete-state-cap-statistics", "version": 1,
        "sourceHead": next(iter(heads)), "fixtureSha256": next(iter(fixture_hashes)),
        "rawHashes": raw, "referenceEquality": True,
        "strictControlsPerEnvironment": sum(len(reference["controls"]) for reference in references),
        "wireRefusalsPerEnvironment": sum("refused" in operation for reference in references for operation in reference["operations"]),
        "samplesPerOperation": 7, "warmupsPerOperation": 2, "repetitionsPerSample": 1,
        "method": "Median and full min/max range of all seven single-call samples. No trimming, filtering, timing gates or reruns. Samples remain in recorded order; no exclusive-stage attribution.",
        "environments": environments,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    arguments = parser.parse_args()
    result = summarize(arguments.directory)
    arguments.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"referenceEquality": result["referenceEquality"], "timedSpansPerEnvironment": 1911, "strictControls": result["strictControlsPerEnvironment"], "wireRefusals": result["wireRefusalsPerEnvironment"]}))
