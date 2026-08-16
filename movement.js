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

  x: 50, // percent of map width
  y: 50, // percent of map height
  vx: 0, // current velocity, percent per tick
  vy: 0,
};

const MAX_WALK_SPEED = 0.3; // percent per tick
const MAX_RUN_SPEED = 0.6;  // percent per tick
const ACCEL = 0.05;         // velocity ramp-up per tick
const FRICTION = 0.08;      // velocity decay per tick when no input

// Reads current player state and writes the matching sprite into the DOM.
function renderPlayerIcon() {
  const spriteEl = document.getElementById('player-icon-sprite');
  if (!spriteEl) return;

  // 'right' has no sprite set of its own — it reuses 'left' and gets mirrored.
  const isFacingRight = player.direction === 'right';
  const spriteDirection = isFacingRight ? 'left' : player.direction;

  const content = player.effect
    ? EFFECTS[player.effect][player.effectFrame]
    : player.state === 'idle'
      ? IDLE_SPRITE
      : SPRITES[spriteDirection][player.state][player.frameIndex];

  spriteEl.src = content;

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
  const direction = keyToDirection[e.key];
  if (direction) handleMoveKeyDown(direction);
});

document.addEventListener('keyup', (e) => {
  const direction = keyToDirection[e.key];
  if (direction) handleMoveKeyUp(direction);
});

// tick down every key's double-tap cooldown, and move the player position
setInterval(() => {
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

  player.x += player.vx;
  player.y += player.vy;
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
