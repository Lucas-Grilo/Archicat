// Script para verificar e reparar o banco de dados
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import MiniaturaModel from '../models/miniatura.js';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '..', 'database', 'archicat.db');

// Função para verificar o banco de dados
async function verificarBancoDados() {
  console.log('Verificando banco de dados...');
  
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(dbPath)) {
      console.log('Arquivo de banco de dados não encontrado. Criando novo banco de dados...');
      // O banco será criado automaticamente quando inicializarmos o modelo
    } else {
      console.log(`Banco de dados encontrado em: ${dbPath}`);
      
      // Verificar o tamanho do arquivo
      const stats = fs.statSync(dbPath);
      console.log(`Tamanho do arquivo: ${stats.size} bytes`);
      
      if (stats.size < 100) {
        console.log('AVISO: O arquivo do banco de dados parece estar vazio ou corrompido.');
      }
    }
    
    // Tentar abrir o banco de dados
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Verificar se a tabela miniaturas existe
    const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='miniaturas';");
    
    if (!tableCheck) {
      console.log('Tabela de miniaturas não encontrada. Será criada durante a inicialização do modelo.');
    } else {
      // Contar quantas miniaturas existem
      const count = await db.get('SELECT COUNT(*) as count FROM miniaturas');
      console.log(`Número de miniaturas no banco de dados: ${count.count}`);
      
      if (count.count === 0) {
        console.log('Banco de dados está vazio. Executando migração de miniaturas...');
        await executarMigracao();
      } else {
        console.log('Banco de dados contém miniaturas. Não é necessário executar migração.');
        // Listar as miniaturas existentes
        const miniaturas = await db.all('SELECT id, nome, imagem_path, preco FROM miniaturas');
        console.log('Miniaturas encontradas:');
        miniaturas.forEach(m => {
          console.log(`ID: ${m.id}, Nome: ${m.nome}, Imagem: ${m.imagem_path}, Preço: ${m.preco}`);
        });
      }
    }
    
    await db.close();
    console.log('Verificação concluída.');
    
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    console.log('Tentando reparar o banco de dados...');
    await repararBancoDados();
  }
}

// Função para reparar o banco de dados
async function repararBancoDados() {
  console.log('Iniciando reparo do banco de dados...');
  
  try {
    // Fazer backup do banco de dados atual se existir
    if (fs.existsSync(dbPath)) {
      const backupPath = `${dbPath}.backup-${Date.now()}`;
      fs.copyFileSync(dbPath, backupPath);
      console.log(`Backup do banco de dados criado em: ${backupPath}`);
      
      // Remover o arquivo atual
      fs.unlinkSync(dbPath);
      console.log('Arquivo de banco de dados removido para recriação.');
    }
    
    // Inicializar o modelo para recriar o banco de dados
    console.log('Recriando banco de dados...');
    const miniaturaModel = new MiniaturaModel();
    
    // Aguardar a inicialização do banco de dados
    setTimeout(async () => {
      console.log('Banco de dados recriado. Executando migração...');
      await executarMigracao();
    }, 1000);
    
  } catch (error) {
    console.error('Erro ao reparar banco de dados:', error);
  }
}

// Função para executar a migração de miniaturas
async function executarMigracao() {
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

// Executar a verificação
verificarBancoDados();