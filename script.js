// Select canvas and set up context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Game state
let score = 0;
let level = 1;
let gameSpeed = 1;

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

// Game objects
const platforms = [
  { x: 0, y: canvas.height - 20, width: canvas.width, height: 20, color: "green" },
  { x: 200, y: 300, width: 100, height: 20, color: "green" },
];
const movingPlatforms = [
  { x: 300, y: 250, width: 100, height: 20, speed: 2, direction: 1 },
];
const coins = [{ x: 220, y: 270, radius: 8, collected: false }];
const enemies = [{ x: 300, y: canvas.height - 70, width: 30, height: 30, speed: 2, direction: 1 }];

// Functions to draw and update game objects
function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawCircle(obj) {
  if (!obj.collected) {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
    ctx.fillStyle = "gold";
    ctx.fill();
    ctx.closePath();
  }
}

function moveObjects(objects, key, direction, limit) {
  objects.forEach((obj) => {
    obj[key] += obj.speed * direction;
    if (obj[key] <= 0 || obj[key] + obj.width >= limit) obj.direction *= -1;
  });
}

// Player Movement
function movePlayer() {
  player.x += player.dx;
  player.y += player.dy;
  player.dy += player.gravity;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  if (player.y > canvas.height) resetGame();
}

// Efficient Collision Detection
function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Check Collisions
function checkCollisions() {
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

  coins.forEach((coin) => {
    if (!coin.collected && isColliding(player, { ...coin, width: coin.radius * 2, height: coin.radius * 2 })) {
      coin.collected = true;
      score += 10;
    }
  });

  enemies.forEach((enemy) => {
    if (isColliding(player, enemy)) resetGame();
  });
}

// Level Up
function checkLevelUp() {
  if (coins.every((coin) => coin.collected)) {
    level++;
    gameSpeed += 0.2;
    player.speed += 0.5;
    player.jumpPower -= 0.5;
    player.gravity += 0.05;

    platforms.push({
      x: Math.random() * (canvas.width - 100),
      y: Math.random() * (canvas.height - 150),
      width: Math.random() * 50 + 50,
      height: 20,
      color: "green",
    });

    movingPlatforms.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - 100,
      width: 100,
      height: 20,
      speed: Math.random() * 2 + 1,
      direction: Math.random() > 0.5 ? 1 : -1,
    });

    coins.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 8,
      collected: false,
    });

    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - 50,
      width: 30,
      height: 30,
      speed: Math.random() * 2 + 1,
      direction: Math.random() > 0.5 ? 1 : -1,
    });
  }
}

// Reset Game
function resetGame() {
  score = 0;
  level = 1;
  gameSpeed = 1;
  player.x = 50;
  player.y = canvas.height - 100;
  player.speed = 5;
  player.jumpPower = -10;
  player.gravity = 0.5;
  coins.forEach((coin) => (coin.collected = false));
}

// Draw Info
function drawInfo() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Level: ${level}`, 10, 40);
}

// Update Game
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawInfo();
  drawRect(player);
  platforms.forEach(drawRect);
  movingPlatforms.forEach(drawRect);
  coins.forEach(drawCircle);
  enemies.forEach(drawRect);

  movePlayer();
  moveObjects(movingPlatforms, "x", "direction", canvas.width);
  moveObjects(enemies, "x", "direction", canvas.width);

  checkCollisions();
  checkLevelUp();

  requestAnimationFrame(update);
}

// Event Handlers
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") player.dx = player.speed;
  if (e.key === "ArrowLeft") player.dx = -player.speed;
  if (e.key === " " && !player.isJumping) {
    player.dy = player.jumpPower;
    player.isJumping = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") player.dx = 0;
});

// Start Game
update();
