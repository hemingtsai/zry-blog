import { ref } from "vue";
import type { Project } from "../data/profile";
import { fallbackProjects, pinnedRepoNames, profile } from "../data/profile";

/** GitHub REST API 返回的仓库结构（仅取用到的字段） */
interface GitHubRepo {
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    html_url: string;
    fork: boolean;
    archived: boolean;
    pushed_at: string;
}

export type LoadState = "loading" | "success" | "error";

/**
 * 从 GitHub API 动态拉取公开仓库并映射为 Project。
 * 失败时回退到 data/profile.ts 中的静态数据。
 */
export function useGithubRepos() {
    const projects = ref<Project[]>(fallbackProjects);
    const state = ref<LoadState>("loading");

    /** 将 GitHub 仓库映射为站点内部的 Project 结构 */
    const mapRepo = (repo: GitHubRepo): Project => ({
        name: repo.name,
        description: repo.description ?? "暂无描述。",
        language: repo.language ?? "Other",
        stars: repo.stargazers_count || undefined,
        href: repo.html_url,
        pinned: pinnedRepoNames.includes(repo.name),
    });

    const fetchRepos = async (): Promise<void> => {
        state.value = "loading";
        try {
            const url = `https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`;
            const res = await fetch(url, {
                headers: { Accept: "application/vnd.github+json" },
            });
            if (!res.ok) throw new Error(`GitHub API ${res.status}`);

            const data = (await res.json()) as GitHubRepo[];

            const mapped = data
                .filter((repo) => !repo.fork && !repo.archived)
                .map(mapRepo)
                // 精选优先，其次按 star 数降序
                .sort((a, b) => {
                    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                    return (b.stars ?? 0) - (a.stars ?? 0);
                });

            if (mapped.length > 0) {
                projects.value = mapped;
            }
            state.value = "success";
        } catch {
            // 静默回退到静态数据
            projects.value = fallbackProjects;
            state.value = "error";
        }
    };

    fetchRepos();

    return {
        projects,
        state,
        refresh: fetchRepos,
    };
}
