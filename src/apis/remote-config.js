import Base from './base'

export default class RemoteConfig extends Base {
  constructor(sdk) {
    super(sdk)
  }

  get() {
    const vm = this
    const options = {
      method: 'GET',
    }

    return this.__call('/__/remote-config', options).then(config => {
      if (typeof config == 'object') {
        var merge_config = vm.options.defaultConfig

        Object.keys(config).forEach(key => {
          merge_config[key] = config[key]
        })

        return merge_config
      } else {
        return vm.options.defaultConfig
      }
    })
  }

  defaultConfig(config) {
    this.options.defaultConfig = config
  }
}
