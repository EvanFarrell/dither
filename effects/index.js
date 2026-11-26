import {classic} from './classic.js';
import {skies} from './skies.js';
import {planets} from './planets.js';
import {space} from './space.js';
import {dreamcore} from './dreamcore.js';
import {impossible} from './impossible.js';
import {holoVault} from './holo-vault.js';
import {foilSwamp} from './foil-swamp.js';
import {boosterBreak} from './booster-break.js';
import {manaTable} from './mana-table.js';
import {finalDraw} from './final-draw.js';
import {savePoint} from './save-point.js';
import {arcadeAfterHours} from './arcade-after-hours.js';
import {bossDoor} from './boss-door.js';
import {crtInventory} from './crt-inventory.js';
import {dock07} from './dock-07.js';
import {conveyorMerge} from './conveyor-merge.js';
import {pickToLight} from './pick-to-light.js';
import {labelRun} from './label-run.js';
import {highBay} from './high-bay.js';
import {nightShift} from './night-shift.js';
import {sealedStock} from './sealed-stock.js';
import {packout} from './packout.js';
import {emeraldRing} from './emerald-ring.js';
import {worldship} from './worldship.js';
import {dysonSphere} from './dyson-sphere.js';
import {eclipseConvoy} from './eclipse-convoy.js';

const loopingScenes=[
  holoVault, foilSwamp, boosterBreak, manaTable, finalDraw,
  savePoint, arcadeAfterHours, bossDoor, crtInventory,
  dock07, conveyorMerge, pickToLight, labelRun,
  highBay, nightShift, sealedStock, packout,
  emeraldRing, worldship, dysonSphere, eclipseConvoy
];

export const FX=[
  ...classic,
  ...skies,
  ...planets,
  ...space,
  ...dreamcore,
  ...impossible,
  ...loopingScenes.map(scene=>({loopSeconds:6,...scene}))
];
