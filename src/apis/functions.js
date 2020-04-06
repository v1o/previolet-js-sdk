import Base from './base'

export default class Functions extends Base {
  constructor(sdk) {
    super(sdk)
  }

  getAll() {
    const options = {
      method: 'GET',
    }

    return this.__call('/__/function', options).then(ret => ret.result)
  }

  run(id, data) {
    data = data || false

    const options = {
      method: 'POST',
      data,
    }

    return this.__call('/__/function/' + id, options).then(ret => {
      return ret.result ? ret.result : ret
    })
  }
}
