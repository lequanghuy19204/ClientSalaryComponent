<template>
  <Teleport to="body">
    <TransitionGroup name="ms-toast" tag="div" class="ms-toast-container position-fixed d-flex flex-column align-items-center">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['ms-toast d-flex align-items-center', `ms-toast-${toast.type}`]"
      >
        <div class="ms-toast-icon d-flex align-items-center justify-content-center">
          <i :class="['ms-icon', getIconClass(toast.type)]"></i>
        </div>
        <div class="ms-toast-content">
          <p class="ms-toast-message">{{ toast.message }}</p>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables'

const { toasts } = useToast()

const getIconClass = (type) => {
  const icons = {
    success: 'icon-mi-alert-success',
    error: 'icon-mi-alert-error',
    warning: 'icon-mi-alert-warning',
    info: 'icon-mi-alert-info'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.ms-toast-container {
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999999999;
  gap: 8px;
  pointer-events: none;
}

.ms-toast {
  height: 40px;
  padding: 0 12px 0 0;
  border-radius: 4px;
  overflow: hidden;
  cursor: default;
  width: max-content;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.01rem;
  pointer-events: auto;
  animation: openToastMessage 0.2s ease-out;
}

.ms-toast-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.ms-toast-icon .ms-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.ms-toast-content {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.ms-toast-message {
  margin: 0;
  white-space: nowrap;
}

/* Success variant */
.ms-toast-success {
  background: #c7f2de;
  border: 2px solid #81e2ac;
  color: rgb(54, 58, 54);
}

.ms-toast-success .ms-toast-icon {
  background: #00C853;
  border-radius: 4px 0 0 4px;
}

.ms-toast-success .ms-icon {
  color: #fff;
}

/* Error variant */
.ms-toast-error {
  background: #fecaca;
  border: 2px solid #f87171;
  color: #7f1d1d;
}

.ms-toast-error .ms-icon {
  color: #dc2626;
}

/* Warning variant */
.ms-toast-warning {
  background: #fed7aa;
  border: 2px solid #fb923c;
  color: #7c2d12;
}

.ms-toast-warning .ms-icon {
  color: #ea580c;
}

/* Info variant */
.ms-toast-info {
  background: #bfdbfe;
  border: 2px solid #60a5fa;
  color: #1e3a8a;
}

.ms-toast-info .ms-icon {
  color: #2563eb;
}

/* Transition animations */
.ms-toast-enter-active {
  animation: openToastMessage 0.2s ease-out;
}

.ms-toast-leave-active {
  animation: closeToastMessage 0.2s ease-in;
}

@keyframes openToastMessage {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes closeToastMessage {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
