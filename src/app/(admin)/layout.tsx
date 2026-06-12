import Link from "next/link";

import { logoutAction } from "@/app/(admin)/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col rounded-[32px] border border-black/8 bg-white/70 shadow-[0_30px_90px_rgba(20,31,24,0.12)] backdrop-blur">
        <header className="border-b border-black/8 px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">
                Quarteto List
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl text-[var(--color-ink)]">
                  Painel administrativo
                </h1>
                <Link
                  className="rounded-full border border-black/10 px-3 py-1 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-black/10 bg-white/85 px-4 py-2 text-sm text-black/72">
                <div className="font-semibold text-[var(--color-ink)]">{admin.name}</div>
                <div>{admin.email}</div>
              </div>

              <form action={logoutAction}>
                <button
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold text-[var(--color-ink)] transition hover:border-black/25 hover:bg-black/4"
                  type="submit"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}