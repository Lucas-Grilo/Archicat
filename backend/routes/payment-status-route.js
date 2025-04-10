import express from 'express';
import mercadopago from 'mercadopago';

const router = express.Router();

// Rota para verificar o status de um pagamento
router.get('/payment-status/:payment_id', async (req, res) => {
    try {
        const paymentId = req.params.payment_id;
        
        if (!paymentId) {
            return res.status(400).json({
                error: 'ID de pagamento não fornecido',
                details: 'É necessário fornecer um ID de pagamento válido'
            });
        }
        
        console.log(`Verificando status do pagamento ID: ${paymentId}`);
        
        // Buscar informações do pagamento no Mercado Pago
        const payment = await mercadopago.payment.get(paymentId);
        
        if (!payment || !payment.body) {
            throw new Error('Erro ao obter informações do pagamento');
        }
        
        console.log(`Status do pagamento ${paymentId}: ${payment.body.status}`);
        
        // Retornar o status do pagamento
        res.json({
            payment_id: paymentId,
            status: payment.body.status,
            status_detail: payment.body.status_detail,
            is_approved: payment.body.status === 'approved'
        });
    } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        res.status(500).json({
            error: 'Erro ao verificar status do pagamento',
            details: error.message
        });
    }
});

export default router;