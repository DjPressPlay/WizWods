// ===== ZONES.JS =====
// Defines the map's zones (one movement boundary + two interaction zones)
// and handles: clamping the player inside the boundary, detecting when the
// player touches an interaction zone (or presses the interact key while at
// one), and freezing the game to show that zone's overlay.
//
// Coordinates are percent-of-map, same system as player.x / player.y.

const ZONES = {
  topAltar: {
    type: 'interaction',
    x: 0, y: 0, width: 100, height: 25.6,
    title: 'Top Altar',
    body: 'placeholder',
  },
  playArea: {
    type: 'boundary',
    x: 14.5, y: 26.4, width: 67.8, height: 47.3,
  },
  bottomAltar: {
    type: 'interaction',
    x: 0, y: 73.8, width: 100, height: 20.9,
    title: 'Bottom Altar',
    body: 'placeholder',
  },
};

const EDGE_TOLERANCE = 0.15; // percent, accounts for float clamping at the boundary edge
const EXIT_NUDGE = 1;        // percent, how far the player is pushed off the edge on close

let activeInteractionZone = null; // zone key currently shown in the overlay, or null

// ===== BOUNDARY CLAMP =====
// Keeps the player inside the white play area at all times.
function clampToPlayArea() {
  const zone = ZONES.playArea;
  const minX = zone.x;
  const maxX = zone.x + zone.width;
  const minY = zone.y;
  const maxY = zone.y + zone.height;

  if (player.x < minX) player.x = minX;
  if (player.x > maxX) player.x = maxX;
  if (player.y < minY) player.y = minY;
  if (player.y > maxY) player.y = maxY;
}

// ===== ZONE TRIGGER (TOUCH) =====
// Call every frame. Opens an interaction overlay automatically the moment
// the player is pressed up against the edge bordering that zone.
function checkZoneTrigger() {
  if (gamePaused) return;

  const play = ZONES.playArea;

  if (player.y <= play.y + EDGE_TOLERANCE) {
    enterInteraction('topAltar');
  } else if (player.y >= play.y + play.height - EDGE_TOLERANCE) {
    enterInteraction('bottomAltar');
  }
}

// ===== ZONE TRIGGER (INTERACT KEY / BUTTON) =====
// Same entry point as touch — called when the player presses the interact
// key (or, later, a touch button) while standing at a zone edge.
function tryInteract() {
  if (gamePaused) return;

  const play = ZONES.playArea;

  if (player.y <= play.y + EDGE_TOLERANCE) {
    enterInteraction('topAltar');
  } else if (player.y >= play.y + play.height - EDGE_TOLERANCE) {
    enterInteraction('bottomAltar');
  }
}

// ===== ENTER / EXIT INTERACTION =====
function enterInteraction(zoneKey) {
  if (gamePaused) return;

  const zone = ZONES[zoneKey];
  if (!zone || zone.type !== 'interaction') return;

  activeInteractionZone = zoneKey;
  gamePaused = true;

  const overlay = document.getElementById('interaction-overlay');
  const titleEl = document.getElementById('interaction-overlay-title');
  const bodyEl = document.getElementById('interaction-overlay-body');
  if (overlay && titleEl && bodyEl) {
    titleEl.textContent = zone.title;
    bodyEl.textContent = zone.body;
    overlay.style.display = 'flex';
  }
}

function exitInteraction() {
  const overlay = document.getElementById('interaction-overlay');
  if (overlay) overlay.style.display = 'none';

  // nudge the player back off the edge so it doesn't immediately re-trigger
  const play = ZONES.playArea;
  if (activeInteractionZone === 'topAltar') {
    player.y = play.y + EXIT_NUDGE;
  } else if (activeInteractionZone === 'bottomAltar') {
    player.y = play.y + play.height - EXIT_NUDGE;
  }

  activeInteractionZone = null;
  gamePaused = false;
}

// close button click
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('interaction-overlay-close');
  if (closeBtn) closeBtn.addEventListener('click', exitInteraction);
});

// interact key: E or Enter opens the zone at the player's current edge,
// or closes the overlay if one is already open. Escape also closes.
document.addEventListener('keydown', (e) => {
  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    if (gamePaused) {
      exitInteraction();
    } else {
      tryInteract();
    }
  }
  if (e.key === 'Escape' && gamePaused) {
    exitInteraction();
  }
});
