<template>
  <div class="base-grid-container d-flex flex-column flex-grow-1 overflow-hidden">
    <div class="base-table-wrapper flex-grow-1 overflow-hidden">
      <DxDataGrid
      :data-source="dataSource"
      :show-borders="false"
      :column-auto-width="false"
      :row-alternation-enabled="false"
      :hover-state-enabled="true"
      :show-column-lines="true"
      :show-row-lines="true"
      :key-expr="keyExpr"
      height="100%"
      @selection-changed="onSelectionChanged"
    >
      <DxSelection
        v-if="selectable"
        :mode="selectionMode"
        show-check-boxes-mode="always"
      />
      <DxScrolling mode="virtual" column-rendering-mode="virtual" />

      <!-- Fixed checkbox column on left -->
      <DxColumn
        v-if="selectable"
        type="selection"
        :width="40"
        :fixed="true"
        fixed-position="left"
        css-class="cell-column"
      />

      <!-- Dynamic columns -->
      <DxColumn
        v-for="col in columns"
        :key="col.dataField"
        :data-field="col.dataField"
        :caption="col.caption"
        :width="col.width"
        :min-width="col.minWidth || 100"
        :fixed="col.fixed || false"
        :fixed-position="col.fixedPosition"
        :allow-sorting="col.allowSorting !== false"
        css-class="cell-column"
        :cell-template="col.cellTemplate"
        :header-cell-template="col.headerCellTemplate"
      />

      <!-- Fixed action column on right -->
      <DxColumn
        v-if="showActions"
        caption=""
        :width="actionColumnWidth"
        :min-width="actionColumnWidth"
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

      <template #actionsTemplate="{ data }">
        <div class="action-buttons d-flex align-items-center" :data-row-id="data.data[keyExpr]">
          <slot name="actions" :data="data.data">
            <!-- Default action buttons -->
            <button
              v-for="action in actionButtons"
              :key="action.name"
              class="action-btn d-flex align-items-center justify-content-center bg-transparent border-0 rounded-1"
              :title="action.title"
              @click="$emit('action', { action: action.name, data: data.data })"
            >
              <span :class="['icon', 'd-inline-block', 'flex-shrink-0', action.icon]"></span>
            </button>
          </slot>
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
import { computed } from 'vue'
import { DxDataGrid, DxColumn, DxSelection, DxScrolling, DxPaging } from 'devextreme-vue/data-grid'
import MsButton from '@/components/bases/MsButton.vue'
import MsSelect from '@/components/bases/MsSelect.vue'

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
  actionButtons: {
    type: Array,
    default: () => [
      { name: 'stop', title: 'Ngừng theo dõi', icon: 'icon-mi-circle-minus-yellow' },
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

const emit = defineEmits(['selection-changed', 'action', 'update:currentPage', 'update:pageSize', 'page-change', 'page-size-change'])

// Pagination computed
const totalPages = computed(() => Math.ceil(props.totalRecords / props.pageSize))
const startRecord = computed(() => (props.currentPage - 1) * props.pageSize + 1)
const endRecord = computed(() => Math.min(props.currentPage * props.pageSize, props.totalRecords))

// Pagination methods
const onPageSizeChange = (newSize) => {
  emit('update:pageSize', newSize)
  emit('update:currentPage', 1)
  emit('page-size-change', newSize)
}

const prevPage = () => {
  if (props.currentPage > 1) {
    const newPage = props.currentPage - 1
    emit('update:currentPage', newPage)
    emit('page-change', newPage)
  }
}

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    const newPage = props.currentPage + 1
    emit('update:currentPage', newPage)
    emit('page-change', newPage)
  }
}

const columnsWithTemplates = computed(() => {
  return props.columns.filter(col => col.cellTemplate)
})

const onSelectionChanged = (e) => {
  emit('selection-changed', e.selectedRowsData)
}
</script>

<style scoped>
/* Table Section */
.base-table-wrapper {
  min-height: 0;
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

/* Pagination */
.base-pagination {
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
  color: #212121;
  padding: 0 16px;
  border: none;
  border-bottom: 1px solid #ebebeb;
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

/* Action column fixed right - show on hover */
.base-table-wrapper .dx-datagrid-rowsview .dx-row .action-buttons {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.base-table-wrapper .dx-datagrid-rowsview .dx-row:hover .action-buttons,
.base-table-wrapper .dx-datagrid-content-fixed .dx-row:hover .action-buttons {
  opacity: 1;
}
</style>
