// 站点内容集中于此，内容源自 GitHub @Hemingtsai 公开信息。

export interface SocialLink {
    label: string;
    icon: string;
    href: string;
}

export interface SkillGroup {
    title: string;
    // 英文副标题，仅作装饰展示
    subtitle: string;
    items: string[];
}

export interface Project {
    name: string;
    description: string;
    language: string;
    stars?: number;
    href: string;
    // 是否进入“精选项目”区（而非“更多”区）
    pinned?: boolean;
}

export const profile = {
    name: "Hemingtsai",
    handle: "Hmtsai",
    githubUser: "Hemingtsai",
    tagline: "一个普普通通的中学生",
    intro: "我热爱开发，热爱计算机技术。",
    motto: "Developing forever!",
    location: "Qinhuangdao, China",
    org: "Hemingtsai Labs",
    website: "https://hmtsai.cn",
};

export const socials: SocialLink[] = [
    {
        label: "GitHub",
        icon: "material-symbols-light:code-blocks-outline",
        href: "https://github.com/Hemingtsai",
    },
    {
        label: "Website",
        icon: "material-symbols-light:language",
        href: "https://hmtsai.cn",
    },
];

export interface ContactItem {
    label: string;
    value: string;
    icon: string;
    href: string;
}

export const contacts: ContactItem[] = [
    {
        label: "GitHub",
        value: "@Hemingtsai",
        icon: "material-symbols-light:code-blocks-outline",
        href: "https://github.com/Hemingtsai",
    },
    {
        label: "Website",
        value: "hmtsai.cn",
        icon: "material-symbols-light:language",
        href: "https://hmtsai.cn",
    },
];

/** 技术栈 */
export const skills: SkillGroup[] = [
    {
        title: "编程语言",
        subtitle: "Languages",
        items: ["C / C++", "TypeScript", "Python", "Rust", "Lua", "HTML / CSS"],
    },
    {
        title: "前端",
        subtitle: "Frontend",
        items: ["Vue", "Tailwind CSS", "DaisyUI"],
    },
    {
        title: "后端与数据",
        subtitle: "Backend & Data",
        items: ["FastAPI", "MySQL", "SQLite"],
    },
    {
        title: "工具与编辑器",
        subtitle: "Tools & Editors",
        items: ["Git", "GitHub", "Gitea", "VSCode", "Neovim", "Emacs"],
    },
];

/** 精选仓库名（从 GitHub API 拉取时，这些会被标记为 pinned） */
export const pinnedRepoNames: string[] = [
    "zrynvim",
    "ezbench",
    "ideaboard-mobile",
    "lunalog",
];

/** 降级项目数据（GitHub API 不可用时使用 pinned 优先展示） */
export const fallbackProjects: Project[] = [
    {
        name: "zrynvim",
        description: "A Simple, Fast, Modern Neovim Config",
        language: "Lua",
        stars: 4,
        href: "https://github.com/Hemingtsai/zrynvim",
        pinned: true,
    },
    {
        name: "ezbench",
        description:
            "单文件 C++17 跨平台 CPU 基准测试，覆盖 15 种 ISA、11 类测试。",
        language: "C++",
        href: "https://github.com/Hemingtsai/ezbench",
        pinned: true,
    },
    {
        name: "ideaboard-mobile",
        description: "Record your ideas — Vue 3 + Tauri 的想法记录应用。",
        language: "Vue",
        href: "https://github.com/Hemingtsai/ideaboard-mobile",
        pinned: true,
    },
    {
        name: "lunalog",
        description: "轻量的个人博客系统。",
        language: "Python",
        stars: 1,
        href: "https://github.com/Hemingtsai/lunalog",
        pinned: true,
    },
    {
        name: "extreme-survival-guide",
        description:
            "中国极端生存指南 —— 覆盖自然灾害、基础设施危机、应急急救的综合知识库。",
        language: "TypeScript",
        href: "https://github.com/Hemingtsai/extreme-survival-guide",
    },
    {
        name: "otomata",
        description: "Otomata android —— 生成式音序器实验。",
        language: "Vue",
        href: "https://github.com/Hemingtsai/otomata",
    },
    {
        name: "single-text",
        description: "A Typecho Theme —— 极简单栏主题。",
        language: "PHP",
        stars: 1,
        href: "https://github.com/Hemingtsai/single-text",
    },
    {
        name: "zry-emacs",
        description: "个人 Emacs 配置。",
        language: "Emacs Lisp",
        href: "https://github.com/Hemingtsai/zry-emacs",
    },
];
