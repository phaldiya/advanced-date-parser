import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // Type declarations are emitted separately via `tsc -p tsconfig.build.json`:
  // tsup's rollup-plugin-dts relies on TS-internal APIs removed in TypeScript 7.
  dts: false,
  target: 'node22',
  clean: true,
  splitting: false,
  sourcemap: true,
});
