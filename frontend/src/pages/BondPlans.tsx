import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { HomeUtils } from '../utils/HomeUtils'
import { Link, useNavigate } from 'react-router-dom'
import MainBonding from '../assets/main bonding.jpg'
import { FiDollarSign } from "react-icons/fi"
import { SlCalender } from "react-icons/sl"
import { VscPercentage } from "react-icons/vsc"
import axios from 'axios'
import AOS from "aos"
import "aos/dist/aos.css"
import TrackRecord from '../components/TrackRecord'
import Testimonial from '../components/Testimonial'
import Footer from '../components/Footer'
import Foot from '../components/Foot'
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Investment {
  id: string
  title: string
  slug: string
  minAmount: number
  returnRate: string
  duration: string
  category: string
  imageUrl: string
  featured: boolean
  bondOffering: boolean
}

const BondPlans: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, offset: 100 })
    fetchBondPlans()
  }, [])

  const fetchBondPlans = async () => {
    try {
      const response = await axios.get(
        'https://civvest-backend.onrender.com/api/investments',
        {
          params: {
            bondOffering: true,
            category: 'Accredited Investors',
          },
        }
      )

      const sorted = response.data.sort(
        (a: Investment, b: Investment) => a.minAmount - b.minAmount
      )

      setInvestments(sorted)
    } catch (err) {
      console.error(err)
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (slug: string) => {
    navigate(`/investment/${slug}`, { state: { fromBondPlans: true } })
  }

  // responsive logic
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const visibleCards = isMobile ? 1 : 3
  const maxIndex = Math.max(investments.length - visibleCards, 0)

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[80vh] lg:h-[120vh]">
        <img
          src={HomeUtils[0].miningPicture}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-10" />
          <div className="flex flex-col absolute top-[5.2em] lg:top-[3.5em] left-10 mt-[7em] lg:mt-[10em] align-start z-20 pr-[2em]">
            <p className="text-[1em] lg:text-[1.2em] text-white text-start font-serif font-semibold">
              Register For A Bond Offering Webinar
            </p>
            <p className='text-[2em] lg:text-[3.7em] text-white text-start font-serif font-semibold lg:max-w-[8em]'>Drill Deeper into Civvest Energy</p>
            <div className='h-[0.3em] w-full bg-blue-300'></div>
            <p className='text-white text-[1em] lg:text-[1.2em] mt-[2em]'>*Connect with our customer support team to learn how our bond offerings may provide the opportunity to earn an annual interest rate in the 70&ndash;90% range</p>
          </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col items-center px-4 my-10">
        <p className="text-blue-500 font-semibold">
          BEGIN YOUR INVESTMENT JOURNEY
        </p>
        <p className="font-bold text-[2em] lg:text-[3em] text-center">
          MORE WAYS TO FUEL YOUR PORTFOLIO
        </p>

        <p className="text-blue-500 mt-8">
          Private Placement Bond Offering
        </p>
        <p className="text-[1.5em] lg:text-[3em]">
          ACCREDITED INVESTORS ONLY
        </p>

        {loading ? (
          <p className="py-10 text-xl">Loading bond offerings...</p>
        ) : (
          <div className="relative w-full max-w-7xl mt-10 overflow-hidden">
            {/* LEFT ARROW */}
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={index === 0}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white p-2 rounded-full shadow disabled:opacity-40"
            >
              <ChevronLeft />
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={() => setIndex((i) => Math.min(i + 1, maxIndex))}
              disabled={index === maxIndex}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-white p-2 rounded-full shadow disabled:opacity-40"
            >
              <ChevronRight />
            </button>

            {/* SLIDER */}
            <motion.div
              className="flex gap-6"
              animate={{ x: `-${index * (100 / visibleCards)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              {investments.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={() => handleCardClick(item.slug)}
                  className="flex-shrink-0 w-full md:w-[23.5em] bg-linear-to-r from-[#041a35] to-[#2a5f9b] text-white rounded-2xl cursor-pointer shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative">
                    <img
                      src={MainBonding}
                      alt={item.title}
                      className="w-full h-48 object-cover"
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

                    <button className="w-full bg-blue-500 py-2 rounded-lg font-semibold">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      <TrackRecord />
      <Testimonial />
      <Footer />
      <Foot />
    </div>
  )
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) => (
  <>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <span>{value}</span>
    </div>
    <div className="h-[1px] bg-white/30" />
  </>
)

export default BondPlans

