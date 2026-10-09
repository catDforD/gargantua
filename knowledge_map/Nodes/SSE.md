---
id: "node:SSE"
type: concept
domain: engineering
aliases:
  - Server-Sent Events
  - server-sent events
sources:
  - "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"
  - "[[20-Areas/实习与求职/面试题与经验/小红书-Agent服务端开发实习-一面面经#项目与 Agent 服务端]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[Streamable HTTP]]"
attributes: {}
confidence: 高
status: active
---

# SSE

> 基于 HTTP 的服务器到客户端单向事件流，服务器持续推送，客户端不能经同一连接回传。

## 为什么需要

很多场景只需要服务器不断往前端推数据，比如流式输出。SSE 用一个普通的 HTTP 响应就能做到，不需要另起一套双向协议。

## 核心要点

- **单向推送**：客户端用 `EventSource` 建立连接后，服务器以事件流持续发送数据
- **普通 HTTP 响应**：响应类型是 `text/event-stream`，强制 UTF-8；事件由文本块组成，以空行分隔
- **规范强制自动重连**：服务器可以用 `retry:` 指定重连间隔，用 HTTP 204 No Content 让客户端停止重连
- **断点续传**：事件带 `id:` 字段，重连时客户端通过 `Last-Event-ID` 请求头告诉服务器上次收到哪里
- **只传文本**：不支持二进制数据

## 容易混淆

- **SSE vs WebSocket**：SSE 单向、只传文本、规范自带重连；[[WebSocket]] 全双工、支持二进制、规范不定义重连
- **SSE vs Streamable HTTP**：SSE 是 [[Streamable HTTP]] 可选的响应流机制，不等于 Streamable HTTP 本身

## 关联

- [[Streamable HTTP]]：MCP 的 HTTP 传输，用 SSE 做流式返回
- [[WebSocket]]：面试里最常拿来对比的双向方案

## 扩展思考

- **SSE 断线后怎么办？** 浏览器按规范自动重连，并带上 `Last-Event-ID`，服务器据此从断点继续发送。

## 参考

- [MDN · Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [WHATWG · Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- 核验日期：2026-09-25
