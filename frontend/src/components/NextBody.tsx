import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import ScrollingBanner from './ScrollingBanner';
import BondImage from '../assets/main bonding.jpg'
import AOS from "aos";
import "aos/dist/aos.css";

const NextBody: React.FC = () => {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div className="relative bg-[#041a35] pb-[9em]">
      
      {/* FADE FROM HEROSECTION INTO NEXTBODY - Moved outside centered container */}
      <div className="absolute top-[-14em] left-0 w-full h-[14em] bg-linear-to-b from-transparent via-[#041a35]/99 to-[#041a35] pointer-events-none z-10"></div>

      {/* Centered container wrapper */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-[2em] w-full relative z-20">
        
        {/* MAIN BLOCKS */}
        <div className="flex flex-col lg:flex-row gap-[3em] lg:gap-[2em] mt-[6em]">

          {/* BLOCK 1 */}
          <div className="flex gap-[1.5em]">
            <div className="flex flex-col">
              <div className="bg-white w-[0.05em] grow min-h-[1em]"></div>
            </div>
            <div className="flex flex-col w-full max-w-none lg:max-w-[21em] gap-4">
              <h1 className="text-white font-serif text-[1.8em] sm:text-[2em] leading-tight">
                Monthly and annual cash flow
              </h1>
              <p className="text-white text-base sm:text-lg">
                With strong ROI potential and exclusive access to vetted energy assets,
                Civvest Energy Partners helps accredited investors capitalize on the oil and gas sector.
                Reach out to our support team for a complimentary consultation and investment
                prospectus.
              </p>
            </div>
          </div>

          {/* BLOCK 2 */}
          <div className="flex gap-[1.5em]">
            <div className="flex flex-col">
              <div className="bg-white w-[0.05em] grow min-h-[1em]"></div>
            </div>
            <div className="flex flex-col w-full max-w-none lg:max-w-[21em] gap-4">
              <h1 className="text-white font-serif text-[1.8em] sm:text-[2em] leading-tight">
                Increased Value Through Reduced Costs
              </h1>
              <p className="text-white text-base sm:text-lg">
                By eliminating unnecessary costs beyond that of the well,
                Civvest Energy Partners gives the investor one of the strongest ownership
                percentage values in the industry.
              </p>
            </div>
          </div>

          {/* BLOCK 3 */}
          <div className="flex gap-[1.5em]">
            <div className="flex flex-col">
              <div className="bg-white w-[0.03em] grow min-h-[1em]"></div>
            </div>
            <div className="flex flex-col w-full max-w-none lg:max-w-[21em] gap-4">
              <h1 className="text-white font-serif text-[1.8em] sm:text-[2em] leading-tight">
                Unmatched Communication & Expertise
              </h1>
              <p className="text-white text-base sm:text-lg">
                With a team of industry experts, Civvest Energy Partners carefully selects programs
                with minimal risk and the highest income potential. Our team takes tremendous pride in
                keeping investors updated at all times.
              </p>
            </div>
          </div>

        </div>

        <ScrollingBanner/>

        <div className='flex flex-col items-center self-center mt-[3em] lg:mt-[5em]' data-aos="fade-up">
          <img src={BondImage} alt="" className='w-[26em]'/>
          <div className='flex flex-col gap-[2em] items-center mt-[2em]'>
            <p className='text-white flex font-serif'>OPEN TO ACCREDITED INVESTORS ONLY</p>
            <p className='flex text-white font-semibold'>Standard Bond Offering</p>
            <Link to='/bond-plans'>
              <button className='flex text-black bg-[#e7f2ff] px-[2em] py-[0.8em] cursor-pointer hover:bg-blue-800 hover:text-white'>
                Find Out More And Invest
              </button>
            </Link>
          </div>
        </div>

        {/* LOWER SECTION */}
        <div className="flex flex-col mt-[4em] lg:mt-[2em] text-white items-center gap-[1em] px-4 text-center">
          <p className="font-serif text-[2em] sm:text-[2.7em] md:text-[3.2em] lg:text-[3.4em] leading-tight">
            Finally, a company that puts the investor first.
          </p>

          <p className="text-base sm:text-[1em] max-w-full">
            Civvest Energy Partners, we are structured to ensure that the investor always
            comes first. By keeping business expenses low without compromising the integrity
            and quality of the prospect, Guardian Energy Partners gives partners the
            opportunity to achieve a fruitful energy portfolio for many years to come.
          </p>

          <p className="text-base sm:text-[1em] max-w-full">
            Civvest Energy Partners selects and offers direct ownership in oil and gas wells in
            proven areas to ensure a maximum return for each of our partners.
          </p>

          <Link to="/learn-about">
            <button className="text-gray-300 border border-gray-400 rounded-[0.8em] px-[2em] py-[0.6em] text-[1.1em] sm:text-[1.3em] font-semibold mt-[1em] cursor-pointer hover:bg-white hover:text-[#041a35] transition">
              Learn about the benefits of investing
            </button>
          </Link>
        </div>

      </div> {/* End of centered container */}
    </div>
  );
};

export default NextBody;
