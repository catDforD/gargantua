# 数学公式支持示例

本博客使用 MathJax 3 支持 LaTeX 数学公式渲染。

## 行内公式

行内公式使用 `$...$` 或 `\(...\)`：

- 二次方程：$ax^2 + bx + c = 0$
- 圆的面积：$A = \pi r^2$
- 欧拉恒等式：$e^{i\pi} + 1 = 0$
- 正弦函数：$\sin(x) = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{(2n+1)!}$

## 块级公式

块级公式使用 `$$...$$` 或 `\[...\]`：

### 麦克斯韦方程组

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

### 傅里叶变换

$$
\mathcal{F}[f(t)] = F(\omega) = \int_{-\infty}^{\infty} f(t) e^{-i\omega t} dt
$$

### 矩阵表示

$$
\begin{bmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{bmatrix}
\begin{bmatrix}
x_1 \\
x_2 \\
x_3
\end{bmatrix}
=
\begin{bmatrix}
b_1 \\
b_2 \\
b_3
\end{bmatrix}
$$

### 极限与积分

$$
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e
$$

$$
\int_0^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

### 分式与根号

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

$$
\sqrt[3]{\frac{a^3 + b^3}{c}} = \sqrt[3]{\frac{a^3}{c} + \frac{b^3}{c}}
$$

## 常用数学符号

| 类型 | 符号 | 代码 |
|------|------|------|
| 希腊字母 | $\alpha, \beta, \gamma, \pi$ | `\alpha`, `\beta`, `\gamma`, `\pi` |
| 运算符 | $\sum, \prod, \int, \partial$ | `\sum`, `\prod`, `\int`, `\partial` |
| 关系符 | $\leq, \geq, \neq, \approx$ | `\leq`, `\geq`, `\neq`, `\approx` |
| 箭头 | $\to, \Rightarrow, \iff$ | `\to`, `\Rightarrow`, `\iff` |

## 复杂公式示例

### 薛定谔方程

$$
i\hbar \frac{\partial}{\partial t} \Psi(\mathbf{r},t) = \hat{H} \Psi(\mathbf{r},t)
$$

### 信息熵

$$
H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)
$$

## 结语

MathJax 支持丰富的数学符号和公式，更多用法请参考 [MathJax 文档](https://docs.mathjax.org/)。
