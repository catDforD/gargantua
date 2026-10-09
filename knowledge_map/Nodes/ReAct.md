---
id: "node:ReAct"
type: method
domain: agent
aliases:
  - Reasoning + Acting
  - ReAct prompting
  - ReAct 范式
  - 推理-行动交替
tags:
  - topic/agent/architecture
sources:
  - "https://arxiv.org/abs/2210.03629"
  - "https://www.langchain.com/blog/planning-agents"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent与大模型岗位面经汇总-01至05-07-08#项目与 Agent 工程]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites:
    - "[[Tool Calling]]"
  related:
    - "[[Plan-and-Execute]]"
attributes: {}
confidence: 高
status: active
---

# ReAct

> 让模型交替生成推理（Thought）和行动（Action），再依据观察结果（Observation）循环修正的提示范式。

## 要解决的问题

纯思维链（CoT）只在模型内部推理，拿不到外部信息，容易产生幻觉，一步错了还会一路传下去。ReAct 在推理中间插入行动，用环境的真实反馈来校正推理。

## 怎么做

- **Thought**：制定、跟踪、修改和修复计划
- **Action**：调用工具或查询环境获取信息，例如 Wikipedia API、网页界面
- **Observation**：行动结果进入下一轮推理，循环直到得出答案
- **示例需求少**：论文在 HotpotQA、FEVER、ALFWorld、WebShop 上验证，只需 1–2 个示例

## 优势与代价

- **优势**：相比纯 CoT 减少幻觉和错误传播；在交互决策任务上，绝对成功率比模仿学习和强化学习基线分别高 34 和 10 个百分点；推理轨迹也让过程更可解释
- **代价**：每一步行动都要一次 LLM 调用，长任务成本高；没有全局计划，长程任务容易迷失方向

## 适用场景

- **适合**：需要动态环境反馈、步骤间强依赖的交互式任务，如检索问答、网页操作、游戏环境
- **不适合**：步骤可以预先分解、对成本敏感的长链任务，这类任务更适合 [[Plan-and-Execute]]

## 关联

- [[Tool Calling]]：Action 步骤的实现基础
- [[Plan-and-Execute]]：为解决 ReAct 的成本和长程迷失问题而出现的模式

## 扩展思考

- **ReAct 和 CoT 有什么区别？** CoT 只推理不行动；ReAct 在推理中插入行动，用观察结果修正推理，因此幻觉更少。
- **ReAct 是多智能体吗？** 不是。它是单个模型的推理—行动循环，也不会预先一次性生成完整计划。

## 参考

- [arXiv 2210.03629 · ReAct（Yao et al., ICLR 2023）](https://arxiv.org/abs/2210.03629)
- [LangChain Blog · Planning Agents](https://www.langchain.com/blog/planning-agents)
- 核验日期：2026-09-25
