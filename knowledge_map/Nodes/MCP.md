---
id: "node:MCP"
type: entity
domain: agent
aliases:
  - Model Context Protocol
tags:
  - topic/agent/tool-calling
sources:
  - "https://modelcontextprotocol.io/docs/getting-started/intro"
  - "https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture"
  - "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports"
  - "https://www.anthropic.com/news/model-context-protocol"
  - "[[30-Resources/AI/Agent/Codex 作为平台：构建于开放 Agent Harness 之上#An open harness developers can inspect and adapt]]"
  - "[[30-Resources/AI/Agent/托管 Agent 的扩展与脑手解耦#Decouple the brain from the hands]]"
  - "[[20-Areas/实习与求职/面试题与经验/小红书-Agent服务端开发实习-一面面经#项目与 Agent 服务端]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[Tool Calling]]"
    - "[[Streamable HTTP]]"
attributes: {}
confidence: 高
status: active
---

# MCP

> 把 AI 应用连接到外部系统的开放标准：服务器暴露工具和数据，应用通过客户端接入。

## 定位

Anthropic 于 2024-11-25 发布，由 David Soria Parra 和 Justin Spahr-Summers 创建，以开源项目、SDK 和参考服务器实现的形式推进。官方把它比作 AI 应用的 USB-C 接口：像 USB-C 统一设备连接一样，MCP 统一 AI 应用连接外部系统的方式。

## 核心组成

- **主机、客户端、服务器**：MCP 主机（AI 应用）为每个 MCP 服务器创建一个 MCP 客户端，每个客户端维持一条专用连接
- **数据层**：基于 JSON-RPC 2.0，定义消息、能力和版本发现
- **传输层**：定义通信通道与认证。本地进程用 stdio，远程服务用 [[Streamable HTTP]]；同一套消息格式可以跑在不同传输上
- **服务器原语**：tools 是可调用的函数，resources 是提供上下文的数据源，prompts 是可复用的交互模板。客户端用列表方法发现它们，工具通过 `tools/call` 执行

## 版本演进

- **传输替换**：Streamable HTTP 替代了 2024-11-05 版本的 HTTP+SSE 传输
- **2026-07-28 修订**：协议被描述为无状态，每个请求在 `_meta` 里携带协议版本和该请求相关的能力；服务器通过 `server/discover` 公布支持的版本；客户端原语 sampling 和 logging 被标记为废弃

## 实践注意

- **凭证放在沙箱外**：托管 Agent 中，模型经代理调用 MCP 工具，OAuth token 存在沙箱外的 vault，harness 不接触凭证
- **应用可以反向暴露能力**：应用可以向 harness 暴露自己的 MCP 服务，Codex 就支持这种用法

## 关联

- [[Tool Calling]]：MCP 管工具怎么被标准化暴露和接入，模型选择调用哪个工具仍属于 Tool Calling
- [[Streamable HTTP]]：MCP 的两种标准传输之一
- [[Sandbox]]、[[Harness]]：托管 Agent 里 MCP 调用经过的执行与凭证边界

## 扩展思考

- **MCP 版本兼容怎么处理？** 新修订里每个请求在 `_meta` 携带协议版本，服务器通过 `server/discover` 公布支持的版本；升级时还要留意传输层替换和被废弃的原语。

## 参考

- [MCP · What is the Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)
- [MCP · Architecture overview](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [Anthropic · Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- 核验日期：2026-09-24
