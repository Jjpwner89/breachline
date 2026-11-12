'use strict';
const C=window.ART_CATALOG, byId=Object.fromEntries(C.items.map(x=>[x.id,x]));
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local=location.protocol==='file:', storeKey='breachline-art-review-v1';
let state={version:1,revision:0,events:[]}, prefs={}, tab='references', page=0, pair=null, poolMode='starters', busy=false, ready=false, dialogItem=null;
let sessionChoices=0, lastPairs=[], toastTimer;
function toast(text){$('#toast').textContent=text;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',4500)}
function replay(){
 prefs={votes:{},favorites:{},alignments:{},notes:{},rank:{}};
 for(const e of state.events){
  if(e.type==='vote')prefs.votes[e.item]=e.value;
  if(e.type==='favorite')prefs.favorites[e.item]=e.value;
  if(e.type==='alignment')prefs.alignments[e.item]=e.value;
  if(e.type==='note')prefs.notes[e.item]=e.value;
  if(e.type==='compare'){
   const a=prefs.rank[e.a]??={rating:1000,n:0,wins:0},b=prefs.rank[e.b]??={rating:1000,n:0,wins:0};
   const score=e.winner===e.a?1:e.winner===e.b?0:.5,change=24*(score-1/(1+10**((b.rating-a.rating)/400)));
   a.rating+=change;b.rating-=change;a.n++;b.n++;a.wins+=score;b.wins+=1-score;
  }
 }
}
function vote(x){return prefs.votes[x.id]??0}
function excluded(x){return vote(x)===-1||(vote(x)===0&&['Excluded','Inspiration only'].includes(x.status))}
function assigned(x){return prefs.alignments[x.id]??x.alignment}
function isSheet(x){return /sheet/i.test(x.kind)}
function src(x){return local?x.image:'/image/'+x.id}
function praiseNote(x){return x.feedback[0]?.text||x.intent||'No specific taste comment recorded. Your vote can help establish the direction.'}
function feedbackLink(x){return x.sources[0]||'Current art collection'}
async function persist(event){
 if(busy||!ready){toast(ready?'Finishing the previous save…':'Feedback is not connected. Reload the page to reconnect.');return false}
 busy=true;$('#saveStatus').textContent='Saving…';
 try{
  if(local){
   const next=structuredClone(state);
   if(event.type==='undo')next.events.pop();else next.events.push({...event,id:crypto.randomUUID(),at:new Date().toISOString()});
   next.revision++;localStorage.setItem(storeKey,JSON.stringify(next));state=next;
  }else{
   const r=await fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:state.revision,event})});
   const d=await r.json();if(!r.ok){if(d.state)state=d.state;throw Error(d.error||'Save failed')}state=d;
  }
  replay();renderMetrics();$('#saveStatus').textContent=local?'Saved in this browser only':'✓ Saved to your project';
  return true;
 }catch(e){replay();toast(e.message);$('#saveStatus').textContent='Change not saved · please retry';return false}
 finally{busy=false}
}
function alignmentResults(){
 const groups=Object.fromEntries(C.alignments.map(a=>[a,{alignment:a,wins:0,n:0}]));
 for(const e of state.events){
  if(e.type!=='compare'||!byId[e.a]||!byId[e.b])continue;
  const a=assigned(byId[e.a]),b=assigned(byId[e.b]);if(a===b)continue;
  const score=e.winner===e.a?1:e.winner===e.b?0:.5;
  groups[a].wins+=score;groups[a].n++;groups[b].wins+=1-score;groups[b].n++;
 }
 return Object.values(groups).filter(x=>x.n).sort((a,b)=>b.wins/b.n-a.wins/a.n);
}
function renderMetrics(){
 const refs=C.items.filter(x=>x.exists&&x.reference),art=C.items.filter(x=>x.exists&&!isSheet(x));
 $('#metrics').innerHTML=[
 [refs.length,'references to explore'],[art.length,'paintings & studies'],[Object.values(prefs.favorites).filter(Boolean).length,'your favorites'],
 [Object.values(prefs.votes).filter(x=>x===-1).length,'references you excluded'],[state.events.filter(x=>x.type==='compare').length,'comparisons']
 ].map(([n,l])=>'<div class="metric"><strong>'+n+'</strong>'+l+'</div>').join('');
 $('#undo').disabled=!state.events.length||busy;
 const leaders=alignmentResults().filter(x=>!['Neutral','Unassigned'].includes(x.alignment));
 if(leaders.length>1){$('#feedbackHeadline').textContent=leaders[0].alignment+' leads your comparisons. '+leaders[1].alignment+' follows.';$('#feedbackSummary').textContent='Current choices guide the next tests. Sparse samples and unequal opponents make this provisional.';}

}
function setTab(t){tab=t;page=0;pair=null;history.replaceState(null,'','#'+t);render();document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab))}
function count(x){const a=$('#alignment').value;return a==='all'?x.uses:(x.usesByAlignment[a]||0)}
function filtered(type){
 const a=$('#alignment').value,q=$('#search').value.toLowerCase().trim(),kind=$('#kind').value,review=$('#review').value;
 return C.items.filter(x=>{
  if(!x.exists||type==='references'&&!x.reference)return false;
  if(type!=='references'&&isSheet(x))return false;
  if(a!=='all'&&(type==='references'?!(x.usesByAlignment[a]>0):assigned(x)!==a))return false;
  if(q&&!([x.title,x.path,assigned(x),...x.feedback.map(f=>f.text),prefs.notes[x.id]||''].join(' ').toLowerCase().includes(q)))return false;
  if(kind==='paintings'&&isSheet(x)||kind==='sheets'&&!isSheet(x)||kind==='recent'&&!(x.batch>=7&&x.batch<=11))return false;
  if(review==='eligible'&&excluded(x)||review==='preferred'&&vote(x)!==1||review==='excluded'&&!excluded(x)||review==='favorites'&&!prefs.favorites[x.id]||review==='unvoted'&&(vote(x)!==0||excluded(x)))return false;
  return true;
 });
}
function sorted(xs){
 const sort=$('#sort').value;
 return xs.sort((a,b)=>{
  if(sort==='title')return a.title.localeCompare(b.title);
  if(sort==='praise')return (b.strong-a.strong)||(b.praise-a.praise)||(b.uses-a.uses)||a.title.localeCompare(b.title);
  if(sort==='rating')return ((prefs.rank[b.id]?.rating||0)-(prefs.rank[a.id]?.rating||0))||a.title.localeCompare(b.title);
  return count(b)-count(a)||a.title.localeCompare(b.title);
 });
}
function card(x,ref){
 const n=count(x),chosen=prefs.favorites[x.id],v=vote(x);
 return '<article class="card '+(excluded(x)?'excluded':'')+'"><button class="artbutton" data-open="'+x.id+'" aria-label="View '+esc(x.title)+'"><img loading="lazy" src="'+esc(x.thumb)+'" alt="'+esc(x.title)+'">'+(ref?'<span class="badge">'+n+' documented use'+(n===1?'':'s')+'</span>':'')+'</button><div class="cardbody"><div class="meta"><span>'+esc(assigned(x))+'</span><span>'+esc(x.kind)+'</span></div><h3>'+esc(x.title)+'</h3><p class="blurb">'+esc(praiseNote(x))+'</p><div class="actions">'+(ref?'<button data-vote="1" data-id="'+x.id+'" class="'+(v===1?'on':'')+'" aria-pressed="'+(v===1)+'">↑ Use more</button><button data-vote="-1" data-id="'+x.id+'" class="down '+(v===-1?'on':'')+'" aria-pressed="'+(v===-1)+'">↓ Exclude</button>':'<button data-open="'+x.id+'">View & notes</button>')+'<button class="star '+(chosen?'on':'')+'" data-fav="'+x.id+'" aria-label="'+(chosen?'Remove favorite: ':'Favorite: ')+esc(x.title)+'" aria-pressed="'+!!chosen+'">'+(chosen?'★':'☆')+'</button></div></div></article>';
}
function renderGallery(){
 const ref=tab==='references',xs=sorted(filtered(tab)),size=24,total=Math.ceil(xs.length/size);page=Math.max(0,Math.min(page,total-1));
 const a=$('#alignment').value;
 $('#view').innerHTML='<div class="sectionhead"><div><h2>'+(ref?(a==='all'?'The references behind the work':'Most used for '+esc(a)):'Choose the paintings you want more of')+'</h2><p class="help">'+(ref?'A use is one artwork that names this reference. Approve useful influences, exclude poor fits, or open a painting to adjust its alignment and leave a note.':'Tap ☆ to choose favorites. Those favorites can become a smaller, more focused comparison pool.')+'</p></div><p class="help">'+xs.length+' '+(ref?'references':'paintings')+(a!=='all'&&ref?' · grouped by usage':'')+'</p></div>'+
 (xs.length?'<div class="grid">'+xs.slice(page*size,(page+1)*size).map(x=>card(x,ref)).join('')+'</div><div class="pagination"><button data-page="-1" '+(!page?'disabled':'')+'>← Previous</button><span>Page '+(page+1)+' of '+total+'</span><button data-page="1" '+(page>=total-1?'disabled':'')+'>Next →</button></div>':'<div class="empty"><h2>No matches here yet.</h2><p>Try another alignment, clear the search, or change the review filter.</p></div>');
}
function comparePool(){
 let xs=filtered('artworks').filter(x=>!excluded(x));
 if(poolMode==='favorites')xs=xs.filter(x=>prefs.favorites[x.id]);
 if(poolMode==='starters')xs=xs.filter(x=>x.praise||x.strong);
 return xs;
}
function choosePair(xs){
 if(xs.length<2)return null;
 const shuffled=xs.map(x=>({x,r:Math.random()})).sort((a,b)=>((prefs.rank[a.x.id]?.n||0)-(prefs.rank[b.x.id]?.n||0))||a.r-b.r);
 const a=shuffled[Math.floor(Math.random()*Math.min(4,shuffled.length))].x;
 const ar=prefs.rank[a.id]?.rating||1000;
 let options=xs.filter(x=>x.id!==a.id).map(x=>({x,score:Math.abs((prefs.rank[x.id]?.rating||1000)-ar)+(prefs.rank[x.id]?.n||0)*8+Math.random()*50+(lastPairs.includes([a.id,x.id].sort().join(':'))?10000:0)})).sort((a,b)=>a.score-b.score);
 const b=options[0].x;return Math.random()<.5?[a,b]:[b,a];
}
function renderCompare(){
 const xs=comparePool();
 if(!pair||pair.some(x=>!xs.some(y=>y.id===x.id)))pair=choosePair(xs);
 $('#view').innerHTML='<div class="sectionhead"><div><h2>Which is closer to the vision?</h2><p class="help">Choose the painting you want future art to learn from. The same piece returns against different opponents. A few comparisons are enough to start; you can stop whenever you like.</p></div><div class="progress">'+sessionChoices+' picks this visit · '+xs.length+' in this pool</div></div><div class="chips">'+[['starters','Suggested starters'],['favorites','Your favorites'],['all','All paintings']].map(([id,title])=>'<button class="pill '+(poolMode===id?'on':'')+'" data-pool="'+id+'">'+title+'</button>').join('')+'</div>'+
 (!pair?'<div class="empty"><h2>'+(poolMode==='favorites'?'Pick at least two favorites first.':'At least two paintings are needed.')+'</h2><p>Use Pick favorites, choose Suggested starters, or broaden the filters.</p><button data-tab="artworks">Pick favorites →</button></div>':
 '<div class="comparegrid">'+pair.map((x,i)=>'<article class="comparecard"><button class="artbutton" data-open="'+x.id+'" aria-label="Enlarge '+esc(x.title)+'"><img src="'+esc(x.thumb)+'" alt="'+esc(x.title)+'"></button><h3>'+esc(x.title)+'</h3><div class="meta">'+esc(assigned(x))+'</div><button class="choose" data-choose="'+x.id+'">'+(i+1)+' · Choose this painting</button><button class="textbtn" data-fav="'+x.id+'">'+(prefs.favorites[x.id]?'★ In favorites':'☆ Add to favorites')+'</button></article>').join('')+'</div><div class="comparecontrols"><button data-choose="tie">Equally close · T</button><button id="skip">Skip this pair · S</button><button id="pairUndo" '+(!state.events.length?'disabled':'')+'>Undo last choice</button></div><p class="help">Pairings favor less-compared paintings and nearby ratings. Ratings start equal at 1,000 and update after each choice; early rankings are provisional. Skips do not affect ratings. Historical praise is hidden while choosing.</p>');
}
function renderRanking(){
 const xs=filtered('artworks').filter(x=>prefs.rank[x.id]).sort((a,b)=>prefs.rank[b.id].rating-prefs.rank[a.id].rating);
 const fav=C.items.filter(x=>prefs.favorites[x.id]&&x.exists&&!excluded(x));
 $('#view').innerHTML='<div class="sectionhead"><div><h2>Your emerging order</h2><p class="help">This ranking uses only your head-to-head choices. Favorites are a separate shortlist; an upvote or final approval does not secretly add rating points.</p></div><button data-tab="compare">Compare more →</button></div>'+
 (xs.length?'<div class="tablewrap"><table><thead><tr><th>Rank</th><th>Painting</th><th>Alignment</th><th>Rating</th><th>Comparisons</th><th>Confidence</th></tr></thead><tbody>'+xs.map((x,i)=>{const r=prefs.rank[x.id];return '<tr><td>'+ (i+1)+'</td><td><button class="tablelink" data-open="'+x.id+'"><img src="'+esc(x.thumb)+'" alt=""><span class="rowtitle">'+esc(x.title)+'</span></button></td><td>'+esc(assigned(x))+'</td><td>'+Math.round(r.rating)+'</td><td>'+r.n+'</td><td>'+(r.n<5?'Just starting':r.n<15?'Emerging':'More established')+'</td></tr>'}).join('')+'</tbody></table></div>':'<div class="empty"><h2>Your ranking starts with a choice.</h2><p>Try a few head-to-head comparisons. No scores have been invented from your old comments.</p><button data-tab="compare">Start comparing →</button></div>')+
 '<h2 style="margin-top:35px">Your favorites · '+fav.length+'</h2>'+(fav.length?'<div class="grid">'+fav.map(x=>card(x,false)).join('')+'</div>':'<p class="help">Star paintings in Pick favorites to build a shortlist.</p>');
}
function renderHistoricalInsights(){
 $('#view').innerHTML='<div class="sectionhead"><div><h2>Earlier written feedback</h2><p class="help">An interpretation of recorded normal-art feedback, not a numerical quality score. Specific praise, final approval, and a request for revision mean different things.</p></div></div><div class="insights">'+C.analysis.map(x=>'<article class="insight"><p class="eyebrow">'+esc(x.alignment)+'</p><h2>'+esc(x.headline)+'</h2><p>'+esc(x.body)+'</p></article>').join('')+'</div><h2 style="margin-top:35px">Earlier praise mentions, with denominators</h2><p class="help">Current Set 7–11 paintings, reviewed November 10. These are praise mentions—not approval rates. The sample is small and comments are selective. Vigil’s zero means no specific praise captured in this sample, not poor performance.</p><div class="tablewrap"><table><thead><tr><th>Alignment</th><th>Explicitly praised</th><th>Current paintings</th><th>Share with praise</th></tr></thead><tbody>'+C.recentStats.map(s=>'<tr><td>'+s.alignment+'</td><td>'+s.praised+'</td><td>'+s.total+'</td><td><div class="bar"><span style="width:'+s.praised/s.total*100+'%"></span></div><small>'+Math.round(s.praised/s.total*100)+'%</small></td></tr>').join('')+'</tbody></table></div><div class="guide"><strong>The practical loop:</strong> approve or exclude references → pick a few favorites → compare them occasionally → use the saved selection guide when making the next batch. A downvote excludes a reference; losing a comparison does not.</div><details open><summary>How this was counted</summary><ul>'+C.methodology.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p class="help">'+C.sources.length+' manifest files audited. '+C.items.filter(x=>x.reference&&!x.exists).length+' referenced files are unavailable and are omitted from the visual gallery. Their documented historical uses remain in the catalogue; deleted art has not been restored.</p></details>';
}
function renderInsights(){
 renderHistoricalInsights();
 const stats=alignmentResults(),total=state.events.filter(e=>e.type==='compare').length;
 if(!stats.length)return;
 const rows=stats.map(x=>'<tr><td>'+esc(x.alignment)+'</td><td>'+x.wins+'</td><td>'+x.n+'</td><td>'+Math.round(100*x.wins/x.n)+'%</td></tr>').join('');
 $('#view').insertAdjacentHTML('afterbegin','<div class="sectionhead"><div><h2>Your current alignment comparisons</h2><p class="help">'+total+' saved head-to-head choices. This table counts only matches between different alignments; ties count as half a win. Pairings and sample sizes are uneven, so treat these as directions to investigate, not definitive quality scores.</p></div></div><div class="tablewrap"><table><thead><tr><th>Alignment</th><th>Wins</th><th>Cross-alignment matches</th><th>Win share</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="guide"><a href="/new-studies.html">Review the new action scenes and character sheets →</a></div>');
}
function render(){
 $('#toolbar').hidden=tab==='insights';
 $('#alignment').previousElementSibling.textContent=tab==='references'?'Used for alignment':'Artwork alignment';
 if(tab==='references'||tab==='artworks')renderGallery();
 else if(tab==='compare')renderCompare();
 else if(tab==='ranking')renderRanking();
 else renderInsights();
 renderMetrics();
}
function openDetail(id){
 const x=byId[id];if(!x)return;dialogItem=id;
 const users=x.usedBy.map(id=>byId[id]).filter(Boolean);
 $('#detailBody').innerHTML='<img class="detailimage" src="'+esc(src(x))+'" alt="'+esc(x.title)+'"><div class="detailcontent"><p class="eyebrow">'+esc(x.kind)+' · '+esc(x.status)+'</p><h2>'+esc(x.title)+'</h2><div class="detailcols"><div><p class="help">'+x.uses+' documented reference uses overall. '+esc(x.alignmentBasis)+'.</p><div class="chips">'+Object.entries(x.usesByAlignment).filter(([a,n])=>n).map(([a,n])=>'<span class="chip">'+a+' '+n+'</span>').join('')+'</div><div class="actions">'+(x.reference?'<button data-vote="1" data-id="'+id+'" class="'+(vote(x)===1?'on':'')+'">↑ Use more</button><button data-vote="-1" data-id="'+id+'" class="down '+(vote(x)===-1?'on':'')+'">↓ Exclude</button>':'')+'<button data-fav="'+id+'">'+(prefs.favorites[id]?'★ In favorites':'☆ Favorite')+'</button></div><label for="detailAlignment">Reference / artwork alignment label</label><select id="detailAlignment">'+C.alignments.map(a=>'<option '+(assigned(x)===a?'selected':'')+'>'+a+'</option>').join('')+'</select><p class="help">An organizational label for future selection; it does not change lore or rewrite historical usage.</p><label for="note">What should future art learn or avoid?</label><textarea id="note" maxlength="2000" placeholder="For example: keep the lighting; don’t copy this pose.">'+esc(prefs.notes[id]||'')+'</textarea><button id="saveNote">Save note</button><p><a href="'+esc(src(x))+'" target="_blank" rel="noopener">Open full-size painting ↗</a></p></div><div><h3>Recorded review</h3>'+(x.feedback.length?x.feedback.slice(0,6).map(f=>'<div class="history"><p>'+esc(f.text)+'</p><small>'+esc(f.context)+' · '+esc(f.source)+'</small></div>').join(''):'<p class="help">No specific taste feedback found. '+esc(x.status)+' is a status, not a score.</p>')+'<details><summary>Used by '+users.length+' artworks</summary><div class="usedlist">'+users.map(y=>y.exists?'<button data-open="'+y.id+'">'+esc(y.title)+' · '+esc(y.alignment)+'</button>':'<span class="chip">'+esc(y.title)+' · unavailable</span>').join('')+'</div></details><details><summary>Provenance</summary><p class="help">'+esc(x.path)+'</p>'+x.sources.map(s=>'<p class="help">'+esc(s)+'</p>').join('')+'</details></div></div></div>';
 if(!$('#detail').open)$('#detail').showModal();
}
async function undo(){if(await persist({type:'undo'})){pair=null;render();toast('Last choice undone.')} }
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.tab){setTab(b.dataset.tab);return}
 if(b.dataset.open){openDetail(b.dataset.open);return}
 if(b.dataset.vote){
  const x=byId[b.dataset.id],v=Number(b.dataset.vote),next=vote(x)===v?0:v;
  if(await persist({type:'vote',item:x.id,value:next})){render();if($('#detail').open)openDetail(x.id);toast(next===-1?'Excluded from future reference selection.':next===1?'Marked as a preferred reference.':'Reference vote cleared.')}return;
 }
 if(b.dataset.fav){
  const id=b.dataset.fav;
  if(await persist({type:'favorite',item:id,value:!prefs.favorites[id]})){render();if($('#detail').open)openDetail(id)}return;
 }
 if(b.dataset.page){page+=Number(b.dataset.page);render();$('#toolbar').scrollIntoView({behavior:'smooth'});return}
 if(b.dataset.pool){poolMode=b.dataset.pool;pair=null;render();return}
 if(b.dataset.choose&&pair){
  const [a,c]=pair;if(await persist({type:'compare',a:a.id,b:c.id,winner:b.dataset.choose})){sessionChoices++;lastPairs.push([a.id,c.id].sort().join(':'));lastPairs=lastPairs.slice(-8);pair=null;render();}return;
 }
 if(b.id==='skip'){if(pair)lastPairs.push(pair.map(x=>x.id).sort().join(':'));pair=null;render();return}
 if(b.id==='undo'||b.id==='pairUndo'){await undo();return}
 if(b.id==='close'){$('#detail').close();dialogItem=null;return}
 if(b.id==='saveNote'){if(await persist({type:'note',item:dialogItem,value:$('#note').value})){toast('Note saved for the next art batch.');render()}return}
 if(b.id==='export'){
  let payload;
  try{payload=local?{state,catalogVersion:C.generatedAt}:await(await fetch('/api/export')).json();
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='breachline-art-feedback-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){toast('Export could not be loaded. Try again.')}
 }
});
$('#detail').addEventListener('change',async e=>{if(e.target.id==='detailAlignment'){if(await persist({type:'alignment',item:dialogItem,value:e.target.value})){render();toast('Alignment label saved.')}}});
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){$('#detail').close();dialogItem=null}});
$('#detail').addEventListener('close',()=>dialogItem=null);
for(const id of ['alignment','kind','review','sort'])$('#'+id).addEventListener('change',()=>{page=0;pair=null;render()});
let searchTimer;$('#search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{page=0;pair=null;render()},150)});
document.addEventListener('keydown',e=>{
 if(tab!=='compare'||$('#detail').open||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||e.metaKey||e.ctrlKey)return;
 const selector=e.key==='1'&&pair?'[data-choose="'+pair[0].id+'"]':e.key==='2'&&pair?'[data-choose="'+pair[1].id+'"]':e.key.toLowerCase()==='t'?'[data-choose="tie"]':e.key.toLowerCase()==='s'?'#skip':null;
 if(selector){e.preventDefault();$(selector)?.click()}
});
async function init(){
 $('#alignment').innerHTML='<option value="all">All alignments</option>'+C.alignments.map(a=>'<option>'+a+'</option>').join('');
 try{
  if(local){const saved=localStorage.getItem(storeKey);if(saved)state=JSON.parse(saved);$('#saveStatus').textContent='Browser-only mode · export to share'}
  else{const r=await fetch('/api/state');if(!r.ok)throw Error();state=await r.json();$('#saveStatus').textContent='✓ Saves to your project'}
  ready=true;
 }catch(e){$('#saveStatus').textContent='Feedback unavailable · reload to reconnect'}
 const query=new URLSearchParams(location.search);if(query.has('search'))$('#search').value=query.get('search');if(query.get('pool')==='all')poolMode='all';
 replay();const initial=location.hash.slice(1);if(['references','artworks','compare','ranking','insights'].includes(initial))tab=initial;render();document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
}
init();
