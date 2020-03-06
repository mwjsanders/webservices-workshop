#!/usr/bin/env bash
set -eu
SNAPSHOT_NAME="$1"
SNAPSHOT_DIR="${2:-"viewer_snapshots"}"
mkdir -p "viewer_snapshots"
rsync -av --progress viewer/ "${SNAPSHOT_DIR}/${SNAPSHOT_NAME}" --exclude node_modules --exclude .cache --exclude dist
