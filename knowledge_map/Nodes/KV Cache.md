---
id: "node:KV Cache"
type: concept
domain: llm
aliases:
  - key-value cache
  - KV 缓存
  - 键值缓存
tags:
  - topic/llm
sources:
  - "https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/"
  - "https://arxiv.org/abs/2309.06180"
  - "https://blog.vllm.ai/2023-06-20/vllm.html"
  - "https://docs.vllm.ai/en/latest/design/prefix_caching.html"
  - "https://arxiv.org/abs/2311.03285"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent与大模型岗位面经汇总-01至05-07-08#实习与项目]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[LoRA]]"
attributes: {}
confidence: 高
status: active
---

# KV Cache

> 自回归 Transformer 解码时把已生成 token 的 Key / Value 张量留在显存里，避免每步重复计算。

## 为什么需要

解码阶段每生成一个 token，都要用到之前所有 token 的 Key 和 Value。每一步都重算一遍代价太高，所以把它们缓存在 GPU 显存里。这只是省掉重复计算，不改变模型的数学结果。

## 核心要点

- **显存两大占用**：推理时 GPU 显存主要花在模型权重和 KV cache 上，通常每层一份 KV cache
- **随序列线性增长**：每个 token 占 `2 × num_layers × (num_heads × dim_head) × precision_in_bytes` 字节，因子 2 对应 K 和 V。Llama 2 7B、FP16、batch=1、序列长 4096 时约 2 GB
- **结构级压缩**：MQA 让所有头共享一组 K/V，GQA 让 K/V 头数少于 Q 头数（Llama 2 70B 采用），都是靠减少存储的 K/V 头数省显存
- **分页管理**：按最大长度静态预留会造成浪费和碎片，vLLM 称既有系统因此浪费 60%–80% 显存。PagedAttention 借鉴操作系统虚拟内存，把 KV cache 切成固定 token 数的 block，经 block table 映射到不连续的物理块、按需分配；浪费只出现在最后一块（实测 <4%），吞吐比 FasterTransformer / Orca 高 2–4 倍
- **前缀缓存**：后续请求的 prompt 前缀与已处理请求匹配时，直接复用对应的 KV cache block，省掉重复的 prompt 计算。vLLM 的实现依赖 block pool、满块哈希、引用计数和 free queue 淘汰

## 容易混淆

- **KV Cache vs 通用缓存**：它是解码阶段注意力计算的专用缓存，不是通用的结果缓存
- **KV Cache vs LoRA**：[[LoRA]] 属于训练 / 微调，KV Cache 属于推理 / 解码，原理上不相关；只在服务系统层有交集，S-LoRA 的 Unified Paging 用同一个内存池管理不同秩的 adapter 权重和不同长度的 KV cache

## 关联

- [[LoRA]]：只在 S-LoRA 这类服务系统中共享显存管理

## 扩展思考

- **KV cache 占显存太多怎么办？** 三个层面：模型结构上用 MQA / GQA 减少 K/V 头数；内存管理上用 PagedAttention 分页、按需分配；跨请求用前缀缓存复用相同前缀。

## 参考

- [NVIDIA · Mastering LLM Techniques: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
- [arXiv 2309.06180 · PagedAttention](https://arxiv.org/abs/2309.06180)
- [vLLM · Prefix Caching](https://docs.vllm.ai/en/latest/design/prefix_caching.html)
- [arXiv 2311.03285 · S-LoRA](https://arxiv.org/abs/2311.03285)
- 核验日期：2026-09-25
