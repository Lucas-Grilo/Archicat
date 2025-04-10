import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

/**
 * Rota para iniciar o servidor
 * Esta rota executa o script iniciar-servidor.bat
 */
router.post('/iniciar-servidor', (req, res) => {
    console.log('Recebida solicitação para iniciar o servidor');
    
    // Caminho para o script de inicialização
    const scriptPath = path.join(rootDir, 'iniciar-servidor.bat');
    
    // Executa o script como um processo separado para não bloquear o servidor atual
    const child = exec(`start cmd /c "${scriptPath}"`, { cwd: rootDir }, (error) => {
        if (error) {
            console.error('Erro ao executar o script de inicialização:', error);
            return res.status(500).json({ success: false, message: 'Erro ao iniciar o servidor', error: error.message });
        }
    });
    
    return res.json({ success: true, message: 'Comando de inicialização do servidor enviado com sucesso' });
});

/**
 * Rota para reiniciar o servidor e limpar o cache
 * Esta rota executa o script reiniciar-servidor-completo.bat
 */
router.post('/reiniciar-servidor', (req, res) => {
    console.log('Recebida solicitação para reiniciar o servidor e limpar cache');
    
    // Caminho para o script de reinicialização
    const scriptPath = path.join(rootDir, 'reiniciar-servidor-completo.bat');
    
    // Executa o script como um processo separado para não bloquear o servidor atual
    const child = exec(`start cmd /c "${scriptPath}"`, { cwd: rootDir }, (error) => {
        if (error) {
            console.error('Erro ao executar o script de reinicialização:', error);
            return res.status(500).json({ success: false, message: 'Erro ao reiniciar o servidor', error: error.message });
        }
    });
    
    return res.json({ success: true, message: 'Comando de reinicialização do servidor enviado com sucesso' });
});

export default router;