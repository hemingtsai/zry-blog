<script setup lang="ts">
import { Icon } from "@iconify/vue";

withDefaults(
    defineProps<{
        icon: string;
        size?: number;
        label?: string;
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
    }>(),
    {
        size: 22,
        label: "",
        disabled: false,
        type: "button",
    },
);

defineEmits<{
    click: [];
}>();
</script>

<template>
    <button
        class="icon-button"
        :type="type"
        :disabled="disabled"
        :aria-label="label"
        @click="$emit('click')"
    >
        <Icon :icon="icon" :width="size" :height="size" />
    </button>
</template>

<style scoped>
.icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition:
        background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-button:hover:not(:disabled) {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-contrast);
}

.icon-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
