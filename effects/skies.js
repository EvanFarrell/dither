import {cl,sm,fr,vn,fbm} from './noise.js';

export const skies=[
  {name:'clouds',cat:'skies',pal:6,fn:(u,v,t)=>{
    const h=0.01;
    const sky=cl(.14+sm(-.28,h,v)*.58);
    // Soft sun glow high right
    const sun=Math.exp(-Math.hypot(u-.24,v+.17)*5.2)*.42;
    if(v<h){
      // High perspective cirrus strata
      const zs=.16/(h-v+.055);
      const cir=fbm(u*zs*1.1-t*.14,zs*.65+t*.18);
      const wisp=sm(.46,.82,cir)*sm(h,-.18,v)*.48;
      return cl(sky+sun+wisp);
    }
    // Billowing lower cloudbank sea scrolling toward viewer
    const z=.24/(v-h+.065);
    const px=u*z*1.35+t*.16,pz=z*1.15-t*.58;
    const c1=fbm(px,pz);
    const c2=fbm(px-.14,pz-.16);
    const puff=sm(.34,.74,c1);
    const shade=cl(.42+(c1-c2)*2.6,0,1);
    const deck=.16+puff*(.36+.56*shade);
    const fog=Math.exp(-(v-h)*11);
    return cl(deck*(1-fog)+(.74+sun*.4)*fog);
  }},

  {name:'godrays',cat:'skies',pal:6,fn:(u,v,t)=>{
    const sx=.1*Math.sin(t*.24),sy=-.11+.03*Math.cos(t*.19);
    const dx=u-sx,dy=v-sy,r=Math.hypot(dx,dy)+1e-4,a=Math.atan2(dy,dx);
    // Shifting angular light beams
    const b1=Math.pow(.5+.5*Math.sin(a*7+t*.32),2);
    const b2=Math.pow(.5+.5*Math.sin(a*15-t*.48+1.1),3);
    const b3=vn(a*2.6+t*.18,r*1.8-t*.14);
    const rays=(b1*.5+b2*.5)*(0.45+0.75*b3)*Math.exp(-r*1.65)*sm(.02,.11,r);
    // Atmospheric gradient + bright solar core
    const bg=.12+sm(-.28,.28,v)*.24;
    const core=Math.exp(-r*6.5)*.95+Math.exp(-r*2.4)*.38;
    // Soft upper cloud veil & lower mist silhouettes
    const topCloud=sm(.46,.76,fbm(u*4.2+t*.12,v*5.2-t*.04))*sm(.08,-.26,v);
    const botMist=sm(.48,.8,fbm(u*3.6-t*.1,v*4.8+.8))*sm(-.04,.28,v);
    return cl(bg+core+rays*.82-topCloud*.26+botMist*.18);
  }},

  {name:'sunslice',cat:'skies',pal:0,fn:(u,v,t)=>{
    const h=.035;
    const sr=Math.hypot(u,v+.055);
    if(v<h){
      // Dusk sky + faint cloud bands
      const sky=.08+Math.pow(sm(-.28,h,v),1.7)*.44;
      const band=sm(.55,.82,fbm(u*4.5-t*.18,v*11))*.15*sm(h,-.22,v);
      const halo=Math.exp(-sr*4.8)*.36;
      // Giant sliced retro sun
      if(sr<.175){
        const edge=sm(.175,.166,sr);
        let slice=1;
        if(v>-.065){
          const k=cl((v+.065)/(.12),0,1);
          const ph=fr((v-t*.026)*32);
          slice=sm(k*.52,k*.52+.08,ph);
        }
        const grad=cl(.62+sm(.12,-.2,v)*.42);
        return cl((sky+halo)*(1-edge*slice)+grad*edge*slice);
      }
      return cl(sky+band+halo);
    }
    // Rippling water reflection below horizon
    const d=v-h;
    const z=.08/(d+.012);
    const rip=Math.sin(z*5.5-t*4.2)*.018+Math.sin(u*34+z*2.7-t*2.6)*.008;
    const col=Math.exp(-Math.abs(u+rip)/(.038+d*.42));
    const wave=sm(.15,.85,.5+.5*Math.sin(z*7.2-t*5.4+vn(u*8,z*.4)*2.4));
    const water=.06+d*.14+col*(.28+.68*wave)*Math.exp(-d*1.8);
    const seam=Math.exp(-d*70)*.35;
    return cl(water+seam);
  }},

  {name:'storm',cat:'skies',pal:8,fn:(u,v,t)=>{
    // Rolling thunderheads
    const wx=u*3.2+t*.14,wy=v*4.6-t*.05;
    const warp=vn(wx*.8,wy*.8)*.65;
    const cld=fbm(wx+warp,wy-warp*.5);
    const cldHi=fbm(wx+warp+.12,wy-warp*.5-.14);
    const sky=.06+sm(-.28,.28,v)*.16+cld*.34+cl(cldHi-cld,0,1)*.5;
    // Two asynchronous lightning cells
    const f1=Math.pow(Math.max(0,Math.sin(t*1.17)*Math.sin(t*2.83+.4)),14);
    const f2=Math.pow(Math.max(0,Math.sin(t*.89+2.1)*Math.sin(t*3.41)),16);
    const lx1=-.22+.12*Math.sin(Math.floor(t*.37)*4.1),ly1=-.09;
    const lx2=.24-.1*Math.cos(Math.floor(t*.28)*5.7),ly2=-.05;
    const glow1=f1*Math.exp(-Math.hypot(u-lx1,v-ly1)*3.6)*(.45+cld*.9);
    const glow2=f2*Math.exp(-Math.hypot(u-lx2,v-ly2)*3.8)*(.45+cld*.9);
    // Crisp jagged bolt during strong flash 1
    let bolt=0;
    if(f1>.25&&v>ly1-.05){
      const jag=lx1+(vn(v*22+Math.floor(t*2)*3.1,1.7)-.5)*.085+(v-ly1)*.18;
      bolt=f1*sm(.012,.002,Math.abs(u-jag))*sm(.26,.12,v);
    }
    // Faint slanted rain streaks
    const rain=sm(.82,.96,vn(u*72+v*24,v*16-t*24))*.14;
    return cl(sky+glow1+glow2+bolt+rain);
  }},

  {name:'cumulus',cat:'skies',pal:6,fn:(u,v,t)=>{
    // Deep zenith-to-horizon sky
    const sky=.10+Math.pow(sm(-.28,.28,v),1.35)*.45;
    // Cloud cathedral domes framing sides and bottom
    const drift=t*.035;
    function cloudField(x,y){
      const n=fbm(x*5.2-drift*2.4,y*5.2+1.7);
      let m=0;
      const blobs=[
        [-.36,.16,.24],[-.22,.22,.21],[-.44,.01,.18],
        [.36,.14,.25],[.22,.23,.20],[.44,-.02,.18],
        [.0,.27,.22],[-.12,.25,.17],[.13,.26,.17]
      ];
      for(let i=0;i<blobs.length;i++){
        const b=blobs[i];
        const bx=b[0]+.025*Math.sin(t*.25+i*1.7);
        const by=b[1]+.015*Math.cos(t*.22+i*2.1);
        const d=b[2]-Math.hypot(x-bx,(y-by)*1.18)+(n-.48)*.13;
        if(d>m)m=d;
      }
      return m;
    }
    const c0=cloudField(u,v);
    if(c0<=0){
      // Subtle high mist
      const hi=sm(.6,.9,fbm(u*3.4-drift,v*6.2))*.12*sm(.1,-.25,v);
      return cl(sky+hi);
    }
    // Directional top-left sunlight shading
    const cL=cloudField(u-.018,v-.022);
    const edge=sm(0,.028,c0);
    const lit=cl(.56+(c0-cL)*14.5,0,1);
    const heightLit=sm(.28,-.12,v)*.24;
    const col=.28+.68*cl(lit+heightLit);
    return cl(sky*(1-edge)+col*edge);
  }}
];
