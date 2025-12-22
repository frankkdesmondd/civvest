import React from 'react'
import ContactBuilding from '../assets/office-buildings.jpg'
import { FaPhoneAlt } from "react-icons/fa";

const ContactBody: React.FC = () => {
  return (
    <div className="relative flex justify-center z-10 mt-[-5em] mb-[20em] lg:mb-[30em] px-4">

      {/* MAIN BOX */}
      <div
        className="
          absolute 
          bg-white 
          w-[92%] max-w-[1100px] 
          left-1/2 -translate-x-1/2 
          flex flex-col lg:flex-row 
          overflow-hidden
          shadow-xl
        "
      >

        {/* LEFT SECTION – TEXT */}
        <div className="flex items-center justify-center px-4 py-[4em] lg:p-10 lg:w-1/2 bg-white text-[#244772]">
          <div className='flex flex-col gap-[2em] items-center'>
            {/* <p className="bg-gray-400 px-[1.3em] py-4 text-[1.5em] text-center lg:text-left rounded-xl font-semibold">
              Come say hello and visit us in person
            </p> */}
            <div className='flex flex-col items-center'>
              <h1 className='text-[1.4em] lg:text-[1.8em] font-serif mb-4 bg-gray-400 px-[1.5em]'>Civvest Energy Partners</h1>
              <p className='w-[14em] text-center mb-4'>Dallas, Texas</p>
              <div className='flex gap-[0.5em] items-center'>
                <FaPhoneAlt className="text-[0.8em]" />
                <p>(192)924-81175</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION – IMAGE */}
        <div className="hidden lg:flex lg:w-1/2 h-[14em] lg:h-auto">
          <img
            src={ContactBuilding}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  )
}

export default ContactBody
