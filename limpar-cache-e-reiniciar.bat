@echo off
color 0A
echo ===================================================
echo   LIMPEZA COMPLETA DE CACHE E REINICIO DO SERVIDOR
echo ===================================================
echo.

echo [1/5] Parando o servidor atual...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
    if not errorlevel 1 (
        echo      Servidor na porta 3000 encerrado com sucesso.
    )
)

echo.
echo [2/5] Limpando cache do banco de dados...
cd backend
node scripts/limpar-cache.js
cd ..
echo.

echo [3/5] Limpando cache do navegador...
echo.
echo IMPORTANTE: Para garantir que as alteracoes de precos sejam aplicadas:
echo 1. Feche TODAS as janelas do navegador
echo 2. Pressione qualquer tecla para continuar
pause > nul

echo.
echo [4/5] Limpando cache do sistema...
echo.
echo Executando limpeza de cache do sistema...
ipconfig /flushdns > nul
echo Cache DNS limpo com sucesso.

echo.
echo [5/5] Reiniciando o servidor...
start node backend/server.js

echo.
echo ===================================================
echo   SERVIDOR REINICIADO COM SUCESSO!
echo ===================================================
echo.
echo Para visualizar as alteracoes de precos:
echo.
echo 1. Abra o navegador em modo anonimo (Ctrl+Shift+N no Chrome)
echo    OU
echo    Limpe o cache do navegador (Ctrl+Shift+Del)
echo.
echo 2. Acesse o site novamente
echo.
echo 3. Se ainda nao visualizar as alteracoes, pressione Ctrl+F5
echo    para forcar uma atualizacao completa da pagina
echo.
echo ===================================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul