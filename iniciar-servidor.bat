@echo off
echo Verificando se o Node.js esta instalado...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js nao encontrado! Por favor, instale o Node.js para continuar.
    echo Abrindo pagina de download do Node.js...
    start https://nodejs.org/en/download/
    echo.
    echo Apos a instalacao, feche esta janela e execute este script novamente.
    pause
    exit
)

echo Node.js encontrado! Iniciando o servidor backend...
echo.

cd backend
echo Executando: node server.js
node server.js

pause