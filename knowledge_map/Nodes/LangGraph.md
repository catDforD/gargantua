---
id: "node:LangGraph"
type: entity
domain: agent
aliases:
  - LangGraph 框架
  - langgraph
tags:
  - topic/agent/architecture
sources:
  - "https://docs.langchain.com/oss/python/langgraph/overview"
  - "https://docs.langchain.com/oss/python/langgraph/graph-api"
  - "https://docs.langchain.com/oss/python/langgraph/persistence"
  - "https://docs.langchain.com/oss/python/langgraph/memory"
  - "https://docs.langchain.com/oss/python/langgraph/use-subgraphs"
  - "https://docs.langchain.com/oss/python/langgraph/fault-tolerance"
  - "https://github.com/langchain-ai/langgraph"
  - "[[20-Areas/实习与求职/面试题与经验/小红书-Agent开发实习生-一面面经-AIGC小白入门记#3. LangGraph 中三个子图如何传递数据]]"
  - "[[20-Areas/实习与求职/面试题与经验/小红书Agent开发实习生一面-百度Agent面经-杰尼龟#Agent 工作流与 LangGraph]]"
  - "[[20-Areas/实习与求职/面试题与经验/AI-Agent开发岗位面经汇总-2026年4月-01至07#Agent 状态与工具工程]]"
relations:
  broader_than: []
  instantiates: []
  prerequisites: []
  related:
    - "[[Tool Calling]]"
    - "[[Harness]]"
attributes: {}
confidence: 高
status: active
---

# LangGraph

> LangChain 团队开源的低层级 Agent 编排框架与运行时，用 State / Nodes / Edges 组成的图显式建模流程。

## 定位

官方定位是构建、管理和部署长时运行、有状态 Agent 的低层级编排框架与运行时，只专注编排，可以脱离 LangChain 单独使用。LangChain 把产品栈分为 framework / runtime / harness 三层，LangGraph 属于 runtime 层：预置的 Agent 架构在 LangChain 的 `create_agent`，规划、子代理、文件系统这类「电池全含」的能力在更上层的 harness（如 Deep Agents）。它本身不是模型，也不是 Prompt 库。

## 核心组成

- **State**：由 schema（TypedDict / dataclass / Pydantic）加每个 key 的 reducer 组成
- **Nodes**：接收当前 state，返回部分更新，由 reducer 合并。默认覆盖，`add_messages` 则是追加
- **Edges**：决定节点之间的流转。执行基于 message passing，灵感来自 Google Pregel，按离散的 super-step 推进
- **Checkpointer**：保存线程内（thread-scoped）的图状态快照
- **Store**：保存图状态之外、按自定义 namespace 组织的跨线程数据

## 关键机制

### Checkpoint 与 Memory

- **两者不对立**：checkpoint 是持久化快照，memory 是能力概念
- **短期记忆**：线程作用域，由 checkpointer 实现，文档明确说 memory 需要 checkpointer
- **长期记忆**：跨线程、跨会话，由 Store 实现

### 子图

- **定义**：被当作另一个图中节点使用的图
- **接入方式**：与父图共享 state key 时直接 `add_node(compiled_subgraph)`；schema 不同时在节点函数里调用子图并做转换
- **`checkpointer=None`（默认）**：继承父图的 checkpointer，每次调用从头开始
- **`checkpointer=True`**：按线程跨调用累积状态，但不支持并行工具调用，会产生 checkpoint namespace 冲突
- **`checkpointer=False`**：完全无状态，不支持 interrupt
- **前提**：父图必须带 checkpointer 编译，子图的持久化才会生效

### 失败恢复

- **只在 super-step 边界保存**：恢复时受影响的节点从函数开头整体重跑，暂停前已发生的副作用会再执行一次
- **成功的不重跑**：同一 super-step 里已成功的节点通过 pending writes 保留结果
- **Replay**：checkpoint 之前的节点跳过，之后的全部重跑，包括 LLM / API 调用，interrupt 也会重新触发
- **容错配置**：retries、timeouts、error_handler；失败上下文 `NodeError` 本身也会被 checkpoint，所以可以安全 resume
- **durability**：分 `exit`、`async`、`sync` 三档

## 实践注意

- **节点要幂等**：恢复和 replay 都会整体重跑节点，副作用（写库、发请求）要能重复执行
- **文档地址已迁移**：旧域名 `langchain-ai.github.io/langgraph/*` 已 301 到 docs.langchain.com

## 关联

- [[Harness]]：构建在 LangGraph 这一 runtime 层之上
- [[Tool Calling]]：图中节点常见的工作内容

## 扩展思考

- **LangGraph 里几个子图怎么传数据？** 节点读 State、返回部分更新、沿边传给下一节点。子图与父图共享 state key 就直接作为节点加入；schema 不同就在节点函数里调用子图并转换输入输出。
- **checkpoint 和 memory 有什么区别？** checkpoint 是线程内的状态快照，是短期记忆的实现机制；长期记忆靠 Store 跨线程保存。
- **节点执行失败后怎么恢复？** 从最后一个成功的 super-step 重启，失败节点整体重跑，同 step 内已成功的节点靠 pending writes 保留，所以节点逻辑要幂等。

## 参考

- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Use subgraphs](https://docs.langchain.com/oss/python/langgraph/use-subgraphs)
- [Fault tolerance](https://docs.langchain.com/oss/python/langgraph/fault-tolerance)
- 核验日期：2026-09-25
