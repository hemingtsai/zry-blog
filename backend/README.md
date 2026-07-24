# zry-blog backend

FastAPI + SQLAlchemy 2.0 + PostgreSQL 的博客后端，实现 [`../API.md`](../API.md) 中的全部端点。

## 技术栈

- **FastAPI** — Web 框架
- **SQLAlchemy 2.0**（同步）+ **psycopg3** — ORM / 数据库驱动
- **Pydantic v2** — 请求/响应 schema
- **python-jose** + **bcrypt** — JWT 认证与密码哈希
- **uv** — Python 环境与依赖管理

## 前置条件

- [`uv`](https://docs.astral.sh/uv/) 已安装
- PostgreSQL 已运行（本仓库根目录的 `docker-compose.yml` 会提供），默认连接：

  ```
  postgresql+psycopg://zryblog:zryblog@localhost:5432/zryblog
  ```

## 配置

复制示例环境变量文件并按需修改：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://zryblog:zryblog@localhost:5432/zryblog` | 数据库连接串 |
| `JWT_SECRET` | `change-me-in-production` | JWT 签名密钥（生产必须修改） |
| `JWT_ALGORITHM` | `HS256` | JWT 算法 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token 有效期（分钟） |
| `ADMIN_USERNAME` | `admin` | 管理员用户名（不入库，登录时校验） |
| `ADMIN_PASSWORD` | `admin123` | 管理员密码 |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | 允许的前端来源（JSON 数组） |

## 启动

```bash
# 安装依赖（首次）
uv sync

# 启动开发服务器（自动重载）
uv run uvicorn app.main:app --reload --port 8000
```

启动时会自动：

1. `create_all` 建表（无需 alembic）；
2. 若库中没有文章，插入 3 篇示例 Markdown 文章（含 `$E=mc^2$` LaTeX 公式、mermaid 代码块、带语言的代码块），用于前端渲染测试；
3. 管理员账号来自环境变量，不入库。

- 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

## 已实现端点

### 认证
- `POST /api/auth/login` → `{access_token, token_type}`
- `GET /api/auth/me`（需 JWT）→ `{username}`

### 文章（公开）
- `GET /api/posts?page=&size=&tag=` → `{items(不含 content), total, page, size}`
- `GET /api/posts/{slug}` → Post（含 content，仅已发布）
- `GET /api/tags` → `[{name, count}]`

### 文章（后台，需 JWT）
- `GET /api/admin/posts?page=&size=` → 全部文章（含草稿）
- `POST /api/admin/posts` → 创建（未提供 slug 时按 title 自动生成，保证唯一）
- `PUT /api/admin/posts/{id}` → 更新
- `DELETE /api/admin/posts/{id}` → 204

### 评论（公开）
- `GET /api/posts/{slug}/comments` → 仅 approved 的评论
- `POST /api/posts/{slug}/comments` → 创建（`approved=false`，待审核）

### 评论（后台，需 JWT）
- `GET /api/admin/comments?approved=` → 评论列表（可按审核状态过滤）
- `PUT /api/admin/comments/{id}` → 审核（`{approved}`）
- `DELETE /api/admin/comments/{id}` → 204

## 认证方式

```bash
# 获取 token
curl -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

# 携带 token 访问后台
curl http://localhost:8000/api/auth/me -H 'Authorization: Bearer <token>'
```

## 冒烟测试

仓库内提供了两个脚本，会自动启动服务、逐一调用关键端点、最后关闭服务：

```bash
sh smoke_test.sh    # 健康检查 / 列表 / 登录 / 建文章 / 评论 等
sh smoke_test2.sh   # 标签过滤 / 分页 / 审核评论 / 下架文章 / 删除
```
