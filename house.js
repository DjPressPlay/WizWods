// ===== HOUSE.JS =====
// Controls HouseStart — the second main object on the map.
// The player builds and protects this each game.

const HouseStart = {
  x: 48.45, // percent — center of playArea
  y: 44,    // percent — moved up from playArea center
  sprite: 'assets/house/HouseStart.png',
};

function renderHouseStart() {
  const wrapperEl = document.getElementById('HouseStart');
  const imgEl = document.getElementById('HouseStart-img');
  if (!wrapperEl || !imgEl) return;

  imgEl.src = HouseStart.sprite;
  wrapperEl.style.left = HouseStart.x + '%';
  wrapperEl.style.top = HouseStart.y + '%';
}

renderHouseStart();

// Scales the collision box relative to the rendered sprite size.
// 1.0 = matches the sprite exactly. <1 shrinks the box, >1 grows it.
//   - X shrinks/grows evenly from the CENTER (left + right walls move
//     in/out equally).
//   - Y shrinks/grows anchored to the BOTTOM edge (the foundation stays
//     fixed in place; shrinking pulls the top edge down toward the roof
//     instead of shrinking toward the middle of the house).
const HOUSE_COLLISION_SCALE_X = 0.7;
const HOUSE_COLLISION_SCALE_Y = 0.4;

// Pulls the box's BOTTOM edge up by this amount (percent-of-map units).
// Top edge is untouched — this only shrinks the box from below.
const HOUSE_COLLISION_BOTTOM_INSET = 3;

// Computes HouseStart's collision box in percent-of-map coordinates.
// Base size comes from the actual rendered #HouseStart element, then
// scaled by HOUSE_COLLISION_SCALE_X/Y above. Top 20% of the resulting
// box is passable — the bottom 80% blocks the player.
function getHouseCollisionBoxPercent() {
  const stageEl = document.getElementById('map-stage');
  const houseEl = document.getElementById('HouseStart');
  if (!stageEl || !houseEl) return null;

  const stageRect = stageEl.getBoundingClientRect();
  const houseRect = houseEl.getBoundingClientRect();
  if (!stageRect.width || !stageRect.height) return null;

  // full (unscaled) box edges, centered on HouseStart.x/y
  const fullHalfWidthPercent = (houseRect.width / 2 / stageRect.width) * 100;
  const fullHalfHeightPercent = (houseRect.height / 2 / stageRect.height) * 100;

  const fullLeft = HouseStart.x - fullHalfWidthPercent;
  const fullRight = HouseStart.x + fullHalfWidthPercent;
  const fullTop = HouseStart.y - fullHalfHeightPercent;
  const fullBottom = HouseStart.y + fullHalfHeightPercent;

  // width: scaled evenly from center
  const scaledWidth = (fullRight - fullLeft) * HOUSE_COLLISION_SCALE_X;
  const left = HouseStart.x - scaledWidth / 2;
  const right = HouseStart.x + scaledWidth / 2;

  // height: scaled from the bottom edge up (foundation stays fixed) —
  // top edge computed from the original, untouched fullBottom
  const scaledHeight = (fullBottom - fullTop) * HOUSE_COLLISION_SCALE_Y;
  const top = fullBottom - scaledHeight;

  // only the bottom edge gets pulled up — top stays exactly where it was
  const bottom = fullBottom - HOUSE_COLLISION_BOTTOM_INSET;

  const collisionTop = top + (bottom - top) * 0.2; // top 20% passable

  return { left, right, top: collisionTop, bottom };
}

// Blocks the player from entering HouseStart's collision box. Called
// from movement.js's tick (that's where player position/prevX/prevY
// live). If the tick's movement would land inside the box, that
// movement is cancelled.
function blockHouseCollision(prevX, prevY) {
  const box = getHouseCollisionBoxPercent();
  if (!box) return;

  const insideX = player.x > box.left && player.x < box.right;
  const insideY = player.y > box.top && player.y < box.bottom;

  if (insideX && insideY) {
    player.x = prevX;
    player.y = prevY;
    player.vx = 0;
    player.vy = 0;
  }

  updateHouseDepth(box);
}

// Player's #map-player-sprite has z-index:5 (set in map.html).
// HouseStart's z-index is normally 10 (above the player, i.e. behind it
// visually). Once the player's y is at or past the collision box's top
// edge — walking alongside/past the base of the house — drop HouseStart
// below the player's z-index so it renders in front instead, giving the
// illusion the player has walked past/in front of the house's base.
const HOUSE_Z_BEHIND = 10; // above player — player appears behind house
const HOUSE_Z_FRONT = 3;   // below player — player appears in front of house

function updateHouseDepth(box) {
  const houseEl = document.getElementById('HouseStart');
  if (!houseEl) return;

  const wantFront = player.y >= box.top;
  houseEl.style.zIndex = wantFront ? HOUSE_Z_FRONT : HOUSE_Z_BEHIND;
}
