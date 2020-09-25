/**
 * Previolet Javascript SDK v1.0.8
 * https://github.com/previolet/previolet-js-sdk
 * Released under the MIT License.
 */

'use strict';

function getBaseUrl(options, instance) {
  instance = instance || options.instance;
  var base_url = options.baseUrl.replace('{{instance}}', instance);
  base_url = base_url.replace('{{region}}', options.region);
  return base_url
}
function getBaseBucketUrl(options, instance, bucket) {
  instance = instance || options.instance;
  var base_url = options.baseUrl.replace('{{instance}}', 'log-' + instance + '-' + bucket);
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
  region: 'eu.west1',
  guestTokenExpiration: 3600,
  userTokenExpiration: 86400 * 10,
  storageType: 'localStorage',
  storageNamespace: 'previolet-sdk',
  tokenName: 'token',
  applicationStorage: 'app',
  browserIdentification: 'bid',
  userStorage: 'user',
  debug: false,
  reqIndex: 1,
  sdkVersion: '1.0.8',
  appVersion: '-',
  defaultConfig: {},
  tokenOverride: false,
  tokenFallback: false
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

const fakeWindow = {
  atob() { },
  open() { },
  location: {},
  localStorage: {
    setItem() { },
    getItem() { },
    removeItem() { },
  },
  sessionStorage: {
    setItem() { },
    getItem() { },
    removeItem() { },
  },
};
const $window = (typeof window !== undefined)
  ? window
  : fakeWindow;

class LocalStorage {
  constructor(namespace) {
    this.namespace = namespace || null;
  }
  setItem(key, value) {
    $window.localStorage.setItem(this._getStorageKey(key), value);
  }
  getItem(key) {
    return $window.localStorage.getItem(this._getStorageKey(key))
  }
  removeItem(key) {
    $window.localStorage.removeItem(this._getStorageKey(key));
  }
  _getStorageKey(key) {
    if (this.namespace) {
      return [this.namespace, key].join('.')
    }
    return key
  }
}

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
  }
}

class Base {
  constructor(sdk) {
    this.sdk = sdk;
    this.errorChain = [];
  }
  addToErrorChain(context, func) {
    if (typeof func == 'function') {
      this.errorChain.push({
        context,
        func
      });
      if (this.sdk.options.debug) {
        console.log('Added function to error chain', context, func);
      }
    } else {
      if (this.sdk.options.debug) {
        console.log('Cannot add function to error chain, not a function', context, func);
      }
    }
    return this
  }
  __getTokenToUse() {
    var __token = null;
    if (this.sdk.token) {
      if (this.sdk.options.debug) {
        console.log('Using stored token', this.sdk.token);
      }
      __token = this.sdk.token;
    }
    if (! __token && this.sdk.options.tokenFallback) {
      if (this.sdk.options.debug) {
        console.log('Token is now the fallback option', this.sdk.options.tokenFallback);
      }
      __token = this.sdk.options.tokenFallback;
    }
    if (this.sdk.options.tokenOverride) {
      if (this.sdk.options.debug) {
        console.log('Token is now the override option', this.sdk.options.tokenOverride);
      }
      __token = this.sdk.options.tokenOverride;
    }
    return __token
  }
  __call(url, options) {
    var __token = this.__getTokenToUse();
    var __identification = this.sdk.browserIdentification;
    if (this.sdk.options.debug) {
      console.log('Using Identification', __identification);
    }
    options.headers = Object.assign({}, {
      'Authorization': __token,
      'Identification': btoa(JSON.stringify(__identification)),
    });
    var endpoint = getBaseUrl(this.sdk.options) + url;
    var req_id = this.sdk.options.reqIndex ++;
    if (this.sdk.options.debug) {
      console.log('> XHR Request (' + req_id + ', ' + __token + '): ', endpoint, options);
    }
    return axios(endpoint, options)
    .then(ret => {
      if (this.sdk.options.debug) {
        console.log('< XHR Response (' + req_id + ')', ret);
      }
      return ret.data
    })
    .catch(err => {
      throw err
    })
  }
  __call_log(bucket, options) {
    var endpoint = getBaseBucketUrl(this.sdk.options, null, bucket).replace('/v1', '/');
    var req_id = this.sdk.options.reqIndex ++;
    if (this.sdk.options.debug) {
      console.log('> XHR Bucket Request (' + req_id + '): ', endpoint);
    }
    return axios(endpoint, options)
    .catch(err => {
      throw err
    })
  }
  __checkError (context, response) {
    if (response.error) {
      if (this.errorChain.length) {
        this.errorChain.forEach(errorCallback => {
          if (errorCallback.func && typeof errorCallback.func == 'function') {
            if (this.sdk.options.debug) {
              console.log('Propagating error', response);
            }
            errorCallback.func(errorCallback.context, response);
          }
        });
      } else {
        if (this.sdk.options.debug) {
          console.log('%cBackend error details', 'color: #FF3333', response);
        }
        throw response
      }
    }
  }
}

class Database extends Base {
  constructor(sdk) {
    super(sdk);
    this.currentDatabase = null;
  }
  getAll() {
    const options = {
      method: 'GET',
    };
    return this.__call('/__/index', options).then(ret => {
      this.__checkError(this, ret);
      return ret.result.objects
    })
  }
  select(database) {
    this.currentDatabase = database;
    return this
  }
  add(data) {
    data = data || {};
    const options = {
      method: 'POST',
      data,
    };
    return this.__callDatabase(options).then(ret => {
      this.__checkError(this, ret);
      return ret.result ? ret.result : ret
    })
  }
  get(params) {
    params = params || {};
    const options = {
      method: 'GET',
      params,
    };
    return this.__callDatabase(options).then(ret => {
      this.__checkError(this, ret);
      return ret.result ? ret.result : []
    })
  }
  getOne(params) {
    params = params || {};
    params._limit = 1;
    const options = {
      method: 'GET',
      params,
    };
    return this.__callDatabase(options).then(ret => {
      this.__checkError(this, ret);
      return ret.result && ret.result[0] ? ret.result[0] : false
    })
  }
  getCount(params) {
    params = params || {};
    const options = {
      method: 'GET',
      params,
    };
    return this.__callDatabase(options, '/count').then(ret => {
      this.__checkError(this, ret);
      return ret.result ? parseInt(ret.result) : 0
    })
  }
  update(id, data) {
    data = data || {};
    const options = {
      method: 'PUT',
      data,
    };
    return this.__callDatabase(options, '/' + id).then(ret => {
      this.__checkError(this, ret);
      return ret.result ? ret.result : ret
    })
  }
  delete(id) {
    const options = {
      method: 'DELETE',
    };
    return this.__callDatabase(options, '/' + id).then(ret => {
      this.__checkError(this, ret);
      return ret.result ? ret.result : ret
    })
  }
  fieldExists(name) {
  }
  addField(params) {
  }
  getFields(params) {
    params = params || {};
    const options = {
      method: 'GET',
      params,
    };
    return this.__callDatabase(options, '/structure/fields').then(ret => {
      this.__checkError(this, ret);
      return ret.result ? ret.result : []
    })
  }
  getFilters(params) {
    params = params || {};
    const options = {
      method: 'GET',
      params,
    };
    return this.__callDatabase(options, '/structure/filters').then(ret => {
      this.__checkError(this, ret);
      return ret.result ? ret.result : []
    })
  }
  getViews(params) {
    params = params || {};
    const options = {
      method: 'GET',
      params,
    };
    return this.__callDatabase(options, '/structure/views').then(ret => {
      this.__checkError(this, ret);
      return ret.result ? ret.result : []
    })
  }
  getDistinct(field, params) {
  }
  getDistinctCount(field, params) {
  }
  __callDatabase(options, append) {
    append = append || '';
    if (null === this.currentDatabase) {
      return Promise.reject(new Error('Please select a database'))
    }
    return this.__call('/' + this.currentDatabase + append, options)
  }
}

class Functions extends Base {
  constructor(sdk) {
    super(sdk);
  }
  getAll() {
    const options = {
      method: 'GET',
    };
    return this.__call('/__/function', options).then(ret => ret.result)
  }
  run(id, data) {
    data = data || false;
    const options = {
      method: 'POST',
      data,
    };
    return this.__call('/__/function/' + id, options).then(ret => {
      return ret.result ? ret.result : ret
    })
  }
  getFunctionIdUrl(functionId) {
    return getBaseUrl(this.sdk.options) + '/__/function/' + functionId + '?token=' + this.__getTokenToUse()
  }
}

class Storage extends Base {
  constructor(sdk) {
    super(sdk);
  }
  getAll() {
    const options = {
      method: 'GET',
    };
    return this.__call('/__/storage', options).then(ret => ret.result)
  }
  getUploadUrl() {
    return getBaseUrl(this.sdk.options) + '/__/storage?token=' + this.__getTokenToUse()
  }
}

class RemoteConfig extends Base {
  constructor(sdk) {
    super(sdk);
  }
  get() {
    const vm = this;
    const options = {
      method: 'GET',
    };
    return this.__call('/__/remote-config', options).then(config => {
      if (typeof config == 'object') {
        var merge_config = vm.sdk.options.defaultConfig;
        Object.keys(config).forEach(key => {
          merge_config[key] = config[key];
        });
        return merge_config
      } else {
        return vm.sdk.options.defaultConfig
      }
    })
  }
  defaultConfig(config) {
    this.sdk.options.defaultConfig = config;
  }
}

class Bucket extends Base {
  constructor(sdk) {
    super(sdk);
  }
  log(bucket, params) {
    if (! Number.isInteger(bucket)) {
      if (this.sdk.options.debug) {
        console.log('Bucket name should be an integer and not', bucket);
      }
      return
    }
    if (typeof params != 'object') {
      if (this.sdk.options.debug) {
        console.log('Bucket params should be send as object and not ' + typeof params, params);
      }
      return
    }
    const options = {
      method: 'GET',
      params,
    };
    return this.__call_log(bucket, options)
  }
}

class Trace extends Base {
  constructor(sdk) {
    super(sdk);
  }
  add(payload) {
    const vm = this;
    let __token = vm.__getTokenToUse();
    let __identification = vm.sdk.browserIdentification;
    let params = {
      p: payload,
      __token,
      __identification,
    };
    if (window.location && window.location.href) {
      params.u = window.location.href;
    }
    const options = {
      method: 'GET',
      params
    };
    return this.__call_log(0, options)
  }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var axios_min = createCommonjsModule(function (module, exports) {
!function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){e.exports=n(1);},function(e,t,n){function r(e){var t=new s(e),n=i(s.prototype.request,t);return o.extend(n,s.prototype,t),o.extend(n,t),n}var o=n(2),i=n(3),s=n(4),a=n(22),u=n(10),c=r(u);c.Axios=s,c.create=function(e){return r(a(c.defaults,e))},c.Cancel=n(23),c.CancelToken=n(24),c.isCancel=n(9),c.all=function(e){return Promise.all(e)},c.spread=n(25),e.exports=c,e.exports.default=c;},function(e,t,n){function r(e){return "[object Array]"===j.call(e)}function o(e){return "undefined"==typeof e}function i(e){return null!==e&&!o(e)&&null!==e.constructor&&!o(e.constructor)&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}function s(e){return "[object ArrayBuffer]"===j.call(e)}function a(e){return "undefined"!=typeof FormData&&e instanceof FormData}function u(e){var t;return t="undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer}function c(e){return "string"==typeof e}function f(e){return "number"==typeof e}function p(e){return null!==e&&"object"==typeof e}function d(e){return "[object Date]"===j.call(e)}function l(e){return "[object File]"===j.call(e)}function h(e){return "[object Blob]"===j.call(e)}function m(e){return "[object Function]"===j.call(e)}function y(e){return p(e)&&m(e.pipe)}function g(e){return "undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams}function v(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}function x(){return ("undefined"==typeof navigator||"ReactNative"!==navigator.product&&"NativeScript"!==navigator.product&&"NS"!==navigator.product)&&("undefined"!=typeof window&&"undefined"!=typeof document)}function w(e,t){if(null!==e&&"undefined"!=typeof e)if("object"!=typeof e&&(e=[e]),r(e))for(var n=0,o=e.length;n<o;n++)t.call(null,e[n],n,e);else for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.call(null,e[i],i,e);}function b(){function e(e,n){"object"==typeof t[n]&&"object"==typeof e?t[n]=b(t[n],e):t[n]=e;}for(var t={},n=0,r=arguments.length;n<r;n++)w(arguments[n],e);return t}function E(){function e(e,n){"object"==typeof t[n]&&"object"==typeof e?t[n]=E(t[n],e):"object"==typeof e?t[n]=E({},e):t[n]=e;}for(var t={},n=0,r=arguments.length;n<r;n++)w(arguments[n],e);return t}function S(e,t,n){return w(t,function(t,r){n&&"function"==typeof t?e[r]=C(t,n):e[r]=t;}),e}var C=n(3),j=Object.prototype.toString;e.exports={isArray:r,isArrayBuffer:s,isBuffer:i,isFormData:a,isArrayBufferView:u,isString:c,isNumber:f,isObject:p,isUndefined:o,isDate:d,isFile:l,isBlob:h,isFunction:m,isStream:y,isURLSearchParams:g,isStandardBrowserEnv:x,forEach:w,merge:b,deepMerge:E,extend:S,trim:v};},function(e,t){e.exports=function(e,t){return function(){for(var n=new Array(arguments.length),r=0;r<n.length;r++)n[r]=arguments[r];return e.apply(t,n)}};},function(e,t,n){function r(e){this.defaults=e,this.interceptors={request:new s,response:new s};}var o=n(2),i=n(5),s=n(6),a=n(7),u=n(22);r.prototype.request=function(e){"string"==typeof e?(e=arguments[1]||{},e.url=arguments[0]):e=e||{},e=u(this.defaults,e),e.method?e.method=e.method.toLowerCase():this.defaults.method?e.method=this.defaults.method.toLowerCase():e.method="get";var t=[a,void 0],n=Promise.resolve(e);for(this.interceptors.request.forEach(function(e){t.unshift(e.fulfilled,e.rejected);}),this.interceptors.response.forEach(function(e){t.push(e.fulfilled,e.rejected);});t.length;)n=n.then(t.shift(),t.shift());return n},r.prototype.getUri=function(e){return e=u(this.defaults,e),i(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")},o.forEach(["delete","get","head","options"],function(e){r.prototype[e]=function(t,n){return this.request(o.merge(n||{},{method:e,url:t}))};}),o.forEach(["post","put","patch"],function(e){r.prototype[e]=function(t,n,r){return this.request(o.merge(r||{},{method:e,url:t,data:n}))};}),e.exports=r;},function(e,t,n){function r(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var o=n(2);e.exports=function(e,t,n){if(!t)return e;var i;if(n)i=n(t);else if(o.isURLSearchParams(t))i=t.toString();else {var s=[];o.forEach(t,function(e,t){null!==e&&"undefined"!=typeof e&&(o.isArray(e)?t+="[]":e=[e],o.forEach(e,function(e){o.isDate(e)?e=e.toISOString():o.isObject(e)&&(e=JSON.stringify(e)),s.push(r(t)+"="+r(e));}));}),i=s.join("&");}if(i){var a=e.indexOf("#");a!==-1&&(e=e.slice(0,a)),e+=(e.indexOf("?")===-1?"?":"&")+i;}return e};},function(e,t,n){function r(){this.handlers=[];}var o=n(2);r.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},r.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null);},r.prototype.forEach=function(e){o.forEach(this.handlers,function(t){null!==t&&e(t);});},e.exports=r;},function(e,t,n){function r(e){e.cancelToken&&e.cancelToken.throwIfRequested();}var o=n(2),i=n(8),s=n(9),a=n(10);e.exports=function(e){r(e),e.headers=e.headers||{},e.data=i(e.data,e.headers,e.transformRequest),e.headers=o.merge(e.headers.common||{},e.headers[e.method]||{},e.headers),o.forEach(["delete","get","head","post","put","patch","common"],function(t){delete e.headers[t];});var t=e.adapter||a.adapter;return t(e).then(function(t){return r(e),t.data=i(t.data,t.headers,e.transformResponse),t},function(t){return s(t)||(r(e),t&&t.response&&(t.response.data=i(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)})};},function(e,t,n){var r=n(2);e.exports=function(e,t,n){return r.forEach(n,function(n){e=n(e,t);}),e};},function(e,t){e.exports=function(e){return !(!e||!e.__CANCEL__)};},function(e,t,n){function r(e,t){!i.isUndefined(e)&&i.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t);}function o(){var e;return "undefined"!=typeof XMLHttpRequest?e=n(12):"undefined"!=typeof process&&"[object process]"===Object.prototype.toString.call(process)&&(e=n(12)),e}var i=n(2),s=n(11),a={"Content-Type":"application/x-www-form-urlencoded"},u={adapter:o(),transformRequest:[function(e,t){return s(t,"Accept"),s(t,"Content-Type"),i.isFormData(e)||i.isArrayBuffer(e)||i.isBuffer(e)||i.isStream(e)||i.isFile(e)||i.isBlob(e)?e:i.isArrayBufferView(e)?e.buffer:i.isURLSearchParams(e)?(r(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):i.isObject(e)?(r(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e);}catch(e){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300}};u.headers={common:{Accept:"application/json, text/plain, */*"}},i.forEach(["delete","get","head"],function(e){u.headers[e]={};}),i.forEach(["post","put","patch"],function(e){u.headers[e]=i.merge(a);}),e.exports=u;},function(e,t,n){var r=n(2);e.exports=function(e,t){r.forEach(e,function(n,r){r!==t&&r.toUpperCase()===t.toUpperCase()&&(e[t]=n,delete e[r]);});};},function(e,t,n){var r=n(2),o=n(13),i=n(5),s=n(16),a=n(19),u=n(20),c=n(14);e.exports=function(e){return new Promise(function(t,f){var p=e.data,d=e.headers;r.isFormData(p)&&delete d["Content-Type"];var l=new XMLHttpRequest;if(e.auth){var h=e.auth.username||"",m=e.auth.password||"";d.Authorization="Basic "+btoa(h+":"+m);}var y=s(e.baseURL,e.url);if(l.open(e.method.toUpperCase(),i(y,e.params,e.paramsSerializer),!0),l.timeout=e.timeout,l.onreadystatechange=function(){if(l&&4===l.readyState&&(0!==l.status||l.responseURL&&0===l.responseURL.indexOf("file:"))){var n="getAllResponseHeaders"in l?a(l.getAllResponseHeaders()):null,r=e.responseType&&"text"!==e.responseType?l.response:l.responseText,i={data:r,status:l.status,statusText:l.statusText,headers:n,config:e,request:l};o(t,f,i),l=null;}},l.onabort=function(){l&&(f(c("Request aborted",e,"ECONNABORTED",l)),l=null);},l.onerror=function(){f(c("Network Error",e,null,l)),l=null;},l.ontimeout=function(){var t="timeout of "+e.timeout+"ms exceeded";e.timeoutErrorMessage&&(t=e.timeoutErrorMessage),f(c(t,e,"ECONNABORTED",l)),l=null;},r.isStandardBrowserEnv()){var g=n(21),v=(e.withCredentials||u(y))&&e.xsrfCookieName?g.read(e.xsrfCookieName):void 0;v&&(d[e.xsrfHeaderName]=v);}if("setRequestHeader"in l&&r.forEach(d,function(e,t){"undefined"==typeof p&&"content-type"===t.toLowerCase()?delete d[t]:l.setRequestHeader(t,e);}),r.isUndefined(e.withCredentials)||(l.withCredentials=!!e.withCredentials),e.responseType)try{l.responseType=e.responseType;}catch(t){if("json"!==e.responseType)throw t}"function"==typeof e.onDownloadProgress&&l.addEventListener("progress",e.onDownloadProgress),"function"==typeof e.onUploadProgress&&l.upload&&l.upload.addEventListener("progress",e.onUploadProgress),e.cancelToken&&e.cancelToken.promise.then(function(e){l&&(l.abort(),f(e),l=null);}),void 0===p&&(p=null),l.send(p);})};},function(e,t,n){var r=n(14);e.exports=function(e,t,n){var o=n.config.validateStatus;!o||o(n.status)?e(n):t(r("Request failed with status code "+n.status,n.config,null,n.request,n));};},function(e,t,n){var r=n(15);e.exports=function(e,t,n,o,i){var s=new Error(e);return r(s,t,n,o,i)};},function(e,t){e.exports=function(e,t,n,r,o){return e.config=t,n&&(e.code=n),e.request=r,e.response=o,e.isAxiosError=!0,e.toJSON=function(){return {message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code}},e};},function(e,t,n){var r=n(17),o=n(18);e.exports=function(e,t){return e&&!r(t)?o(e,t):t};},function(e,t){e.exports=function(e){return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)};},function(e,t){e.exports=function(e,t){return t?e.replace(/\/+$/,"")+"/"+t.replace(/^\/+/,""):e};},function(e,t,n){var r=n(2),o=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];e.exports=function(e){var t,n,i,s={};return e?(r.forEach(e.split("\n"),function(e){if(i=e.indexOf(":"),t=r.trim(e.substr(0,i)).toLowerCase(),n=r.trim(e.substr(i+1)),t){if(s[t]&&o.indexOf(t)>=0)return;"set-cookie"===t?s[t]=(s[t]?s[t]:[]).concat([n]):s[t]=s[t]?s[t]+", "+n:n;}}),s):s};},function(e,t,n){var r=n(2);e.exports=r.isStandardBrowserEnv()?function(){function e(e){var t=e;return n&&(o.setAttribute("href",t),t=o.href),o.setAttribute("href",t),{href:o.href,protocol:o.protocol?o.protocol.replace(/:$/,""):"",host:o.host,search:o.search?o.search.replace(/^\?/,""):"",hash:o.hash?o.hash.replace(/^#/,""):"",hostname:o.hostname,port:o.port,pathname:"/"===o.pathname.charAt(0)?o.pathname:"/"+o.pathname}}var t,n=/(msie|trident)/i.test(navigator.userAgent),o=document.createElement("a");return t=e(window.location.href),function(n){var o=r.isString(n)?e(n):n;return o.protocol===t.protocol&&o.host===t.host}}():function(){return function(){return !0}}();},function(e,t,n){var r=n(2);e.exports=r.isStandardBrowserEnv()?function(){return {write:function(e,t,n,o,i,s){var a=[];a.push(e+"="+encodeURIComponent(t)),r.isNumber(n)&&a.push("expires="+new Date(n).toGMTString()),r.isString(o)&&a.push("path="+o),r.isString(i)&&a.push("domain="+i),s===!0&&a.push("secure"),document.cookie=a.join("; ");},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5);}}}():function(){return {write:function(){},read:function(){return null},remove:function(){}}}();},function(e,t,n){var r=n(2);e.exports=function(e,t){t=t||{};var n={},o=["url","method","params","data"],i=["headers","auth","proxy"],s=["baseURL","url","transformRequest","transformResponse","paramsSerializer","timeout","withCredentials","adapter","responseType","xsrfCookieName","xsrfHeaderName","onUploadProgress","onDownloadProgress","maxContentLength","validateStatus","maxRedirects","httpAgent","httpsAgent","cancelToken","socketPath"];r.forEach(o,function(e){"undefined"!=typeof t[e]&&(n[e]=t[e]);}),r.forEach(i,function(o){r.isObject(t[o])?n[o]=r.deepMerge(e[o],t[o]):"undefined"!=typeof t[o]?n[o]=t[o]:r.isObject(e[o])?n[o]=r.deepMerge(e[o]):"undefined"!=typeof e[o]&&(n[o]=e[o]);}),r.forEach(s,function(r){"undefined"!=typeof t[r]?n[r]=t[r]:"undefined"!=typeof e[r]&&(n[r]=e[r]);});var a=o.concat(i).concat(s),u=Object.keys(t).filter(function(e){return a.indexOf(e)===-1});return r.forEach(u,function(r){"undefined"!=typeof t[r]?n[r]=t[r]:"undefined"!=typeof e[r]&&(n[r]=e[r]);}),n};},function(e,t){function n(e){this.message=e;}n.prototype.toString=function(){return "Cancel"+(this.message?": "+this.message:"")},n.prototype.__CANCEL__=!0,e.exports=n;},function(e,t,n){function r(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise(function(e){t=e;});var n=this;e(function(e){n.reason||(n.reason=new o(e),t(n.reason));});}var o=n(23);r.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},r.source=function(){var e,t=new r(function(t){e=t;});return {token:t,cancel:e}},e.exports=r;},function(e,t){e.exports=function(e){return function(t){return e.apply(null,t)}};}])});
});

if (typeof window.axios == 'undefined') {
  window.axios = axios_min;
}
class PrevioletSDK {
	constructor (overrideOptions) {
    const vm = this;
    let options = Object.assign({}, defaultOptions, overrideOptions);
    if (options.debug) {
      console.log('%cPreviolet Javascript SDK instantiated in debug mode', 'color: #CC00FF');
    }
    if (options.instance &&
        options.instance == '<%= previolet.options.instance %>' &&
        options.fallback &&
        options.fallback.instance) {
      if (options.debug) {
        console.log('Using fallback instance', options.fallback.instance);
      }
      options.instance = options.fallback.instance;
    }
    if (options.tokenFallback && options.tokenOverride) {
      throw 'Cannot define both tokenFallback and tokenOverride'
    }
    if (options.tokenFallback && options.tokenFallback == '<%= previolet.token.guest %>') {
      if (options.fallback && options.fallback.tokenFallback) {
        if (options.debug) {
          console.log('Using fallback tokenFallback', options.fallback.tokenFallback);
        }
        options.tokenFallback = options.fallback.tokenFallback;
      } else {
        if (options.debug) {
          console.log('No fallback tokenFallback provided, defaulting to false');
        }
        options.tokenFallback = false;
      }
    }
    if (options.tokenOverride && options.tokenOverride == '<%= previolet.token.guest %>') {
      if (options.fallback && options.fallback.tokenOverride) {
        if (options.debug) {
          console.log('Using fallback tokenOverride', options.fallback.tokenOverride);
        }
        options.tokenOverride = options.fallback.tokenOverride;
      } else {
        if (options.debug) {
          console.log('No fallback tokenOverride provided, defaulting to false');
        }
        options.tokenOverride = false;
      }
    }
    let token = false;
    let currentApp = null;
    let currentUser = null;
    let headers = {};
    this.changeHooks = [];
    this.storageApi = StorageFactory(options);
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
          params = params || {};
          params.preventUserStatePropagation = params.preventUserStatePropagation || false;
          const data = JSON.stringify({
            token: vm.token
          });
          const options = {
            method: 'DELETE',
            data
          };
          if (vm.options.debug) {
            console.log('Logging Out');
          }
          vm.token = false;
          vm.storageApi.removeItem(vm.options.tokenName);
          vm.storageApi.removeItem(vm.options.applicationStorage);
          vm.storageApi.removeItem(vm.options.userStorage);
          if (! params.preventUserStatePropagation) {
            vm.__propagateUserState(false);
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
            console.log('Logging In with username and password', name, challenge);
          }
          const data = JSON.stringify({
            name,
            challenge,
            expire: vm.options.userTokenExpiration,
          });
          const options = {
            method: 'POST',
            data,
          };
          return vm.__call('/__/auth', options).then(ret => {
            vm.__checkError(vm, ret);
            vm.__loadAuthenticationDataFromResponse(ret);
            if (null !== vm.currentUser) {
              vm.__propagateUserState(vm.currentUser);
            }
            return ret.result.data
          })
        },
        loginWithIdentityProvider: (provider, access_token) => {
          access_token = access_token || this.last_access_token;
          this.last_access_token = access_token;
          if (this.options.debug) {
            console.log('Logging In with identity provider:', provider, access_token);
          }
          const params = {
            access_token,
          };
          const options = {
            method: 'POST',
            params,
          };
          return this.__call('/__/auth/identity/' + provider, options).then(ret => {
            this.__checkError(vm, ret);
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
        forgotPassword: (name, params) => {
          if (! name) {
            return Promise.reject(new Error('username required'))
          }
          var origin = params && params.origin ? params.origin : window.location.origin;
          var skip_email = params && params.skip_email ? params.skip_email : false;
          const data = JSON.stringify({
            name,
            origin,
            skip_email,
          });
          const options = {
            method: 'POST',
            data,
          };
          return vm.__call('/__/auth/reset', options).then(ret => {
            vm.__checkError(vm, ret);
            return ret.result
          })
        },
        forgotPasswordConfirmation: (challenge, confirm_challenge, hash) => {
          if (! challenge) {
            return Promise.reject(new Error('challenge required'))
          }
          if (! confirm_challenge) {
            return Promise.reject(new Error('confirm_challenge required'))
          }
          if (! hash) {
            return Promise.reject(new Error('hash required'))
          }
          const data = JSON.stringify({
            challenge,
            confirm_challenge,
            hash,
          });
          const options = {
            method: 'POST',
            data,
          };
          return vm.__call('/__/auth/reset/confirm', options).then(ret => {
            vm.__checkError(vm, ret);
            return ret.result
          })
        },
        registerWithIdentityProvider: (provider, email, access_token, trigger_login) => {
          access_token = access_token || this.last_access_token;
          trigger_login = trigger_login || true;
          this.last_access_token = access_token;
          const data = {
            access_token,
            email,
            role: 'admin'
          };
          const options = {
            method: 'POST',
            data,
          };
          return this.__call('/__/auth/identity/' + provider + '/register', options).then(ret => {
            this.__checkError(vm, ret);
            if (trigger_login) {
              return this.loginWithIdentityProvider(provider, access_token)
            } else {
              return ret
            }
          })
        },
        isAuthenticated: () => {
          let token = vm.token;
          if (token) {
            return true
          } else {
            return false
          }
        },
        loginAsGuest: () => {
          const data = JSON.stringify({
            expire: vm.options.guestTokenExpiration
          });
          const options = {
            method: 'POST',
            data
          };
          return vm.__call('/__/auth/guest', options).then(ret => {
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
        onAuthStateChanged: (callback) => {
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
          token = value;
          vm.storageApi.setItem(options.tokenName, token);
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
          currentApp = value;
          vm.storageApi.setItem(options.applicationStorage, btoa(JSON.stringify(value)));
        }
      },
      currentUser: {
        get() {
          return currentUser
        },
        set(value) {
          currentUser = value;
          vm.storageApi.setItem(options.userStorage, btoa(JSON.stringify(value)));
        }
      },
      browserIdentification: {
        get() {
          return vm.__storageGet(vm.options.browserIdentification)
        },
        set(value) {
          value.ts = value.ts || Date.now();
          value.rnd = value.rnd || generateRandomNumber(10000, 99999);
          vm.storageApi.setItem(options.browserIdentification, btoa(JSON.stringify(value)));
        }
      }
    });
    vm.app = () => {
      return {
        region: vm.options.region,
        token: vm.storageApi.getItem(vm.options.tokenName) || false,
        data: vm.__storageGet(vm.options.applicationStorage),
      }
    };
    var _stored_token = vm.app().token;
    vm.token = _stored_token;
    if (! vm.browserIdentification) {
        vm.browserIdentification =  {
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
    var __db = new Database(vm).addToErrorChain(vm, vm.__checkError);
    vm.db = () => {
      return __db
    };
    var __functions = new Functions(vm).addToErrorChain(vm, vm.__checkError);
    vm.functions = () => {
      return __functions
    };
    var __storage = new Storage(vm).addToErrorChain(vm, vm.__checkError);
    vm.storage = () => {
      return __storage
    };
    var __remoteConfig = new RemoteConfig(vm).addToErrorChain(vm, vm.__checkError);
    vm.remoteConfig = () => {
      return __remoteConfig
    };
    var __bucket = new Bucket(vm).addToErrorChain(vm, vm.__checkError);
    vm.bucket = () => {
      return __bucket
    };
    var __trace = new Trace(vm).addToErrorChain(vm, vm.__checkError);
    vm.trace = () => {
      return __trace
    };
    vm.user = () => {
      return {
        data: vm.__storageGet(vm.options.userStorage),
      }
    };
    vm.currentUser = vm.user().data;
  }
  getDefaultHeaders() {
    return Object.assign({}, this.headers, {})
  }
  getRemoteConfig() {
    const vm = this;
    return this.functions().getRemoteConfig().then(config => {
      if (typeof config == 'object') {
        var merge = vm.options.defaultConfig;
        Object.keys(config).forEach(key => {
          merge[key] = config[key];
        });
        return merge
      } else {
        return vm.options.defaultConfig
      }
    })
  }
  __propagateUserState(userState) {
    const vm = this;
    vm.changeHooks.forEach((func) => {
      if (vm.options.debug) {
        console.log('Triggering onAuthStateChanged callback', userState);
      }
      func(userState);
    });
  }
  __loadAuthenticationDataFromResponse(ret) {
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
  }
  __call(url, options, instance) {
    instance = instance || this.options.instance;
    options.headers = this.getDefaultHeaders();
    var req_id = this.options.reqIndex ++;
    var endpoint = getBaseUrl(this.options, instance) + url;
    if (this.options.debug) {
      console.log('> XHR Request (' + req_id + ')', endpoint, options);
    }
    return axios_min(endpoint, options)
      .then(ret => {
        if (this.options.debug) {
          console.log('< XHR Response (' + req_id + ')', ret);
        }
        return ret.data
      })
      .catch(err => {
        throw err
      })
  }
  __storageGet(key) {
    const vm = this;
    var _storage = vm.storageApi.getItem(key);
    var _storage_data = false;
    if (_storage) {
      try {
        _storage_data = JSON.parse(atob(_storage));
      } catch (e) {
      }
    }
    return _storage_data
  }
  __checkError (context, response) {
    if (response.error) {
      if (context.options.debug) {
        console.log('%cBackend error details', 'color: #FF3333', response);
      }
      if (response.error_code && (response.error_code == apiErrors.INVALID_TOKEN || response.error_code == apiErrors.TOKEN_DOESNT_MATCH_INSTANCE)) {
        if (context.user().data.guest) {
          context.auth().loginAsGuest();
        } else {
          context.auth().logout();
        }
      }
      throw response
    }
  }
}

module.exports = PrevioletSDK;
