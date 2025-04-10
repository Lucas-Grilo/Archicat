// Modelo para as miniaturas
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '..', 'database', 'archicat.db');

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    // Garantir que o diretório database exista
    const fs = await import('fs');
    const dbDir = path.join(__dirname, '..', 'database');
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Abrir conexão com o banco de dados
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Criar tabela de miniaturas se não existir
    await db.exec(`
      CREATE TABLE IF NOT EXISTS miniaturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        imagem_path TEXT NOT NULL,
        preco REAL NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Banco de dados inicializado com sucesso');
    return db;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Classe para gerenciar as miniaturas
class MiniaturaModel {
  constructor() {
    this.db = null;
    this.initialize();
  }

  async initialize() {
    this.db = await initializeDatabase();
  }

  // Obter todas as miniaturas
  async getAll() {
    try {
      return await this.db.all('SELECT * FROM miniaturas');
    } catch (error) {
      console.error('Erro ao buscar miniaturas:', error);
      throw error;
    }
  }

  // Obter uma miniatura pelo ID
  async getById(id) {
    try {
      return await this.db.get('SELECT * FROM miniaturas WHERE id = ?', id);
    } catch (error) {
      console.error(`Erro ao buscar miniatura com ID ${id}:`, error);
      throw error;
    }
  }

  // Adicionar uma nova miniatura
  async add(miniatura) {
    try {
      const result = await this.db.run(
        'INSERT INTO miniaturas (nome, imagem_path, preco) VALUES (?, ?, ?)',
        [miniatura.nome, miniatura.imagem_path, miniatura.preco]
      );
      return result.lastID;
    } catch (error) {
      console.error('Erro ao adicionar miniatura:', error);
      throw error;
    }
  }

  // Atualizar uma miniatura existente
  async update(id, miniatura) {
    try {
      await this.db.run(
        'UPDATE miniaturas SET nome = ?, imagem_path = ?, preco = ? WHERE id = ?',
        [miniatura.nome, miniatura.imagem_path, miniatura.preco, id]
      );
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar miniatura com ID ${id}:`, error);
      throw error;
    }
  }

  // Remover uma miniatura
  async remove(id) {
    try {
      await this.db.run('DELETE FROM miniaturas WHERE id = ?', id);
      return true;
    } catch (error) {
      console.error(`Erro ao remover miniatura com ID ${id}:`, error);
      throw error;
    }
  }

  // Método para popular o banco de dados com as miniaturas iniciais
  async popularMiniaturas(miniaturas) {
    try {
      // Verificar se já existem miniaturas no banco
      const existingMiniaturas = await this.getAll();
      if (existingMiniaturas.length > 0) {
        console.log('Banco de dados já possui miniaturas. Pulando população inicial.');
        return;
      }

      // Inserir as miniaturas iniciais
      for (const miniatura of miniaturas) {
        await this.add(miniatura);
      }

      console.log(`${miniaturas.length} miniaturas adicionadas com sucesso`);
    } catch (error) {
      console.error('Erro ao popular miniaturas:', error);
      throw error;
    }
  }
}

export default MiniaturaModel;