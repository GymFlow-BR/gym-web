type SkipLinkProps = {
  targetId?: string
}

/**
 * Link "pular para o conteúdo" para usuários de teclado/leitor de tela.
 * Fica fora da tela até receber foco (primeiro Tab da página), quando
 * desliza para dentro da viewport. O posicionamento/reveal vem da classe
 * `.skip-link` em index.css; o Tailwind cuida apenas da aparência.
 */
export function SkipLink({ targetId = 'main-content' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link rounded-lg bg-[#0F3D31] px-4 py-2 text-sm font-semibold text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-[#1BA65A]/40"
    >
      Pular para o conteúdo
    </a>
  )
}
