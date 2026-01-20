# 統合テスト & 今後の拡張

## 概要
本ドキュメントは以下を管理します：
- Repository層の統合テスト（実DB使用）
- 全層統合テスト
- 今後実装予定のテスト項目
- パフォーマンステスト

---

## 統合テスト実行コマンド

### Repository層統合テスト（実DB使用）
```bash
# 統合テストのみ実行（ローカルDB接続必須）
go test -tags=integration ./internal/repository/impl -v

# 環境変数例
export DATABASE_URL="root:root@tcp(localhost:3306)/kojanmap?parseTime=true&charset=utf8mb4&loc=Local"
go test -tags=integration ./... -v
```

### 全層統合テスト
```bash
# API層〜DB層の全層テスト（実サーバー起動）
go test -tags=integration ./... -v
```

### カバレッジ測定（統合テスト含む）
```bash
go test -tags=integration ./... -cover
```

---

## 統合テスト実装予定項目

### 優先度: 高

#### Middleware層の統合テスト
- JWT検証ミドルウェア
  - 正常なトークン→認証成功
  - 無効なトークン→401エラー
  - トークンブラックリスト検証
  - Context注入確認

- CORS ミドルウェア
  - 許可オリジンからのリクエスト→成功
  - 非許可オリジンからのリクエスト→403エラー
  - プリフライトリクエスト（OPTIONS）処理

#### Google OAuth本実装後のテスト
- Google IDトークン署名検証
- トークン有効期限チェック
- ユーザー情報取得・キャッシング

#### 権限チェックテスト
- 自事業者のみが自身の投稿を編集可能
- 他事業者投稿への書き込み禁止
- 管理者権限の検証

#### ジャンルM:M実装テスト
- post_genre結合テーブル操作
- 複数ジャンル関連付け
- ジャンル削除時の連鎖削除（またはCASCADE）

---

### 優先度: 中

#### 全層統合テスト（API層 + DB層）
- Service層 + 実DB + Repository実装のテスト
- トランザクション処理の確認
- データの永続性検証

#### 並行処理テスト
- Race condition検出
```bash
go test -race ./... -v
```

- 同時アクセス下のデータ整合性
- ロック機構の確認

#### ストレステスト
- 大量投稿シナリオ（1000+件）
- 高アクセス負荷（100 req/sec+）
- メモリ・CPU リソース監視

#### エラーハンドリングの詳細テスト
- DB接続エラーハンドリング
- タイムアウトエラー処理
- カスタムエラーレスポンス検証

---

### 優先度: 低

#### パフォーマンスベンチマークテスト
```bash
# ベンチマーク実行
go test -bench=. -benchmem ./internal/service/impl

# プロファイリング
go test -cpuprofile=cpu.prof -memprofile=mem.prof ./...
go tool pprof cpu.prof
```

#### Swagger/OpenAPI自動生成テスト
- ハンドラーから自動生成されたスキーマの検証
- エンドポイント定義の完全性確認

#### CI/CD パイプライン統合テスト
- GitHub Actions での自動テスト実行
- ビルド・テスト・デプロイの自動化
- コード品質メトリクス収集

---

## Repository層統合テスト実装方法

### テストセットアップ

```bash
# テストDB初期化スクリプト（schema.sql）
CREATE DATABASE IF NOT EXISTS kojanmap_test;
USE kojanmap_test;

-- 本番スキーマと同じテーブル構造
CREATE TABLE business_members (
    business_id INT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    business_name VARCHAR(255),
    ...
);

-- その他テーブル定義
```

### テストコード例

```go
// +build integration

package impl

import (
    "database/sql"
    "testing"
    _ "github.com/go-sql-driver/mysql"
)

func setupTestDB(t *testing.T) *sql.DB {
    db, err := sql.Open("mysql", 
        "root:root@tcp(localhost:3306)/kojanmap_test")
    if err != nil {
        t.Fatalf("failed to connect test database: %v", err)
    }
    return db
}

func TestBusinessMemberRepository_Create(t *testing.T) {
    db := setupTestDB(t)
    defer db.Close()
    
    repo := NewBusinessMemberRepository(db)
    
    // テスト実行
    member, err := repo.Create(...)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    
    // DB検証
    var stored *BusinessMember
    // ... 実DBから読み込んで検証
}
```

---

## 本番環境対応チェックリスト（統合テスト分）

### Dockerfile最終テスト（CI/CD環境）
- [ ] マルチステージビルド最適化
- [ ] レイヤーキャッシング効率確認
- [ ] イメージサイズ最小化

### 環境変数設定ガイド
- [ ] DATABASE_URL フォーマット仕様書
- [ ] SERVICES 環境変数説明
- [ ] ローカル/本番環境での設定例

### SQL インジェクション対策確認
- [ ] プリペアドステートメント使用確認
- [ ] ユーザー入力のサニタイズ検証

### パフォーマンス確認
- [ ] ベンチマークテスト実施（1000 TPS以上）
- [ ] メモリリーク検査（pprof）
- [ ] データベース接続プーリング設定

### ドキュメント
- [ ] API 仕様書（OpenAPI/Swagger）
- [ ] デプロイメント手順書（本番DB初期化含む）
- [ ] 運用ガイドライン（ログ監視、アラート設定）

---

## 推奨テスト実行順序

1. **開発時（毎コミット）**
   ```bash
   go test ./... -v
   ```

2. **PR前（統合テスト含む）**
   ```bash
   go test -tags=integration ./... -v
   go test -race ./... -v
   ```

3. **本番デプロイ前**
   ```bash
   go test -tags=integration ./... -cover
   go test -bench=. -benchmem ./...
   ```

---

## トラブルシューティング（統合テスト）

### テストDB接続エラー
- MySQL サーバーが起動しているか確認
- DATABASE_URL が正しいか確認
- テストDB が存在するか確認

### レースコンディション検出
- `-race` フラグを付けてテスト
- 同時アクセス制御の見直し
- ロック機構の追加検討

### ベンチマーク性能不足
- DB インデックスの確認
- クエリの最適化
- 接続プーリング設定の調整

---

## 参考資料

- [Go testing package](https://golang.org/pkg/testing/)
- [Go 統合テストベストプラクティス](https://golang.org/doc/code)
- [testify/suite ドキュメント](https://pkg.go.dev/github.com/stretchr/testify/suite)
