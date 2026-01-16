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

## 🧪 Guia de Validação (Passo a Passo)

Utilize este roteiro para testar todos os requisitos do desafio e validar o comportamento do sistema.

### Cenário Inicial (Seed)
O banco inicia automaticamente com **20 unidades de Carne Bovina** (item crítico para testes).
Todos os hambúrgueres (X-Burger, X-Bacon, X-Salada) consomem **1 unidade de Carne**.
Portanto, o estoque global de hambúrgueres é limitado a 20 unidades.

### 1. Teste de Pedido com Sucesso
1. Abra a aplicação.
2. Adicione 1 "X-Burger" ao carrinho.
3. Clique em "Finalizar Pedido".
4. **Resultado Esperado**: O sistema exibe "Pedido realizado com sucesso!", limpa o carrinho e o estoque de carne desce para 19 (invisível ao usuário, mas validável no próximo passo).

### 2. Teste de Validação de Estoque (Erro)
1. Tente adicionar 25 "X-Burgers" ao carrinho (ou faça múltiplos pedidos até estourar o limite de 20 carnes).
2. Clique em "Finalizar Pedido".
3. **Resultado Esperado**: O sistema impedirá a conclusão e abrirá um Modal de Erro: *"Estoque insuficiente para o insumo: Carne Bovina 150g"*.
4. O pedido **não** é salvo.

### 3. Teste de Atomicidade (Rollback)
Este requisito garante que pedidos parciais (metade dos itens) nunca ocorram.
1. O backend utiliza transações (`sequelize.transaction`).
2. Se você tentar um pedido com múltiplos itens onde apenas um deles tem estoque insuficiente, **nenhum** item é debitado.
3. Isso garante a integridade dos dados e evita "pedidos pela metade".

### 4. Teste de Resiliência (Modo Offline - Desafio Extra)
1. Abra o **DevTools** do navegador (F12) -> aba **Network**.
2. Altere a simulação de rede para **Offline**.
3. Adicione itens ao carrinho e clique em "Finalizar Pedido".
4. **Resultado Esperado**:
   - O pedido **não falha**.
   - Ele é salvo na **Fila Local**.
   - Aparece um aviso no topo: *"Você está offline. 1 pedido na fila."*
5. Volte a simulação de rede para **No throttling** (Online).
6. **Resultado Esperado**: O sistema detecta a conexão automaticamente, envia o pedido em background e notifica o sucesso ("Pedido sincronizado").

### 5. Teste de Conflito Tardio (Offline + Fim de Estoque)
Simula a situação onde a internet cai, o usuário faz o pedido, mas o estoque acaba antes da internet voltar.
1. Abra **duas abas** do navegador.
2. **Aba 1**: Fique **Offline**. Adicione um pedido grande (ex: 5 X-Burgers) ao carrinho e finalize (vai para a fila).
3. **Aba 2**: Fique **Online**. Compre TODO o estoque restante de carne (até o sistema dar erro de estoque).
4. **Aba 1**: Volte a ficar **Online**.
5. **Resultado Esperado**:
   - O sistema tenta sincronizar o pedido da fila.
   - O Backend retorna erro de estoque (pois a Aba 2 comprou tudo).
   - A Aba 1 exibe automaticamente o Modal de Erro: *"Estoque insuficiente"*, permitindo que o garçom resolva o problema.

---

## 🏗️ Arquitetura e Decisões Técnicas

### Backend (Node.js + Express + Sequelize)
O backend foi construído seguindo uma arquitetura em camadas para garantir separação de responsabilidades:

- **Models**: Definição das tabelas (`Product`, `Input`, `ProductInput`, `Order`, `OrderItem`).
- **Services**: Onde reside a lógica de negócio complexa.
  - **Atomicidade**: O `OrderService` utiliza `sequelize.transaction` para garantir que a verificação de estoque e a criação do pedido sejam uma operação atômica.
- **Controllers**: Gerenciam a entrada e saída da API.

### Frontend (Next.js + React + Tailwind)
A interface foi pensada para ser ágil (Mobile-first) para garçons:
- **Design System**: Utilizei componentes baseados em Radix UI e Tailwind CSS (via shadcn/ui).
- **Feedback Visual**: Erros de estoque são mostrados claramente, indicando qual produto falhou e o motivo.
- **Offline-First**: Implementado via Hook customizado `useOfflineQueue` e `localStorage`.

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
