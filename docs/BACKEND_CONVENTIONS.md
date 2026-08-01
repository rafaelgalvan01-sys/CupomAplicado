# Padrões de backend — Cupom Aplicado

Documento pra qualquer agente/ferramenta (opencode, etc.) escrever backend **no mesmo padrão** que já existe no projeto. Estas regras descrevem o "como as coisas são feitas aqui"; para as regras de SEO/performance/importação, ver também o `AGENTS.md` na raiz (leia os dois antes de mexer em backend).

Regra de ouro: **imite o código que já existe.** Antes de criar uma função nova em `lib/data.ts`, uma migração nova ou uma rota nova, abra um exemplo do mesmo tipo e siga o mesmo formato (mesma assinatura, mesmo tratamento de erro, mesmos comentários explicando o *porquê*).

---

## 1. Stack e onde as coisas ficam

- **Next.js 16 (App Router, Turbopack) + React 19 + TypeScript `strict`.** Isto NÃO é o Next que você tem na memória — APIs e convenções mudaram. Antes de escrever código de framework, leia o guia relevante em `node_modules/next/dist/docs/` (regra do `AGENTS.md`).
- **Banco: Supabase (Postgres + PostgREST + RLS).** Toda leitura de dados passa pelo cliente Supabase.
- **Import path alias:** use sempre `@/` para importar de dentro do projeto (`@/lib/data`, `@/components/...`). Configurado em `tsconfig.json` (`"@/*": ["./*"]`). Nunca use caminho relativo longo (`../../lib/...`).
- Pastas relevantes ao backend:
  - `lib/data.ts` — **camada de dados** (todas as leituras do banco pro front). Ponto central.
  - `lib/supabase.ts` — cliente Supabase (anon key).
  - `lib/types.ts` — tipos TypeScript das entidades (`Store`, `Coupon`, `Category`, `Guide`, ...).
  - `lib/site.ts` — constantes globais (`SITE_URL`).
  - `app/api/**/route.ts` — rotas de API (Route Handlers).
  - `supabase/schema.sql` + `supabase/migrations/NNNN_*.sql` — esquema e migrações do banco.
  - `scripts/*.mjs` — scripts Node de importação de dados e geração de conteúdo (rodam fora do Next, no GitHub Actions ou manualmente).

---

## 2. Idioma e comentários

- **Código em inglês** (nomes de função, variável, coluna). **Comentários e mensagens ao usuário em português.**
- Comentário serve pra explicar **o porquê**, não o **o quê**. Todo comportamento não óbvio (um fallback de erro, um `!inner`, uma decisão de cache, uma pegadinha já vivida) leva um comentário explicando a razão. Veja o estilo denso de comentários em `lib/data.ts` — mantenha esse padrão em código novo do mesmo tipo.
- Mensagens de erro em resposta de API são em português e voltadas ao usuário final (ex: `"Parâmetros inválidos."`).

---

## 3. Camada de dados (`lib/data.ts`)

É onde vive toda leitura do banco. Regras firmes:

### 3.1 Cache — obrigatório
- **Toda função nova que NÃO depende de dado por-requisição** (sem `searchParams`/`cookies`/filtro escolhido na hora) deve ser embrulhada em `unstable_cache(fn, ['chave-unica'], { revalidate: REVALIDATE_SECONDS })`. `REVALIDATE_SECONDS` (300) está no topo do arquivo — use ele, não um número solto.
- A **chave de cache** (2º argumento) é um array com um nome único e estável por função (ex: `['top-stores']`). Não repita chave entre funções diferentes.
- **Função que recebe argumento e é chamada tanto no `generateMetadata` quanto no corpo da página** (mesmos dados, mesma requisição) leva também o `cache()` do React por fora, aninhado: `cache(unstable_cache(async (slug) => {...}, ['chave'], {...}))`. `cache()` deduplica dentro da mesma requisição; `unstable_cache` guarda entre requisições. Veja `getStoreBySlug`, `getCategoryBySlug`, `getGuideBySlug`.
- **Função que depende de filtro/busca escolhidos na requisição fica FORA do cache** (geraria uma entrada por termo, sem ganho). Veja `getCoupons`/`getCouponsCount`: elas têm um caminho cacheado só quando não há termo nem filtro (`getCouponsCached`), e caem pro caminho não-cacheado quando há.

### 3.2 Formato de uma função de leitura
Siga sempre este molde (é o padrão de todas as funções do arquivo):
```ts
export const getAlgo = unstable_cache(
  async (): Promise<Tipo[]> => {
    const { data, error } = await supabase
      .from('tabela')
      .select('...')
      .eq('active', true)
      .order('name')
    if (error) throw error
    return data
  },
  ['algo'],
  { revalidate: REVALIDATE_SECONDS }
)
```
- **Sempre desestruture `{ data, error }` e faça `if (error) throw error`** logo após a query. Nunca ignore o erro. (Exceção: os fallbacks controlados da seção 3.4.)
- **Sempre tipe o retorno** (`Promise<Store[]>`, etc.). Quando o join do PostgREST confunde o TS, o projeto usa `as unknown as Tipo` (ex: `data as unknown as CouponWithStore[]`) — siga esse mesmo cast, não invente `any`.

### 3.3 Regras de query (PostgREST/Supabase)
- **`!inner` no join** quando você quer excluir a linha-pai que não tem filho válido (ex: cupom de loja inativa some, categoria sem loja ativa some). Já vem documentado nos comentários — use `!inner` de propósito, e comente o porquê.
- **`!inner` duplica linhas** (uma por filho). Quando você só quer os pais, deduplique por `id`/`slug` com um `Set`, preservando a ordem que o Postgres já aplicou. Veja `getHomeCategories`, `getCouponFilterStores`.
- **Contagem:** para "quantos existem" use `.select('id', { count: 'exact', head: true })` — `head: true` não baixa as linhas, só conta. Veja `getActiveCouponsCount`, `getCouponsCount`.
- **Uma linha só:** `.maybeSingle()` (retorna `null` se não achar, sem erro). Use pra busca por slug.
- **Filtro por segurança sempre explícito:** leituras públicas filtram `.eq('active', true)`. Não confie só na RLS pra isso no código de leitura.

### 3.4 Migrações e período de transição (regra crítica — já quebrou o site 2x)
Deploy do código acontece **antes** da migração rodar no Supabase. O código novo precisa sobreviver a esse intervalo:
- `select('*')` degrada de boa quando uma **coluna** nova ainda não existe (o campo vem `undefined`). `select('coluna_especifica')` **NÃO** degrada — a query inteira falha com Postgres `42703` (coluna inexistente). Se for referenciar coluna de migração recente com lista explícita de colunas, adicione fallback pro nome antigo checando `error.code === '42703'` (veja `getSitemapStores`).
- **Tabela** nova (não coluna) tem outro código de erro: a API REST da Supabase (PostgREST) devolve **`PGRST205`** ("Could not find the table ... in the schema cache"), **não** o `42P01` do Postgres cru. Veja o helper `isMissingRelation` e como `getGuides`/`getGuideBySlug` retornam `[]`/`null` em vez de estourar.
- **Nunca adivinhe qual código vem — teste contra o servidor real** antes de assumir.

---

## 4. Cliente Supabase e permissões (RLS)

Existem **dois contextos de acesso** — não misture:

- **App Next (leitura pública):** `lib/supabase.ts` usa `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Essa chave é **anon** e respeita RLS — só enxerga o que as policies `for select using (...)` liberam (ver `schema.sql`). Ela **não pode escrever** direto nas tabelas.
- **Scripts de importação (`scripts/*.mjs`):** criam o próprio cliente com `SUPABASE_SECRET_KEY` (service role) — **bypassa RLS**, pode escrever. Essa chave nunca aparece no front nem em variável `NEXT_PUBLIC_*`.

Consequências pra código novo:
- **Escrita a partir do app (rota de API) NÃO faz `UPDATE`/`INSERT` direto** com a anon key — isso exigiria uma policy de escrita aberta, o que não queremos. Em vez disso, escreva via **função Postgres `security definer`** e chame com `supabase.rpc('nome_da_funcao', { ...params })`. Exemplos: `increment_coupon_clicks` (em `schema.sql`), `cast_coupon_vote`/`remove_coupon_vote` (usados em `app/api/vote/route.ts`). O `grant execute ... to anon` é o que libera a chamada.
- Se precisar de uma escrita nova a partir do app, o padrão é: criar a função SQL `security definer` numa migração + `grant execute` pro `anon` + chamar via `.rpc()`. Nunca abrir policy de `insert`/`update` genérica.

---

## 5. Rotas de API (`app/api/**/route.ts`)

Padrão (veja `app/api/vote/route.ts` como referência canônica):
- Exporte a função do método HTTP: `export async function POST(request: Request)`.
- **Valide a entrada antes de tudo** e retorne `400` com mensagem em PT se inválida:
  ```ts
  return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
  ```
- Leia o body defensivamente: `const body = await request.json().catch(() => null)`.
- Erros do banco viram `500` repassando `error.message`.
- Sucesso: `return NextResponse.json(data)`.
- Cookies via `const cookieStore = await cookies()` (é assíncrono neste Next). Cookies de identidade são `httpOnly`, `sameSite: "lax"`, `path: "/"`, com `maxAge` explícito. Veja o `voter_id`.
- **Escrita sempre via `.rpc()`** (seção 4), não `UPDATE`/`INSERT` direto.

---

## 6. Banco de dados: schema e migrações

- **`supabase/schema.sql`** é o estado base (bootstrap de um banco novo). **`supabase/migrations/NNNN_descricao.sql`** são as mudanças incrementais, numeradas em sequência de 4 dígitos (`0001`, `0002`, ... o próximo é `0014`). Uma migração = um passo lógico.
- Toda migração deve ser **idempotente / segura pra rodar mais de uma vez**: `create table if not exists`, `drop trigger if exists` antes de `create trigger`, `insert ... on conflict (slug) do nothing`, `create policy` só uma vez. Veja `0010_guides.sql`.
- **Tabela nova sempre com:**
  - `id uuid primary key default gen_random_uuid()` (extensão `pgcrypto`);
  - `created_at timestamptz not null default now()` e, quando o conteúdo é editável/gerado, `updated_at timestamptz not null default now()` + trigger `set_updated_at` (`create trigger set_updated_at before update ...`);
  - **RLS ligada** (`alter table X enable row level security`) + policy de leitura pública (`create policy "Public read X" on X for select using (true)` — ou `using (active = true)` quando houver flag de ativo).
- **Escrita nova = função `security definer` + `grant execute`** (seção 4), nunca policy de escrita aberta. Fixe `set search_path = public` na função, como nos exemplos.
- Colunas de conteúdo estruturado (faq, sections) são `jsonb not null default '[]'::jsonb` e têm um tipo espelho em `lib/types.ts` (`FaqItem[]`, `GuideSection[]`).
- Ao adicionar coluna/tabela, lembre da seção 3.4: o código que lê precisa de guarda pro intervalo antes da migração rodar em produção.

---

## 7. Scripts (`scripts/*.mjs`)

Rodam fora do Next (Node puro, ESM `.mjs`), no GitHub Actions (`.github/workflows/`) ou manualmente via `npm run ...` com `--env-file=.env.local` (ver `package.json`). São importação de dados (Lomadee, Awin) e geração de conteúdo por IA (Gemini).

Padrões:
- **Cheque as variáveis de ambiente no início e aborte com `process.exit(1)`** se faltar alguma, listando quais. Veja o topo de `import-lomadee.mjs`.
- Cliente Supabase dos scripts usa `SUPABASE_SECRET_KEY` (service role).
- **Cada fonte de importação é independente** — a falha de uma nunca impede as outras. No workflow, todo passo depois do primeiro leva `if: always()`; o script não engole o erro (o job ainda reporta falha, pra não perder o alerta por e-mail), mas grava o que já conseguiu.
- **Paginação que falha no meio importa o parcial**, não descarta tudo: `fetchAllPages` retorna `{ items, partial }`, e `main()` só lança o erro no final, depois de já ter gravado. Veja o comentário em `import-lomadee.mjs`.
- **`slugify()` sempre recebe o nome ORIGINAL**, nunca o nome "limpo" de exibição — mudar slug joga fora indexação do Google. Só o campo de exibição (`name`) é normalizado (ver `cleanStoreName`).
- **Modelo do Gemini:** não fixe um `gemini-X.Y-*` de memória — a Google aposenta modelos sem aviso. Modelo atual é o alias `gemini-flash-lite-latest`. Se estourar cota/404, teste candidatos direto na API antes de trocar (detalhes no `AGENTS.md`).

---

## 8. TypeScript

- `strict` ligado. Nada de `any` solto; quando o tipo do PostgREST não bate, use `as unknown as Tipo` (padrão já adotado), não `any`.
- Toda entidade tem tipo em `lib/types.ts`. Campo que pode faltar é `| null` (não `| undefined`), casando com o que o Postgres devolve. Ao adicionar coluna nova, atualize o tipo correspondente.
- Prefira `type` a `interface` (é o que o projeto usa).

---

## 9. Antes de terminar qualquer mudança de backend

1. `npm run lint` deve passar limpo.
2. Se mexeu em tipos ou em código que o build checa, rode `npm run build` (ou ao menos confie no lint + revisão) — não deixe erro de tipo.
3. Releia o `AGENTS.md` da raiz: as regras de **cache**, **SEO**, **período de transição de migração**, **importação de dados** e **modelo Gemini** valem e têm detalhes que não estão repetidos aqui.
4. Nunca commite segredo (chave de API, `SUPABASE_SECRET_KEY`) — eles vêm de env (`.env.local`, secrets do GitHub Actions).
