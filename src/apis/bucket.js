import Base from './base'

export default class Bucket extends Base {
  constructor(sdk) {
    super(sdk)
  }

  log(bucket, params) {
    const vm = this

    if (! Number.isInteger(bucket)) {
      if (this.sdk.options.debug) {
        console.log('Bucket name should be an integer and not', bucket)
      }

      return
    }

    if (typeof params != 'object') {
      if (this.sdk.options.debug) {
        console.log('Bucket params should be send as object and not ' + typeof params, params)
      }

      return
    }

    const options = {
      method: 'GET',
      params,
    }

    return this.__call_log(bucket, options)
  }
}
