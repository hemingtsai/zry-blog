<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import Hero from "../components/Hero.vue";
import Section from "../components/Section.vue";
import SkillCard from "../components/SkillCard.vue";
import ProjectCard from "../components/ProjectCard.vue";
import ContributionWall from "../components/ContributionWall.vue";
import ContactCards from "../components/ContactCards.vue";
import { useGithubRepos } from "../composables/useGithubRepos";
import { profile, skills, contacts } from "../data/profile";
import { api, type PostListItem } from "../api";

const { projects, state } = useGithubRepos();
const pinnedProjects = computed(() => projects.value.filter((p) => p.pinned));
const otherProjects = computed(() => projects.value.filter((p) => !p.pinned));

const recentPosts = ref<PostListItem[]>([]);

onMounted(async () => {
    try {
        const res = await api.posts({ page: 1, size: 3 });
        recentPosts.value = res.items;
    } catch {
        recentPosts.value = [];
    }
});

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("zh-CN");
}
</script>

<template>
    <div class="home">
        <Hero />

    <Section title="关于" subtitle="About">
        <p class="prose">
            你好，我是
            <strong>{{ profile.name }}</strong>（{{ profile.handle }}），来自
            {{ profile.location }}。目前是一名普普通通的中学生，在
            <strong>{{ profile.org }}</strong>
            折腾着各种感兴趣的项目。
        </p>
        <p class="prose">
            从底层的 C / C++、Rust，到前端的 Vue，再到编辑器配置 Neovim /
            Emacs —— 我喜欢探索计算机世界的每一个角落，也享受把想法变成可运行代码的过程。
        </p>
    </Section>

    <Section
        v-if="recentPosts.length"
        title="最新文章"
        subtitle="Latest Posts"
    >
        <ul class="post-list">
            <li v-for="post in recentPosts" :key="post.id" class="post-item">
                <RouterLink
                    :to="`/blog/${post.slug}`"
                    class="post-link"
                >
                    <span class="post-title">{{ post.title }}</span>
                    <span class="post-date font-condensed">
                        {{ formatDate(post.created_at) }}
                    </span>
                </RouterLink>
            </li>
        </ul>
        <RouterLink to="/blog" class="more-link">查看全部文章 →</RouterLink>
    </Section>

    <Section title="技术栈" subtitle="Tech Stack">
        <div class="grid grid--wide">
            <SkillCard
                v-for="group in skills"
                :key="group.title"
                :group="group"
            />
        </div>
    </Section>

    <Section title="贡献墙" subtitle="Contributions">
        <ContributionWall :user="profile.githubUser" />
    </Section>

    <Section title="精选项目" subtitle="Featured Projects">
        <p v-if="state === 'loading'" class="hint">正在从 GitHub 拉取项目…</p>
        <p v-else-if="state === 'error'" class="hint">
            暂时无法连接 GitHub，以下为缓存的项目列表。
        </p>
        <div v-if="pinnedProjects.length" class="grid grid--project">
            <ProjectCard
                v-for="project in pinnedProjects"
                :key="project.name"
                :project="project"
            />
        </div>
    </Section>

    <Section v-if="otherProjects.length" title="更多项目" subtitle="More">
        <div class="grid grid--project">
            <ProjectCard
                v-for="project in otherProjects"
                :key="project.name"
                :project="project"
            />
        </div>
    </Section>

        <Section title="联系我" subtitle="Contact">
            <ContactCards :contacts="contacts" />
        </Section>
    </div>
</template>

<style scoped>
.prose {
    font-size: 1.02rem;
    line-height: 1.9;
    color: var(--text-secondary);
}

.prose + .prose {
    margin-top: 2vh;
}

.prose strong {
    color: var(--text-primary);
    font-weight: 700;
}

.hint {
    font-size: 0.9rem;
    color: var(--text-tertiary);
    margin-bottom: 2vh;
}

.grid {
    display: grid;
    gap: 2vh;
}

.grid--wide {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.grid--project {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.post-list {
    list-style: none;
    border-top: 1px solid var(--border-secondary);
}

.post-item {
    border-bottom: 1px solid var(--border-secondary);
}

.post-link {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 2vh;
    padding: 1.8vh 0;
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-title {
    font-size: 1.05rem;
    color: var(--text-primary);
}

.post-link:hover .post-title {
    color: var(--accent);
}

.post-date {
    flex-shrink: 0;
    font-size: 0.9rem;
    color: var(--text-tertiary);
}

.more-link {
    display: inline-block;
    margin-top: 2vh;
    font-size: 0.9rem;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 0.3vh;
    transition:
        color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.more-link:hover {
    color: var(--text-primary);
    border-color: var(--accent);
}
</style>
