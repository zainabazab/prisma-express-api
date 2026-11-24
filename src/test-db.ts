import { prisma } from "./config/prisma";

async function main() {
  try {
    await prisma.$connect();

    console.log("✅ Successfully connected to PostgreSQL!");

    const users = await prisma.user.findMany();

    console.log("Users in database:", users.length);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();