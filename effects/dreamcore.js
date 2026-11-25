import {cl,sm,fr,h2,vn,fbm,rdg} from './noise.js';

export const dreamcore=[
  {name:'poolrooms',cat:'dreamcore',pal:7,fn:(u,v,t)=>{
    // Camera drifting gently forward down an infinite tiled pool corridor
    const tz=t*.72;
    const bob=.012*Math.sin(t*.85),sway=.016*Math.sin(t*.48);
    const ux=u-sway,vy=v-bob;
    const ax=Math.abs(ux)+1e-4,ay=Math.abs(vy)+1e-4;
    const tx=.46/ax;
    const ty=(vy>0?.23:.28)/ay;
    const z=Math.min(tx,ty);
    const fog=cl(1-Math.exp(-z*.11),0,1);
    let surf=0;
    if(tx<ty){
      // Left & right ceramic tiled walls
      const wu=z*2.6+tz,wv=vy*z*2.6+2;
      const gx=fr(wu),gy=fr(wv);
      const grout=sm(.04,.09,gx)*sm(.04,.09,1-gx)*sm(.04,.09,gy)*sm(.04,.09,1-gy);
      const tileVar=.84+.16*h2(Math.floor(wu),Math.floor(wv));
      // Water caustics dancing up the lower half of the walls
      const caust=Math.pow(rdg(z*1.7+tz*.65,vy*z*2.8-t*.55),1.7)*sm(-.12,.22,vy)*.55;
      // Soft skylight pool reflection band
      const light=.55+.28*Math.sin(z*.9+tz*.35);
      surf=(.22+.52*tileVar*light)*(.38+.62*grout)+caust;
    }else if(vy<0){
      // Tiled ceiling with glowing recessed skylights
      const cu=ux*z*2.6,cz=z*2.6+tz;
      const gx=fr(cu),gz=fr(cz);
      const grout=sm(.04,.09,gx)*sm(.04,.09,1-gx)*sm(.04,.09,gz)*sm(.04,.09,1-gz);
      const panel=Math.abs(ux*z)<.24&&fr((z*.42+tz*.16))>.32&&fr((z*.42+tz*.16))<.76;
      surf=panel?.96:(.28+.32*grout);
    }else{
      // Shimmering translucent pool floor with refracted tiles & caustics
      const rip=fbm(ux*z*1.8+t*.35,z*1.8+tz*.8-t*.45)-.5;
      const fu=ux*z*2.6+rip*.45,fz=z*2.6+tz+rip*.45;
      const gx=fr(fu),gz=fr(fz);
      const grout=sm(.04,.1,gx)*sm(.04,.1,1-gx)*sm(.04,.1,gz)*sm(.04,.1,1-gz);
      const caust=Math.pow(rdg(ux*z*1.9-t*.28,z*1.9+tz*.55+t*.42),1.6)*.62;
      surf=.22+.36*grout+caust;
    }
    // Overexposed sunlit white liminal mist at the vanishing point
    return cl(surf*(1-fog)+.97*fog);
  }},

  {name:'portals',cat:'dreamcore',pal:6,fn:(u,v,t)=>{
    // Ethereal drifting pastel mist background
    let col=.14+.22*fbm(u*3.2+t*.08,v*3.2-t*.05)+sm(.28,-.28,v)*.12;
    // 7 floating luminous doorways receding endlessly into depth
    const N=7;
    const ds=[];
    for(let k=0;k<N;k++)ds.push({k,d:fr(k/N-t*.13)});
    ds.sort((a,b)=>b.d-a.d); // back-to-front
    for(let i=0;i<N;i++){
      const {k,d}=ds[i];
      const z=.22+d*2.3;
      const sc=.24/z;
      const ox=.18*Math.sin(k*2.17+t*.22)*(.3+.7*d);
      const oy=.055*Math.cos(k*1.63+t*.18)*(.3+.7*d);
      const dx=Math.abs(u-ox),dy=Math.abs(v-oy);
      const hw=.20*sc,hh=.33*sc;
      const bx=dx-hw,by=dy-hh;
      const outD=Math.hypot(Math.max(bx,0),Math.max(by,0));
      const inD=Math.max(bx,by);
      const fade=sm(0,.18,d)*sm(1,.72,d);
      col+=Math.exp(-outD/(0.028*sc+.007))*.2*fade;
      if(inD<0){
        const frame=sm(-.032*sc,-.004*sc,inD);
        const inner=.82+.18*sm(hh,-hh,v-oy);
        const doorCol=inner*(1-frame*.72)+.14*frame;
        const mix=fade*.94;
        col=col*(1-mix)+doorCol*mix;
      }
    }
    return cl(col);
  }},

  {name:'dreamfield',cat:'dreamcore',pal:6,fn:(u,v,t)=>{
    const h=.015;
    if(v<h){
      // Surreal 90s Bryce-3D midday sky + hazy noon sun + smooth puffy clouds
      const sky=.14+Math.pow(sm(-.28,h,v),1.2)*.48;
      const sun=Math.exp(-Math.hypot(u+.2,v+.14)*7.5)*.78+Math.exp(-Math.hypot(u+.2,v+.14)*2.8)*.2;
      const c1=fbm(u*4.2+t*.09,v*6.8+.5);
      const c2=fbm(u*4.2+t*.09-.09,v*6.8+.38);
      const cld=sm(.48,.78,c1)*sm(h,-.22,v)*(.35+.55*cl(.5+(c1-c2)*4));
      return cl(sky+sun+cld);
    }
    // Undulating perspective checkerboard dream plane
    const d=v-h;
    const z=.22/(d+.028);
    const hill=Math.sin(u*6.5+t*.45)*Math.cos(z*.45-t*.35)*.16;
    const gx=u*z*2.15,gz=z*2.15-t*1.15+hill;
    const chk=(Math.floor(gx)+Math.floor(gz))&1;
    // Slight bevel on checker edges + rolling sunlight undulation
    const bx=fr(gx),bz=fr(gz);
    const bevel=sm(0,.05,bx)*sm(0,.05,1-bx)*sm(0,.05,bz)*sm(0,.05,1-bz);
    const shade=.78+.22*Math.sin(u*6.5+t*.45+z*.35);
    const tile=(chk?.74:.24)*shade*(.85+.15*bevel);
    const fog=Math.exp(-d*10.5);
    return cl(tile*(1-fog)+.86*fog);
  }},

  {name:'arches',cat:'dreamcore',pal:6,fn:(u,v,t)=>{
    // Repeating liminal Roman colonnade receding into bright sunlit mist
    const N=6;
    // Deep sunlit fog & subtle ascending steps visible through the farthest arch
    let col=.74+.22*sm(.25,-.2,v)+.08*fbm(u*4+t*.1,v*4);
    if(v>.03){
      const sz=.14/(v-.01);
      const step=fr(sz*1.6-t*.9);
      const stair=.58+.32*sm(.15,.85,step);
      const blend=sm(.03,.12,v);
      col=col*(1-blend)+stair*blend;
    }
    // March slices from farthest to nearest so near arches cleanly occlude far ones
    const layers=[];
    for(let k=0;k<N;k++)layers.push(fr(k/N-t*.14));
    layers.sort((a,b)=>b-a);
    for(let i=0;i<N;i++){
      const d=layers[i];
      const z=.16+d*2.1;
      const sc=.34/z;
      const ax=u/sc,ay=v/sc;
      const rArch=.36;
      const inOpening=ay<-.06?(ax*ax+(ay+.06)*(ay+.06)<rArch*rArch):(Math.abs(ax)<rArch&&ay<.76);
      if(!inOpening){
        const fade=sm(0,.08,d);
        const distOpen=ay<-.06?Math.hypot(ax,ay+.06)-rArch:Math.abs(ax)-rArch;
        const rim=Math.exp(-Math.max(0,distOpen)*18)*.26;
        const plaster=.92+.08*vn(ax*8,ay*8);
        const wall=(.18+.62*d)*plaster+rim;
        col=col*(1-fade)+wall*fade;
      }
    }
    return cl(col);
  }},

  {name:'halo',cat:'dreamcore',pal:6,fn:(u,v,t)=>{
    // Heavenly drifting clouds + subtle radial bloom
    const r=Math.hypot(u,v)+1e-4,a=Math.atan2(v,u);
    const cld=fbm(u*3.6+t*.07,v*4.4-t*.04);
    let col=.10+sm(-.28,.28,v)*.16+sm(.46,.84,cld)*.26+Math.exp(-r*4.8)*.22;
    // 3 intersecting gyroscopic seraphic halo rings with notched feathers
    const rings=[
      {rad:.165,rx:1,ry:.82,rot:.25,spd:.38,n:12},
      {rad:.22,rx:.94,ry:.46,rot:-.42,spd:-.52,n:16},
      {rad:.275,rx:.52,ry:.95,rot:.55,spd:.29,n:18}
    ];
    for(let i=0;i<3;i++){
      const g=rings[i];
      const ang=g.rot+t*g.spd*.25;
      const cs=Math.cos(ang),sn=Math.sin(ang);
      const px=(u*cs-v*sn)/g.rx,py=(u*sn+v*cs)/g.ry;
      const rr=Math.hypot(px,py);
      const ra=Math.atan2(py,px);
      const notch=.45+.55*Math.pow(.5+.5*Math.cos(ra*g.n+t*g.spd*2.2),1.6);
      const band=Math.exp(-Math.abs(rr-g.rad)*85)*notch;
      const glow=Math.exp(-Math.abs(rr-g.rad)*24)*.14;
      col+=band*.78+glow;
    }
    // Calm watching almond eye in the center with slow peaceful blink
    const blink=sm(.93,.995,.5+.5*Math.sin(t*.55));
    const ew=.135,eh=.066*(1-blink*.92);
    if(Math.abs(u)<ew){
      const lid=eh*(1-(u/ew)*(u/ew));
      const av=Math.abs(v);
      const crease=Math.exp(-Math.abs(av-lid)*140);
      if(av<lid){
        const ir=Math.hypot(u,v);
        if(ir<.054){
          if(ir<.022){
            const glint=Math.exp(-Math.hypot(u+.009,v+.009)*140)*.95;
            col=.04+glint;
          }else{
            const stria=.5+.5*Math.sin(a*24+t*.35+ir*35);
            const irisRim=sm(.054,.044,ir);
            col=cl((.20+.52*stria)*irisRim+.10);
          }
        }else{
          col=cl(.92-Math.pow(av/(lid+1e-4),2)*.28-Math.abs(u/ew)*.22);
        }
      }
      col=cl(col*(1-crease*.65)+.06*crease);
    }
    return cl(col);
  }},

  {name:'memory',cat:'dreamcore',pal:4,fn:(u,v,t)=>{
    // Slow rolling VHS tracking distortion bar
    const trackPos=fr(t*.085)-.5;
    const trackDist=Math.abs(v-trackPos*.65);
    const glitch=Math.exp(-trackDist*34);
    const ux=u+glitch*.018*Math.sin(v*180+t*24);
    // Sun-bleached nostalgic sky + hazy sun
    const sun=Math.exp(-Math.hypot(ux-.22,v+.14)*6.2)*.68+Math.exp(-Math.hypot(ux-.22,v+.14)*2.4)*.24;
    const sky=.24+sm(-.28,.08,v)*.44+sm(.45,.82,fbm(ux*3.4+t*.04,v*5.5))*.24+sun;
    // Distant rolling meadow hill + closer dark foreground slope
    const hill1=.04+.038*Math.sin(ux*5.4+.7)+.018*Math.sin(ux*13.2-.6)+.014*fbm(ux*8,1.3);
    const hill2=.135+.032*Math.sin(ux*6.8-1.5)+.01*Math.cos(ux*15+.4);
    let col=sky;
    // Lone distant silhouette tree on the hill ridge
    const tx=-.22,th1=.04+.038*Math.sin(tx*5.4+.7)+.018*Math.sin(tx*13.2-.6)+.014*fbm(tx*8,1.3);
    const inTrunk=Math.abs(ux-tx)<.006&&v<th1&&v>th1-.055;
    const inCrown=Math.hypot((ux-tx)*1.1,v-(th1-.068))<.032+.008*vn(ux*60,v*60);
    if(v>hill2){
      const grass=.12+.14*fbm(ux*16,v*28)+sm(hill2,.28,v)*-.06;
      col=grass;
    }else if(v>hill1){
      const meadow=.26+.28*sm(hill2,hill1,v)+.14*fbm(ux*12,v*18)+sun*.25;
      col=meadow;
    }else if(inTrunk||inCrown){
      col=.14;
    }
    // Analog scanlines + tape snow grain + slow breathing CRT vignette
    const scan=.93+.07*Math.sin(v*420);
    const grain=(h2(Math.floor(ux*380+t*97),Math.floor(v*380+t*53))-.5)*(.08+.22*glitch);
    const breath=.94+.06*Math.sin(t*.7);
    const vig=cl(1-Math.hypot(u*1.12,v*1.55)*.62*breath,.22,1);
    return cl((col*scan+grain+glitch*.14)*vig);
  }}
];
