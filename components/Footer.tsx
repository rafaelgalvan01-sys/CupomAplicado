import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
      <nav aria-label="Links institucionais" className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/sobre" className="hover:text-foreground hover:underline">
          Sobre o Cupom Aplicado
        </Link>
        <Link href="/como-usar-cupom-de-desconto" className="hover:text-foreground hover:underline">
          Como usar cupom de desconto
        </Link>
      </nav>
      <p>© {new Date().getFullYear()} Cupom Aplicado. Todos os direitos reservados.</p>
      {/* Texto sr-only usado para verificar a propriedade do site junto à rede de
          afiliados Awin. Conta já aprovada — mantido por segurança. */}
      <span className="sr-only">Awin</span>
    </footer>
  );
}
