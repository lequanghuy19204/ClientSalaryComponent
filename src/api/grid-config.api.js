import httpClient from './http-client'

const endpoint = '/gridconfigs'

export default {
  async getByName(gridName) {
    const response = await httpClient.get(`${endpoint}/${encodeURIComponent(gridName)}`)
    return response.data
  },

  async save(data) {
    const response = await httpClient.post(endpoint, data)
    return response.data
  },

  async delete(gridName) {
    const response = await httpClient.delete(`${endpoint}/${encodeURIComponent(gridName)}`)
    return response.data
  }
}
