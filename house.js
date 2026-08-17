// ===== HOUSE.JS =====
// Controls HouseStart — the second main object on the map.
// The player builds and protects this each game.
// For now: just placed, centered in playArea. No mechanics yet.

const HouseStart = {
  x: 48.45, // percent — center of playArea
  y: 50.7,  // percent — center of playArea
  sprite: 'assets/house/HouseStart.png',
  width: 132,  // px — must match #HouseStart CSS width
  height: 132, // px — must match #HouseStart CSS height
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
// Only the bottom 85% of the house blocks the player — the top 15% is
// left passable so the player can walk through that strip and appear
// behind the house.
function getHouseCollisionBoxPercent() {
  const stageEl = document.getElementById('map-stage');
  if (!stageEl) return null;

  const rect = stageEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const halfWidthPercent = (HouseStart.width / 2 / rect.width) * 100;
  const halfHeightPercent = (HouseStart.height / 2 / rect.height) * 100;

  const left = HouseStart.x - halfWidthPercent;
  const right = HouseStart.x + halfWidthPercent;
  const top = HouseStart.y - halfHeightPercent;
  const bottom = HouseStart.y + halfHeightPercent;

  const collisionTop = top + (bottom - top) * 0.15; // skip the top 15%

  return { left, right, top: collisionTop, bottom };
}

// Blocks the player from entering HouseStart's collision box. Called from
// movement.js's tick (that's where player position/prevX/prevY live). If
// the tick's movement would land inside the box, that movement is
// cancelled.
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
