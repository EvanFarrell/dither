export const classic=[
  {name:'vortex',cat:'classic',pal:0,fn:(u,v,t)=>{
    const r=Math.hypot(u-.18*Math.cos(t*.3),v-.1*Math.sin(t*.4)),a=Math.atan2(v,u);
    return Math.pow(Math.max(0,.42-r),1.6)*1.6+.15*Math.pow(.5+.5*Math.sin(a*6+r*30-t),6)*(.5-r)+.3*Math.pow(Math.max(0,v+.28),4)*40;
  }},
  {name:'plasma',cat:'classic',pal:1,fn:(u,v,t)=>.5+.5*Math.sin(u*14+t)*Math.sin(v*18-t*.7)*.6+.25*Math.sin(Math.hypot(u,v)*30-t*2)},
  {name:'tunnel',cat:'classic',pal:2,fn:(u,v,t)=>{
    const r=Math.hypot(u,v)+1e-3,a=Math.atan2(v,u);
    return(((.3/r+t*.6)%1)*.6+.4*(.5+.5*Math.sin(a*8+t)))*Math.min(1,r*4);
  }},
  {name:'aurora',cat:'classic',pal:3,fn:(u,v,t)=>{
    const y=v+.05*Math.sin(u*10+t)+.03*Math.sin(u*23-t*1.7);
    return Math.max(0,1-Math.abs(y)*6)+.3*(.5+.5*Math.sin(u*40-t*3))*Math.max(0,.3-Math.abs(y));
  }},
  {name:'metaballs',cat:'classic',pal:4,fn:(u,v,t)=>{
    let q=0;for(let k=0;k<5;k++){const px=.35*Math.sin(t*.4+k*1.3),py=.2*Math.cos(t*.5+k*2.1);q+=.012/((u-px)**2+(v-py)**2+.002)}
    return Math.min(1.2,q*.25);
  }},
  {name:'grid',cat:'classic',pal:5,fn:(u,v,t)=>{
    const z=1/(Math.abs(v)+.02),gx=(u*z*.4)%1,gy=(z*.3+t)%1;
    const g=(Math.abs(gx-.5)<.06||Math.abs(gy-.5)<.06)?1:.1;
    return v>0?g*Math.min(1,Math.abs(v)*4):.15+.6*Math.max(0,.15-Math.hypot(u,v+.05))*8;
  }}
];
