import { createRouter, createWebHistory } from 'vue-router'
import Registration from '../views/Registration.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Feed from '../views/Feed.vue'
import Messages from '../views/Messages.vue'
import Friends from '../views/Friends.vue'
import Users from '../views/Users.vue'

const routes = [
  { path: '/register', component: Registration },
  { path: '/login', component: Login },
  { path: '/profile/:id', component: Profile, props: true },
  { path: '/feed', component: Feed },
  { path: '/messages', component: Messages },
  { path: '/friends', component: Friends },
  { path: '/users', component: Users },
  { path: '/', redirect: '/feed' }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router