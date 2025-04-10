@echo off
echo ===================================================
echo   REINICIANDO SERVIDOR E LIMPANDO CACHE DE DADOS
echo ===================================================
echo.

echo [1/4] Parando o servidor atual...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
    if not errorlevel 1 (
        echo      Servidor na porta 3000 encerrado com sucesso.
    )
)

echo.
echo [2/4] Limpando cache do banco de dados...
cd backend
node scripts/limpar-cache.js
cd ..
echo.

echo [3/4] Reiniciando o servidor...
start node backend/server.js

echo.
echo [4/4] Servidor reiniciado com sucesso!
echo.
echo ===================================================
echo   IMPORTANTE: INSTRUÇÕES PARA ATUALIZAR OS PREÇOS
echo ===================================================
echo.
echo Para que as alterações nos preços sejam refletidas no site:
echo.
echo 1. Feche todas as janelas do navegador
echo 2. Abra o navegador em modo anônimo ou limpe o cache
echo    (Ctrl+Shift+Del e selecione "Limpar dados")
echo 3. Acesse o site novamente
echo.
echo Se ainda não visualizar as alterações, pressione Ctrl+F5
echo para forçar uma atualização completa da página.
echo.
echo ===================================================
echo.
pause