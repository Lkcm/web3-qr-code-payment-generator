# Monorepo — Next.js 15 + Node.js

Projeto monorepo simples com backend Express e frontend Next.js 15.

```
monorepo/
├── backend/          # Node.js + Express
│   └── src/
│       ├── index.js
│       ├── app.js
│       └── routes/
│           ├── index.js
│           └── users.js
├── frontend/         # Next.js 15 + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── users/page.tsx
│       └── lib/
│           └── api.ts
└── package.json      # Workspace root
```

## Requisitos

- Node.js 18+
- npm 8+ (suporte a workspaces)

## Instalação

```bash
npm install
```

## Desenvolvimento

Rodar tudo junto:

```bash
npm run dev
```

Ou separado:

```bash
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

## Endpoints do Backend

| Método | Rota              | Descrição         |
|--------|-------------------|-------------------|
| GET    | /health           | Health check      |
| GET    | /api              | Status da API     |
| GET    | /api/users        | Listar usuários   |
| GET    | /api/users/:id    | Buscar usuário    |
| POST   | /api/users        | Criar usuário     |

## Variáveis de Ambiente

Copie os arquivos `.env.example` e renomeie para `.env`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
