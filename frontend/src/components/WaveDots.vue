<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";

// ===================== Props =====================
withDefaults(
    defineProps<{
        /** 网格每边点数（越大越密） */
        grid?: number;
        /** 点之间的间距 */
        spacing?: number;
    }>(),
    {
        grid: 48,
        spacing: 0.55,
    },
);

// ===================== 引用与状态 =====================
const container = ref<HTMLDivElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let points: THREE.Points | null = null;
let material: THREE.PointsMaterial | null = null;
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;

/** 从 CSS 变量读取当前主题色，转成 THREE.Color */
const readThemeColor = (variable: string, fallback: string): THREE.Color => {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
    return new THREE.Color(raw || fallback);
};

/** 依据当前主题刷新点的颜色 */
const applyThemeColor = (): void => {
    if (!material) return;
    // 使用 --text-tertiary（灰化前景），在深浅色下都低调不喧宾夺主
    material.color = readThemeColor("--text-tertiary", "#999999");
};

/** 初始化 Three.js 场景 */
const init = (gridSize: number, spacing: number): void => {
    const el = container.value;
    if (!el) return;

    const width = el.clientWidth;
    const height = el.clientHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    // 构建平面波点网格
    const half = (gridSize - 1) / 2;
    const positions = new Float32Array(gridSize * gridSize * 3);
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
            positions[i++] = (x - half) * spacing;
            positions[i++] = 0;
            positions[i++] = (z - half) * spacing;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    material = new THREE.PointsMaterial({
        size: 0.06,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
    });
    applyThemeColor();

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

/** 渲染循环：正弦波扰动 y 轴 + 缓慢旋转 */
const animate = (): void => {
    frameId = requestAnimationFrame(animate);
    if (!renderer || !scene || !camera || !points) return;

    const time = performance.now() * 0.0006;
    const position = points.geometry.getAttribute(
        "position",
    ) as THREE.BufferAttribute;

    for (let idx = 0; idx < position.count; idx++) {
        const x = position.getX(idx);
        const z = position.getZ(idx);
        const y = Math.sin(x * 0.6 + time) * 0.6 + Math.cos(z * 0.6 + time) * 0.6;
        position.setY(idx, y);
    }
    position.needsUpdate = true;

    points.rotation.y = time * 0.15;
    renderer.render(scene, camera);
};

/** 视口尺寸变化时同步 */
const handleResize = (): void => {
    const el = container.value;
    if (!el || !renderer || !camera) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
};

// ===================== 生命周期 =====================
onMounted(() => {
    // 尊重用户的减少动态偏好
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    init(48, 0.55);
    if (!reduceMotion) {
        animate();
    } else if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }

    resizeObserver = new ResizeObserver(handleResize);
    if (container.value) resizeObserver.observe(container.value);

    // 主题切换时更新颜色（监听 data-theme 与系统偏好）
    const observer = new MutationObserver(applyThemeColor);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", applyThemeColor);
});

onBeforeUnmount(() => {
    cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    points?.geometry.dispose();
    material?.dispose();
    renderer?.dispose();
    if (renderer?.domElement && container.value) {
        container.value.removeChild(renderer.domElement);
    }
});
</script>

<template>
    <div ref="container" class="wave-dots" aria-hidden="true" />
</template>

<style scoped>
.wave-dots {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.85;
}
</style>
