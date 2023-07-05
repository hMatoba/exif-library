import typescript from 'rollup-plugin-typescript';
import { eslint } from 'rollup-plugin-eslint';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/exif-library.js',
    name: 'exifLib',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    eslint({ include: 'src/', throwOnError: true, throwOnWarning: true }),
  ],
};
