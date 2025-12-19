import React from 'react'

const Downbody: React.FC = () => {
  return (
    <div className="relative z-10 mt-[-5em] md:mt-[-24em] lg:mt-[-25em] px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 items-center mb-16 sm:mb-24 md:mb-32 lg:mb-[55em]">
      
      <div className="relative lg:absolute bg-white w-full lg:w-[90%] xl:w-[88%] flex flex-col justify-center items-center py-6 sm:py-8 md:py-12 lg:py-14 xl:py-[3.6em] left-1/2 -translate-x-1/2 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[5em] gap-4 sm:gap-6 md:gap-8 lg:gap-[1.4em] shadow-lg md:shadow-xl">
        
        {/* Header Section */}
        <div className="text-center w-full">
          <p className='text-lg sm:text-xl md:text-2xl lg:text-[1.55em] text-[#244772] mb-2 sm:mb-3'>
            Learn about oil and gas investment
          </p>
          <p className='text-3xl sm:text-4xl md:text-5xl font-serif text-[#244772]'>
            Benefits
          </p>
        </div>

        {/* Benefits Grid */}
        <div className='flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-[2em] items-start justify-between mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-[3em] w-full'>
          
          {/* Left Column */}
          <div className='flex flex-col w-full lg:w-[48%] xl:w-[30em] gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-[5em]'>
            <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
              <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                Monthly and annual cash flow
              </p>
              <div className='flex w-full h-[0.03em] bg-gray-300'></div>
              <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                Free time is an extremely valuable commodity to accredited investors. Oil and gas
                investing gives you the opportunity to achieve significant monthly & annual
                income, while allowing you to maintain focus on your own businesses.
              </p>
            </div>
            
            <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
              <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                Simple process
              </p>
              <div className='flex w-full h-[0.03em] bg-gray-300'></div>
              <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                The Civvest Energy Partners team will carefully walk you through the entire
                process, from ownership assignments to revenue distributions, We’re with you
                every step of the way so that you can have confidence and peace of mind.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className='flex flex-col w-full lg:w-[48%] xl:w-[30em] gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-[6.5em]'>
            <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
              <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                Diversified Portfolio
              </p>
              <div className='flex w-full h-[0.03em] bg-gray-300'></div>
              <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                Are all of your eggs in one basket? Take advantage of the benefits that oil and gas commodities provide and help your portfolio to flourish.
              </p>
            </div>
            
            <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
              <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                Mitigated Risk
              </p>
              <div className='flex w-full h-[0.03em] bg-gray-300'></div>
              <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                By developing proven areas with highly reputable companies and employing state-of-the-art drilling technologies, oil and gas risk is minimized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Downbody

