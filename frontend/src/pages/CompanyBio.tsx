import React, {useEffect} from 'react'
import Navbar from '../components/Navbar'
import { HomeUtils } from '../utils/HomeUtils';
import SecondBody from '../components/SecondBody';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import { useSEO } from "../hooks/useSEO";

const CompanyBio: React.FC = () => {
  useSEO({
    title: "Company Bio",
    description: "Learn about Civvest Energy Partners - a leading renewable energy investment company based in Dallas, Texas. Discover our executive team, operations, and investment philosophy.",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest-main.jpg", 
    url: "https://www.civvest.com/company-bio",
    type: "website"
  });

   useEffect(() => {
      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.civvest.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Company Bio",
            "item": "https://www.civvest.com/company-bio"
          }
        ]
      });
      document.head.appendChild(breadcrumbScript);
      
      return () => {
        breadcrumbScript.remove();
      };
    }, []);

  const teamMembers = [
    {
      img: HomeUtils[0].geologist,
      name: "Mohammed Karim (Geologist)",
      description: "With nearly fifty years of experience as a petroleum industry executive, geologist and geophysicist, Mr. Mohammed Karim obtained his B.S. and M.A. in Geology from the University of Texas at Austin. While in graduate school, Mr. Mohammed Karim worked for the United States Geological Survey and upon completion of his graduate work began his career at ExxonMobil Corporation. After leaving Exxon, Mr. Mohammed Karim started and worked with multiple independent companies and has a track record that includes nearly 1.4 trillion cubic feet of natural gas discoveries either directly generated or as part of a team effort. He has generated over 500 oil and gas prospects and has drilled over 65 exploration wells with a greater that 75% success rate"
    },
    {
      img: HomeUtils[0].projectManager,
      name: "Mohammed Faisal (Project Manager)",
      description: "Mr. Mohammed Faisal founded The Frontline Group in 1992 to serve multinational oil and gas companies in project management and technical consulting. His clients include Amoco, Anadarko, BP, BHP, Baker Hughes, Chevron, Conoco, EOG, Exxon, Hess, Marathon, Mobil, Oxy, Pennzoil, Phillips, Pioneer, Schlumberger, and Shell. Prior to starting The Frontline Group, Mr. Mohammed Faisal worked for Halliburton, Enserch, Clayton Williams, and many independents leading field operations and technical planning. He is Vice Chairman of the Texas Business Leadership Council and is a member of multiple fraternal oil and gas organizations. He holds a B.F.A. in Communications from Texas Christian University and an M.B.A. from the University of Houston"
    },
    {
      img: HomeUtils[0].legalCouncil,
      name: "Michaela Kaniber (Legal Counsel)",
      description: "Michaela Kaniber's legal practice focuses on the representation of private equity, hedge, and special purpose investment vehicles engaged in a broad range of corporate, securities, and regulatory matters. Her fund representation spans numerous businesses and industries, including commercial and consumer lending, real estate investment, software and web-based platform development, FinTech, investments involving blockchain technology, smart contracts, and digital assets, as well as solar and other green energy projects and oil and gas exploration and development. She also advises promoters and investment managers on the structuring, formation, and operation of U.S. and offshore funds. During her career, Ms. Kaniber has been a partner in the New York offices of several large, prestigious national and international law firms, including Dorsey & Whitney LLP, Pepper Hamilton LLP, and Baker Hostetler LLP. Earlier in her career, as a Washington, D.C.–based attorney, her practice focused on representing financial institutions and their holding companies in mergers and acquisitions, financial product development, and regulatory matters. Ms. Kaniber is admitted to practice law in New York, Washington, D.C., and Maryland. She holds a Bachelor of Arts, summa cum laude, from Pennsylvania State University and a Juris Doctor from George Washington University."
    }
  ];

  return (
    <div className='relative w-full min-h-screen bg-[#041a35] overflow-x-hidden'>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Civvest Energy Partners",
          "url": "https://www.civvest.com",
          "logo": "https://www.civvest.com/civvest-main.jpg",
          "description": "Leading renewable energy investment platform providing sustainable energy solutions",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Dallas, Texas",
            "addressCountry": "USA"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "(192)924-81175",
            "contactType": "Customer Service"
          }
        })}
      </script>

      <Navbar/>
      {/* Hero Section */}
      <div className='relative w-full h-[50vh] lg:h-[70vh]'>
        <img
          src={HomeUtils[0].companyView}
          alt="Company View"
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-linear-to-t from-[#041a35] via-[#041a35]/80 to-transparent"></div>

        {/* Title */}
        <div className="absolute top-[18.5em] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
          <p className="text-[2.5em] sm:text-[3em] md:text-[3.5em] lg:text-[4em] xl:text-[5em] text-white text-center font-serif">
            Company Bios
          </p>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {teamMembers.map((member, idx) => (
            <div 
              key={idx} 
              className="flex flex-col md:flex-row items-start gap-6 md:gap-8 lg:gap-[5em] text-white font-serif mb-10 sm:mb-12 lg:mb-16 last:mb-0"
            >
              {/* Member Image */}
              <div className="w-full md:w-1/3 lg:w-1/4 flex justify-center md:justify-start">
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="w-full max-w-[250px] sm:max-w-[280px] md:w-full md:max-w-none rounded-lg shadow-lg object-cover"
                />
              </div>

              {/* Member Info */}
              <div className='flex-1 md:w-2/3 lg:w-3/4'>
                <h2 className="text-[1.5em] sm:text-[1.8em] md:text-[2em] lg:text-[2.2em] mb-3 sm:mb-4 font-bold">
                  {member.name}
                </h2>
                
                {/* Divider */}
                <div className="w-full h-px bg-blue-300 mb-4 sm:mb-5"></div>
                
                {/* Description */}
                <div className="text-blue-100">
                  <p className="text-[0.9em] sm:text-[1em] md:text-[1.05em] leading-[1.3em]">
                    {member.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SecondBody/>
      <Footer/>
      <Foot/>
    </div>
  )
}

export default CompanyBio


