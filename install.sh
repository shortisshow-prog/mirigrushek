#!/usr/bin/env bash
# =============================================================================
#  Установка ИС «МирИгрушек» на чистый Ubuntu-сервер ОДНОЙ командой:
#
#      curl -fsSL https://raw.githubusercontent.com/shortisshow-prog/mirigrushek/main/install.sh | sudo bash
#
#  Скрипт клонирует репозиторий и запускает setup.sh (Apache+MySQL+PHP, БД, сайт).
# =============================================================================
set -euo pipefail

REPO_URL="https://github.com/shortisshow-prog/mirigrushek.git"
DEST="/opt/mirigrushek"

if [[ $EUID -ne 0 ]]; then
  echo "Нужны права root. Запустите:" >&2
  echo "  curl -fsSL https://raw.githubusercontent.com/shortisshow-prog/mirigrushek/main/install.sh | sudo bash" >&2
  exit 1
fi

echo "==> Установка git…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git

echo "==> Клонирование репозитория в $DEST…"
rm -rf "$DEST"
git clone --depth 1 "$REPO_URL" "$DEST"

echo "==> Запуск установки…"
cd "$DEST"
bash setup.sh
