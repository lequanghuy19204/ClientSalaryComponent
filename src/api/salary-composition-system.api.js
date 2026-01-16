import BaseApi from './base.api'
import httpClient from './http-client'

class SalaryCompositionSystemApi extends BaseApi {
  constructor() {
    super('/SalaryCompositionSystems')
  }

  async checkExists(id) {
    const response = await httpClient.get(`${this.endpoint}/${id}/check-exists`)
    return response.data
  }

  async move(id) {
    const response = await httpClient.post(`${this.endpoint}/${id}/move`)
    return response.data
  }

  async overwrite(id) {
    const response = await httpClient.post(`${this.endpoint}/${id}/overwrite`)
    return response.data
  }

  async moveMultiple(ids) {
    const response = await httpClient.post(`${this.endpoint}/move-multiple`, { ids })
    return response.data
  }

  async getPaged({ pageNumber = 1, pageSize = 15, searchText = '', type = null } = {}) {
    const params = { pageNumber, pageSize }
    if (searchText) params.searchText = searchText
    if (type) params.type = type
    const response = await httpClient.get(`${this.endpoint}/paged`, { params })
    return response.data
  }
}

export default new SalaryCompositionSystemApi()
