import {cl,fr,h2,sm} from './noise.js';

const TAU=Math.PI*2;

function ship(u,v,cx,cy,length,width,angle,drift,detail){
  const cosine=Math.cos(angle),sine=Math.sin(angle);
  const dx=u-cx-drift,dy=v-cy-drift*.22;
  const x=dx*cosine+dy*sine;
  const y=-dx*sine+dy*cosine;
  const progress=(x+length)/(length*2);
  if(progress<0||progress>1)return 0;

  // The ships are original, tapered freight silhouettes with a broad mid-body,
  // a pointed bow, and an offset, illuminated engine nacelle.
  const bodyWidth=width*(.24+.76*Math.sin(progress*Math.PI));
  const hull=Math.max(Math.abs(y)-bodyWidth,Math.abs(x)-length);
  const tower=x>-.25*length&&x<.18*length&&y<-.40*bodyWidth&&y>-2.55*bodyWidth;
  const fin=x>-.66*length&&x<-.28*length&&y>.30*bodyWidth&&y<1.58*bodyWidth;
  if(hull>.009&&!tower&&!fin)return 0;

  const interior=hull<0||tower||fin;
  const edge=Math.max(0,1-Math.abs(hull)/.008);
  const spine=Math.max(0,1-Math.abs(y+width*.24)/(.0025+width*.12))*(hull<0);
  const bay=Math.max(0,1-Math.abs(fr(progress*7+detail*.19)-.5)*11);
  const engine=Math.max(0,1-Math.hypot((x+length*.77)/(length*.13),y/(width*.9)));
  const wake=Math.max(0,1-Math.abs(y)/(width*1.15))*
    Math.max(0,1-(x+length*1.34)/(length*.55))*Math.max(0,1-(x+length)/(length*.13));

  if(!interior)return edge*.46;
  const superstructure=(tower||fin)?.12:0;
  return .035+superstructure+edge*.27+spine*.19+bay*.075+engine*.42+wake*.12;
}

// A huge gas-giant horizon makes the convoy's fleet look tiny. All movement is
// six-second periodic, so the scene records as a true loop.
export const eclipseConvoy={
  name:'eclipse-convoy',
  label:'Eclipse Convoy',
  cat:'epic',
  pal:12,
  fn:(u,v,t)=>{
    const phase=fr(t/6)*TAU;
    const planetX=-.16,planetY=.575,planetR=.675;
    const dx=u-planetX,dy=v-planetY;
    const distance=Math.hypot(dx,dy);
    const inPlanet=distance<planetR;
    const star=h2(Math.floor((u+.7)*198),Math.floor((v+.7)*198));
    const twinkle=.72+.28*Math.sin(phase*2+star*71);
    let value=.012;

    if(star>.992)value+=((star-.992)/.008)*twinkle*.52;
    const dust=.5+.5*Math.sin(u*16-v*27+phase);
    value+=.019*dust*Math.max(0,1-Math.hypot(u+.04,v+.06)*1.5);

    // The planet's curved limb crosses almost the full frame, with high clouds,
    // a cold atmospheric rim, and a wide banded terminator.
    if(inPlanet){
      const nx=dx/planetR,ny=dy/planetR;
      const limb=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
      const latitude=ny+Math.sin(nx*8+phase)*.018;
      const belts=.46+.18*Math.sin(latitude*37)+.11*Math.sin(latitude*76+nx*9);
      const cloud=.5+.5*Math.sin(nx*52+latitude*21+phase*2)+
        .5*Math.sin(nx*13-latitude*48-phase);
      const terminator=cl(.28+limb*.74+nx*.16);
      const storm=Math.exp(-Math.hypot((nx+.15)*2.3,(ny+.42)*8))*
        (.14+.09*Math.sin(phase));
      value=.10+belts*.23+cloud*.065+terminator*.21+storm;
    }

    const rim=Math.exp(-Math.abs(distance-planetR)*80);
    const upperAtmosphere=Math.max(0,1-(v+.04)/.20);
    value+=rim*(.24+.31*upperAtmosphere);
    value+=Math.exp(-Math.abs(distance-planetR)*17)*.045;

    // A very distant eclipsed moon brings a second enormous scale marker into
    // the upper-right without turning the scene into a standard solar eclipse.
    const moonX=.39,moonY=-.19,moonR=.102;
    const moonDistance=Math.hypot(u-moonX,v-moonY);
    const moonHalo=Math.exp(-Math.abs(moonDistance-moonR)*42)*.22;
    if(moonDistance<moonR)value=.017+.025*Math.max(0,1-moonDistance/moonR);
    else value+=moonHalo;

    // Three moving silhouettes use different depth scales and drift rates.
    const leadDrift=.030*Math.sin(phase-.65);
    const middleDrift=.019*Math.sin(phase+.55);
    const farDrift=.011*Math.sin(phase*2.0-1.2);
    const lead=ship(u,v,.075,-.070,.235,.023,-.105,leadDrift,1);
    const middle=ship(u,v,-.205,-.130,.125,.014,-.085,middleDrift,2);
    const far=ship(u,v,.315,-.114,.057,.006,-.105,farDrift,3);
    const escort=ship(u,v,-.015,-.185,.043,.004,-.105,farDrift*.6,4);
    const vessel=Math.max(lead,middle,far,escort);
    if(vessel){
      // Dark interior preserves the silhouette while its hard rim, bays, and
      // engine lights survive the five-color quantization.
      const darkHull=.018;
      value=Math.min(value,darkHull)+vessel*(vessel>.24?.67:.31);
    }

    // Fine contrails make the shallow formation move across the atmosphere.
    const trailA=Math.max(0,1-Math.abs(v+.072+leadDrift*.22)/.0035)*
      Math.max(0,1-(u+.31-leadDrift)/.24);
    const trailB=Math.max(0,1-Math.abs(v+.130+middleDrift*.22)/.0025)*
      Math.max(0,1-(u+.42-middleDrift)/.16);
    value+=trailA*.16+trailB*.10;
    return cl(value);
  }
};
