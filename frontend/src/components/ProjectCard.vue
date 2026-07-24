<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { Project } from "../data/profile";

defineProps<{
    project: Project;
}>();
</script>

<template>
    <a
        class="project-card"
        :href="project.href"
        target="_blank"
        rel="noopener noreferrer"
    >
        <div class="head">
            <h3 class="name">{{ project.name }}</h3>
            <Icon
                class="arrow"
                icon="material-symbols-light:arrow-outward"
                :width="22"
                :height="22"
            />
        </div>

        <p class="desc">{{ project.description }}</p>

        <div class="meta">
            <span class="lang">
                <span class="dot" />
                {{ project.language }}
            </span>
            <span v-if="project.stars" class="stars font-condensed">
                <Icon
                    icon="material-symbols-light:star-outline"
                    :width="16"
                    :height="16"
                />
                {{ project.stars }}
            </span>
        </div>
    </a>
</template>

<style scoped>
.project-card {
    display: flex;
    flex-direction: column;
    padding: 2.5vh 2vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    height: 100%;
    transition:
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover {
    border-color: var(--accent);
    background: var(--bg-secondary);
    transform: translateY(-2px);
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5vh;
}

.name {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.arrow {
    color: var(--text-tertiary);
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover .arrow {
    color: var(--accent);
}

.desc {
    flex: 1;
    font-size: 0.92rem;
    line-height: 1.7;
    color: var(--text-secondary);
    margin-bottom: 2vh;
}

.meta {
    display: flex;
    align-items: center;
    gap: 2vh;
    font-size: 0.85rem;
    color: var(--text-tertiary);
}

.lang {
    display: inline-flex;
    align-items: center;
    gap: 0.8vh;
}

.dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: var(--accent);
}

.stars {
    display: inline-flex;
    align-items: center;
    gap: 0.4vh;
    font-size: 0.95rem;
}
</style>
