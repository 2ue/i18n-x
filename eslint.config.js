import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    ignores: ['test/**/*', 'dist/**/*', 'node_modules/**/*'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        BufferEncoding: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    rules: {
      // TypeScript recommended rules
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,

      // Prettier rules
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // Node.js CLI specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // General rules for CLI tools
      'no-console': 'off', // CLI tools need console output
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'require-await': 'error',
      'no-return-await': 'error',

      // Error handling for CLI tools
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
    },
  },
  {
    // Ignore patterns
    ignores: ['test/**/*', 'dist/**/*', '*.config.js', '*.config.ts'],
  },
]; 