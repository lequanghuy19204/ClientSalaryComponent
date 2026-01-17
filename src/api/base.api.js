import httpClient from './http-client'

/**
 * Lớp API cơ sở cung cấp các phương thức CRUD chung
 * Các API khác có thể kế thừa từ lớp này
 */
export default class BaseApi {
  /**
   * Khởi tạo BaseApi với endpoint
   * @param {string} endpoint - Đường dẫn API endpoint
   */
  constructor(endpoint) {
    this.endpoint = endpoint
  }

  /**
   * Lấy tất cả bản ghi
   * @param {Object} params - Tham số query string
   * @returns {Promise<Array>} Danh sách bản ghi
   */
  async getAll(params = {}) {
    const response = await httpClient.get(this.endpoint, { params })
    return response.data
  }

  /**
   * Lấy một bản ghi theo ID
   * @param {string} id - ID của bản ghi
   * @returns {Promise<Object>} Dữ liệu bản ghi
   */
  async getById(id) {
    const response = await httpClient.get(`${this.endpoint}/${id}`)
    return response.data
  }

  /**
   * Tạo mới một bản ghi
   * @param {Object} data - Dữ liệu bản ghi cần tạo
   * @returns {Promise<Object>} Bản ghi vừa được tạo
   */
  async create(data) {
    const response = await httpClient.post(this.endpoint, data)
    return response.data
  }

  /**
   * Cập nhật một bản ghi theo ID
   * @param {string} id - ID của bản ghi cần cập nhật
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Bản ghi sau khi cập nhật
   */
  async update(id, data) {
    const response = await httpClient.put(`${this.endpoint}/${id}`, data)
    return response.data
  }

  /**
   * Xóa một bản ghi theo ID
   * @param {string} id - ID của bản ghi cần xóa
   * @returns {Promise<Object>} Kết quả xóa
   */
  async delete(id) {
    const response = await httpClient.delete(`${this.endpoint}/${id}`)
    return response.data
  }

  /**
   * Cập nhật một phần bản ghi theo ID (PATCH)
   * @param {string} id - ID của bản ghi
   * @param {Object} data - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Bản ghi sau khi cập nhật
   */
  async patch(id, data) {
    const response = await httpClient.patch(`${this.endpoint}/${id}`, data)
    return response.data
  }

  /**
   * Lấy danh sách bản ghi có phân trang
   * @param {Object} params - Tham số phân trang (pageNumber, pageSize, ...)
   * @returns {Promise<Object>} Dữ liệu phân trang
   */
  async getPaged(params = {}) {
    const response = await httpClient.get(`${this.endpoint}/paged`, { params })
    return response.data
  }
}
