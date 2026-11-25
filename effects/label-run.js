import {cl} from './noise.js';

const TAU=Math.PI*2;
let cachedTime=NaN;
let frame;

function setFrame(t){
  if(t===cachedTime)return;
  cachedTime=t;
  // The highest feed lands at 2.5s, which makes the fixed picker thumbnail
  // show a complete label and barcode. Cosine timing closes smoothly at 6s.
  const phase=TAU*(t-2.5)/6;
  const feed=.5+.5*Math.cos(phase);
  frame={
    phase,
    feed,
    labelBottom:.055+.245*feed,
    printedBottom:.048+.188*feed,
    warmup:.55+.45*Math.cos(phase),
    diode:.48+.35*(.5+.5*Math.cos(phase*2+.7))
  };
}

const band=(value,center,halfWidth)=>Math.max(0,1-Math.abs(value-center)/halfWidth);

// A compact thermal-label printer with a single paper feed. The top shell,
// output slot, roller, and label are deliberately separated so they remain
// recognizable at the picker thumbnail size.
export const labelRun={
  name:'label-run',
  label:'Label Run',
  cat:'warehouse',
  pal:5,
  fn:(u,v,t)=>{
    setFrame(t);
    const absU=Math.abs(u);
    const vignette=cl(1-(absU*.84+Math.abs(v)*1.35)*.44,.18,1);
    let value=(.035+.018*Math.sin(u*37+v*81))*vignette;

    // Heavy printer body, its bevel, and a shallow display window.
    if(absU<.445&&v>-.285&&v<.022){
      value=.115;
      const inner=Math.max(absU/.405,Math.abs(v+.13)/.135);
      if(inner>.84)value=.205;
      if(absU<.18&&v>-.228&&v<-.165){
        value=.045;
        if(absU<.135&&v>-.215&&v<-.181)value=.37;
        if(absU<.078&&v>-.204&&v<-.193)value=.58;
      }
      if(absU>.326&&absU<.35&&v>-.212&&v<-.184)value=frame.diode;
      if(absU<.315&&Math.abs(v+.002)<.018)value=.025;
      if(absU<.365&&Math.abs(v+.254)<.008)value=.44;
    }

    // The output roller sits over the first edge of the paper, giving the
    // label a visible peel point as it advances toward the bottom of frame.
    if(absU<.294&&v>.008&&v<.068){
      const rollerShade=.10+.075*band(u,0,.294)+.03*Math.sin(u*65+frame.phase);
      value=Math.max(value,rollerShade);
      if(Math.abs(v-.017)<.006)value=Math.max(value,.43);
    }

    const inLabel=absU<.244&&v>.025&&v<frame.labelBottom;
    if(inLabel){
      const edge=Math.max(absU/.244,(v-.025)/(frame.labelBottom-.025));
      let paper=.80-.13*edge+.035*Math.sin(u*173+v*121);
      if(absU>.232||v>frame.labelBottom-.009)paper=.48;

      // The blank title band emerges first, then the barcode grows down the
      // page as the label feeds. Bars are abstract deterministic geometry.
      if(v>.052&&v<frame.printedBottom&&absU<.19){
        const column=Math.floor((u+.196)*86);
        const group=column%11;
        const bar=group<3||group===5||group===8||group===10;
        const guard=column===2||column===3||column===29||column===30;
        if(bar||guard)paper=.055;
        if((column===12||column===20)&&v<frame.printedBottom-.008)paper=.24;
      }else if(v>.034&&v<.046&&absU<.165){
        const glyph=Math.floor((u+.17)*38)%5;
        if(glyph===0||glyph===1||glyph===4)paper=.22;
      }

      // Fine segmented text under the printed field keeps the object reading
      // as a shipping label without encoding a real shipment or barcode.
      if(v>frame.labelBottom-.040&&v<frame.labelBottom-.018&&absU<.18){
        const mark=Math.floor((u+.19)*56)%6;
        if(mark<2)paper=.30;
      }
      value=Math.max(value,paper);
    }

    // The exposed lower lip and a soft moving print-head reflection show the
    // cycle continuing as one label clears and the next begins above it.
    const lip=.043+.015*(u/.255)*(u/.255);
    if(absU<.265&&Math.abs(v-lip)<.006)value=Math.max(value,.63);
    if(absU<.235&&v>.024&&v<frame.labelBottom){
      const sheen=band(v,.047+.16*frame.feed,.006)*(.15+.18*frame.warmup);
      value=Math.max(value,value+sheen);
    }

    return cl(value*vignette);
  }
};
