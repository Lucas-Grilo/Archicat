@echo off
echo Instalando dependencias do banco de dados...
npm install sqlite sqlite3

echo Executando migracao das miniaturas...
npm run migrate

echo Configuracao do banco de dados concluida!
pause