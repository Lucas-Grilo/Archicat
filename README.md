# ArchiCat - Sistema de Pagamento

## Problema Identificado

O erro `Failed to fetch` que ocorre no arquivo `pagamento.js` (linha 126) está relacionado à tentativa de comunicação com o servidor backend que não está em execução. Este erro acontece quando você clica no botão para gerar o QR Code PIX.

## Solução

Antes de utilizar a funcionalidade de pagamento PIX, é necessário iniciar o servidor backend seguindo os passos abaixo:

### 1. Configuração do Ambiente

Verifique se você possui o arquivo `.env` na pasta `backend` com a seguinte configuração:

```
MERCADO_PAGO_ACCESS_TOKEN=seu_token_do_mercado_pago
PORT=3000
```

### 2. Iniciando o Servidor Backend

Abra um terminal (Prompt de Comando ou PowerShell) e navegue até a pasta do projeto:

```
cd "c:\Users\lucas\OneDrive - SENAC em Minas - EDU\Gato\Site_ArchiCat - Copia\backend"
```

Em seguida, execute o servidor com o comando:

```
node server.js
```

Você deverá ver uma mensagem indicando que o servidor está rodando na porta 3000.

### 3. Utilizando o Sistema de Pagamento

Agora que o servidor está em execução, você pode utilizar a funcionalidade de pagamento PIX normalmente:

1. Navegue até a página de pagamento
2. Selecione a opção PIX
3. Preencha os dados solicitados
4. Clique em "Gerar QR Code PIX"

## Observações Importantes

- O servidor backend deve estar sempre em execução quando você estiver utilizando a funcionalidade de pagamento PIX
- Se você fechar o terminal onde o servidor está rodando, a conexão será interrompida e o erro "Failed to fetch" voltará a ocorrer
- Certifique-se de ter uma conexão com a internet ativa para que as requisições ao Mercado Pago funcionem corretamente