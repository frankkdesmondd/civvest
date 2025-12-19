import React, {useEffect} from 'react'
import { Link } from 'react-router-dom';
import AOS from "aos";
import "aos/dist/aos.css";

const WhyOil: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div className="relative flex flex-col px-4 sm:px-[2em] h-[95em] lg:h-[120em] lg:px-[3em] bg-[#041a35] pb-[5em]">

      {/* FADE FROM HEROSECTION INTO NEXTBODY */}
      <div className="absolute top-[-8em] left-0 w-full h-[14em] bg-linear-to-b from-transparent via-[#041a35]/95 to-[#041a35] pointer-events-none z-10"></div>

      {/* MAIN BLOCKS */}
      <div className="relative px-[2em] lg:px-0 z-20 flex flex-col lg:flex-row gap-[3em] lg:gap-[2em] mt-[6em]">

        {/* BLOCK 1 */}
        <div className="flex gap-[1.5em] items-start">
          <div className="h-full min-h-[10em] bg-white w-[0.05em]" />
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
        <div className="flex gap-[1.5em] items-start">
          <div className="h-full min-h-[10em] bg-white w-[0.05em]" />
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
        <div className="flex gap-[1.5em] items-start">
          <div className="h-full min-h-[10em] bg-white w-[0.03em]" />
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

    </div>
  )
}

export default WhyOil