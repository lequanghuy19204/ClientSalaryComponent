<template>
  <button
    :class="['ms-btn', variantClass, sizeClass, { 'ms-btn-disabled': disabled, 'ms-btn-loading': loading, 'ms-btn-icon-hover': iconHover }]"
    :disabled="disabled || loading"
    :type="type"
    @click="onClick"
  >
    <span v-if="loading" class="ms-btn-spinner"></span>
    <span v-if="icon && !loading" :class="['icon', 'd-inline-block', 'flex-shrink-0', icon]"></span>
    <span v-if="label" class="ms-btn-label">{{ label }}</span>
    <slot></slot>
    <span v-if="iconRight && !loading" :class="['icon', 'd-inline-block', 'flex-shrink-0', iconRight]"></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconRight: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default', // 'default', 'primary', 'outline', 'text', 'danger'
    validator: (value) => ['default', 'primary', 'outline', 'text', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  iconHover: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

/** Tính toán class CSS cho variant của button */
const variantClass = computed(() => {
  const variants = {
    default: 'ms-btn-default',
    primary: 'ms-btn-primary',
    outline: 'ms-btn-outline',
    text: 'ms-btn-text',
    danger: 'ms-btn-danger'
  }
  return variants[props.variant] || 'ms-btn-default'
})

/** Tính toán class CSS cho kích thước của button */
const sizeClass = computed(() => {
  const sizes = {
    small: 'ms-btn-sm',
    medium: 'ms-btn-md',
    large: 'ms-btn-lg'
  }
  return sizes[props.size] || 'ms-btn-md'
})

/** Xử lý sự kiện click button */
const onClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.ms-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

/* Size variants */
.ms-btn-sm {
  height: 27px;
  padding: 0 12px;
  font-size: 13px;
}

.ms-btn-md {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}

.ms-btn-lg {
  height: 44px;
  padding: 0 20px;
  font-size: 15px;
}

/* Variant: Default */
.ms-btn-default {
  background: #fff;
  border-color: #e0e0e0;
  color: #212121;
}

.ms-btn-default:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #c4c4c4;
}

.ms-btn-default:active:not(:disabled) {
  background: #e0e0e0;
}

/* Variant: Primary */
.ms-btn-primary {
  background: #34b057;
  border-color: #34b057;
  color: #fff;
}

.ms-btn-primary:hover:not(:disabled) {
  background: #2a9047;
  border-color: #2a9047;
}

.ms-btn-primary:active:not(:disabled) {
  background: #238a3f;
  border-color: #238a3f;
}

/* Variant: Outline */
.ms-btn-outline {
  background: #fff;
  border-color: #e0e0e0;
  color: #212121;
}

.ms-btn-outline:hover:not(:disabled) {
  background: #fff;
  border-color: #34b057;
  color: #34b057;
}

.ms-btn-outline:hover:not(:disabled) .icon {
  background-color: #34b057;
}

.ms-btn-icon-hover:hover:not(:disabled) .icon {
  background-color: #34b057;
}

.ms-btn-outline:active:not(:disabled) {
  background: #eafbf2;
}

/* Variant: Text */
.ms-btn-text {
  background: transparent;
  border-color: transparent;
  color: #212121;
}

.ms-btn-text:hover:not(:disabled) {
  background: #f5f5f5;
}

.ms-btn-text:active:not(:disabled) {
  background: #e0e0e0;
}

/* Variant: Danger */
.ms-btn-danger {
  background: #e61d1d;
  border-color: #e61d1d;
  color: #fff;
}

.ms-btn-danger:hover:not(:disabled) {
  background: #d81010;
  border-color: #d81010;
}

.ms-btn-danger:active:not(:disabled) {
  background: #cc4c4c;
  border-color: #cc4c4c;
}

/* Disabled state */
.ms-btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading state */
.ms-btn-loading {
  cursor: wait;
}

.ms-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ms-btn-spin 0.75s linear infinite;
}

@keyframes ms-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.ms-btn-label {
  line-height: 1;
}
</style>
