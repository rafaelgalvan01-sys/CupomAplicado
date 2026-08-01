import Link from "next/link";
import Image from "next/image";
import iconMark from "@/app/icon.png";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center gap-3">
        <Image src={iconMark} alt="" width={36} height={36} className="h-9 w-9" />
        <nav aria-label="Links institucionais" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/sobre" className="hover:text-foreground hover:underline">
            Sobre o Cupom Aplicado
          </Link>
          <Link href="/contato" className="hover:text-foreground hover:underline">
            Contato
          </Link>
          <Link href="/politica-de-privacidade" className="hover:text-foreground hover:underline">
            Política de Privacidade
          </Link>
        </nav>
        <p className="leading-relaxed">
          © {new Date().getFullYear()} Cupom Aplicado.
          <br />
          Todos os direitos reservados.
        </p>
      </div>
      {/* Texto sr-only usado para verificar a propriedade do site junto à rede de
          afiliados Awin. Conta já aprovada — mantido por segurança. */}
      <span className="sr-only">Awin</span>
    </footer>
  );
}
