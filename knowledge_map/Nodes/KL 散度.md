---
id: "node:KL 散度"
type: concept
domain: llm
aliases:
  - KL Divergence
  - Kullback-Leibler Divergence
  - 相对熵
tags:
  - topic/llm
sources:
  - "https://projecteuclid.org/journals/annals-of-mathematical-statistics/volume-22/issue-1/On-Information-and-Sufficiency/10.1214/aoms/1177729694.full"
  - "https://www.deeplearningbook.org/contents/prob.html"
  - "https://arxiv.org/abs/1312.6114"
  - "https://arxiv.org/abs/2203.02155"
relations:
  broader_than: []
  instantiates: []
  prerequisites:
    - "[[信息熵]]"
  related:
    - "[[交叉熵]]"
    - "[[PPO]]"
    - "[[DPO]]"
attributes: {}
confidence: 高
status: active
---

# KL 散度

> 衡量用分布 `q` 近似分布 `p` 要多花多少信息量，非负且不对称，常用来做损失或正则项。

## 为什么需要

很多任务要「让两个分布靠近」，但分布不是向量，不能直接相减，也不能照搬距离的直觉。KL 散度给出一个可优化的量：用 `q` 去编码来自 `p` 的样本，比用最优编码 `p` 多花的平均比特数，它只在两个分布完全相同时取 0，因此既是差距的代理指标，也能直接当训练目标。

## 核心要点

- **定义**：`D_KL(p‖q) = Σ p(x)·log(p(x)/q(x))`，等价写法是 `D_KL(p‖q) = H(p, q) − H(p)`
- **非负性**：由 Jensen 不等式或吉布斯不等式保证 `D_KL ≥ 0`，等号当且仅当 `p = q`；它不满足对称性和三角不等式，所以不是距离
- **不对称的含义**：在 `p(x) = 0` 而 `q(x) > 0` 的位置不产生代价，反过来 `q` 漏掉 `p` 的支撑集时代价趋于无穷，所以 `q` 必须覆盖 `p` 的所有可能取值
- **前向与反向**：前向 `D_KL(p‖q)` 逼着 `q` 覆盖 `p` 的每个模态，倾向于摊开（mode-covering），对应最大似然；反向 `D_KL(q‖p)` 让 `q` 塌缩到 `p` 的单个高概率区（mode-seeking），变分推断和变分自编码器常用
- **RLHF 里的 KL 惩罚**：PPO 类算法在奖励里减去 `β·D_KL(π_new‖π_ref)`，因为奖励模型只是真实偏好的代理，不加约束的策略会去钻奖励模型的空子，`β` 控制偏离参考模型的代价
- **变分推断里的 KL 项**：变分自编码器的证据下界由重建项减去 `D_KL(q(z|x)‖p(z))` 组成，KL 项把近似后验拉向先验，起正则作用

## 容易混淆

- **KL 散度 vs 交叉熵**：`p` 固定时二者只差常数 `H(p)`，优化上完全等价；差别是 KL 在分布相同时为 0，交叉熵的绝对值还包含数据本身的不确定性
- **KL 散度 vs JS 散度**：JS 散度把两个方向对称化并做了平滑，取值总是有限，适合需要对称性的场合；KL 不对称，且可能取到无穷
- **前向 KL vs 反向 KL**：这不是实现细节，优化哪个方向直接决定学出来的分布是盖住全部模态还是收缩到个别模态

## 关联

- [[信息熵]]：`D_KL = H(p, q) − H(p)` 里的基准项，衡量最优编码本身要多少比特
- [[交叉熵]]：减去熵就是 KL，监督训练里两者作为目标函数可以互换
- [[PPO]]：用 KL 惩罚限制策略更新后的偏离幅度，是 RLHF 稳定性的关键机制
- [[DPO]]：从带 KL 约束的奖励最大化目标出发可以推出闭式最优策略，再改写成偏好对上的分类损失

## 扩展思考

- **为什么 RLHF 宁可加 KL 惩罚，也不直接约束参数大小？** 奖励模型只是偏好的代理，过优化必然偏离真实目标；对参考模型的 KL 惩罚把「别把原始语言能力丢掉」写成了可优化的软约束。
- **为什么说 KL 散度不是距离？** 它不满足对称性，也满足不了三角不等式；需要对称时可以改用 JS 散度，需要几何意义时可以改用 Wasserstein 距离。

## 参考

- [Kullback & Leibler · On Information and Sufficiency (1951)](https://projecteuclid.org/journals/annals-of-mathematical-statistics/volume-22/issue-1/On-Information-and-Sufficiency/10.1214/aoms/1177729694.full)
- [Kingma & Welling · Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114)
- [Ouyang et al. · Training language models to follow instructions](https://arxiv.org/abs/2203.02155)
- 核验日期：2026-10-14
