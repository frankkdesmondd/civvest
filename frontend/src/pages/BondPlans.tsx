import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { HomeUtils } from "../utils/HomeUtils";
import { useNavigate } from "react-router-dom";
import MainBonding from "../assets/main bonding.jpg";
import { FiDollarSign } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import axios from "axios";
import TrackRecord from "../components/TrackRecord";
import Testimonial from "../components/Testimonial";
import Footer from "../components/Footer";
import Foot from "../components/Foot";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { useSEO } from "../hooks/useSEO";

interface Investment {
  id: string;
  title: string;
  slug: string;
  minAmount: number;
  returnRate: string;
  duration: string;
  featured: boolean;
}

const BondPlans: React.FC = () => {
  useSEO({
    title: "Our Company",
    description: "See our major offerings. Be part of this grand plan in the next phase of oil Investment.",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest logo.jpg",
    url: "https://www.civvest.com/company",
    type: "website"
  });

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showAllMobile, setShowAllMobile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBondPlans();

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Reset to carousel view if switching from mobile to desktop
      if (!mobile) {
        setShowAllMobile(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchBondPlans = async () => {
    try {
      const res = await axios.get(
        "https://civvest-backend.onrender.com/api/investments",
        {
          params: {
            bondOffering: true,
            category: "Accredited Investors",
          },
        }
      );
      setInvestments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Desktop: Always show 2 cards, Mobile: Show 1 card
  const cardsToShow = isMobile ? 1 : 2;
  const maxIndex = Math.max(investments.length - cardsToShow, 0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

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
            "item": "https://www.civvest.com/bond-plans"
          }
        ]
      });
      document.head.appendChild(breadcrumbScript);
      
      return () => {
        breadcrumbScript.remove();
      };
    }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

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

      {/* ================= HERO ================= */}
      <div className="relative w-full h-[80vh] lg:h-screen mt-[4em]">
        <img
          src={HomeUtils[0].miningPicture}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-[2px] pointer-events-none z-10"></div>
        <div className="flex flex-col absolute top-[5.2em] lg:top-[3.5em] left-10 mt-[7em] lg:mt-[7em] align-start z-20 pr-[2em]">
          <p className="text-[1em] lg:text-[1.2em] text-white text-start font-serif font-semibold">
            Register For A Bond Offering Webinar
          </p>
          <p className='text-[2em] lg:text-[3.7em] text-white text-start font-serif font-semibold lg:max-w-[8em]'>Drill Deeper into Civvest Energy</p>
          <div className='h-[0.3em] w-full bg-blue-300'></div>
          <p className='text-white text-[1em] lg:text-[1.2em] mt-[2em]'>*Connect with our customer support team to learn how our bond offerings may provide the opportunity to earn an annual interest rate in the 70&ndash;90% range</p>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-col items-center px-4 my-14">
        <p className="text-blue-500 font-semibold">
          BEGIN YOUR INVESTMENT JOURNEY
        </p>

        <h2 className="font-bold text-[2em] lg:text-[3em] text-center mt-2">
          MORE WAYS TO FUEL YOUR PORTFOLIO
        </h2>

        <p className="text-blue-500 mt-8">
          Private Placement Bond Offering
        </p>

        <p className="text-[1.5em] lg:text-[2.5em]">
          ACCREDITED INVESTORS ONLY
        </p>

        {loading ? (
          <p className="py-12 text-xl">Loading bond offerings...</p>
        ) : (
          <div className="w-full max-w-7xl mx-auto mt-10 px-2 lg:px-6">
            {/* MOBILE VIEW ALL LAYOUT (Column Format) */}
            {isMobile && showAllMobile ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">All Bond Offerings</h3>
                  <button
                    onClick={() => setShowAllMobile(false)}
                    className="flex items-center gap-2 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Carousel
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {investments.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/investment/${item.slug}`)}
                      className="w-full"
                    >
                      <InvestmentCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* CAROUSEL LAYOUT */
              <div className="relative">
                {/* HEADER WITH VIEW ALL BUTTON (Mobile only) */}
                {isMobile && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowAllMobile(true)}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      <List className="w-4 h-4" />
                      View All
                    </button>
                  </div>
                )}

                {/* CAROUSEL CONTAINER */}
                <div className="relative w-full overflow-hidden">
                  {/* NAVIGATION ARROWS */}
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 && !isMobile}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white p-2 md:p-3 rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isMobile ? "-translate-x-1/2" : "-translate-x-1/2"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === maxIndex && !isMobile}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white p-2 md:p-3 rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isMobile ? "translate-x-1/2" : "translate-x-1/2"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  {/* CAROUSEL TRACK */}
                  <motion.div
                    className="flex"
                    animate={{ 
                      x: isMobile 
                        ? `-${currentIndex * 100}%` 
                        : `-${currentIndex * (100 / cardsToShow)}%`
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  >
                    {investments.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/investment/${item.slug}`)}
                        className={`shrink-0 ${
                          isMobile 
                            ? "w-full px-2" 
                            : "w-1/2 px-3" // Always 50% width for desktop (2 cards)
                        }`}
                      >
                        <InvestmentCard item={item} />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* DOTS INDICATOR (Mobile only) */}
                {isMobile && investments.length > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {investments.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <TrackRecord />
      <Testimonial />
      <Footer />
      <Foot />
    </div>
  );
};

// Separate Investment Card Component (No changes needed)
const InvestmentCard: React.FC<{ item: Investment }> = ({ item }) => (
  <div className="bg-linear-to-r from-[#041a35] to-[#2a5f9b] text-white rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-[1.03] transition-transform duration-300 h-full">
    <div className="relative">
      <img
        src={MainBonding}
        alt={item.title}
        className="w-full h-56 object-cover"
      />
      <div className="absolute inset-0 bg-[#041a35]/60" />
      {item.featured && (
        <span className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm">
          Featured
        </span>
      )}
    </div>

    <div className="p-6 space-y-3">
      <h3 className="text-xl font-bold">{item.title}</h3>
      <InfoRow icon={<FiDollarSign />} label="Currency" value="USD" />
      <InfoRow
        icon={<FiDollarSign />}
        label="Min Amount"
        value={`$${item.minAmount.toLocaleString()}`}
      />
      <InfoRow
        icon={<SlCalender />}
        label="ROI Period"
        value={item.duration}
      />
      <button className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-semibold mt-4 transition-colors">
        View Details
      </button>
    </div>
  </div>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <span>{value}</span>
    </div>
    <div className="h-px bg-white/30" />
  </>
);

export default BondPlans;
