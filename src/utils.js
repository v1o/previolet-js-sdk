export function camelCase(name) {
  return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  })
}

export function getBaseUrl(options, instance) {
  instance = instance || options.instance
  var base_url = options.baseUrl.replace('{{instance}}', instance)
  base_url = base_url.replace('{{region}}', options.region)

  return base_url
}
