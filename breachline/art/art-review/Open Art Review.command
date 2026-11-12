#!/bin/zsh
cd "$(dirname "$0")"
if /usr/bin/curl --silent --fail http://127.0.0.1:8767/api/state >/dev/null; then
  open http://127.0.0.1:8767
else
  (sleep 1; open http://127.0.0.1:8767) &
  exec /Users/dpuser/Documents/Claude/Games/.venv-fal/bin/python server.py
fi
