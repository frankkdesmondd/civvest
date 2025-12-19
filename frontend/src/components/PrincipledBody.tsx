import React from 'react'
import { BiSolidDownArrow } from "react-icons/bi";
import { HomeUtils } from '../utils/HomeUtils';

const PrincipledBody: React.FC = () => {
  return (
    <div className="relative flex flex-col z-20 mt-[-10em] lg:mt-[-14em] px-[4em] items-center mb-[212em] lg:mb-[110em]">
      
      <div className="absolute bg-white w-[90%] flex flex-col justify-center items-center py-[3.6em] left-1/2 -translate-x-1/2 rounded-lg px-[5em] gap-[0.6em] lg:gap-[1.4em] shadow-xl">
        <p className='text-[1.55em] text-[#244772]'>The fundamental</p>
        <p className='text-[2.2em] lg:text-5xl font-serif text-[#244772]'>Principles of Investment</p>
        <div className='flex flex-col gap-[4em] lg:gap-[2.5em] items-start justify-between mt-[3em]'>
          <div className='flex flex-col lg:flex-row gap-[2em] lg:gap-[4em]'>
            <div className='flex flex-col gap-[1em] items-center'>
              <div className='flex border-2 border-gray-500 rounded-[60%] overflow-hidden w-[12em] h-[12em]'>
                <img src={HomeUtils[0].educationImage} alt="" className=''/>
              </div>
              <BiSolidDownArrow className='text-gray-500 text-[2.7em] hidden lg:flex'/>
            </div>
            <div className='flex flex-col text-[#244772] gap-[1em]'>
              <div className='flex flex-col gap-[0.18em]'>
                <p className='font-serif text-[2.4em] mb-0'>Education</p>
                <p className='text-[1.2em] lg:text-[1.5em]'>Staying on top of our game</p>
              </div>
              <div className='w-full h-[0.06em] bg-gray-400'></div>
              <p className=''>The Civvest Energy Partners team firmly believes continuous education for ourselves and our partners is imperative in this ever-growing industry. We will provide you with credible resources to help you best understand the many beautiful facets of the industry</p>
            </div>
          </div> 
          <div className='flex flex-col lg:flex-row gap-[2em] lg:gap-[4em]'>
            <div className='flex flex-col gap-[1em] items-center'>
              <div className='flex border-2 border-gray-500 rounded-[60%] overflow-hidden w-[12em] h-[12em]'>
                <img src={HomeUtils[0].mastComm} alt="" className=''/>
              </div>
              <BiSolidDownArrow className='text-gray-500 text-[2.7em] hidden lg:flex'/>
            </div>
            <div className='flex flex-col text-[#244772] gap-[1em]'>
              <div className='flex flex-col gap-[0.18em]'>
                <p className='font-serif text-[2.4em] mb-0'>Communication</p>
                <p className='text-[1.2em] lg:text-[1.5em]'>Always keeping our clients in the loop</p>
              </div>
              <div className='w-full h-[0.06em] bg-gray-400'></div>
              <p className=''>At Civvest Energy Partners, each partner is guaranteed to receive a level of service that is unmatched. It is vital for the health of our business that you are NEVER left in the dark</p>
            </div>
          </div> 
          <div className='flex flex-col lg:flex-row gap-[2em] lg:gap-[4em]'>
            <div className='flex flex-col gap-[1em] items-center'>
              <div className='flex border-2 border-gray-500 rounded-[60%] overflow-hidden w-[12em] h-[12em]'>
                <img src={HomeUtils[0].partnership} alt="" className=''/>
              </div>
              <BiSolidDownArrow className='text-gray-500 text-[2.7em] hidden lg:flex'/>
            </div>
            <div className='flex flex-col text-[#244772] gap-[1em]'>
              <div className='flex flex-col gap-[0.18em]'>
                <p className='font-serif text-[2.4em] mb-0'>Partnerships</p>
                <p className='text-[1.2em] lg:text-[1.5em]'>Developing and growing relationships</p>
              </div>
              <div className='w-full h-[0.06em] bg-gray-400'></div>
              <p className=''> Civvest Energy Partners has developed key relationships with industry partners and vendors. This has allowed us to keep costs low while still packaging exceptional programs together</p>
            </div>
          </div> 
          <div className='flex flex-col lg:flex-row gap-[2em] lg:gap-[4em]'>
            <div className='flex flex-col gap-[1em] items-center'>
              <div className='flex border-2 border-gray-500 rounded-[60%] overflow-hidden w-[12em] h-[12em]'>
                <img src={HomeUtils[0].researchImage} alt="" className=''/>
              </div>
              <BiSolidDownArrow className='text-gray-500 text-[2.7em] hidden lg:flex'/>
            </div>
            <div className='flex flex-col text-[#244772] gap-[1em]'>
              <div className='flex flex-col gap-[0.18em]'>
                <p className='font-serif text-[2.4em] mb-0'>Research</p>
                <p className='text-[1.2em] lg:text-[1.5em]'> Examining our prospects thoroughly</p>
              </div>
              <div className='w-full h-[0.06em] bg-gray-400'></div>
              <p className=''>We go to great lengths to ensure the quality and profitability of our programs. We want our partners comfortable knowing that our prospects have been thoroughly vetted by a team of industry experts</p>
            </div>
          </div> 
          <div className='flex flex-col lg:flex-row gap-[2em] lg:gap-[4em]'>
            <div className='flex flex-col gap-[1em] items-center'>
              <div className='flex border-2 border-gray-500 rounded-[60%] overflow-hidden w-[12em] h-[12em]'>
                <img src={HomeUtils[0].organicGrowth} alt="" className=''/>
              </div>
              <BiSolidDownArrow className='text-gray-500 text-[2.7em] hidden lg:flex'/>
            </div>
            <div className='flex flex-col text-[#244772] gap-[1em]'>
              <div className='flex flex-col gap-[0.18em]'>
                <p className='font-serif text-[2.4em] mb-0'>Organic Growth</p>
                <p className='text-[1.2em] lg:text-[1.5em]'>Creating positive investor experiences</p>
              </div>
              <div className='w-full h-[0.06em] bg-gray-400'></div>
              <p className=''> To keep costs lower than competitors, Civvest Energy Partners relies on your partnership to grow our company. We know the success of our projects and our superb service will lead our partners to share our investment strategy with their close friends and business associates.</p>
            </div>
          </div> 
        </div>
      </div>
    </div>
  )
}

export default PrincipledBody