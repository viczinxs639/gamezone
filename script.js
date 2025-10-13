// === VARIÁVEIS GERAIS ===
let jogoAtual = null;
let gameInterval = null;
let requestId = null;
let paused = false;
let audioContext = null; // Para sons simples (inicializa lazy)

// Elementos DOM (com verificação de existência)
const elementos = {
  telaInicial: document.getElementById("telaInicial"),
  telaJogos: document.getElementById("telaJogos"),
  btnEntrar: document.getElementById("btnEntrar"),
  btnVoltar: document.getElementById("btnVoltar"),
  canvas: document.getElementById("gameCanvas"),
  ctx: document.getElementById("gameCanvas")?.getContext("2d"),
  tetrisCanvas: document.getElementById("tetrisCanvas"),
  tetrisCtx: document.getElementById("tetrisCanvas")?.getContext("2d"),
  memoriaContainer: document.getElementById("memoriaContainer"),
  mobileControls: document.getElementById("mobileControls"),
  btnReiniciar: document.getElementById("btnReiniciar"),
  scoreDisplay: document.getElementById("scoreDisplay"),
  memoriaGrid: document.getElementById("memoriaGrid"),
  faseAtual: document.getElementById("faseAtual"),
  btnProximaFase: document.getElementById("btnProximaFase"),
  btnReiniciarMemoria: document.getElementById("btnReiniciarMemoria")
};

// Função para tocar som simples (opcional)
function playSound(frequency = 440, duration = 100) {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

// === NAVEGAÇÃO (Melhorada com reset completo) ===
if (elementos.btnEntrar) {
  elementos.btnEntrar.onclick = () => {
    if (elementos.telaInicial) elementos.telaInicial.style.display = "none";
    if (elementos.telaJogos) elementos.telaJogos.style.display = "block";
  };
}

if (elementos.btnVoltar) {
  elementos.btnVoltar.onclick = resetarTudo;
}

function resetarTudo() {
  if (elementos.telaInicial) elementos.telaInicial.style.display = "block";
  if (elementos.telaJogos) elementos.telaJogos.style.display = "none";
  if (elementos.canvas) elementos.canvas.style.display = "none";
  if (elementos.tetrisCanvas) elementos.tetrisCanvas.style.display = "none";
  if (elementos.memoriaContainer) elementos.memoriaContainer.style.display = "none";
  if (elementos.mobileControls) elementos.mobileControls.style.display = "none";
  if (elementos.scoreDisplay) elementos.scoreDisplay.style.display = "none";
  if (elementos.btnReiniciar) elementos.btnReiniciar.style.display = "none";
  pararJogo();
  jogoAtual = null;
  paused = false;
  if (elementos.ctx) elementos.ctx.clearRect(0, 0, elementos.canvas.width, elementos.canvas.height);
  if (elementos.tetrisCtx) elementos.tetrisCtx.clearRect(0, 0, elementos.tetrisCanvas.width, elementos.tetrisCanvas.height);
  if (elementos.memoriaGrid) elementos.memoriaGrid.innerHTML = '';
}

function iniciarJogo(tipo) {
  jogoAtual = tipo;
  paused = false;
  if (elementos.telaJogos) elementos.telaJogos.style.display = "none";
  if (elementos.canvas) elementos.canvas.style.display = (tipo === "snake" || tipo === "pong") ? "block" : "none";
  if (elementos.tetrisCanvas) elementos.tetrisCanvas.style.display = (tipo === "tetris") ? "block" : "none";
  if (elementos.memoriaContainer) elementos.memoriaContainer.style.display = (tipo === "memoria") ? "block" : "none";
  if (elementos.mobileControls) elementos.mobileControls.style.display = (tipo === "snake" || tipo === "pong" || tipo === "tetris") ? "flex" : "none";
  if (elementos.scoreDisplay) elementos.scoreDisplay.style.display = (tipo !== "memoria") ? "block" : "none";
  if (elementos.btnReiniciar) elementos.btnReiniciar.style.display = "none";

  // Inicializa módulo do jogo
  if (tipo === "snake") moduloSnake.init();
  else if (tipo === "pong") moduloPong.init();
  else if (tipo === "memoria") moduloMemoria.init();
  else if (tipo === "tetris") moduloTetris.init();

  adicionarControlesGlobais();
}

// Função para parar jogo (limpa loops)
function pararJogo() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  if (requestId) {
    cancelAnimationFrame(requestId);
    requestId = null;
  }
}

// Game Over consistente
function mostrarGameOver(mensagem = "Game Over!", pontos = 0) {
  paused = true;
  pararJogo();
  const highScore = localStorage.getItem(`${jogoAtual}HighScore`) || 0;
  mensagem += ` | Pontos: ${pontos} | Record: ${highScore}`;
  if (elementos.ctx && (jogoAtual === "snake" || jogoAtual === "pong")) {
    elementos.ctx.fillStyle = "rgba(0,0,0,0.7)";
    elementos.ctx.fillRect(0, 0, elementos.canvas.width, elementos.canvas.height);
    elementos.ctx.fillStyle = "white";
    elementos.ctx.font = "bold 24px Arial";
    elementos.ctx.textAlign = "center";
    elementos.ctx.fillText(mensagem, elementos.canvas.width / 2, elementos.canvas.height / 2);
  } else if (elementos.tetrisCtx && jogoAtual === "tetris") {
    elementos.tetrisCtx.fillStyle = "rgba(0,0,0,0.7)";
    elementos.tetrisCtx.fillRect(0, 0, elementos.tetrisCanvas.width, elementos.tetrisCanvas.height);
    elementos.tetrisCtx.fillStyle = "white";
    elementos.tetrisCtx.font = "bold 20px Arial";
    elementos.tetrisCtx.textAlign = "center";
    elementos.tetrisCtx.fillText(mensagem, elementos.tetrisCanvas.width / 2, elementos.tetrisCanvas.height / 2);
  }
  if (elementos.btnReiniciar) {
    elementos.btnReiniciar.style.display = "block";
    elementos.btnReiniciar.onclick = () => iniciarJogo(jogoAtual);
  }
  playSound(200, 300); // Som de game over
}

// Controles Globais (Teclado e Mobile)
function adicionarControlesGlobais() {
  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!jogoAtual) return;
    const key = e.key.toLowerCase();
    if (key === 'p') {
      paused = !paused;
      if (!paused && jogoAtual !== "memoria") {
        // Resume loop do jogo atual
        if (jogoAtual === "snake") moduloSnake.resume();
        else if (jogoAtual === "pong") moduloPong.resume();
        else if (jogoAtual === "tetris") moduloTetris.resume();
      }
      e.preventDefault();
      return;
    }
    let dir = '';
    if (key === 'arrowleft' || key === 'a') dir = 'LEFT';
    else if (key === 'arrowup' || key === 'w') dir = 'UP';
    else if (key === 'arrowright' || key === 'd') dir = 'RIGHT';
    else if (key === 'arrowdown' || key === 's') dir = 'DOWN';
    else if (key === ' ' || key === 'arrowup') { // Espaço/UP para rotacionar no Tetris
      if (jogoAtual === 'tetris') moduloTetris.rotacionar();
      e.preventDefault();
      return;
    }
    if (dir && !paused) {
      if (jogoAtual === 'snake') moduloSnake.mudarDirecao(dir);
      else if (jogoAtual === 'pong') moduloPong.moverPaddle(dir);
      else if (jogoAtual === 'tetris') moduloTetris.mover(dir);
    }
  });

  // Mobile (touchstart + hold simulation with setInterval)
  if (elementos.mobileControls) {
    const arrows = elementos.mobileControls.querySelectorAll('.arrow-btn');
    let touchTimer = null;
    arrows.forEach(btn => {
      btn.onpointerdown = (e) => { // Usa pointer para mouse/touch
        e.preventDefault();
        const dir = btn.dataset.dir;
        if (paused) return;
        // Movimento imediato
        if (jogoAtual === 'snake') moduloSnake.mudarDirecao(dir);
        else if (jogoAtual === 'pong') moduloPong.moverPaddle(dir);
        else if (jogoAtual === 'tetris') moduloTetris.mover(dir);
        // Repetição para hold (a cada 200ms)
        touchTimer = setInterval(() => {
          if (jogoAtual === 'pong') moduloPong.moverPaddle(dir);
          else if (jogoAtual === 'tetris') moduloTetris.mover(dir);
        }, 200);
        if (navigator.vibrate) navigator.vibrate(50); // Vibração
      };
      btn.onpointerup = btn.onpointerleave = () => {
        if (touchTimer) clearInterval(touchTimer);
      };
    });
  }
}

// === MÓDULO SNAKE (Melhorado: FPS fixo, high score, pausa) ===
const moduloSnake = {
  snake: [],
  food: {},
  dx: 1,
  dy: 0,
  score: 0,
  highScore: 0,
  boxSize: 20,
  speed: 150, // ms

  init() {
    this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    this.reset();
    if (elementos.scoreDisplay) elementos.scoreDisplay.textContent = `Pontuação: ${this.score} | Record: ${this.highScore}`;
    gameInterval = setInterval(() => this.update(), this.speed);
  },

  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.gerarComida();
    this.dx = 1; this.dy = 0;
    this.score = 0;
  },

  gerarComida() {
    do {
      this.food = {
        x: Math.floor(Math.random() * (elementos.canvas.width / this.boxSize)),
        y: Math.floor(Math.random() * (elementos.canvas.height / this.boxSize))
      };
    } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
  },

  colisao(head) {
    return head.x < 0 || head.y < 0 || head.x >= elementos.canvas.width / this.boxSize ||
           head.y >= elementos.canvas.height / this.boxSize ||
           this.snake.some(s => s.x === head.x && s.y === head.y);
  },

  update() {
    if (paused) return;
    try {
      elementos.ctx.fillStyle = "#222";
      elementos.ctx.fillRect(0, 0, elementos.canvas.width, elementos.canvas.height);

      // Desenhar cobra (gradiente simples)
      this.snake.forEach((s, i) => {
        elementos.ctx.fillStyle = i === 0 ? "#4CAF50" : "#81C784"; // Cabeça verde escuro, corpo claro
        elementos.ctx.fillRect(s.x * this.boxSize, s.y * this.boxSize, this.boxSize - 2, this.boxSize - 2);
      });

      // Comida
      elementos.ctx.fillStyle = "#FF5722";
      elementos.ctx.fillRect(this.food.x * this.boxSize, this.food.y * this.boxSize, this.boxSize - 2, this.boxSize - 2);

      // Score no canvas + display
      elementos.ctx.fillStyle = "white";
      elementos.ctx.font = "bold 16px Arial";
      elementos.ctx.fillText(`Pontos: ${this.score}`, 10, 25);
      if (elementos.scoreDisplay) elementos.scoreDisplay.textContent = `Pontuação: ${this.score} | Record: ${this.highScore}`;

      const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
      if (this.colisao(head)) {
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('snakeHighScore', this.highScore);
        }
        mostrarGameOver("Game Over!", this.score);
        return;
      }

      this.snake.unshift(head);
      if (head.x === this.food.x && head.y === this.food.y) {
        this.score++;
        this.gerarComida();
        playSound(800, 100); // Som de comer
        // Acelerar a cada 5 pontos
        if (this.score % 5 === 0) {
          clearInterval(gameInterval);
          this.speed = Math.max(50, this.speed - 10);
          gameInterval = setInterval(() => this.update(), this.speed);
        }
      } else {
        this.snake.pop();
      }
    } catch (e) {
      console.error("Erro no Snake:", e);
    }
  },

  mudarDirecao(dir) {
    if (dir === 'UP' && this.dy !== 1) { this.dx = 0; this.dy = -1; }
    else if (dir === 'DOWN' && this.dy !== -1) { this.dx = 0; this.dy = 1; }
    else if (dir === 'LEFT' && this.dx !== 1) { this.dx = -1; this.dy = 0; }
    else if (dir === 'RIGHT' && this.dx !== -1) { this.dx = 1; this.dy = 0; }
  },

  resume() {
    if (!gameInterval) gameInterval = setInterval(() => this.update(), this.speed);
  }
};

// === MÓDULO PONG (Melhorado: IA preditiva, game over em 10 pontos, bounds) ===
const moduloPong = {
  bola: { x: 200, y: 200, dx: 4, dy: 3, radius: 8 },
  jogador: { x: 10, y: 150, width: 10, height: 80 },
  ia: { x: 380, y: 150, width: 10, height: 80 },
  pontosJogador: 0,
  pontosIA: 0,
  highScore: 0,
  maxPontos: 10, // Game over em 10 pontos
  speed: 20, // ms para loop

  init() {
    this.highScore = parseInt(localStorage.getItem('pongHighScore')) || 0;
    this.reset();
    if (elementos.scoreDisplay) elementos.scoreDisplay.textContent = `Jogador: ${this.pontosJogador} | IA: ${this.pontosIA} | Record: ${this.highScore}`;
    gameInterval = setInterval(() => this.update(), this.speed);
  },

  reset() {
    this.bola = { x: 200, y: 200, dx: 4, dy: 3, radius: 8 };
    this.jogador.y = 150;
    this.ia.y = 150;
    this.pontosJogador = 0;
    this.pontosIA = 0;
  },

  update() {
    if (paused) return;
    try {
      elementos.ctx.fillStyle = "#000";
      elementos.ctx.fillRect(0, 0, elementos.canvas.width, elementos.canvas.height);

      // Desenhar paddles
      elementos.ctx.fillStyle = "#FFF";
      elementos.ctx.fillRect(this.jogador.x, this.jogador.y, this.jogador.width, this.jogador.height);
      elementos.ctx.fillRect(this.ia.x, this.ia.y, this.ia.width, this.ia.height);

      // Bola
      elementos.ctx.beginPath();
      elementos.ctx.arc(this.bola.x, this.bola.y, this.bola.radius, 0, Math.PI * 2);
      elementos.ctx.fill();

      // Mover bola
      this.bola.x += this.bola.dx;
      this.bola.y += this.bola.dy;

      // Colisão paredes superior/inferior
      if (this.bola.y - this.bola.radius < 0 || this.bola.y + this.bola.radius > elementos.canvas.height) {
        this.bola.dy *= -1;
        playSound(600, 50);
      }

      // Colisão jogador
      if (this.bola.x - this.bola.radius < this.jogador.x + this.jogador.width &&
          this.bola.y > this.jogador.y && this.bola.y < this.jogador
