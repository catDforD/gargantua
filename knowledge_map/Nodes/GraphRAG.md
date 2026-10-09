---
id: "node:GraphRAG"
type: method
domain: rag
aliases:
  - Graph RAG
  - Microsoft GraphRAG
  - 图检索增强生成
  - 图 RAG
tags:
  - topic/rag
sources:
  - "https://arxiv.org/abs/2404.16130"
  - "https://arxiv.org/html/2404.16130v2"
  - "https://microsoft.github.io/graphrag/index/default_dataflow/"
  - "https://microsoft.github.io/graphrag/index/methods/"
  - "https://microsoft.github.io/graphrag/query/global_search/"
  - "https://microsoft.github.io/graphrag/query/local_search/"
  - "https://microsoft.github.io/graphrag/cli/"
  - "https://github.com/microsoft/graphrag/releases"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent与大模型岗位面经汇总-01至05-07-08#RAG 与编码模型]]"
relations:
  broader_than:
    - "[[RAG]]"
  instantiates: []
  prerequisites: []
  related: []
attributes: {}
confidence: 高
status: active
---

# GraphRAG

> 微软提出的图式 RAG：先用 LLM 抽取实体—关系图并做社区摘要，查询时据此组装上下文。

## 要解决的问题

它要解决的不是「找得更准」，而是「全局问题答不了」。基线 [[RAG]] 靠向量相似度检索，遇到「这个数据集的主要主题是什么」这类指向整个语料的问题，问题里没有能引向正确信息的线索。这类问题本质上是 query-focused summarization，而不是检索。

## 怎么做

- **建索引**：切块成 TextUnits → 文档处理 → 用 LLM 抽取实体和关系并生成摘要（可选抽取 claim）→ 用 Louvain / Leiden 做层级社区发现 → 为每个社区生成摘要 → 文本向量化
- **全局搜索**：map-reduce。社区摘要分批，各自生成带评分的中间回答，排序过滤后聚合成最终答案。论文实验中，用根层社区摘要只花一小部分 token 就能达到其他全局方法的效果
- **局部搜索**：先用实体描述的向量召回实体，再沿实体展开到相关的文本块、社区报告、关系和协变量，各自排序过滤后拼成上下文
- **DRIFT Search**：介于两者之间。Primer 阶段把查询和 top-K 相关社区报告比对，给出初步答案和追问；Follow-Up 阶段用局部搜索细化

## 优势与代价

- **优势**：能回答面向整个语料的全局问题；局部搜索同时利用结构化和非结构化上下文
- **代价**：建索引很贵，官方估计图抽取约占索引成本的 75%。FastGraphRAG 用 NLTK / spaCy 的名词短语加共现关系替代 LLM 抽取，更便宜，但图更噪

## 增量更新

- **早于 1.0 就支持**：v0.3.3（2024-09-10）加入 incremental indexing 的 API 入口，v0.4.0（2024-11-06）加入增量索引和社区、关系合并，v0.4.1（2024-11-09）加入 update CLI；1.0 发布于 2024-12-16。「增量更新随 1.0 而来」的说法不对
- **用法**：`graphrag update` 更新已有索引，新索引写到 `update_output` 目录；也可以用 `graphrag index --method standard-update` 或 `fast-update`。核验时最新版为 v3.2.0
- **限制**：只按文档 `title` 判断新增和删除，已入库文档的内容修改不会被重新抽取；实体按 `title` 合并，图的 degree 不重算
- **注意**：上面的限制来自 main 分支源码（2026-09-25），不是官方文档承诺，版本升级后可能变化；官方文档也没有增量专页

## 容易混淆

- **FastGraphRAG**：它既指微软的 `--method fast`，也是一个独立的第三方开源项目，所以不作为本节点的别名

## 关联

- [[RAG]]：上位概念，GraphRAG 针对的正是基线 RAG 答不了的全局问题

## 扩展思考

- **GraphRAG 的难点在哪？** 索引成本高，图抽取约占 75%；增量更新只认标题、不认内容修改，degree 也不重算。
- **GraphRAG 和普通 RAG 的区别？** 普通 RAG 找相似片段；GraphRAG 预先构建实体图和社区摘要，能回答需要概括整个语料的问题。

## 参考

- [arXiv 2404.16130 · From Local to Global](https://arxiv.org/abs/2404.16130)
- [GraphRAG · Dataflow](https://microsoft.github.io/graphrag/index/default_dataflow/)
- [GraphRAG · Methods](https://microsoft.github.io/graphrag/index/methods/)
- [GraphRAG · Releases](https://github.com/microsoft/graphrag/releases)
- 核验日期：2026-09-25
