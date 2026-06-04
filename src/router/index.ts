import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Dashboard from '@/pages/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/dashboard', component: Dashboard },
  ],
})

export default router
