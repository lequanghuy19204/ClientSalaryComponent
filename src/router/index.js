import { createRouter, createWebHistory } from 'vue-router'
import SalaryComponent from '../views/SalaryComponent.vue'
import SalaryComponentForm from '../views/SalaryComponentForm.vue'

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
    {
      path: '/payroll/add',
      name: 'salary-component-add',
      component: SalaryComponentForm,
    },
    {
      path: '/payroll/edit/:id',
      name: 'salary-component-edit',
      component: SalaryComponentForm,
    },
  ],
})

export default router
