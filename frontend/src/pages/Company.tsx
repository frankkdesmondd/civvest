import React, {useEffect} from 'react'
import Navbar from '../components/Navbar'
import { HomeUtils } from '../utils/HomeUtils'
import SecondBody from '../components/SecondBody'
import Footer from '../components/Footer'
import Foot from '../components/Foot'
import { useSEO } from "../hooks/useSEO";
import { Link } from 'react-router-dom'
import OurCompany from '../assets/our company logo.jpg'
import AOS from "aos";
import "aos/dist/aos.css";

const Company: React.FC = () => {
  useSEO({
    title: "Our Company",
    description: "Learn about Civvest Energy Partners - a leading renewable energy investment company based in Dallas, Texas. Discover our executive team, operations, and investment philosophy.",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: OurCompany, // Make sure this is an absolute URL in production
    url: "https://www.civvest.com/company",
    type: "website"
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
    AOS.refresh();
  }, []);

  // ✅ Add breadcrumb structured data
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
          "name": "Our Company",
          "item": "https://www.civvest.com/company"
        }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    return () => {
      breadcrumbScript.remove();
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#041a35] overflow-x-hidden">
      {/* ✅ Add schema.org Organization markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Civvest Energy Partners",
          "url": "https://www.civvest.com",
          "logo": "https://www.civvest.com/civvest logo.jpg",
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

      <div className="relative w-full h-[50vh] lg:h-[70vh]" data-aos="fade-up">
        <img
          src={OurCompany}
          alt="Civvest Energy Partners Company Headquarters in Dallas, Texas"
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-[#041a35] via-[#041a35]/80 to-transparent"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[2.9em] sm:text-[3em] md:text-[4em] lg:text-[5em] text-white text-center font-serif mt-[3em] lg:mt-[2em]">
            Our Company
          </h1>
        </div>
      </div>

      {/* Intro Section */}
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-10 py-16 text-white" data-aos="fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[1.4em] font-semibold">Let us introduce ourselves</h2>
            <p className="text-gray-300 text-[2.5em] leading-[1.2em] font-serif w-[8em]">
              A few words about us
            </p>
            <div className="w-full h-px bg-white/60"></div>
            <p className="text-gray-200 leading-relaxed">
              Headquartered in Dallas, Texas, Civvest Energy Partners firmly believes in putting the investor first. From selecting low-risk, high-income potential plays in all regions of Texas, to eliminating unnecessary costs, our primary objective is to keep investments as low as possible while maximizing your ownership stake.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[1.4em] font-semibold">Focused on</h2>
            <p className="text-gray-300 text-[2.5em] leading-[1.2em] font-serif w-[11em]">
              U.S. based drilling prospects
            </p>
            <div className="w-full h-px bg-white/60"></div>
            <p className="text-gray-200 leading-relaxed">
              Operating across multiple regions in the United States, Civvest Energy Partners
              provides accredited investors with exclusive access to high-potential oil
              investment opportunities. Contact us today for a free consultation and investment
              prospectus (accredited investors only).
            </p>
          </div>

        </div>
      </div>

      {/* Investment Benefits Card */}
      <div className="w-full px-6 py-16">
        <div className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-lg py-16 px-8 lg:px-20 flex flex-col items-center">
          
          <h2 className="text-[#244772] text-[1.3em]">Some of the</h2>
          <h3 className="text-[#244772] text-center text-[2.7em] font-serif max-w-[20em]">
            Reasons to invest in oil and gas with Civvest Energy Partners
          </h3>

          {/* Benefit Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 w-full">

            {/* Left Column */}
            <div className="flex flex-col gap-12">
              <div>
                <h4 className="text-[1.6em] font-serif text-[#244772]">Monthly and annual cash flow</h4>
                <div className="w-full h-px bg-gray-400 my-2"></div>
                <p className="text-[#244772]">
                  Free time is an extremely valuable commodity to accredited investors. Oil and gas investing gives you the opportunity to achieve significant monthly & annual potential income, while allowing you to maintain focus on your own businesses.
                </p>
              </div>

              <div>
                <h4 className="text-[1.6em] font-serif text-[#244772]">Simple process</h4>
                <div className="w-full h-px bg-gray-400 my-2"></div>
                <p className="text-[#244772]">
                  The Civvest Energy Partners team will carefully walk you through the entire process, from ownership assignments to revenue distributions, We're with you every step of the way so that you can have confidence and peace of mind.
                </p>
              </div>

              <div>
                <h4 className="text-[1.6em] font-serif text-[#244772]">Mitigated Risk</h4>
                <div className="w-full h-px bg-gray-400 my-2"></div>
                <p className="text-[#244772]">
                  By developing proven areas with highly reputable companies and employing state-of-the-art drilling technologies, oil and gas risk is minimized.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-12">
              <div>
                <h4 className="text-[1.6em] font-serif text-[#244772]">Diversified Portfolio</h4>
                <div className="w-full h-px bg-gray-400 my-2"></div>
                <p className="text-[#244772]">
                  Are all of your eggs in one basket? Take advantage of the benefits that oil and gas commodities provide and help your portfolio to flourish.
                </p>
              </div>

              <div>
                <h4 className="text-[1.6em] font-serif text-[#244772]">Low Oil Prices</h4>
                <div className="w-full h-px bg-gray-400 my-2"></div>
                <p className="text-[#244772]">
                  Pricing is back on the rise! Well development costs have decreased significantly over the past two years. Lower well costs and the Civvest Energy Partners approach have created a rare opportunity that has not been available in almost 10 years.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Executive Team Section */}
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-10 py-20">
        
        <h2 className="text-white text-center text-[3em] font-serif">
          Meet Our Executive Team
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">

          {/* ✅ Add Person schema for each team member */}
          {[
            {
              img: HomeUtils[0].foundingPartner,
              name: "Senator Mark B. Warner",
              roles: ["Founding Partner", "Chief Executive Officer"],
              bioUrl: "/team/mark-warner"
            },
            {
              img: HomeUtils[0].managingPartner,
              name: "Senator Sandeep Singh",
              roles: ["Managing Partner", "Chief Administrative Officer"],
              bioUrl: "/team/sandeep-singh"
            },
            {
              img: HomeUtils[0].chiefOperatingOfficer,
              name: "Jeanne Shaheen",
              roles: ["Chief Operating Officer"],
              bioUrl: "/team/jeanne-shaheen"
            },
            {
              img: HomeUtils[0].seniorVicePresiDiver,
              name: "Dian Siswarini",
              roles: ["Senior Vice President", "Divestitures"],
              bioUrl: "/team/dian-siswarini"
            },
            {
              img: HomeUtils[0].seniorVicePresiCom,
              name: "Senator J. Dolega",
              roles: ["Senior Vice President", "Communications & Marketing"],
              bioUrl: "/team/j-dolega"
            }
          ].map((member, idx) => (
            <div key={idx} className="flex flex-col items-center gap-4 text-white font-serif" itemScope itemType="https://schema.org/Person">
              <img 
                src={member.img} 
                alt={`${member.name} - ${member.roles.join(', ')} at Civvest Energy Partners`} 
                className="w-[16em] rounded" 
                itemProp="image"
              />
              <h3 className="text-[1.5em]" itemProp="name">{member.name}</h3>
              <div className="w-full">
                <div className="h-px bg-blue-300 mb-4"></div>
                <div className="flex flex-col items-center text-blue-300">
                  {member.roles.map((r, i) => (
                    <p key={i} className="text-[1.2em]" itemProp="jobTitle">{r}</p>
                  ))}
                </div>
                <div className="h-px bg-blue-300 mt-4"></div>
              </div>
              <meta itemProp="worksFor" content="Civvest Energy Partners" />
              <meta itemProp="url" content={`https://yourdomain.com${member.bioUrl}`} />
            </div>
          ))}

        </div>

      </div>

      {/* Operations Section */}
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-white text-center text-[3em] font-serif">
          Operations and Counsel
        </h2>
        <Link to='/company-bio'>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">

            {[
              {
                img: HomeUtils[0].geologist,
                name: "Mohammed Karim",
                role: "Geologist"
              },
              {
                img: HomeUtils[0].projectManager,
                name: "Mohammed Faisal",
                role: "Project Manager"
              },
              {
                img: HomeUtils[0].legalCouncil,
                name: "Michaela Kaniber",
                role: "Legal Counsel"
              }
            ].map((member, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4 text-white font-serif" itemScope itemType="https://schema.org/Person">
                <img 
                  src={member.img} 
                  alt={`${member.name} - ${member.role} at Civvest Energy Partners`} 
                  className="w-[16em] rounded" 
                  itemProp="image"
                />
                <h3 className="text-[1.5em]" itemProp="name">{member.name}</h3>
                <div className="w-full">
                  <div className="h-px bg-blue-300 mb-4"></div>
                  <div className="text-blue-300 text-center">
                    <p className="text-[1.2em]" itemProp="jobTitle">{member.role}</p>
                  </div>
                  <div className="h-px bg-blue-300 mt-4"></div>
                </div>
                <meta itemProp="worksFor" content="Civvest Energy Partners" />
              </div>
            ))}

          </div>
        </Link>
      </div>

      {/* Additional Sections */}
      <SecondBody />

      {/* Footer */}
      <Footer />
      <Foot />
    </div>
  )
}

export default Company

