import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "./composables/useAuth";

const router = createRouter({
    history: createWebHistory(),
    scrollBehavior() {
        return { top: 0 };
    },
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("./views/HomeView.vue"),
        },
        {
            path: "/blog",
            name: "blog",
            component: () => import("./views/BlogView.vue"),
        },
        {
            path: "/blog/:slug",
            name: "post",
            component: () => import("./views/PostView.vue"),
        },
        {
            path: "/admin/login",
            name: "admin-login",
            component: () => import("./views/admin/LoginView.vue"),
            meta: { admin: true },
        },
        {
            path: "/admin",
            name: "admin-posts",
            component: () => import("./views/admin/AdminPostsView.vue"),
            meta: { admin: true, requiresAuth: true },
        },
        {
            path: "/admin/posts/new",
            name: "admin-post-new",
            component: () => import("./views/admin/PostEditView.vue"),
            meta: { admin: true, requiresAuth: true },
        },
        {
            path: "/admin/posts/:id/edit",
            name: "admin-post-edit",
            component: () => import("./views/admin/PostEditView.vue"),
            meta: { admin: true, requiresAuth: true },
        },
        {
            path: "/admin/comments",
            name: "admin-comments",
            component: () => import("./views/admin/AdminCommentsView.vue"),
            meta: { admin: true, requiresAuth: true },
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("./views/NotFoundView.vue"),
        },
    ],
});

router.beforeEach((to) => {
    const { isAuthenticated } = useAuth();
    if (to.meta.requiresAuth && !isAuthenticated.value) {
        return { name: "admin-login", query: { redirect: to.fullPath } };
    }
    return true;
});

export default router;
