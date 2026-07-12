export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Cupom Aplicado. Todos os direitos reservados.</p>
      {/* Texto sr-only para verificação de propriedade do site na rede de afiliados Awin
          durante o cadastro como publisher. Remover depois que a conta for aprovada. */}
      <span className="sr-only">Awin</span>
    </footer>
  );
}
