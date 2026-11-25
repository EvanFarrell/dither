import {cl,sm,h2,fbm,rdg} from './noise.js';

export const space=[
  {name:'starfield',cat:'space',pal:8,fn:(u,v,t)=>{
    const r=Math.hypot(u,v)+1e-4,a=Math.atan2(v,u);
    const an=(a/6.2831853+.5);
    const lr0=Math.log(r);
    // Subtle dark nebula wash so corners feel deep
    let out=.025+.06*fbm(u*3.6+t*.03,v*3.6-t*.02)*sm(.02,.25,r);
    // 3 overlapping radial warp layers
    for(let k=0;k<3;k++){
      const N=k===0?64:k===1?96:140;
      const spd=k===0?.95:k===1?1.45:2.1;
      const ia=Math.floor(an*N);
      const fa=an*N-ia;
      const zOff=h2(ia+k*131,k*37)*12;
      const lr=lr0*(2.4+k*.55)-t*spd+zOff;
      const ir=Math.floor(lr);
      const frr=lr-ir;
      const rnd=h2(ia*7+k*53,ir*13+k*19);
      if(rnd>.62){
        const ca=.18+.64*h2(ia*11+k,ir*17+3);
        const da=Math.abs(fa-ca);
        // Star width narrows near center, streak lengthens outward
        const w=.09+.14*cl(r*2.2);
        const core=sm(w,0,da);
        // Elongated warp tail along radial direction
        const tail=sm(.0,.12,frr)*sm(.92,.14,frr);
        const bright=(.45+.55*((rnd-.62)/.38))*sm(.015,.16,r);
        out+=core*tail*bright*(k===2?1.05:.85);
      }
    }
    return cl(out);
  }},

  {name:'blackhole',cat:'space',pal:2,fn:(u,v,t)=>{
    const ct=.988,st=-.15;
    const px=u*ct-v*st,py=u*st+v*ct;
    const r=Math.hypot(px,py)+1e-4;
    const Rs=.086;
    // Gravitationally lensed background starfield
    let bg=.015;
    if(r>Rs){
      const bend=1-.011/(r-Rs*.55+.025);
      const lu=u*bend,lv=v*bend;
      const sh=h2(Math.floor(lu*210),Math.floor(lv*210));
      if(sh>.992)bg+=((sh-.992)/.008)*.55*sm(Rs,Rs*1.8,r);
    }
    // Primary tilted accretion disc (foreshortened ellipse)
    const rx=px,ry=py/.20;
    const rd=Math.hypot(rx,ry);
    let disc=0;
    if(rd>Rs*1.12&&rd<.41){
      const env=sm(Rs*1.12,Rs*1.48,rd)*sm(.41,.2,rd);
      const da=Math.atan2(ry,rx);
      const swirl=fbm(da*2.2+rd*22-t*1.6,rd*14+t*.35);
      const ring=.45+.35*Math.sin(rd*95-t*2.4+swirl*3.2)+.3*swirl;
      // Relativistic Doppler beaming (left approaching side brighter)
      const dop=cl(.78-px/(rd+.02)*.48,.32,1.35);
      disc=env*cl(ring)*dop;
    }
    // Front disc crosses in front of event horizon
    const frontDisc=disc>0&&py>0&&rd>Rs*1.25;
    if(r<Rs){
      if(frontDisc)return cl(disc*1.15);
      return 0;
    }
    // Photon ring + lensed Einstein halo arching over/under shadow
    const photon=Math.exp(-Math.abs(r-Rs*1.04)*115)*.98;
    const archR=Math.abs(r-Rs*1.28);
    const archAngle=Math.pow(Math.abs(py)/r,1.35);
    const archNoise=.55+.45*fbm(Math.atan2(py,px)*3.2-t*.9,r*18);
    const dopArch=cl(.82-px/r*.42,.4,1.25);
    const arch=Math.exp(-archR*24)*archAngle*archNoise*dopArch*.95;
    const halo=Math.exp(-(r-Rs)*10)*.24;
    return cl(bg+photon+arch+disc*1.05+halo);
  }},

  {name:'galaxy',cat:'space',pal:8,fn:(u,v,t)=>{
    // Tilted galactic disc coordinates
    const ct=.92,st=-.39;
    const px=u*ct-v*st,py=(u*st+v*ct)/.54;
    const rg=Math.hypot(px,py)+1e-4;
    const ga=Math.atan2(py,px);
    // 2 major + 2 faint logarithmic spiral arms
    const twist=Math.log(rg+.028)*5.4;
    const ph1=ga*2-twist-t*.26;
    const ph2=ga*4-twist*1.85-t*.26+1.1;
    const arm1=Math.pow(.5+.5*Math.cos(ph1),2.6);
    const arm2=Math.pow(.5+.5*Math.cos(ph2),3.2)*.35;
    // Knotted cosmic dust & bright H-II star-forming filaments
    const knot=fbm(px*11+Math.cos(t*.08)*.5,py*11-Math.sin(t*.08)*.5);
    const dust=rdg(px*7.5+.4,py*7.5-.7);
    const env=Math.exp(-rg*3.4)*sm(.015,.07,rg);
    const arms=(arm1+arm2)*(.42+.85*knot)*(.6+.5*dust)*env;
    // Bright galactic core bulge
    const core=Math.exp(-rg*8.2)*.98+Math.exp(-rg*3.6)*.34;
    // Sparkling stars both in field and embedded in arms
    const sh=h2(Math.floor(u*230),Math.floor(v*230));
    const tw=.55+.45*Math.sin(t*2.8+sh*90);
    const fieldStar=sh>.993?((sh-.993)/.007)*tw*.78:0;
    const armStar=sh>.965&&arms>.22?((sh-.965)/.035)*arms*tw*1.4:0;
    return cl(.02+core+arms*1.05+fieldStar+armStar);
  }},

  {name:'pulsar',cat:'space',pal:1,fn:(u,v,t)=>{
    const r=Math.hypot(u,v)+1e-4,a=Math.atan2(v,u);
    // Rotating twin relativistic lighthouse beams
    const ang=t*.78+.22*Math.sin(t*.31);
    const da=Math.abs(Math.sin(a-ang));
    const width=11+r*14;
    const beamCore=Math.exp(-da*width);
    const beamWide=Math.exp(-da*4.2)*.32;
    const pulse=.68+.32*Math.sin(r*42-t*5.5);
    const beam=(beamCore*pulse+beamWide)*Math.exp(-r*1.35);
    // Expanding warped supernova remnant dust shells lit up by beam passage
    const wn=fbm(u*6.5+t*.06,v*6.5-t*.04);
    const shells=Math.pow(.5+.5*Math.sin((r+wn*.048)*34-t*.45),4)*sm(.05,.12,r)*Math.exp(-r*1.8);
    const litShells=shells*(.14+.95*beamWide+.85*beamCore);
    // Blazing neutron star core & equatorial shock ring
    const core=Math.exp(-r*22)*1.1+Math.exp(-r*7.5)*.32;
    const ring=Math.exp(-Math.abs(r-.095-.01*wn)*55)*(.2+.5*beamWide);
    // Outer field stars
    const sh=h2(Math.floor(u*220),Math.floor(v*220));
    const st=sh>.994?((sh-.994)/.006)*(.55+.45*Math.sin(t*2.5+sh*80))*.7:0;
    return cl(.02+core+beam*.88+litShells+ring+st);
  }},

  {name:'nebula',cat:'space',pal:0,fn:(u,v,t)=>{
    // Slow billowing domain-warped cosmic pillars
    const tx=u*2.8+t*.04,ty=v*2.8-t*.025;
    const wx=fbm(tx+1.7,ty-2.3),wy=fbm(tx-3.1,ty+1.4);
    const qx=tx+(wx-.5)*1.25,qy=ty+(wy-.5)*1.25;
    const base=fbm(qx*1.4,qy*1.4);
    const ridges=rdg(qx*2.1+.6,qy*2.1-.4);
    // Ionization rims glow brightest where dense pillars meet dark voids
    const pillar=sm(.36,.78,base);
    const ionRim=Math.pow(ridges,1.6)*(.35+.75*pillar);
    // Subtle dark dust lanes carving high-contrast silhouettes
    const voidLane=sm(.32,.66,fbm(qx*2.6-2.1,qy*2.6+3.4));
    let col=.02+pillar*.42+ionRim*.74-voidLane*.28;
    // Deep-field star pinpricks + rare bright stars with 4-point spikes
    const ix=Math.floor(u*210),iy=Math.floor(v*210);
    const sh=h2(ix,iy);
    if(sh>.991){
      const tw=.6+.4*Math.sin(t*2.2+sh*100);
      col+=((sh-.991)/.009)*tw*.95;
    }
    // 3 hero bright stars with crisp cross diffraction spikes
    const heroes=[[-.31,-.14],[.27,.11],[-.06,-.19]];
    for(let i=0;i<3;i++){
      const dx=u-heroes[i][0],dy=v-heroes[i][1];
      const sr=Math.hypot(dx,dy);
      const tw=.75+.25*Math.sin(t*1.8+i*2.3);
      const sp=(Math.exp(-Math.abs(dx)*130)*Math.exp(-Math.abs(dy)*16)+Math.exp(-Math.abs(dy)*130)*Math.exp(-Math.abs(dx)*16))*.55;
      col+=(Math.exp(-sr*45)*.85+sp)*tw;
    }
    return cl(col);
  }}
];
