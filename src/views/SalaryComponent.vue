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
      >
        <!-- Status column template -->
        <template #statusTemplate="{ data }">
          <div class="status-cell">
            <div class="status-indicator" :class="data.data.status === 'Đang theo dõi' ? 'active' : 'inactive'"></div>
            <span class="status-text" :class="data.data.status === 'Đang theo dõi' ? 'active' : 'inactive'">
              {{ data.data.status }}
            </span>
          </div>
        </template>
      </BaseDataGrid>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDataGrid from '@/components/bases/data/BaseDataGrid.vue'
import MsTree from '@/components/bases/data/MsTree.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import salaryCompositionApi from '@/api/salary-composition.api'
import { useOrganization } from '@/composables'

const router = useRouter()

const { tree: unitTreeData, fetchTree, flatList: orgFlatList } = useOrganization()

const searchText = ref('')
const selectedRows = ref([])
const loading = ref(false)

// Filter state
const selectedStatus = ref(null)
const selectedUnits = ref([])

const statusOptions = [
  { value: null, label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang theo dõi' },
  { value: 'inactive', label: 'Ngừng theo dõi' }
]

// Table columns configuration
const tableColumns = [
  { dataField: 'code', caption: 'Mã thành phần', width: 250, minWidth: 120 },
  { dataField: 'name', caption: 'Tên thành phần', width: 250, minWidth: 200 },
  { dataField: 'unit', caption: 'Đơn vị áp dụng', width: 250, minWidth: 120 },
  { dataField: 'type', caption: 'Loại thành phần', width: 250, minWidth: 120 },
  { dataField: 'property', caption: 'Tính chất', width: 150, minWidth: 100 },
  { dataField: 'taxable', caption: 'Chịu thuế', width: 200, minWidth: 100 },
  { dataField: 'taxDeduction', caption: 'Giảm trừ khi tính thuế', width: 180, minWidth: 150 },
  { dataField: 'quota', caption: 'Định mức', width: 120, minWidth: 100 },
  { dataField: 'valueType', caption: 'Kiểu giá trị', width: 120, minWidth: 100 },
  { dataField: 'value', caption: 'Giá trị', width: 120, minWidth: 100 },
  { dataField: 'description', caption: 'Mô tả', width: 200, minWidth: 150 },
  { dataField: 'showOnPayslip', caption: 'Hiển thị trên phiếu lương', width: 200, minWidth: 150 },
  { dataField: 'source', caption: 'Nguồn tạo', width: 120, minWidth: 100 },
  { dataField: 'status', caption: 'Trạng thái', width: 150, minWidth: 120, cellTemplate: 'statusTemplate' }
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
  system: 'Hệ thống'
}

// Map trạng thái
const statusMap = {
  1: 'Đang theo dõi',
  0: 'Ngừng theo dõi'
}

// Map kiểu giá trị
const valueTypeMap = {
  number: 'Số',
  currency: 'Tiền tệ',
  percent: 'Phần trăm',
  text: 'Chữ',
  date: 'Ngày'
}

// Hàm lấy tên đơn vị hiển thị theo kiểu MsTree
const getUnitDisplayNames = (unitIds) => {
  if (!unitIds || unitIds.length === 0 || !orgFlatList.value?.length) {
    return ''
  }

  const ids = new Set(unitIds.map(x => String(x)))
  const byId = new Map()
  const childrenByParent = new Map()

  for (const raw of orgFlatList.value) {
    const idStr = String(raw.id)
    const parentIdStr = raw.parentId == null ? null : String(raw.parentId)
    const nameStr = String(raw.name ?? '')
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
    const idStr = String(raw.id)
    if (displayIds.has(idStr)) result.push(String(raw.name ?? ''))
  }
  return result.join(', ')
}

const mapDataForDisplay = (data) => {
  return data.map(item => ({
    ...item,
    unit: getUnitDisplayNames(item.unitIds),
    type: typeMap[item.type] || item.type,
    property: propertyMap[item.property] || item.property,
    taxable: taxOptionMap[item.taxOption] || item.taxOption || '',
    taxDeduction: item.deductWhenCalculatingTax ? 'Có' : 'Không',
    quota: item.quota || '',
    valueType: valueTypeMap[item.valueType] || item.valueType || '',
    value: item.valueFormula || '',
    description: item.description || '',
    showOnPayslip: showOnPayslipMap[item.showOnPayslip] || item.showOnPayslip || '',
    source: sourceMap[item.source] || item.source || '',
    status: statusMap[item.status] ?? item.status
  }))
}

const fetchSalaryComponents = async () => {
  loading.value = true
  try {
    const data = await salaryCompositionApi.getAll()
    salaryComponents.value = mapDataForDisplay(data)
    totalRecords.value = data.length
  } catch (error) {
    console.error('Error fetching salary components:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchTree()
  await fetchSalaryComponents()
})

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
  padding: 16px 16px 12px 16px;
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
