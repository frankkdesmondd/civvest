import React from 'react';
import BackgroundVideo from '../assets/oil.mp4';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-screen object-cover -z-10"
        src={BackgroundVideo}
        autoPlay
        loop
        muted
      />

      {/* Dark Blur Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-[2px] pointer-events-none -z-5"></div>

      {/* Content */}
      <div className="flex flex-col relative z-40 text-center text-white items-center px-4 w-full mt-[1em] sm:mt-[2em] lg:mt-[4em]" data-aos="fade-up">
        <h1 className="hidden lg:flex font-serif text-[3em] sm:text-4xl lg:text-[4.5em] leading-tight mt-[1.8em]">
          Strategic
        </h1>
        <h1 className="hidden lg:flex font-serif text-[3em] sm:text-4xl lg:text-[4.5em] leading-tight">
          Oil & Gas Investing
        </h1>
        <h1 className="flex lg:hidden font-serif text-[2.7em] md:text-[3em] w-auto max-w-[16em] leading-[1.2em] px-[0.2em] mt-[2.8em]">
          Strategic Oil & Gas Investment
        </h1>

        <p className="mt-[2.4em] lg:mt-4 text-[1em] sm:text-base md:text-lg lg:text-[1.2em] w-full max-w-[52em] px-[0.7em] mb-4 sm:mb-[2em] text-center">
          Civvest Energy Partners offers accredited investors exclusive access to high
          performing oil and gas investment opportunities designed to strengthen portfolio
          diversification and long-term returns.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-[1.5em] mt-[2.4em] sm:mt-[1.6em] z-50 w-full max-w-md sm:max-w-none justify-center">
          <Link to="/signup">
            <button className="outline-none border border-white bg-inherit rounded-xl px-6 sm:px-[2em] py-3 text-[1em] sm:text-base lg:text-[1.2em] cursor-pointer hover:bg-[#244772] hover:text-white hover:border-[#244772] font-semibold w-[16em] sm:w-auto">
              Sign up
            </button>
          </Link>

          <Link to="/learn-about">
            <button className="outline-none border-2 border-transparent rounded-xl bg-white text-[#244772] px-6 sm:px-[1em] py-3 text-[1em] sm:text-base lg:text-[1.2em] cursor-pointer hover:bg-[#244772] hover:text-white hover:border-[#244772] font-semibold w-[17em] sm:w-auto z-50 relative">
              Learn About
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;


