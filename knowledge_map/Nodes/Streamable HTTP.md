---
id: "node:Streamable HTTP"
type: concept
domain: agent
aliases: []
sources:
  - "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports"
  - "[[20-Areas/实习与求职/面试题与经验/小红书-Agent服务端开发实习-一面面经#项目与 Agent 服务端]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related: []
attributes: {}
confidence: 高
status: active
---

# Streamable HTTP

> MCP 的 HTTP 传输方式：单一端点收发 JSON-RPC 消息，服务器可返回单个 JSON 或用 SSE 流式返回。

## 为什么需要

MCP 服务器可以是远程服务，客户端与服务器之间需要一种基于 HTTP 的传输：既能完成普通的请求—响应，也能让服务器向客户端流式发送消息、通知或请求。

## 核心要点

- **单一端点**：服务器提供一个同时支持 POST 和 GET 的 MCP endpoint
- **客户端用 POST 发消息**：每条 JSON-RPC 请求、通知或响应都通过一次新的 HTTP POST 提交
- **两种响应形态**：对 JSON-RPC 请求，服务器可以返回 `application/json` 的单个 JSON 对象，也可以返回 `text/event-stream` 开启 SSE 流
- **支持服务器推送**：借助流式响应，服务器能向客户端发送流式消息、通知或请求

## 容易混淆

- **Streamable HTTP vs SSE**：[[SSE]] 只是 Streamable HTTP 可选的响应流机制，二者不是一回事
- **Streamable HTTP vs 旧版 HTTP+SSE**：Streamable HTTP 替代了 MCP 2024-11-05 版本的 HTTP+SSE 传输

## 关联

- [[MCP]]：Streamable HTTP 是 MCP 的两种标准传输之一，另一种是本地进程用的 stdio
- [[SSE]]：流式返回时使用的机制

## 扩展思考

- **MCP 远程服务用什么传输？流式输出怎么实现？** 用 Streamable HTTP：客户端 POST 发 JSON-RPC 消息，服务器要流式返回时把响应设为 `text/event-stream`，走 SSE。

## 参考

- [MCP Specification · Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
