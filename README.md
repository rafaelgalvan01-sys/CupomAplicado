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

No momento, lojas e cupons são gerenciados direto pelo **Table Editor** do painel do Supabase (sem tela de admin no site). Edite as tabelas `stores` e `coupons` por lá para adicionar/atualizar/desativar cupons.

## Estrutura

- `app/page.tsx` — home (categorias + grid de lojas)
- `app/loja/[slug]/page.tsx` — página da loja com seus cupons ativos
- `app/categoria/[slug]/page.tsx` — lojas de uma categoria
- `app/ir/[couponId]/route.ts` — redireciona para o link de afiliado e incrementa o contador de cliques do cupom
- `lib/data.ts` — funções de leitura de dados do Supabase
- `supabase/schema.sql` / `supabase/seed.sql` — schema e dados de exemplo

## Deploy

Recomendado: [Vercel](https://vercel.com) (integração nativa com Next.js). Configure as mesmas variáveis de ambiente do `.env.local` no painel do projeto na Vercel antes do deploy.
