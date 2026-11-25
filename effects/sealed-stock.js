import {cl,fr} from './noise.js';

const TAU=Math.PI*2;

const rows=[
  {y:-.105,w:.055,h:.040,x:[-.22,-.11,0,.11,.22]},
  {y:-.025,w:.078,h:.060,x:[-.29,-.145,0,.145,.29]},
  {y:.095,w:.118,h:.090,x:[-.33,-.165,0,.165,.33]},
  {y:.265,w:.162,h:.128,x:[-.255,0,.255]}
];

function caseFace(u,v,x,y,w,h,scan,phase,codeSeed){
  const dx=u-x,dy=v-y;
  if(Math.abs(dx)>w+.012||Math.abs(dy)>h+.026)return 0;

  const outer=Math.max(Math.abs(dx)-w,Math.abs(dy)-h);
  if(outer>.008)return 0;
  const face=outer<0?1:Math.max(0,1-outer/.008);
  const edge=Math.max(0,1-Math.abs(outer)/.010);
  const localX=dx/w,localY=dy/h;

  // The unbranded carton face reads through the dither as kraft paper,
  // with a top tape seam and chunky geometric case code at lower right.
  // Opaque kraft faces establish the cartons before their smaller tape and
  // code details. The upper cap and right plane create a low, chunky volume.
  let ink=.10+face*.39+edge*.26;
  const topPlane=Math.max(0,1-Math.abs(localY+.64)/.24)*face;
  const sidePlane=Math.max(0,1-Math.abs(localX-.78)/.17)*face;
  const lowerShade=Math.max(0,1-Math.abs(localY-.72)/.32)*face;
  ink+=topPlane*.19-sidePlane*.08-lowerShade*.065;
  const tape=Math.max(0,1-Math.abs(localX)/.085)*face;
  const topTape=Math.max(0,1-Math.abs(localY+.74)/.11)*face;
  const scanCatch=Math.max(0,1-Math.abs(u-scan)/.135);
  const sheen=scanCatch*scanCatch*(.48+.18*Math.max(0,1-Math.abs(localY)*1.2));
  ink+=tape*(.15+.62*sheen)+topTape*(.10+.35*sheen)+face*sheen*.42;

  if(localX>.23&&localX<.79&&localY>.16&&localY<.67){
    const gx=Math.floor((localX-.23)*12),gy=Math.floor((localY-.16)*8);
    const bit=fr((gx*17+gy*31+codeSeed*13)*.61803398875)>.47?1:0;
    ink+=bit*(.26+.22*sheen)*face;
  }

  const corrugate=.5+.5*Math.sin((localY+1)*23+codeSeed);
  ink+=face*corrugate*.045;
  return ink;
}

// A low pallet-level aisle of unopened, unbranded booster cases. The inspection
// light reverses smoothly across the tape seams over a six-second cycle.
export const sealedStock={
  name:'sealed-stock',
  label:'Sealed Stock',
  cat:'warehouse',
  pal:9,
  fn:(u,v,t)=>{
    const phase=TAU*t/6;
    const scan=.43*Math.sin(phase);
    const vignette=cl(1-(Math.abs(u)*.68+Math.abs(v+.03)*.42));
    let value=.025+.045*vignette;

    // Rack uprights and a high, shadowed warehouse back wall.
    if(v<-.135){
      const bay=Math.max(0,1-Math.abs(u)*1.4);
      const ceiling=.018+.045*bay;
      const beams=Math.max(0,1-Math.abs(fr((u+.5)*5)-.5)*16);
      const lamp=Math.max(0,1-Math.abs(u-scan)*6)*Math.max(0,1-Math.abs(v+.27)*7);
      return cl(ceiling+beams*.035+lamp*lamp*.13);
    }

    // Pallet deck lines converge below the cases, keeping the shot low-angle.
    const depth=v+.16;
    const floorZ=.065/(depth+.026);
    const slat=Math.max(0,1-Math.abs(fr(floorZ*1.7)-.5)*18);
    const grain=.5+.5*Math.sin(u*72+floorZ*9);
    value+=.055+.055*slat+.025*grain;

    for(let row=0;row<rows.length;row++){
      const spec=rows[row];
      const palletY=spec.y+spec.h+.022;
      const pallet=Math.max(0,1-Math.abs(v-palletY)/.011)*Math.max(0,1-Math.abs(u)/.49);
      value=Math.max(value,.14+pallet*.24);
      for(let column=0;column<spec.x.length;column++){
        value=Math.max(value,caseFace(u,v,spec.x[column],spec.y,spec.w,spec.h,scan,phase,row*7+column));
      }
    }

    // A broader passing glow crosses the whole stack, while the tight version
    // above catches the tape. This keeps the animation apparent in thumbnails.
    const inspection=Math.max(0,1-Math.abs(u-scan)/.20);
    const inspectionFloor=Math.max(0,1-Math.abs(v-.115)/.40);
    value+=inspection*inspection*inspectionFloor*.115;

    // The closest pallet has a hard front beam to anchor the foreground.
    const palletFront=Math.max(0,1-Math.abs(v-.412)/.018)*Math.max(0,1-Math.abs(u)/.48);
    value=Math.max(value,.14+palletFront*.30);
    return cl(value*vignette);
  }
};
