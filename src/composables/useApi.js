import { ref, readonly } from 'vue'

/**
 * Composable quản lý trạng thái gọi API
 * @param {Function} apiFunction - Hàm API cần thực thi
 * @returns {Object} Trả về data, loading, error và các hàm execute, reset
 */
export function useApi(apiFunction) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Thực thi hàm API với các tham số truyền vào
   * @param {...any} args - Các tham số truyền cho hàm API
   * @returns {Promise} Kết quả từ API
   */
  const execute = async (...args) => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await apiFunction(...args)
      return data.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Đặt lại tất cả trạng thái về giá trị mặc định
   */
  const reset = () => {
    data.value = null
    error.value = null
    loading.value = false
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    execute,
    reset
  }
}

/**
 * Composable quản lý trạng thái loading và error cho các thao tác API
 * @returns {Object} Trả về loading, error và các hàm withLoading, clearError
 */
export function useApiState() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Bọc hàm bất đồng bộ với trạng thái loading
   * @param {Function} asyncFn - Hàm bất đồng bộ cần thực thi
   * @returns {Promise} Kết quả từ hàm bất đồng bộ
   */
  const withLoading = async (asyncFn) => {
    loading.value = true
    error.value = null
    
    try {
      return await asyncFn()
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa trạng thái lỗi hiện tại
   */
  const clearError = () => {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    withLoading,
    clearError
  }
}
