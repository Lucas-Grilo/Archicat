@echo off
echo ===== TESTE DE CONFIGURACAO DE EMAIL DO ARCHICAT =====
echo.
echo Este script vai verificar se a configuracao de email esta correta.
echo.
echo IMPORTANTE: Antes de executar este teste, voce precisa:
echo 1. Criar uma senha de aplicativo no Google
echo 2. Configurar essa senha no arquivo backend\.env
echo.
echo Pressione qualquer tecla para iniciar o teste...
pause > nul

echo.
echo Executando teste de email...
echo.

node backend/scripts/verificar-email.js

echo.
echo Se o teste falhou, siga as instrucoes acima para criar uma senha de aplicativo.
echo Para mais detalhes, consulte o arquivo INSTRUCOES_EMAIL_GMAIL.md
echo.
echo Pressione qualquer tecla para sair...
pause > nul