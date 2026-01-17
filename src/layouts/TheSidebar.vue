<template>
  <aside class="sidebar d-flex flex-column position-fixed start-0" :class="{ collapsed: isCollapsed }">
    <!-- Menu chính -->
    <nav class="sidebar-nav flex-grow-1 overflow-auto">
      <ul class="sidebar-menu list-unstyled m-0 p-0">
        <li
          v-for="item in menuItems"
          :key="item.id"
          class="sidebar-item"
          :class="{ active: item.id === activeId }"
        >
          <a href="#" class="sidebar-link d-flex align-items-center gap-2 text-decoration-none" @click.prevent="handleClick(item)">
            <span class="sidebar-icon d-inline-block flex-shrink-0" :class="item.icon"></span>
            <span class="sidebar-text flex-grow-1 text-truncate">{{ item.text }}</span>
            <span v-if="item.hasDropdown" class="sidebar-dropdown icon-sidebar-dropdown"></span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Nút thu gọn -->
    <div class="sidebar-footer">
      <button class="sidebar-toggle d-flex align-items-center justify-content-center gap-2 border-0" @click="toggleSidebar">
        <span class="sidebar-icon-toggle d-inline-block flex-shrink-0" :class="isCollapsed ? 'icon-sidebar-zoom-out' : 'icon-sidebar-zoom'"></span>
        <span class="sidebar-text">Thu gọn</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const STORAGE_KEY = 'sidebar-collapsed'

const router = useRouter()
const route = useRoute()

const emit = defineEmits(['update:collapsed'])

const isCollapsed = ref(localStorage.getItem(STORAGE_KEY) === 'true')

const menuItems = [
  { id: 'dashboard', icon: 'icon-sidebar-dashboard', text: 'Tổng quan', route: '/payroll/dashboard' },
  { id: 'salary-composition', icon: 'icon-sidebar-salary-composition', text: 'Thành phần lương', route: '/payroll/salarycomposition' },
  { id: 'salary-template', icon: 'icon-sidebar-salary-template', text: 'Mẫu bảng lương', route: '/payroll/salary-template' },
  { id: 'salary-data', icon: 'icon-sidebar-salary-data', text: 'Dữ liệu tính lương', route: '/payroll/salary-data', hasDropdown: true },
  { id: 'salary-table', icon: 'icon-sidebar-salary-table', text: 'Tính lương', route: '/payroll/salary-table', hasDropdown: true },
  { id: 'payment', icon: 'icon-sidebar-payment', text: 'Chi trả', route: '/payroll/payment', hasDropdown: true },
  { id: 'report', icon: 'icon-sidebar-report', text: 'Báo cáo', route: '/payroll/report', hasDropdown: true },
  { id: 'setting', icon: 'icon-sidebar-setting', text: 'Thiết lập', route: '/payroll/setting', hasDropdown: true }
]

const activeId = computed(() => {
  const currentPath = route.path
  const item = menuItems.find(item => currentPath.startsWith(item.route))
  return item ? item.id : 'salary-composition'
})

onMounted(() => {
  emit('update:collapsed', isCollapsed.value)
})

watch(isCollapsed, (newValue) => {
  localStorage.setItem(STORAGE_KEY, newValue.toString())
  emit('update:collapsed', newValue)
})

const handleClick = (item) => {
  router.push(item.route)
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
/* Sidebar Container */
.sidebar {
  width: 220px;
  height: calc(100vh - 48px);
  background: #161a17;
  font-family: 'Inter', sans-serif;
  top: 48px;
  transition: width 0.1s ease;
}

/* Navigation */
.sidebar-nav {
  padding-top: 24px;
}

/* Menu Item */
.sidebar-item {
  padding: 0 12px;
  margin-bottom: 8px;
}

.sidebar-link {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.14px;
  transition: all 0.2s ease;
}

.sidebar-link:hover {
  background: #1d3f27;
  color: #ffffff;
}

.sidebar-item.active .sidebar-link {
  background: #34b057;
  color: #ffffff;
}

/* Icon */
.sidebar-icon,
.sidebar-icon-toggle {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}

/* Icon hover */
.sidebar-link:hover .sidebar-icon,
.sidebar-item.active .sidebar-icon,
.sidebar-toggle:hover .sidebar-icon-toggle {
  opacity: 1;
}

/* Dropdown icon */
.sidebar-dropdown {
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.sidebar-link:hover .sidebar-dropdown,
.sidebar-item.active .sidebar-dropdown {
  opacity: 1;
}

/* Footer - Nút thu gọn */
.sidebar-footer {
  padding: 12px;
}

/* Icon Toggle */
.sidebar-icon-toggle {
  width: 16px;
  height: 16px;
}

.sidebar-toggle {
  width: 176px;
  height: 36px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  letter-spacing: 0.14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.sidebar-toggle .sidebar-text {
  flex: none;
}

/* Collapsed state */
.sidebar.collapsed {
  width: 56px;
}

.sidebar.collapsed .sidebar-text,
.sidebar.collapsed .sidebar-dropdown {
  display: none;
}

.sidebar.collapsed .sidebar-item {
  padding: 0 8px;
}

.sidebar.collapsed .sidebar-link {
  justify-content: center;
  padding: 0;
}

.sidebar.collapsed .sidebar-footer {
  padding: 12px 8px;
}

.sidebar.collapsed .sidebar-toggle {
  width: 40px;
  padding: 0;
}
</style>
