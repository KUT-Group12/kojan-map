module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react', // Reactを使用している場合
    '@babel/preset-typescript', // TypeScriptを使用している場合
  ],
  plugins: [
    'babel-plugin-transform-import-meta', // これが import.meta を解決します
  ],
};
