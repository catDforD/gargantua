---
id: "node:PPO"
type: method
domain: llm
aliases:
  - Proximal Policy Optimization
  - 近端策略优化
tags:
  - topic/llm
sources:
  - "https://arxiv.org/abs/1707.06347"
  - "https://huggingface.co/blog/the_n_implementation_details_of_rlhf_with_ppo"
  - "https://arxiv.org/abs/2402.03300"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent开发岗位面经汇总-2026年4月-01至07#面经 01｜AI 应用开发工程师｜2026-04-28]]"
relations:
  broader_than:
    - "[[强化学习]]"
  instantiates: []
  prerequisites: []
  related: []
attributes: {}
confidence: 高
status: active
---

# PPO

> 用截断代理目标限制单次策略更新幅度的策略梯度算法，是 RLHF 的经典优化器。

## 要解决的问题

策略梯度需要控制单次更新的幅度才能训得稳。PPO 想要 TRPO 那样的稳定性，但实现更简单：用一个截断的代理目标限制更新，还能在同一批数据上做多轮 minibatch 更新。

## 怎么做

- **截断目标**：`max E[min(r(θ)·Â, clip(r(θ), 1−ε, 1+ε)·Â)]`，`r(θ)` 是新旧策略的概率比，超出 `[1−ε, 1+ε]` 的部分被截掉。Hugging Face 的实现里 clip 系数取 0.2，并用 clipfrac 指标监控
- **优势估计**：优势 `Â` 由 GAE 和学习到的价值函数估计
- **用在 RLHF**：优化奖励模型给出的期望奖励，同时用参考模型做自适应 KL 惩罚
- **四个模型**：策略、参考、奖励、价值；价值模型通常和策略模型一样大

## 优势与代价

- **优势**：有 TRPO 的稳定性，但实现更简单，样本效率更好
- **代价**：四个模型带来很大的显存和工程开销；DPO 论文称 RLHF-PPO 复杂且常不稳定，Hugging Face 博客也记录了大量实现陷阱

## 适用场景

- **原始场景**：原论文用于机器人运动控制和 Atari
- **LLM 的 RL 微调**：作为 critic-based 算法被广泛使用，InstructGPT 就用了它

## 关联

- [[GRPO]]：论文自述的 PPO 变体，用组内相对优势替代价值模型
- [[DPO]]：完全绕开显式奖励模型和在线采样的替代方案
- 上位概念「强化学习」在本库还没有节点

## 扩展思考

- **PPO、DPO、GRPO 有什么区别？** 从所需模型看最清楚：PPO 要策略、参考、奖励、价值四个；GRPO 去掉价值模型；DPO 连奖励模型和在线采样都不要，只剩策略和参考。
- **clip 起什么作用？** 把新旧策略的概率比限制在 `[1−ε, 1+ε]`，防止单次更新偏离太远。

## 参考

- [arXiv 1707.06347 · PPO](https://arxiv.org/abs/1707.06347)
- [Hugging Face · The N Implementation Details of RLHF with PPO](https://huggingface.co/blog/the_n_implementation_details_of_rlhf_with_ppo)
- [arXiv 2402.03300 · DeepSeekMath](https://arxiv.org/abs/2402.03300)
- 核验日期：2026-09-25
