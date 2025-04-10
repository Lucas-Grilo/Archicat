import express from 'express';

const router = express.Router();

// Rota para processar o envio de imagem
router.post('/send-image', async (req, res) => {
  try {
    console.log('Recebendo solicitação para processar imagem...');
    
    // Verificar se há dados na requisição
    if (!req.body) {
      return res.status(400).json({
        error: 'Dados incompletos',
        details: 'Nenhum dado recebido'
      });
    }
    
    // Apenas registra que recebeu a solicitação
    console.log('Dados de imagem recebidos com sucesso');
    
    // Responde com sucesso - o processamento real da imagem acontece na rota /send-email
    res.status(200).json({
      success: true,
      message: 'Imagem processada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    res.status(500).json({
      error: 'Erro ao processar imagem',
      details: error.message
    });
  }
});

export default router;