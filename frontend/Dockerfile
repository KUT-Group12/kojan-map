# 1. ベースイメージ: Node.js 20 (Alpine版)
FROM node:20-bookworm

# 2. 作業ディレクトリの設定
WORKDIR /app

# 3. TypeScriptの依存関係のファイルをコピーとインストール
COPY package.json package-lock.json ./
RUN npm install
RUN npx playwright install --with-deps
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

# 4. ソースコード: 残りのファイルを全てコピー
COPY . .
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# 6. 起動コマンド: Viteの開発サーバーを起動
CMD ["npm", "run", "dev", "--", "--host"]
