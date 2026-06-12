# Quarteto List

Aplicação full-stack em Next.js para gerenciar listas públicas de equipes de corrida.

## O que já está implementado

- Login administrativo com sessão segura em cookie.
- Dashboard para criar e listar listas.
- Página pública por link para confirmação de presença.
- Página pública por link para pedido de uniforme.
- Bloqueio de duplicidade por telefone na mesma lista.
- Encerramento manual de listas.
- Encerramento automático de listas de uniforme por data.
- Exportação de lista em PDF.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod para validação
- @react-pdf/renderer para geração de PDF

## Variáveis de ambiente

Copie .env.example para .env e ajuste os valores locais.

```bash
DATABASE_URL="postgresql://quarteto:quarteto@localhost:5432/quarteto_list"
AUTH_SECRET="troque-por-um-segredo-longo"
CRON_SECRET="troque-por-um-segredo-longo"
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@quartetolist.local"
ADMIN_PASSWORD="admin123456"
```

## Rodando localmente sem Docker

1. Suba um PostgreSQL local.
2. Instale as dependências.
3. Gere o client do Prisma.
4. Aplique o schema.
5. Crie o administrador inicial.
6. Inicie a aplicação.

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Aplicação: http://localhost:3000

Login inicial padrão em desenvolvimento:

- E-mail: admin@quartetolist.local
- Senha: admin123456

## Rodando com Docker Compose

```bash
docker compose up --build
```

Esse fluxo sobe:

- PostgreSQL em localhost:5432
- Aplicação em http://localhost:3000

Na subida do container web, o projeto executa automaticamente:

- npm run db:push
- npm run db:seed

## Endpoints operacionais

- PDF por lista: /api/lists/:id/export
- Cron de fechamento automático: /api/cron/close-uniform-lists

Para acionar o cron em produção, envie o header:

```text
Authorization: Bearer <CRON_SECRET>
```

## Deploy simples em PaaS

Recomendação para o MVP:

1. Subir um PostgreSQL gerenciado.
2. Configurar DATABASE_URL, AUTH_SECRET, CRON_SECRET, APP_URL e NEXT_PUBLIC_APP_URL.
3. Fazer deploy do Dockerfile.
4. Configurar um scheduler HTTP para chamar /api/cron/close-uniform-lists.

## Próximos passos sugeridos

- Adicionar migrações versionadas do Prisma a partir de um banco local.
- Cobrir os fluxos com testes E2E.
- Refinar edição administrativa de listas e reabertura com ajuste explícito da data.
