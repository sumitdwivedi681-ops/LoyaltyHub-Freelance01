import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create a Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@loyaltyhub.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@loyaltyhub.com',
      password: passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Created Super Admin: ${admin.email}`);

  // 2. Create a Merchant
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@store.com' },
    update: {},
    create: {
      name: 'John Merchant',
      email: 'merchant@store.com',
      password: passwordHash,
      role: 'MERCHANT',
      merchant: {
        create: {
          storeName: 'Coffee & Co.',
          description: 'Best coffee in town',
          address: '123 Main St',
          city: 'Metropolis',
          pointsPerRupee: 1.0,
        },
      },
    },
  });
  console.log(`Created Merchant: ${merchantUser.email} (Store: Coffee & Co.)`);

  // 3. Create a Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      name: 'Alice Customer',
      email: 'customer@test.com',
      password: passwordHash,
      role: 'CUSTOMER',
      loyaltyPoints: {
        create: {
          points: 500,
          lifetimePoints: 500,
          tier: 'BRONZE',
        },
      },
    },
  });
  console.log(`Created Customer: ${customer.email}`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
