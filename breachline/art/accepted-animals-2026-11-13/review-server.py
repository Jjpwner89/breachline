from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
ROOT=Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def end_headers(self):self.send_header("Cache-Control","no-store");super().end_headers()
 def do_GET(self):
  if self.path=="/":self.path="/review.html"
  return super().do_GET()
if __name__=="__main__":
 print("Accepted animals: http://127.0.0.1:8776/",flush=True)
 ThreadingHTTPServer(("127.0.0.1",8776),Handler).serve_forever()
