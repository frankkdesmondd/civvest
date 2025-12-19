import React from 'react'
import OilImage from '../assets/oil second.jpg'

const LearnDown: React.FC = () => {
  return (
    <div className='flex flex-col w-full'>

      {/* FADE LAYER */}
      <div className="w-full h-[10em] bg-linear-to-b from-white from-50% to-transparent mt-[1em] z-10 pointer-events-none"></div>

      {/* IMAGE SECTION */}
      <div
        className="w-full h-[18em] sm:h-[24em] md:h-[30em] bg-cover bg-center -mt-[5em]"
        style={{ backgroundImage: `url(${OilImage})` }}
      ></div>

    </div>
  )
}

export default LearnDown