function mostrarJogo(jogo) {
  const container = document.getElementById('jogo-container');
  container.innerHTML = ''; // Limpa o container

  switch (jogo) {
  case 'snake':
  container.innerHTML = `
    <h3>🐍 Jogo da Cobrinha</h3>
    <canvas id="snakeCanvas" width="400" height="400"></canvas>
    <p>Pontuação: <span id="score">0</span></p>
    <button id="resetSnake">🔄 Reiniciar</button>
  `;

  setTimeout(() => {
    document.getElementById("resetSnake").addEventListener("click", iniciarCobrinha);
    iniciarCobrinha();
  }, 100);
  break;

  `;
  iniciarCobrinha();
  break;

  `;
  iniciarCobrinha();
  break;
      

      break;
    case 'velha':
      // Código do Jogo da Velha
      break;
    case 'adivinha':
      // Código do Jogo de Adivinhação
      break;
    case 'memoria':
      // Código do Jogo da Memória
      break;
    case 'forca':
      // Código do Jogo da Forca
      break;
    case 'whack':
      // Código do Whack-a-Mole
      break;
    case 'pong':
      // Código do Pong
      break;
    case 'flappy':
      // Código do Flappy Bird
      break;
    case 'breakout':
      // Código do Breakout
      break;
    case 'pedrapapel':
      // Código do Pedra, Papel, Tesoura
      break;
    default:
      container.innerHTML = '<p>Jogo não encontrado.</p>';
  }
}

let game; // variável global para o intervalo

function iniciarCobrinha() {
  clearInterval(game); // interrompe o jogo anterior

  const canvas = document.getElementById("snakeCanvas");
  const ctx = canvas.getContext("2d");

  const box = 20;
  const canvasSize = 400;
  let score = 0;
  document.getElementById("score").textContent = score;

  let snake = [
    { x: 9 * box, y: 10 * box },
    { x: 8 * box, y: 10 * box },
    { x: 7 * box, y: 10 * box }
  ];
  let direction = "RIGHT";

  let food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
  };

  document.onkeydown = function (event) {
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  };

  function collision(x, y, array) {
    return array.some(segment => segment.x === x && segment.y === y);
  }

  function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // desenha a cobrinha colorida
    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = `hsl(${(i * 30) % 360}, 100%, 50%)`;
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // comida
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // mover cabeça
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "UP") headY -= box;
    if (direction === "DOWN") headY += box;

    // colisão com parede
    if (
      headX < 0 || headX >= canvasSize ||
      headY < 0 || headY >= canvasSize ||
      collision(headX, headY, snake)
    ) {
      clearInterval(game);
      alert("☠️ Game Over! Pontuação: " + score);
      return;
    }

    // comer comida
    if (headX === food.x && headY === food.y) {
      score++;
      document.getElementById("score").textContent = score;
      food = {
        x: Math.floor(Math.random() * (canvasSize / box)) * box,
        y: Math.floor(Math.random() * (canvasSize / box)) * box,
      };
    } else {
      snake.pop(); // remove a cauda
    }

    // nova cabeça
    const newHead = { x: headX, y: headY };
    snake.unshift(newHead);
  }

  game = setInterval(draw, 100);
}
