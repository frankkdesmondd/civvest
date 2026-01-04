import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useSEO } from "../hooks/useSEO";
import { useToast } from "../context/ToastContext"; 
import ContactUsImage from "../assets/contact page picture.jpg";
import Shell from "../assets/shell.jpg";
import Civittas from "../assets/civitas.jpg";
import Exxo from "../assets/exxonmobil.jpg";
import CocoPhillips from "../assets/conocophilips.jpg";
import FundaPrinciple from "../components/FundaPrinciple";
import Footer from "../components/Footer";
import Foot from "../components/Foot";
import Reasons from "../components/Reasons";
import AdditionalOil from "../components/AdditionalOil";
import LearnDown from "../components/LearnDown";
import axiosInstance from "../config/axios";
import AOS from "aos";
import "aos/dist/aos.css";

const LearnAbout: React.FC = () => {
  useSEO({
    title: "Learn About",
    description: "Learn more about this platform, and steps to invest",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest-main.jpg", 
    url: "https://www.civvest.com/learn-about",
    type: "website"
  });

  useEffect(() => {
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.civvest.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Learn About",
          "item": "https://www.civvest.com/learn-about"
        }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    return () => {
      breadcrumbScript.remove();
    };
  }, []);

  const { showToast } = useToast();

  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    accreditedInvestor: false
  });

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
  
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.accreditedInvestor) errors.accreditedInvestor = "You must confirm accredited investor status";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("Please fill in all required fields correctly", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/api/contact', {
        ...formData,
        source: 'Learn About Page - Oil & Gas Investment',
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        showToast("Thank you for your interest in oil & gas investments. We'll contact you shortly!", "success");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          accreditedInvestor: false
        });
      } else {
        showToast(response.data.error || "Failed to send message", "error");
      }
    } catch (err: any) {
      console.error("Contact form error:", err);
      showToast(err.response?.data?.error || "Failed to send message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Civvest Energy Partners",
          "url": "https://www.civvest.com",
          "logo": "https://www.civvest.com/civvest-main.jpg",
          "description": "Leading renewable energy investment platform providing sustainable energy solutions",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Dallas, Texas",
            "addressCountry": "USA"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "(192)924-81175",
            "contactType": "Customer Service"
          }
        })}
      </script>

      <Navbar />

      <div
        className="
          relative 
          flex 
          flex-col lg:flex-row 
          mt-[10em] 
          min-h-[120em] lg:min-h-[80em]
          px-[1.5em] sm:px-[2em] lg:px-[3em] 
          gap-[3em] lg:gap-[5em]
        "
        style={{
          backgroundImage: `url(${ContactUsImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* DARK BLUE OVERLAY */}
        <div className="absolute inset-0 bg-[#041a35]/70"></div>

        {/* BOTTOM BLUE FADE - Fixed height */}
        <div className="absolute bottom-0 left-0 w-full h-[10em] bg-linear-to-t from-[#041a35] to-transparent"></div>

        {/* LEFT WHITE BOX */}
        <div
          className="
            flex flex-col 
            bg-white 
            text-[#041a35] 
            px-[2em] sm:px-[3em] 
            py-[3em] sm:py-[4em] 
            z-20 
            w-full lg:w-[27em] 
            gap-[1.6em] 
            min-h-[65em] lg:min-h-[55em]
            rounded-lg
            self-start
            mt-[2em] lg:mt-0
          " data-aos='fade-up'
        >
          <p className="text-[2.2em] sm:text-[3em] md:text-[3.6em] font-serif leading-[1em]">
            Strategic Oil Investments
          </p>

          <div className="bg-gray-400 h-[0.07em]"></div>

          <p>
            Civvest Energy Partners provides accredited investors the
            opportunity to boost their portfolios and significantly lower their
            tax burden by acquiring valuable energy assets.
          </p>

          <p className="text-[1.4em] sm:text-[1.6em] md:text-[1.8em] leading-[1.3em]">
            Align yourself with some of the biggest oil operators
          </p>

          <div className="bg-gray-400 h-[0.07em]"></div>

          <div className="flex gap-[2em] flex-wrap leading-none">
            <img src={Shell} alt="" className="w-[5em]" />
            <img src={Civittas} alt="" className="w-[10em]" />
            <img src={CocoPhillips} alt="" className="w-[9em]" />
            <img src={Exxo} alt="" className="w-[6em]" />
          </div>

          <div className="bg-gray-400 h-[0.07em]"></div>

          <p className="text-sm">
            The logos and trademarks listed above are the sole property of the
            respective owners and entities listed and Civvest Energy Partners
            makes no claim to the marks.
          </p>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex flex-col text-white z-20 items-start mt-[1em] lg:mt-[4em] w-full flex-1" data-aos='fade-up'>
          <p className="text-[1.8em] lg:text-[2.8em] font-serif">
            Invest In Oil And Gas Wells
          </p>

          <p className="text-[1.1em] sm:text-[1.3em] md:text-[1.4em]">
            Fill out the form below for more on American oil investments
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-8 mt-4 w-full max-w-4xl z-10">
            <div className="flex flex-col gap-4 flex-1">
              {/* NAME */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm sm:text-base">
                  Name* (required)
                </label>
                <div className={`bg-white rounded-lg ${formErrors.name ? 'ring-2 ring-red-500' : ''}`}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full py-3 px-3 outline-none border-none text-black rounded-lg"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-red-300 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm sm:text-base">
                  Email* (required)
                </label>
                <div className={`bg-white rounded-lg ${formErrors.email ? 'ring-2 ring-red-500' : ''}`}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full py-3 px-3 outline-none border-none text-black rounded-lg"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-300 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* PHONE */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm sm:text-base">
                  Phone* (required)
                </label>
                <div className={`bg-white rounded-lg ${formErrors.phone ? 'ring-2 ring-red-500' : ''}`}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full py-3 px-3 outline-none border-none text-black rounded-lg"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-red-300 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>
            </div>

            {/* ACCREDITED INVESTOR */}
            <div className="flex flex-col gap-4 mt-0 items-start max-w-4xl w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="accreditedInvestor"
                    checked={formData.accreditedInvestor}
                    onChange={handleChange}
                    className={`w-5 h-3 ${formErrors.accreditedInvestor ? 'ring-2 ring-red-500' : ''}`}
                  />
                  <p className="text-white text-sm sm:text-base">
                    Accredited Investor status:* (required)
                  </p>
                </div>
                {formErrors.accreditedInvestor && (
                  <p className="text-red-300 text-xs ml-6">{formErrors.accreditedInvestor}</p>
                )}
                <p className="text-white text-xs sm:text-sm ml-0 lg:ml-6">
                  I certify that I had an individual income over $200,000 (or joint income with my spouse of more than $300,000) in each of the past two years and reasonably expect to reach the same level in the current year, AND/OR I have an individual net worth in excess of $1,000,000.
                </p>
              </div>
            </div>

            {/* MESSAGE */}
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-white text-sm sm:text-base">
                Leave A Message (optional):
              </label>
              <div className="bg-white rounded-lg">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full py-2 px-3 resize-none h-[10em] outline-none border-none text-black rounded-lg"
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center outline-none border border-white bg-inherit rounded-xl px-6 py-3 text-base sm:text-lg cursor-pointer hover:bg-[#244772] hover:text-white hover:border-[#244772] font-semibold text-white w-full lg:w-[15em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Contact Us To Invest Today
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <FundaPrinciple scrollToForm={scrollToForm}/>
      <Reasons scrollToForm={scrollToForm}/>
      <AdditionalOil scrollToForm={scrollToForm}/>
      
      {/* SECOND FORM SECTION (Scrolled to) */}
      <div ref={formRef} className="flex flex-col text-[#244772] z-20 mt-4 sm:mt-6 md:mt-8 lg:mt-[4em] w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 items-center">
        
        {/* Header */}
        <div className="text-center w-full max-w-7xl">
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.8em] font-serif mb-2 sm:mb-3">
            Invest In Oil And Gas Wells
          </p>
          <p className="text-base sm:text-lg md:text-xl lg:text-[1.4em] text-[#244772] px-2 sm:px-4">
            Fill out the form below for more on American oil investments
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-8 mt-4 sm:mt-6 md:mt-8 w-full max-w-7xl z-10">
          
          {/* Left Column - Input Fields */}
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1">
            
            {/* NAME */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <label className="text-[#244772] text-sm sm:text-base md:text-lg font-medium">
                Name* (required)
              </label>
              <div className={`border ${formErrors.name ? 'border-red-500 ring-2 ring-red-500' : 'border-[#244772]'} rounded-lg hover:border-[#1a3660] transition-colors duration-200`}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 outline-none border-none text-black bg-transparent placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <label className="text-[#244772] text-sm sm:text-base md:text-lg font-medium">
                Email* (required)
              </label>
              <div className={`border ${formErrors.email ? 'border-red-500 ring-2 ring-red-500' : 'border-[#244772]'} rounded-lg hover:border-[#1a3660] transition-colors duration-200`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 outline-none border-none text-black bg-transparent placeholder-gray-500"
                  placeholder="Enter your email address"
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* PHONE */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <label className="text-[#244772] text-sm sm:text-base md:text-lg font-medium">
                Phone* (required)
              </label>
              <div className={`border ${formErrors.phone ? 'border-red-500 ring-2 ring-red-500' : 'border-[#244772]'} rounded-lg hover:border-[#1a3660] transition-colors duration-200`}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 outline-none border-none text-black bg-transparent placeholder-gray-500"
                  placeholder="Enter your phone number"
                />
              </div>
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Right Column - Message */}
          <div className="flex flex-col gap-1 sm:gap-2 flex-1 mt-4 sm:mt-5 md:mt-6 lg:mt-0">
            <label className="text-[#244772] text-sm sm:text-base md:text-lg font-medium">
              Leave A Message (optional):
            </label>
            <div className="border border-[#244772] rounded-lg hover:border-[#1a3660] transition-colors duration-200 flex-1">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full py-2 sm:py-3 px-3 sm:px-4 resize-none h-[10em] sm:h-[12em] md:h-[13em] lg:h-[13em] outline-none border-none text-black bg-transparent placeholder-gray-500"
                placeholder="Type your message here..."
              ></textarea>
            </div>
          </div>

        </form>

        {/* Bottom Section - Checkbox and Button */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-6 mt-6 sm:mt-8 md:mt-10 lg:mt-[3em] justify-between w-full max-w-7xl mb-8 sm:mb-10 md:mb-12 lg:mb-[4em]">
          
          {/* ACCREDITED INVESTOR */}
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <input 
                  type="checkbox" 
                  name="accreditedInvestor"
                  checked={formData.accreditedInvestor}
                  onChange={handleChange}
                  className={`mt-1 sm:mt-0 w-4 h-4 sm:w-5 sm:h-4 cursor-pointer ${formErrors.accreditedInvestor ? 'ring-2 ring-red-500' : ''}`}
                  required
                />
                <p className="text-[#244772] text-sm sm:text-base md:text-lg font-medium flex-1">
                  Accredited Investor status:* (required)
                </p>
              </div>
              {formErrors.accreditedInvestor && (
                <p className="text-red-500 text-xs ml-6">{formErrors.accreditedInvestor}</p>
              )}
              <p className="text-[#244772] text-xs sm:text-sm md:text-base leading-relaxed pl-6 sm:pl-8 md:pl-10 lg:pl-6 xl:ml-6 w-full lg:w-[90%] xl:w-[24em] 2xl:w-[60em]">
                I certify that I had an individual income over $200,000 (or joint income with my spouse of more than $300,000) in each of the past two years and reasonably expect to reach the same level in the current year, AND/OR I have an individual net worth in excess of $1,000,000.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center outline-none border-2 border-[#244772] bg-white rounded-xl px-4 sm:px-6 md:px-6 lg:px-8 py-3 sm:py-3 md:py-3 text-sm sm:text-base md:text-lg cursor-pointer hover:bg-[#244772] hover:text-white hover:border-[#244772] font-semibold text-[#244772] w-full lg:w-[15em] h-[2.8em] sm:h-[3em] transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] mt-4 sm:mt-5 lg:mt-0 self-center lg:self-start disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-[#244772]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <p className="my-[0.002em] leading-[1em]">
                Contact Us To Invest Today
              </p>
            )}
          </button>
        </div>
      </div>
      
      <LearnDown/>
      <Footer/>
      <Foot/>
    </div>
  );
};

export default LearnAbout;


