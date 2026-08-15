const STATES = ['idle', 'walk', 'run'];
const DIRECTIONS = ['down', 'up', 'left', 'right'];

// main sprite array: [direction][state][frame]
const SPRITES = {
  down: {
    idle: ['🧙'],
    walk: ['🚶','🧍'],
    run:  ['🏃','🏃‍♂️'],
  },
  up: {
    idle: ['🧙'],
    walk: ['🚶','🧍'],
    run:  ['🏃','🏃‍♂️'],
  },
  left: {
    idle: ['🧙'],
    walk: ['🚶','🧍'],
    run:  ['🏃','🏃‍♂️'],
  },
  right: {
    idle: ['🧙'],
    walk: ['🚶','🧍'],
    run:  ['🏃','🏃‍♂️'],
  },
};

// separate overlay array — NOT part of STATES
const EFFECTS = {
  atk:     ['⚔️'],
  get_dmg: ['😵'],
};
