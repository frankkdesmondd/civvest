import React from 'react'
import InvestHeroImage from '../assets/refinery.jpg'
import { Link } from 'react-router-dom'

const InvestHeroSection: React.FC = () => {
  return (
    <div  className="relative w-full h-[45em] flex items-center justify-center overflow-hidden">
      <img
        className="absolute top-0 left-0 w-full h-full object-cover mt-[10em] -z-10"
        src={InvestHeroImage} alt=''
      />

       {/* Dark Blur Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-[2px] pointer-events-none -z-5"></div>

      <div className='flex flex-col relative z-30 text-start text-white items-start px-[2em] mt-[10em] lg:mt-[10em] w-full gap-[2em]'>
        <p className='flex text-[2.5em] lg:text-[4.4em]'>Invest In Civvest Energy Partners</p>
        <div className='flex bg-blue-300 h-[0.2em] w-full'></div>
        <p className='flex flex-wrap lg:max-w-[25em] text-[1.5em] font-light'>Freedom means investing on your terms. Civvest Energy Partners bond offerings are now open to investors.*</p>
        <p className='hidden flex-wrap w-[25em] text-[1.5em] font-bold lg:flex-row'>Get started with as little as $5,000</p>
        <Link to='/bond-plans'>
        <button className='flex bg-blue-300 hover:bg-gray-300 px-[2em] py-[1em] text-blue-900 font-semibold cursor-pointer'>Explore Our Bond Plans</button></Link>
        <p className='text-gray-400 lg:mt-0 mt-[-1em]'>Please read the Disclosures listed at the bottom of this page.</p>
      </div>
    </div>
  )
}

export default InvestHeroSection