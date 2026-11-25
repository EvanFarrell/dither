const TAU = Math.PI * 2;

const clamp = value => value < 0 ? 0 : value > 1 ? 1 : value;
const fract = value => value - Math.floor(value);
const rectangle = (x, y, halfWidth, halfHeight) => Math.max(Math.abs(x) - halfWidth, Math.abs(y) - halfHeight);
const line = (distance, width) => clamp(1 - Math.abs(distance) / width);
const solid = distance => distance <= 0 ? 1 : clamp(1 - distance / .004);

function sprite(x, y, halfWidth, halfHeight, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    x,
    y,
    halfWidth,
    halfHeight,
    cosine,
    sine,
    boundX: halfWidth * Math.abs(cosine) + halfHeight * Math.abs(sine) + .004,
    boundY: halfWidth * Math.abs(sine) + halfHeight * Math.abs(cosine) + .004
  };
}

const CENTER_CARD = sprite(0, .006, .15, .205, .015);
const LEFT_CARD = sprite(-.365, -.09, .075, .116, -.34);
const RIGHT_CARD = sprite(.365, .1, .075, .116, .31);
const TOP_CARD = sprite(.12, -.295, .066, .105, -.08);
const BOTTOM_CARD = sprite(-.11, .3, .066, .104, .1);
const LEFT_DIE = sprite(-.365, .245, .052, .052, -.28);
const RIGHT_DIE = sprite(.345, -.245, .052, .052, .45);

function card(u, v, shape, phase) {
  const x = u - shape.x;
  const y = v - shape.y;
  if (Math.abs(x) > shape.boundX || Math.abs(y) > shape.boundY) return 0;
  const localX = x * shape.cosine + y * shape.sine;
  const localY = y * shape.cosine - x * shape.sine;
  const outer = rectangle(localX, localY, shape.halfWidth, shape.halfHeight);
  if (outer > .004) return 0;
  const cardFace = solid(outer);
  const inner = rectangle(localX, localY, shape.halfWidth - .012, shape.halfHeight - .012);
  const art = rectangle(localX, localY, shape.halfWidth - .035, shape.halfHeight - .048);
  const foil = .5 + .5 * Math.sin(localX * 62 - localY * 21 + phase * 2);
  return cardFace * .13 + line(outer, .012) * .78 + line(inner, .008) * .46 + line(art, .007) * .3 + cardFace * foil * .18;
}

function pip(localX, localY, x, y) {
  return solid(Math.hypot(localX - x, localY - y) - .008);
}

function die(u, v, shape, phase) {
  const x = u - shape.x;
  const y = v - shape.y;
  if (Math.abs(x) > shape.boundX || Math.abs(y) > shape.boundY) return 0;
  const localX = x * shape.cosine + y * shape.sine;
  const localY = y * shape.cosine - x * shape.sine;
  const outer = rectangle(localX, localY, .052, .052);
  if (outer > .004) return 0;
  const body = solid(outer);
  const pips = pip(localX, localY, -.021, -.021) + pip(localX, localY, .021, -.021) + pip(localX, localY, 0, 0) + pip(localX, localY, -.021, .021) + pip(localX, localY, .021, .021);
  const glint = .5 + .5 * Math.sin(phase + localX * 33 + localY * 15);
  return body * (.16 + glint * .1) + line(outer, .011) * .62 + line(rectangle(localX, localY, .043, .043), .01) * .36 + pips * .72;
}

function counterRing(u, v, x, y, radius, width) {
  const localX = u - x;
  const localY = v - y;
  const bound = radius + width;
  if (Math.abs(localX) > bound || Math.abs(localY) > bound) return 0;
  return line(Math.hypot(localX, localY) - radius, width);
}

function counterMark(u, v, phase) {
  const localX = u + .315;
  const localY = v + .035;
  if (Math.abs(localX) > .038 || Math.abs(localY) > .038) return 0;
  const radius = Math.hypot(localX, localY);
  const face = solid(radius - .035);
  if (face === 0) return 0;
  return (.5 + .5 * Math.cos(Math.atan2(localY, localX) * 5 - phase)) * face;
}

function candleLight(u, v, flameWobble, flamePulse) {
  const localX = u + .41;
  const localY = v + .02;
  if (Math.abs(localX) > .15 || Math.abs(localY) > .17) return 0;
  const candle = solid(rectangle(localX, localY, .022, .038));
  const flame = solid(Math.hypot(localX - flameWobble, localY + .06) - .024);
  const halo = clamp(.13 - Math.hypot(localX, localY - .03)) * flamePulse;
  return candle * .42 + flame * .88 + halo * .55;
}

export const manaTable = {
  name: 'mana-table',
  label: 'Mana Table',
  cat: 'trading cards',
  pal: 9,
  fn: (u, v, t) => {
    const phase = (t - Math.floor(t / 6) * 6) * TAU / 6;
    const grain = .5 + .5 * Math.sin(u * 194 + v * 71) * Math.sin(u * 33 - v * 117);
    const tableGlow = .07 + grain * .045 + .025 * Math.sin(u * 24 + v * 19);

    const ringY = v + .006;
    let runicLight = 0;
    const radiusSquared = u * u + ringY * ringY;
    if (radiusSquared > .035 && radiusSquared < .062) {
      const radius = Math.sqrt(radiusSquared);
      const ring = line(radius - .238, .008);
      const innerRing = line(radius - .198, .004);
      let rune = 0;
      if (ring > 0) {
        const runeStep = Math.abs(fract(Math.atan2(ringY, u) * 16 / TAU + phase / TAU) - .5);
        rune = ring * clamp(1 - runeStep * 5) * clamp(1 - Math.abs(radius - .238) * 120);
      }
      const pulse = .45 + .55 * Math.sin(phase * 2 - radius * 30);
      runicLight = (ring * .2 + innerRing * .1 + rune * .34) * pulse;
    }

    const cards = card(u, v, CENTER_CARD, phase) * .8 + card(u, v, LEFT_CARD, phase + 1.5) * .7 + card(u, v, RIGHT_CARD, phase + 3) * .7 + card(u, v, TOP_CARD, phase + 4.5) * .62 + card(u, v, BOTTOM_CARD, phase + 2.2) * .62;
    const accessories = die(u, v, LEFT_DIE, phase) * .72 + die(u, v, RIGHT_DIE, phase + 1.4) * .72 + counterRing(u, v, -.315, -.035, .041, .008) * .5 + counterRing(u, v, .325, .29, .033, .007) * .46 + counterMark(u, v, phase) * .38;
    const candle = candleLight(u, v, .006 * Math.sin(phase * 3), .35 + .65 * Math.sin(phase * 3) ** 2);
    return clamp(tableGlow + runicLight + cards + accessories + candle);
  }
};
