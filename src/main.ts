import { createApp } from 'vue'
import { WagmiPlugin } from '@wagmi/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import Home from './pages/Home.vue'
import Dashboard from './pages/Dashboard.vue'
import { wagmiConfig } from './config/wagmi'
import './style.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/dashboard', component: Dashboard },
  ],
})

createApp(App)
  .use(WagmiPlugin, { config: wagmiConfig })
  .use(VueQueryPlugin, {})
  .use(router)
  .mount('#app')
