import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

const DEFAULT_DURATION = 3000

/**
 * Thêm một thông báo toast mới
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo: 'info' | 'success' | 'warning' | 'error'
 * @param {number} duration - Thời gian hiển thị (ms), 0 = không tự động ẩn
 * @returns {number} ID của toast vừa tạo
 */
const addToast = (message, type = 'info', duration = DEFAULT_DURATION) => {
  const id = ++toastId
  toasts.value.push({ id, message, type })

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

/**
 * Xóa một toast theo ID
 * @param {number} id - ID của toast cần xóa
 */
const removeToast = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (ms)
 */
const success = (message, duration) => addToast(message, 'success', duration)

/**
 * Hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (ms)
 */
const error = (message, duration) => addToast(message, 'error', duration)

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} message - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (ms)
 */
const warning = (message, duration) => addToast(message, 'warning', duration)

/**
 * Hiển thị thông báo thông tin
 * @param {string} message - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (ms)
 */
const info = (message, duration) => addToast(message, 'info', duration)

/**
 * Composable quản lý hệ thống thông báo toast
 * @returns {Object} Trả về toasts, addToast, removeToast và các hàm tiện ích
 */
export const useToast = () => {
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
