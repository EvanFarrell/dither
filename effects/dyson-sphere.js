import {cl,fr,h2,sm} from './noise.js';

const TAU=Math.PI*2;

// An incomplete stellar shell. The aperture is deliberately offset, so the
// lattice reads as a colossal constructed surface instead of a planetary ring.
export const dysonSphere={
  name:'dyson-sphere',
  label:'Dyson Sphere',
  cat:'epic',
  pal:2,
  fn:(u,v,t)=>{
    const phase=t*TAU/6;
    const sunX=-.115,sunY=-.018;
    const sunDistance=Math.hypot((u-sunX)*1.03,(v-sunY)*1.17);
    const corona=Math.max(0,1-sunDistance/.305);
    const core=Math.max(0,1-sunDistance/.135);
    const flare=.5+.5*Math.sin(Math.atan2(v-sunY,u-sunX)*9-phase*2+sunDistance*42);

    // A sparse, deterministic star field and low-level dust establish the void.
    const cellX=Math.floor((u+.54)*92),cellY=Math.floor((v+.42)*88);
    const seed=h2(cellX,cellY);
    const twinkle=.56+.44*Math.sin(phase*2+seed*TAU);
    const star=seed>.986?(seed-.986)*52*twinkle:0;
    let value=.015+star*.38+corona*corona*(.065+.075*flare)+core*.84;

    // The shell is centered on the exposed star. Large static gaps and a
    // strongly segmented outer contour establish it as incomplete engineering,
    // while the black exterior keeps its silhouette enormous at thumbnail size.
    const shellU=(u-sunX)*1.03,shellV=(v-sunY)*1.17;
    const shellRadius=Math.hypot(shellU,shellV);
    const angle=Math.atan2(shellV,shellU);
    const innerEdge=sm(.205,.235,shellRadius);
    const outerEdge=sm(.91,.76,shellRadius);
    const eastAssembly=sm(-.14,.22,Math.cos(angle-.22));
    const lowerAssembly=sm(.16,.48,Math.cos(angle-1.76));
    const upperAssembly=sm(.30,.58,Math.cos(angle+1.37));
    const assembly=Math.max(eastAssembly,lowerAssembly,upperAssembly);
    const missingWedge=sm(.77,.96,Math.cos(angle+2.48));
    const shell=innerEdge*outerEdge*assembly*(1-missingWedge);

    if(shell>.002){
      // Curved rows and splayed meridians build panels that follow the shell.
      const row=fr((shellRadius-.20)*14.2+.075*Math.sin(angle*3));
      const column=fr((angle+Math.PI)*17/TAU+shellRadius*.34);
      const rowRib=Math.max(0,1-Math.min(row,1-row)*25);
      const columnRib=Math.max(0,1-Math.min(column,1-column)*31);
      const heavyMeridian=Math.pow(Math.max(0,Math.cos(angle*5+.32)),18);
      const sectorId=Math.floor((angle+Math.PI)*17/TAU);
      const rowId=Math.floor((shellRadius-.20)*14.2+.075*Math.sin(angle*3));
      const cellSeed=h2(sectorId,rowId);
      const missingPanel=cellSeed>.935?1:0;
      const panelShade=.14+.10*(.5+.5*Math.sin(angle*4-shellRadius*12));
      const sunward=Math.max(0,1-sunDistance/.78);
      const outerRim=Math.max(0,1-Math.abs(shellRadius-.835)/.052);
      const innerRim=Math.max(0,1-Math.abs(shellRadius-.222)/.040);
      // A broad travelling charge crosses entire banks of panels, so the loop
      // has visible life beyond the small service lights.
      const charge=.5+.5*Math.sin(angle*3+shellRadius*17-phase*2);
      const service=Math.pow(Math.max(0,Math.sin(angle*7-shellRadius*22-phase*3+.7)),18);
      const foreArc=sm(.10,.44,Math.cos(angle-1.56));
      const occludingRib=Math.max(0,1-Math.abs(shellRadius-.54)/.029)*foreArc;

      let lattice=panelShade+Math.max(rowRib,columnRib)*.17+heavyMeridian*.19;
      lattice+=sunward*.12+outerRim*.30+innerRim*(.25+.38*corona);
      lattice+=charge*.075+service*(.28+.22*sunward);
      lattice*=1-missingPanel*.78;
      // The near lower arc overlaps its panels with a deep structural band,
      // producing a clear layer of depth in front of the stellar aperture.
      lattice=lattice*(1-occludingRib*.68)+occludingRib*.18;
      value=Math.max(value,lattice*shell);
    }

    // The star projects a bright engineered rim into the opening. It is a
    // non-uniform circular boundary, not a planetary ring.
    const apertureRim=Math.exp(-Math.abs(shellRadius-.222)*34)*assembly*(1-missingWedge);
    value+=apertureRim*corona*(.20+.14*(.5+.5*Math.sin(phase)));
    const vignette=Math.max(.22,1-(u*u*.70+v*v*1.18)*.54);
    return cl(value*vignette);
  }
};
