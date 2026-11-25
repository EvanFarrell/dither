import {cl,sm,fr,h2,vn,fbm} from './noise.js';

export const planets=[
  {name:'saturn',cat:'planets',pal:8,fn:(u,v,t)=>{
    // Starfield background
    const sx=Math.floor(u*230),sy=Math.floor(v*230);
    const sh=h2(sx,sy);
    let bg=.03+.05*fbm(u*3.2+.4,v*3.2-.2);
    if(sh>.993)bg+=((sh-.993)/.007)*(.6+.4*Math.sin(t*2.4+sh*90));
    // Planet tilted coordinates
    const ct=.948,st=-.318; // ~-18.5 deg tilt
    const px=u*ct-v*st,py=u*st+v*ct;
    const R=.138;
    const r2=px*px+py*py;
    const inPlanet=r2<R*R;
    // Tilted ring plane (foreshortened ellipse)
    const rx=px,ry=py/.27;
    const rr=Math.hypot(rx,ry);
    let ring=0,inRing=false;
    if(rr>.178&&rr<.365){
      const outer=sm(.365,.352,rr)*sm(.178,.19,rr);
      // Cassini division gap
      const cass=1-sm(.272,.278,rr)*sm(.296,.29,rr)*.92;
      const encke=1-sm(.336,.339,rr)*sm(.345,.342,rr)*.65;
      const bands=.52+.24*Math.sin(rr*135)+.14*Math.sin(rr*290)+.1*Math.sin(Math.atan2(ry,rx)*3+t*.45);
      // Planet shadow across back-right ring
      const shMask=py<0&&px>.02?1-sm(.02,.07,px)*sm(0,-.04,py)*.78:1;
      ring=outer*cass*encke*cl(bands)*(.35+.65*shMask);
      inRing=ring>.04;
    }
    // Front ring occludes planet; back ring sits behind planet
    const ringFront=inRing&&py>0;
    if(inPlanet&&!ringFront){
      const pz=Math.sqrt(R*R-r2);
      const nx=px/R,ny=py/R,nz=pz/R;
      const band=fbm(nx*2.6+t*.14,ny*7.5);
      const stripes=.58+.26*Math.sin(ny*26+band*2.2)+.16*band;
      const diff=cl(nx*-.68+ny*-.34+nz*.65,0,1);
      const rim=Math.pow(1-nz,2.8)*cl(nx*-.5+ny*-.3+.5,0,1)*.55;
      // Subtle ring shadow across planet equator
      const rSh=1-sm(.04,.01,Math.abs(py-.025))*sm(.04,.1,px+.12)*.42;
      const surf=.05+(Math.pow(diff,.82)*stripes*rSh*.92+rim);
      return cl(surf);
    }
    if(inRing){
      // Blend front ring cleanly over planet edge or starfield
      if(inPlanet&&ringFront){
        const pz=Math.sqrt(R*R-r2),nx=px/R,ny=py/R,nz=pz/R;
        const diff=cl(nx*-.68+ny*-.34+nz*.65,0,1);
        const surf=.05+Math.pow(diff,.82)*.7;
        const a=cl(ring*1.15);
        return cl(surf*(1-a)+(.25+.72*ring)*a);
      }
      return cl(bg*(1-cl(ring))+.16+.82*ring);
    }
    return cl(bg);
  }},

  {name:'eclipse',cat:'planets',pal:8,fn:(u,v,t)=>{
    const r=Math.hypot(u,v)+1e-4,a=Math.atan2(v,u);
    const R=.132;
    // Diamond-ring flare drifting along upper-left limb
    const fa=-2.35+.38*Math.sin(t*.32);
    const fx=R*Math.cos(fa),fy=R*Math.sin(fa);
    const dr=Math.hypot(u-fx,v-fy)+1e-4;
    const flare=Math.exp(-dr*16)*.95+Math.exp(-dr*4.5)*.32;
    // Cross diffraction spikes on diamond ring
    const sp=(Math.exp(-Math.abs(u-fx)*60)*Math.exp(-Math.abs(v-fy)*5.5)+Math.exp(-Math.abs(v-fy)*60)*Math.exp(-Math.abs(u-fx)*5.5))*.55;
    if(r<R){
      // Dark lunar disc with faint earthshine + limb bleed near flare
      const es=cl(.03+sm(R,R*.72,r)*.04+Math.exp(-dr*14)*.55);
      return es;
    }
    // Blazing corona + equatorial streamers
    const d=r-R;
    const chromo=Math.exp(-d*95)*.95;
    const eq=1+.55*Math.pow(Math.cos(a-.2),2);
    const rays=.45+.35*fbm(a*3.4+t*.08,r*5.5-t*.35)+.2*(.5+.5*Math.sin(a*13-t*.28));
    const corona=Math.exp(-d*(5.8/eq))*rays*.92+Math.exp(-d*14)*.55;
    // Far-field stars
    let st=0;
    if(r>.22){
      const sh=h2(Math.floor(u*210),Math.floor(v*210));
      if(sh>.994)st=((sh-.994)/.006)*sm(.22,.32,r)*.7;
    }
    return cl(.02+chromo+corona+flare+sp+st);
  }},

  {name:'jupiter',cat:'planets',pal:2,fn:(u,v,t)=>{
    // Great Red Spot center drifting gently
    const gx=.07*Math.sin(t*.16),gy=.02+.015*Math.cos(t*.14);
    const ex=(u-gx)/.165,ey=(v-gy)/.102;
    const er=Math.hypot(ex,ey);
    // Anticyclonic swirl warp around the spot
    const sw=Math.exp(-er*er*2.1)*3.4;
    const cs=Math.cos(sw),sn=Math.sin(sw);
    const wx=gx+(ex*cs-ey*sn)*.165;
    const wy=gy+(ex*sn+ey*cs)*.102;
    // Sheared zonal jet streams
    const shear=Math.sin(wy*26)*.18*t;
    const n1=fbm(wx*4.8+shear+t*.08,wy*11.5);
    const n2=fbm(wx*9.2-shear*.7-t*.12,wy*19+n1*1.4);
    const lat=wy+n1*.048+(n2-.5)*.022;
    const belts=.48+.28*Math.sin(lat*34)+.14*Math.sin(lat*68+1.2)+.18*(n2-.45);
    // Spot eyewall & dark collar
    const spotRing=Math.exp(-Math.pow((er-.78)*3.8,2))*.34;
    const spotCore=Math.exp(-er*er*2.6)*(.25+.35*Math.sin(er*16-t*1.2+Math.atan2(ey,ex)*2));
    const collar=Math.exp(-Math.pow((er-1.08)*4.5,2))*.26;
    // Gentle planetary curvature limb darkening
    const limb=cl(1-Math.hypot(u*.85,v*1.1)*.52,.28,1);
    return cl((belts+spotRing+spotCore-collar)*limb);
  }},

  {name:'moons',cat:'planets',pal:8,fn:(u,v,t)=>{
    // Deep starfield
    const sh=h2(Math.floor(u*220),Math.floor(v*220));
    let bg=.025;
    if(sh>.993)bg+=((sh-.993)/.007)*(.55+.45*Math.sin(t*2.1+sh*80));
    // Smooth continuous left-to-right translation of the moon (wraps cleanly off-screen)
    const phase=fr(t*.045+.34);
    const mx=-.64+phase*1.28;
    const my=-.075-.045*Math.sin(phase*Math.PI);
    const Rm=.066;
    const md2=(u-mx)**2+(v-my)**2;
    const hitMoon=md2<Rm*Rm;
    // Giant world anchored lower-left
    const cx=-.23,cy=.21,R=.35;
    const pd2=(u-cx)**2+(v-cy)**2;
    const hitPlanet=pd2<R*R;
    // Light direction (upper-right)
    const lx=.7,ly=-.5,lz=.51;
    if(hitMoon){
      const z=Math.sqrt(Rm*Rm-md2);
      const nx=(u-mx)/Rm,ny=(v-my)/Rm,nz=z/Rm;
      const diff=cl(nx*lx+ny*ly+nz*lz,0,1);
      const tex=.72+.28*fbm(nx*4.5+2.1,ny*4.5-1.3);
      const rim=Math.pow(1-nz,3)*cl(nx*lx+ny*ly+.35,0,1)*.35;
      return cl(.03+Math.pow(diff,.85)*tex*.92+rim);
    }
    if(hitPlanet){
      const z=Math.sqrt(R*R-pd2);
      const nx=(u-cx)/R,ny=(v-cy)/R,nz=z/R;
      const diff=cl(nx*lx+ny*ly+nz*lz,0,1);
      // Continents/mare + small crater pits
      const mare=fbm(nx*4.2+t*.03,ny*4.2);
      const cr=vn(nx*14+t*.08,ny*14);
      const crater=sm(.74,.86,cr)*.18-sm(.62,.74,cr)*.08;
      const tex=.56+.36*mare+crater;
      const rim=Math.pow(1-nz,3.2)*cl(diff+.25,0,1)*.62;
      // Soft eclipse shadow translating continuously in lockstep with the moon
      const sd=Math.hypot(u-(mx-.048),v-(my+.038));
      const shd=sm(Rm*.75,Rm*1.3,sd)*.76+.24;
      return cl(.035+Math.pow(diff,.8)*tex*shd*.88+rim);
    }
    return cl(bg);
  }},

  {name:'oceanworld',cat:'planets',pal:1,fn:(u,v,t)=>{
    const h=.045;
    const cx=.04,cy=-.115,R=.225;
    function skyColor(x,y){
      let col=.04+sm(-.28,h,y)*.18;
      const dx=x-cx,dy=y-cy,d2=dx*dx+dy*dy;
      if(d2<R*R){
        const z=Math.sqrt(R*R-d2);
        const nx=dx/R,ny=dy/R,nz=z/R;
        const diff=cl(nx*.78+ny*-.46+nz*.42,0,1);
        const cld=.7+.3*fbm(nx*4.8-t*.07,ny*6.2);
        const rim=Math.pow(1-nz,2.8)*cl(nx*.65-ny*.35+.35,0,1)*.65;
        return cl(.04+Math.pow(diff,.75)*cld*.9+rim);
      }
      // Atmospheric limb halo + stars
      const dist=Math.sqrt(d2)-R;
      const halo=Math.exp(-dist*22)*.26*cl((dx/R)*.6-(dy/R)*.35+.5,0,1);
      const sh=h2(Math.floor(x*210),Math.floor(y*210));
      const st=sh>.994?((sh-.994)/.006)*sm(h,-.12,y)*.75:0;
      return cl(col+halo+st);
    }
    if(v<h)return skyColor(u,v);
    // Perspective rippling tidal ocean reflecting the giant crescent world
    const d=v-h;
    const z=.16/(d+.018);
    const w1=fbm(u*z*1.15+t*.18,z*1.75-t*.72);
    const w2=fbm(u*z*1.15+t*.18+.18,z*1.75-t*.72+.16);
    const dw=(w1-w2);
    const rx=u+dw*.16*(1+d*2.5);
    const ry=h-d*(.95+dw*1.6);
    const refl=skyColor(rx,ry);
    const crest=sm(.58,.86,w1)*Math.exp(-d*2.2)*.26;
    const fresnel=.35+.65*Math.exp(-d*2.6);
    const seam=Math.exp(-d*80)*.32;
    return cl(.04+refl*fresnel*.95+crest+seam);
  }}
];
