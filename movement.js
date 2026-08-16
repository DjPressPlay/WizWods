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
  atk:     ['assets/player/atk.png'],
  get_dmg: ['assets/player/get_dmg.png'],
};

const player = {
  direction: 'down',
  state: 'idle',
  frameIndex: 0,

  effect: null,       // null | 'atk' | 'get_dmg'
  effectFrame: 0,
};

// Reads current player state and writes the matching sprite into the DOM.
function renderPlayerIcon() {
  // 'right' has no sprite set of its own — it reuses 'left' and gets mirrored.
  const isFacingRight = player.direction === 'right';
  const spriteDirection = isFacingRight ? 'left' : player.direction;

  const content = player.effect
    ? EFFECTS[player.effect][player.effectFrame]
    : player.state === 'idle'
      ? IDLE_SPRITE
      : SPRITES[spriteDirection][player.state][player.frameIndex];

  // HUD icon (index.html)
  const spriteEl = document.getElementById('player-icon-sprite');
  if (spriteEl) {
    spriteEl.src = content;
    spriteEl.style.transform = isFacingRight ? 'scaleX(-1)' : 'scaleX(1)';
  }

  // on-map player sprite (map.html)
  const mapSpriteEl = document.getElementById('map-player-sprite');
  if (mapSpriteEl) {
    mapSpriteEl.src = content;
    mapSpriteEl.style.transform = isFacingRight ? 'translate(-50%, -50%) scaleX(-1)' : 'translate(-50%, -50%) scaleX(1)';
  }
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
    player.state = 'run';
  } else {
    // first press — walk
    key.running = false;
    player.state = 'walk';
  }

  key.cooldown = DOUBLE_TAP_WINDOW;
  renderPlayerIcon();
}

function handleMoveKeyUp(direction) {
  const key = moveKeys[direction];
  if (!key) return;

  key.held = false;
  key.running = false;
  player.state = 'idle';
  renderPlayerIcon();
}

document.addEventListener('keydown', (e) => {
  const direction = keyToDirection[e.key];
  if (direction) handleMoveKeyDown(direction);
});

document.addEventListener('keyup', (e) => {
  const direction = keyToDirection[e.key];
  if (direction) handleMoveKeyUp(direction);
});

// tick down every key's double-tap cooldown
setInterval(() => {
  for (const direction in moveKeys) {
    const key = moveKeys[direction];
    if (key.cooldown > 0) key.cooldown--;
  }
}, TICK_MS);

// ===== SPECIAL BUTTON → ATTACK =====
// Hooks into the existing #special-button element already in the HTML.
const specialAttackButtonEl = document.getElementById('special-button');

if (specialAttackButtonEl) {
  const startAttack = () => {
    player.effect = 'atk';
    player.effectFrame = 0;
    renderPlayerIcon();
  };

  const stopAttack = () => {
    player.effect = null;
    renderPlayerIcon();
  };

  specialAttackButtonEl.addEventListener('mousedown', startAttack);
  specialAttackButtonEl.addEventListener('mouseup', stopAttack);
  specialAttackButtonEl.addEventListener('mouseleave', stopAttack);
  specialAttackButtonEl.addEventListener('touchstart', startAttack);
  specialAttackButtonEl.addEventListener('touchend', stopAttack);
}
