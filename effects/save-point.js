import {cl,fr,h2,sm,vn} from './noise.js';

function roundRim(points){
  const rows=[points[0]];
  for(let i=1;i<points.length-1;i++){
    const [beforeY,beforeSpan]=points[i-1];
    const [y,span]=points[i];
    const [afterY,afterSpan]=points[i+1];
    const steps=span>beforeSpan&&span>afterSpan?14:6;
    // Midpoints on each side share a tangent with the neighboring segment.
    for(let step=0;step<steps;step++){
      const t=step/steps;
      const before=.5*(1-t)**2,after=.5*t*t;
      const center=1-before-after;
      rows.push([beforeY*before+y*center+afterY*after,beforeSpan*before+span*center+afterSpan*after]);
    }
  }
  const [lastY,lastSpan]=points.at(-1);
  const [prevY,prevSpan]=points.at(-2);
  rows.push([(prevY+lastY)*.5,(prevSpan+lastSpan)*.5],points.at(-1));
  return rows;
}

// Widths sampled along the supplied mark, measured outward from the split.
const logoOutline=[
  [54,0],[79,.5],[101,2.5],[123,5.5],[145,11.5],[167,19],
  [189,29.5],[211,43.5],[222,53.5],[233,64],
  ...roundRim([[244,80.5],[252,110],[260,124],[268,116],[274,75],[280,33]]),
  [288,18.5],[299,6.5],[311,.5],[316,0]
];
const logoScale=.00094;
const logoGap=10*logoScale;
const arcSegments=18;
const bevelSegments=6;
const ringSize=arcSegments+1+2*bevelSegments;
const loopSeconds=18;
const weatherCycles=3;
let logoPose;
// Canvas y increases downward, so negative pitch gives a view from above.
const viewPitch=-.22;
const cosPitch=Math.cos(viewPitch),sinPitch=Math.sin(viewPitch);

function smoothNormals(vertices,triangles){
  const normals=vertices.map(()=>[0,0,0]);
  for(const [a,b,c] of triangles){
    const [ax,ay,az]=vertices[a], [bx,by,bz]=vertices[b], [cx,cy,cz]=vertices[c];
    const abx=bx-ax,aby=by-ay,abz=bz-az;
    const acx=cx-ax,acy=cy-ay,acz=cz-az;
    const nx=aby*acz-abz*acy,ny=abz*acx-abx*acz,nz=abx*acy-aby*acx;
    for(const index of [a,b,c]){
      normals[index][0]+=nx;
      normals[index][1]+=ny;
      normals[index][2]+=nz;
    }
  }
  return normals.map(([x,y,z])=>{
    const length=Math.hypot(x,y,z)||1;
    return [x/length,y/length,z/length];
  });
}

function buildLogo(){
  const vertices=[],triangles=[];
  for(const side of [-1,1]){
    const start=vertices.length;
    for(const [row,span] of logoOutline){
      const y=(row-185)*logoScale;
      const width=span*logoScale;
      const radius=logoGap+width;
      const arc=Math.acos(logoGap/radius);
      const roundedDepth=radius*Math.sin(arc);
      const flatDepth=.017*sm(0,.027,width);
      // Blend the front-to-back depth of the flat extrusion and the turned form.
      const depthScale=roundedDepth>0?(roundedDepth+flatDepth)/(2*roundedDepth):0;
      const depth=roundedDepth*depthScale;
      const shellArc=arc-Math.min(.14,arc*.39);
      const shellX=radius*Math.cos(shellArc);
      const shellZ=radius*Math.sin(shellArc)*depthScale;
      const cutZ=depth-Math.min(.011,depth*.34);

      // A rounded transition joins the flat cut to the curved shell on both edges.
      const corner=[];
      for(let i=0;i<bevelSegments;i++){
        const t=i/bevelSegments;
        const s=1-t;
        const x=logoGap+(shellX-logoGap)*t*t;
        const z=s*s*cutZ+2*s*t*depth+t*t*shellZ;
        corner.push([x,z]);
        vertices.push([x*side,y,z*side]);
      }
      for(let i=0;i<=arcSegments;i++){
        const angle=shellArc*(1-2*i/arcSegments);
        vertices.push([radius*Math.cos(angle)*side,y,radius*Math.sin(angle)*depthScale*side]);
      }
      for(let i=corner.length-1;i>=0;i--){
        const [x,z]=corner[i];
        vertices.push([x*side,y,-z*side]);
      }
    }

    for(let row=0;row<logoOutline.length-1;row++){
      const upper=start+row*ringSize;
      const lower=upper+ringSize;
      for(let i=0;i<ringSize;i++){
        const next=(i+1)%ringSize;
        const a=upper+i,b=upper+next,c=lower+next,d=lower+i;
        const distanceFromCut=Math.min(i+.5,ringSize-1-(i+.5));
        const cut=next===0?1:1-cl(distanceFromCut/bevelSegments);
        triangles.push([a,b,c,cut],[a,c,d,cut]);
      }
    }
  }
  return {vertices,triangles,normals:smoothNormals(vertices,triangles)};
}

const logo=buildLogo();
const bandCount=32;
const bandHeight=.29;
const bandIndex=y=>cl(Math.floor((y/bandHeight+.5)*bandCount),0,bandCount-1);

function projectLogo(phase){
  if(logoPose?.phase===phase)return logoPose;

  // The two halves match after a half turn, so the loop closes before a full revolution.
  const yaw=phase*.5;
  const cosYaw=Math.cos(yaw),sinYaw=Math.sin(yaw);
  const toView=([x,y,z])=>{
    const rotatedZ=z*cosYaw-x*sinYaw;
    return [x*cosYaw+z*sinYaw,y*cosPitch-rotatedZ*sinPitch,y*sinPitch+rotatedZ*cosPitch];
  };
  const vertices=logo.vertices.map(toView);
  const lights=logo.normals.map(normal=>{
    const [nx,ny,nz]=toView(normal);
    const key=cl(.55*nx-.46*ny+.66*nz);
    const bounce=cl(.86*ny+.36*nz);
    const rim=1-cl(nz);
    const sheen=cl(.295*nx-.247*ny+.919*nz)**11;
    const shell=.27+.48*key+.19*bounce+.08*rim+.12*sheen;
    const interior=.21+.30*key+.14*bounce+.04*rim;
    return {shell,cutShade:interior-shell};
  });

  const bands=Array.from({length:bandCount},()=>[]);
  for(const [a,b,c,cut] of logo.triangles){
    const [ax,ay,az]=vertices[a], [bx,by,bz]=vertices[b], [cx,cy,cz]=vertices[c];
    const abx=bx-ax,aby=by-ay,abz=bz-az;
    const acx=cx-ax,acy=cy-ay,acz=cz-az;
    const area=abx*acy-aby*acx;
    if(area<=1e-8)continue;

    const left=Math.min(ax,bx,cx),right=Math.max(ax,bx,cx);
    const top=Math.min(ay,by,cy),bottom=Math.max(ay,by,cy);
    const value=lights[a].shell+lights[a].cutShade*cut;
    const shadeB=lights[b].shell+lights[b].cutShade*cut-value;
    const shadeC=lights[c].shell+lights[c].cutShade*cut-value;
    const face={ax,ay,az,abx,aby,abz,acx,acy,acz,invArea:1/area,left,right,top,bottom,value,shadeB,shadeC};
    for(let band=bandIndex(top);band<=bandIndex(bottom);band++)bands[band].push(face);
  }
  logoPose={phase,bands,glint:.034*Math.sin(phase*weatherCycles-.8)};
  return logoPose;
}

function logoFacet(x,y,pose){
  let nearest=-Infinity;
  let value=-1;
  for(const face of pose.bands[bandIndex(y)]){
    if(x<face.left||x>face.right||y<face.top||y>face.bottom)continue;
    const {ax,ay,az,abx,aby,abz,acx,acy,acz,invArea}=face;
    const dx=x-ax,dy=y-ay;
    const b=(dx*acy-dy*acx)*invArea;
    const c=(abx*dy-aby*dx)*invArea;
    if(b<0||c<0||b+c>1)continue;

    const depth=az+b*abz+c*acz;
    if(depth<=nearest)continue;
    nearest=depth;
    value=face.value+b*face.shadeB+c*face.shadeC;
  }
  if(value>=0)value+=.11*Math.exp(-Math.abs(x*.72+y*.66-pose.glint)*42);
  return value;
}

const moonX=-.078,moonY=-.043,moonScale=.64;
const planetX=.050,planetY=.006,planetRadius=.235;
const frameOffsetX=.16;

function planetaryBackdrop(u,v,phase){
  const dx=u-planetX,dy=v-planetY;
  const distance=Math.hypot(dx,dy);
  const nx=dx/planetRadius,ny=dy/planetRadius;
  const rimLight=cl(.68*nx-.54*ny+.32);
  const limbDistance=Math.abs(distance-planetRadius);
  const atmosphere=Math.exp(-limbDistance*112)*(.22+.15*rimLight)
    +Math.exp(-limbDistance*28)*(.025+.071*rimLight);

  if(distance>=planetRadius){
    const star=h2(Math.floor(u*214),Math.floor(v*214));
    const glint=star>.992?((star-.992)/.008)*(.49+.18*Math.sin(phase+star*78)):0;
    return .017+.029*vn(u*6.1-v*.8,v*8.3+u*1.7)+glint+atmosphere;
  }

  // Like Jupiter, the planet gets its shape from bands that bend around a sphere.
  const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
  const latitude=ny*.94+nx*.23+nz*.24;
  const drift=.27*Math.sin(phase);
  const weather=vn(nx*4.2+drift,latitude*10.4);
  const wisps=vn(nx*9.8-drift*.72,latitude*24+weather*1.4);
  const bands=.49+.23*Math.sin(latitude*34+weather*1.9)+.12*Math.sin(latitude*76+wisps*2.8);
  const light=sm(-.20,.73,.69*nx-.57*ny+.46*nz);
  const penumbra=Math.exp(-(((u-moonX+.054)/.058)**2+((v-moonY-.044)/.046)**2));
  return .05+(.20+.39*bands+.06*wisps)*light*(1-.31*penumbra)+atmosphere;
}

// The split crystal turns in the foreground while the planet's clouds drift.
export const savePoint={
  name:'save-point',label:'Save Point',cat:'stash',pal:16,loopSeconds,
  fn:(u,v,t,aspect=9/16)=>{
    const phase=fr(t/loopSeconds)*Math.PI*2;
    // Pull the camera back for wide image canvases so the planet still fits.
    const scale=Math.min(1,aspect/(9/16));
    const sceneU=(u-frameOffsetX)/scale,sceneV=v/scale;
    const x=(sceneU-moonX)/moonScale,y=(sceneV-moonY)/moonScale;
    const glow=Math.exp(-Math.hypot(x*.92,y*1.05)*10);
    if(Math.abs(x)<.138&&Math.abs(y)<.132){
      const facet=logoFacet(x,y,projectLogo(phase));
      if(facet>=0)return cl(facet+glow*.13);
    }
    return cl(planetaryBackdrop(sceneU,sceneV,phase*weatherCycles)+glow*.097);
  }
};
