import { computed, ref } from "vue";
import { api, getToken, setToken } from "../api";

const token = ref<string | null>(getToken());

export function useAuth() {
    const isAuthenticated = computed(() => !!token.value);

    async function login(username: string, password: string): Promise<void> {
        const res = await api.login(username, password);
        setToken(res.access_token);
        token.value = res.access_token;
    }

    function logout(): void {
        setToken(null);
        token.value = null;
    }

    return { token, isAuthenticated, login, logout };
}
