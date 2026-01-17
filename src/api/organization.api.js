import BaseApi from './base.api'

/**
 * API quản lý cơ cấu tổ chức
 * Kế thừa từ BaseApi, bổ sung phương thức lấy cây tổ chức
 */
class OrganizationApi extends BaseApi {
  constructor() {
    super('/Organizations/tree')
  }

  /**
   * Lấy cây cơ cấu tổ chức
   * @returns {Promise<Array>} Dữ liệu cây tổ chức dạng phân cấp
   */
  async getTree() {
    const response = await this.getAll()
    return response
  }
}

export default new OrganizationApi()
