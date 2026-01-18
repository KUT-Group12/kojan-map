# デプロイメント手順書

事業者会員バックエンド（business）をAWS環境へのデプロイ手順を記載します。

---

## 前提条件

### システム要件
- **Go バージョン**: 1.23.12 以上
- **Docker**: 最新版（ECR対応）
- **AWS CLI**: v2以上
- **MySQL**: 8.0 以上（RDS for MySQL推奨）

### AWS リソース要件
- **ECR**: Docker イメージ保管用
- **ECS (Fargate)**: コンテナオーケストレーション推奨
- **RDS**: MySQLデータベース
- **ALB**: ロードバランシング
- **CloudWatch**: ログ・メトリクス監視
- **Systems Manager**: 環境変数・シークレット管理

### AWS IAM ポリシー（必要）
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:CompleteLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "arn:aws:ecr:*:*:repository/*"
    }
  ]
}
```

---

## 環境変数の設定

### AWS Secrets Manager へ保管
```bash
# JWT秘密鍵
aws secretsmanager create-secret \
  --name /kojan-map/business/jwt-secret \
  --secret-string "your-production-secret-key-min-32-chars"

# Google OAuth2 認証情報
aws secretsmanager create-secret \
  --name /kojan-map/business/google-credentials \
  --secret-string '{
    "client_id": "your-google-client-id",
    "client_secret": "your-google-client-secret"
  }'

# Stripe API キー
aws secretsmanager create-secret \
  --name /kojan-map/business/stripe-key \
  --secret-string "sk_live_your-stripe-key"

# RDS 接続情報
aws secretsmanager create-secret \
  --name /kojan-map/business/rds-credentials \
  --secret-string '{
    "username": "admin",
    "password": "your-strong-password",
    "engine": "mysql",
    "host": "kojan-map-db.xxxxx.ap-northeast-1.rds.amazonaws.com",
    "port": 3306,
    "dbname": "kojan_map_business"
  }'
```

### Systems Manager Parameter Store へ保管
```bash
# 環境変数
aws ssm put-parameter \
  --name /kojan-map/business/GIN_MODE \
  --value "release" \
  --type String

aws ssm put-parameter \
  --name /kojan-map/business/DB_HOST \
  --value "kojan-map-db.xxxxx.ap-northeast-1.rds.amazonaws.com" \
  --type String

aws ssm put-parameter \
  --name /kojan-map/business/DB_PORT \
  --value "3306" \
  --type String

aws ssm put-parameter \
  --name /kojan-map/business/DB_NAME \
  --value "kojan_map_business" \
  --type String
```

---

## ローカル環境での検証

### 1. テスト実行
```bash
cd backend/business
go test ./... -v

# 結果: 89/89 テスト PASS であること
```

### 2. ビルド確認
```bash
go build -o bin/business cmd/main.go
./bin/business
```

---

## Docker イメージ構築と ECR へのプッシュ

### 1. ECR リポジトリ作成
```bash
aws ecr create-repository \
  --repository-name kojan-map/business \
  --region ap-northeast-1
```

### 2. Docker イメージ構築
```bash
cd backend

# ビルド
docker build -t kojan-map-business:v1.0 .
docker build -t kojan-map-business:latest .

# イメージ確認
docker images | grep kojan-map-business
```

### 3. ECR へプッシュ
```bash
# AWS ECR ログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.ap-northeast-1.amazonaws.com

# イメージにタグ付け
docker tag kojan-map-business:v1.0 \
  123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:v1.0

docker tag kojan-map-business:latest \
  123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:latest

# ECR へプッシュ
docker push 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:v1.0
docker push 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:latest

# プッシュ確認
aws ecr describe-images \
  --repository-name kojan-map/business \
  --region ap-northeast-1
```

---

## ECS (Fargate) へのデプロイ

### 1. ECS クラスター作成（初回のみ）
```bash
aws ecs create-cluster \
  --cluster-name kojan-map-production \
  --region ap-northeast-1
```

### 2. IAM ロール作成（初回のみ）

#### タスク実行ロール
```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Secrets Manager アクセス権限追加
aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name SecretsManagerAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue",
          "ssm:GetParameter"
        ],
        "Resource": "arn:aws:secretsmanager:ap-northeast-1:*:secret:/kojan-map/business/*"
      }
    ]
  }'
```

#### タスクロール
```bash
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'
```

### 3. タスク定義作成

```bash
cat > task-definition.json << 'EOF'
{
  "family": "kojan-map-business",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "business",
      "image": "123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789:secret:/kojan-map/business/jwt-secret"
        },
        {
          "name": "GOOGLE_CLIENT_ID",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789:secret:/kojan-map/business/google-credentials:client_id::"
        },
        {
          "name": "STRIPE_SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789:secret:/kojan-map/business/stripe-key"
        }
      ],
      "environment": [
        {
          "name": "DB_HOST",
          "value": "kojan-map-db.xxxxx.ap-northeast-1.rds.amazonaws.com"
        },
        {
          "name": "DB_PORT",
          "value": "3306"
        },
        {
          "name": "DB_NAME",
          "value": "kojan_map_business"
        },
        {
          "name": "GIN_MODE",
          "value": "release"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/kojan-map-business",
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# CloudWatch ロググループ作成
aws logs create-log-group \
  --log-group-name /ecs/kojan-map-business \
  --region ap-northeast-1

# タスク定義登録
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ap-northeast-1
```

### 4. ECS サービス作成

```bash
# VPC/セキュリティグループ事前準備
# VPC ID: vpc-xxxxx
# Subnet IDs: subnet-xxxxx, subnet-yyyyy
# Security Group ID: sg-xxxxx

aws ecs create-service \
  --cluster kojan-map-production \
  --service-name kojan-map-business \
  --task-definition kojan-map-business:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxxxx,subnet-yyyyy],
    securityGroups=[sg-xxxxx],
    assignPublicIp=ENABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:ap-northeast-1:123456789:targetgroup/kojan-map-business/xxxxx,containerName=business,containerPort=8080" \
  --region ap-northeast-1
```

### 5. Auto Scaling 設定

```bash
# スケーリング対象の登録
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/kojan-map-production/kojan-map-business \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10 \
  --region ap-northeast-1

# スケーリングポリシー作成
aws application-autoscaling put-scaling-policy \
  --policy-name cpu-scaling \
  --service-namespace ecs \
  --resource-id service/kojan-map-production/kojan-map-business \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 300
  }' \
  --region ap-northeast-1
```

---

## ALB (Application Load Balancer) 設定

### 1. ALB 作成（初回のみ）
```bash
# ALB 作成
aws elbv2 create-load-balancer \
  --name kojan-map-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --region ap-northeast-1

# 出力の ALB ARN をメモ
# arn:aws:elasticloadbalancing:ap-northeast-1:123456789:loadbalancer/app/kojan-map-alb/xxxxx
```

### 2. ターゲットグループ作成
```bash
aws elbv2 create-target-group \
  --name kojan-map-business \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxxxx \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-northeast-1
```

### 3. リスナー作成
```bash
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:ap-northeast-1:123456789:loadbalancer/app/kojan-map-alb/xxxxx \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:ap-northeast-1:123456789:targetgroup/kojan-map-business/xxxxx \
  --region ap-northeast-1

# HTTPS設定（推奨）
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:ap-northeast-1:123456789:loadbalancer/app/kojan-map-alb/xxxxx \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:ap-northeast-1:123456789:certificate/xxxxx \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:ap-northeast-1:123456789:targetgroup/kojan-map-business/xxxxx \
  --region ap-northeast-1
```

---

## デプロイ手順

### 1. 事前確認
```bash
# Git コミット確認
git log --oneline -5

# ブランチ確認
git branch

# テスト実行
go test ./... -v 2>&1 | tail -10
```

### 2. Docker イメージビルド
```bash
cd backend

# バージョンタグ付け
VERSION=$(date +%Y%m%d-%H%M%S)
docker build -t kojan-map-business:${VERSION} \
  -t kojan-map-business:latest .
```

### 3. ECR へプッシュ
```bash
# ECR ログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.ap-northeast-1.amazonaws.com

# タグ付け
docker tag kojan-map-business:${VERSION} \
  123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:${VERSION}

docker tag kojan-map-business:latest \
  123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:latest

# プッシュ
docker push 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:${VERSION}
docker push 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/kojan-map/business:latest
```

### 4. ECS サービス更新
```bash
# タスク定義を新しいバージョンで更新
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ap-northeast-1

# サービス更新（新しいタスク定義を使用）
aws ecs update-service \
  --cluster kojan-map-production \
  --service kojan-map-business \
  --task-definition kojan-map-business \
  --region ap-northeast-1

# デプロイ進行状況確認
aws ecs describe-services \
  --cluster kojan-map-production \
  --services kojan-map-business \
  --region ap-northeast-1
```

### 5. ヘルスチェック
```bash
# ALB の DNS 名取得
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names kojan-map-alb \
  --region ap-northeast-1 \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

# ヘルスチェック
curl http://${ALB_DNS}/health

# 期待値: { "status": "ok" }
```

---

## ロールバック手順

### ECS ロールバック
```bash
# デプロイ履歴確認
aws ecs describe-task-definition \
  --task-definition kojan-map-business \
  --region ap-northeast-1

# 前のタスク定義にロールバック
aws ecs update-service \
  --cluster kojan-map-production \
  --service kojan-map-business \
  --task-definition kojan-map-business:1 \
  --region ap-northeast-1

# ロールバック確認
aws ecs describe-services \
  --cluster kojan-map-production \
  --services kojan-map-business \
  --region ap-northeast-1
```

---

## 本番環境での監視

### CloudWatch ログ確認
```bash
# リアルタイムログ監視
aws logs tail /ecs/kojan-map-business --follow --region ap-northeast-1

# 特定期間のログ確認
aws logs filter-log-events \
  --log-group-name /ecs/kojan-map-business \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --region ap-northeast-1
```

### メトリクス確認
```bash
# CPU メトリクス
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=kojan-map-business \
               Name=ClusterName,Value=kojan-map-production \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average,Maximum \
  --region ap-northeast-1

# メモリメトリクス
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=kojan-map-business \
               Name=ClusterName,Value=kojan-map-production \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average,Maximum \
  --region ap-northeast-1
```

### CloudWatch アラーム設定
```bash
# CPU 使用率高
aws cloudwatch put-metric-alarm \
  --alarm-name kojan-map-business-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=kojan-map-business \
               Name=ClusterName,Value=kojan-map-production \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --region ap-northeast-1

# メモリ使用率高
aws cloudwatch put-metric-alarm \
  --alarm-name kojan-map-business-high-memory \
  --alarm-description "Alert when Memory > 85%" \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=kojan-map-business \
               Name=ClusterName,Value=kojan-map-production \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --region ap-northeast-1
```

---

## トラブルシューティング

### タスクが起動しない場合
```bash
# タスク詳細確認
aws ecs describe-tasks \
  --cluster kojan-map-production \
  --tasks <task-arn> \
  --region ap-northeast-1

# ログ確認
aws logs tail /ecs/kojan-map-business --follow
```

### ヘルスチェック失敗
```bash
# ターゲットグループ確認
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:ap-northeast-1:123456789:targetgroup/kojan-map-business/xxxxx \
  --region ap-northeast-1
```

### データベース接続失敗
```bash
# RDS インスタンス確認
aws rds describe-db-instances \
  --db-instance-identifier kojan-map-db \
  --region ap-northeast-1

# セキュリティグループルール確認
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --region ap-northeast-1
```

---

## セキュリティ対策チェックリスト

- [ ] JWT_SECRET が十分に複雑か（32文字以上推奨）
- [ ] Secrets Manager に機密情報が保管されているか
- [ ] HTTPS/TLS が有効か（ACM証明書）
- [ ] CORS 設定が適切か
- [ ] セキュリティグループで必要なポートのみ開放
- [ ] VPC フローログが有効か
- [ ] CloudTrail でAPI監査ログが記録されているか

---

## 更新履歴

| 日付 | バージョン | 更新内容 |
|-----|----------|--------|
| 2026-01-14 | 1.0 | 初版作成（AWS ECS Fargate対応） |



