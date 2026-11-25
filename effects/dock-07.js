import {cl,fr} from './noise.js';

// A rain-soaked loading bay. The dock light and every rain motion use an
// integer six-second phase, so its first and last recorded frames meet cleanly.
export const dock07={
  name:'dock-07',
  label:'Dock 07',
  cat:'warehouse',
  pal:13,
  fn:(u,v,t)=>{
    const phase=t*Math.PI/3;
    const horizon=-.048;
    const bay=Math.abs(u)<.322;
    const sweepX=.17*Math.sin(phase-.62);
    const beacon=.5+.5*Math.sin(phase*2+.4);
    let col=.055;

    if(v<horizon){
      // The open dock looks onto a distant trailer, rain and a row of cold
      // sodium lamps. Its low, wide silhouette leaves the middle spacious.
      const farY=(v+.118)*38;
      const trailer=bay&&v>-.205&&v<-.078&&Math.abs(u+.025)<.238;
      // Smooth, diagonal rain bands translate downward over one exact cycle.
      // Unlike a wrapped cell threshold, they cannot pop at the loop join.
      const rainWave=.5+.5*Math.sin(u*51-v*112-phase*2);
      const rainLine=rainWave*rainWave*rainWave*rainWave*rainWave*rainWave*rainWave*rainWave*rainWave;
      const distant=.105+.025*Math.sin(v*84)+.03*(Math.abs(u)>.255?1:0);
      col=distant+rainLine*.18;

      if(trailer){
        const panel=fr((u+.27)*7);
        const rib=panel<.045?1:0;
        const roof=v<-.189?.09:0;
        col=.13+.035*Math.sin((u+.02)*42+v*25)+rib*.075+roof;
      }

      // Two trailer lamps wake up the rain. Their gentle change is deliberately
      // broad enough to read in the sidebar thumbnail.
      const leftLamp=Math.max(0,1-(Math.abs(u+.165)*8+Math.abs(v+.082)*29));
      const rightLamp=Math.max(0,1-(Math.abs(u-.178)*8+Math.abs(v+.082)*29));
      col+=leftLamp*leftLamp*(.52+.18*beacon)+rightLamp*rightLamp*(.47+.17*(1-beacon));
      col+=Math.max(0,1-Math.abs(farY))*rainLine*.12;
    }else{
      // Wet slab concrete uses a receding expansion, a few drain seams and the
      // traveling trailer beam that slides from one side of the dock to the other.
      const depth=.105/(v-horizon+.016);
      const floorU=u*depth*2.35;
      const floorZ=depth*1.6;
      const seam=Math.min(Math.abs(fr(floorU)-.5),Math.abs(fr(floorZ)-.5));
      const grout=Math.max(0,1-seam*24);
      const puddle=.5+.5*Math.sin(floorU*9+floorZ*7+phase*2);
      const wet=.105+.055*puddle+.045*grout;
      const reflectionReach=Math.max(0,1-(v-horizon)/.315);
      const beam=Math.max(0,1-Math.abs(u-sweepX)/(.052+(v-horizon)*.42));
      const broken=.56+.44*Math.sin((u-sweepX)*78+v*96+phase*3);
      const lampGlow=Math.max(0,1-(Math.abs(u+.165)*3.4+(v-horizon)*4.6));
      const lampGlow2=Math.max(0,1-(Math.abs(u-.178)*3.4+(v-horizon)*4.6));
      col=wet+beam*beam*reflectionReach*(.42+.25*broken)+lampGlow*lampGlow*.24+lampGlow2*lampGlow2*.21;
    }

    // Heavy dock curtains and steel jambs frame the weather without closing
    // off the opening. The rubber edges breathe inward and out over the loop.
    const curtainWave=.012*Math.sin(phase+v*18)+.006*Math.sin(phase*2-v*37);
    const curtain=Math.abs(u)-(.294+curtainWave);
    if(curtain>0&&Math.abs(u)<.342&&v<.085){
      const ribs=fr((v+.28)*18+Math.abs(u)*6)<.13?.045:0;
      col=.035+ribs;
    }
    const jamb=Math.abs(Math.abs(u)-.342);
    if(jamb<.018&&v<.16)col=.09+(.018-jamb)*4.2;

    // A bright steel lintel keeps the open bay legible at thumbnail scale.
    if(bay){
      const lintel=Math.max(0,1-Math.abs(v+.252)*78);
      col=Math.max(col,.085+lintel*.22);
    }

    // The raised dock bumper holds the image down and turns the sweep into a
    // clear reflection, even on compact picker thumbnails.
    const bumper=Math.max(0,1-Math.abs(v-.105)*85);
    col=Math.max(col,.055+bumper*(.08+.13*(.5+.5*Math.sin(phase))));
    const vignette=Math.max(.28,1-(u*u*1.36+v*v*1.5)*.74);
    return cl(col*vignette);
  }
};
