import BaseApi from './base.api'
import httpClient from './http-client'

/**
 * API quản lý thành phần lương của người dùng
 * Kế thừa từ BaseApi, bổ sung các phương thức kiểm tra, cập nhật trạng thái và phân trang
 */
class SalaryCompositionApi extends BaseApi {
  constructor() {
    super('/SalaryCompositions')
  }

  /**
   * Kiểm tra mã thành phần lương đã tồn tại chưa
   * @param {string} code - Mã thành phần lương cần kiểm tra
   * @param {string|null} excludeId - ID cần loại trừ (khi cập nhật)
   * @returns {Promise<boolean>} True nếu mã đã tồn tại
   */
  async checkCodeExists(code, excludeId = null) {
    const params = { code }
    if (excludeId) params.excludeId = excludeId
    const response = await this.getAll(params)
    return response.some(item => item.salaryCompositionCode === code)
  }

  /**
   * Cập nhật trạng thái của một thành phần lương
   * @param {string} id - ID của thành phần lương
   * @param {number} status - Trạng thái mới (0: Ngừng sử dụng, 1: Đang sử dụng)
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async updateStatus(id, status) {
    const response = await httpClient.patch(`${this.endpoint}/${id}/status`, { status })
    return response.data
  }

  /**
   * Cập nhật trạng thái của nhiều thành phần lương
   * @param {Array<string>} ids - Danh sách ID cần cập nhật
   * @param {number} status - Trạng thái mới
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async bulkUpdateStatus(ids, status) {
    const response = await httpClient.patch(`${this.endpoint}/bulk-status`, { ids, status })
    return response.data
  }

  /**
   * Lấy danh sách thành phần lương có phân trang
   * @param {Object} options - Tùy chọn phân trang và lọc
   * @param {number} options.pageNumber - Số trang (mặc định: 1)
   * @param {number} options.pageSize - Số bản ghi mỗi trang (mặc định: 15)
   * @param {string} options.searchText - Từ khóa tìm kiếm
   * @param {number} options.status - Lọc theo trạng thái
   * @param {Array<string>} options.organizationIds - Lọc theo danh sách tổ chức
   * @param {Object} options.filters - Bộ lọc nâng cao theo cột với condition
   * @returns {Promise<Object>} Dữ liệu phân trang
   */
  async getPaged({ 
    pageNumber = 1, 
    pageSize = 15, 
    searchText = '', 
    status = null, 
    organizationIds = null,
    filters = null 
  } = {}) {
    const params = { pageNumber, pageSize }
    if (searchText) params.searchText = searchText
    if (status !== null) params.status = status
    if (organizationIds?.length) params.organizationIds = organizationIds
    
    // Thêm các filter nâng cao với condition
    if (filters) {
      // Format: { key: { condition, value } }
      const filterKeys = {
        salaryCompositionCode: 'salaryCompositionCodeFilter',
        salaryCompositionName: 'salaryCompositionNameFilter',
        salaryCompositionType: 'salaryCompositionTypeFilter',
        salaryCompositionNature: 'salaryCompositionNatureFilter',
        isTaxable: 'isTaxableFilter',
        isTaxDeductible: 'isTaxDeductibleFilter',
        quota: 'quotaFilter',
        valueType: 'valueTypeFilter',
        value: 'valueFilter',
        description: 'descriptionFilter',
        showOnPayslip: 'showOnPayslipFilter',
        source: 'sourceFilter'
      }
      
      Object.entries(filters).forEach(([key, filterData]) => {
        const apiKey = filterKeys[key]
        if (apiKey && filterData) {
          params[`${apiKey}.condition`] = filterData.condition
          if (filterData.value !== undefined && filterData.value !== null && filterData.value !== '') {
            params[`${apiKey}.value`] = filterData.value
          }
        }
      })
    }
    
    const response = await httpClient.get(`${this.endpoint}/paged`, { 
      params,
      paramsSerializer: {
        indexes: null // Serialize mảng dạng: organizationIds=a&organizationIds=b
      }
    })
    return response.data
  }
}

export default new SalaryCompositionApi()
