const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const player1 = { x: 0, y: 0, size: 10, color: 'blue' }; 

const projectiles = [];

//fireball q
let lastFireballTime = 0; // Track last fireball shot time
const fireballSpeed = 5;
const fireballCooldown = 150;

// Purple E
const purpleCooldown = 10000;
let lastPurpleTime = 0; // Track last purple square ability time
//morgrana stun duration 2seconds

//WindaWall F
let windWall = null; 
let lastWindWallTime = 0; // Track last wind wall placement time
const windWallDuration = 5000; 
const windWallWidth = 10; 
const windWallHeight = 75;
const windWallOffset = 50; // Distance in front of player to spawn the wall
const windWallCooldown = 15000;




player1.x =  canvas.width /2 
player1.y = canvas.height /20



// Track the mouse position
let mouseX = 400;
let mouseY = 300;
const keysPressed = {};



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
                type: 'fireball'
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
                type: 'purple'
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

        // Check collision with wind wall
        if (windWall) {
            const dx = projectile.x - windWall.x;
            const dy = projectile.y - windWall.y;
            
            // Rotate projectile position back to wall's local space
            const cos = Math.cos(-windWall.angle);
            const sin = Math.sin(-windWall.angle);
            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;
            
            // Check collision with rotated rectangle
            if (localX > -windWall.width / 2 && 
                localX < windWall.width / 2 && 
                localY > -windWall.height / 2 && 
                localY < windWall.height / 2) {
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

        if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    // Update player1 and player2 movement

        if (keysPressed['w']) player1.y -= player1speed;
        if (keysPressed['s']) player1.y += player1speed;
        if (keysPressed['a']) player1.x -= player1speed;
        if (keysPressed['d']) player1.x += player1speed;

    
    // 3. Draw player1 and player 2
    ctx.beginPath();
    ctx.arc(player1.x, player1.y, player1.size, 0, Math.PI * 2);
    ctx.fillStyle = player1.color;
    ctx.fill();


    // 4. Draw Wind Wall and check if it expired
    if (windWall) {
        
        //example: Date.now is 10 minutes and windwall is 5 minutes so elapsed will be 5 minutes
        const elapsed = Date.now() - windWall.createdAt;
        //So the remaning time will be how long the windwall stays minus  elapsed, so if elapsed = windWallDuration then the wall disapears
        const remainingTime = windWallDuration - elapsed;

        if (remainingTime <= 0) {
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
