import React from 'react'
import OilImage from '../assets/oil second.jpg'
import { Link } from 'react-router-dom'

const SecondBody: React.FC = () => {
  return (
    <div className="flex flex-col w-full">

      {/* WHITE SECTION */}
      <div className="px-4 sm:px-[2em] lg:px-[4em] text-center flex flex-col items-center gap-[1.3em] text-[#244772] pt-[2em] pb-[6em] bg-white">
        
        <p className="text-[1.1em] sm:text-[1.3em]">
          Interested in adding oil and gas investments to your portfolio?
        </p>

        
        <p className="text-[1.8em] sm:text-[2.4em] md:text-[3em] font-serif max-w-[15em] mx-auto leading-tight">
          Contact us for a free consultation
          and prospectus
        </p>
        
        <Link to='/view-investment'>
        <button className="px-[1.4em] py-[0.8em] sm:px-[2em] sm:py-[1em] lg:px-[2em] lg:py-[0.6em] bg-white border-2 text-[#244772] hover:bg-[#244772] hover:text-white rounded-lg shadow-xl cursor-pointer font-semibold text-[1.1em] sm:text-[1.3em]">
          Click here to contact us and get started today
        </button>
        </Link>
      </div>

      {/* FADE LAYER */}
      <div className="w-full h-[5em] sm:h-[6em] bg-linear-to-b from-white to-transparent -mt-[5em] sm:-mt-[6em] z-10 pointer-events-none"></div>

      {/* IMAGE SECTION */}
      <div
        className="w-full h-[18em] sm:h-[24em] md:h-[30em] bg-cover bg-center -mt-[5em] sm:-mt-[6em]"
        style={{ backgroundImage: `url(${OilImage})` }}
      ></div>

    </div>
  )
}

export default SecondBody
