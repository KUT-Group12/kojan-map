#!/bin/bash

# ネットワーク作成
docker network create kojan-network 2>/dev/null || true

# データベース起動（既に起動している場合はスキップ）
if ! docker ps | grep -q kojan-db; then
  echo "データベースを起動中..."
  docker run -d --name kojan-db --network kojan-network \
    -e MYSQL_ROOT_PASSWORD=root \
    -e MYSQL_DATABASE=kojanmap \
    -p 3306:3306 \
    mysql:8.0
  
  # データベースの起動を待つ
  echo "データベースの準備を待っています（30秒）..."
  sleep 30
fi

# バックエンド起動
echo "バックエンドを起動中..."
docker run --rm -p 8080:8080 --network kojan-network \
  -e DB_HOST=kojan-db \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=root \
  -e DB_NAME=kojanmap \
  -e PORT=8080 \
  kojan-map-backend
