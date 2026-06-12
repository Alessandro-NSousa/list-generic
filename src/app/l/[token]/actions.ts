"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createPresenceEntry,
  createUniformOrder,
  ListServiceError,
} from "@/lib/list-service";
import { presenceEntrySchema, uniformOrderSchema } from "@/lib/validators";

function readFormValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function redirectToPublicList(token: string, params: Record<string, string>): never {
  const search = new URLSearchParams(params);
  redirect(`/l/${token}?${search.toString()}`);
}

export async function submitPresenceAction(formData: FormData) {
  const token = readFormValue(formData, "token");

  if (!token) {
    redirect("/");
  }

  const parsedInput = presenceEntrySchema.safeParse({
    name: readFormValue(formData, "name"),
    phone: readFormValue(formData, "phone"),
  });

  if (!parsedInput.success) {
    redirectToPublicList(token, { error: "invalid-form" });
  }

  try {
    await createPresenceEntry(token, parsedInput.data);
  } catch (error) {
    if (error instanceof ListServiceError) {
      if (error.code === "DUPLICATE_PHONE") {
        redirectToPublicList(token, { error: "duplicate-presence" });
      }

      if (error.code === "LIST_CLOSED") {
        redirectToPublicList(token, { error: "list-closed" });
      }

      if (error.code === "NOT_FOUND") {
        redirectToPublicList(token, { error: "list-not-found" });
      }
    }

    throw error;
  }

  revalidatePath(`/l/${token}`);
  redirectToPublicList(token, { success: "presence-saved" });
}

export async function submitUniformAction(formData: FormData) {
  const token = readFormValue(formData, "token");

  if (!token) {
    redirect("/");
  }

  const parsedInput = uniformOrderSchema.safeParse({
    itemType: readFormValue(formData, "itemType"),
    name: readFormValue(formData, "name"),
    note: readFormValue(formData, "note"),
    phone: readFormValue(formData, "phone"),
    size: readFormValue(formData, "size"),
  });

  if (!parsedInput.success) {
    redirectToPublicList(token, { error: "invalid-form" });
  }

  try {
    await createUniformOrder(token, parsedInput.data);
  } catch (error) {
    if (error instanceof ListServiceError) {
      if (error.code === "DUPLICATE_PHONE") {
        redirectToPublicList(token, { error: "duplicate-uniform" });
      }

      if (error.code === "LIST_CLOSED") {
        redirectToPublicList(token, { error: "list-closed" });
      }

      if (error.code === "NOT_FOUND") {
        redirectToPublicList(token, { error: "list-not-found" });
      }
    }

    throw error;
  }

  revalidatePath(`/l/${token}`);
  redirectToPublicList(token, { success: "uniform-saved" });
}