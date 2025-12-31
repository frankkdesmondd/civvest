import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ------------------------------------
  // 1. UPDATE ADMIN PASSWORD ONLY
  // ------------------------------------
  const hashedPassword = await bcrypt.hash('Franking2017$$', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@civvest.com' },
    update: {
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      accountNumber: 'ADMIN001'
    },
    create: {
      email: 'admin@civvest.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      accountNumber: 'ADMIN001'
    }
  });

  console.log('Admin user updated:', admin.email);
  console.log('Admin password reset to: Franking2017$$');

  // ------------------------------------
  // 2. UPDATE INVESTMENTS INSTEAD OF DELETE/CREATE
  // (To preserve foreign key relationships)
  // ------------------------------------
  console.log('Updating investment products...');
  
  // Define the investments we want to have
  const investmentsToUpdate = [
    // Retail Investments
    {
      title: 'Energy Bond 5K',
      slug: 'energy-bond-5k',
      description: `This short-term investment opportunity allows you to participate in Civvest Energy Partners' ongoing oil production projects with a quick turnaround. With a minimum investment of $5,000, you can secure a  return in just one month. Your capital will be deployed in our established energy portfolio, benefiting from our expertise in the oil and gas sector.`,
      shortDesc: 'Quick investment with returns.',
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
      title: 'Energy Bond 10K',
      slug: 'energy-bond-10k',
      description: `A medium-term investment opportunity designed for investors seeking balanced growth. With a $10,000 minimum investment, you'll earn a return. This tier provides exposure to our diversified energy projects while maintaining flexibility with a moderate time commitment.`,
      shortDesc: 'Medium-term plan with returns.',
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
      title: 'Energy Bond 20K',
      slug: 'energy-bond-20k',
      description: `Our premium retail investment tier offers enhanced returns for those ready to commit $20,000. Earn returns over six months while benefiting from priority access to our high-performance energy projects. This tier combines attractive returns with a manageable investment timeline.`,
      shortDesc: 'Premium investment with returns.',
      imageUrl: '/uploads/investments/default-oil-3.jpg',
      minAmount: 20000,
      targetAmount: 2000000,
      currentAmount: 0,
      returnRate: '25%',
      duration: '6 Months',
      category: 'Retail Investors',
      featured: true,
      status: 'ACTIVE'
    },
    // Accredited Investments
    {
      title: 'Elite Energy Bond',
      slug: 'elite-energy-bond',
      description: `Exclusive opportunity for accredited investors seeking substantial returns. With a $50,000 minimum investment, secure returns over eight months. This elite tier provides access to our premium energy projects with enhanced profit potential and dedicated account management.`,
      shortDesc: 'Exclusive plan with returns.',
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
      title: 'Premium Energy Bond',
      slug: 'premium-energy-bond',
      description: `Our flagship investment offering for accredited investors. With a $100,000 commitment, earn an impressive returns. This premium tier grants access to our most lucrative energy ventures, comprehensive reporting, and white-glove service throughout your investment journey.`,
      shortDesc: 'Flagship investment offering returns.',
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
      title: 'Platinum Energy Bond',
      slug: 'platinum-energy-bond',
      description: `The ultimate investment vehicle for sophisticated accredited investors. With a $200,000 minimum, achieve extraordinary returns over twelve months. Platinum tier members receive exclusive access to our highest-yielding projects, personalized investment strategies, and VIP treatment including quarterly in-person briefings.`,
      shortDesc: 'Ultimate platinum tier with returns.',
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

  // Check what investments already exist
  const existingInvestments = await prisma.investment.findMany({
    where: {
      slug: {
        in: investmentsToUpdate.map(inv => inv.slug)
      }
    }
  });

  console.log(`Found ${existingInvestments.length} existing investments to update`);

  // Update or create each investment
  for (const investmentData of investmentsToUpdate) {
    try {
      const investment = await prisma.investment.upsert({
        where: { slug: investmentData.slug },
        update: {
          title: investmentData.title,
          description: investmentData.description,
          shortDesc: investmentData.shortDesc,
          imageUrl: investmentData.imageUrl,
          minAmount: investmentData.minAmount,
          targetAmount: investmentData.targetAmount,
          returnRate: investmentData.returnRate,
          duration: investmentData.duration,
          category: investmentData.category,
          featured: investmentData.featured,
          status: investmentData.status
        },
        create: investmentData
      });
      
      console.log(`✓ ${existingInvestments.find(i => i.slug === investmentData.slug) ? 'Updated' : 'Created'} Investment: ${investment.title}`);
    } catch (error) {
      console.error(`Error processing ${investmentData.title}:`, error.message);
    }
  }

  // Deactivate any old retail/accredited investments that aren't in our new list
  const allRetailAccreditedInvestments = await prisma.investment.findMany({
    where: {
      OR: [
        { category: 'Retail Investors' },
        { category: 'Accredited Investors' }
      ]
    }
  });

  const investmentSlugsToKeep = investmentsToUpdate.map(inv => inv.slug);
  const investmentsToDeactivate = allRetailAccreditedInvestments.filter(
    inv => !investmentSlugsToKeep.includes(inv.slug)
  );

  if (investmentsToDeactivate.length > 0) {
    console.log(`\nDeactivating ${investmentsToDeactivate.length} old investments...`);
    
    for (const oldInvestment of investmentsToDeactivate) {
      await prisma.investment.update({
        where: { id: oldInvestment.id },
        data: { status: 'CLOSED' }
      });
      console.log(`↳ Deactivated: ${oldInvestment.title}`);
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log(`
    Admin password updated successfully!
    Email: admin@civvest.com
    New Password: Franking2017$$
    
    All user accounts and their data are preserved.
    Investment products were updated (not deleted).
    Old investments were deactivated instead of deleted.
  `);
}

// RUN SEEDER WITH ERROR HANDLING
main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

