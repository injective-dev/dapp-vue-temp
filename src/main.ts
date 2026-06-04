import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import Home from './pages/Home.vue'
import Dashboard from './pages/Dashboard.vue'
import './style.css'

// wagmiConfig is initialized at module level in config/wagmi.ts
// Composables use @wagmi/core functions directly — no Vue plugin needed

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/dashboard', component: Dashboard },
  ],
})

createApp(App)
  .use(router)
  .mount('#app')
