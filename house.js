<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Map Demo</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: #000;
    overflow: hidden;
  }

  /* ===== MAP CONTAINER ===== */
  /* Fixed aspect ratio matching the source image (1024 x 1536, portrait 2:3) */
  #map-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  #map-stage {
    position: relative;
    height: 100%;
    aspect-ratio: 1024 / 1536;
    max-width: 100%;
    margin-top: 5%;
    background-image: url('assets/map/map_bg.png');
    background-size: cover;
    background-position: center;
  }

  /* ===== ON-MAP PLAYER CHARACTER ===== */
  #map-player-sprite {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 84px;
    height: 84px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 5;
  }

  #map-player-sprite .sprite-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.15s ease;
  }

  /* ===== HOUSESTART ===== */
  #HouseStart {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 195px;
    height: 195px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10;
  }

  #HouseStart-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* ===== ZONE NAME / DESCRIPTION LABEL ===== */
  #zone-label {
    display: none;
    position: absolute;
    left: 50%;
    bottom: calc(15% + 90px);
    transform: translateX(-50%);
    z-index: 60;
    text-align: center;
    pointer-events: none;
  }

  #zone-label-name {
    font-family: sans-serif;
    font-weight: bold;
    font-size: 15px;
    color: #d9fffb;
    text-shadow: 0 0 6px rgba(120, 230, 220, 0.8);
  }

  #zone-label-desc {
    margin-top: 2px;
    font-family: sans-serif;
    font-size: 11px;
    color: rgba(217, 255, 251, 0.7);
  }

  /* ===== ZONE INTERACTION PROMPT — floating magic rune button ===== */
  #zone-prompt {
    display: none;
    position: absolute;
    left: 50%;
    bottom: 15%;
    transform: translateX(-50%);
    z-index: 60;
    width: 76px;
    height: 76px;
    cursor: pointer;
    animation: zone-prompt-float 2.6s ease-in-out infinite;
  }

  #zone-prompt .rune-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      rgba(120, 230, 220, 0.9),
      rgba(180, 140, 255, 0.7),
      rgba(120, 230, 220, 0.9)
    );
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
            mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
    animation: zone-prompt-spin 4s linear infinite;
  }

  #zone-prompt .rune-core {
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 40%, rgba(30, 60, 58, 0.95), rgba(6, 14, 13, 0.97));
    box-shadow:
      0 0 10px rgba(120, 230, 220, 0.55),
      0 0 22px rgba(120, 230, 220, 0.35),
      inset 0 0 12px rgba(120, 230, 220, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: zone-prompt-pulse 2.2s ease-in-out infinite;
    transition: box-shadow 0.25s ease, background 0.25s ease;
  }

  #zone-prompt .rune-label {
    font-family: sans-serif;
    font-weight: bold;
    font-size: 11px;
    letter-spacing: 0.5px;
    color: #d9fffb;
    text-shadow: 0 0 6px rgba(120, 230, 220, 0.8);
    pointer-events: none;
  }

  #zone-prompt:hover {
    animation-play-state: running;
  }

  #zone-prompt:hover .rune-ring {
    animation-duration: 1.4s;
  }

  #zone-prompt:hover .rune-core {
    box-shadow:
      0 0 16px rgba(120, 230, 220, 0.85),
      0 0 34px rgba(180, 140, 255, 0.55),
      inset 0 0 16px rgba(120, 230, 220, 0.4);
  }

  #zone-prompt:active .rune-core {
    box-shadow:
      0 0 8px rgba(120, 230, 220, 0.9),
      inset 0 0 10px rgba(120, 230, 220, 0.5);
  }

  @keyframes zone-prompt-float {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%      { transform: translateX(-50%) translateY(-10px); }
  }

  @keyframes zone-prompt-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes zone-prompt-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.06); }
  }

  /* ===== ZONE OVERLAY ===== */
  #zone-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    z-index: 100;
    align-items: center;
    justify-content: center;
  }

  #zone-overlay-box {
    width: 80%;
    max-width: 360px;
    background: #0d1a18;
    border: 1px solid rgba(120, 230, 220, 0.6);
    border-radius: 10px;
    padding: 24px 20px;
    text-align: center;
    color: #d9fffb;
    font-family: sans-serif;
  }

  #zone-overlay-title {
    margin: 0 0 12px;
    font-size: 20px;
  }

  #zone-overlay-box p {
    margin: 0 0 20px;
    font-size: 13px;
    color: rgba(217, 255, 251, 0.7);
  }

  #zone-overlay-close {
    background: rgba(120, 230, 220, 0.15);
    border: 1px solid rgba(120, 230, 220, 0.8);
    border-radius: 6px;
    color: #d9fffb;
    font-family: sans-serif;
    font-size: 13px;
    padding: 8px 18px;
    cursor: pointer;
  }
</style>
</head>
<body>

<div id="map-container">
  <div id="map-stage">
    <div id="HouseStart">
      <img id="HouseStart-img" alt="house">
    </div>

    <div id="map-player-sprite">
      <img id="map-player-sprite-a" class="sprite-layer" alt="player">
      <img id="map-player-sprite-b" class="sprite-layer" alt="player" style="opacity:0;">
    </div>

    <div id="zone-label">
      <div id="zone-label-name"></div>
      <div id="zone-label-desc"></div>
    </div>

    <div id="zone-prompt" onclick="handleInteractPress()">
      <div class="rune-ring"></div>
      <div class="rune-core"><span class="rune-label">E</span></div>
    </div>
  </div>
</div>

<div id="zone-overlay">
  <div id="zone-overlay-box">
    <h2 id="zone-overlay-title">Zone</h2>
    <p>Overlay content placeholder.</p>
    <button id="zone-overlay-close" onclick="closeZoneOverlay()">Close (E)</button>
  </div>
</div>

<script>
  async function loadHud() {
    const res = await fetch('index.html');
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // pull index.html's <style> block into this page
    const sourceStyle = doc.querySelector('style');
    if (sourceStyle) {
      const styleEl = document.createElement('style');
      styleEl.textContent = sourceStyle.textContent;
      document.head.appendChild(styleEl);
    }

    // pull index.html's #game-page (HUD + controller + special button) and
    // overlay it on top of the map stage instead of the blank body it uses in index.html
    const gamePage = doc.getElementById('game-page');
    gamePage.style.position = 'absolute';
    gamePage.style.top = '0';
    gamePage.style.left = '0';
    gamePage.style.zIndex = '50';
    document.body.appendChild(gamePage);

    // load movement.js the normal way
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'movement.js';
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });

    // load house.js
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'house.js';
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });

    // run index.html's inline <script> (hudState, renderHud, event wiring, etc.)
    doc.querySelectorAll('script:not([src])').forEach((src) => {
      const scriptEl = document.createElement('script');
      scriptEl.textContent = src.textContent;
      document.body.appendChild(scriptEl);
    });
  }

  loadHud();
  document.getElementById('map-player-sprite-a').src = 'assets/player/idle.png';

  function updateMapPlayerPosition() {
    const wrapperEl = document.getElementById('map-player-sprite');
    if (typeof player !== 'undefined' && wrapperEl && typeof gameFrozen !== 'undefined' && !gameFrozen) {
      wrapperEl.style.left = player.x + '%';
      wrapperEl.style.top = player.y + '%';

      const isFacingRight = player.direction === 'right';
      const spriteDirection = isFacingRight ? 'left' : player.direction;

      const content = player.effect
        ? EFFECTS[player.effect][player.effectFrame]
        : player.state === 'idle'
          ? IDLE_SPRITE
          : SPRITES[spriteDirection][player.state][player.frameIndex];

      if (typeof crossfadeSprite === 'function') {
        crossfadeSprite('map-player-sprite', content, isFacingRight);
      }
    }
    requestAnimationFrame(updateMapPlayerPosition);
  }
  updateMapPlayerPosition();
</script>

</body>
</html>
