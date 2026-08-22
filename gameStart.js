// ===== GAMESTART.JS =====
// Owns the round-start sequence:
//   1. #game-start-screen shows (title + "click anywhere to start"),
//      gameFrozen = true so the player can't move/act underneath it.
//   2. One click anywhere on that overlay dismisses it and starts the
//      existing 3-2-1 countdown on #game-start-countdown.
//   3. Countdown hits 0 -> startALevelEnemies() runs and gameFrozen is
//      set back to false — player stays frozen for the ENTIRE sequence
//      (title screen + countdown), not just the title screen alone.
//
// gameFrozen is declared in movement.js (loaded before this file) and is
// already checked throughout movement.js's input handling — reusing it
// here means no new freeze logic needed anywhere else.
//
// enemylevels/Alevelenemy.js must be loaded BEFORE this file (see
// map.html's loadHud()) since this calls startALevelEnemies() directly.

const GAME_START_COUNTDOWN_SECONDS = 3;

function runGameStartCountdown() {
  let count = GAME_START_COUNTDOWN_SECONDS;
  const el = document.getElementById('game-start-countdown');

  if (el) {
    el.style.display = 'flex';
    el.textContent = String(count);
  }

  const countdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      if (el) el.textContent = String(count);
    } else {
      clearInterval(countdownTimer);
      if (el) el.style.display = 'none';
      startALevelEnemies();
      gameFrozen = false;
    }
  }, 1000);
}

function showGameStartScreen() {
  gameFrozen = true;

  const screenEl = document.getElementById('game-start-screen');
  if (!screenEl) {
    // no title screen in the DOM (e.g. loaded outside map.html) — fall
    // back to the countdown running immediately, same as before
    runGameStartCountdown();
    return;
  }

  screenEl.style.display = 'flex';
  screenEl.addEventListener('click', function onStartClick() {
    screenEl.removeEventListener('click', onStartClick);
    screenEl.style.display = 'none';
    runGameStartCountdown();
  });
}

showGameStartScreen();
