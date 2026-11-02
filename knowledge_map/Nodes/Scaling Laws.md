---
id: "node:Scaling Laws"
type: concept
domain: llm
aliases:
  - Scaling Law
  - 缩放定律
  - 扩展定律
tags:
  - topic/llm
  - topic/llm/scaling-laws
sources:
  - "https://lilianweng.github.io/posts/2026-06-24-scaling-laws/"
  - "https://arxiv.org/abs/2001.08361"
  - "https://arxiv.org/abs/2203.15556"
  - "https://arxiv.org/abs/2401.00448"
relations:
  broader_than: []
  instantiates: []
  prerequisites:
    - "[[神经网络]]"
    - "[[交叉熵]]"
  related: []
attributes: {}
confidence: 高
status: active
---

# Scaling Laws

> 在一定条件和范围内，模型损失随参数量、训练数据量或计算量增加而有规律地下降。

## 为什么需要

训练大模型成本很高，直接尝试所有参数量和数据量组合并不现实。Scaling Laws 从不同规模的实验中拟合损失与资源的关系，帮助研究者用小规模实验估计大规模训练的结果，并规划训练预算。

## 核心要点

- **资源**：常用模型参数量 `N`、训练 token 数 `D` 和训练计算量 `C` 衡量；计算量同时受模型大小和训练数据量影响
- **规律**：在实验覆盖的范围内，增加资源通常能降低损失，改善逐渐变慢，损失与资源之间常可用近似幂律描述
- **衡量指标**：语言模型研究常用验证集上的预测损失，例如逐 token 的 [[交叉熵]]；损失下降不等于每个具体任务的表现都会按同一曲线改善
- **预算分配**：固定训练计算量时，要权衡参数量和训练 token 数；只增大模型而训练数据不足，可能使模型没有得到充分训练
- **Chinchilla 结果**：在该研究的实验设定下，计算最优训练要求模型参数量与训练 token 数大致同比增长；这是一项实验结论，不是适用于所有模型和数据的固定比例

## 实践注意

- **外推有边界**：拟合规律依赖模型架构、数据、训练方法和实验范围；改变条件或远距离外推时，需要重新验证
- **训练最优 vs 总成本最优**：训练计算量最优只考虑训练预算；如果模型要处理大量请求，还要考虑推理成本，较小模型训练更久可能更合算
- **损失 vs 能力**：平均损失是整体预测质量指标，不能直接保证特定任务、推理能力或安全性达到要求，仍需要针对目标任务评测

## 关联

- [[神经网络]]：模型参数量描述神经网络的规模，是 Scaling Laws 的关键变量之一
- [[交叉熵]]：语言模型的验证损失常用交叉熵衡量，可用于观察随规模变化的趋势

## 扩展思考

- **算力固定时，为什么不能只增加参数量？** 更大的模型每处理一个 token 需要更多计算，预算固定时可训练的 token 数可能减少；应结合实验寻找模型规模与数据量的合适配比。

## 参考

- [Kaplan et al. · Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)
- [Hoffmann et al. · Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)
- [Sardana et al. · Beyond Chinchilla-Optimal](https://arxiv.org/abs/2401.00448)
- [Lilian Weng · Scaling Laws, Carefully](https://lilianweng.github.io/posts/2026-06-24-scaling-laws/)
- 核验日期：2026-11-02
