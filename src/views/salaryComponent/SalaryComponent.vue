<template>
  <div class="salary-page d-flex flex-column overflow-hidden">
    <!-- Form View -->
    <SalaryComponentForm
      v-if="showForm"
      :mode="formMode"
      :edit-id="editId"
      @back="onFormBack"
      @saved="onFormSaved"
      @deleted="onFormDeleted"
    />

    <!-- List View -->
    <template v-else>
      <!-- Header Section (nằm ngoài card) -->
      <div class="salary-header d-flex justify-content-between align-items-center flex-shrink-0">
        <h1 class="salary-title">Thành phần lương</h1>
        <div class="salary-toolbar d-flex align-items-center gap-2">
          <!-- Thiết lập công thức button -->
          <MsButton
            label="Danh mục của hệ thống"
            icon="icon-mi-rule"
            variant="outline"
            @click="goToSystemCategory"
          />
          <!-- Thêm mới button -->
          <div class="btn-group d-flex" v-click-outside="closeDropdown">
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
              @click="toggleDropdown"
            />
            <!-- Dropdown menu -->
            <div v-if="showDropdown" class="btn-group-dropdown">
              <div class="dropdown-item" @click="openSystemCategoryPopup">
                Chọn từ danh mục của hệ thống
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Card with Filter Panel -->
      <div class="salary-content-wrapper d-flex flex-grow-1 overflow-hidden">
        <!-- Main Content -->
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
                @keyup.enter="onSearch"
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
                key-expr="organizationId"
                display-expr="organizationName"
                placeholder="Tất cả đơn vị"
                :max-selected-labels="1"
                class="filter-unit-tree"
              />

              <!-- Filter Button -->
              <MsButton
                icon="icon-mi-filter"
                variant="text"
                class="filter-btn"
                :class="{ 'filter-btn-active': showFilterPanel }"
                title="Bộ lọc"
                icon-hover
                @click="toggleFilterPanel"
              />

              <!-- Column Config Button -->
              <MsColumnConfig
                :columns="tableColumns"
                :default-columns="defaultColumns"
                storage-key="salary-component-columns"
                :pinned-column="pinnedColumn"
                @update:columns="onColumnsChange"
                @config-loaded="onConfigLoaded"
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
              v-if="showBulkStopButton"
              label="Ngừng theo dõi"
              icon="icon-mi-circle-minus-yellow"
              variant="outline"
              class="btn-action btn-stop"
              @click="onBulkStop"
            />
            <MsButton
              v-if="showBulkActiveButton"
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
        ref="dataGridRef"
        :key="gridKey"
        :data-source="salaryComponents"
        :columns="visibleColumns"
        key-expr="salaryCompositionId"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-records="totalRecords"
        :page-size-options="pageSizeSelectOptions"
        :action-buttons="actionButtons"
        @selection-changed="onSelectionChanged"
        @action="onAction"
        @column-pinned="onColumnPinned"
        @column-resized="onColumnResized"
      >
        <!-- Status column template -->
        <template #statusTemplate="{ data }">
          <div class="status-cell">
            <div class="status-indicator" :class="data.data.salaryCompositionStatus === 'Đang theo dõi' ? 'active' : 'inactive'"></div>
            <span class="status-text" :class="data.data.salaryCompositionStatus === 'Đang theo dõi' ? 'active' : 'inactive'">
              {{ data.data.salaryCompositionStatus }}
            </span>
          </div>
        </template>
        <!-- Value (formula) column template -->
        <template #valueTemplate="{ data }">
          <MsFormulaCell :value="data.data.value" />
        </template>
      </BaseDataGrid>
    </div>

        <!-- Filter Panel -->
        <MsFilterPanel
          v-model="showFilterPanel"
          title="Bộ lọc"
          :show-search="true"
          @search="onFilterSearch"
          @clear="onClearFilter"
          @apply="onApplyFilter"
        >
          <MsFilterCheckbox
            v-for="key in filteredFilterColumns"
            :key="key"
            v-model="filterColumns[key].checked"
            v-model:condition="filterColumns[key].condition"
            v-model:value="filterColumns[key].value"
            :label="filterColumnLabels[key]"
            :type="filterColumnConfig[key]?.type || 'input'"
            :value-options="filterColumnConfig[key]?.options || []"
          />
        </MsFilterPanel>
      </div>
    </template>
  </div>

  <!-- Delete Confirmation Dialog (single item) -->
  <MsConfirmDialog
    v-model="showDeleteDialog"
    title="Thông báo"
    :message="`Bạn có chắc chắn muốn xóa thành phần lương <strong>${deleteTarget?.salaryCompositionName || ''}</strong> không?`"
    confirm-text="Xóa"
    cancel-text="Hủy"
    confirm-variant="danger"
    :loading="isDeleting"
    @confirm="confirmDelete"
  />

  <!-- Cannot Delete Default Item Dialog -->
  <MsConfirmDialog
    v-model="showCannotDeleteDialog"
    title="Thông báo"
    message="Đây là thành phần lương mặc định của hệ thống nên không thể xóa. Vui lòng kiểm tra lại."
    cancel-text="Đóng"
    :show-confirm="false"
  />

  <!-- Bulk Delete Confirmation Dialog -->
  <MsConfirmDialog
    v-model="showBulkDeleteDialog"
    :title="bulkDeleteDialogTitle"
    :message="bulkDeleteDialogMessage"
    :confirm-text="bulkDeleteConfirmText"
    :cancel-text="bulkDeleteCancelText"
    :confirm-variant="bulkDeleteConfirmVariant"
    :show-confirm="bulkDeleteShowConfirm"
    :loading="isDeleting"
    @confirm="confirmBulkDelete"
  />

  <!-- Status Change Confirmation Dialog -->
  <MsConfirmDialog
    v-model="showStatusDialog"
    title="Chuyển trạng thái"
    :message="statusDialogMessage"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    confirm-variant="primary"
    :loading="isChangingStatus"
    @confirm="confirmStatusChange"
  />

  <!-- System Salary Category Popup -->
  <SystemSalaryCategoryPopup
    v-model="showSystemCategoryPopup"
    @added="onSystemCategoryAdded"
  />
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseDataGrid from '@/components/bases/data/BaseDataGrid.vue'
import MsTree from '@/components/bases/data/MsTree.vue'
import MsFormulaCell from '@/components/bases/data/MsFormulaCell.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import MsConfirmDialog from '@/components/bases/ui/MsConfirmDialog.vue'
import MsColumnConfig from '@/components/bases/ui/MsColumnConfig.vue'
import MsFilterPanel from '@/components/bases/ui/MsFilterPanel.vue'
import MsFilterCheckbox from '@/components/bases/form/MsFilterCheckbox.vue'
import SalaryComponentForm from '@/views/salaryComponent/SalaryComponentForm.vue'
import SystemSalaryCategoryPopup from '@/views/salaryComponent/SystemSalaryCategoryPopup.vue'
import salaryCompositionApi from '@/api/salary-composition.api'
import { useOrganization, useToast, useGridConfig } from '@/composables'

const GRID_CONFIG_KEY = 'salary-component-columns'

const router = useRouter()
const { tree: unitTreeData, fetchTree, flatList: orgFlatList } = useOrganization()
const toast = useToast()
const { saveConfig } = useGridConfig(GRID_CONFIG_KEY)

// Form toggle state
const showForm = ref(false)
const formMode = ref('add')
const editId = ref(null)

const searchText = ref('')
const selectedRows = ref([])

// Filter panel state
const showFilterPanel = ref(false)
const filterSearchText = ref('')
const filterColumns = ref({
  salaryCompositionCode: { checked: false, condition: 'contains', value: '' },
  salaryCompositionName: { checked: false, condition: 'contains', value: '' },
  salaryCompositionType: { checked: false, condition: 'equals', value: '' },
  salaryCompositionNature: { checked: false, condition: 'equals', value: '' },
  isTaxable: { checked: false, condition: 'equals', value: '' },
  isTaxDeductible: { checked: false, condition: 'equals', value: '' },
  quota: { checked: false, condition: 'contains', value: '' },
  valueType: { checked: false, condition: 'equals', value: '' },
  value: { checked: false, condition: 'contains', value: '' },
  description: { checked: false, condition: 'contains', value: '' },
  showOnPayslip: { checked: false, condition: 'equals', value: '' },
  salaryCompositionSource: { checked: false, condition: 'equals', value: '' }
})

const filterColumnLabels = {
  salaryCompositionCode: 'Mã thành phần',
  salaryCompositionName: 'Tên thành phần',
  salaryCompositionType: 'Loại thành phần',
  salaryCompositionNature: 'Tính chất',
  isTaxable: 'Chịu thuế',
  isTaxDeductible: 'Giảm trừ khi tính thuế',
  quota: 'Định mức',
  valueType: 'Kiểu giá trị',
  value: 'Giá trị',
  description: 'Mô tả',
  showOnPayslip: 'Hiển thị trên phiếu lương',
  salaryCompositionSource: 'Nguồn tạo'
}

const filterColumnConfig = {
  salaryCompositionCode: { type: 'input' },
  salaryCompositionName: { type: 'input' },
  salaryCompositionType: {
    type: 'select',
    options: [
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
  },
  salaryCompositionNature: {
    type: 'select',
    options: [
      { value: 'income', label: 'Thu nhập' },
      { value: 'deduction', label: 'Khấu trừ' },
      { value: 'other', label: 'Khác' }
    ]
  },
  isTaxable: {
    type: 'select',
    options: [
      { value: 'true', label: 'Có' },
      { value: 'false', label: 'Không' }
    ]
  },
  isTaxDeductible: {
    type: 'select',
    options: [
      { value: 'true', label: 'Có' },
      { value: 'false', label: 'Không' }
    ]
  },
  quota: { type: 'input' },
  valueType: {
    type: 'select',
    options: [
      { value: 'number', label: 'Số' },
      { value: 'currency', label: 'Tiền tệ' },
      { value: 'percent', label: 'Phần trăm' },
      { value: 'text', label: 'Chữ' },
      { value: 'date', label: 'Ngày' }
    ]
  },
  value: { type: 'input' },
  description: { type: 'input' },
  showOnPayslip: {
    type: 'select',
    options: [
      { value: 'true', label: 'Có' },
      { value: 'false', label: 'Không' }
    ]
  },
  salaryCompositionSource: {
    type: 'select',
    options: [
      { value: 'manual', label: 'Tự thêm' },
      { value: 'system', label: 'Hệ thống' }
    ]
  }
}

const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value
}

const onFilterSearch = (val) => {
  filterSearchText.value = val
}

const filteredFilterColumns = computed(() => {
  if (!filterSearchText.value) {
    return Object.keys(filterColumns.value)
  }
  const searchLower = filterSearchText.value.toLowerCase()
  return Object.keys(filterColumns.value).filter(key => {
    const label = filterColumnLabels[key] || ''
    return label.toLowerCase().includes(searchLower)
  })
})

const onClearFilter = () => {
  Object.keys(filterColumns.value).forEach(key => {
    const defaultCondition = filterColumnConfig[key]?.type === 'select' ? 'equals' : 'contains'
    filterColumns.value[key] = { checked: false, condition: defaultCondition, value: '' }
  })
  currentPage.value = 1
  fetchSalaryComponents()
}

/** Xây dựng object filters từ filterColumns để gửi lên API */
const buildFiltersFromColumns = () => {
  const filters = {}
  
  // Map key trong filterColumns sang key API
  const keyMapping = {
    salaryCompositionCode: 'salaryCompositionCode',
    salaryCompositionName: 'salaryCompositionName',
    salaryCompositionType: 'salaryCompositionType',
    salaryCompositionNature: 'salaryCompositionNature',
    isTaxable: 'isTaxable',
    isTaxDeductible: 'isTaxDeductible',
    quota: 'quota',
    valueType: 'valueType',
    value: 'value',
    description: 'description',
    showOnPayslip: 'showOnPayslip',
    salaryCompositionSource: 'source'
  }
  
  Object.keys(filterColumns.value).forEach(key => {
    const col = filterColumns.value[key]
    if (col.checked) {
      const apiKey = keyMapping[key]
      if (apiKey) {
        // Nếu condition là empty/notEmpty thì không cần value
        if (col.condition === 'empty' || col.condition === 'notEmpty') {
          filters[apiKey] = {
            condition: col.condition,
            value: ''
          }
        } else if (col.value !== '' && col.value !== null && col.value !== undefined) {
          filters[apiKey] = {
            condition: col.condition,
            value: col.value
          }
        }
      }
    }
  })
  
  return Object.keys(filters).length > 0 ? filters : null
}

const onApplyFilter = () => {
  currentPage.value = 1
  fetchSalaryComponents()
}
const loading = ref(false)
const dataGridRef = ref(null)
const showDropdown = ref(false)
const showSystemCategoryPopup = ref(false)

// Delete confirmation dialog state
const showDeleteDialog = ref(false)
const deleteTarget = ref(null)
const isDeleting = ref(false)

// Dialog thông báo không thể xóa thành phần mặc định (xóa đơn lẻ)
const showCannotDeleteDialog = ref(false)

// Bulk delete confirmation dialog state
const showBulkDeleteDialog = ref(false)
const bulkDeleteType = ref(null) // 'all_manual', 'all_system', 'mixed'

const bulkDeleteDialogTitle = computed(() => {
  if (bulkDeleteType.value === 'all_system') return 'Thông báo'
  if (bulkDeleteType.value === 'mixed') return 'Xóa thành phần lương'
  return 'Thông báo'
})

const bulkDeleteDialogMessage = computed(() => {
  if (bulkDeleteType.value === 'all_system') {
    return 'Đây là các thành phần lương mặc định của hệ thống nên không thể xóa. Vui lòng kiểm tra lại.'
  }
  if (bulkDeleteType.value === 'mixed') {
    const systemItems = selectedRows.value.filter(r => r.salaryCompositionSource === 'Mặc định')
    const names = systemItems.map(r => r.salaryCompositionName).join(', ')
    return `<strong>${names}</strong> là giá trị mặc định của hệ thống nên không thể xóa.<br/>Bạn có muốn xóa các thành phần lương còn lại không?`
  }
  const count = selectedRows.value.length
  const plural = count > 1 ? 'các ' : ''
  return `Bạn có chắc chắn muốn xóa ${plural}thành phần lương đã chọn không?`
})

const bulkDeleteConfirmText = computed(() => {
  if (bulkDeleteType.value === 'all_system') return ''
  return 'Xóa'
})

const bulkDeleteCancelText = computed(() => {
  if (bulkDeleteType.value === 'all_system') return 'Đóng'
  if (bulkDeleteType.value === 'mixed') return 'Đóng'
  return 'Hủy'
})

const bulkDeleteConfirmVariant = computed(() => {
  return 'danger'
})

const bulkDeleteShowConfirm = computed(() => {
  return bulkDeleteType.value !== 'all_system'
})

// Status change confirmation dialog state
const showStatusDialog = ref(false)
const statusChangeTarget = ref(null)
const statusChangeType = ref(null) // 'stop' or 'active'
const isChangingStatus = ref(false)
const isBulkStatusChange = ref(false)

const statusDialogMessage = computed(() => {
  const targetStatus = statusChangeType.value === 'stop' ? 'ngừng theo dõi' : 'đang theo dõi'
  if (isBulkStatusChange.value) {
    const count = statusChangeTarget.value?.length || 0
    const plural = count > 1 ? 'các ' : ''
    return `Bạn có chắc chắn muốn chuyển trạng thái ${plural}thành phần lương đã chọn sang ${targetStatus} không?`
  }
  return `Bạn có chắc chắn muốn chuyển trạng thái thành phần lương <strong>${statusChangeTarget.value?.salaryCompositionName || ''}</strong> sang ${targetStatus} không?`
})

const showBulkStopButton = computed(() => {
  if (selectedRows.value.length === 0) return false
  return selectedRows.value.some(row => row.salaryCompositionStatus === 'Đang theo dõi')
})

const showBulkActiveButton = computed(() => {
  if (selectedRows.value.length === 0) return false
  return selectedRows.value.some(row => row.salaryCompositionStatus === 'Ngừng theo dõi')
})

// Filter state
const selectedStatus = ref(null)
const selectedUnits = ref([])

const statusOptions = [
  { value: null, label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang theo dõi' },
  { value: 'inactive', label: 'Ngừng theo dõi' }
]

// Table columns configuration
const defaultColumns = [
  { dataField: 'salaryCompositionCode', caption: 'Mã thành phần', width: 250, minWidth: 120, visible: true },
  { dataField: 'salaryCompositionName', caption: 'Tên thành phần', width: 250, minWidth: 200, visible: true },
  { dataField: 'unit', caption: 'Đơn vị áp dụng', width: 250, minWidth: 120, visible: true },
  { dataField: 'salaryCompositionType', caption: 'Loại thành phần', width: 250, minWidth: 120, visible: true },
  { dataField: 'salaryCompositionNature', caption: 'Tính chất', width: 150, minWidth: 100, visible: true },
  { dataField: 'taxable', caption: 'Chịu thuế', width: 200, minWidth: 100, visible: true },
  { dataField: 'taxDeduction', caption: 'Giảm trừ khi tính thuế', width: 180, minWidth: 150, visible: true },
  { dataField: 'salaryCompositionQuota', caption: 'Định mức', width: 120, minWidth: 100, visible: true },
  { dataField: 'salaryCompositionValueType', caption: 'Kiểu giá trị', width: 120, minWidth: 100, visible: true },
  { dataField: 'value', caption: 'Giá trị', width: 120, minWidth: 100, cellTemplate: 'valueTemplate', visible: true },
  { dataField: 'salaryCompositionDescription', caption: 'Mô tả', width: 200, minWidth: 150, visible: true },
  { dataField: 'showOnPayslip', caption: 'Hiển thị trên phiếu lương', width: 200, minWidth: 150, visible: true },
  { dataField: 'salaryCompositionSource', caption: 'Nguồn tạo', width: 120, minWidth: 100, visible: true },
  { dataField: 'salaryCompositionStatus', caption: 'Trạng thái', width: 150, minWidth: 120, cellTemplate: 'statusTemplate', visible: true }
]

/** Tải cấu hình cột đã lưu từ localStorage */
const loadSavedColumns = () => {
  const saved = localStorage.getItem('salary-component-columns')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return defaultColumns
    }
  }
  return defaultColumns
}

const tableColumns = ref(loadSavedColumns())
const pinnedColumn = ref(null)

const visibleColumns = computed(() => tableColumns.value.filter(c => c.visible !== false))

const gridKey = computed(() => tableColumns.value.map(c => c.dataField).join('-'))

/** Xử lý sự kiện thay đổi cột */
const onColumnsChange = (newColumns) => {
  tableColumns.value = newColumns
}

/** Xử lý khi cấu hình cột được tải */
const onConfigLoaded = (loadedColumns) => {
  tableColumns.value = loadedColumns
  const pinned = loadedColumns.find(c => c.isPinned)
  if (pinned) {
    pinnedColumn.value = pinned.dataField
    // Set pinned column in grid after it's mounted
    nextTick(() => {
      dataGridRef.value?.setPinnedColumn(pinned.dataField)
    })
  }
}

/** Xử lý ghim cột và lưu vào server */
const onColumnPinned = async (dataField) => {
  pinnedColumn.value = dataField
  try {
    await saveConfig(tableColumns.value, dataField)
  } catch (err) {
    console.error('Failed to save pinned column:', err)
  }
}

/** Xử lý thay đổi kích thước cột và lưu vào server */
const onColumnResized = async ({ dataField, width }) => {
  // Update local state
  const col = tableColumns.value.find(c => c.dataField === dataField)
  if (col) {
    col.width = width
  }
  try {
    await saveConfig(tableColumns.value, pinnedColumn.value)
  } catch (err) {
    console.error('Failed to save column width:', err)
  }
}

// Pagination state
const currentPage = ref(1)
const pageSize = ref(25)
const totalRecords = ref(179)

const pageSizeSelectOptions = [
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
]

const salaryComponents = ref([])

// Map loại thành phần
const typeMap = {
  employee_info: 'Thông tin nhân viên',
  attendance: 'Chấm công',
  revenue: 'Doanh số',
  kpi: 'KPI',
  product: 'Sản phẩm',
  salary: 'Lương',
  pit: 'Thuế TNCN',
  insurance_union: 'Bảo hiểm - Công đoàn',
  other: 'Khác'
}

// Map tính chất
const propertyMap = {
  income: 'Thu nhập',
  deduction: 'Khấu trừ',
  other: 'Khác'
}

// Map tùy chọn thuế
const taxOptionMap = {
  taxable: 'Chịu thuế',
  tax_exempt_full: 'Miễn thuế toàn phần',
  tax_exempt_partial: 'Miễn thuế một phần'
}

// Map hiển thị trên phiếu lương
const showOnPayslipMap = {
  yes: 'Có',
  no: 'Không',
  if_not_zero: 'Chỉ hiển thị nếu giá trị khác 0'
}

// Map nguồn tạo
const sourceMap = {
  manual: 'Tự thêm',
  system: 'Mặc định'
}

// Map trạng thái
const statusMap = {
  1: 'Đang theo dõi',
  0: 'Ngừng theo dõi'
}

// Action buttons configuration with dynamic icon/title
const actionButtons = [
  {
    name: 'stop',
    title: (row) => row.salaryCompositionStatus === 'Đang theo dõi' ? 'Ngừng theo dõi' : 'Đang theo dõi',
    icon: (row) => row.salaryCompositionStatus === 'Đang theo dõi' ? 'icon-mi-circle-minus-yellow' : 'icon-mi-circle-check-green'
  },
  { name: 'duplicate', title: 'Nhân bản', icon: 'icon-mi-copy' },
  { name: 'edit', title: 'Sửa', icon: 'icon-mi-pencil' },
  { name: 'delete', title: 'Xóa', icon: 'icon-mi-trash-red' }
]

// Map kiểu giá trị
const valueTypeMap = {
  number: 'Số',
  currency: 'Tiền tệ',
  percent: 'Phần trăm',
  text: 'Chữ',
  date: 'Ngày'
}

/** Lấy tên đơn vị hiển thị theo kiểu MsTree */
const getUnitDisplayNames = (unitIds) => {
  if (!unitIds || unitIds.length === 0 || !orgFlatList.value?.length) {
    return ''
  }

  const ids = new Set(unitIds.map(x => String(x)))
  const byId = new Map()
  const childrenByParent = new Map()

  for (const raw of orgFlatList.value) {
    const idStr = String(raw.organizationId)
    const parentIdStr = raw.parentId == null ? null : String(raw.parentId)
    const nameStr = String(raw.organizationName ?? '')
    byId.set(idStr, { id: idStr, name: nameStr, parentId: parentIdStr })
    if (!childrenByParent.has(parentIdStr)) childrenByParent.set(parentIdStr, [])
    childrenByParent.get(parentIdStr).push(idStr)
  }

  // Tìm các cha mà tất cả con đều được chọn
  const parentsToDisplay = new Set()
  childrenByParent.forEach((childIds, parentId) => {
    if (parentId == null) return
    if (!childIds || childIds.length === 0) return
    const parentSelected = ids.has(parentId)
    const allChildrenSelected = childIds.every((cid) => ids.has(cid))
    if (parentSelected || allChildrenSelected) parentsToDisplay.add(parentId)
  })

  // Kiểm tra tổ tiên
  function hasAncestorInSet(nodeId, set) {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (set.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }

  // Lấy các cha cao nhất (không có tổ tiên trong set)
  const effectiveParents = new Set()
  parentsToDisplay.forEach((pid) => {
    if (!hasAncestorInSet(pid, parentsToDisplay)) effectiveParents.add(pid)
  })

  // Kiểm tra node có được bao phủ bởi cha không
  function isCoveredByDisplayedParent(nodeId) {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (effectiveParents.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }

  // Tập hợp các id cần hiển thị
  const displayIds = new Set()
  effectiveParents.forEach((pid) => displayIds.add(pid))
  ids.forEach((sid) => {
    if (!isCoveredByDisplayedParent(sid) && !displayIds.has(sid)) displayIds.add(sid)
  })

  // Lấy tên theo thứ tự trong flatList
  const result = []
  for (const raw of orgFlatList.value) {
    const idStr = String(raw.organizationId)
    if (displayIds.has(idStr)) result.push(String(raw.organizationName ?? ''))
  }
  return result.join(', ')
}

/** Chuyển đổi dữ liệu để hiển thị */
const mapDataForDisplay = (data) => {
  return data.map(item => ({
    ...item,
    unit: getUnitDisplayNames(item.organizationIds),
    salaryCompositionType: typeMap[item.salaryCompositionType] || item.salaryCompositionType,
    salaryCompositionNature: propertyMap[item.salaryCompositionNature] || item.salaryCompositionNature,
    taxable: item.salaryCompositionTaxOption ? (taxOptionMap[item.salaryCompositionTaxOption] || item.salaryCompositionTaxOption) : '-',
    taxDeduction: item.salaryCompositionTaxDeduction ? 'Có' : '-',
    salaryCompositionQuota: item.salaryCompositionQuota || '',
    salaryCompositionValueType: valueTypeMap[item.salaryCompositionValueType] || item.salaryCompositionValueType || '',
    value: item.salaryCompositionValueFormula || '-',
    salaryCompositionDescription: item.salaryCompositionDescription || '',
    showOnPayslip: showOnPayslipMap[item.salaryCompositionShowOnPayslip] || item.salaryCompositionShowOnPayslip || '',
    salaryCompositionSource: sourceMap[item.salaryCompositionSource] || item.salaryCompositionSource || '',
    salaryCompositionStatus: statusMap[item.salaryCompositionStatus] ?? item.salaryCompositionStatus
  }))
}

/** Lấy danh sách thành phần lương từ API */
const fetchSalaryComponents = async () => {
  loading.value = true
  try {
    // Map status filter value to API format
    let statusValue = null
    if (selectedStatus.value === 'active') statusValue = 1
    else if (selectedStatus.value === 'inactive') statusValue = 0

    const result = await salaryCompositionApi.getPaged({
      pageNumber: currentPage.value,
      pageSize: pageSize.value,
      searchText: searchText.value || '',
      status: statusValue,
      organizationIds: selectedUnits.value?.length ? selectedUnits.value : null,
      filters: buildFiltersFromColumns()
    })
    salaryComponents.value = mapDataForDisplay(result.data)
    totalRecords.value = result.totalRecords
  } catch (error) {
    console.error('Error fetching salary components:', error)
  } finally {
    loading.value = false
  }
}

/** Xử lý tìm kiếm */
const onSearch = () => {
  currentPage.value = 1
  fetchSalaryComponents()
}

// Watch for filter changes to refetch data

watch([currentPage, pageSize], () => {
  fetchSalaryComponents()
})

watch([selectedStatus, selectedUnits], () => {
  currentPage.value = 1
  fetchSalaryComponents()
}, { deep: true })

onMounted(async () => {
  await fetchTree()
  await fetchSalaryComponents()
})

/** Xử lý khi thay đổi lựa chọn các dòng */
const onSelectionChanged = (rows) => {
  selectedRows.value = rows
  console.log('Selected rows:', rows)
}

/** Xóa lựa chọn các dòng */
const clearSelection = () => {
  selectedRows.value = []
  dataGridRef.value?.clearSelection()
}

/** Xử lý ngừng theo dõi hàng loạt */
const onBulkStop = () => {
  if (selectedRows.value.length === 0) return
  statusChangeTarget.value = [...selectedRows.value]
  statusChangeType.value = 'stop'
  isBulkStatusChange.value = true
  showStatusDialog.value = true
}

/** Xử lý kích hoạt theo dõi hàng loạt */
const onBulkActive = () => {
  if (selectedRows.value.length === 0) return
  statusChangeTarget.value = [...selectedRows.value]
  statusChangeType.value = 'active'
  isBulkStatusChange.value = true
  showStatusDialog.value = true
}

/** Xử lý thay đổi trạng thái đơn lẻ */
const onSingleStatusChange = (data, type) => {
  statusChangeTarget.value = data
  statusChangeType.value = type
  isBulkStatusChange.value = false
  showStatusDialog.value = true
}

/** Xác nhận thay đổi trạng thái */
const confirmStatusChange = async () => {
  isChangingStatus.value = true
  const status = statusChangeType.value === 'stop' ? 0 : 1

  try {
    if (isBulkStatusChange.value) {
      const ids = statusChangeTarget.value.map(r => r.salaryCompositionId)
      await salaryCompositionApi.bulkUpdateStatus(ids, status)
      clearSelection()
    } else {
      await salaryCompositionApi.updateStatus(statusChangeTarget.value.salaryCompositionId, status)
    }
    toast.success('Chuyển trạng thái thành công')
    showStatusDialog.value = false
    statusChangeTarget.value = null
    statusChangeType.value = null
    await fetchSalaryComponents()
  } catch (error) {
    console.error('Error changing status:', error)
    toast.error('Có lỗi xảy ra')
  } finally {
    isChangingStatus.value = false
  }
}

/** Xử lý xóa hàng loạt */
const onBulkDelete = () => {
  if (selectedRows.value.length === 0) return

  const hasSystem = selectedRows.value.some(r => r.salaryCompositionSource === 'Mặc định')
  const hasManual = selectedRows.value.some(r => r.salaryCompositionSource === 'Tự thêm')

  if (hasSystem && hasManual) {
    bulkDeleteType.value = 'mixed'
  } else if (hasSystem) {
    bulkDeleteType.value = 'all_system'
  } else {
    bulkDeleteType.value = 'all_manual'
  }

  showBulkDeleteDialog.value = true
}

/** Xác nhận xóa hàng loạt */
const confirmBulkDelete = async () => {
  isDeleting.value = true

  try {
    const itemsToDelete = selectedRows.value.filter(r => r.salaryCompositionSource === 'Tự thêm')

    if (itemsToDelete.length === 0) {
      showBulkDeleteDialog.value = false
      return
    }

    const deletePromises = itemsToDelete.map(row => salaryCompositionApi.delete(row.salaryCompositionId))
    await Promise.all(deletePromises)
    toast.success('Xóa thành công')
    showBulkDeleteDialog.value = false
    clearSelection()
    await fetchSalaryComponents()
  } catch (error) {
    console.error('Error deleting salary components:', error)
    toast.error('Có lỗi xảy ra')
  } finally {
    isDeleting.value = false
  }
}

/** Xử lý các hành động trên dòng (sửa, nhân bản, xóa, ngừng theo dõi) */
const onAction = async ({ action, data }) => {
  if (action === 'edit') {
    formMode.value = 'edit'
    editId.value = data.salaryCompositionId
    showForm.value = true
  } else if (action === 'duplicate') {
    formMode.value = 'duplicate'
    editId.value = data.salaryCompositionId
    showForm.value = true
  } else if (action === 'delete') {
    // Kiểm tra nếu là thành phần mặc định thì hiển thị dialog thông báo
    if (data.salaryCompositionSource === 'Mặc định') {
      showCannotDeleteDialog.value = true
      return
    }
    deleteTarget.value = data
    showDeleteDialog.value = true
  } else if (action === 'stop') {
    const type = data.salaryCompositionStatus === 'Đang theo dõi' ? 'stop' : 'active'
    onSingleStatusChange(data, type)
  }
}

/** Xác nhận xóa đơn lẻ */
const confirmDelete = async () => {
  if (!deleteTarget.value) return

  isDeleting.value = true
  try {
    await salaryCompositionApi.delete(deleteTarget.value.salaryCompositionId)
    toast.success('Xóa thành công')
    showDeleteDialog.value = false
    deleteTarget.value = null
    await fetchSalaryComponents()
  } catch (error) {
    console.error('Error deleting salary component:', error)
    toast.error('Có lỗi xảy ra')
  } finally {
    isDeleting.value = false
  }
}

/** Chuyển đến form thêm mới */
const goToAddForm = () => {
  formMode.value = 'add'
  editId.value = null
  showForm.value = true
}

/** Xử lý khi quay lại từ form */
const onFormBack = async (payload) => {
  if (payload?.action === 'duplicate') {
    // Force remount form by hiding then showing
    showForm.value = false
    await nextTick()
    formMode.value = 'duplicate'
    editId.value = payload.id
    showForm.value = true
  } else {
    showForm.value = false
    formMode.value = 'add'
    editId.value = null
  }
}

/** Xử lý khi lưu form thành công */
const onFormSaved = async () => {
  await fetchSalaryComponents()
}

/** Xử lý khi xóa từ form thành công */
const onFormDeleted = async () => {
  await fetchSalaryComponents()
}

/** Chuyển đến trang danh mục hệ thống */
const goToSystemCategory = () => {
  router.push('/payroll/salarycomposition/system-category')
}

/** Mở popup chọn từ danh mục hệ thống */
const openSystemCategoryPopup = () => {
  showDropdown.value = false
  showSystemCategoryPopup.value = true
}

/** Xử lý khi thêm thành công từ danh mục hệ thống */
const onSystemCategoryAdded = async () => {
  await fetchSalaryComponents()
}

/** Bật/tắt dropdown */
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

/** Đóng dropdown */
const closeDropdown = () => {
  showDropdown.value = false
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
.salary-content-wrapper {
  gap: 0;
}

.salary-component {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  min-width: 0;
}

/* Button Group Styling */
.btn-group {
  position: relative;
}

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

/* Dropdown Menu */
.btn-group-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 8px 6px;
  min-width: 200px;
  z-index: 100;
}

.btn-group-dropdown .dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #212121;
  white-space: nowrap;
}

.btn-group-dropdown .dropdown-item:hover {
  background: #eafbf2;
}

/* Filter Section */
.salary-filter {
  padding: 0 16px;
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

.filter-btn-active :deep(.ms-btn) {
  background: #eafbf2;
  border-color: #34b057;
}

/* Selection Toolbar */
.selection-toolbar {
  padding: 16px 16px 12px 16px;
  height: 64px;
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
