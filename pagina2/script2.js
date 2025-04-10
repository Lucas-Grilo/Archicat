// Variáveis globais
let totalSum = 0; // Variável para armazenar a soma das miniaturas
let frete = 0; // Variável para armazenar o valor do frete
let isImageLoaded = false; // Flag para verificar se a imagem foi carregada
let currentRotation = 0; // Variável para armazenar a rotação atual
let currentThumbnail = null; // Variável para armazenar a miniatura selecionada
let thumbnailCache = []; // Array para armazenar as miniaturas em cache
let miniaturasAdicionadas = {}; // Objeto para armazenar os nomes das miniaturas adicionadas e suas contagens

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

// Função para atualizar o bottom-rectangle com os nomes das miniaturas adicionadas e suas contagens
function atualizarBottomRectangle() {
  const bottomRectangle = document.querySelector('.bottom-rectangle');
  if (bottomRectangle) {
    // Filtrar o nome 'Gato' da lista de miniaturas
    const miniaturas = Object.keys(miniaturasAdicionadas).filter(nome => nome !== 'Gato');
    if (miniaturas.length > 0) {
      let conteudo = '<h3>Miniaturas adicionadas:</h3><ul>';
      miniaturas.forEach(miniatura => {
        const quantidade = miniaturasAdicionadas[miniatura];
        conteudo += `<li>${miniatura} ${quantidade > 1 ? `(${quantidade})` : ''}</li>`;
      });
      conteudo += '</ul>';
      bottomRectangle.innerHTML = conteudo;
    } else {
      bottomRectangle.innerHTML = '<p>Nenhuma miniatura adicionada ainda.</p>';
    }
  }
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

// Variável para controlar se as miniaturas já foram liberadas
let thumbnailsEnabled = false;

// Desativa as miniaturas no início
thumbnails.forEach((thumb) => {
  thumb.classList.add("disabled");
});

// Função para carregar miniaturas do banco de dados
async function carregarMiniaturasDoBanco() {
  let tentativas = 0;
  const maxTentativas = 3;
  const tempoEspera = 1000; // 1 segundo entre tentativas
  
  // URL do servidor - usa o Render em produção ou localhost em desenvolvimento
  const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api/miniaturas'
    : 'https://archicat-backend.onrender.com/api/miniaturas';
  
  console.log('Usando URL do servidor:', serverUrl);
  
  while (tentativas < maxTentativas) {
    try {
      console.log(`Tentativa ${tentativas + 1} de ${maxTentativas} para carregar miniaturas...`);
      const response = await fetch(serverUrl);
      console.log('Resposta recebida:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar miniaturas do banco de dados: ${response.status} ${response.statusText}`);
      }
      
      const miniaturas = await response.json();
      console.log('Miniaturas carregadas com sucesso:', miniaturas.length);
      
      // Verificar e corrigir o formato dos dados recebidos
      const miniaturasProcessadas = miniaturas.map(miniatura => {
        // Garantir que o preço seja um número
        if (miniatura.preco !== undefined) {
          // Converter vírgula para ponto no preço (formato brasileiro para formato internacional)
          if (typeof miniatura.preco === 'string') {
            miniatura.preco = miniatura.preco.replace(',', '.');
          }
          miniatura.preco = typeof miniatura.preco === 'number' ? miniatura.preco : parseFloat(miniatura.preco);
          // Se o preço não for um número válido após a conversão, definir como 0
          if (isNaN(miniatura.preco)) {
            console.warn(`Preço inválido para miniatura ${miniatura.nome}: ${miniatura.preco}. Definindo como 0.`);
            miniatura.preco = 0;
          }
        } else {
          console.warn(`Miniatura ${miniatura.nome} não possui preço definido. Definindo como 0.`);
          miniatura.preco = 0;
        }
        return miniatura;
      });
      
      return miniaturasProcessadas;
    } catch (error) {
      console.error(`Erro ao carregar miniaturas (tentativa ${tentativas + 1}):`, error);
      tentativas++;
      
      if (tentativas < maxTentativas) {
        console.log(`Aguardando ${tempoEspera/1000} segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, tempoEspera));
      } else {
        // Após todas as tentativas, lançar o erro
        throw new Error(`Não foi possível carregar as miniaturas do banco de dados após ${maxTentativas} tentativas: ${error.message}. Por favor, verifique se o servidor está em execução.`);
      }
    }
  }
}

// Função para salvar a imagem de fundo no sessionStorage (não no localStorage)
function saveBackgroundImageToCache(imageDataUrl) {
  try {
    sessionStorage.setItem('backgroundImage', imageDataUrl);
  } catch (e) {
    console.error('Erro ao salvar imagem de fundo no sessionStorage:', e);
  }
}

// Função para carregar a imagem de fundo do sessionStorage
function loadBackgroundImageFromCache() {
  try {
    const cachedImage = sessionStorage.getItem('backgroundImage');
    if (cachedImage) {
      console.log('Carregando imagem do cache...');
      screen.style.backgroundImage = `url(${cachedImage})`;
      screen.style.backgroundSize = "contain";
      screen.style.backgroundRepeat = "no-repeat";
      screen.style.backgroundPosition = "center";

      text.style.display = "none";
      newUpload.style.display = "block";
      inputImage.style.display = "none";

      isImageLoaded = true;
      thumbnailsEnabled = true;
      
      // Atualizar todas as miniaturas existentes
      const allThumbnails = document.querySelectorAll(".thumbnail");
      console.log(`Ativando ${allThumbnails.length} miniaturas encontradas`);
      allThumbnails.forEach((thumb) => {
        thumb.classList.remove("disabled");
      });

      lixoImage.style.display = "inline-block";
      document.querySelector(".rotate-buttons-container").style.display = "flex";
      
      // Remover mensagem informativa se existir
      const mensagem = document.querySelector('.miniatura-mensagem');
      if (mensagem) mensagem.remove();
      
      return true;
    }
    return false;
  } catch (e) {
    console.error('Erro ao carregar imagem de fundo do sessionStorage:', e);
    return false;
  }
}

// Quando o arquivo for carregado
inputImage.addEventListener("change", function () {
  const file = inputImage.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageDataUrl = e.target.result;
      screen.style.backgroundImage = `url(${imageDataUrl})`;
      screen.style.backgroundSize = "contain";
      screen.style.backgroundRepeat = "no-repeat";
      screen.style.backgroundPosition = "center";

      text.style.display = "none";
      newUpload.style.display = "block";
      inputImage.style.display = "none";

      isImageLoaded = true;
      thumbnailsEnabled = true; // Atualizar a variável de controle
      
      // Ativar todas as miniaturas após o carregamento da imagem
      const allThumbnails = document.querySelectorAll(".thumbnail");
      console.log(`Ativando ${allThumbnails.length} miniaturas no evento de carregamento de imagem`);
      allThumbnails.forEach((thumb) => {
        thumb.classList.remove("disabled");
      });

      lixoImage.style.display = "inline-block";
      document.querySelector(".rotate-buttons-container").style.display = "flex";
      
      // Remover mensagem informativa se existir
      const mensagem = document.querySelector('.miniatura-mensagem');
      if (mensagem) mensagem.remove();
      
      // Salvar a imagem no cache
      saveBackgroundImageToCache(imageDataUrl);
    };
    reader.readAsDataURL(file);
  }
});

// Função para limpar o cache do sessionStorage
function clearCache() {
  try {
    sessionStorage.removeItem('thumbnailCache');
    sessionStorage.removeItem('backgroundImage');
    sessionStorage.removeItem('totalSum');
    sessionStorage.removeItem('frete');
  } catch (e) {
    console.error('Erro ao limpar cache:', e);
  }
}

// Quando o botão de novo upload é clicado
newUpload.addEventListener("click", function () {
  // Limpar o cache quando o usuário quiser carregar uma nova imagem
  clearCache();
  
  // Remover todas as miniaturas existentes
  const existingThumbnails = screen.querySelectorAll('.draggable');
  existingThumbnails.forEach(thumb => thumb.remove());
  
  // Resetar valores
  totalSum = 0;
  frete = 0;
  atualizarTotalSum();
  
  // Limpar o objeto de miniaturas adicionadas
  miniaturasAdicionadas = {};
  
  // Atualizar o bottom-rectangle
  atualizarBottomRectangle();
  
  // Mostrar o input de arquivo
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

// Função para salvar o estado atual das miniaturas no sessionStorage
function saveThumbnailsToCache() {
  // Obter todas as miniaturas na tela
  const thumbnailElements = screen.querySelectorAll('.draggable');
  thumbnailCache = [];
  
  // Para cada miniatura, salvar suas propriedades
  thumbnailElements.forEach(thumb => {
    // Obter posições relativas à tela para garantir consistência
    const rect = thumb.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();
    const relativeLeft = rect.left - screenRect.left;
    const relativeTop = rect.top - screenRect.top;
    
    thumbnailCache.push({
      src: thumb.src,
      left: `${relativeLeft}px`,
      top: `${relativeTop}px`,
      width: thumb.style.width,
      height: thumb.style.height,
      transform: thumb.style.transform,
      value: thumb.getAttribute('data-value') || '0'
    });
  });
  
  // Salvar no sessionStorage
  try {
    sessionStorage.setItem('thumbnailCache', JSON.stringify(thumbnailCache));
    sessionStorage.setItem('totalSum', totalSum.toString());
    sessionStorage.setItem('frete', frete.toString());
    sessionStorage.setItem('miniaturasAdicionadas', JSON.stringify(miniaturasAdicionadas));
  } catch (e) {
    console.error('Erro ao salvar cache:', e);
  }
}

// Função para carregar miniaturas do sessionStorage
function loadThumbnailsFromCache() {
  try {
    const cachedThumbnails = sessionStorage.getItem('thumbnailCache');
    const cachedTotalSum = sessionStorage.getItem('totalSum');
    const cachedFrete = sessionStorage.getItem('frete');
    
    if (cachedThumbnails) {
      thumbnailCache = JSON.parse(cachedThumbnails);
      
      // Restaurar cada miniatura
      thumbnailCache.forEach(thumbData => {
        const newPreview = document.createElement("img");
        newPreview.src = thumbData.src;
        newPreview.style.position = "absolute";
        newPreview.style.zIndex = "10";
        newPreview.style.left = thumbData.left;
        newPreview.style.top = thumbData.top;
        newPreview.style.width = thumbData.width;
        newPreview.style.height = thumbData.height;
        newPreview.style.transform = thumbData.transform;
        newPreview.classList.add("draggable");
        newPreview.setAttribute('data-value', thumbData.value);
        
        screen.appendChild(newPreview);
        makeThumbnailDraggable(newPreview, thumbData.value);
      });
    }
    
    // Restaurar valores totais
    if (cachedTotalSum) {
      totalSum = parseFloat(cachedTotalSum);
      atualizarTotalSum();
    }
    
    if (cachedFrete) {
      frete = parseFloat(cachedFrete);
      if (resultadoFreteElement) {
        resultadoFreteElement.textContent = `Frete R$ ${frete.toFixed(2)}`;
      }
      atualizarTotalGeral();
    }
    
    // Restaurar o objeto de miniaturas adicionadas
    const cachedMiniaturas = sessionStorage.getItem('miniaturasAdicionadas');
    if (cachedMiniaturas) {
      miniaturasAdicionadas = JSON.parse(cachedMiniaturas);
      // Garantir que miniaturasAdicionadas seja um objeto
      if (Array.isArray(miniaturasAdicionadas)) {
        // Converter de array para objeto se for um array antigo
        const novoObjeto = {};
        miniaturasAdicionadas.forEach(nome => {
          if (novoObjeto[nome]) {
            novoObjeto[nome]++;
          } else {
            novoObjeto[nome] = 1;
          }
        });
        miniaturasAdicionadas = novoObjeto;
      }
      atualizarBottomRectangle();
    }
  } catch (e) {
    console.error('Erro ao carregar cache:', e);
  }
}

// Função para carregar a miniatura como sobreposição
function setImage(src, value) {
  // Verificar se uma imagem de fundo foi carregada
  if (!isImageLoaded) {
    console.log('Não é possível adicionar miniaturas sem uma imagem de fundo');
    return;
  }
  
  // Garantir que a tela esteja visível para receber miniaturas
  text.style.display = "none";
  newUpload.style.display = "block";
  inputImage.style.display = "none";
  
  // Habilitar todas as miniaturas se ainda não estiverem habilitadas
  if (!thumbnailsEnabled) {
    thumbnailsEnabled = true;
    const allThumbnails = document.querySelectorAll(".thumbnail");
    console.log(`Ativando ${allThumbnails.length} miniaturas na função setImage`);
    allThumbnails.forEach((thumb) => {
      thumb.classList.remove("disabled");
    });
  }
  
  // Obter o nome da miniatura a partir do atributo alt ou title
  const thumbnailElements = document.querySelectorAll('.thumbnail');
  let nomeMiniatura = "Miniatura";
  
  thumbnailElements.forEach(thumb => {
    if (thumb.src === src || src.includes(thumb.src)) {
      nomeMiniatura = thumb.getAttribute('alt') || "Miniatura";
    }
  });

  // Configuração de dimensões personalizadas para cada miniatura
  const dimensoesPorMiniatura = {
    'thumb1.png': { largura: 150, altura: 150 },
    'thumb2.png': { largura: 128, altura: 128 }, // 15% menor que o padrão
    'thumb3.png': { largura: 143, altura: 143 }, // 5% menor que o padrão
    'thumb4.png': { largura: 160, altura: 160 }, // 7% maior que o padrão
    'thumb5.png': { largura: 155, altura: 155 }, // 3% maior que o padrão
    'thumb6.png': { largura: 145, altura: 145 }, // 3% menor que o padrão
    'thumb7.png': { largura: 165, altura: 165 }, // 10% maior que o padrão
    'thumb8.png': { largura: 150, altura: 150 }, // tamanho padrão
    'thumb9.png': { largura: 128, altura: 128 }, // 15% menor que o padrão
    'thumb10.png': { largura: 140, altura: 140 }, // 7% menor que o padrão
    'thumb11.png': { largura: 170, altura: 170 }  // 13% maior que o padrão
  };
  
  // Extrair o nome do arquivo da URL
  const fileName = src.toLowerCase();
  let thumbName = '';
  
  // Encontrar qual miniatura está sendo usada
  Object.keys(dimensoesPorMiniatura).forEach(nome => {
    if (fileName.includes(nome)) {
      thumbName = nome;
    }
  });
  
  // Definir dimensões com base na miniatura identificada ou usar padrão
  let largura = 150; // Valor padrão caso não encontre correspondência
  let altura = 150; // Valor padrão caso não encontre correspondência
  
  if (thumbName && dimensoesPorMiniatura[thumbName]) {
    console.log(`Aplicando dimensões personalizadas para: ${thumbName}`);
    largura = dimensoesPorMiniatura[thumbName].largura;
    altura = dimensoesPorMiniatura[thumbName].altura;
  }

  const newPreview = document.createElement("img");
  newPreview.src = src;
  newPreview.style.position = "absolute";
  newPreview.style.zIndex = "10";
  newPreview.style.left = "0px";
  newPreview.style.top = "0px";
  newPreview.classList.add("draggable");
  newPreview.style.width = `${largura}px`; // Define a largura via estilo
  newPreview.style.height = `${altura}px`; // Define a altura via estilo
  newPreview.setAttribute('data-value', value); // Armazenar o valor como atributo

  screen.appendChild(newPreview);

  // Atualiza a soma total
  totalSum += parseFloat(value);
  atualizarTotalSum();

  // Adicionar ou incrementar a contagem da miniatura no objeto de miniaturas adicionadas
  // Não adicionar a miniatura 'Gato' ao objeto miniaturasAdicionadas
  if (nomeMiniatura !== 'Gato') {
    if (miniaturasAdicionadas[nomeMiniatura]) {
      miniaturasAdicionadas[nomeMiniatura]++;
    } else {
      miniaturasAdicionadas[nomeMiniatura] = 1;
    }
  }
  
  // Atualizar o bottom-rectangle com as miniaturas adicionadas
  atualizarBottomRectangle();

  makeThumbnailDraggable(newPreview, value);
  
  // Mostrar os botões de rotação e lixeira
  lixoImage.style.display = "inline-block";
  document.querySelector(".rotate-buttons-container").style.display = "flex";
  
  // Salvar no cache após adicionar uma nova miniatura
  saveThumbnailsToCache();
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
        // Remover a miniatura do DOM
        currentThumbnail.remove();
        
        // Atualizar o valor total
        totalSum -= parseFloat(value);
        atualizarTotalSum();
        
        // Identificar a miniatura pelo nome do arquivo na URL da imagem
        const src = currentThumbnail.src;
        const fileName = src.toLowerCase();
        let thumbName = '';
        
        // Verificar qual miniatura está sendo usada com base no nome do arquivo
        const thumbTypes = ['thumb1.png', 'thumb2.png', 'thumb3.png', 'thumb4.png', 'thumb5.png', 
                           'thumb6.png', 'thumb7.png', 'thumb8.png', 'thumb9.png', 'thumb10.png', 'thumb11.png'];
        
        for (const nome of thumbTypes) {
          if (fileName.includes(nome)) {
            thumbName = nome;
            break;
          }
        }
        
        // Obter o nome da miniatura a partir das miniaturas existentes no DOM
        let miniaturaNome = null;
        const thumbnailElements = document.querySelectorAll('.thumbnail');
        
        thumbnailElements.forEach(thumb => {
          const thumbSrc = thumb.src.toLowerCase();
          if (thumbSrc.includes(thumbName)) {
            miniaturaNome = thumb.getAttribute('alt') || thumb.getAttribute('title') || `Miniatura ${thumbName.replace('.png', '')}`;
          }
        });
        
        if (!miniaturaNome) {
          miniaturaNome = `Miniatura ${thumbName.replace('.png', '')}`;
        }
        
        let encontrado = false;
        
        // Verificar se a miniatura existe exatamente com esse nome
        if (miniaturasAdicionadas[miniaturaNome]) {
          encontrado = true;
        } else {
          // Se não encontrar pelo nome exato, procurar por correspondência parcial
          for (const nome in miniaturasAdicionadas) {
            if (nome.includes(miniaturaNome) || miniaturaNome.includes(nome)) {
              miniaturaNome = nome;
              encontrado = true;
              break;
            }
          }
        }
        
        if (encontrado && miniaturaNome !== 'Gato') {
          // Decrementar a contagem apenas se não for 'Gato'
          miniaturasAdicionadas[miniaturaNome]--;
          console.log(`Contagem da miniatura ${miniaturaNome} decrementada para ${miniaturasAdicionadas[miniaturaNome]}`);
          
          // Se a contagem chegar a zero, remover a miniatura do objeto
          if (miniaturasAdicionadas[miniaturaNome] <= 0) {
            delete miniaturasAdicionadas[miniaturaNome];
            console.log(`Miniatura ${miniaturaNome} removida completamente`);
          }
          
          // Atualizar o bottom-rectangle imediatamente após a remoção
          atualizarBottomRectangle();
        } else {
          console.log(`Não foi possível encontrar a miniatura pelo nome: ${miniaturaNome}`);
        }
        
        // Atualizar o bottom-rectangle
        atualizarBottomRectangle();
        
        // Salvar o estado atual no cache após remover a miniatura
        saveThumbnailsToCache();
        
        // Resetar a referência à miniatura atual
        currentThumbnail = null;
        
        // Verificar se o objeto miniaturasAdicionadas está vazio e atualizar a interface
        if (Object.keys(miniaturasAdicionadas).length === 0) {
          const bottomRectangle = document.querySelector('.bottom-rectangle');
          if (bottomRectangle) {
            bottomRectangle.innerHTML = '<p>Nenhuma miniatura adicionada ainda.</p>';
          }
        }
      }
    }
  }

  function stopDrag() {
    isDragging = false;
    // Salvar o estado atual das miniaturas após parar de arrastar
    saveThumbnailsToCache();
  }
}

// Função para calcular o frete usando a API ViaCEP
async function calcularFreteCorreios(cepDestino) {
  try {
    const cepOrigem = "37500356"; // CEP de origem fixo
    
    // Remover caracteres não numéricos do CEP
    cepDestino = cepDestino.replace(/\D/g, "");
    
    // Validar o formato do CEP
    if (cepDestino.length !== 8) {
      throw new Error("CEP inválido");
    }
    
    // Tentar usar a API ViaCEP para validar o CEP primeiro
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cepDestino}/json/`);
    const viaCepData = await viaCepResponse.json();
    
    // Se o CEP não existir, lançar erro
    if (viaCepData.erro) {
      throw new Error("CEP não encontrado");
    }
    
    // Como a API dos Correios pode ter restrições de CORS, vamos usar uma abordagem alternativa
    // baseada na região do CEP, mas com mais precisão usando os dados do ViaCEP
    
    // Obter a região do CEP (primeiros 2 dígitos)
    const regiaoDestino = cepDestino.slice(0, 2);
    
    // Base de cálculo por região
    const fretesPorRegiao = {
      // Norte
      66: 45.0, 67: 45.0, 68: 48.0, 69: 48.0,
      // Nordeste
      40: 35.0, 41: 35.0, 42: 36.0, 43: 36.0, 44: 37.0, 45: 37.0,
      46: 38.0, 47: 38.0, 48: 39.0, 49: 39.0, 50: 40.0, 51: 40.0,
      52: 41.0, 53: 41.0, 54: 42.0, 55: 42.0, 56: 43.0, 57: 43.0, 58: 44.0, 59: 44.0,
      // Centro-Oeste
      70: 30.0, 71: 30.0, 72: 31.0, 73: 31.0, 74: 32.0, 75: 32.0, 76: 33.0, 77: 33.0, 78: 34.0, 79: 34.0,
      // Sudeste (mais barato para a mesma região)
      30: 15.0, 31: 15.0, 32: 16.0, 33: 16.0, 34: 17.0, 35: 17.0, 36: 18.0, 37: 18.0, 38: 19.0, 39: 19.0,
      // São Paulo
      01: 25.0, 02: 25.0, 03: 25.0, 04: 25.0, 05: 25.0, 06: 26.0, 07: 26.0, 08: 26.0, 09: 26.0,
      // Sul
      80: 28.0, 81: 28.0, 82: 29.0, 83: 29.0, 84: 30.0, 85: 30.0, 86: 31.0, 87: 31.0, 88: 32.0, 89: 32.0, 90: 33.0
    };
    
    // Calcular o frete base pela região
    let freteBase = fretesPorRegiao[regiaoDestino] || 35.0;
    
    // Ajustar o frete com base na distância (usando UF como referência)
    const uf = viaCepData.uf;
    const ufMultiplicadores = {
      'MG': 1.0,  // Mesmo estado (base)
      'SP': 1.2,  // Estados próximos
      'RJ': 1.2,
      'ES': 1.2,
      'GO': 1.3,
      'MS': 1.3,
      'PR': 1.4,
      'SC': 1.5,
      'RS': 1.6,
      'BA': 1.7,
      'MT': 1.8,
      'TO': 1.9,
      'DF': 1.3,
      // Estados mais distantes
      'AM': 2.5,
      'RR': 2.6,
      'AP': 2.6,
      'PA': 2.4,
      'RO': 2.3,
      'AC': 2.7,
      'MA': 2.2,
      'PI': 2.1,
      'CE': 2.0,
      'RN': 2.0,
      'PB': 2.0,
      'PE': 1.9,
      'AL': 1.9,
      'SE': 1.8
    };
    
    // Aplicar o multiplicador por UF
    const multiplicador = ufMultiplicadores[uf] || 1.5;
    const freteCalculado = freteBase * multiplicador;
    
    // Arredondar para 2 casas decimais
    return Math.round(freteCalculado * 100) / 100;
    
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    // Em caso de erro, usar o cálculo de backup
    return calcularFreteBackup(cepDestino);
  }
}

// Função de backup para calcular o frete quando a API falhar
function calcularFreteBackup(cepDestino) {
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
  const cepInput = document.getElementById("cep");

  // Função para formatar o CEP enquanto o usuário digita
  function formatarCEP(cep) {
    cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
    cep = cep.replace(/^(\d{5})(\d)/, '$1-$2'); // Adiciona hífen após o 5º dígito
    return cep;
  }

  // Adicionar evento de formatação ao campo de CEP
  if (cepInput) {
    cepInput.addEventListener('input', function() {
      this.value = formatarCEP(this.value);
    });

    // Adicionar evento de tecla Enter para calcular o frete
    cepInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        calcularFreteButton.click();
      }
    });
  }

  if (calcularFreteButton && resultadoFrete) {
    calcularFreteButton.addEventListener("click", async function () {
      const cep = cepInput.value.replace(/\D/g, "");

      // Validação do CEP
      const cepRegex = /^[0-9]{8}$/;
      if (!cepRegex.test(cep)) {
        resultadoFrete.textContent =
          "Por favor, insira um CEP válido com 8 dígitos.";
        resultadoFrete.style.color = "#ff0000";
        return;
      }

      resultadoFrete.textContent = "Calculando frete...";
      resultadoFrete.style.color = "#333";
      
      try {
        const valorFrete = await calcularFreteCorreios(cep);
        if (valorFrete) {
          frete = valorFrete;
          resultadoFrete.textContent = `Frete R$ ${valorFrete.toFixed(2)}`;
          resultadoFrete.style.color = "#007700";
          atualizarTotalGeral();
          
          // Salvar o frete no sessionStorage
          sessionStorage.setItem('frete', frete.toString());
        } else {
          resultadoFrete.textContent = "Erro ao calcular o frete. Tente novamente.";
          resultadoFrete.style.color = "#ff0000";
        }
      } catch (error) {
        console.error("Erro ao calcular frete:", error);
        resultadoFrete.textContent = "Erro ao calcular o frete. Tente novamente.";
        resultadoFrete.style.color = "#ff0000";
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
    return canvas.toDataURL("image/png");
  });
}

// Variável para controlar se as miniaturas já foram renderizadas
let miniaturasJaRenderizadas = false;

// Função para renderizar as miniaturas na interface
async function renderizarMiniaturas() {
  const miniaturasContainer = document.getElementById('miniaturas-container');
  
  // Verificar se o container foi encontrado
  if (!miniaturasContainer) {
    console.error('Erro crítico: Container de miniaturas não encontrado no DOM!');
    return;
  }
  
  // Verificar se as miniaturas já foram renderizadas para evitar duplicação
  if (miniaturasJaRenderizadas && miniaturasContainer.querySelectorAll('.miniatura-item').length > 0) {
    console.log('Miniaturas já foram renderizadas, ignorando chamada duplicada.');
    return;
  }
  
  // Limpar o container antes de adicionar novas miniaturas
  miniaturasContainer.innerHTML = '';
  
  try {
    console.log('Iniciando renderização de miniaturas...');
    // Buscar miniaturas do banco de dados
    const miniaturas = await carregarMiniaturasDoBanco();
    console.log('Miniaturas obtidas para renderização:', miniaturas);
    
    // Se não houver miniaturas, não mostrar mensagem de erro
    if (!miniaturas || miniaturas.length === 0) {
      console.warn('Nenhuma miniatura encontrada para renderizar');
      return;
    }
    
    // Criar um mapa para rastrear miniaturas já adicionadas e evitar duplicatas
    const miniaturasAdicionadas = new Set();
    
    // Renderizar cada miniatura
    miniaturas.forEach((miniatura, index) => {
      // Verificar se esta miniatura já foi adicionada
      const miniaturaId = miniatura.id || miniatura.nome;
      if (miniaturasAdicionadas.has(miniaturaId)) {
        console.log(`Miniatura ${miniaturaId} já foi adicionada, ignorando duplicata.`);
        return;
      }
      
      // Adicionar ao conjunto de miniaturas já processadas
      miniaturasAdicionadas.add(miniaturaId);
      
      console.log(`Renderizando miniatura ${index + 1}/${miniaturas.length}:`, miniatura.nome);
      
      // Criar container para cada miniatura
      const miniaturaContainer = document.createElement('div');
      miniaturaContainer.className = 'miniatura-item';
      
      // Criar imagem
      const img = document.createElement('img');
      
      // Extrair o nome do arquivo da URL
      let nomeArquivo = '';
      if (miniatura.imagem_path) {
        // Normalizar o caminho da imagem
        const pathParts = miniatura.imagem_path.split('/');
        nomeArquivo = pathParts[pathParts.length - 1];
      }
      
      // Se o nome do arquivo estiver vazio, usar um fallback baseado no índice
      if (!nomeArquivo) {
        nomeArquivo = `thumb${(index % 9) + 1}.png`;
        console.warn(`Nome de arquivo vazio para miniatura ${miniatura.nome}, usando fallback: ${nomeArquivo}`);
      }
      
      // Definir o caminho da imagem baseado no ambiente
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocalhost ? '' : 'https://archicat-backend.onrender.com';
      
      // Usar caminho relativo em localhost e absoluto em produção
      img.src = isLocalhost ? `img/${nomeArquivo}` : `${baseUrl}/pagina2/img/${nomeArquivo}`;
      img.className = 'thumbnail';
      
      console.log(`Carregando miniatura de: ${img.src}`);
      
      // Adicionar evento para tratar erros de carregamento da imagem
      img.onerror = function() {
        console.error(`Erro ao carregar imagem da miniatura: ${nomeArquivo}`);
        
        // Determinar a URL base com base no ambiente
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalhost ? '' : 'https://archicat-backend.onrender.com';
        
        // Tentar caminhos alternativos
        if (this.src.includes('img/')) {
          // Tentar caminho relativo à raiz
          let alternativePath;
          if (isLocalhost) {
            alternativePath = `../img/${nomeArquivo}`;
          } else {
            // Em produção, tentar o caminho absoluto
            alternativePath = `${baseUrl}/img/${nomeArquivo}`;
          }
          console.log(`Tentando caminho alternativo: ${alternativePath}`);
          this.src = alternativePath;
          
          // Adicionar um segundo handler de erro para o caminho alternativo
          this.onerror = function() {
            console.error(`Falha no caminho alternativo, tentando caminho completo`);
            // Tentar um terceiro caminho com URL completa
            const fullPath = isLocalhost 
              ? `http://localhost:3000/img/${nomeArquivo}` 
              : `${baseUrl}/pagina2/img/${nomeArquivo}`;
            console.log(`Tentando caminho completo: ${fullPath}`);
            this.src = fullPath;
            
            // Último handler de erro
            this.onerror = function() {
              console.error(`Todas as tentativas falharam, usando ícone padrão`);
              this.src = isLocalhost ? 'img/icon2.ico' : `${baseUrl}/img/icon2.ico`;
              this.alt = 'Imagem não disponível';
            };
          };
        } else {
          const iconPath = isLocalhost ? 'img/icon2.ico' : `${baseUrl}/img/icon2.ico`;
          console.log(`Usando ícone padrão: ${iconPath}`);
          this.src = iconPath;
          this.alt = 'Imagem não disponível';
        }
      };
      
      // Garantir que o preço seja um número antes de usar toString() e toFixed()
      const preco = typeof miniatura.preco === 'number' ? miniatura.preco : parseFloat(miniatura.preco);
      
      // Verificar se o preço é um número válido após a conversão
      if (isNaN(preco)) {
        console.error('Preço inválido para a miniatura:', miniatura.nome, miniatura.preco);
        img.setAttribute('data-value', '0');
        img.setAttribute('alt', miniatura.nome);
        img.setAttribute('title', `${miniatura.nome} - R$ 0.00`);
      } else {
        img.setAttribute('data-value', preco.toString());
        img.setAttribute('alt', miniatura.nome);
        img.setAttribute('title', `${miniatura.nome} - R$ ${preco.toFixed(2)}`);
      }
      
      // Definir dimensões da miniatura com base no nome ou tipo
      const thumbName = miniatura.nome.toLowerCase();
      const nomeArquivoLower = nomeArquivo.toLowerCase();
      
      // Configuração de dimensões personalizadas para cada miniatura
      const dimensoesPorMiniatura = {
        'thumb1.png': { largura: 100, altura: 100 }, // Caixa
        'thumb2.png': { largura: 80, altura: 80 }, // Degrau
        'thumb3.png': { largura: 120, altura: 120 }, // Prateleira
        'thumb4.png': { largura: 125, altura: 125 }, // Ponte 1
        'thumb5.png': { largura: 135, altura: 135 }, // Ponte 2
        'thumb6.png': { largura: 135, altura: 135 }, // Ponte 3
        'thumb7.png': { largura: 165, altura: 165 }, // Arranhador menor (não existe)
        'thumb8.png': { largura: 150, altura: 150 }, // Arranhador 
        'thumb9.png': { largura: 128, altura: 128 }, // Rede
        'thumb10.png': { largura: 100, altura: 100 }, // Gato
      };
      
      // Valores padrão caso não encontre correspondência
      let largura = 150;
      let altura = 150;
      
      // Verificar qual miniatura está sendo usada e aplicar dimensões personalizadas
      Object.keys(dimensoesPorMiniatura).forEach(nome => {
        if (nomeArquivoLower.includes(nome)) {
          console.log(`Aplicando dimensões personalizadas para: ${nome}`);
          largura = dimensoesPorMiniatura[nome].largura;
          altura = dimensoesPorMiniatura[nome].altura;
        }
      });
      
      // Definir as dimensões da miniatura
      img.style.width = `${largura}px`;
      img.style.height = `${altura}px`;
      
      img.style.marginTop = '10px';
      img.style.cursor = 'pointer';
      img.style.transition = 'transform 0.2s';
      
      // Adicionar efeito de hover
      img.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.1)';
      });
      
      img.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
      });
      
      // Adicionar evento de clique
      img.onclick = function() {
        // Verificar se a imagem de fundo foi carregada antes de permitir o uso das miniaturas
        if (isImageLoaded) {
          setImage(this.src, this.getAttribute('data-value'));
        } else {
          console.log('Não é possível usar miniaturas sem uma imagem de fundo');
        }
      };
      
      // Criar label com nome e preço, exceto para a imagem10
      const label = document.createElement('div');
      label.className = 'miniatura-label';
      
      // Adicionar elementos ao container da miniatura
      miniaturaContainer.appendChild(img);
      
      // Verificar se é a imagem10 - não mostrar nome nem valor
      if (nomeArquivo.toLowerCase().includes('thumb10') || thumbName.includes('imagem10') || thumbName.includes('thumb10')) {
        // Não adicionar label para a imagem10
        console.log('Imagem10 detectada, ocultando nome e valor');
      } else {
        // Verificar se o preço é nulo, indefinido ou zero
        if (miniatura.preco === null || miniatura.preco === undefined || miniatura.preco === 0) {
          label.innerHTML = `<span class="miniatura-nome">${miniatura.nome}</span><span class="miniatura-preco">Grátis</span>`;
        } else {
          label.innerHTML = `<span class="miniatura-nome">${miniatura.nome}</span><span class="miniatura-preco">R$ ${miniatura.preco.toFixed(2)}</span>`;
        }
        miniaturaContainer.appendChild(label);
      }
      
      // Adicionar o container da miniatura ao container principal
      miniaturasContainer.appendChild(miniaturaContainer);
      
      // Adicionar a classe disabled às miniaturas inicialmente
      img.classList.add("disabled");
    });
    
    // Marcar que as miniaturas já foram renderizadas
    miniaturasJaRenderizadas = true;
    
    // Manter as miniaturas desativadas até que uma imagem seja carregada
    thumbnailsEnabled = false;
    const thumbnails = document.querySelectorAll(".thumbnail");
    thumbnails.forEach((thumb) => {
      thumb.classList.add("disabled");
    });
    
  } catch (error) {
    console.error('Erro ao renderizar miniaturas:', error);
    // Não mostrar mensagem de erro no container
  }
}

// Adicionar evento de clique ao botão de finalizar pagamento e carregar cache quando a página for carregada
document.addEventListener("DOMContentLoaded", function() {
  console.log('Página carregada, inicializando...');
  
  // Inicializar o bottom-rectangle
  atualizarBottomRectangle();
  
  // Primeiro carregar a imagem de fundo do cache (se existir)
  const backgroundLoaded = loadBackgroundImageFromCache();
  console.log('Imagem de fundo carregada do cache:', backgroundLoaded);
  
  if (backgroundLoaded) {
    // Se a imagem de fundo foi carregada, também carregamos as miniaturas
    loadThumbnailsFromCache();
    console.log('Estado da imagem carregada:', isImageLoaded);
    // Garantir que as miniaturas sejam habilitadas
    const allThumbnails = document.querySelectorAll(".thumbnail");
    allThumbnails.forEach((thumb) => {
      thumb.classList.remove("disabled");
    });
  } else {
    // Se não houver imagem de fundo, garantir que as miniaturas estejam desabilitadas
    isImageLoaded = false;
    thumbnailsEnabled = false;
  }
  
  // Carregar as miniaturas do banco de dados imediatamente
  // Isso deve acontecer independentemente de haver uma imagem de fundo ou não
  renderizarMiniaturas();
  
  // Configurar o botão de finalizar pagamento
  const finalizarComraButton = document.getElementById("finalizarComraButton");
  if (finalizarComraButton) {
    finalizarComraButton.addEventListener("click", function() {
      // Salvar o estado atual das miniaturas antes de redirecionar
      saveThumbnailsToCache();
      
      // Salvar o valor total na sessionStorage antes de redirecionar
      const totalGeral = document.getElementById('total-geral').textContent;
      sessionStorage.setItem('totalGeral', totalGeral);
      
      // Salvar as informações do bottomRectangle no sessionStorage
      const bottomRectangle = document.querySelector('.bottom-rectangle');
      if (bottomRectangle) {
        sessionStorage.setItem('bottomRectangleContent', bottomRectangle.innerHTML);
      }
      
      // Salvar o objeto de miniaturas adicionadas para uso no e-mail
      // Garantir que seja salvo mesmo se bottomRectangle não existir
      console.log('Salvando miniaturasAdicionadas no sessionStorage:', miniaturasAdicionadas);
      sessionStorage.setItem('miniaturasAdicionadasObj', JSON.stringify(miniaturasAdicionadas));
      
      // Salvar também em miniaturasAdicionadas para compatibilidade
      sessionStorage.setItem('miniaturasAdicionadas', JSON.stringify(miniaturasAdicionadas));
      
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
            
            // Armazenar também as informações das miniaturas no sessionStorage
            // para que possam ser recuperadas na página de pagamento se necessário
            const thumbnailElements = screen.querySelectorAll('.draggable');
            const thumbnailsData = [];
            
            thumbnailElements.forEach(thumb => {
              thumbnailsData.push({
                src: thumb.src,
                left: thumb.style.left,
                top: thumb.style.top,
                width: thumb.style.width,
                height: thumb.style.height,
                transform: thumb.style.transform,
                value: thumb.getAttribute('data-value') || '0'
              });
            });
            
            sessionStorage.setItem('thumbnailsData', JSON.stringify(thumbnailsData));
            console.log("Dados das miniaturas armazenados com sucesso!");
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
        // Criar link para download pelo usuário
        const link = document.createElement("a");
        link.href = canvasImage;
        link.download = "imagem_da_tela.png";
        link.click();
        
        // Determinar a URL do servidor com base no ambiente
        const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:3000/api/send-image'
          : 'https://archicat-backend.onrender.com/api/send-image';
        
        console.log('Enviando imagem para:', serverUrl);
        
        // Enviar a imagem para o servidor para envio por e-mail
        fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: canvasImage
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Imagem enviada com sucesso para o e-mail!');
          } else {
            console.error('Erro ao enviar imagem para o e-mail:', data.error);
          }
        })
        .catch(error => {
          console.error('Erro na requisição de envio de e-mail:', error);
        });
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
