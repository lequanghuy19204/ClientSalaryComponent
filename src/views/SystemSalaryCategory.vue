<template>
  <div class="system-category-page d-flex flex-column overflow-hidden">
    <!-- Header Section -->
    <div class="page-header d-flex justify-content-between align-items-center flex-shrink-0">
      <div class="d-flex align-items-center gap-2">
        <MsButton
          icon="icon-arrow-left"
          variant="text"
          size="small"
          class="btn-back"
          @click="goBack"
          title="Quay lại"
        />
        <h1 class="page-title">Danh mục thành phần lương của hệ thống</h1>
      </div>
    </div>

    <!-- Content Card -->
    <div class="page-content d-flex flex-column flex-grow-1 overflow-hidden bg-white rounded-1">
      <!-- Filter Section -->
      <div class="page-filter d-flex align-items-center justify-content-between flex-shrink-0 bg-white">
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
          <!-- Tất cả loại thành phần -->
          <MsSelect
            v-model="selectedType"
            :options="typeOptions"
            placeholder="Tất cả loại thành phần"
            size="small"
            :no-scroll="true"
            class="filter-type-select"
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

      <!-- Table Section -->
      <BaseDataGrid
        ref="dataGridRef"
        :data-source="systemCategories"
        :columns="tableColumns"
        key-expr="salaryCompositionSystemId"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-records="totalRecords"
        :page-size-options="pageSizeSelectOptions"
        :selectable="true"
        :show-actions="true"
        :action-buttons="actionButtons"
        :action-column-width="50"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseDataGrid from '@/components/bases/data/BaseDataGrid.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'

const router = useRouter()

const searchText = ref('')
const selectedType = ref(null)

// Filter options
const typeOptions = [
  { value: null, label: 'Tất cả loại thành phần' },
  { value: 'employee_info', label: 'Thông tin nhân viên' },
  { value: 'attendance', label: 'Chấm công' },
  { value: 'revenue', label: 'Doanh số' },
  { value: 'kpi', label: 'KPI' },
  { value: 'product', label: 'Sản phẩm' },
  { value: 'salary', label: 'Lương' },
  { value: 'pit', label: 'Thuế TNCN' },
  { value: 'insurance_union', label: 'Bảo hiểm - Công đoàn' },
  { value: 'other', label: 'Khác' }
]

// Table columns - 12 cột
const tableColumns = [
  { dataField: 'salaryCompositionSystemCode', caption: 'Mã thành phần', width: 150, minWidth: 120 },
  { dataField: 'salaryCompositionSystemName', caption: 'Tên thành phần', width: 200, minWidth: 150 },
  { dataField: 'unitApply', caption: 'Đơn vị áp dụng', width: 150, minWidth: 120 },
  { dataField: 'salaryCompositionSystemType', caption: 'Loại thành phần', width: 150, minWidth: 120 },
  { dataField: 'salaryCompositionSystemNature', caption: 'Tính chất', width: 120, minWidth: 100 },
  { dataField: 'taxable', caption: 'Chịu thuế', width: 120, minWidth: 100 },
  { dataField: 'taxDeduction', caption: 'Giảm trừ khi tính thuế', width: 180, minWidth: 150 },
  { dataField: 'quota', caption: 'Định mức', width: 120, minWidth: 100 },
  { dataField: 'salaryCompositionSystemValueType', caption: 'Kiểu giá trị', width: 120, minWidth: 100 },
  { dataField: 'value', caption: 'Giá trị', width: 120, minWidth: 100 },
  { dataField: 'salaryCompositionSystemDescription', caption: 'Mô tả', width: 200, minWidth: 150 },
  { dataField: 'showOnPayslip', caption: 'Hiển thị trên phiếu lương', width: 180, minWidth: 150 }
]

// Action buttons - chỉ 1 nút thêm
const actionButtons = [
  { name: 'add', title: 'Đưa vào danh sách sử dụng', icon: 'icon-mi-plus-primary' }
]

// Pagination
const currentPage = ref(1)
const pageSize = ref(15)
const totalRecords = ref(0)

const pageSizeSelectOptions = [
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
]

// Mock data - 2 hàng dữ liệu mẫu
const systemCategories = ref([
  {
    salaryCompositionSystemId: '1',
    salaryCompositionSystemCode: 'LUONG_CO_BAN',
    salaryCompositionSystemName: 'Lương cơ bản',
    unitApply: 'Tất cả đơn vị',
    salaryCompositionSystemType: 'Lương',
    salaryCompositionSystemNature: 'Thu nhập',
    taxable: 'Có',
    taxDeduction: 'Không',
    quota: '',
    salaryCompositionSystemValueType: 'Tiền tệ',
    value: '',
    salaryCompositionSystemDescription: 'Lương cơ bản theo hợp đồng',
    showOnPayslip: 'Có'
  },
  {
    salaryCompositionSystemId: '2',
    salaryCompositionSystemCode: 'PHU_CAP_AN_TRUA',
    salaryCompositionSystemName: 'Phụ cấp ăn trưa',
    unitApply: 'Tất cả đơn vị',
    salaryCompositionSystemType: 'Lương',
    salaryCompositionSystemNature: 'Thu nhập',
    taxable: 'Không',
    taxDeduction: 'Có',
    quota: '730.000',
    salaryCompositionSystemValueType: 'Tiền tệ',
    value: '730.000',
    salaryCompositionSystemDescription: 'Phụ cấp ăn trưa hàng tháng',
    showOnPayslip: 'Có'
  }
])

totalRecords.value = systemCategories.value.length

const goBack = () => {
  router.push('/payroll/salarycomposition')
}
</script>

<style scoped>
/* Page Container */
.system-category-page {
  padding: 22px 24px 16px 24px;
  height: calc(100vh - 48px);
}

/* Header Section */
.page-header {
  padding: 0 0 16px 0;
}

/* Back Button */
.btn-back {
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  letter-spacing: 0.384px;
  line-height: 30px;
  margin: 0;
}

/* Content Card */
.page-content {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Filter Section */
.page-filter {
  padding: 0 16px;
  height: 64px;
}

/* Search Input */
.filter-search {
  width: 240px;
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
.filter-type-select :deep(.ms-select) {
  width: 200px;
  border: none;
  background: transparent;
}

.filter-type-select :deep(.ms-select:hover) {
  background: #f5f5f5;
}

/* Filter/Setting Buttons */
.filter-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
}
</style>
