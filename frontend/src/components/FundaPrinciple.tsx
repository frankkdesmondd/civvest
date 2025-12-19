import React from 'react'

interface FundaPrincipleProps {
  scrollToForm?: () => void;
}

const FundaPrinciple: React.FC<FundaPrincipleProps> = ({ scrollToForm }) => {
  return (
    <div className="relative z-10 mt-16 sm:mt-20 md:mt-24 lg:mt-[-15em] px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 items-center mb-16 sm:mb-20 md:mb-24 lg:mb-[85em]">

      {/* FADE FROM HEROSECTION INTO NEXTBODY */}
      <div className="absolute top-[-8em] sm:top-[-12em] md:top-[-16em] lg:top-[-21em] left-0 w-full h-[8em] sm:h-[12em] md:h-[16em] lg:h-[17em] bg-linear-to-b from-transparent via-[#041a35]/95 to-[#041a35] pointer-events-none z-20"></div>
      
      <div className="relative lg:absolute bg-white w-full lg:w-[90%] xl:w-[88%] flex flex-col justify-center items-center py-6 sm:py-8 md:py-12 lg:py-14 xl:py-[3.6em] left-1/2 -translate-x-1/2 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[5em] gap-4 sm:gap-6 md:gap-8 lg:gap-[1.4em] shadow-lg md:shadow-xl">
        
        {/* Header Section */}
        <div className="text-center w-full">
          <p className='text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-[#244772] mb-2 sm:mb-3'>
            The Fundamental Principles
          </p>
          <p className='text-lg sm:text-xl md:text-2xl lg:text-[1.55em] font-serif text-[#244772]'>
            of investing with Civvest Energy Partners
          </p>
        </div>

        {/* Principles Grid */}
        <div className='flex flex-col w-full'>
          <div className='flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-[2em] items-start justify-between mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-[3em]'>
            
            {/* Left Column */}
            <div className='flex flex-col w-full lg:w-[48%] xl:w-[30em] gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-[5em]'>
              {/* Education Section */}
              <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
                <div className='flex flex-col'>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Education:
                  </p>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Staying on Top of Our Game
                  </p>
                </div>
                <div className='flex w-full h-[0.03em] bg-gray-300'></div>
                <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                  The Civvest Energy Partners team firmly believes continuous education for ourselves and our partners is imperative in this ever-growing industry. We will provide you with credible resources to help you best understand the many beautiful facets of the industry.
                </p>
              </div>
              
              {/* Partnerships Section */}
              <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
                <div className='flex flex-col'>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Partnerships:
                  </p>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Developing and Growing Relationships
                  </p>
                </div>
                <div className='flex w-full h-[0.03em] bg-gray-300'></div>
                <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                  Civvest Energy Partners has developed key relationships with industry partners and vendors. This has allowed us to keep costs low while still packaging exceptional programs together.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className='flex flex-col w-full lg:w-[48%] xl:w-[30em] gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-[6.5em]'>
              {/* Communication Section */}
              <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
                <div className='flex flex-col'>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Communication:
                  </p>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Always Keeping Our Clients in the Loop
                  </p>
                </div>
                <div className='flex w-full h-[0.03em] bg-gray-300'></div>
                <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                  A Civvest Energy Partners partner is guaranteed to receive a level of service that is unmatched. It is vital for the health of our business that you are NEVER left in the dark.
                </p>
              </div>
              
              {/* Research Section */}
              <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
                <div className='flex flex-col'>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Research:
                  </p>
                  <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                    Examining Our Prospects Thoroughly
                  </p>
                </div>
                <div className='flex w-full h-[0.03em] bg-gray-300'></div>
                <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                  We go to great lengths to ensure the quality and profitability of our programs. We want our partners comfortable knowing that our prospects have been thoroughly vetted by a team of industry experts.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Growth & Button */}
          <div className='flex flex-col mt-8 sm:mt-10 md:mt-12 lg:mt-16 xl:mt-[4em] gap-6 sm:gap-8'>
            <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
              <div className='flex flex-col'>
                <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                  Growth:
                </p>
                <p className='text-xl sm:text-2xl md:text-[1.7em] font-serif text-[#244772]'>
                  Creating Positive Investor Experience
                </p>
              </div>
              <div className='flex w-full h-[0.03em] bg-gray-300'></div>
              <p className='text-[#244772] text-base sm:text-lg md:text-xl leading-relaxed'>
                To keep costs lower than competitors, we rely on your partnership to grow our company. We know the success of our projects and our superb service will lead our partners to share the Civvest Energy Partners oil investment strategy with their close friends and business associates.
              </p>
            </div>
            
            {/* Contact Button */}
            <button 
              onClick={scrollToForm} 
              className="px-4 sm:px-6 md:px-[1.4em] lg:px-[2em] py-3 sm:py-4 md:py-[0.8em] lg:py-[0.6em] bg-white border-2 border-[#244772] text-[#244772] hover:bg-[#244772] hover:text-white rounded-lg shadow-lg md:shadow-xl cursor-pointer font-semibold text-base sm:text-lg md:text-[1.1em] lg:text-[1.3em] w-full sm:w-auto sm:min-w-[17em] transition-colors duration-300 ease-in-out self-center text-center"
            >
              Contact Us to Invest Today
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FundaPrinciple