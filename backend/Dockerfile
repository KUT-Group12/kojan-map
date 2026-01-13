# 1. ビルドステージ
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 依存関係をインストール
RUN apk add --no-cache git

# go.mod と go.sum をコピー
COPY go.mod go.sum ./

# 依存関係をダウンロード
RUN go mod download

# ソースコードをコピー
COPY . .

# バイナリをビルド
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

# 2. 実行ステージ
FROM alpine:latest

WORKDIR /app

# タイムゾーンとCA証明書をインストール
RUN apk --no-cache add ca-certificates tzdata

# ビルドステージからバイナリをコピー
COPY --from=builder /app/main .

# ポート公開
EXPOSE 8080

# 起動コマンド
CMD ["./main"]
