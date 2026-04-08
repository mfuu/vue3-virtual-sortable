import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');
const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const banner = `
/*!
 * vue-virtual-sortable v${packageJson.version}
 * open source under the MIT license
 * ${packageJson.homepage}
 */
`;

export default [
  {
    input: 'src/index.tsx',
    output: [
      {
        format: 'es',
        file: packageJson.module,
        banner: banner.replace(/\n/, ''),
      },
      {
        format: 'cjs',
        file: packageJson.main,
        exports: 'default',
        banner: banner.replace(/\n/, ''),
      },
    ],
    external: ['vue'],
    plugins: [resolve(), commonJs(), typescript(), babel({ extensions, babelHelpers: 'bundled' })],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'types/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
