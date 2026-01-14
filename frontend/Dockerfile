# 1. ベースイメージ: Node.js 20 (Alpine版)
FROM node:20-alpine

# 2. 作業ディレクトリの設定
WORKDIR /app

# 3. TypeScriptの依存関係のファイルをコピーとインストール
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 4. ソースコード: 残りのファイルを全てコピー
COPY . .

# 5. 起動コマンド: Viteの開発サーバーを起動
CMD ["npm", "run", "dev", "--", "--host"]
