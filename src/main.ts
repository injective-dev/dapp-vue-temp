import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './pages/Home.vue'
import Dashboard from './pages/Dashboard.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/dashboard', component: Dashboard },
  ],
})

const app = createApp(App)

// Global error handler — logs component trace so we can find the real source
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err)
  console.error('[Component]', instance?.$options?.__name ?? 'unknown')
  console.error('[Info]', info)
}

app.use(router).mount('#app')
