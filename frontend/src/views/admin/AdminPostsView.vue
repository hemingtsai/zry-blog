<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import AdminShell from "../../components/AdminShell.vue";
import { api, type Post } from "../../api";

const posts = ref<Post[]>([]);
const state = ref<"loading" | "loaded" | "error">("loading");

async function load() {
    state.value = "loading";
    try {
        const res = await api.adminPosts({ page: 1, size: 100 });
        posts.value = res.items;
        state.value = "loaded";
    } catch {
        state.value = "error";
    }
}

async function remove(post: Post) {
    if (!confirm(`确定删除《${post.title}》？此操作不可撤销。`)) return;
    try {
        await api.deletePost(post.id);
        posts.value = posts.value.filter((p) => p.id !== post.id);
    } catch (e) {
        alert(e instanceof Error ? e.message : "删除失败。");
    }
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("zh-CN");
}

onMounted(load);
</script>

<template>
    <AdminShell title="文章管理">
        <template #actions>
            <RouterLink to="/admin/posts/new" class="new-btn">
                + 新建文章
            </RouterLink>
        </template>

        <p v-if="state === 'loading'" class="hint">加载中…</p>
        <p v-else-if="state === 'error'" class="hint">加载失败。</p>
        <p v-else-if="!posts.length" class="hint">还没有文章，点击右上角新建。</p>

        <table v-else class="table">
            <thead>
                <tr>
                    <th>标题</th>
                    <th class="col-slug">Slug</th>
                    <th class="col-status">状态</th>
                    <th class="col-date">更新</th>
                    <th class="col-actions"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="post in posts" :key="post.id">
                    <td class="cell-title">{{ post.title }}</td>
                    <td class="col-slug font-condensed">{{ post.slug }}</td>
                    <td class="col-status">
                        <span
                            class="badge font-condensed"
                            :class="post.published ? 'pub' : 'draft'"
                        >
                            {{ post.published ? "已发布" : "草稿" }}
                        </span>
                    </td>
                    <td class="col-date font-condensed">
                        {{ formatDate(post.updated_at) }}
                    </td>
                    <td class="col-actions">
                        <RouterLink
                            :to="`/admin/posts/${post.id}/edit`"
                            class="action"
                        >
                            编辑
                        </RouterLink>
                        <button class="action danger" @click="remove(post)">
                            删除
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </AdminShell>
</template>

<style scoped>
.hint {
    font-size: 0.95rem;
    color: var(--text-tertiary);
}

.new-btn {
    padding: 1.1vh 2vh;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--accent-contrast);
    font-size: 0.92rem;
    transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.new-btn:hover {
    opacity: 0.85;
}

.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.table th {
    text-align: left;
    padding: 1.5vh 1.5vh;
    border-bottom: 1px solid var(--border-primary);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    font-weight: 400;
}

.table td {
    padding: 1.8vh 1.5vh;
    border-bottom: 1px solid var(--border-secondary);
    color: var(--text-secondary);
    vertical-align: middle;
}

.cell-title {
    color: var(--text-primary);
    font-weight: 700;
}

.col-slug {
    color: var(--text-tertiary);
}

.badge {
    display: inline-block;
    padding: 0.4vh 1vh;
    border: 1px solid var(--border-secondary);
    font-size: 0.8rem;
}

.badge.pub {
    border-color: var(--accent);
    color: var(--text-primary);
}

.badge.draft {
    color: var(--text-tertiary);
}

.col-actions {
    white-space: nowrap;
    text-align: right;
}

.action {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.4vh 1vh;
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.action:hover {
    color: var(--text-primary);
}

.action.danger:hover {
    color: var(--accent);
}

@media (max-width: 640px) {
    .col-slug,
    .col-date {
        display: none;
    }
}
</style>
