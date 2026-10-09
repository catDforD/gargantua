---
id: "node:WebSocket"
type: concept
domain: engineering
aliases:
  - WebSockets
  - WebSocket API
  - RFC 6455
  - ws
  - wss
tags:
  - topic/engineering/backend
sources:
  - "https://www.rfc-editor.org/rfc/rfc6455.txt"
  - "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"
  - "https://html.spec.whatwg.org/multipage/web-sockets.html"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent开发岗位面经汇总-2026年4月-01至07#面经 05｜AI Agent 开发｜2026-04-15]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[SSE]]"
attributes: {}
confidence: 高
status: active
---

# WebSocket

> 经 HTTP Upgrade 握手建立、基于 TCP 的全双工通信协议，一条长连接上双向收发消息。

## 为什么需要

在 WebSocket 之前，浏览器要实现实时通信只能轮询：XMLHttpRequest、iframe、long polling，靠多开 HTTP 连接来模拟双向。WebSocket（RFC 6455）用一条连接替代这些方案。

## 核心要点

- **握手**：客户端发 `GET`，带 `Upgrade: websocket`、`Connection: Upgrade`、`Sec-WebSocket-Key` 和 `Sec-WebSocket-Version: 13`；服务器回 `101 Switching Protocols`，非 101 即握手失败
- **Accept 计算**：服务器把 Key 拼接固定 GUID 后做 SHA-1，再 base64 编码，放进 `Sec-WebSocket-Accept`
- **独立协议**：它和 HTTP 唯一的关系是握手被 HTTP 服务器当作 Upgrade 请求处理；`ws://` 默认端口 80，`wss://`（TLS）默认 443
- **帧规则**：客户端发往服务器的帧必须掩码，无论是否使用 TLS；服务器帧不能掩码。支持分片和 Close / Ping / Pong 控制帧
- **浏览器 API**：`readyState` 有 CONNECTING / OPEN / CLOSING / CLOSED 四个状态；`send()` 接受字符串、Blob 或 BufferSource，是异步的，只写入缓冲；`binaryType` 取 `"blob"` 或 `"arraybuffer"`
- **典型场景**：游戏、股票行情、多人协同编辑、实时服务端界面、即时通讯

## 容易混淆

- **方向**：WebSocket 双向全双工；[[SSE]] 只能服务器推给客户端
- **底层**：WebSocket 是独立的 TCP 协议，只借 HTTP 握手；SSE 就是普通 HTTP 响应，类型为 `text/event-stream`
- **重连**：WebSocket 规范没有定义任何自动重连，要自己实现；SSE 规范强制自动重连
- **断点续传**：WebSocket 没有；SSE 用 `id:` 字段配合 `Last-Event-ID` 请求头
- **二进制**：WebSocket 支持；SSE 只传文本

## 关联

- [[SSE]]：单向推送的替代方案，面试最常见的对比对象

## 扩展思考

- **SSE 和 WebSocket 怎么选？** 只需要服务器推送文本（如流式输出）用 SSE，简单且自带重连；需要客户端频繁上行或传二进制时用 WebSocket，重连逻辑自己写。

## 参考

- [RFC 6455](https://www.rfc-editor.org/rfc/rfc6455.txt)
- [MDN · WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WHATWG · Web sockets](https://html.spec.whatwg.org/multipage/web-sockets.html)
- 核验日期：2026-09-25
