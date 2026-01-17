<template>
  <div class="ms-input-wrapper d-flex flex-column w-100" :class="{ 'ms-input-error': hasError, 'ms-input-disabled': disabled }">
    <InputText
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :autofocus="autofocus"
      :class="['ms-input', inputClass]"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
    />
    <span v-if="hasError && errorMessage" class="ms-input-error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: [String, Number],
    default: undefined
  },
  autofocus: {
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
  inputClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/** Xử lý sự kiện nhập liệu */
const onInput = (event) => {
  emit('input', event)
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
:deep(.ms-input) {
  height: 34px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #212121;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.ms-input::placeholder) {
  color: #666;
}

:deep(.ms-input:enabled:hover) {
  border-color: #34b057;
}

:deep(.ms-input:enabled:focus) {
  border-color: #34b057;
  box-shadow: 0 0 0 1px #34b057;
  outline: none;
}

.ms-input-error :deep(.ms-input) {
  border-color: #ff6161;
}

.ms-input-error :deep(.ms-input:enabled:focus) {
  border-color: #ff6161;
  box-shadow: 0 0 0 1px #ff6161;
}

.ms-input-disabled :deep(.ms-input) {
  background-color: #e8eaef;
  cursor: not-allowed;
  opacity: 0.7;
}

.ms-input-error-message {
  font-size: 12px;
  color: #ff6161;
}
</style>
