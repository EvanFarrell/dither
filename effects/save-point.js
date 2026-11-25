import {cl,fr,sm} from './noise.js';

const core=.028;
const sideTip=.122;
const verticalTip=.130;
const crystalVertices=[
  [-core,-core,-core],[core,-core,-core],[core,core,-core],[-core,core,-core],
  [-core,-core,core],[core,-core,core],[core,core,core],[-core,core,core],
  [0,-verticalTip,0],[0,verticalTip,0],[sideTip,0,0],[-sideTip,0,0],
  [0,0,sideTip],[0,0,-sideTip]
];
// Each spike joins one face of the recessed core, leaving notches between tips.
const crystalTriangles=[
  [8,0,1,5,4],[9,7,6,2,3],[10,5,1,2,6],
  [11,0,4,7,3],[12,4,5,6,7],[13,1,0,3,2]
].flatMap(([tip,...corners])=>corners.map((corner,i)=>[tip,corner,corners[(i+1)%4]]));
let crystalPose;
const crystalY=-.103;
// Canvas y increases downward, so negative pitch gives a view from above.
const viewPitch=-.22;
const cosPitch=Math.cos(viewPitch),sinPitch=Math.sin(viewPitch);

function projectCrystal(phase){
  if(crystalPose?.phase===phase)return crystalPose;

  // A quarter turn brings the fourfold crystal back to the same silhouette.
  const yaw=phase*.25+.46;
  const cosYaw=Math.cos(yaw),sinYaw=Math.sin(yaw);
  const vertices=crystalVertices.map(([x,y,z])=>{
    const rotatedZ=z*cosYaw-x*sinYaw;
    return [x*cosYaw+z*sinYaw,y*cosPitch-rotatedZ*sinPitch,y*sinPitch+rotatedZ*cosPitch];
  });

  const faces=[];
  for(const [a,b,c] of crystalTriangles){
    const [ax,ay,az]=vertices[a], [bx,by,bz]=vertices[b], [cx,cy,cz]=vertices[c];
    const abx=bx-ax,aby=by-ay,abz=bz-az;
    const acx=cx-ax,acy=cy-ay,acz=cz-az;
    const nx=aby*acz-abz*acy,ny=abz*acx-abx*acz,nz=abx*acy-aby*acx;
    if(nz<=1e-8)continue;

    const normalLength=Math.hypot(nx,ny,nz);
    const light=cl((-.54*nx-.67*ny+.51*nz)/normalLength);
    faces.push({ax,ay,az,abx,aby,abz,acx,acy,acz,invArea:1/nz,light});
  }
  crystalPose={phase,faces,glint:.50+.11*Math.sin(phase-.8)};
  return crystalPose;
}

function crystalFacet(x,y,pose){
  let nearest=-Infinity;
  let value=-1;
  for(const {ax,ay,az,abx,aby,abz,acx,acy,acz,invArea,light} of pose.faces){
    const dx=x-ax,dy=y-ay;
    const b=(dx*acy-dy*acx)*invArea;
    const c=(abx*dy-aby*dx)*invArea;
    const a=1-b-c;
    const edge=Math.min(a,b,c);
    if(edge<0)continue;

    // The front spikes can overlap the side facets in projection.
    const depth=az+b*abz+c*acz;
    if(depth<=nearest)continue;
    nearest=depth;

    const bevel=1-sm(.015,.075,edge);
    const reflection=1-sm(.012,.12,Math.abs(b+c*.53-pose.glint));
    value=.29+.51*light+.205*bevel*(.36+.64*light)+.095*reflection;
  }
  return value;
}

// A six-second, seamless dungeon shrine. The pulse starts at the crystal,
// climbs the walls, and returns to its resting blue glow at the loop point.
export const savePoint={
  name:'save-point',label:'Save Point',cat:'gaming',pal:12,
  fn:(u,v,t)=>{
    const phase=fr(t/6)*Math.PI*2;
    const cy=v-crystalY;
    const distance=Math.hypot(u*.92,cy*1.12);
    const crystalGlow=Math.exp(-distance*12);
    const outerGlow=Math.exp(-distance*6.2);
    const wave=.5+.5*Math.cos(phase-(Math.abs(u)*10+Math.max(0,.05-v)*13));

    let value=.055;
    if(v<.065){
      // Cold stone blocks, with the save pulse climbing away from the altar.
      const row=Math.floor((v+.30)*13);
      const stagger=(row&1)*.5;
      const brickX=Math.abs(fr((u+.5)*10+stagger)-.5);
      const brickY=Math.abs(fr((v+.30)*13)-.5);
      const mortar=sm(.47,.42,Math.max(brickX,brickY));
      const stone=.13+.075*Math.sin((u*9+row*.91))*Math.sin(v*43-row*.37);
      const runeBand=Math.exp(-Math.abs(v+.115)*32)*(.5+.5*Math.sin(u*47-phase*3));
      value=stone*(.46+.54*mortar)+crystalGlow*.17+wave*(.10+.14*runeBand);
    }else{
      // Perspective flagstones flow toward the pedestal.
      const depth=.23/(v-.025);
      const floorX=u*depth*2.5;
      const floorZ=depth*1.55;
      const joint=Math.min(Math.abs(fr(floorX+.5)-.5),Math.abs(fr(floorZ+.5)-.5));
      const grout=sm(.025,.075,joint);
      const tile=.105+.11*grout+.04*Math.sin(floorZ*2.3);
      const floorPulse=Math.exp(-Math.abs(Math.hypot(u,v-.167)-(.055+.25*(.5+.5*Math.cos(phase))))*34);
      value=tile+floorPulse*.16+crystalGlow*.13;
    }

    // The soft shadow anchors the crystal above the center of the dais.
    const daisR=Math.hypot(u/.218,(v-.166)/.048);
    const stepR=Math.hypot(u/.226,(v-.180)/.051);
    if(stepR<1)value=.18+.17*(1-stepR)+.15*Math.max(0,1-Math.abs(stepR-.9)*13);
    if(daisR<1){
      const ring=Math.exp(-Math.abs(daisR-.79)*30);
      const lip=Math.exp(-Math.abs(daisR-.95)*37);
      const shadow=Math.exp(-((u/.074)**2+((v-.168)/.017)**2)*1.6);
      const pool=Math.exp(-Math.hypot(u*3,(v-.166)*11)*3);
      value=.255+.23*pool+ring*(.30+.075*Math.cos(phase))+.11*lip-shadow*.22;
    }

    value+=crystalGlow*(.15+.03*Math.cos(phase))+outerGlow*.075;
    if(Math.abs(u)<=sideTip&&Math.abs(cy)<=verticalTip){
      const facet=crystalFacet(u,cy,projectCrystal(phase));
      if(facet>=0)value=facet+crystalGlow*.145+outerGlow*.023;
    }

    // Light motes orbit at different heights in the gap above the pedestal.
    const moteX=.087*Math.cos(phase);
    const moteY=.070+.013*Math.sin(phase);
    const mote=Math.hypot(u-moteX,v-moteY);
    if(mote<.011)value=Math.max(value,.70*(1-mote/.011));
    const vignette=1-Math.hypot(u*1.05,v*1.55)*.48;
    return cl(value*vignette);
  }
};
