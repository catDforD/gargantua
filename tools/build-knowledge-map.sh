#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
KNOWLEDGE_MAP_DIR="$ROOT_DIR/knowledge_map"
GRAPH_ASSETS_DIR="$ROOT_DIR/source/graph/assets"

if command -v pnpm >/dev/null 2>&1; then
  PNPM=(pnpm)
else
  PNPM=(npx --yes pnpm@10.30.3)
fi

"${PNPM[@]}" --dir "$KNOWLEDGE_MAP_DIR" install --frozen-lockfile
"${PNPM[@]}" --dir "$KNOWLEDGE_MAP_DIR" run build

mkdir -p "$GRAPH_ASSETS_DIR"
cp "$KNOWLEDGE_MAP_DIR/dist/assets/knowledge-graph.css" "$GRAPH_ASSETS_DIR/knowledge-graph.css"
cp "$KNOWLEDGE_MAP_DIR/dist/assets/knowledge-graph.js" "$GRAPH_ASSETS_DIR/knowledge-graph.js"
