function mostrarJogo(jogo) {
  const container = document.getElementById('jogo-container');
  container.innerHTML = ''; // Limpa o container

  switch (jogo) {
    case 'snake':
      // Código do Jogo da Cobrinha
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
