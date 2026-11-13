#!/usr/bin/env python3
"""Build a normal-art catalogue from local, auditable provenance. Never changes source art."""
import json, re, hashlib, pathlib, collections, datetime
from PIL import Image, ImageOps
BASE=pathlib.Path(__file__).resolve().parent
ART=BASE.parent
GAME=ART.parent
ALIGN=['Vigil','Gnosis','Dominion','Fervor','Genesis','Neutral','Unassigned']
COLORS=dict(W='Vigil',U='Gnosis',B='Dominion',R='Fervor',G='Genesis',N='Neutral',C='Neutral')
SKILL=GAME.parent/'.claude/skills/art-direction/SKILL.md'
ALIASES=json.loads((BASE/'path-aliases.json').read_text()) if (BASE/'path-aliases.json').exists() else {}
ORIGINAL_PATHS={new:old for old,new in ALIASES.items()}
def relocated(p):
    try:key=str(p.resolve().relative_to(ART))
    except ValueError:return p.resolve()
    return (ART/ALIASES[key]).resolve() if key in ALIASES else p.resolve()
def excluded(p):
    s=str(p).lower()
    return any(t in s for t in ['/nsfw/','/selected-card-variants-','/art-review/','/originals/','/archive/','/ui/','/fx/','/maps/','before-review'])
def norm(s):return re.sub(r'[^a-z0-9]','',str(s).lower())
def resolve(s,source):
    if not isinstance(s,str) or not re.search(r'\.(png|jpg|jpeg|webp)$',s,re.I):return None
    p=pathlib.Path(s)
    if p.is_absolute():return relocated(p)
    candidates=[source.parent/p,ART/p,GAME/p,GAME.parent/p]
    for c in candidates:
        if relocated(c).exists():return relocated(c)
    return relocated(candidates[0])
def keypath(p):
    try:return str(p.relative_to(ART))
    except ValueError:return str(p)
def idfor(p):
    key=keypath(p)
    return hashlib.sha256(ORIGINAL_PATHS.get(key,key).encode()).hexdigest()[:20]
# Card alignment is taken from the game roster, not inferred from image colour.
engine=(GAME/'engine.js').read_text()
ui=(GAME/'ui.js').read_text()
card_align={}
for m in re.finditer(r"(?:unit|land)\('([^']+)',\s*(?:'([^']+)'\s*,\s*'([WUBRGNC])'|'([WUBRGNC])'\s*,\s*'([^']+)')",engine):
    card_align[m[1]]=(m[2] or m[5],COLORS[m[3] or m[4]])
for m in re.finditer(r"id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*type:\s*'[^']+',\s*colour:\s*'([WUBRGNC])'",engine):
    card_align[m[1]]=(m[2],COLORS[m[3]])
artnames={}
artblock=ui[ui.find('var ART = {'):ui.find('var ART = {')+9000].split('};')[0]
for cid,slug in re.findall(r"(\w+):\s*'([^']+)'",artblock):
    if cid in card_align:artnames[slug+'.png']=card_align[cid]
records=[]; sources=[]; errors=[]
for p in sorted(ART.rglob('*.json')):
    if excluded(p) or any(t in p.name for t in ['VALIDATION','CARD_ART_FINAL']):continue
    try:d=json.loads(p.read_text())
    except Exception as e:errors.append(str(p));continue
    if not isinstance(d,dict):continue
    rows=[]
    for k in ['images','jobs','assets','items','removed_images','changes']:
        if isinstance(d.get(k),list):rows+=d[k]
    if not rows:continue
    sources.append(keypath(p))
    for row in rows:
        if not isinstance(row,dict):continue
        if not (row.get('title') or row.get('name')):
            if not row.get('file'):continue
            row=dict(row);row['title']=pathlib.Path(row['file']).stem.replace('-',' ').title()
        pp=None
        for k in ['accepted_path','file','output_file','saved_path','path','filename']:
            q=resolve(row.get(k),p)
            if q and q.exists() and not excluded(q):pp=q;break
        if not pp:
            q=resolve(row.get('file'),p)
            if q and not excluded(q) and any(t in str(row.get('status',''))+' '+str(row.get('review_status','')) for t in ['deleted','removed','rejected']):pp=q
        if pp and not excluded(pp):records.append((pp,p,row,d))
# Include current game art that predates surviving generation manifests.
seen={p for p,_,_,_ in records}
for p in ART.glob('*.png'):
    if p not in seen:
        title,a=artnames.get(p.name,(p.stem.replace('-',' ').title(),'Unassigned'))
        records.append((p,ART/'../ui.js',{'file':p.name,'title':title,'alignment':a},{}))
# Deduplicate moved/copy assets by their exact current content; never restore deleted versions.
files={p for p,_,_,_ in records if p.exists()}
digests={}
for p in files:digests[p]=hashlib.sha256(p.read_bytes()).hexdigest()
groups=collections.defaultdict(list)
for p,h in digests.items():groups[h].append(p)
def priority(p):return (0 if p.parent==ART else 1 if 'reference-library' in str(p) else 2,len(str(p)),str(p))
canonical={}
for ps in groups.values():
    best=min(ps,key=priority)
    for p in ps:canonical[p]=best
source_alias={}
for pp,src,row,doc in records:
    cp=canonical.get(pp,pp)
    for k in ['generated_source','source_image','source','saved_path','path','accepted_path']:
        q=resolve(row.get(k),src)
        if q and not excluded(q):source_alias[q]=cp
def canonicalize(p):
    if p in canonical:return canonical[p]
    if p in source_alias:return source_alias[p]
    if p.exists():
        h=hashlib.sha256(p.read_bytes()).hexdigest()
        if h in groups:
            canonical[p]=min(groups[h],key=priority);return canonical[p]
    return p
def alignment(row,cp):
    raw=str(row.get('alignment') or row.get('faction') or '')
    if raw:
        if re.search(r'unassigned|adjacent|possibility|universal',raw,re.I):return 'Unassigned','Exploratory / not assigned'
        hits=[a for a in ALIGN[:-1] if re.search(r'\b'+a+r'\b',raw,re.I)]
        if len(hits)==1:return hits[0],'Recorded in manifest'
    title=str(row.get('title',''))
    hits=[a for a in ALIGN[:-1] if re.match(r'^'+a+r'\b',title,re.I)]
    if len(hits)==1:return hits[0],'Explicit alignment in reference title'
    if row.get('colour') in COLORS:return COLORS[row['colour']],'Recorded card colour'
    if cp.name in artnames:return artnames[cp.name][1],'Current game roster'
    return 'Unassigned','No recorded alignment'
# Exact path metadata for evidence, each quotation remains attributable to its source.
items={}
for pp,src,row,doc in records:
    cp=canonicalize(pp);rid=idfor(cp)
    if rid not in items:
        items[rid]={'id':rid,'path':keypath(cp),'title':str(row.get('title') or row.get('name')),
        'alignment':'Unassigned','alignmentBasis':'No recorded alignment','kind':'Card' if cp.parent==ART else 'Study',
        'exists':cp.exists(),'sources':[],'feedback':[],'status':'Unreviewed','reference':False,'refs':set(),
        'batch':None,'praise':False,'strong':False}
    it=items[rid]
    if row.get('kind') in ['People / face sheet','Equipment sheet','Study']:it['kind']=row['kind']
    if row.get('intent'):it['intent']=row['intent']
    if row.get('permitted_reference_roles'):it['intent']=row['permitted_reference_roles']
    if row.get('reference_candidate') is True:
        it['reference']=True;it['status']='Pending review';it['referenceCandidate']=True
    if 'reference-library' in str(pp):it['reference']=True
    if '/people/' in str(pp):it['kind']='People / face sheet'
    elif '/equipment/' in str(pp):it['kind']='Equipment sheet'
    a,reason=alignment(row,cp)
    if a!='Unassigned':it['alignment'],it['alignmentBasis']=a,reason
    if keypath(src) not in it['sources']:it['sources'].append(keypath(src))
    m=re.match(r'ART_PROMPTS_SET(\d+)\.json',src.name)
    if m:it['batch']=int(m[1])
    rawstatus=' '.join(str(row.get(k,'')) for k in ['review_status','status','generation_status'])
    if re.search(r'final|approved|accepted',rawstatus,re.I):it['status']='Accepted'
    if row.get('active_reference') is True:it['status']='Accepted';it['reference']=True
    if re.search(r'rejected|removed|deleted|not[ _-](?:approved|accepted|selected)|held[ _-]out',rawstatus,re.I):it['status']='Excluded'
    if 'inspiration-only' in str(pp):it['status']='Inspiration only'
    for k in ['creator_feedback','latest_creator_feedback','creator_review','creator_review_note','review_note','creator_review_history','confirmed_preferences']:
        val=row.get(k)
        vals=val if isinstance(val,list) else [val]
        for v in vals:
            if isinstance(v,dict):v=v.get('feedback') or v.get('text') or v.get('assessment')
            if isinstance(v,str) and v and len(v)<2200:
                entry={'text':v,'source':keypath(src),'context':'Recorded feedback; may refer to an earlier version'}
                if entry not in it['feedback']:it['feedback'].append(entry)
    # References named in a manifest OR attached to a generation/edit; repeated occurrences count once.
    def refs(obj):
        if isinstance(obj,dict):
            for k,v in obj.items():
                if k in ['references','refs','reference_images','reference_paths','referenced_image_paths','references_consulted_files','reference_roles']:
                    def leaves(z):
                        if isinstance(z,str):
                            q=resolve(z,src)
                            if q and not excluded(q):yield canonicalize(q)
                        elif isinstance(z,list):
                            for v in z:yield from leaves(v)
                        elif isinstance(z,dict):
                            for kk,vv in z.items():
                                if kk in ['path','file','image','reference']:yield from leaves(vv)
                    yield from leaves(v)
                elif isinstance(v,(dict,list)):yield from refs(v)
        elif isinstance(obj,list):
            for x in obj:yield from refs(x)
    it['refs'].update(q for q in refs(row) if q!=cp and '/.codex/generated_images/' not in str(q))
# Manual evidence is restricted to named works and sourced review summaries, not broad sentiment guesses.
evidence=json.loads((BASE/'evidence.json').read_text())
for e in evidence['pieces']:
    for it in items.values():
        if e.get('file') and pathlib.Path(it['path']).name!=e['file']:continue
        if e.get('title') and norm(it['title'])!=norm(e['title']):continue
        if e.get('batch') and it['batch']!=e['batch']:continue
        it['feedback'].insert(0,{'text':e['note'],'source':e.get('source','../../../.claude/skills/art-direction/SKILL.md'),'context':e.get('context','Creator preference')})
        it['praise']=e.get('praise',False);it['strong']=e.get('strong',False)
        if e.get('status'):it['status']=e['status']
        if e.get('reference'):it['reference']=True
        if e.get('alignment') and it['alignment']=='Unassigned':it['alignment']=e['alignment'];it['alignmentBasis']='Recorded art-direction context'
# Add external/source images that appear only as a reference, not as a generated artwork.
for it in list(items.values()):
    for p in it['refs']:
        rid=idfor(p)
        if rid not in items:
            items[rid]={'id':rid,'path':keypath(p),'title':p.stem.replace('-',' ').replace('_',' ').title(),
            'alignment':'Unassigned','alignmentBasis':'No recorded alignment','kind':'External reference' if not p.is_relative_to(ART) else 'Reference',
            'exists':p.exists(),'sources':[],'feedback':[],'status':'Unreviewed','reference':True,'refs':set(),'batch':None,'praise':False,'strong':False}
        else:items[rid]['reference']=True
# Exact per-artwork use edges. Current references may have influenced an earlier version.
for it in items.values():
    it['usedBy']=[];it['usesByAlignment']={a:0 for a in ALIGN}
for it in items.values():
    for p in it['refs']:
        other=items[idfor(p)]
        other['usedBy'].append(it['id']);other['usesByAlignment'][it['alignment']]+=1
for it in items.values():
    it['refs']=sorted(idfor(p) for p in it['refs'])
    it['uses']=len(it['usedBy'])
    if it['reference'] and it['status']=='Unreviewed' and 'reference-library' in it['path']:it['status']='Accepted'
# Use cached compact thumbnails; original artworks stay untouched.
thumbs=BASE/'thumbs';thumbs.mkdir(exist_ok=True)
for it in items.values():
    if not it['exists']:continue
    p=pathlib.Path(it['path'])
    if not p.is_absolute():p=ART/p
    out=thumbs/(it['id']+'.jpg')
    if not out.exists() or out.stat().st_mtime<p.stat().st_mtime:
        try:
            im=ImageOps.exif_transpose(Image.open(p)).convert('RGB');im.thumbnail((720,540))
            im.save(out,quality=85,optimize=True)
        except Exception as e:errors.append(str(p));it['exists']=False
    it['thumb']='thumbs/'+out.name
    it['image']='../'+it['path'] if not pathlib.Path(it['path']).is_absolute() else it['thumb']
# Historical verdicts are evidence only: never seed user votes or Elo from them.
recent=[it for it in items.values() if it['batch'] in [7,8,9,10,11] and it['exists']]
stats=[]
for a in ALIGN:
    group=[it for it in recent if it['alignment']==a]
    if group:stats.append({'alignment':a,'total':len(group),'praised':sum(it['praise'] for it in group),'standouts':sum(it['strong'] for it in group)})
stats.sort(key=lambda x:-(x['praised']/x['total']))
data={'version':1,'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
'alignments':ALIGN,'items':sorted(items.values(),key=lambda x:(-x['uses'],x['title'])),
'recentStats':stats,'analysis':evidence['analysis'],'sources':sources,'errors':errors,
'methodology':[
'Normal-art JSON manifests, current game art and recorded art-direction feedback. NSFW folders and selected-card variants originating there are omitted; normal game cards stay in scope.',
'One use = one distinct documented artwork naming this reference, across its retained generation/edit history. Repeated fields, retries and identical image copies are deduplicated. Counts include consulted references, not just tool attachments.',
'Counts are lower bounds: undocumented choices, deleted manifests and text-only inspirations and unresolved raw generation outputs are not reconstructed. Original inputs used only to edit their own painting are not counted as a separate reference when linked. A removed artwork can still contribute a documented historical use. Usage is not a quality score.',
'Alignment filters on References mean USED FOR that alignment. The assigned alignment is separate; unassigned/species sheets remain shared unless you label them.',
'Recent comparison covers the 56 surviving Set 7–11 cards. Praise counts only explicit named or batch-specific praise in audited feedback. Final approval alone is not praise; no comment is not a dislike. This historical praise summary is separate from the newer saved head-to-head choices shown live in Feedback insights.',
'Notes can concern earlier versions. Historical exclusions stay excluded by default; an explicit new upvote can restore eligibility without restoring deleted files. Favorites and pair rankings start empty.'
]}
(BASE/'catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
(BASE/'catalog.js').write_text('window.ART_CATALOG='+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+';')
print(json.dumps({'items':len(items),'visible':sum(it['exists'] for it in items.values()),'references':sum(it['reference'] and it['exists'] for it in items.values()),'edges':sum(it['uses'] for it in items.values()),'recent':stats,'missingReferences':sum(it['reference'] and not it['exists'] for it in items.values()),'top':[(it['title'],it['uses']) for it in sorted(items.values(),key=lambda x:-x['uses'])[:12]],'errors':errors},indent=2))
