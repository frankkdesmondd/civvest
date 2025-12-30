import React, {useEffect} from 'react'
import Navbar from '../components/Navbar'
import PrincipalApproach from '../assets/principal-approach-page-img.jpg'
import Footer from '../components/Footer'
import Foot from '../components/Foot'
import { usePageTitle } from "../hooks/usePageTitle";
import PrincipledBody from '../components/PrincipledBody'
import SecondBody from '../components/SecondBody'
import AOS from "aos";
import "aos/dist/aos.css";

const PrincipledApproach: React.FC = () => {
  usePageTitle("Principled Approach")

  useEffect(() => {
    AOS.init({
      duration: 1000,     // animation duration
      easing: "ease-in-out",
      once: true,         // animation runs once
      offset: 100,        // trigger distance
    });

    // Refresh AOS when DOM changes
    AOS.refresh();
  }, []);
  
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <Navbar/>
      {/* h-[calc(100vw-55vw)] */}
      {/* h-[70vh] */}

      {/* Hero Section */}
      <div className="relative w-full h-[59vh] md:h-[40vh] lg:h-[40vw] min-[1034px]:h-[70vh] xl:h-[70vh]" data-aos="fade-up">
        <img
          src={PrincipalApproach}
          alt="Company View"
          className="w-full h-full object-cover object-[center_30%]"
        />

        <div className="absolute bottom-0 left-0 w-full h-45 md:h-58 lg:h-64 bg-linear-to-t from-[#041a35] via-[#041a35]/90 to-transparent"></div>

        <p className="absolute top-[33vh] md:top-[5em] lg:top-[3.5em] xl:top-[3.9em] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[3em] lg:text-[5em] text-white text-center font-serif w-[10em] md:w-[20em] lg:w-[40em] leading-[1.3em] mt-[0.8em] lg:mt-0">
          Investing Fundamentals
        </p>
      </div>

      {/* Intro Section */}
      <div className="w-full px-6 lg:px-10 py-16 text-white bg-[#041a35] h-[66em] lg:h-[45em] mt-[-2em]" data-aos="fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left */}
          <div className="flex flex-col gap-4">
            <p className="text-[1em] lg:text-[1.4em] font-semibold">Let us introduce ourselves</p>
            <p className="text-gray-300 text-[2.2em] lg:text-[2.5em] leading-[1.2em] font-serif w-[8em]">
              A few words about us
            </p>
            <div className="w-full h-px bg-white/60"></div>
            <p className="text-gray-200 leading-relaxed">
                Headquartered in Dallas, Texas, Civvest Energy Partners is committed to putting investors first. We focus on identifying low-risk opportunities with strong income potential while eliminating unnecessary costs. Our mission is simple: keep your investment as efficient as possible while maximizing your ownership stake.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4">
            <p className="text-[1em] lg:text-[1.4em] font-semibold">Focused on</p>
            <p className="text-gray-300 text-[2.2em] lg:text-[2.5em] leading-[1.2em] font-serif w-[11em]">
              U.S. based drilling prospects
            </p>
            <div className="w-full h-px bg-white/60"></div>
            <p className="text-gray-200 leading-relaxed">
              Operating across multiple regions in the United States, Civvest Energy Partners
              provides accredited investors with exclusive access to high-potential oil
              investment opportunities. Contact us today for a free consultation and investment
              prospectus (accredited investors only).
            </p>
          </div>
        </div>
      </div>
      <PrincipledBody/>
      <SecondBody/>
      <Footer/>
      <Foot/>
    </div>
  )
}

export default PrincipledApproach
