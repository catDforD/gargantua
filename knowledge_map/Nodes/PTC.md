---
id: "node:PTC"
type: method
domain: agent
aliases:
  - Programmatic Tool Calling
tags:
  - topic/agent/tool-calling
sources:
  - "[[30-Resources/Tech/PTC#两种模式的根本区别]]"
  - "[[30-Resources/Tech/PTC#PTC 最重要的优势]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites:
    - "[[Tool Calling]]"
  related: []
attributes: {}
confidence: 中
status: active
---

# PTC

> 让模型生成程序，由程序组织多次工具调用和控制流的方法。

## 要解决的问题

普通 [[Tool Calling]] 里，每次调用和每份结果都要经过模型。多步编排中的循环、分支、重试这些确定性逻辑，也只能靠模型一轮轮推进。

## 怎么做

- **一次生成程序**：模型把多步工具编排写成一段程序
- **程序负责控制流**：循环、分支、并发调用、重试、聚合和中间结果过滤都交给程序运行时
- **模型按需介入**：只在需要理解意图或做语义判断时才回到模型

## 优势与代价

- **优势**：多步编排从连续的模型对话变成一次生成后的确定性执行，模型介入次数更少，中间结果不必全部进入模型上下文

## 关联

- [[Tool Calling]]：PTC 的前提，PTC 把多次 Tool Calling 交给程序编排
