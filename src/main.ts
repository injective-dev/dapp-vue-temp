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

// Capture both errors AND warnings with full component stack
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Error] Info:', info)
  console.error('[Vue Error] Error:', err)
}
app.config.warnHandler = (msg, _instance, trace) => {
  console.warn('[Vue Warn]', msg)
  console.warn('[Vue Warn Trace]', trace)
}

app.use(router).mount('#app')
