"use server";

import { redirect } from "next/navigation";

import { authenticateAdmin, createAdminSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

function readFormValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export async function loginAction(formData: FormData) {
  const parsedInput = loginSchema.safeParse({
    email: readFormValue(formData, "email"),
    password: readFormValue(formData, "password"),
  });

  if (!parsedInput.success) {
    redirect("/login?error=invalid-form");
  }

  const admin = await authenticateAdmin(parsedInput.data.email, parsedInput.data.password);

  if (!admin) {
    redirect("/login?error=invalid-credentials");
  }

  await createAdminSession({
    email: admin.email,
    name: admin.name,
    userId: admin.id,
  });

  redirect("/dashboard");
}