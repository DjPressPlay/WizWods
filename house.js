// ===== HOUSE.JS =====
// Controls HouseStart — the second main object on the map.
// The player builds and protects this each game.

const HouseStart = {
  x: 48.45, // percent — center of playArea
  y: 44,    // percent — moved up from playArea center
  sprite: 'assets/house/HouseStart.png',
  width: 195,  // px — must match #HouseStart CSS width
  height: 195, // px — must match #HouseStart CSS height
  collisionMask: null, // filled in once the sprite loads — see buildCollisionMask()
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

// ===== PIXEL-ACCURATE COLLISION =====
// Reads HouseStart.sprite's actual pixels and builds a solid/empty mask
// from its alpha channel, so collision matches the exact shape of the
// image instead of an approximate circle or rectangle.

const MASK_RESOLUTION = 64; // mask grid is 64x64 samples across the image
const ALPHA_THRESHOLD = 128; // pixel counts as "solid" above this alpha (0-255)

function buildCollisionMask() {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = MASK_RESOLUTION;
    canvas.height = MASK_RESOLUTION;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, MASK_RESOLUTION, MASK_RESOLUTION);

    let pixels;
    try {
      pixels = ctx.getImageData(0, 0, MASK_RESOLUTION, MASK_RESOLUTION).data;
    } catch (err) {
      // canvas got tainted (e.g. running straight off file://) — no mask,
      // collision will just no-op rather than throw.
      return;
    }

    const mask = [];
    for (let row = 0; row < MASK_RESOLUTION; row++) {
      const rowArr = [];
      for (let col = 0; col < MASK_RESOLUTION; col++) {
        const alphaIndex = (row * MASK_RESOLUTION + col) * 4 + 3;
        rowArr.push(pixels[alphaIndex] >= ALPHA_THRESHOLD);
      }
      mask.push(rowArr);
    }

    HouseStart.collisionMask = mask;
  };
  img.src = HouseStart.sprite;
}

buildCollisionMask();

// Given the player's position in percent-of-map coordinates, converts it
// into a position inside the house's image (0..1 across width/height)
// and looks up the collision mask at that spot.
function isHousePixelSolid(px, py) {
  if (!HouseStart.collisionMask) return false; // mask not loaded yet — no collision

  const stageEl = document.getElementById('map-stage');
  if (!stageEl) return false;

  const rect = stageEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;

  const halfWidthPercent = (HouseStart.width / 2 / rect.width) * 100;
  const halfHeightPercent = (HouseStart.height / 2 / rect.height) * 100;

  const left = HouseStart.x - halfWidthPercent;
  const top = HouseStart.y - halfHeightPercent;

  const u = (px - left) / (halfWidthPercent * 2); // 0..1 across the image
  const v = (py - top) / (halfHeightPercent * 2);  // 0..1 across the image

  if (u < 0 || u > 1 || v < 0 || v > 1) return false; // outside the image entirely

  const col = Math.min(MASK_RESOLUTION - 1, Math.floor(u * MASK_RESOLUTION));
  const row = Math.min(MASK_RESOLUTION - 1, Math.floor(v * MASK_RESOLUTION));

  return HouseStart.collisionMask[row][col];
}

// Blocks the player from entering any solid (non-transparent) pixel of
// HouseStart's sprite. Called from movement.js's tick (that's where
// player position/prevX/prevY live). If the tick's movement would land
// on a solid pixel, that movement is cancelled.
function blockHouseCollision(prevX, prevY) {
  if (isHousePixelSolid(player.x, player.y)) {
    player.x = prevX;
    player.y = prevY;
    player.vx = 0;
    player.vy = 0;
  }
}
