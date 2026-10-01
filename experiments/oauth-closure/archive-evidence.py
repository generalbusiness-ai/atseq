"""Losslessly archive original capture bytes; validate the inventory before packing."""
from pathlib import Path
import gzip
import hashlib
import io
import json
import tarfile

base = Path('experiments/post-spike-evidence/2026-10-01/oauth-closure')
manifest_bytes = (base / 'capture-manifest.json').read_bytes()
manifest = json.loads(manifest_bytes)
files = manifest['files'] + [{
    'path': 'capture-manifest.json',
    'bytes': len(manifest_bytes),
    'sha256': hashlib.sha256(manifest_bytes).hexdigest(),
}]
archive = base / 'raw-captures.tar.gz'
with archive.open('wb') as destination:
    with gzip.GzipFile(filename='', mode='wb', fileobj=destination, mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode='w', format=tarfile.PAX_FORMAT) as tar:
            for entry in sorted(files, key=lambda item: item['path']):
                content = (base / entry['path']).read_bytes()
                assert len(content) == entry['bytes'], entry['path']
                assert hashlib.sha256(content).hexdigest() == entry['sha256'], entry['path']
                info = tarfile.TarInfo(entry['path'])
                info.size = len(content)
                info.mode = 0o644
                info.mtime = 0
                tar.addfile(info, io.BytesIO(content))
with tarfile.open(archive, 'r:gz') as tar:
    expected = {entry['path']: entry for entry in files}
    assert set(tar.getnames()) == set(expected)
    for member in tar.getmembers():
        assert member.isfile()
        content = tar.extractfile(member).read()
        assert hashlib.sha256(content).hexdigest() == expected[member.name]['sha256']
content = archive.read_bytes()
(base / 'archive-info.json').write_text(json.dumps({
    'format': 'gzip, deterministic tar member metadata; exact raw capture bytes retained',
    'path': archive.name,
    'bytes': len(content),
    'sha256': hashlib.sha256(content).hexdigest(),
    'members': len(files),
    'rawBytes': sum(entry['bytes'] for entry in files),
    'checked': 'Every unpacked member SHA-256 and size matches the capture inventory; manifest included',
}, indent=2) + '\n')
print('Validated lossless archive:', len(files), 'members,', len(content), 'bytes')
