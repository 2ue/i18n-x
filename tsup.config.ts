import { defineConfig } from 'tsup';

export default defineConfig([
  // Library build
  {
    entry: ['main/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    target: 'node16',
    esbuildOptions(options) {
      options.conditions = ['node'];
    },
  },
  // CLI build - 使用 CommonJS 格式避免 ESM 兼容性问题
  {
    entry: { cli: 'main/cli/index.ts' },
    format: ['cjs'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: false,
    target: 'node16',
    banner: {
      js: '#!/usr/bin/env node',
    },
    esbuildOptions(options) {
      options.conditions = ['node'];
    },
  },
]); 