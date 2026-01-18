<template>
  <Transition name="filter-slide">
    <div v-if="modelValue" class="ms-filter-panel">
      <!-- Header -->
      <div class="filter-panel-header">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="filter-panel-title">{{ title }}</h2>
          <div class="filter-panel-close" @click="close">
            <span class="icon icon-mi-close"></span>
          </div>
        </div>
        <!-- Search Input -->
        <div v-if="showSearch" class="filter-panel-search d-flex align-items-center">
          <div class="search-icon-wrapper d-flex align-items-center justify-content-center">
            <span class="icon d-inline-block flex-shrink-0 icon-search"></span>
          </div>
          <MsInput
            v-model="searchText"
            placeholder="Tìm kiếm"
            class="filter-search-input"
          />
        </div>
      </div>

      <!-- Filter Content -->
      <div class="filter-panel-content">
        <slot></slot>
      </div>

      <!-- Footer Actions -->
      <div class="filter-panel-footer">
        <MsButton
          label="Bỏ lọc"
          variant="outline"
          @click="onClearFilter"
        />
        <MsButton
          label="Áp dụng"
          variant="primary"
          @click="onApplyFilter"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'

const emit = defineEmits(['update:modelValue', 'clear', 'apply', 'search'])

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Bộ lọc'
  },
  showSearch: {
    type: Boolean,
    default: true
  }
})

const searchText = ref('')

watch(searchText, (val) => {
  emit('search', val)
})

const close = () => {
  emit('update:modelValue', false)
}

const onClearFilter = () => {
  emit('clear')
}

const onApplyFilter = () => {
  emit('apply')
  close()
}
</script>

<style scoped>
.ms-filter-panel {
  width: 250px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin-left: 16px !important;
}

.filter-panel-header {
  padding: 16px 16px 0px 16px;
  flex-shrink: 0;
}

.filter-panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  margin: 0;
}

.filter-panel-close {
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.filter-panel-close:hover {
  background: #f5f5f5;
}

.filter-panel-search {
  margin-top: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #eeeff2;
  overflow: hidden;
}

.filter-panel-search .search-icon-wrapper {
  padding-left: 8px;
}

.filter-panel-search :deep(.filter-search-input) {
  flex: 1;
}

.filter-panel-search :deep(.ms-input-wrapper) {
  background: transparent;
}

.filter-panel-search :deep(.ms-input) {
  border: none;
  background: transparent;
  box-shadow: none !important;
}

.filter-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.filter-panel-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

/* Transition */
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: width 0.25s ease, opacity 0.25s ease;
}

.filter-slide-enter-from,
.filter-slide-leave-to {
  width: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
