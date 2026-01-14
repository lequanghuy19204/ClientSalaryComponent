<template>
  <div class="ms-select-wrapper d-flex flex-column" :class="{ 'ms-select-error': hasError, 'ms-select-disabled': disabled }">
    <Select
      v-model="modelValue"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['ms-select', selectClass, sizeClass]"
      :panelClass="'ms-select-panel'"
      @change="onChange"
      @blur="onBlur"
      @focus="onFocus"
    >
      <template #dropdownicon>
        <span class="icon-down"></span>
      </template>
    </Select>
    <span v-if="hasError && errorMessage" class="ms-select-error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  placeholder: {
    type: String,
    default: 'Chọn...'
  },
  disabled: {
    type: Boolean,
    default: false
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
    default: 'medium', // 'small', 'medium', 'large', 'full'
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const sizeClass = computed(() => {
  const sizes = {
    small: 'ms-select-small',
    medium: 'ms-select-medium',
    large: 'ms-select-large',
    full: 'ms-select-full'
  }
  return sizes[props.size] || 'ms-select-medium'
})

const onChange = (event) => {
  emit('change', event)
}

const onBlur = (event) => {
  emit('blur', event)
}

const onFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
/* Size variants */
:deep(.ms-select-small) {
  width: 110px;
}

:deep(.ms-select-medium) {
  width: 237px;
}

:deep(.ms-select-large) {
  width: 674px;
  max-width: 100%;
}

:deep(.ms-select-full) {
  width: 100%;
}

:deep(.ms-select) {
  height: 34px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.ms-select .p-select-label) {
  padding: 0 12px !important;
  line-height: 32px !important;
  font-size: 14px !important;
  color: #212121;
  display: flex !important;
  align-items: center !important;
  height: 32px !important;
}

:deep(.ms-select .p-select-dropdown) {
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ms-select:not(.p-disabled):hover) {
  border-color: #c4c4c4;
}

:deep(.ms-select:not(.p-disabled).p-focus) {
  border-color: #34b057;
  box-shadow: 0 0 0 1px #34b057;
}

.ms-select-error :deep(.ms-select) {
  border-color: #ff6161;
}

.ms-select-error :deep(.ms-select:not(.p-disabled).p-focus) {
  border-color: #ff6161;
  box-shadow: 0 0 0 1px #ff6161;
}

.ms-select-disabled :deep(.ms-select) {
  background-color: #e8eaef;
  cursor: not-allowed;
  opacity: 0.7;
}

.ms-select-error-message {
  font-size: 12px;
  color: #ff6161;
}
</style>

<!-- Global styles for Select overlay -->
<style>
.ms-select-panel {
  font-size: 14px !important;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ms-select-panel .p-select-option {
  font-size: 14px !important;
  padding: 8px 12px !important;
  color: #212121;
}

.ms-select-panel .p-select-option:hover {
  background: #eafbf2 !important;
}

.ms-select-panel .p-select-option.p-highlight {
  background: #eafbf2 !important;
  color: #34b057 !important;
}
</style>
