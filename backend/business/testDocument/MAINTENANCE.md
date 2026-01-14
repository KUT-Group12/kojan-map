# 運用・保守ガイドライン

事業者会員バックエンド（business）のAWS環境での運用・保守時の手順とベストプラクティスを記載します。

---

## 目次

1. [日常運用](#日常運用)
2. [トラブル対応](#トラブル対応)
3. [定期メンテナンス](#定期メンテナンス)
4. [性能最適化](#性能最適化)
5. [セキュリティ更新](#セキュリティ更新)
6. [ドキュメント更新](#ドキュメント更新)

---

## 日常運用

### ヘルスチェック（毎日実施）

```bash
# ECS タスク稼働状況確認
aws ecs describe-services \
  --cluster kojan-map-production \
  --services kojan-map-business \
  --region ap-northeast-1 \
  --query 'services[0].{RunningCount:runningCount,DesiredCount:desiredCount,Status:status}'

# CloudWatch ログでエラーを確認
aws logs tail /ecs/kojan-map-business --since 1h | grep ERROR

# 期待値: エラーがないこと、RunningCount == DesiredCount
```

### リアルタイム監視ダッシュボード

CloudWatch ダッシュボードで主要メトリクスを監視対象：

| メトリクス | アラート閾値 | 対応アクション |
|----------|----------|----------|
| HTTP レスポンス タイム（P99） | > 1000ms | ログ確認、DB接続確認 |
| エラーレート（ALB 5XX） | > 1% | ログ確認、デバッグ |
| ECS CPU 使用率 | > 80% | スケーリング検討 |
| ECS メモリ使用率 | > 85% | メモリリーク調査 |
| RDS CPU 使用率 | > 80% | クエリ最適化 |
| RDS ストレージ使用率 | > 90% | ストレージ拡張 |

### 定期ログレビュー

```bash
# 1時間ごとのエラーサマリー
aws logs filter-log-events \
  --log-group-name /ecs/kojan-map-business \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --query 'events[?contains(message, `ERROR`)]' \
  --region ap-northeast-1

# CloudWatch Insights で詳細分析
aws logs start-query \
  --log-group-name /ecs/kojan-map-business \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | stats count() by @message' \
  --region ap-northeast-1
```

---

## トラブル対応

### 対応フロー

```
事象発生 → CloudWatch Logs確認 → 原因特定 → 対応方法決定 → 実施 → 検証
```

### よくある問題と対応

#### 1. 認証エラー（401/403）

**症状**: クライアント側で「認証失敗」エラー

**原因特定**:
```bash
# CloudWatch Logs で JWT 検証エラーを確認
aws logs filter-log-events \
  --log-group-name /ecs/kojan-map-business \
  --filter-pattern "invalid token" \
  --region ap-northeast-1
```

**対応**:
```bash
# 1. トークンの有効期限確認
# 有効期限: 24時間（default）

# 2. JWT_SECRET が正しいか確認
aws secretsmanager get-secret-value \
  --secret-id /kojan-map/business/jwt-secret \
  --region ap-northeast-1

# 3. クライアント側のトークンリクエストを確認
# POST /auth/login に Gmail + MFA コードが正しく送信されているか

# 4. ALB ログ確認
aws s3 ls s3://kojan-map-alb-logs/
```

#### 2. データベース接続エラー

**症状**: 全エンドポイントで 500 エラー

**原因特定**:
```bash
# CloudWatch Logs で DB エラーを確認
aws logs filter-log-events \
  --log-group-name /ecs/kojan-map-business \
  --filter-pattern "database connection" \
  --region ap-northeast-1
```

**対応**:
```bash
# 1. RDS インスタンス確認
aws rds describe-db-instances \
  --db-instance-identifier kojan-map-db \
  --region ap-northeast-1

# 2. RDS セキュリティグループルール確認
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --region ap-northeast-1

# 3. ECS タスク環境変数確認
aws ecs describe-task-definition \
  --task-definition kojan-map-business \
  --region ap-northeast-1

# 4. RDS データベース疎通テスト
# ECS タスク内から mysql コマンドで接続テスト
```

#### 3. メモリリーク

**症状**: ECS タスク メモリ使用率が徐々に増加

**原因特定**:
```bash
# CloudWatch メモリメトリクス確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=kojan-map-business \
               Name=ClusterName,Value=kojan-map-production \
  --start-time $(date -u -d '24 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Maximum \
  --region ap-northeast-1
```

**対応**:
```bash
# 1. ECS タスク再起動
aws ecs update-service \
  --cluster kojan-map-production \
  --service kojan-map-business \
  --force-new-deployment \
  --region ap-northeast-1

# 2. 新しいタスクが起動し、メモリ使用率がリセットされることを確認
aws ecs describe-services \
  --cluster kojan-map-production \
  --services kojan-map-business \
  --region ap-northeast-1

# 3. 継続してメモリリークが疑わしい場合はコード レビュー
# - goroutine リーク確認
# - DB 接続クローズ確認
# - キャッシュ無限成長確認
```

#### 4. 高レイテンシ

**症状**: レスポンスタイムが常に 1秒以上

**原因特定**:
```bash
# ALB ターゲットレスポンスタイム確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=TargetGroup,Value=targetgroup/kojan-map-business/xxxxx \
               Name=LoadBalancer,Value=app/kojan-map-alb/xxxxx \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average,Maximum \
  --region ap-northeast-1

# RDS スロークエリログ確認
# AWS Management Console から RDS → Logs にアクセス
```

**対応**:
```bash
# 1. N+1 クエリ問題を疑う
# Service層 のコードレビュー

# 2. RDS インデックス作成
# aws rds start-db-instance コマンドで DBをリスタート

# 3. RDS リードレプリカ追加を検討

# 4. CloudFront キャッシング導入
```

---

## 定期メンテナンス

### 日次タスク

```bash
# 朝一番: ECS タスク稼働確認
aws ecs describe-services \
  --cluster kojan-map-production \
  --services kojan-map-business \
  --region ap-northeast-1

# 夜間: CloudWatch ログ確認
aws logs tail /ecs/kojan-map-business --since 24h | grep ERROR
```

### 週次タスク

```bash
# セキュリティアップデート確認
aws ecr describe-image-scan-findings \
  --repository-name kojan-map/business \
  --image-id imageTag=latest \
  --region ap-northeast-1

# Go のセキュリティアラート確認
# GitHub Security Advisories を確認

# テストスイート実行確認
docker run kojan-map-business:latest \
  sh -c "cd /app/business && go test ./... -v 2>&1 | tail -5"
```

### 月次タスク

```bash
# 依存関係アップデート確認
cd backend/business
go get -u -t ./...
go mod tidy

# アップデート後のテスト実行
go test ./... -v

# 問題がなければコミット
git add go.mod go.sum
git commit -m "chore: 依存関係アップデート ($(date +%Y-%m-%d))"
git push

# Docker イメージ再ビルド・ECR へプッシュ
cd ../
docker build -t kojan-map-business:monthly-update .
# ... (DEPLOYMENT.md を参照して ECR へプッシュ)
```

### 四半期タスク

```bash
# Go バージョンアップデート確認
# 新バージョンが利用可能か確認

# 例: Go 1.24 リリース時
# 1. ローカルで go.mod を 1.24 に変更
# 2. go mod tidy 実行
# 3. go test ./... で全テスト実行
# 4. Docker イメージでもテスト
# 5. 問題がなければ本番環境へ

# AWS 環境のセキュリティ監査
aws accessanalyzer validate-policy \
  --policy-document file://iam-policy.json \
  --policy-type IDENTITY_POLICY \
  --region ap-northeast-1
```

---

## 性能最適化

### ベンチマークテスト（月1回推奨）

```bash
# 新しいベンチマーク実行
cd backend/business
go test -bench=. -benchmem ./...

# 結果をファイルに保存
go test -bench=. -benchmem ./... > benchmark_$(date +%Y-%m-%d).txt

# 過去のベンチマークと比較
benchstat benchmark_2026-01-14.txt benchmark_2026-02-14.txt
```

### ECS オートスケーリング確認

```bash
# スケーリング状況確認
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/kojan-map-production/kojan-map-business \
  --region ap-northeast-1 \
  --query 'ScalingActivities[0:5]'

# 現在の Pod 数確認
aws ecs describe-services \
  --cluster kojan-map-production \
  --services kojan-map-business \
  --region ap-northeast-1 \
  --query 'services[0].{RunningCount:runningCount,DesiredCount:desiredCount}'
```

### データベースパフォーマンス

```bash
# RDS スロークエリ設定
aws rds modify-db-parameter-group \
  --db-parameter-group-name default.mysql8.0 \
  --parameters 'ParameterName=slow_query_log,ParameterValue=1,ApplyMethod=immediate' \
  --region ap-northeast-1

# 1 秒以上かかるクエリをログ出力
# AWS Management Console から確認 → RDS → Logs
```

---

## セキュリティ更新

### 定期セキュリティチェック（月1回）

```bash
# ECR イメージスキャン結果確認
aws ecr describe-image-scan-findings \
  --repository-name kojan-map/business \
  --image-id imageTag=latest \
  --region ap-northeast-1

# 依存関係の脆弱性チェック
go list -m all | while read mod; do
  echo "Checking $mod..."
done

# AWS Secrets Manager へのアクセス権限確認
aws secretsmanager list-secrets \
  --region ap-northeast-1 \
  --filter Key=name,Values=/kojan-map/business/
```

### Go セキュリティ パッチ対応

新しい Go バージョンがリリースされたら：

```bash
# 1. ローカルで新バージョンをテスト
go get golang.org/dl/go1.23.13
go1.23.13 version

# 2. go.mod を更新
go mod edit -go=1.23.13
go mod tidy

# 3. テスト実行
go test ./... -v

# 4. Docker イメージでテスト
docker build -t test:latest .
docker run test:latest go test ./... -v

# 5. 本番環境へデプロイ（DEPLOYMENT.md 参照）
git add go.mod go.sum
git commit -m "chore: Go をアップデート (1.23.13)"
git push
```

### JWT / OAuth2 セキュリティ確認

毎月確認：

```bash
# JWT_SECRET が十分に複雑か確認
aws secretsmanager get-secret-value \
  --secret-id /kojan-map/business/jwt-secret \
  --region ap-northeast-1 \
  --query 'SecretString' | wc -c
# 期待値: 32文字以上

# OAuth2 トークンの有効期限確認
# コード内で確認: 推奨: 24時間

# MFA コードの有効期限確認
# コード内で確認: 推奨: 5分

# ブラックリスト機能動作確認
# ログアウト後、古いトークンでアクセスできないことを確認
```

---

## ドキュメント更新

### リリース時の更新項目

```bash
# 1. CHANGELOG を更新
# Format: ## [Version] - YYYY-MM-DD
# - Feature: 新機能
# - Fix: バグ修正
# - Security: セキュリティ更新
# - Chore: 依存関係更新

# 2. README.md を更新（必要に応じて）

# 3. testDocument/list.md に テスト実行結果を記録

# 4. DEPLOYMENT.md にバージョン情報を追記
```

### コード コメント更新

```bash
# テスト追加時の記録
# testDocument/list.md に追記

# セクション形式:
# | テスト項目 | 内容 | ステータス | モック | 備考 |
# |----------|------|---------|-------|------|
# | ... | ... | ✅ 実装 | ... | SSOT ... |
```

---

## 障害報告と対応記録

### 障害発生時

```bash
# 1. er.md（障害管理表）に新しい記録を追加
# 管理番号: ER-XXX
# テスト項目管理番号: T-YYY
# モジュール名: パッケージ名
# 障害状況: 具体的な症状
# 障害対処内容: 実施した対応
# トラブル分類: 上記の分類表参照

# 2. Git に commit
git add testDocument/er.md
git commit -m "docs: add error record ER-XXX"

# 3. チーム内で共有
```

---

## 緊急対応フロー（本番障害時）

```
障害検知（5分以内）
↓
CloudWatch Logs確認・原因特定（10分以内）
↓
対応方法検討（5分以内）
↓
本番環境実施 or ロールバック判断（5分以内）
↓
実施後の検証（5分以内）
↓
根本原因分析・改善策立案（24時間以内）
↓
ドキュメント更新・チーム共有
```

### 即座にロールバックすべき場合

- API が全て 500 エラー
- データベース接続完全断
- ECS メモリ使用率 > 95%
- ECS CPU 使用率 > 100% (sustained)

```bash
# ロールバック実行（前のバージョンに戻す）
aws ecs update-service \
  --cluster kojan-map-production \
  --service kojan-map-business \
  --task-definition kojan-map-business:1 \
  --region ap-northeast-1

# 復旧確認
aws ecs describe-services \
  --cluster kojan-map-production \
  --services kojan-map-business \
  --region ap-northeast-1

aws logs tail /ecs/kojan-map-business --follow
```

---

## チェックリスト

### 月初チェックリスト
- [ ] 前月のログをアーカイブ
- [ ] 依存関係をアップデート
- [ ] テスト全てが PASS している
- [ ] セキュリティアラート確認

### 本番デプロイ前チェック
- [ ] 全テスト PASS
- [ ] Go バージョン確認
- [ ] Docker ビルド成功
- [ ] Docker テスト PASS
- [ ] ロールバック計画策定
- [ ] チーム内で共有

### 本番デプロイ後チェック
- [ ] ヘルスチェック成功
- [ ] ログでエラーなし
- [ ] メトリクス正常
- [ ] API エンドポイント動作確認
- [ ] 30分間の安定稼働確認

---

## 参考ドキュメント

- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイメント手順
- [list.md](./list.md) - テスト一覧
- [er.md](./er.md) - 障害管理表

---

## 更新履歴

| 日付 | バージョン | 更新内容 |
|-----|----------|--------|
| 2026-01-14 | 1.0 | 初版作成（Go 1.23 対応） |

