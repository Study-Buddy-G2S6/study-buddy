const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.session.deleteMany({});
  console.log(`Deleted ${deleted.count} sessions`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
