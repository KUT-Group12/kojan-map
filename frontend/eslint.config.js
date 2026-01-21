import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  // 1. 全域での無視設定（ここに files を書かないのが Flat Config のコツ）
  {
    ignores: [
      'dist',
      'node_modules',
      'build',
      'coverage',
      '*.config.js',
      'src/__tests__/**',
      '**/*.test.tsx',
      '**/*.test.ts',
    ],
  },

  // 2. ベースの設定（JS + TS 推奨設定）
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. React / TypeScript の詳細設定
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        // 型情報が必要なルールを使う場合に必須
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // プラグインの登録
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
      ...react.configs['jsx-runtime'].rules, // React 17+ のための設定
      ...reactHooks.configs.recommended.rules,

      // カスタムルール
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // 4. Prettier との競合解消（必ず最後に置く）
  prettier
);
