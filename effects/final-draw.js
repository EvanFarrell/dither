// A midnight card arena. Every moving term is a 6-second sine/cosine cycle so
// the scene can be recorded as a seamless loop.
export const finalDraw={
  name:'final-draw',
  label:'Final Draw',
  cat:'trading cards',
  pal:10,
  fn:(u,v,t)=>{
    const tau=Math.PI*2;
    // The card reaches the middle at 2.5 seconds, which keeps the sidebar
    // thumbnail readable while still giving the scene a decisive entrance.
    const phase=tau*(t-2.5)/6;
    const cardX=.38*Math.sin(phase);
    const arrival=Math.exp(-Math.abs(cardX)*11);
    const arenaR=Math.hypot(u*1.02,v*1.45);
    const pulse=.5+.5*Math.sin(phase);
    const blackout=.48*arrival;

    // Dark tabletop, a receding neon arena ring, and small moving motes.
    let value=.055+.065*Math.exp(-arenaR*3.5);
    const ring=Math.abs(arenaR-.285)<.085?Math.exp(-Math.abs(arenaR-.285)*65):0;
    const innerRing=Math.abs(arenaR-.19)<.055?Math.exp(-Math.abs(arenaR-.19)*110):0;
    value+=ring*(.18+.20*pulse)+innerRing*.12;
    const gridY=v>.04?Math.sin((v-.04)*65/(v+.16)+phase):0;
    const floor= v>.035 ? Math.exp(-Math.abs(gridY)*20)*(.07+.08*(v+.45)) : 0;
    value+=floor*Math.exp(-Math.abs(u)*1.4);
    // Small inverse-square sparks read as motes without performing a blurred
    // radial exponential for every pixel in the image.
    for(let k=0;k<5;k++){
      const a=k*2.4+phase;
      const r=.22+.045*Math.sin(phase*2+k*1.9);
      const px=Math.cos(a)*r,py=Math.sin(a)*r*.62;
      const mx=u-px,my=v-py,d2=mx*mx+my*my;
      if(d2<.012)value+=Math.min(.25,.0018/(d2+.0007))*(.12+.16*arrival);
    }
    value*=1-blackout;

    // Five sleeved cards on each side form the opposing hands. Their changing
    // edge light makes the two rows feel like a standoff rather than a grid.
    for(let row=0;row<2;row++){
      for(let i=0;i<5;i++){
        const cx=(i-2)*.145+(row?-.012:.012);
        const cy=row ? .275+Math.abs(i-2)*.012 : -.275-Math.abs(i-2)*.012;
        const hw=.052,hh=.086;
        const dx=u-cx,dy=v-cy;
        const ax=Math.abs(dx),ay=Math.abs(dy);
        if(ax<hw+.055&&ay<hh+.055){
          const glow=Math.exp(-Math.max(ax-hw,0)*58-Math.max(ay-hh,0)*58);
          const stagger=.5+.5*Math.sin(phase+i*1.7+row*2.8);
          value=Math.max(value,.08+glow*(.13+.13*stagger));
          if(ax<hw&&ay<hh){
            const border=ax>hw-.008||ay>hh-.008;
            const title=ay>hh-.025&&ay<hh-.016;
            const art=Math.exp(-((dx/(hw*.55))**2+((dy+(row?-.005:.005))/(hh*.36))**2)*3.6);
            const sleeve=.20+.075*Math.sin(dx*88+dy*52+i*2.3);
            value=border ? .58+.22*stagger : title ? .72 : sleeve+art*.24;
          }
        }
      }
    }

    // The drawn card glides from player to player and subtly yaws into place.
    const yaw=.12*Math.sin(phase);
    const cs=Math.cos(yaw),sn=Math.sin(yaw);
    const rawX=u-cardX,rawY=v+.005*Math.cos(phase);
    const x=rawX*cs+rawY*sn,y=-rawX*sn+rawY*cs;
    const hw=.102+arrival*.027,hh=.157+arrival*.033;
    const ax=Math.abs(x),ay=Math.abs(y);
    if(ax<hw+.11&&ay<hh+.11){
      const outerGlow=Math.exp(-Math.max(ax-hw,0)*34-Math.max(ay-hh,0)*34);
      value=Math.max(value,.10+outerGlow*(.22+.36*arrival));
    }
    if(ax<hw&&ay<hh){
      const border=ax>hw-.010||ay>hh-.010;
      const title=ay>hh-.031&&ay<hh-.019;
      const rules=ay>hh*.54&&ay<hh-.040&&Math.abs(x)<hw*.72&&Math.sin((y+hh)*180)>-.15;
      const orb=Math.exp(-((x/(hw*.56))**2+((y+.018)/(hh*.45))**2)*3.1);
      // A diagonal foil band crosses only at the card's dramatic midpoint.
      const sweep=Math.exp(-Math.abs(x*1.35-y*.72-.18*Math.sin(phase))*48);
      const foil=sweep*(.30+.70*arrival);
      const texture=.26+.075*Math.sin(x*94-y*57+phase*2);
      value=border ? .72+.26*arrival : title ? .88 : rules ? .66 : texture+orb*.20+foil*.58;
    }

    // The corners close in as the foil catches, then reopen before the next draw.
    const vignette=Math.max(0,(arenaR-.42)*1.8);
    return Math.max(0,Math.min(.999,value*(1-vignette*.55)));
  }
};
