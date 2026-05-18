const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const player1 = { x: 0, y: 0, size: 10, color: 'blue', hp: 200, maxHp: 200, class: 0, lastHitAt: 0, invulnDuration: 500 }; 
// Test player2 (can launch Q/E/R-like attacks using keys 1/2/3)
const player2 = { x: canvas.width - 100, y: canvas.height / 2, size: 10, color: 'red', id: 'player2' };
const projectiles = [];

//fireball q
let lastFireballTime = 0; // Track last fireball shot time
const fireballSpeed = 5;
const fireballCooldown = 150;

// Purple E
const purpleCooldown = 10000;
let lastPurpleTime = 0; // Track last purple square ability time
//e stun duration 1.5seconds

//WindaWall F
let windWall = null; 
let lastWindWallTime = 0; // Track last wind wall placement time
const windWallDuration = 5000; 
const windWallWidth = 10; 
const windWallHeight = 75;
const windWallOffset = 50; // Distance in front of player to spawn the wall
const windWallCooldown = 15000;
//15 secs

//Super Fireball R
let lastSuperFireballTime = 0;
const superFireballSpeed = 5;
const superFireballCooldown = 30000;

//Dash C
let lastDashTime = 0;
const dashCooldown = 5000;

//20 seconds or 30 seconds

player1.x =  canvas.width /2 
player1.y = canvas.height /20

// Track the mouse position
let mouseX = 400;
let mouseY = 300;
const keysPressed = {};

//Total player hp: 200.
//Fireball = 10 dmg
//Purple Square = 30 dmg
//SuperFireball = 50 dmg 
//Windwall = 0 dmg
//Dash = 0 dmg




// Input Listeners
window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Correct mouse position scales based on actual internal pixels vs display size
    mouseX = e.clientX - rect.left ;
    mouseY = e.clientY - rect.top;
});


window.addEventListener('keyup', (e) => {
    // Detect 'q' key press to shoot  fireballs
    if (e.key.toLowerCase() === 'q') {
        let canSpawnFireball = true;

        // Check if fireball cooldown has passed
        let TimeSinceLastShot = Date.now() - lastFireballTime;
        
        if (TimeSinceLastShot < fireballCooldown) {
            canSpawnFireball = false; // Still on cooldown
        }

        const dx = mouseX - player1.x;
        const dy = mouseY - player1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && canSpawnFireball) {
            projectiles.push({
                x: player1.x,
                y: player1.y,
                vx: (dx / distance) * fireballSpeed,
                vy: (dy / distance) * fireballSpeed,
                size: 5,
                color: 'red',
                type: 'fireball',
                owner: 'player1'
            });
            lastFireballTime = Date.now(); // Update last shot time
        }
    }

    // Detect 'e' key press for purple square ability (Morgana Q style)
    if (e.key.toLowerCase() === 'e') {
        const timeSinceLastPurple = Date.now() - lastPurpleTime;
        const canSpawnPurple = timeSinceLastPurple >= purpleCooldown;

        const dx = mouseX - player1.x;
        const dy = mouseY - player1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && canSpawnPurple) {
            projectiles.push({
                x: player1.x,
                y: player1.y,
                vx: (dx / distance) * fireballSpeed,
                vy: (dy / distance) * fireballSpeed,
                size: 12,
                color: 'purple',
                type: 'purple',
                owner: 'player1'
            });
            lastPurpleTime = Date.now();
        }
    }

    // Detect 'f' key press to create Wind Wall (Yasuo's ability)
    if (e.key.toLowerCase() === 'f') {
        const timeSinceLastWall = Date.now() - lastWindWallTime;
        const canSpawnWall = timeSinceLastWall >= windWallCooldown;

        // Calculate direction from player to mouse
        const dx = mouseX - player1.x;
        const dy = mouseY - player1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction and offset the wall spawn position
        if (distance > 0 && canSpawnWall) {
            const wallX = player1.x + (dx / distance) * windWallOffset;
            const wallY = player1.y + (dy / distance) * windWallOffset;
            const angle = Math.atan2(dy, dx); // Calculate angle
            
            windWall = {
                x: wallX,
                y: wallY,
                width: windWallWidth,
                height: windWallHeight,
                angle: angle, // Store the angle
                createdAt: Date.now(),
                opacity: 0.5
            };
            lastWindWallTime = Date.now();
        }
    }

    // Detect 'R' key press to shoot super Fireballs
    if (e.key.toLowerCase() === 'r') {
        let canSpawnSuperFireball = true;

        // Check if fireball cooldown has passed
        let TimeSinceLastSuperFireball = Date.now() - lastSuperFireballTime;
        
        if (TimeSinceLastSuperFireball < superFireballCooldown) {
            canSpawnSuperFireball = false; // Still on cooldown
        }

        const dx = mouseX - player1.x;
        const dy = mouseY - player1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && canSpawnSuperFireball) {
            projectiles.push({
                x: player1.x,
                y: player1.y,
                vx: (dx / distance) * superFireballSpeed,
                vy: (dy / distance) * superFireballSpeed,
                size: 50,
                color: 'red',
                type: 'superFireball',
                owner: 'player1'
            });
            lastSuperFireballTime = Date.now(); // Update last shot time
        }
    }

    //Detect "c" key press to dash
    if (e.key.toLowerCase() === 'c') {
        let canDash = true;

        // Check if dash cooldown has passed
        let TimeSinceLastDash = Date.now() - lastDashTime;
        
        if (TimeSinceLastDash < dashCooldown) {
            canDash = false; // Still on cooldown
        }

        const dx = mouseX - player1.x;
        const dy = mouseY - player1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (canDash) {
            // Cap dash distance at 75 pixels
            const dashDistance = Math.min(distance, 75);
            
            if (distance > 0) {
                // Normalize direction and apply dash distance
                player1.x += (dx / distance) * dashDistance;
                player1.y += (dy / distance) * dashDistance;
                lastDashTime = Date.now();
            }
        }
    }

        // Test Player2 controls: keys 1 (Q/fireball), 2 (E/purple), 3 (R/super)
        if (e.key === '1') {
            // fireball from player2 towards player1
            const dx2 = player1.x - player2.x;
            const dy2 = player1.y - player2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (dist2 > 0) {
                projectiles.push({
                    x: player2.x,
                    y: player2.y,
                    vx: (dx2 / dist2) * fireballSpeed,
                    vy: (dy2 / dist2) * fireballSpeed,
                    size: 5,
                    color: 'red',
                    type: 'fireball',
                    owner: 'player2'
                });
            }
        }

        if (e.key === '2') {
            // purple from player2 towards player1
            const dx2 = player1.x - player2.x;
            const dy2 = player1.y - player2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (dist2 > 0) {
                projectiles.push({
                    x: player2.x,
                    y: player2.y,
                    vx: (dx2 / dist2) * fireballSpeed,
                    vy: (dy2 / dist2) * fireballSpeed,
                    size: 12,
                    color: 'purple',
                    type: 'purple',
                    owner: 'player2'
                });
            }
        }

        if (e.key === '3') {
            // super fireball from player2 towards player1
            const dx2 = player1.x - player2.x;
            const dy2 = player1.y - player2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (dist2 > 0) {
                projectiles.push({
                    x: player2.x,
                    y: player2.y,
                    vx: (dx2 / dist2) * superFireballSpeed,
                    vy: (dy2 / dist2) * superFireballSpeed,
                    size: 50,
                    color: 'red',
                    type: 'superFireball',
                    owner: 'player2'
                });
            }
        }

});


// Game Loop
function gameLoop() {
    const player1speed = 3;

    
    // 1. Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Update and Draw Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;

        // Check collision with wind wall of SuperFireball and Fireball
        if (windWall) {

            if(projectile.type === 'superFireball') {
                
                const dx = projectile.x - windWall.x;
                const dy = projectile.y - windWall.y;
                
                // Rotate projectile position back to wall's local space
                const cos = Math.cos(-windWall.angle);
                const sin = Math.sin(-windWall.angle);
                const localX = dx * cos - dy * sin;
                const localY = dx * sin + dy * cos;
                
                // Check collision with rotated rectangle
                if (localX > -windWall.width / 2  && 
                    localX < windWall.width / 2  && 
                    localY > -windWall.height / 2  && 
                    localY < windWall.height / 2 ) {
                    windWall = null;
                    projectiles.splice(i, 1);
                    
                    continue;
                }
            } else {
                const dx = projectile.x - windWall.x;
                const dy = projectile.y - windWall.y;
                
                // Rotate projectile position back to wall's local space
                const cos = Math.cos(-windWall.angle);
                const sin = Math.sin(-windWall.angle);
                const localX = dx * cos - dy * sin;
                const localY = dx * sin + dy * cos;
                
                // Check collision with rotated rectangle
                if (localX > -windWall.width / 2  && 
                    localX < windWall.width / 2  && 
                    localY > -windWall.height / 2  && 
                    localY < windWall.height / 2 ) {
                    projectiles.splice(i, 1);
                    continue;
                }
            }
            
        }

        //Check Collision for Purple
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

        //Check Collision of ability with player

        if (player1) {
            // Don't allow player to be hit by their own projectiles.
            if (projectile.owner && projectile.owner === 'player1') {
                // skip collision with own projectile
            } else {
                const now = Date.now();
                const canBeHit = now - (player1.lastHitAt || 0) >= (player1.invulnDuration || 0);

                if (canBeHit) {
                    // Purple is a square (rendered centered)
                    if (projectile.type === 'purple') {
                        const halfSize = projectile.size / 2;
                        const rectX = projectile.x - halfSize;
                        const rectY = projectile.y - halfSize;
                        const rectW = projectile.size;
                        const rectH = projectile.size;

                        // Closest point from circle center to rectangle
                        const closestX = Math.max(rectX, Math.min(player1.x, rectX + rectW));
                        const closestY = Math.max(rectY, Math.min(player1.y, rectY + rectH));
                        const dxp = player1.x - closestX;
                        const dyp = player1.y - closestY;

                        if (dxp * dxp + dyp * dyp <= player1.size * player1.size) {
                            const dmg = 30;
                            player1.hp = Math.max(0, player1.hp - dmg);
                            player1.lastHitAt = now;
                            projectiles.splice(i, 1);
                            console.log('Player hit by purple. HP:', player1.hp);
                            continue;
                        }

                    } else {
                        // fireball and superFireball are circles
                        const dxp = projectile.x - player1.x;
                        const dyp = projectile.y - player1.y;
                        const distSq = dxp * dxp + dyp * dyp;
                        const hitRadius = projectile.size + player1.size;

                        if (distSq <= hitRadius * hitRadius) {
                            const dmg = projectile.type === 'superFireball' ? 50 : 10;
                            player1.hp = Math.max(0, player1.hp - dmg);
                            player1.lastHitAt = now;
                            projectiles.splice(i, 1);
                            console.log('Player hit by', projectile.type, 'HP:', player1.hp);
                            continue;
                        }
                    }
                }
            }
        }

        if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    // Update player1 and player2 movement

    if (keysPressed['w']) player1.y -= player1speed;
    if (keysPressed['s']) player1.y += player1speed;
    if (keysPressed['a']) player1.x -= player1speed;
    if (keysPressed['d']) player1.x += player1speed;

    //Map boundaries
    if(player1.x < 0) {
        player1.x = canvas.width
    } else if(player1.x > canvas.width) {
        player1.x = 0
    } else if(player1.y < 0) {
        player1.y = canvas.height
    } else if(player1.y > canvas.height) {
        player1.y = 0
    }  

    
    // 3. Draw player1 and player 2
    ctx.beginPath();
    ctx.arc(player1.x, player1.y, player1.size, 0, Math.PI * 2);
    ctx.fillStyle = player1.color;
    ctx.fill();

    // Draw floating HP label above the player
    const labelPadding = 4;
    const labelText = 'HP: ' + player1.hp + '/' + player1.maxHp;
    ctx.font = '12px sans-serif';
    const textMetrics = ctx.measureText(labelText);
    const labelWidth = textMetrics.width + labelPadding * 2;
    const labelHeight = 12 + labelPadding * 2;
    const labelX = player1.x - labelWidth / 2;
    const labelY = player1.y - player1.size - labelHeight - 4; // 4px gap above player

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(labelX - 1, labelY - 1, labelWidth + 2, labelHeight + 2);

    // Small HP bar inside the label
    const hpRatio = Math.max(0, player1.hp) / (player1.maxHp || 1);
    const barW = labelWidth - labelPadding * 2;
    const barH = 8;
    const barX = labelX + labelPadding;
    const barY = labelY + 4;
    ctx.fillStyle = 'gray';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? 'green' : (hpRatio > 0.2 ? 'orange' : 'red');
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // Text
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.fillText(labelText, labelX + labelPadding, barY + barH + 2);

    // Draw test player2
    ctx.beginPath();
    ctx.arc(player2.x, player2.y, player2.size, 0, Math.PI * 2);
    ctx.fillStyle = player2.color;
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('P2', player2.x, player2.y - player2.size - 12);

    // Draw control hint (top-right)
    ctx.textAlign = 'right';
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('P2 shoot: 1=Q 2=E 3=R', canvas.width - 10, 10);


    // 4. Draw Wind Wall and check if it expired
    if (windWall) {
        
        //example: Date.now is 10 minutes and windwall is 5 minutes so elapsed will be 5 minutes
        const elapsed = Date.now() - windWall.createdAt;
        //So the remaning time will be how long the windwall stays minus  elapsed, so if elapsed = windWallDuration then the wall disapears
        const remainingTime = windWallDuration - elapsed;

        if (remainingTime <= 0 ) {
            // Wall expired, remove it
            windWall = null;

        } else {
            // Draw the wind wall
            ctx.save();
            ctx.translate(windWall.x, windWall.y); // Move to wall position
            ctx.rotate(windWall.angle); // Rotate to face direction
            ctx.globalAlpha = windWall.opacity;
            ctx.fillStyle = 'blue';
            ctx.fillRect(
                -windWall.width / 2,
                -windWall.height / 2,
                windWall.width,
                windWall.height
            );
            ctx.strokeStyle = 'lightblue';
            ctx.lineWidth = 3;
            ctx.strokeRect(
                -windWall.width / 2,
                -windWall.height / 2,   
                windWall.width,
                windWall.height
            );
            ctx.restore();
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
