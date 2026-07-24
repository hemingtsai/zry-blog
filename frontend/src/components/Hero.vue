<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { Icon } from "@iconify/vue";
import { profile, socials } from "../data/profile";

// WaveDots 内含 Three.js，异步加载使其从主包拆分为独立 chunk
const WaveDots = defineAsyncComponent(() => import("./WaveDots.vue"));
</script>

<template>
    <header class="hero">
        <WaveDots />

        <div class="content">
            <div class="badge font-condensed">{{ profile.org }}</div>

            <h1 class="name">{{ profile.name }}</h1>
            <p class="handle font-condensed">@{{ profile.handle }}</p>

            <p class="tagline">{{ profile.tagline }}</p>
            <p class="intro">{{ profile.intro }}</p>

            <p class="motto">❤️ {{ profile.motto }}</p>

            <div class="meta">
                <Icon
                    icon="material-symbols-light:location-on-outline"
                    :width="18"
                    :height="18"
                />
                {{ profile.location }}
            </div>

            <nav class="links">
                <a
                    v-for="link in socials"
                    :key="link.label"
                    class="link"
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Icon :icon="link.icon" :width="20" :height="20" />
                    <span>{{ link.label }}</span>
                </a>
            </nav>
        </div>
    </header>
</template>

<style scoped>
.hero {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 6vh 0 4vh;
    padding: 6dvh 0 4dvh;
    overflow: hidden;
}

.content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
}

.badge {
    align-self: flex-start;
    padding: 0.4vh 1.2vh;
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent-contrast);
    background: var(--accent);
    margin-bottom: 3vh;
}

.name {
    font-size: clamp(2.8rem, 8vw, 4.5rem);
    font-weight: 700;
    line-height: 1.05;
    color: var(--text-primary);
}

.handle {
    font-size: 1.2rem;
    color: var(--text-tertiary);
    margin-top: 0.5vh;
    letter-spacing: 0.05em;
}

.tagline {
    font-size: 1.3rem;
    color: var(--text-primary);
    margin-top: 3vh;
}

.intro {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--text-secondary);
    margin-top: 1vh;
}

.motto {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-top: 2vh;
    padding-left: 1.5vh;
    border-left: 2px solid var(--accent);
}

.meta {
    display: inline-flex;
    align-items: center;
    gap: 0.6vh;
    align-self: flex-start;
    margin-top: 3vh;
    font-size: 0.9rem;
    color: var(--text-tertiary);
}

.links {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5vh;
    margin-top: 4vh;
}

.link {
    display: inline-flex;
    align-items: center;
    gap: 1vh;
    padding: 1.2vh 2vh;
    font-size: 0.95rem;
    border: 1px solid var(--border-primary);
    color: var(--text-primary);
    transition:
        background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.link:hover {
    background: var(--accent);
    color: var(--accent-contrast);
}
</style>
