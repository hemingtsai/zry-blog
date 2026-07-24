<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import IconButton from "./IconButton.vue";
import { useAuth } from "../composables/useAuth";
import { useTheme } from "../composables/useTheme";

defineProps<{ title: string }>();

const { isDark, toggle } = useTheme();
const { logout } = useAuth();
const router = useRouter();

function onLogout() {
    logout();
    router.push({ name: "admin-login" });
}
</script>

<template>
    <div class="admin">
        <header class="admin-bar">
            <div class="admin-bar-inner">
                <div class="left">
                    <RouterLink to="/admin" class="brand font-condensed">
                        ADMIN
                    </RouterLink>
                    <nav class="admin-nav">
                        <RouterLink to="/admin" class="admin-link">文章</RouterLink>
                        <RouterLink to="/admin/comments" class="admin-link">
                            评论
                        </RouterLink>
                    </nav>
                </div>
                <div class="right">
                    <RouterLink to="/" class="admin-link">← 站点</RouterLink>
                    <IconButton
                        :icon="
                            isDark
                                ? 'material-symbols-light:light-mode-outline'
                                : 'material-symbols-light:dark-mode-outline'
                        "
                        label="切换主题"
                        @click="toggle"
                    />
                    <IconButton
                        icon="material-symbols-light:logout"
                        label="登出"
                        @click="onLogout"
                    />
                </div>
            </div>
        </header>

        <main class="admin-content">
            <div class="admin-head">
                <h1 class="admin-title">{{ title }}</h1>
                <slot name="actions" />
            </div>
            <slot />
        </main>
    </div>
</template>

<style scoped>
.admin {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
}

.admin-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-primary);
    padding: calc(env(safe-area-inset-top) + 1.5vh) 0 1.5vh;
}

.admin-bar-inner {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 3vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2vw;
}

.left,
.right {
    display: flex;
    align-items: center;
    gap: 2.5vw;
}

.brand {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: var(--text-primary);
}

.admin-nav {
    display: flex;
    gap: 2vw;
}

.admin-link {
    font-size: 0.95rem;
    color: var(--text-secondary);
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-link:hover,
.admin-link.router-link-exact-active {
    color: var(--text-primary);
}

.admin-content {
    flex: 1;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 4vh 3vw calc(6vh + env(safe-area-inset-bottom));
}

.admin-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 2vh;
    margin-bottom: 4vh;
}

.admin-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);
}
</style>
