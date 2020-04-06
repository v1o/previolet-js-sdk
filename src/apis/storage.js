import { getBaseUrl } from '../utils'
import Base from './base'

export default class Storage extends Base {
  constructor(sdk) {
    super(sdk)
  }

  getAll() {
    const options = {
      method: 'GET',
    }

    return this.__call('/__/storage', options).then(ret => ret.result)
  }

  getUploadUrl() {
    return getBaseUrl(this.sdk.options) + '/__/storage?token=' + this.__getTokenToUse()
  }
}
