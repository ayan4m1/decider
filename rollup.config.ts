import typescript from '@rollup/plugin-typescript';
import externals from 'rollup-plugin-node-externals';

export default {
  input: './src/index.ts',
  output: {
    dir: './lib',
    format: 'esm'
  },
  plugins: [externals(), typescript()]
};
