// ===== HOUSE.JS =====
// Controls HouseStart — the second main object on the map.
// The player builds and protects this each game.
// For now: just placed, centered in playArea. No mechanics yet.

const HouseStart = {
  x: 48.45, // percent — center of playArea
  y: 44,    // percent — moved up from playArea center
  sprite: 'assets/house/HouseStart.png',
  width: 195,  // px — must match #HouseStart CSS width
  height: 195, // px — must match #HouseStart CSS height
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

// Computes HouseStart's collision as a true circle (ellipse in percent-
// space, since x and y scale differently in percent-of-map units),
// centered on the house — matching the round shape of the house art.
function getHouseCollisionCircle() {
  const stageEl = document.getElementById('map-stage');
  if (!stageEl) return null;

  const rect = stageEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const radiusXPercent = (HouseStart.width / 2 / rect.width) * 100;
  const radiusYPercent = (HouseStart.height / 2 / rect.height) * 100;

  return {
    cx: HouseStart.x,
    cy: HouseStart.y,
    radiusXPercent,
    radiusYPercent,
  };
}

// Blocks the player from entering HouseStart's circular collision area.
// Called from movement.js's tick (that's where player position/prevX/
// prevY live). If the tick's movement would land inside the circle,
// that movement is cancelled.
function blockHouseCollision(prevX, prevY) {
  const circle = getHouseCollisionCircle();
  if (!circle) return;

  const dx = (player.x - circle.cx) / circle.radiusXPercent;
  const dy = (player.y - circle.cy) / circle.radiusYPercent;
  const inside = (dx * dx + dy * dy) <= 1;

  if (inside) {
    player.x = prevX;
    player.y = prevY;
    player.vx = 0;
    player.vy = 0;
  }
}
