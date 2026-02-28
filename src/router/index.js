import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RoutinesView from '../views/RoutinesView.vue'
import WorkoutView from '../views/WorkoutView.vue'
import HistoryView from '../views/HistoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/routines',
      name: 'routines',
      component: RoutinesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true },
    },
    {
      path: '/workout/:id',
      name: 'workout',
      component: WorkoutView,
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresAuth: true }
    }




  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next({name : 'login'})

  }
  else if (to.meta.requiresGuest && token) {
    next({name : 'dashboard'})
  }
  else {
    next()
  }
})

export default router
