import BaseApi from './base.api'

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
}

export default new SalaryCompositionApi()
