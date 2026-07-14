import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data so re-running doesn't create duplicates
  await prisma.locationService.deleteMany();
  await prisma.hours.deleteMany();
  await prisma.eligibility.deleteMany();
  await prisma.location.deleteMany();
  await prisma.service.deleteMany();

  // Services
  const pantry = await prisma.service.create({ data: { name: "Food pantry" } });
  const meals = await prisma.service.create({ data: { name: "Hot meals" } });
  const snap = await prisma.service.create({ data: { name: "SNAP enrollment" } });

  // Location 1: pantry + meals, open Mon-Fri, no requirements
  const downtown = await prisma.location.create({
    data: {
      name: "Downtown Food Pantry",
      address: "123 Main St",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      phone: "214-555-0101",
    },
  });
  await prisma.locationService.create({ data: { locationId: downtown.id, serviceId: pantry.id } });
  await prisma.locationService.create({ data: { locationId: downtown.id, serviceId: meals.id } });
  for (let day = 1; day <= 5; day++) {
    await prisma.hours.create({
      data: { locationId: downtown.id, dayOfWeek: day, openTime: "09:00", closeTime: "17:00" },
    });
  }
  await prisma.eligibility.create({ data: { locationId: downtown.id, requirement: "None" } });

  // Location 2: meals only, weekends, requires proof of address
  const eastside = await prisma.location.create({
    data: {
      name: "Eastside Community Kitchen",
      address: "456 Oak Ave",
      city: "Dallas",
      state: "TX",
      zip: "75223",
    },
  });
  await prisma.locationService.create({ data: { locationId: eastside.id, serviceId: meals.id } });
  await prisma.hours.create({
    data: { locationId: eastside.id, dayOfWeek: 6, openTime: "11:00", closeTime: "14:00" },
  });
  await prisma.hours.create({
    data: { locationId: eastside.id, dayOfWeek: 0, openTime: "11:00", closeTime: "14:00" },
  });
  await prisma.eligibility.create({
    data: { locationId: eastside.id, requirement: "Proof of address" },
  });

  // Location 3: SNAP enrollment, weekdays, different city
  const northside = await prisma.location.create({
    data: {
      name: "Northside Resource Center",
      address: "789 Elm Rd",
      city: "Carrollton",
      state: "TX",
      zip: "75006",
      website: "https://example.org",
    },
  });
  await prisma.locationService.create({ data: { locationId: northside.id, serviceId: snap.id } });
  await prisma.locationService.create({ data: { locationId: northside.id, serviceId: pantry.id } });
  for (let day = 1; day <= 4; day++) {
    await prisma.hours.create({
      data: { locationId: northside.id, dayOfWeek: day, openTime: "08:00", closeTime: "20:00" },
    });
  }
  await prisma.eligibility.create({ data: { locationId: northside.id, requirement: "None" } });

  const count = await prisma.location.count();
  console.log(`Seeded ${count} locations`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });