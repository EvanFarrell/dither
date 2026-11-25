import {cl,sm,fr,h2,vn,fbm} from './noise.js';

export const impossible=[
  {name:'droste',cat:'impossible',pal:5,fn:(u,v,t)=>{
    // M.C. Escher Print Gallery logarithmic conformal spiral
    const r=Math.hypot(u,v)+1e-4,a=Math.atan2(v,u);
    const sX=Math.log(r)/1.32,sY=a/6.2831853+.5;
    // Exact unimodular shear so 2*PI angle wrap maps to integer tile periods
    const gx=sX+sY-t*.22;
    const gy=sY*4-sX+t*.06;
    const fx=fr(gx),fy=fr(gy);
    // Architectural arched gallery bay inside each spiraled cell
    const colWall=fx<.13||fx>.87||fy<.10;
    const ax=fx-.5,ay=fy-.42;
    const inArch=ay<0?(ax*ax+ay*ay<.115):(Math.abs(ax)<.34&&fy<.88);
    let val=0;
    if(inArch&&!colWall){
      const chk=((Math.floor(fx*8)+Math.floor(fy*8))&1);
      const floor=fy>.62?(.28+.38*chk):(.78+.18*sm(.62,.15,fy));
      const archRim=Math.exp(-Math.abs((ay<0?Math.hypot(ax,ay)-.34:Math.abs(ax)-.34))*42)*.25;
      val=floor-archRim;
    }else{
      const row=Math.floor(fy*10);
      const bx=fr(fx*4+(row&1)*.5),by=fr(fy*10);
      const mortar=sm(.05,.12,bx)*sm(.05,.12,1-bx)*sm(.07,.16,by)*sm(.07,.16,1-by);
      const shade=.34+.22*Math.sin(fx*6.28)+.1*h2(Math.floor(fx*4+(row&1)*.5)+row*7,row);
      val=shade*(.48+.52*mortar);
    }
    const center=sm(.008,.065,r);
    return cl(val*center+.9*(1-center)*.35);
  }},

  {name:'escher',cat:'impossible',pal:5,fn:(u,v,t)=>{
    // Relativity: 3D domain-folded impossible stairwells in 90-deg gravity orientations
    const roll=Math.sin(t*.17)*.75+t*.06;
    const cr=Math.cos(roll),sr=Math.sin(roll);
    const ru=u*cr-v*sr,rv=u*sr+v*cr;
    const yaw=.24*Math.sin(t*.14);
    const cy=Math.cos(yaw),sy=Math.sin(yaw);
    let dx=ru*1.45,dy=rv*1.45,dz=1;
    const dl=1/Math.hypot(dx,dy,dz);
    dx*=dl;dy*=dl;dz*=dl;
    const rx=dx*cy+dz*sy,ry=dy,rz=-dx*sy+dz*cy;
    const ox=.22*Math.sin(t*.21),oy=.22*Math.cos(t*.19),oz=t*.46;
    const P=2.4;
    function map(x,y,z){
      const qx=fr((x+1.2)/P)*P-1.2;
      const qy=fr((y+1.2)/P)*P-1.2;
      const qz=fr((z+1.2)/P)*P-1.2;
      const stY=Math.floor((qx+1.2)*2.5)/2.5-.55;
      const d1=Math.max(Math.abs(qy-stY)-.11,Math.abs(qz+.48)-.34);
      const stX=Math.floor((qy+1.2)*2.5)/2.5-.55;
      const d2=Math.max(Math.abs(qx-stX)-.11,Math.abs(qz-.48)-.34);
      const dCol=Math.max(Math.abs(Math.abs(qx)-1.02)-.13,Math.abs(Math.abs(qy)-1.02)-.13);
      const dBeam=Math.max(Math.abs(Math.abs(qz)-1.04)-.11,Math.min(Math.abs(Math.abs(qx)-1.02)-.11,Math.abs(Math.abs(qy)-1.02)-.11));
      return Math.min(d1,d2,dCol,dBeam);
    }
    let dist=.08,hit=false,steps=0;
    for(let i=0;i<16;i++){
      const d=map(ox+rx*dist,oy+ry*dist,oz+rz*dist);
      if(d<.018){hit=true;steps=i;break}
      dist+=d*.92;
      if(dist>9.5)break;
    }
    if(!hit)return .92;
    const hx=ox+rx*dist,hy=oy+ry*dist,hz=oz+rz*dist;
    const eps=.025;
    const d0=map(hx,hy,hz);
    const nx=map(hx+eps,hy,hz)-d0,ny=map(hx,hy+eps,hz)-d0,nz=map(hx,hy,hz+eps)-d0;
    const nl=1/(Math.hypot(nx,ny,nz)+1e-5);
    const diff=cl((nx*.62-ny*.58-nz*.52)*nl,0,1);
    const ao=cl(1-steps/18,.22,1);
    const lit=(.14+.76*diff)*ao;
    const fog=cl(1-Math.exp(-dist*.16),0,1);
    return cl(lit*(1-fog)+.93*fog);
  }},

  {name:'atrium',cat:'impossible',pal:6,fn:(u,v,t)=>{
    // Infinite sunlit brutalist/liminal hotel balconies looking straight down the shaft
    const ox=.09*Math.sin(t*.25),oy=.09*Math.cos(t*.21),oz=t*.72;
    let dx=u*1.55,dy=v*1.55,dz=1;
    const dl=1/Math.hypot(dx,dy,dz);
    dx*=dl;dy*=dl;dz*=dl;
    const F=.66;
    function map(x,y,z){
      const ax=Math.abs(x),ay=Math.abs(y),m=ax>ay?ax:ay;
      const fz=fr(z/F)*F-F*.5;
      const wall=.68-m;
      const slab=Math.max(.53-m,Math.abs(fz+.04)-.055);
      const rail=Math.max(Math.abs(m-.545)-.018,Math.abs(fz-.085)-.085);
      return Math.min(wall,slab,rail);
    }
    let dist=.05,hit=false,steps=0;
    for(let i=0;i<22;i++){
      const d=map(ox+dx*dist,oy+dy*dist,oz+dz*dist);
      if(d<.009){hit=true;steps=i;break}
      dist+=d*.88;
      if(dist>11)break;
    }
    if(!hit)return .96;
    const hx=ox+dx*dist,hy=oy+dy*dist,hz=oz+dz*dist;
    const ax=Math.abs(hx),ay=Math.abs(hy),m=ax>ay?ax:ay;
    const fz=fr(hz/F)*F-F*.5;
    const ao=cl(1-steps/26,.25,1);
    let surf=.5;
    if(m>.64){
      const along=ax>ay?hy:hx;
      const doorCell=fr((along+.68)*2.4);
      const isDoor=doorCell>.32&&doorCell<.68&&fz>-.22&&fz<.18;
      const litRoom=h2(Math.floor((along+.68)*2.4),Math.floor(hz/F))>.38;
      surf=isDoor?(litRoom?.92:.16):(.38+.12*(ax>ay?1:0));
    }else if(Math.abs(fz+.04)<.075){
      surf=fz<-.04?.74:.28;
    }else{
      const post=fr((ax>ay?hy:hx)*14);
      surf=.52+.22*sm(.2,.8,post);
    }
    const fog=cl(1-Math.exp(-dist*.14),0,1);
    return cl(surf*ao*(1-fog)+.96*fog);
  }},

  {name:'backrooms',cat:'impossible',pal:9,fn:(u,v,t)=>{
    // Level 0 Backrooms: fast 2D DDA raycaster with fluorescent drop ceiling & damp carpet
    const cx=.5+t*.56,cy=.5+.26*Math.sin(t*.26);
    const yaw=.30*Math.sin(t*.22);
    const dirX=Math.cos(yaw),dirY=Math.sin(yaw);
    const planeX=-dirY*1.15,planeY=dirX*1.15;
    const rdx=dirX+planeX*u*1.75,rdy=dirY+planeY*u*1.75;
    function isWall(ix,iy){
      if(iy===0||(ix&3)===0)return false;
      if((iy&3)===0)return h2(ix,iy)>.86;
      return h2(ix*3+11,iy*5+7)>.62;
    }
    let mx=Math.floor(cx),my=Math.floor(cy);
    const ddx=Math.abs(1/(rdx||1e-6)),ddy=Math.abs(1/(rdy||1e-6));
    let stepX,stepY,sdx,sdy;
    if(rdx<0){stepX=-1;sdx=(cx-mx)*ddx}else{stepX=1;sdx=(mx+1-cx)*ddx}
    if(rdy<0){stepY=-1;sdy=(cy-my)*ddy}else{stepY=1;sdy=(my+1-cy)*ddy}
    let side=0,hit=false;
    for(let i=0;i<14;i++){
      if(sdx<sdy){sdx+=ddx;mx+=stepX;side=0}
      else{sdy+=ddy;my+=stepY;side=1}
      if(isWall(mx,my)){hit=true;break}
    }
    const perp=hit?(side===0?sdx-ddx:sdy-ddy):12;
    const lineH=.27/(perp+.001);
    if(v<-lineH){
      const z=.27/(-v+1e-4);
      const wx=cx+rdx*z,wy=cy+rdy*z;
      const tx=fr(wx*2),ty=fr(wy*2);
      const grid=sm(.03,.08,tx)*sm(.03,.08,1-tx)*sm(.03,.08,ty)*sm(.03,.08,1-ty);
      const px=fr(wx*.5),py=fr(wy*.5);
      const isLamp=px>.34&&px<.66&&py>.28&&py<.72;
      const flick=h2(Math.floor(wx*.5),Math.floor(wy*.5))>.78?(.88+.12*Math.sin(t*23)):1;
      const ceil=isLamp?(.98*flick):(.24+.22*grid);
      const fog=Math.exp(-z*.18);
      return cl(ceil*fog+.36*(1-fog));
    }
    if(v>lineH){
      const z=.27/(v+1e-4);
      const wx=cx+rdx*z,wy=cy+rdy*z;
      const px=fr(wx*.5)-.5,py=fr(wy*.5)-.5;
      const pool=Math.exp(-(px*px+py*py)*10)*.34;
      const grain=vn(wx*14,wy*14)*.14;
      const fl=.16+grain+pool;
      const fog=Math.exp(-z*.20);
      return cl(fl*fog+.32*(1-fog));
    }
    const wallX=fr(side===0?cy+perp*rdy:cx+perp*rdx);
    const wyNorm=(v+lineH)/(2*lineH);
    const stripe=.86+.14*Math.sin(wallX*38);
    const damp=.88+.12*vn(wallX*6,wyNorm*5);
    const trim=wyNorm>.91?.35:(wyNorm<.05?.55:1);
    const face=side===0?.84:.64;
    const fog=Math.exp(-perp*.19);
    return cl(face*stripe*damp*trim*fog+.34*(1-fog));
  }},

  {name:'mirrors',cat:'impossible',pal:2,fn:(u,v,t)=>{
    // Kusama-style Infinity Mirror Room: 3D DDA lattice of mirrored glowing lanterns
    const ox=.18*Math.sin(t*.23),oy=.10*Math.cos(t*.19),oz=.18*Math.cos(t*.17);
    const yaw=t*.16,pitch=.20*Math.sin(t*.14);
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    let dx=u*1.65,dy=v*1.65,dz=1;
    const dl=1/Math.hypot(dx,dy,dz);
    dx*=dl;dy*=dl;dz*=dl;
    const y1=dy*cp-dz*sp,z1=dy*sp+dz*cp;
    const rdx=dx*cy+z1*sy,rdy=y1,rdz=-dx*sy+z1*cy;
    let ix=Math.floor(ox),iy=Math.floor(oy),iz=Math.floor(oz);
    const ddx=Math.abs(1/(rdx||1e-6)),ddy=Math.abs(1/(rdy||1e-6)),ddz=Math.abs(1/(rdz||1e-6));
    let sx,syStep,sz,tx,ty,tz;
    if(rdx<0){sx=-1;tx=(ox-ix)*ddx}else{sx=1;tx=(ix+1-ox)*ddx}
    if(rdy<0){syStep=-1;ty=(oy-iy)*ddy}else{syStep=1;ty=(iy+1-oy)*ddy}
    if(rdz<0){sz=-1;tz=(oz-iz)*ddz}else{sz=1;tz=(iz+1-oz)*ddz}
    let glow=.02,atten=1;
    const l0x=.26,l0y=.22+.05*Math.sin(t*.7),l0z=.28;
    const l1x=.72,l1y=.68+.05*Math.cos(t*.6),l1z=.74;
    for(let step=0;step<8;step++){
      const tNext=Math.min(tx,ty,tz);
      const p0x=ix+((ix&1)?1-l0x:l0x),p0y=iy+((iy&1)?1-l0y:l0y),p0z=iz+((iz&1)?1-l0z:l0z);
      const p1x=ix+((ix&1)?1-l1x:l1x),p1y=iy+((iy&1)?1-l1y:l1y),p1z=iz+((iz&1)?1-l1z:l1z);
      const vx0=p0x-ox,vy0=p0y-oy,vz0=p0z-oz;
      const pr0=vx0*rdx+vy0*rdy+vz0*rdz;
      if(pr0>0){
        const d2=(vx0-rdx*pr0)**2+(vy0-rdy*pr0)**2+(vz0-rdz*pr0)**2;
        const pulse=.78+.22*Math.sin(t*1.5+(ix+iy+iz)*.9);
        glow+=atten*pulse*(.0031/(d2+.0022));
      }
      const vx1=p1x-ox,vy1=p1y-oy,vz1=p1z-oz;
      const pr1=vx1*rdx+vy1*rdy+vz1*rdz;
      if(pr1>0){
        const d2=(vx1-rdx*pr1)**2+(vy1-rdy*pr1)**2+(vz1-rdz*pr1)**2;
        const pulse=.78+.22*Math.cos(t*1.3+(ix-iy+iz)*1.1);
        glow+=atten*pulse*(.0027/(d2+.0022));
      }
      if(step<4){
        const hx=ox+rdx*tNext,hy=oy+rdy*tNext,hz=oz+rdz*tNext;
        const fx=Math.min(fr(hx),1-fr(hx)),fy=Math.min(fr(hy),1-fr(hy)),fz=Math.min(fr(hz),1-fr(hz));
        if((fx<.012&&fy<.012)||(fy<.012&&fz<.012)||(fx<.012&&fz<.012))glow+=atten*.09;
      }
      atten*=.83;
      if(tx<ty&&tx<tz){tx+=ddx;ix+=sx}
      else if(ty<tz){ty+=ddy;iy+=syStep}
      else{tz+=ddz;iz+=sz}
    }
    return cl(glow);
  }},

  {name:'labyrinth',cat:'impossible',pal:8,fn:(u,v,t)=>{
    // First-person moonlit stone labyrinth (smooth 90-deg cornering DDA raycaster)
    function pathPos(s){
      const cyc=Math.floor(s/16),m=s-cyc*16;
      const bx=cyc*8;
      if(m<4)return[bx+m+.5,.5];
      if(m<8)return[bx+4.5,m-4+.5];
      if(m<12)return[bx+4.5+(m-8),4.5];
      return[bx+8.5,4.5-(m-12)];
    }
    const sp=t*.72;
    const pA=pathPos(sp-.35),pB=pathPos(sp+.35),pL=pathPos(sp+1.05);
    const cx=(pA[0]+pB[0])*.5,cy=(pA[1]+pB[1])*.5;
    let dx=pL[0]-cx,dy=pL[1]-cy;
    const dl=1/(Math.hypot(dx,dy)+1e-5);
    dx*=dl;dy*=dl;
    const px=-dy*1.12,py=dx*1.12;
    const rdx=dx+px*u*1.75,rdy=dy+py*u*1.75;
    function isMazeWall(ix,iy){
      const lx=((ix%8)+8)%8;
      if(iy===0&&lx<=4)return false;
      if(lx===4&&iy>=0&&iy<=4)return false;
      if(iy===4&&lx>=4)return false;
      if(lx===0&&iy>=0&&iy<=4)return false;
      if((ix&1)===0&&(iy&1)===0)return h2(ix*7+3,iy*11+5)>.55;
      return true;
    }
    let mx=Math.floor(cx),my=Math.floor(cy);
    const ddx=Math.abs(1/(rdx||1e-6)),ddy=Math.abs(1/(rdy||1e-6));
    let stepX,stepY,sdx,sdy;
    if(rdx<0){stepX=-1;sdx=(cx-mx)*ddx}else{stepX=1;sdx=(mx+1-cx)*ddx}
    if(rdy<0){stepY=-1;sdy=(cy-my)*ddy}else{stepY=1;sdy=(my+1-cy)*ddy}
    let side=0,hit=false;
    for(let i=0;i<14;i++){
      if(sdx<sdy){sdx+=ddx;mx+=stepX;side=0}
      else{sdy+=ddy;my+=stepY;side=1}
      if(isMazeWall(mx,my)){hit=true;break}
    }
    const perp=hit?(side===0?sdx-ddx:sdy-ddy):12;
    const lineH=.30/(perp+.001);
    if(v<-lineH){
      const ang=Math.atan2(rdy,rdx);
      const sky=.10+sm(-.28,0,v)*.24+fbm(ang*3.5+t*.03,v*5)*.14;
      const sh=h2(Math.floor(ang*85),Math.floor(v*210));
      const st=sh>.991?((sh-.991)/.009)*sm(-.02,-.18,v)*.85:0;
      return cl(sky+st);
    }
    if(v>lineH){
      const z=.30/(v+1e-4);
      const wx=cx+rdx*z,wy=cy+rdy*z;
      const fx=fr(wx*2),fy=fr(wy*2);
      const mortar=sm(.04,.1,fx)*sm(.04,.1,1-fx)*sm(.04,.1,fy)*sm(.04,.1,1-fy);
      const tone=.22+.14*h2(Math.floor(wx*2),Math.floor(wy*2));
      const fog=Math.exp(-z*.22);
      return cl(tone*(.55+.45*mortar)*fog+.08*(1-fog));
    }
    const wallX=fr(side===0?cy+perp*rdy:cx+perp*rdx);
    const wyNorm=(v+lineH)/(2*lineH);
    const row=Math.floor(wyNorm*7);
    const bx=fr(wallX*3+(row&1)*.5),by=fr(wyNorm*7);
    const mortar=sm(.05,.12,bx)*sm(.05,.12,1-bx)*sm(.07,.16,by)*sm(.07,.16,1-by);
    const brickVar=.78+.22*h2(Math.floor(wallX*3+(row&1)*.5)+row*13,row+mx*3+my*5);
    const rim=sm(.14,0,wyNorm)*.24;
    const face=side===0?.86:.58;
    const fog=Math.exp(-perp*.21);
    return cl(((face*brickVar*(.42+.58*mortar))+rim)*fog+.12*(1-fog));
  }},

  {name:'tokyo',cat:'impossible',pal:10,fn:(u,v,t)=>{
    // Infinite Tokyo Neon City: height-aware 2D DDA skyline raycaster + kanban signs + wet reflections
    const cx=.5+.075*Math.sin(t*.27),cy=t*1.15;
    const camZ=.58+.05*Math.sin(t*.34);
    const yaw=.085*Math.sin(t*.21);
    const vp=v-.035;
    const dirX=Math.sin(yaw),dirY=Math.cos(yaw);
    const planeX=dirY*1.18,planeY=-dirX*1.18;
    const rdx=dirX+planeX*u*1.75,rdy=dirY+planeY*u*1.75;

    function bldgHeight(ix,iy){
      if(ix===0)return 0;
      const cross=((iy%6)+6)%6;
      if(cross===0)return 0;
      const r=h2(ix*17+31,iy*29+13);
      if(r<.08)return 0;
      const depthBoost=Math.min(3,Math.abs(ix)-1)*.85;
      return 1.25+r*2.65+depthBoost;
    }

    let mx=Math.floor(cx),my=Math.floor(cy);
    const ddx=Math.abs(1/(rdx||1e-6)),ddy=Math.abs(1/(rdy||1e-6));
    let stepX,stepY,sdx,sdy;
    if(rdx<0){stepX=-1;sdx=(cx-mx)*ddx}else{stepX=1;sdx=(mx+1-cx)*ddx}
    if(rdy<0){stepY=-1;sdy=(cy-my)*ddy}else{stepY=1;sdy=(my+1-cy)*ddy}

    const fov=.54;
    let hit=false,hitPerp=18,hitSide=0,hitMx=0,hitMy=0,hitH=0;
    const streetDist=vp>0?camZ*fov/(vp+1e-4):99;

    for(let i=0;i<18;i++){
      let side;
      if(sdx<sdy){sdx+=ddx;mx+=stepX;side=0}
      else{sdy+=ddy;my+=stepY;side=1}
      const perp=side===0?sdx-ddx:sdy-ddy;
      if(perp>streetDist)break;
      const bh=bldgHeight(mx,my);
      if(bh>0){
        const zAt=camZ-(vp/fov)*perp;
        if(zAt>=0&&zAt<=bh){
          hit=true;hitPerp=perp;hitSide=side;hitMx=mx;hitMy=my;hitH=bh;
          break;
        }
      }
    }

    const rain=sm(.84,.97,vn(u*92+v*14,v*16-t*28))*.16;

    if(hit){
      const wallU=fr(hitSide===0?cy+hitPerp*rdy:cx+hitPerp*rdx);
      const zAt=camZ-(vp/fov)*hitPerp;
      const bSeed=h2(hitMx*41+7,hitMy*53+19);
      let col=hitSide===0?.08:.05;

      const wx=fr(wallU*6),wz=fr(zAt*5);
      const inWin=wx>.16&&wx<.84&&wz>.2&&wz<.8;
      if(inWin){
        const wCell=h2(Math.floor(wallU*6)+hitMx*19,Math.floor(zAt*5)+hitMy*23);
        if(wCell>.36){
          const flick=wCell>.91?(.7+.3*Math.sin(t*14+wCell*50)):1;
          col=Math.max(col,(.28+.48*((wCell-.36)/.64))*flick);
        }
      }

      const hasSign=bSeed>.25;
      const signSide=bSeed>.62?(wallU>.05&&wallU<.23):(wallU>.77&&wallU<.95);
      if(hasSign&&signSide&&zAt>.32&&zAt<Math.min(hitH-.18,2.6)){
        const su=bSeed>.62?(wallU-.05)/.18:(wallU-.77)/.18;
        const border=su<.12||su>.88;
        const glyphRow=Math.floor(zAt*5.2);
        const gy=fr(zAt*5.2);
        const gHash=h2(glyphRow+hitMx*37,hitMy*43+(bSeed*100|0));
        const stroke=(gy>.22&&gy<.78)&&((su>.25&&su<.75&&(gHash>.35))||(Math.abs(su-.5)<.12)||(Math.abs(gy-.5)<.11&&gHash>.25));
        const pulse=gHash>.86?(.72+.28*Math.sin(t*18+gHash*40)):1;
        col=border?.68:(stroke?.98*pulse:.38);
      }

      if(bSeed>.68&&wallU>.22&&wallU<.78&&zAt>.75&&zAt<1.55&&hitH>1.7){
        const bu=(wallU-.22)/.56,bz=(zAt-.75)/.8;
        const frame=bu<.06||bu>.94||bz<.08||bz>.92;
        const bars=.55+.45*Math.sin(bz*22-t*4.5+bu*4);
        const eq=sm(.25,.75,Math.sin(bu*16+t*2.4)*Math.cos(bz*9-t*1.8)*.5+.5);
        col=frame?.96:(.42+.52*bars*(.6+.4*eq));
      }

      if(hitH-zAt<.09)col=Math.max(col,.52+.42*sm(.09,.02,hitH-zAt));
      if(zAt<.28&&wx>.1&&wx<.9)col=Math.max(col,.62+.28*Math.sin(wallU*18+hitMy));

      const fog=cl(1-Math.exp(-hitPerp*.13),0,1);
      const haze=.24+.14*sm(.1,-.25,vp);
      return cl(col*(1-fog)+haze*fog+rain);
    }

    if(vp>0){
      const z=streetDist;
      const wx=cx+rdx*z,wy=cy+rdy*z;
      const rip=fbm(wx*4.8,wy*4.8-t*.35)-.5;
      const curbGlow=Math.exp(-Math.abs(Math.abs(wx-.5)-.34)*6.5);
      const signRefl=.45+.55*Math.sin(wy*3.4+rip*4.2+Math.sin(wy*1.7)*2);
      const refl=curbGlow*(.32+.58*signRefl)*(0.65+0.35*sm(-.2,.3,rip));
      const lane=Math.abs(wx-.5)<.028&&fr(wy*.5)<.45?.72:0;
      const cross=((Math.floor(wy)%6)+6)%6===0&&fr(wx*6)<.5&&fr(wy)<.45?.55:0;
      const carL=Math.exp(-Math.abs(wx-.32)*32)*Math.pow(.5+.5*Math.sin(wy*.9-t*4.2),12)*.95;
      const carR=Math.exp(-Math.abs(wx-.68)*32)*Math.pow(.5+.5*Math.sin(wy*1.1+t*5.6),14)*.95;
      const street=.05+refl+lane*.6+cross*.5+carL+carR;
      const fog=cl(1-Math.exp(-z*.13),0,1);
      return cl(street*(1-fog)+.28*fog+rain);
    }

    const lightPoll=.04+Math.pow(sm(-.28,0,vp),1.7)*.34;
    const cld=sm(.42,.82,fbm(u*3.6+t*.05,vp*5.5-.02*t))*.16;
    const beamA=Math.atan2(vp-.04,u-.14*Math.sin(t*.25));
    const search=Math.exp(-Math.abs(beamA+1.57+.38*Math.sin(t*.33))*24)*sm(0,-.26,vp)*.22;
    return cl(lightPoll+cld+search+rain);
  }}
];
