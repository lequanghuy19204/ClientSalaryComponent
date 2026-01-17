<template>
  <div class="ms-textarea-wrapper d-flex flex-column w-100" :class="{ 'ms-textarea-error': hasError, 'ms-textarea-disabled': disabled }">
    <Textarea
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :autoResize="autoResize"
      :maxlength="maxlength"
      :class="['ms-textarea', textareaClass]"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
    />
    <span v-if="hasError && errorMessage" class="ms-textarea-error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Textarea from 'primevue/textarea'

const props = defineProps({
  modelValue: {
    type: String,
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
  rows: {
    type: Number,
    default: 3
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  maxlength: {
    type: [String, Number],
    default: undefined
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  textareaClass: {
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
:deep(.ms-textarea) {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #212121;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 86px;
  max-width: 674px;
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  resize: none;
}

:deep(.ms-textarea::placeholder) {
  color: #666;
}

:deep(.ms-textarea:enabled:hover) {
  border-color: #34b057;
}

:deep(.ms-textarea:enabled:focus) {
  border-color: #34b057;
  box-shadow: 0 0 0 1px #34b057;
  outline: none;
}

.ms-textarea-error :deep(.ms-textarea) {
  border-color: #ff6161;
}

.ms-textarea-error :deep(.ms-textarea:enabled:focus) {
  border-color: #ff6161;
  box-shadow: 0 0 0 1px #ff6161;
}

.ms-textarea-disabled :deep(.ms-textarea) {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.ms-textarea-error-message {
  font-size: 12px;
  color: #ff6161;
  margin-top: 4px;
}
</style>
