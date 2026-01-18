<template>
  <div class="ms-multiselect-wrapper" :class="{ 'ms-multiselect-error': hasError, 'ms-multiselect-disabled': disabled }">
    <MultiSelect
      v-model="modelValue"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :display="display"
      :maxSelectedLabels="maxSelectedLabels"
      :class="['ms-multiselect', selectClass, sizeClass]"
      :panelClass="'ms-multiselect-panel'"
      @change="onChange"
      @blur="onBlur"
      @focus="onFocus"
    >
      <template #dropdownicon>
        <span class="icon-down"></span>
      </template>
    </MultiSelect>
    <span v-if="hasError && errorMessage" class="ms-multiselect-error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MultiSelect from 'primevue/multiselect'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  optionLabel: {
    type: String,
    default: 'name'
  },
  optionValue: {
    type: String,
    default: 'id'
  },
  placeholder: {
    type: String,
    default: 'Chọn...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  display: {
    type: String,
    default: 'chip' // 'comma', 'chip'
  },
  maxSelectedLabels: {
    type: Number,
    default: 3
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  selectClass: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'large', // 'small', 'medium', 'large', 'full'
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/** Tính toán class CSS cho kích thước của multiselect */
const sizeClass = computed(() => {
  const sizes = {
    small: 'ms-multiselect-small',
    medium: 'ms-multiselect-medium',
    large: 'ms-multiselect-large',
    full: 'ms-multiselect-full'
  }
  return sizes[props.size] || 'ms-multiselect-large'
})

/** Xử lý khi thay đổi giá trị */
const onChange = (event) => {
  emit('change', event)
}

/** Xử lý khi blur */
const onBlur = (event) => {
  emit('blur', event)
}

/** Xử lý khi focus */
const onFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
.ms-multiselect-wrapper {
  display: flex;
  flex-direction: column;
}

/* Size variants */
:deep(.ms-multiselect-small) {
  width: 200px;
}

:deep(.ms-multiselect-medium) {
  width: 350px;
}

:deep(.ms-multiselect-large) {
  width: 674px;
  max-width: 100%;
}

:deep(.ms-multiselect-full) {
  width: 100%;
}

:deep(.ms-multiselect) {
  min-height: 34px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.ms-multiselect .p-multiselect-label) {
  padding: 0 8px !important;
  font-size: 14px !important;
  color: #212121;
  display: flex !important;
  align-items: center !important;
  min-height: 32px !important;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.ms-multiselect .p-multiselect-dropdown) {
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ms-multiselect:not(.p-disabled):hover) {
  border-color: #c4c4c4;
}

:deep(.ms-multiselect:not(.p-disabled).p-focus) {
  border-color: #34b057;
  box-shadow: 0 0 0 1px #34b057;
}

.ms-multiselect-error :deep(.ms-multiselect) {
  border-color: #ff6161;
}

.ms-multiselect-error :deep(.ms-multiselect:not(.p-disabled).p-focus) {
  border-color: #ff6161;
  box-shadow: 0 0 0 1px #ff6161;
}

.ms-multiselect-disabled :deep(.ms-multiselect) {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.ms-multiselect-error-message {
  font-size: 12px;
  color: #ff6161;
  margin-top: 4px;
}

/* Chip styles */
:deep(.ms-multiselect .p-multiselect-chip) {
  height: 22px !important;
  padding: 0 8px !important;
  line-height: 22px !important;
  font-size: 13px !important;
  background: #eafbf2;
  color: #212121;
  border-radius: 3px;
}

:deep(.ms-multiselect .p-multiselect-chip .p-chip-remove-icon) {
  font-size: 12px;
  margin-left: 4px;
}
</style>

<!-- Global styles for MultiSelect overlay -->
<style>
.ms-multiselect-panel {
  font-size: 14px !important;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ms-multiselect-panel .p-multiselect-header {
  font-size: 14px !important;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.ms-multiselect-panel .p-multiselect-option {
  font-size: 14px !important;
  padding: 8px 12px !important;
  color: #212121;
}

.ms-multiselect-panel .p-multiselect-option:hover {
  background: #eafbf2 !important;
}

.ms-multiselect-panel .p-multiselect-option.p-highlight {
  background: #eafbf2 !important;
  color: #34b057 !important;
}

.ms-multiselect-panel .p-checkbox.p-highlight .p-checkbox-box {
  background: #34b057 !important;
  border-color: #34b057 !important;
}
</style>
