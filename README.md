# Cupom Aplicado — Site

Site de cupons de desconto e promoções. Next.js (App Router) + Tailwind CSS + Supabase.

## Setup

### 1. Criar o projeto no Supabase

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e um novo projeto.
2. No painel do projeto, abra o **SQL Editor** e rode, nesta ordem:
   - o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) (cria as tabelas `categories`, `stores`, `coupons` e a função de contagem de cliques)
   - o conteúdo de [`supabase/seed.sql`](./supabase/seed.sql) (popula com lojas e cupons de exemplo, fictícios)
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

### 2. Configurar variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com os valores do passo anterior:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Gestão de conteúdo

Lojas e cupons são gerenciados direto pelo **Table Editor** do painel do Supabase (sem tela de admin no site) para edições pontuais.

Importação de cupons (Lomadee/Awin) e geração de texto SEO + FAQ por loja (via Gemini, free tier) rodam automaticamente 8x por dia (a cada 3 horas) pelo workflow [`.github/workflows/import-coupons.yml`](./.github/workflows/import-coupons.yml) — também pode ser disparado manualmente na aba **Actions** do repositório no GitHub (`Importar cupons e gerar SEO` → `Run workflow`). O script de SEO só chama a API pra lojas que ainda não têm `seo_description`, então rodar várias vezes ao dia não gera custo extra.

Pra isso funcionar, configure em **Settings → Secrets and variables → Actions** do repositório os secrets:

- `LOMADEE_API_KEY`
- `AWIN_API_TOKEN`
- `AWIN_PUBLISHER_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `GEMINI_API_KEY`

Rodar manualmente (local), se precisar:

```bash
node --env-file=.env.local scripts/import-lomadee.mjs
node --env-file=.env.local scripts/import-awin.mjs
npm run generate-seo-content        # só lojas sem seo_description
npm run generate-seo-content -- --force   # regera todas
```

## Estrutura

- `app/page.tsx` — home (categorias + grid de lojas)
- `app/loja/[slug]/page.tsx` — página da loja com seus cupons ativos
- `app/categoria/[slug]/page.tsx` — lojas de uma categoria
- `app/ir/[couponId]/route.ts` — redireciona para o link de afiliado e incrementa o contador de cliques do cupom
- `lib/data.ts` — funções de leitura de dados do Supabase
- `supabase/schema.sql` / `supabase/seed.sql` — schema e dados de exemplo

## Deploy

Recomendado: [Vercel](https://vercel.com) (integração nativa com Next.js). Configure as mesmas variáveis de ambiente do `.env.local` no painel do projeto na Vercel antes do deploy.
