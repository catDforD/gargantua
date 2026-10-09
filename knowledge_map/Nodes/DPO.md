---
id: "node:DPO"
type: method
domain: llm
aliases:
  - Direct Preference Optimization
  - 直接偏好优化
tags:
  - topic/llm
sources:
  - "https://arxiv.org/abs/2305.18290"
  - "https://arxiv.org/html/2305.18290v3"
  - "https://huggingface.co/docs/trl/main/en/dpo_trainer"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent开发岗位面经汇总-2026年4月-01至07#面经 01｜AI 应用开发工程师｜2026-04-28]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[PPO]]"
attributes: {}
confidence: 高
status: active
---

# DPO

> 把 RLHF 改写成一个偏好分类损失，直接用偏好对训练策略，不需要奖励模型和在线采样。

## 要解决的问题

基于 [[PPO]] 的 RLHF 要先训奖励模型，再做在线采样的强化学习，流程复杂且常不稳定。DPO 想用一个普通的监督式损失达到同样的对齐目标。

## 怎么做

- **闭式重参数化**：对奖励模型做闭式重参数化，隐式奖励写成 `r(x,y) = β·log(πθ/πref)`。论文副标题就是 *Your Language Model is Secretly a Reward Model*
- **损失函数**：最大化 `σ(β[log πθ(y⁺|x)/πref(y⁺|x) − log πθ(y⁻|x)/πref(y⁻|x)])`，也就是拉大偏好回答和非偏好回答的对数似然差，等价于 Bradley-Terry 偏好模型
- **只需两个模型**：训练中的策略模型，加一个冻结的参考模型；TRL 默认用训练前的初始策略做参考模型

## 优势与代价

- **优势**：稳定、轻量，几乎不用调超参；在情感控制上超过基于 PPO 的 RLHF，在单轮对话上持平或更好，实现也简单得多
- **代价**：依赖离线的偏好对数据，没有在线交互（这一点是从论文语境推出的，论文没有单列一节讨论）

## 适用场景

- **已有偏好对数据、想要简单稳定的对齐流程**：TRL 提供 `DPOTrainer`，官方支持用 [[LoRA]]（`LoraConfig`）做参数高效训练

## 关联

- [[PPO]]：DPO 论文的对照基线，二者互为替代方案
- [[GRPO]]：同样在简化 PPO，但保留奖励模型和在线采样，只去掉价值模型
- [[LoRA]]：DPOTrainer 支持的参数高效底座

## 扩展思考

- **PPO、DPO、GRPO 各需要哪些模型？** PPO 要策略、参考、奖励、价值四个；GRPO 去掉价值模型，剩三个；DPO 只要策略和参考两个。
- **RL 到底在优化什么？** PPO / GRPO 在优化奖励模型给出的期望奖励，同时用 KL 约束不偏离参考模型；DPO 把同样的目标改写成偏好对上的分类损失。

## 参考

- [arXiv 2305.18290 · DPO](https://arxiv.org/abs/2305.18290)
- [TRL · DPO Trainer](https://huggingface.co/docs/trl/main/en/dpo_trainer)
- 核验日期：2026-09-25
