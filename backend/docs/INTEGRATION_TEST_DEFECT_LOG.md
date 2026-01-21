# バックエンド全体 統合テスト障害処理表

**作成日**: 2026年1月21日  
**最終更新**: 2026年1月21日

---

## 📋 表の見方

| 項目 | 説明 |
|-----|-----|
| 管理番号 | 障害を一意に識別する番号（ER-XXX） |
| テスト項目管理番号 | 関連するテスト項目の番号（INTEGRATION_TEST_SPECIFICATION.md参照） |
| バックエンド | 障害が発生したバックエンド（User / Admin / Business） |
| モジュール名 | 問題が発生したモジュール（パッケージ・ファイル） |
| 障害状況 | 発生した障害の具体的内容 |
| 障害対処内容 | 実施した/すべき対処方法 |
| 対応状況 | 🔴 未対応 / 🟡 対応中 / 🟢 対応完了 |
| 備考 | 関連項目への対策、次工程への提言など |
| トラブル分類 | 1:設計バグ, 2:製造バグ, 3:改造バグ, 4:DB/OSバグ, 5:環境/HWバグ, 6:手順バグ, 7:提供データ誤り, 8:誤操作, 9:その他 |
| バグ混入工程 | 1:要求分析, 2:システム提案, 3:外部設計, 4:内部設計, 5:製造, 6:単体テスト, 7:結合テスト, 8:総合テスト, 9:移行, 10:運用, 11:その他 |
| 摘出すべき工程 | 1:要求分析, 2:システム提案, 3:外部設計, 4:内部設計, 5:製造, 6:単体テスト, 7:結合テスト, 8:総合テスト, 9:移行, 10:運用, 11:その他 |
| 摘出遅延理由 | 1:設計レビュ漏れ, 2:仕様書訂正漏れ, 3:仕様書解釈誤り, 4:ソースコードレビュ漏れ, 5:テスト漏れ, 6:改修誤り, 7:ユーザ調節漏れ, 8:ユーザ調節誤り, 9:仕様変更, 10:杜撰なバグ管理, 11:その他 |

---

## 🐛 障害一覧

### 統計サマリー

| 状態 | 件数 |
|-----|------|
| 🔴 未対応 | 2 |
| 🟡 対応中 | 0 |
| 🟢 対応完了 | 1 |
| **合計** | **3** |

---

## Business バックエンド統合テスト

### ER-015: 統合テストルーターに認証ミドルウェアが未設定

| 項目 | 内容 |
|-----|------|
| 管理番号 | ER-015 |
| テスト項目管理番号 | BIZ-INT-001 (POST-001), BIZ-INT-002 (POST-004), BIZ-INT-003 (REPORT-001) |
| バックエンド | Business（事業者会員） |
| モジュール名 | `backend/business/internal/api/integration_test.go` |
| 障害状況 | 統合テストの `setupTestRouter()` 関数で作成したGinルーターに認証ミドルウェアが設定されていないため、JWTトークンを含むリクエストでも401 Unauthorizedエラーが発生する。<br><br>**具体的なエラー**:<br>- POST /business/posts → 401<br>- POST /business/reports → 401<br><br>**原因**: テストルーター設定時に、本番環境で使用している認証ミドルウェア（JWTトークン検証、contextへのユーザーID/事業者ID注入）が含まれていない |
| 障害対処内容 | **対処方法**:<br>1. `setupTestRouter()` 内でGinのミドルウェアチェーンに認証ミドルウェアを追加<br>2. JWTトークンをAuthorizationヘッダーから抽出<br>3. トークンを検証してユーザーIDと事業者IDを取得<br>4. `contextkeys.WithUserID()` と `contextkeys.WithBusinessID()` でcontextに値を設定<br>5. 次のハンドラーに処理を渡す<br><br>**実装例**:<br>```go<br>func setupTestRouter(...) *gin.Engine {<br>    router := gin.Default()<br>    <br>    // 認証ミドルウェア追加<br>    router.Use(func(c *gin.Context) {<br>        authHeader := c.GetHeader("Authorization")<br>        if authHeader == "" {<br>            c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})<br>            return<br>        }<br>        <br>        token := strings.TrimPrefix(authHeader, "Bearer ")<br>        claims, err := jwt.ParseToken(token)<br>        if err != nil {<br>            c.AbortWithStatusJSON(401, gin.H{"error": "invalid token"})<br>            return<br>        }<br>        <br>        ctx := contextkeys.WithUserID(c.Request.Context(), claims.UserID)<br>        ctx = contextkeys.WithBusinessID(ctx, claims.BusinessID)<br>        c.Request = c.Request.WithContext(ctx)<br>        c.Next()<br>    })<br>    <br>    // ルート設定...<br>}<br>``` |
| 対応状況 | 🔴 **未対応** |
| 備考 | **影響範囲**:<br>- BIZ-INT-001: 投稿作成テスト（FAIL）<br>- BIZ-INT-002: 位置情報保存テスト（FAIL）<br>- BIZ-INT-003: 通報作成テスト（FAIL）<br><br>**優先度**: 🔥 **高** - 統合テストの33%（3/6件）が失敗中<br><br>**次工程への提言**:<br>- 統合テスト作成時は、本番環境と同じミドルウェアスタックを再現すること<br>- 認証が必要なエンドポイントのテストでは、必ず認証フローも含めてテストすること<br>- テストルーター設定を共通化し、本番ルーター設定との差異を最小化すること |
| トラブル分類 | 5（テスト漏れ） |
| バグ混入工程 | 7（結合テスト） |
| 摘出すべき工程 | 7（結合テスト） |
| 摘出遅延理由 | 5（テスト漏れ） |

---

### ER-016: business_requests テーブル未存在

| 項目 | 内容 |
|-----|------|
| 管理番号 | ER-016 |
| テスト項目管理番号 | BIZ-INT-004 (BIZ-001) |
| バックエンド | Business（事業者会員） |
| モジュール名 | `backend/business/internal/api/integration_test.go`, データベーススキーマ |
| 障害状況 | 事業者申請作成の統合テスト（BIZ-001）実行時に、`business_requests` テーブルが存在しないため、テストがスキップされる。<br><br>**具体的なエラー**:<br>```<br>--- SKIP: TestIntegration_BIZ001_BusinessRequest (0.07s)<br>    integration_test.go:290: business_requests テーブルが存在しないためスキップ<br>```<br><br>**原因**: <br>1. `kojanmap_dump.sql` に `business_requests` テーブル定義が含まれていない<br>2. Business バックエンドのドメインモデルには `BusinessRequest` が存在<br>3. Admin バックエンドで事業者申請管理機能が存在する可能性がある（確認が必要） |
| 障害対処内容 | **調査項目**:<br>1. Admin バックエンドのコードを確認し、事業者申請管理機能の実装状況を確認<br>2. 事業者申請の管理責任がAdmin/Businessのどちらにあるか確認<br>3. `business_requests` テーブルが必要か、または `business_members` テーブルで代替可能か確認<br><br>**対処方法（ケース1: テーブルが必要な場合）**:<br>1. `business_requests` テーブルをマイグレーションで作成<br>2. `kojanmap_dump.sql` にテーブル定義を追加<br>3. 統合テストを再実行<br><br>**テーブル定義例**:<br>```sql<br>CREATE TABLE business_requests (<br>    requestId INT PRIMARY KEY AUTO_INCREMENT,<br>    userId INT NOT NULL,<br>    businessName VARCHAR(255) NOT NULL,<br>    description TEXT,<br>    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',<br>    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br>    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,<br>    FOREIGN KEY (userId) REFERENCES user(userId)<br>);<br>```<br><br>**対処方法（ケース2: テーブルが不要な場合）**:<br>1. BIZ-INT-004 テストを削除または無効化<br>2. 事業者申請機能の仕様を明確化<br>3. ドキュメントに「事業者申請はAdmin側で管理」と明記 |
| 対応状況 | 🔴 **未対応** |
| 備考 | **影響範囲**:<br>- BIZ-INT-004: 事業者申請作成テスト（SKIP）<br><br>**優先度**: 🟡 **中** - テストがスキップされているが、他の機能には影響なし<br><br>**次工程への提言**:<br>- 設計段階でテーブル定義とドメインモデルの整合性を確認すること<br>- Admin/Business間の責任分界を明確化すること<br>- データベーススキーマをバージョン管理し、マイグレーションツールを使用すること |
| トラブル分類 | 1（設計バグ） |
| バグ混入工程 | 4（内部設計） |
| 摘出すべき工程 | 7（結合テスト） |
| 摘出遅延理由 | 1（設計レビュ漏れ） |

---

### ER-017: place テーブルの外部キー制約エラー（対応完了）

| 項目 | 内容 |
|-----|------|
| 管理番号 | ER-017 |
| テスト項目管理番号 | BIZ-INT-001 (POST-001), BIZ-INT-002 (POST-004) |
| バックエンド | Business（事業者会員） |
| モジュール名 | `backend/business/internal/api/integration_test.go`, データベーススキーマ |
| 障害状況 | 投稿作成時に `post.placeId` が外部キーとして `place.placeId` を参照しているが、テストデータベースに `place` テーブルのレコードが存在しないため、外部キー制約エラーが発生していた。<br><br>**具体的なエラー**:<br>```<br>Error 1452: Cannot add or update a child row: a foreign key constraint fails<br>(`kojanmap_test`.`post`, CONSTRAINT `post_ibfk_1` FOREIGN KEY (`placeId`) REFERENCES `place` (`placeId`))<br>```<br><br>**原因**: `kojanmap_dump.sql` には `place` テーブル定義は含まれているが、テストデータが含まれていなかった |
| 障害対処内容 | **実施した対処**:<br>1. 統合テスト実行前に `place` テーブルにテストデータを挿入<br>2. `run_all_tests.sh` スクリプトに以下のコマンドを追加:<br>```bash<br>docker exec kojan-map-db-1 mysql -uroot -proot kojanmap_test -e \<br>  "INSERT IGNORE INTO place (placeId, numPost, latitude, longitude) \<br>   VALUES (1, 0, 35.6895, 139.6917);"<br>```<br>3. `INSERT IGNORE` を使用することで、データが既に存在する場合はエラーを回避<br><br>**挿入したテストデータ**:<br>- placeId: 1<br>- numPost: 0<br>- latitude: 35.6895（東京駅付近）<br>- longitude: 139.6917（東京駅付近） |
| 対応状況 | 🟢 **対応完了** (2026年1月21日) |
| 備考 | **影響範囲**:<br>- すべての投稿作成テスト<br>- 位置情報保存テスト<br><br>**優先度**: 🔥 **高** → 🟢 対応完了<br><br>**学んだ教訓**:<br>- 外部キー制約があるテーブルは、参照先のテストデータを必ず事前に準備すること<br>- `kojanmap_dump.sql` にはテストデータも含めることを検討すること<br>- 統合テストのセットアップフェーズで、必要なマスターデータを確認すること |
| トラブル分類 | 7（提供データ誤り） |
| バグ混入工程 | 7（結合テスト） |
| 摘出すべき工程 | 7（結合テスト） |
| 摘出遅延理由 | 5（テスト漏れ） |

---

## User バックエンド統合テスト

_現時点で統合テストが未実装のため、障害レコードなし_

---

## Admin バックエンド統合テスト

_現時点で統合テストが未実装のため、障害レコードなし_

---

## 📈 障害傾向分析

### トラブル分類別集計

| 分類 | 件数 | 割合 |
|-----|------|------|
| 1: 設計バグ | 1 | 33% |
| 5: テスト漏れ | 1 | 33% |
| 7: 提供データ誤り | 1 | 33% |

### バグ混入工程別集計

| 工程 | 件数 | 割合 |
|-----|------|------|
| 4: 内部設計 | 1 | 33% |
| 7: 結合テスト | 2 | 67% |

### 摘出遅延理由別集計

| 理由 | 件数 | 割合 |
|-----|------|------|
| 1: 設計レビュ漏れ | 1 | 33% |
| 5: テスト漏れ | 2 | 67% |

---

## 🎯 改善アクション

### 即時対応が必要な項目

1. **ER-015**: Business統合テストの認証ミドルウェア実装
   - 担当: バックエンドチーム
   - 期限: 1週間以内
   - 影響: 統合テストの50%が失敗中

### 調査が必要な項目

1. **ER-016**: business_requests テーブルの必要性確認
   - 担当: アーキテクト、Admin/Businessチーム
   - 期限: 1週間以内
   - 影響: 事業者申請機能の実装方針に影響

### 予防策

1. **統合テスト作成時のチェックリスト**:
   - [ ] 本番環境と同じミドルウェアスタックを使用しているか
   - [ ] 外部キー制約のあるテーブルの参照先データは準備されているか
   - [ ] テーブル定義とドメインモデルが一致しているか
   - [ ] 認証が必要なエンドポイントは認証フローも含めてテストされているか

2. **設計レビュー強化**:
   - テーブル定義とドメインモデルの整合性を確認
   - Admin/Business間の責任分界を明確化
   - データベーススキーマをバージョン管理

3. **テストデータ管理**:
   - `kojanmap_dump.sql` にテストデータを含めることを検討
   - マスターデータの事前準備を自動化
   - 外部キー制約のあるテーブルのテストデータを漏れなく準備

---

## 📚 参考資料

- [INTEGRATION_TEST_SPECIFICATION.md](./INTEGRATION_TEST_SPECIFICATION.md) - 統合テスト項目表
- [COMPREHENSIVE_TEST_REPORT.md](../COMPREHENSIVE_TEST_REPORT.md) - バックエンド全体テスト結果
- [business/testDocument/er.md](../business/testDocument/er.md) - Business単体テスト障害処理表
- [run_all_tests.sh](../run_all_tests.sh) - 自動テスト実行スクリプト
