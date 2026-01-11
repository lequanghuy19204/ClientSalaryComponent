<template>
  <div class="salary-page">
    <!-- Header Section (nằm ngoài card) -->
    <div class="salary-header">
      <h1 class="salary-title">Thành phần lương</h1>
      <div class="salary-toolbar">
        <!-- Thiết lập công thức button -->
        <button class="btn btn-outline">
          <span class="icon icon-mi-rule"></span>
          <span class="btn-text">Danh mục của hệ thống</span>
        </button>
        <!-- Thêm mới button -->
        <div class="btn-group">
          <button class="btn btn-primary">
            <span class="icon icon-mi-plus-white"></span>
            <span class="btn-text">Thêm mới</span>
          </button>
          <button class="btn btn-primary btn-dropdown">
            <span class="icon icon-down-white"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="salary-component">
      <!-- Filter Section -->
      <div class="salary-filter">
        <!-- Search Input -->
        <div class="filter-search">
          <div class="search-icon-wrapper">
            <span class="icon icon-search"></span>
          </div>
          <input
            type="text"
            class="search-input"
            placeholder="Tìm kiếm"
            v-model="searchText"
          />
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls">
          <!-- Tất cả trạng thái -->
          <button class="filter-dropdown">
            <span class="filter-text">Tất cả trạng thái</span>
            <span class="dropdown-icon icon-down"></span>
          </button>

          <!-- Tất cả đơn vị -->
          <div class="filter-unit-wrapper">
            <div class="filter-unit-input">
              <span class="filter-text">Tất cả đơn vị</span>
            </div>
            <button class="filter-unit-btn">
              <span class="dropdown-icon icon-down"></span>
            </button>
          </div>

          <!-- Filter Button -->
          <button class="filter-btn" title="Bộ lọc">
            <span class="icon icon-mi-filter"></span>
          </button>

          <!-- Setting Button -->
          <button class="filter-btn" title="Thiết lập">
            <span class="icon icon-mi-setting"></span>
          </button>
        </div>
      </div>

      <!-- Table Section - DevExtreme DataGrid -->
      <div class="salary-table-wrapper">
        <DxDataGrid
          :data-source="salaryComponents"
          :show-borders="false"
          :column-auto-width="false"
          :row-alternation-enabled="false"
          :hover-state-enabled="true"
          :show-column-lines="true"
          :show-row-lines="true"
          key-expr="id"
          height="100%"
          @selection-changed="onSelectionChanged"
        >
          <DxSelection mode="multiple" show-check-boxes-mode="always" />
          <DxScrolling mode="virtual" column-rendering-mode="virtual" />

          <!-- Fixed checkbox column on left -->
          <DxColumn
            type="selection"
            :width="40"
            :fixed="true"
            fixed-position="left"
            css-class="cell-column"
          />

          <DxColumn
            data-field="code"
            caption="Mã thành phần"
            :width="200"
            :min-width="200"
            css-class="cell-column"
          />
          <DxColumn
            data-field="name"
            caption="Tên thành phần"
            :width="280"
            :min-width="200"
            css-class="cell-column"
          />
          <DxColumn
            data-field="unit"
            caption="Đơn vị áp dụng"
            :width="200"
            :min-width="200"
            css-class="cell-column"
          />
          <DxColumn
            data-field="type"
            caption="Loại thành phần"
            :width="200"
            :min-width="200"
            css-class="cell-column"
            cell-template="typeTemplate"
          />
          <DxColumn
            data-field="property"
            caption="Tính chất"
            :width="200"
            :min-width="200"
            css-class="cell-column"
            cell-template="propertyTemplate"
          />

          <!-- Fixed action column on right -->
          <DxColumn
            caption=""
            :width="177"
            :min-width="177"
            :allow-sorting="false"
            :fixed="true"
            fixed-position="right"
            css-class="cell-column action-column"
            cell-template="actionsTemplate"
            header-cell-template="emptyHeaderTemplate"
          />

          <!-- Custom Templates -->
          <template #emptyHeaderTemplate>
            <span></span>
          </template>

          <template #typeTemplate="{ data }">
            <span>{{ data.value }}</span>
          </template>

          <template #propertyTemplate="{ data }">
            <span>{{ data.value }}</span>
          </template>

          <template #actionsTemplate="{ data }">
            <div class="action-buttons" :data-row-id="data.data.id">
              <button class="action-btn" title="Ngừng theo dõi">
                <span class="icon icon-mi-circle-minus-yellow"></span>
              </button>
              <button class="action-btn" title="Nhân bản">
                <span class="icon icon-mi-copy"></span>
              </button>
              <button class="action-btn" title="Sửa">
                <span class="icon icon-mi-pencil"></span>
              </button>
              <button class="action-btn" title="Xóa">
                <span class="icon icon-mi-trash-red"></span>
              </button>
            </div>
          </template>

          <DxPaging :enabled="false" />
        </DxDataGrid>
      </div>

      <!-- Pagination -->
      <div class="salary-pagination">
        <div class="pagination-total">
          Tổng số bản ghi:
          <b>{{ totalRecords }}</b>
        </div>
        <div class="pagination-center">
          <div class="page-size-selector">
            <span class="page-size-label">Số bản ghi/trang</span>
            <div class="page-size-dropdown">
              <button class="page-size-btn" @click="togglePageSizeDropdown">
                <span class="page-size-value">{{ pageSize }}</span>
                <span class="icon icon-down"></span>
              </button>
              <div class="page-size-options" v-if="showPageSizeDropdown">
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
          <div class="page-info">
            <b>{{ startRecord }}</b>
            -
            <b>{{ endRecord }}</b>
            bản ghi
          </div>
        </div>
        <div class="pagination-nav">
          <button
            class="nav-btn"
            :class="{ disabled: currentPage === 1 }"
            :disabled="currentPage === 1"
            @click="prevPage"
            title="Trước"
          >
            <span class="icon icon-mi-chevron-left"></span>
          </button>
          <button
            class="nav-btn"
            :class="{ disabled: currentPage === totalPages }"
            :disabled="currentPage === totalPages"
            @click="nextPage"
            title="Sau"
          >
            <span class="icon icon-mi-chevron-right"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DxDataGrid, DxColumn, DxSelection, DxScrolling, DxPaging } from 'devextreme-vue/data-grid'

const searchText = ref('')

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

const onSelectionChanged = (e) => {
  console.log('Selected rows:', e.selectedRowsData)
}
</script>

<style scoped>
/* Page Container */
.salary-page {
  padding: 16px 24px;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header Section (nằm ngoài card) */
.salary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0px 16px 0px;
  flex-shrink: 0;
}

.salary-title {
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  letter-spacing: 0.384px;
  line-height: 30px;
}

.salary-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Content Card */
.salary-component {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border-radius: 4px;
  border: 1px solid #ebebeb;
  background: #fff;
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

.btn-group {
  display: flex;
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

.btn-text {
  white-space: nowrap;
}

/* Icons */
.icon {
  display: inline-block;
  flex-shrink: 0;
}

/* Filter Section */
.salary-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #fff;
  height: 61px;
  flex-shrink: 0;
}

/* Search Input */
.filter-search {
  display: flex;
  align-items: center;
  width: 300px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.filter-search .search-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 8px;
}

.filter-search .search-input {
  flex: 1;
  height: 100%;
  border: none;
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

/* Filter Controls */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tất cả trạng thái dropdown */
.filter-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  margin-right: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
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
  display: inline-block;
}

/* Tất cả đơn vị - combobox style */
.filter-unit-wrapper {
  display: flex;
  align-items: center;
  width: 350px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  margin-right: 8px;
}

.filter-unit-input {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 100%;
}

.filter-unit-input .filter-text {
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-unit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
}

.filter-unit-btn:hover {
  background: #f5f5f5;
}

/* Filter/Setting Buttons */
.filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.filter-btn:hover {
  background: #f5f5f5;
}

/* Table Section */
.salary-table-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.action-btn:hover {
  background: #e0e0e0;
}

/* Pagination */
.salary-pagination {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background: #f6f6f6;
  border-top: 1px solid #e0e0e0;
  height: 60px;
  flex-shrink: 0;
  position: relative;
  z-index: 8;
}

.pagination-total {
  font-size: 14px;
  color: #212121;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
}

.pagination-total b {
  padding: 0 6px;
}

.pagination-center {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-label {
  font-size: 14px;
  color: #212121;
  white-space: nowrap;
}

.page-size-dropdown {
  position: relative;
}

.page-size-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80px;
  height: 36px;
  padding: 0 8px 0 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
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
  position: absolute;
  top: 100%;
  left: 0;
  width: 80px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
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

<style>
/* DevExtreme DataGrid Custom Styles - Global */
.salary-table-wrapper .dx-datagrid {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  border: none;
  height: 100%;
}

.salary-table-wrapper .dx-datagrid-headers {
  background: #f6f6f6 !important;
}

.salary-table-wrapper .dx-datagrid-headers .dx-header-row {
  height: 36px;
  background: #f6f6f6 !important;
}

.salary-table-wrapper .dx-datagrid-headers .dx-header-row td {
  font-weight: 700;
  color: #212121;
  padding: 0 16px;
  border: none;
  border-bottom: 1px solid #ebebeb;
  line-height: 36px;
  vertical-align: middle;
  background: #f6f6f6 !important;
}

.salary-table-wrapper .dx-datagrid-rowsview .dx-row {
  height: 36px;
}

.salary-table-wrapper .dx-datagrid-rowsview .dx-row td {
  padding: 0 16px;
  border: none;
  border-bottom: 1px solid #ebebeb;
  color: #212121;
  line-height: 36px;
  vertical-align: middle;
}

.salary-table-wrapper .dx-datagrid-rowsview .dx-row:hover {
  background: #eafbf2 !important;
}

.salary-table-wrapper .dx-datagrid-rowsview .dx-row:hover td {
  background: #eafbf2 !important;
}

.salary-table-wrapper .dx-datagrid-rowsview .dx-row:hover .action-buttons {
  opacity: 1;
}

.salary-table-wrapper .dx-datagrid-rowsview .dx-selection td {
  background: #e8f5e9 !important;
}

.salary-table-wrapper .dx-checkbox-icon {
  width: 16px;
  height: 16px;
}

.salary-table-wrapper .dx-checkbox-checked .dx-checkbox-icon {
  background-color: #34b057;
  border-color: #34b057;
}

.salary-table-wrapper .dx-datagrid .dx-column-lines > td {
  border-left: none;
  border-right: none;
}

.salary-table-wrapper .dx-datagrid-borders > .dx-datagrid-headers {
  border: none;
}

.salary-table-wrapper .dx-datagrid-borders > .dx-datagrid-rowsview {
  border: none;
}

/* Fixed columns styles */
.salary-table-wrapper .dx-datagrid-content-fixed {
  background: transparent;
}

.salary-table-wrapper .dx-datagrid-content-fixed .dx-datagrid-table {
  background: #fff;
}

.salary-table-wrapper .dx-datagrid-content-fixed .dx-row:hover td {
  background: #eafbf2 !important;
}

.salary-table-wrapper .dx-datagrid-content-fixed .dx-header-row td {
  background: #f6f6f6 !important;
}

/* Action column fixed right - show on hover */
.salary-table-wrapper .dx-datagrid-rowsview .dx-row .action-buttons {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.salary-table-wrapper .dx-datagrid-rowsview .dx-row:hover .action-buttons,
.salary-table-wrapper .dx-datagrid-content-fixed .dx-row:hover .action-buttons {
  opacity: 1;
}
</style>
