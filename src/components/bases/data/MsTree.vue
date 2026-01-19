<template>
  <div class="ms-tree-wrapper" :class="{ 'ms-tree-disabled': disabled, 'has-selection': selectedValue.length > 0 }">
    <DxDropDownBox
      ref="dropDownBoxRef"
      class="ms-tree"
      v-model:value="selectedValue"
      :show-clear-button="showClearButton"
      :data-source="flatList"
      :value-expr="keyExpr"
      :display-expr="displayExpr"
      :placeholder="placeholder"
      :disabled="disabled"
      :open-on-field-click="true"
      :defer-rendering="false"
      @value-changed="onValueChanged"
    >
      <template #content>
        <div class="ms-tree-content">
          <div class="ms-tree-search">
            <span class="icon-search ms-tree-search-icon"></span>
            <MsInput
              v-model="searchText"
              class="ms-tree-search-input"
              :placeholder="searchPlaceholder"
            />
          </div>
          <DxTreeView
            ref="treeViewRef"
            :data-source="treeData"
            :key-expr="keyExpr"
            :display-expr="displayExpr"
            :items-expr="itemsExpr"
            :selection-mode="selectionMode"
            show-check-boxes-mode="normal"
            :select-nodes-recursive="selectNodesRecursive"
            :select-by-click="true"
            :search-enabled="true"
            :search-mode="'contains'"
            :search-expr="displayExpr"
            :search-value="searchText"
            expand-all-enabled
            @content-ready="treeViewContentReady"
            @item-selection-changed="treeViewItemSelectionChanged"
          />
        </div>
      </template>
    </DxDropDownBox>
    <!-- Custom display overlay for selected items -->
    <div class="ms-tree-display" @click="openDropdown">
      <span v-if="selectedValue.length === 0" class="ms-tree-placeholder">{{ placeholder }}</span>
      <div v-else class="ms-tree-selected-items">
        <template v-for="(name, index) in visibleFilterItems" :key="index">
          <div class="ms-tree-chip">
            <span class="ms-tree-chip-label" :title="name">{{ name }}</span>
            <span class="ms-tree-chip-remove icon-mi-close-small" @click.stop="removeFilterItem(index)"></span>
          </div>
        </template>
        <div v-if="hiddenFilterCount > 0" class="ms-tree-chip ms-tree-chip-more">
          +{{ hiddenFilterCount }}
        </div>
      </div>
      <span class="icon-down ms-tree-dropdown-icon"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import DxDropDownBox from 'devextreme-vue/drop-down-box'
import DxTreeView from 'devextreme-vue/tree-view'
import MsInput from '@/components/bases/form/MsInput.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  dataSource: {
    type: Array,
    default: () => []
  },
  keyExpr: {
    type: String,
    default: 'id'
  },
  displayExpr: {
    type: String,
    default: 'name'
  },
  itemsExpr: {
    type: String,
    default: 'items'
  },
  selectionMode: {
    type: String,
    default: 'multiple'
  },
  selectNodesRecursive: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: 'Chọn...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm'
  },
  showClearButton: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxSelectedLabels: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// State
const selectedValue = ref([...props.modelValue])
const treeViewRef = ref(null)
const dropDownBoxRef = ref(null)
const isSyncing = ref(false)
const didFirstExpand = ref(false)
const searchText = ref('')

/** Mở dropdown theo chương trình */
function openDropdown() {
  const instance = dropDownBoxRef.value?.instance
  if (instance) {
    instance.open()
  }
}

// Computed
const treeData = computed(() => props.dataSource)

const flatList = computed(() => flattenTree(treeData.value, [], props.itemsExpr))

const selectedNames = computed(() => {
  const idKey = props.keyExpr
  const nameKey = props.displayExpr
  const ids = new Set(
    Array.isArray(selectedValue.value)
      ? selectedValue.value.map((x) => String(x))
      : []
  )
  if (!flatList.value?.length || ids.size === 0) return []

  const byId = new Map()
  const childrenByParent = new Map()

  for (const raw of flatList.value) {
    const idStr = String(raw[idKey])
    const parentIdStr = raw.parentId == null ? null : String(raw.parentId)
    const nameStr = String(raw[nameKey] ?? '')
    byId.set(idStr, { id: idStr, name: nameStr, parentId: parentIdStr })
    if (!childrenByParent.has(parentIdStr)) childrenByParent.set(parentIdStr, [])
    childrenByParent.get(parentIdStr).push(idStr)
  }

  const parentsToDisplay = new Set()
  childrenByParent.forEach((childIds, parentId) => {
    if (parentId == null) return
    if (!childIds || childIds.length === 0) return
    const parentSelected = ids.has(parentId)
    const allChildrenSelected = childIds.every((cid) => ids.has(cid))
    if (parentSelected || allChildrenSelected) parentsToDisplay.add(parentId)
  })

  function hasAncestorInSet(nodeId, set) {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (set.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }

  const effectiveParents = new Set()
  parentsToDisplay.forEach((pid) => {
    if (!hasAncestorInSet(pid, parentsToDisplay)) effectiveParents.add(pid)
  })

  function isCoveredByDisplayedParent(nodeId) {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (effectiveParents.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }

  const displayIds = new Set()
  effectiveParents.forEach((pid) => displayIds.add(pid))
  ids.forEach((sid) => {
    if (!isCoveredByDisplayedParent(sid) && !displayIds.has(sid)) displayIds.add(sid)
  })

  const result = []
  for (const raw of flatList.value) {
    const idStr = String(raw[idKey])
    if (displayIds.has(idStr)) result.push(String(raw[nameKey] ?? ''))
  }
  return result
})

// Map each display item to its ID and all descendant IDs
const displayItemsWithIds = computed(() => {
  const idKey = props.keyExpr
  const nameKey = props.displayExpr
  const ids = new Set(
    Array.isArray(selectedValue.value)
      ? selectedValue.value.map((x) => String(x))
      : []
  )
  if (!flatList.value?.length || ids.size === 0) return []

  const byId = new Map()
  const childrenByParent = new Map()

  for (const raw of flatList.value) {
    const idStr = String(raw[idKey])
    const parentIdStr = raw.parentId == null ? null : String(raw.parentId)
    const nameStr = String(raw[nameKey] ?? '')
    byId.set(idStr, { id: idStr, name: nameStr, parentId: parentIdStr })
    if (!childrenByParent.has(parentIdStr)) childrenByParent.set(parentIdStr, [])
    childrenByParent.get(parentIdStr).push(idStr)
  }

  // Get all descendants of a node
  function getAllDescendants(nodeId) {
    const descendants = []
    const children = childrenByParent.get(nodeId) || []
    for (const childId of children) {
      if (ids.has(childId)) descendants.push(childId)
      descendants.push(...getAllDescendants(childId))
    }
    return descendants
  }

  const parentsToDisplay = new Set()
  childrenByParent.forEach((childIds, parentId) => {
    if (parentId == null) return
    if (!childIds || childIds.length === 0) return
    const parentSelected = ids.has(parentId)
    const allChildrenSelected = childIds.every((cid) => ids.has(cid))
    if (parentSelected || allChildrenSelected) parentsToDisplay.add(parentId)
  })

  function hasAncestorInSet(nodeId, set) {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (set.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }

  const effectiveParents = new Set()
  parentsToDisplay.forEach((pid) => {
    if (!hasAncestorInSet(pid, parentsToDisplay)) effectiveParents.add(pid)
  })

  function isCoveredByDisplayedParent(nodeId) {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (effectiveParents.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }

  const displayIds = new Set()
  effectiveParents.forEach((pid) => displayIds.add(pid))
  ids.forEach((sid) => {
    if (!isCoveredByDisplayedParent(sid) && !displayIds.has(sid)) displayIds.add(sid)
  })

  const result = []
  for (const raw of flatList.value) {
    const idStr = String(raw[idKey])
    if (displayIds.has(idStr)) {
      // Collect this ID and all its selected descendants
      const idsToRemove = [idStr, ...getAllDescendants(idStr)]
      result.push({
        name: String(raw[nameKey] ?? ''),
        idsToRemove
      })
    }
  }
  return result
})

/** Danh sách các mục đã chọn hiển thị (giới hạn bởi maxSelectedLabels) */
const visibleFilterItems = computed(() => {
  return selectedNames.value.slice(0, props.maxSelectedLabels)
})

/** Số lượng mục đã chọn bị ẩn (hiển thị dạng "+N") */
const hiddenFilterCount = computed(() => {
  return selectedNames.value.length > props.maxSelectedLabels
    ? selectedNames.value.length - props.maxSelectedLabels
    : 0
})

// Watch modelValue from parent
watch(() => props.modelValue, (newVal) => {
  if (isSyncing.value) return
  selectedValue.value = [...newVal]
}, { deep: true })

/** Chuyển đổi cây thành danh sách phẳng */
function flattenTree(nodes, result = [], itemsKey = 'items', parentId = null) {
  if (!nodes) return result
  for (const node of nodes) {
    const id = node[props.keyExpr]
    const name = node[props.displayExpr]
    result.push({
      [props.keyExpr]: id,
      [props.displayExpr]: name,
      parentId
    })
    const children = node[itemsKey]
    if (children && children.length) {
      flattenTree(children, result, itemsKey, id)
    }
  }
  return result
}

/** Xử lý khi nội dung TreeView sẵn sàng */
function treeViewContentReady() {
  syncTreeViewSelection()
  expandRootNodesOnce()
}

/** Đồng bộ lựa chọn trong TreeView */
function syncTreeViewSelection() {
  const treeView = treeViewRef.value?.instance
  if (!treeView) return
  if (isSyncing.value) return
  isSyncing.value = true
  try {
    treeView.unselectAll()
    selectedValue.value?.forEach((val) => {
      treeView.selectItem(val)
    })
  } finally {
    isSyncing.value = false
  }
}

/** Xử lý khi thay đổi lựa chọn item */
function treeViewItemSelectionChanged(e) {
  if (isSyncing.value) return
  const treeView = e.component
  const node = e.node
  if (node) {
    toggleChildrenSelection(treeView, node, node.selected)
  }
  const keys = treeView.getSelectedNodeKeys()
  selectedValue.value = keys
  emit('update:modelValue', keys)
  emit('change', { value: keys, event: e })
}

/** Mở rộng các node gốc một lần */
function expandRootNodesOnce() {
  if (didFirstExpand.value) return
  const treeView = treeViewRef.value?.instance
  if (!treeView) return
  const idKey = props.keyExpr
  try {
    const roots = (flatList.value || [])
      .filter((n) => n.parentId == null)
      .map((n) => n[idKey])
    roots.forEach((id) => treeView.expandItem(id))
    didFirstExpand.value = true
  } catch {
    didFirstExpand.value = true
  }
}

/** Bật/tắt lựa chọn tất cả con */
function toggleChildrenSelection(treeView, node, selected) {
  if (!node || !node.children || !node.children.length) return

  // Chỉ set isSyncing ở cấp gọi đầu tiên, tránh reset sai khi đệ quy
  const wasAlreadySyncing = isSyncing.value
  if (!wasAlreadySyncing) {
    isSyncing.value = true
  }

  try {
    node.children.forEach((child) => {
      if (selected) treeView.selectItem(child.key)
      else treeView.unselectItem(child.key)
      toggleChildrenSelection(treeView, child, selected)
    })
  } finally {
    // Chỉ reset khi đây là cấp gọi đầu tiên
    if (!wasAlreadySyncing) {
      isSyncing.value = false
    }
  }
}

/** Xóa một item khỏi bộ lọc */
function removeFilterItem(index) {
  if (isSyncing.value) return
  isSyncing.value = true
  
  // Get the display item at this index - it contains all IDs to remove (parent + descendants)
  const displayItem = displayItemsWithIds.value[index]
  if (!displayItem) {
    isSyncing.value = false
    return
  }
  
  const idsToRemove = new Set(displayItem.idsToRemove)
  
  // Filter out all IDs that need to be removed
  const newValue = selectedValue.value.filter(id => !idsToRemove.has(String(id)))
  selectedValue.value = newValue
  emit('update:modelValue', newValue)
  emit('change', { value: newValue })

  // Unselect all removed items in the tree
  const treeView = treeViewRef.value?.instance
  if (treeView) {
    idsToRemove.forEach(id => {
      treeView.unselectItem(id)
    })
  }
  
  // Delay reset isSyncing to allow async events to complete
  nextTick(() => {
    setTimeout(() => {
      isSyncing.value = false
    }, 50)
  })
}

/** Xử lý khi giá trị thay đổi */
function onValueChanged(e) {
  if (isSyncing.value) return
  if (e.value === null || (Array.isArray(e.value) && e.value.length === 0)) {
    isSyncing.value = true
    selectedValue.value = []
    emit('update:modelValue', [])
    emit('change', { value: [] })
    
    // Delay reset isSyncing to allow async events to complete
    nextTick(() => {
      setTimeout(() => {
        isSyncing.value = false
      }, 50)
    })
  }
}
</script>

<style>
/* Force DevExtreme component height */
.ms-tree.dx-dropdownbox,
.ms-tree.dx-texteditor {
  height: 34px !important;
  min-height: 34px !important;
}

/* DevExtreme TreeView toggle icon */
.dx-treeview-toggle-item-visibility {
  mask-image: url('@/assets/icons/Icon1.svg');
  mask-repeat: no-repeat;
  background-color: currentColor;
  mask-position: -122px -42px;
  width: 16px !important;
  height: 16px !important;
}

.dx-treeview-toggle-item-visibility.dx-treeview-toggle-item-visibility-opened {
  mask-position: -102px -42px;
  width: 16px !important;
  height: 16px !important;
}

/* Fix DevExtreme DropDownBox field template */
.ms-tree .dx-dropdowneditor-input-wrapper {
  display: flex !important;
  align-items: center;
  width: 100%;
}

/* Hide default input but keep container for custom template */
.ms-tree .dx-texteditor-input-container {
  flex: 1;
  display: flex !important;
  align-items: center;
}

.ms-tree .dx-texteditor-container {
  height: 32px !important;
}

/* Hide default DevExtreme input and placeholder */
.ms-tree .dx-texteditor-input-container > input.dx-texteditor-input {
  display: none !important;
}

.ms-tree .dx-texteditor-input-container > .dx-placeholder {
  display: none !important;
}

.ms-tree .dx-dropdowneditor-button {
  width: 34px;
  min-width: 34px;
  display: none;
}

.ms-tree .dx-dropdowneditor-icon {
  mask-image: url('@/assets/icons/Icon1.svg');
  mask-repeat: no-repeat;
  background-color: #666;
  mask-position: -104px -7px;
  width: 12px !important;
  height: 6px !important;
}

/* Hide default TreeView search */
.dx-treeview-search {
  display: none !important;
}

/* Reduce popup content padding */
.dx-popup-content {
  padding: 10px !important;
}

/* Ensure checkbox is clickable */
.dx-treeview .dx-checkbox {
  cursor: pointer;
}

/* Style DevExtreme checkbox with custom icons */
.dx-treeview .dx-checkbox .dx-checkbox-icon {
  width: 20px !important;
  height: 20px !important;
  border: none !important;
  background: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -240px 0px !important;
}

.dx-treeview .dx-checkbox .dx-checkbox-icon::before {
  display: none !important;
}

/* Checked state - use icon-mi-square-check-primary */
.dx-treeview .dx-checkbox-checked .dx-checkbox-icon {
  background: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -260px 0px !important;
}

/* Indeterminate state */
.dx-treeview .dx-checkbox-indeterminate .dx-checkbox-icon {
  background: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -260px 0px !important;
}

/* TreeView item styles */
.dx-treeview-item {
  padding: 6px 8px;
}

.dx-treeview-node.dx-state-selected > .dx-treeview-item {
  background-color: transparent;
  color: #212121;
}

.dx-treeview-node.dx-state-hover > .dx-treeview-item {
  background-color: #f5f5f5;
}

.dx-treeview-item-content {
  font-size: 14px;
  color: #212121;
}
</style>

<style scoped>
.ms-tree-wrapper {
  display: inline-flex;
  flex-direction: column;
  position: relative;
}

/* Custom display overlay - positioned over DevExtreme input */
.ms-tree-display {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 34px 0 8px;
  cursor: pointer;
  background: transparent;
  z-index: 1;
  height: 34px;
  line-height: 34px;
}

.ms-tree-disabled {
  opacity: 0.7;
  pointer-events: none;
}

:deep(.ms-tree) {
  width: 350px;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
}

:deep(.ms-tree .dx-dropdowneditor-input-wrapper) {
  flex: 1;
  height: 32px !important;
}

:deep(.ms-tree .dx-texteditor-container) {
  height: 32px !important;
}

.ms-tree-wrapper:hover :deep(.ms-tree:not(.dx-state-disabled)) {
  border-color: #34b057;
}

:deep(.ms-tree.dx-state-focused) {
  border-color: #34b057;
  box-shadow: 0 0 0 1px #34b057;
}

/* Hide clear button when has selected items */
.ms-tree-wrapper.has-selection :deep(.dx-clear-button-area) {
  display: none !important;
}

.ms-tree-field {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 8px;
  gap: 8px;
  width: 100%;
  cursor: pointer;
}

.ms-tree-placeholder {
  color: #999;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-tree-selected-items {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  flex: 1;
  overflow: hidden;
  max-width: calc(100% - 10px);
}

.ms-tree-chip {
  display: inline-flex;
  align-items: center;
  gap: 0;
  height: 24px;
  padding: 0 4px 0 8px;
  background: #e8eaef !important;
  color: #212121;
  border-radius: 3px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  flex-shrink: 0;
}

.ms-tree-chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
  font-size: 14px;
}

.ms-tree-chip-remove {
  cursor: pointer;
  display: inline-block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.ms-tree-chip-remove:hover {
  opacity: 0.7;
}

.ms-tree-chip-more {
  background: #f0f0f0;
}

.ms-tree-dropdown-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: inline-block;
  z-index: 2;
  background: #fff;
  padding-left: 4px;
}

/* Search box */
.ms-tree-search {
  position: relative;
  padding: 16px 16px 16px 16px;
  border-bottom: none;
}

.ms-tree-search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
  display: inline-block;
}

.ms-tree-search-input {
  width: 100%;
}

:deep(.ms-tree-search-input input) {
  height: 36px;
  padding-left: 32px !important;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

:deep(.ms-tree-search-input input:hover),
:deep(.ms-tree-search-input input:focus) {
  border-color: #34b057 !important;
}

/* Responsive */
@media (max-width: 576px) {
  :deep(.ms-tree) {
    width: 100%;
    max-width: 280px;
  }
}
</style>
