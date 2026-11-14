const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require("/Users/dpuser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const root="/Users/dpuser/Documents/Claude/Games/breachline/art/work-in-progress/set14-wildlife-maps-and-lands-2026-11-14",W=1536,H=1024;
const polygon=(points,dx=0,dy=0)=>({points,dx,dy});
const ellipse=(cx,cy,rx,ry,dx=0,dy=0)=>({ellipse:[cx,cy,rx,ry],dx,dy});
const jobs=[
{code:'S14-M1',name:'map-genesis.png',patches:[
polygon([[1051,471],[1081,462],[1108,438],[1118,444],[1112,462],[1143,478],[1157,472],[1170,460],[1178,463],[1175,476],[1193,477],[1211,457],[1227,458],[1249,436],[1260,441],[1255,454],[1286,463],[1300,490],[1286,514],[1240,518],[1170,528],[1080,527],[1054,504]]),
polygon([[646,213],[666,203],[693,200],[704,191],[721,195],[724,213],[739,220],[732,235],[695,247],[649,244]]),
polygon([[706,215],[723,211],[741,227],[775,228],[818,240],[833,245],[822,258],[777,267],[721,270],[699,253]])
]},
{code:'S14-M2',name:'map-gnosis.png',patches:[polygon([[1323,211],[1354,205],[1374,193],[1422,189],[1468,174],[1481,176],[1473,188],[1485,192],[1450,201],[1434,216],[1381,230],[1338,231],[1318,223]])]},
{code:'S14-M3',name:'map-fervor.png',patches:[
ellipse(1320,141,19,14),ellipse(1366,125,18,13),ellipse(1400,109,18,12),ellipse(1430,141,20,14),ellipse(1466,125,19,14)]},
{code:'S14-M4',name:'map-vigil.png',patches:[
ellipse(905,322,18,10,-106,-104),ellipse(971,310,17,10,-133,-106),ellipse(1023,326,17,10,-172,-86),ellipse(1267,578,33,22)]}
];
function bounds(p){let xs,ys;if(p.ellipse){const [x,y,rx,ry]=p.ellipse;xs=[x-rx,x+rx];ys=[y-ry,y+ry];}else{xs=p.points.map(p=>p[0]);ys=p.points.map(p=>p[1]);}const l=Math.floor(Math.min(...xs))-8,t=Math.floor(Math.min(...ys))-8,r=Math.ceil(Math.max(...xs))+8,b=Math.ceil(Math.max(...ys))+8;return {left:l,top:t,width:r-l,height:b-t};}
async function compositePatch(base,donor,p,maskUnion){
 const box=bounds(p), w=box.width,h=box.height,n=w*h;
 let shape;if(p.ellipse){const [cx,cy,rx,ry]=p.ellipse;shape='<ellipse cx="'+(cx-box.left)+'" cy="'+(cy-box.top)+'" rx="'+rx+'" ry="'+ry+'" fill="white"/>';}else shape='<polygon points="'+p.points.map(([x,y])=>(x-box.left)+','+(y-box.top)).join(' ')+'" fill="white"/>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><rect width="100%" height="100%" fill="black"/>'+shape+'</svg>';
 const alpha=await sharp(Buffer.from(svg)).greyscale().blur(1.1).raw().toBuffer();
 const delta=new Float32Array(n*3), inside=new Uint8Array(n), src=new Uint8Array(n*3),dst=new Uint8Array(n*3);
 const sums=[0,0,0]; let cnt=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;const sx=box.left+x,sy=box.top+y,tx=sx+p.dx,ty=sy+p.dy;inside[k]=alpha[k]>=3&&x>0&&y>0&&x<w-1&&y<h-1?1:0;for(let c=0;c<3;c++){src[k*3+c]=donor[(sy*W+sx)*3+c];dst[k*3+c]=base[(ty*W+tx)*3+c];delta[k*3+c]=dst[k*3+c]-src[k*3+c];if(!inside[k])sums[c]+=delta[k*3+c];}if(!inside[k])cnt++;}
 for(let k=0;k<n;k++)if(inside[k])for(let c=0;c<3;c++)delta[k*3+c]=sums[c]/cnt;
 let iterations=0,error=0;
 for(let iter=0;iter<1000;iter++){error=0;for(let parity=0;parity<2;parity++)for(let y=1;y<h-1;y++)for(let x=1+((y+parity+1)%2);x<w-1;x+=2){const k=y*w+x;if(!inside[k])continue;for(let c=0;c<3;c++){const j=k*3+c;const avg=(delta[j-3]+delta[j+3]+delta[j-w*3]+delta[j+w*3])/4;const diff=avg-delta[j];delta[j]+=1.75*diff;error=Math.max(error,Math.abs(diff));}}iterations=iter+1;if(error<0.015)break;}
 let count=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;if(!inside[k])continue;const target=(box.top+y+p.dy)*W+box.left+x+p.dx;maskUnion[target]=255;const a=alpha[k]/255;for(let c=0;c<3;c++)base[target*3+c]=Math.max(0,Math.min(255,Math.round(dst[k*3+c]*(1-a)+(src[k*3+c]+delta[k*3+c])*a)));count++;}
 return {...p,source_box:box,target_box:{...box,left:box.left+p.dx,top:box.top+p.dy},pixels_in_support:count,iterations,boundary_residual:error};
}
(async()=>{fs.mkdirSync(path.join(root,'composite-work','corrected'),{recursive:true});const report=[];
for(const job of jobs){const originalFile=path.join(root,'originals',job.name),donorFile=path.join(root,'history',path.basename(job.name,'.png')+'-v'+({'S14-M1':1,'S14-M2':1,'S14-M3':1,'S14-M4':2})[job.code]+'-full-repaint.png');const original=await sharp(originalFile).removeAlpha().raw().toBuffer(),donor=await sharp(donorFile).removeAlpha().raw().toBuffer(),output=Buffer.from(original),mask=Buffer.alloc(W*H),patches=[];
for(const p of job.patches)patches.push(await compositePatch(output,donor,p,mask));
let outsideChanged=0,changed=0,area=0,maxOutsideDiff=0;for(let k=0;k<W*H;k++){let different=false;for(let c=0;c<3;c++){const d=Math.abs(output[k*3+c]-original[k*3+c]);different ||=d>0;if(!mask[k])maxOutsideDiff=Math.max(maxOutsideDiff,d);}if(mask[k])area++;else if(different)outsideChanged++;if(different)changed++;}
if(outsideChanged)throw Error('Outside mask changed for '+job.name);
const dest=path.join(root,'composite-work','corrected',job.name);await sharp(output,{raw:{width:W,height:H,channels:3}}).png().toFile(dest);
await sharp(mask,{raw:{width:W,height:H,channels:1}}).png().toFile(path.join(root,'composite-work','corrected',job.name.replace('.png','-mask.png')));
report.push({code:job.code,name:job.name,method:'Original RGB pixels plus narrowly masked wildlife patches; harmonic local boundary colour matching; no full-canvas adjustment.',original:originalFile,donor:donorFile,output:dest,patches,total_pixels:W*H,mask_pixels:area,mask_percent:100*area/(W*H),changed_pixels:changed,outside_mask_changed_pixels:outsideChanged,max_outside_channel_difference:maxOutsideDiff,sha256:crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex')});}
fs.writeFileSync(path.join(root,'composite-work','composition-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.map(({code,mask_percent,outside_mask_changed_pixels,max_outside_channel_difference,output})=>({code,mask_percent,outside_mask_changed_pixels,max_outside_channel_difference,output}))));
})();