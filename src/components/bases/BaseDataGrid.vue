<template>
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
</template>

<script setup>
import { computed } from 'vue'
import { DxDataGrid, DxColumn, DxSelection, DxScrolling, DxPaging } from 'devextreme-vue/data-grid'

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
  }
})

const emit = defineEmits(['selection-changed', 'action'])

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

.base-table-wrapper .dx-checkbox-icon {
  width: 16px;
  height: 16px;
}

.base-table-wrapper .dx-checkbox-checked .dx-checkbox-icon {
  background-color: #34b057;
  border-color: #34b057;
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
