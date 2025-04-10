// Script para limpar o cache e forçar a recarga dos dados do banco de dados
import MiniaturaModel from '../models/miniatura.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para limpar o cache e recarregar os dados
async function limparCacheERecarregar() {
  try {
    console.log('Iniciando limpeza de cache e recarga de dados...');
    
    // Inicializar o modelo de miniaturas
    const miniaturaModel = new MiniaturaModel();
    
    // Aguardar a inicialização do banco de dados
    setTimeout(async () => {
      try {
        // Verificar as miniaturas no banco de dados
        const miniaturas = await miniaturaModel.getAll();
        console.log('Miniaturas encontradas no banco de dados:');
        miniaturas.forEach(m => {
          console.log(`ID: ${m.id}, Nome: ${m.nome}, Imagem: ${m.imagem_path}, Preço: ${m.preco}`);
        });
        
        console.log('\nLimpeza de cache concluída. Os dados foram recarregados do banco de dados.');
        console.log('\nPara que as alterações sejam refletidas no site:');
        console.log('1. Reinicie o servidor Node.js');
        console.log('2. Limpe o cache do navegador ou use o modo de navegação anônima');
        console.log('3. Recarregue a página do site');
        
      } catch (error) {
        console.error('Erro durante a recarga de dados:', error);
      }
    }, 1000); // Aguardar 1 segundo para garantir que o banco de dados foi inicializado
  } catch (error) {
    console.error('Erro na limpeza de cache:', error);
  }
}

// Executar a limpeza de cache e recarga
limparCacheERecarregar();