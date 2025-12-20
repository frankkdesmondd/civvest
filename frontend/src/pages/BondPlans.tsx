import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { HomeUtils } from "../utils/HomeUtils";
import { useNavigate } from "react-router-dom";
import MainBonding from "../assets/main bonding.jpg";
import { FiDollarSign } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import { VscPercentage } from "react-icons/vsc";
import axios from "axios";
import TrackRecord from "../components/TrackRecord";
import Testimonial from "../components/Testimonial";
import Footer from "../components/Footer";
import Foot from "../components/Foot";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBondPlans();

    const resize = () => setIsMobile(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
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

  const visibleCards = isMobile ? 1 : 3;
  const maxIndex = Math.max(investments.length - visibleCards, 0);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ================= HERO ================= */}
      <div className="relative w-full h-[80vh] lg:h-screen mt-[4em]">
        <img
          src={HomeUtils[0].miningPicture}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-[2px] pointer-events-none z-10"></div>
          <div className="flex flex-col absolute top-[5.2em] lg:top-[3.5em] left-10 mt-[7em] lg:mt-[10em] align-start z-20 pr-[2em]">
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

        <p className="text-[1.5em] lg:text-[2.5em] text-center">
          ACCREDITED INVESTORS ONLY
        </p>

        {loading ? (
  <p className="py-12 text-xl">Loading bond offerings...</p>
) : (
  <div className="w-full max-w-7xl mx-auto mt-10 px-2 lg:px-6 relative">
    {/* VIEWPORT CONTAINER WITH ABSOLUTE ARROWS ON MOBILE */}
    <div className="relative">
      {/* LEFT ARROW - ABSOLUTE ON MOBILE, RELATIVE ON DESKTOP */}
      <button
        onClick={() => setIndex((i) => Math.max(i - 1, 0))}
        disabled={index === 0}
        className="md:relative absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:translate-x-0 md:translate-y-0 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white p-2 md:p-3 rounded-full shadow disabled:opacity-40"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* VIEWPORT */}
      <div className="w-full overflow-hidden px-4 md:px-0">
        <motion.div
          className="flex gap-6"
          animate={{ x: `-${index * (100 / visibleCards)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          {investments.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/investment/${item.slug}`)}
              className="shrink-0 w-full md:w-1/3"
            >
              <div className="bg-linear-to-r from-[#041a35] to-[#2a5f9b] text-white rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-[1.03] transition-transform">
                <div className="relative">
                  <img
                    src={MainBonding}
                    alt={item.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-[#041a35]/60" />
                  {item.featured && (
                    <span className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
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
                    icon={<VscPercentage />}
                    label="Interest Rate"
                    value={item.returnRate}
                  />
                  <InfoRow
                    icon={<SlCalender />}
                    label="ROI Period"
                    value={item.duration}
                  />
                  <button className="w-full bg-blue-500 py-2 rounded-lg font-semibold mt-4">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT ARROW - ABSOLUTE ON MOBILE, RELATIVE ON DESKTOP */}
      <button
        onClick={() => setIndex((i) => Math.min(i + 1, maxIndex))}
        disabled={index === maxIndex}
        className="md:relative absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-0 md:translate-y-0 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white p-2 md:p-3 rounded-full shadow disabled:opacity-40"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>

    {/* Mobile dots indicator (optional) */}
    {investments.length > 1 && (
      <div className="flex justify-center gap-2 mt-8 md:hidden">
        {investments.slice(0, maxIndex + 1).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full ${
              i === index ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
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

