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
const DIRECTIONS = ['down', 'up', 'left', 'right'];

// main sprite array: [direction][state][frame]
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
  right: {
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

  const content = player.effect
    ? EFFECTS[player.effect][player.effectFrame]
    : SPRITES[player.direction][player.state][player.frameIndex];

  // FUTURE IMAGE SWAP — change this one line to:
  //   spriteEl.style.backgroundImage = `url('${content}')`;
  spriteEl.textContent = content;
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
