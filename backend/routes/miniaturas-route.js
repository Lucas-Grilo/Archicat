// Rotas para gerenciar as miniaturas
import express from 'express';
import MiniaturaModel from '../models/miniatura.js';

const router = express.Router();
const miniaturaModel = new MiniaturaModel();

// Rota para obter todas as miniaturas
router.get('/miniaturas', async (req, res) => {
  try {
    const miniaturas = await miniaturaModel.getAll();
    res.json(miniaturas);
  } catch (error) {
    console.error('Erro ao buscar miniaturas:', error);
    res.status(500).json({
      error: 'Erro ao buscar miniaturas',
      details: error.message
    });
  }
});

// Rota para obter uma miniatura específica pelo ID
router.get('/miniaturas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const miniatura = await miniaturaModel.getById(id);
    
    if (!miniatura) {
      return res.status(404).json({
        error: 'Miniatura não encontrada',
        details: `Não foi encontrada miniatura com ID ${id}`
      });
    }
    
    res.json(miniatura);
  } catch (error) {
    console.error(`Erro ao buscar miniatura:`, error);
    res.status(500).json({
      error: 'Erro ao buscar miniatura',
      details: error.message
    });
  }
});

// Rota para adicionar informações das miniaturas ao e-mail
router.post('/miniaturas-email', async (req, res) => {
  try {
    // Receber os dados das miniaturas selecionadas
    const { thumbnailsData } = req.body;
    
    if (!thumbnailsData || !Array.isArray(thumbnailsData)) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: 'Os dados das miniaturas são obrigatórios e devem ser um array'
      });
    }
    
    // Buscar informações completas das miniaturas no banco de dados
    const miniaturasInfo = [];
    
    for (const thumbnail of thumbnailsData) {
      // Extrair o nome do arquivo da URL da imagem
      const imagemPath = thumbnail.src.split('/').pop();
      const imagemCompleta = 'img/' + imagemPath;
      
      // Buscar todas as miniaturas para comparar
      const todasMiniaturas = await miniaturaModel.getAll();
      
      // Padronizar o caminho da imagem para comparação
      const miniaturaEncontrada = todasMiniaturas.find(m => {
        // Extrair apenas o nome do arquivo para comparação
        const nomeArquivoMiniatura = m.imagem_path.split('/').pop();
        return nomeArquivoMiniatura === imagemPath;
      })
      
      if (miniaturaEncontrada) {
        miniaturasInfo.push({
          ...miniaturaEncontrada,
          posicao: {
            left: thumbnail.left,
            top: thumbnail.top,
            transform: thumbnail.transform
          }
        });
      } else {
        // Se não encontrar no banco, usar os dados recebidos
        miniaturasInfo.push({
          nome: `Miniatura ${miniaturasInfo.length + 1}`,
          imagem_path: imagemCompleta,
          preco: parseFloat(thumbnail.value) || 0,
          posicao: {
            left: thumbnail.left,
            top: thumbnail.top,
            transform: thumbnail.transform
          }
        });
      }
    }
    
    // Calcular o valor total
    const valorTotal = miniaturasInfo.reduce((total, miniatura) => total + miniatura.preco, 0);
    
    res.json({
      success: true,
      miniaturas: miniaturasInfo,
      valorTotal
    });
  } catch (error) {
    console.error('Erro ao processar miniaturas para e-mail:', error);
    res.status(500).json({
      error: 'Erro ao processar miniaturas',
      details: error.message
    });
  }
});

export default router;