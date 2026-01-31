# GitHub Actions Workflows

このディレクトリには、kojan-mapプロジェクトのCI/CDワークフローが含まれています。

## ワークフロー一覧

### 1. Lint (`lint.yml`)

**トリガー**: `main`または`develop`ブランチへのpush/PR

**ジョブ:**
- **backend-lint**: Go言語のコード品質チェック
  - golangci-lint
  - go vet
  - go fmt
- **frontend-lint**: TypeScriptのコード品質チェック
  - ESLint
  - Prettier

### 2. Test (`test.yml`)

**トリガー**: `main`または`develop`ブランチへのpush/PR

**ジョブ:**
- **backend-test**: Goのユニットテスト
  - `go test -v ./...`
  - カバレッジレポート生成
- **frontend-test**: TypeScriptのユニットテスト
  - `npm test`

### 3. Deploy (`deploy.yml`)

**トリガー**: `main`ブランチへのpush（のみ）

**ジョブ:**
1. **lint**: Lintワークフローを実行
2. **test**: Testワークフローを実行
3. **deploy**: EC2へSSH接続してデプロイ
   - `git pull origin main`
   - `docker compose down`
   - `docker compose up -d --build`
4. **notify**: デプロイ結果を通知（オプション）

**必要なGitHub Secrets:**
- `SATOKEN_SECRET`: EC2へのSSH接続用の秘密鍵

**デプロイ先:**
- EC2ホスト: `3.92.98.19`
- SSHユーザー: `ubuntu`
- プロジェクトパス: `/home/kojan-map`

### 4. Slack Notify (`slack-notify.yml`)

**トリガー**: 他のワークフローから呼び出し可能

**機能**: ビルド/デプロイ結果をSlackに通知

---

## ローカルでの事前確認

デプロイ前に必ずローカルで以下を実行してください：

```bash
# Backend
cd backend
gofmt -s -w .
go vet ./...
go test ./...

# Frontend
cd frontend
npm run lint
npm run format:check
npm test
```

---

## トラブルシューティング

### デプロイが失敗する場合

1. **Lint/Testの失敗**: 
   - ローカルで`lint`と`test`を実行して問題を修正
   
2. **SSH接続エラー**:
   - GitHub Secretsに`SATOKEN_SECRET`が正しく登録されているか確認
   - EC2のセキュリティグループでSSH接続が許可されているか確認

3. **Docker起動エラー**:
   - EC2にログインして`docker compose logs`で詳細を確認
   - `.env`ファイルが正しく配置されているか確認

### ロールバック方法

デプロイに問題がある場合、EC2に直接ログインしてロールバック：

```bash
ssh ubuntu@3.92.98.19
cd /home/kojan-map

# 前のバージョンに戻す
git reset --hard <previous-commit-hash>
docker compose down
docker compose up -d --build
```

---

## セキュリティ注意事項

> [!CAUTION]
> - SSH秘密鍵は絶対にGitにコミットしないでください
> - `.env`ファイルは`.gitignore`に含まれています
> - `SATOKEN_SECRET`は暗号化されたGitHub Secretsで管理されています
