// Create a seed script: scripts/seedBondPlans.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedBondPlans() {
  console.log('Seeding bond plans...');

  const bondPlans = [
    {
      title: "Premium Bond Offering",
      description: "High-yield bond offering for accredited investors seeking premium returns over a 5-year period. This offering provides exceptional returns through our established oil production partnerships.",
      shortDesc: "Premium bond offering with return over 5 years",
      minAmount: 1000000,
      targetAmount: 50000000,
      returnRate: "80%",
      duration: "5 Years",
      category: "Accredited Investors",
      bondOffering: true,
      featured: true,
      status: "ACTIVE"
    },
    {
      title: "Elite Bond Offering",
      description: "Top-tier bond offering with maximum returns for elite investors. This is our highest-level bond offering with exceptional returns and priority access to new investment opportunities.",
      shortDesc: "Elite bond offering with return over 5 years",
      minAmount: 5000000,
      targetAmount: 200000000,
      returnRate: "90%",
      duration: "5 Years",
      category: "Accredited Investors",
      bondOffering: true,
      featured: true,
      status: "ACTIVE"
    },
    {
      title: "Standard Bond Offering",
      description: "Standard bond offering with competitive returns for accredited investors over a 2-year period. Perfect for investors looking for shorter-term commitments with solid returns.",
      shortDesc: "Standard bond offering with return over 2 years",
      minAmount: 500000,
      targetAmount: 25000000,
      returnRate: "70%",
      duration: "2 Years",
      category: "Accredited Investors",
      bondOffering: true,
      featured: false,
      status: "ACTIVE"
    },
    {
      title: "Executive Bond Offering",
      description: "Executive-level bond offering with premium interest rates for serious investors. This offering provides access to our most profitable oil production partnerships.",
      shortDesc: "Executive bond offering with return over 5 years",
      minAmount: 2000000,
      targetAmount: 100000000,
      returnRate: "90%",
      duration: "5 Years",
      category: "Accredited Investors",
      bondOffering: true,
      featured: true,
      status: "ACTIVE"
    }
  ];

  for (const plan of bondPlans) {
    const slug = createSlug(plan.title);
    
    // Check if investment already exists
    const existing = await prisma.investment.findUnique({
      where: { slug }
    });

    if (!existing) {
      await prisma.investment.create({
        data: {
          ...plan,
          slug,
          imageUrl: "/uploads/investments/bond-offering-default.jpg"
        }
      });
      console.log(`Created bond plan: ${plan.title}`);
    } else {
      console.log(`Bond plan already exists: ${plan.title}`);
    }
  }

  console.log('Bond plans seeding completed!');
}

seedBondPlans()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();

  });

