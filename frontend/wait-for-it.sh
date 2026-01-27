#!/bin/sh
# wait-for-it.sh

set -e

TIMEOUT=60 # タイムアウトを60秒に設定

echo "Waiting for services..."

while [ "$#" -gt 0 ]; do
  # 次の引数が '--' ならループを抜けてコマンド実行へ
  if [ "$1" = "--" ]; then
    shift # '--' をシフト
    break
  fi

  host="$1"
  port="$2"
  shift 2

  echo "Waiting for $host:$port"
  count=0
  until nc -z "$host" "$port"; do
    if [ "$count" -ge "$TIMEOUT" ]; then
      echo "Error: Timeout after $TIMEOUT seconds waiting for $host:$port"
      exit 1
    fi
    >&2 echo "$host:$port is unavailable - sleeping"
    sleep 1
    count=$((count + 1))
  done
  echo "$host:$port is up!"
done

cmd="$@"

echo "All services are up - executing command: $cmd"
exec "$@"

