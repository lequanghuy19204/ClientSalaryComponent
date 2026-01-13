<template>
  <div class="salary-page d-flex flex-column overflow-hidden">
    <!-- Header Section (nằm ngoài card) -->
    <div class="salary-header d-flex justify-content-between align-items-center flex-shrink-0">
      <h1 class="salary-title">Thành phần lương</h1>
      <div class="salary-toolbar d-flex align-items-center gap-2">
        <!-- Thiết lập công thức button -->
        <MsButton
          label="Danh mục của hệ thống"
          icon="icon-mi-rule"
          variant="outline"
        />
        <!-- Thêm mới button -->
        <div class="btn-group d-flex">
          <MsButton
            label="Thêm mới"
            icon="icon-mi-plus-white"
            variant="primary"
            @click="goToAddForm"
          />
          <MsButton
            icon="icon-down-white"
            variant="primary"
            class="btn-dropdown"
          />
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="salary-component d-flex flex-column flex-grow-1 overflow-hidden bg-white rounded-1">
      <!-- Filter Section - Normal mode -->
      <div v-if="selectedRows.length === 0" class="salary-filter d-flex align-items-center justify-content-between flex-shrink-0 bg-white">
        <!-- Search Input -->
        <div class="filter-search d-flex align-items-center overflow-hidden bg-white rounded-1">
          <div class="search-icon-wrapper d-flex align-items-center justify-content-center">
            <span class="icon d-inline-block flex-shrink-0 icon-search"></span>
          </div>
          <MsInput
            v-model="searchText"
            placeholder="Tìm kiếm"
            class="search-input-wrapper"
          />
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls d-flex align-items-center gap-2">
          <!-- Tất cả trạng thái -->
          <MsSelect
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="Tất cả trạng thái"
            size="small"
            class="filter-status-select"
          />

          <!-- Tất cả đơn vị -->
          <MsTree
            v-model="selectedUnits"
            :data-source="unitTreeData"
            key-expr="id"
            display-expr="name"
            placeholder="Tất cả đơn vị"
            :max-selected-labels="1"
            class="filter-unit-tree"
          />

          <!-- Filter Button -->
          <MsButton
            icon="icon-mi-filter"
            variant="text"
            class="filter-btn"
            title="Bộ lọc"
          />

          <!-- Setting Button -->
          <MsButton
            icon="icon-mi-setting"
            variant="text"
            class="filter-btn"
            title="Thiết lập"
          />
        </div>
      </div>

      <!-- Selection Toolbar - When rows are selected -->
      <div v-else class="selection-toolbar d-flex align-items-center justify-content-between flex-shrink-0 bg-white">
        <div class="selection-info d-flex align-items-center">
          <div class="d-flex align-items-center">
            <span>Đã chọn</span>
            <b class="selected-count">{{ selectedRows.length }}</b>
          </div>
          <span class="deselect-link" @click="clearSelection">Bỏ chọn</span>
          <div class="selection-actions d-flex align-items-center gap-2">
            <MsButton
              label="Ngừng theo dõi"
              icon="icon-mi-circle-minus-yellow"
              variant="outline"
              class="btn-action btn-stop"
              @click="onBulkStop"
            />
            <MsButton
              label="Đang theo dõi"
              icon="icon-mi-circle-check-green"
              variant="outline"
              class="btn-action btn-active"
              @click="onBulkActive"
            />
          </div>
          <MsButton
            label="Xóa"
            icon="icon-mi-trash-red"
            variant="outline"
            class="btn-action btn-delete"
            @click="onBulkDelete"
          />
        </div>
      </div>

      <!-- Table Section - Using BaseDataGrid -->
      <BaseDataGrid
        :data-source="salaryComponents"
        :columns="tableColumns"
        key-expr="id"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-records="totalRecords"
        :page-size-options="pageSizeSelectOptions"
        @selection-changed="onSelectionChanged"
        @action="onAction"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseDataGrid from '@/components/bases/BaseDataGrid.vue'
import MsButton from '@/components/bases/MsButton.vue'
import MsInput from '@/components/bases/MsInput.vue'
import MsSelect from '@/components/bases/MsSelect.vue'
import MsTree from '@/components/bases/MsTree.vue'

const router = useRouter()

const searchText = ref('')
const selectedRows = ref([])

// Filter state
const selectedStatus = ref(null)
const selectedUnits = ref([])

const statusOptions = [
  { value: null, label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang theo dõi' },
  { value: 'inactive', label: 'Ngừng theo dõi' }
]

const unitTreeData = [
  {
    id: 1,
    name: 'Misa Test pdthien 2024',
    items: [
      {
        id: 11,
        name: 'Chi nhánh miền Bắc',
        items: [
          {
            id: 111,
            name: 'Khối sản xuất',
            items: [
              { id: 1111, name: 'Dự án Core' },
              { id: 1112, name: 'Dự án C&B' }
            ]
          },
          { id: 112, name: 'Trung tâm kinh doanh' },
          { id: 113, name: 'Trung tâm hỗ trợ khách hàng' }
        ]
      },
      {
        id: 12,
        name: 'Chi nhánh miền Nam',
        items: [
          { id: 121, name: 'Trung tâm kinh doanh' }
        ]
      }
    ]
  }
]

// Table columns configuration
const tableColumns = [
  { dataField: 'code', caption: 'Mã thành phần', width: 150, minWidth: 120 },
  { dataField: 'name', caption: 'Tên thành phần', width: 250, minWidth: 200 },
  { dataField: 'unit', caption: 'Đơn vị áp dụng', width: 150, minWidth: 120 },
  { dataField: 'type', caption: 'Loại thành phần', width: 150, minWidth: 120 },
  { dataField: 'property', caption: 'Tính chất', width: 120, minWidth: 100 },
  { dataField: 'taxable', caption: 'Chịu thuế', width: 100, minWidth: 80 },
  { dataField: 'taxDeduction', caption: 'Giảm trừ khi tính thuế', width: 180, minWidth: 150 },
  { dataField: 'quota', caption: 'Định mức', width: 120, minWidth: 100 },
  { dataField: 'valueType', caption: 'Kiểu giá trị', width: 120, minWidth: 100 },
  { dataField: 'value', caption: 'Giá trị', width: 120, minWidth: 100 },
  { dataField: 'description', caption: 'Mô tả', width: 200, minWidth: 150 },
  { dataField: 'showOnPayslip', caption: 'Hiển thị trên phiếu lương', width: 180, minWidth: 150 },
  { dataField: 'source', caption: 'Nguồn tạo', width: 120, minWidth: 100 },
  { dataField: 'status', caption: 'Trạng thái', width: 120, minWidth: 100 }
]

// Pagination state
const currentPage = ref(1)
const pageSize = ref(15)
const totalRecords = ref(179)

const pageSizeSelectOptions = [
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
]

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

const onSelectionChanged = (rows) => {
  selectedRows.value = rows
  console.log('Selected rows:', rows)
}

const clearSelection = () => {
  selectedRows.value = []
}

const onBulkStop = () => {
  console.log('Bulk stop:', selectedRows.value)
}

const onBulkActive = () => {
  console.log('Bulk active:', selectedRows.value)
}

const onBulkDelete = () => {
  console.log('Bulk delete:', selectedRows.value)
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

/* Button Group Styling */
.btn-group :deep(.ms-btn:first-child) {
  border-radius: 4px 0 0 4px;
}

.btn-group :deep(.ms-btn:last-child) {
  border-radius: 0 4px 4px 0;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-group :deep(.btn-dropdown) {
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

.filter-search :deep(.search-input-wrapper) {
  flex: 1;
}

.filter-search :deep(.search-input-wrapper .ms-input-wrapper) {
  height: 100%;
}

.filter-search :deep(.search-input-wrapper .ms-input) {
  height: 100%;
  border: none;
  border-radius: 0;
  box-shadow: none !important;
}

/* Filter Select Styling */
.filter-status-select :deep(.ms-select) {
  width: 170px;
  border: none;
  background: transparent;
}

.filter-status-select :deep(.ms-select:hover) {
  background: #f5f5f5;
}

.filter-unit-select :deep(.ms-select) {
  width: 350px;
}

/* Filter Tree Styling */
.filter-unit-tree :deep(.ms-tree) {
  width: 350px;
  border: 1px solid #e0e0e0;
  background: transparent;
}

.filter-unit-tree:hover :deep(.ms-tree) {
  border-color: #34b057;
}

/* Filter/Setting Buttons */
.filter-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
}

/* Selection Toolbar */
.selection-toolbar {
  padding: 12px 20px;
  height: 61px;
}

.selection-info {
  gap: 16px;
  font-size: 14px;
  color: #212121;
}

.selected-count {
  padding: 0 6px;
  color: #212121;
}

.deselect-link {
  color: #34b057;
  font-weight: 700;
  cursor: pointer;
}

.deselect-link:hover {
  text-decoration: underline;
}

.selection-actions {
  margin-left: 16px;
}

.btn-action :deep(.ms-btn) {
  height: 36px;
  padding: 0 16px 0 12px;
  border-radius: 4px;
}

.btn-stop :deep(.ms-btn-outline) {
  border-color: #e0e0e0;
  background: #fff8e6;
}

.btn-stop :deep(.ms-btn-outline:hover) {
  border-color: #f90;
}

.btn-active :deep(.ms-btn-outline) {
  border-color: #e0e0e0;
  background: #e6fff0;
}

.btn-active :deep(.ms-btn-outline:hover) {
  border-color: #25b973;
}

.btn-delete :deep(.ms-btn-outline) {
  border-color: #ff6161;
  color: #ff6161;
}

.btn-delete :deep(.ms-btn-outline:hover) {
  background: #fff0f0;
}
</style>
