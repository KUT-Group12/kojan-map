# 一般会員（User）バックエンド API 仕様書

このドキュメントは、SSOT（Single Source of Truth）に基づいた一般会員向けバックエンド APIの仕様を記載しています。

## 🌐 ベースURL
```
http://localhost:8080
```

## 📋 エンドポイント一覧

### 認証関連

#### ログイン・登録
- **エンドポイント**: `POST /api/users/register`
- **説明**: Google認証でユーザーを登録またはログイン
- **リクエスト**:
```json
{
  "googleId": "string",
  "gmail": "string"
}
```
- **レスポンス**:
```json
{
  "sessionId": "string"
}
```

#### ログアウト
- **エンドポイント**: `PUT /api/auth/logout`
- **説明**: ログアウト処理
- **リクエスト**:
```json
{
  "sessionId": "string"
}
```
- **レスポンス**:
```json
{
  "sessionId": "string"
}
```

#### 退会
- **エンドポイント**: `PUT /api/auth/withdrawal`
- **説明**: ユーザー退会処理
- **リクエスト**:
```json
{
  "googleId": "string"
}
```
- **レスポンス**:
```json
{
  "message": "user deleted"
}
```

### ユーザー情報

#### 会員情報取得
- **エンドポイント**: `GET /api/member/info`
- **説明**: 会員情報を取得
- **クエリパラメータ**: `googleId`
- **レスポンス**:
```json
{
  "gmail": "string",
  "role": "string",
  "registrationDate": "timestamp"
}
```

#### マイページ詳細情報取得
- **エンドポイント**: `GET /api/mypage/details`
- **説明**: マイページ用の詳細情報を取得
- **クエリパラメータ**: `googleId`
- **レスポンス**:
```json
{
  "gmail": "string",
  "role": "string",
  "registrationDate": "timestamp"
}
```

### 投稿関連

#### 投稿一覧取得
- **エンドポイント**: `GET /api/posts`
- **説明**: 投稿一覧を取得（新着順）
- **レスポンス**:
```json
{
  "posts": [
    {
      "postId": 1,
      "placeId": 1,
      "genreId": 1,
      "userId": "string",
      "title": "string",
      "text": "string",
      "postImage": "string",
      "numView": 0,
      "numReaction": 0,
      "postData": "timestamp",
      "isAnonymized": false
    }
  ]
}
```

#### 投稿詳細取得
- **エンドポイント**: `GET /api/posts/detail`
- **説明**: 投稿詳細を取得（閲覧数カウント）
- **クエリパラメータ**: `postId`
- **レスポンス**: Post オブジェクト

#### 投稿作成
- **エンドポイント**: `POST /api/posts`
- **説明**: 新しい投稿を作成
- **リクエスト**:
```json
{
  "placeId": 1,
  "genreId": 1,
  "userId": "string",
  "title": "string",
  "text": "string",
  "postImage": "string"
}
```
- **レスポンス**:
```json
{
  "postId": 1
}
```

#### 投稿匿名化（削除）
- **エンドポイント**: `PUT /api/posts/anonymize`
- **説明**: 投稿を匿名化（削除）
- **リクエスト**:
```json
{
  "postId": 1
}
```
- **レスポンス**:
```json
{
  "message": "post anonymized"
}
```

#### 投稿履歴取得
- **エンドポイント**: `GET /api/posts/history`
- **説明**: ユーザーの投稿履歴を取得
- **クエリパラメータ**: `googleId`
- **レスポンス**:
```json
{
  "posts": [Post]
}
```

#### ピンサイズ判定
- **エンドポイント**: `GET /api/posts/pin/scale`
- **説明**: 投稿数が50以上か判定
- **クエリパラメータ**: `postId`
- **レスポンス**:
```json
{
  "pinSize": 1.0 or 1.3
}
```

#### リアクション追加
- **エンドポイント**: `POST /api/posts/reaction`
- **説明**: 投稿にリアクション（トグル）
- **リクエスト**:
```json
{
  "postId": 1,
  "userId": "string"
}
```
- **レスポンス**:
```json
{
  "message": "reaction added"
}
```

#### リアクション履歴取得
- **エンドポイント**: `GET /api/posts/history/reactions`
- **説明**: ユーザーのリアクション履歴を取得
- **クエリパラメータ**: `googleId`
- **レスポンス**:
```json
{
  "posts": [Post]
}
```

### 検索機能

#### キーワード検索
- **エンドポイント**: `GET /api/posts/search`
- **説明**: キーワードで投稿を検索
- **クエリパラメータ**: `keyword`
- **レスポンス**:
```json
{
  "posts": [Post]
}
```

#### ジャンル検索
- **エンドポイント**: `GET /api/posts/search/genre`
- **説明**: ジャンルで投稿を検索
- **クエリパラメータ**: `genreId`
- **レスポンス**:
```json
{
  "posts": [Post]
}
```

#### 期間検索
- **エンドポイント**: `GET /api/posts/search/period`
- **説明**: 期間で投稿を検索
- **クエリパラメータ**: `startDate`, `endDate` (YYYY-MM-DD)
- **レスポンス**:
```json
{
  "posts": [Post]
}
```

### ブロック機能

#### ユーザーをブロック
- **エンドポイント**: `POST /api/users/block`
- **説明**: ユーザーをブロック
- **リクエスト**:
```json
{
  "userId": "string",
  "blockerId": "string"
}
```
- **レスポンス**:
```json
{
  "message": "user blocked"
}
```

#### ブロック解除
- **エンドポイント**: `DELETE /api/users/block`
- **説明**: ユーザーのブロック解除
- **リクエスト**:
```json
{
  "userId": "string",
  "blockerId": "string"
}
```
- **レスポンス**:
```json
{
  "message": "user unblocked"
}
```

#### ブロックリスト取得
- **エンドポイント**: `GET /api/users/block/list`
- **説明**: ブロックリストを取得
- **クエリパラメータ**: `googleId`
- **レスポンス**:
```json
{
  "blocks": [
    {
      "id": 1,
      "userId": "string",
      "blockerId": "string"
    }
  ]
}
```

### 通報機能

#### 通報を送信
- **エンドポイント**: `POST /api/report`
- **説明**: 投稿を通報
- **リクエスト**:
```json
{
  "userId": "string",
  "postId": 1,
  "reason": "string"
}
```
- **レスポンス**:
```json
{
  "message": "report created"
}
```

### 問い合わせ機能

#### 問い合わせを送信
- **エンドポイント**: `POST /api/contact/validate`
- **説明**: 問い合わせを送信
- **リクエスト**:
```json
{
  "subject": "string",
  "text": "string"
}
```
- **レスポンス**:
```json
{
  "message": "contact created"
}
```

### 事業者申請

#### 事業者申請を送信
- **エンドポイント**: `POST /api/business/application`
- **説明**: 事業者申請を送信
- **リクエスト**:
```json
{
  "userId": "string",
  "businessName": "string",
  "address": "string",
  "phone": "string"
}
```
- **レスポンス**:
```json
{
  "message": "business application created"
}
```

## 🗄️ データベーススキーマ

### users テーブル
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  google_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_google_id (google_id),
  KEY idx_email (email)
);
```

### posts テーブル
```sql
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  genre_id INT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  text LONGTEXT,
  post_image LONGTEXT,
  num_view INT DEFAULT 0,
  num_reaction INT DEFAULT 0,
  post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_anonymized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### その他テーブル
- `sessions`: セッション管理
- `user_reactions`: ユーザーリアクション
- `user_blocks`: ユーザーブロック
- `reports`: 通報
- `contacts`: 問い合わせ
- `business_applications`: 事業者申請

## 🚀 起動方法

### ローカル開発
```bash
# 依存関係をインストール
go mod tidy

# .env ファイルを設定
cp .env.example .env

# サーバーを起動
go run main.go
```

### Docker
```bash
# コンテナを起動
docker-compose up --build

# サーバーにアクセス
curl http://localhost:8080
```

## ✅ 実装完了機能

- ✅ 認証機能（登録・ログイン・ログアウト・退会）
- ✅ ユーザー情報管理
- ✅ 投稿機能（作成・読取・削除・匿名化）
- ✅ リアクション機能
- ✅ ブロック機能
- ✅ 通報機能
- ✅ 問い合わせ機能
- ✅ 検索機能（キーワード・ジャンル・期間）
- ✅ 事業者申請機能
