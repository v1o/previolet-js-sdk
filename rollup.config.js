import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import cleanup from 'rollup-plugin-cleanup'
import banner from 'rollup-plugin-banner'
import replace from '@rollup/plugin-replace'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const config = {
  input: 'src/index.js',
  output: [
    {
      file: pkg.module,
      format: 'umd',
      name: 'PrevioletSDK',
      exports: 'default'
    },
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'default'
    },
    {
      file: 'demo/previolet-sdk.js',
      format: 'iife',
      name: 'PrevioletSDK',
      exports: 'default'
    },
    {
      file: 'dist/previolet-sdk.js',
      format: 'iife',
      name: 'PrevioletSDK',
      exports: 'default'
    },
    {
      file: 'dist/previolet-sdk.min.js',
      format: 'iife',
      name: 'PrevioletSDK',
      plugins: [terser()],
      exports: 'default'
    },
    {
      file: 'dist/previolet-sdk.es2015.js',
      format: 'es',
      name: 'PrevioletSDK',
      footer: 'export { PrevioletSDK };',
      exports: 'default'
    },
  ],
  plugins: [
    resolve({
      mainFields: ['main', 'module'],
      browser: true,
      preferBuiltins: true,
      dedupe: [ 'axios' ],
    }), 
    commonjs(), 
    json(), 
    nodePolyfills(),
    cleanup({ comments: 'none' }),
    banner('Previolet Javascript SDK v<%= pkg.version %>\nhttps://github.com/previolet/previolet-js-sdk\nReleased under the MIT License.'),
    replace({
      __SDK_VERSION__: pkg.version
    })
  ]
};

export default config