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
}

export default new SalaryCompositionSystemApi()
