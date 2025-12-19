import React from 'react'

interface AdditionalOilProps {
  scrollToForm?: () => void;
}

const AdditionalOil: React.FC<AdditionalOilProps> = ({ scrollToForm }) => {
  return (
    <div className='flex flex-col bg-[#041a35] px-[2em] lg:px-[4em] mb-[5em] pb-[6em] pt-[6em]'>
      <p className='flex self-center text-5xl text-white mb-[0.4em]'>Additional Oil Investment Benefits</p>
      <p className='flex self-center text-[1.3em] lg:text-[1.2em] font-serif text-white'>Read below for additional oil and gas well ownership benefits</p>
      <div className="relative z-20 flex flex-col lg:flex-row gap-[3em] lg:gap-[2em] mt-[4em]">

        {/* BLOCK 1 */}
        <div className="flex gap-[1.5em] items-start">
          <div className="h-full min-h-[10em] bg-white w-[0.05em]" />
          <div className="flex flex-col w-full max-w-none lg:max-w-[21em] gap-4">
            <h1 className="text-white font-serif text-[1.8em] sm:text-[2em] leading-tight">
              Mitigated Risk
            </h1>
            <p className="text-white text-base sm:text-lg">
               By developing proven areas with highly reputable companies and employing state of-the-art drilling technologies,oil and gas risk is minimized.
            </p>
          </div>
        </div>

        {/* BLOCK 2 */}
        <div className="flex gap-[1.5em] items-start">
          <div className="h-full min-h-[10em] bg-white w-[0.05em]" />
          <div className="flex flex-col w-full max-w-none lg:max-w-[21em] gap-4">
            <h1 className="text-white font-serif text-[1.8em] sm:text-[2em] leading-tight">
              Low Oil Prices
            </h1>
            <p className="text-white text-base sm:text-lg">
               Pricing is back on the rise! Well development costs have decreased significantly over the past two years. Lower well costs and the Civvest Energy Partners approach have created a rare opportunity that has not been available in almost 10 years
            </p>
          </div>
        </div>

        {/* BLOCK 3 */}
        <div className="flex gap-[1.5em] items-start">
          <div className="h-full min-h-[10em] bg-white w-[0.03em]" />
          <div className="flex flex-col w-full max-w-none lg:max-w-[21em] gap-4">
            <h1 className="text-white font-serif text-[1.8em] sm:text-[2em] leading-tight">
              Simple Process
            </h1>
            <p className="text-white text-base sm:text-lg">
               The API Resources team will carefully walk you throughout the entire process, from ownership assignments to revenue distributions. We’re with you every step of the way so that you can have confidence and peace of mind.
            </p>
          </div>
        </div>

      </div>
      <button onClick={scrollToForm} className="outline-none border border-white bg-inherit rounded-xl px-6 py-3 text-base sm:text-lg cursor-pointer hover:bg-white hover:text-[#244772] hover:border-white font-semibold text-white w-[15em] self-center mt-[4em]">
        Contact Us To Invest Today
      </button>
    </div>
  )
}

export default AdditionalOil