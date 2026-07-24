# zry-blog API 契约

前后端共同遵守。所有响应为 JSON。基址 `/api`。

## 认证
单管理员，登录返回 JWT，之后 `Authorization: Bearer <token>`。

- `POST /api/auth/login` body `{username, password}` → `{access_token, token_type}`
- `GET /api/auth/me` (需鉴权) → `{username}`

## 文章 Posts

Post 对象:
```
{
  "id": int,
  "slug": str,
  "title": str,
  "summary": str,
  "content": str,        // markdown 原文
  "tags": [str],
  "published": bool,
  "created_at": iso8601,
  "updated_at": iso8601
}
```

- `GET /api/posts?page=1&size=10&tag=xxx` → `{items: [Post(不含content)], total, page, size}`
- `GET /api/posts/{slug}` → Post(含 content)
- `GET /api/tags` → `[{name, count}]`

后台（需鉴权）:
- `GET /api/admin/posts?page=&size=` → 所有文章(含草稿) `{items, total, page, size}`
- `GET /api/admin/posts/{id}` → 单篇(含 content，含草稿)
- `POST /api/admin/posts` body `{title, slug?, summary, content, tags, published}` → Post
- `PUT /api/admin/posts/{id}` → Post
- `DELETE /api/admin/posts/{id}` → 204

## 评论 Comments

Comment 对象:
```
{
  "id": int,
  "post_id": int,
  "author": str,
  "content": str,        // 纯文本（渲染时转义）
  "approved": bool,
  "created_at": iso8601
}
```

- `GET /api/posts/{slug}/comments` → 仅 approved 的 `[Comment]`
- `POST /api/posts/{slug}/comments` body `{author, content}` → Comment(approved=false，待审核)

后台（需鉴权）:
- `GET /api/admin/comments?approved=` → `[Comment]`
- `PUT /api/admin/comments/{id}` body `{approved}` → Comment
- `DELETE /api/admin/comments/{id}` → 204

## 错误
非 2xx 返回 `{detail: str}`。

## CORS
开发允许 `http://localhost:5173`。

## 默认管理员
环境变量 `ADMIN_USERNAME`(默认 admin)/`ADMIN_PASSWORD`(默认 admin123)。
