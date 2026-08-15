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
