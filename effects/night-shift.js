import {cl,fr} from './noise.js';

const TAU=Math.PI*2;

// A warehouse intersection after hours. The forklift crosses the distant bay
// every six seconds while its low beams catch dust and pallet wrap.
export const nightShift={
  name:'night-shift',
  label:'Night Shift',
  cat:'warehouse',
  pal:8,
  fn:(u,v,t)=>{
    const phase=TAU*(t-2.5)/6;
    const forkliftX=.30*Math.sin(phase);
    const forkliftY=-.008;
    const sweep=.5+.5*Math.cos(phase);
    const floor=v>-.02;
    let value=.028+.018*(.5+.5*Math.sin(u*21+v*43));

    // The rear wall and tall bay uprights establish a large, dark intersection.
    if(!floor){
      value+=.042+(.5-v)*.045;
      const seam=Math.abs(fr((u+.5)*7)-.5);
      value+=seam>.474?.036:0;
      const lamp=Math.max(0,1-Math.abs(u)*4.2)*Math.max(0,1-Math.abs(v+.205)*14);
      value+=lamp*lamp*.115;
    }else{
      const depth=v+.02;
      const perspective=.042/(depth+.028);
      const tileX=u*perspective*2.8;
      const lines=Math.max(0,1-Math.abs(fr(tileX)-.5)*9)*.028+
        Math.max(0,1-Math.abs(fr(perspective*2.1)-.5)*15)*.018;
      value+=.028+depth*.07+lines;
    }

    // Wrapped pallet silhouettes live at the edges, leaving a clean crossing lane.
    const stacks=[[-.38,-.015,.14,.15],[.365,.03,.13,.13],[-.455,.14,.09,.11],[.455,.16,.08,.10]];
    let wrapped=0;
    for(let i=0;i<stacks.length;i++){
      const [x,y,w,h]=stacks[i];
      const dx=Math.abs(u-x),dy=Math.abs(v-y);
      if(dx<w&&dy<h){
        const edge=Math.max(dx/w,dy/h);
        const wrap=.12+.035*Math.sin((u-x)*96+(v-y)*44+i*2.4);
        const bands=Math.max(0,1-Math.abs(fr((v-y)*18)-.5)*13)*.09;
        wrapped=Math.max(wrapped,wrap+bands+(edge>.91?.13:0));
      }
    }
    value=Math.max(value,wrapped);

    // Two shallow cones aim toward the foreground, illuminating drifting dust,
    // floor joints, and the clear plastic around the pallets.
    let beams=0;
    for(const offset of [-.042,.042]){
      const beamY=v-(forkliftY+.024);
      if(beamY>0&&beamY<.42){
        const width=.014+beamY*.72;
        const beamX=forkliftX+offset;
        const shape=Math.max(0,1-Math.abs(u-beamX)/width);
        beams+=shape*shape*(1-beamY/.48)*.28;
      }
    }
    const dust=(.5+.5*Math.sin(u*67+v*91+phase*3))*(.5+.5*Math.sin(u*31-v*57-phase*2));
    value+=beams*(.55+.45*dust);
    if(wrapped)value=Math.max(value,wrapped+beams*.75);

    // Forklift geometry bails early for almost every rendered pixel.
    const localX=u-forkliftX,localY=v-forkliftY;
    if(Math.abs(localX)<.185&&Math.abs(localY)<.14){
      const body=Math.abs(localX)<.112&&localY>.004&&localY<.074;
      const cabin=localX<.006&&localX>-.102&&localY>-.088&&localY<.017;
      const mast=localX>.102&&localX<.124&&localY>-.113&&localY<.078;
      const roof=localX>-.115&&localX<.025&&localY>-.100&&localY<-.080;
      const fork=localX>.119&&localX<.18&&Math.abs(localY-.062)<.010;
      const wheel=(Math.abs(localX+.069)<.032&&Math.abs(localY-.076)<.024)||
        (Math.abs(localX-.065)<.032&&Math.abs(localY-.076)<.024);
      // A broad bright bumper/body reads as a tiny vehicle, then the dark
      // wheels and hard mast split the silhouette into recognisable parts.
      if(body)value=Math.max(value,.43+.08*sweep);
      if(cabin)value=Math.max(value,.27+.045*Math.sin(localX*140+phase));
      if(mast||roof)value=Math.max(value,.57);
      if(fork)value=Math.max(value,.47);
      if(wheel){
        const wheelRim=Math.abs(Math.abs(localY-.066)-.016)<.005;
        value=wheelRim?Math.max(value,.36):Math.min(value,.05);
      }
      const headlamp=localX>.097&&localX<.127&&Math.abs(localY-.025)<.020;
      if(headlamp)value=Math.max(value,.82+.16*sweep);
    }

    // Falloff keeps the foreground empty and makes the distant crossing glow.
    const vignette=1-Math.max(0,Math.abs(u)*.45+Math.max(0,v-.22)*.85);
    return cl(value*Math.max(.42,vignette));
  }
};
