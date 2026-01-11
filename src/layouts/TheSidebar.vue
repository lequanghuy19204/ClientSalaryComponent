<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Menu chính -->
    <nav class="sidebar-nav">
      <ul class="sidebar-menu">
        <li
          v-for="item in menuItems"
          :key="item.id"
          class="sidebar-item"
          :class="{ active: item.id === activeId }"
        >
          <a href="#" class="sidebar-link" @click.prevent="handleClick(item.id)">
            <span class="sidebar-icon" :class="item.icon"></span>
            <span class="sidebar-text">{{ item.text }}</span>
            <span v-if="item.hasDropdown" class="sidebar-dropdown icon-sidebar-dropdown"></span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Nút thu gọn -->
    <div class="sidebar-footer">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <span class="sidebar-icon-toggle" :class="isCollapsed ? 'icon-sidebar-zoom-out' : 'icon-sidebar-zoom'"></span>
        <span class="sidebar-text">Thu gọn</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const activeId = ref('salary-composition')
const isCollapsed = ref(false)

const menuItems = [
  { id: 'dashboard', icon: 'icon-sidebar-dashboard', text: 'Tổng quan' },
  { id: 'salary-composition', icon: 'icon-sidebar-salary-composition', text: 'Thành phần lương' },
  { id: 'salary-template', icon: 'icon-sidebar-salary-template', text: 'Mẫu bảng lương' },
  { id: 'salary-data', icon: 'icon-sidebar-salary-data', text: 'Dữ liệu tính lương', hasDropdown: true },
  { id: 'salary-table', icon: 'icon-sidebar-salary-table', text: 'Tính lương', hasDropdown: true },
  { id: 'payment', icon: 'icon-sidebar-payment', text: 'Chi trả', hasDropdown: true },
  { id: 'report', icon: 'icon-sidebar-report', text: 'Báo cáo', hasDropdown: true },
  { id: 'setting', icon: 'icon-sidebar-setting', text: 'Thiết lập', hasDropdown: true }
]

const handleClick = (id) => {
  activeId.value = id
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
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  position: fixed;
  left: 0;
  top: 48px;
  transition: width 0.1s ease;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding-top: 24px;
  overflow-y: auto;
}

.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Menu Item */
.sidebar-item {
  padding: 0 12px;
  margin-bottom: 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  text-decoration: none;
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
  display: inline-block;
  flex-shrink: 0;
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

/* Text */
.sidebar-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 176px;
  height: 36px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.08);
  border: none;
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
