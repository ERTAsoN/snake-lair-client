import { createRouter, createWebHistory } from 'vue-router'
import Registration from '../views/Registration.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Feed from '../views/Feed.vue'
import Messages from '../views/Messages.vue'
import Users from '../views/Users.vue'
import store from '../store'

const routes = [
  { path: '/register', component: Registration, meta: { requiresGuest: true } },
  { path: '/login', component: Login, meta: { requiresGuest: true } },
  { path: '/profile/:id', component: Profile, meta: { requiresAuth: true }, props: true },
  { path: '/feed', component: Feed, meta: { requiresAuth: true } },
  { path: '/messages', component: Messages, meta: { requiresAuth: true } },
  { path: '/users', component: Users, meta: { requiresAuth: true } },
  { path: '/', redirect: '/feed' }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  // Явно указываем модуль auth для диспатча
  await store.dispatch('checkAuth')

  // Получаем обновлённое состояние после проверки авторизации
  const isAuthenticated = !!store.state.auth.token
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/feed')
  } else {
    next()
  }
})

export default router