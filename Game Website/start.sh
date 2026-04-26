#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1

if command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Starting with Node at http://localhost:4173'
  npm start
  exit $?
fi

if command -v python3 >/dev/null 2>&1; then
  printf '%s\n' 'Starting with Python at http://localhost:4173'
  python3 -m http.server 4173
  exit $?
fi

if command -v python >/dev/null 2>&1; then
  printf '%s\n' 'Starting with Python at http://localhost:4173'
  python -m http.server 4173
  exit $?
fi

printf '%s\n' 'Node.js or Python was not found. Open index.html directly in a browser.'
exit 1
