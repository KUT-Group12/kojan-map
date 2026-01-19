<<<<<<< HEAD
# 1. ベースイメージ: Go 1.23 (Alpine版)
FROM golang:1.23-alpine

# 2. 作業ディレクトリ
WORKDIR /app

# 3. golangci-lintのインストール
RUN wget -O- -nv https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s v1.62.2

# 4. 依存関係の解決 (キャッシュ活用)
COPY go.mod go.sum* ./
RUN go mod download

# 5. ソースコードのコピー
COPY . .

# 6. リンターの実行
RUN ./bin/golangci-lint run

# 7. 起動コマンド
CMD ["go", "run", "main.go"]
=======
# 1. ベースイメージ: Go 1.23 (Alpine版)
FROM golang:1.23-alpine

# 2. 作業ディレクトリ
WORKDIR /app

# 3. golangci-lintのインストール
RUN wget -O- -nv https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s v1.62.2

# 4. 依存関係の解決 (キャッシュ活用)
COPY go.mod go.sum* ./
RUN go mod download

# 5. ソースコードのコピー
COPY . .

# 6. リンターの実行
RUN ./bin/golangci-lint run

# 7. 起動コマンド
CMD ["go", "run", "main.go"]
>>>>>>> origin/main
