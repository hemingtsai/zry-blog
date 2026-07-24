import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 全局字体：思源宋体（人文气质）+ Barlow Condensed（数字装饰）
import "@fontsource-variable/noto-serif-sc";
import "@fontsource/barlow-condensed";

// 主题 CSS 变量系统
import "./styles/theme.css";

createApp(App).use(router).mount("#app");
