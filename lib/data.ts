import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'
import type { Store, Coupon, CouponWithStore, Category, Guide } from './types'

// !inner garante que cupons de lojas inativas (ou bloqueadas por RLS) somem
// da lista, em vez de aparecer com "loja" vazia.
const COUPON_WITH_STORE_SELECT =
  '*, stores!inner(name, slug, logo_url, description)'

// Janela de revalidação pras leituras cacheadas abaixo. Cupons/lojas não
// mudam a cada segundo, então não faz sentido bater no Supabase a cada
// requisição — unstable_cache guarda o resultado entre requisições
// independente da rota ser estática ou não (ex: a home usa searchParams,
// o que por si só já impede cache no nível de rota).
const REVALIDATE_SECONDS = 300

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },
  ['categories'],
  { revalidate: REVALIDATE_SECONDS }
)

// Só pro sitemap: usa !inner pra excluir categorias sem nenhuma loja ativa
// (mesmo padrão de getSitemapStores) — uma categoria vazia vira noindex na
// própria página (ver app/categoria/[slug]/page.tsx) e não faz sentido
// oferecê-la pro Google via sitemap.
export const getSitemapCategories = unstable_cache(
  async (): Promise<{ slug: string }[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('slug, stores!inner(id)')
      .eq('stores.active', true)
    if (error) throw error

    const seen = new Set<string>()
    for (const row of data as { slug: string }[]) seen.add(row.slug)
    return [...seen].map((slug) => ({ slug }))
  },
  ['sitemap-categories'],
  { revalidate: REVALIDATE_SECONDS }
)

// Retorna lojas de uma categoria filtrando pelo slug da categoria.
// O join com categories faz o inner join (só lojas com categoria compatível)
// e já traz os dados da categoria junto.
export const getStoresByCategory = cache(
  unstable_cache(
    async (categorySlug: string): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*, categories!inner(name, slug)')
        .eq('active', true)
        .eq('categories.slug', categorySlug)
        .order('name')
      if (error) throw error
      return data as unknown as Store[]
    },
    ['stores-by-category'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

export const getCategoryBySlug = cache(
  unstable_cache(
    async (slug: string): Promise<Category | null> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw error
      return data
    },
    ['category-by-slug'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

// PGRST205 = tabela ainda não existe (mesmo raciocínio do fallback de 42703
// em getSitemapStores, mas pra tabela nova em vez de coluna nova) — cobre a
// janela entre o deploy deste código e a migração 0010 rodar no Supabase,
// pra não derrubar sitemap/listagem. Confirmado ao vivo: o PostgREST (API
// REST da Supabase) intercepta "tabela não existe" com o código próprio dele
// (PGRST205, "Could not find the table ... in the schema cache") ANTES de
// chegar no Postgres — não é o 42P01 (undefined_table) cru do Postgres.
function isMissingRelation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'PGRST205'
}

// Só guias com intro preenchido (conteúdo já gerado) — os demais ainda estão
// pendentes de geração e não são exibidos nem indexados.
export const getGuides = unstable_cache(
  async (): Promise<Guide[]> => {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .not('intro', 'is', null)
      .order('title')
    if (error) {
      if (isMissingRelation(error)) return []
      throw error
    }
    return data
  },
  ['guides'],
  { revalidate: REVALIDATE_SECONDS }
)

// Todos os slugs (com ou sem conteúdo ainda) — usado só pra
// generateStaticParams; a própria página trata o caso de conteúdo pendente.
export const getGuideSlugs = unstable_cache(
  async (): Promise<{ slug: string }[]> => {
    const { data, error } = await supabase.from('guides').select('slug')
    if (error) {
      if (isMissingRelation(error)) return []
      throw error
    }
    return data
  },
  ['guide-slugs'],
  { revalidate: REVALIDATE_SECONDS }
)

export const getGuideBySlug = cache(
  unstable_cache(
    async (slug: string): Promise<Guide | null> => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (error) {
        if (isMissingRelation(error)) return null
        throw error
      }
      return data
    },
    ['guide-by-slug'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

// Caminho inverso de guide.related_category_slug — pra página de categoria
// linkar de volta pro guia que fala dela, quando existir um com conteúdo já
// gerado.
export const getGuideByCategorySlug = cache(
  unstable_cache(
    async (categorySlug: string): Promise<Guide | null> => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('related_category_slug', categorySlug)
        .not('intro', 'is', null)
        .limit(1)
        .maybeSingle()
      if (error) {
        if (isMissingRelation(error)) return null
        throw error
      }
      return data
    },
    ['guide-by-category-slug'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

// cache() deduplica a chamada entre generateMetadata e a página em si, que
// pedem os mesmos dados dentro da mesma requisição; unstable_cache guarda
// entre requisições diferentes.
export const getStores = unstable_cache(
  async (): Promise<Store[]> => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('active', true)
      .order('name')
    if (error) throw error
    return data
  },
  ['stores'],
  { revalidate: REVALIDATE_SECONDS }
)

export const getStoreBySlug = cache(
  unstable_cache(
    async (slug: string): Promise<Store | null> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle()
      if (error) throw error
      return data as unknown as Store | null
    },
    ['store-by-slug'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

// Outras lojas da mesma categoria, pra linkar entre páginas de loja
// ("lojas parecidas") — ajuda o Google a descobrir/conectar as páginas do
// site e mantém a pessoa navegando. Loja sem categoria não tem relacionadas.
export const getRelatedStores = cache(
  unstable_cache(
    async (categoryId: string, excludeStoreId: string, limit = 6): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('active', true)
        .eq('category_id', categoryId)
        .neq('id', excludeStoreId)
        .order('name')
        .limit(limit)
      if (error) throw error
      return data
    },
    ['related-stores'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

export const getCouponsByStore = cache(
  unstable_cache(
    async (storeId: string): Promise<Coupon[]> => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', storeId)
        .eq('active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    ['coupons-by-store'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

export const getFeaturedCoupons = unstable_cache(
  async (limit = 3): Promise<CouponWithStore[]> => {
    const { data, error } = await supabase
      .from('coupons')
      .select(COUPON_WITH_STORE_SELECT)
      .eq('active', true)
      .eq('is_highlight', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as unknown as CouponWithStore[]
  },
  ['featured-coupons'],
  { revalidate: REVALIDATE_SECONDS }
)

// Listagem padrão (sem busca), sempre por mais recente — cacheável. Busca
// por termo livre fica de fora do cache: geraria uma entrada por termo
// digitado, sem ganho real, já que o usuário espera um resultado fresco.
const getCouponsCached = unstable_cache(
  async (limit: number, offset: number): Promise<CouponWithStore[]> => {
    const { data, error } = await supabase
      .from('coupons')
      .select(COUPON_WITH_STORE_SELECT)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw error
    return data as unknown as CouponWithStore[]
  },
  ['coupons'],
  { revalidate: REVALIDATE_SECONDS }
)

export const COUPONS_PAGE_SIZE = 60

export async function getCoupons(options: { query?: string; limit?: number; page?: number }): Promise<CouponWithStore[]> {
  const { query, limit = COUPONS_PAGE_SIZE, page = 1 } = options
  const offset = (Math.max(page, 1) - 1) * limit
  const term = query?.trim().replace(/[,()%]/g, '')

  if (!term) return getCouponsCached(limit, offset)

  const { data: matchingStores } = await supabase.from('stores').select('id').ilike('name', `%${term}%`)
  const storeIds = (matchingStores ?? []).map((s) => s.id)

  const orParts = [`title.ilike.%${term}%`]
  if (storeIds.length > 0) orParts.push(`store_id.in.(${storeIds.join(',')})`)

  const { data, error } = await supabase
    .from('coupons')
    .select(COUPON_WITH_STORE_SELECT)
    .eq('active', true)
    .or(orParts.join(','))
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return data as unknown as CouponWithStore[]
}

// Total de cupons pra calcular quantas páginas mostrar na paginação — mesmo
// filtro de getCoupons, mas só a contagem (count: 'exact', head: true não
// baixa as linhas). Busca por termo livre fica de fora do cache pelo mesmo
// motivo de getCoupons.
export async function getCouponsCount(query?: string): Promise<number> {
  const term = query?.trim().replace(/[,()%]/g, '')
  if (!term) return getActiveCouponsCount()

  const { data: matchingStores } = await supabase.from('stores').select('id').ilike('name', `%${term}%`)
  const storeIds = (matchingStores ?? []).map((s) => s.id)

  const orParts = [`title.ilike.%${term}%`]
  if (storeIds.length > 0) orParts.push(`store_id.in.(${storeIds.join(',')})`)

  const { count, error } = await supabase
    .from('coupons')
    .select('id', { count: 'exact', head: true })
    .eq('active', true)
    .or(orParts.join(','))
  if (error) throw error
  return count ?? 0
}

// Ordena por cliques agregados dos cupons ativos da loja — proxy automático
// de popularidade real de uso no site, sem precisar de curadoria manual nem
// de fonte externa de volume de busca. Lojas sem cliques ainda (recém-
// importadas) caem pro fim, em ordem alfabética entre si.
type StoreWithCoupons = Store & { coupons: { clicks: number; active: boolean }[] }

export const getTopStores = unstable_cache(
  async (limit = 8): Promise<Store[]> => {
    const { data, error } = await supabase
      .from('stores')
      .select('*, coupons(clicks, active)')
      .eq('active', true)
    if (error) throw error

    const ranked = (data as unknown as StoreWithCoupons[])
      .map((store) => ({
        store,
        totalClicks: store.coupons.filter((c) => c.active).reduce((sum, c) => sum + c.clicks, 0),
      }))
      .sort((a, b) => b.totalClicks - a.totalClicks || a.store.name.localeCompare(b.store.name))

    return ranked.slice(0, limit).map((r) => r.store)
  },
  ['top-stores'],
  { revalidate: REVALIDATE_SECONDS }
)

export const getActiveCouponsCount = unstable_cache(
  async (): Promise<number> => {
    const { count, error } = await supabase
      .from('coupons')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
    if (error) throw error
    return count ?? 0
  },
  ['active-coupons-count'],
  { revalidate: REVALIDATE_SECONDS }
)

// Só pro sitemap: usa !inner pra já excluir lojas sem nenhum cupom ativo
// (essas lojas viram noindex na própria página — não faz sentido oferecê-las
// pro Google via sitemap) e devolve o updated_at mais recente entre a loja e
// seus cupons como lastModified — updated_at reflete a última escrita real
// (import/geração de conteúdo), diferente de created_at, que fica parado na
// primeira vez que a linha foi criada.
type SitemapStoreRow = {
  slug: string
  updated_at?: string
  created_at?: string
  coupons: { updated_at?: string; created_at?: string }[]
}

export const getSitemapStores = unstable_cache(
  async (): Promise<{ slug: string; lastModified: Date }[]> => {
    const initial = await supabase
      .from('stores')
      .select('slug, updated_at, coupons!inner(updated_at)')
      .eq('active', true)
      .eq('coupons.active', true)

    // 42703 = coluna inexistente — cobre o período entre este deploy e a
    // migração 0006 ser aplicada no Supabase. Sem esse fallback o sitemap
    // fica fora do ar até a migração rodar.
    const { data, error } =
      initial.error?.code === '42703'
        ? await supabase
            .from('stores')
            .select('slug, created_at, coupons!inner(created_at)')
            .eq('active', true)
            .eq('coupons.active', true)
        : initial

    if (error) throw error

    return ((data ?? []) as SitemapStoreRow[]).map((store) => {
      const dates = [
        new Date(store.updated_at ?? store.created_at!).getTime(),
        ...store.coupons.map((c) => new Date(c.updated_at ?? c.created_at!).getTime()),
      ]
      return { slug: store.slug, lastModified: new Date(Math.max(...dates)) }
    })
  },
  ['sitemap-stores'],
  { revalidate: REVALIDATE_SECONDS }
)
