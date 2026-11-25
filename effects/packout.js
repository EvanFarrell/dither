import {cl,fr} from './noise.js';

const TAU=Math.PI*2;

const box=(x,y,halfWidth,halfHeight)=>Math.max(Math.abs(x)-halfWidth,Math.abs(y)-halfHeight);
const fill=distance=>cl(.012-distance*42);
const stroke=(distance,width)=>cl(1-Math.abs(distance)/width);

// A packing bench resets over a six-second loop. The card and label return to
// their starting positions without any discrete state change at the seam.
export const packout={
  name:'packout',
  label:'Packout',
  cat:'warehouse',
  pal:9,
  fn:(u,v,t)=>{
    const phase=t*TAU/6;
    const packed=.5-.5*Math.cos(phase);
    const shimmer=.5+.5*Math.sin(phase*2);
    const grain=.5+.5*Math.sin(u*181+v*73)*Math.sin(u*37-v*119);
    let value=.105+grain*.06+.018*Math.sin(u*13-v*9);

    // A darker cutting mat grounds the main packing action.
    const mat=box(u,v+.005,.325,.285);
    if(mat<.012)value=Math.max(value,.18+stroke(mat,.012)*.08);

    // Tape roll, its paper core, and a short loose strip make the bench read at
    // thumbnail size while leaving the mailer as the central focal point.
    const tapeRadius=Math.hypot(u+.345,v+.185);
    const tape=Math.max(0,1-Math.abs(tapeRadius-.065)/.018);
    const core=Math.max(0,1-tapeRadius/.030);
    const tapeHighlight=Math.max(0,1-Math.abs(u+.345)/.018)*Math.max(0,1-Math.abs(v+.245)/.030);
    value=Math.max(value,tape*.46,core*.16,tapeHighlight*.58);
    const looseTape=box(u+.255,v-.235,.105,.016);
    value=Math.max(value,fill(looseTape)*(.24+.12*shimmer));

    // Back panel and dark cavity of the open cardboard mailer.
    const mailer=box(u,v-.015,.235,.170);
    const cavity=box(u,v+.005,.196,.132);
    if(mailer<.012)value=Math.max(value,.37+stroke(mailer,.012)*.17);
    if(cavity<0)value=Math.max(value,.225+.025*grain);

    // The two open flap wings define an unmistakable mailer silhouette.
    const flapLeft=Math.max(Math.abs(u+.168)-.070,Math.abs(v+.155+(u+.168)*.30)-.050);
    const flapRight=Math.max(Math.abs(u-.168)-.070,Math.abs(v+.155-(u-.168)*.30)-.050);
    value=Math.max(value,fill(flapLeft)*.40,fill(flapRight)*.40);

    // The sleeved card moves upward into the mailer. It is painted before the
    // front lip so the envelope visibly receives it instead of covering the set.
    const cardY=.205-.190*packed;
    const card=box(u,v-cardY,.088,.126);
    if(card<.012){
      const localY=v-cardY;
      const inner=box(u,localY,.070,.102);
      const art=box(u,localY+.011,.057,.052);
      const title=box(u,localY-.078,.057,.007);
      const foil=.5+.5*Math.sin(u*67-localY*49+phase*2);
      value=Math.max(value,.43+stroke(card,.010)*.32);
      if(inner<0)value=Math.max(value,.50);
      if(art<0)value=Math.max(value,.52+.16*foil);
      value=Math.max(value,fill(title)*.74);
    }

    // The front lip hides the lower half of the sleeve as it arrives, with a
    // fold seam that gives the mailer a second readable edge.
    const front=box(u,v-.105,.223,.065);
    const seam=Math.max(0,1-Math.abs(v-.058)/.007)*Math.max(0,1-Math.abs(u)/.215);
    if(front<.012)value=Math.max(value,.47+stroke(front,.010)*.17+seam*.11);

    // The label descends as the card arrives. Its barcode and tiny pictogram
    // use generated geometry rather than a real parcel identifier.
    const labelY=-.135+.235*packed;
    const label=box(u,v-labelY,.106,.043);
    if(label<.010){
      const lx=u/.106,ly=(v-labelY)/.043;
      value=Math.max(value,.72+stroke(label,.008)*.18);
      if(Math.abs(ly)<.38&&lx>-.73&&lx<.43){
        const bars=fr((lx+.73)*17.3);
        const width=.015+.045*(Math.floor((lx+.73)*17.3)%4===0);
        if(bars<width)value=Math.max(value,.25);
      }
      const pictogram=Math.max(Math.abs(lx-.66)-.11,Math.abs(ly+.12)-.18);
      value=Math.max(value,fill(pictogram)*.34);
    }

    // A small moving scanner glint makes the label placement feel deliberate.
    const glint=Math.max(0,1-Math.abs(u-(packed-.5)*.16)/.025)*Math.max(0,1-Math.abs(v-labelY)/.070);
    value+=glint*(.05+.10*shimmer);
    return cl(value);
  }
};
