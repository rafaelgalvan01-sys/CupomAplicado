import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'
import type { Store, Coupon, CouponWithStore, Category } from './types'

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
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle()
      if (error) throw error
      return data
    },
    ['store-by-slug'],
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
  async (limit: number): Promise<CouponWithStore[]> => {
    const { data, error } = await supabase
      .from('coupons')
      .select(COUPON_WITH_STORE_SELECT)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as unknown as CouponWithStore[]
  },
  ['coupons'],
  { revalidate: REVALIDATE_SECONDS }
)

export async function getCoupons(options: { query?: string; limit?: number }): Promise<CouponWithStore[]> {
  const { query, limit = 60 } = options
  const term = query?.trim().replace(/[,()%]/g, '')

  if (!term) return getCouponsCached(limit)

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
    .limit(limit)
  if (error) throw error
  return data as unknown as CouponWithStore[]
}

export const getTopStores = unstable_cache(
  async (limit = 8): Promise<Store[]> => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('active', true)
      .order('name')
      .limit(limit)
    if (error) throw error
    return data
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
