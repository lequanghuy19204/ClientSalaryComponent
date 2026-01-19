import { createRouter, createWebHistory } from 'vue-router'
import SalaryComponent from '../views/salaryComponent/SalaryComponent.vue'
import SystemSalaryCategory from '../views/salaryComponentSystem/SystemSalaryCategory.vue'
import DashboardView from '../views/demo/DashboardView.vue'
import SalaryTemplateView from '../views/demo/SalaryTemplateView.vue'
import SalaryDataView from '../views/demo/SalaryDataView.vue'
import SalaryTableView from '../views/demo/SalaryTableView.vue'
import PaymentView from '../views/demo/PaymentView.vue'
import ReportView from '../views/demo/ReportView.vue'
import SettingView from '../views/demo/SettingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/payroll/salarycomposition',
    },
    {
      path: '/payroll/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/payroll/salarycomposition',
      name: 'salary-composition',
      component: SalaryComponent,
    },
    {
      path: '/payroll/salarycomposition/system-category',
      name: 'system-salary-category',
      component: SystemSalaryCategory,
    },
    {
      path: '/payroll/salary-template',
      name: 'salary-template',
      component: SalaryTemplateView,
    },
    {
      path: '/payroll/salary-data',
      name: 'salary-data',
      component: SalaryDataView,
    },
    {
      path: '/payroll/salary-table',
      name: 'salary-table',
      component: SalaryTableView,
    },
    {
      path: '/payroll/payment',
      name: 'payment',
      component: PaymentView,
    },
    {
      path: '/payroll/report',
      name: 'report',
      component: ReportView,
    },
    {
      path: '/payroll/setting',
      name: 'setting',
      component: SettingView,
    },
  ],
})

export default router
