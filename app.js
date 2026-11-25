import {FX} from './effects/index.js';
import {P,PN} from './palettes.js';

const $=id=>document.getElementById(id);
const c=$('c'),x=c.getContext('2d'),S=4;
const L=$('l'),es=$('es'),as=$('as'),ap=$('ap'),af=$('af');
const gate=$('gate'),gt=$('gt'),out=$('out'),v=$('v'),dl=$('dl'),clBtn=$('cl');
const pe=$('pe'),ne=$('ne'),pp=$('pp'),pz=$('pz'),zo=$('zo'),zi=$('zi'),ci=$('ci'),rec=$('rec'),rl=$('rl');

let W=400,H=225,s,sx,img,d;
const B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(val=>(val+.5)/16);

// Optional instrumental dreamcore soundtracks (encoded into recorded video when selected)
const TRACKS=[
  {id:'',name:'no audio',src:''},
  {id:'liminal-poolrooms',name:'♪ Liminal Poolrooms',src:'audio/liminal-poolrooms.mp3'},
  {id:'vhs-daydream',name:'♪ VHS Daydream',src:'audio/vhs-daydream.mp3'}
];

let e=0,p=0,aIdx=1,pic=null,pad=.12,gated=false,t0=performance.now();
let ac=null,prevNode=null,prevStart=0,prevBuf=null,blobUrl=null,playToken=0,wantPlay=false,unlockArmed=false;
const audioBufs=new Map();

function getAC(){
  if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();
  return ac;
}

async function loadTrack(trk){
  if(!trk||!trk.src)return null;
  if(audioBufs.has(trk.src))return audioBufs.get(trk.src);
  const ctx=getAC();
  const ab=trk.buf?trk.buf.slice(0):await (await fetch(trk.src)).arrayBuffer();
  const decoded=await ctx.decodeAudioData(ab);
  audioBufs.set(trk.src,decoded);
  return decoded;
}

function stopPreview(clearIntent=true){
  playToken++;
  if(clearIntent)wantPlay=false;
  if(prevNode){try{prevNode.stop()}catch{}prevNode.disconnect();prevNode=null}
  ap.classList.remove('on');ap.textContent='♪';
}

async function startPreview(fromGesture=false){
  const trk=TRACKS[aIdx];
  if(!trk||!trk.src){stopPreview();return}
  stopPreview(false);
  wantPlay=true;
  const tok=++playToken;
  ap.textContent='…';
  try{
    const ctx=getAC();
    const res=ctx.state==='suspended'?ctx.resume().catch(()=>{}):null;
    const buf=await loadTrack(trk);
    if(res){
      if(fromGesture)await res;
      else await Promise.race([res,new Promise(r=>setTimeout(r,80))]);
    }
    if(tok!==playToken||!buf||TRACKS[aIdx]!==trk)return;
    if(ctx.state!=='running'){
      ap.classList.remove('on');ap.textContent='♪';
      armUnlock();
      return;
    }
    const src=ctx.createBufferSource();
    src.buffer=buf;src.loop=true;
    src.connect(ctx.destination);
    src.start(0);
    prevNode=src;prevBuf=buf;prevStart=ctx.currentTime;
    ap.classList.add('on');ap.textContent='■';
  }catch(err){
    if(tok===playToken){ap.classList.remove('on');ap.textContent='♪'}
    console.error('Audio load failed:',err);
  }
}

function armUnlock(){
  if(unlockArmed)return;
  unlockArmed=true;
  const unlock=ev=>{
    unlockArmed=false;
    removeEventListener('pointerdown',unlock,true);
    removeEventListener('keydown',unlock,true);
    if(ev&&ev.target===ap)return;
    if(wantPlay&&!prevNode&&TRACKS[aIdx]&&TRACKS[aIdx].src)startPreview(true);
  };
  addEventListener('pointerdown',unlock,true);
  addEventListener('keydown',unlock,true);
}

function togglePreview(){
  const trk=TRACKS[aIdx];
  if(!trk||!trk.src){stopPreview();return}
  if(prevNode)stopPreview();
  else startPreview(true);
}

function buildAudioSelect(){
  as.innerHTML='';
  TRACKS.forEach((trk,idx)=>{
    const op=document.createElement('option');
    op.value=String(idx);op.textContent=trk.name;
    as.appendChild(op);
  });
  const up=document.createElement('option');
  up.value='__upload__';up.textContent='+ load audio…';
  as.appendChild(up);
  as.value=String(aIdx);
  ap.disabled=!TRACKS[aIdx]||!TRACKS[aIdx].src;
}

function setAudio(idx,autoplay=true,fromGesture=false){
  stopPreview();
  aIdx=idx>=0&&idx<TRACKS.length?idx:0;
  as.value=String(aIdx);
  ap.disabled=!TRACKS[aIdx]||!TRACKS[aIdx].src;
  if(autoplay&&TRACKS[aIdx]&&TRACKS[aIdx].src)startPreview(fromGesture);
}

function findAudio(key){
  if(key===null||key===undefined||key==='')return -1;
  const k=String(key).trim().toLowerCase();
  if(k==='none'||k==='off'||k==='mute'||k==='silent')return 0;
  const byId=TRACKS.findIndex(t=>t.id&&t.id.toLowerCase()===k);
  if(byId>=0)return byId;
  const n=Number(k);
  return Number.isInteger(n)&&n>=0&&n<TRACKS.length?n:-1;
}

async function addAudioFile(file){
  const buf=await file.arrayBuffer();
  const id='custom-'+Date.now();
  const name='♪ '+file.name.replace(/\.[^.]+$/,'');
  TRACKS.push({id,name,src:id,buf});
  aIdx=TRACKS.length-1;
  buildAudioSelect();
  setAudio(aIdx,!gated,true);
}

function buildSelect(){
  es.innerHTML='';
  const cats=[];
  for(const fx of FX)if(!cats.includes(fx.cat))cats.push(fx.cat);
  for(const cat of cats){
    const og=document.createElement('optgroup');
    og.label=cat;
    FX.forEach((fx,idx)=>{
      if(fx.cat!==cat)return;
      const op=document.createElement('option');
      op.value=idx;op.textContent=fx.name;
      og.appendChild(op);
    });
    es.appendChild(og);
  }
}

function findEffect(key){
  if(!key)return -1;
  const k=String(key).trim().toLowerCase();
  const byName=FX.findIndex(fx=>fx.name.toLowerCase()===k);
  if(byName>=0)return byName;
  const n=Number(k);
  return Number.isInteger(n)&&n>=0&&n<FX.length?n:-1;
}

function findPalette(key){
  if(!key)return -1;
  const k=String(key).trim().toLowerCase();
  const byName=PN.indexOf(k);
  if(byName>=0)return byName;
  const n=Number(k);
  return Number.isInteger(n)&&n>=0&&n<P.length?n:-1;
}

function setEffect(idx,syncHash=true,palOverride=-1){
  e=(idx%FX.length+FX.length)%FX.length;
  p=palOverride>=0?palOverride:FX[e].pal;
  es.value=String(e);
  document.title='retro-loops — '+FX[e].name;
  if(syncHash&&location.hash!=='#'+FX[e].name){
    history.replaceState(null,'','#'+FX[e].name);
  }
}

function applyUrl(initial=false){
  const qs=new URLSearchParams(location.search);
  const hashKey=location.hash.replace(/^#/,'');
  const target=findEffect(hashKey||qs.get('e')||qs.get('effect'));
  const pal=findPalette(qs.get('p')||qs.get('pal')||qs.get('palette'));
  const audParam=qs.get('a')??qs.get('audio');
  const aud=audParam!==null?findAudio(audParam):(initial?aIdx:-1);
  const effectiveAudio=aud>=0?aud:aIdx;
  const wantGate=initial&&(effectiveAudio>0||qs.get('gate')==='1')&&qs.get('gate')!=='0';
  if(aud>=0&&aud!==aIdx)setAudio(aud,!wantGate);
  else if(initial&&effectiveAudio>0&&!wantGate)setAudio(effectiveAudio,true);
  setEffect(target>=0?target:0,false,pal);
  if(wantGate){
    gated=true;
    const trk=TRACKS[aIdx];
    gt.textContent=trk&&trk.src?'loading '+trk.name+'…':'▶ click to start';
    gate.classList.add('on');
    if(trk&&trk.src){
      loadTrack(trk).then(()=>{
        if(gated)gt.textContent='▶ click to start · '+trk.name;
      }).catch(()=>{
        if(gated)gt.textContent='▶ click to start';
      });
    }
  }
}

async function enter(){
  if(!gated)return;
  gated=false;
  gate.classList.remove('on');
  const ctx=getAC();
  if(ctx.state==='suspended'){try{await ctx.resume()}catch{}}
  t0=performance.now();
  if(TRACKS[aIdx]&&TRACKS[aIdx].src)startPreview(true);
  requestAnimationFrame(f);
}
gate.onclick=enter;

function size(){
  let ar=16/9;
  if(pic){const iw=pic.width,ih=pic.height,m=Math.max(iw,ih)*pad*2;ar=(iw+m)/(ih+m)}
  W=Math.round(Math.sqrt(90000*ar));H=Math.round(90000/W);W+=W&1;H+=H&1;
  c.width=W*S;c.height=H*S;
  s=document.createElement('canvas');s.width=W;s.height=H;sx=s.getContext('2d');
  img=sx.createImageData(W,H);d=img.data;fit();
}

function fit(){
  const ar=W/H;
  c.style.aspectRatio=W+'/'+H;
  c.style.width='min(100vw, calc((100vh - 50px) * '+ar+'))';
  c.style.height='auto';
}

addEventListener('resize',fit);
addEventListener('hashchange',()=>applyUrl(false));

ne.onclick=()=>{setEffect(e+1);if(gated)draw(2.5)};
pe.onclick=()=>{setEffect(e-1);if(gated)draw(2.5)};
es.onchange=()=>{setEffect(Number(es.value));if(gated)draw(2.5)};
as.onchange=()=>{
  if(as.value==='__upload__'){as.value=String(aIdx);af.click();return}
  setAudio(Number(as.value),!gated,true);
  if(gated){
    const trk=TRACKS[aIdx];
    gt.textContent=trk&&trk.src?'▶ click to start · '+trk.name:'▶ click to start';
    if(trk&&trk.src)loadTrack(trk).catch(()=>{});
  }
};
af.onchange=()=>{if(af.files&&af.files[0])addAudioFile(af.files[0]);af.value=''};
ap.onclick=togglePreview;
pp.onclick=()=>{p=(p+1)%P.length;if(gated)draw(2.5)};
ci.onclick=()=>{pic=null;size();if(gated)draw(2.5)};
c.onclick=()=>{setEffect(e+1);if(gated)draw(2.5)};
zi.onclick=()=>{pad=Math.min(.6,pad+.03);size();if(gated)draw(2.5)};
zo.onclick=()=>{pad=Math.max(0,pad-.03);size();if(gated)draw(2.5)};

addEventListener('keydown',ev=>{
  if(document.activeElement===pz||ev.metaKey||ev.ctrlKey||ev.altKey)return;
  if(gated&&(ev.key===' '||ev.key==='Enter')){ev.preventDefault();enter();return}
  if(ev.key==='ArrowRight'){ev.preventDefault();setEffect(e+1);if(gated)draw(2.5)}
  else if(ev.key==='ArrowLeft'){ev.preventDefault();setEffect(e-1);if(gated)draw(2.5)}
  else if(ev.key==='p'||ev.key==='P'){p=(p+1)%P.length;if(gated)draw(2.5)}
});

const setPic=src=>{const im=new Image();im.onload=()=>{pic=im;size();if(gated)draw(2.5)};im.src=src};
const load=file=>{const fr=new FileReader();fr.onload=()=>setPic(fr.result);fr.readAsDataURL(file)};
pz.onfocus=()=>pz.textContent='';
pz.onblur=()=>pz.textContent='click here, then ⌘V';
document.addEventListener('paste',ev=>{
  ev.preventDefault();
  const its=ev.clipboardData&&ev.clipboardData.items||[];
  for(const it of its)if(it.type.startsWith('image/')){load(it.getAsFile());break}
  pz.innerHTML='';
},true);
addEventListener('dragover',ev=>ev.preventDefault());
addEventListener('drop',ev=>{
  ev.preventDefault();
  const f0=ev.dataTransfer.files[0];
  if(!f0)return;
  if(f0.type.startsWith('image/'))load(f0);
  else if(f0.type.startsWith('audio/'))addAudioFile(f0);
});

clBtn.onclick=ev=>{ev.preventDefault();v.pause();out.style.display='none'};
let lp=0;const T=6;
rl.onclick=()=>{if(rec.classList.contains('on'))return;go(true)};
rec.onclick=()=>go(false);

async function go(loop){
  if(rec.classList.contains('on'))return;
  const trk=TRACKS[aIdx];
  const hasAudio=Boolean(trk&&trk.src);
  const mimes=hasAudio
    ?['video/mp4;codecs=avc1,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
    :['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'];
  const mt=mimes.find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
  if(!mt){alert('Recording not supported here');return}
  rec.classList.add('on');rec.textContent=hasAudio?'loading…':'rec…';
  let recAudioNode=null,dest=null,vStream=null;
  try{
    vStream=c.captureStream(30);
    const tracks=[...vStream.getVideoTracks()];
    let offset=0;
    if(hasAudio){
      if(prevNode&&prevBuf){offset=((ac.currentTime-prevStart)%prevBuf.duration+prevBuf.duration)%prevBuf.duration;stopPreview()}
      const buf=await loadTrack(trk);
      const ctx=getAC();
      if(ctx.state==='suspended')await ctx.resume();
      dest=ctx.createMediaStreamDestination();
      const gain=ctx.createGain();
      const now=ctx.currentTime;
      gain.gain.setValueAtTime(.001,now);
      gain.gain.linearRampToValueAtTime(1,now+.12);
      gain.gain.setValueAtTime(1,now+T-.32);
      gain.gain.linearRampToValueAtTime(.001,now+T);
      recAudioNode=ctx.createBufferSource();
      recAudioNode.buffer=buf;recAudioNode.loop=true;
      recAudioNode.connect(gain);
      gain.connect(dest);
      gain.connect(ctx.destination);
      recAudioNode.start(now,offset%buf.duration);
      tracks.push(...dest.stream.getAudioTracks());
    }
    const stream=new MediaStream(tracks);
    const opts={mimeType:mt,videoBitsPerSecond:12e6};
    if(hasAudio)opts.audioBitsPerSecond=192000;
    const r=new MediaRecorder(stream,opts),ch=[];
    r.ondataavailable=q=>{if(q.data&&q.data.size)ch.push(q.data)};
    r.onstop=()=>{
      if(recAudioNode){try{recAudioNode.stop()}catch{}recAudioNode.disconnect()}
      if(vStream)vStream.getTracks().forEach(t=>t.stop());
      if(dest)dest.stream.getTracks().forEach(t=>t.stop());
      if(blobUrl)URL.revokeObjectURL(blobUrl);
      const blob=new Blob(ch,{type:mt.split(';')[0]});
      blobUrl=URL.createObjectURL(blob);
      v.muted=!hasAudio;
      v.src=blobUrl;v.load();v.play().catch(()=>{});
      dl.href=blobUrl;
      const ext=mt.includes('mp4')?'mp4':'webm';
      dl.download=FX[e].name+(hasAudio?'-'+trk.id:'')+(loop?'-loop':'')+'.'+ext;
      out.style.display='block';rec.classList.remove('on');rec.textContent='● 6s';lp=0;
    };
    if(loop)lp=performance.now();
    rec.textContent='rec…';
    r.start(250);
    setTimeout(()=>r.stop(),T*1000);
  }catch(err){
    if(recAudioNode){try{recAudioNode.stop()}catch{}}
    if(vStream)vStream.getTracks().forEach(t=>t.stop());
    if(dest)dest.stream.getTracks().forEach(t=>t.stop());
    rec.classList.remove('on');rec.textContent='● 6s';lp=0;
    alert('Recording failed: '+(err&&err.message||err));
  }
}

let LT=0;
function draw(t){
  LT=lp?Math.min(T,(performance.now()-lp)/1000):0;
  const pal=P[p],fn=FX[e].fn,hw=H/W;
  for(let j=0;j<H;j++){
    const vv=(j/H-.5)*hw,by=(j&3)*4,row=j*W;
    for(let i=0;i<W;i++){
      const u=i/W-.5;
      let g;
      if(lp){const tt=LT,a=tt/T;g=(1-a)*fn(u,vv,tt+100)+a*fn(u,vv,tt+100-T)}
      else g=fn(u,vv,t);
      g=(g<0?0:g>.999?.999:g)*4;
      const b=g|0,q=g-b>B[by+(i&3)]?b+1:b,col=pal[q],k=(row+i)*4;
      d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255;
    }
  }
  sx.putImageData(img,0,0);
  x.imageSmoothingEnabled=false;
  x.drawImage(s,0,0,W*S,H*S);
  if(pic){
    const iw=pic.width,ih=pic.height,m=Math.max(iw,ih)*pad*2;
    const k=Math.min(W*S/(iw+m),H*S/(ih+m)),w=iw*k,h=ih*k;
    x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
    x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=40;
    x.drawImage(pic,(W*S-w)/2,(H*S-h)/2,w,h);
    x.shadowBlur=0;
  }
  const audTag=TRACKS[aIdx]&&TRACKS[aIdx].src?' · '+TRACKS[aIdx].name:'';
  L.textContent=FX[e].cat+' / '+FX[e].name+' · '+PN[p]+audTag+(pic?' · bg '+Math.round(pad*100)+'%':'');
}

function f(){
  if(gated)return;
  draw((performance.now()-t0)/1000);
  requestAnimationFrame(f);
}

window.retroLoops={
  FX,P,PN,TRACKS,draw,loadTrack,
  get state(){return{e,p,aIdx,gated,playing:Boolean(prevNode),acState:ac?ac.state:null,cached:audioBufs.size}}
};

buildSelect();buildAudioSelect();applyUrl(true);size();
if(gated)draw(2.5);else f();
