<script setup lang="ts">
import type { SkillGroup } from "../data/profile";

defineProps<{
    group: SkillGroup;
}>();
</script>

<template>
    <div class="card">
        <header class="head">
            <span class="subtitle font-condensed">{{ group.subtitle }}</span>
            <h3 class="title">{{ group.title }}</h3>
        </header>
        <ul class="list">
            <li v-for="item in group.items" :key="item" class="item">
                {{ item }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.card {
    display: flex;
    flex-direction: column;
    padding: 2.5vh 2vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-secondary);
    height: 100%;
}

.head {
    margin-bottom: 2vh;
    padding-bottom: 1.5vh;
    border-bottom: 1px solid var(--border-secondary);
}

.subtitle {
    display: block;
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-tertiary);
}

.title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
}

.list {
    display: flex;
    flex-wrap: wrap;
    gap: 1vh;
    list-style: none;
}

.item {
    padding: 0.6vh 1.4vh;
    font-size: 0.9rem;
    border: 1px solid var(--border-secondary);
    color: var(--text-secondary);
    transition:
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.item:hover {
    border-color: var(--accent);
    color: var(--text-primary);
}
</style>
