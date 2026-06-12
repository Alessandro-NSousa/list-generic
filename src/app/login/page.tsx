import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/login/actions";
import { getCurrentAdmin } from "@/lib/auth";
import { getSearchParamValue } from "@/lib/search-params";

import { SubmitButton } from "@/components/submit-button";

const fieldClassName =
  "h-11 w-full rounded-2xl border border-black/10 bg-white/92 px-4 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-black/32 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]/60";

const errorMessages: Record<string, string> = {
  "invalid-credentials": "E-mail ou senha inválidos.",
  "invalid-form": "Preencha e-mail e senha corretamente para continuar.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [admin, resolvedSearchParams] = await Promise.all([getCurrentAdmin(), searchParams]);

  if (admin) {
    redirect("/dashboard");
  }

  const errorMessage = errorMessages[getSearchParamValue(resolvedSearchParams.error) ?? ""];

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-black/8 bg-white/80 shadow-[0_28px_90px_rgba(20,31,24,0.12)] backdrop-blur lg:grid-cols-[1.15fr_0.85fr]">
        <section className="bg-[var(--color-ink)] px-6 py-8 text-white sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/58">
            Quarteto List
          </p>
          <h1 className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
            Listas de corrida simples de preencher e fáceis de operar.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
            Crie listas públicas para confirmar presença ou centralizar pedidos de uniforme, com
            bloqueio automático de duplicidade por telefone e exportação pronta para o staff.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/8 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/48">Fluxo 1</div>
              <div className="mt-2 text-lg font-semibold">Presença</div>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Nome + telefone com impedimento de duplicidade por lista.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/48">Fluxo 2</div>
              <div className="mt-2 text-lg font-semibold">Uniforme</div>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Tipo, tamanho e observação com encerramento por data.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-black/40">
              Acesso administrativo
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">Entrar no painel</h2>
            <p className="mt-3 text-sm leading-6 text-black/58">
              Use o administrador inicial criado pelo seed para publicar listas e acompanhar os
              registros em tempo real.
            </p>

            {errorMessage ? (
              <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                {errorMessage}
              </div>
            ) : null}

            <form action={loginAction} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70" htmlFor="email">
                  E-mail
                </label>
                <input className={fieldClassName} id="email" name="email" required type="email" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70" htmlFor="password">
                  Senha
                </label>
                <input
                  className={fieldClassName}
                  id="password"
                  name="password"
                  required
                  type="password"
                />
              </div>

              <SubmitButton className="w-full" pendingLabel="Entrando...">
                Acessar dashboard
              </SubmitButton>
            </form>

            <div className="mt-6 rounded-3xl border border-black/8 bg-[var(--color-shell)]/70 px-5 py-4 text-sm leading-6 text-black/58">
              O link público das listas não exige autenticação. Apenas o painel administrativo fica
              protegido.
            </div>

            <Link className="mt-6 inline-flex text-sm font-semibold text-[var(--color-ink)] underline decoration-black/16 underline-offset-4 transition hover:decoration-black/40" href="/">
              Voltar para a visão geral
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}