# Takeat Challenge - Full Stack Developer

Bem-vindo ao meu projeto para o desafio técnico da Takeat! Este é um sistema de gerenciamento de pedidos com controle de estoque atômico, focado na experiência do usuário e resiliência.

## 🚀 Como Rodar o Projeto

Este projeto foi projetado para ser extremamente simples de iniciar. Ele utiliza Docker para o banco de dados e um script automatizado para configurar o ambiente.

### Pré-requisitos
- **Docker** e **Docker Compose** instalados e rodando.
- **Node.js** (versão 18+ recomendada).

### Passo Único
Na raiz do projeto, execute o script de inicialização:

```bash
./start.sh
```

O que este script faz:
1. Sobe o banco de dados PostgreSQL via Docker.
2. Instala as dependências do Backend e Frontend (se necessário).
3. Executa as **Seeds** para popular o banco com produtos e ingredientes.
4. Inicia o Backend na porta `3001` e o Frontend na porta `3000`.

Acesse a aplicação em: [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Arquitetura e Decisões Técnicas

### Backend (Node.js + Express + Sequelize)
O backend foi construído seguindo uma arquitetura em camadas para garantir separação de responsabilidades:

- **Models**: Definição das tabelas (`Product`, `Input`, `ProductInput`, `Order`, `OrderItem`).
- **Services**: Onde reside a lógica de negócio complexa.
  - **Atomicidade**: O `OrderService` utiliza `sequelize.transaction` para garantir que a verificação de estoque e a criação do pedido sejam uma operação atômica. Se faltar *um* ingrediente de *um* produto, todo o pedido é revertido (Rollback).
- **Controllers**: Gerenciam a entrada e saída da API.

### Frontend (Next.js + React + Tailwind)
A interface foi pensada para ser ágil (Mobile-first) para garçons:
- **Design System**: Utilizei componentes baseados em Radix UI e Tailwind CSS (via shadcn/ui) para uma interface limpa e responsiva.
- **Feedback Visual**: Erros de estoque são mostrados claramente, indicando qual produto falhou e o motivo.

---

## 🛡️ O Diferencial: Resiliência e Offline-First

Conforme proposto no "Desafio Extra", implementei uma estratégia robusta para lidar com falhas de conexão.

### O Problema
Em restaurantes, o Wi-Fi oscila. Se um garçom envia um pedido e a internet cai, o pedido não pode ser perdido.

### A Solução (`useOfflineQueue`)
Criei um Hook personalizado (`frontend/hooks/use-offline-queue.ts`) que atua como um gerenciador de estado e persistência local.

1. **Detecção de Falha**: 
   - Ao tentar enviar um pedido, se a API falhar por erro de rede (fetch exception), o pedido é capturado.
   
2. **Fila Local (Queue)**:
   - O pedido é salvo no `localStorage` do navegador.
   - A interface mostra um indicador visual ("Offline - 1 pedido na fila").

3. **Sincronização Automática**:
   - O sistema escuta eventos de `online` do navegador.
   - Assim que a conexão volta, a fila é processada automaticamente em background.

4. **Tratamento de Conflito Tardio**:
   - Se, ao sincronizar um pedido antigo, o estoque tiver acabado nesse meio tempo, o sistema não descarta silenciosamente.
   - Ele move o pedido para um estado de erro e exibe o modal de "Estoque Insuficiente" para o garçom, permitindo que ele remova o item problemático e tente novamente.

---

## 📂 Estrutura de Pastas

```
/
├── backend/            # API Node.js
│   ├── src/models/     # Definição do Banco
│   ├── src/services/   # Regra de Negócio (Estoque)
│   └── ...
├── frontend/           # Next.js App
│   ├── components/     # UI Components
│   ├── hooks/          # Lógica Offline (use-offline-queue)
│   └── ...
├── docker-compose.yml  # Configuração do Postgres
└── start.sh            # Script de Inicialização
```

Feito com 💜 por Arthur Moreira.
