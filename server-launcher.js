/// Script para iniciar o servidor automaticamente e garantir que as miniaturas sejam carregadas corretamente

// Determinar a URL base do servidor com base no ambiente
const getServerUrl = () => {
    // Se estiver em localhost, use localhost, caso contrário use o Render
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://archicat-backend.onrender.com/api';
};

/**
 * Função para iniciar o servidor backend
 */
async function iniciarServidor() {
    try {
        console.log('Tentando iniciar o servidor...');
        
        // Usando a API Fetch para fazer uma requisição ao endpoint que inicia o servidor
        const response = await fetch(`${getServerUrl()}/iniciar-servidor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            },
            mode: 'cors',
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('Resposta do servidor:', data);
        
        if (data.success) {
            console.log('Servidor iniciado com sucesso!');
        } else {
            console.error('Falha ao iniciar o servidor:', data.message);
        }
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
    }
}

/**
 * Função para reiniciar o servidor e limpar o cache
 */
async function reiniciarServidorCompleto() {
    try {
        console.log('Tentando reiniciar o servidor e limpar cache...');
        
        // Usando a API Fetch para fazer uma requisição ao endpoint que reinicia o servidor
        const response = await fetch(`${getServerUrl()}/reiniciar-servidor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Resposta do servidor:', data);
        
        if (data.success) {
            console.log('Servidor reiniciado com sucesso!');
            // Verificar se as miniaturas foram carregadas corretamente após um breve intervalo
            setTimeout(verificarMiniaturas, 3000);
        } else {
            console.error('Falha ao reiniciar o servidor:', data.message);
        }
    } catch (error) {
        console.error('Erro ao reiniciar o servidor:', error);
    }
}

/**
 * Função para verificar se as miniaturas foram carregadas corretamente
 */
async function verificarMiniaturas() {
    try {
        console.log('Verificando se as miniaturas foram carregadas...');
        
        // Tentar buscar as miniaturas do servidor com o endereço completo
        const response = await fetch(`${getServerUrl()}/miniaturas`);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar miniaturas: ${response.status} ${response.statusText}`);
        }
        
        const miniaturas = await response.json();
        
        if (miniaturas && miniaturas.length > 0) {
            console.log(`Miniaturas carregadas com sucesso! Total: ${miniaturas.length}`);
        } else {
            console.warn('Nenhuma miniatura encontrada. Tentando reiniciar o servidor novamente...');
            // Se não houver miniaturas, tentar reiniciar o servidor novamente
            setTimeout(reiniciarServidorCompleto, 1000);
        }
    } catch (error) {
        console.error('Erro ao verificar miniaturas:', error);
        // Em caso de erro, tentar reiniciar o servidor novamente
        setTimeout(reiniciarServidorCompleto, 1000);
    }
}

// Executar a reinicialização completa do servidor quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, reiniciando o servidor e limpando cache...');
    reiniciarServidorCompleto();
});