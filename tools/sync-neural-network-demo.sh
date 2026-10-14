#!/usr/bin/env bash
set -euo pipefail

# 把本地实验目录里的 demo 源文件同步到站点发布目录。
# knowledge_lab/ 不进仓库，所以这里必须显式列出真正要发布的文件。
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
LAB_DIR="$ROOT_DIR/knowledge_lab/llm/01-neural-network-structure/src"
WORK_DIR="$ROOT_DIR/source/works/neural-network"

FILES=(index.html style.css app.js network.js digits.js weights.js)

if [ ! -d "$LAB_DIR" ]; then
  echo "找不到实验目录：$LAB_DIR" >&2
  exit 1
fi

mkdir -p "$WORK_DIR"
for name in "${FILES[@]}"; do
  if [ ! -f "$LAB_DIR/$name" ]; then
    echo "缺少文件：$LAB_DIR/$name" >&2
    exit 1
  fi
  cp "$LAB_DIR/$name" "$WORK_DIR/$name"
  echo "同步 $name"
done

echo "已同步到 source/works/neural-network（共 ${#FILES[@]} 个文件）"
