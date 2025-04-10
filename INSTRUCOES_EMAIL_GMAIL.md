# Instruções para Configurar o Envio de E-mail no ArchiCat

## Problema
O sistema não está conseguindo enviar e-mails para `contato.archicat@gmail.com` devido a políticas de segurança do Google que bloqueiam o acesso de aplicativos menos seguros.

## Solução: Criar uma Senha de Aplicativo

O Google requer o uso de "Senhas de Aplicativo" para permitir que aplicações como o ArchiCat enviem e-mails através de contas Gmail. Siga os passos abaixo para configurar:

### 1. Ativar Verificação em Duas Etapas (se ainda não estiver ativada)

1. Acesse [sua conta Google](https://myaccount.google.com)
2. Navegue até **Segurança**
3. Em "Como você faz login no Google", clique em **Verificação em duas etapas**
4. Siga as instruções para ativar

### 2. Criar uma Senha de Aplicativo

1. Acesse [sua conta Google](https://myaccount.google.com)
2. Navegue até **Segurança**
3. Em "Como você faz login no Google", clique em **Senhas de app**
   - Se você não vir esta opção, significa que:
     - A verificação em duas etapas não está configurada para sua conta
     - A verificação em duas etapas está configurada apenas para chaves de segurança
     - Sua conta é gerenciada por trabalho, escola ou outra organização
     - Você ativou o Acesso Avançado à Proteção
4. Na parte inferior, selecione **Selecionar app** e escolha **Outro (Nome personalizado)**
5. Digite "ArchiCat" e clique em **Gerar**
6. O Google exibirá uma senha de aplicativo de 16 caracteres. **Copie esta senha**

### 3. Atualizar o Arquivo .env

1. Abra o arquivo `.env` localizado na pasta `backend`
2. Localize a linha `EMAIL_PASSWORD=sua_senha_aqui`
3. Substitua `sua_senha_aqui` pela senha de aplicativo que você acabou de gerar
4. Salve o arquivo

### 4. Reiniciar o Servidor

1. Pare o servidor atual (se estiver em execução)
2. Inicie o servidor novamente usando o script `iniciar-servidor.bat`

### 5. Verificar

Para confirmar que o e-mail está sendo enviado corretamente:

1. Realize um pagamento de teste
2. Verifique a caixa de entrada do e-mail `contato.archicat@gmail.com`
3. Verifique o console do servidor para mensagens de sucesso ou erro relacionadas ao envio de e-mail

## Observações Importantes

- A senha de aplicativo é uma sequência de 16 caracteres sem espaços
- Não use a senha normal da conta de e-mail, use APENAS a senha de aplicativo
- Cada senha de aplicativo só pode ser visualizada uma vez durante a criação
- Se você perder a senha, precisará gerar uma nova
- As senhas de aplicativo não expiram, mas você pode revogá-las a qualquer momento nas configurações da sua conta Google