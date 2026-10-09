---
id: "node:Sandbox"
type: concept
domain: agent
aliases: []
tags:
  - topic/agent/harness
sources:
  - "[[30-Resources/AI/Agent/托管 Agent 的扩展与脑手解耦#Decouple the brain from the hands]]"
  - "[[30-Resources/AI/Agent/托管 Agent 的扩展与脑手解耦#Many brains, many hands]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[Harness]]"
attributes: {}
confidence: 中
status: active
---

# Sandbox

> 模型运行自己生成的代码、修改文件的隔离执行环境，把动作限制在可丢弃的边界内。

## 为什么需要

模型生成的代码可能出错，也可能被提示注入利用。放进可丢弃的沙箱后，一次失败只是一条工具调用错误，不必抢救整个会话。

## 核心要点

- **沙箱是「手」**：在托管 Agent 的设计里，沙箱是可替换的执行体，由 harness 用工具调用按需创建；接口只有「名称加输入进、字符串出」，harness 不需要知道它是容器、手机还是模拟器
- **坏了就重建**：沙箱故障作为工具调用错误回传给模型；需要重试时按标准配方重新创建，而不是修复原容器。执行环境是可替换的资源，不是需要照料的个体
- **会话状态在沙箱外**：事件日志独立于执行环境存在，沙箱重启不会丢失会话记录
- **凭证不进沙箱**：如果代码能在沙箱里读到 token，一次提示注入就能让攻击者拿到凭据并开出不受限的新会话。做法是把 token 绑定在资源上或放进沙箱外的 vault，外部调用经由代理换发凭证

## 容易混淆

- **Sandbox vs Harness**：沙箱只负责执行，决定何时执行什么的是 [[Harness]]

## 关联

- [[Harness]]：创建和驱动沙箱的一方
- [[MCP]]：托管 Agent 中模型经代理调用 MCP 工具，OAuth token 同样存放在沙箱外的 vault

## 扩展思考

- **Agent 执行代码时凭证怎么保护？** 不让 token 进入沙箱：绑定在资源上或放进外部 vault，由代理在调用时换发。
