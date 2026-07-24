<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import IconButton from "../../components/IconButton.vue";
import { useAuth } from "../../composables/useAuth";
import { useTheme } from "../../composables/useTheme";

const { login } = useAuth();
const { isDark, toggle } = useTheme();
const router = useRouter();
const route = useRoute();

const form = reactive({ username: "", password: "" });
const error = ref("");
const loading = ref(false);

async function onSubmit() {
    if (!form.username || !form.password) {
        error.value = "请输入用户名和密码。";
        return;
    }
    loading.value = true;
    error.value = "";
    try {
        await login(form.username, form.password);
        const redirect = (route.query.redirect as string) || "/admin";
        router.push(redirect);
    } catch (e) {
        error.value = e instanceof Error ? e.message : "登录失败。";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="login-page">
        <div class="theme-toggle">
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

        <form class="login-card" @submit.prevent="onSubmit">
            <span class="brand font-condensed">ADMIN</span>
            <h1 class="title">后台登录</h1>

            <label class="field-label">
                <span>用户名</span>
                <input
                    v-model="form.username"
                    class="field"
                    type="text"
                    autocomplete="username"
                />
            </label>
            <label class="field-label">
                <span>密码</span>
                <input
                    v-model="form.password"
                    class="field"
                    type="password"
                    autocomplete="current-password"
                />
            </label>

            <p v-if="error" class="error">{{ error }}</p>

            <button class="submit" type="submit" :disabled="loading">
                {{ loading ? "登录中…" : "登录" }}
            </button>
        </form>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3vw;
}

.theme-toggle {
    position: fixed;
    top: calc(env(safe-area-inset-top) + 2vh);
    right: 3vw;
}

.login-card {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 2vh;
    padding: 4vh 3vh;
    border: 1px solid var(--border-primary);
    background: var(--bg-primary);
}

.brand {
    font-size: 0.9rem;
    letter-spacing: 0.2em;
    color: var(--text-tertiary);
}

.title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1vh;
}

.field-label {
    display: flex;
    flex-direction: column;
    gap: 0.8vh;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.field {
    padding: 1.2vh 1.5vh;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.98rem;
    transition: border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.field:focus {
    outline: none;
    border-color: var(--accent);
}

.error {
    font-size: 0.9rem;
    color: var(--text-primary);
}

.submit {
    margin-top: 1vh;
    padding: 1.3vh;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--accent-contrast);
    font-family: inherit;
    font-size: 0.98rem;
    cursor: pointer;
    transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit:hover:not(:disabled) {
    opacity: 0.85;
}

.submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
