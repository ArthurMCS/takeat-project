#!/bin/bash

# Encerra o script em caso de erro
set -e

# Função para lidar com o encerramento do script
cleanup() {
    echo "Encerrando todos os serviços..."
    # Mata os processos filhos (tarefas em segundo plano)
    kill $(jobs -p) 2>/dev/null
    exit
}

# Captura o sinal SIGINT (Ctrl+C) para executar a limpeza
trap cleanup SIGINT

echo "🚀 Inicializando o Projeto Takeat..."

# 1. Iniciar o Banco de Dados
echo "🐘 Subindo o container do PostgreSQL..."
docker-compose up -d

# Aguarda o banco estar pronto
echo "⏳ Aguardando o banco de dados inicializar..."
sleep 5

# 2. Configurar o Backend
echo "🔙 Configurando o Backend..."
cd backend

# Verifica se o arquivo .env existe, se não, cria a partir do exemplo
if [ ! -f ".env" ]; then
    echo "⚙️  Criando arquivo .env a partir de .env.example..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando as dependências do backend..."
    npm install
else 
    echo "📦 Dependências do backend já instaladas."
fi

echo "🌱 Populando o banco de dados (Seeds)..."
npm run seed

echo "🚀 Iniciando o servidor do Backend..."
npm run dev &
BACKEND_PID=$!
cd ..

# 3. Configurar o Frontend
echo "🎨 Configurando o Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando as dependências do frontend..."
    npm install
else
    echo "📦 Dependências do frontend já instaladas."
  fi

echo "🚀 Iniciando o Frontend..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Todos os serviços foram iniciados!"
echo "📡 Backend rodando em: http://localhost:3001"
echo "💻 Frontend rodando em: http://localhost:3000"
echo "Pressione Ctrl+C para encerrar todos os serviços."

# Mantém o script rodando enquanto os processos do back e front estiverem ativos
wait $BACKEND_PID $FRONTEND_PID