const TAU = Math.PI * 2;
let cachedTime = NaN;
let frame;

function transform(x, y, angle) {
  return {x, y, cosine: Math.cos(angle), sine: Math.sin(angle)};
}

function setFrame(time) {
  if (time === cachedTime) return;
  cachedTime = time;

  // The open peak is 2.5 seconds, which gives the picker thumbnail a clear fan.
  const phase = TAU * (time - 1) / 6;
  const phaseSine = Math.sin(phase);
  const open = Math.pow(.5 + .5 * phaseSine, 1.7);
  const flash = Math.pow(open, 4) * (.62 + .38 * phaseSine);
  const foilAngle = .035 * open;
  const sparkles = [];

  for (let index = 0; index < 9; index++) {
    const angle = index * TAU / 9 + phase;
    const radius = .19 + .04 * (index % 3) + open * .12;
    sparkles.push({
      x: Math.cos(angle) * radius,
      y: .02 + Math.sin(angle) * radius * .63
    });
  }

  frame = {
    phase,
    open,
    flash,
    cardLeft: transform(-.17 * open, -.045 - .075 * open, -.48 * open),
    cardCenter: transform(0, -.085 * open, 0),
    cardRight: transform(.17 * open, -.045 - .075 * open, .48 * open),
    // The shorter pack stays entirely in a 16:9 field, including its lower crimp.
    packLeft: transform(-.07 * open, .075, -foilAngle),
    packRight: transform(.07 * open, .075, foilAngle),
    sparkles
  };
}

function card(u, v, state, glow) {
  const dx = u - state.x;
  const dy = v - state.y;
  if (Math.abs(dx) > .16 || Math.abs(dy) > .2) return 0;

  const localX = dx * state.cosine + dy * state.sine;
  const localY = -dx * state.sine + dy * state.cosine;
  const distance = Math.max(Math.abs(localX) - .105, Math.abs(localY) - .155);
  if (distance > .018) return 0;

  const border = Math.max(0, 1 - Math.abs(distance) / .014);
  const face = distance < 0 ? .17 + .1 * Math.sin(localX * 52 + localY * 18) : 0;
  const art = distance < -.018 && Math.abs(localY + .018) < .038 && Math.abs(localX) < .072 ? .13 : 0;
  const title = distance < -.018 && Math.abs(localY + .105) < .006 && Math.abs(localX) < .065 ? .28 : 0;
  return Math.max(face, art, title, border * (.5 + glow * .5));
}

function foilHalf(u, v, state, phase) {
  const dx = u - state.x;
  const dy = v - state.y;
  if (Math.abs(dx) > .15 || Math.abs(dy) > .21) return 0;

  const localX = dx * state.cosine + dy * state.sine;
  const localY = -dx * state.sine + dy * state.cosine;
  const distance = Math.max(Math.abs(localX) - .115, Math.abs(localY) - .19);
  if (distance > .02) return 0;

  const edge = Math.max(0, 1 - Math.abs(distance) / .017);
  const foil = distance < 0
    ? .24 + .11 * Math.sin(v * 60 - phase * 2) + .06 * Math.sin(v * 118 + phase * 2) + .09 * Math.sin(localX * 46 + localY * 29)
    : 0;
  const crimp = distance < -.01 && (Math.abs(localY - .158) < .014 || Math.abs(localY + .158) < .014) ? .28 : 0;
  return Math.max(foil, crimp, edge * .66);
}

export const boosterBreak = {
  name: 'booster-break',
  label: 'Booster Break',
  cat: 'trading cards',
  pal: 2,
  fn: (u, v, t) => {
    setFrame(t);

    const horizon = .11 + .09 * Math.max(0, 1 - Math.abs(v + .04) * 2.7);
    const rays = Math.max(0, .035 * Math.sin(u * 18 + v * 9 - frame.phase) + .022 * Math.sin(u * 31 - v * 13 + frame.phase * 2));
    const radial = Math.max(0, .14 - (Math.abs(u) + Math.abs(v + .02) * .72) * .18);
    let value = horizon + rays + radial;

    value = Math.max(value, card(u, v, frame.cardLeft, 0));
    value = Math.max(value, card(u, v, frame.cardCenter, frame.flash));
    value = Math.max(value, card(u, v, frame.cardRight, 0));

    if (Math.abs(u) < .27 && Math.abs(v - .075) < .215) {
      value = Math.max(value, foilHalf(u, v, frame.packLeft, frame.phase));
      value = Math.max(value, foilHalf(u, v, frame.packRight, frame.phase));
    }

    if (Math.abs(u) < .2 && Math.abs(v + .095) < .2) {
      const goldRange = .048 + frame.flash * .15;
      const gold = Math.max(0, 1 - (Math.abs(u) + Math.abs(v + .095)) / goldRange);
      const star = Math.max(0, 1 - Math.abs(u) * 38) * Math.max(0, 1 - Math.abs(v + .095) * 28);
      value = Math.max(value, gold * (.28 + frame.flash * .72), star * frame.flash);
    }

    for (const sparkle of frame.sparkles) {
      const dx = Math.abs(u - sparkle.x);
      const dy = Math.abs(v - sparkle.y);
      if (dx < .011 && dy < .011) {
        value = Math.max(value, (1 - Math.max(dx, dy) / .011) * frame.open * (.42 + frame.flash * .58));
      }
    }

    return value;
  }
};
