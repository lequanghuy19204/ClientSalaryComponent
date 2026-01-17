<template>
  <div class="ms-formula-editor" :class="{ 'has-error': hasError, disabled: disabled }">
    <PrismEditor
      ref="editorRef"
      v-model="internalValue"
      :highlight="highlighter"
      :readonly="disabled"
      :placeholder="placeholder"
      class="formula-prism-editor"
      :line-numbers="lineNumbers"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <span v-if="hasError && errorMessage" class="error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'

import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

// Define custom formula language for Prism
Prism.languages.formula = {
  comment: /\/\/.*/,
  string: {
    pattern: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  function: {
    pattern: /\b(SUM|AVG|MIN|MAX|COUNT|IF|ROUND|ABS|FLOOR|CEIL|AND|OR|NOT)\b/i,
    alias: 'keyword'
  },
  variable: {
    pattern: /\b[A-Z_][A-Z0-9_]*\b/,
    alias: 'variable'
  },
  number: /\b\d+(?:\.\d+)?\b/,
  operator: /[+\-*/%=<>!&|^]+/,
  punctuation: /[()[\]{},;]/
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Nhập công thức...'
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
  lineNumbers: {
    type: Boolean,
    default: false
  },
  minHeight: {
    type: String,
    default: '70px'
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const editorRef = ref(null)
const isFocused = ref(false)

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/** Tô màu cú pháp cho code */
const highlighter = (code) => {
  return Prism.highlight(code, Prism.languages.formula, 'formula')
}

/** Xử lý sự kiện nhập liệu */
const onInput = () => {
  // Value is already synced via v-model
}

/** Xử lý khi focus vào editor */
const onFocus = () => {
  isFocused.value = true
  emit('focus')
}

/** Xử lý khi blur khỏi editor */
const onBlur = () => {
  isFocused.value = false
  emit('blur')
}

/** Focus vào editor từ bên ngoài */
const focus = () => {
  editorRef.value?.$el?.querySelector('textarea')?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.ms-formula-editor {
  position: relative;
  width: 100%;
  max-width: 540px;
}

.ms-formula-editor .formula-prism-editor {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  min-height: v-bind(minHeight);
  padding: 8px 12px;
  transition: border-color 0.2s ease;
}

.ms-formula-editor .formula-prism-editor:focus-within {
  border-color: #34b057;
  outline: none;
}

.ms-formula-editor.has-error .formula-prism-editor {
  border-color: #ff6161;
}

.ms-formula-editor.disabled .formula-prism-editor {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.ms-formula-editor .error-message {
  display: block;
  color: #ff6161;
  font-size: 12px;
  margin-top: 4px;
}

/* Prism Editor Internal Styles */
.ms-formula-editor :deep(.prism-editor__textarea) {
  outline: none;
  border: none;
  background: transparent;
  resize: none;
}

.ms-formula-editor :deep(.prism-editor__textarea:focus) {
  outline: none;
}

.ms-formula-editor :deep(.prism-editor__editor) {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.ms-formula-editor :deep(.prism-editor__container) {
  min-height: inherit;
}

/* Custom syntax highlighting colors */
.ms-formula-editor :deep(.token.keyword),
.ms-formula-editor :deep(.token.function) {
  color: #0066cc;
  font-weight: 600;
}

.ms-formula-editor :deep(.token.variable) {
  color: #0000ff;
}

.ms-formula-editor :deep(.token.number) {
  color: #e65100;
}

.ms-formula-editor :deep(.token.string) {
  color: #2e7d32;
}

.ms-formula-editor :deep(.token.operator) {
  color: #ff0000;
}

.ms-formula-editor :deep(.token.punctuation) {
  color: #ff0000;
}

.ms-formula-editor :deep(.token.comment) {
  color: #9e9e9e;
  font-style: italic;
}

/* Placeholder styling */
.ms-formula-editor :deep(.prism-editor__textarea::placeholder) {
  color: #9e9e9e;
  font-style: normal;
}
</style>
