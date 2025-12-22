import React from 'react'
import { Link } from 'react-router-dom'

const Foot: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-white py-4 px-4 sm:px-6 lg:px-20">
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[#041a35] text-sm sm:text-base">
        <span className="whitespace-nowrap">&copy; Copyright - Civvest Energy Partners</span>
        <span className="hidden sm:inline">|</span>
        <Link 
          to='/privacy-policy' 
          className="whitespace-nowrap hover:text-blue-600 transition-colors"
        >
          Privacy Policy
        </Link>
        <span className="hidden sm:inline">|</span>
        <Link 
          to='/terms-and-services' 
          className="whitespace-nowrap hover:text-blue-600 transition-colors"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  )
}

export default Foot
