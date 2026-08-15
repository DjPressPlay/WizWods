// ===== MOVEMENT.JS =====
// Emoji are placeholders.
//
// FUTURE IMAGE SWAP — 2 edits total, both inside this file, nowhere else:
//   1. Replace the emoji strings inside SPRITES and EFFECTS below with image
//      file paths (e.g. 'assets/player/down_walk1.png').
//   2. Inside renderPlayerIcon(), change the line that sets textContent to
//      instead set backgroundImage (or an <img> src) using the same value.
// No other function, file, or piece of logic needs to change.

const STATES = ['idle', 'walk', 'run'];
const DIRECTIONS = ['down', 'up', 'left']; // 'right' uses the 'left' sprite, mirrored

// main sprite array: [direction][state][frame]
// 'right' has no entry here — it reuses 'left' and gets flipped horizontally.
const SPRITES = {
  down: {
    idle: ['🧙'],
    walk: ['🚶', '🧍'],
    run:  ['🏃', '🏃‍♂️'],
  },
  up: {
    idle: ['🧙'],
    walk: ['🚶', '🧍'],
    run:  ['🏃', '🏃‍♂️'],
  },
  left: {
    idle: ['🧙'],
    walk: ['🚶', '🧍'],
    run:  ['🏃', '🏃‍♂️'],
  },
};

// separate overlay array — NOT part of STATES
const EFFECTS = {
  atk:     ['⚔️'],
  get_dmg: ['😵'],
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
  const spriteEl = document.getElementById('player-icon-sprite');
  if (!spriteEl) return;

  // 'right' has no sprite set of its own — it reuses 'left' and gets mirrored.
  const isFacingRight = player.direction === 'right';
  const spriteDirection = isFacingRight ? 'left' : player.direction;

  const content = player.effect
    ? EFFECTS[player.effect][player.effectFrame]
    : SPRITES[spriteDirection][player.state][player.frameIndex];

  // FUTURE IMAGE SWAP — change this one line to:
  //   spriteEl.style.backgroundImage = `url('${content}')`;
  spriteEl.textContent = content;

  spriteEl.style.transform = isFacingRight ? 'scaleX(-1)' : 'scaleX(1)';
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
const specialButtonEl = document.getElementById('special-button');

if (specialButtonEl) {
  const startAttack = () => {
    player.effect = 'atk';
    player.effectFrame = 0;
    renderPlayerIcon();
  };

  const stopAttack = () => {
    player.effect = null;
    renderPlayerIcon();
  };

  specialButtonEl.addEventListener('mousedown', startAttack);
  specialButtonEl.addEventListener('mouseup', stopAttack);
  specialButtonEl.addEventListener('mouseleave', stopAttack);
  specialButtonEl.addEventListener('touchstart', startAttack);
  specialButtonEl.addEventListener('touchend', stopAttack);
}
