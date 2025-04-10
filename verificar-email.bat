@echo off
echo Verificando configuracao de e-mail...
echo.

cd %~dp0
node backend\scripts\verificar-email.js

echo.
echo Pressione qualquer tecla para sair...
pause > nul