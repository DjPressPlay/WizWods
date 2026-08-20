// ===== MOVEMENT.JS =====
// Emoji are placeholders.
//
// IMAGE SWAP:
//   1. Replace the emoji strings inside SPRITES and EFFECTS below with image
//      file paths (e.g. 'assets/player/down_walk1.png').
//   2. renderPlayerIcon() below sets the <img> element's src to that path directly.
// No other function, file, or piece of logic needs to change.

const STATES = ['idle', 'walk', 'run'];
const DIRECTIONS = ['down', 'up', 'left']; // 'right' uses the 'left' sprite, mirrored

// main sprite array: [direction][state][frame]
// 'right' has no entry here — it reuses 'left' and gets flipped horizontally.
const IDLE_SPRITE = 'assets/player/idle.png';

const SPRITES = {
  down: {
    walk: ['assets/player/down_walk1.png'],
    run:  ['assets/player/down_run1.png'],
  },
  up: {
    walk: ['assets/player/up_walk1.png'],
    run:  ['assets/player/up_run1.png'],
  },
  left: {
    walk: ['assets/player/left_walk1.png'],
    run:  ['assets/player/left_run1.png'],
  },
};

// separate overlay array — NOT part of STATES
const EFFECTS = {
  atk: {
    down:  ['assets/player/atk_down.png'],
    up:    ['assets/player/atk_up.png'],
    right: ['assets/player/atk_right.png'], // 'left' reuses this, mirrored
  },
  get_dmg: ['assets/player/get_dmg.png'],
};

const GET_DMG_SCALE = 0.25; // 1 = normal size, lower = smaller

const player = {
  direction: 'down',
  state: 'idle',
  frameIndex: 0,

  effect: null,       // null | 'atk' | 'get_dmg'
  effectFrame: 0,

  x: 50, // percent of map width
  y: 72, // percent of map height — kept clear of HouseStart's collision box
  vx: 0, // current velocity, percent per tick
  vy: 0,
};

const MAX_WALK_SPEED = 0.3; // percent per tick
const MAX_RUN_SPEED = 0.6;  // percent per tick
const ACCEL = 0.05;         // velocity ramp-up per tick
const FRICTION = 0.08;      // velocity decay per tick when no input

// ===== MAP ZONES =====
// Rectangles in percent-of-map coordinates (matches player.x / player.y).
// playArea is the only zone with collision — it's what the player is
// physically boxed inside. portalZone / crystalGate sit just outside
// playArea's edges and are never entered directly; they're triggered by
// proximity to the shared boundary line instead.
const ZONES = {
  playArea:    { x: 14.5, y: 26.8, w: 67.9, h: 47.8 },
  portalZone:  { x: 2.4,  y: 1.2,  w: 94.6, h: 24.7 },
  crystalGate: { x: 3.7,  y: 75.1, w: 92.6, h: 21.3 },
};

const ZONE_INFO = {
  portalZone:  { name: 'Summoner', description: 'Summon Help' },
  crystalGate: { name: 'School',   description: 'Learn new Spells' },
};

const ZONE_PROXIMITY_THRESHOLD = 3; // percent of map height — how close to playArea's edge counts as "near" a zone
const INTERACT_KEY = 'e';

let gameFrozen = false;
let activeZone = null;   // null | 'portalZone' | 'crystalGate' — which interaction zone the player is currently near
let overlayOpen = false;

// Clamps the player inside playArea's bounds. This is the only boundary
// collision in the game — portalZone / crystalGate never get collision
// because the player is never meant to be able to stand inside them.
function clampToPlayArea() {
  const b = ZONES.playArea;
  if (player.x < b.x)         { player.x = b.x;         player.vx = 0; }
  if (player.x > b.x + b.w)   { player.x = b.x + b.w;    player.vx = 0; }
  if (player.y < b.y)         { player.y = b.y;          player.vy = 0; }
  if (player.y > b.y + b.h)   { player.y = b.y + b.h;    player.vy = 0; }
}

// Checks how close the player is to playArea's top/bottom edge and sets
// activeZone accordingly. Since playArea, portalZone, and crystalGate are
// stacked horizontal bands, this only needs to compare player.y against
// the shared boundary lines — no rect-overlap test needed.
function checkZoneProximity() {
  const b = ZONES.playArea;
  const distToTop = player.y - b.y;
  const distToBottom = (b.y + b.h) - player.y;

  let nearZone = null;
  if (distToTop <= ZONE_PROXIMITY_THRESHOLD) {
    nearZone = 'portalZone';
  } else if (distToBottom <= ZONE_PROXIMITY_THRESHOLD) {
    nearZone = 'crystalGate';
  }

  if (nearZone !== activeZone) {
    activeZone = nearZone;
    updateZonePrompt();
  }
}

// Shows/hides the "press key" prompt. Hidden whenever there's no active
// zone, and also hidden while the game is frozen (overlay is up instead).
function updateZonePrompt() {
  const promptEl = document.getElementById('zone-prompt');
  const labelEl = document.getElementById('zone-label');
  const show = activeZone && !gameFrozen;

  if (promptEl) promptEl.style.display = show ? 'block' : 'none';

  if (labelEl) {
    if (show) {
      const info = ZONE_INFO[activeZone];
      document.getElementById('zone-label-name').textContent = info.name;
      document.getElementById('zone-label-desc').textContent = info.description;
      labelEl.style.display = 'block';
    } else {
      labelEl.style.display = 'none';
    }
  }
}

// The single entry point for the interact key. Behavior depends on
// whether the game is currently frozen (overlay open = key closes it)
// or not (must be near a zone for the key to do anything).
function handleInteractPress() {
  if (gameFrozen) {
    closeZoneOverlay();
    return;
  }
  if (activeZone) {
    openZoneOverlay(activeZone);
  }
}

function openZoneOverlay(zoneId) {
  gameFrozen = true;
  overlayOpen = true;
  updateZonePrompt();

  const overlayEl = document.getElementById('zone-overlay');
  const titleEl = document.getElementById('zone-overlay-title');
  if (overlayEl) {
    if (titleEl) titleEl.textContent = zoneId === 'portalZone' ? 'Portal' : 'Crystal Gate';
    overlayEl.style.display = 'flex';
  }
}

function closeZoneOverlay() {
  gameFrozen = false;
  overlayOpen = false;

  const overlayEl = document.getElementById('zone-overlay');
  if (overlayEl) overlayEl.style.display = 'none';

  checkZoneProximity();
  updateZonePrompt();
}

// True crossfade between two stacked <img> layers (baseId-a / baseId-b) inside
// a wrapper element (id="baseId"). The new frame fades IN while the old frame
// fades OUT at the same time, so there's never a moment where the sprite is
// fully invisible (unlike a fade-out-then-swap-then-fade-in approach).
function crossfadeSprite(baseId, newSrc, mirrored, scale = 1) {
  const wrapper = document.getElementById(baseId);
  if (!wrapper) return;

  if (
    wrapper.dataset.currentSrc === newSrc &&
    wrapper.dataset.mirrored === String(mirrored) &&
    wrapper.dataset.scale === String(scale)
  ) return;

  const layerA = document.getElementById(baseId + '-a');
  const layerB = document.getElementById(baseId + '-b');
  const frontIsA = wrapper.dataset.front !== 'b';
  const front = frontIsA ? layerA : layerB;
  const back = frontIsA ? layerB : layerA;

  back.src = newSrc;
  back.style.transform = `scale(${mirrored ? -scale : scale}, ${scale})`;
  back.style.opacity = '1';
  front.style.opacity = '0';

  wrapper.dataset.front = frontIsA ? 'b' : 'a';
  wrapper.dataset.currentSrc = newSrc;
  wrapper.dataset.mirrored = String(mirrored);
  wrapper.dataset.scale = String(scale);
}

// Reads current player state and writes the matching sprite into the DOM.
function renderPlayerIcon() {
  const wrapperEl = document.getElementById('player-icon-sprite');
  if (!wrapperEl) return;

  // 'right' has no sprite set of its own — it reuses 'left' and gets mirrored.
  const isFacingRight = player.direction === 'right';
  const spriteDirection = isFacingRight ? 'left' : player.direction;

  // atk is the reverse: 'right' is the stored sprite, 'left' reuses it mirrored.
  const isAtkFacingLeft = player.direction === 'left';
  const atkDirection = isAtkFacingLeft ? 'right' : player.direction;

  const isAtk = player.effect === 'atk';

  const content = player.effect
    ? isAtk
      ? EFFECTS.atk[atkDirection][player.effectFrame]
      : EFFECTS[player.effect][player.effectFrame]
    : player.state === 'idle'
      ? IDLE_SPRITE
      : SPRITES[spriteDirection][player.state][player.frameIndex];

  const mirrored = isAtk ? isAtkFacingLeft : isFacingRight;
  const scale = player.effect === 'get_dmg' ? GET_DMG_SCALE : 1;

  crossfadeSprite('player-icon-sprite', content, mirrored, scale);
}

// ===== MOVEMENT INPUT =====
// Double-tap-and-hold to run: tap a direction key once = walk.
// Tap it again while its cooldown is still active = run (as long as held).
// This uses a cooldown counter, not timestamps.

const DOUBLE_TAP_WINDOW = 20; // ticks before a second press no longer counts as a double-tap
const TICK_MS = 16;           // ~60fps tick rate for the cooldown countdown

const keyToDirection = {
  'w': 'up', 'W': 'up', 'ArrowUp': 'up',
  'a': 'left', 'A': 'left', 'ArrowLeft': 'left',
  's': 'down', 'S': 'down', 'ArrowDown': 'down',
  'd': 'right', 'D': 'right', 'ArrowRight': 'right',
};

// per-direction cooldown + held state
const moveKeys = {
  up:    { cooldown: 0, held: false, running: false },
  left:  { cooldown: 0, held: false, running: false },
  down:  { cooldown: 0, held: false, running: false },
  right: { cooldown: 0, held: false, running: false },
};

function handleMoveKeyDown(direction) {
  const key = moveKeys[direction];
  if (!key) return;

  // already holding this key — ignore repeat keydown events
  if (key.held) return;

  key.held = true;
  player.direction = direction;

  if (key.cooldown > 0) {
    // second press landed within the window — run
    key.running = true;
  } else {
    // first press — walk
    key.running = false;
  }

  key.cooldown = DOUBLE_TAP_WINDOW;
  updateMovementState();
}

function handleMoveKeyUp(direction) {
  const key = moveKeys[direction];
  if (!key) return;

  key.held = false;
  key.running = false;

  // if another direction key is still held, keep facing/moving that way
  const stillHeld = Object.keys(moveKeys).find((dir) => moveKeys[dir].held);
  if (stillHeld) {
    player.direction = stillHeld;
  }

  updateMovementState();
}

// Recomputes player.state ('idle' | 'walk' | 'run') from all currently held keys.
function updateMovementState() {
  const heldDirections = Object.keys(moveKeys).filter((dir) => moveKeys[dir].held);

  if (heldDirections.length === 0) {
    player.state = 'idle';
  } else {
    const anyRunning = heldDirections.some((dir) => moveKeys[dir].running);
    player.state = anyRunning ? 'run' : 'walk';
  }

  renderPlayerIcon();
}

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === INTERACT_KEY) {
    handleInteractPress();
    return;
  }
  if (gameFrozen) return;
  const direction = keyToDirection[e.key];
  if (direction) handleMoveKeyDown(direction);
});

document.addEventListener('keyup', (e) => {
  if (gameFrozen) return;
  const direction = keyToDirection[e.key];
  if (direction) handleMoveKeyUp(direction);
});

// tick down every key's double-tap cooldown, and move the player position
setInterval(() => {
  if (gameFrozen) return;

  for (const direction in moveKeys) {
    const key = moveKeys[direction];
    if (key.cooldown > 0) key.cooldown--;
  }

  // build input direction vector from held keys
  let dx = 0;
  let dy = 0;
  if (moveKeys.up.held) dy -= 1;
  if (moveKeys.down.held) dy += 1;
  if (moveKeys.left.held) dx -= 1;
  if (moveKeys.right.held) dx += 1;

  if (dx !== 0 || dy !== 0) {
    // normalize so diagonal input isn't faster than straight input
    const length = Math.sqrt(dx * dx + dy * dy);
    const maxSpeed = player.state === 'run' ? MAX_RUN_SPEED : MAX_WALK_SPEED;
    const targetVx = (dx / length) * maxSpeed;
    const targetVy = (dy / length) * maxSpeed;

    // accelerate current velocity toward the target velocity
    player.vx += (targetVx - player.vx) * ACCEL;
    player.vy += (targetVy - player.vy) * ACCEL;
  } else {
    // no input — decay velocity toward 0 (slide to a stop)
    player.vx += (0 - player.vx) * FRICTION;
    player.vy += (0 - player.vy) * FRICTION;
  }

  const prevX = player.x;
  const prevY = player.y;
  player.x += player.vx;
  player.y += player.vy;

  clampToPlayArea();
  blockHouseCollision(prevX, prevY);
  checkZoneProximity();

  if (player.effect === 'atk' && attackTicksLeft > 0) {
    attackTicksLeft--;
    if (attackTicksLeft === 0) {
      player.effect = null;
      renderPlayerIcon();
    }
  }
}, TICK_MS);

// ===== SPECIAL BUTTON → ATTACK =====
// Hooks into the existing #special-button element already in the HTML.
const specialAttackButtonEl = document.getElementById('special-button');

if (specialAttackButtonEl) {
  const startAttack = () => {
    if (gameFrozen) return;
    player.effect = 'atk';
    player.effectFrame = 0;
    renderPlayerIcon();
  };

  const stopAttack = () => {
    if (gameFrozen) return;
    player.effect = null;
    renderPlayerIcon();
  };

  specialAttackButtonEl.addEventListener('mousedown', startAttack);
  specialAttackButtonEl.addEventListener('mouseup', stopAttack);
  specialAttackButtonEl.addEventListener('mouseleave', stopAttack);
  specialAttackButtonEl.addEventListener('touchstart', startAttack);
  specialAttackButtonEl.addEventListener('touchend', stopAttack);
}

// ===== ATTACK TRIGGER (click / touch on the map) =====
// One click/tap = one attack: shows the atk pose for ATTACK_DURATION_TICKS
// ticks (counted down in the tick loop above), then reverts on its own.
const ATTACK_DURATION_TICKS = 15; // ~250ms at TICK_MS=16
let attackTicksLeft = 0;

function triggerAttack() {
  if (gameFrozen) return;
  player.effect = 'atk';
  player.effectFrame = 0;
  attackTicksLeft = ATTACK_DURATION_TICKS;
  renderPlayerIcon();
}

const mapStageEl = document.getElementById('map-stage');
if (mapStageEl) {
  mapStageEl.addEventListener('click', triggerAttack);
}
