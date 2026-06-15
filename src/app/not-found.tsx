import Link from "next/link";

import { AppLogo } from "@/components/app-logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-[32px] border border-black/8 bg-white/80 px-8 py-10 text-center shadow-[0_24px_80px_rgba(20,31,24,0.08)] backdrop-blur">
        <AppLogo className="mx-auto w-fit" width={220} />
        <h1 className="mt-4 font-display text-4xl text-[var(--color-ink)]">Página não encontrada</h1>
        <p className="mt-4 text-sm leading-7 text-black/58 sm:text-base">
          O link acessado não corresponde a uma lista existente ou você não tem permissão para
          visualizar este conteúdo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:opacity-92"
            href="/"
          >
            Ir para o início
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold text-[var(--color-ink)] transition hover:border-black/25 hover:bg-black/4"
            href="/login"
          >
            Acessar login
          </Link>
        </div>
      </div>
    </main>
  );
}