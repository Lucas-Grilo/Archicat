// Variáveis globais
let totalSum = 0; // Variável para armazenar a soma das miniaturas
let frete = 0; // Variável para armazenar o valor do frete
let isImageLoaded = false; // Flag para verificar se a imagem foi carregada
let currentRotation = 0; // Variável para armazenar a rotação atual
let currentThumbnail = null; // Variável para armazenar a miniatura selecionada

// Elementos do DOM
const inputImage = document.getElementById("inputImage");
const text = document.getElementById("text");
const newUpload = document.getElementById("newUpload");
const lixoImage = document.getElementById("lixoImage");
const rotateLeftButton = document.getElementById("rotateLeftButton");
const rotateRightButton = document.getElementById("rotateRightButton");
const thumbnails = document.querySelectorAll(".thumbnail");
const screen = document.querySelector(".screen");
const totalSumElement = document.getElementById("total-sum");
const totalGeralElement = document.getElementById("total-geral");
const resultadoFreteElement = document.getElementById("resultado-frete");

// Função para atualizar o total geral (incluindo frete)
function atualizarTotalGeral() {
  const totalGeral = totalSum + frete;
  totalGeralElement.innerText = totalGeral.toFixed(2); // Atualiza o valor do Total Geral com 2 casas decimais
}

// Função para atualizar o total das miniaturas
function atualizarTotalSum() {
  totalSumElement.textContent = totalSum.toFixed(2);
  atualizarTotalGeral(); // Atualiza o total geral
}

// Função para verificar se o valor da miniatura é um número válido
function isValidValue(value) {
  return !isNaN(value) && value > 0;
}

// Função para rotacionar a miniatura
function rotateThumbnail(rotationAmount) {
  if (currentThumbnail) {
    currentRotation += rotationAmount;

    // Limitar a rotação a 360°
    if (currentRotation <= -360) currentRotation = 0;
    if (currentRotation >= 360) currentRotation = 0;

    currentThumbnail.style.transform = `rotate(${currentRotation}deg)`;
  }
}

// Desativa as miniaturas no início
thumbnails.forEach((thumb) => {
  thumb.classList.add("disabled");
});

// Quando o arquivo for carregado
inputImage.addEventListener("change", function () {
  const file = inputImage.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      screen.style.backgroundImage = `url(${e.target.result})`;
      screen.style.backgroundSize = "contain";
      screen.style.backgroundRepeat = "no-repeat";
      screen.style.backgroundPosition = "center";

      text.style.display = "none";
      newUpload.style.display = "block";
      inputImage.style.display = "none";

      isImageLoaded = true;
      thumbnails.forEach((thumb) => {
        thumb.classList.remove("disabled");
      });

      lixoImage.style.display = "inline-block";
      document.querySelector(".rotate-buttons-container").style.display =
        "flex";
    };
    reader.readAsDataURL(file);
  }
});

// Quando o botão de novo upload é clicado
newUpload.addEventListener("click", function () {
  inputImage.style.display = "block";
  inputImage.value = "";
  inputImage.click();
});

// Função para rotacionar a miniatura à esquerda
rotateLeftButton.addEventListener("click", function () {
  rotateThumbnail(-45);
});

// Função para rotacionar a miniatura à direita
rotateRightButton.addEventListener("click", function () {
  rotateThumbnail(45);
});

// Função para carregar a miniatura como sobreposição
function setImage(src, value) {
  if (!isImageLoaded) {
    alert("Carregue uma imagem antes de selecionar uma miniatura!");
    return;
  }

  const largura = 150; // Largura da miniatura
  const altura = 150; // Altura da miniatura

  const newPreview = document.createElement("img");
  newPreview.src = src;
  newPreview.style.position = "absolute";
  newPreview.style.zIndex = "10";
  newPreview.style.left = "0px";
  newPreview.style.top = "0px";
  newPreview.classList.add("draggable");
  newPreview.style.width = `${largura}px`; // Define a largura via estilo
  newPreview.style.height = `${altura}px`; // Define a altura via estilo

  screen.appendChild(newPreview);

  // Atualiza a soma total
  totalSum += parseFloat(value);
  atualizarTotalSum();

  makeThumbnailDraggable(newPreview, value);
}

// Função para tornar a miniatura arrastável e possível de ser removida
function makeThumbnailDraggable(thumbnail, value) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  thumbnail.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);

  thumbnail.addEventListener("dragstart", function (e) {
    e.preventDefault();
  });

  function startDrag(e) {
    if (e.button === 0) {
      isDragging = true;
      offsetX = e.clientX - thumbnail.getBoundingClientRect().left;
      offsetY = e.clientY - thumbnail.getBoundingClientRect().top;
      currentThumbnail = thumbnail;
    }
  }

  function drag(e) {
    if (isDragging && currentThumbnail) {
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      const screenRect = screen.getBoundingClientRect();
      const previewRect = currentThumbnail.getBoundingClientRect();

      newX = Math.max(
        screenRect.left,
        Math.min(screenRect.right - previewRect.width, newX)
      );
      newY = Math.max(
        screenRect.top,
        Math.min(screenRect.bottom - previewRect.height, newY)
      );

      currentThumbnail.style.left = `${newX - screenRect.left}px`;
      currentThumbnail.style.top = `${newY - screenRect.top}px`;

      const lixoRect = lixoImage.getBoundingClientRect();
      const thumbRect = currentThumbnail.getBoundingClientRect();

      if (
        thumbRect.right > lixoRect.left &&
        thumbRect.left < lixoRect.right &&
        thumbRect.bottom > lixoRect.top &&
        thumbRect.top < lixoRect.bottom
      ) {
        currentThumbnail.remove();
        currentThumbnail = null;

        totalSum -= parseFloat(value);
        atualizarTotalSum();
      }
    }
  }

  function stopDrag() {
    isDragging = false;
  }
}

// Função para calcular o frete (simulação)
async function calcularFreteCorreios(cepDestino) {
  const cepOrigem = "37500356";
  const regiaoDestino = cepDestino.slice(0, 2);

  const fretesPorRegiao = {
    37: 15.0,
    38: 20.0,
    39: 25.0,
    40: 30.0,
  };

  const freteCalculado = fretesPorRegiao[regiaoDestino] || 35.0;
  return freteCalculado;
}

// Integração com o botão de cálculo de frete
document.addEventListener("DOMContentLoaded", function () {
  const calcularFreteButton = document.getElementById("calcular-frete");
  const resultadoFrete = document.getElementById("resultado-frete");

  if (calcularFreteButton && resultadoFrete) {
    calcularFreteButton.addEventListener("click", async function () {
      const cep = document.getElementById("cep").value.replace(/\D/g, "");

      // Validação do CEP
      const cepRegex = /^[0-9]{8}$/;
      if (!cepRegex.test(cep)) {
        resultadoFrete.textContent =
          "Por favor, insira um CEP válido com 8 dígitos.";
        return;
      }

      if (cep.length === 8) {
        resultadoFrete.textContent = "Calculando frete...";
        const valorFrete = await calcularFreteCorreios(cep);
        if (valorFrete) {
          frete = valorFrete;
          resultadoFrete.textContent = `Frete R$ ${valorFrete.toFixed(2)}`;
          atualizarTotalGeral();
        } else {
          resultadoFrete.textContent =
            "Erro ao calcular o frete. Tente novamente.";
        }
      } else {
        resultadoFrete.textContent =
          "Por favor, insira um CEP válido com 8 dígitos.";
      }
    });
  }
});

// Função para capturar a imagem da tela
function getCanvasImage(screenElement) {
  const originalBoxShadow = screenElement.style.boxShadow;
  screenElement.style.boxShadow = "none";

  return html2canvas(screenElement).then((canvas) => {
    screenElement.style.boxShadow = originalBoxShadow;
    
    // Redimensionar o canvas para reduzir o tamanho da imagem
    const maxWidth = 800;
    const maxHeight = 600;
    
    let width = canvas.width;
    let height = canvas.height;
    
    // Calcular as novas dimensões mantendo a proporção
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = height * ratio;
    }
    
    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width = width * ratio;
    }
    
    // Criar um novo canvas com as dimensões reduzidas
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = width;
    resizedCanvas.height = height;
    
    // Desenhar a imagem redimensionada
    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, width, height);
    
    // Retornar a imagem com qualidade reduzida para diminuir o tamanho
    return resizedCanvas.toDataURL("image/jpeg", 0.7);
  });
}

// Adicionar evento de clique ao botão de finalizar pagamento
document.addEventListener("DOMContentLoaded", function() {
  const finalizarComraButton = document.getElementById("finalizarComraButton");
  if (finalizarComraButton) {
    finalizarComraButton.addEventListener("click", function() {
      // Salvar o valor total na sessionStorage antes de redirecionar
      const totalGeral = document.getElementById('total-geral').textContent;
      sessionStorage.setItem('totalGeral', totalGeral);
      
      // Capturar a imagem da tela antes de redirecionar
      lixoImage.style.display = "none";
      document.querySelector(".rotate-buttons-container").style.display = "none";
      newUpload.style.display = "none";
      
      getCanvasImage(screen)
        .then((canvasImage) => {
          if (canvasImage) {
            // Armazenar a imagem capturada no sessionStorage
            sessionStorage.setItem('screenCapture', canvasImage);
            console.log("Imagem da tela capturada e armazenada com sucesso!");
          } else {
            console.error("Erro ao capturar a imagem da tela.");
          }
          // Redirecionar para a página de pagamento
          window.location.href = "../Pagamento/pagamento.html";
        })
        .catch((error) => {
          console.error("Erro ao capturar a imagem:", error);
          // Redirecionar mesmo em caso de erro
          window.location.href = "../Pagamento/pagamento.html";
        })
        .finally(() => {
          lixoImage.style.display = "inline-block";
          document.querySelector(".rotate-buttons-container").style.display = "flex";
          newUpload.style.display = "block";
        });
    });
  }
});

// Seleciona o botão de download e a tela onde a imagem será gerada
const baixarImagemButton = document.getElementById("baixarImagemButton");

baixarImagemButton.addEventListener("click", function () {
  lixoImage.style.display = "none";
  document.querySelector(".rotate-buttons-container").style.display = "none";
  newUpload.style.display = "none";

  getCanvasImage(screen)
    .then((canvasImage) => {
      if (canvasImage) {
        const link = document.createElement("a");
        link.href = canvasImage;
        link.download = "imagem_da_tela.png";
        link.click();
      } else {
        console.error("Erro ao capturar a imagem da tela.");
      }
    })
    .catch((error) => {
      console.error("Erro ao capturar a imagem:", error);
    })
    .finally(() => {
      lixoImage.style.display = "inline-block";
      document.querySelector(".rotate-buttons-container").style.display =
        "flex";
      newUpload.style.display = "block";
    });
});
