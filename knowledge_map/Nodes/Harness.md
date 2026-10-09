---
id: "node:Harness"
type: concept
domain: agent
aliases: []
tags:
  - topic/agent/harness
sources:
  - "[[30-Resources/AI/Agent/Codex 作为平台：构建于开放 Agent Harness 之上#The reusable part is the agent loop]]"
  - "[[30-Resources/AI/Agent/长时运行 Agent 的有效 Harness#The long-running agent problem]]"
  - "[[30-Resources/AI/Agent/托管 Agent 的扩展与脑手解耦#Don’t adopt a pet]]"
  - "[[30-Resources/AI/Agent/编排器税：保护工作记忆的多 Agent 实践#Acknowledgments]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[Tool Calling]]"
attributes: {}
confidence: 中
status: active
---

# Harness

> 模型之外负责执行的那层系统：维持上下文、调用工具、约束边界、处理审批与失败。

## 为什么需要

模型只在一个循环里做推理。理解任务、维护上下文、检查信息、调用工具、暴露进度、处理失败、请求人工审批、返回结果，这些都要有一层系统来承担。可复用的那部分叫 agent loop，包围它的整套执行系统就是 harness。

## 核心要点

- **设计直接影响能力**：在 ARC-AGI-3 上，保留推理并压缩上下文后，分数从 13.3% 升到 38.3%，输出 token 降到约六分之一
- **上下文管理是基本功**：Claude Agent SDK 作为通用 harness 自带 compaction，可以跨多个上下文窗口持续工作；但只靠压缩撑不起复杂工程任务
- **补偿机制会过时**：harness 里编码了「模型做不到什么」的假设，模型升级后这些补偿可能变成负担，需要持续审查
- **对外暴露多个集成面**：Codex 除了 App、CLI 和 IDE 扩展，还提供 `codex exec`、SDK 和 app-server；app-server 让应用自己保留会话、事件流与审批处理

## 容易混淆

- **Harness vs 模型**：harness 不包含模型本身，也不包含模型服务的托管部分
- **Harness vs Tool Calling**：[[Tool Calling]] 只是模型发起调用的机制，上下文管理、运行边界和审批都属于 harness

## 关联

- [[Tool Calling]]：harness 把模型提出的调用路由到实际执行体并处理结果
- [[Sandbox]]：harness 通过工具调用按需创建和驱动沙箱
- [[LangGraph]]：在 LangChain 的 framework / runtime / harness 三层划分里属于 runtime，harness 构建在其上

## 扩展思考

- **为什么说 harness 会影响 Agent 能力？** 同一个模型，上下文怎么压缩、推理是否保留，结果差别很大，ARC-AGI-3 上分数从 13.3% 到 38.3% 就是例子。
