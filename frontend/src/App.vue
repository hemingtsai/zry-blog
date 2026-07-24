<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import IconButton from "./components/IconButton.vue";
import { useTheme } from "./composables/useTheme";
import { profile } from "./data/profile";

const { isDark, toggle } = useTheme();
const route = useRoute();

// 后台页面使用独立布局壳，不显示站点顶栏/页脚
const isAdmin = computed(() => route.path.startsWith("/admin"));

const year = new Date().getFullYear();
</script>

<template>
    <div class="page">
        <nav v-if="!isAdmin" class="topbar">
            <div class="topbar-inner container">
                <RouterLink to="/" class="brand font-condensed">HMTSAI</RouterLink>
                <div class="nav">
                    <RouterLink to="/" class="nav-link">首页</RouterLink>
                    <RouterLink to="/blog" class="nav-link">博客</RouterLink>
                    <IconButton
                        :icon="
                            isDark
                                ? 'material-symbols-light:light-mode-outline'
                                : 'material-symbols-light:dark-mode-outline'
                        "
                        label="切换主题"
                        @click="toggle"
                    />
                </div>
            </div>
        </nav>

        <main :class="isAdmin ? 'admin-main' : 'container site-main'">
            <RouterView v-slot="{ Component }">
                <transition name="page" mode="out-in">
                    <component :is="Component" />
                </transition>
            </RouterView>
        </main>

        <footer v-if="!isAdmin" class="footer">
            <div class="container footer-inner">
                <span class="footer-motto">❤️ {{ profile.motto }}</span>
                <span class="footer-copyright font-condensed">
                    © {{ year }} {{ profile.name }}
                </span>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
}

.topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-secondary);
    padding: calc(env(safe-area-inset-top) + 1.5vh) 0 1.5vh;
    transition: background 0.3s ease;
}

.topbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    font-size: 1.3rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: var(--text-primary);
}

.nav {
    display: flex;
    align-items: center;
    gap: 3vw;
}

.nav-link {
    position: relative;
    font-size: 0.98rem;
    color: var(--text-secondary);
    padding-bottom: 0.4vh;
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: var(--accent);
    transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
    color: var(--text-primary);
}

.nav-link.router-link-exact-active {
    color: var(--text-primary);
}

.nav-link.router-link-exact-active::after {
    width: 100%;
}

.container {
    width: 100%;
    max-width: 880px;
    margin: 0 auto;
    padding: 0 3vw;
}

.site-main {
    flex: 1;
}

.admin-main {
    flex: 1;
    width: 100%;
}

.footer {
    border-top: 1px solid var(--border-secondary);
    padding: calc(3vh + env(safe-area-inset-bottom)) 0 3vh;
    margin-top: 4vh;
}

.footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5vh;
}

.footer-motto {
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.footer-copyright {
    font-size: 0.9rem;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
}

/* 页面切换：进入从右滑入，离开向左滑出 */
.page-enter-active {
    transition:
        opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
    transition:
        opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
    opacity: 0;
    transform: translateX(12px);
}

.page-leave-to {
    opacity: 0;
    transform: translateX(-12px);
}
</style>
