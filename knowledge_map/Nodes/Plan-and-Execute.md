---
id: "node:Plan-and-Execute"
type: method
domain: agent
aliases:
  - plan-then-execute
  - planner-executor
  - 规划-执行
  - 先规划后执行
tags:
  - topic/agent/architecture
sources:
  - "https://www.langchain.com/blog/planning-agents"
  - "https://arxiv.org/abs/2305.04091"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent开发岗位面经汇总-2026年4月-01至07#面经 05｜AI Agent 开发｜2026-04-15]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites:
    - "[[Tool Calling]]"
  related: []
attributes: {}
confidence: 高
status: active
---

# Plan-and-Execute

> 先由规划器生成完整多步计划，再由执行器逐步执行、必要时重规划的 Agent 编排模式。

## 要解决的问题

[[ReAct]] 每一步都调用一次大模型，成本高；没有全局计划，长程任务容易跑偏。Plan-and-Execute 先把整体想清楚，再交给执行器一步步做。

## 怎么做

- **Plan**：LLM 把任务分解成子步骤列表
- **Execute**：逐步执行，常用较小的模型或一个 ReAct agent 完成单步
- **Re-Plan**：根据执行结果决定继续，还是修订计划

## 优势与代价

- **优势**：不必每次工具调用都请求昂贵的大模型，更快更省；强制模型先想清楚整体目标，更适合长程任务
- **代价**：初始计划基于不完整的信息，环境剧变时要靠重规划；单步执行的反馈粒度比 ReAct 粗

## 适用场景

- **适合**：步骤可以预先分解、执行相对确定、对成本敏感的长链任务
- **不适合**：需要频繁环境反馈、步骤强依赖的交互任务，这类任务更适合 [[ReAct]]

## 学术来源

这是工程实践里总结出的名称，不来自某一篇论文。LangChain 官方引用了 Plan-and-Solve Prompting（Wang et al. 2023）、ReWOO、LLMCompiler 和 BabyAGI。

## 关联

- [[Tool Calling]]：执行阶段的基础
- [[ReAct]]：相对的单步交替模式，也常被用作这里的执行器

## 扩展思考

- **ReAct 和 Plan-and-Execute 怎么选？** 看任务能否预先分解、对成本是否敏感、对环境反馈依赖多强：能分解、要省钱选 Plan-and-Execute；反馈频繁、步骤强依赖选 ReAct。

## 参考

- [LangChain Blog · Planning Agents](https://www.langchain.com/blog/planning-agents)
- [arXiv 2305.04091 · Plan-and-Solve](https://arxiv.org/abs/2305.04091)
- 核验日期：2026-09-25
