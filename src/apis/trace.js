import Base from './base'

export default class Trace extends Base {
  constructor(sdk) {
    super(sdk)
  }

  add(payload) {
    const vm = this

    let __token = vm.__getTokenToUse()
    let __identification = vm.sdk.browserIdentification

    let params = {
      p: payload,
      __token,
      __identification,
    }

    if (window.location && window.location.href) {
      params.u = window.location.href
    }

    const options = {
      method: 'GET',
      params
    }

    return this.__call_log(0, options)
  }
}
