#!/usr/bin/env python3
"""
Ringi Article Illustrator - Standalone Offline-Capable Article Visual Analyzer
Usage:
    python illustrate_article.py --article path/to/article.md --output-outline outline.md
"""

import os
import sys
import argparse
import re

# Set stdout encoding to utf-8 if possible
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def analyze_article(article_path):
    if not os.path.exists(article_path):
        print(f"Error: Article not found at {article_path}")
        return None

    with open(article_path, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    title = ""
    for line in lines:
        if line.startswith("# "):
            title = line.replace("# ", "").strip()
            break

    headings = []
    for line in lines:
        if re.match(r"^#{1,3}\s+", line):
            headings.append(line.strip())

    print(f"==================================================")
    print(f"  [Ringi Article Illustrator] 分析报告")
    print(f"==================================================")
    print(f"文章标题: {title}")
    print(f"章节数量: {len(headings)} 个标题")
    print(f"文章长度: {len(lines)} 行 ({len(content)} 字符)")
    print(f"--------------------------------------------------")
    print(f"建议 16:9 3D 架构工坊插图规划:")

    proposals = []
    for idx, h in enumerate(headings):
        if idx == 0:
            continue
        clean_h = re.sub(r"^#{1,3}\s+", "", h)
        if any(k in clean_h for k in ["架构", "分层", "概览", "前置", "背景", "0."]):
            proposals.append({
                "section": clean_h,
                "type": "architecture (分层架构工坊)",
                "metaphor": "悬浮透视双层工作台，上层控制面连接下层数据面",
                "filename": "assets/ringi_arch_overview.jpg"
            })
        elif any(k in clean_h for k in ["内存", "存储", "指针", "张量", "地址", "Stack", "Heap"]):
            proposals.append({
                "section": clean_h,
                "type": "memory-map (物理存储映射工坊)",
                "metaphor": "1D 连续物理内存带与 64 字节 Cache Line 测量标尺",
                "filename": "assets/ringi_memory_layout.jpg"
            })
        elif any(k in clean_h for k in ["RAII", "生命周期", "移动", "move", "显存", "所有权"]):
            proposals.append({
                "section": clean_h,
                "type": "core-action (RAII 保险库与零拷贝移交)",
                "metaphor": "智能指针机械臂自动回收显存，0ns 移交发光钥匙",
                "filename": "assets/ringi_raii_move.jpg"
            })
        elif any(k in clean_h for k in ["扩展", "PyBind", "编译", "算子", "JIT", "CUDA"]):
            proposals.append({
                "section": clean_h,
                "type": "pipeline-workshop (算子熔炼与执行图挂载)",
                "metaphor": "C++ 源码进入 JIT 熔炼炉并挂载到 Python 算子树",
                "filename": "assets/ringi_extension_jit.jpg"
            })

    seen = set()
    unique_proposals = []
    for p in proposals:
        if p["filename"] not in seen:
            seen.add(p["filename"])
            unique_proposals.append(p)

    for i, p in enumerate(unique_proposals, 1):
        print(f"  [{i}] 章节: {p['section']}")
        print(f"      类型: {p['type']}")
        print(f"      隐喻: {p['metaphor']}")
        print(f"      文件: {p['filename']}")
        print(f"")

    return unique_proposals

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ringi Article Illustrator Analyzer")
    parser.add_argument("--article", required=True, help="Path to markdown article")
    parser.add_argument("--output-outline", default=None, help="Output outline.md path")
    args = parser.parse_args()

    analyze_article(args.article)
