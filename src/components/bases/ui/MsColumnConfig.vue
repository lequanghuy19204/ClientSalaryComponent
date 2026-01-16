<template>
  <div class="ms-column-config">
    <MsButton
      icon="icon-mi-setting"
      variant="text"
      class="config-trigger"
      title="Thiết lập"
      @click="togglePopup"
    />

    <!-- Overlay -->
    <div v-if="isOpen" class="config-overlay" @click="closePopup"></div>

    <!-- Popup -->
    <Transition name="fade">
      <div v-if="isOpen" class="config-popup">
        <!-- Header -->
        <div class="popup-header">
          <div class="header-title">Tùy chỉnh cột</div>
          <button class="btn-reset" @click="resetToDefault" title="Khôi phục mặc định">
            <span class="icon icon-mi-update"></span>
          </button>
        </div>

        <!-- Search -->
        <div class="popup-search">
          <div class="search-wrapper">
            <span class="icon icon-search"></span>
            <input
              v-model="searchText"
              type="text"
              placeholder="Tìm kiếm"
              class="search-input"
            />
          </div>
        </div>

        <!-- Column List -->
        <div class="popup-body">
          <VueDraggableNext
            v-model="filteredColumns"
            :animation="200"
            handle=".drag-handle"
            ghost-class="ghost"
            @end="onDragEnd"
          >
            <div
              v-for="col in filteredColumns"
              :key="col.dataField"
              class="column-item"
            >
              <div class="column-content">
                <label class="column-checkbox" @click.prevent="toggleColumn(col)">
                  <span
                    class="icon checkbox-icon"
                    :class="col.visible !== false ? 'icon-mi-square-check-primary' : 'icon-mi-square-default'"
                  ></span>
                  <span class="column-name" :title="col.caption">{{ col.caption }}</span>
                </label>
                <span class="drag-handle" :class="{ disabled: col.fixed }">
                  <span class="icon icon-mi-move"></span>
                </span>
              </div>
            </div>
          </VueDraggableNext>

          <!-- Empty State -->
          <div v-if="filteredColumns.length === 0" class="empty-state">
            <span class="empty-text">Không có dữ liệu</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="popup-footer">
          <MsButton label="Lưu" variant="primary" class="btn-save" @click="applyChanges" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import MsButton from './MsButton.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  defaultColumns: {
    type: Array,
    default: () => []
  },
  storageKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:columns'])

const isOpen = ref(false)
const localColumns = ref([])
const searchText = ref('')

const filteredColumns = computed({
  get() {
    if (!searchText.value.trim()) {
      return localColumns.value
    }
    const keyword = searchText.value.toLowerCase().trim()
    return localColumns.value.filter(col =>
      col.caption.toLowerCase().includes(keyword)
    )
  },
  set(newValue) {
    localColumns.value = newValue
  }
})

const togglePopup = () => {
  if (!isOpen.value) {
    localColumns.value = props.columns.map(c => ({ ...c }))
    searchText.value = ''
  }
  isOpen.value = !isOpen.value
}

const closePopup = () => {
  isOpen.value = false
}

const toggleColumn = (col) => {
  const target = localColumns.value.find(c => c.dataField === col.dataField)
  if (target) {
    target.visible = target.visible === false ? true : false
  }
}

const resetToDefault = () => {
  const defaults = props.defaultColumns.length > 0 ? props.defaultColumns : props.columns
  localColumns.value = defaults.map(c => ({
    ...c,
    visible: true
  }))
}

const onDragEnd = () => {
  // Drag end handled by v-model
}

const applyChanges = () => {
  emit('update:columns', [...localColumns.value])
  if (props.storageKey) {
    localStorage.setItem(props.storageKey, JSON.stringify(localColumns.value))
  }
  closePopup()
}

watch(() => props.columns, (newCols) => {
  if (!isOpen.value) {
    localColumns.value = newCols.map(c => ({ ...c }))
  }
}, { immediate: true })
</script>

<style scoped>
.ms-column-config {
  position: relative;
}

.config-trigger {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
}

.config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.config-popup {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  width: 400px;
  max-height: 100vh;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

/* Header */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #212121;
}

.btn-reset {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-reset:hover {
  background: #f5f5f5;
}

/* Search */
.popup-search {
  padding: 12px 16px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0 8px;
  background: #fff;
}

.search-wrapper:focus-within {
  border-color: #34b057;
}

.search-wrapper .icon-search {
  flex-shrink: 0;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #212121;
  background: transparent;
}

.search-input::placeholder {
  color: #9e9e9e;
}

/* Body */
.popup-body {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  padding: 0 8px;
}

.column-item {
  padding: 0 8px;
}

.column-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.column-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.checkbox-icon {
  flex-shrink: 0;
}

.column-name {
  font-size: 14px;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drag-handle {
  cursor: all-scroll;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.column-item:hover .drag-handle {
  opacity: 1;
}

.drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.ghost {
  opacity: 0.5;
  background: #eafbf2;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}

.empty-text {
  font-size: 14px;
  font-style: italic;
  color: #9e9e9e;
}

/* Footer */
.popup-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #f2f2f2;
  border-radius: 0 0 4px 4px;
}

.btn-save {
  min-width: 80px;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
