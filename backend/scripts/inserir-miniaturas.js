// Script para inserir miniaturas manualmente no banco de dados
import MiniaturaModel from '../models/miniatura.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para inserir miniaturas manualmente
async function inserirMiniaturas() {
  try {
    console.log('Iniciando inserção manual de miniaturas...');
    
    // Lista de miniaturas para inserir
    const miniaturas = [
      { nome: 'Imagem 1', imagem_path: 'img/thumb1.png', preco: 1.00 },
      { nome: 'Imagem 2', imagem_path: 'img/thumb2.png', preco: 11.12 }, // Reduzido em 5% (de 11.70)
      { nome: 'Imagem 3', imagem_path: 'img/thumb3.png', preco: 22.23 }, // Reduzido em 5% (de 23.40)
      { nome: 'Imagem 4', imagem_path: 'img/thumb4.png', preco: 31.20 },
      { nome: 'Imagem 5', imagem_path: 'img/thumb5.png', preco: 31.20 },
      { nome: 'Imagem 6', imagem_path: 'img/thumb6.png', preco: 31.20 },
      { nome: 'Imagem 8', imagem_path: 'img/thumb8.png', preco: 135.00 },
      { nome: 'Imagem 9', imagem_path: 'img/thumb9.png', preco: 43.70 }, // Reduzido em 5% (de 46.00)
      { nome: 'Imagem 10', imagem_path: 'img/thumb10.png', preco: 0 },
    ];
    
    // Verificar se os arquivos de imagem existem
    const imgDir = path.join(__dirname, '..', '..', 'pagina2', 'img');
    console.log(`Verificando imagens em: ${imgDir}`);
    
    const arquivosExistentes = fs.readdirSync(imgDir);
    console.log(`Arquivos encontrados: ${arquivosExistentes.join(', ')}`);
    
    const miniaturasValidas = miniaturas.filter(miniatura => {
      const nomeArquivo = path.basename(miniatura.imagem_path);
      const existe = arquivosExistentes.includes(nomeArquivo);
      if (!existe) {
        console.log(`Aviso: Arquivo ${nomeArquivo} não encontrado`);
      }
      return existe;
    });
    
    console.log(`${miniaturasValidas.length} miniaturas válidas para inserção`);
    
    // Inicializar o modelo de miniaturas
    const miniaturaModel = new MiniaturaModel();
    
    // Aguardar a inicialização do banco de dados
    setTimeout(async () => {
      try {
        // Verificar se já existem miniaturas no banco
        const existingMiniaturas = await miniaturaModel.getAll();
        
        if (existingMiniaturas.length > 0) {
          console.log(`Já existem ${existingMiniaturas.length} miniaturas no banco de dados.`);
          console.log('Deseja continuar e adicionar mais miniaturas? (S/N)');
          // Como não podemos interagir diretamente no console, vamos prosseguir
          console.log('Prosseguindo com a inserção...');
        }
        
        // Inserir as miniaturas
        let contador = 0;
        for (const miniatura of miniaturasValidas) {
          await miniaturaModel.add(miniatura);
          contador++;
        }
        
        console.log(`${contador} miniaturas adicionadas com sucesso!`);
        
        // Listar as miniaturas no banco de dados
        const todasMiniaturas = await miniaturaModel.getAll();
        console.log(`Total de miniaturas no banco de dados: ${todasMiniaturas.length}`);
        console.log('Miniaturas no banco de dados:');
        todasMiniaturas.forEach(m => {
          console.log(`ID: ${m.id}, Nome: ${m.nome}, Imagem: ${m.imagem_path}, Preço: ${m.preco}`);
        });
        
      } catch (error) {
        console.error('Erro durante a inserção:', error);
      }
    }, 1000); // Aguardar 1 segundo para garantir que o banco de dados foi inicializado
  } catch (error) {
    console.error('Erro na inserção das miniaturas:', error);
  }
}

// Executar a inserção
inserirMiniaturas();