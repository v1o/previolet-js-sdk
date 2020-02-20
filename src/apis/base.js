import { getBaseUrl } from '../utils'

export default class Base {
  constructor(options, token, bi) {
    this.options    = options
    this.token      = token
    this.bi         = JSON.stringify(bi)

    this.errorChain = []
  }

  addToErrorChain(context, func) {
    if (typeof func == 'function') {
      this.errorChain.push({
        context,
        func
      })

      if (this.options.debug) {
        console.log('Added function to error chain', context, func)
      }
    } else {
      if (this.options.debug) {
        console.log('Cannot add function to error chain, not a function', context, func)
      }
    }

    return this
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

  __checkError (context, response) {
    if (response.error) {

      if (this.errorChain.length) {
        // Propagate error to error chain

        this.errorChain.forEach(errorCallback => {
          if (errorCallback.func && typeof errorCallback.func == 'function') {
            if (this.options.debug) {
              console.log('Propagating error', response)
            }

            errorCallback.func(errorCallback.context, response)
          }
        })
      } else {
        // Looks like we're handling errors
        if (this.options.debug) {
          console.log('%cBackend error details', 'color: #FF3333', response)
        }

        throw response
      }
    }
  }
}
