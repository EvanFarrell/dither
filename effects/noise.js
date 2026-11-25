// Fast math & procedural noise helpers shared across effects
export const cl=(x,a=0,b=1)=>x<a?a:x>b?b:x;
export const sm=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t)};
export const fr=x=>x-Math.floor(x);

export function h2(ix,iy){
  let n=Math.imul(ix|0,374761393)+Math.imul(iy|0,668265263);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)*2.3283064365386963e-10;
}

export function vn(x,y){
  const ix=Math.floor(x),iy=Math.floor(y);
  let fx=x-ix,fy=y-iy;
  fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
  const a=h2(ix,iy),b=h2(ix+1,iy),c=h2(ix,iy+1),e=h2(ix+1,iy+1);
  return a+(b-a)*fx+(c-a)*fy+(a-b-c+e)*fx*fy;
}

export function fbm(x,y){
  return vn(x,y)*.56+vn(x*2.03+17.1,y*2.01-9.4)*.29+vn(x*4.07-5.3,y*4.05+13.7)*.15;
}

export function rdg(x,y){
  const a=1-Math.abs(vn(x,y)*2-1),b=1-Math.abs(vn(x*2.11+7.3,y*2.09-4.1)*2-1);
  return a*a*.66+b*b*.34;
}
