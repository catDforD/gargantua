---
id: "node:Tool Calling"
type: concept
domain: agent
aliases: []
tags:
  - topic/agent/tool-calling
sources:
  - "[[30-Resources/Tech/PTC#两种模式的根本区别]]"
  - "[[30-Resources/Tech/PTC#PTC 最重要的优势]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related: []
attributes: {}
confidence: 中
status: active
---

# Tool Calling

> 模型选择并调用外部工具，再根据工具结果决定后续步骤的交互机制。

## 为什么需要

模型本身只能生成文本。要查数据、执行操作，就得让模型提出「调用哪个工具、传什么参数」，由外部执行后把结果交回模型，模型据此决定下一步。

## 核心要点

- **模型全程参与**：每一次工具调用和对应的结果之间，模型都在循环里做判断
- **结果直接进上下文**：工具返回的内容通常原样进入模型上下文，由模型自己读取和取舍
- **多步靠多轮**：需要多次调用时，循环、分支和中间结果处理都靠模型一轮轮推进

## 容易混淆

- **Tool Calling vs PTC**：Tool Calling 每一步都由模型决定；[[PTC]] 让模型先写出程序，把多次调用、循环、分支和中间结果处理交给程序执行
- **Tool Calling vs MCP**：[[MCP]] 规定工具如何被标准化暴露和接入，模型选择并请求调用哪个工具仍属于 Tool Calling

## 关联

- [[PTC]]：建立在 Tool Calling 之上的编排方法
- [[Harness]]：负责把模型提出的调用路由到实际执行体并处理结果
- [[ReAct]]、[[Plan-and-Execute]]：两种 Agent 编排模式，都以 Tool Calling 为前提
