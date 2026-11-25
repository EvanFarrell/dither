import {cl,fr,sm} from './noise.js';

// A six-second pick route. Amber runs down the near rack, dwells at the
// nominated bin, then the far rack acknowledges the completed path in green.
export const pickToLight={
  name:'pick-to-light',
  label:'Pick to Light',
  cat:'warehouse',
  pal:14,
  fn:(u,v,t)=>{
    const phase=t*Math.PI/3;
    const travel=.5-.5*Math.cos(phase);
    const direction=Math.sin(phase);
    // The route only lights after it has launched from the loading end. The
    // rounded direction gates are deliberately broad, so a full tote lights
    // up while the scan passes it rather than only a subpixel lamp flickering.
    const launch=sm(.015,.06,travel);
    const outbound=sm(-.08,.10,direction)*launch;
    const returnTrip=sm(-.08,.10,-direction)*launch;
    // The incoming scan reaches the nominated tote in the sidebar thumbnail
    // at 2.5 seconds, then holds it in amber through the turn-around.
    const dwell=Math.pow(.5+.5*Math.cos(phase-Math.PI*5/6),8);
    const rack=Math.abs(u)>.145;
    let col=.038+.026*(.5+.5*Math.sin(u*13-v*17));

    // A shadowed aisle and a matte concrete apron prevent the pick wall from
    // reading as another neon arcade or a card display.
    if(v>.255){
      const depth=.07/(v-.235);
      const lane=fr(u*depth*3.7+.5);
      const seam=Math.max(0,1-Math.min(lane,1-lane)/.038);
      const cross=Math.max(0,1-Math.min(fr(depth*2.25),1-fr(depth*2.25))/.045);
      col=.072+.026*Math.sin(depth*5.6)+.035*Math.max(seam,cross);
    }else if(!rack){
      const ceiling=Math.max(0,1-Math.abs(v+.19)/.012);
      col+=ceiling*.055;
    }

    // Steel rack uprights and shelf beams give the bins their industrial grid.
    if(rack&&v<.285){
      const inner=Math.max(0,1-Math.abs(Math.abs(u)-.155)/.013);
      const outer=Math.max(0,1-Math.abs(Math.abs(u)-.485)/.016);
      col=Math.max(col,.115+inner*.09+outer*.055);
      for(let shelf=0;shelf<5;shelf++){
        const y=-.285+shelf*.125;
        const beam=Math.max(0,1-Math.abs(v-y)/.010);
        col=Math.max(col,.13+beam*.12);
      }
    }

    // Two columns of large, chunky storage totes occupy each rack. The cheap
    // bounds keep the detailed bin treatment off almost every canvas pixel.
    for(let side=-1;side<=1;side+=2){
      const isNear=side<0;
      for(let row=0;row<4;row++){
        const y=-.222+row*.125;
        for(let slot=0;slot<2;slot++){
          const x=side*(.235+slot*.155);
          const dx=Math.abs(u-x),dy=Math.abs(v-y);
          const width=.066,height=.047;
          if(dx>width+.012||dy>height+.014)continue;
          const inside=dx<width&&dy<height;
          const rim=Math.max(0,1-Math.abs(Math.max(dx-width,dy-height))/.010);
          const route=(row*2+slot)/7;
          const pass=sm(.30,0,Math.abs(travel-route));
          const scan=(isNear?outbound:returnTrip)*pass;
          const focal=isNear&&row===3&&slot===1?dwell:0;

          if(inside){
            const lip=dx>width-.010||dy>height-.010;
            const ribs=.5+.5*Math.sin((u-x)*285);
            const label=dy<height*.35&&dy>height*.08&&dx<width*.48;
            // Matte tote faces and the steel lip stay visible when no lamp is
            // active, so the picker reads as warehouse shelving at a glance.
            let tote=.23+(lip?.12:0)+(label?.10:0)+ribs*.035;
            // Green returns use the high end of the five-stop palette while
            // amber stays below it, keeping the two route directions clear.
            // Multiplying the entire contribution by scan keeps the exact
            // zero-crossing at the 6-second seam dark and continuous.
            // The outgoing tote peaks in the amber band. The return uses the
            // top palette stop so its green acknowledgement stays unmistakable.
            tote=Math.max(tote,scan*(isNear?.77:1.13));
            // The nominated bin rises through the amber range smoothly, then
            // falls back into the shelf as the green return begins.
            tote=Math.max(tote,focal*.77);
            col=Math.max(col,tote);
          }else{
            col=Math.max(col,.12+rim*(.12+scan*.48+focal*.35));
          }

          // A square pick lamp mounted over each tote remains distinct even at
          // thumbnail size and does not need radial or exponential falloff.
          const lampX=x+side*.036,lampY=y-height-.019;
          const lamp=Math.max(0,1-Math.max(Math.abs(u-lampX)/.022,Math.abs(v-lampY)/.014));
          if(lamp){
            const lampLevel=isNear
              ?Math.min(.77,.10+scan*.62+focal*.12)
              :.08+scan*1.05;
            col=Math.max(col,lamp*lampLevel);
          }
        }
      }
    }

    // The nominated tote holds a short amber pause at the turn-around point.
    const focusX=-.39,focusY=.153;
    const focus=Math.max(0,1-Math.max(Math.abs(u-focusX)/.092,Math.abs(v-focusY)/.070));
    col=Math.max(col,focus*(.17+Math.pow(travel,10)*.55));
    const vignette=Math.max(.32,1-(u*u*1.08+v*v*1.52)*.82);
    return cl(col*vignette);
  }
};
