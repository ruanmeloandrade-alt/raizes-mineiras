# Raizes Mineiras

Migracao independente do projeto Raizes Mineiras para GitHub.

Este repositorio nao depende do runtime/config da Lovable. A aplicacao roda como React + Vite, com Supabase no cliente para catalogo, carrinho, pedidos e area administrativa.

## Rodar localmente

```bash
npm install
npm run dev
```

## Variaveis

Crie `.env.local` a partir de `.env.example`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

A chave publishable e publica. Nunca coloque service role no front-end.

## Deploy GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica a pasta `dist` no GitHub Pages.

Para ligar dados reais no deploy, configure estes Repository Variables ou Secrets no GitHub:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Sem essas variaveis, o site abre com catalogo demonstrativo local para nao ficar quebrado.

## DNS

Depois que o GitHub Pages estiver ativo, o DNS fica como ultima etapa: apontar o dominio para GitHub Pages e configurar o dominio customizado no repo.

## Supabase

A pasta `supabase/migrations` inclui uma base de schema para produtos, categorias, pedidos e configuracoes. Antes de aplicar em producao, compare com o projeto Supabase atual para evitar sobrescrever estruturas existentes.
