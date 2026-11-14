#!/usr/bin/env python3
"""Local creature-art review; decisions and notes persist beside the paintings."""
import argparse,datetime,json,mimetypes,os,pathlib,tempfile,threading
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlparse,unquote
BASE=pathlib.Path(__file__).resolve().parent
MANIFEST=json.loads((BASE/"prompts-and-manifest.json").read_text())
ITEMS={x["review_code"]:x for x in MANIFEST["images"]}
FILES={x["file"] for x in ITEMS.values()}|{"review.html","review.css","review.js"}
STATE=BASE/"feedback.json"
LOCK=threading.Lock()
def read_state():
    if STATE.exists(): return json.loads(STATE.read_text())
    return {"round":"creatures-round-13-2026-11-13","revision":0,"records":{},"events":[]}
def write_state(state):
    fd,name=tempfile.mkstemp(prefix=".feedback-",suffix=".json",dir=STATE.parent)
    try:
        with os.fdopen(fd,"w") as f:
            json.dump(state,f,indent=2,ensure_ascii=False);f.write("\n");f.flush();os.fsync(f.fileno())
        os.replace(name,STATE)
    finally:
        if os.path.exists(name):os.unlink(name)
class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def json(self,code,data):
        raw=json.dumps(data,ensure_ascii=False).encode()
        self.send_response(code);self.send_header("Content-Type","application/json; charset=utf-8");self.send_header("Content-Length",str(len(raw)));self.send_header("Cache-Control","no-store");self.send_header("X-Content-Type-Options","nosniff");self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        route=unquote(urlparse(self.path).path)
        if route in ("/api/state","/api/export"):
            with LOCK:self.json(200,read_state())
            return
        name="review.html" if route=="/" else route.lstrip("/")
        if name not in FILES or not (BASE/name).is_file():self.json(404,{"error":"Not found"});return
        raw=(BASE/name).read_bytes();self.send_response(200)
        self.send_header("Content-Type",mimetypes.guess_type(name)[0] or "application/octet-stream");self.send_header("Content-Length",str(len(raw)));self.send_header("Cache-Control","no-cache" if name.endswith((".html",".js",".css")) else "private, max-age=3600");self.send_header("X-Content-Type-Options","nosniff");self.end_headers();self.wfile.write(raw)
    def do_POST(self):
        if urlparse(self.path).path!="/api/review":self.json(404,{"error":"Not found"});return
        expected="http://"+self.headers.get("Host","")
        if (self.headers.get("Origin") and self.headers["Origin"]!=expected) or self.headers.get("Content-Type","").split(";")[0]!="application/json":self.json(403,{"error":"Open the local review gallery to save"});return
        try:
            length=int(self.headers.get("Content-Length","0"))
            if not 0<length<24000:raise ValueError("Invalid request size")
            event=json.loads(self.rfile.read(length))
            if not isinstance(event,dict):raise ValueError("Invalid review")
            code=event.get("code");event_id=event.get("id");changes=event.get("changes")
            if code not in ITEMS or not isinstance(event_id,str) or not 1<=len(event_id)<=100:raise ValueError("Unknown painting or invalid review ID")
            if not isinstance(changes,dict) or not changes or not set(changes)<=set(("decision","note")):raise ValueError("Invalid changes")
            if "decision" in changes and changes["decision"] not in ("pending","approved","rejected"):raise ValueError("Invalid decision")
            if "note" in changes and (not isinstance(changes["note"],str) or len(changes["note"])>10000):raise ValueError("Note must be at most 10,000 characters")
            with LOCK:
                state=read_state()
                if not any(e["id"]==event_id for e in state["events"]):
                    stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
                    record=state["records"].get(code,{"decision":"pending","note":""})
                    record.update(changes);record.update({"updatedAt":stamp,"title":ITEMS[code]["title"],"file":ITEMS[code]["file"]})
                    state["records"][code]=record
                    state["events"].append({"id":event_id,"code":code,"changes":changes,"at":stamp})
                    state["revision"]+=1;write_state(state)
                self.json(200,{"revision":state["revision"],"record":state["records"][code]})
        except (ValueError,TypeError,KeyError,json.JSONDecodeError):self.json(400,{"error":"Invalid review; previous feedback is unchanged"})
        except Exception:self.json(500,{"error":"Could not save. Your browser keeps a pending copy."})
if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--port",type=int,default=8768);parser.add_argument("--state")
    args=parser.parse_args()
    if args.state:STATE=pathlib.Path(args.state).resolve()
    server=ThreadingHTTPServer(("127.0.0.1",args.port),Handler)
    print("Creature review ready: http://127.0.0.1:"+str(server.server_port),flush=True)
    server.serve_forever()
