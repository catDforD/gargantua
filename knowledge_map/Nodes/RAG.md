---
id: "node:RAG"
type: method
domain: rag
aliases:
  - Retrieval-Augmented Generation
  - 检索增强生成
tags:
  - topic/rag
sources:
  - "https://arxiv.org/abs/2312.10997"
  - "https://microsoft.github.io/graphrag/query/global_search/"
  - "https://arxiv.org/abs/2404.16130"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent开发岗位面经汇总-2026年4月-01至07#多阶段 RAG 与文档处理]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related: []
attributes: {}
confidence: 中
status: active
---

# RAG

> 生成前先从外部知识源检索相关内容，再和问题一起交给模型的方法，不改动模型权重。

## 要解决的问题

模型的知识固定在权重里。RAG 在回答前把外部资料检索出来放进上下文，让模型基于这些资料作答，不需要重新训练。

## 怎么做

- **基线形态**：对问题做向量检索，找出语义相似的文本，拼进提示词后生成
- **三类范式**：Gao et al. 的综述把 RAG 分为 Naive、Advanced、Modular 三类

## 优势与代价

- **优势**：不改模型权重就能接入外部知识
- **局限**：基线依赖语义相似度检索。面对指向整个语料的全局问题（如「数据集的主要主题是什么」），问题里没有能把检索引向正确信息的线索

## 改进路线

- **[[混合检索]]**：并行多路互补召回（词法 + 语义）再融合，弥补单一信号的召回盲区
- **[[多阶段检索]]**：先廉价高召回、再昂贵高精度精排，在成本和精度之间取舍
- **[[GraphRAG]]**：先用 LLM 抽取实体—关系图并做社区摘要，用来回答全局问题

前两条是检索侧两条正交的改进方向，可以组合使用。

## 关联

- [[混合检索]]、[[多阶段检索]]、[[GraphRAG]]：都以 RAG 为上位概念
- 待建节点：RAG 评估体系、分块策略、多模态 RAG

## 扩展思考

- **RAG 的流程和分类？** 流程是检索、拼接、生成；分类按综述分为 Naive / Advanced / Modular 三类。
- **朴素 RAG 什么时候不够用？** 召回有盲区时加混合检索；精度不够时加重排做多阶段检索；问题是全局性的时候考虑 GraphRAG。

## 参考

- [arXiv 2312.10997 · RAG for LLMs: A Survey](https://arxiv.org/abs/2312.10997)
- [GraphRAG · Global Search](https://microsoft.github.io/graphrag/query/global_search/)
- 核验日期：2026-09-25
