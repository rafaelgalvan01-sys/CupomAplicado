<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Convenções do projeto (SEO e performance)

Regras fixas, resultado da auditoria de SEO de jul/2026. Aplicar em qualquer página/componente novo, não só nos que já existem.

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

## Navegação interna

- Toda entidade listável que ganha sua própria rota (loja, o que vier depois) precisa de pelo menos um caminho de navegação a partir da home ou do header — nunca depender só do sitemap pra ser descoberta.

## Componentes (shadcn/Base UI)

- Quando um componente shadcn com suporte a `render` (Button, Badge) funciona como navegação, usar `render={<Link href=... />}` — nunca estilizar um `<a>` cru pra imitar o visual, nem `onClick` + `router.push` pra navegação simples.

## GitHub Actions (importação de dados)

- **Cada fonte de importação (Lomadee, Awin, o que vier depois) precisa ser independente das outras dentro do mesmo workflow** — a falha de uma nunca pode impedir as demais de rodar. Todo passo de importação depois do primeiro leva `if: always()`. Não usar `continue-on-error` no passo que falha: o job como um todo deve continuar reportando falha nesse caso, pra não perder o alerta por e-mail do GitHub Actions quando uma fonte está fora do ar. Regra criada jul/2026 depois de a Lomadee ficar fora do ar (erro 500 no lado deles) e isso silenciosamente travar a importação da Awin por 17h+, já que ela vinha logo depois no mesmo job.

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

- **Nunca chame `window.open()` depois de um `await` (ex: `navigator.clipboard.writeText`) direto dentro de um handler de clique.** Isso já causou um bug real (jul/2026, botão "Copiar" do cupom): o navegador atrasava/reavaliava a decisão de bloquear o popup por causa do `await` anterior, enquanto nosso `if (!popup)` já tinha rodado achando que tinha sido bloqueado e navegado a aba atual pro fallback — resultado: a aba nova abria a loja E a aba atual TAMBÉM navegava pra lá.
- Se for necessário um atraso proposital antes de abrir a aba (ex: dar tempo do usuário ver algo revelado na tela antes de trocar de aba), use um único `setTimeout` chamando `window.open()` **uma única vez**, com a checagem de `if (!popup)` feita nesse mesmo callback — nunca duas chamadas/checagens de `window.open()` na mesma interação (uma síncrona "otimista" + outra depois de um delay), pois é exatamente essa duplicidade que causa a navegação dupla. Mantenha o atraso curto (algo como ~700ms) — atrasos maiores arriscam o navegador não reconhecer mais a chamada como resposta direta ao clique do usuário e bloquear o popup de verdade.
