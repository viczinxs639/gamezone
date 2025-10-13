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

// === NAVEGAÇÃO ===
btnEntrar.onclick = () => {
  telaInicial.style.display = "none";
  telaJogos.style.display = "block";
};

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  document.getElementById("memoriaGrid").innerHTML = ''; // Limpa grid memória
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
  adicionarControlesMobile(); // Ativa controles mobile

  if (tipo === "snake") iniciarSnake();
  else if (tipo === "pong") iniciarPong();
  else if (tipo === "memoria") iniciarMemoria();
  else if (tipo === "tetris") iniciarTetris();
}

// Função para mostrar game over
function mostrarGameOver(mensagem = "Game Over!") {
  gameOver = true;
  if (gameInterval) clearInterval(gameInterval);
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
  btnReiniciar.onclick = () => iniciarJogo(jogoAtual);
}

// Controles Teclado (Setas e WASD para todos os jogos)
document.addEventListener('keydown', (e) => {
  if (gameOver || !jogoAtual) return;
  const key = e.key.toLowerCase();
  let dir = '';
  if (key === 'arrowleft' || key === 'a') dir = 'LEFT';
  else if (key === 'arrowup' || key === 'w') dir = 'UP';
  else if (key === 'arrowright' || key === 'd') dir = 'RIGHT';
  else if (key === 'arrowdown' || key === 's') dir = 'DOWN';
  else if (key === ' ') { // Espaço para pausar/reiniciar em alguns jogos
    e.preventDefault();
    if (jogoAtual === 'tetris') rotacionarPeca();
  }
  if (dir) {
    if (jogoAtual === 'snake') mudarDirecaoSnake(dir);
    else if (jogoAtual === 'pong') moverPaddle(dir);
    else if (jogoAtual === 'tetris') moverTetris(dir);
  }
});

// Controles Mobile
function adicionarControlesMobile() {
  const arrows = mobileControls.querySelectorAll('.arrow-btn');
  arrows.forEach(btn => {
    btn.onclick = (e) => {
      if (gameOver) return;
      const dir = e.target.dataset.dir;
      if (jogoAtual === 'snake') mudarDirecaoSnake(dir);
     
