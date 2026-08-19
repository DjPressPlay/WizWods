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

  // height: scaled from the bottom edge up (foundation stays fixed)
  const scaledHeight = (fullBottom - fullTop) * HOUSE_COLLISION_SCALE_Y;
  const bottom = fullBottom;
  const top = fullBottom - scaledHeight;

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
}

// Splits the (invisible, sizing-only) #HouseStart image into two visible
// slices — #HouseStart-back (top portion, z-index 10, behind the player)
// and #HouseStart-front (bottom portion, z-index 3, in front of the
// player). Split line = the collision box's bottom edge, so the visual
// split lines up with where the player is actually free to walk again.
function positionHouseSlices() {
  const stageEl = document.getElementById('map-stage');
  const houseEl = document.getElementById('HouseStart');
  const backEl = document.getElementById('HouseStart-back');
  const frontEl = document.getElementById('HouseStart-front');
  if (!stageEl || !houseEl || !backEl || !frontEl) return;

  const box = getHouseCollisionBoxPercent();
  if (!box) return;

  const stageRect = stageEl.getBoundingClientRect();
  const houseRect = houseEl.getBoundingClientRect();
  if (!houseRect.width || !houseRect.height) return;

  const houseLeftPx = houseRect.left - stageRect.left;
  const houseTopPx = houseRect.top - stageRect.top;
  const houseWidthPx = houseRect.width;
  const houseHeightPx = houseRect.height;

  // box.bottom is percent-of-map-stage — convert to a px line, then to a
  // fraction of the house's own height (0 = top of house, 1 = bottom).
  const splitYPx = (box.bottom / 100) * stageRect.height;
  let splitFraction = (splitYPx - houseTopPx) / houseHeightPx;
  splitFraction = Math.max(0, Math.min(1, splitFraction));

  const backHeightPx = houseHeightPx * splitFraction;
  const frontHeightPx = houseHeightPx * (1 - splitFraction);

  // top slice
  backEl.style.left = houseLeftPx + 'px';
  backEl.style.top = houseTopPx + 'px';
  backEl.style.width = houseWidthPx + 'px';
  backEl.style.height = backHeightPx + 'px';
  const backImg = backEl.querySelector('img');
  backImg.src = HouseStart.sprite;
  backImg.style.width = houseWidthPx + 'px';
  backImg.style.height = houseHeightPx + 'px';
  backImg.style.top = '0px';

  // bottom slice — same full image, shifted up inside its own clipped
  // container so only the lower portion shows
  frontEl.style.left = houseLeftPx + 'px';
  frontEl.style.top = (houseTopPx + backHeightPx) + 'px';
  frontEl.style.width = houseWidthPx + 'px';
  frontEl.style.height = frontHeightPx + 'px';
  const frontImg = frontEl.querySelector('img');
  frontImg.src = HouseStart.sprite;
  frontImg.style.width = houseWidthPx + 'px';
  frontImg.style.height = houseHeightPx + 'px';
  frontImg.style.top = (-backHeightPx) + 'px';
}

positionHouseSlices();
window.addEventListener('resize', positionHouseSlices);
