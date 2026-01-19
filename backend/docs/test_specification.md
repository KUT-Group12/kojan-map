# Admin Backend テスト項目表

## 概要

| カテゴリ | テストファイル数 | テストケース数 |
|---------|---------------|--------------|
| Service層 | 5 | 12 |
| Handler層 | 5 | 15 |
| **合計** | **10** | **27** |

---

## Service層テスト

### 1. AdminDashboardService（ダッシュボード）

| No | テスト関数 | テストケース | 確認内容 | 期待結果 |
|----|-----------|-------------|---------|---------|
| S-1 | TestAdminDashboardService_GetSummary | returns correct summary data | サマリーデータ構造体の各フィールド値 | 各統計値が正しくセットされること |

### 2. AdminReportService（通報管理）

| No | テスト関数 | テストケース | 確認内容 | 期待結果 |
|----|-----------|-------------|---------|---------|
| S-2 | TestAdminReportService_GetReports | returns paginated results with default values | page=0, pageSize=0 の場合のデフォルト値 | page=1, pageSize=20 |
| S-3 | TestAdminReportService_GetReports | enforces max page size | pageSize=150 の場合の制限 | pageSize=20（上限超過時デフォルト） |
| S-4 | TestAdminReportService_GetReports | accepts valid page size | pageSize=50 の場合 | pageSize=50（有効値はそのまま） |
| S-5 | TestAdminReportService_MarkAsHandled | validates report exists before marking | 存在しないレポートID=0 | エラー「report not found」 |
| S-6 | TestAdminReportService_MarkAsHandled | prevents double handling | 既に処理済みのレポート | エラー「report is already handled」 |

### 3. AdminBusinessService（事業者申請管理）

| No | テスト関数 | テストケース | 確認内容 | 期待結果 |
|----|-----------|-------------|---------|---------|
| S-7 | TestAdminBusinessService_ApproveApplication | rejects already processed application | status="approved" の申請 | エラー「application is already processed」 |
| S-8 | TestAdminBusinessService_ApproveApplication | accepts pending application | status="pending" の申請 | 正常処理可能 |
| S-9 | TestAdminBusinessService_RejectApplication | rejects already processed application | status="rejected" の申請 | エラー発生 |
| S-10 | TestBusinessApplicationResponse | formats response correctly | レスポンス構造体のフォーマット | 各フィールド値が正しいこと |

### 4. AdminUserService（ユーザー管理）

| No | テスト関数 | テストケース | 確認内容 | 期待結果 |
|----|-----------|-------------|---------|---------|
| S-11 | TestAdminUserService_GetUsers | returns paginated results with defaults | page=-1, pageSize=0 の場合 | page=1, pageSize=20 |
| S-12 | TestAdminUserService_DeleteUser | prevents deleting admin users | Role=admin のユーザー削除 | エラー「cannot delete admin users」 |
| S-13 | TestAdminUserService_DeleteUser | allows deleting regular users | Role=user のユーザー削除 | 削除可能（true） |
| S-14 | TestAdminUserService_DeleteUser | prevents double deletion | deletedAtが設定済みのユーザー | エラー「user is already deleted」 |
| S-15 | TestUserListResponse | formats response correctly | レスポンス構造体のフォーマット | Total, Page, Users が正しいこと |

### 5. AdminContactService（問い合わせ管理）

| No | テスト関数 | テストケース | 確認内容 | 期待結果 |
|----|-----------|-------------|---------|---------|
| S-16 | TestAdminContactService_ApproveInquiry | prevents double approval | askFlag=true（処理済み） | エラー「inquiry is already handled」 |
| S-17 | TestAdminContactService_ApproveInquiry | allows approving unhandled inquiry | askFlag=false（未処理） | 承認可能 |
| S-18 | TestAdminContactService_RejectInquiry | validates inquiry exists | inquiryID=0（存在しない） | エラー「inquiry not found」 |
| S-19 | TestAdminContactService_RejectInquiry | accepts valid inquiry ID | inquiryID=123 | 有効なID（>0） |
| S-20 | TestAdminContactService_GetInquiries | returns empty list when no inquiries | 問い合わせなしの場合 | 空リスト |

---

## Handler層テスト（HTTP エンドポイント）

### 1. AdminDashboardHandler

| No | テスト関数 | テストケース | HTTPリクエスト | 期待レスポンス |
|----|-----------|-------------|---------------|--------------|
| H-1 | TestAdminDashboardHandler_GetSummary | returns 200 OK for valid request | GET /api/admin/summary | 200 OK |

### 2. AdminReportHandler

| No | テスト関数 | テストケース | HTTPリクエスト | 期待レスポンス |
|----|-----------|-------------|---------------|--------------|
| H-2 | TestAdminReportHandler_GetReports | returns 200 OK with default pagination | GET /api/admin/reports | 200 OK |
| H-3 | TestAdminReportHandler_GetReports | accepts handled filter parameter | GET /api/admin/reports?handled=true | 200 OK |
| H-4 | TestAdminReportHandler_HandleReport | returns 400 for invalid report ID | PUT /api/admin/reports/invalid/handle | 400 Bad Request |
| H-5 | TestAdminReportHandler_HandleReport | returns 200 for valid report ID | PUT /api/admin/reports/123/handle | 200 OK |

### 3. AdminBusinessHandler

| No | テスト関数 | テストケース | HTTPリクエスト | 期待レスポンス |
|----|-----------|-------------|---------------|--------------|
| H-6 | TestAdminBusinessHandler_GetApplications | returns 200 OK with applications list | GET /api/admin/request | 200 OK |
| H-7 | TestAdminBusinessHandler_ApproveApplication | returns 400 for invalid application ID | PUT /api/applications/invalid/approve | 400 Bad Request |
| H-8 | TestAdminBusinessHandler_ApproveApplication | returns 200 for valid application ID | PUT /api/applications/1/approve | 200 OK |
| H-9 | TestAdminBusinessHandler_RejectApplication | returns 200 for valid rejection | PUT /api/applications/1/reject | 200 OK |

### 4. AdminUserHandler

| No | テスト関数 | テストケース | HTTPリクエスト | 期待レスポンス |
|----|-----------|-------------|---------------|--------------|
| H-10 | TestAdminUserHandler_GetUsers | returns 200 OK with user list | GET /api/users | 200 OK |
| H-11 | TestAdminUserHandler_GetUsers | accepts pagination parameters | GET /api/users?page=2&pageSize=50 | 200 OK |
| H-12 | TestAdminUserHandler_DeleteUser | returns 400 for empty user ID | POST /internal/users/ | 404 Not Found |
| H-13 | TestAdminUserHandler_DeleteUser | returns 200 for valid user ID | POST /internal/users/user-123 | 200 OK |

### 5. AdminContactHandler

| No | テスト関数 | テストケース | HTTPリクエスト | 期待レスポンス |
|----|-----------|-------------|---------------|--------------|
| H-14 | TestAdminContactHandler_GetInquiries | returns 200 OK with inquiries list | GET /internal/asks | 200 OK |
| H-15 | TestAdminContactHandler_ApproveInquiry | returns 400 for invalid request ID | POST /internal/requests/invalid/approve | 400 Bad Request |
| H-16 | TestAdminContactHandler_ApproveInquiry | returns 200 for valid request ID | POST /internal/requests/123/approve | 200 OK |
| H-17 | TestAdminContactHandler_RejectInquiry | returns 200 for valid rejection | POST /internal/requests/123/reject | 200 OK |

---

## テスト実行コマンド

```bash
# 全テスト実行
go test ./... -v

# カバレッジ付き
go test ./... -cover

# 特定パッケージのみ
go test ./admin/service/... -v
go test ./admin/handler/... -v
```
