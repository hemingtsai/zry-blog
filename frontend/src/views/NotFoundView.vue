<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <section class="notfound">
        <span class="code font-condensed">404</span>
        <p class="msg">这里什么都没有。</p>
        <RouterLink to="/" class="home-link">返回首页 →</RouterLink>
    </section>
</template>

<style scoped>
.notfound {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2vh;
    padding: 12vh 0;
    text-align: center;
}

.code {
    font-size: 5rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    line-height: 1;
}

.msg {
    font-size: 1rem;
    color: var(--text-secondary);
}

.home-link {
    font-size: 0.95rem;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 0.3vh;
    transition:
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.home-link:hover {
    color: var(--text-primary);
    border-color: var(--accent);
}
</style>
