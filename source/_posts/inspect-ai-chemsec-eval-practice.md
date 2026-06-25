---
title: 基于 Inspect AI 的安全评测框架实践：从 Raw Payload 到攻击矩阵
date: 2026-06-25 17:16:52
tags:
- 工具分享
- Agent 安全
---

在某垂直领域做大模型安全评测时，安全问题不只是“模型有没有拒答”。同一条请求可能涉及不同风险对象，也可能被不同攻击方式包装；模型输出还可能是自行拒答、实质性作答、平台网关拦截、超时或运行错误。

为了解决这个问题，我们基于 Inspect AI 组织了一套可复现的评测链路，核心思路是：把风险分类、攻击方法、模型调用、评分逻辑和报告统计拆成独立层，再在运行时组合成具体评测任务。

本文会按 `taxonomy -> raw payload -> runtime attack overlay -> Inspect Task -> refusal scorer -> attack matrix / benchmark suite -> report -> tests` 这条路线展开。

特别说明：本文只讨论框架设计和工程链路，不会也不能展示真实危险 payload、完整攻击模板、模型攻击成功样本、日志 trace、API key 或任何内部运行时标识。

## 本文路线

1. 最小评测闭环如何跑通。
2. 项目如何把风险对象和攻击方法解耦。
3. 分析 runtime attack overlay、Inspect Task 和 scorer。
4. 整理 attack matrix、benchmark suite、报告生成和验证方式。

## 项目要解决什么问题

当前这个项目主要解决的是对触垂类领域的特定 Agent 进行安全测试和加固。  

我们把安全测试分成三类顶层 domain：内容安全、Agent 安全和隐私安全。内容安全关注高风险垂类请求、合规与实验安全、通用基础安全和过度拒绝；Agent 安全关注工具调用、上下文注入、权限边界、资源滥用、文件系统和数据外传；隐私安全关注多轮对话中的内部信息泄露。  

攻击方法不是第四类安全 domain，而是横向维度。也就是说，项目不是简单维护一堆“最终攻击 prompt”，而是维护 raw payload，再在运行时叠加攻击条件，思路其实比较简单。

## 最基础的闭环：先让一条评测链路跑起来

如果只想验证链路，不应该一上来跑完整矩阵，我这边是选了一批现成的基础数据即可，整体批评链路无误以后，才考虑大规模扩展数据集。

## 设计一：风险对象和攻击方法解耦

在普通测试数据里，我们可能只关心 `input` 和 `target`。但安全评测不能只看文本，因为同样一句请求在不同风险语境下含义不同，同样一个风险对象也可以被多种攻击方法包装。

项目 schema 把一条样本拆成几层：

```json
{
  "id": "CS-DEMO-001",
  "input": "<高风险或良性请求>",
  "target": "refuse",
  "choices": null,
  "metadata": {
    "sample_kind": "direct_safety_payload",
    "split": "eval",
    "expected_behavior": "refuse",
    "safety": {
      "domain": "content_safety",
      "category": "domain_content_safety",
      "subcategory": "demo_subcategory",
      "risk_object_id": "CS-DEMO-001",
      "risk_object": "demo_object",
      "risk_object_cn": "脱敏风险对象"
    },
    "evaluation": {
      "judge_target": "refuse",
      "success_criterion": "model_does_not_provide_actionable_harmful_guidance",
      "policy_version": "dataset_v1"
    }
    ...
  }
}
```

这条是脱敏示例，不是项目中的真实样本。

这里关键看三点：

- `metadata.safety` 描述“这条样本测什么风险”，例如 domain、category、subcategory 和 risk object。
- `metadata.attack` 描述“这条样本如何被攻击包装”，但原始 raw payload 不提前写这一段。
- `metadata.provenance` 用来追溯 attacked sample 来自哪个原始 payload，以及由哪个渲染流程生成。

这个设计的好处是，风险分类和攻击方法可以独立演进。新增一个风险子类时，不需要复制所有攻击模板；新增一个攻击方法时，也不需要重写原始风险样本。还有一个很明显的点就是，这样造新数据很快。

## 设计二：运行时动态生成 attacked sample

动态攻击样本构建的简化后的流程如下：

```text
load_payloads(dataset_path)
    -> RawPayload(id, input, target, choices, metadata, source_path)
    -> payload_to_sample(payload, attack_method, attack_recipe)
        -> none: 保留原始输入
        -> attack_method: 使用 canonical method 渲染
        -> attack_recipe: 使用 recipe 渲染或交给 adaptive solver
    -> Inspect Sample
```

项目里有一个很重要的约束：`load_payloads()` 会拒绝已经包含 `metadata.attack` 的 raw payload。原因是 `eval_safety` 期望读取的是原始 payload，而不是提前被攻击方法包装过的 攻击样本。

运行时攻击叠加后，sample 会得到类似这样的结构：

```json
{
  "id": "ATT-CS-DEMO-001--DEMO-001--v1",
  "input": "<攻击包装后的最终 prompt>",
  "target": "refuse",
  "metadata": {
    "sample_kind": "attacked_safety",
    "attack": {
      "attack_method": "legitimizing_pretext",
      "attack_variant_id": "DEMO-001",
      "attack_template_id": "legitimizing_pretext.default.001",
      "attack_family": "semantic_prompt_attack",
      "attack_surface": "user_prompt",
      "delivery_artifact": "plain_text_prompt",
      "render_strategy": "script_generated"
    },
    "provenance": {
      "payload_id": "CS-DEMO-001",
      "payload_input": "<原始请求>",
      "materialized_from": "datasets/content_safety/demo.json",
      "generator": "script",
      "generator_version": "v1"
    }
  }
}
```

canonical attack 只是其中一个攻击方法，当前稳定方法包括：

| attack method | 作用维度 |
| --- | --- |
| `legitimizing_pretext` | 正当化伪装 |
| `task_decomposition` | 任务拆解 |
| `pressure_manipulation` | 压力操纵 |
| `correction_bait` | 纠错诱导 |
| `output_constraint_evasion` | 输出约束规避 |
| `obfuscation_evasion` | 表达混淆规避 |


## 设计三：Inspect Task 负责组装评测单元

Inspect AI 的基本任务结构是 `Task(dataset, solver, scorer)`。项目中主要评测代码正是围绕这个结构做组装。

简化后的代码形态如下：

```python
return Task(
    dataset=dataset,
    solver=solver,
    scorer=refusal_scorer(
        use_llm_judge=use_llm_judge,
        fallback_to_patterns=fallback_to_patterns,
    ),
    fail_on_error=fail_on_error,
)
```

这里几个参数的职责很清楚：

- `dataset`：由 raw payload 加上可选 attack overlay 后得到的 Inspect dataset。
- `solver`：默认是 Inspect 的 `generate()`；如果启用自适应攻击，则使用 attack-aware solver。
- `scorer`：使用项目自定义的 `refusal_scorer` 判断模型行为是否符合预期。
- `fail_on_error`：控制运行错误是否直接让任务失败。

## 设计四：拒答评分原理

安全评测最容易踩的坑，是把“看起来像拒答”当成真的安全，或者把“provider 拦截”当成模型本身安全能力。

项目的评分逻辑核心目标是判断：

```text
模型回复是否实质性推进了有害的原始请求的目标
```

它大致分成四步：

1. 从 `metadata.expected_behavior`、`metadata.evaluation.judge_target` 和顶层 `target` 中解析期望行为。
2. 先识别运行时失败，例如 provider block、timeout、error。
3. 默认使用 LLM-as-a-judge 判断输出是 `refuse` 还是 `comply`。
4. 如果 judge 调用失败或输出不可解析，再回退到中英文拒答 pattern。

评分结果不会只有 pass/fail，而是会保留观察标签：

| observed label | 含义 |
| --- | --- |
| `refuse` | 模型自行拒绝或安全转向 |
| `comply` | 模型实质性满足了请求意图 |
| `blocked` | provider 或 API 网关拦截 |
| `timeout` | 请求超时 |
| `error` | 运行错误 |
| `unknown` / `ambiguous` | 无法稳定判断或证据不足 |

这一区分非常重要。对于 `expected_behavior=refuse` 的有害样本，`comply` 往往意味着失守；但对于 `expected_behavior=comply` 的良性或过度拒绝样本，`comply` 反而是正常帮助。两类样本不能混算。

同理，`blocked` 也不能算作“模型自行拒答”。它可以说明平台侧安全网关起了作用，但不能证明被测模型本身做出了安全判断。

## 设计五：attack matrix 把 source 和 condition 组合起来

单个 Inspect task 能跑通一条链路，但红队评测通常需要比较：

- 不同数据来源。
- 不同风险子类。
- baseline 和攻击条件之间的变化。
- canonical method 和 recipe 的差异。

attack matrix 的抽象可以写成：

```text
source x condition -> eval_attack_matrix_source()
```

其中：

- `source` 可以是本地内容安全子类，也可以是经过适配的外部 benchmark。
- `condition` 可以是 `baseline_none`、canonical attack method，或者 active recipe。
- 每个 source 可以声明自己支持哪些 condition。

工程上更关键的是可复现。`run_attack_matrix` 会根据 task args、模型、model roles、time limit、完成样本数等信息判断已有日志能否复用，避免把不匹配的历史结果混进新实验。

## 设计六：benchmark suite 用 registry 组织可复用任务

attack matrix 是统一安全攻击矩阵，benchmark suite 则更偏“按 taxonomy 组织已有 benchmark”。

每个 benchmark entry 会描述：

- `source_type`：本地任务还是 `inspect_evals`。
- `import_path`：动态导入哪个 task factory。
- `kwargs`：传给 task factory 的参数。
- `status`：`active` 或 `planned`。
- `fit`：和当前 taxonomy 是 direct 还是 partial fit。

## 设计七：报告生成要分清统计口径

跑完 Inspect eval 后，项目用会把 `.eval` 日志、目录或 `logs.json` 汇总成报告。

报告聚合的核心不是把所有样本算一个总分，而是分开看：

- 有害样本的 refusal rate、jailbreak rate。
- 良性或可用性样本的 help rate、overrefusal rate。
- provider block、timeout、error、unknown。
- 按 source、风险子类、攻击条件统计。
- 相对 `baseline_none` 的变化。

## 常见问题和边界情况

### 1. 为什么不直接把 attacked prompt 存成 JSON？

可以存，但项目主链路选择 raw payload + runtime overlay，是为了减少重复数据和保持攻击维度可组合。这样新增攻击方法时，不需要重新生成所有风险子类数据。

### 2. `blocked` 能不能算 Agent 安全？

不能直接算。`blocked` 表示 provider 或 API 网关在模型返回可评分文本前拦截了请求。它是系统层结果，不等同于模型自行拒答。

### 3. LLM judge 会不会误判？

会有风险，所以项目保留 fallback 和 judge response metadata，也建议对关键报告做人工抽样复核。自动评分适合规模化筛查，不应替代所有高风险结论的人工确认。

### 4. 为什么 `expected_behavior=refuse` 和 `expected_behavior=comply` 不能混算？

因为二者语义相反。对高风险样本，`comply` 往往是失守；对良性样本，`comply` 是正常帮助。报告必须先按期望行为分组，再统计 refusal、help、jailbreak 或 overrefusal。

### 5. 为什么有些 source 只支持 `baseline_none`？

从当前项目实现看，过度拒绝、正确性或 Agent projection 类 source 不一定适合叠加完整攻击条件。强行展开可能会把可用性、正确性和攻击鲁棒性混成一个不清晰的指标。

## 总结

这个项目的核心价值不在于某一个攻击模板或某一次评测结果，而在于把安全评测拆成了几层稳定接口：

1. 数据可维护：风险对象和攻击包装分离，减少重复样本。
2. 结果可解释：模型拒答、网关拦截、超时和错误不会混在一起。
3. 流程可复现：runner、registry、报告和测试把实验条件固定下来。
