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
// 1.0 = matches the sprite exactly. <1 shrinks the box (e.g. 0.6 = only
// the middle 60% of the house blocks). >1 grows it beyond the sprite's
// edges. Tune this to change collision size without resizing the sprite.
const HOUSE_COLLISION_SCALE_X = 1.0;
const HOUSE_COLLISION_SCALE_Y = 1.0;

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

  const halfWidthPercent = (houseRect.width * HOUSE_COLLISION_SCALE_X / 2 / stageRect.width) * 100;
  const halfHeightPercent = (houseRect.height * HOUSE_COLLISION_SCALE_Y / 2 / stageRect.height) * 100;

  const left = HouseStart.x - halfWidthPercent;
  const right = HouseStart.x + halfWidthPercent;
  const top = HouseStart.y - halfHeightPercent;
  const bottom = HouseStart.y + halfHeightPercent;

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
