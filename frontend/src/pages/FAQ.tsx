import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useSEO } from "../hooks/useSEO";
import Education from '../assets/faq-page-img.jpg'
import { FiPlus, FiMinus } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import AOS from "aos";
import "aos/dist/aos.css";

const FAQ: React.FC = () => {
  useSEO({
    title: "FAQ",
    description: "Latest questions asked about this company and quick answers to fix them.",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest-main.jpg", 
    url: "https://www.civvest.com/faq",
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
          "name": "FAQ",
          "item": "https://www.civvest.com/faq"
        }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    return () => {
      breadcrumbScript.remove();
    };
  }, []);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

  const questions = [
    {
      q: "What is Civvest?",
      a: "Civvest is an oil-focused investment company that connects investors with trusted oil production partners. We provide structured investment plans with daily interest returns for individuals looking to grow their capital through the energy sector.",
    },
    {
      q: "Where is Civvest located?",
      a: "Our office is located at: Dallas Texas.",
    },
    {
      q: "How does Civvest’s investment process work?",
      a: "Investing with Civvest is simple: 1. Register an account on our platform. 2. Choose an investment plan that fits your financial goals. 3. Contact our 24/7 customer support team for guidance on getting started.4. Your investment begins earning daily interest based on the plan selected.",
    },
    {
      q: "What types of investment plans does Civvest offer?",
      a: "We offer multiple investment plans, each with its own daily interest rate. Investors can choose the plan that best matches their risk tolerance and expected returns.",
    },
    {
      q: "How do investors earn profits?",
      a: "Profits are earned through daily interest generated from the investment plan you select. The interest amount varies depending on the specific plan.",
    },
    {
      q: "Do I need experience in oil investment to join?",
      a: "No experience is required. Civvest’s team and oil-production partners handle the technical aspects, while you enjoy the returns from your investment.",
    },
    {
      q: "Is customer support available?",
      a: "Yes. Civvest offers 24-hour active customer support. Investors can message support at any time for assistance with registration, funding, withdrawals, or plan selection.",
    },
    {
      q: "How do I get started as a new investor?",
      a: "Simply create an account on our website, pick an investment plan, and then reach out to our support team for onboarding instructions.",
    },
    {
      q: "Are there any requirements to open an account?",
      a: "All new investors only need to: 1. Register an account 2. Provide accurate personal information 3. Select a preferred investment plan 4. Contact support to activate their investment",
    },
    {
      q: "How can I withdraw my profits?",
      a: "Withdrawal requests can be made through the investor dashboard. Support is available 24/7 to guide you through the process.",
    },
    {
      q: "Can I upgrade or change my investment plan later?",
      a: " Yes. Investors can upgrade or switch plans by contacting our support team for approval and guidance",
    },
  ];

  return (
    <div className='relative w-full min-h-screen bg-[rgb(4,26,53)] overflow-x-hidden'>

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
      
      <Navbar/>
      <div className="relative w-full h-[60vh] lg:h-[120vh]" data-aos="fade-up">
        <img
          src={Education}
          alt="FAQ Image"
          className="w-full h-full object-cover"
        />

        {/* Dark Blur Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-[2px] pointer-events-none z-10"></div>
        <div className="flex flex-col absolute top-[5em] lg:top-[3.5em] left-10 mt-[10em] lg:mt-[18.7em] align-start z-20 ">
          <p className="text-[3em] lg:text-[5em] text-white text-start font-serif font-semibold">
            FAQs
          </p>
          <Link to="/contact-us">
            <div className='flex gap-4 cursor-pointer bg-blue-300 px-[2em] py-[0.7em] text-[1.3em] rounded-[0.3em] hover:bg-blue-500 items-center hover:text-white'>
              <button className="flex cursor-pointer">
                  Contact Us
              </button>
              <FaArrowRight className='text-[1em]'/>
            </div>
          </Link>
        </div>
      </div>

      {/* ================================
            FAQ ACCORDION SECTION
      ================================= */}
      <div className="w-full bg-white py-16 px-6 md:px-20 lg:px-40" data-aos="fade-up">
        
        <p className="text-gray-700 text-xl font-semibold">GET THE ANSWERS YOU NEED</p>
        <p className="text-[2em] font-bold text-[#041a35] mt-2">
          Civvest – Frequently Asked Questions (FAQ)
        </p>

        <div className="mt-10 space-y-4">
          {questions.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              
              {/* Question Row */}
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFAQ(index)}>
                <p className="text-lg font-semibold text-gray-800">{item.q}</p>

                <div className="text-2xl text-[#041a35]">
                  {openIndex === index ? <FiMinus /> : <FiPlus />}
                </div>
              </div>

              {/* Answer */}
              {openIndex === index && (
                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.a.replace(/(\d\.)/g, '\n$1')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer/>
      <Foot/>
    </div>
  )
}

export default FAQ


