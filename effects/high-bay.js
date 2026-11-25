import {cl,fr,sm} from './noise.js';

// Looking up from a warehouse aisle. The two rack faces converge at the roof
// lights while the bridge crane crosses the opening once every six seconds.
export const highBay={
  name:'high-bay',
  label:'High Bay',
  cat:'warehouse',
  pal:12,
  fn:(u,v,t)=>{
    const phase=t*Math.PI/3;
    const craneX=.31*Math.sin(phase);
    const craneSwing=.014*Math.sin(phase*2);
    // Keep the travelling bridge in the normal 16:9 field as well as tall
    // previews. It reads as a suspended gantry beneath the roof lights.
    const bridgeY=-.205;
    const fromRoof=cl((v+.46)/.96);
    const inner=.035+fromRoof*.385;
    const outer=.49;
    const absU=Math.abs(u);
    const inRack=absU>inner&&absU<outer;
    const roofFade=1-fromRoof;

    // A cool, tall shaft of roof light stays visible between the rack faces.
    const roofGlow=Math.max(0,1-Math.abs(u)/(.06+.13*fromRoof));
    const dust=.022*Math.sin(u*73+v*117)+.012*Math.sin(u*149-v*91);
    let value=.070+.080*roofFade+.18*roofGlow*roofGlow+dust;

    // Long roof beams meet at the high vanishing point. Their rotation is
    // deliberately still so the moving crane remains the subject.
    const beamX=Math.abs(absU-(.025+fromRoof*.56));
    const beam=1-sm(.008,.026,beamX);
    const crossY=Math.abs(fr((fromRoof+.035)*7.3)-.5);
    const cross=1-sm(.012,.052,crossY);
    value+=beam*.190+cross*.075*(.25+.75*roofFade);

    if(inRack){
      const side=(u<0?-1:1);
      const local=(absU-inner)/(outer-inner);
      // Warm rack uprights, diagonal bracing, and stacked pallet bays create
      // the industrial silhouette without filling the central roof opening.
      const upright=1-sm(.010,.035,Math.min(local,1-local));
      const bracePos=Math.abs(fr((local*4.6+fromRoof*5.1)*.5)-.5);
      const brace=1-sm(.024,.080,bracePos);
      const bayY=Math.abs(fr(fromRoof*6.0+local*.18)-.5);
      const shelf=1-sm(.016,.065,bayY);
      const pallet=(Math.sin((local*12+fromRoof*10+side)*Math.PI)>-.25)?1:0;
      const label=Math.max(0,1-Math.abs(local-.54)/.09)*Math.max(0,1-Math.abs(fr(fromRoof*3.0)-.36)/.14);
      value=.150+.075*pallet+upright*.34+brace*.16+shelf*.17+label*.19;

      // A sparse reflected roof-light edge establishes each rack as steel.
      const edge=Math.max(0,1-(local*.9+fromRoof*.16));
      value+=edge*.11;
    }

    // Traversing crane rail just under the roof. The cart and box are kept
    // chunky enough for the picker thumbnail.
    const railY=Math.abs(v-(bridgeY-.018));
    value=Math.max(value,.15+Math.max(0,1-railY/.012)*.26);
    const bridgeSpan=Math.abs(u-craneX);
    const bridgeHeight=Math.abs(v-bridgeY);
    const bridgeEdge=Math.max(bridgeSpan/.19,bridgeHeight/.042);
    const bridgeBody=1-sm(.82,1,bridgeEdge);
    const bridgeRim=sm(.59,.82,bridgeEdge);
    value=Math.max(value,bridgeBody*(.53+.33*bridgeRim));

    const cableX=Math.abs(u-craneX-craneSwing);
    const cable=(1-sm(.003,.010,cableX))*cl((v-bridgeY)/.012)*cl((-.055-v)/.012);
    value=Math.max(value,cable*.61);
    const crateX=Math.abs(u-craneX-craneSwing);
    const crateY=Math.abs(v+.015);
    const crateEdge=Math.max(crateX/.064,crateY/.052);
    const crateBody=1-sm(.82,1,crateEdge);
    const crateRim=sm(.61,.82,crateEdge);
    const slats=.5+.5*Math.sin(crateX*310+crateY*110);
    value=Math.max(value,crateBody*(.58+.14*slats+.23*crateRim));

    // The box dims a cone of light as it travels across the ceiling opening.
    const shadowX=Math.max(0,1-Math.abs(u-craneX-craneSwing)/.18);
    const shadowY=Math.max(0,1-Math.abs(v+.015)/.22);
    value-=shadowX*shadowX*shadowY*.075;

    const vignette=Math.max(.30,1-(u*u*1.05+v*v*1.75)*.68);
    return cl(value*vignette);
  }
};
