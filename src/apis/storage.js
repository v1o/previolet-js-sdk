import Base from './base'

export default class Storage extends Base {
  constructor(sdk) {
    super(sdk.options, sdk.token, sdk.browserIdentification)
  }

  getAll() {
    const options = {
      method: 'GET',
    }

    return this.__call('/__/storage', options).then(ret => ret.result)
  }
}
