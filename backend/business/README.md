# Business Backend

こじゃんとやまっぷの事業者会員用バックエンドです。

## 📁 ディレクトリ構成

```
business/
├── cmd/
│   └── main.go              # アプリケーションエントリーポイント
├── internal/
│   ├── api/                 # APIエンドポイントハンドラー
│   ├── domain/              # ドメインモデルと型定義
│   │   ├── auth.go
│   │   ├── business_member.go
│   │   ├── post.go
│   │   ├── block.go
│   │   ├── report.go
│   │   ├── contact.go
│   │   ├── withdrawal.go
│   │   └── statistics.go
│   ├── service/             # ビジネスロジック層
│   ├── repository/          # データベースアクセス層
│   └── middleware/          # Ginミドルウェア
├── pkg/
│   ├── errors/              # エラーハンドリング
│   ├── logger/              # ログ出力
│   └── response/            # レスポンスヘルパー
├── go.mod                   # Go モジュール定義
├── go.sum                   # 依存関係チェックサム
└── Dockerfile               # Docker イメージ定義
```

## 🚀 クイックスタート

### 前提条件
- Go 1.23+
- PostgreSQL 14+

### 開発環境の構築

```bash
# 依存関係のインストール
go mod download

# ビルド
go build -o bin/business ./cmd/main.go

# 実行
./bin/business
```

### 環境変数設定

```bash
# データベース接続文字列
export DATABASE_URL="host=localhost user=postgres password=postgres dbname=kojan_map port=5432 sslmode=disable"

# ポート設定（デフォルト: 8080）
export PORT=8080
```

## 📋 仕様

このバックエンドは SSOT（Single Source of Truth）の仕様に基づいて実装されています。

参照: [SSOT - Business Members Definition](../../SSOT/ssot-app/src/data/definitions/business.ts)

### 実装予定モジュール

**Phase 1: プロジェクト構造（完了）**
- ディレクトリ構造の整備
- ドメインモデルの定義
- エラーハンドリング共通化
- ログ出力基盤

**Phase 2: 認証関連**
- Google認証 (`POST /api/auth/google`)
- ビジネスログイン (`POST /api/auth/business/login`)
- ログアウト (`POST /api/auth/logout`)

**Phase 3: 会員情報管理**
- 事業者情報取得 (`GET /api/business/mypage/details`)
- 会員情報取得 (`GET /api/business/member`)
- 事業者名更新 (`PUT /api/business/member/name`)
- 事業者アイコン更新 (`PUT /api/business/member/icon`)
- 会員情報匿名化 (`PUT /api/business/member/anonymize`)

**Phase 4: ダッシュボード機能**
- 総投稿数取得 (`GET /api/business/post/total`)
- 総リアクション数取得 (`GET /api/business/reaction/total`)
- 総閲覧数取得 (`GET /api/business/view/total`)
- エンゲージメント率取得 (`GET /api/business/engagement`)

**Phase 5: 投稿管理機能**
- 投稿一覧取得 (`GET /api/business/posts`)
- 投稿作成 (`POST /api/posts`)
- 投稿詳細取得 (`GET /api/posts/{postId}`)
- 投稿匿名化 (`PUT /api/posts/anonymize`)
- 投稿履歴取得 (`GET /api/posts/history`)

**Phase 6: ユーザー操作機能**
- ブロック登録 (`POST /api/block`)
- ブロック解除 (`DELETE /api/block`)
- 通報登録 (`POST /api/report`)

**Phase 7: 追加機能**
- Stripe連携 (`POST /api/business/stripe/redirect`)
- 問い合わせ送信 (`POST /api/contact`)
- 退会処理 (`POST /api/member/withdrawal`)

## 🏛️ アーキテクチャ

### レイヤー構成

- **API Layer** (`internal/api/`): HTTP リクエストの処理
- **Service Layer** (`internal/service/`): ビジネスロジック実装
- **Repository Layer** (`internal/repository/`): データベースアクセス
- **Domain Layer** (`internal/domain/`): ドメインモデルと型定義

### エラーハンドリング

すべてのエラーは統一形式で返却されます：

```json
{
  "errorCode": "ERROR_CODE",
  "message": "詳細なエラーメッセージ"
}
```

## 🐳 Docker での実行

```bash
# イメージのビルド
docker build -t kojan-map-business .

# コンテナの実行
docker run -e DATABASE_URL="..." -p 8080:8080 kojan-map-business
```

## 📝 開発時の注意事項

1. **SSOT仕様の厳守**: すべてのエンドポイントはSSOT仕様に従う必要があります
2. **ビジネスルール**: `rules` に記載されたビジネスルールを実装に反映させてください
3. **日時形式**: すべての日時は ISO 8601 形式（JST, UTC+9）で返却してください
4. **エラーコード**: 定義されたエラーコードを使用してください
5. **バリデーション**: リクエストデータは必ずバリデーションしてください

## 📚 参考資料

- [SSOT Specification](../../SSOT/spec.md)
- [Gin Documentation](https://gin-gonic.com/)
- [GORM Documentation](https://gorm.io/)
