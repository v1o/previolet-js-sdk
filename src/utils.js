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

export function getBaseBucketUrl(options, instance, bucket) {
  instance = instance || options.instance
  var base_url = options.baseUrl.replace('{{instance}}', 'log-' + instance + '-' + bucket)
  base_url = base_url.replace('{{region}}', options.region)

  return base_url
}

export function generateRandomNumber(from, to) {
  from = from || 100
  to = to || 999
  return Math.floor((Math.random() * to) + from)
}
