import Link from "next/link";
import { notFound } from "next/navigation";

import { updateListStatusAction } from "@/app/(admin)/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatDateTime, isExpired } from "@/lib/dates";
import {
  getRaceListForAdmin,
  isEffectivelyClosed,
  ListServiceError,
} from "@/lib/list-service";
import { getSearchParamValue } from "@/lib/search-params";
import { getPublicListUrl } from "@/lib/urls";

import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";

const fieldClassName =
  "h-11 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-black/32 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]/60";

const successMessages: Record<string, string> = {
  "list-closed": "A lista foi encerrada manualmente.",
  "list-reopened": "A lista foi reaberta com sucesso.",
};

const errorMessages: Record<string, string> = {
  "invalid-close-date": "Informe uma nova data futura para reabrir a lista de uniforme.",
  "invalid-status": "A ação solicitada é inválida para esta lista.",
  "reopen-not-allowed": "Apenas listas de uniforme podem ser reabertas.",
};

export default async function ListDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  let list;

  try {
    list = await getRaceListForAdmin(id, admin.id);
  } catch (error) {
    if (error instanceof ListServiceError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  }

  const closed = isEffectivelyClosed(list);
  const successMessage = successMessages[getSearchParamValue(resolvedSearchParams.success) ?? ""];
  const errorMessage = errorMessages[getSearchParamValue(resolvedSearchParams.error) ?? ""];
  const publicUrl = getPublicListUrl(list.publicToken);
  const requiresNewCloseDate = list.type === "UNIFORM" && isExpired(list.closeAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-black/55">
        <Link className="transition hover:text-black" href="/dashboard">
          Dashboard
        </Link>
        <span>/</span>
        <span>{list.title}</span>
      </div>

      <section className="rounded-[28px] border border-black/8 bg-white/80 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/38">
                {list.type === "PRESENCE" ? "Confirmação de presença" : "Lista de uniforme"}
              </p>
              <StatusBadge closed={closed} />
            </div>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {list.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">
              {list.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold text-[var(--color-ink)] transition hover:border-black/25 hover:bg-black/4"
              href={publicUrl}
              rel="noreferrer"
              target="_blank"
            >
              Abrir link público
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:opacity-92"
              href={`/api/lists/${list.id}/export`}
            >
              Exportar PDF
            </a>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-black/8 bg-[var(--color-shell)]/70 px-5 py-4">
            <dt className="text-sm text-black/45">Criada em</dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
              {formatDateTime(list.createdAt)}
            </dd>
          </div>
          <div className="rounded-3xl border border-black/8 bg-[var(--color-shell)]/70 px-5 py-4">
            <dt className="text-sm text-black/45">Encerramento</dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
              {list.type === "UNIFORM" ? formatDate(list.closeAt) : "Manual"}
            </dd>
          </div>
          <div className="rounded-3xl border border-black/8 bg-[var(--color-shell)]/70 px-5 py-4">
            <dt className="text-sm text-black/45">Registros</dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
              {list.type === "PRESENCE"
                ? list._count.presenceEntries
                : list._count.uniformOrders}
            </dd>
          </div>
          <div className="rounded-3xl border border-black/8 bg-[var(--color-shell)]/70 px-5 py-4">
            <dt className="text-sm text-black/45">URL pública</dt>
            <dd className="mt-2 truncate text-sm font-semibold text-[var(--color-ink)]">
              <a
                className="underline decoration-black/15 underline-offset-4 transition hover:decoration-black/45"
                href={publicUrl}
                rel="noreferrer"
                target="_blank"
              >
                {publicUrl}
              </a>
            </dd>
          </div>
        </dl>

        {successMessage ? (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-black/8 bg-white/75 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/38">
              Controle da lista
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
              Ações rápidas
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/58">
              Feche a lista manualmente quando o ciclo terminar. Em listas de uniforme já expiradas,
              informe uma nova data para reabrir os pedidos.
            </p>
          </div>

          {closed ? (
            list.type === "UNIFORM" ? (
              <form action={updateListStatusAction} className="grid w-full gap-3 sm:max-w-md sm:grid-cols-[1fr_auto]">
                <input name="listId" type="hidden" value={list.id} />
                <input name="intent" type="hidden" value="reopen" />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70" htmlFor="closeDate">
                    Nova data de encerramento
                  </label>
                  <input
                    className={fieldClassName}
                    defaultValue={requiresNewCloseDate ? "" : undefined}
                    id="closeDate"
                    name="closeDate"
                    required={requiresNewCloseDate}
                    type="date"
                  />
                </div>
                <div className="flex items-end">
                  <SubmitButton className="w-full" pendingLabel="Reabrindo...">
                    Reabrir lista
                  </SubmitButton>
                </div>
              </form>
            ) : null
          ) : (
            <form action={updateListStatusAction}>
              <input name="listId" type="hidden" value={list.id} />
              <input name="intent" type="hidden" value="close" />
              <SubmitButton pendingLabel="Encerrando...">Encerrar lista</SubmitButton>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-black/8 bg-white/80 p-6 shadow-[0_18px_40px_rgba(20,31,24,0.06)] backdrop-blur sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/38">
              Registros
            </p>
            <h3 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
              {list.type === "PRESENCE" ? "Participantes confirmados" : "Pedidos de uniforme"}
            </h3>
          </div>
        </div>

        {list.type === "PRESENCE" ? (
          list.presenceEntries.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-black/12 bg-[var(--color-shell)]/60 px-6 py-10 text-center text-sm text-black/52">
              Nenhuma confirmação registrada ainda.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/90 text-left text-sm">
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
              <table className="min-w-full bg-white/90 text-left text-sm">
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
  );
}