from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Post

POST_1 = """\
# 相对论与质能方程

爱因斯坦的质能方程是物理学中最著名的公式之一：

$$
E = mc^2
$$

它也可以行内书写，例如 $E=mc^2$，表示质量与能量的等价关系。

对于低速情形，动能可近似为 $E_k \\approx \\frac{1}{2}mv^2$。

## 一段 Python 代码

```python
def energy(mass: float, c: float = 299_792_458) -> float:
    \"\"\"根据质能方程计算能量（单位：焦耳）。\"\"\"
    return mass * c ** 2


print(energy(1.0))
```

希望这篇文章能帮助你复习基础物理。
"""

POST_2 = """\
# 用 Mermaid 画流程图

Markdown 中可以嵌入 Mermaid 代码块来渲染图表。下面是一个简单的用户登录流程：

```mermaid
graph TD
    A[开始] --> B{已登录?}
    B -- 是 --> C[进入首页]
    B -- 否 --> D[跳转登录页]
    D --> E[输入账号密码]
    E --> F{验证通过?}
    F -- 是 --> C
    F -- 否 --> D
```

## 时序图示例

```mermaid
sequenceDiagram
    participant U as 用户
    participant S as 服务器
    U->>S: POST /api/auth/login
    S-->>U: { access_token }
```

Mermaid 让文档中的流程一目了然。
"""

POST_3 = """\
# FastAPI 快速上手

`FastAPI` 是一个现代、高性能的 Python Web 框架。下面演示一个最小示例。

## 安装

```bash
uv add fastapi "uvicorn[standard]"
```

## 一个最小应用

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"hello": "world"}
```

## 一点数学

请求吞吐量的一个粗略估计：$\\text{RPS} = \\frac{N}{T}$，其中 $N$ 为并发数，$T$ 为平均响应时间。

祝你玩得开心 🎉
"""

SAMPLE_POSTS = [
    {
        "slug": "relativity-mass-energy",
        "title": "相对论与质能方程",
        "summary": "介绍 E=mc^2 与质能等价，含 LaTeX 公式和 Python 代码块。",
        "content": POST_1,
        "tags": ["物理", "LaTeX", "科普"],
        "published": True,
    },
    {
        "slug": "mermaid-diagrams",
        "title": "用 Mermaid 画流程图",
        "summary": "在 Markdown 中嵌入 Mermaid 流程图与时序图。",
        "content": POST_2,
        "tags": ["Markdown", "Mermaid", "工具"],
        "published": True,
    },
    {
        "slug": "fastapi-quickstart",
        "title": "FastAPI 快速上手",
        "summary": "从零开始的 FastAPI 最小示例，含 bash / python 代码块与行内公式。",
        "content": POST_3,
        "tags": ["Python", "FastAPI", "后端"],
        "published": True,
    },
]


def seed_posts(db: Session) -> None:
    existing = db.scalar(select(func.count()).select_from(Post)) or 0
    if existing > 0:
        return
    for data in SAMPLE_POSTS:
        db.add(Post(**data))
    db.commit()
