<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { ContactItem } from "../data/profile";

defineProps<{
    contacts: ContactItem[];
}>();
</script>

<template>
    <div class="grid">
        <a
            v-for="item in contacts"
            :key="item.label"
            class="card"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
        >
            <Icon class="icon" :icon="item.icon" :width="28" :height="28" />
            <div class="text">
                <span class="label font-condensed">{{ item.label }}</span>
                <span class="value">{{ item.value }}</span>
            </div>
            <Icon
                class="arrow"
                icon="material-symbols-light:arrow-outward"
                :width="20"
                :height="20"
            />
        </a>
    </div>
</template>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 2vh;
}

.card {
    display: flex;
    align-items: center;
    gap: 1.5vh;
    padding: 2.2vh 2vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-primary);
    transition:
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
    border-color: var(--accent);
    background: var(--bg-secondary);
}

.icon {
    color: var(--text-primary);
    flex-shrink: 0;
}

.text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-tertiary);
}

.value {
    font-size: 0.98rem;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.arrow {
    color: var(--text-tertiary);
    flex-shrink: 0;
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover .arrow {
    color: var(--accent);
}
</style>
