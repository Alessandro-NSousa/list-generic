import { renderToBuffer } from "@react-pdf/renderer";

import { getCurrentAdmin } from "@/lib/auth";
import { getRaceListForAdmin, ListServiceError } from "@/lib/list-service";
import { RaceListPdf } from "@/lib/pdf";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return new Response("Não autenticado.", { status: 401 });
  }

  const { id } = await context.params;

  try {
    const list = await getRaceListForAdmin(id, admin.id);
    const pdfBuffer = await renderToBuffer(
      RaceListPdf({
        generatedAt: new Date(),
        list,
      }),
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Disposition": `attachment; filename="${slugify(list.title) || "lista"}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    if (error instanceof ListServiceError && error.code === "NOT_FOUND") {
      return new Response("Lista não encontrada.", { status: 404 });
    }

    throw error;
  }
}