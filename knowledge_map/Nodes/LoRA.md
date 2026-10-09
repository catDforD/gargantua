---
id: "node:LoRA"
type: method
domain: llm
aliases:
  - Low-Rank Adaptation
  - 低秩适配
  - 低秩微调
tags:
  - topic/llm
sources:
  - "https://arxiv.org/abs/2106.09685"
  - "https://arxiv.org/abs/2305.14314"
  - "https://huggingface.co/docs/trl/dpo_trainer"
  - "https://huggingface.co/docs/trl/grpo_trainer"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent与大模型岗位面经汇总-01至05-07-08#面经 07]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[DPO]]"
    - "[[GRPO]]"
attributes: {}
confidence: 高
status: active
---

# LoRA

> 冻结预训练权重，只向 Transformer 各层注入可训练的低秩分解矩阵来学习任务增量的参数高效微调方法。

## 要解决的问题

全量微调大模型要训练和保存全部参数，显存和存储开销都很大。LoRA 只训练很少的新增参数，就能把模型适配到下游任务。

## 怎么做

- **冻结原权重**：预训练权重保持不动
- **注入低秩矩阵**：在 Transformer 每层加入可训练的低秩分解矩阵，学习下游任务的增量
- **为什么低秩够用**：论文对语言模型适配中的秩亏（rank-deficiency）做了实证研究，以此解释低秩为何有效
- **可以合并**：训练好的增量能合并回原权重

## 优势与代价

- **参数与显存**：相比用 Adam 全量微调 GPT-3 175B，可训练参数减少 10,000 倍，GPU 显存需求降低 3 倍
- **效果**：在 RoBERTa、DeBERTa、GPT-2、GPT-3 上与全量微调持平或更好
- **速度**：训练吞吐更高；由于权重可以合并回去，和 adapter 类方法不同，不增加推理延迟

## 变体：QLoRA

- **做法**：把预训练模型量化到 4-bit 并冻结，梯度穿过它回传到 LoRA 适配器
- **三项改进**：NF4（4-bit NormalFloat）、Double Quantization（对量化常数再量化）、Paged Optimizers（应对显存峰值）
- **效果**：单张 48GB GPU 就能微调 65B 模型，保持 16-bit 全量微调的任务性能；Guanaco 模型族在 Vicuna benchmark 上达到 ChatGPT 的 99.3%，单卡微调约 24 小时

## 适用场景

- **对齐训练的底座**：TRL 的 DPOTrainer 和 GRPOTrainer 都官方支持 LoRA（`LoraConfig` / `--use_peft`），常和 [[DPO]]、[[GRPO]] 组合使用

## 容易混淆

- **LoRA vs KV Cache**：LoRA 是训练期技术，[[KV Cache]] 是推理期缓存，两者只在 S-LoRA 这样的服务系统里共享内存池
- **LoRA vs 量化**：LoRA 本身不是量化，QLoRA 才是把两者结合

## 关联

- [[DPO]]、[[GRPO]]：常用 LoRA 作为参数高效底座
- 父概念「参数高效微调（PEFT）」在本库还没有节点

## 扩展思考

- **LoRA 为什么不增加推理延迟？** 低秩增量能合并回原权重，推理时就是一个普通模型；adapter 类方法会额外插入层，所以有延迟。
- **QLoRA 比 LoRA 多做了什么？** 把底座量化到 4-bit，再加上 NF4、双重量化和分页优化器三项改进，单卡就能微调 65B 模型。

## 参考

- [arXiv 2106.09685 · LoRA](https://arxiv.org/abs/2106.09685)
- [arXiv 2305.14314 · QLoRA](https://arxiv.org/abs/2305.14314)
- [TRL · DPO Trainer](https://huggingface.co/docs/trl/dpo_trainer)
- 核验日期：2026-09-25
