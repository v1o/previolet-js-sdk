import { getBaseUrl, generateRandomNumber } from './utils'
import defaultOptions from './options'
import apiErrors from './errors'
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

    this.auth = () => {
      return {
        GithubAuthProvider: {
          id: 'github',
        },

        GoogleAuthProvider: {
          id: 'google',
        },

        FacebookAuthProvider: {
          id: 'facebook',
        },

        logout: (params) => {
          if (! vm.auth().isAuthenticated()) {
            return Promise.reject(new Error('There is no authenticated user'))
          }

          params = params || {}
          params.preventUserStatePropagation = params.preventUserStatePropagation || false

          const data = JSON.stringify({
            token: vm.token
          })

          const options = {
            method: 'DELETE',
            data
          }

          if (vm.options.debug) {
            console.log('Logging Out')
          }

          vm.storageApi.removeItem(vm.options.tokenName)
          vm.storageApi.removeItem(vm.options.applicationStorage)
          vm.storageApi.removeItem(vm.options.userStorage)

          if (! params.preventUserStatePropagation) {
            vm.__propagateUserState(false)
          }

          return vm.__call('/__/token', options, 'token').then(ret => {
            return ret
          })
        },

        loginWithUsernameAndPassword: (name, challenge) => {
          if (! name) {
            return Promise.reject(new Error('username required'))
          }

          if (! challenge) {
            return Promise.reject(new Error('password required'))
          }

          if (vm.options.debug) {
            console.log('Logging In with username and password', name, challenge)
          }

          const data = JSON.stringify({
            name,
            challenge,
            expire: vm.options.userTokenExpiration,
          })

          const options = {
            method: 'POST',
            data,
          }

          return vm.__call('/__/auth', options).then(ret => {
            vm.__checkError(vm, ret)
            vm.__loadAuthenticationDataFromResponse(ret)

            if (null !== vm.currentUser) {
              vm.__propagateUserState(vm.currentUser)
            }

            return ret.result.data
          })
        },

        loginWithIdentityProvider: (provider, access_token) => {
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
            this.__checkError(vm, ret)

            if (! ret.result) {
              vm.__propagateUserState(false)
            } else if (ret.result) {
              if (ret.result.token && ret.result.auth) {
                vm.__loadAuthenticationDataFromResponse(ret)
                vm.__propagateUserState(ret.result.auth)
              } else {
                vm.__propagateUserState(false)
              }
            }

            return ret.result
          })
        },

        registerWithIdentityProvider: (provider, email, access_token, trigger_login) => {
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
            this.__checkError(vm, ret)

            if (trigger_login) {
              return this.loginWithIdentityProvider(provider, access_token)
            } else {
              return ret
            }
          })
        },

        isAuthenticated: () => {
          let token = vm.token

          if (token) {
            return true
          } else {
            return false
          }
        },

        loginAsGuest: () => {
          const data = JSON.stringify({
            expire: vm.options.guestTokenExpiration
          })

          const options = {
            method: 'POST',
            data
          }

          return vm.__call('/__/auth/guest', options).then(ret => {
            if (ret.error_code) {
              vm.auth().logout()
              return
            }

            vm.__loadAuthenticationDataFromResponse(ret)

            if (null !== vm.currentUser) {
              vm.__propagateUserState(vm.currentUser)
            }

            return ret.result.data
          })
        },

        onAuthStateChanged: (callback) => {
          if (typeof callback == 'function') {

            if (vm.changeHooks.indexOf(callback) == -1) {
              if (vm.options.debug) {
                console.log('Registered callback function: onAuthStateChanged', callback)
              }

              vm.changeHooks.push(callback)
            } else {
              if (vm.options.debug) {
                console.log('Callback function onAuthStateChanged is already registered', callback)
              }
            }

            var current_user = vm.currentUser
            var current_token = vm.token

            if (vm.options.debug) {
              if (current_user && current_token) {
                console.log('User is logged in', current_user)
              } else {
                console.log('User is not logged in')
              }
            }

            return current_token && current_user ? callback(current_user) : callback(false)
          } else {
            if (vm.options.debug) {
              console.log('User is not logged in')
            }

            return false
          }
        }
      }
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
          value.ts = value.ts || Date.now()
          value.rnd = value.rnd || generateRandomNumber(10000, 99999)

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

    if (vm.options.debug) {
      console.log('%c Previolet Javascript SDK instantiated in debug mode', 'color: #CC00FF')
    }

    // Handle browser identification
    if (! vm.browserIdentification) {
        vm.browserIdentification =  {
        ua: navigator.userAgent,
        lang: navigator.language || navigator.userLanguage,
        plat: navigator.platform,
        vsdk: vm.options.sdkVersion,
        vapp: vm.options.appVersion,
      }

      if (vm.options.debug) {
        console.log('Generating browser identification', vm.browserIdentification)
      }
    } else {
      // Check if anything changed and if so, update the identification
      if (vm.options.debug) {
        console.log('Browser identification exists', vm.browserIdentification)
      }

      var match = {
        ua: navigator.userAgent,
        lang: navigator.language || navigator.userLanguage,
        plat: navigator.platform,
        vsdk: vm.options.sdkVersion,
        vapp: vm.options.appVersion,
        ts: vm.browserIdentification.ts,
        rnd: vm.browserIdentification.rnd,
      }

      if (JSON.stringify(match) != JSON.stringify(vm.browserIdentification)) {
        if (vm.options.debug) {
          console.log('Browser identification changed, renewing', match)
        }

        vm.browserIdentification = match
      }
    }

    vm.db = () => {
      return new DatabaseApi(vm).addToErrorChain(vm, vm.__checkError)
    }

    vm.functions = () => {
      return new FunctionsApi(vm).addToErrorChain(vm, vm.__checkError)
    }

    vm.storage = () => {
      return new StorageApi(vm).addToErrorChain(vm, vm.__checkError)
    }

    vm.remoteConfig = () => {
      return new RemoteConfig(vm).addToErrorChain(vm, vm.__checkError)
    }

    vm.user = () => {
      return {
        data: vm.__storageGet(vm.options.userStorage),
      }
    }
    vm.currentUser = vm.user().data
  }

  getDefaultHeaders() {
    return Object.assign({}, this.headers, {})
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

  __propagateUserState(userState) {
    const vm = this

    vm.changeHooks.forEach((func) => {
      if (vm.options.debug) {
        console.log('Triggering onAuthStateChanged callback', userState)
      }

      func(userState)
    })
  }

  __loadAuthenticationDataFromResponse(ret) {
    if (ret.result.token) {
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
    } else {
      if (this.options.debug) {
        console.log('Saving default guest details')
      }

      this.currentUser = {
        name: 'Guest',
        username: 'guest',
        guest: true,
      }
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

  __checkError (context, response) {
    if (response.error) {
      if (context.options.debug) {
        console.log('%cBackend error details', 'color: #FF3333', response)
      }

      if (response.error_code && (response.error_code == apiErrors.INVALID_TOKEN || response.error_code == apiErrors.TOKEN_DOESNT_MATCH_INSTANCE)) {
        // If the user was logged in as guest, get another token
        if (context.user().data.guest) {
          context.auth().loginAsGuest()
        } else {
          context.auth().logout()
        }
      }

      throw response
    }
  }
}
