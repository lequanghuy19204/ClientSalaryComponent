<template>
  <header class="ms-header">
    <!-- Header Left -->
    <div class="ms-header__left">
      <!-- App Menu Launcher (Nine-dot) -->
      <div class="ms-header__app-menu" id="AMIS_Launcher">
        <div class="ms-header__icon-wrapper">
          <i class="icon-tooltip"></i>
        </div>
      </div>

      <!-- Logo -->
      <a href="/payroll" class="ms-header__logo">
        <div class="ms-header__logo-img">
          <i class="icon-logo"></i>
        </div>
        <span class="ms-header__logo-text">Tiền lương</span>
      </a>

      <!-- Search Bar -->
      <div class="ms-header__search" id="search-navbar">
        <div class="ms-header__search-input">
          <i class="icon-search"></i>
          <input
            type="text"
            class="ms-header__search-field"
            placeholder="Tìm kiếm"
            maxlength="255"
            v-model="searchText"
            @input="onSearch"
          />
        </div>
        <!-- Auto-complete dropdown -->
        <div class="ms-header__search-dropdown" v-if="showDropdown">
          <div class="ms-header__search-no-result">Không có bản ghi!</div>
        </div>
      </div>
    </div>

    <!-- Header Right -->
    <div class="ms-header__right">
      <!-- Right Menu Items -->
      <div v-for="item in rightMenuItems" :key="item.id" class="ms-header__item" :id="item.id">
        <div class="ms-header__icon-btn" :title="item.title">
          <i :class="item.icon"></i>
          <span class="ms-header__badge" v-if="item.badgeKey && getBadgeCount(item.badgeKey) > 0">
            {{ getBadgeCount(item.badgeKey) }}
          </span>
        </div>
      </div>

      <!-- User Account -->
      <div class="ms-header__item ms-header__user" id="User_Menu_Account">
        <div class="ms-header__avatar-wrapper">
          <img class="ms-header__avatar-img" :src="userAvatar" alt="Avatar" />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import '@/assets/css/icons.css'
import userAvatar from '@/assets/images/avatar.jpg'

export default {
  name: 'TheHeader',
  data() {
    return {
      searchText: '',
      showDropdown: false,
      storeNotificationCount: 0,
      notificationCount: 0,
      userAvatar,
      rightMenuItems: [
        {
          id: 'AMIS_Payrol_NewFeature',
          icon: 'icon-notification-version-header-right',
          title: 'Tính năng mới',
        },
        {
          id: 'header-banner-cross-sell',
          icon: 'icon-store-header-right',
          title: 'Cửa hàng',
          badgeKey: 'store',
        },
        {
          id: 'AMIS_UserControlPanel',
          icon: 'icon-user-controlpanel-header-right',
          title: 'Bảng điều khiển',
        },
        { id: 'AMIS_MessageBox', icon: 'icon-messbox-header-right', title: 'Tin nhắn' },
        {
          id: 'AMIS_Notification',
          icon: 'icon-notificationbox-header-right',
          title: 'Thông báo',
          badgeKey: 'notification',
        },
        { id: 'MISA_ButtonHelp', icon: 'icon-helpmenu-header-right', title: 'Trợ giúp' },
        { id: 'MISA_MoreMenu', icon: 'icon-moremenu-header-right', title: 'Tính năng khác' },
        { id: 'MISA_Knowledge', icon: 'icon-knowledge-header-right', title: 'Kiến thức hữu ích' },
      ],
    }
  },
  methods: {
    onSearch() {
      this.showDropdown = this.searchText.length > 0
    },
    getBadgeCount(key) {
      const badges = {
        store: this.storeNotificationCount,
        notification: this.notificationCount,
      }
      return badges[key] || 0
    },
  },
}
</script>

<style scoped>
/* ========== HEADER CONTAINER ========== */
.ms-header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  width: 100%;
  height: 48px;
  background: #fff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px;
  box-sizing: border-box;
  font-family: Inter, Helvetica, Arial, sans-serif;
}

/* ========== HEADER LEFT ========== */
.ms-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* App Menu (Nine-dot) */
.ms-header__app-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  margin-left: 12px;
  margin-right: 4px;
  transition: background-color 0.2s ease;
}

.ms-header__app-menu:hover {
  background-color: #e5e5e5;
}

/* Logo */
.ms-header__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  margin-right: 16px;
}

.ms-header__logo-img {
  width: 32px;
  height: 32px;
}

.ms-header__logo-text {
  font-size: 18px;
  font-weight: 800;
  color: #212121;
  margin-left: 4px;
}

/* Search Bar */
.ms-header__search {
  position: relative;
}

.ms-header__search-input {
  display: flex;
  align-items: center;
  width: 300px;
  height: 32px;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 0 8px;
  box-sizing: border-box;
}

.ms-header__search-input .icon-search {
  flex-shrink: 0;
}

.ms-header__search-field {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #212121;
  padding: 0 8px;
}

.ms-header__search-field::placeholder {
  color: #666;
}

.ms-header__search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  z-index: 10;
}

.ms-header__search-no-result {
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  line-height: 36px;
}

/* ========== HEADER RIGHT ========== */
.ms-header__right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 10px;
}

.ms-header__item {
  position: relative;
  margin-right: 8px;
}

.ms-header__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
}

.ms-header__icon-btn:hover {
  background-color: #e5e5e5;
}

/* Badge */
.ms-header__badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #dc2626;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  box-sizing: border-box;
}

/* ========== USER AVATAR ========== */
.ms-header__user {
  margin-left: 4px;
}

.ms-header__avatar-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.ms-header__avatar-wrapper:hover {
  background-color: #e5e5e5;
}

.ms-header__avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

/* ========== ICON WRAPPER ========== */
.ms-header__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== ICONS ========== */
.ms-header i[class^='icon-'] {
  display: inline-block;
}
</style>
