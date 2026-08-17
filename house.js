// ===== HOUSE.JS =====
// Controls HouseStart — the second main object on the map.
// The player builds and protects this each game.
// For now: just placed, centered in playArea. No mechanics yet.

const HouseStart = {
  x: 48.45, // percent — center of playArea
  y: 50.7,  // percent — center of playArea
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
