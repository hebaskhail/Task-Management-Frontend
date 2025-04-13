import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/Login/LoginPage.vue';
import TaskPage from '../components/Task/TaskPage.vue'


const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginPage,
    },
    {
        path: '/tasks',
        name: 'Tasks',
        component: TaskPage,
        meta: { requiresAuth: true }

    }
];
const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_API_URL),
    routes,
});

export default router;
