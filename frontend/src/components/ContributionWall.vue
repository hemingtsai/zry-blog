<script setup lang="ts">
import Heatmap from "./Heatmap.vue";
import { useContributions } from "../composables/useContributions";

const props = defineProps<{
    /** GitHub 用户名 */
    user: string;
}>();

const { matrix, total, state } = useContributions(props.user);
</script>

<template>
    <div class="contrib">
        <div class="contrib__head">
            <span class="contrib__count font-condensed">
                {{ total }}
            </span>
            <span class="contrib__label">过去一年的贡献</span>
        </div>

        <p v-if="state === 'loading'" class="contrib__hint">
            正在加载贡献数据…
        </p>
        <p v-else-if="state === 'error'" class="contrib__hint">
            贡献数据暂时无法加载。
        </p>

        <div v-else class="contrib__frame">
            <Heatmap :data="matrix" :cell-size="13" :gap="3" />
        </div>

        <!-- 图例：浅 → 深 -->
        <div v-if="state === 'success'" class="contrib__legend">
            <span class="contrib__legend-text">少</span>
            <span class="contrib__legend-cell legend--0" />
            <span class="contrib__legend-cell legend--1" />
            <span class="contrib__legend-cell legend--2" />
            <span class="contrib__legend-cell legend--3" />
            <span class="contrib__legend-text">多</span>
        </div>

        <a
            class="contrib__link"
            :href="`https://github.com/${user}`"
            target="_blank"
            rel="noopener noreferrer"
        >
            在 GitHub 上查看完整活动 →
        </a>
    </div>
</template>

<style scoped>
.contrib {
    display: flex;
    flex-direction: column;
    gap: 2vh;
}

.contrib__head {
    display: flex;
    align-items: baseline;
    gap: 1vh;
}

.contrib__count {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
}

.contrib__label {
    font-size: 0.9rem;
    color: var(--text-tertiary);
}

.contrib__hint {
    font-size: 0.9rem;
    color: var(--text-tertiary);
}

.contrib__frame {
    padding: 2.5vh 2vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-secondary);
    overflow-x: auto;
}

.contrib__legend {
    display: flex;
    align-items: center;
    gap: 0.6vh;
    font-size: 0.8rem;
    color: var(--text-tertiary);
}

.contrib__legend-text {
    margin: 0 0.4vh;
}

.contrib__legend-cell {
    width: 13px;
    height: 13px;
    border: 1px solid var(--border-secondary);
}

/* 图例色阶：与 Heatmap 的 --bg-tertiary → --accent 插值一致 */
.legend--0 {
    background: var(--bg-tertiary);
}
.legend--1 {
    background: color-mix(in srgb, var(--accent) 33%, var(--bg-tertiary));
}
.legend--2 {
    background: color-mix(in srgb, var(--accent) 66%, var(--bg-tertiary));
}
.legend--3 {
    background: var(--accent);
}

.contrib__link {
    align-self: flex-start;
    font-size: 0.9rem;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 0.3vh;
    transition:
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.contrib__link:hover {
    color: var(--text-primary);
    border-color: var(--accent);
}
</style>
