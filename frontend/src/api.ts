// 后端 API 基址，开发环境走 Vite 代理到 :8000
const BASE = "/api";

export interface PostListItem {
    id: number;
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    published: boolean;
    created_at: string;
    updated_at: string;
}

export interface Post extends PostListItem {
    content: string;
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
}

export interface Tag {
    name: string;
    count: number;
}

export interface Comment {
    id: number;
    post_id: number;
    author: string;
    content: string;
    approved: boolean;
    created_at: string;
}

export interface PostInput {
    title: string;
    slug?: string;
    summary: string;
    content: string;
    tags: string[];
    published: boolean;
}

const TOKEN_KEY = "zry_admin_token";

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    if (res.status === 204) return undefined as T;

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const detail = (data && data.detail) || `请求失败 (${res.status})`;
        throw new Error(detail);
    }
    return data as T;
}

export const api = {
    // 认证
    login(username: string, password: string) {
        return request<{ access_token: string; token_type: string }>(
            "/auth/login",
            { method: "POST", body: JSON.stringify({ username, password }) },
        );
    },
    me() {
        return request<{ username: string }>("/auth/me");
    },

    // 公开文章
    posts(params: { page?: number; size?: number; tag?: string } = {}) {
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.size) q.set("size", String(params.size));
        if (params.tag) q.set("tag", params.tag);
        const qs = q.toString();
        return request<Paginated<PostListItem>>(`/posts${qs ? `?${qs}` : ""}`);
    },
    post(slug: string) {
        return request<Post>(`/posts/${slug}`);
    },
    tags() {
        return request<Tag[]>("/tags");
    },

    // 评论
    comments(slug: string) {
        return request<Comment[]>(`/posts/${slug}/comments`);
    },
    addComment(slug: string, author: string, content: string) {
        return request<Comment>(`/posts/${slug}/comments`, {
            method: "POST",
            body: JSON.stringify({ author, content }),
        });
    },

    // 后台文章
    adminPosts(params: { page?: number; size?: number } = {}) {
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.size) q.set("size", String(params.size));
        const qs = q.toString();
        return request<Paginated<Post>>(`/admin/posts${qs ? `?${qs}` : ""}`);
    },
    createPost(input: PostInput) {
        return request<Post>("/admin/posts", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },
    updatePost(id: number, input: PostInput) {
        return request<Post>(`/admin/posts/${id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
    },
    deletePost(id: number) {
        return request<void>(`/admin/posts/${id}`, { method: "DELETE" });
    },

    // 后台评论
    adminComments(approved?: boolean) {
        const q =
            approved === undefined ? "" : `?approved=${approved ? "true" : "false"}`;
        return request<Comment[]>(`/admin/comments${q}`);
    },
    setCommentApproved(id: number, approved: boolean) {
        return request<Comment>(`/admin/comments/${id}`, {
            method: "PUT",
            body: JSON.stringify({ approved }),
        });
    },
    deleteComment(id: number) {
        return request<void>(`/admin/comments/${id}`, { method: "DELETE" });
    },
};
