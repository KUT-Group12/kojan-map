# 1. ベースイメージ: Go 1.23 (Alpine版)
FROM golang:1.23-alpine

# 2. 作業ディレクトリ
WORKDIR /app

# 3. 依存関係の解決 (キャッシュ活用)
COPY go.mod go.sum* ./
RUN go mod download

# 4. ソースコードのコピー
COPY . .

# 5. 起動コマンド
CMD ["go", "run", "main.go"]
