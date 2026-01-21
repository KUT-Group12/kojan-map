module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/setupTests.ts'],

  // ESMパッケージを ts-jest で変換するための設定
  transform: {
<<<<<<< HEAD
    '^.+\\.(t|j)sx?$': 'babel-jest',
    /*
      {
        useESM: true,
      },*/
=======
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
>>>>>>> main
  },

  // ⚠ 重要：react-leaflet とその依存関係を変換対象に含める
  // デフォルトでは node_modules は無視されるため、ここで除外設定を行う
  transformIgnorePatterns: [
    'node_modules/(?!(react-leaflet|@react-leaflet|leaflet|lucide-react)/)',
  ],

  moduleNameMapper: {
    // CSSや画像ファイルを無視する設定
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',

    // react-leaflet のパス解決
    '^react-leaflet$': '<rootDir>/node_modules/react-leaflet/lib/index.js',

    // Lucide-react 設定
    '^lucide-react$': require.resolve('lucide-react'),
  },
};
