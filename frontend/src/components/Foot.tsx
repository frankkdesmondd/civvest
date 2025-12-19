import React from 'react'
import { Link } from 'react-router-dom'

const Foot: React.FC = () => {
  return (
    <div className="flex justify-center bg-white py-4 px-6 lg:px-20">
      <p className="flex flex-wrap gap-4 text-[#041a35] text-center">
        <span>&copy; Copyright - Civvest Energy Partners</span>
        <span>|</span>
        <Link to='/privacy-policy'><span>Privacy Policy</span></Link>
        <span>|</span>
        <Link to='/terms-and-services'><span>Terms of Service</span></Link>
      </p>
    </div>
  )
}

export default Foot
