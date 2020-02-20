/*!
 * Previolet Javascript SDK v1.0.4
 * https://github.com/previolet/previolet-js-sdk
 * Released under the MIT License.
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.PrevioletSDK = factory());
}(this, (function () { 'use strict';

function getBaseUrl(options, instance) {
  instance = instance || options.instance;
  var base_url = options.baseUrl.replace('{{instance}}', instance);
  base_url = base_url.replace('{{region}}', options.region);

  return base_url
}

function generateRandomNumber(from, to) {
  from = from || 100;
  to = to || 999;
  return Math.floor((Math.random() * to) + from)
}

var defaultOptions = {
  baseUrl: 'https://{{instance}}.{{region}}.previolet.com/v1',
  region: 'eu.east1',
  guestTokenExpiration: 3600, // in seconds
  userTokenExpiration: 86400 * 10, // 10 days
  storageType: 'localStorage',
  storageNamespace: 'previolet-sdk',
  tokenName: 'token',
  applicationStorage: 'app',
  browserIdentification: 'bid',
  userStorage: 'user',
  debug: false,
  reqIndex: 1,
  sdkVersion: '1.0.4',
  appVersion: '-',
  defaultConfig: {},
};

var apiErrors = {
	NO_TOKEN: 1,
  INVALID_TOKEN: 2,
  TOKEN_DOESNT_MATCH_INSTANCE: 3,

  NO_AUTH_SUPPORT: 330,
  NO_AUTH_NAME_OR_CHALLENGE: 331,
  INVALID_NAME_OR_CHALLENGE: 332,
  NO_RULES_FOR_ROLE: 333,
  CANNOT_REFRESH_TOKEN: 334,
  INVALID_RESET_HASH: 801,
  CHALLENGES_DO_NOT_MATCH: 802,
  INVALID_CHALLENGE: 803,

  NO_IDENTITY_PROVIDER_TOKEN: 901,
  IDENTITY_ALREADY_REGISTERED: 902,
  IDENTITY_ID_NOT_FOUND: 903,
  IDENTITY_NOT_FOUND: 904,
  IDENTITY_EMAIL_CONFLICT: 905,
  IDENTITY_MISSING_GROUP: 906, 
};

var fakeWindow = {
  atob: function atob() { },
  open: function open() { },
  location: {},
  localStorage: {
    setItem: function setItem() { },
    getItem: function getItem() { },
    removeItem: function removeItem() { },
  },
  sessionStorage: {
    setItem: function setItem() { },
    getItem: function getItem() { },
    removeItem: function removeItem() { },
  },
};



var $window = (typeof window !== undefined)
  ? window
  : fakeWindow;

var LocalStorage = function LocalStorage(namespace) {
  this.namespace = namespace || null;
};

LocalStorage.prototype.setItem = function setItem (key, value) {
  $window.localStorage.setItem(this._getStorageKey(key), value);
};

LocalStorage.prototype.getItem = function getItem (key) {
  return $window.localStorage.getItem(this._getStorageKey(key))
};

LocalStorage.prototype.removeItem = function removeItem (key) {
  $window.localStorage.removeItem(this._getStorageKey(key));
};

LocalStorage.prototype._getStorageKey = function _getStorageKey (key) {
  if (this.namespace) {
    return [this.namespace, key].join('.')
  }
  return key
};

function StorageFactory(options) {
  switch (options.storageType) {
    case 'localStorage':
      try {
        $window.localStorage.setItem('testKey', 'test');
        $window.localStorage.removeItem('testKey');
        return new LocalStorage(options.storageNamespace)
      } catch(e) {}

    default:
      return new LocalStorage(options.storageNamespace)
      break;
  }
}

var Base = function Base(options, token, bi) {
  this.options  = options;
  this.token    = token;
  this.bi       = JSON.stringify(bi);

  this.errorChain = [];
};

Base.prototype.addToErrorChain = function addToErrorChain (context, func) {
  if (typeof func == 'function') {
    this.errorChain.push({
      context: context,
      func: func
    });

    if (this.options.debug) {
      console.log('Added function to error chain', context, func);
    }
  } else {
    if (this.options.debug) {
      console.log('Cannot add function to error chain, not a function', context, func);
    }
  }

  return this
};

Base.prototype.__call = function __call (url, options) {
    var this$1 = this;

  options.headers = Object.assign({}, {
    'Authorization': this.token,
    'Identification': btoa(this.bi),
  });

  var endpoint = getBaseUrl(this.options) + url;
  var req_id = this.options.reqIndex ++;

  if (this.options.debug) {
    console.log('> XHR Request (' + req_id + '): ', endpoint, options);
  }

  return axios(endpoint, options)
  .then(function (ret) {
    if (this$1.options.debug) {
      console.log('< XHR Response (' + req_id + ')', ret);
    }

    return ret.data
  })
  .catch(function (err) {
    throw err
  })
};

Base.prototype.__checkError = function __checkError (context, response) {
    var this$1 = this;

  if (response.error) {

    if (this.errorChain.length) {
      // Propagate error to error chain

      this.errorChain.forEach(function (errorCallback) {
        if (errorCallback.func && typeof errorCallback.func == 'function') {
          if (this$1.options.debug) {
            console.log('Propagating error', response);
          }

          errorCallback.func(errorCallback.context, response);
        }
      });
    } else {
      // Looks like we're handling errors
      if (this.options.debug) {
        console.log('%cBackend error details', 'color: #FF3333', response);
      }

      throw response
    }
  }
};

var Database = (function (Base$$1) {
  function Database(sdk) {
    Base$$1.call(this, sdk.options, sdk.token, sdk.browserIdentification);
    this.currentDatabase = null;
  }

  if ( Base$$1 ) Database.__proto__ = Base$$1;
  Database.prototype = Object.create( Base$$1 && Base$$1.prototype );
  Database.prototype.constructor = Database;

  Database.prototype.getAll = function getAll () {
    var this$1 = this;

    var options = {
      method: 'GET',
    };

    return this.__call('/__/index', options).then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result.objects
    })
  };

  Database.prototype.select = function select (database) {
    this.currentDatabase = database;
    return this
  };

  Database.prototype.add = function add (data) {
    var this$1 = this;

    data = data || {};

    var options = {
      method: 'POST',
      data: data,
    };

    return this.__callDatabase(options).then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result ? ret.result : ret
    })
  };

  Database.prototype.get = function get (params) {
    var this$1 = this;

    params = params || {};

    var options = {
      method: 'GET',
      params: params,
    };

    return this.__callDatabase(options).then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result ? ret.result : []
    })
  };

  Database.prototype.getOne = function getOne (params) {
    var this$1 = this;

    params = params || {};
    params._limit = 1;

    var options = {
      method: 'GET',
      params: params,
    };

    return this.__callDatabase(options).then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result && ret.result[0] ? ret.result[0] : false
    })
  };

  Database.prototype.getCount = function getCount (params) {
    var this$1 = this;

    params = params || {};

    var options = {
      method: 'GET',
      params: params,
    };

    return this.__callDatabase(options, '/count').then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result ? parseInt(ret.result) : 0
    })
  };

  Database.prototype.update = function update (id, data) {
    var this$1 = this;

    data = data || {};

    var options = {
      method: 'PUT',
      data: data,
    };

    return this.__callDatabase(options, '/' + id).then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result ? ret.result : ret
    })
  };

  Database.prototype.delete = function delete$1 (id) {
    var this$1 = this;

    var options = {
      method: 'DELETE',
    };

    return this.__callDatabase(options, '/' + id).then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result ? ret.result : ret
    })
  };

  Database.prototype.fieldExists = function fieldExists (name) {
    // Implementation to follow
  };

  Database.prototype.addField = function addField (params) {
    // Implementation to follow
  };

  Database.prototype.getViews = function getViews (params) {
    var this$1 = this;

    params = params || {};

    var options = {
      method: 'GET',
      params: params,
    };

    return this.__callDatabase(options, '/structure/views').then(function (ret) {
      this$1.__checkError(this$1, ret);
      return ret.result ? ret.result : []
    })
  };

  Database.prototype.getDistinct = function getDistinct (field, params) {
    // Implementation to follow
  };

  Database.prototype.getDistinctCount = function getDistinctCount (field, params) {
    // Implementation to follow
  };

  Database.prototype.__callDatabase = function __callDatabase (options, append) {
    append = append || '';

    if (null === this.currentDatabase) {
      return Promise.reject(new Error('Please select a database'))
    }

    return this.__call('/' + this.currentDatabase + append, options)
  };

  return Database;
}(Base));

var Functions = (function (Base$$1) {
  function Functions(sdk) {
    Base$$1.call(this, sdk.options, sdk.token, sdk.browserIdentification);
  }

  if ( Base$$1 ) Functions.__proto__ = Base$$1;
  Functions.prototype = Object.create( Base$$1 && Base$$1.prototype );
  Functions.prototype.constructor = Functions;

  Functions.prototype.getAll = function getAll () {
    var options = {
      method: 'GET',
    };

    return this.__call('/__/function', options).then(function (ret) { return ret.result; })
  };

  Functions.prototype.run = function run (id, data) {
    data = data || false;

    var options = {
      method: 'POST',
      data: data,
    };

    return this.__call('/__/function/' + id, options).then(function (ret) {
      return ret.result ? ret.result : ret
    })
  };

  return Functions;
}(Base));

var Storage = (function (Base$$1) {
  function Storage(sdk) {
    Base$$1.call(this, sdk.options, sdk.token, sdk.browserIdentification);
  }

  if ( Base$$1 ) Storage.__proto__ = Base$$1;
  Storage.prototype = Object.create( Base$$1 && Base$$1.prototype );
  Storage.prototype.constructor = Storage;

  Storage.prototype.getAll = function getAll () {
    var options = {
      method: 'GET',
    };

    return this.__call('/__/storage', options).then(function (ret) { return ret.result; })
  };

  return Storage;
}(Base));

var RemoteConfig = (function (Base$$1) {
  function RemoteConfig(sdk) {
    Base$$1.call(this, sdk.options, sdk.token, sdk.browserIdentification);
  }

  if ( Base$$1 ) RemoteConfig.__proto__ = Base$$1;
  RemoteConfig.prototype = Object.create( Base$$1 && Base$$1.prototype );
  RemoteConfig.prototype.constructor = RemoteConfig;

  RemoteConfig.prototype.get = function get () {
    var vm = this;
    var options = {
      method: 'GET',
    };

    return this.__call('/__/remote-config', options).then(function (config) {
      if (typeof config == 'object') {
        var merge_config = vm.options.defaultConfig;

        Object.keys(config).forEach(function (key) {
          merge_config[key] = config[key];
        });

        return merge_config
      } else {
        return vm.options.defaultConfig
      }
    })
  };

  RemoteConfig.prototype.defaultConfig = function defaultConfig (config) {
    this.options.defaultConfig = config;
  };

  return RemoteConfig;
}(Base));

var PrevioletSDK = function PrevioletSDK (overrideOptions) {
  var this$1 = this;

  var vm = this;
  var options = Object.assign({}, defaultOptions, overrideOptions);
  var token = false;
  var currentApp = null;
  var currentUser = null;
  var last_access_token = null;
  var headers = {};
  this.changeHooks = [];
  this.storageApi = StorageFactory(options);

  this.auth = function () {
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

      logout: function (params) {
        if (! vm.auth().isAuthenticated()) {
          return Promise.reject(new Error('There is no authenticated user'))
        }

        params = params || {};
        params.preventUserStatePropagation = params.preventUserStatePropagation || false;

        var data = JSON.stringify({
          token: vm.token
        });

        var options = {
          method: 'DELETE',
          data: data
        };

        if (vm.options.debug) {
          console.log('Logging Out');
        }

        vm.storageApi.removeItem(vm.options.tokenName);
        vm.storageApi.removeItem(vm.options.applicationStorage);
        vm.storageApi.removeItem(vm.options.userStorage);

        if (! params.preventUserStatePropagation) {
          vm.__propagateUserState(false);
        }

        return vm.__call('/__/token', options, 'token').then(function (ret) {
          return ret
        })
      },

      loginWithUsernameAndPassword: function (name, challenge) {
        if (! name) {
          return Promise.reject(new Error('username required'))
        }

        if (! challenge) {
          return Promise.reject(new Error('password required'))
        }

        if (vm.options.debug) {
          console.log('Logging In with username and password', name, challenge);
        }

        var data = JSON.stringify({
          name: name,
          challenge: challenge,
          expire: vm.options.userTokenExpiration,
        });

        var options = {
          method: 'POST',
          data: data,
        };

        return vm.__call('/__/auth', options).then(function (ret) {
          vm.__checkError(vm, ret);
          vm.__loadAuthenticationDataFromResponse(ret);

          if (null !== vm.currentUser) {
            vm.__propagateUserState(vm.currentUser);
          }

          return ret.result.data
        })
      },

      loginWithIdentityProvider: function (provider, access_token) {
        access_token = access_token || this$1.last_access_token;
        this$1.last_access_token = access_token;

        if (this$1.options.debug) {
          console.log('Logging In with identity provider:', provider, access_token);
        }

        var params = {
          access_token: access_token,
        };

        var options = {
          method: 'POST',
          params: params,
        };

        return this$1.__call('/__/auth/identity/' + provider, options).then(function (ret) {
          this$1.__checkError(vm, ret);

          if (! ret.result) {
            vm.__propagateUserState(false);
          } else if (ret.result) {
            if (ret.result.token && ret.result.auth) {
              vm.__loadAuthenticationDataFromResponse(ret);
              vm.__propagateUserState(ret.result.auth);
            } else {
              vm.__propagateUserState(false);
            }
          }

          return ret.result
        })
      },

      registerWithIdentityProvider: function (provider, email, access_token, trigger_login) {
        access_token = access_token || this$1.last_access_token;
        trigger_login = trigger_login || true;
        this$1.last_access_token = access_token;

        var data = {
          access_token: access_token,
          email: email,
          role: 'admin'
        };

        var options = {
          method: 'POST',
          data: data,
        };

        return this$1.__call('/__/auth/identity/' + provider + '/register', options).then(function (ret) {
          this$1.__checkError(vm, ret);

          if (trigger_login) {
            return this$1.loginWithIdentityProvider(provider, access_token)
          } else {
            return ret
          }
        })
      },

      isAuthenticated: function () {
        var token = vm.token;

        if (token) {
          return true
        } else {
          return false
        }
      },

      loginAsGuest: function () {
        var data = JSON.stringify({
          expire: vm.options.guestTokenExpiration
        });

        var options = {
          method: 'POST',
          data: data
        };

        return vm.__call('/__/auth/guest', options).then(function (ret) {
          if (ret.error_code) {
            vm.auth().logout();
            return
          }

          vm.__loadAuthenticationDataFromResponse(ret);

          if (null !== vm.currentUser) {
            vm.__propagateUserState(vm.currentUser);
          }

          return ret.result.data
        })
      },

      onAuthStateChanged: function (callback) {
        if (typeof callback == 'function') {

          if (vm.changeHooks.indexOf(callback) == -1) {
            if (vm.options.debug) {
              console.log('Registered callback function: onAuthStateChanged', callback);
            }

            vm.changeHooks.push(callback);
          } else {
            if (vm.options.debug) {
              console.log('Callback function onAuthStateChanged is already registered', callback);
            }
          }

          var current_user = vm.currentUser;
          var current_token = vm.token;

          if (vm.options.debug) {
            if (current_user && current_token) {
              console.log('User is logged in', current_user);
            } else {
              console.log('User is not logged in');
            }
          }

          return current_token && current_user ? callback(current_user) : callback(false)
        } else {
          if (vm.options.debug) {
            console.log('User is not logged in');
          }

          return false
        }
      }
    }
  };

  Object.defineProperties(this, {
    options: {
      get: function get() {
        return options
      }
    },

    token: {
      get: function get() {
        return token
      },
      set: function set(value) {
        if (value == token) {
          return
        }

        token = value;
        vm.storageApi.setItem(options.tokenName, token);
      }
    },

    headers: {
      get: function get() {
        return headers
      }
    },

    currentApp: {
      get: function get() {
        return currentApp
      },
      set: function set(value) {
        currentApp = value;
        vm.storageApi.setItem(options.applicationStorage, btoa(JSON.stringify(value)));
      }
    },

    currentUser: {
      get: function get() {
        return currentUser
      },
      set: function set(value) {
        currentUser = value;
        vm.storageApi.setItem(options.userStorage, btoa(JSON.stringify(value)));
      }
    },

    browserIdentification: {
      get: function get() {
        return vm.__storageGet(vm.options.browserIdentification)
      },
      set: function set(value) {
        value.ts = value.ts || Date.now();
        value.rnd = value.rnd || generateRandomNumber(10000, 99999);

        vm.storageApi.setItem(options.browserIdentification, btoa(JSON.stringify(value)));
      }
    }
  });

  vm.app = function () {
    return {
      region: vm.options.region,
      token: vm.storageApi.getItem(vm.options.tokenName) || false,
      data: vm.__storageGet(vm.options.applicationStorage),
    }
  };

  var _stored_token = vm.app().token;
  vm.token = _stored_token;

  if (vm.options.debug) {
    console.log('%c Previolet Javascript SDK instantiated in debug mode', 'color: #CC00FF');
  }

  // Handle browser identification
  if (! vm.browserIdentification) {
      vm.browserIdentification ={
      ua: navigator.userAgent,
      lang: navigator.language || navigator.userLanguage,
      plat: navigator.platform,
      vsdk: vm.options.sdkVersion,
      vapp: vm.options.appVersion,
    };

    if (vm.options.debug) {
      console.log('Generating browser identification', vm.browserIdentification);
    }
  } else {
    // Check if anything changed and if so, update the identification
    if (vm.options.debug) {
      console.log('Browser identification exists', vm.browserIdentification);
    }

    var match = {
      ua: navigator.userAgent,
      lang: navigator.language || navigator.userLanguage,
      plat: navigator.platform,
      vsdk: vm.options.sdkVersion,
      vapp: vm.options.appVersion,
      ts: vm.browserIdentification.ts,
      rnd: vm.browserIdentification.rnd,
    };

    if (JSON.stringify(match) != JSON.stringify(vm.browserIdentification)) {
      if (vm.options.debug) {
        console.log('Browser identification changed, renewing', match);
      }

      vm.browserIdentification = match;
    }
  }

  vm.db = function () {
    return new Database(vm).addToErrorChain(vm, vm.__checkError)
  };

  vm.functions = function () {
    return new Functions(vm).addToErrorChain(vm, vm.__checkError)
  };

  vm.storage = function () {
    return new Storage(vm).addToErrorChain(vm, vm.__checkError)
  };

  vm.remoteConfig = function () {
    return new RemoteConfig(vm).addToErrorChain(vm, vm.__checkError)
  };

  vm.user = function () {
    return {
      data: vm.__storageGet(vm.options.userStorage),
    }
  };
  vm.currentUser = vm.user().data;
};

PrevioletSDK.prototype.getDefaultHeaders = function getDefaultHeaders () {
  return Object.assign({}, this.headers, {})
};

PrevioletSDK.prototype.getRemoteConfig = function getRemoteConfig () {
  var vm = this;

  return this.functions().getRemoteConfig().then(function (config) {
    if (typeof config == 'object') {
      var merge = vm.options.defaultConfig;
      Object.keys(config).forEach(function (key) {
        merge[key] = config[key];
      });

      return merge
    } else {
      return vm.options.defaultConfig
    }
  })
};

PrevioletSDK.prototype.__propagateUserState = function __propagateUserState (userState) {
  var vm = this;

  vm.changeHooks.forEach(function (func) {
    if (vm.options.debug) {
      console.log('Triggering onAuthStateChanged callback', userState);
    }

    func(userState);
  });
};

PrevioletSDK.prototype.__loadAuthenticationDataFromResponse = function __loadAuthenticationDataFromResponse (ret) {
  if (ret.result.token) {
    if (this.options.debug) {
      console.log('Saving token', ret.result.token);
    }

    this.token = ret.result.token;
  }

  if (ret.result.auth) {
    if (this.options.debug) {
      console.log('Saving user details', ret.result.auth);
    }

    this.currentUser = ret.result.auth;
  } else {
    if (this.options.debug) {
      console.log('Saving default guest details');
    }

    this.currentUser = {
      name: 'Guest',
      username: 'guest',
      guest: true,
    };
  }

  if (ret.result.data) {
    if (ret.result.data[this.options.instance] && ret.result.data[this.options.instance].instance_data) {
      this.currentApp = ret.result.data[this.options.instance].instance_data;

      if (this.options.debug) {
        console.log('Saving application details', this.currentApp);
      }
    } else {
      if (this.options.debug) {
        console.log('Application details not available');
      }
    }
  }
};

PrevioletSDK.prototype.__call = function __call (url, options, instance) {
    var this$1 = this;

  instance = instance || this.options.instance;
  options.headers = this.getDefaultHeaders();

  var req_id = this.options.reqIndex ++;
  var endpoint = getBaseUrl(this.options, instance) + url;

  if (this.options.debug) {
    console.log('> XHR Request (' + req_id + ')', endpoint, options);
  }

  return axios(endpoint, options)
    .then(function (ret) {
      if (this$1.options.debug) {
        console.log('< XHR Response (' + req_id + ')', ret);
      }

      return ret.data
    })
    .catch(function (err) {
      throw err
    })
};

PrevioletSDK.prototype.__storageGet = function __storageGet (key) {
  var vm = this;

  var _storage = vm.storageApi.getItem(key);
  var _storage_data = false;

  if (_storage) {
    try {
      _storage_data = JSON.parse(atob(_storage));
    } catch (e) {
    }
  }

  return _storage_data
};

PrevioletSDK.prototype.__checkError = function __checkError (context, response) {
  if (response.error) {
    if (context.options.debug) {
      console.log('%cBackend error details', 'color: #FF3333', response);
    }

    if (response.error_code && (response.error_code == apiErrors.INVALID_TOKEN || response.error_code == apiErrors.TOKEN_DOESNT_MATCH_INSTANCE)) {
      // If the user was logged in as guest, get another token
      if (context.user().data.guest) {
        context.auth().loginAsGuest();
      } else {
        context.auth().logout();
      }
    }

    throw response
  }
};

return PrevioletSDK;

})));
