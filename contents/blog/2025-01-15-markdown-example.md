# Markdown 语法示例

这是一篇展示 Markdown 各种语法用法的示例文章。

## 标题

Markdown 支持六级标题：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

## 文本样式

- **粗体文本**
- *斜体文本*
- ***粗体加斜体***
- ~~删除线~~
- `行内代码`

## 列表

### 无序列表

- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

### 有序列表

1. 第一步
2. 第二步
3. 第三步

### 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 待办事项

## 链接和图片

[链接文本](https://github.com/catDforD)

![图片描述](static/assets/img/photo.png)

## 引用

> 这是一段引用文本。
>
> 可以跨越多行。

## 代码块

### 行内代码

使用 `console.log()` 输出信息。

### 代码块

```python
def hello_world():
    print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

## 表格

| 功能 | 状态 | 优先级 |
|------|------|--------|
| Markdown | ✅ 完成 | 高 |
| 数学公式 | ✅ 完成 | 高 |
| 分类筛选 | ✅ 完成 | 中 |
| 标签搜索 | ✅ 完成 | 中 |

## 分割线

---

## 结语

这就是 Markdown 的基本语法，更多用法请参考 [Markdown 官方文档](https://www.markdownguide.org/)。
