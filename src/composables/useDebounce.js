import { ref, watch } from 'vue'

/**
 * Composable tạo giá trị debounce cho một ref
 * Trì hoãn việc cập nhật giá trị cho đến khi người dùng ngừng thay đổi
 * @param {Ref} value - Giá trị ref cần debounce
 * @param {number} delay - Thời gian trì hoãn tính bằng mili giây (mặc định: 300ms)
 * @returns {Ref} Giá trị đã được debounce
 */
export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  let timeout = null

  watch(value, (newValue) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
