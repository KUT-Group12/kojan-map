#!/bin/bash
set -e

echo "================================================"
echo "🚀 Starting deployment for kojan-map"
echo "================================================"

# カラーコード
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# プロジェクトディレクトリに移動
cd /home/kojan-map

# 最新コードを取得
echo -e "${BLUE}📥 Pulling latest code from main branch...${NC}"
git fetch origin
git pull origin main

# 環境変数ファイルの存在確認
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    exit 1
fi

# Dockerコンテナの状態を保存
echo -e "${BLUE}📊 Current Docker containers status:${NC}"
docker compose ps

# コンテナを停止
echo -e "${BLUE}🛑 Stopping Docker containers...${NC}"
docker compose down

# イメージを再ビルドして起動
echo -e "${BLUE}🏗️  Building and starting Docker containers...${NC}"
docker compose up -d --build

# 起動完了まで待機
echo -e "${BLUE}⏳ Waiting for containers to be ready...${NC}"
sleep 10

# 新しいコンテナの状態を確認
echo -e "${BLUE}📊 New Docker containers status:${NC}"
docker compose ps

# ヘルスチェック
echo -e "${BLUE}🔍 Checking backend health...${NC}"
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}================================================${NC}"
else
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}❌ Error: Backend health check failed!${NC}"
    echo -e "${RED}Deployment failed.${NC}"
    echo -e "${RED}================================================${NC}"
    exit 1
fi
