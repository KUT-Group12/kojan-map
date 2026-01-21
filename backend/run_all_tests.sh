#!/bin/bash

# バックエンド全体テスト実行スクリプト
# 実行方法: ./run_all_tests.sh

set -e

echo "============================================"
echo "バックエンド全体テスト実行"
echo "実行日時: $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"
echo ""

# カウンター初期化
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# User バックエンドテスト
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 USER BACKEND TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd user
USER_RESULT=$(go test ./services -v 2>&1)
USER_COUNT=$(echo "$USER_RESULT" | grep -c "^--- PASS" || true)
USER_FAIL=$(echo "$USER_RESULT" | grep -c "^--- FAIL" || true)

if [ $USER_FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ User テスト: ${USER_COUNT}/${USER_COUNT} PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + USER_COUNT))
else
    echo -e "${RED}❌ User テスト: $((USER_COUNT))/${USER_COUNT} PASS, ${USER_FAIL} FAIL${NC}"
    PASSED_TESTS=$((PASSED_TESTS + USER_COUNT))
    FAILED_TESTS=$((FAILED_TESTS + USER_FAIL))
fi
TOTAL_TESTS=$((TOTAL_TESTS + USER_COUNT + USER_FAIL))
cd ..
echo ""

# Admin バックエンドテスト
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👔 ADMIN BACKEND TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd admin
ADMIN_RESULT=$(go test ./... -v 2>&1)
ADMIN_COUNT=$(echo "$ADMIN_RESULT" | grep -c "^--- PASS" || true)
ADMIN_FAIL=$(echo "$ADMIN_RESULT" | grep -c "^--- FAIL" || true)

if [ $ADMIN_FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ Admin テスト: ${ADMIN_COUNT}/${ADMIN_COUNT} PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + ADMIN_COUNT))
else
    echo -e "${RED}❌ Admin テスト: $((ADMIN_COUNT))/${ADMIN_COUNT} PASS, ${ADMIN_FAIL} FAIL${NC}"
    PASSED_TESTS=$((PASSED_TESTS + ADMIN_COUNT))
    FAILED_TESTS=$((FAILED_TESTS + ADMIN_FAIL))
fi
TOTAL_TESTS=$((TOTAL_TESTS + ADMIN_COUNT + ADMIN_FAIL))
cd ..
echo ""

# Business バックエンドテスト（単体）
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏢 BUSINESS BACKEND TEST (Unit)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd business
BIZ_RESULT=$(go test ./... -v 2>&1)
BIZ_COUNT=$(echo "$BIZ_RESULT" | grep -c "^--- PASS" || true)
BIZ_FAIL=$(echo "$BIZ_RESULT" | grep -c "^--- FAIL" || true)

if [ $BIZ_FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ Business 単体テスト: ${BIZ_COUNT}/${BIZ_COUNT} PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + BIZ_COUNT))
else
    echo -e "${RED}❌ Business 単体テスト: $((BIZ_COUNT))/${BIZ_COUNT} PASS, ${BIZ_FAIL} FAIL${NC}"
    PASSED_TESTS=$((PASSED_TESTS + BIZ_COUNT))
    FAILED_TESTS=$((FAILED_TESTS + BIZ_FAIL))
fi
TOTAL_TESTS=$((TOTAL_TESTS + BIZ_COUNT + BIZ_FAIL))
echo ""

# Business 統合テスト（オプション）
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 BUSINESS BACKEND TEST (Integration)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# データベースが起動しているか確認
if docker ps | grep -q kojan-map-db-1; then
    echo "データベースが起動しています。統合テストを実行します..."
    
    # テスト用データベースの初期化
    echo "テスト用データベースを初期化中..."
    DUMP_FILE="../../kojanmap_dump.sql"
    
    docker exec kojan-map-db-1 mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS kojanmap_test;" 2>/dev/null || true
    cat "$DUMP_FILE" | docker exec -i kojan-map-db-1 mysql -uroot -proot kojanmap_test 2>/dev/null || true
    docker exec kojan-map-db-1 mysql -uroot -proot kojanmap_test -e "INSERT IGNORE INTO place (placeId, numPost, latitude, longitude) VALUES (1, 0, 35.6895, 139.6917);" 2>/dev/null || true
    
    set +e  # 統合テストの失敗でスクリプトを停止させない
    INT_RESULT=$(DATABASE_URL="root:root@tcp(localhost:3306)/kojanmap_test?parseTime=true&charset=utf8mb4&loc=Local" \
        go test -tags=integration ./internal/api -v 2>&1)
    set -e
    INT_PASS=$(echo "$INT_RESULT" | grep -c "^--- PASS" || true)
    INT_FAIL=$(echo "$INT_RESULT" | grep -c "^--- FAIL" || true)
    INT_SKIP=$(echo "$INT_RESULT" | grep -c "^--- SKIP" || true)
    
    if [ $INT_FAIL -eq 0 ]; then
        echo -e "${GREEN}✅ Business 統合テスト: ${INT_PASS}/$((INT_PASS + INT_SKIP)) PASS (${INT_SKIP} SKIP)${NC}"
    else
        echo -e "${YELLOW}⚠️  Business 統合テスト: ${INT_PASS}/$((INT_PASS + INT_FAIL + INT_SKIP)) PASS, ${INT_FAIL} FAIL, ${INT_SKIP} SKIP${NC}"
    fi
    
    PASSED_TESTS=$((PASSED_TESTS + INT_PASS))
    FAILED_TESTS=$((FAILED_TESTS + INT_FAIL))
    TOTAL_TESTS=$((TOTAL_TESTS + INT_PASS + INT_FAIL))
else
    echo -e "${YELLOW}⚠️  データベースが起動していません。統合テストをスキップします。${NC}"
    echo "統合テストを実行するには、以下を実行してください:"
    echo "  docker-compose up -d db"
fi

cd ..
echo ""

# 結果サマリー
echo "============================================"
echo "📊 テスト結果サマリー"
echo "============================================"
echo "総テスト数:    ${TOTAL_TESTS}"
echo -e "成功:          ${GREEN}${PASSED_TESTS}${NC}"
echo -e "失敗:          ${RED}${FAILED_TESTS}${NC}"

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo ""
echo -e "成功率:        ${GREEN}${SUCCESS_RATE}%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✨ すべてのテストが成功しました！✨${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  一部のテストが失敗しました。詳細を確認してください。${NC}"
    exit 1
fi
