# kojan-map
こじゃんとやまっぷの実装をするリポジトリ

## 📂 ディレクトリ構成

```
kojan-map/
├── compose.yaml          # Docker Compose設定ファイル
├── backend/              # バックエンド（Go）
│   ├── Dockerfile        # バックエンド用Dockerイメージ
│   ├── go.mod            # Go モジュール定義
│   ├── go.sum            # Go 依存関係のチェックサム
│   └── main.go           # メインアプリケーション
└── frontend/             # フロントエンド（React + TypeScript）
    └── Dockerfile        # フロントエンド用Dockerイメージ
```

## 🚀 セットアップ

### 前提条件
- Docker
- Docker Compose
- Node.js 20以上（フロントエンド開発時）

### フロントエンドプロジェクトの作成

Node.jsがインストールされていない場合、以下のコマンドでフロントエンドプロジェクトを作成できます：

```powershell
docker run --rm -it -v .:/app -w /app node:20-alpine npm create vite@latest frontend -- --template react-ts
```

Node.jsがある場合：

```powershell
npm create vite@latest frontend -- --template react-ts
```

## 🐳 Docker の使い方

### すべてのサービスを起動

```powershell
docker compose up --build
```

このコマンドで以下のサービスが起動します：
- **バックエンド**: http://localhost:8080
- **フロントエンド**: http://localhost:5173
- **データベース（MySQL）**: localhost:3306

### 個別のサービスをビルド・起動

#### バックエンド

```powershell
cd backend
docker build -t kojan-map-backend .
docker run -p 8080:8080 kojan-map-backend
```

#### フロントエンド

```powershell
cd frontend
docker build -t kojan-map-frontend .
docker run -p 5173:5173 kojan-map-frontend
```

#### データベース

```powershell
cd kojan-map
docker compose up -d db
docker compose exec db bash

mysql -u ユーザ名 -p

docker exec -i kojan-map-db-1 mysqldump -u root -p kojanmap > kojanmap_dump.sql % ダンプファイルの作成
```
### コンテナの停止

```powershell
docker compose down
```

データベースのボリュームも削除する場合：

```powershell
docker compose down -v
```

## 📝 開発

### バックエンド（Go）

- ポート: 8080
- エンドポイント: `/` - 「こじゃんとやまっぷ API サーバー起動中！🚀」を返す

### フロントエンド（React + Vite）

- ポート: 5173
- Vite開発サーバーで起動

### データベース（MySQL）

- ポート: 3306
- データベース名: `kojanmap`
- ルートパスワード: `root`
- データは `db-data` ボリュームに永続化

## 🔄 CI/CD（GitHub Actions）

このリポジトリでは、`main` または `develop` ブランチへのプッシュ・プルリクエスト時に自動でCI/CDが実行されます。

### ワークフロー一覧

| ワークフロー | 対象 | 実行内容 |
|------------|------|---------|
| **Lint** | Backend (Go) | golangci-lint, go vet, gofmt |
| **Lint** | Frontend (TS) | ESLint, Prettier |
| **Test** | Backend (Go) | go test + カバレッジ |
| **Test** | Frontend (TS) | npm test |

### Backend（Go）が準拠すべき要件

| チェック項目 | 確認コマンド | 説明 |
|-------------|-------------|------|
| フォーマット | `gofmt -s -l .` | 出力なしで合格 |
| 静的解析 | `go vet ./...` | エラーなしで合格 |
| Lint | `golangci-lint run` | エラーなしで合格 |
| テスト | `go test ./...` | 全テストパスで合格 |

#### 必須ファイル

```
backend/
├── go.mod           # モジュール定義
├── go.sum           # 依存関係ロック
├── .golangci.yml    # Lint設定
└── *_test.go        # テストファイル
```

### Frontend（TypeScript）が準拠すべき要件

| チェック項目 | 確認コマンド | 説明 |
|-------------|-------------|------|
| ESLint | `npm run lint` | Lintエラーなし |
| Prettier | `npm run format:check` | フォーマット済み |
| テスト | `npm test` | 全テストパス |

#### 必須ファイル・スクリプト

```
frontend/
├── package.json       # 下記scriptsが必要
├── package-lock.json  # ロックファイル
├── .eslintrc.*        # ESLint設定
└── .prettierrc        # Prettier設定
```

**package.json に必要なスクリプト:**

```json
{
  "scripts": {
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

### ローカルでの事前チェック

プルリクエスト作成前に以下を実行してください：

```bash
# Backend
cd backend
gofmt -s -w .           # フォーマット修正
go vet ./...            # 静的解析
MYSQL_PASSWORD=MYSQL_ROOT_PASSWORDを入れる go test ./...           # テスト実行

# Frontend
cd frontend
npm run lint            # ESLint
npm run format:check    # Prettier
npm test                # テスト
```
