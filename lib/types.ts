export type Category = {
  id: string
  name: string
  slug: string
}

export type StoreFaqItem = {
  question: string
  answer: string
}

export type Store = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  category_id: string | null
  affiliate_base_url: string | null
  active: boolean
  seo_description: string | null
  faq: StoreFaqItem[]
}

export type DiscountType = 'percentual' | 'fixo' | 'frete_gratis' | 'outro'

export type Coupon = {
  id: string
  store_id: string
  title: string
  description: string | null
  code: string | null
  discount_type: DiscountType
  discount_value: number | null
  affiliate_url: string
  expires_at: string | null
  active: boolean
  clicks: number
  is_highlight: boolean
  helpful_count: number
  not_helpful_count: number
}

export type CouponWithStore = Coupon & {
  stores: {
    name: string
    slug: string
    logo_url: string | null
    description: string | null
    categories: { name: string } | null
  } | null
}

export type SortOption = 'novos' | 'populares' | 'expirando'
