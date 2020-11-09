/**
 * Previolet Javascript SDK v1.0.10
 * https://github.com/previolet/previolet-js-sdk
 * Released under the MIT License.
 */

function e(e,t){t=t||e.instance;var r=e.baseUrl.replace("{{instance}}",t);return r=r.replace("{{region}}",e.region)}var t={baseUrl:"https://{{instance}}.{{region}}.previolet.com/v1",region:"eu.west1",guestTokenExpiration:3600,userTokenExpiration:864e3,storageType:"localStorage",storageNamespace:"previolet-sdk",tokenName:"token",applicationStorage:"app",browserIdentification:"bid",userStorage:"user",debug:!1,reqIndex:1,sdkVersion:"1.0.10",appVersion:"-",defaultConfig:{},tokenOverride:!1,tokenFallback:!1},r=2,o=3;const n=void 0!==typeof window?window:{atob(){},open(){},location:{},localStorage:{setItem(){},getItem(){},removeItem(){}},sessionStorage:{setItem(){},getItem(){},removeItem(){}}};"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;function s(e,t,r){return e(r={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&r.path)}},r.exports),r.exports}var i=s((function(e){!function(){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r={rotl:function(e,t){return e<<t|e>>>32-t},rotr:function(e,t){return e<<32-t|e>>>t},endian:function(e){if(e.constructor==Number)return 16711935&r.rotl(e,8)|4278255360&r.rotl(e,24);for(var t=0;t<e.length;t++)e[t]=r.endian(e[t]);return e},randomBytes:function(e){for(var t=[];e>0;e--)t.push(Math.floor(256*Math.random()));return t},bytesToWords:function(e){for(var t=[],r=0,o=0;r<e.length;r++,o+=8)t[o>>>5]|=e[r]<<24-o%32;return t},wordsToBytes:function(e){for(var t=[],r=0;r<32*e.length;r+=8)t.push(e[r>>>5]>>>24-r%32&255);return t},bytesToHex:function(e){for(var t=[],r=0;r<e.length;r++)t.push((e[r]>>>4).toString(16)),t.push((15&e[r]).toString(16));return t.join("")},hexToBytes:function(e){for(var t=[],r=0;r<e.length;r+=2)t.push(parseInt(e.substr(r,2),16));return t},bytesToBase64:function(e){for(var r=[],o=0;o<e.length;o+=3)for(var n=e[o]<<16|e[o+1]<<8|e[o+2],s=0;s<4;s++)8*o+6*s<=8*e.length?r.push(t.charAt(n>>>6*(3-s)&63)):r.push("=");return r.join("")},base64ToBytes:function(e){e=e.replace(/[^A-Z0-9+\/]/gi,"");for(var r=[],o=0,n=0;o<e.length;n=++o%4)0!=n&&r.push((t.indexOf(e.charAt(o-1))&Math.pow(2,-2*n+8)-1)<<2*n|t.indexOf(e.charAt(o))>>>6-2*n);return r}};e.exports=r}()})),a={utf8:{stringToBytes:function(e){return a.bin.stringToBytes(unescape(encodeURIComponent(e)))},bytesToString:function(e){return decodeURIComponent(escape(a.bin.bytesToString(e)))}},bin:{stringToBytes:function(e){for(var t=[],r=0;r<e.length;r++)t.push(255&e.charCodeAt(r));return t},bytesToString:function(e){for(var t=[],r=0;r<e.length;r++)t.push(String.fromCharCode(e[r]));return t.join("")}}},c=a,u=function(e){return null!=e&&(l(e)||function(e){return"function"==typeof e.readFloatLE&&"function"==typeof e.slice&&l(e.slice(0,0))}(e)||!!e._isBuffer)};function l(e){return!!e.constructor&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}var d=s((function(e){!function(){var t=i,r=c.utf8,o=u,n=c.bin,s=function(e,i){e.constructor==String?e=i&&"binary"===i.encoding?n.stringToBytes(e):r.stringToBytes(e):o(e)?e=Array.prototype.slice.call(e,0):Array.isArray(e)||e.constructor===Uint8Array||(e=e.toString());for(var a=t.bytesToWords(e),c=8*e.length,u=1732584193,l=-271733879,d=-1732584194,f=271733878,h=0;h<a.length;h++)a[h]=16711935&(a[h]<<8|a[h]>>>24)|4278255360&(a[h]<<24|a[h]>>>8);a[c>>>5]|=128<<c%32,a[14+(c+64>>>9<<4)]=c;var p=s._ff,g=s._gg,m=s._hh,_=s._ii;for(h=0;h<a.length;h+=16){var k=u,b=l,v=d,y=f;u=p(u,l,d,f,a[h+0],7,-680876936),f=p(f,u,l,d,a[h+1],12,-389564586),d=p(d,f,u,l,a[h+2],17,606105819),l=p(l,d,f,u,a[h+3],22,-1044525330),u=p(u,l,d,f,a[h+4],7,-176418897),f=p(f,u,l,d,a[h+5],12,1200080426),d=p(d,f,u,l,a[h+6],17,-1473231341),l=p(l,d,f,u,a[h+7],22,-45705983),u=p(u,l,d,f,a[h+8],7,1770035416),f=p(f,u,l,d,a[h+9],12,-1958414417),d=p(d,f,u,l,a[h+10],17,-42063),l=p(l,d,f,u,a[h+11],22,-1990404162),u=p(u,l,d,f,a[h+12],7,1804603682),f=p(f,u,l,d,a[h+13],12,-40341101),d=p(d,f,u,l,a[h+14],17,-1502002290),u=g(u,l=p(l,d,f,u,a[h+15],22,1236535329),d,f,a[h+1],5,-165796510),f=g(f,u,l,d,a[h+6],9,-1069501632),d=g(d,f,u,l,a[h+11],14,643717713),l=g(l,d,f,u,a[h+0],20,-373897302),u=g(u,l,d,f,a[h+5],5,-701558691),f=g(f,u,l,d,a[h+10],9,38016083),d=g(d,f,u,l,a[h+15],14,-660478335),l=g(l,d,f,u,a[h+4],20,-405537848),u=g(u,l,d,f,a[h+9],5,568446438),f=g(f,u,l,d,a[h+14],9,-1019803690),d=g(d,f,u,l,a[h+3],14,-187363961),l=g(l,d,f,u,a[h+8],20,1163531501),u=g(u,l,d,f,a[h+13],5,-1444681467),f=g(f,u,l,d,a[h+2],9,-51403784),d=g(d,f,u,l,a[h+7],14,1735328473),u=m(u,l=g(l,d,f,u,a[h+12],20,-1926607734),d,f,a[h+5],4,-378558),f=m(f,u,l,d,a[h+8],11,-2022574463),d=m(d,f,u,l,a[h+11],16,1839030562),l=m(l,d,f,u,a[h+14],23,-35309556),u=m(u,l,d,f,a[h+1],4,-1530992060),f=m(f,u,l,d,a[h+4],11,1272893353),d=m(d,f,u,l,a[h+7],16,-155497632),l=m(l,d,f,u,a[h+10],23,-1094730640),u=m(u,l,d,f,a[h+13],4,681279174),f=m(f,u,l,d,a[h+0],11,-358537222),d=m(d,f,u,l,a[h+3],16,-722521979),l=m(l,d,f,u,a[h+6],23,76029189),u=m(u,l,d,f,a[h+9],4,-640364487),f=m(f,u,l,d,a[h+12],11,-421815835),d=m(d,f,u,l,a[h+15],16,530742520),u=_(u,l=m(l,d,f,u,a[h+2],23,-995338651),d,f,a[h+0],6,-198630844),f=_(f,u,l,d,a[h+7],10,1126891415),d=_(d,f,u,l,a[h+14],15,-1416354905),l=_(l,d,f,u,a[h+5],21,-57434055),u=_(u,l,d,f,a[h+12],6,1700485571),f=_(f,u,l,d,a[h+3],10,-1894986606),d=_(d,f,u,l,a[h+10],15,-1051523),l=_(l,d,f,u,a[h+1],21,-2054922799),u=_(u,l,d,f,a[h+8],6,1873313359),f=_(f,u,l,d,a[h+15],10,-30611744),d=_(d,f,u,l,a[h+6],15,-1560198380),l=_(l,d,f,u,a[h+13],21,1309151649),u=_(u,l,d,f,a[h+4],6,-145523070),f=_(f,u,l,d,a[h+11],10,-1120210379),d=_(d,f,u,l,a[h+2],15,718787259),l=_(l,d,f,u,a[h+9],21,-343485551),u=u+k>>>0,l=l+b>>>0,d=d+v>>>0,f=f+y>>>0}return t.endian([u,l,d,f])};s._ff=function(e,t,r,o,n,s,i){var a=e+(t&r|~t&o)+(n>>>0)+i;return(a<<s|a>>>32-s)+t},s._gg=function(e,t,r,o,n,s,i){var a=e+(t&o|r&~o)+(n>>>0)+i;return(a<<s|a>>>32-s)+t},s._hh=function(e,t,r,o,n,s,i){var a=e+(t^r^o)+(n>>>0)+i;return(a<<s|a>>>32-s)+t},s._ii=function(e,t,r,o,n,s,i){var a=e+(r^(t|~o))+(n>>>0)+i;return(a<<s|a>>>32-s)+t},s._blocksize=16,s._digestsize=16,e.exports=function(e,r){if(null==e)throw new Error("Illegal argument "+e);var o=t.wordsToBytes(s(e,r));return r&&r.asBytes?o:r&&r.asString?n.bytesToString(o):t.bytesToHex(o)}}()}));class f{constructor(e){this.namespace=e||null,this.origin=window&&window.location&&window.location.origin?d(window.location.origin).substr(0,8):null}setItem(e,t){n.localStorage.setItem(this._getStorageKey(e),t)}getItem(e){return n.localStorage.getItem(this._getStorageKey(e))}removeItem(e){n.localStorage.removeItem(this._getStorageKey(e))}_getStorageKey(e){return this.namespace?[this.origin,this.namespace,e].join("."):e}}class h{constructor(e){this.sdk=e,this.errorChain=[]}addToErrorChain(e,t){return"function"==typeof t?(this.errorChain.push({context:e,func:t}),this.sdk.options.debug&&console.log("Added function to error chain",e,t)):this.sdk.options.debug&&console.log("Cannot add function to error chain, not a function",e,t),this}__getTokenToUse(){var e=null;return this.sdk.token&&(this.sdk.options.debug&&console.log("Using stored token",this.sdk.token),e=this.sdk.token),!e&&this.sdk.options.tokenFallback&&(this.sdk.options.debug&&console.log("Token is now the fallback option",this.sdk.options.tokenFallback),e=this.sdk.options.tokenFallback),this.sdk.options.tokenOverride&&(this.sdk.options.debug&&console.log("Token is now the override option",this.sdk.options.tokenOverride),e=this.sdk.options.tokenOverride),e}__call(t,r){var o=this.__getTokenToUse(),n=this.sdk.browserIdentification;this.sdk.options.debug&&console.log("Using Identification",n),r.headers=Object.assign({},{Authorization:o,Identification:btoa(JSON.stringify(n))});var s=e(this.sdk.options)+t,i=this.sdk.options.reqIndex++;return this.sdk.options.debug&&console.log("> XHR Request ("+i+", "+o+"): ",s,r),axios(s,r).then(e=>(this.sdk.options.debug&&console.log("< XHR Response ("+i+")",e),e.data)).catch(e=>{throw e})}__call_log(e,t){var r=function(e,t,r){t=t||e.instance;var o=e.baseUrl.replace("{{instance}}","log-"+t+"-"+r);return o=o.replace("{{region}}",e.region)}(this.sdk.options,null,e).replace("/v1","/"),o=this.sdk.options.reqIndex++;return this.sdk.options.debug&&console.log("> XHR Bucket Request ("+o+"): ",r),axios(r,t).catch(e=>{throw e})}__checkError(e,t){if(t.error){if(!this.errorChain.length)throw this.sdk.options.debug&&console.log("%cBackend error details","color: #FF3333",t),t;this.errorChain.forEach(e=>{e.func&&"function"==typeof e.func&&(this.sdk.options.debug&&console.log("Propagating error",t),e.func(e.context,t))})}}}class p extends h{constructor(e){super(e),this.currentDatabase=null}getAll(){return this.__call("/__/index",{method:"GET"}).then(e=>(this.__checkError(this,e),e.result.objects))}select(e){return this.currentDatabase=e,this}add(e){const t={method:"POST",data:e=e||{}};return this.__callDatabase(t).then(e=>(this.__checkError(this,e),e.result?e.result:e))}get(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t).then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getOne(e){(e=e||{})._limit=1;const t={method:"GET",params:e};return this.__callDatabase(t).then(e=>(this.__checkError(this,e),!(!e.result||!e.result[0])&&e.result[0]))}getCount(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/count").then(e=>(this.__checkError(this,e),e.result?parseInt(e.result):0))}update(e,t){const r={method:"PUT",data:t=t||{}};return this.__callDatabase(r,"/"+e).then(e=>(this.__checkError(this,e),e.result?e.result:e))}delete(e){return this.__callDatabase({method:"DELETE"},"/"+e).then(e=>(this.__checkError(this,e),e.result?e.result:e))}fieldExists(e){}addField(e){}getFields(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/structure/fields").then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getFilters(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/structure/filters").then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getViews(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/structure/views").then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getDistinct(e,t){}getDistinctCount(e,t){}__callDatabase(e,t){return t=t||"",null===this.currentDatabase?Promise.reject(new Error("Please select a database")):this.__call("/"+this.currentDatabase+t,e)}}class g extends h{constructor(e){super(e)}getAll(){return this.__call("/__/function",{method:"GET"}).then(e=>e.result)}run(e,t){const r={method:"POST",data:t=t||!1};return this.__call("/__/function/"+e,r).then(e=>e.result?e.result:e)}getFunctionIdUrl(t){return e(this.sdk.options)+"/__/function/"+t+"?token="+this.__getTokenToUse()}}class m extends h{constructor(e){super(e)}getAll(){return this.__call("/__/storage",{method:"GET"}).then(e=>e.result)}getUploadUrl(){return e(this.sdk.options)+"/__/storage?token="+this.__getTokenToUse()}}class _ extends h{constructor(e){super(e)}get(){const e=this;return this.__call("/__/remote-config",{method:"GET"}).then(t=>{if("object"==typeof t){var r=e.sdk.options.defaultConfig;return Object.keys(t).forEach(e=>{r[e]=t[e]}),r}return e.sdk.options.defaultConfig})}defaultConfig(e){this.sdk.options.defaultConfig=e}}class k extends h{constructor(e){super(e)}log(e,t){if(!Number.isInteger(e))return void(this.sdk.options.debug&&console.log("Bucket name should be an integer and not",e));if("object"!=typeof t)return void(this.sdk.options.debug&&console.log("Bucket params should be send as object and not "+typeof t,t));const r={method:"GET",params:t};return this.__call_log(e,r)}}class b extends h{constructor(e){super(e)}add(e){let t={p:e,__token:this.__getTokenToUse(),__identification:this.sdk.browserIdentification};window.location&&window.location.href&&(t.u=window.location.href);const r={method:"GET",params:t};return this.__call_log(0,r)}}var v=s((function(e,t){e.exports=function(e){function t(o){if(r[o])return r[o].exports;var n=r[o]={exports:{},id:o,loaded:!1};return e[o].call(n.exports,n,n.exports,t),n.loaded=!0,n.exports}var r={};return t.m=e,t.c=r,t.p="",t(0)}([function(e,t,r){e.exports=r(1)},function(e,t,r){function o(e){var t=new i(e),r=s(i.prototype.request,t);return n.extend(r,i.prototype,t),n.extend(r,t),r}var n=r(2),s=r(3),i=r(4),a=r(22),c=o(r(10));c.Axios=i,c.create=function(e){return o(a(c.defaults,e))},c.Cancel=r(23),c.CancelToken=r(24),c.isCancel=r(9),c.all=function(e){return Promise.all(e)},c.spread=r(25),e.exports=c,e.exports.default=c},function(e,t,r){function o(e){return"[object Array]"===u.call(e)}function n(e){return void 0===e}function s(e){return null!==e&&"object"==typeof e}function i(e){return"[object Function]"===u.call(e)}function a(e,t){if(null!=e)if("object"!=typeof e&&(e=[e]),o(e))for(var r=0,n=e.length;r<n;r++)t.call(null,e[r],r,e);else for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.call(null,e[s],s,e)}var c=r(3),u=Object.prototype.toString;e.exports={isArray:o,isArrayBuffer:function(e){return"[object ArrayBuffer]"===u.call(e)},isBuffer:function(e){return null!==e&&!n(e)&&null!==e.constructor&&!n(e.constructor)&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)},isFormData:function(e){return"undefined"!=typeof FormData&&e instanceof FormData},isArrayBufferView:function(e){return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer},isString:function(e){return"string"==typeof e},isNumber:function(e){return"number"==typeof e},isObject:s,isUndefined:n,isDate:function(e){return"[object Date]"===u.call(e)},isFile:function(e){return"[object File]"===u.call(e)},isBlob:function(e){return"[object Blob]"===u.call(e)},isFunction:i,isStream:function(e){return s(e)&&i(e.pipe)},isURLSearchParams:function(e){return"undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams},isStandardBrowserEnv:function(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product&&"NativeScript"!==navigator.product&&"NS"!==navigator.product)&&"undefined"!=typeof window&&"undefined"!=typeof document},forEach:a,merge:function e(){function t(t,o){"object"==typeof r[o]&&"object"==typeof t?r[o]=e(r[o],t):r[o]=t}for(var r={},o=0,n=arguments.length;o<n;o++)a(arguments[o],t);return r},deepMerge:function e(){function t(t,o){"object"==typeof r[o]&&"object"==typeof t?r[o]=e(r[o],t):r[o]="object"==typeof t?e({},t):t}for(var r={},o=0,n=arguments.length;o<n;o++)a(arguments[o],t);return r},extend:function(e,t,r){return a(t,(function(t,o){e[o]=r&&"function"==typeof t?c(t,r):t})),e},trim:function(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}}},function(e,t){e.exports=function(e,t){return function(){for(var r=new Array(arguments.length),o=0;o<r.length;o++)r[o]=arguments[o];return e.apply(t,r)}}},function(e,t,r){function o(e){this.defaults=e,this.interceptors={request:new i,response:new i}}var n=r(2),s=r(5),i=r(6),a=r(7),c=r(22);o.prototype.request=function(e){"string"==typeof e?(e=arguments[1]||{}).url=arguments[0]:e=e||{},(e=c(this.defaults,e)).method?e.method=e.method.toLowerCase():this.defaults.method?e.method=this.defaults.method.toLowerCase():e.method="get";var t=[a,void 0],r=Promise.resolve(e);for(this.interceptors.request.forEach((function(e){t.unshift(e.fulfilled,e.rejected)})),this.interceptors.response.forEach((function(e){t.push(e.fulfilled,e.rejected)}));t.length;)r=r.then(t.shift(),t.shift());return r},o.prototype.getUri=function(e){return e=c(this.defaults,e),s(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")},n.forEach(["delete","get","head","options"],(function(e){o.prototype[e]=function(t,r){return this.request(n.merge(r||{},{method:e,url:t}))}})),n.forEach(["post","put","patch"],(function(e){o.prototype[e]=function(t,r,o){return this.request(n.merge(o||{},{method:e,url:t,data:r}))}})),e.exports=o},function(e,t,r){function o(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var n=r(2);e.exports=function(e,t,r){if(!t)return e;var s;if(r)s=r(t);else if(n.isURLSearchParams(t))s=t.toString();else{var i=[];n.forEach(t,(function(e,t){null!=e&&(n.isArray(e)?t+="[]":e=[e],n.forEach(e,(function(e){n.isDate(e)?e=e.toISOString():n.isObject(e)&&(e=JSON.stringify(e)),i.push(o(t)+"="+o(e))})))})),s=i.join("&")}if(s){var a=e.indexOf("#");-1!==a&&(e=e.slice(0,a)),e+=(-1===e.indexOf("?")?"?":"&")+s}return e}},function(e,t,r){function o(){this.handlers=[]}var n=r(2);o.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},o.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)},o.prototype.forEach=function(e){n.forEach(this.handlers,(function(t){null!==t&&e(t)}))},e.exports=o},function(e,t,r){function o(e){e.cancelToken&&e.cancelToken.throwIfRequested()}var n=r(2),s=r(8),i=r(9),a=r(10);e.exports=function(e){return o(e),e.headers=e.headers||{},e.data=s(e.data,e.headers,e.transformRequest),e.headers=n.merge(e.headers.common||{},e.headers[e.method]||{},e.headers),n.forEach(["delete","get","head","post","put","patch","common"],(function(t){delete e.headers[t]})),(e.adapter||a.adapter)(e).then((function(t){return o(e),t.data=s(t.data,t.headers,e.transformResponse),t}),(function(t){return i(t)||(o(e),t&&t.response&&(t.response.data=s(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)}))}},function(e,t,r){var o=r(2);e.exports=function(e,t,r){return o.forEach(r,(function(r){e=r(e,t)})),e}},function(e,t){e.exports=function(e){return!(!e||!e.__CANCEL__)}},function(e,t,r){function o(e,t){!n.isUndefined(e)&&n.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t)}var n=r(2),s=r(11),i={"Content-Type":"application/x-www-form-urlencoded"},a={adapter:function(){var e;return("undefined"!=typeof XMLHttpRequest||"undefined"!=typeof process&&"[object process]"===Object.prototype.toString.call(process))&&(e=r(12)),e}(),transformRequest:[function(e,t){return s(t,"Accept"),s(t,"Content-Type"),n.isFormData(e)||n.isArrayBuffer(e)||n.isBuffer(e)||n.isStream(e)||n.isFile(e)||n.isBlob(e)?e:n.isArrayBufferView(e)?e.buffer:n.isURLSearchParams(e)?(o(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):n.isObject(e)?(o(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(e){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:"application/json, text/plain, */*"}}};n.forEach(["delete","get","head"],(function(e){a.headers[e]={}})),n.forEach(["post","put","patch"],(function(e){a.headers[e]=n.merge(i)})),e.exports=a},function(e,t,r){var o=r(2);e.exports=function(e,t){o.forEach(e,(function(r,o){o!==t&&o.toUpperCase()===t.toUpperCase()&&(e[t]=r,delete e[o])}))}},function(e,t,r){var o=r(2),n=r(13),s=r(5),i=r(16),a=r(19),c=r(20),u=r(14);e.exports=function(e){return new Promise((function(t,l){var d=e.data,f=e.headers;o.isFormData(d)&&delete f["Content-Type"];var h=new XMLHttpRequest;if(e.auth){var p=e.auth.username||"",g=e.auth.password||"";f.Authorization="Basic "+btoa(p+":"+g)}var m=i(e.baseURL,e.url);if(h.open(e.method.toUpperCase(),s(m,e.params,e.paramsSerializer),!0),h.timeout=e.timeout,h.onreadystatechange=function(){if(h&&4===h.readyState&&(0!==h.status||h.responseURL&&0===h.responseURL.indexOf("file:"))){var r="getAllResponseHeaders"in h?a(h.getAllResponseHeaders()):null,o={data:e.responseType&&"text"!==e.responseType?h.response:h.responseText,status:h.status,statusText:h.statusText,headers:r,config:e,request:h};n(t,l,o),h=null}},h.onabort=function(){h&&(l(u("Request aborted",e,"ECONNABORTED",h)),h=null)},h.onerror=function(){l(u("Network Error",e,null,h)),h=null},h.ontimeout=function(){var t="timeout of "+e.timeout+"ms exceeded";e.timeoutErrorMessage&&(t=e.timeoutErrorMessage),l(u(t,e,"ECONNABORTED",h)),h=null},o.isStandardBrowserEnv()){var _=r(21),k=(e.withCredentials||c(m))&&e.xsrfCookieName?_.read(e.xsrfCookieName):void 0;k&&(f[e.xsrfHeaderName]=k)}if("setRequestHeader"in h&&o.forEach(f,(function(e,t){void 0===d&&"content-type"===t.toLowerCase()?delete f[t]:h.setRequestHeader(t,e)})),o.isUndefined(e.withCredentials)||(h.withCredentials=!!e.withCredentials),e.responseType)try{h.responseType=e.responseType}catch(t){if("json"!==e.responseType)throw t}"function"==typeof e.onDownloadProgress&&h.addEventListener("progress",e.onDownloadProgress),"function"==typeof e.onUploadProgress&&h.upload&&h.upload.addEventListener("progress",e.onUploadProgress),e.cancelToken&&e.cancelToken.promise.then((function(e){h&&(h.abort(),l(e),h=null)})),void 0===d&&(d=null),h.send(d)}))}},function(e,t,r){var o=r(14);e.exports=function(e,t,r){var n=r.config.validateStatus;!n||n(r.status)?e(r):t(o("Request failed with status code "+r.status,r.config,null,r.request,r))}},function(e,t,r){var o=r(15);e.exports=function(e,t,r,n,s){var i=new Error(e);return o(i,t,r,n,s)}},function(e,t){e.exports=function(e,t,r,o,n){return e.config=t,r&&(e.code=r),e.request=o,e.response=n,e.isAxiosError=!0,e.toJSON=function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code}},e}},function(e,t,r){var o=r(17),n=r(18);e.exports=function(e,t){return e&&!o(t)?n(e,t):t}},function(e,t){e.exports=function(e){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)}},function(e,t){e.exports=function(e,t){return t?e.replace(/\/+$/,"")+"/"+t.replace(/^\/+/,""):e}},function(e,t,r){var o=r(2),n=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];e.exports=function(e){var t,r,s,i={};return e?(o.forEach(e.split("\n"),(function(e){if(s=e.indexOf(":"),t=o.trim(e.substr(0,s)).toLowerCase(),r=o.trim(e.substr(s+1)),t){if(i[t]&&n.indexOf(t)>=0)return;i[t]="set-cookie"===t?(i[t]?i[t]:[]).concat([r]):i[t]?i[t]+", "+r:r}})),i):i}},function(e,t,r){var o=r(2);e.exports=o.isStandardBrowserEnv()?function(){function e(e){var t=e;return r&&(n.setAttribute("href",t),t=n.href),n.setAttribute("href",t),{href:n.href,protocol:n.protocol?n.protocol.replace(/:$/,""):"",host:n.host,search:n.search?n.search.replace(/^\?/,""):"",hash:n.hash?n.hash.replace(/^#/,""):"",hostname:n.hostname,port:n.port,pathname:"/"===n.pathname.charAt(0)?n.pathname:"/"+n.pathname}}var t,r=/(msie|trident)/i.test(navigator.userAgent),n=document.createElement("a");return t=e(window.location.href),function(r){var n=o.isString(r)?e(r):r;return n.protocol===t.protocol&&n.host===t.host}}():function(){return!0}},function(e,t,r){var o=r(2);e.exports=o.isStandardBrowserEnv()?{write:function(e,t,r,n,s,i){var a=[];a.push(e+"="+encodeURIComponent(t)),o.isNumber(r)&&a.push("expires="+new Date(r).toGMTString()),o.isString(n)&&a.push("path="+n),o.isString(s)&&a.push("domain="+s),!0===i&&a.push("secure"),document.cookie=a.join("; ")},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}:{write:function(){},read:function(){return null},remove:function(){}}},function(e,t,r){var o=r(2);e.exports=function(e,t){t=t||{};var r={},n=["url","method","params","data"],s=["headers","auth","proxy"],i=["baseURL","url","transformRequest","transformResponse","paramsSerializer","timeout","withCredentials","adapter","responseType","xsrfCookieName","xsrfHeaderName","onUploadProgress","onDownloadProgress","maxContentLength","validateStatus","maxRedirects","httpAgent","httpsAgent","cancelToken","socketPath"];o.forEach(n,(function(e){void 0!==t[e]&&(r[e]=t[e])})),o.forEach(s,(function(n){o.isObject(t[n])?r[n]=o.deepMerge(e[n],t[n]):void 0!==t[n]?r[n]=t[n]:o.isObject(e[n])?r[n]=o.deepMerge(e[n]):void 0!==e[n]&&(r[n]=e[n])})),o.forEach(i,(function(o){void 0!==t[o]?r[o]=t[o]:void 0!==e[o]&&(r[o]=e[o])}));var a=n.concat(s).concat(i),c=Object.keys(t).filter((function(e){return-1===a.indexOf(e)}));return o.forEach(c,(function(o){void 0!==t[o]?r[o]=t[o]:void 0!==e[o]&&(r[o]=e[o])})),r}},function(e,t){function r(e){this.message=e}r.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},r.prototype.__CANCEL__=!0,e.exports=r},function(e,t,r){function o(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise((function(e){t=e}));var r=this;e((function(e){r.reason||(r.reason=new n(e),t(r.reason))}))}var n=r(23);o.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},o.source=function(){var e;return{token:new o((function(t){e=t})),cancel:e}},e.exports=o},function(e,t){e.exports=function(e){return function(t){return e.apply(null,t)}}}])}));void 0===window.axios&&(window.axios=v);class y{constructor(e){const r=this;let o=Object.assign({},t,e);if(o.debug&&console.log("%cPreviolet Javascript SDK instantiated in debug mode","color: #CC00FF"),o.instance&&"<%= previolet.options.instance %>"==o.instance&&o.fallback&&o.fallback.instance&&(o.debug&&console.log("Using fallback instance",o.fallback.instance),o.instance=o.fallback.instance),o.tokenFallback&&o.tokenOverride)throw"Cannot define both tokenFallback and tokenOverride";o.tokenFallback&&"<%= previolet.token.guest %>"==o.tokenFallback&&(o.fallback&&o.fallback.tokenFallback?(o.debug&&console.log("Using fallback tokenFallback",o.fallback.tokenFallback),o.tokenFallback=o.fallback.tokenFallback):(o.debug&&console.log("No fallback tokenFallback provided, defaulting to false"),o.tokenFallback=!1)),o.tokenOverride&&"<%= previolet.token.guest %>"==o.tokenOverride&&(o.fallback&&o.fallback.tokenOverride?(o.debug&&console.log("Using fallback tokenOverride",o.fallback.tokenOverride),o.tokenOverride=o.fallback.tokenOverride):(o.debug&&console.log("No fallback tokenOverride provided, defaulting to false"),o.tokenOverride=!1));let s=!1,i=null,a=null,c={};this.changeHooks=[],this.storageApi=function(e){switch(e.storageType){case"localStorage":try{return n.localStorage.setItem("testKey","test"),n.localStorage.removeItem("testKey"),new f(e.storageNamespace)}catch(e){}default:return new f(e.storageNamespace)}}(o),this.auth=()=>({GithubAuthProvider:{id:"github"},GoogleAuthProvider:{id:"google"},FacebookAuthProvider:{id:"facebook"},logout:e=>{if(!r.auth().isAuthenticated())return Promise.reject(new Error("There is no authenticated user"));(e=e||{}).preventUserStatePropagation=e.preventUserStatePropagation||!1;const t={method:"DELETE",data:JSON.stringify({token:r.token})};return r.options.debug&&console.log("Logging Out"),r.token=!1,r.storageApi.removeItem(r.options.tokenName),r.storageApi.removeItem(r.options.applicationStorage),r.storageApi.removeItem(r.options.userStorage),e.preventUserStatePropagation||r.__propagateUserState(!1),r.__call("/__/token",t,"token").then(e=>e)},loginWithUsernameAndPassword:(e,t)=>{if(!e)return Promise.reject(new Error("username required"));if(!t)return Promise.reject(new Error("password required"));r.options.debug&&console.log("Logging In with username and password",e,t);const o={method:"POST",data:JSON.stringify({name:e,challenge:t,expire:r.options.userTokenExpiration})};return r.__call("/__/auth",o).then(e=>(r.__checkError(r,e),r.__loadAuthenticationDataFromResponse(e),null!==r.currentUser&&r.__propagateUserState(r.currentUser),e.result.data))},loginWithIdentityProvider:(e,t)=>{t=t||this.last_access_token,this.last_access_token=t,this.options.debug&&console.log("Logging In with identity provider:",e,t);const o={method:"POST",params:{access_token:t}};return this.__call("/__/auth/identity/"+e,o).then(e=>(this.__checkError(r,e),e.result?e.result&&(e.result.token&&e.result.auth?(r.__loadAuthenticationDataFromResponse(e),r.__propagateUserState(e.result.auth)):r.__propagateUserState(!1)):r.__propagateUserState(!1),e.result))},forgotPassword:(e,t)=>{if(!e)return Promise.reject(new Error("username required"));var o=t&&t.origin?t.origin:window.location.origin,n=!(!t||!t.skip_email)&&t.skip_email;const s={method:"POST",data:JSON.stringify({name:e,origin:o,skip_email:n})};return r.__call("/__/auth/reset",s).then(e=>(r.__checkError(r,e),e.result))},forgotPasswordConfirmation:(e,t,o)=>{if(!e)return Promise.reject(new Error("challenge required"));if(!t)return Promise.reject(new Error("confirm_challenge required"));if(!o)return Promise.reject(new Error("hash required"));const n={method:"POST",data:JSON.stringify({challenge:e,confirm_challenge:t,hash:o})};return r.__call("/__/auth/reset/confirm",n).then(e=>(r.__checkError(r,e),e.result))},registerWithIdentityProvider:(e,t,o,n)=>{o=o||this.last_access_token,n=n||!0,this.last_access_token=o;const s={method:"POST",data:{access_token:o,email:t,role:"admin"}};return this.__call("/__/auth/identity/"+e+"/register",s).then(t=>(this.__checkError(r,t),n?this.loginWithIdentityProvider(e,o):t))},isAuthenticated:()=>!!r.token,loginAsGuest:()=>{const e={method:"POST",data:JSON.stringify({expire:r.options.guestTokenExpiration})};return r.__call("/__/auth/guest",e).then(e=>{if(!e.error_code)return r.__loadAuthenticationDataFromResponse(e),null!==r.currentUser&&r.__propagateUserState(r.currentUser),e.result.data;r.auth().logout()})},onAuthStateChanged:e=>{if("function"==typeof e){-1==r.changeHooks.indexOf(e)?(r.options.debug&&console.log("Registered callback function: onAuthStateChanged",e),r.changeHooks.push(e)):r.options.debug&&console.log("Callback function onAuthStateChanged is already registered",e);var t=r.currentUser,o=r.token;return r.options.debug&&(t&&o?console.log("User is logged in",t):console.log("User is not logged in")),e(!(!o||!t)&&t)}return r.options.debug&&console.log("User is not logged in"),!1}}),Object.defineProperties(this,{options:{get:()=>o},token:{get:()=>s,set(e){e!=s&&(s=e,r.storageApi.setItem(o.tokenName,s))}},headers:{get:()=>c},currentApp:{get:()=>i,set(e){i=e,r.storageApi.setItem(o.applicationStorage,btoa(JSON.stringify(e)))}},currentUser:{get:()=>a,set(e){a=e,r.storageApi.setItem(o.userStorage,btoa(JSON.stringify(e)))}},browserIdentification:{get:()=>r.__storageGet(r.options.browserIdentification),set(e){var t,n;e.ts=e.ts||Date.now(),e.rnd=e.rnd||(t=(t=1e4)||100,n=(n=99999)||999,Math.floor(Math.random()*n+t)),r.storageApi.setItem(o.browserIdentification,btoa(JSON.stringify(e)))}}}),r.app=()=>({region:r.options.region,token:r.storageApi.getItem(r.options.tokenName)||!1,data:r.__storageGet(r.options.applicationStorage)});var u=r.app().token;if(r.token=u,r.browserIdentification){r.options.debug&&console.log("Browser identification exists",r.browserIdentification);var l={ua:navigator.userAgent,lang:navigator.language||navigator.userLanguage,plat:navigator.platform,vsdk:r.options.sdkVersion,vapp:r.options.appVersion,ts:r.browserIdentification.ts,rnd:r.browserIdentification.rnd};JSON.stringify(l)!=JSON.stringify(r.browserIdentification)&&(r.options.debug&&console.log("Browser identification changed, renewing",l),r.browserIdentification=l)}else r.browserIdentification={ua:navigator.userAgent,lang:navigator.language||navigator.userLanguage,plat:navigator.platform,vsdk:r.options.sdkVersion,vapp:r.options.appVersion},r.options.debug&&console.log("Generating browser identification",r.browserIdentification);var d=new p(r).addToErrorChain(r,r.__checkError);r.db=()=>d;var h=new g(r).addToErrorChain(r,r.__checkError);r.functions=()=>h;var v=new m(r).addToErrorChain(r,r.__checkError);r.storage=()=>v;var y=new _(r).addToErrorChain(r,r.__checkError);r.remoteConfig=()=>y;var w=new k(r).addToErrorChain(r,r.__checkError);r.bucket=()=>w;var E=new b(r).addToErrorChain(r,r.__checkError);r.trace=()=>E,r.user=()=>({data:r.__storageGet(r.options.userStorage)}),r.currentUser=r.user().data}getDefaultHeaders(){return Object.assign({},this.headers,{})}getRemoteConfig(){const e=this;return this.functions().getRemoteConfig().then(t=>{if("object"==typeof t){var r=e.options.defaultConfig;return Object.keys(t).forEach(e=>{r[e]=t[e]}),r}return e.options.defaultConfig})}__propagateUserState(e){const t=this;t.changeHooks.forEach(r=>{t.options.debug&&console.log("Triggering onAuthStateChanged callback",e),r(e)})}__loadAuthenticationDataFromResponse(e){e.result.token&&(this.options.debug&&console.log("Saving token",e.result.token),this.token=e.result.token),e.result.auth?(this.options.debug&&console.log("Saving user details",e.result.auth),this.currentUser=e.result.auth):(this.options.debug&&console.log("Saving default guest details"),this.currentUser={name:"Guest",username:"guest",guest:!0}),e.result.data&&(e.result.data[this.options.instance]&&e.result.data[this.options.instance].instance_data?(this.currentApp=e.result.data[this.options.instance].instance_data,this.options.debug&&console.log("Saving application details",this.currentApp)):this.options.debug&&console.log("Application details not available"))}__call(t,r,o){o=o||this.options.instance,r.headers=this.getDefaultHeaders();var n=this.options.reqIndex++,s=e(this.options,o)+t;return this.options.debug&&console.log("> XHR Request ("+n+")",s,r),v(s,r).then(e=>(this.options.debug&&console.log("< XHR Response ("+n+")",e),e.data)).catch(e=>{throw e})}__storageGet(e){var t=this.storageApi.getItem(e),r=!1;if(t)try{r=JSON.parse(atob(t))}catch(e){}return r}__checkError(e,t){if(t.error)throw e.options.debug&&console.log("%cBackend error details","color: #FF3333",t),!t.error_code||t.error_code!=r&&t.error_code!=o||(e.user().data.guest?e.auth().loginAsGuest():e.auth().logout()),t}}export default y;export{y as PrevioletSDK};
