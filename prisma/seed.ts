import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME ?? "Administrador";
  const email = (process.env.ADMIN_EMAIL ?? "admin@quartetolist.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123456";

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
    },
    update: {
      name,
      passwordHash,
    },
  });

  console.log(`Administrador pronto: ${email}`);

  if (!process.env.ADMIN_PASSWORD) {
    console.log("Senha padr\u00e3o de desenvolvimento: admin123456");
  }
}

main()
  .catch((error) => {
    console.error("Falha ao criar administrador inicial.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });