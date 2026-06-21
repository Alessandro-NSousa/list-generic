import { z } from "zod";

import { isValidPhone } from "@/lib/phone";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail v\u00e1lido.").transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha informada \u00e9 inv\u00e1lida."),
});

export const listTypeSchema = z.enum(["PRESENCE", "UNIFORM"]);

export const createListSchema = z
  .object({
    title: z.string().trim().min(3, "Informe um t\u00edtulo com ao menos 3 caracteres.").max(80),
    description: z
      .string()
      .trim()
      .min(5, "Informe uma descri\u00e7\u00e3o com ao menos 5 caracteres.")
      .max(300),
    type: listTypeSchema,
    closeDate: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined),
  })
  .superRefine((value, ctx) => {
    if (value.type === "UNIFORM" && !value.closeDate) {
      ctx.addIssue({
        code: "custom",
        path: ["closeDate"],
        message: "Informe a data de encerramento da lista de uniforme.",
      });
    }
  });

export const updateListSchema = z
  .object({
    title: z.string().trim().min(3, "Informe um título com ao menos 3 caracteres.").max(80),
    description: z
      .string()
      .trim()
      .min(5, "Informe uma descrição com ao menos 5 caracteres.")
      .max(300),
    closeDate: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined),
    type: listTypeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.type === "UNIFORM" && !value.closeDate) {
      ctx.addIssue({
        code: "custom",
        path: ["closeDate"],
        message: "Informe a data de encerramento da lista de uniforme.",
      });
    }
  });

const participantName = z
  .string()
  .trim()
  .min(3, "Informe um nome com ao menos 3 caracteres.")
  .max(100, "Informe um nome com at\u00e9 100 caracteres.");

const participantPhone = z
  .string()
  .trim()
  .refine((value) => isValidPhone(value), "Informe um telefone v\u00e1lido.");

export const presenceEntrySchema = z.object({
  name: participantName,
  phone: participantPhone,
});

export const uniformOrderSchema = z.object({
  name: participantName,
  phone: participantPhone,
  itemType: z
    .string()
    .trim()
    .min(2, "Informe o tipo do uniforme.")
    .max(60, "Informe um tipo com at\u00e9 60 caracteres."),
  size: z.enum(["P", "M", "G"], {
    message: "Selecione um tamanho v\u00e1lido.",
  }),
  note: z
    .string()
    .trim()
    .max(300, "A observa\u00e7\u00e3o deve ter at\u00e9 300 caracteres.")
    .optional()
    .transform((value) => value || undefined),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type PresenceEntryInput = z.infer<typeof presenceEntrySchema>;
export type UniformOrderInput = z.infer<typeof uniformOrderSchema>;