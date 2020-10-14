import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import cleanup from 'rollup-plugin-cleanup'
import banner from 'rollup-plugin-banner'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
var pkg = require('./package.json')

const config = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/previolet-sdk.js',
      format: 'umd',
      name: 'PrevioletSDK',
      exports: 'default'
    },
    {
      file: 'demo/previolet-sdk.js',
      format: 'iife',
      name: 'PrevioletSDK'
    },
    {
      file: 'dist/previolet-sdk.min.js',
      format: 'iife',
      name: 'PrevioletSDK',
      plugins: [terser()]
    },
    {
      file: 'dist/previolet-sdk.es2015.js',
      format: 'es',
      name: 'PrevioletSDK',
      footer: 'export { PrevioletSDK };',
      plugins: [terser()],
      exports: 'default'
    },
    {
      file: 'dist/previolet-sdk.common.js',
      format: 'cjs',
      exports: 'default'
    },
  ],
  plugins: [
    commonjs(), 
    resolve(), 
    json(), 
    cleanup({ comments: 'none' }),
    banner('Previolet Javascript SDK v<%= pkg.version %>\nhttps://github.com/previolet/previolet-js-sdk\nReleased under the MIT License.'),
    replace({
      __SDK_VERSION__: pkg.version
    })
  ]
};

export default config