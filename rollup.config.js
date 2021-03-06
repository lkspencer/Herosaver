import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import { v4 as uuidv4 } from 'uuid';

let fileName = pkg.browser.replace('[hash]', uuidv4());

export default [
  {
    input: 'src/saver.js',
    output: {
      name: 'saver',
      file: fileName,
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs({
        namedExports: {
          'file-saver': ['saveAs'],
        }
      }),
      replace({
        ' instanceof BufferGeometry': '.isBufferGeometry',
        ' instanceof Geometry': '.isGeometry'
      }),
      terser({
        compress: {
          arguments: true,
          booleans_as_integers: true,
          drop_console: false,
          hoist_funs: true,
          keep_fargs: false,
          toplevel: true,
          unsafe: true,
          unsafe_Function: true,
          passes: 2
        },
        mangle: {
          eval: true,
          toplevel: true,
        }
      })
    ]
  }
];
