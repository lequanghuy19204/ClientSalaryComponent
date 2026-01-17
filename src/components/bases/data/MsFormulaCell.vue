<template>
  <span v-if="!value || value === '-'" class="formula-empty">-</span>
  <span v-else class="formula-cell" v-html="highlightedCode"></span>
</template>

<script setup>
import { computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

// Define custom formula language for Prism (same as MsFormulaEditor)
if (!Prism.languages.formula) {
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
}

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

/** Tô màu cú pháp cho công thức */
const highlightedCode = computed(() => {
  if (!props.value || props.value === '-') return ''
  return Prism.highlight(props.value, Prism.languages.formula, 'formula')
})
</script>

<style scoped>
.formula-cell {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.formula-empty {
  color: #9e9e9e;
}

/* Syntax highlighting colors */
.formula-cell :deep(.token.keyword),
.formula-cell :deep(.token.function) {
  color: #0066cc;
  font-weight: 600;
}

.formula-cell :deep(.token.variable) {
  color: #0000ff;
}

.formula-cell :deep(.token.number) {
  color: #e65100;
}

.formula-cell :deep(.token.string) {
  color: #2e7d32;
}

.formula-cell :deep(.token.operator) {
  color: #ff0000;
}

.formula-cell :deep(.token.punctuation) {
  color: #ff0000;
}

.formula-cell :deep(.token.comment) {
  color: #9e9e9e;
  font-style: italic;
}
</style>
