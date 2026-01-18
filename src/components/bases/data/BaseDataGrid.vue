<template>
  <div class="base-grid-container d-flex flex-column flex-grow-1 overflow-hidden">
    <div class="base-table-wrapper flex-grow-1 overflow-hidden" ref="tableWrapperRef">
      <DxDataGrid
      ref="dataGridRef"
      :data-source="dataSource"
      :show-borders="false"
      :column-auto-width="false"
      :row-alternation-enabled="false"
      :hover-state-enabled="true"
      :show-column-lines="true"
      :show-row-lines="true"
      :key-expr="keyExpr"
      :allow-column-resizing="true"
      column-resizing-mode="widget"
      height="100%"
      @selection-changed="onSelectionChanged"
      @row-prepared="onRowPrepared"
      @option-changed="onOptionChanged"
    >
      <DxSelection
        v-if="selectable"
        :mode="selectionMode"
        show-check-boxes-mode="always"
      />
      <DxScrolling mode="virtual" column-rendering-mode="virtual" />

      <!-- Checkbox column - fixed when any column is pinned -->
      <DxColumn
        v-if="selectable"
        type="selection"
        :width="55"
        :fixed="true"
        fixed-position="left"
        css-class="cell-column checkbox-column"
      />

      <!-- Dynamic columns with pin support -->
      <DxColumn
        v-for="(col, index) in columns"
        :key="col.dataField"
        :data-field="col.dataField"
        :caption="col.caption"
        :width="col.width"
        :min-width="col.minWidth || 100"
        :fixed="index <= pinnedColumnIndex"
        fixed-position="left"
        :allow-sorting="col.allowSorting !== false"
        :css-class="getColumnClass(col.dataField, index)"
        :cell-template="col.cellTemplate"
        header-cell-template="headerWithPinTemplate"
      />

      <!-- Placeholder column for action buttons -->
      <DxColumn
        v-if="showActions"
        caption=""
        :width="actionColumnWidth"
        :min-width="actionColumnWidth"
        :allow-sorting="false"
        css-class="cell-column action-placeholder-column"
        cell-template="emptyTemplate"
        header-cell-template="emptyHeaderTemplate"
      />

      <!-- Empty templates -->
      <template #emptyHeaderTemplate>
        <span></span>
      </template>
      <template #emptyTemplate>
        <span></span>
      </template>

      <!-- Header with pin icon template -->
      <template #headerWithPinTemplate="{ data }">
        <div
          class="header-with-pin d-flex align-items-center justify-content-between"
          @mouseenter="hoveredHeaderColumn = data.column.dataField"
          @mouseleave="hoveredHeaderColumn = null"
        >
          <span class="header-text">{{ data.column.caption }}</span>
          <span
            v-if="hoveredHeaderColumn === data.column.dataField || pinnedColumn === data.column.dataField"
            class="pin-icon"
            :class="pinnedColumn === data.column.dataField ? 'icon-mi-pin' : 'icon-mi-uppin'"
            @click.stop="onPinColumn(data.column.dataField)"
            :title="pinnedColumn === data.column.dataField ? 'Bỏ ghim' : 'Ghim cột'"
          ></span>
        </div>
      </template>

      <!-- Pass through custom cell templates via slots -->
      <template v-for="col in columnsWithTemplates" :key="col.dataField" #[col.cellTemplate]="slotProps">
        <slot :name="col.cellTemplate" :data="slotProps.data">
          <span>{{ slotProps.data.value }}</span>
        </slot>
      </template>

      <DxPaging :enabled="false" />
    </DxDataGrid>

      <!-- Floating Action Overlay -->
      <div
        v-if="showActions && hoveredRowData"
        class="action-overlay"
        :style="actionOverlayStyle"
        @mouseenter="keepOverlayVisible"
        @mouseleave="hideOverlay"
      >
        <div class="action-buttons d-flex align-items-center">
          <slot name="actions" :data="hoveredRowData">
            <button
              v-for="action in computedActionButtons"
              :key="action.name"
              class="action-btn d-flex align-items-center justify-content-center bg-transparent border-0 rounded-1"
              :title="action.title"
              @click="$emit('action', { action: action.name, data: hoveredRowData })"
            >
              <span :class="['icon', 'd-inline-block', 'flex-shrink-0', action.icon]"></span>
            </button>
          </slot>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination" class="base-pagination d-flex align-items-center flex-shrink-0 position-relative">
      <div class="pagination-total d-flex align-items-center gap-2">
        Tổng số bản ghi:
        <b>{{ totalRecords }}</b>
      </div>
      <div class="pagination-center d-flex align-items-center gap-3">
        <div class="page-size-selector d-flex align-items-center gap-2">
          <span class="page-size-label text-nowrap">Số bản ghi/trang</span>
          <MsSelect
            :model-value="pageSize"
            :options="pageSizeOptions"
            size="small"
            class="page-size-select"
            @update:model-value="onPageSizeChange"
          />
        </div>
        <div class="page-info d-flex align-items-center gap-1">
          <b>{{ startRecord }}</b>
          -
          <b>{{ endRecord }}</b>
          bản ghi
        </div>
      </div>
      <div class="pagination-nav d-flex align-items-center gap-1">
        <MsButton
          icon="icon-mi-chevron-left"
          variant="text"
          size="small"
          class="nav-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
          title="Trước"
        />
        <MsButton
          icon="icon-mi-chevron-right"
          variant="text"
          size="small"
          class="nav-btn"
          :disabled="currentPage === totalPages"
          @click="nextPage"
          title="Sau"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { DxDataGrid, DxColumn, DxSelection, DxScrolling, DxPaging } from 'devextreme-vue/data-grid'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'

const props = defineProps({
  dataSource: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  keyExpr: {
    type: String,
    default: 'id'
  },
  selectable: {
    type: Boolean,
    default: true
  },
  selectionMode: {
    type: String,
    default: 'multiple'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  actionColumnWidth: {
    type: Number,
    default: 177
  },
  /**
   * Action buttons configuration
   * Each button can have:
   * - name: string - action name emitted on click
   * - title: string | (rowData) => string - button tooltip
   * - icon: string | (rowData) => string - icon class
   * - visible: (rowData) => boolean - optional visibility condition
   */
  actionButtons: {
    type: Array,
    default: () => [
      { name: 'duplicate', title: 'Nhân bản', icon: 'icon-mi-copy' },
      { name: 'edit', title: 'Sửa', icon: 'icon-mi-pencil' },
      { name: 'delete', title: 'Xóa', icon: 'icon-mi-trash-red' }
    ]
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 15
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  pageSizeOptions: {
    type: Array,
    default: () => [
      { value: 15, label: '15' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 100, label: '100' }
    ]
  }
})

const emit = defineEmits(['selection-changed', 'action', 'update:currentPage', 'update:pageSize', 'page-change', 'page-size-change', 'column-pinned', 'column-resized'])

// Refs
const tableWrapperRef = ref(null)
const dataGridRef = ref(null)

// Column pin state - stores the index of pinned column (all columns up to this index will be sticky)
const pinnedColumnIndex = ref(0)
const hoveredHeaderColumn = ref(null)

// Get pinned column dataField for display
const pinnedColumn = computed(() => {
  if (props.columns.length === 0) return null
  return props.columns[pinnedColumnIndex.value]?.dataField
})

// Initialize pinned column to first column (index 0)
watch(() => props.columns, (cols) => {
  if (cols && cols.length > 0 && pinnedColumnIndex.value === null) {
    pinnedColumnIndex.value = 0
  }
}, { immediate: true })

/** Xử lý khi click ghim cột - nếu click vào cột đang ghim thì reset về cột đầu, ngược lại ghim cột được click */
const onPinColumn = (dataField) => {
  const clickedIndex = props.columns.findIndex(col => col.dataField === dataField)
  if (clickedIndex === -1) return

  // If clicking on currently pinned column, reset to first column
  if (clickedIndex === pinnedColumnIndex.value) {
    pinnedColumnIndex.value = 0
    emit('column-pinned', props.columns[0]?.dataField || null)
  } else {
    pinnedColumnIndex.value = clickedIndex
    emit('column-pinned', dataField)
  }
}

/** Lấy class CSS cho cột - xác định cột có được ghim và có phải cột ghim cuối cùng không */
const getColumnClass = (dataField, index) => {
  const isPinned = index <= pinnedColumnIndex.value
  const isLastPinned = index === pinnedColumnIndex.value
  let classes = 'cell-column'
  if (isPinned) {
    classes += ' pinned-column'
  }
  if (isLastPinned) {
    classes += ' last-pinned-column'
  }
  if (dataField) {
    classes += ` column-${dataField}`
  }
  return classes
}

// Floating action overlay state
const hoveredRowData = ref(null)
const hoveredRowTop = ref(0)
const isOverlayHovered = ref(false)
let hideTimeout = null

const actionOverlayStyle = computed(() => ({
  top: `${hoveredRowTop.value}px`,
  right: '0px',
  width: `${props.actionColumnWidth}px`
}))

const computedActionButtons = computed(() => {
  if (!hoveredRowData.value) return props.actionButtons

  return props.actionButtons
    .filter(action => {
      // Check visibility condition if provided
      if (typeof action.visible === 'function') {
        return action.visible(hoveredRowData.value)
      }
      return true
    })
    .map(action => {
      // Resolve dynamic title
      const title = typeof action.title === 'function'
        ? action.title(hoveredRowData.value)
        : action.title

      // Resolve dynamic icon
      const icon = typeof action.icon === 'function'
        ? action.icon(hoveredRowData.value)
        : action.icon

      return { ...action, title, icon }
    })
})

/** Xử lý khi dòng được render - đăng ký sự kiện hover cho dòng dữ liệu */
const onRowPrepared = (e) => {
  if (e.rowType === 'data') {
    e.rowElement.addEventListener('mouseenter', () => onRowMouseEnter(e))
    e.rowElement.addEventListener('mouseleave', onRowMouseLeave)
  }
}

/** Xử lý khi di chuột vào dòng - lưu dữ liệu dòng và tính vị trí hiển thị overlay */
const onRowMouseEnter = (e) => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  hoveredRowData.value = e.data
  const rowRect = e.rowElement.getBoundingClientRect()
  const wrapperRect = tableWrapperRef.value?.getBoundingClientRect()
  if (wrapperRect) {
    hoveredRowTop.value = rowRect.top - wrapperRect.top
  }
}

/** Xử lý khi di chuột rời khỏi dòng - ẩn overlay sau một khoảng delay nếu không hover vào overlay */
const onRowMouseLeave = () => {
  hideTimeout = setTimeout(() => {
    if (!isOverlayHovered.value) {
      hoveredRowData.value = null
    }
  }, 50)
}

/** Giữ overlay hiển thị khi hover - ngăn overlay bị ẩn khi di chuột từ dòng sang overlay */
const keepOverlayVisible = () => {
  isOverlayHovered.value = true
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

/** Ẩn overlay - reset trạng thái hover và ẩn action buttons */
const hideOverlay = () => {
  isOverlayHovered.value = false
  hoveredRowData.value = null
}

// Pagination computed
const totalPages = computed(() => Math.ceil(props.totalRecords / props.pageSize))
const startRecord = computed(() => (props.currentPage - 1) * props.pageSize + 1)
const endRecord = computed(() => Math.min(props.currentPage * props.pageSize, props.totalRecords))

/** Xử lý thay đổi số bản ghi/trang - reset về trang 1 và emit sự kiện */
const onPageSizeChange = (newSize) => {
  emit('update:pageSize', newSize)
  emit('update:currentPage', 1)
  emit('page-size-change', newSize)
}

/** Chuyển đến trang trước - giảm currentPage và emit sự kiện page-change */
const prevPage = () => {
  if (props.currentPage > 1) {
    const newPage = props.currentPage - 1
    emit('update:currentPage', newPage)
    emit('page-change', newPage)
  }
}

/** Chuyển đến trang sau - tăng currentPage và emit sự kiện page-change */
const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    const newPage = props.currentPage + 1
    emit('update:currentPage', newPage)
    emit('page-change', newPage)
  }
}

/** Danh sách các cột có template tùy chỉnh */
const columnsWithTemplates = computed(() => {
  return props.columns.filter(col => col.cellTemplate)
})

/** Xử lý khi thay đổi lựa chọn dòng - emit danh sách các dòng được chọn */
const onSelectionChanged = (e) => {
  emit('selection-changed', e.selectedRowsData)
}

/** Xử lý thay đổi options của grid (resize cột) - emit sự kiện column-resized với debounce */
let resizeDebounceTimer = null
const onOptionChanged = (e) => {
  // Listen for column width changes
  if (e.fullName && e.fullName.startsWith('columns[') && e.fullName.endsWith('].width')) {
    // Extract column index from fullName like "columns[0].width"
    const match = e.fullName.match(/columns\[(\d+)\]\.width/)
    if (match) {
      const colIndex = parseInt(match[1])
      // Adjust for checkbox column (index 0 is checkbox if selectable)
      const actualIndex = props.selectable ? colIndex - 1 : colIndex
      if (actualIndex >= 0 && actualIndex < props.columns.length) {
        const column = props.columns[actualIndex]
        if (column) {
          // Debounce the emit to avoid too many calls during resize
          if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer)
          resizeDebounceTimer = setTimeout(() => {
            emit('column-resized', { dataField: column.dataField, width: e.value })
          }, 300)
        }
      }
    }
  }
}

/** Xóa tất cả lựa chọn - bỏ chọn tất cả các dòng đang được chọn trong grid */
const clearSelection = () => {
  dataGridRef.value?.instance?.clearSelection()
}

/** Lấy cột đang được ghim - trả về dataField của cột ghim hiện tại */
const getPinnedColumn = () => pinnedColumn.value

/** Đặt cột ghim từ bên ngoài - cho phép component cha điều khiển cột được ghim */
const setPinnedColumn = (dataField) => {
  if (!dataField) {
    pinnedColumnIndex.value = 0
    return
  }
  const index = props.columns.findIndex(col => col.dataField === dataField)
  if (index !== -1) {
    pinnedColumnIndex.value = index
  }
}

defineExpose({
  clearSelection,
  getPinnedColumn,
  setPinnedColumn
})

onBeforeUnmount(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})
</script>

<style scoped>
/* Table Section */
.base-table-wrapper {
  min-height: 0;
  border-top: 1px solid #e0e0e0;
  background: linear-gradient(#f6f6f6 36px, #fff 0px);
  position: relative;
}

/* Floating Action Overlay */
.action-overlay {
  position: absolute;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: linear-gradient(to right, transparent 0%, #eafbf2 20%, #eafbf2 100%);
  padding-right: 8px;
  z-index: 100;
  pointer-events: auto;
}

.action-overlay .action-buttons {
  opacity: 1;
  gap: 0;
}

/* Custom scrollbar styling */
.base-table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.base-table-wrapper::-webkit-scrollbar-track:vertical {
  margin-top: 37px;
  background: transparent;
}

.base-table-wrapper::-webkit-scrollbar-thumb {
  background-color: #cdd3d6;
  border-radius: 4px;
}

.base-table-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #aeb5b9;
}

/* Action Buttons */
.action-buttons {
  gap: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.action-btn {
  width: 40px;
  height: 36px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.action-btn:hover {
  background: #e0e0e0;
}

/* Header with Pin Icon */
.header-with-pin {
  width: 100%;
  cursor: default;
}

.header-with-pin .header-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-with-pin .pin-icon {
  flex-shrink: 0;
  cursor: pointer;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.header-with-pin .pin-icon:hover {
  opacity: 1;
}

/* Pagination */
.base-pagination {
  padding: 0 16px;
  background: #f6f6f6;
  border-top: 1px solid #e0e0e0;
  height: 56px;
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

.page-size-select :deep(.ms-select) {
  width: 80px;
}

.page-info {
  font-size: 14px;
  color: #212121;
}

/* Navigation Buttons */
.nav-btn {
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
}
</style>

<style>
/* DevExtreme DataGrid Custom Styles - Global */
.base-table-wrapper .dx-datagrid {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  border: none;
  height: 100%;
}

.base-table-wrapper .dx-datagrid-headers {
  background: #f6f6f6 !important;
}

.base-table-wrapper .dx-datagrid-headers .dx-header-row {
  height: 36px;
  background: #f6f6f6 !important;
}

.base-table-wrapper .dx-datagrid-headers .dx-header-row td {
  font-weight: 700;
  color: #1f1f1f;
  padding: 0 16px;
  border: none;
  border-bottom: 1px solid #cfcfcf;
  line-height: 36px;
  vertical-align: middle;
  background: #f6f6f6 !important;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row {
  height: 36px;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row td {
  padding: 0 16px;
  border: none;
  border-bottom: 1px solid #ebebeb;
  color: #212121;
  line-height: 36px;
  vertical-align: middle;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row:hover {
  background: #eafbf2 !important;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row:hover td {
  background: #eafbf2 !important;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row:hover .action-buttons {
  opacity: 1;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-selection td {
  background: #e8f5e9 !important;
}

/* Custom checkbox icons */
.base-table-wrapper .dx-checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-table-wrapper .dx-checkbox-icon {
  width: 20px !important;
  height: 20px !important;
  border: none !important;
  border-radius: 0 !important;
  background: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -240px 0px !important;
  background-color: transparent !important;
}

.base-table-wrapper .dx-checkbox-icon::before {
  content: none !important;
  display: none !important;
}

.base-table-wrapper .dx-checkbox-checked .dx-checkbox-icon {
  background: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -260px 0px !important;
  background-color: transparent !important;
  border: none !important;
}

.base-table-wrapper .dx-checkbox-indeterminate .dx-checkbox-icon {
  background: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -260px 0px !important;
  background-color: transparent !important;
  border: none !important;
}

.base-table-wrapper .dx-checkbox-has-text .dx-checkbox-icon {
  margin-right: 0;
}

.base-table-wrapper .dx-datagrid .dx-column-lines > td {
  border-left: none;
  border-right: none;
}

.base-table-wrapper .dx-datagrid-borders > .dx-datagrid-headers {
  border: none;
}

.base-table-wrapper .dx-datagrid-borders > .dx-datagrid-rowsview {
  border: none;
}

/* Fixed columns styles */
.base-table-wrapper .dx-datagrid-content-fixed {
  background: transparent;
}

.base-table-wrapper .dx-datagrid-content-fixed .dx-datagrid-table {
  background: #fff;
}

.base-table-wrapper .dx-datagrid-content-fixed .dx-row:hover td {
  background: #eafbf2 !important;
}

.base-table-wrapper .dx-datagrid-content-fixed .dx-header-row td {
  background: #f6f6f6 !important;
}

/* Remove border/shadow from fixed columns */
.base-table-wrapper .dx-datagrid-content-fixed .dx-pointer-events-none {
  border: none !important;
  box-shadow: none !important;
}

.base-table-wrapper .dx-datagrid-content-fixed::after {
  display: none !important;
}

.base-table-wrapper .dx-datagrid .dx-datagrid-content-fixed {
  box-shadow: none !important;
}

/* Last pinned column has a subtle border */
.base-table-wrapper .last-pinned-column {
  border-right: 1px solid #e0e0e0 !important;
}

/* Action column fixed right - show on hover */
.base-table-wrapper .dx-datagrid-rowsview .dx-row .action-buttons {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row:hover .action-buttons,
.base-table-wrapper .dx-datagrid-content-fixed .dx-row:hover .action-buttons {
  opacity: 1;
}

/* Sticky action column - overlay style like MsSalaryView */
.base-table-wrapper .sticky-action-column {
  position: sticky !important;
  right: 0 !important;
  z-index: 1;
  background: #fff;
}

.base-table-wrapper .dx-datagrid-headers .sticky-action-column {
  background: #f6f6f6 !important;
  z-index: 11;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row:hover .sticky-action-column {
  background: #eafbf2 !important;
}

/* Status Badge Styles */
.base-table-wrapper .status-cell {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.base-table-wrapper .status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 8px;
  margin-right: 8px;
  flex-shrink: 0;
}

.base-table-wrapper .status-indicator.active {
  background: rgb(52, 176, 87);
}

.base-table-wrapper .status-indicator.inactive {
  background: #ff9900;
}

.base-table-wrapper .status-text.active {
  color: rgb(52, 176, 87);
}

.base-table-wrapper .status-text.inactive {
  color: #ff9900;
}

.base-table-wrapper .dx-datagrid-headers .dx-datagrid-text-content {
  width: 100% !important;
}
</style>
