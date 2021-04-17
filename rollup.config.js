import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourcemaps from 'rollup-plugin-sourcemaps'
import copy from 'rollup-plugin-copy'

export default [
  {
    input: `src/index.js`,
    output: {
      file: 'dist/build.js',
      format: 'iife',
    },
    plugins: [
      copy({
        targets: [
          { src: `index.html`, dest: `dist` },
          { src: `assets`, dest: `dist` },
        ],
      }),
      commonjs(),
      nodeResolve(),
      sourcemaps(),
    ],
  }
]
