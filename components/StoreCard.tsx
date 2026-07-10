import Link from 'next/link'
import type { Store } from '@/lib/types'

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      href={`/loja/${store.slug}`}
      className="rounded-lg border border-black/10 p-4 transition-colors hover:border-brand"
    >
      <h3 className="font-semibold text-brand-dark">{store.name}</h3>
      {store.description && <p className="mt-1 text-sm text-black/60">{store.description}</p>}
    </Link>
  )
}
