import axios from 'axios'

const httpClient = axios.create({
  baseURL: 'https://localhost:44303/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

httpClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

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
