import httpClient from './http-client'

const endpoint = '/gridconfigs'

export default {
  /**
   * Lấy cấu hình lưới theo tên
   * @param {string} gridName - Tên của lưới dữ liệu
   * @returns {Promise<Array>} Danh sách cấu hình cột
   */
  async getByName(gridName) {
    const response = await httpClient.get(`${endpoint}/${encodeURIComponent(gridName)}`)
    return response.data
  },

  /**
   * Lưu cấu hình lưới
   * @param {Object} data - Dữ liệu cấu hình lưới (gridConfigName, columns)
   * @returns {Promise<Object>} Kết quả lưu
   */
  async save(data) {
    const response = await httpClient.post(endpoint, data)
    return response.data
  },

  /**
   * Xóa cấu hình lưới theo tên
   * @param {string} gridName - Tên của lưới dữ liệu cần xóa cấu hình
   * @returns {Promise<Object>} Kết quả xóa
   */
  async delete(gridName) {
    const response = await httpClient.delete(`${endpoint}/${encodeURIComponent(gridName)}`)
    return response.data
  }
}
