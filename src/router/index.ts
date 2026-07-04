import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { noAuth: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { noAuth: true }
    },
    {
      path: '/forgot',
      name: 'ForgotPassword',
      component: () => import('@/views/ForgotPassword.vue'),
      meta: { noAuth: true }
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/chat/:type/:id',
      name: 'ChatRoom',
      component: () => import('@/views/ChatRoom.vue')
    },
    {
      path: '/friends',
      name: 'Friends',
      component: () => import('@/views/Friends.vue')
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue')
    },
    {
      path: '/profile/edit',
      name: 'ProfileEdit',
      component: () => import('@/views/ProfileEdit.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.noAuth) {
    if (authStore.isLoggedIn && to.name === 'Login') {
      next('/home')
    } else {
      next()
    }
  } else {
    if (!authStore.isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
