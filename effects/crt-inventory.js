import {cl,fr,h2} from './noise.js';

// A warm amber RPG item screen viewed through a gently humming CRT.
export const crtInventory={
  name:'crt-inventory',
  label:'CRT Inventory',
  cat:'gaming',
  pal:9,
  fn:(u,v,t)=>{
    // The clock wraps exactly every six seconds, matching the loop recorder.
    const loop=fr(t/6);
    const scan=.91+.09*Math.sin(v*720-loop*6.2831853*3);
    const vignette=cl(1-Math.hypot(u*1.06,v*1.72)*.75,.16,1);
    const noise=(h2(Math.floor(u*190),Math.floor(v*190))-.5)*.035;
    let value=(.028+noise)*vignette;

    // Raised charcoal monitor bezel with squared-off glass.
    const bezel=Math.abs(u)<.445&&Math.abs(v)<.262;
    const screen=Math.abs(u)<.403&&Math.abs(v)<.224;
    if(bezel)value=.12+.045*vignette;
    if(screen){
      value=(.105+noise)*scan*vignette;

      // The segmented title bar and its status pips hold the composition together.
      if(v<-.186){
        const title=Math.abs(u+.245)<.078&&Math.abs(v+.198)<.012;
        const pips=u>.255&&u<.35&&Math.abs(v+.198)<.012;
        value=title?.69:pips?.42:.19;
      }

      const left=-.326,top=-.151;
      const cellW=.131,cellH=.102;
      const gridX=(u-left)/cellW,gridY=(v-top)/cellH;
      const col=Math.floor(gridX),row=Math.floor(gridY);

      if(col>=0&&col<5&&row>=0&&row<3){
        const localX=fr(gridX)-.5,localY=fr(gridY)-.5;
        const px=Math.floor((localX+.5)*8);
        const py=Math.floor((localY+.5)*8);
        const border=Math.max(Math.abs(localX),Math.abs(localY))>.43;
        const type=(col+row*2)%3;
        let icon=false;

        // Original 8-by-8 sprites: key, potion, and ring.
        if(type===0){
          const bow=((px===1||px===2)&&(py>=2&&py<=4))||((py===2||py===4)&&px>=1&&px<=2);
          const shaft=py===3&&px>=3&&px<=6;
          const teeth=(px===5&&py===4)||(px===6&&py===4);
          icon=bow||shaft||teeth;
        }else if(type===1){
          const neck=(px===3||px===4)&&(py===1||py===2);
          const lip=py===2&&px>=2&&px<=5;
          const bottle=py>=3&&py<=6&&Math.abs(px-3.5)+Math.abs(py-4.5)<=3.15;
          icon=neck||lip||bottle;
        }else{
          const dx=px-3.5,dy=py-3.5;
          const radius=Math.hypot(dx,dy);
          icon=radius>1.55&&radius<2.7||((px===5||px===6)&&py===1);
        }

        // Offset the discrete selection change by half a step, so the six-second
        // boundary lands within a stable cell instead of jumping from left to right.
        const step=Math.floor(fr(loop+1/24)*12);
        const selected=(row===0&&col===step)||(col===4&&row===step-4)||(row===2&&col===10-step)||(col===0&&row===12-step);
        const selection=selected&&border;
        const selectionGlow=selected&&Math.max(Math.abs(localX),Math.abs(localY))>.405;
        const idleGlow=.56+.12*Math.sin(loop*6.2831853+col*1.7+row*.8);

        if(selection)value=1;
        else if(selectionGlow)value=.62;
        else if(border)value=.24;
        else if(icon)value=idleGlow;
        else value=(.13+noise)*scan;
      }

      // Bottom key prompts and a persistent horizontal scanline complete the interface.
      if(v>.176&&Math.abs(u)<.34){
        const prompt=fr((u+.34)*12);
        if(prompt<.13||prompt>.86)value=.38;
      }
      // A periodic scanline crosses the glass without teleporting at the loop join.
      const brightLine=Math.pow(.5+.5*Math.cos((v/.448-loop)*6.2831853),90);
      value+=brightLine*.11;
    }

    const corner=Math.max(Math.abs(u)/.445,Math.abs(v)/.262);
    const casing=cl((corner-.86)*7,0,1);
    return cl(value*(1-casing)+.055*casing);
  }
};
