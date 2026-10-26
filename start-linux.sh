#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Для запуска установите Node.js 24 LTS: https://nodejs.org/' >&2
  exit 1
fi

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit((major === 22 && minor >= 13) || (major === 24 && minor >= 3) || major >= 26 ? 0 : 1)'; then
  echo 'Нужна поддерживаемая версия Node.js. Рекомендуется Node.js 24 LTS; проверено с 24.19.0.' >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  npm ci
fi

echo 'Подключите Linux-компьютер и iPhone к одной Wi-Fi сети.'
echo 'На iPhone установите Expo Go и сканируйте QR-код обычной камерой.'
echo 'Не закрывайте этот терминал, пока пользуетесь приложением.'
exec npm start -- "$@"
