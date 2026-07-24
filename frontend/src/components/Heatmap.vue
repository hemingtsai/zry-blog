<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        /** 二维数据数组，data[row][col]，null 表示空格（不渲染色块） */
        data: (number | null)[][];
        /** 单元格大小 (px) */
        cellSize?: number;
        /** 单元格间距 (px) */
        gap?: number;
        /** 覆盖用于颜色映射的最小值，默认取 data 中的最小值 */
        minValue?: number;
        /** 覆盖用于颜色映射的最大值，默认取 data 中的最大值 */
        maxValue?: number;
    }>(),
    {
        cellSize: 13,
        gap: 3,
    },
);

/** data 的实际最小 / 最大值（忽略 null） */
const computedMin = computed(() => {
    let min = Infinity;
    for (const row of props.data) {
        for (const v of row) {
            if (v !== null && v < min) min = v;
        }
    }
    return min === Infinity ? 0 : min;
});

const computedMax = computed(() => {
    let max = -Infinity;
    for (const row of props.data) {
        for (const v of row) {
            if (v !== null && v > max) max = v;
        }
    }
    return max === -Infinity ? 0 : max;
});

const effectiveMin = computed(() => props.minValue ?? computedMin.value);
const effectiveMax = computed(() => props.maxValue ?? computedMax.value);

/** 行数 / 列数 */
const rowCount = computed(() => props.data.length);
const colCount = computed(() => props.data[0]?.length ?? 0);

/** 热力颜色：浅色 → 深色（跟随主题） */
const HEAT_LIGHT = "var(--bg-tertiary)";
const HEAT_DARK = "var(--accent)";

/** 主题版本号：主题变化时递增，用于触发颜色重算 */
const themeVersion = ref(0);
let observer: MutationObserver | null = null;
const media = window.matchMedia("(prefers-color-scheme: dark)");
const bumpTheme = (): void => {
    themeVersion.value++;
};

onMounted(() => {
    observer = new MutationObserver(bumpTheme);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });
    media.addEventListener("change", bumpTheme);
});

onBeforeUnmount(() => {
    observer?.disconnect();
    media.removeEventListener("change", bumpTheme);
});

/** 解析 CSS 变量名 */
function extractCSSVar(color: string): string | null {
    const m = color.match(/var\((--[\w-]+)\)/);
    return m ? m[1] : null;
}

/** 将颜色字符串解析为 RGB 分量，支持 hex / rgb() / CSS 变量 */
function parseColor(color: string): [number, number, number] {
    // CSS 变量 → 运行时解析
    const varName = extractCSSVar(color);
    if (varName) {
        const resolved = getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();
        if (resolved) return parseColor(resolved);
        return [0, 0, 0];
    }

    // rgb(r, g, b) 格式
    const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
        return [
            parseInt(rgbMatch[1]),
            parseInt(rgbMatch[2]),
            parseInt(rgbMatch[3]),
        ];
    }

    // hex 格式
    const h = color.replace("#", "");
    if (h.length === 3) {
        return [
            parseInt(h[0] + h[0], 16),
            parseInt(h[1] + h[1], 16),
            parseInt(h[2] + h[2], 16),
        ];
    }
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
    ];
}

/** 根据值在浅色 → 深色之间插值 */
function interpolateColor(value: number): string {
    const min = effectiveMin.value;
    const max = effectiveMax.value;
    const minRGB = parseColor(HEAT_LIGHT);
    const maxRGB = parseColor(HEAT_DARK);
    if (max === min) return `rgb(${maxRGB.join(",")})`;

    const ratio = (value - min) / (max - min);
    const r = Math.round(minRGB[0] + (maxRGB[0] - minRGB[0]) * ratio);
    const g = Math.round(minRGB[1] + (maxRGB[1] - minRGB[1]) * ratio);
    const b = Math.round(minRGB[2] + (maxRGB[2] - minRGB[2]) * ratio);

    return `rgb(${r},${g},${b})`;
}

/** 单元格样式矩阵（依赖 themeVersion，主题切换时重算） */
const cellStyles = computed(() => {
    // 读取 themeVersion 以建立响应式依赖
    void themeVersion.value;
    const size = props.cellSize + "px";
    return props.data.map((row) =>
        row.map((value) => ({
            width: size,
            height: size,
            backgroundColor:
                value === null ? "transparent" : interpolateColor(value),
        })),
    );
});

/** 网格容器样式 */
const gridStyle = computed(() => ({
    display: "grid",
    gridTemplateColumns: `repeat(${colCount.value}, ${props.cellSize}px)`,
    gridTemplateRows: `repeat(${rowCount.value}, ${props.cellSize}px)`,
    gap: props.gap + "px",
}));
</script>

<template>
    <div class="heatmap-container">
        <div class="heatmap-grid" :style="gridStyle">
            <template v-for="(row, ri) in data" :key="'row-' + ri">
                <div
                    v-for="(value, ci) in row"
                    :key="'cell-' + ri + '-' + ci"
                    class="cell"
                    :style="cellStyles[ri][ci]"
                    :title="value !== null ? String(value) : ''"
                />
            </template>
        </div>
    </div>
</template>

<style scoped>
.heatmap-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.heatmap-grid {
    display: inline-grid;
}

.cell {
    border: 1px solid var(--border-secondary);
    transition: background-color 0.2s ease;
}
</style>
