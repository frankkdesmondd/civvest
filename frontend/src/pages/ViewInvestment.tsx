import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { usePageTitle } from "../hooks/usePageTitle";
import InvestHeroSection from '../components/InvestHeroSection';
import InvestorImage from '../assets/Investment Image.jpeg';
import MainBonding from '../assets/main bonding.jpg'; // Add this import
import { FiDollarSign } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
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
  bondOffering: boolean; // Add this
}

const ViewInvestment: React.FC = () => {
  usePageTitle("View Investment");
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      offset: 100,
    });
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      // Fetch investments that are NOT bond offerings
      const response = await axios.get('https://civvest-backend.onrender.com/api/investments', {
        params: {
          bondOffering: false // Exclude bond offerings
        }
      });
      setInvestments(response.data);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate investments by category
  const retailInvestments = investments.filter(inv => inv.category === 'Retail Investors');
  const accreditedInvestments = investments.filter(inv => inv.category === 'Accredited Investors');

  const handleCardClick = (slug: string) => {
    navigate(`/investment/${slug}`, { state: { fromBondPlans: false } });
  };

  // Function to get the right image based on investment type
  const getInvestmentImage = (investment: Investment) => {
    if (investment.imageUrl) {
      return `https://civvest-backend.onrender.com${investment.imageUrl}`;
    }
    // Fallback to default images based on category
    return investment.category === 'Accredited Investors' ? MainBonding : InvestorImage;
  };

  return (
    <div>
      <Navbar />
      <InvestHeroSection />

      <div className='flex flex-col mt-[3em] px-[2em] gap-[1em] mb-[5em]' data-aos="fade-up">
        <p className='flex text-[#043873] text-[3em] font-semibold'>Our Bond Offerings</p>

        <p className='flex text-[#043873] text-[1.3em] font-semibold'>
          Compound Interest Earnings
        </p>

        <p>
          Invest in Civvest Energy Partners. We offer fixed-rate corporate bonds
          for investors, with even higher rates available for larger investments.
          Our bond offerings are designed to meet a range of financial goals.
          Bonds may be purchased with qualified funds, including some IRAs.⁴
        </p>

        <p className='flex text-[#043873] text-[1.4em] font-semibold mt-[2em] mb-[1em]'>
          OPEN TO ELIGIBLE INVESTORS, INCLUDING ACCREDITED AND RETAIL INVESTORS,
          DEPENDING ON THE OFFERING STRUCTURE
        </p>

        {/* ==== RETAIL INVESTORS SECTION ==== */}
        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-xl text-gray-600">Loading investments...</p>
          </div>
        ) : (
          <>
            <div className='flex flex-wrap gap-[1.7em]'>
              {retailInvestments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.slug)}
                  className='flex flex-col w-[23.5em] bg-linear-to-r from-[#041a35] to-[#2a5f9b] text-white rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300'
                  data-aos="fade-up"
                >
                  {/* IMAGE + DARK OVERLAY */}
                  <div className="relative w-full">
                    <img 
                      src={getInvestmentImage(item)} 
                      alt={item.title} 
                      className='w-full h-48 object-cover' 
                      onError={(e) => {
                        e.currentTarget.src = InvestorImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-[#041a35]/60"></div>
                    {item.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* CARD CONTENT */}
                  <div className='flex flex-col px-[2.6em] w-full my-[2.4em] gap-[1em]'>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>

                    {/* CURRENCY */}
                    <div className='flex gap-[2em] justify-between'>
                      <div className='flex gap-1 items-center'>
                        <FiDollarSign className='text-[1.2em]' />
                        <p>currency:</p>
                      </div>
                      <p>USD</p>
                    </div>
                    <div className='w-full h-[0.03em] bg-white'></div>

                    {/* MIN AMOUNT */}
                    <div className='flex gap-[2em] justify-between'>
                      <div className='flex gap-1 items-center'>
                        <FiDollarSign className='text-[1.2em]' />
                        <p>Min Amount:</p>
                      </div>
                      <p>${item.minAmount.toLocaleString()}</p>
                    </div>
                    <div className='w-full h-[0.03em] bg-white'></div>

                    {/* ROI PERIOD */}
                    <div className='flex gap-[2em] justify-between'>
                      <div className='flex gap-2 items-center'>
                        <SlCalender className='text-[1.2em]' />
                        <p>ROI Maturity Period:</p>
                      </div>
                      <p>{item.duration}</p>
                    </div>

                    <button className="mt-4 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-semibold transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ==== ACCREDITED INVESTORS SECTION ==== */}
            <p className='flex mt-[5em] text-[1.5em] text-[#041a35] mb-[1em] font-semibold'>
              OPEN TO ACCREDITED INVESTORS
            </p>
            
            <div className='flex flex-wrap gap-[1.7em]'>
              {accreditedInvestments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.slug)}
                  className='flex flex-col w-[23.5em] bg-linear-to-r from-[#041a35] to-[#2a5f9b] text-white rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300'
                  data-aos="fade-up"
                >
                  {/* IMAGE + DARK OVERLAY */}
                  <div className="relative w-full">
                    <img 
                      src={getInvestmentImage(item)} 
                      alt={item.title} 
                      className='w-full h-48 object-cover' 
                      onError={(e) => {
                        e.currentTarget.src = MainBonding;
                      }}
                    />
                    <div className="absolute inset-0 bg-[#041a35]/60"></div>
                    {item.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* CARD CONTENT */}
                  <div className='flex flex-col px-[2.6em] w-full my-[2.4em] gap-[1em]'>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>

                    {/* CURRENCY */}
                    <div className='flex gap-[2em] justify-between'>
                      <div className='flex gap-1 items-center'>
                        <FiDollarSign className='text-[1.2em]' />
                        <p>currency:</p>
                      </div>
                      <p>USD</p>
                    </div>
                    <div className='w-full h-[0.03em] bg-white'></div>

                    {/* MIN AMOUNT */}
                    <div className='flex gap-[2em] justify-between'>
                      <div className='flex gap-1 items-center'>
                        <FiDollarSign className='text-[1.2em]' />
                        <p>Min Amount:</p>
                      </div>
                      <p>${item.minAmount.toLocaleString()}</p>
                    </div>
                    <div className='w-full h-[0.03em] bg-white'></div>

                    {/* ROI PERIOD */}
                    <div className='flex gap-[2em] justify-between'>
                      <div className='flex gap-2 items-center'>
                        <SlCalender className='text-[1.2em]' />
                        <p>ROI Maturity Period:</p>
                      </div>
                      <p>{item.duration}</p>
                    </div>

                    <button className="mt-4 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-semibold transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className='flex flex-col items-start gap-[2em] text-gray-400 mt-[3em]'>
          <p>Note: Please see the Disclosures at the bottom of this page.</p>
          <p>Interest for each investment plan accrues monthly and is added to the outstanding principal balance. No interest payments are made until the investment reaches its maturity date, at which time the full principal and earned interest are paid to the investor.</p>
          <p>Civvest Energy Partners provides investment opportunities by partnering with established oil-producing companies in the United States. Investor funds are used to support and finance ongoing energy production projects. Once the partnered operations generate profit, Civvest Energy Partners receives its share as a participating partner. Investors are then paid their agreed-upon Return on Investment ("ROI") based on the plan selected.</p>
          <p>Our investment plans include minimum investment options of $5,000, $10,000, $20,000, and $50,000, 100,000, 200,000, 500,000, 1,000,000, 2,000,000, 5,000,000 offering flexibility for different financial goals and levels of participation.</p>
          <p>Investment offerings may be available through both private placements and public offerings, depending on the structure of the investment.</p>
          <p>Private Placement Offerings (Regulation D) may be limited to accredited investors, as defined under Rule 501 of Regulation D. Accredited investors include individuals with a net worth over $1 million (excluding primary residence), or annual income above $200,000 (individual) or $300,000 (household) for the last two years with an expectation of the same in the current year.</p>
          <p>Registered Offerings, when available, may allow participation from non-accredited (retail) investors, subject to specific guidelines and suitability requirements.</p>
          <p>All investments carry risk, and returns depend on the performance of the underlying oil operations.</p>
        </div>
      </div>

      <TrackRecord/>
      <Testimonial/>
      <div className="w-full flex justify-center mb-[5em]">
        <div className="px-[2em] lg:px-[4em] max-w-[50em]">
          <p className="text-center text-[0.9em]">
            The testimonials may not be representative of other investors not listed on this page. 
            The testimonials are no guarantee of future performance or success of the company or a 
            return on investment.
          </p>
        </div>
      </div>
      <Footer/>
      <Foot/>
    </div>
  );
};

export default ViewInvestment;


