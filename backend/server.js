import express from 'express';
import mercadopago from 'mercadopago';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import sendImageRoute from './send-image-route.js';
import miniaturasRoute from './routes/miniaturas-route.js';
import paymentStatusRoute from './routes/payment-status-route.js';
import serverControlRoute from './routes/server-control-route.js';
import MiniaturaModel from './models/miniatura.js';

// Inicializa o dotenv para carregar as variáveis de ambiente
dotenv.config();

// Forçar a leitura do arquivo .env novamente para garantir que as variáveis sejam carregadas
try {
    const envConfig = dotenv.parse(fs.readFileSync('backend/.env'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log('Arquivo .env carregado manualmente com sucesso');
} catch (error) {
    console.error('Erro ao carregar o arquivo .env manualmente:', error);
}

// Verificar se as variáveis de ambiente foram carregadas corretamente
console.log('Variáveis de ambiente carregadas:');
console.log('EMAIL_PASSWORD definido:', process.env.EMAIL_PASSWORD ? 'Sim' : 'Não');
console.log('MERCADO_PAGO_ACCESS_TOKEN definido:', process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'Sim' : 'Não');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({limit: '50mb'}));

// Configurar para servir arquivos estáticos
app.use(express.static('.'));

// Rotas
app.use('/api', sendImageRoute);
app.use('/api', miniaturasRoute);
app.use('/api', paymentStatusRoute);
app.use('/api', serverControlRoute);

// Inicializar o banco de dados de miniaturas
const miniaturaModel = new MiniaturaModel();
console.log('Banco de dados de miniaturas inicializado');

// Configura o MercadoPago com o token do arquivo .env ou usa um token fixo para testes
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-5435895231544021-030913-1e50c34dcf8d44979782a3c66a834496-433958110';
console.log('Token do Mercado Pago:', accessToken);

// Configurar o Mercado Pago apenas se o token estiver disponível
if (accessToken) {
    mercadopago.configure({ 
        access_token: accessToken 
    });
    console.log('Mercado Pago configurado com sucesso');
} else {
    console.error('ERRO: Token do Mercado Pago não encontrado');
    console.error('O processamento de pagamentos não funcionará, mas o envio de e-mails ainda será testado');
}

app.post('/process-pix', async (req, res) => {
    try {
        console.log('Dados recebidos:', req.body);
        
        // Verificar se os dados necessários estão presentes
        if (!req.body.transaction_amount || !req.body.payer || !req.body.payer.identification) {
            return res.status(400).json({
                error: 'Dados incompletos',
                details: 'Verifique se todos os campos obrigatórios foram enviados'
            });
        }
        
        // Criar objeto de pagamento com os parâmetros corretos
        const paymentData = {
            transaction_amount: Number(req.body.transaction_amount),
            description: req.body.description || 'Produtos ArchiCat',
            payment_method_id: 'pix',
            payer: {
                email: req.body.payer.email,
                first_name: req.body.payer.first_name,
                last_name: req.body.payer.last_name,
                identification: {
                    type: req.body.payer.identification.type,
                    number: req.body.payer.identification.number
                }
            }
        };
        
        console.log('Enviando para Mercado Pago:', paymentData);
        
        const payment = await mercadopago.payment.create(paymentData);

        console.log('Resposta do Mercado Pago:', payment.body);
        
        if (!payment || !payment.body || !payment.body.point_of_interaction) {
            throw new Error('Erro ao gerar o PIX');
        }

        res.json({
            payment_id: payment.body.id,
            status: payment.body.status,
            qrCodeBase64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
            pixCode: payment.body.point_of_interaction.transaction_data.qr_code,
            transactionAmount: payment.body.transaction_amount,
            dateOfExpiration: payment.body.date_of_expiration
        });
    } catch (error) {
        console.error('Erro detalhado:', error);
        console.error('Erro no processamento do PIX:', error);
        res.status(500).json({ 
            error: 'Erro ao processar o pagamento',
            details: error.message 
        });
    }
});

// Configuração do transporter do Nodemailer
// Verificar se a senha do e-mail está definida
if (!process.env.EMAIL_PASSWORD) {
    console.error('ERRO: Senha do e-mail não encontrada no arquivo .env');
    console.error('Por favor, configure a variável EMAIL_PASSWORD no arquivo .env');
    console.error('O sistema NÃO conseguirá enviar e-mails até que esta senha seja configurada!');
    console.error('Siga as instruções no arquivo INSTRUCOES_EMAIL_GMAIL.md para criar uma senha de aplicativo');
} else {
    console.log('Senha do e-mail encontrada no arquivo .env');
    // Ocultar a senha nos logs, mas mostrar os primeiros caracteres para debug
    const maskedPassword = process.env.EMAIL_PASSWORD.substring(0, 3) + '****';
    console.log('Primeiros caracteres da senha:', maskedPassword);
}

// Configuração do transporter do Nodemailer com opções mais compatíveis com Gmail
// NOTA: O Gmail requer uma "Senha de App" para aplicativos menos seguros
// Veja como criar uma senha de app: https://support.google.com/accounts/answer/185833
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
        user: 'contato.archicat@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Senha do arquivo .env (deve ser uma senha de app)
    },
    tls: {
        rejectUnauthorized: false, // Ajuda a evitar problemas de certificado
        minVersion: 'TLSv1.2' // Usar versão mais recente do TLS
    },
    debug: true, // Ativar logs detalhados para diagnóstico
    logger: true, // Ativar logs adicionais
    pool: false, // Desativar pool para garantir que cada e-mail seja enviado em uma nova conexão
    maxConnections: 5 // Limitar o número de conexões simultâneas
});

// Verificar se a senha parece ser uma senha de app (geralmente tem 16 caracteres)
if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.length < 16) {
    console.warn('AVISO: A senha fornecida pode não ser uma senha de app válida do Google.');
    console.warn('As senhas de app do Google geralmente têm 16 caracteres sem espaços.');
    console.warn('Visite https://support.google.com/accounts/answer/185833 para criar uma senha de app.');
}

// Imprimir informações de debug para ajudar na solução de problemas
console.log('Configuração do transporter criada com as seguintes opções:');
console.log('- Host:', 'smtp.gmail.com');
console.log('- Porta:', 465);
console.log('- Secure:', true);
console.log('- User:', 'contato.archicat@gmail.com');
console.log('- TLS rejectUnauthorized:', false);

// Verificar conexão com o servidor de e-mail
transporter.verify(function(error, success) {
    if (error) {
        console.error('Erro na configuração do servidor de e-mail:', error);
    } else {
        console.log('Servidor de e-mail pronto para enviar mensagens');
    }
});

// Rota para enviar e-mail com os dados do pagamento
app.post('/send-email', async (req, res) => {
    try {
        console.log('Recebendo solicitação para enviar e-mail...');
        const userData = req.body;
        
        console.log('Dados recebidos para envio de e-mail:', JSON.stringify(userData, null, 2));
        
        if (!userData || !userData.nome || !userData.email) {
            console.error('Dados incompletos para envio de e-mail');
            return res.status(400).json({
                error: 'Dados incompletos',
                details: 'Verifique se todos os campos obrigatórios foram enviados'
            });
        }
        
        // Verificar se o endereço está presente
        if (!userData.endereco) {
            console.error('Dados de endereço ausentes');
            return res.status(400).json({
                error: 'Dados incompletos',
                details: 'Endereço não fornecido'
            });
        }
        
        // Formatar o endereço completo
        const enderecoCompleto = `${userData.endereco.rua || ''}, ${userData.endereco.numero || ''}${userData.endereco.complemento ? ', ' + userData.endereco.complemento : ''}, ${userData.endereco.bairro || ''}, ${userData.endereco.cidade || ''} - ${userData.endereco.estado || ''}, CEP: ${userData.endereco.cep || ''}`;
        
        console.log('Endereço formatado:', enderecoCompleto);
        
        // Criar o conteúdo das miniaturas para o e-mail
        let miniaturasHtml = '';
        console.log('Processando miniaturas para o e-mail:', userData.miniaturas);
        
        if (userData.miniaturas && Array.isArray(userData.miniaturas) && userData.miniaturas.length > 0) {
            console.log(`Encontradas ${userData.miniaturas.length} miniaturas para incluir no e-mail`);
            miniaturasHtml = `
                <h2>Miniaturas Selecionadas:</h2>
                <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
                    <tr style="background-color: #f2f2f2;">
                        <th>Nome</th>
                        <th>Preço (R$)</th>
                        <th>Posição na Imagem</th>
                    </tr>
            `;
            
            userData.miniaturas.forEach(miniatura => {
                // Formatar informações de posicionamento
                let posicaoInfo = 'Não disponível';
                if (miniatura.posicao) {
                    const left = miniatura.posicao.left ? `Esquerda: ${miniatura.posicao.left}` : '';
                    const top = miniatura.posicao.top ? `Topo: ${miniatura.posicao.top}` : '';
                    const transform = miniatura.posicao.transform ? `Rotação: ${miniatura.posicao.transform}` : '';
                    
                    const posicaoArray = [left, top, transform].filter(item => item !== '');
                    posicaoInfo = posicaoArray.length > 0 ? posicaoArray.join(', ') : 'Posicionada na imagem';
                }
                
                miniaturasHtml += `
                    <tr>
                        <td>${miniatura.nome}</td>
                        <td align="right">R$ ${miniatura.preco.toFixed(2)}</td>
                        <td>${posicaoInfo}</td>
                    </tr>
                `;
            });
            
            // Adicionar linha de total
            const totalMiniaturas = userData.miniaturas.reduce((total, miniatura) => total + miniatura.preco, 0);
            miniaturasHtml += `
                <tr style="font-weight: bold; background-color: #f2f2f2;">
                    <td colspan="2">Total das Miniaturas</td>
                    <td align="right">R$ ${totalMiniaturas.toFixed(2)}</td>
                </tr>
            `;
            
            miniaturasHtml += '</table>';
            
            // Adicionar seção com detalhes das miniaturas posicionadas
            miniaturasHtml += `
                <h3>Detalhes das Miniaturas na Imagem:</h3>
                <p>O cliente posicionou ${userData.miniaturas.length} miniatura(s) na imagem personalizada.</p>
                <ul>
            `;
            
            userData.miniaturas.forEach(miniatura => {
                miniaturasHtml += `<li><strong>${miniatura.nome}</strong> - Posicionada na imagem</li>`;
            });
            
            miniaturasHtml += '</ul>';
        }
        
        // Adicionar informações das miniaturas do bottomRectangle
        if (userData.miniaturasAdicionadas) {
            console.log('Processando informações do bottomRectangle para o e-mail');
            
            miniaturasHtml += `
                <h2>Resumo das Miniaturas Adicionadas:</h2>
                <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
                    <tr style="background-color: #f2f2f2;">
                        <th>Nome da Miniatura</th>
                        <th>Quantidade</th>
                    </tr>
            `;
            
            // Iterar sobre o objeto miniaturasAdicionadas
            Object.entries(userData.miniaturasAdicionadas).forEach(([nome, quantidade]) => {
                miniaturasHtml += `
                    <tr>
                        <td>${nome}</td>
                        <td align="center">${quantidade}</td>
                    </tr>
                `;
            });
            
            miniaturasHtml += '</table>';
        }
        
        // Verificar e processar as miniaturas para o e-mail
        console.log('Verificando miniaturas para o e-mail:', userData.miniaturas ? `${userData.miniaturas.length} miniaturas encontradas` : 'Nenhuma miniatura encontrada');
        console.log('Verificando miniaturasAdicionadas para o e-mail:', userData.miniaturasAdicionadas ? 'Dados encontrados' : 'Nenhum dado encontrado');
        
        // Verificar se a imagem do projeto está presente
        if (userData.screenCapture) {
            console.log('Imagem do projeto encontrada nos dados, tamanho:', userData.screenCapture.length);
        } else {
            console.warn('Imagem do projeto não encontrada nos dados do usuário');
        }
        
        // Criar o conteúdo do e-mail em HTML
        const htmlContent = `
            <h1>Compra realizada</h1>
            <h2>Dados do Cliente:</h2>
            <p><strong>Nome:</strong> ${userData.nome}</p>
            <p><strong>CPF:</strong> ${userData.cpf}</p>
            <p><strong>E-mail:</strong> ${userData.email}</p>
            <p><strong>Telefone:</strong> ${userData.telefone}</p>
            <p><strong>Endereço:</strong> ${enderecoCompleto}</p>
            <h2>Dados do Pagamento:</h2>
            <p><strong>Método de Pagamento:</strong> ${userData.metodoPagamento || 'PIX'}</p>
            <p><strong>Valor:</strong> R$ ${userData.valor}</p>
            ${miniaturasHtml}
            ${userData.screenCapture ? `<h2>Imagem do Projeto:</h2>
            <p>Abaixo está a imagem do projeto com as miniaturas posicionadas pelo cliente:</p>
            <img src="${userData.screenCapture}" alt="Imagem do Projeto" style="max-width: 600px;">` : '<p><strong>Nota:</strong> Imagem do projeto não disponível</p>'}
        `;
        
        // Log para debug da imagem
        console.log('Imagem do projeto incluída no e-mail:', userData.screenCapture ? 'Sim' : 'Não');
        if (userData.screenCapture) {
            console.log('Tamanho da string da imagem:', userData.screenCapture.length);
            console.log('Primeiros 100 caracteres da imagem:', userData.screenCapture.substring(0, 100));
        }
        
        console.log('Conteúdo HTML do e-mail preparado');
        
        // Configurar o e-mail
        const mailOptions = {
            from: 'contato.archicat@gmail.com',
            to: 'contato.archicat@gmail.com', // E-mail principal da ArchiCat
            cc: userData.email, // Enviar uma cópia para o cliente
            subject: `Novo Pagamento - ${userData.nome}`,
            html: htmlContent,
            // Adicionar cabeçalhos para evitar que o e-mail seja marcado como spam
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'High'
            }
        };
        
        // Garantir que o e-mail principal está correto
        console.log('Verificando destinatário principal:', mailOptions.to);
        
        // Adicionar informações adicionais no assunto para facilitar a identificação
        mailOptions.subject = `Novo Pagamento - ${userData.nome} - R$ ${userData.valor} - ${userData.metodoPagamento}`;
        
        console.log('Enviando e-mail para:', mailOptions.to);
        
        // Enviar o e-mail
        try {
            console.log('Tentando enviar e-mail para:', mailOptions.to);
            console.log('Com cópia para:', mailOptions.cc);
            
            const info = await transporter.sendMail(mailOptions);
            
            console.log('E-mail enviado com sucesso! ID da mensagem:', info.messageId);
            console.log('Resposta do servidor de e-mail:', info.response);
            
            res.status(200).json({ 
                success: true, 
                message: 'E-mail enviado com sucesso',
                messageId: info.messageId
            });
        } catch (emailError) {
            console.error('Erro específico ao enviar e-mail via nodemailer:', emailError);
            throw emailError; // Relançar o erro para ser capturado pelo try/catch externo
        }
    } catch (error) {
        console.error('Erro detalhado ao enviar e-mail:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Erro ao enviar e-mail',
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('Ambiente:', process.env.NODE_ENV || 'desenvolvimento');
});