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
      <!-- Filter Section -->
      <div class="salary-filter d-flex align-items-center justify-content-between flex-shrink-0 bg-white">
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
          <MsSelect
            v-model="selectedUnit"
            :options="unitOptions"
            placeholder="Tất cả đơn vị"
            size="large"
            class="filter-unit-select"
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

const router = useRouter()

const searchText = ref('')

// Filter state
const selectedStatus = ref(null)
const selectedUnit = ref(null)

const statusOptions = [
  { value: null, label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang theo dõi' },
  { value: 'inactive', label: 'Ngừng theo dõi' }
]

const unitOptions = [
  { value: null, label: 'Tất cả đơn vị' },
  { value: 1, label: 'Misa Test pdthien 2024' },
  { value: 2, label: 'Chi nhánh miền Bắc' },
  { value: 3, label: 'Chi nhánh miền Nam' }
]

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

/* Filter/Setting Buttons */
.filter-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
}
</style>
