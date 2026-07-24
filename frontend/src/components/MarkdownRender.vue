<script setup lang="ts">
/**
 * MarkdownRender - 将 markdown 字符串渲染为 HTML
 *
 * 支持:
 * - LaTeX 数学公式 ($...$ 行内, $$...$$ 块级) —— markdown-it-katex
 * - Mermaid 图表 (```mermaid ... ```) —— 渲染后异步处理
 * - 代码高亮 —— highlight.js
 * - 标题锚点 —— markdown-it-anchor
 * - HTML 安全过滤 —— DOMPurify
 */
import { computed, nextTick, onMounted, ref, watch } from "vue";
// markdown-it / 其插件在本项目未安装类型声明，用 any 方式引入
// @ts-expect-error - markdown-it 缺少类型声明
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
// @ts-expect-error - markdown-it-katex 缺少类型声明
import mdKatex from "markdown-it-katex";
import hljs from "highlight.js";
import mermaid from "mermaid";
import DOMPurify from "dompurify";

import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";

const props = defineProps<{ source: string }>();

// ===================== 主题判定 =====================
function isDarkTheme(): boolean {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ===================== Mermaid 初始化 =====================
function initMermaid(): void {
    mermaid.initialize({
        startOnLoad: false,
        theme: isDarkTheme() ? "dark" : "default",
    });
}
initMermaid();

// ===================== MarkdownIt 初始化 =====================
const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
    highlight: (str: string, lang: string): string => {
        // mermaid 代码块不走高亮，输出占位 div（保留转义后的原始文本）
        if (lang && lang.toLowerCase() === "mermaid") {
            return (
                '<div class="mermaid">' + md.utils.escapeHtml(str) + "</div>"
            );
        }
        if (lang && hljs.getLanguage(lang)) {
            try {
                return (
                    '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true })
                        .value +
                    "</code></pre>"
                );
            } catch {
                // 落到默认转义
            }
        }
        return (
            '<pre class="hljs"><code>' +
            md.utils.escapeHtml(str) +
            "</code></pre>"
        );
    },
});

md.use(anchor, {
    permalink: anchor.permalink.headerLink(),
    slugify: (s: string) =>
        encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, "-")),
});

// markdown-it-katex: $...$ 行内 & $$...$$ 块级
md.use(mdKatex);

// ===================== Sanitized HTML =====================
const sanitizedHtml = computed(() =>
    DOMPurify.sanitize(md.render(props.source ?? "")),
);

// ===================== Mermaid 渲染 =====================
const container = ref<HTMLElement | null>(null);
let mermaidCounter = 0;

async function renderMermaid(): Promise<void> {
    const root = container.value;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>(".mermaid");
    for (const node of nodes) {
        // 幂等：重置处理标记，取回原始文本
        node.removeAttribute("data-processed");
        const raw = node.getAttribute("data-source") ?? node.textContent ?? "";
        node.setAttribute("data-source", raw);
        const code = raw.trim();
        if (!code) continue;

        try {
            const id = "mermaid-svg-" + (mermaidCounter++).toString(36);
            const { svg } = await mermaid.render(id, code);
            node.innerHTML = svg;
            node.setAttribute("data-processed", "true");
        } catch {
            node.textContent = code;
        }
    }
}

function refresh(): void {
    nextTick(() => {
        renderMermaid();
    });
}

// ===================== 生命周期 & 监听 =====================
onMounted(refresh);

watch(
    () => props.source,
    () => refresh(),
);

// 主题切换时用新主题重绘 mermaid
const themeObserver = new MutationObserver(() => {
    initMermaid();
    refresh();
});
themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
});
</script>

<template>
    <div ref="container" class="markdown-body" v-html="sanitizedHtml"></div>
</template>

<style scoped>
.markdown-body {
    line-height: 1.75;
    color: var(--text-primary);
    word-break: break-word;
    overflow-wrap: break-word;
}

/* ===================== 标题 ===================== */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
    margin: 1.4em 0 0.6em;
    font-weight: 600;
    line-height: 1.35;
    color: var(--text-primary);
}

.markdown-body :deep(h1) {
    font-size: 1.6em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--border-secondary);
}

.markdown-body :deep(h2) {
    font-size: 1.35em;
    padding-bottom: 0.25em;
    border-bottom: 1px solid var(--border-secondary);
}

.markdown-body :deep(h3) {
    font-size: 1.15em;
}

.markdown-body :deep(h4) {
    font-size: 1.05em;
}

/* 锚点链接（markdown-it-anchor headerLink） */
.markdown-body :deep(h1 a),
.markdown-body :deep(h2 a),
.markdown-body :deep(h3 a),
.markdown-body :deep(h4 a),
.markdown-body :deep(h5 a),
.markdown-body :deep(h6 a) {
    color: inherit;
    text-decoration: none;
}

/* ===================== 段落与文本 ===================== */
.markdown-body :deep(p) {
    margin: 0.75em 0;
}

.markdown-body :deep(a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.markdown-body :deep(strong) {
    font-weight: 600;
}

.markdown-body :deep(em) {
    font-style: italic;
}

.markdown-body :deep(del) {
    text-decoration: line-through;
    color: var(--text-secondary);
}

/* ===================== 列表 ===================== */
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    padding-left: 1.5em;
    margin: 0.75em 0;
}

.markdown-body :deep(li) {
    margin: 0.3em 0;
}

.markdown-body :deep(li > ul),
.markdown-body :deep(li > ol) {
    margin: 0.2em 0;
}

/* ===================== 引用块 ===================== */
.markdown-body :deep(blockquote) {
    margin: 1em 0;
    padding: 0.4em 1em;
    border-left: 3px solid var(--accent);
    background: var(--bg-secondary);
    color: var(--text-secondary);
}

.markdown-body :deep(blockquote p) {
    margin: 0.3em 0;
}

/* ===================== 行内代码 ===================== */
.markdown-body :deep(code) {
    font-family: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", monospace;
    font-size: 0.88em;
}

.markdown-body :deep(:not(pre) > code) {
    padding: 0.15em 0.4em;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
}

/* ===================== 代码块 ===================== */
.markdown-body :deep(pre.hljs),
.markdown-body :deep(pre) {
    margin: 1em 0;
    padding: 1em;
    overflow-x: auto;
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
}

/* 覆盖 highlight.js github 主题的背景，使其跟随主题变量 */
.markdown-body :deep(pre.hljs code),
.markdown-body :deep(pre code),
.markdown-body :deep(code.hljs) {
    background: transparent;
    padding: 0;
    border: none;
    color: var(--text-primary);
    font-size: 0.85em;
    line-height: 1.6;
}

/* ===================== 表格 ===================== */
.markdown-body :deep(table) {
    width: 100%;
    margin: 1em 0;
    border-collapse: collapse;
    font-size: 0.92em;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
    padding: 0.5em 0.75em;
    border: 1px solid var(--border-secondary);
    text-align: left;
}

.markdown-body :deep(th) {
    background: var(--bg-tertiary);
    font-weight: 600;
}

.markdown-body :deep(tr:nth-child(even) td) {
    background: var(--bg-secondary);
}

/* ===================== 图片与分割线 ===================== */
.markdown-body :deep(img) {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--border-secondary);
}

.markdown-body :deep(hr) {
    margin: 1.75em 0;
    border: none;
    border-top: 1px solid var(--border-secondary);
}

/* ===================== 数学公式 ===================== */
.markdown-body :deep(.katex-display) {
    margin: 1em 0;
    overflow-x: auto;
    overflow-y: hidden;
}

/* ===================== Mermaid ===================== */
.markdown-body :deep(.mermaid) {
    margin: 1em 0;
    text-align: center;
}

.markdown-body :deep(.mermaid svg) {
    max-width: 100%;
    height: auto;
}
</style>
