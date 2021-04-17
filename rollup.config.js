import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourcemaps from 'rollup-plugin-sourcemaps'
import copy from 'rollup-plugin-copy'

const sharedPlugins = [
  commonjs(),
  nodeResolve(),
  sourcemaps(),
]

export default [
  {
    input: 'empty.js',
    output: {
      file: 'dist/empty.js'
    },
    plugins: [
      copy({
        targets: [
          { src: `index.html`, dest: `dist` },
          { src: `assets`, dest: `dist` },
        ],
      }),
    ]
  },
  ...new Array(1).fill().map((_, i) => ({
    input: `src/tutorial${i}/index.js`,
    output: {
      file: `dist/tutorial${i}/build.js`,
      format: 'iife',
    },
    plugins: [
      copy({
        targets: [
          { src: `src/tutorial${i}/index.html`, dest: `dist/tutorial${i}` },
        ],
      }),
      ...sharedPlugins
    ],
  }))
]
