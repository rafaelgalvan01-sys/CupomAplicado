<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Convenções do projeto (SEO e performance)

Regras fixas, resultado da auditoria de SEO de jul/2026. Aplicar em qualquer página/componente novo, não só nos que já existem.

## Migrações e período de transição (deploy antes da migração rodar)

- **`select('*')` degrada bem quando uma coluna nova ainda não existe no Supabase (o campo só vem `undefined`); `select('coluna_especifica')` explícito NÃO degrada — a query inteira falha com erro de Postgres (`42703`, coluna inexistente) até a migração ser aplicada.** Isso já quebrou o `sitemap.xml` em dev (500) na migração 0006, porque `getSitemapStores` usa `select('slug, updated_at, ...')` em vez de `'*'`. Qualquer `lib/data.ts` que usa `select()` com lista explícita de colunas e referencia uma coluna de migração recente precisa de fallback pro nome antigo da coluna (checar `error.code === '42703'`) ou aceitar que vai ficar fora do ar até a migração rodar — nunca assumir que "funciona igual ao `select('*')`".
- Em JSX/render, todo campo de migração recente (`store.campo_novo`, `coupon.campo_novo`) precisa do guard `{campo && (...)}` até a migração ser aplicada em produção — mesmo padrão já usado pra `faq`/`seo_description` (ver comentários em `app/loja/[slug]/page.tsx`).

## Cache

- Toda função nova em `lib/data.ts` que **não** depende de dado por-requisição (sem `searchParams`/`cookies` no meio do caminho) deve ser envolvida em `unstable_cache` (ver `REVALIDATE_SECONDS` no topo do arquivo pro padrão de janela).
- Toda página dinâmica por slug (`app/**/[slug]/page.tsx`) que não lê `searchParams` deve exportar `export const revalidate = 300` (ou o valor que fizer sentido) logo no topo do arquivo.
- Exceção conhecida: páginas que leem `searchParams` (ex: a home, por causa de `?q=`/`?sort=`) não se beneficiam de `revalidate` de rota — o cache ali precisa vir da camada de dados mesmo.

## Imagens

- A primeira imagem de qualquer grid/lista/carrossel (índice 0, ou as primeiras ~4 num carrossel) leva `priority` no `<Image>`. As demais, não — `priority` em toda imagem derrota o propósito (atrasa o que devia carregar rápido).

## Metadata e SEO

- Description de página (`generateMetadata`) sempre prioriza o texto mais rico disponível (ex: `seo_description` gerado por IA) antes de qualquer fallback genérico. Truncar em ~155 caracteres cortando na palavra inteira, nunca no meio.
- Nenhuma entidade com nome/marca própria (loja, e futuramente categoria) usa imagem externa crua (logo de CDN de terceiro) como `og:image`. Sempre um `opengraph-image.tsx` próprio do segmento de rota.
- Todo filtro de indexabilidade aplicado numa página (`robots: {index:false}`) precisa do espelho exato em `app/sitemap.ts` — nunca listar no sitemap uma URL que a própria página marca `noindex`.
- **Todo texto exibido pro usuário (descrições, resumos, blurbs de card) precisa ser produzido por nós e otimizado em SEO — nunca um campo cru vindo de fonte externa/importação** (ex: `store.description` da API da Lomadee, tipo "Cupons de retail"). Se o conteúdo otimizado (`seo_description`/`faq`, gerado pelo `scripts/generate-seo-content.mjs` via Gemini) ainda não existe pra aquela entidade, prefira não mostrar nada a mostrar o campo cru. Regra descoberta jul/2026 ao notar que o card de loja em `/lojas` estava exibindo a description bruta da Lomadee.
- **Ao limpar/normalizar um campo de exibição vindo de fonte externa (ex: nome de loja com sufixo " BR"), nunca deixar isso afetar o `slug`** — o `slug` já pode estar indexado pelo Google; mudar a URL de uma página existente joga fora o histórico de indexação sem necessidade. `slugify()` continua recebendo o nome ORIGINAL (não o limpo), só o campo `name` (o que aparece pro usuário) é que muda. Ver `cleanStoreName()` em `scripts/import-lomadee.mjs`/`scripts/import-awin.mjs` (jul/2026).
- **Todo parágrafo/resposta de conteúdo (seo_description, how_to_use_content, FAQ, texto evergreen escrito à mão) começa com uma frase direta e autocontida que já responde sozinha à pergunta central, antes de elaborar** — pensado pra ser citável isoladamente por mecanismos de busca com IA (Google AI Overviews, Perplexity, ChatGPT), não só por um leitor humano lendo o parágrafo inteiro. Quando o conteúdo enumera vários motivos/passos/itens, usar lista (`<ul>`/`<ol>`) em vez de encadear tudo numa frase corrida só — mais fácil de extrair tanto por IA quanto por leitor humano. Regra criada jul/2026 como oportunidade de SEO ainda não explorada pelos concorrentes (Cuponomia, Pelando), que escrevem no molde clássico (parágrafos densos, sem resposta isolada no início).

## Navegação interna

- Toda entidade listável que ganha sua própria rota (loja, o que vier depois) precisa de pelo menos um caminho de navegação a partir da home ou do header — nunca depender só do sitemap pra ser descoberta.

## Componentes (shadcn/Base UI)

- **Toda mudança de front-end (layout, componente, animação, modal, drawer, sheet, tooltip, popover, etc.) deve usar o componente shadcn correspondente quando existir — nunca implementar uma alternativa customizada do zero.** Se o shadcn não tiver o componente, usar o primitivo do `@base-ui/react` diretamente seguindo o mesmo padrão dos componentes shadcn existentes. Regra criada jul/2026 depois de implementar uma gaveta mobile manualmente que causou overflow e problemas visuais, que foram resolvidos substituindo pelo `Sheet` do shadcn.
- Quando um componente shadcn com suporte a `render` (Button, Badge, SheetClose, etc.) funciona como navegação, usar `render={<Link href=... />}` — nunca estilizar um `<a>` cru pra imitar o visual, nem `onClick` + `router.push` pra navegação simples.

## GitHub Actions (importação de dados)

- **Cada fonte de importação (Lomadee, Awin, o que vier depois) precisa ser independente das outras dentro do mesmo workflow** — a falha de uma nunca pode impedir as demais de rodar. Todo passo de importação depois do primeiro leva `if: always()`. Não usar `continue-on-error` no passo que falha: o job como um todo deve continuar reportando falha nesse caso, pra não perder o alerta por e-mail do GitHub Actions quando uma fonte está fora do ar. Regra criada jul/2026 depois de a Lomadee ficar fora do ar (erro 500 no lado deles) e isso silenciosamente travar a importação da Awin por 17h+, já que ela vinha logo depois no mesmo job.
- **Dentro de uma fonte só, paginação que falha no meio do caminho deve importar o que já foi buscado, não descartar tudo** — mas o job continua reportando falha mesmo assim (nunca engolir o erro completamente), só que depois de já ter gravado o parcial. Regra criada jul/2026 depois de a Lomadee retornar erro 500 em `/affiliate/campaigns` a partir da página 2 por 27h+ seguidas: o script antigo descartava até a página 1 (que tinha vindo certinha) porque uma exceção em qualquer página abortava a função inteira antes de gravar qualquer coisa no Supabase. Ver `scripts/import-lomadee.mjs` (`fetchAllPages` retorna `{ items, partial }`; `main()` lança erro só no final, depois de já ter importado o parcial, se `partial` for `true` em qualquer fonte).

## Modelo do Gemini (scripts/generate-seo-content.mjs e generate-category-seo-content.mjs)

- **Nunca supor que um nome de modelo Gemini específico (`gemini-X.Y-flash`) vai continuar disponível/gratuito indefinidamente — a Google aposenta modelos "para novos usuários" sem aviso prévio no código.** Descoberto jul/2026: `gemini-3.5-flash` (usado desde a criação do script) tinha cota gratuita diária de só **20 requisições/dia** — compartilhada entre os dois scripts (lojas rodam automaticamente 2x/dia via GitHub Actions, categorias rodam manualmente), o que fazia a cota estourar em praticamente toda tentativa. Ao tentar trocar pra `gemini-2.5-flash`/`gemini-2.5-flash-lite`, ambos retornaram `404 "no longer available to new users"` — apesar de ainda aparecerem na listagem de `GET /v1beta/models`, essa conta não pode mais usá-los (aposentados para contas criadas depois de um certo corte).
- **Antes de trocar o `MODEL` nos dois scripts, teste candidatos direto contra a API** (`GET https://generativelanguage.googleapis.com/v1beta/models?key=...` pra listar o que a conta pode ver, depois uma chamada de teste real com `ai.interactions.create({ model, input: "..." })` pra cada candidato — listar não garante que funciona, só uma chamada real confirma). Modelo atual (jul/2026): `gemini-flash-lite-latest` — um alias que a Google aponta pro "lite" recomendado do momento, o único testado que respondeu OK sem 404/429 no dia da troca.
- Se `gemini-flash-lite-latest` também passar a estourar cota ou ficar indisponível no futuro, repetir esse mesmo processo de teste antes de escolher o próximo — não adivinhar um nome de modelo da memória/treinamento.

## Verificação de mudanças visuais

- **Toda mudança no front-end (layout, componente, estilo, animação) precisa ser conferida no mobile também, não só no desktop** — não basta testar na largura em que a mudança foi pedida/pensada. Usar uma largura de celular real (ex: 375px) além da largura desktop, e nos dois temas (claro/escuro) quando a mudança envolver cor ou contraste. Regra criada jul/2026 depois de mudanças no hero (brilho, ícones, animação) só terem sido verificadas em larguras desktop por várias rodadas seguidas, sem checar mobile nenhuma vez.
- Coisas específicas pra olhar no mobile: overflow horizontal (`document.body.scrollWidth` não deve passar de `window.innerWidth`), elementos que dependem de breakpoint (`hidden lg:block` etc.) escondendo/aparecendo corretamente, e texto que pode quebrar de forma estranha em telas estreitas.

## Efeitos visuais sutis (glow, gradientes, opacidade)

- **Checagem estrutural (`getBoundingClientRect`, `getComputedStyle`) confirma que um efeito está posicionado certo, mas não confirma que ele é visível o suficiente pro olho humano, nem que cobre a área toda.** Um `radial-gradient`/`opacity` pode passar em todas as checagens de DOM (posição, background-image aplicado) e ainda assim parecer "sem efeito nenhum" numa captura de tela real — seja por intensidade fraca demais num ponto, seja porque um gradiente radial centralizado (um "holofote") naturalmente já chegou a zero antes de alcançar as bordas/cantos da área.
- **Nunca combine um `radial-gradient` (formato orgânico/circular) com um `linear-gradient` full-width pra "completar a cobertura" — isso já foi tentado e revertido (jul/2026).** Um linear-gradient tem borda RETA (é um retângulo), então mesmo resolvendo a cobertura ele cria um corte visível nas laterais/topo, parecendo uma caixa colada por cima em vez de um brilho ambiente. A saída certa é usar **um único radial-gradient largo o suficiente** (elipse quase do tamanho do próprio container, ex: `95% 85%`) — sendo circular/elíptico, ele nunca tem aresta reta em lugar nenhum, então "resolver cobertura" é só uma questão de alargar a elipse e/ou empurrar o stop de "transparent" mais pra fora, não de somar uma segunda camada com formato diferente.
- Ao mexer no `.hero-glow` (`app/globals.css`) ou em qualquer efeito parecido: calcule manualmente (ou confirme com screenshot cobrindo a largura toda, cantos incluídos) a opacidade resultante nos pontos críticos — aqui, ao longo de toda a costura com o header (y=0% do container, x de 0% a 100%). Uma opacidade baixa (~0.10-0.15) nos cantos já é suficiente pra não ler como "sem brilho"; não precisa chegar perto do pico ali.
- Configuração atual do `.hero-glow` (jul/2026, corrigida 3x — intensidade, depois cobertura via linear/revertido, depois cobertura via elipse larga):
  ```css
  background: radial-gradient(ellipse 95% 85% at 50% 8%, rgba(29, 183, 97, 0.3), transparent 82%);
  ```

## `window.open()` em handlers de clique

- **`window.open()` só é 100% confiável (nunca ambíguo pro bloqueador de pop-up) quando chamado de forma síncrona, como a própria primeira coisa que roda no handler de clique.** Qualquer atraso antes dele — seja um `await` (ex: `navigator.clipboard.writeText`) direto no handler, seja um `setTimeout`, mesmo curto (~700ms) — já causou o mesmo bug real duas vezes (jul/2026, botão "Copiar" do cupom): o navegador fica em dúvida se a chamada ainda conta como resposta direta ao clique, e pode deixar a aba abrir de qualquer jeito enquanto o nosso próprio `if (!popup)` já rodou achando que foi bloqueado e navegou a aba atual como fallback — resultado, a aba nova abre a loja E a aba atual TAMBÉM navega pra lá.
- **Se for necessário um atraso proposital antes da navegação de verdade** (ex: dar tempo do usuário ver algo revelado na tela antes de trocar de aba), a técnica correta é: chamar `window.open("", "_blank")` (aba em branco) **de forma síncrona, na hora do clique** — isso nunca é ambíguo pro navegador, é só uma aba vazia. Guarde a referência retornada e, depois do atraso, faça `popup.location.href = url` **nessa mesma referência** — isso é só uma navegação numa janela que já é sua, não passa pelo bloqueador de pop-up de novo, então não existe uma segunda "decisão" do navegador que possa correr em paralelo com o fallback.
- Não use `"noopener"`/`"noreferrer"` na chamada em branco se for guardar a referência pra navegar depois — as duas fazem `window.open` sempre retornar `null` (por especificação), o que impediria guardar essa referência. Para manter a mesma proteção contra reverse tabnabbing sem perder a referência, zere manualmente `popup.opener = null` logo depois de abrir.
- Nunca faça DUAS chamadas a `window.open()` (ou duas checagens de `if (!popup)`) pra uma mesma interação de clique — é exatamente essa duplicidade (uma síncrona "otimista" + outra depois de um delay) que causa a navegação dobrada.
- **Se o mesmo handler também usa `navigator.clipboard.writeText()`, ela precisa rodar ANTES de qualquer `window.open()`/abertura de aba, nunca depois.** A Clipboard API exige que o documento esteja em foco pra copiar sem pedir permissão explícita; abrir uma aba nova tira o foco da aba atual, e se isso acontecer antes da cópia, o navegador (confirmado no Brave) passa a exibir um prompt de permissão desnecessário em vez de copiar direto. Ordem certa: copiar primeiro, abrir a aba (ou navegar) logo em seguida — ambos ainda de forma síncrona, sem `await` entre um e outro.
