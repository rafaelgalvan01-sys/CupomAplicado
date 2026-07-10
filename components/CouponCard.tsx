import type { Coupon } from '@/lib/types'

function formatDiscount(coupon: Coupon) {
  if (coupon.discount_type === 'percentual') return `${coupon.discount_value}% OFF`
  if (coupon.discount_type === 'fixo') return `R$${coupon.discount_value} OFF`
  return 'Frete Grátis'
}

export function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4">
      <span className="w-fit rounded bg-brand/10 px-2 py-1 text-sm font-semibold text-brand-dark">
        {formatDiscount(coupon)}
      </span>
      <h3 className="font-semibold text-brand-dark">{coupon.title}</h3>
      {coupon.description && <p className="text-sm text-black/60">{coupon.description}</p>}
      {coupon.code && (
        <p className="text-sm text-black/60">
          Código: <span className="font-mono font-semibold">{coupon.code}</span>
        </p>
      )}
      <a
        href={`/ir/${coupon.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block rounded-md bg-brand px-4 py-2 text-center font-semibold text-white transition-opacity hover:opacity-90"
      >
        Aplicar cupom
      </a>
    </div>
  )
}
