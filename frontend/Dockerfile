# 1. ベースイメージ: Node.js 24.13.0 (Alpine版)
FROM node:24.13.0-alpine

# 2. 作業ディレクトリの設定
WORKDIR /app

# 3. TypeScriptの依存関係のファイルをコピーとインストール
COPY package.json package-lock.json ./
RUN npm install

# 4. ソースコード: 残りのファイルを全てコピー
COPY . .

# 5. リンターとフォーマッターの実行
RUN npm run lint && npm run format:check

# 6. 起動コマンド: Viteの開発サーバーを起動
CMD ["npm", "run", "dev", "--", "--host"]
