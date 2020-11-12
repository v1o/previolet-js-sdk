import axios from 'axios'

const fakeDocument = {
  createElement() { },
}

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
}

const fakeNavigator = {
  userAgent: null,
  userLanguage: null,
  language: null,
  platform: null,
}

export const $document = typeof document !== 'undefined' ? document : fakeDocument
export const $window = typeof window !== 'undefined' ? window : fakeWindow
export const $navigator = typeof navigator !== 'undefined' ? navigator : fakeNavigator

const $axios = axios

function setAxiosDefaultAdapter(newAdapter) {
  // https://github.com/axios/axios/issues/456
  $axios.defaults.adapter = newAdapter
}

if (typeof overrideAxiosDefaultAdapter !== 'undefined') {
  setAxiosDefaultAdapter(overrideAxiosDefaultAdapter)
}

export { $axios, setAxiosDefaultAdapter }
