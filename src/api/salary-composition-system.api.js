import BaseApi from './base.api'
import httpClient from './http-client'

/**
 * API quản lý thành phần lương hệ thống
 * Kế thừa từ BaseApi, bổ sung các phương thức chuyển đổi và phân trang
 */
class SalaryCompositionSystemApi extends BaseApi {
  constructor() {
    super('/SalaryCompositionSystems')
  }

  /**
   * Kiểm tra thành phần lương hệ thống có tồn tại trong danh sách người dùng không
   * @param {string} id - ID của thành phần lương hệ thống
   * @returns {Promise<boolean>} True nếu tồn tại
   */
  async checkExists(id) {
    const response = await httpClient.get(`${this.endpoint}/${id}/check-exists`)
    return response.data
  }

  /**
   * Chuyển thành phần lương hệ thống sang danh sách người dùng
   * @param {string} id - ID của thành phần lương hệ thống
   * @returns {Promise<Object>} Kết quả chuyển
   */
  async move(id) {
    const response = await httpClient.post(`${this.endpoint}/${id}/move`)
    return response.data
  }

  /**
   * Ghi đè thành phần lương đã tồn tại bằng thành phần hệ thống
   * @param {string} id - ID của thành phần lương hệ thống
   * @returns {Promise<Object>} Kết quả ghi đè
   */
  async overwrite(id) {
    const response = await httpClient.post(`${this.endpoint}/${id}/overwrite`)
    return response.data
  }

  /**
   * Chuyển nhiều thành phần lương hệ thống sang danh sách người dùng
   * @param {Array<string>} ids - Danh sách ID cần chuyển
   * @returns {Promise<Object>} Kết quả chuyển
   */
  async moveMultiple(ids) {
    const response = await httpClient.post(`${this.endpoint}/move-multiple`, { ids })
    return response.data
  }

  /**
   * Lấy danh sách thành phần lương hệ thống có phân trang
   * @param {Object} options - Tùy chọn phân trang
   * @param {number} options.pageNumber - Số trang (mặc định: 1)
   * @param {number} options.pageSize - Số bản ghi mỗi trang (mặc định: 15)
   * @param {string} options.searchText - Từ khóa tìm kiếm
   * @param {string} options.type - Loại thành phần lương
   * @returns {Promise<Object>} Dữ liệu phân trang
   */
  async getPaged({ pageNumber = 1, pageSize = 15, searchText = '', type = null } = {}) {
    const params = { pageNumber, pageSize }
    if (searchText) params.searchText = searchText
    if (type) params.type = type
    const response = await httpClient.get(`${this.endpoint}/paged`, { params })
    return response.data
  }
}

export default new SalaryCompositionSystemApi()
