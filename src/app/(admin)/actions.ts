"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, requireAdmin } from "@/lib/auth";
import {
  closeRaceList,
  createRaceList,
  ListServiceError,
  reopenRaceList,
} from "@/lib/list-service";
import { createListSchema } from "@/lib/validators";

function readFormValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

export async function createListAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsedInput = createListSchema.safeParse({
    closeDate: readFormValue(formData, "closeDate"),
    description: readFormValue(formData, "description"),
    title: readFormValue(formData, "title"),
    type: readFormValue(formData, "type"),
  });

  if (!parsedInput.success) {
    redirect("/dashboard?error=invalid-list");
  }

  try {
    await createRaceList(parsedInput.data, admin.id);
  } catch (error) {
    if (error instanceof ListServiceError && error.code === "INVALID_CLOSE_DATE") {
      redirect("/dashboard?error=invalid-close-date");
    }

    throw error;
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?success=list-created");
}

export async function updateListStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const closeDate = readFormValue(formData, "closeDate");
  const listId = readFormValue(formData, "listId");
  const intent = readFormValue(formData, "intent");

  if (!listId) {
    redirect("/dashboard?error=list-not-found");
  }

  try {
    if (intent === "close") {
      await closeRaceList(listId, admin.id);
      revalidatePath("/dashboard");
      revalidatePath(`/lists/${listId}`);
      redirect(`/lists/${listId}?success=list-closed`);
    }

    if (intent === "reopen") {
      await reopenRaceList(listId, admin.id, closeDate);
      revalidatePath("/dashboard");
      revalidatePath(`/lists/${listId}`);
      redirect(`/lists/${listId}?success=list-reopened`);
    }
  } catch (error) {
    if (error instanceof ListServiceError) {
      if (error.code === "INVALID_CLOSE_DATE") {
        redirect(`/lists/${listId}?error=invalid-close-date`);
      }

      if (error.code === "NOT_FOUND") {
        redirect("/dashboard?error=list-not-found");
      }

      if (error.code === "REOPEN_NOT_ALLOWED") {
        redirect(`/lists/${listId}?error=reopen-not-allowed`);
      }
    }

    throw error;
  }

  redirect(`/lists/${listId}?error=invalid-status`);
}