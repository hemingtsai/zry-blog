<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminShell from "../../components/AdminShell.vue";
import MarkdownEditor from "../../components/MarkdownEditor.vue";
import { api, type PostInput } from "../../api";

const route = useRoute();
const router = useRouter();

const editId = computed(() => {
    const id = route.params.id;
    return typeof id === "string" ? Number(id) : null;
});
const isEdit = computed(() => editId.value !== null);

const form = reactive({
    title: "",
    slug: "",
    summary: "",
    content: "",
    published: false,
});
const tagsText = ref("");
const loading = ref(false);
const error = ref("");

async function load() {
    if (!isEdit.value) return;
    loading.value = true;
    try {
        // 后台列表已带 content，直接取列表匹配可行；这里走公开接口需 slug，故用列表
        const res = await api.adminPosts({ page: 1, size: 100 });
        const post = res.items.find((p) => p.id === editId.value);
        if (!post) throw new Error("文章不存在。");
        form.title = post.title;
        form.slug = post.slug;
        form.summary = post.summary;
        form.content = post.content;
        form.published = post.published;
        tagsText.value = post.tags.join(", ");
    } catch (e) {
        error.value = e instanceof Error ? e.message : "加载失败。";
    } finally {
        loading.value = false;
    }
}

async function save() {
    if (!form.title.trim()) {
        error.value = "标题不能为空。";
        return;
    }
    loading.value = true;
    error.value = "";
    const payload: PostInput = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        summary: form.summary.trim(),
        content: form.content,
        tags: tagsText.value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        published: form.published,
    };
    try {
        if (isEdit.value && editId.value !== null) {
            await api.updatePost(editId.value, payload);
        } else {
            await api.createPost(payload);
        }
        router.push("/admin");
    } catch (e) {
        error.value = e instanceof Error ? e.message : "保存失败。";
    } finally {
        loading.value = false;
    }
}

onMounted(load);
</script>

<template>
    <AdminShell :title="isEdit ? '编辑文章' : '新建文章'">
        <template #actions>
            <button class="ghost-btn" type="button" @click="router.push('/admin')">
                取消
            </button>
        </template>

        <form class="editor" @submit.prevent="save">
            <div class="row">
                <label class="field-label wide">
                    <span>标题</span>
                    <input v-model="form.title" class="field" type="text" />
                </label>
                <label class="field-label">
                    <span>Slug（留空自动生成）</span>
                    <input
                        v-model="form.slug"
                        class="field font-condensed"
                        type="text"
                        placeholder="my-post"
                    />
                </label>
            </div>

            <label class="field-label">
                <span>摘要</span>
                <textarea
                    v-model="form.summary"
                    class="field textarea"
                    rows="2"
                ></textarea>
            </label>

            <div class="row">
                <label class="field-label wide">
                    <span>标签（逗号分隔）</span>
                    <input
                        v-model="tagsText"
                        class="field"
                        type="text"
                        placeholder="Rust, Vue, 随笔"
                    />
                </label>
                <label class="checkbox">
                    <input v-model="form.published" type="checkbox" />
                    <span>立即发布</span>
                </label>
            </div>

            <div class="content-head">
                <span class="field-title">正文（Markdown）</span>
            </div>

            <MarkdownEditor v-model="form.content" />

            <p v-if="error" class="error">{{ error }}</p>

            <div class="actions">
                <button class="submit" type="submit" :disabled="loading">
                    {{ loading ? "保存中…" : "保存" }}
                </button>
            </div>
        </form>
    </AdminShell>
</template>

<style scoped>
.editor {
    display: flex;
    flex-direction: column;
    gap: 2.5vh;
}

.row {
    display: flex;
    flex-wrap: wrap;
    gap: 2vh;
    align-items: flex-end;
}

.field-label {
    display: flex;
    flex-direction: column;
    gap: 0.8vh;
    font-size: 0.9rem;
    color: var(--text-secondary);
    flex: 1;
    min-width: 220px;
}

.field-label.wide {
    flex: 2;
}

.field {
    padding: 1.2vh 1.5vh;
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

.checkbox {
    display: flex;
    align-items: center;
    gap: 1vh;
    font-size: 0.95rem;
    color: var(--text-secondary);
    padding-bottom: 1.2vh;
    cursor: pointer;
}

.checkbox input {
    width: 1.1rem;
    height: 1.1rem;
    accent-color: var(--accent);
}

.content-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.field-title {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.error {
    font-size: 0.9rem;
    color: var(--text-primary);
}

.actions {
    display: flex;
    gap: 2vh;
}

.submit {
    padding: 1.3vh 4vh;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--accent-contrast);
    font-family: inherit;
    font-size: 0.98rem;
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

.ghost-btn {
    padding: 1.1vh 2vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.92rem;
    cursor: pointer;
    transition:
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.ghost-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
}
</style>
