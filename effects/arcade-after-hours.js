import {cl,fr,sm} from './noise.js';

export const arcadeAfterHours={
  name:'arcade-after-hours',
  label:'Arcade After Hours',
  cat:'gaming',
  pal:10,
  fn:(u,v,t)=>{
    // A six-second camera drift. Every time-dependent term is an integer cycle
    // of this phase so a recorded loop closes on its first frame.
    const phase=t*Math.PI*2/6;
    const sway=.018*Math.sin(phase)+.008*Math.sin(phase*2-.8);
    const horizon=-.075;
    let col=.055+.055*sm(.38,-.30,v);

    // Wet tiled floor, lit only by the rows of idling cabinets.
    if(v>horizon){
      const depth=.16/(v-horizon+.022);
      const floorU=(u+sway)*depth*2.7;
      const floorZ=depth*2.7;
      const tileX=Math.min(fr(floorU),1-fr(floorU));
      const tileZ=Math.min(fr(floorZ),1-fr(floorZ));
      const grout=1-sm(.025,.07,Math.min(tileX,tileZ));
      const checker=(Math.floor(floorU)+Math.floor(floorZ))&1;
      const sheen=.035+.04*(checker?1:0)+.025*Math.sin(floorZ*7+phase);
      const fog=1-Math.exp(-(v-horizon)*6.2);
      col=sheen*(1-fog)+.18*fog+grout*.045;
    }else{
      // A dark back wall with the soft cyan band from the far machines.
      const wallLines=.018*Math.sin((v+.14)*90+phase);
      col+=wallLines+.07*Math.exp(-Math.abs(v-horizon)*18);
    }

    // Cabinets step toward the viewer from the vanishing point on both walls.
    for(let side=-1;side<=1;side+=2){
      for(let k=0;k<6;k++){
        const depth=.48+k*.34;
        const scale=.31/depth;
        const centerX=side*(.105+.14/depth)+sway*(.35+k*.08);
        const cabinetW=.19*scale;
        const cabinetH=.40*scale;
        const baseY=.13+.055*scale;
        const centerY=baseY-cabinetH*.5;
        const localX=Math.abs(u-centerX);
        // Cabinets occupy only narrow screen regions. This bound avoids the
        // shading work for 10–11 empty machines at each pixel.
        if(localX>cabinetW*1.85+.014)continue;

        const localY=v-centerY;
        const inside=localX<cabinetW&&Math.abs(localY)<cabinetH*.5;
        if(inside){
          // Pixel-art hard-edged cabinet trim is cheaper and reads more
          // clearly than the former subpixel exponential outline.
          const trim=localX>cabinetW*.87||Math.abs(localY)>cabinetH*.43;
          const marquee=localY<-.31*cabinetH;
          const controlDeck=localY>.17*cabinetH&&localY<.31*cabinetH;
          const speaker=localY>cabinetH*.18&&Math.sin(localX*340+k*4)>-.2;
          // Bright marquees, dark case panels, and a control-deck band give
          // the nearest machines their unmistakable arcade silhouette.
          col=Math.max(col,.18+(trim?.15:0)+(marquee?.08:0)+(controlDeck?.06:0)+(speaker?.035:0));
          if(localX<cabinetW*.72&&Math.abs(localY+cabinetH*.12)<cabinetH*.18){
            const beat=.5+.5*Math.sin(phase*2+k*1.73+side*.9);
            const beat2=beat*beat;
            const attract=.45+.55*beat2*beat2*beat;
            const scan=.72+.28*Math.sin((localY+cabinetH*.12)*280+phase*3+k);
            const pixels=.18+.12*Math.sin((u-centerX)*150+k*5);
            col=Math.max(col,cl(.36+attract*.36*scan+pixels));
          }
        }

        // Broken neon from each attract screen shimmers in the floor beneath it.
        // Squared linear falloffs preserve the chunky reflected streaks without
        // doing two exponentials for every candidate cabinet.
        const reflectionY=v-baseY;
        if(reflectionY>0&&reflectionY<cabinetH*2.3+.035){
          const rx=1-localX/(cabinetW*1.85+.014);
          const ry=1-reflectionY/(cabinetH*2.3+.035);
          const reflected=rx*rx*ry*ry;
          const beat=.5+.5*Math.sin(phase*2+k*1.73+side*.9);
          const beat2=beat*beat;
          const attract=.45+.55*beat2*beat2*beat;
          const broken=.62+.38*Math.sin(reflectionY*170+k*5+phase*3);
          col=Math.max(col,.07+reflected*attract*broken*.67);
        }
      }
    }

    // The unattended aisle stays dark enough for an added screenshot or card.
    const vignette=Math.max(.26,1-(u*u*1.32+v*v*1.56)*.86);
    return cl(col*vignette);
  }
};
