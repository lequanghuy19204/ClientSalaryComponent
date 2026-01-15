import BaseApi from './base.api'
import httpClient from './http-client'

class SalaryCompositionApi extends BaseApi {
  constructor() {
    super('/SalaryCompositions')
  }

  async checkCodeExists(code, excludeId = null) {
    const params = { code }
    if (excludeId) params.excludeId = excludeId
    const response = await this.getAll(params)
    return response.some(item => item.code === code)
  }

  async updateStatus(id, status) {
    const response = await httpClient.patch(`${this.endpoint}/${id}/status`, { status })
    return response.data
  }

  async bulkUpdateStatus(ids, status) {
    const response = await httpClient.patch(`${this.endpoint}/bulk-status`, { ids, status })
    return response.data
  }
}

export default new SalaryCompositionApi()
