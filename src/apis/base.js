import { getBaseUrl, getBaseBucketUrl } from '../utils'

export default class Base {
  constructor(sdk) {
    this.sdk = sdk
    this.errorChain = []
  }

  addToErrorChain(context, func) {
    if (typeof func == 'function') {
      this.errorChain.push({
        context,
        func
      })

      if (this.sdk.options.debug) {
        console.log('Added function to error chain', context, func)
      }
    } else {
      if (this.sdk.options.debug) {
        console.log('Cannot add function to error chain, not a function', context, func)
      }
    }

    return this
  }

  __getTokenToUse() {
    var __token = null

    if (this.sdk.token) {
      if (this.sdk.options.debug) {
        console.log('Using stored token', this.sdk.token)
      }
      __token = this.sdk.token
    }

    if (! __token && this.sdk.options.tokenFallback) {
      if (this.sdk.options.debug) {
        console.log('Token is now the fallback option', this.sdk.options.tokenFallback)
      }
      __token = this.sdk.options.tokenFallback
    }

    if (this.sdk.options.tokenOverride) {
      if (this.sdk.options.debug) {
        console.log('Token is now the override option', this.sdk.options.tokenOverride)
      }
      __token = this.sdk.options.tokenOverride
    }

    return __token
  }

  __call(url, options) {
    var __token = this.__getTokenToUse()
    var __identification = this.sdk.browserIdentification

    if (this.sdk.options.debug) {
      console.log('Using Identification', __identification)
    }

    options.headers = Object.assign({}, {
      'Authorization': __token,
      'Identification': btoa(JSON.stringify(__identification)),
    })

    var endpoint = getBaseUrl(this.sdk.options) + url
    var req_id = this.sdk.options.reqIndex ++

    if (this.sdk.options.debug) {
      console.log('> XHR Request (' + req_id + ', ' + __token + '): ', endpoint, options)
    }

    return axios(endpoint, options)
    .then(ret => {
      if (this.sdk.options.debug) {
        console.log('< XHR Response (' + req_id + ')', ret)
      }

      return ret.data
    })
    .catch(err => {
      throw err
    })
  }

  __call_log(bucket, options) {
    var endpoint = getBaseBucketUrl(this.sdk.options, null, bucket).replace('/v1', '/')
    var req_id = this.sdk.options.reqIndex ++

    if (this.sdk.options.debug) {
      console.log('> XHR Bucket Request (' + req_id + '): ', endpoint)
    }

    return axios(endpoint, options)
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
            if (this.sdk.options.debug) {
              console.log('Propagating error', response)
            }

            errorCallback.func(errorCallback.context, response)
          }
        })
      } else {
        // Looks like we're handling errors
        if (this.sdk.options.debug) {
          console.log('%cBackend error details', 'color: #FF3333', response)
        }

        throw response
      }
    }
  }
}
