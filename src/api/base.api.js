import httpClient from './http-client'

export default class BaseApi {
  constructor(endpoint) {
    this.endpoint = endpoint
  }

  async getAll(params = {}) {
    const response = await httpClient.get(this.endpoint, { params })
    return response.data
  }

  async getById(id) {
    const response = await httpClient.get(`${this.endpoint}/${id}`)
    return response.data
  }

  async create(data) {
    const response = await httpClient.post(this.endpoint, data)
    return response.data
  }

  async update(id, data) {
    const response = await httpClient.put(`${this.endpoint}/${id}`, data)
    return response.data
  }

  async delete(id) {
    const response = await httpClient.delete(`${this.endpoint}/${id}`)
    return response.data
  }

  async patch(id, data) {
    const response = await httpClient.patch(`${this.endpoint}/${id}`, data)
    return response.data
  }

  async getPaged(params = {}) {
    const response = await httpClient.get(`${this.endpoint}/paged`, { params })
    return response.data
  }
}
