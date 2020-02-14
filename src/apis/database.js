import Base from './base'

export default class Database extends Base {
  constructor(options, token, bi, errorProxy) {
    super(options, token, bi, errorProxy)
    this.currentDatabase = null
  }

  getAll() {
    const options = {
      method: 'GET',
    }

    return this.__call('/__/index', options).then(ret => {
      this.__checkError(ret)
      return ret.result.objects
    })
  }

  select(database) {
    this.currentDatabase = database
    return this
  }

  add(data) {
    data = data || {}

    const options = {
      method: 'POST',
      data,
    }

    return this.__callDatabase(options).then(ret => {
      this.__checkError(ret)
      return ret.result ? ret.result : ret
    })
  }

  get(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options).then(ret => {
      this.__checkError(ret)
      return ret.result ? ret.result : []
    })
  }

  getOne(params) {
    params = params || {}
    params._limit = 1

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options).then(ret => {
      this.__checkError(ret)
      return ret.result && ret.result[0] ? ret.result[0] : false
    })
  }

  getCount(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, '/count').then(ret => {
      this.__checkError(ret)
      return ret.result ? parseInt(ret.result) : 0
    })
  }

  update(id, data) {
    data = data || {}

    const options = {
      method: 'PUT',
      data,
    }

    return this.__callDatabase(options, '/' + id).then(ret => {
      this.__checkError(ret)
      return ret.result ? ret.result : ret
    })
  }

  delete(id) {
    const options = {
      method: 'DELETE',
    }

    return this.__callDatabase(options, '/' + id).then(ret => {
      this.__checkError(ret)
      return ret.result ? ret.result : ret
    })
  }

  fieldExists(name) {
    // Implementation to follow
  }

  addField(params) {
    // Implementation to follow
  }

  getViews(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, '/structure/views').then(ret => {
      this.__checkError(ret)
      return ret.result ? ret.result : []
    })
  }

  getDistinct(field, params) {
    // Implementation to follow
  }

  getDistinctCount(field, params) {
    // Implementation to follow
  }

  __callDatabase(options, append) {
    append = append || ''

    if (null === this.currentDatabase) {
      return Promise.reject(new Error('Please select a database'))
    }

    return this.__call('/' + this.currentDatabase + append, options)
  }
}
