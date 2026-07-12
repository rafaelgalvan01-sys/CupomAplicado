import { cache } from 'react'
import { supabase } from './supabase'
import type { Category, Store, Coupon, CouponWithStore, SortOption } from './types'

// !inner garante que cupons de lojas inativas (ou bloqueadas por RLS) somem
// da lista, em vez de aparecer com "loja" vazia.
const COUPON_WITH_STORE_SELECT =
  '*, stores!inner(name, slug, logo_url, description, categories(name))'

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

// cache() deduplica a chamada entre generateMetadata e a página em si, que
// pedem os mesmos dados dentro da mesma requisição.
export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data
})

export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}

export const getStoreBySlug = cache(
  async (
    slug: string
  ): Promise<(Store & { categories: { name: string; slug: string } | null }) | null> => {
    const { data, error } = await supabase
      .from('stores')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
    if (error) throw error
    return data
  }
)

export const getStoresByCategory = cache(async (categoryId: string): Promise<Store[]> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('category_id', categoryId)
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
})

export const getCouponsByStore = cache(async (storeId: string): Promise<Coupon[]> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
})

export async function getFeaturedCoupons(limit = 3): Promise<CouponWithStore[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select(COUPON_WITH_STORE_SELECT)
    .eq('active', true)
    .eq('is_highlight', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as unknown as CouponWithStore[]
}

export async function getCouponsSorted(options: {
  sort?: SortOption
  query?: string
  limit?: number
}): Promise<CouponWithStore[]> {
  const { sort = 'novos', query, limit = 60 } = options

  let request = supabase
    .from('coupons')
    .select(COUPON_WITH_STORE_SELECT)
    .eq('active', true)

  const term = query?.trim().replace(/[,()%]/g, '')
  if (term) {
    const { data: matchingStores } = await supabase
      .from('stores')
      .select('id')
      .ilike('name', `%${term}%`)
    const storeIds = (matchingStores ?? []).map((s) => s.id)

    const orParts = [`title.ilike.%${term}%`]
    if (storeIds.length > 0) orParts.push(`store_id.in.(${storeIds.join(',')})`)
    request = request.or(orParts.join(','))
  }

  if (sort === 'populares') {
    request = request.order('clicks', { ascending: false })
  } else if (sort === 'expirando') {
    request = request.not('expires_at', 'is', null).order('expires_at', { ascending: true })
  } else {
    request = request.order('created_at', { ascending: false })
  }

  const { data, error } = await request.limit(limit)
  if (error) throw error
  return data as unknown as CouponWithStore[]
}

export async function getTopStores(limit = 8): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('active', true)
    .order('name')
    .limit(limit)
  if (error) throw error
  return data
}

export async function getActiveCouponsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
  if (error) throw error
  return count ?? 0
}
