// === VARIÁVEIS GERAIS ===
let jogoAtual = null;
let requestId;
let gameOver = false;

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

// === NAVEGAÇÃO ===
btnEntrar.onclick = () => {
  telaInicial.style.display = "none";
  telaJogos.style.display = "block";
};

btnVoltar.onclick = resetarTudo();

function resetarTudo() {
  return () => {
    telaInicial.style.display = "block";
    telaJogos.style.display = "none";
    canvas.style.display = "none";
    tetrisCanvas.style.display = "none";
    memoriaContainer.style.display = "none";
    mobileControls.style.display = "none";
    btnReiniciar.style.display = "none";
    if (requestId) cancelAnimationFrame(requestId);
    if (window.gameInterval) clearInterval(window.gameInterval);
    gameOver = false;
    jogoAtual = null;
  };
}

function iniciarJogo(tipo) {
  jogoAtual = tipo;
  gameOver = false;
  telaJogos.style.display = "none";
  canvas.style.display = (tipo === "snake" || tipo === "pong") ? "block" : "none";
  tetrisCanvas.style.display = (tipo === "tetris") ? "block" : "none";
  memoriaContainer.style.display = (tipo === "memoria") ? "block" : "none";
  mobileControls.style.display = (tipo === "snake" || tipo === "pong" || tipo === "tetris") ? "flex" : "none";
  btnReiniciar.style.display = "none";

  if (tipo === "snake") iniciarSnake();
  else if (tipo === "pong") iniciarPong();
  else if (tipo === "memoria") iniciarMemoria();
  else if (tipo === "tetris") iniciarTetris();
}

// Função para mostrar game over e botão reiniciar
function mostrarGameOver(mensagem = "Game Over!") {
  gameOver = true;
  if (jogoAtual === "tetris") {
    tetrisCtx.fillStyle = "white";
    tetrisCtx.font = "30px Arial";
    tetrisCtx.fillText(mensagem, 20, tetrisCanvas.height / 2);
  } else {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(mensagem, canvas.width / 2 - 70, canvas.height / 2);
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

// === SNAKE ===
let snake = [], food = {}, dx = 1, dy = 0, score = 0;

function iniciarSnake() {
  snake = [{ x: 10, y: 10 }];
  food = gerarComida();
  dx = 1; dy = 0;
  score = 0;
  gameOver = false;
  desenharSnake();
}

function desenharSnake() {
  if (gameOver) return;

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f39c12";
  snake.forEach(s => ctx.fillRect(s.x * 20, s.y * 20, 18, 18));

  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontuação: " + score, 10, 20);

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  if (colisao(head)) {
    mostrarGameOver();
    // Som opcional de game over (Web Audio)
    // new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBji
