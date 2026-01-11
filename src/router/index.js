import { createRouter, createWebHistory } from 'vue-router'
import SalaryComponent from '../views/SalaryComponent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/payroll',
    },
    {
      path: '/payroll',
      name: 'salary-component',
      component: SalaryComponent,
    },
  ],
})

export default router
