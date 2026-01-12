<template>
  <header class="ms-header d-flex align-items-center justify-content-between position-fixed top-0 start-0 w-100 bg-white">
    <!-- Header Left -->
    <div class="ms-header__left d-flex align-items-center gap-2">
      <!-- App Menu Launcher (Nine-dot) -->
      <div class="ms-header__app-menu d-flex align-items-center justify-content-center rounded-circle" id="AMIS_Launcher">
        <div class="d-flex align-items-center justify-content-center">
          <i class="icon-tooltip"></i>
        </div>
      </div>

      <!-- Logo -->
      <a href="/payroll" class="ms-header__logo d-flex align-items-center gap-2 text-decoration-none">
        <div class="ms-header__logo-img">
          <i class="icon-logo"></i>
        </div>
        <span class="ms-header__logo-text">Tiền lương</span>
      </a>

      <!-- Search Bar -->
      <div class="ms-header__search position-relative" id="search-navbar">
        <div class="ms-header__search-input d-flex align-items-center rounded-1">
          <i class="icon-search flex-shrink-0"></i>
          <input
            type="text"
            class="ms-header__search-field flex-grow-1 border-0 bg-transparent"
            placeholder="Tìm kiếm"
            maxlength="255"
            v-model="searchText"
            @input="onSearch"
          />
        </div>
        <!-- Auto-complete dropdown -->
        <div class="ms-header__search-dropdown position-absolute bg-white rounded-1" v-if="showDropdown">
          <div class="ms-header__search-no-result">Không có bản ghi!</div>
        </div>
      </div>
    </div>

    <!-- Header Right -->
    <div class="ms-header__right d-flex align-items-center gap-1">
      <!-- Right Menu Items -->
      <div v-for="item in rightMenuItems" :key="item.id" class="ms-header__item position-relative" :id="item.id">
        <div class="ms-header__icon-btn d-flex align-items-center justify-content-center rounded-circle position-relative" :title="item.title">
          <i :class="item.icon"></i>
          <span class="ms-header__badge position-absolute d-flex align-items-center justify-content-center rounded-circle" v-if="item.badgeKey && getBadgeCount(item.badgeKey) > 0">
            {{ getBadgeCount(item.badgeKey) }}
          </span>
        </div>
      </div>

      <!-- User Account -->
      <div class="ms-header__item ms-header__user position-relative" id="User_Menu_Account">
        <div class="ms-header__avatar-wrapper position-relative rounded-circle">
          <img class="ms-header__avatar-img rounded-circle" :src="userAvatar" alt="Avatar" />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
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
  z-index: 9;
  height: 48px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.16);
  padding: 0px;
  box-sizing: border-box;
  font-family: Inter, Helvetica, Arial, sans-serif;
}

/* ========== HEADER LEFT ========== */
/* App Menu (Nine-dot) */
.ms-header__app-menu {
  width: 32px;
  height: 32px;
  cursor: pointer;
  margin-left: 12px;
  margin-right: 4px;
  transition: background-color 0.2s ease;
}

.ms-header__app-menu:hover {
  background-color: #e5e5e5;
}

/* Logo */
.ms-header__logo {
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
.ms-header__search-input {
  width: 300px;
  height: 32px;
  background: #f5f5f5;
  padding: 0 8px;
  box-sizing: border-box;
}

.ms-header__search-field {
  outline: none;
  font-size: 13px;
  color: #212121;
  padding: 0 8px;
}

.ms-header__search-field::placeholder {
  color: #666;
}

.ms-header__search-dropdown {
  top: 100%;
  left: 0;
  width: 300px;
  border: 1px solid #e0e0e0;
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
  margin-right: 10px;
}

.ms-header__item {
  margin-right: 8px;
}

.ms-header__icon-btn {
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.ms-header__icon-btn:hover {
  background-color: #e5e5e5;
}

/* Badge */
.ms-header__badge {
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #dc2626;
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
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.ms-header__avatar-wrapper:hover {
  background-color: #e5e5e5;
}

.ms-header__avatar-img {
  width: 32px;
  height: 32px;
  object-fit: cover;
}

/* ========== ICONS ========== */
.ms-header i[class^='icon-'] {
  display: inline-block;
}
</style>
