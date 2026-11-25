import {cl,sm,fbm} from './noise.js';

// A still night pond framed by reeds. All movement is expressed through a
// six-second phase so the foil reflection returns to its opening frame.
export const foilSwamp={
  name:'foil-swamp',
  label:'Foil Swamp',
  cat:'trading cards',
  pal:11,
  fn:(u,v,t)=>{
    const phase=t*Math.PI/3;
    const horizon=-.005;
    const sky=.055+.075*sm(.22,-.28,v)+.035*fbm(u*4.3,v*5.1);

    if(v<horizon){
      const mist=sm(.59,.83,fbm(u*5.2+Math.sin(phase)*.18,v*7.4))*sm(horizon,-.18,v)*.14;
      const moon=Math.exp(-Math.hypot(u-.23,v+.15)*13)*.17;
      return cl(sky+mist+moon);
    }

    const depth=v-horizon;
    const z=.045/(depth+.018);
    const driftX=.035*Math.sin(phase);
    const ripA=.5+.5*Math.sin(z*8.5+u*26+Math.sin(u*8-phase)*1.8-phase*2);
    const ripB=.5+.5*Math.sin(z*15.5-u*39+Math.sin(z*2.4+phase)*1.4+phase*3);
    const ripples=Math.pow(ripA,.72)*.13+Math.pow(ripB,3)*.12;
    const water=.16+depth*.12+ripples+.055*fbm(u*z*1.6+driftX,z*1.9);

    // Thin-film colour is rendered as broad traveling bands over fine water
    // ripples. The soft curtain provides a visible loop without a hard seam.
    const wide=.5+.5*Math.sin(u*7.2+depth*31+Math.sin(u*15-depth*12+phase)*.8-phase);
    const film=.5+.5*Math.sin(u*17-depth*58+phase*2+wide*2.4);
    const curtain=Math.pow(.5+.5*Math.sin(u*3.3-phase+depth*12),2);
    const sheen=(.18+.52*Math.pow(wide,1.6)*(.3+.7*film))*curtain;
    let col=water+sheen*(.42+.58*ripA)+Math.exp(-depth*85)*.19;

    // Reeds silhouette the two shores and keep a calm, open patch of water in
    // the middle for a framed card or screenshot.
    let reed=0;
    for(let k=0;k<8;k++){
      const top=.025+(k%4)*.043;
      const progress=(v-top)/(.34-top);
      if(progress>=0&&progress<=1){
        const bend=Math.sin(phase+k*1.73)*(.024+.006*(k%3))*(1-progress)*(1-progress);
        const left=-.485+k*.034+bend;
        const right=.485-k*.034-bend*.83;
        const width=.0015+.004*progress;
        const leftStem=sm(width+.006,width,Math.abs(u-left));
        const rightStem=sm(width+.006,width,Math.abs(u-right));
        reed=Math.max(reed,leftStem,rightStem);

        // A few diagonal leaves catch the waterline and make the banks read at
        // small thumbnail sizes without filling the central composition.
        const leafY=.17+(k%3)*.045;
        const leafFade=sm(leafY+.018,leafY-.035,v)*sm(leafY-.09,leafY-.02,v);
        const leftLeaf=Math.abs(u-(left+(leafY-v)*1.25))<.006+leafFade*.003;
        const rightLeaf=Math.abs(u-(right-(leafY-v)*1.1))<.006+leafFade*.003;
        if(leafFade>0&&(leftLeaf||rightLeaf))reed=1;
      }
    }
    // Low, irregular foreground bank.
    const bank=.255+.024*fbm(u*13.5+2.4,2.1)+.012*Math.sin(u*22+phase);
    if(v>bank)reed=Math.max(reed,sm(bank,bank+.025,v));
    return cl(col*(1-reed)+.012*reed);
  }
};
