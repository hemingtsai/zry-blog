<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import Section from "../components/Section.vue";
import { api, type PostListItem, type Tag } from "../api";

const route = useRoute();
const router = useRouter();

const posts = ref<PostListItem[]>([]);
const tags = ref<Tag[]>([]);
const total = ref(0);
const page = ref(1);
const size = 10;
const state = ref<"loading" | "loaded" | "error">("loading");

const activeTag = computed(() => (route.query.tag as string) || "");
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size)));

async function load() {
    state.value = "loading";
    try {
        const res = await api.posts({
            page: page.value,
            size,
            tag: activeTag.value || undefined,
        });
        posts.value = res.items;
        total.value = res.total;
        state.value = "loaded";
    } catch {
        state.value = "error";
    }
}

async function loadTags() {
    try {
        tags.value = await api.tags();
    } catch {
        tags.value = [];
    }
}

function selectTag(name: string) {
    const tag = activeTag.value === name ? undefined : name;
    router.push({ name: "blog", query: tag ? { tag } : {} });
}

function goPage(next: number) {
    if (next < 1 || next > totalPages.value) return;
    page.value = next;
    load();
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("zh-CN");
}

watch(activeTag, () => {
    page.value = 1;
    load();
});

onMounted(() => {
    loadTags();
    load();
});
</script>

<template>
    <Section title="博客" subtitle="Blog">
        <div v-if="tags.length" class="tags">
            <button
                v-for="tag in tags"
                :key="tag.name"
                class="tag"
                :class="{ active: activeTag === tag.name }"
                @click="selectTag(tag.name)"
            >
                {{ tag.name }}
                <span class="tag-count font-condensed">{{ tag.count }}</span>
            </button>
        </div>

        <p v-if="state === 'loading'" class="hint">加载中…</p>
        <p v-else-if="state === 'error'" class="hint">
            无法加载文章，请确认后端服务已启动。
        </p>
        <p v-else-if="!posts.length" class="hint">
            {{ activeTag ? "该标签下暂无文章。" : "还没有发布任何文章。" }}
        </p>

        <ul v-else class="post-list">
            <li v-for="post in posts" :key="post.id" class="post-item">
                <RouterLink :to="`/blog/${post.slug}`" class="post-link">
                    <div class="post-head">
                        <span class="post-title">{{ post.title }}</span>
                        <span class="post-date font-condensed">
                            {{ formatDate(post.created_at) }}
                        </span>
                    </div>
                    <p v-if="post.summary" class="post-summary">
                        {{ post.summary }}
                    </p>
                    <div v-if="post.tags.length" class="post-tags">
                        <span
                            v-for="t in post.tags"
                            :key="t"
                            class="post-tag font-condensed"
                        >
                            #{{ t }}
                        </span>
                    </div>
                </RouterLink>
            </li>
        </ul>

        <div v-if="state === 'loaded' && totalPages > 1" class="pager">
            <button
                class="pager-btn"
                :disabled="page <= 1"
                @click="goPage(page - 1)"
            >
                上一页
            </button>
            <span class="pager-info font-condensed">
                {{ page }} / {{ totalPages }}
            </span>
            <button
                class="pager-btn"
                :disabled="page >= totalPages"
                @click="goPage(page + 1)"
            >
                下一页
            </button>
        </div>
    </Section>
</template>

<style scoped>
.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1vh;
    margin-bottom: 3vh;
}

.tag {
    display: inline-flex;
    align-items: center;
    gap: 0.6vw;
    padding: 0.8vh 1.4vw;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    transition:
        background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag:hover {
    border-color: var(--accent);
    color: var(--text-primary);
}

.tag.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-contrast);
}

.tag-count {
    font-size: 0.8rem;
    opacity: 0.7;
}

.hint {
    font-size: 0.95rem;
    color: var(--text-tertiary);
}

.post-list {
    list-style: none;
    border-top: 1px solid var(--border-secondary);
}

.post-item {
    border-bottom: 1px solid var(--border-secondary);
}

.post-link {
    display: block;
    padding: 2.4vh 0;
    transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-link:hover {
    opacity: 0.75;
}

.post-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 2vh;
}

.post-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
}

.post-date {
    flex-shrink: 0;
    font-size: 0.9rem;
    color: var(--text-tertiary);
}

.post-summary {
    margin-top: 1vh;
    font-size: 0.98rem;
    line-height: 1.7;
    color: var(--text-secondary);
}

.post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5vw;
    margin-top: 1.5vh;
}

.post-tag {
    font-size: 0.85rem;
    color: var(--text-tertiary);
}

.pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3vw;
    margin-top: 4vh;
}

.pager-btn {
    padding: 1vh 2vw;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.9rem;
    cursor: pointer;
    transition:
        background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.pager-btn:hover:not(:disabled) {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-contrast);
}

.pager-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.pager-info {
    font-size: 0.95rem;
    color: var(--text-secondary);
}
</style>
