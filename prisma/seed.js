const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@checkin.local";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("[seed] Admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
      language: "en"
    }
  });

  console.log("[seed] Admin created:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
