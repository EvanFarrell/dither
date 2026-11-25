import {cl,fr,h2,sm} from './noise.js';

const TAU=Math.PI*2;
const COS=.985;
const SIN=.173;

function star(u,v,scale,seed){
  const x=Math.floor((u+.5)*scale);
  const y=Math.floor((v+.5)*scale);
  const point=h2(x+seed,y-seed);
  if(point<.986)return 0;
  const localX=fr((u+.5)*scale)-.5;
  const localY=fr((v+.5)*scale)-.5;
  const radius=.030+.11*(point-.986);
  return Math.max(0,1-Math.hypot(localX,localY)/radius);
}

// A vast, original interstellar carrier with layered armor and small escort
// lights. Its restrained motion makes the foreground structure feel enormous.
export const worldship={
  name:'worldship',
  label:'Worldship',
  cat:'epic',
  pal:8,
  fn:(u,v,t)=>{
    const phase=t*TAU/6;
    const scan=.5+.5*Math.sin(phase);
    const distantMist=.5+.5*Math.sin(u*9-v*13+phase);
    let value=.022+.018*distantMist;

    // Sparse, differently sized stars establish the carrier's exceptional scale.
    value+=star(u,v,31,19)*.15+star(u+.13,v-.07,57,73)*.11;
    value+=star(u,v,9,211)*.035;

    // A dim eclipsed companion peeks around the aft end of the ship.
    const moonX=-.405,moonY=-.166;
    const moonDistance=Math.hypot(u-moonX,(v-moonY)*1.05);
    const corona=Math.exp(-Math.abs(moonDistance-.154)*34);
    if(moonDistance<.151)value=Math.min(value,.028);
    value+=corona*(.12+.18*scan);

    // Turn the screen into the carrier's shallow, cinematic perspective plane.
    const centeredX=u-.055;
    const centeredY=v+.012;
    const along=centeredX*COS+centeredY*SIN;
    const across=-centeredX*SIN+centeredY*COS;
    // The stern remains beyond the left edge while the tall, stepped prow turns
    // inside the right edge. That visible termination gives the huge slab a clear
    // direction of travel in the smallest picker thumbnail.
    const aft=.69;
    const prow=.515;
    const lengthProgress=cl((along+aft)/(aft+prow));
    const prowTaper=cl((prow-along)/.18);
    const tapered=Math.pow(lengthProgress,.38)*(.24+.76*prowTaper);
    const hullHalf=(.054+.083*Math.pow(lengthProgress,.42))*(.18+.82*prowTaper);
    const withinLength=along>-.69&&along<prow;
    const hullEdge=Math.abs(across)/hullHalf;

    // The main slab is a dark void-faring city, built from panel lines and tiny
    // windows. It spans the frame, so the few escorts below read as microscopic.
    if(withinLength&&hullEdge<1){
      const deck=across/hullHalf;
      const verticalDeck=Math.abs(fr((deck+1)*5)-.5);
      const deckLine=Math.max(0,1-verticalDeck/.055);
      const bay=fr((along+.71)*19.5);
      const rib=Math.max(0,1-Math.min(bay,1-bay)/.035);
      const plateShade=.13+.15*(1-Math.abs(deck))+.045*Math.sin(along*31+deck*8);
      const bank=Math.floor((along+.71)*38);
      const level=Math.floor((deck+1)*11);
      const lit=h2(bank,level+401)>.77?1:0;
      const scanline=Math.exp(-Math.pow((along+.16)-(.37*Math.sin(phase)-.03),2)*150);
      const windows=lit*(.045+.10*scanline)*Math.max(0,1-Math.abs(deck)*1.1);
      const trench=Math.exp(-Math.pow(deck/.135,2)*7);
      const edgeLight=Math.pow(Math.max(0,hullEdge-.71)/.29,2);
      const sunwardRim=Math.pow(Math.max(0,deck-.44)/.56,2);
      value=Math.max(value,plateShade+deckLine*.075+rib*.088+windows+
        edgeLight*(.30+.30*scan)+sunwardRim*(.13+.11*scan)-trench*.072);
    }

    // Projecting armor shelves create a clean, blade-like silhouette around the slab.
    for(const side of [-1,1]){
      const armorCenter=side*(hullHalf+.020+.012*Math.sin(along*8+side));
      const armorDistance=Math.abs(across-armorCenter);
      const armorWidth=.015+.016*tapered;
      if(withinLength&&armorDistance<armorWidth){
        const armorFace=.27+.17*tapered;
        const seam=Math.max(0,1-Math.abs(fr((along+.7)*12.2)-.5)/.045);
        const movingEdge=Math.exp(-Math.pow((along+.20)-.38*Math.sin(phase+.9),2)*110);
        value=Math.max(value,armorFace+seam*.15+movingEdge*.31);
      }
    }

    // A wedge-shaped prow and an immense illuminated bay break the long hull into
    // recognisable pieces. The bay is an original carrier feature, not a film prop.
    const bowDistance=prow-along;
    if(bowDistance>0&&bowDistance<.15&&Math.abs(across)<hullHalf*(.20+bowDistance/.15*.80)){
      const bowLight=(1-bowDistance/.15)*(.35+.26*scan);
      value=Math.max(value,.24+bowLight);
    }
    if(withinLength&&Math.abs(along-.205)<.026&&Math.abs(across)<hullHalf*.76){
      const bayEdge=Math.max(Math.abs(along-.205)/.026,Math.abs(across)/(hullHalf*.76));
      const bayRim=Math.max(0,1-Math.abs(bayEdge-.82)/.18);
      const bayCore=Math.max(0,1-bayEdge/.80);
      value=Math.max(value,.16+bayCore*.17+bayRim*(.38+.22*scan));
    }
    const stern=along+.625;
    if(stern>0&&stern<.050&&Math.abs(across)<hullHalf*1.35){
      const engine=Math.max(0,1-Math.abs(across)/(hullHalf*1.24));
      value=Math.max(value,.20+engine*(.14+.19*(1-scan)));
    }

    // Three distant escorts traverse a separate plane below the carrier.
    for(let index=0;index<3;index++){
      const orbit=phase+index*2.1;
      const escortX=-.30+index*.24+.020*Math.sin(orbit);
      const escortY=.205+.022*Math.cos(orbit*2);
      const d=Math.hypot(u-escortX,(v-escortY)*1.5);
      if(d<.024){
        const light=1-d/.024;
        value=Math.max(value,.31+light*(.46+.14*Math.sin(orbit*2)));
      }
    }

    const vignette=Math.max(.34,1-(u*u*.78+v*v*2.3)*.42);
    return cl(value*vignette);
  }
};
