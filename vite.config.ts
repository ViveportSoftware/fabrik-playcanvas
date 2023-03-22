// import path from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
// import rollupTS2 from 'rollup-plugin-typescript2';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 45173,
    https: true,
  },
  plugins: [
    mkcert(),
    dts({
      insertTypesEntry: true,
    }),
    // {
    //   ...rollupTS2({
    //     check: true,
    //     tsconfig: './tsconfig.json',
    //     tsconfigOverride: {
    //       noEmits: true,
    //     },
    //   }),
    //   // run before build
    //   enforce: 'pre',
    // },
  ],
});
