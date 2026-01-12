<template>
  <div class="salary-page d-flex flex-column overflow-hidden">
    <!-- Header Section (nằm ngoài card) -->
    <div class="salary-header d-flex justify-content-between align-items-center flex-shrink-0">
      <h1 class="salary-title">Thành phần lương</h1>
      <div class="salary-toolbar d-flex align-items-center gap-2">
        <!-- Thiết lập công thức button -->
        <button class="btn btn-outline d-flex align-items-center justify-content-center gap-2">
          <span class="icon d-inline-block flex-shrink-0 icon-mi-rule"></span>
          <span class="btn-text text-nowrap">Danh mục của hệ thống</span>
        </button>
        <!-- Thêm mới button -->
        <div class="btn-group d-flex">
          <button class="btn btn-primary d-flex align-items-center justify-content-center gap-2" @click="goToAddForm">
            <span class="icon d-inline-block flex-shrink-0 icon-mi-plus-white"></span>
            <span class="btn-text text-nowrap">Thêm mới</span>
          </button>
          <button class="btn btn-primary btn-dropdown d-flex align-items-center justify-content-center">
            <span class="icon d-inline-block flex-shrink-0 icon-down-white"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="salary-component d-flex flex-column flex-grow-1 overflow-hidden bg-white rounded-1">
      <!-- Filter Section -->
      <div class="salary-filter d-flex align-items-center justify-content-between flex-shrink-0 bg-white">
        <!-- Search Input -->
        <div class="filter-search d-flex align-items-center overflow-hidden bg-white rounded-1">
          <div class="search-icon-wrapper d-flex align-items-center justify-content-center">
            <span class="icon d-inline-block flex-shrink-0 icon-search"></span>
          </div>
          <input
            type="text"
            class="search-input flex-grow-1 border-0"
            placeholder="Tìm kiếm"
            v-model="searchText"
          />
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls d-flex align-items-center gap-2">
          <!-- Tất cả trạng thái -->
          <button class="filter-dropdown d-flex align-items-center gap-2 bg-transparent border-0 rounded-1">
            <span class="filter-text">Tất cả trạng thái</span>
            <span class="dropdown-icon d-inline-block icon-down"></span>
          </button>

          <!-- Tất cả đơn vị -->
          <div class="filter-unit-wrapper d-flex align-items-center bg-white rounded-1">
            <div class="filter-unit-input d-flex align-items-center flex-grow-1">
              <span class="filter-text text-truncate">Tất cả đơn vị</span>
            </div>
            <button class="filter-unit-btn d-flex align-items-center justify-content-center bg-transparent border-0">
              <span class="dropdown-icon d-inline-block icon-down"></span>
            </button>
          </div>

          <!-- Filter Button -->
          <button class="filter-btn d-flex align-items-center justify-content-center bg-transparent border-0 rounded-1" title="Bộ lọc">
            <span class="icon d-inline-block flex-shrink-0 icon-mi-filter"></span>
          </button>

          <!-- Setting Button -->
          <button class="filter-btn d-flex align-items-center justify-content-center bg-transparent border-0 rounded-1" title="Thiết lập">
            <span class="icon d-inline-block flex-shrink-0 icon-mi-setting"></span>
          </button>
        </div>
      </div>

      <!-- Table Section - Using BaseDataGrid -->
      <BaseDataGrid
        :data-source="salaryComponents"
        :columns="tableColumns"
        key-expr="id"
        @selection-changed="onSelectionChanged"
        @action="onAction"
      />

      <!-- Pagination -->
      <div class="salary-pagination d-flex align-items-center flex-shrink-0 position-relative">
        <div class="pagination-total d-flex align-items-center gap-2">
          Tổng số bản ghi:
          <b>{{ totalRecords }}</b>
        </div>
        <div class="pagination-center d-flex align-items-center gap-3">
          <div class="page-size-selector d-flex align-items-center gap-2">
            <span class="page-size-label text-nowrap">Số bản ghi/trang</span>
            <div class="page-size-dropdown position-relative">
              <button class="page-size-btn d-flex align-items-center justify-content-between bg-white rounded-1" @click="togglePageSizeDropdown">
                <span class="page-size-value">{{ pageSize }}</span>
                <span class="icon d-inline-block flex-shrink-0 icon-down"></span>
              </button>
              <div class="page-size-options position-absolute bg-white rounded-1" v-if="showPageSizeDropdown">
                <div
                  v-for="size in pageSizeOptions"
                  :key="size"
                  class="page-size-option"
                  :class="{ active: size === pageSize }"
                  @click="changePageSize(size)"
                >
                  {{ size }}
                </div>
              </div>
            </div>
          </div>
          <div class="page-info d-flex align-items-center gap-1">
            <b>{{ startRecord }}</b>
            -
            <b>{{ endRecord }}</b>
            bản ghi
          </div>
        </div>
        <div class="pagination-nav d-flex align-items-center gap-1">
          <button
            class="nav-btn d-flex align-items-center justify-content-center bg-transparent border-0 rounded-1"
            :class="{ disabled: currentPage === 1 }"
            :disabled="currentPage === 1"
            @click="prevPage"
            title="Trước"
          >
            <span class="icon d-inline-block flex-shrink-0 icon-mi-chevron-left"></span>
          </button>
          <button
            class="nav-btn d-flex align-items-center justify-content-center bg-transparent border-0 rounded-1"
            :class="{ disabled: currentPage === totalPages }"
            :disabled="currentPage === totalPages"
            @click="nextPage"
            title="Sau"
          >
            <span class="icon d-inline-block flex-shrink-0 icon-mi-chevron-right"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseDataGrid from '@/components/bases/BaseDataGrid.vue'

const router = useRouter()

const searchText = ref('')

// Table columns configuration
const tableColumns = [
  { dataField: 'code', caption: 'Mã thành phần', width: 200, minWidth: 200 },
  { dataField: 'name', caption: 'Tên thành phần', width: 280, minWidth: 200 },
  { dataField: 'unit', caption: 'Đơn vị áp dụng', width: 200, minWidth: 200 },
  { dataField: 'type', caption: 'Loại thành phần', width: 200, minWidth: 200 },
  { dataField: 'property', caption: 'Tính chất', width: 200, minWidth: 200 }
]

// Pagination state
const currentPage = ref(1)
const pageSize = ref(15)
const pageSizeOptions = [15, 25, 50, 100]
const showPageSizeDropdown = ref(false)
const totalRecords = ref(179)

const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))
const startRecord = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endRecord = computed(() => Math.min(currentPage.value * pageSize.value, totalRecords.value))

const togglePageSizeDropdown = () => {
  showPageSizeDropdown.value = !showPageSizeDropdown.value
}

const changePageSize = (size) => {
  pageSize.value = size
  currentPage.value = 1
  showPageSizeDropdown.value = false
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const salaryComponents = ref([
  {
    id: 1,
    code: 'TPL001',
    name: 'Lương cơ bản',
    unit: 'Tất cả',
    type: 'Thu nhập',
    property: 'Chịu thuế'
  },
  {
    id: 2,
    code: 'TPL002',
    name: 'Phụ cấp ăn trưa',
    unit: 'Tất cả',
    type: 'Thu nhập',
    property: 'Không chịu thuế'
  },
  {
    id: 3,
    code: 'TPL003',
    name: 'Phụ cấp đi lại',
    unit: 'Tất cả',
    type: 'Thu nhập',
    property: 'Không chịu thuế'
  },
  {
    id: 4,
    code: 'TPL004',
    name: 'Tổng giờ làm thêm hưởng lương không chịu thuế',
    unit: 'Tất cả',
    type: 'Thu nhập',
    property: 'Không chịu thuế'
  },
  {
    id: 5,
    code: 'TPL005',
    name: 'Tổng giờ làm thêm hưởng lương chịu thuế',
    unit: 'Tất cả',
    type: 'Thu nhập',
    property: 'Chịu thuế'
  },
  {
    id: 6,
    code: 'TPL006',
    name: 'Bảo hiểm xã hội',
    unit: 'Tất cả',
    type: 'Giảm trừ',
    property: 'Giảm trừ'
  },
  {
    id: 7,
    code: 'TPL007',
    name: 'Bảo hiểm y tế',
    unit: 'Tất cả',
    type: 'Giảm trừ',
    property: 'Giảm trừ'
  },
  {
    id: 8,
    code: 'TPL008',
    name: 'Thuế thu nhập cá nhân',
    unit: 'Tất cả',
    type: 'Giảm trừ',
    property: 'Giảm trừ'
  }
])

const onSelectionChanged = (selectedRows) => {
  console.log('Selected rows:', selectedRows)
}

const onAction = ({ action, data }) => {
  console.log('Action:', action, 'Data:', data)
}

const goToAddForm = () => {
  router.push({ name: 'salary-component-add' })
}
</script>

<style scoped>
/* Page Container */
.salary-page {
  padding: 16px 24px;
  height: calc(100vh - 48px);
}

/* Header Section (nằm ngoài card) */
.salary-header {
  padding: 0 0px 16px 0px;
}

.salary-title {
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  letter-spacing: 0.384px;
  line-height: 30px;
}

/* Content Card */
.salary-component {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Buttons */
.btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #ebebeb;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: #34b057;
  border-color: #34b057;
  color: #fff;
}

.btn-primary:hover {
  background: #2a9047;
  border-color: #2a9047;
}

.btn-outline {
  background: #fff;
  border-color: #ebebeb;
}

.btn-group .btn:first-child {
  border-radius: 4px 0 0 4px;
}

.btn-group .btn:last-child {
  border-radius: 0 4px 4px 0;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-dropdown {
  padding: 0 8px;
  min-width: 36px;
}

/* Filter Section */
.salary-filter {
  padding: 12px 20px;
  height: 61px;
}

/* Search Input */
.filter-search {
  width: 300px;
  height: 36px;
  border: 1px solid #e0e0e0;
}

.filter-search .search-icon-wrapper {
  padding-left: 8px;
}

.filter-search .search-input {
  height: 100%;
  outline: none;
  padding: 0 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #212121;
}

.filter-search .search-input::placeholder {
  color: #666;
}

/* Tất cả trạng thái dropdown */
.filter-dropdown {
  height: 36px;
  padding: 0 12px;
  margin-right: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter-dropdown:hover {
  background: #f5f5f5;
}

.filter-text {
  font-size: 14px;
  font-weight: 400;
  color: #212121;
}

.dropdown-icon {
  width: 12px;
  height: 6px;
}

/* Tất cả đơn vị - combobox style */
.filter-unit-wrapper {
  width: 350px;
  height: 36px;
  border: 1px solid #e0e0e0;
  margin-right: 8px;
}

.filter-unit-input {
  padding: 0 12px;
  height: 100%;
}

.filter-unit-btn {
  width: 32px;
  height: 100%;
  cursor: pointer;
}

.filter-unit-btn:hover {
  background: #f5f5f5;
}

/* Filter/Setting Buttons */
.filter-btn {
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter-btn:hover {
  background: #f5f5f5;
}

/* Pagination */
.salary-pagination {
  padding: 10px 20px;
  background: #f6f6f6;
  border-top: 1px solid #e0e0e0;
  height: 60px;
  z-index: 8;
}

.pagination-total {
  font-size: 14px;
  color: #212121;
  margin-right: auto;
}

.pagination-total b {
  padding: 0 6px;
}

.page-size-label {
  font-size: 14px;
  color: #212121;
}

.page-size-btn {
  width: 80px;
  height: 36px;
  padding: 0 8px 0 12px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  color: #212121;
  transition: all 0.2s ease;
}

.page-size-btn:hover {
  border-color: #34b057;
}

.page-size-value {
  font-size: 14px;
}

.page-size-options {
  top: 100%;
  left: 0;
  width: 80px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  margin-top: 4px;
}

.page-size-option {
  padding: 8px 12px;
  font-size: 14px;
  color: #212121;
  cursor: pointer;
  transition: background 0.2s ease;
}

.page-size-option:hover {
  background: #eafbf2;
}

.page-size-option.active {
  background: #eafbf2;
  color: #34b057;
}

.page-info {
  font-size: 14px;
  color: #212121;
}

.nav-btn {
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #212121;
}

.nav-btn:hover:not(.disabled) {
  background: #e0e0e0;
}

.nav-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
