// Seleciona os elementos do DOM
const paymentMethod = document.getElementById("payment-method");
const creditCardFields = document.getElementById("credit-card-fields");
const pixFields = document.getElementById("pix-fields");
const paymentForm = document.getElementById("payment-form");
const messageDiv = document.getElementById("message");
const userImagePreview = document.getElementById("user-image-preview");

// Função para carregar a imagem personalizada do sessionStorage
function loadUserImage() {
  try {
    // Tentar recuperar a imagem do sessionStorage
    const screenCapture = sessionStorage.getItem('screenCapture');
    console.log('Verificando imagem no sessionStorage:', screenCapture ? 'Imagem encontrada' : 'Nulo ou vazio');
    
    // Verificar se há uma imagem no sessionStorage
    if (screenCapture && screenCapture.length > 0) {
      // Criar elemento de imagem
      const img = document.createElement('img');
      
      // Verificar se a string já começa com data:image
      if (!screenCapture.startsWith('data:image')) {
        // Se não tiver o prefixo, adicionar
        img.src = 'data:image/jpeg;base64,' + screenCapture;
        console.log('Prefixo data:image/jpeg;base64, adicionado à imagem');
      } else {
        // Se já tiver o prefixo, usar como está
        img.src = screenCapture;
        console.log('Imagem já possui o prefixo data:image');
      }
      
      // Configurar estilos da imagem
      img.alt = 'Imagem Personalizada';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.border = '1px solid #ccc';
      img.style.borderRadius = '5px';
      img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      
      // Adicionar evento para verificar se a imagem carregou corretamente
      img.onload = function() {
        console.log('Imagem carregada com sucesso! Dimensões:', img.width, 'x', img.height);
      };
      
      img.onerror = function() {
        console.error('Erro ao carregar a imagem - evento onerror acionado');
        userImagePreview.innerHTML = '<p>Erro ao carregar a imagem. Formato inválido.</p>';
      };
      
      // Limpar o container antes de adicionar a nova imagem
      userImagePreview.innerHTML = '';
      
      // Adicionar a imagem ao container
      userImagePreview.appendChild(img);
      console.log('Elemento de imagem adicionado ao DOM');
    } else {
      console.log('Nenhuma imagem personalizada encontrada no sessionStorage.');
      userImagePreview.innerHTML = '<p>Nenhuma imagem personalizada disponível.</p>';
    }
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    userImagePreview.innerHTML = '<p>Erro ao processar a imagem personalizada.</p>';
  }
}

// Carregar a imagem quando a página for carregada
document.addEventListener('DOMContentLoaded', loadUserImage);

// Inicializa o Mercado Pago com a chave pública
const mp = new MercadoPago("APP_USR-e00cb746-fa99-43d6-9aa3-3c998fa3d5f3");

// Função para criar os campos de cartão de crédito
function createCreditCardFields() {
  creditCardFields.innerHTML = `
    <label for="card-number">Número do Cartão:</label>
    <input type="text" id="card-number" name="card-number" placeholder="1234 5678 9012 3456" required>

    <label for="expiry-date">Data de Validade:</label>
    <input type="text" id="expiry-date" name="expiry-date" placeholder="MM/AA" required>

    <label for="cvv">CVV:</label>
    <input type="text" id="cvv" name="cvv" placeholder="123" required>

    <label for="cardholder-name">Nome do Titular:</label>
    <input type="text" id="cardholder-name" name="cardholder-name" placeholder="Nome como no cartão" required>

    <label for="cpf">CPF:</label>
    <input type="text" id="cpf" name="cpf" placeholder="123.456.789-00" required>
  `;
}

// Função para remover os campos de cartão de crédito
function removeCreditCardFields() {
  creditCardFields.innerHTML = ""; // Remove todos os campos
}

// Função para atualizar a exibição dos campos
function updatePaymentFields() {
  const selectedMethod = paymentMethod.value;
  const creditCardButton = document.getElementById("credit-card-button");

  if (selectedMethod === "credit-card") {
    // Mostra campos de cartão e esconde campos PIX
    creditCardFields.classList.remove("hidden");
    pixFields.classList.add("hidden");
    creditCardButton.classList.remove("hidden"); // Mostra o botão de cartão de crédito
    createCreditCardFields(); // Cria os campos de cartão
    
    // Remove o atributo required dos campos PIX quando estão ocultos
    document.getElementById('pix-name').removeAttribute('required');
    document.getElementById('pix-cpf').removeAttribute('required');
    document.getElementById('pix-email').removeAttribute('required');
    document.getElementById('pix-telefone').removeAttribute('required');
  } else if (selectedMethod === "pix") {
    // Mostra campos PIX e esconde campos de cartão
    creditCardFields.classList.add("hidden");
    pixFields.classList.remove("hidden");
    creditCardButton.classList.add("hidden"); // Esconde o botão de cartão de crédito
    removeCreditCardFields(); // Remove os campos de cartão
    
    // Adiciona o atributo required aos campos PIX quando estão visíveis
    document.getElementById('pix-name').setAttribute('required', '');
    document.getElementById('pix-cpf').setAttribute('required', '');
    document.getElementById('pix-email').setAttribute('required', '');
    document.getElementById('pix-telefone').setAttribute('required', '');
  }
}

// Função para processar o pagamento via PIX
async function processPixPayment() {
  try {
    // Obter os valores dos campos de nome e CPF
    const pixName = document.getElementById('pix-name').value;
    const pixCpf = document.getElementById('pix-cpf').value;
    const pixEmail = document.getElementById('pix-email').value;
    const pixTelefone = document.getElementById('pix-telefone').value;
    
    // Validar campos obrigatórios
    if (!pixName || !pixCpf || !pixEmail || !pixTelefone) {
      if (messageDiv) {
        messageDiv.innerText = 'Por favor, preencha todos os campos obrigatórios para continuar.';
      }
      return; // Interrompe a execução se os campos não estiverem preenchidos
    }
    
    // Validação básica de CPF (apenas verifica se tem 11 dígitos após remover caracteres especiais)
    const cpfNumerico = pixCpf.replace(/[^0-9]/g, '');
    if (cpfNumerico.length !== 11) {
      if (messageDiv) {
        messageDiv.innerText = 'CPF inválido. Por favor, digite um CPF válido.';
      }
      return;
    }
    
    // Mostrar mensagem de carregamento
    if (messageDiv) {
      messageDiv.innerText = 'Processando pagamento PIX, aguarde...';
    }
    
    // Obter o valor total do sessionStorage ou do elemento total-geral como fallback
    let totalValue = 0;
    const totalFromSession = sessionStorage.getItem('totalGeral');
    
    if (totalFromSession) {
      // Converte o valor da sessionStorage para número
      totalValue = parseFloat(totalFromSession.replace(',', '.'));
      // Atualiza o elemento total-geral com o valor da sessionStorage
      const totalElement = document.getElementById('total-geral');
      if (totalElement) {
        totalElement.textContent = totalFromSession;
      }
    } else {
      // Fallback: obter do elemento total-geral se não estiver na sessionStorage
      const totalElement = document.getElementById('total-geral');
      if (totalElement && totalElement.textContent) {
        totalValue = parseFloat(totalElement.textContent.replace(',', '.'));
      }
    }
    
    // Garantir que o valor seja válido
    if (isNaN(totalValue)) {
      totalValue = 0;
    }
    
    // Dividir o nome completo em nome e sobrenome
    const nomeCompleto = pixName.trim().split(' ');
    const firstName = nomeCompleto[0] || 'Cliente';
    const lastName = nomeCompleto.length > 1 ? nomeCompleto.slice(1).join(' ') : 'ArchiCat';
    
    // Obter os dados de endereço
    const cep = document.getElementById('cep').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    
    // Criar dados para a requisição
    const paymentData = {
      transaction_amount: totalValue,
      description: 'Produtos ArchiCat',
      payer: {
        email: pixEmail,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: 'CPF',
          number: cpfNumerico
        },
        phone: pixTelefone,
        address: {
          zip_code: cep,
          street_name: rua,
          street_number: numero,
          complement: complemento,
          neighborhood: bairro,
          city: cidade,
          state: estado
        }
      }
    };
    
    // Adicionar flag para enviar e-mail
    paymentData.sendEmail = true;
    
    console.log('Enviando dados:', JSON.stringify(paymentData));
    
    // Fazer requisição para o backend
    try {
      const response = await fetch('http://localhost:3000/process-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      // Processar resposta
      if (response.ok) {
        const data = await response.json();
        
        // Exibir QR Code
        const qrCodeContainer = document.getElementById('qr-code-container');
        if (qrCodeContainer && data.qrCodeBase64) {
          // Limpar o conteúdo anterior do container
          qrCodeContainer.innerHTML = '';
          
          // Criar elementos individualmente para melhor controle
          const qrImg = document.createElement('img');
          qrImg.src = `data:image/png;base64,${data.qrCodeBase64}`;
          qrImg.alt = 'QR Code PIX';
          qrCodeContainer.appendChild(qrImg);
          
          const scanText = document.createElement('p');
          scanText.textContent = 'Escaneie o QR Code acima com o aplicativo do seu banco para pagar';
          qrCodeContainer.appendChild(scanText);
          
          const copyText = document.createElement('p');
          copyText.textContent = 'Ou copie o código PIX abaixo:';
          qrCodeContainer.appendChild(copyText);
          
          const pixCodeArea = document.createElement('textarea');
          pixCodeArea.readOnly = true;
          pixCodeArea.className = 'pix-code';
          pixCodeArea.id = 'pix-code-text';
          pixCodeArea.value = data.pixCode;
          qrCodeContainer.appendChild(pixCodeArea);
          
          const copyButton = document.createElement('button');
          copyButton.textContent = 'Copiar código PIX';
          qrCodeContainer.appendChild(copyButton);
          
          // Adicionar evento de clique separadamente
          copyButton.addEventListener('click', function() {
            const pixCodeText = document.getElementById('pix-code-text');
            navigator.clipboard.writeText(pixCodeText.value)
              .then(() => {
                // Feedback visual temporário
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Código copiado!';
                setTimeout(() => {
                  copyButton.textContent = originalText;
                }, 2000);
              })
              .catch(err => {
                console.error('Erro ao copiar texto: ', err);
                if (messageDiv) {
                  messageDiv.innerText = 'Erro ao copiar o código PIX. Tente selecionar e copiar manualmente.';
                }
              });
          });
        }
        
        if (messageDiv) {
          messageDiv.innerText = 'QR Code PIX gerado com sucesso! Escaneie para pagar.';
        }
        
        // Ocultar o botão de gerar QR Code PIX
        const pixButton = document.querySelector('.pix-button');
        if (pixButton) {
          pixButton.style.display = 'none';
        }
        
        // Manter o botão de finalizar e enviar comprovante oculto
        const captureButton = document.getElementById('capture-button');
        if (captureButton) {
          captureButton.style.display = 'none';
        }
        
    
        
        // Adicionar evento ao botão de captura
        document.getElementById('capture-button').addEventListener('click', function() {
          // Capturar a área do QR code
          const qrCodeArea = document.getElementById('qr-code-container');
          
          // Criar um elemento temporário para mostrar mensagem
          const tempMessage = document.createElement('div');
          tempMessage.innerText = 'Processando, aguarde...';
          tempMessage.style.padding = '10px';
          tempMessage.style.backgroundColor = '#f0f0f0';
          tempMessage.style.borderRadius = '5px';
          tempMessage.style.marginTop = '10px';
          qrCodeArea.appendChild(tempMessage);
          
          // Enviar dados e imagem para o servidor
          setTimeout(async () => {
            try {
              // Obter os dados do usuário
              const userData = {
                nome: document.getElementById('pix-name').value,
                cpf: document.getElementById('pix-cpf').value,
                email: document.getElementById('pix-email').value,
                telefone: document.getElementById('pix-telefone').value,
                endereco: {
                  cep: document.getElementById('cep').value,
                  rua: document.getElementById('rua').value,
                  numero: document.getElementById('numero').value,
                  complemento: document.getElementById('complemento').value,
                  bairro: document.getElementById('bairro').value,
                  cidade: document.getElementById('cidade').value,
                  estado: document.getElementById('estado').value
                },
                valor: document.getElementById('total-geral').textContent,
                qrCodeBase64: data.qrCodeBase64,
                screenCapture: sessionStorage.getItem('screenCapture') // Recupera a imagem capturada do sessionStorage
              };
              
              // Enviar dados para o servidor
              const emailResponse = await fetch('http://localhost:3000/send-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
              });
              
              if (emailResponse.ok) {
                tempMessage.innerText = 'E-mail enviado com sucesso!';
                tempMessage.style.backgroundColor = '#d4edda';
                tempMessage.style.color = '#155724';
                
                // Ocultar o botão de finalizar após o envio bem-sucedido
                document.getElementById('capture-button').style.display = 'none';
                
                // Redirecionar para página de sucesso após 2 segundos
                setTimeout(() => {
                  window.location.href = 'success.html';
                }, 2000);
              } else {
                tempMessage.innerText = 'Erro ao enviar e-mail. Tente novamente.';
                tempMessage.style.backgroundColor = '#f8d7da';
                tempMessage.style.color = '#721c24';
              }
            } catch (error) {
              console.error('Erro ao enviar e-mail:', error);
              tempMessage.innerText = 'Erro ao enviar e-mail. Tente novamente.';
              tempMessage.style.backgroundColor = '#f8d7da';
              tempMessage.style.color = '#721c24';
            }
          }, 1000);
        });
      } else {
        // Tratar erro
        try {
          const errorData = await response.json();
          console.error('Erro ao processar PIX:', errorData);
          if (messageDiv) {
            if (errorData.details) {
              messageDiv.innerText = `Erro ao gerar QR Code PIX: ${errorData.details}`;
            } else {
              messageDiv.innerText = 'Erro ao gerar QR Code PIX. Tente novamente.';
            }
          }
        } catch (jsonError) {
          console.error('Erro ao processar resposta de erro:', jsonError);
          if (messageDiv) {
            messageDiv.innerText = `Erro ao gerar QR Code PIX. Status: ${response.status}`;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      if (messageDiv) {
        if (error.message && error.message.includes('Failed to fetch')) {
          messageDiv.innerHTML = 'Erro de conexão com o servidor. <br><br><strong>Como resolver:</strong><br>1. Localize o arquivo <strong>iniciar-servidor.ps1</strong> na pasta principal do projeto<br>2. Clique com o botão direito e selecione "Executar com PowerShell"<br>3. Mantenha a janela do PowerShell aberta<br>4. Tente novamente gerar o QR Code PIX<br><br>Para mais detalhes, consulte o arquivo <strong>COMO_RESOLVER_PAGAMENTO.md</strong>';
        } else {
          messageDiv.innerText = 'Erro ao processar o pagamento. Tente novamente.';
        }
      }
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    if (messageDiv) {
      messageDiv.innerText = 'Erro ao processar o pagamento. Tente novamente.';
    }
  }
}

// Função para carregar o valor total da sessionStorage
function loadTotalFromSession() {
  const totalFromSession = sessionStorage.getItem('totalGeral');
  if (totalFromSession) {
    const totalElement = document.getElementById('total-geral');
    if (totalElement) {
      totalElement.textContent = totalFromSession;
    }
  }
}

// Função para buscar endereço pelo CEP usando a API ViaCEP
async function buscarEnderecoPorCEP(cep) {
  // Remove caracteres não numéricos do CEP
  cep = cep.replace(/\D/g, '');
  
  // Verifica se o CEP tem 8 dígitos
  if (cep.length !== 8) {
    if (messageDiv) {
      messageDiv.innerText = 'CEP inválido. O CEP deve conter 8 dígitos numéricos.';
    }
    return false;
  }
  
  try {
    // Mostra mensagem de carregamento
    if (messageDiv) {
      messageDiv.innerText = 'Buscando endereço, aguarde...';
    }
    
    // Faz a requisição para a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    
    // Verifica se a API retornou erro
    if (data.erro) {
      if (messageDiv) {
        messageDiv.innerText = 'CEP não encontrado. Verifique o CEP informado.';
      }
      return false;
    }
    
    // Preenche os campos de endereço
    document.getElementById('rua').value = data.logradouro;
    document.getElementById('bairro').value = data.bairro;
    document.getElementById('cidade').value = data.localidade;
    document.getElementById('estado').value = data.uf;
    
    // Limpa a mensagem
    if (messageDiv) {
      messageDiv.innerText = 'Endereço encontrado com sucesso!';
      // Limpa a mensagem após 3 segundos
      setTimeout(() => {
        messageDiv.innerText = '';
      }, 3000);
    }
    
    // Foca no campo de número
    document.getElementById('numero').focus();
    
    return true;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    if (messageDiv) {
      messageDiv.innerText = 'Erro ao buscar o CEP. Tente novamente.';
    }
    return false;
  }
}

// Função para formatar o CEP enquanto o usuário digita
function formatarCEP(cep) {
  cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
  cep = cep.replace(/^(\d{5})(\d)/, '$1-$2'); // Adiciona hífen após o 5º dígito
  return cep;
}

// Atualiza os campos ao carregar a página
window.addEventListener("load", function() {
  updatePaymentFields();
  loadTotalFromSession();
  
  // Adiciona evento de clique ao botão de buscar CEP
  const buscarCepButton = document.getElementById('buscar-cep');
  if (buscarCepButton) {
    buscarCepButton.addEventListener('click', function() {
      const cep = document.getElementById('cep').value;
      buscarEnderecoPorCEP(cep);
    });
  }
  
  // Adiciona evento de formatação ao campo de CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', function() {
      this.value = formatarCEP(this.value);
    });
    
    // Adiciona evento de tecla Enter para buscar o CEP
    cepInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault(); // Previne o envio do formulário
        buscarEnderecoPorCEP(this.value);
      }
    });
  }
});

// Escuta mudanças no método de pagamento selecionado
paymentMethod.addEventListener("change", updatePaymentFields);

// Escuta o envio do formulário
paymentForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Evita o envio padrão do formulário

  const selectedMethod = paymentMethod.value;

  // Desativa a validação dos campos que estão ocultos
  if (selectedMethod === "credit-card") {
    // Desativa a validação dos campos PIX que estão ocultos
    const pixInputs = pixFields.querySelectorAll('input[required]');
    pixInputs.forEach(input => {
      input.removeAttribute('required');
      input.dataset.wasRequired = 'true'; // Guarda a informação que era required
    });
    
    // Coleta os dados do cartão de crédito
    const cardData = {
      cardNumber: document.getElementById("card-number").value.replace(/\s/g, ''),
      cardholderName: document.getElementById("cardholder-name").value,
      cardExpirationMonth: document
        .getElementById("expiry-date")
        .value.split("/")[0],
      cardExpirationYear: document
        .getElementById("expiry-date")
        .value.split("/")[1],
      securityCode: document.getElementById("cvv").value,
      identification: {
        type: "CPF",
        number: document.getElementById("cpf").value.replace(/[^0-9]/g, ''),
      },
    };

    // Validar campos do cartão
    if (!cardData.cardNumber || !cardData.cardholderName || !cardData.cardExpirationMonth || 
        !cardData.cardExpirationYear || !cardData.securityCode || !cardData.identification.number) {
      messageDiv.innerText = "Por favor, preencha todos os campos do cartão de crédito.";
      return;
    }

    // Validação básica do número do cartão (deve ter entre 13-19 dígitos)
    if (cardData.cardNumber.length < 13 || cardData.cardNumber.length > 19) {
      messageDiv.innerText = "Número de cartão inválido. Verifique e tente novamente.";
      return;
    }

    // Validação básica de CPF (apenas verifica se tem 11 dígitos após remover caracteres especiais)
    if (cardData.identification.number.length !== 11) {
      messageDiv.innerText = "CPF inválido. Por favor, digite um CPF válido.";
      return;
    }

    // Mostrar mensagem de processamento
    messageDiv.innerText = "Processando pagamento com cartão, aguarde...";

    // Obter o valor total do sessionStorage ou do elemento total-geral como fallback
    let totalValue = 0;
    const totalFromSession = sessionStorage.getItem('totalGeral');
    
    if (totalFromSession) {
      // Converte o valor da sessionStorage para número
      totalValue = parseFloat(totalFromSession.replace(',', '.'));
    } else {
      // Fallback: obter do elemento total-geral se não estiver na sessionStorage
      const totalElement = document.getElementById('total-geral');
      if (totalElement && totalElement.textContent) {
        totalValue = parseFloat(totalElement.textContent.replace(',', '.'));
      }
    }
    
    // Garantir que o valor seja válido
    if (isNaN(totalValue)) {
      totalValue = 0;
    }

    // Criar token do cartão usando o SDK do Mercado Pago
    const cardForm = mp.cardForm({
      amount: totalValue.toString(),
      autoMount: false,
      form: {
        id: "payment-form",
        cardholderName: {
          id: "cardholder-name",
        },
        cardholderEmail: {
          id: "email",
          optional: true
        },
        cardNumber: {
          id: "card-number",
        },
        securityCode: {
          id: "cvv",
        },
        expirationDate: {
          id: "expiry-date",
        },
        identificationType: {
          id: "cpf-type",
          optional: true
        },
        identificationNumber: {
          id: "cpf",
        }
      },
      callbacks: {
        onFormMounted: error => {
          if (error) {
            console.error("Form Mounted error:", error);
            messageDiv.innerText = "Erro ao processar o cartão. Tente novamente.";
          }
        },
        onFormUnmounted: error => {
          if (error) {
            console.error("Form Unmounted error:", error);
          }
        },
        onIdentificationTypesReceived: (error, identificationTypes) => {
          if (error) {
            console.error("identificationTypes error:", error);
          }
        },
        onPaymentMethodsReceived: (error, paymentMethods) => {
          if (error) {
            console.error("paymentMethods error:", error);
            messageDiv.innerText = "Erro ao processar o cartão. Tente novamente.";
          }
        },
        onIssuersReceived: (error, issuers) => {
          if (error) {
            console.error("issuers error:", error);
          }
        },
        onInstallmentsReceived: (error, installments) => {
          if (error) {
            console.error("installments error:", error);
          }
        },
        onCardTokenReceived: (error, token) => {
          if (error) {
            console.error("Token error:", error);
            messageDiv.innerText = "Erro ao processar o cartão. Verifique os dados e tente novamente.";
          } else {
            console.log("Token:", token);
            // Processar pagamento com o token gerado
            processCardPayment(token);
          }
        },
        onSubmit: event => {
          event.preventDefault();
          const cardData = cardForm.getCardFormData();
          console.log("CardForm Data:", cardData);
        },
        onFetching: (resource) => {
          console.log("Fetching resource:", resource);
          messageDiv.innerText = "Processando pagamento...";
          return () => {
            console.log("Done fetching!");
          };
        },
      },
    });

    // Função para processar o pagamento com cartão
    async function processCardPayment(token) {
      try {
        // Dados para enviar ao servidor
        const paymentData = {
          token: token,
          transaction_amount: totalValue,
          description: 'Produtos ArchiCat',
          installments: 1,
          payment_method_id: 'visa', // Pode ser dinâmico baseado no cartão
          payer: {
            email: 'cliente@example.com', // Idealmente, deveria ter um campo para o email
            identification: {
              type: 'CPF',
              number: cardData.identification.number
            }
          }
        };

        // Enviar dados para o servidor
        const response = await fetch('http://localhost:3000/process-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });

        if (response.ok) {
          const data = await response.json();
          messageDiv.innerText = "Pagamento com cartão de crédito processado com sucesso!";
          
          // Redirecionar para página de sucesso após 2 segundos
          setTimeout(() => {
            window.location.href = 'success.html';
          }, 2000);
        } else {
          const errorData = await response.json();
          console.error('Erro ao processar cartão:', errorData);
          messageDiv.innerText = errorData.message || "Erro ao processar o pagamento. Tente novamente.";
        }
      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        if (error.message && error.message.includes('Failed to fetch')) {
          messageDiv.innerHTML = 'Erro de conexão com o servidor. <br>Por favor, execute o arquivo <strong>iniciar-servidor.bat</strong> na pasta principal do projeto e tente novamente.';
        } else {
          messageDiv.innerText = 'Erro ao processar o pagamento. Tente novamente.';
        }
      }
    }

    // Tentar criar o token do cartão
    try {
      cardForm.submit();
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      messageDiv.innerText = "Erro ao processar o cartão. Tente novamente.";
    }
    
    // O envio de e-mail será feito dentro da função processCardPayment após o processamento do pagamento
  } else if (selectedMethod === "pix") {
    // Desativa a validação dos campos de cartão que estão ocultos
    const cardInputs = creditCardFields.querySelectorAll('input[required]');
    cardInputs.forEach(input => {
      input.removeAttribute('required');
      input.dataset.wasRequired = 'true'; // Guarda a informação que era required
    });
    
    // Processa o pagamento via PIX
    processPixPayment();
  }
});
