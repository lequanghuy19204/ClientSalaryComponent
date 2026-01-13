import BaseApi from './base.api'

class OrganizationApi extends BaseApi {
  constructor() {
    super('/Organizations/tree')
  }

  async getTree() {
    const response = await this.getAll()
    return response
  }
}

export default new OrganizationApi()
