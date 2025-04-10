// Script para migrar as miniaturas do HTML para o banco de dados
import MiniaturaModel from '../models/miniatura.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para extrair informações das miniaturas do HTML
async function extrairMiniaturas() {
  try {
    // Caminho para o arquivo HTML
    const htmlPath = path.join(__dirname, '..', '..', 'pagina2', 'pagina2.html');
    
    // Ler o conteúdo do arquivo HTML
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Expressão regular para encontrar as tags de imagem das miniaturas
    const regex = /<img src="(img\/thumb\d+\.png)" class="thumbnail" data-value="([\d.,]+)" onclick="setImage\(this\.src, this\.getAttribute\('data-value'\)(?:, this\.width, this\.height)?\)" alt="(Imagem \d+)"[^>]*>/g;
    
    const miniaturas = [];
    let match;
    
    // Extrair todas as miniaturas do HTML
    while ((match = regex.exec(htmlContent)) !== null) {
      const imagemPath = match[1];
      // Converter o valor para número, substituindo vírgula por ponto se necessário
      const preco = parseFloat(match[2].replace(',', '.'));
      const nome = match[3];
      
      miniaturas.push({
        nome,
        imagem_path: imagemPath,
        preco
      });
    }
    
    console.log(`Extraídas ${miniaturas.length} miniaturas do HTML`);
    return miniaturas;
  } catch (error) {
    console.error('Erro ao extrair miniaturas do HTML:', error);
    throw error;
  }
}

// Função principal para migrar as miniaturas
async function migrarMiniaturas() {
  try {
    console.log('Iniciando migração das miniaturas...');
    
    // Extrair miniaturas do HTML
    const miniaturas = await extrairMiniaturas();
    
    if (miniaturas.length === 0) {
      console.log('Nenhuma miniatura encontrada para migrar.');
      return;
    }
    
    // Inicializar o modelo de miniaturas
    const miniaturaModel = new MiniaturaModel();
    
    // Aguardar a inicialização do banco de dados
    setTimeout(async () => {
      try {
        // Popular o banco de dados com as miniaturas extraídas
        await miniaturaModel.popularMiniaturas(miniaturas);
        console.log('Migração concluída com sucesso!');
      } catch (error) {
        console.error('Erro durante a migração:', error);
      }
    }, 1000); // Aguardar 1 segundo para garantir que o banco de dados foi inicializado
  } catch (error) {
    console.error('Erro na migração das miniaturas:', error);
  }
}

// Executar a migração
migrarMiniaturas();