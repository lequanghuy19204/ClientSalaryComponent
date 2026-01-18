<template>
  <div class="ms-filter-checkbox" :class="{ 'checked-item': modelValue }">
    <!-- Checkbox Header -->
    <div class="filter-checkbox-header d-flex align-items-center" @click="toggleCheck">
      <div class="filter-checkbox-box">
        <span
          class="icon d-inline-block"
          :class="checkboxIconClass"
        ></span>
      </div>
      <span class="filter-checkbox-label">{{ label }}</span>
    </div>

    <!-- Filter Options (shown when checked) -->
    <Transition name="expand">
      <div v-if="modelValue" class="filter-checkbox-options">
        <!-- Condition Select -->
        <MsSelect
          v-model="conditionValue"
          :options="conditionOptions"
          placeholder="Chọn điều kiện"
          size="small"
          class="filter-condition-select"
        />
        <!-- Value Input -->
        <MsInput
          v-if="showValueInput"
          v-model="inputValue"
          placeholder="Nhập giá trị"
          class="filter-value-input"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import MsInput from '@/components/bases/form/MsInput.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  conditionOptions: {
    type: Array,
    default: () => [
      { value: 'contains', label: 'Chứa' },
      { value: 'notContains', label: 'Không chứa' },
      { value: 'equals', label: 'Bằng' },
      { value: 'startsWith', label: 'Bắt đầu bằng' },
      { value: 'endsWith', label: 'Kết thúc bằng' },
      { value: 'empty', label: 'Trống' },
      { value: 'notEmpty', label: 'Không trống' }
    ]
  },
  condition: {
    type: String,
    default: 'contains'
  },
  value: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'update:condition', 'update:value', 'change'])

const conditionValue = ref(props.condition)
const inputValue = ref(props.value)

watch(conditionValue, (val) => {
  emit('update:condition', val)
})

watch(inputValue, (val) => {
  emit('update:value', val)
})

const checkboxIconClass = computed(() => {
  return props.modelValue ? 'icon-mi-square-check-primary' : 'icon-mi-square-default'
})

const showValueInput = computed(() => {
  return conditionValue.value !== 'empty' && conditionValue.value !== 'notEmpty'
})

const toggleCheck = () => {
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.ms-filter-checkbox {
  padding: 8px 16px;
}

.ms-filter-checkbox.checked-item {
  padding-bottom: 8px;
  background: #eafbf2;
  border-radius: 4px;
  margin: 8px;
}

.filter-checkbox-header {
  cursor: pointer;
  gap: 8px;
}

.filter-checkbox-box {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.filter-checkbox-label {
  font-size: 14px;
  color: #212121;
  flex: 1;
  user-select: none;
}

.filter-checkbox-options {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-condition-select :deep(.ms-select) {
  width: 100%;
  height: 36px;
}

.filter-value-input :deep(.ms-input-wrapper) {
  width: 100%;
  height: 36px;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
