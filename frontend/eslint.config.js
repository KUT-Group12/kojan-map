import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  // 1. 全域での無視設定
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      'src/__tests__/**', // テストディレクトリを完全に除外
      '**/*.test.tsx',
      '**/*.test.ts',
    ],
  },

  // 2. メインの解析設定
  {
    files: ['**/*.{ts,tsx}'],
    // extends の代わりに推奨設定を直接展開
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      // TypeScriptパース用のオプションを明示
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // 各プラグインの推奨ルールを適用
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // カスタムルール
      'react/prop-types': 'off', // TSなので不要
      'react/react-in-jsx-scope': 'off', // React 17+
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // React Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // 3. Prettier 競合解消
  prettier
);
