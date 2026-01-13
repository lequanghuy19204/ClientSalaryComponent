import { ref, readonly } from 'vue'

export function useApi(apiFunction) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

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

export function useApiState() {
  const loading = ref(false)
  const error = ref(null)

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
