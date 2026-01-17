import axios from 'axios'

/**
 * HTTP Client sử dụng Axios để gọi API
 * Cấu hình baseURL, timeout và headers mặc định
 */
const httpClient = axios.create({
  baseURL: 'https://localhost:44303/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Interceptor xử lý request trước khi gửi đi
 */
httpClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

/**
 * Interceptor xử lý response và lỗi
 * Chuyển đổi các mã lỗi HTTP thành thông báo tiếng Việt
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (!response) {
      return Promise.reject({
        message: 'Không thể kết nối đến server',
        code: 'NETWORK_ERROR'
      })
    }

    const errorData = {
      status: response.status,
      message: response.data?.message || 'Đã có lỗi xảy ra',
      code: response.data?.errorCode || 'UNKNOWN_ERROR',
      errors: response.data?.errors || null
    }

    switch (response.status) {
      case 401:
        errorData.message = 'Phiên đăng nhập hết hạn'
        break
      case 403:
        errorData.message = 'Không có quyền truy cập'
        break
      case 404:
        errorData.message = response.data?.message || 'Không tìm thấy dữ liệu'
        break
      case 409:
        errorData.message = response.data?.message || 'Dữ liệu đã tồn tại'
        break
      case 500:
        errorData.message = 'Lỗi hệ thống'
        break
    }

    return Promise.reject(errorData)
  }
)

export default httpClient
