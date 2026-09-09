#!/usr/bin/env python3
"""Download placeholder 3D models for the battle prototype.

The prototype renders procedural stand-ins (boxes/cylinders) by default. Ticking
"Load 3D Models" in the UI makes it fetch GLB files from /assets/models/ instead.
Vite serves the `public/` directory at the web root, so the files must land in
`public/assets/models/` -- that is what this script does.

Models used (openly licensed glTF sample assets):
  * CesiumMan  -> ryudo.glb   (rigged humanoid, CC-BY 4.0, Cesium)
  * Fox        -> spider.glb  (rigged quadruped, CC0, PixelMannen)

Usage:
    python3 download_model.py            # skip files that already exist
    python3 download_model.py --force    # re-download everything
"""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
import urllib.error
import urllib.request

REPO = "KhronosGroup/glTF-Sample-Assets"
BRANCH = "main"
TARGET_DIR = os.path.join("public", "assets", "models")
GLB_MAGIC = b"glTF"
USER_AGENT = "grandia2-browser-port/model-downloader"

# Several hosts are tried in order: some networks block raw.githubusercontent.com
# but allow github.com (which 302-redirects to raw), or a CDN mirror.
MIRRORS = (
    "https://raw.githubusercontent.com/{repo}/{branch}/{path}",
    "https://github.com/{repo}/raw/{branch}/{path}",
    "https://cdn.jsdelivr.net/gh/{repo}@{branch}/{path}",
    "https://media.githubusercontent.com/media/{repo}/{branch}/{path}",
)

MODELS = (
    {
        "filename": "ryudo.glb",
        "path": "Models/CesiumMan/glTF-Binary/CesiumMan.glb",
        "note": "CesiumMan (CC-BY 4.0) - rigged humanoid stand-in for Ryudo",
    },
    {
        "filename": "spider.glb",
        "path": "Models/Fox/glTF-Binary/Fox.glb",
        "note": "Fox (CC0) - rigged quadruped stand-in for the spiders",
    },
)


def candidate_urls(path: str) -> list[str]:
    return [m.format(repo=REPO, branch=BRANCH, path=path) for m in MIRRORS]


def fetch(url: str, timeout: int = 60) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def write_atomically(destination: str, payload: bytes) -> None:
    """Never leave a truncated/corrupt GLB behind if the process dies mid-write."""
    directory = os.path.dirname(destination) or "."
    handle, temp_path = tempfile.mkstemp(dir=directory, suffix=".part")
    try:
        with os.fdopen(handle, "wb") as file:
            file.write(payload)
        os.replace(temp_path, destination)
    except BaseException:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        raise


def download(model: dict, force: bool) -> bool:
    destination = os.path.join(TARGET_DIR, model["filename"])

    if os.path.exists(destination) and not force:
        size = os.path.getsize(destination)
        print(f"  = {model['filename']} already present ({size:,} bytes), skipping")
        return True

    errors: list[str] = []
    for url in candidate_urls(model["path"]):
        host = url.split("/")[2]
        try:
            payload = fetch(url)
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as error:
            errors.append(f"{host}: {error}")
            continue

        # The old version of this script saved a .gltf file under a .glb name and
        # never checked the response body, so an HTML error page (or a Vite SPA
        # fallback) would be happily written to disk and fail at parse time.
        if not payload.startswith(GLB_MAGIC):
            preview = payload[:64].decode("utf-8", errors="replace").strip()
            errors.append(f"{host}: not a binary glTF (got {len(payload):,} bytes: {preview!r})")
            continue

        write_atomically(destination, payload)
        print(f"  + {model['filename']} <- {host} ({len(payload):,} bytes)")
        return True

    print(f"  ! FAILED {model['filename']}", file=sys.stderr)
    for error in errors:
        print(f"      {error}", file=sys.stderr)
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", action="store_true", help="re-download even if the file exists")
    args = parser.parse_args()

    os.makedirs(TARGET_DIR, exist_ok=True)
    print(f"Downloading placeholder models into {TARGET_DIR}/")

    results = [download(model, args.force) for model in MODELS]
    succeeded = sum(results)

    print()
    if succeeded == len(MODELS):
        print(f"Done: {succeeded}/{len(MODELS)} models ready.")
        print("Enable 'Load 3D Models' in the prototype UI to use them.")
        return 0

    print(f"Done: {succeeded}/{len(MODELS)} models ready, {len(MODELS) - succeeded} failed.", file=sys.stderr)
    print("The prototype still runs -- it falls back to procedural placeholder meshes.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
