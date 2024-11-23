// Select the canvas and set up the context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Player properties
const player = {
  x: 50,
  y: canvas.height - 100,
  width: 30,
  height: 50,
  color: "red",
  speed: 5,
  dx: 0,
  dy: 0,
  gravity: 0.5,
  jumpPower: -10,
  isJumping: false,
};

// Platforms
const platforms = [
  { x: 0, y: canvas.height - 20, width: canvas.width, height: 20, color: "green" },
  { x: 200, y: 300, width: 100, height: 20, color: "green" },
];

// Moving platforms
const movingPlatforms = [
  { x: 300, y: 250, width: 100, height: 20, speed: 2, direction: 1 },
];

// Coins
const coins = [
  { x: 220, y: 270, radius: 8, collected: false },
];

// Enemies
const enemies = [
  { x: 300, y: canvas.height - 70, width: 30, height: 30, speed: 2, direction: 1 },
];

// Scoring and level
let score = 0;
let level = 1;

// Global dynamics
let gravity = 0.5;
let levelGravityIncrement = 0.1;

// Sounds
const jumpSound = new Audio("jump.mp3");
const coinSound = new Audio("coin.mp3");
const gameOverSound = new Audio("gameover.mp3");

// Draw player
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw platforms
function drawPlatforms() {
  platforms.forEach((platform) => {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

// Draw moving platforms
function drawMovingPlatforms() {
  movingPlatforms.forEach((platform) => {
    ctx.fillStyle = "blue";
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

// Move moving platforms
function moveMovingPlatforms() {
  movingPlatforms.forEach((platform) => {
    platform.x += platform.speed * platform.direction;

    if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
      platform.direction *= -1;
    }
  });
}

// Draw coins
function drawCoins() {
  coins.forEach((coin) => {
    if (!coin.collected) {
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fillStyle = "gold";
      ctx.fill();
      ctx.closePath();
    }
  });
}

// Draw enemies
function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.fillStyle = "purple";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

// Move enemies
function moveEnemies() {
  enemies.forEach((enemy) => {
    enemy.x += enemy.speed * enemy.direction;

    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
      enemy.direction *= -1;
    }
  });
}

// Move player
function movePlayer() {
  player.x += player.dx;
  player.y += player.dy;
  player.dy += gravity;

  platforms.concat(movingPlatforms).forEach((platform) => {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height <= platform.y &&
      player.y + player.height + player.dy >= platform.y
    ) {
      player.dy = 0;
      player.isJumping = false;
    }
  });

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  if (player.y > canvas.height) {
    playSound(gameOverSound);
    resetGame();
  }
}

// Check for coin collection
function checkCoinCollection() {
  coins.forEach((coin) => {
    if (
      !coin.collected &&
      player.x < coin.x + coin.radius &&
      player.x + player.width > coin.x - coin.radius &&
      player.y < coin.y + coin.radius &&
      player.y + player.height > coin.y - coin.radius
    ) {
      coin.collected = true;
      score += 10;
      playSound(coinSound);
    }
  });
}

// Check for enemy collision
function checkEnemyCollision() {
  enemies.forEach((enemy) => {
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      playSound(gameOverSound);
      resetGame();
    }
  });
}

// Level up logic
function checkLevelUp() {
  if (coins.every((coin) => coin.collected)) {
    level++;
    player.x = 50;
    player.y = canvas.height - 100;

    platforms.push({ 
      x: Math.random() * (canvas.width - 100), 
      y: Math.random() * (canvas.height - 150), 
      width: Math.random() * 50 + 50, 
      height: 20, 
      color: "green" 
    });

    movingPlatforms.push({
      x: Math.random() * (canvas.width - 100),
      y: Math.random() * (canvas.height - 150),
      width: 100,
      height: 20,
      speed: Math.random() * 2 + 1,
      direction: Math.random() > 0.5 ? 1 : -1,
    });

    coins.push({
      x: Math.random() * (canvas.width - 50) + 25,
      y: Math.random() * (canvas.height - 200) + 50,
      radius: 8,
      collected: false,
    });

    enemies.push({
      x: Math.random() * canvas.width,
      y: canvas.height - Math.random() * 150,
      width: 30,
      height: 30,
      speed: Math.random() * 2 + 2,
      direction: Math.random() > 0.5 ? 1 : -1,
    });

    enemies.forEach((enemy) => (enemy.speed += 1));
    gravity += levelGravityIncrement;
  }
}

// Reset the game
function resetGame() {
  player.x = 50;
  player.y = canvas.height - 100;
  score = 0;
  level = 1;
  coins.forEach((coin) => (coin.collected = false));
}

// Play sound
function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

// Display score and level
function displayInfo() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Level: ${level}`, 10, 50);
}

// Key event handlers
function handleKeyDown(e) {
  if (e.key === "ArrowRight") player.dx = player.speed;
  if (e.key === "ArrowLeft") player.dx = -player.speed;
  if (e.key === " " && !player.isJumping) {
    player.dy = player.jumpPower;
    player.isJumping = true;
    playSound(jumpSound);
  }
}

function handleKeyUp(e) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") player.dx = 0;
}

// Update the game
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlatforms();
  drawMovingPlatforms();
  moveMovingPlatforms();

  drawCoins();
  drawEnemies();
  drawPlayer();

  moveEnemies();
  movePlayer();

  checkCoinCollection();
  checkEnemyCollision();
  checkLevelUp();
  displayInfo();

  requestAnimationFrame(update);
}

// Event listeners
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Start the game
update();
