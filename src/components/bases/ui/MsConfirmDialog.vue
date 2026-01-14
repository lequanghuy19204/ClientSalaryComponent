<template>
  <Teleport to="body">
    <Transition name="ms-dialog-fade">
      <div v-if="modelValue" class="ms-dialog-overlay position-fixed d-flex align-items-start justify-content-center" @click.self="onOverlayClick">
        <div class="ms-dialog d-flex flex-column bg-white" :style="dialogStyle">
          <!-- Header -->
          <header class="ms-dialog-header d-flex align-items-center justify-content-between">
            <h2 class="ms-dialog-title">{{ title }}</h2>
            <button class="ms-dialog-close d-flex align-items-center justify-content-center" @click="onCancel" :title="closeTooltip">
              <span class="icon icon-mi-close"></span>
            </button>
          </header>

          <!-- Content -->
          <div class="ms-dialog-content">
            <slot>
              <span v-html="message"></span>
            </slot>
          </div>

          <!-- Footer -->
          <footer class="ms-dialog-footer d-flex align-items-center justify-content-end gap-2">
            <MsButton
              :label="cancelText"
              variant="outline"
              @click="onCancel"
            />
            <MsButton
              :label="confirmText"
              :variant="confirmVariant"
              :loading="loading"
              @click="onConfirm"
            />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import MsButton from './MsButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Thông báo'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  confirmVariant: {
    type: String,
    default: 'danger',
    validator: (value) => ['primary', 'danger'].includes(value)
  },
  width: {
    type: [String, Number],
    default: 500
  },
  loading: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeTooltip: {
    type: String,
    default: 'Đóng'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialogStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  minWidth: typeof props.width === 'number' ? `${props.width}px` : props.width
}))

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const onOverlayClick = () => {
  if (props.closeOnOverlay && !props.loading) {
    onCancel()
  }
}
</script>

<style scoped>
/* Overlay */
.ms-dialog-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  padding-top: 7vh;
  z-index: 1000;
}

/* Dialog Container */
.ms-dialog {
  border-radius: 6px;
  box-shadow: 0 5px 20px 0 rgba(0, 0, 0, 0.1);
  max-width: calc(100% - 30px);
  max-height: calc(100% - 30px);
  margin: 10px;
  overflow: visible;
  position: relative;
  z-index: 100;
  transition: all 0.2s;
  font-family: Inter, Helvetica, Arial, sans-serif;
  font-variant-numeric: lining-nums tabular-nums;
  box-sizing: border-box;
}

/* Header */
.ms-dialog-header {
  padding: 24px 24px 0px;
  height: 53px;
  flex-shrink: 0;
}

.ms-dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #212121;
  letter-spacing: 0.576px;
  line-height: 1.2;
  margin: 0;
}

/* Close Button */
.ms-dialog-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #9197af;
  transition: all 0.2s ease;
  padding: 0;
}

.ms-dialog-close:hover {
  background: #f5f5f5;
  color: #666;
}

.ms-dialog-close .icon {
  font-size: 16px;
}

/* Content */
.ms-dialog-content {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 400;
  color: #212121;
  line-height: 1.5;
  letter-spacing: 0.01rem;
  overflow: auto;
  flex: 1;
}

.ms-dialog-content :deep(strong) {
  font-weight: 600;
}

/* Footer */
.ms-dialog-footer {
  padding: 16px 20px;
  height: 68px;
  flex-shrink: 0;
  background: #f2f2f2;
  border-radius: 0 0 6px 6px;
}

.ms-dialog-footer :deep(.ms-btn) {
  min-width: 80px;
  height: 36px;
  border-radius: 4px;
  padding: 0 16px;
}

/* Transition Animations */
.ms-dialog-fade-enter-active,
.ms-dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ms-dialog-fade-enter-active .ms-dialog,
.ms-dialog-fade-leave-active .ms-dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.ms-dialog-fade-enter-from,
.ms-dialog-fade-leave-to {
  opacity: 0;
}

.ms-dialog-fade-enter-from .ms-dialog,
.ms-dialog-fade-leave-to .ms-dialog {
  transform: scale(0.95);
  opacity: 0;
}
</style>
