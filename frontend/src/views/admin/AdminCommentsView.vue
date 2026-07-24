<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AdminShell from "../../components/AdminShell.vue";
import { api, type Comment } from "../../api";

type Filter = "all" | "pending" | "approved";

const comments = ref<Comment[]>([]);
const state = ref<"loading" | "loaded" | "error">("loading");
const filter = ref<Filter>("all");

const shown = computed(() => {
    if (filter.value === "pending")
        return comments.value.filter((c) => !c.approved);
    if (filter.value === "approved")
        return comments.value.filter((c) => c.approved);
    return comments.value;
});

async function load() {
    state.value = "loading";
    try {
        comments.value = await api.adminComments();
        state.value = "loaded";
    } catch {
        state.value = "error";
    }
}

async function toggle(c: Comment) {
    try {
        const updated = await api.setCommentApproved(c.id, !c.approved);
        const idx = comments.value.findIndex((x) => x.id === c.id);
        if (idx !== -1) comments.value[idx] = updated;
    } catch (e) {
        alert(e instanceof Error ? e.message : "操作失败。");
    }
}

async function remove(c: Comment) {
    if (!confirm("确定删除这条评论？")) return;
    try {
        await api.deleteComment(c.id);
        comments.value = comments.value.filter((x) => x.id !== c.id);
    } catch (e) {
        alert(e instanceof Error ? e.message : "删除失败。");
    }
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("zh-CN");
}

onMounted(load);
</script>

<template>
    <AdminShell title="评论管理">
        <template #actions>
            <div class="filters">
                <button
                    v-for="f in (['all', 'pending', 'approved'] as Filter[])"
                    :key="f"
                    class="filter"
                    :class="{ active: filter === f }"
                    @click="filter = f"
                >
                    {{ f === "all" ? "全部" : f === "pending" ? "待审核" : "已通过" }}
                </button>
            </div>
        </template>

        <p v-if="state === 'loading'" class="hint">加载中…</p>
        <p v-else-if="state === 'error'" class="hint">加载失败。</p>
        <p v-else-if="!shown.length" class="hint">没有符合条件的评论。</p>

        <ul v-else class="list">
            <li v-for="c in shown" :key="c.id" class="item">
                <div class="head">
                    <div class="who">
                        <span class="author">{{ c.author }}</span>
                        <span
                            class="badge font-condensed"
                            :class="c.approved ? 'ok' : 'pending'"
                        >
                            {{ c.approved ? "已通过" : "待审核" }}
                        </span>
                    </div>
                    <span class="date font-condensed">
                        {{ formatDate(c.created_at) }}
                    </span>
                </div>
                <p class="content">{{ c.content }}</p>
                <div class="actions">
                    <button class="action" @click="toggle(c)">
                        {{ c.approved ? "取消通过" : "通过" }}
                    </button>
                    <button class="action danger" @click="remove(c)">删除</button>
                </div>
            </li>
        </ul>
    </AdminShell>
</template>

<style scoped>
.hint {
    font-size: 0.95rem;
    color: var(--text-tertiary);
}

.filters {
    display: flex;
    gap: 1vh;
}

.filter {
    padding: 0.9vh 1.8vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    transition:
        background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter:hover {
    border-color: var(--accent);
    color: var(--text-primary);
}

.filter.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-contrast);
}

.list {
    list-style: none;
    border-top: 1px solid var(--border-secondary);
}

.item {
    padding: 2.4vh 0;
    border-bottom: 1px solid var(--border-secondary);
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2vh;
    margin-bottom: 1.2vh;
}

.who {
    display: flex;
    align-items: center;
    gap: 1.5vh;
}

.author {
    font-weight: 700;
    color: var(--text-primary);
}

.badge {
    padding: 0.3vh 1vh;
    border: 1px solid var(--border-secondary);
    font-size: 0.78rem;
}

.badge.ok {
    border-color: var(--accent);
    color: var(--text-primary);
}

.badge.pending {
    color: var(--text-tertiary);
}

.date {
    font-size: 0.85rem;
    color: var(--text-tertiary);
}

.content {
    font-size: 0.98rem;
    line-height: 1.7;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 1.5vh;
}

.actions {
    display: flex;
    gap: 2vh;
}

.action {
    background: none;
    border: none;
    padding: 0.4vh 0;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.action:hover {
    color: var(--text-primary);
}

.action.danger:hover {
    color: var(--accent);
}
</style>
