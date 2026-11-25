import {cl,fr} from './noise.js';

// A ceremonial dungeon threshold. Every motion is driven by a 6-second phase so
// loop recording returns to the first frame without a jump.
export const bossDoor={
  name:'boss-door',label:'Boss Door',cat:'gaming',pal:2,
  fn:(u,v,t)=>{
    const tau=Math.PI*2;
    const phase=t*tau/6;
    const horizon=-.035;
    const away=Math.abs(v-horizon);
    const corridor=.155+away*.82;
    const edge=Math.abs(u)-corridor;
    const isWall=edge>0;
    const open=Math.pow(.5+.5*Math.cos(phase),1.7);
    const torchFlicker=.82+.18*Math.sin(phase*11)+.09*Math.sin(phase*23);
    let value=.055;

    if(isWall){
      // Stone walls taper into the distant doorway and carry two restless torches.
      const stoneX=Math.floor((Math.abs(u)-corridor)*24+away*9);
      const stoneY=Math.floor(v*18-away*5);
      const mortar=Math.min(fr((Math.abs(u)-corridor)*24+away*9),fr(v*18-away*5));
      const stones=.17+.075*((stoneX+stoneY)&1)+.04*Math.sin(stoneX*2.7+stoneY);
      const joint=Math.exp(-mortar*20)*.14;
      const leftTorch=Math.exp(-Math.hypot((u+.315)*5.2,(v+.12)*7.3)*3.6);
      const rightTorch=Math.exp(-Math.hypot((u-.315)*5.2,(v+.12)*7.3)*3.6);
      const flame=Math.max(leftTorch,rightTorch)*torchFlicker;
      const sconce=Math.max(
        Math.exp(-Math.hypot((u+.315)*45,(v+.102)*34)),
        Math.exp(-Math.hypot((u-.315)*45,(v+.102)*34))
      );
      value=stones-joint+flame*.49+sconce*.68;
    }else if(v<horizon){
      // Coffered ceiling panels converge into the doorway.
      const z=.18/(horizon-v+.012);
      const px=u*z*1.45,py=z*.95;
      const gx=fr(px),gy=fr(py);
      const panel=Math.min(gx,1-gx,gy,1-gy);
      const coffer=.15+.18*Math.min(1,panel*13);
      const torchWash=(
        Math.exp(-Math.hypot(u+.24,(v+.13)*1.25)*8)+
        Math.exp(-Math.hypot(u-.24,(v+.13)*1.25)*8)
      )*.12*torchFlicker;
      value=coffer+torchWash;
    }else{
      // Perspective paving leads the eye to the crack in the Boss Door.
      const z=.16/(v-horizon+.015);
      const px=u*z*1.75,py=z*1.36;
      const gx=fr(px),gy=fr(py);
      const grout=Math.min(gx,1-gx,gy,1-gy);
      const paving=.115+.17*Math.min(1,grout*14);
      const beamWidth=.018+(v-horizon)*.92;
      const beam=Math.exp(-((u/beamWidth)**2))*(.13+.72*open);
      const torchWash=(
        Math.exp(-Math.hypot(u+.31,(v+.03)*1.45)*8)+
        Math.exp(-Math.hypot(u-.31,(v+.03)*1.45)*8)
      )*.11*torchFlicker;
      value=paving+beam+torchWash;
    }

    // The silhouette is intentionally large, so the scene reads in the 80 by 45 picker.
    const body=Math.abs(u)<.192&&v>=-.18&&v<.082;
    const arch=v<-.18&&v>-.34&&(u/.192)**2+((v+.18)/.16)**2<1;
    if(body||arch){
      const panelLine=Math.exp(-Math.abs(fr((u+.192)/.384*3)-.5)*24)*.045;
      const grain=.025*Math.sin(u*91+v*37);
      value=.115+panelLine+grain;

      const centerY=-.125;
      const crack=.0045+.013*open;
      const doorGlow=Math.exp(-Math.abs(u)/(crack+.002));
      value+=doorGlow*(.16+.75*open);

      // Five runic seals chase around the lock, making the opening feel deliberate.
      for(let seal=0;seal<5;seal++){
        const a=seal*tau/5-Math.PI/2;
        const sx=.098*Math.cos(a);
        const sy=centerY+.092*Math.sin(a);
        const rune=Math.exp(-Math.hypot((u-sx)*1.12,(v-sy)*1.3)*75);
        const charge=Math.pow(.5+.5*Math.cos(phase-seal*tau/5),12);
        value+=rune*(.17+.7*charge);
      }

      const lock=Math.hypot(u,(v-centerY)*1.06);
      const ring=Math.exp(-Math.abs(lock-.055)*150);
      value+=ring*(.08+.21*(1-open));
    }

    // Riveted frame and the arch’s bright, firelit rim.
    const upright=Math.exp(-Math.abs(Math.abs(u)-.198)*110)*Math.max(0,Math.min(1,(v+.2)*9));
    const archRadius=Math.hypot(u/.198,(v+.18)/.165);
    const archRim=(v<-.18?Math.exp(-Math.abs(archRadius-1)*65):0);
    const heat=(
      Math.exp(-Math.hypot(u+.315,(v+.12)*1.25)*8)+
      Math.exp(-Math.hypot(u-.315,(v+.12)*1.25)*8)
    )*.1*torchFlicker;
    return cl(value+upright*.35+archRim*.3+heat);
  }
};
