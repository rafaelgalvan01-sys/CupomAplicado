export type FaqItem = {
  question: string
  answer: string
}

export type Category = {
  id: string
  name: string
  slug: string
  seo_description: string | null
  how_to_use_content: string | null
  faq: FaqItem[]
}

export type GuideSection = {
  heading: string
  body: string
}

export type Guide = {
  id: string
  slug: string
  title: string
  related_category_slug: string | null
  intro: string | null
  sections: GuideSection[]
  faq: FaqItem[]
  updated_at: string
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
  how_to_use_content: string | null
  faq: FaqItem[]
  updated_at: string
  categories?: Category | null
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
  updated_at: string
}

export type CouponWithStore = Coupon & {
  stores: {
    name: string
    slug: string
    logo_url: string | null
    description: string | null
  } | null
}
