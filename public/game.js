const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const homeBtn = document.getElementById('homeBtn');
const homePanel = document.getElementById('homePanel');
const battlePanel = document.getElementById('battlePanel');
const qCooldownSpan = document.getElementById('QCooldown');
const eCooldownSpan = document.getElementById('ECooldown');
const fCooldownSpan = document.getElementById('FCooldown');
const rCooldownSpan = document.getElementById('RCooldown');
const cCooldownSpan = document.getElementById('CCooldown');
let gameOver = false;

// Game Objects
const player1 = {
  x: 0,
  y: 0,
  size: 10,
  color: 'blue',
  hp: 200,
  maxHp: 200,
  lastHitAt: 0,
  invulnDuration: 150,
};
const projectiles = [];

// Ability settings
let lastFireballTime = 0;
const fireballSpeed = 5;
const fireballCooldown = 150;

let lastPurpleTime = 0;
const purpleCooldown = 10000;

let windWall = null;
let lastWindWallTime = 0;
const windWallDuration = 5000;
const windWallWidth = 10;
const windWallHeight = 75;
const windWallOffset = 50;
const windWallCooldown = 15000;

let lastSuperFireballTime = 0;
const superFireballSpeed = 5;
const superFireballCooldown = 30000;

let lastDashTime = 0;
const dashCooldown = 5000;

player1.x = canvas.width / 2;
player1.y = canvas.height / 20;

let mouseX = 400;
let mouseY = 300;
const keysPressed = {};

function getCooldownText(lastTime, cooldown) {
  if (!lastTime || Date.now() - lastTime >= cooldown) {
    return 'Ready';
  }
  return `${Math.ceil((cooldown - (Date.now() - lastTime)) / 1000)}s`;
}

function updateCooldownHud() {
  if (!qCooldownSpan) return;
  qCooldownSpan.textContent = getCooldownText(lastFireballTime, fireballCooldown);
  eCooldownSpan.textContent = getCooldownText(lastPurpleTime, purpleCooldown);
  fCooldownSpan.textContent = getCooldownText(lastWindWallTime, windWallCooldown);
  rCooldownSpan.textContent = getCooldownText(lastSuperFireballTime, superFireballCooldown);
  cCooldownSpan.textContent = getCooldownText(lastDashTime, dashCooldown);
}

// Input Listeners
window.addEventListener('keydown', (e) => {
  if (!e || !e.key) return;
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  if (!e || !e.key) return;
  keysPressed[e.key.toLowerCase()] = false;

  if (e.key.toLowerCase() === 'q') {
    const elapsed = Date.now() - lastFireballTime;
    if (elapsed >= fireballCooldown) {
      const dx = mouseX - player1.x;
      const dy = mouseY - player1.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0) {
        projectiles.push({
          x: player1.x,
          y: player1.y,
          vx: (dx / distance) * fireballSpeed,
          vy: (dy / distance) * fireballSpeed,
          size: 5,
          color: 'red',
          type: 'fireball',
          owner: 'player1',
        });
        lastFireballTime = Date.now();
      }
    }
  }

  if (e.key.toLowerCase() === 'e') {
    const elapsed = Date.now() - lastPurpleTime;
    if (elapsed >= purpleCooldown) {
      const dx = mouseX - player1.x;
      const dy = mouseY - player1.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0) {
        projectiles.push({
          x: player1.x,
          y: player1.y,
          vx: (dx / distance) * fireballSpeed,
          vy: (dy / distance) * fireballSpeed,
          size: 12,
          color: 'purple',
          type: 'purple',
          owner: 'player1',
        });
        lastPurpleTime = Date.now();
      }
    }
  }

  if (e.key.toLowerCase() === 'f') {
    const elapsed = Date.now() - lastWindWallTime;
    if (elapsed >= windWallCooldown) {
      const dx = mouseX - player1.x;
      const dy = mouseY - player1.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0) {
        const wallX = player1.x + (dx / distance) * windWallOffset;
        const wallY = player1.y + (dy / distance) * windWallOffset;
        const angle = Math.atan2(dy, dx);
        windWall = {
          x: wallX,
          y: wallY,
          width: windWallWidth,
          height: windWallHeight,
          angle,
          createdAt: Date.now(),
          opacity: 0.5,
        };
        lastWindWallTime = Date.now();
      }
    }
  }

  if (e.key.toLowerCase() === 'r') {
    const elapsed = Date.now() - lastSuperFireballTime;
    if (elapsed >= superFireballCooldown) {
      const dx = mouseX - player1.x;
      const dy = mouseY - player1.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0) {
        projectiles.push({
          x: player1.x,
          y: player1.y,
          vx: (dx / distance) * superFireballSpeed,
          vy: (dy / distance) * superFireballSpeed,
          size: 50,
          color: 'red',
          type: 'superFireball',
          owner: 'player1',
        });
        lastSuperFireballTime = Date.now();
      }
    }
  }

  if (e.key.toLowerCase() === 'c') {
    const elapsed = Date.now() - lastDashTime;
    if (elapsed >= dashCooldown) {
      const dx = mouseX - player1.x;
      const dy = mouseY - player1.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0) {
        const dashDistance = Math.min(distance, 75);
        player1.x += (dx / distance) * dashDistance;
        player1.y += (dy / distance) * dashDistance;
        lastDashTime = Date.now();
      }
    }
  }
});

window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function gameLoop() {
  const player1speed = 3;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateCooldownHud();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    const previousX = projectile.x;
    const previousY = projectile.y;
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;

    if (windWall) {
      const dx = projectile.x - windWall.x;
      const dy = projectile.y - windWall.y;
      const cos = Math.cos(-windWall.angle);
      const sin = Math.sin(-windWall.angle);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      if (
        localX > -windWall.width / 2 &&
        localX < windWall.width / 2 &&
        localY > -windWall.height / 2 &&
        localY < windWall.height / 2
      ) {
        if (projectile.type === 'superFireball') {
          windWall = null;
        }
        projectiles.splice(i, 1);
        continue;
      }
    }

    if (projectile.type === 'purple') {
      const halfSize = projectile.size / 2;
      ctx.beginPath();
      ctx.moveTo(projectile.x - halfSize, projectile.y - halfSize);
      ctx.lineTo(projectile.x + halfSize, projectile.y - halfSize);
      ctx.lineTo(projectile.x + halfSize, projectile.y + halfSize);
      ctx.lineTo(projectile.x - halfSize, projectile.y + halfSize);
      ctx.closePath();
      ctx.fillStyle = projectile.color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
      ctx.fillStyle = projectile.color;
      ctx.fill();
    }

    if (projectile.owner !== 'player1') {
      const now = Date.now();
      const canBeHit = now - player1.lastHitAt >= player1.invulnDuration;
      if (canBeHit) {
        const projectileRadius = projectile.type === 'purple' ? projectile.size / 2 : projectile.size;
        const hitRadius = player1.size + projectileRadius;
        const collided = segmentCircleCollision(
          player1.x,
          player1.y,
          hitRadius,
          previousX,
          previousY,
          projectile.x,
          projectile.y
        );
        if (collided) {
          const dmg = projectile.type === 'superFireball' ? 50 : projectile.type === 'purple' ? 30 : 10;
          player1.hp = Math.max(0, player1.hp - dmg);
          player1.lastHitAt = now;
          projectiles.splice(i, 1);
          continue;
        }
      }
    }

    if (
      projectile.x < 0 ||
      projectile.x > canvas.width ||
      projectile.y < 0 ||
      projectile.y > canvas.height
    ) {
      projectiles.splice(i, 1);
    }
  }

  if (player1.hp <= 0 && !gameOver) {
    showGameOver();
  }

  if (gameOver) {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (keysPressed['w']) player1.y -= player1speed;
  if (keysPressed['s']) player1.y += player1speed;
  if (keysPressed['a']) player1.x -= player1speed;
  if (keysPressed['d']) player1.x += player1speed;

  if (player1.x < 0) player1.x = canvas.width;
  else if (player1.x > canvas.width) player1.x = 0;
  if (player1.y < 0) player1.y = canvas.height;
  else if (player1.y > canvas.height) player1.y = 0;

  ctx.beginPath();
  ctx.arc(player1.x, player1.y, player1.size, 0, Math.PI * 2);
  ctx.fillStyle = player1.color;
  ctx.fill();

  const labelPadding = 4;
  const labelText = `HP: ${player1.hp}/${player1.maxHp}`;
  ctx.font = '12px sans-serif';
  const textMetrics = ctx.measureText(labelText);
  const labelWidth = textMetrics.width + labelPadding * 2;
  const labelHeight = 12 + labelPadding * 2;
  const labelX = player1.x - labelWidth / 2;
  const labelY = player1.y - player1.size - labelHeight - 4;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(labelX - 1, labelY - 1, labelWidth + 2, labelHeight + 2);

  const hpRatio = Math.max(0, player1.hp) / player1.maxHp;
  const barW = labelWidth - labelPadding * 2;
  const barH = 8;
  const barX = labelX + labelPadding;
  const barY = labelY + 4;
  ctx.fillStyle = 'gray';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = hpRatio > 0.5 ? 'green' : hpRatio > 0.2 ? 'orange' : 'red';
  ctx.fillRect(barX, barY, barW * hpRatio, barH);

  ctx.fillStyle = 'white';
  ctx.textBaseline = 'top';
  ctx.fillText(labelText, labelX + labelPadding, barY + barH + 2);

  if (windWall) {
    const elapsed = Date.now() - windWall.createdAt;
    if (elapsed >= windWallDuration) {
      windWall = null;
    } else {
      ctx.save();
      ctx.translate(windWall.x, windWall.y);
      ctx.rotate(windWall.angle);
      ctx.globalAlpha = windWall.opacity;
      ctx.fillStyle = 'blue';
      ctx.fillRect(-windWall.width / 2, -windWall.height / 2, windWall.width, windWall.height);
      ctx.strokeStyle = 'lightblue';
      ctx.lineWidth = 3;
      ctx.strokeRect(-windWall.width / 2, -windWall.height / 2, windWall.width, windWall.height);
      ctx.restore();
    }
  }

  requestAnimationFrame(gameLoop);
}

function segmentCircleCollision(cx, cy, radius, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const dx = cx - x1;
  const dy = cy - y1;
  const lenSq = vx * vx + vy * vy;
  if (lenSq === 0) {
    return dx * dx + dy * dy <= radius * radius;
  }
  const t = Math.max(0, Math.min(1, (dx * vx + dy * vy) / lenSq));
  const closestX = x1 + vx * t;
  const closestY = y1 + vy * t;
  const distSq = (cx - closestX) * (cx - closestX) + (cy - closestY) * (cy - closestY);
  return distSq <= radius * radius;
}

function showGameOver() {
  gameOver = true;
  if (gameOverOverlay) {
    gameOverOverlay.style.display = 'flex';
  }
}

function resetGame() {
  gameOver = false;
  player1.hp = player1.maxHp;
  player1.x = canvas.width / 2;
  player1.y = canvas.height / 20;
  player1.lastHitAt = 0;
  projectiles.length = 0;
  windWall = null;
  Object.keys(keysPressed).forEach((key) => {
    keysPressed[key] = false;
  });
  if (gameOverOverlay) {
    gameOverOverlay.style.display = 'none';
  }
}

if (homeBtn) {
  homeBtn.addEventListener('click', () => {
    resetGame();
    canvas.style.display = 'none';
    if (battlePanel) battlePanel.style.display = 'none';
    if (homePanel) homePanel.style.display = 'block';
  });
}

gameLoop();
