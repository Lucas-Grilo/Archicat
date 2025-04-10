// Array com os caminhos das imagens
const images = [
  "img/imagem1.png",
  "img/imagem2.png",
  "img/imagem3.png",
  "img/imagem4.png",
  "img/imagem5.png",
];

let currentIndex = 0; // Índice da imagem atual

// Função para exibir a imagem atual
function showCurrentImage() {
  const currentImageElement = document.getElementById("current-image");
  currentImageElement.src = images[currentIndex];
}

// Função para avançar para a próxima imagem
function nextImage() {
  currentIndex = (currentIndex + 1) % images.length; // Avança para a próxima imagem
  showCurrentImage();
}

// Função para voltar para a imagem anterior
function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length; // Volta para a imagem anterior
  showCurrentImage();
}

// Exibe a primeira imagem ao carregar a página
showCurrentImage();
