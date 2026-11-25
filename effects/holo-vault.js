import {cl,sm,fr} from './noise.js';

// A quiet card vault whose scanner completes one uninterrupted pass every six seconds.
export const holoVault={
  name:'holo-vault',
  label:'Holo Vault',
  cat:'trading cards',
  pal:1,
  fn:(u,v,t)=>{
    const phase=t*Math.PI/3;
    const scan=.5+.5*Math.sin(phase);
    const pulse=.5+.5*Math.sin(phase*2);
    const horizon=-.025;
    const depth=Math.max(0,v-horizon);
    const vignette=cl(1-(Math.abs(u)*.9+Math.abs(v+.01)*1.5)*.72);
    let color=.025+.055*vignette+.035*sm(.24,-.20,v);

    // Glossy tiled back wall gives the aisle its depth without filling its center.
    if(v<horizon){
      const tiles=fr((u+.5)*9+Math.floor((v+.32)*20)*.5);
      const grout=sm(.045,.09,tiles)*sm(.045,.09,1-tiles);
      color+=.045*grout+.025*Math.sin(v*160)*grout;
    }else{
      const floorZ=.055/(depth+.016);
      const floorX=u*floorZ*2.8;
      const grout=sm(.04,.10,fr(floorX))*sm(.04,.10,1-fr(floorX))*sm(.04,.10,fr(floorZ*2.4))*sm(.04,.10,1-fr(floorZ*2.4));
      color+=.025+.055*grout*Math.exp(-floorZ*.14);
    }

    // Rack uprights converge on a wide, deliberately clear center aisle.
    const rail=.052/(Math.abs(v-horizon)+.035);
    for(const side of [-1,1]){
      const edge=side*(.19+rail*.63);
      const innerRail=Math.max(0,1-Math.abs(u-edge)*150);
      const outerRail=Math.max(0,1-Math.abs(u-side*(.45-rail*.18))*190);
      color+=innerRail*innerRail*(.10+.09*pulse);
      color+=outerRail*outerRail*.09;
    }

    // Glass slabs are painted from far to near on both racks. The scanner finds
    // their beveled edges, while the middle stays open for a framed card or image.
    for(let row=0;row<4;row++){
      const d=(row+1)/4;
      const y=-.17+Math.pow(d,1.5)*.38;
      const scale=.34+.66*d;
      const slabW=.016+.044*d;
      const slabH=.025+.063*d;
      const inset=.155+.18*d;
      const slots=row===3?3:2;
      for(let side=-1;side<=1;side+=2){
        for(let slot=0;slot<slots;slot++){
          // Slots walk outward along each rack, preserving a central aisle.
          const x=side*(inset+.018*scale+slot*.082*scale);
          const ax=Math.abs(u-x),ay=Math.abs(v-y);
          // Most pixels are not near a slab. Skip its foil and bevel math early.
          if(ax>slabW+.018||ay>slabH+.018)continue;
          const inside=Math.max(ax-slabW,ay-slabH);
          const edge=Math.exp(-Math.abs(inside)*125/scale);
          const isInside=inside<0;
          const cardId=row*19+slot*5+(side>0?3:11);
          if(isInside){
            const holo=.5+.5*Math.sin((u-x)*180+(v-y)*95+cardId*.72+phase*2);
            const gleam=Math.exp(-(((u-x)/(.014+.018*scale)-scan*2+1)**2)*8);
            const innerW=slabW*.70,innerH=slabH*.60;
            const frame=Math.max(0,1-Math.abs(Math.max(ax-innerW,ay-innerH))/(.006+.005*scale));
            const portrait=Math.max(0,1-(ax/(innerW*.67))**2-((v-y+slabH*.08)/(innerH*.48))**2);
            const label=Math.max(0,1-Math.abs(v-y-slabH*.48)/(slabH*.12));
            const topCatch=Math.max(0,1-Math.abs(v-y+slabH*.68)/(slabH*.12));
            const pane=.075+.045*holo+.12*gleam;
            color=Math.max(color,pane+.12*portrait+.05*label+.09*topCatch+.17*frame);
          }else{
            const gleam=Math.exp(-(((u-x)/(.014+.018*scale)-scan*2+1)**2)*8);
            color+=edge*(.10+.30*gleam+.07*pulse);
          }
        }
      }

      // Each shelf catches the moving cyan beam across the vault walls.
      const shelf=Math.exp(-Math.abs(v-(y+slabH*1.45))*190);
      color+=shelf*(.025+.055*sm(.07,.9,d))*(.72+.28*Math.sin(phase));
    }

    // Narrow scanner haze moves through the otherwise empty central aisle.
    const beamX=Math.max(0,1-Math.abs(u-(scan-.5)*.16)/.045);
    const beamY=Math.max(0,1-Math.abs(v-horizon)/.25);
    color+=beamX*beamX*beamY*beamY*.075;
    return cl(color);
  }
};
