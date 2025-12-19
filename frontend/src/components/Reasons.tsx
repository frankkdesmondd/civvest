import React from 'react'

interface ReasonsProps {
  scrollToForm?: () => void;
}

const Reasons: React.FC<ReasonsProps> = ({ scrollToForm }) => {
  return (
    <div className="relative bg-white flex flex-col justify-center items-center py-8 sm:py-10 md:py-12 lg:py-14 xl:py-[3.6em] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[4em] gap-4 sm:gap-6 md:gap-8 lg:gap-[1.4em] w-full">
      
      {/* Header Section */}
      <div className="text-center w-full max-w-7xl">
        <p className='text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-[#244772] mb-2 sm:mb-3'>
          Reasons To Invest In Oil And Gas
        </p>
        <p className='text-lg sm:text-xl md:text-2xl lg:text-[1.55em] font-serif text-[#244772] px-2 sm:px-4'>
          Here are just a few of the reasons to invest in oil and gas wells
        </p>
      </div>

      {/* Reasons Grid */}
      <div className='flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-[2em] items-start justify-between mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-[3em] w-full max-w-7xl'>
        
        {/* Left Column */}
        <div className='flex flex-col w-full lg:w-[48%] xl:w-[30em] gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-[5em]'>
          
          {/* Portfolio Focus */}
          <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
            <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
              Portfolio Focus
            </p>
            <div className='flex w-full h-[0.03em] bg-gray-300'></div>
            <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
              Wells in primary production
            </p>
          </div>

          {/* Cash Flow */}
          <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
            <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
              Cash Flow Paid Monthly & Annually
            </p>
            <div className='flex w-full h-[0.03em] bg-gray-300'></div>
            <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
              Receive monthly & annual cash flow (mailbox money) for reserve life of wells
            </p>
          </div>

          {/* Distributed Cash Flow */}
          <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
            <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
              Monthly & Annually Distributed Cash Flow
            </p>
            <div className='flex w-full h-[0.03em] bg-gray-300'></div>
            <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
              All wells are producing and cash flow projections are based on check stub verification, no drilling risk or guess work
            </p>
          </div>

          {/* Additional Cash Flow */}
          <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
            <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
              Additional Cash Flow Growth Potential
            </p>
            <div className='flex w-full h-[0.03em] bg-gray-300'></div>
            <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
              No cost to royalty owner
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className='flex flex-col w-full lg:w-[48%] xl:w-[30em] gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-[6.5em] mt-8 sm:mt-10 md:mt-12 lg:mt-0'>
          
          {/* No Cash Calls */}
          <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
            <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
              No Cash Calls
            </p>
            <div className='flex w-full h-[0.03em] bg-gray-300'></div>
            <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
              No cash calls on future development
            </p>
          </div>

          {/* Long Reserve Life */}
          <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
            <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
              Long Reserve Life
            </p>
            <div className='flex w-full h-[0.03em] bg-gray-300'></div>
            <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
              Typical reserve life is 40+ years
            </p>
          </div>

          {/* No Environmental Liability */}
          <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
            <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
              No Environmental Liability
            </p>
            <div className='flex w-full h-[0.03em] bg-gray-300'></div>
            <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
              Avoids direct environmental liabilities, leaving those responsibilities to the operators
            </p>
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <button 
        onClick={scrollToForm} 
        className="px-4 sm:px-6 md:px-[1.4em] lg:px-[2em] py-3 sm:py-4 md:py-[0.8em] lg:py-[0.6em] bg-white border-2 border-[#244772] text-[#244772] hover:bg-[#244772] hover:text-white rounded-lg shadow-lg md:shadow-xl cursor-pointer font-semibold text-base sm:text-lg md:text-[1.1em] lg:text-[1.3em] w-full sm:w-auto sm:min-w-[17em] transition-colors duration-300 ease-in-out mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-[3em] text-center"
      >
        Contact Us to Invest Today
      </button>
    </div>
  )
}

export default Reasons