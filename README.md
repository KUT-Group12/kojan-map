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
