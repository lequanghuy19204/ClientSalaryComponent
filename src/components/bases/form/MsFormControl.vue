<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsInput from './MsInput.vue'

defineOptions({
  name: 'MsFormControl',
})

const props = defineProps({
  fieldKeys: {
    type: Array,
    default: () => [],
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  displayOnly: {
    type: Boolean,
    default: false,
  },
  noEditButtons: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'view',
    validator: (value) => ['view', 'add', 'edit'].includes(value),
  },
  isFieldEditing: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const model = defineModel({ default: null })
const isFieldEditingModel = defineModel('isFieldEditing', { default: false })

const emit = defineEmits(['update', 'cancel', 'blur', 'restore'])

const getBundledValues = () => {
  const bundle = {}
  for (const key of props.fieldKeys) {
    bundle[key] = props.formData[key]
  }
  return bundle
}

const isInlineEditing = ref(false)
const isHovering = ref(false)
const localValue = ref(model.value)
const originalValue = ref(null)
const originalFormValues = ref({})
const inputWrapperRef = ref(null)

const isEditing = computed(() => {
  if (props.noEditButtons) return true
  if (props.readonly || props.displayOnly) return false
  if (props.mode !== 'view') return true
  return isInlineEditing.value
})

const isInteractive = computed(() => {
  if (props.noEditButtons) return true
  if (props.readonly || props.displayOnly || props.disabled) return false
  return isEditing.value
})

const showEditButton = computed(() => {
  if (props.noEditButtons) return false
  if (props.isFieldEditing && !isInlineEditing.value) return false
  return (
    props.mode === 'view' &&
    isHovering.value &&
    !props.readonly &&
    !props.displayOnly &&
    !props.disabled &&
    !isInlineEditing.value
  )
})

const showLockIcon = computed(() => {
  if (props.displayOnly) return false
  return props.readonly && isHovering.value
})

const showInlineActions = computed(() => {
  if (props.noEditButtons) return false
  return props.mode === 'view' && isInlineEditing.value
})

watch(model, (newVal, oldVal) => {
  localValue.value = newVal
  if (props.noEditButtons && newVal !== oldVal && props.mode === 'view') {
    emit('update', getBundledValues())
  }
})

const displayValue = computed(() => {
  if (model.value === null || model.value === undefined || model.value === '') {
    return ''
  }
  return String(model.value)
})

const startEdit = () => {
  if (props.disabled || props.readonly) return
  if (props.isFieldEditing) return
  isInlineEditing.value = true
  isFieldEditingModel.value = true
  // Lưu giá trị ban đầu để khôi phục khi hủy
  originalValue.value = model.value
  localValue.value = model.value
  // Lưu giá trị các field liên quan trong formData
  originalFormValues.value = {}
  for (const key of props.fieldKeys) {
    originalFormValues.value[key] = props.formData[key]
  }
  nextTick(() => {
    const input = inputWrapperRef.value?.querySelector('input')
    input?.focus()
  })
}

const handleSave = () => {
  if (props.mode !== 'view') return
  model.value = localValue.value
  emit('update', getBundledValues())
  isInlineEditing.value = false
  isFieldEditingModel.value = false
  // Xóa giá trị ban đầu sau khi lưu thành công
  originalValue.value = null
  originalFormValues.value = {}
}

const handleCancel = () => {
  // Khôi phục giá trị ban đầu
  if (originalValue.value !== null) {
    model.value = originalValue.value
  }
  // Emit event để component cha khôi phục giá trị các field trong formData
  if (Object.keys(originalFormValues.value).length > 0) {
    emit('restore', originalFormValues.value)
  }
  localValue.value = model.value
  isInlineEditing.value = false
  isFieldEditingModel.value = false
  originalValue.value = null
  originalFormValues.value = {}
  emit('cancel')
}

const handleInput = (value) => {
  localValue.value = value
  if (props.mode !== 'view') {
    model.value = localValue.value
  }
}

const handleBlur = () => {
  emit('blur')
}

const handleKeydown = (e) => {
  if (props.mode === 'view') {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
}

const focus = () => {
  const input = inputWrapperRef.value?.querySelector('input')
  input?.focus()
}

defineExpose({
  focus,
  startEdit,
})
</script>

<template>
  <div
    class="ms-form-control"
    :class="{ 'is-editing': isEditing }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    v-bind="$attrs"
  >
    <!-- Input mode -->
    <div
      ref="inputWrapperRef"
      class="ms-form-control__input"
      :style="{
        display: (!$slots.display || isEditing) && !readonly ? 'flex' : 'none',
      }"
    >
      <slot
        :value="localValue"
        :on-input="handleInput"
        :disabled="!isInteractive"
        :placeholder="placeholder"
      >
        <MsInput
          class="form-input"
          v-model="localValue"
          :disabled="!isInteractive"
          @update:model-value="handleInput"
          @blur="handleBlur"
          @keydown="handleKeydown"
          :placeholder="placeholder"
        />
      </slot>
    </div>

    <!-- Display mode -->
    <template v-if="($slots.display && !isEditing) || readonly">
      <div class="ms-form-control__value">
        <span class="ms-form-control__value-text">
          <slot name="display" :value="model">
            {{ displayValue }}
          </slot>
        </span>
        <!-- Edit button (hover) - inside value area -->
        <MsButton
          v-if="showEditButton"
          icon="icon-mi-pencil"
          variant="text"
          size="small"
          title="Sửa"
          class="ms-form-control__edit-button"
          @click="startEdit"
        />
        <!-- Lock icon - inside value area -->
        <span v-if="showLockIcon" class="icon icon-mi-lock ms-form-control__lock"></span>
      </div>
    </template>

    <!-- Save/Cancel buttons -->
    <div v-if="showInlineActions" class="ms-form-control__actions">
      <MsButton
        icon="icon-mi-file-green"
        variant="text"
        size="small"
        title="Lưu"
        @click="handleSave"
      />
      <MsButton
        icon="icon-mi-circle-close-red"
        variant="text"
        size="small"
        title="Hủy"
        @click="handleCancel"
      />
    </div>
  </div>
</template>

<style scoped>
.ms-form-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
}

.ms-form-control__value {
  font-size: 14px;
  color: #212121;
  padding: 4px 0 4px 8px;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  border-bottom: 1px solid #e0e0e0;
}

.ms-form-control__value-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-form-control__edit-button {
  flex-shrink: 0;
  margin-left: 8px;
}

.ms-form-control__lock {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-left: 8px;
}

.ms-form-control__input {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.ms-form-control__actions {
  display: flex;
  align-self: flex-start;
}
</style>
