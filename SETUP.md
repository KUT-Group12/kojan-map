# こじゃんとやまっぷ (Kojan Map) - Setup Guide

## 環境変数の設定

セキュリティのため、機密情報は環境変数として管理します。

### 1. 環境変数ファイルの作成

```bash
cp .env.example .env
```

### 2. `.env`ファイルの編集

`.env`ファイルを開き、以下の値を設定してください：

```bash
# JWT Secret Key (必須)
# 強力なランダム文字列を生成してください
# 生成コマンド: openssl rand -base64 32
JWT_SECRET_KEY=your-actual-secret-key-here

# Google OAuth (必要に応じて)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### JWT_SECRET_KEYの生成

ターミナルで以下のコマンドを実行して、安全なシークレットキーを生成できます：

```bash
openssl rand -base64 32
```

出力された文字列を`.env`ファイルの`JWT_SECRET_KEY`に設定してください。

## Docker Composeでの起動

環境変数を設定した後、以下のコマンドでアプリケーションを起動します：

```bash
docker compose up -d
```

## アクセス

- **バックエンドAPI**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **フロントエンド**: http://localhost:5173

## 重要な注意事項

⚠️ **`.env`ファイルは絶対にGitにコミットしないでください！**

- `.env`は`.gitignore`に含まれています
- 代わりに`.env.example`をテンプレートとして使用してください
- 本番環境では、環境変数を安全に管理してください（AWS Secrets Manager、環境変数設定など）

## 開発時のヒント

### Swaggerドキュメントの再生成

APIドキュメントを更新した場合：

```bash
cd backend
~/go/bin/swag init
```

### GoDocの表示

```bash
cd backend
~/go/bin/godoc -http=:6060
```

ブラウザで http://localhost:6060/pkg/kojan-map/ にアクセス
