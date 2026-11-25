import {FX} from './effects/index.js';
import {P,PN} from './palettes.js';
import {renderField} from './render.js';
import {createScenePicker,sceneLabel} from './scene-picker.js';

const $=id=>document.getElementById(id);
const c=$('c'),x=c.getContext('2d'),S=4;
const palette=$('palette'),as=$('as'),ap=$('ap'),af=$('af');
const gate=$('gate'),gt=$('gt'),out=$('out'),v=$('v'),dl=$('dl'),clBtn=$('cl');
const pe=$('pe'),ne=$('ne'),zo=$('zo'),zi=$('zi'),ci=$('ci'),rec=$('rec'),rl=$('rl');
const sceneName=$('scene-name'),sceneCategory=$('scene-category');
const addImage=$('add-image'),imageFile=$('image-file'),imageMargin=$('image-margin');

let W=400,H=225,s,sx,img;

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

const selectSceneButton=createScenePicker($('scene-list'),FX,P,chooseEffect);
$('scene-count').textContent=FX.length;
for(const [index,name] of PN.entries()){
  const option=new Option(sceneLabel(name),index);
  palette.add(option);
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
  const scene=FX[e];
  const label=scene.label??sceneLabel(scene.name);
  p=palOverride>=0?palOverride:scene.pal;
  selectSceneButton(e);
  palette.value=String(p);
  sceneName.textContent=label;
  sceneCategory.textContent=sceneLabel(scene.cat);
  document.title=label+' · Dither';
  if(syncHash&&location.hash!=='#'+scene.name){
    history.replaceState(null,'','#'+scene.name);
  }
}

function chooseEffect(index){
  setEffect(index);
  if(gated)draw(2.5);
}

function setPalette(index){
  p=index;
  palette.value=String(p);
  if(gated)draw(2.5);
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
    gt.textContent=trk&&trk.src?'loading '+trk.name+'…':'▶ Click to start';
    gate.classList.add('on');
    if(trk&&trk.src){
      loadTrack(trk).then(()=>{
        if(gated)gt.textContent='▶ Click to start · '+trk.name;
      }).catch(()=>{
        if(gated)gt.textContent='▶ Click to start';
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
  img=sx.createImageData(W,H);
  c.style.setProperty('--preview-ratio',W/H);
  ci.disabled=zo.disabled=zi.disabled=!pic;
  imageMargin.hidden=!pic;
  imageMargin.value=Math.round(pad*100)+'%';
}

addEventListener('hashchange',()=>{
  applyUrl(false);
  if(gated)draw(2.5);
});

ne.onclick=()=>chooseEffect(e+1);
pe.onclick=()=>chooseEffect(e-1);
palette.onchange=()=>setPalette(Number(palette.value));
as.onchange=()=>{
  if(as.value==='__upload__'){as.value=String(aIdx);af.click();return}
  setAudio(Number(as.value),!gated,true);
  if(gated){
    const trk=TRACKS[aIdx];
    gt.textContent=trk&&trk.src?'▶ Click to start · '+trk.name:'▶ Click to start';
    if(trk&&trk.src)loadTrack(trk).catch(()=>{});
  }
};
af.onchange=()=>{if(af.files&&af.files[0])addAudioFile(af.files[0]);af.value=''};
ap.onclick=togglePreview;
ci.onclick=()=>{pic=null;size();if(gated)draw(2.5)};
c.onclick=()=>chooseEffect(e+1);
zi.onclick=()=>{pad=Math.min(.6,pad+.03);size();if(gated)draw(2.5)};
zo.onclick=()=>{pad=Math.max(0,pad-.03);size();if(gated)draw(2.5)};

$('save-png').onclick=()=>{
  const filename=FX[e].name+'-'+PN[p]+'.png';
  c.toBlob(blob=>{
    if(!blob)return;
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download=filename;
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  },'image/png');
};

addEventListener('keydown',ev=>{
  if(ev.defaultPrevented||ev.metaKey||ev.ctrlKey||ev.altKey)return;
  if(ev.target.closest?.('select, input, textarea, video, [contenteditable]'))return;
  if(gated&&(ev.key===' '||ev.key==='Enter')&&!ev.target.closest?.('button, a')){
    ev.preventDefault();
    enter();
    return;
  }
  if(ev.key==='ArrowRight'){ev.preventDefault();chooseEffect(e+1)}
  else if(ev.key==='ArrowLeft'){ev.preventDefault();chooseEffect(e-1)}
  else if(ev.key==='p'||ev.key==='P'){setPalette((p+1)%P.length)}
});

const setPic=src=>{const im=new Image();im.onload=()=>{pic=im;size();if(gated)draw(2.5)};im.src=src};
const load=file=>{const fr=new FileReader();fr.onload=()=>setPic(fr.result);fr.readAsDataURL(file)};
addImage.onclick=()=>imageFile.click();
imageFile.onchange=()=>{
  if(imageFile.files[0])load(imageFile.files[0]);
  imageFile.value='';
};
document.addEventListener('paste',ev=>{
  const items=ev.clipboardData?.items??[];
  for(const item of items){
    if(item.type.startsWith('image/')){
      const file=item.getAsFile();
      if(file){ev.preventDefault();load(file)}
      break;
    }
  }
});
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

function draw(t){
  const {fn,loopSeconds}=FX[e];
  let field=fn;
  if(lp){
    const progress=Math.min(T,(performance.now()-lp)/1000);
    if(loopSeconds===T){
      t=progress;
    }else{
      const blend=progress/T;
      field=(u,v)=> (1-blend)*fn(u,v,progress+100)+blend*fn(u,v,progress+100-T);
    }
  }
  renderField(img,P[p],field,t);
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

buildAudioSelect();applyUrl(true);size();
if(gated)draw(2.5);else f();
