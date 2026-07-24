<script setup lang="ts">
defineProps<{
    title: string;
    // 英文副标题，装饰性，窄体展示
    subtitle: string;
}>();
</script>

<template>
    <section class="section">
        <header class="head">
            <span class="subtitle font-condensed">{{ subtitle }}</span>
            <h2 class="title">{{ title }}</h2>
        </header>
        <slot />
    </section>
</template>

<style scoped>
.section {
    padding: 4vh 0;
    border-top: 1px solid var(--border-secondary);
}

.head {
    display: flex;
    flex-direction: column;
    margin-bottom: 3vh;
}

.subtitle {
    font-size: 0.85rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-tertiary);
}

.title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);
}
</style>
