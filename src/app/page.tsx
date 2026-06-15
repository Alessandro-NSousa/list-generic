import Link from "next/link";

import { AppLogo } from "@/components/app-logo";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
      <section className="grid overflow-hidden rounded-[36px] border border-black/8 bg-white/80 shadow-[0_28px_90px_rgba(20,31,24,0.12)] backdrop-blur lg:grid-cols-[1.12fr_0.88fr]">
        <div className="bg-[var(--color-ink)] px-6 py-10 text-white sm:px-10 sm:py-12">
          <AppLogo className="w-fit" priority width={260} />
          <h1 className="mt-6 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">
            Listas públicas para equipes de corrida, sem caos de WhatsApp.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
            O administrador cria a lista, compartilha um link e acompanha presença ou pedidos de
            uniforme com duplicidade bloqueada, status de abertura e exportação pronta para o staff.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-sm font-semibold text-white transition hover:opacity-92"
              href="/login"
            >
              Entrar no painel
            </Link>
            <a
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-semibold text-white transition hover:bg-white/8"
              href="#visao-geral"
            >
              Ver como funciona
            </a>
          </div>
        </div>

        <div className="grid gap-4 bg-[var(--color-shell)]/66 px-6 py-10 sm:px-10 sm:py-12">
          <div className="rounded-[28px] border border-black/8 bg-white/85 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)]">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40">
              Fluxo administrativo
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
              Criar, fechar e exportar
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/58">
              Dashboard único para abrir listas, acompanhar registros, encerrar manualmente e gerar
              PDF por tipo.
            </p>
          </div>
          <div className="rounded-[28px] border border-black/8 bg-white/85 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)]">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40">
              Fluxo público
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
              Link simples e direto
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/58">
              O atleta só abre o link, informa os dados exigidos e recebe feedback imediato, sem
              precisar de login.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" id="visao-geral">
        <article className="rounded-[28px] border border-black/8 bg-white/78 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40">RF006</p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">Presença</h3>
          <p className="mt-3 text-sm leading-7 text-black/58">
            Formulário enxuto com nome e telefone, pronto para confirmar quem vai à corrida.
          </p>
        </article>
        <article className="rounded-[28px] border border-black/8 bg-white/78 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40">RF009</p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">Uniforme</h3>
          <p className="mt-3 text-sm leading-7 text-black/58">
            Pedido com tipo livre, tamanho e observação opcional, além de encerramento por data.
          </p>
        </article>
        <article className="rounded-[28px] border border-black/8 bg-white/78 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40">RF012</p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">PDF</h3>
          <p className="mt-3 text-sm leading-7 text-black/58">
            Exportação separada por tipo de lista para compartilhar com organização, costura ou staff.
          </p>
        </article>
      </section>
    </main>
  );
}
