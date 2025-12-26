// seedBondOfferings.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bondOfferings = [
  {
    title: "Premium Bond Offering",
    slug: "premium-bond-offering",
    description: `Invest in Civvest Energy Partners' Premium Bond Offering designed exclusively for accredited investors. 
    
    This high-yield bond provides an exceptional return over a 5-year term, backed by our proven track record in the oil and energy sector.
    
    Key Features:
    • Minimum Investment: $1,000,000
    • Compound Interest Earnings
    • Backed by established U.S. oil-producing operations
    • Quarterly performance updates
    • Priority investor status
    
    Your investment supports ongoing energy production projects across multiple states, with funds allocated to drilling, production enhancement, and operational expansion.`,
    shortDesc: "Premium bond offering with 80% return over 5 years for accredited investors",
    minAmount: 1000000,
    targetAmount: 10000000,
    returnRate: "80%",
    duration: "5 Years",
    category: "Accredited Investors",
    featured: true,
    bondOffering: true,
    status: "ACTIVE",
    imageUrl: "/uploads/investments/bond-offering-default.jpg"
  },
  {
    title: "Elite Bond Offering",
    slug: "elite-bond-offering",
    description: `Civvest Energy Partners' Elite Bond Offering represents the pinnacle of our investment opportunities, reserved for high net worth accredited investors.
    
    With a minimum investment of $5,000,000, this exclusive bond delivers an outstanding return over 5 years.
    
    Elite Benefits:
    • Minimum Investment: $5,000,000
    • Dedicated account manager
    • Quarterly dividend distributions
    • Exclusive investor events and site visits
    • Priority access to future offerings
    • Enhanced reporting and transparency
    
    Elite investors gain unparalleled access to our most profitable projects and enjoy white-glove service throughout the investment period.`,
    shortDesc: "Elite bond with return over 5 years for high net worth investors",
    minAmount: 5000000,
    targetAmount: 50000000,
    returnRate: "90%",
    duration: "5 Years",
    category: "Accredited Investors",
    featured: true,
    bondOffering: true,
    status: "ACTIVE",
    imageUrl: "/uploads/investments/bond-offering-default.jpg"
  },
  {
    title: "Standard Bond Offering",
    slug: "standard-bond-offering",
    description: `Start your journey with Civvest Energy Partners through our Standard Bond Offering, the entry point for accredited investors.
    
    With a minimum investment of $500,000, this 2-year bond provides a competitive 70% return.
    
    Standard Features:
    • Minimum Investment: $500,000
    • Shorter investment term for faster returns
    • Monthly interest accrual
    • Comprehensive investor portal access
    • Regular performance updates
    
    Perfect for investors seeking shorter-term commitments while benefiting from the oil and energy sector's strong performance.`,
    shortDesc: "Standard bond with return over 2 years - entry level for accredited investors",
    minAmount: 500000,
    targetAmount: 5000000,
    returnRate: "70%",
    duration: "2 Years",
    category: "Accredited Investors",
    featured: false,
    bondOffering: true,
    status: "ACTIVE",
    imageUrl: "/uploads/investments/bond-offering-default.jpg"
  },
  {
    title: "Executive Bond Offering",
    slug: "executive-bond-offering",
    description: `The Executive Bond Offering from Civvest Energy Partners combines substantial returns with strategic investment positioning.
    
    Designed for accredited investors ready to commit $2,000,000, this bond offers an impressive return over 5 years.
    
    Executive Advantages:
    • Minimum Investment: $2,000,000
    • Enhanced investor communications
    • Semi-annual performance reviews
    • Access to executive investor webinars
    • Priority consideration for new opportunities
    • Comprehensive market analysis reports
    
    Executive investors benefit from deep integration with our investment team and access to strategic insights into the energy market.`,
    shortDesc: "Executive bond with 90% return over 5 years for strategic investors",
    minAmount: 2000000,
    targetAmount: 20000000,
    returnRate: "90%",
    duration: "5 Years",
    category: "Accredited Investors",
    featured: true,
    bondOffering: true,
    status: "ACTIVE",
    imageUrl: "/uploads/investments/bond-offering-default.jpg"
  }
];

async function seedBondOfferings() {
  console.log('🌱 Starting bond offerings seed...');
  
  try {
    // Create each bond offering
    for (const bond of bondOfferings) {
      const created = await prisma.investment.upsert({
        where: { slug: bond.slug },
        update: bond, // Update if exists
        create: bond  // Create if doesn't exist
      });
      
      console.log(`✅ Created/Updated: ${created.title}`);
      console.log(`   - Min Amount: $${created.minAmount.toLocaleString()}`);
      console.log(`   - Return Rate: ${created.returnRate}`);
      console.log(`   - Duration: ${created.duration}`);
      console.log('');
    }
    
    // Count total bond offerings
    const count = await prisma.investment.count({
      where: { bondOffering: true }
    });
    
    console.log('✨ Seed completed successfully!');
    console.log(`📊 Total bond offerings in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error seeding bond offerings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('👋 Database connection closed');
  }
}

// Run the seed function
seedBondOfferings()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

