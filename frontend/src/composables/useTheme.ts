import { computed, ref } from "vue";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// null 表示跟随系统偏好
const theme = ref<Theme | null>(readStoredTheme());

const systemDark = ref(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
);
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
        systemDark.value = e.matches;
    });

// 单一事实来源：手动设置优先，否则跟随系统
const isDark = computed(() =>
    theme.value ? theme.value === "dark" : systemDark.value,
);

function readStoredTheme(): Theme | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
}

function applyTheme(value: Theme | null): void {
    const root = document.documentElement;
    if (value === null) {
        root.removeAttribute("data-theme");
    } else {
        root.setAttribute("data-theme", value);
    }
    syncThemeColor();
}

// 让浏览器 UI（地址栏等）跟随当前主题背景
function syncThemeColor(): void {
    const bg = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-primary")
        .trim();
    let meta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
    );
    if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
    }
    if (bg) meta.content = bg;
}

export function useTheme() {
    applyTheme(theme.value);

    const toggle = (): void => {
        const next: Theme = isDark.value ? "light" : "dark";
        theme.value = next;
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    };

    return { theme, isDark, toggle };
}
