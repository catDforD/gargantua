#!/usr/bin/env bash
# 在 knowledge_lab/ 下按分类创建新实验目录，模板来自 knowledge_lab/_template/。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAB="$ROOT/knowledge_lab"
CATEGORIES="llm rag agent engineering algorithm"

usage() {
  cat <<'EOF'
用法: bash tools/new-experiment.sh <category> <slug> [标题]

  category  llm | rag | agent | engineering | algorithm
  slug      小写英文短横线命名，如 kv-cache-basics
  标题      可选，写入 README 的一级标题，默认用 slug

示例: bash tools/new-experiment.sh llm kv-cache-basics "KV Cache 命中率与显存"
EOF
}

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  usage
  exit 1
fi

category="$1"
slug="$2"
title="${3:-$slug}"

case " $CATEGORIES " in
  *" $category "*) ;;
  *) echo "错误：未知分类 '$category'，可选：$CATEGORIES" >&2; exit 1 ;;
esac

case "$slug" in
  *[!a-z0-9-]*|"") echo "错误：slug '$slug' 只能用小写字母、数字和短横线" >&2; exit 1 ;;
esac

category_dir="$LAB/$category"
if [ ! -d "$category_dir" ]; then
  echo "错误：分类目录不存在：$category_dir" >&2
  exit 1
fi

next=1
for existing in "$category_dir"/[0-9][0-9]-*; do
  [ -e "$existing" ] || continue
  index="${existing##*/}"
  index="${index%%-*}"
  index=$((10#$index))
  [ "$index" -ge "$next" ] && next=$((index + 1))
done

dir="$(printf '%s/%02d-%s' "$category_dir" "$next" "$slug")"
if [ -e "$dir" ]; then
  echo "错误：目标目录已存在：$dir" >&2
  exit 1
fi

mkdir -p "$dir/src"
sed "s|^# <实验名>$|# $title|" "$LAB/_template/README.md" > "$dir/README.md"

echo "已创建：${dir#"$ROOT"/}"
echo "接下来：填 README.md 的目标与跑法，代码放 src/，然后在 ${category}/README.md 的实验清单里登记。"
