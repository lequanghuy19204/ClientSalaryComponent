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
        <!-- Selection Bar - hiển thị khi có item được chọn -->
        <template v-if="selectedItems.length > 0">
          <div class="selection-bar d-flex align-items-center">
            <div class="d-flex align-items-center">
              <span>Đã chọn</span>
              <b class="selected-amount">{{ selectedItems.length }}</b>
            </div>
            <div class="deselect-btn" @click="clearSelection">Bỏ chọn</div>
            <MsButton
              icon="icon-mi-plus"
              variant="secondary"
              class="btn-add-to-list"
              @click="addSelectedToList"
            >
              Đưa vào danh sách sử dụng
            </MsButton>
          </div>
        </template>

        <!-- Normal Filter - hiển thị khi không có item được chọn -->
        <template v-else>
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
              icon-hover
            />

            <!-- Column Config Button -->
            <MsColumnConfig
              :columns="tableColumns"
              :default-columns="defaultColumns"
              storage-key="system-salary-category-columns"
              :pinned-column="pinnedColumn"
              @update:columns="onColumnsChange"
              @config-loaded="onConfigLoaded"
            />
          </div>
        </template>
      </div>

      <!-- Table Section -->
      <BaseDataGrid
        ref="dataGridRef"
        :key="gridKey"
        :data-source="systemCategories"
        :columns="visibleColumns"
        key-expr="salaryCompositionSystemId"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-records="totalRecords"
        :page-size-options="pageSizeSelectOptions"
        :selectable="true"
        :show-actions="true"
        :action-buttons="actionButtons"
        :action-column-width="50"
        @action="onAction"
        @selection-changed="onSelectionChanged"
        @column-pinned="onColumnPinned"
        @column-resized="onColumnResized"
      />
    </div>
  </div>

  <!-- Dialog xác nhận thêm vào danh sách -->
  <MsConfirmDialog
    v-model="showConfirmDialog"
    title="Xác nhận"
    :message="confirmDialogMessage"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    confirm-variant="primary"
    :loading="isProcessing"
    @confirm="confirmMove"
  />

  <!-- Dialog cảnh báo trùng mã -->
  <MsConfirmDialog
    v-model="showOverwriteDialog"
    title="Xác nhận"
    :message="overwriteDialogMessage"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    confirm-variant="primary"
    :loading="isProcessing"
    @confirm="confirmOverwrite"
  />

  <!-- Dialog xác nhận đưa nhiều thành phần vào danh sách -->
  <MsConfirmDialog
    v-model="showBulkConfirmDialog"
    title="Xác nhận"
    :message="bulkConfirmDialogMessage"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    confirm-variant="primary"
    :loading="isProcessing"
    @confirm="confirmBulkMove"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseDataGrid from '@/components/bases/data/BaseDataGrid.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import MsConfirmDialog from '@/components/bases/ui/MsConfirmDialog.vue'
import MsColumnConfig from '@/components/bases/ui/MsColumnConfig.vue'
import { salaryCompositionSystemApi } from '@/api'
import { useToast, useGridConfig } from '@/composables'

const GRID_CONFIG_KEY = 'system-salary-category-columns'

const router = useRouter()
const toast = useToast()
const { saveConfig } = useGridConfig(GRID_CONFIG_KEY)

const searchText = ref('')
const selectedType = ref(null)
const loading = ref(false)
const systemCategories = ref([])
const selectedItems = ref([])
const dataGridRef = ref(null)
const pinnedColumn = ref(null)

// Dialog states
const showConfirmDialog = ref(false)
const showOverwriteDialog = ref(false)
const showBulkConfirmDialog = ref(false)
const isProcessing = ref(false)
const selectedItem = ref(null)

// Dialog messages
const confirmDialogMessage = computed(() => {
  if (!selectedItem.value) return ''
  return `Bạn có chắc chắn muốn đưa thành phần lương mặc định "<strong>${selectedItem.value.salaryCompositionSystemName}</strong>" vào danh sách sử dụng không?`
})

const overwriteDialogMessage = computed(() => {
  if (!selectedItem.value) return ''
  return `Đã tồn tại một thành phần lương trùng mã "<strong>${selectedItem.value.salaryCompositionSystemCode}</strong>" trên danh sách. Chương trình sẽ cập nhật thông tin của thành phần lương mặc định vào bản ghi hiện có. Bạn có muốn tiếp tục không?`
})

const bulkConfirmDialogMessage = computed(() => {
  if (selectedItems.value.length === 0) return ''
  if (selectedItems.value.length === 1) {
    return `Bạn có chắc chắn muốn đưa thành phần lương mặc định "<strong>${selectedItems.value[0].salaryCompositionSystemName}</strong>" vào danh sách sử dụng không?`
  }
  return 'Bạn có chắc chắn muốn đưa các thành phần lương mặc định đã chọn vào danh sách sử dụng không?'
})

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

// Mapping for display
const typeLabels = {
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

const natureLabels = {
  income: 'Thu nhập',
  deduction: 'Khấu trừ',
  other: 'Khác'
}

const taxOptionLabels = {
  taxable: 'Có',
  tax_exempt_full: 'Miễn thuế toàn phần',
  tax_exempt_partial: 'Miễn thuế một phần'
}

const valueTypeLabels = {
  currency: 'Tiền tệ',
  number: 'Số',
  percent: 'Phần trăm',
  text: 'Chữ',
  date: 'Ngày'
}

const showOnPayslipLabels = {
  yes: 'Có',
  no: 'Không',
  if_not_zero: 'Nếu khác 0'
}

// Transform API data for display
const transformData = (items) => {
  return items.map(item => ({
    ...item,
    displayType: typeLabels[item.salaryCompositionSystemType] || item.salaryCompositionSystemType,
    displayNature: natureLabels[item.salaryCompositionSystemNature] || item.salaryCompositionSystemNature,
    displayTaxable: item.salaryCompositionSystemTaxOption
      ? taxOptionLabels[item.salaryCompositionSystemTaxOption] || ''
      : '',
    displayTaxDeduction: item.salaryCompositionSystemTaxDeduction ? 'Có' : 'Không',
    displayValueType: valueTypeLabels[item.salaryCompositionSystemValueType] || item.salaryCompositionSystemValueType,
    displayShowOnPayslip: showOnPayslipLabels[item.salaryCompositionSystemShowOnPayslip] || '',
    displayQuota: item.salaryCompositionSystemQuota || ''
  }))
}

// Table columns - 12 cột (mapped to display fields)
const defaultColumns = [
  { dataField: 'salaryCompositionSystemCode', caption: 'Mã thành phần', width: 150, minWidth: 120, visible: true },
  { dataField: 'salaryCompositionSystemName', caption: 'Tên thành phần', width: 200, minWidth: 150, visible: true },
  { dataField: 'displayType', caption: 'Loại thành phần', width: 150, minWidth: 120, visible: true },
  { dataField: 'displayNature', caption: 'Tính chất', width: 120, minWidth: 100, visible: true },
  { dataField: 'displayTaxable', caption: 'Chịu thuế', width: 150, minWidth: 100, visible: true },
  { dataField: 'displayTaxDeduction', caption: 'Giảm trừ khi tính thuế', width: 180, minWidth: 150, visible: true },
  { dataField: 'displayQuota', caption: 'Định mức', width: 120, minWidth: 100, visible: true },
  { dataField: 'displayValueType', caption: 'Kiểu giá trị', width: 120, minWidth: 100, visible: true },
  { dataField: 'salaryCompositionSystemValueFormula', caption: 'Giá trị', width: 150, minWidth: 100, visible: true },
  { dataField: 'salaryCompositionSystemDescription', caption: 'Mô tả', width: 200, minWidth: 150, visible: true },
  { dataField: 'displayShowOnPayslip', caption: 'Hiển thị trên phiếu lương', width: 180, minWidth: 150, visible: true }
]

const loadSavedColumns = () => {
  const saved = localStorage.getItem('system-salary-category-columns')
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

const visibleColumns = computed(() => tableColumns.value.filter(c => c.visible !== false))

const gridKey = computed(() => tableColumns.value.map(c => c.dataField).join('-'))

const onColumnsChange = (newColumns) => {
  tableColumns.value = newColumns
}

const onConfigLoaded = (loadedColumns) => {
  tableColumns.value = loadedColumns
  const pinned = loadedColumns.find(c => c.isPinned)
  if (pinned) {
    pinnedColumn.value = pinned.dataField
    nextTick(() => {
      dataGridRef.value?.setPinnedColumn(pinned.dataField)
    })
  }
}

// Handle column pin change - save to server
const onColumnPinned = async (dataField) => {
  pinnedColumn.value = dataField
  try {
    await saveConfig(tableColumns.value, dataField)
  } catch (err) {
    console.error('Failed to save pinned column:', err)
  }
}

// Handle column resize - save to server
const onColumnResized = async ({ dataField, width }) => {
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

// Fetch data from API
const fetchSystemCategories = async () => {
  loading.value = true
  try {
    const result = await salaryCompositionSystemApi.getPaged({
      pageNumber: currentPage.value,
      pageSize: pageSize.value,
      searchText: searchText.value || '',
      type: selectedType.value
    })
    systemCategories.value = transformData(result.data)
    totalRecords.value = result.totalRecords
  } catch (error) {
    console.error('Error fetching system categories:', error)
    toast.error('Có lỗi khi tải dữ liệu')
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  currentPage.value = 1
  fetchSystemCategories()
}

// Watch for pagination and filter changes
watch([currentPage, pageSize], () => {
  fetchSystemCategories()
})

watch([selectedType], () => {
  currentPage.value = 1
  fetchSystemCategories()
})

// Handle action - show confirm dialog first
const onAction = async ({ action, data }) => {
  if (action === 'add') {
    selectedItem.value = data
    showConfirmDialog.value = true
  }
}

// Confirm move - check if code exists first
const confirmMove = async () => {
  if (!selectedItem.value) return

  isProcessing.value = true
  try {
    const checkResult = await salaryCompositionSystemApi.checkExists(selectedItem.value.salaryCompositionSystemId)

    if (checkResult.exists) {
      showConfirmDialog.value = false
      showOverwriteDialog.value = true
    } else {
      await salaryCompositionSystemApi.move(selectedItem.value.salaryCompositionSystemId)
      toast.success(`Đã thêm "${selectedItem.value.salaryCompositionSystemName}" vào danh sách sử dụng`)
      showConfirmDialog.value = false
      selectedItem.value = null
      await fetchSystemCategories()
    }
  } catch (error) {
    console.error('Error moving to composition:', error)
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    isProcessing.value = false
  }
}

// Confirm overwrite - update existing record
const confirmOverwrite = async () => {
  if (!selectedItem.value) return

  isProcessing.value = true
  try {
    await salaryCompositionSystemApi.overwrite(selectedItem.value.salaryCompositionSystemId)
    toast.success(`Đã cập nhật "${selectedItem.value.salaryCompositionSystemName}" vào danh sách sử dụng`)
    showOverwriteDialog.value = false
    selectedItem.value = null
    await fetchSystemCategories()
  } catch (error) {
    console.error('Error overwriting composition:', error)
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    isProcessing.value = false
  }
}

const goBack = () => {
  router.push('/payroll/salarycomposition')
}

// Selection handlers
const onSelectionChanged = (items) => {
  selectedItems.value = items
}

const clearSelection = () => {
  dataGridRef.value?.clearSelection()
  selectedItems.value = []
}

const addSelectedToList = () => {
  if (selectedItems.value.length === 0) return
  showBulkConfirmDialog.value = true
}

const confirmBulkMove = async () => {
  if (selectedItems.value.length === 0) return

  isProcessing.value = true
  try {
    const ids = selectedItems.value.map(item => item.salaryCompositionSystemId)
    await salaryCompositionSystemApi.moveMultiple(ids)
    toast.success(`Đã thêm ${selectedItems.value.length} thành phần lương vào danh sách sử dụng`)
    showBulkConfirmDialog.value = false
    clearSelection()
    await fetchSystemCategories()
  } catch (error) {
    console.error('Error moving to composition:', error)
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  fetchSystemCategories()
})
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

/* Selection Bar */
.selection-bar {
  gap: 16px;
  font-size: 14px;
}

.selection-bar .selected-amount {
  margin-left: 4px;
}

.selection-bar .deselect-btn {
  color: #34b057;
  cursor: pointer;
  font-weight: 700;
}

.btn-add-to-list {
  height: 36px;
  padding: 0 16px 0 12px;
  border-radius: 4px;
}
</style>
