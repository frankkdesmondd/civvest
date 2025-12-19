import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { HomeUtils } from '../utils/HomeUtils'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import MainBonding from '../assets/main bonding.jpg';
import { FiDollarSign } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import { VscPercentage } from "react-icons/vsc";
import axios from 'axios';
import AOS from "aos";
import "aos/dist/aos.css";
import TrackRecord from '../components/TrackRecord';
import Testimonial from '../components/Testimonial';
import Footer from '../components/Footer';
import Foot from '../components/Foot';

interface Investment {
  id: string;
  title: string;
  slug: string;
  minAmount: number;
  returnRate: string;
  duration: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  bondOffering: boolean; // Added this field
}

const BondPlans: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      offset: 100,
    });
    fetchBondPlans();
  }, []);

  const fetchBondPlans = async () => {
    try {
      // Fetch only bond offerings from the API
      const response = await axios.get('https://civvest-backend.onrender.com', {
        params: {
          bondOffering: true,
          category: 'Accredited Investors'
        }
      });
      
      // Sort by minAmount (smallest to biggest)
      const sortedInvestments = response.data.sort((a: Investment, b: Investment) => 
        a.minAmount - b.minAmount
      );
      
      setInvestments(sortedInvestments);
    } catch (error) {
      console.error('Failed to fetch bond plans:', error);
      // Fallback to hardcoded data if API fails
      const fallbackPlans: Investment[] = [
        {
          id: "bond-1",
          title: "Premium Bond Offering",
          slug: "premium-bond-offering",
          minAmount: 1000000,
          returnRate: "80%",
          duration: "5 Years",
          category: "Accredited Investors",
          imageUrl: "/uploads/investments/bond-offering-default.jpg",
          featured: true,
          bondOffering: true
        },
        {
          id: "bond-2",
          title: "Elite Bond Offering",
          slug: "elite-bond-offering",
          minAmount: 5000000,
          returnRate: "90%",
          duration: "5 Years",
          category: "Accredited Investors",
          imageUrl: "/uploads/investments/bond-offering-default.jpg",
          featured: true,
          bondOffering: true
        },
        {
          id: "bond-3",
          title: "Standard Bond Offering",
          slug: "standard-bond-offering",
          minAmount: 500000,
          returnRate: "70%",
          duration: "2 Years",
          category: "Accredited Investors",
          imageUrl: "/uploads/investments/bond-offering-default.jpg",
          featured: false,
          bondOffering: true
        },
        {
          id: "bond-4",
          title: "Executive Bond Offering",
          slug: "executive-bond-offering",
          minAmount: 2000000,
          returnRate: "90%",
          duration: "5 Years",
          category: "Accredited Investors",
          imageUrl: "/uploads/investments/bond-offering-default.jpg",
          featured: true,
          bondOffering: true
        }
      ].sort((a, b) => a.minAmount - b.minAmount);
      
      setInvestments(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (slug: string) => {
    // Pass state to indicate this came from bond plans page
    navigate(`/investment/${slug}`, { state: { fromBondPlans: true } });
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <Navbar/>
      <div className="relative w-full h-[80vh] lg:h-[120vh]">
        <img
          src={HomeUtils[0].miningPicture}
          alt="FAQ Image"
          className="w-full h-full object-cover"
        />

        {/* Dark Blur Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-[2px] pointer-events-none z-10"></div>
        <Link to='/contact-us'>
          <div className="flex flex-col absolute top-[5.2em] lg:top-[3.5em] left-10 mt-[7em] lg:mt-[10em] align-start z-20 pr-[2em]">
            <p className="text-[1em] lg:text-[1.2em] text-white text-start font-serif font-semibold">
              Register For A Bond Offering Webinar
            </p>
            <p className='text-[2em] lg:text-[3.7em] text-white text-start font-serif font-semibold lg:max-w-[8em]'>Drill Deeper into Civvest Energy</p>
            <div className='h-[0.3em] w-full bg-blue-300'></div>
            <p className='text-white text-[1em] lg:text-[1.2em] mt-[2em]'>*Connect with our customer support team to learn how our bond offerings may provide the opportunity to earn an annual interest rate in the 70&ndash;90% range</p>
          </div>
        </Link>
      </div>
      <div className='flex flex-col items-center gap-2 px-4 md:px-[2em] lg:px-[2em] my-6 md:my-[2em]'>
        <p className='text-blue-500 font-semibold text-sm md:text-base'>BEGIN YOUR INVESTMENT JOURNEY</p>
        <p className='font-bold text-xl md:text-2xl lg:text-[3em] text-center'>MORE WAYS TO FUEL YOUR PORTFOLIO</p>
        <p className='flex text-center max-w-[54em] text-sm md:text-base'>We are proud to offer Regulation D private placement bond opportunities for accredited investors¹, along with a separate registered offering available to both accredited and non-accredited investors.² Begin your investment journey with a minimum of $500,000.</p>
        <p className='text-sm md:text-[1.2em] text-blue-500 mt-4 md:mt-[2em]'>Private Placement Bond offering</p>
        <p className='text-lg md:text-xl lg:text-[3em] text-center'>ACCREDITED INVESTORS ONLY</p>
        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-xl text-gray-600">Loading bond offerings...</p>
          </div>
        ) : (
        <div className='flex flex-wrap gap-4 md:gap-[1.7em] mt-6 md:mt-[3em] items-center justify-center w-full max-w-7xl mx-auto'>
          {investments.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.slug)}
              className='flex flex-col w-full max-w-sm md:w-[23.5em] bg-linear-to-r from-[#041a35] to-[#2a5f9b] text-white rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg'
              data-aos="fade-up"
            >
              {/* IMAGE + DARK OVERLAY */}
              <div className="relative w-full">
                <img 
                  src={MainBonding} 
                  alt={item.title} 
                  className='w-full h-40 md:h-48 object-cover' 
                />
                <div className="absolute inset-0 bg-[#041a35]/60"></div>
                {item.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                    Featured
                  </div>
                )}
              </div>

              {/* CARD CONTENT */}
              <div className='flex flex-col px-[2em] md:px-[2.6em] w-full my-[2em] md:my-[2.4em] gap-3 md:gap-[1em]'>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-center md:text-left">{item.title}</h3>

                {/* CURRENCY */}
                <div className='flex gap-2 md:gap-[2em] justify-between'>
                  <div className='flex gap-1 items-center'>
                    <FiDollarSign className='text-[1.2em]' />
                    <p className='text-sm md:text-base'>currency:</p>
                  </div>
                  <p className='text-sm md:text-base'>USD</p>
                </div>
                <div className='w-full h-[0.03em] bg-white'></div>

                {/* MIN AMOUNT */}
                <div className='flex gap-2 md:gap-[2em] justify-between'>
                  <div className='flex gap-1 items-center'>
                    <FiDollarSign className='text-[1.2em]' />
                    <p className='text-sm md:text-base'>Min Amount:</p>
                  </div>
                  <p className='text-sm md:text-base'>${item.minAmount.toLocaleString()}</p>
                </div>
                <div className='w-full h-[0.03em] bg-white'></div>

                {/* INTEREST RATE */}
                <div className='flex gap-2 md:gap-[2em] justify-between'>
                  <div className='flex gap-1 items-center'>
                    <VscPercentage className='text-[1.2em]' />
                    <p className='text-sm md:text-base'>Interest Rate:</p>
                  </div>
                  <p className='text-sm md:text-base'>{item.returnRate}</p>
                </div>
                <div className='w-full h-[0.03em] bg-white'></div>

                {/* ROI PERIOD */}
                <div className='flex gap-2 md:gap-[2em] justify-between'>
                  <div className='flex gap-2 items-center'>
                    <SlCalender className='text-[1.2em]' />
                    <p className='text-sm md:text-base'>ROI Maturity Period:</p>
                  </div>
                  <p className='text-sm md:text-base'>{item.duration}</p>
                </div>

                <button className="mt-4 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-semibold transition text-sm md:text-base">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
      <div className='flex flex-col gap-4 text-gray-500 px-4 md:px-[2em] text-sm md:text-[1em] my-6 md:my-[4em]'>
        <p>Note: Please see the Disclosures at the bottom of this page.</p>
        <p>Interest for each investment plan accrues monthly and is added to the outstanding principal balance. No interest payments are made until the investment reaches its maturity date, at which time the full principal and earned interest are paid to the investor.</p>
        <p>Civvest Energy Partners provides investment opportunities by partnering with established oil-producing companies in the United States. Investor funds are used to support and finance ongoing energy production projects. Once the partnered operations generate profit, Civvest Energy Partners receives its share as a participating partner. Investors are then paid their agreed-upon Return on Investment ("ROI") based on the plan selected.</p>
        <p>Our investment plans include minimum investment options of $5,000, $10,000, $20,000, and $50,000, 100,000, 200,000, 500,000, 1,000,000, 2,000,000, 5,000,000 offering flexibility for different financial goals and levels of participation.</p>
        <p>Investment offerings may be available through both private placements and public offerings, depending on the structure of the investment.</p>
        <p>Private Placement Offerings (Regulation D) may be limited to accredited investors, as defined under Rule 501 of Regulation D. Accredited investors include individuals with a net worth over $1 million (excluding primary residence), or annual income above $200,000 (individual) or $300,000 (household) for the last two years with an expectation of the same in the current year.</p>
        <p>Registered Offerings, when available, may allow participation from non-accredited (retail) investors, subject to specific guidelines and suitability requirements.</p>
        <p>All investments carry risk, and returns depend on the performance of the underlying oil operations.</p>
      </div>
      <TrackRecord/>
      <div className='text-sm md:text-[1em] flex flex-col gap-4 md:gap-[2em] text-gray-500 px-4 md:px-[2em] mt-6 md:mt-[4em]'>
        <p>NOTE: Past performance does not guarantee future results.</p>
        <p>The following information is based on internal feedback collected during Civvest Energy Partners' quarterly investor update held on 8/21/2025. A total of 479 investors participated in the poll. Out of these respondents, 436 investors (91%) reported being "Very Satisfied" with their experience, while 29 investors (6%) reported being "Somewhat Satisfied." An additional 12 investors selected "Neutral."</p>
        <p>The total returns reported below reflect the combined interest payments and accrued returns issued to all Civvest Energy Partners investors through 9/30/2025. This amount includes all ROI distributions paid directly to our investors as part of our partnership programs with U.S. oil-producing companies.
        This figure does not include payments made to outside businesses, vendors, or financing partners.</p>
        <p>These numbers are consistent with the operational and financial disclosures provided in Civvest Energy Partners' periodic reporting and internal performance summaries.</p>
      </div>
      <Testimonial/>
      <p className='text-sm md:text-[1em] flex flex-col gap-4 md:gap-[2em] text-gray-500 px-4 md:px-[2em]'>The testimonials may not be representative of other investors not listed on this page. The testimonials are no guarantee of future performance or success of the company or a return on investment.</p>
      <div className='flex flex-col items-center mt-6 md:mt-[4em]'>
        <p className='flex text-blue-600 font-medium lg:font-bold lg:text-[2.5em] text-lg md:text-xl text-center my-4 md:my-[2em] flex-wrap px-4 md:px-[2em]'>Civvest Energy Partners Investment Disclosure</p>
        <div className='flex flex-col gap-4 md:gap-[2em] px-4 md:px-[2em] mb-6 md:mb-[4em]'>
          <p>Any financial information or performance indicators presented in these materials are for informational purposes only. They should not be viewed as a replacement for our official financial results prepared in accordance with U.S. Generally Accepted Accounting Principles ("GAAP"). Any non-GAAP figures included here are simply tools to help explain our operations. These figures have limitations and should not be considered on their own, or used as substitutes for our GAAP-reported financial statements.</p>
          <p>All logos, names, and branding associated with Civvest Energy Partners, including the Civvest Energy Partners logo, are the property of the Company. For convenience, we may refer to our trademarks and service marks without the ®, TM, or SM symbols. This does not mean we waive any rights. Civvest Energy Partners fully intends to protect and enforce all intellectual property to the fullest extent allowed by law. Any names or logos belonging to other companies that appear in these materials are the property of their respective owners. Their appearance does not imply any partnership, endorsement, or sponsorship of Civvest Energy Partners.
          </p>
          <p>Civvest Energy Partners offers investment opportunities by partnering with established oil-producing companies in the United States. Investor funds are used to support and finance these oil operations. Once the partnered oil projects become profitable, Civvest Energy Partners receives its share of the revenue as a participating partner. Investors who funded the project then receive their agreed-upon Return on Investment ("ROI") according to the terms of their investment agreement. Please note that all investments involve risk, and returns are dependent on the success of the underlying oil operations.</p>
        </div>
      </div>
      <Footer/>
      <Foot/>
    </div>
  )
}

export default BondPlans
