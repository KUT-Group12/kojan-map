module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['<rootDir>/src/__tests__/setupTests.ts'],
    transform: {
      '^.+\\.(t|j)sx?$': 'ts-jest',
    },
    moduleNameMapper: {
      // CSSや画像ファイルを無視する設定
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
      // ⚠ 重要：Lucide-reactなどのアイコンでエラーが出る場合
      '^lucide-react$': require.resolve('lucide-react'),
    },
  };