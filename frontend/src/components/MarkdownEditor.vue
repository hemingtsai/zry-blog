<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Vditor from "vditor";
import "vditor/dist/index.css";
import { useTheme } from "../composables/useTheme";

const model = defineModel<string>({ required: true });

const { isDark } = useTheme();

const el = ref<HTMLElement | null>(null);
let vditor: Vditor | null = null;
let ready = false;

function contentTheme(): "dark" | "light" {
    return isDark.value ? "dark" : "light";
}

onMounted(() => {
    if (!el.value) return;
    vditor = new Vditor(el.value, {
        value: model.value ?? "",
        theme: isDark.value ? "dark" : "classic",
        mode: "ir",
        minHeight: 420,
        cache: { enable: false },
        preview: {
            theme: { current: contentTheme() },
            hljs: { style: isDark.value ? "github-dark" : "github" },
            math: { engine: "KaTeX" },
        },
        toolbar: [
            "headings",
            "bold",
            "italic",
            "strike",
            "|",
            "list",
            "ordered-list",
            "check",
            "quote",
            "line",
            "|",
            "code",
            "inline-code",
            "link",
            "table",
            "|",
            "upload",
            "|",
            "undo",
            "redo",
            "|",
            "edit-mode",
            "fullscreen",
        ],
        toolbarConfig: { pin: true },
        input(value) {
            // Vditor 在空内容/初始化时可能回传 undefined，兜底为空串
            model.value = value ?? "";
        },
        after() {
            ready = true;
            const current = model.value ?? "";
            if (vditor && current !== vditor.getValue()) {
                vditor.setValue(current);
            }
        },
    });
});

// 外部数据变更（如编辑态异步加载）时同步进编辑器
watch(model, (value) => {
    const next = value ?? "";
    if (ready && vditor && next !== vditor.getValue()) {
        vditor.setValue(next);
    }
});

// 主题切换时同步 Vditor 明暗
watch(isDark, (dark) => {
    if (!vditor) return;
    vditor.setTheme(
        dark ? "dark" : "classic",
        contentTheme(),
        dark ? "github-dark" : "github",
    );
});

onBeforeUnmount(() => {
    vditor?.destroy();
    vditor = null;
});
</script>

<template>
    <div ref="el" class="editor-host"></div>
</template>

<style scoped>
/* 直角、1px 边框、贴合极简主题 */
.editor-host {
    border: 1px solid var(--border-secondary);
}

.editor-host:focus-within {
    border-color: var(--accent);
}
</style>

<style>
/* Vditor 外观定制：去圆角、去阴影、跟随 CSS 变量 —— 非 scoped 以穿透组件内部 DOM */
.vditor {
    border: none !important;
    border-radius: 0 !important;
    background: var(--bg-primary) !important;
}

.vditor-toolbar {
    background: var(--bg-secondary) !important;
    border-bottom: 1px solid var(--border-secondary) !important;
    border-radius: 0 !important;
    padding: 0.4vh 1vh !important;
}

.vditor-toolbar__item .vditor-tooltipped {
    color: var(--text-secondary) !important;
    border-radius: 0 !important;
}

.vditor-toolbar__item .vditor-tooltipped:hover {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
}

.vditor-toolbar__divider {
    border-left: 1px solid var(--border-secondary) !important;
}

.vditor-reset {
    font-family: inherit !important;
    color: var(--text-primary) !important;
    background: var(--bg-primary) !important;
}

.vditor-ir pre.vditor-reset,
.vditor-wysiwyg pre.vditor-reset,
.vditor-sv {
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
}

/* 弹出面板去圆角去阴影 */
.vditor-panel,
.vditor-hint,
.vditor-emojis {
    border-radius: 0 !important;
    box-shadow: none !important;
    border: 1px solid var(--border-secondary) !important;
    background: var(--bg-primary) !important;
}

.vditor-panel button,
.vditor-hint button {
    border-radius: 0 !important;
}

/* 计数器 / 提示文字 */
.vditor-counter {
    color: var(--text-tertiary) !important;
}
</style>
