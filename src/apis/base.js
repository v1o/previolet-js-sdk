import { getBaseUrl } from '../utils'

export default class Base {
  constructor(options, token, bi, errorProxy) {
    this.options    = options
    this.token      = token
    this.bi         = JSON.stringify(bi)
    this.errorProxy = errorProxy
  }

  __generateRandomNumber(from, to) {
    from = from || 100
    to = to || 999
    return Math.floor((Math.random() * to) + from)
  }

  __checkError (response) {
    if (response.error) {
      if (this.options.debug) {
        console.log('%cBackend error details', 'color: #FF3333', response)
      }

      if (typeof this.errorProxy == 'function') {
        this.errorProxy(response)
      }

      throw response.error
    }
  }

  __call(url, options) {
    options.headers = Object.assign({}, {
      'Authorization': this.token,
      'Identification': btoa(this.bi),
    })

    var endpoint = getBaseUrl(this.options) + url
    var req_id = this.options.reqIndex ++

    if (this.options.debug) {
      console.log('> XHR Request (' + req_id + '): ', endpoint, options)
    }

    return axios(endpoint, options)
    .then(ret => {
      if (this.options.debug) {
        console.log('< XHR Response (' + req_id + ')', ret)
      }

      return ret.data
    })
    .catch(err => {
      throw err
    })
  }
}
