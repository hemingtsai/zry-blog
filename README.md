# zry-blog

Hemingtsai（Hmtsai）的个人主页 + 博客系统。

个人主页 + 文章、标签、评论，配套后台管理。设计语言参考 `ideaboard-mobile`：
极简黑白、直角无阴影、1px 边框、CSS 变量主题、思源宋体人文气质、`vh`/`dvh`
移动端优先单位、`material-symbols-light` 线性图标。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3（`<script setup>`）+ TypeScript（严格模式）+ Vite 6 + vue-router |
| Markdown | markdown-it + KaTeX（LaTeX）+ Mermaid + highlight.js + DOMPurify |
| 后端 | Python FastAPI + SQLAlchemy 2.0 + psycopg3 + Pydantic v2 |
| 认证 | JWT（python-jose）+ bcrypt |
| 数据库 | PostgreSQL 16（Docker / OrbStack） |

## 架构

```
┌────────────┐      /api 代理      ┌──────────────┐        ┌──────────────┐
│  前端 :5173 │ ─────────────────▶ │  后端 :8000   │ ─────▶ │ PostgreSQL   │
│  Vue + Vite │                    │  FastAPI      │        │  :5432 (Docker)│
└────────────┘                    └──────────────┘        └──────────────┘
```

- 公开侧：首页、`/blog` 文章列表（分页 + 标签筛选）、`/blog/:slug` 详情 + 评论。
- 后台侧：`/admin/login` 登录、`/admin` 文章管理、文章编辑器（Markdown 实时预览）、
  `/admin/comments` 评论审核。评论公开提交后默认待审核，管理员通过后展示。

## 快速开始

### 1. 启动数据库

```bash
docker compose up -d          # 启动 PostgreSQL（zry-blog-db）
```

连接串：`postgresql+psycopg://zryblog:zryblog@localhost:5432/zryblog`

### 2. 启动后端

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

首次启动会自动建表、seed 示例文章并创建默认管理员。
默认账号 `admin` / `admin123`（可用环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 覆盖）。

### 3. 启动前端

```bash
cd frontend
pnpm install
pnpm dev                      # http://localhost:5173
```

前端 `/api` 请求经 Vite 代理转发到后端 `:8000`。

> 若 `pnpm build` / `dev` 因依赖校验报错，加上 `--config.verify-deps-before-run=false`。

## 目录结构

```
zry-blog/
├── docker-compose.yml        # PostgreSQL
├── API.md                    # 前后端 API 契约
├── backend/                  # FastAPI 后端
│   └── app/                  # main / models / schemas / auth / routers
└── frontend/                 # Vue 前端
    └── src/
        ├── components/       # UI 组件 + MarkdownRender + AdminShell
        ├── composables/      # useTheme / useAuth / useGithubRepos …
        ├── views/            # HomeView / BlogView / PostView + admin/
        ├── data/profile.ts   # 个人信息集中管理
        ├── styles/theme.css  # CSS 变量主题
        ├── api.ts            # API 客户端
        └── router.ts         # 路由 + 鉴权守卫
```

个人信息更新只需改 `frontend/src/data/profile.ts`。API 契约见 `API.md`。
