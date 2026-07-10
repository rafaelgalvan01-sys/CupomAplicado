export type Category = {
  id: string
  name: string
  slug: string
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
}

export type DiscountType = 'percentual' | 'fixo' | 'frete_gratis'

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
}
