/**
 * Previolet Javascript SDK v1.0.16
 * https://github.com/previolet/previolet-js-sdk
 * Released under the MIT License.
 */

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

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

  var bind = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  var toString = Object.prototype.toString;
  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }
  function isUndefined(val) {
    return typeof val === 'undefined';
  }
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }
  function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }
  function isString(val) {
    return typeof val === 'string';
  }
  function isNumber(val) {
    return typeof val === 'number';
  }
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }
  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                             navigator.product === 'NativeScript' ||
                                             navigator.product === 'NS')) {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }
  function forEach(obj, fn) {
    if (obj === null || typeof obj === 'undefined') {
      return;
    }
    if (typeof obj !== 'object') {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }
  function merge() {
    var result = {};
    function assignValue(val, key) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    }
    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }
  function deepMerge() {
    var result = {};
    function assignValue(val, key) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = deepMerge(result[key], val);
      } else if (typeof val === 'object') {
        result[key] = deepMerge({}, val);
      } else {
        result[key] = val;
      }
    }
    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }
  var utils = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    deepMerge: deepMerge,
    extend: extend,
    trim: trim
  };

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }
  var buildURL = function buildURL(url, params, paramsSerializer) {
    if (!params) {
      return url;
    }
    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];
      utils.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }
        if (utils.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }
        utils.forEach(val, function parseValue(v) {
          if (utils.isDate(v)) {
            v = v.toISOString();
          } else if (utils.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });
      serializedParams = parts.join('&');
    }
    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }
    return url;
  };

  function InterceptorManager() {
    this.handlers = [];
  }
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };
  var InterceptorManager_1 = InterceptorManager;

  var transformData = function transformData(data, headers, fns) {
    utils.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });
    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }
  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          return setTimeout(fun, 0);
      }
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              return cachedSetTimeout.call(this, fun, 0);
          }
      }
  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          return clearTimeout(marker);
      }
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              return cachedClearTimeout.call(this, marker);
          }
      }
  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }
  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = '';
  var versions = {};
  var release = {};
  var config = {};
  function noop() {}
  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;
  function binding(name) {
      throw new Error('process.binding is not supported');
  }
  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }
  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }
  var browser$1 = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }
    error.request = request;
    error.response = response;
    error.isAxiosError = true;
    error.toJSON = function() {
      return {
        message: this.message,
        name: this.name,
        description: this.description,
        number: this.number,
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        config: this.config,
        code: this.code
      };
    };
    return error;
  };

  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  var isAbsoluteURL = function isAbsoluteURL(url) {
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  var buildFullPath = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;
    if (!headers) { return parsed; }
    utils.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils.trim(line.substr(0, i)).toLowerCase();
      val = utils.trim(line.substr(i + 1));
      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });
    return parsed;
  };

  var isURLSameOrigin = (
    utils.isStandardBrowserEnv() ?
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;
        function resolveURL(url) {
          var href = url;
          if (msie) {
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }
          urlParsingNode.setAttribute('href', href);
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }
        originURL = resolveURL(window.location.href);
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
  );

  var cookies = (
    utils.isStandardBrowserEnv() ?
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));
            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }
            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }
            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }
            if (secure === true) {
              cookie.push('secure');
            }
            document.cookie = cookie.join('; ');
          },
          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },
          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
  );

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;
      if (utils.isFormData(requestData)) {
        delete requestHeaders['Content-Type'];
      }
      var request = new XMLHttpRequest();
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password || '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }
      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
      request.timeout = config.timeout;
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };
        settle(resolve, reject, response);
        request = null;
      };
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }
        reject(createError('Request aborted', config, 'ECONNABORTED', request));
        request = null;
      };
      request.onerror = function handleError() {
        reject(createError('Network Error', config, null, request));
        request = null;
      };
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
          request));
        request = null;
      };
      if (utils.isStandardBrowserEnv()) {
        var cookies$1 = cookies;
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
          cookies$1.read(config.xsrfCookieName) :
          undefined;
        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }
      if ('setRequestHeader' in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            delete requestHeaders[key];
          } else {
            request.setRequestHeader(key, val);
          }
        });
      }
      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }
      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }
      if (config.cancelToken) {
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }
          request.abort();
          reject(cancel);
          request = null;
        });
      }
      if (requestData === undefined) {
        requestData = null;
      }
      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }
  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      adapter = xhr;
    } else if (typeof browser$1 !== 'undefined' && Object.prototype.toString.call(browser$1) === '[object process]') {
      adapter = xhr;
    }
    return adapter;
  }
  var defaults = {
    adapter: getDefaultAdapter(),
    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');
      if (utils.isFormData(data) ||
        utils.isArrayBuffer(data) ||
        utils.isBuffer(data) ||
        utils.isStream(data) ||
        utils.isFile(data) ||
        utils.isBlob(data)
      ) {
        return data;
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }
      return data;
    }],
    transformResponse: [function transformResponse(data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {  }
      }
      return data;
    }],
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };
  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };
  utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });
  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });
  var defaults_1 = defaults;

  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    config.headers = config.headers || {};
    config.data = transformData(
      config.data,
      config.headers,
      config.transformRequest
    );
    config.headers = utils.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers
    );
    utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );
    var adapter = config.adapter || defaults_1.adapter;
    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);
        if (reason && reason.response) {
          reason.response.data = transformData(
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }
      return Promise.reject(reason);
    });
  };

  var mergeConfig = function mergeConfig(config1, config2) {
    config2 = config2 || {};
    var config = {};
    var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
    var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
    var defaultToConfig2Keys = [
      'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
      'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
      'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
      'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
      'httpsAgent', 'cancelToken', 'socketPath'
    ];
    utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
      if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      }
    });
    utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
      if (utils.isObject(config2[prop])) {
        config[prop] = utils.deepMerge(config1[prop], config2[prop]);
      } else if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      } else if (utils.isObject(config1[prop])) {
        config[prop] = utils.deepMerge(config1[prop]);
      } else if (typeof config1[prop] !== 'undefined') {
        config[prop] = config1[prop];
      }
    });
    utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
      if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      } else if (typeof config1[prop] !== 'undefined') {
        config[prop] = config1[prop];
      }
    });
    var axiosKeys = valueFromConfig2Keys
      .concat(mergeDeepPropertiesKeys)
      .concat(defaultToConfig2Keys);
    var otherKeys = Object
      .keys(config2)
      .filter(function filterAxiosKeys(key) {
        return axiosKeys.indexOf(key) === -1;
      });
    utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
      if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      } else if (typeof config1[prop] !== 'undefined') {
        config[prop] = config1[prop];
      }
    });
    return config;
  };

  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }
  Axios.prototype.request = function request(config) {
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }
    config = mergeConfig(this.defaults, config);
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }
    return promise;
  };
  Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  };
  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    Axios.prototype[method] = function(url, config) {
      return this.request(utils.merge(config || {}, {
        method: method,
        url: url
      }));
    };
  });
  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    Axios.prototype[method] = function(url, data, config) {
      return this.request(utils.merge(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });
  var Axios_1 = Axios;

  function Cancel(message) {
    this.message = message;
  }
  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };
  Cancel.prototype.__CANCEL__ = true;
  var Cancel_1 = Cancel;

  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }
    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        return;
      }
      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };
  var CancelToken_1 = CancelToken;

  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind(Axios_1.prototype.request, context);
    utils.extend(instance, Axios_1.prototype, context);
    utils.extend(instance, context);
    return instance;
  }
  var axios = createInstance(defaults_1);
  axios.Axios = Axios_1;
  axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
  };
  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;
  var axios_1 = axios;
  var _default = axios;
  axios_1.default = _default;

  var axios$1 = axios_1;

  const fakeWindow = {
    btoa(a) { return a },
    atob(a) { return a },
    setInterval() { },
    open() { },
    location: {
      origin: '',
    },
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
  const fakeNavigator = {
    userAgent: null,
    userLanguage: null,
    language: null,
    platform: null,
  };
  const $window = typeof window !== 'undefined' ? window : fakeWindow;
  const $navigator = typeof navigator !== 'undefined' ? navigator : fakeNavigator;
  const $axios = axios$1;
  function setAxiosDefaultAdapter(newAdapter) {
    $axios.defaults.adapter = newAdapter;
  }
  if (typeof overrideAxiosDefaultAdapter !== 'undefined') {
    setAxiosDefaultAdapter(overrideAxiosDefaultAdapter);
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
    sdkVersion: '1.0.16',
    appVersion: '-',
    defaultConfig: {},
    tokenOverride: false,
    xhrAdapter: null,
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

  var crypt = createCommonjsModule(function (module) {
  (function() {
    var base64map
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    crypt = {
      rotl: function(n, b) {
        return (n << b) | (n >>> (32 - b));
      },
      rotr: function(n, b) {
        return (n << (32 - b)) | (n >>> b);
      },
      endian: function(n) {
        if (n.constructor == Number) {
          return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
        }
        for (var i = 0; i < n.length; i++)
          n[i] = crypt.endian(n[i]);
        return n;
      },
      randomBytes: function(n) {
        for (var bytes = []; n > 0; n--)
          bytes.push(Math.floor(Math.random() * 256));
        return bytes;
      },
      bytesToWords: function(bytes) {
        for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
          words[b >>> 5] |= bytes[i] << (24 - b % 32);
        return words;
      },
      wordsToBytes: function(words) {
        for (var bytes = [], b = 0; b < words.length * 32; b += 8)
          bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
        return bytes;
      },
      bytesToHex: function(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
          hex.push((bytes[i] >>> 4).toString(16));
          hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join('');
      },
      hexToBytes: function(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
          bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
      },
      bytesToBase64: function(bytes) {
        for (var base64 = [], i = 0; i < bytes.length; i += 3) {
          var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
          for (var j = 0; j < 4; j++)
            if (i * 8 + j * 6 <= bytes.length * 8)
              base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
            else
              base64.push('=');
        }
        return base64.join('');
      },
      base64ToBytes: function(base64) {
        base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');
        for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
            imod4 = ++i % 4) {
          if (imod4 == 0) continue;
          bytes.push(((base64map.indexOf(base64.charAt(i - 1))
              & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
              | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
        }
        return bytes;
      }
    };
    module.exports = crypt;
  })();
  });

  var charenc = {
    utf8: {
      stringToBytes: function(str) {
        return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
      },
      bytesToString: function(bytes) {
        return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
      }
    },
    bin: {
      stringToBytes: function(str) {
        for (var bytes = [], i = 0; i < str.length; i++)
          bytes.push(str.charCodeAt(i) & 0xFF);
        return bytes;
      },
      bytesToString: function(bytes) {
        for (var str = [], i = 0; i < bytes.length; i++)
          str.push(String.fromCharCode(bytes[i]));
        return str.join('');
      }
    }
  };
  var charenc_1 = charenc;

  var isBuffer_1 = function (obj) {
    return obj != null && (isBuffer$1(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
  };
  function isBuffer$1 (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer$1(obj.slice(0, 0))
  }

  var md5 = createCommonjsModule(function (module) {
  (function(){
    var crypt$1 = crypt,
        utf8 = charenc_1.utf8,
        isBuffer = isBuffer_1,
        bin = charenc_1.bin,
    md5 = function (message, options) {
      if (message.constructor == String)
        if (options && options.encoding === 'binary')
          message = bin.stringToBytes(message);
        else
          message = utf8.stringToBytes(message);
      else if (isBuffer(message))
        message = Array.prototype.slice.call(message, 0);
      else if (!Array.isArray(message) && message.constructor !== Uint8Array)
        message = message.toString();
      var m = crypt$1.bytesToWords(message),
          l = message.length * 8,
          a =  1732584193,
          b = -271733879,
          c = -1732584194,
          d =  271733878;
      for (var i = 0; i < m.length; i++) {
        m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
               ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
      }
      m[l >>> 5] |= 0x80 << (l % 32);
      m[(((l + 64) >>> 9) << 4) + 14] = l;
      var FF = md5._ff,
          GG = md5._gg,
          HH = md5._hh,
          II = md5._ii;
      for (var i = 0; i < m.length; i += 16) {
        var aa = a,
            bb = b,
            cc = c,
            dd = d;
        a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
        d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
        c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
        b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
        a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
        d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
        c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
        b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
        a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
        d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
        c = FF(c, d, a, b, m[i+10], 17, -42063);
        b = FF(b, c, d, a, m[i+11], 22, -1990404162);
        a = FF(a, b, c, d, m[i+12],  7,  1804603682);
        d = FF(d, a, b, c, m[i+13], 12, -40341101);
        c = FF(c, d, a, b, m[i+14], 17, -1502002290);
        b = FF(b, c, d, a, m[i+15], 22,  1236535329);
        a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
        d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
        c = GG(c, d, a, b, m[i+11], 14,  643717713);
        b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
        a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
        d = GG(d, a, b, c, m[i+10],  9,  38016083);
        c = GG(c, d, a, b, m[i+15], 14, -660478335);
        b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
        a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
        d = GG(d, a, b, c, m[i+14],  9, -1019803690);
        c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
        b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
        a = GG(a, b, c, d, m[i+13],  5, -1444681467);
        d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
        c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
        b = GG(b, c, d, a, m[i+12], 20, -1926607734);
        a = HH(a, b, c, d, m[i+ 5],  4, -378558);
        d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
        c = HH(c, d, a, b, m[i+11], 16,  1839030562);
        b = HH(b, c, d, a, m[i+14], 23, -35309556);
        a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
        d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
        c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
        b = HH(b, c, d, a, m[i+10], 23, -1094730640);
        a = HH(a, b, c, d, m[i+13],  4,  681279174);
        d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
        c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
        b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
        a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
        d = HH(d, a, b, c, m[i+12], 11, -421815835);
        c = HH(c, d, a, b, m[i+15], 16,  530742520);
        b = HH(b, c, d, a, m[i+ 2], 23, -995338651);
        a = II(a, b, c, d, m[i+ 0],  6, -198630844);
        d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
        c = II(c, d, a, b, m[i+14], 15, -1416354905);
        b = II(b, c, d, a, m[i+ 5], 21, -57434055);
        a = II(a, b, c, d, m[i+12],  6,  1700485571);
        d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
        c = II(c, d, a, b, m[i+10], 15, -1051523);
        b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
        a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
        d = II(d, a, b, c, m[i+15], 10, -30611744);
        c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
        b = II(b, c, d, a, m[i+13], 21,  1309151649);
        a = II(a, b, c, d, m[i+ 4],  6, -145523070);
        d = II(d, a, b, c, m[i+11], 10, -1120210379);
        c = II(c, d, a, b, m[i+ 2], 15,  718787259);
        b = II(b, c, d, a, m[i+ 9], 21, -343485551);
        a = (a + aa) >>> 0;
        b = (b + bb) >>> 0;
        c = (c + cc) >>> 0;
        d = (d + dd) >>> 0;
      }
      return crypt$1.endian([a, b, c, d]);
    };
    md5._ff  = function (a, b, c, d, x, s, t) {
      var n = a + (b & c | ~b & d) + (x >>> 0) + t;
      return ((n << s) | (n >>> (32 - s))) + b;
    };
    md5._gg  = function (a, b, c, d, x, s, t) {
      var n = a + (b & d | c & ~d) + (x >>> 0) + t;
      return ((n << s) | (n >>> (32 - s))) + b;
    };
    md5._hh  = function (a, b, c, d, x, s, t) {
      var n = a + (b ^ c ^ d) + (x >>> 0) + t;
      return ((n << s) | (n >>> (32 - s))) + b;
    };
    md5._ii  = function (a, b, c, d, x, s, t) {
      var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
      return ((n << s) | (n >>> (32 - s))) + b;
    };
    md5._blocksize = 16;
    md5._digestsize = 16;
    module.exports = function (message, options) {
      if (message === undefined || message === null)
        throw new Error('Illegal argument ' + message);
      var digestbytes = crypt$1.wordsToBytes(md5(message, options));
      return options && options.asBytes ? digestbytes :
          options && options.asString ? bin.bytesToString(digestbytes) :
          crypt$1.bytesToHex(digestbytes);
    };
  })();
  });

  class LocalStorage {
    constructor(namespace) {
      this.namespace = namespace || null;
      this.origin = $window.location && $window.location.origin ? md5($window.location.origin).substr(0, 8) : null;
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
        return [this.origin, this.namespace, key].join('.')
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
        if (this.sdk.options.debug) ;
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
        'Identification': $window.btoa(JSON.stringify(__identification)),
      });
      var endpoint = getBaseUrl(this.sdk.options) + url;
      var req_id = this.sdk.options.reqIndex ++;
      if (this.sdk.options.debug) {
        console.log('> XHR Request (' + req_id + ', ' + __token + '): ', endpoint, options);
      }
      return $axios(endpoint, options)
      .then(ret => {
        if (this.sdk.options.debug) {
          console.log('< XHR Response (' + req_id + ')', ret);
        }
        return ret.data
      })
      .catch(err => {
        if (err.message) {
          console.log('Error', err.message);
        } else {
          console.log('Error', err);
        }
        throw err
      })
    }
    __call_log(bucket, options) {
      var endpoint = getBaseBucketUrl(this.sdk.options, null, bucket).replace('/v1', '/');
      var req_id = this.sdk.options.reqIndex ++;
      if (this.sdk.options.debug) {
        console.log('> XHR Bucket Request (' + req_id + '): ', endpoint);
      }
      return $axios(endpoint, options)
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
    __sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
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
        return ret && ret.result && ret.result.objects ? ret.result.objects : []
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
    updateByFieldValue(field, value, data) {
      data = data || {};
      const options = {
        method: 'PUT',
        data,
      };
      return this.__callDatabase(options, '/' + encodeURIComponent(field) + '/' + encodeURIComponent(value)).then(ret => {
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
    async *iterator(params) {
      let response;
      let _offset = 0;
      let _limit  = 10;
      do {
        response = await this.get({ ...params, _offset, _limit });
        for (const res of response) {
          yield res;
        }
        _offset += _limit;
        await this.__sleep(1000);
      } while (response.length == _limit)
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
      if (null !== options.xhrAdapter) {
        setAxiosDefaultAdapter(options.xhrAdapter);
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
              if (this.options.debug) console.log('There is no authenticated user');
              return false
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
            if (vm.options.debug) console.log('Logging Out');
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
            vm.storageApi.setItem(options.applicationStorage, $window.btoa(JSON.stringify(value)));
          }
        },
        currentUser: {
          get() {
            return currentUser
          },
          set(value) {
            currentUser = value;
            vm.storageApi.setItem(options.userStorage, $window.btoa(JSON.stringify(value)));
          }
        },
        browserIdentification: {
          get() {
            return vm.__storageGet(vm.options.browserIdentification)
          },
          set(value) {
            value.ts = value.ts || Date.now();
            value.rnd = value.rnd || generateRandomNumber(10000, 99999);
            vm.storageApi.setItem(options.browserIdentification, $window.btoa(JSON.stringify(value)));
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
          ua: $navigator.userAgent,
          lang: $navigator.language || $navigator.userLanguage,
          plat: $navigator.platform,
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
          ua: $navigator.userAgent,
          lang: $navigator.language || $navigator.userLanguage,
          plat: $navigator.platform,
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
      return $axios(endpoint, options)
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
          _storage_data = JSON.parse($window.atob(_storage));
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
  (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
          define([], factory);
      } else if (typeof module === 'object' && module.exports) {
          module.exports = factory();
      } else {
          root.PrevioletSDK = factory();
    }
  }(typeof self !== 'undefined' ? self : this, function () {
      return PrevioletSDK;
  }));

})));
