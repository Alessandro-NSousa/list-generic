import Link from "next/link";
import { notFound } from "next/navigation";

import { submitPresenceAction, submitUniformAction } from "@/app/l/[token]/actions";
import { formatDate, formatDateTime } from "@/lib/dates";
import {
  getPublicRaceListByToken,
  isEffectivelyClosed,
  ListServiceError,
} from "@/lib/list-service";
import { getSearchParamValue } from "@/lib/search-params";

import { AppLogo } from "@/components/app-logo";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";

const fieldClassName =
  "h-11 w-full rounded-2xl border border-black/10 bg-white/92 px-4 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-black/32 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]/60";

const textareaClassName =
  "min-h-28 w-full rounded-3xl border border-black/10 bg-white/92 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-black/32 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]/60";

const successMessages: Record<string, string> = {
  "presence-saved": "Presença confirmada com sucesso.",
  "uniform-saved": "Pedido registrado com sucesso.",
};

const errorMessages: Record<string, string> = {
  "duplicate-presence": "Já existe uma confirmação cadastrada para este telefone.",
  "duplicate-uniform": "Já existe um pedido cadastrado para este telefone.",
  "invalid-form": "Revise os campos obrigatórios antes de enviar.",
  "list-closed": "Esta lista não está mais disponível para preenchimento.",
  "list-not-found": "O link informado não corresponde a uma lista ativa.",
};

export default async function PublicListPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ token }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  let list;

  try {
    list = await getPublicRaceListByToken(token);
  } catch (error) {
    if (error instanceof ListServiceError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  }

  const closed = isEffectivelyClosed(list);
  const successMessage = successMessages[getSearchParamValue(resolvedSearchParams.success) ?? ""];
  const errorMessage = errorMessages[getSearchParamValue(resolvedSearchParams.error) ?? ""];
  const totalEntries =
    list.type === "PRESENCE" ? list.presenceEntries.length : list.uniformOrders.length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/8 bg-white/76 p-5 shadow-[0_24px_80px_rgba(20,31,24,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <AppLogo className="w-fit" width={180} />
              <StatusBadge closed={closed} />
            </div>

            <h1 className="mt-3 font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-5xl">
              {list.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">
              {list.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px] xl:grid-cols-1">
            <div className="rounded-3xl border border-black/8 bg-[var(--color-shell)]/75 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.24em] text-black/40">Tipo</div>
              <div className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                {list.type === "PRESENCE" ? "Confirmação de presença" : "Lista de uniforme"}
              </div>
            </div>
            <div className="rounded-3xl border border-black/8 bg-[var(--color-shell)]/75 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.24em] text-black/40">Registros</div>
              <div className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{totalEntries}</div>
            </div>
            {list.type === "UNIFORM" ? (
              <div className="rounded-3xl border border-black/8 bg-[var(--color-shell)]/75 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-black/40">
                  Encerramento
                </div>
                <div className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                  {formatDate(list.closeAt)}
                </div>
              </div>
            ) : null}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="rounded-[32px] border border-black/8 bg-white/80 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
            {closed ? "Consulta" : "Preenchimento"}
          </p>
          <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
            {closed ? "Lista encerrada" : "Enviar informações"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/60">
            {closed
              ? "Esta lista não está mais disponível para preenchimento, mas continua acessível para consulta."
              : list.type === "PRESENCE"
                ? "Informe seu nome e telefone para confirmar presença na equipe."
                : "Informe seus dados e o item desejado para registrar o pedido do uniforme."}
          </p>

          {!closed ? (
            list.type === "PRESENCE" ? (
              <form action={submitPresenceAction} className="mt-6 space-y-4">
                <input name="token" type="hidden" value={token} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="name">
                    Nome
                  </label>
                  <input className={fieldClassName} id="name" name="name" required type="text" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="phone">
                    Telefone
                  </label>
                  <input
                    className={fieldClassName}
                    id="phone"
                    name="phone"
                    placeholder="(11) 99999-9999"
                    required
                    type="tel"
                  />
                </div>

                <SubmitButton className="w-full" pendingLabel="Confirmando...">
                  Confirmar presença
                </SubmitButton>
              </form>
            ) : (
              <form action={submitUniformAction} className="mt-6 space-y-4">
                <input name="token" type="hidden" value={token} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="name">
                    Nome
                  </label>
                  <input className={fieldClassName} id="name" name="name" required type="text" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="phone">
                    Telefone
                  </label>
                  <input
                    className={fieldClassName}
                    id="phone"
                    name="phone"
                    placeholder="(11) 99999-9999"
                    required
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="itemType">
                    Tipo
                  </label>
                  <input
                    className={fieldClassName}
                    id="itemType"
                    name="itemType"
                    placeholder="Ex.: Camiseta, Regata, Jaqueta"
                    required
                    type="text"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="size">
                    Tamanho
                  </label>
                  <select className={fieldClassName} defaultValue="M" id="size" name="size">
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="note">
                    Observação
                  </label>
                  <textarea
                    className={textareaClassName}
                    id="note"
                    name="note"
                    placeholder="Ex.: Feminina, Baby Look, Gola V"
                  />
                </div>

                <SubmitButton className="w-full" pendingLabel="Enviando pedido...">
                  Registrar pedido
                </SubmitButton>
              </form>
            )
          ) : null}
        </section>

        <section className="rounded-[32px] border border-black/8 bg-white/80 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
                Consulta pública
              </p>
              <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
                {list.type === "PRESENCE" ? "Participantes confirmados" : "Pedidos registrados"}
              </h2>
            </div>

            <Link className="text-sm font-medium text-black/55 transition hover:text-black" href="/login">
              Área admin
            </Link>
          </div>

          {list.type === "PRESENCE" ? (
            list.presenceEntries.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-black/12 bg-[var(--color-shell)]/60 px-6 py-10 text-center text-sm text-black/52">
                Ninguém confirmou presença ainda.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white/92 text-left text-sm">
                    <thead className="bg-[var(--color-shell)] text-black/55">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Nome</th>
                        <th className="px-5 py-4 font-semibold">Telefone</th>
                        <th className="px-5 py-4 font-semibold">Registrado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.presenceEntries.map((entry) => (
                        <tr className="border-t border-black/6" key={entry.id}>
                          <td className="px-5 py-4 text-[var(--color-ink)]">{entry.name}</td>
                          <td className="px-5 py-4 text-black/60">{entry.phone}</td>
                          <td className="px-5 py-4 text-black/60">{formatDateTime(entry.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : list.uniformOrders.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-black/12 bg-[var(--color-shell)]/60 px-6 py-10 text-center text-sm text-black/52">
              Nenhum pedido registrado ainda.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/92 text-left text-sm">
                  <thead className="bg-[var(--color-shell)] text-black/55">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Nome</th>
                      <th className="px-5 py-4 font-semibold">Telefone</th>
                      <th className="px-5 py-4 font-semibold">Tipo</th>
                      <th className="px-5 py-4 font-semibold">Tamanho</th>
                      <th className="px-5 py-4 font-semibold">Observação</th>
                      <th className="px-5 py-4 font-semibold">Registrado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.uniformOrders.map((order) => (
                      <tr className="border-t border-black/6" key={order.id}>
                        <td className="px-5 py-4 text-[var(--color-ink)]">{order.name}</td>
                        <td className="px-5 py-4 text-black/60">{order.phone}</td>
                        <td className="px-5 py-4 text-black/60">{order.itemType}</td>
                        <td className="px-5 py-4 text-black/60">{order.size}</td>
                        <td className="px-5 py-4 text-black/60">{order.note ?? "-"}</td>
                        <td className="px-5 py-4 text-black/60">{formatDateTime(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}