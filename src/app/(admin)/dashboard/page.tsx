import Link from "next/link";

import { createListAction } from "@/app/(admin)/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/dates";
import { getDashboardLists, isEffectivelyClosed } from "@/lib/list-service";
import { getSearchParamValue } from "@/lib/search-params";
import { getPublicListUrl } from "@/lib/urls";

import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";

const fieldClassName =
  "h-11 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-black/32 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]/60";

const textareaClassName =
  "min-h-28 w-full rounded-3xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-black/32 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]/60";

const successMessages: Record<string, string> = {
  "list-created": "Lista criada com sucesso e pronta para compartilhamento.",
};

const errorMessages: Record<string, string> = {
  "invalid-close-date": "Informe uma data de encerramento futura para a lista de uniforme.",
  "invalid-list": "Revise os campos da lista antes de salvar.",
  "list-not-found": "A lista solicitada não foi encontrada.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const [params, lists] = await Promise.all([
    searchParams,
    getDashboardLists(admin.id),
  ]);

  const successMessage = successMessages[getSearchParamValue(params.success) ?? ""];
  const errorMessage = errorMessages[getSearchParamValue(params.error) ?? ""];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-black/8 bg-[var(--color-ink)] px-6 py-6 text-white shadow-[0_24px_80px_rgba(20,31,24,0.18)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              Operação central
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Crie listas em minutos e compartilhe um link público sem ruído.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
              O MVP já cobre presença, pedidos de uniforme, bloqueio de duplicidade por telefone
              e visualização do status sem depender de planilhas ou mensagens perdidas.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/12 bg-white/10 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/55">Listas</div>
              <div className="mt-2 text-3xl font-semibold text-white">{lists.length}</div>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/10 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/55">Administrador</div>
              <div className="mt-2 text-base font-semibold text-white">{admin.name}</div>
            </div>
          </div>
        </div>
      </section>

      {successMessage ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[28px] border border-black/8 bg-white/78 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
              Nova lista
            </p>
            <h3 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
              Abrir um novo fluxo
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/60">
              Título, descrição e tipo definem o formulário público. Para uniforme, a data de
              encerramento é obrigatória.
            </p>
          </div>

          <form action={createListAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black/70" htmlFor="title">
                Título
              </label>
              <input
                className={fieldClassName}
                id="title"
                name="title"
                placeholder="Ex.: Corrida da Praia 10K"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black/70" htmlFor="description">
                Descrição
              </label>
              <textarea
                className={textareaClassName}
                id="description"
                name="description"
                placeholder="Contexto da prova, observações e o que o atleta precisa informar."
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70" htmlFor="type">
                  Tipo da lista
                </label>
                <select className={fieldClassName} defaultValue="PRESENCE" id="type" name="type">
                  <option value="PRESENCE">Confirmação de presença</option>
                  <option value="UNIFORM">Lista de uniforme</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70" htmlFor="closeDate">
                  Data de encerramento
                </label>
                <input className={fieldClassName} id="closeDate" name="closeDate" type="date" />
              </div>
            </div>

            <p className="text-xs leading-6 text-black/45">
              A data é usada apenas nas listas de uniforme. Para confirmação de presença, o
              encerramento é manual.
            </p>

            <SubmitButton className="w-full" pendingLabel="Criando lista...">
              Criar lista
            </SubmitButton>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
                Suas listas
              </p>
              <h3 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
                Panorama atual
              </h3>
            </div>
          </div>

          {lists.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-black/12 bg-white/55 px-6 py-10 text-center text-sm text-black/55">
              Nenhuma lista criada ainda. Use o formulário ao lado para abrir a primeira lista do
              time.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {lists.map((list) => {
                const closed = isEffectivelyClosed(list);
                const totalEntries =
                  list.type === "PRESENCE"
                    ? list._count.presenceEntries
                    : list._count.uniformOrders;

                return (
                  <article
                    className="rounded-[28px] border border-black/8 bg-white/78 p-5 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur"
                    key={list.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/38">
                          {list.type === "PRESENCE" ? "Presença" : "Uniforme"}
                        </p>
                        <h4 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
                          {list.title}
                        </h4>
                      </div>

                      <StatusBadge closed={closed} />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-black/58">{list.description}</p>

                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-2xl border border-black/6 bg-[var(--color-shell)]/70 px-4 py-3">
                        <dt className="text-black/45">Criada em</dt>
                        <dd className="mt-1 font-medium text-[var(--color-ink)]">
                          {formatDateTime(list.createdAt)}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-black/6 bg-[var(--color-shell)]/70 px-4 py-3">
                        <dt className="text-black/45">Registros</dt>
                        <dd className="mt-1 font-medium text-[var(--color-ink)]">{totalEntries}</dd>
                      </div>
                      <div className="rounded-2xl border border-black/6 bg-[var(--color-shell)]/70 px-4 py-3">
                        <dt className="text-black/45">Encerramento</dt>
                        <dd className="mt-1 font-medium text-[var(--color-ink)]">
                          {list.type === "UNIFORM" ? formatDate(list.closeAt) : "Manual"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-black/6 bg-[var(--color-shell)]/70 px-4 py-3">
                        <dt className="text-black/45">Link público</dt>
                        <dd className="mt-1 truncate font-medium text-[var(--color-ink)]">
                          <a
                            className="underline decoration-black/15 underline-offset-4 transition hover:decoration-black/45"
                            href={getPublicListUrl(list.publicToken)}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Abrir lista
                          </a>
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:opacity-92"
                        href={`/lists/${list.id}`}
                      >
                        Ver detalhes
                      </Link>
                      <a
                        className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold text-[var(--color-ink)] transition hover:border-black/25 hover:bg-black/4"
                        href={getPublicListUrl(list.publicToken)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Abrir página pública
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}