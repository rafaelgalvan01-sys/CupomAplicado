import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-4">
        <Link href="/">
          <Image src="/logo.svg" alt="Cupom Aplicado" width={200} height={16} priority />
        </Link>
      </div>
    </header>
  )
}
