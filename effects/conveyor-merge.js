import {cl,fr} from './noise.js';

const TAU=Math.PI*2;

function box(along,across,position,opacity,width=.052,height=.041){
  const x=Math.abs(along-position),y=Math.abs(across);
  if(x>width||y>height)return 0;
  const edge=Math.max(x/width,y/height);
  const rim=Math.max(0,1-(edge-.72)/.18);
  const label=(x<width*.47&&y<height*.18)?1:0;
  const seam=(x<.007||y<.006)?1:0;
  return (.42+rim*.25+label*.16+seam*.13)*opacity;
}

function lane(u,v,cx,cy,cosine,sine,halfLength,halfWidth){
  const dx=u-cx,dy=v-cy;
  const along=dx*cosine+dy*sine;
  const across=-dx*sine+dy*cosine;
  const inside=Math.abs(along)<halfLength&&Math.abs(across)<halfWidth;
  return {along,across,inside};
}

// Overhead material handling line. Cartons travel through three in-feeds and
// emerge from one central output. Motion repeats exactly every six seconds.
export const conveyorMerge={
  name:'conveyor-merge',
  label:'Conveyor Merge',
  cat:'warehouse',
  pal:4,
  fn:(u,v,t)=>{
    const cycle=fr(t/6);
    const phase=cycle*TAU;
    // This monotonic easing moves forward all the way through the loop, yet
    // arrives with zero velocity at its join so the Bayer pattern stays still.
    const travel=cycle-Math.sin(phase)/TAU;
    const floor=.035+.018*Math.sin(u*34)*Math.sin(v*41);
    const seamX=Math.max(0,1-Math.abs(fr((u+.5)*9)-.5)*20);
    const seamY=Math.max(0,1-Math.abs(fr((v+.4)*10)-.5)*20);
    let value=floor+(.012*(seamX+seamY));

    // Three independent feeds point to the same scan gate.
    const feeds=[
      lane(u,v,-.255,-.112,.810,.586,.255,.058),
      lane(u,v,0,-.125,0,1,.205,.058),
      lane(u,v,.255,-.112,-.810,.586,.255,.058)
    ];
    for(let index=0;index<3;index++){
      const feed=feeds[index];
      if(!feed.inside)continue;
      const belt=.112+.026*Math.sin(feed.along*94-travel*TAU*5);
      const rail=Math.max(0,1-(Math.abs(feed.across)-.043)*72);
      value=Math.max(value,belt+rail*.15);
      for(let carton=0;carton<2;carton++){
        const runner=fr(carton*.53+.17+travel);
        const position=-.21+runner*.43;
        const fade=cl(Math.min(runner,1-runner)*11);
        value=Math.max(value,box(feed.along,feed.across,position,fade));
      }
    }

    // A compact scanner bridge makes the merge point unmistakable in a thumbnail.
    const scannerRail=Math.max(0,1-Math.abs(v-.04)*155)*Math.max(0,1-Math.abs(u)*2.4);
    const scannerPulse=.38+.62*Math.pow(.5+.5*Math.cos(phase*2),5);
    value=Math.max(value,.15+scannerRail*(.2+.34*scannerPulse));

    const out=lane(u,v,0,.153,0,1,.155,.066);
    if(out.inside){
      const belt=.122+.03*Math.sin(out.along*105-travel*TAU*5);
      const rails=Math.max(0,1-(Math.abs(out.across)-.05)*82);
      value=Math.max(value,belt+rails*.17);
      for(let carton=0;carton<3;carton++){
        const runner=fr(carton*.335+.11+travel);
        const position=-.11+runner*.22;
        const fade=cl(Math.min(runner,1-runner)*12);
        const cartonValue=box(out.along,out.across,position,fade,.055,.044);
        // The passing label briefly catches the scanner light.
        const scanned=Math.max(0,1-Math.abs(position+.113)*46)*scannerPulse;
        value=Math.max(value,cartonValue*(1+scanned*.34));
      }
    }

    // Safety chevrons define the junction without crowding the moving cartons.
    const chevron=Math.max(0,1-Math.abs(v+.004)*70)*Math.max(0,1-Math.abs(Math.abs(u)-.14)*46);
    value=Math.max(value,.07+chevron*.2);
    return cl(value);
  }
};
