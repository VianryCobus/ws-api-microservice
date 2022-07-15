import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

async function main() {
  const currency = await prisma.currency.upsert({
    where: {
      code: "MMK",
    },
    update: {},
    create: {
      code: "MMK",
      name: "Myanmar Kyat",
      agents: {
        create: {
          agentId: 'UATAAMKH',
          apiKey: '9feEu0k7wrqTucrOE7Uh',
        }
      }
    }
  });
  console.log({
    currency
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })