import {cl,fr,h2,sm,vn} from './noise.js';

const TAU=Math.PI*2;
const ringWidth=.69;
const ringTilt=.27;
const ringHeight=.087;
const sectors=144;

function stars(u,v,phase){
  const x=u*128,y=v*128;
  const cellX=Math.floor(x),cellY=Math.floor(y);
  const seed=h2(cellX,cellY);
  if(seed<.925)return 0;

  const dx=Math.abs(fr(x)-(.22+.56*h2(cellX+19,cellY-71)));
  const dy=Math.abs(fr(y)-(.22+.56*h2(cellX-97,cellY+32)));
  const size=.15+.07*(seed>.986);
  const point=1-sm(size*.2,size,Math.max(dx,dy));
  return point*(.32+.28*Math.sin(phase+seed*90)+.4*(seed>.986));
}

// The cropped annulus puts the near edge in the foreground and keeps dark
// space on the left. Logarithmic spacing makes the point rows recede in depth.
export const emeraldRing={
  name:'emerald-ring',label:'Emerald Ring',cat:'epic',pal:15,
  fn:(u,v,t)=>{
    const phase=fr(t/6)*TAU;
    const tilt=ringTilt+.010*Math.sin(phase);
    const cs=Math.cos(tilt),sn=Math.sin(tilt);
    const x=u-.714+.006*Math.sin(phase+.3);
    const y=v+.012-.006*Math.cos(phase);
    const major=(x*cs+y*sn)/ringWidth;
    const minor=(y*cs-x*sn)/ringHeight;
    const radius=Math.hypot(major,minor);
    const angle=Math.atan2(minor,major);
    const near=sm(-.14,.80,minor);
    const mist=vn(u*6.4-v*3.4,v*9+u*2.2);
    const background=.013+.029*mist+stars(u,v,phase);

    const breadth=1-sm(1.10,4.85,radius);
    const fade=sm(-.42,-.02,u+v*.37);
    const rimDistance=Math.abs(radius-1);
    const corona=Math.exp(-rimDistance*11);
    const rim=Math.exp(-rimDistance*97);
    // Several diagonally warped sweeps are visible through the mesh, leaving
    // softer cloudy trails between knots of light.
    const surface=sm(.985,1.012,radius)*breadth*fade;
    let value=background*(1-.5*surface)+corona*(.11+.10*near)+rim*(.37+.26*near);
    if(surface>.001){
      const logRadius=Math.log(radius);
      const flow=.5+.5*Math.sin(angle*5-radius*5.8+phase);
      const ripple=vn(major*5.3+minor*.9,minor*4.8+.22*Math.sin(phase));
      const whirl=.5+.5*Math.sin(angle*7-6.6*logRadius+ripple*3.8-phase);
      const row=logRadius*22+.23*Math.sin(angle*11-radius*4+phase*2);
      const rowIndex=Math.floor(row);
      const offset=.27*h2(rowIndex,29);
      const column=angle*sectors/TAU+.28*Math.sin(radius*5.3+angle*8+phase)+.20*ripple+offset;
      const across=Math.abs(fr(column)-.5);
      const along=Math.abs(fr(row)-.5);
      const spot=1-sm(.12,.36,Math.max(across*.92,along));
      const cellX=(Math.floor(column)%sectors+sectors)%sectors;
      const shimmer=h2(cellX,rowIndex);
      const shimmerPulse=.5+.5*Math.sin(phase+shimmer*42);
      const grain=.20+.43*ripple+.37*whirl;
      const glints=sm(.80,.99,shimmer)*(.53+.47*shimmerPulse);
      value+=surface*(.069+.114*grain+spot*(.14+.45*grain)+glints*(.12+.32*spot));
      value+=surface*.14*corona*flow;
    }

    // A second projected ellipse gives the back edge a visible inner wall.
    const innerBack=sm(1.006,.987,radius)*sm(.10,-.27,minor);
    if(innerBack>0){
      const wallDepth=.031;
      const wallMajor=major-wallDepth*sn/ringWidth;
      const wallMinor=minor-wallDepth*cs/ringHeight;
      const floorRadius=Math.hypot(wallMajor,wallMinor);
      const wall=innerBack*sm(.992,1.012,floorRadius);
      const ridge=1-sm(.055,.32,Math.abs(fr(v*155+u*14)-.5));
      const seams=1-sm(.08,.31,Math.abs(fr(angle*89/TAU+v*22)-.5));
      value+=innerBack*Math.exp(-Math.abs(floorRadius-1)*105)*.32+wall*(.039+.17*ridge*seams);
    }

    return cl(value);
  }
};
