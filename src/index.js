import { getBaseUrl } from './utils'
import defaultOptions from './options'
import StorageFactory from './storage'
import DatabaseApi from './apis/database'
import FunctionsApi from './apis/functions'
import StorageApi from './apis/storage'
import RemoteConfig from './apis/remote-config'

export default class PrevioletSDK {
	constructor (overrideOptions) {
    const vm = this
    let options = Object.assign({}, defaultOptions, overrideOptions)
    let token = false
    let currentApp = null
    let currentUser = null
    let last_access_token = null
    let headers = {}
    this.changeHooks = []
    this.storageApi = StorageFactory(options)

    this.auth = {
      GithubAuthProvider: {
        id: 'github',
      },

      GoogleAuthProvider: {
        id: 'google',
      },

      FacebookAuthProvider: {
        id: 'facebook',
      },
    }

    Object.defineProperties(this, {
      options: {
        get() {
          return options
        }
      },

      token: {
        get() {
          return token
        },
        set(value) {
          if (value == token) {
            return
          }

          token = value
          vm.storageApi.setItem(options.tokenName, token)
        }
      },

      headers: {
        get() {
          return headers
        }
      },

      currentApp: {
        get() {
          return currentApp
        },
        set(value) {
          currentApp = value
          vm.storageApi.setItem(options.applicationStorage, btoa(JSON.stringify(value)))
        }
      },

      currentUser: {
        get() {
          return currentUser
        },
        set(value) {
          currentUser = value
          vm.storageApi.setItem(options.userStorage, btoa(JSON.stringify(value)))
        }
      },

      browserIdentification: {
        get() {
          return vm.__storageGet(vm.options.browserIdentification)
        },
        set(value) {
          value['ts'] = Date.now()
          value['rnd'] = vm.__generateRandomNumber(10000, 99999)
          vm.storageApi.setItem(options.browserIdentification, btoa(JSON.stringify(value)))
        }
      }
    })

    vm.app = () => {
      return {
        region: vm.options.region,
        token: vm.storageApi.getItem(vm.options.tokenName) || false,
        data: vm.__storageGet(vm.options.applicationStorage),
      }
    }

    var _stored_token = vm.app().token
    vm.token = _stored_token

    if (! vm.browserIdentification) {
        vm.browserIdentification =  {
        ua: navigator.userAgent,
        lang: navigator.language || navigator.userLanguage,
        plat: navigator.platform,
        vsdk: vm.options.sdkVersion,
        vapp: vm.options.appVersion,
      }
    }

    if (vm.options.debug) {
      console.log('%c Previolet Javascript SDK instantiated in debug mode', 'color: #CC00FF')
      console.log('Browser identification', vm.browserIdentification)
    }

    vm.errorProxy = (err => {
      if (err && err.error_code && err.error_code == 3) {
        // invalid token
        vm.logout()
      }
    })

    vm.db = () => {
      return new DatabaseApi(options, token, vm.browserIdentification, vm.errorProxy)
    }

    vm.functions = () => {
      return new FunctionsApi(options, token, vm.browserIdentification, vm.errorProxy)
    }

    vm.storage = () => {
      return new StorageApi(options, token, vm.browserIdentification, vm.errorProxy)
    }

    vm.remoteConfig = () => {
      return new RemoteConfig(options, token, vm.browserIdentification, vm.errorProxy)
    }

    vm.user = () => {
      return {
        data: vm.__storageGet(vm.options.userStorage),
      }
    }
    vm.currentUser = vm.user().data
  }

  isAuthenticated() {
    let token = this.token

    if (token) {
      return true
    } else {
      return false
    }
  }

  onAuthStateChanged(callback) {
    if (typeof callback == 'function') {

      if (this.changeHooks.indexOf(callback) == -1) {
        if (this.options.debug) {
          console.log('Registered callback function: onAuthStateChanged', callback)
        }

        this.changeHooks.push(callback)
      } else {
        if (this.options.debug) {
          console.log('Callback function onAuthStateChanged is already registered', callback)
        }
      }

      var current_user = this.currentUser

      if (this.options.debug) {
        if (current_user) {
          console.log('User is logged in', current_user)
        } else {
          console.log('User is not logged in')
        }
      }

      return callback(current_user)
    } else {
      if (this.options.debug) {
        console.log('User is not logged in')
      }

      return false
    }
  }

  logout() {
    if (! this.isAuthenticated()) {
      return Promise.reject(new Error('There is no authenticated user'))
    }

    const data = JSON.stringify({
      token: this.token
    })

    const options = {
      method: 'DELETE',
      data
    }

    if (this.options.debug) {
      console.log('Logging Out')
    }

    return this.__call('/__/token', options, 'token').then(ret => {
      this.storageApi.removeItem(this.options.tokenName)
      this.storageApi.removeItem(this.options.applicationStorage)
      this.storageApi.removeItem(this.options.userStorage)

      this.changeHooks.forEach((func) => {
        func(false)
      })

      this.__checkError(ret)

      return ret
    })
  }

  getDefaultHeaders() {
    return Object.assign({}, this.headers, {})
  }

  requestGuestToken () {
    const data = JSON.stringify({
      expire: this.options.guestTokenExpiration
    })

    const options = {
      method: 'POST',
      data
    }

    return this.__call('/__/auth/guest', options).then(ret => {
      this.__checkError(ret)

      if (ret.result.token) {
        this.token = ret.result.token
      }
    })
  }

  loginWithUsernameAndPassword(name, challenge) {
    if (! name) {
      return Promise.reject(new Error('username required'))
    }

    if (! challenge) {
      return Promise.reject(new Error('password required'))
    }

    if (this.options.debug) {
      console.log('Logging In with username and password', name, challenge)
    }

    const data = JSON.stringify({
      name,
      challenge,
    })

    const options = {
      method: 'POST',
      data,
    }

    return this.__call('/__/auth', options).then(ret => {
      this.__checkError(ret)

      this.__loadAuthenticationDataFromResponse(ret)

      if (this.currentUser) {
        this.changeHooks.forEach((func) => {
          if (this.options.debug) {
            console.log('Triggering onAuthStateChanged callback', this.currentUser)
          }

          func(this.currentUser)
        })
      }

      return ret.result.data
    })
  }

  loginWithIdentityProvider(provider, access_token) {
    access_token = access_token || this.last_access_token
    this.last_access_token = access_token

    if (this.options.debug) {
      console.log('Logging In with identity provider:', provider, access_token)
    }

    const params = {
      access_token,
    }

    const options = {
      method: 'POST',
      params,
    }

    return this.__call('/__/auth/identity/' + provider, options).then(ret => {
      this.__checkError(ret)

      if (! ret.result) {
        this.changeHooks.forEach((func) => {
          func(false)
        })
      } else if (ret.result) {
        if (ret.result.token && ret.result.auth) {
          this.__loadAuthenticationDataFromResponse(ret)

          this.changeHooks.forEach((func) => {
            if (this.options.debug) {
              console.log('Triggering onAuthStateChanged callback', ret.result.auth)
            }

            func(ret.result.auth)
          })
        } else {
          this.changeHooks.forEach((func) => {
            if (this.options.debug) {
              console.log('Triggering onAuthStateChanged callback', false)
            }

            func(false)
          })
        }
      }

      return ret.result
    })
  }

  registerWithIdentityProvider(provider, email, access_token, trigger_login) {
    access_token = access_token || this.last_access_token
    trigger_login = trigger_login || true
    this.last_access_token = access_token

    const data = {
      access_token,
      email,
      role: 'admin'
    }

    const options = {
      method: 'POST',
      data,
    }

    return this.__call('/__/auth/identity/' + provider + '/register', options).then(ret => {
      this.__checkError(ret)

      if (trigger_login) {
        return this.loginWithIdentityProvider(provider, access_token)
      } else {
        return ret
      }
    })
  }

  getRemoteConfig() {
    const vm = this

    return this.functions().getRemoteConfig().then(config => {
      if (typeof config == 'object') {
        var merge = vm.options.defaultConfig
        Object.keys(config).forEach(key => {
          merge[key] = config[key]
        })

        return merge
      } else {
        return vm.options.defaultConfig
      }
    })
  }

  __loadAuthenticationDataFromResponse(ret) {
    if (ret.result.token && ret.result.auth) {
      if (this.options.debug) {
        console.log('Saving token', ret.result.token)
      }

      this.token = ret.result.token
    }

    if (ret.result.auth) {
      if (this.options.debug) {
        console.log('Saving user details', ret.result.auth)
      }

      this.currentUser = ret.result.auth
    }

    if (ret.result.data) {
      if (ret.result.data[this.options.instance] && ret.result.data[this.options.instance].instance_data) {
        this.currentApp = ret.result.data[this.options.instance].instance_data

        if (this.options.debug) {
          console.log('Saving application details', this.currentApp)
        }
      } else {
        if (this.options.debug) {
          console.log('Application details not available')
        }
      }
    }
  }

  __call(url, options, instance) {
    instance = instance || this.options.instance
    options.headers = this.getDefaultHeaders()

    var req_id = this.options.reqIndex ++
    var endpoint = getBaseUrl(this.options, instance) + url

    if (this.options.debug) {
      console.log('> XHR Request (' + req_id + ')', endpoint, options)
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

  __checkError (response) {
    if (response.error) {
      if (this.options.debug) {
        console.log('%cBackend error details', 'color: #FF3333', response)
      }

      throw response.error
    }
  }

  __storageGet(key) {
    const vm = this

    var _storage = vm.storageApi.getItem(key)
    var _storage_data = false

    if (_storage) {
      try {
        _storage_data = JSON.parse(atob(_storage))
      } catch (e) {
      }
    }

    return _storage_data
  }

  __generateRandomNumber(from, to) {
    from = from || 100
    to = to || 999
    return Math.floor((Math.random() * to) + from)
  }
}
