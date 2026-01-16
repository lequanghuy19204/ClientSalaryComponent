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
    return response.some(item => item.salaryCompositionCode === code)
  }

  async updateStatus(id, status) {
    const response = await httpClient.patch(`${this.endpoint}/${id}/status`, { status })
    return response.data
  }

  async bulkUpdateStatus(ids, status) {
    const response = await httpClient.patch(`${this.endpoint}/bulk-status`, { ids, status })
    return response.data
  }

  async getPaged({ pageNumber = 1, pageSize = 15, searchText = '', status = null, organizationIds = null } = {}) {
    const params = { pageNumber, pageSize }
    if (searchText) params.searchText = searchText
    if (status !== null) params.status = status
    if (organizationIds?.length) params.organizationIds = organizationIds
    const response = await httpClient.get(`${this.endpoint}/paged`, { params })
    return response.data
  }
}

export default new SalaryCompositionApi()
