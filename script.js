/* ========== Canvas setup ========== */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const resizeCanvas = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ========== Element references ========== */
const startMenu   = document.getElementById('startMenu');
const hud         = document.getElementById('hud');
const scoreEl     = document.getElementById('score');
const timerEl     = document.getElementById('timer');
const pauseBtn    = document.getElementById('pauseBtn');
const playBtn     = document.getElementById('playBtn');
const backGameBtn = document.getElementById('backGameBtn');

const gameOverEl  = document.getElementById('gameOver');
const finalScore  = document.getElementById('finalScore');
const restartBtn  = document.getElementById('restartBtn');
const backBtn     = document.getElementById('backBtn');

/* ========== Game state ========== */
let butterflies = [];
let score = 0;
let timeLeft = 0;
let gameRunning = false;
let gameStarted = false;
let selectedDuration = 0;

/* ========== Helpers ========== */
const rand = (a,b) => Math.random() * (b - a) + a;

function createButterfly() {
  const size = 50;
  const angle = rand(0, Math.PI * 2);
  const speed = rand(1.5, 4);
  return {
    x: rand(size, canvas.width - size),
    y: rand(size, canvas.height - size),
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    size,
    color: `hsl(${rand(0, 360)}, 80%, 60%)`
  };
}

function drawButterfly(b) {
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.ellipse(b.x,     b.y, 20, 10,  Math.PI / 4, 0, Math.PI * 2);
  ctx.ellipse(b.x + 10, b.y, 20, 10, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
}

function setTimerText() {
  const m = Math.floor(timeLeft / 60);
  const s = (timeLeft % 60).toString().padStart(2, '0');
  timerEl.textContent = `Time: ${m}:${s}`;
}

/* ========== Start‑menu logic ========== */
startMenu.addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  selectedDuration = parseInt(e.target.dataset.min, 10) * 60;
  startGame();
});

function startGame() {
  /* reset */
  butterflies = [createButterfly(), createButterfly(), createButterfly()];
  score = 0;
  scoreEl.textContent = 'Score: 0';
  timeLeft = selectedDuration;
  setTimerText();

  startMenu.style.display = 'none';
  hud.style.visibility = 'visible';
  pauseBtn.style.display = 'inline';
  playBtn.style.display = 'none';
  gameOverEl.style.visibility = 'hidden';

  gameRunning = true;
  gameStarted = true;
}

/* ========== Main loop ========== */
function gameLoop() {
  if (gameRunning) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    butterflies.forEach(b => {
      b.x += b.dx;
      b.y += b.dy;
      if (b.x < 0 || b.x > canvas.width)  b.dx *= -1;
      if (b.y < 0 || b.y > canvas.height) b.dy *= -1;
      drawButterfly(b);
    });
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();

/* ========== Click to hit butterflies ========== */
canvas.addEventListener('click', e => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = butterflies.length - 1; i >= 0; i--) {
    const b = butterflies[i];
    if (Math.hypot(x - b.x, y - b.y) < 30) {
      butterflies.splice(i, 1);
      score++;
      scoreEl.textContent = `Score: ${score}`;
      break;
    }
  }
});

/* ========== Pause / Play buttons ========== */
pauseBtn.onclick = () => {
  if (!gameRunning) return;
  gameRunning = false;
  pauseBtn.style.display = 'none';
  playBtn.style.display = 'inline';
};

playBtn.onclick = () => {
  if (gameRunning || !gameStarted) return;
  gameRunning = true;
  playBtn.style.display = 'none';
  pauseBtn.style.display = 'inline';
};

/* ========== Back to menu DURING game ========== */
backGameBtn.onclick = () => returnToMenu();

function returnToMenu() {
  gameRunning = false;
  gameStarted = false;
  hud.style.visibility = 'hidden';
  startMenu.style.display = 'flex';

  /* reset HUD text */
  scoreEl.textContent = 'Score: 0';
  timerEl.textContent = 'Time: 0:00';

  /* clear canvas & arrays */
  butterflies = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* ========== Spawn & countdown timers ========== */
setInterval(() => {
  if (gameRunning && butterflies.length < 15) butterflies.push(createButterfly());
}, 800);

setInterval(() => {
  if (!gameRunning || !gameStarted) return;
  timeLeft--;
  setTimerText();
  if (timeLeft <= 0) endGame();
}, 1000);

/* ========== End game overlay ========== */
function endGame() {
  gameRunning = false;
  pauseBtn.style.display = 'none';
  playBtn.style.display  = 'none';
  finalScore.textContent = `Final score: ${score}`;
  gameOverEl.style.visibility = 'visible';
}

/* Restart same duration */
restartBtn.onclick = () => startGame();

/* Back to menu from end screen (full reload for simplicity) */
backBtn.onclick = () => location.reload();
