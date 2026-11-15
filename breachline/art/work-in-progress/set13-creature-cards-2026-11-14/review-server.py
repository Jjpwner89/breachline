#!/usr/bin/env python3
"""Serve only this review directory on localhost and save its feedback."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import json, os, re, socket

ROOT = Path(__file__).resolve().parent
PORT = 8790
for candidate in range(8790, 8890):
    with socket.socket() as probe:
        try:
            probe.bind(('127.0.0.1', candidate)); PORT = candidate; break
        except OSError:
            continue
else:
    raise RuntimeError('No available local review port')
FEEDBACK = ROOT / "feedback.json"
EMPTY = {"schema_version": 1, "collection": "set13-creature-cards-2026-11-14", "updated_at": None, "takes": {}}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, code, value):
        data = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if urlsplit(self.path).path == "/api/feedback":
            try:
                value = json.loads(FEEDBACK.read_text()) if FEEDBACK.exists() else EMPTY
                return self.send_json(200, value)
            except (OSError, ValueError):
                return self.send_json(500, {"error": "Could not read feedback."})
        if self.path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_PUT(self):
        if urlsplit(self.path).path != "/api/feedback":
            return self.send_json(404, {"error": "Unknown endpoint."})
        origin = self.headers.get("Origin")
        if origin and origin not in (f"http://127.0.0.1:{PORT}", f"http://localhost:{PORT}"):
            return self.send_json(403, {"error": "Wrong origin."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 200000:
                return self.send_json(413, {"error": "Feedback is too large."})
            data = json.loads(self.rfile.read(length))
            if data.get("collection") != EMPTY["collection"] or not isinstance(data.get("takes"), dict):
                raise ValueError("Wrong collection.")
            if len(data["takes"]) > 60:
                raise ValueError("Too many takes.")
            for key, item in data["takes"].items():
                if not re.fullmatch(r"(?:OX1|S13-0[1-9](?:-R2|-R3|-R3B|-R4|-R5|-R6|-F[12]|-P(?:[1-9]|10|11[ABC]|12|13))?|S13-E[1-6](?:-R2)?|S13-06-[1-6])", key) or not isinstance(item, dict):
                    raise ValueError("Invalid take.")
                if item.get("decision") not in ("like", "reject", "undecided"):
                    raise ValueError("Invalid decision.")
                if not isinstance(item.get("notes", ""), str) or len(item.get("notes", "")) > 5000:
                    raise ValueError("Invalid notes.")
            staging = ROOT / "feedback.pending.json"
            staging.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
            os.replace(staging, FEEDBACK)
            return self.send_json(200, {"saved": True})
        except (ValueError, TypeError, AttributeError):
            return self.send_json(400, {"error": "Invalid feedback."})
        except OSError:
            return self.send_json(500, {"error": "Could not save feedback."})

if __name__ == "__main__":
    (ROOT / 'server-info.json').write_text(json.dumps({'url': f'http://127.0.0.1:{PORT}/', 'port': PORT, 'pid': os.getpid()}, indent=2))
    print(f"Creature lineup review: http://127.0.0.1:{PORT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
