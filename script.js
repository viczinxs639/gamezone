// === VARIÁVEIS GERAIS ===
let jogoAtual = null;
let requestId;
let gameOver = false;
let gameInterval; // Para loops de jogos

// Elementos DOM
const telaInicial = document.getElementById("telaInicial");
const telaJogos = document.getElementById("telaJogos");
const btnEntrar = document.getElementById("btnEntrar");
const btnVoltar = document.getElementById("btnVoltar");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");
const memoriaContainer = document.getElementById("memoriaContainer");
const mobileControls = document.getElementById("mobileControls");
const btnReiniciar = document.getElementById("btnReiniciar");
const scoreDisplay = document.getElementById("scoreDisplay");

// === NAVEGAÇÃO (Corrigida) ===
btnEntrar.onclick = () => {
  telaInicial.style.display = "none";
  telaJogos.style.display = "block";
};

// Correção: Atribui a função corretamente (não executa imediatamente)
const resetarTudo = () => {
  telaInicial.style.display = "block";
  telaJogos.style.display = "none";
  canvas.style.display = "none";
  tetrisCanvas.style.display = "none";
  memoriaContainer.style.display = "none";
  mobileControls.style.display = "none";
  scoreDisplay.style.display = "none";
  btnReiniciar.style.display = "none";
  if (requestId) cancelAnimationFrame(requestId);
  if (gameInterval) clearInterval(gameInterval);
  gameOver = false;
  jogoAtual = null;
  // Limpa canvas se necessário
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
};
btnVoltar.onclick = resetarTudo;

function iniciarJogo(tipo) {
  jogoAtual = tipo;
  gameOver = false;
  telaJogos.style.display = "none";
  canvas.style.display = (tipo === "snake" || tipo === "pong") ? "block" : "none";
  tetrisCanvas.style.display = (tipo === "tetris") ? "block" : "none";
  memoriaContainer.style.display = (tipo === "memoria") ? "block" : "none";
  mobileControls.style.display = (tipo === "snake" || tipo === "pong" || tipo === "tetris") ? "flex" : "none";
  scoreDisplay.style.display = (tipo !== "memoria") ? "block" : "none";
  btnReiniciar.style.display = "none";

  if (tipo === "snake") iniciarSnake();
  else if (tipo === "pong") iniciarPong();
  else if (tipo === "memoria") iniciarMemoria();
  else if (tipo === "tetris") iniciarTetris();
}

// Função para mostrar game over e botão reiniciar (Corrigida)
function mostrarGameOver(mensagem = "Game Over!") {
  gameOver = true;
  clearInterval(gameInterval); // Para loops
  if (requestId) cancelAnimationFrame(requestId);
  if (jogoAtual === "tetris") {
    tetrisCtx.fillStyle = "white";
    tetrisCtx.font = "30px Arial";
    tetrisCtx.textAlign = "center";
    tetrisCtx.fillText(mensagem, tetrisCanvas.width / 2, tetrisCanvas.height / 2);
  } else if (jogoAtual === "pong" || jogoAtual === "snake") {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(mensagem, canvas.width / 2, canvas.height / 2);
  }
  btnReiniciar.style.display = "block";
  btnReiniciar.onclick = () => {
    if (jogoAtual === "memoria") {
      document.getElementById("btnReiniciarMemoria").click();
    } else {
      iniciarJogo(jogoAtual);
    }
  };
}

// === SNAKE (Implementação Completa) ===
let snake = [], food = {}, dx = 20, dy = 0, scoreSnake = 0; // box = 20

function iniciarSnake() {
  snake = [{ x: 200, y: 200 }]; // Centro
  scoreSnake = 0;
  dx = 20; dy = 0;
  gameOver = false;
  gerarComida();
  scoreDisplay.textContent = `Pontuação: ${scoreSnake}`;
  gameInterval = setInterval(desenharsnake, 150); // Loop a 150ms
  adicionarControles('snake');
}

function gerarComida() {
  food = {
    x: Math.floor(Math.random() * 20) * 20,
    y: Math.floor(Math.random() * 20) * 20
  };
  // Evita spawn na cobra
  if (snake.some(s => s.x === food.x && s.y === food.y)) gerarComida();
}

function colisao(head) {
  // Bordas
  if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) return true;
  // Corpo
  return snake.some(s => s.x === head.x && s.y === head.y);
}

function desenharsnake() {
  if (gameOver) return;

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Desenhar cobra
  ctx.fillStyle = "#0f0";
  snake.forEach((s, i) => {
    ctx.fillRect(s.x, s.y, 20, 20);
    if (i > 0) ctx.fillStyle = "#4f4"; // Corpo mais claro
  });

  // Desenhar comida
  ctx.fillStyle = "#f00";
  ctx.fillRect(food.x, food.y, 20, 20);

  // Score
  scoreDisplay.textContent = `Pontuação: ${scoreSnake}`;

  // Mover
  let head = { x: snake[0].x + dx, y: snake[0].y + dy };
  if (colisao(head)) {
    mostrarGameOver("Game Over! Pontos: " + scoreSnake);
    return;
  }

  snake.unshift(head);

  // Comer
  if (head.x === food.x && head.y === food.y) {
    scoreSnake++;
    gerarComida();
    // Acelerar opcional: clearInterval(gameInterval); gameInterval = setInterval(desenharsnake, 120);
  } else {
    snake.pop();
  }
}

// === PONG (Implementação Simples: Raquete vs parede) ===
let ball = { x: 200, y: 200, dx: 4, dy: 4, radius: 10 };
let paddle = { x: 180, y: 350, width: 40, height: 10 };
let scorePong = 0;

function iniciarPong() {
  ball = { x: 200, y: 200, dx: 4, dy: 4, radius: 10 };
  paddle = { x: 180, y: 350, width: 40, height: 10 };
  scorePong = 0;
  gameOver = false;
  scoreDisplay.textContent = `Pontuação: ${scorePong}`;
  gameInterval = setInterval(desenharPong, 20); // Rápido para bola
  adicionarControles('pong');
}

function desenharPong() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bola
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Raquete
  ctx.fillStyle = "#0f0";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Mover bola
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Colisão parede superior/inferior
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.dy = -ball.dy;

  // Colisão laterais (pontua)
  if (ball.x < 0 || ball.x > canvas.width) {
    scorePong++;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    scoreDisplay.textContent = `Pontuação: ${scorePong}`;
  }

  // Colisão raquete
  if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
    ball.dy = -Math.abs(ball.dy);
  }

  // Game over se bola passa raquete
  if (ball.y > canvas.height) {
    mostrarGameOver("Game Over! Pontos: " + scorePong);
  }
}

// === MEMÓRIA (Implementação Completa: 4x4 cartas, fases progressivas) ===
let cartas = [];
let viradas = [];
let paresEncontrados = 0;
let fase = 1;
const emojisPorFase = [
  ['🍎', '🍌', '🍇', '🍊'], // Fase 1: 4 pares
  ['🍕', '🌮', '🍔', '🍟', '🍦', '🍩'], // Fase 2: 6 pares (mas grid 4x4 = 8 cartas, ajuste)
  // Adicione mais para fases futuras
];

function iniciarMemoria() {
  fase = 1;
  paresEncontrados = 0;
  document.getElementById("faseAtual").textContent = `Fase ${fase}`;
  criarGridMemoria();
  document.getElementById("btnProximaFase").style.display = "none";
  document.getElementById("btnReiniciarMemoria").style.display = "block";
  document.getElement
