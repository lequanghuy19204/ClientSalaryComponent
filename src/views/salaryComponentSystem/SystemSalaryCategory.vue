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

    <!-- Content Card with Filter Panel -->
    <div class="page-content-wrapper d-flex flex-grow-1 overflow-hidden">
      <!-- Main Content -->
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
                :class="{ 'filter-btn-active': showFilterPanel }"
                title="Bộ lọc"
                icon-hover
                @click="toggleFilterPanel"
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
      >
        <!-- Value (formula) column template -->
        <template #valueTemplate="{ data }">
          <MsFormulaCell :value="data.data.displayValue" />
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
import MsFormulaCell from '@/components/bases/data/MsFormulaCell.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import MsConfirmDialog from '@/components/bases/ui/MsConfirmDialog.vue'
import MsColumnConfig from '@/components/bases/ui/MsColumnConfig.vue'
import MsFilterPanel from '@/components/bases/ui/MsFilterPanel.vue'
import MsFilterCheckbox from '@/components/bases/form/MsFilterCheckbox.vue'
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

// Filter panel state
const showFilterPanel = ref(false)
const filterSearchText = ref('')
const filterColumns = ref({
  salaryCompositionSystemCode: { checked: false, condition: 'contains', value: '' },
  salaryCompositionSystemName: { checked: false, condition: 'contains', value: '' },
  salaryCompositionType: { checked: false, condition: 'equals', value: '' },
  salaryCompositionNature: { checked: false, condition: 'equals', value: '' },
  isTaxable: { checked: false, condition: 'equals', value: '' },
  isTaxDeductible: { checked: false, condition: 'equals', value: '' },
  quota: { checked: false, condition: 'contains', value: '' },
  valueType: { checked: false, condition: 'equals', value: '' },
  value: { checked: false, condition: 'contains', value: '' },
  description: { checked: false, condition: 'contains', value: '' },
  showOnPayslip: { checked: false, condition: 'equals', value: '' }
})

const filterColumnLabels = {
  salaryCompositionSystemCode: 'Mã thành phần',
  salaryCompositionSystemName: 'Tên thành phần',
  salaryCompositionType: 'Loại thành phần',
  salaryCompositionNature: 'Tính chất',
  isTaxable: 'Chịu thuế',
  isTaxDeductible: 'Giảm trừ khi tính thuế',
  quota: 'Định mức',
  valueType: 'Kiểu giá trị',
  value: 'Giá trị',
  description: 'Mô tả',
  showOnPayslip: 'Hiển thị trên phiếu lương'
}

const filterColumnConfig = {
  salaryCompositionSystemCode: { type: 'input' },
  salaryCompositionSystemName: { type: 'input' },
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

/** Xây dựng object filters từ filterColumns để gửi lên API */
const buildFiltersFromColumns = () => {
  const filters = {}
  
  // Map key trong filterColumns sang key API
  const keyMapping = {
    salaryCompositionSystemCode: 'salaryCompositionSystemCode',
    salaryCompositionSystemName: 'salaryCompositionSystemName',
    salaryCompositionType: 'salaryCompositionType',
    salaryCompositionNature: 'salaryCompositionNature',
    isTaxable: 'isTaxable',
    isTaxDeductible: 'isTaxDeductible',
    quota: 'quota',
    valueType: 'valueType',
    value: 'value',
    description: 'description',
    showOnPayslip: 'showOnPayslip'
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

const onClearFilter = () => {
  Object.keys(filterColumns.value).forEach(key => {
    const defaultCondition = filterColumnConfig[key]?.type === 'select' ? 'equals' : 'contains'
    filterColumns.value[key] = { checked: false, condition: defaultCondition, value: '' }
  })
  currentPage.value = 1
  fetchSystemCategories()
}

const onApplyFilter = () => {
  currentPage.value = 1
  fetchSystemCategories()
}

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

/** Chuyển đổi dữ liệu API để hiển thị trên bảng, bao gồm mapping các giá trị enum sang label tiếng Việt */
const transformData = (items) => {
  return items.map(item => ({
    ...item,
    displayType: typeLabels[item.salaryCompositionSystemType] || item.salaryCompositionSystemType,
    displayNature: natureLabels[item.salaryCompositionSystemNature] || item.salaryCompositionSystemNature,
    displayTaxable: item.salaryCompositionSystemTaxOption
      ? taxOptionLabels[item.salaryCompositionSystemTaxOption] || '-'
      : '-',
    displayTaxDeduction: item.salaryCompositionSystemTaxDeduction ? 'Có' : '-',
    displayValueType: valueTypeLabels[item.salaryCompositionSystemValueType] || item.salaryCompositionSystemValueType,
    displayShowOnPayslip: showOnPayslipLabels[item.salaryCompositionSystemShowOnPayslip] || '',
    displayQuota: item.salaryCompositionSystemQuota || '',
    displayValue: item.salaryCompositionSystemValueFormula || '-'
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
  { dataField: 'displayValue', caption: 'Giá trị', width: 150, minWidth: 100, cellTemplate: 'valueTemplate', visible: true },
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

/** Xử lý thay đổi cấu hình cột: cập nhật danh sách cột hiển thị */
const onColumnsChange = (newColumns) => {
  tableColumns.value = newColumns
}

/** Xử lý khi cấu hình cột được tải: áp dụng cấu hình đã lưu và thiết lập cột ghim */
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

/** Xử lý ghim cột: lưu cấu hình cột ghim lên server */
const onColumnPinned = async (dataField) => {
  pinnedColumn.value = dataField
  try {
    await saveConfig(tableColumns.value, dataField)
  } catch (err) {
    console.error('Failed to save pinned column:', err)
  }
}

/** Xử lý thay đổi kích thước cột: cập nhật và lưu cấu hình lên server */
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
const pageSize = ref(25)
const totalRecords = ref(0)

const pageSizeSelectOptions = [
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
]

/** Lấy danh sách danh mục hệ thống từ API với phân trang và bộ lọc */
const fetchSystemCategories = async () => {
  loading.value = true
  try {
    const result = await salaryCompositionSystemApi.getPaged({
      pageNumber: currentPage.value,
      pageSize: pageSize.value,
      searchText: searchText.value || '',
      type: selectedType.value,
      filters: buildFiltersFromColumns()
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

/** Xử lý tìm kiếm: reset về trang 1 và tải lại dữ liệu */
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

/** Xử lý hành động trên dòng: hiển thị dialog xác nhận để thêm vào danh sách sử dụng */
const onAction = async ({ action, data }) => {
  if (action === 'add') {
    selectedItem.value = data
    showConfirmDialog.value = true
  }
}

/** Xác nhận đưa vào danh sách sử dụng: kiểm tra trùng mã trước khi thêm */
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

/** Xác nhận ghi đè khi trùng mã: cập nhật thông tin vào bản ghi hiện có */
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

/** Quay lại trang danh sách thành phần lương */
const goBack = () => {
  router.push('/payroll/salarycomposition')
}

/** Xử lý khi thay đổi lựa chọn: cập nhật danh sách các mục đã chọn */
const onSelectionChanged = (items) => {
  selectedItems.value = items
}

/** Xóa lựa chọn: bỏ chọn tất cả các mục trong bảng */
const clearSelection = () => {
  dataGridRef.value?.clearSelection()
  selectedItems.value = []
}

/** Đưa các mục đã chọn vào danh sách sử dụng: hiển thị dialog xác nhận */
const addSelectedToList = () => {
  if (selectedItems.value.length === 0) return
  showBulkConfirmDialog.value = true
}

/** Xác nhận đưa nhiều mục vào danh sách sử dụng */
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
.page-content-wrapper {
  gap: 0;
}

.page-content {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  min-width: 0;
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

.filter-btn-active :deep(.ms-btn) {
  background: #eafbf2;
  border-color: #34b057;
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
