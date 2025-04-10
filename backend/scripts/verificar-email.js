// Script para verificar a configuração de e-mail
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

// Forçar a leitura do arquivo .env novamente para garantir que as variáveis sejam carregadas
try {
    const envPath = path.resolve(__dirname, '..', '.env');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log('Arquivo .env carregado com sucesso');
} catch (error) {
    console.error('Erro ao carregar o arquivo .env:', error);
}

console.log('\n===== VERIFICAÇÃO DE CONFIGURAÇÃO DE E-MAIL =====\n');

// Verificar se a senha do e-mail está definida
if (!process.env.EMAIL_PASSWORD) {
    console.error('❌ ERRO: Senha do e-mail não encontrada no arquivo .env');
    console.error('   Por favor, configure a variável EMAIL_PASSWORD no arquivo .env');
    console.error('   O sistema NÃO conseguirá enviar e-mails até que esta senha seja configurada!\n');
    console.error('   Siga as instruções abaixo para criar uma senha de aplicativo do Google:\n');
    console.error('   1. Acesse sua conta Google em https://myaccount.google.com');
    console.error('   2. Vá para Segurança > Como você faz login no Google > Verificação em duas etapas (ative se não estiver ativada)');
    console.error('   3. Depois de ativar a verificação em duas etapas, vá para Senhas de app');
    console.error('   4. Gere uma nova senha de app para "ArchiCat"');
    console.error('   5. Copie a senha gerada (16 caracteres sem espaços) e cole no arquivo .env');
    console.error('\n   Para mais detalhes, consulte o arquivo INSTRUCOES_EMAIL_GMAIL.md\n');
    process.exit(1);
} else {
    console.log('✅ Senha do e-mail encontrada no arquivo .env');
    
    // Verificar se a senha parece ser uma senha de app (geralmente tem 16 caracteres)
    if (process.env.EMAIL_PASSWORD.length !== 16) {
        console.warn('⚠️ AVISO: A senha fornecida pode não ser uma senha de app válida do Google.');
        console.warn('   As senhas de app do Google geralmente têm 16 caracteres sem espaços.');
        console.warn('   Senha atual tem ' + process.env.EMAIL_PASSWORD.length + ' caracteres.\n');
    } else {
        console.log('✅ A senha tem o formato correto (16 caracteres)\n');
    }
}

// Configuração do transporter do Nodemailer
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
    logger: true // Ativar logs adicionais
});

console.log('Tentando verificar a conexão com o servidor de e-mail...');

// Verificar conexão com o servidor de e-mail
transporter.verify(function(error, success) {
    if (error) {
        console.error('\n❌ ERRO na configuração do servidor de e-mail:', error.message);
        console.error('\nDetalhes do erro:', error);
        console.error('\nO sistema NÃO conseguirá enviar e-mails com esta configuração!\n');
        
        if (error.code === 'EAUTH') {
            console.error('Este erro geralmente indica que a senha está incorreta ou não é uma senha de aplicativo válida.');
            console.error('Verifique se você criou uma senha de aplicativo corretamente e a configurou no arquivo .env\n');
        }
        
        process.exit(1);
    } else {
        console.log('\n✅ SUCESSO: Servidor de e-mail configurado corretamente!');
        console.log('   O sistema está pronto para enviar e-mails.\n');
        
        // Perguntar se o usuário deseja enviar um e-mail de teste
        console.log('Deseja enviar um e-mail de teste? (Execute este script com o argumento "--test" para testar)');
        console.log('Exemplo: node verificar-email.js --test\n');
        
        // Verificar se o argumento --test foi fornecido
        if (process.argv.includes('--test')) {
            console.log('Enviando e-mail de teste...');
            
            // Configurar o e-mail de teste
            const mailOptions = {
                from: 'contato.archicat@gmail.com',
                to: 'contato.archicat@gmail.com',
                subject: 'Teste de Configuração de E-mail - ArchiCat',
                html: `
                    <h1>Teste de Configuração de E-mail</h1>
                    <p>Este é um e-mail de teste para verificar se a configuração do servidor de e-mail está funcionando corretamente.</p>
                    <p>Se você recebeu este e-mail, significa que a configuração está correta!</p>
                    <p><strong>Data e hora do teste:</strong> ${new Date().toLocaleString()}</p>
                `
            };
            
            // Enviar o e-mail de teste
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('\n❌ ERRO ao enviar e-mail de teste:', error.message);
                    console.error('Detalhes do erro:', error);
                    process.exit(1);
                } else {
                    console.log('\n✅ E-mail de teste enviado com sucesso!');
                    console.log('   ID da mensagem:', info.messageId);
                    console.log('   Resposta do servidor:', info.response);
                    console.log('\nVerifique a caixa de entrada de contato.archicat@gmail.com para confirmar o recebimento.\n');
                    process.exit(0);
                }
            });
        } else {
            process.exit(0);
        }
    }
});