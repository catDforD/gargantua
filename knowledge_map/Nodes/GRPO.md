---
id: "node:GRPO"
type: method
domain: llm
aliases:
  - Group Relative Policy Optimization
  - 组相对策略优化
tags:
  - topic/llm
sources:
  - "https://arxiv.org/abs/2402.03300"
  - "https://arxiv.org/html/2402.03300v3"
  - "https://huggingface.co/docs/trl/main/en/grpo_trainer"
  - "https://arxiv.org/html/2501.12948v1"
  - "https://github.com/deepseek-ai/DeepSeek-Math"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent开发岗位面经汇总-2026年4月-01至07#面经 01｜AI 应用开发工程师｜2026-04-28]]"
relations:
  broader_than:
    - "[[PPO]]"
  instantiates: []
  prerequisites: []
  related: []
attributes: {}
confidence: 高
status: active
---

# GRPO

> DeepSeek 提出的 PPO 变体：用同一提示下一组输出的相对奖励作基线，省去价值模型。

## 要解决的问题

[[PPO]] 需要一个价值（critic）模型来估计基线，它通常和策略模型一样大，显存和计算开销都很重。GRPO 想去掉它。

## 怎么做

- **组采样**：对同一个提示，从旧策略采样 G 个输出
- **组内相对优势**：用组内奖励的均值和标准差归一化，`Â_i = (r_i − mean(r)) / std(r)`，以此替代价值模型估计的基线
- **其余照旧**：沿用 PPO 的截断代理目标，保留 KL 约束；奖励来自奖励模型或可验证的奖励函数
- **三个模型**：策略、参考、奖励模型或奖励函数，不需要价值模型

## 优势与代价

- **优势**：去掉与策略同规模的价值模型，显著降低显存和计算开销；组内对比也贴合奖励模型「相对比较」的性质
- **注意**：TRL 的实现额外加了对参考策略的 KL 惩罚项，归一化方式也和论文略有差别，照搬论文公式时要留意

## 适用场景

- **数学与推理 RL**：DeepSeekMath-Instruct 的结果监督 RL、过程监督 RL 和迭代 RL 都用它；DeepSeek-R1 也以 GRPO 为 RL 框架
- **工程实现**：TRL 提供 `GRPOTrainer`，支持 `--use_peft` 和 [[LoRA]] 组合；官方代码在 DeepSeek-Math 仓库

## 关联

- [[PPO]]：GRPO 是它的变体，论文原文称 *a variant of Proximal Policy Optimization*
- [[DPO]]：另一种简化 PPO 的思路，但连奖励模型和在线采样都去掉了
- [[LoRA]]：GRPOTrainer 支持的参数高效底座

## 扩展思考

- **GRPO 为什么不需要价值模型？** 基线不再由价值模型估计，而是取同一提示下多个输出的平均奖励，再按组内标准差归一化得到优势。

## 参考

- [arXiv 2402.03300 · DeepSeekMath](https://arxiv.org/abs/2402.03300)
- [TRL · GRPO Trainer](https://huggingface.co/docs/trl/main/en/grpo_trainer)
- [arXiv 2501.12948 · DeepSeek-R1](https://arxiv.org/html/2501.12948v1)
- 核验日期：2026-09-25
