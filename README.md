# TI DOCS

Plataforma de gestão de documentos hospitalares (POPs, manuais, treinamentos) com assistente IA local, RBAC, versionamento e organização por pastas/categorias.

## Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3, Lexical Editor, Recharts
- **Backend:** Express 4, TypeScript, Drizzle ORM, PostgreSQL 16 + pgvector
- **IA:** Ollama + Phi-3.5 (RAG contextual por setor)
- **Autenticação:** JWT (mock: admin@tidocs.com / user@tidocs.com)

## Funcionalidades

- Autenticação com dois perfis (admin / user)
- RBAC por setor
- CRUD de documentos com editor WYSIWYG (Lexical)
- Versionamento automático + histórico de versões
- Organização hierárquica por pastas (2 níveis)
- Comentários por documento
- Tags com autocomplete
- Modelos de documento
- Busca textual
- Atribuição e progresso de treinamentos
- Notificações
- Assistente IA com RAG contextual
- Tema escuro
- Relatórios e dashboard
- Painel administrativo (usuários, setores, categorias, auditoria, configurações)

## Como rodar

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev

# Banco (Docker)
docker compose up -d

# Seed
curl -X POST http://localhost:3001/api/seed
```

## Estrutura

```
ti-docs/
├── frontend/         # Vite + React + Tailwind
│   └── src/
│       ├── components/   # UI, layout, editor, admin, AI, reports
│       ├── pages/        # Dashboard, documentos, admin, etc.
│       ├── contexts/     # AuthContext
│       ├── lib/          # API client, export utils
│       └── styles/       # Globals CSS com variáveis de tema
├── backend/          # Express + Drizzle + PostgreSQL
│   └── src/
│       ├── routes/       # 15 rotas REST
│       ├── services/     # Auth, document, file, AI, RAG
│       ├── middleware/   # Auth, RBAC, error, validation
│       ├── db/           # Schema, migrations, seed
│       └── config/       # Database, environment
└── docker-compose.yml
```
