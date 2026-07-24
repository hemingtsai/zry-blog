<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import MarkdownRender from "../components/MarkdownRender.vue";
import { api, type Comment, type Post } from "../api";

const route = useRoute();

const post = ref<Post | null>(null);
const comments = ref<Comment[]>([]);
const state = ref<"loading" | "loaded" | "error">("loading");

const form = reactive({ author: "", content: "" });
const submitting = ref(false);
const submitError = ref("");
const submitted = ref(false);

async function load(slug: string) {
    state.value = "loading";
    submitted.value = false;
    try {
        post.value = await api.post(slug);
        comments.value = await api.comments(slug);
        state.value = "loaded";
    } catch {
        state.value = "error";
    }
}

async function submitComment() {
    if (!post.value) return;
    if (!form.author.trim() || !form.content.trim()) {
        submitError.value = "昵称和内容不能为空。";
        return;
    }
    submitting.value = true;
    submitError.value = "";
    try {
        await api.addComment(post.value.slug, form.author.trim(), form.content.trim());
        form.author = "";
        form.content = "";
        submitted.value = true;
    } catch (e) {
        submitError.value = e instanceof Error ? e.message : "提交失败。";
    } finally {
        submitting.value = false;
    }
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("zh-CN");
}

watch(
    () => route.params.slug,
    (slug) => {
        if (typeof slug === "string") load(slug);
    },
);

onMounted(() => {
    const slug = route.params.slug;
    if (typeof slug === "string") load(slug);
});
</script>

<template>
    <article class="post">
        <p v-if="state === 'loading'" class="hint">加载中…</p>
        <p v-else-if="state === 'error'" class="hint">
            找不到这篇文章。
            <RouterLink to="/blog" class="inline-link">返回博客</RouterLink>
        </p>

        <template v-else-if="post">
            <header class="post-header">
                <span class="crumb font-condensed">
                    <RouterLink to="/blog" class="inline-link">BLOG</RouterLink>
                    / {{ post.slug }}
                </span>
                <h1 class="post-title">{{ post.title }}</h1>
                <div class="post-meta">
                    <span class="post-date font-condensed">
                        {{ formatDate(post.created_at) }}
                    </span>
                    <span v-if="post.tags.length" class="post-tags">
                        <RouterLink
                            v-for="t in post.tags"
                            :key="t"
                            :to="{ name: 'blog', query: { tag: t } }"
                            class="post-tag font-condensed"
                        >
                            #{{ t }}
                        </RouterLink>
                    </span>
                </div>
            </header>

            <MarkdownRender :source="post.content" class="post-body" />

            <section class="comments">
                <h2 class="comments-title">
                    评论
                    <span class="font-condensed">({{ comments.length }})</span>
                </h2>

                <ul v-if="comments.length" class="comment-list">
                    <li
                        v-for="c in comments"
                        :key="c.id"
                        class="comment-item"
                    >
                        <div class="comment-head">
                            <span class="comment-author">{{ c.author }}</span>
                            <span class="comment-date font-condensed">
                                {{ formatDate(c.created_at) }}
                            </span>
                        </div>
                        <p class="comment-content">{{ c.content }}</p>
                    </li>
                </ul>
                <p v-else class="hint">还没有评论，来说两句吧。</p>

                <form class="comment-form" @submit.prevent="submitComment">
                    <input
                        v-model="form.author"
                        class="field"
                        type="text"
                        placeholder="昵称"
                        maxlength="40"
                    />
                    <textarea
                        v-model="form.content"
                        class="field textarea"
                        placeholder="写下你的评论…"
                        rows="4"
                        maxlength="2000"
                    ></textarea>
                    <p v-if="submitError" class="form-error">{{ submitError }}</p>
                    <p v-if="submitted" class="form-ok">
                        评论已提交，待管理员审核后展示。
                    </p>
                    <button class="submit" type="submit" :disabled="submitting">
                        {{ submitting ? "提交中…" : "提交评论" }}
                    </button>
                </form>
            </section>
        </template>
    </article>
</template>

<style scoped>
.post {
    padding: 4vh 0;
}

.hint {
    font-size: 0.95rem;
    color: var(--text-tertiary);
}

.inline-link {
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-secondary);
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.inline-link:hover {
    color: var(--accent);
    border-color: var(--accent);
}

.post-header {
    margin-bottom: 4vh;
    padding-bottom: 3vh;
    border-bottom: 1px solid var(--border-secondary);
}

.crumb {
    display: block;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    margin-bottom: 1.5vh;
}

.post-title {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--text-primary);
}

.post-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2vw;
    margin-top: 2vh;
}

.post-date {
    font-size: 0.9rem;
    color: var(--text-tertiary);
}

.post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5vw;
}

.post-tag {
    font-size: 0.85rem;
    color: var(--text-tertiary);
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-tag:hover {
    color: var(--accent);
}

.post-body {
    margin-bottom: 5vh;
}

.comments {
    padding-top: 4vh;
    border-top: 1px solid var(--border-secondary);
}

.comments-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 3vh;
}

.comments-title span {
    color: var(--text-tertiary);
    font-size: 1rem;
}

.comment-list {
    list-style: none;
    margin-bottom: 4vh;
}

.comment-item {
    padding: 2vh 0;
    border-bottom: 1px solid var(--border-secondary);
}

.comment-item:first-child {
    border-top: 1px solid var(--border-secondary);
}

.comment-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 2vh;
    margin-bottom: 1vh;
}

.comment-author {
    font-weight: 700;
    color: var(--text-primary);
}

.comment-date {
    font-size: 0.85rem;
    color: var(--text-tertiary);
}

.comment-content {
    font-size: 0.98rem;
    line-height: 1.7;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-word;
}

.comment-form {
    display: flex;
    flex-direction: column;
    gap: 1.5vh;
}

.field {
    width: 100%;
    padding: 1.2vh 2vw;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.98rem;
    transition: border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.field:focus {
    outline: none;
    border-color: var(--accent);
}

.textarea {
    resize: vertical;
    line-height: 1.6;
}

.form-error {
    font-size: 0.9rem;
    color: var(--text-primary);
}

.form-ok {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.submit {
    align-self: flex-start;
    padding: 1.2vh 3vw;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--accent-contrast);
    font-family: inherit;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit:hover:not(:disabled) {
    opacity: 0.85;
}

.submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
