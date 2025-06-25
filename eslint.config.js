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
      // TypeScript recommended rules with relaxed AST operation rules
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,

      // Prettier rules
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // Relaxed rules for AST operations and CLI tools
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Relaxed for AST operations
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',

      // Allow require for specific compatibility needs
      '@typescript-eslint/no-require-imports': 'warn',

      // Modern syntax preferences (warn, not error)
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // General rules for CLI tools
      'no-console': 'off', // CLI tools need console output
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'require-await': 'warn', // Relaxed to warn
      'no-return-await': 'warn', // Relaxed to warn
      '@typescript-eslint/no-floating-promises': 'warn', // Relaxed to warn

      // Error handling for CLI tools
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Switch case declarations
      'no-case-declarations': 'warn',
    },
  },
  {
    // Special rules for AST files where any types are unavoidable
    files: ['src/ast/**/*.ts', 'src/translation/queue.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Special rules for CLI files where require and any are sometimes needed
    files: ['src/cli.ts', 'src/translation/providers/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
    },
  },
  {
    // Ignore patterns - replacing .eslintignore functionality
    ignores: [
      'test/**/*',
      'dist/**/*',
      'node_modules/**/*',
      '*.config.js',
      '*.config.ts',
      'coverage/**/*',
      '.github/**/*',
    ],
  },
]; 