// import path from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
// import rollupTS2 from 'rollup-plugin-typescript2';

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
    port: 45173,
  },
  plugins: [
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
