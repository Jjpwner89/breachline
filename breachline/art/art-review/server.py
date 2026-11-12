#!/usr/bin/env python3
"""Loopback-only art reviewer. Serves allowlisted normal-art files and saves feedback atomically."""
import argparse,json,pathlib,threading,tempfile,os,datetime,uuid,mimetypes,sys
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlparse,unquote
BASE=pathlib.Path(__file__).resolve().parent
CAT=json.loads((BASE/'catalog.json').read_text()); ITEMS={x['id']:x for x in CAT['items']}
LOCK=threading.Lock()
def empty():return {'version':1,'revision':0,'events':[]}
def read_state():
    if not STATE.exists():return empty()
    return json.loads(STATE.read_text())
def atomic(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,name=tempfile.mkstemp(prefix=path.name+'.',dir=path.parent)
    try:
        with os.fdopen(fd,'w') as f:json.dump(data,f,indent=2,ensure_ascii=False);f.flush();os.fsync(f.fileno())
        os.replace(name,path)
    finally:
        if os.path.exists(name):os.unlink(name)
def selection(state):
    votes={};favorites={};alignments={};notes={};rank={}; comparisons=0
    for e in state['events']:
        t=e['type']
        if t=='vote':votes[e['item']]=e['value']
        if t=='favorite':favorites[e['item']]=e['value']
        if t=='alignment':alignments[e['item']]=e['value']
        if t=='note':notes[e['item']]=e['value']
        if t=='compare':
            a=rank.setdefault(e['a'],{'rating':1000,'comparisons':0,'wins':0})
            b=rank.setdefault(e['b'],{'rating':1000,'comparisons':0,'wins':0})
            score=1 if e['winner']==e['a'] else 0 if e['winner']==e['b'] else .5
            change=24*(score-1/(1+10**((b['rating']-a['rating'])/400)))
            a['rating']+=change;b['rating']-=change
            a['comparisons']+=1;b['comparisons']+=1
            a['wins']+=score;b['wins']+=1-score;comparisons+=1
    refs=[]
    for i,x in ITEMS.items():
        if x['reference'] or i in votes or i in alignments or i in notes:
            v=votes.get(i,0);excluded=v==-1 or (v==0 and x['status'] in ['Excluded','Inspiration only'])
            refs.append({'id':i,'title':x['title'],'path':x['path'],'alignment':alignments.get(i,x['alignment']),
            'vote':v,'excluded':excluded,'available':x['exists'],'note':notes.get(i,''),'historicalStatus':x['status'],
            'requiresCreatorConfirmation':x.get('referenceCandidate',False) and v!=1,
            'referenceRole':x.get('intent','')})
    return {'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'revision':state['revision'],
    'instructions':'Consult this file with the art-direction skill before selecting references. Honor excluded=true. References with requiresCreatorConfirmation=true are proposals, not active generation references; favorites or comparison rank do not approve them. Positive votes and favorites guide selection; rankings alone never approve a reference. Alignment overrides are reference-selection labels, not lore changes. Unassigned sheets can serve multiple alignments. Existing source art and historical approvals are unchanged.',
    'references':refs,'favorites':[{'id':i,'title':ITEMS[i]['title'],'path':ITEMS[i]['path']} for i,v in favorites.items() if v],
    'rankings':[dict(id=i,title=ITEMS[i]['title'],path=ITEMS[i]['path'],**v) for i,v in sorted(rank.items(),key=lambda z:-z[1]['rating'])],
    'comparisons':comparisons}
def artwork_path(item):
    source=pathlib.Path(item['path'])
    source=source if source.is_absolute() else BASE.parent/source
    if source.is_file():return source
    # External reference originals may live only on the creator's computer.
    cached=BASE/'thumbs'/(item['id']+'.jpg')
    return cached if cached.is_file() else None
def validate(e):
    if not isinstance(e,dict):raise ValueError('Invalid action')
    t=e.get('type')
    if t in ['vote','favorite','alignment','note']:
        if e.get('item') not in ITEMS:raise ValueError('Unknown artwork')
        if t=='vote' and (type(e.get('value')) is not int or e['value'] not in [-1,0,1]):raise ValueError('Invalid vote')
        if t=='favorite' and type(e.get('value')) is not bool:raise ValueError('Invalid favorite')
        if t=='alignment' and e.get('value') not in CAT['alignments']:raise ValueError('Invalid alignment')
        if t=='note' and (not isinstance(e.get('value'),str) or len(e['value'])>2000):raise ValueError('Note too long')
        return {k:e[k] for k in ['type','item','value']}
    if t=='compare':
        if e.get('a') not in ITEMS or e.get('b') not in ITEMS or e['a']==e['b']:raise ValueError('Choose two different artworks')
        if e.get('winner') not in [e['a'],e['b'],'tie']:raise ValueError('Invalid winner')
        if not ITEMS[e['a']]['exists'] or not ITEMS[e['b']]['exists']:raise ValueError('Artwork unavailable')
        return {k:e[k] for k in ['type','a','b','winner']}
    if t=='undo':return {'type':'undo'}
    raise ValueError('Unknown action')
class Handler(BaseHTTPRequestHandler):
    def log_message(self,fmt,*args):
        if len(args)>1 and str(args[1]) not in ['200','304']:super().log_message(fmt,*args)
    def reply(self,code,data):
        payload=json.dumps(data).encode();self.send_response(code)
        self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store')
        self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
    def do_GET(self):
        route=unquote(urlparse(self.path).path)
        if route=='/api/state':
            with LOCK:self.reply(200,read_state())
            return
        if route=='/api/export':
            with LOCK:self.reply(200,{'state':read_state(),'selectionGuide':selection(read_state())})
            return
        target=None
        if route=='/new-studies.html':target=BASE.parent/'work-in-progress/active-scenes-and-people-2026-11-11/review.html'
        elif route=='/study-before.png':target=BASE.parent/'work-in-progress/active-scenes-and-people-2026-11-11/originals/05-through-the-squall-before-skin-review.png'
        elif route.startswith('/image/'):
            x=ITEMS.get(route.split('/')[-1])
            if x and x['exists']:target=artwork_path(x)
        elif route.startswith('/thumbs/'):
            name=route.split('/')[-1]
            if name.endswith('.jpg') and name[:-4] in ITEMS:target=BASE/'thumbs'/name
        elif route in ['/','/index.html','/app.js','/style.css','/catalog.js','/catalog.json']:
            target=BASE/('index.html' if route=='/' else route[1:])
        if not target or not target.is_file():self.reply(404,{'error':'Not found'});return
        data=target.read_bytes();self.send_response(200)
        self.send_header('Content-Type',mimetypes.guess_type(str(target))[0] or 'application/octet-stream')
        self.send_header('Content-Length',str(len(data)))
        self.send_header('Cache-Control','no-cache' if target.suffix in ['.js','.html','.json'] else 'private, max-age=3600')
        self.send_header('X-Content-Type-Options','nosniff');self.end_headers();self.wfile.write(data)
    def do_POST(self):
        if urlparse(self.path).path!='/api/event':self.reply(404,{'error':'Not found'});return
        # A foreign website cannot submit feedback to this local service.
        origin=self.headers.get('Origin')
        expected='http://'+self.headers.get('Host','')
        if (origin and origin!=expected) or self.headers.get('Content-Type','').split(';')[0]!='application/json':
            self.reply(403,{'error':'Use the local review gallery'});return
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length>12000:raise ValueError('Request too large')
            data=json.loads(self.rfile.read(length));e=validate(data.get('event'))
            with LOCK:
                state=read_state()
                if data.get('revision')!=state['revision']:self.reply(409,{'error':'Another tab saved a change. Please try again.','state':state});return
                if e['type']=='undo':
                    if state['events']:state['events'].pop()
                else:
                    e['id']=str(uuid.uuid4());e['at']=datetime.datetime.now(datetime.timezone.utc).isoformat();state['events'].append(e)
                state['revision']+=1
                atomic(STATE,state);atomic(STATE.with_name('selection-guide.json'),selection(state))
                self.reply(200,state)
        except (ValueError,TypeError,KeyError,json.JSONDecodeError) as e:self.reply(400,{'error':str(e)})
        except Exception as e:self.reply(500,{'error':'Could not save feedback. Your previous records remain intact.'});print(str(e),file=sys.stderr)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8767);parser.add_argument('--state',default=str(BASE/'feedback.json'))
    args=parser.parse_args();STATE=pathlib.Path(args.state).resolve()
    with LOCK:atomic(STATE.with_name('selection-guide.json'),selection(read_state()))
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Art review ready: http://127.0.0.1:{server.server_port}',flush=True)
    server.serve_forever()
