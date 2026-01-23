FROM mysql:8.0

# 環境変数の設定
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=kojanmap

# ホストマシンのSQLファイルを、コンテナ内の初期化用フォルダにコピーする
# このフォルダに置かれた .sql ファイルは、コンテナの初回起動時に自動実行されます
COPY kojanmap_dump.sql /docker-entrypoint-initdb.d/