#!/usr/bin/env python3
"""Serve only this review directory on localhost and save its feedback."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import json, os, re

ROOT = Path(__file__).resolve().parent
PORT = 8771
FEEDBACK = ROOT / "feedback.json"
EMPTY = {"schema_version": 1, "collection": "creature-lineups-2026-11-13", "updated_at": None, "takes": {}}

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
            self.path = "/review.html"
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
            if len(data["takes"]) > 42:
                raise ValueError("Too many takes.")
            for key, item in data["takes"].items():
                if not re.fullmatch(r"CL[1-7]-[1-6]", key) or not isinstance(item, dict):
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
    print(f"Creature lineup review: http://127.0.0.1:{PORT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
