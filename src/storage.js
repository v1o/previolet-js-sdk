import { $window } from './globals'
import LocalStorage from './storage/local-storage'

export default function StorageFactory(options) {
  switch (options.storageType) {
    case 'localStorage':
      try {
        $window.localStorage.setItem('testKey', 'test')
        $window.localStorage.removeItem('testKey')
        return new LocalStorage(options.storageNamespace)
      } catch(e) {}

    default:
      return new LocalStorage(options.storageNamespace)
      break;
  }
}
