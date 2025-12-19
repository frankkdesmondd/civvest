import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ------------------------------------
  // 1. CREATE ADMIN USER
  // ------------------------------------
  const hashedPassword = await bcrypt.hash('Ifeanyi1998', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@civvest.com' },
    update: {},
    create: {
      email: 'admin@civvest.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      accountNumber: 'ADMIN001'
    }
  });

  console.log('Admin user created:', admin);

  // ------------------------------------
  // 2. INVESTMENTS DATA
  // ------------------------------------

  const retailInvestments = [
    {
      title: 'Energy Bond 5K - 1 Month',
      slug: 'energy-bond-5k-1-month',
      description: `This short-term investment opportunity allows you to participate in Civvest Energy Partners' ongoing oil production projects with a quick turnaround...`,
      shortDesc: 'Quick 1-month investment with 15% returns.',
      imageUrl: '/uploads/investments/default-oil-1.jpg',
      minAmount: 5000,
      targetAmount: 500000,
      currentAmount: 0,
      returnRate: '15%',
      duration: '1 Month',
      category: 'Retail Investors',
      featured: true,
      status: 'ACTIVE'
    },
    {
      title: 'Energy Bond 10K - 6 Month',
      slug: 'energy-bond-10k-6-month',
      description: `A medium-term investment opportunity designed for investors seeking balanced growth...`,
      shortDesc: 'Medium-term 6-month plan with 20% returns.',
      imageUrl: '/uploads/investments/default-oil-2.jpg',
      minAmount: 10000,
      targetAmount: 1000000,
      currentAmount: 0,
      returnRate: '20%',
      duration: '6 Months',
      category: 'Retail Investors',
      featured: false,
      status: 'ACTIVE'
    },
    {
      title: 'Energy Bond 20K - 6 Month',
      slug: 'energy-bond-20k-6-month',
      description: `Our premium retail investment tier offers enhanced returns...`,
      shortDesc: 'Premium 6-month investment with 25% returns.',
      imageUrl: '/uploads/investments/default-oil-3.jpg',
      minAmount: 20000,
      targetAmount: 2000000,
      currentAmount: 0,
      returnRate: '25%',
      duration: '6 Months',
      category: 'Retail Investors',
      featured: true,
      status: 'ACTIVE'
    }
  ];

  const accreditedInvestments = [
    {
      title: 'Elite Energy Bond 50K',
      slug: 'elite-energy-bond-50k',
      description: `Exclusive opportunity for accredited investors...`,
      shortDesc: 'Exclusive 8-month plan with 40% returns.',
      imageUrl: '/uploads/investments/default-oil-4.jpg',
      minAmount: 50000,
      targetAmount: 5000000,
      currentAmount: 0,
      returnRate: '40%',
      duration: '8 Months',
      category: 'Accredited Investors',
      featured: true,
      status: 'ACTIVE'
    },
    {
      title: 'Premium Energy Bond 100K',
      slug: 'premium-energy-bond-100k',
      description: `Our flagship investment offering for accredited investors...`,
      shortDesc: 'Flagship 12-month investment offering 60% returns.',
      imageUrl: '/uploads/investments/default-oil-5.jpg',
      minAmount: 100000,
      targetAmount: 10000000,
      currentAmount: 0,
      returnRate: '60%',
      duration: '12 Months',
      category: 'Accredited Investors',
      featured: true,
      status: 'ACTIVE'
    },
    {
      title: 'Platinum Energy Bond 200K',
      slug: 'platinum-energy-bond-200k',
      description: `The ultimate investment vehicle for sophisticated accredited investors...`,
      shortDesc: 'Ultimate 12-month platinum tier with 65% returns.',
      imageUrl: '/uploads/investments/default-oil-6.jpg',
      minAmount: 200000,
      targetAmount: 20000000,
      currentAmount: 0,
      returnRate: '65%',
      duration: '12 Months',
      category: 'Accredited Investors',
      featured: false,
      status: 'ACTIVE'
    }
  ];

  // ------------------------------------
  // 3. UPSERT RETAIL INVESTMENTS
  // ------------------------------------
  for (const investment of retailInvestments) {
    await prisma.investment.upsert({
      where: { slug: investment.slug },
      update: investment,
      create: investment
    });
    console.log(`Created/Updated Retail Investment: ${investment.title}`);
  }

  // ------------------------------------
  // 4. UPSERT ACCREDITED INVESTMENTS
  // ------------------------------------
  for (const investment of accreditedInvestments) {
    await prisma.investment.upsert({
      where: { slug: investment.slug },
      update: investment,
      create: investment
    });
    console.log(`Created/Updated Accredited Investment: ${investment.title}`);
  }

  console.log('Seed completed successfully!');
}

// RUN SEEDER
main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
