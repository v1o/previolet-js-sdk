var path = require('path')

module.exports = {
  entry: "./demo",
  devServer: {
    contentBase: path.join(__dirname, 'demo'),
    compress: true,
    port: 9090
  }
}
