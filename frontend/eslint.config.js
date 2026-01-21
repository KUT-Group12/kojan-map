import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // 1. 無視するディレクトリの設定 (旧 .eslintignore)
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      'src/__tests__/**', // ← frontend/src/__tests__ を無視する設定
      '**/*.test.tsx',    // 個別のテストファイルも対象外にする場合
      '**/*.test.ts'
    ],
  },

  // 2. TypeScript / React 向けメイン設定
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node, // Node v20 のグローバル（process等）を有効化
        ...globals.jest, // テストコード用
      },
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React 推奨ルール
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // 旧設定からの個別移植
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off', // React 17+ では不要
      '@typescript-eslint/no-unused-vars': [
        'warn', 
        { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      
      // Vite / React Refresh 用
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
    },
  },

  // 3. Prettier 競合解消 (必ず最後に配置)
  prettier
);