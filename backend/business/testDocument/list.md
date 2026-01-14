# テスト項目一覧

## 概要
事業者会員バックエンド（business）の単体テスト実装状況を記録します。テスト対象は主にService層とリポジトリのモック実装です。

## テスト実行コマンド

### 単体テスト実行
```bash
# 全単体テスト実行
go test ./... -v

# Service層のテスト
go test ./internal/service/impl -v

# Handler層のテスト
go test ./internal/api/handler -v
```

### カバレッジ確認
```bash
go test ./... -cover
```

**注:** 統合テストのコマンドは [integration-tests.md](integration-tests.md) を参照してください。

---

## Go 1.23 対応完了（2026年1月14日）

### バージョン指定
- **go.mod**: `go 1.23` に指定完了
- **Docker base image**: `golang:1.23-alpine` で確認済み

### 依存関係更新
| パッケージ | 変更 | 理由 | 状態 |
|----------|------|------|------|
| golang.org/x/oauth2 | v0.34.0 → v0.23.0 | v0.34.0がGo 1.24.0以上を必須 | ✅ ダウングレード完了 |

### テスト検証結果
```bash
# ローカルでの実行（Go 1.23）
$ go test ./... -v
✅ Service層: 41テスト PASS
✅ Handler層: 48テスト PASS
✅ 合計: 89テスト全て PASS

# Docker内での実行（golang:1.23-alpine）
$ docker run kojan-map-backend go test ./... -v
✅ 全89テスト PASS（確認済み）
```

### コード修正実施
- ✅ middleware/auth.go: 重複チェック（IsTokenRevoked）削除
- ✅ Dockerfile: 互換性確保（オリジナル状態維持）

---

## テスト実装状況

### 1. 認証サービス (AuthServiceImpl)

| テスト項目 | 内容 | ステータス | モック | 備考 |
|----------|------|---------|-------|------|
| GoogleAuth - 正常系 | 有効なIDトークンでMFAコード生成 | ✅ 実装 | oauth, mfa | SSOT M3-1 |
| GoogleAuth - 異常系 | 空のIDトークン→エラー返却 | ✅ 実装 | oauth, mfa | エラーハンドリング確認 |
| BusinessLogin - 正常系 | Gmail + MFA検証→JWT発行 | ✅ 実装 | mfa, jwt | SSOT M1-1 |
| BusinessLogin - 異常系 | MFA不一致→エラー | ✅ 実装 | mfa, jwt | エラーハンドリング確認 |
| Logout - 正常系 | JWT→ブラックリスト登録 | ✅ 実装 | jwt | SSOT M1-3-3 |
| Logout - 異常系 | 空トークン→エラー | ✅ 実装 | jwt | エラーハンドリング確認 |

**追加テスト候補:**
- Google OAuth署名検証（本実装後）
- MFA有効期限切れ検証
- JWT署名検証

---

### 2. 会員管理サービス (MemberServiceImpl)

| テスト項目 | 内容 | ステータス | モック | 備考 |
|----------|------|---------|-------|------|
| GetBusinessDetails - 正常系 | Google IDで会員情報取得 | ✅ 実装 | BusinessMemberRepo, AuthRepo | SSOT M3-2-2 |
| GetBusinessDetails - 異常系 | 空Google ID→エラー | ✅ 実装 | BusinessMemberRepo, AuthRepo | 入力値検証 |
| UpdateBusinessName - 正常系 | 事業者名更新成功 | ✅ 実装 | BusinessMemberRepo | SSOT M3-4-2 |
| UpdateBusinessName - 異常系 | 無効な businessID | ✅ 実装 | BusinessMemberRepo | バリデーション |
| UpdateBusinessName - 異常系 | 空名前→エラー | ✅ 実装 | BusinessMemberRepo | バリデーション |
| UpdateBusinessIcon - 正常系 | PNG画像アップロード | ✅ 実装 | BusinessMemberRepo | SSOT M3-5-2、MIME検証含む |
| UpdateBusinessIcon - 異常系 | 無効 businessID | ✅ 実装 | BusinessMemberRepo | バリデーション |
| UpdateBusinessIcon - 異常系 | 空画像→エラー | ✅ 実装 | BusinessMemberRepo | バリデーション |
| AnonymizeMember - 正常系 | 会員匿名化成功 | ✅ 実装 | BusinessMemberRepo | SSOT M3-3 |
| AnonymizeMember - 異常系 | 無効 businessID | ✅ 実装 | BusinessMemberRepo | バリデーション |

**追加テスト候補:**
- 権限チェック（自事業者のみ更新可能）
- 画像URL生成（Base64/署名付きURL）

---

### 3. 投稿管理サービス (PostServiceImpl)

| テスト項目 | 内容 | ステータス | モック | 備考 |
|----------|------|---------|-------|------|
| List - 正常系 | ビジネスIDで投稿一覧取得 | ✅ 実装 | PostRepo | SSOT M1-6-1 |
| List - 異常系 | 無効 businessID | ✅ 実装 | PostRepo | バリデーション |
| List - 異常系 | ゼロ businessID | ✅ 実装 | PostRepo | バリデーション |
| Get - 正常系 | 投稿詳細取得 + viewCount加算 | ✅ 実装 | PostRepo | SSOT M1-7-2 |
| Get - 異常系 | 無効 postID | ✅ 実装 | PostRepo | バリデーション |
| Get - 異常系 | ゼロ postID | ✅ 実装 | PostRepo | バリデーション |
| Create - 正常系 | 投稿新規作成 | ✅ 実装 | PostRepo | SSOT M1-8-4 |
| Create - 異常系 | 無効 businessID | ✅ 実装 | PostRepo | バリデーション |
| SetGenres - 正常系 | ジャンル多対多関連付け | ✅ 実装 | PostRepo | SSOT M1-8-4 |
| SetGenres - 異常系 | 無効 postID | ✅ 実装 | PostRepo | バリデーション |
| SetGenres - 異常系 | 空ジャンル | ✅ 実装 | PostRepo | バリデーション |
| Anonymize - 正常系 | 投稿内容匿名化 | ✅ 実装 | PostRepo | SSOT M1-13-2 |
| Anonymize - 異常系 | 無効 postID | ✅ 実装 | PostRepo | バリデーション |
| History - 正常系 | ユーザー投稿履歴取得 | ✅ 実装 | PostRepo | SSOT M1-14-2 |
| History - 異常系 | 空 googleID | ✅ 実装 | PostRepo | バリデーション |

**追加テスト候補:**
- MIME型検証（PNG/JPEG）
- ファイルサイズ制限（5MB）
- 所有者権限チェック
- ジャンルM:M実装（post_genre結合テーブル）

---

### 4. 統計サービス (StatsServiceImpl)

| テスト項目 | 内容 | ステータス | モック | 備考 |
|----------|------|---------|-------|------|
| GetTotalPosts - 正常系 | 投稿数合計取得 | ✅ 実装 | StatsRepo | SSOT M3-7-1 |
| GetTotalPosts - 異常系 | 無効 businessID | ✅ 実装 | StatsRepo | バリデーション |
| GetTotalPosts - エッジケース | ポスト数 0 | ✅ 実装 | StatsRepo | ゼロ値処理 |
| GetTotalReactions - 正常系 | リアクション数合計取得 | ✅ 実装 | StatsRepo | SSOT M3-7-2 |
| GetTotalReactions - 異常系 | 無効 businessID | ✅ 実装 | StatsRepo | バリデーション |
| GetTotalViews - 正常系 | ビュー数合計取得（SUM） | ✅ 実装 | StatsRepo | SSOT M3-7-3 |
| GetTotalViews - 異常系 | 無効 businessID | ✅ 実装 | StatsRepo | バリデーション |
| GetEngagementRate - 正常系 | エンゲージメント率計算 | ✅ 実装 | StatsRepo | SSOT M3-7-4 |
| GetEngagementRate - エッジケース | ポスト数 0→率 0 | ✅ 実装 | StatsRepo | ゼロ除算対策 |
| GetEngagementRate - 異常系 | 無効 businessID | ✅ 実装 | StatsRepo | バリデーション |

**追加テスト候補:**
- 複数ビジネスの独立性
- 論理削除フラグ（isActive）の扱い
- 匿名化投稿の集計除外

---

## モック実装ファイル

### internal/repository/mock/mock_repos.go

| モック | 実装機能 | 状態管理 |
|-------|--------|--------|
| MockAuthRepo | GetOrCreateUser, GetUserByID | メモリマップ |
| MockBusinessMemberRepo | Get, Update (name/icon/anonymize) | メモリマップ |
| MockPostRepo | List, Get, Create, Increment, Anonymize | メモリマップ（NextID自動採番） |
| MockStatsRepo | TotalPosts, TotalReactions, TotalViews, Engagement | 固定値返却 |
| MockBlockRepo | Create, Delete | メモリマップ |
| MockReportRepo | Create | スライス集計 |
| MockContactRepo | Create | スライス集計 |
| MockPaymentRepo | CreatePayment | ダミー実装 |

---

## テスト依存関係

### テスティングフレームワーク
- `github.com/stretchr/testify/assert` - アサーション（簡潔）
- `github.com/stretchr/testify/require` - 強制チェック（fatal）
- 標準 `testing` - テスト実行フレームワーク

### 対象パッケージ
- Service実装層: `internal/service/impl`
- Modelドメイン: `internal/domain`
- リポジトリモック: `internal/repository/mock`

---

### 5. Handler層 (HTTP API エンドポイント)

#### 5.1 認証ハンドラー (AuthHandler)

| テスト項目 | 内容 | ステータス | テスト件数 | 備考 |
|----------|------|---------|---------|------|
| GoogleAuth - 正常系 | 有効なGoogleAuth リクエスト | ✅ 実装 | 1 | SSOT M3-1 |
| GoogleAuth - 異常系 | 不正なリクエストボディ | ✅ 実装 | 1 | JSON検証 |
| BusinessLogin - 正常系 | Gmail + MFAコード検証 | ✅ 実装 | 1 | SSOT M1-1 |
| BusinessLogin - 異常系 | MFAコード省略 | ✅ 実装 | 1 | バリデーション |
| Logout - 正常系 | JWT トークン失効化 | ✅ 実装 | 1 | SSOT M1-3-3 |
| **小計** | | | **5** | |

#### 5.2 会員管理ハンドラー (MemberHandler)

| テスト項目 | 内容 | ステータス | テスト件数 | 備考 |
|----------|------|---------|---------|------|
| GetBusinessDetails - 正常系 | googleIdパラメータで取得 | ✅ 実装 | 1 | SSOT M1-2 |
| GetBusinessDetails - 異常系 | googleIdパラメータ省略 | ✅ 実装 | 1 | 入力検証 |
| GetMemberInfo - 正常系 | メンバー情報取得 | ✅ 実装 | 1 | 実装確認用 |
| UpdateBusinessName - 正常系 | 事業者名更新（認証必須） | ✅ 実装 | 1 | SSOT M3-4-2 |
| UpdateBusinessName - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| UpdateBusinessName - 異常系 | 不正なJSON | ✅ 実装 | 1 | JSON検証 |
| UpdateBusinessIcon - 正常系 | PNG画像アップロード | ✅ 実装 | 1 | SSOT M3-5-2 |
| UpdateBusinessIcon - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| UpdateBusinessIcon - 異常系 | ファイルなし | ✅ 実装 | 1 | エラーハンドリング |
| AnonymizeMember - 正常系 | 会員匿名化 | ✅ 実装 | 1 | SSOT M3-3 |
| AnonymizeMember - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| **小計** | | | **11** | |

#### 5.3 投稿ハンドラー (PostHandler)

| テスト項目 | 内容 | ステータス | テスト件数 | 備考 |
|----------|------|---------|---------|------|
| ListPosts - 正常系 | 投稿一覧取得（認証必須） | ✅ 実装 | 1 | SSOT M1-6-1 |
| ListPosts - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| GetPost - 正常系 | 投稿詳細取得 | ✅ 実装 | 1 | SSOT M1-7-2 |
| CreatePost - 正常系 | 投稿作成（認証必須） | ✅ 実装 | 1 | SSOT M1-8-4 |
| CreatePost - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| CreatePost - 異常系 | 不正なJSON | ✅ 実装 | 1 | JSON検証 |
| AnonymizePost - 正常系 | 投稿匿名化 | ✅ 実装 | 1 | SSOT M1-13-2 |
| GetPostHistory - 正常系 | 投稿履歴取得 | ✅ 実装 | 1 | SSOT M1-14-2 |
| **小計** | | | **9** | |

#### 5.4 ブロック・レポートハンドラー (BlockHandler, ReportHandler)

| テスト項目 | 内容 | ステータス | テスト件数 | 備考 |
|----------|------|---------|---------|------|
| CreateBlock - 正常系 | ユーザーブロック | ✅ 実装 | 1 | SSOT M1-9-2 |
| CreateBlock - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| CreateBlock - 異常系 | 不正なJSON | ✅ 実装 | 1 | JSON検証 |
| DeleteBlock - 正常系 | ブロック削除 | ✅ 実装 | 1 | SSOT M1-10-2 |
| DeleteBlock - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| CreateReport - 正常系 | 不正報告作成 | ✅ 実装 | 1 | SSOT M1-12-2 |
| CreateReport - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| CreateReport - 異常系 | 不正なJSON | ✅ 実装 | 1 | JSON検証 |
| **小計** | | | **8** | |

#### 5.5 お問い合わせハンドラー (ContactHandler)

| テスト項目 | 内容 | ステータス | テスト件数 | 備考 |
|----------|------|---------|---------|------|
| CreateContact - 正常系 | 問い合わせ作成 | ✅ 実装 | 1 | SSOT M1-11-2 |
| CreateContact - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| CreateContact - 異常系 | 不正なJSON | ✅ 実装 | 1 | JSON検証 |
| CreateContact - 異常系 | Subjectなし | ✅ 実装 | 1 | バリデーション |
| **小計** | | | **4** | |

#### 5.6 統計ハンドラー (StatsHandler)

| テスト項目 | 内容 | ステータス | テスト件数 | 備考 |
|----------|------|---------|---------|------|
| GetTotalPosts - 正常系 | 投稿数統計取得 | ✅ 実装 | 1 | SSOT M3-7-1 |
| GetTotalPosts - 異常系 | businessIdパラメータなし | ✅ 実装 | 1 | パラメータ検証 |
| GetTotalPosts - 異常系 | businessId不正 | ✅ 実装 | 1 | 型検証 |
| GetTotalReactions - 正常系 | リアクション数取得 | ✅ 実装 | 1 | SSOT M3-7-2 |
| GetTotalReactions - 異常系 | パラメータなし | ✅ 実装 | 1 | パラメータ検証 |
| GetTotalViews - 正常系 | ビュー数統計取得 | ✅ 実装 | 1 | SSOT M3-7-3 |
| GetTotalViews - 異常系 | パラメータなし | ✅ 実装 | 1 | パラメータ検証 |
| GetEngagementRate - 正常系 | エンゲージメント率計算 | ✅ 実装 | 1 | SSOT M3-7-4 |
| GetEngagementRate - 異常系 | パラメータなし | ✅ 実装 | 1 | パラメータ検証 |
| **小計** | | | **9** | |

#### 5.7 決済ハンドラー (PaymentHandler)

| テスト項目 | 内容 | ステータス | テスト件数 | 備考 |
|----------|------|---------|---------|------|
| CreateRedirect - 正常系 | Stripe リダイレクトURL生成 | ✅ 実装 | 1 | SSOT M1-15-3 |
| CreateRedirect - パラメータなし | businessId省略→400 | ✅ 実装 | 1 | パラメータ検証 |
| CreateRedirect - パラメータ不正 | businessId不正→400 | ✅ 実装 | 1 | 型検証 |
| CreateRedirect - 認証なし | Context なし→401 | ✅ 実装 | 1 | セキュリティ |
| **小計** | | | **4** | |

#### 5.8 ハンドラー層テスト集計

| カテゴリ | テスト件数 |
|---------|---------|
| 認証ハンドラー | 5 |
| 会員管理ハンドラー | 11 |
| 投稿ハンドラー | 9 |
| ブロック・レポート | 8 |
| お問い合わせ | 4 |
| 統計ハンドラー | 9 |
| 決済ハンドラー | 4 |
| **合計** | **50** |

---

## 本番環境対応チェックリスト（単体テスト分）

### デプロイ前確認事項
- [x] Go 1.23 対応完了
- [x] 全89単体テスト PASS
- [x] Docker イメージビルド成功
- [x] middleware セキュリティテスト実装
- [ ] ヘルスチェックエンドポイント実装
- [ ] エラーログ形式標準化

### セキュリティ確認
- [x] 認証なし→401エラー検証
- [x] JWT トークンブラックリスト実装
- [ ] HTTPS/TLS設定確認
- [ ] CORS設定確認
- [ ] レート制限設定

**注:** 統合テストと今後の拡張については [integration-tests.md](integration-tests.md) を参照してください。

---

## トラブルシューティング

### テスト実行時エラー
- `undefined: AuthServiceImpl` → 実装ファイルと同じディレクトリに テストファイルを配置
- `nil pointer dereference` → モック作成時に必要なリポジトリをすべて指定
- `import cycle` → 循環参照の確認、DIの設計見直し

### 単体テスト追加時のチェックリスト
- [ ] モック実装にメソッドを追加
- [ ] テスト関数名は `Test<タイプ><メソッド名>` の形式
- [ ] テーブルドリブンテスト（複数ケース）を使用
- [ ] 正常系と異常系を分離（`wantErr bool`）
- [ ] `setup` / `cleanup` 関数を用意（必要な場合）
