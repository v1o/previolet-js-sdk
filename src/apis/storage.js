import Base from './base'

export default class Storage extends Base {
  constructor(options, token, bi, errorProxy) {
    super(options, token, bi, errorProxy)
  }

  getAll() {
    const options = {
      method: 'GET',
    }

    return this.__call('/__/storage', options).then(ret => ret.result)
  }
}
