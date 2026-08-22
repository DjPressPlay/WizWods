// ===== ENEMYLEVELS / ALEVELENEMY.JS =====
// Behavior for "A-level" enemies. This is its own file (and folder,
// alongside future Blevelenemy.js, Clevelenemy.js, etc.) because each
// level of enemy gets its own self-contained behavior code — nothing in
// here talks to movement.js's player logic except reading player.x/player.y
// to know where to drift toward.
//
// SCOPE OF THIS FIRST PASS (test only):
//   - exactly 2 hardcoded enemies (one bear, one tiger — same behavior,
//     different skin, per current design: A-level = shared behavior class)
//   - spawn outside the play area, left or right side only (top/bottom are
//     reserved for the altar zones)
//   - drift straight toward the player every tick, flipping the sprite to
//     face the direction of travel
//   - simple stop-at-player so they don't just overlap and pass through
//   - NO health, NO death/despawn, NO attacks yet — none of that is wired
//     up. This file exists purely to prove spawn + drift works.
//
// Runs its OWN tick loop (separate setInterval), not a line added into
// movement.js's loop — enemy logic is meant to stay fully independent of
// player movement code. Does NOT run on its own — gameStart.js calls
// startALevelEnemies() once its round-start countdown finishes.

const A_LEVEL_TICK_MS = 16;        // matches movement.js's TICK_MS, same speed feel
const A_LEVEL_DRIFT_SPEED = 0.12;  // percent-of-stage-width moved per tick
const A_LEVEL_SPAWN_MARGIN = 8;    // percent, how far outside the play area edge they appear
const A_LEVEL_STOP_DISTANCE_PX = 40; // stop drifting once this close to the player (pixels)

// Source art faces LEFT by default for both sprites — flip only when
// drifting toward positive x (right).
const A_LEVEL_ENEMY_DEFS = {
  bear:  { sprite: 'assets/enemies/enemy_bear.png' },
  tiger: { sprite: 'assets/enemies/enemy_tiger.png' },
};

let aLevelEnemies = [];

// ===== SPAWN =====
// Picks a random left/right position just outside ZONES.playArea (the
// live one defined in movement.js — NOT zones.js, which is unused dead
// code with a different, incompatible shape), and a random y within the
// play area's vertical span so enemies drift in roughly level with the
// player/house instead of from a corner.
function spawnALevelEnemy(type, id) {
  const play = ZONES.playArea; // { x, y, w, h } — see movement.js
  const side = Math.random() < 0.5 ? 'left' : 'right';
  const x = side === 'left'
    ? play.x - A_LEVEL_SPAWN_MARGIN
    : play.x + play.w + A_LEVEL_SPAWN_MARGIN;
  const y = play.y + Math.random() * play.h;

  return {
    id,
    type,
    sprite: A_LEVEL_ENEMY_DEFS[type].sprite,
    x,
    y,
    flipped: false,
  };
}

function spawnALevelTestEnemies() {
  aLevelEnemies = [
    spawnALevelEnemy('bear', 'a-bear-1'),
    spawnALevelEnemy('tiger', 'a-tiger-1'),
  ];
  aLevelEnemies.forEach(renderALevelEnemy);
}

// ===== RENDER =====
// Enemy sprite elements are created on demand (not pre-declared in
// map.html) since the count/roster here is expected to change once this
// grows past 2 hardcoded test enemies.
function renderALevelEnemy(enemy) {
  let el = document.getElementById('enemy-' + enemy.id);
  if (!el) {
    el = document.createElement('img');
    el.id = 'enemy-' + enemy.id;
    el.className = 'a-level-enemy-sprite';
    el.src = enemy.sprite;
    el.alt = enemy.type;
    const stageEl = document.getElementById('map-stage');
    if (stageEl) stageEl.appendChild(el);
  }
  el.style.left = enemy.x + '%';
  el.style.top = enemy.y + '%';
  el.style.transform = `translate(-50%, -50%) scaleX(${enemy.flipped ? -1 : 1})`;
}

// ===== DRIFT TOWARD PLAYER =====
// Direction has to be computed in real pixels, not raw percent, because
// #map-stage isn't square (1024x1536) — comparing percent dx/dy directly
// would skew the angle. Same fix already used for click-aim direction in
// movement.js's triggerAttack().
function tickALevelEnemies() {
  const stageEl = document.getElementById('map-stage');
  if (!stageEl || typeof player === 'undefined') return;

  const rect = stageEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  aLevelEnemies.forEach((enemy) => {
    const enemyPx = (enemy.x / 100) * rect.width;
    const enemyPy = (enemy.y / 100) * rect.height;
    const playerPx = (player.x / 100) * rect.width;
    const playerPy = (player.y / 100) * rect.height;

    const dx = playerPx - enemyPx;
    const dy = playerPy - enemyPy;
    const dist = Math.hypot(dx, dy);

    // simple stop-at-player — no attack/collision box yet, just prevents
    // the sprite from sitting exactly on top of / passing through the player
    if (dist > A_LEVEL_STOP_DISTANCE_PX) {
      const stepPx = (A_LEVEL_DRIFT_SPEED / 100) * rect.width;
      const nx = enemyPx + (dx / dist) * stepPx;
      const ny = enemyPy + (dy / dist) * stepPx;

      enemy.x = (nx / rect.width) * 100;
      enemy.y = (ny / rect.height) * 100;
      enemy.flipped = dx > 0;
    }

    renderALevelEnemy(enemy);
  });
}

// ===== START =====
// Entry point called by gameStart.js once its round-start countdown
// finishes. gameStart.js must be loaded AFTER this file (see map.html's
// loadHud()) since it calls this directly.
function startALevelEnemies() {
  spawnALevelTestEnemies();
  setInterval(tickALevelEnemies, A_LEVEL_TICK_MS);
}
