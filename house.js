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

// Computes HouseStart's collision box in percent-of-map coordinates.
// Size comes directly from the actual rendered #HouseStart element —
// not a separate hardcoded number — so it's always relative to whatever
// size is really on screen, no manual syncing needed. Top 80% of the
// box is passable — only the bottom 20% blocks the player.
function getHouseCollisionBoxPercent() {
  const stageEl = document.getElementById('map-stage');
  const houseEl = document.getElementById('HouseStart');
  if (!stageEl || !houseEl) return null;

  const stageRect = stageEl.getBoundingClientRect();
  const houseRect = houseEl.getBoundingClientRect();
  if (!stageRect.width || !stageRect.height) return null;

  const halfWidthPercent = (houseRect.width / 2 / stageRect.width) * 100;
  const halfHeightPercent = (houseRect.height / 2 / stageRect.height) * 100;

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
